# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

---

# 🚀 FanzDash Central Command Center — Developer Guide
## AI CFO & Military-Grade Financial Command System for Fanz™ Unlimited Network

> **Last Verified:** January 9, 2025  
> **Version:** 2.0.0  
> **Classification:** TOP SECRET - Central Command & Control System  
> **Security Level:** Military-Grade Encryption (AES-256, RSA-4096)  
> **AI CFO Status:** Fully Automated Financial Operations  
> **Stack:** React 18.3.1 + TypeScript 5.6.3 + Vite 7.1.4 + Express + Drizzle + Neon

## Table of Contents

- [🎯 TL;DR Quickstart](#-tldr-quickstart)
- [🏗️ Architecture Overview](#️-architecture-overview)
- [🛠️ Local Environment Setup](#️-local-environment-setup)
- [⚡ Core Development Commands](#-core-development-commands)
- [🗄️ Database (Drizzle + Neon)](#️-database-drizzle--neon)
- [🔧 Backend (Node.js/Express)](#-backend-nodejsexpress)
- [⚛️ Frontend (React + Vite)](#️-frontend-react--vite)
- [🔴 Real-time & WebSockets](#-real-time--websockets)
- [🥽 VR/WebXR Development](#-vrwebxr-development)
- [🤖 AI Systems & OpenAI](#-ai-systems--openai)
- [💳 Payment Processing](#-payment-processing)
- [💰 FanzFinance OS](#-fanzfinance-os)
- [🔐 Security & RBAC](#-security--rbac)
- [⚖️ Legal Compliance](#️-legal-compliance)
- [📊 Analytics & Predictive](#-analytics--predictive)
- [🔑 Environment Variables](#-environment-variables)
- [🧪 Testing Strategy](#-testing-strategy)
- [📈 Observability](#-observability)
- [⚡ Performance & Scale](#-performance--scale)
- [🔄 Dev Workflows](#-dev-workflows)
- [📚 Runbooks & Recipes](#-runbooks--recipes)
- [🆘 Troubleshooting](#-troubleshooting)
- [📝 Maintenance](#-maintenance)

---

## 🎯 TL;DR Quickstart

Get FanzDash running locally in under 10 minutes:

### Prerequisites
- **Node.js 18+** (check with `node --version`)
- **npm 10+** (check with `npm --version`)
- **Neon PostgreSQL** account ([neon.tech](https://neon.tech))
- **OpenAI API key** (for AI moderation features)

### Quick Setup
```bash
# 1. Clone and install
git clone <repo-url>
cd FanzDash
npm install --legacy-peer-deps  # ⚠️ Required for Vite compatibility

# 2. Environment setup
cp .env.example .env
# Edit .env with your DATABASE_URL and secrets

# 3. Database setup
npm run db:push

# 4. Start development
npm run dev
```

### Verify Setup
- **UI:** http://localhost:5173 (Vite dev server)
- **API:** http://localhost:5000 (Express backend)
- **Health Check:** `curl http://localhost:5000/api/health`
- **Type Check:** `npm run check`
- **Setup Validation:** `node scripts/validate-setup.js`

---

## 🏗️ Architecture Overview

FanzDash is the **Central Command Center and Super Admin/Executive Control Panel** for the entire Fanz™ Unlimited Network ecosystem. This is the highest-level administrative interface that provides unified command and control over 20+ adult content platforms, financial operations, legal compliance, and strategic business intelligence.

### Central Command Center Features
- **🎯 Executive Dashboard:** Real-time KPIs across all 20+ platforms
- **⚡ Crisis Management:** Emergency response and kill switches
- **🔐 Super Admin Controls:** Highest-level system administration
- **📊 Strategic Intelligence:** AI-powered business insights
- **⚖️ Compliance Command:** Legal oversight and regulatory monitoring
- **💰 Financial Command:** FanzFinance OS integration and oversight
- **🌐 Multi-Platform Orchestration:** Unified control across entire ecosystem
- **🔍 Global Audit Trail:** Comprehensive logging and accountability

### Tech Stack
- **Frontend:** React 18.3.1, Vite 7.1.4, TypeScript 5.6.3
- **Routing:** Wouter 3.3.5 (lightweight React router)
- **State Management:** TanStack Query 5.60.5 (server state)
- **UI Components:** Radix UI (accessible primitives)
- **Styling:** Tailwind CSS 3.4.17 + Tailwind Animate
- **Backend:** Node.js + Express 4.21.2
- **Database:** PostgreSQL (Neon serverless) + Drizzle ORM 0.39.1
- **Real-time:** WebSockets (ws library)
- **AI:** OpenAI GPT-4o/GPT-5, Perspective API, CLIP models
- **Auth:** Passport.js + JWT + 2FA/WebAuthn
- **Payments:** Adult-friendly processors (CCBill, SegPay, crypto)

### System Architecture
```
┌─────────────────┐    HTTP/WS     ┌─────────────────┐
│   React SPA     │ ◄──────────── ──► │  Express API     │
│  (Vite/Port     │                │  + WebSocket     │
│   5173)         │                │  (Port 5000)     │
└─────────────────┘                └─────────────────┘
                                           │
                    ┌──────────────────────┼──────────────────────┐
                    │                      │                      │
            ┌───────▼────────┐    ┌────────▼────────┐    ┌────────▼────────┐
            │  Drizzle ORM   │    │   OpenAI APIs   │    │ Payment Gateways│
            │      ▼         │    │ (Moderation +   │    │ (CCBill/SegPay/ │
            │ Neon Postgres  │    │  Analysis)      │    │    Crypto)      │
            │ (77+ tables)   │    └─────────────────┘    └─────────────────┘
            └────────────────┘
                    │
            ┌───────▼────────┐
            │ FanzFinance OS │
            │   (Ledger +    │
            │ Tax/Payouts)   │
            └────────────────┘
```

### Database Schema (77+ Tables)
The database contains 77+ interconnected tables with 151 strategic performance indexes, including:
- **Core:** `users`, `platforms`, `contentItems`, `moderationResults`
- **AI:** `aiAnalysisResults`, `aiCompanions`, `aiModels`
- **Payments:** `paymentProcessors`, `paymentTransactions`, `userDeposits`
- **Compliance:** `form2257Verifications`, `encryptedVault`, `auditTrail`
- **Real-time:** `liveStreams`, `streamTokens`, `webrtcRooms`
- **Finance:** Schema shared with FanzFinance OS module

---

## 🛠️ Local Environment Setup

### Directory Structure
```
FanzDash/
├── client/                 # React frontend
│   └── src/
│       ├── components/     # Reusable UI components
│       ├── pages/          # Route components
│       ├── lib/           # Utilities & query client
│       └── App.tsx        # Main app component
├── server/                # Express backend
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API routes & WebSocket
│   ├── db.ts             # Drizzle database connection
│   ├── openaiService.ts  # AI moderation service
│   └── *.ts              # Various service modules
├── shared/               # Shared types & schema
│   └── schema.ts         # Drizzle database schema
├── .env.example          # Environment template
├── drizzle.config.ts     # Drizzle configuration
├── vite.config.ts        # Vite configuration
└── package.json
```

### Environment Configuration

**Required Variables:**
```env
# Core
DATABASE_URL="postgresql://user:pass@host:5432/db"
NODE_ENV="development"
PORT=5000

# Security
JWT_SECRET="your-jwt-secret-32-chars-min"
ENCRYPTION_KEY="your-encryption-key-exactly-32"

# AI (Required for moderation)
OPENAI_API_KEY="sk-..."

# Optional but recommended
STREAM_API_KEY="getstream-io-key"
COCONUT_API_KEY="media-encoding-key"
```

Copy `.env.example` to `.env` and configure with your actual values.

---

## ⚡ Core Development Commands

### Primary Scripts
```bash
# Development (starts both frontend & backend)
npm run dev
# → Client: http://localhost:5173
# → API: http://localhost:5000

# Production build
npm run build
# → Builds client to dist/public/
# → Builds server to dist/index.js

# Production start
npm run start
# → Runs built server (NODE_ENV=production)

# Database operations
npm run db:push          # Apply schema to database
npm run db:studio        # Open Drizzle Studio (optional)

# Type checking
npm run check           # TypeScript compilation check
```

### Installation Notes
⚠️ **Always use `npm install --legacy-peer-deps`** due to Vite 7.1.4 peer dependency conflicts.

### Development Workflow
1. **Install:** `npm install --legacy-peer-deps`
2. **Environment:** Configure `.env` file
3. **Database:** `npm run db:push`
4. **Start:** `npm run dev`
5. **Verify:** Visit http://localhost:5173 and check console

---

## 🗄️ Database (Drizzle + Neon)

### Schema Management
- **File:** `shared/schema.ts` - Single source of truth
- **Tables:** 77+ tables with foreign key relationships
- **Indexes:** 151 strategic performance indexes
- **Connection:** Neon serverless PostgreSQL via connection pooling

### Development Workflow
```bash
# 1. Modify schema in shared/schema.ts
# 2. Push changes to database
npm run db:push

# 3. Verify changes (optional)
npm run db:studio
```

### Key Schema Patterns
```typescript
// Example table definition
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").notNull().unique(),
  role: varchar("role").notNull().default("moderator"),
  clearanceLevel: integer("clearance_level").notNull().default(1),
  // ... more fields
});
```

### Database Connection
```typescript
// server/db.ts
import { drizzle } from "drizzle-orm/neon-serverless";
export const db = drizzle({ client: pool, schema });
```

### Migration Strategy
- **Development:** Use `npm run db:push` for schema changes
- **Production:** Generate proper migrations with `drizzle-kit generate`
- **Branches:** Use Neon branches for isolated testing

---

## 🔧 Backend (Node.js/Express)

### API Structure
- **Entry Point:** `server/index.ts`
- **Routes:** `server/routes.ts` (REST + WebSocket endpoints)
- **Database:** `server/db.ts` (Drizzle connection)
- **Services:** Individual service modules (AI, payments, etc.)

### Authentication Middleware
```typescript
// Simplified auth (development)
function isAuthenticated(req: any, res: any, next: any) {
  req.user = {
    claims: {
      sub: "demo_user_12345",
      email: "admin@fanzunlimited.com",
    },
  };
  next();
}
```

### Security Middleware Stack
- **Helmet:** Security headers
- **Rate Limiting:** Per-endpoint limits
- **CSRF Protection:** Token-based
- **Input Validation:** express-validator + Zod schemas
- **CORS:** Configured for development proxy

### Adding New Routes
```typescript
// In server/routes.ts
app.get("/api/new-endpoint", isAuthenticated, async (req, res) => {
  try {
    // Your logic here
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## ⚛️ Frontend (React + Vite)

### Routing (Wouter)
Routes defined in `client/src/App.tsx`:
```typescript
<Switch>
  <Route path="/" component={LandingHub} />
  <Route path="/dashboard" component={Dashboard} />
  <Route path="/ai-analysis" component={AIAnalysisPage} />
  // ... 80+ routes
</Switch>
```

### Data Fetching (TanStack Query)
```typescript
// Query client configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

// Usage in components
const { data, isLoading } = useQuery({
  queryKey: ['/api/users'],
  queryFn: getQueryFn({ on401: 'throw' }),
});
```

### UI Components (Radix + Tailwind)
```typescript
// Example component pattern
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function MyComponent() {
  return (
    <Card>
      <CardHeader>Title</CardHeader>
      <CardContent>
        <Button variant="default">Action</Button>
      </CardContent>
    </Card>
  );
}
```

### Component Organization
- **UI Kit:** `client/src/components/ui/` (Radix-based)
- **Feature Components:** `client/src/components/` (business logic)
- **Pages:** `client/src/pages/` (route components)
- **Modals:** `client/src/components/modals/`

### Adding New Pages
1. Create component in `pages/`
2. Add route in `App.tsx`
3. Use TanStack Query for data
4. Compose with Radix UI components
5. Style with Tailwind

---

## 🔴 Real-time & WebSockets

### WebSocket Implementation
- **Library:** `ws` (WebSocket server)
- **Port:** Same as API (5000)
- **Path:** Standard WebSocket upgrade

### Connection Management
```typescript
// In server/routes.ts
let connectedModerators: Set<WebSocket> = new Set();

function broadcastToModerators(message: any) {
  connectedModerators.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  });
}
```

### Event Types
- **Moderation alerts:** Real-time content flagging
- **Live stream events:** Viewer counts, status changes
- **System notifications:** Admin alerts, compliance warnings
- **Platform updates:** Multi-platform status sync

### Local Development
```javascript
// Test WebSocket connection
const ws = new WebSocket('ws://localhost:5000');
ws.onopen = () => console.log('Connected');
ws.onmessage = (e) => console.log('Message:', e.data);
```

---

## 🥽 VR/WebXR Development

### Local HTTPS Setup
VR/WebXR requires HTTPS for device APIs. For local development:

```bash
# Generate self-signed certificate
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes

# Start with HTTPS
npm run dev -- --https --cert cert.pem --key key.pem
```

### VR Features
- **WebRTC Rooms:** `webrtcRooms` table for session management
- **VR Sessions:** `vrSessions` table for room configuration
- **3D Environments:** JSON-based scene configuration

### Supported Devices
- **Oculus/Meta Quest:** WebXR compatible
- **HTC Vive:** Desktop VR
- **Mobile VR:** iOS Safari, Android Chrome

### Development Flow
1. Enable HTTPS dev server
2. Visit VR-enabled routes (`/vr-rendering`)
3. Grant camera/motion permissions
4. Test with VR device or browser emulation

---

## 🤖 AI Systems & OpenAI

### AI Integration Stack
- **OpenAI GPT-4o/GPT-5:** Content analysis and moderation
- **Whisper API:** Audio transcription
- **Perspective API:** Toxicity detection
- **Custom Models:** NSFW image classification

### Environment Configuration
```env
OPENAI_API_KEY="sk-..."
# Optional: Organization and project
OPENAI_ORG="org-..."
OPENAI_PROJECT="proj_..."
```

### Content Moderation Pipeline
```typescript
// Example moderation service
export async function moderateContent(content: string) {
  const result = await aiModerationService.analyzeContent(content);
  
  if (result.riskScore > 0.8) {
    // Auto-flag for human review
    await flagForReview(content, result);
  }
  
  return result;
}
```

### Safety & Rate Limiting
- **Rate Limits:** Built-in retry with exponential backoff
- **Safety Filters:** Pre/post processing for adult content compliance
- **Human Review:** Escalation workflows for high-risk content
- **Fallbacks:** Graceful degradation when AI services unavailable

### AI Service Files
- `server/openaiService.ts` - Main OpenAI integration
- `server/aiContentModeration.ts` - Content moderation logic
- `server/aiPredictiveAnalytics.ts` - Risk scoring and predictions

---

## 💳 Payment Processing

### Supported Processors
FanzDash exclusively uses **adult-industry friendly** payment processors:

- **CCBill** - Primary adult content billing
- **SegPay** - Alternative adult payment processor
- **Cryptocurrency** - Bitcoin, Ethereum, others
- **RocketGate** - High-risk merchant processing

### ⚠️ BANNED Processors
These processors **WILL NOT WORK** with adult content and will cause compliance issues:
- Stripe (banned for adult content)
- PayPal (banned for adult content)
- Square (banned for adult content)

### Payment Flow
```typescript
// Example payment processing
export async function processPayment(amount: number, processor: string) {
  const transaction = await paymentProcessor.createCharge({
    amount,
    processor,
    currency: 'USD',
    metadata: { platform: 'FanzDash' }
  });
  
  // Integrate with FanzFinance OS
  await financeOS.recordTransaction(transaction);
  
  return transaction;
}
```

### Webhook Handling
- **Signature Verification:** All webhooks must be cryptographically verified
- **Idempotency:** Prevent duplicate processing with unique keys
- **Error Handling:** Retry failed webhooks with exponential backoff

### Environment Variables
```env
# CCBill
CCBILL_MERCHANT_ID="your-merchant-id"
CCBILL_SUBACCOUNT="your-subaccount"
CCBILL_SALT="your-webhook-salt"

# SegPay
SEGPAY_PACKAGE_ID="your-package-id"
SEGPAY_MERCHANT_ID="your-merchant-id"
SEGPAY_ACCESS_KEY="your-access-key"
```

---

## 💰 FanzFinance OS

FanzFinance OS is the integrated financial management module designed to plug into the existing FanzDash platform, providing enterprise-grade financial operations.

### Core Features
- **Real-time Double-Entry Ledger:** Every transaction recorded with proper accounting
- **AI Financial Advisor:** Predictive insights and recommendations
- **Automated Payouts:** Smart payout scheduling and processing
- **Tax Compliance:** Automated tax calculations and reporting
- **Executive Dashboards:** Real-time financial KPIs and metrics
- **Risk & Audit Controls:** Compliance monitoring and reporting

### Integration Points
- **Payments Stack:** Hooks into all payment processor webhooks
- **API Gateway:** RESTful endpoints for finance operations
- **Bank Feeds:** Real-time bank transaction ingestion
- **On-chain Events:** Cryptocurrency transaction monitoring
- **Multi-platform Events:** Revenue aggregation across all 20+ platforms

### Configuration
```env
# FanzFinance OS Configuration
FANZFINANCE_ENABLED=true
FANZFINANCE_WEBHOOK_SECRET="your-webhook-secret"

# Database (shared with FanzDash or separate)
LEDGER_DB_URL="postgresql://user:pass@host:5432/finance"

# External Integrations
BANK_FEED_API_KEY="your-bank-feed-key"
CRYPTO_WEBHOOK_URL="https://yourapp.com/webhooks/crypto"
```

### Data Model
FanzFinance OS extends the existing schema with financial tables:
- **Accounts:** Chart of accounts for double-entry bookkeeping
- **Transactions:** Financial transaction records
- **Ledger Entries:** Double-entry postings (debits/credits)
- **Payouts:** Creator and affiliate payout records
- **Tax Records:** Compliance and reporting data

### API Endpoints
```typescript
// Example finance API endpoints
GET  /api/finance/accounts        # Chart of accounts
POST /api/finance/transactions    # Record transaction
GET  /api/finance/balance-sheet   # Financial statements
GET  /api/finance/cash-flow      # Cash flow analysis
POST /api/finance/payouts        # Initiate payouts
```

### Replit-Friendly Scaffold
FanzFinance OS is designed to work seamlessly in Replit environments:
- Environment variable configuration
- Shared database schema with FanzDash
- Built-in monitoring and health checks
- Auto-scaling capabilities

---

## 🔐 Security & RBAC

### Role-Based Access Control
As the Central Command Center, FanzDash implements military-grade access controls:
- **Clearance Levels:** 1-5 (higher = more access to sensitive operations)
  - **Level 1:** Basic moderator access
  - **Level 2:** Platform administrator access
  - **Level 3:** Regional manager access
  - **Level 4:** Executive access (financial oversight, strategic planning)
  - **Level 5:** Super Admin access (full system control, crisis management)
- **Roles:** creator, moderator, admin, executive, super_admin
- **Executive Functions:** 
  - Crisis management and emergency controls
  - Strategic business intelligence access
  - Financial oversight through FanzFinance OS
  - Legal compliance oversight and reporting
  - Multi-platform coordination and control
- **Module Permissions:** Granular per-feature access with executive overrides

### Authentication Stack
- **Primary:** Passport.js with multiple strategies
- **2FA/TOTP:** Time-based one-time passwords
- **WebAuthn:** Biometric authentication support
- **OAuth:** Google, GitHub, Facebook, Twitter, LinkedIn

### Security Middleware
```typescript
// Rate limiting by endpoint type
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 10,                    // 10 attempts
  message: "Too many authentication attempts"
});

// CSRF protection
const csrfProtection = csrf({ cookie: true });
```

### Secrets Management
- **Environment Variables:** Secure storage of API keys
- **Encryption:** AES-256 for sensitive data at rest
- **Key Rotation:** Regular rotation of JWT and encryption keys
- **Vault Storage:** Encrypted storage for illegal/sensitive content

### Security Checklist
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (Drizzle ORM)
- [ ] XSS protection (CSP headers)
- [ ] Rate limiting configured
- [ ] HTTPS in production
- [ ] Secure session configuration

---

## ⚖️ Legal Compliance

### 18 U.S.C. § 2257 Compliance
Record-keeping requirements for adult content:
- **Verification Flow:** `form2257Verifications` table
- **Required Documents:** Government-issued photo ID, age verification
- **Storage Requirements:** Secure, encrypted, auditable access

### GDPR/CCPA Compliance
- **Data Subject Rights:** Export, deletion, correction
- **Consent Management:** Granular privacy preferences
- **Data Minimization:** Retention policies and automated deletion
- **Privacy by Design:** Default privacy-protective settings

### Content Classification
- **Age Restrictions:** 18+ verification required
- **Geographic Blocking:** Country/region-based restrictions
- **Content Categories:** Automated classification and tagging

### Audit Trail
Every administrative action is logged:
```typescript
// Example audit logging
await auditTrail.insert({
  userId: admin.id,
  action: 'approve_content',
  resource: 'content_item',
  resourceId: contentId,
  ipAddress: req.ip,
  userAgent: req.get('User-Agent')
});
```

### Compliance Monitoring
- **Automated Scanning:** AI-powered content analysis
- **Human Review:** Escalation workflows for edge cases
- **Reporting:** Regular compliance reports and metrics

---

## 📊 Analytics & Predictive

### Event Collection
- **Client-side:** User interactions, page views, engagement
- **Server-side:** API calls, system events, errors
- **Real-time:** WebSocket events, live stream metrics

### Predictive Analytics
- **Risk Scoring:** AI-powered user and content risk assessment
- **Behavioral Analysis:** Pattern detection and anomaly identification
- **Revenue Forecasting:** ML models for financial predictions

### Analytics Architecture
```typescript
// Example analytics event
const analyticsEvent = {
  userId: user.id,
  eventType: 'content_upload',
  platformId: platform.id,
  metadata: {
    contentType: 'image',
    riskScore: 0.3,
    autoApproved: true
  },
  timestamp: new Date()
};
```

### Executive Intelligence Dashboards
As a Central Command Center, FanzDash provides strategic intelligence across the entire ecosystem:

**📊 Executive Command Center:**
- Cross-platform revenue analysis and forecasting
- Real-time threat assessment across all 20+ platforms
- Strategic performance indicators and trend analysis
- Competitive intelligence and market positioning
- Risk correlation analysis between platforms

**📏 Operations Control:**
- Multi-platform system health monitoring
- Resource allocation optimization
- Crisis response coordination dashboard
- Legal compliance status across jurisdictions

**🕰️ Real-time Command:**
- Live platform status monitoring
- Emergency response coordination
- Global content moderation queue prioritization
- Financial transaction flow visualization

**📈 Strategic Planning:**
- Platform-specific analytics and insights
- Growth opportunity identification
- Resource allocation recommendations
- Regulatory change impact analysis

---

## 🔑 Environment Variables

### Required Variables
```env
# Core Application
DATABASE_URL="postgresql://user:pass@host:5432/db"
NODE_ENV="development|production"
PORT=5000

# Security (Required)
JWT_SECRET="minimum-32-character-secret-key"
ENCRYPTION_KEY="exactly-32-character-encryption-key"

# AI Moderation (Required)
OPENAI_API_KEY="sk-your-openai-api-key"
```

### Optional but Recommended
```env
# Real-time Features
STREAM_API_KEY="getstream-io-api-key"
STREAM_API_SECRET="getstream-io-secret"

# Media Processing
COCONUT_API_KEY="coconut-media-encoding-key"

# Payment Processors
CCBILL_MERCHANT_ID="ccbill-merchant-id"
SEGPAY_PACKAGE_ID="segpay-package-id"

# Storage
AWS_S3_ACCESS_KEY="s3-access-key"
AWS_S3_SECRET_KEY="s3-secret-key"
AWS_S3_BUCKET="s3-bucket-name"

# Email
SENDGRID_API_KEY="sendgrid-api-key"
```

### Environment Setup
1. Copy `.env.example` to `.env`
2. Fill in required variables
3. Add optional variables as needed
4. Never commit `.env` to version control

---

## 🧪 Testing Strategy

### Current State
The repository currently has **no formal test suite**. This section outlines the planned testing strategy.

### Test Framework Plan
- **Unit Tests:** Jest or Vitest (Vite-native)
- **Integration Tests:** API testing with supertest
- **E2E Tests:** Playwright for full user journeys

### Mock Strategy
Essential services to mock in tests:
```typescript
// OpenAI API
const mockOpenAI = {
  analyzeContent: jest.fn().mockResolvedValue({
    riskScore: 0.3,
    categories: ['safe']
  })
};

// Payment Processors
const mockCCBill = {
  createCharge: jest.fn().mockResolvedValue({
    id: 'txn_123',
    status: 'completed'
  })
};

// WebSocket
const mockWebSocket = {
  broadcast: jest.fn(),
  connect: jest.fn()
};
```

### Smoke Tests
Run these before any deployment:
```bash
# Type checking
npm run check

# Database connectivity
curl http://localhost:5000/api/health

# AI service (with valid key)
curl -X POST http://localhost:5000/api/ai/moderate \
  -H "Content-Type: application/json" \
  -d '{"content": "test content"}'

# WebSocket connection
# Use browser dev tools or wscat
```

### Test Database
Use Neon branches for isolated testing:
1. Create test branch in Neon dashboard
2. Set `TEST_DATABASE_URL` environment variable
3. Run `npm run db:push` against test branch
4. Run tests with test data

---

## 📈 Observability

### Logging
- **Structure:** JSON-formatted logs with correlation IDs
- **Levels:** error, warn, info, debug
- **Context:** User ID, request ID, platform ID

```typescript
// Example structured logging
logger.info('Content moderation completed', {
  contentId,
  userId,
  riskScore: result.riskScore,
  platform: platform.name,
  duration: Date.now() - startTime
});
```

### Error Handling
```typescript
// Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  
  logger.error('API Error', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    userId: req.user?.id
  });
  
  res.status(status).json({ message });
});
```

### Performance Monitoring
- **API Response Times:** Built-in request timing
- **Database Query Performance:** Drizzle query logging
- **WebSocket Connection Health:** Connection count metrics
- **AI Service Latency:** OpenAI response time tracking

### Health Checks
Implement health check endpoints:
```typescript
app.get('/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: await checkDatabase(),
      openai: await checkOpenAI(),
      payments: await checkPaymentServices()
    }
  };
  res.json(health);
});
```

---

## ⚡ Performance & Scale

### Frontend Optimization
- **Code Splitting:** Route-based lazy loading with React.lazy()
- **Bundle Analysis:** `npm run build` shows bundle sizes
- **Image Optimization:** WebP format, lazy loading
- **Caching:** TanStack Query for aggressive caching

### Backend Performance
- **Connection Pooling:** Neon serverless handles automatically
- **Query Optimization:** Use Drizzle query builder efficiently
- **Caching Strategy:** In-memory caching for frequently accessed data
- **Rate Limiting:** Prevent abuse with tiered limits

### Database Optimization
- **Indexes:** 151 strategic indexes for optimal query performance
- **Query Patterns:** Avoid N+1 queries with proper joins
- **Connection Management:** Use connection pooling in production

```typescript
// Example optimized query
const usersWithPlatforms = await db.query.users.findMany({
  with: {
    platforms: true,  // Efficient join instead of separate queries
    analytics: true
  },
  limit: 50
});
```

### WebSocket Scaling
- **Connection Management:** Track and cleanup stale connections
- **Message Broadcasting:** Efficient fanout patterns
- **Backpressure Handling:** Queue management for high-volume events

### Monitoring Performance
- **Core Web Vitals:** LCP, FID, CLS tracking
- **API Latency:** P95/P99 response time monitoring
- **Database Performance:** Slow query identification
- **Memory Usage:** Node.js heap and RSS monitoring

---

## 🔄 Dev Workflows

### Branch Strategy
- **main:** Production-ready code
- **develop:** Integration branch for features
- **feature/*:** Individual feature branches
- **hotfix/*:** Critical production fixes

### Code Standards
- **TypeScript:** Strict mode enabled
- **Formatting:** Use Prettier (if configured)
- **Linting:** ESLint rules for consistency
- **Naming:** camelCase for variables, PascalCase for components

### Pull Request Checklist
- [ ] TypeScript compilation passes (`npm run check`)
- [ ] Database schema changes documented
- [ ] Environment variables documented
- [ ] Security considerations reviewed
- [ ] Breaking changes noted
- [ ] WARP.md updated if needed

### Git Commit Convention
```
feat: add new payment processor integration
fix: resolve WebSocket connection timeout
docs: update API documentation
refactor: optimize database queries
security: implement rate limiting
```

### Release Process
1. Create release branch from develop
2. Update version numbers
3. Generate changelog
4. Create GitHub release
5. Deploy to staging
6. Run smoke tests
7. Deploy to production

---

## 📚 Runbooks & Recipes

### Add a Database Table
```typescript
// 1. Add to shared/schema.ts
export const newTable = pgTable("new_table", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// 2. Add insert schema
export const insertNewTableSchema = createInsertSchema(newTable);

// 3. Push to database
npm run db:push

// 4. Verify in Drizzle Studio
npm run db:studio
```

### Add an API Endpoint
```typescript
// In server/routes.ts
app.get("/api/new-resource", 
  isAuthenticated,
  validateInput([
    query('limit').isInt({ min: 1, max: 100 }).optional(),
  ]),
  async (req, res) => {
    try {
      const { limit = 10 } = req.query;
      const results = await db.query.newTable.findMany({
        limit: Number(limit)
      });
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);
```

### Add a React Component
```typescript
// 1. Create component file
// client/src/components/NewComponent.tsx
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";

export function NewComponent() {
  const { data, isLoading } = useQuery({
    queryKey: ['/api/new-resource'],
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <Card>
      <CardContent>
        {data?.map(item => (
          <div key={item.id}>{item.name}</div>
        ))}
      </CardContent>
    </Card>
  );
}

// 2. Add route in App.tsx
<Route path="/new-feature" component={NewComponent} />
```

### Add a WebSocket Event
```typescript
// 1. Define event type
interface NewEvent {
  type: 'new_event';
  data: {
    message: string;
    timestamp: string;
  };
}

// 2. Emit event in server
function emitNewEvent(message: string) {
  const event: NewEvent = {
    type: 'new_event',
    data: {
      message,
      timestamp: new Date().toISOString()
    }
  };
  
  broadcastToModerators(event);
}

// 3. Handle in client
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'new_event') {
    console.log('New event:', data.data.message);
  }
};
```

### Integrate a New Payment Processor
```typescript
// 1. Add to paymentProcessors table
await db.insert(paymentProcessors).values({
  name: 'NewProcessor',
  processorType: 'adult_friendly',
  adultFriendly: true,
  supportedCurrencies: ['USD', 'EUR'],
  webhookEndpoints: ['/webhooks/newprocessor']
});

// 2. Add webhook handler
app.post('/webhooks/newprocessor', async (req, res) => {
  // Verify webhook signature
  const isValid = verifyWebhookSignature(req);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  // Process payment
  const transaction = await processPaymentWebhook(req.body);
  
  // Record in FanzFinance OS
  await financeOS.recordTransaction(transaction);
  
  res.json({ received: true });
});

// 3. Add environment variables
NEW_PROCESSOR_API_KEY="your-api-key"
NEW_PROCESSOR_WEBHOOK_SECRET="your-webhook-secret"
```

### Rotate API Keys
```bash
# 1. Update .env with new keys
OLD_OPENAI_API_KEY="sk-old..."
OPENAI_API_KEY="sk-new..."

# 2. Test new key
curl -H "Authorization: Bearer sk-new..." https://api.openai.com/v1/models

# 3. Deploy with new key
npm run build && npm start

# 4. Remove old key from .env
# 5. Update key in production environment
```

### Validate Development Environment
```bash
# Run the comprehensive validation script
node scripts/validate-setup.js

# This checks:
# - Node.js version compatibility
# - Required npm scripts
# - Critical dependencies
# - Environment variables
# - Directory structure
# - Key configuration files
```

---

## 🚨 Executive Emergency Controls

FanzDash provides critical emergency systems for executive-level crisis management across all 20+ platforms:

### Kill Switches
```typescript
// Example of platform-wide emergency shutdown
async function emergencyShutdown(platformId: string, reason: string) {
  // 1. Log critical event
  await auditTrail.insert({
    userId: executiveId,
    action: 'emergency_shutdown',
    resource: 'platform',
    resourceId: platformId,
    severity: 'critical',
    reason
  });
  
  // 2. Broadcast emergency alert to all connected admins
  broadcastToModerators({
    type: 'emergency_alert',
    platformId,
    action: 'shutdown',
    timestamp: new Date().toISOString()
  });
  
  // 3. Execute platform shutdown
  return await db.transaction(async (tx) => {
    // Suspend all active services
    await tx.update(platforms)
      .set({ status: 'emergency_shutdown', lastActive: new Date() })
      .where(eq(platforms.id, platformId));
    
    // Close active streams
    await tx.update(liveStreams)
      .set({ status: 'terminated', endedAt: new Date() })
      .where(eq(liveStreams.platformId, platformId));
      
    // Pause payment processing
    await tx.update(paymentProcessors)
      .set({ status: 'paused' })
      .where(eq(paymentProcessors.platformId, platformId));
      
    return { success: true, shutdownTime: new Date() };
  });
}
```

### Crisis Mitigation
- **Content Lockdown:** Freeze all new content across specified platforms
- **User Access Restrictions:** Instantly restrict user access based on severity
- **Legal Hold Activation:** Trigger legal hold on specific content or accounts
- **Financial Freeze:** Pause all financial transactions during investigation
- **Cross-Platform Coordination:** Synchronized emergency response

### Emergency Access Protocols
- **Biometric Override:** Executive fingerprint/facial authentication
- **Emergency Access Codes:** Time-sensitive super admin access codes
- **Audit Trail:** Every emergency action is extensively logged with executive identity verification
- **Notification Chain:** Automated escalation to legal, compliance, and executive teams

## 🆘 Troubleshooting

### Installation Issues

**Problem:** `npm install` fails with peer dependency conflicts
**Solution:** Always use `npm install --legacy-peer-deps`

**Problem:** `npm run dev` fails to start
**Solution:** 
1. Check if port 5000 is in use: `lsof -i :5000`
2. Kill conflicting processes: `kill -9 <PID>`
3. Try alternative port: `PORT=5001 npm run dev`

### Database Issues

**Problem:** `npm run db:push` fails with connection error
**Solution:**
1. Verify `DATABASE_URL` in `.env`
2. Check Neon dashboard for database status
3. Test connection: `psql $DATABASE_URL -c "SELECT 1"`

**Problem:** Schema drift errors
**Solution:**
```bash
# Reset local schema
npm run db:push --force

# Or create new Neon branch
# Update DATABASE_URL to new branch
npm run db:push
```

**Problem:** Query performance issues
**Solution:**
1. Check indexes: `EXPLAIN ANALYZE SELECT ...`
2. Review slow query logs
3. Optimize with proper indexes

### AI/OpenAI Issues

**Problem:** OpenAI API returns 401 Unauthorized
**Solution:**
1. Verify `OPENAI_API_KEY` in `.env`
2. Check API key permissions in OpenAI dashboard
3. Test with curl: `curl -H "Authorization: Bearer $OPENAI_API_KEY" https://api.openai.com/v1/models`

**Problem:** OpenAI API rate limit (429)
**Solution:**
- Implement exponential backoff (already built-in)
- Upgrade OpenAI plan for higher limits
- Cache results to reduce API calls

**Problem:** AI moderation not working
**Solution:**
1. Check OpenAI API key validity
2. Verify content format and size limits
3. Check rate limiting and retry logic

### WebSocket Issues

**Problem:** WebSocket connections fail
**Solution:**
1. Check CORS configuration
2. Verify WebSocket upgrade headers
3. Test with simple client:
```javascript
const ws = new WebSocket('ws://localhost:5000');
ws.onopen = () => console.log('Connected');
ws.onerror = (e) => console.error('WebSocket error:', e);
```

**Problem:** WebSocket messages not received
**Solution:**
1. Check connection state before sending
2. Verify message format (JSON)
3. Add error handling for malformed messages

### Payment Processor Issues

**Problem:** Webhook signature verification fails
**Solution:**
1. Verify webhook secret in environment variables
2. Check signature algorithm (HMAC-SHA256 vs others)
3. Log raw payload for debugging
4. Ensure charset encoding matches

**Problem:** Payment processor returns errors
**Solution:**
1. Check API credentials and permissions
2. Verify account is enabled for adult content
3. Test in sandbox mode first
4. Review processor-specific documentation

### VR/WebXR Issues

**Problem:** VR features don't load
**Solution:**
1. Ensure HTTPS is enabled for local development
2. Check browser VR/WebXR support
3. Verify device permissions (camera, motion)
4. Test with WebXR emulator

**Problem:** WebXR device not detected
**Solution:**
1. Check device compatibility
2. Enable developer mode on VR device
3. Use browser debugging tools
4. Test WebXR API availability: `navigator.xr`

### Performance Issues

**Problem:** Slow page loads
**Solution:**
1. Check bundle size: `npm run build`
2. Enable code splitting for large routes
3. Optimize images and assets
4. Review TanStack Query cache settings

**Problem:** High memory usage
**Solution:**
1. Check for memory leaks in WebSocket connections
2. Review database connection pooling
3. Monitor Node.js heap usage
4. Implement proper cleanup in React components

### TypeScript Issues

**Problem:** `npm run check` fails with compilation errors
**Solution:**
1. **Missing Types:** Install missing type definitions:
   ```bash
   npm install --save-dev @types/lusca
   ```

2. **API Response Type Issues:** The codebase has several places where API responses are not properly typed. Common patterns:
   ```typescript
   // Instead of: response.message (error)
   // Use: await response.json() then access properties
   const data = await response.json();
   return data.message;
   ```

3. **Drizzle ORM Issues:** Several database queries have type mismatches. Use `isNull()` instead of comparing with `null`:
   ```typescript
   // Instead of: eq(column, null)
   // Use: isNull(column)
   import { isNull } from "drizzle-orm";
   ```

4. **Import Issues:** Some imports reference non-existent exports:
   ```typescript
   // Fix missing Lucide React icons
   import { Clock } from "lucide-react"; // Make sure icon exists
   // Or use alternative: import { Timer as Clock } from "lucide-react";
   ```

5. **Bypass for Development:** If you need to continue development despite type errors:
   ```bash
   # Skip type checking temporarily
   npm run dev  # This still works even with type errors
   # Fix types incrementally
   ```

### Environment Issues

**Problem:** Environment variables not loading
**Solution:**
1. Verify `.env` file exists and is properly formatted
2. Check for spaces around `=` signs
3. Restart development server
4. Use `process.env.NODE_ENV` to debug

**Problem:** CORS errors in development
**Solution:**
1. Check Vite proxy configuration
2. Verify backend CORS settings
3. Ensure frontend and backend ports match expectations

---

## 📝 Maintenance

### Ownership
**Primary Maintainer:** Development Team Lead  
**Update Frequency:** Every major release or breaking change  
**Review Schedule:** Monthly review of accuracy and completeness

### Update Triggers
Update this WARP.md when:
- [ ] New environment variables are added
- [ ] Database schema changes significantly
- [ ] New payment processors are integrated
- [ ] AI models or safety policies change
- [ ] New development workflows are established
- [ ] Security procedures are updated
- [ ] New compliance requirements are added

### Verification Checklist
Monthly verification should confirm:
- [ ] All commands execute successfully
- [ ] Environment variables are documented
- [ ] Architecture diagrams are current
- [ ] Troubleshooting steps resolve issues
- [ ] Links and references are valid
- [ ] New features are documented

### Change Log
- **2025-01-09:** Initial WARP.md creation
- **Future:** Track major updates here

### Contact
For WARP.md updates or questions:
- **Technical Lead:** [Insert contact]
- **Documentation Issues:** Create GitHub issue
- **Emergency Updates:** Slack #dev-team

---

*This WARP.md serves as the definitive guide for developing on FanzDash. Keep it updated, accurate, and actionable.*

**Last Verified:** January 9, 2025  
**Next Review:** February 9, 2025
