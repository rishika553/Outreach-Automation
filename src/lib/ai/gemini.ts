import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function generateLeadResearch(data: {
  name: string
  company: string
  website?: string
  linkedin?: string
  industry?: string
}) {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

  const prompt = `You are a B2B sales research assistant. Research and analyze the following lead for personalized cold outreach.

Lead Information:
- Name: ${data.name}
- Company: ${data.company}
- Website: ${data.website || 'Not provided'}
- LinkedIn: ${data.linkedin || 'Not provided'}
- Industry: ${data.industry || 'Not provided'}

Generate a comprehensive analysis in the following JSON format (respond ONLY with valid JSON, no markdown):
{
  "companySummary": "A 2-3 sentence summary of the company, what they do, and their market position",
  "targetAudience": "Who are their typical customers/clients? What problems do they solve for them?",
  "painPoints": "3-4 specific challenges or pain points this company might be facing, separated by semicolons",
  "outreachAngle": "The best angle to approach this lead - what value proposition would resonate most?",
  "personalizedHook": "A specific, personalized opening line that references their company, role, or recent news"
}

Focus on actionable insights that would help personalize a cold email. Be specific and avoid generic statements.`

  const result = await model.generateContent(prompt)
  const response = result.response.text()
  
  try {
    // Try to extract JSON from the response
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    throw new Error('No valid JSON found in response')
  } catch {
    throw new Error('Failed to parse AI response as JSON')
  }
}

export async function generateEmail(data: {
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
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

  const toneInstructions = {
    PROFESSIONAL: 'Write in a formal, business-appropriate tone. Use clear, concise language.',
    FRIENDLY: 'Write in a warm, conversational tone. Be approachable and genuine.',
    STARTUP_FOUNDER: 'Write like a founder speaking to another founder. Be direct, authentic, and show you understand their challenges.',
    SALES: 'Write in a persuasive, benefit-focused tone. Highlight value and create urgency appropriately.',
  }

  const prompt = `You are an expert podcast guest invitation email writer. Write a personalized podcast invitation email.

Podcast Name: ${data.campaignGoal}
Guest Channel: ${data.channelName || 'Not provided'}
Recent Video: ${data.recentVideoTitle || 'Not provided'}
Reason: ${data.reasonToInvite || 'Not provided'}

Lead Information:
- Name: ${data.leadName}
- Company: ${data.leadCompany}
- Email: ${data.leadEmail}

${data.companySummary ? `Company Summary: ${data.companySummary}` : ''}
${data.painPoints ? `Pain Points: ${data.painPoints}` : ''}
${data.outreachAngle ? `Outreach Angle: ${data.outreachAngle}` : ''}
${data.personalizedHook ? `Personalized Hook: ${data.personalizedHook}` : ''}

Tone: ${toneInstructions[data.tone]}

CRITICAL REQUIREMENTS:
1. Write a compelling subject line (under 50 characters)
2. Keep the email under 150 words
3. Include a clear, single call-to-action
4. Avoid spam triggers like ALL CAPS, excessive punctuation, or "FREE"
5. Make it feel personal, not templated
6. Reference specific details about their channel and recent content
7. Focus on why they would be a great guest for the podcast

Respond ONLY with valid JSON in this format:
{
  "subject": "Your subject line here",
  "body": "The full email body with proper line breaks"
}`

  const result = await model.generateContent(prompt)
  const response = result.response.text()
  
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    throw new Error('No valid JSON found in response')
  } catch {
    throw new Error('Failed to parse AI response as JSON')
  }
}

export async function analyzeReply(replyContent: string) {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

  const prompt = `Analyze this email reply for a B2B cold outreach campaign. Determine the sentiment and next steps.

Reply Content:
"""
${replyContent}
"""

Respond ONLY with valid JSON:
{
  "sentiment": "POSITIVE" or "NEUTRAL" or "NEGATIVE",
  "summary": "A one-sentence summary of what the reply says",
  "intent": "What the sender is trying to communicate or ask",
  "suggestedAction": "Recommended next step for the salesperson"
}

Guidelines:
- POSITIVE: They're interested, want to meet, ask for more info
- NEUTRAL: They need more time, have questions, not a clear yes/no
- NEGATIVE: They're not interested, want to unsubscribe, it's a rejection`

  const result = await model.generateContent(prompt)
  const response = result.response.text()
  
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    throw new Error('No valid JSON found in response')
  } catch {
    throw new Error('Failed to parse AI response as JSON')
  }
}

export async function generateFollowUp(data: {
  leadName: string
  leadCompany: string
  originalSubject: string
  originalBody: string
  sequenceNumber: number
  tone: 'PROFESSIONAL' | 'FRIENDLY' | 'STARTUP_FOUNDER' | 'SALES'
}) {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

  const toneInstructions = {
    PROFESSIONAL: 'Write in a formal, business-appropriate tone.',
    FRIENDLY: 'Write in a warm, conversational tone.',
    STARTUP_FOUNDER: 'Write like a founder speaking to another founder.',
    SALES: 'Write in a persuasive, benefit-focused tone.',
  }

  const prompt = `Write a follow-up email for a cold outreach campaign. This is follow-up #${data.sequenceNumber} of 3.

Original Email:
Subject: ${data.originalSubject}
Body: ${data.originalBody}

Lead: ${data.leadName} at ${data.leadCompany}

Tone: ${toneInstructions[data.tone]}

Requirements:
1. Reference the previous email briefly
2. Add new value or perspective (don't just say "checking in")
3. Keep it under 100 words
4. Include a clear call-to-action
5. Be persistent but not pushy

${data.sequenceNumber === 1 ? 'This is the first follow-up (3 days after initial email). Be helpful and offer additional value.' : ''}
${data.sequenceNumber === 2 ? 'This is the second follow-up (7 days after first follow-up). Share a relevant insight or case study.' : ''}
${data.sequenceNumber === 3 ? 'This is the final follow-up (14 days after second follow-up). Be brief and leave the door open.' : ''}

Respond ONLY with valid JSON:
{
  "subject": "Re: ${data.originalSubject}",
  "body": "The follow-up email body"
}`

  const result = await model.generateContent(prompt)
  const response = result.response.text()
  
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    throw new Error('No valid JSON found in response')
  } catch {
    throw new Error('Failed to parse AI response as JSON')
  }
}
