-- Enhanced Flavours Database Schema
-- This schema supports all frontend features including profiles, content, social interactions, monetization, and analytics

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- =============================================
-- CORE USER MANAGEMENT
-- =============================================

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(30) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    bio TEXT,
    avatar_url TEXT,
    cover_url TEXT,
    website TEXT,
    location VARCHAR(100),
    birth_date DATE,
    phone VARCHAR(20),
    
    -- Verification & Status
    is_verified BOOLEAN DEFAULT FALSE,
    is_creator BOOLEAN DEFAULT FALSE,
    is_private BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    age_verified BOOLEAN DEFAULT FALSE,
    kyc_verified BOOLEAN DEFAULT FALSE,
    
    -- Social Stats
    followers_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    posts_count INTEGER DEFAULT 0,
    likes_received INTEGER DEFAULT 0,
    total_views BIGINT DEFAULT 0,
    
    -- Privacy Settings
    privacy_settings JSONB DEFAULT '{
        "profile_visibility": "public",
        "show_email": false,
        "show_location": true,
        "show_website": true,
        "show_followers": true,
        "show_following": true,
        "allow_messages": "everyone",
        "allow_comments": "everyone"
    }',
    
    -- Social Links
    social_links JSONB DEFAULT '{}',
    
    -- Interests & Categories
    interests TEXT[] DEFAULT '{}',
    categories TEXT[] DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes
    CONSTRAINT username_length CHECK (char_length(username) >= 3),
    CONSTRAINT display_name_length CHECK (char_length(display_name) >= 1)
);

-- Creator profiles (extends profiles for monetization)
CREATE TABLE IF NOT EXISTS creators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Monetization Settings
    subscription_price DECIMAL(10,2) DEFAULT 0,
    subscription_tiers JSONB DEFAULT '[]',
    total_subscribers INTEGER DEFAULT 0,
    total_earnings DECIMAL(12,2) DEFAULT 0,
    monthly_earnings DECIMAL(12,2) DEFAULT 0,
    
    -- Verification Status
    verification_status VARCHAR(20) DEFAULT 'pending',
    verification_documents JSONB DEFAULT '{}',
    verification_notes TEXT,
    
    -- Creator Settings
    creator_settings JSONB DEFAULT '{
        "allow_tips": true,
        "allow_subscriptions": true,
        "allow_pay_per_view": true,
        "auto_approve_subscribers": false,
        "content_moderation": "auto"
    }',
    
    -- Analytics
    analytics_settings JSONB DEFAULT '{
        "track_views": true,
        "track_engagement": true,
        "track_revenue": true,
        "share_analytics": false
    }',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- SOCIAL RELATIONSHIPS
-- =============================================

-- Follow relationships
CREATE TABLE IF NOT EXISTS follows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(follower_id, following_id),
    CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);

-- Block relationships
CREATE TABLE IF NOT EXISTS blocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    blocker_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    blocked_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    reason VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(blocker_id, blocked_id),
    CONSTRAINT no_self_block CHECK (blocker_id != blocked_id)
);

-- =============================================
-- CONTENT MANAGEMENT
-- =============================================

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Content
    content TEXT NOT NULL,
    content_type VARCHAR(20) DEFAULT 'text', -- text, image, video, short_video, live
    privacy VARCHAR(20) DEFAULT 'public', -- public, followers, paid, private
    
    -- Monetization
    is_paid BOOLEAN DEFAULT FALSE,
    price DECIMAL(10,2) DEFAULT 0,
    preview_content TEXT,
    
    -- Metadata
    tags TEXT[] DEFAULT '{}',
    mentions TEXT[] DEFAULT '{}',
    location VARCHAR(100),
    category VARCHAR(50),
    
    -- Engagement Stats
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    views_count BIGINT DEFAULT 0,
    bookmarks_count INTEGER DEFAULT 0,
    
    -- Moderation
    is_moderated BOOLEAN DEFAULT FALSE,
    moderation_status VARCHAR(20) DEFAULT 'approved',
    moderation_notes TEXT,
    
    -- Scheduling
    scheduled_at TIMESTAMP WITH TIME ZONE,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT content_length CHECK (char_length(content) <= 2000),
    CONSTRAINT price_positive CHECK (price >= 0)
);

