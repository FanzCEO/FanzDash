import { EventEmitter } from "events";
import { promises as fs } from "fs";
import { join } from "path";

export interface AnalyticsEvent {
  id: string;
  type: string;
  category: string;
  userId?: string;
  sessionId?: string;
  timestamp: Date;
  properties: Record<string, any>;
  metadata: {
    ip: string;
    userAgent: string;
    referrer?: string;
    platform: string;
    device: string;
  };
}

export interface AnalyticsQuery {
  startDate: Date;
  endDate: Date;
  eventTypes?: string[];
  categories?: string[];
  userIds?: string[];
  filters?: Record<string, any>;
  groupBy?: string[];
  aggregation?: "count" | "sum" | "avg" | "min" | "max";
  limit?: number;
}

export interface AnalyticsResult {
  events: AnalyticsEvent[];
  aggregations: Record<string, number>;
  insights: {
    totalEvents: number;
    uniqueUsers: number;
    topEvents: Array<{ type: string; count: number }>;
    topCategories: Array<{ category: string; count: number }>;
    hourlyDistribution: Array<{ hour: number; count: number }>;
    dailyDistribution: Array<{ date: string; count: number }>;
  };
}

export interface UserBehavior {
  userId: string;
  totalEvents: number;
  sessionCount: number;
  averageSessionDuration: number;
  lastActivity: Date;
  topActions: Array<{ action: string; count: number }>;
  conversionEvents: string[];
  riskScore: number;
  engagementScore: number;
  categories: string[];
}

export interface ConversionFunnel {
  name: string;
  steps: Array<{
    name: string;
    eventType: string;
    filters?: Record<string, any>;
  }>;
  results: Array<{
    step: string;
    users: number;
    conversionRate: number;
    dropoffRate: number;
  }>;
}

export interface RealtimeMetrics {
  activeUsers: number;
  eventsPerMinute: number;
  topEvents: Array<{ type: string; count: number }>;
  errorRate: number;
  averageResponseTime: number;
  systemLoad: {
    cpu: number;
    memory: number;
    disk: number;
    network: number;
  };
}

export class InternalAnalytics extends EventEmitter {
  private events = new Map<string, AnalyticsEvent>();
  private userSessions = new Map<string, Set<string>>();
  private realtimeBuffer: AnalyticsEvent[] = [];
  private isStorageEnabled = true;

  constructor() {
    super();
    this.setupStorage();
    this.startRealtimeProcessing();
  }

  private async setupStorage() {
    try {
      await fs.mkdir(join(process.cwd(), "analytics"), { recursive: true });
    } catch (error) {
      console.warn("Analytics storage setup failed:", error);
      this.isStorageEnabled = false;
    }
  }

  private startRealtimeProcessing() {
    // Process realtime buffer every 10 seconds
    setInterval(() => {
      this.processRealtimeBuffer();
    }, 10000);

    // Persist events every minute
    setInterval(() => {
      this.persistEvents();
    }, 60000);
  }

  track(
    type: string,
    category: string,
    properties: Record<string, any> = {},
    metadata: {
      userId?: string;
      sessionId?: string;
      ip?: string;
      userAgent?: string;
      referrer?: string;
      platform?: string;
      device?: string;
    } = {},
  ): string {
    const eventId = this.generateEventId();

    const event: AnalyticsEvent = {
      id: eventId,
      type,
      category,
      userId: metadata.userId,
      sessionId: metadata.sessionId,
      timestamp: new Date(),
      properties,
      metadata: {
        ip: metadata.ip || "127.0.0.1",
        userAgent: metadata.userAgent || "Unknown",
        referrer: metadata.referrer,
        platform: metadata.platform || "web",
        device: metadata.device || "desktop",
      },
    };

    this.events.set(eventId, event);
    this.realtimeBuffer.push(event);

    // Track user sessions
    if (event.userId && event.sessionId) {
      if (!this.userSessions.has(event.userId)) {
        this.userSessions.set(event.userId, new Set());
      }
      this.userSessions.get(event.userId)!.add(event.sessionId);
    }

    this.emit("eventTracked", event);
    return eventId;
  }

