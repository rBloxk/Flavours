"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AuthGuard } from '@/components/auth/auth-guard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { 
  Bell, 
  Heart, 
  MessageCircle, 
  UserPlus, 
  Crown, 
  DollarSign, 
  TrendingUp, 
  Shield,
  Check,
  X,
  Settings,
  Filter,
  Search,
  SortAsc,
  SortDesc,
  Calendar,
  Eye,
  ExternalLink,
  Trash2,
  MoreVertical,
  CheckCircle,
  Clock,
  Users,
  Star,
  Zap,
  AlertTriangle,
  Info,
  Mail,
  Smartphone,
  Volume2,
  VolumeX,
  Globe,
  Lock,
  Unlock
} from 'lucide-react'

export default function NotificationsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState('recent')
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [showFilter, setShowFilter] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'like',
      user: {
        id: 'user-1',
        name: 'Sarah Johnson',
        username: 'sarah_fitness',
        avatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=random',
        verified: true
      },
      action: 'liked your post',
      content: 'New workout video is live! 💪 Who\'s ready to sweat with me?',
      timestamp: '2 minutes ago',
      timestampDate: new Date(Date.now() - 2 * 60 * 1000),
      isRead: false,
      postId: 1,
      postTitle: 'Morning HIIT Workout'
    },
    {
      id: 2,
      type: 'comment',
      user: {
        id: 'user-2',
        name: 'Alex Chen',
        username: 'alex_artist',
        avatar: 'https://ui-avatars.com/api/?name=Alex+Chen&background=random',
        verified: true
      },
      action: 'commented on your post',
      content: 'Amazing artwork! The colors are so vibrant.',
      comment: 'This is incredible! How long did it take you to create this?',
      timestamp: '15 minutes ago',
      timestampDate: new Date(Date.now() - 15 * 60 * 1000),
      isRead: false,
      postId: 2,
      postTitle: 'Digital Art Creation Process'
    },
    {
      id: 3,
      type: 'follow',
      user: {
        id: 'user-3',
        name: 'Maya Rodriguez',
        username: 'maya_cooking',
        avatar: 'https://ui-avatars.com/api/?name=Maya+Rodriguez&background=random',
        verified: true
      },
      action: 'started following you',
      content: null,
      timestamp: '1 hour ago',
      timestampDate: new Date(Date.now() - 60 * 60 * 1000),
      isRead: false,
      userId: 'user-3'
    },
    {
      id: 4,
      type: 'earning',
      user: {
        id: 'system',
        name: 'System',
        username: 'system',
        avatar: null,
        verified: false
      },
      action: 'You earned $25.50',
      content: 'From premium content unlocks this week',
      timestamp: '2 hours ago',
      timestampDate: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isRead: true,
      amount: 25.50,
      currency: 'USD'
    },
    {
      id: 5,
      type: 'like',
      user: {
        id: 'user-4',
        name: 'David Kim',
        username: 'david_photography',
        avatar: 'https://ui-avatars.com/api/?name=David+Kim&background=random',
        verified: false
      },
      action: 'liked your post',
      content: 'Behind the scenes of my latest art piece ✨',
      timestamp: '3 hours ago',
      timestampDate: new Date(Date.now() - 3 * 60 * 60 * 1000),
      isRead: true,
      postId: 3,
      postTitle: 'Art Studio Tour'
    },
    {
      id: 6,
      type: 'system',
      user: {
        id: 'system',
        name: 'System',
        username: 'system',
        avatar: null,
        verified: false
      },
      action: 'Welcome to Flavours!',
      content: 'Complete your profile to get started and discover amazing creators.',
      timestamp: '1 day ago',
      timestampDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
      isRead: true,
      actionType: 'welcome'
    },
    {
      id: 7,
      type: 'earning',
      user: {
        id: 'system',
        name: 'System',
        username: 'system',
        avatar: null,
        verified: false
      },
      action: 'Payment received',
      content: 'Your monthly creator earnings have been processed',
      timestamp: '2 days ago',
      timestampDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      isRead: true,
      amount: 150.75,
      currency: 'USD'
    },
    {
      id: 8,
      type: 'follow',
      user: {
        id: 'user-5',
        name: 'Emma Wilson',
        username: 'emma_fitness',
        avatar: 'https://ui-avatars.com/api/?name=Emma+Wilson&background=random',
        verified: true
      },
      action: 'started following you',
      content: null,
      timestamp: '3 days ago',
      timestampDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      isRead: true,
      userId: 'user-5'
    }
  ])

  const notificationTypes = [
    { id: 'all', label: 'All', icon: Bell },
    { id: 'like', label: 'Likes', icon: Heart },
    { id: 'comment', label: 'Comments', icon: MessageCircle },
    { id: 'follow', label: 'Follows', icon: UserPlus },
    { id: 'earning', label: 'Earnings', icon: DollarSign },
    { id: 'system', label: 'System', icon: Settings }
  ]

  // Filter and sort notifications
  const filteredAndSortedNotifications = () => {
    let notifs = notifications

    // Apply type filter
    if (filter !== 'all') {
      notifs = notifs.filter(notif => notif.type === filter)
    }

    // Apply search filter
    if (searchQuery) {
      notifs = notifs.filter(notif => 
        notif.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notif.user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notif.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (notif.content && notif.content.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (notif.comment && notif.comment.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Apply sorting
    switch (sortBy) {
      case 'recent':
        notifs = notifs.sort((a, b) => b.timestampDate.getTime() - a.timestampDate.getTime())
        break
      case 'oldest':
        notifs = notifs.sort((a, b) => a.timestampDate.getTime() - b.timestampDate.getTime())
        break
      case 'unread':
        notifs = notifs.sort((a, b) => Number(b.isRead) - Number(a.isRead))
        break
      case 'read':
        notifs = notifs.sort((a, b) => Number(a.isRead) - Number(b.isRead))
        break
      default:
        break
    }

    return notifs
  }

  const filteredNotifications = filteredAndSortedNotifications()
  const unreadCount = notifications.filter(notif => !notif.isRead).length

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="h-5 w-5 text-red-500" />
      case 'comment':
        return <MessageCircle className="h-5 w-5 text-blue-500" />
      case 'follow':
        return <UserPlus className="h-5 w-5 text-green-500" />
      case 'earning':
        return <DollarSign className="h-5 w-5 text-yellow-500" />
      case 'system':
        return <Settings className="h-5 w-5 text-gray-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  // Interactive functions
  const markAsRead = (id: number) => {
    setNotifications(notifs => 
      notifs.map(notif => 
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    )
    toast({
      title: "Notification marked as read",
      description: "This notification has been marked as read.",
    })
  }

  const markAllAsRead = () => {
    setNotifications(notifs => 
      notifs.map(notif => ({ ...notif, isRead: true }))
    )
    toast({
      title: "All notifications marked as read",
      description: "All notifications have been marked as read.",
    })
  }

  const deleteNotification = (id: number) => {
    setNotifications(notifs => notifs.filter(notif => notif.id !== id))
    toast({
      title: "Notification deleted",
      description: "This notification has been deleted.",
    })
  }

  const clearAllRead = () => {
    setNotifications(notifs => notifs.filter(notif => !notif.isRead))
    toast({
      title: "Read notifications cleared",
      description: "All read notifications have been cleared.",
    })
  }

  const viewPost = (postId: number) => {
    router.push(`/post/${postId}`)
  }

  const viewUser = (userId: string) => {
    router.push(`/profile/${userId}`)
  }

  const handleNotificationClick = (notification: any) => {
    if (!notification.isRead) {
      markAsRead(notification.id)
    }
    
    if (notification.postId) {
      viewPost(notification.postId)
    } else if (notification.userId) {
      viewUser(notification.userId)
    }
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    setShowSearch(false)
  }

  const handleClearFilters = () => {
    setFilter('all')
    setSortBy('recent')
    setSearchQuery('')
    setShowSearch(false)
    setShowFilter(false)
  }

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-4 lg:py-6 space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Notifications</h1>
          <p className="text-sm lg:text-base text-muted-foreground">
            {filteredNotifications.length} of {notifications.length} notifications
            {unreadCount > 0 && ` • ${unreadCount} unread`}
            {searchQuery && ` matching "${searchQuery}"`}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowSearch(!showSearch)}
            className={showSearch ? 'bg-primary text-primary-foreground' : ''}
          >
            <Search className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Search</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowFilter(!showFilter)}
            className={showFilter ? 'bg-primary text-primary-foreground' : ''}
          >
            <Filter className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Filter</span>
          </Button>
          <Dialog open={showSettings} onOpenChange={setShowSettings}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Settings</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Notification Settings</DialogTitle>
                <DialogDescription>
                  Manage your notification preferences and delivery methods
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Notification Types</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Heart className="h-4 w-4 text-red-500" />
                        <Label>Likes</Label>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <MessageCircle className="h-4 w-4 text-blue-500" />
                        <Label>Comments</Label>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <UserPlus className="h-4 w-4 text-green-500" />
                        <Label>New Followers</Label>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-yellow-500" />
                        <Label>Earnings</Label>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Delivery Methods</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Bell className="h-4 w-4" />
                        <Label>Push Notifications</Label>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4" />
                        <Label>Email</Label>
                      </div>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Smartphone className="h-4 w-4" />
                        <Label>SMS</Label>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead} className="text-sm">
              <CheckCircle className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Mark all as read</span>
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filter Controls */}
      {(showSearch || showFilter) && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {showSearch && (
                <div className="flex-1">
                  <Input
                    placeholder="Search notifications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>
              )}
              {showFilter && (
                <div className="flex flex-col sm:flex-row gap-2">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">Most Recent</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="unread">Unread First</SelectItem>
                      <SelectItem value="read">Read First</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" onClick={handleClearFilters}>
                    Clear
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notification Types */}
      <div className="flex flex-wrap gap-2">
        {notificationTypes.map((type) => {
          const Icon = type.icon
          const count = type.id === 'all' 
            ? notifications.length 
            : notifications.filter(notif => notif.type === type.id).length
          const unreadCount = type.id === 'all' 
            ? notifications.filter(notif => !notif.isRead).length
            : notifications.filter(notif => notif.type === type.id && !notif.isRead).length
          
          return (
            <Button
              key={type.id}
              variant={filter === type.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(type.id)}
              className="flex items-center space-x-2"
            >
              <Icon className="h-4 w-4" />
              <span>{type.label}</span>
              {count > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  {count}
                </Badge>
              )}
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-1 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs">
                  {unreadCount}
                </Badge>
              )}
            </Button>
          )
        })}
      </div>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Recent Notifications</span>
              </CardTitle>
              <CardDescription>
                {filter === 'all' ? 'All your notifications' : `${filter.charAt(0).toUpperCase() + filter.slice(1)} notifications`}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={clearAllRead}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Read
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredNotifications.length > 0 ? (
            <div className="space-y-1">
              {filteredNotifications.map((notification, index) => (
                <div key={notification.id}>
                  <div 
                    className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer ${!notification.isRead ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {notification.user.avatar ? (
                          <Avatar 
                            className="h-10 w-10 cursor-pointer" 
                            onClick={(e) => {
                              e.stopPropagation()
                              viewUser(notification.user.id)
                            }}
                          >
                            <AvatarImage src={notification.user.avatar} alt={notification.user.name} />
                            <AvatarFallback>{notification.user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                            {getNotificationIcon(notification.type)}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span 
                            className="font-medium cursor-pointer hover:text-primary"
                            onClick={(e) => {
                              e.stopPropagation()
                              viewUser(notification.user.id)
                            }}
                          >
                            {notification.user.name}
                          </span>
                          <span className="text-sm text-muted-foreground">@{notification.user.username}</span>
                          {notification.user.verified && (
                            <Shield className="h-4 w-4 text-blue-600" />
                          )}
                          <span className="text-sm text-muted-foreground">{notification.action}</span>
                        </div>
                        
                        {notification.content && (
                          <p className="text-sm text-muted-foreground mt-1">
                            "{notification.content}"
                          </p>
                        )}
                        
                        {notification.comment && (
                          <div className="mt-2 p-2 bg-muted rounded-lg">
                            <p className="text-sm">{notification.comment}</p>
                          </div>
                        )}
                        
                        {notification.amount && (
                          <div className="mt-2 flex items-center space-x-2">
                            <Crown className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm font-medium text-green-600">
                              +${notification.amount.toFixed(2)} {notification.currency}
                            </span>
                          </div>
                        )}
                        
                        {notification.postTitle && (
                          <div className="mt-2">
                            <Badge variant="outline" className="text-xs">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              {notification.postTitle}
                            </Badge>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-muted-foreground">{notification.timestamp}</span>
                            {!notification.isRead && (
                              <Badge variant="destructive" className="text-xs">
                                Unread
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            {!notification.isRead && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  markAsRead(notification.id)
                                }}
                                className="h-6 px-2 text-xs"
                              >
                                <Check className="h-3 w-3 mr-1" />
                                Mark as read
                              </Button>
                            )}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => e.stopPropagation()}
                                  className="h-6 px-2 text-xs"
                                >
                                  <MoreVertical className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation()
                                  markAsRead(notification.id)
                                }}>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Mark as Read
                                </DropdownMenuItem>
                                {notification.postId && (
                                  <DropdownMenuItem onClick={(e) => {
                                    e.stopPropagation()
                                    viewPost(notification.postId)
                                  }}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Post
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation()
                                  viewUser(notification.user.id)
                                }}>
                                  <Users className="h-4 w-4 mr-2" />
                                  View Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    deleteNotification(notification.id)
                                  }}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                      
                      {!notification.isRead && (
                        <div className="flex-shrink-0">
                          <div className="h-2 w-2 bg-blue-500 rounded-full" />
                        </div>
                      )}
                    </div>
                  </div>
                  {index < filteredNotifications.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <Bell className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {searchQuery ? 'No matching notifications' : 'No notifications'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery 
                  ? `No notifications match "${searchQuery}". Try a different search term.`
                  : filter === 'all' 
                    ? "You're all caught up! No new notifications." 
                    : `No ${filter} notifications at the moment.`
                }
              </p>
              {searchQuery && (
                <Button variant="outline" onClick={handleClearSearch}>
                  Clear Search
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>Manage your notification preferences and view activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2"
              onClick={() => setShowSettings(true)}
            >
              <Settings className="h-6 w-6" />
              <span>Notification Settings</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2"
              onClick={() => {
                toast({
                  title: "Email Preferences",
                  description: "Email notification preferences opened.",
                })
              }}
            >
              <Mail className="h-6 w-6" />
              <span>Email Preferences</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2"
              onClick={() => {
                toast({
                  title: "Activity Summary",
                  description: "Your activity summary is being generated.",
                })
              }}
            >
              <TrendingUp className="h-6 w-6" />
              <span>Activity Summary</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Notification Statistics
          </CardTitle>
          <CardDescription>Overview of your notification activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold text-primary">{notifications.length}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold text-blue-600">{unreadCount}</div>
              <div className="text-sm text-muted-foreground">Unread</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold text-green-600">
                {notifications.filter(n => n.type === 'like').length}
              </div>
              <div className="text-sm text-muted-foreground">Likes</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold text-purple-600">
                {notifications.filter(n => n.type === 'follow').length}
              </div>
              <div className="text-sm text-muted-foreground">Follows</div>
            </div>
          </div>
          
          {/* Additional Stats */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg border">
              <div className="text-xl font-bold">
                {notifications.filter(n => n.type === 'comment').length}
              </div>
              <div className="text-sm text-muted-foreground">Comments</div>
            </div>
            <div className="text-center p-4 rounded-lg border">
              <div className="text-xl font-bold">
                {notifications.filter(n => n.type === 'earning').length}
              </div>
              <div className="text-sm text-muted-foreground">Earnings</div>
            </div>
            <div className="text-center p-4 rounded-lg border">
              <div className="text-xl font-bold">
                {notifications.filter(n => n.type === 'system').length}
              </div>
              <div className="text-sm text-muted-foreground">System</div>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </AuthGuard>
  )
}
