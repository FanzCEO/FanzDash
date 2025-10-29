-- FansLab 2.0 - Admin Panel Database Schema
-- Create tables for enterprise admin functionality

-- ===== AUDIT LOGS TABLE =====
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    actor_id VARCHAR(255) NOT NULL,  -- 'admin', 'AI_SYSTEM', or user_id
    action VARCHAR(100) NOT NULL,    -- 'content_approved', 'vault_accessed', etc.
    target_type VARCHAR(50),         -- 'post', 'user', 'stream', 'vault', etc.
    target_id VARCHAR(255),          -- ID of the target entity
    metadata JSONB DEFAULT '{}',     -- Additional context data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- ===== ILLEGAL CONTENT VAULT TABLE =====
CREATE TABLE IF NOT EXISTS vault_content (
    id SERIAL PRIMARY KEY,
    original_post_id VARCHAR(255) NOT NULL,  -- Reference to original post
    uploader_id VARCHAR(255) NOT NULL,       -- User who uploaded the content
    reason TEXT NOT NULL,                    -- Reason for vaulting (e.g., "CSAM detected")
    file_url TEXT,                          -- Secure URL to evidence
    evidence_hash VARCHAR(128),             -- Content hash for integrity
    admin_id VARCHAR(255),                  -- Admin who vaulted it
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE     -- Soft delete for legal compliance
);

CREATE INDEX IF NOT EXISTS idx_vault_content_uploader_id ON vault_content(uploader_id);
CREATE INDEX IF NOT EXISTS idx_vault_content_created_at ON vault_content(created_at);