  // Predefined tracking methods for common events
  trackPageView(
    page: string,
    userId?: string,
    sessionId?: string,
    metadata: any = {},
  ) {
    return this.track(
      "page_view",
      "navigation",
      { page },
      { userId, sessionId, ...metadata },
    );
  }

  trackContentView(
    contentId: string,
    contentType: string,
    userId?: string,
    sessionId?: string,
    metadata: any = {},
  ) {
    return this.track(
      "content_view",
      "engagement",
      { contentId, contentType },
      { userId, sessionId, ...metadata },
    );
  }

  trackContentUpload(
    contentId: string,
    contentType: string,
    size: number,
    userId?: string,
    sessionId?: string,
    metadata: any = {},
  ) {
    return this.track(
      "content_upload",
      "creation",
      { contentId, contentType, size },
      { userId, sessionId, ...metadata },
    );
  }

  trackStreamStart(
    streamId: string,
    userId: string,
    sessionId?: string,
    metadata: any = {},
  ) {
    return this.track(
      "stream_start",
      "streaming",
      { streamId },
      { userId, sessionId, ...metadata },
    );
  }

  trackStreamView(
    streamId: string,
    userId?: string,
    sessionId?: string,
    metadata: any = {},
  ) {
    return this.track(
      "stream_view",
      "streaming",
      { streamId },
      { userId, sessionId, ...metadata },
    );
  }

  trackPayment(
    amount: number,
    currency: string,
    processor: string,
    userId: string,
    sessionId?: string,
    metadata: any = {},
  ) {
    return this.track(
      "payment",
      "revenue",
      { amount, currency, processor },
      { userId, sessionId, ...metadata },
    );
  }

  trackModerationAction(
    action: string,
    contentId: string,
    moderatorId: string,
    reason?: string,
    metadata: any = {},
  ) {
    return this.track(
      "moderation_action",
      "safety",
      { action, contentId, moderatorId, reason },
      { userId: moderatorId, ...metadata },
    );
  }

  trackError(
    error: string,
    category: string,
    userId?: string,
    sessionId?: string,
    metadata: any = {},
  ) {
    return this.track(
      "error",
      "system",
      { error, category },
      { userId, sessionId, ...metadata },
    );
  }

  trackAPICall(
    endpoint: string,
    method: string,
    statusCode: number,
    responseTime: number,
    userId?: string,
    metadata: any = {},
  ) {
    return this.track(
      "api_call",
      "system",
      { endpoint, method, statusCode, responseTime },
      { userId, ...metadata },
    );
  }

  async query(queryParams: AnalyticsQuery): Promise<AnalyticsResult> {
    const events = Array.from(this.events.values()).filter((event) =>
      this.matchesQuery(event, queryParams),
    );

    const insights = this.generateInsights(events);
    const aggregations = this.calculateAggregations(events, queryParams);

    return {
      events: queryParams.limit ? events.slice(0, queryParams.limit) : events,
      aggregations,
      insights,
    };
  }

  private matchesQuery(event: AnalyticsEvent, query: AnalyticsQuery): boolean {
    // Date range filter
    if (event.timestamp < query.startDate || event.timestamp > query.endDate) {
      return false;
    }

    // Event type filter
    if (query.eventTypes && !query.eventTypes.includes(event.type)) {
      return false;
    }

    // Category filter
    if (query.categories && !query.categories.includes(event.category)) {
      return false;
    }

    // User ID filter
    if (
      query.userIds &&
      event.userId &&
      !query.userIds.includes(event.userId)
    ) {
      return false;
    }

    // Custom filters
    if (query.filters) {
      for (const [key, value] of Object.entries(query.filters)) {
        if (event.properties[key] !== value) {
          return false;
        }
      }
    }

    return true;
  }

