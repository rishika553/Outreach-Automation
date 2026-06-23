'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { useCampaigns, useUpdateCampaign, useDeleteCampaign } from '@/hooks/use-api'
import { formatDate } from '@/lib/utils'
import {
  Plus, MoreHorizontal, Play, Pause, Pencil, Trash2, Eye, Megaphone,
} from 'lucide-react'

const STATUS_COLORS: Record<string, 'secondary' | 'success' | 'warning' | 'default' | 'outline'> = {
  DRAFT: 'secondary',
  ACTIVE: 'success',
  PAUSED: 'warning',
  COMPLETED: 'default',
  ARCHIVED: 'outline',
}

export default function CampaignsPage() {
  const { toast } = useToast()
  const [statusFilter, setStatusFilter] = useState('all')
  const { data, isLoading } = useCampaigns(statusFilter === 'all' ? undefined : statusFilter)
  const updateCampaign = useUpdateCampaign()
  const deleteCampaign = useDeleteCampaign()
  const campaigns = data?.data ?? []

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateCampaign.mutateAsync({ id, data: { status } })
      toast({ title: 'Campaign updated' })
    } catch {
      toast({ title: 'Failed to update campaign', variant: 'destructive' })
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete campaign "${name}"? This cannot be undone.`)) return
    try {
      await deleteCampaign.mutateAsync(id)
      toast({ title: 'Campaign deleted' })
    } catch {
      toast({ title: 'Failed to delete campaign', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
          <p className="text-muted-foreground">Manage your podcast guest outreach campaigns</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/campaigns/new">
            <Plus className="mr-2 h-4 w-4" /> New Campaign
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="PAUSED">Paused</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Campaigns</CardTitle>
          <CardDescription>{campaigns.length} campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : campaigns.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Megaphone className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No campaigns yet</h3>
              <p className="text-muted-foreground mb-4">Create your first campaign to start sourcing podcast guests.</p>
              <Button asChild>
                <Link href="/dashboard/campaigns/new"><Plus className="mr-2 h-4 w-4" />New Campaign</Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Podcast</TableHead>
                  <TableHead className="text-right">Guests</TableHead>
                  <TableHead className="text-right">Emails</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((c: any) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <div className="font-medium">{c.name}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-xs">{c.outreachGoal}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_COLORS[c.status] ?? 'default'}>{c.status}</Badge>
                    </TableCell>
                    <TableCell>{c.targetIndustry || '—'}</TableCell>
                    <TableCell className="text-right">{c.leads ?? 0}</TableCell>
                    <TableCell className="text-right">{c.emails ?? 0}</TableCell>
                    <TableCell>{formatDate(c.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/campaigns/${c.id}`}><Eye className="mr-2 h-4 w-4" />View</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/campaigns/${c.id}/edit`}><Pencil className="mr-2 h-4 w-4" />Edit</Link>
                          </DropdownMenuItem>
                          {c.status === 'ACTIVE' && (
                            <DropdownMenuItem onClick={() => handleStatusChange(c.id, 'PAUSED')}>
                              <Pause className="mr-2 h-4 w-4" />Pause
                            </DropdownMenuItem>
                          )}
                          {(c.status === 'PAUSED' || c.status === 'DRAFT') && (
                            <DropdownMenuItem onClick={() => handleStatusChange(c.id, 'ACTIVE')}>
                              <Play className="mr-2 h-4 w-4" />Activate
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(c.id, c.name)}
                          >
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
    </div>
  )
}
