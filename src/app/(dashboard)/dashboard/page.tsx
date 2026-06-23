'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useDashboardStats } from '@/hooks/use-api'
import {
  Megaphone, Users, Mail, TrendingUp, Smile, Clock,
  ArrowUpRight, Plus,
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'

const chartData = [
  { date: 'Mon', sent: 45, opened: 32, replied: 8 },
  { date: 'Tue', sent: 52, opened: 38, replied: 12 },
  { date: 'Wed', sent: 48, opened: 35, replied: 10 },
  { date: 'Thu', sent: 61, opened: 45, replied: 15 },
  { date: 'Fri', sent: 55, opened: 40, replied: 11 },
  { date: 'Sat', sent: 23, opened: 15, replied: 4 },
  { date: 'Sun', sent: 18, opened: 12, replied: 3 },
]

function StatCard({
  title, value, icon: Icon, change, description, loading,
}: {
  title: string
  value: string | number
  icon: React.ElementType
  change?: string
  description: string
  loading?: boolean
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <div className="flex items-end justify-between">
            <div>
              <div className="text-2xl font-bold">{value}</div>
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            </div>
            {change && (
              <Badge variant="success" className="text-xs">
                <ArrowUpRight className="h-3 w-3 mr-0.5" />
                {change}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const { data: stats, isLoading } = useDashboardStats()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your outreach performance
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/campaigns/new">
            <Plus className="mr-2 h-4 w-4" /> New Campaign
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Total Campaigns" value={stats?.totalCampaigns ?? 0} icon={Megaphone} description="All campaigns" loading={isLoading} />
        <StatCard title="Total Leads" value={(stats?.totalLeads ?? 0).toLocaleString()} icon={Users} description="In database" loading={isLoading} />
        <StatCard title="Emails Sent" value={(stats?.emailsSent ?? 0).toLocaleString()} icon={Mail} description="Total sent" loading={isLoading} />
        <StatCard title="Reply Rate" value={`${stats?.replyRate ?? 0}%`} icon={TrendingUp} description="Overall average" loading={isLoading} />
        <StatCard title="Positive Replies" value={stats?.positiveReplies ?? 0} icon={Smile} description="Interested leads" loading={isLoading} />
        <StatCard title="Pending Follow-Ups" value={stats?.pendingFollowUps ?? 0} icon={Clock} description="Scheduled" loading={isLoading} />
      </div>

      {/* Chart Row */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Email Performance</CardTitle>
            <CardDescription>Sent, opened, and replied this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="sent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(221.2 83.2% 53.3%)" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="hsl(221.2 83.2% 53.3%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="opened" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(142 76% 36%)" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="hsl(142 76% 36%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="replied" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(38 92% 50%)" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="hsl(38 92% 50%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="sent" stroke="hsl(221.2 83.2% 53.3%)" fill="url(#sent)" name="Sent" />
                  <Area type="monotone" dataKey="opened" stroke="hsl(142 76% 36%)" fill="url(#opened)" name="Opened" />
                  <Area type="monotone" dataKey="replied" stroke="hsl(38 92% 50%)" fill="url(#replied)" name="Replied" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: 'New Campaign', href: '/dashboard/campaigns/new', icon: Megaphone },
              { label: 'Add Lead', href: '/dashboard/leads', icon: Users },
              { label: 'Compose Email', href: '/dashboard/emails', icon: Mail },
              { label: 'View Inbox', href: '/dashboard/inbox', icon: Mail },
              { label: 'Analytics', href: '/dashboard/analytics', icon: TrendingUp },
            ].map(({ label, href, icon: Icon }) => (
              <Button key={label} variant="outline" className="w-full justify-start" asChild>
                <Link href={href}>
                  <Icon className="mr-2 h-4 w-4" />
                  {label}
                </Link>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates from your campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { color: 'bg-blue-500', msg: 'John from Acme replied to your email', time: '2m ago' },
              { color: 'bg-green-500', msg: 'Sent 45 emails for Q1 Outreach campaign', time: '1h ago' },
              { color: 'bg-green-500', msg: 'Sarah marked as interested — Tech Startup', time: '3h ago' },
              { color: 'bg-yellow-500', msg: 'Follow-up sent to Mike at InnovateCo', time: '5h ago' },
              { color: 'bg-purple-500', msg: '12 emails opened in Sales Push', time: '6h ago' },
            ].map((a, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className={`mt-1.5 h-2 w-2 rounded-full flex-shrink-0 ${a.color}`} />
                <div className="flex-1 flex items-center justify-between">
                  <p className="text-sm">{a.msg}</p>
                  <span className="text-xs text-muted-foreground ml-4 whitespace-nowrap">{a.time}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
