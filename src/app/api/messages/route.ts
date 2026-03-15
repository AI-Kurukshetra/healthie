export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";

import { createAuditLog, fireAndForget, getAdminClientOrFallback, notifyUser, refreshPortalPaths, requireApiUser } from "@/app/api/_utils/helpers";
import { apiError, apiSuccess } from "@/lib/api";
import { apiLimiter, getClientKey, rateLimitResponse, writeLimiter } from "@/lib/rate-limit";
import { createMessage, listMessages } from "@/repositories/messageRepository";
import { messageSchema } from "@/validators/message";

export async function GET(request: NextRequest) {
  const rl = apiLimiter.check(getClientKey(request));
  if (!rl.allowed) return rateLimitResponse(rl);

  const { supabase, user } = await requireApiUser();
  if (!user) {
    return apiError("Unauthorized.", 401);
  }

  const peerId = request.nextUrl.searchParams.get("peerId") ?? undefined;
  const { data, error } = await listMessages(supabase, user.id, peerId);
  if (error) {
    return apiError(error.message, 400);
  }

  return apiSuccess(data ?? []);
}

export async function POST(request: NextRequest) {
  const rl = writeLimiter.check(getClientKey(request));
  if (!rl.allowed) return rateLimitResponse(rl);

  const { supabase, user, profile } = await requireApiUser();
  if (!user || !profile) {
    return apiError("Unauthorized.", 401);
  }

  const client = getAdminClientOrFallback(supabase);
  const body = await request.json();
  const parsed = messageSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? "Invalid message payload.");
  }

  const { data, error } = await createMessage(client, parsed.data);
  if (error || !data) {
    return apiError(error?.message ?? "Unable to send message.", 400);
  }

  // Fire notification + audit in background
  fireAndForget(
    notifyUser(data.receiver_id, "message", "New secure message", data.message.slice(0, 120)),
    createAuditLog("message.created", "messages", data.id, { receiver_id: data.receiver_id })
  );
  refreshPortalPaths(["/patient/messages", "/provider/messages", "/admin/messages"]);
  return apiSuccess(data, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const rl = writeLimiter.check(getClientKey(request));
  if (!rl.allowed) return rateLimitResponse(rl);

  const { supabase, user, profile } = await requireApiUser();
  if (!user || !profile) {
    return apiError("Unauthorized.", 401);
  }

  const client = getAdminClientOrFallback(supabase);
  const body = await request.json();
  if (!body.id || !body.message) {
    return apiError("Message id and message text are required.");
  }

  const existingQuery = await client.from("messages").select("id, sender_id").eq("id", body.id).maybeSingle();
  const existing = existingQuery.data as { id: string; sender_id: string } | null;
  if (!existing) {
    return apiError("Message not found.", 404);
  }

  if (profile.role !== "admin" && existing.sender_id !== user.id) {
    return apiError("Forbidden.", 403);
  }

  const { data, error } = await (client.from("messages") as any)
    .update({ message: String(body.message) })
    .eq("id", body.id)
    .select("*")
    .single();

  if (error) {
    return apiError(error.message, 400);
  }

  fireAndForget(createAuditLog("message.updated", "messages", data.id, {}));
  refreshPortalPaths(["/patient/messages", "/provider/messages", "/admin/messages"]);
  return apiSuccess(data);
}

export async function DELETE(request: NextRequest) {
  const rl = writeLimiter.check(getClientKey(request));
  if (!rl.allowed) return rateLimitResponse(rl);

  const { supabase, user, profile } = await requireApiUser();
  if (!user || !profile) {
    return apiError("Unauthorized.", 401);
  }

  const client = getAdminClientOrFallback(supabase);
  const body = await request.json();
  if (!body.id) {
    return apiError("Message id is required.");
  }

  const existingQuery = await client.from("messages").select("id, sender_id").eq("id", body.id).maybeSingle();
  const existing = existingQuery.data as { id: string; sender_id: string } | null;
  if (!existing) {
    return apiError("Message not found.", 404);
  }

  if (profile.role !== "admin" && existing.sender_id !== user.id) {
    return apiError("Forbidden.", 403);
  }

  const { error } = await client.from("messages").delete().eq("id", body.id);
  if (error) {
    return apiError(error.message, 400);
  }

  fireAndForget(createAuditLog("message.deleted", "messages", String(body.id), {}));
  refreshPortalPaths(["/patient/messages", "/provider/messages", "/admin/messages"]);
  return apiSuccess({ id: body.id });
}
