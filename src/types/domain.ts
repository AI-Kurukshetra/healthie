export type Role = "patient" | "provider" | "admin";

export type AppointmentStatus = "pending" | "confirmed" | "completed" | "cancelled";
export type NotificationType = "message" | "appointment" | "prescription";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: Role;
  organization_id: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Patient {
  id: string;
  user_id: string;
  date_of_birth: string | null;
  phone: string | null;
  emergency_contact: string | null;
  insurance_provider: string | null;
  created_at: string;
  user?: UserProfile;
}

export interface Provider {
  id: string;
  user_id: string;
  organization_id: string | null;
  specialty: string | null;
  license_number: string | null;
  bio: string | null;
  created_at: string;
  user?: UserProfile;
}

export interface ProviderAvailability {
  id: string;
  provider_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  slot_duration_minutes: number;
  timezone: string;
  is_available: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  provider_id: string;
  scheduled_at: string;
  status: AppointmentStatus;
  video_link: string | null;
  reason: string | null;
  created_at: string;
}

export interface MedicalRecord {
  id: string;
  patient_id: string;
  provider_id: string | null;
  diagnosis: string;
  notes: string;
  treatment_plan: string | null;
  document_path: string | null;
  created_at: string;
}

export interface ClinicalNote {
  id: string;
  appointment_id: string;
  provider_id: string;
  patient_id: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  created_at: string;
}

export interface Prescription {
  id: string;
  provider_id: string;
  patient_id: string;
  medication_name: string;
  dosage: string;
  instructions: string;
  duration: string;
  created_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  read_at: string | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}
