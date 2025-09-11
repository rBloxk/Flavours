'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/admin-layout'
import { AuthGuard } from '@/components/auth-guard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Settings, 
  Save, 
  RefreshCw, 
  Shield, 
  Bell, 
  Globe,
  Database,
  Mail,
  Key,
  Users,
  FileText,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'

interface SettingsData {
  general: {
    siteName: string
    siteDescription: string
    siteUrl: string
    timezone: string
    language: string
  }
  security: {
    enableTwoFactor: boolean
    sessionTimeout: number
    maxLoginAttempts: number
    passwordMinLength: number
    requireEmailVerification: boolean
  }
  notifications: {
    emailNotifications: boolean
    pushNotifications: boolean
    smsNotifications: boolean
    adminAlerts: boolean
    userAlerts: boolean
  }
  content: {
    autoModeration: boolean
    contentReviewRequired: boolean
    maxFileSize: number
    allowedFileTypes: string[]
    contentRetentionDays: number
  }
  payments: {
    currency: string
    taxRate: number
    payoutThreshold: number
    payoutSchedule: string
    enableRefunds: boolean
  }
  api: {
    rateLimit: number
    enableApiKeys: boolean
    webhookUrl: string
    enableLogging: boolean
  }
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<string>('general')

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      // Mock data for demo
      const mockSettings: SettingsData = {
        general: {
          siteName: 'Flavours',
          siteDescription: 'Creator Monetization Platform',
          siteUrl: 'https://flavours.app',
          timezone: 'UTC',
          language: 'en'
        },
        security: {
          enableTwoFactor: true,
          sessionTimeout: 24,
          maxLoginAttempts: 5,
          passwordMinLength: 8,
          requireEmailVerification: true
        },
        notifications: {
          emailNotifications: true,
          pushNotifications: true,
          smsNotifications: false,
          adminAlerts: true,
          userAlerts: true
        },
        content: {
          autoModeration: true,
          contentReviewRequired: false,
          maxFileSize: 50,
          allowedFileTypes: ['jpg', 'png', 'mp4', 'pdf'],
          contentRetentionDays: 365
        },
        payments: {
          currency: 'USD',
          taxRate: 0.08,
          payoutThreshold: 50,
          payoutSchedule: 'weekly',
          enableRefunds: true
        },
        api: {
          rateLimit: 1000,
          enableApiKeys: true,
          webhookUrl: 'https://api.flavours.app/webhooks',
          enableLogging: true
        }
      }
      
