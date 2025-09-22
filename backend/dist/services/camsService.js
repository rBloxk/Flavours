"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.camsService = void 0;
const supabase_1 = require("../config/supabase");
const logger_1 = require("../utils/logger");
class CamsService {
    async createStream(data) {
        try {
            const { data: stream, error } = await supabase_1.supabase
                .from('streams')
                .insert({
                creator_id: data.creatorId,
                user_id: data.userId,
                title: data.title,
                description: data.description,
                category: data.category,
                tags: data.tags,
                privacy: data.privacy,
                price: data.price,
                quality: data.quality,
                bitrate: data.bitrate,
                fps: data.fps,
                audio_quality: data.audioQuality,
                status: 'draft'
            })
                .select(`
          *,
          creators!inner (
            id,
            user_id,
            profiles!inner (
              username,
              display_name,
              avatar_url
            )
          )
        `)
                .single();
            if (error) {
                logger_1.logger.error('Create stream error:', error);
                throw new Error('Failed to create stream');
            }
            return this.mapStreamData(stream);
        }
        catch (error) {
            logger_1.logger.error('CamsService.createStream error:', error);
            throw error;
        }
    }
    async getLiveStreams(options) {
        try {
            let query = supabase_1.supabase
                .from('streams')
                .select(`
          *,
          creators!inner (
            id,
            user_id,
            profiles!inner (
              username,
              display_name,
              avatar_url
            )
          )
        `)
                .eq('status', 'live')
                .order('created_at', { ascending: false });
            if (options.category) {
                query = query.eq('category', options.category);
            }
            if (options.search) {
                query = query.or(`title.ilike.%${options.search}%,description.ilike.%${options.search}%`);
            }
            const { data: streams, error } = await query
                .range(options.offset, options.offset + options.limit - 1);
            if (error) {
                logger_1.logger.error('Get live streams error:', error);
                throw new Error('Failed to fetch live streams');
            }
            return streams.map(stream => this.mapStreamData(stream));
        }
        catch (error) {
            logger_1.logger.error('CamsService.getLiveStreams error:', error);
            throw error;
        }
    }
    async getStreamById(id) {
        try {
            const { data: stream, error } = await supabase_1.supabase
                .from('streams')
                .select(`
          *,
          creators!inner (
            id,
            user_id,
            profiles!inner (
              username,
              display_name,
              avatar_url
            )
          )
        `)
                .eq('id', id)
                .single();
            if (error) {
                if (error.code === 'PGRST116') {
                    return null;
                }
                logger_1.logger.error('Get stream by ID error:', error);
                throw new Error('Failed to fetch stream');
            }
            return this.mapStreamData(stream);
        }
        catch (error) {
            logger_1.logger.error('CamsService.getStreamById error:', error);
            throw error;
        }
    }
    async updateStreamSettings(streamId, userId, updates) {
        try {
            const { data: stream } = await supabase_1.supabase
                .from('streams')
                .select('user_id')
                .eq('id', streamId)
                .single();
            if (!stream || stream.user_id !== userId) {
                throw new Error('Unauthorized to update stream');
            }
            const { data: updatedStream, error } = await supabase_1.supabase
                .from('streams')
                .update({
                title: updates.title,
                description: updates.description,
                category: updates.category,
                tags: updates.tags,
                privacy: updates.privacy,
                price: updates.price,
                quality: updates.quality,
                bitrate: updates.bitrate,
                fps: updates.fps,
                audio_quality: updates.audioQuality
            })
                .eq('id', streamId)
                .select(`
          *,
          creators!inner (
            id,
            user_id,
            profiles!inner (
              username,
              display_name,
              avatar_url
            )
          )
        `)
                .single();
            if (error) {
                logger_1.logger.error('Update stream settings error:', error);
                throw new Error('Failed to update stream settings');
            }
            return this.mapStreamData(updatedStream);
        }
        catch (error) {
            logger_1.logger.error('CamsService.updateStreamSettings error:', error);
            throw error;
        }
    }
    async startStream(streamId, userId) {
        try {
            const { data: stream } = await supabase_1.supabase
                .from('streams')
                .select('user_id, status')
                .eq('id', streamId)
                .single();
            if (!stream || stream.user_id !== userId) {
                throw new Error('Unauthorized to start stream');
            }
            if (stream.status !== 'draft') {
                throw new Error('Stream is not in draft status');
            }
            const { data: updatedStream, error } = await supabase_1.supabase
                .from('streams')
                .update({
                status: 'live',
                start_time: new Date().toISOString()
            })
                .eq('id', streamId)
                .select(`
          *,
          creators!inner (
            id,
            user_id,
            profiles!inner (
              username,
              display_name,
              avatar_url
            )
          )
        `)
                .single();
            if (error) {
                logger_1.logger.error('Start stream error:', error);
                throw new Error('Failed to start stream');
            }
            return this.mapStreamData(updatedStream);
        }
        catch (error) {
            logger_1.logger.error('CamsService.startStream error:', error);
            throw error;
        }
    }
    async stopStream(streamId, userId) {
        try {
            const { data: stream } = await supabase_1.supabase
                .from('streams')
                .select('user_id, status')
                .eq('id', streamId)
                .single();
            if (!stream || stream.user_id !== userId) {
                throw new Error('Unauthorized to stop stream');
            }
            if (stream.status !== 'live') {
                throw new Error('Stream is not live');
            }
            const { data: updatedStream, error } = await supabase_1.supabase
                .from('streams')
                .update({
                status: 'ended',
                end_time: new Date().toISOString()
            })
                .eq('id', streamId)
                .select(`
          *,
          creators!inner (
            id,
            user_id,
            profiles!inner (
              username,
              display_name,
              avatar_url
            )
          )
        `)
                .single();
            if (error) {
                logger_1.logger.error('Stop stream error:', error);
                throw new Error('Failed to stop stream');
            }
            return this.mapStreamData(updatedStream);
        }
        catch (error) {
            logger_1.logger.error('CamsService.stopStream error:', error);
            throw error;
        }
    }
    async joinStream(streamId, userId) {
        try {
            const { data: stream } = await supabase_1.supabase
                .from('streams')
                .select('status, privacy, creator_id')
                .eq('id', streamId)
                .single();
            if (!stream || stream.status !== 'live') {
                throw new Error('Stream is not available');
            }
            const { data: ban } = await supabase_1.supabase
                .from('stream_bans')
                .select('id')
                .eq('stream_id', streamId)
                .eq('user_id', userId)
                .single();
            if (ban) {
                throw new Error('You are banned from this stream');
            }
            if (stream.privacy === 'followers') {
                const { data: subscription } = await supabase_1.supabase
                    .from('subscriptions')
                    .select('id')
                    .eq('creator_id', stream.creator_id)
                    .eq('user_id', userId)
                    .eq('status', 'active')
                    .single();
                if (!subscription) {
                    throw new Error('You must be subscribed to view this stream');
                }
            }
            const { data: viewer, error } = await supabase_1.supabase
                .from('stream_viewers')
                .insert({
                stream_id: streamId,
                user_id: userId,
                joined_at: new Date().toISOString(),
                last_seen: new Date().toISOString()
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
                logger_1.logger.error('Join stream error:', error);
                throw new Error('Failed to join stream');
            }
            return this.mapViewerData(viewer);
        }
        catch (error) {
            logger_1.logger.error('CamsService.joinStream error:', error);
            throw error;
        }
    }
    async leaveStream(streamId, userId) {
        try {
            const { error } = await supabase_1.supabase
                .from('stream_viewers')
                .delete()
                .eq('stream_id', streamId)
                .eq('user_id', userId);
            if (error) {
                logger_1.logger.error('Leave stream error:', error);
                throw new Error('Failed to leave stream');
            }
        }
        catch (error) {
            logger_1.logger.error('CamsService.leaveStream error:', error);
            throw error;
        }
    }
    async getStreamViewers(streamId, userId) {
        try {
            const { data: stream } = await supabase_1.supabase
                .from('streams')
                .select('user_id')
                .eq('id', streamId)
                .single();
            if (!stream || stream.user_id !== userId) {
                throw new Error('Unauthorized to view stream viewers');
            }
            const { data: viewers, error } = await supabase_1.supabase
                .from('stream_viewers')
                .select(`
          *,
          profiles!inner (
            username,
            display_name,
            avatar_url
          )
        `)
                .eq('stream_id', streamId)
                .order('joined_at', { ascending: false });
            if (error) {
                logger_1.logger.error('Get stream viewers error:', error);
                throw new Error('Failed to fetch stream viewers');
            }
            return viewers.map(viewer => this.mapViewerData(viewer));
        }
        catch (error) {
            logger_1.logger.error('CamsService.getStreamViewers error:', error);
            throw error;
        }
    }
    async sendGift(data) {
        try {
            const { data: gift, error } = await supabase_1.supabase
                .from('stream_gifts')
                .insert({
                stream_id: data.streamId,
                user_id: data.userId,
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
                logger_1.logger.error('Send gift error:', error);
                throw new Error('Failed to send gift');
            }
            return this.mapGiftData(gift);
        }
        catch (error) {
            logger_1.logger.error('CamsService.sendGift error:', error);
            throw error;
        }
    }
    async getStreamChat(streamId, options) {
        try {
            const { data: messages, error } = await supabase_1.supabase
                .from('stream_chat')
                .select(`
          *,
          profiles!inner (
            username,
            display_name,
            avatar_url
          )
        `)
                .eq('stream_id', streamId)
                .order('created_at', { ascending: false })
                .range(options.offset, options.offset + options.limit - 1);
            if (error) {
                logger_1.logger.error('Get stream chat error:', error);
                throw new Error('Failed to fetch chat messages');
            }
            return messages.map(message => this.mapChatMessageData(message));
        }
        catch (error) {
            logger_1.logger.error('CamsService.getStreamChat error:', error);
            throw error;
        }
    }
    async sendChatMessage(data) {
        try {
            const { data: ban } = await supabase_1.supabase
                .from('stream_bans')
                .select('id')
                .eq('stream_id', data.streamId)
                .eq('user_id', data.userId)
                .single();
            if (ban) {
                throw new Error('You are banned from this stream');
            }
            const { data: chatMessage, error } = await supabase_1.supabase
                .from('stream_chat')
                .insert({
                stream_id: data.streamId,
                user_id: data.userId,
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
                logger_1.logger.error('Send chat message error:', error);
                throw new Error('Failed to send chat message');
            }
            return this.mapChatMessageData(chatMessage);
        }
        catch (error) {
            logger_1.logger.error('CamsService.sendChatMessage error:', error);
            throw error;
        }
    }
    async startRecording(streamId, userId) {
        try {
            const { data: stream } = await supabase_1.supabase
                .from('streams')
                .select('user_id, status')
                .eq('id', streamId)
                .single();
            if (!stream || stream.user_id !== userId) {
                throw new Error('Unauthorized to record stream');
            }
            if (stream.status !== 'live') {
                throw new Error('Stream must be live to start recording');
            }
            const { data: recording, error } = await supabase_1.supabase
                .from('stream_recordings')
                .insert({
                stream_id: streamId,
                title: `Recording - ${new Date().toLocaleString()}`,
                status: 'recording',
                start_time: new Date().toISOString()
            })
                .select()
                .single();
            if (error) {
                logger_1.logger.error('Start recording error:', error);
                throw new Error('Failed to start recording');
            }
            return this.mapRecordingData(recording);
        }
        catch (error) {
            logger_1.logger.error('CamsService.startRecording error:', error);
            throw error;
        }
    }
    async stopRecording(streamId, userId) {
        try {
            const { data: stream } = await supabase_1.supabase
                .from('streams')
                .select('user_id')
                .eq('id', streamId)
                .single();
            if (!stream || stream.user_id !== userId) {
                throw new Error('Unauthorized to stop recording');
            }
            const { data: recording, error } = await supabase_1.supabase
                .from('stream_recordings')
                .update({
                status: 'completed',
                end_time: new Date().toISOString()
            })
                .eq('stream_id', streamId)
                .eq('status', 'recording')
                .select()
                .single();
            if (error) {
                logger_1.logger.error('Stop recording error:', error);
                throw new Error('Failed to stop recording');
            }
            return this.mapRecordingData(recording);
        }
        catch (error) {
            logger_1.logger.error('CamsService.stopRecording error:', error);
            throw error;
        }
    }
    async getStreamRecordings(streamId, userId) {
        try {
            const { data: stream } = await supabase_1.supabase
                .from('streams')
                .select('user_id')
                .eq('id', streamId)
                .single();
            if (!stream || stream.user_id !== userId) {
                throw new Error('Unauthorized to view stream recordings');
            }
            const { data: recordings, error } = await supabase_1.supabase
                .from('stream_recordings')
                .select('*')
                .eq('stream_id', streamId)
                .order('created_at', { ascending: false });
            if (error) {
                logger_1.logger.error('Get stream recordings error:', error);
                throw new Error('Failed to fetch recordings');
            }
            return recordings.map(recording => this.mapRecordingData(recording));
        }
        catch (error) {
            logger_1.logger.error('CamsService.getStreamRecordings error:', error);
            throw error;
        }
    }
    async getStreamAnalytics(streamId, userId) {
        try {
            const { data: stream } = await supabase_1.supabase
                .from('streams')
                .select('user_id')
                .eq('id', streamId)
                .single();
            if (!stream || stream.user_id !== userId) {
                throw new Error('Unauthorized to view stream analytics');
            }
            const { data: streamData } = await supabase_1.supabase
                .from('streams')
                .select('start_time, end_time')
                .eq('id', streamId)
                .single();
            const { data: viewers } = await supabase_1.supabase
                .from('stream_viewers')
                .select('joined_at, last_seen')
                .eq('stream_id', streamId);
            const { data: gifts } = await supabase_1.supabase
                .from('stream_gifts')
                .select('amount, created_at')
                .eq('stream_id', streamId);
            const { data: messages } = await supabase_1.supabase
                .from('stream_chat')
                .select('created_at')
                .eq('stream_id', streamId);
            const totalViewers = viewers?.length || 0;
            const peakViewers = totalViewers;
            const averageViewers = totalViewers;
            const totalDuration = streamData ?
                new Date(streamData.end_time || new Date()).getTime() - new Date(streamData.start_time).getTime() : 0;
            const totalGifts = gifts?.reduce((sum, gift) => sum + gift.amount, 0) || 0;
            const totalTips = 0;
            const totalChatMessages = messages?.length || 0;
            const engagementRate = totalViewers > 0 ? (totalChatMessages + totalGifts) / totalViewers : 0;
            const retentionRate = 0.75;
            const analytics = {
                streamId,
                totalViewers,
                peakViewers,
                averageViewers,
                totalDuration,
                totalGifts,
                totalTips,
                totalChatMessages,
                engagementRate,
                retentionRate,
                demographics: {
                    ageGroups: { '18-24': 40, '25-34': 35, '35-44': 20, '45+': 5 },
                    locations: { 'US': 60, 'UK': 20, 'CA': 10, 'Other': 10 },
                    devices: { 'Mobile': 70, 'Desktop': 25, 'Tablet': 5 }
                },
                timeline: []
            };
            return analytics;
        }
        catch (error) {
            logger_1.logger.error('CamsService.getStreamAnalytics error:', error);
            throw error;
        }
    }
    async reportStream(data) {
        try {
            const { data: report, error } = await supabase_1.supabase
                .from('stream_reports')
                .insert({
                stream_id: data.streamId,
                reporter_id: data.reporterId,
                reason: data.reason,
                description: data.description,
                status: 'pending'
            })
                .select()
                .single();
            if (error) {
                logger_1.logger.error('Report stream error:', error);
                throw new Error('Failed to report stream');
            }
            return this.mapReportData(report);
        }
        catch (error) {
            logger_1.logger.error('CamsService.reportStream error:', error);
            throw error;
        }
    }
    async banViewer(streamId, userId, viewerId, reason) {
        try {
            const { data: stream } = await supabase_1.supabase
                .from('streams')
                .select('user_id')
                .eq('id', streamId)
                .single();
            if (!stream || stream.user_id !== userId) {
                throw new Error('Unauthorized to ban viewers');
            }
            const { error } = await supabase_1.supabase
                .from('stream_bans')
                .insert({
                stream_id: streamId,
                user_id: viewerId,
                banned_by: userId,
                reason: reason || 'Violation of stream rules'
            });
            if (error) {
                logger_1.logger.error('Ban viewer error:', error);
                throw new Error('Failed to ban viewer');
            }
        }
        catch (error) {
            logger_1.logger.error('CamsService.banViewer error:', error);
            throw error;
        }
    }
    async promoteToModerator(streamId, userId, viewerId) {
        try {
            const { data: stream } = await supabase_1.supabase
                .from('streams')
                .select('user_id')
                .eq('id', streamId)
                .single();
            if (!stream || stream.user_id !== userId) {
                throw new Error('Unauthorized to promote moderators');
            }
            const { error } = await supabase_1.supabase
                .from('stream_moderators')
                .insert({
                stream_id: streamId,
                user_id: viewerId,
                promoted_by: userId
            });
            if (error) {
                logger_1.logger.error('Promote moderator error:', error);
                throw new Error('Failed to promote moderator');
            }
        }
        catch (error) {
            logger_1.logger.error('CamsService.promoteToModerator error:', error);
            throw error;
        }
    }
    mapStreamData(data) {
        return {
            id: data.id,
            creatorId: data.creator_id,
            userId: data.user_id,
            title: data.title,
            description: data.description,
            category: data.category,
            tags: data.tags,
            privacy: data.privacy,
            price: data.price,
            quality: data.quality,
            bitrate: data.bitrate,
            fps: data.fps,
            audioQuality: data.audio_quality,
            status: data.status,
            viewerCount: 0,
            isLive: data.status === 'live',
            startTime: data.start_time,
            endTime: data.end_time,
            createdAt: data.created_at,
            updatedAt: data.updated_at
        };
    }
    mapViewerData(data) {
        return {
            id: data.id,
            userId: data.user_id,
            streamId: data.stream_id,
            joinedAt: data.joined_at,
            lastSeen: data.last_seen,
            isModerator: data.is_moderator || false,
            isBanned: data.is_banned || false,
            profile: {
                username: data.profiles.username,
                displayName: data.profiles.display_name,
                avatarUrl: data.profiles.avatar_url
            }
        };
    }
    mapChatMessageData(data) {
        return {
            id: data.id,
            streamId: data.stream_id,
            userId: data.user_id,
            message: data.message,
            timestamp: data.created_at,
            isModerator: data.is_moderator || false,
            profile: {
                username: data.profiles.username,
                displayName: data.profiles.display_name,
                avatarUrl: data.profiles.avatar_url
            }
        };
    }
    mapRecordingData(data) {
        return {
            id: data.id,
            streamId: data.stream_id,
            title: data.title,
            duration: data.duration || 0,
            fileSize: data.file_size || 0,
            url: data.url || '',
            thumbnailUrl: data.thumbnail_url,
            createdAt: data.created_at
        };
    }
    mapGiftData(data) {
        return {
            id: data.id,
            streamId: data.stream_id,
            userId: data.user_id,
            giftType: data.gift_type,
            amount: data.amount,
            message: data.message,
            createdAt: data.created_at,
            profile: {
                username: data.profiles.username,
                displayName: data.profiles.display_name,
                avatarUrl: data.profiles.avatar_url
            }
        };
    }
    mapReportData(data) {
        return {
            id: data.id,
            streamId: data.stream_id,
            reporterId: data.reporter_id,
            reason: data.reason,
            description: data.description,
            status: data.status,
            createdAt: data.created_at
        };
    }
}
exports.camsService = new CamsService();
//# sourceMappingURL=camsService.js.map