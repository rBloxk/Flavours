import { Server as SocketIOServer } from 'socket.io'
import { Server as HTTPServer } from 'http'
import { supabase } from '../config/database'
import { logger } from '../utils/logger'
import jwt from 'jsonwebtoken'

interface AuthenticatedSocket extends Socket {
  userId?: string
  username?: string
  isAuthenticated?: boolean
}

interface Socket extends any {
  userId?: string
  username?: string
  isAuthenticated?: boolean
}

class RealtimeService {
  private io: SocketIOServer
  private connectedUsers: Map<string, Set<string>> = new Map() // userId -> Set of socketIds
  private userSockets: Map<string, string> = new Map() // socketId -> userId

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['websocket', 'polling']
    })

    this.setupMiddleware()
    this.setupEventHandlers()
  }

  private setupMiddleware() {
    // Authentication middleware
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '')
        
        if (!token) {
          return next(new Error('Authentication required'))
        }

        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
        
        // Get user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, username, display_name')
          .eq('user_id', decoded.id)
          .single()

        if (!profile) {
          return next(new Error('User not found'))
        }

        socket.userId = profile.id
        socket.username = profile.username
        socket.isAuthenticated = true

        next()
      } catch (error) {
        logger.error('Socket authentication error:', error)
        next(new Error('Invalid authentication'))
      }
    })
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      if (!socket.isAuthenticated || !socket.userId) {
        socket.disconnect()
        return
      }

      logger.info(`User ${socket.username} connected with socket ${socket.id}`)

      // Track user connection
      this.trackUserConnection(socket.userId, socket.id)

      // Join user to their personal room
      socket.join(`user:${socket.userId}`)

      // Send online status to followers
      this.notifyFollowersOnline(socket.userId)

      // =============================================
      // CONTENT INTERACTIONS
      // =============================================

      socket.on('like_post', async (data: { postId: string }) => {
        try {
          await this.handlePostLike(socket, data.postId)
        } catch (error) {
          socket.emit('error', { message: 'Failed to like post' })
        }
      })

      socket.on('unlike_post', async (data: { postId: string }) => {
        try {
          await this.handlePostUnlike(socket, data.postId)
        } catch (error) {
          socket.emit('error', { message: 'Failed to unlike post' })
        }
      })

      socket.on('comment_post', async (data: { postId: string, content: string, parentId?: string }) => {
        try {
          await this.handlePostComment(socket, data.postId, data.content, data.parentId)
        } catch (error) {
          socket.emit('error', { message: 'Failed to add comment' })
        }
      })

      socket.on('share_post', async (data: { postId: string, platform: string }) => {
        try {
          await this.handlePostShare(socket, data.postId, data.platform)
        } catch (error) {
          socket.emit('error', { message: 'Failed to share post' })
        }
      })

      // =============================================
      // FOLLOW INTERACTIONS
      // =============================================

      socket.on('follow_user', async (data: { userId: string }) => {
        try {
          await this.handleUserFollow(socket, data.userId)
        } catch (error) {
          socket.emit('error', { message: 'Failed to follow user' })
        }
      })

      socket.on('unfollow_user', async (data: { userId: string }) => {
        try {
          await this.handleUserUnfollow(socket, data.userId)
        } catch (error) {
          socket.emit('error', { message: 'Failed to unfollow user' })
        }
      })

      // =============================================
      // LIVE STREAMING (CAMS)
      // =============================================

      socket.on('join_stream', async (data: { streamId: string }) => {
        try {
          await this.handleJoinStream(socket, data.streamId)
        } catch (error) {
          socket.emit('error', { message: 'Failed to join stream' })
        }
      })

      socket.on('leave_stream', async (data: { streamId: string }) => {
        try {
          await this.handleLeaveStream(socket, data.streamId)
        } catch (error) {
          socket.emit('error', { message: 'Failed to leave stream' })
        }
      })

      socket.on('stream_chat_message', async (data: { streamId: string, message: string }) => {
        try {
          await this.handleStreamChatMessage(socket, data.streamId, data.message)
        } catch (error) {
          socket.emit('error', { message: 'Failed to send chat message' })
        }
      })

      socket.on('send_stream_gift', async (data: { streamId: string, giftType: string, amount: number }) => {
        try {
          await this.handleStreamGift(socket, data.streamId, data.giftType, data.amount)
        } catch (error) {
          socket.emit('error', { message: 'Failed to send gift' })
        }
      })

      // =============================================
      // ANONYMOUS CHAT (FLAVOURSTALK)
      // =============================================

      socket.on('join_chat_session', async (data: { sessionId: string }) => {
        try {
          await this.handleJoinChatSession(socket, data.sessionId)
        } catch (error) {
          socket.emit('error', { message: 'Failed to join chat session' })
        }
      })

      socket.on('leave_chat_session', async (data: { sessionId: string }) => {
        try {
          await this.handleLeaveChatSession(socket, data.sessionId)
        } catch (error) {
          socket.emit('error', { message: 'Failed to leave chat session' })
        }
      })

      socket.on('chat_message', async (data: { sessionId: string, message: string, type: string }) => {
        try {
          await this.handleChatMessage(socket, data.sessionId, data.message, data.type)
        } catch (error) {
          socket.emit('error', { message: 'Failed to send message' })
        }
      })

      socket.on('chat_typing_start', (data: { sessionId: string }) => {
        socket.to(`chat:${data.sessionId}`).emit('chat_user_typing', {
          userId: socket.userId,
          typing: true
        })
      })

      socket.on('chat_typing_stop', (data: { sessionId: string }) => {
        socket.to(`chat:${data.sessionId}`).emit('chat_user_typing', {
          userId: socket.userId,
          typing: false
        })
      })

      // =============================================
      // NOTIFICATIONS
      // =============================================

      socket.on('subscribe_notifications', () => {
        socket.join('notifications')
        logger.info(`User ${socket.username} subscribed to notifications`)
      })

      socket.on('unsubscribe_notifications', () => {
        socket.leave('notifications')
        logger.info(`User ${socket.username} unsubscribed from notifications`)
      })

      // =============================================
      // DISCONNECTION
      // =============================================

      socket.on('disconnect', () => {
        logger.info(`User ${socket.username} disconnected`)
        
        if (socket.userId) {
          this.trackUserDisconnection(socket.userId, socket.id)
          this.notifyFollowersOffline(socket.userId)
        }
      })
    })
  }

  // =============================================
  // CONTENT INTERACTION HANDLERS
  // =============================================

  private async handlePostLike(socket: AuthenticatedSocket, postId: string) {
    // Check if already liked
    const { data: existingLike } = await supabase
      .from('likes')
      .select('*')
      .eq('user_id', socket.userId)
      .eq('post_id', postId)
      .single()

    if (existingLike) {
      socket.emit('error', { message: 'Post already liked' })
      return
    }

    // Add like to database
    const { data: like } = await supabase
      .from('likes')
      .insert({
        user_id: socket.userId,
        post_id: postId
      })
      .select()
      .single()

    if (!like) {
      throw new Error('Failed to create like')
    }

    // Get post author
    const { data: post } = await supabase
      .from('posts')
      .select('author_id')
      .eq('id', postId)
      .single()

    if (post) {
      // Notify post author
      this.io.to(`user:${post.author_id}`).emit('post_liked', {
        postId,
        userId: socket.userId,
        username: socket.username,
        timestamp: new Date().toISOString()
      })

      // Create notification
      await this.createNotification(post.author_id, 'like', 'Someone liked your post', {
        post_id: postId,
        actor_id: socket.userId
      })
    }

    // Broadcast to all users viewing this post
    this.io.to(`post:${postId}`).emit('post_like_update', {
      postId,
      liked: true,
      userId: socket.userId
    })

    socket.emit('post_liked', { postId })
  }

  private async handlePostUnlike(socket: AuthenticatedSocket, postId: string) {
    // Remove like from database
    await supabase
      .from('likes')
      .delete()
      .eq('user_id', socket.userId)
      .eq('post_id', postId)

    // Broadcast to all users viewing this post
    this.io.to(`post:${postId}`).emit('post_like_update', {
      postId,
      liked: false,
      userId: socket.userId
    })

    socket.emit('post_unliked', { postId })
  }

  private async handlePostComment(socket: AuthenticatedSocket, postId: string, content: string, parentId?: string) {
    // Add comment to database
    const { data: comment } = await supabase
      .from('comments')
      .insert({
        post_id: postId,
        author_id: socket.userId,
        content,
        parent_id: parentId
      })
      .select(`
        *,
        profiles!comments_author_id_fkey (
          id,
          username,
          display_name,
          avatar_url,
          is_verified
        )
      `)
      .single()

    if (!comment) {
      throw new Error('Failed to create comment')
    }

    // Get post author
    const { data: post } = await supabase
      .from('posts')
      .select('author_id')
      .eq('id', postId)
      .single()

    if (post && post.author_id !== socket.userId) {
      // Notify post author
      this.io.to(`user:${post.author_id}`).emit('post_commented', {
        postId,
        commentId: comment.id,
        userId: socket.userId,
        username: socket.username,
        content,
        timestamp: new Date().toISOString()
      })

      // Create notification
      await this.createNotification(post.author_id, 'comment', 'Someone commented on your post', {
        post_id: postId,
        comment_id: comment.id,
        actor_id: socket.userId
      })
    }

    // Broadcast to all users viewing this post
    this.io.to(`post:${postId}`).emit('new_comment', {
      postId,
      comment
    })

    socket.emit('comment_added', { postId, comment })
  }

  private async handlePostShare(socket: AuthenticatedSocket, postId: string, platform: string) {
    // Add share to database
    const { data: share } = await supabase
      .from('shares')
      .insert({
        user_id: socket.userId,
        post_id: postId,
        platform
      })
      .select()
      .single()

    if (!share) {
      throw new Error('Failed to create share')
    }

    // Get post author
    const { data: post } = await supabase
      .from('posts')
      .select('author_id')
      .eq('id', postId)
      .single()

    if (post && post.author_id !== socket.userId) {
      // Notify post author
      this.io.to(`user:${post.author_id}`).emit('post_shared', {
        postId,
        userId: socket.userId,
        username: socket.username,
        platform,
        timestamp: new Date().toISOString()
      })

      // Create notification
      await this.createNotification(post.author_id, 'share', 'Someone shared your post', {
        post_id: postId,
        actor_id: socket.userId
      })
    }

    socket.emit('post_shared', { postId, platform })
  }

  // =============================================
  // FOLLOW INTERACTION HANDLERS
  // =============================================

  private async handleUserFollow(socket: AuthenticatedSocket, targetUserId: string) {
    // Add follow to database
    const { data: follow } = await supabase
      .from('follows')
      .insert({
        follower_id: socket.userId,
        following_id: targetUserId
      })
      .select()
      .single()

    if (!follow) {
      throw new Error('Failed to create follow')
    }

    // Notify target user
    this.io.to(`user:${targetUserId}`).emit('user_followed', {
      followerId: socket.userId,
      followerUsername: socket.username,
      timestamp: new Date().toISOString()
    })

    // Create notification
    await this.createNotification(targetUserId, 'follow', 'Someone started following you', {
      actor_id: socket.userId
    })

    socket.emit('user_followed', { targetUserId })
  }

  private async handleUserUnfollow(socket: AuthenticatedSocket, targetUserId: string) {
    // Remove follow from database
    await supabase
      .from('follows')
      .delete()
      .eq('follower_id', socket.userId)
      .eq('following_id', targetUserId)

    // Notify target user
    this.io.to(`user:${targetUserId}`).emit('user_unfollowed', {
      followerId: socket.userId,
      followerUsername: socket.username,
      timestamp: new Date().toISOString()
    })

    socket.emit('user_unfollowed', { targetUserId })
  }

  // =============================================
  // LIVE STREAMING HANDLERS
  // =============================================

  private async handleJoinStream(socket: AuthenticatedSocket, streamId: string) {
    // Join stream room
    socket.join(`stream:${streamId}`)

    // Update viewer count
    const viewerCount = await this.getStreamViewerCount(streamId)
    
    // Broadcast viewer count update
    this.io.to(`stream:${streamId}`).emit('viewer_count_update', {
      streamId,
      count: viewerCount
    })

    // Get stream info
    const { data: stream } = await supabase
      .from('streams')
      .select('creator_id, title')
      .eq('id', streamId)
      .single()

    if (stream && stream.creator_id !== socket.userId) {
      // Notify streamer
      this.io.to(`user:${stream.creator_id}`).emit('viewer_joined', {
        streamId,
        viewerId: socket.userId,
        viewerUsername: socket.username,
        timestamp: new Date().toISOString()
      })
    }

    socket.emit('stream_joined', { streamId, viewerCount })
  }

  private async handleLeaveStream(socket: AuthenticatedSocket, streamId: string) {
    // Leave stream room
    socket.leave(`stream:${streamId}`)

    // Update viewer count
    const viewerCount = await this.getStreamViewerCount(streamId)
    
    // Broadcast viewer count update
    this.io.to(`stream:${streamId}`).emit('viewer_count_update', {
      streamId,
      count: viewerCount
    })

    socket.emit('stream_left', { streamId })
  }

  private async handleStreamChatMessage(socket: AuthenticatedSocket, streamId: string, message: string) {
    // Add message to database
    const { data: chatMessage } = await supabase
      .from('stream_messages')
      .insert({
        stream_id: streamId,
        user_id: socket.userId,
        message,
        message_type: 'text'
      })
      .select(`
        *,
        profiles!stream_messages_user_id_fkey (
          id,
          username,
          display_name,
          avatar_url,
          is_verified
        )
      `)
      .single()

    if (!chatMessage) {
      throw new Error('Failed to create chat message')
    }

    // Broadcast to all stream viewers
    this.io.to(`stream:${streamId}`).emit('stream_chat_message', {
      streamId,
      message: chatMessage
    })

    socket.emit('chat_message_sent', { streamId, messageId: chatMessage.id })
  }

  private async handleStreamGift(socket: AuthenticatedSocket, streamId: string, giftType: string, amount: number) {
    // Get stream info
    const { data: stream } = await supabase
      .from('streams')
      .select('creator_id')
      .eq('id', streamId)
      .single()

    if (!stream) {
      throw new Error('Stream not found')
    }

    // Create tip/gift record
    const { data: tip } = await supabase
      .from('tips')
      .insert({
        tipper_id: socket.userId,
        recipient_id: stream.creator_id,
        amount,
        context_type: 'stream',
        context_id: streamId
      })
      .select()
      .single()

    if (!tip) {
      throw new Error('Failed to create tip')
    }

    // Broadcast gift to all stream viewers
    this.io.to(`stream:${streamId}`).emit('stream_gift', {
      streamId,
      giftType,
      amount,
      tipperId: socket.userId,
      tipperUsername: socket.username,
      timestamp: new Date().toISOString()
    })

    // Notify streamer
    this.io.to(`user:${stream.creator_id}`).emit('gift_received', {
      streamId,
      giftType,
      amount,
      tipperId: socket.userId,
      tipperUsername: socket.username,
      timestamp: new Date().toISOString()
    })

    socket.emit('gift_sent', { streamId, giftType, amount })
  }

  // =============================================
  // ANONYMOUS CHAT HANDLERS
  // =============================================

  private async handleJoinChatSession(socket: AuthenticatedSocket, sessionId: string) {
    // Join chat session room
    socket.join(`chat:${sessionId}`)

    // Get session info
    const { data: session } = await supabase
      .from('chat_sessions')
      .select('participant_1_id, participant_2_id, status')
      .eq('id', sessionId)
      .single()

    if (!session || session.status !== 'active') {
      socket.emit('error', { message: 'Chat session not available' })
      return
    }

    // Notify other participant
    const otherParticipantId = session.participant_1_id === socket.userId 
      ? session.participant_2_id 
      : session.participant_1_id

    if (otherParticipantId) {
      this.io.to(`user:${otherParticipantId}`).emit('chat_user_joined', {
        sessionId,
        userId: socket.userId,
        timestamp: new Date().toISOString()
      })
    }

    socket.emit('chat_session_joined', { sessionId })
  }

  private async handleLeaveChatSession(socket: AuthenticatedSocket, sessionId: string) {
    // Leave chat session room
    socket.leave(`chat:${sessionId}`)

    // Get session info
    const { data: session } = await supabase
      .from('chat_sessions')
      .select('participant_1_id, participant_2_id')
      .eq('id', sessionId)
      .single()

    if (session) {
      // Notify other participant
      const otherParticipantId = session.participant_1_id === socket.userId 
        ? session.participant_2_id 
        : session.participant_1_id

      if (otherParticipantId) {
        this.io.to(`user:${otherParticipantId}`).emit('chat_user_left', {
          sessionId,
          userId: socket.userId,
          timestamp: new Date().toISOString()
        })
      }
    }

    socket.emit('chat_session_left', { sessionId })
  }

  private async handleChatMessage(socket: AuthenticatedSocket, sessionId: string, message: string, type: string) {
    // Add message to database
    const { data: chatMessage } = await supabase
      .from('chat_messages')
      .insert({
        session_id: sessionId,
        sender_id: socket.userId,
        message,
        message_type: type
      })
      .select()
      .single()

    if (!chatMessage) {
      throw new Error('Failed to create chat message')
    }

    // Broadcast to all session participants
    this.io.to(`chat:${sessionId}`).emit('chat_message', {
      sessionId,
      message: chatMessage
    })

    socket.emit('chat_message_sent', { sessionId, messageId: chatMessage.id })
  }

  // =============================================
  // UTILITY METHODS
  // =============================================

  private trackUserConnection(userId: string, socketId: string) {
    if (!this.connectedUsers.has(userId)) {
      this.connectedUsers.set(userId, new Set())
    }
    this.connectedUsers.get(userId)!.add(socketId)
    this.userSockets.set(socketId, userId)
  }

  private trackUserDisconnection(userId: string, socketId: string) {
    const userSockets = this.connectedUsers.get(userId)
    if (userSockets) {
      userSockets.delete(socketId)
      if (userSockets.size === 0) {
        this.connectedUsers.delete(userId)
      }
    }
    this.userSockets.delete(socketId)
  }

  private async notifyFollowersOnline(userId: string) {
    // Get followers
    const { data: followers } = await supabase
      .from('follows')
      .select('follower_id')
      .eq('following_id', userId)

    if (followers) {
      followers.forEach(follower => {
        this.io.to(`user:${follower.follower_id}`).emit('user_online', {
          userId,
          timestamp: new Date().toISOString()
        })
      })
    }
  }

  private async notifyFollowersOffline(userId: string) {
    // Get followers
    const { data: followers } = await supabase
      .from('follows')
      .select('follower_id')
      .eq('following_id', userId)

    if (followers) {
      followers.forEach(follower => {
        this.io.to(`user:${follower.follower_id}`).emit('user_offline', {
          userId,
          timestamp: new Date().toISOString()
        })
      })
    }
  }

  private async getStreamViewerCount(streamId: string): Promise<number> {
    const room = this.io.sockets.adapter.rooms.get(`stream:${streamId}`)
    return room ? room.size : 0
  }

  private async createNotification(userId: string, type: string, title: string, context: any) {
    const { data: notification } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        title,
        message: title,
        context_type: Object.keys(context)[0],
        context_id: Object.values(context)[0],
        actor_id: context.actor_id
      })
      .select()
      .single()

    if (notification) {
      // Send real-time notification
      this.io.to(`user:${userId}`).emit('notification', notification)
    }
  }

  // =============================================
  // PUBLIC METHODS
  // =============================================

  public sendNotificationToUser(userId: string, notification: any) {
    this.io.to(`user:${userId}`).emit('notification', notification)
  }

  public sendNotificationToRoom(room: string, notification: any) {
    this.io.to(room).emit('notification', notification)
  }

  public broadcastToAll(event: string, data: any) {
    this.io.emit(event, data)
  }

  public getConnectedUsersCount(): number {
    return this.connectedUsers.size
  }

  public isUserOnline(userId: string): boolean {
    return this.connectedUsers.has(userId)
  }
}

export default RealtimeService
