export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";

import { createAuditLog, fireAndForget, getAdminClientOrFallback, notifyUser, refreshPortalPaths, requireApiUser } from "@/app/api/_utils/helpers";
import { apiError, apiSuccess } from "@/lib/api";
import { apiLimiter, getClientKey, rateLimitResponse, writeLimiter } from "@/lib/rate-limit";
import { createPrescription, listPrescriptions } from "@/repositories/prescriptionRepository";
import { getPatientByUserId, getProviderByUserId } from "@/repositories/userRepository";
import { prescriptionSchema } from "@/validators/prescription";

export async function GET(request: NextRequest) {
  const rl = apiLimiter.check(getClientKey(request));
  if (!rl.allowed) return rateLimitResponse(rl);

  const { supabase, user, profile } = await requireApiUser();
  if (!user || !profile) {
    return apiError("Unauthorized.", 401);
  }

  if (profile.role === "patient") {
    const patientQuery = await getPatientByUserId(supabase, user.id);
    if (!patientQuery.data) return apiSuccess([]);
    const { data, error } = await listPrescriptions(supabase, patientQuery.data.id);
    if (error) return apiError(error.message, 400);
    return apiSuccess(data ?? []);
  }

  // Providers and admins can list all (RLS still scopes at DB level)
  const { data, error } = await listPrescriptions(supabase);
  if (error) return apiError(error.message, 400);
  return apiSuccess(data ?? []);
}

export async function POST(request: NextRequest) {
  const rl = writeLimiter.check(getClientKey(request));
  if (!rl.allowed) return rateLimitResponse(rl);

  const { supabase, user, profile } = await requireApiUser();
  if (!user || !profile) {
    return apiError("Unauthorized.", 401);
  }

  const client = getAdminClientOrFallback(supabase);
  const body = await request.json();
  const parsed = prescriptionSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? "Invalid prescription payload.");
  }

  if (profile.role === "provider") {
    const providerQuery = await getProviderByUserId(supabase, user.id);
    const provider = providerQuery.data;

    if (!provider) {
      return apiError("Provider profile missing.", 400);
    }

    if (parsed.data.provider_id !== provider.id) {
      return apiError("Provider mismatch.", 403);
    }

    const appointmentLinkQuery = await supabase
      .from("appointments")
      .select("id")
      .eq("provider_id", provider.id)
      .eq("patient_id", parsed.data.patient_id)
      .limit(1)
      .maybeSingle();

    if (!appointmentLinkQuery.data) {
      return apiError("This patient is not assigned to your roster.", 403);
    }
  }

  const { data, error } = await createPrescription(client, parsed.data);
  if (error || !data) {
    return apiError(error?.message ?? "Unable to create prescription.", 400);
  }

  // Lookup patient for notification, then fire everything in background
  const patientQuery = await client.from("patients").select("user_id").eq("id", data.patient_id).single();
  const patient = (patientQuery.data ?? null) as { user_id: string } | null;

  const bgTasks: Promise<any>[] = [
    createAuditLog("prescription.created", "prescriptions", data.id, { patient_id: data.patient_id })
  ];
  if (patient?.user_id) {
    bgTasks.push(notifyUser(patient.user_id, "prescription", "New prescription", `${data.medication_name} has been issued.`));
  }
  fireAndForget(...bgTasks);
  refreshPortalPaths(["/patient/prescriptions", "/provider/prescriptions", "/patient/dashboard", "/admin/prescriptions"]);
  return apiSuccess(data, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const rl = writeLimiter.check(getClientKey(request));
  if (!rl.allowed) return rateLimitResponse(rl);

  const { supabase, user, profile } = await requireApiUser();
  if (!user || !profile) {
    return apiError("Unauthorized.", 401);
  }

  const client = getAdminClientOrFallback(supabase);
  const body = await request.json();
  if (!body.id) {
    return apiError("Prescription id is required.");
  }

  const existingQuery = await client.from("prescriptions").select("id, provider_id, patient_id").eq("id", body.id).maybeSingle();
  const existing = existingQuery.data as { id: string; provider_id: string; patient_id: string } | null;
  if (!existing) {
    return apiError("Prescription not found.", 404);
  }

  if (profile.role === "provider") {
    const providerQuery = await getProviderByUserId(supabase, user.id);
    if (!providerQuery.data || providerQuery.data.id !== existing.provider_id) {
      return apiError("Forbidden.", 403);
    }
  } else if (profile.role !== "admin") {
    return apiError("Forbidden.", 403);
  }

  const payload = {
    medication_name: body.medication_name,
    dosage: body.dosage,
    instructions: body.instructions,
    duration: body.duration,
    patient_id: body.patient_id ?? existing.patient_id,
    provider_id: body.provider_id ?? existing.provider_id
  };

  const parsed = prescriptionSchema.safeParse(payload);
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? "Invalid prescription payload.");
  }

  const { data, error } = await (client.from("prescriptions") as any)
    .update(parsed.data)
    .eq("id", body.id)
    .select("*")
    .single();

  if (error) {
    return apiError(error.message, 400);
  }

  // Lookup patient for notification, then fire everything in background
  const patientQuery = await client.from("patients").select("user_id").eq("id", data.patient_id).single();
  const patient = (patientQuery.data ?? null) as { user_id: string } | null;

  const bgTasks: Promise<any>[] = [
    createAuditLog("prescription.updated", "prescriptions", data.id, {})
  ];
  if (patient?.user_id) {
    bgTasks.push(notifyUser(patient.user_id, "prescription", "Prescription updated", `${data.medication_name} has been updated.`));
  }
  fireAndForget(...bgTasks);
  refreshPortalPaths(["/patient/prescriptions", "/provider/prescriptions", "/admin/prescriptions"]);
  return apiSuccess(data);
}

export async function DELETE(request: NextRequest) {
  const rl = writeLimiter.check(getClientKey(request));
  if (!rl.allowed) return rateLimitResponse(rl);

  const { supabase, user, profile } = await requireApiUser();
  if (!user || !profile) {
    return apiError("Unauthorized.", 401);
  }

  const client = getAdminClientOrFallback(supabase);
  const body = await request.json();
  if (!body.id) {
    return apiError("Prescription id is required.");
  }

  const existingQuery = await client.from("prescriptions").select("id, provider_id").eq("id", body.id).maybeSingle();
  const existing = existingQuery.data as { id: string; provider_id: string } | null;
  if (!existing) {
    return apiError("Prescription not found.", 404);
  }

  if (profile.role === "provider") {
    const providerQuery = await getProviderByUserId(supabase, user.id);
    if (!providerQuery.data || providerQuery.data.id !== existing.provider_id) {
      return apiError("Forbidden.", 403);
    }
  } else if (profile.role !== "admin") {
    return apiError("Forbidden.", 403);
  }

  const { error } = await client.from("prescriptions").delete().eq("id", body.id);
  if (error) {
    return apiError(error.message, 400);
  }

  fireAndForget(createAuditLog("prescription.deleted", "prescriptions", String(body.id), {}));
  refreshPortalPaths(["/patient/prescriptions", "/provider/prescriptions", "/admin/prescriptions"]);
  return apiSuccess({ id: body.id });
}
