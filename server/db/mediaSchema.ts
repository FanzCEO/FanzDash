import { pgTable, uuid, varchar, bigint, integer, text, timestamp, boolean, jsonb, decimal, index } from 'drizzle-orm/pg-core';

// ============================================================================
// MEDIA ASSETS (Central Registry)
// ============================================================================

export const mediaAssets = pgTable('media_assets', {
  id: uuid('id').primaryKey().defaultRandom(),
  platformId: varchar('platform_id', { length: 255 }).notNull(),
  tenantId: varchar('tenant_id', { length: 255 }).notNull(),
  creatorId: varchar('creator_id', { length: 255 }).notNull(),

  // File Information
  originalFilename: varchar('original_filename', { length: 500 }).notNull(),
  fileHash: text('file_hash').notNull().unique(), // SHA-256 hash
  fileSize: bigint('file_size', { mode: 'number' }).notNull(),
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  durationSeconds: integer('duration_seconds'),

  // Storage
  storageProvider: varchar('storage_provider', { length: 50 }).notNull(),
  storagePath: text('storage_path').notNull(),
  storageRegion: varchar('storage_region', { length: 50 }),
  cdnUrl: text('cdn_url'),

  // Processing Status
  processingStatus: varchar('processing_status', { length: 50 }).default('pending'),
  processingStartedAt: timestamp('processing_started_at'),
  processingCompletedAt: timestamp('processing_completed_at'),
  processingError: text('processing_error'),

  // Quality Variants
  qualityVariants: jsonb('quality_variants').default([]),

  // Metadata
  width: integer('width'),
  height: integer('height'),
  bitrate: integer('bitrate'),
  codec: varchar('codec', { length: 50 }),
  framerate: decimal('framerate', { precision: 5, scale: 2 }),

  // Forensic Tracking
  forensicSignature: text('forensic_signature').notNull().unique(),
  hasInvisibleWatermark: boolean('has_invisible_watermark').default(true),
  hasVisibleWatermark: boolean('has_visible_watermark').default(false),
  watermarkStrength: varchar('watermark_strength', { length: 20 }).default('medium'),

  // Access Control
  isPublic: boolean('is_public').default(false),
  requiresSubscription: boolean('requires_subscription').default(true),
  accessTier: varchar('access_tier', { length: 50 }),

  // Analytics
  viewCount: bigint('view_count', { mode: 'number' }).default(0),
  downloadCount: bigint('download_count', { mode: 'number' }).default(0),
  lastAccessedAt: timestamp('last_accessed_at'),

  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  deletedAt: timestamp('deleted_at')
}, (table) => ({
  platformIdx: index('idx_media_platform').on(table.platformId),
  creatorIdx: index('idx_media_creator').on(table.creatorId),
  fileHashIdx: index('idx_media_file_hash').on(table.fileHash),
  forensicSigIdx: index('idx_media_forensic_sig').on(table.forensicSignature),
  processingStatusIdx: index('idx_media_processing_status').on(table.processingStatus),
  createdIdx: index('idx_media_created').on(table.createdAt)
}));

// ============================================================================
// FORENSIC WATERMARKS (Digital Fingerprints)
// ============================================================================

