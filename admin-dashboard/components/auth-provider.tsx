'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { authService, User, LoginCredentials, SignupData } from '@/lib/auth'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  signup: (data: SignupData) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    initializeAuth()
  }, [])

  const initializeAuth = async () => {
    try {
      setLoading(true)
      
      if (authService.isAuthenticated()) {
        const userData = await authService.getCurrentUser()
        setUser(userData)
      }
    } catch (error) {
      console.error('Auth initialization failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true)
      const response = await authService.login(credentials)
      setUser(response.user)
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signup = async (data: SignupData) => {
    try {
      setLoading(true)
      const response = await authService.signup(data)
      setUser(response.user)
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      setLoading(true)
      await authService.logout()
      setUser(null)
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshUser = async () => {
    try {
      const userData = await authService.getCurrentUser()
      setUser(userData)
    } catch (error) {
      console.error('User refresh failed:', error)
      setUser(null)
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    login,
    signup,
    logout,
    refreshUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
