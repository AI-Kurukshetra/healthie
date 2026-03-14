import { AdminPatientEditor } from "@/components/admin/admin-patient-editor";
import { requireRole } from "@/lib/auth";

export default async function AdminNewPatientPage() {
  await requireRole("admin");

  return <AdminPatientEditor mode="create" />;
}
