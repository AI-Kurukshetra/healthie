"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { CalendarDays, ClipboardList, Plus, Search, SquarePen, Stethoscope, Trash2, X } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/shared/empty-state";
import { useToast } from "@/components/ui/toast";
import type { Appointment, ClinicalNote, Patient, Provider } from "@/types/domain";

export function AdminClinicalNoteManager({
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
  const router = useRouter();
  const { success: toastSuccess, error: toastError } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState<ClinicalNote | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
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

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "clinical_note",
          appointment_id: String(fd.get("appointment_id") ?? ""),
          provider_id: String(fd.get("provider_id") ?? ""),
          patient_id: String(fd.get("patient_id") ?? ""),
          subjective: String(fd.get("subjective") ?? "").trim(),
          objective: String(fd.get("objective") ?? "").trim(),
          assessment: String(fd.get("assessment") ?? "").trim(),
          plan: String(fd.get("plan") ?? "").trim()
        })
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        const msg = payload?.error ?? "Unable to create note.";
        setError(msg);
        toastError(msg);
        return;
      }

      toastSuccess("Clinical note created.");
      formRef.current?.reset();
      setShowForm(false);
      setError(null);
      router.refresh();
    } catch {
      const msg = "Network error. Please check your connection and try again.";
      setError(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(event: React.FormEvent<HTMLFormElement>) {
    if (!editingNote) return;
    event.preventDefault();
    setBusyId(editingNote.id);
    setError(null);
    const fd = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/records", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "clinical_note",
          id: editingNote.id,
          appointment_id: String(fd.get("appointment_id") ?? ""),
          provider_id: String(fd.get("provider_id") ?? ""),
          patient_id: String(fd.get("patient_id") ?? ""),
          subjective: String(fd.get("subjective") ?? "").trim(),
          objective: String(fd.get("objective") ?? "").trim(),
          assessment: String(fd.get("assessment") ?? "").trim(),
          plan: String(fd.get("plan") ?? "").trim()
        })
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        const msg = payload?.error ?? "Unable to update note.";
        setError(msg);
        toastError(msg);
        return;
      }

      toastSuccess("Clinical note updated.");
      setEditingNote(null);
      setError(null);
      router.refresh();
    } catch {
      const msg = "Network error. Please check your connection and try again.";
      setError(msg);
      toastError(msg);
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this clinical note? This cannot be undone.")) return;
    setBusyId(id);

    try {
      const res = await fetch("/api/records", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "clinical_note", id })
      });
      if (res.ok) toastSuccess("Clinical note deleted.");
      else toastError("Unable to delete note.");
      if (editingNote?.id === id) setEditingNote(null);
      router.refresh();
    } catch {
      toastError("Network error. Please check your connection and try again.");
    } finally {
      setBusyId(null);
    }
  }

  function openEdit(note: ClinicalNote) {
    setEditingNote(note);
    setShowForm(false);
    setError(null);
  }

  function openCreate() {
    setShowForm(true);
    setEditingNote(null);
    setError(null);
  }

  function appointmentLabel(id: string) {
    const apt = appointments.find((a) => a.id === id);
    if (!apt) return id.slice(0, 8);
    return `${format(new Date(apt.scheduled_at), "MMM d, h:mm a")} — ${apt.reason ?? "Consultation"}`;
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="overflow-hidden border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.98)_0%,rgba(236,245,255,0.98)_100%)] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <Badge>Clinical notes</Badge>
            <h2 className="mt-4 text-2xl font-semibold text-ink">SOAP documentation for appointments.</h2>
            <p className="mt-2 text-sm leading-7 text-muted">Create, review, and manage clinical notes attached to patient appointments. Each note follows the SOAP format.</p>
          </div>
          <Button onClick={openCreate} size="sm">
            <Plus className="h-4 w-4" />
            Add note
          </Button>
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
              <CalendarDays className="h-4 w-4 text-primary-deep" />
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-deep">Appointments</p>
            </div>
            <p className="mt-2 text-3xl font-semibold text-ink">{appointments.length}</p>
          </div>
          <div className="rounded-[22px] border border-border/80 bg-white/85 p-4 shadow-soft">
            <div className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-primary-deep" />
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-deep">Providers</p>
            </div>
            <p className="mt-2 text-3xl font-semibold text-ink">{providers.length}</p>
          </div>
        </div>
      </Card>

      {/* Create Form */}
      {showForm && (
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary-deep">
                <ClipboardList className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink">New clinical note</h3>
                <p className="text-sm text-muted">Attach a SOAP note to a patient appointment.</p>
              </div>
            </div>
            <Button onClick={() => setShowForm(false)} size="sm" variant="ghost"><X className="h-4 w-4" /></Button>
          </div>

          <form ref={formRef} className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={handleCreate}>
            <label className="space-y-1.5 sm:col-span-2">
              <span className="text-sm font-medium text-ink">Appointment</span>
              <Select defaultValue="" name="appointment_id" required>
                <option value="" disabled>Select appointment</option>
                {appointments.map((a) => <option key={a.id} value={a.id}>{appointmentLabel(a.id)}</option>)}
              </Select>
            </label>
            <label className="space-y-1.5">
              <span className="text-sm font-medium text-ink">Patient</span>
              <Select defaultValue="" name="patient_id" required>
                <option value="" disabled>Select patient</option>
                {patients.map((p) => <option key={p.id} value={p.id}>{p.user?.full_name ?? p.user?.email ?? "Patient"}</option>)}
              </Select>
            </label>
            <label className="space-y-1.5">
              <span className="text-sm font-medium text-ink">Provider</span>
              <Select defaultValue="" name="provider_id" required>
                <option value="" disabled>Select provider</option>
                {providers.map((p) => <option key={p.id} value={p.id}>{p.user?.full_name ?? p.user?.email ?? "Provider"}</option>)}
              </Select>
            </label>
            <label className="space-y-1.5">
              <span className="text-sm font-medium text-ink">Subjective</span>
              <Textarea name="subjective" placeholder="Patient's reported symptoms..." required rows={2} />
            </label>
            <label className="space-y-1.5">
              <span className="text-sm font-medium text-ink">Objective</span>
              <Textarea name="objective" placeholder="Clinical observations..." required rows={2} />
            </label>
            <label className="space-y-1.5">
              <span className="text-sm font-medium text-ink">Assessment</span>
              <Textarea name="assessment" placeholder="Diagnosis / assessment..." required rows={2} />
            </label>
            <label className="space-y-1.5">
              <span className="text-sm font-medium text-ink">Plan</span>
              <Textarea name="plan" placeholder="Treatment plan..." required rows={2} />
            </label>
            {error && !editingNote && <p className="text-sm text-danger sm:col-span-2">{error}</p>}
            <div className="flex gap-3 sm:col-span-2">
              <Button disabled={loading} type="submit">{loading ? "Creating..." : "Create note"}</Button>
              <Button onClick={() => setShowForm(false)} type="button" variant="ghost">Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Edit Form */}
      {editingNote && (
        <Card className="border-primary/20 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <SquarePen className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink">Manage note</h3>
                <p className="text-sm text-muted">
                  {patientMap.get(editingNote.patient_id) ?? "Patient"} — {appointmentLabel(editingNote.appointment_id)}
                </p>
              </div>
            </div>
            <Button onClick={() => setEditingNote(null)} size="sm" variant="ghost"><X className="h-4 w-4" /></Button>
          </div>

          <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={handleUpdate}>
            <label className="space-y-1.5 sm:col-span-2">
              <span className="text-sm font-medium text-ink">Appointment</span>
              <Select defaultValue={editingNote.appointment_id} name="appointment_id" required>
                {appointments.map((a) => <option key={a.id} value={a.id}>{appointmentLabel(a.id)}</option>)}
              </Select>
            </label>
            <label className="space-y-1.5">
              <span className="text-sm font-medium text-ink">Patient</span>
              <Select defaultValue={editingNote.patient_id} name="patient_id" required>
                {patients.map((p) => <option key={p.id} value={p.id}>{p.user?.full_name ?? p.user?.email ?? "Patient"}</option>)}
              </Select>
            </label>
            <label className="space-y-1.5">
              <span className="text-sm font-medium text-ink">Provider</span>
              <Select defaultValue={editingNote.provider_id} name="provider_id" required>
                {providers.map((p) => <option key={p.id} value={p.id}>{p.user?.full_name ?? p.user?.email ?? "Provider"}</option>)}
              </Select>
            </label>
            <label className="space-y-1.5">
              <span className="text-sm font-medium text-ink">Subjective</span>
              <Textarea defaultValue={editingNote.subjective} name="subjective" required rows={2} />
            </label>
            <label className="space-y-1.5">
              <span className="text-sm font-medium text-ink">Objective</span>
              <Textarea defaultValue={editingNote.objective} name="objective" required rows={2} />
            </label>
            <label className="space-y-1.5">
              <span className="text-sm font-medium text-ink">Assessment</span>
              <Textarea defaultValue={editingNote.assessment} name="assessment" required rows={2} />
            </label>
            <label className="space-y-1.5">
              <span className="text-sm font-medium text-ink">Plan</span>
              <Textarea defaultValue={editingNote.plan} name="plan" required rows={2} />
            </label>
            {error && editingNote && <p className="text-sm text-danger sm:col-span-2">{error}</p>}
            <div className="flex gap-3 sm:col-span-2">
              <Button disabled={busyId === editingNote.id} type="submit">{busyId === editingNote.id ? "Saving..." : "Save changes"}</Button>
              <Button disabled={busyId === editingNote.id} onClick={() => handleDelete(editingNote.id)} type="button" variant="danger">
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </Button>
              <Button onClick={() => setEditingNote(null)} type="button" variant="ghost">Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Data Table */}
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
                    <tr key={note.id} className={`align-middle transition-colors hover:bg-surface-muted/50 ${editingNote?.id === note.id ? "bg-primary-soft/30" : ""}`}>
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
                        <div className="flex items-center justify-end gap-2">
                          <Button onClick={() => openEdit(note)} size="sm" variant="secondary">
                            <SquarePen className="h-3.5 w-3.5" /> Manage
                          </Button>
                          <Button disabled={busyId === note.id} onClick={() => handleDelete(note.id)} size="sm" variant="danger">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="space-y-3 p-4 lg:hidden">
              {filtered.map((note) => (
                <div key={note.id} className={`rounded-[22px] border p-4 ${editingNote?.id === note.id ? "border-primary/30 bg-primary-soft/20" : "border-border/80 bg-white shadow-soft transition-shadow hover:shadow-card"}`}>
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
                  <div className="mt-3 flex gap-2">
                    <Button className="flex-1" onClick={() => openEdit(note)} size="sm" variant="secondary">
                      <SquarePen className="h-3.5 w-3.5" /> Manage
                    </Button>
                    <Button disabled={busyId === note.id} onClick={() => handleDelete(note.id)} size="sm" variant="danger">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
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
