# ⚡ Deploy FanzDash to Production (5 Minutes)

## 🎯 Get Your Platform Online NOW!

Your FanzDash platform is configured and ready. Follow these steps to deploy it to a public URL.

---

## Step 1: Go to Render.com

Open: **https://render.com**

Click: **"Get Started for Free"**

Sign up with: **GitHub** (connect your FanzDash repo)

---

## Step 2: Create Web Service

1. Click: **"New +"** → **"Web Service"**
2. Select: **FanzDash** repository
3. Click: **"Connect"**

---

## Step 3: Configure Deployment

**Settings:**
- Name: `fanzdash`
- Region: `Oregon`
- Branch: `main`
- Runtime: `Node`

**Build:**
- Build Command: `npm install && npm run build`
- Start Command: `npm start`

**Plan:** `Free` or `Starter ($7/mo)`

---

## Step 4: Add Environment Variables

Click **"Advanced"** → Add these:

### Copy and Paste These Variables:

**Core:**
```
NODE_ENV=production
PORT=10000
```

**Supabase (REQUIRED):**
```
SUPABASE_URL=https://eglawbjqtbsofofdqfzr.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnbGF3YmpxdGJzb2ZvZmRxZnpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4NTQ5MDgsImV4cCI6MjA3NzQzMDkwOH0.P-DoPhoIyihzNiM2lflG_kgQy2Hur2mUxGzmM_eXvd4
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnbGF3YmpxdGJzb2ZvZmRxZnpyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTg1NDkwOCwiZXhwIjoyMDc3NDMwOTA4fQ.2zQGIdGbabXOR0P9RSUA3jaZ6C81ooppaWggnl3zTFc
```

**Database:**
```
DATABASE_URL=postgresql://postgres:5McVhFrbVOhUUGB1@db.eglawbjqtbsofofdqfzr.supabase.co:5432/postgres
```

**Security:**
```
JWT_SECRET=yhQl/uEBH5AwmdO5dbcHVwIwmpHUCdxg0s0XUQT549yfkmgO5+RAWzB0xu+s1/hSOHXt86FddVXp5YT1hD4pGw==
ENCRYPTION_KEY=I9PTe2aC8os3t2YXp1C95xs+A+VKpNRW3Kgs2d6YT58=
```

---

## Step 5: Deploy!

Click: **"Create Web Service"**

Wait: **~5 minutes** for build

Your URL will be: `https://fanzdash.onrender.com` (or similar)

---

## ✅ Test Your Live Platform!

Visit your URL and check:

- **Main app:** https://your-app.onrender.com
- **Health check:** https://your-app.onrender.com/healthz
- **System info:** https://your-app.onrender.com/system

---

## 🎉 Done!

Your platform is now live with:
- ✅ HTTPS/SSL certificate
- ✅ Public URL
- ✅ Auto-deploy from GitHub
- ✅ Production database
- ✅ All features operational

---

**Need more details?** See `RENDER_DEPLOYMENT_GUIDE.md`

**Alternative:** See `DIGITALOCEAN_DEPLOYMENT_GUIDE.md` for VPS deployment
