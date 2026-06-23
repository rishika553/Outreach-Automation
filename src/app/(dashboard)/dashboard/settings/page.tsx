'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'
import { Loader2, User, Bell, Shield, Mail } from 'lucide-react'

export default function SettingsPage() {
  const { toast } = useToast()
  const supabase = createClient()
  const [user, setUser] = useState<{ email: string; name?: string } | null>(null)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then((res: any) => {
      const user = res.data?.user
      if (user) {
        setUser({ email: user.email || '', name: user.user_metadata?.name })
        setName(user.user_metadata?.name || '')
      }
    })
  }, [supabase])

  const handleUpdateProfile = async () => {
    setSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({ data: { name } })
      if (error) throw error

      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supabaseId: '', email: user?.email, name }),
      })

      toast({ title: 'Profile updated' })
    } catch {
      toast({ title: 'Failed to update profile', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async (currentPwd: string, newPwd: string) => {
    setSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPwd })
      if (error) throw error
      toast({ title: 'Password updated' })
    } catch (err: any) {
      toast({ title: 'Failed to change password', description: err.message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const initials = name
    ? name.split(' ').map(n => n[0]).join('').toUpperCase()
    : user?.email?.[0]?.toUpperCase() || 'U'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile"><User className="mr-2 h-4 w-4" />Profile</TabsTrigger>
          <TabsTrigger value="security"><Shield className="mr-2 h-4 w-4" />Security</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="mr-2 h-4 w-4" />Notifications</TabsTrigger>
          <TabsTrigger value="integrations"><Mail className="mr-2 h-4 w-4" />Integrations</TabsTrigger>
        </TabsList>

        {/* Profile */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="text-xl">{initials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{name || user?.email}</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              <Separator />
              <div className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={user?.email || ''} disabled />
                  <p className="text-xs text-muted-foreground">Email cannot be changed here.</p>
                </div>
                <Button onClick={handleUpdateProfile} disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>Change your account password</CardDescription>
            </CardHeader>
            <CardContent>
              <PasswordForm onSubmit={handlePasswordChange} saving={saving} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose what you get notified about</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { label: 'New reply received', description: 'Get notified when a lead replies to your email' },
                { label: 'Positive reply', description: 'Alert when a lead shows interest' },
                { label: 'Follow-up sent', description: 'Confirmation when a follow-up is sent automatically' },
                { label: 'Campaign completed', description: 'Notify when all leads in a campaign have been contacted' },
                { label: 'Weekly digest', description: 'Weekly performance summary email' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations">
          <div className="space-y-4">
            {[
              { name: 'Resend', desc: 'Email delivery service', status: 'Connected', color: 'text-green-600' },
              { name: 'Google Gemini', desc: 'AI email generation and research', status: 'Connected', color: 'text-green-600' },
              { name: 'Groq', desc: 'AI fallback provider', status: 'Connected', color: 'text-green-600' },
              { name: 'Supabase', desc: 'Authentication and database', status: 'Connected', color: 'text-green-600' },
            ].map(integration => (
              <Card key={integration.name}>
                <CardContent className="flex items-center justify-between py-4">
                  <div>
                    <p className="font-medium">{integration.name}</p>
                    <p className="text-sm text-muted-foreground">{integration.desc}</p>
                  </div>
                  <span className={`text-sm font-medium ${integration.color}`}>{integration.status}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function PasswordForm({ onSubmit, saving }: { onSubmit: (current: string, next: string) => void; saving: boolean }) {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')

  return (
    <div className="space-y-4 max-w-md">
      <div className="space-y-2">
        <Label>Current Password</Label>
        <Input type="password" value={current} onChange={e => setCurrent(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>New Password</Label>
        <Input type="password" value={next} onChange={e => setNext(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Confirm New Password</Label>
        <Input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} />
      </div>
      <Button
        onClick={() => {
          if (next !== confirm) { alert("Passwords don't match"); return }
          onSubmit(current, next)
        }}
        disabled={saving || !current || !next}
      >
        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Update Password
      </Button>
    </div>
  )
}
