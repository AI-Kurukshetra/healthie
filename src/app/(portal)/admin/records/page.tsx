export const dynamic = "force-dynamic";

import { AdminMedicalRecordManager } from "@/components/admin/admin-medical-record-manager";
import { requireRole } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { listMedicalRecords } from "@/repositories/recordRepository";
import { listPatients, listProviders } from "@/repositories/userRepository";
import { createMedicalDocumentSignedUrl } from "@/services/storageService";
import type { MedicalRecord, Patient, Provider } from "@/types/domain";

export default async function AdminRecordsPage() {
  await requireRole("admin");
  const supabase = createSupabaseAdminClient() as any;
  const [recordsQuery, patientsQuery, providersQuery] = await Promise.all([
    listMedicalRecords(supabase),
    listPatients(supabase),
    listProviders(supabase)
  ]);

  const records = (recordsQuery.data ?? []) as MedicalRecord[];
  const patients = (patientsQuery.data ?? []) as Patient[];
  const providers = (providersQuery.data ?? []) as Provider[];
  const recordsWithLinks = records.map((record) => ({
    ...record,
    documentUrl: null as string | null
  }));

  // Generate signed URLs without blocking render — failures are non-fatal
  for (const record of recordsWithLinks) {
    if (record.document_path) {
      try {
        record.documentUrl = await createMedicalDocumentSignedUrl(record.document_path);
      } catch {
        // ignore — document link will be null
      }
    }
  }

  return <AdminMedicalRecordManager patients={patients as any} providers={providers as any} records={recordsWithLinks} />;
}
