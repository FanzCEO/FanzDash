import { db } from "../db";
import {
  analyticsConfigurations,
  analyticsEvents,
  socialOAuthConnections
} from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";

// 📊 COMPREHENSIVE ANALYTICS INTEGRATION SERVICE
// Manages GA4, GTM, and social media pixel tracking across all FANZ platforms

export interface GA4Configuration {
  measurementId: string;
  apiSecret: string;
  streamId?: string;
  propertyId?: string;
  debugMode?: boolean;
  cookieDomain?: string;
  cookieExpires?: number;
  customDimensions?: Record<string, any>;
  customMetrics?: Record<string, any>;
}

export interface GTMConfiguration {
  containerId: string;
  environment?: string;
  auth?: string;
  preview?: string;
  dataLayer?: any[];
  customVariables?: Record<string, any>;
}

export interface SocialPixelConfiguration {
  facebook?: { pixelId: string; accessToken?: string };
  tiktok?: { pixelId: string; accessToken?: string };
  twitter?: { pixelId: string; accessToken?: string };
  reddit?: { pixelId: string; accessToken?: string };
  instagram?: { pixelId: string; accessToken?: string };
  patreon?: { clientId: string; clientSecret?: string };
}

export interface AnalyticsEvent {
  eventName: string;
  platformId: string;
  userId?: string;
  sessionId: string;
  eventData: Record<string, any>;
  utmParameters?: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  };
  deviceInfo?: {
    userAgent?: string;
    deviceType?: string;
    browser?: string;
    os?: string;
  };
  pageInfo?: {
    url: string;
    referrer?: string;
    title?: string;
  };
}

export class AnalyticsService {
  private static instance: AnalyticsService;
  private eventQueue: Map<string, AnalyticsEvent[]> = new Map();
  private readonly BATCH_SIZE = 25; // GA4 recommendation
  private readonly FLUSH_INTERVAL = 10000; // 10 seconds
  private flushTimer?: NodeJS.Timeout;

  private constructor() {
    this.startFlushTimer();
  }

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  /**
   * Get analytics configuration for a platform
   */
  async getConfiguration(platformId: string) {
    try {
      const result = await db
        .select()
        .from(analyticsConfigurations)
        .where(
          and(
            eq(analyticsConfigurations.platformId, platformId),
            eq(analyticsConfigurations.isActive, true)
          )
        )
        .limit(1);

      return result[0] || null;
    } catch (error) {
      console.error(`Error fetching analytics config for ${platformId}:`, error);
      return null;
    }
  }

  /**
   * Create or update analytics configuration
   */
  async saveConfiguration(
    platformId: string,
    config: {
      ga4?: GA4Configuration;
      gtm?: GTMConfiguration;
      pixels?: SocialPixelConfiguration;
      trafficAnalysisEnabled?: boolean;
      variableTracking?: Record<string, any>;
    }
  ) {
    try {
      const existing = await this.getConfiguration(platformId);

      const configData = {
        platformId,
        // GA4
        ga4MeasurementId: config.ga4?.measurementId || existing?.ga4MeasurementId,
        ga4ApiSecret: config.ga4?.apiSecret || existing?.ga4ApiSecret,
        ga4StreamId: config.ga4?.streamId || existing?.ga4StreamId,
        ga4PropertyId: config.ga4?.propertyId || existing?.ga4PropertyId,
        ga4Configuration: config.ga4 || existing?.ga4Configuration || {},

        // GTM
        gtmContainerId: config.gtm?.containerId || existing?.gtmContainerId,
        gtmEnvironment: config.gtm?.environment || existing?.gtmEnvironment || "live",
        gtmConfiguration: config.gtm || existing?.gtmConfiguration || {},

        // Social Pixels
        facebookPixelId: config.pixels?.facebook?.pixelId || existing?.facebookPixelId,
        tiktokPixelId: config.pixels?.tiktok?.pixelId || existing?.tiktokPixelId,
        twitterPixelId: config.pixels?.twitter?.pixelId || existing?.twitterPixelId,
        redditPixelId: config.pixels?.reddit?.pixelId || existing?.redditPixelId,
        instagramPixelId: config.pixels?.instagram?.pixelId || existing?.instagramPixelId,
        patreonClientId: config.pixels?.patreon?.clientId || existing?.patreonClientId,
        pixelConfiguration: config.pixels || existing?.pixelConfiguration || {},

        // Analytics settings
        trafficAnalysisEnabled: config.trafficAnalysisEnabled ?? existing?.trafficAnalysisEnabled ?? true,
        variableTracking: config.variableTracking || existing?.variableTracking || {},
        isActive: true,
        updatedAt: new Date(),
      };

      if (existing) {
        const result = await db
          .update(analyticsConfigurations)
          .set(configData)
          .where(eq(analyticsConfigurations.id, existing.id))
          .returning();
        return result[0];
      } else {
        const result = await db
          .insert(analyticsConfigurations)
          .values(configData)
          .returning();
        return result[0];
      }
    } catch (error) {
      console.error(`Error saving analytics config for ${platformId}:`, error);
      throw error;
    }
  }

