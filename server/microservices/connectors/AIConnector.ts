/**
 * FANZ Unified Ecosystem - AI & Automation Connector
 * Connector for all 8 AI and automation services
 */

import { MicroserviceConnector, MicroserviceResponse } from '../MicroserviceConnector';

export interface ModerationResult {
  contentId: string;
  safe: boolean;
  violations: string[];
  confidence: number;
  categories: {
    csam: number;
    violence: number;
    hate: number;
    harassment: number;
  };
}

export interface Recommendation {
  id: string;
  type: 'content' | 'creator' | 'product';
  score: number;
  reason: string;
}

export class AIConnector extends MicroserviceConnector {
  /**
   * Moderate content with AI
   */
  async moderateContent(data: {
    contentId: string;
    contentType: string;
    url: string;
  }): Promise<MicroserviceResponse<ModerationResult>> {
    return this.post(`/moderate`, data);
  }

  /**
   * Scan for violations
   */
  async scanContent(data: {
    contentId: string;
    scanType: 'csam' | 'deepfake' | 'copyright' | 'all';
  }): Promise<MicroserviceResponse<{
    violations: string[];
    score: number;
    action: 'allow' | 'review' | 'block';
  }>> {
    return this.post(`/scan`, data);
  }

  /**
   * Get content recommendations
   */
  async getRecommendations(userId: string, params?: {
    type?: string;
    limit?: number;
  }): Promise<MicroserviceResponse<Recommendation[]>> {
    return this.get(`/recommendations/${userId}`, { params });
  }

  /**
   * Analyze content
   */
  async analyzeContent(contentId: string): Promise<MicroserviceResponse<{
    sentiment: string;
    topics: string[];
    keywords: string[];
    quality: number;
  }>> {
    return this.post(`/analyze`, { contentId });
  }

  /**
   * Auto-tag content
   */
  async autoTagContent(contentId: string): Promise<MicroserviceResponse<{
    tags: string[];
    categories: string[];
    confidence: number;
  }>> {
    return this.post(`/autotag`, { contentId });
  }

  /**
   * Generate content description
   */
  async generateDescription(contentId: string): Promise<MicroserviceResponse<{
    title: string;
    description: string;
    hashtags: string[];
  }>> {
    return this.post(`/generate/description`, { contentId });
  }

  /**
   * Chat bot interaction
   */
  async chatBotReply(data: {
    userId: string;
    message: string;
    context?: any;
  }): Promise<MicroserviceResponse<{
    reply: string;
    intent: string;
    confidence: number;
  }>> {
    return this.post(`/chatbot/reply`, data);
  }
}

// Factory for AI services
export class AIFactory {
  private static connectors: Map<string, AIConnector> = new Map();

  static getConnector(serviceName: string): AIConnector {
    const serviceId = `ai-${serviceName.toLowerCase()}`;

    if (!this.connectors.has(serviceId)) {
      this.connectors.set(serviceId, new AIConnector(serviceId));
    }

    return this.connectors.get(serviceId)!;
  }

  static getServices() {
    return [
      'fanzai', 'fanzbot', 'fanzmod', 'fanzscan',
      'fanzfilter', 'fanzdetect', 'fanzanalyze', 'fanzrecommend'
    ];
  }
}
