# FanzDash Deployment Guide

Complete deployment guide for the FANZ Unified Ecosystem with Analytics, OAuth, Workflows, and Calendar integrations.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Setup](#database-setup)
4. [OAuth Provider Configuration](#oauth-provider-configuration)
5. [Analytics Configuration](#analytics-configuration)
6. [Production Deployment](#production-deployment)
7. [Post-Deployment Verification](#post-deployment-verification)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

- **Node.js**: v20+ (with pnpm)
- **PostgreSQL**: v14+ (with UUID extension)
- **Git**: Latest version
- **SSL Certificates**: For production HTTPS

### Required Accounts

1. **Google Cloud Platform** (for GA4, GTM, Calendar, OAuth)
2. **Facebook Business** (for Facebook & Instagram pixels/OAuth)
3. **Twitter/X Developer** (for Twitter pixel/OAuth)
4. **TikTok for Business** (for TikTok pixel/OAuth)
5. **Reddit Ads** (for Reddit pixel/OAuth)
6. **Patreon** (for Patreon integration)
7. **AWS** (for S3 storage) or compatible provider

---

## Environment Setup

### Step 1: Clone and Install Dependencies

```bash
cd /Users/joshuastone/FANZ-Unified-Ecosystem/fanzdash
pnpm install
```

### Step 2: Copy Environment Template

```bash
cp .env.example .env
```

### Step 3: Configure Environment Variables

Edit `.env` with your actual values. See detailed configuration sections below.

---

## Database Setup

### Step 1: Create PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE fanzdash;

# Enable UUID extension
\c fanzdash
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

# Exit psql
\q
```

### Step 2: Run Migrations

```bash
# Run the migration script
psql -U postgres -d fanzdash -f server/migrations/001_analytics_oauth_workflows.sql
```

The migration creates these tables:
- `analytics_configurations` - GA4, GTM, pixel configs per platform
- `analytics_events` - Event tracking with UTM parameters
- `social_oauth_connections` - OAuth tokens for 7 providers
- `profile_url_spots` - Custom profile URLs
- `delegated_access_permissions` - Granular access control
- `delegated_access_audit_log` - Audit trail
- `workflow_definitions` - Automation workflows
- `workflow_executions` - Workflow execution history
- `scheduled_content` - Content scheduling
- `external_calendar_integrations` - Calendar sync configs

### Step 3: Verify Migration

```bash
# Check tables were created
psql -U postgres -d fanzdash -c "\dt"

# Verify indexes
psql -U postgres -d fanzdash -c "\di"
```

---

## OAuth Provider Configuration

### Google OAuth (for Login & Calendar)

1. **Go to**: [Google Cloud Console](https://console.cloud.google.com)
2. **Create Project**: "FANZ Ecosystem"
3. **Enable APIs**:
   - Google+ API
   - Google Calendar API
   - YouTube Data API v3
4. **Create OAuth 2.0 Credentials**:
   - Application type: Web application
   - Authorized redirect URIs: `https://yourdomain.com/api/oauth/google/callback`
   - Copy Client ID and Client Secret
5. **Add to `.env`**:
   ```bash
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret
   GOOGLE_REDIRECT_URI=https://yourdomain.com/api/oauth/google/callback
   ```

### Facebook OAuth (for Login & Pixels)

1. **Go to**: [Facebook Developers](https://developers.facebook.com)
2. **Create App**: Choose "Consumer" or "Business"
3. **Add Products**: Facebook Login, Instagram Basic Display
4. **Configure OAuth Redirect URIs**: `https://yourdomain.com/api/oauth/facebook/callback`
5. **Get Credentials**: App ID and App Secret
6. **Add to `.env`**:
   ```bash
   FACEBOOK_APP_ID=your-app-id
   FACEBOOK_APP_SECRET=your-app-secret
   FACEBOOK_REDIRECT_URI=https://yourdomain.com/api/oauth/facebook/callback
   ```

### Twitter/X OAuth

1. **Go to**: [Twitter Developer Portal](https://developer.twitter.com/en/portal)
2. **Create Project and App**
3. **Enable OAuth 2.0**
4. **Set Redirect URI**: `https://yourdomain.com/api/oauth/twitter/callback`
5. **Get Client ID and Secret**
6. **Add to `.env`**:
   ```bash
   TWITTER_CLIENT_ID=your-client-id
   TWITTER_CLIENT_SECRET=your-client-secret
   TWITTER_REDIRECT_URI=https://yourdomain.com/api/oauth/twitter/callback
   ```

### TikTok OAuth

1. **Go to**: [TikTok for Developers](https://developers.tiktok.com/)
2. **Create App**
3. **Add Login Kit**
4. **Configure Redirect URI**: `https://yourdomain.com/api/oauth/tiktok/callback`
5. **Get Client Key and Secret**
6. **Add to `.env`**:
   ```bash
   TIKTOK_CLIENT_KEY=your-client-key
   TIKTOK_CLIENT_SECRET=your-client-secret
   TIKTOK_REDIRECT_URI=https://yourdomain.com/api/oauth/tiktok/callback
   ```

### Reddit OAuth

1. **Go to**: [Reddit Apps](https://www.reddit.com/prefs/apps)
2. **Create App**: Choose "web app"
3. **Set Redirect URI**: `https://yourdomain.com/api/oauth/reddit/callback`
4. **Get Client ID and Secret**
5. **Add to `.env`**:
   ```bash
   REDDIT_CLIENT_ID=your-client-id
   REDDIT_CLIENT_SECRET=your-client-secret
   REDDIT_REDIRECT_URI=https://yourdomain.com/api/oauth/reddit/callback
   ```

### Instagram OAuth

Instagram uses Facebook OAuth. Follow Facebook OAuth setup and ensure Instagram Basic Display is added as a product.

### Patreon OAuth

1. **Go to**: [Patreon Developer Portal](https://www.patreon.com/portal/registration/register-clients)
2. **Create Client**
3. **Set Redirect URI**: `https://yourdomain.com/api/oauth/patreon/callback`
4. **Get Client ID and Secret**
5. **Add to `.env`**:
   ```bash
   PATREON_CLIENT_ID=your-client-id
   PATREON_CLIENT_SECRET=your-client-secret
   PATREON_REDIRECT_URI=https://yourdomain.com/api/oauth/patreon/callback
   ```

---

## Analytics Configuration

### Google Analytics 4 (GA4)

1. **Go to**: [Google Analytics](https://analytics.google.com)
2. **Create Property**: Choose "GA4" property type
3. **Get Measurement ID**: Format is `G-XXXXXXXXXX`
4. **Create API Secret**:
   - Admin → Data Streams → Choose your stream
   - Measurement Protocol API secrets → Create
5. **Add to `.env`** (default values):
   ```bash
   GA4_MEASUREMENT_ID=G-XXXXXXXXXX
   GA4_API_SECRET=your-api-secret
   ```
6. **Per-Platform Configuration**: Use FanzDash UI at `/analytics-dashboard`

### Google Tag Manager (GTM)

1. **Go to**: [Google Tag Manager](https://tagmanager.google.com)
2. **Create Account and Container**
3. **Get Container ID**: Format is `GTM-XXXXXXX`
4. **Add to `.env`**:
   ```bash
   GTM_CONTAINER_ID=GTM-XXXXXXX
   ```
5. **Configure Tags**: Add GA4, Facebook Pixel, etc. in GTM UI

### Social Media Pixels

#### Facebook Pixel

1. **Go to**: [Facebook Events Manager](https://business.facebook.com/events_manager)
2. **Create Pixel**
3. **Get Pixel ID** (15-digit number)
4. **Generate Access Token**: Business Settings → System Users → Generate New Token
5. **Add to `.env`**:
   ```bash
   FACEBOOK_PIXEL_ID=123456789012345
   FACEBOOK_ACCESS_TOKEN=your-access-token
   ```

#### TikTok Pixel

1. **Go to**: [TikTok Events Manager](https://ads.tiktok.com/marketing_api/docs)
2. **Create Pixel**
3. **Get Pixel ID**
4. **Generate Access Token**
5. **Add to `.env`**:
   ```bash
   TIKTOK_PIXEL_ID=your-pixel-id
   TIKTOK_ACCESS_TOKEN=your-access-token
   ```

---

## Production Deployment

### Option 1: Docker Deployment

```bash
# Build Docker image
docker build -t fanzdash:latest .

# Run container
docker run -d \
  --name fanzdash \
  -p 3000:3000 \
  -p 8080:8080 \
  --env-file .env \
  fanzdash:latest
```

### Option 2: PM2 Deployment

```bash
# Install PM2 globally
npm install -g pm2

# Build production bundle
pnpm run build

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup startup script
pm2 startup
```

### Option 3: Cloud Platform Deployment

#### Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

#### Heroku

```bash
# Login to Heroku
heroku login

# Create app
heroku create fanzdash-prod

# Add PostgreSQL
heroku addons:create heroku-postgresql:standard-0

# Deploy
git push heroku main

# Run migrations
heroku run psql \$DATABASE_URL -f server/migrations/001_analytics_oauth_workflows.sql
```

#### AWS (Elastic Beanstalk)

```bash
# Install EB CLI
pip install awsebcli

# Initialize
eb init fanzdash --region us-east-1 --platform node.js

# Create environment
eb create fanzdash-production

# Deploy
eb deploy
```

### SSL/TLS Configuration

For production, you MUST use HTTPS:

```bash
# Using Let's Encrypt (recommended)
sudo apt-get install certbot
sudo certbot certonly --standalone -d yourdomain.com

# Update .env
SSL_ENABLED=true
SSL_CERT_PATH=/etc/letsencrypt/live/yourdomain.com/fullchain.pem
SSL_KEY_PATH=/etc/letsencrypt/live/yourdomain.com/privkey.pem
```

### Environment Variables for Production

Update these in `.env`:

```bash
NODE_ENV=production
BASE_URL=https://yourdomain.com
CLIENT_URL=https://yourdomain.com
SESSION_SECRET=generate-strong-random-secret-here
JWT_SECRET=generate-another-strong-random-secret
ENCRYPTION_KEY=32-character-random-string-here
ENCRYPTION_IV=16-character-random-string
```

---

## Post-Deployment Verification

### 1. Health Check

```bash
curl https://yourdomain.com/api/health
# Expected: {"status":"ok","timestamp":"..."}
```

### 2. Database Connection

```bash
curl https://yourdomain.com/api/analytics/config/BoyFanz
# Expected: Analytics configuration object or empty {}
```

### 3. Analytics Test

Navigate to: `https://yourdomain.com/analytics-dashboard`

1. Select platform (e.g., BoyFanz)
2. Click "Configure Analytics"
3. Enter GA4 credentials
4. Save configuration
5. Test event tracking

### 4. OAuth Connection Test

Navigate to: `https://yourdomain.com/admin-config`

1. Select "Social OAuth" tab
2. Click "Connect" for any provider
3. Complete OAuth flow
4. Verify connection appears in list

### 5. Workflow Test

Navigate to: `https://yourdomain.com/admin-config`

1. Select "Workflows" tab
2. Create test workflow
3. Execute workflow
4. Check execution history

---

## Troubleshooting

### Database Connection Errors

**Problem**: `Error: connect ECONNREFUSED`

**Solution**:
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Verify connection string in .env
# Format: postgresql://username:password@localhost:5432/database
```

### OAuth Redirect Mismatch

**Problem**: `redirect_uri_mismatch` error

**Solution**:
1. Check OAuth provider settings match exactly
2. Ensure HTTPS in production
3. Verify no trailing slashes

### Analytics Events Not Tracking

**Problem**: Events not appearing in GA4

**Solution**:
1. Check GA4_MEASUREMENT_ID and GA4_API_SECRET are correct
2. Verify API secret is not expired
3. Check browser console for errors
4. Test with GA4 DebugView

### Rate Limiting Issues

**Problem**: `429 Too Many Requests`

**Solution**:
```bash
# Adjust rate limits in .env
RATE_LIMIT_MAX_REQUESTS=200
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
```

### Calendar Sync Not Working

**Problem**: Calendars not syncing

**Solution**:
1. Check OAuth tokens are valid
2. Verify calendar permissions granted
3. Check sync_enabled is true in database
4. Review sync_error column for details

---

## Multi-Tenant Platform Configuration

To configure analytics/OAuth for specific platforms:

1. Navigate to: `/analytics-dashboard` or `/admin-config`
2. Select platform from dropdown (94+ platforms available)
3. Configure settings specific to that platform
4. Settings are isolated per platform_id and tenant_id

### Example Platform Override

```javascript
// In FanzDash UI, configure per platform:
// BoyFanz: GA4_MEASUREMENT_ID = G-ABC123
// GirlFanz: GA4_MEASUREMENT_ID = G-XYZ789
// Etc.
```

---

## Backup and Disaster Recovery

### Database Backups

```bash
# Automated daily backups
pg_dump -U postgres fanzdash > backup_$(date +%Y%m%d).sql

# Restore from backup
psql -U postgres fanzdash < backup_20251106.sql
```

### Application Logs

```bash
# PM2 logs
pm2 logs fanzdash

# Docker logs
docker logs fanzdash

# Systemd logs
journalctl -u fanzdash
```

---

## Monitoring and Maintenance

### Recommended Monitoring Tools

- **Sentry**: Error tracking (configure SENTRY_DSN)
- **DataDog**: Application monitoring
- **LogRocket**: Session replay
- **Google Analytics**: User behavior
- **Uptime Robot**: Availability monitoring

### Regular Maintenance Tasks

1. **Weekly**: Review audit logs for suspicious activity
2. **Monthly**: Rotate OAuth tokens if needed
3. **Quarterly**: Update dependencies (`pnpm update`)
4. **Annually**: Renew SSL certificates

---

## Security Checklist

- [ ] SSL/TLS enabled (HTTPS only)
- [ ] Environment variables secured (not in git)
- [ ] Database credentials rotated
- [ ] OAuth secrets secured
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Helmet security headers enabled
- [ ] Audit logging active
- [ ] Backups automated
- [ ] Monitoring configured

---

## Support and Resources

- **Documentation**: See `README.md` for feature details
- **Migration Scripts**: `server/migrations/`
- **Environment Template**: `.env.example`
- **API Documentation**: Auto-generated from routes
- **Issue Tracking**: GitHub Issues

---

## Changelog

### v1.0.0 (2025-11-06)
- Initial deployment guide
- Analytics integration (GA4, GTM, social pixels)
- OAuth 2.0 for 7 providers
- Workflow automation system
- Calendar integrations (Google, Outlook, Apple)
- Delegated access control
- Multi-tenant support for 94+ platforms

---

**Deployment Status**: Ready for Production ✅

All features tested and verified. Server running successfully with:
- HTTP Server: Port 3000
- Streaming Server: Port 8080
- RTMP Server: Port 1935
- Zero compilation errors
- All services initialized
