import { AdminPatientManager } from "@/components/admin/admin-patient-manager";
import { requireRole } from "@/lib/auth";
import { createSupabaseServerComponentClient } from "@/lib/supabase/server";
import { listPatients } from "@/repositories/userRepository";
import type { Patient } from "@/types/domain";

export default async function AdminPatientsPage() {
  await requireRole("admin");
  const supabase = createSupabaseServerComponentClient();
  const patientsQuery = await listPatients(supabase);
  const patients = (patientsQuery.data ?? []) as Patient[];

  return <AdminPatientManager patients={patients as any} />;
}
