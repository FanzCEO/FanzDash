import { db } from "../db";
import { scheduledContent, externalCalendarIntegrations } from "@shared/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";

// 📅 CALENDAR SCHEDULING SERVICE
// Content scheduling with Google Calendar, Apple Calendar, and Outlook integration

export interface ScheduledPost {
  platformId: string;
  contentType: "post" | "story" | "video" | "clip" | "stream";
  title: string;
  content: string;
  media?: string[];
  scheduledFor: Date;
  timezone: string;
  recurring?: {
    frequency: "daily" | "weekly" | "monthly";
    interval: number; // Every N days/weeks/months
    daysOfWeek?: number[]; // 0-6 for weekly
    dayOfMonth?: number; // 1-31 for monthly
    endDate?: Date;
  };
  externalCalendarEventId?: string;
  metadata?: Record<string, any>;
}

export interface CalendarIntegration {
  provider: "google" | "apple" | "outlook" | "ical";
  accountId: string;
  accessToken?: string;
  refreshToken?: string;
  selectedCalendars: string[];
  syncDirection: "fanzdash_to_calendar" | "calendar_to_fanzdash" | "both";
}

export class CalendarService {
  private static instance: CalendarService;
  private syncTimers: Map<string, NodeJS.Timeout> = new Map();

  private constructor() {
    this.initializeSync();
  }

  static getInstance(): CalendarService {
    if (!CalendarService.instance) {
      CalendarService.instance = new CalendarService();
    }
    return CalendarService.instance;
  }

  /**
   * Schedule content for posting
   */
  async scheduleContent(userId: string, post: ScheduledPost): Promise<any> {
    try {
      const postData = {
        userId,
        platformId: post.platformId,
        contentType: post.contentType,
        title: post.title,
        content: post.content,
        media: post.media || [],
        scheduledFor: post.scheduledFor,
        timezone: post.timezone,
        recurringPattern: post.recurring || {},
        externalCalendarEventId: post.externalCalendarEventId,
        metadata: post.metadata || {},
        status: "scheduled" as const,
      };

      const result = await db.insert(scheduledContent).values(postData).returning();
      const scheduled = result[0];

      // Sync to external calendars if user has integrations
      await this.syncToExternalCalendars(userId, scheduled);

      return scheduled;
    } catch (error) {
      console.error("Error scheduling content:", error);
      throw error;
    }
  }

  /**
   * Get scheduled content
   */
  async getScheduledContent(
    userId: string,
    options?: {
      platformId?: string;
      startDate?: Date;
      endDate?: Date;
      status?: string;
    }
  ) {
    try {
      const conditions = [eq(scheduledContent.userId, userId)];

      if (options?.platformId) {
        conditions.push(eq(scheduledContent.platformId, options.platformId));
      }

      if (options?.startDate) {
        conditions.push(gte(scheduledContent.scheduledFor, options.startDate));
      }

      if (options?.endDate) {
        conditions.push(lte(scheduledContent.scheduledFor, options.endDate));
      }

      if (options?.status) {
        conditions.push(eq(scheduledContent.status, options.status));
      }

      return await db
        .select()
        .from(scheduledContent)
        .where(and(...conditions))
        .orderBy(scheduledContent.scheduledFor);
    } catch (error) {
      console.error("Error fetching scheduled content:", error);
      return [];
    }
  }

  /**
   * Update scheduled content
   */
  async updateScheduledContent(contentId: string, updates: Partial<ScheduledPost>): Promise<any> {
    try {
      const updateData: any = {
        updatedAt: new Date(),
      };

      if (updates.title) updateData.title = updates.title;
      if (updates.content) updateData.content = updates.content;
      if (updates.media) updateData.media = updates.media;
      if (updates.scheduledFor) updateData.scheduledFor = updates.scheduledFor;
      if (updates.timezone) updateData.timezone = updates.timezone;
      if (updates.recurring) updateData.recurringPattern = updates.recurring;
      if (updates.metadata) updateData.metadata = updates.metadata;

      const result = await db
        .update(scheduledContent)
        .set(updateData)
        .where(eq(scheduledContent.id, contentId))
        .returning();

      return result[0];
    } catch (error) {
      console.error("Error updating scheduled content:", error);
      throw error;
    }
  }

