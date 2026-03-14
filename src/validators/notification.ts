import { z } from "zod";

export const notificationSchema = z.object({
  user_id: z.string().uuid(),
  type: z.enum(["message", "appointment", "prescription"]),
  title: z.string().min(1).max(120),
  body: z.string().min(1).max(400)
});

