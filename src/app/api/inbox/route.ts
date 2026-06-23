import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth/get-user'
import { prisma } from '@/lib/prisma'
import { analyzeEmailReply } from '@/lib/ai'
import { z } from 'zod'

export async function GET() {
  try {
    const { dbUser } = await getAuthUser()
    if (!dbUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const threads = await prisma.lead.findMany({
      where: {
        userId: dbUser.id,
        emails: {
          some: {
            OR: [
              { status: 'REPLIED' },
              { reply: { isNot: null } },
            ],
          },
        },
      },
      include: {
        emails: {
          orderBy: { createdAt: 'desc' },
          include: { reply: true, followUps: true },
        },
        research: true,
      },
      take: 50,
    })

    return NextResponse.json({ data: threads })
  } catch (error) {
    console.error('Inbox error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

const replySchema = z.object({
  emailId: z.string(),
  replyBody: z.string().min(1),
})

export async function POST(request: NextRequest) {
  try {
    const { dbUser } = await getAuthUser()
    if (!dbUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { emailId, replyBody } = replySchema.parse(await request.json())

    const email = await prisma.email.findFirst({
      where: { id: emailId, userId: dbUser.id },
      include: { lead: true },
    })

    if (!email) {
      return NextResponse.json({ error: 'Email not found' }, { status: 404 })
    }

    const analysis = await analyzeEmailReply(replyBody)
    const repliedAt = new Date()

    const reply = await prisma.emailReply.upsert({
      where: { emailId },
      create: {
        emailId,
        replyBody,
        sentiment: analysis.sentiment,
        summary: analysis.summary,
        intent: analysis.intent,
        suggestedAction: analysis.suggestedAction,
        repliedAt,
      },
      update: {
        replyBody,
        sentiment: analysis.sentiment,
        summary: analysis.summary,
        intent: analysis.intent,
        suggestedAction: analysis.suggestedAction,
        repliedAt,
      },
    })

    await prisma.email.update({
      where: { id: emailId },
      data: { status: 'REPLIED', repliedAt },
    })

    await prisma.lead.update({
      where: { id: email.leadId },
      data: {
        status: (analysis.sentiment === 'POSITIVE'
          ? 'INTERESTED'
          : 'REPLIED') as never,
      },
    })

    await prisma.followUp.updateMany({
      where: { emailId, status: 'PENDING' },
      data: { status: 'CANCELLED' },
    })

    await prisma.message.create({
      data: {
        userId: dbUser.id,
        leadId: email.leadId,
        fromEmail: email.lead.email,
        toEmail: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
        subject: `Re: ${email.subject}`,
        body: replyBody,
        direction: 'INBOUND',
      },
    })

    if (email.campaignId) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      await prisma.analytics.upsert({
        where: {
          campaignId_date: { campaignId: email.campaignId, date: today },
        },
        create: {
          campaignId: email.campaignId,
          date: today,
          emailsReplied: 1,
          positiveReplies: analysis.sentiment === 'POSITIVE' ? 1 : 0,
        },
        update: {
          emailsReplied: { increment: 1 },
          ...(analysis.sentiment === 'POSITIVE' && {
            positiveReplies: { increment: 1 },
          }),
        },
      })
    }

    return NextResponse.json(reply)
  } catch (error) {
    console.error('Reply processing error:', error)
    return NextResponse.json({ error: 'Failed to process reply' }, { status: 500 })
  }
}
