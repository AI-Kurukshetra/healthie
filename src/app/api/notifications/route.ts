export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";

import { createAuditLog, fireAndForget, requireApiUser } from "@/app/api/_utils/helpers";
import { apiError, apiSuccess } from "@/lib/api";
import { apiLimiter, getClientKey, rateLimitResponse, writeLimiter } from "@/lib/rate-limit";
import { listNotifications, markNotificationRead } from "@/repositories/notificationRepository";

export async function GET(request: NextRequest) {
  const rl = apiLimiter.check(getClientKey(request));
  if (!rl.allowed) return rateLimitResponse(rl);

  const { supabase, user } = await requireApiUser();
  if (!user) {
    return apiError("Unauthorized.", 401);
  }

  const { data, error } = await listNotifications(supabase, user.id);
  if (error) {
    return apiError(error.message, 400);
  }

  return apiSuccess(data ?? []);
}

export async function PATCH(request: NextRequest) {
  const rl = writeLimiter.check(getClientKey(request));
  if (!rl.allowed) return rateLimitResponse(rl);

  const { supabase, user } = await requireApiUser();
  if (!user) {
    return apiError("Unauthorized.", 401);
  }

  const body = await request.json();

  if (!body.id) {
    return apiError("Notification id is required.");
  }

  // Verify the notification belongs to the requesting user
  const ownerCheck = await supabase
    .from("notifications")
    .select("id, user_id")
    .eq("id", body.id)
    .maybeSingle();

  const notification = ownerCheck.data as { id: string; user_id: string } | null;
  if (!notification) {
    return apiError("Notification not found.", 404);
  }

  if (notification.user_id !== user.id) {
    return apiError("Forbidden.", 403);
  }

  const { data, error } = await markNotificationRead(supabase, body.id);
  if (error) {
    return apiError(error.message, 400);
  }

  fireAndForget(createAuditLog("notification.read", "notifications", body.id, {}, user.id));

  return apiSuccess(data);
}
