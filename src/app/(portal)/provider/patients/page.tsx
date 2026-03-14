import { PatientTable } from "@/components/dashboard/patient-table";
import { EmptyState } from "@/components/shared/empty-state";
import { requireRole } from "@/lib/auth";
import { createSupabaseServerComponentClient } from "@/lib/supabase/server";
import { listPatients } from "@/repositories/userRepository";
import type { Patient } from "@/types/domain";

export default async function ProviderPatientsPage() {
  await requireRole("provider");
  const supabase = createSupabaseServerComponentClient();
  const patientsQuery = await listPatients(supabase);
  const patients = (patientsQuery.data ?? []) as Patient[];

  if (patients.length === 0) {
    return <EmptyState description="No patients are available yet." title="No patients" />;
  }

  return <PatientTable rows={patients.map((patient) => ({ id: patient.id, name: patient.user?.full_name ?? patient.user?.email ?? "Patient", insurance: patient.insurance_provider, phone: patient.phone }))} />;
}
