import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import type { User } from '@prisma/client'

export async function getAuthUser() {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) return { user: null, dbUser: null }

    // Find or create the DB user record
    let dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } })

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          supabaseId: user.id,
          email: user.email!,
          name: user.user_metadata?.name ?? null,
        },
      })
    }

    return { user, dbUser }
  } catch (err) {
    console.error('getAuthUser error:', err)
    return { user: null, dbUser: null }
  }
}

export async function requireAuthUser(): Promise<{ user: NonNullable<Awaited<ReturnType<typeof getAuthUser>>['user']>; dbUser: User }> {
  const { user, dbUser } = await getAuthUser()
  if (!user || !dbUser) throw new Error('Unauthorized')
  return { user, dbUser }
}
