/**
 * FANZ Unified Ecosystem - API Gateway
 * Central gateway for routing requests to 200+ microservices
 */

import { Request, Response, NextFunction, Router } from 'express';
import { serviceRegistry, MicroserviceDefinition } from './ServiceRegistry';
import axios, { AxiosRequestConfig } from 'axios';

export class APIGateway {
  private router: Router;
  private requestCache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheTTL = 60000; // 1 minute cache TTL

  constructor() {
    this.router = Router();
    this.setupRoutes();
  }

  /**
   * Get the Express router
   */
  getRouter(): Router {
    return this.router;
  }

  /**
   * Setup API Gateway routes
   */
  private setupRoutes(): void {
    // Health check for the gateway itself
    this.router.get('/gateway/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: serviceRegistry.getStats()
      });
    });

    // Get all registered services
    this.router.get('/gateway/services', (req, res) => {
      const stats = serviceRegistry.getStats();
      res.json({
        ...stats,
        services: serviceRegistry.getActiveServices()
      });
    });

    // Get services by category
    this.router.get('/gateway/services/:category', (req, res) => {
      const { category } = req.params;
      const services = serviceRegistry.getServicesByCategory(category);
      res.json({
        category,
        count: services.length,
        services
      });
    });

    // Dynamic routing to all microservices
    this.router.all('/gateway/proxy/:serviceId/*', this.proxyRequest.bind(this));

    // Core Content Platforms Routes
    this.setupContentPlatformRoutes();

    // Security & Compliance Routes
    this.setupSecurityRoutes();

    // Payment & Finance Routes
    this.setupPaymentRoutes();

    // Analytics & Marketing Routes
    this.setupAnalyticsRoutes();

    // Content Management Routes
    this.setupContentManagementRoutes();

    // Communication Routes
    this.setupCommunicationRoutes();

    // Social Routes
    this.setupSocialRoutes();

    // Marketplace Routes
    this.setupMarketplaceRoutes();

    // AI & Automation Routes
    this.setupAIRoutes();

    // Infrastructure Routes
    this.setupInfrastructureRoutes();

    // Specialized Platform Routes
    this.setupSpecializedRoutes();
  }

  /**
   * Proxy request to a microservice
   */
  private async proxyRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { serviceId } = req.params;
    const path = req.params[0];

    try {
      const service = serviceRegistry.getService(serviceId);
      if (!service) {
        res.status(404).json({ error: `Service ${serviceId} not found` });
        return;
      }

      if (service.status !== 'active') {
        res.status(503).json({ error: `Service ${serviceId} is currently ${service.status}` });
        return;
      }

      // Check cache for GET requests
      const cacheKey = `${serviceId}:${req.method}:${path}:${JSON.stringify(req.query)}`;
      if (req.method === 'GET') {
        const cached = this.getFromCache(cacheKey);
        if (cached) {
          res.json(cached);
          return;
        }
      }

      // Forward the request to the microservice
      const targetUrl = `http://localhost:${service.port}${service.endpoint}/${path}`;
      const config: AxiosRequestConfig = {
        method: req.method as any,
        url: targetUrl,
        params: req.query,
        data: req.body,
        headers: {
          ...req.headers,
          'X-Forwarded-For': req.ip,
          'X-Gateway-Service': serviceId
        },
        timeout: 30000 // 30 second timeout
      };

      const response = await axios(config);

      // Cache successful GET responses
      if (req.method === 'GET' && response.status === 200) {
        this.saveToCache(cacheKey, response.data);
      }

      res.status(response.status).json(response.data);
    } catch (error: any) {
      console.error(`Gateway proxy error for ${serviceId}:`, error.message);

      if (error.response) {
        res.status(error.response.status).json(error.response.data);
      } else if (error.code === 'ECONNREFUSED') {
        serviceRegistry.updateServiceStatus(serviceId, 'error');
        res.status(503).json({
          error: `Service ${serviceId} is unavailable`,
          message: 'Connection refused'
        });
      } else {
        res.status(500).json({
          error: 'Gateway error',
          message: error.message
        });
      }
    }
  }

  /**
   * Setup Content Platform Routes
   */
  private setupContentPlatformRoutes(): void {
    this.router.all('/api/platforms/:platform/*', async (req, res, next) => {
      const { platform } = req.params;
      const serviceId = `content-${platform.toLowerCase()}`;
      req.params.serviceId = serviceId;
      await this.proxyRequest(req, res, next);
    });
  }

  /**
   * Setup Security Routes
   */
  private setupSecurityRoutes(): void {
    this.router.all('/api/security/:service/*', async (req, res, next) => {
      const { service } = req.params;
      const serviceId = `security-${service.toLowerCase()}`;
      req.params.serviceId = serviceId;
      await this.proxyRequest(req, res, next);
    });
  }

  /**
   * Setup Payment Routes
   */
  private setupPaymentRoutes(): void {
    this.router.all('/api/payments/:service/*', async (req, res, next) => {
      const { service } = req.params;
      const serviceId = `payment-${service.toLowerCase()}`;
      req.params.serviceId = serviceId;
      await this.proxyRequest(req, res, next);
    });
  }

  /**
   * Setup Analytics Routes
   */
  private setupAnalyticsRoutes(): void {
    this.router.all('/api/analytics/:service/*', async (req, res, next) => {
      const { service } = req.params;
      const serviceId = `analytics-${service.toLowerCase()}`;
      req.params.serviceId = serviceId;
      await this.proxyRequest(req, res, next);
    });
  }

  /**
   * Setup Content Management Routes
   */
  private setupContentManagementRoutes(): void {
    this.router.all('/api/content/:service/*', async (req, res, next) => {
      const { service } = req.params;
      const serviceId = `content-mgmt-${service.toLowerCase()}`;
      req.params.serviceId = serviceId;
      await this.proxyRequest(req, res, next);
    });
  }

  /**
   * Setup Communication Routes
   */
  private setupCommunicationRoutes(): void {
    this.router.all('/api/communication/:service/*', async (req, res, next) => {
      const { service } = req.params;
      const serviceId = `comm-${service.toLowerCase()}`;
      req.params.serviceId = serviceId;
      await this.proxyRequest(req, res, next);
    });
  }

  /**
   * Setup Social Routes
   */
  private setupSocialRoutes(): void {
    this.router.all('/api/social/:service/*', async (req, res, next) => {
      const { service } = req.params;
      const serviceId = `social-${service.toLowerCase()}`;
      req.params.serviceId = serviceId;
      await this.proxyRequest(req, res, next);
    });
  }

  /**
   * Setup Marketplace Routes
   */
  private setupMarketplaceRoutes(): void {
    this.router.all('/api/marketplace/:service/*', async (req, res, next) => {
      const { service } = req.params;
      const serviceId = `marketplace-${service.toLowerCase()}`;
      req.params.serviceId = serviceId;
      await this.proxyRequest(req, res, next);
    });
  }

  /**
   * Setup AI Routes
   */
  private setupAIRoutes(): void {
    this.router.all('/api/ai/:service/*', async (req, res, next) => {
      const { service } = req.params;
      const serviceId = `ai-${service.toLowerCase()}`;
      req.params.serviceId = serviceId;
      await this.proxyRequest(req, res, next);
    });
  }

  /**
   * Setup Infrastructure Routes
   */
  private setupInfrastructureRoutes(): void {
    this.router.all('/api/infrastructure/:service/*', async (req, res, next) => {
      const { service } = req.params;
      const serviceId = `infra-${service.toLowerCase()}`;
      req.params.serviceId = serviceId;
      await this.proxyRequest(req, res, next);
    });
  }

  /**
   * Setup Specialized Platform Routes
   */
  private setupSpecializedRoutes(): void {
    this.router.all('/api/specialized/:service/*', async (req, res, next) => {
      const { service } = req.params;
      const serviceId = `specialized-${service.toLowerCase()}`;
      req.params.serviceId = serviceId;
      await this.proxyRequest(req, res, next);
    });
  }

  /**
   * Get data from cache
   */
  private getFromCache(key: string): any | null {
    const cached = this.requestCache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data;
    }
    return null;
  }

  /**
   * Save data to cache
   */
  private saveToCache(key: string, data: any): void {
    this.requestCache.set(key, {
      data,
      timestamp: Date.now()
    });

    // Clean old cache entries
    if (this.requestCache.size > 1000) {
      const now = Date.now();
      for (const [k, v] of this.requestCache.entries()) {
        if (now - v.timestamp > this.cacheTTL) {
          this.requestCache.delete(k);
        }
      }
    }
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.requestCache.clear();
  }
}

// Export singleton instance
export const apiGateway = new APIGateway();
