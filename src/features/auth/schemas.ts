import { z } from 'zod'

// Mirrors the backend password rule: >=8 chars, 1 uppercase, 1 number, 1 symbol.
const passwordSchema = z
  .string()
  .min(8, 'At least 8 characters')
  .regex(/[A-Z]/, 'Add an uppercase letter')
  .regex(/\d/, 'Add a number')
  .regex(/[^A-Za-z0-9]/, 'Add a symbol')

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

export const registerSchema = z.object({
  clinic_name: z.string().min(2, 'Clinic name is required').max(150),
  contact_name: z.string().min(2, 'Your name is required').max(120),
  email: z.string().email('Enter a valid email'),
  password: passwordSchema,
})

export type LoginValues = z.infer<typeof loginSchema>
export type RegisterValues = z.infer<typeof registerSchema>
