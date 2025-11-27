# Platform Synchronization System

FanzDash implements a comprehensive platform synchronization system that keeps the application in sync across both **Replit** and **Cloudflare Warp** (Workers) platforms, ensuring continuous updates and seamless deployment across both environments.

## Overview

The sync system provides:
- **Bidirectional synchronization** between Replit and Warp platforms
- **Real-time change detection** and propagation
- **Automated deployments** on code changes
- **Health monitoring** and conflict resolution
- **Backup and recovery** mechanisms
- **Cross-platform environment management**

## Architecture

```
┌─────────────┐     ┌─────────────────┐     ┌─────────────┐
│   Replit    │────▶│  Sync Manager   │◀────│    Warp     │
│  (Primary)  │     │   (GitHub)      │     │ (Workers)   │
└─────────────┘     └─────────────────┘     └─────────────┘
       │                      │                      │
       ▼                      ▼                      ▼
┌─────────────┐     ┌─────────────────┐     ┌─────────────┐
│  Express    │     │   Webhooks &    │     │    Hono     │
│   Server    │     │   GitHub Actions│     │   Worker    │
└─────────────┘     └─────────────────┘     └─────────────┘
```

## Configuration Files

### 1. Platform Configurations

- **`.replit`** - Replit deployment configuration
- **`warp.toml`** - Cloudflare Workers configuration
- **`sync.config.json`** - Central sync configuration

### 2. Sync Configuration (`sync.config.json`)

```json
{
  "platforms": {
    "replit": {
      "enabled": true,
      "sync_frequency": "*/5 * * * *"
    },
    "warp": {
      "enabled": true,
      "sync_frequency": "*/5 * * * *"
    }
  },
  "sync": {
    "enabled": true,
    "bidirectional": true,
    "conflict_resolution": "latest_wins"
  }
}
```

## Scripts and Tools

### Platform Sync Manager (`scripts/platform-sync.ts`)

Main synchronization tool that handles:
- Change detection across platforms
- Environment variable synchronization
- Build and deployment coordination
- Health checks and monitoring

**Usage:**
```bash
# Full synchronization
npm run sync

# Health check only
npm run sync:health

# Create backup
npm run sync:backup
```

### GitHub Actions Workflow (`.github/workflows/platform-sync.yml`)

Automated CI/CD pipeline that:
- Validates configurations
- Builds for both platforms
- Deploys to Replit and Warp
- Monitors sync status
- Creates backups

## Platform-Specific Features

### Replit Integration

- **Native environment** with Express.js server
- **Direct database access** via Drizzle ORM
- **WebSocket support** for real-time features
- **File system access** for local development

### Warp (Cloudflare Workers) Integration

- **Edge computing** with global distribution
- **KV storage** for caching and sessions
- **R2 buckets** for file storage
- **Durable Objects** for real-time features
- **Analytics Engine** for metrics
- **Queue system** for background tasks

## Sync Process

### 1. Change Detection

The system monitors:
- Source code changes (`client/`, `server/`, `shared/`)
- Configuration updates (`package.json`, `tsconfig.json`)
- Schema modifications (`drizzle.config.ts`)

### 2. Build Process

**For Replit:**
```bash
npm run build
```

**For Warp:**
```bash
npm run build:warp
wrangler deploy
```

### 3. Environment Synchronization

Environment variables are synced between platforms:
- `DATABASE_URL`
- `JWT_SECRET`
- `VERIFYMY_API_KEY`
- `PAYOUTS_WEBHOOK_SECRET`
- `ADS_WEBHOOK_SECRET`

### 4. Health Monitoring

Continuous health checks ensure:
- Platform availability
- Sync status
- Error detection
- Performance monitoring

## API Endpoints

### Sync Status
```
GET /api/sync/status
```
Returns current sync status for all platforms.

### Manual Sync Trigger
```
POST /api/sync/trigger
{
  "platform": "all|replit|warp",
  "force": boolean
}
```
Manually triggers synchronization.

### Warp Sync Webhook
```
POST /api/sync/from-warp
```
Receives sync notifications from Warp platform.

### Health Check
```
GET /api/health
```
Platform-specific health status.

## Deployment Commands

### Development
```bash
# Start Replit development server
npm run dev

# Start Warp development server
npm run dev:warp
```

### Production Deployment
```bash
# Deploy to Replit
npm run deploy:replit

# Deploy to Warp
npm run deploy:warp
```

### Manual Sync
```bash
# Full sync
npm run sync

# Platform-specific sync
npx tsx scripts/platform-sync.ts sync --platform=warp
```

## Monitoring and Alerts

### Health Checks

The system performs regular health checks:
- **Every 2 minutes** - Basic health monitoring
- **Every 5 minutes** - Sync status verification
- **Every 6 hours** - Full platform synchronization

### Alert Channels

Configure alerts via:
- Discord webhooks
- Slack notifications
- Email alerts
- GitHub issue creation

### Metrics Tracking

- Sync success rates
- Deployment frequencies
- Error rates and types
- Response times
- Platform availability

## Backup and Recovery

### Automated Backups

- **Daily backups** at 2 AM UTC
- **30-day retention** policy
- **R2 bucket storage** for Warp
- **Local archive creation** for Replit

### Manual Backup
```bash
npm run sync:backup
```

### Recovery Process

1. Identify the backup timestamp
2. Download from R2 or local storage
3. Extract and validate contents
4. Deploy to target platform
5. Verify functionality

## Troubleshooting

### Common Issues

**Sync Failures:**
1. Check environment variables
2. Verify API credentials
3. Review build logs
4. Check network connectivity

**Platform-Specific Issues:**

**Replit:**
- Check `.replit` configuration
- Verify port settings
- Review environment setup

**Warp:**
- Validate `warp.toml` configuration
- Check Cloudflare API tokens
- Verify KV/R2 bindings

### Debug Commands

```bash
# Check sync status
npm run sync:health

# Validate configuration
npx tsx scripts/platform-sync.ts validate

# Force full sync
npx tsx scripts/platform-sync.ts sync --force
```

## Security Considerations

### Secrets Management

- Environment variables encrypted in transit
- Platform-specific secret storage
- Webhook signature verification
- API token rotation

### Access Control

- Authenticated sync endpoints
- Role-based deployment permissions
- Audit logging for all sync operations
- Rate limiting on sync triggers

## Contributing

When making changes that affect sync:

1. Update `sync.config.json` if needed
2. Test on both platforms
3. Update documentation
4. Verify health checks pass
5. Monitor sync status post-deployment

## Support

For sync-related issues:
1. Check the GitHub Actions workflow logs
2. Review health check endpoints
3. Examine sync state files
4. Contact the platform administrators

---

This synchronization system ensures FanzDash remains consistently updated and available across both Replit and Cloudflare Warp platforms, providing redundancy and optimal performance for users worldwide.