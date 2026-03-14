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
import type { AdminProviderRecord } from "@/components/admin/admin-provider-types";

export function AdminProviderEditor({
  mode,
  provider
}: {
  mode: "create" | "edit";
  provider?: AdminProviderRecord;
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
            specialty: String(formData.get("specialty") ?? "") || null,
            license_number: String(formData.get("license_number") ?? "") || null,
            bio: String(formData.get("bio") ?? "") || null
          }
        : {
            user_id: provider?.user_id,
            full_name: String(formData.get("full_name") ?? ""),
            specialty: String(formData.get("specialty") ?? "") || null,
            license_number: String(formData.get("license_number") ?? "") || null,
            bio: String(formData.get("bio") ?? "") || null
          };

    const response = await fetch("/api/providers", {
      method: mode === "create" ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (!response.ok) {
      setError(result.error ?? `Unable to ${mode === "create" ? "create" : "update"} provider.`);
      setLoading(false);
      return;
    }

    if (mode === "create") {
      form.reset();
    }

    router.push("/admin/providers");
    router.refresh();
  }

  async function handleDelete() {
    if (!provider) {
      return;
    }

    setDeleteLoading(true);
    setError(null);

    const response = await fetch("/api/providers", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: provider.user_id })
    });

    const result = await response.json();
    if (!response.ok) {
      setError(result.error ?? "Unable to delete provider.");
      setDeleteLoading(false);
      return;
    }

    router.push("/admin/providers");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <Card className="flex flex-wrap items-center justify-between gap-4 p-6">
        <div>
          <div className="flex items-center gap-3">
            <Badge>{mode === "create" ? "Add provider" : "Manage provider"}</Badge>
            {mode === "edit" ? <Badge className="bg-white">{provider?.user?.email ?? "Email unavailable"}</Badge> : null}
          </div>
          <h2 className="mt-4 text-2xl font-semibold text-ink">
            {mode === "create" ? "Create provider" : provider?.user?.full_name ?? "Edit provider"}
          </h2>
          <p className="mt-2 text-sm text-muted">
            {mode === "create"
              ? "Add a new provider without cluttering the main providers directory."
              : "Update provider details on a separate management screen, then return to the directory."}
          </p>
        </div>

        <Link className={buttonVariants({ variant: "secondary", size: "sm" })} href="/admin/providers">
          <ArrowLeft className="h-4 w-4" />
          Back to providers
        </Link>
      </Card>

      <Card className="p-6">
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <Input defaultValue={provider?.user?.full_name ?? ""} name="full_name" placeholder="Full name" required />
          {mode === "create" ? (
            <Input name="email" placeholder="Email" required type="email" />
          ) : (
            <Input defaultValue={provider?.user?.email ?? ""} disabled type="email" />
          )}
          {mode === "create" ? <Input name="password" placeholder="Password" required type="password" /> : null}
          <Input defaultValue={provider?.specialty ?? ""} name="specialty" placeholder="Specialty" />
          <Input defaultValue={provider?.license_number ?? ""} name="license_number" placeholder="License number" />
          <div className="md:col-span-2">
            <Textarea defaultValue={provider?.bio ?? ""} name="bio" placeholder="Professional bio" />
          </div>

          {error ? <p className="text-sm text-danger md:col-span-2">{error}</p> : null}

          <div className="flex flex-wrap gap-3 md:col-span-2">
            <Button disabled={loading} type="submit">
              {loading ? (mode === "create" ? "Creating..." : "Saving...") : mode === "create" ? "Create provider" : "Save changes"}
            </Button>
            {mode === "edit" ? (
              <Button disabled={deleteLoading} onClick={handleDelete} type="button" variant="danger">
                <Trash2 className="h-4 w-4" />
                {deleteLoading ? "Deleting..." : "Delete provider"}
              </Button>
            ) : null}
          </div>
        </form>
      </Card>
    </div>
  );
}
