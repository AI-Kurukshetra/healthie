import Link from "next/link";
import { format } from "date-fns";

import { MedicalRecordForm } from "@/components/forms/medical-record-form";
import { EmptyState } from "@/components/shared/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { createSupabaseServerComponentClient } from "@/lib/supabase/server";
import { listMedicalRecords } from "@/repositories/recordRepository";
import { getProviderByUserId, listPatients } from "@/repositories/userRepository";
import { createMedicalDocumentSignedUrl } from "@/services/storageService";
import type { MedicalRecord, Patient, Provider } from "@/types/domain";

export default async function ProviderRecordsPage() {
  const { user } = await requireRole("provider");
  const supabase = createSupabaseServerComponentClient();
  const providerQuery = await getProviderByUserId(supabase, user.id);
  const provider = (providerQuery.data ?? null) as Provider | null;

  if (!provider) {
    return <EmptyState description="Provider profile missing for this account." title="Provider profile missing" />;
  }

  const [recordsQuery, patientsQuery] = await Promise.all([
    listMedicalRecords(supabase),
    listPatients(supabase)
  ]);

  const records = (recordsQuery.data ?? []) as MedicalRecord[];
  const patients = (patientsQuery.data ?? []) as Patient[];
  const patientNames = new Map(
    patients.map((patient) => [patient.id, patient.user?.full_name ?? patient.user?.email ?? "Patient"])
  );

  const recordsWithLinks = await Promise.all(
    records.map(async (record) => ({
      ...record,
      documentUrl: record.document_path ? await createMedicalDocumentSignedUrl(record.document_path) : null
    }))
  );

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <MedicalRecordForm
        patients={patients.map((patient) => ({
          id: patient.id,
          label: patient.user?.full_name ?? patient.user?.email ?? "Patient"
        }))}
        providerId={provider.id}
      />

      <div className="space-y-4">
        {recordsWithLinks.length > 0 ? (
          recordsWithLinks.map((record) => (
            <Card key={record.id} className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-semibold text-ink">{record.diagnosis}</h2>
                  <p className="mt-1 text-sm text-muted">{patientNames.get(record.patient_id) ?? "Patient"}</p>
                </div>
                <p className="text-sm text-muted">{format(new Date(record.created_at), "MMM d, yyyy")}</p>
              </div>
              <p className="mt-4 text-sm leading-7 text-muted">{record.notes}</p>
              {record.treatment_plan ? (
                <p className="mt-4 text-sm text-ink">Treatment plan: <span className="text-muted">{record.treatment_plan}</span></p>
              ) : null}
              {record.document_path ? (
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <span className="text-sm text-muted">Attached document available</span>
                  {record.documentUrl ? (
                    <Link className={buttonVariants({ size: "sm", variant: "secondary" })} href={record.documentUrl} target="_blank">
                      View document
                    </Link>
                  ) : (
                    <span className="text-sm text-muted">Signed link unavailable</span>
                  )}
                </div>
              ) : null}
            </Card>
          ))
        ) : (
          <EmptyState description="Medical records will appear here as providers document visits and upload files." title="No records" />
        )}
      </div>
    </div>
  );
}
