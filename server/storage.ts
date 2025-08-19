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
}

export const storage = new DatabaseStorage();
