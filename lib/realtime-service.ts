import React from 'react'
import { io, Socket } from 'socket.io-client'

// Enhanced real-time service with advanced features
export class RealtimeService {
  private socket: Socket | null = null
  private isConnected = false
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private eventHandlers: Map<string, Function[]> = new Map()

  constructor(private apiUrl: string = 'http://localhost:3001') {}

  // Connect to WebSocket server
  async connect(token: string): Promise<void> {
    try {
      this.socket = io(this.apiUrl, {
        transports: ['websocket', 'polling'],
        upgrade: true,
        rememberUpgrade: true,
        timeout: 20000,
        forceNew: true
      })

      // Connection event handlers
      this.socket.on('connect', () => {
        console.log('🔌 Connected to real-time server')
        this.isConnected = true
        this.reconnectAttempts = 0
        
        // Authenticate with token
        this.socket?.emit('authenticate', token)
      })

      this.socket.on('disconnect', (reason) => {
        console.log('🔌 Disconnected from real-time server:', reason)
        this.isConnected = false
        this.handleReconnect()
      })

      this.socket.on('connect_error', (error) => {
        console.error('🔌 Connection error:', error)
        this.handleReconnect()
      })

      // Authentication handlers
      this.socket.on('authenticated', (data) => {
        console.log('✅ Authenticated with real-time features:', data.features)
        this.emit('authenticated', data)
      })

      this.socket.on('auth_error', (error) => {
        console.error('❌ Authentication error:', error)
        this.emit('auth_error', error)
      })

      // Enhanced notification handlers
      this.socket.on('notification', (notification) => {
        console.log('🔔 New notification:', notification)
        this.emit('notification', notification)
        this.showNotificationToast(notification)
      })

      this.socket.on('notification_stats', (stats) => {
        console.log('📊 Notification stats:', stats)
        this.emit('notification_stats', stats)
      })

      // Enhanced presence handlers
      this.socket.on('presence_update', (presence) => {
        console.log('👤 Presence update:', presence)
        this.emit('presence_update', presence)
      })

      this.socket.on('connection_presence_update', (data) => {
        console.log('👥 Connection presence update:', data)
        this.emit('connection_presence_update', data)
      })

      this.socket.on('online_connections', (connections) => {
        console.log('👥 Online connections:', connections)
        this.emit('online_connections', connections)
      })

      this.socket.on('activity_history', (activities) => {
        console.log('📈 Activity history:', activities)
        this.emit('activity_history', activities)
      })

      // Chat handlers
      this.socket.on('new_message', (message) => {
        console.log('💬 New message:', message)
        this.emit('new_message', message)
      })

      this.socket.on('user_typing', (data) => {
        this.emit('user_typing', data)
      })

      // Stream handlers
      this.socket.on('viewer_count_update', (data) => {
        this.emit('viewer_count_update', data)
      })

      this.socket.on('stream_chat_message', (message) => {
        this.emit('stream_chat_message', message)
      })

      this.socket.on('stream_gift', (gift) => {
        this.emit('stream_gift', gift)
      })

      // Error handler
      this.socket.on('error', (error) => {
        console.error('❌ WebSocket error:', error)
        this.emit('error', error)
      })

    } catch (error) {
      console.error('Failed to connect to real-time server:', error)
      throw error
    }
  }

