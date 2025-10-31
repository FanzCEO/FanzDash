# 🚀 FanzDash Deployment Guide - DigitalOcean + Supabase

**Production Stack**: DigitalOcean App Platform (Full-Stack Hosting) + Supabase (Database + Auth + Storage)

Deploy your complete FanzDash application to production in about 25 minutes.

---

## 📊 Why DigitalOcean App Platform + Supabase?

### ✅ Advantages:

1. **Enterprise-Grade Infrastructure**
   - DigitalOcean's proven infrastructure (serving millions of apps)
   - 99.99% SLA uptime guarantee
   - Global CDN included
   - DDoS protection

2. **Full-Stack Support**
   - Node.js backend runs as persistent service
   - Static assets served via CDN
   - WebSocket and real-time support
   - Background workers and cron jobs

3. **Simple, Predictable Pricing**
   - Starting at $5/month
   - No surprise charges
   - Scales with your needs
   - Free bandwidth included

4. **Developer-Friendly**
   - Auto-deploy from GitHub
   - Built-in CI/CD
   - Easy rollbacks
   - Integrated monitoring and logs

5. **Perfect for Supabase**
   - Any region pairing
   - Low latency database access
   - Seamless environment variable management

---

## 💰 Cost Breakdown

### DigitalOcean App Platform:
- **Basic ($5/month)**: 512MB RAM, 1 vCPU - Good for starting
- **Professional ($12/month)**: 1GB RAM, 1 vCPU - Recommended for production
- **Professional Plus ($24/month)**: 2GB RAM, 2 vCPUs - For high traffic

### Supabase:
- **Free Tier**: 500MB database, 1GB storage - Good for testing
- **Pro ($25/month)**: 8GB database, 100GB storage - Recommended for production

### Total Cost:
- **Testing/Development**: $5/month (DO Basic + Supabase Free)
- **Production**: $37/month (DO Professional + Supabase Pro)
- **High Traffic**: $49/month (DO Professional Plus + Supabase Pro)

**Includes**: Hosting, database, auth, storage, CDN, SSL, monitoring, backups

---

## 📋 Prerequisites

