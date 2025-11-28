-- ============================================================================
-- Seed Data: Analytics, OAuth, Workflows & Scheduling
-- ============================================================================
-- Description: Populates initial data for development and testing
-- Author: Claude Code
-- Date: 2025-11-06
-- ============================================================================

-- ============================================================================
-- ANALYTICS CONFIGURATIONS - Sample for Major Platforms
-- ============================================================================

INSERT INTO analytics_configurations (platform_id, tenant_id, ga4_measurement_id, ga4_enabled, gtm_container_id, gtm_enabled, tracking_enabled, debug_mode)
VALUES
  ('BoyFanz', 'fanz_main', 'G-BOYFANZ001', true, 'GTM-BOYFANZ', true, true, true),
  ('GirlFanz', 'fanz_main', 'G-GIRLFANZ001', true, 'GTM-GIRLFANZ', true, true, true),
  ('TransFanz', 'fanz_main', 'G-TRANSFANZ001', true, 'GTM-TRANSFANZ', true, true, true),
  ('BearFanz', 'fanz_main', 'G-BEARFANZ001', true, 'GTM-BEARFANZ', true, true, true),
  ('PupFanz', 'fanz_main', 'G-PUPFANZ001', true, 'GTM-PUPFANZ', true, true, true),
  ('CougarFanz', 'fanz_main', 'G-COUGARFANZ001', true, 'GTM-COUGARFANZ', true, true, true),
  ('FemmeFanz', 'fanz_main', 'G-FEMMEFANZ001', true, 'GTM-FEMMEFANZ', true, true, true),
  ('FanzUncut', 'fanz_main', 'G-FANZUNCUT001', true, 'GTM-FANZUNCUT', true, true, true),
  ('FanzDiscreet', 'fanz_main', 'G-FANZDISCREET001', true, 'GTM-FANZDISCREET', true, true, true),
  ('TabooFanz', 'fanz_main', 'G-TABOOFANZ001', true, 'GTM-TABOOFANZ', true, true, true),
  ('FanzClips', 'fanz_main', 'G-FANZCLIPS001', true, 'GTM-FANZCLIPS', true, true, true),
  ('FanzLanding', 'fanz_main', 'G-FANZLANDING001', true, 'GTM-FANZLANDING', true, true, true)
ON CONFLICT (platform_id, tenant_id) DO NOTHING;

-- ============================================================================
-- SAMPLE ANALYTICS EVENTS - For Testing Dashboard
-- ============================================================================

INSERT INTO analytics_events (platform_id, tenant_id, user_id, session_id, event_name, event_data, utm_source, utm_medium, utm_campaign, user_agent, ip_address, country, created_at)
VALUES
  ('BoyFanz', 'fanz_main', 'user_001', 'session_001', 'page_view', '{"page":"/profile","title":"Profile Page"}'::jsonb, 'google', 'cpc', 'spring_2025', 'Mozilla/5.0', '192.168.1.1', 'US', NOW() - INTERVAL '1 day'),
  ('BoyFanz', 'fanz_main', 'user_001', 'session_001', 'purchase', '{"amount":9.99,"currency":"USD","items":[{"name":"Premium Subscription"}]}'::jsonb, 'google', 'cpc', 'spring_2025', 'Mozilla/5.0', '192.168.1.1', 'US', NOW() - INTERVAL '1 day'),
  ('GirlFanz', 'fanz_main', 'user_002', 'session_002', 'page_view', '{"page":"/","title":"Home"}'::jsonb, 'facebook', 'social', 'awareness_2025', 'Chrome/120.0', '192.168.1.2', 'CA', NOW() - INTERVAL '2 hours'),
  ('TransFanz', 'fanz_main', 'user_003', 'session_003', 'sign_up', '{"method":"email"}'::jsonb, 'twitter', 'social', 'pride_month', 'Safari/17.0', '192.168.1.3', 'UK', NOW() - INTERVAL '1 hour'),
  ('BearFanz', 'fanz_main', 'user_004', 'session_004', 'content_view', '{"content_type":"video","content_id":"bear_video_123"}'::jsonb, 'direct', 'none', NULL, 'Firefox/120.0', '192.168.1.4', 'DE', NOW() - INTERVAL '30 minutes');

-- ============================================================================
-- SAMPLE PROFILE URL SPOTS
-- ============================================================================

INSERT INTO profile_url_spots (user_id, tenant_id, platform_id, url, title, description, display_order, is_visible, click_count)
VALUES
  ('user_001', 'fanz_main', 'BoyFanz', 'https://instagram.com/boystar', 'Instagram', 'Follow me on Instagram', 1, true, 342),
  ('user_001', 'fanz_main', 'BoyFanz', 'https://twitter.com/boystar', 'Twitter/X', 'Latest updates', 2, true, 156),
  ('user_001', 'fanz_main', 'BoyFanz', 'https://patreon.com/boystar', 'Patreon', 'Exclusive content', 3, true, 89),
  ('user_002', 'fanz_main', 'GirlFanz', 'https://tiktok.com/@girlstar', 'TikTok', 'Fun videos', 1, true, 567),
  ('user_002', 'fanz_main', 'GirlFanz', 'https://youtube.com/@girlstar', 'YouTube', 'Subscribe!', 2, true, 234);

