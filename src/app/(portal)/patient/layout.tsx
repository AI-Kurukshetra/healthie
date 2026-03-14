import { createSupabaseServerComponentClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { listNotifications } from "@/repositories/notificationRepository";
import { PatientDashboardLayout } from "@/components/layout/patient-dashboard-layout";
import type { Notification } from "@/types/domain";

export const dynamic = "force-dynamic";

export default async function PatientLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const { profile, user } = await requireRole("patient");
  const supabase = createSupabaseServerComponentClient();
  const notificationsQuery = await listNotifications(supabase, user.id);
  const notifications = (notificationsQuery.data ?? []) as Notification[];

  return <PatientDashboardLayout notifications={notifications} profile={profile}>{children}</PatientDashboardLayout>;
}
