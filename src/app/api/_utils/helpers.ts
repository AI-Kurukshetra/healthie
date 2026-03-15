import { revalidatePath } from "next/cache";

import { readEmergencySession } from "@/lib/emergency-session";
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

    const upserts: Promise<any>[] = [
      (admin.from("users") as any).upsert(
        {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          role: profile.role,
          organization_id: profile.organization_id,
          avatar_url: profile.avatar_url
        },
        { onConflict: "id" }
      )
    ];

    if (profile.role === "patient") {
      upserts.push((admin.from("patients") as any).upsert({ user_id: profile.id }, { onConflict: "user_id" }));
    } else if (profile.role === "provider") {
      upserts.push(
        (admin.from("providers") as any).upsert(
          { user_id: profile.id, organization_id: profile.organization_id },
          { onConflict: "user_id" }
        )
      );
    }

    await Promise.all(upserts);
  } catch {
    // If the service role client is unavailable, continue with the existing session data.
  }
}

export async function requireApiUser() {
  const emergencySession = readEmergencySession();
  if (emergencySession) {
    const supabase = createSupabaseAdminClient() as any;
    const { data: profile } = await getCurrentUserProfile(supabase, emergencySession.userId);
    const effectiveProfile =
      profile ??
      ({
        id: emergencySession.userId,
        email: emergencySession.email,
        full_name: null,
        role: emergencySession.role,
        organization_id: null,
        avatar_url: null,
        created_at: new Date().toISOString()
      } satisfies UserProfile);

    return {
      supabase,
      user: {
        id: effectiveProfile.id,
        email: effectiveProfile.email,
        created_at: effectiveProfile.created_at,
        user_metadata: {
          role: effectiveProfile.role,
          full_name: effectiveProfile.full_name ?? undefined
        }
      } as any,
      profile: effectiveProfile
    };
  }

  const supabase = createSupabaseRouteHandlerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, user: null, profile: null as UserProfile | null };
  }

  const { data: profile } = await getCurrentUserProfile(supabase, user.id);

  if (profile) {
    return {
      supabase,
      user,
      profile
    };
  }

  const effectiveProfile = buildFallbackProfile(user);
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

export function getAdminClientOrFallback(fallback: any) {
  try {
    return createSupabaseAdminClient() as any;
  } catch {
    return fallback;
  }
}

// Accept actorId directly so callers don't trigger a second requireApiUser() round-trip
export async function createAuditLog(action: string, entityType: string, entityId: string | null, metadata: Record<string, unknown>, actorId?: string | null) {
  const client = getPrivilegedClient();

  await (client.from("audit_logs") as any).insert({
    actor_id: actorId ?? null,
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

/**
 * Fire background tasks (audit logs, notifications, revalidation) without
 * blocking the API response. Errors are logged but never bubble up.
 */
export function fireAndForget(...tasks: Promise<any>[]) {
  Promise.allSettled(tasks).then((results) => {
    for (const r of results) {
      if (r.status === "rejected") {
        console.error("[background task]", r.reason);
      }
    }
  });
}

export function refreshPortalPaths(paths: string[]) {
  paths.forEach((path) => revalidatePath(path));
}
