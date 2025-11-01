# cPanel Deployment Guide for FANZDash

**Date:** November 1, 2025  
**Version:** Production Ready

---

## 📋 Prerequisites

- cPanel account with Node.js support
- Git deployment enabled
- Node.js 20+ installed
- PostgreSQL or MySQL database
- SSL certificate (recommended)

---

## 🚀 Deployment Steps

### 1. Set Up Git Deployment in cPanel

1. **Enable Git Version Control:**
   - Login to cPanel
   - Go to **Git Version Control**
   - Click **Create**
   - Repository URL: `https://github.com/FanzCEO/FanzDash.git`
   - Repository Path: `/home/fanzunlimited/repositories/fanzdash`
   - Click **Create**

2. **Pull Latest Code:**
   - Click **Manage** on your repository
   - Click **Pull or Deploy** → **Update from Remote**

### 2. Configure Node.js Application

1. **Set Up Node.js:**
   - Go to **Setup Node.js App**
   - Click **Create Application**
   - Node.js Version: `20.x` or higher
   - Application Mode: `Production`
   - Application Root: `/home/fanzunlimited/public_html`
   - Application URL: Your domain
   - Application Startup File: `dist/index.js`

2. **Environment Variables:**
   Click **Environment Variables** and add:
   ```
   NODE_ENV=production
   DATABASE_URL=postgresql://user:password@host:5432/database
   JWT_SECRET=your-super-secret-jwt-key-change-this
   SESSION_SECRET=your-session-secret-key
   CSRF_SECRET=your-csrf-secret-key
   
   # Analytics (Optional)
   GOOGLE_TAG_MANAGER_ID=GTM-T8PDS7HX
   GOOGLE_ANALYTICS_ID=G-4L5HSFR0W5
   
   # OAuth (Optional)
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GITHUB_CLIENT_ID=your-github-client-id
   GITHUB_CLIENT_SECRET=your-github-client-secret
   
   # Payment (Optional)
   STRIPE_SECRET_KEY=your-stripe-secret-key
   
   # AI (Optional)
   OPENAI_API_KEY=your-openai-api-key
   ```

### 3. Database Setup

**If using Supabase (Recommended):**
1. Database URL already configured
2. Migrations already applied
3. IPv4 add-on enabled

**If using cPanel MySQL:**
1. Create database in cPanel
2. Update DATABASE_URL to MySQL format:
   ```
   DATABASE_URL=mysql://user:password@localhost:3306/database
   ```
3. Run migrations manually

### 4. Build and Deploy

The `.cpanel.yml` file handles automatic deployment:

```yaml
deployment:
  tasks:
    - Install dependencies
    - Build application
    - Copy files to public directory
    - Set permissions
    - Restart Node.js app
```

**Manual Build (if needed):**
```bash
cd /home/fanzunlimited/public_html
npm install
npm run build
```

### 5. SSL Certificate

1. Go to **SSL/TLS Status**
2. Enable **AutoSSL** for your domain
3. Or install **Let's Encrypt** certificate

### 6. Domain Configuration

1. **Point Domain:**
   - Update DNS A record to cPanel server IP
   - Wait for DNS propagation (up to 48 hours)

2. **Configure in cPanel:**
   - Go to **Domains**
   - Add your domain
   - Point to `/home/fanzunlimited/public_html`

---

## 🔧 Post-Deployment Configuration

### 1. Database Initialization

If using fresh database, run migrations:
```bash
cd /home/fanzunlimited/public_html
npm run db:push
```

### 2. Create Super Admin

The super admin should already exist if using Supabase:
- Email: `admin@fanzunlimited.com`
- Password: `FanzDash2024!SecurePass`

If not, create manually via SQL or registration API.

### 3. Configure Analytics

1. Navigate to: `https://yourdomain.com/seo-configuration`
2. Enter GTM ID: `GTM-T8PDS7HX`
3. Enter GA ID: `G-4L5HSFR0W5`
4. Click "Save Settings"

---

## 📊 Verification Checklist

After deployment, test:

- [ ] Homepage loads
- [ ] Login works
- [ ] Dashboard displays
- [ ] Database queries work
- [ ] SEO settings save
- [ ] GTM tracking active
- [ ] Chat functions
- [ ] Quantum War Room loads
- [ ] API integrations test successfully

---

## 🔍 Troubleshooting

### Build Fails
```bash
# Check Node.js version
node --version  # Should be 20+

# Clean and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### Application Won't Start
```bash
# Check logs
tail -f /home/fanzunlimited/logs/fanzdash-error.log

# Restart application
ea-nodejs restart
```

### Database Connection Fails
- Verify DATABASE_URL is correct
- Check database is accessible from cPanel server
- Test connection: `psql $DATABASE_URL -c "SELECT 1"`

### SSL Issues
- Verify SSL certificate is installed
- Check domain points to correct IP
- Force HTTPS redirect in .htaccess

---

## 📁 File Structure

```
/home/fanzunlimited/
├── public_html/           # Application files
│   ├── dist/              # Built application
│   ├── node_modules/      # Dependencies
│   ├── .env               # Environment variables
│   └── ...
├── repositories/          # Git repository
│   └── fanzdash/
└── logs/                  # Application logs
    ├── fanzdash-error.log
    └── fanzdash-access.log
```

---

## 🔄 Updating the Application

### Automatic (via Git)
1. Push changes to GitHub
2. Go to cPanel **Git Version Control**
3. Click **Manage** → **Pull or Deploy**
4. Click **Update from Remote**
5. Application rebuilds automatically

### Manual
```bash
cd /home/fanzunlimited/repositories/fanzdash
git pull origin main
cd /home/fanzunlimited/public_html
npm install
npm run build
ea-nodejs restart
```

---

## 🛡️ Security Recommendations

1. **Environment Variables:**
   - Never commit .env to Git
   - Use strong secrets for JWT/Session/CSRF
   - Rotate keys regularly

2. **File Permissions:**
   - Set 755 for directories
   - Set 644 for files
   - Protect .env file (600)

3. **Database:**
   - Use SSL connections
   - Limit database user permissions
   - Enable backups

4. **Firewall:**
   - Allow ports 80 (HTTP) and 443 (HTTPS)
   - Block direct database access
   - Enable cPanel firewall

---

## 📞 Support

**cPanel Documentation:** https://docs.cpanel.net/  
**Node.js on cPanel:** https://docs.cpanel.net/ea4/ea-nodejs/

**FANZDash Documentation:**
- `PRODUCTION_READY_CHECKLIST.md`
- `ALL_FIXES_APPLIED.md`
- `docs/PRODUCTION_LOGIN_INFO.md`

---

## ✅ Deployment Complete!

Your FANZDash application is now ready for cPanel deployment.
Follow the steps above to deploy to your cPanel hosting.

**Production URL:** Configure in cPanel  
**Database:** Supabase or cPanel MySQL  
**Node.js:** 20+ required  
**Build:** Automated via .cpanel.yml

