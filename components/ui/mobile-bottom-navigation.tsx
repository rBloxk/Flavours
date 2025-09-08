"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Home, 
  Sparkles, 
  Bell, 
  MessageCircle, 
  User,
  Plus
} from 'lucide-react'
import { CreatePostModal } from '@/components/feed/create-post-modal'

export function MobileBottomNavigation() {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

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
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      href: '/notifications',
      badge: 3 // Mock unread count
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: MessageCircle,
      href: '/messages',
      badge: 2 // Mock unread count
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      href: '/profile',
      badge: null
    }
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-t">
      <div className="flex items-center justify-around px-2 py-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              className={`relative flex-col h-10 w-10 p-0 ${
                isActive(item.href) 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              asChild
            >
              <Link href={item.href} prefetch={true}>
                <Icon className="h-4 w-4" />
                <span className="text-xs mt-0.5 leading-none">{item.label}</span>
                {item.badge && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-3 w-3 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {item.badge}
                  </Badge>
                )}
              </Link>
            </Button>
          )
        })}
        
        {/* Create Post Button */}
        <CreatePostModal>
          <Button 
            size="sm" 
            className="h-10 w-10 rounded-full bg-primary hover:bg-primary/90 p-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </CreatePostModal>
      </div>
    </div>
  )
}