  /**
   * Generate tracking script for a platform
   */
  async generateTrackingScript(platformId: string): Promise<string> {
    const config = await this.getConfiguration(platformId);
    if (!config) return "";

    let script = "";

    // Google Analytics 4
    if (config.ga4MeasurementId) {
      script += `
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${config.ga4MeasurementId}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${config.ga4MeasurementId}', ${JSON.stringify(config.ga4Configuration || {})});
</script>
`;
    }

    // Google Tag Manager
    if (config.gtmContainerId) {
      const gtmParams = new URLSearchParams();
      if (config.gtmConfiguration?.auth) gtmParams.append("gtm_auth", config.gtmConfiguration.auth);
      if (config.gtmConfiguration?.preview) gtmParams.append("gtm_preview", config.gtmConfiguration.preview);
      if (config.gtmEnvironment && config.gtmEnvironment !== "live") {
        gtmParams.append("gtm_cookies_win", "x");
      }

      const queryString = gtmParams.toString() ? `&${gtmParams.toString()}` : "";

      script += `
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl+'${queryString}';f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${config.gtmContainerId}');</script>
<!-- End Google Tag Manager -->

<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${config.gtmContainerId}${queryString}"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->
`;
    }

    // Facebook Pixel
    if (config.facebookPixelId) {
      script += `
<!-- Facebook Pixel -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${config.facebookPixelId}');
fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=${config.facebookPixelId}&ev=PageView&noscript=1"
/></noscript>
`;
    }

    // TikTok Pixel
    if (config.tiktokPixelId) {
      script += `
<!-- TikTok Pixel -->
<script>
!function (w, d, t) {
  w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
  ttq.load('${config.tiktokPixelId}');
  ttq.page();
}(window, document, 'ttq');
</script>
`;
    }

    // Twitter Pixel
    if (config.twitterPixelId) {
      script += `
<!-- Twitter Pixel -->
<script>
!function(e,t,n,s,u,a){e.twq||(s=e.twq=function(){s.exe?s.exe.apply(s,arguments):s.queue.push(arguments);
},s.version='1.1',s.queue=[],u=t.createElement(n),u.async=!0,u.src='https://static.ads-twitter.com/uwt.js',
a=t.getElementsByTagName(n)[0],a.parentNode.insertBefore(u,a))}(window,document,'script');
twq('config','${config.twitterPixelId}');
</script>
`;
    }

    // Reddit Pixel
    if (config.redditPixelId) {
      script += `
<!-- Reddit Pixel -->
<script>
!function(w,d){if(!w.rdt){var p=w.rdt=function(){p.sendEvent?p.sendEvent.apply(p,arguments):p.callQueue.push(arguments)};p.callQueue=[];var t=d.createElement("script");t.src="https://www.redditstatic.com/ads/pixel.js",t.async=!0;var s=d.getElementsByTagName("script")[0];s.parentNode.insertBefore(t,s)}}(window,document);
rdt('init','${config.redditPixelId}');
rdt('track', 'PageVisit');
</script>
`;
    }

    return script;
  }

