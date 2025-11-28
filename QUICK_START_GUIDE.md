# 🚀 Quick Start Guide - FanzDash Platform

## Get Up and Running in 5 Minutes!

Welcome to FanzDash, the enterprise-grade management platform for the Fanz™ ecosystem. This guide will get you from zero to development-ready in just a few minutes.

---

## ⚡ 5-Minute Development Setup

### Step 1: SSH Key Configuration (2 minutes)

Before working with the FanzDash repository, you'll need SSH keys for secure Git authentication:

1. **Run automated SSH setup:**
   ```bash
   # Clone repository first (HTTPS)
   git clone https://github.com/FanzCEO/FanzDash.git
   cd FanzDash
   
   # Set up SSH keys
   npm run setup:ssh your-email@fanzunlimited.com
   ```

2. **Add your public key to GitHub:**
   - Go to GitHub Settings → SSH and GPG keys
   - Click "New SSH key"
   - Paste the key that was copied to your clipboard
   - Save the key

3. **Verify SSH setup:**
   ```bash
   npm run verify:ssh
   ```

### Step 2: Environment Setup (1 minute)

1. **Install dependencies:**
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your settings (see Developer Setup Guide for details)
   ```

### Step 3: Database Initialization (1 minute)

1. **Push database schema:**
   ```bash
   npm run db:push
   ```

2. **Verify database connection:**
   ```bash
   npm run db:studio  # Opens database browser
   ```

### Step 4: Start Development (1 minute)

1. **Launch development server:**
   ```bash
   npm run dev
   ```

2. **Access the platform:**
   - Open http://localhost:5000
   - Login with default credentials (see README.md)

---

## 🚀 Alternative: One-Command Setup

For a completely automated setup experience:

```bash
# Complete development environment setup
npm run setup:dev your-email@fanzunlimited.com
```

This command will:
- ✅ Configure SSH keys
- ✅ Install all dependencies  
- ✅ Set up database schema
- ✅ Verify all connections

## 🛠️ What You Just Set Up

### Core Components Configured

- **SSH Authentication**: Secure Git access with Ed25519 keys
- **Development Environment**: Node.js, npm, and project dependencies
- **Database Schema**: PostgreSQL tables and relationships
- **Development Server**: Hot-reload enabled development server

### Default Access Credentials

```
Username: admin@fanz.foundation
Password: FanzDash2025!
```
**⚠️ IMPORTANT: Change these credentials immediately in production!**

---

## 🎯 Common Development Tasks

### Daily Development Workflow

```bash
# Pull latest changes
git pull origin main

# Start development server
npm run dev

# Open in browser: http://localhost:5000
```

### Database Operations

```bash
# View database in browser
npm run db:studio

# Push schema changes
npm run db:push

# Check database connection
npm run verify:ssh  # Also verifies other connections
```

### Code Quality

```bash
# Type checking
npm run check

# Build for production (test)
npm run build
```

---

## 🚨 Quick Fixes for Common Issues

### SSH Connection Problems

```bash
# Re-verify SSH setup
npm run verify:ssh

# Add key to agent if needed
ssh-add ~/.ssh/id_ed25519

# Test GitHub connection
ssh -T git@github.com
```

### Development Server Issues

```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

# Check port availability
lsof -ti:5000 | xargs kill -9  # Kill process on port 5000
```

### Database Connection Issues

```bash
# Verify DATABASE_URL in .env
# Check if PostgreSQL is running
# Ensure database exists and credentials are correct
```

---

## 🔥 Pro Tips for Development

### Speed Up Your Workflow

- **Use VS Code** with recommended extensions
- **Enable auto-save** for faster iteration
- **Use split terminal** for running multiple commands
- **Bookmark key URLs** (localhost:5000, db studio)

### Security Best Practices

- **Never commit** sensitive data to Git
- **Use strong passwords** for local development
- **Keep SSH keys secure** and backed up
- **Regularly update dependencies**

### Debugging Tips

- **Check browser console** for JavaScript errors
- **Monitor server logs** in terminal
- **Use database studio** to inspect data
- **Test in different browsers** for compatibility

---

## 📚 Next Steps

### Learn the Platform

1. **Explore the Admin Dashboard** - Navigate through all sections
2. **Review Documentation** - Read the comprehensive guides
3. **Test Key Features** - Try content moderation, user management
4. **Configure Integrations** - Set up external services

### Development Resources

- **[Developer Setup Guide](./docs/DEVELOPER_SETUP_GUIDE.md)** - Comprehensive setup instructions
- **[Administrator's Guide](./docs/ADMIN_GUIDE.md)** - Platform management guide
- **[API Documentation](./docs/API_INTEGRATION_MANUAL.md)** - API reference and examples
- **[Deployment Guide](./docs/DEPLOYMENT_INFRASTRUCTURE_GUIDE.md)** - Production deployment

### Community & Support

- **Technical Support**: support@fanz.foundation
- **Developer Community**: developers@fanz.foundation
- **Security Issues**: security@fanz.foundation
- **Documentation Feedback**: docs@fanz.foundation

---

## 📞 Emergency Contacts

### Development Issues
- **Check documentation** first for common solutions
- **Search GitHub issues** for similar problems
- **Contact team members** if blocked on development

### Platform Issues  
- **Technical Support**: support@fanz.foundation
- **Security Incidents**: security@fanz.foundation
- **Business Critical**: emergency@fanz.foundation

---

_Congratulations! You're ready to develop on the FanzDash platform! 🚀_

**Quick Start Guide**  
**Last Updated**: September 7, 2025  
**Version**: 2.0.0  
**© 2025 Fanz™ Unlimited Network LLC. All Rights Reserved.**
