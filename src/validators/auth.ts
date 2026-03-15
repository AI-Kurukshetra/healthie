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

export const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, "Current password is required."),
    new_password: z.string().min(8, "New password must be at least 8 characters."),
    confirm_password: z.string().min(1, "Please confirm your new password.")
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords do not match.",
    path: ["confirm_password"]
  });
