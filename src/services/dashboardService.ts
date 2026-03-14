import { format, isFuture, isToday } from "date-fns";

import type { Appointment, MedicalRecord, Notification, Prescription } from "@/types/domain";

export function summarizeAppointments(appointments: Appointment[]) {
  const total = appointments.length;
  const today = appointments.filter((appointment) => isToday(new Date(appointment.scheduled_at))).length;
  const upcoming = appointments.filter((appointment) => isFuture(new Date(appointment.scheduled_at))).length;

  return {
    total,
    today,
    upcoming
  };
}

export function summarizePatientPortal(
  appointments: Appointment[],
  records: MedicalRecord[],
  prescriptions: Prescription[],
  notifications: Notification[]
) {
  return {
    nextAppointment: appointments[0]
      ? format(new Date(appointments[0].scheduled_at), "MMM d, yyyy 'at' h:mm a")
      : "No appointment scheduled",
    recordCount: records.length,
    prescriptionCount: prescriptions.length,
    unreadNotifications: notifications.filter((item) => !item.read_at).length
  };
}

