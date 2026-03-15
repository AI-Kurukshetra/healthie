"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { FileText, Plus, SquarePen, Trash2, X, ExternalLink } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/shared/empty-state";
import type { MedicalRecord, Patient, Provider } from "@/types/domain";

type RecordWithUrl = MedicalRecord & { documentUrl?: string | null };

export function AdminMedicalRecordManager({
  records,
  patients,
  providers
}: {
  records: RecordWithUrl[];
  patients: Patient[];
  providers: Provider[];
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<RecordWithUrl | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const patientMap = new Map(patients.map((p) => [p.id, p.user?.full_name ?? p.user?.email ?? "Patient"]));
  const providerMap = new Map(providers.map((p) => [p.id, p.user?.full_name ?? p.user?.email ?? "Provider"]));

  const withDocCount = records.filter((r) => r.document_path).length;
  const withPlanCount = records.filter((r) => r.treatment_plan).length;

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(event.currentTarget);

    const response = await fetch("/api/records", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patient_id: String(fd.get("patient_id") ?? ""),
        provider_id: String(fd.get("provider_id") ?? "") || null,
        diagnosis: String(fd.get("diagnosis") ?? ""),
        notes: String(fd.get("notes") ?? ""),
        treatment_plan: String(fd.get("treatment_plan") ?? "") || null
      })
    });

    const payload = await response.json();
    setLoading(false);
    if (!response.ok) {
      setError(payload.error ?? "Unable to create record.");
      return;
    }

    formRef.current?.reset();
    setShowForm(false);
    setError(null);
    router.refresh();
  }

  async function handleUpdate(event: React.FormEvent<HTMLFormElement>) {
    if (!editingRecord) return;
    event.preventDefault();
    setBusyId(editingRecord.id);
    setError(null);
    const fd = new FormData(event.currentTarget);

    const response = await fetch("/api/records", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "medical_record",
        id: editingRecord.id,
        patient_id: String(fd.get("patient_id") ?? ""),
        provider_id: String(fd.get("provider_id") ?? "") || null,
        diagnosis: String(fd.get("diagnosis") ?? ""),
        notes: String(fd.get("notes") ?? ""),
        treatment_plan: String(fd.get("treatment_plan") ?? "") || null,
        document_path: editingRecord.document_path || null
      })
    });

    setBusyId(null);
    if (!response.ok) {
      const payload = await response.json();
      setError(payload.error ?? "Unable to update record.");
      return;
    }

    setEditingRecord(null);
    setError(null);
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this medical record? This cannot be undone.")) return;
    setBusyId(id);
    await fetch("/api/records", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "medical_record", id })
    });
    setBusyId(null);
    if (editingRecord?.id === id) setEditingRecord(null);
    router.refresh();
  }

  function openEdit(record: RecordWithUrl) {
    setEditingRecord(record);
    setShowForm(false);
    setError(null);
  }

  function openCreate() {
    setShowForm(true);
    setEditingRecord(null);
    setError(null);
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="overflow-hidden border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.98)_0%,rgba(236,245,255,0.98)_100%)] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <Badge>Medical records</Badge>
            <h2 className="mt-4 text-2xl font-semibold text-ink">Manage patient medical records and clinical documents.</h2>
            <p className="mt-2 text-sm leading-7 text-muted">Create new records, update diagnoses and treatment plans, or remove outdated entries from the system.</p>
          </div>
          <Button onClick={openCreate} size="sm">
            <Plus className="h-4 w-4" />
            Add record
          </Button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-[22px] border border-border/80 bg-white/85 p-4 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-deep">Total records</p>
            <p className="mt-2 text-3xl font-semibold text-ink">{records.length}</p>
          </div>
          <div className="rounded-[22px] border border-border/80 bg-white/85 p-4 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-deep">With documents</p>
            <p className="mt-2 text-3xl font-semibold text-ink">{withDocCount}</p>
          </div>
          <div className="rounded-[22px] border border-border/80 bg-white/85 p-4 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-deep">With treatment plan</p>
            <p className="mt-2 text-3xl font-semibold text-ink">{withPlanCount}</p>
          </div>
        </div>
      </Card>

      {/* Create Form */}
      {showForm && (
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary-deep">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink">New medical record</h3>
                <p className="text-sm text-muted">Add a diagnosis, notes, and treatment plan for a patient.</p>
              </div>
            </div>
            <Button onClick={() => setShowForm(false)} size="sm" variant="ghost"><X className="h-4 w-4" /></Button>
          </div>

          <form ref={formRef} className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={handleCreate}>
            <label className="space-y-1.5">
              <span className="text-sm font-medium text-ink">Patient</span>
              <Select defaultValue="" name="patient_id" required>
                <option value="" disabled>Select patient</option>
                {patients.map((p) => <option key={p.id} value={p.id}>{p.user?.full_name ?? p.user?.email ?? "Patient"}</option>)}
              </Select>
            </label>
            <label className="space-y-1.5">
              <span className="text-sm font-medium text-ink">Provider</span>
              <Select defaultValue="" name="provider_id">
                <option value="">No provider</option>
                {providers.map((p) => <option key={p.id} value={p.id}>{p.user?.full_name ?? p.user?.email ?? "Provider"}</option>)}
              </Select>
            </label>
            <label className="space-y-1.5">
              <span className="text-sm font-medium text-ink">Diagnosis</span>
              <Input name="diagnosis" placeholder="e.g. Type 2 Diabetes, Hypertension" required />
            </label>
            <label className="space-y-1.5">
              <span className="text-sm font-medium text-ink">Treatment plan</span>
              <Input name="treatment_plan" placeholder="e.g. Medication + lifestyle changes" />
            </label>
            <div className="sm:col-span-2">
              <label className="space-y-1.5">
                <span className="text-sm font-medium text-ink">Clinical notes</span>
                <Textarea name="notes" placeholder="Detailed clinical notes..." required rows={3} />
              </label>
            </div>
            {error && !editingRecord && <p className="text-sm text-danger sm:col-span-2">{error}</p>}
            <div className="flex gap-3 sm:col-span-2">
              <Button disabled={loading} type="submit">{loading ? "Creating..." : "Create record"}</Button>
              <Button onClick={() => setShowForm(false)} type="button" variant="ghost">Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Edit Form */}
      {editingRecord && (
        <Card className="border-primary/20 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <SquarePen className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink">Manage record</h3>
                <p className="text-sm text-muted">
                  {patientMap.get(editingRecord.patient_id) ?? "Patient"} — {editingRecord.diagnosis}
                </p>
              </div>
            </div>
            <Button onClick={() => setEditingRecord(null)} size="sm" variant="ghost"><X className="h-4 w-4" /></Button>
          </div>

          <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={handleUpdate}>
            <label className="space-y-1.5">
              <span className="text-sm font-medium text-ink">Patient</span>
              <Select defaultValue={editingRecord.patient_id} name="patient_id" required>
                {patients.map((p) => <option key={p.id} value={p.id}>{p.user?.full_name ?? p.user?.email ?? "Patient"}</option>)}
              </Select>
            </label>
            <label className="space-y-1.5">
              <span className="text-sm font-medium text-ink">Provider</span>
              <Select defaultValue={editingRecord.provider_id ?? ""} name="provider_id">
                <option value="">No provider</option>
                {providers.map((p) => <option key={p.id} value={p.id}>{p.user?.full_name ?? p.user?.email ?? "Provider"}</option>)}
              </Select>
            </label>
            <label className="space-y-1.5">
              <span className="text-sm font-medium text-ink">Diagnosis</span>
              <Input defaultValue={editingRecord.diagnosis} name="diagnosis" required />
            </label>
            <label className="space-y-1.5">
              <span className="text-sm font-medium text-ink">Treatment plan</span>
              <Input defaultValue={editingRecord.treatment_plan ?? ""} name="treatment_plan" />
            </label>
            <div className="sm:col-span-2">
              <label className="space-y-1.5">
                <span className="text-sm font-medium text-ink">Clinical notes</span>
                <Textarea defaultValue={editingRecord.notes} name="notes" required rows={3} />
              </label>
            </div>

            {editingRecord.documentUrl && (
              <div className="sm:col-span-2">
                <a className="inline-flex items-center gap-2 rounded-lg bg-primary-soft px-3 py-2 text-sm font-medium text-primary-deep hover:underline" href={editingRecord.documentUrl} target="_blank">
                  <ExternalLink className="h-3.5 w-3.5" />
                  View attached document
                </a>
              </div>
            )}

            {error && editingRecord && <p className="text-sm text-danger sm:col-span-2">{error}</p>}
            <div className="flex gap-3 sm:col-span-2">
              <Button disabled={busyId === editingRecord.id} type="submit">{busyId === editingRecord.id ? "Saving..." : "Save changes"}</Button>
              <Button disabled={busyId === editingRecord.id} onClick={() => handleDelete(editingRecord.id)} type="button" variant="danger">
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </Button>
              <Button onClick={() => setEditingRecord(null)} type="button" variant="ghost">Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Data Table */}
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-5">
          <div>
            <h3 className="text-lg font-semibold text-ink">Record roster</h3>
            <p className="mt-1 text-sm text-muted">A data grid for reviewing diagnoses, treatment plans, and attached documents.</p>
          </div>
          <Badge>{records.length} rows</Badge>
        </div>

        {records.length === 0 ? (
          <div className="p-6">
            <EmptyState description="No medical records yet. Click 'Add record' above to create the first entry." title="No records found" />
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="min-w-full divide-y divide-border text-left text-sm">
                <thead className="bg-surface-muted text-muted">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Patient</th>
                    <th className="px-6 py-4 font-semibold">Provider</th>
                    <th className="px-6 py-4 font-semibold">Diagnosis</th>
                    <th className="px-6 py-4 font-semibold">Treatment Plan</th>
                    <th className="px-6 py-4 font-semibold">Created</th>
                    <th className="px-6 py-4 font-semibold">Doc</th>
                    <th className="px-6 py-4 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-white">
                  {records.map((record) => (
                    <tr key={record.id} className={`align-middle ${editingRecord?.id === record.id ? "bg-primary-soft/30" : ""}`}>
                      <td className="px-6 py-4">
                        <div className="flex min-w-[160px] items-center gap-3">
                          <Avatar className="h-9 w-9 shrink-0" name={patientMap.get(record.patient_id)} />
                          <span className="truncate font-medium text-ink">{patientMap.get(record.patient_id) ?? "Unknown"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted">{record.provider_id ? providerMap.get(record.provider_id) ?? "Unknown" : "—"}</td>
                      <td className="max-w-[200px] truncate px-6 py-4 font-medium text-ink">{record.diagnosis}</td>
                      <td className="max-w-[180px] truncate px-6 py-4 text-muted">{record.treatment_plan ?? "—"}</td>
                      <td className="px-6 py-4 text-muted">{format(new Date(record.created_at), "MMM d, yyyy")}</td>
                      <td className="px-6 py-4">
                        {record.documentUrl ? (
                          <a className="text-primary hover:underline" href={record.documentUrl} target="_blank"><ExternalLink className="h-4 w-4" /></a>
                        ) : <span className="text-muted">—</span>}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button onClick={() => openEdit(record)} size="sm" variant="secondary">
                            <SquarePen className="h-3.5 w-3.5" /> Manage
                          </Button>
                          <Button disabled={busyId === record.id} onClick={() => handleDelete(record.id)} size="sm" variant="danger">
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
              {records.map((record) => (
                <div key={record.id} className={`rounded-[22px] border p-4 ${editingRecord?.id === record.id ? "border-primary/30 bg-primary-soft/20" : "border-border/80 bg-surface-muted"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-ink">{record.diagnosis}</p>
                      <p className="mt-1 text-sm text-muted">{record.treatment_plan ?? "No treatment plan"}</p>
                    </div>
                    <span className="shrink-0 text-xs text-muted">{format(new Date(record.created_at), "MMM d")}</span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-deep">Patient</p>
                      <div className="mt-1 flex items-center gap-2">
                        <Avatar className="h-6 w-6" name={patientMap.get(record.patient_id)} />
                        <p className="text-sm text-ink">{patientMap.get(record.patient_id) ?? "Unknown"}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-deep">Provider</p>
                      <p className="mt-1 text-sm text-ink">{record.provider_id ? providerMap.get(record.provider_id) ?? "Unknown" : "—"}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button className="flex-1" onClick={() => openEdit(record)} size="sm" variant="secondary">
                      <SquarePen className="h-3.5 w-3.5" /> Manage
                    </Button>
                    <Button disabled={busyId === record.id} onClick={() => handleDelete(record.id)} size="sm" variant="danger">
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
