import { DashboardLayout } from "@/components/layout/dashboard-layout";
import type { Notification, UserProfile } from "@/types/domain";

export function ProviderDashboardLayout({
  children,
  profile,
  notifications,
  title = "Provider workspace",
  description = "Track today&apos;s visits, patient conversations, clinical notes, and prescriptions from one operational care surface."
}: {
  children: React.ReactNode;
  profile: UserProfile;
  notifications: Notification[];
  title?: string;
  description?: string;
}) {
  return (
    <DashboardLayout
      currentUserId={profile.id}
      description={description}
      notifications={notifications}
      role="provider"
      sidebarSubtitle="Provider workspace"
      sidebarTitle="Practice hub"
      title={title}
      userName={profile.full_name ?? profile.email}
    >
      {children}
    </DashboardLayout>
  );
}