-- ============================================================================
-- SAMPLE DELEGATED ACCESS PERMISSIONS
-- ============================================================================

INSERT INTO delegated_access_permissions (grantor_id, grantee_id, platform_id, tenant_id, access_type, permissions, ip_whitelist, is_active, expires_at)
VALUES
  ('creator_001', 'manager_001', 'BoyFanz', 'fanz_main', 'admin', 
   '{"content:*": true, "users:view": true, "analytics:*": true, "settings:*": true}'::jsonb, 
   ARRAY['192.168.1.100', '10.0.0.1'], 
   true, 
   NOW() + INTERVAL '365 days'),
   
  ('creator_002', 'moderator_001', 'GirlFanz', 'fanz_main', 'moderator',
   '{"content:view": true, "content:moderate": true, "users:view": true, "reports:handle": true}'::jsonb,
   NULL,
   true,
   NOW() + INTERVAL '180 days'),
   
  ('creator_003', 'assistant_001', 'TransFanz', 'fanz_main', 'creator_delegate',
   '{"content:view": true, "content:create": true, "content:schedule": true, "analytics:view": true}'::jsonb,
   ARRAY['192.168.50.1'],
   true,
   NOW() + INTERVAL '90 days');

-- ============================================================================
-- SAMPLE AUDIT LOG ENTRIES
-- ============================================================================

INSERT INTO delegated_access_audit_log (permission_id, grantee_id, action, resource, ip_address, user_agent, success, created_at)
SELECT 
  id,
  grantee_id,
  'content:moderate',
  'video_12345',
  '192.168.1.100',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  true,
  NOW() - INTERVAL '2 hours'
FROM delegated_access_permissions
WHERE grantee_id = 'manager_001'
LIMIT 1;

-- ============================================================================
-- SAMPLE WORKFLOW DEFINITIONS
-- ============================================================================

INSERT INTO workflow_definitions (user_id, platform_id, tenant_id, name, description, category, node_data, edge_data, is_active)
VALUES
  ('creator_001', 'BoyFanz', 'fanz_main', 'New Subscriber Welcome', 'Automatically welcome new subscribers', 'engagement',
   '[
     {"id":"1","type":"trigger","data":{"type":"event","event":"new_subscriber"}},
     {"id":"2","type":"action","data":{"type":"send_email","config":{"subject":"Welcome!","template":"welcome_email"}}},
     {"id":"3","type":"action","data":{"type":"post_social","config":{"platforms":["twitter"],"message":"Thanks for subscribing!"}}}
   ]'::jsonb,
   '[
     {"source":"1","target":"2"},
     {"source":"2","target":"3"}
   ]'::jsonb,
   true),
   
  ('creator_002', 'GirlFanz', 'fanz_main', 'Content Schedule to Twitter', 'Auto-post scheduled content to Twitter', 'social_media',
   '[
     {"id":"1","type":"trigger","data":{"type":"schedule","pattern":"daily","time":"09:00"}},
     {"id":"2","type":"condition","data":{"field":"has_content","operator":"equals","value":true}},
     {"id":"3","type":"action","data":{"type":"post_social","config":{"platforms":["twitter","tiktok"],"message":"New content available!"}}}
   ]'::jsonb,
   '[
     {"source":"1","target":"2"},
     {"source":"2","target":"3","condition":"true"}
   ]'::jsonb,
   true),
   
  ('creator_003', 'TransFanz', 'fanz_main', 'Birthday Email Campaign', 'Send birthday wishes to subscribers', 'marketing',
   '[
     {"id":"1","type":"trigger","data":{"type":"schedule","pattern":"daily","time":"08:00"}},
     {"id":"2","type":"condition","data":{"field":"birthday","operator":"equals","value":"today"}},
     {"id":"3","type":"action","data":{"type":"send_email","config":{"subject":"Happy Birthday!","template":"birthday_email"}}},
     {"id":"4","type":"action","data":{"type":"create_content","config":{"type":"special_offer","discount":"20%"}}}
   ]'::jsonb,
   '[
     {"source":"1","target":"2"},
     {"source":"2","target":"3","condition":"true"},
     {"source":"3","target":"4"}
   ]'::jsonb,
   true);

-- ============================================================================
-- SAMPLE WORKFLOW EXECUTIONS
-- ============================================================================

INSERT INTO workflow_executions (workflow_id, status, trigger_type, context, result, started_at, completed_at)
SELECT 
  id,
  'completed',
  'event:new_subscriber',
  '{"subscriber_id":"user_005","subscription_tier":"premium"}'::jsonb,
  '{"email_sent":true,"social_posted":true}'::jsonb,
  NOW() - INTERVAL '5 hours',
  NOW() - INTERVAL '5 hours' + INTERVAL '30 seconds'
