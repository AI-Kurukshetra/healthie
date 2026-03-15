import type { SupabaseTypedClient } from "@/repositories/base";

const MESSAGE_COLUMNS = "id, sender_id, receiver_id, message, created_at" as const;
const DEFAULT_LIMIT = 200;

export async function listMessages(client: SupabaseTypedClient, userId: string, peerId?: string, options?: { limit?: number }) {
  let query = client.from("messages").select(MESSAGE_COLUMNS).order("created_at", { ascending: true }).limit(options?.limit ?? DEFAULT_LIMIT);

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
  return (client.from("messages") as any).insert(payload).select(MESSAGE_COLUMNS).single();
}
