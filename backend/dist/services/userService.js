"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const database_1 = require("../config/database");
const logger_1 = require("../utils/logger");
const redis_1 = require("../config/redis");
const uuid_1 = require("uuid");
class UserService {
    constructor() {
        this.CACHE_TTL = 3600;
    }
    async getProfileByUsername(username) {
        try {
            const cacheKey = `profile:username:${username}`;
            const cached = await redis_1.redisManager.get(cacheKey);
            if (cached) {
                return cached;
            }
            const { data, error } = await database_1.supabase
                .from('profiles')
                .select(`
          id,
          username,
          display_name,
          bio,
          avatar_url,
          is_verified,
          created_at,
          updated_at
        `)
                .eq('username', username)
                .single();
            if (error) {
                logger_1.logger.error('Error fetching profile by username:', error);
                return null;
            }
            await redis_1.redisManager.set(cacheKey, data, this.CACHE_TTL);
            return data;
        }
        catch (error) {
            logger_1.logger.error('Error in getProfileByUsername:', error);
            return null;
        }
    }
    async getProfileByUserId(userId) {
        try {
            const cacheKey = `profile:user:${userId}`;
            const cached = await redis_1.redisManager.get(cacheKey);
            if (cached) {
                return cached;
            }
            const { data, error } = await database_1.supabase
                .from('profiles')
                .select(`
          id,
          username,
          display_name,
          bio,
          avatar_url,
          is_verified,
          created_at,
          updated_at
        `)
                .eq('id', userId)
                .single();
            if (error) {
                logger_1.logger.error('Error fetching profile by user ID:', error);
                return null;
            }
            await redis_1.redisManager.set(cacheKey, data, this.CACHE_TTL);
            return data;
        }
        catch (error) {
            logger_1.logger.error('Error in getProfileByUserId:', error);
            return null;
        }
    }
    async updateProfile(userId, updateData) {
        try {
            const { data, error } = await database_1.supabase
                .from('profiles')
                .update({
                ...updateData,
                updated_at: new Date().toISOString()
            })
                .eq('id', userId)
                .select()
                .single();
            if (error) {
                logger_1.logger.error('Error updating profile:', error);
                throw new Error('Failed to update profile');
            }
            await redis_1.redisManager.del(`profile:user:${userId}`);
            await redis_1.redisManager.del(`profile:username:${data.username}`);
            return data;
        }
        catch (error) {
            logger_1.logger.error('Error in updateProfile:', error);
            throw error;
        }
    }
    async uploadProfilePicture(userId, file) {
        try {
            const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`;
            await this.updateProfile(userId, { avatar_url: avatarUrl });
            return avatarUrl;
        }
        catch (error) {
            logger_1.logger.error('Error uploading profile picture:', error);
            throw new Error('Failed to upload profile picture');
        }
    }
    async toggleFollow(userId, followerId) {
        try {
            const { data: existingFollow, error: checkError } = await database_1.supabase
                .from('follows')
                .select('id')
                .eq('follower_id', followerId)
                .eq('following_id', userId)
                .single();
            if (checkError && checkError.code !== 'PGRST116') {
                throw checkError;
            }
            let following = false;
            let followersCount = 0;
            if (existingFollow) {
                const { error: unfollowError } = await database_1.supabase
                    .from('follows')
                    .delete()
                    .eq('follower_id', followerId)
                    .eq('following_id', userId);
                if (unfollowError) {
                    throw unfollowError;
                }
                following = false;
            }
            else {
                const { error: followError } = await database_1.supabase
                    .from('follows')
                    .insert({
                    id: (0, uuid_1.v4)(),
                    follower_id: followerId,
                    following_id: userId,
                    created_at: new Date().toISOString()
                });
                if (followError) {
                    throw followError;
                }
                following = true;
            }
            const { count } = await database_1.supabase
                .from('follows')
                .select('*', { count: 'exact', head: true })
                .eq('following_id', userId);
            followersCount = count || 0;
            await database_1.supabase
                .from('profiles')
                .update({ followers_count: followersCount })
                .eq('id', userId);
            await redis_1.redisManager.del(`profile:user:${userId}`);
            return { following, followersCount };
        }
        catch (error) {
            logger_1.logger.error('Error in toggleFollow:', error);
            throw error;
        }
    }
    async getFollowers(userId, options) {
        try {
            const { data, error } = await database_1.supabase
                .from('follows')
                .select(`
          profiles!follows_follower_id_fkey (
            id,
            username,
            display_name,
            bio,
            avatar_url,
            is_verified,
            is_private,
            followers_count,
            following_count,
            posts_count,
            created_at
          )
        `)
                .eq('following_id', userId)
                .range((options.page - 1) * options.limit, options.page * options.limit - 1);
            if (error) {
                logger_1.logger.error('Error fetching followers:', error);
                return [];
            }
            return data?.map(follow => follow.profiles).filter(Boolean) || [];
        }
        catch (error) {
            logger_1.logger.error('Error in getFollowers:', error);
            return [];
        }
    }
    async getFollowing(userId, options) {
        try {
            const { data, error } = await database_1.supabase
                .from('follows')
                .select(`
          profiles!follows_following_id_fkey (
            id,
            username,
            display_name,
            bio,
            avatar_url,
            is_verified,
            is_private,
            followers_count,
            following_count,
            posts_count,
            created_at
          )
        `)
                .eq('follower_id', userId)
                .range((options.page - 1) * options.limit, options.page * options.limit - 1);
            if (error) {
                logger_1.logger.error('Error fetching following:', error);
                return [];
            }
            return data?.map(follow => follow.profiles).filter(Boolean) || [];
        }
        catch (error) {
            logger_1.logger.error('Error in getFollowing:', error);
            return [];
        }
    }
    async toggleBlock(userId, blockerId) {
        try {
            const { data: existingBlock, error: checkError } = await database_1.supabase
                .from('blocks')
                .select('id')
                .eq('blocker_id', blockerId)
                .eq('blocked_id', userId)
                .single();
            if (checkError && checkError.code !== 'PGRST116') {
                throw checkError;
            }
            let blocked = false;
            if (existingBlock) {
                const { error: unblockError } = await database_1.supabase
                    .from('blocks')
                    .delete()
                    .eq('blocker_id', blockerId)
                    .eq('blocked_id', userId);
                if (unblockError) {
                    throw unblockError;
                }
                blocked = false;
            }
            else {
                const { error: blockError } = await database_1.supabase
                    .from('blocks')
                    .insert({
                    id: (0, uuid_1.v4)(),
                    blocker_id: blockerId,
                    blocked_id: userId,
                    created_at: new Date().toISOString()
                });
                if (blockError) {
                    throw blockError;
                }
                blocked = true;
            }
            return { blocked };
        }
        catch (error) {
            logger_1.logger.error('Error in toggleBlock:', error);
            throw error;
        }
    }
    async getBlockedUsers(userId, options) {
        try {
            const { data, error } = await database_1.supabase
                .from('blocks')
                .select(`
          profiles!blocks_blocked_id_fkey (
            id,
            username,
            display_name,
            bio,
            avatar_url,
            is_verified,
            is_private,
            followers_count,
            following_count,
            posts_count,
            created_at
          )
        `)
                .eq('blocker_id', userId)
                .range((options.page - 1) * options.limit, options.page * options.limit - 1);
            if (error) {
                logger_1.logger.error('Error fetching blocked users:', error);
                return [];
            }
            return data?.map(block => block.profiles).filter(Boolean) || [];
        }
        catch (error) {
            logger_1.logger.error('Error in getBlockedUsers:', error);
            return [];
        }
    }
    async searchUsers(query, options) {
        try {
            const { data, error } = await database_1.supabase
                .from('profiles')
                .select(`
          id,
          username,
          display_name,
          bio,
          avatar_url,
          is_verified,
          is_private,
          followers_count,
          following_count,
          posts_count,
          created_at
        `)
                .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
                .range((options.page - 1) * options.limit, options.page * options.limit - 1);
            if (error) {
                logger_1.logger.error('Error searching users:', error);
                return [];
            }
            return data || [];
        }
        catch (error) {
            logger_1.logger.error('Error in searchUsers:', error);
            return [];
        }
    }
    async getUserStats(userId) {
        try {
            const cacheKey = `stats:user:${userId}`;
            const cached = await redis_1.redisManager.get(cacheKey);
            if (cached) {
                return cached;
            }
            const { data: profile, error: profileError } = await database_1.supabase
                .from('profiles')
                .select('followers_count, following_count, posts_count')
                .eq('id', userId)
                .single();
            if (profileError) {
                logger_1.logger.error('Error fetching user stats:', profileError);
                return {
                    followers_count: 0,
                    following_count: 0,
                    posts_count: 0,
                    likes_received: 0,
                    comments_received: 0,
                    shares_received: 0
                };
            }
            const [likesResult, commentsResult, sharesResult] = await Promise.all([
                database_1.supabase
                    .from('post_likes')
                    .select('*', { count: 'exact', head: true })
                    .eq('post_author_id', userId),
                database_1.supabase
                    .from('comments')
                    .select('*', { count: 'exact', head: true })
                    .eq('post_author_id', userId),
                database_1.supabase
                    .from('post_shares')
                    .select('*', { count: 'exact', head: true })
                    .eq('post_author_id', userId)
            ]);
            const stats = {
                followers_count: profile.followers_count || 0,
                following_count: profile.following_count || 0,
                posts_count: profile.posts_count || 0,
                likes_received: likesResult.count || 0,
                comments_received: commentsResult.count || 0,
                shares_received: sharesResult.count || 0
            };
            await redis_1.redisManager.set(cacheKey, stats, this.CACHE_TTL);
            return stats;
        }
        catch (error) {
            logger_1.logger.error('Error in getUserStats:', error);
            return {
                followers_count: 0,
                following_count: 0,
                posts_count: 0,
                likes_received: 0,
                comments_received: 0,
                shares_received: 0
            };
        }
    }
    async updateUserSettings(userId, settings) {
        try {
            const { data, error } = await database_1.supabase
                .from('user_settings')
                .upsert({
                user_id: userId,
                ...settings,
                updated_at: new Date().toISOString()
            })
                .select()
                .single();
            if (error) {
                logger_1.logger.error('Error updating user settings:', error);
                throw new Error('Failed to update settings');
            }
            return data;
        }
        catch (error) {
            logger_1.logger.error('Error in updateUserSettings:', error);
            throw error;
        }
    }
    async getNotifications(userId, options) {
        try {
            let query = database_1.supabase
                .from('notifications')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });
            if (options.unreadOnly) {
                query = query.eq('is_read', false);
            }
            const { data, error } = await query
                .range((options.page - 1) * options.limit, options.page * options.limit - 1);
            if (error) {
                logger_1.logger.error('Error fetching notifications:', error);
                return [];
            }
            return data || [];
        }
        catch (error) {
            logger_1.logger.error('Error in getNotifications:', error);
            return [];
        }
    }
    async markNotificationAsRead(notificationId, userId) {
        try {
            const { error } = await database_1.supabase
                .from('notifications')
                .update({ is_read: true, read_at: new Date().toISOString() })
                .eq('id', notificationId)
                .eq('user_id', userId);
            if (error) {
                logger_1.logger.error('Error marking notification as read:', error);
                throw new Error('Failed to mark notification as read');
            }
        }
        catch (error) {
            logger_1.logger.error('Error in markNotificationAsRead:', error);
            throw error;
        }
    }
    async markAllNotificationsAsRead(userId) {
        try {
            const { error } = await database_1.supabase
                .from('notifications')
                .update({ is_read: true, read_at: new Date().toISOString() })
                .eq('user_id', userId)
                .eq('is_read', false);
            if (error) {
                logger_1.logger.error('Error marking all notifications as read:', error);
                throw new Error('Failed to mark all notifications as read');
            }
        }
        catch (error) {
            logger_1.logger.error('Error in markAllNotificationsAsRead:', error);
            throw error;
        }
    }
}
exports.UserService = UserService;
//# sourceMappingURL=userService.js.map