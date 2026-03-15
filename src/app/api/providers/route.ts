export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";

import { createAuditLog, fireAndForget, requireApiUser } from "@/app/api/_utils/helpers";
import { apiError, apiSuccess } from "@/lib/api";
import { apiLimiter, getClientKey, rateLimitResponse, writeLimiter } from "@/lib/rate-limit";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { listProviders } from "@/repositories/userRepository";
import { adminProviderCreateSchema, adminProviderUpdateSchema } from "@/validators/admin";
import { providerProfileSchema } from "@/validators/profile";

export async function GET(request: NextRequest) {
  const rl = apiLimiter.check(getClientKey(request));
  if (!rl.allowed) return rateLimitResponse(rl);

  const { supabase, user, profile } = await requireApiUser();
  if (!user || !profile) {
    return apiError("Unauthorized.", 401);
  }

  // All authenticated roles can list providers (patients need it for booking)
  const { data, error } = await listProviders(supabase);

  if (error) {
    return apiError(error.message, 400);
  }

  return apiSuccess(data ?? []);
}

export async function POST(request: NextRequest) {
  const rl = writeLimiter.check(getClientKey(request));
  if (!rl.allowed) return rateLimitResponse(rl);

  const { user: actor, profile } = await requireApiUser();
  if (!profile || profile.role !== "admin") {
    return apiError("Forbidden.", 403);
  }

  const body = await request.json();
  const parsed = adminProviderCreateSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? "Invalid provider payload.");
  }

  const admin = createSupabaseAdminClient();
  const createResult = await admin.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: {
      role: "provider",
      full_name: parsed.data.full_name
    }
  });

  if (createResult.error || !createResult.data.user) {
    return apiError(createResult.error?.message ?? "Unable to create provider user.", 400);
  }

  const userId = createResult.data.user.id;

  // Upsert user row first (FK dependency), then provider row
  const userUpsert = await (admin.from("users") as any).upsert(
    {
      id: userId,
      full_name: parsed.data.full_name,
      email: parsed.data.email,
      role: "provider",
      organization_id: null,
      avatar_url: null
    },
    { onConflict: "id" }
  );

  if (userUpsert.error) {
    await admin.auth.admin.deleteUser(userId);
    return apiError(userUpsert.error.message, 400);
  }

  const providerUpsert = await (admin.from("providers") as any)
    .upsert({
      user_id: userId,
      specialty: parsed.data.specialty || null,
      license_number: parsed.data.license_number || null,
      bio: parsed.data.bio || null
    }, { onConflict: "user_id" })
    .select("*")
    .single();

  if (providerUpsert.error) {
    await (admin.from("users") as any).delete().eq("id", userId);
    await admin.auth.admin.deleteUser(userId);
    return apiError(providerUpsert.error.message, 400);
  }

  fireAndForget(
    createAuditLog("provider.created", "providers", providerUpsert.data.id, { email: parsed.data.email }, actor?.id)
  );

  return apiSuccess({ user_id: userId, provider: providerUpsert.data }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const rl = writeLimiter.check(getClientKey(request));
  if (!rl.allowed) return rateLimitResponse(rl);

  const { supabase, user, profile } = await requireApiUser();
  if (!user || !profile) {
    return apiError("Unauthorized.", 401);
  }

  const body = await request.json();
  const isAdminTargeted = profile.role === "admin" && Boolean(body.user_id);

  if (isAdminTargeted) {
    const parsed = adminProviderUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? "Invalid provider profile payload.");
    }

    const client = createSupabaseAdminClient();

    // Run both updates in parallel — they target different tables
    const [userUpdate, providerUpsert] = await Promise.all([
      (client.from("users") as any)
        .update({ full_name: parsed.data.full_name })
        .eq("id", parsed.data.user_id)
        .select("*")
        .single(),
      (client.from("providers") as any)
        .upsert({
          user_id: parsed.data.user_id,
          specialty: parsed.data.specialty || null,
          license_number: parsed.data.license_number || null,
          bio: parsed.data.bio || null
        }, { onConflict: "user_id" })
        .select("*")
        .single()
    ]);

    if (userUpdate.error) {
      return apiError(userUpdate.error.message, 400);
    }

    if (providerUpsert.error) {
      return apiError(providerUpsert.error.message, 400);
    }

    fireAndForget(
      createAuditLog("provider.updated", "providers", providerUpsert.data.id, { admin: true }, user.id)
    );

    return apiSuccess({ user: userUpdate.data, provider: providerUpsert.data });
  }

  if (profile.role !== "provider" && profile.role !== "admin") {
    return apiError("Forbidden.", 403);
  }

  const parsed = providerProfileSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? "Invalid provider profile payload.");
  }

  const client = (() => {
    try {
      return createSupabaseAdminClient();
    } catch {
      return supabase;
    }
  })();

  // Run both updates in parallel
  const userPayload: Record<string, unknown> = { full_name: parsed.data.full_name };
  if (parsed.data.avatar_url !== undefined) {
    userPayload.avatar_url = parsed.data.avatar_url || null;
  }

  const [userUpdate, providerUpsert] = await Promise.all([
    (client.from("users") as any)
      .update(userPayload)
      .eq("id", user.id)
      .select("*")
      .single(),
    (client.from("providers") as any)
      .upsert({
        user_id: user.id,
        specialty: parsed.data.specialty || null,
        license_number: parsed.data.license_number || null,
        bio: parsed.data.bio || null
      }, { onConflict: "user_id" })
      .select("*")
      .single()
  ]);

  if (userUpdate.error) {
    return apiError(userUpdate.error.message, 400);
  }

  if (providerUpsert.error) {
    return apiError(providerUpsert.error.message, 400);
  }

  fireAndForget(
    createAuditLog("provider.updated", "providers", providerUpsert.data.id, {}, user.id)
  );

  return apiSuccess({
    user: userUpdate.data,
    provider: providerUpsert.data
  });
}

export async function DELETE(request: NextRequest) {
  const rl = writeLimiter.check(getClientKey(request));
  if (!rl.allowed) return rateLimitResponse(rl);

  const { user: actor, profile } = await requireApiUser();
  if (!profile || profile.role !== "admin") {
    return apiError("Forbidden.", 403);
  }

  const body = await request.json();
  if (!body.user_id) {
    return apiError("User id is required.");
  }

  const admin = createSupabaseAdminClient();
  const result = await admin.auth.admin.deleteUser(String(body.user_id));
  if (result.error) {
    return apiError(result.error.message, 400);
  }

  fireAndForget(
    createAuditLog("provider.deleted", "providers", null, { user_id: body.user_id }, actor?.id)
  );

  return apiSuccess({ user_id: body.user_id });
}
