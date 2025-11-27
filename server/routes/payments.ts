import express from 'express';
import crypto from 'crypto';
import PaymentOrchestrator from '../payments/PaymentOrchestrator.js';

const router = express.Router();
const paymentOrchestrator = new PaymentOrchestrator();

// Middleware for auth (basic implementation)
const isAuthenticated = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const apiKey = req.headers['x-api-key'] || req.headers['authorization'];
  
  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }
  
  // In production, validate API key against database
  // For development, allow any key
  if (process.env.NODE_ENV === 'development' || apiKey) {
    next();
  } else {
    return res.status(401).json({ error: 'Invalid API key' });
  }
};

// Payment processing endpoint
router.post('/process', isAuthenticated, async (req, res) => {
  try {
    const {
      userId,
      platformId,
      amount,
      currency = 'USD',
      description,
      region,
      paymentMethod,
      metadata = {}
    } = req.body;

    // Validation
    if (!userId || !platformId || !amount || !region || !paymentMethod) {
      return res.status(400).json({
        error: 'Missing required fields: userId, platformId, amount, region, paymentMethod'
      });
    }

    if (amount <= 0 || amount > 100000) {
      return res.status(400).json({
        error: 'Amount must be between 0.01 and 100000'
      });
    }

    const paymentRequest = {
      id: crypto.randomUUID(),
      userId,
      platformId,
      amount: parseFloat(amount),
      currency,
      description: description || `Payment for ${platformId}`,
      region,
      paymentMethod,
      metadata: {
        ...metadata,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
      },
      timestamp: new Date()
    };

    console.log('Processing payment request:', {
      id: paymentRequest.id,
      userId,
      platformId,
      amount,
      region,
      paymentMethod
    });

    const result = await paymentOrchestrator.processPayment(paymentRequest);

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({
      error: 'Payment processing failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get available payment gateways
router.get('/gateways', isAuthenticated, (req, res) => {
  try {
    const { region, type } = req.query;
    
    let gateways = paymentOrchestrator.getGateways();
    
    // Filter by region if specified
    if (region) {
      gateways = gateways.filter(gateway => 
        gateway.regions.includes(region as string) || 
        gateway.regions.includes('GLOBAL')
      );
    }
    
    // Filter by type if specified
    if (type) {
      gateways = gateways.filter(gateway => gateway.type === type);
    }
    
    // Only return active gateways
    gateways = gateways.filter(gateway => gateway.status === 'active');

    res.json({
      success: true,
      data: gateways.map(gateway => ({
        id: gateway.id,
        name: gateway.name,
        type: gateway.type,
        regions: gateway.regions,
        fees: gateway.fees,
        limits: gateway.limits
      })),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching gateways:', error);
    res.status(500).json({
      error: 'Failed to fetch payment gateways',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get available payout methods
router.get('/payout-methods', isAuthenticated, (req, res) => {
  try {
    const { region, kycRequired } = req.query;
    
    let methods = paymentOrchestrator.getPayoutMethods();
    
    // Filter by region if specified
    if (region) {
      methods = methods.filter(method => 
        method.regions.includes(region as string) || 
        method.regions.includes('GLOBAL')
      );
    }
    
    // Filter by KYC requirement if specified
    if (kycRequired !== undefined) {
      const needsKyc = kycRequired === 'true';
      methods = methods.filter(method => method.kycRequired === needsKyc);
    }

    res.json({
      success: true,
      data: methods,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching payout methods:', error);
    res.status(500).json({
      error: 'Failed to fetch payout methods',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Process creator payout
router.post('/payout', isAuthenticated, async (req, res) => {
  try {
    const { creatorId, amount, methodId, memo } = req.body;

    // Validation
    if (!creatorId || !amount || !methodId) {
      return res.status(400).json({
        error: 'Missing required fields: creatorId, amount, methodId'
      });
    }

    if (amount <= 0 || amount > 100000) {
      return res.status(400).json({
        error: 'Amount must be between 0.01 and 100000'
      });
    }

    console.log('Processing payout request:', {
      creatorId,
      amount,
      methodId,
      memo
    });

    const result = await paymentOrchestrator.processCreatorPayout(
      creatorId, 
      parseFloat(amount), 
      methodId
    );

    res.json({
      success: true,
      data: {
        ...result,
        memo
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Payout processing error:', error);
    res.status(500).json({
      error: 'Payout processing failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get transaction status
router.get('/transaction/:id', isAuthenticated, (req, res) => {
  try {
    const { id } = req.params;
    const transaction = paymentOrchestrator.getTransactionStatus(id);
    
    if (!transaction) {
      return res.status(404).json({
        error: 'Transaction not found',
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      data: transaction,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({
      error: 'Failed to fetch transaction',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Admin: Update routing rules
router.put('/routing/:ruleId', isAuthenticated, (req, res) => {
  try {
    const { ruleId } = req.params;
    const updates = req.body;

    // Basic admin check (in production, implement proper role-based access)
    const adminKey = req.headers['x-admin-key'];
    if (process.env.NODE_ENV === 'production' && !adminKey) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    paymentOrchestrator.updateRoutingRule(ruleId, updates);

    res.json({
      success: true,
      message: 'Routing rule updated',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error updating routing rule:', error);
    res.status(500).json({
      error: 'Failed to update routing rule',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Admin: MID management
router.post('/mid/:midId/:action', isAuthenticated, (req, res) => {
  try {
    const { midId, action } = req.params;

    // Basic admin check
    const adminKey = req.headers['x-admin-key'];
    if (process.env.NODE_ENV === 'production' && !adminKey) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    if (action === 'pause') {
      paymentOrchestrator.pauseMID(midId);
    } else if (action === 'resume') {
      paymentOrchestrator.resumeMID(midId);
    } else {
      return res.status(400).json({ error: 'Invalid action. Use pause or resume' });
    }

    res.json({
      success: true,
      message: `MID ${action}d successfully`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error managing MID:', error);
    res.status(500).json({
      error: 'Failed to manage MID',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Health check for payment system
router.get('/health', (req, res) => {
  const gateways = paymentOrchestrator.getGateways();
  const activeGateways = gateways.filter(g => g.status === 'active').length;
  const totalGateways = gateways.length;
  
  res.json({
    success: true,
    data: {
      status: 'operational',
      gateways: {
        active: activeGateways,
        total: totalGateways,
        healthScore: (activeGateways / totalGateways * 100).toFixed(1) + '%'
      },
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    }
  });
});

// Webhook endpoint for payment notifications (from gateways)
router.post('/webhook/:gatewayId', (req, res) => {
  try {
    const { gatewayId } = req.params;
    const payload = req.body;
    
    console.log(`Received webhook from ${gatewayId}:`, payload);
    
    // In production, verify webhook signatures here
    // Each gateway has its own signature verification method
    
    // Process webhook based on gateway type
    switch (gatewayId) {
      case 'ccbill':
        // Process CCBill webhook
        break;
      case 'segpay':
        // Process Segpay webhook
        break;
      case 'bitpay':
        // Process BitPay webhook
        break;
      default:
        console.warn(`Unknown gateway webhook: ${gatewayId}`);
    }
    
    // Respond with 200 to acknowledge receipt
    res.json({ received: true, timestamp: new Date().toISOString() });
    
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({
      error: 'Webhook processing failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Payment events (Server-Sent Events for real-time updates)
router.get('/events', isAuthenticated, (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  const sendEvent = (data: any) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  // Send initial connection event
  sendEvent({ type: 'connected', timestamp: new Date().toISOString() });

  // Listen for payment events
  const onPaymentProcessed = (transaction: any) => {
    sendEvent({ type: 'payment:processed', data: transaction });
  };

  const onPaymentFailed = (transaction: any) => {
    sendEvent({ type: 'payment:failed', data: transaction });
  };

  const onPayoutCompleted = (payout: any) => {
    sendEvent({ type: 'payout:completed', data: payout });
  };

  const onGatewayDown = (gateway: any) => {
    sendEvent({ type: 'gateway:down', data: gateway });
  };

  const onGatewayRestored = (gateway: any) => {
    sendEvent({ type: 'gateway:restored', data: gateway });
  };

  // Register event listeners
  paymentOrchestrator.on('payment:processed', onPaymentProcessed);
  paymentOrchestrator.on('payment:failed', onPaymentFailed);
  paymentOrchestrator.on('payout:completed', onPayoutCompleted);
  paymentOrchestrator.on('gateway:down', onGatewayDown);
  paymentOrchestrator.on('gateway:restored', onGatewayRestored);

  // Clean up on client disconnect
  req.on('close', () => {
    paymentOrchestrator.off('payment:processed', onPaymentProcessed);
    paymentOrchestrator.off('payment:failed', onPaymentFailed);
    paymentOrchestrator.off('payout:completed', onPayoutCompleted);
    paymentOrchestrator.off('gateway:down', onGatewayDown);
    paymentOrchestrator.off('gateway:restored', onGatewayRestored);
  });
});

export default router;