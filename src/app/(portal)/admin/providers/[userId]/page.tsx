import { notFound } from "next/navigation";

import { AdminProviderEditor } from "@/components/admin/admin-provider-editor";
import type { AdminProviderRecord } from "@/components/admin/admin-provider-types";
import { requireRole } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export default async function AdminProviderDetailPage({
  params
}: {
  params: Promise<{ userId: string }>;
}) {
  await requireRole("admin");
  const { userId } = await params;
  const supabase = createSupabaseAdminClient();
  await (supabase.from("providers") as any).upsert({ user_id: userId }, { onConflict: "user_id" });
  const providerQuery = await (supabase.from("providers") as any)
    .select("*, user:users(id, email, full_name)")
    .eq("user_id", userId)
    .maybeSingle();

  const provider = (providerQuery.data ?? null) as AdminProviderRecord | null;

  if (!provider) {
    notFound();
  }

  return <AdminProviderEditor mode="edit" provider={provider} />;
}
