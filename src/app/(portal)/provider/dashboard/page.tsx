import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { AppointmentCalendar } from "@/components/dashboard/appointment-calendar";
import { EmptyState } from "@/components/shared/empty-state";
import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { createSupabaseServerComponentClient } from "@/lib/supabase/server";
import { getProviderDashboardData } from "@/services/portalService";
import type { Provider } from "@/types/domain";

export default async function ProviderDashboardPage() {
  const { user } = await requireRole("provider");
  const supabase = createSupabaseServerComponentClient();
  const providerQuery = await supabase.from("providers").select("*").eq("user_id", user.id).single();
  const provider = (providerQuery.data ?? null) as Provider | null;

  if (!provider) {
    return <EmptyState description="Provider profile missing for this account." title="Provider profile missing" />;
  }

  const data = await getProviderDashboardData(supabase, provider.id);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardCard description="Total scheduled visit volume" title="Appointments" value={data.summary.total} tone="accent" />
        <DashboardCard description="Visits happening today" title="Today" value={data.summary.today} />
        <DashboardCard description="Future booked consultations" title="Upcoming" value={data.summary.upcoming} />
        <DashboardCard description="Patients in your roster" title="Patients" value={data.patients.length} />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <AppointmentCalendar appointments={data.appointments} />
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-ink">Operational snapshot</h2>
          <p className="mt-2 text-sm text-muted">A provider-facing summary styled for quick morning review.</p>
          <div className="mt-6 grid gap-4">
            <div className="rounded-[20px] bg-surface-muted p-4">
              <p className="text-sm font-medium text-muted">Prescriptions issued</p>
              <p className="mt-2 text-3xl font-semibold text-ink">{data.prescriptions.length}</p>
            </div>
            <div className="rounded-[20px] bg-surface-muted p-4">
              <p className="text-sm font-medium text-muted">Roster size</p>
              <p className="mt-2 text-3xl font-semibold text-ink">{data.patients.length}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
