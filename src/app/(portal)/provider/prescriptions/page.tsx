import { format } from "date-fns";

import { PrescriptionForm } from "@/components/forms/prescription-form";
import { EmptyState } from "@/components/shared/empty-state";
import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { createSupabaseServerComponentClient } from "@/lib/supabase/server";
import { listPrescriptions } from "@/repositories/prescriptionRepository";
import { listPatients } from "@/repositories/userRepository";
import type { Patient, Prescription, Provider } from "@/types/domain";

export default async function ProviderPrescriptionsPage() {
  const { user } = await requireRole("provider");
  const supabase = createSupabaseServerComponentClient();
  const providerQuery = await supabase.from("providers").select("*").eq("user_id", user.id).single();
  const provider = (providerQuery.data ?? null) as Provider | null;

  if (!provider) {
    return <EmptyState description="Provider profile missing for this account." title="Provider profile missing" />;
  }

  const [prescriptionsQuery, patientsQuery] = await Promise.all([
    supabase.from("prescriptions").select("*").eq("provider_id", provider.id).order("created_at", { ascending: false }).limit(100),
    listPatients(supabase)
  ]);
  const providerPrescriptions = (prescriptionsQuery.data ?? []) as Prescription[];
  const patients = (patientsQuery.data ?? []) as Patient[];

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-ink">Issued prescriptions</h2>
        <div className="mt-5 space-y-3">
          {providerPrescriptions.length > 0 ? (
            providerPrescriptions.map((prescription) => (
              <div key={prescription.id} className="rounded-[20px] border border-border bg-surface-muted px-4 py-4">
                <p className="font-semibold text-ink">{prescription.medication_name}</p>
                <p className="mt-1 text-sm text-muted">{prescription.dosage}</p>
                <p className="mt-2 text-xs text-muted">{format(new Date(prescription.created_at), "MMM d, yyyy")}</p>
              </div>
            ))
          ) : (
            <EmptyState description="No prescriptions have been issued yet." title="No prescriptions" />
          )}
        </div>
      </Card>

      <PrescriptionForm
        patients={patients.map((patient) => ({
          id: patient.id,
          name: patient.user?.full_name ?? patient.user?.email ?? "Patient"
        }))}
        providerId={provider.id}
      />
    </div>
  );
}
