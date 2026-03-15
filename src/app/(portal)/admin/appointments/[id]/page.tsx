export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";

import { AdminAppointmentEditor } from "@/components/admin/admin-appointment-editor";
import { requireRole } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { listPatients, listProviders } from "@/repositories/userRepository";
import type { Appointment, Patient, Provider } from "@/types/domain";

export default async function AdminAppointmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("admin");
  const { id } = await params;
  const supabase = createSupabaseAdminClient() as any;

  const [appointmentQuery, patientsQuery, providersQuery] = await Promise.all([
    supabase.from("appointments").select("*").eq("id", id).maybeSingle(),
    listPatients(supabase),
    listProviders(supabase),
  ]);

  const appointment = (appointmentQuery.data ?? null) as Appointment | null;

  if (!appointment) {
    notFound();
  }

  const patients = (patientsQuery.data ?? []) as Patient[];
  const providers = (providersQuery.data ?? []) as Provider[];

  return (
    <AdminAppointmentEditor
      mode="edit"
      appointment={appointment}
      patients={patients}
      providers={providers}
    />
  );
}
