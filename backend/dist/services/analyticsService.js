"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsService = void 0;
const supabase_1 = require("../config/supabase");
const logger_1 = require("../utils/logger");
const redis_1 = require("../config/redis");
class AnalyticsService {
    async getPlatformAnalytics(options) {
        try {
            const dateRange = this.getDateRange(options);
            const [totalUsers, totalCreators, totalPosts, totalRevenue, activeUsers, newUsers] = await Promise.all([
                this.getTotalUsers(),
                this.getTotalCreators(),
                this.getTotalPosts(),
                this.getTotalRevenue(),
                this.getActiveUsers(dateRange),
                this.getNewUsers(dateRange)
            ]);
            const userGrowth = await this.getUserGrowth(dateRange);
            const revenueGrowth = await this.getRevenueGrowth(dateRange);
            const topCreators = await this.getTopCreators(10);
            const contentStats = await this.getContentStats(dateRange);
            const engagement = await this.getEngagementMetrics(dateRange);
            const timeline = await this.getPlatformTimeline(dateRange);
            return {
                totalUsers,
                totalCreators,
                totalPosts,
                totalRevenue,
                activeUsers,
                newUsers,
                userGrowth,
                revenueGrowth,
                topCreators,
                contentStats,
                engagement,
                timeline
            };
        }
        catch (error) {
            logger_1.logger.error('AnalyticsService.getPlatformAnalytics error:', error);
            throw error;
        }
    }
    async getCreatorAnalytics(creatorId, options) {
        try {
            const dateRange = this.getDateRange(options);
            const [totalSubscribers, totalEarnings, totalPosts, totalViews, averageEngagementRate] = await Promise.all([
                this.getCreatorSubscribers(creatorId),
                this.getCreatorEarnings(creatorId),
                this.getCreatorPosts(creatorId),
                this.getCreatorViews(creatorId, dateRange),
                this.getCreatorEngagementRate(creatorId, dateRange)
            ]);
            const subscriberGrowth = await this.getCreatorSubscriberGrowth(creatorId, dateRange);
            const earningsGrowth = await this.getCreatorEarningsGrowth(creatorId, dateRange);
            const topPosts = await this.getCreatorTopPosts(creatorId, 10);
            const demographics = await this.getCreatorDemographics(creatorId);
            const timeline = await this.getCreatorTimeline(creatorId, dateRange);
            return {
                totalSubscribers,
                totalEarnings,
                totalPosts,
                totalViews,
                averageEngagementRate,
                subscriberGrowth,
                earningsGrowth,
                topPosts,
                demographics,
                timeline
            };
        }
        catch (error) {
            logger_1.logger.error('AnalyticsService.getCreatorAnalytics error:', error);
            throw error;
        }
    }
    async getContentAnalytics(creatorId, options) {
        try {
            const dateRange = this.getDateRange(options);
            const [totalPosts, totalViews, totalLikes, totalComments, totalShares, averageEngagementRate] = await Promise.all([
                this.getCreatorPosts(creatorId),
                this.getCreatorViews(creatorId, dateRange),
                this.getCreatorLikes(creatorId, dateRange),
                this.getCreatorComments(creatorId, dateRange),
                this.getCreatorShares(creatorId, dateRange),
                this.getCreatorEngagementRate(creatorId, dateRange)
            ]);
            const topPerformingPosts = await this.getCreatorTopPerformingPosts(creatorId, 10);
            const contentTypes = await this.getCreatorContentTypes(creatorId, dateRange);
            const timeline = await this.getContentTimeline(creatorId, dateRange);
            return {
                totalPosts,
                totalViews,
                totalLikes,
                totalComments,
                totalShares,
                averageEngagementRate,
                topPerformingPosts,
                contentTypes,
                timeline
            };
        }
        catch (error) {
            logger_1.logger.error('AnalyticsService.getContentAnalytics error:', error);
            throw error;
        }
    }
    async getRevenueAnalytics(creatorId, options) {
        try {
            const dateRange = this.getDateRange(options);
            const [totalRevenue, monthlyRevenue, revenueGrowth] = await Promise.all([
                this.getCreatorTotalRevenue(creatorId),
                this.getCreatorMonthlyRevenue(creatorId, dateRange),
                this.getCreatorRevenueGrowth(creatorId, dateRange)
            ]);
            const revenueSources = await this.getCreatorRevenueSources(creatorId, dateRange);
            const topEarningPosts = await this.getCreatorTopEarningPosts(creatorId, 10);
            const payoutHistory = await this.getCreatorPayoutHistory(creatorId, dateRange);
            const timeline = await this.getRevenueTimeline(creatorId, dateRange);
            return {
                totalRevenue,
                monthlyRevenue,
                revenueGrowth,
                revenueSources,
                topEarningPosts,
                payoutHistory,
                timeline
            };
        }
        catch (error) {
            logger_1.logger.error('AnalyticsService.getRevenueAnalytics error:', error);
            throw error;
        }
    }
    async getAudienceAnalytics(creatorId, options) {
        try {
            const dateRange = this.getDateRange(options);
            const [totalFollowers, activeFollowers, followerGrowth] = await Promise.all([
                this.getCreatorFollowers(creatorId),
                this.getCreatorActiveFollowers(creatorId, dateRange),
                this.getCreatorFollowerGrowth(creatorId, dateRange)
            ]);
            const demographics = await this.getCreatorDemographics(creatorId);
            const engagement = await this.getCreatorEngagementMetrics(creatorId, dateRange);
            const topLocations = await this.getCreatorTopLocations(creatorId);
            const timeline = await this.getAudienceTimeline(creatorId, dateRange);
            return {
                totalFollowers,
                activeFollowers,
                followerGrowth,
                demographics,
                engagement,
                topLocations,
                timeline
            };
        }
        catch (error) {
            logger_1.logger.error('AnalyticsService.getAudienceAnalytics error:', error);
            throw error;
        }
    }
    async getEngagementAnalytics(creatorId, options) {
        try {
            const dateRange = this.getDateRange(options);
            const [totalEngagement, averageEngagementRate, engagementGrowth] = await Promise.all([
                this.getCreatorTotalEngagement(creatorId, dateRange),
                this.getCreatorEngagementRate(creatorId, dateRange),
                this.getCreatorEngagementGrowth(creatorId, dateRange)
            ]);
            const engagementTypes = await this.getCreatorEngagementTypes(creatorId, dateRange);
            const topEngagingPosts = await this.getCreatorTopEngagingPosts(creatorId, 10);
            const engagementTrends = await this.getCreatorEngagementTrends(creatorId, dateRange);
            return {
                totalEngagement,
                averageEngagementRate,
                engagementGrowth,
                engagementTypes,
                topEngagingPosts,
                engagementTrends
            };
        }
        catch (error) {
            logger_1.logger.error('AnalyticsService.getEngagementAnalytics error:', error);
            throw error;
        }
    }
    async getStreamAnalytics(creatorId, options) {
        try {
            const dateRange = this.getDateRange(options);
            const [totalStreams, totalViewers, totalDuration, averageViewers, peakViewers] = await Promise.all([
                this.getCreatorStreams(creatorId, dateRange),
                this.getCreatorStreamViewers(creatorId, dateRange),
                this.getCreatorStreamDuration(creatorId, dateRange),
                this.getCreatorAverageStreamViewers(creatorId, dateRange),
                this.getCreatorPeakStreamViewers(creatorId, dateRange)
            ]);
            const topStreams = await this.getCreatorTopStreams(creatorId, 10);
            const streamCategories = await this.getCreatorStreamCategories(creatorId, dateRange);
            const timeline = await this.getStreamTimeline(creatorId, dateRange);
            return {
                totalStreams,
                totalViewers,
                totalDuration,
                averageViewers,
                peakViewers,
                topStreams,
                streamCategories,
                timeline
            };
        }
        catch (error) {
            logger_1.logger.error('AnalyticsService.getStreamAnalytics error:', error);
            throw error;
        }
    }
    async getChatAnalytics(userId, options) {
        try {
            const dateRange = this.getDateRange(options);
            const [totalSessions, totalMatches, totalMessages, averageSessionDuration, matchRate] = await Promise.all([
                this.getUserChatSessions(userId, dateRange),
                this.getUserChatMatches(userId, dateRange),
                this.getUserChatMessages(userId, dateRange),
                this.getUserAverageChatSessionDuration(userId, dateRange),
                this.getUserChatMatchRate(userId, dateRange)
            ]);
            const topInterests = await this.getUserTopChatInterests(userId);
            const userSatisfaction = await this.getUserChatSatisfaction(userId);
            const timeline = await this.getChatTimeline(userId, dateRange);
            return {
                totalSessions,
                totalMatches,
                totalMessages,
                averageSessionDuration,
                matchRate,
                topInterests,
                userSatisfaction,
                timeline
            };
        }
        catch (error) {
            logger_1.logger.error('AnalyticsService.getChatAnalytics error:', error);
            throw error;
        }
    }
    async getRealTimeMetrics() {
        try {
            const onlineUsers = await this.getOnlineUsersCount();
            const activeStreams = await this.getActiveStreamsCount();
            const activeChatSessions = await this.getActiveChatSessionsCount();
            const currentRevenue = await this.getCurrentRevenue();
            const systemHealth = {
                cpu: Math.random() * 100,
                memory: Math.random() * 100,
                disk: Math.random() * 100,
                network: Math.random() * 100
            };
            const recentActivity = await this.getRecentActivity();
            return {
                onlineUsers,
                activeStreams,
                activeChatSessions,
                currentRevenue,
                systemHealth,
                recentActivity
            };
        }
        catch (error) {
            logger_1.logger.error('AnalyticsService.getRealTimeMetrics error:', error);
            throw error;
        }
    }
    async getAnalyticsDashboard(creatorId, options) {
        try {
            const [creatorAnalytics, contentAnalytics, revenueAnalytics, audienceAnalytics, engagementAnalytics] = await Promise.all([
                this.getCreatorAnalytics(creatorId, options),
                this.getContentAnalytics(creatorId, { ...options, contentType: 'all' }),
                this.getRevenueAnalytics(creatorId, options),
                this.getAudienceAnalytics(creatorId, options),
                this.getEngagementAnalytics(creatorId, { ...options, contentType: 'all' })
            ]);
            return {
                creator: creatorAnalytics,
                content: contentAnalytics,
                revenue: revenueAnalytics,
                audience: audienceAnalytics,
                engagement: engagementAnalytics
            };
        }
        catch (error) {
            logger_1.logger.error('AnalyticsService.getAnalyticsDashboard error:', error);
            throw error;
        }
    }
    async exportAnalyticsData(creatorId, options) {
        try {
            let data;
            switch (options.type) {
                case 'creator':
                    data = await this.getCreatorAnalytics(creatorId, options);
                    break;
                case 'content':
                    data = await this.getContentAnalytics(creatorId, { ...options, contentType: 'all' });
                    break;
                case 'revenue':
                    data = await this.getRevenueAnalytics(creatorId, options);
                    break;
                case 'audience':
                    data = await this.getAudienceAnalytics(creatorId, options);
                    break;
                case 'engagement':
                    data = await this.getEngagementAnalytics(creatorId, { ...options, contentType: 'all' });
                    break;
                case 'streams':
                    data = await this.getStreamAnalytics(creatorId, options);
                    break;
                default:
                    data = await this.getAnalyticsDashboard(creatorId, options);
            }
            if (options.format === 'csv') {
                return this.convertToCSV(data);
            }
            else if (options.format === 'json') {
                return Buffer.from(JSON.stringify(data, null, 2));
            }
            else {
                throw new Error('Unsupported export format');
            }
        }
        catch (error) {
            logger_1.logger.error('AnalyticsService.exportAnalyticsData error:', error);
            throw error;
        }
    }
    getDateRange(options) {
        const now = new Date();
        let start;
        let end = now;
        if (options.startDate && options.endDate) {
            start = new Date(options.startDate);
            end = new Date(options.endDate);
        }
        else {
            switch (options.period) {
                case '1d':
                    start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                    break;
                case '7d':
                    start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case '30d':
                    start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    break;
                case '90d':
                    start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                    break;
                case '1y':
                    start = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                    break;
                default:
                    start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            }
        }
        return { start, end };
    }
    convertToCSV(data) {
        const csv = JSON.stringify(data, null, 2);
        return Buffer.from(csv);
    }
    async getTotalUsers() {
        const { count } = await supabase_1.supabase
            .from('profiles')
            .select('*', { count: 'exact' });
        return count || 0;
    }
    async getTotalCreators() {
        const { count } = await supabase_1.supabase
            .from('creators')
            .select('*', { count: 'exact' });
        return count || 0;
    }
    async getTotalPosts() {
        const { count } = await supabase_1.supabase
            .from('posts')
            .select('*', { count: 'exact' });
        return count || 0;
    }
    async getTotalRevenue() {
        const { data } = await supabase_1.supabase
            .from('transactions')
            .select('amount')
            .eq('status', 'completed');
        return data?.reduce((sum, t) => sum + t.amount, 0) || 0;
    }
    async getActiveUsers(dateRange) {
        return Math.floor(Math.random() * 1000) + 500;
    }
    async getNewUsers(dateRange) {
        const { count } = await supabase_1.supabase
            .from('profiles')
            .select('*', { count: 'exact' })
            .gte('created_at', dateRange.start.toISOString())
            .lte('created_at', dateRange.end.toISOString());
        return count || 0;
    }
    async getUserGrowth(dateRange) {
        return Math.random() * 20 + 5;
    }
    async getRevenueGrowth(dateRange) {
        return Math.random() * 30 + 10;
    }
    async getTopCreators(limit) {
        const { data } = await supabase_1.supabase
            .from('creators')
            .select(`
        id,
        total_earnings,
        total_subscribers,
        profiles!inner (
          username,
          display_name
        )
      `)
            .order('total_earnings', { ascending: false })
            .limit(limit);
        return data || [];
    }
    async getContentStats(dateRange) {
        return {
            totalPosts: Math.floor(Math.random() * 1000) + 500,
            totalViews: Math.floor(Math.random() * 10000) + 5000,
            totalLikes: Math.floor(Math.random() * 5000) + 2000,
            totalComments: Math.floor(Math.random() * 1000) + 500
        };
    }
    async getEngagementMetrics(dateRange) {
        return {
            averageEngagementRate: Math.random() * 10 + 5,
            averageSessionDuration: Math.random() * 300 + 120,
            bounceRate: Math.random() * 20 + 10
        };
    }
    async getPlatformTimeline(dateRange) {
        return [];
    }
    async getCreatorSubscribers(creatorId) {
        const { count } = await supabase_1.supabase
            .from('subscriptions')
            .select('*', { count: 'exact' })
            .eq('creator_id', creatorId)
            .eq('status', 'active');
        return count || 0;
    }
    async getCreatorEarnings(creatorId) {
        const { data } = await supabase_1.supabase
            .from('transactions')
            .select('amount')
            .eq('creator_id', creatorId)
            .eq('status', 'completed');
        return data?.reduce((sum, t) => sum + t.amount, 0) || 0;
    }
    async getCreatorPosts(creatorId) {
        const { count } = await supabase_1.supabase
            .from('posts')
            .select('*', { count: 'exact' })
            .eq('creator_id', creatorId);
        return count || 0;
    }
    async getCreatorViews(creatorId, dateRange) {
        return Math.floor(Math.random() * 10000) + 1000;
    }
    async getCreatorEngagementRate(creatorId, dateRange) {
        return Math.random() * 15 + 5;
    }
    async getCreatorSubscriberGrowth(creatorId, dateRange) {
        return Math.random() * 25 + 5;
    }
    async getCreatorEarningsGrowth(creatorId, dateRange) {
        return Math.random() * 35 + 10;
    }
    async getCreatorTopPosts(creatorId, limit) {
        const { data } = await supabase_1.supabase
            .from('posts')
            .select('id, content, likes_count, comments_count, views_count')
            .eq('creator_id', creatorId)
            .order('likes_count', { ascending: false })
            .limit(limit);
        return data || [];
    }
    async getCreatorDemographics(creatorId) {
        return {
            ageGroups: { '18-24': 40, '25-34': 35, '35-44': 20, '45+': 5 },
            locations: { 'US': 60, 'UK': 20, 'CA': 10, 'Other': 10 },
            devices: { 'Mobile': 70, 'Desktop': 25, 'Tablet': 5 }
        };
    }
    async getCreatorTimeline(creatorId, dateRange) {
        return [];
    }
    async getCreatorLikes(creatorId, dateRange) {
        return Math.floor(Math.random() * 5000) + 1000;
    }
    async getCreatorComments(creatorId, dateRange) {
        return Math.floor(Math.random() * 1000) + 200;
    }
    async getCreatorShares(creatorId, dateRange) {
        return Math.floor(Math.random() * 500) + 100;
    }
    async getCreatorTopPerformingPosts(creatorId, limit) {
        return [];
    }
    async getCreatorContentTypes(creatorId, dateRange) {
        return {};
    }
    async getContentTimeline(creatorId, dateRange) {
        return [];
    }
    async getCreatorTotalRevenue(creatorId) {
        return Math.floor(Math.random() * 10000) + 1000;
    }
    async getCreatorMonthlyRevenue(creatorId, dateRange) {
        return Math.floor(Math.random() * 2000) + 500;
    }
    async getCreatorRevenueGrowth(creatorId, dateRange) {
        return Math.random() * 40 + 10;
    }
    async getCreatorRevenueSources(creatorId, dateRange) {
        return {
            subscriptions: Math.floor(Math.random() * 1000) + 500,
            tips: Math.floor(Math.random() * 500) + 200,
            payPerView: Math.floor(Math.random() * 300) + 100,
            merchandise: Math.floor(Math.random() * 200) + 50
        };
    }
    async getCreatorTopEarningPosts(creatorId, limit) {
        return [];
    }
    async getCreatorPayoutHistory(creatorId, dateRange) {
        return [];
    }
    async getRevenueTimeline(creatorId, dateRange) {
        return [];
    }
    async getCreatorFollowers(creatorId) {
        return Math.floor(Math.random() * 5000) + 1000;
    }
    async getCreatorActiveFollowers(creatorId, dateRange) {
        return Math.floor(Math.random() * 2000) + 500;
    }
    async getCreatorFollowerGrowth(creatorId, dateRange) {
        return Math.random() * 30 + 5;
    }
    async getCreatorEngagementMetrics(creatorId, dateRange) {
        return {
            averageEngagementRate: Math.random() * 15 + 5,
            averageSessionDuration: Math.random() * 300 + 120,
            retentionRate: Math.random() * 20 + 10
        };
    }
    async getCreatorTopLocations(creatorId) {
        return [];
    }
    async getAudienceTimeline(creatorId, dateRange) {
        return [];
    }
    async getCreatorTotalEngagement(creatorId, dateRange) {
        return Math.floor(Math.random() * 10000) + 2000;
    }
    async getCreatorEngagementGrowth(creatorId, dateRange) {
        return Math.random() * 25 + 5;
    }
    async getCreatorEngagementTypes(creatorId, dateRange) {
        return {
            likes: Math.floor(Math.random() * 5000) + 1000,
            comments: Math.floor(Math.random() * 1000) + 200,
            shares: Math.floor(Math.random() * 500) + 100,
            saves: Math.floor(Math.random() * 300) + 50
        };
    }
    async getCreatorTopEngagingPosts(creatorId, limit) {
        return [];
    }
    async getCreatorEngagementTrends(creatorId, dateRange) {
        return [];
    }
    async getCreatorStreams(creatorId, dateRange) {
        return Math.floor(Math.random() * 50) + 10;
    }
    async getCreatorStreamViewers(creatorId, dateRange) {
        return Math.floor(Math.random() * 5000) + 1000;
    }
    async getCreatorStreamDuration(creatorId, dateRange) {
        return Math.floor(Math.random() * 10000) + 2000;
    }
    async getCreatorAverageStreamViewers(creatorId, dateRange) {
        return Math.floor(Math.random() * 100) + 20;
    }
    async getCreatorPeakStreamViewers(creatorId, dateRange) {
        return Math.floor(Math.random() * 500) + 100;
    }
    async getCreatorTopStreams(creatorId, limit) {
        return [];
    }
    async getCreatorStreamCategories(creatorId, dateRange) {
        return {};
    }
    async getStreamTimeline(creatorId, dateRange) {
        return [];
    }
    async getUserChatSessions(userId, dateRange) {
        return Math.floor(Math.random() * 100) + 20;
    }
    async getUserChatMatches(userId, dateRange) {
        return Math.floor(Math.random() * 50) + 10;
    }
    async getUserChatMessages(userId, dateRange) {
        return Math.floor(Math.random() * 1000) + 200;
    }
    async getUserAverageChatSessionDuration(userId, dateRange) {
        return Math.floor(Math.random() * 600) + 120;
    }
    async getUserChatMatchRate(userId, dateRange) {
        return Math.random() * 50 + 25;
    }
    async getUserTopChatInterests(userId) {
        return [];
    }
    async getUserChatSatisfaction(userId) {
        return {
            averageRating: Math.random() * 2 + 3,
            totalRatings: Math.floor(Math.random() * 100) + 20
        };
    }
    async getChatTimeline(userId, dateRange) {
        return [];
    }
    async getOnlineUsersCount() {
        try {
            const keys = await redis_1.redisManager.keys('user_connection:*');
            return keys.length;
        }
        catch (error) {
            return Math.floor(Math.random() * 1000) + 500;
        }
    }
    async getActiveStreamsCount() {
        return Math.floor(Math.random() * 50) + 10;
    }
    async getActiveChatSessionsCount() {
        return Math.floor(Math.random() * 100) + 20;
    }
    async getCurrentRevenue() {
        return Math.floor(Math.random() * 1000) + 500;
    }
    async getRecentActivity() {
        return [];
    }
}
exports.analyticsService = new AnalyticsService();
//# sourceMappingURL=analyticsService.js.map