export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";

import { requireApiUser } from "@/app/api/_utils/helpers";
import { apiError, apiSuccess } from "@/lib/api";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { listPatients } from "@/repositories/userRepository";
import { adminPatientCreateSchema, adminPatientUpdateSchema } from "@/validators/admin";
import { patientProfileSchema } from "@/validators/profile";

export async function GET() {
  const { supabase, user, profile } = await requireApiUser();
  if (!user || !profile) {
    return apiError("Unauthorized.", 401);
  }

  if (profile.role === "patient") {
    return apiError("Forbidden.", 403);
  }

  const { data, error } = await listPatients(supabase);

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
  const parsed = adminPatientCreateSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? "Invalid patient payload.");
  }

  const admin = createSupabaseAdminClient();
  const createResult = await admin.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: {
      role: "patient",
      full_name: parsed.data.full_name
    }
  });

  if (createResult.error || !createResult.data.user) {
    return apiError(createResult.error?.message ?? "Unable to create patient user.", 400);
  }

  const userId = createResult.data.user.id;

  const userUpsert = await (admin.from("users") as any).upsert(
    {
      id: userId,
      full_name: parsed.data.full_name,
      email: parsed.data.email,
      role: "patient",
      organization_id: null,
      avatar_url: null
    },
    { onConflict: "id" }
  );

  if (userUpsert.error) {
    await admin.auth.admin.deleteUser(userId);
    return apiError(userUpsert.error.message, 400);
  }

  const patientUpsert = await (admin.from("patients") as any)
    .upsert({
      user_id: userId,
      date_of_birth: parsed.data.date_of_birth || null,
      phone: parsed.data.phone || null,
      emergency_contact: parsed.data.emergency_contact || null,
      insurance_provider: parsed.data.insurance_provider || null
    }, { onConflict: "user_id" })
    .select("*")
    .single();

  if (patientUpsert.error) {
    await admin.auth.admin.deleteUser(userId);
    return apiError(patientUpsert.error.message, 400);
  }

  return apiSuccess({ user_id: userId, patient: patientUpsert.data }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const { supabase, user, profile } = await requireApiUser();
  if (!user || !profile) {
    return apiError("Unauthorized.", 401);
  }

  const body = await request.json();
  const isAdminTargeted = profile.role === "admin" && Boolean(body.user_id);

  if (isAdminTargeted) {
    const parsed = adminPatientUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? "Invalid patient profile payload.");
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

    const patientUpdate = await (client.from("patients") as any)
      .update({
        date_of_birth: parsed.data.date_of_birth || null,
        phone: parsed.data.phone || null,
        emergency_contact: parsed.data.emergency_contact || null,
        insurance_provider: parsed.data.insurance_provider || null
      })
      .eq("user_id", parsed.data.user_id)
      .select("*")
      .single();

    if (patientUpdate.error) {
      return apiError(patientUpdate.error.message, 400);
    }

    return apiSuccess({ user: userUpdate.data, patient: patientUpdate.data });
  }

  if (profile.role !== "patient" && profile.role !== "admin") {
    return apiError("Forbidden.", 403);
  }

  const parsed = patientProfileSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? "Invalid patient profile payload.");
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

  const patientUpdate = await (client.from("patients") as any)
    .update({
      date_of_birth: parsed.data.date_of_birth || null,
      phone: parsed.data.phone || null,
      emergency_contact: parsed.data.emergency_contact || null,
      insurance_provider: parsed.data.insurance_provider || null
    })
    .eq("user_id", user.id)
    .select("*")
    .single();

  if (patientUpdate.error) {
    return apiError(patientUpdate.error.message, 400);
  }

  return apiSuccess({
    user: userUpdate.data,
    patient: patientUpdate.data
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
