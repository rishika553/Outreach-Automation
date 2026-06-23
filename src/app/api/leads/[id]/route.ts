import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth/get-user'
import { prisma } from '@/lib/prisma'
import { leadSchema } from '@/lib/validations'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { dbUser } = await getAuthUser()
    if (!dbUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const lead = await prisma.lead.findFirst({
      where: { id, userId: dbUser.id },
      include: {
        research: true,
        campaign: { select: { id: true, name: true } },
        emails: {
          orderBy: { createdAt: 'desc' },
          include: { reply: true, followUps: true },
        },
      },
    })

    if (!lead) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(lead)
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
    const lead = await prisma.lead.findFirst({ where: { id, userId: dbUser.id } })
    if (!lead) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const body = await request.json()
    const updatable = leadSchema.partial().parse(body)

    const updated = await prisma.lead.update({
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
    const lead = await prisma.lead.findFirst({ where: { id, userId: dbUser.id } })
    if (!lead) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    await prisma.lead.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
