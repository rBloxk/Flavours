"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { apiClient, User } from '@/lib/api-client'

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
  refreshAuth: () => Promise<void>
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (userData: any) => Promise<{ success: boolean; error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('AuthProvider: Starting initialization...')
    
    // Add a timeout to ensure loading state is cleared
    const timeout = setTimeout(() => {
      console.log('AuthProvider: Timeout reached, forcing loading to false')
      setLoading(false)
    }, 1000)
    
    // Check authentication state from localStorage
    if (typeof window !== 'undefined') {
      const isAuthenticated = localStorage.getItem('isAuthenticated')
      const demoUserStr = localStorage.getItem('demoUser')
      
      if (isAuthenticated === 'true' && demoUserStr) {
        try {
          const demoUser = JSON.parse(demoUserStr)
          
          const demoUserProfile: UserProfile = {
            id: demoUser.id || 'demo-user-id',
            user_id: demoUser.id || 'demo-user-id',
            username: demoUser.username || 'demo-user',
            display_name: demoUser.display_name || 'Demo User',
            avatar_url: demoUser.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400',
            bio: demoUser.bio || 'Welcome to Flavours! This is a demo creator profile.',
            is_creator: demoUser.is_creator || true,
            is_verified: demoUser.is_verified || false,
            created_at: demoUser.created_at || new Date().toISOString()
          }
          
          const authUser: User = {
            id: demoUser.id || 'demo-user-id',
            email: demoUser.email || 'demo@flavours.com',
            username: demoUser.username || 'demo-user',
            display_name: demoUser.display_name || 'Demo User',
            is_creator: demoUser.is_creator || true,
            is_verified: demoUser.is_verified || false,
            avatar_url: demoUserProfile.avatar_url,
            bio: demoUserProfile.bio,
            followers_count: demoUser.followers_count || 0,
            following_count: demoUser.following_count || 0,
            posts_count: demoUser.posts_count || 0,
            created_at: demoUser.created_at || new Date().toISOString(),
            updated_at: demoUser.updated_at || new Date().toISOString()
          }
          
          setUser(authUser)
          setProfile(demoUserProfile)
          console.log('AuthProvider: User authenticated from localStorage')
        } catch (error) {
          console.error('AuthProvider: Error parsing stored user:', error)
          setUser(null)
          setProfile(null)
        }
      } else {
        setUser(null)
        setProfile(null)
        console.log('AuthProvider: No authenticated user found')
      }
    }
    
    setLoading(false)
    clearTimeout(timeout)
    console.log('AuthProvider: Initialization complete')
  }, [])

  const handleSignOut = async () => {
    try {
      await apiClient.logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
    
    // Clear authentication state
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isAuthenticated')
      localStorage.removeItem('demoUser')
    }
    
    setUser(null)
    setProfile(null)
    
    console.log('AuthProvider: User signed out successfully')
  }

  const refreshAuth = async () => {
    try {
      const response = await apiClient.getCurrentUser()
      if (response.success && response.data) {
        setUser(response.data.user)
        setProfile(response.data.profile)
      }
    } catch (error) {
      console.error('Refresh auth error:', error)
    }
  }

  const handleLogin = async (email: string, password: string) => {
    try {
      // Demo login - always succeed
      const demoUserProfile: UserProfile = {
        id: 'demo-user-id',
        user_id: 'demo-user-id',
        username: 'demo-user',
        display_name: 'Demo User',
        avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400',
        bio: 'Welcome to Flavours! This is a demo creator profile.',
        is_creator: true,
        is_verified: false,
        created_at: new Date().toISOString()
      }
      
      const demoUser: User = {
        id: 'demo-user-id',
        email: email,
        username: 'demo-user',
        display_name: 'Demo User',
        is_creator: true,
        is_verified: false,
        avatar_url: demoUserProfile.avatar_url,
        bio: demoUserProfile.bio,
        followers_count: 0,
        following_count: 0,
        posts_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      setUser(demoUser)
      setProfile(demoUserProfile)
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('isAuthenticated', 'true')
        localStorage.setItem('demoUser', JSON.stringify(demoUserProfile))
      }
      
      console.log('AuthProvider: User logged in successfully')
      return { success: true }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'Network error' }
    }
  }

  const handleRegister = async (userData: any) => {
    try {
      const response = await apiClient.register(userData)
      if (response.success) {
        const newUser = response.data
        setUser(newUser.user)
        setProfile(newUser.profile)
        
      if (typeof window !== 'undefined') {
        localStorage.setItem('isAuthenticated', 'true')
          localStorage.setItem('demoUser', JSON.stringify(newUser.profile))
      }
      
      return { success: true }
      } else {
        return { success: false, error: response.error || 'Registration failed' }
      }
    } catch (error) {
      console.error('Register error:', error)
      return { success: false, error: 'Network error' }
    }
  }

  const contextValue: AuthContextType = {
      user,
      profile,
      loading,
      signOut: handleSignOut,
      refreshAuth,
    login: handleLogin,
    register: handleRegister
  }

  return (
    <AuthContext.Provider value={contextValue}>
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