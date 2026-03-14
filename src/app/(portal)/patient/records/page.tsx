import Link from "next/link";
import { format } from "date-fns";

import { EmptyState } from "@/components/shared/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { createSupabaseServerComponentClient } from "@/lib/supabase/server";
import { listClinicalNotes, listMedicalRecords } from "@/repositories/recordRepository";
import { createMedicalDocumentSignedUrl } from "@/services/storageService";
import type { ClinicalNote, MedicalRecord, Patient } from "@/types/domain";

export default async function PatientRecordsPage() {
  const { user } = await requireRole("patient");
  const supabase = createSupabaseServerComponentClient();
  const patientQuery = await supabase.from("patients").select("*").eq("user_id", user.id).single();
  const patient = (patientQuery.data ?? null) as Patient | null;

  if (!patient) {
    return <EmptyState description="A patient profile was not found for this user." title="Patient profile missing" />;
  }

  const [recordsQuery, notesQuery] = await Promise.all([
    listMedicalRecords(supabase, patient.id),
    listClinicalNotes(supabase, { patientId: patient.id })
  ]);

  const records = (recordsQuery.data ?? []) as MedicalRecord[];
  const notes = (notesQuery.data ?? []) as ClinicalNote[];
  const recordsWithLinks = await Promise.all(
    records.map(async (record) => ({
      ...record,
      documentUrl: record.document_path ? await createMedicalDocumentSignedUrl(record.document_path) : null
    }))
  );

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold text-ink">Medical records</h2>
          <p className="mt-1 text-sm text-muted">Diagnosis summaries, treatment plans, and supporting documents from completed care episodes.</p>
        </div>

        {recordsWithLinks.length > 0 ? (
          recordsWithLinks.map((record) => (
            <Card key={record.id} className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-2xl font-semibold text-ink">{record.diagnosis}</h3>
                <p className="text-sm text-muted">{format(new Date(record.created_at), "MMM d, yyyy")}</p>
              </div>
              <p className="mt-4 text-sm leading-7 text-muted">{record.notes}</p>
              {record.treatment_plan ? <p className="mt-4 text-sm text-ink">Plan: <span className="text-muted">{record.treatment_plan}</span></p> : null}
              {record.document_path ? (
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <span className="text-sm text-muted">Supporting document</span>
                  {record.documentUrl ? (
                    <Link className={buttonVariants({ size: "sm", variant: "secondary" })} href={record.documentUrl} target="_blank">
                      Open document
                    </Link>
                  ) : (
                    <span className="text-sm text-muted">Document link unavailable</span>
                  )}
                </div>
              ) : null}
            </Card>
          ))
        ) : (
          <EmptyState description="Medical records will appear here after a provider completes a visit or uploads documentation." title="No records available" />
        )}
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold text-ink">Clinical notes</h2>
          <p className="mt-1 text-sm text-muted">SOAP notes linked to your appointments and written by your care team.</p>
        </div>

        {notes.length > 0 ? (
          notes.map((note) => (
            <Card key={note.id} className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary-deep">Appointment {note.appointment_id.slice(0, 8)}</p>
                <p className="text-sm text-muted">{format(new Date(note.created_at), "MMM d, yyyy")}</p>
              </div>
              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <div className="rounded-[20px] bg-surface-muted p-4">
                  <p className="text-sm font-semibold text-ink">Subjective</p>
                  <p className="mt-2 text-sm leading-7 text-muted">{note.subjective}</p>
                </div>
                <div className="rounded-[20px] bg-surface-muted p-4">
                  <p className="text-sm font-semibold text-ink">Objective</p>
                  <p className="mt-2 text-sm leading-7 text-muted">{note.objective}</p>
                </div>
                <div className="rounded-[20px] bg-surface-muted p-4">
                  <p className="text-sm font-semibold text-ink">Assessment</p>
                  <p className="mt-2 text-sm leading-7 text-muted">{note.assessment}</p>
                </div>
                <div className="rounded-[20px] bg-surface-muted p-4">
                  <p className="text-sm font-semibold text-ink">Plan</p>
                  <p className="mt-2 text-sm leading-7 text-muted">{note.plan}</p>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <EmptyState description="SOAP notes will appear here once your provider documents an appointment." title="No clinical notes yet" />
        )}
      </section>
    </div>
  );
}
