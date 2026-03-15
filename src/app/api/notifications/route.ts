export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";

import { apiError, apiSuccess } from "@/lib/api";
import { listNotifications, markNotificationRead } from "@/repositories/notificationRepository";
import { requireApiUser } from "@/app/api/_utils/helpers";

export async function GET() {
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

  return apiSuccess(data);
}


