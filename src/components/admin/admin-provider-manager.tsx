"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Provider } from "@/types/domain";

type AdminProvider = Provider & {
  user?: {
    id: string;
    email: string;
    full_name: string | null;
  };
};

export function AdminProviderManager({ providers }: { providers: AdminProvider[] }) {
  const router = useRouter();
  const [createError, setCreateError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function createProvider(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setCreateError(null);

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/providers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
        full_name: String(formData.get("full_name") ?? ""),
        specialty: String(formData.get("specialty") ?? "") || null,
        license_number: String(formData.get("license_number") ?? "") || null,
        bio: String(formData.get("bio") ?? "") || null
      })
    });

    const payload = await response.json();
    if (!response.ok) {
      setCreateError(payload.error ?? "Unable to create provider.");
      setLoading(false);
      return;
    }

    event.currentTarget.reset();
    setLoading(false);
    router.refresh();
  }

  async function updateProvider(event: FormEvent<HTMLFormElement>, userId: string) {
    event.preventDefault();
    setBusyId(userId);
    const formData = new FormData(event.currentTarget);

    await fetch("/api/providers", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        full_name: String(formData.get("full_name") ?? ""),
        specialty: String(formData.get("specialty") ?? "") || null,
        license_number: String(formData.get("license_number") ?? "") || null,
        bio: String(formData.get("bio") ?? "") || null
      })
    });

    setBusyId(null);
    router.refresh();
  }

  async function deleteProvider(userId: string) {
    setBusyId(userId);
    await fetch("/api/providers", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId })
    });
    setBusyId(null);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-semibold text-ink">Create provider</h2>
        <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={createProvider}>
          <Input name="full_name" placeholder="Full name" required />
          <Input name="email" placeholder="Email" required type="email" />
          <Input name="password" placeholder="Password" required type="password" />
          <Input name="specialty" placeholder="Specialty" />
          <Input name="license_number" placeholder="License number" />
          <div className="md:col-span-2">
            <Textarea name="bio" placeholder="Professional bio" />
          </div>
          {createError ? <p className="text-sm text-danger md:col-span-2">{createError}</p> : null}
          <div className="md:col-span-2">
            <Button disabled={loading} type="submit">{loading ? "Creating..." : "Create provider"}</Button>
          </div>
        </form>
      </Card>

      <div className="space-y-4">
        {providers.map((provider) => (
          <Card key={provider.id} className="p-6">
            <form className="grid gap-4 md:grid-cols-2" onSubmit={(event) => updateProvider(event, provider.user_id)}>
              <Input defaultValue={provider.user?.full_name ?? ""} name="full_name" required />
              <Input defaultValue={provider.user?.email ?? ""} disabled type="email" />
              <Input defaultValue={provider.specialty ?? ""} name="specialty" placeholder="Specialty" />
              <Input defaultValue={provider.license_number ?? ""} name="license_number" placeholder="License number" />
              <Textarea className="md:col-span-2" defaultValue={provider.bio ?? ""} name="bio" placeholder="Professional bio" />
              <div className="flex flex-wrap gap-3 md:col-span-2">
                <Button disabled={busyId === provider.user_id} type="submit" variant="secondary">
                  {busyId === provider.user_id ? "Saving..." : "Save changes"}
                </Button>
                <Button disabled={busyId === provider.user_id} onClick={() => deleteProvider(provider.user_id)} type="button" variant="danger">
                  Delete
                </Button>
              </div>
            </form>
          </Card>
        ))}
      </div>
    </div>
  );
}
