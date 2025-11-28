/**
 * Custom Content Request API Routes
 * Allows fans to request custom content with escrow protection
 */

import { Router } from 'express';
import { customContentRequestService } from '../services/CustomContentRequestService';

const router = Router();

/**
 * POST /api/custom-content/request
 * Create new custom content request
 */
router.post('/request', async (req, res) => {
  try {
    const {
      platformId,
      fanUserId,
      creatorUserId,
      contentType,
      contentTypeDetails,
      description,
      specialRequirements,
      dueDate,
      proposedAmount,
      currency,
      paymentMethodId,
      fanName,
      creatorName
    } = req.body;

    if (!platformId || !fanUserId || !creatorUserId || !contentType || !description || !proposedAmount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const request = await customContentRequestService.createRequest({
      platformId,
      fanUserId,
      creatorUserId,
      contentType,
      contentTypeDetails: contentTypeDetails || contentType,
      description,
      specialRequirements: specialRequirements || [],
      dueDate: new Date(dueDate),
      proposedAmount: parseFloat(proposedAmount),
      currency: currency || 'USD',
      paymentMethodId,
      fanName: fanName || 'Fan',
      creatorName: creatorName || 'Creator'
    });

    res.json({
      success: true,
      request
    });
  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create request'
    });
  }
});

/**
 * POST /api/custom-content/creator-respond/:requestId
 * Creator accepts, counters, or rejects request
 */
router.post('/creator-respond/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;
    const { action, counterAmount, message } = req.body;

    if (!action || !['accept', 'counter', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid action'
      });
    }

    if (action === 'counter' && !counterAmount) {
      return res.status(400).json({
        success: false,
        error: 'Counter amount is required'
      });
    }

    const request = await customContentRequestService.creatorRespond(
      requestId,
      action,
      { counterAmount: counterAmount ? parseFloat(counterAmount) : undefined, message }
    );

    res.json({
      success: true,
      request
    });
  } catch (error) {
    console.error('Creator respond error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process response'
    });
  }
});

/**
 * POST /api/custom-content/fan-respond/:requestId
 * Fan accepts, counters, or rejects counter offer
 */
router.post('/fan-respond/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;
    const { action, counterAmount, message } = req.body;

    if (!action || !['accept', 'counter', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid action'
      });
    }

    if (action === 'counter' && !counterAmount) {
      return res.status(400).json({
        success: false,
        error: 'Counter amount is required'
      });
    }

    const request = await customContentRequestService.fanRespond(
      requestId,
      action,
      { counterAmount: counterAmount ? parseFloat(counterAmount) : undefined, message }
    );

    res.json({
      success: true,
      request
    });
  } catch (error) {
    console.error('Fan respond error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process response'
    });
  }
});

/**
 * POST /api/custom-content/sign-agreement/:requestId
 * Sign no-chargeback agreement
 */
router.post('/sign-agreement/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required'
      });
    }

    const request = await customContentRequestService.signNoChargebackAgreement(requestId, userId);

    res.json({
      success: true,
      request
    });
  } catch (error) {
    console.error('Sign agreement error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to sign agreement'
    });
  }
});

/**
 * POST /api/custom-content/accept-terms/:requestId
 * Accept terms and conditions
 */
router.post('/accept-terms/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required'
      });
    }

    const request = await customContentRequestService.acceptTerms(requestId, userId);

    res.json({
      success: true,
      request
    });
  } catch (error) {
    console.error('Accept terms error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to accept terms'
    });
  }
});

/**
 * POST /api/custom-content/process-payment/:requestId
 * Process payment and place in escrow
 */
router.post('/process-payment/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await customContentRequestService.processPaymentToEscrow(requestId);

    res.json({
      success: true,
      request,
      message: 'Payment processed and held in escrow until content is approved'
    });
  } catch (error) {
    console.error('Process payment error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process payment'
    });
  }
});

/**
 * POST /api/custom-content/deliver/:requestId
 * Creator delivers content
 */
router.post('/deliver/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;
    const { contentId, deliveryNotes } = req.body;

    if (!contentId) {
      return res.status(400).json({
        success: false,
        error: 'contentId is required'
      });
    }

    const request = await customContentRequestService.deliverContent(requestId, {
      contentId,
      deliveryNotes
    });

    res.json({
      success: true,
      request
    });
  } catch (error) {
    console.error('Deliver content error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to deliver content'
    });
  }
});

/**
 * POST /api/custom-content/review/:requestId
 * Fan reviews content
 */
router.post('/review/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;
    const { action, notes, revisionDetails } = req.body;

    if (!action || !['approve', 'request_revision', 'dispute'].includes(action)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid action'
      });
    }

    const request = await customContentRequestService.fanReview(
      requestId,
      action,
      { notes, revisionDetails }
    );

    res.json({
      success: true,
      request,
      message: action === 'approve' ? 'Content approved - escrow released!' :
               action === 'request_revision' ? 'Revision requested' :
               'Dispute created'
    });
  } catch (error) {
    console.error('Review content error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to review content'
    });
  }
});

/**
 * GET /api/custom-content/request/:requestId
 * Get request details
 */
router.get('/request/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = customContentRequestService.getRequest(requestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Request not found'
      });
    }

    res.json({
      success: true,
      request
    });
  } catch (error) {
    console.error('Get request error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch request'
    });
  }
});

/**
 * GET /api/custom-content/user/:userId/:role
 * Get requests for user (fan or creator)
 */
router.get('/user/:userId/:role', async (req, res) => {
  try {
    const { userId, role } = req.params;

    if (!['fan', 'creator'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Role must be "fan" or "creator"'
      });
    }

    const requests = customContentRequestService.getUserRequests(userId, role as 'fan' | 'creator');

    res.json({
      success: true,
      total: requests.length,
      requests
    });
  } catch (error) {
    console.error('Get user requests error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch requests'
    });
  }
});

/**
 * GET /api/custom-content/platform/:platformId
 * Get requests for specific platform
 */
router.get('/platform/:platformId', async (req, res) => {
  try {
    const { platformId } = req.params;

    const requests = customContentRequestService.getPlatformRequests(platformId);

    res.json({
      success: true,
      platform: platformId,
      total: requests.length,
      requests
    });
  } catch (error) {
    console.error('Get platform requests error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch requests'
    });
  }
});

/**
 * GET /api/custom-content/status/:status
 * Get requests by status
 */
router.get('/status/:status', async (req, res) => {
  try {
    const { status } = req.params;

    const requests = customContentRequestService.getRequestsByStatus(status as any);

    res.json({
      success: true,
      status,
      total: requests.length,
      requests
    });
  } catch (error) {
    console.error('Get requests by status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch requests'
    });
  }
});

export default router;
