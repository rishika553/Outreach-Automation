import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Ensure the user exists in our database
      try {
        const { prisma } = await import('@/lib/prisma')
        const existing = await prisma.user.findUnique({
          where: { supabaseId: data.user.id },
        })
        if (!existing) {
          await prisma.user.create({
            data: {
              supabaseId: data.user.id,
              email: data.user.email!,
              name: data.user.user_metadata?.name ?? null,
            },
          })
        }
      } catch (dbErr) {
        console.error('DB user creation after email confirm failed:', dbErr)
        // Non-fatal — the getAuthUser helper will create it on first dashboard load
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=confirmation_failed`)
}
