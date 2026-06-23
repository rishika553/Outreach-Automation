import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/stats')
      if (!res.ok) throw new Error('Failed to fetch dashboard stats')
      return res.json()
    },
  })
}

export function useCampaigns(status?: string) {
  return useQuery({
    queryKey: ['campaigns', status],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (status && status !== 'all') params.set('status', status)
      params.set('limit', '50')
      const res = await fetch(`/api/campaigns?${params}`)
      if (!res.ok) throw new Error('Failed to fetch campaigns')
      return res.json()
    },
  })
}

export function useLeads(filters: {
  search?: string
  status?: string
  industry?: string
  campaignId?: string
}) {
  return useQuery({
    queryKey: ['leads', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters.search) params.set('search', filters.search)
      if (filters.status && filters.status !== 'all') params.set('status', filters.status)
      if (filters.industry) params.set('industry', filters.industry)
      if (filters.campaignId) params.set('campaignId', filters.campaignId)
      params.set('limit', '100')
      const res = await fetch(`/api/leads?${params}`)
      if (!res.ok) throw new Error('Failed to fetch leads')
      return res.json()
    },
  })
}

export function useAnalytics(days = 30, campaignId?: string) {
  return useQuery({
    queryKey: ['analytics', days, campaignId],
    queryFn: async () => {
      const params = new URLSearchParams({ days: String(days) })
      if (campaignId) params.set('campaignId', campaignId)
      const res = await fetch(`/api/analytics?${params}`)
      if (!res.ok) throw new Error('Failed to fetch analytics')
      return res.json()
    },
  })
}

export function useInbox() {
  return useQuery({
    queryKey: ['inbox'],
    queryFn: async () => {
      const res = await fetch('/api/inbox')
      if (!res.ok) throw new Error('Failed to fetch inbox')
      return res.json()
    },
  })
}

export function useEmails(status?: string) {
  return useQuery({
    queryKey: ['emails', status],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (status && status !== 'all') params.set('status', status)
      const res = await fetch(`/api/emails?${params}`)
      if (!res.ok) throw new Error('Failed to fetch emails')
      return res.json()
    },
  })
}

export function useCreateLead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to create lead')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}

export function useDeleteLead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/leads/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete lead')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}

export function useResearchLead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (leadId: string) => {
      const res = await fetch(`/api/leads/${leadId}/research`, { method: 'POST' })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Research failed')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
    },
  })
}

export function useUpdateCampaign() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      const res = await fetch(`/api/campaigns/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to update campaign')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
    },
  })
}

export function useDeleteCampaign() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/campaigns/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete campaign')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}
