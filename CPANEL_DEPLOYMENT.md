# FanzDash cPanel Deployment Guide

## Prerequisites

1. **cPanel Account** with:
   - Node.js support (Node.js 22.x required)
   - PostgreSQL database access
   - Git deployment or File Manager access
   - Sufficient disk space (2GB+ recommended)

2. **Domain/Subdomain** configured in cPanel

## Deployment Methods

### Method 1: Git Deployment (Recommended)

#### Step 1: Setup Git Repository in cPanel

1. Log into cPanel
2. Go to **Git Version Control**
3. Click **Create**
4. Fill in:
   - **Clone URL**: `https://github.com/FanzCEO/FANZ-Unified-Ecosystem.git`
   - **Repository Path**: `repositories/fanzdash`
   - **Repository Name**: `fanzdash`
5. Click **Create**

#### Step 2: Configure Git Deployment

1. In cPanel Git interface, click **Manage** on your repository
2. Note the deployment path (e.g., `/home/username/repositories/fanzdash`)
3. The `.cpanel.yml` file will automate the deployment

#### Step 3: Update .cpanel.yml

Edit `.cpanel.yml` and replace `username` with your cPanel username:

```yaml
deployment:
  tasks:
    - export DEPLOYPATH=/home/YOUR_CPANEL_USERNAME/public_html/fanzdash
```

#### Step 4: Push to Repository

```bash
cd /Users/joshuastone/FANZ-Unified-Ecosystem/fanzdash
git add .cpanel.yml
git commit -m "Add cPanel deployment configuration"
git push origin main
```

#### Step 5: Pull Updates in cPanel

1. Go to **Git Version Control** in cPanel
2. Click **Manage** on your repository
3. Click **Pull or Deploy** → **Update from Remote**
4. Wait for deployment to complete

---

### Method 2: Manual Upload (Alternative)

#### Step 1: Build Locally

```bash
cd /Users/joshuastone/FANZ-Unified-Ecosystem/fanzdash
pnpm install
pnpm run build
```

#### Step 2: Prepare Upload Package

Create a deployment package:

```bash
# Create a zip with necessary files
zip -r fanzdash-deploy.zip \
  dist/ \
  node_modules/ \
  package.json \
  .env.example \
  server/ \
  -x "*.git*" "*.DS_Store"
```

#### Step 3: Upload to cPanel

1. Log into cPanel
2. Go to **File Manager**
3. Navigate to `public_html/`
4. Create folder: `fanzdash`
5. Upload `fanzdash-deploy.zip`
6. Extract the zip file

---

## Database Setup in cPanel

### Step 1: Create PostgreSQL Database

1. Log into cPanel
2. Go to **PostgreSQL Databases**
3. Create Database:
   - Database Name: `fanzdash_db`
   - Click **Create Database**
4. Create User:
   - Username: `fanzdash_user`
   - Password: (generate strong password)
   - Click **Create User**
5. Add User to Database:
   - Select user and database
   - Grant **ALL PRIVILEGES**

### Step 2: Enable Extensions

Connect to database via **phpPgAdmin** or terminal:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
```

### Step 3: Run Migrations

Upload and run migration files:

```bash
# Via SSH (if available)
cd /home/username/public_html/fanzdash
psql -U fanzdash_user -d fanzdash_db -f server/migrations/001_analytics_oauth_workflows.sql
```

Or use **phpPgAdmin** to import the SQL file directly.

---

## Node.js App Setup in cPanel

### Step 1: Setup Node.js Application

1. Log into cPanel
2. Go to **Setup Node.js App**
3. Click **Create Application**
4. Configure:
   - **Node.js version**: 22.12.0 (or latest 22.x)
   - **Application mode**: Production
   - **Application root**: `fanzdash`
   - **Application URL**: `fanzdash.yourdomain.com` (or subdomain)
   - **Application startup file**: `dist/index.js`
5. Click **Create**

### Step 2: Set Environment Variables

In the Node.js App interface:

1. Scroll to **Environment Variables**
2. Add these variables (one by one):

```bash
NODE_ENV=production
DATABASE_URL=postgresql://fanzdash_user:PASSWORD@localhost/fanzdash_db
PORT=3000
BASE_URL=https://fanzdash.yourdomain.com
CLIENT_URL=https://fanzdash.yourdomain.com
SESSION_SECRET=generate-random-secret-here
JWT_SECRET=generate-random-secret-here

