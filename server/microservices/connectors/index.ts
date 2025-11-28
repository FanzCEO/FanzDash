/**
 * FANZ Unified Ecosystem - Microservice Connectors Index
 * Central export for all microservice connectors
 */

// Base connector
export * from '../MicroserviceConnector';

// Specific connectors
export * from './ContentPlatformConnector';
export * from './SecurityConnector';
export * from './PaymentConnector';
export * from './AnalyticsConnector';
export * from './CommunicationConnector';
export * from './AIConnector';

// Additional connectors for remaining services
import { MicroserviceConnector } from '../MicroserviceConnector';

/**
 * Content Management Connector
 */
export class ContentManagementConnector extends MicroserviceConnector {}

/**
 * Social Services Connector
 */
export class SocialConnector extends MicroserviceConnector {}

/**
 * Marketplace Connector
 */
export class MarketplaceConnector extends MicroserviceConnector {}

/**
 * Infrastructure Connector
 */
export class InfrastructureConnector extends MicroserviceConnector {}

/**
 * Specialized Platform Connector
 */
export class SpecializedPlatformConnector extends MicroserviceConnector {}

/**
 * Master Connector Factory
 * Provides access to all microservice connectors
 */
export class MicroserviceConnectorFactory {
  private static connectors: Map<string, MicroserviceConnector> = new Map();

  /**
   * Get connector for any service by ID
   */
  static getConnector(serviceId: string): MicroserviceConnector {
    if (!this.connectors.has(serviceId)) {
      // Determine connector type based on service ID prefix
      let ConnectorClass = MicroserviceConnector;

      if (serviceId.startsWith('content-')) {
        const { ContentPlatformConnector } = require('./ContentPlatformConnector');
        ConnectorClass = ContentPlatformConnector;
      } else if (serviceId.startsWith('security-')) {
        const { SecurityConnector } = require('./SecurityConnector');
        ConnectorClass = SecurityConnector;
      } else if (serviceId.startsWith('payment-')) {
        const { PaymentConnector } = require('./PaymentConnector');
        ConnectorClass = PaymentConnector;
      } else if (serviceId.startsWith('analytics-')) {
        const { AnalyticsConnector } = require('./AnalyticsConnector');
        ConnectorClass = AnalyticsConnector;
      } else if (serviceId.startsWith('comm-')) {
        const { CommunicationConnector } = require('./CommunicationConnector');
        ConnectorClass = CommunicationConnector;
      } else if (serviceId.startsWith('ai-')) {
        const { AIConnector } = require('./AIConnector');
        ConnectorClass = AIConnector;
      } else if (serviceId.startsWith('content-mgmt-')) {
        ConnectorClass = ContentManagementConnector;
      } else if (serviceId.startsWith('social-')) {
        ConnectorClass = SocialConnector;
      } else if (serviceId.startsWith('marketplace-')) {
        ConnectorClass = MarketplaceConnector;
      } else if (serviceId.startsWith('infra-')) {
        ConnectorClass = InfrastructureConnector;
      } else if (serviceId.startsWith('specialized-')) {
        ConnectorClass = SpecializedPlatformConnector;
      }

      this.connectors.set(serviceId, new ConnectorClass(serviceId));
    }

    return this.connectors.get(serviceId)!;
  }

  /**
   * Health check all services
   */
  static async healthCheckAll(): Promise<{ [serviceId: string]: boolean }> {
    const results: { [serviceId: string]: boolean } = {};

    for (const [serviceId, connector] of this.connectors.entries()) {
      results[serviceId] = await connector.healthCheck();
    }

    return results;
  }

  /**
   * Clear all connectors
   */
  static clearAll(): void {
    this.connectors.clear();
  }
}
