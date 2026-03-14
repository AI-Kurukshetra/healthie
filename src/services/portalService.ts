import { listAppointments } from "@/repositories/appointmentRepository";
import { listNotifications } from "@/repositories/notificationRepository";
import { listPrescriptions } from "@/repositories/prescriptionRepository";
import { listMedicalRecords } from "@/repositories/recordRepository";
import { listPatients, listProviders } from "@/repositories/userRepository";
import type { SupabaseTypedClient } from "@/repositories/base";
import { summarizeAppointments, summarizePatientPortal } from "@/services/dashboardService";
import { ensureAppointmentReminderNotifications } from "@/services/notificationService";
import type { Appointment, MedicalRecord, Notification, Patient, Prescription, Provider } from "@/types/domain";

export async function getPatientDashboardData(client: SupabaseTypedClient, patientId: string, userId: string) {
  await ensureAppointmentReminderNotifications(client, userId, "patient");

  const [appointmentsQuery, recordsQuery, prescriptionsQuery, notificationsQuery] = await Promise.all([
    listAppointments(client, { patientId }),
    listMedicalRecords(client, patientId),
    listPrescriptions(client, patientId),
    listNotifications(client, userId)
  ]);

  const appointments = (appointmentsQuery.data ?? []) as Appointment[];
  const records = (recordsQuery.data ?? []) as MedicalRecord[];
  const prescriptions = (prescriptionsQuery.data ?? []) as Prescription[];
  const notifications = (notificationsQuery.data ?? []) as Notification[];

  return {
    appointments,
    records,
    prescriptions,
    notifications,
    summary: summarizePatientPortal(appointments, records, prescriptions, notifications)
  };
}

export async function getProviderDashboardData(client: SupabaseTypedClient, providerId: string) {
  const [appointmentsQuery, patientsQuery, prescriptionsQuery] = await Promise.all([
    listAppointments(client, { providerId }),
    listPatients(client),
    listPrescriptions(client)
  ]);

  const appointments = (appointmentsQuery.data ?? []) as Appointment[];
  const patients = (patientsQuery.data ?? []) as Patient[];
  const prescriptions = (prescriptionsQuery.data ?? []) as Prescription[];

  return {
    appointments,
    patients,
    prescriptions: prescriptions.filter((item) => item.provider_id === providerId),
    summary: summarizeAppointments(appointments)
  };
}

export async function getAdminDashboardData(client: SupabaseTypedClient) {
  const [patientsQuery, providersQuery, appointmentsQuery, prescriptionsQuery] = await Promise.all([
    listPatients(client),
    listProviders(client),
    listAppointments(client),
    listPrescriptions(client)
  ]);

  return {
    patients: (patientsQuery.data ?? []) as Patient[],
    providers: (providersQuery.data ?? []) as Provider[],
    appointments: (appointmentsQuery.data ?? []) as Appointment[],
    prescriptions: (prescriptionsQuery.data ?? []) as Prescription[]
  };
}
