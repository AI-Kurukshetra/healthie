"use client";

import Link from "next/link";
import { format } from "date-fns";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { buttonVariants, Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Appointment } from "@/types/domain";

type Props = {
  appointments: Appointment[];
  providerNames: Record<string, string>;
};

export function PatientAppointmentList({ appointments, providerNames }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [rescheduleValues, setRescheduleValues] = useState<Record<string, string>>({});

  async function updateAppointment(id: string, body: Record<string, unknown>) {
    setLoadingId(id);
    setError(null);

    const response = await fetch(`/api/appointments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error ?? "Unable to update appointment.");
      setLoadingId(null);
      return;
    }

    router.refresh();
    setLoadingId(null);
  }

  return (
    <div className="space-y-4">
      {appointments.map((appointment) => (
        <Card key={appointment.id} className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-semibold text-ink">{format(new Date(appointment.scheduled_at), "MMM d, yyyy h:mm a")}</p>
              <p className="mt-1 text-sm text-muted">{providerNames[appointment.provider_id] ?? "Provider"}</p>
              <p className="mt-1 text-sm text-muted">{appointment.reason ?? "General consultation"}</p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary-deep">{appointment.status}</p>
              {appointment.video_link ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link className={buttonVariants({ size: "sm" })} href={appointment.video_link}>
                    Join visit room
                  </Link>
                </div>
              ) : null}
            </div>

            <div className="w-full max-w-md space-y-3">
              <label className="block space-y-2 text-sm font-medium text-ink">
                <span>Reschedule</span>
                <Input
                  type="datetime-local"
                  value={rescheduleValues[appointment.id] ?? ""}
                  onChange={(event) => setRescheduleValues((current) => ({ ...current, [appointment.id]: event.target.value }))}
                />
              </label>
              <div className="flex flex-wrap gap-2">
                <Button
                  disabled={loadingId === appointment.id || !rescheduleValues[appointment.id]}
                  onClick={() => updateAppointment(appointment.id, {
                    scheduled_at: new Date(rescheduleValues[appointment.id]).toISOString(),
                    status: "pending"
                  })}
                  size="sm"
                  variant="secondary"
                >
                  {loadingId === appointment.id ? "Saving..." : "Reschedule"}
                </Button>
                <Button
                  disabled={loadingId === appointment.id || appointment.status === "cancelled"}
                  onClick={() => updateAppointment(appointment.id, { status: "cancelled" })}
                  size="sm"
                  variant="danger"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ))}
      {error ? <p className="text-sm text-danger">{error}</p> : null}
    </div>
  );
}
