'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { useUIStore } from '@/store'
import { cn } from '@/lib/utils'

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ email: string; name?: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const { sidebarOpen } = useUIStore()

  useEffect(() => {
    const supabase = createClient()

    // Get initial user
    supabase.auth.getUser().then((res: any) => {
      const user = res.data?.user
      if (!user) {
        window.location.href = '/login'
        return
      }
      setUser({ email: user.email || '', name: user.user_metadata?.name })
      setLoading(false)
    })

    // Listen for sign-out
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: any) => {
      if (event === 'SIGNED_OUT') {
        window.location.href = '/login'
      }
    }) as any

    return () => subscription?.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading dashboard…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div
        className={cn(
          'transition-all duration-300',
          sidebarOpen ? 'lg:pl-64' : 'lg:pl-16'
        )}
      >
        <Header user={user} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
