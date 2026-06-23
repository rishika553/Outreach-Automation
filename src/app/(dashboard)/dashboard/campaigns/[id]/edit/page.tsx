'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { campaignSchema, CampaignInput } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, Loader2 } from 'lucide-react'

export default function EditCampaignPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CampaignInput>({
    resolver: zodResolver(campaignSchema),
  })

  useEffect(() => {
    fetch(`/api/campaigns/${params.id}`)
      .then(r => r.json())
      .then(data => {
        reset({
          name: data.name,
          outreachGoal: data.outreachGoal,
          targetIndustry: data.targetIndustry || '',
          offer: data.offer || '',
          emailTemplate: data.emailTemplate || '',
        })
        setLoading(false)
      })
      .catch(() => { toast({ title: 'Failed to load campaign', variant: 'destructive' }); router.back() })
  }, [params.id, reset, router, toast])

  const onSubmit = async (data: CampaignInput) => {
    setSaving(true)
    try {
      const res = await fetch(`/api/campaigns/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error()
      toast({ title: 'Campaign updated' })
      router.push('/dashboard/campaigns')
    } catch {
      toast({ title: 'Failed to update campaign', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-64 w-full" />
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-4 w-4" /></Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Campaign</h1>
          <p className="text-muted-foreground">Update podcast campaign settings</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader><CardTitle>Podcast Details</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Campaign Name</Label>
                  <Input {...register('name')} disabled={saving} />
                  {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Podcast Name</Label>
                  <Input {...register('targetIndustry')} disabled={saving} />
                </div>
                <div className="space-y-2">
                  <Label>Podcast Topic</Label>
                  <Textarea {...register('outreachGoal')} rows={3} disabled={saving} />
                  {errors.outreachGoal && <p className="text-sm text-destructive">{errors.outreachGoal.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Podcast Description</Label>
                  <Textarea {...register('offer')} rows={2} disabled={saving} />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Email Template</CardTitle>
                <CardDescription>Default invitation template for this campaign</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea {...register('emailTemplate')} rows={8} className="font-mono text-sm" disabled={saving} />
              </CardContent>
            </Card>
          </div>
          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle>Save Changes</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Button type="submit" className="w-full" disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save Changes
                </Button>
                <Button type="button" variant="outline" className="w-full" onClick={() => router.back()}>Cancel</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
