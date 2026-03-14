import { AppointmentCalendar } from "@/components/dashboard/appointment-calendar";
import { PatientAppointmentList } from "@/components/dashboard/patient-appointment-list";
import { AppointmentForm } from "@/components/forms/appointment-form";
import { EmptyState } from "@/components/shared/empty-state";
import { requireRole } from "@/lib/auth";
import { createSupabaseServerComponentClient } from "@/lib/supabase/server";
import { listAppointments } from "@/repositories/appointmentRepository";
import { listProviderAvailability } from "@/repositories/providerAvailabilityRepository";
import { listProviders } from "@/repositories/userRepository";
import type { Appointment, Patient, Provider, ProviderAvailability } from "@/types/domain";

export default async function PatientAppointmentsPage() {
  const { user } = await requireRole("patient");
  const supabase = createSupabaseServerComponentClient();
  const [patientQuery, providersQuery, availabilityQuery] = await Promise.all([
    supabase.from("patients").select("*").eq("user_id", user.id).single(),
    listProviders(supabase),
    listProviderAvailability(supabase)
  ]);
  const patient = (patientQuery.data ?? null) as Patient | null;
  const providers = (providersQuery.data ?? []) as Provider[];
  const availability = (availabilityQuery.data ?? []) as ProviderAvailability[];

  if (!patient) {
    return <EmptyState description="A patient profile was not found for this user." title="Patient profile missing" />;
  }

  const appointmentsQuery = await listAppointments(supabase, { patientId: patient.id });
  const appointments = (appointmentsQuery.data ?? []) as Appointment[];
  const availabilityByProvider = new Map<string, ProviderAvailability[]>();
  availability.forEach((slot) => {
    const current = availabilityByProvider.get(slot.provider_id) ?? [];
    current.push(slot);
    availabilityByProvider.set(slot.provider_id, current);
  });
  const providerNames = Object.fromEntries(
    providers.map((provider) => [provider.id, provider.user?.full_name ?? provider.user?.email ?? "Provider"])
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <AppointmentCalendar appointments={appointments} />
        <AppointmentForm
          patientId={patient.id}
          providers={providers.map((provider) => ({
            id: provider.id,
            name: provider.user?.full_name ?? provider.user?.email ?? "Provider",
            availability: availabilityByProvider.get(provider.id) ?? []
          }))}
        />
      </div>
      {appointments.length > 0 ? (
        <PatientAppointmentList appointments={appointments} providerNames={providerNames} />
      ) : (
        <EmptyState description="Book your first appointment to start managing reschedules and cancellations here." title="No appointments yet" />
      )}
    </div>
  );
}
