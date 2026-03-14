import { AdminMessageManager } from "@/components/admin/admin-message-manager";
import { requireRole } from "@/lib/auth";
import { createSupabaseServerComponentClient } from "@/lib/supabase/server";
import type { Message, UserProfile } from "@/types/domain";

export default async function AdminMessagesPage() {
  await requireRole("admin");
  const supabase = createSupabaseServerComponentClient();
  const [messagesQuery, usersQuery] = await Promise.all([
    supabase.from("messages").select("*").order("created_at", { ascending: false }).limit(100),
    supabase.from("users").select("*").order("created_at", { ascending: false })
  ]);

  const messages = (messagesQuery.data ?? []) as Message[];
  const users = (usersQuery.data ?? []) as UserProfile[];

  return <AdminMessageManager messages={messages} users={users} />;
}
