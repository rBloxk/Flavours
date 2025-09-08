"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'

// Simplified types without Supabase dependency
interface User {
  id: string
  email: string
  user_metadata?: {
    username?: string
    display_name?: string
    is_creator?: boolean
  }
}

interface UserProfile {
  id: string
  user_id: string
  username: string
  display_name: string
  avatar_url?: string
  bio?: string
  is_creator: boolean
  is_verified: boolean
  created_at: string
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signOut: () => Promise<void>
  refreshAuth: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true) // Start with true to show loading

  useEffect(() => {
    // Check if we're on the client side
    if (typeof window !== 'undefined') {
      // Check for authentication in localStorage (for demo purposes)
      const isAuthenticated = localStorage.getItem('isAuthenticated')
      const demoUserStr = localStorage.getItem('demoUser')
      
      console.log('AuthProvider: Checking authentication...', { isAuthenticated, demoUserStr })
      
      if (isAuthenticated === 'true' && demoUserStr) {
        try {
          const demoUser = JSON.parse(demoUserStr)
          console.log('AuthProvider: Setting authenticated user:', demoUser)
          
          // Create a mock user object
          const mockUser: User = {
            id: demoUser.id,
            email: demoUser.email,
            user_metadata: {
              username: demoUser.username,
              display_name: demoUser.display_name,
              is_creator: demoUser.is_creator
            }
          }
          
          setUser(mockUser)
          setProfile({
            id: demoUser.id,
            user_id: demoUser.id,
            username: demoUser.username,
            display_name: demoUser.display_name,
            avatar_url: demoUser.avatar_url,
            bio: 'Demo user bio',
            is_creator: demoUser.is_creator,
            is_verified: false,
            created_at: demoUser.created_at
          })
        } catch (error) {
          console.error('Demo user parsing error:', error)
        }
      } else {
        console.log('AuthProvider: No authentication found')
      }
    }
    
    // Always set loading to false after checking
    setLoading(false)
  }, [])

  const handleSignOut = async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isAuthenticated')
      localStorage.removeItem('demoUser')
      setUser(null)
      setProfile(null)
      // Redirect to home page
      window.location.href = '/'
    }
  }

  const refreshAuth = () => {
    // Re-check authentication state
    if (typeof window !== 'undefined') {
      const isAuthenticated = localStorage.getItem('isAuthenticated')
      const demoUserStr = localStorage.getItem('demoUser')
      
      if (isAuthenticated === 'true' && demoUserStr) {
        try {
          const demoUser = JSON.parse(demoUserStr)
          
          const mockUser: User = {
            id: demoUser.id,
            email: demoUser.email,
            user_metadata: {
              username: demoUser.username,
              display_name: demoUser.display_name,
              is_creator: demoUser.is_creator
            }
          }
          
          setUser(mockUser)
          setProfile({
            id: demoUser.id,
            user_id: demoUser.id,
            username: demoUser.username,
            display_name: demoUser.display_name,
            avatar_url: demoUser.avatar_url,
            bio: 'Demo user bio',
            is_creator: demoUser.is_creator,
            is_verified: false,
            created_at: demoUser.created_at
          })
        } catch (error) {
          console.error('Demo user parsing error:', error)
        }
      } else {
        setUser(null)
        setProfile(null)
      }
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      signOut: handleSignOut,
      refreshAuth
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}