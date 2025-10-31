# 🚀 FanzDash Deployment Checklist

**Date**: October 30, 2025
**Status**: Ready for Deployment
**Version**: 2.0.0

---

## ✅ Completed Pre-Deployment Tasks

- [x] Fix critical TypeScript syntax errors (3/3)
- [x] Install all dependencies (1,010 packages)
- [x] Add Supabase integration
- [x] Fix authentication system (CRITICAL security fix)
- [x] Add proper logging system
- [x] Update database connection
- [x] Create comprehensive database schema (30+ tables)
- [x] Push all changes to GitHub
- [x] Create documentation

---

## 📋 Deployment Steps

### Phase 1: Supabase Setup (30 minutes)

#### Step 1.1: Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Fill in details:
   - **Name**: FanzDash
   - **Database Password**: Generate strong password (save it!)
   - **Region**: Choose closest to your users
   - **Plan**: Start with Free tier
4. Wait for project creation (~2 minutes)

#### Step 1.2: Get API Credentials

1. Go to **Settings** > **API**
2. Copy these values:
   - **Project URL**: `https://[project-ref].supabase.co`
   - **anon public**: Your public API key
   - **service_role**: Your secret API key (⚠️ NEVER expose this)
3. Go to **Settings** > **API** > **JWT Settings**
4. Copy **JWT Secret**

#### Step 1.3: Run Database Migrations

**Option A: Using Supabase CLI (Recommended)**
```bash
# Install CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref [your-project-ref]

# Push migrations
supabase db push
```

**Option B: Using SQL Editor**
1. Go to **SQL Editor** in Supabase Dashboard
2. Click "New query"
3. Copy entire contents of `supabase/migrations/20250130000000_initial_schema.sql`
4. Paste and click "Run"
5. Verify in **Table Editor** that all tables are created

#### Step 1.4: Configure Storage Buckets

1. Go to **Storage** in Supabase Dashboard
2. Create these buckets:

| Bucket Name | Public | Purpose |
|------------|--------|---------|
| `avatars` | Yes | User avatars |
| `posts` | Yes | User post media |
| `streams` | Yes | Stream thumbnails |
| `vault` | No | Encrypted content (admin only) |

3. For each bucket, set up policies (see SUPABASE_SETUP_GUIDE.md)

---

### Phase 2: Environment Configuration (10 minutes)

#### Step 2.1: Configure Local Environment

```bash
# In your project root
cp .env.example .env
```

Edit `.env` and add:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-secret-key

# Database
DATABASE_URL=postgresql://postgres:[password]@db.your-project-ref.supabase.co:5432/postgres

# JWT
JWT_SECRET=your-jwt-secret-from-supabase

# Server
PORT=3000
NODE_ENV=development
```

#### Step 2.2: Test Local Connection

```bash
# Start development server
npm run dev

# Should see:
# ✓ Supabase database connected successfully
# ✓ Server running on http://localhost:3000
```

---

### Phase 3: Production Deployment (20 minutes)

#### Step 3.1: Choose Hosting Platform

**✅ RECOMMENDED: Render + Supabase** (Best for FanzDash)

For detailed step-by-step instructions, see: **[RENDER_DEPLOYMENT_GUIDE.md](./RENDER_DEPLOYMENT_GUIDE.md)**

**Why Render?**
- ✅ Full-stack support (frontend + backend in one place)
- ✅ No serverless complexity (Express runs as persistent service)
- ✅ Free tier to start
- ✅ Auto-deploy from GitHub
- ✅ Perfect for this stack

**Alternative Options**:

1. **Railway** - Great alternative, similar features, $5/month starter
2. **Fly.io** - Good for full-stack apps, more complex setup
3. **Vercel** - Frontend only (not recommended for full-stack Express apps)

#### Step 3.2: Deploy to Render (Recommended)

**Quick Setup** (5 minutes):

1. Go to [render.com](https://render.com) and sign up with GitHub
2. Click **"New +"** → **"Web Service"**
3. Connect your **FanzDash** repository
4. Configure:
   ```
   Name: fanzdash
   Build Command: npm install && npm run build
   Start Command: npm start
   ```
5. Add environment variables (from Supabase setup):
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `NODE_ENV=production`
6. Click **"Create Web Service"**

✅ **That's it!** Render will build and deploy automatically.

📖 **For detailed instructions**: See [RENDER_DEPLOYMENT_GUIDE.md](./RENDER_DEPLOYMENT_GUIDE.md)

#### Step 3.3: Configure Production Environment

In Vercel (or your chosen platform), set these environment variables:

```env
# Supabase (REQUIRED)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG... (⚠️ KEEP SECRET)
DATABASE_URL=postgresql://postgres:...

