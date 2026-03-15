"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { providerAvailabilitySchema } from "@/validators/provider-availability";
import type { ProviderAvailability } from "@/types/domain";

const dayLabels = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

type AvailabilityFormValues = {
  provider_id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  slot_duration_minutes: string;
};

export function ProviderAvailabilityManager({
  providerId,
  availability
}: {
  providerId: string;
  availability: ProviderAvailability[];
}) {
  const router = useRouter();
  const { success: toastSuccess, error: toastError } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { register, handleSubmit, reset } = useForm<AvailabilityFormValues>({
    defaultValues: {
      provider_id: providerId,
      day_of_week: "1",
      start_time: "09:00",
      end_time: "17:00",
      slot_duration_minutes: "30"
    }
  });

  const onSubmit = handleSubmit(async (values) => {
    const parsed = providerAvailabilitySchema.safeParse({
      ...values,
      provider_id: providerId,
      timezone: "UTC",
      is_available: true
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid availability window.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/providers/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data)
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        const msg = payload?.error ?? "Unable to save availability.";
        setError(msg);
        toastError(msg);
        return;
      }

      toastSuccess("Availability saved.");
      reset({
        provider_id: providerId,
        day_of_week: values.day_of_week,
        start_time: "09:00",
        end_time: "17:00",
        slot_duration_minutes: values.slot_duration_minutes
      });
      router.refresh();
    } catch {
      const msg = "Network error. Please check your connection and try again.";
      setError(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  });

  async function removeAvailability(id: string) {
    setDeletingId(id);
    setError(null);

    try {
      const response = await fetch(`/api/providers/availability?id=${id}`, {
        method: "DELETE"
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        const msg = payload?.error ?? "Unable to delete availability.";
        setError(msg);
        toastError(msg);
        return;
      }

      toastSuccess("Availability removed.");
      router.refresh();
    } catch {
      const msg = "Network error. Please check your connection and try again.";
      setError(msg);
      toastError(msg);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <Card className="p-6">
        <div>
          <h3 className="text-xl font-semibold text-ink">Availability settings</h3>
          <p className="mt-1 text-sm text-muted">Define the weekly booking windows patients can use when requesting appointments.</p>
        </div>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <input type="hidden" {...register("provider_id")} />

          <label className="block space-y-2 text-sm font-medium text-ink">
            <span>Day of week</span>
            <Select {...register("day_of_week")}>
              {dayLabels.map((label, index) => (
                <option key={label} value={String(index)}>
                  {label}
                </option>
              ))}
            </Select>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-2 text-sm font-medium text-ink">
              <span>Start time</span>
              <Input type="time" {...register("start_time")} />
            </label>
            <label className="block space-y-2 text-sm font-medium text-ink">
              <span>End time</span>
              <Input type="time" {...register("end_time")} />
            </label>
          </div>

          <label className="block space-y-2 text-sm font-medium text-ink">
            <span>Slot duration (minutes)</span>
            <Input type="number" min="15" step="15" {...register("slot_duration_minutes")} />
          </label>

          {error ? <p className="text-sm text-danger">{error}</p> : null}

          <Button disabled={loading} type="submit">
            {loading ? "Saving..." : "Save availability"}
          </Button>
        </form>
      </Card>

      <Card className="p-6">
        <div>
          <h3 className="text-xl font-semibold text-ink">Weekly schedule</h3>
          <p className="mt-1 text-sm text-muted">These windows are used to guide patient booking and appointment rescheduling.</p>
        </div>

        <div className="mt-5 space-y-3">
          {availability.length > 0 ? (
            availability.map((slot) => (
              <div key={slot.id} className="flex items-center justify-between gap-4 rounded-[20px] border border-border bg-surface-muted px-4 py-4">
                <div>
                  <p className="font-semibold text-ink">{dayLabels[slot.day_of_week]}</p>
                  <p className="mt-1 text-sm text-muted">{slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)} - {slot.slot_duration_minutes} min slots</p>
                </div>
                <Button disabled={deletingId === slot.id} onClick={() => removeAvailability(slot.id)} size="sm" variant="ghost">
                  {deletingId === slot.id ? "Removing..." : "Remove"}
                </Button>
              </div>
            ))
          ) : (
            <div className="rounded-[20px] border border-dashed border-border p-5 text-sm text-muted">No availability added yet.</div>
          )}
        </div>
      </Card>
    </div>
  );
}
