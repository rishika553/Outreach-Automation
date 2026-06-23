import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth/get-user'
import { prisma } from '@/lib/prisma'
import { subDays } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const { dbUser } = await getAuthUser()
    if (!dbUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')
    const campaignId = searchParams.get('campaignId')

    const since = subDays(new Date(), days)

    const campaigns = await prisma.campaign.findMany({
      where: {
        userId: dbUser.id,
        ...(campaignId && { id: campaignId }),
      },
      include: {
        analytics: {
          where: { date: { gte: since } },
          orderBy: { date: 'asc' },
        },
        emails: {
          select: { status: true, subject: true, tone: true },
        },
        _count: { select: { leads: true } },
      },
    })

    const totals = campaigns.reduce(
      (acc, campaign) => {
        const sent = campaign.emails.filter((e) =>
          ['SENT', 'DELIVERED', 'OPENED', 'REPLIED'].includes(e.status)
        ).length
        const opened = campaign.emails.filter((e) =>
          ['OPENED', 'REPLIED'].includes(e.status)
        ).length
        const replied = campaign.emails.filter((e) => e.status === 'REPLIED').length

        acc.sent += sent
        acc.opened += opened
        acc.replied += replied
        return acc
      },
      { sent: 0, opened: 0, replied: 0 }
    )

    const openRate = totals.sent > 0 ? Math.round((totals.opened / totals.sent) * 1000) / 10 : 0
    const replyRate = totals.sent > 0 ? Math.round((totals.replied / totals.sent) * 1000) / 10 : 0

    const positiveReplies = await prisma.emailReply.count({
      where: {
        sentiment: 'POSITIVE',
        email: {
          userId: dbUser.id,
          ...(campaignId && { campaignId }),
        },
      },
    })

    const positiveReplyRate =
      totals.replied > 0 ? Math.round((positiveReplies / totals.replied) * 1000) / 10 : 0

    const campaignPerformance = campaigns.map((c) => {
      const sent = c.emails.filter((e) =>
        ['SENT', 'DELIVERED', 'OPENED', 'REPLIED'].includes(e.status)
      ).length
      const replied = c.emails.filter((e) => e.status === 'REPLIED').length
      return {
        id: c.id,
        name: c.name,
        leads: c._count.leads,
        sent,
        replyRate: sent > 0 ? Math.round((replied / sent) * 1000) / 10 : 0,
      }
    })

    const templateStats = await prisma.email.groupBy({
      by: ['subject'],
      where: {
        userId: dbUser.id,
        status: { in: ['SENT', 'DELIVERED', 'OPENED', 'REPLIED'] },
      },
      _count: { id: true },
    })

    const topTemplates = templateStats
      .sort((a, b) => b._count.id - a._count.id)
      .slice(0, 5)
      .map((t) => ({ subject: t.subject, count: t._count.id }))

    const dailyAnalytics = campaigns.flatMap((c) => c.analytics)

    return NextResponse.json({
      openRate,
      replyRate,
      positiveReplyRate,
      totals,
      positiveReplies,
      campaignPerformance,
      topTemplates,
      dailyAnalytics,
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
