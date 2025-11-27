import { pgTable, text, timestamp, integer, boolean, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const verificationStatusEnum = pgEnum('verification_status', ['pending', 'approved', 'rejected', 'under_review']);
export const verificationLevelEnum = pgEnum('verification_level', ['basic', 'enhanced', 'full_compliance']);
export const idTypeEnum = pgEnum('id_type', ['drivers_license', 'passport', 'national_id', 'other']);

/**
 * Content Creator Verifications Table
 * For primary content creators - comprehensive 2257 compliance
 */
export const creatorVerifications = pgTable("creator_verifications", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),

  // Step 1: Creator Identification
  fullLegalName: text("full_legal_name").notNull(),
  stageName: text("stage_name"),
  dateOfBirth: text("date_of_birth").notNull(),
  age: integer("age").notNull(),
  pronouns: text("pronouns"),
  countryOfCitizenship: text("country_of_citizenship").notNull(),

  // Address
  residentialAddress: text("residential_address").notNull(),
  city: text("city").notNull(),
  stateProvince: text("state_province").notNull(),
  zipPostalCode: text("zip_postal_code").notNull(),

  // Contact
  mobilePhone: text("mobile_phone").notNull(),
  emailAddress: text("email_address").notNull(),

  // Step 2: Identification (stored as JSONB for flexibility)
  identificationType: jsonb("identification_type").notNull(), // array of types
  driversLicenseNumber: text("drivers_license_number"),
  driversLicenseState: text("drivers_license_state"),
  passportNumber: text("passport_number"),
  passportCountry: text("passport_country"),
  nationalIdNumber: text("national_id_number"),
  nationalIdAuthority: text("national_id_authority"),
  otherIdType: text("other_id_type"),
  otherIdNumber: text("other_id_number"),

  // Step 3: Digital Verification
  photoIdUploaded: boolean("photo_id_uploaded").notNull().default(false),
  photoIdUrl: text("photo_id_url"),
  selfieVerified: boolean("selfie_verified").notNull().default(false),
  selfieUrl: text("selfie_url"),
  ageMetadataValidated: boolean("age_metadata_validated").notNull().default(false),
  blockchainIdOptIn: boolean("blockchain_id_opt_in").default(false),
  blockchainIdHash: text("blockchain_id_hash"),
  signatureCaptured: boolean("signature_captured").notNull().default(false),
  signatureUrl: text("signature_url"),
  twoFactorSetup: boolean("two_factor_setup").notNull().default(false),

  // Step 4: Certifications
  certifyIndependentCreator: boolean("certify_independent_creator").notNull().default(false),
  certifyRetainOwnership: boolean("certify_retain_ownership").notNull().default(false),
  certify2257Compliance: boolean("certify_2257_compliance").notNull().default(false),
  certifyAllPerformers18: boolean("certify_all_performers_18").notNull().default(false),
  certifyDistributionRights: boolean("certify_distribution_rights").notNull().default(false),

  // Step 5: Content Policy
  acknowledgeProhibitedContent: boolean("acknowledge_prohibited_content").notNull().default(false),
  acknowledgeProhibitedConduct: boolean("acknowledge_prohibited_conduct").notNull().default(false),
  acknowledgeZeroTolerance: boolean("acknowledge_zero_tolerance").notNull().default(false),

  // Step 6: Legal Agreements
  acknowledgeContentOwnership: boolean("acknowledge_content_ownership").notNull().default(false),
  acknowledgeDataPrivacy: boolean("acknowledge_data_privacy").notNull().default(false),
  acceptArbitration: boolean("accept_arbitration").notNull().default(false),
  acceptIndemnification: boolean("accept_indemnification").notNull().default(false),

  // Step 7: Sworn Declarations
  swornDeclarationAllIdsValid: boolean("sworn_declaration_all_ids_valid").notNull().default(false),
  swornDeclarationAllPerformersVerified: boolean("sworn_declaration_all_performers_verified").notNull().default(false),
  swornDeclarationMaintain2257: boolean("sworn_declaration_maintain_2257").notNull().default(false),
  swornDeclarationFreelyEntering: boolean("sworn_declaration_freely_entering").notNull().default(false),

  // Signature
  signatureDate: text("signature_date").notNull(),
  electronicSignatureAcknowledged: boolean("electronic_signature_acknowledged").notNull().default(false),

  // Status & Review
  status: verificationStatusEnum("status").notNull().default('pending'),
  verificationLevel: verificationLevelEnum("verification_level").default('basic'),

  // Admin Actions
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
  approvedAt: timestamp("approved_at"),
  approvedBy: text("approved_by"),
  rejectedAt: timestamp("rejected_at"),
  rejectedBy: text("rejected_by"),
  rejectionReason: text("rejection_reason"),
  detailedFeedback: text("detailed_feedback"),
  reviewNotes: text("review_notes"),

  // Audit
  platform: text("platform").notNull().default('fanzdash'),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),

  // Additional data (AI verification results, etc.)
  metadata: jsonb("metadata"),

  // Optional notes
  notes: text("notes"),

  // Timestamps
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/**
 * Co-Star Verifications Table
 * For co-stars/collaborators - model release + 2257 compliance
 */
