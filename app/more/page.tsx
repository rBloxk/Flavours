"use client"

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/components/providers/auth-provider'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  HelpCircle, 
  BookOpen, 
  MessageSquare, 
  Shield, 
  Settings, 
  LogOut,
  Crown,
  Users,
  Globe,
  Smartphone
} from 'lucide-react'

export default function MorePage() {
  const { signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = () => {
    signOut()
    router.push('/flavours-feeds')
  }
  const quickActions = [
    {
      title: 'Help Center',
      description: 'Get help and support',
      icon: HelpCircle,
      href: '/help'
    },
    {
      title: 'Documentation',
      description: 'Learn how to use Flavours',
      icon: BookOpen,
      href: '/documentation'
    },
    {
      title: 'Contact Support',
      description: 'Reach out to our team',
      icon: MessageSquare,
      href: '/support'
    },
    {
      title: 'Privacy Policy',
      description: 'Read our privacy policy',
      icon: Shield,
      href: '/privacy'
    }
  ]

  const accountActions = [
    {
      title: 'Account Settings',
      description: 'Manage your account preferences',
      icon: Settings,
      href: '/settings'
    },
    {
      title: 'Creator Tools',
      description: 'Access creator-specific features',
      icon: Crown,
      href: '/creator-tools'
    },
    {
      title: 'Community Guidelines',
      description: 'Read our community rules',
      icon: Users,
      href: '/guidelines'
    },
    {
      title: 'Terms of Service',
      description: 'Read our terms and conditions',
      icon: Globe,
      href: '/terms'
    }
  ]

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">More</h1>
        <p className="text-muted-foreground">Additional features and settings</p>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and helpful resources</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon
              return (
                <Button
                  key={index}
                  variant="outline"
                  className="h-20 flex-col space-y-2"
                  asChild
                >
                  <Link href={action.href} prefetch={true}>
                    <Icon className="h-6 w-6" />
                    <div className="text-center">
                      <div className="font-medium">{action.title}</div>
                      <div className="text-xs text-muted-foreground">{action.description}</div>
                    </div>
                  </Link>
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Account & Settings</CardTitle>
          <CardDescription>Manage your account and preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {accountActions.map((action, index) => {
              const Icon = action.icon
              return (
                <Button
                  key={index}
                  variant="outline"
                  className="h-20 flex-col space-y-2"
                  asChild
                >
                  <Link href={action.href} prefetch={true}>
                    <Icon className="h-6 w-6" />
                    <div className="text-center">
                      <div className="font-medium">{action.title}</div>
                      <div className="text-xs text-muted-foreground">{action.description}</div>
                    </div>
                  </Link>
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* App Information */}
      <Card>
        <CardHeader>
          <CardTitle>App Information</CardTitle>
          <CardDescription>About Flavours and version details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary rounded-lg">
                <Smartphone className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-medium">Flavours Platform</h3>
                <p className="text-sm text-muted-foreground">Version 1.0.0</p>
              </div>
            </div>
            <Badge variant="secondary">Latest</Badge>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Flavours is a creator monetization platform that helps content creators 
              connect with their audience and monetize their content through subscriptions, 
              tips, and premium content.
            </p>
            <div className="flex space-x-4 text-sm text-muted-foreground">
              <span>© 2025 Flavours</span>
              <span>•</span>
              <span>All rights reserved</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
          <CardDescription>Irreversible actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Sign Out</h3>
              <p className="text-sm text-muted-foreground">Sign out of your account</p>
            </div>
            <Button variant="destructive" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
