'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './auth-provider'
import { Loader2 } from 'lucide-react'

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: 'admin' | 'moderator' | 'viewer'
}

export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
      return
    }

    if (user && requiredRole) {
      const roleHierarchy = { viewer: 1, moderator: 2, admin: 3 }
      const userLevel = roleHierarchy[user.role]
      const requiredLevel = roleHierarchy[requiredRole]

      if (userLevel < requiredLevel) {
        router.push('/unauthorized')
        return
      }
    }
  }, [user, loading, requiredRole, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (requiredRole) {
    const roleHierarchy = { viewer: 1, moderator: 2, admin: 3 }
    const userLevel = roleHierarchy[user.role]
    const requiredLevel = roleHierarchy[requiredRole]

    if (userLevel < requiredLevel) {
      return null
    }
  }

  return <>{children}</>
}
