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
                socket.data.authenticatedAt = new Date();
                socket.join(`user:${user.id}`);
                socket.join(`notifications:${user.id}`);
                const connectionData = {
                    socketId: socket.id,
                    authenticatedAt: new Date().toISOString(),
                    userAgent: socket.handshake.headers['user-agent'],
                    ip: socket.handshake.address
                };
                await redis_1.redisManager.setex(`user_connection:${user.id}`, 3600, JSON.stringify(connectionData));
                await updateUserPresence(user.id, 'online', 'authenticated');
                await sendPendingNotifications(user.id, socket);
                socket.emit('authenticated', {
                    userId: user.id,
                    timestamp: new Date().toISOString(),
                    features: ['realtime_chat', 'notifications', 'presence', 'analytics']
                });
                logger_1.logger.info(`User authenticated: ${user.id} with enhanced features`);
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
        socket.on('subscribe_notifications', async (preferences) => {
            if (socket.data.userId) {
                socket.join(`notifications:${socket.data.userId}`);
                if (preferences) {
                    await redis_1.redisManager.setex(`notification_prefs:${socket.data.userId}`, 86400, JSON.stringify(preferences));
                }
                logger_1.logger.info(`User ${socket.data.userId} subscribed to notifications with preferences`);
            }
        });
        socket.on('unsubscribe_notifications', () => {
            if (socket.data.userId) {
                socket.leave(`notifications:${socket.data.userId}`);
                logger_1.logger.info(`User ${socket.data.userId} unsubscribed from notifications`);
            }
        });
        socket.on('mark_notification_read', async (notificationId) => {
            try {
                if (!socket.data.userId)
                    return;
                const { error } = await supabase_1.supabase
                    .from('notifications')
                    .update({ read: true, read_at: new Date().toISOString() })
                    .eq('id', notificationId)
                    .eq('user_id', socket.data.userId);
                if (error) {
                    socket.emit('error', { error: 'Failed to mark notification as read' });
                    return;
                }
                socket.emit('notification_read', { notificationId });
                logger_1.logger.info(`Notification ${notificationId} marked as read by user ${socket.data.userId}`);
            }
            catch (error) {
                logger_1.logger.error('Mark notification read error:', error);
                socket.emit('error', { error: 'Failed to mark notification as read' });
            }
        });
        socket.on('get_notification_stats', async () => {
            try {
                if (!socket.data.userId)
                    return;
                const { data: stats, error } = await supabase_1.supabase
                    .from('notifications')
                    .select('type, read, created_at')
                    .eq('user_id', socket.data.userId)
                    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
                if (error) {
                    socket.emit('error', { error: 'Failed to get notification stats' });
                    return;
                }
                const analytics = {
                    total: stats.length,
                    unread: stats.filter(n => !n.read).length,
                    byType: stats.reduce((acc, n) => {
                        acc[n.type] = (acc[n.type] || 0) + 1;
                        return acc;
                    }, {}),
                    readRate: stats.length > 0 ? (stats.filter(n => n.read).length / stats.length) * 100 : 0
                };
                socket.emit('notification_stats', analytics);
            }
            catch (error) {
                logger_1.logger.error('Get notification stats error:', error);
                socket.emit('error', { error: 'Failed to get notification stats' });
            }
        });
        socket.on('update_presence', async (data) => {
            try {
                if (!socket.data.userId)
                    return;
                const presenceData = {
                    userId: socket.data.userId,
                    status: data.status,
                    lastSeen: new Date(),
                    currentActivity: data.activity
                };
                await redis_1.redisManager.setex(`user_presence:${socket.data.userId}`, 300, JSON.stringify(presenceData));
                if (data.activity) {
                    await redis_1.redisManager.lpush(`user_activity:${socket.data.userId}`, JSON.stringify({
                        activity: data.activity,
                        timestamp: new Date().toISOString(),
                        location: data.location
                    }));
                    await redis_1.redisManager.ltrim(`user_activity:${socket.data.userId}`, 0, 99);
                }
                io.to(`user:${socket.data.userId}`).emit('presence_update', presenceData);
                await notifyFollowersOfPresenceChange(socket.data.userId, presenceData);
                logger_1.logger.info(`User ${socket.data.userId} presence updated: ${data.status} (${data.activity})`);
            }
            catch (error) {
                logger_1.logger.error('Update presence error:', error);
            }
        });
        socket.on('get_activity_history', async (limit = 50) => {
            try {
                if (!socket.data.userId)
                    return;
                const activities = await redis_1.redisManager.lrange(`user_activity:${socket.data.userId}`, 0, limit - 1);
                const parsedActivities = activities.map(activity => JSON.parse(activity));
                socket.emit('activity_history', parsedActivities);
            }
            catch (error) {
                logger_1.logger.error('Get activity history error:', error);
                socket.emit('error', { error: 'Failed to get activity history' });
            }
        });
        socket.on('get_online_connections', async () => {
            try {
                if (!socket.data.userId)
                    return;
                const { data: connections, error } = await supabase_1.supabase
                    .from('subscriptions')
                    .select('creator_id')
                    .eq('user_id', socket.data.userId)
                    .eq('status', 'active');
                if (error) {
                    socket.emit('error', { error: 'Failed to get connections' });
                    return;
                }
                const connectionIds = connections.map(c => c.creator_id);
                const onlineConnections = [];
                for (const connectionId of connectionIds) {
                    const presenceData = await redis_1.redisManager.get(`user_presence:${connectionId}`);
                    if (presenceData) {
                        const presence = JSON.parse(presenceData);
                        if (presence.status === 'online') {
                            onlineConnections.push(presence);
                        }
                    }
                }
                socket.emit('online_connections', onlineConnections);
            }
            catch (error) {
                logger_1.logger.error('Get online connections error:', error);
                socket.emit('error', { error: 'Failed to get online connections' });
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
    const updateUserPresence = async (userId, status, activity) => {
        try {
            const presenceData = {
                userId,
                status: status,
                lastSeen: new Date(),
                currentActivity: activity
            };
            await redis_1.redisManager.setex(`user_presence:${userId}`, 300, JSON.stringify(presenceData));
            await supabase_1.supabase
                .from('user_presence')
                .upsert({
                user_id: userId,
                status,
                last_seen: new Date().toISOString(),
                current_activity: activity
            });
        }
        catch (error) {
            logger_1.logger.error('Update user presence error:', error);
        }
    };
    const sendPendingNotifications = async (userId, socket) => {
        try {
            const { data: notifications, error } = await supabase_1.supabase
                .from('notifications')
                .select('*')
                .eq('user_id', userId)
                .eq('read', false)
                .order('created_at', { ascending: false })
                .limit(10);
            if (error) {
                logger_1.logger.error('Get pending notifications error:', error);
                return;
            }
            notifications.forEach(notification => {
                socket.emit('notification', notification);
            });
            logger_1.logger.info(`Sent ${notifications.length} pending notifications to user ${userId}`);
        }
        catch (error) {
            logger_1.logger.error('Send pending notifications error:', error);
        }
    };
    const notifyFollowersOfPresenceChange = async (userId, presence) => {
        try {
            const { data: followers, error } = await supabase_1.supabase
                .from('subscriptions')
                .select('user_id')
                .eq('creator_id', userId)
                .eq('status', 'active');
            if (error || !followers.length)
                return;
            const followerIds = followers.map(f => f.user_id);
            followerIds.forEach(followerId => {
                io.to(`user:${followerId}`).emit('connection_presence_update', {
                    userId,
                    presence
                });
            });
            logger_1.logger.info(`Notified ${followerIds.length} followers of presence change for user ${userId}`);
        }
        catch (error) {
            logger_1.logger.error('Notify followers of presence change error:', error);
        }
    };
    const createNotification = async (notification) => {
        try {
            const { data, error } = await supabase_1.supabase
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
                .single();
            if (error) {
                logger_1.logger.error('Create notification error:', error);
                return null;
            }
            io.to(`user:${notification.userId}`).emit('notification', data);
            io.to(`notifications:${notification.userId}`).emit('notification', data);
            return data;
        }
        catch (error) {
            logger_1.logger.error('Create notification error:', error);
            return null;
        }
    };
    const getRealtimeAnalytics = async () => {
        try {
            const onlineUsers = await getOnlineUsersCount();
            const activeStreams = await redis_1.redisManager.keys('stream_viewers:*');
            const totalConnections = await redis_1.redisManager.keys('user_connection:*');
            const systemHealth = onlineUsers > 1000 ? 'warning' :
                onlineUsers > 5000 ? 'critical' : 'healthy';
            return {
                onlineUsers,
                activeStreams: activeStreams.length,
                totalConnections: totalConnections.length,
                systemHealth
            };
        }
        catch (error) {
            logger_1.logger.error('Get realtime analytics error:', error);
            return {
                onlineUsers: 0,
                activeStreams: 0,
                totalConnections: 0,
                systemHealth: 'critical'
            };
        }
    };
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
    };
}
//# sourceMappingURL=index.js.map