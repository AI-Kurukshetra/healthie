export const dynamic = "force-dynamic";

import { AdminPrescriptionEditor } from "@/components/admin/admin-prescription-editor";
import { requireRole } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { listPatients, listProviders } from "@/repositories/userRepository";
import type { Patient, Provider } from "@/types/domain";

export default async function AdminNewPrescriptionPage() {
  await requireRole("admin");
  const supabase = createSupabaseAdminClient() as any;

  const [patientsQuery, providersQuery] = await Promise.all([
    listPatients(supabase),
    listProviders(supabase)
  ]);

  const patients = (patientsQuery.data ?? []) as Patient[];
  const providers = (providersQuery.data ?? []) as Provider[];

  return <AdminPrescriptionEditor mode="create" patients={patients} providers={providers} />;
}
