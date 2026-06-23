import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth/get-user'
import { prisma } from '@/lib/prisma'
import { campaignSchema } from '@/lib/validations'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { dbUser } = await getAuthUser()
    if (!dbUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const campaign = await prisma.campaign.findFirst({
      where: { id, userId: dbUser.id },
      include: {
        leads: { orderBy: { createdAt: 'desc' } },
        emails: {
          include: { lead: { select: { name: true, email: true } }, reply: true },
          orderBy: { createdAt: 'desc' },
        },
        analytics: { orderBy: { date: 'desc' } },
      },
    })

    if (!campaign) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(campaign)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { dbUser } = await getAuthUser()
    if (!dbUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await request.json()

    const campaign = await prisma.campaign.findFirst({
      where: { id, userId: dbUser.id },
    })
    if (!campaign) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Allow partial updates (status only, or full update)
    const updatable = campaignSchema.partial().parse(body)
    const updated = await prisma.campaign.update({
      where: { id },
      data: {
        ...updatable,
        ...(body.status && { status: body.status }),
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { dbUser } = await getAuthUser()
    if (!dbUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const campaign = await prisma.campaign.findFirst({
      where: { id, userId: dbUser.id },
    })
    if (!campaign) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    await prisma.campaign.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
