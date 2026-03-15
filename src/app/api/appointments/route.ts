export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";

import { createAuditLog, fireAndForget, notifyUser, refreshPortalPaths, requireApiUser } from "@/app/api/_utils/helpers";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { apiError, apiSuccess } from "@/lib/api";
import { apiLimiter, getClientKey, rateLimitResponse, writeLimiter } from "@/lib/rate-limit";
import { createAppointment, listAppointments } from "@/repositories/appointmentRepository";
import { listProviderAvailability } from "@/repositories/providerAvailabilityRepository";
import { getPatientByUserId, getProviderByUserId } from "@/repositories/userRepository";
import { generateVideoLink } from "@/services/videoService";
import { appointmentSchema } from "@/validators/appointment";
import type { ProviderAvailability } from "@/types/domain";

function isWithinAvailability(availability: ProviderAvailability[], scheduledAt: string) {
  if (availability.length === 0) {
    return true;
  }

  const date = new Date(scheduledAt);
  const day = date.getUTCDay();
  const time = date.toISOString().slice(11, 16);

  return availability.some((slot) => slot.day_of_week === day && slot.start_time.slice(0, 5) <= time && slot.end_time.slice(0, 5) >= time);
}

export async function GET(request: NextRequest) {
  const rl = apiLimiter.check(getClientKey(request));
  if (!rl.allowed) return rateLimitResponse(rl);

  const { supabase, user, profile } = await requireApiUser();

  if (!user || !profile) {
    return apiError("Unauthorized.", 401);
  }

  if (profile.role === "patient") {
    const patientQuery = await getPatientByUserId(supabase, user.id);
    if (!patientQuery.data) {
      return apiSuccess([]);
    }
    const { data, error } = await listAppointments(supabase, { patientId: patientQuery.data.id });
    if (error) return apiError(error.message, 400);
    return apiSuccess(data ?? []);
  }

  if (profile.role === "provider") {
    const providerQuery = await getProviderByUserId(supabase, user.id);
    if (!providerQuery.data) {
      return apiSuccess([]);
    }
    const { data, error } = await listAppointments(supabase, { providerId: providerQuery.data.id });
    if (error) return apiError(error.message, 400);
    return apiSuccess(data ?? []);
  }

  // Admin: return all
  const { data, error } = await listAppointments(supabase);
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

  const body = await request.json();
  const parsed = appointmentSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? "Invalid appointment payload.");
  }

  if (profile.role === "patient") {
    const patientQuery = await getPatientByUserId(supabase, user.id);
    if (!patientQuery.data || patientQuery.data.id !== parsed.data.patient_id) {
      return apiError("Patient mismatch.", 403);
    }
  }

  // Admin uses admin client to bypass RLS for insert
  const writeClient = profile.role === "admin" ? (() => { try { return createSupabaseAdminClient() as any; } catch { return supabase; } })() : supabase;

  const availabilityQuery = await listProviderAvailability(writeClient, parsed.data.provider_id);
  const availability = (availabilityQuery.data ?? []) as ProviderAvailability[];
  if (!isWithinAvailability(availability, parsed.data.scheduled_at)) {
    return apiError("Selected time is outside the provider's availability.", 400);
  }

  const appointmentId = crypto.randomUUID();
  const payload = {
    id: appointmentId,
    ...parsed.data,
    reason: parsed.data.reason || null,
    video_link: generateVideoLink(appointmentId, request.url)
  };

  const { data, error } = await createAppointment(writeClient, payload);
  if (error || !data) {
    return apiError(error?.message ?? "Unable to create appointment.", 400);
  }

  // Lookup patient and provider user_ids in parallel
  const [patientLookup, providerLookup] = await Promise.all([
    writeClient.from("patients").select("user_id").eq("id", data.patient_id).single(),
    writeClient.from("providers").select("user_id").eq("id", data.provider_id).single()
  ]);
  const patient = (patientLookup.data ?? null) as { user_id: string } | null;
  const provider = (providerLookup.data ?? null) as { user_id: string } | null;

  // Fire notifications + audit log in background — don't block the response
  const bgTasks: Promise<any>[] = [];
  if (patient?.user_id) {
    bgTasks.push(notifyUser(patient.user_id, "appointment", "Appointment booked", "Your visit has been booked successfully."));
  }
  if (provider?.user_id) {
    bgTasks.push(notifyUser(provider.user_id, "appointment", "New appointment", "A new consultation has been booked."));
  }
  bgTasks.push(createAuditLog("appointment.created", "appointments", data.id, { status: data.status }, user.id));
  fireAndForget(...bgTasks);
  refreshPortalPaths(["/patient/appointments", "/provider/appointments", "/patient/dashboard", "/provider/dashboard"]);

  return apiSuccess(data, { status: 201 });
}