- [x] GitHub account with FanzDash repository
- [ ] DigitalOcean account (sign up at https://digitalocean.com)
- [ ] Supabase account (sign up at https://supabase.com)
- [x] All code committed and pushed to GitHub

---

## Part 1: Set Up Supabase (15 minutes)

### Step 1: Create Supabase Project

1. Go to https://app.supabase.com
2. Click **"New Project"**
3. Fill in project details:

```
Organization: Choose or create new
Name: FanzDash
Database Password: [Generate strong password - SAVE THIS!]
Region: US West (or closest to your users)
Pricing Plan: Free (upgrade to Pro when ready)
```

4. Click **"Create new project"**
5. Wait ~2 minutes for provisioning

### Step 2: Collect API Credentials

Navigate to **Settings** > **API** and copy these values:

```bash
# Project URL
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co

# API Keys (anon is public, service_role is SECRET)
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Go to **Settings** > **API** > **JWT Settings**:

```bash
# JWT Secret (KEEP SECRET)
JWT_SECRET=your-super-secret-jwt-key-here
```

### Step 3: Get Database Connection String

Navigate to **Settings** > **Database**:

1. Scroll to **Connection String** section
2. Select **URI** format
3. Toggle **"Display connection pooler"** to ON
4. Copy the connection string:

```bash
DATABASE_URL=postgresql://postgres.[project-ref]:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
```

⚠️ **Replace `[YOUR-PASSWORD]`** with the database password from Step 1!

### Step 4: Run Database Migrations

**Method 1: SQL Editor (Recommended)**

1. Open **SQL Editor** in Supabase dashboard
2. Click **"New query"**
3. Locate your local file: `supabase/migrations/20250130000000_initial_schema.sql`
4. Copy ALL contents (1,356 lines)
5. Paste into SQL Editor
6. Click **"Run"** button
7. Wait for completion (~45 seconds)
8. Verify: Go to **Table Editor** - you should see 30+ tables

**Method 2: Supabase CLI**

```bash
# Install CLI globally
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref [your-project-ref]

# Push all migrations
supabase db push

# Verify
supabase db remote list
```

### Step 5: Configure Storage Buckets

Navigate to **Storage** in Supabase dashboard:

1. Click **"Create bucket"** for each:

| Bucket Name | Public Access | Max File Size | Allowed Types |
|------------|---------------|---------------|---------------|
| `avatars` | ✅ Public | 5MB | image/* |
| `posts` | ✅ Public | 50MB | image/*, video/* |
| `streams` | ✅ Public | 200MB | video/*, image/* |
| `vault` | ❌ Private | 1GB | * |

2. Set up RLS policies for each bucket:

**Example: Avatars Bucket Policies**

```sql
-- Allow authenticated users to upload their own avatars
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own avatars
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING ((storage.foldername(name))[1] = auth.uid()::text);

-- Allow users to delete their own avatars
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING ((storage.foldername(name))[1] = auth.uid()::text);

-- Public read access
CREATE POLICY "Public avatar access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');
```

✅ **Supabase setup complete!** Keep your credentials safe - you'll need them next.

---

## Part 2: Deploy to DigitalOcean (15 minutes)

### Step 1: Create DigitalOcean Account

1. Go to https://www.digitalocean.com
2. Click **"Sign Up"**
3. Choose **"Sign up with GitHub"** (recommended for auto-deploy)
4. Complete verification

💡 **Tip**: Use promo code for free credits (often $200 for 60 days)

### Step 2: Create New App

1. From DigitalOcean dashboard, click **"Create"** → **"Apps"**
2. Or go directly to: https://cloud.digitalocean.com/apps

### Step 3: Connect GitHub Repository

1. Click **"GitHub"** as source
2. Authorize DigitalOcean to access your GitHub (one-time)
3. Select your **FanzDash** repository
4. Choose **main** branch
5. Check **"Autodeploy"** - enables automatic deployments on push

### Step 4: Configure Resources

DigitalOcean will auto-detect your app. Review and adjust:

**Web Service Configuration:**

```yaml
Name: fanzdash-web
Type: Web Service
Build Command: npm install && npm run build
Run Command: npm start
HTTP Port: 3000
HTTP Routes: / (all routes)
```

**Resource Allocation:**

```
Instance Size: Basic ($5/month)
Instance Count: 1
```

💡 **Tip**: Start with Basic, upgrade to Professional later if needed

### Step 5: Add Environment Variables

Click **"Edit"** next to your web service, then scroll to **Environment Variables**:

```bash
# Required: Node Environment
NODE_ENV=production

# Required: Supabase Configuration
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Required: Database
DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-us-west-1.pooler.supabase.com:6543/postgres

# Required: JWT Authentication
JWT_SECRET=your-super-secret-jwt-key

# Optional: Payment Processing
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Optional: Email Service
SENDGRID_API_KEY=SG...

# Optional: AWS S3 (if using additional storage)
AWS_S3_ACCESS_KEY_ID=...
AWS_S3_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=...
AWS_S3_REGION=us-east-1
```

⚠️ **Mark as ENCRYPTED** for all secrets (SUPABASE_SERVICE_ROLE_KEY, JWT_SECRET, etc.)

### Step 6: Configure App Info

**App Name**: fanzdash (or your preferred name)
**Region**: New York (NYC) - or choose closest to your users

Available regions:
- New York (NYC) - US East Coast
- San Francisco (SFO) - US West Coast
- Amsterdam (AMS) - Europe
- Singapore (SGP) - Asia Pacific
- London (LON) - UK/Europe
- Frankfurt (FRA) - Germany/Europe
- Toronto (TOR) - Canada
- Bangalore (BLR) - India

💡 **Tip**: Choose region closest to your Supabase project for lowest latency

### Step 7: Review and Launch

1. Review your configuration summary
2. Click **"Create Resources"**
3. DigitalOcean will:
   - Clone your repository
   - Install dependencies
   - Build your application
   - Deploy to production
   - Assign a URL

⏱️ **First deployment takes 3-5 minutes**

### Step 8: Get Your App URL

Once deployed, you'll receive a URL like:

```
https://fanzdash-xxxxx.ondigitalocean.app
```

This is your live production URL! 🎉

---

## Part 3: Verification & Testing (10 minutes)

### Test 1: Health Check

```bash
curl https://fanzdash-xxxxx.ondigitalocean.app/healthz
```

**Expected response:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-30T20:00:00.000Z",
  "database": "connected"
}
```

### Test 2: System Status

```bash
curl https://fanzdash-xxxxx.ondigitalocean.app/system
```

**Expected response:**
```json
{
  "app": "FanzDash",
  "version": "1.0.0",
  "environment": "production",
  "database": {
    "type": "supabase",
    "status": "connected"
  }
}
```

### Test 3: User Registration

```bash
curl -X POST https://fanzdash-xxxxx.ondigitalocean.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234!",
    "username": "testuser"
  }'
```

**Expected response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid-here",
    "email": "test@example.com",
    "username": "testuser"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Test 4: User Login

```bash
curl -X POST https://fanzdash-xxxxx.ondigitalocean.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234!"
  }'
```

Save the JWT token from the response!

### Test 5: Protected Route

```bash
curl https://fanzdash-xxxxx.ondigitalocean.app/api/users/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

**Expected response:**
```json
{
  "id": "uuid-here",
  "email": "test@example.com",
  "username": "testuser",
  "role": "user"
}
```

### Verify in Supabase

1. Go to **Table Editor** in Supabase dashboard
2. Open **users** table
3. You should see your test user
4. Check **admin_session_logs** for login events

✅ **All tests passing = Successful deployment!**

---

## Part 4: Custom Domain Setup (Optional, 10 minutes)

### Step 1: Add Custom Domain in DigitalOcean

1. Go to your app in DigitalOcean dashboard
2. Click **"Settings"** tab
3. Scroll to **"Domains"**
4. Click **"Add Domain"**
5. Enter your domain: `app.fanzdash.com`

### Step 2: Configure DNS

DigitalOcean will provide DNS records. Add these to your domain provider:

**Option A: Use DigitalOcean Nameservers (Easiest)**
```
ns1.digitalocean.com
ns2.digitalocean.com
ns3.digitalocean.com
```

**Option B: Add CNAME Record**
```
Type: CNAME
Name: app (or www)
Value: fanzdash-xxxxx.ondigitalocean.app
TTL: 3600
```

### Step 3: Wait for DNS Propagation

- Takes 5-60 minutes
- Check status at: https://dnschecker.org

### Step 4: Enable SSL/TLS

DigitalOcean automatically provisions SSL certificate via Let's Encrypt. No configuration needed!

✅ **Your app is now live at your custom domain with HTTPS!**

---

## 🔒 Part 5: Security Hardening

### Critical Security Checklist:

- [ ] ✅ All secrets stored in DO environment variables (encrypted)
- [ ] ✅ `SUPABASE_SERVICE_ROLE_KEY` never exposed in frontend code
- [ ] ✅ `JWT_SECRET` is long and random (min 32 characters)
- [ ] ✅ Database password is strong (min 16 characters)
- [ ] ✅ Row Level Security (RLS) enabled on ALL Supabase tables
- [ ] ✅ HTTPS/SSL enabled (automatic with DO)
- [ ] ✅ CORS configured properly in server code
- [ ] ✅ Rate limiting enabled
- [ ] ✅ Input validation on all endpoints
- [ ] ✅ SQL injection prevention (using Drizzle ORM ✓)

### Verify RLS is Active:

Run in Supabase SQL Editor:

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

All tables should show `rowsecurity = true` ✓

### Review Storage Bucket Policies:

1. Go to **Storage** > **Policies** in Supabase
2. Verify each bucket has appropriate RLS policies
3. Test unauthorized access is denied

---

## 📊 Part 6: Monitoring & Observability

### DigitalOcean Built-in Monitoring

**Access Logs:**
1. Go to your app dashboard
2. Click **"Runtime Logs"** tab
3. View real-time application logs

**Performance Metrics:**
1. Click **"Insights"** tab
2. Monitor:
   - CPU usage
   - Memory usage
   - Request rate
   - Response time
   - Error rate

**Alerts:**
1. Click **"Settings"** > **"Alerts"**
2. Configure email alerts for:
   - High error rate
   - High response time
   - Deployment failures
   - Resource exhaustion

### Supabase Monitoring

**Database Dashboard:**
1. Go to **Reports** in Supabase
2. Monitor:
   - Database size and growth
   - Connection count
   - Query performance
   - API request volume

**Auth Monitoring:**
1. Go to **Authentication** > **Users**
2. Track:
   - New user registrations
   - Active users
   - Failed login attempts

**Storage Usage:**
1. Go to **Storage** > **Usage**
2. Monitor:
   - Storage used vs. limit
   - Bandwidth usage
   - File upload trends

### External Monitoring (Recommended)

**Option 1: UptimeRobot (Free)**

1. Sign up at https://uptimerobot.com
2. Add monitor:
   ```
   Type: HTTP(S)
   URL: https://your-app.ondigitalocean.app/healthz
   Interval: 5 minutes
   ```
3. Set up email/SMS alerts

**Option 2: Better Uptime**

1. Sign up at https://betteruptime.com
2. More advanced features
3. Status page included

**Option 3: Sentry (Error Tracking)**

```bash
npm install @sentry/node @sentry/tracing
```

Add to `server/index.ts`:

```typescript
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

---

## 🚀 Part 7: CI/CD & Deployment Workflow

### Auto-Deploy is Already Configured!

Every push to `main` branch triggers automatic deployment:

```bash
# Make changes locally
git add .
git commit -m "Add new feature"
git push origin main

# DigitalOcean automatically:
# 1. Detects the push
# 2. Runs build
# 3. Runs tests (if configured)
# 4. Deploys new version
# 5. Performs health check
# 6. Switches traffic to new version
```

### View Deployment History

1. Go to your app dashboard
2. Click **"Deployments"** tab
3. See all deployments with:
   - Commit hash
   - Deploy time
   - Status (success/failed)
   - Logs

### Rollback to Previous Version

If something goes wrong:

1. Click **"Deployments"** tab
2. Find the last good deployment
3. Click **"⋮"** menu → **"Rollback"**
4. Confirm rollback
5. Previous version goes live in seconds

### Preview Deployments (Optional)

Create preview environments for branches:

1. Go to **"Settings"** > **"App-Level Settings"**
2. Enable **"Deploy Preview Apps"**
3. Choose branches to auto-deploy
4. Each PR gets its own preview URL!

---

## 🔧 Troubleshooting

### Issue: "Build Failed"

**Check build logs:**
1. Go to **"Deployments"** tab
2. Click failed deployment
3. Review build logs

**Common causes:**
- Missing dependencies in `package.json`
- Node version mismatch
- Build command errors

**Solution:**
```bash
# Test build locally first
npm install
npm run build

# If successful locally, check Node version
node --version

# Update engines in package.json if needed
{
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### Issue: "Cannot connect to database"

**Check:**
1. `DATABASE_URL` is set correctly in environment variables
2. Database password doesn't contain special characters needing URL encoding
3. Supabase project is active (not paused)

**Solution:**
```bash
# Test connection from DigitalOcean console
curl https://your-app.ondigitalocean.app/system

# Check Supabase status
https://status.supabase.com
```

### Issue: "Authentication Failed"

**Check:**
1. `JWT_SECRET` is set in environment variables
2. `SUPABASE_ANON_KEY` matches Supabase dashboard
3. Token is being sent in Authorization header

**Solution:**
Review logs for specific error:
```bash
# Check runtime logs in DO dashboard
# Look for auth-related errors
```

### Issue: "High Memory Usage / App Crashes"

**Upgrade instance size:**
1. Go to **"Settings"**
2. Change from Basic to Professional
3. Click **"Save"**
4. App will restart with more resources

### Issue: "Slow Performance"

**Solutions:**
1. **Enable database connection pooling** (already configured in codebase)
2. **Add caching layer** (Redis)
3. **Optimize database queries** (add indexes)
4. **Use CDN for static assets** (DO includes this)
5. **Upgrade instance size**

---

## 💵 Cost Optimization Tips

### Free/Low-Cost Development

```
DigitalOcean: Basic ($5/month)
Supabase: Free tier
Total: $5/month
```

Good for: Development, testing, low-traffic apps

### Production (Recommended)

```
DigitalOcean: Professional ($12/month)
Supabase: Pro ($25/month)
Total: $37/month
```

Includes:
- 1GB RAM, 1 vCPU
- 8GB database
- 100GB storage
- Automatic backups
- Email support

### High Traffic / Scale

```
DigitalOcean: Professional Plus ($24/month)
Supabase: Pro ($25/month) + Add-ons
CDN: Included
Total: ~$50-100/month
```

### Ways to Save:

1. **Start small, scale up** - Begin with Basic plan
2. **Use Supabase free tier** during development
3. **Optimize queries** - Reduce database costs
4. **Cache aggressively** - Reduce compute costs
5. **Monitor usage** - Catch unexpected costs early

---

## 📈 Scaling Your App

### Horizontal Scaling (More Instances)

1. Go to your app **"Settings"**
2. Under **"Resources"**, adjust **"Instance Count"**
3. Increase from 1 to 2, 3, etc.
4. Load balancing is automatic

### Vertical Scaling (Bigger Instances)

1. Go to **"Settings"** > **"Resources"**
2. Change **"Instance Size"**:
   - Basic: 512MB RAM
   - Professional: 1GB RAM
   - Professional Plus: 2GB RAM

### Add Background Workers

Edit `.do/app.yaml` to add workers:

```yaml
workers:
  - name: analytics-worker
    build_command: npm install
    run_command: node dist/workers/analytics.js
    instance_count: 1
    instance_size_slug: basic-xxs
```

### Add Scheduled Jobs

Edit `.do/app.yaml` for cron jobs:

```yaml
jobs:
  - name: daily-cleanup
    run_command: node dist/jobs/cleanup.js
    schedule: "0 0 * * *"  # Daily at midnight
```

### Add Redis for Caching

1. Go to **"Create"** > **"Databases"**
2. Create Redis cluster
3. Add `REDIS_URL` to your app's environment variables
4. Update code to use Redis for caching

---

## 🎯 Production Launch Checklist

### Pre-Launch (Complete these before going live):

- [ ] ✅ All environment variables set correctly
- [ ] ✅ Database migrations applied
- [ ] ✅ RLS policies active on all tables
- [ ] ✅ Storage buckets configured with policies
- [ ] ✅ SSL certificate active (automatic)
- [ ] ✅ Custom domain configured (if applicable)
- [ ] ✅ Monitoring and alerts set up
- [ ] ✅ Error tracking configured (Sentry recommended)
- [ ] ✅ Backup strategy in place
- [ ] ✅ Load testing completed
- [ ] ✅ Security audit passed
- [ ] ✅ Performance optimized
- [ ] ✅ Documentation updated

### Launch Day:

1. ✅ Deploy to production
2. ✅ Verify all health checks pass
3. ✅ Test critical user flows
4. ✅ Monitor error rates (should be < 0.1%)
5. ✅ Check performance metrics
6. ✅ Review logs for issues
7. ✅ Announce launch! 🎉

### Post-Launch (First 24 hours):

- [ ] Monitor error rates continuously
- [ ] Check performance metrics every hour
- [ ] Review user feedback
- [ ] Watch database performance
- [ ] Check storage usage
- [ ] Monitor costs
- [ ] Be ready to rollback if needed

---

## 📚 Additional Resources

### Official Documentation:
- [DigitalOcean App Platform Docs](https://docs.digitalocean.com/products/app-platform/)
- [Supabase Documentation](https://supabase.com/docs)
- [App Platform Pricing](https://www.digitalocean.com/pricing/app-platform)

### FanzDash Documentation:
- [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)
- [Supabase Setup Guide](./SUPABASE_SETUP_GUIDE.md)
- [Quick Start Guide](./QUICK_START.md)
- [Render Deployment Guide](./RENDER_DEPLOYMENT_GUIDE.md)

### Support Channels:
- **DigitalOcean Support**: https://www.digitalocean.com/support
- **Supabase Discord**: https://discord.supabase.com
- **GitHub Issues**: https://github.com/FanzCEO/FanzDash/issues

---

## 🆘 Getting Help

### DigitalOcean Support

**Community (Free):**
- https://www.digitalocean.com/community

**Email Support:**
- Included with paid plans
- Response time: 24-48 hours

**Priority Support:**
- Available with Professional+ plans
- Faster response times

### Supabase Support

**Discord (Free):**
- Very active community
- https://discord.supabase.com

**Email Support:**
- Included with Pro plan
- support@supabase.io

**GitHub Issues:**
- https://github.com/supabase/supabase/issues

---

**🎉 Congratulations! You're now running FanzDash on enterprise-grade infrastructure!**

**Deployment Status**: 🟢 PRODUCTION READY

**Last Updated**: October 30, 2025

**Next Steps**: Monitor your app, gather user feedback, and iterate! 🚀
