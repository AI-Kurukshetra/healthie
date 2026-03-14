import type { SupabaseTypedClient } from "@/repositories/base";

export async function listNotifications(client: SupabaseTypedClient, userId: string) {
  return client
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
}

export async function createNotification(client: SupabaseTypedClient, payload: Record<string, unknown>) {
  return (client.from("notifications") as any).insert(payload).select("*").single();
}

export async function markNotificationRead(client: SupabaseTypedClient, notificationId: string) {
  return (client.from("notifications") as any)
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .select("*")
    .single();
}
