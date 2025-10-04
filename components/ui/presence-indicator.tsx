'use client'

import React, { useState, useEffect } from 'react'
import { Circle, Clock, Activity, MapPin, Users, Wifi, WifiOff } from 'lucide-react'
import { Badge } from './badge'
import { Card, CardContent, CardHeader, CardTitle } from './card'
import { Button } from './button'
import { cn } from '@/lib/utils'

interface UserPresence {
  userId: string
  status: 'online' | 'away' | 'busy' | 'offline'
  lastSeen: Date
  currentActivity?: string
  device?: string
  location?: string
}

const statusColors = {
  online: 'bg-green-500',
  away: 'bg-yellow-500',
  busy: 'bg-red-500',
  offline: 'bg-gray-400'
}

const statusLabels = {
  online: 'Online',
  away: 'Away',
  busy: 'Busy',
  offline: 'Offline'
}

const statusHoverColors = {
  online: 'bg-green-600',
  away: 'bg-yellow-600', 
  busy: 'bg-red-600',
  offline: 'bg-gray-500'
}

export function PresenceIndicator({ 
  userId, 
  showDetails = false,
  size = 'sm'
}: { 
  userId: string
  showDetails?: boolean
  size?: 'sm' | 'md' | 'lg'
}) {
  const [presence, setPresence] = useState<UserPresence | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isOnline, setIsOnline] = useState(false)
  const [lastHeartbeat, setLastHeartbeat] = useState<Date>(new Date())

  // Simulate real-time presence updates
  useEffect(() => {
    // Initialize with online status for demo user
    if (userId === 'demo-user-id') {
      const demoPresence: UserPresence = {
        userId,
        status: 'online',
        lastSeen: new Date(),
        currentActivity: 'Browsing Flavours',
        device: 'Desktop',
        location: 'San Francisco, CA'
      }
      setPresence(demoPresence)
      setIsOnline(true)
    } else {
      // Random status for other users
      const statuses: Array<'online' | 'away' | 'busy' | 'offline'> = ['online', 'away', 'busy', 'offline']
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]
      
      const randomPresence: UserPresence = {
        userId,
        status: randomStatus,
        lastSeen: randomStatus === 'offline' 
          ? new Date(Date.now() - Math.floor(Math.random() * 24 * 60 * 60 * 1000)) // Random time in last 24h
          : new Date(),
        currentActivity: randomStatus === 'online' ? 'Active' : 'Inactive',
        device: Math.random() > 0.5 ? 'Mobile' : 'Desktop',
        location: randomStatus === 'offline' ? undefined : 'Unknown'
      }
      
      setPresence(randomPresence)
      setIsOnline(randomStatus !== 'offline')
    }

    // Simulate real-time heartbeat for online users
    const heartbeatInterval = setInterval(() => {
      if (presence?.status !== 'offline') {
        setLastHeartbeat(new Date())
        
        // Randomly change activity or status
        if (Math.random() > 0.8) {
          const activities = ['Browsing Flavours', 'Creating Content', 'Watching Videos', 'Active']
          const randomActivity = activities[Math.floor(Math.random() * activities.length)]
          
          setPresence(prev => prev ? {
            ...prev,
            currentActivity: randomActivity,
            lastSeen: new Date()
          } : null)
        }
      }
    }, 5000) // Update every 5 seconds

    // Simulate going offline after inactivity
    const offlineTimeout = setTimeout(() => {
      if (presence && presence.status !== 'offline' && Math.random() > 0.9) {
        setPresence(prev => prev ? {
          ...prev,
          status: 'offline',
          lastSeen: new Date(),
          currentActivity: undefined
        } : null)
        setIsOnline(false)
      }
    }, 30000) // 30 seconds timeout

    return () => {
      clearInterval(heartbeatInterval)
      clearTimeout(offlineTimeout)
    }
  }, [userId])

  const getTimeAgo = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  const getStatusDescription = (status: string, lastSeen: Date) => {
    switch (status) {
      case 'online':
        return 'Active now'
      case 'away':
        return 'Away - inactive'
      case 'busy':
        return 'Do not disturb'
      case 'offline':
        return `Last seen ${getTimeAgo(lastSeen)}`
      default:
        return 'Unknown'
    }
  }

  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3', 
    lg: 'w-4 h-4'
  }

  const pulseAnimation = presence?.status === 'online' ? 'animate-pulse' : ''

  if (!presence && !showDetails) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
        <span className="text-sm text-muted-foreground">Offline</span>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {/* Simple Status Indicator */}
      {!showDetails && (
        <div className="flex items-center space-x-2">
          <div className="relative">
            <div className={cn(
              "rounded-full",
              statusColors[presence?.status || 'offline'],
              sizeClasses[size],
              pulseAnimation
            )}></div>
            {/* Online indicator ring */}
            {presence?.status === 'online' && (
              <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75"></div>
            )}
          </div>
          <span className="text-sm text-muted-foreground">
            {statusLabels[presence?.status || 'offline']}
          </span>
        </div>
      )}

      {/* Detailed Status Card */}
      {showDetails && (
        <Card className="w-80">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {presence?.status === 'online' ? (
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Wifi className="h-5 w-5 text-green-500" />
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                    <span>Online</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <WifiOff className="h-5 w-5 text-gray-400" />
                    <span>Offline</span>
                  </div>
                )}
              </CardTitle>
              
              <PresenceBadge 
                status={presence?.status || 'offline'} 
                size="md" 
                showLabel={false}
              />
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Status Description */}
            <div className="flex items-center space-x-2">
              <Circle className={cn(
                "h-3 w-3",
                presence?.status === 'online' ? 'text-green-500' : 'text-gray-400'
              )} />
              <span className="text-sm">
                {presence ? getStatusDescription(presence.status, presence.lastSeen) : 'Unknown'}
              </span>
            </div>

            {/* Current Activity */}
            {presence?.currentActivity && (
              <div className="flex items-center space-x-2">
                <Activity className="h-3 w-3 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {presence.currentActivity}
                </span>
              </div>
            )}

            {/* Device & Location */}
            {presence?.device && (
              <div className="flex items-center space-x-2">
                <span className="text-xs bg-muted px-2 py-1 rounded">
                  📱 {presence.device}
                </span>
                {presence.location && (
                  <span className="text-xs bg-muted px-2 py-1 rounded flex items-center space-x-1">
                    <MapPin className="h-3 w-3" />
                    {presence.location}
                  </span>
                )}
              </div>
            )}

            {/* Heartbeat Indicator */}
            {presence?.status === 'online' && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-muted-foreground">
                  Last heartbeat: {getTimeAgo(lastHeartbeat)}
                </span>
              </div>
            )}

            {/* Last Seen */}
            {presence?.lastSeen && (
              <div className="flex items-center space-x-2">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {presence.status === 'offline' 
                    ? `Last seen ${getTimeAgo(presence.lastSeen)}`
                    : `Available since ${getTimeAgo(presence.lastSeen)}`
                  }
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Enhanced Presence Badge Component
export function PresenceBadge({ 
  status, 
  size = 'sm',
  showLabel = false,
  animated = false
}: { 
  status: 'online' | 'away' | 'busy' | 'offline'
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  animated?: boolean
}) {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  }

  const pulseClass = animated && status === 'online' ? 'animate-pulse' : ''

  return (
    <div className="flex items-center space-x-1">
      <div className="relative">
        <div className={cn(
          "rounded-full transition-colors duration-200",
          statusColors[status],
          sizeClasses[size],
          pulseClass
        )}></div>
        {animated && status === 'online' && (
          <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75"></div>
        )}
      </div>
      {showLabel && (
        <span className="text-xs text-muted-foreground font-medium">
          {statusLabels[status]}
        </span>
      )}
    </div>
  )
}

// Online Users Counter Component
export function OnlineUsersCounter() {
  const [onlineCount, setOnlineCount] = useState(0)
  const [totalUsers, setTotalUsers] = useState(0)

  useEffect(() => {
    // Simulate online users count
    setOnlineCount(Math.floor(Math.random() * 150) + 50) // 50-200 users
    setTotalUsers(Math.floor(Math.random() * 500) + 200) // 200-700 total
    
    const interval = setInterval(() => {
      // Simulate fluctuating user count
      const variation = Math.floor(Math.random() * 10) - 5 // -5 to +5
      setOnlineCount(prev => Math.max(0, prev + variation))
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-center space-x-2 p-2 bg-card rounded-lg border">
      <div className="flex items-center space-x-1">
        <Users className="h-4 w-4 text-green-500" />
        <span className="text-sm font-medium">{onlineCount}</span>
        <span className="text-xs text-muted-foreground">online</span>
      </div>
      <div className="h-4 w-px bg-border"></div>
      <span className="text-xs text-muted-foreground">
        {onlineCount}/{totalUsers} total
      </span>
    </div>
  )
}

// Simple Online Indicator
export function SimpleOnlineIndicator({ userId }: { userId: string }) {
  const [isOnline, setIsOnline] = useState(false)

  useEffect(() => {
    // Demo user is always online, others have random status
    if (userId === 'demo-user-id') {
      setIsOnline(true)
    } else {
      setIsOnline(Math.random() > 0.3) // 70% chance of being online
    }
  }, [userId])

  return (
    <PresenceBadge 
      status={isOnline ? 'online' : 'offline'} 
      size="sm" 
      animated={true}
    />
  )
}