FROM workflow_definitions
WHERE name = 'New Subscriber Welcome'
LIMIT 1;

-- ============================================================================
-- SAMPLE SCHEDULED CONTENT
-- ============================================================================

INSERT INTO scheduled_content (user_id, platform_id, tenant_id, title, content_type, content_data, scheduled_for, timezone, recurring_pattern, status)
VALUES
  ('creator_001', 'BoyFanz', 'fanz_main', 'Morning Motivation Post', 'social_post',
   '{"message":"Good morning everyone! 💪","image_url":"https://example.com/morning.jpg","hashtags":["motivation","fitness"]}'::jsonb,
   NOW() + INTERVAL '1 day' + TIME '09:00',
   'America/New_York',
   '{"frequency":"daily","days":["monday","tuesday","wednesday","thursday","friday"]}'::jsonb,
   'scheduled'),
   
  ('creator_002', 'GirlFanz', 'fanz_main', 'Weekend Special Announcement', 'announcement',
   '{"title":"Weekend Sale!","message":"50% off all content this weekend only!","cta":"Subscribe Now"}'::jsonb,
   NOW() + INTERVAL '2 days' + TIME '18:00',
   'UTC',
   NULL,
   'scheduled'),
   
  ('creator_003', 'TransFanz', 'fanz_main', 'Weekly Q&A Session', 'live_stream',
   '{"title":"Ask Me Anything","description":"Join me for a live Q&A session","duration_minutes":60}'::jsonb,
   NOW() + INTERVAL '7 days' + TIME '20:00',
   'America/Los_Angeles',
   '{"frequency":"weekly","day":"friday","time":"20:00"}'::jsonb,
   'scheduled');

-- ============================================================================
-- SAMPLE EXTERNAL CALENDAR INTEGRATIONS
-- ============================================================================

INSERT INTO external_calendar_integrations (user_id, tenant_id, provider, calendar_id, access_token, refresh_token, token_expires_at, sync_enabled, sync_direction, last_sync_at)
VALUES
  ('creator_001', 'fanz_main', 'google', 'primary', 'ya29.sample_access_token_001', 'refresh_token_001', NOW() + INTERVAL '3600 seconds', true, 'both', NOW() - INTERVAL '15 minutes'),
  ('creator_002', 'fanz_main', 'outlook', 'AAMkAGI2T...', 'EwBwA8l6BA...', 'M.R3_BAY...', NOW() + INTERVAL '3600 seconds', true, 'fanzdash_to_calendar', NOW() - INTERVAL '30 minutes'),
  ('creator_003', 'fanz_main', 'google', 'primary', 'ya29.sample_access_token_003', 'refresh_token_003', NOW() + INTERVAL '3600 seconds', true, 'calendar_to_fanzdash', NOW() - INTERVAL '10 minutes');

-- ============================================================================
-- UPDATE WORKFLOW STATISTICS
-- ============================================================================

UPDATE workflow_definitions
SET execution_count = 15, last_execution_at = NOW() - INTERVAL '5 hours'
WHERE name = 'New Subscriber Welcome';

UPDATE workflow_definitions
SET execution_count = 42, last_execution_at = NOW() - INTERVAL '1 day'
WHERE name = 'Content Schedule to Twitter';

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Show seeded data counts
DO $$
BEGIN
    RAISE NOTICE 'Seed Data Summary:';
    RAISE NOTICE '==================';
    RAISE NOTICE 'Analytics Configurations: %', (SELECT COUNT(*) FROM analytics_configurations);
    RAISE NOTICE 'Analytics Events: %', (SELECT COUNT(*) FROM analytics_events);
    RAISE NOTICE 'Profile URL Spots: %', (SELECT COUNT(*) FROM profile_url_spots);
    RAISE NOTICE 'Delegated Access Permissions: %', (SELECT COUNT(*) FROM delegated_access_permissions);
    RAISE NOTICE 'Audit Log Entries: %', (SELECT COUNT(*) FROM delegated_access_audit_log);
    RAISE NOTICE 'Workflow Definitions: %', (SELECT COUNT(*) FROM workflow_definitions);
    RAISE NOTICE 'Workflow Executions: %', (SELECT COUNT(*) FROM workflow_executions);
    RAISE NOTICE 'Scheduled Content: %', (SELECT COUNT(*) FROM scheduled_content);
    RAISE NOTICE 'Calendar Integrations: %', (SELECT COUNT(*) FROM external_calendar_integrations);
    RAISE NOTICE '==================';
END $$;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE analytics_configurations IS 'Seeded with 12 major FANZ platforms with sample GA4 and GTM configurations';
COMMENT ON TABLE analytics_events IS 'Seeded with 5 sample events across different platforms for testing dashboards';
COMMENT ON TABLE workflow_definitions IS 'Seeded with 3 example workflows: welcome automation, social posting, and birthday campaign';
COMMENT ON TABLE scheduled_content IS 'Seeded with 3 scheduled posts including recurring patterns for testing';

-- ============================================================================
-- END OF SEED DATA
-- ============================================================================
