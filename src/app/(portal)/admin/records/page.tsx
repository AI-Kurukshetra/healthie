import { AdminMedicalRecordManager } from "@/components/admin/admin-medical-record-manager";
import { requireRole } from "@/lib/auth";
import { createSupabaseServerComponentClient } from "@/lib/supabase/server";
import { listMedicalRecords } from "@/repositories/recordRepository";
import { listPatients, listProviders } from "@/repositories/userRepository";
import { createMedicalDocumentSignedUrl } from "@/services/storageService";
import type { MedicalRecord, Patient, Provider } from "@/types/domain";

export default async function AdminRecordsPage() {
  await requireRole("admin");
  const supabase = createSupabaseServerComponentClient();
  const [recordsQuery, patientsQuery, providersQuery] = await Promise.all([
    listMedicalRecords(supabase),
    listPatients(supabase),
    listProviders(supabase)
  ]);

  const records = (recordsQuery.data ?? []) as MedicalRecord[];
  const patients = (patientsQuery.data ?? []) as Patient[];
  const providers = (providersQuery.data ?? []) as Provider[];
  const recordsWithLinks = await Promise.all(records.map(async (record) => ({
    ...record,
    documentUrl: record.document_path ? await createMedicalDocumentSignedUrl(record.document_path) : null
  })));

  return <AdminMedicalRecordManager patients={patients as any} providers={providers as any} records={recordsWithLinks} />;
}