-- Media attachments
CREATE TABLE IF NOT EXISTS media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- File Info
    file_url TEXT NOT NULL,
    file_type VARCHAR(20) NOT NULL, -- image, video, audio, document
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    
    -- Media Metadata
    width INTEGER,
    height INTEGER,
    duration INTEGER, -- in seconds for videos/audio
    thumbnail_url TEXT,
    
    -- Processing Status
    processing_status VARCHAR(20) DEFAULT 'pending',
    processing_progress INTEGER DEFAULT 0,
    
    -- Storage Info
    storage_provider VARCHAR(20) DEFAULT 's3',
    storage_path TEXT NOT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- CONTENT INTERACTIONS
-- =============================================

-- Likes
CREATE TABLE IF NOT EXISTS likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, post_id)
);

-- Comments
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    
    content TEXT NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    
    -- Engagement
    likes_count INTEGER DEFAULT 0,
    replies_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT comment_content_length CHECK (char_length(content) <= 500)
);

-- Comment likes
CREATE TABLE IF NOT EXISTS comment_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, comment_id)
);

-- Bookmarks/Saves
CREATE TABLE IF NOT EXISTS bookmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, post_id)
);

-- Shares
CREATE TABLE IF NOT EXISTS shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    platform VARCHAR(50), -- internal, twitter, facebook, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- LIVE STREAMING (CAMS)
-- =============================================

-- Live streams
CREATE TABLE IF NOT EXISTS streams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Stream Info
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    tags TEXT[] DEFAULT '{}',
    
    -- Stream Settings
    is_private BOOLEAN DEFAULT FALSE,
    is_paid BOOLEAN DEFAULT FALSE,
    price DECIMAL(10,2) DEFAULT 0,
    max_viewers INTEGER,
    
    -- Stream Status
    status VARCHAR(20) DEFAULT 'scheduled', -- scheduled, live, ended, cancelled
    stream_key VARCHAR(100),
    stream_url TEXT,
    thumbnail_url TEXT,
    
    -- Analytics
    viewer_count INTEGER DEFAULT 0,
    peak_viewers INTEGER DEFAULT 0,
    total_duration INTEGER DEFAULT 0, -- in seconds
    total_earnings DECIMAL(10,2) DEFAULT 0,
    
    -- Timestamps
    scheduled_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stream viewers
CREATE TABLE IF NOT EXISTS stream_viewers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stream_id UUID NOT NULL REFERENCES streams(id) ON DELETE CASCADE,
    viewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Viewer Info
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    watch_duration INTEGER DEFAULT 0, -- in seconds
    is_subscriber BOOLEAN DEFAULT FALSE,
    is_tipper BOOLEAN DEFAULT FALSE,
    
    UNIQUE(stream_id, viewer_id)
);

-- Stream chat messages
CREATE TABLE IF NOT EXISTS stream_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stream_id UUID NOT NULL REFERENCES streams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    message TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text', -- text, gift, tip, system
    
    -- Gift/Tip Info
    gift_type VARCHAR(50),
    gift_value DECIMAL(10,2),
    
    -- Moderation
    is_moderated BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- ANONYMOUS CHAT (FLAVOURSTALK)
-- =============================================

-- Chat sessions
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Session Info
    session_type VARCHAR(20) DEFAULT 'random', -- random, topic, location
    topic VARCHAR(100),
    location VARCHAR(100),
    
    -- Participants (anonymized)
    participant_1_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    participant_2_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Session Status
    status VARCHAR(20) DEFAULT 'active', -- active, ended, reported
    ended_by UUID REFERENCES profiles(id),
    end_reason VARCHAR(50),
    
    -- Session Data
    session_data JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE
);

-- Chat messages
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    message TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text', -- text, image, emoji, system
    
    -- Moderation
    is_moderated BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- MONETIZATION & PAYMENTS
