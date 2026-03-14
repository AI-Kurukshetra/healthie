import { format } from "date-fns";

import { ClinicalNoteForm } from "@/components/forms/clinical-note-form";
import { EmptyState } from "@/components/shared/empty-state";
import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { createSupabaseServerComponentClient } from "@/lib/supabase/server";
import { listAppointments } from "@/repositories/appointmentRepository";
import { listClinicalNotes } from "@/repositories/recordRepository";
import { getProviderByUserId, listPatients } from "@/repositories/userRepository";
import type { Appointment, ClinicalNote, Patient, Provider } from "@/types/domain";

export default async function ProviderNotesPage() {
  const { user } = await requireRole("provider");
  const supabase = createSupabaseServerComponentClient();
  const providerQuery = await getProviderByUserId(supabase, user.id);
  const provider = (providerQuery.data ?? null) as Provider | null;

  if (!provider) {
    return <EmptyState description="Provider profile missing for this account." title="Provider profile missing" />;
  }

  const [appointmentsQuery, patientsQuery, notesQuery] = await Promise.all([
    listAppointments(supabase, { providerId: provider.id }),
    listPatients(supabase),
    listClinicalNotes(supabase, { providerId: provider.id })
  ]);
  const appointments = (appointmentsQuery.data ?? []) as Appointment[];
  const patients = (patientsQuery.data ?? []) as Patient[];
  const notes = (notesQuery.data ?? []) as ClinicalNote[];
  const patientNames = new Map(
    patients.map((patient) => [patient.id, patient.user?.full_name ?? patient.user?.email ?? "Patient"])
  );
  const appointmentLabels = new Map(
    appointments.map((appointment) => [
      appointment.id,
      `${format(new Date(appointment.scheduled_at), "MMM d, h:mm a")} - ${patientNames.get(appointment.patient_id) ?? "Patient"}`
    ])
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-ink">Recent appointment queue</h2>
          <div className="mt-5 space-y-3">
            {appointments.length > 0 ? (
              appointments.map((appointment) => (
                <div key={appointment.id} className="rounded-[20px] border border-border bg-surface-muted px-4 py-4">
                  <p className="font-semibold text-ink">{format(new Date(appointment.scheduled_at), "MMM d, yyyy h:mm a")}</p>
                  <p className="mt-1 text-sm text-muted">{patientNames.get(appointment.patient_id) ?? "Patient"}</p>
                  <p className="mt-1 text-sm text-muted">{appointment.status}</p>
                </div>
              ))
            ) : (
              <EmptyState description="No appointments are available for note creation." title="No appointments" />
            )}
          </div>
        </Card>

        <ClinicalNoteForm
          appointments={appointments.map((appointment) => ({
            id: appointment.id,
            patientId: appointment.patient_id,
            label: `${format(new Date(appointment.scheduled_at), "MMM d, h:mm a")} - ${patientNames.get(appointment.patient_id) ?? "Patient"}`
          }))}
          providerId={provider.id}
        />
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold text-ink">Recent SOAP notes</h2>
        <div className="mt-5 space-y-4">
          {notes.length > 0 ? (
            notes.map((note) => (
              <div key={note.id} className="rounded-[24px] border border-border bg-surface-muted p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ink">{appointmentLabels.get(note.appointment_id) ?? `Appointment ${note.appointment_id.slice(0, 8)}`}</p>
                    <p className="mt-1 text-sm text-muted">Created {format(new Date(note.created_at), "MMM d, yyyy")}</p>
                  </div>
                  <span className="rounded-pill border border-primary/15 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-deep">
                    Attached to appointment
                  </span>
                </div>
                <div className="mt-5 grid gap-4 lg:grid-cols-2">
                  <div>
                    <p className="text-sm font-semibold text-ink">Subjective</p>
                    <p className="mt-2 text-sm leading-7 text-muted">{note.subjective}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink">Objective</p>
                    <p className="mt-2 text-sm leading-7 text-muted">{note.objective}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink">Assessment</p>
                    <p className="mt-2 text-sm leading-7 text-muted">{note.assessment}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink">Plan</p>
                    <p className="mt-2 text-sm leading-7 text-muted">{note.plan}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <EmptyState description="SOAP notes will appear here after providers document an appointment." title="No SOAP notes yet" />
          )}
        </div>
      </Card>
    </div>
  );
}
