-- FANZ Unified Platform - Complete Supabase Database Schema
-- Generated: 2025-10-30
-- Purpose: Comprehensive database for all FANZ platforms

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE user_role AS ENUM ('user', 'creator', 'moderator', 'admin', 'executive', 'super_admin');
CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'expired', 'trial');
CREATE TYPE content_status AS ENUM ('draft', 'pending', 'published', 'archived', 'rejected', 'auto_blocked');
CREATE TYPE moderation_status AS ENUM ('pending', 'approved', 'rejected', 'escalated');
CREATE TYPE stream_status AS ENUM ('live', 'offline', 'suspended');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE payout_status AS ENUM ('pending', 'processing', 'completed', 'failed');

-- ============================================================================
-- CORE USER TABLES
-- ============================================================================

-- Main users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- Authentication
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  phone_number TEXT,
  phone_verified BOOLEAN DEFAULT FALSE,

  -- Profile
  display_name TEXT,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  cover_image_url TEXT,
  bio TEXT,
  location TEXT,
  website TEXT,
  date_of_birth DATE,

  -- Social Links
  twitter_handle TEXT,
  instagram_handle TEXT,
  facebook_handle TEXT,
  tiktok_handle TEXT,
  youtube_handle TEXT,

  -- User Type & Permissions
  role user_role DEFAULT 'user',
  is_creator BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  clearance_level INTEGER DEFAULT 1, -- 1-5 for admin hierarchy
  vault_access BOOLEAN DEFAULT FALSE,
  module_permissions JSONB DEFAULT '{}'::jsonb,

  -- FanzID / SSO
  fanz_id TEXT UNIQUE,
  fanz_id_enabled BOOLEAN DEFAULT FALSE,
  google_id TEXT,
  github_id TEXT,
  facebook_id TEXT,
  twitter_id TEXT,
  linkedin_id TEXT,
  saml_name_id TEXT,
  sso_provider TEXT,

  -- Security
  account_locked BOOLEAN DEFAULT FALSE,
  login_attempts INTEGER DEFAULT 0,
  last_login_at TIMESTAMPTZ,
  totp_secret TEXT,
  totp_enabled BOOLEAN DEFAULT FALSE,
  backup_codes JSONB,
  webauthn_enabled BOOLEAN DEFAULT FALSE,

  -- Metrics
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0,
  total_earnings DECIMAL(12, 2) DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Creator profiles (extended creator information)
CREATE TABLE public.creator_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,

  -- Subscription
  subscription_price DECIMAL(10, 2),
  subscription_enabled BOOLEAN DEFAULT FALSE,

  -- Content Preferences
  content_categories JSONB DEFAULT '[]'::jsonb,
  content_tags JSONB DEFAULT '[]'::jsonb,

  -- Creator Stats
  total_subscribers INTEGER DEFAULT 0,
  total_posts INTEGER DEFAULT 0,
  total_revenue DECIMAL(12, 2) DEFAULT 0,
  average_engagement_rate DECIMAL(5, 2) DEFAULT 0,

  -- Payout Info
  payout_method TEXT,
  payout_details JSONB,
  min_payout_threshold DECIMAL(10, 2) DEFAULT 50,

  -- Verification
  verification_status TEXT DEFAULT 'pending', -- verified, pending, declined
  verification_documents JSONB,
  verified_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- CONTENT & MEDIA TABLES
-- ============================================================================

-- Posts table
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,

  -- Content
  content TEXT,
  media_url TEXT,
  media_type TEXT, -- image, video, audio, text
  thumbnail_url TEXT,
  media_metadata JSONB, -- duration, dimensions, etc.

  -- Access Control
  is_locked BOOLEAN DEFAULT FALSE,
  price DECIMAL(10, 2),
  is_subscribers_only BOOLEAN DEFAULT FALSE,
  is_followers_only BOOLEAN DEFAULT FALSE,

  -- Moderation
  status content_status DEFAULT 'draft',
  moderation_status moderation_status DEFAULT 'pending',
  risk_score DECIMAL(3, 2),
  moderator_id UUID REFERENCES public.users(id),
  moderation_notes TEXT,

  -- Engagement
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  saves_count INTEGER DEFAULT 0,

  -- Metadata
  tags JSONB DEFAULT '[]'::jsonb,
  categories JSONB DEFAULT '[]'::jsonb,
  location JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
);

