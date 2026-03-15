export const dynamic = "force-dynamic";

import { AdminPrescriptionDirectory } from "@/components/admin/admin-prescription-directory";
import { requireRole } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { listPrescriptions } from "@/repositories/prescriptionRepository";
import { listPatients, listProviders } from "@/repositories/userRepository";
import type { Patient, Prescription, Provider } from "@/types/domain";

export default async function AdminPrescriptionsPage() {
  await requireRole("admin");
  const supabase = createSupabaseAdminClient() as any;
  const [prescriptionsQuery, patientsQuery, providersQuery] = await Promise.all([
    listPrescriptions(supabase),
    listPatients(supabase),
    listProviders(supabase)
  ]);

  const prescriptions = (prescriptionsQuery.data ?? []) as Prescription[];
  const patients = (patientsQuery.data ?? []) as Patient[];
  const providers = (providersQuery.data ?? []) as Provider[];

  return <AdminPrescriptionDirectory patients={patients as any} prescriptions={prescriptions} providers={providers as any} />;
}