export const costarVerifications = pgTable("costar_verifications", {
  id: text("id").primaryKey(),
  userId: text("user_id"),

  // Co-Star Information
  legalName: text("legal_name").notNull(),
  stageName: text("stage_name"),
  maidenName: text("maiden_name"),
  previousLegalName: text("previous_legal_name"),
  otherNames: text("other_names"),
  dateOfBirth: text("date_of_birth").notNull(),
  age: integer("age").notNull(),

  // Identification
  identificationType: text("identification_type").notNull(), // drivers_license, passport, etc.
  identificationNumber: text("identification_number").notNull(),
  identificationState: text("identification_state"),
  identificationOther: text("identification_other"),

  // Address
  address: text("address").notNull(),
  apt: text("apt"),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  cellPhone: text("cell_phone").notNull(),
  homePhone: text("home_phone"),

  // Primary Creator Information
  primaryCreatorLegalName: text("primary_creator_legal_name").notNull(),
  primaryCreatorStageName: text("primary_creator_stage_name"),
  contentCreationDate: text("content_creation_date").notNull(),

  // Certifications
  certifyAge18: boolean("certify_age_18").notNull().default(false),
  certifyAllNames: boolean("certify_all_names").notNull().default(false),
  certifyValidId: boolean("certify_valid_id").notNull().default(false),
  certifyNoIllegalActs: boolean("certify_no_illegal_acts").notNull().default(false),
  certifyFreelyEntering: boolean("certify_freely_entering").notNull().default(false),

  // Signatures & Dates
  coStarSignatureDate: text("costar_signature_date").notNull(),
  coStarInitials: text("costar_initials").notNull(),
  primaryCreatorSignatureDate: text("primary_creator_signature_date").notNull(),

  // Document URLs
  idFrontImageUrl: text("id_front_image_url"),
  idBackImageUrl: text("id_back_image_url"),
  holdingIdImageUrl: text("holding_id_image_url"),
  additionalDocumentsUrls: jsonb("additional_documents_urls"), // array of URLs

  // Status & Review
  status: verificationStatusEnum("status").notNull().default('pending'),

  // Admin Actions
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
  submittedBy: text("submitted_by"),
  approvedAt: timestamp("approved_at"),
  approvedBy: text("approved_by"),
  rejectedAt: timestamp("rejected_at"),
  rejectedBy: text("rejected_by"),
  rejectionReason: text("rejection_reason"),
  reviewNotes: text("review_notes"),

  // Audit
  platform: text("platform").notNull().default('fanzdash'),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),

  // Additional data
  metadata: jsonb("metadata"),
  notes: text("notes"),

  // Timestamps
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/**
 * Verification Audit Log
 * Track all actions taken on verifications
 */
export const verificationAuditLog = pgTable("verification_audit_log", {
  id: text("id").primaryKey(),
  verificationType: text("verification_type").notNull(), // 'creator' or 'costar'
  verificationId: text("verification_id").notNull(),

  // Action Details
  action: text("action").notNull(), // 'created', 'approved', 'rejected', 'updated', 'viewed'
  performedBy: text("performed_by").notNull(),
  performedByRole: text("performed_by_role"),

  // Details
  details: jsonb("details"), // additional context
  reason: text("reason"), // for rejections, etc.

  // Audit Trail
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

/**
 * Verification Statistics
 * Aggregated stats for dashboard
 */
export const verificationStats = pgTable("verification_stats", {
  id: text("id").primaryKey(),
  date: text("date").notNull(), // YYYY-MM-DD format

  // Creator Stats
  creatorPending: integer("creator_pending").notNull().default(0),
  creatorApproved: integer("creator_approved").notNull().default(0),
  creatorRejected: integer("creator_rejected").notNull().default(0),
  creatorTotal: integer("creator_total").notNull().default(0),

  // Co-Star Stats
  costarPending: integer("costar_pending").notNull().default(0),
  costarApproved: integer("costar_approved").notNull().default(0),
  costarRejected: integer("costar_rejected").notNull().default(0),
  costarTotal: integer("costar_total").notNull().default(0),

  // Combined Stats
  totalPending: integer("total_pending").notNull().default(0),
  totalApproved: integer("total_approved").notNull().default(0),
  totalRejected: integer("total_rejected").notNull().default(0),
  totalVerifications: integer("total_verifications").notNull().default(0),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Zod schemas for validation
export const insertCreatorVerificationSchema = createInsertSchema(creatorVerifications);
export const selectCreatorVerificationSchema = createSelectSchema(creatorVerifications);

export const insertCostarVerificationSchema = createInsertSchema(costarVerifications);
export const selectCostarVerificationSchema = createSelectSchema(costarVerifications);

export const insertVerificationAuditLogSchema = createInsertSchema(verificationAuditLog);
export const selectVerificationAuditLogSchema = createSelectSchema(verificationAuditLog);

// Type exports
export type CreatorVerification = typeof creatorVerifications.$inferSelect;
export type InsertCreatorVerification = typeof creatorVerifications.$inferInsert;

export type CostarVerification = typeof costarVerifications.$inferSelect;
export type InsertCostarVerification = typeof costarVerifications.$inferInsert;

export type VerificationAuditLog = typeof verificationAuditLog.$inferSelect;
export type InsertVerificationAuditLog = typeof verificationAuditLog.$inferInsert;

export type VerificationStats = typeof verificationStats.$inferSelect;
export type InsertVerificationStats = typeof verificationStats.$inferInsert;
