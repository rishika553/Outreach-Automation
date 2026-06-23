import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth/get-user'
import { prisma } from '@/lib/prisma'
import { leadSchema } from '@/lib/validations'
import type { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { dbUser } = await getAuthUser()
    if (!dbUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const industry = searchParams.get('industry')
    const campaignId = searchParams.get('campaignId')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const where: Prisma.LeadWhereInput = {
      userId: dbUser.id,
      ...(status && { status: status as Prisma.EnumLeadStatusFilter }),
      ...(industry && { industry }),
      ...(campaignId && { campaignId }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { company: { contains: search, mode: 'insensitive' } },
        ],
      }),
    }

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          campaign: {
            select: { name: true },
          },
        },
      }),
      prisma.lead.count({ where }),
    ])

    return NextResponse.json({
      data: leads,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching leads:', error)
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
    const validatedData = leadSchema.parse(body)

    // Check if lead with this email already exists
    const existingLead = await prisma.lead.findFirst({
      where: {
        userId: dbUser.id,
        email: validatedData.email,
      },
    })

    if (existingLead) {
      return NextResponse.json(
        { error: 'Lead with this email already exists' },
        { status: 400 }
      )
    }

    const lead = await prisma.lead.create({
      data: {
        ...validatedData,
        userId: dbUser.id,
      },
    })

    return NextResponse.json(lead, { status: 201 })
  } catch (error) {
    console.error('Error creating lead:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { dbUser } = await getAuthUser()
    if (!dbUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const ids = searchParams.get('ids')?.split(',') || []

    if (ids.length === 0) {
      return NextResponse.json(
        { error: 'No lead IDs provided' },
        { status: 400 }
      )
    }

    await prisma.lead.deleteMany({
      where: {
        id: { in: ids },
        userId: dbUser.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting leads:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