# JWT (REQUIRED)
JWT_SECRET=your-strong-jwt-secret

# Server (REQUIRED)
NODE_ENV=production
PORT=3000

# Optional: Other services
SENDGRID_API_KEY=your-key
AWS_S3_ACCESS_KEY=your-key
# ... etc
```

---

### Phase 4: Verification & Testing (15 minutes)

#### Step 4.1: Health Checks

Test these endpoints:

```bash
# Health check
curl https://your-domain.vercel.app/healthz

# System status
curl https://your-domain.vercel.app/system

# API version
curl https://your-domain.vercel.app/api/version
```

#### Step 4.2: Authentication Testing

1. **Test Registration**:
   ```bash
   curl -X POST https://your-domain/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"Test1234!"}'
   ```

2. **Test Login**:
   ```bash
   curl -X POST https://your-domain/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"Test1234!"}'
   ```

3. **Test Protected Route**:
   ```bash
   curl https://your-domain/api/users/me \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```

#### Step 4.3: Database Verification

1. Go to Supabase Dashboard > Table Editor
2. Verify data is being created:
   - Check `users` table for new user
   - Check `admin_session_logs` for login events
   - Check `notifications` if applicable

#### Step 4.4: Logging Verification

Check logs in your hosting platform:
```bash
# Vercel
vercel logs

# Or check in Vercel dashboard > Deployments > [latest] > Logs
```

Should see structured logs like:
```
[2025-10-30T20:00:00Z] [INFO] FanzDash-Auth: token-verify: success
[2025-10-30T20:00:01Z] [INFO] FanzDash-DB: query on users
```

---

### Phase 5: Security Hardening (10 minutes)

#### Step 5.1: Enable Row Level Security

Verify RLS is enabled on all tables in Supabase:
```sql
-- Check RLS status
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

All should show `rowsecurity = true`

#### Step 5.2: Review API Keys

1. ✅ `SUPABASE_ANON_KEY` - Safe to expose (used in frontend)
2. ⚠️ `SUPABASE_SERVICE_ROLE_KEY` - NEVER expose (server only)
3. ⚠️ `JWT_SECRET` - NEVER expose
4. ⚠️ `DATABASE_URL` - NEVER expose

#### Step 5.3: Configure CORS

Update `server/index.ts` if needed:
```typescript
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://your-domain.com']
    : ['http://localhost:3000'],
  credentials: true
}));
```

#### Step 5.4: Set Up Rate Limiting

Already configured in the codebase, verify settings:
- Default: 100 requests per 15 minutes per IP
- Auth endpoints: 5 requests per 15 minutes

---

### Phase 6: Monitoring Setup (15 minutes)

#### Step 6.1: Supabase Monitoring

1. Go to **Supabase Dashboard** > **Reports**
2. Monitor:
   - Database size
   - API requests
   - Auth users
   - Storage usage

#### Step 6.2: Application Monitoring

**Option A: Sentry (Recommended)**
```bash
npm install @sentry/node @sentry/tracing

# Add to server/index.ts
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

**Option B: LogTail**
```bash
npm install @logtail/node

# Integrates with your logger
```

#### Step 6.3: Uptime Monitoring

