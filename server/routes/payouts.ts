import express from 'express';
import { creatorPayoutSystem } from '../payouts/CreatorPayoutSystem.js';
import { payoutAutomationSystem } from '../payouts/PayoutAutomationSystem.js';
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
  body('platforms.*').isIn(['boyfanz', 'girlfanz', 'pupfanz', 'transfanz', 'taboofanz', 'fanztube', 'fanzclips']).withMessage('Invalid platform')
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

const isAuthenticated = (req: express.Request, res: express.Response, next: express.NextFunction) => {
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
router.post('/creators/register', generalLimiter, isAuthenticated, validateCreatorRegistration, checkValidation, async (req, res) => {
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
router.get('/creators/:creatorId', generalLimiter, isAuthenticated, async (req, res) => {
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
router.get('/creators/user/:userId', generalLimiter, isAuthenticated, async (req, res) => {
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
router.post('/creators/:creatorId/payout-methods', generalLimiter, isAuthenticated, validatePayoutMethod, checkValidation, async (req, res) => {
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
router.post('/revenue/record', generalLimiter, isAuthenticated, validateRevenueEntry, checkValidation, async (req, res) => {
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
router.get('/creators/:creatorId/earnings', generalLimiter, isAuthenticated, async (req, res) => {
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
router.post('/request', payoutLimiter, isAuthenticated, validatePayoutRequest, checkValidation, async (req, res) => {
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
router.get('/request/:payoutId', generalLimiter, isAuthenticated, async (req, res) => {
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
router.get('/creators/:creatorId/history', generalLimiter, isAuthenticated, async (req, res) => {
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

// ============= PAYOUT AUTOMATION SYSTEM =============

// Get automation system statistics
router.get('/automation/stats', generalLimiter, isAuthenticated, (req, res) => {
  try {
    const stats = payoutAutomationSystem.getSystemStats();
    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting automation stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get automation statistics',
      timestamp: new Date().toISOString()
    });
  }
});

// Record creator revenue with automated payout evaluation
router.post('/automation/revenue', 
  generalLimiter, 
  isAuthenticated,
  [
    body('creatorId').isString().notEmpty().withMessage('Creator ID is required'),
    body('transactionId').isString().notEmpty().withMessage('Transaction ID is required'),
    body('sourceType').isIn(['subscription', 'tips', 'ppv', 'custom_content', 'live_stream', 'merchandise', 'other']).withMessage('Valid source type required'),
    body('grossAmount').isFloat({ min: 0.01 }).withMessage('Gross amount must be greater than 0'),
    body('platformFee').isFloat({ min: 0 }).withMessage('Platform fee must be non-negative'),
    body('processingFee').isFloat({ min: 0 }).withMessage('Processing fee must be non-negative'),
    body('netAmount').isFloat({ min: 0.01 }).withMessage('Net amount must be greater than 0'),
    body('currency').isString().notEmpty().withMessage('Currency is required'),
    body('platform').isString().notEmpty().withMessage('Platform is required')
  ],
  checkValidation,
  async (req, res) => {
    try {
      const {
        creatorId,
        transactionId, 
        sourceType,
        grossAmount,
        platformFee,
        processingFee,
        netAmount,
        currency,
        platform,
        fanId,
        contentId,
        payoutEligibleAt
      } = req.body;

      const revenueId = await payoutAutomationSystem.updateCreatorRevenue(creatorId, {
        transactionId,
        sourceType,
        grossAmount,
        platformFee,
        processingFee,
        netAmount,
        currency,
        platform,
        fanId,
        contentId,
        payoutEligibleAt: payoutEligibleAt ? new Date(payoutEligibleAt) : new Date(),
        metadata: {
          recordedBy: req.headers.authorization,
          ipAddress: req.ip
        }
      });

      res.json({
        success: true,
        revenueId,
        message: 'Revenue recorded and automation evaluated',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error recording automated revenue:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to record revenue',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
);

// Add automated payout method with verification
router.post('/automation/payout-methods',
  generalLimiter,
  isAuthenticated,
  [
    body('creatorId').isString().notEmpty().withMessage('Creator ID is required'),
    body('type').isIn(['paxum', 'epayservice', 'wise', 'payoneer', 'crypto', 'ach', 'sepa', 'wire', 'check']).withMessage('Valid payout method type required'),
    body('displayName').isString().notEmpty().withMessage('Display name is required'),
    body('accountDetails').isObject().withMessage('Account details required'),
    body('feeStructure').isObject().withMessage('Fee structure required')
  ],
  checkValidation,
  async (req, res) => {
    try {
      const {
        creatorId,
        type,
        displayName,
        accountDetails,
        feeStructure,
        restrictions,
        isDefault
      } = req.body;

      const methodId = await payoutAutomationSystem.addPayoutMethod(creatorId, {
        type,
        displayName,
        accountDetails,
        verificationStatus: 'pending',
        isDefault: isDefault || false,
        minimumPayout: restrictions?.minimumPayout || 25,
        maximumPayout: restrictions?.maximumPayout || 10000,
        feeStructure: {
          fixedFee: feeStructure.fixedFee || 0,
          percentageFee: feeStructure.percentageFee || 0,
          currency: feeStructure.currency || 'USD'
        },
        restrictions: restrictions || {},
        metadata: {
          addedBy: req.headers.authorization,
          ipAddress: req.ip
        }
      });

      res.json({
        success: true,
        methodId,
        message: 'Automated payout method added successfully',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error adding automated payout method:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to add payout method',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
);

// Create manual payout request
router.post('/automation/payout-request',
  payoutLimiter,
  isAuthenticated,
  [
    body('creatorId').isString().notEmpty().withMessage('Creator ID is required'),
    body('payoutMethodId').isString().notEmpty().withMessage('Payout method ID is required'),
    body('requestedAmount').isFloat({ min: 1 }).withMessage('Requested amount must be greater than 0'),
    body('priority').isIn(['low', 'normal', 'high', 'urgent']).optional()
  ],
  checkValidation,
  async (req, res) => {
    try {
      const {
        creatorId,
        payoutMethodId,
        requestedAmount,
        priority = 'normal',
        scheduledFor
      } = req.body;

      // Get creator ledger to calculate fees
      const ledger = payoutAutomationSystem.getCreatorLedger(creatorId);
      if (!ledger) {
        return res.status(404).json({
          success: false,
          error: 'Creator ledger not found',
          timestamp: new Date().toISOString()
        });
      }

      const methods = payoutAutomationSystem.getCreatorPayoutMethods(creatorId);
      const method = methods.find(m => m.id === payoutMethodId);
      if (!method) {
        return res.status(404).json({
          success: false,
          error: 'Payout method not found',
          timestamp: new Date().toISOString()
        });
      }

      const transactionFee = method.feeStructure.fixedFee + (requestedAmount * method.feeStructure.percentageFee / 100);
      const netPayoutAmount = requestedAmount - transactionFee;

      const requestId = await payoutAutomationSystem.createPayoutRequest({
        creatorId,
        payoutMethodId,
        requestedAmount,
        eligibleAmount: Math.min(requestedAmount, ledger.availableBalance),
        currency: ledger.currency,
        priority,
        requestType: 'manual',
        scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
        transactionFee,
        netPayoutAmount,
        metadata: {
          requestedBy: req.headers.authorization,
          ipAddress: req.ip
        }
      });

      res.json({
        success: true,
        requestId,
        estimatedFee: transactionFee,
        netAmount: netPayoutAmount,
        message: 'Payout request created successfully',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error creating payout request:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create payout request',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
);

// Get creator ledger details
router.get('/automation/ledger/:creatorId', generalLimiter, isAuthenticated, (req, res) => {
  try {
    const { creatorId } = req.params;
    const ledger = payoutAutomationSystem.getCreatorLedger(creatorId);
    
    if (!ledger) {
      return res.status(404).json({
        success: false,
        error: 'Creator ledger not found',
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      ledger,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching creator ledger:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch creator ledger',
      timestamp: new Date().toISOString()
    });
  }
});

// Get payout requests for creator
router.get('/automation/payout-requests/:creatorId', generalLimiter, isAuthenticated, (req, res) => {
  try {
    const { creatorId } = req.params;
    const { status } = req.query;
    
    const requests = payoutAutomationSystem.getPayoutRequests(
      creatorId, 
      status as string
    );

    res.json({
      success: true,
      requests,
      count: requests.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching payout requests:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payout requests',
      timestamp: new Date().toISOString()
    });
  }
});

// Get payout batches (admin only)
router.get('/automation/batches', adminLimiter, isAuthenticated, requireAdmin, (req, res) => {
  try {
    const { status } = req.query;
    const batches = payoutAutomationSystem.getPayoutBatches(status as string);

    res.json({
      success: true,
      batches,
      count: batches.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching payout batches:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payout batches',
      timestamp: new Date().toISOString()
    });
  }
});

// Stop/start automation system (admin only)
router.post('/automation/control/:action', adminLimiter, isAuthenticated, requireAdmin, (req, res) => {
  try {
    const { action } = req.params;
    
    if (action === 'stop') {
      payoutAutomationSystem.stopAutomation();
    } else if (action === 'start') {
      // Restart automation by creating new instance (simplified for demo)
      console.log('Automation restart requested - would reinitialize in production');
    } else {
      return res.status(400).json({
        success: false,
        error: 'Invalid action. Use "start" or "stop"',
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      message: `Automation system ${action}ped`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error controlling automation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to control automation system',
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
      'Automated earnings tracking with ledger',
      'Revenue stream breakdown',
      'KYC and compliance integration',
      'Intelligent batch payout processing',
      'Rule-based auto-payout scheduling',
      'Tax information management',
      'Real-time earnings calculation',
      'Advanced payout automation engine',
      'Smart fee calculation and optimization',
      'Multi-processor failover support',
      'Compliance-integrated payout validation',
      'Automated threshold-based payouts',
      'Creator ledger with balance tracking'
    ],
    payoutMethods: [
      'Paxum', 'ePayService', 'Wise', 'Payoneer', 
      'Cryptocurrency (BTC/ETH/USDT/USDC)', 'ACH Direct',
      'SEPA Transfer', 'Wire Transfer', 'Paper Check'
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