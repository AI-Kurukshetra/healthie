import { z } from "zod";

export const patientProfileSchema = z.object({
  full_name: z.string().trim().min(1).max(120),
  date_of_birth: z.string().trim().optional().nullable(),
  phone: z.string().trim().max(40).optional().nullable(),
  emergency_contact: z.string().trim().max(120).optional().nullable(),
  insurance_provider: z.string().trim().max(120).optional().nullable()
});

export const providerProfileSchema = z.object({
  full_name: z.string().trim().min(1).max(120),
  specialty: z.string().trim().max(120).optional().nullable(),
  license_number: z.string().trim().max(120).optional().nullable(),
  bio: z.string().trim().max(2000).optional().nullable()
});
