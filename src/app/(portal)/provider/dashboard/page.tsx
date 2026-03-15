import Link from "next/link";
import { format, subDays, eachDayOfInterval } from "date-fns";
import { CalendarDays, ClipboardList, Pill, Users } from "lucide-react";

import { AppointmentCalendar } from "@/components/dashboard/appointment-calendar";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { MiniDonut, MiniBarChart, SparklineCard } from "@/components/dashboard/dashboard-charts";
import { EmptyState } from "@/components/shared/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { createSupabaseServerComponentClient } from "@/lib/supabase/server";
import { getProviderDashboardData } from "@/services/portalService";
import type { Provider } from "@/types/domain";

const statusColors: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700",
  confirmed: "bg-emerald-50 text-emerald-700",
  completed: "bg-slate-50 text-slate-600",
  cancelled: "bg-red-50 text-red-600"
};

export default async function ProviderDashboardPage() {
  const { user } = await requireRole("provider");
  const supabase = createSupabaseServerComponentClient();
  const providerQuery = await supabase.from("providers").select("*").eq("user_id", user.id).single();
  const provider = (providerQuery.data ?? null) as Provider | null;

  if (!provider) {
    return <EmptyState description="Provider profile missing for this account." title="Provider profile missing" />;
  }

  const data = await getProviderDashboardData(supabase, provider.id);
  const sortedAppointments = [...data.appointments].sort(
    (left, right) => new Date(left.scheduled_at).getTime() - new Date(right.scheduled_at).getTime()
  );
  const upcomingAppointments = sortedAppointments.filter((a) => new Date(a.scheduled_at).getTime() >= Date.now());
  const todayAppointments = data.summary.today;
  const pendingCount = data.appointments.filter((a) => a.status === "pending").length;
  const confirmedCount = data.appointments.filter((a) => a.status === "confirmed").length;
  const completedCount = data.appointments.filter((a) => a.status === "completed").length;
  const cancelledCount = data.appointments.filter((a) => a.status === "cancelled").length;

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardCard icon={CalendarDays} description="Total scheduled visits" title="Appointments" value={data.summary.total} tone="accent" />
        <DashboardCard icon={CalendarDays} description="Visits happening today" title="Today" value={todayAppointments} tone={todayAppointments > 0 ? "warning" : "default"} />
        <DashboardCard icon={Users} description="Patients in your roster" title="Patients" value={data.patientIds.length} />
        <DashboardCard icon={Pill} description="Prescriptions issued" title="Prescriptions" value={data.prescriptions.length} />
      </div>

      {/* Main content grid */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        {/* Left: Queue + Actions */}
        <div className="space-y-6">
          {/* Status overview */}
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-ink">Appointment status</h3>
              <Link href="/provider/appointments" className="text-xs font-medium text-primary hover:underline">Open schedule</Link>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-amber-50 px-4 py-3 text-center">
                <p className="text-2xl font-bold text-amber-700">{pendingCount}</p>
                <p className="text-xs font-medium text-amber-600">Pending</p>
              </div>
              <div className="rounded-xl bg-emerald-50 px-4 py-3 text-center">
                <p className="text-2xl font-bold text-emerald-700">{confirmedCount}</p>
                <p className="text-xs font-medium text-emerald-600">Confirmed</p>
              </div>
              <div className="rounded-xl bg-blue-50 px-4 py-3 text-center">
                <p className="text-2xl font-bold text-blue-700">{upcomingAppointments.length}</p>
                <p className="text-xs font-medium text-blue-600">Upcoming</p>
              </div>
            </div>
          </Card>

          {/* Charts */}
          <div className="grid gap-6 sm:grid-cols-2">
            <MiniDonut
              title="Status breakdown"
              data={[
                { name: "Pending", value: pendingCount, color: "#f59e0b" },
                { name: "Confirmed", value: confirmedCount, color: "#10b981" },
                { name: "Completed", value: completedCount, color: "#3b82f6" },
                { name: "Cancelled", value: cancelledCount, color: "#ef4444" }
              ].filter((d) => d.value > 0)}
            />
            <SparklineCard
              title="Appointment trend"
              value={data.summary.total}
              subtitle="Total visits over time"
              data={eachDayOfInterval({ start: subDays(new Date(), 13), end: new Date() }).map((day) => ({
                v: data.appointments.filter((a) => format(new Date(a.created_at), "yyyy-MM-dd") <= format(day, "yyyy-MM-dd")).length
              }))}
            />
          </div>

          {/* Next in queue */}
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-ink">Next in queue</h3>
              <Link href="/provider/appointments" className="text-xs font-medium text-primary hover:underline">View all</Link>
            </div>
            <div className="mt-4 space-y-2">
              {upcomingAppointments.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted">No upcoming appointments</p>
              ) : (
                upcomingAppointments.slice(0, 5).map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between rounded-xl bg-surface-muted px-3 py-2.5">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink">{format(new Date(appointment.scheduled_at), "EEE, MMM d - h:mm a")}</p>
                      <p className="text-xs text-muted">{appointment.reason ?? "General consultation"}</p>
                    </div>
                    <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold capitalize ${statusColors[appointment.status] ?? ""}`}>
                      {appointment.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Quick Actions */}
          <div className="grid gap-3 sm:grid-cols-3">
            <Link href="/provider/notes" className="group flex items-center gap-3 rounded-card border border-border bg-white p-4 shadow-soft transition-all hover:border-primary/30 hover:shadow-card">
              <ClipboardList className="h-5 w-5 text-primary-deep" />
              <div>
                <p className="text-sm font-semibold text-ink">Write notes</p>
                <p className="text-xs text-muted">SOAP documentation</p>
              </div>
            </Link>
            <Link href="/provider/prescriptions" className="group flex items-center gap-3 rounded-card border border-border bg-white p-4 shadow-soft transition-all hover:border-primary/30 hover:shadow-card">
              <Pill className="h-5 w-5 text-primary-deep" />
              <div>
                <p className="text-sm font-semibold text-ink">Prescriptions</p>
                <p className="text-xs text-muted">Manage medications</p>
              </div>
            </Link>
            <Link href="/provider/patients" className="group flex items-center gap-3 rounded-card border border-border bg-white p-4 shadow-soft transition-all hover:border-primary/30 hover:shadow-card">
              <Users className="h-5 w-5 text-primary-deep" />
              <div>
                <p className="text-sm font-semibold text-ink">Patient roster</p>
                <p className="text-xs text-muted">{data.patientIds.length} patients</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Right: Calendar */}
        <AppointmentCalendar appointments={sortedAppointments} />
      </div>
    </div>
  );
}
