import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth/get-user'
import { prisma } from '@/lib/prisma'
import { generateOutreachEmail } from '@/lib/ai'
import { z } from 'zod'

const generateEmailSchema = z.object({
  leadId: z.string(),
  campaignId: z.string().optional(),
  tone: z.enum(['PROFESSIONAL', 'FRIENDLY', 'STARTUP_FOUNDER', 'SALES']).default('PROFESSIONAL'),
  // Allow inline data when generating without a DB lead
  leadName: z.string().optional(),
  leadCompany: z.string().optional(),
  leadEmail: z.string().email().optional(),
  campaignGoal: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const { dbUser } = await getAuthUser()
    if (!dbUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const parsed = generateEmailSchema.parse(body)

    let leadName = parsed.leadName
    let leadCompany = parsed.leadCompany
    let leadEmail = parsed.leadEmail
    let campaignGoal = parsed.campaignGoal
    let channelName: string | undefined
    let recentVideoTitle: string | undefined
    let reasonToInvite: string | undefined
    let companySummary: string | undefined
    let painPoints: string | undefined
    let outreachAngle: string | undefined
    let personalizedHook: string | undefined

    // Fetch from DB if leadId provided
    if (parsed.leadId) {
      const lead = await prisma.lead.findFirst({
        where: { id: parsed.leadId, userId: dbUser.id },
        include: { research: true },
      })
      if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 })

      leadName = lead.name
      leadCompany = lead.company || 'their company'
      leadEmail = lead.email
      channelName = lead.channelName ?? undefined
      recentVideoTitle = lead.recentVideoTitle ?? undefined
      reasonToInvite = lead.reasonToInvite ?? undefined
      companySummary = lead.research?.companySummary ?? undefined
      painPoints = lead.research?.painPoints ?? undefined
      outreachAngle = lead.research?.outreachAngle ?? undefined
      personalizedHook = lead.research?.personalizedHook ?? undefined
    }

    if (parsed.campaignId) {
      const campaign = await prisma.campaign.findFirst({
        where: { id: parsed.campaignId, userId: dbUser.id },
      })
      if (campaign) campaignGoal = campaign.outreachGoal
    }

    if (!leadName || !leadEmail || !campaignGoal) {
      return NextResponse.json(
        { error: 'leadName, leadEmail and campaignGoal are required' },
        { status: 400 }
      )
    }

    const generated = await generateOutreachEmail({
      leadName,
      leadCompany: leadCompany || 'their company',
      leadEmail,
      campaignGoal,
      channelName,
      recentVideoTitle,
      reasonToInvite,
      companySummary,
      painPoints,
      outreachAngle,
      personalizedHook,
      tone: parsed.tone,
    })

    // Optionally save as draft
    if (parsed.leadId && parsed.campaignId) {
      const draft = await prisma.email.create({
        data: {
          userId: dbUser.id,
          leadId: parsed.leadId,
          campaignId: parsed.campaignId,
          subject: generated.subject,
          body: generated.body,
          tone: parsed.tone,
          status: 'DRAFT',
        },
      })
      return NextResponse.json({ ...generated, emailId: draft.id })
    }

    return NextResponse.json(generated)
  } catch (error) {
    console.error('Email generation error:', error)
    return NextResponse.json({ error: 'Email generation failed' }, { status: 500 })
  }
}
