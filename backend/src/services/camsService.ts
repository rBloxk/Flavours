import { supabase } from '../config/database'
import { logger } from '../utils/logger'
import { redisManager } from '../config/redis'

export interface Stream {
  id: string
  creatorId: string
  userId: string
  title: string
  description?: string
  category: string
  tags?: string[]
  privacy: 'public' | 'followers' | 'paid'
  price?: number
  quality: '480p' | '720p' | '1080p' | '4K'
  bitrate: number
  fps: number
  audioQuality: 'low' | 'medium' | 'high'
  status: 'draft' | 'live' | 'ended' | 'archived'
  viewerCount: number
  isLive: boolean
  startTime?: string
  endTime?: string
  createdAt: string
  updatedAt: string
}

export interface StreamViewer {
  id: string
  userId: string
  streamId: string
  joinedAt: string
  lastSeen: string
  isModerator: boolean
  isBanned: boolean
  profile: {
    username: string
    displayName: string
    avatarUrl?: string
  }
}

export interface ChatMessage {
  id: string
  streamId: string
  userId: string
  message: string
  timestamp: string
  isModerator: boolean
  profile: {
    username: string
    displayName: string
    avatarUrl?: string
  }
}

export interface StreamRecording {
  id: string
  streamId: string
  title: string
  duration: number
  fileSize: number
  url: string
  thumbnailUrl?: string
  createdAt: string
}

export interface StreamAnalytics {
  streamId: string
  totalViewers: number
  peakViewers: number
  averageViewers: number
  totalDuration: number
  totalGifts: number
  totalTips: number
  totalChatMessages: number
  engagementRate: number
  retentionRate: number
  demographics: {
    ageGroups: Record<string, number>
    locations: Record<string, number>
    devices: Record<string, number>
  }
  timeline: Array<{
    timestamp: string
    viewers: number
    gifts: number
    messages: number
  }>
}

export interface Gift {
  id: string
  streamId: string
  userId: string
  giftType: 'heart' | 'star' | 'crown' | 'zap'
  amount: number
  message?: string
  createdAt: string
  profile: {
    username: string
    displayName: string
    avatarUrl?: string
  }
}

export interface StreamReport {
  id: string
  streamId: string
  reporterId: string
  reason: 'inappropriate' | 'spam' | 'harassment' | 'underage' | 'other'
  description?: string
  status: 'pending' | 'under_review' | 'resolved' | 'dismissed'
  createdAt: string
}

class CamsService {
  async createStream(data: {
    creatorId: string
    userId: string
    title: string
    description?: string
    category: string
    tags?: string[]
    privacy: 'public' | 'followers' | 'paid'
    price?: number
    quality: '480p' | '720p' | '1080p' | '4K'
    bitrate: number
    fps: number
    audioQuality: 'low' | 'medium' | 'high'
  }): Promise<Stream> {
    try {
      const { data: stream, error } = await supabase
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
        .single()

      if (error) {
        logger.error('Create stream error:', error)
        throw new Error('Failed to create stream')
      }

      return this.mapStreamData(stream)
    } catch (error) {
      logger.error('CamsService.createStream error:', error)
      throw error
    }
  }

  async getLiveStreams(options: {
    category?: string
    search?: string
    limit: number
    offset: number
  }): Promise<Stream[]> {
    try {
      let query = supabase
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
        .order('created_at', { ascending: false })

      if (options.category) {
        query = query.eq('category', options.category)
      }

      if (options.search) {
        query = query.or(`title.ilike.%${options.search}%,description.ilike.%${options.search}%`)
      }

      const { data: streams, error } = await query
        .range(options.offset, options.offset + options.limit - 1)

      if (error) {
        logger.error('Get live streams error:', error)
        throw new Error('Failed to fetch live streams')
      }

      return streams.map(stream => this.mapStreamData(stream))
    } catch (error) {
      logger.error('CamsService.getLiveStreams error:', error)
      throw error
    }
  }

  async getStreamById(id: string): Promise<Stream | null> {
    try {
      const { data: stream, error } = await supabase
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
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null
        }
        logger.error('Get stream by ID error:', error)
        throw new Error('Failed to fetch stream')
      }

