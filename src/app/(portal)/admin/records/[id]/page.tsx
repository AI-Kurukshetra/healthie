export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";

import { AdminMedicalRecordEditor } from "@/components/admin/admin-medical-record-editor";
import { requireRole } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { listPatients, listProviders } from "@/repositories/userRepository";
import { createMedicalDocumentSignedUrl } from "@/services/storageService";
import type { MedicalRecord, Patient, Provider } from "@/types/domain";

export default async function AdminRecordDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("admin");
  const { id } = await params;
  const supabase = createSupabaseAdminClient() as any;

  const [recordQuery, patientsQuery, providersQuery] = await Promise.all([
    supabase.from("medical_records").select("*").eq("id", id).maybeSingle(),
    listPatients(supabase),
    listProviders(supabase)
  ]);

  const record = (recordQuery.data ?? null) as MedicalRecord | null;

  if (!record) {
    notFound();
  }

  let documentUrl: string | null = null;
  if (record.document_path) {
    try {
      documentUrl = await createMedicalDocumentSignedUrl(record.document_path);
    } catch {
      // ignore — document link will be null
    }
  }

  const patients = (patientsQuery.data ?? []) as Patient[];
  const providers = (providersQuery.data ?? []) as Provider[];

  return (
    <AdminMedicalRecordEditor
      mode="edit"
      patients={patients}
      providers={providers}
      record={{ ...record, documentUrl }}
    />
  );
}
