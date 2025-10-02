import { Server } from 'socket.io'
import { logger } from '../utils/logger'
import { supabase } from '../config/database'
import { redisManager } from '../config/redis'

// Enhanced WebSocket types
interface UserPresence {
  userId: string
  status: 'online' | 'away' | 'busy' | 'offline'
  lastSeen: Date
  currentActivity?: string
}

interface NotificationData {
  id: string
  type: 'like' | 'comment' | 'subscription' | 'message' | 'stream_start' | 'gift_received'
  title: string
  message: string
  userId: string
  metadata?: any
  timestamp: Date
  read: boolean
}

interface StreamAnalytics {
  streamId: string
  viewerCount: number
  totalViews: number
  engagement: number
  giftsReceived: number
  chatMessages: number
}

export function setupWebSocket(io: Server) {
  io.on('connection', (socket) => {
    logger.info(`WebSocket client connected: ${socket.id}`)

    // Enhanced Authentication with presence tracking
    socket.on('authenticate', async (token: string) => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser(token)
        
        if (error || !user) {
          socket.emit('auth_error', { error: 'Invalid token' })
          return
        }

        socket.data.userId = user.id
        socket.data.userToken = token
        socket.data.authenticatedAt = new Date()
        
        // Join user-specific rooms
        socket.join(`user:${user.id}`)
        socket.join(`notifications:${user.id}`)
        
        // Store user connection in Redis with enhanced data
        const connectionData = {
          socketId: socket.id,
          authenticatedAt: new Date().toISOString(),
          userAgent: socket.handshake.headers['user-agent'],
          ip: socket.handshake.address
        }
        await redisManager.setex(`user_connection:${user.id}`, 3600, JSON.stringify(connectionData))
        
        // Update user presence
        await updateUserPresence(user.id, 'online', 'authenticated')
        
        // Send pending notifications
        await sendPendingNotifications(user.id, socket)
        
        socket.emit('authenticated', { 
          userId: user.id,
          timestamp: new Date().toISOString(),
          features: ['realtime_chat', 'notifications', 'presence', 'analytics']
        })
        
        logger.info(`User authenticated: ${user.id} with enhanced features`)
      } catch (error) {
        logger.error('WebSocket auth error:', error)
        socket.emit('auth_error', { error: 'Authentication failed' })
      }
    })

    // Join creator room
    socket.on('join_creator_room', (creatorId: string) => {
      if (socket.data.userId) {
        socket.join(`creator:${creatorId}`)
        logger.info(`User ${socket.data.userId} joined creator room: ${creatorId}`)
      }
    })

    // Handle direct messages
    socket.on('send_message', async (data: {
      recipientId: string
      content: string
      mediaUrl?: string
    }) => {
      try {
        if (!socket.data.userId) {
          socket.emit('error', { error: 'Not authenticated' })
          return
        }

        // Save message to database
        const { data: message, error } = await supabase
          .from('messages')
          .insert({
            sender_id: socket.data.userId,
            recipient_id: data.recipientId,
            content: data.content,
            media_url: data.mediaUrl
          })
          .select(`
            *,
            sender:profiles!messages_sender_id_fkey(username, display_name, avatar_url)
          `)
          .single()

        if (error) {
          socket.emit('error', { error: 'Failed to send message' })
          return
        }

        // Emit to recipient
        io.to(`user:${data.recipientId}`).emit('new_message', message)
        
        // Confirm to sender
        socket.emit('message_sent', message)

        logger.info(`Message sent from ${socket.data.userId} to ${data.recipientId}`)
      } catch (error) {
        logger.error('Send message error:', error)
        socket.emit('error', { error: 'Failed to send message' })
      }
    })

    // Handle typing indicators
    socket.on('typing_start', (recipientId: string) => {
      if (socket.data.userId) {
        io.to(`user:${recipientId}`).emit('user_typing', {
          userId: socket.data.userId,
          typing: true
        })
      }
    })

    socket.on('typing_stop', (recipientId: string) => {
      if (socket.data.userId) {
        io.to(`user:${recipientId}`).emit('user_typing', {
          userId: socket.data.userId,
          typing: false
        })
      }
    })

    // =============================================
    // CAMS (LIVE STREAMING) HANDLERS
    // =============================================

    // Join stream
    socket.on('join_stream', async (streamId: string) => {
      try {
        if (!socket.data.userId) {
          socket.emit('error', { error: 'Not authenticated' })
          return
        }

        socket.join(`stream:${streamId}`)
        
        // Update viewer count
        const viewerCount = await updateStreamViewerCount(streamId, 1)
        io.to(`stream:${streamId}`).emit('viewer_count_update', { count: viewerCount })
        
        logger.info(`User ${socket.data.userId} joined stream: ${streamId}`)
      } catch (error) {
        logger.error('Join stream error:', error)
        socket.emit('error', { error: 'Failed to join stream' })
      }
    })

    // Leave stream
    socket.on('leave_stream', async (streamId: string) => {
      try {
        if (!socket.data.userId) return

        socket.leave(`stream:${streamId}`)
        
        // Update viewer count
        const viewerCount = await updateStreamViewerCount(streamId, -1)
        io.to(`stream:${streamId}`).emit('viewer_count_update', { count: viewerCount })
        
        logger.info(`User ${socket.data.userId} left stream: ${streamId}`)
      } catch (error) {
        logger.error('Leave stream error:', error)
      }
    })

    // Stream chat message
    socket.on('stream_chat_message', async (data: {
      streamId: string
      message: string
    }) => {
      try {
        if (!socket.data.userId) {
          socket.emit('error', { error: 'Not authenticated' })
          return
        }

        // Save chat message
        const { data: chatMessage, error } = await supabase
          .from('stream_chat')
          .insert({
            stream_id: data.streamId,
            user_id: socket.data.userId,
            message: data.message
          })
          .select(`
            *,
            profiles!inner (
              username,
              display_name,
              avatar_url
            )
          `)
          .single()

        if (error) {
          socket.emit('error', { error: 'Failed to send chat message' })
          return
        }

        // Broadcast to all stream viewers
        io.to(`stream:${data.streamId}`).emit('stream_chat_message', chatMessage)
        
        logger.info(`Stream chat message sent in stream ${data.streamId}`)
      } catch (error) {
        logger.error('Stream chat message error:', error)
        socket.emit('error', { error: 'Failed to send chat message' })
      }
    })

    // Send stream gift
    socket.on('send_stream_gift', async (data: {
      streamId: string
      giftType: string
      amount: number
    }) => {
      try {
        if (!socket.data.userId) {
          socket.emit('error', { error: 'Not authenticated' })
          return
        }

        // Save gift
        const { data: gift, error } = await supabase
          .from('stream_gifts')
          .insert({
            stream_id: data.streamId,
            user_id: socket.data.userId,
            gift_type: data.giftType,
            amount: data.amount
          })
          .select(`
            *,
            profiles!inner (
              username,
              display_name,
              avatar_url
            )
          `)
          .single()

        if (error) {
          socket.emit('error', { error: 'Failed to send gift' })
          return
        }

        // Broadcast to all stream viewers
        io.to(`stream:${data.streamId}`).emit('stream_gift', gift)
        
        logger.info(`Gift sent in stream ${data.streamId}`)
      } catch (error) {
        logger.error('Send stream gift error:', error)
        socket.emit('error', { error: 'Failed to send gift' })
      }
    })

    // =============================================
    // FLAVOURSTALK (ANONYMOUS CHAT) HANDLERS
    // =============================================

    // Join chat session
    socket.on('join_chat_session', async (sessionId: string) => {
      try {
        if (!socket.data.userId) {
          socket.emit('error', { error: 'Not authenticated' })
          return
        }

        socket.join(`chat_session:${sessionId}`)
        
        logger.info(`User ${socket.data.userId} joined chat session: ${sessionId}`)
      } catch (error) {
        logger.error('Join chat session error:', error)
        socket.emit('error', { error: 'Failed to join chat session' })
      }
    })

    // Leave chat session
    socket.on('leave_chat_session', (sessionId: string) => {
      socket.leave(`chat_session:${sessionId}`)
      logger.info(`User ${socket.data.userId} left chat session: ${sessionId}`)
    })

    // Send chat message
    socket.on('chat_message', async (data: {
      sessionId: string
      message: string
      type: string
    }) => {
      try {
        if (!socket.data.userId) {
          socket.emit('error', { error: 'Not authenticated' })
          return
        }

        // Save chat message
        const { data: chatMessage, error } = await supabase
          .from('chat_messages')
          .insert({
            session_id: data.sessionId,
            user_id: socket.data.userId,
            message: data.message,
            type: data.type
          })
          .select(`
            *,
            profiles!inner (
              username,
              display_name,
              avatar_url
            )
          `)
          .single()

        if (error) {
          socket.emit('error', { error: 'Failed to send chat message' })
          return
        }

        // Broadcast to session participants
        io.to(`chat_session:${data.sessionId}`).emit('chat_message', chatMessage)
        
        logger.info(`Chat message sent in session ${data.sessionId}`)
      } catch (error) {
        logger.error('Chat message error:', error)
        socket.emit('error', { error: 'Failed to send chat message' })
      }
    })

    // Chat typing indicator
    socket.on('chat_typing_start', (sessionId: string) => {
      if (socket.data.userId) {
        io.to(`chat_session:${sessionId}`).emit('chat_user_typing', {
          userId: socket.data.userId,
          typing: true
        })
      }
    })

    socket.on('chat_typing_stop', (sessionId: string) => {
      if (socket.data.userId) {
        io.to(`chat_session:${sessionId}`).emit('chat_user_typing', {
          userId: socket.data.userId,
          typing: false
        })
      }
    })

    // =============================================
    // CONTENT INTERACTION HANDLERS
    // =============================================

    // Like/Unlike post
    socket.on('toggle_post_like', async (postId: string) => {
      try {
        if (!socket.data.userId) {
          socket.emit('error', { error: 'Not authenticated' })
          return
        }

        // Toggle like in database
        const { data: result, error } = await supabase.rpc('toggle_post_like', {
          post_id: postId,
          user_id: socket.data.userId
        })

        if (error) {
          socket.emit('error', { error: 'Failed to toggle like' })
          return
        }

        // Broadcast to post viewers
        io.to(`post:${postId}`).emit('post_like_update', {
          postId,
          liked: result.liked,
          likesCount: result.likes_count
        })
        
        logger.info(`Post like toggled for post ${postId}`)
      } catch (error) {
        logger.error('Toggle post like error:', error)
        socket.emit('error', { error: 'Failed to toggle like' })
      }
    })

    // Join post room
    socket.on('join_post_room', (postId: string) => {
      socket.join(`post:${postId}`)
      logger.info(`User ${socket.data.userId} joined post room: ${postId}`)
    })

    // Leave post room
    socket.on('leave_post_room', (postId: string) => {
      socket.leave(`post:${postId}`)
      logger.info(`User ${socket.data.userId} left post room: ${postId}`)
    })

    // =============================================
    // ENHANCED NOTIFICATION HANDLERS
    // =============================================

    // Subscribe to notifications with preferences
    socket.on('subscribe_notifications', async (preferences?: {
      types?: string[]
      frequency?: 'instant' | 'batched'
      channels?: ('push' | 'email' | 'sms')[]
    }) => {
      if (socket.data.userId) {
        socket.join(`notifications:${socket.data.userId}`)
        
        // Store notification preferences
        if (preferences) {
          await redisManager.setex(
            `notification_prefs:${socket.data.userId}`, 
            86400, 
            JSON.stringify(preferences)
          )
        }
        
        logger.info(`User ${socket.data.userId} subscribed to notifications with preferences`)
      }
    })

    // Unsubscribe from notifications
    socket.on('unsubscribe_notifications', () => {
      if (socket.data.userId) {
        socket.leave(`notifications:${socket.data.userId}`)
        logger.info(`User ${socket.data.userId} unsubscribed from notifications`)
      }
    })

    // Mark notification as read
    socket.on('mark_notification_read', async (notificationId: string) => {
      try {
        if (!socket.data.userId) return

        // Update notification in database
        const { error } = await supabase
          .from('notifications')
          .update({ read: true, read_at: new Date().toISOString() })
          .eq('id', notificationId)
          .eq('user_id', socket.data.userId)

        if (error) {
          socket.emit('error', { error: 'Failed to mark notification as read' })
          return
        }

        socket.emit('notification_read', { notificationId })
        logger.info(`Notification ${notificationId} marked as read by user ${socket.data.userId}`)
      } catch (error) {
        logger.error('Mark notification read error:', error)
        socket.emit('error', { error: 'Failed to mark notification as read' })
      }
    })

    // Get notification analytics
    socket.on('get_notification_stats', async () => {
      try {
        if (!socket.data.userId) return

        const { data: stats, error } = await supabase
          .from('notifications')
          .select('type, read, created_at')
          .eq('user_id', socket.data.userId)
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days

        if (error) {
          socket.emit('error', { error: 'Failed to get notification stats' })
          return
        }

        const analytics = {
          total: stats.length,
          unread: stats.filter(n => !n.read).length,
          byType: stats.reduce((acc, n) => {
            acc[n.type] = (acc[n.type] || 0) + 1
            return acc
          }, {} as Record<string, number>),
          readRate: stats.length > 0 ? (stats.filter(n => n.read).length / stats.length) * 100 : 0
        }

        socket.emit('notification_stats', analytics)
      } catch (error) {
        logger.error('Get notification stats error:', error)
        socket.emit('error', { error: 'Failed to get notification stats' })
      }
    })

    // =============================================
    // ENHANCED PRESENCE HANDLERS
    // =============================================

    // Update user presence with activity tracking
    socket.on('update_presence', async (data: {
      status: 'online' | 'away' | 'busy'
      activity?: string
      location?: string
    }) => {
      try {
        if (!socket.data.userId) return

        const presenceData: UserPresence = {
          userId: socket.data.userId,
          status: data.status,
          lastSeen: new Date(),
          currentActivity: data.activity
        }

        // Update presence in Redis with TTL
        await redisManager.setex(`user_presence:${socket.data.userId}`, 300, JSON.stringify(presenceData))
        
        // Store activity history
        if (data.activity) {
          await redisManager.lpush(`user_activity:${socket.data.userId}`, JSON.stringify({
            activity: data.activity,
            timestamp: new Date().toISOString(),
            location: data.location
          }))
          await redisManager.ltrim(`user_activity:${socket.data.userId}`, 0, 99) // Keep last 100 activities
        }
        
        // Broadcast to user's connections and followers
        io.to(`user:${socket.data.userId}`).emit('presence_update', presenceData)
        
        // Notify followers of status change
        await notifyFollowersOfPresenceChange(socket.data.userId, presenceData)
        
        logger.info(`User ${socket.data.userId} presence updated: ${data.status} (${data.activity})`)
      } catch (error) {
        logger.error('Update presence error:', error)
      }
    })

    // Get user activity history
    socket.on('get_activity_history', async (limit: number = 50) => {
      try {
        if (!socket.data.userId) return

        const activities = await redisManager.lrange(`user_activity:${socket.data.userId}`, 0, limit - 1)
        const parsedActivities = activities.map(activity => JSON.parse(activity))
        
        socket.emit('activity_history', parsedActivities)
      } catch (error) {
        logger.error('Get activity history error:', error)
        socket.emit('error', { error: 'Failed to get activity history' })
      }
    })

    // Get online friends/followers
    socket.on('get_online_connections', async () => {
      try {
        if (!socket.data.userId) return

        // Get user's connections (followers/following)
        const { data: connections, error } = await supabase
          .from('subscriptions')
          .select('creator_id')
          .eq('user_id', socket.data.userId)
          .eq('status', 'active')

        if (error) {
          socket.emit('error', { error: 'Failed to get connections' })
          return
        }

        const connectionIds = connections.map(c => c.creator_id)
        const onlineConnections = []

        // Check presence for each connection
        for (const connectionId of connectionIds) {
          const presenceData = await redisManager.get(`user_presence:${connectionId}`)
          if (presenceData) {
            const presence = JSON.parse(presenceData as string)
            if (presence.status === 'online') {
              onlineConnections.push(presence)
            }
          }
        }

        socket.emit('online_connections', onlineConnections)
      } catch (error) {
        logger.error('Get online connections error:', error)
        socket.emit('error', { error: 'Failed to get online connections' })
      }
    })

    // =============================================
    // DISCONNECT HANDLER
    // =============================================

    socket.on('disconnect', async () => {
      try {
        if (socket.data.userId) {
          // Remove user connection from Redis
          await redisManager.del(`user_connection:${socket.data.userId}`)
          
          // Update presence to offline
          await redisManager.del(`user_presence:${socket.data.userId}`)
          
          logger.info(`WebSocket client disconnected: ${socket.id} (User: ${socket.data.userId})`)
        } else {
          logger.info(`WebSocket client disconnected: ${socket.id}`)
        }
      } catch (error) {
        logger.error('Disconnect handler error:', error)
      }
    })
  })

  // =============================================
  // HELPER FUNCTIONS
  // =============================================

  // Update stream viewer count
  const updateStreamViewerCount = async (streamId: string, delta: number): Promise<number> => {
    try {
      const currentCount = await redisManager.get(`stream_viewers:${streamId}`)
      const newCount = Math.max(0, (parseInt((currentCount as string) || '0') + delta))
      
      await redisManager.setex(`stream_viewers:${streamId}`, 3600, newCount.toString())
      
      return newCount
    } catch (error) {
      logger.error('Update stream viewer count error:', error)
      return 0
    }
  }

  // Send notification to user
  const sendNotification = (userId: string, notification: any) => {
    io.to(`user:${userId}`).emit('notification', notification)
    io.to(`notifications:${userId}`).emit('notification', notification)
  }

  // Send notification to multiple users
  const sendNotificationToUsers = (userIds: string[], notification: any) => {
    userIds.forEach(userId => {
      sendNotification(userId, notification)
    })
  }

  // Broadcast to stream viewers
  const broadcastToStream = (streamId: string, event: string, data: any) => {
    io.to(`stream:${streamId}`).emit(event, data)
  }

  // Broadcast to chat session
  const broadcastToChatSession = (sessionId: string, event: string, data: any) => {
    io.to(`chat_session:${sessionId}`).emit(event, data)
  }

  // Get online users count
  const getOnlineUsersCount = async (): Promise<number> => {
    try {
      const keys = await redisManager.keys('user_connection:*')
      return keys.length
    } catch (error) {
      logger.error('Get online users count error:', error)
      return 0
    }
  }

  // =============================================
  // ENHANCED HELPER FUNCTIONS
  // =============================================

  // Update user presence with enhanced tracking
  const updateUserPresence = async (userId: string, status: string, activity?: string) => {
    try {
      const presenceData: UserPresence = {
        userId,
        status: status as 'online' | 'away' | 'busy' | 'offline',
        lastSeen: new Date(),
        currentActivity: activity
      }
      
      await redisManager.setex(`user_presence:${userId}`, 300, JSON.stringify(presenceData))
      
      // Update database for analytics
      await supabase
        .from('user_presence')
        .upsert({
          user_id: userId,
          status,
          last_seen: new Date().toISOString(),
          current_activity: activity
        })
    } catch (error) {
      logger.error('Update user presence error:', error)
    }
  }

  // Send pending notifications to user
  const sendPendingNotifications = async (userId: string, socket: any) => {
    try {
      const { data: notifications, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('read', false)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) {
        logger.error('Get pending notifications error:', error)
        return
      }

      notifications.forEach(notification => {
        socket.emit('notification', notification)
      })

      logger.info(`Sent ${notifications.length} pending notifications to user ${userId}`)
    } catch (error) {
      logger.error('Send pending notifications error:', error)
    }
  }

  // Notify followers of presence change
  const notifyFollowersOfPresenceChange = async (userId: string, presence: UserPresence) => {
    try {
      const { data: followers, error } = await supabase
        .from('subscriptions')
        .select('user_id')
        .eq('creator_id', userId)
        .eq('status', 'active')

      if (error || !followers.length) return

      const followerIds = followers.map(f => f.user_id)
      
      // Send presence update to followers
      followerIds.forEach(followerId => {
        io.to(`user:${followerId}`).emit('connection_presence_update', {
          userId,
          presence
        })
      })

      logger.info(`Notified ${followerIds.length} followers of presence change for user ${userId}`)
    } catch (error) {
      logger.error('Notify followers of presence change error:', error)
    }
  }

  // Enhanced notification system
  const createNotification = async (notification: Omit<NotificationData, 'id' | 'timestamp' | 'read'>) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          type: notification.type,
          title: notification.title,
          message: notification.message,
          user_id: notification.userId,
          metadata: notification.metadata,
          read: false
        })
        .select()
        .single()

      if (error) {
        logger.error('Create notification error:', error)
        return null
      }

      // Send real-time notification
      io.to(`user:${notification.userId}`).emit('notification', data)
      io.to(`notifications:${notification.userId}`).emit('notification', data)

      return data
    } catch (error) {
      logger.error('Create notification error:', error)
      return null
    }
  }

  // Get real-time analytics
  const getRealtimeAnalytics = async (): Promise<{
    onlineUsers: number
    activeStreams: number
    totalConnections: number
    systemHealth: 'healthy' | 'warning' | 'critical'
  }> => {
    try {
      const onlineUsers = await getOnlineUsersCount()
      const activeStreams = await redisManager.keys('stream_viewers:*')
      const totalConnections = await redisManager.keys('user_connection:*')
      
      const systemHealth = onlineUsers > 1000 ? 'warning' : 
                          onlineUsers > 5000 ? 'critical' : 'healthy'

      return {
        onlineUsers,
        activeStreams: activeStreams.length,
        totalConnections: totalConnections.length,
        systemHealth
      }
    } catch (error) {
      logger.error('Get realtime analytics error:', error)
      return {
        onlineUsers: 0,
        activeStreams: 0,
        totalConnections: 0,
        systemHealth: 'critical'
      }
    }
  }

  // Export enhanced helper functions for use in other modules
  return {
    io,
    sendNotification,
    sendNotificationToUsers,
    broadcastToStream,
    broadcastToChatSession,
    getOnlineUsersCount,
    updateUserPresence,
    createNotification,
    getRealtimeAnalytics,
    notifyFollowersOfPresenceChange
  }
}