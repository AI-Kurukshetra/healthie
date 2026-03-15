"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useState } from "react";
import { format } from "date-fns";
import { ArrowLeft, CalendarDays, Clock, FileText, Trash2, Video } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import type { Appointment, Patient, Provider } from "@/types/domain";

const statusStyles: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  completed: "bg-slate-100 text-slate-600 border-slate-200",
  cancelled: "bg-red-50 text-red-600 border-red-200",
};

export function AdminAppointmentEditor({
  mode,
  appointment,
  patients,
  providers,
}: {
  mode: "create" | "edit";
  appointment?: Appointment;
  patients: Patient[];
  providers: Provider[];
}) {
  const { success: toastSuccess, error: toastError } = useToast();
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isReadonly = mode === "edit" && (appointment?.status === "completed" || appointment?.status === "cancelled");

  const defaultScheduledAt = appointment?.scheduled_at
    ? format(new Date(appointment.scheduled_at), "yyyy-MM-dd'T'HH:mm")
    : "";

  const patientName = patients.find((p) => p.id === appointment?.patient_id)?.user?.full_name
    ?? patients.find((p) => p.id === appointment?.patient_id)?.user?.email
    ?? "Unknown";

  const provider = providers.find((p) => p.id === appointment?.provider_id);
  const providerName = provider?.user?.full_name ?? provider?.user?.email ?? "Unknown";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isReadonly) return;
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const payload = {
      patient_id: String(formData.get("patient_id") ?? ""),
      provider_id: String(formData.get("provider_id") ?? ""),
      scheduled_at: new Date(String(formData.get("scheduled_at") ?? "")).toISOString(),
      status: String(formData.get("status") ?? "pending"),
      reason: String(formData.get("reason") ?? "").trim() || null,
    };

    try {
      const url = mode === "create" ? "/api/appointments" : `/api/appointments/${appointment!.id}`;
      const response = await fetch(url, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => null);
      if (!response.ok) {
        const msg = result?.error ?? `Unable to ${mode === "create" ? "create" : "update"} appointment.`;
        setError(msg);
        toastError(msg);
        setLoading(false);
        return;
      }

      toastSuccess(mode === "create" ? "Appointment created successfully." : "Appointment updated successfully.");
      window.location.href = "/admin/appointments";
    } catch {
      const msg = "Network error. Please check your connection and try again.";
      setError(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!appointment || isReadonly) return;

    if (!window.confirm("Delete this appointment? This action cannot be undone.")) return;

    setDeleteLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/appointments/${appointment.id}`, {
        method: "DELETE",
      });

      const result = await response.json().catch(() => null);
      if (!response.ok) {
        const msg = result?.error ?? "Unable to delete appointment.";
        setError(msg);
        toastError(msg);
        setDeleteLoading(false);
        return;
      }

      toastSuccess("Appointment deleted.");
      window.location.href = "/admin/appointments";
    } catch {
      const msg = "Network error. Please check your connection and try again.";
      setError(msg);
      toastError(msg);
    } finally {
      setDeleteLoading(false);
    }
  }

  // ---- Read-only view for completed/cancelled appointments ----
  if (isReadonly && appointment) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <Card className="overflow-hidden border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.98)_0%,rgba(236,245,255,0.98)_100%)] p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3">
                <Badge>Appointment details</Badge>
                <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${statusStyles[appointment.status] ?? ""}`}>
                  {appointment.status}
                </span>
              </div>
              <h2 className="mt-4 text-2xl font-semibold text-ink">View appointment</h2>
              <p className="mt-2 text-sm leading-7 text-muted">
                This appointment is {appointment.status} and cannot be modified.
              </p>
            </div>
            <Link className={buttonVariants({ variant: "secondary", size: "sm" })} href="/admin/appointments">
              <ArrowLeft className="h-4 w-4" />
              Back to appointments
            </Link>
          </div>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          {/* Left column */}
          <div className="space-y-6">
            {/* Participants */}
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary-deep">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-ink">Participants</h3>
                  <p className="text-sm text-muted">Patient and provider for this visit.</p>
                </div>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-surface-muted p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">Patient</p>
                  <div className="mt-2 flex items-center gap-3">
                    <Avatar className="h-9 w-9" name={patientName} />
                    <p className="font-medium text-ink">{patientName}</p>
                  </div>
                </div>
                <div className="rounded-xl bg-surface-muted p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">Provider</p>
                  <div className="mt-2 flex items-center gap-3">
                    <Avatar className="h-9 w-9" name={providerName} />
                    <div>
                      <p className="font-medium text-ink">{providerName}</p>
                      {provider?.specialty && <p className="text-xs text-muted">{provider.specialty}</p>}
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Schedule */}
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-ink">Schedule</h3>
                  <p className="text-sm text-muted">When this appointment was scheduled.</p>
                </div>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-surface-muted p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">Date & time</p>
                  <p className="mt-2 text-base font-semibold text-ink">
                    {format(new Date(appointment.scheduled_at), "EEEE, MMM d, yyyy")}
                  </p>
                  <p className="mt-0.5 text-sm text-muted">
                    {format(new Date(appointment.scheduled_at), "h:mm a")}
                  </p>
                </div>
                <div className="rounded-xl bg-surface-muted p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">Status</p>
                  <div className="mt-2">
                    <span className={`inline-flex rounded-full border px-3 py-1 text-sm font-semibold capitalize ${statusStyles[appointment.status] ?? ""}`}>
                      {appointment.status}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Reason */}
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-ink">Reason</h3>
                  <p className="text-sm text-muted">Why this visit was scheduled.</p>
                </div>
              </div>
              <div className="mt-5 rounded-xl bg-surface-muted p-4">
                <p className="text-sm leading-7 text-ink">
                  {appointment.reason || "No reason provided."}
                </p>
              </div>
            </Card>

            {/* Visit info */}
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Video className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-ink">Visit info</h3>
                  <p className="text-sm text-muted">Telehealth and metadata.</p>
                </div>
              </div>
              <div className="mt-5 space-y-3">
                <div className="rounded-xl bg-surface-muted p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">Video link</p>
                  <p className="mt-2 truncate text-sm text-ink">{appointment.video_link ?? "None"}</p>
                </div>
                <div className="rounded-xl bg-surface-muted p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">Created</p>
                  <p className="mt-2 text-sm text-ink">{format(new Date(appointment.created_at), "MMM d, yyyy h:mm a")}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Back button only — no edit/delete */}
        <Card className="p-6">
          <Link className={buttonVariants({ variant: "secondary" })} href="/admin/appointments">
            <ArrowLeft className="h-4 w-4" />
            Back to appointments
          </Link>
        </Card>
      </div>
    );
  }

  // ---- Editable form for pending/confirmed appointments ----
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="overflow-hidden border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.98)_0%,rgba(236,245,255,0.98)_100%)] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3">
              <Badge>{mode === "create" ? "New appointment" : "Edit appointment"}</Badge>
              {mode === "edit" && appointment && (
                <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${statusStyles[appointment.status] ?? ""}`}>
                  {appointment.status}
                </span>
              )}
            </div>
            <h2 className="mt-4 text-2xl font-semibold text-ink">
              {mode === "create" ? "Schedule appointment" : "Edit appointment"}
            </h2>
            <p className="mt-2 text-sm leading-7 text-muted">
              {mode === "create"
                ? "Fill out the sections below to schedule a new appointment."
                : "Update appointment details, participants, and scheduling."}
            </p>
          </div>
          <Link className={buttonVariants({ variant: "secondary", size: "sm" })} href="/admin/appointments">
            <ArrowLeft className="h-4 w-4" />
            Back to appointments
          </Link>
        </div>
      </Card>

      <form className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]" id="appointment-form" onSubmit={handleSubmit}>
        {/* Left column */}
        <div className="space-y-6">
          {/* Participants */}
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary-deep">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink">Participants</h3>
                <p className="text-sm text-muted">Select the patient and provider for this appointment.</p>
              </div>
            </div>
            <div className="mt-5 space-y-4">
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-ink">Patient</span>
                <select
                  className="flex h-10 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-ink shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  defaultValue={appointment?.patient_id ?? ""}
                  name="patient_id"
                  required
                >
                  <option value="">Select a patient...</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.user?.full_name ?? p.user?.email ?? p.id}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-ink">Provider</span>
                <select
                  className="flex h-10 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-ink shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  defaultValue={appointment?.provider_id ?? ""}
                  name="provider_id"
                  required
                >
                  <option value="">Select a provider...</option>
                  {providers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.user?.full_name ?? p.user?.email ?? p.id}{p.specialty ? ` — ${p.specialty}` : ""}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </Card>

          {/* Schedule */}
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink">Schedule</h3>
                <p className="text-sm text-muted">Set the date, time, and current status.</p>
              </div>
            </div>
            <div className="mt-5 space-y-4">
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-ink">Date &amp; time</span>
                <Input
                  defaultValue={defaultScheduledAt}
                  name="scheduled_at"
                  required
                  type="datetime-local"
                />
              </label>
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-ink">Status</span>
                <select
                  className="flex h-10 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-ink shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  defaultValue={appointment?.status ?? "pending"}
                  name="status"
                  required
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </label>
            </div>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Details */}
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink">Details</h3>
                <p className="text-sm text-muted">Reason for the visit and additional notes.</p>
              </div>
            </div>
            <div className="mt-5">
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-ink">Reason</span>
                <Textarea
                  defaultValue={appointment?.reason ?? ""}
                  name="reason"
                  placeholder="Describe the reason for this appointment..."
                  rows={4}
                />
              </label>
            </div>
          </Card>

          {/* Visit info — edit mode only */}
          {mode === "edit" && appointment && (
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Video className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-ink">Visit info</h3>
                  <p className="text-sm text-muted">Read-only telehealth and metadata.</p>
                </div>
              </div>
              <div className="mt-5 space-y-4">
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-ink">Video link</span>
                  <Input
                    defaultValue={appointment.video_link ?? ""}
                    readOnly
                    type="url"
                  />
                  <p className="text-xs text-muted">Auto-generated for telehealth visits. Cannot be edited manually.</p>
                </label>
                <div>
                  <p className="text-sm font-medium text-ink">Created</p>
                  <p className="mt-1 text-sm text-muted">{format(new Date(appointment.created_at), "MMM d, yyyy h:mm a")}</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </form>

      {/* Actions — outside the form */}
      <Card className="p-6">
        {error && <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-danger">{error}</p>}
        <div className="flex flex-wrap gap-3">
          <Button className="flex-1 sm:flex-none" disabled={loading} form="appointment-form" type="submit">
            {loading ? (mode === "create" ? "Creating..." : "Saving...") : mode === "create" ? "Create appointment" : "Save changes"}
          </Button>
          {mode === "edit" && (
            <Button disabled={deleteLoading} onClick={handleDelete} variant="danger">
              <Trash2 className="h-4 w-4" />
              {deleteLoading ? "Deleting..." : "Delete appointment"}
            </Button>
          )}
          <Link className={buttonVariants({ variant: "ghost" })} href="/admin/appointments">
            Cancel
          </Link>
        </div>
      </Card>
    </div>
  );
}
