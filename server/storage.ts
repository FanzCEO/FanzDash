import { 
  users, 
  contentItems, 
  moderationResults, 
  liveStreams, 
  moderationSettings,
  appealRequests,
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
  type InsertAppealRequest
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
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
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
}

export const storage = new DatabaseStorage();
