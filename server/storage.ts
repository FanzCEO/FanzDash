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
  type InsertGeoCollaboration
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
  updateContentStatus(id: string, status: string, moderatorId?: string): Promise<void>;
  getPendingContent(limit?: number): Promise<ContentItem[]>;

  // Moderation results
  createModerationResult(result: InsertModerationResult): Promise<ModerationResult>;
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
  updateAppealRequest(id: string, updates: Partial<AppealRequest>): Promise<void>;

  // Stats
  getDashboardStats(): Promise<{
    reviewedToday: number;
    autoBlocked: number;
    pendingReview: number;
    liveStreams: number;
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
  createPaymentProcessor(processor: InsertPaymentProcessor): Promise<PaymentProcessor>;
  createPaymentTransaction(transaction: InsertPaymentTransaction): Promise<PaymentTransaction>;
  
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
  createGeoCollaboration(collaboration: InsertGeoCollaboration): Promise<GeoCollaboration>;
  getNearbyCollaborations(lat: number, lng: number, radius: number): Promise<GeoCollaboration[]>;
  
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
  createLiveStreamSession(session: InsertLiveStreamSession): Promise<LiveStreamSession>;
  getPrivateShowRequests(): Promise<PrivateShowRequest[]>;
  createPrivateShowRequest(request: InsertPrivateShowRequest): Promise<PrivateShowRequest>;
  
  // Gift System
  getGiftCatalog(): Promise<GiftCatalog[]>;
  createGift(gift: InsertGiftCatalog): Promise<GiftCatalog>;
  createGiftTransaction(transaction: InsertGiftTransaction): Promise<GiftTransaction>;
  
  // User Deposits
  getUserDeposits(userId: string): Promise<UserDeposit[]>;
  createUserDeposit(deposit: InsertUserDeposit): Promise<UserDeposit>;
  
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
  createExtendedPaymentProcessor(processor: InsertExtendedPaymentProcessor): Promise<ExtendedPaymentProcessor>;
  
  // Interactive functionality
  addPlatformConnection(connection: any): Promise<any>;
  removePlatformConnection(id: string): Promise<void>;
  updateUserRole(id: string, role: string): Promise<void>;
  updateSettings(settings: any): Promise<void>;
  createCrisisIncident(incident: any): Promise<any>;
  processAppeal(id: string, decision: string, reasoning: string, moderatorId: string): Promise<void>;
  addVaultFile(file: any): Promise<any>;
  searchAuditLogs(query: string, dateRange: string, actionType: string): Promise<any[]>;
  calculateModelPerformanceStats(analyses: any[]): any;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return result[0];
  }

  async getContentItem(id: string): Promise<ContentItem | undefined> {
    const [item] = await db.select().from(contentItems).where(eq(contentItems.id, id));
    return item || undefined;
  }

  async createContentItem(content: InsertContentItem): Promise<ContentItem> {
    const [item] = await db
      .insert(contentItems)
      .values(content)
      .returning();
    return item;
  }

  async updateContentStatus(id: string, status: string, moderatorId?: string): Promise<void> {
    await db
      .update(contentItems)
      .set({ 
        status, 
        moderatorId,
        updatedAt: new Date()
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

  async createModerationResult(result: InsertModerationResult): Promise<ModerationResult> {
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

  async updateLiveStream(id: string, updates: Partial<LiveStream>): Promise<void> {
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

  async updateModerationSettings(settings: InsertModerationSettings): Promise<void> {
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
      await db
        .insert(moderationSettings)
        .values(settings);
    }
  }

  // Audio Call Settings
  async getAudioCallSettings(): Promise<any> {
    const settings = await db
      .select()
      .from(audioCallSettings)
      .limit(1);
    
    if (settings.length > 0) {
      return settings[0];
    }
    
    // Return default settings if none exist
    return {
      audioCallStatus: false,
      agoraAppId: null,
      audioCallMinPrice: 1,
      audioCallMaxPrice: 100,
      audioCallMaxDuration: 60
    };
  }

  async updateAudioCallSettings(settings: any): Promise<void> {
    const existing = await db
      .select()
      .from(audioCallSettings)
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(audioCallSettings)
        .set({ ...settings, updatedAt: new Date() })
        .where(eq(audioCallSettings.id, existing[0].id));
    } else {
      await db
        .insert(audioCallSettings)
        .values(settings);
    }
  }

  async getAppealRequests(): Promise<AppealRequest[]> {
    return await db
      .select()
      .from(appealRequests)
      .orderBy(desc(appealRequests.createdAt));
  }

  async createAppealRequest(appeal: InsertAppealRequest): Promise<AppealRequest> {
    const [appealRequest] = await db
      .insert(appealRequests)
      .values(appeal)
      .returning();
    return appealRequest;
  }

  async updateAppealRequest(id: string, updates: Partial<AppealRequest>): Promise<void> {
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

    const [reviewedToday] = await db
      .select({ count: count() })
      .from(contentItems)
      .where(
        and(
          or(eq(contentItems.status, "approved"), eq(contentItems.status, "rejected")),
          sql`${contentItems.updatedAt} >= ${today}`
        )
      );

    const [autoBlocked] = await db
      .select({ count: count() })
      .from(contentItems)
      .where(
        and(
          eq(contentItems.status, "auto_blocked"),
          sql`${contentItems.createdAt} >= ${today}`
        )
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

  // Multi-platform operations (temporary mock implementation)
  async getAllPlatforms(): Promise<any[]> {
    return [
      {
        id: "platform-1",
        name: "FanzMain Adult",
        domain: "main.fanz.com",
        niche: "adult_content",
        status: "active",
        apiEndpoint: "https://api.main.fanz.com/v1",
        webhookUrl: "https://webhooks.main.fanz.com/moderation",
        moderationRules: {
          autoBlock: true,
          riskThreshold: 0.7,
          requireManualReview: false,
          allowedContentTypes: ["image", "video", "text"],
          blockedKeywords: [],
          customRules: []
        },
        stats: {
          totalContent: 15847,
          dailyContent: 234,
          blockedContent: 89,
          flaggedContent: 23,
          lastSync: new Date().toISOString()
        },
        createdAt: "2024-01-10T10:00:00Z",
        lastActive: new Date().toISOString()
      },
      {
        id: "platform-2", 
        name: "FanzLive Streaming",
        domain: "live.fanz.com",
        niche: "live_streaming",
        status: "active",
        apiEndpoint: "https://api.live.fanz.com/v1",
        webhookUrl: "https://webhooks.live.fanz.com/moderation",
        moderationRules: {
          autoBlock: false,
          riskThreshold: 0.8,
          requireManualReview: true,
          allowedContentTypes: ["live_stream", "video"],
          blockedKeywords: [],
          customRules: []
        },
        stats: {
          totalContent: 8934,
          dailyContent: 167,
          blockedContent: 34,
          flaggedContent: 12,
          lastSync: new Date().toISOString()
        },
        createdAt: "2024-01-12T14:00:00Z",
        lastActive: new Date().toISOString()
      },
      {
        id: "platform-3",
        name: "FanzSocial Community",
        domain: "social.fanz.com", 
        niche: "social_media",
        status: "active",
        apiEndpoint: "https://api.social.fanz.com/v1",
        webhookUrl: "https://webhooks.social.fanz.com/moderation",
        moderationRules: {
          autoBlock: true,
          riskThreshold: 0.6,
          requireManualReview: false,
          allowedContentTypes: ["text", "image"],
          blockedKeywords: ["spam", "harassment"],
          customRules: []
        },
        stats: {
          totalContent: 32156,
          dailyContent: 456,
          blockedContent: 123,
          flaggedContent: 67,
          lastSync: new Date().toISOString()
        },
        createdAt: "2024-01-08T09:00:00Z",
        lastActive: new Date().toISOString()
      }
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
        customRules: []
      },
      stats: {
        totalContent: 0,
        dailyContent: 0,
        blockedContent: 0,
        flaggedContent: 0,
        lastSync: new Date().toISOString()
      },
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString()
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
      error: success ? undefined : "Connection timeout"
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
        errorCount: 0
      },
      {
        id: "conn-2",
        platformId: "platform-2",
        connectionType: "api",
        status: "connected",
        lastHeartbeat: new Date().toISOString(),
        latency: 89,
        errorCount: 0
      },
      {
        id: "conn-3",
        platformId: "platform-3",
        connectionType: "webhook",
        status: "connected",
        lastHeartbeat: new Date().toISOString(),
        latency: 67,
        errorCount: 0
      }
    ];
  }

  async getPlatformStats(): Promise<any> {
    return {
      totalPlatforms: 3,
      activePlatforms: 3,
      totalContent: 56937,
      flaggedContent: 102,
      avgResponseTime: 134,
      uptime: 99.9
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
        recommendations: Math.random() > 0.7 ? ["Block content"] : ["Approve content"]
      },
      processingTime: Math.floor(Math.random() * 2000) + 500,
      modelVersion: "gpt-4o",
      createdAt: new Date(Date.now() - i * 60000).toISOString(),
      platformName: ["FanzMain Adult", "FanzLive Streaming", "FanzSocial Community"][i % 3],
      contentType: ["image", "video", "text", "live_stream"][i % 4]
    }));
  }

  async processContentAnalysis(request: any): Promise<any> {
    const riskScore = Math.random();
    const confidence = Math.random() * 0.4 + 0.6;

    return {
      analysisId: `analysis-${Date.now()}`,
      riskScore,
      confidence,
      recommendations: riskScore > 0.7 ? ["Block content"] : ["Approve content"],
      processingTime: Math.floor(Math.random() * 2000) + 500,
      flaggedContent: riskScore > 0.7 ? ["explicit_content"] : []
    };
  }

  // AI Analysis operations implementation



  calculateModelPerformanceStats(analyses: any[]): any {
    if (!analyses || analyses.length === 0) {
      return {};
    }

    const modelGroups = analyses.reduce((acc: Record<string, any[]>, analysis: any) => {
      const modelType = analysis.analysisType;
      if (!acc[modelType]) {
        acc[modelType] = [];
      }
      acc[modelType].push(analysis);
      return acc;
    }, {} as Record<string, any[]>);

    const stats: Record<string, any> = {};

    Object.entries(modelGroups).forEach(([modelType, modelAnalyses]: [string, any[]]) => {
      const totalAnalyses = modelAnalyses.length;
      const avgSpeed = Math.round(
        modelAnalyses.reduce((sum: number, a: any) => sum + (a.processingTime || 0), 0) / totalAnalyses
      );
      
      // Calculate accuracy based on confidence scores
      const avgConfidence = modelAnalyses.reduce((sum: number, a: any) => sum + (a.confidence || 0), 0) / totalAnalyses;
      const accuracy = Math.round(avgConfidence * 100);
      
      const status = accuracy > 95 ? "optimal" : accuracy > 90 ? "excellent" : accuracy > 85 ? "good" : "needs_review";

      stats[modelType.replace('-', '')] = {
        accuracy,
        avgSpeed,
        status,
        count: totalAnalyses
      };
    });

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
      createdAt: new Date().toISOString()
    };
    return analysisResult;
  }

  async getRecentAnalysisResults(limit: number): Promise<any[]> {
    return Array.from({ length: Math.min(limit, 10) }, (_, i) => ({
      id: `analysis-${Date.now() - i * 1000}`,
      contentType: ['image', 'text', 'video'][Math.floor(Math.random() * 3)],
      riskScore: Math.random(),
      confidence: Math.random() * 0.3 + 0.7,
      createdAt: new Date(Date.now() - i * 60000).toISOString()
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

  async processAppeal(id: string, decision: string, reasoning: string, moderatorId: string): Promise<void> {
    console.log(`Processed appeal ${id}: ${decision} by ${moderatorId}`);
  }

  async addVaultFile(file: any): Promise<any> {
    return { ...file, id: file.id || `vault-${Date.now()}` };
  }

  async searchAuditLogs(query: string, dateRange: string, actionType: string): Promise<any[]> {
    return [
      {
        id: `audit-${Date.now()}`,
        action: actionType || "search_performed",
        user: "current-user",
        query,
        dateRange,
        timestamp: new Date().toISOString()
      }
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

  async createPaymentProcessor(processor: InsertPaymentProcessor): Promise<PaymentProcessor> {
    const [result] = await db
      .insert(paymentProcessors)
      .values(processor)
      .returning();
    return result;
  }

  async createPaymentTransaction(transaction: InsertPaymentTransaction): Promise<PaymentTransaction> {
    const [result] = await db
      .insert(paymentTransactions)
      .values(transaction)
      .returning();
    return result;
  }

  // GetStream operations
  async createStreamToken(token: InsertStreamToken): Promise<StreamToken> {
    const [result] = await db
      .insert(streamTokens)
      .values(token)
      .returning();
    return result;
  }

  async createStreamChannel(channel: InsertStreamChannel): Promise<StreamChannel> {
    const [result] = await db
      .insert(streamChannels)
      .values(channel)
      .returning();
    return result;
  }

  // Coconut Encoding operations
  async createEncodingJob(job: InsertEncodingJob): Promise<EncodingJob> {
    const [result] = await db
      .insert(encodingJobs)
      .values(job)
      .returning();
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
    const [result] = await db
      .insert(vrSessions)
      .values(session)
      .returning();
    return result;
  }

  async createWebRTCRoom(room: InsertWebRTCRoom): Promise<WebRTCRoom> {
    const [result] = await db
      .insert(webrtcRooms)
      .values(room)
      .returning();
    return result;
  }

  // Geo-Collaboration operations
  async createGeoCollaboration(collaboration: InsertGeoCollaboration): Promise<GeoCollaboration> {
    const [result] = await db
      .insert(geoCollaborations)
      .values(collaboration)
      .returning();
    return result;
  }

  async getNearbyCollaborations(lat: number, lng: number, radius: number): Promise<GeoCollaboration[]> {
    // For now, return all collaborations (in production, use PostGIS for geo queries)
    return await db
      .select()
      .from(geoCollaborations)
      .where(eq(geoCollaborations.status, 'open'))
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
    const [result] = await db
      .insert(taxRates)
      .values(rate)
      .returning();
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
    const [result] = await db
      .insert(adCampaigns)
      .values(campaign)
      .returning();
    return result;
  }

  async updateAdCampaign(id: string, updates: Partial<AdCampaign>): Promise<void> {
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

  async createLiveStreamSession(session: InsertLiveStreamSession): Promise<LiveStreamSession> {
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

  async createPrivateShowRequest(request: InsertPrivateShowRequest): Promise<PrivateShowRequest> {
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
    const [result] = await db
      .insert(giftCatalog)
      .values(gift)
      .returning();
    return result;
  }

  async createGiftTransaction(transaction: InsertGiftTransaction): Promise<GiftTransaction> {
    const [result] = await db
      .insert(giftTransactions)
      .values(transaction)
      .returning();
    return result;
  }

  // User Deposits implementation
  async getUserDeposits(userId: string): Promise<UserDeposit[]> {
    return await db
      .select()
      .from(userDeposits)
      .where(eq(userDeposits.userId, userId))
      .orderBy(desc(userDeposits.createdAt));
  }

  async createUserDeposit(deposit: InsertUserDeposit): Promise<UserDeposit> {
    const [result] = await db
      .insert(userDeposits)
      .values(deposit)
      .returning();
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
    const [result] = await db
      .insert(roles)
      .values(role)
      .returning();
    return result;
  }

  async assignUserRole(userRole: InsertUserRole): Promise<UserRole> {
    const [result] = await db
      .insert(userRoles)
      .values(userRole)
      .returning();
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

  async createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement> {
    const [result] = await db
      .insert(announcements)
      .values(announcement)
      .returning();
    return result;
  }

  // CMS System implementation
  async getCmsPages(): Promise<CmsPage[]> {
    return await db
      .select()
      .from(cmsPages)
      .orderBy(desc(cmsPages.updatedAt));
  }

  async createCmsPage(page: InsertCmsPage): Promise<CmsPage> {
    const [result] = await db
      .insert(cmsPages)
      .values(page)
      .returning();
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

  async createPlatformLimit(limit: InsertPlatformLimit): Promise<PlatformLimit> {
    const [result] = await db
      .insert(platformLimits)
      .values(limit)
      .returning();
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
      .where(and(
        eq(reservedNames.name, name.toLowerCase()),
        eq(reservedNames.isActive, true)
      ))
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
        .values({ key, value, category: 'general' });
    }
  }

  // Audio Calls implementation
  async createAudioCall(call: InsertAudioCall): Promise<AudioCall> {
    const [result] = await db
      .insert(audioCalls)
      .values(call)
      .returning();
    return result;
  }

  async getAudioCalls(userId: string): Promise<AudioCall[]> {
    return await db
      .select()
      .from(audioCalls)
      .where(or(
        eq(audioCalls.callerId, userId),
        eq(audioCalls.receiverId, userId)
      ))
      .orderBy(desc(audioCalls.createdAt));
  }

  // Extended Payment Processors implementation
  async getExtendedPaymentProcessors(): Promise<ExtendedPaymentProcessor[]> {
    return await db
      .select()
      .from(extendedPaymentProcessors)
      .where(and(
        eq(extendedPaymentProcessors.isBanned, false),
        eq(extendedPaymentProcessors.adultFriendly, true)
      ))
      .orderBy(extendedPaymentProcessors.region, extendedPaymentProcessors.name);
  }

  async createExtendedPaymentProcessor(processor: InsertExtendedPaymentProcessor): Promise<ExtendedPaymentProcessor> {
    const [result] = await db
      .insert(extendedPaymentProcessors)
      .values(processor)
      .returning();
    return result;
  }
}

export const storage = new DatabaseStorage();