-- =============================================

-- Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscriber_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Subscription Info
    tier VARCHAR(50) DEFAULT 'basic',
    price DECIMAL(10,2) NOT NULL,
    billing_cycle VARCHAR(20) DEFAULT 'monthly', -- monthly, yearly
    
    -- Status
    status VARCHAR(20) DEFAULT 'active', -- active, cancelled, expired, paused
    auto_renew BOOLEAN DEFAULT TRUE,
    
    -- Payment Info
    stripe_subscription_id VARCHAR(100),
    payment_method_id VARCHAR(100),
    
    -- Timestamps
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(subscriber_id, creator_id)
);

-- Tips/Donations
CREATE TABLE IF NOT EXISTS tips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tipper_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    amount DECIMAL(10,2) NOT NULL,
    message TEXT,
    
    -- Payment Info
    stripe_payment_intent_id VARCHAR(100),
    payment_status VARCHAR(20) DEFAULT 'pending',
    
    -- Context
    context_type VARCHAR(20), -- post, stream, profile
    context_id UUID,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE
);

-- =============================================
-- NOTIFICATIONS
-- =============================================

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Notification Info
    type VARCHAR(50) NOT NULL, -- like, comment, follow, subscription, tip, etc.
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    
    -- Context
    context_type VARCHAR(50), -- post, user, stream, etc.
    context_id UUID,
    actor_id UUID REFERENCES profiles(id),
    
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    is_sent BOOLEAN DEFAULT FALSE,
    
    -- Delivery
    delivery_methods TEXT[] DEFAULT '{"in_app"}', -- in_app, email, push, sms
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
);

-- =============================================
-- ANALYTICS & REPORTING
-- =============================================

-- User analytics
CREATE TABLE IF NOT EXISTS user_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Engagement Metrics
    daily_active BOOLEAN DEFAULT FALSE,
    session_duration INTEGER DEFAULT 0, -- in seconds
    posts_viewed INTEGER DEFAULT 0,
    posts_liked INTEGER DEFAULT 0,
    posts_shared INTEGER DEFAULT 0,
    
    -- Revenue Metrics
    daily_earnings DECIMAL(10,2) DEFAULT 0,
    daily_tips_received INTEGER DEFAULT 0,
    daily_subscribers_gained INTEGER DEFAULT 0,
    
    -- Date
    date DATE NOT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, date)
);

-- Content analytics
CREATE TABLE IF NOT EXISTS content_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    
    -- View Metrics
    total_views BIGINT DEFAULT 0,
    unique_views BIGINT DEFAULT 0,
    views_by_source JSONB DEFAULT '{}',
    
    -- Engagement Metrics
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    bookmarks_count INTEGER DEFAULT 0,
    
    -- Revenue Metrics
    total_earnings DECIMAL(10,2) DEFAULT 0,
    pay_per_view_earnings DECIMAL(10,2) DEFAULT 0,
    
    -- Time Metrics
    avg_view_duration INTEGER DEFAULT 0, -- in seconds
    completion_rate DECIMAL(5,2) DEFAULT 0, -- percentage
    
    -- Date
    date DATE NOT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(post_id, date)
);

-- =============================================
-- STORAGE MANAGEMENT
-- =============================================

-- Storage usage tracking
CREATE TABLE IF NOT EXISTS storage_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Storage Info
    total_size BIGINT DEFAULT 0, -- in bytes
    images_size BIGINT DEFAULT 0,
    videos_size BIGINT DEFAULT 0,
    documents_size BIGINT DEFAULT 0,
    
    -- Limits
    storage_limit BIGINT DEFAULT 1073741824, -- 1GB default
    is_premium BOOLEAN DEFAULT FALSE,
    
    -- File Counts
    total_files INTEGER DEFAULT 0,
    images_count INTEGER DEFAULT 0,
    videos_count INTEGER DEFAULT 0,
    documents_count INTEGER DEFAULT 0,
    
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- =============================================
-- MODERATION & REPORTING
-- =============================================

