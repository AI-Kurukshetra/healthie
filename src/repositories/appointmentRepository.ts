import type { AppointmentStatus } from "@/types/domain";
import type { SupabaseTypedClient } from "@/repositories/base";

const APPOINTMENT_COLUMNS = "id, patient_id, provider_id, scheduled_at, status, video_link, reason, created_at" as const;
const DEFAULT_LIMIT = 100;

export async function listAppointments(client: SupabaseTypedClient, filters?: {
  patientId?: string;
  providerId?: string;
  status?: AppointmentStatus;
  limit?: number;
}) {
  let query = client.from("appointments").select(APPOINTMENT_COLUMNS).order("scheduled_at", { ascending: true }).limit(filters?.limit ?? DEFAULT_LIMIT);

  if (filters?.patientId) {
    query = query.eq("patient_id", filters.patientId);
  }

  if (filters?.providerId) {
    query = query.eq("provider_id", filters.providerId);
  }

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  return query;
}

export async function createAppointment(client: SupabaseTypedClient, payload: Record<string, unknown>) {
  return (client.from("appointments") as any).insert(payload).select(APPOINTMENT_COLUMNS).single();
}

export async function updateAppointment(
  client: SupabaseTypedClient,
  appointmentId: string,
  payload: Record<string, unknown>
) {
  return (client.from("appointments") as any).update(payload).eq("id", appointmentId).select(APPOINTMENT_COLUMNS).single();
}
