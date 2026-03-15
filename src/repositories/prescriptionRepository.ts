import type { SupabaseTypedClient } from "@/repositories/base";

const PRESCRIPTION_COLUMNS = "id, provider_id, patient_id, medication_name, dosage, instructions, duration, created_at" as const;
const DEFAULT_LIMIT = 100;

export async function listPrescriptions(client: SupabaseTypedClient, patientId?: string, options?: { limit?: number }) {
  let query = client.from("prescriptions").select(PRESCRIPTION_COLUMNS).order("created_at", { ascending: false }).limit(options?.limit ?? DEFAULT_LIMIT);

  if (patientId) {
    query = query.eq("patient_id", patientId);
  }

  return query;
}

export async function createPrescription(client: SupabaseTypedClient, payload: Record<string, unknown>) {
  return (client.from("prescriptions") as any).insert(payload).select(PRESCRIPTION_COLUMNS).single();
}
