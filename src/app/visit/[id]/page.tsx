import { format } from "date-fns";
import { redirect } from "next/navigation";

import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { getSessionContext } from "@/lib/auth";
import { createSupabaseServerComponentClient } from "@/lib/supabase/server";
import { getPatientByUserId, getProviderByUserId } from "@/repositories/userRepository";

export const dynamic = "force-dynamic";

export default async function VisitRoomPage({ params }: { params: { id: string } }) {
  const context = await getSessionContext();

  if (!context.user || !context.profile) {
    redirect("/login");
  }

  const supabase = createSupabaseServerComponentClient();
  const appointmentQuery = await supabase.from("appointments").select("*").eq("id", params.id).maybeSingle();
  const appointment = appointmentQuery.data as {
    id: string;
    patient_id: string;
    provider_id: string;
    scheduled_at: string;
    status: string;
    video_link: string | null;
    reason: string | null;
  } | null;

  if (!appointment) {
    return <Card className="p-8 text-center text-sm text-muted">Appointment not found.</Card>;
  }

  let canAccess = context.profile.role === "admin";

  if (context.profile.role === "patient") {
    const patientQuery = await getPatientByUserId(supabase, context.user.id);
    canAccess = patientQuery.data?.id === appointment.patient_id;
  }

  if (context.profile.role === "provider") {
    const providerQuery = await getProviderByUserId(supabase, context.user.id);
    canAccess = providerQuery.data?.id === appointment.provider_id;
  }

  if (!canAccess) {
    redirect("/login");
  }

  return (
    <div className="page-shell py-8 sm:py-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <Card className="relative overflow-hidden border-white/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.98)_0%,rgba(239,246,255,0.94)_52%,rgba(223,236,255,0.9)_100%)] p-8">
          <div className="absolute -right-12 top-0 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative space-y-4">
            <span className="inline-flex items-center rounded-pill border border-primary/15 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary-deep shadow-soft">
              Video consultation
            </span>
            <h1 className="font-display text-4xl font-semibold text-ink">Visit room</h1>
            <p className="max-w-2xl text-sm leading-7 text-muted">
              This MVP room uses the generated meeting link stored on the appointment. It gives patients and providers a consistent consultation entry point while external video integration is still pending.
            </p>
          </div>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-ink">Session details</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[20px] bg-surface-muted p-4">
                <p className="text-sm font-medium text-muted">Scheduled time</p>
                <p className="mt-2 text-base font-semibold text-ink">{format(new Date(appointment.scheduled_at), "MMM d, yyyy h:mm a")}</p>
              </div>
              <div className="rounded-[20px] bg-surface-muted p-4">
                <p className="text-sm font-medium text-muted">Status</p>
                <p className="mt-2 text-base font-semibold capitalize text-ink">{appointment.status}</p>
              </div>
            </div>
            <div className="mt-4 rounded-[20px] bg-surface-muted p-4">
              <p className="text-sm font-medium text-muted">Consultation reason</p>
              <p className="mt-2 text-sm leading-7 text-ink">{appointment.reason ?? "General consultation"}</p>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold text-ink">MVP meeting link</h2>
            <p className="mt-2 text-sm leading-7 text-muted">
              Use this route as the single place to start the visit. When a full WebRTC or vendor integration is added, this page can host the real consultation experience without changing the appointment workflow.
            </p>
            {appointment.video_link ? (
              <a className={`${buttonVariants({ size: "sm" })} mt-6`} href={appointment.video_link}>
                Refresh room link
              </a>
            ) : null}
          </Card>
        </div>
      </div>
    </div>
  );
}
