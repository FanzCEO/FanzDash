-- Migration: Analytics, OAuth, Access Control, Workflows & Scheduling
-- Description: Creates all tables for the new integrated features
-- Author: Claude Code
-- Date: 2025-11-06

-- ============================================================================
-- ANALYTICS CONFIGURATION
-- ============================================================================

CREATE TABLE IF NOT EXISTS analytics_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_id VARCHAR(255) NOT NULL,
  tenant_id VARCHAR(255) NOT NULL,

  -- GA4 Configuration
  ga4_measurement_id VARCHAR(255),
  ga4_api_secret TEXT,
  ga4_enabled BOOLEAN DEFAULT false,

  -- GTM Configuration
  gtm_container_id VARCHAR(255),
  gtm_enabled BOOLEAN DEFAULT false,

  -- Social Pixels
  facebook_pixel_id VARCHAR(255),
  facebook_access_token TEXT,
  tiktok_pixel_id VARCHAR(255),
  tiktok_access_token TEXT,
  twitter_pixel_id VARCHAR(255),
  twitter_access_token TEXT,
  reddit_pixel_id VARCHAR(255),
  reddit_access_token TEXT,
  instagram_pixel_id VARCHAR(255),
  instagram_access_token TEXT,
  patreon_pixel_id VARCHAR(255),
  patreon_access_token TEXT,

  -- Configuration
  tracking_enabled BOOLEAN DEFAULT true,
  debug_mode BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Indexes
  UNIQUE(platform_id, tenant_id)
);

CREATE INDEX idx_analytics_configs_platform ON analytics_configurations(platform_id);
CREATE INDEX idx_analytics_configs_tenant ON analytics_configurations(tenant_id);

-- ============================================================================
-- ANALYTICS EVENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_id VARCHAR(255) NOT NULL,
  tenant_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255),
  session_id VARCHAR(255) NOT NULL,

  -- Event Data
  event_name VARCHAR(255) NOT NULL,
  event_data JSONB,

  -- UTM Parameters
  utm_source VARCHAR(255),
  utm_medium VARCHAR(255),
  utm_campaign VARCHAR(255),
  utm_term VARCHAR(255),
  utm_content VARCHAR(255),

  -- Device & Location
  user_agent TEXT,
  ip_address VARCHAR(45),
  country VARCHAR(2),

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Indexes
  INDEX idx_events_platform (platform_id),
  INDEX idx_events_tenant (tenant_id),
  INDEX idx_events_user (user_id),
  INDEX idx_events_session (session_id),
  INDEX idx_events_name (event_name),
  INDEX idx_events_created (created_at)
);

-- ============================================================================
-- SOCIAL OAUTH CONNECTIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS social_oauth_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  tenant_id VARCHAR(255) NOT NULL,

  -- OAuth Provider
  provider VARCHAR(50) NOT NULL,
  provider_user_id VARCHAR(255),

  -- Tokens
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMP,

  -- Profile Data
  profile_data JSONB,

  -- Status
  is_active BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMP,

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Unique constraint
  UNIQUE(user_id, provider, tenant_id)
);

CREATE INDEX idx_oauth_user ON social_oauth_connections(user_id);
CREATE INDEX idx_oauth_provider ON social_oauth_connections(provider);
CREATE INDEX idx_oauth_tenant ON social_oauth_connections(tenant_id);

-- ============================================================================
-- PROFILE URL SPOTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS profile_url_spots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  tenant_id VARCHAR(255) NOT NULL,
  platform_id VARCHAR(255) NOT NULL,

  -- URL Data
  url TEXT NOT NULL,
  title VARCHAR(255),
  description TEXT,

  -- Display
  display_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,

  -- Analytics
  click_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_profile_urls_user ON profile_url_spots(user_id);
CREATE INDEX idx_profile_urls_platform ON profile_url_spots(platform_id);

-- ============================================================================
-- DELEGATED ACCESS PERMISSIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS delegated_access_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Grantor & Grantee
  grantor_id VARCHAR(255) NOT NULL,
  grantee_id VARCHAR(255) NOT NULL,
  platform_id VARCHAR(255) NOT NULL,
  tenant_id VARCHAR(255) NOT NULL,

  -- Access Type
  access_type VARCHAR(50) NOT NULL, -- admin, moderator, creator_delegate

  -- Permissions Object
  permissions JSONB NOT NULL,

  -- Restrictions
  ip_whitelist TEXT[],
  time_restrictions JSONB,
  custom_rules JSONB,

  -- Status
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP,

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_used_at TIMESTAMP,

  -- Unique constraint
  UNIQUE(grantee_id, platform_id, grantor_id)
);

CREATE INDEX idx_delegated_access_grantee ON delegated_access_permissions(grantee_id);
CREATE INDEX idx_delegated_access_platform ON delegated_access_permissions(platform_id);
CREATE INDEX idx_delegated_access_active ON delegated_access_permissions(is_active);

-- ============================================================================
-- DELEGATED ACCESS AUDIT LOG
-- ============================================================================

