"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Message, UserProfile } from "@/types/domain";

export function AdminMessageManager({ messages, users }: { messages: Message[]; users: UserProfile[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function createMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sender_id: String(formData.get("sender_id") ?? ""),
        receiver_id: String(formData.get("receiver_id") ?? ""),
        message: String(formData.get("message") ?? "")
      })
    });
    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error ?? "Unable to create message.");
      setLoading(false);
      return;
    }

    event.currentTarget.reset();
    setLoading(false);
    router.refresh();
  }

  async function updateMessage(event: FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault();
    setBusyId(id);
    const formData = new FormData(event.currentTarget);
    await fetch("/api/messages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, message: String(formData.get("message") ?? "") })
    });
    setBusyId(null);
    router.refresh();
  }

  async function deleteMessage(id: string) {
    setBusyId(id);
    await fetch("/api/messages", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    setBusyId(null);
    router.refresh();
  }

  const names = new Map(users.map((user) => [user.id, user.full_name ?? user.email]));

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-semibold text-ink">Create message</h2>
        <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={createMessage}>
          <Select defaultValue="" name="sender_id" required>
            <option value="" disabled>Select sender</option>
            {users.map((user) => <option key={user.id} value={user.id}>{user.full_name ?? user.email}</option>)}
          </Select>
          <Select defaultValue="" name="receiver_id" required>
            <option value="" disabled>Select receiver</option>
            {users.map((user) => <option key={user.id} value={user.id}>{user.full_name ?? user.email}</option>)}
          </Select>
          <div className="md:col-span-2"><Textarea name="message" placeholder="Message" required /></div>
          {error ? <p className="text-sm text-danger md:col-span-2">{error}</p> : null}
          <div className="md:col-span-2"><Button disabled={loading} type="submit">{loading ? "Creating..." : "Create message"}</Button></div>
        </form>
      </Card>

      <div className="space-y-4">
        {messages.map((message) => (
          <Card key={message.id} className="p-6">
            <form className="space-y-4" onSubmit={(event) => updateMessage(event, message.id)}>
              <p className="text-sm font-semibold text-ink">{names.get(message.sender_id) ?? "Sender"} to {names.get(message.receiver_id) ?? "Recipient"}</p>
              <Textarea defaultValue={message.message} name="message" required />
              <div className="flex flex-wrap gap-3">
                <Button disabled={busyId === message.id} type="submit" variant="secondary">{busyId === message.id ? "Saving..." : "Save changes"}</Button>
                <Button disabled={busyId === message.id} onClick={() => deleteMessage(message.id)} type="button" variant="danger">Delete</Button>
              </div>
            </form>
          </Card>
        ))}
      </div>
    </div>
  );
}
