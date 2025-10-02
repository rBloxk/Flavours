-- Seed data for development and testing
-- This file contains sample data for the Flavours platform

-- Insert sample profiles (these would normally be created through auth signup)
INSERT INTO profiles (user_id, username, display_name, email, role, is_verified, is_creator, bio, location) VALUES
('00000000-0000-0000-0000-000000000001', 'admin', 'Admin User', 'admin@flavours.club', 'admin', true, false, 'Platform administrator', 'San Francisco, CA'),
('00000000-0000-0000-0000-000000000002', 'creator1', 'Sarah Johnson', 'sarah@example.com', 'creator', true, true, 'Content creator and influencer', 'Los Angeles, CA'),
('00000000-0000-0000-0000-000000000003', 'creator2', 'Mike Chen', 'mike@example.com', 'creator', true, true, 'Tech reviewer and educator', 'New York, NY'),
('00000000-0000-0000-0000-000000000004', 'user1', 'Emma Wilson', 'emma@example.com', 'user', false, false, 'Content enthusiast', 'Chicago, IL'),
('00000000-0000-0000-0000-000000000005', 'user2', 'Alex Rodriguez', 'alex@example.com', 'user', false, false, 'Music lover', 'Miami, FL');

-- Insert sample posts
INSERT INTO posts (user_id, content, is_paid, price, privacy, category, likes_count, comments_count, views_count) VALUES
('00000000-0000-0000-0000-000000000002', 'Just finished an amazing photoshoot! Here are some behind-the-scenes moments. The lighting was perfect and the team was incredible. Can''t wait to share the final results with you all! 📸✨', false, 0, 'public', 'lifestyle', 45, 12, 234),
('00000000-0000-0000-0000-000000000002', 'Exclusive content for my subscribers! This is a premium post with special content that only my supporters can see. Thank you for your support! 💎', true, 9.99, 'paid', 'exclusive', 23, 8, 89),
('00000000-0000-0000-0000-000000000003', 'Review: The new MacBook Pro M3 is absolutely incredible. The performance improvements are noticeable immediately, and the battery life is outstanding. Here''s my detailed analysis...', false, 0, 'public', 'technology', 67, 19, 456),
('00000000-0000-0000-0000-000000000003', 'Tutorial: How to optimize your development workflow with these 10 essential tools. This comprehensive guide will save you hours every week. Link in bio!', true, 4.99, 'paid', 'education', 34, 15, 178),
('00000000-0000-0000-0000-000000000004', 'Beautiful sunset from my evening walk. Sometimes the simplest moments are the most precious. 🌅', false, 0, 'public', 'lifestyle', 28, 6, 123),
('00000000-0000-0000-0000-000000000005', 'New track dropping next week! Here''s a 30-second preview. What do you think? 🎵', false, 0, 'public', 'music', 89, 24, 567);

-- Insert sample comments
INSERT INTO comments (post_id, user_id, content, likes_count) VALUES
((SELECT id FROM posts WHERE content LIKE '%photoshoot%'), '00000000-0000-0000-0000-000000000004', 'Amazing work! The lighting looks perfect!', 3),
((SELECT id FROM posts WHERE content LIKE '%photoshoot%'), '00000000-0000-0000-0000-000000000005', 'Can''t wait to see the final results!', 1),
((SELECT id FROM posts WHERE content LIKE '%MacBook Pro%'), '00000000-0000-0000-0000-000000000002', 'Great review! Very helpful analysis.', 5),
((SELECT id FROM posts WHERE content LIKE '%MacBook Pro%'), '00000000-0000-0000-0000-000000000004', 'Thanks for the detailed breakdown!', 2);

-- Insert sample follows
INSERT INTO follows (follower_id, following_id) VALUES
('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002'),
('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000003'),
('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000002'),
('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000003'),
('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003');

-- Insert sample likes
INSERT INTO likes (user_id, post_id) VALUES
('00000000-0000-0000-0000-000000000004', (SELECT id FROM posts WHERE content LIKE '%photoshoot%')),
('00000000-0000-0000-0000-000000000005', (SELECT id FROM posts WHERE content LIKE '%photoshoot%')),
('00000000-0000-0000-0000-000000000002', (SELECT id FROM posts WHERE content LIKE '%MacBook Pro%')),
('00000000-0000-0000-0000-000000000004', (SELECT id FROM posts WHERE content LIKE '%MacBook Pro%')),
('00000000-0000-0000-0000-000000000005', (SELECT id FROM posts WHERE content LIKE '%sunset%'));

-- Insert sample bookmarks
INSERT INTO bookmarks (user_id, post_id) VALUES
('00000000-0000-0000-0000-000000000004', (SELECT id FROM posts WHERE content LIKE '%MacBook Pro%')),
('00000000-0000-0000-0000-000000000005', (SELECT id FROM posts WHERE content LIKE '%tutorial%'));

-- Insert sample subscriptions
INSERT INTO subscriptions (subscriber_id, creator_id, tier, price, status) VALUES
('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002', 'premium', 9.99, 'active'),
('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000002', 'premium', 9.99, 'active'),
('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000003', 'basic', 4.99, 'active');

-- Insert sample transactions
INSERT INTO transactions (user_id, post_id, amount, currency, status, payment_method, description) VALUES
('00000000-0000-0000-0000-000000000004', (SELECT id FROM posts WHERE content LIKE '%Exclusive content%'), 9.99, 'USD', 'completed', 'stripe', 'Premium post purchase'),
('00000000-0000-0000-0000-000000000005', (SELECT id FROM posts WHERE content LIKE '%Exclusive content%'), 9.99, 'USD', 'completed', 'stripe', 'Premium post purchase'),
('00000000-0000-0000-0000-000000000004', (SELECT id FROM posts WHERE content LIKE '%tutorial%'), 4.99, 'USD', 'completed', 'stripe', 'Educational content purchase');

-- Insert sample notifications
INSERT INTO notifications (user_id, type, title, message, is_read) VALUES
('00000000-0000-0000-0000-000000000002', 'like', 'New Like', 'Emma Wilson liked your post', false),
('00000000-0000-0000-0000-000000000002', 'comment', 'New Comment', 'Alex Rodriguez commented on your post', false),
('00000000-0000-0000-0000-000000000003', 'follow', 'New Follower', 'Emma Wilson started following you', false),
('00000000-0000-0000-0000-000000000004', 'like', 'New Like', 'Sarah Johnson liked your post', true);

-- Insert sample messages
INSERT INTO messages (sender_id, recipient_id, content, is_read) VALUES
('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002', 'Hi! I love your content. Do you offer any mentoring sessions?', false),
('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000004', 'Thank you! Yes, I do offer 1-on-1 sessions. Let me send you the details.', true),
('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000003', 'Great review on the MacBook! When will you review the new iPhone?', false);

-- Update follower counts
UPDATE profiles SET followers_count = (
    SELECT COUNT(*) FROM follows WHERE following_id = profiles.user_id
);

-- Update following counts
UPDATE profiles SET following_count = (
    SELECT COUNT(*) FROM follows WHERE follower_id = profiles.user_id
);

-- Update posts counts
UPDATE profiles SET posts_count = (
    SELECT COUNT(*) FROM posts WHERE user_id = profiles.user_id
);
