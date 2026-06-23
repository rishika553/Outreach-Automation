'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LeadFormDialog } from '@/components/leads/lead-form-dialog'
import { ResearchDialog } from '@/components/leads/research-dialog'
import { EmailComposeDialog } from '@/components/emails/email-compose-dialog'
import { useToast } from '@/hooks/use-toast'
import { useLeads, useDeleteLead } from '@/hooks/use-api'
import { formatDate } from '@/lib/utils'
import {
  Plus, Search, MoreHorizontal, Upload, Download, Pencil, Trash2,
  Mail, Sparkles, Users,
} from 'lucide-react'

const STATUS_COLORS: Record<string, 'secondary' | 'success' | 'warning' | 'default' | 'destructive' | 'outline'> = {
  PENDING: 'secondary',
  GENERATED: 'secondary',
  SENT: 'default',
  REPLIED: 'default',
  BOOKED: 'success',
  REJECTED: 'destructive',
}

export default function LeadsPage() {
  const { toast } = useToast()
  const fileRef = useRef<HTMLInputElement>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [addOpen, setAddOpen] = useState(false)
  const [researchLead, setResearchLead] = useState<any>(null)
  const [composeLead, setComposeLead] = useState<any>(null)
  const [importing, setImporting] = useState(false)

  const { data, isLoading } = useLeads({
    search: search || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
  })
  const deleteLead = useDeleteLead()
  const leads: any[] = data?.data ?? []

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete guest "${name}"?`)) return
    try {
      await deleteLead.mutateAsync(id)
      toast({ title: 'Guest deleted' })
    } catch {
      toast({ title: 'Failed to delete guest', variant: 'destructive' })
    }
  }

  const handleExport = () => {
    const params = new URLSearchParams()
    if (statusFilter !== 'all') params.set('status', statusFilter)
    window.location.href = `/api/leads/export?${params}`
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)

    try {
      const text = await file.text()
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
      if (lines.length < 2) throw new Error('CSV must have a header row and at least one data row')

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z_]/g, ''))
      const rows = lines.slice(1).map(line => {
        const vals = line.split(',')
        return Object.fromEntries(headers.map((h, i) => [h, vals[i]?.trim() ?? '']))
      })

      const res = await fetch('/api/leads/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows }),
      })
      const result = await res.json()
      toast({
        title: `Import complete`,
        description: `${result.success} imported, ${result.failed} skipped`,
      })
    } catch (err) {
      toast({
        title: 'Import failed',
        description: err instanceof Error ? err.message : 'Check your CSV format',
        variant: 'destructive',
      })
    } finally {
      setImporting(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Guests</h1>
          <p className="text-muted-foreground">Manage your potential podcast guests</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleImport} />
          <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={importing}>
            <Upload className="mr-2 h-4 w-4" />{importing ? 'Importing…' : 'Import CSV'}
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />Export CSV
          </Button>
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />Add Guest
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search guests…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="GENERATED">Generated</SelectItem>
            <SelectItem value="SENT">Sent</SelectItem>
            <SelectItem value="REPLIED">Replied</SelectItem>
            <SelectItem value="BOOKED">Booked</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Guests</CardTitle>
          <CardDescription>
            {isLoading ? 'Loading…' : `${leads.length} guests found`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : leads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No guests found</h3>
              <p className="text-muted-foreground mb-4">Add guests manually or import a CSV file.</p>
              <Button onClick={() => setAddOpen(true)}><Plus className="mr-2 h-4 w-4" />Add Guest</Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Guest</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Subscribers</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead: any) => (
                  <TableRow key={lead.id}>
                    <TableCell>
                      <div className="font-medium">{lead.name}</div>
                      <div className="text-xs text-muted-foreground">{lead.email}</div>
                    </TableCell>
                    <TableCell>{lead.channelName || '—'}</TableCell>
                    <TableCell>{lead.subscriberCount != null ? Number(lead.subscriberCount).toLocaleString() : '—'}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_COLORS[lead.status] ?? 'secondary'}>
                        {lead.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>{lead.campaign?.name || '—'}</TableCell>
                    <TableCell>{formatDate(lead.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setResearchLead(lead)}>
                            <Sparkles className="mr-2 h-4 w-4" />Research Guest
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setComposeLead(lead)}>
                            <Mail className="mr-2 h-4 w-4" />Send Email
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(lead.id, lead.name)}>
                            <Trash2 className="mr-2 h-4 w-4" />Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <LeadFormDialog open={addOpen} onOpenChange={setAddOpen} />
      <ResearchDialog lead={researchLead} onClose={() => setResearchLead(null)} />
      <EmailComposeDialog lead={composeLead} onClose={() => setComposeLead(null)} />
    </div>
  )
}
