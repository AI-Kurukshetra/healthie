import Link from "next/link";
import { format } from "date-fns";
import { BellDot, CalendarClock, FileText, Pill } from "lucide-react";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
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
  if (!value) {
    return "Not provided";
  }

  return format(new Date(value), "MMM d, yyyy");
}

export default async function PatientDashboardPage() {
  if (!hasSupabaseEnv) {
    return <SetupBanner />;
  }

  const { user, profile } = await requireRole("patient");
  const supabase = createSupabaseServerComponentClient();
  const patientQuery = await supabase.from("patients").select("*").eq("user_id", user.id).single();
  const patient = (patientQuery.data ?? null) as Patient | null;

  if (!patient) {
    return <EmptyState description="A patient profile was not found for this account. Sign out and sign back in once to let the workspace refresh your patient record." title="Patient profile missing" />;
  }

  const data = await getPatientDashboardData(supabase, patient.id, user.id);
  const sortedAppointments = [...data.appointments].sort(
    (left, right) => new Date(left.scheduled_at).getTime() - new Date(right.scheduled_at).getTime()
  );
  const upcomingAppointments = sortedAppointments.filter((appointment) => new Date(appointment.scheduled_at).getTime() >= Date.now()).slice(0, 3);
  const recentRecords = [...data.records].sort((left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime()).slice(0, 3);
  const recentPrescriptions = [...data.prescriptions]
    .sort((left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime())
    .slice(0, 3);
  const completedProfileItems = [profile.full_name, patient.date_of_birth, patient.phone, patient.emergency_contact, patient.insurance_provider].filter(Boolean).length;
  const profileCompletion = Math.round((completedProfileItems / 5) * 100);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardCard description="Your next scheduled visit" title="Next appointment" value={data.summary.nextAppointment} tone="accent" />
        <DashboardCard description="Clinical documents on file" title="Medical records" value={data.summary.recordCount} />
        <DashboardCard description="Active medication plans" title="Prescriptions" value={data.summary.prescriptionCount} />
        <DashboardCard description="Unread activity waiting" title="Notifications" value={data.summary.unreadNotifications} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <Card className="overflow-hidden border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.98)_0%,rgba(236,245,255,0.98)_100%)] p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <Badge>Patient overview</Badge>
              <h2 className="mt-4 text-2xl font-semibold text-ink">Everything important for your care plan is grouped here.</h2>
              <p className="mt-3 text-sm leading-7 text-muted">Check the next visit, jump into records, and keep your profile complete so scheduling and follow-ups stay smooth.</p>
            </div>
            <div className="rounded-[22px] border border-primary/15 bg-white/90 px-4 py-4 shadow-soft">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-deep">Profile completion</p>
              <p className="mt-2 text-3xl font-semibold text-ink">{profileCompletion}%</p>
              <p className="mt-1 text-sm text-muted">{completedProfileItems} of 5 key items filled in.</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="rounded-[24px] border border-border/80 bg-white/90 p-5 shadow-soft">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-deep">Next visit</p>
              <p className="mt-3 text-xl font-semibold text-ink">
                {upcomingAppointments[0] ? format(new Date(upcomingAppointments[0].scheduled_at), "EEEE, MMM d 'at' h:mm a") : "No visit scheduled yet"}
              </p>
              <p className="mt-2 text-sm text-muted">{upcomingAppointments[0]?.reason ?? "Book your next consultation to keep care moving."}</p>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link className={buttonVariants({ size: "sm" })} href="/patient/appointments">
                  Manage appointments
                </Link>
                <Link className={buttonVariants({ size: "sm", variant: "secondary" })} href="/patient/messages">
                  Message provider
                </Link>
                <Link className={buttonVariants({ size: "sm", variant: "ghost" })} href="/patient/records">
                  Open records
                </Link>
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-[22px] border border-border/80 bg-white/80 p-4">
                <p className="text-sm font-medium text-muted">Upcoming visits</p>
                <p className="mt-2 text-3xl font-semibold text-ink">{upcomingAppointments.length}</p>
              </div>
              <div className="rounded-[22px] border border-border/80 bg-white/80 p-4">
                <p className="text-sm font-medium text-muted">Records ready</p>
                <p className="mt-2 text-3xl font-semibold text-ink">{data.records.length}</p>
              </div>
              <div className="rounded-[22px] border border-border/80 bg-white/80 p-4">
                <p className="text-sm font-medium text-muted">Unread alerts</p>
                <p className="mt-2 text-3xl font-semibold text-ink">{data.summary.unreadNotifications}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(246,250,253,0.98)_100%)] p-6">
          <h2 className="text-xl font-semibold text-ink">Today at a glance</h2>
          <p className="mt-2 text-sm text-muted">Four signals that tell you whether anything needs attention now.</p>

          <div className="mt-6 space-y-3">
            {[
              {
                icon: CalendarClock,
                label: "Appointments",
                value: `${upcomingAppointments.length} upcoming`,
                detail: upcomingAppointments[0] ? `Next on ${format(new Date(upcomingAppointments[0].scheduled_at), "MMM d")}` : "Nothing booked yet"
              },
              {
                icon: BellDot,
                label: "Notifications",
                value: `${data.summary.unreadNotifications} unread`,
                detail: data.summary.unreadNotifications > 0 ? "Open the bell to review recent updates." : "You are caught up."
              },
              {
                icon: FileText,
                label: "Medical records",
                value: `${data.records.length} saved`,
                detail: recentRecords[0] ? `Latest: ${recentRecords[0].diagnosis}` : "No records yet"
              },
              {
                icon: Pill,
                label: "Prescriptions",
                value: `${data.prescriptions.length} active`,
                detail: recentPrescriptions[0] ? `Latest: ${recentPrescriptions[0].medication_name}` : "No prescriptions yet"
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
              <h2 className="text-xl font-semibold text-ink">Upcoming appointments</h2>
              <p className="mt-2 text-sm text-muted">Your next scheduled visits and the reason attached to each one.</p>
            </div>
            <Link className={buttonVariants({ variant: "secondary", size: "sm" })} href="/patient/appointments">
              View all
            </Link>
          </div>

          <div className="mt-6 space-y-3">
            {upcomingAppointments.length === 0 ? (
              <div className="rounded-[20px] border border-dashed border-border p-5 text-sm text-muted">No upcoming appointments yet.</div>
            ) : (
              upcomingAppointments.map((appointment) => (
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
              <h2 className="text-xl font-semibold text-ink">Care documents</h2>
              <p className="mt-2 text-sm text-muted">Recent record updates and medication plans in one place.</p>
            </div>
            <Link className={buttonVariants({ variant: "ghost", size: "sm" })} href="/patient/prescriptions">
              Prescriptions
            </Link>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary-deep">Latest records</p>
              {recentRecords.length === 0 ? (
                <div className="rounded-[20px] border border-dashed border-border p-4 text-sm text-muted">No records yet.</div>
              ) : (
                recentRecords.map((record) => (
                  <div key={record.id} className="rounded-[20px] border border-border/80 bg-white p-4 shadow-soft">
                    <p className="font-semibold text-ink">{record.diagnosis}</p>
                    <p className="mt-1 text-sm text-muted">{format(new Date(record.created_at), "MMM d, yyyy")}</p>
                  </div>
                ))
              )}
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary-deep">Latest prescriptions</p>
              {recentPrescriptions.length === 0 ? (
                <div className="rounded-[20px] border border-dashed border-border p-4 text-sm text-muted">No prescriptions yet.</div>
              ) : (
                recentPrescriptions.map((prescription) => (
                  <div key={prescription.id} className="rounded-[20px] border border-border/80 bg-white p-4 shadow-soft">
                    <p className="font-semibold text-ink">{prescription.medication_name}</p>
                    <p className="mt-1 text-sm text-muted">{prescription.dosage} - {prescription.duration}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </Card>
      </div>

      <Card className="border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(246,250,253,0.98)_100%)] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-ink">Profile snapshot</h2>
            <p className="mt-2 text-sm text-muted">Keep this information current so providers can contact you and prepare for care without friction.</p>
          </div>
          <Link className={buttonVariants({ variant: "secondary", size: "sm" })} href="/patient/settings">
            Open settings
          </Link>
        </div>

        <div className="mt-6 overflow-hidden rounded-pill bg-surface-muted">
          <div className="h-2 rounded-pill bg-primary" style={{ width: `${profileCompletion}%` }} />
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-[20px] bg-surface-muted p-4">
            <p className="text-sm font-medium text-muted">Full name</p>
            <p className="mt-2 text-base font-semibold text-ink">{profile.full_name ?? "Not provided"}</p>
          </div>
          <div className="rounded-[20px] bg-surface-muted p-4">
            <p className="text-sm font-medium text-muted">Email</p>
            <p className="mt-2 text-base font-semibold text-ink">{profile.email}</p>
          </div>
          <div className="rounded-[20px] bg-surface-muted p-4">
            <p className="text-sm font-medium text-muted">Date of birth</p>
            <p className="mt-2 text-base font-semibold text-ink">{formatOptionalDate(patient.date_of_birth)}</p>
          </div>
          <div className="rounded-[20px] bg-surface-muted p-4">
            <p className="text-sm font-medium text-muted">Phone</p>
            <p className="mt-2 text-base font-semibold text-ink">{patient.phone ?? "Not provided"}</p>
          </div>
          <div className="rounded-[20px] bg-surface-muted p-4">
            <p className="text-sm font-medium text-muted">Emergency contact</p>
            <p className="mt-2 text-base font-semibold text-ink">{patient.emergency_contact ?? "Not provided"}</p>
          </div>
          <div className="rounded-[20px] bg-surface-muted p-4">
            <p className="text-sm font-medium text-muted">Insurance</p>
            <p className="mt-2 text-base font-semibold text-ink">{patient.insurance_provider ?? "Not provided"}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
