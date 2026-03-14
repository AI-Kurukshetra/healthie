"use client";

import { useEffect, useMemo, useState } from "react";

import { createBrowserSupabaseClient } from "@/lib/supabaseClient";
import type { Notification } from "@/types/domain";

function sortNotifications(notifications: Notification[]) {
  return [...notifications].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function useRealtimeNotifications(initialNotifications: Notification[], currentUserId?: string) {
  const [notifications, setNotifications] = useState(() => sortNotifications(initialNotifications));

  useEffect(() => {
    setNotifications(sortNotifications(initialNotifications));
  }, [initialNotifications]);

  useEffect(() => {
    if (!currentUserId) {
      return;
    }

    const supabase = createBrowserSupabaseClient();
    const channel = supabase
      .channel(`notifications:${currentUserId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${currentUserId}` },
        (payload) => {
          const notification = payload.new as Notification;
          setNotifications((current) => sortNotifications([notification, ...current.filter((item) => item.id !== notification.id)]));
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "notifications", filter: `user_id=eq.${currentUserId}` },
        (payload) => {
          const notification = payload.new as Notification;
          setNotifications((current) => sortNotifications(current.map((item) => (item.id === notification.id ? notification : item))));
        }
      )
      .subscribe();

    const interval = window.setInterval(async () => {
      const response = await fetch("/api/notifications", { cache: "no-store" });
      if (!response.ok) {
        return;
      }

      const payload = await response.json();
      setNotifications(sortNotifications((payload.data ?? []) as Notification[]));
    }, 30000);

    return () => {
      window.clearInterval(interval);
      void supabase.removeChannel(channel);
    };
  }, [currentUserId]);

  async function markAsRead(id: string) {
    const target = notifications.find((item) => item.id === id);
    if (!target || target.read_at) {
      return;
    }

    setNotifications((current) => current.map((item) => (item.id === id ? { ...item, read_at: new Date().toISOString() } : item)));
    const response = await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });

    if (!response.ok) {
      setNotifications((current) => current.map((item) => (item.id === id ? { ...item, read_at: null } : item)));
      return;
    }

    const payload = await response.json();
    const updated = payload.data as Notification;
    setNotifications((current) => sortNotifications(current.map((item) => (item.id === updated.id ? updated : item))));
  }

  const unreadCount = useMemo(() => notifications.filter((item) => !item.read_at).length, [notifications]);

  return {
    notifications,
    unreadCount,
    markAsRead
  };
}
