"use client";

import { useState, type PropsWithChildren, type ReactNode } from "react";

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
  const navigation = dashboardNavigation[role];

  const actions = (
    <>
      <NotificationBell onClick={() => setActivityOpen((current) => !current)} unreadCount={unreadCount} />
      {headerActions}
    </>
  );

  return (
    <div className="flex min-h-screen bg-canvas">
      {/* Fixed sidebar */}
      <Sidebar
        items={navigation}
        onOpenChange={setSidebarOpen}
        open={sidebarOpen}
        subtitle={sidebarSubtitle}
        title={sidebarTitle}
        userName={userName}
      />

      {/* Main content area — fills remaining width */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="sticky top-0 z-20 border-b border-border bg-white/80 px-6 py-4 backdrop-blur-sm lg:px-8">
          <Header
            actions={actions}
            description={description}
            onMenuToggle={() => setSidebarOpen(true)}
            title={title}
            userName={userName}
          />
        </div>

        <div className="flex min-h-0 flex-1">
          <main className="min-w-0 flex-1 px-6 py-6 lg:px-8">
            {children}
          </main>

          {/* Notification rail — always visible on wide screens */}
          <aside className="hidden w-[320px] shrink-0 border-l border-border bg-white/50 p-5 xl:block">
            <div className="sticky top-24">
              <NotificationRail notifications={liveNotifications} onMarkAsRead={markAsRead} />
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile notification overlay */}
      {activityOpen ? (
        <div className="fixed inset-0 z-40 bg-slate-950/30 px-4 pb-4 pt-20 xl:hidden">
          <button aria-label="Close activity panel" className="absolute inset-0" onClick={() => setActivityOpen(false)} type="button" />
          <div className="relative mx-auto flex h-full max-w-md flex-col gap-3">
            <div className="flex items-center justify-between rounded-xl border border-border bg-white px-4 py-3 shadow-elevated">
              <div>
                <p className="text-sm font-semibold text-ink">Notifications</p>
                <p className="text-xs text-muted">{unreadCount} unread</p>
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
