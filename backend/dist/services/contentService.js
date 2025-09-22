"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentService = void 0;
const supabase_1 = require("../config/supabase");
const logger_1 = require("../utils/logger");
const uuid_1 = require("uuid");
class ContentService {
    async createPost(data) {
        try {
            const mediaAssets = [];
            if (data.files && data.files.length > 0) {
                for (const file of data.files) {
                    const mediaAsset = await this.uploadMedia(file, data.creatorId);
                    mediaAssets.push(mediaAsset);
                }
            }
            const { data: post, error } = await supabase_1.supabase
                .from('posts')
                .insert({
                creator_id: data.creatorId,
                content: data.content,
                is_paid: data.isPaid,
                price: data.price,
                is_preview: data.isPreview,
                tags: data.tags,
                scheduled_at: data.scheduledAt,
                media_assets: mediaAssets.map(asset => asset.id)
            })
                .select(`
          *,
          creators (
            id,
            profiles (
              id,
              username,
              display_name,
              avatar_url
            )
          )
        `)
                .single();
            if (error) {
                logger_1.logger.error('Create post error:', error);
                throw new Error('Failed to create post');
            }
            return post;
        }
        catch (error) {
            logger_1.logger.error('Create post service error:', error);
            throw error;
        }
    }
    async getPosts(params) {
        try {
            let query = supabase_1.supabase
                .from('posts')
                .select(`
          *,
          creators (
            id,
            profiles (
              id,
              username,
              display_name,
              avatar_url
            )
          ),
          media_assets (
            id,
            type,
            url,
            thumbnail_url,
            duration,
            size
          )
        `)
                .order('created_at', { ascending: false });
            if (params.creatorId) {
                query = query.eq('creator_id', params.creatorId);
            }
            if (params.isPaid !== undefined) {
                query = query.eq('is_paid', params.isPaid);
            }
            if (params.search) {
                query = query.or(`content.ilike.%${params.search}%,tags.cs.{${params.search}}`);
            }
            const { data: posts, error } = await query
                .range((params.page - 1) * params.limit, params.page * params.limit - 1);
            if (error) {
                logger_1.logger.error('Get posts error:', error);
                throw new Error('Failed to fetch posts');
            }
            return posts || [];
        }
        catch (error) {
            logger_1.logger.error('Get posts service error:', error);
            throw error;
        }
    }
    async getPost(id) {
        try {
            const { data: post, error } = await supabase_1.supabase
                .from('posts')
                .select(`
          *,
          creators (
            id,
            profiles (
              id,
              username,
              display_name,
              avatar_url
            )
          ),
          media_assets (
            id,
            type,
            url,
            thumbnail_url,
            duration,
            size
          )
        `)
                .eq('id', id)
                .single();
            if (error) {
                logger_1.logger.error('Get post error:', error);
                return null;
            }
            return post;
        }
        catch (error) {
            logger_1.logger.error('Get post service error:', error);
            throw error;
        }
    }
    async updatePost(id, updateData) {
        try {
            if (updateData.files && updateData.files.length > 0) {
                const mediaAssets = [];
                for (const file of updateData.files) {
                    const mediaAsset = await this.uploadMedia(file, updateData.creatorId);
                    mediaAssets.push(mediaAsset);
                }
                updateData.media_assets = mediaAssets.map(asset => asset.id);
            }
            delete updateData.files;
            const { data: post, error } = await supabase_1.supabase
                .from('posts')
                .update(updateData)
                .eq('id', id)
                .select(`
          *,
          creators (
            id,
            profiles (
              id,
              username,
              display_name,
              avatar_url
            )
          )
        `)
                .single();
            if (error) {
                logger_1.logger.error('Update post error:', error);
                throw new Error('Failed to update post');
            }
            return post;
        }
        catch (error) {
            logger_1.logger.error('Update post service error:', error);
            throw error;
        }
    }
    async deletePost(id) {
        try {
            const { error } = await supabase_1.supabase
                .from('posts')
                .delete()
                .eq('id', id);
            if (error) {
                logger_1.logger.error('Delete post error:', error);
                throw new Error('Failed to delete post');
            }
        }
        catch (error) {
            logger_1.logger.error('Delete post service error:', error);
            throw error;
        }
    }
    async toggleLike(postId, userId) {
        try {
            const { data: existingLike } = await supabase_1.supabase
                .from('likes')
                .select('id')
                .eq('post_id', postId)
                .eq('user_id', userId)
                .single();
            if (existingLike) {
                await supabase_1.supabase
                    .from('likes')
                    .delete()
                    .eq('id', existingLike.id);
                await supabase_1.supabase.rpc('decrement_likes_count', { post_id: postId });
                return { liked: false, likesCount: await this.getLikesCount(postId) };
            }
            else {
                await supabase_1.supabase
                    .from('likes')
                    .insert({
                    post_id: postId,
                    user_id: userId
                });
                await supabase_1.supabase.rpc('increment_likes_count', { post_id: postId });
                return { liked: true, likesCount: await this.getLikesCount(postId) };
            }
        }
        catch (error) {
            logger_1.logger.error('Toggle like error:', error);
            throw error;
        }
    }
    async addComment(postId, userId, content) {
        try {
            const { data: comment, error } = await supabase_1.supabase
                .from('comments')
                .insert({
                post_id: postId,
                user_id: userId,
                content
            })
                .select(`
          *,
          profiles (
            id,
            username,
            display_name,
            avatar_url
          )
        `)
                .single();
            if (error) {
                logger_1.logger.error('Add comment error:', error);
                throw new Error('Failed to add comment');
            }
            await supabase_1.supabase.rpc('increment_comments_count', { post_id: postId });
            return comment;
        }
        catch (error) {
            logger_1.logger.error('Add comment service error:', error);
            throw error;
        }
    }
    async getComments(postId, params) {
        try {
            const { data: comments, error } = await supabase_1.supabase
                .from('comments')
                .select(`
          *,
          profiles (
            id,
            username,
            display_name,
            avatar_url
          )
        `)
                .eq('post_id', postId)
                .order('created_at', { ascending: false })
                .range((params.page - 1) * params.limit, params.page * params.limit - 1);
            if (error) {
                logger_1.logger.error('Get comments error:', error);
                throw new Error('Failed to fetch comments');
            }
            return comments || [];
        }
        catch (error) {
            logger_1.logger.error('Get comments service error:', error);
            throw error;
        }
    }
    async deleteComment(commentId, userId) {
        try {
            const { data: comment } = await supabase_1.supabase
                .from('comments')
                .select('post_id')
                .eq('id', commentId)
                .eq('user_id', userId)
                .single();
            if (!comment) {
                throw new Error('Comment not found or not authorized');
            }
            const { error } = await supabase_1.supabase
                .from('comments')
                .delete()
                .eq('id', commentId);
            if (error) {
                logger_1.logger.error('Delete comment error:', error);
                throw new Error('Failed to delete comment');
            }
            await supabase_1.supabase.rpc('decrement_comments_count', { post_id: comment.post_id });
        }
        catch (error) {
            logger_1.logger.error('Delete comment service error:', error);
            throw error;
        }
    }
    async reportPost(postId, userId, reason, description) {
        try {
            const { error } = await supabase_1.supabase
                .from('reports')
                .insert({
                post_id: postId,
                user_id: userId,
                reason,
                description
            });
            if (error) {
                logger_1.logger.error('Report post error:', error);
                throw new Error('Failed to report post');
            }
        }
        catch (error) {
            logger_1.logger.error('Report post service error:', error);
            throw error;
        }
    }
    async getCreatorPosts(creatorId, params) {
        return this.getPosts({
            ...params,
            creatorId
        });
    }
    async getTrendingPosts(params) {
        try {
            const { data: posts, error } = await supabase_1.supabase
                .from('posts')
                .select(`
          *,
          creators (
            id,
            profiles (
              id,
              username,
              display_name,
              avatar_url
            )
          )
        `)
                .order('likes_count', { ascending: false })
                .order('created_at', { ascending: false })
                .range((params.page - 1) * params.limit, params.page * params.limit - 1);
            if (error) {
                logger_1.logger.error('Get trending posts error:', error);
                throw new Error('Failed to fetch trending posts');
            }
            return posts || [];
        }
        catch (error) {
            logger_1.logger.error('Get trending posts service error:', error);
            throw error;
        }
    }
    async uploadMedia(file, creatorId) {
        try {
            const fileExtension = file.originalname.split('.').pop();
            const fileName = `${(0, uuid_1.v4)()}.${fileExtension}`;
            const mediaAsset = {
                id: (0, uuid_1.v4)(),
                type: file.mimetype.startsWith('image/') ? 'image' :
                    file.mimetype.startsWith('video/') ? 'video' : 'audio',
                url: `https://storage.example.com/media/${fileName}`,
                thumbnail_url: file.mimetype.startsWith('image/') ?
                    `https://storage.example.com/media/${fileName}` :
                    `https://storage.example.com/thumbnails/${fileName}`,
                size: file.size,
                duration: file.mimetype.startsWith('video/') ? 120 : null,
                content_hash: 'simulated_hash',
                is_processed: true
            };
            const { data, error } = await supabase_1.supabase
                .from('media_assets')
                .insert(mediaAsset)
                .select()
                .single();
            if (error) {
                logger_1.logger.error('Upload media error:', error);
                throw new Error('Failed to upload media');
            }
            return data;
        }
        catch (error) {
            logger_1.logger.error('Upload media service error:', error);
            throw error;
        }
    }
    async getLikesCount(postId) {
        try {
            const { count } = await supabase_1.supabase
                .from('likes')
                .select('*', { count: 'exact' })
                .eq('post_id', postId);
            return count || 0;
        }
        catch (error) {
            logger_1.logger.error('Get likes count error:', error);
            return 0;
        }
    }
    async searchPosts(params) {
        try {
            const { data: posts, error } = await supabase_1.supabase
                .from('posts')
                .select(`
          *,
          profiles!posts_creator_id_fkey (
            id,
            username,
            display_name,
            avatar_url
          )
        `)
                .textSearch('content', params.query)
                .eq('is_public', true)
                .order('created_at', { ascending: false })
                .range((params.page - 1) * params.limit, params.page * params.limit - 1);
            if (error) {
                logger_1.logger.error('Search posts error:', error);
                throw new Error('Failed to search posts');
            }
            return posts || [];
        }
        catch (error) {
            logger_1.logger.error('Search posts service error:', error);
            throw error;
        }
    }
    async getPostInteractions(postId, userId) {
        try {
            const [likes, comments, shares] = await Promise.all([
                this.getLikesCount(postId),
                this.getCommentsCount(postId),
                this.getSharesCount(postId)
            ]);
            const { data: userLike } = await supabase_1.supabase
                .from('likes')
                .select('id')
                .eq('post_id', postId)
                .eq('user_id', userId)
                .single();
            return {
                likes,
                comments,
                shares,
                isLiked: !!userLike
            };
        }
        catch (error) {
            logger_1.logger.error('Get post interactions error:', error);
            throw error;
        }
    }
    async sharePost(postId, userId, platform, message) {
        try {
            const { data, error } = await supabase_1.supabase
                .from('shares')
                .insert({
                post_id: postId,
                user_id: userId,
                platform,
                message
            })
                .select()
                .single();
            if (error) {
                logger_1.logger.error('Share post error:', error);
                throw new Error('Failed to share post');
            }
            return data;
        }
        catch (error) {
            logger_1.logger.error('Share post service error:', error);
            throw error;
        }
    }
    async getContentAnalytics(userId, period) {
        try {
            const dateRange = this.getDateRange(period);
            const [posts, likes, comments, shares] = await Promise.all([
                this.getPostsCount(userId, dateRange),
                this.getLikesReceived(userId, dateRange),
                this.getCommentsReceived(userId, dateRange),
                this.getSharesReceived(userId, dateRange)
            ]);
            return {
                posts,
                likes,
                comments,
                shares,
                engagement: likes + comments + shares,
                period
            };
        }
        catch (error) {
            logger_1.logger.error('Get content analytics error:', error);
            throw error;
        }
    }
    async getPostsCount(userId, dateRange) {
        try {
            const { count } = await supabase_1.supabase
                .from('posts')
                .select('*', { count: 'exact' })
                .eq('creator_id', userId)
                .gte('created_at', dateRange.start.toISOString())
                .lte('created_at', dateRange.end.toISOString());
            return count || 0;
        }
        catch (error) {
            logger_1.logger.error('Get posts count error:', error);
            return 0;
        }
    }
    async getLikesReceived(userId, dateRange) {
        try {
            const { count } = await supabase_1.supabase
                .from('likes')
                .select('*', { count: 'exact' })
                .eq('posts.creator_id', userId)
                .gte('created_at', dateRange.start.toISOString())
                .lte('created_at', dateRange.end.toISOString());
            return count || 0;
        }
        catch (error) {
            logger_1.logger.error('Get likes received error:', error);
            return 0;
        }
    }
    async getCommentsReceived(userId, dateRange) {
        try {
            const { count } = await supabase_1.supabase
                .from('comments')
                .select('*', { count: 'exact' })
                .eq('posts.creator_id', userId)
                .gte('created_at', dateRange.start.toISOString())
                .lte('created_at', dateRange.end.toISOString());
            return count || 0;
        }
        catch (error) {
            logger_1.logger.error('Get comments received error:', error);
            return 0;
        }
    }
    async getSharesReceived(userId, dateRange) {
        try {
            const { count } = await supabase_1.supabase
                .from('shares')
                .select('*', { count: 'exact' })
                .eq('posts.creator_id', userId)
                .gte('created_at', dateRange.start.toISOString())
                .lte('created_at', dateRange.end.toISOString());
            return count || 0;
        }
        catch (error) {
            logger_1.logger.error('Get shares received error:', error);
            return 0;
        }
    }
    async getCommentsCount(postId) {
        try {
            const { count } = await supabase_1.supabase
                .from('comments')
                .select('*', { count: 'exact' })
                .eq('post_id', postId);
            return count || 0;
        }
        catch (error) {
            logger_1.logger.error('Get comments count error:', error);
            return 0;
        }
    }
    async getSharesCount(postId) {
        try {
            const { count } = await supabase_1.supabase
                .from('shares')
                .select('*', { count: 'exact' })
                .eq('post_id', postId);
            return count || 0;
        }
        catch (error) {
            logger_1.logger.error('Get shares count error:', error);
            return 0;
        }
    }
    getDateRange(period) {
        const end = new Date();
        const start = new Date();
        switch (period) {
            case '7d':
                start.setDate(end.getDate() - 7);
                break;
            case '30d':
                start.setDate(end.getDate() - 30);
                break;
            case '90d':
                start.setDate(end.getDate() - 90);
                break;
            case '1y':
                start.setFullYear(end.getFullYear() - 1);
                break;
            default:
                start.setDate(end.getDate() - 30);
        }
        return { start, end };
    }
    async toggleSave(postId, userId) {
        try {
            const { data: existingSave } = await supabase_1.supabase
                .from('saved_posts')
                .select('id')
                .eq('post_id', postId)
                .eq('user_id', userId)
                .single();
            if (existingSave) {
                await supabase_1.supabase
                    .from('saved_posts')
                    .delete()
                    .eq('post_id', postId)
                    .eq('user_id', userId);
                return { saved: false };
            }
            else {
                await supabase_1.supabase
                    .from('saved_posts')
                    .insert({
                    post_id: postId,
                    user_id: userId
                });
                return { saved: true };
            }
        }
        catch (error) {
            logger_1.logger.error('Toggle save error:', error);
            throw error;
        }
    }
    async toggleFavorite(postId, userId) {
        try {
            const { data: existingFavorite } = await supabase_1.supabase
                .from('favorite_posts')
                .select('id')
                .eq('post_id', postId)
                .eq('user_id', userId)
                .single();
            if (existingFavorite) {
                await supabase_1.supabase
                    .from('favorite_posts')
                    .delete()
                    .eq('post_id', postId)
                    .eq('user_id', userId);
                return { favorited: false };
            }
            else {
                await supabase_1.supabase
                    .from('favorite_posts')
                    .insert({
                    post_id: postId,
                    user_id: userId
                });
                return { favorited: true };
            }
        }
        catch (error) {
            logger_1.logger.error('Toggle favorite error:', error);
            throw error;
        }
    }
    async getSavedPosts(userId, params) {
        try {
            const { data: posts, error } = await supabase_1.supabase
                .from('saved_posts')
                .select(`
          *,
          posts!saved_posts_post_id_fkey (
            *,
            profiles!posts_creator_id_fkey (
              id,
              username,
              display_name,
              avatar_url
            )
          )
        `)
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .range((params.page - 1) * params.limit, params.page * params.limit - 1);
            if (error) {
                logger_1.logger.error('Get saved posts error:', error);
                throw new Error('Failed to fetch saved posts');
            }
            return posts?.map(item => item.posts).filter(Boolean) || [];
        }
        catch (error) {
            logger_1.logger.error('Get saved posts service error:', error);
            throw error;
        }
    }
    async getFavoritePosts(userId, params) {
        try {
            const { data: posts, error } = await supabase_1.supabase
                .from('favorite_posts')
                .select(`
          *,
          posts!favorite_posts_post_id_fkey (
            *,
            profiles!posts_creator_id_fkey (
              id,
              username,
              display_name,
              avatar_url
            )
          )
        `)
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .range((params.page - 1) * params.limit, params.page * params.limit - 1);
            if (error) {
                logger_1.logger.error('Get favorite posts error:', error);
                throw new Error('Failed to fetch favorite posts');
            }
            return posts?.map(item => item.posts).filter(Boolean) || [];
        }
        catch (error) {
            logger_1.logger.error('Get favorite posts service error:', error);
            throw error;
        }
    }
    async getPostInsights(postId) {
        try {
            const [likes, comments, shares, views] = await Promise.all([
                this.getLikesCount(postId),
                this.getCommentsCount(postId),
                this.getSharesCount(postId),
                this.getViewsCount(postId)
            ]);
            return {
                likes,
                comments,
                shares,
                views,
                engagement: likes + comments + shares,
                engagementRate: views > 0 ? ((likes + comments + shares) / views) * 100 : 0
            };
        }
        catch (error) {
            logger_1.logger.error('Get post insights error:', error);
            throw error;
        }
    }
    async getViewsCount(postId) {
        try {
            const { count } = await supabase_1.supabase
                .from('post_views')
                .select('*', { count: 'exact' })
                .eq('post_id', postId);
            return count || 0;
        }
        catch (error) {
            logger_1.logger.error('Get views count error:', error);
            return 0;
        }
    }
    async getPersonalizedFeed(userId, params) {
        try {
            const { data: posts, error } = await supabase_1.supabase
                .from('posts')
                .select(`
          *,
          profiles!posts_creator_id_fkey (
            id,
            username,
            display_name,
            avatar_url
          )
        `)
                .eq('is_public', true)
                .order('likes_count', { ascending: false })
                .order('created_at', { ascending: false })
                .range((params.page - 1) * params.limit, params.page * params.limit - 1);
            if (error) {
                logger_1.logger.error('Get personalized feed error:', error);
                throw new Error('Failed to fetch personalized feed');
            }
            return posts || [];
        }
        catch (error) {
            logger_1.logger.error('Get personalized feed service error:', error);
            throw error;
        }
    }
}
exports.ContentService = ContentService;
//# sourceMappingURL=contentService.js.map