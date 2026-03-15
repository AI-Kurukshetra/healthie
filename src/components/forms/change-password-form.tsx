"use client";

import type { FormEvent } from "react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

export function ChangePasswordForm() {
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
    const current_password = String(formData.get("current_password") ?? "");
    const new_password = String(formData.get("new_password") ?? "");
    const confirm_password = String(formData.get("confirm_password") ?? "");

    if (new_password !== confirm_password) {
      const msg = "Passwords do not match.";
      setError(msg);
      toastError(msg);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current_password, new_password, confirm_password })
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        const msg = payload?.error ?? "Unable to change password.";
        setError(msg);
        toastError(msg);
        return;
      }

      setSuccess("Password changed successfully.");
      toastSuccess("Password changed successfully.");
      event.currentTarget.reset();
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
        <h2 className="text-2xl font-semibold text-ink">Change password</h2>
        <p className="mt-2 text-sm leading-7 text-muted">
          Update your account password. You will need to enter your current password for verification.
        </p>
      </div>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <label className="block space-y-2 text-sm font-medium text-ink">
          <span>Current password</span>
          <Input name="current_password" required type="password" />
        </label>

        <label className="block space-y-2 text-sm font-medium text-ink">
          <span>New password</span>
          <Input minLength={8} name="new_password" required type="password" />
        </label>

        <label className="block space-y-2 text-sm font-medium text-ink">
          <span>Confirm new password</span>
          <Input minLength={8} name="confirm_password" required type="password" />
        </label>

        {error ? <p className="text-sm text-danger">{error}</p> : null}
        {success ? <p className="text-sm text-success">{success}</p> : null}

        <Button disabled={loading} type="submit">
          {loading ? "Updating..." : "Change password"}
        </Button>
      </form>
    </Card>
  );
}
