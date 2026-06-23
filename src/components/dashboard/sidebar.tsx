'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUIStore } from '@/store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'
import {
  LayoutDashboard,
  Megaphone,
  Users,
  Mail,
  Inbox,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Campaigns', href: '/dashboard/campaigns', icon: Megaphone },
  { name: 'Leads', href: '/dashboard/leads', icon: Users },
  { name: 'Emails', href: '/dashboard/emails', icon: Mail },
  { name: 'Inbox', href: '/dashboard/inbox', icon: Inbox },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarOpen, toggleSidebar } = useUIStore()

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen bg-card border-r transition-all duration-300",
          sidebarOpen ? "w-64" : "w-16"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-4 border-b">
            {sidebarOpen && (
              <Link href="/dashboard" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-bold text-lg">OutreachAI</span>
              </Link>
            )}
            {!sidebarOpen && (
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mx-auto">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
            )}
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-3 py-4">
            <nav className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href || 
                  (item.href !== '/dashboard' && pathname.startsWith(item.href))
                
                return (
                  <Tooltip key={item.name}>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                          !sidebarOpen && "justify-center"
                        )}
                      >
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        {sidebarOpen && <span>{item.name}</span>}
                      </Link>
                    </TooltipTrigger>
                    {!sidebarOpen && <TooltipContent side="right">{item.name}</TooltipContent>}
                  </Tooltip>
                )
              })}
            </nav>
          </ScrollArea>

          {/* Collapse Button */}
          <div className="border-t p-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className={cn("w-full", !sidebarOpen && "justify-center")}
            >
              {sidebarOpen ? (
                <>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Collapse
                </>
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </aside>
    </TooltipProvider>
  )
}
