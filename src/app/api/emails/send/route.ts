import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth/get-user'
import { prisma } from '@/lib/prisma'
import { sendEmail, generateEmailHTML, generateTextVersion } from '@/lib/email/resend'
import { scheduleFollowUps } from '@/lib/follow-ups/scheduler'
import { z } from 'zod'

const sendEmailSchema = z.object({
  emailId: z.string().optional(),
  // allow sending without a persisted email
  leadId: z.string().optional(),
  campaignId: z.string().optional(),
  subject: z.string().optional(),
  body: z.string().optional(),
  tone: z.enum(['PROFESSIONAL', 'FRIENDLY', 'STARTUP_FOUNDER', 'SALES']).optional(),
  testMode: z.boolean().default(false),
  testRecipient: z.string().email().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const { dbUser } = await getAuthUser()
    if (!dbUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const parsed = sendEmailSchema.parse(await request.json())

    let emailRecord = parsed.emailId
      ? await prisma.email.findFirst({
          where: { id: parsed.emailId, userId: dbUser.id },
          include: { lead: true },
        })
      : null

    // Create on the fly
    if (!emailRecord && parsed.leadId && parsed.subject && parsed.body) {
      const lead = await prisma.lead.findFirst({ where: { id: parsed.leadId, userId: dbUser.id } })
      if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 })

      emailRecord = await prisma.email.create({
        data: {
          userId: dbUser.id,
          leadId: parsed.leadId,
          campaignId: parsed.campaignId || null,
          subject: parsed.subject,
          body: parsed.body,
          tone: parsed.tone || 'PROFESSIONAL',
          status: 'QUEUED',
        },
        include: { lead: true },
      }) as any
    }

    if (!emailRecord) return NextResponse.json({ error: 'Email not found' }, { status: 404 })

    const toAddress = parsed.testMode && parsed.testRecipient
      ? parsed.testRecipient
      : emailRecord.lead.email

    const result = await sendEmail({
      to: toAddress,
      subject: emailRecord.subject,
      html: generateEmailHTML(emailRecord.body),
      text: generateTextVersion(emailRecord.body),
    })

    if (!result.success) {
      await prisma.email.update({ where: { id: emailRecord.id }, data: { status: 'FAILED' } })
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    if (!parsed.testMode) {
      const sentAt = new Date()
      await prisma.email.update({
        where: { id: emailRecord.id },
        data: { status: 'SENT', sentAt },
      })

      await prisma.lead.update({
        where: { id: emailRecord.leadId },
        data: { status: 'CONTACTED' as never },
      })

      await prisma.message.create({
        data: {
          userId: dbUser.id,
          leadId: emailRecord.leadId,
          fromEmail: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
          toEmail: emailRecord.lead.email,
          subject: emailRecord.subject,
          body: emailRecord.body,
          direction: 'OUTBOUND',
        },
      })

      if (emailRecord.campaignId) {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        await prisma.analytics.upsert({
          where: { campaignId_date: { campaignId: emailRecord.campaignId, date: today } },
          create: { campaignId: emailRecord.campaignId, date: today, emailsSent: 1 },
          update: { emailsSent: { increment: 1 } },
        })
      }

      // Schedule follow-ups
      await scheduleFollowUps(emailRecord.id)
    }

    return NextResponse.json({ success: true, emailId: emailRecord.id, testMode: parsed.testMode })
  } catch (error) {
    console.error('Send email error:', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}

// Bulk send
const bulkSendSchema = z.object({
  emailIds: z.array(z.string()).min(1).max(100),
})

export async function PUT(request: NextRequest) {
  try {
    const { dbUser } = await getAuthUser()
    if (!dbUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { emailIds } = bulkSendSchema.parse(await request.json())

    const emails = await prisma.email.findMany({
      where: {
        id: { in: emailIds },
        userId: dbUser.id,
        status: { in: ['DRAFT', 'QUEUED'] },
      },
      include: { lead: true },
    })

    const results = await Promise.allSettled(
      emails.map(async (email) => {
        const result = await sendEmail({
          to: email.lead.email,
          subject: email.subject,
          html: generateEmailHTML(email.body),
          text: generateTextVersion(email.body),
        })

        if (result.success) {
          const sentAt = new Date()
          await prisma.email.update({ where: { id: email.id }, data: { status: 'SENT', sentAt } })
          await prisma.lead.update({ where: { id: email.leadId }, data: { status: 'CONTACTED' as never } })
          await scheduleFollowUps(email.id)
          return { id: email.id, success: true }
        }
        await prisma.email.update({ where: { id: email.id }, data: { status: 'FAILED' } })
        return { id: email.id, success: false, error: result.error }
      })
    )

    const sent = results.filter(r => r.status === 'fulfilled' && (r as PromiseFulfilledResult<{ success: boolean }>).value.success).length
    const failed = results.length - sent

    return NextResponse.json({ sent, failed, total: results.length })
  } catch (error) {
    console.error('Bulk send error:', error)
    return NextResponse.json({ error: 'Bulk send failed' }, { status: 500 })
  }
}
