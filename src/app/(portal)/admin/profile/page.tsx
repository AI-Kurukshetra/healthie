import { format } from "date-fns";

import { AdminSettingsForm } from "@/components/forms/admin-settings-form";
import { ChangePasswordForm } from "@/components/forms/change-password-form";
import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";

export default async function AdminProfilePage() {
  const { profile } = await requireRole("admin");

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
      <AdminSettingsForm
        values={{
          full_name: profile.full_name ?? "",
          email: profile.email,
          avatar_url: profile.avatar_url ?? ""
        }}
      />

      <Card className="p-6">
        <h2 className="text-2xl font-semibold text-ink">Account details</h2>
        <p className="mt-3 text-sm leading-7 text-muted">Administrative account information visible across the platform.</p>
        <div className="mt-6 grid gap-4">
          <div className="rounded-[20px] bg-surface-muted p-4">
            <p className="text-sm font-medium text-muted">Profile created</p>
            <p className="mt-2 text-base font-semibold text-ink">{format(new Date(profile.created_at), "MMM d, yyyy")}</p>
          </div>
          <div className="rounded-[20px] bg-surface-muted p-4">
            <p className="text-sm font-medium text-muted">Portal role</p>
            <p className="mt-2 text-base font-semibold capitalize text-ink">{profile.role}</p>
          </div>
        </div>
      </Card>

      <div className="xl:col-span-2">
        <ChangePasswordForm />
      </div>
    </div>
  );
}
