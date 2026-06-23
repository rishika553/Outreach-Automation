import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth/get-user'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const { dbUser } = await getAuthUser()
    if (!dbUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const [
      totalCampaigns,
      totalLeads,
      emailsSent,
      emailsReplied,
      positiveReplies,
      pendingFollowUps,
    ] = await Promise.all([
      prisma.campaign.count({ where: { userId: dbUser.id } }),
      prisma.lead.count({ where: { userId: dbUser.id } }),
      prisma.email.count({
        where: {
          userId: dbUser.id,
          status: { in: ['SENT', 'DELIVERED', 'OPENED', 'REPLIED'] },
        },
      }),
      prisma.email.count({ where: { userId: dbUser.id, status: 'REPLIED' } }),
      prisma.emailReply.count({
        where: { sentiment: 'POSITIVE', email: { userId: dbUser.id } },
      }),
      prisma.followUp.count({
        where: { status: 'PENDING', email: { userId: dbUser.id } },
      }),
    ])

    const replyRate = emailsSent > 0
      ? Math.round((emailsReplied / emailsSent) * 1000) / 10
      : 0

    return NextResponse.json({
      totalCampaigns,
      totalLeads,
      emailsSent,
      replyRate,
      positiveReplies,
      pendingFollowUps,
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
