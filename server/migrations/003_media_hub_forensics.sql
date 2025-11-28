-- ============================================================================
-- Migration: FanzMediaHub & FanzForensic System
-- Description: Central media management with digital fingerprinting and DMCA
-- Author: Claude Code
-- Date: 2025-11-06
-- ============================================================================

-- ============================================================================
-- MEDIA ASSETS (Central Registry)
-- ============================================================================

CREATE TABLE IF NOT EXISTS media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_id VARCHAR(255) NOT NULL,
  tenant_id VARCHAR(255) NOT NULL,
  creator_id VARCHAR(255) NOT NULL,
  
  -- File Information
  original_filename VARCHAR(500) NOT NULL,
  file_hash SHA256 NOT NULL UNIQUE, -- SHA-256 hash of original file
  file_size BIGINT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  duration_seconds INTEGER, -- For video/audio
  
  -- Storage
  storage_provider VARCHAR(50) NOT NULL, -- s3, cloudflare, backblaze
  storage_path TEXT NOT NULL,
  storage_region VARCHAR(50),
  cdn_url TEXT,
  
  -- Processing Status
  processing_status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed
  processing_started_at TIMESTAMP,
  processing_completed_at TIMESTAMP,
  processing_error TEXT,
  
  -- Quality Variants (JSON array)
  quality_variants JSONB DEFAULT '[]'::jsonb,
  -- Example: [{"quality":"4k","url":"...","bitrate":8000}, {"quality":"1080p","url":"...","bitrate":4500}]
  
  -- Metadata
  width INTEGER,
  height INTEGER,
  bitrate INTEGER,
  codec VARCHAR(50),
  framerate DECIMAL(5,2),
  
  -- Forensic Tracking
  forensic_signature TEXT NOT NULL UNIQUE, -- Unique FanzForensic watermark ID
  has_invisible_watermark BOOLEAN DEFAULT true,
  has_visible_watermark BOOLEAN DEFAULT false,
  watermark_strength VARCHAR(20) DEFAULT 'medium', -- low, medium, high, maximum
  
  -- Access Control
  is_public BOOLEAN DEFAULT false,
  requires_subscription BOOLEAN DEFAULT true,
  access_tier VARCHAR(50), -- free, premium, elite
  
  -- Analytics
  view_count BIGINT DEFAULT 0,
  download_count BIGINT DEFAULT 0,
  last_accessed_at TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP, -- Soft delete
  
  -- Indexes
  INDEX idx_media_platform (platform_id),
  INDEX idx_media_creator (creator_id),
  INDEX idx_media_file_hash (file_hash),
  INDEX idx_media_forensic_sig (forensic_signature),
  INDEX idx_media_processing_status (processing_status),
  INDEX idx_media_created (created_at DESC)
);

-- ============================================================================
-- FORENSIC WATERMARKS (Digital Fingerprints)
-- ============================================================================

CREATE TABLE IF NOT EXISTS forensic_watermarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_asset_id UUID REFERENCES media_assets(id) ON DELETE CASCADE,
  
  -- Watermark Data
  watermark_id VARCHAR(255) NOT NULL UNIQUE, -- Short unique ID embedded in media
  watermark_type VARCHAR(50) NOT NULL, -- invisible_steganography, visible_overlay, audio_fingerprint
  embedding_method VARCHAR(100), -- lsb, dct, dwt, spread_spectrum
  
  -- Tracking Information
  creator_id VARCHAR(255) NOT NULL,
  viewer_id VARCHAR(255), -- Set when content is accessed by specific user
  session_id VARCHAR(255), -- Viewing session that accessed this variant
  ip_address VARCHAR(45),
  device_fingerprint TEXT,
  
  -- Watermark Payload (encrypted)
  payload JSONB, -- Contains creator ID, timestamp, platform, user ID if personalized
  
  -- Detection Metadata
  detection_confidence DECIMAL(5,2), -- 0-100% confidence in watermark detection
  is_valid BOOLEAN DEFAULT true,
  last_verified_at TIMESTAMP,
  
  -- Theft Protection
  is_stolen BOOLEAN DEFAULT false,
  stolen_detected_at TIMESTAMP,
  stolen_platform VARCHAR(255), -- Where stolen content was found
  stolen_url TEXT,
  dmca_case_id UUID,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_forensic_watermark_id (watermark_id),
  INDEX idx_forensic_media (media_asset_id),
  INDEX idx_forensic_creator (creator_id),
  INDEX idx_forensic_viewer (viewer_id),
  INDEX idx_forensic_stolen (is_stolen)
);

-- ============================================================================
-- TRANSCODING JOBS (Video Processing Pipeline)
-- ============================================================================

