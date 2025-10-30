# ⚡ FanzDash Quick Start Guide

Get FanzDash running locally in **10 minutes**!

---

## Prerequisites

- ✅ Node.js 18+ installed
- ✅ Git installed
- ✅ Dependencies already installed (1,010 packages ✓)

---

## 🚀 Quick Start (10 minutes)

### Step 1: Set Up Environment (2 min)

```bash
# Copy environment template
cp .env.example .env
```

**For Development** (Skip Supabase initially):
```bash
# .env file - use mock database
DATABASE_URL="postgresql://username:password@localhost:5432/fanzdash"
PORT=3000
NODE_ENV=development
JWT_SECRET="development-secret-change-in-production"
```

### Step 2: Start Development Server (1 min)

```bash
npm run dev
```

You should see:
```
⚠️  Using mock database for development
✓ Server running on http://localhost:3000
```

### Step 3: Test the API (2 min)

Open another terminal:

```bash
# Health check
curl http://localhost:3000/healthz

# Should return: {"status":"ok"}
```

**Test Authentication**:

```bash
# Generate a test JWT token (for development only)
node -e "const jwt = require('jsonwebtoken'); console.log(jwt.sign({sub: 'test-user-123', email: 'dev@test.com', role: 'admin'}, 'development-secret-change-in-production'));"
```

Copy the token and test:
```bash
curl http://localhost:3000/api/users/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Step 4: Explore the Codebase (5 min)

**Key Files to Know**:

```
FanzDash/
├── server/
│   ├── middleware/auth.ts      # 🔐 Authentication
│   ├── utils/logger.ts         # 📝 Logging
│   ├── lib/supabase.ts         # 💾 Supabase client
│   ├── db/index.ts             # 🗄️ Database
│   ├── routes.ts               # 🛣️ API routes
│   └── index.ts                # 🚀 Server entry
├── client/
│   └── src/
│       ├── App.tsx             # ⚛️ React app
│       └── pages/              # 📄 Page components
├── supabase/
│   └── migrations/
│       └── 20250130000000_initial_schema.sql  # 💾 Database schema
├── .env                        # ⚙️ Configuration
└── package.json                # 📦 Dependencies
```

---

## 🎯 What You Can Do Now

### 1. Test Authentication

The authentication system is now production-ready:

```typescript
// Example: Protected route in your code
import { isAuthenticated, requireAdmin } from './middleware/auth';

app.get('/api/admin/dashboard', isAuthenticated, requireAdmin, (req, res) => {
  // req.user is automatically populated
  res.json({
    message: 'Welcome to admin dashboard',
    user: req.user
  });
});
```

### 2. Use the Logger

Replace `console.log` with proper logging:

```typescript
import logger from './utils/logger';

// Basic logging
logger.info('User logged in', { userId: '123' });
logger.error('Database connection failed', error);

// Specialized logging
logger.auth('login', userId, true);
logger.database('query', 'users', duration);
logger.payment('subscription', amount, userId, true);
```

### 3. Check Logs

Logs appear in console with structured format:

**Development**:
```
[2025-10-30T20:00:00Z] [INFO] FanzDash: User logged in
{
  "userId": "123",
  "email": "user@example.com"
}
```

**Production** (JSON):
```json
{"timestamp":"2025-10-30T20:00:00Z","level":"INFO","service":"FanzDash","message":"User logged in","metadata":{"userId":"123"}}
```

---

## 🔧 Optional: Set Up Supabase (Production Database)

### Quick Supabase Setup (15 min)

1. **Create Project**:
   - Go to https://supabase.com
   - Create new project (free tier)
   - Wait 2 minutes for setup

2. **Get Credentials**:
   - Settings > API
   - Copy: Project URL, anon key, service_role key

3. **Update .env**:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=eyJhbG...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
   DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres
   ```

4. **Run Migrations**:
   ```bash
   # Install Supabase CLI
   npm install -g supabase

   # Login and link
   supabase login
   supabase link --project-ref your-project-ref

   # Push schema
   supabase db push
   ```

5. **Restart Server**:
   ```bash
   npm run dev
   ```

   Should see:
   ```
   ✓ Supabase database connected successfully
   ✓ Server running on http://localhost:3000
   ```

---

## 📚 Common Tasks

### Add a New Protected Route

```typescript
// server/routes.ts
import { isAuthenticated, requireRole } from './middleware/auth';

app.post('/api/posts', isAuthenticated, async (req, res) => {
  const userId = req.user!.id; // TypeScript knows user exists

  logger.info('Creating post', { userId });

  // Your logic here

  res.json({ success: true });
});
```

