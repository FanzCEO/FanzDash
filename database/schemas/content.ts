/**
 * FANZDASH DATABASE SCHEMA - CONTENT MODULE
 *
 * Content management, moderation, and security tables for the
 * FanzDash enterprise content moderation platform.
 *
 * © 2025 Fanz™ Unlimited Network LLC. All Rights Reserved.
 * Contact: admin@fanzunlimited.com
 * Classification: PRODUCTION-READY | GOVERNMENT-GRADE
 */

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
} from "drizzle-orm/pg-core";
import { users } from "./core";

/**
 * CONTENT ITEMS TABLE
 * Central repository for all content requiring moderation
 */
export const contentItems = pgTable("content_items", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  type: varchar("type").notNull(), // 'image', 'video', 'text', 'live_stream', 'audio'
  url: text("url"),
  content: text("content"), // for text content
  userId: varchar("user_id").references(() => users.id),
  status: varchar("status").notNull().default("pending"), // 'pending', 'approved', 'rejected', 'auto_blocked'
  riskScore: decimal("risk_score", { precision: 3, scale: 2 }),
  moderatorId: varchar("moderator_id").references(() => users.id),
  priority: varchar("priority").default("normal"), // 'low', 'normal', 'high', 'urgent'
  source: varchar("source"), // 'upload', 'live_stream', 'chat', 'api'
  metadata: jsonb("metadata"), // Additional content metadata
  reviewCount: integer("review_count").default(0),
  lastReviewedAt: timestamp("last_reviewed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/**
 * MODERATION RESULTS TABLE
 * AI and manual moderation analysis results
 */
export const moderationResults = pgTable("moderation_results", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  contentId: varchar("content_id")
    .references(() => contentItems.id)
    .notNull(),
  modelType: varchar("model_type").notNull(), // 'gpt-5', 'gpt-4o', 'nudenet', 'detoxify', 'perspective', 'whisper'
  confidence: decimal("confidence", { precision: 3, scale: 2 }),
  detections: jsonb("detections"), // array of detection objects
  pdqHash: text("pdq_hash"),
  recommendation: varchar("recommendation"), // 'approve', 'reject', 'review', 'blur'
  reasoning: text("reasoning"), // AI explanation for decision
  metadata: jsonb("metadata"), // Additional analysis data
  processingTime: integer("processing_time"), // milliseconds
  createdAt: timestamp("created_at").defaultNow(),
});

/**
 * APPEAL REQUESTS TABLE
 * User appeals for moderation decisions
 */
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
  status: varchar("status").notNull().default("pending"), // 'pending', 'approved', 'denied', 'under_review'
  moderatorId: varchar("moderator_id").references(() => users.id),
  response: text("response"),
  evidence: jsonb("evidence"), // Supporting documentation
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/**
 * ENCRYPTED VAULT TABLE
 * Secure storage for sensitive content evidence
 */
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
  accessLog:
    jsonb("access_log").$type<
      Array<{ userId: string; timestamp: string; action: string }>
    >(),
  retentionDate: timestamp("retention_date"),
  lawEnforcementNotified: boolean("law_enforcement_notified").default(false),
  caseNumber: varchar("case_number"),
  createdBy: varchar("created_by")
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

/**
 * CONTENT FILTERS TABLE
 * Configurable content filtering rules
 */
export const contentFilters = pgTable("content_filters", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  type: varchar("type").notNull(), // 'keyword', 'hash', 'ai_model', 'regex'
  pattern: text("pattern").notNull(),
  action: varchar("action").notNull(), // 'block', 'flag', 'blur', 'queue_review'
  severity: varchar("severity").notNull(),
  isActive: boolean("is_active").default(true),
  appliesTo: jsonb("applies_to").$type<string[]>(), // content types
  metadata: jsonb("metadata"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/**
 * MODERATION SETTINGS TABLE
 * Configurable thresholds and rules for moderation
 */
export const moderationSettings = pgTable("moderation_settings", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  type: varchar("type").notNull(), // 'image', 'text', 'video', 'audio', 'live_stream'
  autoBlockThreshold: decimal("auto_block_threshold", {
    precision: 3,
    scale: 2,
  }),
  reviewThreshold: decimal("review_threshold", { precision: 3, scale: 2 }),
  autoApproveThreshold: decimal("auto_approve_threshold", {
    precision: 3,
    scale: 2,
  }),
  frameSampleRate: integer("frame_sample_rate").default(4),
  autoBlurThreshold: decimal("auto_blur_threshold", { precision: 3, scale: 2 }),
  escalationRules: jsonb("escalation_rules"),
  notificationSettings: jsonb("notification_settings"),
  retentionDays: integer("retention_days").default(30),
  updatedBy: varchar("updated_by").references(() => users.id),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/**
 * CONTENT CATEGORIES TABLE
 * Hierarchical content classification system
 */
export const contentCategories = pgTable("content_categories", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  slug: varchar("slug").notNull().unique(),
  description: text("description"),
  parentId: varchar("parent_id").references(() => contentCategories.id),
  level: integer("level").default(0),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  metadata: jsonb("metadata"),
});

/**
 * AI ANALYSIS RESULTS TABLE
 * Detailed AI analysis results and confidence scores
 */
export const aiAnalysisResults = pgTable("ai_analysis_results", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  contentId: varchar("content_id")
    .references(() => contentItems.id)
    .notNull(),
  analysisType: varchar("analysis_type").notNull(), // 'toxicity', 'nudity', 'violence', 'faces', 'objects'
  modelVersion: varchar("model_version").notNull(),
  results: jsonb("results").notNull(),
  confidence: decimal("confidence", { precision: 5, scale: 4 }),
  processingTime: integer("processing_time"), // milliseconds
  errorMessage: text("error_message"),
  retryCount: integer("retry_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});
