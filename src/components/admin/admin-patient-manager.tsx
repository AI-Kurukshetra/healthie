"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Patient } from "@/types/domain";

type AdminPatient = Patient & {
  user?: {
    id: string;
    email: string;
    full_name: string | null;
  };
};

export function AdminPatientManager({ patients }: { patients: AdminPatient[] }) {
  const router = useRouter();
  const [createError, setCreateError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function createPatient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setCreateError(null);

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/patients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
        full_name: String(formData.get("full_name") ?? ""),
        date_of_birth: String(formData.get("date_of_birth") ?? "") || null,
        phone: String(formData.get("phone") ?? "") || null,
        emergency_contact: String(formData.get("emergency_contact") ?? "") || null,
        insurance_provider: String(formData.get("insurance_provider") ?? "") || null
      })
    });

    const payload = await response.json();
    if (!response.ok) {
      setCreateError(payload.error ?? "Unable to create patient.");
      setLoading(false);
      return;
    }

    event.currentTarget.reset();
    setLoading(false);
    router.refresh();
  }

  async function updatePatient(event: FormEvent<HTMLFormElement>, userId: string) {
    event.preventDefault();
    setBusyId(userId);
    const formData = new FormData(event.currentTarget);

    await fetch("/api/patients", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        full_name: String(formData.get("full_name") ?? ""),
        date_of_birth: String(formData.get("date_of_birth") ?? "") || null,
        phone: String(formData.get("phone") ?? "") || null,
        emergency_contact: String(formData.get("emergency_contact") ?? "") || null,
        insurance_provider: String(formData.get("insurance_provider") ?? "") || null
      })
    });

    setBusyId(null);
    router.refresh();
  }

  async function deletePatient(userId: string) {
    setBusyId(userId);
    await fetch("/api/patients", {
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
        <h2 className="text-2xl font-semibold text-ink">Create patient</h2>
        <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={createPatient}>
          <Input name="full_name" placeholder="Full name" required />
          <Input name="email" placeholder="Email" required type="email" />
          <Input name="password" placeholder="Password" required type="password" />
          <Input name="date_of_birth" type="date" />
          <Input name="phone" placeholder="Phone" />
          <Input name="emergency_contact" placeholder="Emergency contact" />
          <div className="md:col-span-2">
            <Textarea name="insurance_provider" placeholder="Insurance provider" />
          </div>
          {createError ? <p className="text-sm text-danger md:col-span-2">{createError}</p> : null}
          <div className="md:col-span-2">
            <Button disabled={loading} type="submit">{loading ? "Creating..." : "Create patient"}</Button>
          </div>
        </form>
      </Card>

      <div className="space-y-4">
        {patients.map((patient) => (
          <Card key={patient.id} className="p-6">
            <form className="grid gap-4 md:grid-cols-2" onSubmit={(event) => updatePatient(event, patient.user_id)}>
              <Input defaultValue={patient.user?.full_name ?? ""} name="full_name" required />
              <Input defaultValue={patient.user?.email ?? ""} disabled type="email" />
              <Input defaultValue={patient.date_of_birth ?? ""} name="date_of_birth" type="date" />
              <Input defaultValue={patient.phone ?? ""} name="phone" placeholder="Phone" />
              <Input defaultValue={patient.emergency_contact ?? ""} name="emergency_contact" placeholder="Emergency contact" />
              <Textarea className="md:col-span-2" defaultValue={patient.insurance_provider ?? ""} name="insurance_provider" placeholder="Insurance provider" />
              <div className="flex flex-wrap gap-3 md:col-span-2">
                <Button disabled={busyId === patient.user_id} type="submit" variant="secondary">
                  {busyId === patient.user_id ? "Saving..." : "Save changes"}
                </Button>
                <Button disabled={busyId === patient.user_id} onClick={() => deletePatient(patient.user_id)} type="button" variant="danger">
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