-- Reports
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Report Info
    report_type VARCHAR(50) NOT NULL, -- post, user, stream, comment
    reported_id UUID NOT NULL,
    reason VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending', -- pending, reviewed, resolved, dismissed
    reviewed_by UUID REFERENCES profiles(id),
    review_notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE
);

-- =============================================
-- DATING FEATURES
-- =============================================

-- Dating profiles
CREATE TABLE IF NOT EXISTS dating_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Basic Info
    age INTEGER NOT NULL,
    height VARCHAR(10) NOT NULL,
    weight VARCHAR(10),
    location VARCHAR(100) NOT NULL,
    hometown VARCHAR(100),
    bio TEXT NOT NULL,
    
    -- Identity
    gender VARCHAR(20) NOT NULL,
    sexuality VARCHAR(20) NOT NULL,
    relationship_status VARCHAR(20) NOT NULL,
    pronouns VARCHAR(20),
    birthday DATE NOT NULL,
    ethnicity VARCHAR(50),
    
    -- Education & Career
    education VARCHAR(100),
    occupation VARCHAR(100),
    college VARCHAR(100),
    work VARCHAR(100),
    job_title VARCHAR(100),
    
    -- Lifestyle
    children VARCHAR(20),
    family_plans VARCHAR(20),
    pets VARCHAR(20),
    religion VARCHAR(50),
    zodiac VARCHAR(20),
    political_views VARCHAR(20),
    
    -- Interests & Preferences
    interests TEXT[] DEFAULT '{}',
    interested_in TEXT[] DEFAULT '{}',
    hobbies TEXT[] DEFAULT '{}',
    
    -- Vices
    marijuana VARCHAR(20),
    smoke VARCHAR(20),
    drinks VARCHAR(20),
    drugs VARCHAR(20),
    
    -- Sexual Info
    body_count VARCHAR(20),
    affairs VARCHAR(20),
    sexual_desires TEXT,
    
    -- Photos
    photos TEXT[] DEFAULT '{}',
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT age_check CHECK (age >= 18 AND age <= 100),
    CONSTRAINT bio_length CHECK (char_length(bio) >= 10 AND char_length(bio) <= 500)
);

-- Dating preferences
CREATE TABLE IF NOT EXISTS dating_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Age preferences
    age_range JSONB DEFAULT '{"min": 18, "max": 100}',
    
    -- Location preferences
    max_distance INTEGER DEFAULT 50, -- in miles/km
    location_preferences TEXT[] DEFAULT '{}',
    
    -- Gender preferences
    interested_in TEXT[] DEFAULT '{}',
    
    -- Lifestyle preferences
    deal_breakers TEXT[] DEFAULT '{}',
    must_haves TEXT[] DEFAULT '{}',
    nice_to_haves TEXT[] DEFAULT '{}',
    
    -- Other preferences
    education_preference VARCHAR(100),
    religion_preference VARCHAR(50),
    children_preference VARCHAR(20),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dating swipes
CREATE TABLE IF NOT EXISTS dating_swipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    target_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    action VARCHAR(20) NOT NULL, -- like, pass, super_like
    message TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, target_user_id)
);

-- Dating matches
CREATE TABLE IF NOT EXISTS dating_matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user1_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    user2_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    matched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Match metadata
    conversation_started BOOLEAN DEFAULT FALSE,
    last_message_at TIMESTAMP WITH TIME ZONE,
    
    UNIQUE(user1_id, user2_id)
);

-- Dating messages
CREATE TABLE IF NOT EXISTS dating_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID NOT NULL REFERENCES dating_matches(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    message TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text', -- text, image, emoji
    
    -- Message status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT message_length CHECK (char_length(message) <= 1000)
);

-- Dating reports
CREATE TABLE IF NOT EXISTS dating_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    reported_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    reason VARCHAR(50) NOT NULL,
    description TEXT,
    
    -- Report status
    status VARCHAR(20) DEFAULT 'pending', -- pending, reviewed, resolved, dismissed
    reviewed_by UUID REFERENCES profiles(id),
    review_notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE
);

