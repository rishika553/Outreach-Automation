import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth/get-user'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { dbUser } = await getAuthUser()
    if (!dbUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const campaignId = searchParams.get('campaignId')
    const status = searchParams.get('status')

    const leads = await prisma.lead.findMany({
      where: {
        userId: dbUser.id,
        ...(campaignId && { campaignId }),
        ...(status && { status: status as never }),
      },
      orderBy: { createdAt: 'desc' },
    })

    const headers = ['name', 'email', 'company', 'website', 'linkedin', 'industry', 'location', 'status', 'notes', 'createdAt']
    const csvRows = [
      headers.join(','),
      ...leads.map(lead =>
        headers.map(h => {
          const val = lead[h as keyof typeof lead]
          if (val === null || val === undefined) return ''
          const str = String(val)
          // Escape commas and quotes
          return str.includes(',') || str.includes('"') || str.includes('\n')
            ? `"${str.replace(/"/g, '""')}"`
            : str
        }).join(',')
      ),
    ]

    return new NextResponse(csvRows.join('\n'), {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="leads-${Date.now()}.csv"`,
      },
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ error: 'Export failed' }, { status: 500 })
  }
}
