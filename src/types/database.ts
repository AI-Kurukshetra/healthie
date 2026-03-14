import type {
  Appointment,
  AuditLog,
  ClinicalNote,
  MedicalRecord,
  Message,
  Notification,
  Organization,
  Patient,
  Prescription,
  Provider,
  ProviderAvailability,
  UserProfile
} from "@/types/domain";

type BaseTable<Row, Insert = Partial<Row>, Update = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      users: BaseTable<UserProfile>;
      organizations: BaseTable<Organization>;
      patients: BaseTable<Patient>;
      providers: BaseTable<Provider>;
      provider_availability: BaseTable<ProviderAvailability>;
      appointments: BaseTable<Appointment>;
      medical_records: BaseTable<MedicalRecord>;
      clinical_notes: BaseTable<ClinicalNote>;
      prescriptions: BaseTable<Prescription>;
      messages: BaseTable<Message>;
      notifications: BaseTable<Notification>;
      audit_logs: BaseTable<AuditLog>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
