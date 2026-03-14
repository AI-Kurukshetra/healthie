import { z } from "zod";

export const clinicalNoteSchema = z.object({
  appointment_id: z.string().uuid(),
  provider_id: z.string().uuid(),
  patient_id: z.string().uuid(),
  subjective: z.string().min(1),
  objective: z.string().min(1),
  assessment: z.string().min(1),
  plan: z.string().min(1)
});

