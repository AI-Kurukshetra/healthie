"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type ProviderSettingsValues = {
  full_name: string;
  email: string;
  specialty: string;
  license_number: string;
  bio: string;
};

export function ProviderSettingsForm({ values }: { values: ProviderSettingsValues }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/providers", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: String(formData.get("full_name") ?? ""),
        specialty: String(formData.get("specialty") ?? "") || null,
        license_number: String(formData.get("license_number") ?? "") || null,
        bio: String(formData.get("bio") ?? "") || null
      })
    });

    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error ?? "Unable to update provider settings.");
      setLoading(false);
      return;
    }

    setSuccess("Settings updated.");
    setLoading(false);
    router.refresh();
  }

  return (
    <Card className="p-6">
      <div>
        <h2 className="text-2xl font-semibold text-ink">Provider settings</h2>
        <p className="mt-2 text-sm leading-7 text-muted">Maintain your provider profile, specialty details, and practice-facing profile data used throughout the workspace.</p>
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
            <span>Specialty</span>
            <Input defaultValue={values.specialty} name="specialty" />
          </label>

          <label className="block space-y-2 text-sm font-medium text-ink">
            <span>License number</span>
            <Input defaultValue={values.license_number} name="license_number" />
          </label>
        </div>

        <label className="block space-y-2 text-sm font-medium text-ink">
          <span>Professional bio</span>
          <Textarea defaultValue={values.bio} name="bio" />
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