# Add all other variables from .env.example
```

### Step 3: Install Dependencies

```bash
# Via SSH
cd /home/username/public_html/fanzdash
source /home/username/nodevenv/public_html/fanzdash/22/bin/activate
npm install -g pnpm
pnpm install --prod
```

Or use the **Run NPM Install** button in cPanel Node.js App interface.

### Step 4: Start Application

1. Click **Stop App** if running
2. Click **Start App**
3. Check status shows "Running"
4. Note the port number assigned (usually 3000 or random high port)

---

## SSL Certificate Setup

### Option 1: Let's Encrypt (Free)

1. Go to **SSL/TLS Status** in cPanel
2. Select your domain
3. Click **Run AutoSSL**
4. Wait for certificate to be issued
5. Update `.env`:
   ```bash
   BASE_URL=https://fanzdash.yourdomain.com
   CLIENT_URL=https://fanzdash.yourdomain.com
   ```

### Option 2: Manual SSL

1. Go to **SSL/TLS** → **Manage SSL Sites**
2. Upload your certificate and private key
3. Click **Install Certificate**

---

## Proxy Setup (Connect Domain to Node.js App)

### Method 1: Using .htaccess

Create `/home/username/public_html/fanzdash/.htaccess`:

```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]
```

### Method 2: Apache Proxy (Requires Root Access)

Contact your hosting provider to enable proxy module and add:

```apache
ProxyPass / http://localhost:3000/
ProxyPassReverse / http://localhost:3000/
```

---

## File Permissions

Set correct permissions via SSH or File Manager:

```bash
cd /home/username/public_html/fanzdash
chmod 755 .
chmod 644 .env
chmod -R 755 dist/
chmod -R 755 server/
```

---

## Environment Configuration

### Create .env File

1. Copy `.env.example` to `.env`
2. Update with cPanel-specific values:

```bash
# Database (from cPanel PostgreSQL)
DATABASE_URL=postgresql://fanzdash_user:YOUR_PASSWORD@localhost:5432/fanzdash_db

# Server
NODE_ENV=production
PORT=3000
BASE_URL=https://fanzdash.yourdomain.com
CLIENT_URL=https://fanzdash.yourdomain.com

# Security (generate random strings)
SESSION_SECRET=your-random-session-secret-here
JWT_SECRET=your-random-jwt-secret-here
ENCRYPTION_KEY=your-32-char-encryption-key-here
ENCRYPTION_IV=your-16-char-iv-here

# OAuth (from providers)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-secret
GOOGLE_REDIRECT_URI=https://fanzdash.yourdomain.com/api/oauth/google/callback

# Continue with all other OAuth providers...
# See DEPLOYMENT_GUIDE.md for full OAuth setup
```

---

## Testing the Deployment

### 1. Check App Status

In cPanel Node.js App interface:
- Status should show "Running"
- No errors in Application Logs

### 2. Test Health Endpoint

```bash
curl https://fanzdash.yourdomain.com/api/health
# Expected: {"status":"ok","timestamp":"..."}
```

### 3. Check Browser

Visit: `https://fanzdash.yourdomain.com`
- Frontend should load
- No console errors

### 4. Test Database Connection

Check logs in cPanel Node.js App → Application Logs:
- Should see "Database connected"
- No connection errors

---

## Troubleshooting

### App Won't Start

**Check Application Logs** in cPanel:

1. Go to **Setup Node.js App**
2. Click **Edit** on your app
3. Scroll to **Application Logs**
4. Look for error messages

