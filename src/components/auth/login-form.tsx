"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Lock, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginSchema } from "@/validators/auth";

type LoginFormValues = {
  email: string;
  password: string;
};

export function LoginForm() {
  const router = useRouter();
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

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data)
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setError(payload?.error ?? "Unable to sign in.");
        setLoading(false);
        return;
      }

      const redirectTo =
        typeof payload?.data?.redirectTo === "string" ? payload.data.redirectTo : "/patient/dashboard";

      router.replace(redirectTo);
      router.refresh();
    } catch {
      setError("Unable to reach the login service.");
      setLoading(false);
    }
  });

  return (
    <div className="gradient-border rounded-2xl bg-white p-6 shadow-card sm:p-8">
      <div className="text-center">
        <div className="gradient-bg mx-auto flex h-12 w-12 items-center justify-center rounded-2xl">
          <Lock className="h-6 w-6 text-white" />
        </div>
        <h2 className="mt-4 text-2xl font-semibold text-ink">Welcome back</h2>
        <p className="mt-1 text-sm text-muted">Sign in to access your care workspace.</p>
      </div>

      <form className="mt-8 space-y-4" onSubmit={onSubmit}>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-ink" htmlFor="login-email">Email</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted/50" />
            <Input className="pl-10" id="login-email" placeholder="name@clinic.com" type="email" {...register("email")} />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-ink" htmlFor="login-password">Password</label>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted/50" />
            <Input className="pl-10" id="login-password" placeholder="Enter your password" type="password" {...register("password")} />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-danger">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-danger" />
            {error}
          </div>
        )}

        <Button className="w-full" disabled={loading} type="submit">
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <div className="mt-8 text-center text-sm text-muted">
        Don&apos;t have an account?{" "}
        <Link className="font-semibold text-primary hover:underline" href="/signup">
          Create one
        </Link>
      </div>
    </div>
  );
}
