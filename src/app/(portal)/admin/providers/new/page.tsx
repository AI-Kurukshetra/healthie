import { AdminProviderEditor } from "@/components/admin/admin-provider-editor";
import { requireRole } from "@/lib/auth";

export default async function AdminNewProviderPage() {
  await requireRole("admin");

  return <AdminProviderEditor mode="create" />;
}
