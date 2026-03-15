"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Inbox, MessageSquare, Plus, Search, Send, SquarePen, Trash2, X } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/shared/empty-state";
import { useToast } from "@/components/ui/toast";
import type { Message, UserProfile } from "@/types/domain";

export function AdminMessageManager({ messages, users }: { messages: Message[]; users: UserProfile[] }) {
  const router = useRouter();
  const { success: toastSuccess, error: toastError } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingMsg, setEditingMsg] = useState<Message | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const nameMap = useMemo(() => new Map(users.map((u) => [u.id, u.full_name ?? u.email])), [users]);
  const roleMap = useMemo(() => new Map(users.map((u) => [u.id, u.role])), [users]);

  const filtered = useMemo(() => {
    if (!query.trim()) return messages;
    const q = query.toLowerCase();
    return messages.filter((m) => {
      const sender = (nameMap.get(m.sender_id) ?? "").toLowerCase();
      const receiver = (nameMap.get(m.receiver_id) ?? "").toLowerCase();
      const content = (m.message ?? "").toLowerCase();
      return sender.includes(q) || receiver.includes(q) || content.includes(q);
    });
  }, [messages, query, nameMap]);

  const uniqueSenders = new Set(messages.map((m) => m.sender_id)).size;
  const uniqueReceivers = new Set(messages.map((m) => m.receiver_id)).size;

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender_id: String(fd.get("sender_id") ?? ""),
          receiver_id: String(fd.get("receiver_id") ?? ""),
          message: String(fd.get("message") ?? "").trim()
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
      formRef.current?.reset();
      setShowForm(false);
      setError(null);
      router.refresh();
    } catch {
      const msg = "Network error. Please check your connection and try again.";
      setError(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(event: React.FormEvent<HTMLFormElement>) {
    if (!editingMsg) return;
    event.preventDefault();
    setBusyId(editingMsg.id);
    setError(null);
    const fd = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingMsg.id, message: String(fd.get("message") ?? "").trim() })
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        const msg = payload?.error ?? "Unable to update message.";
        setError(msg);
        toastError(msg);
        return;
      }

      toastSuccess("Message updated.");
      setEditingMsg(null);
      setError(null);
      router.refresh();
    } catch {
      const msg = "Network error. Please check your connection and try again.";
      setError(msg);
      toastError(msg);
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this message? This cannot be undone.")) return;
    setBusyId(id);

    try {
      const res = await fetch("/api/messages", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      if (res.ok) toastSuccess("Message deleted.");
      else toastError("Unable to delete message.");
      if (editingMsg?.id === id) setEditingMsg(null);
      router.refresh();
    } catch {
      toastError("Network error. Please check your connection and try again.");
    } finally {
      setBusyId(null);
    }
  }

  function openEdit(msg: Message) {
    setEditingMsg(msg);
    setShowForm(false);
    setError(null);
  }

  function openCreate() {
    setShowForm(true);
    setEditingMsg(null);
    setError(null);
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="overflow-hidden border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.98)_0%,rgba(236,245,255,0.98)_100%)] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <Badge>Message management</Badge>
            <h2 className="mt-4 text-2xl font-semibold text-ink">Monitor, create, and manage secure messages.</h2>
            <p className="mt-2 text-sm leading-7 text-muted">Oversee communication between patients and providers. Edit or remove messages as needed.</p>
          </div>
          <Button onClick={openCreate} size="sm">
            <Plus className="h-4 w-4" />
            Send message
          </Button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-[22px] border border-border/80 bg-white/85 p-4 shadow-soft">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary-deep" />
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-deep">Total messages</p>
            </div>
            <p className="mt-2 text-3xl font-semibold text-ink">{messages.length}</p>
          </div>
          <div className="rounded-[22px] border border-border/80 bg-white/85 p-4 shadow-soft">
            <div className="flex items-center gap-2">
              <Send className="h-4 w-4 text-primary-deep" />
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-deep">Active senders</p>
            </div>
            <p className="mt-2 text-3xl font-semibold text-ink">{uniqueSenders}</p>
          </div>
          <div className="rounded-[22px] border border-border/80 bg-white/85 p-4 shadow-soft">
            <div className="flex items-center gap-2">
              <Inbox className="h-4 w-4 text-primary-deep" />
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-deep">Active receivers</p>
            </div>
            <p className="mt-2 text-3xl font-semibold text-ink">{uniqueReceivers}</p>
          </div>
        </div>
      </Card>

      {/* Create Form */}
      {showForm && (
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary-deep">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink">New message</h3>
                <p className="text-sm text-muted">Send a secure message between users.</p>
              </div>
            </div>
            <Button onClick={() => setShowForm(false)} size="sm" variant="ghost"><X className="h-4 w-4" /></Button>
          </div>

          <form ref={formRef} className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={handleCreate}>
            <label className="space-y-1.5">
              <span className="text-sm font-medium text-ink">From</span>
              <Select defaultValue="" name="sender_id" required>
                <option value="" disabled>Select sender</option>
                {users.map((u) => <option key={u.id} value={u.id}>{u.full_name ?? u.email} ({u.role})</option>)}
              </Select>
            </label>
            <label className="space-y-1.5">
              <span className="text-sm font-medium text-ink">To</span>
              <Select defaultValue="" name="receiver_id" required>
                <option value="" disabled>Select receiver</option>
                {users.map((u) => <option key={u.id} value={u.id}>{u.full_name ?? u.email} ({u.role})</option>)}
              </Select>
            </label>
            <div className="sm:col-span-2">
              <label className="space-y-1.5">
                <span className="text-sm font-medium text-ink">Message</span>
                <Textarea name="message" placeholder="Type the message content..." required rows={3} />
              </label>
            </div>
            {error && !editingMsg && <p className="text-sm text-danger sm:col-span-2">{error}</p>}
            <div className="flex gap-3 sm:col-span-2">
              <Button disabled={loading} type="submit">{loading ? "Sending..." : "Send message"}</Button>
              <Button onClick={() => setShowForm(false)} type="button" variant="ghost">Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Edit Form */}
      {editingMsg && (
        <Card className="border-primary/20 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <SquarePen className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink">Edit message</h3>
                <p className="text-sm text-muted">
                  {nameMap.get(editingMsg.sender_id) ?? "Sender"} to {nameMap.get(editingMsg.receiver_id) ?? "Receiver"}
                </p>
              </div>
            </div>
            <Button onClick={() => setEditingMsg(null)} size="sm" variant="ghost"><X className="h-4 w-4" /></Button>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleUpdate}>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-surface-muted p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">From</p>
                <div className="mt-1 flex items-center gap-2">
                  <Avatar className="h-6 w-6" name={nameMap.get(editingMsg.sender_id)} />
                  <p className="text-sm font-medium text-ink">{nameMap.get(editingMsg.sender_id) ?? "Unknown"}</p>
                  <Badge className="text-[10px]">{roleMap.get(editingMsg.sender_id) ?? ""}</Badge>
                </div>
              </div>
              <div className="rounded-xl bg-surface-muted p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">To</p>
                <div className="mt-1 flex items-center gap-2">
                  <Avatar className="h-6 w-6" name={nameMap.get(editingMsg.receiver_id)} />
                  <p className="text-sm font-medium text-ink">{nameMap.get(editingMsg.receiver_id) ?? "Unknown"}</p>
                  <Badge className="text-[10px]">{roleMap.get(editingMsg.receiver_id) ?? ""}</Badge>
                </div>
              </div>
            </div>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-ink">Message content</span>
              <Textarea defaultValue={editingMsg.message} name="message" required rows={3} />
            </label>
            {error && editingMsg && <p className="text-sm text-danger">{error}</p>}
            <div className="flex gap-3">
              <Button disabled={busyId === editingMsg.id} type="submit">{busyId === editingMsg.id ? "Saving..." : "Save changes"}</Button>
              <Button disabled={busyId === editingMsg.id} onClick={() => handleDelete(editingMsg.id)} type="button" variant="danger">
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </Button>
              <Button onClick={() => setEditingMsg(null)} type="button" variant="ghost">Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Data Table */}
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-4">
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              className="pl-9"
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by sender, receiver, or message..."
              type="search"
              value={query}
            />
          </div>
          <div className="flex items-center gap-3">
            <Badge>{filtered.length} of {messages.length}</Badge>
          </div>
        </div>

        {filtered.length === 0 && query.trim() === "" ? (
          <div className="p-6">
            <EmptyState description="No messages yet. Click 'Send message' above to create the first one." title="No messages found" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm font-medium text-ink">No messages match &ldquo;{query}&rdquo;</p>
            <p className="mt-1 text-xs text-muted">Try a different search term or clear the filter.</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="min-w-full divide-y divide-border text-left text-sm">
                <thead className="bg-surface-muted text-muted">
                  <tr>
                    <th className="px-6 py-3.5 font-semibold">From</th>
                    <th className="px-6 py-3.5 font-semibold">To</th>
                    <th className="px-6 py-3.5 font-semibold">Message</th>
                    <th className="px-6 py-3.5 font-semibold">Sent</th>
                    <th className="px-6 py-3.5 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-white">
                  {filtered.map((msg) => (
                    <tr key={msg.id} className={`align-middle transition-colors hover:bg-surface-muted/50 ${editingMsg?.id === msg.id ? "bg-primary-soft/30" : ""}`}>
                      <td className="px-6 py-4">
                        <div className="flex min-w-[160px] items-center gap-3">
                          <Avatar className="h-9 w-9 shrink-0" name={nameMap.get(msg.sender_id)} />
                          <div>
                            <span className="truncate font-medium text-ink">{nameMap.get(msg.sender_id) ?? "Unknown"}</span>
                            <p className="text-xs text-muted capitalize">{roleMap.get(msg.sender_id) ?? ""}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex min-w-[160px] items-center gap-3">
                          <Avatar className="h-9 w-9 shrink-0" name={nameMap.get(msg.receiver_id)} />
                          <div>
                            <span className="truncate font-medium text-ink">{nameMap.get(msg.receiver_id) ?? "Unknown"}</span>
                            <p className="text-xs text-muted capitalize">{roleMap.get(msg.receiver_id) ?? ""}</p>
                          </div>
                        </div>
                      </td>
                      <td className="max-w-[300px] truncate px-6 py-4 text-muted">{msg.message}</td>
                      <td className="px-6 py-4 text-muted">{format(new Date(msg.created_at), "MMM d, h:mm a")}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button onClick={() => openEdit(msg)} size="sm" variant="secondary">
                            <SquarePen className="h-3.5 w-3.5" /> Manage
                          </Button>
                          <Button disabled={busyId === msg.id} onClick={() => handleDelete(msg.id)} size="sm" variant="danger">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="space-y-3 p-4 lg:hidden">
              {filtered.map((msg) => (
                <div key={msg.id} className={`rounded-[22px] border p-4 ${editingMsg?.id === msg.id ? "border-primary/30 bg-primary-soft/20" : "border-border/80 bg-white shadow-soft transition-shadow hover:shadow-card"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink">{nameMap.get(msg.sender_id) ?? "Unknown"} <span className="font-normal text-muted">to</span> {nameMap.get(msg.receiver_id) ?? "Unknown"}</p>
                      <p className="mt-1 text-sm text-muted line-clamp-2">{msg.message}</p>
                    </div>
                    <span className="shrink-0 text-xs text-muted">{format(new Date(msg.created_at), "MMM d")}</span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button className="flex-1" onClick={() => openEdit(msg)} size="sm" variant="secondary">
                      <SquarePen className="h-3.5 w-3.5" /> Manage
                    </Button>
                    <Button disabled={busyId === msg.id} onClick={() => handleDelete(msg.id)} size="sm" variant="danger">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
