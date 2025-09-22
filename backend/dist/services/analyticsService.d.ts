export interface AnalyticsPeriod {
    period: string;
    startDate?: string;
    endDate?: string;
}
export interface PlatformAnalytics {
    totalUsers: number;
    totalCreators: number;
    totalPosts: number;
    totalRevenue: number;
    activeUsers: number;
    newUsers: number;
    userGrowth: number;
    revenueGrowth: number;
    topCreators: Array<{
        id: string;
        username: string;
        earnings: number;
        subscribers: number;
    }>;
    contentStats: {
        totalPosts: number;
        totalViews: number;
        totalLikes: number;
        totalComments: number;
    };
    engagement: {
        averageEngagementRate: number;
        averageSessionDuration: number;
        bounceRate: number;
    };
    timeline: Array<{
        date: string;
        users: number;
        revenue: number;
        posts: number;
        engagement: number;
    }>;
}
export interface CreatorAnalytics {
    totalSubscribers: number;
    totalEarnings: number;
    totalPosts: number;
    totalViews: number;
    averageEngagementRate: number;
    subscriberGrowth: number;
    earningsGrowth: number;
    topPosts: Array<{
        id: string;
        title: string;
        views: number;
        likes: number;
        comments: number;
        earnings: number;
    }>;
    demographics: {
        ageGroups: Record<string, number>;
        locations: Record<string, number>;
        devices: Record<string, number>;
    };
    timeline: Array<{
        date: string;
        subscribers: number;
        earnings: number;
        views: number;
        engagement: number;
    }>;
}
export interface ContentAnalytics {
    totalPosts: number;
    totalViews: number;
    totalLikes: number;
    totalComments: number;
    totalShares: number;
    averageEngagementRate: number;
    topPerformingPosts: Array<{
        id: string;
        title: string;
        type: string;
        views: number;
        likes: number;
        comments: number;
        shares: number;
        engagementRate: number;
    }>;
    contentTypes: Record<string, {
        count: number;
        views: number;
        engagement: number;
    }>;
    timeline: Array<{
        date: string;
        posts: number;
        views: number;
        engagement: number;
    }>;
}
export interface RevenueAnalytics {
    totalRevenue: number;
    monthlyRevenue: number;
    revenueGrowth: number;
    revenueSources: {
        subscriptions: number;
        tips: number;
        payPerView: number;
        merchandise: number;
    };
    topEarningPosts: Array<{
        id: string;
        title: string;
        revenue: number;
        views: number;
    }>;
    payoutHistory: Array<{
        date: string;
        amount: number;
        status: string;
    }>;
    timeline: Array<{
        date: string;
        revenue: number;
        transactions: number;
    }>;
}
export interface AudienceAnalytics {
    totalFollowers: number;
    activeFollowers: number;
    followerGrowth: number;
    demographics: {
        ageGroups: Record<string, number>;
        genders: Record<string, number>;
        locations: Record<string, number>;
        devices: Record<string, number>;
    };
    engagement: {
        averageEngagementRate: number;
        averageSessionDuration: number;
        retentionRate: number;
    };
    topLocations: Array<{
        location: string;
        count: number;
        percentage: number;
    }>;
    timeline: Array<{
        date: string;
        followers: number;
        engagement: number;
    }>;
}
export interface EngagementAnalytics {
    totalEngagement: number;
    averageEngagementRate: number;
    engagementGrowth: number;
    engagementTypes: {
        likes: number;
        comments: number;
        shares: number;
        saves: number;
    };
    topEngagingPosts: Array<{
        id: string;
        title: string;
        engagementRate: number;
        totalEngagement: number;
    }>;
    engagementTrends: Array<{
        date: string;
        engagementRate: number;
        totalEngagement: number;
    }>;
}
export interface StreamAnalytics {
    totalStreams: number;
    totalViewers: number;
    totalDuration: number;
    averageViewers: number;
    peakViewers: number;
    topStreams: Array<{
        id: string;
        title: string;
        viewers: number;
        duration: number;
        gifts: number;
    }>;
    streamCategories: Record<string, {
        count: number;
        totalViewers: number;
        averageViewers: number;
    }>;
    timeline: Array<{
        date: string;
        streams: number;
        viewers: number;
        duration: number;
    }>;
}
export interface ChatAnalytics {
    totalSessions: number;
    totalMatches: number;
    totalMessages: number;
    averageSessionDuration: number;
    matchRate: number;
    topInterests: Array<{
        interest: string;
        count: number;
        percentage: number;
    }>;
    userSatisfaction: {
        averageRating: number;
        totalRatings: number;
    };
    timeline: Array<{
        date: string;
        sessions: number;
        matches: number;
        messages: number;
    }>;
}
export interface RealTimeMetrics {
    onlineUsers: number;
    activeStreams: number;
    activeChatSessions: number;
    currentRevenue: number;
    systemHealth: {
        cpu: number;
        memory: number;
        disk: number;
        network: number;
    };
    recentActivity: Array<{
        type: string;
        description: string;
        timestamp: string;
    }>;
}
declare class AnalyticsService {
    getPlatformAnalytics(options: AnalyticsPeriod): Promise<PlatformAnalytics>;
    getCreatorAnalytics(creatorId: string, options: AnalyticsPeriod): Promise<CreatorAnalytics>;
    getContentAnalytics(creatorId: string, options: {
        period: string;
        contentType?: string;
    }): Promise<ContentAnalytics>;
    getRevenueAnalytics(creatorId: string, options: AnalyticsPeriod): Promise<RevenueAnalytics>;
    getAudienceAnalytics(creatorId: string, options: AnalyticsPeriod): Promise<AudienceAnalytics>;
    getEngagementAnalytics(creatorId: string, options: {
        period: string;
        contentType?: string;
    }): Promise<EngagementAnalytics>;
    getStreamAnalytics(creatorId: string, options: {
        period: string;
        streamId?: string;
    }): Promise<StreamAnalytics>;
    getChatAnalytics(userId: string, options: AnalyticsPeriod): Promise<ChatAnalytics>;
    getRealTimeMetrics(): Promise<RealTimeMetrics>;
    getAnalyticsDashboard(creatorId: string, options: AnalyticsPeriod): Promise<any>;
    exportAnalyticsData(creatorId: string, options: {
        period: string;
        format: string;
        type: string;
    }): Promise<Buffer>;
    private getDateRange;
    private convertToCSV;
    private getTotalUsers;
    private getTotalCreators;
    private getTotalPosts;
    private getTotalRevenue;
    private getActiveUsers;
    private getNewUsers;
    private getUserGrowth;
    private getRevenueGrowth;
    private getTopCreators;
    private getContentStats;
    private getEngagementMetrics;
    private getPlatformTimeline;
    private getCreatorSubscribers;
    private getCreatorEarnings;
    private getCreatorPosts;
    private getCreatorViews;
    private getCreatorEngagementRate;
    private getCreatorSubscriberGrowth;
    private getCreatorEarningsGrowth;
    private getCreatorTopPosts;
    private getCreatorDemographics;
    private getCreatorTimeline;
    private getCreatorLikes;
    private getCreatorComments;
    private getCreatorShares;
    private getCreatorTopPerformingPosts;
    private getCreatorContentTypes;
    private getContentTimeline;
    private getCreatorTotalRevenue;
    private getCreatorMonthlyRevenue;
    private getCreatorRevenueGrowth;
    private getCreatorRevenueSources;
    private getCreatorTopEarningPosts;
    private getCreatorPayoutHistory;
    private getRevenueTimeline;
    private getCreatorFollowers;
    private getCreatorActiveFollowers;
    private getCreatorFollowerGrowth;
    private getCreatorEngagementMetrics;
    private getCreatorTopLocations;
    private getAudienceTimeline;
    private getCreatorTotalEngagement;
    private getCreatorEngagementGrowth;
    private getCreatorEngagementTypes;
    private getCreatorTopEngagingPosts;
    private getCreatorEngagementTrends;
    private getCreatorStreams;
    private getCreatorStreamViewers;
    private getCreatorStreamDuration;
    private getCreatorAverageStreamViewers;
    private getCreatorPeakStreamViewers;
    private getCreatorTopStreams;
    private getCreatorStreamCategories;
    private getStreamTimeline;
    private getUserChatSessions;
    private getUserChatMatches;
    private getUserChatMessages;
    private getUserAverageChatSessionDuration;
    private getUserChatMatchRate;
    private getUserTopChatInterests;
    private getUserChatSatisfaction;
    private getChatTimeline;
    private getOnlineUsersCount;
    private getActiveStreamsCount;
    private getActiveChatSessionsCount;
    private getCurrentRevenue;
    private getRecentActivity;
}
export declare const analyticsService: AnalyticsService;
export {};
//# sourceMappingURL=analyticsService.d.ts.map