-- Dating blocks
CREATE TABLE IF NOT EXISTS dating_blocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    blocker_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    blocked_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    reason TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(blocker_id, blocked_user_id)
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Profile indexes
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_display_name ON profiles USING gin(display_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_profiles_is_creator ON profiles(is_creator);
CREATE INDEX IF NOT EXISTS idx_profiles_is_verified ON profiles(is_verified);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);

-- Follow indexes
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_follows_created_at ON follows(created_at);

-- Post indexes
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_privacy ON posts(privacy);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_tags ON posts USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_posts_content ON posts USING gin(content gin_trgm_ops);

-- Media indexes
CREATE INDEX IF NOT EXISTS idx_media_post ON media(post_id);
CREATE INDEX IF NOT EXISTS idx_media_user ON media(user_id);
CREATE INDEX IF NOT EXISTS idx_media_type ON media(file_type);

-- Interaction indexes
CREATE INDEX IF NOT EXISTS idx_likes_user ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_post ON likes(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_author ON comments(author_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_shares_user ON shares(user_id);

-- Stream indexes
CREATE INDEX IF NOT EXISTS idx_streams_creator ON streams(creator_id);
CREATE INDEX IF NOT EXISTS idx_streams_status ON streams(status);
CREATE INDEX IF NOT EXISTS idx_streams_scheduled ON streams(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_stream_viewers_stream ON stream_viewers(stream_id);
CREATE INDEX IF NOT EXISTS idx_stream_viewers_viewer ON stream_viewers(viewer_id);

-- Notification indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_user_analytics_user ON user_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_analytics_date ON user_analytics(date);
CREATE INDEX IF NOT EXISTS idx_content_analytics_post ON content_analytics(post_id);
CREATE INDEX IF NOT EXISTS idx_content_analytics_date ON content_analytics(date);

-- Dating indexes
CREATE INDEX IF NOT EXISTS idx_dating_profiles_user ON dating_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_dating_profiles_age ON dating_profiles(age);
CREATE INDEX IF NOT EXISTS idx_dating_profiles_gender ON dating_profiles(gender);
CREATE INDEX IF NOT EXISTS idx_dating_profiles_location ON dating_profiles(location);
CREATE INDEX IF NOT EXISTS idx_dating_profiles_active ON dating_profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_dating_swipes_user ON dating_swipes(user_id);
CREATE INDEX IF NOT EXISTS idx_dating_swipes_target ON dating_swipes(target_user_id);
CREATE INDEX IF NOT EXISTS idx_dating_matches_user1 ON dating_matches(user1_id);
CREATE INDEX IF NOT EXISTS idx_dating_matches_user2 ON dating_matches(user2_id);
CREATE INDEX IF NOT EXISTS idx_dating_messages_match ON dating_messages(match_id);
CREATE INDEX IF NOT EXISTS idx_dating_messages_sender ON dating_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_dating_reports_reporter ON dating_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_dating_reports_reported ON dating_reports(reported_user_id);
CREATE INDEX IF NOT EXISTS idx_dating_blocks_blocker ON dating_blocks(blocker_id);
CREATE INDEX IF NOT EXISTS idx_dating_blocks_blocked ON dating_blocks(blocked_user_id);

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_creators_updated_at BEFORE UPDATE ON creators FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_media_updated_at BEFORE UPDATE ON media FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_streams_updated_at BEFORE UPDATE ON streams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dating_profiles_updated_at BEFORE UPDATE ON dating_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dating_preferences_updated_at BEFORE UPDATE ON dating_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update follower counts
CREATE OR REPLACE FUNCTION update_follower_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE profiles SET followers_count = followers_count + 1 WHERE id = NEW.following_id;
        UPDATE profiles SET following_count = following_count + 1 WHERE id = NEW.follower_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE profiles SET followers_count = followers_count - 1 WHERE id = OLD.following_id;
        UPDATE profiles SET following_count = following_count - 1 WHERE id = OLD.follower_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Trigger for follower counts
CREATE TRIGGER update_follower_counts_trigger
    AFTER INSERT OR DELETE ON follows
    FOR EACH ROW EXECUTE FUNCTION update_follower_counts();

-- Function to update post engagement counts
CREATE OR REPLACE FUNCTION update_post_engagement()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF TG_TABLE_NAME = 'likes' THEN
            UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
        ELSIF TG_TABLE_NAME = 'comments' THEN
            UPDATE posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
        ELSIF TG_TABLE_NAME = 'bookmarks' THEN
            UPDATE posts SET bookmarks_count = bookmarks_count + 1 WHERE id = NEW.post_id;
        ELSIF TG_TABLE_NAME = 'shares' THEN
            UPDATE posts SET shares_count = shares_count + 1 WHERE id = NEW.post_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        IF TG_TABLE_NAME = 'likes' THEN
            UPDATE posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
        ELSIF TG_TABLE_NAME = 'comments' THEN
            UPDATE posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
        ELSIF TG_TABLE_NAME = 'bookmarks' THEN
            UPDATE posts SET bookmarks_count = bookmarks_count - 1 WHERE id = OLD.post_id;
        ELSIF TG_TABLE_NAME = 'shares' THEN
            UPDATE posts SET shares_count = shares_count - 1 WHERE id = OLD.post_id;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Triggers for post engagement
CREATE TRIGGER update_post_likes_trigger AFTER INSERT OR DELETE ON likes FOR EACH ROW EXECUTE FUNCTION update_post_engagement();
CREATE TRIGGER update_post_comments_trigger AFTER INSERT OR DELETE ON comments FOR EACH ROW EXECUTE FUNCTION update_post_engagement();
CREATE TRIGGER update_post_bookmarks_trigger AFTER INSERT OR DELETE ON bookmarks FOR EACH ROW EXECUTE FUNCTION update_post_engagement();
CREATE TRIGGER update_post_shares_trigger AFTER INSERT OR DELETE ON shares FOR EACH ROW EXECUTE FUNCTION update_post_engagement();

-- Function to update posts count
CREATE OR REPLACE FUNCTION update_posts_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE profiles SET posts_count = posts_count + 1 WHERE id = NEW.author_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE profiles SET posts_count = posts_count - 1 WHERE id = OLD.author_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Trigger for posts count
CREATE TRIGGER update_posts_count_trigger
    AFTER INSERT OR DELETE ON posts
    FOR EACH ROW EXECUTE FUNCTION update_posts_count();

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE dating_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE dating_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE dating_swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE dating_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE dating_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE dating_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE dating_blocks ENABLE ROW LEVEL SECURITY;

-- Profile policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
    FOR SELECT USING (privacy_settings->>'profile_visibility' = 'public');

CREATE POLICY "Users can view their own profile" ON profiles
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Post policies
CREATE POLICY "Public posts are viewable by everyone" ON posts
    FOR SELECT USING (privacy = 'public');

CREATE POLICY "Users can view their own posts" ON posts
    FOR SELECT USING (auth.uid() = (SELECT user_id FROM profiles WHERE id = author_id));

CREATE POLICY "Users can create posts" ON posts
    FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM profiles WHERE id = author_id));

CREATE POLICY "Users can update their own posts" ON posts
    FOR UPDATE USING (auth.uid() = (SELECT user_id FROM profiles WHERE id = author_id));

CREATE POLICY "Users can delete their own posts" ON posts
    FOR DELETE USING (auth.uid() = (SELECT user_id FROM profiles WHERE id = author_id));

-- Follow policies
CREATE POLICY "Users can view their own follows" ON follows
    FOR SELECT USING (auth.uid() = (SELECT user_id FROM profiles WHERE id = follower_id));

CREATE POLICY "Users can create follows" ON follows
    FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM profiles WHERE id = follower_id));

