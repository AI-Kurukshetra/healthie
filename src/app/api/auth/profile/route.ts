export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";

import { createAuditLog, fireAndForget, requireApiUser } from "@/app/api/_utils/helpers";
import { apiError, apiSuccess } from "@/lib/api";
import { writeLimiter, getClientKey, rateLimitResponse } from "@/lib/rate-limit";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { adminProfileSchema } from "@/validators/profile";

export async function PATCH(request: NextRequest) {
  const rl = writeLimiter.check(getClientKey(request));
  if (!rl.allowed) return rateLimitResponse(rl);

  const { user, profile } = await requireApiUser();
  if (!user || !profile) {
    return apiError("Unauthorized.", 401);
  }

  const body = await request.json();
  const parsed = adminProfileSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? "Invalid profile payload.");
  }

  const client = (() => {
    try {
      return createSupabaseAdminClient() as any;
    } catch {
      return null;
    }
  })();

  if (!client) {
    return apiError("Unable to update profile.", 500);
  }

  const updatePayload: Record<string, unknown> = { full_name: parsed.data.full_name };
  if (parsed.data.avatar_url !== undefined) {
    updatePayload.avatar_url = parsed.data.avatar_url || null;
  }

  const { data, error } = await client
    .from("users")
    .update(updatePayload)
    .eq("id", user.id)
    .select("*")
    .single();

  if (error) {
    return apiError(error.message, 400);
  }

  fireAndForget(
    createAuditLog("user.profile_updated", "users", user.id, {}, user.id)
  );

  return apiSuccess(data);
}
