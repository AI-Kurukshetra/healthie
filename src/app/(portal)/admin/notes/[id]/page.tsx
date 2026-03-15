export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";

import { AdminClinicalNoteEditor } from "@/components/admin/admin-clinical-note-editor";
import { requireRole } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { listAppointments } from "@/repositories/appointmentRepository";
import { listPatients, listProviders } from "@/repositories/userRepository";
import type { Appointment, ClinicalNote, Patient, Provider } from "@/types/domain";

export default async function AdminNoteDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("admin");
  const { id } = await params;
  const supabase = createSupabaseAdminClient() as any;

  const [noteQuery, appointmentsQuery, patientsQuery, providersQuery] = await Promise.all([
    (supabase.from("clinical_notes") as any).select("*").eq("id", id).maybeSingle(),
    listAppointments(supabase),
    listPatients(supabase),
    listProviders(supabase)
  ]);

  const note = (noteQuery.data ?? null) as ClinicalNote | null;

  if (!note) {
    notFound();
  }

  const appointments = (appointmentsQuery.data ?? []) as Appointment[];
  const patients = (patientsQuery.data ?? []) as Patient[];
  const providers = (providersQuery.data ?? []) as Provider[];

  return (
    <AdminClinicalNoteEditor
      appointments={appointments}
      mode="edit"
      note={note}
      patients={patients as any}
      providers={providers as any}
    />
  );
}