CREATE POLICY "Users can delete their own follows" ON follows
    FOR DELETE USING (auth.uid() = (SELECT user_id FROM profiles WHERE id = follower_id));

-- Like policies
CREATE POLICY "Users can view likes" ON likes
    FOR SELECT USING (true);

CREATE POLICY "Users can create likes" ON likes
    FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM profiles WHERE id = user_id));

CREATE POLICY "Users can delete their own likes" ON likes
    FOR DELETE USING (auth.uid() = (SELECT user_id FROM profiles WHERE id = user_id));

-- Comment policies
CREATE POLICY "Users can view comments" ON comments
    FOR SELECT USING (true);

CREATE POLICY "Users can create comments" ON comments
    FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM profiles WHERE id = author_id));

CREATE POLICY "Users can update their own comments" ON comments
    FOR UPDATE USING (auth.uid() = (SELECT user_id FROM profiles WHERE id = author_id));

CREATE POLICY "Users can delete their own comments" ON comments
    FOR DELETE USING (auth.uid() = (SELECT user_id FROM profiles WHERE id = author_id));

-- Notification policies
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (auth.uid() = (SELECT user_id FROM profiles WHERE id = user_id));

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = (SELECT user_id FROM profiles WHERE id = user_id));

-- Dating profile policies
CREATE POLICY "Users can view their own dating profile" ON dating_profiles
    FOR ALL USING (auth.uid() = (SELECT user_id FROM profiles WHERE id = user_id));

