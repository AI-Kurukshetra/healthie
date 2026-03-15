import type { SupabaseTypedClient } from "@/repositories/base";

const NOTIFICATION_COLUMNS = "id, user_id, type, title, body, read_at, created_at" as const;
const DEFAULT_LIMIT = 50;

export async function listNotifications(client: SupabaseTypedClient, userId: string, options?: { limit?: number }) {
  return client
    .from("notifications")
    .select(NOTIFICATION_COLUMNS)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(options?.limit ?? DEFAULT_LIMIT);
}

export async function createNotification(client: SupabaseTypedClient, payload: Record<string, unknown>) {
  return (client.from("notifications") as any).insert(payload).select(NOTIFICATION_COLUMNS).single();
}

export async function markNotificationRead(client: SupabaseTypedClient, notificationId: string) {
  return (client.from("notifications") as any)
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .select(NOTIFICATION_COLUMNS)
    .single();
}
