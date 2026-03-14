import type { SupabaseTypedClient } from "@/repositories/base";

export async function listMessages(client: SupabaseTypedClient, userId: string, peerId?: string) {
  let query = client.from("messages").select("*").order("created_at", { ascending: true });

  if (peerId) {
    query = query.or(
      `and(sender_id.eq.${userId},receiver_id.eq.${peerId}),and(sender_id.eq.${peerId},receiver_id.eq.${userId})`
    );
  } else {
    query = query.or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);
  }

  return query;
}

export async function createMessage(client: SupabaseTypedClient, payload: Record<string, unknown>) {
  return (client.from("messages") as any).insert(payload).select("*").single();
}
