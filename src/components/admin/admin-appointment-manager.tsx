"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { Appointment, Patient, Provider } from "@/types/domain";

function toLocalInputValue(value: string) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

export function AdminAppointmentManager({
  appointments,
  patients,
  providers
}: {
  appointments: Appointment[];
  patients: Patient[];
  providers: Provider[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function createAppointment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(event.currentTarget);

    const response = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patient_id: String(formData.get("patient_id") ?? ""),
        provider_id: String(formData.get("provider_id") ?? ""),
        scheduled_at: new Date(String(formData.get("scheduled_at") ?? "")).toISOString(),
        status: String(formData.get("status") ?? "pending"),
        reason: String(formData.get("reason") ?? "")
      })
    });

    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error ?? "Unable to create appointment.");
      setLoading(false);
      return;
    }

    event.currentTarget.reset();
    setLoading(false);
    router.refresh();
  }

  async function updateAppointment(event: FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault();
    setBusyId(id);
    const formData = new FormData(event.currentTarget);
    await fetch(`/api/appointments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scheduled_at: new Date(String(formData.get("scheduled_at") ?? "")).toISOString(),
        status: String(formData.get("status") ?? "pending")
      })
    });
    setBusyId(null);
    router.refresh();
  }

  async function deleteAppointment(id: string) {
    setBusyId(id);
    await fetch(`/api/appointments/${id}`, { method: "DELETE" });
    setBusyId(null);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-semibold text-ink">Create appointment</h2>
        <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={createAppointment}>
          <Select defaultValue="" name="patient_id" required>
            <option value="" disabled>Select patient</option>
            {patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.user?.full_name ?? patient.user?.email ?? "Patient"}</option>)}
          </Select>
          <Select defaultValue="" name="provider_id" required>
            <option value="" disabled>Select provider</option>
            {providers.map((provider) => <option key={provider.id} value={provider.id}>{provider.user?.full_name ?? provider.user?.email ?? "Provider"}</option>)}
          </Select>
          <Input name="scheduled_at" required type="datetime-local" />
          <Select defaultValue="pending" name="status">
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </Select>
          <div className="md:col-span-2">
            <Input name="reason" placeholder="Reason" />
          </div>
          {error ? <p className="text-sm text-danger md:col-span-2">{error}</p> : null}
          <div className="md:col-span-2"><Button disabled={loading} type="submit">{loading ? "Creating..." : "Create appointment"}</Button></div>
        </form>
      </Card>

      <div className="space-y-4">
        {appointments.map((appointment) => (
          <Card key={appointment.id} className="p-6">
            <form className="grid gap-4 md:grid-cols-2" onSubmit={(event) => updateAppointment(event, appointment.id)}>
              <Input defaultValue={toLocalInputValue(appointment.scheduled_at)} name="scheduled_at" required type="datetime-local" />
              <Select defaultValue={appointment.status} name="status">
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </Select>
              <Input defaultValue={appointment.reason ?? ""} disabled />
              <Input defaultValue={appointment.video_link ?? ""} disabled />
              <div className="flex flex-wrap gap-3 md:col-span-2">
                <Button disabled={busyId === appointment.id} type="submit" variant="secondary">{busyId === appointment.id ? "Saving..." : "Save changes"}</Button>
                <Button disabled={busyId === appointment.id} onClick={() => deleteAppointment(appointment.id)} type="button" variant="danger">Delete</Button>
              </div>
            </form>
          </Card>
        ))}
      </div>
    </div>
  );
}
