import type { Role } from "@/types/domain";

export const ROLE_LABELS: Record<Role, string> = {
  patient: "Patient",
  provider: "Provider",
  admin: "Admin"
};

export const APPOINTMENT_STATUSES = [
  "pending",
  "confirmed",
  "completed",
  "cancelled"
] as const;

export const NOTIFICATION_TYPES = [
  "message",
  "appointment",
  "prescription"
] as const;

