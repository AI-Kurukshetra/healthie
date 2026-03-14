"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Patient, Prescription, Provider } from "@/types/domain";

export function AdminPrescriptionManager({
  prescriptions,
  patients,
  providers
}: {
  prescriptions: Prescription[];
  patients: Patient[];
  providers: Provider[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function createPrescription(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/prescriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patient_id: String(formData.get("patient_id") ?? ""),
        provider_id: String(formData.get("provider_id") ?? ""),
        medication_name: String(formData.get("medication_name") ?? ""),
        dosage: String(formData.get("dosage") ?? ""),
        instructions: String(formData.get("instructions") ?? ""),
        duration: String(formData.get("duration") ?? "")
      })
    });
    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error ?? "Unable to create prescription.");
      setLoading(false);
      return;
    }

    event.currentTarget.reset();
    setLoading(false);
    router.refresh();
  }

  async function updatePrescription(event: FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault();
    setBusyId(id);
    const formData = new FormData(event.currentTarget);
    await fetch("/api/prescriptions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        patient_id: String(formData.get("patient_id") ?? ""),
        provider_id: String(formData.get("provider_id") ?? ""),
        medication_name: String(formData.get("medication_name") ?? ""),
        dosage: String(formData.get("dosage") ?? ""),
        instructions: String(formData.get("instructions") ?? ""),
        duration: String(formData.get("duration") ?? "")
      })
    });
    setBusyId(null);
    router.refresh();
  }

  async function deletePrescription(id: string) {
    setBusyId(id);
    await fetch("/api/prescriptions", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    setBusyId(null);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-semibold text-ink">Create prescription</h2>
        <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={createPrescription}>
          <Select defaultValue="" name="patient_id" required>
            <option value="" disabled>Select patient</option>
            {patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.user?.full_name ?? patient.user?.email ?? "Patient"}</option>)}
          </Select>
          <Select defaultValue="" name="provider_id" required>
            <option value="" disabled>Select provider</option>
            {providers.map((provider) => <option key={provider.id} value={provider.id}>{provider.user?.full_name ?? provider.user?.email ?? "Provider"}</option>)}
          </Select>
          <Input name="medication_name" placeholder="Medication" required />
          <Input name="dosage" placeholder="Dosage" required />
          <Input name="duration" placeholder="Duration" required />
          <div className="md:col-span-2"><Textarea name="instructions" placeholder="Instructions" required /></div>
          {error ? <p className="text-sm text-danger md:col-span-2">{error}</p> : null}
          <div className="md:col-span-2"><Button disabled={loading} type="submit">{loading ? "Creating..." : "Create prescription"}</Button></div>
        </form>
      </Card>

      <div className="space-y-4">
        {prescriptions.map((prescription) => (
          <Card key={prescription.id} className="p-6">
            <form className="grid gap-4 md:grid-cols-2" onSubmit={(event) => updatePrescription(event, prescription.id)}>
              <Select defaultValue={prescription.patient_id} name="patient_id" required>
                {patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.user?.full_name ?? patient.user?.email ?? "Patient"}</option>)}
              </Select>
              <Select defaultValue={prescription.provider_id} name="provider_id" required>
                {providers.map((provider) => <option key={provider.id} value={provider.id}>{provider.user?.full_name ?? provider.user?.email ?? "Provider"}</option>)}
              </Select>
              <Input defaultValue={prescription.medication_name} name="medication_name" required />
              <Input defaultValue={prescription.dosage} name="dosage" required />
              <Input defaultValue={prescription.duration} name="duration" required />
              <div className="md:col-span-2"><Textarea defaultValue={prescription.instructions} name="instructions" required /></div>
              <div className="flex flex-wrap gap-3 md:col-span-2">
                <Button disabled={busyId === prescription.id} type="submit" variant="secondary">{busyId === prescription.id ? "Saving..." : "Save changes"}</Button>
                <Button disabled={busyId === prescription.id} onClick={() => deletePrescription(prescription.id)} type="button" variant="danger">Delete</Button>
              </div>
            </form>
          </Card>
        ))}
      </div>
    </div>
  );
}