Common fixes:
- Verify Node.js version matches (22.x)
- Check `dist/index.js` exists (run `pnpm run build`)
- Verify all environment variables are set
- Check database credentials

### Database Connection Failed

1. Verify database exists: cPanel → **PostgreSQL Databases**
2. Check user has privileges
3. Test connection string format:
   ```
   postgresql://username:password@localhost:5432/database_name
   ```
4. Ensure extensions are installed (uuid-ossp)

### Port Already in Use

1. cPanel assigns a random port if 3000 is taken
2. Check assigned port in Node.js App interface
3. Update .htaccess proxy to use correct port

### 404 Errors

1. Check `.htaccess` is in correct directory
2. Verify RewriteEngine is enabled
3. Check Application Root path matches

### Permission Denied

```bash
chmod 755 /home/username/public_html/fanzdash
chmod 644 .env
chmod -R 755 dist/
```

---

## Updating the Application

### Via Git (Recommended)

1. Make changes locally
2. Commit and push to repository
3. In cPanel Git Version Control:
   - Click **Manage** → **Pull or Deploy**
   - Click **Update from Remote**
4. Restart Node.js app:
   - Go to **Setup Node.js App**
   - Click **Restart**

### Manual Update

1. Build locally: `pnpm run build`
2. Upload changed files via File Manager
3. Restart Node.js app in cPanel

---

## Monitoring and Maintenance

### Application Logs

Check regularly in cPanel → **Setup Node.js App** → **Application Logs**

### Error Logs

Check in cPanel → **Metrics** → **Errors**

### Resource Usage

Monitor in cPanel → **Metrics** → **Resource Usage**

### Restart App

If app becomes unresponsive:
1. Go to **Setup Node.js App**
2. Click **Stop App**
3. Wait 5 seconds
4. Click **Start App**

---

## Performance Optimization

### 1. Enable Node.js Production Mode

Verify in `.env`:
```bash
NODE_ENV=production
```

### 2. Use Process Manager

Consider using PM2 via SSH:
```bash
npm install -g pm2
pm2 start dist/index.js --name fanzdash
pm2 save
```

### 3. Enable Caching

Add to `.htaccess`:
```apache
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

---

## Security Checklist

- [ ] SSL certificate installed and active
- [ ] `.env` file has permissions 644 (not world-readable)
- [ ] Database user has only necessary privileges
- [ ] Strong passwords for database and sessions
- [ ] OAuth redirect URIs match production domain
- [ ] Rate limiting enabled in app
- [ ] Firewall configured (if available)
- [ ] Regular backups scheduled

---

## Backup Strategy

### Automated Backups in cPanel

1. Go to **Backup** in cPanel
2. Enable automatic backups (if available)
3. Set backup frequency: Daily or Weekly

### Manual Backup

```bash
# Database backup
pg_dump -U fanzdash_user fanzdash_db > fanzdash_backup_$(date +%Y%m%d).sql

# Application files backup
tar -czf fanzdash_files_$(date +%Y%m%d).tar.gz /home/username/public_html/fanzdash
```

---

## Support

- **cPanel Documentation**: Check your hosting provider's cPanel docs
- **Node.js in cPanel**: https://docs.cpanel.net/knowledge-base/web-services/guide-to-nodejs/
- **FanzDash Issues**: GitHub repository issues

---

## Quick Reference Commands

```bash
# SSH into server
ssh username@yourdomain.com

# Navigate to app directory
cd /home/username/public_html/fanzdash

# Activate Node.js environment
source /home/username/nodevenv/public_html/fanzdash/22/bin/activate

# Install dependencies
pnpm install --prod

# Build application
pnpm run build

# Check app status
pm2 status

# View logs
pm2 logs fanzdash

# Restart app
pm2 restart fanzdash
```

---

**Deployment Status**: Ready for cPanel ✅

Remember to update all environment variables and OAuth redirect URIs to match your production domain!
