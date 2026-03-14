import { createSupabaseServerComponentClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { listNotifications } from "@/repositories/notificationRepository";
import { ProviderDashboardLayout } from "@/components/layout/provider-dashboard-layout";
import type { Notification } from "@/types/domain";

export const dynamic = "force-dynamic";

export default async function ProviderLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const { profile, user } = await requireRole("provider");
  const supabase = createSupabaseServerComponentClient();
  const notificationsQuery = await listNotifications(supabase, user.id);
  const notifications = (notificationsQuery.data ?? []) as Notification[];

  return <ProviderDashboardLayout notifications={notifications} profile={profile}>{children}</ProviderDashboardLayout>;
}
