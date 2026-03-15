"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useState } from "react";
import { ArrowLeft, FileText, Pill, Stethoscope, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import type { Patient, Prescription, Provider } from "@/types/domain";

export function AdminPrescriptionEditor({
  mode,
  prescription,
  patients,
  providers
}: {
  mode: "create" | "edit";
  prescription?: Prescription;
  patients: Patient[];
  providers: Provider[];
}) {
  const { success: toastSuccess, error: toastError } = useToast();
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const payload =
      mode === "create"
        ? {
            patient_id: String(formData.get("patient_id") ?? ""),
            provider_id: String(formData.get("provider_id") ?? ""),
            medication_name: String(formData.get("medication_name") ?? "").trim(),
            dosage: String(formData.get("dosage") ?? "").trim(),
            instructions: String(formData.get("instructions") ?? "").trim(),
            duration: String(formData.get("duration") ?? "").trim()
          }
        : {
            id: prescription?.id,
            patient_id: String(formData.get("patient_id") ?? ""),
            provider_id: String(formData.get("provider_id") ?? ""),
            medication_name: String(formData.get("medication_name") ?? "").trim(),
            dosage: String(formData.get("dosage") ?? "").trim(),
            instructions: String(formData.get("instructions") ?? "").trim(),
            duration: String(formData.get("duration") ?? "").trim()
          };

    try {
      const response = await fetch("/api/prescriptions", {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await response.json().catch(() => null);
      if (!response.ok) {
        const msg = result?.error ?? `Unable to ${mode === "create" ? "create" : "update"} prescription.`;
        setError(msg);
        toastError(msg);
        setLoading(false);
        return;
      }

      toastSuccess(mode === "create" ? "Prescription created successfully." : "Prescription updated successfully.");
      window.location.href = "/admin/prescriptions";
    } catch {
      const msg = "Network error. Please check your connection and try again.";
      setError(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!prescription) {
      return;
    }

    if (!window.confirm("Delete this prescription? This action cannot be undone.")) {
      return;
    }

    setDeleteLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/prescriptions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: prescription.id })
      });

      const result = await response.json().catch(() => null);
      if (!response.ok) {
        const msg = result?.error ?? "Unable to delete prescription.";
        setError(msg);
        toastError(msg);
        setDeleteLoading(false);
        return;
      }

      toastSuccess("Prescription deleted.");
      window.location.href = "/admin/prescriptions";
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
              <Badge>{mode === "create" ? "New prescription" : "Edit prescription"}</Badge>
              {mode === "edit" && <Badge className="bg-white">{prescription?.medication_name ?? "Prescription"}</Badge>}
            </div>
            <h2 className="mt-4 text-2xl font-semibold text-ink">
              {mode === "create" ? "Create prescription" : `Edit prescription`}
            </h2>
            <p className="mt-2 text-sm leading-7 text-muted">
              {mode === "create"
                ? "Fill out the sections below to create a new prescription."
                : "Update the prescription details below."}
            </p>
          </div>
          <Link className={buttonVariants({ variant: "secondary", size: "sm" })} href="/admin/prescriptions">
            <ArrowLeft className="h-4 w-4" />
            Back to prescriptions
          </Link>
        </div>
      </Card>

      <form className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]" id="prescription-form" onSubmit={handleSubmit}>
        {/* Left column */}
        <div className="space-y-6">
          {/* Participants */}
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary-deep">
                <Pill className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink">Participants</h3>
                <p className="text-sm text-muted">Select the patient and prescribing provider.</p>
              </div>
            </div>
            <div className="mt-5 space-y-4">
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-ink">Patient</span>
                <Select defaultValue={prescription?.patient_id ?? ""} name="patient_id" required>
                  <option value="">Select a patient...</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.user?.full_name ?? p.user?.email ?? p.id}
                    </option>
                  ))}
                </Select>
              </label>
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-ink">Provider</span>
                <Select defaultValue={prescription?.provider_id ?? ""} name="provider_id" required>
                  <option value="">Select a provider...</option>
                  {providers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.user?.full_name ?? p.user?.email ?? p.id}
                    </option>
                  ))}
                </Select>
              </label>
            </div>
          </Card>

          {/* Medication */}
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Stethoscope className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink">Medication</h3>
                <p className="text-sm text-muted">Name and dosage of the prescribed medication.</p>
              </div>
            </div>
            <div className="mt-5 space-y-4">
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-ink">Medication name</span>
                <Input defaultValue={prescription?.medication_name ?? ""} name="medication_name" placeholder="e.g. Amoxicillin" required />
              </label>
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-ink">Dosage</span>
                <Input defaultValue={prescription?.dosage ?? ""} name="dosage" placeholder="e.g. 500mg twice daily" required />
              </label>
            </div>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Instructions */}
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink">Instructions</h3>
                <p className="text-sm text-muted">Usage instructions and prescription duration.</p>
              </div>
            </div>
            <div className="mt-5 space-y-4">
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-ink">Instructions</span>
                <Textarea defaultValue={prescription?.instructions ?? ""} name="instructions" placeholder="Take with food. Avoid alcohol." required rows={4} />
              </label>
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-ink">Duration</span>
                <Input defaultValue={prescription?.duration ?? ""} name="duration" placeholder="e.g. 14 days" required />
              </label>
            </div>
          </Card>
        </div>
      </form>

      {/* Actions — outside the form so delete button has no form interference */}
      <Card className="p-6">
        {error && <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-danger">{error}</p>}
        <div className="flex flex-wrap gap-3">
          <Button className="flex-1 sm:flex-none" disabled={loading} form="prescription-form" type="submit">
            {loading ? (mode === "create" ? "Creating..." : "Saving...") : mode === "create" ? "Create prescription" : "Save changes"}
          </Button>
          {mode === "edit" && (
            <Button disabled={deleteLoading} onClick={handleDelete} variant="danger">
              <Trash2 className="h-4 w-4" />
              {deleteLoading ? "Deleting..." : "Delete prescription"}
            </Button>
          )}
          <Link className={buttonVariants({ variant: "ghost" })} href="/admin/prescriptions">
            Cancel
          </Link>
        </div>
      </Card>
    </div>
  );
}
