import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth/get-user'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { dbUser } = await getAuthUser()
    if (!dbUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const leadId = searchParams.get('leadId')
    const campaignId = searchParams.get('campaignId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const where = {
      userId: dbUser.id,
      ...(status && { status: status as never }),
      ...(leadId && { leadId }),
      ...(campaignId && { campaignId }),
    }

    const [emails, total] = await Promise.all([
      prisma.email.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          lead: { select: { id: true, name: true, email: true, company: true } },
          campaign: { select: { id: true, name: true } },
          reply: true,
          followUps: { orderBy: { sequenceNumber: 'asc' } },
        },
      }),
      prisma.email.count({ where }),
    ])

    return NextResponse.json({
      data: emails,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Error fetching emails:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
