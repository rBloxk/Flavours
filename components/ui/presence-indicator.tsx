'use client'

import React, { useState, useEffect } from 'react'
import { Circle, Clock, Activity, MapPin } from 'lucide-react'
import { Badge } from './badge'
import { Card, CardContent, CardHeader, CardTitle } from './card'
import { Button } from './button'
import { useRealtime } from '@/lib/realtime-service'
import { cn } from '@/lib/utils'

interface UserPresence {
  userId: string
  status: 'online' | 'away' | 'busy' | 'offline'
  lastSeen: Date
  currentActivity?: string
}

interface ActivityHistory {
  activity: string
  timestamp: string
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

export function PresenceIndicator({ userId, showDetails = false }: { 
  userId: string
  showDetails?: boolean 
}) {
  const [presence, setPresence] = useState<UserPresence | null>(null)
  const [activityHistory, setActivityHistory] = useState<ActivityHistory[]>([])
  const [onlineConnections, setOnlineConnections] = useState<UserPresence[]>([])
  const [isExpanded, setIsExpanded] = useState(false)
  
  const realtime = useRealtime()

  useEffect(() => {
    // Subscribe to presence updates
    realtime.on('presence_update', handlePresenceUpdate)
    realtime.on('connection_presence_update', handleConnectionPresenceUpdate)
    realtime.on('online_connections', handleOnlineConnections)
    realtime.on('activity_history', handleActivityHistory)

    // Get initial data
    realtime.getOnlineConnections()
    realtime.getActivityHistory(20)

    return () => {
      realtime.off('presence_update', handlePresenceUpdate)
      realtime.off('connection_presence_update', handleConnectionPresenceUpdate)
      realtime.off('online_connections', handleOnlineConnections)
      realtime.off('activity_history', handleActivityHistory)
    }
  }, [])

  const handlePresenceUpdate = (presenceData: UserPresence) => {
    if (presenceData.userId === userId) {
      setPresence(presenceData)
    }
  }

  const handleConnectionPresenceUpdate = (data: { userId: string, presence: UserPresence }) => {
    if (data.userId === userId) {
      setPresence(data.presence)
    }
  }

  const handleOnlineConnections = (connections: UserPresence[]) => {
    setOnlineConnections(connections)
  }

  const handleActivityHistory = (activities: ActivityHistory[]) => {
    setActivityHistory(activities)
  }

  const updatePresence = (status: 'online' | 'away' | 'busy', activity?: string) => {
    realtime.updatePresence({ status, activity })
  }

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
      {/* Simple Presence Indicator */}
      {!showDetails && presence && (
        <div className="flex items-center space-x-2">
          <div className={cn("w-2 h-2 rounded-full", statusColors[presence.status])}></div>
          <span className="text-sm text-muted-foreground">
            {statusLabels[presence.status]}
          </span>
          {presence.currentActivity && (
            <span className="text-xs text-muted-foreground">
              • {presence.currentActivity}
            </span>
          )}
        </div>
      )}

      {/* Detailed Presence Card */}
      {showDetails && (
        <Card className="w-80">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Presence</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? 'Collapse' : 'Expand'}
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Current Status */}
            <div className="flex items-center space-x-3">
              <div className={cn("w-3 h-3 rounded-full", statusColors[presence?.status || 'offline'])}></div>
              <div>
                <p className="font-medium">{statusLabels[presence?.status || 'offline']}</p>
                {presence?.currentActivity && (
                  <p className="text-sm text-muted-foreground">{presence.currentActivity}</p>
                )}
              </div>
            </div>

            {/* Status Controls */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Update Status</p>
              <div className="flex space-x-2">
                <Button
                  variant={presence?.status === 'online' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updatePresence('online', 'Available')}
                >
                  Online
                </Button>
                <Button
                  variant={presence?.status === 'away' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updatePresence('away', 'Away')}
                >
                  Away
                </Button>
                <Button
                  variant={presence?.status === 'busy' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updatePresence('busy', 'Busy')}
                >
                  Busy
                </Button>
              </div>
            </div>

            {/* Online Connections */}
            {onlineConnections.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Online Connections ({onlineConnections.length})</p>
                <div className="space-y-1">
                  {onlineConnections.slice(0, 5).map((connection) => (
                    <div key={connection.userId} className="flex items-center space-x-2 text-sm">
                      <div className={cn("w-2 h-2 rounded-full", statusColors[connection.status])}></div>
                      <span className="text-muted-foreground">User {connection.userId.slice(0, 8)}</span>
                      {connection.currentActivity && (
                        <span className="text-xs text-muted-foreground">
                          • {connection.currentActivity}
                        </span>
                      )}
                    </div>
                  ))}
                  {onlineConnections.length > 5 && (
                    <p className="text-xs text-muted-foreground">
                      +{onlineConnections.length - 5} more
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Expanded Activity History */}
            {isExpanded && activityHistory.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Recent Activity</p>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {activityHistory.slice(0, 10).map((activity, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <Activity className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">{activity.activity}</span>
                      <span className="text-xs text-muted-foreground">
                        {getTimeAgo(new Date(activity.timestamp))}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Last Seen */}
            {presence?.lastSeen && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Last seen {getTimeAgo(presence.lastSeen)}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Presence Badge Component
export function PresenceBadge({ 
  status, 
  size = 'sm',
  showLabel = false 
}: { 
  status: 'online' | 'away' | 'busy' | 'offline'
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}) {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  }

  return (
    <div className="flex items-center space-x-1">
      <div className={cn(
        "rounded-full",
        statusColors[status],
        sizeClasses[size]
      )}></div>
      {showLabel && (
        <span className="text-xs text-muted-foreground">
          {statusLabels[status]}
        </span>
      )}
    </div>
  )
}

// Online Users Counter
export function OnlineUsersCounter() {
  const [onlineCount, setOnlineCount] = useState(0)
  const realtime = useRealtime()

  useEffect(() => {
    const handleOnlineConnections = (connections: UserPresence[]) => {
      setOnlineCount(connections.length)
    }

    realtime.on('online_connections', handleOnlineConnections)
    realtime.getOnlineConnections()

    return () => {
      realtime.off('online_connections', handleOnlineConnections)
    }
  }, [])

  return (
    <Badge variant="secondary" className="flex items-center space-x-1">
      <Circle className="h-3 w-3 fill-green-500 text-green-500" />
      <span>{onlineCount} online</span>
    </Badge>
  )
}

