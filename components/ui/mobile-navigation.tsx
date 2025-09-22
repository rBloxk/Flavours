'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from './button'
import { Badge } from './badge'
import { Avatar, AvatarFallback, AvatarImage } from './avatar'
import { Sheet, SheetContent, SheetTrigger } from './sheet'
import { usePWA } from '@/lib/pwa-service'
import { mobileUtils } from '@/lib/pwa-service'
import { 
  Menu, 
  Home, 
  Search, 
  Heart, 
  MessageSquare, 
  User, 
  Settings,
  Download,
  Share,
  Bell,
  Camera,
  Video,
  Mic,
  MoreHorizontal,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface MobileNavigationProps {
  className?: string
}

export function MobileNavigation({ className }: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isBottomNavVisible, setIsBottomNavVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const pathname = usePathname()
  const { appInfo, isOnline, installApp, shareContent } = usePWA()
  const [deviceInfo, setDeviceInfo] = useState<any>(null)

  useEffect(() => {
    setDeviceInfo(mobileUtils.getDeviceInfo())
  }, [])

  // Handle scroll to show/hide bottom navigation
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down
        setIsBottomNavVisible(false)
      } else {
        // Scrolling up
        setIsBottomNavVisible(true)
      }
      
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  const navigationItems = [
    { href: '/feed', icon: Home, label: 'Home' },
    { href: '/explore', icon: Search, label: 'Explore' },
    { href: '/favorites', icon: Heart, label: 'Favorites' },
    { href: '/messages', icon: MessageSquare, label: 'Messages' },
    { href: '/profile', icon: User, label: 'Profile' }
  ]

  const quickActions = [
    { icon: Camera, label: 'Camera', action: () => console.log('Open camera') },
    { icon: Video, label: 'Record', action: () => console.log('Start recording') },
    { icon: Mic, label: 'Voice', action: () => console.log('Voice note') },
    { icon: Share, label: 'Share', action: () => shareContent({ title: 'Flavours', url: window.location.href }) }
  ]

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Flavours',
          text: 'Check out this amazing content on Flavours!',
          url: window.location.href
        })
      } catch (error) {
        console.error('Share failed:', error)
      }
    }
  }

  return (
    <>
      {/* Top Navigation Bar */}
      <div className={cn(
        "fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700",
        className
      )}>
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left - Menu Button */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <MobileSidebar onClose={() => setIsOpen(false)} />
            </SheetContent>
          </Sheet>

          {/* Center - Logo */}
          <div className="flex-1 flex justify-center">
            <Link href="/feed" className="font-bold text-lg">
              Flavours
            </Link>
          </div>

          {/* Right - Actions */}
          <div className="flex items-center space-x-2">
            {/* Online Status */}
            {!isOnline && (
              <div className="w-2 h-2 bg-red-500 rounded-full" />
            )}
            
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-xs"
              >
                3
              </Badge>
            </Button>

            {/* Install App */}
            {appInfo?.canInstall && (
              <Button variant="ghost" size="sm" onClick={installApp}>
                <Download className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className={cn(
        "fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 transition-transform duration-300",
        isBottomNavVisible ? "translate-y-0" : "translate-y-full"
      )}>
        <div className="flex items-center justify-around px-2 py-2">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors",
                  isActive 
                    ? "text-blue-600 dark:text-blue-400" 
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{item.label}</span>
                {isActive && (
                  <div className="w-1 h-1 bg-blue-600 dark:bg-blue-400 rounded-full" />
                )}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Quick Actions Floating Button */}
      <div className="fixed bottom-20 right-4 z-40">
        <Button
          size="lg"
          className="rounded-full shadow-lg"
          onClick={() => {
            // Toggle quick actions menu
            const menu = document.getElementById('quick-actions-menu')
            if (menu) {
              menu.classList.toggle('hidden')
            }
          }}
        >
          <MoreHorizontal className="h-6 w-6" />
        </Button>
        
        {/* Quick Actions Menu */}
        <div 
          id="quick-actions-menu"
          className="hidden absolute bottom-16 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 space-y-2 min-w-48"
        >
          {quickActions.map((action, index) => {
            const Icon = action.icon
            return (
              <Button
                key={index}
                variant="ghost"
                className="w-full justify-start"
                onClick={action.action}
              >
                <Icon className="h-4 w-4 mr-3" />
                {action.label}
              </Button>
            )
          })}
        </div>
      </div>

      {/* Safe Area Spacers */}
      <div className="h-16" /> {/* Top spacer */}
      <div className="h-20" /> {/* Bottom spacer */}
    </>
  )
}

// Mobile Sidebar Component
function MobileSidebar({ onClose }: { onClose: () => void }) {
  const pathname = usePathname()
  
  const menuSections = [
    {
      title: 'Main',
      items: [
        { href: '/feed', icon: Home, label: 'Home' },
        { href: '/explore', icon: Search, label: 'Explore' },
        { href: '/collections', icon: Heart, label: 'Collections' },
        { href: '/messages', icon: MessageSquare, label: 'Messages' }
      ]
    },
    {
      title: 'Creator Tools',
      items: [
        { href: '/creator/dashboard', icon: User, label: 'Creator Dashboard' },
        { href: '/creator-tools', icon: Video, label: 'Creator Tools' },
        { href: '/cams', icon: Camera, label: 'Live Streaming' }
      ]
    },
    {
      title: 'Account',
      items: [
        { href: '/profile', icon: User, label: 'Profile' },
        { href: '/settings', icon: Settings, label: 'Settings' },
        { href: '/notifications', icon: Bell, label: 'Notifications' }
      ]
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Menu</h2>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* User Profile */}
      <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <Avatar className="h-10 w-10">
          <AvatarImage src="/placeholder-avatar.jpg" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">John Doe</p>
          <p className="text-sm text-muted-foreground">@johndoe</p>
        </div>
      </div>

      {/* Menu Sections */}
      {menuSections.map((section, sectionIndex) => (
        <div key={sectionIndex}>
          <h3 className="text-sm font-medium text-muted-foreground mb-2 px-3">
            {section.title}
          </h3>
          <div className="space-y-1">
            {section.items.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
                    isActive 
                      ? "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400" 
                      : "hover:bg-gray-50 dark:hover:bg-gray-800"
                  )}
                  onClick={onClose}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      ))}

      {/* App Info */}
      <div className="border-t pt-4">
        <div className="text-xs text-muted-foreground space-y-1 px-3">
          <p>Flavours v1.0.0</p>
          <p>Progressive Web App</p>
        </div>
      </div>
    </div>
  )
}

// Mobile-Optimized Header
export function MobileHeader({ title, showBack = false, onBack }: {
  title: string
  showBack?: boolean
  onBack?: () => void
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-3">
        {showBack && (
          <Button variant="ghost" size="sm" onClick={onBack}>
            ←
          </Button>
        )}
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm">
          <Share className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

// Touch-Optimized Button
export function TouchButton({ 
  children, 
  className, 
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <Button
      className={cn(
        "min-h-[44px] min-w-[44px] touch-manipulation", // iOS recommended touch target size
        className
      )}
      {...props}
    >
      {children}
    </Button>
  )
}

// Mobile-Optimized Card
export function MobileCard({ 
  children, 
  className, 
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4",
        "touch-manipulation", // Optimize for touch
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

