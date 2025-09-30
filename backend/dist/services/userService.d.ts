export interface UserProfile {
    id: string;
    username: string;
    display_name: string;
    bio?: string;
    avatar_url?: string;
    cover_url?: string;
    website?: string;
    location?: string;
    birth_date?: string;
    is_verified: boolean;
    is_private: boolean;
    followers_count: number;
    following_count: number;
    posts_count: number;
    created_at: string;
    updated_at: string;
}
export interface UserStats {
    followers_count: number;
    following_count: number;
    posts_count: number;
    likes_received: number;
    comments_received: number;
    shares_received: number;
}
export interface FollowResult {
    following: boolean;
    followersCount: number;
}
export interface BlockResult {
    blocked: boolean;
}
export interface PaginationOptions {
    page: number;
    limit: number;
}
export declare class UserService {
    private readonly CACHE_TTL;
    getProfileByUsername(username: string): Promise<UserProfile | null>;
    getProfileByUserId(userId: string): Promise<UserProfile | null>;
    updateProfile(userId: string, updateData: Partial<UserProfile>): Promise<UserProfile>;
    uploadProfilePicture(userId: string, file: any): Promise<string>;
    toggleFollow(userId: string, followerId: string): Promise<FollowResult>;
    getFollowers(userId: string, options: PaginationOptions): Promise<UserProfile[]>;
    getFollowing(userId: string, options: PaginationOptions): Promise<UserProfile[]>;
    toggleBlock(userId: string, blockerId: string): Promise<BlockResult>;
    getBlockedUsers(userId: string, options: PaginationOptions): Promise<UserProfile[]>;
    searchUsers(query: string, options: PaginationOptions): Promise<UserProfile[]>;
    getUserStats(userId: string): Promise<UserStats>;
    updateUserSettings(userId: string, settings: any): Promise<any>;
    getNotifications(userId: string, options: PaginationOptions & {
        unreadOnly?: boolean;
    }): Promise<any[]>;
    markNotificationAsRead(notificationId: string, userId: string): Promise<void>;
    markAllNotificationsAsRead(userId: string): Promise<void>;
}
//# sourceMappingURL=userService.d.ts.map