-- Comments table
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE, -- for nested comments

  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,

  -- Moderation
  is_flagged BOOLEAN DEFAULT FALSE,
  is_hidden BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Likes table
CREATE TABLE public.likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Media Library
CREATE TABLE public.media_library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,

  filename TEXT NOT NULL,
  original_filename TEXT,
  file_size BIGINT,
  mime_type TEXT,
  storage_path TEXT NOT NULL,
  public_url TEXT,

  -- Media Info
  media_type TEXT, -- image, video, audio, document
  duration INTEGER, -- for video/audio in seconds
  dimensions JSONB, -- width, height

  -- Organization
  folder_path TEXT,
  tags JSONB DEFAULT '[]'::jsonb,

  -- Processing
  is_processed BOOLEAN DEFAULT FALSE,
  processing_status TEXT,
  thumbnail_url TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SOCIAL FEATURES
-- ============================================================================

-- Follows table
CREATE TABLE public.follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  following_id UUID REFERENCES public.users(id) ON DELETE CASCADE,

  -- Notifications
  notify_on_post BOOLEAN DEFAULT TRUE,
  notify_on_live BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Subscriptions table
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscriber_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  creator_id UUID REFERENCES public.users(id) ON DELETE CASCADE,

  -- Subscription Details
  status subscription_status DEFAULT 'active',
  tier TEXT DEFAULT 'standard',
  price DECIMAL(10, 2) NOT NULL,

  -- Billing
  billing_cycle TEXT DEFAULT 'monthly', -- monthly, yearly
  next_billing_date DATE,
  stripe_subscription_id TEXT,

  -- Dates
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(subscriber_id, creator_id)
);

-- Messages table (DMs)
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES public.users(id) ON DELETE CASCADE,

  -- Content
  content TEXT,
  media_url TEXT,
  media_type TEXT,

  -- Status
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  is_deleted_by_sender BOOLEAN DEFAULT FALSE,
  is_deleted_by_recipient BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,

  -- Notification Details
  type TEXT NOT NULL, -- like, comment, follow, subscription, message, etc.
  title TEXT,
  message TEXT,

  -- Related Entity
  entity_type TEXT, -- post, user, comment, etc.
  entity_id UUID,

  -- Status
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,

  -- Metadata
  data JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- STREAMING TABLES
-- ============================================================================

-- Live Streams
CREATE TABLE public.live_streams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,

  -- Stream Details
  title TEXT NOT NULL,
  description TEXT,
  stream_key TEXT UNIQUE NOT NULL,
  rtmp_url TEXT,
  hls_url TEXT,

  -- Access
  is_subscribers_only BOOLEAN DEFAULT FALSE,
  ticket_price DECIMAL(10, 2),

  -- Status
  status stream_status DEFAULT 'offline',
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,

  -- Metrics
  viewers INTEGER DEFAULT 0,
  peak_viewers INTEGER DEFAULT 0,
  total_views INTEGER DEFAULT 0,
  duration_seconds INTEGER DEFAULT 0,

  -- Moderation
  risk_level TEXT DEFAULT 'low', -- low, medium, high
  last_risk_score DECIMAL(3, 2),
  auto_blur_enabled BOOLEAN DEFAULT FALSE,
  moderation_flags JSONB DEFAULT '[]'::jsonb,

  -- Settings
  chat_enabled BOOLEAN DEFAULT TRUE,
  recording_enabled BOOLEAN DEFAULT TRUE,
  recording_url TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stream Viewers (for analytics)
CREATE TABLE public.stream_viewers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stream_id UUID REFERENCES public.live_streams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,

  joined_at TIMESTAMPTZ DEFAULT NOW(),
  left_at TIMESTAMPTZ,
  watch_duration_seconds INTEGER DEFAULT 0
);

