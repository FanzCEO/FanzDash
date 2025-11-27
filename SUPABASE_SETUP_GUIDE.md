# 🚀 Supabase Setup Guide for FanzDash

This guide will help you set up and deploy FanzDash on Supabase.

## Prerequisites

- [ ] Node.js 18+ installed
- [ ] Git installed
- [ ] Supabase account (sign up at https://supabase.com)
- [ ] Supabase CLI installed

## Step 1: Install Supabase CLI

```bash
# macOS
brew install supabase/tap/supabase

# or via npm
npm install -g supabase

# Verify installation
supabase --version
```

## Step 2: Create a New Supabase Project

### Option A: Via Supabase Dashboard (Recommended)

1. Go to https://app.supabase.com
2. Click "New Project"
3. Fill in project details:
   - **Name**: FanzDash
   - **Database Password**: (generate a strong password)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier to start
4. Wait for project to be created (~2 minutes)
5. Note your project details from Settings > API:
   - Project URL
   - `anon` public key
   - `service_role` secret key

### Option B: Via CLI

```bash
# Login to Supabase
supabase login

# Link to your project (if exists)
supabase link --project-ref your-project-ref

# Or create new project
supabase projects create FanzDash
```

## Step 3: Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Update the following variables:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-from-dashboard
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database URL (for direct connections)
DATABASE_URL=postgresql://postgres:your-db-password@db.your-project.supabase.co:5432/postgres

# Server
PORT=3000
NODE_ENV=development

# JWT Secret (get from Supabase Dashboard > Settings > API > JWT Secret)
JWT_SECRET=your-jwt-secret-from-supabase
```

## Step 4: Run Database Migrations

### Method 1: Using Supabase CLI (Recommended)

```bash
# Initialize Supabase in project
supabase init

# Link to your project
supabase link --project-ref your-project-ref

# Push migrations to Supabase
supabase db push

# Or run a specific migration
supabase db push --file supabase/migrations/20250130000000_initial_schema.sql
```

### Method 2: Using SQL Editor in Dashboard

1. Go to Supabase Dashboard > SQL Editor
2. Click "New query"
3. Copy contents of `supabase/migrations/20250130000000_initial_schema.sql`
4. Paste into editor
5. Click "Run"
6. Verify tables are created in "Table Editor"

### Method 3: Using Drizzle ORM

```bash
# Generate migration from schema
npm run db:generate

# Push to database
npm run db:push
```

## Step 5: Update Application Code

The application is already configured to use Supabase. Key files:

### Database Connection (`server/db.ts`)

Already uses `DATABASE_URL` environment variable which works with Supabase.

### Authentication

Update `server/auth.ts` to use Supabase Auth:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
)
```

## Step 6: Enable Row Level Security (RLS)

RLS is already configured in the migration file. To verify:

1. Go to Dashboard > Authentication > Policies
2. Check that policies exist for each table
3. Test access control

## Step 7: Configure Storage for Media

### Enable Storage

1. Go to Dashboard > Storage
2. Create buckets:
   - `avatars` (public)
   - `posts` (public/private based on subscription)
   - `streams` (public)
   - `vault` (private - for encrypted content)

### Set Storage Policies

```sql
-- Allow users to upload avatars
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public to read avatars
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Similar policies for posts bucket
CREATE POLICY "Users can upload posts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'posts' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### Update Code to Use Supabase Storage

```typescript
// Upload file
const { data, error } = await supabase.storage
  .from('avatars')
  .upload(`${userId}/avatar.png`, file)

// Get public URL
const { data } = supabase.storage
  .from('avatars')
  .getPublicUrl(`${userId}/avatar.png`)
```

## Step 8: Enable Realtime (Optional)

For live streams and real-time features:

1. Go to Dashboard > Database > Replication
2. Enable replication for tables:
   - `posts`
   - `comments`
   - `live_streams`
   - `messages`

## Step 9: Set Up Edge Functions (Optional)

For serverless functions:

```bash
# Create edge function
supabase functions new my-function

# Deploy
supabase functions deploy my-function
```

## Step 10: Install Dependencies

```bash
# Install Supabase client
npm install @supabase/supabase-js

# Install all dependencies
npm install
```

## Step 11: Run Locally

```bash
# Start Supabase locally (optional)
supabase start

# Run development server
npm run dev
```

## Step 12: Deploy to Production

### Update Production Environment Variables

On your hosting platform (Vercel, Railway, etc.):

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres
NODE_ENV=production
```

### Deploy Application

```bash
# Vercel
vercel --prod

# Or other platform
npm run build
npm start
```

## Verification Checklist

- [ ] Database tables created successfully
- [ ] Row Level Security policies active
- [ ] Storage buckets configured
- [ ] Environment variables set
- [ ] Application connects to database
- [ ] Authentication works
- [ ] File uploads work
- [ ] Real-time features work (if enabled)

## Common Issues & Solutions

### Issue: "relation does not exist"

**Solution**: Make sure migrations ran successfully. Check Table Editor in dashboard.

### Issue: "JWT expired" or auth issues

**Solution**: Verify `JWT_SECRET` matches the one in Supabase Dashboard > Settings > API.

### Issue: RLS blocking queries

**Solution**: Check RLS policies. For development, you can temporarily disable:

```sql
ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;
```

### Issue: Storage upload fails

**Solution**: Check storage policies and bucket permissions.

## Monitoring & Analytics

1. **Dashboard > Logs**: View real-time logs
2. **Dashboard > Reports**: Database performance
3. **Dashboard > Auth**: User activity
4. **Dashboard > API**: API usage

## Backup & Recovery

### Automatic Backups

Supabase Pro plan includes automated daily backups.

### Manual Backup

```bash
# Backup database
supabase db dump > backup.sql

# Restore
psql $DATABASE_URL < backup.sql
```

## Scaling Considerations

### Free Tier Limits

- 500 MB database
- 1 GB bandwidth
- 2 GB storage
- 50,000 monthly active users

### Upgrade Path

1. Pro Plan: $25/month
   - 8 GB database
   - 50 GB bandwidth
   - 100 GB storage

2. Enterprise: Custom pricing
   - Dedicated resources
   - SLA guarantees
   - Priority support

## Security Best Practices

1. ✅ Never expose `service_role` key in client code
2. ✅ Use RLS policies for all tables
3. ✅ Rotate API keys regularly
4. ✅ Enable 2FA on Supabase account
5. ✅ Monitor API logs for suspicious activity
6. ✅ Use prepared statements for queries
7. ✅ Validate all inputs
8. ✅ Rate limit API endpoints

## Additional Resources

- [Supabase Docs](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- [Drizzle ORM Docs](https://orm.drizzle.team)
- [FanzDash Documentation](./README.md)

## Support

For issues:
1. Check [GitHub Issues](https://github.com/FanzCEO/FanzDash/issues)
2. Join Discord community
3. Contact support

---

**Last Updated**: October 30, 2025
**Version**: 1.0.0
