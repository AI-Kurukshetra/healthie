"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createBrowserSupabaseClient } from "@/lib/supabaseClient";
import { loginSchema } from "@/validators/auth";
import type { Role } from "@/types/domain";

type LoginFormValues = {
  email: string;
  password: string;
};

function getDefaultDashboard(role: Role) {
  switch (role) {
    case "patient":
      return "/patient/dashboard";
    case "provider":
      return "/provider/dashboard";
    default:
      return "/admin/dashboard";
  }
}

function resolveRole(metadataRole: unknown): Role {
  if (metadataRole === "patient" || metadataRole === "provider" || metadataRole === "admin") {
    return metadataRole;
  }

  return "patient";
}

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit } = useForm<LoginFormValues>();

  const onSubmit = handleSubmit(async (values) => {
    const parsed = loginSchema.safeParse(values);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid credentials.");
      return;
    }

    setLoading(true);
    setError(null);

    const supabase = createBrowserSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

    if (error || !data.user) {
      setError(error?.message ?? "Unable to sign in.");
      setLoading(false);
      return;
    }

    const role = resolveRole(data.user.user_metadata?.role);
    document.cookie = `sb-role=${role}; Path=/; SameSite=Lax`;
    window.location.assign(getDefaultDashboard(role));
  });

  return (
    <Card className="p-8 sm:p-10">
      <div>
        <h1 className="font-display text-4xl font-semibold text-ink">Sign in</h1>
        <p className="mt-3 text-sm text-muted">Access patient, provider, or admin workflows with your existing account.</p>
      </div>

      <form className="mt-8 space-y-5" onSubmit={onSubmit}>
        <label className="block space-y-2 text-sm font-medium text-ink">
          <span>Email</span>
          <Input placeholder="name@clinic.com" type="email" {...register("email")} />
        </label>

        <label className="block space-y-2 text-sm font-medium text-ink">
          <span>Password</span>
          <Input placeholder="Enter password" type="password" {...register("password")} />
        </label>

        {error ? <p className="text-sm text-danger">{error}</p> : null}

        <Button className="w-full" disabled={loading} size="lg" type="submit">
          {loading ? "Signing in..." : "Continue to workspace"}
        </Button>
      </form>

      <p className="mt-6 text-sm text-muted">
        Need an account? <Link className="font-semibold text-primary-deep" href="/signup">Create one here</Link>
      </p>
    </Card>
  );
}
