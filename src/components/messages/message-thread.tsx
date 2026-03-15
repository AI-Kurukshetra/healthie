"use client";

import { format } from "date-fns";
import { useState } from "react";

import { useRealtimeMessages } from "@/hooks/use-realtime-messages";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import type { Message } from "@/types/domain";

export function MessageThread({
  currentUserId,
  receiverId,
  initialMessages
}: {
  currentUserId: string;
  receiverId: string;
  initialMessages: Message[];
}) {
  const { messages } = useRealtimeMessages(initialMessages, currentUserId);
  const { success: toastSuccess, error: toastError } = useToast();
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!draft.trim()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender_id: currentUserId,
          receiver_id: receiverId,
          message: draft.trim()
        })
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        const msg = payload?.error ?? "Unable to send message.";
        setError(msg);
        toastError(msg);
        return;
      }

      toastSuccess("Message sent.");
      setDraft("");
    } catch {
      const msg = "Network error. Please check your connection and try again.";
      setError(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-6">
      <div className="max-h-[420px] space-y-3 overflow-y-auto pr-2">
        {messages.length === 0 ? (
          <p className="rounded-[18px] border border-dashed border-border p-4 text-sm text-muted">No messages yet.</p>
        ) : (
          messages.map((message) => {
            const mine = message.sender_id === currentUserId;
            return (
              <div key={message.id} className={mine ? "ml-auto max-w-[84%]" : "mr-auto max-w-[84%]"}>
                <div className={mine ? "rounded-[24px] bg-primary px-4 py-3 text-white" : "rounded-[24px] bg-surface-muted px-4 py-3 text-ink"}>
                  <p className="text-sm leading-6">{message.message}</p>
                </div>
                <p className="mt-1 text-xs text-muted">
                  {format(new Date(message.created_at), "MMM d, h:mm a")}
                </p>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-5 space-y-3">
        <Textarea placeholder="Write a secure message..." value={draft} onChange={(event) => setDraft(event.target.value)} />
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <Button disabled={loading} onClick={sendMessage}>
          {loading ? "Sending..." : "Send message"}
        </Button>
      </div>
    </Card>
  );
}
