import {
  users,
  contentItems,
  moderationResults,
  liveStreams,
  moderationSettings,
  appealRequests,
  streamTokens,
  streamChannels,
  encodingJobs,
  paymentProcessors,
  paymentTransactions,
  aiCompanions,
  vrSessions,
  webrtcRooms,
  geoCollaborations,
  audioCallSettings,
  taxRates,
  adCampaigns,
  liveStreamSessions,
  privateShowRequests,
  giftCatalog,
  giftTransactions,
  userDeposits,
  roles,
  userRoles,
  announcements,
  cmsPages,
  platformLimits,
  reservedNames,
  systemSettings,
  audioCalls,
  extendedPaymentProcessors,
  companyBilling,
  systemAnnouncements,
  blogPosts,
  contentCategories,
  countries,
  userComments,
  cronJobs,
  cronJobLogs,
  states,
  languages,
  radioStations,
  radioModerationActions,
  radioChat,
  podcasts,
  podcastEpisodes,
  // Enterprise multi-tenant tables
  tenants,
  memberships,
  auditLogs,
  kycVerifications,
  payoutRequests,
  adCreatives,
  adPlacements,
  securityEvents,
  opaPolicies,
  globalFlags,
  webhooks,
  apiKeys,
  // apiIntegrations,
  // liveStreamingPrivateRequests,
  // maintenanceMode,
  // memberProfiles,
  moderationSettings,
  // platformMessages,
  // paymentProcessorSettings,
  // systemLimits,
  type User,
  type InsertUser,
  type ContentItem,
  type InsertContentItem,
  type ModerationResult,
  type InsertModerationResult,
  type LiveStream,
  type InsertLiveStream,
  type ModerationSettings,
  type InsertModerationSettings,
  type AppealRequest,
  type InsertAppealRequest,
  type StreamToken,
  type InsertStreamToken,
  type StreamChannel,
  type InsertStreamChannel,
  type EncodingJob,
  type InsertEncodingJob,
  type PaymentProcessor,
  type InsertPaymentProcessor,
  type PaymentTransaction,
  type InsertPaymentTransaction,
  type AICompanion,
  type InsertAICompanion,
  type VRSession,
  type InsertVRSession,
  type WebRTCRoom,
  type InsertWebRTCRoom,
  type GeoCollaboration,
  type InsertGeoCollaboration,
  type TaxRate,
  type InsertTaxRate,
  type AdCampaign,
  type InsertAdCampaign,
  type LiveStreamSession,
  type InsertLiveStreamSession,
  type PrivateShowRequest,
  type InsertPrivateShowRequest,
  type GiftCatalog,
  type InsertGiftCatalog,
  type GiftTransaction,
  type InsertGiftTransaction,
  type UserDeposit,
  type InsertUserDeposit,
  type Role,
  type InsertRole,
  type UserRole,
  type InsertUserRole,
  type Announcement,
  type InsertAnnouncement,
  type CmsPage,
  type InsertCmsPage,
  type PlatformLimit,
  type InsertPlatformLimit,
  type ReservedName,
  type SystemSetting,
  type AudioCall,
  type InsertAudioCall,
  type ExtendedPaymentProcessor,
  type InsertExtendedPaymentProcessor,
  type BlogPost,
  type InsertBlogPost,
  type Country,
  type InsertCountry,
  type State,
  type InsertState,
  type Language,
  type InsertLanguage,
  type UserComment,
  type InsertUserComment,
  type CronJob,
  type InsertCronJob,
  type CronJobLog,
  type InsertCronJobLog,
  // Enterprise multi-tenant types
  type Tenant,
  type InsertTenant,
  type Membership,
  type InsertMembership,
  type AuditLog,
  type InsertAuditLog,
  type KycVerification,
  type InsertKycVerification,
  type PayoutRequest,
  type InsertPayoutRequest,
  type AdCreative,
  type InsertAdCreative,
  type AdPlacement,
  type InsertAdPlacement,
  type SecurityEvent,
  type InsertSecurityEvent,
  type OpaPolicy,
  type InsertOpaPolicy,
  type GlobalFlag,
  type InsertGlobalFlag,
  type Webhook,
  type InsertWebhook,
  type ApiKey,
  type InsertApiKey,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, count, and, or, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Content operations
  getContentItem(id: string): Promise<ContentItem | undefined>;
  createContentItem(content: InsertContentItem): Promise<ContentItem>;
  updateContentStatus(
    id: string,
    status: string,
    moderatorId?: string,
  ): Promise<void>;
  getPendingContent(limit?: number): Promise<ContentItem[]>;

  // Moderation results
  createModerationResult(
    result: InsertModerationResult,
  ): Promise<ModerationResult>;
  getModerationResults(contentId: string): Promise<ModerationResult[]>;

  // Live streams
  getLiveStreams(): Promise<LiveStream[]>;
  createLiveStream(stream: InsertLiveStream): Promise<LiveStream>;
  updateLiveStream(id: string, updates: Partial<LiveStream>): Promise<void>;

  // Settings
  getModerationSettings(): Promise<ModerationSettings[]>;
  updateModerationSettings(settings: InsertModerationSettings): Promise<void>;

  // Audio Call Settings
  getAudioCallSettings(): Promise<any>;
  updateAudioCallSettings(settings: any): Promise<void>;

  // Appeals
  getAppealRequests(): Promise<AppealRequest[]>;
  createAppealRequest(appeal: InsertAppealRequest): Promise<AppealRequest>;
  updateAppealRequest(
    id: string,
    updates: Partial<AppealRequest>,
  ): Promise<void>;

  // Stats
  getDashboardStats(): Promise<{
    reviewedToday: number;
    autoBlocked: number;
    pendingReview: number;
    liveStreams: number;
  }>;

  getUserStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    newUsersToday: number;
    verifiedUsers: number;
  }>;

  getContentStats(): Promise<{
    totalContent: number;
    pendingModeration: number;
    approvedContent: number;
    blockedContent: number;
  }>;

  getModerationStats(): Promise<{
    totalActions: number;
    automatedActions: number;
    manualActions: number;
    appealsToday: number;
  }>;

  // Multi-platform operations
  getAllPlatforms(): Promise<any[]>;
  createPlatform(platformData: any): Promise<any>;
  updatePlatform(id: string, updates: any): Promise<any>;
  testPlatformConnection(platformId: string): Promise<any>;
  getPlatformConnections(): Promise<any[]>;
  getPlatformStats(): Promise<any>;
  getRecentAnalysis(limit: number): Promise<any[]>;
  processContentAnalysis(request: any): Promise<any>;

  // AI Analysis operations
  createAnalysisResult(data: {
    contentUrl: string;
    contentType: string;
    result: any;
    analysisType: string;
    confidence: number;
    processingTime: number;
  }): Promise<any>;

  getRecentAnalysisResults(limit: number): Promise<any[]>;

  // Payment Processor operations
  getPaymentProcessors(): Promise<PaymentProcessor[]>;
  createPaymentProcessor(
    processor: InsertPaymentProcessor,
  ): Promise<PaymentProcessor>;
  createPaymentTransaction(
    transaction: InsertPaymentTransaction,
  ): Promise<PaymentTransaction>;

  // GetStream operations
  createStreamToken(token: InsertStreamToken): Promise<StreamToken>;
  createStreamChannel(channel: InsertStreamChannel): Promise<StreamChannel>;

  // Coconut Encoding operations
  createEncodingJob(job: InsertEncodingJob): Promise<EncodingJob>;
  getEncodingJob(id: string): Promise<EncodingJob | undefined>;
  updateEncodingJobStatus(jobId: string, updates: any): Promise<void>;

  // AI Companion operations
  createAICompanion(companion: InsertAICompanion): Promise<AICompanion>;
  getAICompanion(id: string): Promise<AICompanion | undefined>;

  // VR/WebXR operations
  createVRSession(session: InsertVRSession): Promise<VRSession>;
  createWebRTCRoom(room: InsertWebRTCRoom): Promise<WebRTCRoom>;

  // Geo-Collaboration operations
  createGeoCollaboration(
    collaboration: InsertGeoCollaboration,
  ): Promise<GeoCollaboration>;
  getNearbyCollaborations(
    lat: number,
    lng: number,
    radius: number,
  ): Promise<GeoCollaboration[]>;

  // Tax Management
  getTaxRates(): Promise<TaxRate[]>;
  createTaxRate(rate: InsertTaxRate): Promise<TaxRate>;
  updateTaxRate(id: string, updates: Partial<TaxRate>): Promise<void>;

  // Advertising System
  getAdCampaigns(): Promise<AdCampaign[]>;
  createAdCampaign(campaign: InsertAdCampaign): Promise<AdCampaign>;
  updateAdCampaign(id: string, updates: Partial<AdCampaign>): Promise<void>;

  // Live Streaming Enhanced
  getLiveStreamSessions(): Promise<LiveStreamSession[]>;
  createLiveStreamSession(
    session: InsertLiveStreamSession,
  ): Promise<LiveStreamSession>;
  getPrivateShowRequests(): Promise<PrivateShowRequest[]>;
  createPrivateShowRequest(
    request: InsertPrivateShowRequest,
  ): Promise<PrivateShowRequest>;

  // Gift System
  getGiftCatalog(): Promise<GiftCatalog[]>;
  createGift(gift: InsertGiftCatalog): Promise<GiftCatalog>;
  createGiftTransaction(
    transaction: InsertGiftTransaction,
  ): Promise<GiftTransaction>;

  // User Deposits
  getUserDeposits(userId: string): Promise<UserDeposit[]>;
  createUserDeposit(deposit: InsertUserDeposit): Promise<UserDeposit>;

  // Countries Management
  getCountries(): Promise<Country[]>;
  getCountry(id: string): Promise<Country | undefined>;
  createCountry(country: InsertCountry): Promise<Country>;
  updateCountry(id: string, updates: Partial<Country>): Promise<void>;
  deleteCountry(id: string): Promise<void>;

  // States Management
  getStates(countryId?: string): Promise<State[]>;
  getState(id: string): Promise<State | undefined>;
  createState(state: InsertState): Promise<State>;
  updateState(id: string, updates: Partial<State>): Promise<void>;
  deleteState(id: string): Promise<void>;

  // Languages Management
  getLanguages(): Promise<Language[]>;
  getLanguage(id: string): Promise<Language | undefined>;
  createLanguage(language: InsertLanguage): Promise<Language>;
  updateLanguage(id: string, updates: Partial<Language>): Promise<void>;
  deleteLanguage(id: string): Promise<void>;

  // Cron Jobs Management
  getCronJobs(): Promise<CronJob[]>;
  getCronJob(id: string): Promise<CronJob | undefined>;
  createCronJob(cronJob: InsertCronJob): Promise<CronJob>;
  updateCronJob(id: string, updates: Partial<CronJob>): Promise<void>;
  deleteCronJob(id: string): Promise<void>;
  toggleCronJob(id: string, isActive: boolean): Promise<void>;
  runCronJob(id: string): Promise<void>;

  // Cron Job Logs
  getCronJobLogs(jobId?: string): Promise<CronJobLog[]>;
  createCronJobLog(log: InsertCronJobLog): Promise<CronJobLog>;
  deleteCronJobLogs(jobId: string): Promise<void>;

  // API Integrations Management
  getApiIntegrations(): Promise<ApiIntegration[]>;
  getApiIntegrationByService(
    serviceName: string,
  ): Promise<ApiIntegration | undefined>;
  createApiIntegration(data: InsertApiIntegration): Promise<ApiIntegration>;
  updateApiIntegration(
    id: string,
    updates: Partial<ApiIntegration>,
  ): Promise<void>;
  deleteApiIntegration(id: string): Promise<void>;

  // Live Streaming Private Requests
  getPrivateStreamRequests(): Promise<LiveStreamingPrivateRequest[]>;
  getPrivateStreamRequest(
    id: string,
  ): Promise<LiveStreamingPrivateRequest | undefined>;
  createPrivateStreamRequest(
    data: InsertLiveStreamingPrivateRequest,
  ): Promise<LiveStreamingPrivateRequest>;
  updatePrivateStreamRequest(
    id: string,
    updates: Partial<LiveStreamingPrivateRequest>,
  ): Promise<void>;
  deletePrivateStreamRequest(id: string): Promise<void>;

  // Maintenance Mode Management
  getMaintenanceMode(): Promise<MaintenanceMode | undefined>;
  updateMaintenanceMode(data: Partial<MaintenanceMode>): Promise<void>;

  // Enhanced Member Management
  getMemberProfiles(): Promise<MemberProfile[]>;
  getMemberProfile(id: string): Promise<MemberProfile | undefined>;
  getMemberProfileByUserId(userId: string): Promise<MemberProfile | undefined>;
  createMemberProfile(data: InsertMemberProfile): Promise<MemberProfile>;
  updateMemberProfile(
    id: string,
    updates: Partial<MemberProfile>,
  ): Promise<void>;
  deleteMemberProfile(id: string): Promise<void>;

  // Content Moderation Settings
  getModerationSettings(): Promise<ModerationSettings | undefined>;
  updateModerationSettings(data: Partial<ModerationSettings>): Promise<void>;

  // Platform Messages System
  getPlatformMessages(): Promise<PlatformMessage[]>;
  getPlatformMessage(id: string): Promise<PlatformMessage | undefined>;
  createPlatformMessage(data: InsertPlatformMessage): Promise<PlatformMessage>;
  updatePlatformMessage(
    id: string,
    updates: Partial<PlatformMessage>,
  ): Promise<void>;
  deletePlatformMessage(id: string): Promise<void>;
  markMessageAsRead(id: string): Promise<void>;

  // Payment Processor Settings
  getPaymentProcessorSettings(): Promise<PaymentProcessorSettings[]>;
  getPaymentProcessorSetting(
    id: string,
  ): Promise<PaymentProcessorSettings | undefined>;
  getPaymentProcessorByName(
    processorName: string,
  ): Promise<PaymentProcessorSettings | undefined>;
  createPaymentProcessorSettings(
    data: InsertPaymentProcessorSettings,
  ): Promise<PaymentProcessorSettings>;
  updatePaymentProcessorSettings(
    id: string,
    updates: Partial<PaymentProcessorSettings>,
  ): Promise<void>;
  deletePaymentProcessorSettings(id: string): Promise<void>;

  // System Limits Configuration
  getSystemLimits(): Promise<SystemLimit[]>;
  getSystemLimit(id: string): Promise<SystemLimit | undefined>;
  createSystemLimit(data: InsertSystemLimit): Promise<SystemLimit>;
  updateSystemLimit(id: string, updates: Partial<SystemLimit>): Promise<void>;
  deleteSystemLimit(id: string): Promise<void>;

  // RBAC System
  getRoles(): Promise<Role[]>;
  createRole(role: InsertRole): Promise<Role>;
  assignUserRole(userRole: InsertUserRole): Promise<UserRole>;
  getUserRoles(userId: string): Promise<UserRole[]>;

  // Announcements
  getAnnouncements(): Promise<Announcement[]>;
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;

  // CMS System
  getCmsPages(): Promise<CmsPage[]>;
  createCmsPage(page: InsertCmsPage): Promise<CmsPage>;
  updateCmsPage(id: string, updates: Partial<CmsPage>): Promise<void>;

  // Platform Limits
  getPlatformLimits(): Promise<PlatformLimit[]>;
  createPlatformLimit(limit: InsertPlatformLimit): Promise<PlatformLimit>;

  // Reserved Names
  getReservedNames(): Promise<ReservedName[]>;
  isNameReserved(name: string): Promise<boolean>;

  // System Settings
  getSystemSettings(): Promise<SystemSetting[]>;
  getSystemSetting(key: string): Promise<SystemSetting | undefined>;
  updateSystemSetting(key: string, value: string): Promise<void>;

  // Audio Calls
  createAudioCall(call: InsertAudioCall): Promise<AudioCall>;
  getAudioCalls(userId: string): Promise<AudioCall[]>;

  // Extended Payment Processors
  getExtendedPaymentProcessors(): Promise<ExtendedPaymentProcessor[]>;
  createExtendedPaymentProcessor(
    processor: InsertExtendedPaymentProcessor,
  ): Promise<ExtendedPaymentProcessor>;

  // Interactive functionality
  addPlatformConnection(connection: any): Promise<any>;
  removePlatformConnection(id: string): Promise<void>;
  updateUserRole(id: string, role: string): Promise<void>;
  updateSettings(settings: any): Promise<void>;
  createCrisisIncident(incident: any): Promise<any>;
  processAppeal(
    id: string,
    decision: string,
    reasoning: string,
    moderatorId: string,
  ): Promise<void>;
  addVaultFile(file: any): Promise<any>;
  searchAuditLogs(
    query: string,
    dateRange: string,
    actionType: string,
  ): Promise<any[]>;
  calculateModelPerformanceStats(analyses: any[]): any;

  // ===== ENTERPRISE MULTI-TENANT METHODS =====

  // Tenants management
  getTenants(): Promise<Tenant[]>;
  getTenant(id: string): Promise<Tenant | undefined>;
  getTenantBySlug(slug: string): Promise<Tenant | undefined>;
  createTenant(tenant: InsertTenant): Promise<Tenant>;
  updateTenant(id: string, updates: Partial<Tenant>): Promise<Tenant>;
  deleteTenant(id: string): Promise<void>;

  // Memberships management
  getMemberships(tenantId?: string, userId?: string): Promise<Membership[]>;
  getMembership(userId: string, tenantId: string): Promise<Membership | undefined>;
  createMembership(membership: InsertMembership): Promise<Membership>;
  updateMembership(id: string, updates: Partial<Membership>): Promise<Membership>;
  deleteMembership(id: string): Promise<void>;

  // Enhanced audit logging
  createAuditLog(auditLog: InsertAuditLog): Promise<AuditLog>;
  getAuditLogs(filters?: {
    tenantId?: string;
    actorId?: string;
    action?: string;
    targetType?: string;
    severity?: string;
    dateRange?: { from: Date; to: Date };
    limit?: number;
  }): Promise<AuditLog[]>;

  // KYC verification system
  getKycVerifications(userId?: string): Promise<KycVerification[]>;
  getKycVerification(id: string): Promise<KycVerification | undefined>;
  createKycVerification(kyc: InsertKycVerification): Promise<KycVerification>;
  updateKycVerification(id: string, updates: Partial<KycVerification>): Promise<KycVerification>;
  getKycStats(): Promise<{
    pending: number;
    verified: number;
    failed: number;
    expired: number;
  }>;

  // Payout management
  getPayoutRequests(filters?: {
    userId?: string;
    tenantId?: string;
    status?: string;
    limit?: number;
  }): Promise<PayoutRequest[]>;
  getPayoutRequest(id: string): Promise<PayoutRequest | undefined>;
  createPayoutRequest(payout: InsertPayoutRequest): Promise<PayoutRequest>;
  updatePayoutRequest(id: string, updates: Partial<PayoutRequest>): Promise<PayoutRequest>;
  getPayoutStats(): Promise<{
    pending: number;
    approved: number;
    processing: number;
    completed: number;
    failed: number;
    totalAmount: number;
  }>;

  // Ads management
  getAdCreatives(filters?: {
    advertiserId?: string;
    status?: string;
    limit?: number;
  }): Promise<AdCreative[]>;
  getAdCreative(id: string): Promise<AdCreative | undefined>;
  createAdCreative(creative: InsertAdCreative): Promise<AdCreative>;
  updateAdCreative(id: string, updates: Partial<AdCreative>): Promise<AdCreative>;
  deleteAdCreative(id: string): Promise<void>;

  getAdPlacements(platform?: string): Promise<AdPlacement[]>;
  getAdPlacement(id: string): Promise<AdPlacement | undefined>;
  createAdPlacement(placement: InsertAdPlacement): Promise<AdPlacement>;
  updateAdPlacement(id: string, updates: Partial<AdPlacement>): Promise<AdPlacement>;
  deleteAdPlacement(id: string): Promise<void>;

  getAdsStats(): Promise<{
    totalCreatives: number;
    pendingReview: number;
    activeCreatives: number;
    totalPlacements: number;
    totalRevenue: number;
    totalImpressions: number;
  }>;

  // Security events
  getSecurityEvents(filters?: {
    eventType?: string;
    severity?: string;
    userId?: string;
    tenantId?: string;
    resolved?: boolean;
    limit?: number;
  }): Promise<SecurityEvent[]>;
  createSecurityEvent(event: InsertSecurityEvent): Promise<SecurityEvent>;
  updateSecurityEvent(id: string, updates: Partial<SecurityEvent>): Promise<SecurityEvent>;
  getSecurityStats(): Promise<{
    totalEvents: number;
    criticalEvents: number;
    unresolved: number;
    last24Hours: number;
  }>;

  // OPA policies
  getOpaPolicies(filters?: {
    tenantId?: string;
    category?: string;
    active?: boolean;
  }): Promise<OpaPolicy[]>;
  getOpaPolicy(id: string): Promise<OpaPolicy | undefined>;
  createOpaPolicy(policy: InsertOpaPolicy): Promise<OpaPolicy>;
  updateOpaPolicy(id: string, updates: Partial<OpaPolicy>): Promise<OpaPolicy>;
  deleteOpaPolicy(id: string): Promise<void>;

  // Feature flags
  getGlobalFlags(filters?: {
    tenantId?: string;
    platform?: string;
    isKillSwitch?: boolean;
  }): Promise<GlobalFlag[]>;
  getGlobalFlag(flagKey: string, tenantId?: string, platform?: string): Promise<GlobalFlag | undefined>;
  createGlobalFlag(flag: InsertGlobalFlag): Promise<GlobalFlag>;
  updateGlobalFlag(id: string, updates: Partial<GlobalFlag>): Promise<GlobalFlag>;
  deleteGlobalFlag(id: string): Promise<void>;

  // Webhooks
  getWebhooks(tenantId?: string): Promise<Webhook[]>;
  getWebhook(id: string): Promise<Webhook | undefined>;
  createWebhook(webhook: InsertWebhook): Promise<Webhook>;
  updateWebhook(id: string, updates: Partial<Webhook>): Promise<Webhook>;
  deleteWebhook(id: string): Promise<void>;

  // API keys
  getApiKeys(filters?: {
    tenantId?: string;
    userId?: string;
    active?: boolean;
  }): Promise<ApiKey[]>;
  getApiKey(keyId: string): Promise<ApiKey | undefined>;
  createApiKey(apiKey: InsertApiKey): Promise<ApiKey>;
  updateApiKey(id: string, updates: Partial<ApiKey>): Promise<ApiKey>;
  deleteApiKey(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async getContentItem(id: string): Promise<ContentItem | undefined> {
    const [item] = await db
      .select()
      .from(contentItems)
      .where(eq(contentItems.id, id));
    return item || undefined;
  }

  async createContentItem(content: InsertContentItem): Promise<ContentItem> {
    const [item] = await db.insert(contentItems).values(content).returning();
    return item;
  }

  async updateContentStatus(
    id: string,
    status: string,
    moderatorId?: string,
  ): Promise<void> {
    await db
      .update(contentItems)
      .set({
        status,
        moderatorId,
        updatedAt: new Date(),
      })
      .where(eq(contentItems.id, id));
  }

  async getPendingContent(limit: number = 20): Promise<ContentItem[]> {
    return await db
      .select()
      .from(contentItems)
      .where(eq(contentItems.status, "pending"))
      .orderBy(desc(contentItems.createdAt))
      .limit(limit);
  }

  async createModerationResult(
    result: InsertModerationResult,
  ): Promise<ModerationResult> {
    const [moderationResult] = await db
      .insert(moderationResults)
      .values(result)
      .returning();
    return moderationResult;
  }

  async getModerationResults(contentId: string): Promise<ModerationResult[]> {
    return await db
      .select()
      .from(moderationResults)
      .where(eq(moderationResults.contentId, contentId))
      .orderBy(desc(moderationResults.createdAt));
  }

  async getLiveStreams(): Promise<LiveStream[]> {
    return await db
      .select()
      .from(liveStreams)
      .orderBy(desc(liveStreams.updatedAt));
  }

  async createLiveStream(stream: InsertLiveStream): Promise<LiveStream> {
    const [liveStream] = await db
      .insert(liveStreams)
      .values(stream)
      .returning();
    return liveStream;
  }

  async updateLiveStream(
    id: string,
    updates: Partial<LiveStream>,
  ): Promise<void> {
    await db
      .update(liveStreams)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(liveStreams.id, id));
  }

  async getModerationSettings(): Promise<ModerationSettings[]> {
    return await db
      .select()
      .from(moderationSettings)
      .orderBy(moderationSettings.type);
  }

  async updateModerationSettings(
    settings: InsertModerationSettings,
  ): Promise<void> {
    const existing = await db
      .select()
      .from(moderationSettings)
      .where(eq(moderationSettings.type, settings.type!))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(moderationSettings)
        .set({ ...settings, updatedAt: new Date() })
        .where(eq(moderationSettings.type, settings.type!));
    } else {
      await db.insert(moderationSettings).values(settings);
    }
  }

  // Audio Call Settings
  async getAudioCallSettings(): Promise<any> {
    const settings = await db.select().from(audioCallSettings).limit(1);

    if (settings.length > 0) {
      return settings[0];
    }

    // Return default settings if none exist
    return {
      audioCallStatus: false,
      agoraAppId: null,
      audioCallMinPrice: 1,
      audioCallMaxPrice: 100,
      audioCallMaxDuration: 60,
    };
  }

  async updateAudioCallSettings(settings: any): Promise<void> {
    const existing = await db.select().from(audioCallSettings).limit(1);

    if (existing.length > 0) {
      await db
        .update(audioCallSettings)
        .set({ ...settings, updatedAt: new Date() })
        .where(eq(audioCallSettings.id, existing[0].id));
    } else {
      await db.insert(audioCallSettings).values(settings);
    }
  }

  async getAppealRequests(): Promise<AppealRequest[]> {
    return await db
      .select()
      .from(appealRequests)
      .orderBy(desc(appealRequests.createdAt));
  }

  async createAppealRequest(
    appeal: InsertAppealRequest,
  ): Promise<AppealRequest> {
    const [appealRequest] = await db
      .insert(appealRequests)
      .values(appeal)
      .returning();
    return appealRequest;
  }

  async updateAppealRequest(
    id: string,
    updates: Partial<AppealRequest>,
  ): Promise<void> {
    await db
      .update(appealRequests)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(appealRequests.id, id));
  }

  async getDashboardStats(): Promise<{
    reviewedToday: number;
    autoBlocked: number;
    pendingReview: number;
    liveStreams: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    const [reviewedToday] = await db
      .select({ count: count() })
      .from(contentItems)
      .where(
        and(
          or(
            eq(contentItems.status, "approved"),
            eq(contentItems.status, "rejected"),
          ),
          sql`${contentItems.updatedAt} >= ${todayISO}`,
        ),
      );

    const [autoBlocked] = await db
      .select({ count: count() })
      .from(contentItems)
      .where(
        and(
          eq(contentItems.status, "auto_blocked"),
          sql`${contentItems.createdAt} >= ${todayISO}`,
        ),
      );

    const [pendingReview] = await db
      .select({ count: count() })
      .from(contentItems)
      .where(eq(contentItems.status, "pending"));

    const [activeStreams] = await db
      .select({ count: count() })
      .from(liveStreams)
      .where(eq(liveStreams.status, "live"));

    return {
      reviewedToday: reviewedToday.count,
      autoBlocked: autoBlocked.count,
      pendingReview: pendingReview.count,
      liveStreams: activeStreams.count,
    };
  }

  async getUserStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    newUsersToday: number;
    verifiedUsers: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalUsers] = await db
      .select({ count: count() })
      .from(users);

    const [newUsersToday] = await db
      .select({ count: count() })
      .from(users)
      .where(sql`${users.createdAt} >= ${today.toISOString()}`);

    const [verifiedUsers] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.isActive, true));

    return {
      totalUsers: totalUsers.count,
      activeUsers: totalUsers.count, // For now, treat all users as active
      newUsersToday: newUsersToday.count,
      verifiedUsers: verifiedUsers.count,
    };
  }

  async getContentStats(): Promise<{
    totalContent: number;
    pendingModeration: number;
    approvedContent: number;
    blockedContent: number;
  }> {
    const [totalContent] = await db
      .select({ count: count() })
      .from(contentItems);

    const [pendingModeration] = await db
      .select({ count: count() })
      .from(contentItems)
      .where(eq(contentItems.status, "pending"));

    const [approvedContent] = await db
      .select({ count: count() })
      .from(contentItems)
      .where(eq(contentItems.status, "approved"));

    const [blockedContent] = await db
      .select({ count: count() })
      .from(contentItems)
      .where(
        or(
          eq(contentItems.status, "rejected"),
          eq(contentItems.status, "auto_blocked")
        )
      );

    return {
      totalContent: totalContent.count,
      pendingModeration: pendingModeration.count,
      approvedContent: approvedContent.count,
      blockedContent: blockedContent.count,
    };
  }

  async getModerationStats(): Promise<{
    totalActions: number;
    automatedActions: number;
    manualActions: number;
    appealsToday: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalActions] = await db
      .select({ count: count() })
      .from(moderationResults);

    const [automatedActions] = await db
      .select({ count: count() })
      .from(moderationResults)
      .where(
        or(
          eq(moderationResults.modelType, "nudenet"),
          eq(moderationResults.modelType, "detoxify"),
          eq(moderationResults.modelType, "pdq_hash")
        )
      );

    const [manualActions] = await db
      .select({ count: count() })
      .from(moderationResults)
      .where(eq(moderationResults.modelType, "manual"));

    const [appealsToday] = await db
      .select({ count: count() })
      .from(appealRequests)
      .where(sql`${appealRequests.createdAt} >= ${today}`);

    return {
      totalActions: totalActions.count,
      automatedActions: automatedActions.count,
      manualActions: manualActions.count,
      appealsToday: appealsToday.count,
    };
  }

  // Multi-platform operations (temporary mock implementation)
  async getAllPlatforms(): Promise<any[]> {
    return [
      {
        id: "platform-1",
        name: "FanzMain Adult",
        domain: "main.myfanz.network",
        niche: "adult_content",
        status: "active",
        apiEndpoint: "https://api.main.myfanz.network/v1",
        webhookUrl: "https://webhooks.main.myfanz.network/moderation",
        moderationRules: {
          autoBlock: true,
          riskThreshold: 0.7,
          requireManualReview: false,
          allowedContentTypes: ["image", "video", "text"],
          blockedKeywords: [],
          customRules: [],
        },
        stats: {
          totalContent: 15847,
          dailyContent: 234,
          blockedContent: 89,
          flaggedContent: 23,
          lastSync: new Date().toISOString(),
        },
        createdAt: "2024-01-10T10:00:00Z",
        lastActive: new Date().toISOString(),
      },
      {
        id: "platform-2",
        name: "FanzLive Streaming",
        domain: "live.myfanz.network",
        niche: "live_streaming",
        status: "active",
        apiEndpoint: "https://api.live.myfanz.network/v1",
        webhookUrl: "https://webhooks.live.myfanz.network/moderation",
        moderationRules: {
          autoBlock: false,
          riskThreshold: 0.8,
          requireManualReview: true,
          allowedContentTypes: ["live_stream", "video"],
          blockedKeywords: [],
          customRules: [],
        },
        stats: {
          totalContent: 8934,
          dailyContent: 167,
          blockedContent: 34,
          flaggedContent: 12,
          lastSync: new Date().toISOString(),
        },
        createdAt: "2024-01-12T14:00:00Z",
        lastActive: new Date().toISOString(),
      },
      {
        id: "platform-3",
        name: "FanzSocial Community",
        domain: "social.myfanz.network",
        niche: "social_media",
        status: "active",
        apiEndpoint: "https://api.social.myfanz.network/v1",
        webhookUrl: "https://webhooks.social.myfanz.network/moderation",
        moderationRules: {
          autoBlock: true,
          riskThreshold: 0.6,
          requireManualReview: false,
          allowedContentTypes: ["text", "image"],
          blockedKeywords: ["spam", "harassment"],
          customRules: [],
        },
        stats: {
          totalContent: 32156,
          dailyContent: 456,
          blockedContent: 123,
          flaggedContent: 67,
          lastSync: new Date().toISOString(),
        },
        createdAt: "2024-01-08T09:00:00Z",
        lastActive: new Date().toISOString(),
      },
    ];
  }

  async createPlatform(platformData: any): Promise<any> {
    const platform = {
      id: `platform-${Date.now()}`,
      ...platformData,
      status: "active",
      moderationRules: {
        autoBlock: platformData.autoBlock || false,
        riskThreshold: platformData.riskThreshold || 0.7,
        requireManualReview: platformData.requireManualReview || false,
        allowedContentTypes: ["image", "video", "text", "live_stream"],
        blockedKeywords: [],
        customRules: [],
      },
      stats: {
        totalContent: 0,
        dailyContent: 0,
        blockedContent: 0,
        flaggedContent: 0,
        lastSync: new Date().toISOString(),
      },
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
    };
    return platform;
  }

  async updatePlatform(id: string, updates: any): Promise<any> {
    return { id, ...updates, updatedAt: new Date().toISOString() };
  }

  async testPlatformConnection(platformId: string): Promise<any> {
    const latency = Math.floor(Math.random() * 200) + 50;
    const success = Math.random() > 0.1;

    return {
      success,
      latency,
      timestamp: new Date().toISOString(),
      error: success ? undefined : "Connection timeout",
    };
  }

  async getPlatformConnections(): Promise<any[]> {
    return [
      {
        id: "conn-1",
        platformId: "platform-1",
        connectionType: "webhook",
        status: "connected",
        lastHeartbeat: new Date().toISOString(),
        latency: 145,
        errorCount: 0,
      },
      {
        id: "conn-2",
        platformId: "platform-2",
        connectionType: "api",
        status: "connected",
        lastHeartbeat: new Date().toISOString(),
        latency: 89,
        errorCount: 0,
      },
      {
        id: "conn-3",
        platformId: "platform-3",
        connectionType: "webhook",
        status: "connected",
        lastHeartbeat: new Date().toISOString(),
        latency: 67,
        errorCount: 0,
      },
    ];
  }

  async getPlatformStats(): Promise<any> {
    return {
      totalPlatforms: 3,
      activePlatforms: 3,
      totalContent: 56937,
      flaggedContent: 102,
      avgResponseTime: 134,
      uptime: 99.9,
    };
  }

  async getRecentAnalysis(limit: number = 50): Promise<any[]> {
    return Array.from({ length: Math.min(limit, 20) }, (_, i) => ({
      id: `analysis-${i}`,
      contentId: `content-${i}`,
      analysisType: "chatgpt-4o",
      confidence: (Math.random() * 0.4 + 0.6).toFixed(4),
      result: {
        riskScore: Math.random(),
        flaggedContent: Math.random() > 0.7 ? ["explicit_content"] : [],
        recommendations:
          Math.random() > 0.7 ? ["Block content"] : ["Approve content"],
      },
      processingTime: Math.floor(Math.random() * 2000) + 500,
      modelVersion: "gpt-4o",
      createdAt: new Date(Date.now() - i * 60000).toISOString(),
      platformName: [
        "FanzMain Adult",
        "FanzLive Streaming",
        "FanzSocial Community",
      ][i % 3],
      contentType: ["image", "video", "text", "live_stream"][i % 4],
    }));
  }

  async processContentAnalysis(request: any): Promise<any> {
    const riskScore = Math.random();
    const confidence = Math.random() * 0.4 + 0.6;

    return {
      analysisId: `analysis-${Date.now()}`,
      riskScore,
      confidence,
      recommendations:
        riskScore > 0.7 ? ["Block content"] : ["Approve content"],
      processingTime: Math.floor(Math.random() * 2000) + 500,
      flaggedContent: riskScore > 0.7 ? ["explicit_content"] : [],
    };
  }

  // AI Analysis operations implementation

  calculateModelPerformanceStats(analyses: any[]): any {
    if (!analyses || analyses.length === 0) {
      return {};
    }

    const modelGroups = analyses.reduce(
      (acc: Record<string, any[]>, analysis: any) => {
        const modelType = analysis.analysisType;
        if (!acc[modelType]) {
          acc[modelType] = [];
        }
        acc[modelType].push(analysis);
        return acc;
      },
      {} as Record<string, any[]>,
    );

    const stats: Record<string, any> = {};

    Object.entries(modelGroups).forEach(
      ([modelType, modelAnalyses]: [string, any[]]) => {
        const totalAnalyses = modelAnalyses.length;
        const avgSpeed = Math.round(
          modelAnalyses.reduce(
            (sum: number, a: any) => sum + (a.processingTime || 0),
            0,
          ) / totalAnalyses,
        );

        // Calculate accuracy based on confidence scores
        const avgConfidence =
          modelAnalyses.reduce(
            (sum: number, a: any) => sum + (a.confidence || 0),
            0,
          ) / totalAnalyses;
        const accuracy = Math.round(avgConfidence * 100);

        const status =
          accuracy > 95
            ? "optimal"
            : accuracy > 90
              ? "excellent"
              : accuracy > 85
                ? "good"
                : "needs_review";

        stats[modelType.replace("-", "")] = {
          accuracy,
          avgSpeed,
          status,
          count: totalAnalyses,
        };
      },
    );

    return stats;
  }
  // Interactive functionality methods
  async createAnalysisResult(data: {
    contentUrl: string;
    contentType: string;
    result: any;
    analysisType: string;
    confidence: number;
    processingTime: number;
  }): Promise<any> {
    const analysisResult = {
      id: `analysis-${Date.now()}`,
      ...data,
      createdAt: new Date().toISOString(),
    };
    return analysisResult;
  }

  async getRecentAnalysisResults(limit: number): Promise<any[]> {
    return Array.from({ length: Math.min(limit, 10) }, (_, i) => ({
      id: `analysis-${Date.now() - i * 1000}`,
      contentType: ["image", "text", "video"][Math.floor(Math.random() * 3)],
      riskScore: Math.random(),
      confidence: Math.random() * 0.3 + 0.7,
      createdAt: new Date(Date.now() - i * 60000).toISOString(),
    }));
  }

  async addPlatformConnection(connection: any): Promise<any> {
    return { ...connection, id: connection.id || `conn-${Date.now()}` };
  }

  async removePlatformConnection(id: string): Promise<void> {
    console.log(`Removed platform connection: ${id}`);
  }

  async updateUserRole(id: string, role: string): Promise<void> {
    console.log(`Updated user ${id} role to: ${role}`);
  }

  async updateSettings(settings: any): Promise<void> {
    console.log("Updated settings:", settings);
  }

  async createCrisisIncident(incident: any): Promise<any> {
    return { ...incident, id: incident.id || `incident-${Date.now()}` };
  }

  async processAppeal(
    id: string,
    decision: string,
    reasoning: string,
    moderatorId: string,
  ): Promise<void> {
    console.log(`Processed appeal ${id}: ${decision} by ${moderatorId}`);
  }

  async addVaultFile(file: any): Promise<any> {
    return { ...file, id: file.id || `vault-${Date.now()}` };
  }

  async searchAuditLogs(
    query: string,
    dateRange: string,
    actionType: string,
  ): Promise<any[]> {
    return [
      {
        id: `audit-${Date.now()}`,
        action: actionType || "search_performed",
        user: "current-user",
        query,
        dateRange,
        timestamp: new Date().toISOString(),
      },
    ];
  }

  // Payment Processor operations
  async getPaymentProcessors(): Promise<PaymentProcessor[]> {
    return await db
      .select()
      .from(paymentProcessors)
      .where(eq(paymentProcessors.isBanned, false))
      .orderBy(paymentProcessors.name);
  }

  async createPaymentProcessor(
    processor: InsertPaymentProcessor,
  ): Promise<PaymentProcessor> {
    const [result] = await db
      .insert(paymentProcessors)
      .values(processor)
      .returning();
    return result;
  }

  async createPaymentTransaction(
    transaction: InsertPaymentTransaction,
  ): Promise<PaymentTransaction> {
    const [result] = await db
      .insert(paymentTransactions)
      .values(transaction)
      .returning();
    return result;
  }

  // GetStream operations
  async createStreamToken(token: InsertStreamToken): Promise<StreamToken> {
    const [result] = await db.insert(streamTokens).values(token).returning();
    return result;
  }

  async createStreamChannel(
    channel: InsertStreamChannel,
  ): Promise<StreamChannel> {
    const [result] = await db
      .insert(streamChannels)
      .values(channel)
      .returning();
    return result;
  }

  // Coconut Encoding operations
  async createEncodingJob(job: InsertEncodingJob): Promise<EncodingJob> {
    const [result] = await db.insert(encodingJobs).values(job).returning();
    return result;
  }

  async getEncodingJob(id: string): Promise<EncodingJob | undefined> {
    const [job] = await db
      .select()
      .from(encodingJobs)
      .where(eq(encodingJobs.id, id));
    return job || undefined;
  }

  async updateEncodingJobStatus(jobId: string, updates: any): Promise<void> {
    await db
      .update(encodingJobs)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(encodingJobs.coconutJobId, jobId));
  }

  // AI Companion operations
  async createAICompanion(companion: InsertAICompanion): Promise<AICompanion> {
    const [result] = await db
      .insert(aiCompanions)
      .values(companion)
      .returning();
    return result;
  }

  async getAICompanion(id: string): Promise<AICompanion | undefined> {
    const [companion] = await db
      .select()
      .from(aiCompanions)
      .where(eq(aiCompanions.id, id));
    return companion || undefined;
  }

  // VR/WebXR operations
  async createVRSession(session: InsertVRSession): Promise<VRSession> {
    const [result] = await db.insert(vrSessions).values(session).returning();
    return result;
  }

  async createWebRTCRoom(room: InsertWebRTCRoom): Promise<WebRTCRoom> {
    const [result] = await db.insert(webrtcRooms).values(room).returning();
    return result;
  }

  // Geo-Collaboration operations
  async createGeoCollaboration(
    collaboration: InsertGeoCollaboration,
  ): Promise<GeoCollaboration> {
    const [result] = await db
      .insert(geoCollaborations)
      .values(collaboration)
      .returning();
    return result;
  }

  async getNearbyCollaborations(
    lat: number,
    lng: number,
    radius: number,
  ): Promise<GeoCollaboration[]> {
    // For now, return all collaborations (in production, use PostGIS for geo queries)
    return await db
      .select()
      .from(geoCollaborations)
      .where(eq(geoCollaborations.status, "open"))
      .orderBy(desc(geoCollaborations.createdAt))
      .limit(50);
  }

  // Tax Management implementation
  async getTaxRates(): Promise<TaxRate[]> {
    return await db
      .select()
      .from(taxRates)
      .where(eq(taxRates.isActive, true))
      .orderBy(taxRates.country, taxRates.state);
  }

  async createTaxRate(rate: InsertTaxRate): Promise<TaxRate> {
    const [result] = await db.insert(taxRates).values(rate).returning();
    return result;
  }

  async updateTaxRate(id: string, updates: Partial<TaxRate>): Promise<void> {
    await db
      .update(taxRates)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(taxRates.id, id));
  }

  // Advertising System implementation
  async getAdCampaigns(): Promise<AdCampaign[]> {
    return await db
      .select()
      .from(adCampaigns)
      .orderBy(desc(adCampaigns.createdAt));
  }

  async createAdCampaign(campaign: InsertAdCampaign): Promise<AdCampaign> {
    const [result] = await db.insert(adCampaigns).values(campaign).returning();
    return result;
  }

  async updateAdCampaign(
    id: string,
    updates: Partial<AdCampaign>,
  ): Promise<void> {
    await db
      .update(adCampaigns)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(adCampaigns.id, id));
  }

  // Live Streaming Enhanced implementation
  async getLiveStreamSessions(): Promise<LiveStreamSession[]> {
    return await db
      .select()
      .from(liveStreamSessions)
      .orderBy(desc(liveStreamSessions.createdAt));
  }

  async createLiveStreamSession(
    session: InsertLiveStreamSession,
  ): Promise<LiveStreamSession> {
    const [result] = await db
      .insert(liveStreamSessions)
      .values(session)
      .returning();
    return result;
  }

  async getPrivateShowRequests(): Promise<PrivateShowRequest[]> {
    return await db
      .select()
      .from(privateShowRequests)
      .orderBy(desc(privateShowRequests.createdAt));
  }

  async createPrivateShowRequest(
    request: InsertPrivateShowRequest,
  ): Promise<PrivateShowRequest> {
    const [result] = await db
      .insert(privateShowRequests)
      .values(request)
      .returning();
    return result;
  }

  // Gift System implementation
  async getGiftCatalog(): Promise<GiftCatalog[]> {
    return await db
      .select()
      .from(giftCatalog)
      .where(eq(giftCatalog.isActive, true))
      .orderBy(giftCatalog.category, giftCatalog.price);
  }

  async createGift(gift: InsertGiftCatalog): Promise<GiftCatalog> {
    const [result] = await db.insert(giftCatalog).values(gift).returning();
    return result;
  }

  async createGiftTransaction(
    transaction: InsertGiftTransaction,
  ): Promise<GiftTransaction> {
    const [result] = await db
      .insert(giftTransactions)
      .values(transaction)
      .returning();
    return result;
  }

  // User Deposits implementation (initial)
  async createUserDeposit(deposit: InsertUserDeposit): Promise<UserDeposit> {
    const [result] = await db.insert(userDeposits).values(deposit).returning();
    return result;
  }

  // RBAC System implementation
  async getRoles(): Promise<Role[]> {
    return await db
      .select()
      .from(roles)
      .where(eq(roles.isActive, true))
      .orderBy(roles.name);
  }

  async createRole(role: InsertRole): Promise<Role> {
    const [result] = await db.insert(roles).values(role).returning();
    return result;
  }

  async assignUserRole(userRole: InsertUserRole): Promise<UserRole> {
    const [result] = await db.insert(userRoles).values(userRole).returning();
    return result;
  }

  async getUserRoles(userId: string): Promise<UserRole[]> {
    return await db
      .select()
      .from(userRoles)
      .where(eq(userRoles.userId, userId));
  }

  // Announcements implementation
  async getAnnouncements(): Promise<Announcement[]> {
    return await db
      .select()
      .from(announcements)
      .where(eq(announcements.isActive, true))
      .orderBy(desc(announcements.priority), desc(announcements.createdAt));
  }

  async createAnnouncement(
    announcement: InsertAnnouncement,
  ): Promise<Announcement> {
    const [result] = await db
      .insert(announcements)
      .values(announcement)
      .returning();
    return result;
  }

  // CMS System implementation
  async getCmsPages(): Promise<CmsPage[]> {
    return await db.select().from(cmsPages).orderBy(desc(cmsPages.updatedAt));
  }

  async createCmsPage(page: InsertCmsPage): Promise<CmsPage> {
    const [result] = await db.insert(cmsPages).values(page).returning();
    return result;
  }

  async updateCmsPage(id: string, updates: Partial<CmsPage>): Promise<void> {
    await db
      .update(cmsPages)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(cmsPages.id, id));
  }

  // Platform Limits implementation
  async getPlatformLimits(): Promise<PlatformLimit[]> {
    return await db
      .select()
      .from(platformLimits)
      .where(eq(platformLimits.isActive, true))
      .orderBy(platformLimits.limitType, platformLimits.userRole);
  }

  async createPlatformLimit(
    limit: InsertPlatformLimit,
  ): Promise<PlatformLimit> {
    const [result] = await db.insert(platformLimits).values(limit).returning();
    return result;
  }

  // Reserved Names implementation
  async getReservedNames(): Promise<ReservedName[]> {
    return await db
      .select()
      .from(reservedNames)
      .where(eq(reservedNames.isActive, true))
      .orderBy(reservedNames.category, reservedNames.name);
  }

  async isNameReserved(name: string): Promise<boolean> {
    const [result] = await db
      .select()
      .from(reservedNames)
      .where(
        and(
          eq(reservedNames.name, name.toLowerCase()),
          eq(reservedNames.isActive, true),
        ),
      )
      .limit(1);
    return !!result;
  }

  // System Settings implementation
  async getSystemSettings(): Promise<SystemSetting[]> {
    return await db
      .select()
      .from(systemSettings)
      .orderBy(systemSettings.category, systemSettings.key);
  }

  async getSystemSetting(key: string): Promise<SystemSetting | undefined> {
    const [setting] = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.key, key))
      .limit(1);
    return setting || undefined;
  }

  async updateSystemSetting(key: string, value: string): Promise<void> {
    const existing = await this.getSystemSetting(key);
    if (existing) {
      await db
        .update(systemSettings)
        .set({ value, updatedAt: new Date() })
        .where(eq(systemSettings.key, key));
    } else {
      await db
        .insert(systemSettings)
        .values({ key, value, category: "general" });
    }
  }

  // Audio Calls implementation
  async createAudioCall(call: InsertAudioCall): Promise<AudioCall> {
    const [result] = await db.insert(audioCalls).values(call).returning();
    return result;
  }

  async getAudioCalls(userId: string): Promise<AudioCall[]> {
    return await db
      .select()
      .from(audioCalls)
      .where(
        or(eq(audioCalls.callerId, userId), eq(audioCalls.receiverId, userId)),
      )
      .orderBy(desc(audioCalls.createdAt));
  }

  // Blog Posts implementation
  async getBlogPosts(): Promise<BlogPost[]> {
    return await db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt));
  }

  async getBlogPost(id: string): Promise<BlogPost | undefined> {
    const [post] = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.id, id))
      .limit(1);
    return post || undefined;
  }

  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    const [result] = await db.insert(blogPosts).values(post).returning();
    return result;
  }

  async updateBlogPost(id: string, updates: Partial<BlogPost>): Promise<void> {
    await db
      .update(blogPosts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(blogPosts.id, id));
  }

  async deleteBlogPost(id: string): Promise<void> {
    await db.delete(blogPosts).where(eq(blogPosts.id, id));
  }

  // User Deposits implementation
  async getUserDeposits(searchQuery?: string): Promise<UserDeposit[]> {
    if (searchQuery) {
      return await db
        .select()
        .from(userDeposits)
        .where(
          or(
            sql`${userDeposits.transactionId} ILIKE ${`%${searchQuery}%`}`,
            sql`${userDeposits.id} ILIKE ${`%${searchQuery}%`}`,
          ),
        )
        .orderBy(desc(userDeposits.createdAt));
    }

    return await db
      .select()
      .from(userDeposits)
      .orderBy(desc(userDeposits.createdAt));
  }

  async getUserDeposit(id: string): Promise<UserDeposit | undefined> {
    const [deposit] = await db
      .select()
      .from(userDeposits)
      .where(eq(userDeposits.id, id))
      .limit(1);
    return deposit || undefined;
  }

  async approveUserDeposit(id: string): Promise<void> {
    await db
      .update(userDeposits)
      .set({ status: "completed", updatedAt: new Date() })
      .where(eq(userDeposits.id, id));
  }

  async deleteUserDeposit(id: string): Promise<void> {
    await db.delete(userDeposits).where(eq(userDeposits.id, id));
  }

  // Countries implementation
  async getCountries(): Promise<Country[]> {
    return await db.select().from(countries).orderBy(countries.countryName);
  }

  async createCountry(country: InsertCountry): Promise<Country> {
    const [result] = await db.insert(countries).values(country).returning();
    return result;
  }

  async updateCountry(id: string, updates: Partial<Country>): Promise<void> {
    await db
      .update(countries)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(countries.id, id));
  }

  async getCountry(id: string): Promise<Country | undefined> {
    const [country] = await db
      .select()
      .from(countries)
      .where(eq(countries.id, id))
      .limit(1);
    return country || undefined;
  }

  async deleteCountry(id: string): Promise<void> {
    await db.delete(countries).where(eq(countries.id, id));
  }

  // States implementation
  async getStates(countryId?: string): Promise<State[]> {
    if (countryId) {
      return await db
        .select()
        .from(states)
        .where(eq(states.countryId, countryId))
        .orderBy(states.stateName);
    }
    return await db.select().from(states).orderBy(states.stateName);
  }

  async getState(id: string): Promise<State | undefined> {
    const [state] = await db
      .select()
      .from(states)
      .where(eq(states.id, id))
      .limit(1);
    return state || undefined;
  }

  async createState(state: InsertState): Promise<State> {
    const [result] = await db.insert(states).values(state).returning();
    return result;
  }

  async updateState(id: string, updates: Partial<State>): Promise<void> {
    await db
      .update(states)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(states.id, id));
  }

  async deleteState(id: string): Promise<void> {
    await db.delete(states).where(eq(states.id, id));
  }

  // Languages implementation
  async getLanguages(): Promise<Language[]> {
    return await db.select().from(languages).orderBy(languages.languageName);
  }

  async getLanguage(id: string): Promise<Language | undefined> {
    const [language] = await db
      .select()
      .from(languages)
      .where(eq(languages.id, id))
      .limit(1);
    return language || undefined;
  }

  async createLanguage(language: InsertLanguage): Promise<Language> {
    const [result] = await db.insert(languages).values(language).returning();
    return result;
  }

  async updateLanguage(id: string, updates: Partial<Language>): Promise<void> {
    await db
      .update(languages)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(languages.id, id));
  }

  async deleteLanguage(id: string): Promise<void> {
    await db.delete(languages).where(eq(languages.id, id));
  }

  // Extended Payment Processors implementation
  async getExtendedPaymentProcessors(): Promise<ExtendedPaymentProcessor[]> {
    return await db
      .select()
      .from(extendedPaymentProcessors)
      .where(
        and(
          eq(extendedPaymentProcessors.isBanned, false),
          eq(extendedPaymentProcessors.adultFriendly, true),
        ),
      )
      .orderBy(
        extendedPaymentProcessors.region,
        extendedPaymentProcessors.name,
      );
  }

  async createExtendedPaymentProcessor(
    processor: InsertExtendedPaymentProcessor,
  ): Promise<ExtendedPaymentProcessor> {
    const [result] = await db
      .insert(extendedPaymentProcessors)
      .values(processor)
      .returning();
    return result;
  }

  // Cron Jobs implementation
  async getCronJobs(): Promise<CronJob[]> {
    return await db.select().from(cronJobs).orderBy(cronJobs.name);
  }

  async getCronJob(id: string): Promise<CronJob | undefined> {
    const [job] = await db
      .select()
      .from(cronJobs)
      .where(eq(cronJobs.id, id))
      .limit(1);
    return job || undefined;
  }

  async createCronJob(cronJob: InsertCronJob): Promise<CronJob> {
    const [result] = await db.insert(cronJobs).values(cronJob).returning();
    return result;
  }

  async updateCronJob(id: string, updates: Partial<CronJob>): Promise<void> {
    await db
      .update(cronJobs)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(cronJobs.id, id));
  }

  async deleteCronJob(id: string): Promise<void> {
    // Delete associated logs first
    await db.delete(cronJobLogs).where(eq(cronJobLogs.jobId, id));

    // Delete the job
    await db.delete(cronJobs).where(eq(cronJobs.id, id));
  }

  async toggleCronJob(id: string, isActive: boolean): Promise<void> {
    await db
      .update(cronJobs)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(cronJobs.id, id));
  }

  async runCronJob(id: string): Promise<void> {
    // Update running status and last run time
    await db
      .update(cronJobs)
      .set({
        isRunning: true,
        lastRunAt: new Date(),
        retryCount: 0,
        updatedAt: new Date(),
      })
      .where(eq(cronJobs.id, id));
  }

  // Cron Job Logs implementation
  async getCronJobLogs(jobId?: string): Promise<CronJobLog[]> {
    const query = db
      .select()
      .from(cronJobLogs)
      .orderBy(desc(cronJobLogs.startedAt))
      .limit(100);

    if (jobId) {
      return await query.where(eq(cronJobLogs.jobId, jobId));
    }

    return await query;
  }

  async createCronJobLog(log: InsertCronJobLog): Promise<CronJobLog> {
    const [result] = await db.insert(cronJobLogs).values(log).returning();
    return result;
  }

  async deleteCronJobLogs(jobId: string): Promise<void> {
    await db.delete(cronJobLogs).where(eq(cronJobLogs.jobId, jobId));
  }

  // API Integrations implementation
  async getApiIntegrations(): Promise<ApiIntegration[]> {
    return await db
      .select()
      .from(apiIntegrations)
      .orderBy(apiIntegrations.serviceName);
  }

  async getApiIntegrationByService(
    serviceName: string,
  ): Promise<ApiIntegration | undefined> {
    const [result] = await db
      .select()
      .from(apiIntegrations)
      .where(eq(apiIntegrations.serviceName, serviceName))
      .limit(1);
    return result;
  }

  async createApiIntegration(
    data: InsertApiIntegration,
  ): Promise<ApiIntegration> {
    const [result] = await db.insert(apiIntegrations).values(data).returning();
    return result;
  }

  async updateApiIntegration(
    id: string,
    updates: Partial<ApiIntegration>,
  ): Promise<void> {
    await db
      .update(apiIntegrations)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(apiIntegrations.id, id));
  }

  async deleteApiIntegration(id: string): Promise<void> {
    await db.delete(apiIntegrations).where(eq(apiIntegrations.id, id));
  }

  // Live Streaming Private Requests implementation
  async getPrivateStreamRequests(): Promise<LiveStreamingPrivateRequest[]> {
    return await db
      .select()
      .from(liveStreamingPrivateRequests)
      .orderBy(desc(liveStreamingPrivateRequests.createdAt));
  }

  async getPrivateStreamRequest(
    id: string,
  ): Promise<LiveStreamingPrivateRequest | undefined> {
    const [result] = await db
      .select()
      .from(liveStreamingPrivateRequests)
      .where(eq(liveStreamingPrivateRequests.id, id))
      .limit(1);
    return result;
  }

  async createPrivateStreamRequest(
    data: InsertLiveStreamingPrivateRequest,
  ): Promise<LiveStreamingPrivateRequest> {
    const [result] = await db
      .insert(liveStreamingPrivateRequests)
      .values(data)
      .returning();
    return result;
  }

  async updatePrivateStreamRequest(
    id: string,
    updates: Partial<LiveStreamingPrivateRequest>,
  ): Promise<void> {
    await db
      .update(liveStreamingPrivateRequests)
      .set(updates)
      .where(eq(liveStreamingPrivateRequests.id, id));
  }

  async deletePrivateStreamRequest(id: string): Promise<void> {
    await db
      .delete(liveStreamingPrivateRequests)
      .where(eq(liveStreamingPrivateRequests.id, id));
  }

  // Maintenance Mode implementation
  async getMaintenanceMode(): Promise<MaintenanceMode | undefined> {
    const [result] = await db.select().from(maintenanceMode).limit(1);
    return result;
  }

  async updateMaintenanceMode(data: Partial<MaintenanceMode>): Promise<void> {
    const existing = await this.getMaintenanceMode();
    if (existing) {
      await db
        .update(maintenanceMode)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(maintenanceMode.id, existing.id));
    } else {
      await db.insert(maintenanceMode).values(data as InsertMaintenanceMode);
    }
  }

  // Enhanced Member Management implementation
  async getMemberProfiles(): Promise<MemberProfile[]> {
    return await db
      .select()
      .from(memberProfiles)
      .orderBy(desc(memberProfiles.createdAt));
  }

  async getMemberProfile(id: string): Promise<MemberProfile | undefined> {
    const [result] = await db
      .select()
      .from(memberProfiles)
      .where(eq(memberProfiles.id, id))
      .limit(1);
    return result;
  }

  async getMemberProfileByUserId(
    userId: string,
  ): Promise<MemberProfile | undefined> {
    const [result] = await db
      .select()
      .from(memberProfiles)
      .where(eq(memberProfiles.userId, userId))
      .limit(1);
    return result;
  }

  async createMemberProfile(data: InsertMemberProfile): Promise<MemberProfile> {
    const [result] = await db.insert(memberProfiles).values(data).returning();
    return result;
  }

  async updateMemberProfile(
    id: string,
    updates: Partial<MemberProfile>,
  ): Promise<void> {
    await db
      .update(memberProfiles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(memberProfiles.id, id));
  }

  async deleteMemberProfile(id: string): Promise<void> {
    await db.delete(memberProfiles).where(eq(memberProfiles.id, id));
  }

  // Content Moderation Settings implementation
  async getCurrentModerationSettings(): Promise<ModerationSettings | undefined> {
    const [result] = await db.select().from(moderationSettings).limit(1);
    return result;
  }

  async updateCurrentModerationSettings(
    data: Partial<ModerationSettings>,
  ): Promise<void> {
    const existing = await this.getCurrentModerationSettings();
    if (existing) {
      await db
        .update(moderationSettings)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(moderationSettings.id, existing.id));
    } else {
      await db
        .insert(moderationSettings)
        .values(data as InsertModerationSettings);
    }
  }

  // Platform Messages implementation
  async getPlatformMessages(): Promise<PlatformMessage[]> {
    return await db
      .select()
      .from(platformMessages)
      .orderBy(desc(platformMessages.createdAt));
  }

  async getPlatformMessage(id: string): Promise<PlatformMessage | undefined> {
    const [result] = await db
      .select()
      .from(platformMessages)
      .where(eq(platformMessages.id, id))
      .limit(1);
    return result;
  }

  async createPlatformMessage(
    data: InsertPlatformMessage,
  ): Promise<PlatformMessage> {
    const [result] = await db.insert(platformMessages).values(data).returning();
    return result;
  }

  async updatePlatformMessage(
    id: string,
    updates: Partial<PlatformMessage>,
  ): Promise<void> {
    await db
      .update(platformMessages)
      .set(updates)
      .where(eq(platformMessages.id, id));
  }

  async deletePlatformMessage(id: string): Promise<void> {
    await db.delete(platformMessages).where(eq(platformMessages.id, id));
  }

  async markMessageAsRead(id: string): Promise<void> {
    await db
      .update(platformMessages)
      .set({ isRead: true })
      .where(eq(platformMessages.id, id));
  }

  // Payment Processor Settings implementation
  async getPaymentProcessorSettings(): Promise<PaymentProcessorSettings[]> {
    return await db
      .select()
      .from(paymentProcessorSettings)
      .orderBy(paymentProcessorSettings.processorName);
  }

  async getPaymentProcessorSetting(
    id: string,
  ): Promise<PaymentProcessorSettings | undefined> {
    const [result] = await db
      .select()
      .from(paymentProcessorSettings)
      .where(eq(paymentProcessorSettings.id, id))
      .limit(1);
    return result;
  }

  async getPaymentProcessorByName(
    processorName: string,
  ): Promise<PaymentProcessorSettings | undefined> {
    const [result] = await db
      .select()
      .from(paymentProcessorSettings)
      .where(eq(paymentProcessorSettings.processorName, processorName))
      .limit(1);
    return result;
  }

  async createPaymentProcessorSettings(
    data: InsertPaymentProcessorSettings,
  ): Promise<PaymentProcessorSettings> {
    const [result] = await db
      .insert(paymentProcessorSettings)
      .values(data)
      .returning();
    return result;
  }

  async updatePaymentProcessorSettings(
    id: string,
    updates: Partial<PaymentProcessorSettings>,
  ): Promise<void> {
    await db
      .update(paymentProcessorSettings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(paymentProcessorSettings.id, id));
  }

  async deletePaymentProcessorSettings(id: string): Promise<void> {
    await db
      .delete(paymentProcessorSettings)
      .where(eq(paymentProcessorSettings.id, id));
  }

  // System Limits implementation
  async getSystemLimits(): Promise<SystemLimit[]> {
    return await db
      .select()
      .from(systemLimits)
      .orderBy(systemLimits.limitType, systemLimits.limitName);
  }

  async getSystemLimit(id: string): Promise<SystemLimit | undefined> {
    const [result] = await db
      .select()
      .from(systemLimits)
      .where(eq(systemLimits.id, id))
      .limit(1);
    return result;
  }

  async createSystemLimit(data: InsertSystemLimit): Promise<SystemLimit> {
    const [result] = await db.insert(systemLimits).values(data).returning();
    return result;
  }

  async updateSystemLimit(
    id: string,
    updates: Partial<SystemLimit>,
  ): Promise<void> {
    await db
      .update(systemLimits)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(systemLimits.id, id));
  }

  async deleteSystemLimit(id: string): Promise<void> {
    await db.delete(systemLimits).where(eq(systemLimits.id, id));
  }

  // ===== ENTERPRISE MULTI-TENANT IMPLEMENTATIONS =====

  // Tenants management
  async getTenants(): Promise<Tenant[]> {
    return await db.select().from(tenants).orderBy(desc(tenants.createdAt));
  }

  async getTenant(id: string): Promise<Tenant | undefined> {
    const [tenant] = await db.select().from(tenants).where(eq(tenants.id, id));
    return tenant;
  }

  async getTenantBySlug(slug: string): Promise<Tenant | undefined> {
    const [tenant] = await db.select().from(tenants).where(eq(tenants.slug, slug));
    return tenant;
  }

  async createTenant(tenant: InsertTenant): Promise<Tenant> {
    const [result] = await db.insert(tenants).values(tenant).returning();
    return result;
  }

  async updateTenant(id: string, updates: Partial<Tenant>): Promise<Tenant> {
    const [result] = await db
      .update(tenants)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(tenants.id, id))
      .returning();
    return result;
  }

  async deleteTenant(id: string): Promise<void> {
    await db.delete(tenants).where(eq(tenants.id, id));
  }

  // Memberships management
  async getMemberships(tenantId?: string, userId?: string): Promise<Membership[]> {
    let query = db.select().from(memberships);
    const conditions = [];
    if (tenantId) conditions.push(eq(memberships.tenantId, tenantId));
    if (userId) conditions.push(eq(memberships.userId, userId));
    if (conditions.length > 0) query = query.where(and(...conditions));
    return await query.orderBy(desc(memberships.joinedAt));
  }

  async getMembership(userId: string, tenantId: string): Promise<Membership | undefined> {
    const [membership] = await db
      .select()
      .from(memberships)
      .where(and(eq(memberships.userId, userId), eq(memberships.tenantId, tenantId)));
    return membership;
  }

  async createMembership(membership: InsertMembership): Promise<Membership> {
    const [result] = await db.insert(memberships).values(membership).returning();
    return result;
  }

  async updateMembership(id: string, updates: Partial<Membership>): Promise<Membership> {
    const [result] = await db
      .update(memberships)
      .set({ ...updates, lastActiveAt: new Date() })
      .where(eq(memberships.id, id))
      .returning();
    return result;
  }

  async deleteMembership(id: string): Promise<void> {
    await db.delete(memberships).where(eq(memberships.id, id));
  }

  // Enhanced audit logging
  async createAuditLog(auditLog: InsertAuditLog): Promise<AuditLog> {
    const [result] = await db.insert(auditLogs).values(auditLog).returning();
    return result;
  }

  async getAuditLogs(filters?: {
    tenantId?: string;
    actorId?: string;
    action?: string;
    targetType?: string;
    severity?: string;
    dateRange?: { from: Date; to: Date };
    limit?: number;
  }): Promise<AuditLog[]> {
    let query = db.select().from(auditLogs);
    const conditions = [];

    if (filters?.tenantId) conditions.push(eq(auditLogs.tenantId, filters.tenantId));
    if (filters?.actorId) conditions.push(eq(auditLogs.actorId, filters.actorId));
    if (filters?.action) conditions.push(eq(auditLogs.action, filters.action));
    if (filters?.targetType) conditions.push(eq(auditLogs.targetType, filters.targetType));
    if (filters?.severity) conditions.push(eq(auditLogs.severity, filters.severity));

    if (conditions.length > 0) query = query.where(and(...conditions));
    
    query = query.orderBy(desc(auditLogs.createdAt));
    if (filters?.limit) query = query.limit(filters.limit);

    return await query;
  }

  // KYC verification system
  async getKycVerifications(userId?: string): Promise<KycVerification[]> {
    let query = db.select().from(kycVerifications);
    if (userId) query = query.where(eq(kycVerifications.userId, userId));
    return await query.orderBy(desc(kycVerifications.createdAt));
  }

  async getKycVerification(id: string): Promise<KycVerification | undefined> {
    const [kyc] = await db.select().from(kycVerifications).where(eq(kycVerifications.id, id));
    return kyc;
  }

  async createKycVerification(kyc: InsertKycVerification): Promise<KycVerification> {
    const [result] = await db.insert(kycVerifications).values(kyc).returning();
    return result;
  }

  async updateKycVerification(id: string, updates: Partial<KycVerification>): Promise<KycVerification> {
    const [result] = await db
      .update(kycVerifications)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(kycVerifications.id, id))
      .returning();
    return result;
  }

  async getKycStats(): Promise<{
    pending: number;
    verified: number;
    failed: number;
    expired: number;
  }> {
    const [pending] = await db
      .select({ count: count() })
      .from(kycVerifications)
      .where(eq(kycVerifications.status, 'pending'));
    
    const [verified] = await db
      .select({ count: count() })
      .from(kycVerifications)
      .where(eq(kycVerifications.status, 'verified'));
    
    const [failed] = await db
      .select({ count: count() })
      .from(kycVerifications)
      .where(eq(kycVerifications.status, 'failed'));
    
    const [expired] = await db
      .select({ count: count() })
      .from(kycVerifications)
      .where(eq(kycVerifications.status, 'expired'));

    return {
      pending: pending.count,
      verified: verified.count,
      failed: failed.count,
      expired: expired.count,
    };
  }

  // Payout management
  async getPayoutRequests(filters?: {
    userId?: string;
    tenantId?: string;
    status?: string;
    limit?: number;
  }): Promise<PayoutRequest[]> {
    let query = db.select().from(payoutRequests);
    const conditions = [];

    if (filters?.userId) conditions.push(eq(payoutRequests.userId, filters.userId));
    if (filters?.tenantId) conditions.push(eq(payoutRequests.tenantId, filters.tenantId));
    if (filters?.status) conditions.push(eq(payoutRequests.status, filters.status));

    if (conditions.length > 0) query = query.where(and(...conditions));
    
    query = query.orderBy(desc(payoutRequests.createdAt));
    if (filters?.limit) query = query.limit(filters.limit);

    return await query;
  }

  async getPayoutRequest(id: string): Promise<PayoutRequest | undefined> {
    const [payout] = await db.select().from(payoutRequests).where(eq(payoutRequests.id, id));
    return payout;
  }

  async createPayoutRequest(payout: InsertPayoutRequest): Promise<PayoutRequest> {
    const [result] = await db.insert(payoutRequests).values(payout).returning();
    return result;
  }

  async updatePayoutRequest(id: string, updates: Partial<PayoutRequest>): Promise<PayoutRequest> {
    const [result] = await db
      .update(payoutRequests)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(payoutRequests.id, id))
      .returning();
    return result;
  }

  async getPayoutStats(): Promise<{
    pending: number;
    approved: number;
    processing: number;
    completed: number;
    failed: number;
    totalAmount: number;
  }> {
    const [pending] = await db
      .select({ count: count() })
      .from(payoutRequests)
      .where(eq(payoutRequests.status, 'pending'));
    
    const [approved] = await db
      .select({ count: count() })
      .from(payoutRequests)
      .where(eq(payoutRequests.status, 'approved'));
    
    const [processing] = await db
      .select({ count: count() })
      .from(payoutRequests)
      .where(eq(payoutRequests.status, 'processing'));
    
    const [completed] = await db
      .select({ count: count() })
      .from(payoutRequests)
      .where(eq(payoutRequests.status, 'completed'));
    
    const [failed] = await db
      .select({ count: count() })
      .from(payoutRequests)
      .where(eq(payoutRequests.status, 'failed'));
    
    const [totalAmount] = await db
      .select({ sum: sql<number>`COALESCE(SUM(${payoutRequests.amountCents}), 0)` })
      .from(payoutRequests)
      .where(eq(payoutRequests.status, 'completed'));

    return {
      pending: pending.count,
      approved: approved.count,
      processing: processing.count,
      completed: completed.count,
      failed: failed.count,
      totalAmount: totalAmount.sum,
    };
  }

  // Ads management - Basic implementation
  async getAdCreatives(): Promise<AdCreative[]> {
    return await db.select().from(adCreatives).orderBy(desc(adCreatives.createdAt));
  }

  async getAdCreative(id: string): Promise<AdCreative | undefined> {
    const [creative] = await db.select().from(adCreatives).where(eq(adCreatives.id, id));
    return creative;
  }

  async createAdCreative(creative: InsertAdCreative): Promise<AdCreative> {
    const [result] = await db.insert(adCreatives).values(creative).returning();
    return result;
  }

  async updateAdCreative(id: string, updates: Partial<AdCreative>): Promise<AdCreative> {
    const [result] = await db
      .update(adCreatives)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(adCreatives.id, id))
      .returning();
    return result;
  }

  async deleteAdCreative(id: string): Promise<void> {
    await db.delete(adCreatives).where(eq(adCreatives.id, id));
  }

  async getAdPlacements(): Promise<AdPlacement[]> {
    return await db.select().from(adPlacements).orderBy(desc(adPlacements.createdAt));
  }

  async getAdPlacement(id: string): Promise<AdPlacement | undefined> {
    const [placement] = await db.select().from(adPlacements).where(eq(adPlacements.id, id));
    return placement;
  }

  async createAdPlacement(placement: InsertAdPlacement): Promise<AdPlacement> {
    const [result] = await db.insert(adPlacements).values(placement).returning();
    return result;
  }

  async updateAdPlacement(id: string, updates: Partial<AdPlacement>): Promise<AdPlacement> {
    const [result] = await db
      .update(adPlacements)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(adPlacements.id, id))
      .returning();
    return result;
  }

  async deleteAdPlacement(id: string): Promise<void> {
    await db.delete(adPlacements).where(eq(adPlacements.id, id));
  }

  async getAdsStats(): Promise<{
    totalCreatives: number;
    pendingReview: number;
    activeCreatives: number;
    totalPlacements: number;
    totalRevenue: number;
    totalImpressions: number;
  }> {
    const [totalCreatives] = await db.select({ count: count() }).from(adCreatives);
    const [pendingReview] = await db
      .select({ count: count() })
      .from(adCreatives)
      .where(eq(adCreatives.status, 'pending'));
    const [activeCreatives] = await db
      .select({ count: count() })
      .from(adCreatives)
      .where(eq(adCreatives.status, 'active'));
    const [totalPlacements] = await db.select({ count: count() }).from(adPlacements);
    const [totalRevenue] = await db
      .select({ sum: sql<number>`COALESCE(SUM(${adPlacements.revenue}), 0)` })
      .from(adPlacements);
    const [totalImpressions] = await db
      .select({ sum: sql<number>`COALESCE(SUM(${adPlacements.impressions}), 0)` })
      .from(adPlacements);

    return {
      totalCreatives: totalCreatives.count,
      pendingReview: pendingReview.count,
      activeCreatives: activeCreatives.count,
      totalPlacements: totalPlacements.count,
      totalRevenue: totalRevenue.sum,
      totalImpressions: totalImpressions.sum,
    };
  }

  // Security events
  async getSecurityEvents(): Promise<SecurityEvent[]> {
    return await db.select().from(securityEvents).orderBy(desc(securityEvents.createdAt));
  }

  async createSecurityEvent(event: InsertSecurityEvent): Promise<SecurityEvent> {
    const [result] = await db.insert(securityEvents).values(event).returning();
    return result;
  }

  async updateSecurityEvent(id: string, updates: Partial<SecurityEvent>): Promise<SecurityEvent> {
    const [result] = await db
      .update(securityEvents)
      .set(updates)
      .where(eq(securityEvents.id, id))
      .returning();
    return result;
  }

  async getSecurityStats(): Promise<{
    totalEvents: number;
    criticalEvents: number;
    unresolved: number;
    last24Hours: number;
  }> {
    const [totalEvents] = await db.select({ count: count() }).from(securityEvents);
    const [criticalEvents] = await db
      .select({ count: count() })
      .from(securityEvents)
      .where(eq(securityEvents.severity, 'critical'));
    const [unresolved] = await db
      .select({ count: count() })
      .from(securityEvents)
      .where(eq(securityEvents.resolved, false));
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [last24Hours] = await db
      .select({ count: count() })
      .from(securityEvents)
      .where(sql`${securityEvents.createdAt} >= ${yesterday}`);

    return {
      totalEvents: totalEvents.count,
      criticalEvents: criticalEvents.count,
      unresolved: unresolved.count,
      last24Hours: last24Hours.count,
    };
  }

  // OPA policies
  async getOpaPolicies(): Promise<OpaPolicy[]> {
    return await db.select().from(opaPolicies).orderBy(desc(opaPolicies.priority), desc(opaPolicies.createdAt));
  }

  async getOpaPolicy(id: string): Promise<OpaPolicy | undefined> {
    const [policy] = await db.select().from(opaPolicies).where(eq(opaPolicies.id, id));
    return policy;
  }

  async createOpaPolicy(policy: InsertOpaPolicy): Promise<OpaPolicy> {
    const [result] = await db.insert(opaPolicies).values(policy).returning();
    return result;
  }

  async updateOpaPolicy(id: string, updates: Partial<OpaPolicy>): Promise<OpaPolicy> {
    const [result] = await db
      .update(opaPolicies)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(opaPolicies.id, id))
      .returning();
    return result;
  }

  async deleteOpaPolicy(id: string): Promise<void> {
    await db.delete(opaPolicies).where(eq(opaPolicies.id, id));
  }

  // Feature flags
  async getGlobalFlags(): Promise<GlobalFlag[]> {
    return await db.select().from(globalFlags).orderBy(desc(globalFlags.createdAt));
  }

  async getGlobalFlag(flagKey: string, tenantId?: string, platform?: string): Promise<GlobalFlag | undefined> {
    const conditions = [eq(globalFlags.flagKey, flagKey)];

    if (tenantId) conditions.push(eq(globalFlags.tenantId, tenantId));
    if (platform) conditions.push(eq(globalFlags.platform, platform));

    const [flag] = await db.select().from(globalFlags).where(and(...conditions));
    return flag;
  }

  async createGlobalFlag(flag: InsertGlobalFlag): Promise<GlobalFlag> {
    const [result] = await db.insert(globalFlags).values(flag).returning();
    return result;
  }

  async updateGlobalFlag(id: string, updates: Partial<GlobalFlag>): Promise<GlobalFlag> {
    const [result] = await db
      .update(globalFlags)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(globalFlags.id, id))
      .returning();
    return result;
  }

  async deleteGlobalFlag(id: string): Promise<void> {
    await db.delete(globalFlags).where(eq(globalFlags.id, id));
  }

  // Webhooks
  async getWebhooks(): Promise<Webhook[]> {
    return await db.select().from(webhooks).orderBy(desc(webhooks.createdAt));
  }

  async getWebhook(id: string): Promise<Webhook | undefined> {
    const [webhook] = await db.select().from(webhooks).where(eq(webhooks.id, id));
    return webhook;
  }

  async createWebhook(webhook: InsertWebhook): Promise<Webhook> {
    const [result] = await db.insert(webhooks).values(webhook).returning();
    return result;
  }

  async updateWebhook(id: string, updates: Partial<Webhook>): Promise<Webhook> {
    const [result] = await db
      .update(webhooks)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(webhooks.id, id))
      .returning();
    return result;
  }

  async deleteWebhook(id: string): Promise<void> {
    await db.delete(webhooks).where(eq(webhooks.id, id));
  }

  // API keys
  async getApiKeys(): Promise<ApiKey[]> {
    return await db.select().from(apiKeys).orderBy(desc(apiKeys.createdAt));
  }

  async getApiKey(keyId: string): Promise<ApiKey | undefined> {
    const [apiKey] = await db.select().from(apiKeys).where(eq(apiKeys.keyId, keyId));
    return apiKey;
  }

  async createApiKey(apiKey: InsertApiKey): Promise<ApiKey> {
    const [result] = await db.insert(apiKeys).values(apiKey).returning();
    return result;
  }

  async updateApiKey(id: string, updates: Partial<ApiKey>): Promise<ApiKey> {
    const [result] = await db
      .update(apiKeys)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(apiKeys.id, id))
      .returning();
    return result;
  }

  async deleteApiKey(id: string): Promise<void> {
    await db.delete(apiKeys).where(eq(apiKeys.id, id));
  }
}

export const storage = new DatabaseStorage();
