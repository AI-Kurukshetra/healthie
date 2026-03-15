import { format } from "date-fns";

import { ChangePasswordForm } from "@/components/forms/change-password-form";
import { ProviderSettingsForm } from "@/components/forms/provider-settings-form";
import { EmptyState } from "@/components/shared/empty-state";
import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { createSupabaseServerComponentClient } from "@/lib/supabase/server";
import type { Provider } from "@/types/domain";

export default async function ProviderSettingsPage() {
  const { user, profile } = await requireRole("provider");
  const supabase = createSupabaseServerComponentClient();
  const providerQuery = await supabase.from("providers").select("*").eq("user_id", user.id).single();
  const provider = (providerQuery.data ?? null) as Provider | null;

  if (!provider) {
    return <EmptyState description="Provider profile missing for this account." title="Provider profile missing" />;
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
      <ProviderSettingsForm
        values={{
          full_name: profile.full_name ?? "",
          email: profile.email,
          specialty: provider.specialty ?? "",
          license_number: provider.license_number ?? "",
          bio: provider.bio ?? "",
          avatar_url: profile.avatar_url ?? ""
        }}
      />

      <Card className="p-6">
        <h2 className="text-2xl font-semibold text-ink">Workspace profile</h2>
        <p className="mt-3 text-sm leading-7 text-muted">These details shape how patients and administrative users see your profile across appointments, records, and prescriptions.</p>
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
            <p className="text-sm font-medium text-muted">Current specialty</p>
            <p className="mt-2 text-base font-semibold text-ink">{provider.specialty ?? "Not provided"}</p>
          </div>
        </div>
      </Card>

      <div className="xl:col-span-2">
        <ChangePasswordForm />
      </div>
    </div>
  );
}
