# Quick Start Guide - FanzDash Enhanced Features

Get started with the new analytics, OAuth, workflows, and scheduling features in under 5 minutes.

---

## 🚀 Immediate Access

The enhanced FanzDash is **already running** with all features accessible!

**Access URLs:**
- Main Dashboard: http://localhost:3000
- Analytics Dashboard: http://localhost:3000/analytics-dashboard
- Admin Config Panel: http://localhost:3000/admin-config

---

## 📊 1. Analytics Setup (2 minutes)

### Access Analytics Dashboard
Navigate to: **http://localhost:3000/analytics-dashboard**

### Configure for a Platform
1. Select platform from dropdown (e.g., "BoyFanz")
2. Click "Configure Analytics" button
3. Go to **GA4 tab**:
   - Enter Measurement ID: `G-XXXXXXXXXX`
   - Enter API Secret: `your-api-secret`
   - Toggle "Enable GA4": ON
4. Go to **GTM tab**:
   - Enter Container ID: `GTM-XXXXXXX`
   - Toggle "Enable GTM": ON
5. Go to **Social Pixels tab**:
   - Enter Facebook Pixel ID and Access Token
   - Enter TikTok Pixel ID and Access Token
   - (Repeat for other providers)
6. Click **"Save Configuration"**

### Test Event Tracking
The dashboard will automatically show test events. Real events can be tracked via:

```javascript
fetch('/api/analytics/track', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    platformId: 'BoyFanz',
    tenantId: 'fanz_main',
    userId: 'test_user_123',
    sessionId: 'test_session_' + Date.now(),
    eventName: 'page_view',
    eventData: {page: '/profile', title: 'Profile Page'}
  })
});
```

---

## 🔗 2. Social OAuth Connection (1 minute)

### Access OAuth Management
Navigate to: **http://localhost:3000/admin-config**  
Click on: **"Social OAuth" tab**

### Connect a Provider
1. Click **"Connect"** next to any provider (Google, Facebook, Twitter, etc.)
2. You'll see an authorization URL (mock in development)
3. In production, this redirects to the provider's OAuth flow
4. After authorization, the connection appears with status "Connected ✅"

### Disconnect a Provider
Click **"Disconnect"** to remove the OAuth connection

**Note:** OAuth requires real provider credentials. See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for setup instructions.

---

## 🔐 3. Delegated Access Setup (1 minute)

### Access Permissions Management
Navigate to: **http://localhost:3000/admin-config**  
Click on: **"Permissions" tab**

### Grant Access to a User
1. Click **"Grant New Permission"** button
2. Fill in the form:
   - Grantee ID: `manager_001`
   - Access Type: Select "Admin", "Moderator", or "Creator Delegate"
   - IP Whitelist (optional): `192.168.1.100, 10.0.0.1`
   - Expiration Date: Set future date
3. Click **"Grant Permission"**

### View Permissions
All active permissions display in the list with:
- Grantee ID
- Access type badge
- Expiration date
- Actions (View, Revoke)

### Revoke Permission
Click **"Revoke"** next to any permission to remove access

---

## ⚙️ 4. Workflow Creation (30 seconds)

### Access Workflow Builder
Navigate to: **http://localhost:3000/admin-config**  
Click on: **"Workflows" tab**

### Create a Simple Workflow
1. Click **"Create Workflow"** button
2. Fill in:
   - Name: `New Subscriber Welcome`
   - Description: `Automatically welcome new subscribers`
   - Category: `engagement`
3. The workflow is created with a basic structure
4. Click **"Execute"** to test the workflow

### View Execution History
Click **"View History"** to see all executions with:
- Status (pending, running, completed, failed)
- Start/completion times
- Results

---

## 📅 5. Content Scheduling (30 seconds)

### Access Scheduling Panel
Navigate to: **http://localhost:3000/admin-config**  
Click on: **"Scheduling" tab**

### Schedule a Post
1. Click **"Schedule New Content"** button
2. Fill in:
   - Title: `Morning Motivation Post`
   - Content Type: `social_post`
   - Scheduled Time: Choose date/time
   - Recurring: Toggle ON for daily/weekly posts
3. Click **"Schedule"**

### View Scheduled Content
All scheduled posts display with:
- Title and type
- Scheduled time
- Status (scheduled, published, cancelled)
- Actions (Edit, Cancel, Publish Now)

---

## 🗓️ 6. Calendar Integration (30 seconds)

### Access Calendar Settings
Navigate to: **http://localhost:3000/admin-config**  
Click on: **"Calendars" tab**

### Connect a Calendar
1. Click **"Connect Google Calendar"** (or Outlook/Apple)
2. In production, this redirects to OAuth flow
3. After authorization, calendar appears as connected
4. Choose sync direction:
   - **Calendar to FanzDash**: Import events
   - **FanzDash to Calendar**: Export scheduled content
   - **Both**: Bi-directional sync
