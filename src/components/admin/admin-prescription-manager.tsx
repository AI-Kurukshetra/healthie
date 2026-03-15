"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Pill, Plus, SquarePen, Trash2, X } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/shared/empty-state";
import type { Patient, Prescription, Provider } from "@/types/domain";

export function AdminPrescriptionManager({
  prescriptions,
  patients,
  providers
}: {
  prescriptions: Prescription[];
  patients: Patient[];
  providers: Provider[];
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingRx, setEditingRx] = useState<Prescription | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const patientMap = new Map(patients.map((p) => [p.id, p.user?.full_name ?? p.user?.email ?? "Patient"]));
  const providerMap = new Map(providers.map((p) => [p.id, p.user?.full_name ?? p.user?.email ?? "Provider"]));

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(event.currentTarget);

    const response = await fetch("/api/prescriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patient_id: String(fd.get("patient_id") ?? ""),
        provider_id: String(fd.get("provider_id") ?? ""),
        medication_name: String(fd.get("medication_name") ?? ""),
        dosage: String(fd.get("dosage") ?? ""),
        instructions: String(fd.get("instructions") ?? ""),
        duration: String(fd.get("duration") ?? "")
      })
    });

    const payload = await response.json();
    setLoading(false);
    if (!response.ok) {
      setError(payload.error ?? "Unable to create prescription.");
      return;
    }

    formRef.current?.reset();
    setShowForm(false);
    setError(null);
    router.refresh();
  }

  async function handleUpdate(event: React.FormEvent<HTMLFormElement>) {
    if (!editingRx) return;
    event.preventDefault();
    setBusyId(editingRx.id);
    setError(null);
    const fd = new FormData(event.currentTarget);

    const response = await fetch("/api/prescriptions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editingRx.id,
        patient_id: String(fd.get("patient_id") ?? ""),
        provider_id: String(fd.get("provider_id") ?? ""),
        medication_name: String(fd.get("medication_name") ?? ""),
        dosage: String(fd.get("dosage") ?? ""),
        instructions: String(fd.get("instructions") ?? ""),
        duration: String(fd.get("duration") ?? "")
      })
    });

    setBusyId(null);
    if (!response.ok) {
      const payload = await response.json();
      setError(payload.error ?? "Unable to update prescription.");
      return;
    }

    setEditingRx(null);
    setError(null);
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this prescription? This cannot be undone.")) return;
    setBusyId(id);
    await fetch("/api/prescriptions", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    setBusyId(null);
    if (editingRx?.id === id) setEditingRx(null);
    router.refresh();
  }

  function openEdit(rx: Prescription) {
    setEditingRx(rx);
    setShowForm(false);
    setError(null);
  }

  function openCreate() {
    setShowForm(true);
    setEditingRx(null);
    setError(null);
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="overflow-hidden border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.98)_0%,rgba(236,245,255,0.98)_100%)] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <Badge>Prescription management</Badge>
            <h2 className="mt-4 text-2xl font-semibold text-ink">Issue, update, and manage patient prescriptions.</h2>
            <p className="mt-2 text-sm leading-7 text-muted">Create new prescriptions, modify dosage or instructions, or remove outdated medication plans.</p>
          </div>
          <Button onClick={openCreate} size="sm">
            <Plus className="h-4 w-4" />
            Add prescription
          </Button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-[22px] border border-border/80 bg-white/85 p-4 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-deep">Total prescriptions</p>
            <p className="mt-2 text-3xl font-semibold text-ink">{prescriptions.length}</p>
          </div>
          <div className="rounded-[22px] border border-border/80 bg-white/85 p-4 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-deep">Patients receiving</p>
            <p className="mt-2 text-3xl font-semibold text-ink">{new Set(prescriptions.map((r) => r.patient_id)).size}</p>
          </div>
          <div className="rounded-[22px] border border-border/80 bg-white/85 p-4 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-deep">Providers prescribing</p>
            <p className="mt-2 text-3xl font-semibold text-ink">{new Set(prescriptions.map((r) => r.provider_id)).size}</p>
          </div>
        </div>
      </Card>

      {/* Create Form */}
      {showForm && (
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary-deep">
                <Pill className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink">New prescription</h3>
                <p className="text-sm text-muted">Issue a medication plan for a patient.</p>
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
              <Select defaultValue="" name="provider_id" required>
                <option value="" disabled>Select provider</option>
                {providers.map((p) => <option key={p.id} value={p.id}>{p.user?.full_name ?? p.user?.email ?? "Provider"}</option>)}
              </Select>
            </label>
            <label className="space-y-1.5">
              <span className="text-sm font-medium text-ink">Medication name</span>
              <Input name="medication_name" placeholder="e.g. Amoxicillin, Metformin" required />
            </label>
            <label className="space-y-1.5">
              <span className="text-sm font-medium text-ink">Dosage</span>
              <Input name="dosage" placeholder="e.g. 500mg twice daily" required />
            </label>
            <label className="space-y-1.5">
              <span className="text-sm font-medium text-ink">Duration</span>
              <Input name="duration" placeholder="e.g. 7 days, 30 days" required />
            </label>
            <div className="sm:col-span-2">
              <label className="space-y-1.5">
                <span className="text-sm font-medium text-ink">Instructions</span>
                <Textarea name="instructions" placeholder="Take with food, avoid alcohol..." required rows={2} />
              </label>
            </div>
            {error && !editingRx && <p className="text-sm text-danger sm:col-span-2">{error}</p>}
            <div className="flex gap-3 sm:col-span-2">
              <Button disabled={loading} type="submit">{loading ? "Creating..." : "Create prescription"}</Button>
              <Button onClick={() => setShowForm(false)} type="button" variant="ghost">Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Edit Form */}
      {editingRx && (
        <Card className="border-primary/20 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <SquarePen className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink">Manage prescription</h3>
                <p className="text-sm text-muted">
                  {editingRx.medication_name} — {patientMap.get(editingRx.patient_id) ?? "Patient"}
                </p>
              </div>
            </div>
            <Button onClick={() => setEditingRx(null)} size="sm" variant="ghost"><X className="h-4 w-4" /></Button>
          </div>

          <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={handleUpdate}>
            <label className="space-y-1.5">
              <span className="text-sm font-medium text-ink">Patient</span>
              <Select defaultValue={editingRx.patient_id} name="patient_id" required>
                {patients.map((p) => <option key={p.id} value={p.id}>{p.user?.full_name ?? p.user?.email ?? "Patient"}</option>)}
              </Select>
            </label>
            <label className="space-y-1.5">
              <span className="text-sm font-medium text-ink">Provider</span>
              <Select defaultValue={editingRx.provider_id} name="provider_id" required>
                {providers.map((p) => <option key={p.id} value={p.id}>{p.user?.full_name ?? p.user?.email ?? "Provider"}</option>)}
              </Select>
            </label>
            <label className="space-y-1.5">
              <span className="text-sm font-medium text-ink">Medication name</span>
              <Input defaultValue={editingRx.medication_name} name="medication_name" required />
            </label>
            <label className="space-y-1.5">
              <span className="text-sm font-medium text-ink">Dosage</span>
              <Input defaultValue={editingRx.dosage} name="dosage" required />
            </label>
            <label className="space-y-1.5">
              <span className="text-sm font-medium text-ink">Duration</span>
              <Input defaultValue={editingRx.duration} name="duration" required />
            </label>
            <div className="sm:col-span-2">
              <label className="space-y-1.5">
                <span className="text-sm font-medium text-ink">Instructions</span>
                <Textarea defaultValue={editingRx.instructions} name="instructions" required rows={2} />
              </label>
            </div>
            {error && editingRx && <p className="text-sm text-danger sm:col-span-2">{error}</p>}
            <div className="flex gap-3 sm:col-span-2">
              <Button disabled={busyId === editingRx.id} type="submit">{busyId === editingRx.id ? "Saving..." : "Save changes"}</Button>
              <Button disabled={busyId === editingRx.id} onClick={() => handleDelete(editingRx.id)} type="button" variant="danger">
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </Button>
              <Button onClick={() => setEditingRx(null)} type="button" variant="ghost">Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Data Table */}
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-5">
          <div>
            <h3 className="text-lg font-semibold text-ink">Prescription roster</h3>
            <p className="mt-1 text-sm text-muted">A data grid for reviewing medications, dosage, and managing prescriptions.</p>
          </div>
          <Badge>{prescriptions.length} rows</Badge>
        </div>

        {prescriptions.length === 0 ? (
          <div className="p-6">
            <EmptyState description="No prescriptions yet. Click 'Add prescription' above to issue the first one." title="No prescriptions found" />
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
                    <th className="px-6 py-4 font-semibold">Medication</th>
                    <th className="px-6 py-4 font-semibold">Dosage</th>
                    <th className="px-6 py-4 font-semibold">Duration</th>
                    <th className="px-6 py-4 font-semibold">Created</th>
                    <th className="px-6 py-4 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-white">
                  {prescriptions.map((rx) => (
                    <tr key={rx.id} className={`align-middle ${editingRx?.id === rx.id ? "bg-primary-soft/30" : ""}`}>
                      <td className="px-6 py-4">
                        <div className="flex min-w-[160px] items-center gap-3">
                          <Avatar className="h-9 w-9 shrink-0" name={patientMap.get(rx.patient_id)} />
                          <span className="truncate font-medium text-ink">{patientMap.get(rx.patient_id) ?? "Unknown"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted">{providerMap.get(rx.provider_id) ?? "Unknown"}</td>
                      <td className="px-6 py-4 font-medium text-ink">{rx.medication_name}</td>
                      <td className="px-6 py-4 text-muted">{rx.dosage}</td>
                      <td className="px-6 py-4 text-muted">{rx.duration}</td>
                      <td className="px-6 py-4 text-muted">{format(new Date(rx.created_at), "MMM d, yyyy")}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button onClick={() => openEdit(rx)} size="sm" variant="secondary">
                            <SquarePen className="h-3.5 w-3.5" /> Manage
                          </Button>
                          <Button disabled={busyId === rx.id} onClick={() => handleDelete(rx.id)} size="sm" variant="danger">
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
              {prescriptions.map((rx) => (
                <div key={rx.id} className={`rounded-[22px] border p-4 ${editingRx?.id === rx.id ? "border-primary/30 bg-primary-soft/20" : "border-border/80 bg-surface-muted"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-ink">{rx.medication_name}</p>
                      <p className="mt-1 text-sm text-muted">{rx.dosage} — {rx.duration}</p>
                    </div>
                    <span className="shrink-0 text-xs text-muted">{format(new Date(rx.created_at), "MMM d")}</span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-deep">Patient</p>
                      <div className="mt-1 flex items-center gap-2">
                        <Avatar className="h-6 w-6" name={patientMap.get(rx.patient_id)} />
                        <p className="text-sm text-ink">{patientMap.get(rx.patient_id) ?? "Unknown"}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-deep">Provider</p>
                      <p className="mt-1 text-sm text-ink">{providerMap.get(rx.provider_id) ?? "Unknown"}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button className="flex-1" onClick={() => openEdit(rx)} size="sm" variant="secondary">
                      <SquarePen className="h-3.5 w-3.5" /> Manage
                    </Button>
                    <Button disabled={busyId === rx.id} onClick={() => handleDelete(rx.id)} size="sm" variant="danger">
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
