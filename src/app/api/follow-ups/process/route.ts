import { NextRequest, NextResponse } from 'next/server'
import { processDueFollowUps } from '@/lib/follow-ups/scheduler'

// This endpoint is meant to be called by a cron job (e.g. Vercel Cron or external scheduler)
export async function POST(request: NextRequest) {
  // Verify the cron secret to prevent unauthorized calls
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const results = await processDueFollowUps()
    const sent = results.filter(r => r.success).length
    const failed = results.filter(r => !r.success).length

    return NextResponse.json({
      processed: results.length,
      sent,
      failed,
      results,
    })
  } catch (error) {
    console.error('Follow-up processing error:', error)
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const results = await processDueFollowUps()
    return NextResponse.json({ processed: results.length, results })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
  }
}
