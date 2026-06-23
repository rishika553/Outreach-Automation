import { generateLeadResearch } from './gemini'
import { generateLeadResearchGroq, generateEmailGroq, analyzeReplyGroq } from './groq'
import { generateEmail, analyzeReply, generateFollowUp } from './gemini'

export type EmailTone = 'PROFESSIONAL' | 'FRIENDLY' | 'STARTUP_FOUNDER' | 'SALES'

async function withFallback<T>(primary: () => Promise<T>, fallback: () => Promise<T>): Promise<T> {
  try {
    return await primary()
  } catch (error) {
    console.warn('Primary AI provider failed, falling back to Groq:', error)
    return await fallback()
  }
}

export async function researchLead(data: {
  name: string
  company: string
  website?: string
  linkedin?: string
  industry?: string
}) {
  return withFallback(
    () => generateLeadResearch(data),
    () => generateLeadResearchGroq(data)
  )
}

export async function generateOutreachEmail(data: {
  leadName: string
  leadCompany: string
  leadEmail: string
  campaignGoal: string
  channelName?: string
  recentVideoTitle?: string
  reasonToInvite?: string
  companySummary?: string
  painPoints?: string
  outreachAngle?: string
  personalizedHook?: string
  tone: EmailTone
}) {
  return withFallback(
    () => generateEmail(data),
    () => generateEmailGroq(data)
  )
}

export async function analyzeEmailReply(replyContent: string) {
  return withFallback(
    () => analyzeReply(replyContent),
    () => analyzeReplyGroq(replyContent)
  )
}

export { generateFollowUp }
