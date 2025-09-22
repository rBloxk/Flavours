export interface CreatePostData {
    content: string;
    isPaid: boolean;
    price?: number;
    isPreview: boolean;
    tags?: string[];
    scheduledAt?: string;
    creatorId: string;
    files?: Express.Multer.File[];
}
export interface GetPostsParams {
    page: number;
    limit: number;
    creatorId?: string;
    isPaid?: boolean;
    search?: string;
}
export interface GetCommentsParams {
    page: number;
    limit: number;
}
export declare class ContentService {
    createPost(data: CreatePostData): Promise<any>;
    getPosts(params: GetPostsParams): Promise<any[]>;
    getPost(id: string): Promise<any>;
    updatePost(id: string, updateData: any): Promise<any>;
    deletePost(id: string): Promise<void>;
    toggleLike(postId: string, userId: string): Promise<{
        liked: boolean;
        likesCount: number;
    }>;
    addComment(postId: string, userId: string, content: string): Promise<any>;
    getComments(postId: string, params: GetCommentsParams): Promise<any[]>;
    deleteComment(commentId: string, userId: string): Promise<void>;
    reportPost(postId: string, userId: string, reason: string, description?: string): Promise<void>;
    getCreatorPosts(creatorId: string, params: GetPostsParams): Promise<any[]>;
    getTrendingPosts(params: GetPostsParams): Promise<any[]>;
    private uploadMedia;
    private getLikesCount;
    searchPosts(params: {
        query: string;
        page: number;
        limit: number;
        category?: string;
    }): Promise<any[]>;
    getPostInteractions(postId: string, userId: string): Promise<{
        likes: number;
        comments: number;
        shares: number;
        isLiked: boolean;
    }>;
    sharePost(postId: string, userId: string, platform: string, message?: string): Promise<any>;
    getContentAnalytics(userId: string, period: string): Promise<{
        posts: number;
        likes: number;
        comments: number;
        shares: number;
        engagement: number;
        period: string;
    }>;
    private getPostsCount;
    private getLikesReceived;
    private getCommentsReceived;
    private getSharesReceived;
    private getCommentsCount;
    private getSharesCount;
    private getDateRange;
    toggleSave(postId: string, userId: string): Promise<{
        saved: boolean;
    }>;
    toggleFavorite(postId: string, userId: string): Promise<{
        favorited: boolean;
    }>;
    getSavedPosts(userId: string, params: {
        page: number;
        limit: number;
    }): Promise<any[]>;
    getFavoritePosts(userId: string, params: {
        page: number;
        limit: number;
    }): Promise<any[]>;
    getPostInsights(postId: string): Promise<{
        likes: number;
        comments: number;
        shares: number;
        views: number;
        engagement: number;
        engagementRate: number;
    }>;
    private getViewsCount;
    getPersonalizedFeed(userId: string, params: {
        page: number;
        limit: number;
    }): Promise<any[]>;
}
//# sourceMappingURL=contentService.d.ts.map