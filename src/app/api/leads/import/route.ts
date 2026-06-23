import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth/get-user'
import { prisma } from '@/lib/prisma'
import { csvImportSchema } from '@/lib/validations'
import { z } from 'zod'

export async function POST(request: NextRequest) {
  try {
    const { dbUser } = await getAuthUser()
    if (!dbUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const rows: Record<string, string>[] = body.rows
    const campaignId: string | undefined = body.campaignId

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: 'No rows provided' }, { status: 400 })
    }

    let success = 0
    let failed = 0
    const errors: string[] = []

    for (const row of rows) {
      try {
        const validated = csvImportSchema.parse(row)

        // Skip duplicates per user
        const exists = await prisma.lead.findFirst({
          where: { userId: dbUser.id, email: validated.email },
        })
        if (exists) {
          failed++
          errors.push(`Skipped duplicate: ${validated.email}`)
          continue
        }

        await prisma.lead.create({
          data: {
            userId: dbUser.id,
            name: validated.name,
            email: validated.email,
            company: validated.company || null,
            website: validated.website || null,
            linkedin: validated.linkedin || null,
            industry: validated.industry || null,
            location: validated.location || null,
            notes: validated.notes || null,
            ...(campaignId && { campaignId }),
          },
        })
        success++
      } catch (err) {
        failed++
        if (err instanceof z.ZodError) {
          errors.push(`Row "${row.email || row.name}": ${err.issues.map((e: { message: string }) => e.message).join(', ')}`)
        } else {
          errors.push(`Row "${row.email}": Unknown error`)
        }
      }
    }

    return NextResponse.json({ success, failed, errors })
  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json({ error: 'Import failed' }, { status: 500 })
  }
}
