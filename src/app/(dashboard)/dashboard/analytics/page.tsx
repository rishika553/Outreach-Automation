'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { TrendingUp, TrendingDown, Target, Mail, Users, Smile } from 'lucide-react'

const emailMetricsData = [
  { date: 'Week 1', sent: 450, opened: 280, replied: 67 },
  { date: 'Week 2', sent: 520, opened: 340, replied: 82 },
  { date: 'Week 3', sent: 480, opened: 310, replied: 75 },
  { date: 'Week 4', sent: 610, opened: 425, replied: 98 },
]

const campaignPerformanceData = [
  { name: 'Q1 Enterprise', sent: 432, replies: 123, rate: 28.5 },
  { name: 'Startup Founder', sent: 267, replies: 86, rate: 32.1 },
  { name: 'SaaS Companies', sent: 702, replies: 171, rate: 24.3 },
  { name: 'Agency Partnership', sent: 145, replies: 38, rate: 26.2 },
]

const replySentimentData = [
  { name: 'Positive', value: 45, color: 'hsl(142.1 76.2% 36.3%)' },
  { name: 'Neutral', value: 35, color: 'hsl(215 20.2% 65.1%)' },
  { name: 'Negative', value: 20, color: 'hsl(0 84.2% 60.2%)' },
]

const hourlyData = [
  { hour: '6am', opens: 12 },
  { hour: '9am', opens: 45 },
  { hour: '12pm', opens: 38 },
  { hour: '3pm', opens: 52 },
  { hour: '6pm', opens: 28 },
  { hour: '9pm', opens: 15 },
]

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Track your outreach performance and optimize campaigns
          </p>
        </div>
        <Select defaultValue="30d">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">62.4%</div>
            <div className="flex items-center text-sm text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +4.2% from last period
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reply Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24.5%</div>
            <div className="flex items-center text-sm text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +2.8% from last period
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Positive Replies</CardTitle>
            <Smile className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">127</div>
            <div className="flex items-center text-sm text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +18 from last period
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.2%</div>
            <div className="flex items-center text-sm text-green-600">
              <TrendingDown className="h-3 w-3 mr-1" />
              -0.8% from last period
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Email Performance Over Time</CardTitle>
            <CardDescription>Sent, opened, and replied emails by week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={emailMetricsData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="sent"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.1}
                    name="Sent"
                  />
                  <Area
                    type="monotone"
                    dataKey="opened"
                    stroke="hsl(142.1 76.2% 36.3%)"
                    fill="hsl(142.1 76.2% 36.3%)"
                    fillOpacity={0.1}
                    name="Opened"
                  />
                  <Area
                    type="monotone"
                    dataKey="replied"
                    stroke="hsl(38 92% 50%)"
                    fill="hsl(38 92% 50%)"
                    fillOpacity={0.1}
                    name="Replied"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Campaign Performance</CardTitle>
            <CardDescription>Reply rate by campaign</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={campaignPerformanceData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-xs" />
                  <YAxis type="category" dataKey="name" className="text-xs" width={120} />
                  <Tooltip />
                  <Bar dataKey="rate" fill="hsl(var(--primary))" name="Reply Rate %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Reply Sentiment</CardTitle>
            <CardDescription>Distribution of reply sentiment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={replySentimentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {replySentimentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Best Time to Send</CardTitle>
            <CardDescription>Email opens by hour of day</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="hour" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="opens"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                    name="Opens"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Subject Lines</CardTitle>
          <CardDescription>Subject lines with highest open rates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { subject: 'Quick question about [Company]', openRate: 68.2, replies: 45 },
              { subject: 'Idea for [Company]\'s marketing', openRate: 64.8, replies: 38 },
              { subject: '[Name], 30 seconds?', openRate: 61.3, replies: 32 },
              { subject: 'Partnership opportunity', openRate: 58.9, replies: 28 },
              { subject: 'Thought you might find this interesting', openRate: 55.4, replies: 22 },
            ].map((template, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium">{template.subject}</p>
                  <p className="text-sm text-muted-foreground">{template.replies} replies</p>
                </div>
                <Badge variant="success">{template.openRate}% open rate</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
