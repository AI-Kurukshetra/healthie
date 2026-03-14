"use client";

import { Bell } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function NotificationBell({
  unreadCount,
  onClick
}: {
  unreadCount: number;
  onClick?: () => void;
}) {
  return (
    <Button className="relative" onClick={onClick} size="sm" variant="secondary">
      <Bell className="h-4 w-4" />
      Alerts
      {unreadCount > 0 ? <Badge className="absolute -right-2 -top-2">{String(unreadCount)}</Badge> : null}
    </Button>
  );
}
