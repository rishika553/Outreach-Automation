'use client'

import { useState } from 'react'
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Sparkles, Send, Copy, RefreshCw, Loader2 } from 'lucide-react'

interface EmailComposeDialogProps {
  lead: { id: string; name: string; email: string; company?: string } | null
  onClose: () => void
}

const TONES = [
  { value: 'PROFESSIONAL', label: 'Professional' },
  { value: 'FRIENDLY', label: 'Friendly' },
  { value: 'STARTUP_FOUNDER', label: 'Startup Founder' },
  { value: 'SALES', label: 'Sales' },
]

export function EmailComposeDialog({ lead, onClose }: EmailComposeDialogProps) {
  const { toast } = useToast()
  const [tone, setTone] = useState('PROFESSIONAL')
  const [campaignGoal, setCampaignGoal] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [emailId, setEmailId] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [sending, setSending] = useState(false)

  const handleGenerate = async () => {
    if (!campaignGoal.trim()) {
      toast({ title: 'Add a campaign goal first', variant: 'destructive' })
      return
    }
    setGenerating(true)
    try {
      const res = await fetch('/api/emails/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: lead!.id,
          tone,
          campaignGoal,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSubject(data.subject)
      setBody(data.body)
      if (data.emailId) setEmailId(data.emailId)
      toast({ title: 'Email generated!' })
    } catch (err) {
      toast({ title: 'Generation failed', description: err instanceof Error ? err.message : 'Try again', variant: 'destructive' })
    } finally {
      setGenerating(false)
    }
  }

  const handleSend = async () => {
    if (!subject || !body) {
      toast({ title: 'Generate or write an email first', variant: 'destructive' })
      return
    }
    setSending(true)
    try {
      const res = await fetch('/api/emails/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailId,
          leadId: lead!.id,
          subject,
          body,
          tone,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast({ title: 'Email sent!', description: `Sent to ${lead!.email}` })
      onClose()
    } catch (err) {
      toast({ title: 'Send failed', description: err instanceof Error ? err.message : 'Try again', variant: 'destructive' })
    } finally {
      setSending(false)
    }
  }

  const handleSendTest = async () => {
    const testEmail = prompt('Enter your test email address:')
    if (!testEmail) return
    setSending(true)
    try {
      const res = await fetch('/api/emails/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailId,
          leadId: lead!.id,
          subject,
          body,
          tone,
          testMode: true,
          testRecipient: testEmail,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast({ title: 'Test email sent!', description: `Sent to ${testEmail}` })
    } catch (err) {
      toast({ title: 'Test send failed', description: err instanceof Error ? err.message : '', variant: 'destructive' })
    } finally {
      setSending(false)
    }
  }

  const handleClose = () => {
    setSubject(''); setBody(''); setCampaignGoal(''); setEmailId(null)
    onClose()
  }

  return (
    <Dialog open={!!lead} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Compose Email</DialogTitle>
          <DialogDescription>
            Send to {lead?.name} ({lead?.email})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Controls */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TONES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Campaign Goal</Label>
              <Input
                placeholder="e.g. Schedule a demo"
                value={campaignGoal}
                onChange={e => setCampaignGoal(e.target.value)}
              />
            </div>
          </div>

          <Button onClick={handleGenerate} disabled={generating} className="w-full" variant="outline">
            {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            {generating ? 'Generating with AI…' : 'Generate Personalized Email'}
          </Button>

          {/* Email editor */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Subject Line</Label>
              <Input
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="AI will generate a subject line…"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Email Body</Label>
              <Textarea
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder="AI will generate the email body…"
                rows={12}
                className="font-mono text-sm"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleSend} disabled={!body || sending}>
              {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Send Email
            </Button>
            <Button variant="outline" onClick={handleSendTest} disabled={!body || sending}>
              <Send className="mr-2 h-4 w-4" />Send Test
            </Button>
            <Button
              variant="ghost"
              onClick={() => { navigator.clipboard.writeText(`${subject}\n\n${body}`); toast({ title: 'Copied!' }) }}
              disabled={!body}
            >
              <Copy className="mr-2 h-4 w-4" />Copy
            </Button>
            <Button variant="ghost" onClick={handleGenerate} disabled={generating || !campaignGoal}>
              <RefreshCw className="mr-2 h-4 w-4" />Regenerate
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
