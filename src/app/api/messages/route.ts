export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";

import { createAuditLog, notifyUser, refreshPortalPaths, requireApiUser } from "@/app/api/_utils/helpers";
import { apiError, apiSuccess } from "@/lib/api";
import { createMessage, listMessages } from "@/repositories/messageRepository";
import { messageSchema } from "@/validators/message";

export async function GET(request: NextRequest) {
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
  const { supabase, user } = await requireApiUser();
  if (!user) {
    return apiError("Unauthorized.", 401);
  }

  const body = await request.json();
  const parsed = messageSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? "Invalid message payload.");
  }

  const { data, error } = await createMessage(supabase, parsed.data);
  if (error || !data) {
    return apiError(error?.message ?? "Unable to send message.", 400);
  }

  await notifyUser(data.receiver_id, "message", "New secure message", data.message.slice(0, 120));
  await createAuditLog("message.created", "messages", data.id, { receiver_id: data.receiver_id });
  refreshPortalPaths(["/patient/messages", "/provider/messages", "/admin/messages"]);
  return apiSuccess(data, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const { supabase, user, profile } = await requireApiUser();
  if (!user || !profile) {
    return apiError("Unauthorized.", 401);
  }

  const body = await request.json();
  if (!body.id || !body.message) {
    return apiError("Message id and message text are required.");
  }

  const existingQuery = await supabase.from("messages").select("*").eq("id", body.id).maybeSingle();
  const existing = existingQuery.data as { id: string; sender_id: string; receiver_id: string } | null;
  if (!existing) {
    return apiError("Message not found.", 404);
  }

  if (profile.role !== "admin" && existing.sender_id !== user.id) {
    return apiError("Forbidden.", 403);
  }

  const { data, error } = await (supabase.from("messages") as any)
    .update({ message: String(body.message) })
    .eq("id", body.id)
    .select("*")
    .single();

  if (error) {
    return apiError(error.message, 400);
  }

  await createAuditLog("message.updated", "messages", data.id, {});
  refreshPortalPaths(["/patient/messages", "/provider/messages", "/admin/messages"]);
  return apiSuccess(data);
}

export async function DELETE(request: NextRequest) {
  const { supabase, user, profile } = await requireApiUser();
  if (!user || !profile) {
    return apiError("Unauthorized.", 401);
  }

  const body = await request.json();
  if (!body.id) {
    return apiError("Message id is required.");
  }

  const existingQuery = await supabase.from("messages").select("*").eq("id", body.id).maybeSingle();
  const existing = existingQuery.data as { id: string; sender_id: string } | null;
  if (!existing) {
    return apiError("Message not found.", 404);
  }

  if (profile.role !== "admin" && existing.sender_id !== user.id) {
    return apiError("Forbidden.", 403);
  }

  const { error } = await supabase.from("messages").delete().eq("id", body.id);
  if (error) {
    return apiError(error.message, 400);
  }

  await createAuditLog("message.deleted", "messages", String(body.id), {});
  refreshPortalPaths(["/patient/messages", "/provider/messages", "/admin/messages"]);
  return apiSuccess({ id: body.id });
}
