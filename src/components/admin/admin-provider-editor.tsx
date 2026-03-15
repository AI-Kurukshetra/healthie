"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useState } from "react";
import { ArrowLeft, Award, Shield, Stethoscope, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import type { AdminProviderRecord } from "@/components/admin/admin-provider-types";

export function AdminProviderEditor({
  mode,
  provider
}: {
  mode: "create" | "edit";
  provider?: AdminProviderRecord;
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
            specialty: String(formData.get("specialty") ?? "").trim() || null,
            license_number: String(formData.get("license_number") ?? "").trim() || null,
            bio: String(formData.get("bio") ?? "").trim() || null
          }
        : {
            user_id: provider?.user_id,
            full_name: String(formData.get("full_name") ?? ""),
            specialty: String(formData.get("specialty") ?? "").trim() || null,
            license_number: String(formData.get("license_number") ?? "").trim() || null,
            bio: String(formData.get("bio") ?? "").trim() || null
          };

    try {
      const response = await fetch("/api/providers", {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await response.json().catch(() => null);
      if (!response.ok) {
        const msg = result?.error ?? `Unable to ${mode === "create" ? "create" : "update"} provider.`;
        setError(msg);
        toastError(msg);
        setLoading(false);
        return;
      }

      toastSuccess(mode === "create" ? "Provider created successfully." : "Provider updated successfully.");
      window.location.href = "/admin/providers";
    } catch {
      const msg = "Network error. Please check your connection and try again.";
      setError(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!provider) {
      return;
    }

    if (!window.confirm("Delete this provider? This action cannot be undone.")) {
      return;
    }

    setDeleteLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/providers", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: provider.user_id })
      });

      const result = await response.json().catch(() => null);
      if (!response.ok) {
        const msg = result?.error ?? "Unable to delete provider.";
        setError(msg);
        toastError(msg);
        setDeleteLoading(false);
        return;
      }

      toastSuccess("Provider deleted.");
      window.location.href = "/admin/providers";
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
              <Badge>{mode === "create" ? "New provider" : "Edit provider"}</Badge>
              {mode === "edit" && <Badge className="bg-white">{provider?.user?.email ?? "Email unavailable"}</Badge>}
            </div>
            <h2 className="mt-4 text-2xl font-semibold text-ink">
              {mode === "create" ? "Create provider" : provider?.user?.full_name ?? "Edit provider"}
            </h2>
            <p className="mt-2 text-sm leading-7 text-muted">
              {mode === "create"
                ? "Register a new healthcare provider with their credentials and practice details."
                : "Update the provider's profile, specialty, and practice information."}
            </p>
          </div>
          <Link className={buttonVariants({ variant: "secondary", size: "sm" })} href="/admin/providers">
            <ArrowLeft className="h-4 w-4" />
            Back to providers
          </Link>
        </div>
      </Card>

      <form className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]" id="provider-form" onSubmit={handleSubmit}>
        {/* Left column */}
        <div className="space-y-6">
          {/* Account credentials */}
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary-deep">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink">Account credentials</h3>
                <p className="text-sm text-muted">{mode === "create" ? "Set login credentials for the provider." : "Login email for this account."}</p>
              </div>
            </div>
            <div className="mt-5 space-y-4">
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-ink">Full name</span>
                <Input defaultValue={provider?.user?.full_name ?? ""} name="full_name" placeholder="Dr. John Doe" required />
              </label>
              {mode === "create" ? (
                <>
                  <label className="block space-y-1.5">
                    <span className="text-sm font-medium text-ink">Email address</span>
                    <Input name="email" placeholder="provider@clinic.com" required type="email" />
                  </label>
                  <label className="block space-y-1.5">
                    <span className="text-sm font-medium text-ink">Password</span>
                    <Input name="password" placeholder="Min 8 characters" required type="password" />
                  </label>
                </>
              ) : (
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-ink">Email address</span>
                  <Input defaultValue={provider?.user?.email ?? ""} disabled type="email" />
                  <p className="text-xs text-muted">Email cannot be changed after account creation.</p>
                </label>
              )}
            </div>
          </Card>

          {/* Practice details */}
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Stethoscope className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink">Practice details</h3>
                <p className="text-sm text-muted">Specialty and clinical expertise.</p>
              </div>
            </div>
            <div className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-ink">Specialty</span>
                  <Input defaultValue={provider?.specialty ?? ""} name="specialty" placeholder="e.g. Family Medicine" />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-ink">License number</span>
                  <Input defaultValue={provider?.license_number ?? ""} name="license_number" placeholder="e.g. MD-123456" />
                </label>
              </div>
            </div>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Professional bio */}
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink">Professional bio</h3>
                <p className="text-sm text-muted">Visible to patients when selecting a provider.</p>
              </div>
            </div>
            <div className="mt-5">
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-ink">Biography</span>
                <Textarea defaultValue={provider?.bio ?? ""} name="bio" placeholder="Board-certified physician with 10+ years of experience in..." rows={6} />
              </label>
            </div>
          </Card>

        </div>
      </form>

      {/* Actions — outside the form so delete button has no form interference */}
      <Card className="p-6">
        {error && <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-danger">{error}</p>}
        <div className="flex flex-wrap gap-3">
          <Button className="flex-1 sm:flex-none" disabled={loading} form="provider-form" type="submit">
            {loading ? (mode === "create" ? "Creating..." : "Saving...") : mode === "create" ? "Create provider" : "Save changes"}
          </Button>
          {mode === "edit" && (
            <Button disabled={deleteLoading} onClick={handleDelete} variant="danger">
              <Trash2 className="h-4 w-4" />
              {deleteLoading ? "Deleting..." : "Delete provider"}
            </Button>
          )}
          <Link className={buttonVariants({ variant: "ghost" })} href="/admin/providers">
            Cancel
          </Link>
        </div>
      </Card>
    </div>
  );
}
