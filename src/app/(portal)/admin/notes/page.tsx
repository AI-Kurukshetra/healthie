export const dynamic = "force-dynamic";

import { AdminClinicalNoteManager } from "@/components/admin/admin-clinical-note-manager";
import { requireRole } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { listAppointments } from "@/repositories/appointmentRepository";
import { listClinicalNotes } from "@/repositories/recordRepository";
import { listPatients, listProviders } from "@/repositories/userRepository";
import type { Appointment, ClinicalNote, Patient, Provider } from "@/types/domain";

export default async function AdminNotesPage() {
  await requireRole("admin");
  const supabase = createSupabaseAdminClient() as any;
  const [notesQuery, appointmentsQuery, patientsQuery, providersQuery] = await Promise.all([
    listClinicalNotes(supabase),
    listAppointments(supabase),
    listPatients(supabase),
    listProviders(supabase)
  ]);

  const notes = (notesQuery.data ?? []) as ClinicalNote[];
  const appointments = (appointmentsQuery.data ?? []) as Appointment[];
  const patients = (patientsQuery.data ?? []) as Patient[];
  const providers = (providersQuery.data ?? []) as Provider[];

  return <AdminClinicalNoteManager appointments={appointments} notes={notes} patients={patients as any} providers={providers as any} />;
}
