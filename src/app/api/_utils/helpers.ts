import { revalidatePath } from "next/cache";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/server";
import { getCurrentUserProfile } from "@/repositories/userRepository";
import type { Role, UserProfile } from "@/types/domain";

function resolveRole(metadataRole: unknown): Role {
  if (metadataRole === "patient" || metadataRole === "provider" || metadataRole === "admin") {
    return metadataRole;
  }

  return "patient";
}

function buildFallbackProfile(user: {
  id: string;
  email?: string;
  created_at?: string;
  user_metadata?: Record<string, unknown>;
}): UserProfile {
  return {
    id: user.id,
    email: user.email ?? "",
    full_name: typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : null,
    role: resolveRole(user.user_metadata?.role),
    organization_id: null,
    avatar_url: null,
    created_at: user.created_at ?? new Date().toISOString()
  };
}

async function ensureRoleProfile(profile: UserProfile) {
  try {
    const admin = createSupabaseAdminClient();

    await (admin.from("users") as any).upsert(
      {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        role: profile.role,
        organization_id: profile.organization_id,
        avatar_url: profile.avatar_url
      },
      { onConflict: "id" }
    );

    if (profile.role === "patient") {
      await (admin.from("patients") as any).upsert({ user_id: profile.id }, { onConflict: "user_id" });
    }

    if (profile.role === "provider") {
      await (admin.from("providers") as any).upsert(
        { user_id: profile.id, organization_id: profile.organization_id },
        { onConflict: "user_id" }
      );
    }
  } catch {
    // If the service role client is unavailable, continue with the existing session data.
  }
}

export async function requireApiUser() {
  const supabase = createSupabaseRouteHandlerClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();
  const user = session?.user ?? null;

  if (!user) {
    return { supabase, user: null, profile: null as UserProfile | null };
  }

  const { data: profile } = await getCurrentUserProfile(supabase, user.id);
  const effectiveProfile = profile ?? buildFallbackProfile(user);

  await ensureRoleProfile(effectiveProfile);

  const { data: refreshedProfile } = await getCurrentUserProfile(supabase, user.id);

  return {
    supabase,
    user,
    profile: refreshedProfile ?? effectiveProfile
  };
}

function getPrivilegedClient() {
  try {
    return createSupabaseAdminClient();
  } catch {
    return createSupabaseRouteHandlerClient();
  }
}

export async function createAuditLog(action: string, entityType: string, entityId: string | null, metadata: Record<string, unknown>) {
  const { user } = await requireApiUser();
  const client = getPrivilegedClient();

  await (client.from("audit_logs") as any).insert({
    actor_id: user?.id ?? null,
    action,
    entity_type: entityType,
    entity_id: entityId,
    metadata
  });
}

export async function notifyUser(userId: string, type: "message" | "appointment" | "prescription", title: string, body: string) {
  const client = getPrivilegedClient();
  await (client.from("notifications") as any).insert({
    user_id: userId,
    type,
    title,
    body
  });
}

export function refreshPortalPaths(paths: string[]) {
  paths.forEach((path) => revalidatePath(path));
}
