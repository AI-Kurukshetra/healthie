import type { Patient } from "@/types/domain";

export type AdminPatientRecord = Patient & {
  user?: {
    id: string;
    email: string;
    full_name: string | null;
  };
};
