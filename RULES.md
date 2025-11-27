# 🚀 FANZ Platform Rules & Guidelines

## 🎯 Core Principles

### 1. Creator-First Mandate
- **NO** feature ships unless it boosts creator earnings, control, or safety
- Ownership is absolute: creators always own their content and data
- Any friction that doesn't serve creators or fans is rejected
- Default stance: creators keep 100% of earnings, own their content, and control data visibility

### 2. Zero Dark Features
- No hidden policies, no "silent" updates — everything is transparent
- All policy changes require creator consent and advance notice
- Features must be explainable and auditable

### 3. Fail Fast, Recover Faster
- Any release must have a rollback plan executable in ≤5 minutes
- Automated rollback triggers if error rate >2% or latency >500ms P95
- Feature flags mandatory; expire ≤90 days

## 🛡️ Security & Compliance Rules

### Payment Processors
- **NEVER** use Stripe or PayPal as processors
- Adult-friendly gateways only: CCBill, Segpay, Epoch, Vendo, Verotel, NetBilling, CommerceGate, RocketGate, CentroBill, Payze, Kolektiva, PayGarden
- Host Merchant Services (HMS) for MID management, risk, and chargebacks
- Crypto: BitPay, Coinbase Commerce, NOWPayments, CoinGate, CoinsPaid, OpenNode, GoCoin, Uphold Merchant

### Compliance Requirements
- **ADA and accessibility standards** - WCAG 2.2 AA minimum
- **GDPR regulations** - European privacy compliance
- **All relevant laws** governing online transactions and businesses
- 2257 compliance for age verification
- DMCA enforcement

### Security Standards
- **TLS 1.3** in transit; **AES-256** at rest
- Zero-trust architecture: least privilege everywhere
- Content is private by default; opt-in sharing only
- No third-party data sharing without opt-in creator consent
- Quarterly token rotation + bug bounty program

## 🏗️ Technical Standards

### Architecture
- Microservices & API-first: payments, uploads, messaging, discovery are modular
- Event-driven flows: Kafka/Pulsar power real-time recs, payouts, and fraud detection
- Infrastructure-as-Code: all infra lives in git, reproducible end-to-end
- Zero downtime rule: releases can't take FANZ platforms offline

### Quality Gates
- **Unit tests ≥85% coverage**; integration tests for all critical flows
- Performance budgets: API P95 latency <300ms, upload success >99.9%
- Security scans (OWASP Top 10, deps audit) must pass before merge
- Accessibility: WCAG 2.2 AA baseline, enforced in CI

### Observability
- **OpenTelemetry** standard for logs, metrics, traces
- Dashboards: uptime, error %, upload success %, payout latency
- Incident SLA: detect in <5 min, resolve in <30 min, postmortem in 48h

### Infrastructure Providers
Selected providers explicitly permit legal adult content:
- **Cloud**: AWS, GCP, Azure (with caution); DigitalOcean, Linode, Vultr, OVH, Scaleway
- **CDN**: Cloudflare, Bunny.net, Fastly, Akamai, G-Core
- **Storage**: Backblaze B2, Cloudflare R2, Bunny Storage

## 📱 Platform Management

### FanzDash Control Center
- FanzDash is the security control center for all clusters
- All platforms and clusters are controlled via FanzDash
- Single source of truth for user management, content moderation, and system configuration

### Cross-Platform Requirements
- All platforms (BoyFanz, GirlFanz, PupFanz, TabooFanz) must launch features equally
- No delays or favoritism between identity groups
- Feature parity checks required before any launch

## 🎨 Branding Standards

### FANZ Branding
- All modules, features, and experiences use 'FANZ' prefix instead of 'FUN'
- The ecosystem branding is unified under **Fanz Unlimited Network (FANZ)**
- No 'FUN' branding going forward

### Platform Rebranding
- **FusionGenius** → **FanzSocial**
- **EbonyFanz.com** → **TabooFanz.com**

## 🚀 Development Standards

### Git Workflow
- **main** = production only (housekeeping source of truth)
- **dev** = integration branch
- Feature branches: `feature/<name>` → merged into dev
- Hotfix branches: `hotfix/<ticket>` → merged into main + dev
- Push to git after every checkpoint or task completion
- Pull from git before starting any work

### Environment Standards
- Pin Node with .nvmrc; all workflows start with `nvm use`
- Only pnpm (lockfile required)
- All commands read from `./env/.env.local|staging|prod`
- No secrets inline - use environment variables

### Deployment
- Branch flow: feature/ → staging → canary (1%→10%→100%)
- All new features gated by flags, auto-expire in ≤90 days
- Automated rollback within 5 minutes if error budget breaks

## 🎯 Innovation Requirements

### State-of-the-Art Technology
- AI/ML features must use latest stable frameworks
- Bi-annual tech audits ensure backend, APIs, and security protocols are cutting-edge
- Every quarter, teams must propose ≥1 new feature using state-of-the-art tech (AI, ML, blockchain, VR, WebRTC)
- Legacy freeze: features built on outdated stacks must be refactored or deprecated after 18 months

### Creator Tools
- AI Copilot: guides creators with pricing, content ideas, trending insights
- Multi-Modal Uploads: video, VR, AI-generated content, 3D assets
- Web3 Wallets: optional crypto earnings
- Smart Contracts for Collabs: auto split revenue between multiple creators

## 📊 Success Metrics

### Performance SLOs
- P95 API latency < 300ms
- Upload success > 99.9%
- Stream startup < 3 seconds
- Creator payout ≤ 24h

### Innovation Metrics
- ≥1 creator-facing innovation per 2-week sprint
- Beta Pods: select creators test early features
- Community engagement and creator satisfaction trending up

## 🎪 Cultural Standards

### Launch Requirements
- Every major release launches with a cultural hook (PR, memes, collabs)
- FANZ isn't just platforms — it's the movement
- Rule: if a feature doesn't drive community hype, it gets re-worked

### Inclusivity
- Gender, sexuality, and niche representation hardcoded into UX choices
- Test rollouts with diverse creator councils before global release
- Identity-inclusive UX in sign-up flows, category tags, discovery algorithms

---

**These rules are living documents. Any changes must be approved by the FANZ Leadership Council and communicated to all stakeholders with advance notice.**

*Last Updated: 2025-09-30*