### Add Admin-Only Route

```typescript
import { requireAdmin } from './middleware/auth';

app.get('/api/admin/stats', requireAdmin, (req, res) => {
  // Only admins can access this
  res.json({ stats: {...} });
});
```

### Query Database

```typescript
import { db } from './db';

// Using Drizzle ORM
const users = await db.select().from(schema.users).limit(10);

// Or using Supabase client
import { supabase } from './lib/supabase';

const { data, error } = await supabase
  .from('users')
  .select('*')
  .limit(10);
```

### Upload File to Supabase Storage

```typescript
import { uploadFile } from './lib/supabase';

const publicUrl = await uploadFile(
  'avatars',                    // bucket
  `${userId}/avatar.png`,       // path
  fileBuffer,                   // file
  { contentType: 'image/png' }  // options
);
```

---

## 🐛 Troubleshooting

### Issue: Port 3000 already in use

```bash
# Change port in .env
PORT=3001

# Or kill the process using port 3000
lsof -ti:3000 | xargs kill
```

### Issue: Module not found

```bash
# Reinstall dependencies
rm -rf node_modules
npm install --legacy-peer-deps
```

### Issue: TypeScript errors

```bash
# Check specific files
npx tsc --noEmit server/routes.ts

# Our new files should have no errors
npx tsc --noEmit server/middleware/auth.ts server/utils/logger.ts
```

### Issue: Authentication not working

1. Check JWT_SECRET is set in .env
2. Verify token format: `Bearer <token>`
3. Check token expiration (default 7 days)
4. Review logs for auth errors

---

## 🎨 Development Workflow

### 1. Make Changes

Edit files in `server/` or `client/src/`

### 2. Server Auto-Restarts

The dev server watches for changes and restarts automatically.

### 3. Check Logs

Watch the console for:
- ✅ Green INFO logs = good
- ⚠️ Yellow WARN logs = check these
- ❌ Red ERROR logs = fix immediately

### 4. Test Your Changes

```bash
# Run specific endpoint
curl http://localhost:3000/your-endpoint

# Or use Postman/Insomnia
```

### 5. Commit When Ready

```bash
git add .
git commit -m "feat: your feature description"
git push origin main
```

---

## 📖 Learn More

### Authentication
- See: `server/middleware/auth.ts`
- Docs: [AUTHENTICATION.md](./docs/AUTHENTICATION.md)

### Logging
- See: `server/utils/logger.ts`
- Logs are structured and production-ready

### Database
- See: `server/db/index.ts` and `server/lib/supabase.ts`
- Schema: `supabase/migrations/20250130000000_initial_schema.sql`

### Deployment
- Full guide: [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
- Supabase setup: [SUPABASE_SETUP_GUIDE.md](./SUPABASE_SETUP_GUIDE.md)

---

## 🚀 Next Steps

Once you're comfortable:

1. **Set Up Supabase** - Get real database
2. **Add Features** - Build your platform
3. **Write Tests** - Ensure quality
4. **Deploy** - Go live!

---

## 💡 Tips

### Use TypeScript

The codebase is fully typed. Let TypeScript help you:

```typescript
import { Request } from 'express';
import { AuthenticatedRequest } from './middleware/auth';

// TypeScript knows req.user exists
app.get('/api/me', isAuthenticated, (req: AuthenticatedRequest, res) => {
  const userId = req.user.id; // ✅ No error
  const email = req.user.email; // ✅ Type-safe
});
```

### Use the Loggers

Different loggers for different purposes:

```typescript
import {
  logger,           // General
  authLogger,       // Authentication
  dbLogger,         // Database
  paymentLogger,    // Payments
  streamLogger      // Streaming
} from './utils/logger';
```

### Check Health

Always available endpoints:
- `GET /healthz` - Basic health
- `GET /system` - System info
- `GET /api/version` - API version

---

## 🎉 You're Ready!

Your development environment is set up and ready to go!

**What's Working**:
- ✅ Authentication with JWT
- ✅ Structured logging
- ✅ Supabase integration
- ✅ Database connection
- ✅ All dependencies installed
- ✅ Development server running

**Start building!** 🚀

---

**Need Help?**
- Check [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
- Review [CODEBASE_IMPROVEMENTS_SUMMARY.md](./CODEBASE_IMPROVEMENTS_SUMMARY.md)
- Open an issue on GitHub

**Happy coding!** 👨‍💻