      setSettings(mockSettings)
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      // Mock save operation
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Settings saved:', settings)
    } catch (error) {
      console.error('Failed to save settings:', error)
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = (section: keyof SettingsData, key: string, value: any) => {
    if (!settings) return
    
    setSettings(prev => ({
      ...prev!,
      [section]: {
        ...prev![section],
        [key]: value
      }
    }))
  }

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'content', label: 'Content', icon: FileText },
    { id: 'payments', label: 'Payments', icon: Database },
    { id: 'api', label: 'API', icon: Key }
  ]

  if (loading) {
    return (
      <AuthGuard requiredRole="admin">
        <AdminLayout>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </AdminLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard requiredRole="admin">
      <AdminLayout>
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Configure platform settings and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Settings Navigation */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-muted transition-colors ${
                        activeTab === tab.id ? 'bg-muted border-r-2 border-primary' : ''
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{tab.label}</span>
                    </button>
                  )
                })}
              </nav>
            </CardContent>
          </Card>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="capitalize">{activeTab} Settings</CardTitle>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchSettings}
                    disabled={loading}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={saving || !settings}
                    size="sm"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {activeTab === 'general' && settings && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="siteName">Site Name</Label>
                        <Input
                          id="siteName"
                          value={settings.general.siteName}
                          onChange={(e) => updateSetting('general', 'siteName', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="siteUrl">Site URL</Label>
                        <Input
                          id="siteUrl"
                          value={settings.general.siteUrl}
                          onChange={(e) => updateSetting('general', 'siteUrl', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="siteDescription">Site Description</Label>
                      <Input
                        id="siteDescription"
                        value={settings.general.siteDescription}
                        onChange={(e) => updateSetting('general', 'siteDescription', e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="timezone">Timezone</Label>
                        <Input
                          id="timezone"
                          value={settings.general.timezone}
                          onChange={(e) => updateSetting('general', 'timezone', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="language">Language</Label>
                        <Input
                          id="language"
                          value={settings.general.language}
                          onChange={(e) => updateSetting('general', 'language', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'security' && settings && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Two-Factor Authentication</Label>
                          <p className="text-sm text-muted-foreground">Require 2FA for admin accounts</p>
                        </div>
                        <Button
                          variant={settings.security.enableTwoFactor ? "default" : "outline"}
                          size="sm"
                          onClick={() => updateSetting('security', 'enableTwoFactor', !settings.security.enableTwoFactor)}
                        >
                          {settings.security.enableTwoFactor ? 'Enabled' : 'Disabled'}
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Email Verification</Label>
                          <p className="text-sm text-muted-foreground">Require email verification for new users</p>
                        </div>
                        <Button
                          variant={settings.security.requireEmailVerification ? "default" : "outline"}
                          size="sm"
                          onClick={() => updateSetting('security', 'requireEmailVerification', !settings.security.requireEmailVerification)}
                        >
                          {settings.security.requireEmailVerification ? 'Required' : 'Optional'}
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
                        <Input
                          id="sessionTimeout"
                          type="number"
                          value={settings.security.sessionTimeout}
                          onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                        <Input
                          id="maxLoginAttempts"
                          type="number"
                          value={settings.security.maxLoginAttempts}
                          onChange={(e) => updateSetting('security', 'maxLoginAttempts', parseInt(e.target.value))}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'notifications' && settings && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      {Object.entries(settings.notifications).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                          <div>
                            <Label className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</Label>
                            <p className="text-sm text-muted-foreground">
                              {key === 'emailNotifications' && 'Send email notifications to users'}
                              {key === 'pushNotifications' && 'Send push notifications to mobile devices'}
                              {key === 'smsNotifications' && 'Send SMS notifications'}
                              {key === 'adminAlerts' && 'Send alerts to administrators'}
                              {key === 'userAlerts' && 'Send alerts to users'}
                            </p>
                          </div>
                          <Button
                            variant={value ? "default" : "outline"}
                            size="sm"
                            onClick={() => updateSetting('notifications', key, !value)}
                          >
                            {value ? 'Enabled' : 'Disabled'}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'content' && settings && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Auto Moderation</Label>
                          <p className="text-sm text-muted-foreground">Automatically moderate content using AI</p>
                        </div>
                        <Button
                          variant={settings.content.autoModeration ? "default" : "outline"}
                          size="sm"
                          onClick={() => updateSetting('content', 'autoModeration', !settings.content.autoModeration)}
                        >
                          {settings.content.autoModeration ? 'Enabled' : 'Disabled'}
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Content Review Required</Label>
                          <p className="text-sm text-muted-foreground">Require manual review for all content</p>
                        </div>
                        <Button
                          variant={settings.content.contentReviewRequired ? "default" : "outline"}
                          size="sm"
                          onClick={() => updateSetting('content', 'contentReviewRequired', !settings.content.contentReviewRequired)}
                        >
                          {settings.content.contentReviewRequired ? 'Required' : 'Optional'}
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="maxFileSize">Max File Size (MB)</Label>
                        <Input
                          id="maxFileSize"
                          type="number"
                          value={settings.content.maxFileSize}
                          onChange={(e) => updateSetting('content', 'maxFileSize', parseInt(e.target.value))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contentRetentionDays">Content Retention (days)</Label>
                        <Input
                          id="contentRetentionDays"
                          type="number"
                          value={settings.content.contentRetentionDays}
                          onChange={(e) => updateSetting('content', 'contentRetentionDays', parseInt(e.target.value))}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Allowed File Types</Label>
                      <div className="flex flex-wrap gap-2">
                        {settings.content.allowedFileTypes.map((type, index) => (
                          <Badge key={index} variant="secondary">{type}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'payments' && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Payment settings coming soon...</p>
                  </div>
                )}

                {activeTab === 'api' && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">API settings coming soon...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </AdminLayout>
    </AuthGuard>
  )
}