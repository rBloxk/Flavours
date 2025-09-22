"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Shield, Eye, EyeOff, Users, Lock, Globe } from 'lucide-react'

interface PrivacySettings {
  show_age: boolean
  show_location: boolean
  show_education: boolean
  show_occupation: boolean
  show_sexual_info: boolean
  show_vices: boolean
  show_photos: boolean
  profile_visibility: 'public' | 'friends' | 'verified' | 'private'
  allow_messages: 'everyone' | 'matches' | 'friends' | 'none'
  show_online_status: boolean
  show_last_seen: boolean
  allow_location_sharing: boolean
}

interface DatingPrivacySettingsProps {
  initialSettings?: Partial<PrivacySettings>
  onSave: (settings: PrivacySettings) => void
  onCancel: () => void
}

export function DatingPrivacySettings({ initialSettings, onSave, onCancel }: DatingPrivacySettingsProps) {
  const [settings, setSettings] = useState<PrivacySettings>({
    show_age: true,
    show_location: true,
    show_education: true,
    show_occupation: true,
    show_sexual_info: false,
    show_vices: false,
    show_photos: true,
    profile_visibility: 'public',
    allow_messages: 'everyone',
    show_online_status: true,
    show_last_seen: true,
    allow_location_sharing: false,
    ...initialSettings
  })

  const handleToggle = (key: keyof PrivacySettings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSelectChange = (key: keyof PrivacySettings, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = () => {
    onSave(settings)
  }

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'public': return <Globe className="h-4 w-4" />
      case 'friends': return <Users className="h-4 w-4" />
      case 'verified': return <Shield className="h-4 w-4" />
      case 'private': return <Lock className="h-4 w-4" />
      default: return <Globe className="h-4 w-4" />
    }
  }

  const getVisibilityDescription = (visibility: string) => {
    switch (visibility) {
      case 'public': return 'Anyone can see your profile'
      case 'friends': return 'Only your friends can see your profile'
      case 'verified': return 'Only verified users can see your profile'
      case 'private': return 'Only you can see your profile'
      default: return 'Anyone can see your profile'
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Visibility */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="h-5 w-5" />
            <span>Profile Visibility</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-base font-medium">Who can see your dating profile?</Label>
            <Select 
              value={settings.profile_visibility} 
              onValueChange={(value) => handleSelectChange('profile_visibility', value)}
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4" />
                    <span>Public - Anyone can see your profile</span>
                  </div>
                </SelectItem>
                <SelectItem value="friends">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>Friends - Only your friends can see your profile</span>
                  </div>
                </SelectItem>
                <SelectItem value="verified">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4" />
                    <span>Verified - Only verified users can see your profile</span>
                  </div>
                </SelectItem>
                <SelectItem value="private">
                  <div className="flex items-center space-x-2">
                    <Lock className="h-4 w-4" />
                    <span>Private - Only you can see your profile</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground mt-1">
              {getVisibilityDescription(settings.profile_visibility)}
            </p>
          </div>

          <div>
            <Label className="text-base font-medium">Who can message you?</Label>
            <Select 
              value={settings.allow_messages} 
              onValueChange={(value) => handleSelectChange('allow_messages', value)}
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="everyone">Everyone</SelectItem>
                <SelectItem value="matches">Only matches</SelectItem>
                <SelectItem value="friends">Only friends</SelectItem>
                <SelectItem value="none">No one</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Information Visibility */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <EyeOff className="h-5 w-5" />
            <span>Information Visibility</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Show Age</Label>
                <p className="text-sm text-muted-foreground">Display your age on your profile</p>
              </div>
              <Switch
                checked={settings.show_age}
                onCheckedChange={() => handleToggle('show_age')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Show Location</Label>
                <p className="text-sm text-muted-foreground">Display your current location</p>
              </div>
              <Switch
                checked={settings.show_location}
                onCheckedChange={() => handleToggle('show_location')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Show Education</Label>
                <p className="text-sm text-muted-foreground">Display your education information</p>
              </div>
              <Switch
                checked={settings.show_education}
                onCheckedChange={() => handleToggle('show_education')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Show Occupation</Label>
                <p className="text-sm text-muted-foreground">Display your job and workplace</p>
              </div>
              <Switch
                checked={settings.show_occupation}
                onCheckedChange={() => handleToggle('show_occupation')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Show Photos</Label>
                <p className="text-sm text-muted-foreground">Display your profile photos</p>
              </div>
              <Switch
                checked={settings.show_photos}
                onCheckedChange={() => handleToggle('show_photos')}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sensitive Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Sensitive Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Show Sexual Information</Label>
                <p className="text-sm text-muted-foreground">Display sexual preferences and experiences</p>
              </div>
              <Switch
                checked={settings.show_sexual_info}
                onCheckedChange={() => handleToggle('show_sexual_info')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Show Vices</Label>
                <p className="text-sm text-muted-foreground">Display smoking, drinking, and drug habits</p>
              </div>
              <Switch
                checked={settings.show_vices}
                onCheckedChange={() => handleToggle('show_vices')}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Activity Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Show Online Status</Label>
                <p className="text-sm text-muted-foreground">Display when you're online</p>
              </div>
              <Switch
                checked={settings.show_online_status}
                onCheckedChange={() => handleToggle('show_online_status')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Show Last Seen</Label>
                <p className="text-sm text-muted-foreground">Display when you were last active</p>
              </div>
              <Switch
                checked={settings.show_last_seen}
                onCheckedChange={() => handleToggle('show_last_seen')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Allow Location Sharing</Label>
                <p className="text-sm text-muted-foreground">Share your location for distance matching</p>
              </div>
              <Switch
                checked={settings.allow_location_sharing}
                onCheckedChange={() => handleToggle('allow_location_sharing')}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Privacy Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Profile Visibility:</span>
              <Badge variant="outline" className="flex items-center space-x-1">
                {getVisibilityIcon(settings.profile_visibility)}
                <span className="capitalize">{settings.profile_visibility}</span>
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Messages:</span>
              <Badge variant="outline" className="capitalize">
                {settings.allow_messages}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Visible Information:</span>
              <div className="flex flex-wrap gap-1">
                {settings.show_age && <Badge variant="secondary" className="text-xs">Age</Badge>}
                {settings.show_location && <Badge variant="secondary" className="text-xs">Location</Badge>}
                {settings.show_education && <Badge variant="secondary" className="text-xs">Education</Badge>}
                {settings.show_occupation && <Badge variant="secondary" className="text-xs">Occupation</Badge>}
                {settings.show_photos && <Badge variant="secondary" className="text-xs">Photos</Badge>}
                {settings.show_sexual_info && <Badge variant="secondary" className="text-xs">Sexual Info</Badge>}
                {settings.show_vices && <Badge variant="secondary" className="text-xs">Vices</Badge>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} className="bg-black dark:bg-white text-white dark:text-black">
          Save Privacy Settings
        </Button>
      </div>
    </div>
  )
}
