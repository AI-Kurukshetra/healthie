export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";

import { requireApiUser } from "@/app/api/_utils/helpers";
import { apiError, apiSuccess } from "@/lib/api";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { listProviders } from "@/repositories/userRepository";
import { adminProviderCreateSchema, adminProviderUpdateSchema } from "@/validators/admin";
import { providerProfileSchema } from "@/validators/profile";

export async function GET() {
  const { supabase, user } = await requireApiUser();
  if (!user) {
    return apiError("Unauthorized.", 401);
  }

  const { data, error } = await listProviders(supabase);

  if (error) {
    return apiError(error.message, 400);
  }

  return apiSuccess(data ?? []);
}

export async function POST(request: NextRequest) {
  const { profile } = await requireApiUser();
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

  await (admin.from("users") as any)
    .update({ full_name: parsed.data.full_name, email: parsed.data.email, role: "provider" })
    .eq("id", userId);

  const providerUpdate = await (admin.from("providers") as any)
    .update({
      specialty: parsed.data.specialty || null,
      license_number: parsed.data.license_number || null,
      bio: parsed.data.bio || null
    })
    .eq("user_id", userId)
    .select("*")
    .single();

  if (providerUpdate.error) {
    return apiError(providerUpdate.error.message, 400);
  }

  return apiSuccess({ user_id: userId, provider: providerUpdate.data }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
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
    const userUpdate = await (client.from("users") as any)
      .update({ full_name: parsed.data.full_name })
      .eq("id", parsed.data.user_id)
      .select("*")
      .single();

    if (userUpdate.error) {
      return apiError(userUpdate.error.message, 400);
    }

    const providerUpdate = await (client.from("providers") as any)
      .update({
        specialty: parsed.data.specialty || null,
        license_number: parsed.data.license_number || null,
        bio: parsed.data.bio || null
      })
      .eq("user_id", parsed.data.user_id)
      .select("*")
      .single();

    if (providerUpdate.error) {
      return apiError(providerUpdate.error.message, 400);
    }

    return apiSuccess({ user: userUpdate.data, provider: providerUpdate.data });
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

  const userUpdate = await (client.from("users") as any)
    .update({ full_name: parsed.data.full_name })
    .eq("id", user.id)
    .select("*")
    .single();

  if (userUpdate.error) {
    return apiError(userUpdate.error.message, 400);
  }

  const providerUpdate = await (client.from("providers") as any)
    .update({
      specialty: parsed.data.specialty || null,
      license_number: parsed.data.license_number || null,
      bio: parsed.data.bio || null
    })
    .eq("user_id", user.id)
    .select("*")
    .single();

  if (providerUpdate.error) {
    return apiError(providerUpdate.error.message, 400);
  }

  return apiSuccess({
    user: userUpdate.data,
    provider: providerUpdate.data
  });
}

export async function DELETE(request: NextRequest) {
  const { profile } = await requireApiUser();
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

  return apiSuccess({ user_id: body.user_id });
}
