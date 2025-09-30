'use client'

import React, { useState, useEffect } from 'react'
import { Bell, X, Check, Eye, Settings, TrendingUp, Users, Heart, MessageSquare, Gift, Star } from 'lucide-react'
import { Button } from './button'
import { Badge } from './badge'
import { Card, CardContent, CardHeader, CardTitle } from './card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs'
import { ScrollArea } from './scroll-area'
import { Separator } from './separator'
import { useRealtime } from '@/lib/realtime-service'
import { cn } from '@/lib/utils'

interface Notification {
  id: string
  type: 'like' | 'comment' | 'subscription' | 'message' | 'stream_start' | 'gift_received'
  title: string
  message: string
  userId: string
  metadata?: any
  timestamp: string
  read: boolean
}

interface NotificationStats {
  total: number
  unread: number
  byType: Record<string, number>
  readRate: number
}

const notificationIcons = {
  like: Heart,
  comment: MessageSquare,
  subscription: Users,
  message: MessageSquare,
  stream_start: TrendingUp,
  gift_received: Gift
}

const notificationColors = {
  like: 'text-red-500',
  comment: 'text-blue-500',
  subscription: 'text-green-500',
  message: 'text-purple-500',
  stream_start: 'text-orange-500',
  gift_received: 'text-yellow-500'
}

export function EnhancedNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [stats, setStats] = useState<NotificationStats | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  const [isLoading, setIsLoading] = useState(false)
  
  const realtime = useRealtime()

  useEffect(() => {
    // Subscribe to real-time notifications
    realtime.on('notification', handleNewNotification)
    realtime.on('notification_stats', handleNotificationStats)
    
    // Get initial notification stats
    realtime.getNotificationStats()

    return () => {
      realtime.off('notification', handleNewNotification)
      realtime.off('notification_stats', handleNotificationStats)
    }
  }, [])

  const handleNewNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev])
    
    // Show browser notification if permission granted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id
      })
    }
  }

  const handleNotificationStats = (newStats: NotificationStats) => {
    setStats(newStats)
  }

  const markAsRead = (notificationId: string) => {
    realtime.markNotificationRead(notificationId)
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    )
  }

  const markAllAsRead = () => {
    notifications.forEach(notification => {
      if (!notification.read) {
        realtime.markNotificationRead(notification.id)
      }
    })
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    )
  }

  const requestNotificationPermission = async () => {
    const granted = await realtime.requestNotificationPermission()
    if (granted) {
      console.log('Notification permission granted')
    }
  }

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'all') return true
    if (activeTab === 'unread') return !notification.read
    return notification.type === activeTab
  })

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <Button
        variant="ghost"
        size="sm"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notification Panel */}
      {isOpen && (
        <Card className="absolute right-0 top-12 w-96 z-50 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notifications</CardTitle>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={requestNotificationPermission}
                >
                  <Settings className="h-4 w-4" />
                </Button>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="unread">Unread</TabsTrigger>
                <TabsTrigger value="message">Messages</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-0">
                <ScrollArea className="h-96">
                  {filteredNotifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                      <Bell className="h-12 w-12 mb-4 opacity-50" />
                      <p>No notifications yet</p>
                    </div>
                  ) : (
                    <div className="space-y-1 p-4">
                      {filteredNotifications.map((notification, index) => {
                        const Icon = notificationIcons[notification.type]
                        const colorClass = notificationColors[notification.type]
                        
                        return (
                          <div key={notification.id}>
                            <div
                              className={cn(
                                "flex items-start space-x-3 p-3 rounded-lg cursor-pointer transition-colors",
                                !notification.read ? "bg-blue-50 dark:bg-blue-950/20" : "hover:bg-gray-50 dark:hover:bg-gray-800"
                              )}
                              onClick={() => markAsRead(notification.id)}
                            >
                              <div className={cn("flex-shrink-0", colorClass)}>
                                <Icon className="h-5 w-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {notification.title}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                  {new Date(notification.timestamp).toLocaleString()}
                                </p>
                              </div>
                              {!notification.read && (
                                <div className="flex-shrink-0">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                </div>
                              )}
                            </div>
                            {index < filteredNotifications.length - 1 && (
                              <Separator className="mx-4" />
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>

            {/* Stats Section */}
            {stats && (
              <div className="border-t p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Total</p>
                    <p className="font-semibold">{stats.total}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Unread</p>
                    <p className="font-semibold text-blue-600">{stats.unread}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Read Rate</p>
                    <p className="font-semibold">{stats.readRate.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Health</p>
                    <p className={cn(
                      "font-semibold",
                      stats.readRate > 80 ? "text-green-600" : 
                      stats.readRate > 60 ? "text-yellow-600" : "text-red-600"
                    )}>
                      {stats.readRate > 80 ? "Excellent" : 
                       stats.readRate > 60 ? "Good" : "Needs Attention"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Notification Toast Component
export function NotificationToast({ notification }: { notification: Notification }) {
  const [isVisible, setIsVisible] = useState(true)
  const Icon = notificationIcons[notification.type]
  const colorClass = notificationColors[notification.type]

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  if (!isVisible) return null

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <Card className="shadow-lg border-l-4 border-l-blue-500">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className={cn("flex-shrink-0", colorClass)}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {notification.title}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {notification.message}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

