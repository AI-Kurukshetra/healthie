import { z } from "zod";

const emailSchema = z.string().trim().toLowerCase().email();

export const signupSchema = z.object({
  email: emailSchema,
  password: z.string().min(8, "Password must be at least 8 characters."),
  role: z.enum(["patient", "provider", "admin"]).default("patient")
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(8)
});
