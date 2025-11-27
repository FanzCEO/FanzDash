/**
 * Unified Payment Administration API
 * Central admin panel for all payment processors, crypto, escrow, and payouts
 */

import { Router } from 'express';
import {
  ADULT_PAYMENT_PROCESSORS,
  getActiveAdultProcessors,
  getProcessorsByType,
  getProcessorsByRegion,
  getEscrowProcessors,
  getCryptoProcessors,
  getPayoutProviders,
  getProcessorById,
  getAllSupportedCurrencies,
  getBestProcessor
} from '../payments/AdultPaymentProcessors';
import { escrowService } from '../payments/EscrowService';

const router = Router();

// ========== PAYMENT PROCESSORS ==========

/**
 * GET /api/payment-admin/processors
 * Get all configured payment processors
 */
router.get('/processors', async (req, res) => {
  try {
    const processors = getActiveAdultProcessors();

    res.json({
      success: true,
      total: processors.length,
      processors: processors.map(p => ({
        id: p.id,
        name: p.name,
        type: p.type,
        adultFriendly: p.adultFriendly,
        regions: p.regions,
        currencies: p.currencies,
        status: p.status,
        priority: p.priority,
        fees: p.fees,
        features: p.features
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch processors'
    });
  }
});

/**
 * GET /api/payment-admin/processors/:id
 * Get specific processor details
 */
router.get('/processors/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const processor = getProcessorById(id);

    if (!processor) {
      return res.status(404).json({
        success: false,
        error: 'Processor not found'
      });
    }

    res.json({
      success: true,
      processor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch processor'
    });
  }
});

/**
 * GET /api/payment-admin/processors/type/:type
 * Get processors by type (card, crypto, wallet, bank)
 */
router.get('/processors/type/:type', async (req, res) => {
  try {
    const { type } = req.params as { type: 'card' | 'crypto' | 'wallet' | 'bank' | 'alternative' };
    const processors = getProcessorsByType(type);

    res.json({
      success: true,
      type,
      total: processors.length,
      processors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch processors by type'
    });
  }
});

/**
 * GET /api/payment-admin/processors/region/:region
 * Get processors available in specific region
 */
router.get('/processors/region/:region', async (req, res) => {
  try {
    const { region } = req.params;
    const processors = getProcessorsByRegion(region);

    res.json({
      success: true,
      region,
      total: processors.length,
      processors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch processors by region'
    });
  }
});

/**
 * GET /api/payment-admin/crypto-processors
 * Get all cryptocurrency payment processors
 */
router.get('/crypto-processors', async (req, res) => {
  try {
    const processors = getCryptoProcessors();

    res.json({
      success: true,
      total: processors.length,
      processors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch crypto processors'
    });
  }
});

/**
 * GET /api/payment-admin/payout-providers
 * Get all payout providers
 */
router.get('/payout-providers', async (req, res) => {
  try {
    const providers = getPayoutProviders();

    res.json({
      success: true,
      total: providers.length,
      providers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payout providers'
    });
  }
});

/**
 * GET /api/payment-admin/currencies
 * Get all supported currencies
 */
router.get('/currencies', async (req, res) => {
  try {
    const currencies = getAllSupportedCurrencies();

    res.json({
      success: true,
      total: currencies.length,
      currencies
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch currencies'
    });
  }
});

/**
 * POST /api/payment-admin/best-processor
 * Find best processor for transaction
 */
router.post('/best-processor', async (req, res) => {
  try {
    const { amount, currency, region } = req.body;

    if (!amount || !currency || !region) {
      return res.status(400).json({
        success: false,
        error: 'amount, currency, and region are required'
      });
    }

    const processor = getBestProcessor(amount, currency, region);

    if (!processor) {
      return res.status(404).json({
        success: false,
        error: 'No suitable processor found'
      });
    }

    res.json({
      success: true,
      processor,
      estimatedFee: (amount * processor.fees.percentage / 100) + processor.fees.fixed
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to find best processor'
    });
  }
});

// ========== ESCROW MANAGEMENT ==========

/**
 * GET /api/payment-admin/escrow/stats
 * Get escrow system statistics
 */
router.get('/escrow/stats', async (req, res) => {
  try {
    const stats = escrowService.getEscrowStats();

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch escrow stats'
    });
  }
});

/**
 * GET /api/payment-admin/escrow/account/:userId
 * Get escrow account for user
 */
router.get('/escrow/account/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const balance = await escrowService.getAccountBalance(userId);

    res.json({
      success: true,
      userId,
      balance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch escrow account'
    });
  }
});

/**
 * GET /api/payment-admin/escrow/pending/:userId
 * Get pending escrow transactions
 */
