import { AdminProviderManager } from "@/components/admin/admin-provider-manager";
import { requireRole } from "@/lib/auth";
import { createSupabaseServerComponentClient } from "@/lib/supabase/server";
import { listProviders } from "@/repositories/userRepository";
import type { Provider } from "@/types/domain";

export default async function AdminProvidersPage() {
  await requireRole("admin");
  const supabase = createSupabaseServerComponentClient();
  const providersQuery = await listProviders(supabase);
  const providers = (providersQuery.data ?? []) as Provider[];

  return <AdminProviderManager providers={providers as any} />;
}
