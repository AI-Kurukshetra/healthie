"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Mail, Lock, UserPlus, Users, ShieldCheck, Stethoscope } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signupSchema } from "@/validators/auth";

type SignupFormValues = {
  email: string;
  password: string;
  role: "patient" | "provider" | "admin";
};

const roles = [
  { value: "patient" as const, label: "Patient", desc: "Book visits & view records", icon: Users },
  { value: "provider" as const, label: "Provider", desc: "Manage patients & notes", icon: Stethoscope },
  { value: "admin" as const, label: "Admin", desc: "Platform oversight", icon: ShieldCheck }
];

export function SignupForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, watch, setValue } = useForm<SignupFormValues>({
    defaultValues: { role: "patient" }
  });

  const selectedRole = watch("role");

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

    setSuccess("Account created! Redirecting to sign in...");
    window.location.assign("/login");
  });

  return (
    <div className="gradient-border rounded-2xl bg-white p-6 shadow-card sm:p-8">
      <div className="text-center">
        <div className="gradient-bg mx-auto flex h-12 w-12 items-center justify-center rounded-2xl">
          <UserPlus className="h-6 w-6 text-white" />
        </div>
        <h2 className="mt-4 text-2xl font-semibold text-ink">Create your account</h2>
        <p className="mt-1 text-sm text-muted">Get started in under a minute.</p>
      </div>

      <form className="mt-8 space-y-5" onSubmit={onSubmit}>
        {/* Role Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-ink">I am a...</label>
          <input type="hidden" {...register("role")} />
          <div className="grid grid-cols-3 gap-2">
            {roles.map((role) => {
              const Icon = role.icon;
              const active = selectedRole === role.value;
              return (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => setValue("role", role.value)}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3 text-center transition ${
                    active
                      ? "border-primary/30 bg-primary-soft shadow-sm"
                      : "border-border bg-white hover:border-primary/20 hover:bg-surface-muted"
                  }`}
                >
                  <Icon className={`h-5 w-5 ${active ? "text-primary" : "text-muted"}`} />
                  <span className={`text-xs font-semibold ${active ? "text-primary" : "text-ink"}`}>{role.label}</span>
                  <span className="text-[10px] leading-tight text-muted">{role.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-ink" htmlFor="signup-email">Email</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted/50" />
            <Input className="pl-10" id="signup-email" placeholder="name@example.com" type="email" {...register("email")} />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-ink" htmlFor="signup-password">Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted/50" />
            <Input className="pl-10" id="signup-password" placeholder="Min 8 characters" type="password" {...register("password")} />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-danger">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-danger" />
            {error}
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-success">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
            {success}
          </div>
        )}

        <Button className="w-full" disabled={loading} type="submit">
          {loading ? "Creating account..." : "Create account"}
        </Button>
      </form>

      <div className="mt-8 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link className="font-semibold text-primary hover:underline" href="/login">
          Sign in
        </Link>
      </div>
    </div>
  );
}
