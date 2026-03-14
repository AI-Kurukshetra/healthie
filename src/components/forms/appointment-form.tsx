"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { appointmentSchema } from "@/validators/appointment";
import type { ProviderAvailability } from "@/types/domain";

type AppointmentFormValues = {
  patient_id: string;
  provider_id: string;
  scheduled_at: string;
  reason?: string;
};

function isWithinAvailability(availability: ProviderAvailability[], scheduledAt: string) {
  if (availability.length === 0) {
    return true;
  }

  const date = new Date(scheduledAt);
  const day = date.getUTCDay();
  const time = date.toISOString().slice(11, 16);

  return availability.some((slot) => slot.day_of_week === day && slot.start_time.slice(0, 5) <= time && slot.end_time.slice(0, 5) >= time);
}

export function AppointmentForm({
  patientId,
  providers
}: {
  patientId: string;
  providers: { id: string; name: string; availability: ProviderAvailability[] }[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, watch } = useForm<AppointmentFormValues>({
    defaultValues: { patient_id: patientId }
  });

  const selectedProviderId = watch("provider_id");
  const selectedProvider = useMemo(
    () => providers.find((provider) => provider.id === selectedProviderId) ?? null,
    [providers, selectedProviderId]
  );

  const onSubmit = handleSubmit(async (values) => {
    if (selectedProvider && !isWithinAvailability(selectedProvider.availability, new Date(values.scheduled_at).toISOString())) {
      setError("Selected time is outside the provider's saved availability window.");
      return;
    }

    const parsed = appointmentSchema.safeParse({
      ...values,
      status: "pending",
      scheduled_at: new Date(values.scheduled_at).toISOString(),
      video_link: ""
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid appointment.");
      return;
    }

    setLoading(true);
    setError(null);
    const response = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data)
    });

    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error ?? "Unable to book appointment.");
      setLoading(false);
      return;
    }

    router.refresh();
    setLoading(false);
  });

  return (
    <Card className="p-6">
      <div>
        <h3 className="text-xl font-semibold text-ink">Book appointment</h3>
        <p className="mt-1 text-sm text-muted">Choose a provider, schedule a visit, and add the consultation reason.</p>
      </div>

      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <input type="hidden" {...register("patient_id")} />

        <label className="block space-y-2 text-sm font-medium text-ink">
          <span>Provider</span>
          <Select {...register("provider_id")}>
            <option value="">Select provider</option>
            {providers.map((provider) => (
              <option key={provider.id} value={provider.id}>
                {provider.name}
              </option>
            ))}
          </Select>
        </label>

        {selectedProvider ? (
          <div className="rounded-[18px] border border-border bg-surface-muted px-4 py-3 text-sm text-muted">
            {selectedProvider.availability.length > 0
              ? `Availability: ${selectedProvider.availability.map((slot) => `${["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][slot.day_of_week]} ${slot.start_time.slice(0, 5)}-${slot.end_time.slice(0, 5)}`).join(", ")}`
              : "This provider has not published availability yet. Booking is still allowed."}
          </div>
        ) : null}

        <label className="block space-y-2 text-sm font-medium text-ink">
          <span>Scheduled time</span>
          <Input type="datetime-local" {...register("scheduled_at")} />
        </label>

        <label className="block space-y-2 text-sm font-medium text-ink">
          <span>Reason</span>
          <Textarea placeholder="Describe the consultation goal." {...register("reason")} />
        </label>

        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <Button disabled={loading} type="submit">
          {loading ? "Booking..." : "Book appointment"}
        </Button>
      </form>
    </Card>
  );
}
