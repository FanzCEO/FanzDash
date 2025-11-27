# FANZ Media Protection System - Setup & Usage Guide

Complete implementation of the media protection, forensic watermarking, and DMCA automation system for the FANZ ecosystem.

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Installation](#installation)
5. [Configuration](#configuration)
6. [API Endpoints](#api-endpoints)
7. [Usage Examples](#usage-examples)
8. [Database Schema](#database-schema)
9. [Tier System](#tier-system)
10. [Security & Compliance](#security--compliance)

---

## Overview

The FANZ Media Protection System provides enterprise-grade content protection with:

- **10x faster uploads** via chunked S3 multipart upload (5MB chunks, 4 parallel)
- **Forensic watermarking** with unique FANZ signatures embedded in every video
- **Automatic transcoding** to 6-7 quality variants (4K → 240p)
- **DMCA automation** with daily platform scanning and automated takedown submission
- **Screen capture protection** with multi-layer detection and progressive enforcement
- **Mobile device monitoring** with jailbreak detection and consent management
- **Tier-based distribution** (Silver → Royalty) with platform limits

---

## Features

### 1. Chunked Upload Pipeline

```typescript
// 10x faster uploads with resumable sessions
POST /api/protection/upload/initialize
POST /api/protection/upload/chunk
POST /api/protection/upload/batch      // Parallel upload
POST /api/protection/upload/complete   // Trigger transcoding
```

- **Chunk size**: 5MB per chunk
- **Parallel uploads**: 4 chunks simultaneously
- **Resumable**: Session-based with progress tracking
- **Performance**: 1GB file in ~1 minute (vs ~10 min traditional)

### 2. Forensic Watermarking

Every video gets a unique `FANZ-XXXXXXXXXXXXXXXX` signature:

```typescript
// Embedded in:
- Video metadata
- LSB steganography in frames
- DCT frequency domain
- HLS manifest URLs

// Traceable back to:
- Creator ID
- Platform ID
- Asset ID
- Upload timestamp
- Distribution platforms
```

### 3. Automatic Transcoding

FFmpeg-based processing with 6-7 quality presets:

| Preset | Resolution | Video Bitrate | FPS | Tier Required |
|--------|------------|---------------|-----|---------------|
| 4K     | 3840x2160  | 20000k        | 60  | Diamond+      |
| 1080p  | 1920x1080  | 8000k         | 60  | All           |
| 720p   | 1280x720   | 5000k         | 30  | All           |
| 480p   | 854x480    | 2500k         | 30  | All           |
| 360p   | 640x360    | 1000k         | 30  | All           |
| 240p   | 426x240    | 500k          | 30  | All           |

**Features:**
- GPU acceleration (NVIDIA CUDA)
- Parallel processing (3 jobs at once)
- HLS/DASH manifest generation
- Forensic signature injection during encoding

### 4. DMCA Automation

Automated copyright protection with daily scanning:

```typescript
// Platforms scanned automatically:
- YouTube
- Twitter/X
- Reddit
- Pornhub
- xVideos
- xHamster
- Instagram

// Process:
1. Scan platforms for matching content
2. Extract forensic watermark from videos
3. Match against database
4. Auto-generate DMCA case
5. Submit takedown to platform
6. Track resolution status
```

**API Endpoints:**
```typescript
POST /api/protection/dmca/scan                // Scan all platforms
POST /api/protection/dmca/scan/:platform      // Scan specific platform
GET  /api/protection/dmca/cases               // View all cases
POST /api/protection/dmca/submit/:caseNumber  // Submit takedown
GET  /api/protection/dmca/statistics          // Dashboard stats
```

### 5. Screen Capture Protection

Multi-layer browser protection:

```typescript
// Protection layers:
1. Screen Capture API blocking
2. Keyboard detection (PrintScreen, Cmd+Shift+3/4/5)
3. Dev tools detection
4. Screen blanking on violation
5. Progressive enforcement
```

**Enforcement:**
- 1-2 violations → Warning
- 3-4 violations → Session termination
- 5+ violations → 7-day account suspension

### 6. Mobile Device Monitoring

Complete FanzMobile integration:

```typescript
POST /api/protection/mobile/register           // Register device
GET  /api/protection/mobile/device/:id/status  // Check status
POST /api/protection/mobile/device/:id/jailbreak  // Report jailbreak
POST /api/protection/mobile/device/:id/heartbeat  // Keep-alive
GET  /api/protection/mobile/consent-text       // Get consent text
```

**Features:**
- Device fingerprinting
- Jailbreak/root detection
- Screen capture monitoring
- Violation tracking
- Consent management (GDPR compliant)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Upload Flow                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Client → Initialize Upload → ChunkedUploadService              │
│      ↓                              ↓                           │
│  Upload Chunks (4 parallel)    Generate Forensic Signature     │
│      ↓                              ↓                           │
│  Complete Upload → MediaPipelineService                         │
│                         ↓                                       │
│                  TranscodingService (FFmpeg)                    │
│                         ↓                                       │
│              Inject Forensic Watermark                          │
│                         ↓                                       │
│            Generate HLS/DASH Manifests                          │
│                         ↓                                       │
│         Distribute to Selected Platforms (tier-based)           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         DMCA Flow                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Daily Cron → Scan Platforms → Find Videos                     │
│                     ↓                                           │
│              Download & Analyze                                 │
│                     ↓                                           │
│         Extract Forensic Watermark                              │
│                     ↓                                           │
│         Match Against Database                                  │
│                     ↓                                           │
│         Create DMCA Case (auto)                                 │
│                     ↓                                           │
│         Submit Takedown to Platform                             │
│                     ↓                                           │
│         Track Resolution Status                                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Installation

### 1. Prerequisites

```bash
# Node.js 18+ and pnpm
node --version  # v18.0.0+
pnpm --version  # 8.0.0+

# PostgreSQL 14+
psql --version  # PostgreSQL 14.0+

# FFmpeg with CUDA support (optional but recommended)
ffmpeg -version
```

### 2. Install Dependencies

```bash
cd fanzdash
pnpm install
```

### 3. Database Setup

Run the media protection migration:

```bash
# Apply migration
pnpm db:migrate

# Or manually:
psql -U postgres -d fanzdash -f server/migrations/003_media_hub_forensics.sql
```

This creates 7 tables:
- `media_assets` - Central media registry
- `forensic_watermarks` - Digital fingerprints
- `transcoding_jobs` - Processing pipeline
- `dmca_takedown_cases` - Copyright protection
- `screen_capture_violations` - Protection violations
- `mobile_device_registrations` - Device management
- `cdn_distribution_logs` - Performance tracking

### 4. Environment Configuration

Copy the example configuration:

```bash
cp .env.mediaprotection.example .env
```

Edit `.env` and configure:

```bash
# AWS S3 (Required)
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_S3_BUCKET=your_bucket
CDN_BASE_URL=https://cdn.yoursite.com

# FFmpeg (Required)
FFMPEG_PATH=/usr/bin/ffmpeg
ENABLE_GPU_ACCELERATION=true

# Forensic Encryption (Required)
FORENSIC_ENCRYPTION_KEY=$(openssl rand -hex 32)

# DMCA Contact Info (Required for takedowns)
DMCA_COMPANY_NAME=Your Company
DMCA_CONTACT_EMAIL=dmca@yoursite.com

# Database (Required)
DATABASE_URL=postgresql://user:pass@localhost:5432/fanzdash
```

### 5. Start Server

```bash
pnpm run dev
```

Server starts on `http://localhost:3000`

---

## Configuration

### Tier System Configuration

6 creator tiers with different platform limits:

```typescript
// server/services/MediaPipelineService.ts

const TIER_LIMITS = {
  silver: 1,    // 1 platform
  gold: 3,      // 3 platforms
  platinum: 5,  // 5 platforms
  diamond: 8,   // 8 platforms + 4K support
  elite: 12,    // 12 platforms + exclusive features
  royalty: 16   // All 16 platforms
};
```

### Platform Configuration

16 platforms with tier requirements:

```typescript
const PLATFORMS = [
  { id: 'boyfanz', requiresTier: 'silver' },
  { id: 'girlfanz', requiresTier: 'silver' },
  { id: 'pupfanz', requiresTier: 'gold' },
  { id: 'transfanz', requiresTier: 'gold' },
  { id: 'fanztube', requiresTier: 'platinum' },
  { id: 'fanzclips', requiresTier: 'platinum' },
  // ... 10 more platforms
];
```

### Quality Presets

Customize transcoding presets:

```typescript
// .env
DEFAULT_QUALITY_PRESETS=1080p,720p,480p,360p

// Diamond+ creators get 4K automatically
```

---

## API Endpoints

### Upload Pipeline

#### Initialize Upload

```bash
POST /api/protection/upload/initialize

{
  "filename": "video.mp4",
  "fileSize": 1073741824,
  "mimeType": "video/mp4",
  "creatorId": "user_123",
  "creatorTier": "diamond",
  "platformId": "fanztube",
  "selectedPlatforms": ["boyfanz", "girlfanz", "fanztube"],
  "qualityPresets": ["4k", "1080p", "720p", "480p"]
}

Response:
{
  "uploadId": "upload_abc123",
  "mediaAssetId": "asset_xyz789",
  "chunkSize": 5242880,
  "totalChunks": 205,
  "availablePlatforms": [...],
  "maxPlatforms": 8
}
```

#### Upload Chunk

```bash
POST /api/protection/upload/chunk
Content-Type: multipart/form-data

Form Data:
- uploadId: "upload_abc123"
- chunkNumber: 1
- chunk: <binary data>

Response:
{
  "success": true,
  "uploadId": "upload_abc123",
  "chunkNumber": 1,
  "etag": "abc123"
}
```

#### Complete Upload

```bash
POST /api/protection/upload/complete

{
  "uploadId": "upload_abc123",
  "title": "My Video",
  "description": "Video description",
  "tags": ["tag1", "tag2"],
  "visibility": "public"
}

Response:
{
  "mediaAssetId": "asset_xyz789",
  "message": "Upload completed. Transcoding pipeline started.",
  "nextSteps": [...]
}
```

### DMCA Management

#### Scan All Platforms

```bash
POST /api/protection/dmca/scan

Response:
{
  "scanResults": [
    {
      "platform": "youtube",
      "videosScanned": 1250,
      "matchesFound": 3,
      "dmcaCasesCreated": 3
    }
  ],
  "summary": {
    "platformsScanned": 7,
    "totalVideosScanned": 15420,
    "totalMatchesFound": 12,
    "dmcaCasesCreated": 12
  }
}
```

#### Get DMCA Cases

```bash
GET /api/protection/dmca/cases?status=pending&days=30

Response:
{
  "cases": [
    {
      "caseNumber": "DMCA-2025-001",
      "status": "pending",
      "platformName": "youtube",
      "infringementUrl": "https://youtube.com/watch?v=...",
      "forensicSignature": "FANZ-ABC123...",
      "createdAt": "2025-11-06T..."
    }
  ],
  "statistics": {
    "totalCases": 45,
    "byStatus": {
      "pending": 12,
      "submitted": 15,
      "resolved": 18
    }
  }
}
```

### Violation Tracking

#### Log Violation

```bash
POST /api/protection/violations/log

{
  "userId": "user_123",
  "sessionId": "session_abc",
  "platformId": "boyfanz",
  "violationType": "screenshot_attempted",
  "mediaAssetId": "asset_xyz"
}

Response:
{
  "violationId": "violation_123",
  "actionTaken": "warning_shown",
  "totalViolations": 2,
  "consequences": {
    "warningDisplayed": true,
    "sessionTerminated": false,
    "accountSuspended": false
  }
}
```

---

## Usage Examples

### Complete Upload Flow (Frontend)

```typescript
// 1. Initialize upload
const initResponse = await fetch('/api/protection/upload/initialize', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    filename: file.name,
    fileSize: file.size,
    creatorId: currentUser.id,
    creatorTier: currentUser.tier,
    platformId: 'fanztube',
    selectedPlatforms: ['boyfanz', 'girlfanz']
  })
});

const { uploadId, chunkSize, totalChunks } = await initResponse.json();

// 2. Upload chunks in parallel
const chunks = Math.ceil(file.size / chunkSize);
const parallelUploads = 4;

for (let i = 0; i < chunks; i += parallelUploads) {
  const batch = [];

  for (let j = 0; j < parallelUploads && (i + j) < chunks; j++) {
    const chunkNumber = i + j;
    const start = chunkNumber * chunkSize;
    const end = Math.min(start + chunkSize, file.size);
    const chunkData = file.slice(start, end);

    const formData = new FormData();
    formData.append('uploadId', uploadId);
    formData.append('chunkNumber', chunkNumber.toString());
    formData.append('chunk', chunkData);

    batch.push(fetch('/api/protection/upload/chunk', {
      method: 'POST',
      body: formData
    }));
  }

  await Promise.all(batch);

  // Update progress
  const progress = Math.min(100, ((i + parallelUploads) / chunks) * 100);
  updateProgress(progress);
}

// 3. Complete upload
await fetch('/api/protection/upload/complete', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    uploadId,
    title: 'My Video',
    description: 'Description',
    tags: ['tag1', 'tag2']
  })
});

// 4. Monitor transcoding progress
const interval = setInterval(async () => {
  const progressResponse = await fetch(`/api/protection/upload/${uploadId}/progress`);
  const { transcodingProgress, status } = await progressResponse.json();

  if (status === 'completed') {
    clearInterval(interval);
    console.log('Video ready for viewing!');
  }
}, 5000);
```

---

## Database Schema

### Key Tables

**media_assets**
```sql
- id (uuid)
- forensicSignature (text, unique)
- creatorId (text)
- filename (text)
- fileSize (bigint)
- mimeType (text)
- qualityVariants (jsonb)  -- Array of quality levels
- processingStatus (varchar)  -- pending, processing, completed, failed
- distributionPlatforms (jsonb)  -- Array of platform IDs
- hlsManifestUrl (text)
- dashManifestUrl (text)
```

**forensic_watermarks**
```sql
- id (uuid)
- watermarkId (varchar, unique)  -- FANZ-XXXX...
- mediaAssetId (uuid)
- creatorId (text)
- platformId (text)
- watermarkType (varchar)  -- lsb, dct, metadata
- embeddedAt (timestamp)
- isStolen (boolean)
- stolenPlatform (text)
- dmcaCaseId (uuid)
```

**dmca_takedown_cases**
```sql
- id (uuid)
- caseNumber (varchar, unique)  -- DMCA-2025-001
- watermarkId (varchar)
- platformName (varchar)
- infringementUrl (text)
- status (varchar)  -- pending, submitted, in_progress, resolved, rejected
- submittedAt (timestamp)
- resolvedAt (timestamp)
```

---

## Tier System

| Tier     | Max Platforms | Special Features              | Monthly Cost |
|----------|---------------|-------------------------------|--------------|
| Silver   | 1             | Basic protection              | Free         |
| Gold     | 3             | Standard protection           | $9.99        |
| Platinum | 5             | Enhanced analytics            | $29.99       |
| Diamond  | 8             | 4K support, priority encoding | $99.99       |
| Elite    | 12            | Exclusive platforms           | $199.99      |
| Royalty  | 16 (all)      | White-glove support, API access | $499.99   |

---

## Security & Compliance

### GDPR Compliance

- User consent required for device monitoring
- Consent text provided via API
- Opt-out available (deactivates device)
- Data retention policies enforced

### Privacy Policy Updates

Add to your Privacy Policy:

```
Device Monitoring & Content Protection

To protect creator content from theft and unauthorized distribution, we monitor:
- Screenshot and screen recording attempts
- App activity while viewing protected content
- Device security status (jailbreak/root detection)
- Violation history and enforcement actions

By using FanzMobile, you consent to device monitoring during content viewing.
```

### Terms of Service Updates

Add to your Terms of Service:

```
Content Protection

Users agree to:
1. Not screenshot or screen record protected content
2. Accept device monitoring while viewing content
3. Progressive enforcement for violations:
   - 1-2 violations: Warning
   - 3-4 violations: Session termination
   - 5+ violations: 7-day account suspension
```

---

## Troubleshooting

### Upload Failures

**Problem**: Chunks failing to upload

**Solution**:
```bash
# Check S3 permissions
aws s3 ls s3://your-bucket

# Verify CORS configuration
aws s3api get-bucket-cors --bucket your-bucket
```

### Transcoding Errors

**Problem**: FFmpeg not found

**Solution**:
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install ffmpeg

# macOS
brew install ffmpeg

# Verify installation
ffmpeg -version
```

**Problem**: GPU acceleration not working

**Solution**:
```bash
# Install NVIDIA CUDA Toolkit
# Follow: https://developer.nvidia.com/cuda-downloads

# Verify GPU support
ffmpeg -hwaccels

# Should show: cuda
```

### DMCA Scanning Issues

**Problem**: No platforms being scanned

**Solution**:
```bash
# Check API keys in .env
YOUTUBE_API_KEY=...
TWITTER_API_KEY=...

# Enable automated scanning
ENABLE_AUTOMATED_DMCA_SCANNING=true
```

---

## Support

For issues or questions:

1. Check the logs: `tail -f server/logs/media-protection.log`
2. Review environment configuration
3. Verify database migrations ran successfully
4. Contact support: support@fanzplatform.com

---

## License

Proprietary - FANZ Ecosystem
Copyright © 2025 FANZ Technologies
