export const dynamic = "force-dynamic";

import Link from "next/link";
import { format, subDays, eachDayOfInterval } from "date-fns";
import { CalendarDays, Pill, ShieldCheck, Users, UserPlus } from "lucide-react";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { MiniDonut, MiniBarChart, SparklineCard } from "@/components/dashboard/dashboard-charts";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getAdminDashboardData } from "@/services/portalService";

const statusColors: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700",
  confirmed: "bg-emerald-50 text-emerald-700",
  completed: "bg-slate-50 text-slate-600",
  cancelled: "bg-red-50 text-red-600"
};

export default async function AdminDashboardPage() {
  await requireRole("admin");
  const supabase = createSupabaseAdminClient() as any;
  const data = await getAdminDashboardData(supabase);

  const sortedAppointments = [...data.appointments].sort(
    (left, right) => new Date(right.scheduled_at).getTime() - new Date(left.scheduled_at).getTime()
  );
  const pendingCount = data.appointments.filter((a) => a.status === "pending").length;
  const confirmedCount = data.appointments.filter((a) => a.status === "confirmed").length;
  const completedCount = data.appointments.filter((a) => a.status === "completed").length;
  const cancelledCount = data.appointments.filter((a) => a.status === "cancelled").length;
  const providerCoverage = data.providers.length > 0 ? Math.round(data.patients.length / data.providers.length) : 0;

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardCard icon={Users} description="Registered accounts" title="Patients" value={data.patients.length} tone="accent" />
        <DashboardCard icon={ShieldCheck} description="Active providers" title="Providers" value={data.providers.length} />
        <DashboardCard icon={CalendarDays} description="Total visit volume" title="Appointments" value={data.appointments.length} />
        <DashboardCard icon={Pill} description="Prescriptions issued" title="Prescriptions" value={data.prescriptions.length} />
      </div>

      {/* Status Breakdown + Coverage */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-ink">Appointment breakdown</h3>
            <Link href="/admin/appointments" className="text-xs font-medium text-primary hover:underline">Manage</Link>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl bg-amber-50 px-4 py-3 text-center">
              <p className="text-2xl font-bold text-amber-700">{pendingCount}</p>
              <p className="text-xs font-medium text-amber-600">Pending</p>
            </div>
            <div className="rounded-xl bg-emerald-50 px-4 py-3 text-center">
              <p className="text-2xl font-bold text-emerald-700">{confirmedCount}</p>
              <p className="text-xs font-medium text-emerald-600">Confirmed</p>
            </div>
            <div className="rounded-xl bg-blue-50 px-4 py-3 text-center">
              <p className="text-2xl font-bold text-blue-700">{completedCount}</p>
              <p className="text-xs font-medium text-blue-600">Completed</p>
            </div>
            <div className="rounded-xl bg-red-50 px-4 py-3 text-center">
              <p className="text-2xl font-bold text-red-700">{cancelledCount}</p>
              <p className="text-xs font-medium text-red-600">Cancelled</p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold text-ink">Coverage ratio</h3>
          <div className="mt-4 flex items-end gap-2">
            <span className="text-4xl font-bold text-ink">{providerCoverage}:1</span>
          </div>
          <p className="mt-2 text-xs text-muted">Patient-to-provider ratio</p>
          <div className="mt-4 flex gap-2">
            <Link href="/admin/providers" className={buttonVariants({ size: "sm", variant: "secondary" })}>
              <UserPlus className="mr-1.5 h-3.5 w-3.5" /> Add provider
            </Link>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-3">
        <MiniDonut
          title="Appointment status"
          data={[
            { name: "Pending", value: pendingCount, color: "#f59e0b" },
            { name: "Confirmed", value: confirmedCount, color: "#10b981" },
            { name: "Completed", value: completedCount, color: "#3b82f6" },
            { name: "Cancelled", value: cancelledCount, color: "#ef4444" }
          ].filter((d) => d.value > 0)}
        />
        <MiniBarChart
          title="Platform overview"
          data={[
            { name: "Patients", value: data.patients.length, color: "#3b82f6" },
            { name: "Providers", value: data.providers.length, color: "#10b981" },
            { name: "Appts", value: data.appointments.length, color: "#8b5cf6" },
            { name: "Rx", value: data.prescriptions.length, color: "#f59e0b" }
          ]}
        />
        <SparklineCard
          title="Appointments"
          value={data.appointments.length}
          subtitle="Total visit volume over time"
          data={eachDayOfInterval({ start: subDays(new Date(), 13), end: new Date() }).map((day) => ({
            v: data.appointments.filter((a) => format(new Date(a.created_at), "yyyy-MM-dd") <= format(day, "yyyy-MM-dd")).length
          }))}
        />
      </div>

      {/* Recent Appointments + Quick Admin */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-ink">Recent appointments</h3>
            <Link href="/admin/appointments" className="text-xs font-medium text-primary hover:underline">View all</Link>
          </div>
          <div className="mt-4 space-y-2">
            {sortedAppointments.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted">No appointments yet</p>
            ) : (
              sortedAppointments.slice(0, 5).map((appointment) => (
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

        <Card className="p-5">
          <h3 className="text-sm font-semibold text-ink">Admin actions</h3>
          <div className="mt-4 space-y-2">
            {[
              { href: "/admin/patients", label: "Patient management", desc: `${data.patients.length} registered patients`, icon: Users },
              { href: "/admin/providers", label: "Provider management", desc: `${data.providers.length} active providers`, icon: ShieldCheck },
              { href: "/admin/prescriptions", label: "Prescription oversight", desc: `${data.prescriptions.length} issued prescriptions`, icon: Pill },
              { href: "/admin/analytics", label: "Analytics", desc: "Platform metrics & insights", icon: CalendarDays }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} className="group flex items-center gap-3 rounded-xl bg-surface-muted px-3 py-2.5 transition-colors hover:bg-primary-soft">
                  <Icon className="h-4 w-4 text-muted group-hover:text-primary-deep" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-ink">{item.label}</p>
                    <p className="text-xs text-muted">{item.desc}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
