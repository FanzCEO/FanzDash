# FanzDash - FANZ Ecosystem

## Overview

FanzDash serves as the central command center for the FANZ Unlimited Network LLC creator economy ecosystem. It's a comprehensive adult content platform management system that orchestrates multiple specialized platforms (BoyFanz, GirlFanz, PupFanz, TransFanz, TabooFanz, FanzTube, FanzClips) under a unified technical infrastructure.

The application is built as a modern full-stack TypeScript/React application with Express backend, designed to handle enterprise-scale operations including payment processing, content management, creator payouts, compliance monitoring, and cross-platform user management. The system emphasizes creator autonomy, maximum earnings potential, and robust security/compliance measures specifically tailored for the adult content industry.

## Recent Changes

### October 7, 2025 - Build Fixes for Deployment
- Fixed missing `contentModerationService` dependency in `mlInferencePipeline.ts` by using the existing `aiContentModerationService` from `server/aiContentModeration.ts`
- Replaced unsafe `eval()` usage in `vrRenderingEngine.ts` with safe frame rate parsing (handles formats like "30/1" and "24000/1001")
- Replaced unsafe `eval()` usage in `contentProcessor.ts` with safe frame rate parsing
- Set Express `trust proxy` setting to `1` for proper rate limiting in production behind reverse proxy
- Commented out `QuantumWarRoom` 3D visualization feature (temporarily disabled due to React Three.js compatibility with React 18)

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18.3.1 with TypeScript 5.6.3
- **Build Tool**: Vite 7.1.4 for fast development and optimized production builds
- **UI Components**: Radix UI component library with custom Tailwind CSS theming
- **State Management**: TanStack React Query for server state management
- **Styling**: Tailwind CSS with custom design tokens supporting multiple platform themes (neon color schemes for different creator communities)
- **Routing**: React Router for client-side navigation

### Backend Architecture
- **Runtime**: Node.js 20+ with Express framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints with health check and system monitoring routes
- **Authentication**: JWT-based auth with multi-factor authentication support (SMS, Email, TOTP, biometric)
- **Session Management**: Secure session handling with automatic token refresh

### Database Layer
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL via Neon serverless (configured but may not be actively used yet)
- **Schema Management**: Drizzle Kit for migrations and schema changes
- **Data Security**: AES-256-GCM encryption for sensitive data, DoD 5220.22-M secure deletion standards

### Core Architectural Patterns
- **Microservices-Ready**: Designed to support future service decomposition (user service, payment service, media service, moderation service, etc.)
- **Event-Driven**: Prepared for event-based communication between services
- **Service Mesh**: Includes service manifest for registration and health monitoring
- **Health Monitoring**: Comprehensive health check endpoints (`/healthz`, `/system`) for observability

### Payment Processing Architecture
- **Multi-Gateway Support**: Adult-friendly payment processors (CCBill, Segpay, Epoch, Verotel, RocketGate, etc.)
- **Smart Routing**: Intelligent transaction routing based on region, risk, and performance
- **Alternative Methods**: Cryptocurrency (BitPay, NOWPayments), ACH, SEPA, wire transfers, digital wallets
- **Compliance**: Built-in regulatory compliance monitoring and fraud detection
- **Creator Payouts**: Multi-method automated payouts (Paxum, ePayService, Wise, crypto options)

### Security & Compliance
- **Zero-Trust Framework**: No default trust, every request authenticated/authorized
- **Encryption**: TLS 1.3 in transit, AES-256 at rest, end-to-end for sensitive content
- **Adult Industry Compliance**: 18 USC 2257 record-keeping, age verification, KYC/identity verification
- **Regulatory Coverage**: GDPR, CCPA, COPPA, DMCA, ADA compliance monitoring
- **Access Control**: Role-based access control (RBAC) with granular permissions

### Content Management
- **Media Processing**: Support for images, videos, audio with forensic watermarking
- **CDN Integration**: Global content delivery with adult-friendly providers
- **AI Moderation**: Automated content scanning and flagging (NudeNet, CLIP NSFW models referenced)
- **Live Streaming**: WebRTC/RTMP support for live content with real-time moderation

### Platform Integration
- **Cross-Platform SSO**: Unified authentication across all FANZ platforms
- **Profile Synchronization**: Seamless user data sync across platform clusters
- **Centralized Vault**: Secure compliance document storage (FanzHubVault)
- **Domain Routing**: Smart routing based on domain for multi-platform support

## External Dependencies

### Payment Processors & Financial Services
- **Adult-Friendly Gateways**: CCBill, Segpay, Epoch, Vendo, Verotel, NetBilling, CommerceGate, RocketGate, CentroBill
- **Cryptocurrency**: BitPay, NOWPayments, CoinGate, Coinbase Commerce, CoinPayments
- **Payout Services**: Paxum, Cosmo Payment, ePayService, Wise, Payoneer, Skrill, Neteller
- **Alternative Payments**: Instamojo, MercadoPago, Mollie, OpenPix, Payku, Paystack, Flutterwave (regional coverage)

### Cloud Services & Infrastructure
- **Database**: Neon PostgreSQL serverless (@neondatabase/serverless)
- **Storage**: Google Cloud Storage (@google-cloud/storage) with references to S3, Backblaze B2, Wasabi, Pushr
- **Email**: SendGrid (@sendgrid/mail)
- **Media Processing**: References to Coconut.co for video encoding/transcoding

### AI & Machine Learning
- **AI Provider**: Anthropic SDK (@anthropic-ai/sdk) for AI-powered features
- **Content Moderation**: References to NudeNet, CLIP NSFW, OpenNSFW2, Detoxify for automated content review
- **Recommendation Systems**: Predictive analytics and content recommendation engines

### Authentication & Security
- **WebAuthn**: SimpleWebAuthn browser and server packages for biometric authentication
- **Payment UI**: Stripe React components (though Stripe/PayPal explicitly avoided per requirements)
- **Session Management**: JWT tokens, OAuth integration (Google, Facebook, Twitter, Apple)

### Communication & Streaming
- **Real-time**: WebSocket support for live features
- **Streaming**: References to getstream.io for activity feeds, chat, and real-time collaboration
- **Live Video**: WebRTC infrastructure (Janus/Mediasoup/LiveKit referenced)
- **Transcription**: Whisper (OpenAI) for audio transcription in streams

### Developer Tools & Monitoring
- **Build Tools**: esbuild, Vite, TypeScript compiler
- **Testing**: Vitest for unit and integration testing
- **Code Quality**: ESLint, Prettier for code formatting
- **Version Control**: Git with GPG signing recommended
- **Container**: Docker 24+ for local development and deployment

### Third-Party Integrations
- **Social Login**: OAuth providers (Google, Facebook, Twitter, Apple)
- **Analytics**: Custom analytics system with predictive modeling
- **CMS**: Content management for blogs, pages, and SEO
- **Giphy**: GIF integration for chat/comments
- **reCAPTCHA**: Anti-bot protection

### Deployment & DevOps
- **Hosting**: Vercel configuration present
- **Package Manager**: pnpm 9+ (strictly enforced, no npm/yarn)
- **Environment**: Docker Compose for local development
- **Service Discovery**: Service manifest system for microservice registration