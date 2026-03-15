export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";

import { AdminPrescriptionEditor } from "@/components/admin/admin-prescription-editor";
import { requireRole } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { listPatients, listProviders } from "@/repositories/userRepository";
import type { Patient, Prescription, Provider } from "@/types/domain";

export default async function AdminPrescriptionDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("admin");
  const { id } = await params;
  const supabase = createSupabaseAdminClient() as any;

  const [prescriptionQuery, patientsQuery, providersQuery] = await Promise.all([
    (supabase.from("prescriptions") as any).select("*").eq("id", id).maybeSingle(),
    listPatients(supabase),
    listProviders(supabase)
  ]);

  const prescription = (prescriptionQuery.data ?? null) as Prescription | null;

  if (!prescription) {
    notFound();
  }

  const patients = (patientsQuery.data ?? []) as Patient[];
  const providers = (providersQuery.data ?? []) as Provider[];

  return (
    <AdminPrescriptionEditor
      mode="edit"
      patients={patients}
      prescription={prescription}
      providers={providers}
    />
  );
}
