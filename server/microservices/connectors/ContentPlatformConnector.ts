/**
 * FANZ Unified Ecosystem - Content Platform Connector
 * Connector for all 20 core content platforms
 */

import { MicroserviceConnector, MicroserviceResponse } from '../MicroserviceConnector';

export interface ContentItem {
  id: string;
  title: string;
  description?: string;
  type: 'image' | 'video' | 'audio' | 'text';
  url: string;
  creatorId: string;
  platform: string;
  status: 'draft' | 'published' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

export interface Creator {
  id: string;
  username: string;
  displayName: string;
  platform: string;
  verified: boolean;
  subscriberCount: number;
}

export class ContentPlatformConnector extends MicroserviceConnector {
  /**
   * Get content items for a platform
   */
  async getContent(platformId: string, params?: {
    page?: number;
    limit?: number;
    creatorId?: string;
    status?: string;
  }): Promise<MicroserviceResponse<ContentItem[]>> {
    return this.get(`/content`, { params });
  }

  /**
   * Get a specific content item
   */
  async getContentById(contentId: string): Promise<MicroserviceResponse<ContentItem>> {
    return this.get(`/content/${contentId}`);
  }

  /**
   * Create new content
   */
  async createContent(content: Partial<ContentItem>): Promise<MicroserviceResponse<ContentItem>> {
    return this.post(`/content`, content);
  }

  /**
   * Update content
   */
  async updateContent(contentId: string, updates: Partial<ContentItem>): Promise<MicroserviceResponse<ContentItem>> {
    return this.put(`/content/${contentId}`, updates);
  }

  /**
   * Delete content
   */
  async deleteContent(contentId: string): Promise<MicroserviceResponse<void>> {
    return this.delete(`/content/${contentId}`);
  }

  /**
   * Get creators for a platform
   */
  async getCreators(params?: {
    page?: number;
    limit?: number;
    verified?: boolean;
  }): Promise<MicroserviceResponse<Creator[]>> {
    return this.get(`/creators`, { params });
  }

  /**
   * Get a specific creator
   */
  async getCreatorById(creatorId: string): Promise<MicroserviceResponse<Creator>> {
    return this.get(`/creators/${creatorId}`);
  }

  /**
   * Get creator statistics
   */
  async getCreatorStats(creatorId: string): Promise<MicroserviceResponse<{
    views: number;
    likes: number;
    subscribers: number;
    revenue: number;
  }>> {
    return this.get(`/creators/${creatorId}/stats`);
  }

  /**
   * Search content
   */
  async searchContent(query: string, filters?: {
    type?: string;
    creatorId?: string;
    tags?: string[];
  }): Promise<MicroserviceResponse<ContentItem[]>> {
    return this.post(`/content/search`, { query, filters });
  }
}

// Factory function to create connectors for each platform
export class ContentPlatformFactory {
  private static connectors: Map<string, ContentPlatformConnector> = new Map();

  static getConnector(platformName: string): ContentPlatformConnector {
    const serviceId = `content-${platformName.toLowerCase()}`;

    if (!this.connectors.has(serviceId)) {
      this.connectors.set(serviceId, new ContentPlatformConnector(serviceId));
    }

    return this.connectors.get(serviceId)!;
  }

  static getAllPlatforms(): string[] {
    return [
      'fanzlab', 'boyfanz', 'girlfanz', 'daddyfanz', 'cougarfanz',
      'pupfanz', 'taboofanz', 'transfanz', 'fanzclips', 'fanztube',
      'bearfanz', 'twinkfanz', 'jockfanz', 'nerdfanz', 'gothfanz',
      'e-boyfanz', 'e-girlfanz', 'milffanz', 'dilffanz', 'femdomfanz'
    ];
  }

  static async healthCheckAll(): Promise<{ [key: string]: boolean }> {
    const results: { [key: string]: boolean } = {};

    for (const platform of this.getAllPlatforms()) {
      const connector = this.getConnector(platform);
      results[platform] = await connector.healthCheck();
    }

    return results;
  }
}
