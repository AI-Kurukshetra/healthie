import { notFound } from "next/navigation";

import { AdminPatientEditor } from "@/components/admin/admin-patient-editor";
import type { AdminPatientRecord } from "@/components/admin/admin-patient-types";
import { requireRole } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export default async function AdminPatientDetailPage({
  params
}: {
  params: Promise<{ userId: string }>;
}) {
  await requireRole("admin");
  const { userId } = await params;
  const supabase = createSupabaseAdminClient();
  const patientQuery = await (supabase.from("patients") as any)
    .select("*, user:users(id, email, full_name)")
    .eq("user_id", userId)
    .maybeSingle();

  const patient = (patientQuery.data ?? null) as AdminPatientRecord | null;

  if (!patient) {
    notFound();
  }

  return <AdminPatientEditor mode="edit" patient={patient} />;
}
