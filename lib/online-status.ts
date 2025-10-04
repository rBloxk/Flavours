/**
 * Online/Offline Status Management
 * Handles real-time presence updates, heartbeats, and connection monitoring
 */

import React, { useState, useEffect } from 'react'

export interface OnlineStatus {
  userId: string
  status: 'online' | 'away' | 'busy' | 'offline'
  lastSeen: Date
  device?: 'mobile' | 'desktop' | 'tablet'
  userAgent?: string
  isTyping?: boolean
  currentActivity?: string
}

export interface HeartbeatData {
  userId: string
  timestamp: Date
  status: 'online' | 'away' | 'busy'
  activity?: string
}

class OnlineStatusManager {
  private static instance: OnlineStatusManager
  private statusMap = new Map<string, OnlineStatus>()
  private heartbeatInterval: NodeJS.Timeout | null = null
  private onlineUsers = new Set<string>()
  private listeners = new Set<(status: OnlineStatus) => void>()
  private userId: string | null = null

  private constructor() {
    this.startHeartbeat()
    this.setupVisibilityHandlers()
    this.setupBeforeUnloadHandler()
  }

  public static getInstance(): OnlineStatusManager {
    if (!OnlineStatusManager.instance) {
      OnlineStatusManager.instance = new OnlineStatusManager()
    }
    return OnlineStatusManager.instance
  }

  /**
   * Initialize presence for a user
   */
  initializeUser(userId: string, userAgent?: string) {
    this.userId = userId
    
    const device = this.getDeviceFromUserAgent(userAgent || navigator.userAgent)
    
    const initialStatus: OnlineStatus = {
      userId,
      status: 'online',
      lastSeen: new Date(),
      device,
      userAgent,
      currentActivity: 'Browsing Flavours'
    }
    
    this.updateStatus(initialStatus)
    this.onlineUsers.add(userId)
    
    console.log(`📱 User ${userId} came online (${device})`)
  }

  /**
   * Update user's presence status
   */
  updateStatus(status: OnlineStatus) {
    this.statusMap.set(status.userId, status)
    
    // Notify listeners
    this.listeners.forEach(listener => listener(status))
    
    // If this is the current user, send heartbeat
    if (status.userId === this.userId) {
      this.sendHeartbeat(status)
    }
  }

  /**
   * Get current status for a user
   */
  getStatus(userId: string): OnlineStatus | null {
    return this.statusMap.get(userId) || null
  }

  /**
   * Get all online users
   */
  getOnlineUsers(): string[] {
    return Array.from(this.onlineUsers)
  }

  /**
   * Check if a user is online
   */
  isUserOnline(userId: string): boolean {
    const status = this.getStatus(userId)
    return status?.status === 'online' || status?.status === 'away'
  }

  /**
   * Set user as offline
   */
  setOffline(userId?: string) {
    const targetUserId = userId || this.userId
    if (targetUserId) {
      const offlineStatus: OnlineStatus = {
        userId: targetUserId,
        status: 'offline',
        lastSeen: new Date(),
        device: this.statusMap.get(targetUserId)?.device,
        userAgent: this.statusMap.get(targetUserId)?.userAgent
      }
      
      this.updateStatus(offlineStatus)
      this.onlineUsers.delete(targetUserId)
      
      console.log(`📱🌙 User ${targetUserId} went offline`)
    }
  }

  /**
   * Send heartbeat to server
   */
  private sendHeartbeat(status: OnlineStatus) {
    const heartbeat: HeartbeatData = {
      userId: status.userId,
      timestamp: new Date(),
      status: status.status === 'offline' ? 'online' : status.status,
      activity: status.currentActivity
    }
    
    // In a real implementation, this would send to WebSocket server
    if (typeof window !== 'undefined') {
      localStorage.setItem(`heartbeat_${status.userId}`, JSON.stringify(heartbeat))
      
      // Simulate server acknowledgment
      setTimeout(() => {
        this.updateLastSeen(status.userId)
      }, 100)
    }
  }

