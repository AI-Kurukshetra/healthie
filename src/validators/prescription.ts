import { z } from "zod";

export const prescriptionSchema = z.object({
  provider_id: z.string().uuid(),
  patient_id: z.string().uuid(),
  medication_name: z.string().min(1),
  dosage: z.string().min(1),
  instructions: z.string().min(1),
  duration: z.string().min(1)
});

