import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth/get-user'
import { prisma } from '@/lib/prisma'
import { campaignSchema } from '@/lib/validations'
import type { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { dbUser } = await getAuthUser()
    if (!dbUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const where: Prisma.CampaignWhereInput = {
      userId: dbUser.id,
      ...(status && { status: status as Prisma.EnumCampaignStatusFilter }),
    }

    const [campaigns, total] = await Promise.all([
      prisma.campaign.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { leads: true, emails: true },
          },
        },
      }),
      prisma.campaign.count({ where }),
    ])

    return NextResponse.json({
      data: campaigns.map(c => ({
        ...c,
        leads: c._count.leads,
        emails: c._count.emails,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching campaigns:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { dbUser } = await getAuthUser()
    if (!dbUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = campaignSchema.parse(body)

    const campaign = await prisma.campaign.create({
      data: {
        ...validatedData,
        userId: dbUser.id,
      },
    })

    return NextResponse.json(campaign, { status: 201 })
  } catch (error) {
    console.error('Error creating campaign:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
