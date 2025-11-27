/**
 * FANZ Unified Ecosystem - Analytics & Marketing Connector
 * Connector for all 8 analytics and marketing services
 */

import { MicroserviceConnector, MicroserviceResponse } from '../MicroserviceConnector';

export interface Analytics {
  views: number;
  likes: number;
  comments: number;
  shares: number;
  revenue: number;
  subscribers: number;
  engagement: number;
  period: string;
}

export interface Campaign {
  id: string;
  name: string;
  type: 'promotion' | 'ads' | 'seo';
  status: 'draft' | 'active' | 'paused' | 'completed';
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
}

export class AnalyticsConnector extends MicroserviceConnector {
  /**
   * Get analytics for a user/creator
   */
  async getAnalytics(userId: string, params?: {
    startDate?: string;
    endDate?: string;
    metrics?: string[];
  }): Promise<MicroserviceResponse<Analytics>> {
    return this.get(`/analytics/${userId}`, { params });
  }

  /**
   * Get real-time metrics
   */
  async getRealTimeMetrics(userId: string): Promise<MicroserviceResponse<{
    activeViewers: number;
    currentRevenue: number;
    engagementRate: number;
  }>> {
    return this.get(`/metrics/realtime/${userId}`);
  }

  /**
   * Get insights and recommendations
   */
  async getInsights(userId: string): Promise<MicroserviceResponse<{
    recommendations: string[];
    trends: any[];
    opportunities: any[];
  }>> {
    return this.get(`/insights/${userId}`);
  }

  /**
   * Create marketing campaign
   */
  async createCampaign(data: {
    userId: string;
    name: string;
    type: string;
    budget: number;
    targeting: any;
  }): Promise<MicroserviceResponse<Campaign>> {
    return this.post(`/campaigns`, data);
  }

  /**
   * Get campaigns
   */
  async getCampaigns(userId: string): Promise<MicroserviceResponse<Campaign[]>> {
    return this.get(`/campaigns/${userId}`);
  }

  /**
   * Get SEO recommendations
   */
  async getSEORecommendations(contentId: string): Promise<MicroserviceResponse<{
    title: string;
    description: string;
    keywords: string[];
    score: number;
  }>> {
    return this.get(`/seo/analyze/${contentId}`);
  }
}

// Factory for all analytics services
export class AnalyticsFactory {
  private static connectors: Map<string, AnalyticsConnector> = new Map();

  static getConnector(serviceName: string): AnalyticsConnector {
    const serviceId = `analytics-${serviceName.toLowerCase()}`;

    if (!this.connectors.has(serviceId)) {
      this.connectors.set(serviceId, new AnalyticsConnector(serviceId));
    }

    return this.connectors.get(serviceId)!;
  }

  static getServices() {
    return [
      'fanzstats', 'fanzmetrics', 'fanzinsights', 'fanzads',
      'fanzpromo', 'fanzseo', 'fanzsocial', 'fanzgrow'
    ];
  }
}
