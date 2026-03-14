"use client";

import { formatDistanceToNow } from "date-fns";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRealtimeNotifications } from "@/hooks/use-realtime-notifications";
import type { Notification } from "@/types/domain";

export function NotificationList({
  notifications,
  currentUserId
}: {
  notifications: Notification[];
  currentUserId?: string;
}) {
  const { notifications: liveNotifications, markAsRead } = useRealtimeNotifications(notifications, currentUserId);

  return (
    <Card className="p-6">
      <div>
        <h3 className="text-lg font-semibold text-ink">Notifications</h3>
        <p className="mt-1 text-sm text-muted">Realtime and polling-backed updates for appointments, messages, and prescriptions.</p>
      </div>

      <div className="mt-5 space-y-3">
        {liveNotifications.length === 0 ? (
          <p className="rounded-[18px] border border-dashed border-border p-4 text-sm text-muted">No notifications yet.</p>
        ) : (
          liveNotifications.map((notification) => (
            <button
              key={notification.id}
              className="w-full rounded-[20px] border border-border bg-surface-muted px-4 py-4 text-left"
              onClick={() => markAsRead(notification.id)}
              type="button"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-ink">{notification.title}</p>
                  <p className="mt-1 text-sm text-muted">{notification.body}</p>
                </div>
                <div className="shrink-0 text-right">
                  <span className="text-xs text-muted">
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                  </span>
                  {!notification.read_at ? (
                    <span className="mt-2 inline-flex rounded-pill bg-primary-soft px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary-deep">
                      Unread
                    </span>
                  ) : null}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </Card>
  );
}
