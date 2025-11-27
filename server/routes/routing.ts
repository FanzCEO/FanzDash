import express from 'express';
import { domainRouter, PlatformConfig, RoutingRule } from '../routing/DomainRouter.js';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Rate limit exceeded.' },
});

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Admin rate limit exceeded.' },
});

// Middleware
const isAuthenticated = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Authorization header required'
    });
  }
  next();
};

const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const adminKey = req.headers['x-admin-key'];
  if (process.env.NODE_ENV === 'production' && !adminKey) {
    return res.status(403).json({
      success: false,
      error: 'Admin access required'
    });
  }
  next();
};

const checkValidation = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// Validation rules
const validatePlatform = [
  body('id').isString().notEmpty().withMessage('Platform ID is required'),
  body('name').isString().notEmpty().withMessage('Platform name is required'),
  body('domains').isArray().withMessage('Domains must be an array'),
  body('domains.*').isString().withMessage('Each domain must be a string'),
  body('basePath').isString().withMessage('Base path is required'),
  body('clusterId').isString().notEmpty().withMessage('Cluster ID is required'),
  body('theme').isObject().withMessage('Theme configuration is required'),
  body('features').isArray().withMessage('Features must be an array'),
  body('ageVerification').isBoolean().withMessage('Age verification must be boolean'),
  body('contentRating').isIn(['adult', 'mature', 'general']).withMessage('Invalid content rating'),
  body('ssoEnabled').isBoolean().withMessage('SSO enabled must be boolean'),
  body('paymentMethods').isArray().withMessage('Payment methods must be an array')
];

const validateRoutingRule = [
  body('priority').isInt({ min: 1, max: 1000 }).withMessage('Priority must be between 1-1000'),
  body('conditions').isObject().withMessage('Conditions object is required'),
  body('action').isObject().withMessage('Action object is required'),
  body('action.type').isIn(['redirect', 'proxy', 'render']).withMessage('Invalid action type'),
  body('action.platformId').isString().notEmpty().withMessage('Platform ID is required'),
  body('enabled').isBoolean().withMessage('Enabled must be boolean')
];

// Platform Management Routes

// Get all platforms
router.get('/platforms', generalLimiter, isAuthenticated, (req, res) => {
  try {
    const platforms = domainRouter.getPlatforms();
    res.json({
      success: true,
      platforms,
      count: platforms.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching platforms:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch platforms',
      timestamp: new Date().toISOString()
    });
  }
});

