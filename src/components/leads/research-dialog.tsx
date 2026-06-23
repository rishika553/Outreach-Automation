'use client'

import { useState, useEffect } from 'react'
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { useResearchLead } from '@/hooks/use-api'
import { Sparkles, RefreshCw, Brain, Target, AlertCircle, Crosshair, Zap } from 'lucide-react'

interface ResearchDialogProps {
  lead: { id: string; name: string; company?: string } | null
  onClose: () => void
}

interface ResearchData {
  companySummary: string
  targetAudience: string
  painPoints: string
  outreachAngle: string
  personalizedHook: string
}

export function ResearchDialog({ lead, onClose }: ResearchDialogProps) {
  const { toast } = useToast()
  const researchMutation = useResearchLead()
  const [research, setResearch] = useState<ResearchData | null>(null)
  const [fetchingExisting, setFetchingExisting] = useState(false)

  useEffect(() => {
    if (!lead) { setResearch(null); return }

    // Try to fetch existing research
    setFetchingExisting(true)
    fetch(`/api/leads/${lead.id}/research`)
      .then(r => r.json())
      .then(data => { if (data) setResearch(data) })
      .catch(() => {})
      .finally(() => setFetchingExisting(false))
  }, [lead])

  const handleResearch = async () => {
    if (!lead) return
    try {
      const data = await researchMutation.mutateAsync(lead.id)
      setResearch(data)
      toast({ title: 'Research complete', description: `AI has analyzed ${lead.company || lead.name}.` })
    } catch (err) {
      toast({
        title: 'Research failed',
        description: err instanceof Error ? err.message : 'Please try again.',
        variant: 'destructive',
      })
    }
  }

  const sections = research ? [
    { icon: Brain, label: 'Company Summary', value: research.companySummary },
    { icon: Target, label: 'Target Audience', value: research.targetAudience },
    { icon: AlertCircle, label: 'Pain Points', value: research.painPoints },
    { icon: Crosshair, label: 'Outreach Angle', value: research.outreachAngle },
    { icon: Zap, label: 'Personalized Hook', value: research.personalizedHook },
  ] : []

  return (
    <Dialog open={!!lead} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Lead Research
          </DialogTitle>
          <DialogDescription>
            {lead?.name} {lead?.company ? `— ${lead.company}` : ''}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {fetchingExisting ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
            </div>
          ) : research ? (
            <>
              <div className="flex items-center gap-2">
                <Badge variant="success">Research Complete</Badge>
                <Button variant="ghost" size="sm" onClick={handleResearch} disabled={researchMutation.isPending}>
                  <RefreshCw className={`h-3 w-3 mr-1 ${researchMutation.isPending ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
              {sections.map(({ icon: Icon, label, value }) => (
                <div key={label} className="rounded-lg border p-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Icon className="h-4 w-4 text-primary" />
                    {label}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{value}</p>
                </div>
              ))}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No research yet</h3>
              <p className="text-muted-foreground mb-6 max-w-xs">
                Click below to let AI analyze this lead&apos;s company and generate outreach insights.
              </p>
              <Button onClick={handleResearch} disabled={researchMutation.isPending} size="lg">
                {researchMutation.isPending ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                {researchMutation.isPending ? 'Researching…' : 'Research This Lead'}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
