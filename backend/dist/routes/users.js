"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const users_1 = require("../schemas/users");
const userService_1 = require("../services/userService");
const logger_1 = require("../utils/logger");
const multer_1 = __importDefault(require("multer"));
const router = (0, express_1.Router)();
const userService = new userService_1.UserService();
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 50 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Invalid file type. Only images are allowed.'));
        }
    }
});
router.get('/profile/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const profile = await userService.getProfileByUsername(username);
        if (!profile) {
            return res.status(404).json({
                error: 'Profile not found'
            });
        }
        res.json({
            profile
        });
    }
    catch (error) {
        logger_1.logger.error('Get profile error:', error);
        res.status(500).json({
            error: 'Failed to fetch profile'
        });
    }
});
router.get('/me', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const profile = await userService.getProfileByUserId(userId);
        if (!profile) {
            return res.status(404).json({
                error: 'Profile not found'
            });
        }
        res.json({
            profile
        });
    }
    catch (error) {
        logger_1.logger.error('Get current user profile error:', error);
        res.status(500).json({
            error: 'Failed to fetch profile'
        });
    }
});
router.put('/profile', auth_1.authMiddleware, (0, validation_1.validateRequest)(users_1.userSchemas.updateProfile), async (req, res) => {
    try {
        const userId = req.user.id;
        const updateData = req.body;
        const profile = await userService.updateProfile(userId, updateData);
        res.json({
            message: 'Profile updated successfully',
            profile
        });
    }
    catch (error) {
        logger_1.logger.error('Update profile error:', error);
        res.status(500).json({
            error: 'Failed to update profile'
        });
    }
});
router.post('/profile/picture', auth_1.authMiddleware, upload.single('picture'), async (req, res) => {
    try {
        const userId = req.user.id;
        const file = req.file;
        if (!file) {
            return res.status(400).json({
                error: 'No file uploaded'
            });
        }
        const avatarUrl = await userService.uploadProfilePicture(userId, file);
        res.json({
            message: 'Profile picture uploaded successfully',
            avatarUrl
        });
    }
    catch (error) {
        logger_1.logger.error('Upload profile picture error:', error);
        res.status(500).json({
            error: 'Failed to upload profile picture'
        });
    }
});
router.post('/:userId/follow', auth_1.authMiddleware, async (req, res) => {
    try {
        const followerId = req.user.id;
        const { userId } = req.params;
        if (followerId === userId) {
            return res.status(400).json({
                error: 'Cannot follow yourself'
            });
        }
        const result = await userService.toggleFollow(userId, followerId);
        res.json({
            message: result.following ? 'User followed' : 'User unfollowed',
            following: result.following,
            followersCount: result.followersCount
        });
    }
    catch (error) {
        logger_1.logger.error('Toggle follow error:', error);
        res.status(500).json({
            error: 'Failed to toggle follow'
        });
    }
});
router.get('/:userId/followers', async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 20 } = req.query;
        const followers = await userService.getFollowers(userId, {
            page: Number(page),
            limit: Number(limit)
        });
        res.json({
            followers,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total: followers.length
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Get followers error:', error);
        res.status(500).json({
            error: 'Failed to fetch followers'
        });
    }
});
router.get('/:userId/following', async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 20 } = req.query;
        const following = await userService.getFollowing(userId, {
            page: Number(page),
            limit: Number(limit)
        });
        res.json({
            following,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total: following.length
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Get following error:', error);
        res.status(500).json({
            error: 'Failed to fetch following'
        });
    }
});
router.post('/:userId/block', auth_1.authMiddleware, async (req, res) => {
    try {
        const blockerId = req.user.id;
        const { userId } = req.params;
        if (blockerId === userId) {
            return res.status(400).json({
                error: 'Cannot block yourself'
            });
        }
        const result = await userService.toggleBlock(userId, blockerId);
        res.json({
            message: result.blocked ? 'User blocked' : 'User unblocked',
            blocked: result.blocked
        });
    }
    catch (error) {
        logger_1.logger.error('Toggle block error:', error);
        res.status(500).json({
            error: 'Failed to toggle block'
        });
    }
});
router.get('/blocked', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 20 } = req.query;
        const blockedUsers = await userService.getBlockedUsers(userId, {
            page: Number(page),
            limit: Number(limit)
        });
        res.json({
            blockedUsers,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total: blockedUsers.length
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Get blocked users error:', error);
        res.status(500).json({
            error: 'Failed to fetch blocked users'
        });
    }
});
router.get('/search', async (req, res) => {
    try {
        const { q, page = 1, limit = 20 } = req.query;
        if (!q || q.length < 2) {
            return res.status(400).json({
                error: 'Search query must be at least 2 characters'
            });
        }
        const users = await userService.searchUsers(q, {
            page: Number(page),
            limit: Number(limit)
        });
        res.json({
            users,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total: users.length
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Search users error:', error);
        res.status(500).json({
            error: 'Failed to search users'
        });
    }
});
router.get('/:userId/stats', async (req, res) => {
    try {
        const { userId } = req.params;
        const stats = await userService.getUserStats(userId);
        res.json({
            stats
        });
    }
    catch (error) {
        logger_1.logger.error('Get user stats error:', error);
        res.status(500).json({
            error: 'Failed to fetch user stats'
        });
    }
});
router.put('/settings', auth_1.authMiddleware, (0, validation_1.validateRequest)(users_1.userSchemas.updateSettings), async (req, res) => {
    try {
        const userId = req.user.id;
        const settings = req.body;
        const updatedSettings = await userService.updateUserSettings(userId, settings);
        res.json({
            message: 'Settings updated successfully',
            settings: updatedSettings
        });
    }
    catch (error) {
        logger_1.logger.error('Update settings error:', error);
        res.status(500).json({
            error: 'Failed to update settings'
        });
    }
});
router.get('/notifications', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 20, unreadOnly = false } = req.query;
        const notifications = await userService.getNotifications(userId, {
            page: Number(page),
            limit: Number(limit),
            unreadOnly: unreadOnly === 'true'
        });
        res.json({
            notifications,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total: notifications.length
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Get notifications error:', error);
        res.status(500).json({
            error: 'Failed to fetch notifications'
        });
    }
});
router.put('/notifications/:notificationId/read', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { notificationId } = req.params;
        await userService.markNotificationAsRead(notificationId, userId);
        res.json({
            message: 'Notification marked as read'
        });
    }
    catch (error) {
        logger_1.logger.error('Mark notification as read error:', error);
        res.status(500).json({
            error: 'Failed to mark notification as read'
        });
    }
});
router.put('/notifications/read-all', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        await userService.markAllNotificationsAsRead(userId);
        res.json({
            message: 'All notifications marked as read'
        });
    }
    catch (error) {
        logger_1.logger.error('Mark all notifications as read error:', error);
        res.status(500).json({
            error: 'Failed to mark all notifications as read'
        });
    }
});
exports.default = router;
//# sourceMappingURL=users.js.map