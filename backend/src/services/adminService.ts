import { supabase } from '../config/database'
import { logger } from '../utils/logger'
import { redisManager } from '../config/redis'

export interface DashboardStats {
  totalUsers: number
  totalCreators: number
  totalPosts: number
  totalRevenue: number
  pendingModerations: number
  pendingReports: number
  activeUsers: number
  newUsersToday: number
  newCreatorsToday: number
  revenueToday: number
}

export interface ModerationItem {
  id: string
  type: 'post' | 'comment' | 'user' | 'creator'
  content: any
  reason: string
  reportedBy: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  reviewedAt?: string
  reviewedBy?: string
  reviewNotes?: string
}

export interface Report {
  id: string
  type: 'spam' | 'harassment' | 'inappropriate' | 'copyright' | 'other'
  content: any
  reportedBy: string
  reason: string
  status: 'pending' | 'resolved' | 'dismissed'
  createdAt: string
  resolvedAt?: string
  resolvedBy?: string
  resolution?: string
}

export interface User {
  id: string
  username: string
  email: string
  display_name: string
  role: 'user' | 'creator' | 'admin'
  status: 'active' | 'suspended' | 'banned'
  is_verified: boolean
  created_at: string
  last_active: string
  followers_count: number
  following_count: number
  posts_count: number
}

export interface Creator {
  id: string
  username: string
  display_name: string
  email: string
  verification_status: 'pending' | 'verified' | 'rejected'
  verification_documents: any[]
  bio: string
  website: string
  social_links: any
  created_at: string
  followers_count: number
  posts_count: number
  revenue: number
}

export interface AnalyticsData {
  period: string
  metric: string
  data: any[]
  summary: {
    total: number
    change: number
    changePercent: number
  }
}

export interface SystemHealth {
  database: boolean
  redis: boolean
  storage: boolean
  api: boolean
  uptime: number
  memoryUsage: number
  cpuUsage: number
  diskUsage: number
}

export interface AuditLog {
  id: string
  action: string
  userId: string
  resourceType: string
  resourceId: string
  details: any
  ipAddress: string
  userAgent: string
  createdAt: string
}

export class AdminService {
  private readonly CACHE_TTL = 300 // 5 minutes

  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const cacheKey = 'admin:dashboard:stats'
      
      // Try cache first
      const cached = await redisManager.get<DashboardStats>(cacheKey)
      if (cached) {
        return cached
      }