CREATE TABLE IF NOT EXISTS transcoding_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_asset_id UUID REFERENCES media_assets(id) ON DELETE CASCADE,
  
  -- Job Configuration
  source_url TEXT NOT NULL,
  output_format VARCHAR(20) NOT NULL, -- mp4, webm, hls, dash
  quality_preset VARCHAR(50) NOT NULL, -- 4k, 1080p, 720p, 480p, 360p, 240p
  target_bitrate INTEGER,
  target_codec VARCHAR(50), -- h264, h265, vp9, av1
  
  -- Processing
  status VARCHAR(50) DEFAULT 'queued', -- queued, processing, completed, failed
  progress_percentage INTEGER DEFAULT 0,
  worker_id VARCHAR(255),
  priority INTEGER DEFAULT 5, -- 1-10, higher = more priority
  
  -- Output
  output_url TEXT,
  output_size BIGINT,
  output_duration INTEGER,
  
  -- Performance Metrics
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  processing_time_seconds INTEGER,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  
  -- Watermarking
  apply_watermark BOOLEAN DEFAULT true,
  watermark_applied BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_transcoding_status (status),
  INDEX idx_transcoding_media (media_asset_id),
  INDEX idx_transcoding_priority (priority DESC, created_at ASC)
);

-- ============================================================================
-- DMCA TAKEDOWN CASES (Copyright Protection)
-- ============================================================================

CREATE TABLE IF NOT EXISTS dmca_takedown_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_number VARCHAR(50) NOT NULL UNIQUE,
  
  -- Associated Media
  media_asset_id UUID REFERENCES media_assets(id),
  forensic_watermark_id UUID REFERENCES forensic_watermarks(id),
  
  -- Infringement Details
  infringing_platform VARCHAR(255) NOT NULL, -- youtube, twitter, reddit, etc.
  infringing_url TEXT NOT NULL,
  infringing_user VARCHAR(255),
  discovered_at TIMESTAMP NOT NULL,
  discovery_method VARCHAR(100), -- automated_scan, user_report, manual_review
  
  -- Evidence
  forensic_signature_match TEXT, -- Watermark ID found in stolen content
  match_confidence DECIMAL(5,2), -- 0-100% confidence
  screenshot_urls TEXT[],
  video_evidence_url TEXT,
  hash_comparison TEXT,
  
  -- Copyright Owner
  copyright_holder_id VARCHAR(255) NOT NULL,
  copyright_holder_name VARCHAR(255),
  copyright_holder_email VARCHAR(255),
  
  -- Takedown Status
  status VARCHAR(50) DEFAULT 'pending', -- pending, submitted, acknowledged, removed, rejected, appealed
  takedown_notice_sent_at TIMESTAMP,
  platform_response_received_at TIMESTAMP,
  content_removed_at TIMESTAMP,
  
  -- Legal Documents
  dmca_notice_url TEXT,
  counter_notice_url TEXT,
  legal_response_url TEXT,
  
  -- Communication
  platform_case_id VARCHAR(255), -- External platform's case ID
  correspondence JSONB DEFAULT '[]'::jsonb, -- Array of messages
  
  -- Resolution
  resolved BOOLEAN DEFAULT false,
  resolution_type VARCHAR(100), -- removed, rejected, settled, withdrawn
  resolved_at TIMESTAMP,
  resolution_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_dmca_status (status),
  INDEX idx_dmca_platform (infringing_platform),
  INDEX idx_dmca_media (media_asset_id),
  INDEX idx_dmca_case_number (case_number),
  INDEX idx_dmca_created (created_at DESC)
);

-- ============================================================================
-- SCREEN CAPTURE VIOLATIONS (Protection System)
-- ============================================================================

CREATE TABLE IF NOT EXISTS screen_capture_violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User & Session
  user_id VARCHAR(255) NOT NULL,
  session_id VARCHAR(255) NOT NULL,
  platform_id VARCHAR(255) NOT NULL,
  
  -- Violation Details
  violation_type VARCHAR(50) NOT NULL, -- screenshot_attempt, screen_recording_detected, dev_tools_opened
  media_asset_id UUID REFERENCES media_assets(id),
  content_url TEXT,
  
  -- Detection
  detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  detection_method VARCHAR(100), -- browser_api, os_hook, behavior_analysis
  
  -- Device Information
  device_type VARCHAR(50), -- desktop, mobile, tablet
  operating_system VARCHAR(50),
  browser VARCHAR(50),
  device_fingerprint TEXT,
  ip_address VARCHAR(45),
  geolocation VARCHAR(100),
  
  -- Action Taken
  action_taken VARCHAR(100), -- screen_blanked, session_terminated, account_flagged, warning_shown
  warning_displayed BOOLEAN DEFAULT false,
  session_terminated BOOLEAN DEFAULT false,
  account_suspended BOOLEAN DEFAULT false,
  
  -- Evidence
  screenshot_prevented BOOLEAN DEFAULT true,
  blank_screen_served BOOLEAN DEFAULT false,
  violation_screenshot_url TEXT, -- Our screenshot of the attempt for evidence
  
  -- Repeat Offender Tracking
  is_repeat_offender BOOLEAN DEFAULT false,
  previous_violation_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_violations_user (user_id),
  INDEX idx_violations_session (session_id),
  INDEX idx_violations_type (violation_type),
  INDEX idx_violations_media (media_asset_id),
  INDEX idx_violations_detected (detected_at DESC)
);

