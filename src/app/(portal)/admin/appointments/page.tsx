import { AdminAppointmentManager } from "@/components/admin/admin-appointment-manager";
import { requireRole } from "@/lib/auth";
import { createSupabaseServerComponentClient } from "@/lib/supabase/server";
import { listAppointments } from "@/repositories/appointmentRepository";
import { listPatients, listProviders } from "@/repositories/userRepository";
import type { Appointment, Patient, Provider } from "@/types/domain";

export default async function AdminAppointmentsPage() {
  await requireRole("admin");
  const supabase = createSupabaseServerComponentClient();
  const [appointmentsQuery, patientsQuery, providersQuery] = await Promise.all([
    listAppointments(supabase),
    listPatients(supabase),
    listProviders(supabase)
  ]);

  const appointments = (appointmentsQuery.data ?? []) as Appointment[];
  const patients = (patientsQuery.data ?? []) as Patient[];
  const providers = (providersQuery.data ?? []) as Provider[];

  return <AdminAppointmentManager appointments={appointments} patients={patients as any} providers={providers as any} />;
}