CREATE POLICY "Users can view other active dating profiles" ON dating_profiles
    FOR SELECT USING (is_active = true);

-- Dating preferences policies
CREATE POLICY "Users can manage their own dating preferences" ON dating_preferences
    FOR ALL USING (auth.uid() = (SELECT user_id FROM profiles WHERE id = user_id));

-- Dating swipes policies
CREATE POLICY "Users can view their own swipes" ON dating_swipes
    FOR SELECT USING (auth.uid() = (SELECT user_id FROM profiles WHERE id = user_id));

CREATE POLICY "Users can create their own swipes" ON dating_swipes
    FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM profiles WHERE id = user_id));

-- Dating matches policies
CREATE POLICY "Users can view their own matches" ON dating_matches
    FOR SELECT USING (auth.uid() = (SELECT user_id FROM profiles WHERE id = user1_id) OR 
                      auth.uid() = (SELECT user_id FROM profiles WHERE id = user2_id));

CREATE POLICY "Users can create matches" ON dating_matches
    FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM profiles WHERE id = user1_id) OR 
                           auth.uid() = (SELECT user_id FROM profiles WHERE id = user2_id));

-- Dating messages policies
CREATE POLICY "Users can view messages in their matches" ON dating_messages
    FOR SELECT USING (auth.uid() = (SELECT user_id FROM profiles WHERE id = sender_id) OR
                      auth.uid() = (SELECT user_id FROM profiles WHERE id = 
                        (SELECT user1_id FROM dating_matches WHERE id = match_id)) OR
                      auth.uid() = (SELECT user_id FROM profiles WHERE id = 
                        (SELECT user2_id FROM dating_matches WHERE id = match_id)));

CREATE POLICY "Users can send messages in their matches" ON dating_messages
    FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM profiles WHERE id = sender_id));

-- Dating reports policies
CREATE POLICY "Users can view their own reports" ON dating_reports
    FOR SELECT USING (auth.uid() = (SELECT user_id FROM profiles WHERE id = reporter_id));

CREATE POLICY "Users can create reports" ON dating_reports
    FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM profiles WHERE id = reporter_id));

-- Dating blocks policies
CREATE POLICY "Users can view their own blocks" ON dating_blocks
    FOR SELECT USING (auth.uid() = (SELECT user_id FROM profiles WHERE id = blocker_id));

CREATE POLICY "Users can create blocks" ON dating_blocks
    FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM profiles WHERE id = blocker_id));

CREATE POLICY "Users can delete their own blocks" ON dating_blocks
    FOR DELETE USING (auth.uid() = (SELECT user_id FROM profiles WHERE id = blocker_id));
