import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { createSupabaseServerComponentClient } from "@/lib/supabase/server";
import { getAdminDashboardData } from "@/services/portalService";

export default async function AdminDashboardPage() {
  await requireRole("admin");
  const supabase = createSupabaseServerComponentClient();
  const data = await getAdminDashboardData(supabase);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardCard description="Registered patient accounts" title="Patients" value={data.patients.length} tone="accent" />
        <DashboardCard description="Registered provider accounts" title="Providers" value={data.providers.length} />
        <DashboardCard description="Total appointment volume" title="Appointments" value={data.appointments.length} />
        <DashboardCard description="Total prescriptions issued" title="Prescriptions" value={data.prescriptions.length} />
      </div>
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-ink">Platform oversight</h2>
        <p className="mt-3 text-sm leading-7 text-muted">The admin dashboard mirrors the same card rhythm and structural language as the provider workspace while focusing on cross-platform visibility.</p>
      </Card>
    </div>
  );
}