-- ===== MODERATION QUEUE TABLE =====
CREATE TABLE IF NOT EXISTS moderation_queue (
    id SERIAL PRIMARY KEY,
    post_id VARCHAR(255) NOT NULL,          -- Reference to post being moderated
    uploader_id VARCHAR(255) NOT NULL,      -- User who uploaded content
    content_text TEXT,                      -- Text content (if any)
    content_url TEXT,                       -- URL to media content
    description TEXT,                       -- Content description/caption
    ai_score INTEGER DEFAULT 0,             -- AI risk score (0-100)
    ai_flagged BOOLEAN DEFAULT FALSE,       -- Whether AI flagged this content
    user_reported BOOLEAN DEFAULT FALSE,    -- Whether users reported this content
    status VARCHAR(20) DEFAULT 'pending',   -- 'pending', 'approved', 'rejected'
    reviewer_id VARCHAR(255),               -- Admin who reviewed it
    notes TEXT,                            -- Reviewer notes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_moderation_queue_status ON moderation_queue(status);
CREATE INDEX IF NOT EXISTS idx_moderation_queue_ai_flagged ON moderation_queue(ai_flagged);
CREATE INDEX IF NOT EXISTS idx_moderation_queue_created_at ON moderation_queue(created_at);

-- ===== USER WARNINGS TABLE =====
CREATE TABLE IF NOT EXISTS user_warnings (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,          -- User being warned
    reason TEXT NOT NULL,                   -- Reason for warning
    severity INTEGER DEFAULT 1,             -- 1=Warning, 2=Strike, 3=Final Warning
    admin_id VARCHAR(255) NOT NULL,         -- Admin who issued warning
    post_id VARCHAR(255),                   -- Related post (if applicable)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    acknowledged_at TIMESTAMP WITH TIME ZONE -- When user acknowledged warning
);

CREATE INDEX IF NOT EXISTS idx_user_warnings_user_id ON user_warnings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_warnings_severity ON user_warnings(severity);
CREATE INDEX IF NOT EXISTS idx_user_warnings_created_at ON user_warnings(created_at);

-- ===== LIVE STREAMS TABLE =====
CREATE TABLE IF NOT EXISTS live_streams (
    id SERIAL PRIMARY KEY,
    creator_id VARCHAR(255) NOT NULL,       -- Stream creator
    title VARCHAR(255) NOT NULL,            -- Stream title
    description TEXT,                       -- Stream description
    is_live BOOLEAN DEFAULT FALSE,          -- Currently streaming
    is_private BOOLEAN DEFAULT FALSE,       -- Private stream
    viewer_count INTEGER DEFAULT 0,         -- Current viewer count
    audio_muted BOOLEAN DEFAULT FALSE,      -- Admin muted audio
    muted_by VARCHAR(255),                  -- Admin who muted
    muted_at TIMESTAMP WITH TIME ZONE,     -- When muted
    ended_by VARCHAR(255),                  -- Admin who ended stream
    scheduled_start TIMESTAMP WITH TIME ZONE, -- Scheduled start time
    ended_at TIMESTAMP WITH TIME ZONE,     -- When stream ended
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_live_streams_creator_id ON live_streams(creator_id);
CREATE INDEX IF NOT EXISTS idx_live_streams_is_live ON live_streams(is_live);
CREATE INDEX IF NOT EXISTS idx_live_streams_created_at ON live_streams(created_at);

-- ===== PLATFORM THEMES TABLE =====
CREATE TABLE IF NOT EXISTS platform_themes (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,         -- Tenant identifier (e.g., 'boyfanz', 'girlfanz')
    primary_color VARCHAR(7) DEFAULT '#007bff',    -- Primary brand color
    secondary_color VARCHAR(7) DEFAULT '#6c757d',  -- Secondary color  
    accent_color VARCHAR(7) DEFAULT '#ffc107',     -- Accent color
    logo_url TEXT,                          -- Logo URL
    favicon_url TEXT,                       -- Favicon URL
    custom_css TEXT,                        -- Custom CSS
    font_family VARCHAR(50) DEFAULT 'inter', -- Font family
    dark_mode_enabled BOOLEAN DEFAULT FALSE, -- Dark mode support
    updated_by VARCHAR(255),                -- Admin who updated
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_platform_themes_tenant_id ON platform_themes(tenant_id);

-- ===== AI MODERATION LOGS TABLE =====
CREATE TABLE IF NOT EXISTS ai_moderation_logs (
    id SERIAL PRIMARY KEY,
    post_id VARCHAR(255) NOT NULL,          -- Post that was moderated
    ai_model VARCHAR(50) NOT NULL,          -- AI model used (e.g., 'openai-gpt-4')
    confidence_score DECIMAL(5,4),          -- Confidence score (0.0000-1.0000)
    detected_categories JSONB DEFAULT '[]', -- Categories detected by AI
    action_taken VARCHAR(50),               -- Action taken by AI
    human_review_required BOOLEAN DEFAULT FALSE, -- Whether human review is needed
    reviewed_by VARCHAR(255),               -- Admin who reviewed (if any)
    review_decision VARCHAR(20),            -- 'approved', 'rejected', 'escalated'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_moderation_logs_post_id ON ai_moderation_logs(post_id);
CREATE INDEX IF NOT EXISTS idx_ai_moderation_logs_human_review ON ai_moderation_logs(human_review_required);
CREATE INDEX IF NOT EXISTS idx_ai_moderation_logs_created_at ON ai_moderation_logs(created_at);

-- ===== USER STRIKES TABLE =====
CREATE TABLE IF NOT EXISTS user_strikes (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,          -- User receiving strike
    strike_type VARCHAR(50) NOT NULL,       -- Type of violation
    description TEXT NOT NULL,              -- Details of violation
    post_id VARCHAR(255),                   -- Related post (if applicable)
    admin_id VARCHAR(255) NOT NULL,         -- Admin who issued strike
    expires_at TIMESTAMP WITH TIME ZONE,   -- When strike expires (if applicable)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_strikes_user_id ON user_strikes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_strikes_created_at ON user_strikes(created_at);

-- ===== CONTENT REPORTS TABLE =====
CREATE TABLE IF NOT EXISTS content_reports (
    id SERIAL PRIMARY KEY,
    post_id VARCHAR(255) NOT NULL,          -- Reported post
    reporter_id VARCHAR(255) NOT NULL,      -- User who reported
    report_type VARCHAR(50) NOT NULL,       -- Type of report
    description TEXT,                       -- Report description
    status VARCHAR(20) DEFAULT 'pending',   -- 'pending', 'reviewed', 'resolved'
    admin_id VARCHAR(255),                  -- Admin who handled report
    resolution TEXT,                        -- How report was resolved
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_content_reports_post_id ON content_reports(post_id);
CREATE INDEX IF NOT EXISTS idx_content_reports_status ON content_reports(status);
CREATE INDEX IF NOT EXISTS idx_content_reports_created_at ON content_reports(created_at);

-- ===== INSERT SAMPLE DATA =====

-- Insert default audit log entry
INSERT INTO audit_logs (actor_id, action, target_type, target_id, metadata) 
VALUES ('AI_SYSTEM', 'schema_initialized', 'database', 'admin_schema', '{"tables_created": 10}')
ON CONFLICT DO NOTHING;

-- Insert default theme for main tenant
INSERT INTO platform_themes (tenant_id, primary_color, secondary_color, accent_color, font_family)
VALUES ('default', '#007bff', '#6c757d', '#ffc107', 'inter')
ON CONFLICT (tenant_id) DO NOTHING;

-- Insert sample moderation queue items (for testing)
INSERT INTO moderation_queue (post_id, uploader_id, content_text, ai_score, ai_flagged, status)
VALUES 
    ('post_001', 'user_123', 'Sample content for testing moderation', 25, true, 'pending'),
    ('post_002', 'user_456', 'Another test post', 85, true, 'pending')
ON CONFLICT DO NOTHING;

COMMIT;