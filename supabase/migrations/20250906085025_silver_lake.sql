/*
  # Add Sample Data for Development

  This migration adds sample data for testing the Flavours platform:
  - Feature flags for development
  - Sample data will be added through the application
*/

-- Insert sample feature flags
INSERT INTO feature_flags (name, description, is_enabled, rollout_percentage) VALUES
  ('live_streaming', 'Enable live streaming feature for creators', false, 0),
  ('advanced_analytics', 'Advanced analytics dashboard for creators', true, 100),
  ('tip_campaigns', 'Allow creators to run tip campaigns', false, 25),
  ('multi_tier_subscriptions', 'Support for multiple subscription tiers', true, 50),
  ('content_scheduling', 'Allow creators to schedule posts', true, 100),
  ('fan_clubs', 'Exclusive fan club features', false, 0),
  ('user_registration', 'Allow new user registration', true, 100),
  ('creator_registration', 'Allow creator registration', true, 100),
  ('payment_processing', 'Enable payment processing', true, 100),
  ('content_upload', 'Allow content uploads', true, 100),
  ('messaging', 'Enable direct messaging', true, 100),
  ('notifications', 'Enable push notifications', true, 100),
  ('analytics', 'Enable analytics tracking', true, 100),
  ('moderation', 'Enable content moderation', true, 100);

-- Sample data will be added through the application when users register