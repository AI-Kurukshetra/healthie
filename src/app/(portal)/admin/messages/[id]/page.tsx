export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";

import { AdminMessageEditor } from "@/components/admin/admin-message-editor";
import { requireRole } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Message, UserProfile } from "@/types/domain";

export default async function AdminMessageDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("admin");
  const { id } = await params;
  const supabase = createSupabaseAdminClient() as any;

  const [messageQuery, usersQuery] = await Promise.all([
    supabase.from("messages").select("*").eq("id", id).maybeSingle(),
    supabase.from("users").select("*").order("created_at", { ascending: false })
  ]);

  const message = (messageQuery.data ?? null) as Message | null;

  if (!message) {
    notFound();
  }

  const users = (usersQuery.data ?? []) as UserProfile[];

  return <AdminMessageEditor message={message} mode="edit" users={users} />;
}