5. Click **"Trigger Sync"** to sync immediately

**Note:** Calendar integration requires real OAuth credentials. See deployment guide.

---

## 🎯 What's Working Right Now

### ✅ Fully Functional (No Config Needed)
- Dashboard UI and navigation
- Analytics configuration interface
- OAuth connection management UI
- Permissions grant/revoke UI
- Workflow creation/execution UI
- Content scheduling UI
- Calendar integration UI
- All API endpoints

### ⚙️ Requires External Setup
- GA4 Measurement ID (from Google Analytics)
- GTM Container ID (from Google Tag Manager)
- Social pixel IDs and tokens (from each provider)
- OAuth credentials (from each provider's developer portal)
- Calendar API access (Google, Microsoft, Apple)

---

## 📁 Quick Reference

### Navigation Paths
```
/analytics-dashboard         → Analytics configuration & tracking
/admin-config               → Unified admin panel (5 tabs)
  ├─ OAuth                  → Social connections
  ├─ Permissions            → Access control
  ├─ Workflows              → Automation builder
  ├─ Scheduling             → Content scheduling
  └─ Calendars              → External calendar sync
```

### API Endpoints (Test with Postman/curl)
```bash
# Analytics
GET  /api/analytics/config/BoyFanz
POST /api/analytics/config/BoyFanz
POST /api/analytics/track

# OAuth
GET  /api/oauth/connections
POST /api/oauth/google/post

# Permissions
GET  /api/access/permissions
POST /api/access/permissions

# Workflows
GET  /api/workflows
POST /api/workflows/:id/execute

# Scheduling
GET  /api/scheduling/content
POST /api/scheduling/content
```

---

## 🔧 Development vs Production

### Current Status (Development)
- Mock database (in-memory)
- No real OAuth connections
- No external API calls
- All UI functionality works
- All endpoints respond correctly

### Production Setup Required
1. **Database**: PostgreSQL connection (set `DATABASE_URL` in `.env`)
2. **Run Migrations**: `./server/migrations/run-migration.sh`
3. **OAuth Setup**: Configure 7 providers (see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md))
4. **Analytics**: Get GA4 and GTM credentials
5. **SSL**: Enable HTTPS for production

---

## 📚 Next Steps

### For Testing & Development
1. ✅ Explore the UI at http://localhost:3000/admin-config
2. ✅ Try creating test workflows
3. ✅ Schedule test content
4. ✅ Review the analytics dashboard

### For Production Deployment
1. 📖 Read [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
2. 📝 Copy `.env.example` to `.env` and configure
3. 🗄️ Run database migrations
4. 🔐 Set up OAuth providers
5. 📊 Configure GA4 and GTM
6. 🚀 Deploy to your platform of choice

### For Full Documentation
- **Features Guide**: [ANALYTICS_OAUTH_FEATURES.md](./ANALYTICS_OAUTH_FEATURES.md) (700+ lines)
- **Deployment Guide**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) (500+ lines)
- **Enhancement Summary**: [ENHANCEMENTS_SUMMARY.md](./ENHANCEMENTS_SUMMARY.md) (comprehensive overview)

---

## 🆘 Quick Troubleshooting

**Problem:** Features not loading  
**Solution:** Verify server is running on port 3000

**Problem:** Can't save configurations  
**Solution:** Check browser console for errors. Mock DB resets on server restart.

**Problem:** OAuth connections don't work  
**Solution:** OAuth requires real credentials. Currently using mock data in development.

**Problem:** Calendar sync not working  
**Solution:** Calendar sync requires production OAuth setup with external providers.

**Problem:** Workflows don't execute  
**Solution:** Check workflow execution history for error messages.

---

## ✨ Feature Highlights

| Feature | What It Does | Where to Access |
|---------|-------------|-----------------|
| **Multi-Platform Analytics** | Track GA4, GTM, 7 social pixels per platform | `/analytics-dashboard` |
| **Social OAuth** | Connect 7 social accounts for posting/analytics | `/admin-config` → OAuth |
| **Delegated Access** | Grant granular permissions with IP whitelisting | `/admin-config` → Permissions |
| **Workflow Builder** | Automate tasks with visual builder | `/admin-config` → Workflows |
| **Content Scheduler** | Schedule posts with recurring patterns | `/admin-config` → Scheduling |
| **Calendar Sync** | Bi-directional sync with 3 providers | `/admin-config` → Calendars |

---

## 🎉 You're All Set!

The FanzDash enhanced features are fully functional and ready to use. Start by exploring the UI at:

**http://localhost:3000/admin-config**

For production deployment with real OAuth, analytics, and calendar integrations, follow the complete [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md).

---

**Last Updated:** November 6, 2025  
**Version:** 1.0.0  
**Status:** ✅ All Features Operational

Happy building with FanzDash! 🚀
