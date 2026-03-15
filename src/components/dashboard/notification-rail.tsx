"use client";

import { formatDistanceToNow } from "date-fns";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Notification } from "@/types/domain";

const typeIcon: Record<string, string> = {
  appointment: "bg-blue-50 text-blue-600",
  message: "bg-emerald-50 text-emerald-600",
  prescription: "bg-purple-50 text-purple-600"
};

export function NotificationRail({
  notifications,
  onMarkAsRead,
  compact = false
}: {
  notifications: Notification[];
  onMarkAsRead: (id: string) => Promise<void>;
  compact?: boolean;
}) {
  const displayed = notifications.slice(0, compact ? 8 : 5);
  const unread = notifications.filter((n) => !n.read_at).length;

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink">Notifications</h3>
        {unread > 0 && (
          <span className="inline-flex items-center justify-center rounded-full bg-primary px-2 py-0.5 text-[11px] font-bold text-white">
            {unread}
          </span>
        )}
      </div>

      <div className="mt-3 space-y-1.5">
        {displayed.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border px-3 py-4 text-center text-xs text-muted">All caught up</div>
        ) : (
          displayed.map((notification) => (
            <button
              key={notification.id}
              className="w-full rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-surface-muted"
              onClick={() => void onMarkAsRead(notification.id)}
              type="button"
            >
              <div className="flex items-start gap-2.5">
                <div className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${notification.read_at ? "bg-transparent" : "bg-primary"}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink">{notification.title}</p>
                  <p className="mt-0.5 text-xs text-muted line-clamp-2">{notification.body}</p>
                  <p className="mt-1 text-[11px] text-muted/70">{formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}</p>
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      {unread > 0 && (
        <Button
          className="mt-3 w-full"
          onClick={() => void Promise.all(notifications.filter((n) => !n.read_at).map((n) => onMarkAsRead(n.id)))}
          size="sm"
          variant="ghost"
        >
          Mark all read
        </Button>
      )}
    </Card>
  );
}
