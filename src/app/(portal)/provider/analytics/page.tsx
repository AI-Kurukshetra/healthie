import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { createSupabaseServerComponentClient } from "@/lib/supabase/server";
import { getProviderDashboardData } from "@/services/portalService";
import type { Provider } from "@/types/domain";

export default async function ProviderAnalyticsPage() {
  const { user } = await requireRole("provider");
  const supabase = createSupabaseServerComponentClient();
  const providerQuery = await supabase.from("providers").select("*").eq("user_id", user.id).single();
  const provider = (providerQuery.data ?? null) as Provider | null;

  if (!provider) {
    return <EmptyState description="Provider profile missing for this account." title="Provider profile missing" />;
  }

  const data = await getProviderDashboardData(supabase, provider.id);
  const completionRate = data.summary.total === 0 ? 0 : Math.round((data.appointments.filter((item) => item.status === "completed").length / data.summary.total) * 100);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <DashboardCard description="Total appointment volume" title="Visits" value={data.summary.total} tone="accent" />
        <DashboardCard description="Completed appointment rate" title="Completion" value={`${completionRate}%`} />
        <DashboardCard description="Prescriptions issued" title="Medication workflows" value={data.prescriptions.length} />
      </div>
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-ink">Analytics snapshot</h2>
        <p className="mt-3 text-sm leading-7 text-muted">This phase 1 analytics page establishes the information architecture for reporting without overcomplicating the data model.</p>
      </Card>
    </div>
  );
}