  /**
   * Track an event
   */
  async trackEvent(event: AnalyticsEvent): Promise<void> {
    try {
      // Store in database
      await db.insert(analyticsEvents).values({
        platformId: event.platformId,
        userId: event.userId,
        sessionId: event.sessionId,
        eventName: event.eventName,
        eventData: event.eventData,
        utmParameters: event.utmParameters || {},
        deviceInfo: event.deviceInfo || {},
        pageInfo: event.pageInfo || {},
      });

      // Add to batch queue for real-time sending
      const queueKey = event.platformId;
      if (!this.eventQueue.has(queueKey)) {
        this.eventQueue.set(queueKey, []);
      }
      this.eventQueue.get(queueKey)!.push(event);

      // Flush if batch is full
      if (this.eventQueue.get(queueKey)!.length >= this.BATCH_SIZE) {
        await this.flushEvents(queueKey);
      }
    } catch (error) {
      console.error("Error tracking event:", error);
    }
  }

  /**
   * Send events to GA4 Measurement Protocol
   */
  private async sendToGA4(
    config: any,
    events: AnalyticsEvent[]
  ): Promise<void> {
    if (!config.ga4MeasurementId || !config.ga4ApiSecret) return;

    const endpoint = `https://www.google-analytics.com/mp/collect?measurement_id=${config.ga4MeasurementId}&api_secret=${config.ga4ApiSecret}`;

    const payload = {
      client_id: events[0].sessionId,
      user_id: events[0].userId,
      events: events.map(e => ({
        name: e.eventName,
        params: {
          ...e.eventData,
          ...e.utmParameters,
          page_location: e.pageInfo?.url,
          page_referrer: e.pageInfo?.referrer,
          page_title: e.pageInfo?.title,
        },
      })),
    };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        console.error("GA4 API error:", await response.text());
      }
    } catch (error) {
      console.error("Error sending to GA4:", error);
    }
  }

  /**
   * Send events to social media pixels
   */
  private async sendToPixels(
    config: any,
    events: AnalyticsEvent[]
  ): Promise<void> {
    const promises: Promise<void>[] = [];

    // Facebook Conversions API
    if (config.facebookPixelId && config.pixelConfiguration?.facebook?.accessToken) {
      promises.push(this.sendToFacebookConversions(config, events));
    }

    // TikTok Events API
    if (config.tiktokPixelId && config.pixelConfiguration?.tiktok?.accessToken) {
      promises.push(this.sendToTikTokEvents(config, events));
    }

    await Promise.allSettled(promises);
  }

  /**
   * Send to Facebook Conversions API
   */
  private async sendToFacebookConversions(
    config: any,
    events: AnalyticsEvent[]
  ): Promise<void> {
    const endpoint = `https://graph.facebook.com/v18.0/${config.facebookPixelId}/events`;
    const accessToken = config.pixelConfiguration?.facebook?.accessToken;

    const payload = {
      data: events.map(e => ({
        event_name: e.eventName,
        event_time: Math.floor(Date.now() / 1000),
        action_source: "website",
        event_source_url: e.pageInfo?.url,
        user_data: {
          client_ip_address: e.deviceInfo?.userAgent,
          client_user_agent: e.deviceInfo?.userAgent,
          fbp: e.sessionId, // Facebook browser ID
        },
        custom_data: e.eventData,
      })),
    };

    try {
      const response = await fetch(`${endpoint}?access_token=${accessToken}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        console.error("Facebook Conversions API error:", await response.text());
      }
    } catch (error) {
      console.error("Error sending to Facebook:", error);
    }
  }

  /**
   * Send to TikTok Events API
   */
  private async sendToTikTokEvents(
    config: any,
    events: AnalyticsEvent[]
  ): Promise<void> {
    const endpoint = "https://business-api.tiktok.com/open_api/v1.3/event/track/";
    const accessToken = config.pixelConfiguration?.tiktok?.accessToken;

    const payload = {
      pixel_code: config.tiktokPixelId,
      event: events.map(e => ({
        event: e.eventName,
        event_time: Math.floor(Date.now() / 1000),
        user: {
          ttclid: e.sessionId,
          user_agent: e.deviceInfo?.userAgent,
        },
        page: {
          url: e.pageInfo?.url,
          referrer: e.pageInfo?.referrer,
        },
        properties: e.eventData,
      })),
    };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Access-Token": accessToken,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        console.error("TikTok Events API error:", await response.text());
      }
    } catch (error) {
      console.error("Error sending to TikTok:", error);
    }
  }

  /**
   * Flush queued events
   */
  private async flushEvents(platformId?: string): Promise<void> {
    const platforms = platformId
      ? [platformId]
      : Array.from(this.eventQueue.keys());

    for (const pid of platforms) {
      const events = this.eventQueue.get(pid);
      if (!events || events.length === 0) continue;

      const config = await this.getConfiguration(pid);
      if (!config) {
        this.eventQueue.delete(pid);
        continue;
      }

      // Send to GA4
      await this.sendToGA4(config, events);

      // Send to social pixels
      await this.sendToPixels(config, events);

      // Clear queue
      this.eventQueue.delete(pid);
    }
  }

  /**
   * Start periodic flush timer
   */
  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flushEvents();
    }, this.FLUSH_INTERVAL);
  }

  /**
   * Get analytics dashboard data
   */
  async getDashboardData(platformId: string, timeRange: { start: Date; end: Date }) {
    try {
      // Get configuration
      const config = await this.getConfiguration(platformId);

      // Get events from database
      const events = await db
        .select()
        .from(analyticsEvents)
        .where(
          and(
            eq(analyticsEvents.platformId, platformId),
            // Add date range filtering here if needed
          )
        )
        .orderBy(desc(analyticsEvents.createdAt))
        .limit(1000);

      // Aggregate statistics
      const stats = {
        totalEvents: events.length,
        uniqueUsers: new Set(events.map(e => e.userId).filter(Boolean)).size,
        uniqueSessions: new Set(events.map(e => e.sessionId)).size,
        eventsByType: this.aggregateByField(events, "eventName"),
        eventsBySource: this.aggregateByField(events, "utmParameters.source"),
        deviceTypes: this.aggregateByField(events, "deviceInfo.deviceType"),
        topPages: this.aggregateByField(events, "pageInfo.url"),
      };

      return {
        config,
        stats,
        recentEvents: events.slice(0, 50),
      };
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      throw error;
    }
  }

  /**
   * Helper to aggregate events by a field
   */
  private aggregateByField(events: any[], field: string): Record<string, number> {
    const aggregated: Record<string, number> = {};

    for (const event of events) {
      const value = this.getNestedValue(event, field) || "unknown";
      aggregated[value] = (aggregated[value] || 0) + 1;
    }

    return aggregated;
  }

  /**
   * Helper to get nested object value
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split(".").reduce((current, key) => current?.[key], obj);
  }

  /**
   * Test configuration
   */
  async testConfiguration(platformId: string): Promise<{ success: boolean; message: string }> {
    try {
      const config = await this.getConfiguration(platformId);
      if (!config) {
        return { success: false, message: "Configuration not found" };
      }

      const tests: string[] = [];

      // Test GA4
      if (config.ga4MeasurementId && config.ga4ApiSecret) {
        const testEvent: AnalyticsEvent = {
          eventName: "test_event",
          platformId,
          sessionId: "test_session",
          eventData: { test: true },
          pageInfo: { url: "https://test.com" },
        };
        await this.sendToGA4(config, [testEvent]);
        tests.push("GA4");
      }

      // Add more tests for other services

      return {
        success: true,
        message: `Successfully tested: ${tests.join(", ") || "No active integrations"}`
      };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
  }
}

// Export singleton instance
export const analyticsService = AnalyticsService.getInstance();

// Cleanup on process exit
process.on("beforeExit", () => {
  analyticsService.destroy();
});
