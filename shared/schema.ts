import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  timestamp,
  integer,
  decimal,
  jsonb,
  boolean,
  date,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  fanzId: varchar("fanz_id").unique(), // Unique FanzID for each user
  username: text("username").unique(),
  password: text("password"), // Made optional for OAuth-only users
  email: varchar("email").notNull().unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  role: varchar("role").notNull().default("moderator"), // 'creator', 'moderator', 'admin', 'executive', 'super_admin'
  clearanceLevel: integer("clearance_level").notNull().default(1), // 1-5, higher = more access
  vaultAccess: boolean("vault_access").default(false),
  modulePermissions: jsonb("module_permissions").default("{}"), // Per-module access control
  lastLoginAt: timestamp("last_login_at"),
  isActive: boolean("is_active").default(true),
  profileImageUrl: varchar("profile_image_url"),
  phoneNumber: varchar("phone_number"),
  address: text("address"),
  city: varchar("city"),
  country: varchar("country"),
  postalCode: varchar("postal_code"),
  verificationStatus: varchar("verification_status").default("pending"), // 'verified', 'declined', 'pending'

  // Enhanced auth fields
  passwordHash: varchar("password_hash"),
  emailVerified: boolean("email_verified").default(false),
  accountLocked: boolean("account_locked").default(false),
  loginAttempts: integer("login_attempts").default(0),
  fanzIdEnabled: boolean("fanz_id_enabled").default(false),

  // OAuth provider IDs
  googleId: varchar("google_id"),
  githubId: varchar("github_id"),
  facebookId: varchar("facebook_id"),
  twitterId: varchar("twitter_id"),
  linkedinId: varchar("linkedin_id"),

  // 2FA/TOTP
  totpSecret: varchar("totp_secret"),
  totpEnabled: boolean("totp_enabled").default(false),
  backupCodes: jsonb("backup_codes").$type<string[]>(),

  // WebAuthn/Biometrics
  webauthnEnabled: boolean("webauthn_enabled").default(false),

  // SSO
  samlNameId: varchar("saml_name_id"),
  ssoProvider: varchar("sso_provider"),

  createdBy: varchar("created_by"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const contentItems = pgTable("content_items", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  type: varchar("type").notNull(), // 'image', 'video', 'text', 'live_stream'
  url: text("url"),
  content: text("content"), // for text content
  userId: varchar("user_id").references(() => users.id),
  status: varchar("status").notNull().default("pending"), // 'pending', 'approved', 'rejected', 'auto_blocked'
  riskScore: decimal("risk_score", { precision: 3, scale: 2 }),
  moderatorId: varchar("moderator_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const moderationResults = pgTable("moderation_results", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  contentId: varchar("content_id")
    .references(() => contentItems.id)
    .notNull(),
  modelType: varchar("model_type").notNull(), // 'nudenet', 'detoxify', 'pdq_hash'
  confidence: decimal("confidence", { precision: 3, scale: 2 }),
  detections: jsonb("detections"), // array of detection objects
  pdqHash: text("pdq_hash"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const liveStreams = pgTable("live_streams", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  streamKey: text("stream_key").notNull().unique(),
  userId: varchar("user_id").references(() => users.id),
  title: text("title"),
  viewers: integer("viewers").default(0),
  status: varchar("status").notNull().default("offline"), // 'live', 'offline', 'suspended'
  riskLevel: varchar("risk_level").default("low"), // 'low', 'medium', 'high'
  autoBlurEnabled: boolean("auto_blur_enabled").default(false),
  lastRiskScore: decimal("last_risk_score", { precision: 3, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const moderationSettings = pgTable("moderation_settings", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  type: varchar("type").notNull(), // 'image', 'text', 'live_stream'
  autoBlockThreshold: decimal("auto_block_threshold", {
    precision: 3,
    scale: 2,
  }),
  reviewThreshold: decimal("review_threshold", { precision: 3, scale: 2 }),
  frameSampleRate: integer("frame_sample_rate").default(4),
  autoBlurThreshold: decimal("auto_blur_threshold", { precision: 3, scale: 2 }),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const appealRequests = pgTable("appeal_requests", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  contentId: varchar("content_id")
    .references(() => contentItems.id)
    .notNull(),
  userId: varchar("user_id")
    .references(() => users.id)
    .notNull(),
  reason: text("reason").notNull(),
  status: varchar("status").notNull().default("pending"), // 'pending', 'approved', 'denied'
  moderatorId: varchar("moderator_id").references(() => users.id),
  response: text("response"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Encrypted vault for storing illegal/sensitive content evidence
export const encryptedVault = pgTable("encrypted_vault", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  contentId: varchar("content_id")
    .references(() => contentItems.id)
    .notNull(),
  encryptedData: text("encrypted_data").notNull(), // AES encrypted content
  encryptionKey: text("encryption_key").notNull(), // RSA encrypted key
  vaultReason: varchar("vault_reason").notNull(), // 'illegal_content', 'csam', 'terrorism', 'evidence'
  severity: varchar("severity").notNull(), // 'low', 'medium', 'high', 'critical'
  executiveAccess: boolean("executive_access").notNull().default(true),
  accessLog: jsonb("access_log").default([]), // track who accessed when
  createdBy: varchar("created_by")
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Admin action logs - tracks every admin approval/rejection
export const adminActionLogs = pgTable("admin_action_logs", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  adminId: varchar("admin_id")
    .references(() => users.id)
    .notNull(),
  action: varchar("action").notNull(), // 'approve', 'reject', 'escalate', 'vault', 'unvault'
  targetType: varchar("target_type").notNull(), // 'content_item', 'live_stream', 'appeal_request', 'user'
  targetId: varchar("target_id").notNull(),
  previousStatus: varchar("previous_status"),
  newStatus: varchar("new_status"),
  reason: text("reason"),
  metadata: jsonb("metadata"), // additional action context
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Admin session logs - tracks every login/logout
export const adminSessionLogs = pgTable("admin_session_logs", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  adminId: varchar("admin_id")
    .references(() => users.id)
    .notNull(),
  sessionType: varchar("session_type").notNull(), // 'login', 'logout', 'timeout', 'forced_logout'
  ipAddress: varchar("ip_address").notNull(),
  userAgent: text("user_agent"),
  location: jsonb("location"), // geolocation data
  deviceFingerprint: text("device_fingerprint"),
  sessionDuration: integer("session_duration"), // in seconds, for logout events
  suspicious: boolean("suspicious").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Advanced filtering and search capabilities
export const contentFilters = pgTable("content_filters", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  filterCriteria: jsonb("filter_criteria").notNull(), // complex filter rules
  createdBy: varchar("created_by")
    .references(() => users.id)
    .notNull(),
  isShared: boolean("is_shared").default(false),
  usageCount: integer("usage_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Audit trail for all system changes
export const auditTrail = pgTable("audit_trail", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  action: varchar("action").notNull(),
  resource: varchar("resource").notNull(),
  resourceId: varchar("resource_id"),
  oldValues: jsonb("old_values"),
  newValues: jsonb("new_values"),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Multi-platform management tables
export const platforms = pgTable("platforms", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  domain: varchar("domain").notNull().unique(),
  niche: varchar("niche").notNull(),
  status: varchar("status").notNull().default("active"), // active, inactive, maintenance, error
  apiEndpoint: varchar("api_endpoint").notNull(),
  apiKey: varchar("api_key"),
  webhookUrl: varchar("webhook_url").notNull(),
  moderationRules: jsonb("moderation_rules").notNull(),
  stats: jsonb("stats").notNull().default("{}"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  lastActive: timestamp("last_active").defaultNow(),
});

// Platform connections tracking
export const platformConnections = pgTable("platform_connections", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  platformId: varchar("platform_id")
    .notNull()
    .references(() => platforms.id),
  connectionType: varchar("connection_type").notNull(), // webhook, api, direct
  status: varchar("status").notNull().default("connected"), // connected, disconnected, error
  lastHeartbeat: timestamp("last_heartbeat").defaultNow(),
  latency: integer("latency").default(0),
  errorCount: integer("error_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AI Analysis results for content (enhanced)
export const aiAnalysisResults = pgTable("ai_analysis_results", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  contentId: varchar("content_id")
    .notNull()
    .references(() => contentItems.id),
  analysisType: varchar("analysis_type").notNull(), // nudenet, chatgpt-4o, perspective, detoxify, pdq-hash
  confidence: decimal("confidence", { precision: 5, scale: 4 }).notNull(),
  result: jsonb("result").notNull(),
  processingTime: integer("processing_time").notNull(), // in milliseconds
  modelVersion: varchar("model_version").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Table definitions first

// 2257 Form Verification System
export const form2257Verifications = pgTable("form_2257_verifications", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  creatorId: varchar("creator_id")
    .references(() => users.id)
    .notNull(),
  stageName: varchar("stage_name").notNull(),
  legalName: varchar("legal_name").notNull(),
  address: text("address").notNull(),
  city: varchar("city").notNull(),
  country: varchar("country").notNull(),
  postalCode: varchar("postal_code").notNull(),
  idFrontImageUrl: text("id_front_image_url").notNull(),
  idBackImageUrl: text("id_back_image_url").notNull(),
  holdingIdImageUrl: text("holding_id_image_url").notNull(),
  w9FormUrl: text("w9_form_url"),
  dateOfBirth: timestamp("date_of_birth").notNull(),
  status: varchar("status").notNull().default("pending"), // 'verified', 'declined', 'pending'
  actionTakenBy: varchar("action_taken_by").references(() => users.id),
  actionReason: text("action_reason"),
  actionType: varchar("action_type"), // 'approved', 'declined', 'sent_back_for_editing', 'sent_to_management'
  verificationNotes: text("verification_notes"),
  submittedAt: timestamp("submitted_at").defaultNow(),
  processedAt: timestamp("processed_at"),
  expiresAt: timestamp("expires_at"),
});

// Integrated Chat System - definitions moved to end of file

// Email Integration System
export const emailAccounts = pgTable("email_accounts", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .references(() => users.id)
    .notNull(),
  emailAddress: varchar("email_address").notNull().unique(),
  displayName: varchar("display_name").notNull(),
  isSystemEmail: boolean("is_system_email").default(false),
  isPrimary: boolean("is_primary").default(false),
  imapConfig: jsonb("imap_config"),
  smtpConfig: jsonb("smtp_config"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const emailMessages = pgTable("email_messages", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  accountId: varchar("account_id")
    .references(() => emailAccounts.id)
    .notNull(),
  messageId: varchar("message_id").notNull(), // External email message ID
  threadId: varchar("thread_id"),
  fromAddress: varchar("from_address").notNull(),
  toAddresses: jsonb("to_addresses").notNull(),
  ccAddresses: jsonb("cc_addresses").default("[]"),
  bccAddresses: jsonb("bcc_addresses").default("[]"),
  subject: text("subject"),
  content: text("content"),
  htmlContent: text("html_content"),
  attachments: jsonb("attachments").default("[]"),
  isRead: boolean("is_read").default(false),
  isStarred: boolean("is_starred").default(false),
  labels: jsonb("labels").default("[]"),
  receivedAt: timestamp("received_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// People Data Main Brain
export const userAnalytics = pgTable("user_analytics", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .references(() => users.id)
    .notNull(),
  platformId: varchar("platform_id").references(() => platforms.id),
  activityScore: decimal("activity_score", { precision: 5, scale: 2 }),
  engagementRate: decimal("engagement_rate", { precision: 5, scale: 2 }),
  riskScore: decimal("risk_score", { precision: 5, scale: 2 }),
  behaviorPattern: jsonb("behavior_pattern"),
  lastActivity: timestamp("last_activity"),
  contentCount: integer("content_count").default(0),
  violationCount: integer("violation_count").default(0),
  warningCount: integer("warning_count").default(0),
  analyticsData: jsonb("analytics_data"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Media Main Brain
export const mediaAssets = pgTable("media_assets", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .references(() => users.id)
    .notNull(),
  platformId: varchar("platform_id").references(() => platforms.id),
  fileName: varchar("file_name").notNull(),
  fileType: varchar("file_type").notNull(),
  fileSize: integer("file_size").notNull(),
  mimeType: varchar("mime_type").notNull(),
  storageUrl: text("storage_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  aiAnalysisResult: jsonb("ai_analysis_result"),
  moderationStatus: varchar("moderation_status").default("pending"),
  tags: jsonb("tags").default("[]"),
  metadata: jsonb("metadata"),
  isDeleted: boolean("is_deleted").default(false),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  processedAt: timestamp("processed_at"),
});

// System Notifications
export const systemNotifications = pgTable("system_notifications", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  recipientId: varchar("recipient_id")
    .references(() => users.id)
    .notNull(),
  type: varchar("type").notNull(), // 'alert', 'warning', 'info', 'success', 'emergency'
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  priority: varchar("priority").default("normal"), // 'low', 'normal', 'high', 'critical'
  actionUrl: varchar("action_url"),
  isRead: boolean("is_read").default(false),
  readAt: timestamp("read_at"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Platform Integration Stats
export const platformStats = pgTable("platform_stats", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  platformId: varchar("platform_id")
    .references(() => platforms.id)
    .notNull(),
  date: timestamp("date").notNull(),
  totalUsers: integer("total_users").default(0),
  activeUsers: integer("active_users").default(0),
  newSignups: integer("new_signups").default(0),
  contentUploads: integer("content_uploads").default(0),
  moderationActions: integer("moderation_actions").default(0),
  revenue: decimal("revenue", { precision: 10, scale: 2 }).default("0"),
  metrics: jsonb("metrics"),
  createdAt: timestamp("created_at").defaultNow(),
});

// GetStream Integration
export const streamTokens = pgTable("stream_tokens", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .references(() => users.id)
    .notNull(),
  token: text("token").notNull(),
  tokenType: varchar("token_type").notNull(), // 'chat', 'feeds', 'activity'
  expiresAt: timestamp("expires_at").notNull(),
  scopes: jsonb("scopes").default("[]"),
  isRevoked: boolean("is_revoked").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const streamChannels = pgTable("stream_channels", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  streamChannelId: varchar("stream_channel_id").notNull().unique(),
  channelType: varchar("channel_type").notNull(), // 'messaging', 'livestream', 'team'
  members: jsonb("members").notNull(),
  moderationRules: jsonb("moderation_rules").default("{}"),
  customData: jsonb("custom_data").default("{}"),
  isActive: boolean("is_active").default(true),
  createdBy: varchar("created_by")
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Coconut Media Encoding
export const encodingJobs = pgTable("encoding_jobs", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  coconutJobId: varchar("coconut_job_id").notNull().unique(),
  mediaAssetId: varchar("media_asset_id")
    .references(() => mediaAssets.id)
    .notNull(),
  sourceUrl: text("source_url").notNull(),
  status: varchar("status").notNull().default("processing"), // 'processing', 'completed', 'failed'
  progress: integer("progress").default(0),
  outputs: jsonb("outputs").default("[]"), // HLS, DASH, MP4 variants
  webhookData: jsonb("webhook_data"),
  errorMessage: text("error_message"),
  processingTimeMs: integer("processing_time_ms"),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const encodingPresets = pgTable("encoding_presets", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  preset: jsonb("preset").notNull(), // Coconut preset configuration
  isDefault: boolean("is_default").default(false),
  isActive: boolean("is_active").default(true),
  createdBy: varchar("created_by")
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payment Processor Management
export const paymentProcessors = pgTable("payment_processors", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: varchar("name").notNull().unique(),
  processorType: varchar("processor_type").notNull(), // 'crypto', 'traditional', 'adult_friendly'
  status: varchar("status").notNull().default("active"), // 'active', 'inactive', 'banned'
  isBanned: boolean("is_banned").default(false),
  banReason: text("ban_reason"),
  supportedCurrencies: jsonb("supported_currencies").default("[]"),
  fees: jsonb("fees"), // fee structure
  adultFriendly: boolean("adult_friendly").notNull(),
  geographicRestrictions: jsonb("geographic_restrictions").default("[]"),
  integrationConfig: jsonb("integration_config"),
  webhookEndpoints: jsonb("webhook_endpoints").default("[]"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const paymentTransactions = pgTable("payment_transactions", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  processorId: varchar("processor_id")
    .references(() => paymentProcessors.id)
    .notNull(),
  externalTransactionId: varchar("external_transaction_id").notNull(),
  userId: varchar("user_id")
    .references(() => users.id)
    .notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency").notNull(),
  status: varchar("status").notNull(), // 'pending', 'completed', 'failed', 'refunded'
  transactionType: varchar("transaction_type").notNull(), // 'payment', 'refund', 'chargeback'
  metadata: jsonb("metadata"),
  webhookData: jsonb("webhook_data"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AI Companions & Digital Twins
export const aiCompanions = pgTable("ai_companions", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .references(() => users.id)
    .notNull(),
  name: varchar("name").notNull(),
  personality: jsonb("personality").notNull(), // personality traits, preferences
  appearance: jsonb("appearance"), // avatar/model configuration
  voiceConfig: jsonb("voice_config"), // voice synthesis settings
  knowledgeBase: jsonb("knowledge_base"), // custom knowledge/memories
  safetyFilters: jsonb("safety_filters").notNull(),
  conversationHistory: jsonb("conversation_history").default("[]"),
  isActive: boolean("is_active").default(true),
  privacySettings: jsonb("privacy_settings").default("{}"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const aiModels = pgTable("ai_models", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  modelType: varchar("model_type").notNull(), // 'llm', 'image', 'voice', 'safety'
  version: varchar("version").notNull(),
  endpoint: text("endpoint").notNull(),
  apiKey: text("api_key"),
  configuration: jsonb("configuration").notNull(),
  safetyLevel: varchar("safety_level").notNull(), // 'strict', 'moderate', 'permissive'
  contentFilters: jsonb("content_filters").notNull(),
  isActive: boolean("is_active").default(true),
  isDefault: boolean("is_default").default(false),
  performanceMetrics: jsonb("performance_metrics"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// HuggingFace AI Models Configuration
export const huggingfaceModels = pgTable("huggingface_models", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  modelId: varchar("model_id").notNull().unique(), // HuggingFace model identifier
  task: varchar("task").notNull(), // 'text-generation', 'text-classification', 'image-classification', etc.
  provider: varchar("provider").default("huggingface"), // 'huggingface', 'huggingface-inference'
  apiEndpoint: text("api_endpoint"), // Custom endpoint or default to HF Inference API
  apiKey: text("api_key"), // API key for authentication
  parameters: jsonb("parameters").default("{}"), // Model-specific parameters (temperature, max_tokens, etc.)
  contentFiltering: jsonb("content_filtering").default("{}"), // Content moderation settings
  rateLimiting: jsonb("rate_limiting").default("{}"), // Rate limit configuration
  isActive: boolean("is_active").default(true),
  isPremium: boolean("is_premium").default(false), // Premium/paid model flag
  usageStats: jsonb("usage_stats").default("{}"), // Usage tracking
  lastUsed: timestamp("last_used"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// VR/WebXR Integration
export const vrSessions = pgTable("vr_sessions", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  hostId: varchar("host_id")
    .references(() => users.id)
    .notNull(),
  roomId: varchar("room_id").notNull().unique(),
  sessionType: varchar("session_type").notNull(), // 'private', 'group', 'public', 'ticketed'
  title: varchar("title").notNull(),
  description: text("description"),
  maxParticipants: integer("max_participants").default(10),
  currentParticipants: integer("current_participants").default(0),
  isRecording: boolean("is_recording").default(false),
  recordingUrl: text("recording_url"),
  vrEnvironment: jsonb("vr_environment").notNull(), // 3D scene configuration
  accessSettings: jsonb("access_settings").default("{}"),
  ticketPrice: decimal("ticket_price", { precision: 10, scale: 2 }),
  status: varchar("status").notNull().default("scheduled"), // 'scheduled', 'live', 'ended'
  startedAt: timestamp("started_at"),
  endedAt: timestamp("ended_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const webrtcRooms = pgTable("webrtc_rooms", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  roomId: varchar("room_id").notNull().unique(),
  sessionId: varchar("session_id").references(() => vrSessions.id),
  roomType: varchar("room_type").notNull(), // 'video', 'audio', 'screen_share', 'vr'
  participants: jsonb("participants").default("[]"),
  mediaStreams: jsonb("media_streams").default("[]"),
  isRecording: boolean("is_recording").default(false),
  recordingConfig: jsonb("recording_config"),
  bandwidth: jsonb("bandwidth").default("{}"), // bandwidth stats
  qualitySettings: jsonb("quality_settings").default("{}"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Geo-Collaboration Features
export const geoLocations = pgTable("geo_locations", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .references(() => users.id)
    .notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }).notNull(),
  longitude: decimal("longitude", { precision: 11, scale: 8 }).notNull(),
  accuracy: integer("accuracy"), // GPS accuracy in meters
  address: text("address"),
  city: varchar("city"),
  country: varchar("country"),
  isPublic: boolean("is_public").default(false),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const geoCollaborations = pgTable("geo_collaborations", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  organizerId: varchar("organizer_id")
    .references(() => users.id)
    .notNull(),
  locationId: varchar("location_id")
    .references(() => geoLocations.id)
    .notNull(),
  collaborationType: varchar("collaboration_type").notNull(), // 'meetup', 'photoshoot', 'event'
  maxParticipants: integer("max_participants").default(10),
  currentParticipants: integer("current_participants").default(0),
  requirements: jsonb("requirements").default("{}"), // age, verification, etc.
  scheduledAt: timestamp("scheduled_at").notNull(),
  duration: integer("duration"), // in minutes
  status: varchar("status").notNull().default("open"), // 'open', 'full', 'cancelled', 'completed'
  chatRoomId: varchar("chat_room_id").references(() => chatRooms.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// === SPONZY v6.8 ENTERPRISE FEATURES ===

// Tax Management System
export const taxRates = pgTable("tax_rates", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  rate: decimal("rate", { precision: 5, scale: 4 }).notNull(), // 0.2000 for 20%
  type: varchar("type").notNull(), // 'vat', 'gst', 'sales_tax', 'income_tax'
  country: varchar("country").notNull(),
  state: varchar("state"), // For US states, etc.
  region: varchar("region"),
  applicableServices: jsonb("applicable_services").default(
    '["subscriptions", "tips", "content"]',
  ),
  isActive: boolean("is_active").default(true),
  effectiveDate: timestamp("effective_date").defaultNow(),
  expiryDate: timestamp("expiry_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Advertising System
export const adCampaigns = pgTable("ad_campaigns", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  advertiserId: varchar("advertiser_id")
    .references(() => users.id)
    .notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  type: varchar("type").notNull(), // 'banner', 'video', 'sponsored_post', 'creator_promotion'
  targetAudience: jsonb("target_audience").default("{}"), // Demographics, interests, etc.
  budget: decimal("budget", { precision: 10, scale: 2 }).notNull(),
  dailyBudget: decimal("daily_budget", { precision: 10, scale: 2 }),
  bidAmount: decimal("bid_amount", { precision: 8, scale: 4 }),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  status: varchar("status").default("draft"), // 'draft', 'pending', 'approved', 'active', 'paused', 'completed', 'rejected'
  impressions: integer("impressions").default(0),
  clicks: integer("clicks").default(0),
  conversions: integer("conversions").default(0),
  spend: decimal("spend", { precision: 10, scale: 2 }).default("0"),
  adContent: jsonb("ad_content").default("{}"), // Images, videos, text
  placementRules: jsonb("placement_rules").default("{}"), // Where ads can appear
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Live Streaming Enhanced
export const liveStreamSessions = pgTable("live_stream_sessions", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  streamerId: varchar("streamer_id")
    .references(() => users.id)
    .notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  type: varchar("type").notNull(), // 'public', 'private', 'ticketed', 'subscriber_only'
  ticketPrice: decimal("ticket_price", { precision: 10, scale: 2 }),
  minTipAmount: decimal("min_tip_amount", { precision: 10, scale: 2 }),
  maxViewers: integer("max_viewers").default(1000),
  currentViewers: integer("current_viewers").default(0),
  totalEarnings: decimal("total_earnings", { precision: 10, scale: 2 }).default(
    "0",
  ),
  streamKey: varchar("stream_key").notNull(),
  rtmpUrl: text("rtmp_url"),
  hlsUrl: text("hls_url"),
  webRtcConfig: jsonb("webrtc_config").default("{}"),
  recordingEnabled: boolean("recording_enabled").default(false),
  recordingUrl: text("recording_url"),
  status: varchar("status").default("scheduled"), // 'scheduled', 'live', 'ended', 'cancelled'
  scheduledStart: timestamp("scheduled_start"),
  startedAt: timestamp("started_at"),
  endedAt: timestamp("ended_at"),
  tags: jsonb("tags").default('["adult", "live"]'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Private Show Requests
export const privateShowRequests = pgTable("private_show_requests", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  requesterId: varchar("requester_id")
    .references(() => users.id)
    .notNull(),
  performerId: varchar("performer_id")
    .references(() => users.id)
    .notNull(),
  requestedDate: timestamp("requested_date").notNull(),
  duration: integer("duration").notNull(), // minutes
  offeredPrice: decimal("offered_price", { precision: 10, scale: 2 }).notNull(),
  message: text("message"),
  specialRequests: text("special_requests"),
  status: varchar("status").default("pending"), // 'pending', 'accepted', 'rejected', 'completed', 'cancelled'
  streamSessionId: varchar("stream_session_id").references(
    () => liveStreamSessions.id,
  ),
  responseMessage: text("response_message"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Gift System
export const giftCatalog = pgTable("gift_catalog", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  category: varchar("category").notNull(), // 'virtual', 'physical', 'experience'
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency").default("USD"),
  imageUrl: text("image_url"),
  animationUrl: text("animation_url"), // For virtual gifts
  rarity: varchar("rarity").default("common"), // 'common', 'rare', 'epic', 'legendary'
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const giftTransactions = pgTable("gift_transactions", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  senderId: varchar("sender_id")
    .references(() => users.id)
    .notNull(),
  recipientId: varchar("recipient_id")
    .references(() => users.id)
    .notNull(),
  giftId: varchar("gift_id")
    .references(() => giftCatalog.id)
    .notNull(),
  quantity: integer("quantity").default(1),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  message: text("message"),
  isAnonymous: boolean("is_anonymous").default(false),
  status: varchar("status").default("sent"), // 'sent', 'received', 'refunded'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User Deposits System
export const userDeposits = pgTable("user_deposits", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .references(() => users.id)
    .notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency").notNull(),
  processorId: varchar("processor_id")
    .references(() => paymentProcessors.id)
    .notNull(),
  transactionId: varchar("transaction_id"), // External transaction ID
  status: varchar("status").default("pending"), // 'pending', 'completed', 'failed', 'refunded'
  method: varchar("method").notNull(), // 'card', 'crypto', 'bank_transfer'
  processorFee: decimal("processor_fee", { precision: 10, scale: 2 }),
  netAmount: decimal("net_amount", { precision: 10, scale: 2 }),
  metadata: jsonb("metadata").default("{}"),
  confirmationHash: text("confirmation_hash"), // For crypto
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Role-Based Access Control
export const roles = pgTable("roles", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: varchar("name").notNull().unique(),
  displayName: varchar("display_name").notNull(),
  description: text("description"),
  permissions: jsonb("permissions").default('["read:basic"]'), // Array of permission strings
  isSystemRole: boolean("is_system_role").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userRoles = pgTable("user_roles", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .references(() => users.id)
    .notNull(),
  roleId: varchar("role_id")
    .references(() => roles.id)
    .notNull(),
  grantedBy: varchar("granted_by").references(() => users.id),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// System Announcements
export const announcements = pgTable("announcements", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  type: varchar("type").notNull(), // 'info', 'warning', 'urgent', 'update', 'maintenance'
  priority: integer("priority").default(0), // Higher = more important
  targetAudience: jsonb("target_audience").default('["all"]'), // ['creators', 'fans', 'moderators', 'all']
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
  isActive: boolean("is_active").default(true),
  dismissible: boolean("dismissible").default(true),
  createdBy: varchar("created_by")
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// CMS System
export const cmsPages = pgTable("cms_pages", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  slug: varchar("slug").notNull().unique(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  metaTitle: varchar("meta_title"),
  metaDescription: text("meta_description"),
  featuredImage: text("featured_image"),
  status: varchar("status").default("draft"), // 'draft', 'published', 'archived'
  type: varchar("type").default("page"), // 'page', 'blog_post', 'help_article'
  authorId: varchar("author_id")
    .references(() => users.id)
    .notNull(),
  publishedAt: timestamp("published_at"),
  seoScore: integer("seo_score"),
  viewCount: integer("view_count").default(0),
  tags: jsonb("tags").default('["content"]'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Platform Limits
export const platformLimits = pgTable("platform_limits", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  limitType: varchar("limit_type").notNull(), // 'upload_size', 'post_length', 'followers', 'daily_posts'
  userRole: varchar("user_role").notNull(), // 'free', 'premium', 'creator', 'verified'
  limitValue: integer("limit_value").notNull(),
  unit: varchar("unit"), // 'mb', 'gb', 'count', 'characters'
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Reserved Usernames
export const reservedNames = pgTable("reserved_names", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: varchar("name").notNull().unique(),
  reason: text("reason"), // 'brand', 'system', 'admin', 'profanity'
  category: varchar("category").notNull(), // 'system', 'brand', 'inappropriate'
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// System Settings
export const systemSettings = pgTable("system_settings", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  key: varchar("key").notNull().unique(),
  value: text("value"),
  type: varchar("type").default("string"), // 'string', 'number', 'boolean', 'json'
  category: varchar("category").notNull(), // 'general', 'payments', 'moderation', 'features'
  description: text("description"),
  isPublic: boolean("is_public").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Audio Call System
export const audioCalls = pgTable("audio_calls", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  callerId: varchar("caller_id")
    .references(() => users.id)
    .notNull(),
  receiverId: varchar("receiver_id")
    .references(() => users.id)
    .notNull(),
  duration: integer("duration"), // seconds
  pricePerMinute: decimal("price_per_minute", { precision: 8, scale: 2 }),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }),
  status: varchar("status").default("initiated"), // 'initiated', 'ringing', 'active', 'ended', 'missed'
  webrtcSessionId: varchar("webrtc_session_id"),
  recordingUrl: text("recording_url"),
  isRecorded: boolean("is_recorded").default(false),
  qualityRating: integer("quality_rating"), // 1-5 stars
  startedAt: timestamp("started_at"),
  endedAt: timestamp("ended_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Enhanced Payment Processors for all global gateways
export const extendedPaymentProcessors = pgTable(
  "extended_payment_processors",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    name: varchar("name").notNull().unique(),
    slug: varchar("slug").notNull().unique(), // For API reference
    processorType: varchar("processor_type").notNull(), // 'crypto', 'traditional', 'adult_friendly', 'regional'
    region: varchar("region"), // 'global', 'us', 'eu', 'asia', 'latam', 'africa'
    status: varchar("status").notNull().default("active"), // 'active', 'inactive', 'banned'
    isBanned: boolean("is_banned").default(false),
    banReason: text("ban_reason"),
    supportedCurrencies: jsonb("supported_currencies").default('["USD"]'),
    fees: jsonb("fees").default("{}"), // fee structure
    adultFriendly: boolean("adult_friendly").notNull(),
    geographicRestrictions: jsonb("geographic_restrictions").default("[]"),
    integrationConfig: jsonb("integration_config").default("{}"),
    webhookEndpoints: jsonb("webhook_endpoints").default("[]"),
    apiCredentials: jsonb("api_credentials").default("{}"), // Encrypted storage
    testMode: boolean("test_mode").default(true),
    minimumAmount: decimal("minimum_amount", { precision: 10, scale: 2 }),
    maximumAmount: decimal("maximum_amount", { precision: 10, scale: 2 }),
    processingTime: varchar("processing_time"), // '1-3 days', 'instant', etc.
    // Enhanced configurations for specific processors
    subscriptionSupport: boolean("subscription_support").default(false),
    ccbillAccountNumber: varchar("ccbill_account_number"),
    ccbillSubaccountSubscriptions: varchar("ccbill_subaccount_subscriptions"),
    ccbillSubaccount: varchar("ccbill_subaccount"),
    ccbillFlexId: varchar("ccbill_flex_id"),
    ccbillSaltKey: varchar("ccbill_salt_key"),
    ccbillDatalinkUsername: varchar("ccbill_datalink_username"),
    ccbillDatalinkPassword: varchar("ccbill_datalink_password"),
    ccbillSkipSubaccountCancellations: boolean(
      "ccbill_skip_subaccount_cancellations",
    ).default(false),
    // Cardinity specific
    cardinityProjectId: varchar("cardinity_project_id"),
    cardinityProjectSecret: varchar("cardinity_project_secret"),
    // Crypto specific
    cryptoCurrency: varchar("crypto_currency"), // For Binance, etc.
    // Bank transfer specific
    bankInfo: text("bank_info"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
);

// Company Billing Information (from billing.blade.php)
export const companyBilling = pgTable("company_billing", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  company: varchar("company"),
  country: varchar("country"),
  address: text("address"),
  city: varchar("city"),
  zip: varchar("zip"),
  vat: varchar("vat"),
  phone: varchar("phone"),
  showAddressCompanyFooter: boolean("show_address_company_footer").default(
    false,
  ),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Enhanced Audio Call Settings (from audio-call-settings.blade.php)
export const audioCallSettings = pgTable("audio_call_settings", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  audioCallStatus: boolean("audio_call_status").default(false),
  agoraAppId: varchar("agora_app_id"),
  audioCallMinPrice: decimal("audio_call_min_price", {
    precision: 10,
    scale: 2,
  }),
  audioCallMaxPrice: decimal("audio_call_max_price", {
    precision: 10,
    scale: 2,
  }),
  audioCallMaxDuration: integer("audio_call_max_duration").default(60), // minutes
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// System Announcements (from announcements.blade.php)
export const systemAnnouncements = pgTable("system_announcements", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  content: text("content"),
  type: varchar("type").default("primary"), // 'primary', 'danger'
  showTo: varchar("show_to").default("all"), // 'all', 'creators'
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Blog/CMS Posts (from blog.blade.php)
export const blogPosts = pgTable("blog_posts", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  slug: varchar("slug").notNull().unique(),
  content: text("content"),
  excerpt: text("excerpt"),
  featuredImage: varchar("featured_image"),
  isPublished: boolean("is_published").default(false),
  publishedAt: timestamp("published_at"),
  authorId: varchar("author_id").references(() => users.id),
  viewCount: integer("view_count").default(0),
  metaTitle: varchar("meta_title"),
  metaDescription: text("meta_description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Content Categories (from categories.blade.php)
export const contentCategories = pgTable("content_categories", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  slug: varchar("slug").notNull().unique(),
  description: text("description"),
  mode: varchar("mode").default("on"), // 'on', 'off'
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Countries Management (from countries.blade.php)
export const countries = pgTable("countries", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  countryCode: varchar("country_code").notNull().unique(), // ISO code
  countryName: varchar("country_name").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// States/Regions Management (from edit-state.blade.php)
export const states = pgTable("states", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  countryId: varchar("country_id")
    .references(() => countries.id)
    .notNull(),
  stateCode: varchar("state_code").notNull(),
  stateName: varchar("state_name").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Languages Management (from edit-languages.blade.php)
export const languages = pgTable("languages", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  languageName: varchar("language_name").notNull(),
  languageCode: varchar("language_code").notNull().unique(), // ISO 639-1 code
  isActive: boolean("is_active").default(true),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Comments System (from comments.blade.php)
export const userComments = pgTable("user_comments", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  contentId: varchar("content_id").references(() => contentItems.id),
  reply: text("reply").notNull(),
  isApproved: boolean("is_approved").default(false),
  moderatorId: varchar("moderator_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Cron Jobs Management System
export const cronJobs = pgTable("cron_jobs", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  command: text("command").notNull(),
  schedule: varchar("schedule").notNull(), // Cron expression
  isActive: boolean("is_active").default(true),
  isRunning: boolean("is_running").default(false),
  lastRunAt: timestamp("last_run_at"),
  nextRunAt: timestamp("next_run_at"),
  lastResult: varchar("last_result"), // 'success', 'failed', 'timeout'
  lastOutput: text("last_output"),
  lastError: text("last_error"),
  timeout: integer("timeout").default(300), // seconds
  retryCount: integer("retry_count").default(0),
  maxRetries: integer("max_retries").default(3),
  priority: varchar("priority").default("normal"), // 'low', 'normal', 'high', 'critical'
  category: varchar("category").notNull(), // 'maintenance', 'analytics', 'payments', 'content', 'backup'
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Cron Job Execution Logs
export const cronJobLogs = pgTable("cron_job_logs", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  jobId: varchar("job_id")
    .references(() => cronJobs.id)
    .notNull(),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  status: varchar("status").notNull(), // 'running', 'success', 'failed', 'timeout', 'cancelled'
  exitCode: integer("exit_code"),
  output: text("output"),
  errorOutput: text("error_output"),
  duration: integer("duration"), // milliseconds
  memoryUsage: integer("memory_usage"), // bytes
  cpuUsage: decimal("cpu_usage", { precision: 5, scale: 2 }), // percentage
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas (defined after all tables)
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastLoginAt: true,
  createdBy: true,
  clearanceLevel: true,
  vaultAccess: true,
  modulePermissions: true,
  isActive: true,
  profileImageUrl: true,
  phoneNumber: true,
  address: true,
  city: true,
  country: true,
  postalCode: true,
  verificationStatus: true,
});

export const insertContentItemSchema = createInsertSchema(contentItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertModerationResultSchema = createInsertSchema(
  moderationResults,
).omit({
  id: true,
  createdAt: true,
});

export const insertLiveStreamSchema = createInsertSchema(liveStreams).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertModerationSettingsSchema = createInsertSchema(
  moderationSettings,
).omit({
  id: true,
  updatedAt: true,
});

export const insertAppealRequestSchema = createInsertSchema(
  appealRequests,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEncryptedVaultSchema = createInsertSchema(
  encryptedVault,
).omit({
  id: true,
  createdAt: true,
});

export const insertAdminActionLogSchema = createInsertSchema(
  adminActionLogs,
).omit({
  id: true,
  createdAt: true,
});

export const insertAdminSessionLogSchema = createInsertSchema(
  adminSessionLogs,
).omit({
  id: true,
  createdAt: true,
});

export const insertContentFilterSchema = createInsertSchema(
  contentFilters,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAuditTrailSchema = createInsertSchema(auditTrail).omit({
  id: true,
  createdAt: true,
});

export const insertPlatformSchema = createInsertSchema(platforms).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPlatformConnectionSchema = createInsertSchema(
  platformConnections,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAIAnalysisResultSchema = createInsertSchema(
  aiAnalysisResults,
).omit({
  id: true,
  createdAt: true,
});

export const insertForm2257VerificationSchema = createInsertSchema(
  form2257Verifications,
).omit({
  id: true,
  submittedAt: true,
  processedAt: true,
});

// Chat schemas moved to after table definitions

export const insertEmailAccountSchema = createInsertSchema(emailAccounts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEmailMessageSchema = createInsertSchema(emailMessages).omit({
  id: true,
  createdAt: true,
});

export const insertUserAnalyticsSchema = createInsertSchema(userAnalytics).omit(
  {
    id: true,
    createdAt: true,
    updatedAt: true,
  },
);

export const insertMediaAssetSchema = createInsertSchema(mediaAssets).omit({
  id: true,
  uploadedAt: true,
  processedAt: true,
});

export const insertSystemNotificationSchema = createInsertSchema(
  systemNotifications,
).omit({
  id: true,
  createdAt: true,
});

export const insertPlatformStatsSchema = createInsertSchema(platformStats).omit(
  {
    id: true,
    createdAt: true,
  },
);

export const insertStreamTokenSchema = createInsertSchema(streamTokens).omit({
  id: true,
  createdAt: true,
});

export const insertStreamChannelSchema = createInsertSchema(
  streamChannels,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEncodingJobSchema = createInsertSchema(encodingJobs).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertEncodingPresetSchema = createInsertSchema(
  encodingPresets,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPaymentProcessorSchema = createInsertSchema(
  paymentProcessors,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPaymentTransactionSchema = createInsertSchema(
  paymentTransactions,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAICompanionSchema = createInsertSchema(aiCompanions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAIModelSchema = createInsertSchema(aiModels).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertHuggingFaceModelSchema = createInsertSchema(huggingfaceModels).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastUsed: true,
});

export const insertVRSessionSchema = createInsertSchema(vrSessions).omit({
  id: true,
  createdAt: true,
});

export const insertWebRTCRoomSchema = createInsertSchema(webrtcRooms).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGeoLocationSchema = createInsertSchema(geoLocations).omit({
  id: true,
  createdAt: true,
});

export const insertGeoCollaborationSchema = createInsertSchema(
  geoCollaborations,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Insert schemas for new Sponzy v6.8 features
export const insertTaxRateSchema = createInsertSchema(taxRates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAdCampaignSchema = createInsertSchema(adCampaigns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLiveStreamSessionSchema = createInsertSchema(
  liveStreamSessions,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPrivateShowRequestSchema = createInsertSchema(
  privateShowRequests,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGiftCatalogSchema = createInsertSchema(giftCatalog).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGiftTransactionSchema = createInsertSchema(
  giftTransactions,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserDepositSchema = createInsertSchema(userDeposits).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRoleSchema = createInsertSchema(roles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserRoleSchema = createInsertSchema(userRoles).omit({
  id: true,
  createdAt: true,
});

export const insertAnnouncementSchema = createInsertSchema(announcements).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCmsPageSchema = createInsertSchema(cmsPages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPlatformLimitSchema = createInsertSchema(
  platformLimits,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReservedNameSchema = createInsertSchema(reservedNames).omit({
  id: true,
  createdAt: true,
});

export const insertSystemSettingSchema = createInsertSchema(
  systemSettings,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAudioCallSchema = createInsertSchema(audioCalls).omit({
  id: true,
  createdAt: true,
});

export const insertExtendedPaymentProcessorSchema = createInsertSchema(
  extendedPaymentProcessors,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCompanyBillingSchema = createInsertSchema(
  companyBilling,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAudioCallSettingsSchema = createInsertSchema(
  audioCallSettings,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSystemAnnouncementSchema = createInsertSchema(
  systemAnnouncements,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  publishedAt: true,
});

export const insertContentCategorySchema = createInsertSchema(
  contentCategories,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCountrySchema = createInsertSchema(countries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStateSchema = createInsertSchema(states).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLanguageSchema = createInsertSchema(languages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserCommentSchema = createInsertSchema(userComments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCronJobSchema = createInsertSchema(cronJobs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  isRunning: true,
  lastRunAt: true,
  nextRunAt: true,
  lastResult: true,
  lastOutput: true,
  lastError: true,
  retryCount: true,
});

export const insertCronJobLogSchema = createInsertSchema(cronJobLogs).omit({
  id: true,
  createdAt: true,
});

// All type definitions (consolidated)
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type ContentItem = typeof contentItems.$inferSelect;
export type InsertContentItem = z.infer<typeof insertContentItemSchema>;
export type ModerationResult = typeof moderationResults.$inferSelect;
export type InsertModerationResult = z.infer<
  typeof insertModerationResultSchema
>;
export type LiveStream = typeof liveStreams.$inferSelect;
export type InsertLiveStream = z.infer<typeof insertLiveStreamSchema>;
export type ModerationSettings = typeof moderationSettings.$inferSelect;
export type InsertModerationSettings = z.infer<
  typeof insertModerationSettingsSchema
>;
export type AppealRequest = typeof appealRequests.$inferSelect;
export type InsertAppealRequest = z.infer<typeof insertAppealRequestSchema>;
export type EncryptedVault = typeof encryptedVault.$inferSelect;
export type InsertEncryptedVault = z.infer<typeof insertEncryptedVaultSchema>;
export type AdminActionLog = typeof adminActionLogs.$inferSelect;
export type InsertAdminActionLog = z.infer<typeof insertAdminActionLogSchema>;
export type AdminSessionLog = typeof adminSessionLogs.$inferSelect;
export type InsertAdminSessionLog = z.infer<typeof insertAdminSessionLogSchema>;
export type ContentFilter = typeof contentFilters.$inferSelect;
export type InsertContentFilter = z.infer<typeof insertContentFilterSchema>;
export type AuditTrail = typeof auditTrail.$inferSelect;
export type InsertAuditTrail = z.infer<typeof insertAuditTrailSchema>;
export type Platform = typeof platforms.$inferSelect;
export type InsertPlatform = z.infer<typeof insertPlatformSchema>;
export type PlatformConnection = typeof platformConnections.$inferSelect;
export type InsertPlatformConnection = z.infer<
  typeof insertPlatformConnectionSchema
>;
export type AIAnalysisResult = typeof aiAnalysisResults.$inferSelect;
export type InsertAIAnalysisResult = z.infer<
  typeof insertAIAnalysisResultSchema
>;
export type Form2257Verification = typeof form2257Verifications.$inferSelect;
export type InsertForm2257Verification = z.infer<
  typeof insertForm2257VerificationSchema
>;
export type EmailAccount = typeof emailAccounts.$inferSelect;
export type InsertEmailAccount = z.infer<typeof insertEmailAccountSchema>;
export type EmailMessage = typeof emailMessages.$inferSelect;
export type InsertEmailMessage = z.infer<typeof insertEmailMessageSchema>;
export type UserAnalytics = typeof userAnalytics.$inferSelect;
export type InsertUserAnalytics = z.infer<typeof insertUserAnalyticsSchema>;
export type MediaAsset = typeof mediaAssets.$inferSelect;
export type InsertMediaAsset = z.infer<typeof insertMediaAssetSchema>;
export type SystemNotification = typeof systemNotifications.$inferSelect;
export type InsertSystemNotification = z.infer<
  typeof insertSystemNotificationSchema
>;
export type PlatformStats = typeof platformStats.$inferSelect;
export type InsertPlatformStats = z.infer<typeof insertPlatformStatsSchema>;
export type StreamToken = typeof streamTokens.$inferSelect;
export type InsertStreamToken = z.infer<typeof insertStreamTokenSchema>;
export type StreamChannel = typeof streamChannels.$inferSelect;
export type InsertStreamChannel = z.infer<typeof insertStreamChannelSchema>;
export type EncodingJob = typeof encodingJobs.$inferSelect;
export type InsertEncodingJob = z.infer<typeof insertEncodingJobSchema>;
export type EncodingPreset = typeof encodingPresets.$inferSelect;
export type InsertEncodingPreset = z.infer<typeof insertEncodingPresetSchema>;
export type PaymentProcessor = typeof paymentProcessors.$inferSelect;
export type InsertPaymentProcessor = z.infer<
  typeof insertPaymentProcessorSchema
>;
export type PaymentTransaction = typeof paymentTransactions.$inferSelect;
export type InsertPaymentTransaction = z.infer<
  typeof insertPaymentTransactionSchema
>;
export type AICompanion = typeof aiCompanions.$inferSelect;
export type InsertAICompanion = z.infer<typeof insertAICompanionSchema>;
export type AIModel = typeof aiModels.$inferSelect;
export type InsertAIModel = z.infer<typeof insertAIModelSchema>;
export type HuggingFaceModel = typeof huggingfaceModels.$inferSelect;
export type InsertHuggingFaceModel = z.infer<typeof insertHuggingFaceModelSchema>;
export type VRSession = typeof vrSessions.$inferSelect;
export type InsertVRSession = z.infer<typeof insertVRSessionSchema>;
export type WebRTCRoom = typeof webrtcRooms.$inferSelect;
export type InsertWebRTCRoom = z.infer<typeof insertWebRTCRoomSchema>;
export type GeoLocation = typeof geoLocations.$inferSelect;
export type InsertGeoLocation = z.infer<typeof insertGeoLocationSchema>;
export type GeoCollaboration = typeof geoCollaborations.$inferSelect;
export type InsertGeoCollaboration = z.infer<
  typeof insertGeoCollaborationSchema
>;

// New Sponzy v6.8 types
export type TaxRate = typeof taxRates.$inferSelect;
export type InsertTaxRate = z.infer<typeof insertTaxRateSchema>;
export type AdCampaign = typeof adCampaigns.$inferSelect;
export type InsertAdCampaign = z.infer<typeof insertAdCampaignSchema>;
export type LiveStreamSession = typeof liveStreamSessions.$inferSelect;
export type InsertLiveStreamSession = z.infer<
  typeof insertLiveStreamSessionSchema
>;
export type PrivateShowRequest = typeof privateShowRequests.$inferSelect;
export type InsertPrivateShowRequest = z.infer<
  typeof insertPrivateShowRequestSchema
>;
export type GiftCatalog = typeof giftCatalog.$inferSelect;
export type InsertGiftCatalog = z.infer<typeof insertGiftCatalogSchema>;
export type GiftTransaction = typeof giftTransactions.$inferSelect;
export type InsertGiftTransaction = z.infer<typeof insertGiftTransactionSchema>;
export type UserDeposit = typeof userDeposits.$inferSelect;
export type InsertUserDeposit = z.infer<typeof insertUserDepositSchema>;
export type Role = typeof roles.$inferSelect;
export type InsertRole = z.infer<typeof insertRoleSchema>;
export type UserRole = typeof userRoles.$inferSelect;
export type InsertUserRole = z.infer<typeof insertUserRoleSchema>;
export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
export type CmsPage = typeof cmsPages.$inferSelect;
export type InsertCmsPage = z.infer<typeof insertCmsPageSchema>;
export type PlatformLimit = typeof platformLimits.$inferSelect;
export type InsertPlatformLimit = z.infer<typeof insertPlatformLimitSchema>;
export type ReservedName = typeof reservedNames.$inferSelect;
export type InsertReservedName = z.infer<typeof insertReservedNameSchema>;
export type SystemSetting = typeof systemSettings.$inferSelect;
export type InsertSystemSetting = z.infer<typeof insertSystemSettingSchema>;
export type AudioCall = typeof audioCalls.$inferSelect;
export type InsertAudioCall = z.infer<typeof insertAudioCallSchema>;
export type ExtendedPaymentProcessor =
  typeof extendedPaymentProcessors.$inferSelect;
export type InsertExtendedPaymentProcessor = z.infer<
  typeof insertExtendedPaymentProcessorSchema
>;
export type CompanyBilling = typeof companyBilling.$inferSelect;
export type InsertCompanyBilling = z.infer<typeof insertCompanyBillingSchema>;
export type AudioCallSettings = typeof audioCallSettings.$inferSelect;
export type InsertAudioCallSettings = z.infer<
  typeof insertAudioCallSettingsSchema
>;
export type SystemAnnouncement = typeof systemAnnouncements.$inferSelect;
export type InsertSystemAnnouncement = z.infer<
  typeof insertSystemAnnouncementSchema
>;
export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type ContentCategory = typeof contentCategories.$inferSelect;
export type InsertContentCategory = z.infer<typeof insertContentCategorySchema>;
export type Country = typeof countries.$inferSelect;
export type InsertCountry = z.infer<typeof insertCountrySchema>;
export type State = typeof states.$inferSelect;
export type InsertState = z.infer<typeof insertStateSchema>;
export type Language = typeof languages.$inferSelect;
export type InsertLanguage = z.infer<typeof insertLanguageSchema>;
export type UserComment = typeof userComments.$inferSelect;
export type InsertUserComment = z.infer<typeof insertUserCommentSchema>;
export type CronJob = typeof cronJobs.$inferSelect;
export type InsertCronJob = z.infer<typeof insertCronJobSchema>;
export type CronJobLog = typeof cronJobLogs.$inferSelect;
export type InsertCronJobLog = z.infer<typeof insertCronJobLogSchema>;

// Additional Sponzy v6.8 Features - Unique Definitions Only

// Live Streaming Private Requests (from live-streaming-private-requests.blade)
export const liveStreamingPrivateRequests = pgTable(
  "live_streaming_private_requests",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    buyerId: varchar("buyer_id")
      .references(() => users.id)
      .notNull(),
    creatorId: varchar("creator_id")
      .references(() => users.id)
      .notNull(),
    minutes: integer("minutes").notNull(),
    pricePerMinute: decimal("price_per_minute", {
      precision: 10,
      scale: 2,
    }).notNull(),
    totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
    status: varchar("status").default("pending"), // 'pending', 'accepted', 'rejected', 'completed'
    message: text("message"),
    streamUrl: varchar("stream_url"),
    startedAt: timestamp("started_at"),
    endedAt: timestamp("ended_at"),
    createdAt: timestamp("created_at").defaultNow(),
  },
);

// Enhanced Member Management (from members.blade)
export const memberProfiles = pgTable("member_profiles", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .references(() => users.id)
    .notNull(),
  biography: text("biography"),
  website: varchar("website"),
  location: varchar("location"),
  birthDate: timestamp("birth_date"),
  isVerified: boolean("is_verified").default(false),
  verificationStatus: varchar("verification_status").default("pending"), // 'pending', 'approved', 'rejected'
  verificationDocuments: text("verification_documents").array(),
  socialLinks: jsonb("social_links").default("{}"),
  earnings: decimal("earnings", { precision: 12, scale: 2 }).default("0.00"),
  accountStatus: varchar("account_status").default("active"), // 'active', 'suspended', 'banned'
  lastActivity: timestamp("last_activity"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Platform Messages System (from messages.blade)
export const platformMessages = pgTable("platform_messages", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  senderId: varchar("sender_id").references(() => users.id),
  receiverId: varchar("receiver_id").references(() => users.id),
  subject: varchar("subject"),
  message: text("message").notNull(),
  messageType: varchar("message_type").default("direct"), // 'direct', 'broadcast', 'system'
  isRead: boolean("is_read").default(false),
  isArchived: boolean("is_archived").default(false),
  priority: varchar("priority").default("normal"), // 'low', 'normal', 'high', 'urgent'
  attachments: jsonb("attachments").default("[]"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Payment Processor Specific Settings
export const paymentProcessorSettings = pgTable("payment_processor_settings", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  processorName: varchar("processor_name").notNull(), // 'flutterwave', 'instamojo', 'mercadopago', 'mollie', 'nowpayments'
  isEnabled: boolean("is_enabled").default(false),
  fee: decimal("fee", { precision: 5, scale: 2 }).default("0.00"),
  feeCents: decimal("fee_cents", { precision: 5, scale: 2 }).default("0.00"),
  isSandbox: boolean("is_sandbox").default(true),

  // Common fields
  publicKey: varchar("public_key"),
  secretKey: varchar("secret_key"),
  apiKey: varchar("api_key"),
  authToken: varchar("auth_token"),
  accessToken: varchar("access_token"),
  ipnSecret: varchar("ipn_secret"),

  // Processor-specific settings
  projectId: varchar("project_id"), // For processors that need it
  environment: varchar("environment").default("sandbox"), // 'sandbox', 'production'

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// System Limits Configuration (from limits.blade)
export const systemLimits = pgTable("system_limits", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  limitType: varchar("limit_type").notNull(), // 'upload_size', 'daily_posts', 'followers', etc.
  limitName: varchar("limit_name").notNull(),
  limitValue: integer("limit_value").notNull(),
  unitType: varchar("unit_type").default("count"), // 'count', 'mb', 'gb', 'minutes'
  appliesToRole: varchar("applies_to_role").default("all"), // 'all', 'creator', 'user'
  isActive: boolean("is_active").default(true),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type SystemLimit = typeof systemLimits.$inferSelect;

export const insertSystemLimitSchema = createInsertSchema(systemLimits).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSystemLimit = z.infer<typeof insertSystemLimitSchema>;

// === ADDITIONAL SPONZY v6.8 FEATURES ===

// Shop/Marketplace System
export const shopSettings = pgTable("shop_settings", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  shopEnabled: boolean("shop_enabled").default(false),
  allowFreeItems: boolean("allow_free_items").default(false),
  allowExternalLinks: boolean("allow_external_links").default(false),
  digitalProductsEnabled: boolean("digital_products_enabled").default(false),
  customContentEnabled: boolean("custom_content_enabled").default(false),
  physicalProductsEnabled: boolean("physical_products_enabled").default(false),
  minPriceProduct: decimal("min_price_product", {
    precision: 10,
    scale: 2,
  }).default("1.00"),
  maxPriceProduct: decimal("max_price_product", {
    precision: 10,
    scale: 2,
  }).default("1000.00"),
  commissionRate: decimal("commission_rate", {
    precision: 5,
    scale: 4,
  }).default("0.20"), // 20%
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const shopProducts = pgTable("shop_products", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  sellerId: varchar("seller_id")
    .references(() => users.id)
    .notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  type: varchar("type").notNull(), // 'digital', 'physical', 'custom_content'
  category: varchar("category"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency").default("USD"),
  imageUrls: jsonb("image_urls").default("[]"),
  downloadUrl: text("download_url"), // For digital products
  fileSize: integer("file_size"), // In bytes
  externalUrl: text("external_url"), // For external links
  stock: integer("stock"), // For physical products
  isActive: boolean("is_active").default(true),
  totalSales: integer("total_sales").default(0),
  tags: jsonb("tags").default("[]"),
  metadata: jsonb("metadata").default("{}"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Social Login Configuration
export const socialLoginProviders = pgTable("social_login_providers", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  provider: varchar("provider").notNull().unique(), // 'facebook', 'twitter', 'google', 'apple'
  clientId: text("client_id"),
  clientSecret: text("client_secret"),
  isEnabled: boolean("is_enabled").default(false),
  callbackUrl: text("callback_url"),
  scopes: jsonb("scopes").default("[]"),
  additionalConfig: jsonb("additional_config").default("{}"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Cloud Storage Configuration
export const storageProviders = pgTable("storage_providers", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  provider: varchar("provider").notNull().unique(), // 's3', 'dospace', 'wasabi', 'backblaze', 'vultr', 'r2'
  isDefault: boolean("is_default").default(false),
  isEnabled: boolean("is_enabled").default(false),
  region: varchar("region"),
  bucket: varchar("bucket"),
  accessKey: text("access_key"),
  secretKey: text("secret_key"),
  endpoint: text("endpoint"),
  cdnEnabled: boolean("cdn_enabled").default(false),
  cdnUrl: text("cdn_url"),
  forceHttps: boolean("force_https").default(true),
  additionalConfig: jsonb("additional_config").default("{}"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Stories System
export const storyBackgrounds = pgTable("story_backgrounds", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  imageUrl: text("image_url").notNull(),
  category: varchar("category").default("default"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const storyFonts = pgTable("story_fonts", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  fontFamily: varchar("font_family").notNull(),
  googleFontName: varchar("google_font_name"), // For Google Fonts
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const storyPosts = pgTable("story_posts", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .references(() => users.id)
    .notNull(),
  title: varchar("title"),
  mediaType: varchar("media_type").notNull(), // 'image', 'video', 'text'
  mediaUrl: text("media_url"),
  textContent: text("text_content"),
  backgroundColor: varchar("background_color"),
  backgroundImageUrl: text("background_image_url"),
  fontFamily: varchar("font_family"),
  fontSize: integer("font_size"),
  textColor: varchar("text_color"),
  duration: integer("duration").default(24), // Hours before expiry
  viewCount: integer("view_count").default(0),
  isActive: boolean("is_active").default(true),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const storySettings = pgTable("story_settings", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  storyStatus: boolean("story_status").default(false),
  storyImage: boolean("story_image").default(true),
  storyText: boolean("story_text").default(true),
  storyVideo: boolean("story_video").default(true),
  maxVideoLength: integer("max_video_length").default(30), // seconds
  autoDeleteAfter: integer("auto_delete_after").default(24), // hours
  allowDownload: boolean("allow_download").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Stickers/Emojis Management
export const stickers = pgTable("stickers", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: varchar("name"),
  url: text("url").notNull(),
  category: varchar("category").default("general"),
  isAnimated: boolean("is_animated").default(false),
  fileSize: integer("file_size"),
  isActive: boolean("is_active").default(true),
  usageCount: integer("usage_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Theme & Branding Settings
export const themeSettings = pgTable("theme_settings", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  homeStyle: integer("home_style").default(0), // 0, 1, 2 for different layouts
  logoUrl: text("logo_url"),
  logoBlueUrl: text("logo_blue_url"),
  faviconUrl: text("favicon_url"),
  watermarkVideoUrl: text("watermark_video_url"),
  indexImageTopUrl: text("index_image_top_url"),
  backgroundUrl: text("background_url"),
  avatarDefaultUrl: text("avatar_default_url"),
  coverDefaultUrl: text("cover_default_url"),
  primaryColor: varchar("primary_color").default("#007bff"),
  themePwaColor: varchar("theme_pwa_color").default("#007bff"),
  navbarBackgroundColor: varchar("navbar_background_color").default("#ffffff"),
  navbarTextColor: varchar("navbar_text_color").default("#000000"),
  footerBackgroundColor: varchar("footer_background_color").default("#f8f9fa"),
  footerTextColor: varchar("footer_text_color").default("#6c757d"),
  buttonStyle: varchar("button_style").default("rounded"), // 'rounded', 'square'
  customCss: text("custom_css"),
  customJs: text("custom_js"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Video Encoding Configuration
export const videoEncodingSettings = pgTable("video_encoding_settings", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  encodingEnabled: boolean("encoding_enabled").default(false),
  encodingMethod: varchar("encoding_method").default("ffmpeg"), // 'ffmpeg', 'coconut'
  watermarkEnabled: boolean("watermark_enabled").default(false),
  watermarkPosition: varchar("watermark_position").default("bottomright"),
  ffmpegPath: text("ffmpeg_path").default("/usr/bin/ffmpeg"),
  ffprobePath: text("ffprobe_path").default("/usr/bin/ffprobe"),
  coconutApiKey: text("coconut_api_key"),
  coconutRegion: varchar("coconut_region").default("Virginia"),
  outputFormats: jsonb("output_formats").default('["mp4", "webm"]'),
  qualitySettings: jsonb("quality_settings").default("{}"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// WebSocket/Pusher Configuration
export const websocketSettings = pgTable("websocket_settings", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  websocketsEnabled: boolean("websockets_enabled").default(false),
  pusherAppId: text("pusher_app_id"),
  pusherAppKey: text("pusher_app_key"),
  pusherAppSecret: text("pusher_app_secret"),
  pusherCluster: varchar("pusher_cluster").default("us2"),
  pusherUseTls: boolean("pusher_use_tls").default(true),
  customWebsocketUrl: text("custom_websocket_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Enhanced Subscription Management
export const subscriptionPlans = pgTable("subscription_plans", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  creatorId: varchar("creator_id")
    .references(() => users.id)
    .notNull(),
  name: varchar("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency").default("USD"),
  billingCycle: varchar("billing_cycle").default("monthly"), // 'monthly', 'yearly', 'weekly'
  trialDays: integer("trial_days").default(0),
  benefits: jsonb("benefits").default("[]"),
  isActive: boolean("is_active").default(true),
  subscriberCount: integer("subscriber_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert Schemas for new tables
export const insertShopSettingsSchema = createInsertSchema(shopSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertShopProductSchema = createInsertSchema(shopProducts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSocialLoginProviderSchema = createInsertSchema(
  socialLoginProviders,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStorageProviderSchema = createInsertSchema(
  storageProviders,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStoryBackgroundSchema = createInsertSchema(
  storyBackgrounds,
).omit({
  id: true,
  createdAt: true,
});

export const insertStoryFontSchema = createInsertSchema(storyFonts).omit({
  id: true,
  createdAt: true,
});

export const insertStoryPostSchema = createInsertSchema(storyPosts).omit({
  id: true,
  createdAt: true,
});

export const insertStorySettingsSchema = createInsertSchema(storySettings).omit(
  {
    id: true,
    createdAt: true,
    updatedAt: true,
  },
);

export const insertStickerSchema = createInsertSchema(stickers).omit({
  id: true,
  createdAt: true,
});

export const insertThemeSettingsSchema = createInsertSchema(themeSettings).omit(
  {
    id: true,
    createdAt: true,
    updatedAt: true,
  },
);

export const insertVideoEncodingSettingsSchema = createInsertSchema(
  videoEncodingSettings,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWebsocketSettingsSchema = createInsertSchema(
  websocketSettings,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSubscriptionPlanSchema = createInsertSchema(
  subscriptionPlans,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Type definitions for new tables
export type ShopSettings = typeof shopSettings.$inferSelect;
export type InsertShopSettings = z.infer<typeof insertShopSettingsSchema>;
export type ShopProduct = typeof shopProducts.$inferSelect;
export type InsertShopProduct = z.infer<typeof insertShopProductSchema>;
export type SocialLoginProvider = typeof socialLoginProviders.$inferSelect;
export type InsertSocialLoginProvider = z.infer<
  typeof insertSocialLoginProviderSchema
>;
export type StorageProvider = typeof storageProviders.$inferSelect;
export type InsertStorageProvider = z.infer<typeof insertStorageProviderSchema>;
export type StoryBackground = typeof storyBackgrounds.$inferSelect;
export type InsertStoryBackground = z.infer<typeof insertStoryBackgroundSchema>;
export type StoryFont = typeof storyFonts.$inferSelect;
export type InsertStoryFont = z.infer<typeof insertStoryFontSchema>;
export type StoryPost = typeof storyPosts.$inferSelect;
export type InsertStoryPost = z.infer<typeof insertStoryPostSchema>;
export type StorySettings = typeof storySettings.$inferSelect;
export type InsertStorySettings = z.infer<typeof insertStorySettingsSchema>;
export type Sticker = typeof stickers.$inferSelect;
export type InsertSticker = z.infer<typeof insertStickerSchema>;
export type ThemeSettings = typeof themeSettings.$inferSelect;
export type InsertThemeSettings = z.infer<typeof insertThemeSettingsSchema>;
export type VideoEncodingSettings = typeof videoEncodingSettings.$inferSelect;
export type InsertVideoEncodingSettings = z.infer<
  typeof insertVideoEncodingSettingsSchema
>;
export type WebsocketSettings = typeof websocketSettings.$inferSelect;
export type InsertWebsocketSettings = z.infer<
  typeof insertWebsocketSettingsSchema
>;
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = z.infer<
  typeof insertSubscriptionPlanSchema
>;

// Withdrawal Management System
export const withdrawalRequests = pgTable("withdrawal_requests", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .references(() => users.id)
    .notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  gateway: varchar("gateway").notNull(), // 'PayPal', 'Payoneer', 'Zelle', 'Western Union', 'Bitcoin', 'Mercado Pago', 'Bank'
  account: text("account").notNull(), // Account details/address
  status: varchar("status").default("pending"), // 'pending', 'paid', 'rejected'
  datePaid: timestamp("date_paid"),
  rejectionReason: text("rejection_reason"),
  processingNotes: text("processing_notes"),
  transactionId: text("transaction_id"), // External transaction reference
  fee: decimal("fee", { precision: 10, scale: 2 }).default("0"),
  netAmount: decimal("net_amount", { precision: 10, scale: 2 }),
  currency: varchar("currency").default("USD"),
  date: timestamp("date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Withdrawal Settings Configuration
export const withdrawalSettings = pgTable("withdrawal_settings", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  minimumAmount: decimal("minimum_amount", { precision: 10, scale: 2 }).default(
    "50.00",
  ),
  maximumAmount: decimal("maximum_amount", { precision: 10, scale: 2 }).default(
    "10000.00",
  ),
  processingFee: decimal("processing_fee", { precision: 5, scale: 4 }).default(
    "0.0250",
  ), // 2.5%
  fixedFee: decimal("fixed_fee", { precision: 10, scale: 2 }).default("2.00"),
  processingDays: integer("processing_days").default(7),
  autoApprovalThreshold: decimal("auto_approval_threshold", {
    precision: 10,
    scale: 2,
  }).default("1000.00"),
  enabledGateways: jsonb("enabled_gateways").default('["PayPal", "Bank"]'),
  requireVerification: boolean("require_verification").default(true),
  weeklyLimit: decimal("weekly_limit", { precision: 10, scale: 2 }),
  monthlyLimit: decimal("monthly_limit", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert Schemas for withdrawal tables
export const insertWithdrawalRequestSchema = createInsertSchema(
  withdrawalRequests,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWithdrawalSettingsSchema = createInsertSchema(
  withdrawalSettings,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Type definitions for withdrawal tables
export type WithdrawalRequest = typeof withdrawalRequests.$inferSelect;
export type InsertWithdrawalRequest = z.infer<
  typeof insertWithdrawalRequestSchema
>;
export type WithdrawalSettings = typeof withdrawalSettings.$inferSelect;
export type InsertWithdrawalSettings = z.infer<
  typeof insertWithdrawalSettingsSchema
>;

// Authentication & Email Management System
export const emailTemplates = pgTable("email_templates", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  templateName: varchar("template_name").notNull().unique(),
  subject: varchar("subject").notNull(),
  htmlContent: text("html_content").notNull(),
  textContent: text("text_content"),
  variables: jsonb("variables").default("[]"), // Available template variables
  isActive: boolean("is_active").default(true),
  category: varchar("category").default("general"), // 'auth', 'notification', 'marketing', 'system'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const emailLogs = pgTable("email_logs", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  recipientEmail: varchar("recipient_email").notNull(),
  recipientName: varchar("recipient_name"),
  templateId: varchar("template_id").references(() => emailTemplates.id),
  subject: varchar("subject").notNull(),
  status: varchar("status").default("pending"), // 'pending', 'sent', 'delivered', 'failed', 'bounced'
  provider: varchar("provider").default("sendgrid"), // 'sendgrid', 'mailgun', 'smtp'
  externalId: varchar("external_id"), // Provider message ID
  errorMessage: text("error_message"),
  sentAt: timestamp("sent_at"),
  deliveredAt: timestamp("delivered_at"),
  openedAt: timestamp("opened_at"),
  clickedAt: timestamp("clicked_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const socialLogins = pgTable("social_logins", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .references(() => users.id)
    .notNull(),
  provider: varchar("provider").notNull(), // 'facebook', 'google', 'twitter', 'apple'
  providerId: varchar("provider_id").notNull(), // Social platform user ID
  providerEmail: varchar("provider_email"),
  providerName: varchar("provider_name"),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  tokenExpiresAt: timestamp("token_expires_at"),
  lastLoginAt: timestamp("last_login_at"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userVerifications = pgTable("user_verifications", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .references(() => users.id)
    .notNull(),
  verificationType: varchar("verification_type").notNull(), // 'email', 'phone', 'identity', 'address'
  verificationValue: varchar("verification_value").notNull(), // email, phone, etc.
  token: varchar("token"), // Verification token
  code: varchar("code"), // Verification code (SMS, email)
  status: varchar("status").default("pending"), // 'pending', 'verified', 'expired', 'failed'
  attempts: integer("attempts").default(0),
  maxAttempts: integer("max_attempts").default(3),
  expiresAt: timestamp("expires_at"),
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userSessions = pgTable("user_sessions", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .references(() => users.id)
    .notNull(),
  sessionToken: varchar("session_token").notNull().unique(),
  deviceInfo: jsonb("device_info"), // Browser, OS, device details
  ipAddress: varchar("ip_address"),
  location: varchar("location"), // Geographic location
  isActive: boolean("is_active").default(true),
  lastActivityAt: timestamp("last_activity_at").defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userActivity = pgTable("user_activity", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .references(() => users.id)
    .notNull(),
  activityType: varchar("activity_type").notNull(), // 'login', 'logout', 'profile_update', 'content_upload'
  description: text("description"),
  metadata: jsonb("metadata"), // Additional activity data
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const contactMessages = pgTable("contact_messages", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  email: varchar("email").notNull(),
  subject: varchar("subject").notNull(),
  message: text("message").notNull(),
  status: varchar("status").default("new"), // 'new', 'read', 'replied', 'resolved', 'archived'
  priority: varchar("priority").default("normal"), // 'low', 'normal', 'high', 'urgent'
  assignedTo: varchar("assigned_to").references(() => users.id),
  responseMessage: text("response_message"),
  respondedAt: timestamp("responded_at"),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Radio Broadcasting Tables
export const radioStations = pgTable("radio_stations", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  streamUrl: text("stream_url").notNull(),
  status: varchar("status").notNull().default("offline"), // 'live', 'offline', 'scheduled'
  currentDJ: varchar("current_dj"),
  listeners: integer("listeners").default(0),
  maxListeners: integer("max_listeners").default(1000),
  genre: varchar("genre").notNull(),
  bitrate: varchar("bitrate").default("256kbps"),
  isModerated: boolean("is_moderated").default(true),
  moderationLevel: varchar("moderation_level").default("medium"), // 'low', 'medium', 'high'
  autoModerationEnabled: boolean("auto_moderation_enabled").default(true),
  settings: jsonb("settings").default("{}"),
  createdBy: varchar("created_by")
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  lastActive: timestamp("last_active").defaultNow(),
});

export const radioModerationActions = pgTable("radio_moderation_actions", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  stationId: varchar("station_id")
    .references(() => radioStations.id)
    .notNull(),
  action: varchar("action").notNull(), // 'mute', 'kick', 'ban', 'warning', 'content_flag'
  targetUser: varchar("target_user"),
  targetType: varchar("target_type").default("user"), // 'user', 'content', 'stream'
  reason: text("reason").notNull(),
  duration: varchar("duration"), // e.g., '10 minutes', 'permanent'
  moderatorId: varchar("moderator_id")
    .references(() => users.id)
    .notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const radioChat = pgTable("radio_chat", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  stationId: varchar("station_id")
    .references(() => radioStations.id)
    .notNull(),
  userId: varchar("user_id").references(() => users.id),
  username: varchar("username").notNull(),
  message: text("message").notNull(),
  isModerated: boolean("is_moderated").default(false),
  isFlagged: boolean("is_flagged").default(false),
  moderatedBy: varchar("moderated_by").references(() => users.id),
  moderationReason: text("moderation_reason"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Podcast Management Tables
export const podcasts = pgTable("podcasts", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  hostName: varchar("host_name").notNull(),
  hostId: varchar("host_id")
    .references(() => users.id)
    .notNull(),
  category: varchar("category").notNull(),
  status: varchar("status").notNull().default("draft"), // 'active', 'draft', 'archived'
  coverImageUrl: text("cover_image_url"),
  rssUrl: text("rss_url"),
  website: text("website"),
  language: varchar("language").default("English"),
  isExplicit: boolean("is_explicit").default(false),
  totalEpisodes: integer("total_episodes").default(0),
  totalListeners: integer("total_listeners").default(0),
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }).default(
    "0.00",
  ),
  settings: jsonb("settings").default("{}"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  lastEpisodeDate: timestamp("last_episode_date"),
});

export const podcastEpisodes = pgTable("podcast_episodes", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  podcastId: varchar("podcast_id")
    .references(() => podcasts.id)
    .notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  audioUrl: text("audio_url").notNull(),
  duration: varchar("duration"), // e.g., "58:32"
  fileSize: varchar("file_size"), // e.g., "84.2 MB"
  status: varchar("status").notNull().default("draft"), // 'published', 'draft', 'scheduled', 'processing'
  publishDate: timestamp("publish_date"),
  seasonNumber: integer("season_number"),
  episodeNumber: integer("episode_number").notNull(),
  isExplicit: boolean("is_explicit").default(false),
  transcript: text("transcript"),
  chapters: jsonb("chapters"), // array of {time, title}
  listens: integer("listens").default(0),
  downloads: integer("downloads").default(0),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
  tags: jsonb("tags").default("[]"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert Schemas for authentication tables
export const insertEmailTemplateSchema = createInsertSchema(
  emailTemplates,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEmailLogSchema = createInsertSchema(emailLogs).omit({
  id: true,
  createdAt: true,
});

export const insertSocialLoginSchema = createInsertSchema(socialLogins).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserVerificationSchema = createInsertSchema(
  userVerifications,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserSessionSchema = createInsertSchema(userSessions).omit({
  id: true,
  createdAt: true,
});

export const insertUserActivitySchema = createInsertSchema(userActivity).omit({
  id: true,
  createdAt: true,
});

export const insertContactMessageSchema = createInsertSchema(
  contactMessages,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Type definitions for authentication tables
export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type InsertEmailTemplate = z.infer<typeof insertEmailTemplateSchema>;
export type EmailLog = typeof emailLogs.$inferSelect;
export type InsertEmailLog = z.infer<typeof insertEmailLogSchema>;
export type SocialLogin = typeof socialLogins.$inferSelect;
export type InsertSocialLogin = z.infer<typeof insertSocialLoginSchema>;
export type UserVerification = typeof userVerifications.$inferSelect;
export type InsertUserVerification = z.infer<
  typeof insertUserVerificationSchema
>;
export type UserSession = typeof userSessions.$inferSelect;
export type InsertUserSession = z.infer<typeof insertUserSessionSchema>;
export type UserActivity = typeof userActivity.$inferSelect;
export type InsertUserActivity = z.infer<typeof insertUserActivitySchema>;
export type ContactMessage = typeof contactMessages.$inferSelect;
export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;

// Radio Broadcasting Types
export type RadioStation = typeof radioStations.$inferSelect;
export type InsertRadioStation = typeof radioStations.$inferInsert;
export type RadioModerationAction = typeof radioModerationActions.$inferSelect;
export type InsertRadioModerationAction =
  typeof radioModerationActions.$inferInsert;
export type RadioChat = typeof radioChat.$inferSelect;
export type InsertRadioChat = typeof radioChat.$inferInsert;

// Podcast Types
export type Podcast = typeof podcasts.$inferSelect;
export type InsertPodcast = typeof podcasts.$inferInsert;
export type PodcastEpisode = typeof podcastEpisodes.$inferSelect;
export type InsertPodcastEpisode = typeof podcastEpisodes.$inferInsert;

// Device tracking and security tables for enhanced authentication
export const trustedDevices = pgTable("trusted_devices", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  deviceFingerprint: text("device_fingerprint").notNull().unique(),
  deviceName: varchar("device_name"),
  browser: varchar("browser"),
  os: varchar("os"),
  ipAddress: varchar("ip_address"),
  location: jsonb("location"), // city, country, coordinates
  isTrusted: boolean("is_trusted").default(false),
  lastUsedAt: timestamp("last_used_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const loginSessions = pgTable("login_sessions", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  sessionToken: varchar("session_token").notNull().unique(),
  deviceFingerprint: text("device_fingerprint"),
  ipAddress: varchar("ip_address"),
  location: jsonb("location"),
  userAgent: text("user_agent"),
  authMethod: varchar("auth_method"), // 'password', 'oauth_google', 'webauthn', 'totp', etc.
  requiresVerification: boolean("requires_verification").default(false),
  verifiedAt: timestamp("verified_at"),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const oauthStates = pgTable("oauth_states", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  state: varchar("state").notNull().unique(),
  provider: varchar("provider").notNull(),
  redirectUrl: varchar("redirect_url"),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const webauthnCredentials = pgTable("webauthn_credentials", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  credentialId: text("credential_id").notNull().unique(),
  credentialPublicKey: text("credential_public_key").notNull(),
  counter: integer("counter").notNull().default(0),
  deviceName: varchar("device_name"),
  transports: jsonb("transports").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const emailVerificationTokens = pgTable("email_verification_tokens", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: varchar("token").notNull().unique(),
  email: varchar("email").notNull(),
  purpose: varchar("purpose").notNull(), // 'email_verification', 'device_verification', 'password_reset'
  deviceFingerprint: text("device_fingerprint"),
  ipAddress: varchar("ip_address"),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const securityAuditLog = pgTable("security_audit_log", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  event: varchar("event").notNull(), // 'login', 'logout', 'device_added', 'suspicious_login', etc.
  details: jsonb("details"),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  deviceFingerprint: text("device_fingerprint"),
  location: jsonb("location"),
  riskScore: integer("risk_score").default(0), // 0-100
  success: boolean("success").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Enhanced authentication types
export type TrustedDevice = typeof trustedDevices.$inferSelect;
export type InsertTrustedDevice = typeof trustedDevices.$inferInsert;
export type LoginSession = typeof loginSessions.$inferSelect;
export type InsertLoginSession = typeof loginSessions.$inferInsert;
export type OAuthState = typeof oauthStates.$inferSelect;
export type InsertOAuthState = typeof oauthStates.$inferInsert;
export type WebAuthnCredential = typeof webauthnCredentials.$inferSelect;
export type InsertWebAuthnCredential = typeof webauthnCredentials.$inferInsert;
export type EmailVerificationToken =
  typeof emailVerificationTokens.$inferSelect;
export type InsertEmailVerificationToken =
  typeof emailVerificationTokens.$inferInsert;
export type SecurityAuditLogEntry = typeof securityAuditLog.$inferSelect;
export type InsertSecurityAuditLogEntry = typeof securityAuditLog.$inferInsert;

// Chat system tables
export const chatRooms = pgTable("chat_rooms", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  createdBy: varchar("created_by")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  isPrivate: boolean("is_private").default(false),
  settings: jsonb("settings").$type<{
    maxParticipants?: number;
    allowFileUploads?: boolean;
    moderationLevel?: string;
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  roomId: varchar("room_id")
    .notNull()
    .references(() => chatRooms.id, { onDelete: "cascade" }),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  messageType: varchar("message_type").default("text"), // text, image, file, system
  metadata: jsonb("metadata"),
  isEdited: boolean("is_edited").default(false),
  isDeleted: boolean("is_deleted").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const chatParticipants = pgTable("chat_participants", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  roomId: varchar("room_id")
    .notNull()
    .references(() => chatRooms.id, { onDelete: "cascade" }),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  role: varchar("role").default("member"), // admin, moderator, member
  joinedAt: timestamp("joined_at").defaultNow(),
  leftAt: timestamp("left_at"),
  lastReadAt: timestamp("last_read_at"),
});

// 2257 Compliance and Verification System
export const form2257Records = pgTable("form_2257_records", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  // Basic Information
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  dateOfBirth: date("date_of_birth").notNull(),
  placeOfBirth: varchar("place_of_birth").notNull(),

  // Primary ID Documentation
  primaryIdType: varchar("primary_id_type").notNull(), // driver_license, passport, state_id
  primaryIdNumber: varchar("primary_id_number").notNull(),
  primaryIdIssuer: varchar("primary_id_issuer").notNull(),
  primaryIdIssueDate: date("primary_id_issue_date").notNull(),
  primaryIdExpirationDate: date("primary_id_expiration_date"),
  primaryIdImageFront: varchar("primary_id_image_front"), // Object storage path
  primaryIdImageBack: varchar("primary_id_image_back"), // Object storage path

  // Secondary ID Documentation (if required)
  secondaryIdType: varchar("secondary_id_type"),
  secondaryIdNumber: varchar("secondary_id_number"),
  secondaryIdIssuer: varchar("secondary_id_issuer"),
  secondaryIdIssueDate: date("secondary_id_issue_date"),
  secondaryIdExpirationDate: date("secondary_id_expiration_date"),
  secondaryIdImageFront: varchar("secondary_id_image_front"),
  secondaryIdImageBack: varchar("secondary_id_image_back"),

  // Performance Information
  performerNames: jsonb("performer_names").$type<string[]>(), // Stage names, aliases
  performanceDate: date("performance_date").notNull(),
  performanceDescription: text("performance_description"),

  // Legal Compliance
  ageVerified: boolean("age_verified").default(false),
  consentProvided: boolean("consent_provided").default(false),
  legalGuardianConsent: boolean("legal_guardian_consent").default(false),

  // Verification Status
  verificationStatus: varchar("verification_status").default("pending"), // pending, approved, rejected, expired
  verifiedBy: varchar("verified_by").references(() => users.id),
  verifiedAt: timestamp("verified_at"),
  rejectionReason: text("rejection_reason"),

  // Compliance Officer Information
  custodianName: varchar("custodian_name").notNull(),
  custodianTitle: varchar("custodian_title").notNull(),
  custodianAddress: text("custodian_address").notNull(),

  // Record Keeping
  recordLocation: varchar("record_location").notNull(),
  retentionDate: date("retention_date").notNull(),

  // Digital Signatures and Timestamps
  performerSignature: varchar("performer_signature"), // Digital signature path
  custodianSignature: varchar("custodian_signature"),
  witnessSignature: varchar("witness_signature"),

  // Audit Trail
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  deviceFingerprint: text("device_fingerprint"),
  geoLocation: jsonb("geo_location"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const form2257Amendments = pgTable("form_2257_amendments", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  recordId: varchar("record_id")
    .notNull()
    .references(() => form2257Records.id, { onDelete: "cascade" }),
  amendmentType: varchar("amendment_type").notNull(), // correction, update, addition
  previousValue: jsonb("previous_value"),
  newValue: jsonb("new_value"),
  reason: text("reason").notNull(),
  amendedBy: varchar("amended_by")
    .notNull()
    .references(() => users.id),
  amendmentDate: timestamp("amendment_date").defaultNow(),
  custodianApproval: boolean("custodian_approval").default(false),
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
});

export const complianceChecklist = pgTable("compliance_checklist", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  recordId: varchar("record_id")
    .notNull()
    .references(() => form2257Records.id, { onDelete: "cascade" }),

  // Required Document Checks
  primaryIdPresent: boolean("primary_id_present").default(false),
  primaryIdValid: boolean("primary_id_valid").default(false),
  primaryIdPhotoMatch: boolean("primary_id_photo_match").default(false),

  secondaryIdPresent: boolean("secondary_id_present").default(false),
  secondaryIdValid: boolean("secondary_id_valid").default(false),

  // Age Verification Checks
  ageCalculationCorrect: boolean("age_calculation_correct").default(false),
  minimumAgeVerified: boolean("minimum_age_verified").default(false),

  // Performance Documentation
  performanceDescriptionComplete: boolean(
    "performance_description_complete",
  ).default(false),
  performerNamesComplete: boolean("performer_names_complete").default(false),
  performanceDateValid: boolean("performance_date_valid").default(false),

  // Legal Requirements
  consentDocumented: boolean("consent_documented").default(false),
  custodianInfoComplete: boolean("custodian_info_complete").default(false),
  recordLocationDocumented: boolean("record_location_documented").default(
    false,
  ),

  // Digital Compliance
  digitalSignaturesPresent: boolean("digital_signatures_present").default(
    false,
  ),
  auditTrailComplete: boolean("audit_trail_complete").default(false),
  retentionPolicyCompliant: boolean("retention_policy_compliant").default(
    false,
  ),

  // Overall Compliance
  complianceScore: integer("compliance_score").default(0), // 0-100
  isCompliant: boolean("is_compliant").default(false),

  checkedBy: varchar("checked_by")
    .notNull()
    .references(() => users.id),
  checkedAt: timestamp("checked_at").defaultNow(),
  notes: text("notes"),
});

// Chat types
export type ChatRoom = typeof chatRooms.$inferSelect;
export type InsertChatRoom = typeof chatRooms.$inferInsert;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;
export type ChatParticipant = typeof chatParticipants.$inferSelect;
export type InsertChatParticipant = typeof chatParticipants.$inferInsert;

// Chat schemas (now that tables are defined)
export const insertChatRoomSchema = createInsertSchema(chatRooms).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChatParticipantSchema = createInsertSchema(
  chatParticipants,
).omit({
  id: true,
  joinedAt: true,
});

// 2257 Compliance schemas
export const insertForm2257RecordSchema = createInsertSchema(
  form2257Records,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertForm2257AmendmentSchema = createInsertSchema(
  form2257Amendments,
).omit({
  id: true,
  amendmentDate: true,
});

export const insertComplianceChecklistSchema = createInsertSchema(
  complianceChecklist,
).omit({
  id: true,
  checkedAt: true,
});

// ===== ENTERPRISE MULTI-TENANT EXTENSIONS =====

// Multi-Tenant Organizations
export const tenants = pgTable("tenants", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  slug: varchar("slug").notNull().unique(), // e.g., 'boyfanz', 'fanzcommerce'
  name: varchar("name").notNull(), // e.g., 'BoyFanz', 'FanzCommerce'
  ssoDomain: varchar("sso_domain"), // e.g., 'boyfanz.myfanz.network'
  status: varchar("status").notNull().default("active"), // 'active', 'suspended', 'archived'
  brandingConfig: jsonb("branding_config").default("{}"), // logos, colors, etc.
  billingConfig: jsonb("billing_config").default("{}"),
  maxUsers: integer("max_users").default(1000),
  subscriptionTier: varchar("subscription_tier").default("enterprise"), // 'basic', 'pro', 'enterprise'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User-Tenant Relationships
export const memberships = pgTable("memberships", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .references(() => users.id)
    .notNull(),
  tenantId: varchar("tenant_id")
    .references(() => tenants.id)
    .notNull(),
  role: varchar("role").notNull().default("member"), // 'owner', 'admin', 'moderator', 'member'
  permissions: jsonb("permissions").default("[]"), // array of permission strings
  status: varchar("status").notNull().default("active"), // 'active', 'suspended', 'revoked'
  invitedBy: varchar("invited_by").references(() => users.id),
  joinedAt: timestamp("joined_at").defaultNow(),
  lastActiveAt: timestamp("last_active_at").defaultNow(),
});

// Enhanced Audit Logs for Enterprise
export const auditLogs = pgTable("audit_logs", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  actorId: varchar("actor_id")
    .references(() => users.id)
    .notNull(),
  tenantId: varchar("tenant_id").references(() => tenants.id), // null for global actions
  action: varchar("action").notNull(), // 'create', 'update', 'delete', 'login', 'logout', etc.
  targetType: varchar("target_type").notNull(), // 'user', 'tenant', 'content', 'payment', etc.
  targetId: varchar("target_id").notNull(),
  diffJson: jsonb("diff_json"), // before/after changes
  contextJson: jsonb("context_json"), // IP, user agent, etc.
  severity: varchar("severity").notNull().default("info"), // 'info', 'warn', 'error', 'critical'
  createdAt: timestamp("created_at").defaultNow(),
});

// KYC Verification System
export const kycVerifications = pgTable("kyc_verifications", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .references(() => users.id)
    .notNull(),
  provider: varchar("provider").notNull(), // 'verifymy', 'onfido', 'jumio'
  status: varchar("status").notNull().default("pending"), // 'pending', 'verified', 'failed', 'expired'
  externalId: varchar("external_id"), // provider's verification ID
  dataJson: jsonb("data_json"), // verification results from provider
  documentsJson: jsonb("documents_json"), // uploaded document references
  webhookEvents: jsonb("webhook_events").default("[]"), // array of webhook events
  verifiedAt: timestamp("verified_at"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payout Management System
export const payoutRequests = pgTable("payout_requests", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .references(() => users.id)
    .notNull(),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  amountCents: integer("amount_cents").notNull(), // amount in cents
  currency: varchar("currency").notNull().default("USD"),
  status: varchar("status").notNull().default("pending"), // 'pending', 'approved', 'processing', 'completed', 'failed', 'cancelled'
  provider: varchar("provider").default("stripe"), // 'stripe', 'paypal', 'wise'
  providerRef: varchar("provider_ref"), // external payout ID
  webhookEvents: jsonb("webhook_events").default("[]"),
  bankDetails: jsonb("bank_details"), // encrypted bank account info
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  processedAt: timestamp("processed_at"),
  failureReason: text("failure_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Ads Management - Creative Content
export const adCreatives = pgTable("ad_creatives", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  advertiserId: varchar("advertiser_id").notNull(), // external advertiser ID
  campaignId: varchar("campaign_id"), // external campaign ID
  type: varchar("type").notNull(), // 'banner', 'video', 'native', 'popup'
  title: varchar("title"),
  description: text("description"),
  imageUrl: text("image_url"),
  videoUrl: text("video_url"),
  clickUrl: text("click_url").notNull(),
  metaJson: jsonb("meta_json").default("{}"), // dimensions, format, etc.
  targetingJson: jsonb("targeting_json").default("{}"), // audience targeting rules
  status: varchar("status").notNull().default("pending"), // 'pending', 'approved', 'rejected', 'paused', 'active'
  moderatedBy: varchar("moderated_by").references(() => users.id),
  moderationNotes: text("moderation_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Ads Management - Placement Inventory
export const adPlacements = pgTable("ad_placements", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  platform: varchar("platform").notNull(), // 'fanzroulette', 'fanztube', etc.
  slot: varchar("slot").notNull(), // 'header-banner', 'sidebar', 'pre-roll'
  dimensions: varchar("dimensions"), // '728x90', '300x250', etc.
  type: varchar("type").notNull(), // 'banner', 'video', 'native'
  status: varchar("status").notNull().default("active"), // 'active', 'paused', 'sold-out'
  capsJson: jsonb("caps_json").default("{}"), // daily caps, frequency caps
  rateCardJson: jsonb("rate_card_json").default("{}"), // pricing tiers, minimum bids
  currentCreativeId: varchar("current_creative_id").references(() => adCreatives.id),
  impressions: integer("impressions").default(0),
  clicks: integer("clicks").default(0),
  revenue: integer("revenue").default(0), // in cents
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Security Events for SIEM Integration
export const securityEvents = pgTable("security_events", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  eventType: varchar("event_type").notNull(), // 'failed_login', 'suspicious_activity', 'policy_violation'
  severity: varchar("severity").notNull(), // 'low', 'medium', 'high', 'critical'
  userId: varchar("user_id").references(() => users.id),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  detailsJson: jsonb("details_json").default("{}"), // event-specific data
  resolved: boolean("resolved").default(false),
  resolvedBy: varchar("resolved_by").references(() => users.id),
  resolvedAt: timestamp("resolved_at"),
  alertSent: boolean("alert_sent").default(false),
  siemExported: boolean("siem_exported").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// OPA Policy Engine
export const opaPolicies = pgTable("opa_policies", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: varchar("name").notNull().unique(),
  version: varchar("version").notNull(),
  regoS3Key: varchar("rego_s3_key").notNull(), // S3 path to .rego file
  active: boolean("active").notNull().default(false),
  tenantId: varchar("tenant_id").references(() => tenants.id), // null for global policies
  category: varchar("category").default("content"), // 'content', 'user', 'financial', 'security'
  priority: integer("priority").default(100), // higher number = higher priority
  notes: text("notes"),
  createdBy: varchar("created_by")
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Feature Flags & Kill Switches
export const globalFlags = pgTable("global_flags", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  flagKey: varchar("flag_key").notNull(), // 'uploads_enabled', 'payouts_enabled'
  valueJson: jsonb("value_json").notNull(), // flag value (boolean, string, object)
  tenantId: varchar("tenant_id").references(() => tenants.id), // null for global flags
  platform: varchar("platform"), // null for all platforms
  rolloutPercent: integer("rollout_percent").default(0), // 0-100
  conditions: jsonb("conditions").default("[]"), // array of targeting conditions
  notes: text("notes"),
  isKillSwitch: boolean("is_kill_switch").default(false), // emergency kill switch
  createdBy: varchar("created_by")
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Webhook Management
export const webhooks = pgTable("webhooks", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  endpoint: text("endpoint").notNull(),
  events: jsonb("events").notNull(), // array of event types
  secret: varchar("secret").notNull(), // webhook signature secret
  active: boolean("active").default(true),
  retryPolicy: jsonb("retry_policy").default("{\"maxRetries\": 3, \"backoff\": \"exponential\"}"),
  lastAttempt: timestamp("last_attempt"),
  lastSuccess: timestamp("last_success"),
  failureCount: integer("failure_count").default(0),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  createdBy: varchar("created_by")
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// API Key Management
export const apiKeys = pgTable("api_keys", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  keyId: varchar("key_id").notNull().unique(), // public key identifier
  hashedKey: varchar("hashed_key").notNull(), // bcrypt hashed secret
  name: varchar("name").notNull(),
  permissions: jsonb("permissions").default("[]"), // array of permission strings
  tenantId: varchar("tenant_id").references(() => tenants.id),
  userId: varchar("user_id")
    .references(() => users.id)
    .notNull(),
  lastUsed: timestamp("last_used"),
  usageCount: integer("usage_count").default(0),
  rateLimit: integer("rate_limit").default(1000), // requests per hour
  active: boolean("active").default(true),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ===== ENTERPRISE SCHEMAS & TYPES =====

// Tenant schemas
export const insertTenantSchema = createInsertSchema(tenants).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMembershipSchema = createInsertSchema(memberships).omit({
  id: true,
  joinedAt: true,
  lastActiveAt: true,
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  createdAt: true,
});

export const insertKycVerificationSchema = createInsertSchema(kycVerifications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPayoutRequestSchema = createInsertSchema(payoutRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAdCreativeSchema = createInsertSchema(adCreatives).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAdPlacementSchema = createInsertSchema(adPlacements).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSecurityEventSchema = createInsertSchema(securityEvents).omit({
  id: true,
  createdAt: true,
});

export const insertOpaPolicySchema = createInsertSchema(opaPolicies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGlobalFlagSchema = createInsertSchema(globalFlags).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWebhookSchema = createInsertSchema(webhooks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertApiKeySchema = createInsertSchema(apiKeys).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Enterprise types
export type Tenant = typeof tenants.$inferSelect;
export type InsertTenant = typeof tenants.$inferInsert;
export type Membership = typeof memberships.$inferSelect;
export type InsertMembership = typeof memberships.$inferInsert;
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;
export type KycVerification = typeof kycVerifications.$inferSelect;
export type InsertKycVerification = typeof kycVerifications.$inferInsert;
export type PayoutRequest = typeof payoutRequests.$inferSelect;
export type InsertPayoutRequest = typeof payoutRequests.$inferInsert;
export type AdCreative = typeof adCreatives.$inferSelect;
export type InsertAdCreative = typeof adCreatives.$inferInsert;
export type AdPlacement = typeof adPlacements.$inferSelect;
export type InsertAdPlacement = typeof adPlacements.$inferInsert;
export type SecurityEvent = typeof securityEvents.$inferSelect;
export type InsertSecurityEvent = typeof securityEvents.$inferInsert;
export type OpaPolicy = typeof opaPolicies.$inferSelect;
export type InsertOpaPolicy = typeof opaPolicies.$inferInsert;
export type GlobalFlag = typeof globalFlags.$inferSelect;
export type InsertGlobalFlag = typeof globalFlags.$inferInsert;
export type Webhook = typeof webhooks.$inferSelect;
export type InsertWebhook = typeof webhooks.$inferInsert;
export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = typeof apiKeys.$inferInsert;

// ===== ADVANCED AI/ML & SECURITY FEATURES =====

// 🧠 BEHAVIORAL BIOMETRICS ENGINE
export const biometricProfiles = pgTable("biometric_profiles", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .references(() => users.id)
    .notNull(),
  keystrokePattern: jsonb("keystroke_pattern").$type<number[]>(),
  mouseMovementSignature: text("mouse_movement_signature"),
  scrollBehavior: jsonb("scroll_behavior"),
  sessionFingerprint: varchar("session_fingerprint"),
  deviceDNA: jsonb("device_dna"),
  biometricHash: varchar("biometric_hash"),
  confidence: decimal("confidence", { precision: 3, scale: 2 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const behavioralSessions = pgTable("behavioral_sessions", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .references(() => users.id)
    .notNull(),
  sessionId: varchar("session_id").notNull(),
  biometricScore: decimal("biometric_score", { precision: 3, scale: 2 }),
  anomalyFlags: jsonb("anomaly_flags").$type<string[]>(),
  riskAssessment: varchar("risk_assessment").default("low"), // low, medium, high, critical
  deviceFingerprint: varchar("device_fingerprint"),
  ipAddress: varchar("ip_address"),
  geolocation: jsonb("geolocation"),
  userAgent: text("user_agent"),
  startedAt: timestamp("started_at").defaultNow(),
  endedAt: timestamp("ended_at"),
});

// 🔍 ADVANCED DEEP FAKE DETECTION
export const deepFakeAnalysis = pgTable("deepfake_analysis", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  contentId: varchar("content_id")
    .references(() => contentItems.id)
    .notNull(),
  isDeepFake: boolean("is_deepfake").notNull(),
  confidence: decimal("confidence", { precision: 4, scale: 3 }),
  manipulationAreas: jsonb("manipulation_areas"),
  detectedTechniques: jsonb("detected_techniques").$type<string[]>(),
  modelVersion: varchar("model_version"),
  processingTime: integer("processing_time"), // milliseconds
  faceSwapDetected: boolean("face_swap_detected").default(false),
  voiceSynthDetected: boolean("voice_synth_detected").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// 🛡️ ZERO TRUST ARCHITECTURE
export const trustScores = pgTable("trust_scores", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .references(() => users.id)
    .notNull(),
  deviceId: varchar("device_id").notNull(),
  trustLevel: decimal("trust_level", { precision: 4, scale: 3 }),
  riskFactors: jsonb("risk_factors").$type<string[]>(),
  lastVerification: timestamp("last_verification"),
  continuousMonitoring: boolean("continuous_monitoring").default(true),
  microSegmentId: varchar("micro_segment_id"),
  policyViolations: integer("policy_violations").default(0),
  adaptiveControls: jsonb("adaptive_controls"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const zeroTrustPolicies = pgTable("zero_trust_policies", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  conditions: jsonb("conditions").notNull(),
  actions: jsonb("actions").notNull(),
  priority: integer("priority").default(0),
  isActive: boolean("is_active").default(true),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// 📊 GRAPH DATABASE INTELLIGENCE
export const userRelationships = pgTable("user_relationships", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  sourceUserId: varchar("source_user_id")
    .references(() => users.id)
    .notNull(),
  targetUserId: varchar("target_user_id")
    .references(() => users.id)
    .notNull(),
  relationshipType: varchar("relationship_type").notNull(), // follower, friend, blocked, suspicious
  strength: decimal("strength", { precision: 3, scale: 2 }),
  interactionCount: integer("interaction_count").default(0),
  riskFlags: jsonb("risk_flags").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow(),
  lastInteraction: timestamp("last_interaction"),
});

export const networkAnalysis = pgTable("network_analysis", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  analysisType: varchar("analysis_type").notNull(), // coordinated_behavior, influence_campaign, viral_prediction
  networkId: varchar("network_id"),
  participants: jsonb("participants").$type<string[]>(),
  centralityScores: jsonb("centrality_scores"),
  communityDetection: jsonb("community_detection"),
  anomalyScore: decimal("anomaly_score", { precision: 4, scale: 3 }),
  findings: jsonb("findings"),
  actionRequired: boolean("action_required").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// 🎤 VOICE-CONTROLLED INTERFACE
export const voiceCommands = pgTable("voice_commands", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .references(() => users.id)
    .notNull(),
  command: text("command").notNull(),
  intent: varchar("intent"),
  entities: jsonb("entities"),
  confidence: decimal("confidence", { precision: 3, scale: 2 }),
  executed: boolean("executed").default(false),
  result: jsonb("result"),
  processingTime: integer("processing_time"),
  createdAt: timestamp("created_at").defaultNow(),
});

// 🔗 ADVANCED WEBHOOK INTELLIGENCE
export const webhookAnalytics = pgTable("webhook_analytics", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  webhookId: varchar("webhook_id")
    .references(() => webhooks.id)
    .notNull(),
  deliveryAttempts: integer("delivery_attempts").default(0),
  successfulDeliveries: integer("successful_deliveries").default(0),
  averageResponseTime: integer("average_response_time"),
  circuitBreakerState: varchar("circuit_breaker_state").default("closed"), // closed, open, half-open
  adaptiveRateLimit: integer("adaptive_rate_limit").default(100),
  lastFailure: timestamp("last_failure"),
  errorPatterns: jsonb("error_patterns"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// 🔐 QUANTUM-RESISTANT CRYPTOGRAPHY
export const quantumSecrets = pgTable("quantum_secrets", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  keyId: varchar("key_id").notNull().unique(),
  algorithm: varchar("algorithm").notNull(), // kyber, dilithium, sphincs
  publicKey: text("public_key"),
  encryptedPrivateKey: text("encrypted_private_key"),
  keyUsage: varchar("key_usage").notNull(), // encryption, signing, key_exchange
  rotationSchedule: timestamp("rotation_schedule"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
});

// 🌐 DIGITAL TWIN PLATFORM
export const digitalTwins = pgTable("digital_twins", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  entityType: varchar("entity_type").notNull(), // user, content, platform, system
  entityId: varchar("entity_id").notNull(),
  twinData: jsonb("twin_data").notNull(),
  behaviorModel: jsonb("behavior_model"),
  predictionAccuracy: decimal("prediction_accuracy", { precision: 4, scale: 3 }),
  lastSimulation: timestamp("last_simulation"),
  simulationResults: jsonb("simulation_results"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// 🔎 ADVANCED THREAT HUNTING
export const threatHunting = pgTable("threat_hunting", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  huntName: varchar("hunt_name").notNull(),
  hypothesis: text("hypothesis"),
  query: text("query").notNull(),
  dataSource: varchar("data_source").notNull(),
  findings: jsonb("findings"),
  threatLevel: varchar("threat_level").default("low"), // low, medium, high, critical
  iocFound: boolean("ioc_found").default(false),
  actionTaken: text("action_taken"),
  hunterId: varchar("hunter_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

// 🧪 ML INFERENCE PIPELINE
export const mlInference = pgTable("ml_inference", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  modelId: varchar("model_id").notNull(),
  modelVersion: varchar("model_version").notNull(),
  inputData: jsonb("input_data").notNull(),
  prediction: jsonb("prediction"),
  confidence: decimal("confidence", { precision: 4, scale: 3 }),
  latency: integer("latency"), // microseconds
  batchId: varchar("batch_id"),
  nodeId: varchar("node_id"),
  resourceUsage: jsonb("resource_usage"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Advanced Types
export type BiometricProfile = typeof biometricProfiles.$inferSelect;
export type InsertBiometricProfile = typeof biometricProfiles.$inferInsert;
export type BehavioralSession = typeof behavioralSessions.$inferSelect;
export type InsertBehavioralSession = typeof behavioralSessions.$inferInsert;
export type DeepFakeAnalysis = typeof deepFakeAnalysis.$inferSelect;
export type InsertDeepFakeAnalysis = typeof deepFakeAnalysis.$inferInsert;
export type TrustScore = typeof trustScores.$inferSelect;
export type InsertTrustScore = typeof trustScores.$inferInsert;
export type ZeroTrustPolicy = typeof zeroTrustPolicies.$inferSelect;
export type InsertZeroTrustPolicy = typeof zeroTrustPolicies.$inferInsert;
export type UserRelationship = typeof userRelationships.$inferSelect;
export type InsertUserRelationship = typeof userRelationships.$inferInsert;
export type NetworkAnalysis = typeof networkAnalysis.$inferSelect;
export type InsertNetworkAnalysis = typeof networkAnalysis.$inferInsert;
export type VoiceCommand = typeof voiceCommands.$inferSelect;
export type InsertVoiceCommand = typeof voiceCommands.$inferInsert;
export type WebhookAnalytics = typeof webhookAnalytics.$inferSelect;
export type InsertWebhookAnalytics = typeof webhookAnalytics.$inferInsert;
export type QuantumSecret = typeof quantumSecrets.$inferSelect;
export type InsertQuantumSecret = typeof quantumSecrets.$inferInsert;
export type DigitalTwin = typeof digitalTwins.$inferSelect;
export type InsertDigitalTwin = typeof digitalTwins.$inferInsert;
export type ThreatHunting = typeof threatHunting.$inferSelect;
export type InsertThreatHunting = typeof threatHunting.$inferInsert;
export type MlInference = typeof mlInference.$inferSelect;
export type InsertMlInference = typeof mlInference.$inferInsert;

// ===== SEO/AEO/GTM SETTINGS =====

export const seoSettings = pgTable("seo_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pageUrl: text("page_url").unique().notNull(),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  metaKeywords: text("meta_keywords").array(),
  ogTitle: text("og_title"),
  ogDescription: text("og_description"),
  ogImage: text("og_image"),
  ogType: text("og_type").default("website"),
  twitterCard: text("twitter_card").default("summary_large_image"),
  twitterTitle: text("twitter_title"),
  twitterDescription: text("twitter_description"),
  twitterImage: text("twitter_image"),
  canonicalUrl: text("canonical_url"),
  robotsMeta: text("robots_meta").default("index, follow"),
  structuredData: jsonb("structured_data"),
  customHeadTags: text("custom_head_tags"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const aeoSettings = pgTable("aeo_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pageUrl: text("page_url").unique().notNull(),
  featuredSnippetText: text("featured_snippet_text"),
  faqItems: jsonb("faq_items").default("[]"),
  howToSteps: jsonb("how_to_steps").default("[]"),
  keyFacts: jsonb("key_facts").default("[]"),
  entitySchema: jsonb("entity_schema"),
  voiceSearchPhrases: text("voice_search_phrases").array(),
  questionAnswers: jsonb("question_answers").default("[]"),
  localBusinessSchema: jsonb("local_business_schema"),
  reviewSchema: jsonb("review_schema"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const gtmSettings = pgTable("gtm_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  containerId: text("container_id").unique().notNull(),
  environment: text("environment").default("production"),
  enabled: boolean("enabled").default(true),
  tags: jsonb("tags").default("[]"),
  triggers: jsonb("triggers").default("[]"),
  variables: jsonb("variables").default("[]"),
  customHtml: text("custom_html"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type SeoSettings = typeof seoSettings.$inferSelect;
export type InsertSeoSettings = typeof seoSettings.$inferInsert;
export type AeoSettings = typeof aeoSettings.$inferSelect;
export type InsertAeoSettings = typeof aeoSettings.$inferInsert;
export type GtmSettings = typeof gtmSettings.$inferSelect;
export type InsertGtmSettings = typeof gtmSettings.$inferInsert;

export const insertSeoSettingsSchema = createInsertSchema(seoSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertAeoSettingsSchema = createInsertSchema(aeoSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertGtmSettingsSchema = createInsertSchema(gtmSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// ===== ANALYTICS & TRACKING INTEGRATIONS =====

export const analyticsConfigurations = pgTable("analytics_configurations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  platformId: varchar("platform_id").notNull(), // e.g., 'boyfanz', 'girlfanz', 'fanzdash'

  // Google Analytics 4
  ga4MeasurementId: varchar("ga4_measurement_id"),
  ga4ApiSecret: text("ga4_api_secret"),
  ga4StreamId: varchar("ga4_stream_id"),
  ga4PropertyId: varchar("ga4_property_id"),
  ga4Configuration: jsonb("ga4_configuration").default("{}"),

  // Google Tag Manager
  gtmContainerId: varchar("gtm_container_id"),
  gtmEnvironment: varchar("gtm_environment").default("live"),
  gtmConfiguration: jsonb("gtm_configuration").default("{}"),

  // Social Media Pixels
  facebookPixelId: varchar("facebook_pixel_id"),
  tiktokPixelId: varchar("tiktok_pixel_id"),
  twitterPixelId: varchar("twitter_pixel_id"),
  redditPixelId: varchar("reddit_pixel_id"),
  instagramPixelId: varchar("instagram_pixel_id"),
  patreonClientId: varchar("patreon_client_id"),

  // Pixel Configuration
  pixelConfiguration: jsonb("pixel_configuration").default("{}"),
  customPixels: jsonb("custom_pixels").default("[]"),

  // Traffic Analysis
  trafficAnalysisEnabled: boolean("traffic_analysis_enabled").default(true),
  variableTracking: jsonb("variable_tracking").default("{}"),

  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const socialOAuthConnections = pgTable("social_oauth_connections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  platformId: varchar("platform_id").notNull(), // FANZ platform

  provider: varchar("provider").notNull(), // 'google', 'facebook', 'twitter', etc.
  providerId: varchar("provider_id").notNull(), // User ID from provider
  providerEmail: varchar("provider_email"),
  providerUsername: varchar("provider_username"),

  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  tokenExpiry: timestamp("token_expiry"),

  scopes: jsonb("scopes").default("[]"),
  profileData: jsonb("profile_data").default("{}"),

  isActive: boolean("is_active").default(true),
  lastUsed: timestamp("last_used"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const delegatedAccessPermissions = pgTable("delegated_access_permissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  grantorId: varchar("grantor_id").references(() => users.id).notNull(),
  granteeId: varchar("grantee_id").references(() => users.id).notNull(),
  platformId: varchar("platform_id").notNull(),

  accessType: varchar("access_type").notNull(), // 'admin', 'moderator', 'creator_delegate'
  permissions: jsonb("permissions").notNull(), // Detailed permission rules

  // Resource Access
  canAccessContent: boolean("can_access_content").default(false),
  canModerateContent: boolean("can_moderate_content").default(false),
  canManageUsers: boolean("can_manage_users").default(false),
  canViewAnalytics: boolean("can_view_analytics").default(false),
  canManageSettings: boolean("can_manage_settings").default(false),
  canManagePayments: boolean("can_manage_payments").default(false),

  // Custom Rules
  customRules: jsonb("custom_rules").default("{}"),
  ipWhitelist: jsonb("ip_whitelist").default("[]"),
  timeRestrictions: jsonb("time_restrictions").default("{}"),

  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const workflowDefinitions = pgTable("workflow_definitions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  platformId: varchar("platform_id").notNull(),

  name: varchar("name").notNull(),
  description: text("description"),
  category: varchar("category").notNull(), // 'content', 'moderation', 'analytics', 'custom'

  // Workflow Configuration
  triggers: jsonb("triggers").notNull(), // What starts the workflow
  actions: jsonb("actions").notNull(), // What the workflow does
  conditions: jsonb("conditions").default("{}"), // When to execute

  // Visual Builder Data
  nodeData: jsonb("node_data").default("{}"), // Visual workflow nodes
  edgeData: jsonb("edge_data").default("{}"), // Connections between nodes

  // Execution
  executionOrder: jsonb("execution_order").default("[]"),
  errorHandling: jsonb("error_handling").default("{}"),

  // Scheduling
  schedule: jsonb("schedule"), // Cron expression or specific times
  timezone: varchar("timezone").default("UTC"),

  // Statistics
  executionCount: integer("execution_count").default(0),
  lastExecuted: timestamp("last_executed"),
  averageExecutionTime: integer("average_execution_time"), // milliseconds

  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const scheduledContent = pgTable("scheduled_content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  platformId: varchar("platform_id").notNull(),

  contentType: varchar("content_type").notNull(), // 'post', 'story', 'reel', 'live'
  contentData: jsonb("content_data").notNull(),

  // Scheduling
  scheduledFor: timestamp("scheduled_for").notNull(),
  timezone: varchar("timezone").default("UTC"),
  recurringPattern: jsonb("recurring_pattern"), // For repeated posts

  // External Calendar Integration
  externalCalendarId: varchar("external_calendar_id"),
  externalEventId: varchar("external_event_id"),
  calendarProvider: varchar("calendar_provider"), // 'google', 'apple', 'outlook'

  // Publishing Status
  status: varchar("status").notNull().default("pending"), // 'pending', 'published', 'failed', 'cancelled'
  publishedAt: timestamp("published_at"),
  failureReason: text("failure_reason"),

  // Notifications
  notifyBeforeMinutes: integer("notify_before_minutes").default(30),
  notificationsSent: boolean("notifications_sent").default(false),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const externalCalendarIntegrations = pgTable("external_calendar_integrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),

  provider: varchar("provider").notNull(), // 'google', 'apple', 'outlook', 'ical'
  providerAccountId: varchar("provider_account_id").notNull(),
  providerEmail: varchar("provider_email"),

  // OAuth Tokens
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  tokenExpiry: timestamp("token_expiry"),

  // Calendar Selection
  selectedCalendars: jsonb("selected_calendars").default("[]"),
  syncEnabled: boolean("sync_enabled").default(true),
  syncDirection: varchar("sync_direction").default("both"), // 'import', 'export', 'both'

  // Sync Status
  lastSyncAt: timestamp("last_sync_at"),
  nextSyncAt: timestamp("next_sync_at"),
  syncErrors: jsonb("sync_errors").default("[]"),

  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const profileUrlSpots = pgTable("profile_url_spots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  platformId: varchar("platform_id").notNull(),

  spotType: varchar("spot_type").notNull(), // 'social', 'website', 'portfolio', 'store', 'custom'
  spotName: varchar("spot_name").notNull(),
  spotUrl: text("spot_url").notNull(),
  spotIcon: varchar("spot_icon"), // Icon identifier or URL

  displayOrder: integer("display_order").default(0),
  isVisible: boolean("is_visible").default(true),
  isVerified: boolean("is_verified").default(false),

  clickCount: integer("click_count").default(0),
  lastClickedAt: timestamp("last_clicked_at"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const analyticsEvents = pgTable("analytics_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  platformId: varchar("platform_id").notNull(),
  userId: varchar("user_id").references(() => users.id),

  eventType: varchar("event_type").notNull(), // 'pageview', 'click', 'conversion', etc.
  eventName: varchar("event_name").notNull(),
  eventCategory: varchar("event_category"),

  // Event Data
  eventData: jsonb("event_data").default("{}"),
  eventValue: decimal("event_value", { precision: 10, scale: 2 }),

  // Session Info
  sessionId: varchar("session_id"),
  deviceType: varchar("device_type"),
  browser: varchar("browser"),
  os: varchar("os"),

  // Location
  country: varchar("country"),
  region: varchar("region"),
  city: varchar("city"),

  // Referral
  referrer: text("referrer"),
  utmSource: varchar("utm_source"),
  utmMedium: varchar("utm_medium"),
  utmCampaign: varchar("utm_campaign"),
  utmTerm: varchar("utm_term"),
  utmContent: varchar("utm_content"),

  // Tracking
  pageUrl: text("page_url"),
  pagePath: text("page_path"),
  pageTitle: text("page_title"),

  timestamp: timestamp("timestamp").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Type Exports
export type AnalyticsConfiguration = typeof analyticsConfigurations.$inferSelect;
export type InsertAnalyticsConfiguration = typeof analyticsConfigurations.$inferInsert;
export type SocialOAuthConnection = typeof socialOAuthConnections.$inferSelect;
export type InsertSocialOAuthConnection = typeof socialOAuthConnections.$inferInsert;
export type DelegatedAccessPermission = typeof delegatedAccessPermissions.$inferSelect;
export type InsertDelegatedAccessPermission = typeof delegatedAccessPermissions.$inferInsert;
export type WorkflowDefinition = typeof workflowDefinitions.$inferSelect;
export type InsertWorkflowDefinition = typeof workflowDefinitions.$inferInsert;
export type ScheduledContent = typeof scheduledContent.$inferSelect;
export type InsertScheduledContent = typeof scheduledContent.$inferInsert;
export type ExternalCalendarIntegration = typeof externalCalendarIntegrations.$inferSelect;
export type InsertExternalCalendarIntegration = typeof externalCalendarIntegrations.$inferInsert;
export type ProfileUrlSpot = typeof profileUrlSpots.$inferSelect;
export type InsertProfileUrlSpot = typeof profileUrlSpots.$inferInsert;
export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type InsertAnalyticsEvent = typeof analyticsEvents.$inferInsert;

// Insert Schemas
export const insertAnalyticsConfigurationSchema = createInsertSchema(analyticsConfigurations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertSocialOAuthConnectionSchema = createInsertSchema(socialOAuthConnections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastUsed: true,
});
export const insertDelegatedAccessPermissionSchema = createInsertSchema(delegatedAccessPermissions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertWorkflowDefinitionSchema = createInsertSchema(workflowDefinitions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  executionCount: true,
  lastExecuted: true,
  averageExecutionTime: true,
});
export const insertScheduledContentSchema = createInsertSchema(scheduledContent).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  publishedAt: true,
});
export const insertExternalCalendarIntegrationSchema = createInsertSchema(externalCalendarIntegrations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastSyncAt: true,
  nextSyncAt: true,
});
export const insertProfileUrlSpotSchema = createInsertSchema(profileUrlSpots).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  clickCount: true,
  lastClickedAt: true,
});
export const insertAnalyticsEventSchema = createInsertSchema(analyticsEvents).omit({
  id: true,
  createdAt: true,
  timestamp: true,
});

// ===== EXISTING 2257 COMPLIANCE TYPES =====

export type Form2257Record = typeof form2257Records.$inferSelect;
export type InsertForm2257Record = typeof form2257Records.$inferInsert;
export type Form2257Amendment = typeof form2257Amendments.$inferSelect;
export type InsertForm2257Amendment = typeof form2257Amendments.$inferInsert;
export type ComplianceChecklist = typeof complianceChecklist.$inferSelect;
export type InsertComplianceChecklist = typeof complianceChecklist.$inferInsert;

// ===== VERIFICATION SYSTEM (2257 COMPLIANCE) =====

// Re-export verification schemas from separate file
export * from "../server/db/schema/verifications";

// ===== ADD-ON MANAGEMENT SYSTEM =====

// Add-On Registry - Master list of all available add-ons
export const addOnRegistry = pgTable("addon_registry", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  addonKey: varchar("addon_key").unique().notNull(), // e.g., 'whatsapp_2fa', 'interactive_toys'
  name: varchar("name").notNull(), // Display name
  description: text("description"),
  category: varchar("category").notNull(), // 'authentication', 'payment', 'content', 'ai', 'social', etc.
  sourceProduct: varchar("source_product"), // 'xFans', 'xCams', 'xModel', etc.
  marketValue: decimal("market_value", { precision: 10, scale: 2 }), // If purchased separately

  // Implementation status
  implementationStatus: varchar("implementation_status").notNull().default("not_implemented"), // 'implemented', 'partial', 'not_implemented'
  version: varchar("version").default("1.0.0"),

  // Technical details
  requiredDependencies: jsonb("required_dependencies").$type<string[]>().default([]),
  apiEndpoints: jsonb("api_endpoints").$type<string[]>().default([]),
  databaseTables: jsonb("database_tables").$type<string[]>().default([]),
  frontendComponents: jsonb("frontend_components").$type<string[]>().default([]),

  // Business logic
  requiresSetup: boolean("requires_setup").default(false),
  setupInstructions: text("setup_instructions"),
  documentationUrl: text("documentation_url"),

  // Availability
  isAvailable: boolean("is_available").default(true),
  minimumPlatformVersion: varchar("minimum_platform_version"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Platform Add-On Configuration - Which add-ons are enabled for which platforms
export const platformAddOns = pgTable("platform_addons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  platformId: varchar("platform_id").notNull(), // 'boyfanz', 'girlfanz', etc.
  addonId: varchar("addon_id").references(() => addOnRegistry.id).notNull(),

  // Enable/Disable
  isEnabled: boolean("is_enabled").default(false),
  enabledAt: timestamp("enabled_at"),
  enabledBy: varchar("enabled_by").references(() => users.id),

  // Configuration
  config: jsonb("config").default("{}"), // Add-on specific configuration

  // Usage tracking
  firstUsedAt: timestamp("first_used_at"),
  lastUsedAt: timestamp("last_used_at"),
  usageCount: integer("usage_count").default(0),

  // Performance
  averageResponseTime: integer("average_response_time"), // in ms
  errorCount: integer("error_count").default(0),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Add-On Usage Analytics
export const addOnUsageAnalytics = pgTable("addon_usage_analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  platformId: varchar("platform_id").notNull(),
  addonId: varchar("addon_id").references(() => addOnRegistry.id).notNull(),

  // Time period
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  periodType: varchar("period_type").notNull(), // 'hourly', 'daily', 'weekly', 'monthly'

  // Usage metrics
  totalRequests: integer("total_requests").default(0),
  successfulRequests: integer("successful_requests").default(0),
  failedRequests: integer("failed_requests").default(0),
  averageResponseTime: integer("average_response_time"),
  peakResponseTime: integer("peak_response_time"),

  // User metrics
  uniqueUsers: integer("unique_users").default(0),
  newUsers: integer("new_users").default(0),
  activeUsers: integer("active_users").default(0),

  // Business metrics
  revenueGenerated: decimal("revenue_generated", { precision: 12, scale: 2 }),
  conversions: integer("conversions").default(0),

  createdAt: timestamp("created_at").defaultNow(),
});

// Add-On Dependencies - Track relationships between add-ons
export const addOnDependencies = pgTable("addon_dependencies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  addonId: varchar("addon_id").references(() => addOnRegistry.id).notNull(),
  dependsOnAddonId: varchar("depends_on_addon_id").references(() => addOnRegistry.id).notNull(),
  dependencyType: varchar("dependency_type").notNull(), // 'required', 'optional', 'conflicts_with'
  minimumVersion: varchar("minimum_version"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Feature Flags - Granular feature control
export const featureFlags = pgTable("feature_flags", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  flagKey: varchar("flag_key").unique().notNull(), // e.g., 'enable_wheel_of_fortune'
  flagName: varchar("flag_name").notNull(),
  description: text("description"),

  // Relationship to add-ons
  addonId: varchar("addon_id").references(() => addOnRegistry.id),

  // Flag configuration
  isEnabled: boolean("is_enabled").default(false),
  enabledPlatforms: jsonb("enabled_platforms").$type<string[]>().default([]), // Platform IDs
  disabledPlatforms: jsonb("disabled_platforms").$type<string[]>().default([]),

  // Rollout strategy
  rolloutPercentage: integer("rollout_percentage").default(0), // 0-100
  rolloutStrategy: varchar("rollout_strategy").default("all"), // 'all', 'percentage', 'whitelist'
  whitelistedUserIds: jsonb("whitelisted_user_ids").$type<string[]>().default([]),

  // Scheduling
  scheduledEnabledAt: timestamp("scheduled_enabled_at"),
  scheduledDisabledAt: timestamp("scheduled_disabled_at"),

  // Metadata
  createdBy: varchar("created_by").references(() => users.id),
  lastModifiedBy: varchar("last_modified_by").references(() => users.id),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Add-On Feedback/Reviews
export const addOnFeedback = pgTable("addon_feedback", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  addonId: varchar("addon_id").references(() => addOnRegistry.id).notNull(),
  platformId: varchar("platform_id").notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),

  rating: integer("rating"), // 1-5
  feedback: text("feedback"),
  feedbackType: varchar("feedback_type"), // 'bug', 'feature_request', 'improvement', 'praise'

  isResolved: boolean("is_resolved").default(false),
  resolvedBy: varchar("resolved_by").references(() => users.id),
  resolvedAt: timestamp("resolved_at"),
  resolution: text("resolution"),

  createdAt: timestamp("created_at").defaultNow(),
});

// Type exports for Add-On System
export type AddOnRegistry = typeof addOnRegistry.$inferSelect;
export type InsertAddOnRegistry = typeof addOnRegistry.$inferInsert;
export type PlatformAddOn = typeof platformAddOns.$inferSelect;
export type InsertPlatformAddOn = typeof platformAddOns.$inferInsert;
export type AddOnUsageAnalytics = typeof addOnUsageAnalytics.$inferSelect;
export type InsertAddOnUsageAnalytics = typeof addOnUsageAnalytics.$inferInsert;
export type AddOnDependency = typeof addOnDependencies.$inferSelect;
export type InsertAddOnDependency = typeof addOnDependencies.$inferInsert;
export type FeatureFlag = typeof featureFlags.$inferSelect;
export type InsertFeatureFlag = typeof featureFlags.$inferInsert;
export type AddOnFeedback = typeof addOnFeedback.$inferSelect;
export type InsertAddOnFeedback = typeof addOnFeedback.$inferInsert;

// Insert schemas
export const insertAddOnRegistrySchema = createInsertSchema(addOnRegistry).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPlatformAddOnSchema = createInsertSchema(platformAddOns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  enabledAt: true,
  firstUsedAt: true,
  lastUsedAt: true,
});

export const insertFeatureFlagSchema = createInsertSchema(featureFlags).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