  // Disconnect from WebSocket server
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
    }
  }

  // Subscribe to notifications with preferences
  subscribeToNotifications(preferences?: {
    types?: string[]
    frequency?: 'instant' | 'batched'
    channels?: ('push' | 'email' | 'sms')[]
  }): void {
    this.socket?.emit('subscribe_notifications', preferences)
  }

  // Unsubscribe from notifications
  unsubscribeFromNotifications(): void {
    this.socket?.emit('unsubscribe_notifications')
  }

  // Mark notification as read
  markNotificationRead(notificationId: string): void {
    this.socket?.emit('mark_notification_read', notificationId)
  }

  // Get notification statistics
  getNotificationStats(): void {
    this.socket?.emit('get_notification_stats')
  }

  // Update user presence
  updatePresence(data: {
    status: 'online' | 'away' | 'busy'
    activity?: string
    location?: string
  }): void {
    this.socket?.emit('update_presence', data)
  }

  // Get activity history
  getActivityHistory(limit: number = 50): void {
    this.socket?.emit('get_activity_history', limit)
  }

  // Get online connections
  getOnlineConnections(): void {
    this.socket?.emit('get_online_connections')
  }

  // Send direct message
  sendMessage(data: {
    recipientId: string
    content: string
    mediaUrl?: string
  }): void {
    this.socket?.emit('send_message', data)
  }

  // Typing indicators
  startTyping(recipientId: string): void {
    this.socket?.emit('typing_start', recipientId)
  }

  stopTyping(recipientId: string): void {
    this.socket?.emit('typing_stop', recipientId)
  }

  // Stream operations
  joinStream(streamId: string): void {
    this.socket?.emit('join_stream', streamId)
  }

  leaveStream(streamId: string): void {
    this.socket?.emit('leave_stream', streamId)
  }

  sendStreamChatMessage(data: {
    streamId: string
    message: string
  }): void {
    this.socket?.emit('stream_chat_message', data)
  }

  sendStreamGift(data: {
    streamId: string
    giftType: string
    amount: number
  }): void {
    this.socket?.emit('send_stream_gift', data)
  }

  // Chat session operations
  joinChatSession(sessionId: string): void {
    this.socket?.emit('join_chat_session', sessionId)
  }

  leaveChatSession(sessionId: string): void {
    this.socket?.emit('leave_chat_session', sessionId)
  }

  sendChatMessage(data: {
    sessionId: string
    message: string
    type: string
  }): void {
    this.socket?.emit('chat_message', data)
  }

  // Chat typing indicators
  startChatTyping(sessionId: string): void {
    this.socket?.emit('chat_typing_start', sessionId)
  }

  stopChatTyping(sessionId: string): void {
    this.socket?.emit('chat_typing_stop', sessionId)
  }

  // Post interactions
  togglePostLike(postId: string): void {
    this.socket?.emit('toggle_post_like', postId)
  }

  joinPostRoom(postId: string): void {
    this.socket?.emit('join_post_room', postId)
  }

  leavePostRoom(postId: string): void {
    this.socket?.emit('leave_post_room', postId)
  }

  // Event subscription system
  on(event: string, handler: Function): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, [])
    }
    this.eventHandlers.get(event)?.push(handler)
  }

  off(event: string, handler: Function): void {
    const handlers = this.eventHandlers.get(event)
    if (handlers) {
      const index = handlers.indexOf(handler)
      if (index > -1) {
        handlers.splice(index, 1)
      }
    }
  }

  private emit(event: string, data: any): void {
    const handlers = this.eventHandlers.get(event)
    if (handlers) {
      handlers.forEach(handler => handler(data))
    }
  }

  // Handle reconnection with exponential backoff
  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
      
      console.log(`🔄 Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
      
      setTimeout(() => {
        if (this.socket && !this.isConnected) {
          this.socket.connect()
        }
      }, delay)
    } else {
      console.error('❌ Max reconnection attempts reached')
      this.emit('max_reconnect_attempts_reached', null)
    }
  }

  // Show notification toast
  private showNotificationToast(notification: any): void {
    // Check if browser supports notifications
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id,
        requireInteraction: notification.type === 'subscription' || notification.type === 'gift_received'
      })
    }
  }

  // Request notification permission
  async requestNotificationPermission(): Promise<boolean> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }
    return false
  }

  // Get connection status
  getConnectionStatus(): {
    connected: boolean
    reconnectAttempts: number
    maxReconnectAttempts: number
  } {
    return {
      connected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts
    }
  }
}

// Singleton instance
export const realtimeService = new RealtimeService()

// React hook for real-time features
export function useRealtime() {
  return {
    connect: (token: string) => realtimeService.connect(token),
    disconnect: () => realtimeService.disconnect(),
    subscribeToNotifications: (preferences?: any) => realtimeService.subscribeToNotifications(preferences),
    unsubscribeFromNotifications: () => realtimeService.unsubscribeFromNotifications(),
    markNotificationRead: (id: string) => realtimeService.markNotificationRead(id),
    getNotificationStats: () => realtimeService.getNotificationStats(),
    updatePresence: (data: any) => realtimeService.updatePresence(data),
    getActivityHistory: (limit?: number) => realtimeService.getActivityHistory(limit),
    getOnlineConnections: () => realtimeService.getOnlineConnections(),
    sendMessage: (data: any) => realtimeService.sendMessage(data),
    startTyping: (recipientId: string) => realtimeService.startTyping(recipientId),
    stopTyping: (recipientId: string) => realtimeService.stopTyping(recipientId),
    joinStream: (streamId: string) => realtimeService.joinStream(streamId),
    leaveStream: (streamId: string) => realtimeService.leaveStream(streamId),
    sendStreamChatMessage: (data: any) => realtimeService.sendStreamChatMessage(data),
    sendStreamGift: (data: any) => realtimeService.sendStreamGift(data),
    joinChatSession: (sessionId: string) => realtimeService.joinChatSession(sessionId),
    leaveChatSession: (sessionId: string) => realtimeService.leaveChatSession(sessionId),
    sendChatMessage: (data: any) => realtimeService.sendChatMessage(data),
    startChatTyping: (sessionId: string) => realtimeService.startChatTyping(sessionId),
    stopChatTyping: (sessionId: string) => realtimeService.stopChatTyping(sessionId),
    togglePostLike: (postId: string) => realtimeService.togglePostLike(postId),
    joinPostRoom: (postId: string) => realtimeService.joinPostRoom(postId),
    leavePostRoom: (postId: string) => realtimeService.leavePostRoom(postId),
    on: (event: string, handler: Function) => realtimeService.on(event, handler),
    off: (event: string, handler: Function) => realtimeService.off(event, handler),
    requestNotificationPermission: () => realtimeService.requestNotificationPermission(),
    getConnectionStatus: () => realtimeService.getConnectionStatus()
  }
}
