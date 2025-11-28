/**
 * FANZ Unified Ecosystem - Microservices Gateway Routes
 * Mounts the API Gateway for all 200+ microservices
 */

import { Router, Request, Response } from 'express';
import { apiGateway } from '../microservices/APIGateway';
import { serviceRegistry } from '../microservices/ServiceRegistry';

const router = Router();

/**
 * Mount the main API Gateway router
 * This provides access to all registered microservices
 */
router.use('/', apiGateway.getRouter());

/**
 * Service Registry Statistics
 * GET /api/gateway/services/registry/stats
 */
router.get('/services/registry/stats', (req: Request, res: Response) => {
  const stats = serviceRegistry.getStats();
  res.json({
    ...stats,
    message: 'FANZ Unified Ecosystem - Service Registry',
    timestamp: new Date().toISOString(),
    totalServices: stats.total,
    activeServices: stats.active,
    categoriesBreakdown: stats.byCategory
  });
});

/**
 * List all registered services
 * GET /api/gateway/services/list
 */
router.get('/services/list', (req: Request, res: Response) => {
  const services = serviceRegistry.getActiveServices();
  res.json({
    count: services.length,
    services: services.map(service => ({
      id: service.id,
      name: service.name,
      category: service.category,
      endpoint: service.endpoint,
      status: service.status,
      version: service.version
    }))
  });
});

/**
 * Get services by category
 * GET /api/gateway/services/category/:category
 */
router.get('/services/category/:category', (req: Request, res: Response) => {
  const { category } = req.params;
  const services = serviceRegistry.getServicesByCategory(category);
  res.json({
    category,
    count: services.length,
    services
  });
});

/**
 * Check health of a specific service
 * GET /api/gateway/services/:serviceId/health
 */
router.get('/services/:serviceId/health', async (req: Request, res: Response) => {
  const { serviceId } = req.params;
  const service = serviceRegistry.getService(serviceId);

  if (!service) {
    return res.status(404).json({ error: `Service ${serviceId} not found` });
  }

  res.json({
    serviceId: service.id,
    serviceName: service.name,
    status: service.status,
    endpoint: service.endpoint,
    healthCheck: service.healthCheck
  });
});

console.log('✅ Microservices Gateway routes initialized');
console.log(`📊 Total services registered: ${serviceRegistry.getStats().total}`);

export default router;
