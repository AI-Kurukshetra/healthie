"use client";

import { useMemo, useState, type PropsWithChildren, type ReactNode } from "react";

import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { NotificationBell } from "@/components/dashboard/notification-bell";
import { NotificationRail } from "@/components/dashboard/notification-rail";
import { Button } from "@/components/ui/button";
import { useRealtimeNotifications } from "@/hooks/use-realtime-notifications";
import { dashboardNavigation } from "@/modules/navigation";
import type { Notification, Role } from "@/types/domain";

export function DashboardLayout({
  title,
  description,
  sidebarTitle,
  sidebarSubtitle,
  role,
  notifications,
  currentUserId,
  userName,
  headerActions,
  children
}: PropsWithChildren<{
  title: string;
  description: string;
  sidebarTitle: string;
  sidebarSubtitle: string;
  role: Role;
  notifications: Notification[];
  currentUserId?: string;
  userName?: string | null;
  headerActions?: ReactNode;
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activityOpen, setActivityOpen] = useState(false);
  const {
    notifications: liveNotifications,
    unreadCount,
    markAsRead
  } = useRealtimeNotifications(notifications, currentUserId);
  const unreadNotifications = useMemo(
    () => unreadCount,
    [unreadCount]
  );
  const navigation = dashboardNavigation[role];

  const actions = (
    <>
      <NotificationBell onClick={() => setActivityOpen((current) => !current)} unreadCount={unreadCount} />
      {headerActions}
    </>
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(63,132,244,0.12),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(15,23,42,0.08),_transparent_20%),linear-gradient(180deg,#fbfdff_0%,#f1f6fb_100%)]">
      <div className="page-shell flex items-start gap-6 py-6 lg:py-8">
        <Sidebar
          items={navigation}
          onOpenChange={setSidebarOpen}
          open={sidebarOpen}
          subtitle={sidebarSubtitle}
          title={sidebarTitle}
          userName={userName}
        />
        <div className="relative z-10 min-w-0 flex-1 space-y-4 sm:space-y-6">
          <Header
            actions={actions}
            description={description}
            onMenuToggle={() => setSidebarOpen(true)}
            title={title}
            userName={userName}
          />
          <div className="grid gap-4 sm:gap-6 2xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="min-w-0">{children}</div>
            <div className="hidden space-y-6 2xl:block">
              <div className="sticky top-6">
                <NotificationRail notifications={liveNotifications} onMarkAsRead={markAsRead} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {activityOpen ? (
        <div className="fixed inset-0 z-40 bg-slate-950/30 px-4 pb-4 pt-24 2xl:hidden">
          <button aria-label="Close activity panel" className="absolute inset-0" onClick={() => setActivityOpen(false)} type="button" />
          <div className="relative mx-auto flex h-full max-w-lg flex-col gap-3">
            <div className="flex items-center justify-between rounded-pill border border-border bg-white px-4 py-3 shadow-soft">
              <div>
                <p className="text-sm font-semibold text-ink">Recent activity</p>
                <p className="text-xs text-muted">{unreadNotifications} unread notifications</p>
              </div>
              <Button onClick={() => setActivityOpen(false)} size="sm" variant="ghost">
                Close
              </Button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              <NotificationRail compact notifications={liveNotifications} onMarkAsRead={markAsRead} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
