import { supabase } from '../config/database'
import { logger } from '../utils/logger'
import { redisManager } from '../config/redis'

export interface ChatSession {
  id: string
  userId: string
  interests: string[]
  ageRange?: {
    min: number
    max: number
  }
  location?: string
  gender?: 'male' | 'female' | 'non-binary' | 'other'
  chatType: 'text' | 'audio' | 'video'
  status: 'waiting' | 'matched' | 'active' | 'ended'
  matchedUserId?: string
  matchedAt?: string
  endedAt?: string
  createdAt: string
  updatedAt: string
}

export interface ChatMessage {
  id: string
  sessionId: string
  userId: string
  message: string
  type: 'text' | 'image' | 'emoji'
  timestamp: string
  isRead: boolean
  profile: {
    username: string
    displayName: string
    avatarUrl?: string
  }
}

export interface ChatMatch {
  sessionId: string
  matchedUserId: string
  matchedAt: string
  compatibility: number
  sharedInterests: string[]
  profile: {
    username: string
    displayName: string
    avatarUrl?: string
    age?: number
    location?: string
  }
}

export interface ChatPreferences {
  id: string
  userId: string
  interests: string[]
  ageRange: {
    min: number
    max: number
  }
  location?: string
  gender?: 'male' | 'female' | 'non-binary' | 'other'
  chatType: 'text' | 'audio' | 'video'
  autoSkip: boolean
  skipDelay: number
  createdAt: string
  updatedAt: string
}

export interface ChatHistory {
  id: string
  sessionId: string
  matchedUserId: string
  duration: number
  messageCount: number
  endedAt: string
  profile: {
    username: string
    displayName: string
    avatarUrl?: string
  }
}

export interface ChatStats {
  totalSessions: number
  totalMatches: number
  totalMessages: number
  averageSessionDuration: number
  favoriteInterests: string[]
  blockedUsers: number
  reportedUsers: number
}

export interface ChatReport {
  id: string
  sessionId: string
  reporterId: string
  reportedUserId: string
  reason: 'inappropriate' | 'spam' | 'harassment' | 'underage' | 'fake' | 'other'
  description?: string
  status: 'pending' | 'under_review' | 'resolved' | 'dismissed'
  createdAt: string
}

export interface CallSession {
  id: string
  sessionId: string
  callType: 'audio' | 'video'
  status: 'initiated' | 'ringing' | 'active' | 'ended'
  startedAt: string
  endedAt?: string
  duration?: number
}

class FlavoursTalkService {
  async createChatSession(data: {
    userId: string
    interests: string[]
    ageRange?: {
      min: number
      max: number
    }
    location?: string
    gender?: 'male' | 'female' | 'non-binary' | 'other'
    chatType: 'text' | 'audio' | 'video'
  }): Promise<ChatSession> {
    try {
      const { data: session, error } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: data.userId,
          interests: data.interests,
          age_range: data.ageRange,
          location: data.location,
          gender: data.gender,
          chat_type: data.chatType,
          status: 'waiting'
        })
        .select()
        .single()

      if (error) {
        logger.error('Create chat session error:', error)
        throw new Error('Failed to create chat session')
      }

