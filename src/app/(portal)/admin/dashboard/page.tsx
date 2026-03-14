import Link from "next/link";
import { format } from "date-fns";
import { CalendarDays, Pill, Users } from "lucide-react";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { createSupabaseServerComponentClient } from "@/lib/supabase/server";
import { getAdminDashboardData } from "@/services/portalService";

export default async function AdminDashboardPage() {
  await requireRole("admin");
  const supabase = createSupabaseServerComponentClient();
  const data = await getAdminDashboardData(supabase);

  const sortedAppointments = [...data.appointments].sort(
    (left, right) => new Date(right.scheduled_at).getTime() - new Date(left.scheduled_at).getTime()
  );
  const pendingAppointments = data.appointments.filter((appointment) => appointment.status === "pending").length;
  const confirmedAppointments = data.appointments.filter((appointment) => appointment.status === "confirmed").length;
  const completedAppointments = data.appointments.filter((appointment) => appointment.status === "completed").length;
  const cancelledAppointments = data.appointments.filter((appointment) => appointment.status === "cancelled").length;
  const providerCoverage = data.providers.length > 0 ? Math.round(data.patients.length / data.providers.length) : 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardCard description="Registered patient accounts" title="Patients" value={data.patients.length} tone="accent" />
        <DashboardCard description="Registered provider accounts" title="Providers" value={data.providers.length} />
        <DashboardCard description="Total appointment volume" title="Appointments" value={data.appointments.length} />
        <DashboardCard description="Total prescriptions issued" title="Prescriptions" value={data.prescriptions.length} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <Card className="overflow-hidden border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.98)_0%,rgba(235,245,255,0.98)_100%)] p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <Badge>Platform oversight</Badge>
              <h2 className="mt-4 text-2xl font-semibold text-ink">Keep account growth, clinical operations, and appointment flow on one page.</h2>
              <p className="mt-3 text-sm leading-7 text-muted">The admin landing screen now prioritizes operational totals, queue distribution, and the fastest links into the modules that usually need attention.</p>
            </div>
            <div className="rounded-[22px] border border-primary/15 bg-white/90 px-4 py-4 shadow-soft">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-deep">Provider coverage</p>
              <p className="mt-2 text-3xl font-semibold text-ink">{providerCoverage}:1</p>
              <p className="mt-1 text-sm text-muted">Approximate patient-to-provider ratio.</p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link className={buttonVariants({ size: "sm" })} href="/admin/appointments">
              Review appointments
            </Link>
            <Link className={buttonVariants({ size: "sm", variant: "secondary" })} href="/admin/providers">
              Manage providers
            </Link>
            <Link className={buttonVariants({ size: "sm", variant: "ghost" })} href="/admin/analytics">
              Open analytics
            </Link>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[20px] bg-white/90 p-4 shadow-soft">
              <p className="text-sm font-medium text-muted">Pending</p>
              <p className="mt-2 text-3xl font-semibold text-ink">{pendingAppointments}</p>
            </div>
            <div className="rounded-[20px] bg-white/90 p-4 shadow-soft">
              <p className="text-sm font-medium text-muted">Confirmed</p>
              <p className="mt-2 text-3xl font-semibold text-ink">{confirmedAppointments}</p>
            </div>
            <div className="rounded-[20px] bg-white/90 p-4 shadow-soft">
              <p className="text-sm font-medium text-muted">Completed</p>
              <p className="mt-2 text-3xl font-semibold text-ink">{completedAppointments}</p>
            </div>
            <div className="rounded-[20px] bg-white/90 p-4 shadow-soft">
              <p className="text-sm font-medium text-muted">Cancelled</p>
              <p className="mt-2 text-3xl font-semibold text-ink">{cancelledAppointments}</p>
            </div>
          </div>
        </Card>

        <Card className="border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(246,250,253,0.98)_100%)] p-6">
          <h2 className="text-xl font-semibold text-ink">System pulse</h2>
          <p className="mt-2 text-sm text-muted">A fast read on workload, account mix, and prescription activity.</p>

          <div className="mt-6 space-y-3">
            {[
              {
                icon: Users,
                label: "Directory health",
                value: `${data.patients.length + data.providers.length} total clinical accounts`,
                detail: `${data.patients.length} patients and ${data.providers.length} providers are currently registered.`
              },
              {
                icon: CalendarDays,
                label: "Appointment throughput",
                value: `${data.appointments.length} total appointments`,
                detail: `${confirmedAppointments} confirmed and ${pendingAppointments} pending visits currently sit in the system.`
              },
              {
                icon: Pill,
                label: "Medication activity",
                value: `${data.prescriptions.length} prescriptions`,
                detail: "Use prescriptions and records pages together when reviewing care quality and workflow completeness."
              }
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.label} className="flex items-start gap-3 rounded-[22px] border border-border/80 bg-white p-4 shadow-soft">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] bg-primary-soft text-primary-deep">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-ink">{item.label}</p>
                      <Badge className="bg-white">{item.value}</Badge>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted">{item.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(246,250,253,0.98)_100%)] p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-ink">Recent appointments</h2>
              <p className="mt-2 text-sm text-muted">The newest scheduling activity without opening the full management view.</p>
            </div>
            <Link className={buttonVariants({ variant: "secondary", size: "sm" })} href="/admin/appointments">
              Appointment queue
            </Link>
          </div>

          <div className="mt-6 space-y-3">
            {sortedAppointments.length === 0 ? (
              <div className="rounded-[20px] border border-dashed border-border p-5 text-sm text-muted">No appointments have been created yet.</div>
            ) : (
              sortedAppointments.slice(0, 5).map((appointment) => (
                <div key={appointment.id} className="rounded-[22px] border border-border/80 bg-white p-4 shadow-soft">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-ink">{format(new Date(appointment.scheduled_at), "EEE, MMM d - h:mm a")}</p>
                      <p className="mt-1 text-sm text-muted">{appointment.reason ?? "General consultation"}</p>
                    </div>
                    <Badge className="capitalize bg-white">{appointment.status}</Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(246,250,253,0.98)_100%)] p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-ink">Administrative focus</h2>
              <p className="mt-2 text-sm text-muted">Suggested routes based on the operational mix already visible in the system.</p>
            </div>
            <Link className={buttonVariants({ variant: "ghost", size: "sm" })} href="/admin/settings">
              Settings
            </Link>
          </div>

          <div className="mt-6 grid gap-3">
            <div className="rounded-[22px] border border-border/80 bg-white p-4 shadow-soft">
              <p className="text-sm font-semibold text-ink">Provider operations</p>
              <p className="mt-2 text-sm leading-6 text-muted">Use the provider directory when the patient-to-provider ratio starts widening or onboarding needs attention.</p>
            </div>
            <div className="rounded-[22px] border border-border/80 bg-white p-4 shadow-soft">
              <p className="text-sm font-semibold text-ink">Clinical governance</p>
              <p className="mt-2 text-sm leading-6 text-muted">Records, notes, and prescriptions should be reviewed together to understand documentation completeness.</p>
            </div>
            <div className="rounded-[22px] border border-border/80 bg-white p-4 shadow-soft">
              <p className="text-sm font-semibold text-ink">Queue management</p>
              <p className="mt-2 text-sm leading-6 text-muted">Pending and cancelled appointments are the clearest signs of scheduling friction. Start there before opening broader analytics.</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