-- ============================================================================
-- PAYMENTS & EARNINGS
-- ============================================================================

-- Transactions
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Parties
  from_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  to_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,

  -- Transaction Details
  type TEXT NOT NULL, -- subscription, tip, content_purchase, payout
  amount DECIMAL(12, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  platform_fee DECIMAL(12, 2) DEFAULT 0,
  net_amount DECIMAL(12, 2),

  -- Payment Info
  payment_method TEXT, -- stripe, paypal, crypto
  payment_status payment_status DEFAULT 'pending',
  stripe_payment_intent_id TEXT,

  -- Related Entity
  entity_type TEXT, -- post, subscription, stream, tip
  entity_id UUID,

  -- Metadata
  description TEXT,
  metadata JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Creator Payouts
CREATE TABLE public.payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,

  -- Payout Details
  amount DECIMAL(12, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  method TEXT NOT NULL, -- stripe_transfer, paypal, bank_transfer
  status payout_status DEFAULT 'pending',

  -- Payment Info
  stripe_transfer_id TEXT,
  destination_account TEXT,

  -- Period
  period_start DATE,
  period_end DATE,

  -- Processing
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  failure_reason TEXT,

  -- Metadata
  transaction_ids JSONB, -- array of transaction IDs included
  metadata JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- MODERATION TABLES
-- ============================================================================

-- Moderation Results
CREATE TABLE public.moderation_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,

  -- Analysis
  model_type TEXT NOT NULL, -- nudenet, detoxify, pdq_hash, custom
  confidence DECIMAL(3, 2),
  detections JSONB, -- detailed detection results
  risk_score DECIMAL(3, 2),

  -- Hash-based detection
  pdq_hash TEXT,
  is_duplicate BOOLEAN DEFAULT FALSE,

  -- Decision
  auto_action TEXT, -- none, flag, block, escalate
  requires_review BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Moderation Settings
CREATE TABLE public.moderation_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Content Type
  content_type TEXT NOT NULL UNIQUE, -- image, video, text, stream

  -- Thresholds
  auto_block_threshold DECIMAL(3, 2) DEFAULT 0.90,
  review_threshold DECIMAL(3, 2) DEFAULT 0.75,
  auto_blur_threshold DECIMAL(3, 2) DEFAULT 0.80,

  -- Stream-specific
  frame_sample_rate INTEGER DEFAULT 4, -- frames per second to analyze

  -- Text moderation
  toxicity_threshold DECIMAL(3, 2) DEFAULT 0.80,

  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Appeal Requests
CREATE TABLE public.appeal_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,

  reason TEXT NOT NULL,
  status moderation_status DEFAULT 'pending',

  -- Review
  moderator_id UUID REFERENCES public.users(id),
  response TEXT,
  reviewed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Encrypted Vault (for illegal content evidence)
CREATE TABLE public.encrypted_vault (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,

  -- Encrypted Data
  encrypted_data TEXT NOT NULL,
  encryption_key TEXT NOT NULL, -- RSA encrypted

  -- Classification
  vault_reason TEXT NOT NULL, -- illegal_content, csam, terrorism, evidence
  severity TEXT NOT NULL, -- low, medium, high, critical

  -- Access Control
  executive_access BOOLEAN DEFAULT TRUE,
  clearance_required INTEGER DEFAULT 5,
  access_log JSONB DEFAULT '[]'::jsonb,

  -- Metadata
  original_filename TEXT,
  content_hash TEXT,

  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ADMIN & AUDIT LOGS
-- ============================================================================

-- Admin Action Logs
CREATE TABLE public.admin_action_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES public.users(id) ON DELETE CASCADE,

  -- Action Details
  action TEXT NOT NULL, -- approve, reject, escalate, vault, ban, etc.
  target_type TEXT NOT NULL, -- post, user, comment, stream, appeal
  target_id UUID NOT NULL,

  -- Changes
  previous_status TEXT,
  new_status TEXT,
  reason TEXT,

  -- Metadata
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin Session Logs
CREATE TABLE public.admin_session_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES public.users(id) ON DELETE CASCADE,

  session_type TEXT NOT NULL, -- login, logout, timeout, forced_logout
  ip_address INET NOT NULL,
  user_agent TEXT,
  location JSONB, -- geolocation

  session_start TIMESTAMPTZ,
  session_end TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Report Logs (user reports)
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID REFERENCES public.users(id) ON DELETE SET NULL,

  -- Reported Entity
  entity_type TEXT NOT NULL, -- post, user, comment, stream, message
  entity_id UUID NOT NULL,
  reported_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,

  -- Report Details
  reason TEXT NOT NULL,
  category TEXT, -- spam, harassment, violence, illegal, etc.
  description TEXT,

  -- Status
  status moderation_status DEFAULT 'pending',
  moderator_id UUID REFERENCES public.users(id),
  moderator_notes TEXT,
  action_taken TEXT,

  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ANALYTICS TABLES
-- ============================================================================

-- User Analytics
CREATE TABLE public.user_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,

  date DATE NOT NULL,

  -- Engagement
  posts_created INTEGER DEFAULT 0,
  likes_given INTEGER DEFAULT 0,
  comments_made INTEGER DEFAULT 0,
  shares_made INTEGER DEFAULT 0,

  -- Consumption
  posts_viewed INTEGER DEFAULT 0,
  streams_watched INTEGER DEFAULT 0,
  watch_time_seconds INTEGER DEFAULT 0,

  -- Social
  new_followers INTEGER DEFAULT 0,
  new_following INTEGER DEFAULT 0,
  messages_sent INTEGER DEFAULT 0,

  -- Earnings (for creators)
  revenue_earned DECIMAL(12, 2) DEFAULT 0,
  new_subscribers INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Platform Analytics
CREATE TABLE public.platform_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  date DATE NOT NULL UNIQUE,

  -- User Metrics
  total_users INTEGER DEFAULT 0,
  new_users INTEGER DEFAULT 0,
  active_users INTEGER DEFAULT 0,
  deleted_users INTEGER DEFAULT 0,

  -- Content Metrics
  total_posts INTEGER DEFAULT 0,
  new_posts INTEGER DEFAULT 0,
  deleted_posts INTEGER DEFAULT 0,
  flagged_posts INTEGER DEFAULT 0,

  -- Streaming Metrics
  total_streams INTEGER DEFAULT 0,
  live_streams INTEGER DEFAULT 0,
  total_viewers INTEGER DEFAULT 0,
  total_watch_time_hours DECIMAL(12, 2) DEFAULT 0,

  -- Revenue Metrics
  total_revenue DECIMAL(15, 2) DEFAULT 0,
  platform_revenue DECIMAL(15, 2) DEFAULT 0,
  creator_revenue DECIMAL(15, 2) DEFAULT 0,

  -- Moderation Metrics
  content_moderated INTEGER DEFAULT 0,
  auto_blocked INTEGER DEFAULT 0,
  manual_reviewed INTEGER DEFAULT 0,
  appeals_processed INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Users
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_username ON public.users(username);
CREATE INDEX idx_users_fanz_id ON public.users(fanz_id);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_created_at ON public.users(created_at DESC);

-- Posts
CREATE INDEX idx_posts_user_id ON public.posts(user_id);
CREATE INDEX idx_posts_status ON public.posts(status);
CREATE INDEX idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX idx_posts_moderation_status ON public.posts(moderation_status);

-- Comments
CREATE INDEX idx_comments_post_id ON public.comments(post_id);
CREATE INDEX idx_comments_user_id ON public.comments(user_id);
CREATE INDEX idx_comments_created_at ON public.comments(created_at DESC);

-- Social
CREATE INDEX idx_follows_follower_id ON public.follows(follower_id);
CREATE INDEX idx_follows_following_id ON public.follows(following_id);
CREATE INDEX idx_subscriptions_subscriber_id ON public.subscriptions(subscriber_id);
CREATE INDEX idx_subscriptions_creator_id ON public.subscriptions(creator_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);

-- Streaming
CREATE INDEX idx_streams_user_id ON public.live_streams(user_id);
CREATE INDEX idx_streams_status ON public.live_streams(status);
CREATE INDEX idx_streams_created_at ON public.live_streams(created_at DESC);

-- Transactions
CREATE INDEX idx_transactions_from_user ON public.transactions(from_user_id);
CREATE INDEX idx_transactions_to_user ON public.transactions(to_user_id);
CREATE INDEX idx_transactions_type ON public.transactions(type);
CREATE INDEX idx_transactions_status ON public.transactions(payment_status);
CREATE INDEX idx_transactions_created_at ON public.transactions(created_at DESC);

-- Notifications
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

-- Moderation
CREATE INDEX idx_moderation_results_content_id ON public.moderation_results(content_id);
CREATE INDEX idx_moderation_results_pdq_hash ON public.moderation_results(pdq_hash);
CREATE INDEX idx_reports_entity_id ON public.reports(entity_id);
CREATE INDEX idx_reports_status ON public.reports(status);

-- Analytics
CREATE INDEX idx_user_analytics_user_date ON public.user_analytics(user_id, date DESC);
CREATE INDEX idx_platform_analytics_date ON public.platform_analytics(date DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

-- Users: can view own profile, others view public info only
CREATE POLICY users_select_own ON public.users
  FOR SELECT USING (auth.uid() = id OR TRUE); -- public profiles

CREATE POLICY users_update_own ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Posts: public or based on subscription
CREATE POLICY posts_select_public ON public.posts
  FOR SELECT USING (
    status = 'published' AND
    (NOT is_locked OR
     user_id = auth.uid() OR
     EXISTS (SELECT 1 FROM public.subscriptions WHERE subscriber_id = auth.uid() AND creator_id = posts.user_id AND status = 'active'))
  );

CREATE POLICY posts_insert_own ON public.posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY posts_update_own ON public.posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY posts_delete_own ON public.posts
  FOR DELETE USING (auth.uid() = user_id);

-- Messages: only sender and recipient
CREATE POLICY messages_select_own ON public.messages
  FOR SELECT USING (auth.uid() IN (sender_id, recipient_id));

CREATE POLICY messages_insert_own ON public.messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Notifications: only own notifications
CREATE POLICY notifications_select_own ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY notifications_update_own ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Updated timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_creator_profiles_updated_at BEFORE UPDATE ON public.creator_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Increment/decrement counters
CREATE OR REPLACE FUNCTION increment_post_likes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_post_likes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER likes_insert AFTER INSERT ON public.likes
  FOR EACH ROW EXECUTE FUNCTION increment_post_likes();

CREATE TRIGGER likes_delete AFTER DELETE ON public.likes
  FOR EACH ROW EXECUTE FUNCTION decrement_post_likes();

-- Similar for comments, followers, etc.
CREATE OR REPLACE FUNCTION increment_post_comments()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_post_comments()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER comments_insert AFTER INSERT ON public.comments
  FOR EACH ROW EXECUTE FUNCTION increment_post_comments();

CREATE TRIGGER comments_delete AFTER DELETE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION decrement_post_comments();

-- ============================================================================
-- INITIAL DATA / SEED
-- ============================================================================

-- Insert default moderation settings
INSERT INTO public.moderation_settings (content_type, auto_block_threshold, review_threshold, auto_blur_threshold) VALUES
  ('image', 0.90, 0.75, 0.80),
  ('video', 0.90, 0.75, 0.80),
  ('text', 0.85, 0.70, 0.75),
  ('stream', 0.90, 0.75, 0.80);

-- Insert initial platform analytics row
INSERT INTO public.platform_analytics (date) VALUES (CURRENT_DATE);

-- ============================================================================
-- GRANTS
-- ============================================================================

-- Grant authenticated users access to tables
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant anon users limited read access
GRANT SELECT ON public.users TO anon;
GRANT SELECT ON public.posts TO anon;
GRANT SELECT ON public.comments TO anon;

-- ============================================================================
-- COMPLETE
-- ============================================================================

-- Schema created successfully
