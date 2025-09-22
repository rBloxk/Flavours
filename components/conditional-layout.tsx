"use client"

import { usePathname } from 'next/navigation'
import { useAuth } from '@/components/providers/auth-provider'
import { LayoutWrapper } from '@/components/layout-wrapper'

interface ConditionalLayoutProps {
  children: React.ReactNode
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname()
  const { user, isLoading } = useAuth()

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

  // Check if current page should show the full layout
  const shouldShowFullLayout = authenticatedPages.some(page => 
    pathname.startsWith(page)
  ) || (user && pathname !== '/auth')

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
