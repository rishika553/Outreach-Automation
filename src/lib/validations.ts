import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export const campaignSchema = z.object({
  name: z.string().min(1, 'Campaign name is required').max(100),
  outreachGoal: z.string().min(1, 'Outreach goal is required').max(500),
  targetIndustry: z.string().max(100).optional(),
  offer: z.string().max(500).optional(),
  emailTemplate: z.string().max(5000).optional(),
})

export const leadSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  company: z.string().max(100).optional(),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  linkedin: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
  industry: z.string().max(50).optional(),
  location: z.string().max(100).optional(),
  notes: z.string().max(1000).optional(),
  campaignId: z.string().optional(),
})

export const emailSchema = z.object({
  subject: z.string().min(1, 'Subject is required').max(200),
  body: z.string().min(1, 'Email body is required').max(10000),
  tone: z.enum(['PROFESSIONAL', 'FRIENDLY', 'STARTUP_FOUNDER', 'SALES']),
})

export const csvImportSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  company: z.string().optional(),
  website: z.string().optional(),
  linkedin: z.string().optional(),
  industry: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
})

export type LoginInput = z.infer<typeof loginSchema>
export type SignupInput = z.infer<typeof signupSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type CampaignInput = z.infer<typeof campaignSchema>
export type LeadInput = z.infer<typeof leadSchema>
export type EmailInput = z.infer<typeof emailSchema>
export type CSVImportInput = z.infer<typeof csvImportSchema>
