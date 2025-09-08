import { Server } from 'socket.io'
import { logger } from '../utils/logger'
import { supabase } from '../config/supabase'

export function setupWebSocket(io: Server) {
  io.on('connection', (socket) => {
    logger.info(`WebSocket client connected: ${socket.id}`)

    // Authentication
    socket.on('authenticate', async (token: string) => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser(token)
        
        if (error || !user) {
          socket.emit('auth_error', { error: 'Invalid token' })
          return
        }

        socket.data.userId = user.id
        socket.join(`user:${user.id}`)
        socket.emit('authenticated', { userId: user.id })
        
        logger.info(`User authenticated: ${user.id}`)
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

    // Handle notifications
    socket.on('subscribe_notifications', () => {
      if (socket.data.userId) {
        socket.join(`notifications:${socket.data.userId}`)
      }
    })

    // Disconnect handler
    socket.on('disconnect', () => {
      logger.info(`WebSocket client disconnected: ${socket.id}`)
    })
  })

  // Helper function to send notifications
  const sendNotification = (userId: string, notification: any) => {
    io.to(`user:${userId}`).emit('notification', notification)
  }

  return io
}