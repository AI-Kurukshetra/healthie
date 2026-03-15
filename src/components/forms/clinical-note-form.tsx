"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { clinicalNoteSchema } from "@/validators/clinical-note";

type ClinicalNoteFormValues = {
  appointment_id: string;
  provider_id: string;
  patient_id: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
};

export function ClinicalNoteForm({
  providerId,
  appointments
}: {
  providerId: string;
  appointments: { id: string; patientId: string; label: string }[];
}) {
  const router = useRouter();
  const { success: toastSuccess, error: toastError } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, watch } = useForm<ClinicalNoteFormValues>({
    defaultValues: { provider_id: providerId }
  });

  const appointmentId = watch("appointment_id");
  const selectedAppointment = appointments.find((item) => item.id === appointmentId);

  const onSubmit = handleSubmit(async (values) => {
    const parsed = clinicalNoteSchema.safeParse({
      ...values,
      patient_id: selectedAppointment?.patientId ?? values.patient_id
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid note.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "clinical_note", ...parsed.data })
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        const msg = payload?.error ?? "Unable to save note.";
        setError(msg);
        toastError(msg);
        return;
      }

      toastSuccess("Clinical note saved.");
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
        <h3 className="text-xl font-semibold text-ink">Create SOAP note</h3>
        <p className="mt-1 text-sm text-muted">Capture subjective, objective, assessment, and plan details from the selected appointment.</p>
      </div>

      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <input type="hidden" {...register("provider_id")} />
        <input type="hidden" value={selectedAppointment?.patientId ?? ""} {...register("patient_id")} />

        <label className="block space-y-2 text-sm font-medium text-ink">
          <span>Appointment</span>
          <Select {...register("appointment_id")}>
            <option value="">Select appointment</option>
            {appointments.map((appointment) => (
              <option key={appointment.id} value={appointment.id}>
                {appointment.label}
              </option>
            ))}
          </Select>
        </label>

        <label className="block space-y-2 text-sm font-medium text-ink">
          <span>Subjective</span>
          <Textarea {...register("subjective")} />
        </label>

        <label className="block space-y-2 text-sm font-medium text-ink">
          <span>Objective</span>
          <Textarea {...register("objective")} />
        </label>

        <label className="block space-y-2 text-sm font-medium text-ink">
          <span>Assessment</span>
          <Textarea {...register("assessment")} />
        </label>

        <label className="block space-y-2 text-sm font-medium text-ink">
          <span>Plan</span>
          <Textarea {...register("plan")} />
        </label>

        {error ? <p className="text-sm text-danger">{error}</p> : null}

        <Button disabled={loading} type="submit">
          {loading ? "Saving..." : "Save note"}
        </Button>
      </form>
    </Card>
  );
}