Set up at least one:
1. **UptimeRobot** (Free) - https://uptimerobot.com
2. **Pingdom**
3. **Better Uptime**

Monitor endpoints:
- `https://your-domain.com/healthz`
- `https://your-domain.com/api`

---

## 🎯 Post-Deployment Checklist

### Immediate (After Deploy)

- [ ] Test user registration
- [ ] Test user login
- [ ] Test protected routes
- [ ] Verify database writes
- [ ] Check logs for errors
- [ ] Test file uploads
- [ ] Verify emails send (if configured)

### Within 24 Hours

- [ ] Monitor error rates
- [ ] Check response times
- [ ] Review authentication logs
- [ ] Test from different devices
- [ ] Verify mobile responsiveness
- [ ] Check database performance
- [ ] Review security logs

### Within 1 Week

- [ ] Set up automated backups
- [ ] Configure CDN (if needed)
- [ ] Optimize slow queries
- [ ] Add more comprehensive tests
- [ ] Document API endpoints
- [ ] Create user onboarding flow
- [ ] Set up analytics

---

## 🔧 Troubleshooting

### Issue: "Authentication required" on all requests

**Solution**:
1. Check JWT_SECRET is set correctly
2. Verify token is being sent in Authorization header
3. Check token hasn't expired (default 7 days)
4. Review auth middleware logs

### Issue: Database connection failed

**Solution**:
1. Verify DATABASE_URL is correct
2. Check IP allowlist in Supabase (should allow all)
3. Test connection with `psql` directly
4. Check connection pooling settings

### Issue: CORS errors

**Solution**:
1. Add your frontend domain to CORS whitelist
2. Ensure credentials are allowed
3. Check preflight requests are handled

### Issue: File uploads fail

**Solution**:
1. Verify storage buckets exist
2. Check RLS policies on storage
3. Verify SUPABASE_SERVICE_ROLE_KEY is set
4. Check file size limits

### Issue: High database latency

**Solution**:
1. Add more indexes (check slow query log)
2. Use connection pooling
3. Upgrade Supabase plan if needed
4. Consider caching layer (Redis)

---

## 📊 Success Metrics

After deployment, monitor these:

### Performance
- [ ] API response time < 200ms (p95)
- [ ] Database queries < 50ms average
- [ ] File uploads < 5 seconds
- [ ] Page load time < 2 seconds

### Availability
- [ ] Uptime > 99.9%
- [ ] Error rate < 0.1%
- [ ] Database available 100%

### Security
- [ ] No unauthorized access attempts succeed
- [ ] All API calls logged
- [ ] No exposed secrets in logs
- [ ] SSL/TLS enabled

---

## 🎉 Launch Preparation

### Pre-Launch Checklist

- [ ] All environment variables set
- [ ] Database migrations complete
- [ ] RLS policies active
- [ ] Backups configured
- [ ] Monitoring active
- [ ] Error tracking enabled
- [ ] Performance tested
- [ ] Security audit complete
- [ ] Documentation updated
- [ ] Support channels ready

### Launch Day

1. ✅ Deploy to production
2. ✅ Verify health checks
3. ✅ Monitor error rates (first hour)
4. ✅ Test critical user flows
5. ✅ Check database performance
6. ✅ Review security logs
7. ✅ Announce launch!

---

## 📞 Support Resources

### Documentation
- [Supabase Docs](https://supabase.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [FanzDash Setup Guide](./SUPABASE_SETUP_GUIDE.md)
- [Improvements Summary](./CODEBASE_IMPROVEMENTS_SUMMARY.md)

### Community
- GitHub Issues: https://github.com/FanzCEO/FanzDash/issues
- Supabase Discord: https://discord.supabase.com
- Stack Overflow: Tag `fanzdash`

---

**Deployment Status**: 🟢 READY
**Last Updated**: October 30, 2025
**Next Review**: After first deployment

🚀 **You're ready to deploy FanzDash to production!**
