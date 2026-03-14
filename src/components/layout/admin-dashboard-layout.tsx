import { DashboardLayout } from "@/components/layout/dashboard-layout";
import type { Notification, UserProfile } from "@/types/domain";

export function AdminDashboardLayout({
  children,
  profile,
  notifications
}: {
  children: React.ReactNode;
  profile: UserProfile;
  notifications: Notification[];
}) {
  return (
    <DashboardLayout
      currentUserId={profile.id}
      description="Monitor platform health, care operations, and account activity from a single administrative command surface."
      notifications={notifications}
      role="admin"
      sidebarSubtitle="Administrative workspace"
      sidebarTitle="Control center"
      title="Admin workspace"
      userName={profile.full_name ?? profile.email}
    >
      {children}
    </DashboardLayout>
  );
}