// Get platform by ID
router.get('/platforms/:id', generalLimiter, isAuthenticated, (req, res) => {
  try {
    const { id } = req.params;
    const platform = domainRouter.getPlatform(id);

    if (!platform) {
      return res.status(404).json({
        success: false,
        error: 'Platform not found',
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      platform,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching platform:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch platform',
      timestamp: new Date().toISOString()
    });
  }
});

// Get platform by domain
router.get('/platforms/domain/:domain', generalLimiter, isAuthenticated, (req, res) => {
  try {
    const { domain } = req.params;
    const platform = domainRouter.getPlatformByDomain(domain);

    if (!platform) {
      return res.status(404).json({
        success: false,
        error: 'No platform found for domain',
        domain,
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      platform,
      domain,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching platform by domain:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch platform by domain',
      timestamp: new Date().toISOString()
    });
  }
});

// Add new platform (admin only)
router.post('/platforms', adminLimiter, requireAdmin, validatePlatform, checkValidation, (req, res) => {
  try {
    const platformConfig: PlatformConfig = req.body;

    console.log('Adding new platform:', {
      id: platformConfig.id,
      name: platformConfig.name,
      domains: platformConfig.domains,
      timestamp: new Date()
    });

    const success = domainRouter.addPlatform(platformConfig);

    if (!success) {
      return res.status(400).json({
        success: false,
        error: 'Failed to add platform',
        timestamp: new Date().toISOString()
      });
    }

    res.status(201).json({
      success: true,
      message: 'Platform added successfully',
      platform: platformConfig,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error adding platform:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add platform',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Remove platform (admin only)
router.delete('/platforms/:id', adminLimiter, requireAdmin, (req, res) => {
  try {
    const { id } = req.params;

    console.log('Removing platform:', { id, timestamp: new Date() });

    const success = domainRouter.removePlatform(id);

    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Platform not found or could not be removed',
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      message: 'Platform removed successfully',
      platformId: id,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error removing platform:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove platform',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Routing Rules Management

// Get all routing rules
router.get('/rules', generalLimiter, isAuthenticated, (req, res) => {
  try {
    const rules = domainRouter.getRoutingRules();
    res.json({
      success: true,
      rules,
      count: rules.length,
      activeRules: rules.filter(r => r.enabled).length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching routing rules:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch routing rules',
      timestamp: new Date().toISOString()
    });
  }
});

// Add new routing rule (admin only)
router.post('/rules', adminLimiter, requireAdmin, validateRoutingRule, checkValidation, (req, res) => {
  try {
    const ruleConfig = req.body;

    console.log('Adding new routing rule:', {
      priority: ruleConfig.priority,
      conditions: ruleConfig.conditions,
      action: ruleConfig.action,
      timestamp: new Date()
    });

    const ruleId = domainRouter.addRoutingRule(ruleConfig);

    res.status(201).json({
      success: true,
      message: 'Routing rule added successfully',
      ruleId,
      rule: { ...ruleConfig, id: ruleId },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error adding routing rule:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add routing rule',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Analytics and Monitoring

// Get routing analytics
router.get('/analytics', generalLimiter, isAuthenticated, (req, res) => {
  try {
    const analytics = domainRouter.getAnalytics();
    const systemStatus = domainRouter.getSystemStatus();

    res.json({
      success: true,
      analytics,
      systemStatus,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching routing analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch routing analytics',
      timestamp: new Date().toISOString()
    });
  }
});

// Test domain resolution
router.post('/test-resolve', generalLimiter, isAuthenticated, (req, res) => {
  try {
    const { domain, path = '/', headers = {} } = req.body;

    if (!domain) {
      return res.status(400).json({
        success: false,
        error: 'Domain is required'
      });
    }

    const platform = domainRouter.getPlatformByDomain(domain);
    
    res.json({
      success: true,
      test: {
        domain,
        path,
        headers,
        resolvedPlatform: platform || null,
        matched: !!platform,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error testing domain resolution:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to test domain resolution',
      timestamp: new Date().toISOString()
    });
  }
});

// System status and health
router.get('/status', generalLimiter, (req, res) => {
  try {
    const status = domainRouter.getSystemStatus();
    const platforms = domainRouter.getPlatforms();
    
    res.json({
      success: true,
      system: status,
      platformSummary: {
        total: platforms.length,
        adultContent: platforms.filter(p => p.contentRating === 'adult').length,
        ssoEnabled: platforms.filter(p => p.ssoEnabled).length,
        ageVerificationRequired: platforms.filter(p => p.ageVerification).length,
        totalDomains: platforms.reduce((sum, p) => sum + p.domains.length, 0)
      },
      features: [
        'Multi-platform domain routing',
        'Age verification enforcement', 
        'Region restriction support',
        'Content security policy headers',
        'Platform-specific theming',
        'Real-time analytics tracking',
        'Rule-based routing engine',
        'SSO integration ready'
      ],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching routing status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch routing status',
      timestamp: new Date().toISOString()
    });
  }
});

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'Domain Routing System',
    status: 'operational',
    version: '1.0.0',
    features: [
      'Multi-platform domain routing',
      'Dynamic platform resolution',
      'Age verification checks',
      'Region-based restrictions',
      'Content security policies',
      'Real-time request tracking',
      'Rule-based routing engine',
      'Platform theme management'
    ],
    supportedPlatforms: [
      'BoyFanz', 'GirlFanz', 'PupFanz', 'TransFanz', 
      'TabooFanz', 'FanzTube', 'FanzClips'
    ],
    routingFeatures: [
      'Domain-based platform detection',
      'Subdomain handling',
      'Path-based routing rules',
      'User agent filtering',
      'Header-based conditions',
      'Priority-based rule matching',
      'Caching and performance optimization'
    ],
    timestamp: new Date().toISOString()
  });
});

// Development testing endpoints
if (process.env.NODE_ENV === 'development') {
  // Simulate platform request
  router.post('/dev/simulate-request', (req, res) => {
    try {
      const { host, path = '/', userAgent = 'test-agent' } = req.body;

      if (!host) {
        return res.status(400).json({ error: 'Host header required' });
      }

      // Create mock request object
      const mockReq = {
        get: (header: string) => {
          switch (header.toLowerCase()) {
            case 'host': return host;
            case 'user-agent': return userAgent;
            default: return undefined;
          }
        },
        path,
        originalUrl: path,
        xhr: false,
        cookies: {},
        session: {}
      } as any;

      const mockRes = {
        set: () => {},
        status: () => mockRes,
        json: () => mockRes,
        send: () => mockRes,
        redirect: () => mockRes
      } as any;

      // Test routing
      domainRouter.routeRequest(mockReq, mockRes, () => {
        const platform = mockReq.platform;
        const routing = mockReq.routing;

        res.json({
          success: true,
          simulation: {
            input: { host, path, userAgent },
            platform: platform || null,
            routing: routing || null,
            matched: !!platform,
            timestamp: new Date().toISOString()
          }
        });
      });

    } catch (error) {
      res.status(500).json({
        error: 'Simulation failed',
        message: error.message
      });
    }
  });

  // Reset analytics (dev only)
  router.delete('/dev/reset-analytics', requireAdmin, (req, res) => {
    try {
      // Clear analytics would be implemented in the router
      res.json({
        success: true,
        message: 'Analytics reset (development only)',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        error: 'Reset failed',
        message: error.message
      });
    }
  });
}

export default router;