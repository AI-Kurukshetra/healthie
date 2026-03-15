export const dynamic = "force-dynamic";

import { AdminProviderDirectory } from "@/components/admin/admin-provider-directory";
import type { AdminProviderRecord } from "@/components/admin/admin-provider-types";
import { requireRole } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { SupabaseTypedClient } from "@/repositories/base";
import { listProviders } from "@/repositories/userRepository";

export default async function AdminProvidersPage() {
  await requireRole("admin");
  const supabase = createSupabaseAdminClient() as unknown as SupabaseTypedClient;
  const providersQuery = await listProviders(supabase);
  const providers = (providersQuery.data ?? []) as AdminProviderRecord[];

  return <AdminProviderDirectory providers={providers} />;
}
