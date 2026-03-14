import type { AppointmentStatus } from "@/types/domain";
import type { SupabaseTypedClient } from "@/repositories/base";

export async function listAppointments(client: SupabaseTypedClient, filters?: {
  patientId?: string;
  providerId?: string;
  status?: AppointmentStatus;
}) {
  let query = client.from("appointments").select("*").order("scheduled_at", { ascending: true });

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
  return (client.from("appointments") as any).insert(payload).select("*").single();
}

export async function updateAppointment(
  client: SupabaseTypedClient,
  appointmentId: string,
  payload: Record<string, unknown>
) {
  return (client.from("appointments") as any).update(payload).eq("id", appointmentId).select("*").single();
}
