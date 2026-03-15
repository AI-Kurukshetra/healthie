import type { SupabaseTypedClient } from "@/repositories/base";

const AVAILABILITY_COLUMNS = "id, provider_id, day_of_week, start_time, end_time, slot_duration_minutes, timezone, created_at" as const;

export async function listProviderAvailability(client: SupabaseTypedClient, providerId?: string) {
  let query = client
    .from("provider_availability")
    .select(AVAILABILITY_COLUMNS)
    .order("day_of_week", { ascending: true })
    .order("start_time", { ascending: true });

  if (providerId) {
    query = query.eq("provider_id", providerId);
  }

  return query;
}

export async function createProviderAvailability(client: SupabaseTypedClient, payload: Record<string, unknown>) {
  return (client.from("provider_availability") as any).insert(payload).select(AVAILABILITY_COLUMNS).single();
}

export async function deleteProviderAvailability(client: SupabaseTypedClient, availabilityId: string) {
  return (client.from("provider_availability") as any).delete().eq("id", availabilityId).select(AVAILABILITY_COLUMNS).single();
}
