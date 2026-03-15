"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useRef, useState } from "react";
import { ArrowLeft, ClipboardList, ExternalLink, FileText, HeartPulse, Paperclip, Stethoscope, Trash2, Upload } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import type { MedicalRecord, Patient, Provider } from "@/types/domain";

type RecordWithUrl = MedicalRecord & { documentUrl?: string | null };

export function AdminMedicalRecordEditor({
  mode,
  record,
  patients,
  providers
}: {
  mode: "create" | "edit";
  record?: RecordWithUrl;
  patients: Patient[];
  providers: Provider[];
}) {
  const { success: toastSuccess, error: toastError } = useToast();
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const file = formData.get("document") as File | null;
    const hasFile = file && file.size > 0;

    try {
      let response: Response;

      if (mode === "create") {
        // Create always uses FormData (supports file upload)
        // The API's parseMedicalRecordRequest handles multipart
        response = await fetch("/api/records", {
          method: "POST",
          body: formData,
        });
      } else {
        // Update uses JSON (file replacement not supported on edit yet)
        const payload = {
          type: "medical_record",
          id: record?.id,
          patient_id: String(formData.get("patient_id") ?? "").trim(),
          provider_id: String(formData.get("provider_id") ?? "").trim() || null,
          diagnosis: String(formData.get("diagnosis") ?? "").trim(),
          notes: String(formData.get("notes") ?? "").trim(),
          treatment_plan: String(formData.get("treatment_plan") ?? "").trim() || null,
          document_path: record?.document_path ?? null,
        };

        response = await fetch("/api/records", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const result = await response.json().catch(() => null);
      if (!response.ok) {
        const msg = result?.error ?? `Unable to ${mode === "create" ? "create" : "update"} record.`;
        setError(msg);
        toastError(msg);
        setLoading(false);
        return;
      }

      toastSuccess(
        mode === "create"
          ? `Medical record created${hasFile ? " with document." : "."}`
          : "Medical record updated."
      );
      window.location.href = "/admin/records";
    } catch {
      const msg = "Network error. Please check your connection and try again.";
      setError(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!record) return;

    if (!window.confirm("Delete this medical record? This action cannot be undone.")) return;

    setDeleteLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/records", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "medical_record", id: record.id }),
      });

      const result = await response.json().catch(() => null);
      if (!response.ok) {
        const msg = result?.error ?? "Unable to delete record.";
        setError(msg);
        toastError(msg);
        setDeleteLoading(false);
        return;
      }

      toastSuccess("Medical record deleted.");
      window.location.href = "/admin/records";
    } catch {
      const msg = "Network error. Please check your connection and try again.";
      setError(msg);
      toastError(msg);
    } finally {
      setDeleteLoading(false);
    }
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setFileName(file ? file.name : null);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="overflow-hidden border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.98)_0%,rgba(236,245,255,0.98)_100%)] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3">
              <Badge>{mode === "create" ? "New record" : "Edit record"}</Badge>
              {mode === "edit" && <Badge className="bg-white">{record?.diagnosis ?? "Record"}</Badge>}
            </div>
            <h2 className="mt-4 text-2xl font-semibold text-ink">
              {mode === "create" ? "Create medical record" : "Edit medical record"}
            </h2>
            <p className="mt-2 text-sm leading-7 text-muted">
              {mode === "create"
                ? "Fill out the sections below to create a new medical record with optional document attachment."
                : "Update the medical record details below."}
            </p>
          </div>
          <Link className={buttonVariants({ variant: "secondary", size: "sm" })} href="/admin/records">
            <ArrowLeft className="h-4 w-4" />
            Back to records
          </Link>
        </div>
      </Card>

      <form className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]" id="record-form" onSubmit={handleSubmit}>
        {/* Left column */}
        <div className="space-y-6">
          {/* Patient & Provider */}
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary-deep">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink">Patient & Provider</h3>
                <p className="text-sm text-muted">Select the patient and optionally a provider.</p>
              </div>
            </div>
            <div className="mt-5 space-y-4">
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-ink">Patient</span>
                <Select defaultValue={record?.patient_id ?? ""} name="patient_id" required>
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
                <Select defaultValue={record?.provider_id ?? ""} name="provider_id">
                  <option value="">No provider</option>
                  {providers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.user?.full_name ?? p.user?.email ?? p.id}
                    </option>
                  ))}
                </Select>
              </label>
            </div>
          </Card>

          {/* Diagnosis */}
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Stethoscope className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink">Diagnosis</h3>
                <p className="text-sm text-muted">Primary diagnosis for this record.</p>
              </div>
            </div>
            <div className="mt-5">
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-ink">Diagnosis</span>
                <Input defaultValue={record?.diagnosis ?? ""} name="diagnosis" placeholder="e.g. Type 2 Diabetes Mellitus" required />
              </label>
            </div>
          </Card>

          {/* Document upload */}
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <Paperclip className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink">Document</h3>
                <p className="text-sm text-muted">
                  {mode === "create"
                    ? "Attach a supporting document (PDF, image)."
                    : "Current document attachment."}
                </p>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {/* Existing document link (edit mode) */}
              {mode === "edit" && record?.documentUrl && (
                <div className="flex items-center gap-3 rounded-xl bg-surface-muted p-4">
                  <FileText className="h-5 w-5 shrink-0 text-primary-deep" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink">Current document</p>
                    <p className="mt-0.5 truncate text-xs text-muted">{record.document_path}</p>
                  </div>
                  <a
                    className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-primary-deep hover:underline"
                    href={record.documentUrl}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    View
                  </a>
                </div>
              )}

              {mode === "edit" && !record?.documentUrl && !record?.document_path && (
                <div className="rounded-xl border border-dashed border-border p-4 text-center text-sm text-muted">
                  No document attached to this record.
                </div>
              )}

              {/* File upload (create mode) */}
              {mode === "create" && (
                <div
                  className="group relative cursor-pointer rounded-xl border-2 border-dashed border-border p-6 text-center transition-colors hover:border-primary/40 hover:bg-primary-soft/10"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    accept=".pdf,.png,.jpg,.jpeg,.webp"
                    className="hidden"
                    name="document"
                    onChange={handleFileChange}
                    type="file"
                  />
                  <Upload className="mx-auto h-8 w-8 text-muted transition-colors group-hover:text-primary" />
                  {fileName ? (
                    <>
                      <p className="mt-3 text-sm font-medium text-ink">{fileName}</p>
                      <p className="mt-1 text-xs text-muted">Click to change file</p>
                    </>
                  ) : (
                    <>
                      <p className="mt-3 text-sm font-medium text-ink">Click to upload a document</p>
                      <p className="mt-1 text-xs text-muted">PDF, PNG, JPG, or WebP</p>
                    </>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Clinical Notes */}
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <ClipboardList className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink">Clinical Notes</h3>
                <p className="text-sm text-muted">Detailed notes about the patient condition.</p>
              </div>
            </div>
            <div className="mt-5">
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-ink">Notes</span>
                <Textarea defaultValue={record?.notes ?? ""} name="notes" placeholder="Clinical observations, symptoms, findings..." required rows={4} />
              </label>
            </div>
          </Card>

          {/* Treatment Plan */}
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <HeartPulse className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink">Treatment Plan</h3>
                <p className="text-sm text-muted">Prescribed treatment and follow-up plan.</p>
              </div>
            </div>
            <div className="mt-5">
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-ink">Treatment plan</span>
                <Textarea defaultValue={record?.treatment_plan ?? ""} name="treatment_plan" placeholder="Medication, therapy, follow-up schedule..." rows={3} />
              </label>
            </div>
          </Card>
        </div>
      </form>

      {/* Actions — outside the form */}
      <Card className="p-6">
        {error && <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-danger">{error}</p>}
        <div className="flex flex-wrap gap-3">
          <Button className="flex-1 sm:flex-none" disabled={loading} form="record-form" type="submit">
            {loading ? (mode === "create" ? "Creating..." : "Saving...") : mode === "create" ? "Create record" : "Save changes"}
          </Button>
          {mode === "edit" && (
            <Button disabled={deleteLoading} onClick={handleDelete} variant="danger">
              <Trash2 className="h-4 w-4" />
              {deleteLoading ? "Deleting..." : "Delete record"}
            </Button>
          )}
          <Link className={buttonVariants({ variant: "ghost" })} href="/admin/records">
            Cancel
          </Link>
        </div>
      </Card>
    </div>
  );
}
