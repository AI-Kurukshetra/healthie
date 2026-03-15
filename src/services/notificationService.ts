import { format } from "date-fns";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
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

    const now = new Date().toISOString();
    const in24Hours = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    // Fetch only upcoming appointments in the 24-hour window instead of all appointments
    let appointmentQuery;

    if (role === "patient") {
      const patientQuery = await getPatientByUserId(client, userId);
      if (!patientQuery.data) {
        return;
      }

      appointmentQuery = await client
        .from("appointments")
        .select("id, patient_id, provider_id, scheduled_at, status, video_link, reason, created_at")
        .eq("patient_id", patientQuery.data.id)
        .gte("scheduled_at", now)
        .lte("scheduled_at", in24Hours)
        .in("status", ["pending", "confirmed"])
        .limit(10);
    } else {
      const providerQuery = await getProviderByUserId(client, userId);
      if (!providerQuery.data) {
        return;
      }

      appointmentQuery = await client
        .from("appointments")
        .select("id, patient_id, provider_id, scheduled_at, status, video_link, reason, created_at")
        .eq("provider_id", providerQuery.data.id)
        .gte("scheduled_at", now)
        .lte("scheduled_at", in24Hours)
        .in("status", ["pending", "confirmed"])
        .limit(10);
    }

    const upcomingAppointments = (appointmentQuery.data ?? []) as Appointment[];

    if (upcomingAppointments.length === 0) {
      return;
    }

    // Only fetch recent appointment-type notifications to check for duplicates
    const notificationsQuery = await client
      .from("notifications")
      .select("id, type, title, body")
      .eq("user_id", userId)
      .eq("type", "appointment")
      .eq("title", "Appointment reminder")
      .order("created_at", { ascending: false })
      .limit(20);

    const existingNotifications = (notificationsQuery.data ?? []) as Pick<Notification, "id" | "type" | "title" | "body">[];

    // Batch insert all new reminders at once instead of one-by-one
    const notificationsToInsert = upcomingAppointments
      .filter((appointment) => {
        const body = buildReminderBody(appointment);
        return !existingNotifications.some((n) => n.body === body);
      })
      .map((appointment) => ({
        user_id: userId,
        type: "appointment" as const,
        title: "Appointment reminder",
        body: buildReminderBody(appointment)
      }));

    if (notificationsToInsert.length > 0) {
      await (admin.from("notifications") as any).insert(notificationsToInsert);
    }
  } catch {
    // Notification generation is best effort and should not block page rendering.
  }
}
