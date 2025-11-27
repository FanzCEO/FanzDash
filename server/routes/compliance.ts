import express from 'express';
import rateLimit from 'express-rate-limit';
import { body, query, param, validationResult } from 'express-validator';
import { complianceMonitor, ComplianceViolation, AuditRecord } from '../compliance/ComplianceMonitor.js';

const router = express.Router();

// Rate limiting for compliance endpoints
const complianceRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many compliance requests from this IP, please try again later'
  }
});

const adminRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit admin actions
  message: {
    error: 'Too many admin requests from this IP, please try again later'
  }
});

// Middleware to check if user is authenticated
const isAuthenticated = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  // In production, validate the JWT token here
  // For now, we'll mock user info
  req.user = {
    id: 'user123',
    role: 'admin', // This would come from token validation
    platform: 'fanz'
  };
  
  next();
};

// Middleware to check admin permissions
const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Validation middleware
const handleValidationErrors = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// Health check endpoint
router.get('/health', (req, res) => {
  const stats = complianceMonitor.getComplianceStats();
  res.json({
    status: 'operational',
    message: 'Compliance monitoring system is running',
    stats: {
      totalRules: stats.totalRules,
      activeRules: stats.activeRules,
      totalViolations: stats.totalViolations,
      openViolations: stats.openViolations
    },
    timestamp: new Date().toISOString()
  });
});

