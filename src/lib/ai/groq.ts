import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function generateLeadResearchGroq(data: {
  name: string
  company: string
  website?: string
  linkedin?: string
  industry?: string
}) {
  const completion = await groq.chat.completions.create({
    model: 'mixtral-8x7b-32768',
    messages: [
      {
        role: 'system',
        content: 'You are a B2B sales research assistant. Always respond with valid JSON only, no markdown formatting.',
      },
      {
        role: 'user',
        content: `Research and analyze the following lead for personalized cold outreach.

Lead Information:
- Name: ${data.name}
- Company: ${data.company}
- Website: ${data.website || 'Not provided'}
- LinkedIn: ${data.linkedin || 'Not provided'}
- Industry: ${data.industry || 'Not provided'}

Generate a comprehensive analysis in the following JSON format:
{
  "companySummary": "A 2-3 sentence summary of the company",
  "targetAudience": "Who are their typical customers/clients",
  "painPoints": "3-4 specific challenges they might face",
  "outreachAngle": "The best angle to approach this lead",
  "personalizedHook": "A personalized opening line"
}`,
      },
    ],
    temperature: 0.7,
    max_tokens: 1000,
  })

  const response = completion.choices[0]?.message?.content
  if (!response) throw new Error('No response from Groq')

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    throw new Error('No valid JSON found')
  } catch {
    throw new Error('Failed to parse Groq response')
  }
}

export async function generateEmailGroq(data: {
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
  tone: 'PROFESSIONAL' | 'FRIENDLY' | 'STARTUP_FOUNDER' | 'SALES'
}) {
  const toneInstructions = {
    PROFESSIONAL: 'formal, business-appropriate tone',
    FRIENDLY: 'warm, conversational tone',
    STARTUP_FOUNDER: 'direct, authentic founder-to-founder tone',
    SALES: 'persuasive, benefit-focused tone',
  }

  const completion = await groq.chat.completions.create({
    model: 'mixtral-8x7b-32768',
    messages: [
      {
        role: 'system',
        content: 'You are an expert podcast guest invitation email writer. Always respond with valid JSON only.',
      },
      {
        role: 'user',
        content: `Write a personalized podcast invitation email.

Podcast Name: ${data.campaignGoal}
Guest Channel: ${data.channelName || 'Not provided'}
Recent Video: ${data.recentVideoTitle || 'Not provided'}
Reason: ${data.reasonToInvite || 'Not provided'}

Lead: ${data.leadName} at ${data.leadCompany}
${data.companySummary ? `Company: ${data.companySummary}` : ''}
${data.personalizedHook ? `Hook: ${data.personalizedHook}` : ''}

Tone: ${toneInstructions[data.tone]}

Requirements: Subject under 50 chars, email under 150 words, clear CTA.

JSON format:
{
  "subject": "Subject line",
  "body": "Email body with line breaks"
}`,
      },
    ],
    temperature: 0.7,
    max_tokens: 500,
  })

  const response = completion.choices[0]?.message?.content
  if (!response) throw new Error('No response from Groq')

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    throw new Error('No valid JSON found')
  } catch {
    throw new Error('Failed to parse Groq response')
  }
}

export async function analyzeReplyGroq(replyContent: string) {
  const completion = await groq.chat.completions.create({
    model: 'mixtral-8x7b-32768',
    messages: [
      {
        role: 'system',
        content: 'You are a sentiment analysis expert. Always respond with valid JSON only.',
      },
      {
        role: 'user',
        content: `Analyze this email reply:

"""
${replyContent}
"""

JSON format:
{
  "sentiment": "POSITIVE" or "NEUTRAL" or "NEGATIVE",
  "summary": "One sentence summary",
  "intent": "What they're communicating",
  "suggestedAction": "Next step for salesperson"
}`,
      },
    ],
    temperature: 0.3,
    max_tokens: 300,
  })

  const response = completion.choices[0]?.message?.content
  if (!response) throw new Error('No response from Groq')

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    throw new Error('No valid JSON found')
  } catch {
    throw new Error('Failed to parse Groq response')
  }
}