      // Get basic counts
      const [
        usersResult,
        creatorsResult,
        postsResult,
        moderationsResult,
        reportsResult
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'creator'),
        supabase.from('posts').select('*', { count: 'exact', head: true }),
        supabase.from('moderation_queue').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'pending')
      ])

      const totalUsers = usersResult.count || 0
      const totalCreators = creatorsResult.count || 0
      const totalPosts = postsResult.count || 0
      const pendingModerations = moderationsResult.count || 0
      const pendingReports = reportsResult.count || 0

      // Get today's stats
      const today = new Date().toISOString().split('T')[0]
      const [
        newUsersTodayResult,
        newCreatorsTodayResult
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', today),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'creator').gte('created_at', today)
      ])

      const newUsersToday = newUsersTodayResult.count || 0
      const newCreatorsToday = newCreatorsTodayResult.count || 0

      // Calculate active users (users active in last 24 hours)
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      const activeUsersResult = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('last_active', yesterday)

      const activeUsers = activeUsersResult.count || 0

      // Get revenue data (placeholder - would need actual payment integration)
      const totalRevenue = 0
      const revenueToday = 0

      const stats: DashboardStats = {
        totalUsers,
        totalCreators,
        totalPosts,
        totalRevenue,
        pendingModerations,
        pendingReports,
        activeUsers,
        newUsersToday,
        newCreatorsToday,
        revenueToday
      }

      // Cache the result
      await redisManager.set(cacheKey, stats, this.CACHE_TTL)

      return stats
    } catch (error) {
      logger.error('Error in getDashboardStats:', error)
      throw error
    }
  }

  async getModerationQueue(options: {
    page: number
    limit: number
    status: string
    type?: string
  }): Promise<ModerationItem[]> {
    try {
      let query = supabase
        .from('moderation_queue')
        .select('*')
        .eq('status', options.status)
        .order('created_at', { ascending: false })

      if (options.type) {
        query = query.eq('type', options.type)
      }

      const { data, error } = await query
        .range(
          (options.page - 1) * options.limit,
          options.page * options.limit - 1
        )

      if (error) {
        logger.error('Error fetching moderation queue:', error)
        return []
      }

      return data || []
    } catch (error) {
      logger.error('Error in getModerationQueue:', error)
      return []
    }
  }

  async reviewModerationItem(
    id: string,
    reviewerId: string,
    action: 'approve' | 'reject',
    reason?: string
  ): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('moderation_queue')
        .update({
          status: action === 'approve' ? 'approved' : 'rejected',
          reviewed_by: reviewerId,
          reviewed_at: new Date().toISOString(),
          review_notes: reason
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        logger.error('Error reviewing moderation item:', error)
        throw error
      }

      return data
    } catch (error) {
      logger.error('Error in reviewModerationItem:', error)
      throw error
    }
  }

  async getReports(options: {
    page: number
    limit: number
    status: string
    type?: string
  }): Promise<Report[]> {
    try {
      let query = supabase
        .from('reports')
        .select('*')
        .eq('status', options.status)
        .order('created_at', { ascending: false })

      if (options.type) {
        query = query.eq('type', options.type)
      }

      const { data, error } = await query
        .range(
          (options.page - 1) * options.limit,
          options.page * options.limit - 1
        )

      if (error) {
        logger.error('Error fetching reports:', error)
        return []
      }

      return data || []
    } catch (error) {
      logger.error('Error in getReports:', error)
      return []
    }
  }

  async handleReport(
    id: string,
    adminId: string,
    action: 'resolve' | 'dismiss',
    notes?: string
  ): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('reports')
        .update({
          status: action === 'resolve' ? 'resolved' : 'dismissed',
          resolved_by: adminId,
          resolved_at: new Date().toISOString(),
          resolution: notes
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        logger.error('Error handling report:', error)
        throw error
      }

      return data
    } catch (error) {
      logger.error('Error in handleReport:', error)
      throw error
    }
  }

  async getUsers(options: {
    page: number
    limit: number
    search?: string
    role?: string
    status?: string
  }): Promise<User[]> {
    try {
      let query = supabase
        .from('profiles')
        .select(`
          id,
          username,
          email,
          display_name,
          role,
          status,
          is_verified,
          created_at,
          last_active,
          followers_count,
          following_count,
          posts_count
        `)
        .order('created_at', { ascending: false })

      if (options.search) {
        query = query.or(`username.ilike.%${options.search}%,display_name.ilike.%${options.search}%,email.ilike.%${options.search}%`)
      }

      if (options.role) {
        query = query.eq('role', options.role)
      }

      if (options.status) {
        query = query.eq('status', options.status)
      }

      const { data, error } = await query
        .range(
          (options.page - 1) * options.limit,
          options.page * options.limit - 1
        )

      if (error) {
        logger.error('Error fetching users:', error)
        return []
      }

      return data || []
    } catch (error) {
      logger.error('Error in getUsers:', error)
      return []
    }
  }

  async updateUserStatus(
    userId: string,
    status: 'active' | 'suspended' | 'banned',
    reason: string,
    adminId: string
  ): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        logger.error('Error updating user status:', error)
        throw error
      }

      // Log the action
      await this.logAdminAction(adminId, 'update_user_status', 'user', userId, {
        status,
        reason
      })

      return data
    } catch (error) {
      logger.error('Error in updateUserStatus:', error)
      throw error
    }
  }

  async getCreators(options: {
    page: number
    limit: number
    verificationStatus?: string
    search?: string
  }): Promise<Creator[]> {
    try {
      let query = supabase
        .from('profiles')
        .select(`
          id,
          username,
          display_name,
          email,
          verification_status,
          verification_documents,
          bio,
          website,
          social_links,
          created_at,
          followers_count,
          posts_count
        `)
        .eq('role', 'creator')
        .order('created_at', { ascending: false })

      if (options.search) {
        query = query.or(`username.ilike.%${options.search}%,display_name.ilike.%${options.search}%`)
      }

      if (options.verificationStatus) {
        query = query.eq('verification_status', options.verificationStatus)
      }

      const { data, error } = await query
        .range(
          (options.page - 1) * options.limit,
          options.page * options.limit - 1
        )

      if (error) {
        logger.error('Error fetching creators:', error)
        return []
      }

      return data || []
    } catch (error) {
      logger.error('Error in getCreators:', error)
      return []
    }
  }

  async verifyCreator(
    creatorId: string,
    status: 'verified' | 'rejected',
    notes: string,
    adminId: string
  ): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          verification_status: status,
          verification_notes: notes,
          verified_at: new Date().toISOString(),
          verified_by: adminId,
          updated_at: new Date().toISOString()
        })
        .eq('id', creatorId)
        .select()
        .single()

      if (error) {
        logger.error('Error verifying creator:', error)
        throw error
      }

      // Log the action
      await this.logAdminAction(adminId, 'verify_creator', 'creator', creatorId, {
        status,
        notes
      })

      return data
    } catch (error) {
      logger.error('Error in verifyCreator:', error)
      throw error
    }
  }

  async getAnalytics(options: {
    period: string
    metric?: string
  }): Promise<AnalyticsData> {
    try {
      // This is a simplified implementation
      // In a real app, you'd have more sophisticated analytics
      const analytics: AnalyticsData = {
        period: options.period,
        metric: options.metric || 'users',
        data: [],
        summary: {
          total: 0,
          change: 0,
          changePercent: 0
        }
      }

      return analytics
    } catch (error) {
      logger.error('Error in getAnalytics:', error)
      throw error
    }
  }

  async getRevenueAnalytics(options: {
    period: string
    breakdown?: string
  }): Promise<any> {
    try {
      // Placeholder implementation
      return {
        period: options.period,
        breakdown: options.breakdown,
        data: [],
        summary: {
          total: 0,
          change: 0,
          changePercent: 0
        }
      }
    } catch (error) {
      logger.error('Error in getRevenueAnalytics:', error)
      throw error
    }
  }

  async getContentAnalytics(options: {
    period: string
    type?: string
  }): Promise<any> {
    try {
      // Placeholder implementation
      return {
        period: options.period,
        type: options.type,
        data: [],
        summary: {
          total: 0,
          change: 0,
          changePercent: 0
        }
      }
    } catch (error) {
      logger.error('Error in getContentAnalytics:', error)
      throw error
    }
  }

  async getSystemHealth(): Promise<SystemHealth> {
    try {
      // Check database health
      const dbHealth = await this.checkDatabaseHealth()
      
      // Check Redis health
      const redisHealth = await redisManager.healthCheck()
      
      // Get system metrics (simplified)
      const health: SystemHealth = {
        database: dbHealth,
        redis: redisHealth,
        storage: true, // Placeholder
        api: true, // Placeholder
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024, // MB
        cpuUsage: 0, // Would need system monitoring
        diskUsage: 0 // Would need system monitoring
      }

      return health
    } catch (error) {
      logger.error('Error in getSystemHealth:', error)
      throw error
    }
  }

  async getAuditLogs(options: {
    page: number
    limit: number
    action?: string
    userId?: string
    dateFrom?: string
    dateTo?: string
  }): Promise<AuditLog[]> {
    try {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })

      if (options.action) {
        query = query.eq('action', options.action)
      }

      if (options.userId) {
        query = query.eq('user_id', options.userId)
      }

      if (options.dateFrom) {
        query = query.gte('created_at', options.dateFrom)
      }

      if (options.dateTo) {
        query = query.lte('created_at', options.dateTo)
      }

      const { data, error } = await query
        .range(
          (options.page - 1) * options.limit,
          options.page * options.limit - 1
        )

      if (error) {
        logger.error('Error fetching audit logs:', error)
        return []
      }

      return data || []
    } catch (error) {
      logger.error('Error in getAuditLogs:', error)
      return []
    }
  }

  private async checkDatabaseHealth(): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('profiles')
        .select('id')
        .limit(1)
      
      return !error
    } catch (error) {
      return false
    }
  }

  private async logAdminAction(
    adminId: string,
    action: string,
    resourceType: string,
    resourceId: string,
    details: any
  ): Promise<void> {
    try {
      await supabase
        .from('audit_logs')
        .insert({
          id: require('uuid').v4(),
          action,
          user_id: adminId,
          resource_type: resourceType,
          resource_id: resourceId,
          old_values: null,
          new_values: details,
          ip_address: '127.0.0.1', // Would get from request
          user_agent: 'Admin Panel', // Would get from request
          created_at: new Date().toISOString()
        })
    } catch (error) {
      logger.error('Error logging admin action:', error)
    }
  }
}