      return this.mapSessionData(session)
    } catch (error) {
      logger.error('FlavoursTalkService.createChatSession error:', error)
      throw error
    }
  }

  async findMatch(sessionId: string, userId: string): Promise<ChatMatch | null> {
    try {
      // Get current session
      const { data: session } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('user_id', userId)
        .single()

      if (!session || session.status !== 'waiting') {
        throw new Error('Session not found or not in waiting status')
      }

      // Find potential matches
      const { data: potentialMatches } = await supabase
        .from('chat_sessions')
        .select(`
          *,
          profiles!inner (
            username,
            display_name,
            avatar_url,
            age_verified
          )
        `)
        .eq('status', 'waiting')
        .neq('user_id', userId)
        .in('interests', session.interests)

      if (!potentialMatches || potentialMatches.length === 0) {
        return null
      }

      // Calculate compatibility and find best match
      let bestMatch = null
      let bestCompatibility = 0

      for (const match of potentialMatches) {
        const compatibility = this.calculateCompatibility(session, match)
        if (compatibility > bestCompatibility) {
          bestCompatibility = compatibility
          bestMatch = match
        }
      }

      if (!bestMatch || bestCompatibility < 0.3) {
        return null
      }

      // Create match
      const { data: matchRecord, error: matchError } = await supabase
        .from('chat_matches')
        .insert({
          session_id: sessionId,
          matched_user_id: bestMatch.user_id,
          compatibility_score: bestCompatibility,
          shared_interests: session.interests.filter(interest => 
            bestMatch.interests.includes(interest)
          )
        })
        .select()
        .single()

      if (matchError) {
        logger.error('Create match error:', matchError)
        throw new Error('Failed to create match')
      }

      // Update both sessions to matched status
      await supabase
        .from('chat_sessions')
        .update({
          status: 'matched',
          matched_user_id: bestMatch.user_id,
          matched_at: new Date().toISOString()
        })
        .eq('id', sessionId)

      await supabase
        .from('chat_sessions')
        .update({
          status: 'matched',
          matched_user_id: userId,
          matched_at: new Date().toISOString()
        })
        .eq('id', bestMatch.id)

      return {
        sessionId,
        matchedUserId: bestMatch.user_id,
        matchedAt: new Date().toISOString(),
        compatibility: bestCompatibility,
        sharedInterests: matchRecord.shared_interests,
        profile: {
          username: bestMatch.profiles.username,
          displayName: bestMatch.profiles.display_name,
          avatarUrl: bestMatch.profiles.avatar_url,
          age: bestMatch.age_range?.min,
          location: bestMatch.location
        }
      }
    } catch (error) {
      logger.error('FlavoursTalkService.findMatch error:', error)
      throw error
    }
  }

  async getActiveSession(userId: string): Promise<ChatSession | null> {
    try {
      const { data: session, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', userId)
        .in('status', ['waiting', 'matched', 'active'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null
        }
        logger.error('Get active session error:', error)
        throw new Error('Failed to fetch active session')
      }

      return this.mapSessionData(session)
    } catch (error) {
      logger.error('FlavoursTalkService.getActiveSession error:', error)
      throw error
    }
  }

  async endChatSession(sessionId: string, userId: string): Promise<void> {
    try {
      // Verify session ownership
      const { data: session } = await supabase
        .from('chat_sessions')
        .select('user_id, matched_user_id')
        .eq('id', sessionId)
        .single()

      if (!session || session.user_id !== userId) {
        throw new Error('Unauthorized to end session')
      }

      // Update session status
      await supabase
        .from('chat_sessions')
        .update({
          status: 'ended',
          ended_at: new Date().toISOString()
        })
        .eq('id', sessionId)

      // Also end the matched session if exists
      if (session.matched_user_id) {
        await supabase
          .from('chat_sessions')
          .update({
            status: 'ended',
            ended_at: new Date().toISOString()
          })
          .eq('matched_user_id', userId)
          .eq('status', 'matched')
      }
    } catch (error) {
      logger.error('FlavoursTalkService.endChatSession error:', error)
      throw error
    }
  }

  async skipMatch(sessionId: string, userId: string, reason?: string): Promise<void> {
    try {
      // Verify session ownership
      const { data: session } = await supabase
        .from('chat_sessions')
        .select('user_id, matched_user_id')
        .eq('id', sessionId)
        .single()

      if (!session || session.user_id !== userId) {
        throw new Error('Unauthorized to skip match')
      }

      // Record skip
      await supabase
        .from('chat_skips')
        .insert({
          session_id: sessionId,
          user_id: userId,
          skipped_user_id: session.matched_user_id,
          reason: reason || 'No reason provided'
        })

      // Reset session to waiting status
      await supabase
        .from('chat_sessions')
        .update({
          status: 'waiting',
          matched_user_id: null,
          matched_at: null
        })
        .eq('id', sessionId)

      // Also reset the matched session
      if (session.matched_user_id) {
        await supabase
          .from('chat_sessions')
          .update({
            status: 'waiting',
            matched_user_id: null,
            matched_at: null
          })
          .eq('matched_user_id', userId)
          .eq('status', 'matched')
      }
    } catch (error) {
      logger.error('FlavoursTalkService.skipMatch error:', error)
      throw error
    }
  }

  async sendMessage(data: {
    sessionId: string
    userId: string
    message: string
    type: 'text' | 'image' | 'emoji'
  }): Promise<ChatMessage> {
    try {
      // Verify session participation
      const { data: session } = await supabase
        .from('chat_sessions')
        .select('user_id, matched_user_id, status')
        .eq('id', data.sessionId)
        .single()

      if (!session || (session.user_id !== data.userId && session.matched_user_id !== data.userId)) {
        throw new Error('Unauthorized to send message')
      }

      if (session.status !== 'matched' && session.status !== 'active') {
        throw new Error('Session is not active')
      }

      // Update session to active if it's matched
      if (session.status === 'matched') {
        await supabase
          .from('chat_sessions')
          .update({ status: 'active' })
          .eq('id', data.sessionId)
      }

      const { data: chatMessage, error } = await supabase
        .from('chat_messages')
        .insert({
          session_id: data.sessionId,
          user_id: data.userId,
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
        logger.error('Send message error:', error)
        throw new Error('Failed to send message')
      }

      return this.mapMessageData(chatMessage)
    } catch (error) {
      logger.error('FlavoursTalkService.sendMessage error:', error)
      throw error
    }
  }

  async getChatMessages(sessionId: string, userId: string, options: {
    limit: number
    offset: number
  }): Promise<ChatMessage[]> {
    try {
      // Verify session participation
      const { data: session } = await supabase
        .from('chat_sessions')
        .select('user_id, matched_user_id')
        .eq('id', sessionId)
        .single()

      if (!session || (session.user_id !== userId && session.matched_user_id !== userId)) {
        throw new Error('Unauthorized to view messages')
      }

      const { data: messages, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          profiles!inner (
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false })
        .range(options.offset, options.offset + options.limit - 1)

      if (error) {
        logger.error('Get chat messages error:', error)
        throw new Error('Failed to fetch messages')
      }

      return messages.map(message => this.mapMessageData(message))
    } catch (error) {
      logger.error('FlavoursTalkService.getChatMessages error:', error)
      throw error
    }
  }

  async reportUser(data: {
    sessionId: string
    reporterId: string
    reason: 'inappropriate' | 'spam' | 'harassment' | 'underage' | 'fake' | 'other'
    description?: string
  }): Promise<ChatReport> {
    try {
      // Get the reported user from the session
      const { data: session } = await supabase
        .from('chat_sessions')
        .select('matched_user_id')
        .eq('id', data.sessionId)
        .single()

      if (!session) {
        throw new Error('Session not found')
      }

      const reportedUserId = session.matched_user_id === data.reporterId ? 
        session.matched_user_id : data.reporterId

      const { data: report, error } = await supabase
        .from('chat_reports')
        .insert({
          session_id: data.sessionId,
          reporter_id: data.reporterId,
          reported_user_id: reportedUserId,
          reason: data.reason,
          description: data.description,
          status: 'pending'
        })
        .select()
        .single()

      if (error) {
        logger.error('Report user error:', error)
        throw new Error('Failed to report user')
      }

      return this.mapReportData(report)
    } catch (error) {
      logger.error('FlavoursTalkService.reportUser error:', error)
      throw error
    }
  }

  async blockUser(sessionId: string, userId: string, blockedUserId: string, reason?: string): Promise<void> {
    try {
      // Verify session participation
      const { data: session } = await supabase
        .from('chat_sessions')
        .select('user_id, matched_user_id')
        .eq('id', sessionId)
        .single()

      if (!session || (session.user_id !== userId && session.matched_user_id !== userId)) {
        throw new Error('Unauthorized to block user')
      }

      const { error } = await supabase
        .from('chat_blocks')
        .insert({
          blocker_id: userId,
          blocked_id: blockedUserId,
          session_id: sessionId,
          reason: reason || 'User blocked'
        })

      if (error) {
        logger.error('Block user error:', error)
        throw new Error('Failed to block user')
      }

      // End the session
      await this.endChatSession(sessionId, userId)
    } catch (error) {
      logger.error('FlavoursTalkService.blockUser error:', error)
      throw error
    }
  }

  async updatePreferences(userId: string, preferences: Partial<ChatPreferences>): Promise<ChatPreferences> {
    try {
      const { data: updatedPreferences, error } = await supabase
        .from('chat_preferences')
        .upsert({
          user_id: userId,
          interests: preferences.interests,
          age_range: preferences.ageRange,
          location: preferences.location,
          gender: preferences.gender,
          chat_type: preferences.chatType,
          auto_skip: preferences.autoSkip,
          skip_delay: preferences.skipDelay
        })
        .select()
        .single()

      if (error) {
        logger.error('Update preferences error:', error)
        throw new Error('Failed to update preferences')
      }

      return this.mapPreferencesData(updatedPreferences)
    } catch (error) {
      logger.error('FlavoursTalkService.updatePreferences error:', error)
      throw error
    }
  }

  async getPreferences(userId: string): Promise<ChatPreferences | null> {
    try {
      const { data: preferences, error } = await supabase
        .from('chat_preferences')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null
        }
        logger.error('Get preferences error:', error)
        throw new Error('Failed to fetch preferences')
      }

      return this.mapPreferencesData(preferences)
    } catch (error) {
      logger.error('FlavoursTalkService.getPreferences error:', error)
      throw error
    }
  }

  async getChatHistory(userId: string, options: {
    limit: number
    offset: number
  }): Promise<ChatHistory[]> {
    try {
      const { data: history, error } = await supabase
        .from('chat_sessions')
        .select(`
          id,
          session_id,
          matched_user_id,
          ended_at,
          profiles!inner (
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'ended')
        .order('ended_at', { ascending: false })
        .range(options.offset, options.offset + options.limit - 1)

      if (error) {
        logger.error('Get chat history error:', error)
        throw new Error('Failed to fetch chat history')
      }

      return history.map(session => this.mapHistoryData(session))
    } catch (error) {
      logger.error('FlavoursTalkService.getChatHistory error:', error)
      throw error
    }
  }

  async getChatStats(userId: string): Promise<ChatStats> {
    try {
      // Get total sessions
      const { count: totalSessions } = await supabase
        .from('chat_sessions')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)

      // Get total matches
      const { count: totalMatches } = await supabase
        .from('chat_sessions')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .not('matched_user_id', 'is', null)

      // Get total messages
      const { count: totalMessages } = await supabase
        .from('chat_messages')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)

      // Get blocked users count
      const { count: blockedUsers } = await supabase
        .from('chat_blocks')
        .select('*', { count: 'exact' })
        .eq('blocker_id', userId)

      // Get reported users count
      const { count: reportedUsers } = await supabase
        .from('chat_reports')
        .select('*', { count: 'exact' })
        .eq('reporter_id', userId)

      const stats: ChatStats = {
        totalSessions: totalSessions || 0,
        totalMatches: totalMatches || 0,
        totalMessages: totalMessages || 0,
        averageSessionDuration: 0, // Would calculate from session data
        favoriteInterests: [], // Would calculate from session data
        blockedUsers: blockedUsers || 0,
        reportedUsers: reportedUsers || 0
      }

      return stats
    } catch (error) {
      logger.error('FlavoursTalkService.getChatStats error:', error)
      throw error
    }
  }

  async getAvailableInterests(): Promise<string[]> {
    try {
      // Return predefined interests - in real app, this could be dynamic
      return [
        'Music', 'Movies', 'Sports', 'Gaming', 'Art', 'Photography',
        'Travel', 'Food', 'Fashion', 'Technology', 'Books', 'Fitness',
        'Nature', 'Dancing', 'Cooking', 'Writing', 'Comedy', 'Science',
        'History', 'Politics', 'Business', 'Health', 'Education', 'Animals'
      ]
    } catch (error) {
      logger.error('FlavoursTalkService.getAvailableInterests error:', error)
      throw error
    }
  }

  async getOnlineUsersCount(): Promise<number> {
    try {
      // Get count of active sessions from Redis or database
      const activeSessions = await redisManager.keys('chat_session:*')
      return activeSessions.length
    } catch (error) {
      logger.error('FlavoursTalkService.getOnlineUsersCount error:', error)
      return 0
    }
  }

  async startCall(sessionId: string, userId: string, callType: 'audio' | 'video'): Promise<CallSession> {
    try {
      // Verify session participation
      const { data: session } = await supabase
        .from('chat_sessions')
        .select('user_id, matched_user_id, status')
        .eq('id', sessionId)
        .single()

      if (!session || (session.user_id !== userId && session.matched_user_id !== userId)) {
        throw new Error('Unauthorized to start call')
      }

      if (session.status !== 'active') {
        throw new Error('Session must be active to start call')
      }

      const { data: call, error } = await supabase
        .from('chat_calls')
        .insert({
          session_id: sessionId,
          call_type: callType,
          status: 'initiated',
          started_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        logger.error('Start call error:', error)
        throw new Error('Failed to start call')
      }

      return this.mapCallData(call)
    } catch (error) {
      logger.error('FlavoursTalkService.startCall error:', error)
      throw error
    }
  }

  async endCall(sessionId: string, userId: string): Promise<void> {
    try {
      // Verify session participation
      const { data: session } = await supabase
        .from('chat_sessions')
        .select('user_id, matched_user_id')
        .eq('id', sessionId)
        .single()

      if (!session || (session.user_id !== userId && session.matched_user_id !== userId)) {
        throw new Error('Unauthorized to end call')
      }

      const { error } = await supabase
        .from('chat_calls')
        .update({
          status: 'ended',
          ended_at: new Date().toISOString()
        })
        .eq('session_id', sessionId)
        .eq('status', 'active')

      if (error) {
        logger.error('End call error:', error)
        throw new Error('Failed to end call')
      }
    } catch (error) {
      logger.error('FlavoursTalkService.endCall error:', error)
      throw error
    }
  }

  // Helper methods
  private calculateCompatibility(session1: any, session2: any): number {
    let score = 0

    // Interest compatibility (40% weight)
    const sharedInterests = session1.interests.filter((interest: string) => 
      session2.interests.includes(interest)
    )
    score += (sharedInterests.length / Math.max(session1.interests.length, session2.interests.length)) * 0.4

    // Age compatibility (20% weight)
    if (session1.age_range && session2.age_range) {
      const age1Min = session1.age_range.min
      const age1Max = session1.age_range.max
      const age2Min = session2.age_range.min
      const age2Max = session2.age_range.max

      if (age1Min <= age2Max && age2Min <= age1Max) {
        score += 0.2
      }
    }

    // Location compatibility (20% weight)
    if (session1.location && session2.location && session1.location === session2.location) {
      score += 0.2
    }

    // Gender compatibility (20% weight)
    if (session1.gender && session2.gender && session1.gender === session2.gender) {
      score += 0.2
    }

    return Math.min(score, 1.0)
  }

  private mapSessionData(data: any): ChatSession {
    return {
      id: data.id,
      userId: data.user_id,
      interests: data.interests,
      ageRange: data.age_range,
      location: data.location,
      gender: data.gender,
      chatType: data.chat_type,
      status: data.status,
      matchedUserId: data.matched_user_id,
      matchedAt: data.matched_at,
      endedAt: data.ended_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }
  }

  private mapMessageData(data: any): ChatMessage {
    return {
      id: data.id,
      sessionId: data.session_id,
      userId: data.user_id,
      message: data.message,
      type: data.type,
      timestamp: data.created_at,
      isRead: data.is_read || false,
      profile: {
        username: data.profiles.username,
        displayName: data.profiles.display_name,
        avatarUrl: data.profiles.avatar_url
      }
    }
  }

  private mapPreferencesData(data: any): ChatPreferences {
    return {
      id: data.id,
      userId: data.user_id,
      interests: data.interests,
      ageRange: data.age_range,
      location: data.location,
      gender: data.gender,
      chatType: data.chat_type,
      autoSkip: data.auto_skip || false,
      skipDelay: data.skip_delay || 30,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }
  }

  private mapHistoryData(data: any): ChatHistory {
    return {
      id: data.id,
      sessionId: data.session_id,
      matchedUserId: data.matched_user_id,
      duration: 0, // Would calculate from session data
      messageCount: 0, // Would count messages
      endedAt: data.ended_at,
      profile: {
        username: data.profiles.username,
        displayName: data.profiles.display_name,
        avatarUrl: data.profiles.avatar_url
      }
    }
  }

  private mapReportData(data: any): ChatReport {
    return {
      id: data.id,
      sessionId: data.session_id,
      reporterId: data.reporter_id,
      reportedUserId: data.reported_user_id,
      reason: data.reason,
      description: data.description,
      status: data.status,
      createdAt: data.created_at
    }
  }

  private mapCallData(data: any): CallSession {
    return {
      id: data.id,
      sessionId: data.session_id,
      callType: data.call_type,
      status: data.status,
      startedAt: data.started_at,
      endedAt: data.ended_at,
      duration: data.duration
    }
  }
}

export const flavourstalkService = new FlavoursTalkService()

