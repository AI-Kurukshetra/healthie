import { format } from "date-fns";

import { ChangePasswordForm } from "@/components/forms/change-password-form";
import { PatientSettingsForm } from "@/components/forms/patient-settings-form";
import { EmptyState } from "@/components/shared/empty-state";
import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { createSupabaseServerComponentClient } from "@/lib/supabase/server";
import type { Patient } from "@/types/domain";

export default async function PatientSettingsPage() {
  const { user, profile } = await requireRole("patient");
  const supabase = createSupabaseServerComponentClient();
  const patientQuery = await supabase.from("patients").select("*").eq("user_id", user.id).single();
  const patient = (patientQuery.data ?? null) as Patient | null;

  if (!patient) {
    return <EmptyState description="A patient profile was not found for this account." title="Patient profile missing" />;
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
      <PatientSettingsForm
        values={{
          full_name: profile.full_name ?? "",
          email: profile.email,
          date_of_birth: patient.date_of_birth ?? "",
          phone: patient.phone ?? "",
          emergency_contact: patient.emergency_contact ?? "",
          insurance_provider: patient.insurance_provider ?? "",
          avatar_url: profile.avatar_url ?? ""
        }}
      />

      <Card className="p-6">
        <h2 className="text-2xl font-semibold text-ink">Care access details</h2>
        <p className="mt-3 text-sm leading-7 text-muted">These values are used across appointments, records, and provider-facing workflows so your care team can identify and support you accurately.</p>
        <div className="mt-6 grid gap-4">
          <div className="rounded-[20px] bg-surface-muted p-4">
            <p className="text-sm font-medium text-muted">Profile created</p>
            <p className="mt-2 text-base font-semibold text-ink">{format(new Date(profile.created_at), "MMM d, yyyy")}</p>
          </div>
          <div className="rounded-[20px] bg-surface-muted p-4">
            <p className="text-sm font-medium text-muted">Portal role</p>
            <p className="mt-2 text-base font-semibold capitalize text-ink">{profile.role}</p>
          </div>
          <div className="rounded-[20px] bg-surface-muted p-4">
            <p className="text-sm font-medium text-muted">Current insurance</p>
            <p className="mt-2 text-base font-semibold text-ink">{patient.insurance_provider ?? "Not provided"}</p>
          </div>
        </div>
      </Card>

      <div className="xl:col-span-2">
        <ChangePasswordForm />
      </div>
    </div>
  );
}
