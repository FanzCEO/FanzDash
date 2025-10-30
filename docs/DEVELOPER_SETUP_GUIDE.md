# 🚀 FanzDash Developer Setup Guide
## Complete Environment Configuration for Enterprise Development

> **Target Audience:** Developers, DevOps Engineers, System Administrators  
> **Prerequisites:** Basic terminal/command line knowledge  
> **Estimated Time:** 15-30 minutes  
> **Last Updated:** September 2025

---

## 📋 Table of Contents

- [🏗️ Prerequisites](#️-prerequisites)
- [🔑 SSH Key Setup](#-ssh-key-setup)
- [📦 Development Environment](#-development-environment)
- [🛠️ FanzDash Installation](#️-fanzdash-installation)
- [🔧 Configuration](#-configuration)
- [🧪 Testing Your Setup](#-testing-your-setup)
- [🚀 Development Workflow](#-development-workflow)
- [🆘 Troubleshooting](#-troubleshooting)

---

## 🏗️ Prerequisites

### System Requirements

#### Minimum Requirements
- **OS:** Windows 10+, macOS 10.15+, or Linux (Ubuntu 18.04+)
- **RAM:** 8GB (16GB recommended)
- **Storage:** 10GB free space
- **Network:** Stable internet connection

#### Required Software
- **Node.js:** Version 18.0.0 or higher
- **Git:** Latest version
- **Code Editor:** VS Code (recommended) or your preferred editor

### Quick Prerequisites Check

```bash
# Check Node.js version
node --version  # Should be 18.0.0+

# Check npm version  
npm --version   # Should be 8.0.0+

# Check Git version
git --version   # Should be 2.0.0+
```

---

## 🔑 SSH Key Setup

SSH keys provide secure authentication for Git repositories and are essential for FanzDash development.

### 🚀 Automated SSH Setup (Recommended)

We've created a comprehensive SSH setup script that handles all platforms:

```bash
# Navigate to FanzDash directory
cd /path/to/FanzDash

# Run automated SSH setup
node scripts/setup-ssh.js your-email@fanzunlimited.com
```

**What this script does:**
- ✅ Generates Ed25519 SSH key pair (most secure)
- ✅ Starts SSH agent automatically
- ✅ Adds key to SSH agent with platform-specific options
- ✅ Copies public key to clipboard (when possible)
- ✅ Provides platform-specific instructions

### 📋 Manual SSH Setup

If you prefer manual setup or need to understand the process:

#### Step 1: Generate SSH Key

```bash
# Generate Ed25519 key (recommended for security)
ssh-keygen -t ed25519 -C "your-email@fanzunlimited.com"

# When prompted, press Enter to save to default location
# Optionally set a passphrase for additional security
```

#### Step 2: Start SSH Agent

```bash
# Start SSH agent
eval "$(ssh-agent -s)"
```

#### Step 3: Add Key to Agent

**macOS:**
```bash
# Add key with macOS keychain integration
ssh-add --apple-use-keychain ~/.ssh/id_ed25519
```

**Linux/Windows (Git Bash/WSL):**
```bash
# Add key to agent
ssh-add ~/.ssh/id_ed25519
```

#### Step 4: Copy Public Key

**macOS:**
```bash
# Copy to clipboard
pbcopy < ~/.ssh/id_ed25519.pub
```

**Linux:**
```bash
# Copy to clipboard (requires xclip)
xclip -selection clipboard < ~/.ssh/id_ed25519.pub

# Or display to copy manually
cat ~/.ssh/id_ed25519.pub
```

**Windows (Git Bash):**
```bash
# Copy to clipboard
clip < ~/.ssh/id_ed25519.pub
```

### 🔗 Add SSH Key to Git Services

1. **GitHub:**
   - Go to Settings → SSH and GPG keys
   - Click "New SSH key"
   - Paste your public key and save

2. **GitLab:**
   - Go to User Settings → SSH Keys
   - Paste your public key and save

3. **Bitbucket:**
   - Go to Personal settings → SSH keys
   - Add your public key

### ✅ Test SSH Connection

```bash
# Test GitHub connection
ssh -T git@github.com

# Test GitLab connection  
ssh -T git@gitlab.com

# Expected response: Authentication successful message
```

---

## 📦 Development Environment

### Node.js and npm Setup

#### Install Node.js (if not already installed)

**Using Node Version Manager (Recommended):**

```bash
# Install nvm (macOS/Linux)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Restart terminal or source profile
source ~/.bashrc  # or ~/.zshrc

# Install and use Node.js 20
nvm install 20
nvm use 20
nvm alias default 20
```

**Direct Installation:**
- Visit [nodejs.org](https://nodejs.org)
- Download and install LTS version

### Git Configuration

```bash
# Set global Git configuration
git config --global user.name "Your Name"
git config --global user.email "your-email@fanzunlimited.com"

# Set default branch name
git config --global init.defaultBranch main

# Optional: Set VS Code as default editor
git config --global core.editor "code --wait"
```

---

## 🛠️ FanzDash Installation

### Clone Repository

```bash
# Clone using SSH (recommended after SSH setup)
git clone git@github.com:FanzCEO/FanzDash.git

# Alternative: Clone using HTTPS
git clone https://github.com/FanzCEO/FanzDash.git

# Navigate to project directory
cd FanzDash
```

### Install Dependencies

```bash
# Install all dependencies (use legacy peer deps for Vite compatibility)
npm install --legacy-peer-deps

# Verify installation
npm list --depth=0
```

### Database Setup

```bash
# Copy environment example
cp .env.example .env

# Edit environment variables (see Configuration section)
nano .env  # or use your preferred editor

# Push database schema
npm run db:push

# Optional: Open database studio
npm run db:studio
```

---

## 🔧 Configuration

### Environment Variables

Edit `.env` file with your configuration:

```env
# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/fanzdash
POSTGRES_SSL=true

# Security Configuration  
JWT_SECRET=your-super-secure-jwt-secret-key
SESSION_SECRET=your-session-secret-key
ENCRYPTION_KEY=your-32-character-encryption-key

# AI Integration (Optional for development)
OPENAI_API_KEY=your-openai-api-key
PERSPECTIVE_API_KEY=your-google-perspective-key

# File Storage (Development)
GOOGLE_CLOUD_PROJECT_ID=your-gcp-project
GOOGLE_CLOUD_STORAGE_BUCKET=your-storage-bucket

# Application Settings
NODE_ENV=development
PORT=5000
CORS_ORIGIN=http://localhost:3000
```

### Required Environment Variables

**Essential for development:**
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing secret (generate with: `openssl rand -base64 64`)
- `SESSION_SECRET` - Session encryption secret
- `NODE_ENV` - Set to "development"

**Optional for full functionality:**
- `OPENAI_API_KEY` - For AI content analysis
- `PERSPECTIVE_API_KEY` - For toxicity detection
- Cloud storage credentials for file uploads

---

## 🧪 Testing Your Setup

### Development Server

```bash
# Start development server
npm run dev

# Expected output:
# ✅ Server running on http://localhost:5000
# ✅ Database connected
# ✅ WebSocket server started
```

### Run Tests

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration
```

### Verify Database

```bash
# Check database connection
npm run db:check

# View database in browser
npm run db:studio
```

### Build Verification

```bash
# Test production build
npm run build

# Should complete without errors
```

---

## 🚀 Development Workflow

### Daily Development

```bash
# 1. Pull latest changes
git pull origin main

# 2. Install any new dependencies
npm install --legacy-peer-deps

# 3. Run database migrations (if any)
npm run db:push

# 4. Start development server
npm run dev
```

### Code Quality

```bash
# Format code (if Prettier is configured)
npm run format

# Lint code (if ESLint is configured)  
npm run lint

# Type checking
npm run check
```

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: add your feature description"

# Push to remote
git push origin feature/your-feature-name

# Create pull request on GitHub
```

---

## 🆘 Troubleshooting

### Common Issues

#### SSH Connection Issues

**Problem:** `Permission denied (publickey)`
```bash
# Solution: Ensure SSH key is added to agent
ssh-add -l  # List loaded keys
ssh-add ~/.ssh/id_ed25519  # Add key if missing

# Test connection with verbose output
ssh -vT git@github.com
```

#### Dependencies Installation Issues

**Problem:** `npm install` fails
```bash
# Solution: Clear cache and retry
npm cache clean --force
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

#### Database Connection Issues

**Problem:** Cannot connect to database
```bash
# Check if PostgreSQL is running
# Verify DATABASE_URL in .env
# Ensure database exists and credentials are correct

# Test connection manually
psql $DATABASE_URL
```

#### Port Already in Use

**Problem:** `EADDRINUSE: address already in use :::5000`
```bash
# Find and kill process using port 5000
lsof -ti:5000 | xargs kill -9

# Or use different port
PORT=5001 npm run dev
```

### Development Tools

#### VS Code Extensions (Recommended)

```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "ms-vscode.vscode-json"
  ]
}
```

#### VS Code Settings

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.preferences.importModuleSpecifier": "relative",
  "files.associations": {
    "*.env*": "dotenv"
  }
}
```

### Performance Tips

1. **Use Node.js 20+** for better performance
2. **Enable dev server caching** for faster builds
3. **Use SSD storage** for better npm install performance
4. **Close unnecessary applications** to free up RAM
5. **Use fast internet connection** for dependency installation

### Getting Help

1. **Check Documentation** - Review this guide and other docs
2. **Search Issues** - Check GitHub issues for similar problems
3. **Ask Team** - Contact other developers on your team
4. **Community Support** - Join FanzDash developer community
5. **Create Issue** - Report bugs or request features on GitHub

---

## 📞 Support Contacts

- **Technical Support:** support@fanz.foundation
- **Developer Community:** developers@fanz.foundation
- **Security Issues:** security@fanz.foundation
- **Documentation:** docs@fanz.foundation

---

*This guide is maintained by the FanzDash development team. For updates and improvements, please contribute to the documentation repository.*

**Last Updated:** September 7, 2025  
**Document Version:** 2.0.0  
**© 2025 Fanz™ Unlimited Network LLC. All Rights Reserved.**