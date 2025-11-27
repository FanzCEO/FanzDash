# Render Environment Variables Setup

## Required Environment Variables for FanzDash

Add all of these environment variables in the Render Dashboard under **Settings → Environment**:

### Node.js Configuration
```
NODE_ENV=production
PORT=10000
NODE_OPTIONS=--dns-result-order=ipv4first
```

**IMPORTANT:** The `NODE_OPTIONS` variable is critical for Render deployment. It forces Node.js to use IPv4 addresses only, resolving the WebSocket connection issue.

### Supabase Configuration
```
SUPABASE_URL=https://eglawbjqtbsofofdqfzr.supabase.co

SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnbGF3YmpxdGJzb2ZvZmRxZnpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4NTQ5MDgsImV4cCI6MjA3NzQzMDkwOH0.P-DoPhoIyihzNiM2lflG_kgQy2Hur2mUxGzmM_eXvd4

SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnbGF3YmpxdGJzb2ZvZmRxZnpyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTg1NDkwOCwiZXhwIjoyMDc3NDMwOTA4fQ.2zQGIdGbabXOR0P9RSUA3jaZ6C81ooppaWggnl3zTFc

DATABASE_URL=postgresql://postgres:5McVhFrbVOhUUGB1@db.eglawbjqtbsofofdqfzr.supabase.co:5432/postgres
```

### Security Keys
```
JWT_SECRET=yhQl/uEBH5AwmdO5dbcHVwIwmpHUCdxg0s0XUQT549yfkmgO5+RAWzB0xu+s1/hSOHXt86FddVXp5YT1hD4pGw==

ENCRYPTION_KEY=I9PTe2aC8os3t2YXp1C95xs+A+VKpNRW3Kgs2d6YT58=
```

---

## How to Add Environment Variables in Render

1. Go to your Render Dashboard: https://dashboard.render.com
2. Click on your service: **FanzDash**
3. Go to **Settings** tab
4. Scroll down to **Environment** section
5. Click **Add Environment Variable** button
6. Add each variable one by one, or use the "Add from file" option if available

---

## Critical Fix for IPv6 Issues

**The Problem:** Render doesn't support IPv6 connections, but Supabase resolves to IPv6 addresses by default.

**The Solution:** Add `NODE_OPTIONS=--dns-result-order=ipv4first` to force IPv4-only DNS resolution.

This environment variable must be set BEFORE the first deployment, or you'll need to redeploy after adding it.

---

## Verification

After adding all environment variables, check that your service is using them:

```bash
# In Render logs, you should see:
# "Using Node.js version 22.21.1"
# "Connecting to Supabase database using node-postgres"
# "Supabase database connected successfully"
```

If you see IPv6 address errors (like `2600:1f18:...`), the `NODE_OPTIONS` variable is not set or not applied.

---

## After Environment Setup

Once all variables are configured:

1. **Redeploy your service** (if already deployed) to apply the changes
2. **Monitor the logs** for successful database connection
3. **Test the API endpoints** to verify real data is being served

---

## Common Issues

### Issue: Still seeing IPv6 errors
**Solution:** Make sure `NODE_OPTIONS` is set and redeploy the service.

### Issue: "Cannot find module pg"
**Solution:** This shouldn't happen if you installed `pg` in package.json. Check your build logs.

### Issue: Dashboard stats returning 500 errors
**Solution:** Database connection is failing. Check that `DATABASE_URL` is correctly set and that the `NODE_OPTIONS` fix is applied.

