import { z } from "zod";

export const medicalRecordSchema = z.object({
  patient_id: z.string().uuid(),
  provider_id: z.string().uuid().nullable().optional(),
  diagnosis: z.string().min(1),
  notes: z.string().min(1),
  treatment_plan: z.string().optional().nullable(),
  document_path: z.string().optional().nullable()
});

