export const dynamic = "force-dynamic";

import { AdminClinicalNoteEditor } from "@/components/admin/admin-clinical-note-editor";
import { requireRole } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { listAppointments } from "@/repositories/appointmentRepository";
import { listPatients, listProviders } from "@/repositories/userRepository";
import type { Appointment, Patient, Provider } from "@/types/domain";

export default async function AdminNewNotePage() {
  await requireRole("admin");
  const supabase = createSupabaseAdminClient() as any;
  const [appointmentsQuery, patientsQuery, providersQuery] = await Promise.all([
    listAppointments(supabase),
    listPatients(supabase),
    listProviders(supabase)
  ]);

  const appointments = (appointmentsQuery.data ?? []) as Appointment[];
  const patients = (patientsQuery.data ?? []) as Patient[];
  const providers = (providersQuery.data ?? []) as Provider[];

  return (
    <AdminClinicalNoteEditor
      appointments={appointments}
      mode="create"
      patients={patients as any}
      providers={providers as any}
    />
  );
}