  /**
   * Update last seen timestamp
   */
  private updateLastSeen(userId: string) {
    const currentStatus = this.statusMap.get(userId)
    if (currentStatus) {
      const updatedStatus: OnlineStatus = {
        ...currentStatus,
        lastSeen: new Date()
      }
      this.statusMap.set(userId, updatedStatus)
      
      this.listeners.forEach(listener => listener(updatedStatus))
    }
  }

  /**
   * Start periodic heartbeat
   */
  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.userId) {
        const currentStatus = this.getStatus(this.userId)
        if (currentStatus && currentStatus.status !== 'offline') {
          this.sendHeartbeat(currentStatus)
        }
      }
    }, 15000) // Send heartbeat every 15 seconds
  }

  /**
   * Setup page visibility handlers
   */
  private setupVisibilityHandlers() {
    if (typeof document !== 'undefined') {
      const handleVisibilityChange = () => {
        if (this.userId) {
          const currentStatus = this.getStatus(this.userId)
          if (currentStatus && currentStatus.status !== 'offline') {
            const newStatus: OnlineStatus = {
              ...currentStatus,
              status: document.hidden ? 'away' : 'online',
              currentActivity: document.hidden ? 'Background Tab' : 'Browsing Flavours'
            }
            this.updateStatus(newStatus)
          }
        }
      }
      
      document.addEventListener('visibilitychange', handleVisibilityChange)
      
      // Handle page blur/focus for additional context
      window.addEventListener('blur', () => {
        if (this.userId) {
          const currentStatus = this.getStatus(this.userId)
          if (currentStatus && currentStatus.status === 'online') {
            this.updateStatus({
              ...currentStatus,
              status: 'away',
              currentActivity: 'Switched Window'
            })
          }
        }
      })
      
      window.addEventListener('focus', () => {
        if (this.userId) {
          const currentStatus = this.getStatus(this.userId)
          if (currentStatus && currentStatus.status === 'away') {
            this.updateStatus({
              ...currentStatus,
              status: 'online',
              currentActivity: 'Browsing Flavours'
            })
          }
        }
      })
    }
  }

  /**
   * Setup beforeunload handler to set offline status
   */
  private setupBeforeUnloadHandler() {
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.setOffline()
      })
    }
  }

  /**
   * Detect device from user agent
   */
  private getDeviceFromUserAgent(userAgent: string): 'mobile' | 'desktop' | 'tablet' {
    if (/iPad|Android|Tablet/i.test(userAgent)) {
      return 'tablet'
    } else if (/Mobile|Android|iPhone|BlackBerry|Windows Phone/i.test(userAgent)) {
      return 'mobile'
    } else {
      return 'desktop'
    }
  }

  /**
   * Subscribe to status changes
   */
  subscribe(listener: (status: OnlineStatus) => void) {
    this.listeners.add(listener)
    
    return () => {
      this.listeners.delete(listener)
    }
  }

  /**
   * Cleanup when component unmounts
   */
  destroy() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
    }
    this.setOffline()
    this.listeners.clear()
    this.onlineUsers.clear()
    this.statusMap.clear()
  }
}

// Global instance
const onlineStatusManager = OnlineStatusManager.getInstance()

// React Hook for using online status
export function useOnlineStatus(userId?: string) {
  const [status, setStatus] =   useState<OnlineStatus | null>(null)
  const [isOnline, setIsOnline] = useState(false)

  useEffect(() => {
    if (userId || typeof navigator !== 'undefined') {
      // Initialize current user
      const currentUserId = userId || 'demo-user-id'
      onlineStatusManager.initializeUser(currentUserId)
      
      // Subscribe to updates
      const unsubscribe = onlineStatusManager.subscribe((updatedStatus) => {
        if (updatedStatus.userId === currentUserId) {
          setStatus(updatedStatus)
          setIsOnline(updatedStatus.status === 'online' || updatedStatus.status === 'away')
        }
      })
      
      // Set initial status
      const initialStatus = onlineStatusManager.getStatus(currentUserId)
      if (initialStatus) {
        setStatus(initialStatus)
        setIsOnline(initialStatus.status === 'online' || initialStatus.status === 'away')
      }
      
      return () => {
        unsubscribe()
      }
    }
  }, [userId])

  return { status, isOnline }
}

export default onlineStatusManager