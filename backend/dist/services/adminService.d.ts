export interface DashboardStats {
    totalUsers: number;
    totalCreators: number;
    totalPosts: number;
    totalRevenue: number;
    pendingModerations: number;
    pendingReports: number;
    activeUsers: number;
    newUsersToday: number;
    newCreatorsToday: number;
    revenueToday: number;
}
export interface ModerationItem {
    id: string;
    type: 'post' | 'comment' | 'user' | 'creator';
    content: any;
    reason: string;
    reportedBy: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
    reviewedAt?: string;
    reviewedBy?: string;
    reviewNotes?: string;
}
export interface Report {
    id: string;
    type: 'spam' | 'harassment' | 'inappropriate' | 'copyright' | 'other';
    content: any;
    reportedBy: string;
    reason: string;
    status: 'pending' | 'resolved' | 'dismissed';
    createdAt: string;
    resolvedAt?: string;
    resolvedBy?: string;
    resolution?: string;
}
export interface User {
    id: string;
    username: string;
    email: string;
    display_name: string;
    role: 'user' | 'creator' | 'admin';
    status: 'active' | 'suspended' | 'banned';
    is_verified: boolean;
    created_at: string;
    last_active: string;
    followers_count: number;
    following_count: number;
    posts_count: number;
}
export interface Creator {
    id: string;
    username: string;
    display_name: string;
    email: string;
    verification_status: 'pending' | 'verified' | 'rejected';
    verification_documents: any[];
    bio: string;
    website: string;
    social_links: any;
    created_at: string;
    followers_count: number;
    posts_count: number;
    revenue: number;
}
export interface AnalyticsData {
    period: string;
    metric: string;
    data: any[];
    summary: {
        total: number;
        change: number;
        changePercent: number;
    };
}
export interface SystemHealth {
    database: boolean;
    redis: boolean;
    storage: boolean;
    api: boolean;
    uptime: number;
    memoryUsage: number;
    cpuUsage: number;
    diskUsage: number;
}
export interface AuditLog {
    id: string;
    action: string;
    userId: string;
    resourceType: string;
    resourceId: string;
    details: any;
    ipAddress: string;
    userAgent: string;
    createdAt: string;
}
export declare class AdminService {
    private readonly CACHE_TTL;
    getDashboardStats(): Promise<DashboardStats>;
    getModerationQueue(options: {
        page: number;
        limit: number;
        status: string;
        type?: string;
    }): Promise<ModerationItem[]>;
    reviewModerationItem(id: string, reviewerId: string, action: 'approve' | 'reject', reason?: string): Promise<any>;
    getReports(options: {
        page: number;
        limit: number;
        status: string;
        type?: string;
    }): Promise<Report[]>;
    handleReport(id: string, adminId: string, action: 'resolve' | 'dismiss', notes?: string): Promise<any>;
    getUsers(options: {
        page: number;
        limit: number;
        search?: string;
        role?: string;
        status?: string;
    }): Promise<User[]>;
    updateUserStatus(userId: string, status: 'active' | 'suspended' | 'banned', reason: string, adminId: string): Promise<any>;
    getCreators(options: {
        page: number;
        limit: number;
        verificationStatus?: string;
        search?: string;
    }): Promise<Creator[]>;
    verifyCreator(creatorId: string, status: 'verified' | 'rejected', notes: string, adminId: string): Promise<any>;
    getAnalytics(options: {
        period: string;
        metric?: string;
    }): Promise<AnalyticsData>;
    getRevenueAnalytics(options: {
        period: string;
        breakdown?: string;
    }): Promise<any>;
    getContentAnalytics(options: {
        period: string;
        type?: string;
    }): Promise<any>;
    getSystemHealth(): Promise<SystemHealth>;
    getAuditLogs(options: {
        page: number;
        limit: number;
        action?: string;
        userId?: string;
        dateFrom?: string;
        dateTo?: string;
    }): Promise<AuditLog[]>;
    private checkDatabaseHealth;
    private logAdminAction;
}
//# sourceMappingURL=adminService.d.ts.map