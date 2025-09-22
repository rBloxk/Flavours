"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupWebSocket = setupWebSocket;
const logger_1 = require("../utils/logger");
const supabase_1 = require("../config/supabase");
const redis_1 = require("../config/redis");
function setupWebSocket(io) {
    io.on('connection', (socket) => {
        logger_1.logger.info(`WebSocket client connected: ${socket.id}`);
        socket.on('authenticate', async (token) => {
            try {
                const { data: { user }, error } = await supabase_1.supabase.auth.getUser(token);
                if (error || !user) {
                    socket.emit('auth_error', { error: 'Invalid token' });
                    return;
                }
                socket.data.userId = user.id;
                socket.data.userToken = token;
                socket.join(`user:${user.id}`);
                await redis_1.redisManager.setex(`user_connection:${user.id}`, 3600, socket.id);
                socket.emit('authenticated', { userId: user.id });
                logger_1.logger.info(`User authenticated: ${user.id}`);
            }
            catch (error) {
                logger_1.logger.error('WebSocket auth error:', error);
                socket.emit('auth_error', { error: 'Authentication failed' });
            }
        });
        socket.on('join_creator_room', (creatorId) => {
            if (socket.data.userId) {
                socket.join(`creator:${creatorId}`);
                logger_1.logger.info(`User ${socket.data.userId} joined creator room: ${creatorId}`);
            }
        });
        socket.on('send_message', async (data) => {
            try {
                if (!socket.data.userId) {
                    socket.emit('error', { error: 'Not authenticated' });
                    return;
                }
                const { data: message, error } = await supabase_1.supabase
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
                    .single();
                if (error) {
                    socket.emit('error', { error: 'Failed to send message' });
                    return;
                }
                io.to(`user:${data.recipientId}`).emit('new_message', message);
                socket.emit('message_sent', message);
                logger_1.logger.info(`Message sent from ${socket.data.userId} to ${data.recipientId}`);
            }
            catch (error) {
                logger_1.logger.error('Send message error:', error);
                socket.emit('error', { error: 'Failed to send message' });
            }
        });
        socket.on('typing_start', (recipientId) => {
            if (socket.data.userId) {
                io.to(`user:${recipientId}`).emit('user_typing', {
                    userId: socket.data.userId,
                    typing: true
                });
            }
        });
        socket.on('typing_stop', (recipientId) => {
            if (socket.data.userId) {
                io.to(`user:${recipientId}`).emit('user_typing', {
                    userId: socket.data.userId,
                    typing: false
                });
            }
        });
        socket.on('join_stream', async (streamId) => {
            try {
                if (!socket.data.userId) {
                    socket.emit('error', { error: 'Not authenticated' });
                    return;
                }
                socket.join(`stream:${streamId}`);
                const viewerCount = await updateStreamViewerCount(streamId, 1);
                io.to(`stream:${streamId}`).emit('viewer_count_update', { count: viewerCount });
                logger_1.logger.info(`User ${socket.data.userId} joined stream: ${streamId}`);
            }
            catch (error) {
                logger_1.logger.error('Join stream error:', error);
                socket.emit('error', { error: 'Failed to join stream' });
            }
        });
        socket.on('leave_stream', async (streamId) => {
            try {
                if (!socket.data.userId)
                    return;
                socket.leave(`stream:${streamId}`);
                const viewerCount = await updateStreamViewerCount(streamId, -1);
                io.to(`stream:${streamId}`).emit('viewer_count_update', { count: viewerCount });
                logger_1.logger.info(`User ${socket.data.userId} left stream: ${streamId}`);
            }
            catch (error) {
                logger_1.logger.error('Leave stream error:', error);
            }
        });
        socket.on('stream_chat_message', async (data) => {
            try {
                if (!socket.data.userId) {
                    socket.emit('error', { error: 'Not authenticated' });
                    return;
                }
                const { data: chatMessage, error } = await supabase_1.supabase
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
                    .single();
                if (error) {
                    socket.emit('error', { error: 'Failed to send chat message' });
                    return;
                }
                io.to(`stream:${data.streamId}`).emit('stream_chat_message', chatMessage);
                logger_1.logger.info(`Stream chat message sent in stream ${data.streamId}`);
            }
            catch (error) {
                logger_1.logger.error('Stream chat message error:', error);
                socket.emit('error', { error: 'Failed to send chat message' });
            }
        });
        socket.on('send_stream_gift', async (data) => {
            try {
                if (!socket.data.userId) {
                    socket.emit('error', { error: 'Not authenticated' });
                    return;
                }
                const { data: gift, error } = await supabase_1.supabase
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
                    .single();
                if (error) {
                    socket.emit('error', { error: 'Failed to send gift' });
                    return;
                }
                io.to(`stream:${data.streamId}`).emit('stream_gift', gift);
                logger_1.logger.info(`Gift sent in stream ${data.streamId}`);
            }
            catch (error) {
                logger_1.logger.error('Send stream gift error:', error);
                socket.emit('error', { error: 'Failed to send gift' });
            }
        });
        socket.on('join_chat_session', async (sessionId) => {
            try {
                if (!socket.data.userId) {
                    socket.emit('error', { error: 'Not authenticated' });
                    return;
                }
                socket.join(`chat_session:${sessionId}`);
                logger_1.logger.info(`User ${socket.data.userId} joined chat session: ${sessionId}`);
            }
            catch (error) {
                logger_1.logger.error('Join chat session error:', error);
                socket.emit('error', { error: 'Failed to join chat session' });
            }
        });
        socket.on('leave_chat_session', (sessionId) => {
            socket.leave(`chat_session:${sessionId}`);
            logger_1.logger.info(`User ${socket.data.userId} left chat session: ${sessionId}`);
        });
        socket.on('chat_message', async (data) => {
            try {
                if (!socket.data.userId) {
                    socket.emit('error', { error: 'Not authenticated' });
                    return;
                }
                const { data: chatMessage, error } = await supabase_1.supabase
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
                    .single();
                if (error) {
                    socket.emit('error', { error: 'Failed to send chat message' });
                    return;
                }
                io.to(`chat_session:${data.sessionId}`).emit('chat_message', chatMessage);
                logger_1.logger.info(`Chat message sent in session ${data.sessionId}`);
            }
            catch (error) {
                logger_1.logger.error('Chat message error:', error);
                socket.emit('error', { error: 'Failed to send chat message' });
            }
        });
        socket.on('chat_typing_start', (sessionId) => {
            if (socket.data.userId) {
                io.to(`chat_session:${sessionId}`).emit('chat_user_typing', {
                    userId: socket.data.userId,
                    typing: true
                });
            }
        });
        socket.on('chat_typing_stop', (sessionId) => {
            if (socket.data.userId) {
                io.to(`chat_session:${sessionId}`).emit('chat_user_typing', {
                    userId: socket.data.userId,
                    typing: false
                });
            }
        });
        socket.on('toggle_post_like', async (postId) => {
            try {
                if (!socket.data.userId) {
                    socket.emit('error', { error: 'Not authenticated' });
                    return;
                }
                const { data: result, error } = await supabase_1.supabase.rpc('toggle_post_like', {
                    post_id: postId,
                    user_id: socket.data.userId
                });
                if (error) {
                    socket.emit('error', { error: 'Failed to toggle like' });
                    return;
                }
                io.to(`post:${postId}`).emit('post_like_update', {
                    postId,
                    liked: result.liked,
                    likesCount: result.likes_count
                });
                logger_1.logger.info(`Post like toggled for post ${postId}`);
            }
            catch (error) {
                logger_1.logger.error('Toggle post like error:', error);
                socket.emit('error', { error: 'Failed to toggle like' });
            }
        });
        socket.on('join_post_room', (postId) => {
            socket.join(`post:${postId}`);
            logger_1.logger.info(`User ${socket.data.userId} joined post room: ${postId}`);
        });
        socket.on('leave_post_room', (postId) => {
            socket.leave(`post:${postId}`);
            logger_1.logger.info(`User ${socket.data.userId} left post room: ${postId}`);
        });
        socket.on('subscribe_notifications', () => {
            if (socket.data.userId) {
                socket.join(`notifications:${socket.data.userId}`);
                logger_1.logger.info(`User ${socket.data.userId} subscribed to notifications`);
            }
        });
        socket.on('unsubscribe_notifications', () => {
            if (socket.data.userId) {
                socket.leave(`notifications:${socket.data.userId}`);
                logger_1.logger.info(`User ${socket.data.userId} unsubscribed from notifications`);
            }
        });
        socket.on('update_presence', async (status) => {
            try {
                if (!socket.data.userId)
                    return;
                await redis_1.redisManager.setex(`user_presence:${socket.data.userId}`, 300, status);
                io.to(`user:${socket.data.userId}`).emit('presence_update', { status });
                logger_1.logger.info(`User ${socket.data.userId} presence updated: ${status}`);
            }
            catch (error) {
                logger_1.logger.error('Update presence error:', error);
            }
        });
        socket.on('disconnect', async () => {
            try {
                if (socket.data.userId) {
                    await redis_1.redisManager.del(`user_connection:${socket.data.userId}`);
                    await redis_1.redisManager.del(`user_presence:${socket.data.userId}`);
                    logger_1.logger.info(`WebSocket client disconnected: ${socket.id} (User: ${socket.data.userId})`);
                }
                else {
                    logger_1.logger.info(`WebSocket client disconnected: ${socket.id}`);
                }
            }
            catch (error) {
                logger_1.logger.error('Disconnect handler error:', error);
            }
        });
    });
    const updateStreamViewerCount = async (streamId, delta) => {
        try {
            const currentCount = await redis_1.redisManager.get(`stream_viewers:${streamId}`);
            const newCount = Math.max(0, (parseInt(currentCount || '0') + delta));
            await redis_1.redisManager.setex(`stream_viewers:${streamId}`, 3600, newCount.toString());
            return newCount;
        }
        catch (error) {
            logger_1.logger.error('Update stream viewer count error:', error);
            return 0;
        }
    };
    const sendNotification = (userId, notification) => {
        io.to(`user:${userId}`).emit('notification', notification);
        io.to(`notifications:${userId}`).emit('notification', notification);
    };
    const sendNotificationToUsers = (userIds, notification) => {
        userIds.forEach(userId => {
            sendNotification(userId, notification);
        });
    };
    const broadcastToStream = (streamId, event, data) => {
        io.to(`stream:${streamId}`).emit(event, data);
    };
    const broadcastToChatSession = (sessionId, event, data) => {
        io.to(`chat_session:${sessionId}`).emit(event, data);
    };
    const getOnlineUsersCount = async () => {
        try {
            const keys = await redis_1.redisManager.keys('user_connection:*');
            return keys.length;
        }
        catch (error) {
            logger_1.logger.error('Get online users count error:', error);
            return 0;
        }
    };
    return {
        io,
        sendNotification,
        sendNotificationToUsers,
        broadcastToStream,
        broadcastToChatSession,
        getOnlineUsersCount
    };
}
//# sourceMappingURL=index.js.map