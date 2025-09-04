import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, decimal, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fanzId: varchar("fanz_id").notNull().unique(), // Unique FanzID for each user
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: varchar("email").notNull().unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  role: varchar("role").notNull().default("moderator"), // 'creator', 'moderator', 'admin', 'executive', 'super_admin'
  clearanceLevel: integer("clearance_level").notNull().default(1), // 1-5, higher = more access
  vaultAccess: boolean("vault_access").default(false),
  modulePermissions: jsonb("module_permissions").default('{}'), // Per-module access control
  lastLoginAt: timestamp("last_login_at"),
  isActive: boolean("is_active").default(true),
  profileImageUrl: varchar("profile_image_url"),
  phoneNumber: varchar("phone_number"),
  address: text("address"),
  city: varchar("city"),
  country: varchar("country"),
  postalCode: varchar("postal_code"),
  verificationStatus: varchar("verification_status").default("pending"), // 'verified', 'declined', 'pending'
  createdBy: varchar("created_by"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const contentItems = pgTable("content_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
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
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contentId: varchar("content_id").references(() => contentItems.id).notNull(),
  modelType: varchar("model_type").notNull(), // 'nudenet', 'detoxify', 'pdq_hash'
  confidence: decimal("confidence", { precision: 3, scale: 2 }),
  detections: jsonb("detections"), // array of detection objects
  pdqHash: text("pdq_hash"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const liveStreams = pgTable("live_streams", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
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
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: varchar("type").notNull(), // 'image', 'text', 'live_stream'
  autoBlockThreshold: decimal("auto_block_threshold", { precision: 3, scale: 2 }),
  reviewThreshold: decimal("review_threshold", { precision: 3, scale: 2 }),
  frameSampleRate: integer("frame_sample_rate").default(4),
  autoBlurThreshold: decimal("auto_blur_threshold", { precision: 3, scale: 2 }),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const appealRequests = pgTable("appeal_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contentId: varchar("content_id").references(() => contentItems.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  reason: text("reason").notNull(),
  status: varchar("status").notNull().default("pending"), // 'pending', 'approved', 'denied'
  moderatorId: varchar("moderator_id").references(() => users.id),
  response: text("response"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Encrypted vault for storing illegal/sensitive content evidence
export const encryptedVault = pgTable("encrypted_vault", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contentId: varchar("content_id").references(() => contentItems.id).notNull(),
  encryptedData: text("encrypted_data").notNull(), // AES encrypted content
  encryptionKey: text("encryption_key").notNull(), // RSA encrypted key
  vaultReason: varchar("vault_reason").notNull(), // 'illegal_content', 'csam', 'terrorism', 'evidence'
  severity: varchar("severity").notNull(), // 'low', 'medium', 'high', 'critical'
  executiveAccess: boolean("executive_access").notNull().default(true),
  accessLog: jsonb("access_log").default([]), // track who accessed when
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Admin action logs - tracks every admin approval/rejection
export const adminActionLogs = pgTable("admin_action_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  adminId: varchar("admin_id").references(() => users.id).notNull(),
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
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  adminId: varchar("admin_id").references(() => users.id).notNull(),
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
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  filterCriteria: jsonb("filter_criteria").notNull(), // complex filter rules
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  isShared: boolean("is_shared").default(false),
  usageCount: integer("usage_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Audit trail for all system changes
export const auditTrail = pgTable("audit_trail", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
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
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  domain: varchar("domain").notNull().unique(),
  niche: varchar("niche").notNull(),
  status: varchar("status").notNull().default("active"), // active, inactive, maintenance, error
  apiEndpoint: varchar("api_endpoint").notNull(),
  apiKey: varchar("api_key"),
  webhookUrl: varchar("webhook_url").notNull(),
  moderationRules: jsonb("moderation_rules").notNull(),
  stats: jsonb("stats").notNull().default('{}'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  lastActive: timestamp("last_active").defaultNow(),
});

// Platform connections tracking
export const platformConnections = pgTable("platform_connections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  platformId: varchar("platform_id").notNull().references(() => platforms.id),
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
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contentId: varchar("content_id").notNull().references(() => contentItems.id),
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
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  creatorId: varchar("creator_id").references(() => users.id).notNull(),
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

// Integrated Chat System
export const chatRooms = pgTable("chat_rooms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  type: varchar("type").notNull(), // 'direct', 'group', 'broadcast', 'emergency'
  participants: jsonb("participants").notNull(), // Array of user IDs
  isActive: boolean("is_active").default(true),
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  roomId: varchar("room_id").references(() => chatRooms.id).notNull(),
  senderId: varchar("sender_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  messageType: varchar("message_type").default("text"), // 'text', 'image', 'file', 'system'
  attachmentUrl: text("attachment_url"),
  isEdited: boolean("is_edited").default(false),
  editedAt: timestamp("edited_at"),
  isDeleted: boolean("is_deleted").default(false),
  readBy: jsonb("read_by").default('[]'), // Array of user IDs who read the message
  createdAt: timestamp("created_at").defaultNow(),
});

// Email Integration System
export const emailAccounts = pgTable("email_accounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
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
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  accountId: varchar("account_id").references(() => emailAccounts.id).notNull(),
  messageId: varchar("message_id").notNull(), // External email message ID
  threadId: varchar("thread_id"),
  fromAddress: varchar("from_address").notNull(),
  toAddresses: jsonb("to_addresses").notNull(),
  ccAddresses: jsonb("cc_addresses").default('[]'),
  bccAddresses: jsonb("bcc_addresses").default('[]'),
  subject: text("subject"),
  content: text("content"),
  htmlContent: text("html_content"),
  attachments: jsonb("attachments").default('[]'),
  isRead: boolean("is_read").default(false),
  isStarred: boolean("is_starred").default(false),
  labels: jsonb("labels").default('[]'),
  receivedAt: timestamp("received_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// People Data Main Brain
export const userAnalytics = pgTable("user_analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
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
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  platformId: varchar("platform_id").references(() => platforms.id),
  fileName: varchar("file_name").notNull(),
  fileType: varchar("file_type").notNull(),
  fileSize: integer("file_size").notNull(),
  mimeType: varchar("mime_type").notNull(),
  storageUrl: text("storage_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  aiAnalysisResult: jsonb("ai_analysis_result"),
  moderationStatus: varchar("moderation_status").default("pending"),
  tags: jsonb("tags").default('[]'),
  metadata: jsonb("metadata"),
  isDeleted: boolean("is_deleted").default(false),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  processedAt: timestamp("processed_at"),
});

// System Notifications
export const systemNotifications = pgTable("system_notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  recipientId: varchar("recipient_id").references(() => users.id).notNull(),
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
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  platformId: varchar("platform_id").references(() => platforms.id).notNull(),
  date: timestamp("date").notNull(),
  totalUsers: integer("total_users").default(0),
  activeUsers: integer("active_users").default(0),
  newSignups: integer("new_signups").default(0),
  contentUploads: integer("content_uploads").default(0),
  moderationActions: integer("moderation_actions").default(0),
  revenue: decimal("revenue", { precision: 10, scale: 2 }).default('0'),
  metrics: jsonb("metrics"),
  createdAt: timestamp("created_at").defaultNow(),
});

// First set of types (keeping these, removing duplicates below)
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

export const insertModerationResultSchema = createInsertSchema(moderationResults).omit({
  id: true,
  createdAt: true,
});

export const insertLiveStreamSchema = createInsertSchema(liveStreams).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertModerationSettingsSchema = createInsertSchema(moderationSettings).omit({
  id: true,
  updatedAt: true,
});

export const insertAppealRequestSchema = createInsertSchema(appealRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEncryptedVaultSchema = createInsertSchema(encryptedVault).omit({
  id: true,
  createdAt: true,
});

export const insertAdminActionLogSchema = createInsertSchema(adminActionLogs).omit({
  id: true,
  createdAt: true,
});

export const insertAdminSessionLogSchema = createInsertSchema(adminSessionLogs).omit({
  id: true,
  createdAt: true,
});

export const insertContentFilterSchema = createInsertSchema(contentFilters).omit({
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

export const insertPlatformConnectionSchema = createInsertSchema(platformConnections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAIAnalysisResultSchema = createInsertSchema(aiAnalysisResults).omit({
  id: true,
  createdAt: true,
});

export const insertForm2257VerificationSchema = createInsertSchema(form2257Verifications).omit({
  id: true,
  submittedAt: true,
  processedAt: true,
});

export const insertChatRoomSchema = createInsertSchema(chatRooms).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export const insertEmailAccountSchema = createInsertSchema(emailAccounts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEmailMessageSchema = createInsertSchema(emailMessages).omit({
  id: true,
  createdAt: true,
});

export const insertUserAnalyticsSchema = createInsertSchema(userAnalytics).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMediaAssetSchema = createInsertSchema(mediaAssets).omit({
  id: true,
  uploadedAt: true,
  processedAt: true,
});

export const insertSystemNotificationSchema = createInsertSchema(systemNotifications).omit({
  id: true,
  createdAt: true,
});

export const insertPlatformStatsSchema = createInsertSchema(platformStats).omit({
  id: true,
  createdAt: true,
});

// All type definitions (consolidated)
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type ContentItem = typeof contentItems.$inferSelect;
export type InsertContentItem = z.infer<typeof insertContentItemSchema>;
export type ModerationResult = typeof moderationResults.$inferSelect;
export type InsertModerationResult = z.infer<typeof insertModerationResultSchema>;
export type LiveStream = typeof liveStreams.$inferSelect;
export type InsertLiveStream = z.infer<typeof insertLiveStreamSchema>;
export type ModerationSettings = typeof moderationSettings.$inferSelect;
export type InsertModerationSettings = z.infer<typeof insertModerationSettingsSchema>;
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
export type InsertPlatformConnection = z.infer<typeof insertPlatformConnectionSchema>;
export type AIAnalysisResult = typeof aiAnalysisResults.$inferSelect;
export type InsertAIAnalysisResult = z.infer<typeof insertAIAnalysisResultSchema>;
export type Form2257Verification = typeof form2257Verifications.$inferSelect;
export type InsertForm2257Verification = z.infer<typeof insertForm2257VerificationSchema>;
export type ChatRoom = typeof chatRooms.$inferSelect;
export type InsertChatRoom = z.infer<typeof insertChatRoomSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type EmailAccount = typeof emailAccounts.$inferSelect;
export type InsertEmailAccount = z.infer<typeof insertEmailAccountSchema>;
export type EmailMessage = typeof emailMessages.$inferSelect;
export type InsertEmailMessage = z.infer<typeof insertEmailMessageSchema>;
export type UserAnalytics = typeof userAnalytics.$inferSelect;
export type InsertUserAnalytics = z.infer<typeof insertUserAnalyticsSchema>;
export type MediaAsset = typeof mediaAssets.$inferSelect;
export type InsertMediaAsset = z.infer<typeof insertMediaAssetSchema>;
export type SystemNotification = typeof systemNotifications.$inferSelect;
export type InsertSystemNotification = z.infer<typeof insertSystemNotificationSchema>;
export type PlatformStats = typeof platformStats.$inferSelect;
export type InsertPlatformStats = z.infer<typeof insertPlatformStatsSchema>;