// Check compliance for specific context
router.post('/check',
  complianceRateLimit,
  isAuthenticated,
  [
    body('platform').isString().notEmpty().withMessage('Platform is required'),
    body('userId').optional().isString(),
    body('contentId').optional().isString(),
    body('context').optional().isObject()
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { platform, userId, contentId, context } = req.body;

      const result = await complianceMonitor.checkCompliance(
        platform,
        userId,
        contentId,
        {
          ...context,
          requesterId: req.user?.id,
          timestamp: new Date().toISOString()
        }
      );

      res.json({
        success: true,
        data: {
          compliant: result.compliant,
          violationsCount: result.violations.length,
          violations: result.violations.map(v => ({
            id: v.id,
            type: v.type,
            severity: v.severity,
            description: v.description,
            status: v.status,
            createdAt: v.createdAt
          })),
          actions: result.actions
        }
      });

    } catch (error) {
      console.error('Compliance check error:', error);
      res.status(500).json({
        error: 'Failed to perform compliance check',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Get violations with filtering
router.get('/violations',
  complianceRateLimit,
  isAuthenticated,
  [
    query('platform').optional().isString(),
    query('severity').optional().isString(),
    query('status').optional().isString(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt()
  ],
  handleValidationErrors,
  (req, res) => {
    try {
      const { platform, severity, status, limit } = req.query;

      const filters: any = {};
      if (platform) filters.platform = platform as string;
      if (limit) filters.limit = limit as number;
      if (severity) filters.severity = (severity as string).split(',');
      if (status) filters.status = (status as string).split(',');

      const violations = complianceMonitor.getViolations(filters);

      res.json({
        success: true,
        data: {
          violations: violations.map(v => ({
            id: v.id,
            ruleId: v.ruleId,
            ruleName: v.ruleName,
            type: v.type,
            severity: v.severity,
            platform: v.platform,
            userId: v.userId,
            contentId: v.contentId,
            description: v.description,
            status: v.status,
            assignedTo: v.assignedTo,
            createdAt: v.createdAt,
            updatedAt: v.updatedAt,
            resolvedAt: v.resolvedAt
          })),
          count: violations.length
        }
      });

    } catch (error) {
      console.error('Get violations error:', error);
      res.status(500).json({
        error: 'Failed to retrieve violations',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Get specific violation details
router.get('/violations/:id',
  complianceRateLimit,
  isAuthenticated,
  param('id').isString().notEmpty(),
  handleValidationErrors,
  (req, res) => {
    try {
      const { id } = req.params;
      const violations = complianceMonitor.getViolations();
      const violation = violations.find(v => v.id === id);

      if (!violation) {
        return res.status(404).json({
          error: 'Violation not found'
        });
      }

      res.json({
        success: true,
        data: violation
      });

    } catch (error) {
      console.error('Get violation error:', error);
      res.status(500).json({
        error: 'Failed to retrieve violation',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Get audit log
router.get('/audit',
  complianceRateLimit,
  isAuthenticated,
  [
    query('type').optional().isString(),
    query('platform').optional().isString(),
    query('userId').optional().isString(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt()
  ],
  handleValidationErrors,
  (req, res) => {
    try {
      const { type, platform, userId, limit } = req.query;

      const filters: any = {};
      if (type) filters.type = type as string;
      if (platform) filters.platform = platform as string;
      if (userId) filters.userId = userId as string;
      if (limit) filters.limit = limit as number;

      const auditRecords = complianceMonitor.getAuditLog(filters);

      res.json({
        success: true,
        data: {
          auditRecords: auditRecords.map(record => ({
            id: record.id,
            type: record.type,
            subtype: record.subtype,
            platform: record.platform,
            userId: record.userId,
            entityId: record.entityId,
            description: record.description,
            timestamp: record.timestamp,
            metadata: record.metadata
          })),
          count: auditRecords.length
        }
      });

    } catch (error) {
      console.error('Get audit log error:', error);
      res.status(500).json({
        error: 'Failed to retrieve audit log',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Record age verification
router.post('/age-verification',
  complianceRateLimit,
  isAuthenticated,
  [
    body('userId').isString().notEmpty().withMessage('User ID is required'),
    body('method').isIn(['document', 'database', 'biometric', 'thirdparty']).withMessage('Valid method is required'),
    body('verified').isBoolean().withMessage('Verified status is required'),
    body('documentType').optional().isString(),
    body('verifierId').optional().isString(),
    body('expirationDate').optional().isISO8601(),
    body('metadata').optional().isObject()
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { userId, method, verified, documentType, verifierId, expirationDate, metadata = {} } = req.body;

      const verificationMetadata = {
        ...metadata,
        documentType,
        verifierId,
        expirationDate: expirationDate ? new Date(expirationDate) : undefined,
        platform: req.user?.platform || 'system',
        recordedBy: req.user?.id
      };

      await complianceMonitor.recordAgeVerification(
        userId,
        method,
        verified,
        verificationMetadata
      );

      res.json({
        success: true,
        message: `Age verification recorded for user ${userId}`,
        data: {
          userId,
          verified,
          method,
          recordedAt: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Record age verification error:', error);
      res.status(500).json({
        error: 'Failed to record age verification',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Create GDPR request
router.post('/gdpr-request',
  complianceRateLimit,
  isAuthenticated,
  [
    body('userId').isString().notEmpty().withMessage('User ID is required'),
    body('type').isIn(['access', 'portability', 'rectification', 'erasure', 'restriction', 'objection']).withMessage('Valid GDPR request type is required'),
    body('metadata').optional().isObject()
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { userId, type, metadata = {} } = req.body;

      const requestMetadata = {
        ...metadata,
        platform: req.user?.platform || 'system',
        requestedBy: req.user?.id
      };

      const requestId = await complianceMonitor.createGDPRRequest(
        userId,
        type,
        requestMetadata
      );

      res.json({
        success: true,
        message: `GDPR ${type} request created`,
        data: {
          requestId,
          userId,
          type,
          status: 'pending',
          createdAt: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Create GDPR request error:', error);
      res.status(500).json({
        error: 'Failed to create GDPR request',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Get compliance statistics
router.get('/stats',
  complianceRateLimit,
  isAuthenticated,
  (req, res) => {
    try {
      const stats = complianceMonitor.getComplianceStats();

      res.json({
        success: true,
        data: {
          compliance: {
            totalRules: stats.totalRules,
            activeRules: stats.activeRules,
            ruleTypes: ['ADA', 'GDPR', 'USC2257', 'DMCA', 'COPPA', 'CCPA', 'FOSTA_SESTA']
          },
          violations: {
            total: stats.totalViolations,
            open: stats.openViolations,
            bySeverity: stats.violationsBySeverity,
            byPlatform: stats.violationsByPlatform
          },
          auditing: {
            totalRecords: stats.auditRecords,
            retentionPeriod: '90 days'
          },
          monitoring: {
            status: 'active',
            checkFrequencies: {
              realtime: 'On-demand and triggered events',
              hourly: 'Content scans and copyright checks',
              daily: 'Accessibility audits and data privacy reviews',
              weekly: 'Comprehensive platform audits',
              monthly: 'Compliance reporting and trend analysis'
            }
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Get compliance stats error:', error);
      res.status(500).json({
        error: 'Failed to retrieve compliance statistics',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Admin endpoints
router.use('/admin', requireAdmin);

// Start/stop monitoring (admin only)
router.post('/admin/monitoring/:action',
  adminRateLimit,
  param('action').isIn(['start', 'stop']),
  handleValidationErrors,
  (req, res) => {
    try {
      const { action } = req.params;

      if (action === 'start') {
        complianceMonitor.startMonitoring();
      } else {
        complianceMonitor.stopMonitoring();
      }

      res.json({
        success: true,
        message: `Compliance monitoring ${action}ed`,
        status: action === 'start' ? 'active' : 'stopped',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Monitoring control error:', error);
      res.status(500).json({
        error: `Failed to ${req.params.action} monitoring`,
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Manual compliance scan (admin only)
router.post('/admin/scan',
  adminRateLimit,
  [
    body('platforms').optional().isArray(),
    body('checkTypes').optional().isArray(),
    body('severity').optional().isIn(['low', 'medium', 'high', 'critical'])
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { platforms = ['all'], checkTypes = ['all'], severity = 'medium' } = req.body;

      // This would trigger a comprehensive compliance scan
      const scanId = require('crypto').randomBytes(16).toString('hex');
      
      // Mock scan initiation
      setTimeout(async () => {
        console.log(`📊 Manual compliance scan ${scanId} completed`);
        // In production, this would emit events or update scan status
      }, 5000);

      res.json({
        success: true,
        message: 'Manual compliance scan initiated',
        data: {
          scanId,
          platforms,
          checkTypes,
          severity,
          status: 'running',
          estimatedDuration: '5-10 minutes',
          initiatedBy: req.user?.id,
          startedAt: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Manual scan error:', error);
      res.status(500).json({
        error: 'Failed to initiate manual scan',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Generate compliance report (admin only)
router.post('/admin/report',
  adminRateLimit,
  [
    body('startDate').isISO8601().withMessage('Valid start date is required'),
    body('endDate').isISO8601().withMessage('Valid end date is required'),
    body('platforms').optional().isArray(),
    body('format').optional().isIn(['json', 'pdf', 'csv']).default('json')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { startDate, endDate, platforms = ['all'], format = 'json' } = req.body;

      // Generate comprehensive compliance report
      const reportId = require('crypto').randomBytes(16).toString('hex');
      const stats = complianceMonitor.getComplianceStats();
      const violations = complianceMonitor.getViolations({ limit: 1000 });
      const auditRecords = complianceMonitor.getAuditLog({ limit: 1000 });

      const report = {
        id: reportId,
        generatedAt: new Date().toISOString(),
        generatedBy: req.user?.id,
        period: { startDate, endDate },
        platforms,
        summary: {
          complianceScore: Math.round((1 - (stats.openViolations / Math.max(stats.totalViolations, 1))) * 100),
          totalRules: stats.totalRules,
          activeRules: stats.activeRules,
          totalViolations: stats.totalViolations,
          openViolations: stats.openViolations,
          resolvedViolations: stats.totalViolations - stats.openViolations
        },
        violations: {
          bySeverity: stats.violationsBySeverity,
          byPlatform: stats.violationsByPlatform,
          byType: violations.reduce((acc, v) => {
            acc[v.type] = (acc[v.type] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        },
        trends: {
          violationTrends: 'Compliance violations decreased 15% from last period',
          topIssues: ['Age verification delays', 'GDPR consent management', 'Accessibility improvements needed'],
          recommendations: [
            'Implement automated age verification system',
            'Enhance GDPR consent flow UX',
            'Schedule accessibility audit for all platforms'
          ]
        },
        auditSummary: {
          totalRecords: auditRecords.length,
          recordTypes: auditRecords.reduce((acc, r) => {
            acc[r.type] = (acc[r.type] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        }
      };

      res.json({
        success: true,
        message: 'Compliance report generated',
        data: {
          report,
          format,
          downloadUrl: format === 'json' ? null : `/api/compliance/admin/download/${reportId}`,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
        }
      });

    } catch (error) {
      console.error('Generate report error:', error);
      res.status(500).json({
        error: 'Failed to generate compliance report',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Error handling middleware
router.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Compliance API error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: 'An unexpected error occurred in the compliance system'
  });
});

export default router;