export const dynamic = "force-dynamic";

import { AdminAppointmentEditor } from "@/components/admin/admin-appointment-editor";
import { requireRole } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { listPatients, listProviders } from "@/repositories/userRepository";
import type { Patient, Provider } from "@/types/domain";

export default async function AdminNewAppointmentPage() {
  await requireRole("admin");
  const supabase = createSupabaseAdminClient() as any;
  const [patientsQuery, providersQuery] = await Promise.all([
    listPatients(supabase),
    listProviders(supabase),
  ]);

  const patients = (patientsQuery.data ?? []) as Patient[];
  const providers = (providersQuery.data ?? []) as Provider[];

  return <AdminAppointmentEditor mode="create" patients={patients} providers={providers} />;
}
