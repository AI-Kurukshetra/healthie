import type { Patient, Provider, UserProfile } from "@/types/domain";
import type { SupabaseTypedClient } from "@/repositories/base";

const USER_COLUMNS = "id, email, full_name, role, organization_id, avatar_url, created_at" as const;
const PATIENT_COLUMNS = "id, user_id, date_of_birth, phone, emergency_contact, insurance_provider, created_at" as const;
const PROVIDER_COLUMNS = "id, user_id, specialty, license_number, bio, organization_id, created_at" as const;
const DEFAULT_LIMIT = 100;

export async function getCurrentUserProfile(client: SupabaseTypedClient, userId: string) {
  return (client.from("users") as any).select(USER_COLUMNS).eq("id", userId).maybeSingle() as Promise<{
    data: UserProfile | null;
    error: { message: string } | null;
  }>;
}

export async function getProviderByUserId(client: SupabaseTypedClient, userId: string) {
  return (client.from("providers") as any).select(PROVIDER_COLUMNS).eq("user_id", userId).maybeSingle() as Promise<{
    data: Provider | null;
    error: { message: string } | null;
  }>;
}

export async function getPatientByUserId(client: SupabaseTypedClient, userId: string) {
  return (client.from("patients") as any).select(PATIENT_COLUMNS).eq("user_id", userId).maybeSingle() as Promise<{
    data: Patient | null;
    error: { message: string } | null;
  }>;
}

export async function listProviders(client: SupabaseTypedClient, options?: { limit?: number }) {
  return (client.from("providers") as any)
    .select(`${PROVIDER_COLUMNS}, user:users(id, email, full_name, role)`)
    .order("created_at", { ascending: false })
    .limit(options?.limit ?? DEFAULT_LIMIT) as Promise<{
      data: Provider[] | null;
      error: { message: string } | null;
    }>;
}

export async function listPatients(client: SupabaseTypedClient, options?: { limit?: number }) {
  return (client.from("patients") as any)
    .select(`${PATIENT_COLUMNS}, user:users(id, email, full_name, role)`)
    .order("created_at", { ascending: false })
    .limit(options?.limit ?? DEFAULT_LIMIT) as Promise<{
      data: Patient[] | null;
      error: { message: string } | null;
    }>;
}
