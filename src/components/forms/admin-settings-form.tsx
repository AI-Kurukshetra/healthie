"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

type AdminSettingsValues = {
  full_name: string;
  email: string;
  avatar_url: string;
};

export function AdminSettingsForm({ values }: { values: AdminSettingsValues }) {
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
      const response = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: String(formData.get("full_name") ?? ""),
          avatar_url: String(formData.get("avatar_url") ?? "").trim() || null
        })
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        const msg = payload?.error ?? "Unable to update profile.";
        setError(msg);
        toastError(msg);
        return;
      }

      setSuccess("Profile updated.");
      toastSuccess("Profile updated.");
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
        <h2 className="text-2xl font-semibold text-ink">Admin profile</h2>
        <p className="mt-2 text-sm leading-7 text-muted">Update your administrator profile details. Your name is displayed across the platform wherever your identity appears.</p>
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

        <label className="block space-y-2 text-sm font-medium text-ink">
          <span>Avatar URL</span>
          <Input defaultValue={values.avatar_url} name="avatar_url" placeholder="https://example.com/avatar.jpg" type="url" />
        </label>

        {error ? <p className="text-sm text-danger">{error}</p> : null}
        {success ? <p className="text-sm text-success">{success}</p> : null}

        <Button disabled={loading} type="submit">
          {loading ? "Saving..." : "Save profile"}
        </Button>
      </form>
    </Card>
  );
}