export const forensicWatermarks = pgTable('forensic_watermarks', {
  id: uuid('id').primaryKey().defaultRandom(),
  mediaAssetId: uuid('media_asset_id').references(() => mediaAssets.id, { onDelete: 'cascade' }),

  // Watermark Data
  watermarkId: varchar('watermark_id', { length: 255 }).notNull().unique(),
  watermarkType: varchar('watermark_type', { length: 50 }).notNull(),
  embeddingMethod: varchar('embedding_method', { length: 100 }),

  // Tracking Information
  creatorId: varchar('creator_id', { length: 255 }).notNull(),
  viewerId: varchar('viewer_id', { length: 255 }),
  sessionId: varchar('session_id', { length: 255 }),
  ipAddress: varchar('ip_address', { length: 45 }),
  deviceFingerprint: text('device_fingerprint'),

  // Watermark Payload
  payload: jsonb('payload'),

  // Detection Metadata
  detectionConfidence: decimal('detection_confidence', { precision: 5, scale: 2 }),
  isValid: boolean('is_valid').default(true),
  lastVerifiedAt: timestamp('last_verified_at'),

  // Theft Protection
  isStolen: boolean('is_stolen').default(false),
  stolenDetectedAt: timestamp('stolen_detected_at'),
  stolenPlatform: varchar('stolen_platform', { length: 255 }),
  stolenUrl: text('stolen_url'),
  dmcaCaseId: uuid('dmca_case_id'),

  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => ({
  watermarkIdIdx: index('idx_forensic_watermark_id').on(table.watermarkId),
  mediaIdx: index('idx_forensic_media').on(table.mediaAssetId),
  creatorIdx: index('idx_forensic_creator').on(table.creatorId),
  viewerIdx: index('idx_forensic_viewer').on(table.viewerId),
  stolenIdx: index('idx_forensic_stolen').on(table.isStolen)
}));

// ============================================================================
// TRANSCODING JOBS (Video Processing Pipeline)
// ============================================================================

export const transcodingJobs = pgTable('transcoding_jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  mediaAssetId: uuid('media_asset_id').references(() => mediaAssets.id, { onDelete: 'cascade' }),

  // Job Configuration
  sourceUrl: text('source_url').notNull(),
  outputFormat: varchar('output_format', { length: 20 }).notNull(),
  qualityPreset: varchar('quality_preset', { length: 50 }).notNull(),
  targetBitrate: integer('target_bitrate'),
  targetCodec: varchar('target_codec', { length: 50 }),

  // Processing
  status: varchar('status', { length: 50 }).default('queued'),
  progressPercentage: integer('progress_percentage').default(0),
  workerId: varchar('worker_id', { length: 255 }),
  priority: integer('priority').default(5),

  // Output
  outputUrl: text('output_url'),
  outputSize: bigint('output_size', { mode: 'number' }),
  outputDuration: integer('output_duration'),

  // Performance Metrics
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  processingTimeSeconds: integer('processing_time_seconds'),
  errorMessage: text('error_message'),
  retryCount: integer('retry_count').default(0),
  maxRetries: integer('max_retries').default(3),

  // Watermarking
  applyWatermark: boolean('apply_watermark').default(true),
  watermarkApplied: boolean('watermark_applied').default(false),

  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => ({
  statusIdx: index('idx_transcoding_status').on(table.status),
  mediaIdx: index('idx_transcoding_media').on(table.mediaAssetId),
  priorityIdx: index('idx_transcoding_priority').on(table.priority, table.createdAt)
}));

// ============================================================================
// DMCA TAKEDOWN CASES (Copyright Protection)
// ============================================================================

export const dmcaTakedownCases = pgTable('dmca_takedown_cases', {
  id: uuid('id').primaryKey().defaultRandom(),
  caseNumber: varchar('case_number', { length: 50 }).notNull().unique(),

  // Associated Media
  mediaAssetId: uuid('media_asset_id').references(() => mediaAssets.id),
  forensicWatermarkId: uuid('forensic_watermark_id').references(() => forensicWatermarks.id),

  // Infringement Details
  infringingPlatform: varchar('infringing_platform', { length: 255 }).notNull(),
  infringingUrl: text('infringing_url').notNull(),
  infringingUser: varchar('infringing_user', { length: 255 }),
  discoveredAt: timestamp('discovered_at').notNull(),
  discoveryMethod: varchar('discovery_method', { length: 100 }),

  // Evidence
  forensicSignatureMatch: text('forensic_signature_match'),
  matchConfidence: decimal('match_confidence', { precision: 5, scale: 2 }),
  screenshotUrls: text('screenshot_urls').array(),
  videoEvidenceUrl: text('video_evidence_url'),
  hashComparison: text('hash_comparison'),

  // Copyright Owner
  copyrightHolderId: varchar('copyright_holder_id', { length: 255 }).notNull(),
  copyrightHolderName: varchar('copyright_holder_name', { length: 255 }),
  copyrightHolderEmail: varchar('copyright_holder_email', { length: 255 }),

  // Takedown Status
  status: varchar('status', { length: 50 }).default('pending'),
  takedownNoticeSentAt: timestamp('takedown_notice_sent_at'),
  platformResponseReceivedAt: timestamp('platform_response_received_at'),
  contentRemovedAt: timestamp('content_removed_at'),

  // Legal Documents
  dmcaNoticeUrl: text('dmca_notice_url'),
  counterNoticeUrl: text('counter_notice_url'),
  legalResponseUrl: text('legal_response_url'),

  // Communication
  platformCaseId: varchar('platform_case_id', { length: 255 }),
  correspondence: jsonb('correspondence').default([]),

  // Resolution
  resolved: boolean('resolved').default(false),
  resolutionType: varchar('resolution_type', { length: 100 }),
  resolvedAt: timestamp('resolved_at'),
  resolutionNotes: text('resolution_notes'),

  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => ({
  statusIdx: index('idx_dmca_status').on(table.status),
  platformIdx: index('idx_dmca_platform').on(table.infringingPlatform),
  mediaIdx: index('idx_dmca_media').on(table.mediaAssetId),
  caseNumberIdx: index('idx_dmca_case_number').on(table.caseNumber),
  createdIdx: index('idx_dmca_created').on(table.createdAt)
}));

// ============================================================================
// CSAM LEGAL HOLDS (Child Safety & Law Enforcement)
// ============================================================================

export const csamLegalHolds = pgTable('csam_legal_holds', {
  id: uuid('id').primaryKey().defaultRandom(),
  caseNumber: varchar('case_number', { length: 50 }).notNull().unique(),

  // Reporting
  reportedBy: varchar('reported_by', { length: 255 }).notNull(), // Super Admin user ID
  reportedToNcmec: boolean('reported_to_ncmec').default(false),
  ncmecReportId: varchar('ncmec_report_id', { length: 255 }),
  ncmecReportedAt: timestamp('ncmec_reported_at'),

  // Content Details
  mediaAssetId: uuid('media_asset_id').references(() => mediaAssets.id),
  contentUrl: text('content_url'),
  contentHash: text('content_hash'),
  contentDescription: text('content_description'),

  // Suspect Information
  suspectUserId: varchar('suspect_user_id', { length: 255 }),
  suspectUsername: varchar('suspect_username', { length: 255 }),
  suspectEmail: varchar('suspect_email', { length: 255 }),
  suspectIpAddress: varchar('suspect_ip_address', { length: 45 }),
  suspectDeviceInfo: jsonb('suspect_device_info'),

  // Evidence Storage
  evidenceStorageUrl: text('evidence_storage_url'), // Encrypted cloud storage URL
  evidenceEncrypted: boolean('evidence_encrypted').default(true),
  evidenceIntegrityHash: text('evidence_integrity_hash'),
  chainOfCustody: jsonb('chain_of_custody').default([]), // Array of custody transfers

  // Law Enforcement
  lawEnforcementNotified: boolean('law_enforcement_notified').default(false),
  lawEnforcementAgency: varchar('law_enforcement_agency', { length: 255 }),
  lawEnforcementCaseId: varchar('law_enforcement_case_id', { length: 255 }),
  lawEnforcementContactedAt: timestamp('law_enforcement_contacted_at'),

  // Legal Status
  status: varchar('status', { length: 50 }).default('pending'), // pending, under_review, law_enforcement_notified, closed
  priority: varchar('priority', { length: 20 }).default('critical'), // critical, high, medium
  legalNotes: text('legal_notes'),

  // Compliance
  preservationRequired: boolean('preservation_required').default(true),
  preservationExpiresAt: timestamp('preservation_expires_at'),
  retentionPeriodYears: integer('retention_period_years').default(7),

  // Resolution
  resolved: boolean('resolved').default(false),
  resolvedAt: timestamp('resolved_at'),
  resolutionType: varchar('resolution_type', { length: 100 }),
  resolutionNotes: text('resolution_notes'),

  // Audit Trail
  createdBy: varchar('created_by', { length: 255 }).notNull(), // Super Admin ID
  lastModifiedBy: varchar('last_modified_by', { length: 255 }),
  accessLog: jsonb('access_log').default([]), // Array of access attempts

  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => ({
  caseNumberIdx: index('idx_csam_case_number').on(table.caseNumber),
  statusIdx: index('idx_csam_status').on(table.status),
  priorityIdx: index('idx_csam_priority').on(table.priority),
  suspectIdx: index('idx_csam_suspect').on(table.suspectUserId),
  createdIdx: index('idx_csam_created').on(table.createdAt)
}));

// ============================================================================
// CSAM EVIDENCE FILES (Secure Evidence Storage)
// ============================================================================

export const csamEvidenceFiles = pgTable('csam_evidence_files', {
  id: uuid('id').primaryKey().defaultRandom(),
  legalHoldId: uuid('legal_hold_id').references(() => csamLegalHolds.id, { onDelete: 'cascade' }),

  // File Information
  filename: varchar('filename', { length: 500 }).notNull(),
  fileType: varchar('file_type', { length: 100 }).notNull(), // screenshot, video, metadata, communication_log
  fileHash: text('file_hash').notNull(),
  fileSize: bigint('file_size', { mode: 'number' }).notNull(),
  mimeType: varchar('mime_type', { length: 100 }),

  // Secure Storage
  storageUrl: text('storage_url').notNull(), // Encrypted cloud storage URL
  encryptionKey: text('encryption_key'), // Encrypted with master key
  isEncrypted: boolean('is_encrypted').default(true),

  // Evidence Metadata
  description: text('description'),
  uploadedBy: varchar('uploaded_by', { length: 255 }).notNull(), // Super Admin ID
  evidenceType: varchar('evidence_type', { length: 100 }),

  // Access Control
  accessedCount: integer('accessed_count').default(0),
  lastAccessedAt: timestamp('last_accessed_at'),
  lastAccessedBy: varchar('last_accessed_by', { length: 255 }),

  // Timestamps
  createdAt: timestamp('created_at').defaultNow()
}, (table) => ({
  legalHoldIdx: index('idx_csam_evidence_legal_hold').on(table.legalHoldId),
  fileTypeIdx: index('idx_csam_evidence_type').on(table.fileType),
  uploadedByIdx: index('idx_csam_evidence_uploaded_by').on(table.uploadedBy)
}));

// ============================================================================
// SCREEN CAPTURE VIOLATIONS (Protection System)
// ============================================================================

export const screenCaptureViolations = pgTable('screen_capture_violations', {
  id: uuid('id').primaryKey().defaultRandom(),

  // User & Session
  userId: varchar('user_id', { length: 255 }).notNull(),
  sessionId: varchar('session_id', { length: 255 }).notNull(),
  platformId: varchar('platform_id', { length: 255 }).notNull(),

  // Violation Details
  violationType: varchar('violation_type', { length: 50 }).notNull(),
  mediaAssetId: uuid('media_asset_id').references(() => mediaAssets.id),
  contentUrl: text('content_url'),

  // Detection
  detectedAt: timestamp('detected_at').defaultNow(),
  detectionMethod: varchar('detection_method', { length: 100 }),

  // Device Information
  deviceType: varchar('device_type', { length: 50 }),
  operatingSystem: varchar('operating_system', { length: 50 }),
  browser: varchar('browser', { length: 50 }),
  deviceFingerprint: text('device_fingerprint'),
  ipAddress: varchar('ip_address', { length: 45 }),
  geolocation: varchar('geolocation', { length: 100 }),

  // Action Taken
  actionTaken: varchar('action_taken', { length: 100 }),
  warningDisplayed: boolean('warning_displayed').default(false),
  sessionTerminated: boolean('session_terminated').default(false),
  accountSuspended: boolean('account_suspended').default(false),

  // Evidence
  screenshotPrevented: boolean('screenshot_prevented').default(true),
  blankScreenServed: boolean('blank_screen_served').default(false),
  violationScreenshotUrl: text('violation_screenshot_url'),

  // Repeat Offender Tracking
  isRepeatOffender: boolean('is_repeat_offender').default(false),
  previousViolationCount: integer('previous_violation_count').default(0),

  // Timestamps
  createdAt: timestamp('created_at').defaultNow()
}, (table) => ({
  userIdx: index('idx_violations_user').on(table.userId),
  sessionIdx: index('idx_violations_session').on(table.sessionId),
  typeIdx: index('idx_violations_type').on(table.violationType),
  mediaIdx: index('idx_violations_media').on(table.mediaAssetId),
  detectedIdx: index('idx_violations_detected').on(table.detectedAt)
}));

// ============================================================================
// FANZMOBILE DEVICE REGISTRATIONS
// ============================================================================

export const mobileDeviceRegistrations = pgTable('mobile_device_registrations', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: varchar('user_id', { length: 255 }).notNull(),

  // Device Information
  deviceId: varchar('device_id', { length: 255 }).notNull().unique(),
  deviceName: varchar('device_name', { length: 255 }),
  deviceType: varchar('device_type', { length: 50 }),
  deviceModel: varchar('device_model', { length: 100 }),
  osVersion: varchar('os_version', { length: 50 }),
  appVersion: varchar('app_version', { length: 50 }),

  // Push Notifications
  pushToken: text('push_token'),
  pushEnabled: boolean('push_enabled').default(true),

  // Security
  deviceFingerprint: text('device_fingerprint').notNull().unique(),
  jailbrokenRooted: boolean('jailbroken_rooted').default(false),
  screenCaptureBlocked: boolean('screen_capture_blocked').default(true),

  // Monitoring Consent
  monitoringConsentGiven: boolean('monitoring_consent_given').default(false),
  monitoringConsentDate: timestamp('monitoring_consent_date'),
  privacyPolicyVersion: varchar('privacy_policy_version', { length: 20 }),
  tosVersion: varchar('tos_version', { length: 20 }),

  // Status
  isActive: boolean('is_active').default(true),
  lastActiveAt: timestamp('last_active_at'),
  lastIpAddress: varchar('last_ip_address', { length: 45 }),

  // Violations
  violationCount: integer('violation_count').default(0),
  lastViolationAt: timestamp('last_violation_at'),
  isSuspended: boolean('is_suspended').default(false),
  suspendedUntil: timestamp('suspended_until'),

  // Timestamps
  registeredAt: timestamp('registered_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => ({
  userIdx: index('idx_mobile_user').on(table.userId),
  deviceIdIdx: index('idx_mobile_device_id').on(table.deviceId),
  fingerprintIdx: index('idx_mobile_fingerprint').on(table.deviceFingerprint),
  activeIdx: index('idx_mobile_active').on(table.isActive, table.lastActiveAt)
}));

// ============================================================================
// CDN DISTRIBUTION LOGS (Performance Tracking)
// ============================================================================

export const cdnDistributionLogs = pgTable('cdn_distribution_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  mediaAssetId: uuid('media_asset_id').references(() => mediaAssets.id),

  // Request Details
  requestId: varchar('request_id', { length: 255 }).notNull(),
  userId: varchar('user_id', { length: 255 }),
  sessionId: varchar('session_id', { length: 255 }),

  // Location
  edgeLocation: varchar('edge_location', { length: 100 }),
  clientCountry: varchar('client_country', { length: 2 }),
  clientRegion: varchar('client_region', { length: 100 }),
  clientCity: varchar('client_city', { length: 100 }),

  // Performance Metrics
  responseTimeMs: integer('response_time_ms'),
  bytesTransferred: bigint('bytes_transferred', { mode: 'number' }),
  qualityServed: varchar('quality_served', { length: 50 }),
  cacheHit: boolean('cache_hit').default(false),

  // Network
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  referer: text('referer'),

  // Status
  httpStatus: integer('http_status'),
  errorCode: varchar('error_code', { length: 50 }),

  // Timestamps
  requestedAt: timestamp('requested_at').defaultNow()
}, (table) => ({
  mediaIdx: index('idx_cdn_media').on(table.mediaAssetId),
  userIdx: index('idx_cdn_user').on(table.userId),
  locationIdx: index('idx_cdn_location').on(table.edgeLocation),
  requestedIdx: index('idx_cdn_requested').on(table.requestedAt)
}));

// Type exports for TypeScript
export type MediaAsset = typeof mediaAssets.$inferSelect;
export type NewMediaAsset = typeof mediaAssets.$inferInsert;
export type ForensicWatermark = typeof forensicWatermarks.$inferSelect;
export type NewForensicWatermark = typeof forensicWatermarks.$inferInsert;
export type TranscodingJob = typeof transcodingJobs.$inferSelect;
export type NewTranscodingJob = typeof transcodingJobs.$inferInsert;
export type DmcaTakedownCase = typeof dmcaTakedownCases.$inferSelect;
export type NewDmcaTakedownCase = typeof dmcaTakedownCases.$inferInsert;
export type CsamLegalHold = typeof csamLegalHolds.$inferSelect;
export type NewCsamLegalHold = typeof csamLegalHolds.$inferInsert;
export type CsamEvidenceFile = typeof csamEvidenceFiles.$inferSelect;
export type NewCsamEvidenceFile = typeof csamEvidenceFiles.$inferInsert;
export type ScreenCaptureViolation = typeof screenCaptureViolations.$inferSelect;
export type NewScreenCaptureViolation = typeof screenCaptureViolations.$inferInsert;
export type MobileDeviceRegistration = typeof mobileDeviceRegistrations.$inferSelect;
export type NewMobileDeviceRegistration = typeof mobileDeviceRegistrations.$inferInsert;
export type CdnDistributionLog = typeof cdnDistributionLogs.$inferSelect;
export type NewCdnDistributionLog = typeof cdnDistributionLogs.$inferInsert;