  private generateInsights(events: AnalyticsEvent[]) {
    const uniqueUsers = new Set(events.map((e) => e.userId).filter(Boolean))
      .size;

    const eventTypeCounts = events.reduce(
      (acc, event) => {
        acc[event.type] = (acc[event.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const categoryCounts = events.reduce(
      (acc, event) => {
        acc[event.category] = (acc[event.category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const topEvents = Object.entries(eventTypeCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([type, count]) => ({ type, count }));

    const topCategories = Object.entries(categoryCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([category, count]) => ({ category, count }));

    // Hourly distribution
    const hourlyDistribution = Array.from({ length: 24 }, (_, hour) => {
      const count = events.filter(
        (e) => e.timestamp.getHours() === hour,
      ).length;
      return { hour, count };
    });

    // Daily distribution (last 7 days)
    const dailyDistribution = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const count = events.filter(
        (e) => e.timestamp.toISOString().split("T")[0] === dateStr,
      ).length;
      return { date: dateStr, count };
    }).reverse();

    return {
      totalEvents: events.length,
      uniqueUsers,
      topEvents,
      topCategories,
      hourlyDistribution,
      dailyDistribution,
    };
  }

  private calculateAggregations(
    events: AnalyticsEvent[],
    query: AnalyticsQuery,
  ): Record<string, number> {
    const aggregations: Record<string, number> = {};

    if (query.groupBy) {
      for (const groupField of query.groupBy) {
        const groups = events.reduce(
          (acc, event) => {
            const key = this.getGroupValue(event, groupField);
            if (key) {
              acc[key] = (acc[key] || 0) + 1;
            }
            return acc;
          },
          {} as Record<string, number>,
        );

        aggregations[`${groupField}_groups`] = Object.keys(groups).length;

        // Add top groups
        Object.entries(groups)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 10)
          .forEach(([key, value], index) => {
            aggregations[`${groupField}_top_${index + 1}`] = value;
          });
      }
    }

    return aggregations;
  }

  private getGroupValue(
    event: AnalyticsEvent,
    field: string,
  ): string | undefined {
    switch (field) {
      case "type":
        return event.type;
      case "category":
        return event.category;
      case "userId":
        return event.userId;
      case "platform":
        return event.metadata.platform;
      case "device":
        return event.metadata.device;
      case "hour":
        return event.timestamp.getHours().toString();
      case "date":
        return event.timestamp.toISOString().split("T")[0];
      default:
        return event.properties[field]?.toString();
    }
  }

  async getUserBehavior(userId: string): Promise<UserBehavior> {
    const userEvents = Array.from(this.events.values())
      .filter((event) => event.userId === userId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    const sessions = this.userSessions.get(userId) || new Set();

    // Calculate session durations
    const sessionDurations: number[] = [];
    for (const sessionId of sessions) {
      const sessionEvents = userEvents.filter((e) => e.sessionId === sessionId);
      if (sessionEvents.length > 1) {
        const duration =
          sessionEvents[sessionEvents.length - 1].timestamp.getTime() -
          sessionEvents[0].timestamp.getTime();
        sessionDurations.push(duration);
      }
    }

    const averageSessionDuration =
      sessionDurations.length > 0
        ? sessionDurations.reduce((sum, duration) => sum + duration, 0) /
          sessionDurations.length
        : 0;

    // Top actions
    const actionCounts = userEvents.reduce(
      (acc, event) => {
        acc[event.type] = (acc[event.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const topActions = Object.entries(actionCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([action, count]) => ({ action, count }));

    // Conversion events
    const conversionEvents = userEvents
      .filter((e) =>
        ["payment", "subscription", "content_upload", "stream_start"].includes(
          e.type,
        ),
      )
      .map((e) => e.type);

    // Risk score calculation
    const riskScore = this.calculateRiskScore(userEvents);

    // Engagement score calculation
    const engagementScore = this.calculateEngagementScore(
      userEvents,
      sessions.size,
    );

    // Categories
    const categories = [...new Set(userEvents.map((e) => e.category))];

    return {
      userId,
      totalEvents: userEvents.length,
      sessionCount: sessions.size,
      averageSessionDuration: Math.round(averageSessionDuration / 1000), // Convert to seconds
      lastActivity: userEvents[userEvents.length - 1]?.timestamp || new Date(),
      topActions,
      conversionEvents: [...new Set(conversionEvents)],
      riskScore,
      engagementScore,
      categories,
    };
  }

  private calculateRiskScore(events: AnalyticsEvent[]): number {
    let score = 0;

    // High error rate
    const errorEvents = events.filter((e) => e.type === "error").length;
    if (errorEvents > 10) score += 30;
    else if (errorEvents > 5) score += 15;

    // Unusual patterns
    const rapidActions = events.filter((event, index) => {
      if (index === 0) return false;
      const timeDiff =
        event.timestamp.getTime() - events[index - 1].timestamp.getTime();
      return timeDiff < 1000; // Less than 1 second between actions
    }).length;

    if (rapidActions > 20) score += 40;
    else if (rapidActions > 10) score += 20;

    // Failed moderation
    const moderationFlags = events.filter(
      (e) => e.type === "moderation_action" && e.properties.action === "flag",
    ).length;

    if (moderationFlags > 3) score += 50;
    else if (moderationFlags > 1) score += 25;

    return Math.min(100, score);
  }

  private calculateEngagementScore(
    events: AnalyticsEvent[],
    sessionCount: number,
  ): number {
    let score = 0;

    // Frequency of activity
    const daysSinceFirst =
      events.length > 0
        ? Math.ceil(
            (new Date().getTime() - events[0].timestamp.getTime()) /
              (1000 * 60 * 60 * 24),
          )
        : 1;

    const eventsPerDay = events.length / daysSinceFirst;
    if (eventsPerDay > 50) score += 30;
    else if (eventsPerDay > 20) score += 20;
    else if (eventsPerDay > 5) score += 10;

    // Variety of actions
    const uniqueEventTypes = new Set(events.map((e) => e.type)).size;
    score += Math.min(20, uniqueEventTypes * 2);

    // Content creation
    const creationEvents = events.filter((e) =>
      ["content_upload", "stream_start", "comment", "like"].includes(e.type),
    ).length;
    score += Math.min(25, creationEvents);

    // Session engagement
    if (sessionCount > 10) score += 15;
    else if (sessionCount > 5) score += 10;
    else if (sessionCount > 1) score += 5;

    // Revenue events
    const revenueEvents = events.filter((e) =>
      ["payment", "subscription", "tip"].includes(e.type),
    ).length;
    score += Math.min(10, revenueEvents * 5);

    return Math.min(100, score);
  }

  async createConversionFunnel(
    name: string,
    steps: Array<{
      name: string;
      eventType: string;
      filters?: Record<string, any>;
    }>,
  ): Promise<ConversionFunnel> {
    const results: ConversionFunnel["results"] = [];
    let previousUsers: Set<string> = new Set();

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const stepEvents = Array.from(this.events.values()).filter((event) => {
        if (event.type !== step.eventType || !event.userId) return false;

        // Apply filters
        if (step.filters) {
          for (const [key, value] of Object.entries(step.filters)) {
            if (event.properties[key] !== value) return false;
          }
        }

        // For steps after the first, only include users who completed previous steps
        if (i > 0 && !previousUsers.has(event.userId)) return false;

        return true;
      });

      const stepUsers = new Set(stepEvents.map((e) => e.userId!));
      const conversionRate =
        i === 0 ? 100 : (stepUsers.size / previousUsers.size) * 100;
      const dropoffRate = 100 - conversionRate;

      results.push({
        step: step.name,
        users: stepUsers.size,
        conversionRate: Math.round(conversionRate * 100) / 100,
        dropoffRate: Math.round(dropoffRate * 100) / 100,
      });

      previousUsers = stepUsers;
    }

    return {
      name,
      steps,
      results,
    };
  }

  getRealtimeMetrics(): RealtimeMetrics {
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60000);

    const recentEvents = this.realtimeBuffer.filter(
      (event) => event.timestamp > oneMinuteAgo,
    );

    const activeUsers = new Set(
      recentEvents.filter((e) => e.userId).map((e) => e.userId!),
    ).size;

    const eventsPerMinute = recentEvents.length;

    const eventTypeCounts = recentEvents.reduce(
      (acc, event) => {
        acc[event.type] = (acc[event.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const topEvents = Object.entries(eventTypeCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([type, count]) => ({ type, count }));

    const errorEvents = recentEvents.filter((e) => e.type === "error").length;
    const errorRate =
      recentEvents.length > 0 ? (errorEvents / recentEvents.length) * 100 : 0;

    const apiEvents = recentEvents.filter((e) => e.type === "api_call");
    const averageResponseTime =
      apiEvents.length > 0
        ? apiEvents.reduce(
            (sum, e) => sum + (e.properties.responseTime || 0),
            0,
          ) / apiEvents.length
        : 0;

    return {
      activeUsers,
      eventsPerMinute,
      topEvents,
      errorRate: Math.round(errorRate * 100) / 100,
      averageResponseTime: Math.round(averageResponseTime * 100) / 100,
      systemLoad: {
        cpu: this.getSystemMetric("cpu"),
        memory: this.getSystemMetric("memory"),
        disk: this.getSystemMetric("disk"),
        network: this.getSystemMetric("network"),
      },
    };
  }

  private getSystemMetric(metric: string): number {
    // In a real implementation, this would query actual system metrics
    // For now, return simulated values
    const baseValues = { cpu: 45, memory: 65, disk: 30, network: 25 };
    const variation = (Math.random() - 0.5) * 20;
    return Math.max(
      0,
      Math.min(100, baseValues[metric as keyof typeof baseValues] + variation),
    );
  }

  private processRealtimeBuffer() {
    if (this.realtimeBuffer.length > 1000) {
      // Keep only the most recent 1000 events in the buffer
      this.realtimeBuffer = this.realtimeBuffer.slice(-1000);
    }

    this.emit("realtimeProcessed", {
      processedEvents: this.realtimeBuffer.length,
      timestamp: new Date(),
    });
  }

  private async persistEvents() {
    if (!this.isStorageEnabled) return;

    try {
      const events = Array.from(this.events.values());
      const filename = `analytics_${new Date().toISOString().split("T")[0]}.json`;
      const filepath = join(process.cwd(), "analytics", filename);

      await fs.writeFile(filepath, JSON.stringify(events, null, 2));

      this.emit("eventsPersisted", {
        count: events.length,
        filename,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Failed to persist analytics events:", error);
    }
  }

  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getStats() {
    return {
      totalEvents: this.events.size,
      uniqueUsers: new Set(
        Array.from(this.events.values())
          .map((e) => e.userId)
          .filter(Boolean),
      ).size,
      totalSessions: Array.from(this.userSessions.values()).reduce(
        (sum, sessions) => sum + sessions.size,
        0,
      ),
      realtimeBufferSize: this.realtimeBuffer.length,
      storageEnabled: this.isStorageEnabled,
    };
  }

  // Admin methods
  clearOldEvents(daysOld: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const oldEvents = Array.from(this.events.entries()).filter(
      ([, event]) => event.timestamp < cutoffDate,
    );

    for (const [eventId] of oldEvents) {
      this.events.delete(eventId);
    }

    this.emit("oldEventsCleared", { count: oldEvents.length, cutoffDate });
  }

  exportEvents(startDate: Date, endDate: Date): AnalyticsEvent[] {
    return Array.from(this.events.values())
      .filter(
        (event) => event.timestamp >= startDate && event.timestamp <= endDate,
      )
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }
}

// Singleton instance
export const analytics = new InternalAnalytics();
