import type { SupabaseTypedClient } from "@/repositories/base";

export async function listPrescriptions(client: SupabaseTypedClient, patientId?: string) {
  let query = client.from("prescriptions").select("*").order("created_at", { ascending: false });

  if (patientId) {
    query = query.eq("patient_id", patientId);
  }

  return query;
}

export async function createPrescription(client: SupabaseTypedClient, payload: Record<string, unknown>) {
  return (client.from("prescriptions") as any).insert(payload).select("*").single();
}