      return this.mapStreamData(stream)
    } catch (error) {
      logger.error('CamsService.getStreamById error:', error)
      throw error
    }
  }

  async updateStreamSettings(
    streamId: string,
    userId: string,
    updates: Partial<Stream>
  ): Promise<Stream> {
    try {
      // Verify ownership
      const { data: stream } = await supabase
        .from('streams')
        .select('user_id')
        .eq('id', streamId)
        .single()

      if (!stream || stream.user_id !== userId) {
        throw new Error('Unauthorized to update stream')
      }

      const { data: updatedStream, error } = await supabase
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
        .single()

      if (error) {
        logger.error('Update stream settings error:', error)
        throw new Error('Failed to update stream settings')
      }

      return this.mapStreamData(updatedStream)
    } catch (error) {
      logger.error('CamsService.updateStreamSettings error:', error)
      throw error
    }
  }

  async startStream(streamId: string, userId: string): Promise<Stream> {
    try {
      // Verify ownership
      const { data: stream } = await supabase
        .from('streams')
        .select('user_id, status')
        .eq('id', streamId)
        .single()

      if (!stream || stream.user_id !== userId) {
        throw new Error('Unauthorized to start stream')
      }

      if (stream.status !== 'draft') {
        throw new Error('Stream is not in draft status')
      }

      const { data: updatedStream, error } = await supabase
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
        .single()

      if (error) {
        logger.error('Start stream error:', error)
        throw new Error('Failed to start stream')
      }

      return this.mapStreamData(updatedStream)
    } catch (error) {
      logger.error('CamsService.startStream error:', error)
      throw error
    }
  }

  async stopStream(streamId: string, userId: string): Promise<Stream> {
    try {
      // Verify ownership
      const { data: stream } = await supabase
        .from('streams')
        .select('user_id, status')
        .eq('id', streamId)
        .single()

      if (!stream || stream.user_id !== userId) {
        throw new Error('Unauthorized to stop stream')
      }

      if (stream.status !== 'live') {
        throw new Error('Stream is not live')
      }

      const { data: updatedStream, error } = await supabase
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
        .single()

      if (error) {
        logger.error('Stop stream error:', error)
        throw new Error('Failed to stop stream')
      }

      return this.mapStreamData(updatedStream)
    } catch (error) {
      logger.error('CamsService.stopStream error:', error)
      throw error
    }
  }

  async joinStream(streamId: string, userId: string): Promise<StreamViewer> {
    try {
      // Check if stream exists and is live
      const { data: stream } = await supabase
        .from('streams')
        .select('status, privacy, creator_id')
        .eq('id', streamId)
        .single()

      if (!stream || stream.status !== 'live') {
        throw new Error('Stream is not available')
      }

      // Check if user is banned
      const { data: ban } = await supabase
        .from('stream_bans')
        .select('id')
        .eq('stream_id', streamId)
        .eq('user_id', userId)
        .single()

      if (ban) {
        throw new Error('You are banned from this stream')
      }

      // Check privacy settings
      if (stream.privacy === 'followers') {
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('id')
          .eq('creator_id', stream.creator_id)
          .eq('user_id', userId)
          .eq('status', 'active')
          .single()

        if (!subscription) {
          throw new Error('You must be subscribed to view this stream')
        }
      }

      // Add viewer
      const { data: viewer, error } = await supabase
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
        .single()

      if (error) {
        logger.error('Join stream error:', error)
        throw new Error('Failed to join stream')
      }

      return this.mapViewerData(viewer)
    } catch (error) {
      logger.error('CamsService.joinStream error:', error)
      throw error
    }
  }

  async leaveStream(streamId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('stream_viewers')
        .delete()
        .eq('stream_id', streamId)
        .eq('user_id', userId)

      if (error) {
        logger.error('Leave stream error:', error)
        throw new Error('Failed to leave stream')
      }
    } catch (error) {
      logger.error('CamsService.leaveStream error:', error)
      throw error
    }
  }

  async getStreamViewers(streamId: string, userId: string): Promise<StreamViewer[]> {
    try {
      // Verify stream ownership
      const { data: stream } = await supabase
        .from('streams')
        .select('user_id')
        .eq('id', streamId)
        .single()

      if (!stream || stream.user_id !== userId) {
        throw new Error('Unauthorized to view stream viewers')
      }

      const { data: viewers, error } = await supabase
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
        .order('joined_at', { ascending: false })

      if (error) {
        logger.error('Get stream viewers error:', error)
        throw new Error('Failed to fetch stream viewers')
      }

      return viewers.map(viewer => this.mapViewerData(viewer))
    } catch (error) {
      logger.error('CamsService.getStreamViewers error:', error)
      throw error
    }
  }

  async sendGift(data: {
    streamId: string
    userId: string
    giftType: 'heart' | 'star' | 'crown' | 'zap'
    amount: number
  }): Promise<Gift> {
    try {
      const { data: gift, error } = await supabase
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
        .single()

      if (error) {
        logger.error('Send gift error:', error)
        throw new Error('Failed to send gift')
      }

      return this.mapGiftData(gift)
    } catch (error) {
      logger.error('CamsService.sendGift error:', error)
      throw error
    }
  }

  async getStreamChat(streamId: string, options: {
    limit: number
    offset: number
  }): Promise<ChatMessage[]> {
    try {
      const { data: messages, error } = await supabase
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
        .range(options.offset, options.offset + options.limit - 1)

      if (error) {
        logger.error('Get stream chat error:', error)
        throw new Error('Failed to fetch chat messages')
      }

      return messages.map(message => this.mapChatMessageData(message))
    } catch (error) {
      logger.error('CamsService.getStreamChat error:', error)
      throw error
    }
  }

  async sendChatMessage(data: {
    streamId: string
    userId: string
    message: string
  }): Promise<ChatMessage> {
    try {
      // Check if user is banned
      const { data: ban } = await supabase
        .from('stream_bans')
        .select('id')
        .eq('stream_id', data.streamId)
        .eq('user_id', data.userId)
        .single()

      if (ban) {
        throw new Error('You are banned from this stream')
      }

      const { data: chatMessage, error } = await supabase
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
        .single()

      if (error) {
        logger.error('Send chat message error:', error)
        throw new Error('Failed to send chat message')
      }

      return this.mapChatMessageData(chatMessage)
    } catch (error) {
      logger.error('CamsService.sendChatMessage error:', error)
      throw error
    }
  }

  async startRecording(streamId: string, userId: string): Promise<StreamRecording> {
    try {
      // Verify stream ownership
      const { data: stream } = await supabase
        .from('streams')
        .select('user_id, status')
        .eq('id', streamId)
        .single()

      if (!stream || stream.user_id !== userId) {
        throw new Error('Unauthorized to record stream')
      }

      if (stream.status !== 'live') {
        throw new Error('Stream must be live to start recording')
      }

      const { data: recording, error } = await supabase
        .from('stream_recordings')
        .insert({
          stream_id: streamId,
          title: `Recording - ${new Date().toLocaleString()}`,
          status: 'recording',
          start_time: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        logger.error('Start recording error:', error)
        throw new Error('Failed to start recording')
      }

      return this.mapRecordingData(recording)
    } catch (error) {
      logger.error('CamsService.startRecording error:', error)
      throw error
    }
  }

  async stopRecording(streamId: string, userId: string): Promise<StreamRecording> {
    try {
      // Verify stream ownership
      const { data: stream } = await supabase
        .from('streams')
        .select('user_id')
        .eq('id', streamId)
        .single()

      if (!stream || stream.user_id !== userId) {
        throw new Error('Unauthorized to stop recording')
      }

      const { data: recording, error } = await supabase
        .from('stream_recordings')
        .update({
          status: 'completed',
          end_time: new Date().toISOString()
        })
        .eq('stream_id', streamId)
        .eq('status', 'recording')
        .select()
        .single()

      if (error) {
        logger.error('Stop recording error:', error)
        throw new Error('Failed to stop recording')
      }

      return this.mapRecordingData(recording)
    } catch (error) {
      logger.error('CamsService.stopRecording error:', error)
      throw error
    }
  }

  async getStreamRecordings(streamId: string, userId: string): Promise<StreamRecording[]> {
    try {
      // Verify stream ownership
      const { data: stream } = await supabase
        .from('streams')
        .select('user_id')
        .eq('id', streamId)
        .single()

      if (!stream || stream.user_id !== userId) {
        throw new Error('Unauthorized to view stream recordings')
      }

      const { data: recordings, error } = await supabase
        .from('stream_recordings')
        .select('*')
        .eq('stream_id', streamId)
        .order('created_at', { ascending: false })

      if (error) {
        logger.error('Get stream recordings error:', error)
        throw new Error('Failed to fetch recordings')
      }

      return recordings.map(recording => this.mapRecordingData(recording))
    } catch (error) {
      logger.error('CamsService.getStreamRecordings error:', error)
      throw error
    }
  }

  async getStreamAnalytics(streamId: string, userId: string): Promise<StreamAnalytics> {
    try {
      // Verify stream ownership
      const { data: stream } = await supabase
        .from('streams')
        .select('user_id')
        .eq('id', streamId)
        .single()

      if (!stream || stream.user_id !== userId) {
        throw new Error('Unauthorized to view stream analytics')
      }

      // Get basic stream data
      const { data: streamData } = await supabase
        .from('streams')
        .select('start_time, end_time')
        .eq('id', streamId)
        .single()

      // Get viewer statistics
      const { data: viewers } = await supabase
        .from('stream_viewers')
        .select('joined_at, last_seen')
        .eq('stream_id', streamId)

      // Get gifts
      const { data: gifts } = await supabase
        .from('stream_gifts')
        .select('amount, created_at')
        .eq('stream_id', streamId)

      // Get chat messages
      const { data: messages } = await supabase
        .from('stream_chat')
        .select('created_at')
        .eq('stream_id', streamId)

      // Calculate analytics
      const totalViewers = viewers?.length || 0
      const peakViewers = totalViewers // Simplified - in real app, track peak over time
      const averageViewers = totalViewers
      const totalDuration = streamData ? 
        new Date(streamData.end_time || new Date()).getTime() - new Date(streamData.start_time).getTime() : 0
      const totalGifts = gifts?.reduce((sum, gift) => sum + gift.amount, 0) || 0
      const totalTips = 0 // Would come from tips table
      const totalChatMessages = messages?.length || 0
      const engagementRate = totalViewers > 0 ? (totalChatMessages + totalGifts) / totalViewers : 0
      const retentionRate = 0.75 // Simplified - would calculate based on viewer duration

      const analytics: StreamAnalytics = {
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
        timeline: [] // Would be populated with time-series data
      }

      return analytics
    } catch (error) {
      logger.error('CamsService.getStreamAnalytics error:', error)
      throw error
    }
  }

  async reportStream(data: {
    streamId: string
    reporterId: string
    reason: 'inappropriate' | 'spam' | 'harassment' | 'underage' | 'other'
    description?: string
  }): Promise<StreamReport> {
    try {
      const { data: report, error } = await supabase
        .from('stream_reports')
        .insert({
          stream_id: data.streamId,
          reporter_id: data.reporterId,
          reason: data.reason,
          description: data.description,
          status: 'pending'
        })
        .select()
        .single()

      if (error) {
        logger.error('Report stream error:', error)
        throw new Error('Failed to report stream')
      }

      return this.mapReportData(report)
    } catch (error) {
      logger.error('CamsService.reportStream error:', error)
      throw error
    }
  }

  async banViewer(streamId: string, userId: string, viewerId: string, reason?: string): Promise<void> {
    try {
      // Verify stream ownership
      const { data: stream } = await supabase
        .from('streams')
        .select('user_id')
        .eq('id', streamId)
        .single()

      if (!stream || stream.user_id !== userId) {
        throw new Error('Unauthorized to ban viewers')
      }

      const { error } = await supabase
        .from('stream_bans')
        .insert({
          stream_id: streamId,
          user_id: viewerId,
          banned_by: userId,
          reason: reason || 'Violation of stream rules'
        })

      if (error) {
        logger.error('Ban viewer error:', error)
        throw new Error('Failed to ban viewer')
      }
    } catch (error) {
      logger.error('CamsService.banViewer error:', error)
      throw error
    }
  }

  async promoteToModerator(streamId: string, userId: string, viewerId: string): Promise<void> {
    try {
      // Verify stream ownership
      const { data: stream } = await supabase
        .from('streams')
        .select('user_id')
        .eq('id', streamId)
        .single()

      if (!stream || stream.user_id !== userId) {
        throw new Error('Unauthorized to promote moderators')
      }

      const { error } = await supabase
        .from('stream_moderators')
        .insert({
          stream_id: streamId,
          user_id: viewerId,
          promoted_by: userId
        })

      if (error) {
        logger.error('Promote moderator error:', error)
        throw new Error('Failed to promote moderator')
      }
    } catch (error) {
      logger.error('CamsService.promoteToModerator error:', error)
      throw error
    }
  }

  // Helper methods to map database data to interface format
  private mapStreamData(data: any): Stream {
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
    }
  }

  private mapViewerData(data: any): StreamViewer {
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
    }
  }

  private mapChatMessageData(data: any): ChatMessage {
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
    }
  }

  private mapRecordingData(data: any): StreamRecording {
    return {
      id: data.id,
      streamId: data.stream_id,
      title: data.title,
      duration: data.duration || 0,
      fileSize: data.file_size || 0,
      url: data.url || '',
      thumbnailUrl: data.thumbnail_url,
      createdAt: data.created_at
    }
  }

  private mapGiftData(data: any): Gift {
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
    }
  }

  private mapReportData(data: any): StreamReport {
    return {
      id: data.id,
      streamId: data.stream_id,
      reporterId: data.reporter_id,
      reason: data.reason,
      description: data.description,
      status: data.status,
      createdAt: data.created_at
    }
  }
}

export const camsService = new CamsService()

