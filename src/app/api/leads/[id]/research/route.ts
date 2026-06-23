import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth/get-user'
import { prisma } from '@/lib/prisma'
import { researchLead } from '@/lib/ai'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { dbUser } = await getAuthUser()
    if (!dbUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const lead = await prisma.lead.findFirst({
      where: { id, userId: dbUser.id },
    })
    if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 })

    const result = await researchLead({
      name: lead.name,
      company: lead.company || lead.name,
      website: lead.website ?? undefined,
      linkedin: lead.linkedin ?? undefined,
      industry: lead.industry ?? undefined,
    })

    const research = await prisma.leadResearch.upsert({
      where: { leadId: id },
      create: {
        leadId: id,
        companySummary: result.companySummary,
        targetAudience: result.targetAudience,
        painPoints: result.painPoints,
        outreachAngle: result.outreachAngle,
        personalizedHook: result.personalizedHook,
      },
      update: {
        companySummary: result.companySummary,
        targetAudience: result.targetAudience,
        painPoints: result.painPoints,
        outreachAngle: result.outreachAngle,
        personalizedHook: result.personalizedHook,
      },
    })

    return NextResponse.json(research)
  } catch (error) {
    console.error('Research error:', error)
    return NextResponse.json({ error: 'Research failed' }, { status: 500 })
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { dbUser } = await getAuthUser()
    if (!dbUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const lead = await prisma.lead.findFirst({ where: { id, userId: dbUser.id } })
    if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 })

    const research = await prisma.leadResearch.findUnique({ where: { leadId: id } })
    if (!research) return NextResponse.json(null)

    return NextResponse.json(research)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
