import { z } from "zod";

export const providerAvailabilitySchema = z.object({
  provider_id: z.string().uuid(),
  day_of_week: z.coerce.number().int().min(0).max(6),
  start_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  end_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  slot_duration_minutes: z.coerce.number().int().min(15).max(180),
  timezone: z.string().min(1).default("UTC"),
  is_available: z.coerce.boolean().default(true)
}).refine((value) => value.start_time < value.end_time, {
  message: "End time must be after start time.",
  path: ["end_time"]
});
