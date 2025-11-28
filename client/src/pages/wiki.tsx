import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Search,
  FileText,
  Shield,
  Users,
  DollarSign,
  Settings,
  BarChart3,
  Cloud,
  Lock,
  Zap,
  Globe,
  Database,
  Video,
  MessageSquare,
  Gavel,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import { TutorialBot } from "@/components/TutorialBot";
import { AISearchBar } from "@/components/AISearchBar";

interface WikiArticle {
  id: string;
  title: string;
  category: string;
  content: string;
  tags: string[];
  relatedArticles: string[];
}

export default function WikiPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);

  const wikiCategories = [
    { id: "overview", name: "System Overview", icon: <BookOpen className="h-4 w-4" /> },
    { id: "compliance", name: "Compliance & Legal", icon: <Shield className="h-4 w-4" /> },
    { id: "content", name: "Content Management", icon: <FileText className="h-4 w-4" /> },
    { id: "users", name: "User Management", icon: <Users className="h-4 w-4" /> },
    { id: "payments", name: "Payments & Finance", icon: <DollarSign className="h-4 w-4" /> },
    { id: "storage", name: "Storage & Media", icon: <Cloud className="h-4 w-4" /> },
    { id: "security", name: "Security & Monitoring", icon: <Lock className="h-4 w-4" /> },
    { id: "analytics", name: "Analytics & Reporting", icon: <BarChart3 className="h-4 w-4" /> },
    { id: "automation", name: "Automation & AI", icon: <Zap className="h-4 w-4" /> },
    { id: "technical", name: "Technical Reference", icon: <Settings className="h-4 w-4" /> },
  ];

  const wikiArticles: WikiArticle[] = [
    {
      id: "fanzdash-overview",
      title: "FanzDash Overview",
      category: "overview",
      content: `# FanzDash - Universal Admin Control Center

FanzDash is the central administration platform for the entire Fanz Unlimited Network ecosystem, managing 94+ adult content platforms.

## Key Capabilities

### 🎯 Platform Management
- **Multi-Platform Control**: Manage 94+ platforms from single dashboard
- **Universal 2257 Compliance**: Centralized age verification and record keeping
- **Content Moderation**: AI-powered content review and approval workflows
- **Creator Management**: Onboarding, verification, and performance tracking

### 🛡️ Compliance & Legal
- **18 U.S.C. § 2257 Compliance**: Complete record-keeping system
- **DMCA Takedown Management**: Automated copyright claim processing
- **GDPR/CCPA Compliance**: Data protection and privacy controls
- **Legal Hold Management**: Document preservation for litigation
- **Compliance Monitoring**: Real-time violation detection and prevention

### 💰 Financial Management
- **Payment Processing**: Multiple adult-friendly payment processors
- **Payout Management**: Automated creator payments
- **Tax Management**: W-9/1099 generation and reporting
- **Chargeback Protection**: Fraud detection and prevention
- **Currency Support**: Multi-currency and cryptocurrency payments

### 📊 Analytics & Intelligence
- **Real-time Analytics**: Live platform performance metrics
- **Predictive Analytics**: AI-powered trend forecasting
- **User Behavior Analysis**: Engagement and retention tracking
- **Revenue Analytics**: Financial performance dashboards
- **Creator Intelligence**: Performance optimization insights

### 🔒 Security & Monitoring
- **Quantum War Room**: Advanced threat detection and response
- **Audit Trails**: Complete activity logging
- **Data Loss Prevention**: Content protection and encryption
- **File Security Scanning**: Malware and threat detection
- **Access Control**: Role-based permissions (RBAC)

## Architecture

FanzDash uses a modern tech stack:
- **Frontend**: React + TypeScript + TailwindCSS
- **Backend**: Node.js + Express
- **Database**: PostgreSQL with multi-schema architecture
- **Storage**: S3-compatible object storage (27+ providers)
- **Real-time**: WebSockets for live updates
- **AI/ML**: Integrated machine learning for moderation and analytics`,
      tags: ["overview", "getting-started", "architecture"],
      relatedArticles: ["platform-architecture", "getting-started", "api-reference"],
    },
    {
      id: "2257-compliance",
      title: "18 U.S.C. § 2257 Compliance System",
      category: "compliance",
      content: `# 18 U.S.C. § 2257 Record-Keeping Compliance

## Overview

The 2257 system ensures full compliance with federal law requiring age verification and record-keeping for adult content.

## Features

### Content Creator Verification
1. **Identity Verification**
   - Government-issued ID upload
   - Facial recognition matching
   - Live video verification
   - Address verification

2. **Co-Star Management**
   - Individual verification for all performers
   - Scene-by-scene documentation
   - Release form collection
   - Consent documentation

3. **Record Keeping**
   - Digital 2257 records
   - Custodian of records designation
   - Inspection-ready documentation
   - Automatic compliance reporting

### Workflow

\`\`\`
1. Creator submits verification documents
2. AI validates document authenticity
3. Manual review by compliance team
4. Biometric verification
5. 2257 records generated
6. Content approved for publication
\`\`\`

### Best Practices

- ✅ Verify ALL performers before content publication
- ✅ Maintain records for duration of content availability + 7 years
- ✅ Update records when content is edited or redistributed
- ✅ Designate backup custodians of records
- ✅ Prepare for potential inspections

### Common Mistakes

- ❌ Publishing content before verification complete
- ❌ Accepting expired identification documents
- ❌ Missing co-star documentation
- ❌ Inadequate record storage/backup
- ❌ Unclear custodian designation

## Access

Navigate to: **Compliance > Universal 2257 System**`,
      tags: ["compliance", "legal", "2257", "verification"],
      relatedArticles: ["creator-verification", "costar-verification", "compliance-monitoring"],
    },
    {
      id: "storage-providers",
      title: "Cloud Storage Provider Configuration",
      category: "storage",
      content: `# Cloud Storage Provider Management

## Overview

FanzDash supports 27+ cloud storage providers with encryption and intelligent routing.

## Supported Providers

### Tier 1 (Enterprise)
- **Amazon S3** - Industry standard, global reach
- **Google Cloud Storage** - High performance, ML integration
- **Azure Blob Storage** - Microsoft ecosystem
- **Oracle Cloud** - Enterprise features
- **IBM Cloud** - Hybrid cloud capabilities

### Tier 2 (Performance)
- **Cloudflare R2** - Zero egress fees
- **DigitalOcean Spaces** - Developer-friendly
- **Linode Object Storage** - Fast, reliable
- **Vultr Object Storage** - Global edge network
- **Bunny.net** - CDN-integrated storage

### Tier 3 (Cost-Effective)
- **Wasabi** - Hot cloud storage
- **Backblaze B2** - Affordable pricing
- **Contabo** - Budget-friendly
- **Hetzner** - European provider
- **Scaleway** - European alternative

### Specialty Providers
- **Filebase** - Web3/IPFS decentralized
- **Storj DCS** - Fully decentralized
- **MinIO** - Self-hosted S3-compatible

## Configuration

### Basic Setup

1. **Access Key Configuration**
   \`\`\`
   - Navigate to Storage Settings
   - Select provider
   - Enter Access Key & Secret Key
   - Configure region and bucket
   - Test connection
   \`\`\`

2. **Encryption Settings**
   - Enable end-to-end encryption
   - Choose algorithm: AES-256, AES-128, or ChaCha20
   - Set encryption key (auto-generated if blank)
   - Files encrypted client-side before upload

3. **Flow Routing Rules**
   - Set routing priority (0-100)
   - Define file type preferences
   - Set size limits
   - Configure content type matching

### Advanced Features

#### Intelligent Routing
\`\`\`typescript
// Example: Route videos to high-performance provider
Provider: Cloudflare R2
Priority: 90
File Types: mp4,mov,avi,webm
Min Size: 10 MB
Max Size: unlimited
\`\`\`

#### Multi-Provider Strategy
\`\`\`
Primary: S3 (general content)
Video: Cloudflare R2 (large files)
Images: Bunny.net (CDN-optimized)
Backup: Wasabi (cold storage)
Archive: Backblaze B2 (long-term)
\`\`\`

## Best Practices

- ✅ Use multiple providers for redundancy
- ✅ Enable encryption for sensitive content
- ✅ Configure CDN for frequently accessed files
- ✅ Set up routing rules for optimal performance
- ✅ Monitor storage costs across providers
- ✅ Test failover scenarios

## Access

Navigate to: **Settings > Storage Settings**`,
      tags: ["storage", "cloud", "configuration", "providers"],
      relatedArticles: ["file-security", "media-protection", "cdn-configuration"],
    },
    {
      id: "payment-processing",
      title: "Payment Processing & Payouts",
      category: "payments",
      content: `# Payment Processing System

## Overview

FanzDash integrates with adult-friendly payment processors and automates creator payouts.

## Payment Processors

### Supported Processors
- **CCBill** - Industry leader for adult content
- **Epoch** - Global payment solutions
- **SegPay** - High-risk payment processing
- **Paxum** - Adult industry specialist
- **Cryptocurrency** - Bitcoin, Ethereum, etc.

### Configuration

Each processor requires:
1. Merchant account credentials
2. API keys
3. Webhook endpoints
4. Currency configuration
5. Fraud prevention settings

## Payout Management

### Creator Payouts

**Schedule Options:**
- Daily (minimum threshold)
- Weekly (default)
- Bi-weekly
- Monthly

**Payment Methods:**
- ACH/Wire Transfer
- PayPal/Venmo
- Paxum
- Cryptocurrency
- Paper Check

### Payout Process

\`\`\`
1. Revenue accrues in creator accounts
2. Automatic calculation of platform fees
3. Tax withholding (if applicable)
4. Threshold check
5. Payout batch generation
6. Payment processor execution
7. Creator notification
8. Tax document generation (1099)
\`\`\`

## Tax Compliance

### US Creators (W-9)
- Collect W-9 forms
- Generate 1099-NEC annually
- Track state tax thresholds
- Support backup withholding

### International Creators (W-8)
- Collect W-8BEN forms
- Apply tax treaty rates
- Handle currency conversion
- Comply with local regulations

## Chargeback Protection

**Prevention:**
- AVS verification
- CVV checks
- 3D Secure
- IP geolocation
- Device fingerprinting

**Management:**
- Automated dispute response
- Evidence collection
- Creator notification
- Account suspension (high chargeback rate)

## Access

Navigate to: **Finance > Payment Management**`,
      tags: ["payments", "payouts", "finance", "tax"],
      relatedArticles: ["tax-management", "creator-management", "withdrawal-management"],
    },
    {
      id: "content-moderation",
      title: "AI-Powered Content Moderation",
      category: "content",
      content: `# Content Moderation Hub

## Overview

Automated and manual content review using AI and human moderators.

## AI Moderation Features

### Image Analysis
- **Nudity Detection** - Classify explicit content levels
- **Face Recognition** - Match against verified creators
- **Age Estimation** - Flag potential underage content
- **Object Detection** - Identify prohibited items
- **Scene Classification** - Categorize content type

### Video Analysis
- **Frame-by-frame scanning**
- **Audio analysis** (detect prohibited speech)
- **Scene change detection**
- **Watermark detection**
- **Deepfake detection**

### Text Moderation
- **Profanity filtering**
- **Hate speech detection**
- **Personal information (PII) redaction**
- **Spam detection**
- **Link scanning**

## Moderation Workflow

\`\`\`
1. Content uploaded by creator
2. AI pre-screening
   ├─ APPROVED → Auto-publish
   ├─ FLAGGED → Human review queue
   └─ BLOCKED → Reject + notification
3. Human moderator review (if flagged)
4. Final approval/rejection
5. Creator notification
6. Compliance logging
\`\`\`

## Moderation Rules

### Prohibited Content
- ❌ Underage or age-ambiguous performers
- ❌ Non-consensual content
- ❌ Bestiality or animal abuse
- ❌ Extreme violence or gore
- ❌ Illegal substances
- ❌ Weapons or terrorism
- ❌ Copyrighted material (DMCA)

### Review Priorities
1. **Immediate Block** - Obvious violations
2. **High Priority** - Age verification concerns
3. **Medium Priority** - Policy clarification needed
4. **Low Priority** - Minor quality issues
5. **Auto-Approve** - Verified safe content

## Moderator Tools

- Content flagging system
- Bulk actions
- Quick response templates
- Creator communication
- Appeal management
- Performance analytics

## Access

Navigate to: **Content > Moderation Hub**`,
      tags: ["moderation", "content", "ai", "compliance"],
      relatedArticles: ["intelligent-moderation", "ai-analysis", "creator-management"],
    },
    {
      id: "analytics-dashboard",
      title: "Analytics & Business Intelligence",
      category: "analytics",
      content: `# Analytics Dashboard

## Overview

Comprehensive analytics for platform performance, creator metrics, and revenue tracking.

## Key Metrics

### Platform Metrics
- **Daily Active Users (DAU)**
- **Monthly Active Users (MAU)**
- **User Retention Rates**
- **Session Duration**
- **Bounce Rate**
- **Conversion Rate**

### Revenue Metrics
- **Gross Revenue**
- **Net Revenue** (after fees)
- **Average Revenue Per User (ARPU)**
- **Customer Lifetime Value (CLV)**
- **Churn Rate**
- **Revenue by Source**

### Creator Metrics
- **Content Upload Rate**
- **Engagement Rate**
- **Subscriber Growth**
- **Revenue per Creator**
- **Creator Retention**
- **Top Performers**

### Content Metrics
- **Views/Impressions**
- **Watch Time**
- **Engagement (likes, comments)**
- **Share Rate**
- **Content Performance by Category**

## Dashboard Features

### Real-Time Analytics
- Live user count
- Active sessions
- Revenue ticker
- Upload activity
- Moderation queue

### Predictive Analytics
- Revenue forecasting
- Churn prediction
- Content trend analysis
- Seasonal patterns
- User behavior modeling

### Custom Reports
- Date range selection
- Metric filtering
- Export to PDF/Excel
- Scheduled reports
- Email distribution

## Data Visualization

### Chart Types
- **Line Charts** - Trends over time
- **Bar Charts** - Comparisons
- **Pie Charts** - Distribution
- **Heat Maps** - Geographic data
- **Funnel Charts** - Conversion flows

## Access

Navigate to: **Analytics > Dashboard**`,
      tags: ["analytics", "reporting", "metrics", "business-intelligence"],
      relatedArticles: ["predictive-analytics", "advanced-analytics", "revenue-tracking"],
    },
    {
      id: "api-reference",
      title: "API Reference & Integration",
      category: "technical",
      content: `# API Reference

## Overview

RESTful API for programmatic access to FanzDash functionality.

## Authentication

### API Keys
\`\`\`bash
# Generate API key
POST /api/admin/api-keys
{
  "name": "My Integration",
  "permissions": ["read:users", "write:content"],
  "expiresAt": "2025-12-31T23:59:59Z"
}

# Use API key
curl -H "Authorization: Bearer YOUR_API_KEY" \\
     https://api.fanzdash.com/v1/users
\`\`\`

## Core Endpoints

### User Management
\`\`\`
GET    /api/users              # List users
GET    /api/users/:id          # Get user details
POST   /api/users              # Create user
PATCH  /api/users/:id          # Update user
DELETE /api/users/:id          # Delete user
\`\`\`

### Content Management
\`\`\`
GET    /api/content            # List content
POST   /api/content/upload     # Upload content
GET    /api/content/:id        # Get content details
PATCH  /api/content/:id        # Update content
DELETE /api/content/:id        # Delete content
\`\`\`

### Compliance
\`\`\`
GET    /api/compliance/status         # Get compliance status
GET    /api/compliance/verifications  # List verifications
POST   /api/compliance/verify         # Submit verification
GET    /api/compliance/2257/:id       # Get 2257 records
\`\`\`

### Storage
\`\`\`
GET    /api/admin/storage             # List providers
PATCH  /api/admin/storage/:id         # Update provider
POST   /api/admin/storage/:id/test    # Test connection
POST   /api/admin/storage/:id/set-default
\`\`\`

### Analytics
\`\`\`
GET    /api/analytics/dashboard       # Dashboard data
GET    /api/analytics/revenue         # Revenue metrics
GET    /api/analytics/users           # User metrics
GET    /api/analytics/content         # Content metrics
\`\`\`

## Webhooks

### Subscribe to Events
\`\`\`bash
POST /api/admin/webhooks
{
  "url": "https://your-app.com/webhooks",
  "events": [
    "content.uploaded",
    "user.verified",
    "payment.completed",
    "compliance.violation"
  ]
}
\`\`\`

### Webhook Events
- \`content.uploaded\` - New content submitted
- \`content.approved\` - Content passed moderation
- \`content.rejected\` - Content failed moderation
- \`user.created\` - New user registered
- \`user.verified\` - User completed verification
- \`payment.completed\` - Payment processed
- \`payout.sent\` - Creator payout sent
- \`compliance.violation\` - Compliance issue detected

## Rate Limits

- **Standard**: 1000 requests/hour
- **Premium**: 10,000 requests/hour
- **Enterprise**: Custom limits

## SDKs

### JavaScript/TypeScript
\`\`\`typescript
import { FanzDashAPI } from '@fanzdash/sdk';

const api = new FanzDashAPI('YOUR_API_KEY');

// Get users
const users = await api.users.list();

// Upload content
const upload = await api.content.upload({
  file: fileData,
  title: 'My Content',
  tags: ['tag1', 'tag2'],
});
\`\`\`

### Python
\`\`\`python
from fanzdash import FanzDashAPI

api = FanzDashAPI('YOUR_API_KEY')

# Get users
users = api.users.list()

# Upload content
upload = api.content.upload(
    file=file_data,
    title='My Content',
    tags=['tag1', 'tag2']
)
\`\`\`

## Access

Navigate to: **Settings > API Integration Management**`,
      tags: ["api", "technical", "integration", "developer"],
      relatedArticles: ["webhooks", "authentication", "rate-limits"],
    },
    {
      id: "security-best-practices",
      title: "Security Best Practices",
      category: "security",
      content: `# Security Best Practices

## Overview

Essential security practices for protecting the FanzDash ecosystem.

## Access Control

### Role-Based Access Control (RBAC)
- **Super Admin** - Full platform access
- **Platform Admin** - Platform-specific control
- **Moderator** - Content review access
- **Support** - User assistance only
- **Finance** - Payment/payout access
- **Compliance Officer** - Legal/compliance access

### Principle of Least Privilege
- Grant minimum required permissions
- Regular permission audits
- Time-limited elevated access
- Require justification for access requests

## Authentication

### Multi-Factor Authentication (MFA)
- ✅ Enable MFA for all admin accounts
- ✅ Use authenticator apps (not SMS)
- ✅ Backup codes in secure location
- ✅ Enforce MFA for sensitive operations

### Password Policies
- Minimum 12 characters
- Require uppercase, lowercase, numbers, symbols
- Password history (prevent reuse)
- 90-day rotation
- Account lockout after failed attempts

## Data Protection

### Encryption
- **At Rest**: AES-256 encryption for stored data
- **In Transit**: TLS 1.3 for all communications
- **End-to-End**: Client-side encryption for sensitive files
- **Key Management**: Secure key rotation and storage

### Data Classification
- **Public** - Marketing materials
- **Internal** - Business operations data
- **Confidential** - User PII, financial data
- **Restricted** - 2257 records, legal documents

## Network Security

### Firewall Rules
- Whitelist approved IP ranges
- Block known malicious IPs
- Rate limiting on all endpoints
- DDoS protection enabled

### API Security
- API key rotation every 90 days
- Scope-limited permissions
- Request signing
- TLS for all API calls

## Monitoring & Incident Response

### Security Monitoring
- **Real-time Alerts**
  - Failed login attempts
  - Privilege escalation
  - Unusual data access
  - API abuse

- **Audit Logging**
  - All administrative actions
  - Data access logs
  - System changes
  - Failed authorization attempts

### Incident Response Plan
\`\`\`
1. Detection & Analysis
   - Identify security incident
   - Assess severity and impact

2. Containment
   - Isolate affected systems
   - Revoke compromised credentials
   - Block attacker access

3. Eradication
   - Remove malware/backdoors
   - Patch vulnerabilities
   - Reset compromised accounts

4. Recovery
   - Restore systems from backups
   - Verify system integrity
   - Resume normal operations

5. Post-Incident
   - Document lessons learned
   - Update security procedures
   - Notify affected parties
\`\`\`

## Compliance

### Regular Security Audits
- Quarterly vulnerability scans
- Annual penetration testing
- Code security reviews
- Third-party security assessments

### Compliance Standards
- SOC 2 Type II
- PCI DSS (for payment processing)
- GDPR (data protection)
- CCPA (California privacy)

## Access

Navigate to: **Security > Ecosystem Security Management**`,
      tags: ["security", "best-practices", "compliance", "monitoring"],
      relatedArticles: ["audit-trail", "data-loss-prevention", "access-control"],
    },
  ];

  const filteredArticles = wikiArticles.filter((article) => {
    const matchesSearch =
      searchQuery === "" ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesSearch;
  });

  const renderMarkdown = (content: string) => {
    // Simple markdown rendering (in production, use a proper markdown library)
    return content
      .split("\n")
      .map((line, idx) => {
        // Headers
        if (line.startsWith("### ")) {
          return <h3 key={idx} className="text-lg font-semibold mt-4 mb-2">{line.replace("### ", "")}</h3>;
        }
        if (line.startsWith("## ")) {
          return <h2 key={idx} className="text-xl font-bold mt-6 mb-3">{line.replace("## ", "")}</h2>;
        }
        if (line.startsWith("# ")) {
          return <h1 key={idx} className="text-2xl font-bold mb-4">{line.replace("# ", "")}</h1>;
        }

        // Code blocks
        if (line.startsWith("```")) {
          return <div key={idx} className="bg-gray-900 text-gray-100 p-3 rounded my-2 font-mono text-sm overflow-x-auto">{line}</div>;
        }

        // Lists
        if (line.startsWith("- ")) {
          return <li key={idx} className="ml-4">{line.replace("- ", "")}</li>;
        }
        if (/^\d+\./.test(line)) {
          return <li key={idx} className="ml-4">{line.replace(/^\d+\.\s/, "")}</li>;
        }

        // Bold
        const boldPattern = /\*\*(.*?)\*\*/g;
        if (boldPattern.test(line)) {
          const parts = line.split(boldPattern);
          return (
            <p key={idx} className="mb-2">
              {parts.map((part, i) => (i % 2 === 1 ? <strong key={i}>{part}</strong> : part))}
            </p>
          );
        }

        // Regular paragraph
        return line.trim() ? <p key={idx} className="mb-2">{line}</p> : <br key={idx} />;
      });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <BookOpen className="h-8 w-8 mr-3 text-blue-600" />
            FanzDash Wiki & Knowledge Base
          </h1>
          <p className="text-muted-foreground mt-2">
            Complete documentation for the FanzDash ecosystem
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          {wikiArticles.length} Articles
        </Badge>
      </div>

      {/* AI-Powered Search */}
      <AISearchBar
        placeholder="Ask anything... AI will find the answer"
        onResultClick={(result) => {
          // Find and select the article
          const article = wikiArticles.find(a => a.title === result.title);
          if (article) {
            setSelectedArticle(article.id);
          }
        }}
      />

      <div className="grid grid-cols-12 gap-6">
        {/* Categories Sidebar */}
        <div className="col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {wikiCategories.map((category) => {
                const count = wikiArticles.filter((a) => a.category === category.id).length;
                return (
                  <Button
                    key={category.id}
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => setSearchQuery("")}
                  >
                    {category.icon}
                    <span className="ml-2 flex-1 text-left">{category.name}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </Button>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="col-span-9">
          {selectedArticle ? (
            <Card>
              <CardHeader>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedArticle(null)}
                  className="mb-2"
                >
                  ← Back to all articles
                </Button>
                <CardTitle>
                  {wikiArticles.find((a) => a.id === selectedArticle)?.title}
                </CardTitle>
                <div className="flex flex-wrap gap-2 mt-2">
                  {wikiArticles
                    .find((a) => a.id === selectedArticle)
                    ?.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                </div>
              </CardHeader>
              <CardContent className="prose max-w-none">
                {renderMarkdown(
                  wikiArticles.find((a) => a.id === selectedArticle)?.content || ""
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredArticles.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">No articles found matching your search.</p>
                  </CardContent>
                </Card>
              ) : (
                filteredArticles.map((article) => (
                  <Card
                    key={article.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setSelectedArticle(article.id)}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{article.title}</span>
                        <Badge variant="outline">
                          {wikiCategories.find((c) => c.id === article.category)?.name}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {article.content.substring(0, 200)}...
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {article.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tutorial Bot */}
      <TutorialBot
        pageName="Wiki & Knowledge Base"
        pageContext="Comprehensive documentation and help articles"
        isFloating={true}
      />
    </div>
  );
}
