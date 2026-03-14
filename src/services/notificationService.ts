import { format } from "date-fns";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { listAppointments } from "@/repositories/appointmentRepository";
import { listNotifications } from "@/repositories/notificationRepository";
import { getPatientByUserId, getProviderByUserId } from "@/repositories/userRepository";
import type { Appointment, Notification, Role } from "@/types/domain";
import type { SupabaseTypedClient } from "@/repositories/base";

function buildReminderBody(appointment: Appointment) {
  return `Upcoming appointment on ${format(new Date(appointment.scheduled_at), "MMM d, yyyy h:mm a")}.`;
}

export async function ensureAppointmentReminderNotifications(
  client: SupabaseTypedClient,
  userId: string,
  role: Exclude<Role, "admin">
) {
  try {
    const admin = createSupabaseAdminClient();
    const notificationsQuery = await listNotifications(client, userId);
    const existingNotifications = (notificationsQuery.data ?? []) as Notification[];

    let appointments: Appointment[] = [];

    if (role === "patient") {
      const patientQuery = await getPatientByUserId(client, userId);
      if (!patientQuery.data) {
        return;
      }

      const appointmentsQuery = await listAppointments(client, { patientId: patientQuery.data.id });
      appointments = (appointmentsQuery.data ?? []) as Appointment[];
    }

    if (role === "provider") {
      const providerQuery = await getProviderByUserId(client, userId);
      if (!providerQuery.data) {
        return;
      }

      const appointmentsQuery = await listAppointments(client, { providerId: providerQuery.data.id });
      appointments = (appointmentsQuery.data ?? []) as Appointment[];
    }

    const now = Date.now();
    const in24Hours = now + 24 * 60 * 60 * 1000;
    const upcomingAppointments = appointments.filter((appointment) => {
      if (appointment.status === "cancelled" || appointment.status === "completed") {
        return false;
      }

      const scheduledAt = new Date(appointment.scheduled_at).getTime();
      return scheduledAt >= now && scheduledAt <= in24Hours;
    });

    for (const appointment of upcomingAppointments) {
      const body = buildReminderBody(appointment);
      const exists = existingNotifications.some(
        (notification) => notification.type === "appointment" && notification.title === "Appointment reminder" && notification.body === body
      );

      if (exists) {
        continue;
      }

      await (admin.from("notifications") as any).insert({
        user_id: userId,
        type: "appointment",
        title: "Appointment reminder",
        body
      });
    }
  } catch {
    // Notification generation is best effort and should not block page rendering.
  }
}
