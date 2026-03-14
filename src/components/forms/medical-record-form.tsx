"use client";

import type { FormEvent } from "react";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type PatientOption = {
  id: string;
  label: string;
};

export function MedicalRecordForm({
  providerId,
  patients
}: {
  providerId: string;
  patients: PatientOption[];
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    formData.set("provider_id", providerId);

    const response = await fetch("/api/records", {
      method: "POST",
      body: formData
    });

    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error ?? "Unable to save medical record.");
      setLoading(false);
      return;
    }

    formRef.current?.reset();
    router.refresh();
    setLoading(false);
  }

  return (
    <Card className="p-6">
      <div>
        <h2 className="text-xl font-semibold text-ink">Create medical record</h2>
        <p className="mt-1 text-sm text-muted">Capture diagnosis, visit notes, treatment plan, and an optional supporting document.</p>
      </div>

      <form ref={formRef} className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <input name="provider_id" type="hidden" value={providerId} />

        <label className="block space-y-2 text-sm font-medium text-ink">
          <span>Patient</span>
          <Select defaultValue="" name="patient_id" required>
            <option value="" disabled>Select patient</option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.label}
              </option>
            ))}
          </Select>
        </label>

        <label className="block space-y-2 text-sm font-medium text-ink">
          <span>Diagnosis</span>
          <Input name="diagnosis" required />
        </label>

        <label className="block space-y-2 text-sm font-medium text-ink">
          <span>Clinical notes</span>
          <Textarea name="notes" required />
        </label>

        <label className="block space-y-2 text-sm font-medium text-ink">
          <span>Treatment plan</span>
          <Textarea name="treatment_plan" />
        </label>

        <label className="block space-y-2 text-sm font-medium text-ink">
          <span>Document</span>
          <Input accept=".pdf,.png,.jpg,.jpeg,.webp" name="document" type="file" />
        </label>

        {error ? <p className="text-sm text-danger">{error}</p> : null}

        <Button disabled={loading} type="submit">
          {loading ? "Saving..." : "Save medical record"}
        </Button>
      </form>
    </Card>
  );
}
