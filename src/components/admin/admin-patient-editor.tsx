"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useState } from "react";
import { ArrowLeft, Shield, Trash2, User, Heart, CreditCard } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import type { AdminPatientRecord } from "@/components/admin/admin-patient-types";

export function AdminPatientEditor({
  mode,
  patient
}: {
  mode: "create" | "edit";
  patient?: AdminPatientRecord;
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
            email: String(formData.get("email") ?? ""),
            password: String(formData.get("password") ?? ""),
            full_name: String(formData.get("full_name") ?? ""),
            date_of_birth: String(formData.get("date_of_birth") ?? "").trim() || null,
            phone: String(formData.get("phone") ?? "").trim() || null,
            emergency_contact: String(formData.get("emergency_contact") ?? "").trim() || null,
            insurance_provider: String(formData.get("insurance_provider") ?? "").trim() || null
          }
        : {
            user_id: patient?.user_id,
            full_name: String(formData.get("full_name") ?? ""),
            date_of_birth: String(formData.get("date_of_birth") ?? "").trim() || null,
            phone: String(formData.get("phone") ?? "").trim() || null,
            emergency_contact: String(formData.get("emergency_contact") ?? "").trim() || null,
            insurance_provider: String(formData.get("insurance_provider") ?? "").trim() || null
          };

    try {
      const response = await fetch("/api/patients", {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await response.json().catch(() => null);
      if (!response.ok) {
        const msg = result?.error ?? `Unable to ${mode === "create" ? "create" : "update"} patient.`;
        setError(msg);
        toastError(msg);
        setLoading(false);
        return;
      }

      toastSuccess(mode === "create" ? "Patient created successfully." : "Patient updated successfully.");
      window.location.href = "/admin/patients";
    } catch {
      const msg = "Network error. Please check your connection and try again.";
      setError(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!patient) {
      return;
    }

    if (!window.confirm("Delete this patient? This action cannot be undone.")) {
      return;
    }

    setDeleteLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/patients", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: patient.user_id })
      });

      const result = await response.json().catch(() => null);
      if (!response.ok) {
        const msg = result?.error ?? "Unable to delete patient.";
        setError(msg);
        toastError(msg);
        setDeleteLoading(false);
        return;
      }

      toastSuccess("Patient deleted.");
      window.location.href = "/admin/patients";
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
              <Badge>{mode === "create" ? "New patient" : "Edit patient"}</Badge>
              {mode === "edit" && <Badge className="bg-white">{patient?.user?.email ?? "Email unavailable"}</Badge>}
            </div>
            <h2 className="mt-4 text-2xl font-semibold text-ink">
              {mode === "create" ? "Create patient" : patient?.user?.full_name ?? "Edit patient"}
            </h2>
            <p className="mt-2 text-sm leading-7 text-muted">
              {mode === "create"
                ? "Fill out the sections below to register a new patient in the system."
                : "Update the patient's profile, contact, and insurance information."}
            </p>
          </div>
          <Link className={buttonVariants({ variant: "secondary", size: "sm" })} href="/admin/patients">
            <ArrowLeft className="h-4 w-4" />
            Back to patients
          </Link>
        </div>
      </Card>

      <form className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]" id="patient-form" onSubmit={handleSubmit}>
        {/* Left column — identity & credentials */}
        <div className="space-y-6">
          {/* Account credentials */}
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary-deep">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink">Account credentials</h3>
                <p className="text-sm text-muted">{mode === "create" ? "Set login credentials for the patient." : "Login email for this account."}</p>
              </div>
            </div>
            <div className="mt-5 space-y-4">
              {mode === "create" ? (
                <>
                  <label className="block space-y-1.5">
                    <span className="text-sm font-medium text-ink">Email address</span>
                    <Input name="email" placeholder="patient@example.com" required type="email" />
                  </label>
                  <label className="block space-y-1.5">
                    <span className="text-sm font-medium text-ink">Password</span>
                    <Input name="password" placeholder="Min 8 characters" required type="password" />
                  </label>
                </>
              ) : (
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-ink">Email address</span>
                  <Input defaultValue={patient?.user?.email ?? ""} disabled type="email" />
                  <p className="text-xs text-muted">Email cannot be changed after account creation.</p>
                </label>
              )}
            </div>
          </Card>

          {/* Personal information */}
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink">Personal information</h3>
                <p className="text-sm text-muted">Basic identity and contact details.</p>
              </div>
            </div>
            <div className="mt-5 space-y-4">
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-ink">Full name</span>
                <Input defaultValue={patient?.user?.full_name ?? ""} name="full_name" placeholder="Jane Smith" required />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-ink">Date of birth</span>
                  <Input defaultValue={patient?.date_of_birth ?? ""} name="date_of_birth" type="date" />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-ink">Phone number</span>
                  <Input defaultValue={patient?.phone ?? ""} name="phone" placeholder="+1 (555) 000-0000" />
                </label>
              </div>
            </div>
          </Card>
        </div>

        {/* Right column — emergency & insurance */}
        <div className="space-y-6">
          {/* Emergency contact */}
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500">
                <Heart className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink">Emergency contact</h3>
                <p className="text-sm text-muted">Person to contact in case of emergency.</p>
              </div>
            </div>
            <div className="mt-5">
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-ink">Emergency contact</span>
                <Input defaultValue={patient?.emergency_contact ?? ""} name="emergency_contact" placeholder="Name — Relationship — Phone" />
                <p className="text-xs text-muted">Example: Maria Smith — Mother — +1 (555) 123-4567</p>
              </label>
            </div>
          </Card>

          {/* Insurance */}
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink">Insurance details</h3>
                <p className="text-sm text-muted">Provider and plan information for billing.</p>
              </div>
            </div>
            <div className="mt-5">
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-ink">Insurance provider</span>
                <Textarea defaultValue={patient?.insurance_provider ?? ""} name="insurance_provider" placeholder="Blue Cross Blue Shield — PPO Plan — Member ID: ABC123" rows={3} />
              </label>
            </div>
          </Card>

        </div>
      </form>

      {/* Actions — outside the form so delete button has no form interference */}
      <Card className="p-6">
        {error && <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-danger">{error}</p>}
        <div className="flex flex-wrap gap-3">
          <Button className="flex-1 sm:flex-none" disabled={loading} form="patient-form" type="submit">
            {loading ? (mode === "create" ? "Creating..." : "Saving...") : mode === "create" ? "Create patient" : "Save changes"}
          </Button>
          {mode === "edit" && (
            <Button disabled={deleteLoading} onClick={handleDelete} variant="danger">
              <Trash2 className="h-4 w-4" />
              {deleteLoading ? "Deleting..." : "Delete patient"}
            </Button>
          )}
          <Link className={buttonVariants({ variant: "ghost" })} href="/admin/patients">
            Cancel
          </Link>
        </div>
      </Card>
    </div>
  );
}
