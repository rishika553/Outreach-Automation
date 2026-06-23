'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { campaignSchema, CampaignInput } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, Loader2 } from 'lucide-react'

export default function NewCampaignPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CampaignInput>({
    resolver: zodResolver(campaignSchema),
  })

  const onSubmit = async (data: CampaignInput) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error('Failed to create campaign')

      toast({
        title: 'Campaign created',
        description: 'Your campaign has been created successfully.',
      })
      router.push('/dashboard/campaigns')
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to create campaign. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Podcast Campaign</h1>
          <p className="text-muted-foreground">
            Create a new podcast guest outreach campaign
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Podcast Details</CardTitle>
                <CardDescription>
                  Information about the podcast you&apos;re sourcing guests for
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Campaign Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Q1 Guest Outreach"
                    {...register('name')}
                    disabled={isLoading}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetIndustry">Podcast Name</Label>
                  <Input
                    id="targetIndustry"
                    placeholder="e.g., The Founder's Journey Podcast"
                    {...register('targetIndustry')}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="outreachGoal">Podcast Topic</Label>
                  <Textarea
                    id="outreachGoal"
                    placeholder="What is the podcast topic / theme for this campaign?"
                    {...register('outreachGoal')}
                    disabled={isLoading}
                    rows={3}
                  />
                  {errors.outreachGoal && (
                    <p className="text-sm text-destructive">{errors.outreachGoal.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="offer">Podcast Description</Label>
                  <Textarea
                    id="offer"
                    placeholder="Describe the podcast — format, audience, what guests can expect"
                    {...register('offer')}
                    disabled={isLoading}
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Email Template</CardTitle>
                <CardDescription>
                  Default outreach template for this campaign (optional)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  id="emailTemplate"
                  placeholder="Write a default invitation template for this campaign..."
                  {...register('emailTemplate')}
                  disabled={isLoading}
                  rows={8}
                  className="font-mono text-sm"
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Save Campaign</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Your campaign will be saved as a draft. You can add guests and start sending invitations once it&apos;s ready.
                </p>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Campaign
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => router.back()}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Give your campaign a descriptive name</li>
                  <li>• Define a clear podcast topic</li>
                  <li>• A compelling description attracts better guests</li>
                  <li>• You can always edit this later</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