  /**
   * Cancel scheduled content
   */
  async cancelScheduledContent(contentId: string): Promise<boolean> {
    try {
      await db
        .update(scheduledContent)
        .set({ status: "cancelled", updatedAt: new Date() })
        .where(eq(scheduledContent.id, contentId));

      return true;
    } catch (error) {
      console.error("Error cancelling scheduled content:", error);
      return false;
    }
  }

  /**
   * Connect external calendar
   */
  async connectCalendar(
    userId: string,
    integration: CalendarIntegration
  ): Promise<any> {
    try {
      const existing = await db
        .select()
        .from(externalCalendarIntegrations)
        .where(
          and(
            eq(externalCalendarIntegrations.userId, userId),
            eq(externalCalendarIntegrations.provider, integration.provider)
          )
        )
        .limit(1);

      const integrationData = {
        userId,
        provider: integration.provider,
        providerAccountId: integration.accountId,
        accessToken: integration.accessToken,
        refreshToken: integration.refreshToken,
        selectedCalendars: integration.selectedCalendars,
        syncEnabled: true,
        syncDirection: integration.syncDirection,
        updatedAt: new Date(),
      };

      let result;
      if (existing.length > 0) {
        result = await db
          .update(externalCalendarIntegrations)
          .set(integrationData)
          .where(eq(externalCalendarIntegrations.id, existing[0].id))
          .returning();
      } else {
        result = await db
          .insert(externalCalendarIntegrations)
          .values(integrationData)
          .returning();
      }

      // Start sync for this integration
      await this.startSync(result[0].id);

      return result[0];
    } catch (error) {
      console.error("Error connecting calendar:", error);
      throw error;
    }
  }

  /**
   * Get user's calendar integrations
   */
  async getCalendarIntegrations(userId: string) {
    try {
      return await db
        .select()
        .from(externalCalendarIntegrations)
        .where(
          and(
            eq(externalCalendarIntegrations.userId, userId),
            eq(externalCalendarIntegrations.syncEnabled, true)
          )
        );
    } catch (error) {
      console.error("Error fetching calendar integrations:", error);
      return [];
    }
  }

  /**
   * Disconnect calendar
   */
  async disconnectCalendar(userId: string, provider: string): Promise<boolean> {
    try {
      const integrations = await db
        .select()
        .from(externalCalendarIntegrations)
        .where(
          and(
            eq(externalCalendarIntegrations.userId, userId),
            eq(externalCalendarIntegrations.provider, provider)
          )
        )
        .limit(1);

      if (integrations.length > 0) {
        // Stop sync
        if (this.syncTimers.has(integrations[0].id)) {
          clearInterval(this.syncTimers.get(integrations[0].id)!);
          this.syncTimers.delete(integrations[0].id);
        }

        await db
          .update(externalCalendarIntegrations)
          .set({ syncEnabled: false, updatedAt: new Date() })
          .where(eq(externalCalendarIntegrations.id, integrations[0].id));
      }

      return true;
    } catch (error) {
      console.error("Error disconnecting calendar:", error);
      return false;
    }
  }

  /**
   * Sync scheduled content to external calendars
   */
  private async syncToExternalCalendars(userId: string, scheduled: any): Promise<void> {
    try {
      const integrations = await this.getCalendarIntegrations(userId);

      for (const integration of integrations) {
        if (
          integration.syncDirection === "fanzdash_to_calendar" ||
          integration.syncDirection === "both"
        ) {
          await this.createExternalEvent(integration, scheduled);
        }
      }
    } catch (error) {
      console.error("Error syncing to external calendars:", error);
    }
  }

