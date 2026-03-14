import { createSupabaseServerComponentClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { listNotifications } from "@/repositories/notificationRepository";
import { AdminDashboardLayout } from "@/components/layout/admin-dashboard-layout";
import type { Notification } from "@/types/domain";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const { profile, user } = await requireRole("admin");
  const supabase = createSupabaseServerComponentClient();
  const notificationsQuery = await listNotifications(supabase, user.id);
  const notifications = (notificationsQuery.data ?? []) as Notification[];

  return <AdminDashboardLayout notifications={notifications} profile={profile}>{children}</AdminDashboardLayout>;
}
