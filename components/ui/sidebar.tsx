"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/components/providers/auth-provider'
import { CreatePostModal } from '@/components/feed/create-post-modal'
import { FlavoursLogo } from './flavours-logo'
import { 
  Home, 
  Bell, 
  MessageCircle, 
  Star, 
  Image, 
  Calendar, 
  BarChart3, 
  TrendingUp, 
  User, 
  MoreHorizontal,
  Plus,
  Crown,
  Shield,
  Sparkles,
  HardDrive,
  Users,
  Video,
  MessageSquare,
  Zap,
  Play,
  Heart
} from 'lucide-react'

export function Sidebar() {
  const pathname = usePathname()
  const { user, profile } = useAuth()

  const isActive = (path: string) => pathname === path

  if (!user || !profile) return null

  const menuItems = [
   
    {
      id: 'feeds',
      label: 'Feeds',
      icon: Zap,
      href: '/feed',
      badge: null
    },
    {
      id: 'tube',
      label: 'Tube',
      icon: Play,
      href: '/tube',
      badge: null
    },
    {
      id: 'licks',
      label: 'Licks',
      icon: Star,
      href: '/licks',
      badge: null
    },
    {
      id: 'flavourstalk',
      label: 'FlavoursTalk',
      icon: MessageSquare,
      href: '/flavourstalk',
      badge: null
    },
    {
      id: 'dating',
      label: 'Dating',
      icon: Heart,
      href: '/dating',
      badge: null
    },
    {
      id: 'explore',
      label: 'Explore',
      icon: Sparkles,
      href: '/explore',
      badge: null
    },
   
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      href: '/notifications',
      badge: null
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: MessageCircle,
      href: '/messages',
      badge: 2 // Mock unread count
    },
    {
      id: 'cams',
      label: 'Cams',
      icon: Video,
      href: '/cams',
      badge: null
    },
    {
      id: 'collections',
      label: 'Collections',
      icon: Star,
      href: '/collections',
      badge: null
    },
    {
      id: 'vault',
      label: 'Vault',
      icon: Image,
      href: '/vault',
      badge: null
    },
    {
      id: 'queue',
      label: 'Queue',
      icon: Calendar,
      href: '/queue',
      badge: null
    },
    {
      id: 'statements',
      label: 'Statements',
      icon: BarChart3,
      href: '/statements',
      badge: null
    },
    {
      id: 'statistics',
      label: 'Statistics',
      icon: TrendingUp,
      href: '/statistics',
      badge: null
    },
    {
      id: 'storage',
      label: 'Storage',
      icon: HardDrive,
      href: '/storage',
      badge: null
    },
    {
      id: 'profile',
      label: 'My Profile',
      icon: User,
      href: '/profile',
      badge: null
    },
    {
      id: 'more',
      label: 'More',
      icon: MoreHorizontal,
      href: '/more',
      badge: null
    }
  ]

  return (
    <div className="w-64 bg-background border-r h-screen fixed left-0 top-0 z-40 flex flex-col">
      {/* Logo Section */}
      <div className="p-6">
        <Link href="/feed" className="flex items-center space-x-2" prefetch={true}>
          <FlavoursLogo size="md" />
        </Link>
      </div>

      {/* User Profile Section */}
      {/* <div className="px-6 pb-4">
        <div className="flex items-center space-x-3 p-3 rounded-full hover:bg-muted/50 transition-colors cursor-pointer">
          <Avatar className="h-10 w-10">
            <AvatarImage src={profile.avatar_url} alt={profile.display_name} />
            <AvatarFallback className="text-sm">
              {profile.display_name?.charAt(0) || user.email?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-1">
              <p className="font-semibold text-sm truncate">{profile.display_name}</p>
              {profile.is_verified && (
                <Shield className="h-3 w-3 text-blue-600 flex-shrink-0" />
              )}
              {profile.is_creator && (
                <Crown className="h-3 w-3 text-purple-600 flex-shrink-0" />
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">@{profile.username}</p>
          </div>
        </div>
      </div> */}

      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto">
        <nav className="space-y-1 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <Link key={item.id} href={item.href} prefetch={true}>
                <div
                  className={`flex items-center space-x-4 px-3 py-3 rounded-full transition-colors cursor-pointer ${
                    isActive(item.href) 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-muted/50'
                  }`}
                >
                  <Icon className="h-6 w-6" />
                  <span className="text-lg font-medium">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-xs font-semibold">
                      {item.badge}
                    </span>
                  )}
                </div>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* New Post Button */}
      <div className="p-6">
        <CreatePostModal>
          <Button className="w-full h-12 bg-primary hover:bg-primary/90 rounded-full font-semibold">
            <Plus className="h-5 w-5 mr-2" />
            Post
          </Button>
        </CreatePostModal>
      </div>
    </div>
  )
}