CREATE TABLE IF NOT EXISTS delegated_access_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  permission_id UUID REFERENCES delegated_access_permissions(id),

  -- Action Details
  grantee_id VARCHAR(255) NOT NULL,
  action VARCHAR(255) NOT NULL,
  resource VARCHAR(255),

  -- Request Details
  ip_address VARCHAR(45),
  user_agent TEXT,

  -- Result
  success BOOLEAN DEFAULT true,
  error_message TEXT,

  -- Timestamp
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_permission ON delegated_access_audit_log(permission_id);
CREATE INDEX idx_audit_grantee ON delegated_access_audit_log(grantee_id);
CREATE INDEX idx_audit_created ON delegated_access_audit_log(created_at);

-- ============================================================================
-- WORKFLOW DEFINITIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS workflow_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  platform_id VARCHAR(255) NOT NULL,
  tenant_id VARCHAR(255) NOT NULL,

  -- Workflow Info
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),

  -- Workflow Graph
  node_data JSONB NOT NULL,
  edge_data JSONB NOT NULL,

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Stats
  execution_count INTEGER DEFAULT 0,
  last_execution_at TIMESTAMP,

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_workflows_user ON workflow_definitions(user_id);
CREATE INDEX idx_workflows_platform ON workflow_definitions(platform_id);
CREATE INDEX idx_workflows_active ON workflow_definitions(is_active);

-- ============================================================================
-- WORKFLOW EXECUTIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS workflow_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES workflow_definitions(id),

  -- Execution Details
  status VARCHAR(50) NOT NULL, -- pending, running, completed, failed
  trigger_type VARCHAR(100),
  context JSONB,

  -- Results
  result JSONB,
  error_message TEXT,

  -- Timing
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

CREATE INDEX idx_executions_workflow ON workflow_executions(workflow_id);
CREATE INDEX idx_executions_status ON workflow_executions(status);
CREATE INDEX idx_executions_started ON workflow_executions(started_at);

-- ============================================================================
-- SCHEDULED CONTENT
-- ============================================================================

CREATE TABLE IF NOT EXISTS scheduled_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  platform_id VARCHAR(255) NOT NULL,
  tenant_id VARCHAR(255) NOT NULL,

  -- Content Details
  title VARCHAR(255) NOT NULL,
  content_type VARCHAR(100) NOT NULL,
  content_data JSONB NOT NULL,

  -- Scheduling
  scheduled_for TIMESTAMP NOT NULL,
  timezone VARCHAR(100) DEFAULT 'UTC',
  recurring_pattern JSONB,

  -- External Calendar
  external_event_id VARCHAR(255),

  -- Status
  status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, published, cancelled, failed

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  published_at TIMESTAMP
);

CREATE INDEX idx_scheduled_user ON scheduled_content(user_id);
CREATE INDEX idx_scheduled_platform ON scheduled_content(platform_id);
CREATE INDEX idx_scheduled_for ON scheduled_content(scheduled_for);
CREATE INDEX idx_scheduled_status ON scheduled_content(status);

-- ============================================================================
-- EXTERNAL CALENDAR INTEGRATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS external_calendar_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  tenant_id VARCHAR(255) NOT NULL,

  -- Calendar Provider
  provider VARCHAR(50) NOT NULL, -- google, outlook, apple
  calendar_id VARCHAR(255),

  -- OAuth Tokens
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMP,

  -- Sync Settings
  sync_enabled BOOLEAN DEFAULT true,
  sync_direction VARCHAR(50) DEFAULT 'both', -- calendar_to_fanzdash, fanzdash_to_calendar, both

  -- Status
  last_sync_at TIMESTAMP,
  sync_error TEXT,

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Unique constraint
  UNIQUE(user_id, provider)
);

CREATE INDEX idx_calendar_user ON external_calendar_integrations(user_id);
CREATE INDEX idx_calendar_provider ON external_calendar_integrations(provider);
CREATE INDEX idx_calendar_sync_enabled ON external_calendar_integrations(sync_enabled);

-- ============================================================================
-- UPDATE TRIGGERS FOR updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables
CREATE TRIGGER update_analytics_configurations_updated_at BEFORE UPDATE ON analytics_configurations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_social_oauth_connections_updated_at BEFORE UPDATE ON social_oauth_connections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profile_url_spots_updated_at BEFORE UPDATE ON profile_url_spots FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_delegated_access_permissions_updated_at BEFORE UPDATE ON delegated_access_permissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workflow_definitions_updated_at BEFORE UPDATE ON workflow_definitions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_scheduled_content_updated_at BEFORE UPDATE ON scheduled_content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_external_calendar_integrations_updated_at BEFORE UPDATE ON external_calendar_integrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE analytics_configurations IS 'Stores GA4, GTM, and social pixel configuration per platform';
COMMENT ON TABLE analytics_events IS 'Tracks all analytics events with UTM parameters and device info';
COMMENT ON TABLE social_oauth_connections IS 'OAuth tokens and profile data for 7 social media providers';
COMMENT ON TABLE profile_url_spots IS 'Custom social/website URLs for creator profiles';
COMMENT ON TABLE delegated_access_permissions IS 'Granular access control with IP whitelisting and time restrictions';
COMMENT ON TABLE delegated_access_audit_log IS 'Audit trail for all delegated access actions';
COMMENT ON TABLE workflow_definitions IS 'Visual workflow automation with node graph data';
COMMENT ON TABLE workflow_executions IS 'Execution history and results for workflows';
COMMENT ON TABLE scheduled_content IS 'Content scheduling with recurring patterns';
COMMENT ON TABLE external_calendar_integrations IS 'Google/Outlook/Apple Calendar sync configuration';
