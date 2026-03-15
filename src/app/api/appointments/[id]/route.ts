export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";

import { createAuditLog, notifyUser, refreshPortalPaths, requireApiUser } from "@/app/api/_utils/helpers";
import { apiError, apiSuccess } from "@/lib/api";
import { APPOINTMENT_STATUSES } from "@/lib/constants";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/server";
import { updateAppointment } from "@/repositories/appointmentRepository";
import { listProviderAvailability } from "@/repositories/providerAvailabilityRepository";
import { getPatientByUserId, getProviderByUserId } from "@/repositories/userRepository";
import type { ProviderAvailability } from "@/types/domain";

function normalizeStatus(status: FormDataEntryValue | string | null) {
  const value = typeof status === "string" ? status : status?.toString();
  return APPOINTMENT_STATUSES.includes((value ?? "") as (typeof APPOINTMENT_STATUSES)[number]) ? value : null;
}

function isWithinAvailability(availability: ProviderAvailability[], scheduledAt: string) {
  if (availability.length === 0) {
    return true;
  }

  const date = new Date(scheduledAt);
  const day = date.getUTCDay();
  const time = date.toISOString().slice(11, 16);

  return availability.some((slot) => slot.day_of_week === day && slot.start_time.slice(0, 5) <= time && slot.end_time.slice(0, 5) >= time);
}

function getAdminClient() {
  try {
    return createSupabaseAdminClient() as any;
  } catch {
    return null;
  }
}

async function ensureAppointmentAccess(supabase: any, userId: string, role: string, appointment: { patient_id: string; provider_id: string }) {
  if (role === "admin") return true;

  if (role === "patient") {
    const patientQuery = await getPatientByUserId(supabase, userId);
    return patientQuery.data?.id === appointment.patient_id;
  }

  if (role === "provider") {
    const providerQuery = await getProviderByUserId(supabase, userId);
    return providerQuery.data?.id === appointment.provider_id;
  }

  return false;
}

async function notifyAppointmentParticipants(
  client: any,
  appointment: { patient_id: string; provider_id: string },
  actorUserId: string,
  title: string,
  body: string
) {
  const [patientQuery, providerQuery] = await Promise.all([
    client.from("patients").select("user_id").eq("id", appointment.patient_id).single(),
    client.from("providers").select("user_id").eq("id", appointment.provider_id).single()
  ]);

  const patientUserId = (patientQuery.data as { user_id: string } | null)?.user_id;
  const providerUserId = (providerQuery.data as { user_id: string } | null)?.user_id;

  if (patientUserId && patientUserId !== actorUserId) {
    await notifyUser(patientUserId, "appointment", title, body);
  }

  if (providerUserId && providerUserId !== actorUserId) {
    await notifyUser(providerUserId, "appointment", title, body);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const { supabase, user, profile } = await requireApiUser();
  if (!user || !profile) {
    return apiError("Unauthorized.", 401);
  }

  // Admin uses admin client to bypass RLS
  const client = profile.role === "admin" ? (getAdminClient() ?? supabase) : supabase;

  const appointmentQuery = await client.from("appointments").select("*").eq("id", params.id).maybeSingle();
  const appointment = appointmentQuery.data as { id: string; patient_id: string; provider_id: string } | null;

  if (!appointment) {
    return apiError("Appointment not found.", 404);
  }

  const canAccess = await ensureAppointmentAccess(client, user.id, profile.role, appointment);
  if (!canAccess) {
    return apiError("Forbidden.", 403);
  }

  const body = await request.json();
  const status = normalizeStatus(body.status);
  const payload: Record<string, unknown> = {};

  if (status) {
    payload.status = status;
  }

  if (body.scheduled_at) {
    const availabilityQuery = await listProviderAvailability(client, appointment.provider_id);
    const availability = (availabilityQuery.data ?? []) as ProviderAvailability[];
    if (!isWithinAvailability(availability, body.scheduled_at)) {
      return apiError("Selected time is outside the provider's availability.", 400);
    }

    payload.scheduled_at = body.scheduled_at;
    payload.status = payload.status ?? "pending";
  }

  if (Object.keys(payload).length === 0) {
    return apiError("Nothing to update.");
  }

  const { data, error } = await updateAppointment(client, params.id, payload);
  if (error || !data) {
    return apiError(error?.message ?? "Unable to update appointment.", 400);
  }

  const bodyText = body.scheduled_at
    ? `Appointment updated for ${new Date(String(body.scheduled_at)).toLocaleString()}.`
    : `Appointment status changed to ${String(payload.status ?? data.status)}.`;
  await notifyAppointmentParticipants(client, data, user.id, "Appointment updated", bodyText);

  await createAuditLog("appointment.updated", "appointments", data.id, payload, user.id);
  refreshPortalPaths(["/patient/appointments", "/provider/appointments", "/patient/dashboard", "/provider/dashboard"]);
  return apiSuccess(data);
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const formData = await request.formData();
  const status = normalizeStatus(formData.get("status"));

  if (!status) {
    return NextResponse.redirect(new URL("/provider/appointments", request.url));
  }

  const supabase = createSupabaseRouteHandlerClient();
  const { data } = await updateAppointment(supabase, params.id, { status });

  if (data) {
    await notifyAppointmentParticipants(supabase, data, "", "Appointment updated", `Appointment status changed to ${status}.`);
  }

  refreshPortalPaths(["/patient/appointments", "/provider/appointments"]);
  return NextResponse.redirect(new URL("/provider/appointments", request.url));
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const { supabase, user, profile } = await requireApiUser();
  if (!user || !profile) {
    return apiError("Unauthorized.", 401);
  }

  // Admin uses admin client to bypass RLS
  const client = profile.role === "admin" ? (getAdminClient() ?? supabase) : supabase;

  const appointmentQuery = await client.from("appointments").select("patient_id, provider_id").eq("id", params.id).maybeSingle();
  const appointment = appointmentQuery.data as { patient_id: string; provider_id: string } | null;
  if (!appointment) {
    return apiError("Appointment not found.", 404);
  }

  const canAccess = await ensureAppointmentAccess(client, user.id, profile.role, appointment);
  if (!canAccess) {
    return apiError("Forbidden.", 403);
  }

  const { error } = await client.from("appointments").delete().eq("id", params.id);
  if (error) {
    return apiError(error.message, 400);
  }

  await notifyAppointmentParticipants(client, appointment, user.id, "Appointment cancelled", "An appointment has been cancelled.");
  await createAuditLog("appointment.deleted", "appointments", params.id, {}, user.id);
  refreshPortalPaths(["/patient/appointments", "/provider/appointments"]);
  return apiSuccess({ id: params.id });
}