router.get('/escrow/pending/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const transactions = escrowService.getPendingTransactions(userId);

    res.json({
      success: true,
      userId,
      total: transactions.length,
      transactions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch pending transactions'
    });
  }
});

/**
 * GET /api/payment-admin/escrow/history/:userId
 * Get escrow transaction history
 */
router.get('/escrow/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit } = req.query;
    const transactions = escrowService.getTransactionHistory(userId, limit ? parseInt(limit as string) : 50);

    res.json({
      success: true,
      userId,
      total: transactions.length,
      transactions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transaction history'
    });
  }
});

/**
 * POST /api/payment-admin/escrow/hold
 * Hold funds in escrow
 */
router.post('/escrow/hold', async (req, res) => {
  try {
    const { fromUserId, toUserId, amount, currency, reason, holdDays, autoRelease, metadata } = req.body;

    if (!fromUserId || !toUserId || !amount || !currency || !reason) {
      return res.status(400).json({
        success: false,
        error: 'fromUserId, toUserId, amount, currency, and reason are required'
      });
    }

    const transaction = await escrowService.holdFunds({
      fromUserId,
      toUserId,
      amount,
      currency,
      reason,
      holdDays,
      autoRelease,
      metadata
    });

    res.json({
      success: true,
      transaction
    });
  } catch (error) {
    console.error('Escrow hold failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to hold funds in escrow'
    });
  }
});

/**
 * POST /api/payment-admin/escrow/release/:transactionId
 * Release escrowed funds
 */
router.post('/escrow/release/:transactionId', async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { releasedBy } = req.body;

    const release = await escrowService.releaseFunds(transactionId, 'manual', releasedBy);

    res.json({
      success: true,
      release
    });
  } catch (error) {
    console.error('Escrow release failed:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to release funds'
    });
  }
});

/**
 * POST /api/payment-admin/escrow/refund/:transactionId
 * Refund escrowed funds
 */
router.post('/escrow/refund/:transactionId', async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { reason, refundedBy } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        error: 'reason is required'
      });
    }

    const release = await escrowService.refundFunds(transactionId, reason, refundedBy);

    res.json({
      success: true,
      release
    });
  } catch (error) {
    console.error('Escrow refund failed:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to refund funds'
    });
  }
});

/**
 * POST /api/payment-admin/escrow/dispute
 * Create dispute for escrow transaction
 */
router.post('/escrow/dispute', async (req, res) => {
  try {
    const { transactionId, initiatedBy, reason, evidence } = req.body;

    if (!transactionId || !initiatedBy || !reason) {
      return res.status(400).json({
        success: false,
        error: 'transactionId, initiatedBy, and reason are required'
      });
    }

    const dispute = await escrowService.createDispute({
      transactionId,
      initiatedBy,
      reason,
      evidence
    });

    res.json({
      success: true,
      dispute
    });
  } catch (error) {
    console.error('Dispute creation failed:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create dispute'
    });
  }
});

/**
 * POST /api/payment-admin/escrow/resolve-dispute/:disputeId
 * Resolve escrow dispute
 */
router.post('/escrow/resolve-dispute/:disputeId', async (req, res) => {
  try {
    const { disputeId } = req.params;
    const { resolution, resolutionAmount } = req.body;

    if (!resolution || !['refund', 'release', 'partial_refund'].includes(resolution)) {
      return res.status(400).json({
        success: false,
        error: 'Valid resolution (refund, release, partial_refund) is required'
      });
    }

    const dispute = await escrowService.resolveDispute(disputeId, resolution, resolutionAmount);

    res.json({
      success: true,
      dispute
    });
  } catch (error) {
    console.error('Dispute resolution failed:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to resolve dispute'
    });
  }
});

/**
 * GET /api/payment-admin/escrow/processors
 * Get processors with escrow support
 */
router.get('/escrow/processors', async (req, res) => {
  try {
    const processors = getEscrowProcessors();

    res.json({
      success: true,
      total: processors.length,
      processors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch escrow processors'
    });
  }
});

// ========== SYSTEM OVERVIEW ==========

/**
 * GET /api/payment-admin/overview
 * Get complete payment system overview
 */
router.get('/overview', async (req, res) => {
  try {
    const overview = {
      processors: {
        total: Object.keys(ADULT_PAYMENT_PROCESSORS).length,
        active: getActiveAdultProcessors().length,
        byType: {
          card: getProcessorsByType('card').length,
          crypto: getCryptoProcessors().length,
          wallet: getProcessorsByType('wallet').length,
          bank: getProcessorsByType('bank').length
        }
      },
      escrow: escrowService.getEscrowStats(),
      payouts: {
        providers: getPayoutProviders().length
      },
      currencies: {
        supported: getAllSupportedCurrencies().length
      }
    };

    res.json({
      success: true,
      overview
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch overview'
    });
  }
});

export default router;
