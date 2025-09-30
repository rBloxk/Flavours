"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = require("../config/database");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const logger_1 = require("../utils/logger");
const joi_1 = __importDefault(require("joi"));
const multer_1 = __importDefault(require("multer"));
const uuid_1 = require("uuid");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 100 * 1024 * 1024,
        files: 10
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Invalid file type'));
        }
    }
});
router.get('/feed', auth_1.authMiddleware, async (req, res) => {
    try {
        const { page = 1, limit = 20, mode = 'intelligent', search = '', category = '', content_type = '', sort = 'recent' } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        let query = database_1.supabase
            .from('posts')
            .select(`
        *,
        profiles!posts_author_id_fkey (
          id,
          username,
          display_name,
          avatar_url,
          is_verified,
          is_creator,
          followers_count
        ),
        media (
          id,
          file_url,
          file_type,
          thumbnail_url,
          width,
          height,
          duration
        )
      `);
        if (mode === 'following') {
            query = query.in('author_id', database_1.supabase
                .from('follows')
                .select('following_id')
                .eq('follower_id', req.user.id));
        }
        else if (mode === 'trending') {
            const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
            query = query
                .gte('created_at', yesterday.toISOString())
                .order('likes_count', { ascending: false });
        }
        else if (mode === 'discover') {
            query = query.not('author_id', 'in', database_1.supabase
                .from('follows')
                .select('following_id')
                .eq('follower_id', req.user.id));
        }
        if (mode !== 'following') {
            query = query.eq('privacy', 'public');
        }
        if (search) {
            query = query.or(`content.ilike.%${search}%,tags.cs.{${search}},category.ilike.%${search}%`);
        }
        if (category) {
            query = query.eq('category', category);
        }
        if (content_type) {
            query = query.eq('content_type', content_type);
        }
        if (sort === 'popular') {
            query = query.order('likes_count', { ascending: false });
        }
        else if (sort === 'trending') {
            query = query.order('views_count', { ascending: false });
        }
        else if (sort === 'recent') {
            query = query.order('created_at', { ascending: false });
        }
        query = query.range(offset, offset + Number(limit) - 1);
        const { data: posts, error } = await query;
        if (error) {
            throw error;
        }
        const postsWithInteractions = await Promise.all(posts.map(async (post) => {
            const [likesResult, bookmarksResult, sharesResult] = await Promise.all([
                database_1.supabase
                    .from('likes')
                    .select('*')
                    .eq('user_id', req.user.id)
                    .eq('post_id', post.id)
                    .single(),
                database_1.supabase
                    .from('bookmarks')
                    .select('*')
                    .eq('user_id', req.user.id)
                    .eq('post_id', post.id)
                    .single(),
                database_1.supabase
                    .from('shares')
                    .select('*')
                    .eq('user_id', req.user.id)
                    .eq('post_id', post.id)
                    .single()
            ]);
            return {
                ...post,
                is_liked: !!likesResult.data,
                is_bookmarked: !!bookmarksResult.data,
                is_shared: !!sharesResult.data
            };
        }));
        res.json({
            success: true,
            data: {
                posts: postsWithInteractions,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    hasMore: posts.length === Number(limit)
                }
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Get feed error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});
router.post('/', auth_1.authMiddleware, upload.array('media', 10), (0, validation_1.validateRequest)({
    body: joi_1.default.object({
        content: joi_1.default.string().min(1).max(2000).required(),
        content_type: joi_1.default.string().valid('text', 'image', 'video', 'short_video').default('text'),
        privacy: joi_1.default.string().valid('public', 'followers', 'paid', 'private').default('public'),
        is_paid: joi_1.default.boolean().default(false),
        price: joi_1.default.when('is_paid', {
            is: true,
            then: joi_1.default.number().min(0.01).max(1000).required(),
            otherwise: joi_1.default.number().optional()
        }),
        preview_content: joi_1.default.string().max(500).optional(),
        tags: joi_1.default.array().items(joi_1.default.string().max(50)).max(10).optional(),
        mentions: joi_1.default.array().items(joi_1.default.string().max(50)).max(10).optional(),
        location: joi_1.default.string().max(100).optional(),
        category: joi_1.default.string().max(50).optional(),
        scheduled_at: joi_1.default.date().iso().optional()
    })
}), async (req, res) => {
    try {
        const postData = req.body;
        const files = req.files;
        const { data: post, error: postError } = await database_1.supabase
            .from('posts')
            .insert({
            author_id: req.user.id,
            content: postData.content,
            content_type: postData.content_type,
            privacy: postData.privacy,
            is_paid: postData.is_paid,
            price: postData.price || 0,
            preview_content: postData.preview_content,
            tags: postData.tags || [],
            mentions: postData.mentions || [],
            location: postData.location,
            category: postData.category,
            scheduled_at: postData.scheduled_at
        })
            .select()
            .single();
        if (postError) {
            throw postError;
        }
        if (files && files.length > 0) {
            const mediaPromises = files.map(async (file) => {
                const fileUrl = await uploadToStorage(file);
                return database_1.supabase
                    .from('media')
                    .insert({
                    post_id: post.id,
                    user_id: req.user.id,
                    file_url: fileUrl,
                    file_type: file.mimetype.startsWith('image/') ? 'image' : 'video',
                    file_size: file.size,
                    mime_type: file.mimetype,
                    storage_provider: 's3',
                    storage_path: `posts/${post.id}/${(0, uuid_1.v4)()}`
                });
            });
            await Promise.all(mediaPromises);
        }
        const { data: completePost } = await database_1.supabase
            .from('posts')
            .select(`
        *,
        profiles!posts_author_id_fkey (
          id,
          username,
          display_name,
          avatar_url,
          is_verified,
          is_creator
        ),
        media (
          id,
          file_url,
          file_type,
          thumbnail_url,
          width,
          height,
          duration
        )
      `)
            .eq('id', post.id)
            .single();
        res.status(201).json({
            success: true,
            data: completePost,
            message: 'Post created successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Create post error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { data: post, error } = await database_1.supabase
            .from('posts')
            .select(`
        *,
        profiles!posts_author_id_fkey (
          id,
          username,
          display_name,
          avatar_url,
          is_verified,
          is_creator,
          followers_count
        ),
        media (
          id,
          file_url,
          file_type,
          thumbnail_url,
          width,
          height,
          duration
        ),
        comments (
          id,
          content,
          created_at,
          likes_count,
          profiles!comments_author_id_fkey (
            id,
            username,
            display_name,
            avatar_url,
            is_verified
          )
        )
      `)
            .eq('id', id)
            .single();
        if (error || !post) {
            return res.status(404).json({
                error: 'Post not found'
            });
        }
        if (post.privacy === 'private' && (!req.user || req.user.id !== post.author_id)) {
            return res.status(403).json({
                error: 'Post is private'
            });
        }
        let postWithInteractions = post;
        if (req.user) {
            const [likesResult, bookmarksResult, sharesResult] = await Promise.all([
                database_1.supabase
                    .from('likes')
                    .select('*')
                    .eq('user_id', req.user.id)
                    .eq('post_id', post.id)
                    .single(),
                database_1.supabase
                    .from('bookmarks')
                    .select('*')
                    .eq('user_id', req.user.id)
                    .eq('post_id', post.id)
                    .single(),
                database_1.supabase
                    .from('shares')
                    .select('*')
                    .eq('user_id', req.user.id)
                    .eq('post_id', post.id)
                    .single()
            ]);
            postWithInteractions = {
                ...post,
                is_liked: !!likesResult.data,
                is_bookmarked: !!bookmarksResult.data,
                is_shared: !!sharesResult.data
            };
        }
        await database_1.supabase
            .from('posts')
            .update({ views_count: post.views_count + 1 })
            .eq('id', id);
        res.json({
            success: true,
            data: postWithInteractions
        });
    }
    catch (error) {
        logger_1.logger.error('Get post error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});
router.put('/:id', auth_1.authMiddleware, (0, validation_1.validateRequest)({
    body: joi_1.default.object({
        content: joi_1.default.string().min(1).max(2000).optional(),
        privacy: joi_1.default.string().valid('public', 'followers', 'paid', 'private').optional(),
        is_paid: joi_1.default.boolean().optional(),
        price: joi_1.default.when('is_paid', {
            is: true,
            then: joi_1.default.number().min(0.01).max(1000).required(),
            otherwise: joi_1.default.number().optional()
        }),
        preview_content: joi_1.default.string().max(500).optional(),
        tags: joi_1.default.array().items(joi_1.default.string().max(50)).max(10).optional(),
        mentions: joi_1.default.array().items(joi_1.default.string().max(50)).max(10).optional(),
        location: joi_1.default.string().max(100).optional(),
        category: joi_1.default.string().max(50).optional()
    })
}), async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const { data: existingPost } = await database_1.supabase
            .from('posts')
            .select('author_id')
            .eq('id', id)
            .single();
        if (!existingPost || existingPost.author_id !== req.user.id) {
            return res.status(403).json({
                error: 'Not authorized to update this post'
            });
        }
        const { data: updatedPost, error } = await database_1.supabase
            .from('posts')
            .update({
            ...updates,
            updated_at: new Date().toISOString()
        })
            .eq('id', id)
            .select()
            .single();
        if (error) {
            throw error;
        }
        res.json({
            success: true,
            data: updatedPost,
            message: 'Post updated successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Update post error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});
router.delete('/:id', auth_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { data: existingPost } = await database_1.supabase
            .from('posts')
            .select('author_id')
            .eq('id', id)
            .single();
        if (!existingPost || existingPost.author_id !== req.user.id) {
            return res.status(403).json({
                error: 'Not authorized to delete this post'
            });
        }
        const { error } = await database_1.supabase
            .from('posts')
            .delete()
            .eq('id', id);
        if (error) {
            throw error;
        }
        res.json({
            success: true,
            message: 'Post deleted successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Delete post error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});
router.post('/:id/like', auth_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { data: post } = await database_1.supabase
            .from('posts')
            .select('id, author_id, privacy')
            .eq('id', id)
            .single();
        if (!post) {
            return res.status(404).json({
                error: 'Post not found'
            });
        }
        const { data: existingLike } = await database_1.supabase
            .from('likes')
            .select('*')
            .eq('user_id', req.user.id)
            .eq('post_id', id)
            .single();
        if (existingLike) {
            await database_1.supabase
                .from('likes')
                .delete()
                .eq('user_id', req.user.id)
                .eq('post_id', id);
            res.json({
                success: true,
                action: 'unliked',
                message: 'Post unliked'
            });
        }
        else {
            await database_1.supabase
                .from('likes')
                .insert({
                user_id: req.user.id,
                post_id: id
            });
            res.json({
                success: true,
                action: 'liked',
                message: 'Post liked'
            });
        }
    }
    catch (error) {
        logger_1.logger.error('Like/Unlike error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});
router.post('/:id/bookmark', auth_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { data: post } = await database_1.supabase
            .from('posts')
            .select('id')
            .eq('id', id)
            .single();
        if (!post) {
            return res.status(404).json({
                error: 'Post not found'
            });
        }
        const { data: existingBookmark } = await database_1.supabase
            .from('bookmarks')
            .select('*')
            .eq('user_id', req.user.id)
            .eq('post_id', id)
            .single();
        if (existingBookmark) {
            await database_1.supabase
                .from('bookmarks')
                .delete()
                .eq('user_id', req.user.id)
                .eq('post_id', id);
            res.json({
                success: true,
                action: 'unbookmarked',
                message: 'Post unbookmarked'
            });
        }
        else {
            await database_1.supabase
                .from('bookmarks')
                .insert({
                user_id: req.user.id,
                post_id: id
            });
            res.json({
                success: true,
                action: 'bookmarked',
                message: 'Post bookmarked'
            });
        }
    }
    catch (error) {
        logger_1.logger.error('Bookmark/Unbookmark error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});
router.post('/:id/share', auth_1.authMiddleware, (0, validation_1.validateRequest)({
    body: joi_1.default.object({
        platform: joi_1.default.string().valid('internal', 'twitter', 'facebook', 'instagram', 'linkedin').default('internal'),
        message: joi_1.default.string().max(500).optional()
    })
}), async (req, res) => {
    try {
        const { id } = req.params;
        const { platform, message } = req.body;
        const { data: post } = await database_1.supabase
            .from('posts')
            .select('id')
            .eq('id', id)
            .single();
        if (!post) {
            return res.status(404).json({
                error: 'Post not found'
            });
        }
        await database_1.supabase
            .from('shares')
            .insert({
            user_id: req.user.id,
            post_id: id,
            platform,
            message
        });
        res.json({
            success: true,
            message: 'Post shared successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Share post error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});
router.get('/:id/comments', async (req, res) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 20, sort = 'recent' } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        let query = database_1.supabase
            .from('comments')
            .select(`
        *,
        profiles!comments_author_id_fkey (
          id,
          username,
          display_name,
          avatar_url,
          is_verified
        )
      `)
            .eq('post_id', id)
            .eq('is_deleted', false)
            .is('parent_id', null);
        if (sort === 'popular') {
            query = query.order('likes_count', { ascending: false });
        }
        else {
            query = query.order('created_at', { ascending: true });
        }
        query = query.range(offset, offset + Number(limit) - 1);
        const { data: comments, error } = await query;
        if (error) {
            throw error;
        }
        const commentsWithReplies = await Promise.all(comments.map(async (comment) => {
            const { data: replies } = await database_1.supabase
                .from('comments')
                .select(`
            *,
            profiles!comments_author_id_fkey (
              id,
              username,
              display_name,
              avatar_url,
              is_verified
            )
          `)
                .eq('parent_id', comment.id)
                .eq('is_deleted', false)
                .order('created_at', { ascending: true })
                .limit(3);
            return {
                ...comment,
                replies: replies || []
            };
        }));
        res.json({
            success: true,
            data: {
                comments: commentsWithReplies,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    hasMore: comments.length === Number(limit)
                }
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Get comments error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});
router.post('/:id/comments', auth_1.authMiddleware, (0, validation_1.validateRequest)({
    body: joi_1.default.object({
        content: joi_1.default.string().min(1).max(500).required(),
        parent_id: joi_1.default.string().uuid().optional()
    })
}), async (req, res) => {
    try {
        const { id } = req.params;
        const { content, parent_id } = req.body;
        const { data: post } = await database_1.supabase
            .from('posts')
            .select('id, privacy')
            .eq('id', id)
            .single();
        if (!post) {
            return res.status(404).json({
                error: 'Post not found'
            });
        }
        const { data: comment, error } = await database_1.supabase
            .from('comments')
            .insert({
            post_id: id,
            author_id: req.user.id,
            content,
            parent_id
        })
            .select(`
        *,
        profiles!comments_author_id_fkey (
          id,
          username,
          display_name,
          avatar_url,
          is_verified
        )
      `)
            .single();
        if (error) {
            throw error;
        }
        res.status(201).json({
            success: true,
            data: comment,
            message: 'Comment added successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Add comment error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});
router.get('/search', async (req, res) => {
    try {
        const { q = '', page = 1, limit = 20, type = 'all', category = '', sort = 'recent', date_range = 'all' } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        let query = database_1.supabase
            .from('posts')
            .select(`
        *,
        profiles!posts_author_id_fkey (
          id,
          username,
          display_name,
          avatar_url,
          is_verified,
          is_creator
        ),
        media (
          id,
          file_url,
          file_type,
          thumbnail_url,
          width,
          height,
          duration
        )
      `)
            .eq('privacy', 'public');
        if (q) {
            query = query.or(`content.ilike.%${q}%,tags.cs.{${q}},category.ilike.%${q}%`);
        }
        if (type !== 'all') {
            query = query.eq('content_type', type);
        }
        if (category) {
            query = query.eq('category', category);
        }
        if (date_range !== 'all') {
            const now = new Date();
            let startDate;
            switch (date_range) {
                case 'today':
                    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    break;
                case 'week':
                    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case 'month':
                    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    break;
                case 'year':
                    startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                    break;
                default:
                    startDate = new Date(0);
            }
            query = query.gte('created_at', startDate.toISOString());
        }
        if (sort === 'popular') {
            query = query.order('likes_count', { ascending: false });
        }
        else if (sort === 'trending') {
            query = query.order('views_count', { ascending: false });
        }
        else {
            query = query.order('created_at', { ascending: false });
        }
        query = query.range(offset, offset + Number(limit) - 1);
        const { data: posts, error } = await query;
        if (error) {
            throw error;
        }
        res.json({
            success: true,
            data: {
                posts,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    hasMore: posts.length === Number(limit)
                }
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Search posts error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});
async function uploadToStorage(file) {
    return `https://storage.example.com/files/${(0, uuid_1.v4)()}-${file.originalname}`;
}
exports.default = router;
//# sourceMappingURL=content.js.map