import { z } from "zod";

export const appointmentSchema = z.object({
  patient_id: z.string().uuid(),
  provider_id: z.string().uuid(),
  scheduled_at: z.string().datetime(),
  status: z.enum(["pending", "confirmed", "completed", "cancelled"]).default("pending"),
  video_link: z.string().url().optional().or(z.literal("")),
  reason: z.string().max(500).optional().or(z.literal(""))
});

