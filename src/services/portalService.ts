import { listAppointments } from "@/repositories/appointmentRepository";
import { listNotifications } from "@/repositories/notificationRepository";
import { listPrescriptions } from "@/repositories/prescriptionRepository";
import { listMedicalRecords } from "@/repositories/recordRepository";
import { listPatients, listProviders } from "@/repositories/userRepository";
import type { SupabaseTypedClient } from "@/repositories/base";
import { summarizeAppointments, summarizePatientPortal } from "@/services/dashboardService";
import type { Appointment, MedicalRecord, Notification, Patient, Prescription, Provider } from "@/types/domain";

const DASHBOARD_LIMIT = 50;

export async function getPatientDashboardData(client: SupabaseTypedClient, patientId: string, userId: string) {
  const [appointmentsQuery, recordsQuery, prescriptionsQuery, notificationsQuery] = await Promise.all([
    listAppointments(client, { patientId, limit: DASHBOARD_LIMIT }),
    listMedicalRecords(client, patientId, { limit: DASHBOARD_LIMIT }),
    listPrescriptions(client, patientId, { limit: DASHBOARD_LIMIT }),
    listNotifications(client, userId, { limit: 30 })
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
  const [appointmentsQuery, prescriptionsQuery] = await Promise.all([
    listAppointments(client, { providerId, limit: DASHBOARD_LIMIT }),
    listPrescriptions(client, undefined, { limit: DASHBOARD_LIMIT })
  ]);

  const appointments = (appointmentsQuery.data ?? []) as Appointment[];
  const prescriptions = (prescriptionsQuery.data ?? []) as Prescription[];

  // Derive patients from appointments rather than loading the entire patient table
  const uniquePatientIds = [...new Set(appointments.map((a) => a.patient_id))];

  // Only fetch providers own prescriptions
  const providerPrescriptions = prescriptions.filter((item) => item.provider_id === providerId);

  return {
    appointments,
    patientIds: uniquePatientIds,
    prescriptions: providerPrescriptions,
    summary: summarizeAppointments(appointments)
  };
}

export async function getAdminDashboardData(client: SupabaseTypedClient) {
  const [patientsQuery, providersQuery, appointmentsQuery, prescriptionsQuery] = await Promise.all([
    listPatients(client, { limit: DASHBOARD_LIMIT }),
    listProviders(client, { limit: DASHBOARD_LIMIT }),
    listAppointments(client, { limit: DASHBOARD_LIMIT }),
    listPrescriptions(client, undefined, { limit: DASHBOARD_LIMIT })
  ]);

  return {
    patients: (patientsQuery.data ?? []) as Patient[],
    providers: (providersQuery.data ?? []) as Provider[],
    appointments: (appointmentsQuery.data ?? []) as Appointment[],
    prescriptions: (prescriptionsQuery.data ?? []) as Prescription[]
  };
}
