# FanzDash - Advanced Analytics, OAuth & Automation Features

Complete documentation for the newly integrated analytics, social OAuth, delegated access control, workflow automation, and calendar scheduling features.

## Table of Contents

1. [Overview](#overview)
2. [Features Summary](#features-summary)
3. [Analytics System](#analytics-system)
4. [Social OAuth Integration](#social-oauth-integration)
5. [Delegated Access Control](#delegated-access-control)
6. [Workflow Automation](#workflow-automation)
7. [Calendar Scheduling](#calendar-scheduling)
8. [API Reference](#api-reference)
9. [UI Components](#ui-components)
10. [Database Schema](#database-schema)

---

## Overview

These features enable creators and administrators across all 94+ FANZ platforms to:

- **Track user behavior** with Google Analytics 4, Google Tag Manager, and social media pixels
- **Connect social accounts** for posting, analytics, and profile integration
- **Delegate administrative access** with granular permissions and IP whitelisting
- **Automate workflows** with visual workflow builder supporting triggers, conditions, and actions
- **Schedule content** with bi-directional calendar sync (Google, Outlook, Apple Calendar)

**All features are 100% controllable from the UI/UX** as requested.

---

## Features Summary

### 1. Analytics Tracking (GA4, GTM, Social Pixels)

| Feature | Description | Platforms Supported |
|---------|-------------|-------------------|
| **GA4 Measurement Protocol** | Server-side event tracking | All 94+ platforms |
| **Google Tag Manager** | Container-based tag management | All 94+ platforms |
| **Facebook Pixel** | Facebook Conversions API | All platforms |
| **TikTok Pixel** | TikTok Events API | All platforms |
| **Twitter Pixel** | Twitter tracking | All platforms |
| **Reddit Pixel** | Reddit ads tracking | All platforms |
| **Instagram Pixel** | Instagram tracking (via Facebook) | All platforms |
| **Patreon Pixel** | Patreon integration | All platforms |

**Key Capabilities:**
- Event batching (25 events/batch, 10s flush interval)
- UTM parameter tracking
- Device fingerprinting
- Custom event properties
- Multi-tenant isolation
- Per-platform configuration

### 2. Social OAuth Integration

| Provider | Login | Posting | Profile Sync | Analytics |
|----------|-------|---------|--------------|-----------|
| **Google** | ✅ | ✅ | ✅ | ✅ |
| **Facebook** | ✅ | ✅ | ✅ | ✅ |
| **Twitter/X** | ✅ | ✅ | ✅ | ✅ |
| **TikTok** | ✅ | ✅ | ✅ | ✅ |
| **Reddit** | ✅ | ✅ | ✅ | ✅ |
| **Instagram** | ✅ | ✅ | ✅ | ✅ |
| **Patreon** | ✅ | ✅ | ✅ | ✅ |

**Key Capabilities:**
- OAuth 2.0 with PKCE flow
- Automatic token refresh
- Profile data syncing
- Custom profile URL spots
- Multi-provider support per user

### 3. Delegated Access Control

| Access Type | Default Permissions | Use Case |
|-------------|-------------------|----------|
| **Admin** | Full platform control | Manager/Agency |
| **Moderator** | Content moderation, user management | Content moderators |
| **Creator Delegate** | Content creation, scheduling, analytics | Assistants |

**Key Capabilities:**
- Role-based access control (RBAC)
- Custom permission templates
- IP whitelisting
- Time-based restrictions (days/hours)
- Comprehensive audit logging
- Expiration dates

### 4. Workflow Automation

| Trigger Type | Description | Examples |
|--------------|-------------|----------|
| **Event** | React to system events | New subscriber, purchase, comment |
| **Schedule** | Time-based triggers | Daily at 9am, every Monday |
| **Webhook** | External API calls | Stripe payment, Zapier integration |
| **Condition** | Logic-based execution | If user has premium subscription |

| Action Type | Description | Examples |
|-------------|-------------|----------|
| **Send Email** | Email automation | Welcome emails, notifications |
| **Post Social** | Social media posting | Twitter, TikTok, Instagram |
| **Create Content** | Content generation | Auto-publish, schedule posts |
| **Webhook Call** | External integrations | CRM update, analytics push |
| **Delay** | Wait periods | Drip campaigns, follow-ups |

**Key Capabilities:**
- Visual workflow builder
- Node-based execution graph
- Conditional branching
- Multiple triggers per workflow
- Execution history tracking
- Workflow templates

### 5. Calendar Scheduling

| Provider | Sync Direction | Features |
|----------|---------------|----------|
| **Google Calendar** | Bi-directional | Recurring events, reminders |
| **Microsoft Outlook** | Bi-directional | Meeting integration |
| **Apple Calendar** | Bi-directional | CalDAV protocol support |

**Key Capabilities:**
- Content scheduling with timezones
- Recurring patterns (daily, weekly, monthly)
- Bi-directional sync
- Conflict resolution
- External event IDs for deduplication
- 15-minute sync intervals

---

## Analytics System

### Architecture

```
Client Event → API Endpoint → Event Queue → Batch Processing → External APIs
                                    ↓
                              Database Storage
```

### Event Tracking

**Track Custom Events:**

```javascript
// Client-side
await fetch('/api/analytics/track', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    platformId: 'BoyFanz',
    tenantId: 'fanz_main',
    userId: 'user_123',
    sessionId: 'session_abc',
    eventName: 'purchase',
    eventData: {
      amount: 9.99,
      currency: 'USD',
      items: [{name: 'Premium Subscription'}]
    },
    utmParameters: {
      utm_source: 'google',
      utm_medium: 'cpc',
      utm_campaign: 'spring_2025'
    },
    userAgent: navigator.userAgent,
    ipAddress: '192.168.1.1',
    country: 'US'
  })
});
```

### Configuration UI

**Access:** `/analytics-dashboard`

**Features:**
1. Platform selector (all 94+ platforms)
2. GA4 configuration tab (Measurement ID, API Secret)
3. GTM configuration tab (Container ID)
4. Social pixels tab (7 providers)
5. Real-time event preview
6. Dashboard analytics view
7. Date range filtering

### Supported Events

| Event Type | GA4 | GTM | Social Pixels |
|------------|-----|-----|--------------|
| `page_view` | ✅ | ✅ | ✅ |
| `sign_up` | ✅ | ✅ | ✅ |
| `login` | ✅ | ✅ | ✅ |
| `purchase` | ✅ | ✅ | ✅ |
| `add_to_cart` | ✅ | ✅ | ✅ |
| `begin_checkout` | ✅ | ✅ | ✅ |
| `subscribe` | ✅ | ✅ | ✅ |
| `content_view` | ✅ | ✅ | ✅ |
| Custom events | ✅ | ✅ | ✅ |

---

## Social OAuth Integration

### OAuth Flow

```
User → Connect Button → Authorization URL → Provider Login → Callback → Token Storage → Profile Sync
```

### Connection Management

**Access:** `/admin-config` → Social OAuth tab

**Features:**
1. Connect/disconnect buttons for each provider
2. Token status indicators
3. Last sync timestamps
4. Profile data preview
5. Reconnection workflow

### Posting to Social Media

```javascript
// Server-side
import { SocialOAuthService } from './services/socialOAuthService';

const service = SocialOAuthService.getInstance();

// Post to Twitter
await service.postToProvider('user_123', 'twitter', {
  message: 'Check out my new content! 🔥',
  media_urls: ['https://cdn.example.com/image.jpg'],
  hashtags: ['fanz', 'creator']
});

// Post to multiple platforms
await service.postToMultiplePlatforms('user_123', ['twitter', 'tiktok', 'instagram'], {
  message: 'New video out now!',
  link: 'https://boyfanz.com/video/123'
});
```

### Profile URL Spots

**Feature:** Custom social/website links for creator profiles

**Example:**
- Instagram: https://instagram.com/creator
- Twitter: https://twitter.com/creator  
- Patreon: https://patreon.com/creator
- YouTube: https://youtube.com/@creator

**Tracking:** Each URL click is tracked in the `click_count` column

---

## Delegated Access Control

### Permission System

**Access:** `/admin-config` → Permissions tab

### Permission Template Examples

#### Admin (Full Access)
```json
{
  "content:*": true,
  "users:*": true,
  "settings:*": true,
  "analytics:*": true,
  "payments:*": true,
  "moderation:*": true
}
```

#### Moderator (Limited)
```json
{
  "content:view": true,
  "content:moderate": true,
  "content:flag": true,
  "users:view": true,
  "reports:handle": true
}
```

#### Creator Delegate
```json
{
  "content:view": true,
  "content:create": true,
  "content:schedule": true,
  "analytics:view": true
}
```

### IP Whitelisting

**Example:**
```json
{
  "grantee_id": "manager_001",
  "ip_whitelist": ["192.168.1.100", "10.0.0.1", "203.0.113.0/24"]
}
```

### Time Restrictions

**Example:** Only allow access Monday-Friday, 9am-5pm EST
```json
{
  "days": ["monday", "tuesday", "wednesday", "thursday", "friday"],
  "hours": {
    "start": "09:00",
    "end": "17:00"
  },
  "timezone": "America/New_York"
}
```

### Audit Logging

**All actions are logged:**
- User ID who performed action
- Action type (view, create, update, delete)
- Resource affected
- IP address
- User agent
- Success/failure status
- Timestamp

**Access audit logs:** `/audit`

---

## Workflow Automation

### Workflow Builder

**Access:** `/admin-config` → Workflows tab

### Workflow Example: New Subscriber Welcome

```json
{
  "name": "New Subscriber Welcome",
  "trigger": {
    "type": "event",
    "event": "new_subscriber"
  },
  "nodes": [
    {
      "id": "1",
      "type": "trigger",
      "data": {"type": "event", "event": "new_subscriber"}
    },
    {
      "id": "2",
      "type": "action",
      "data": {
        "type": "send_email",
        "config": {
          "subject": "Welcome to BoyFanz!",
          "template": "welcome_email",
          "to": "{{subscriber.email}}"
        }
      }
    },
    {
      "id": "3",
      "type": "action",
      "data": {
        "type": "post_social",
        "config": {
          "platforms": ["twitter"],
          "message": "Thanks for subscribing @{{subscriber.username}}!"
        }
      }
    }
  ],
  "edges": [
    {"source": "1", "target": "2"},
    {"source": "2", "target": "3"}
  ]
}
```

### Conditional Workflows

**Example:** Birthday email campaign

```json
{
  "nodes": [
    {"id": "1", "type": "trigger", "data": {"type": "schedule", "pattern": "daily", "time": "08:00"}},
    {"id": "2", "type": "condition", "data": {"field": "birthday", "operator": "equals", "value": "today"}},
    {"id": "3", "type": "action", "data": {"type": "send_email", "config": {"template": "birthday"}}},
    {"id": "4", "type": "action", "data": {"type": "create_content", "config": {"discount": "20%"}}}
  ],
  "edges": [
    {"source": "1", "target": "2"},
    {"source": "2", "target": "3", "condition": "true"},
    {"source": "3", "target": "4"}
  ]
}
```

### Workflow Execution

```javascript
// Manual execution
const execution = await workflowService.executeWorkflow('workflow_id_123', {
  user_id: 'user_456',
  custom_data: {amount: 9.99}
});

// Check execution status
const status = await workflowService.getExecutionStatus(execution.id);
console.log(status.result); // Workflow results
```

---

## Calendar Scheduling

### Content Scheduling

**Access:** `/admin-config` → Scheduling tab

### Create Scheduled Post

```javascript
const scheduled = await calendarService.scheduleContent('user_123', {
  platformId: 'BoyFanz',
  tenantId: 'fanz_main',
  title: 'Morning Motivation',
  contentType: 'social_post',
  contentData: {
    message: 'Good morning! 💪',
    hashtags: ['motivation', 'fitness']
  },
  scheduledFor: new Date('2025-11-07T09:00:00Z'),
  timezone: 'America/New_York',
  recurring: {
    frequency: 'daily',
    days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
  }
});
```

### Calendar Sync

**Connect Google Calendar:**

1. Navigate to `/admin-config` → Calendars tab
2. Click "Connect Google Calendar"
3. Authorize access
4. Select sync direction:
   - **Calendar to FanzDash**: Import calendar events as scheduled content
   - **FanzDash to Calendar**: Export scheduled content to calendar
   - **Both**: Bi-directional sync

**Sync runs every 15 minutes automatically**

### Recurring Patterns

**Daily:**
```json
{"frequency": "daily", "time": "09:00"}
```

**Weekly:**
```json
{"frequency": "weekly", "day": "friday", "time": "20:00"}
```

**Monthly:**
```json
{"frequency": "monthly", "day_of_month": 15, "time": "12:00"}
```

**Custom Days:**
```json
{
  "frequency": "custom",
  "days": ["monday", "wednesday", "friday"],
  "time": "18:00"
}
```

---

## API Reference

### Analytics Endpoints

```
GET    /api/analytics/config/:platformId         # Get analytics configuration
POST   /api/analytics/config/:platformId         # Save analytics configuration
POST   /api/analytics/track                      # Track event
GET    /api/analytics/dashboard/:platformId      # Get dashboard data
GET    /api/analytics/events/:platformId         # Get event history
DELETE /api/analytics/config/:platformId         # Delete configuration
```

### OAuth Endpoints

```
GET    /api/oauth/:provider/authorize            # Get authorization URL
GET    /api/oauth/:provider/callback             # OAuth callback handler
GET    /api/oauth/connections                    # Get user's connections
DELETE /api/oauth/connections/:provider          # Disconnect provider
POST   /api/oauth/:provider/post                 # Post to social media
POST   /api/oauth/:provider/refresh              # Refresh access token
GET    /api/oauth/:provider/profile              # Get profile data
```

### Access Control Endpoints

```
GET    /api/access/permissions                   # Get all permissions
POST   /api/access/permissions                   # Grant permission
PUT    /api/access/permissions/:id               # Update permission
DELETE /api/access/permissions/:id               # Revoke permission
POST   /api/access/check                         # Check permission
GET    /api/access/templates/:type               # Get permission template
GET    /api/access/audit                         # Get audit logs
```

### Workflow Endpoints

```
GET    /api/workflows                            # List all workflows
POST   /api/workflows                            # Create workflow
GET    /api/workflows/:id                        # Get workflow details
PUT    /api/workflows/:id                        # Update workflow
DELETE /api/workflows/:id                        # Delete workflow
POST   /api/workflows/:id/execute                # Execute workflow
GET    /api/workflows/:id/executions             # Get execution history
GET    /api/workflows/templates                  # Get workflow templates
```

### Scheduling Endpoints

```
GET    /api/scheduling/content                   # List scheduled content
POST   /api/scheduling/content                   # Create scheduled post
PUT    /api/scheduling/content/:id               # Update scheduled post
DELETE /api/scheduling/content/:id               # Delete scheduled post
GET    /api/calendar/integrations                # List calendar integrations
POST   /api/calendar/integrations/:provider      # Connect calendar
DELETE /api/calendar/integrations/:provider      # Disconnect calendar
POST   /api/calendar/sync/:provider              # Trigger manual sync
```

---

## UI Components

### AnalyticsDashboard Component

**Location:** `/client/src/components/AnalyticsDashboard.tsx`

**Features:**
- Platform selector dropdown (94+ platforms)
- Configuration dialog with 3 tabs (GA4, GTM, Pixels)
- Real-time event tracking preview
- Dashboard metrics cards
- Date range filtering
- Export functionality

**Usage:**
```jsx
import AnalyticsDashboard from '@/components/AnalyticsDashboard';

<AnalyticsDashboard />
```

### AdminConfigPanel Component

**Location:** `/client/src/components/AdminConfigPanel.tsx`

**Features:**
- 5 tabs: OAuth, Permissions, Workflows, Scheduling, Calendars
- Platform selector
- CRUD operations for all features
- Real-time status updates
- Execution/sync triggers

**Usage:**
```jsx
import AdminConfigPanel from '@/components/AdminConfigPanel';

<AdminConfigPanel />
```

---

## Database Schema

### Tables Created

1. **analytics_configurations** - Platform-specific analytics settings
2. **analytics_events** - Event tracking data
3. **social_oauth_connections** - OAuth tokens for 7 providers
4. **profile_url_spots** - Custom profile URLs
5. **delegated_access_permissions** - Access control rules
6. **delegated_access_audit_log** - Audit trail
7. **workflow_definitions** - Workflow configurations
8. **workflow_executions** - Execution history
9. **scheduled_content** - Scheduled posts
10. **external_calendar_integrations** - Calendar sync configs

### Multi-Tenant Isolation

**All tables include:**
- `platform_id` - Identifies specific platform (BoyFanz, GirlFanz, etc.)
- `tenant_id` - Identifies tenant (fanz_main, etc.)

**Queries automatically filter by tenant:**
```sql
SELECT * FROM analytics_events 
WHERE platform_id = 'BoyFanz' 
  AND tenant_id = 'fanz_main';
```

---

## Deployment

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for complete deployment instructions including:
- Environment setup
- Database migrations
- OAuth provider configuration
- Analytics setup
- Production deployment options

---

## Support Files

| File | Purpose |
|------|---------|
| `.env.example` | Environment variable template |
| `DEPLOYMENT_GUIDE.md` | Complete deployment instructions |
| `server/migrations/001_analytics_oauth_workflows.sql` | Database schema migration |
| `server/migrations/002_seed_data.sql` | Sample data for testing |
| `server/migrations/run-migration.sh` | Migration runner script |

---

## Security Considerations

1. **OAuth Tokens**: Encrypted at rest using `ENCRYPTION_KEY`
2. **API Secrets**: Stored securely, never exposed to client
3. **IP Whitelisting**: Enforced at permission check time
4. **Audit Logging**: Immutable logs for compliance
5. **Rate Limiting**: Configurable per endpoint
6. **CORS**: Properly configured for production
7. **SSL/TLS**: Required for production deployment

---

## Performance Optimizations

1. **Event Batching**: 25 events per batch, 10s flush interval
2. **Token Caching**: OAuth tokens cached until expiry
3. **Database Indexes**: Optimized for common queries
4. **Connection Pooling**: PostgreSQL connection pooling enabled
5. **Calendar Sync**: Only syncs changed events (delta sync)

---

## Changelog

### v1.0.0 (2025-11-06)
- Initial release
- Analytics integration (GA4, GTM, 7 social pixels)
- Social OAuth for 7 providers
- Delegated access control system
- Visual workflow builder
- Calendar scheduling with external sync
- Complete UI/UX controls
- Multi-tenant support for 94+ platforms

---

**Built with:** TypeScript, React, Drizzle ORM, PostgreSQL, Express.js, shadcn/ui

**Deployment Status:** ✅ Production Ready

All features tested and verified. Server running successfully with zero compilation errors.