-- ============================================================================
-- FANZMOBILE DEVICE REGISTRATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS mobile_device_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  
  -- Device Information
  device_id VARCHAR(255) NOT NULL UNIQUE,
  device_name VARCHAR(255),
  device_type VARCHAR(50), -- ios, android
  device_model VARCHAR(100),
  os_version VARCHAR(50),
  app_version VARCHAR(50),
  
  -- Push Notifications
  push_token TEXT,
  push_enabled BOOLEAN DEFAULT true,
  
  -- Security
  device_fingerprint TEXT NOT NULL UNIQUE,
  jailbroken_rooted BOOLEAN DEFAULT false,
  screen_capture_blocked BOOLEAN DEFAULT true,
  
  -- Monitoring Consent
  monitoring_consent_given BOOLEAN DEFAULT false,
  monitoring_consent_date TIMESTAMP,
  privacy_policy_version VARCHAR(20),
  tos_version VARCHAR(20),
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  last_active_at TIMESTAMP,
  last_ip_address VARCHAR(45),
  
  -- Violations
  violation_count INTEGER DEFAULT 0,
  last_violation_at TIMESTAMP,
  is_suspended BOOLEAN DEFAULT false,
  suspended_until TIMESTAMP,
  
  -- Timestamps
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_mobile_user (user_id),
  INDEX idx_mobile_device_id (device_id),
  INDEX idx_mobile_fingerprint (device_fingerprint),
  INDEX idx_mobile_active (is_active, last_active_at)
);

-- ============================================================================
-- CDN DISTRIBUTION LOGS (Performance Tracking)
-- ============================================================================

CREATE TABLE IF NOT EXISTS cdn_distribution_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_asset_id UUID REFERENCES media_assets(id),
  
  -- Request Details
  request_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255),
  session_id VARCHAR(255),
  
  -- Location
  edge_location VARCHAR(100), -- CDN edge server location
  client_country VARCHAR(2),
  client_region VARCHAR(100),
  client_city VARCHAR(100),
  
  -- Performance Metrics
  response_time_ms INTEGER,
  bytes_transferred BIGINT,
  quality_served VARCHAR(50), -- Which quality variant was served
  cache_hit BOOLEAN DEFAULT false,
  
  -- Network
  ip_address VARCHAR(45),
  user_agent TEXT,
  referer TEXT,
  
  -- Status
  http_status INTEGER,
  error_code VARCHAR(50),
  
  -- Timestamps
  requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_cdn_media (media_asset_id),
  INDEX idx_cdn_user (user_id),
  INDEX idx_cdn_location (edge_location),
  INDEX idx_cdn_requested (requested_at DESC)
);

-- ============================================================================
-- UPDATE TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_media_assets_updated_at BEFORE UPDATE ON media_assets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_forensic_watermarks_updated_at BEFORE UPDATE ON forensic_watermarks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transcoding_jobs_updated_at BEFORE UPDATE ON transcoding_jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dmca_cases_updated_at BEFORE UPDATE ON dmca_takedown_cases FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mobile_devices_updated_at BEFORE UPDATE ON mobile_device_registrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE media_assets IS 'Central registry of all media files with forensic tracking';
COMMENT ON TABLE forensic_watermarks IS 'Digital watermarks embedded in media for theft detection';
COMMENT ON TABLE transcoding_jobs IS 'Video processing pipeline with quality variants and watermarking';
COMMENT ON TABLE dmca_takedown_cases IS 'Copyright protection and DMCA takedown management';
COMMENT ON TABLE screen_capture_violations IS 'Tracking of screenshot/screen recording attempts';
COMMENT ON TABLE mobile_device_registrations IS 'FanzMobile device registry with monitoring consent';
COMMENT ON TABLE cdn_distribution_logs IS 'CDN performance and delivery tracking';

-- ============================================================================
-- SECURITY VIEWS
-- ============================================================================

CREATE OR REPLACE VIEW v_stolen_content_summary AS
SELECT 
  dc.id as case_id,
  dc.case_number,
  ma.original_filename,
  ma.creator_id,
  dc.infringing_platform,
  dc.infringing_url,
  dc.match_confidence,
  dc.status,
  dc.discovered_at,
  dc.content_removed_at
FROM dmca_takedown_cases dc
JOIN media_assets ma ON dc.media_asset_id = ma.id
WHERE dc.status != 'removed'
ORDER BY dc.discovered_at DESC;

COMMENT ON VIEW v_stolen_content_summary IS 'Active DMCA cases for stolen content dashboard';
