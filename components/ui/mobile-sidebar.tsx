"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/components/providers/auth-provider'
import { CreatePostModal } from '@/components/feed/create-post-modal'
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
  X,
  Settings,
  LogOut,
  Video,
  MessageSquare
} from 'lucide-react'

interface MobileSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const pathname = usePathname()
  const { user, profile, signOut } = useAuth()

  const isActive = (path: string) => pathname === path

  if (!user || !profile) return null

  const menuItems = [
    {
      id: 'feed',
      label: 'Home',
      icon: Home,
      href: '/feed',
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
      id: 'cams',
      label: 'Cams',
      icon: Video,
      href: '/cams',
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
      badge: 2
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

  const handleSignOut = () => {
    signOut()
    onClose()
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 z-50 h-full w-80 bg-background border-r transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b">
            <Link href="/feed" className="flex items-center space-x-2" onClick={onClose}>
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                <Crown className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Flavours
              </span>
            </Link>
            <Button variant="ghost" size="sm" onClick={onClose} className="p-1">
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* User Profile */}
          <div className="p-3 border-b">
            <div className="flex items-center space-x-2">
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
          </div>

          {/* Navigation Menu */}
          <div className="flex-1 overflow-y-auto">
            <nav className="space-y-1 p-2">
              {menuItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link key={item.id} href={item.href} prefetch={true} onClick={onClose}>
                    <div
                      className={`flex items-center space-x-2 px-2 py-2 rounded-lg transition-colors ${
                        isActive(item.href) 
                          ? 'bg-primary text-primary-foreground' 
                          : 'hover:bg-muted/50'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="font-medium text-sm">{item.label}</span>
                      {item.badge && (
                        <Badge variant="destructive" className="ml-auto h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Create Post Button */}
          <div className="p-3 border-t">
            <CreatePostModal>
              <Button className="w-full h-10 bg-primary hover:bg-primary/90 rounded-lg font-semibold text-sm">
                <Plus className="h-4 w-4 mr-2" />
                Create Post
              </Button>
            </CreatePostModal>
          </div>

          {/* Settings and Sign Out */}
          <div className="p-3 border-t space-y-1">
            <Button variant="ghost" className="w-full justify-start text-sm" asChild>
              <Link href="/settings" onClick={onClose}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Link>
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 text-sm" 
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
