'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import { useEmails } from '@/hooks/use-api'
import { formatDate } from '@/lib/utils'
import { Sparkles, Send, Copy, RefreshCw, Loader2, Mail } from 'lucide-react'

const STATUS_COLORS: Record<string, 'secondary' | 'default' | 'success' | 'destructive' | 'warning'> = {
  DRAFT: 'secondary', QUEUED: 'default', SENT: 'default',
  DELIVERED: 'default', OPENED: 'success', REPLIED: 'success',
  BOUNCED: 'warning', FAILED: 'destructive',
}

const TONES = [
  { value: 'PROFESSIONAL', label: 'Professional' },
  { value: 'FRIENDLY', label: 'Friendly' },
  { value: 'STARTUP_FOUNDER', label: 'Startup Founder' },
  { value: 'SALES', label: 'Sales' },
]

export default function EmailsPage() {
  const { toast } = useToast()
  const [tone, setTone] = useState('PROFESSIONAL')
  const [generating, setGenerating] = useState(false)
  const [sending, setSending] = useState(false)
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [leadData, setLeadData] = useState({ name: '', company: '', email: '', campaignGoal: '' })
  const { data, isLoading } = useEmails()
  const emails: any[] = data?.data ?? []

  const handleGenerate = async () => {
    if (!leadData.name || !leadData.email || !leadData.campaignGoal) {
      toast({ title: 'Fill in name, email, and campaign goal first', variant: 'destructive' })
      return
    }
    setGenerating(true)
    try {
      const res = await fetch('/api/emails/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: 'inline',
          leadName: leadData.name,
          leadCompany: leadData.company,
          leadEmail: leadData.email,
          campaignGoal: leadData.campaignGoal,
          tone,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSubject(data.subject)
      setBody(data.body)
      toast({ title: 'Email generated!' })
    } catch (err) {
      toast({ title: 'Failed to generate email', description: err instanceof Error ? err.message : '', variant: 'destructive' })
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Emails</h1>
        <p className="text-muted-foreground">Generate and manage outreach emails</p>
      </div>

      <Tabs defaultValue="compose" className="space-y-6">
        <TabsList>
          <TabsTrigger value="compose">Compose</TabsTrigger>
          <TabsTrigger value="all">All Emails</TabsTrigger>
        </TabsList>

        <TabsContent value="compose">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Input */}
            <Card>
              <CardHeader>
                <CardTitle>Email Details</CardTitle>
                <CardDescription>Enter lead info to generate a personalized email</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Lead Name *</Label>
                    <Input value={leadData.name} onChange={e => setLeadData(p => ({ ...p, name: e.target.value }))} placeholder="John Smith" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Company</Label>
                    <Input value={leadData.company} onChange={e => setLeadData(p => ({ ...p, company: e.target.value }))} placeholder="Acme Corp" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Lead Email *</Label>
                  <Input type="email" value={leadData.email} onChange={e => setLeadData(p => ({ ...p, email: e.target.value }))} placeholder="john@acme.com" />
                </div>
                <div className="space-y-1.5">
                  <Label>Campaign Goal *</Label>
                  <Textarea value={leadData.campaignGoal} onChange={e => setLeadData(p => ({ ...p, campaignGoal: e.target.value }))} placeholder="What do you want to achieve?" rows={2} />
                </div>
                <div className="space-y-1.5">
                  <Label>Tone</Label>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TONES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleGenerate} disabled={generating} className="w-full">
                  {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  {generating ? 'Generating…' : 'Generate Email'}
                </Button>
              </CardContent>
            </Card>

            {/* Output */}
            <Card>
              <CardHeader>
                <CardTitle>Generated Email</CardTitle>
                <CardDescription>Review and edit before sending</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Subject Line</Label>
                  <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="AI will generate a subject…" />
                </div>
                <div className="space-y-1.5">
                  <Label>Body</Label>
                  <Textarea value={body} onChange={e => setBody(e.target.value)} placeholder="AI will generate the email…" rows={12} className="font-mono text-sm" />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button disabled={!body || sending} onClick={async () => {
                    if (!leadData.email) { toast({ title: 'Enter a lead email', variant: 'destructive' }); return }
                    setSending(true)
                    try {
                      const res = await fetch('/api/emails/send', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ leadId: 'inline', subject, body, tone }),
                      })
                      const d = await res.json()
                      if (!res.ok) throw new Error(d.error)
                      toast({ title: 'Email sent!' })
                    } catch (e) {
                      toast({ title: 'Send failed', variant: 'destructive' })
                    } finally { setSending(false) }
                  }}>
                    {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                    Send
                  </Button>
                  <Button variant="outline" disabled={!body} onClick={() => { navigator.clipboard.writeText(`${subject}\n\n${body}`); toast({ title: 'Copied!' }) }}>
                    <Copy className="mr-2 h-4 w-4" />Copy
                  </Button>
                  <Button variant="ghost" disabled={generating} onClick={handleGenerate}>
                    <RefreshCw className="mr-2 h-4 w-4" />Regenerate
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Emails</CardTitle>
              <CardDescription>{isLoading ? 'Loading…' : `${emails.length} emails`}</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
              ) : emails.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Mail className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold">No emails yet</h3>
                  <p className="text-muted-foreground">Generated and sent emails will appear here.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Lead</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Tone</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Sent</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {emails.map((e: any) => (
                      <TableRow key={e.id}>
                        <TableCell>
                          <div className="font-medium">{e.lead?.name}</div>
                          <div className="text-xs text-muted-foreground">{e.lead?.email}</div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{e.subject}</TableCell>
                        <TableCell><Badge variant="outline" className="text-xs">{e.tone}</Badge></TableCell>
                        <TableCell><Badge variant={STATUS_COLORS[e.status] ?? 'secondary'}>{e.status}</Badge></TableCell>
                        <TableCell>{e.campaign?.name || '—'}</TableCell>
                        <TableCell>{e.sentAt ? formatDate(e.sentAt) : '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
