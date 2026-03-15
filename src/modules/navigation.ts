import {
  Activity,
  Bell,
  CalendarDays,
  ChartColumnBig,
  ClipboardList,
  Files,
  LayoutDashboard,
  MessageSquare,
  Pill,
  Settings,
  Stethoscope,
  UserCog,
  Users
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { Role } from "@/types/domain";

export type NavigationItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  description: string;
};

export const marketingNavigation = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" }
];

export const dashboardNavigation: Record<Role, NavigationItem[]> = {
  patient: [
    { href: "/patient/dashboard", label: "Dashboard", icon: LayoutDashboard, description: "Your care overview" },
    { href: "/patient/appointments", label: "Appointments", icon: CalendarDays, description: "Book and manage visits" },
    { href: "/patient/records", label: "Medical Records", icon: Files, description: "Clinical history and files" },
    { href: "/patient/prescriptions", label: "Prescriptions", icon: Pill, description: "Medication plans" },
    { href: "/patient/messages", label: "Messages", icon: MessageSquare, description: "Secure provider chat" },
    { href: "/patient/settings", label: "Settings", icon: Settings, description: "Account preferences" }
  ],
  provider: [
    { href: "/provider/dashboard", label: "Dashboard", icon: LayoutDashboard, description: "Daily operating view" },
    { href: "/provider/patients", label: "Patients", icon: Users, description: "Manage your roster" },
    { href: "/provider/appointments", label: "Appointments", icon: CalendarDays, description: "Visit schedule" },
    { href: "/provider/records", label: "Medical Records", icon: Files, description: "Record management" },
    { href: "/provider/notes", label: "Clinical Notes", icon: ClipboardList, description: "SOAP notes" },
    { href: "/provider/prescriptions", label: "Prescriptions", icon: Pill, description: "Medication workflow" },
    { href: "/provider/messages", label: "Messages", icon: MessageSquare, description: "Patient conversations" },
    { href: "/provider/analytics", label: "Analytics", icon: ChartColumnBig, description: "Operational metrics" },
    { href: "/provider/settings", label: "Settings", icon: Settings, description: "Workspace controls" }
  ],
  admin: [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, description: "Platform overview" },
    { href: "/admin/patients", label: "Patients", icon: Users, description: "Patient operations" },
    { href: "/admin/providers", label: "Providers", icon: Users, description: "Provider operations" },
    { href: "/admin/appointments", label: "Appointments", icon: CalendarDays, description: "Appointment oversight" },
    { href: "/admin/records", label: "Medical Records", icon: Files, description: "Records governance" },
    { href: "/admin/notes", label: "Clinical Notes", icon: ClipboardList, description: "Documentation audits" },
    { href: "/admin/prescriptions", label: "Prescriptions", icon: Pill, description: "Medication activity" },
    { href: "/admin/messages", label: "Messages", icon: MessageSquare, description: "Communication volume" },
    { href: "/admin/analytics", label: "Analytics", icon: ChartColumnBig, description: "Business intelligence" },
    { href: "/admin/profile", label: "Profile", icon: UserCog, description: "Account & password" },
    { href: "/admin/settings", label: "Settings", icon: Settings, description: "Administration" }
  ]
};

export const quickActionLinks = [
  { href: "/signup", label: "Start free" },
  { href: "/contact", label: "Talk to sales" }
];

export const dashboardHighlights = [
  { label: "Operations", icon: Activity },
  { label: "Notifications", icon: Bell },
  { label: "Care delivery", icon: Stethoscope }
];
