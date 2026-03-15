"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { CalendarDays, ClipboardList, Plus, Search, SquarePen, Stethoscope } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/empty-state";
import type { Appointment, ClinicalNote, Patient, Provider } from "@/types/domain";

export function AdminClinicalNoteDirectory({
  notes,
  appointments,
  patients,
  providers
}: {
  notes: ClinicalNote[];
  appointments: Appointment[];
  patients: Patient[];
  providers: Provider[];
}) {
  const [query, setQuery] = useState("");

  const patientMap = useMemo(() => new Map(patients.map((p) => [p.id, p.user?.full_name ?? p.user?.email ?? "Patient"])), [patients]);
  const providerMap = useMemo(() => new Map(providers.map((p) => [p.id, p.user?.full_name ?? p.user?.email ?? "Provider"])), [providers]);

  const filtered = useMemo(() => {
    if (!query.trim()) return notes;
    const q = query.toLowerCase();
    return notes.filter((n) => {
      const patient = (patientMap.get(n.patient_id) ?? "").toLowerCase();
      const provider = (providerMap.get(n.provider_id) ?? "").toLowerCase();
      const assessment = (n.assessment ?? "").toLowerCase();
      const subjective = (n.subjective ?? "").toLowerCase();
      return patient.includes(q) || provider.includes(q) || assessment.includes(q) || subjective.includes(q);
    });
  }, [notes, query, patientMap, providerMap]);

  function appointmentLabel(id: string) {
    const apt = appointments.find((a) => a.id === id);
    if (!apt) return id.slice(0, 8);
    return `${format(new Date(apt.scheduled_at), "MMM d, h:mm a")} — ${apt.reason ?? "Consultation"}`;
  }

  if (notes.length === 0) {
    return (
      <div className="space-y-6">
        <Card className="flex flex-wrap items-center justify-between gap-4 p-6">
          <div>
            <h2 className="text-2xl font-semibold text-ink">Clinical Notes</h2>
            <p className="mt-2 text-sm text-muted">Browse SOAP documentation for patient appointments. Creation and edits are handled on separate screens.</p>
          </div>
          <Link className={buttonVariants({ size: "sm" })} href="/admin/notes/new">
            <Plus className="h-4 w-4" />
            Add note
          </Link>
        </Card>
        <EmptyState description="No clinical notes are in the directory yet. Create the first note from the dedicated add-note screen." title="No notes found" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="overflow-hidden border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.98)_0%,rgba(236,245,255,0.98)_100%)] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <Badge>Clinical notes</Badge>
            <h2 className="mt-4 text-2xl font-semibold text-ink">SOAP documentation for appointments</h2>
            <p className="mt-2 text-sm leading-7 text-muted">Search, review, and manage clinical notes attached to patient appointments.</p>
          </div>
          <Link className={buttonVariants({ size: "sm" })} href="/admin/notes/new">
            <Plus className="h-4 w-4" />
            Add note
          </Link>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-[22px] border border-border/80 bg-white/85 p-4 shadow-soft">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-primary-deep" />
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-deep">Total notes</p>
            </div>
            <p className="mt-2 text-3xl font-semibold text-ink">{notes.length}</p>
          </div>
          <div className="rounded-[22px] border border-border/80 bg-white/85 p-4 shadow-soft">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-emerald-600" />
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600">Appointments</p>
            </div>
            <p className="mt-2 text-3xl font-semibold text-ink">{appointments.length}</p>
          </div>
          <div className="rounded-[22px] border border-border/80 bg-white/85 p-4 shadow-soft">
            <div className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-blue-600" />
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">Providers</p>
            </div>
            <p className="mt-2 text-3xl font-semibold text-ink">{providers.length}</p>
          </div>
        </div>
      </Card>

      {/* Search + Table */}
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-4">
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              className="pl-9"
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by patient, provider, assessment..."
              type="search"
              value={query}
            />
          </div>
          <div className="flex items-center gap-3">
            <Badge>{filtered.length} of {notes.length}</Badge>
          </div>
        </div>

        {filtered.length === 0 && query.trim() === "" ? (
          <div className="p-6">
            <EmptyState description="No clinical notes yet. Click 'Add note' above to create the first entry." title="No notes found" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm font-medium text-ink">No notes match &ldquo;{query}&rdquo;</p>
            <p className="mt-1 text-xs text-muted">Try a different search term or clear the filter.</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="min-w-full divide-y divide-border text-left text-sm">
                <thead className="bg-surface-muted text-muted">
                  <tr>
                    <th className="px-6 py-3.5 font-semibold">Patient</th>
                    <th className="px-6 py-3.5 font-semibold">Provider</th>
                    <th className="px-6 py-3.5 font-semibold">Appointment</th>
                    <th className="px-6 py-3.5 font-semibold">Assessment</th>
                    <th className="px-6 py-3.5 font-semibold">Created</th>
                    <th className="px-6 py-3.5 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-white">
                  {filtered.map((note) => (
                    <tr key={note.id} className="transition-colors hover:bg-surface-muted/50">
                      <td className="px-6 py-4">
                        <div className="flex min-w-[160px] items-center gap-3">
                          <Avatar className="h-9 w-9 shrink-0" name={patientMap.get(note.patient_id)} />
                          <span className="truncate font-medium text-ink">{patientMap.get(note.patient_id) ?? "Unknown"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted">{providerMap.get(note.provider_id) ?? "Unknown"}</td>
                      <td className="max-w-[200px] truncate px-6 py-4 text-muted">{appointmentLabel(note.appointment_id)}</td>
                      <td className="max-w-[200px] truncate px-6 py-4 font-medium text-ink">{note.assessment}</td>
                      <td className="px-6 py-4 text-muted">{format(new Date(note.created_at), "MMM d, yyyy")}</td>
                      <td className="px-6 py-4 text-right">
                        <Link className={buttonVariants({ size: "sm", variant: "secondary" })} href={`/admin/notes/${note.id}`}>
                          <SquarePen className="h-3.5 w-3.5" />
                          Manage
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="space-y-3 p-4 lg:hidden">
              {filtered.map((note) => (
                <div key={note.id} className="rounded-[22px] border border-border/80 bg-white p-4 shadow-soft transition-shadow hover:shadow-card">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-ink">{note.assessment}</p>
                      <p className="mt-1 text-sm text-muted">{appointmentLabel(note.appointment_id)}</p>
                    </div>
                    <span className="shrink-0 text-xs text-muted">{format(new Date(note.created_at), "MMM d")}</span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-deep">Patient</p>
                      <div className="mt-1 flex items-center gap-2">
                        <Avatar className="h-6 w-6" name={patientMap.get(note.patient_id)} />
                        <p className="text-sm text-ink">{patientMap.get(note.patient_id) ?? "Unknown"}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-deep">Provider</p>
                      <p className="mt-1 text-sm text-ink">{providerMap.get(note.provider_id) ?? "Unknown"}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-end border-t border-border/60 pt-3">
                    <Link className={buttonVariants({ size: "sm", variant: "secondary" })} href={`/admin/notes/${note.id}`}>
                      <SquarePen className="h-3.5 w-3.5" />
                      Manage
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
