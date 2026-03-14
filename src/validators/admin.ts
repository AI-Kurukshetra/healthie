import { z } from "zod";

const emailSchema = z.string().trim().toLowerCase().email();
const optionalString = z.string().trim().max(2000).optional().nullable();
const optionalShortString = z.string().trim().max(120).optional().nullable();

export const adminPatientCreateSchema = z.object({
  email: emailSchema,
  password: z.string().min(8),
  full_name: z.string().trim().min(1).max(120),
  date_of_birth: z.string().trim().optional().nullable(),
  phone: z.string().trim().max(40).optional().nullable(),
  emergency_contact: optionalShortString,
  insurance_provider: optionalShortString
});

export const adminPatientUpdateSchema = z.object({
  user_id: z.string().uuid(),
  full_name: z.string().trim().min(1).max(120),
  date_of_birth: z.string().trim().optional().nullable(),
  phone: z.string().trim().max(40).optional().nullable(),
  emergency_contact: optionalShortString,
  insurance_provider: optionalShortString
});

export const adminProviderCreateSchema = z.object({
  email: emailSchema,
  password: z.string().min(8),
  full_name: z.string().trim().min(1).max(120),
  specialty: optionalShortString,
  license_number: optionalShortString,
  bio: optionalString
});

export const adminProviderUpdateSchema = z.object({
  user_id: z.string().uuid(),
  full_name: z.string().trim().min(1).max(120),
  specialty: optionalShortString,
  license_number: optionalShortString,
  bio: optionalString
});
