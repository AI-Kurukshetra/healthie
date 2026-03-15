export const dynamic = "force-dynamic";

import { AdminPatientDirectory } from "@/components/admin/admin-patient-directory";
import type { AdminPatientRecord } from "@/components/admin/admin-patient-types";
import { requireRole } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { SupabaseTypedClient } from "@/repositories/base";
import { listPatients } from "@/repositories/userRepository";

export default async function AdminPatientsPage() {
  await requireRole("admin");
  const supabase = createSupabaseAdminClient() as unknown as SupabaseTypedClient;
  const patientsQuery = await listPatients(supabase);
  const patients = (patientsQuery.data ?? []) as AdminPatientRecord[];

  return <AdminPatientDirectory patients={patients} />;
}
