-- Database Indexes for Performance Optimization
-- These indexes improve query performance for common operations

-- Profiles table indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_is_creator ON profiles(is_creator);
CREATE INDEX IF NOT EXISTS idx_profiles_is_verified ON profiles(is_verified);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_last_active ON profiles(last_active);

-- Composite indexes for profiles
CREATE INDEX IF NOT EXISTS idx_profiles_creator_verified ON profiles(is_creator, is_verified);
CREATE INDEX IF NOT EXISTS idx_profiles_status_active ON profiles(status, last_active);

-- Posts table indexes
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at);
CREATE INDEX IF NOT EXISTS idx_posts_privacy ON posts(privacy);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_is_featured ON posts(is_featured);
CREATE INDEX IF NOT EXISTS idx_posts_likes_count ON posts(likes_count);
CREATE INDEX IF NOT EXISTS idx_posts_views_count ON posts(views_count);
CREATE INDEX IF NOT EXISTS idx_posts_trending_score ON posts(trending_score);
CREATE INDEX IF NOT EXISTS idx_posts_engagement_rate ON posts(engagement_rate);

-- Composite indexes for posts
CREATE INDEX IF NOT EXISTS idx_posts_user_created ON posts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_privacy_created ON posts(privacy, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_category_trending ON posts(category, trending_score DESC);
CREATE INDEX IF NOT EXISTS idx_posts_featured_created ON posts(is_featured, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_engagement_created ON posts(engagement_rate DESC, created_at DESC);

-- Comments table indexes
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_comment_id ON comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at);
CREATE INDEX IF NOT EXISTS idx_comments_likes_count ON comments(likes_count);

-- Composite indexes for comments
CREATE INDEX IF NOT EXISTS idx_comments_post_created ON comments(post_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_parent_created ON comments(parent_comment_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_user_created ON comments(user_id, created_at DESC);

-- Likes table indexes
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_post_id ON likes(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_created_at ON likes(created_at);

-- Composite indexes for likes
CREATE INDEX IF NOT EXISTS idx_likes_user_post ON likes(user_id, post_id);
CREATE INDEX IF NOT EXISTS idx_likes_post_created ON likes(post_id, created_at DESC);

-- Follows table indexes
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_follows_created_at ON follows(created_at);

-- Composite indexes for follows
CREATE INDEX IF NOT EXISTS idx_follows_follower_following ON follows(follower_id, following_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_created ON follows(following_id, created_at DESC);

-- Notifications table indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_related_id ON notifications(related_id);
CREATE INDEX IF NOT EXISTS idx_notifications_related_type ON notifications(related_type);

-- Composite indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread_created ON notifications(is_read, created_at DESC) WHERE is_read = false;

-- Messages table indexes
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Composite indexes for messages
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created ON messages(conversation_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_unread ON messages(recipient_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_messages_sender_created ON messages(sender_id, created_at DESC);

-- Conversations table indexes
CREATE INDEX IF NOT EXISTS idx_conversations_user1_id ON conversations(user1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user2_id ON conversations(user2_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON conversations(last_message_at);

-- Composite indexes for conversations
CREATE INDEX IF NOT EXISTS idx_conversations_users ON conversations(user1_id, user2_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user1_last_message ON conversations(user1_id, last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_user2_last_message ON conversations(user2_id, last_message_at DESC);

-- Search optimization indexes
CREATE INDEX IF NOT EXISTS idx_posts_content_fts ON posts USING gin(to_tsvector('english', content));
CREATE INDEX IF NOT EXISTS idx_profiles_display_name_fts ON profiles USING gin(to_tsvector('english', display_name));
CREATE INDEX IF NOT EXISTS idx_profiles_bio_fts ON profiles USING gin(to_tsvector('english', bio));

-- Analytics and reporting indexes
CREATE INDEX IF NOT EXISTS idx_posts_analytics ON posts(created_at, likes_count, views_count, engagement_rate);
CREATE INDEX IF NOT EXISTS idx_profiles_analytics ON profiles(created_at, followers_count, posts_count, total_earnings);

-- Performance monitoring indexes
CREATE INDEX IF NOT EXISTS idx_posts_performance ON posts(trending_score DESC, quality_score DESC, freshness_score DESC);

-- Cleanup and maintenance
-- These indexes help with data cleanup and maintenance operations
CREATE INDEX IF NOT EXISTS idx_notifications_cleanup ON notifications(created_at) WHERE is_read = true;
CREATE INDEX IF NOT EXISTS idx_messages_cleanup ON messages(created_at) WHERE is_read = true;

-- Partial indexes for better performance on filtered queries
CREATE INDEX IF NOT EXISTS idx_posts_public ON posts(created_at DESC) WHERE privacy = 'public';
CREATE INDEX IF NOT EXISTS idx_posts_featured ON posts(trending_score DESC) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_profiles_active ON profiles(last_active DESC) WHERE status = 'active';

-- Statistics and aggregation indexes
CREATE INDEX IF NOT EXISTS idx_posts_stats_daily ON posts(DATE(created_at), likes_count, views_count);
CREATE INDEX IF NOT EXISTS idx_profiles_stats_daily ON profiles(DATE(created_at), followers_count);

-- Comments with replies optimization
CREATE INDEX IF NOT EXISTS idx_comments_replies ON comments(post_id, parent_comment_id, created_at ASC) WHERE parent_comment_id IS NOT NULL;

-- User interaction optimization
CREATE INDEX IF NOT EXISTS idx_user_interactions ON likes(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity ON posts(user_id, created_at DESC);

-- Content discovery indexes
CREATE INDEX IF NOT EXISTS idx_content_discovery ON posts(category, trending_score DESC, created_at DESC) WHERE privacy = 'public';
CREATE INDEX IF NOT EXISTS idx_creator_discovery ON profiles(is_creator, followers_count DESC, is_verified) WHERE status = 'active';

-- Notification delivery optimization
CREATE INDEX IF NOT EXISTS idx_notification_delivery ON notifications(user_id, type, created_at DESC) WHERE is_read = false;

-- Message threading optimization
CREATE INDEX IF NOT EXISTS idx_message_threading ON messages(conversation_id, created_at ASC, sender_id);

-- Performance tips:
-- 1. Monitor index usage with: SELECT * FROM pg_stat_user_indexes;
-- 2. Check for unused indexes: SELECT * FROM pg_stat_user_indexes WHERE idx_scan = 0;
-- 3. Analyze table statistics: ANALYZE table_name;
-- 4. Update statistics: UPDATE pg_stat_user_tables SET last_analyze = now() WHERE relname = 'table_name';
-- 5. Consider partitioning for large tables (posts, messages, notifications)
-- 6. Use EXPLAIN ANALYZE to check query performance
-- 7. Consider materialized views for complex aggregations
