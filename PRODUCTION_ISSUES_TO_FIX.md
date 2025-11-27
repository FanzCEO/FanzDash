# 🔧 Production Issues to Fix

**Date:** October 31, 2025  
**Platform:** FanzDash on Render  
**Status:** Live but with mock data and broken features

---

## ✅ What's Working

- ✅ Deployed and accessible at https://fanzdash.onrender.com
- ✅ Basic health check API: `/api/health` works
- ✅ Frontend loads correctly
- ✅ Supabase database is deployed
- ✅ Build and deployment process works

---

## ❌ What's Not Working

### 1. **WebSocket Connection Failures**
**Error:** `ENETUNREACH 2600:1f18:2e13:9d2a:a257:528:d1b3:7d2f:443`
- **Issue:** Render is trying to connect via IPv6 to Supabase WebSocket
- **Impact:** Real-time features fail, dashboard stats API returns 500
- **Solution:** Configure Supabase client to use IPv4 only or fix DNS resolution

### 2. **Mock Data Everywhere**
**Issue:** Application is using hardcoded mock data instead of database queries

**Affected Areas:**
- Dashboard stats (`/api/dashboard/stats`) returns mock data
- Content moderation hub shows fake content
- Crisis management shows fake threats
- Platform metrics are hardcoded
- Admin dashboard has all mock metrics
- Payment data is simulated
- Creator earnings are fabricated

### 3. **Database Not Being Used**
**Issue:** Most API endpoints return mock data instead of querying Supabase

**Examples:**
- `server/storage.ts` - `getAllPlatforms()` returns mock platforms
- `server/routes.ts` - Many endpoints return hardcoded data
- Admin dashboard components use mock state
- Most frontend pages have hardcoded sample data

### 4. **Authentication is Demo Mode**
**Issue:** No real authentication system active
- Supabase Auth is configured but not used
- Demo bypass mode is likely still active
- Users can't actually register/login

---

## 📋 Files That Need Real Database Queries

### High Priority (Core Features)

1. **`server/routes.ts`** - Main API routes
   - Dashboard stats endpoint
   - Platform metrics
   - User analytics
   - Payment processing
   - Content moderation stats

2. **`server/storage.ts`** - Database access layer
   - `getAllPlatforms()` - Returns mock platforms
   - `getModerationStats()` - Needs real query
   - Most methods need Supabase integration

3. **`client/src/components/AdminDashboardPremium.tsx`**
   - All mock metrics need real API calls
   - `mockMetrics` array should be replaced

4. **`client/src/components/FuturisticDashboard.tsx`**
   - Mock revenue data
   - Mock payment methods
   - Mock creator earnings

5. **`client/src/pages/content-review.tsx`**
   - Mock content array
   - Needs real moderation queue

6. **`client/src/pages/content-moderation-hub.tsx`**
   - `moderationItems` mock data

7. **`client/src/pages/crisis-management-new.tsx`**
   - `crisisEvents` mock data

8. **`client/src/pages/landing-hub.tsx`**
   - Mock platform list

### Medium Priority (Secondary Features)

9. **`server/routes/media.ts`**
   - Platform status mock data

10. **`server/modules/qnecc/biometricProfileManager.ts`**
    - Mock biometric verification

11. **`server/ai/AIEcosystemManager.ts`**
    - Placeholder AI implementations

12. **`client/src/components/IntelligentModerationWorkflow.tsx`**
    - Mock content queue

---

## 🛠️ How to Fix

### Step 1: Fix WebSocket/Database Connection

```typescript
// server/db/index.ts or server/lib/supabase.ts
// Force IPv4 for Supabase connections on Render

// Option 1: Configure Pool with IPv4 only
const pool = new Pool({
  connectionString: databaseUrl,
  // Add connection config to prefer IPv4
});

// Option 2: Use Supabase client instead of raw Pool
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { persistSession: false },
    db: { schema: 'public' },
    global: { headers: { 'x-client-info': 'fanzdash' } },
    // Add IPv4 preference
  }
);
```

### Step 2: Replace Mock Data with Real Queries

**Example:** Replace dashboard stats mock data

```typescript
// BEFORE (Mock)
app.get("/api/dashboard/stats", isAuthenticated, (req, res) => {
  const mockStats = {
    totalUsers: 127849,
    activeCreators: 8934,
    totalRevenue24h: 48500,
    // ... more mock data
  };
  res.json(mockStats);
});

// AFTER (Real Database Query)
app.get("/api/dashboard/stats", isAuthenticated, async (req, res) => {
  try {
    const stats = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM users WHERE role = 'creator' AND active = true) as active_creators,
        (SELECT COALESCE(SUM(amount), 0) FROM transactions 
         WHERE status = 'completed' AND created_at >= NOW() - INTERVAL '24 hours') as revenue_24h
    `);
    res.json(stats[0]);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});
```

### Step 3: Update Frontend to Handle Real Data

```typescript
// BEFORE (Using Mock)
const mockMetrics: DashboardMetrics = {
  overview: {
    totalUsers: 127849,
    // ...
  }
};

// AFTER (API Call)
const { data: metrics, isLoading } = useQuery<DashboardMetrics>({
  queryKey: ["/api/dashboard/stats"],
  refetchInterval: 5000,
});
```

### Step 4: Implement Real Authentication

Remove demo bypass and use Supabase Auth:

```typescript
// server/routes.ts
import { isAuthenticated } from './middleware/auth';

// Replace demo auth with Supabase Auth
export const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
};
```

---

## 🎯 Priority Fixes

### **P0 (Critical - Fix First)**
1. ✅ WebSocket/Database connection error
2. ✅ Dashboard stats API 500 error
3. ✅ Authentication system implementation

### **P1 (High Priority - Core Features)**
4. Replace admin dashboard mock data
5. Replace content moderation mock data
6. Replace platform metrics mock data
7. Connect payment processing to database

### **P2 (Medium Priority - Secondary Features)**
8. Replace crisis management mock data
9. Replace content review mock data
10. Replace landing hub mock data

### **P3 (Low Priority - Nice to Have)**
11. Replace AI placeholder implementations
12. Replace biometric mock data
13. Clean up console.log statements
14. Add loading states for real API calls

---

## 🧪 Testing Checklist

After fixes, test:

- [ ] Dashboard loads with real data
- [ ] Authentication works (register/login)
- [ ] Content moderation queue shows real content
- [ ] Platform metrics are accurate
- [ ] Payment processing saves to database
- [ ] User profiles load correctly
- [ ] Real-time features work
- [ ] No 500 errors on API calls
- [ ] All pages load without errors
- [ ] Database queries are efficient

---

## 📝 Next Steps

1. Fix WebSocket connection issue
2. Replace one endpoint at a time with real queries
3. Test each fix in production
4. Monitor error logs
5. Gradually remove all mock data

---

**Estimated Time:** 4-8 hours of focused development

**Files to Modify:** ~15-20 files

**Lines to Change:** ~500-1000 lines

