# 🚀 FanzDash Deployment Guide - Render + Supabase

**Recommended Stack**: Render (Full-Stack Hosting) + Supabase (Database + Auth + Storage)

This guide will walk you through deploying FanzDash to production in about 20 minutes.

---

## Why Render + Supabase?

✅ **All-in-One Solution**
- Render handles both frontend AND backend
- No complex serverless configuration
- Persistent Express server (not serverless functions)

✅ **Free to Start**
- Render: Free tier available (with limitations)
- Supabase: Free tier includes 500MB database, 1GB storage

✅ **Auto-Deploy**
- Push to GitHub → Automatic deployment
- No manual build steps

✅ **Production Ready**
- SSL/TLS included
- Environment variable management
- Health checks and monitoring
- Automatic restarts

---

## 📋 Prerequisites

Before starting, make sure you have:

- [x] GitHub account (with FanzDash repository)
- [ ] Render account (sign up at https://render.com)
- [ ] Supabase account (sign up at https://supabase.com)
- [x] All code committed and pushed to GitHub

---

## Part 1: Set Up Supabase (15 minutes)

### Step 1: Create Supabase Project

1. Go to https://app.supabase.com
2. Click **"New Project"**
3. Fill in details:
   - **Name**: FanzDash
   - **Database Password**: Generate strong password (SAVE THIS!)
   - **Region**: Choose closest to your users (e.g., US West)
   - **Plan**: Free tier
4. Wait ~2 minutes for project creation

### Step 2: Get API Credentials

1. Go to **Settings** > **API** in your Supabase dashboard
2. Copy these values (you'll need them for Render):

```bash
# Project URL
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co

# API Keys
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. Go to **Settings** > **API** > **JWT Settings**
4. Copy the **JWT Secret**:

```bash
JWT_SECRET=your-jwt-secret-here
```

### Step 3: Get Database Connection String

1. Go to **Settings** > **Database**
2. Scroll to **Connection String** section
3. Select **URI** tab
4. Copy the connection string:

```bash
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
```

⚠️ **Important**: Replace `[password]` with the database password you created in Step 1!

### Step 4: Run Database Migrations

**Option A: Using Supabase SQL Editor (Easiest)**

1. Go to **SQL Editor** in Supabase dashboard
2. Click **"New query"**
3. Open your local file: `supabase/migrations/20250130000000_initial_schema.sql`
4. Copy the ENTIRE contents (all 1,356 lines)
5. Paste into SQL Editor
6. Click **"Run"** (bottom right)
7. Wait for execution (may take 30-60 seconds)
8. Verify in **Table Editor** - you should see 30+ tables

**Option B: Using Supabase CLI**

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref [your-project-ref]

# Push migrations
supabase db push
```

### Step 5: Configure Storage Buckets

1. Go to **Storage** in Supabase dashboard
2. Create these buckets:

| Bucket Name | Public | Purpose |
|------------|--------|---------|
| `avatars` | ✅ Yes | User profile pictures |
| `posts` | ✅ Yes | User post media |
| `streams` | ✅ Yes | Stream thumbnails |
| `vault` | ❌ No | Private encrypted content |

3. For each bucket, set policies (see SUPABASE_SETUP_GUIDE.md for detailed RLS policies)

**Quick Public Bucket Policy:**
```sql
-- Allow authenticated users to upload
CREATE POLICY "Users can upload own files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public read
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');
```

✅ **Supabase Setup Complete!** Save all your credentials - you'll need them in the next step.

---

## Part 2: Deploy to Render (10 minutes)

### Step 1: Create Render Account

1. Go to https://render.com
2. Click **"Get Started"**
3. Sign up with GitHub (recommended for auto-deploy)

### Step 2: Create New Web Service

1. Click **"New +"** in Render dashboard
2. Select **"Web Service"**
3. Connect your GitHub repository:
   - Click **"Connect account"** if first time
   - Find **FanzDash** repository
   - Click **"Connect"**

### Step 3: Configure Web Service

Fill in the deployment configuration:

**Basic Settings:**
```
Name: fanzdash
Region: Oregon (or closest to your users)
Branch: main
Runtime: Node
```

**Build Settings:**
```
Build Command: npm install && npm run build
Start Command: npm start
```

**Instance Type:**
```
Plan: Free (or Starter if you need more resources)
```

### Step 4: Add Environment Variables

Click **"Advanced"** and add these environment variables:

```bash
# Node Environment
NODE_ENV=production

# Supabase Configuration (from Part 1, Step 2)
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Database (from Part 1, Step 3)
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-us-west-1.pooler.supabase.com:6543/postgres

# JWT Secret (from Part 1, Step 2)
JWT_SECRET=your-jwt-secret-here

# Optional: Add these if you have them
SENDGRID_API_KEY=your-sendgrid-key
STRIPE_SECRET_KEY=your-stripe-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
```

⚠️ **Critical**: Make sure to use your ACTUAL values from Supabase, not the placeholders!

### Step 5: Deploy!

1. Click **"Create Web Service"**
2. Render will:
   - Clone your repository
   - Install dependencies
   - Build your app
   - Start the server
3. Watch the deployment logs (takes 3-5 minutes first time)

### Step 6: Verify Deployment

Once deployed, Render gives you a URL like: `https://fanzdash.onrender.com`

Test these endpoints:

```bash
# Health check
curl https://fanzdash.onrender.com/healthz
# Should return: {"status":"ok","timestamp":"..."}

# System status
curl https://fanzdash.onrender.com/system
# Should return database connection info

# API version
curl https://fanzdash.onrender.com/api/version
# Should return version info
```

✅ **Deployment Complete!** Your app is live!

---

## Part 3: Configure Auto-Deploy (2 minutes)

Render automatically sets up GitHub auto-deploy, but let's verify:

1. Go to your web service in Render dashboard
2. Click **"Settings"**
3. Scroll to **"Build & Deploy"**
4. Verify **"Auto-Deploy"** is set to **"Yes"**

Now every push to `main` branch triggers automatic deployment! 🎉

---

## 🔒 Part 4: Security Checklist

### Essential Security Steps:

- [ ] ✅ All environment variables set in Render (not in code)
- [ ] ✅ `SUPABASE_SERVICE_ROLE_KEY` is SECRET (never expose)
- [ ] ✅ `JWT_SECRET` is strong and random
- [ ] ✅ Database password is strong
- [ ] ✅ Row Level Security (RLS) enabled on all Supabase tables
- [ ] ✅ HTTPS enabled (Render provides this automatically)

### Verify RLS is Active:

```sql
-- Run this in Supabase SQL Editor
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

All tables should show `rowsecurity = true`

---

## 📊 Part 5: Monitoring & Maintenance

### Render Dashboard Monitoring

1. **Logs**: View real-time logs in Render dashboard
2. **Metrics**: CPU, memory, and request metrics
3. **Health Checks**: Automatic health check at `/healthz`
4. **Alerts**: Set up email alerts for downtime

### Supabase Dashboard Monitoring

1. **Database Usage**: Monitor storage and connections
2. **API Requests**: Track API call volume
3. **Auth Users**: Monitor user registrations
4. **Storage**: Track file uploads

### Set Up External Monitoring (Optional)

**UptimeRobot** (Free):
1. Go to https://uptimerobot.com
2. Create monitor for `https://fanzdash.onrender.com/healthz`
3. Set alert interval: 5 minutes
4. Add email notifications

---

## 🚀 Part 6: Testing Your Production App

### Test Authentication Flow

**1. Register a new user:**
```bash
curl -X POST https://fanzdash.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234!",
    "username": "testuser"
  }'
```

**2. Login:**
```bash
curl -X POST https://fanzdash.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234!"
  }'
```

Save the JWT token from response!

**3. Test Protected Route:**
```bash
curl https://fanzdash.onrender.com/api/users/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

### Verify Database

1. Go to Supabase Dashboard > **Table Editor**
2. Open **users** table
3. You should see your test user!

---

## 🎯 Success Metrics

Your deployment is successful when:

- [ ] ✅ Health check endpoint returns 200 OK
- [ ] ✅ User registration works
- [ ] ✅ User login returns valid JWT token
- [ ] ✅ Protected routes require authentication
- [ ] ✅ Data appears in Supabase tables
- [ ] ✅ File uploads work (if tested)
- [ ] ✅ No errors in Render logs

---

## 🐛 Troubleshooting

### Issue: "Cannot connect to database"

**Solution:**
1. Check `DATABASE_URL` is correct in Render environment variables
2. Verify database password is correct (no special characters issues)
3. Check Supabase project is not paused (free tier pauses after inactivity)
4. Test connection from Render logs

### Issue: "Authentication failed"

**Solution:**
1. Verify `JWT_SECRET` is set in Render
2. Check `SUPABASE_ANON_KEY` is correct
3. Review auth logs in Render dashboard
4. Test token generation manually

### Issue: "Build failed"

**Solution:**
1. Check build logs in Render
2. Verify all dependencies are in `package.json`
3. Run `npm install && npm run build` locally to test
4. Check Node.js version compatibility

### Issue: "App crashes on startup"

**Solution:**
1. Check start command is `npm start`
2. Review logs for specific error
3. Verify all required environment variables are set
4. Check PORT is set (Render sets this automatically)

### Issue: "Slow cold starts (Free tier)"

**Expected Behavior:**
- Render free tier "spins down" after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds
- Upgrade to Starter ($7/month) for always-on service

---

## 💰 Pricing Overview

### Render Pricing:
- **Free Tier**:
  - 750 hours/month
  - Spins down after 15 min inactivity
  - Good for testing/demo

- **Starter ($7/month)**:
  - Always on
  - Better performance
  - Recommended for production

### Supabase Pricing:
- **Free Tier**:
  - 500MB database
  - 1GB file storage
  - 50,000 monthly active users
  - Good for starting out

- **Pro ($25/month)**:
  - 8GB database
  - 100GB file storage
  - Automatic backups
  - Recommended for production

**Total Cost to Start**: $0 (both free tiers)
**Production Cost**: ~$32/month (Render Starter + Supabase Pro)

---

## 🎉 Next Steps

Now that you're deployed:

1. **Custom Domain** (Optional):
   - Go to Render dashboard > Settings
   - Add custom domain (e.g., app.fanzdash.com)
   - Follow DNS instructions

2. **Configure Email** (Recommended):
   - Set up SendGrid or similar
   - Add `SENDGRID_API_KEY` to environment variables
   - Test password reset emails

3. **Set Up Analytics** (Recommended):
   - Add Google Analytics
   - Or use Supabase built-in analytics

4. **Enable Payments** (When ready):
   - Set up Stripe account
   - Add Stripe keys to environment variables
   - Test payment flow

5. **Performance Optimization**:
   - Enable CDN for static assets
   - Add Redis caching if needed
   - Monitor and optimize slow queries

---

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [FanzDash Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)
- [FanzDash Quick Start](./QUICK_START.md)
- [Supabase Setup Guide](./SUPABASE_SETUP_GUIDE.md)

---

## 🆘 Need Help?

- **Render Support**: https://render.com/docs/support
- **Supabase Discord**: https://discord.supabase.com
- **GitHub Issues**: https://github.com/FanzCEO/FanzDash/issues

---

**Deployment Status**: 🟢 READY FOR PRODUCTION

**Last Updated**: October 30, 2025

🚀 **You're all set! Time to launch FanzDash!**