  /**
   * Create event in external calendar
   */
  private async createExternalEvent(integration: any, scheduled: any): Promise<void> {
    try {
      let eventId: string | null = null;

      switch (integration.provider) {
        case "google":
          eventId = await this.createGoogleCalendarEvent(integration, scheduled);
          break;
        case "outlook":
          eventId = await this.createOutlookEvent(integration, scheduled);
          break;
        case "apple":
          // Apple Calendar uses iCloud CalDAV
          eventId = await this.createAppleCalendarEvent(integration, scheduled);
          break;
      }

      if (eventId) {
        await db
          .update(scheduledContent)
          .set({ externalCalendarEventId: eventId })
          .where(eq(scheduledContent.id, scheduled.id));
      }
    } catch (error) {
      console.error(`Error creating ${integration.provider} calendar event:`, error);
    }
  }

  /**
   * Create Google Calendar event
   */
  private async createGoogleCalendarEvent(integration: any, scheduled: any): Promise<string | null> {
    try {
      const token = await this.ensureValidToken(integration);
      if (!token) return null;

      const event = {
        summary: scheduled.title,
        description: scheduled.content,
        start: {
          dateTime: scheduled.scheduledFor.toISOString(),
          timeZone: scheduled.timezone,
        },
        end: {
          dateTime: new Date(scheduled.scheduledFor.getTime() + 3600000).toISOString(), // +1 hour
          timeZone: scheduled.timezone,
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: "email", minutes: 30 },
            { method: "popup", minutes: 10 },
          ],
        },
      };

