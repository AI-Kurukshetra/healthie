import Link from "next/link";
import { format } from "date-fns";
import { ClipboardList, Pill, Users } from "lucide-react";

import { AppointmentCalendar } from "@/components/dashboard/appointment-calendar";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
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
  const sortedAppointments = [...data.appointments].sort(
    (left, right) => new Date(left.scheduled_at).getTime() - new Date(right.scheduled_at).getTime()
  );
  const upcomingAppointments = sortedAppointments.filter((appointment) => new Date(appointment.scheduled_at).getTime() >= Date.now());
  const pendingAppointments = data.appointments.filter((appointment) => appointment.status === "pending").length;
  const confirmedAppointments = data.appointments.filter((appointment) => appointment.status === "confirmed").length;
  const completedAppointments = data.appointments.filter((appointment) => appointment.status === "completed").length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardCard description="Total scheduled visit volume" title="Appointments" value={data.summary.total} tone="accent" />
        <DashboardCard description="Visits happening today" title="Today" value={data.summary.today} />
        <DashboardCard description="Future booked consultations" title="Upcoming" value={data.summary.upcoming} />
        <DashboardCard description="Patients in your roster" title="Patients" value={data.patients.length} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(340px,0.95fr)]">
        <Card className="overflow-hidden border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.98)_0%,rgba(235,245,255,0.98)_100%)] p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <Badge>Provider dashboard</Badge>
              <h2 className="mt-4 text-2xl font-semibold text-ink">Start with your queue, then move directly into care tasks.</h2>
              <p className="mt-3 text-sm leading-7 text-muted">This landing page keeps today&apos;s load, the next appointments, and the fastest links into notes, prescriptions, and patient management close together.</p>
            </div>
            <div className="rounded-[22px] border border-primary/15 bg-white/90 px-4 py-4 shadow-soft">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-deep">Next appointment</p>
              <p className="mt-2 text-lg font-semibold text-ink">
                {upcomingAppointments[0] ? format(new Date(upcomingAppointments[0].scheduled_at), "MMM d, h:mm a") : "No future booking"}
              </p>
              <p className="mt-1 text-sm text-muted">{upcomingAppointments[0]?.reason ?? "Open appointments to create the next visit."}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="rounded-[24px] border border-border/80 bg-white/90 p-5 shadow-soft">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-deep">Quick actions</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link className={buttonVariants({ size: "sm" })} href="/provider/appointments">
                  Open schedule
                </Link>
                <Link className={buttonVariants({ size: "sm", variant: "secondary" })} href="/provider/notes">
                  Write notes
                </Link>
                <Link className={buttonVariants({ size: "sm", variant: "ghost" })} href="/provider/prescriptions">
                  Review prescriptions
                </Link>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-[20px] bg-surface-muted p-4">
                  <p className="text-sm font-medium text-muted">Pending</p>
                  <p className="mt-2 text-3xl font-semibold text-ink">{pendingAppointments}</p>
                </div>
                <div className="rounded-[20px] bg-surface-muted p-4">
                  <p className="text-sm font-medium text-muted">Confirmed</p>
                  <p className="mt-2 text-3xl font-semibold text-ink">{confirmedAppointments}</p>
                </div>
                <div className="rounded-[20px] bg-surface-muted p-4">
                  <p className="text-sm font-medium text-muted">Completed</p>
                  <p className="mt-2 text-3xl font-semibold text-ink">{completedAppointments}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-[22px] border border-border/80 bg-white/80 p-4">
                <p className="text-sm font-medium text-muted">Today&apos;s visits</p>
                <p className="mt-2 text-3xl font-semibold text-ink">{data.summary.today}</p>
              </div>
              <div className="rounded-[22px] border border-border/80 bg-white/80 p-4">
                <p className="text-sm font-medium text-muted">Patients in roster</p>
                <p className="mt-2 text-3xl font-semibold text-ink">{data.patients.length}</p>
              </div>
              <div className="rounded-[22px] border border-border/80 bg-white/80 p-4">
                <p className="text-sm font-medium text-muted">Prescriptions issued</p>
                <p className="mt-2 text-3xl font-semibold text-ink">{data.prescriptions.length}</p>
              </div>
            </div>
          </div>
        </Card>

        <AppointmentCalendar appointments={sortedAppointments} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(246,250,253,0.98)_100%)] p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-ink">Next in the queue</h2>
              <p className="mt-2 text-sm text-muted">The earliest upcoming appointments so you can prepare before opening the full schedule.</p>
            </div>
            <Link className={buttonVariants({ variant: "secondary", size: "sm" })} href="/provider/appointments">
              All appointments
            </Link>
          </div>

          <div className="mt-6 space-y-3">
            {upcomingAppointments.length === 0 ? (
              <div className="rounded-[20px] border border-dashed border-border p-5 text-sm text-muted">No future appointments scheduled.</div>
            ) : (
              upcomingAppointments.slice(0, 5).map((appointment) => (
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
              <h2 className="text-xl font-semibold text-ink">Practice snapshot</h2>
              <p className="mt-2 text-sm text-muted">A quick operational summary that complements the detailed pages.</p>
            </div>
            <Link className={buttonVariants({ variant: "ghost", size: "sm" })} href="/provider/patients">
              Patient roster
            </Link>
          </div>

          <div className="mt-6 space-y-3">
            {[
              {
                icon: Users,
                label: "Roster",
                value: `${data.patients.length} patients`,
                detail: "Open the patients page to review histories, demographics, and care relationships."
              },
              {
                icon: ClipboardList,
                label: "Documentation",
                value: `${pendingAppointments} appointments may need follow-up`,
                detail: "Use clinical notes after visits to keep records structured and easy to review."
              },
              {
                icon: Pill,
                label: "Medication workflow",
                value: `${data.prescriptions.length} prescriptions issued`,
                detail: "Review active medication plans and update them from the prescriptions section."
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
    </div>
  );
}
