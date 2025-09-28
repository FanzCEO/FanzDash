import express from 'express';
import { creatorPayoutSystem } from '../payouts/CreatorPayoutSystem.js';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Rate limiting for payout operations
const payoutLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 payout requests per windowMs
  message: { error: 'Too many payout requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // 100 requests per 15 minutes
  message: { error: 'Rate limit exceeded.' },
});

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200, // 200 admin requests per 15 minutes
  message: { error: 'Admin rate limit exceeded.' },
});

// Input validation
const validateCreatorRegistration = [
  body('userId').isString().notEmpty().withMessage('User ID is required'),
  body('displayName').isString().notEmpty().withMessage('Display name is required'),
  body('platforms').isArray().optional(),
  body('platforms.*').isIn(['boyfanz', 'girlfanz', 'pupfanz', 'transfanz', 'taboofanz', 'fanztube', 'fanzcock']).withMessage('Invalid platform')
];

const validatePayoutMethod = [
  body('creatorId').isString().notEmpty().withMessage('Creator ID is required'),
  body('type').isIn(['paxum', 'epayservice', 'wise', 'crypto', 'ach', 'sepa', 'payoneer', 'skrill']).withMessage('Invalid payout method type'),
  body('displayName').isString().notEmpty().withMessage('Display name is required'),
  body('accountDetails').isObject().withMessage('Account details required')
];

const validatePayoutRequest = [
  body('creatorId').isString().notEmpty().withMessage('Creator ID is required'),
  body('amount').isFloat({ min: 1 }).withMessage('Amount must be greater than 0'),
  body('payoutMethodId').isString().optional()
];

const validateRevenueEntry = [
  body('creatorId').isString().notEmpty().withMessage('Creator ID is required'),
  body('platform').isString().notEmpty().withMessage('Platform is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('type').isIn(['tip', 'subscription', 'purchase', 'commission', 'bonus']).withMessage('Invalid revenue type'),
  body('sourceTransactionId').isString().notEmpty().withMessage('Source transaction ID required')
];

// Middleware
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

const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Authorization header required'
    });
  }
  // In production, validate the JWT token here
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

// Creator Management Routes

