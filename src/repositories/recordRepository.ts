import type { ClinicalNote, MedicalRecord } from "@/types/domain";
import type { SupabaseTypedClient } from "@/repositories/base";

export async function listMedicalRecords(client: SupabaseTypedClient, patientId?: string) {
  let query = client.from("medical_records").select("*").order("created_at", { ascending: false });

  if (patientId) {
    query = query.eq("patient_id", patientId);
  }

  return query as any as Promise<{
    data: MedicalRecord[] | null;
    error: { message: string } | null;
  }>;
}

export async function listClinicalNotes(
  client: SupabaseTypedClient,
  filters?: { patientId?: string; providerId?: string; appointmentId?: string }
) {
  let query = client.from("clinical_notes").select("*").order("created_at", { ascending: false });

  if (filters?.patientId) {
    query = query.eq("patient_id", filters.patientId);
  }

  if (filters?.providerId) {
    query = query.eq("provider_id", filters.providerId);
  }

  if (filters?.appointmentId) {
    query = query.eq("appointment_id", filters.appointmentId);
  }

  return query as any as Promise<{
    data: ClinicalNote[] | null;
    error: { message: string } | null;
  }>;
}

export async function createMedicalRecord(client: SupabaseTypedClient, payload: Record<string, unknown>) {
  return (client.from("medical_records") as any).insert(payload).select("*").single();
}

export async function createClinicalNote(client: SupabaseTypedClient, payload: Record<string, unknown>) {
  return (client.from("clinical_notes") as any).insert(payload).select("*").single();
}
