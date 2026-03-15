"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { CalendarDays, CheckCircle2, Clock, Plus, Search, SquarePen, Trash2, X } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { EmptyState } from "@/components/shared/empty-state";
import { useToast } from "@/components/ui/toast";
import type { Appointment, Patient, Provider } from "@/types/domain";

const statusStyles: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  completed: "bg-slate-100 text-slate-600 border-slate-200",
  cancelled: "bg-red-50 text-red-600 border-red-200"
};

function toLocalInputValue(value: string) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

export function AdminAppointmentManager({
  appointments,
  patients,
  providers
}: {
  appointments: Appointment[];
  patients: Patient[];
  providers: Provider[];
}) {
  const router = useRouter();
  const { success: toastSuccess, error: toastError } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const patientMap = useMemo(() => new Map(patients.map((p) => [p.id, p.user?.full_name ?? p.user?.email ?? "Patient"])), [patients]);
  const providerMap = useMemo(() => new Map(providers.map((p) => [p.id, p.user?.full_name ?? p.user?.email ?? "Provider"])), [providers]);

  const filtered = useMemo(() => {
    if (!query.trim()) return appointments;
    const q = query.toLowerCase();
    return appointments.filter((a) => {
      const patient = (patientMap.get(a.patient_id) ?? "").toLowerCase();
      const provider = (providerMap.get(a.provider_id) ?? "").toLowerCase();
      const reason = (a.reason ?? "").toLowerCase();
      const status = a.status.toLowerCase();
      return patient.includes(q) || provider.includes(q) || reason.includes(q) || status.includes(q);
    });
  }, [appointments, query, patientMap, providerMap]);

  const pendingCount = appointments.filter((a) => a.status === "pending").length;
  const confirmedCount = appointments.filter((a) => a.status === "confirmed").length;
  const completedCount = appointments.filter((a) => a.status === "completed").length;

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: String(fd.get("patient_id") ?? ""),
          provider_id: String(fd.get("provider_id") ?? ""),
          scheduled_at: new Date(String(fd.get("scheduled_at") ?? "")).toISOString(),
          status: String(fd.get("status") ?? "pending"),
          reason: String(fd.get("reason") ?? "").trim()
        })
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        const msg = payload?.error ?? "Unable to create appointment.";
        setError(msg);
        toastError(msg);
        return;
      }

      toastSuccess("Appointment created.");
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
    if (!editingAppointment) return;
    event.preventDefault();
    setBusyId(editingAppointment.id);
    setError(null);
    const fd = new FormData(event.currentTarget);

    try {
      const response = await fetch(`/api/appointments/${editingAppointment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheduled_at: new Date(String(fd.get("scheduled_at") ?? "")).toISOString(),
          status: String(fd.get("status") ?? "pending")
        })
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        const msg = payload?.error ?? "Unable to update appointment.";
        setError(msg);
        toastError(msg);
        return;
      }

      toastSuccess("Appointment updated.");
      setEditingAppointment(null);
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
    if (!window.confirm("Delete this appointment? This cannot be undone.")) return;
    setBusyId(id);

    try {
      const res = await fetch(`/api/appointments/${id}`, { method: "DELETE" });
      if (res.ok) toastSuccess("Appointment deleted.");
      else toastError("Unable to delete appointment.");
      if (editingAppointment?.id === id) setEditingAppointment(null);
      router.refresh();
    } catch {
      toastError("Network error. Please check your connection and try again.");
    } finally {
      setBusyId(null);
    }
  }

  function openEdit(appointment: Appointment) {
    setEditingAppointment(appointment);
    setShowForm(false);
    setError(null);
  }

  function openCreate() {
    setShowForm(true);
    setEditingAppointment(null);
    setError(null);
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="overflow-hidden border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.98)_0%,rgba(236,245,255,0.98)_100%)] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <Badge>Appointment management</Badge>
            <h2 className="mt-4 text-2xl font-semibold text-ink">Schedule, update, and manage all appointments.</h2>
            <p className="mt-2 text-sm leading-7 text-muted">Create new appointments, change status, reschedule, or remove cancelled visits from the system.</p>
          </div>
          <Button onClick={openCreate} size="sm">
            <Plus className="h-4 w-4" />
            Add appointment
          </Button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-4">
          <div className="rounded-[22px] border border-border/80 bg-white/85 p-4 shadow-soft">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary-deep" />
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-deep">Total</p>
            </div>
            <p className="mt-2 text-3xl font-semibold text-ink">{appointments.length}</p>
          </div>
          <div className="rounded-[22px] border border-border/80 bg-white/85 p-4 shadow-soft">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-600" />
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-600">Pending</p>
            </div>
            <p className="mt-2 text-3xl font-semibold text-amber-700">{pendingCount}</p>
          </div>
          <div className="rounded-[22px] border border-border/80 bg-white/85 p-4 shadow-soft">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600">Confirmed</p>
            </div>
            <p className="mt-2 text-3xl font-semibold text-emerald-700">{confirmedCount}</p>
          </div>
          <div className="rounded-[22px] border border-border/80 bg-white/85 p-4 shadow-soft">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-blue-600" />
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">Completed</p>
            </div>
            <p className="mt-2 text-3xl font-semibold text-blue-700">{completedCount}</p>
          </div>
        </div>
      </Card>

      {/* Create Form */}
      {showForm && (
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary-deep">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink">New appointment</h3>
                <p className="text-sm text-muted">Schedule a visit between a patient and provider.</p>
              </div>
            </div>
            <Button onClick={() => setShowForm(false)} size="sm" variant="ghost"><X className="h-4 w-4" /></Button>
          </div>

          <form ref={formRef} className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={handleCreate}>
            <label className="space-y-1.5">
              <span className="text-sm font-medium text-ink">Patient</span>
              <Select defaultValue="" name="patient_id" required>
                <option value="" disabled>Select patient</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>{p.user?.full_name ?? p.user?.email ?? "Patient"}</option>
                ))}
              </Select>
            </label>
            <label className="space-y-1.5">
              <span className="text-sm font-medium text-ink">Provider</span>
              <Select defaultValue="" name="provider_id" required>
                <option value="" disabled>Select provider</option>
                {providers.map((p) => (
                  <option key={p.id} value={p.id}>{p.user?.full_name ?? p.user?.email ?? "Provider"}</option>
                ))}
              </Select>
            </label>
            <label className="space-y-1.5">
              <span className="text-sm font-medium text-ink">Scheduled time</span>
              <Input name="scheduled_at" required type="datetime-local" />
            </label>
            <label className="space-y-1.5">
              <span className="text-sm font-medium text-ink">Status</span>
              <Select defaultValue="pending" name="status">
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </Select>
            </label>
            <div className="sm:col-span-2">
              <label className="space-y-1.5">
                <span className="text-sm font-medium text-ink">Reason</span>
                <Input name="reason" placeholder="e.g. General consultation, Follow-up visit" />
              </label>
            </div>
            {error && !editingAppointment && <p className="text-sm text-danger sm:col-span-2">{error}</p>}
            <div className="flex gap-3 sm:col-span-2">
              <Button disabled={loading} type="submit">{loading ? "Creating..." : "Create appointment"}</Button>
              <Button onClick={() => setShowForm(false)} type="button" variant="ghost">Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Edit Form — separate card, not inline */}
      {editingAppointment && (
        <Card className="border-primary/20 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <SquarePen className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink">Manage appointment</h3>
                <p className="text-sm text-muted">
                  {patientMap.get(editingAppointment.patient_id) ?? "Patient"} with {providerMap.get(editingAppointment.provider_id) ?? "Provider"}
                  {" — "}{editingAppointment.reason ?? "General consultation"}
                </p>
              </div>
            </div>
            <Button onClick={() => setEditingAppointment(null)} size="sm" variant="ghost"><X className="h-4 w-4" /></Button>
          </div>

          <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={handleUpdate}>
            <label className="space-y-1.5">
              <span className="text-sm font-medium text-ink">Reschedule time</span>
              <Input defaultValue={toLocalInputValue(editingAppointment.scheduled_at)} name="scheduled_at" required type="datetime-local" />
            </label>
            <label className="space-y-1.5">
              <span className="text-sm font-medium text-ink">Status</span>
              <Select defaultValue={editingAppointment.status} name="status">
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </Select>
            </label>

            <div className="sm:col-span-2 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-surface-muted p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">Patient</p>
                <div className="mt-1 flex items-center gap-2">
                  <Avatar className="h-6 w-6" name={patientMap.get(editingAppointment.patient_id)} />
                  <p className="text-sm font-medium text-ink">{patientMap.get(editingAppointment.patient_id) ?? "Unknown"}</p>
                </div>
              </div>
              <div className="rounded-xl bg-surface-muted p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">Provider</p>
                <div className="mt-1 flex items-center gap-2">
                  <Avatar className="h-6 w-6" name={providerMap.get(editingAppointment.provider_id)} />
                  <p className="text-sm font-medium text-ink">{providerMap.get(editingAppointment.provider_id) ?? "Unknown"}</p>
                </div>
              </div>
              <div className="rounded-xl bg-surface-muted p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">Video link</p>
                <p className="mt-1 truncate text-sm text-muted">{editingAppointment.video_link ?? "None"}</p>
              </div>
            </div>

            {error && editingAppointment && <p className="text-sm text-danger sm:col-span-2">{error}</p>}

            <div className="flex gap-3 sm:col-span-2">
              <Button disabled={busyId === editingAppointment.id} type="submit">
                {busyId === editingAppointment.id ? "Saving..." : "Save changes"}
              </Button>
              <Button
                disabled={busyId === editingAppointment.id}
                onClick={() => handleDelete(editingAppointment.id)}
                type="button"
                variant="danger"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete appointment
              </Button>
              <Button onClick={() => setEditingAppointment(null)} type="button" variant="ghost">Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Appointment Table — clean, no inline editing */}
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-4">
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              className="pl-9"
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by patient, provider, reason, or status..."
              type="search"
              value={query}
            />
          </div>
          <div className="flex items-center gap-3">
            <Badge>{filtered.length} of {appointments.length}</Badge>
          </div>
        </div>

        {filtered.length === 0 && query.trim() === "" ? (
          <div className="p-6">
            <EmptyState description="No appointments have been created yet. Click 'Add appointment' above to schedule the first visit." title="No appointments found" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm font-medium text-ink">No appointments match &ldquo;{query}&rdquo;</p>
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
                    <th className="px-6 py-3.5 font-semibold">Scheduled</th>
                    <th className="px-6 py-3.5 font-semibold">Reason</th>
                    <th className="px-6 py-3.5 font-semibold">Status</th>
                    <th className="px-6 py-3.5 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-white">
                  {filtered.map((appointment) => (
                    <tr
                      key={appointment.id}
                      className={`align-middle transition-colors hover:bg-surface-muted/50 ${editingAppointment?.id === appointment.id ? "bg-primary-soft/30" : ""}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex min-w-[180px] items-center gap-3">
                          <Avatar className="h-9 w-9 shrink-0" name={patientMap.get(appointment.patient_id)} />
                          <span className="truncate font-medium text-ink">{patientMap.get(appointment.patient_id) ?? "Unknown"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex min-w-[180px] items-center gap-3">
                          <Avatar className="h-9 w-9 shrink-0" name={providerMap.get(appointment.provider_id)} />
                          <span className="truncate font-medium text-ink">{providerMap.get(appointment.provider_id) ?? "Unknown"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted">{format(new Date(appointment.scheduled_at), "MMM d, yyyy h:mm a")}</td>
                      <td className="max-w-[200px] truncate px-6 py-4 text-muted">{appointment.reason ?? "General consultation"}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex rounded-lg border px-2.5 py-1 text-xs font-semibold capitalize ${statusStyles[appointment.status] ?? ""}`}>
                          {appointment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button onClick={() => openEdit(appointment)} size="sm" variant="secondary">
                            <SquarePen className="h-3.5 w-3.5" />
                            Manage
                          </Button>
                          <Button disabled={busyId === appointment.id} onClick={() => handleDelete(appointment.id)} size="sm" variant="danger">
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
              {filtered.map((appointment) => (
                <div
                  key={appointment.id}
                  className={`rounded-[22px] border p-4 ${editingAppointment?.id === appointment.id ? "border-primary/30 bg-primary-soft/20" : "border-border/80 bg-white shadow-soft transition-shadow hover:shadow-card"}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-ink">{format(new Date(appointment.scheduled_at), "EEE, MMM d - h:mm a")}</p>
                      <p className="mt-1 text-sm text-muted">{appointment.reason ?? "General consultation"}</p>
                    </div>
                    <span className={`shrink-0 rounded-lg border px-2.5 py-1 text-xs font-semibold capitalize ${statusStyles[appointment.status] ?? ""}`}>
                      {appointment.status}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-deep">Patient</p>
                      <div className="mt-1 flex items-center gap-2">
                        <Avatar className="h-6 w-6" name={patientMap.get(appointment.patient_id)} />
                        <p className="text-sm text-ink">{patientMap.get(appointment.patient_id) ?? "Unknown"}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-deep">Provider</p>
                      <div className="mt-1 flex items-center gap-2">
                        <Avatar className="h-6 w-6" name={providerMap.get(appointment.provider_id)} />
                        <p className="text-sm text-ink">{providerMap.get(appointment.provider_id) ?? "Unknown"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <Button className="flex-1" onClick={() => openEdit(appointment)} size="sm" variant="secondary">
                      <SquarePen className="h-3.5 w-3.5" />
                      Manage
                    </Button>
                    <Button disabled={busyId === appointment.id} onClick={() => handleDelete(appointment.id)} size="sm" variant="danger">
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
