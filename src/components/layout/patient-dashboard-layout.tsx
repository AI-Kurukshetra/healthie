import { DashboardLayout } from "@/components/layout/dashboard-layout";
import type { Notification, UserProfile } from "@/types/domain";

export function PatientDashboardLayout({
  children,
  profile,
  notifications,
  title = "Patient workspace",
  description = "Stay on top of appointments, records, prescriptions, and care team messages from one calm personal dashboard."
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
      role="patient"
      sidebarSubtitle="Patient workspace"
      sidebarTitle="Care access"
      title={title}
      userName={profile.full_name ?? profile.email}
    >
      {children}
    </DashboardLayout>
  );
}
