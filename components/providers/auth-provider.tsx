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
  const [loading, setLoading] = useState(true) // Start with true to show loading

  useEffect(() => {
    // Check if we're on the client side
    if (typeof window !== 'undefined') {
      // Check for authentication in localStorage (fallback to demo mode)
      const isAuthenticated = localStorage.getItem('isAuthenticated')
      const demoUserStr = localStorage.getItem('demoUser')
      
      console.log('AuthProvider: Checking authentication...', { isAuthenticated, demoUserStr })
      
      if (isAuthenticated === 'true' && demoUserStr) {
        try {
          const demoUser = JSON.parse(demoUserStr)
          console.log('AuthProvider: Setting authenticated user:', demoUser)
          
          // Create a mock user object for demo mode
          const mockUser: User = {
            id: demoUser.id,
            email: demoUser.email,
            username: demoUser.username,
            display_name: demoUser.display_name,
            is_creator: demoUser.is_creator,
            is_verified: false,
            avatar_url: demoUser.avatar_url,
            bio: 'Demo user bio',
            followers_count: 0,
            following_count: 0,
            posts_count: 0,
            created_at: demoUser.created_at,
            updated_at: demoUser.created_at
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
      }
    }
    
    // Always set loading to false after checking
    setLoading(false)
  }, [])

  const handleSignOut = async () => {
    try {
      // Try to logout from API
      await apiClient.logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isAuthenticated')
      localStorage.removeItem('demoUser')
    }
    
    setUser(null)
    setProfile(null)
    
    // Redirect to home page
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
  }

  const refreshAuth = async () => {
    try {
      // Skip API call in demo mode - just check localStorage
      if (typeof window !== 'undefined') {
        const isAuthenticated = localStorage.getItem('isAuthenticated')
        const demoUserStr = localStorage.getItem('demoUser')
        
        if (isAuthenticated === 'true' && demoUserStr) {
          try {
            const demoUser = JSON.parse(demoUserStr)
            const mockUser: User = {
              id: demoUser.id,
              email: demoUser.email,
              username: demoUser.username,
              display_name: demoUser.display_name,
              is_creator: demoUser.is_creator,
              is_verified: false,
              avatar_url: demoUser.avatar_url,
              bio: 'Demo user bio',
              followers_count: 0,
              following_count: 0,
              posts_count: 0,
              created_at: demoUser.created_at,
              updated_at: demoUser.created_at
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
            return
          } catch (error) {
            console.error('Demo user parsing error:', error)
          }
        }
      }
      
      // If not in demo mode or no demo user, try API call
      const response = await apiClient.getCurrentUser()
      
      if (response.data) {
        setUser(response.data)
        setProfile({
          id: response.data.id,
          user_id: response.data.id,
          username: response.data.username,
          display_name: response.data.display_name,
          avatar_url: response.data.avatar_url,
          bio: response.data.bio || '',
          is_creator: response.data.is_creator,
          is_verified: response.data.is_verified,
          created_at: response.data.created_at
        })
      } else {
        setUser(null)
        setProfile(null)
      }
    } catch (error) {
      console.error('Refresh auth error:', error)
      // In demo mode, don't clear user state on API errors
      if (typeof window !== 'undefined') {
        const isAuthenticated = localStorage.getItem('isAuthenticated')
        if (isAuthenticated !== 'true') {
          setUser(null)
          setProfile(null)
        }
      } else {
        setUser(null)
        setProfile(null)
      }
    }
  }

  const login = async (email: string, password: string) => {
    try {
      // For demo purposes, accept any email/password combination
      // In production, this would call the actual API
      const demoUser = {
        id: 'demo-user-' + Date.now(),
        email: email,
        username: email.split('@')[0],
        display_name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
        is_creator: false,
        avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(email.split('@')[0])}&background=random`,
        created_at: new Date().toISOString()
      }
      
      const profileData = {
        id: demoUser.id,
        user_id: demoUser.id,
        username: demoUser.username,
        display_name: demoUser.display_name,
        avatar_url: demoUser.avatar_url,
        bio: '',
        is_creator: demoUser.is_creator,
        is_verified: false,
        created_at: demoUser.created_at
      }
      
      setUser(demoUser)
      setProfile(profileData)
      
      // Store authentication state
      if (typeof window !== 'undefined') {
        localStorage.setItem('isAuthenticated', 'true')
        localStorage.setItem('demoUser', JSON.stringify(demoUser))
      }
      
      return { success: true }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'Network error' }
    }
  }

  const register = async (userData: any) => {
    try {
      // For demo purposes, create a demo user
      // In production, this would call the actual API
      const demoUser = {
        id: 'demo-user-' + Date.now(),
        email: userData.email,
        username: userData.username,
        display_name: userData.display_name,
        is_creator: userData.is_creator || false,
        avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.display_name)}&background=random`,
        created_at: new Date().toISOString()
      }
      
      const profileData = {
        id: demoUser.id,
        user_id: demoUser.id,
        username: demoUser.username,
        display_name: demoUser.display_name,
        avatar_url: demoUser.avatar_url,
        bio: '',
        is_creator: demoUser.is_creator,
        is_verified: false,
        created_at: demoUser.created_at
      }
      
      setUser(demoUser)
      setProfile(profileData)
      
      // Create user storage folders via API
      try {
        const response = await fetch('/api/storage/user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: demoUser.username })
        })
        if (response.ok) {
          console.log(`Storage folders created for user: ${demoUser.username}`)
        }
      } catch (error) {
        console.error('Failed to create storage folders:', error)
        // Don't fail registration if storage creation fails
      }
      
      // Log registration activity via API
      try {
        await fetch('/api/storage/activity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: demoUser.username,
            type: 'login',
            details: {
              registration: true,
              email: userData.email,
              timestamp: new Date().toISOString()
            }
          })
        })
      } catch (error) {
        console.error('Failed to log registration activity:', error)
      }
      
      // Store authentication state
      if (typeof window !== 'undefined') {
        localStorage.setItem('isAuthenticated', 'true')
        localStorage.setItem('demoUser', JSON.stringify(demoUser))
      }
      
      return { success: true }
    } catch (error) {
      console.error('Registration error:', error)
      return { success: false, error: 'Network error' }
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      signOut: handleSignOut,
      refreshAuth,
      login,
      register
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
