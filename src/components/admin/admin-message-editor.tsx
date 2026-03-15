"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useState } from "react";
import { ArrowLeft, FileText, MessageSquare, Info, Trash2 } from "lucide-react";
import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import type { Message, UserProfile } from "@/types/domain";

export function AdminMessageEditor({
  mode,
  message,
  users
}: {
  mode: "create" | "edit";
  message?: Message;
  users: UserProfile[];
}) {
  const { success: toastSuccess, error: toastError } = useToast();
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const senderUser = message ? users.find((u) => u.id === message.sender_id) : null;
  const receiverUser = message ? users.find((u) => u.id === message.receiver_id) : null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const messageText = String(formData.get("message") ?? "").trim();

    const payload =
      mode === "create"
        ? {
            sender_id: String(formData.get("sender_id") ?? "").trim(),
            receiver_id: String(formData.get("receiver_id") ?? "").trim(),
            message: messageText
          }
        : {
            id: message?.id,
            message: messageText
          };

    try {
      const response = await fetch("/api/messages", {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await response.json().catch(() => null);
      if (!response.ok) {
        const msg = result?.error ?? `Unable to ${mode === "create" ? "send" : "update"} message.`;
        setError(msg);
        toastError(msg);
        setLoading(false);
        return;
      }

      toastSuccess(mode === "create" ? "Message sent successfully." : "Message updated successfully.");
      window.location.href = "/admin/messages";
    } catch {
      const msg = "Network error. Please check your connection and try again.";
      setError(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!message) {
      return;
    }

    if (!window.confirm("Delete this message? This action cannot be undone.")) {
      return;
    }

    setDeleteLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/messages", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: message.id })
      });

      const result = await response.json().catch(() => null);
      if (!response.ok) {
        const msg = result?.error ?? "Unable to delete message.";
        setError(msg);
        toastError(msg);
        setDeleteLoading(false);
        return;
      }

      toastSuccess("Message deleted.");
      window.location.href = "/admin/messages";
    } catch {
      const msg = "Network error. Please check your connection and try again.";
      setError(msg);
      toastError(msg);
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="overflow-hidden border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.98)_0%,rgba(236,245,255,0.98)_100%)] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3">
              <Badge>{mode === "create" ? "New message" : "Edit message"}</Badge>
            </div>
            <h2 className="mt-4 text-2xl font-semibold text-ink">
              {mode === "create" ? "Send message" : "Edit message"}
            </h2>
            <p className="mt-2 text-sm leading-7 text-muted">
              {mode === "create"
                ? "Select participants and compose a new message."
                : "Update the message content below."}
            </p>
          </div>
          <Link className={buttonVariants({ variant: "secondary", size: "sm" })} href="/admin/messages">
            <ArrowLeft className="h-4 w-4" />
            Back to messages
          </Link>
        </div>
      </Card>

      <form className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]" id="message-form" onSubmit={handleSubmit}>
        {/* Left column */}
        <div className="space-y-6">
          {/* Participants */}
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary-deep">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink">Participants</h3>
                <p className="text-sm text-muted">{mode === "create" ? "Select sender and receiver." : "Sender and receiver for this message."}</p>
              </div>
            </div>
            <div className="mt-5 space-y-4">
              {mode === "create" ? (
                <>
                  <label className="block space-y-1.5">
                    <span className="text-sm font-medium text-ink">Sender</span>
                    <Select name="sender_id" required>
                      <option value="">Select a sender...</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.full_name ?? u.email} ({u.role})
                        </option>
                      ))}
                    </Select>
                  </label>
                  <label className="block space-y-1.5">
                    <span className="text-sm font-medium text-ink">Receiver</span>
                    <Select name="receiver_id" required>
                      <option value="">Select a receiver...</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.full_name ?? u.email} ({u.role})
                        </option>
                      ))}
                    </Select>
                  </label>
                </>
              ) : (
                <>
                  <div className="block space-y-1.5">
                    <span className="text-sm font-medium text-ink">Sender</span>
                    <p className="text-sm text-ink">{senderUser?.full_name ?? senderUser?.email ?? message?.sender_id ?? "—"} <span className="text-xs capitalize text-muted">({senderUser?.role ?? "—"})</span></p>
                  </div>
                  <div className="block space-y-1.5">
                    <span className="text-sm font-medium text-ink">Receiver</span>
                    <p className="text-sm text-ink">{receiverUser?.full_name ?? receiverUser?.email ?? message?.receiver_id ?? "—"} <span className="text-xs capitalize text-muted">({receiverUser?.role ?? "—"})</span></p>
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Message content */}
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink">Message content</h3>
                <p className="text-sm text-muted">The body of the message.</p>
              </div>
            </div>
            <div className="mt-5">
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-ink">Message</span>
                <Textarea defaultValue={message?.message ?? ""} name="message" placeholder="Type your message here..." required rows={5} />
              </label>
            </div>
          </Card>

          {/* Info (edit mode only) */}
          {mode === "edit" && message && (
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Info className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-ink">Info</h3>
                  <p className="text-sm text-muted">Message metadata.</p>
                </div>
              </div>
              <div className="mt-5 space-y-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Sent</p>
                  <p className="mt-1 text-sm text-ink">{format(new Date(message.created_at), "MMM d, yyyy 'at' h:mm a")}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">From</p>
                  <p className="mt-1 text-sm text-ink">{senderUser?.full_name ?? senderUser?.email ?? message.sender_id}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">To</p>
                  <p className="mt-1 text-sm text-ink">{receiverUser?.full_name ?? receiverUser?.email ?? message.receiver_id}</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </form>

      {/* Actions — outside the form so delete button has no form interference */}
      <Card className="p-6">
        {error && <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-danger">{error}</p>}
        <div className="flex flex-wrap gap-3">
          <Button className="flex-1 sm:flex-none" disabled={loading} form="message-form" type="submit">
            {loading ? (mode === "create" ? "Sending..." : "Saving...") : mode === "create" ? "Send message" : "Save changes"}
          </Button>
          {mode === "edit" && (
            <Button disabled={deleteLoading} onClick={handleDelete} variant="danger">
              <Trash2 className="h-4 w-4" />
              {deleteLoading ? "Deleting..." : "Delete message"}
            </Button>
          )}
          <Link className={buttonVariants({ variant: "ghost" })} href="/admin/messages">
            Cancel
          </Link>
        </div>
      </Card>
    </div>
  );
}
