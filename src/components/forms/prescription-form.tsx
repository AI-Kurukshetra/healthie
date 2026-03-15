"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { prescriptionSchema } from "@/validators/prescription";

type PrescriptionFormValues = {
  provider_id: string;
  patient_id: string;
  medication_name: string;
  dosage: string;
  instructions: string;
  duration: string;
};

export function PrescriptionForm({
  providerId,
  patients
}: {
  providerId: string;
  patients: { id: string; name: string }[];
}) {
  const router = useRouter();
  const { success: toastSuccess, error: toastError } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit } = useForm<PrescriptionFormValues>({
    defaultValues: { provider_id: providerId }
  });

  const onSubmit = handleSubmit(async (values) => {
    const parsed = prescriptionSchema.safeParse(values);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid prescription.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/prescriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data)
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        const msg = payload?.error ?? "Unable to issue prescription.";
        setError(msg);
        toastError(msg);
        return;
      }

      toastSuccess("Prescription issued successfully.");
      router.refresh();
    } catch {
      const msg = "Network error. Please check your connection and try again.";
      setError(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  });

  return (
    <Card className="p-6">
      <div>
        <h3 className="text-xl font-semibold text-ink">Issue prescription</h3>
        <p className="mt-1 text-sm text-muted">Publish medication instructions directly into the patient portal.</p>
      </div>

      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <input type="hidden" {...register("provider_id")} />

        <label className="block space-y-2 text-sm font-medium text-ink">
          <span>Patient</span>
          <Select {...register("patient_id")}>
            <option value="">Select patient</option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.name}
              </option>
            ))}
          </Select>
        </label>

        <label className="block space-y-2 text-sm font-medium text-ink">
          <span>Medication name</span>
          <Input {...register("medication_name")} />
        </label>

        <label className="block space-y-2 text-sm font-medium text-ink">
          <span>Dosage</span>
          <Input placeholder="500mg once daily" {...register("dosage")} />
        </label>

        <label className="block space-y-2 text-sm font-medium text-ink">
          <span>Instructions</span>
          <Textarea {...register("instructions")} />
        </label>

        <label className="block space-y-2 text-sm font-medium text-ink">
          <span>Duration</span>
          <Input placeholder="14 days" {...register("duration")} />
        </label>

        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <Button disabled={loading} type="submit">
          {loading ? "Issuing..." : "Issue prescription"}
        </Button>
      </form>
    </Card>
  );
}