      const calendarId = integration.selectedCalendars[0] || "primary";
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(event),
        }
      );

      if (!response.ok) {
        console.error("Google Calendar API error:", await response.text());
        return null;
      }

      const data = await response.json();
      return data.id;
    } catch (error) {
      console.error("Error creating Google Calendar event:", error);
      return null;
    }
  }

  /**
   * Create Outlook calendar event
   */
  private async createOutlookEvent(integration: any, scheduled: any): Promise<string | null> {
    try {
      const token = await this.ensureValidToken(integration);
      if (!token) return null;

      const event = {
        subject: scheduled.title,
        body: {
          contentType: "HTML",
          content: scheduled.content,
        },
        start: {
          dateTime: scheduled.scheduledFor.toISOString(),
          timeZone: scheduled.timezone,
        },
        end: {
          dateTime: new Date(scheduled.scheduledFor.getTime() + 3600000).toISOString(),
          timeZone: scheduled.timezone,
        },
      };

      const response = await fetch("https://graph.microsoft.com/v1.0/me/events", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      });

      if (!response.ok) {
        console.error("Outlook API error:", await response.text());
        return null;
      }

      const data = await response.json();
      return data.id;
    } catch (error) {
      console.error("Error creating Outlook event:", error);
      return null;
    }
  }

  /**
   * Create Apple Calendar event (via iCloud CalDAV)
   */
  private async createAppleCalendarEvent(integration: any, scheduled: any): Promise<string | null> {
    // Apple Calendar uses CalDAV protocol
    // This would require implementing CalDAV client or using a library
    console.log("Apple Calendar integration requires CalDAV implementation");
    return null;
  }

  /**
   * Ensure valid access token (refresh if needed)
   */
  private async ensureValidToken(integration: any): Promise<string | null> {
    // Check if token is expired
    if (integration.tokenExpiry && new Date() >= integration.tokenExpiry) {
      if (!integration.refreshToken) {
        console.error("Token expired and no refresh token available");
        return null;
      }

      // Refresh token
      const newToken = await this.refreshCalendarToken(integration);
      if (newToken) {
        // Update database
        await db
          .update(externalCalendarIntegrations)
          .set({
            accessToken: newToken.accessToken,
            tokenExpiry: newToken.expiresAt,
            updatedAt: new Date(),
          })
          .where(eq(externalCalendarIntegrations.id, integration.id));

        return newToken.accessToken;
      }

      return null;
    }

    return integration.accessToken;
  }

  /**
   * Refresh calendar access token
   */
  private async refreshCalendarToken(integration: any): Promise<{ accessToken: string; expiresAt: Date } | null> {
    // Use social OAuth service to refresh tokens
    const { socialOAuthService } = await import("./socialOAuthService");

    const providerMap: Record<string, string> = {
      google: "google",
      outlook: "microsoft",
    };

    const provider = providerMap[integration.provider];
    if (!provider) return null;

    const tokens = await socialOAuthService.refreshAccessToken(provider, integration.refreshToken);
    return tokens;
  }

  /**
   * Start periodic sync for integration
   */
  private async startSync(integrationId: string): Promise<void> {
    // Sync every 15 minutes
    const interval = setInterval(async () => {
      await this.performSync(integrationId);
    }, 15 * 60 * 1000);

    this.syncTimers.set(integrationId, interval);

    // Initial sync
    await this.performSync(integrationId);
  }

  /**
   * Perform sync between FanzDash and external calendar
   */
  private async performSync(integrationId: string): Promise<void> {
    try {
      const integrations = await db
        .select()
        .from(externalCalendarIntegrations)
        .where(eq(externalCalendarIntegrations.id, integrationId))
        .limit(1);

      if (integrations.length === 0) return;

      const integration = integrations[0];

      if (integration.syncDirection === "both" || integration.syncDirection === "calendar_to_fanzdash") {
        await this.syncFromExternalCalendar(integration);
      }

      // Update last sync time
      await db
        .update(externalCalendarIntegrations)
        .set({ lastSyncAt: new Date() })
        .where(eq(externalCalendarIntegrations.id, integrationId));
    } catch (error) {
      console.error("Error performing sync:", error);
    }
  }

  /**
   * Sync events from external calendar to FanzDash
   */
  private async syncFromExternalCalendar(integration: any): Promise<void> {
    try {
      let events: any[] = [];

      switch (integration.provider) {
        case "google":
          events = await this.fetchGoogleCalendarEvents(integration);
          break;
        case "outlook":
          events = await this.fetchOutlookEvents(integration);
          break;
      }

      // Create scheduled content for new events
      for (const event of events) {
        // Check if event already exists
        const existing = await db
          .select()
          .from(scheduledContent)
          .where(eq(scheduledContent.externalCalendarEventId, event.id))
          .limit(1);

        if (existing.length === 0) {
          await db.insert(scheduledContent).values({
            userId: integration.userId,
            platformId: "default", // User can edit this
            contentType: "post",
            title: event.summary || "Imported from calendar",
            content: event.description || "",
            scheduledFor: new Date(event.start.dateTime || event.start.date),
            timezone: event.start.timeZone || "UTC",
            externalCalendarEventId: event.id,
            status: "scheduled",
          });
        }
      }
    } catch (error) {
      console.error("Error syncing from external calendar:", error);
    }
  }

  /**
   * Fetch events from Google Calendar
   */
  private async fetchGoogleCalendarEvents(integration: any): Promise<any[]> {
    try {
      const token = await this.ensureValidToken(integration);
      if (!token) return [];

      const calendarId = integration.selectedCalendars[0] || "primary";
      const timeMin = new Date().toISOString();
      const timeMax = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // Next 30 days

      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?timeMin=${timeMin}&timeMax=${timeMax}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        console.error("Google Calendar API error:", await response.text());
        return [];
      }

      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error("Error fetching Google Calendar events:", error);
      return [];
    }
  }

  /**
   * Fetch events from Outlook
   */
  private async fetchOutlookEvents(integration: any): Promise<any[]> {
    try {
      const token = await this.ensureValidToken(integration);
      if (!token) return [];

      const startDateTime = new Date().toISOString();
      const endDateTime = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      const response = await fetch(
        `https://graph.microsoft.com/v1.0/me/calendarview?startDateTime=${startDateTime}&endDateTime=${endDateTime}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        console.error("Outlook API error:", await response.text());
        return [];
      }

      const data = await response.json();
      return data.value || [];
    } catch (error) {
      console.error("Error fetching Outlook events:", error);
      return [];
    }
  }

  /**
   * Initialize sync for all active integrations
   */
  private async initializeSync(): Promise<void> {
    try {
      const integrations = await db
        .select()
        .from(externalCalendarIntegrations)
        .where(eq(externalCalendarIntegrations.syncEnabled, true));

      for (const integration of integrations) {
        await this.startSync(integration.id);
      }
    } catch (error) {
      console.error("Error initializing calendar sync:", error);
    }
  }
}

// Export singleton instance
export const calendarService = CalendarService.getInstance();
