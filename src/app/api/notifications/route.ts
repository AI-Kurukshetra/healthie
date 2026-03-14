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

  const { data, error } = await markNotificationRead(supabase, body.id);
  if (error) {
    return apiError(error.message, 400);
  }

  return apiSuccess(data);
}


