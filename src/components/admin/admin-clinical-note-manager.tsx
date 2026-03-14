"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Appointment, ClinicalNote, Patient, Provider } from "@/types/domain";

export function AdminClinicalNoteManager({
  notes,
  appointments,
  patients,
  providers
}: {
  notes: ClinicalNote[];
  appointments: Appointment[];
  patients: Patient[];
  providers: Provider[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function createNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/records", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "clinical_note",
        appointment_id: String(formData.get("appointment_id") ?? ""),
        provider_id: String(formData.get("provider_id") ?? ""),
        patient_id: String(formData.get("patient_id") ?? ""),
        subjective: String(formData.get("subjective") ?? ""),
        objective: String(formData.get("objective") ?? ""),
        assessment: String(formData.get("assessment") ?? ""),
        plan: String(formData.get("plan") ?? "")
      })
    });
    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error ?? "Unable to create note.");
      setLoading(false);
      return;
    }

    event.currentTarget.reset();
    setLoading(false);
    router.refresh();
  }

  async function updateNote(event: FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault();
    setBusyId(id);
    const formData = new FormData(event.currentTarget);
    await fetch("/api/records", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "clinical_note",
        id,
        appointment_id: String(formData.get("appointment_id") ?? ""),
        provider_id: String(formData.get("provider_id") ?? ""),
        patient_id: String(formData.get("patient_id") ?? ""),
        subjective: String(formData.get("subjective") ?? ""),
        objective: String(formData.get("objective") ?? ""),
        assessment: String(formData.get("assessment") ?? ""),
        plan: String(formData.get("plan") ?? "")
      })
    });
    setBusyId(null);
    router.refresh();
  }

  async function deleteNote(id: string) {
    setBusyId(id);
    await fetch("/api/records", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "clinical_note", id })
    });
    setBusyId(null);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-semibold text-ink">Create clinical note</h2>
        <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={createNote}>
          <Select defaultValue="" name="appointment_id" required>
            <option value="" disabled>Select appointment</option>
            {appointments.map((appointment) => <option key={appointment.id} value={appointment.id}>{appointment.id.slice(0, 8)}</option>)}
          </Select>
          <Select defaultValue="" name="patient_id" required>
            <option value="" disabled>Select patient</option>
            {patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.user?.full_name ?? patient.user?.email ?? "Patient"}</option>)}
          </Select>
          <Select defaultValue="" name="provider_id" required>
            <option value="" disabled>Select provider</option>
            {providers.map((provider) => <option key={provider.id} value={provider.id}>{provider.user?.full_name ?? provider.user?.email ?? "Provider"}</option>)}
          </Select>
          <Input name="subjective" placeholder="Subjective" required />
          <Input name="objective" placeholder="Objective" required />
          <Input name="assessment" placeholder="Assessment" required />
          <div className="md:col-span-2"><Textarea name="plan" placeholder="Plan" required /></div>
          {error ? <p className="text-sm text-danger md:col-span-2">{error}</p> : null}
          <div className="md:col-span-2"><Button disabled={loading} type="submit">{loading ? "Creating..." : "Create note"}</Button></div>
        </form>
      </Card>

      <div className="space-y-4">
        {notes.map((note) => (
          <Card key={note.id} className="p-6">
            <form className="grid gap-4 md:grid-cols-2" onSubmit={(event) => updateNote(event, note.id)}>
              <Select defaultValue={note.appointment_id} name="appointment_id" required>
                {appointments.map((appointment) => <option key={appointment.id} value={appointment.id}>{appointment.id.slice(0, 8)}</option>)}
              </Select>
              <Select defaultValue={note.patient_id} name="patient_id" required>
                {patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.user?.full_name ?? patient.user?.email ?? "Patient"}</option>)}
              </Select>
              <Select defaultValue={note.provider_id} name="provider_id" required>
                {providers.map((provider) => <option key={provider.id} value={provider.id}>{provider.user?.full_name ?? provider.user?.email ?? "Provider"}</option>)}
              </Select>
              <Input defaultValue={note.subjective} name="subjective" required />
              <Input defaultValue={note.objective} name="objective" required />
              <Input defaultValue={note.assessment} name="assessment" required />
              <div className="md:col-span-2"><Textarea defaultValue={note.plan} name="plan" required /></div>
              <div className="flex flex-wrap gap-3 md:col-span-2">
                <Button disabled={busyId === note.id} type="submit" variant="secondary">{busyId === note.id ? "Saving..." : "Save changes"}</Button>
                <Button disabled={busyId === note.id} onClick={() => deleteNote(note.id)} type="button" variant="danger">Delete</Button>
              </div>
            </form>
          </Card>
        ))}
      </div>
    </div>
  );
}
