"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const database_1 = require("../config/database");
const logger_1 = require("../utils/logger");
const redis_1 = require("../config/redis");
class AdminService {
    constructor() {
        this.CACHE_TTL = 300;
    }
    async getDashboardStats() {
        try {
            const cacheKey = 'admin:dashboard:stats';
            const cached = await redis_1.redisManager.get(cacheKey);
            if (cached) {
                return cached;
            }
            const [usersResult, creatorsResult, postsResult, moderationsResult, reportsResult] = await Promise.all([
                database_1.supabase.from('profiles').select('*', { count: 'exact', head: true }),
                database_1.supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'creator'),
                database_1.supabase.from('posts').select('*', { count: 'exact', head: true }),
                database_1.supabase.from('moderation_queue').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
                database_1.supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'pending')
            ]);
            const totalUsers = usersResult.count || 0;
            const totalCreators = creatorsResult.count || 0;
            const totalPosts = postsResult.count || 0;
            const pendingModerations = moderationsResult.count || 0;
            const pendingReports = reportsResult.count || 0;
            const today = new Date().toISOString().split('T')[0];
            const [newUsersTodayResult, newCreatorsTodayResult] = await Promise.all([
                database_1.supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', today),
                database_1.supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'creator').gte('created_at', today)
            ]);
            const newUsersToday = newUsersTodayResult.count || 0;
            const newCreatorsToday = newCreatorsTodayResult.count || 0;
            const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
            const activeUsersResult = await database_1.supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .gte('last_active', yesterday);
            const activeUsers = activeUsersResult.count || 0;
            const totalRevenue = 0;
            const revenueToday = 0;
            const stats = {
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
            };
            await redis_1.redisManager.set(cacheKey, stats, this.CACHE_TTL);
            return stats;
        }
        catch (error) {
            logger_1.logger.error('Error in getDashboardStats:', error);
            throw error;
        }
    }
    async getModerationQueue(options) {
        try {
            let query = database_1.supabase
                .from('moderation_queue')
                .select('*')
                .eq('status', options.status)
                .order('created_at', { ascending: false });
            if (options.type) {
                query = query.eq('type', options.type);
            }
            const { data, error } = await query
                .range((options.page - 1) * options.limit, options.page * options.limit - 1);
            if (error) {
                logger_1.logger.error('Error fetching moderation queue:', error);
                return [];
            }
            return data || [];
        }
        catch (error) {
            logger_1.logger.error('Error in getModerationQueue:', error);
            return [];
        }
    }
    async reviewModerationItem(id, reviewerId, action, reason) {
        try {
            const { data, error } = await database_1.supabase
                .from('moderation_queue')
                .update({
                status: action === 'approve' ? 'approved' : 'rejected',
                reviewed_by: reviewerId,
                reviewed_at: new Date().toISOString(),
                review_notes: reason
            })
                .eq('id', id)
                .select()
                .single();
            if (error) {
                logger_1.logger.error('Error reviewing moderation item:', error);
                throw error;
            }
            return data;
        }
        catch (error) {
            logger_1.logger.error('Error in reviewModerationItem:', error);
            throw error;
        }
    }
    async getReports(options) {
        try {
            let query = database_1.supabase
                .from('reports')
                .select('*')
                .eq('status', options.status)
                .order('created_at', { ascending: false });
            if (options.type) {
                query = query.eq('type', options.type);
            }
            const { data, error } = await query
                .range((options.page - 1) * options.limit, options.page * options.limit - 1);
            if (error) {
                logger_1.logger.error('Error fetching reports:', error);
                return [];
            }
            return data || [];
        }
        catch (error) {
            logger_1.logger.error('Error in getReports:', error);
            return [];
        }
    }
    async handleReport(id, adminId, action, notes) {
        try {
            const { data, error } = await database_1.supabase
                .from('reports')
                .update({
                status: action === 'resolve' ? 'resolved' : 'dismissed',
                resolved_by: adminId,
                resolved_at: new Date().toISOString(),
                resolution: notes
            })
                .eq('id', id)
                .select()
                .single();
            if (error) {
                logger_1.logger.error('Error handling report:', error);
                throw error;
            }
            return data;
        }
        catch (error) {
            logger_1.logger.error('Error in handleReport:', error);
            throw error;
        }
    }
    async getUsers(options) {
        try {
            let query = database_1.supabase
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
                .order('created_at', { ascending: false });
            if (options.search) {
                query = query.or(`username.ilike.%${options.search}%,display_name.ilike.%${options.search}%,email.ilike.%${options.search}%`);
            }
            if (options.role) {
                query = query.eq('role', options.role);
            }
            if (options.status) {
                query = query.eq('status', options.status);
            }
            const { data, error } = await query
                .range((options.page - 1) * options.limit, options.page * options.limit - 1);
            if (error) {
                logger_1.logger.error('Error fetching users:', error);
                return [];
            }
            return data || [];
        }
        catch (error) {
            logger_1.logger.error('Error in getUsers:', error);
            return [];
        }
    }
    async updateUserStatus(userId, status, reason, adminId) {
        try {
            const { data, error } = await database_1.supabase
                .from('profiles')
                .update({
                status,
                updated_at: new Date().toISOString()
            })
                .eq('id', userId)
                .select()
                .single();
            if (error) {
                logger_1.logger.error('Error updating user status:', error);
                throw error;
            }
            await this.logAdminAction(adminId, 'update_user_status', 'user', userId, {
                status,
                reason
            });
            return data;
        }
        catch (error) {
            logger_1.logger.error('Error in updateUserStatus:', error);
            throw error;
        }
    }
    async getCreators(options) {
        try {
            let query = database_1.supabase
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
                .order('created_at', { ascending: false });
            if (options.search) {
                query = query.or(`username.ilike.%${options.search}%,display_name.ilike.%${options.search}%`);
            }
            if (options.verificationStatus) {
                query = query.eq('verification_status', options.verificationStatus);
            }
            const { data, error } = await query
                .range((options.page - 1) * options.limit, options.page * options.limit - 1);
            if (error) {
                logger_1.logger.error('Error fetching creators:', error);
                return [];
            }
            return data || [];
        }
        catch (error) {
            logger_1.logger.error('Error in getCreators:', error);
            return [];
        }
    }
    async verifyCreator(creatorId, status, notes, adminId) {
        try {
            const { data, error } = await database_1.supabase
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
                .single();
            if (error) {
                logger_1.logger.error('Error verifying creator:', error);
                throw error;
            }
            await this.logAdminAction(adminId, 'verify_creator', 'creator', creatorId, {
                status,
                notes
            });
            return data;
        }
        catch (error) {
            logger_1.logger.error('Error in verifyCreator:', error);
            throw error;
        }
    }
    async getAnalytics(options) {
        try {
            const analytics = {
                period: options.period,
                metric: options.metric || 'users',
                data: [],
                summary: {
                    total: 0,
                    change: 0,
                    changePercent: 0
                }
            };
            return analytics;
        }
        catch (error) {
            logger_1.logger.error('Error in getAnalytics:', error);
            throw error;
        }
    }
    async getRevenueAnalytics(options) {
        try {
            return {
                period: options.period,
                breakdown: options.breakdown,
                data: [],
                summary: {
                    total: 0,
                    change: 0,
                    changePercent: 0
                }
            };
        }
        catch (error) {
            logger_1.logger.error('Error in getRevenueAnalytics:', error);
            throw error;
        }
    }
    async getContentAnalytics(options) {
        try {
            return {
                period: options.period,
                type: options.type,
                data: [],
                summary: {
                    total: 0,
                    change: 0,
                    changePercent: 0
                }
            };
        }
        catch (error) {
            logger_1.logger.error('Error in getContentAnalytics:', error);
            throw error;
        }
    }
    async getSystemHealth() {
        try {
            const dbHealth = await this.checkDatabaseHealth();
            const redisHealth = await redis_1.redisManager.healthCheck();
            const health = {
                database: dbHealth,
                redis: redisHealth,
                storage: true,
                api: true,
                uptime: process.uptime(),
                memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024,
                cpuUsage: 0,
                diskUsage: 0
            };
            return health;
        }
        catch (error) {
            logger_1.logger.error('Error in getSystemHealth:', error);
            throw error;
        }
    }
    async getAuditLogs(options) {
        try {
            let query = database_1.supabase
                .from('audit_logs')
                .select('*')
                .order('created_at', { ascending: false });
            if (options.action) {
                query = query.eq('action', options.action);
            }
            if (options.userId) {
                query = query.eq('user_id', options.userId);
            }
            if (options.dateFrom) {
                query = query.gte('created_at', options.dateFrom);
            }
            if (options.dateTo) {
                query = query.lte('created_at', options.dateTo);
            }
            const { data, error } = await query
                .range((options.page - 1) * options.limit, options.page * options.limit - 1);
            if (error) {
                logger_1.logger.error('Error fetching audit logs:', error);
                return [];
            }
            return data || [];
        }
        catch (error) {
            logger_1.logger.error('Error in getAuditLogs:', error);
            return [];
        }
    }
    async checkDatabaseHealth() {
        try {
            const { error } = await database_1.supabase
                .from('profiles')
                .select('id')
                .limit(1);
            return !error;
        }
        catch (error) {
            return false;
        }
    }
    async logAdminAction(adminId, action, resourceType, resourceId, details) {
        try {
            await database_1.supabase
                .from('audit_logs')
                .insert({
                id: require('uuid').v4(),
                action,
                user_id: adminId,
                resource_type: resourceType,
                resource_id: resourceId,
                old_values: null,
                new_values: details,
                ip_address: '127.0.0.1',
                user_agent: 'Admin Panel',
                created_at: new Date().toISOString()
            });
        }
        catch (error) {
            logger_1.logger.error('Error logging admin action:', error);
        }
    }
}
exports.AdminService = AdminService;
//# sourceMappingURL=adminService.js.map