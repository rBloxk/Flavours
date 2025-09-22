"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const content_1 = require("../schemas/content");
const contentService_1 = require("../services/contentService");
const logger_1 = require("../utils/logger");
const multer_1 = __importDefault(require("multer"));
const router = (0, express_1.Router)();
const contentService = new contentService_1.ContentService();
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 3650722201,
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/webm', 'audio/mpeg', 'audio/wav'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Invalid file type'));
        }
    }
});
router.post('/', auth_1.authMiddleware, auth_1.requireCreator, upload.array('media', 10), (0, validation_1.validateRequest)(content_1.contentSchemas.createPost), async (req, res) => {
    try {
        const userId = req.user.id;
        const postData = req.body;
        const files = req.files;
        const post = await contentService.createPost({
            ...postData,
            creatorId: userId,
            files
        });
        res.status(201).json({
            message: 'Post created successfully',
            post
        });
    }
    catch (error) {
        logger_1.logger.error('Create post error:', error);
        res.status(500).json({
            error: 'Failed to create post'
        });
    }
});
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 20, creatorId, isPaid, search } = req.query;
        const posts = await contentService.getPosts({
            page: Number(page),
            limit: Number(limit),
            creatorId: creatorId,
            isPaid: isPaid === 'true',
            search: search
        });
        res.json({
            posts,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total: posts.length
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Get posts error:', error);
        res.status(500).json({
            error: 'Failed to fetch posts'
        });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const post = await contentService.getPost(id);
        if (!post) {
            return res.status(404).json({
                error: 'Post not found'
            });
        }
        res.json({
            post
        });
    }
    catch (error) {
        logger_1.logger.error('Get post error:', error);
        res.status(500).json({
            error: 'Failed to fetch post'
        });
    }
});
router.put('/:id', auth_1.authMiddleware, auth_1.requireCreator, upload.array('media', 10), (0, validation_1.validateRequest)(content_1.contentSchemas.updatePost), async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const updateData = req.body;
        const files = req.files;
        const post = await contentService.getPost(id);
        if (!post || post.creator_id !== userId) {
            return res.status(403).json({
                error: 'Not authorized to update this post'
            });
        }
        const updatedPost = await contentService.updatePost(id, {
            ...updateData,
            files
        });
        res.json({
            message: 'Post updated successfully',
            post: updatedPost
        });
    }
    catch (error) {
        logger_1.logger.error('Update post error:', error);
        res.status(500).json({
            error: 'Failed to update post'
        });
    }
});
router.delete('/:id', auth_1.authMiddleware, auth_1.requireCreator, async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const post = await contentService.getPost(id);
        if (!post || post.creator_id !== userId) {
            return res.status(403).json({
                error: 'Not authorized to delete this post'
            });
        }
        await contentService.deletePost(id);
        res.json({
            message: 'Post deleted successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Delete post error:', error);
        res.status(500).json({
            error: 'Failed to delete post'
        });
    }
});
router.post('/:id/like', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const result = await contentService.toggleLike(id, userId);
        res.json({
            message: result.liked ? 'Post liked' : 'Post unliked',
            liked: result.liked,
            likesCount: result.likesCount
        });
    }
    catch (error) {
        logger_1.logger.error('Toggle like error:', error);
        res.status(500).json({
            error: 'Failed to toggle like'
        });
    }
});
router.post('/:id/comments', auth_1.authMiddleware, (0, validation_1.validateRequest)(content_1.contentSchemas.addComment), async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { content } = req.body;
        const comment = await contentService.addComment(id, userId, content);
        res.status(201).json({
            message: 'Comment added successfully',
            comment
        });
    }
    catch (error) {
        logger_1.logger.error('Add comment error:', error);
        res.status(500).json({
            error: 'Failed to add comment'
        });
    }
});
router.get('/:id/comments', async (req, res) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 20 } = req.query;
        const comments = await contentService.getComments(id, {
            page: Number(page),
            limit: Number(limit)
        });
        res.json({
            comments,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total: comments.length
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Get comments error:', error);
        res.status(500).json({
            error: 'Failed to fetch comments'
        });
    }
});
router.delete('/comments/:commentId', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { commentId } = req.params;
        await contentService.deleteComment(commentId, userId);
        res.json({
            message: 'Comment deleted successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Delete comment error:', error);
        res.status(500).json({
            error: 'Failed to delete comment'
        });
    }
});
router.post('/:id/report', auth_1.authMiddleware, (0, validation_1.validateRequest)(content_1.contentSchemas.reportPost), async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { reason, description } = req.body;
        await contentService.reportPost(id, userId, reason, description);
        res.json({
            message: 'Post reported successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Report post error:', error);
        res.status(500).json({
            error: 'Failed to report post'
        });
    }
});
router.get('/creator/:creatorId', async (req, res) => {
    try {
        const { creatorId } = req.params;
        const { page = 1, limit = 20, isPaid } = req.query;
        const posts = await contentService.getCreatorPosts(creatorId, {
            page: Number(page),
            limit: Number(limit),
            isPaid: isPaid === 'true'
        });
        res.json({
            posts,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total: posts.length
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Get creator posts error:', error);
        res.status(500).json({
            error: 'Failed to fetch creator posts'
        });
    }
});
router.get('/trending/feed', async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const posts = await contentService.getTrendingPosts({
            page: Number(page),
            limit: Number(limit)
        });
        res.json({
            posts,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total: posts.length
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Get trending posts error:', error);
        res.status(500).json({
            error: 'Failed to fetch trending posts'
        });
    }
});
router.post('/:id/save', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const result = await contentService.toggleSave(id, userId);
        res.json({
            message: result.saved ? 'Post saved' : 'Post unsaved',
            saved: result.saved
        });
    }
    catch (error) {
        logger_1.logger.error('Toggle save error:', error);
        res.status(500).json({
            error: 'Failed to toggle save'
        });
    }
});
router.post('/:id/favorite', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const result = await contentService.toggleFavorite(id, userId);
        res.json({
            message: result.favorited ? 'Post added to favorites' : 'Post removed from favorites',
            favorited: result.favorited
        });
    }
    catch (error) {
        logger_1.logger.error('Toggle favorite error:', error);
        res.status(500).json({
            error: 'Failed to toggle favorite'
        });
    }
});
router.get('/saved/posts', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 20 } = req.query;
        const posts = await contentService.getSavedPosts(userId, {
            page: Number(page),
            limit: Number(limit)
        });
        res.json({
            posts,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total: posts.length
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Get saved posts error:', error);
        res.status(500).json({
            error: 'Failed to fetch saved posts'
        });
    }
});
router.get('/favorites/posts', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 20 } = req.query;
        const posts = await contentService.getFavoritePosts(userId, {
            page: Number(page),
            limit: Number(limit)
        });
        res.json({
            posts,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total: posts.length
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Get favorite posts error:', error);
        res.status(500).json({
            error: 'Failed to fetch favorite posts'
        });
    }
});
router.get('/:id/insights', auth_1.authMiddleware, auth_1.requireCreator, async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const post = await contentService.getPost(id);
        if (!post || post.creator_id !== userId) {
            return res.status(403).json({
                error: 'Not authorized to view insights for this post'
            });
        }
        const insights = await contentService.getPostInsights(id);
        res.json({ insights });
    }
    catch (error) {
        logger_1.logger.error('Get post insights error:', error);
        res.status(500).json({
            error: 'Failed to fetch post insights'
        });
    }
});
router.get('/feed/personalized', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 20 } = req.query;
        const posts = await contentService.getPersonalizedFeed(userId, {
            page: Number(page),
            limit: Number(limit)
        });
        res.json({
            posts,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total: posts.length
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Get personalized feed error:', error);
        res.status(500).json({
            error: 'Failed to fetch personalized feed'
        });
    }
});
router.get('/search', async (req, res) => {
    try {
        const { q, page = 1, limit = 20, type, category } = req.query;
        if (!q || q.trim().length === 0) {
            return res.status(400).json({
                error: 'Search query is required'
            });
        }
        const posts = await contentService.searchPosts({
            query: q,
            page: Number(page),
            limit: Number(limit),
            type: type,
            category: category
        });
        res.json({
            posts,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total: posts.length
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Search posts error:', error);
        res.status(500).json({
            error: 'Failed to search posts'
        });
    }
});
router.get('/:id/interactions', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const interactions = await contentService.getPostInteractions(id, userId);
        res.json({ interactions });
    }
    catch (error) {
        logger_1.logger.error('Get post interactions error:', error);
        res.status(500).json({
            error: 'Failed to fetch post interactions'
        });
    }
});
router.post('/:id/share', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { platform, message } = req.body;
        const share = await contentService.sharePost(id, userId, platform, message);
        res.json({
            message: 'Post shared successfully',
            share
        });
    }
    catch (error) {
        logger_1.logger.error('Share post error:', error);
        res.status(500).json({
            error: 'Failed to share post'
        });
    }
});
router.get('/analytics/overview', auth_1.authMiddleware, auth_1.requireCreator, async (req, res) => {
    try {
        const userId = req.user.id;
        const { period = '7d' } = req.query;
        const analytics = await contentService.getContentAnalytics(userId, period);
        res.json({ analytics });
    }
    catch (error) {
        logger_1.logger.error('Get content analytics error:', error);
        res.status(500).json({
            error: 'Failed to fetch content analytics'
        });
    }
});
exports.default = router;
//# sourceMappingURL=content.js.map