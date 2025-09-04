/**
 * FANZDASH DATABASE SCHEMA - CORE MODULE
 *
 * Core authentication, user management, and foundational system tables
 * for the FanzDash enterprise content moderation platform.
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
  date,
} from "drizzle-orm/pg-core";

/**
 * USERS TABLE
 * Central user registry with multi-method authentication support
 * Supports OAuth, SSO, TOTP/2FA, WebAuthn, and device security
 */
export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  fanzId: varchar("fanz_id").unique().notNull(), // Unique FanzID for each user
  username: text("username").unique().notNull(),
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

  // Enhanced authentication fields
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

/**
 * TRUSTED DEVICES TABLE
 * Device security and management for multi-factor authentication
 */
export const trustedDevices = pgTable("trusted_devices", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .references(() => users.id)
    .notNull(),
  deviceFingerprint: varchar("device_fingerprint").notNull(),
  deviceName: varchar("device_name"),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  isTrusted: boolean("is_trusted").default(false),
  lastSeenAt: timestamp("last_seen_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

/**
 * USER SESSIONS TABLE
 * Active session management with security tracking
 */
export const userSessions = pgTable("user_sessions", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .references(() => users.id)
    .notNull(),
  sessionToken: varchar("session_token").notNull().unique(),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  isActive: boolean("is_active").default(true),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

/**
 * WEBAUTHN CREDENTIALS TABLE
 * Biometric and hardware key authentication
 */
export const webauthnCredentials = pgTable("webauthn_credentials", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .references(() => users.id)
    .notNull(),
  credentialId: varchar("credential_id").notNull().unique(),
  publicKey: text("public_key").notNull(),
  counter: integer("counter").default(0),
  name: varchar("name"),
  createdAt: timestamp("created_at").defaultNow(),
});

/**
 * EMAIL VERIFICATION TOKENS TABLE
 * Secure email verification token management
 */
export const emailVerificationTokens = pgTable("email_verification_tokens", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .references(() => users.id)
    .notNull(),
  token: varchar("token").notNull().unique(),
  email: varchar("email").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

/**
 * SECURITY AUDIT LOG TABLE
 * Comprehensive security event logging for compliance
 */
export const securityAuditLog = pgTable("security_audit_log", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  eventType: varchar("event_type").notNull(), // 'login', 'logout', 'failed_login', 'password_change', etc.
  description: text("description").notNull(),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  metadata: jsonb("metadata"),
  severity: varchar("severity").notNull().default("info"), // 'low', 'medium', 'high', 'critical'
  source: varchar("source").notNull(), // 'web', 'api', 'mobile', 'system'
  sessionId: varchar("session_id"),
  deviceFingerprint: varchar("device_fingerprint"),
  geolocation: jsonb("geolocation"),
  riskScore: decimal("risk_score", { precision: 3, scale: 2 }),
  blocked: boolean("blocked").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

/**
 * ROLES TABLE
 * Role-based access control definitions
 */
export const roles = pgTable("roles", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: varchar("name").notNull().unique(),
  description: text("description"),
  permissions: jsonb("permissions").$type<string[]>(),
  isSystem: boolean("is_system").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/**
 * USER ROLES TABLE
 * Many-to-many relationship between users and roles
 */
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
  assignedBy: varchar("assigned_by").references(() => users.id),
  assignedAt: timestamp("assigned_at").defaultNow(),
});

/**
 * SYSTEM SETTINGS TABLE
 * Global application configuration
 */
export const systemSettings = pgTable("system_settings", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  key: varchar("key").notNull().unique(),
  value: jsonb("value"),
  description: text("description"),
  category: varchar("category").notNull(),
  isPublic: boolean("is_public").default(false),
  updatedBy: varchar("updated_by").references(() => users.id),
  updatedAt: timestamp("updated_at").defaultNow(),
});
