"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";

type PatientSettingsValues = {
  full_name: string;
  email: string;
  date_of_birth: string;
  phone: string;
  emergency_contact: string;
  insurance_provider: string;
  avatar_url: string;
};

export function PatientSettingsForm({ values }: { values: PatientSettingsValues }) {
  const router = useRouter();
  const { success: toastSuccess, error: toastError } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/patients", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: String(formData.get("full_name") ?? ""),
          date_of_birth: String(formData.get("date_of_birth") ?? "").trim() || null,
          phone: String(formData.get("phone") ?? "").trim() || null,
          emergency_contact: String(formData.get("emergency_contact") ?? "").trim() || null,
          insurance_provider: String(formData.get("insurance_provider") ?? "").trim() || null,
          avatar_url: String(formData.get("avatar_url") ?? "").trim() || null
        })
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        const msg = payload?.error ?? "Unable to update patient settings.";
        setError(msg);
        toastError(msg);
        return;
      }

      setSuccess("Settings updated.");
      toastSuccess("Settings updated.");
      router.refresh();
    } catch {
      const msg = "Network error. Please check your connection and try again.";
      setError(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-6">
      <div>
        <h2 className="text-2xl font-semibold text-ink">Patient settings</h2>
        <p className="mt-2 text-sm leading-7 text-muted">Update your profile details, contact information, and insurance fields used throughout the patient workspace.</p>
      </div>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <label className="block space-y-2 text-sm font-medium text-ink">
          <span>Full name</span>
          <Input defaultValue={values.full_name} name="full_name" required />
        </label>

        <label className="block space-y-2 text-sm font-medium text-ink">
          <span>Email</span>
          <Input defaultValue={values.email} disabled type="email" />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block space-y-2 text-sm font-medium text-ink">
            <span>Date of birth</span>
            <Input defaultValue={values.date_of_birth} name="date_of_birth" type="date" />
          </label>

          <label className="block space-y-2 text-sm font-medium text-ink">
            <span>Phone</span>
            <Input defaultValue={values.phone} name="phone" />
          </label>
        </div>

        <label className="block space-y-2 text-sm font-medium text-ink">
          <span>Emergency contact</span>
          <Input defaultValue={values.emergency_contact} name="emergency_contact" />
        </label>

        <label className="block space-y-2 text-sm font-medium text-ink">
          <span>Insurance provider</span>
          <Textarea defaultValue={values.insurance_provider} name="insurance_provider" />
        </label>

        <label className="block space-y-2 text-sm font-medium text-ink">
          <span>Avatar URL</span>
          <Input defaultValue={values.avatar_url} name="avatar_url" placeholder="https://example.com/avatar.jpg" type="url" />
        </label>

        {error ? <p className="text-sm text-danger">{error}</p> : null}
        {success ? <p className="text-sm text-success">{success}</p> : null}

        <Button disabled={loading} type="submit">
          {loading ? "Saving..." : "Save settings"}
        </Button>
      </form>
    </Card>
  );
}
