"use client"

import { usePathname } from 'next/navigation'
import { useAuth } from '@/components/providers/auth-provider'
import { LayoutWrapper } from '@/components/layout-wrapper'

interface ConditionalLayoutProps {
  children: React.ReactNode
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname()
  const { user, loading } = useAuth()

  // Pages that should show the full layout with navigation and sidebar
  const authenticatedPages = [
    '/feed',
    '/explore',
    '/collections',
    '/messages',
    '/favorites',
    '/more',
    '/creator',
    '/admin',
    '/settings',
    '/profile',
    '/statistics',
    '/storage',
    '/queue',
    '/vault',
    '/support',
    '/help',
    '/guidelines',
    '/documentation',
    '/creator-tools',
    '/statements',
    '/notifications'
  ]

  // Show loading state while authentication is being checked
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  // Check if current page should show the full layout
  const shouldShowFullLayout = authenticatedPages.some(page => 
    pathname.startsWith(page)
  ) || (user && pathname !== '/auth' && !pathname.startsWith('/resources'))

  // Show full layout for authenticated pages
  if (shouldShowFullLayout) {
    return (
      <div className="min-h-screen bg-background">
        <LayoutWrapper>{children}</LayoutWrapper>
      </div>
    )
  }

  // Show minimal layout for landing page and auth page
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  )
}
