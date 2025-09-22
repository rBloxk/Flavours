'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRealtime } from '@/lib/realtime-service'
import { useAuth } from './auth-provider'

interface RealtimeContextType {
  isConnected: boolean
  connectionStatus: {
    connected: boolean
    reconnectAttempts: number
    maxReconnectAttempts: number
  }
  notifications: any[]
  presence: any
  onlineConnections: any[]
  activityHistory: any[]
  connect: () => Promise<void>
  disconnect: () => void
  updatePresence: (data: any) => void
  subscribeToNotifications: (preferences?: any) => void
  markNotificationRead: (id: string) => void
  getNotificationStats: () => void
  getActivityHistory: (limit?: number) => void
  getOnlineConnections: () => void
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined)

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [presence, setPresence] = useState<any>(null)
  const [onlineConnections, setOnlineConnections] = useState<any[]>([])
  const [activityHistory, setActivityHistory] = useState<any[]>([])
  const [connectionStatus, setConnectionStatus] = useState({
    connected: false,
    reconnectAttempts: 0,
    maxReconnectAttempts: 5
  })

  const realtime = useRealtime()
  const { user, token } = useAuth()

  // Connect to real-time service when user is authenticated
  useEffect(() => {
    if (user && token && !isConnected) {
      connect()
    } else if (!user && isConnected) {
      disconnect()
    }
  }, [user, token])

  const connect = async () => {
    try {
      if (token) {
        await realtime.connect(token)
        setIsConnected(true)
        
        // Subscribe to notifications
        realtime.subscribeToNotifications({
          types: ['like', 'comment', 'subscription', 'message', 'stream_start', 'gift_received'],
          frequency: 'instant',
          channels: ['push']
        })

        // Get initial data
        realtime.getNotificationStats()
        realtime.getActivityHistory(20)
        realtime.getOnlineConnections()

        console.log('🚀 Connected to real-time service')
      }
    } catch (error) {
      console.error('Failed to connect to real-time service:', error)
    }
  }

  const disconnect = () => {
    realtime.disconnect()
    setIsConnected(false)
    setNotifications([])
    setPresence(null)
    setOnlineConnections([])
    setActivityHistory([])
    console.log('🔌 Disconnected from real-time service')
  }

  // Event handlers
  useEffect(() => {
    const handleAuthenticated = (data: any) => {
      console.log('✅ Real-time authentication successful')
    }

    const handleAuthError = (error: any) => {
      console.error('❌ Real-time authentication failed:', error)
    }

    const handleNotification = (notification: any) => {
      setNotifications(prev => [notification, ...prev])
    }

    const handlePresenceUpdate = (presenceData: any) => {
      setPresence(presenceData)
    }

    const handleOnlineConnections = (connections: any[]) => {
      setOnlineConnections(connections)
    }

    const handleActivityHistory = (activities: any[]) => {
      setActivityHistory(activities)
    }

    const handleConnectionStatus = () => {
      setConnectionStatus(realtime.getConnectionStatus())
    }

    const handleMaxReconnectAttempts = () => {
      console.error('❌ Max reconnection attempts reached')
      setIsConnected(false)
    }

    // Subscribe to events
    realtime.on('authenticated', handleAuthenticated)
    realtime.on('auth_error', handleAuthError)
    realtime.on('notification', handleNotification)
    realtime.on('presence_update', handlePresenceUpdate)
    realtime.on('online_connections', handleOnlineConnections)
    realtime.on('activity_history', handleActivityHistory)
    realtime.on('max_reconnect_attempts_reached', handleMaxReconnectAttempts)

    // Update connection status periodically
    const statusInterval = setInterval(handleConnectionStatus, 5000)

    return () => {
      realtime.off('authenticated', handleAuthenticated)
      realtime.off('auth_error', handleAuthError)
      realtime.off('notification', handleNotification)
      realtime.off('presence_update', handlePresenceUpdate)
      realtime.off('online_connections', handleOnlineConnections)
      realtime.off('activity_history', handleActivityHistory)
      realtime.off('max_reconnect_attempts_reached', handleMaxReconnectAttempts)
      clearInterval(statusInterval)
    }
  }, [])

  const updatePresence = (data: any) => {
    realtime.updatePresence(data)
  }

  const subscribeToNotifications = (preferences?: any) => {
    realtime.subscribeToNotifications(preferences)
  }

  const markNotificationRead = (id: string) => {
    realtime.markNotificationRead(id)
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    )
  }

  const getNotificationStats = () => {
    realtime.getNotificationStats()
  }

  const getActivityHistory = (limit?: number) => {
    realtime.getActivityHistory(limit)
  }

  const getOnlineConnections = () => {
    realtime.getOnlineConnections()
  }

  const value: RealtimeContextType = {
    isConnected,
    connectionStatus,
    notifications,
    presence,
    onlineConnections,
    activityHistory,
    connect,
    disconnect,
    updatePresence,
    subscribeToNotifications,
    markNotificationRead,
    getNotificationStats,
    getActivityHistory,
    getOnlineConnections
  }

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  )
}

export function useRealtimeContext() {
  const context = useContext(RealtimeContext)
  if (context === undefined) {
    throw new Error('useRealtimeContext must be used within a RealtimeProvider')
  }
  return context
}