// Register new creator
router.post('/creators/register', generalLimiter, requireAuth, validateCreatorRegistration, checkValidation, async (req, res) => {
  try {
    const { userId, displayName, platforms, taxInfo, preferences, verification } = req.body;

    console.log('Creator registration request:', {
      userId,
      displayName,
      platforms: platforms || [],
      ip: req.ip,
      timestamp: new Date()
    });

    const creatorId = await creatorPayoutSystem.registerCreator(userId, {
      displayName,
      platforms,
      taxInfo,
      preferences,
      verification
    });

    res.json({
      success: true,
      creatorId,
      message: 'Creator registered successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Creator registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Creator registration failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get creator profile
router.get('/creators/:creatorId', generalLimiter, requireAuth, async (req, res) => {
  try {
    const { creatorId } = req.params;
    const creator = await creatorPayoutSystem.getCreator(creatorId);

    if (!creator) {
      return res.status(404).json({
        success: false,
        error: 'Creator not found',
        timestamp: new Date().toISOString()
      });
    }

    // Remove sensitive payout method details
    const publicCreator = {
      ...creator,
      payoutMethods: creator.payoutMethods.map(method => ({
        ...method,
        accountDetails: {
          // Only show partial details for security
          email: method.accountDetails.email ? method.accountDetails.email.replace(/(.{2}).*(@.*)/, '$1***$2') : undefined,
          accountId: method.accountDetails.accountId ? `***${method.accountDetails.accountId?.slice(-4)}` : undefined,
          walletAddress: method.accountDetails.walletAddress ? `${method.accountDetails.walletAddress?.slice(0, 6)}...${method.accountDetails.walletAddress?.slice(-4)}` : undefined
        }
      }))
    };

    res.json({
      success: true,
      creator: publicCreator,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching creator:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch creator',
      timestamp: new Date().toISOString()
    });
  }
});

// Get creator by user ID
router.get('/creators/user/:userId', generalLimiter, requireAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const creator = await creatorPayoutSystem.getCreatorByUserId(userId);

    if (!creator) {
      return res.status(404).json({
        success: false,
        error: 'Creator not found for this user',
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      creatorId: creator.id,
      creator: {
        id: creator.id,
        displayName: creator.displayName,
        platforms: creator.platforms,
        status: creator.status,
        earnings: creator.earnings,
        verification: creator.verification
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching creator by user ID:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch creator',
      timestamp: new Date().toISOString()
    });
  }
});

// Payout Method Management Routes

// Add payout method
router.post('/creators/:creatorId/payout-methods', generalLimiter, requireAuth, validatePayoutMethod, checkValidation, async (req, res) => {
  try {
    const { creatorId } = req.params;
    const { type, displayName, accountDetails, isDefault } = req.body;

    console.log('Adding payout method:', {
      creatorId,
      type,
      displayName,
      isDefault: isDefault || false,
      ip: req.ip,
      timestamp: new Date()
    });

    const methodId = await creatorPayoutSystem.addPayoutMethod(creatorId, {
      type,
      displayName,
      accountDetails,
      isDefault
    });

    res.json({
      success: true,
      methodId,
      message: 'Payout method added successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error adding payout method:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add payout method',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Revenue Tracking Routes

// Record revenue entry
router.post('/revenue/record', generalLimiter, requireAuth, validateRevenueEntry, checkValidation, async (req, res) => {
  try {
    const { creatorId, platform, amount, type, sourceUserId, sourceTransactionId, fees, metadata } = req.body;

    console.log('Recording revenue:', {
      creatorId,
      platform,
      amount,
      type,
      sourceTransactionId,
      ip: req.ip,
      timestamp: new Date()
    });

    const entryId = await creatorPayoutSystem.recordRevenue({
      creatorId,
      platform,
      amount,
      type,
      sourceUserId,
      sourceTransactionId,
      fees,
      metadata
    });

    res.json({
      success: true,
      entryId,
      message: 'Revenue recorded successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error recording revenue:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record revenue',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get creator earnings
router.get('/creators/:creatorId/earnings', generalLimiter, requireAuth, async (req, res) => {
  try {
    const { creatorId } = req.params;
    const earnings = await creatorPayoutSystem.getCreatorEarnings(creatorId);

    if (!earnings) {
      return res.status(404).json({
        success: false,
        error: 'Creator earnings not found',
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      earnings,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching creator earnings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch creator earnings',
      timestamp: new Date().toISOString()
    });
  }
});

// Payout Request Routes

// Request payout
router.post('/request', payoutLimiter, requireAuth, validatePayoutRequest, checkValidation, async (req, res) => {
  try {
    const { creatorId, amount, payoutMethodId } = req.body;
    const requestedBy = req.headers['x-user-id'] as string || 'api_user';

    console.log('Payout request:', {
      creatorId,
      amount,
      payoutMethodId,
      requestedBy,
      ip: req.ip,
      timestamp: new Date()
    });

    const payoutId = await creatorPayoutSystem.requestPayout(creatorId, amount, payoutMethodId, requestedBy);

    res.json({
      success: true,
      payoutId,
      message: 'Payout requested successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error requesting payout:', error);
    res.status(500).json({
      success: false,
      error: 'Payout request failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get payout request status
router.get('/request/:payoutId', generalLimiter, requireAuth, async (req, res) => {
  try {
    const { payoutId } = req.params;
    const payoutRequest = await creatorPayoutSystem.getPayoutRequest(payoutId);

    if (!payoutRequest) {
      return res.status(404).json({
        success: false,
        error: 'Payout request not found',
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      payout: payoutRequest,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching payout request:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payout request',
      timestamp: new Date().toISOString()
    });
  }
});

// Get payout history
router.get('/creators/:creatorId/history', generalLimiter, requireAuth, async (req, res) => {
  try {
    const { creatorId } = req.params;
    const { limit = 20 } = req.query;

    const history = await creatorPayoutSystem.getPayoutHistory(creatorId, parseInt(limit as string));

    res.json({
      success: true,
      history,
      count: history.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching payout history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payout history',
      timestamp: new Date().toISOString()
    });
  }
});

// Admin Routes

// Get system statistics
router.get('/admin/stats', adminLimiter, requireAdmin, async (req, res) => {
  try {
    const stats = await creatorPayoutSystem.getSystemStats();

    res.json({
      success: true,
      statistics: stats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching payout system stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics',
      timestamp: new Date().toISOString()
    });
  }
});

// Create payout batch
router.post('/admin/batch', adminLimiter, requireAdmin, async (req, res) => {
  try {
    const { creatorIds, payoutMethod } = req.body;

    if (!creatorIds || !Array.isArray(creatorIds) || creatorIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Creator IDs array is required'
      });
    }

    console.log('Creating payout batch:', {
      creatorCount: creatorIds.length,
      payoutMethod,
      requestedBy: req.headers['x-admin-id'],
      ip: req.ip,
      timestamp: new Date()
    });

    const batchId = await creatorPayoutSystem.createPayoutBatch(creatorIds, payoutMethod || 'batch');

    res.json({
      success: true,
      batchId,
      message: 'Payout batch created successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error creating payout batch:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create payout batch',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Supported Methods and Information Routes

// Get supported payout methods
router.get('/methods', generalLimiter, async (req, res) => {
  try {
    const methods = [
      {
        type: 'paxum',
        name: 'Paxum',
        description: 'Industry standard adult entertainment payout method',
        processingTime: '1-2 business days',
        fees: { percentage: 2, fixed: 0, currency: 'USD' },
        limits: { min: 20, max: 25000, daily: 50000 },
        regions: ['Global'],
        kycRequired: true
      },
      {
        type: 'epayservice',
        name: 'ePayService',
        description: 'Fast and reliable adult-friendly payouts',
        processingTime: '24-48 hours',
        fees: { percentage: 3, fixed: 0, currency: 'USD' },
        limits: { min: 10, max: 10000, daily: 25000 },
        regions: ['Global'],
        kycRequired: true
      },
      {
        type: 'wise',
        name: 'Wise (TransferWise)',
        description: 'Low-cost international money transfers',
        processingTime: '1-3 business days',
        fees: { percentage: 0.5, fixed: 2.50, currency: 'USD' },
        limits: { min: 50, max: 50000, daily: 100000 },
        regions: ['US', 'EU', 'UK', 'CA', 'AU'],
        kycRequired: true
      },
      {
        type: 'crypto',
        name: 'Cryptocurrency',
        description: 'Bitcoin, Ethereum, USDT, USDC payouts',
        processingTime: '30-60 minutes',
        fees: { percentage: 0, fixed: 5.00, currency: 'USD' },
        limits: { min: 25, max: 100000, daily: 500000 },
        regions: ['Global'],
        kycRequired: false
      },
      {
        type: 'ach',
        name: 'ACH Direct Deposit',
        description: 'US bank account direct deposits',
        processingTime: '2-3 business days',
        fees: { percentage: 0.5, fixed: 0.25, currency: 'USD' },
        limits: { min: 10, max: 25000, daily: 100000 },
        regions: ['US'],
        kycRequired: true
      },
      {
        type: 'sepa',
        name: 'SEPA Transfer',
        description: 'European bank account transfers',
        processingTime: '1-2 business days',
        fees: { percentage: 0.8, fixed: 0.35, currency: 'EUR' },
        limits: { min: 5, max: 15000, daily: 75000 },
        regions: ['EU'],
        kycRequired: true
      }
    ];

    res.json({
      success: true,
      methods,
      totalMethods: methods.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching payout methods:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payout methods',
      timestamp: new Date().toISOString()
    });
  }
});

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'Creator Payout System',
    status: 'operational',
    version: '1.0.0',
    features: [
      'Creator registration and management',
      'Multi-method payout processing',
      'Automated earnings tracking',
      'Revenue stream breakdown',
      'KYC and compliance integration',
      'Batch payout processing',
      'Auto-payout scheduling',
      'Tax information management',
      'Real-time earnings calculation'
    ],
    payoutMethods: [
      'Paxum', 'ePayService', 'Wise', 'Cryptocurrency',
      'ACH Direct', 'SEPA Transfer', 'Payoneer', 'Skrill'
    ],
    compliance: [
      'KYC verification required',
      'Tax form collection',
      'AML compliance',
      'Identity verification',
      'Bank account verification',
      'Audit trail logging'
    ],
    timestamp: new Date().toISOString()
  });
});

// Development testing endpoints
if (process.env.NODE_ENV === 'development') {
  // Test creator registration
  router.post('/dev/test-creator', async (req, res) => {
    try {
      const testUserId = `test-user-${Date.now()}`;
      const creatorId = await creatorPayoutSystem.registerCreator(testUserId, {
        displayName: 'Test Creator',
        platforms: ['boyfanz', 'girlfanz'],
        preferences: {
          minimumPayout: 50,
          currency: 'USD',
          autoPayoutEnabled: false,
          payoutSchedule: 'weekly'
        },
        verification: {
          kycVerified: true,
          ageVerified: true,
          identityVerified: true,
          bankDetailsVerified: false
        }
      });

      // Add test payout method
      const methodId = await creatorPayoutSystem.addPayoutMethod(creatorId, {
        type: 'paxum',
        displayName: 'Test Paxum Account',
        accountDetails: {
          email: 'test@example.com'
        },
        isDefault: true
      });

      // Add test revenue
      await creatorPayoutSystem.recordRevenue({
        creatorId,
        platform: 'boyfanz',
        amount: 100,
        type: 'tip',
        sourceTransactionId: `test-tx-${Date.now()}`,
        fees: { platformFee: 5, paymentProcessingFee: 3, total: 8 }
      });

      res.json({
        success: true,
        message: 'Test creator created successfully',
        data: {
          creatorId,
          userId: testUserId,
          methodId
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      res.status(500).json({
        error: 'Test creator creation failed',
        message: error.message
      });
    }
  });
}

export default router;