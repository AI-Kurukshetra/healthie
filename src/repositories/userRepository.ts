import type { Patient, Provider, UserProfile } from "@/types/domain";
import type { SupabaseTypedClient } from "@/repositories/base";

export async function getCurrentUserProfile(client: SupabaseTypedClient, userId: string) {
  return (client.from("users") as any).select("*").eq("id", userId).maybeSingle() as Promise<{
    data: UserProfile | null;
    error: { message: string } | null;
  }>;
}

export async function getProviderByUserId(client: SupabaseTypedClient, userId: string) {
  return (client.from("providers") as any).select("*").eq("user_id", userId).maybeSingle() as Promise<{
    data: Provider | null;
    error: { message: string } | null;
  }>;
}

export async function getPatientByUserId(client: SupabaseTypedClient, userId: string) {
  return (client.from("patients") as any).select("*").eq("user_id", userId).maybeSingle() as Promise<{
    data: Patient | null;
    error: { message: string } | null;
  }>;
}

export async function listProviders(client: SupabaseTypedClient) {
  return (client.from("providers") as any)
    .select("*, user:users(*)")
    .order("created_at", { ascending: false }) as Promise<{
      data: Provider[] | null;
      error: { message: string } | null;
    }>;
}

export async function listPatients(client: SupabaseTypedClient) {
  return (client.from("patients") as any)
    .select("*, user:users(*)")
    .order("created_at", { ascending: false }) as Promise<{
      data: Patient[] | null;
      error: { message: string } | null;
    }>;
}
