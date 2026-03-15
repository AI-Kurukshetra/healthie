export const dynamic = "force-dynamic";

import { AdminMedicalRecordEditor } from "@/components/admin/admin-medical-record-editor";
import { requireRole } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { listPatients, listProviders } from "@/repositories/userRepository";
import type { Patient, Provider } from "@/types/domain";

export default async function AdminNewRecordPage() {
  await requireRole("admin");
  const supabase = createSupabaseAdminClient() as any;
  const [patientsQuery, providersQuery] = await Promise.all([
    listPatients(supabase),
    listProviders(supabase)
  ]);

  const patients = (patientsQuery.data ?? []) as Patient[];
  const providers = (providersQuery.data ?? []) as Provider[];

  return <AdminMedicalRecordEditor mode="create" patients={patients} providers={providers} />;
}
