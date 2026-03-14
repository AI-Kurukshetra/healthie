import Link from "next/link";
import { format } from "date-fns";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { NotificationList } from "@/components/notifications/notification-list";
import { EmptyState } from "@/components/shared/empty-state";
import { SetupBanner } from "@/components/layout/setup-banner";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
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

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardCard description="Your next scheduled visit" title="Next appointment" value={data.summary.nextAppointment} tone="accent" />
        <DashboardCard description="Clinical documents on file" title="Medical records" value={data.summary.recordCount} />
        <DashboardCard description="Active medication plans" title="Prescriptions" value={data.summary.prescriptionCount} />
        <DashboardCard description="Unread activity waiting" title="Notifications" value={data.summary.unreadNotifications} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-ink">Care overview</h2>
          <p className="mt-2 text-sm text-muted">See your appointments, provider messages, and record access from one calm dashboard.</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[20px] bg-surface-muted p-4">
              <p className="text-sm font-medium text-muted">Appointments</p>
              <p className="mt-3 text-3xl font-semibold text-ink">{data.appointments.length}</p>
            </div>
            <div className="rounded-[20px] bg-surface-muted p-4">
              <p className="text-sm font-medium text-muted">Records</p>
              <p className="mt-3 text-3xl font-semibold text-ink">{data.records.length}</p>
            </div>
            <div className="rounded-[20px] bg-surface-muted p-4">
              <p className="text-sm font-medium text-muted">Prescriptions</p>
              <p className="mt-3 text-3xl font-semibold text-ink">{data.prescriptions.length}</p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link className={buttonVariants({ size: "sm" })} href="/patient/appointments">
              Book appointment
            </Link>
            <Link className={buttonVariants({ size: "sm", variant: "secondary" })} href="/patient/messages">
              Message provider
            </Link>
            <Link className={buttonVariants({ size: "sm", variant: "ghost" })} href="/patient/records">
              View records
            </Link>
          </div>
        </Card>
        <NotificationList currentUserId={user.id} notifications={data.notifications} />
      </div>

      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-ink">Profile snapshot</h2>
            <p className="mt-2 text-sm text-muted">Your patient details, contact information, and care access preferences at a glance.</p>
          </div>
          <Link className={buttonVariants({ variant: "secondary", size: "sm" })} href="/patient/settings">
            Open settings
          </Link>
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
