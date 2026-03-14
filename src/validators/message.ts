import { z } from "zod";

export const messageSchema = z.object({
  sender_id: z.string().uuid(),
  receiver_id: z.string().uuid(),
  message: z.string().min(1).max(3000)
});

