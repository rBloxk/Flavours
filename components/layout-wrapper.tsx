"use client"

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/auth-provider'
import { usePathname } from 'next/navigation'
import { Navigation } from '@/components/ui/navigation'
import { Sidebar } from '@/components/ui/sidebar'
import { MobileBottomNavigation } from '@/components/ui/mobile-bottom-navigation'
import { MobileSidebar } from '@/components/ui/mobile-sidebar'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'

interface LayoutWrapperProps {
  children: React.ReactNode
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const { user } = useAuth()
  const pathname = usePathname()
  const [isMobile, setIsMobile] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  // Pages that should not have sidebar/navigation
  const publicPages = ['/', '/auth']
  const isPublicPage = publicPages.includes(pathname)

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024) // lg breakpoint
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Close mobile sidebar when route changes
  useEffect(() => {
    setIsMobileSidebarOpen(false)
  }, [pathname])

  // If user is not authenticated or on a public page, render without sidebar
  if (!user || isPublicPage) {
    return <main className="min-h-screen">{children}</main>
  }

  // Mobile layout
  if (isMobile) {
    return (
      <div className="h-screen flex flex-col">
        {/* Mobile Header */}
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
          <div className="flex items-center justify-between px-3 py-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-1"
            >
              <Menu className="h-4 w-4" />
            </Button>
            <h1 className="text-base font-bold">Flavours</h1>
            <div className="w-8" /> {/* Spacer for centering */}
          </div>
        </div>

        {/* Mobile Sidebar Overlay */}
        <MobileSidebar 
          isOpen={isMobileSidebarOpen} 
          onClose={() => setIsMobileSidebarOpen(false)} 
        />

        {/* Main Content */}
        <main className="flex-1 pb-20 overflow-y-auto">
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNavigation />
      </div>
    )
  }

  // Desktop layout
  return (
    <>
      <Sidebar />
      <div className="ml-64 flex flex-col h-screen">
        <Navigation />
        <main className="flex-1">{children}</main>
      </div>
    </>
  )
}


