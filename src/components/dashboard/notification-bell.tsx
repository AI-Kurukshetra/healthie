"use client";

import { Bell } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRealtimeNotifications } from "@/hooks/use-realtime-notifications";
import type { Notification } from "@/types/domain";

export function NotificationBell({
  notifications,
  currentUserId,
  onClick
}: {
  notifications: Notification[];
  currentUserId?: string;
  onClick?: () => void;
}) {
  const { unreadCount } = useRealtimeNotifications(notifications, currentUserId);

  return (
    <Button className="relative" onClick={onClick} size="sm" variant="secondary">
      <Bell className="h-4 w-4" />
      Alerts
      {unreadCount > 0 ? <Badge className="absolute -right-2 -top-2">{String(unreadCount)}</Badge> : null}
    </Button>
  );
}
