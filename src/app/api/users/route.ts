import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createUserSchema = z.object({
  supabaseId: z.string(),
  email: z.string().email(),
  name: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const body = await request.json()
    const data = createUserSchema.parse(body)

    // If no authenticated user is available, allow creating the user during
    // local development to support email-confirmation flows where signUp does
    // not return a session. In production, require an authenticated session.
    if (!user) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Creating user without authenticated session (development only)')
      } else {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    } else {
      if (data.supabaseId !== user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    const existing = await prisma.user.findUnique({
      where: { supabaseId: data.supabaseId },
    })

    if (existing) {
      return NextResponse.json(existing)
    }

    const dbUser = await prisma.user.create({
      data: {
        supabaseId: data.supabaseId,
        email: data.email,
        name: data.name,
      },
    })

    return NextResponse.json(dbUser, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(dbUser)
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
