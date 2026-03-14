"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { MedicalRecord, Patient, Provider } from "@/types/domain";

type RecordWithNames = MedicalRecord & { documentUrl?: string | null };

export function AdminMedicalRecordManager({
  records,
  patients,
  providers
}: {
  records: RecordWithNames[];
  patients: Patient[];
  providers: Provider[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function createRecord(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(event.currentTarget);

    const response = await fetch("/api/records", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patient_id: String(formData.get("patient_id") ?? ""),
        provider_id: String(formData.get("provider_id") ?? "") || null,
        diagnosis: String(formData.get("diagnosis") ?? ""),
        notes: String(formData.get("notes") ?? ""),
        treatment_plan: String(formData.get("treatment_plan") ?? "") || null
      })
    });

    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error ?? "Unable to create record.");
      setLoading(false);
      return;
    }

    event.currentTarget.reset();
    setLoading(false);
    router.refresh();
  }

  async function updateRecord(event: FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault();
    setBusyId(id);
    const formData = new FormData(event.currentTarget);
    await fetch("/api/records", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "medical_record",
        id,
        patient_id: String(formData.get("patient_id") ?? ""),
        provider_id: String(formData.get("provider_id") ?? "") || null,
        diagnosis: String(formData.get("diagnosis") ?? ""),
        notes: String(formData.get("notes") ?? ""),
        treatment_plan: String(formData.get("treatment_plan") ?? "") || null,
        document_path: String(formData.get("document_path") ?? "") || null
      })
    });
    setBusyId(null);
    router.refresh();
  }

  async function deleteRecord(id: string) {
    setBusyId(id);
    await fetch("/api/records", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "medical_record", id })
    });
    setBusyId(null);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-semibold text-ink">Create medical record</h2>
        <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={createRecord}>
          <Select defaultValue="" name="patient_id" required>
            <option value="" disabled>Select patient</option>
            {patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.user?.full_name ?? patient.user?.email ?? "Patient"}</option>)}
          </Select>
          <Select defaultValue="" name="provider_id">
            <option value="">No provider</option>
            {providers.map((provider) => <option key={provider.id} value={provider.id}>{provider.user?.full_name ?? provider.user?.email ?? "Provider"}</option>)}
          </Select>
          <Input name="diagnosis" placeholder="Diagnosis" required />
          <Input name="treatment_plan" placeholder="Treatment plan" />
          <div className="md:col-span-2"><Textarea name="notes" placeholder="Clinical notes" required /></div>
          {error ? <p className="text-sm text-danger md:col-span-2">{error}</p> : null}
          <div className="md:col-span-2"><Button disabled={loading} type="submit">{loading ? "Creating..." : "Create record"}</Button></div>
        </form>
      </Card>

      <div className="space-y-4">
        {records.map((record) => (
          <Card key={record.id} className="p-6">
            <form className="grid gap-4 md:grid-cols-2" onSubmit={(event) => updateRecord(event, record.id)}>
              <Select defaultValue={record.patient_id} name="patient_id" required>
                {patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.user?.full_name ?? patient.user?.email ?? "Patient"}</option>)}
              </Select>
              <Select defaultValue={record.provider_id ?? ""} name="provider_id">
                <option value="">No provider</option>
                {providers.map((provider) => <option key={provider.id} value={provider.id}>{provider.user?.full_name ?? provider.user?.email ?? "Provider"}</option>)}
              </Select>
              <Input defaultValue={record.diagnosis} name="diagnosis" required />
              <Input defaultValue={record.treatment_plan ?? ""} name="treatment_plan" />
              <div className="md:col-span-2"><Textarea defaultValue={record.notes} name="notes" required /></div>
              <Input defaultValue={record.document_path ?? ""} name="document_path" placeholder="Document path" />
              <div className="flex flex-wrap items-center gap-3 md:col-span-2">
                <Button disabled={busyId === record.id} type="submit" variant="secondary">{busyId === record.id ? "Saving..." : "Save changes"}</Button>
                <Button disabled={busyId === record.id} onClick={() => deleteRecord(record.id)} type="button" variant="danger">Delete</Button>
                {record.documentUrl ? <a className="text-sm font-semibold text-primary-deep" href={record.documentUrl} target="_blank">View document</a> : null}
              </div>
            </form>
          </Card>
        ))}
      </div>
    </div>
  );
}
