"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { signupSchema } from "@/validators/auth";

type SignupFormValues = {
  email: string;
  password: string;
  role: "patient" | "provider" | "admin";
};

export function SignupForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit } = useForm<SignupFormValues>({
    defaultValues: { role: "patient" }
  });

  const onSubmit = handleSubmit(async (values) => {
    const parsed = signupSchema.safeParse(values);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid signup request.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data)
    });

    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error ?? "Unable to create account.");
      setLoading(false);
      return;
    }

    setSuccess("Account created. Redirecting to sign in...");
    window.location.assign("/login");
  });

  return (
    <Card className="p-8 sm:p-10">
      <div>
        <h1 className="font-display text-4xl font-semibold text-ink">Create account</h1>
        <p className="mt-3 text-sm text-muted">Spin up a patient, provider, or admin account to explore the new templates.</p>
      </div>

      <form className="mt-8 space-y-5" onSubmit={onSubmit}>
        <label className="block space-y-2 text-sm font-medium text-ink">
          <span>Email</span>
          <Input placeholder="name@example.com" type="email" {...register("email")} />
        </label>

        <label className="block space-y-2 text-sm font-medium text-ink">
          <span>Password</span>
          <Input placeholder="Create a password" type="password" {...register("password")} />
        </label>

        <label className="block space-y-2 text-sm font-medium text-ink">
          <span>Role</span>
          <Select {...register("role")}>
            <option value="patient">Patient</option>
            <option value="provider">Provider</option>
            <option value="admin">Admin</option>
          </Select>
        </label>

        {error ? <p className="text-sm text-danger">{error}</p> : null}
        {success ? <p className="text-sm text-success">{success}</p> : null}

        <Button className="w-full" disabled={loading} size="lg" type="submit">
          {loading ? "Creating account..." : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-sm text-muted">
        Already have an account? <Link className="font-semibold text-primary-deep" href="/login">Sign in</Link>
      </p>
    </Card>
  );
}
