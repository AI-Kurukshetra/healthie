export const dynamic = "force-dynamic";

import { AdminMessageEditor } from "@/components/admin/admin-message-editor";
import { requireRole } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { UserProfile } from "@/types/domain";

export default async function AdminNewMessagePage() {
  await requireRole("admin");
  const supabase = createSupabaseAdminClient() as any;
  const usersQuery = await supabase.from("users").select("*").order("created_at", { ascending: false });
  const users = (usersQuery.data ?? []) as UserProfile[];

  return <AdminMessageEditor mode="create" users={users} />;
}
