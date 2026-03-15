"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Inbox, MessageSquare, Plus, Search, Send, SquarePen } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/empty-state";
import type { Message, UserProfile } from "@/types/domain";

export function AdminMessageDirectory({
  messages,
  users
}: {
  messages: Message[];
  users: UserProfile[];
}) {
  const [query, setQuery] = useState("");

  const nameMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const u of users) map.set(u.id, u.full_name ?? u.email);
    return map;
  }, [users]);

  const roleMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const u of users) map.set(u.id, u.role);
    return map;
  }, [users]);

  const filtered = useMemo(() => {
    if (!query.trim()) return messages;
    const q = query.toLowerCase();
    return messages.filter((m) => {
      const senderName = (nameMap.get(m.sender_id) ?? "").toLowerCase();
      const receiverName = (nameMap.get(m.receiver_id) ?? "").toLowerCase();
      const content = (m.message ?? "").toLowerCase();
      return senderName.includes(q) || receiverName.includes(q) || content.includes(q);
    });
  }, [messages, query, nameMap]);

  const activeSenders = useMemo(() => new Set(messages.map((m) => m.sender_id)).size, [messages]);
  const activeReceivers = useMemo(() => new Set(messages.map((m) => m.receiver_id)).size, [messages]);

  if (messages.length === 0) {
    return (
      <div className="space-y-6">
        <Card className="flex flex-wrap items-center justify-between gap-4 p-6">
          <div>
            <h2 className="text-2xl font-semibold text-ink">Messages</h2>
            <p className="mt-2 text-sm text-muted">Browse messages. Creation and edits are handled on separate screens.</p>
          </div>
          <Link className={buttonVariants({ size: "sm" })} href="/admin/messages/new">
            <Plus className="h-4 w-4" />
            Send message
          </Link>
        </Card>
        <EmptyState description="No messages exist yet. Send the first message from the dedicated send-message screen." title="No messages found" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="overflow-hidden border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.98)_0%,rgba(236,245,255,0.98)_100%)] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <Badge>Messages</Badge>
            <h2 className="mt-4 text-2xl font-semibold text-ink">Manage messages</h2>
            <p className="mt-2 text-sm leading-7 text-muted">Search, review messages, and open any message for detailed editing.</p>
          </div>
          <Link className={buttonVariants({ size: "sm" })} href="/admin/messages/new">
            <Plus className="h-4 w-4" />
            Send message
          </Link>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-[22px] border border-border/80 bg-white/85 p-4 shadow-soft">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary-deep" />
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-deep">Total</p>
            </div>
            <p className="mt-2 text-3xl font-semibold text-ink">{messages.length}</p>
          </div>
          <div className="rounded-[22px] border border-border/80 bg-white/85 p-4 shadow-soft">
            <div className="flex items-center gap-2">
              <Send className="h-4 w-4 text-emerald-600" />
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600">Active senders</p>
            </div>
            <p className="mt-2 text-3xl font-semibold text-ink">{activeSenders}</p>
          </div>
          <div className="rounded-[22px] border border-border/80 bg-white/85 p-4 shadow-soft">
            <div className="flex items-center gap-2">
              <Inbox className="h-4 w-4 text-blue-600" />
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">Active receivers</p>
            </div>
            <p className="mt-2 text-3xl font-semibold text-ink">{activeReceivers}</p>
          </div>
        </div>
      </Card>

      {/* Search + Table */}
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

        {filtered.length === 0 ? (
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
                  {filtered.map((msg) => {
                    const senderName = nameMap.get(msg.sender_id) ?? "Unknown";
                    const senderRole = roleMap.get(msg.sender_id) ?? "—";
                    const receiverName = nameMap.get(msg.receiver_id) ?? "Unknown";
                    const receiverRole = roleMap.get(msg.receiver_id) ?? "—";
                    return (
                      <tr key={msg.id} className="transition-colors hover:bg-surface-muted/50">
                        <td className="px-6 py-4">
                          <div className="flex min-w-[180px] items-center gap-3">
                            <Avatar className="h-10 w-10 shrink-0" name={senderName} />
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-ink">{senderName}</p>
                              <p className="mt-0.5 text-xs capitalize text-muted">{senderRole}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex min-w-[180px] items-center gap-3">
                            <Avatar className="h-10 w-10 shrink-0" name={receiverName} />
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-ink">{receiverName}</p>
                              <p className="mt-0.5 text-xs capitalize text-muted">{receiverRole}</p>
                            </div>
                          </div>
                        </td>
                        <td className="max-w-[260px] px-6 py-4">
                          <p className="truncate text-sm text-ink">{msg.message}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-ink">{format(new Date(msg.created_at), "MMM d, yyyy")}</p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link className={buttonVariants({ size: "sm", variant: "secondary" })} href={`/admin/messages/${msg.id}`}>
                            <SquarePen className="h-3.5 w-3.5" />
                            Manage
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="space-y-3 p-4 lg:hidden">
              {filtered.map((msg) => {
                const senderName = nameMap.get(msg.sender_id) ?? "Unknown";
                const senderRole = roleMap.get(msg.sender_id) ?? "—";
                const receiverName = nameMap.get(msg.receiver_id) ?? "Unknown";
                const receiverRole = roleMap.get(msg.receiver_id) ?? "—";
                return (
                  <div key={msg.id} className="rounded-[22px] border border-border/80 bg-white p-4 shadow-soft transition-shadow hover:shadow-card">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <Avatar className="h-11 w-11 shrink-0" name={senderName} />
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-ink">{senderName}</p>
                          <p className="truncate text-xs capitalize text-muted">{senderRole}</p>
                        </div>
                      </div>
                      <Link className={buttonVariants({ size: "sm", variant: "secondary" })} href={`/admin/messages/${msg.id}`}>
                        <SquarePen className="h-3.5 w-3.5" />
                        Manage
                      </Link>
                    </div>

                    <div className="mt-4 grid gap-3 grid-cols-2">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">To</p>
                        <p className="mt-1 text-sm text-ink">{receiverName} <span className="text-xs capitalize text-muted">({receiverRole})</span></p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Sent</p>
                        <p className="mt-1 text-sm text-ink">{format(new Date(msg.created_at), "MMM d, yyyy")}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Message</p>
                        <p className="mt-1 truncate text-sm text-ink">{msg.message}</p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-end border-t border-border/60 pt-3">
                      <Link className={buttonVariants({ size: "sm", variant: "secondary" })} href={`/admin/messages/${msg.id}`}>
                        <SquarePen className="h-3.5 w-3.5" />
                        Manage
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
