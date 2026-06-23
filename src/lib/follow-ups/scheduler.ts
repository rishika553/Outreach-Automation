import { addDays } from 'date-fns'
import { prisma } from '@/lib/prisma'
import { generateFollowUp } from '@/lib/ai'
import { sendEmail, generateEmailHTML, generateTextVersion } from '@/lib/email/resend'

const FOLLOW_UP_DAYS = [3, 7, 14] as const

export async function scheduleFollowUps(emailId: string) {
  const email = await prisma.email.findUnique({
    where: { id: emailId },
    include: { lead: true },
  })

  if (!email || !email.sentAt) return

  const existing = await prisma.followUp.count({ where: { emailId } })
  if (existing > 0) return

  for (let i = 0; i < FOLLOW_UP_DAYS.length; i++) {
    await prisma.followUp.create({
      data: {
        emailId: email.id,
        leadId: email.leadId,
        sequenceNumber: i + 1,
        subject: `Re: ${email.subject}`,
        body: '',
        scheduledFor: addDays(email.sentAt, FOLLOW_UP_DAYS[i]),
        status: 'PENDING',
      },
    })
  }
}

export async function processDueFollowUps() {
  const dueFollowUps = await prisma.followUp.findMany({
    where: {
      status: 'PENDING',
      scheduledFor: { lte: new Date() },
      email: {
        status: { in: ['SENT', 'DELIVERED', 'OPENED'] },
        reply: null,
      },
    },
    include: {
      email: { include: { lead: true, campaign: true } },
      lead: true,
    },
    take: 50,
  })

  const results = []

  for (const followUp of dueFollowUps) {
    const priorSent = await prisma.followUp.count({
      where: {
        emailId: followUp.emailId,
        status: 'SENT',
        sequenceNumber: { lt: followUp.sequenceNumber },
      },
    })

    if (priorSent < followUp.sequenceNumber - 1) continue

    try {
      const generated = await generateFollowUp({
        leadName: followUp.lead.name,
        leadCompany: followUp.lead.company || 'their company',
        originalSubject: followUp.email.subject,
        originalBody: followUp.email.body,
        sequenceNumber: followUp.sequenceNumber,
        tone: followUp.email.tone,
      })

      const sendResult = await sendEmail({
        to: followUp.lead.email,
        subject: generated.subject,
        html: generateEmailHTML(generated.body),
        text: generateTextVersion(generated.body),
      })

      if (!sendResult.success) {
        results.push({ id: followUp.id, success: false, error: sendResult.error })
        continue
      }

      await prisma.followUp.update({
        where: { id: followUp.id },
        data: {
          subject: generated.subject,
          body: generated.body,
          status: 'SENT',
          sentAt: new Date(),
        },
      })

      await prisma.message.create({
        data: {
          userId: followUp.email.userId,
          leadId: followUp.leadId,
          fromEmail: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
          toEmail: followUp.lead.email,
          subject: generated.subject,
          body: generated.body,
          direction: 'OUTBOUND',
        },
      })

      if (followUp.email.campaignId) {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        await prisma.analytics.upsert({
          where: {
            campaignId_date: {
              campaignId: followUp.email.campaignId,
              date: today,
            },
          },
          create: {
            campaignId: followUp.email.campaignId,
            date: today,
            followUpsSent: 1,
          },
          update: {
            followUpsSent: { increment: 1 },
          },
        })
      }

      results.push({ id: followUp.id, success: true })
    } catch (error) {
      results.push({
        id: followUp.id,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  return results
}
