import type { ClinicalNote, MedicalRecord } from "@/types/domain";
import type { SupabaseTypedClient } from "@/repositories/base";

const RECORD_COLUMNS = "id, patient_id, provider_id, diagnosis, notes, treatment_plan, document_path, created_at" as const;
const NOTE_COLUMNS = "id, appointment_id, provider_id, patient_id, subjective, objective, assessment, plan, created_at" as const;
const DEFAULT_LIMIT = 100;

export async function listMedicalRecords(client: SupabaseTypedClient, patientId?: string, options?: { limit?: number }) {
  let query = client.from("medical_records").select(RECORD_COLUMNS).order("created_at", { ascending: false }).limit(options?.limit ?? DEFAULT_LIMIT);

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
  filters?: { patientId?: string; providerId?: string; appointmentId?: string },
  options?: { limit?: number }
) {
  let query = client.from("clinical_notes").select(NOTE_COLUMNS).order("created_at", { ascending: false }).limit(options?.limit ?? DEFAULT_LIMIT);

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
  return (client.from("medical_records") as any).insert(payload).select(RECORD_COLUMNS).single();
}

export async function createClinicalNote(client: SupabaseTypedClient, payload: Record<string, unknown>) {
  return (client.from("clinical_notes") as any).insert(payload).select(NOTE_COLUMNS).single();
}
