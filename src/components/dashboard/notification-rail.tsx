"use client";

import { formatDistanceToNow } from "date-fns";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Notification } from "@/types/domain";

export function NotificationRail({
  notifications,
  onMarkAsRead,
  compact = false
}: {
  notifications: Notification[];
  onMarkAsRead: (id: string) => Promise<void>;
  compact?: boolean;
}) {
  return (
    <Card className={compact ? "p-4" : "p-5"}>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-deep">Notification area</p>
        <h3 className="mt-2 text-lg font-semibold text-ink">Recent activity</h3>
      </div>
      <div className={compact ? "mt-4 space-y-2" : "mt-5 space-y-3"}>
        {notifications.length === 0 ? (
          <div className="rounded-[20px] border border-dashed border-border p-4 text-sm text-muted">No recent notifications.</div>
        ) : (
          notifications.slice(0, compact ? 8 : 6).map((notification) => (
            <button
              key={notification.id}
              className={compact ? "w-full rounded-[18px] border border-border bg-surface-muted p-3 text-left" : "w-full rounded-[20px] border border-border bg-surface-muted p-4 text-left"}
              onClick={() => void onMarkAsRead(notification.id)}
              type="button"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-ink">{notification.title}</p>
                  <p className="mt-1 text-sm text-muted">{notification.body}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs text-muted">{formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}</p>
                  {!notification.read_at ? (
                    <span className="mt-2 inline-flex rounded-pill bg-primary-soft px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary-deep">
                      New
                    </span>
                  ) : null}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
      {notifications.length > 0 ? (
        <Button className="mt-4 w-full" onClick={() => void Promise.all(notifications.filter((item) => !item.read_at).map((item) => onMarkAsRead(item.id)))} size="sm" variant="ghost">
          Mark all as read
        </Button>
      ) : null}
    </Card>
  );
}
