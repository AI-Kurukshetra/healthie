import { format } from "date-fns";

import { EmptyState } from "@/components/shared/empty-state";
import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { createSupabaseServerComponentClient } from "@/lib/supabase/server";
import { listPrescriptions } from "@/repositories/prescriptionRepository";
import type { Patient, Prescription } from "@/types/domain";

export default async function PatientPrescriptionsPage() {
  const { user } = await requireRole("patient");
  const supabase = createSupabaseServerComponentClient();
  const patientQuery = await supabase.from("patients").select("*").eq("user_id", user.id).single();
  const patient = (patientQuery.data ?? null) as Patient | null;

  if (!patient) {
    return <EmptyState description="A patient profile was not found for this user." title="Patient profile missing" />;
  }

  const prescriptionsQuery = await listPrescriptions(supabase, patient.id);
  const prescriptions = (prescriptionsQuery.data ?? []) as Prescription[];

  return (
    <div className="space-y-4">
      {prescriptions.length > 0 ? (
        prescriptions.map((prescription) => (
          <Card key={prescription.id} className="p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl font-semibold text-ink">{prescription.medication_name}</h2>
                <p className="mt-2 text-sm text-muted">{prescription.dosage}</p>
              </div>
              <p className="text-sm text-muted">{format(new Date(prescription.created_at), "MMM d, yyyy")}</p>
            </div>
            <p className="mt-4 text-sm leading-7 text-muted">{prescription.instructions}</p>
            <p className="mt-3 text-sm text-ink">Duration: <span className="text-muted">{prescription.duration}</span></p>
          </Card>
        ))
      ) : (
        <EmptyState description="Prescriptions will appear here once a provider issues them from the dashboard." title="No prescriptions" />
      )}
    </div>
  );
}
