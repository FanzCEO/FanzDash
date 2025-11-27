/**
 * FANZ Unified Ecosystem - Communication Services Connector
 * Connector for all 6 communication services
 */

import { MicroserviceConnector, MicroserviceResponse } from '../MicroserviceConnector';

export interface Message {
  id: string;
  fromUserId: string;
  toUserId: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'audio';
  read: boolean;
  createdAt: Date;
}

export interface LiveStream {
  id: string;
  creatorId: string;
  title: string;
  status: 'scheduled' | 'live' | 'ended';
  viewerCount: number;
  streamUrl: string;
  startedAt?: Date;
}

export class CommunicationConnector extends MicroserviceConnector {
  /**
   * Send message
   */
  async sendMessage(data: {
    fromUserId: string;
    toUserId: string;
    content: string;
    type?: string;
  }): Promise<MicroserviceResponse<Message>> {
    return this.post(`/messages/send`, data);
  }

  /**
   * Get messages
   */
  async getMessages(userId: string, otherUserId: string, params?: {
    limit?: number;
    before?: string;
  }): Promise<MicroserviceResponse<Message[]>> {
    return this.get(`/messages/${userId}/${otherUserId}`, { params });
  }

  /**
   * Start live stream
   */
  async startLiveStream(data: {
    creatorId: string;
    title: string;
    description?: string;
  }): Promise<MicroserviceResponse<LiveStream>> {
    return this.post(`/live/start`, data);
  }

  /**
   * End live stream
   */
  async endLiveStream(streamId: string): Promise<MicroserviceResponse<void>> {
    return this.post(`/live/${streamId}/end`, {});
  }

  /**
   * Get active streams
   */
  async getActiveStreams(params?: {
    limit?: number;
    category?: string;
  }): Promise<MicroserviceResponse<LiveStream[]>> {
    return this.get(`/live/active`, { params });
  }

  /**
   * Start video/audio call
   */
  async startCall(data: {
    callerId: string;
    recipientId: string;
    type: 'audio' | 'video';
  }): Promise<MicroserviceResponse<{
    callId: string;
    roomUrl: string;
  }>> {
    return this.post(`/calls/start`, data);
  }

  /**
   * Send notification
   */
  async sendNotification(data: {
    userId: string;
    title: string;
    message: string;
    type: string;
    link?: string;
  }): Promise<MicroserviceResponse<void>> {
    return this.post(`/notifications/send`, data);
  }
}

// Factory for communication services
export class CommunicationFactory {
  private static connectors: Map<string, CommunicationConnector> = new Map();

  static getConnector(serviceName: string): CommunicationConnector {
    const serviceId = `comm-${serviceName.toLowerCase()}`;

    if (!this.connectors.has(serviceId)) {
      this.connectors.set(serviceId, new CommunicationConnector(serviceId));
    }

    return this.connectors.get(serviceId)!;
  }

  static getServices() {
    return [
      'fanzchat', 'fanzlive', 'fanzcall',
      'fanzmail', 'fanznotify', 'fanzsupport'
    ];
  }
}
