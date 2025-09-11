/*
  # Fix Missing Columns
  
  This migration adds missing columns that the backend expects:
  - Add missing columns to profiles table
  - Add missing columns to audit_logs table
  - Add missing tables for user relationships
*/

-- Add missing columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cover_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS posts_count INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_active TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'creator', 'admin'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Add missing columns to audit_logs table
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS details JSONB;

-- Create follows table for user relationships
CREATE TABLE IF NOT EXISTS follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT different_users CHECK (follower_id != following_id),
  UNIQUE(follower_id, following_id)
);

-- Create blocks table for user blocking
CREATE TABLE IF NOT EXISTS blocks (
  id UUID PRIMARY KEY PRIMARY KEY DEFAULT uuid_generate_v4(),
  blocker_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT different_users CHECK (blocker_id != blocked_id),
  UNIQUE(blocker_id, blocked_id)
);

-- Create moderation_queue table (alias for moderation_items)
CREATE TABLE IF NOT EXISTS moderation_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('post', 'comment', 'user', 'creator')),
  content JSONB NOT NULL,
  reason TEXT NOT NULL,
  reported_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create post_likes table
CREATE TABLE IF NOT EXISTS post_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  post_author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(post_id, user_id)
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  post_author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create post_shares table
CREATE TABLE IF NOT EXISTS post_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  post_author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_shares ENABLE ROW LEVEL SECURITY;

-- RLS Policies for follows
CREATE POLICY "Users can view follows"
  ON follows FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create follows"
  ON follows FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete their own follows"
  ON follows FOR DELETE
  TO authenticated
  USING (auth.uid() = follower_id);

-- RLS Policies for blocks
CREATE POLICY "Users can view their own blocks"
  ON blocks FOR SELECT
  TO authenticated
  USING (auth.uid() = blocker_id);

CREATE POLICY "Users can create blocks"
  ON blocks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "Users can delete their own blocks"
  ON blocks FOR DELETE
  TO authenticated
  USING (auth.uid() = blocker_id);

-- RLS Policies for user_settings
CREATE POLICY "Users can manage their own settings"
  ON user_settings FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for post_likes
CREATE POLICY "Users can view likes"
  ON post_likes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create likes"
  ON post_likes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes"
  ON post_likes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for comments
CREATE POLICY "Users can view comments"
  ON comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for post_shares
CREATE POLICY "Users can view shares"
  ON post_shares FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create shares"
  ON post_shares FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for new tables
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_blocks_blocker_id ON blocks(blocker_id);
CREATE INDEX IF NOT EXISTS idx_blocks_blocked_id ON blocks(blocked_id);
CREATE INDEX IF NOT EXISTS idx_moderation_queue_status ON moderation_queue(status);
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_post_shares_post_id ON post_shares(post_id);
CREATE INDEX IF NOT EXISTS idx_post_shares_user_id ON post_shares(user_id);
