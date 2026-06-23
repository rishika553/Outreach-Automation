// Database types
export type { User, Campaign, Lead, LeadResearch, Email, EmailReply, FollowUp, Message, Analytics } from '@prisma/client'

// Campaign types
export type CampaignStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED'
export type LeadStatus = 'NEW' | 'CONTACTED' | 'REPLIED' | 'INTERESTED' | 'NOT_INTERESTED' | 'BOUNCED' | 'UNSUBSCRIBED'
export type EmailStatus = 'DRAFT' | 'QUEUED' | 'SENT' | 'DELIVERED' | 'OPENED' | 'REPLIED' | 'BOUNCED' | 'FAILED'
export type EmailTone = 'PROFESSIONAL' | 'FRIENDLY' | 'STARTUP_FOUNDER' | 'SALES'
export type Sentiment = 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE'
export type FollowUpStatus = 'PENDING' | 'QUEUED' | 'SENT' | 'CANCELLED'
export type MessageDirection = 'INBOUND' | 'OUTBOUND'

// API Request/Response types
export interface CreateCampaignInput {
  name: string
  outreachGoal: string
  targetIndustry?: string
  offer?: string
  emailTemplate?: string
}

export interface UpdateCampaignInput extends Partial<CreateCampaignInput> {
  status?: CampaignStatus
}

export interface CreateLeadInput {
  name: string
  email: string
  company?: string
  website?: string
  linkedin?: string
  industry?: string
  location?: string
  notes?: string
  campaignId?: string
}

export interface UpdateLeadInput extends Partial<CreateLeadInput> {
  status?: LeadStatus
}

export interface GenerateEmailInput {
  leadId: string
  campaignId: string
  tone: EmailTone
}

export interface SendEmailInput {
  emailId: string
  testMode?: boolean
}

export interface LeadResearchResult {
  companySummary: string
  targetAudience: string
  painPoints: string
  outreachAngle: string
  personalizedHook: string
}

export interface GeneratedEmail {
  subject: string
  body: string
}

export interface ReplyAnalysis {
  sentiment: Sentiment
  summary: string
  intent: string
  suggestedAction: string
}

// Dashboard statistics
export interface DashboardStats {
  totalCampaigns: number
  totalLeads: number
  emailsSent: number
  replyRate: number
  positiveReplies: number
  pendingFollowUps: number
}

// Chart data types
export interface ChartDataPoint {
  date: string
  sent: number
  opened: number
  replied: number
}

// Table types
export interface TableColumn<T> {
  key: keyof T | string
  label: string
  sortable?: boolean
  render?: (value: unknown, row: T) => React.ReactNode
}

// Pagination types
export interface Pagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: Pagination
}

// CSV Import types
export interface CSVLeadRow {
  name: string
  email: string
  company?: string
  website?: string
  linkedin?: string
  industry?: string
  location?: string
  notes?: string
}

export interface ImportResult {
  success: number
  failed: number
  errors: string[]
}

// Notification types
export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
}
