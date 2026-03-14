import Link from "next/link";
import { format } from "date-fns";

import { AppointmentCalendar } from "@/components/dashboard/appointment-calendar";
import { EmptyState } from "@/components/shared/empty-state";
import { ProviderAvailabilityManager } from "@/components/forms/provider-availability-manager";
import { buttonVariants, Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { createSupabaseServerComponentClient } from "@/lib/supabase/server";
import { listAppointments } from "@/repositories/appointmentRepository";
import { listProviderAvailability } from "@/repositories/providerAvailabilityRepository";
import { getProviderByUserId, listPatients } from "@/repositories/userRepository";
import type { Appointment, Patient, Provider, ProviderAvailability } from "@/types/domain";

export default async function ProviderAppointmentsPage() {
  const { user } = await requireRole("provider");
  const supabase = createSupabaseServerComponentClient();
  const providerQuery = await getProviderByUserId(supabase, user.id);
  const provider = (providerQuery.data ?? null) as Provider | null;

  if (!provider) {
    return <EmptyState description="Provider profile missing for this account." title="Provider profile missing" />;
  }

  const [appointmentsQuery, patientsQuery, availabilityQuery] = await Promise.all([
    listAppointments(supabase, { providerId: provider.id }),
    listPatients(supabase),
    listProviderAvailability(supabase, provider.id)
  ]);
  const appointments = (appointmentsQuery.data ?? []) as Appointment[];
  const patients = (patientsQuery.data ?? []) as Patient[];
  const availability = (availabilityQuery.data ?? []) as ProviderAvailability[];
  const patientNames = new Map(
    patients.map((patient) => [patient.id, patient.user?.full_name ?? patient.user?.email ?? "Patient"])
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <AppointmentCalendar appointments={appointments} />
        <ProviderAvailabilityManager availability={availability} providerId={provider.id} />
      </div>
      <div className="space-y-4">
        {appointments.length > 0 ? (
          appointments.map((appointment) => (
            <Card key={appointment.id} className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-ink">{format(new Date(appointment.scheduled_at), "MMM d, yyyy h:mm a")}</p>
                  <p className="mt-1 text-sm text-muted">{patientNames.get(appointment.patient_id) ?? "Patient"}</p>
                  <p className="mt-1 text-sm text-muted">{appointment.reason ?? "General consultation"}</p>
                  {appointment.video_link ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link className={buttonVariants({ size: "sm" })} href={appointment.video_link}>
                        Open visit room
                      </Link>
                    </div>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  <form action={`/api/appointments/${appointment.id}`} method="post">
                    <input name="_method" type="hidden" value="PATCH" />
                    <input name="status" type="hidden" value="confirmed" />
                    <Button type="submit" variant="secondary">Confirm</Button>
                  </form>
                  <form action={`/api/appointments/${appointment.id}`} method="post">
                    <input name="_method" type="hidden" value="PATCH" />
                    <input name="status" type="hidden" value="completed" />
                    <Button type="submit" variant="secondary">Complete</Button>
                  </form>
                  <form action={`/api/appointments/${appointment.id}`} method="post">
                    <input name="_method" type="hidden" value="PATCH" />
                    <input name="status" type="hidden" value="cancelled" />
                    <Button type="submit" variant="danger">Cancel</Button>
                  </form>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <EmptyState description="No appointments are assigned yet." title="No appointments" />
        )}
      </div>
    </div>
  );
}
