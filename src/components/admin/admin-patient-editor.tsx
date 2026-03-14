"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { AdminPatientRecord } from "@/components/admin/admin-patient-types";

export function AdminPatientEditor({
  mode,
  patient
}: {
  mode: "create" | "edit";
  patient?: AdminPatientRecord;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setLoading(true);
    setError(null);

    const formData = new FormData(form);
    const payload =
      mode === "create"
        ? {
            email: String(formData.get("email") ?? ""),
            password: String(formData.get("password") ?? ""),
            full_name: String(formData.get("full_name") ?? ""),
            date_of_birth: String(formData.get("date_of_birth") ?? "") || null,
            phone: String(formData.get("phone") ?? "") || null,
            emergency_contact: String(formData.get("emergency_contact") ?? "") || null,
            insurance_provider: String(formData.get("insurance_provider") ?? "") || null
          }
        : {
            user_id: patient?.user_id,
            full_name: String(formData.get("full_name") ?? ""),
            date_of_birth: String(formData.get("date_of_birth") ?? "") || null,
            phone: String(formData.get("phone") ?? "") || null,
            emergency_contact: String(formData.get("emergency_contact") ?? "") || null,
            insurance_provider: String(formData.get("insurance_provider") ?? "") || null
          };

    const response = await fetch("/api/patients", {
      method: mode === "create" ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (!response.ok) {
      setError(result.error ?? `Unable to ${mode === "create" ? "create" : "update"} patient.`);
      setLoading(false);
      return;
    }

    if (mode === "create") {
      form.reset();
    }

    router.push("/admin/patients");
    router.refresh();
  }

  async function handleDelete() {
    if (!patient) {
      return;
    }

    setDeleteLoading(true);
    setError(null);

    const response = await fetch("/api/patients", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: patient.user_id })
    });

    const result = await response.json();
    if (!response.ok) {
      setError(result.error ?? "Unable to delete patient.");
      setDeleteLoading(false);
      return;
    }

    router.push("/admin/patients");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <Card className="flex flex-wrap items-center justify-between gap-4 p-6">
        <div>
          <div className="flex items-center gap-3">
            <Badge>{mode === "create" ? "Add patient" : "Manage patient"}</Badge>
            {mode === "edit" ? <Badge className="bg-white">{patient?.user?.email ?? "Email unavailable"}</Badge> : null}
          </div>
          <h2 className="mt-4 text-2xl font-semibold text-ink">
            {mode === "create" ? "Create patient" : patient?.user?.full_name ?? "Edit patient"}
          </h2>
          <p className="mt-2 text-sm text-muted">
            {mode === "create"
              ? "Add a new patient without cluttering the main patients directory."
              : "Update patient profile details on a separate management screen, then return to the directory."}
          </p>
        </div>

        <Link className={buttonVariants({ variant: "secondary", size: "sm" })} href="/admin/patients">
          <ArrowLeft className="h-4 w-4" />
          Back to patients
        </Link>
      </Card>

      <Card className="p-6">
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <Input defaultValue={patient?.user?.full_name ?? ""} name="full_name" placeholder="Full name" required />
          {mode === "create" ? (
            <Input name="email" placeholder="Email" required type="email" />
          ) : (
            <Input defaultValue={patient?.user?.email ?? ""} disabled type="email" />
          )}
          {mode === "create" ? <Input name="password" placeholder="Password" required type="password" /> : null}
          <Input defaultValue={patient?.date_of_birth ?? ""} name="date_of_birth" type="date" />
          <Input defaultValue={patient?.phone ?? ""} name="phone" placeholder="Phone" />
          <Input defaultValue={patient?.emergency_contact ?? ""} name="emergency_contact" placeholder="Emergency contact" />
          <div className="md:col-span-2">
            <Textarea defaultValue={patient?.insurance_provider ?? ""} name="insurance_provider" placeholder="Insurance provider" />
          </div>

          {error ? <p className="text-sm text-danger md:col-span-2">{error}</p> : null}

          <div className="flex flex-wrap gap-3 md:col-span-2">
            <Button disabled={loading} type="submit">
              {loading ? (mode === "create" ? "Creating..." : "Saving...") : mode === "create" ? "Create patient" : "Save changes"}
            </Button>
            {mode === "edit" ? (
              <Button disabled={deleteLoading} onClick={handleDelete} type="button" variant="danger">
                <Trash2 className="h-4 w-4" />
                {deleteLoading ? "Deleting..." : "Delete patient"}
              </Button>
            ) : null}
          </div>
        </form>
      </Card>
    </div>
  );
}
