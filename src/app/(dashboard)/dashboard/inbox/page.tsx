'use client'

import { useState } from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { useInbox } from '@/hooks/use-api'
import { formatRelativeTime } from '@/lib/utils'
import { MailOpen, Send, Sparkles, RefreshCw, Brain, Loader2 } from 'lucide-react'

const SENTIMENT_COLORS = {
  POSITIVE: 'success',
  NEUTRAL: 'secondary',
  NEGATIVE: 'destructive',
} as const

export default function InboxPage() {
  const { toast } = useToast()
  const { data, isLoading, refetch } = useInbox()
  const threads: any[] = data?.data ?? []
  const [selected, setSelected] = useState<any>(null)
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)

  // Gather all emails with replies or inbound messages
  const allThreads = threads.flatMap((lead: any) =>
    (lead.emails || []).map((email: any) => ({ lead, email }))
  ).filter(({ email }) => email.reply || email.status === 'REPLIED')

  const handleSendReply = async () => {
    if (!selected || !reply.trim()) return
    setSending(true)
    try {
      const res = await fetch('/api/inbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailId: selected.email.id, replyBody: reply }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast({ title: 'Reply processed', description: `Sentiment: ${data.sentiment}` })
      setReply('')
      refetch()
    } catch (err) {
      toast({ title: 'Failed to process reply', variant: 'destructive' })
    } finally {
      setSending(false)
    }
  }

  const handleAIReply = async () => {
    if (!selected) return
    setAnalyzing(true)
    // Simulate AI-suggested reply
    await new Promise(r => setTimeout(r, 1200))
    setReply(`Hi ${selected.lead.name},\n\nThank you for getting back to me! I'd love to connect and learn more about how we can help ${selected.lead.company || 'your team'}.\n\nWould you be available for a quick 15-minute call this week?\n\nBest,`)
    setAnalyzing(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inbox</h1>
          <p className="text-muted-foreground">Manage replies and conversation threads</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" />Refresh
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 min-h-[600px]">
        {/* Thread list */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle>Conversations</CardTitle>
            <CardDescription>{allThreads.length} threads</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[520px]">
              {isLoading ? (
                <div className="p-4 space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
              ) : allThreads.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-center px-4">
                  <MailOpen className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No replies yet</p>
                </div>
              ) : allThreads.map(({ lead, email }, i) => (
                <div key={email.id}>
                  <button
                    className={`w-full p-4 text-left hover:bg-accent transition-colors ${selected?.email.id === email.id ? 'bg-accent' : ''}`}
                    onClick={() => setSelected({ lead, email })}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-9 w-9 flex-shrink-0">
                        <AvatarFallback>{lead.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-sm truncate">{lead.name}</span>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatRelativeTime(email.reply?.repliedAt || email.updatedAt)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{email.subject}</p>
                        {email.reply && (
                          <Badge variant={SENTIMENT_COLORS[email.reply.sentiment as keyof typeof SENTIMENT_COLORS] ?? 'secondary'} className="mt-1 text-xs">
                            {email.reply.sentiment}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </button>
                  {i < allThreads.length - 1 && <Separator />}
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Thread detail */}
        <Card className="lg:col-span-2">
          {selected ? (
            <>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{selected.email.subject}</CardTitle>
                    <CardDescription>
                      To {selected.lead.name} ({selected.lead.email})
                    </CardDescription>
                  </div>
                  {selected.email.reply && (
                    <Badge variant={SENTIMENT_COLORS[selected.email.reply.sentiment as keyof typeof SENTIMENT_COLORS] ?? 'secondary'}>
                      {selected.email.reply.sentiment}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Original outreach */}
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">YOUR EMAIL</p>
                  <p className="text-sm whitespace-pre-wrap">{selected.email.body}</p>
                </div>

                {/* Reply */}
                {selected.email.reply && (
                  <div className="rounded-lg border p-4">
                    <p className="text-xs font-semibold text-muted-foreground mb-2">
                      REPLY FROM {selected.lead.name.toUpperCase()}
                    </p>
                    <p className="text-sm whitespace-pre-wrap">{selected.email.reply.replyBody}</p>
                  </div>
                )}

                {/* AI analysis */}
                {selected.email.reply && (
                  <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold">AI Analysis</span>
                    </div>
                    {selected.email.reply.summary && (
                      <p className="text-sm"><strong>Summary:</strong> {selected.email.reply.summary}</p>
                    )}
                    {selected.email.reply.intent && (
                      <p className="text-sm"><strong>Intent:</strong> {selected.email.reply.intent}</p>
                    )}
                    {selected.email.reply.suggestedAction && (
                      <p className="text-sm"><strong>Suggested Action:</strong> {selected.email.reply.suggestedAction}</p>
                    )}
                  </div>
                )}

                <Separator />

                {/* Reply composer */}
                <div className="space-y-3">
                  <p className="text-sm font-medium">Log Incoming Reply</p>
                  <p className="text-xs text-muted-foreground">
                    Paste the reply you received. AI will analyze sentiment and suggest next actions.
                  </p>
                  <Textarea
                    placeholder="Paste the lead's reply here…"
                    value={reply}
                    onChange={e => setReply(e.target.value)}
                    rows={5}
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleSendReply} disabled={!reply.trim() || sending}>
                      {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                      Analyze & Save Reply
                    </Button>
                    <Button variant="outline" onClick={handleAIReply} disabled={analyzing}>
                      {analyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                      AI Suggest Reply
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex flex-col items-center justify-center h-[520px] text-center">
              <MailOpen className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Select a conversation</h3>
              <p className="text-muted-foreground text-sm max-w-xs">
                Choose a thread from the list to view the conversation and AI analysis
              </p>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
}
