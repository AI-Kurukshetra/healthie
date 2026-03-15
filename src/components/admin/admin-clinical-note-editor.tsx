"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useState } from "react";
import { format } from "date-fns";
import { ArrowLeft, ClipboardList, Eye, Stethoscope, Trash2, User } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import type { Appointment, ClinicalNote, Patient, Provider } from "@/types/domain";

export function AdminClinicalNoteEditor({
  mode,
  note,
  appointments,
  patients,
  providers
}: {
  mode: "create" | "edit";
  note?: ClinicalNote;
  appointments: Appointment[];
  patients: Patient[];
  providers: Provider[];
}) {
  const { success: toastSuccess, error: toastError } = useToast();
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function appointmentLabel(id: string) {
    const apt = appointments.find((a) => a.id === id);
    if (!apt) return id.slice(0, 8);
    return `${format(new Date(apt.scheduled_at), "MMM d, h:mm a")} — ${apt.reason ?? "Consultation"}`;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const payload = {
      type: "clinical_note" as const,
      ...(mode === "edit" && note ? { id: note.id } : {}),
      appointment_id: String(formData.get("appointment_id") ?? ""),
      patient_id: String(formData.get("patient_id") ?? ""),
      provider_id: String(formData.get("provider_id") ?? ""),
      subjective: String(formData.get("subjective") ?? "").trim(),
      objective: String(formData.get("objective") ?? "").trim(),
      assessment: String(formData.get("assessment") ?? "").trim(),
      plan: String(formData.get("plan") ?? "").trim()
    };

    try {
      const response = await fetch("/api/records", {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await response.json().catch(() => null);
      if (!response.ok) {
        const msg = result?.error ?? `Unable to ${mode === "create" ? "create" : "update"} note.`;
        setError(msg);
        toastError(msg);
        setLoading(false);
        return;
      }

      toastSuccess(mode === "create" ? "Clinical note created successfully." : "Clinical note updated successfully.");
      window.location.href = "/admin/notes";
    } catch {
      const msg = "Network error. Please check your connection and try again.";
      setError(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!note) return;
    if (!window.confirm("Delete this clinical note? This action cannot be undone.")) return;

    setDeleteLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/records", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "clinical_note", id: note.id })
      });

      const result = await response.json().catch(() => null);
      if (!response.ok) {
        const msg = result?.error ?? "Unable to delete note.";
        setError(msg);
        toastError(msg);
        setDeleteLoading(false);
        return;
      }

      toastSuccess("Clinical note deleted.");
      window.location.href = "/admin/notes";
    } catch {
      const msg = "Network error. Please check your connection and try again.";
      setError(msg);
      toastError(msg);
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="overflow-hidden border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.98)_0%,rgba(236,245,255,0.98)_100%)] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3">
              <Badge>{mode === "create" ? "New note" : "Edit note"}</Badge>
              {mode === "edit" && note && <Badge className="bg-white">{appointmentLabel(note.appointment_id)}</Badge>}
            </div>
            <h2 className="mt-4 text-2xl font-semibold text-ink">
              {mode === "create" ? "Create clinical note" : "Edit clinical note"}
            </h2>
            <p className="mt-2 text-sm leading-7 text-muted">
              {mode === "create"
                ? "Fill out the sections below to create a new SOAP note for a patient appointment."
                : "Update the SOAP documentation for this patient appointment."}
            </p>
          </div>
          <Link className={buttonVariants({ variant: "secondary", size: "sm" })} href="/admin/notes">
            <ArrowLeft className="h-4 w-4" />
            Back to notes
          </Link>
        </div>
      </Card>

      <form className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]" id="note-form" onSubmit={handleSubmit}>
        {/* Left column — Context & Subjective */}
        <div className="space-y-6">
          {/* Context */}
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary-deep">
                <ClipboardList className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink">Context</h3>
                <p className="text-sm text-muted">Link this note to an appointment, patient, and provider.</p>
              </div>
            </div>
            <div className="mt-5 space-y-4">
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-ink">Appointment</span>
                <Select defaultValue={note?.appointment_id ?? ""} name="appointment_id" required>
                  <option value="" disabled>Select appointment</option>
                  {appointments.map((a) => (
                    <option key={a.id} value={a.id}>{appointmentLabel(a.id)}</option>
                  ))}
                </Select>
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-ink">Patient</span>
                  <Select defaultValue={note?.patient_id ?? ""} name="patient_id" required>
                    <option value="" disabled>Select patient</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>{p.user?.full_name ?? p.user?.email ?? "Patient"}</option>
                    ))}
                  </Select>
                </label>
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-ink">Provider</span>
                  <Select defaultValue={note?.provider_id ?? ""} name="provider_id" required>
                    <option value="" disabled>Select provider</option>
                    {providers.map((p) => (
                      <option key={p.id} value={p.id}>{p.user?.full_name ?? p.user?.email ?? "Provider"}</option>
                    ))}
                  </Select>
                </label>
              </div>
            </div>
          </Card>

          {/* Subjective */}
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink">Subjective</h3>
                <p className="text-sm text-muted">Patient-reported symptoms and history.</p>
              </div>
            </div>
            <div className="mt-5">
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-ink">Subjective findings</span>
                <Textarea defaultValue={note?.subjective ?? ""} name="subjective" placeholder="Patient's reported symptoms, history of present illness..." required rows={3} />
              </label>
            </div>
          </Card>
        </div>

        {/* Right column — Objective & Assessment/Plan */}
        <div className="space-y-6">
          {/* Objective */}
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Eye className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink">Objective</h3>
                <p className="text-sm text-muted">Clinical observations and examination findings.</p>
              </div>
            </div>
            <div className="mt-5">
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-ink">Objective findings</span>
                <Textarea defaultValue={note?.objective ?? ""} name="objective" placeholder="Vital signs, physical exam findings, lab results..." required rows={3} />
              </label>
            </div>
          </Card>

          {/* Assessment & Plan */}
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Stethoscope className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink">Assessment & Plan</h3>
                <p className="text-sm text-muted">Diagnosis and treatment plan.</p>
              </div>
            </div>
            <div className="mt-5 space-y-4">
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-ink">Assessment</span>
                <Textarea defaultValue={note?.assessment ?? ""} name="assessment" placeholder="Diagnosis, differential diagnosis..." required rows={3} />
              </label>
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-ink">Plan</span>
                <Textarea defaultValue={note?.plan ?? ""} name="plan" placeholder="Treatment plan, follow-up, referrals..." required rows={3} />
              </label>
            </div>
          </Card>
        </div>
      </form>

      {/* Actions — outside the form so delete button has no form interference */}
      <Card className="p-6">
        {error && <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-danger">{error}</p>}
        <div className="flex flex-wrap gap-3">
          <Button className="flex-1 sm:flex-none" disabled={loading} form="note-form" type="submit">
            {loading ? (mode === "create" ? "Creating..." : "Saving...") : mode === "create" ? "Create note" : "Save changes"}
          </Button>
          {mode === "edit" && (
            <Button disabled={deleteLoading} onClick={handleDelete} variant="danger">
              <Trash2 className="h-4 w-4" />
              {deleteLoading ? "Deleting..." : "Delete note"}
            </Button>
          )}
          <Link className={buttonVariants({ variant: "ghost" })} href="/admin/notes">
            Cancel
          </Link>
        </div>
      </Card>
    </div>
  );
}
