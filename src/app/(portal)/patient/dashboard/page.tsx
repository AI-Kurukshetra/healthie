import Link from "next/link";
import { format, subDays, eachDayOfInterval } from "date-fns";
import { ArrowRight, CalendarDays, FileText, MessageSquare, Pill, Settings, Video } from "lucide-react";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { MiniDonut, SparklineCard } from "@/components/dashboard/dashboard-charts";
import { EmptyState } from "@/components/shared/empty-state";
import { SetupBanner } from "@/components/layout/setup-banner";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { hasSupabaseEnv } from "@/lib/env";
import { requireRole } from "@/lib/auth";
import { createSupabaseServerComponentClient } from "@/lib/supabase/server";
import { getPatientDashboardData } from "@/services/portalService";
import type { Patient } from "@/types/domain";

function formatOptionalDate(value: string | null) {
  if (!value) return "Not set";
  return format(new Date(value), "MMM d, yyyy");
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  completed: "bg-slate-50 text-slate-600 border-slate-200",
  cancelled: "bg-red-50 text-red-600 border-red-200"
};

export default async function PatientDashboardPage() {
  if (!hasSupabaseEnv) {
    return <SetupBanner />;
  }

  const { user, profile } = await requireRole("patient");
  const supabase = createSupabaseServerComponentClient();
  const patientQuery = await supabase.from("patients").select("*").eq("user_id", user.id).single();
  const patient = (patientQuery.data ?? null) as Patient | null;

  if (!patient) {
    return <EmptyState description="A patient profile was not found for this account." title="Patient profile missing" />;
  }

  const data = await getPatientDashboardData(supabase, patient.id, user.id);
  const sortedAppointments = [...data.appointments].sort(
    (left, right) => new Date(left.scheduled_at).getTime() - new Date(right.scheduled_at).getTime()
  );
  const upcomingAppointments = sortedAppointments.filter((a) => new Date(a.scheduled_at).getTime() >= Date.now()).slice(0, 4);
  const recentRecords = [...data.records].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 3);
  const recentPrescriptions = [...data.prescriptions].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 3);
  const completedProfileItems = [profile.full_name, patient.date_of_birth, patient.phone, patient.emergency_contact, patient.insurance_provider].filter(Boolean).length;
  const profileCompletion = Math.round((completedProfileItems / 5) * 100);

  return (
    <div className="space-y-6">
      {/* Welcome + Quick Stats */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted">Welcome back,</p>
          <h2 className="text-xl font-bold text-ink">{profile.full_name ?? "Patient"}</h2>
        </div>
        {profileCompletion < 100 && (
          <Link href="/patient/settings" className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-100">
            <Settings className="h-3.5 w-3.5" />
            Complete your profile ({profileCompletion}%)
          </Link>
        )}
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardCard icon={CalendarDays} description="Scheduled visits" title="Appointments" value={data.appointments.length} tone="accent" />
        <DashboardCard icon={FileText} description="Documents on file" title="Records" value={data.summary.recordCount} />
        <DashboardCard icon={Pill} description="Active medication plans" title="Prescriptions" value={data.summary.prescriptionCount} />
        <DashboardCard description="Unread activity" title="Notifications" value={data.summary.unreadNotifications} tone={data.summary.unreadNotifications > 0 ? "warning" : "default"} />
      </div>

      {/* Next Appointment Hero */}
      {upcomingAppointments[0] ? (
        <Card className="overflow-hidden">
          <div className="flex flex-col sm:flex-row">
            <div className="flex items-center gap-4 border-b border-border bg-primary-soft px-6 py-5 sm:border-b-0 sm:border-r sm:py-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary-deep">{format(new Date(upcomingAppointments[0].scheduled_at), "d")}</p>
                <p className="text-xs font-semibold uppercase text-primary-deep">{format(new Date(upcomingAppointments[0].scheduled_at), "MMM")}</p>
              </div>
            </div>
            <div className="flex flex-1 items-center justify-between gap-4 px-6 py-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted">Next appointment</p>
                <p className="mt-1 text-base font-semibold text-ink">{format(new Date(upcomingAppointments[0].scheduled_at), "EEEE 'at' h:mm a")}</p>
                <p className="mt-0.5 text-sm text-muted">{upcomingAppointments[0].reason ?? "General consultation"}</p>
              </div>
              <div className="flex gap-2">
                {upcomingAppointments[0].video_link && (
                  <Link className={buttonVariants({ size: "sm" })} href={`/visit/${upcomingAppointments[0].id}`}>
                    <Video className="mr-1.5 h-3.5 w-3.5" /> Join
                  </Link>
                )}
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="flex items-center justify-between px-6 py-5">
          <div>
            <p className="text-sm font-medium text-ink">No upcoming appointments</p>
            <p className="text-xs text-muted">Schedule your next visit to keep your care on track.</p>
          </div>
          <Link className={buttonVariants({ size: "sm" })} href="/patient/appointments">
            Book now
          </Link>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { href: "/patient/appointments", icon: CalendarDays, label: "Appointments", desc: "Book & manage visits" },
          { href: "/patient/messages", icon: MessageSquare, label: "Messages", desc: "Chat with your provider" },
          { href: "/patient/records", icon: FileText, label: "Records", desc: "View medical history" }
        ].map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.href} href={action.href} className="group flex items-center gap-3 rounded-card border border-border bg-white p-4 shadow-soft transition-all hover:border-primary/30 hover:shadow-card">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-soft text-primary-deep transition-colors group-hover:bg-primary group-hover:text-white">
                <Icon className="h-4.5 w-4.5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-ink">{action.label}</p>
                <p className="text-xs text-muted">{action.desc}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-3">
        <MiniDonut
          title="Appointment status"
          data={[
            { name: "Pending", value: data.appointments.filter((a) => a.status === "pending").length, color: "#f59e0b" },
            { name: "Confirmed", value: data.appointments.filter((a) => a.status === "confirmed").length, color: "#10b981" },
            { name: "Completed", value: data.appointments.filter((a) => a.status === "completed").length, color: "#3b82f6" },
            { name: "Cancelled", value: data.appointments.filter((a) => a.status === "cancelled").length, color: "#ef4444" }
          ].filter((d) => d.value > 0)}
        />
        <SparklineCard
          title="Records"
          value={data.records.length}
          subtitle="Total medical records on file"
          data={eachDayOfInterval({ start: subDays(new Date(), 13), end: new Date() }).map((day) => ({
            v: data.records.filter((r) => format(new Date(r.created_at), "yyyy-MM-dd") <= format(day, "yyyy-MM-dd")).length
          }))}
          color="#8b5cf6"
        />
        <SparklineCard
          title="Prescriptions"
          value={data.prescriptions.length}
          subtitle="Active medication plans"
          data={eachDayOfInterval({ start: subDays(new Date(), 13), end: new Date() }).map((day) => ({
            v: data.prescriptions.filter((p) => format(new Date(p.created_at), "yyyy-MM-dd") <= format(day, "yyyy-MM-dd")).length
          }))}
          color="#f59e0b"
        />
      </div>

      {/* Appointments + Care Documents */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Appointments */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-ink">Upcoming visits</h3>
            <Link href="/patient/appointments" className="text-xs font-medium text-primary hover:underline">View all</Link>
          </div>
          <div className="mt-4 space-y-2">
            {upcomingAppointments.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted">No visits scheduled</p>
            ) : (
              upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between rounded-xl bg-surface-muted px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink">{format(new Date(appointment.scheduled_at), "EEE, MMM d - h:mm a")}</p>
                    <p className="text-xs text-muted">{appointment.reason ?? "General consultation"}</p>
                  </div>
                  <span className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold capitalize ${statusColors[appointment.status] ?? ""}`}>
                    {appointment.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Records & Prescriptions */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-ink">Recent care activity</h3>
            <Link href="/patient/prescriptions" className="text-xs font-medium text-primary hover:underline">Prescriptions</Link>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Records</p>
              <div className="mt-2 space-y-1.5">
                {recentRecords.length === 0 ? (
                  <p className="py-3 text-xs text-muted">No records yet</p>
                ) : (
                  recentRecords.map((record) => (
                    <div key={record.id} className="rounded-lg bg-surface-muted px-3 py-2">
                      <p className="text-sm font-medium text-ink">{record.diagnosis}</p>
                      <p className="text-[11px] text-muted">{format(new Date(record.created_at), "MMM d, yyyy")}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Prescriptions</p>
              <div className="mt-2 space-y-1.5">
                {recentPrescriptions.length === 0 ? (
                  <p className="py-3 text-xs text-muted">No prescriptions yet</p>
                ) : (
                  recentPrescriptions.map((prescription) => (
                    <div key={prescription.id} className="rounded-lg bg-surface-muted px-3 py-2">
                      <p className="text-sm font-medium text-ink">{prescription.medication_name}</p>
                      <p className="text-[11px] text-muted">{prescription.dosage}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Profile Completion */}
      {profileCompletion < 100 && (
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-ink">Profile completion</h3>
            <Link href="/patient/settings" className={buttonVariants({ size: "sm", variant: "secondary" })}>Edit profile</Link>
          </div>
          <div className="mt-3 overflow-hidden rounded-full bg-surface-muted">
            <div className="h-1.5 rounded-full bg-primary transition-all" style={{ width: `${profileCompletion}%` }} />
          </div>
          <p className="mt-2 text-xs text-muted">{completedProfileItems} of 5 profile fields completed</p>
        </Card>
      )}
    </div>
  );
}
