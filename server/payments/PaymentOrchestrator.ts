import { EventEmitter } from 'events';
import crypto from 'crypto';

// Types
interface PaymentGateway {
  id: string;
  name: string;
  type: 'card' | 'bank' | 'crypto' | 'wallet' | 'local';
  regions: string[];
  adultFriendly: boolean;
  fees: {
    percentage: number;
    fixed: number;
    currency: string;
  };
  limits: {
    min: number;
    max: number;
    daily: number;
  };
  status: 'active' | 'maintenance' | 'disabled';
}

interface PaymentRequest {
  id: string;
  userId: string;
  platformId: string;
  amount: number;
  currency: string;
  description: string;
  region: string;
  paymentMethod: string;
  metadata: Record<string, any>;
  timestamp: Date;
}

interface RoutingRule {
  id: string;
  priority: number;
  conditions: {
    region?: string[];
    amount?: { min?: number; max?: number };
    paymentMethod?: string[];
    platform?: string[];
    riskLevel?: 'low' | 'medium' | 'high';
  };
  target: {
    gatewayId: string;
    midId?: string;
  };
  fallback: string[];
  enabled: boolean;
}

interface MID {
  id: string;
  gatewayId: string;
  region: string;
  descriptor: string;
  status: 'active' | 'paused' | 'suspended';
  limits: {
    daily: number;
    monthly: number;
    chargebackThreshold: number;
  };
  current: {
    volume: number;
    chargebacks: number;
    approvalRate: number;
  };
}

interface PayoutMethod {
  id: string;
  name: string;
  type: 'paxum' | 'epay' | 'wise' | 'crypto' | 'ach' | 'sepa' | 'payoneer' | 'skrill';
  regions: string[];
  processingTime: string;
  fees: {
    percentage: number;
    fixed: number;
  };
  limits: {
    min: number;
    max: number;
  };
  kycRequired: boolean;
}

export class PaymentOrchestrator extends EventEmitter {
  private gateways: Map<string, PaymentGateway> = new Map();
  private routingRules: RoutingRule[] = [];
  private mids: Map<string, MID> = new Map();
  private payoutMethods: Map<string, PayoutMethod> = new Map();
  private transactions: Map<string, any> = new Map();

  constructor() {
    super();
    this.initializeGateways();
    this.initializeRoutingRules();
    this.initializeMIDs();
    this.initializePayoutMethods();
    this.startHealthChecks();
  }

  private initializeGateways() {
    // Adult-friendly card gateways
    const cardGateways = [
      {
        id: 'ccbill',
        name: 'CCBill',
        type: 'card' as const,
        regions: ['US', 'CA', 'EU', 'UK'],
        adultFriendly: true,
        fees: { percentage: 10.5, fixed: 0, currency: 'USD' },
        limits: { min: 1, max: 10000, daily: 50000 },
        status: 'active' as const
      },
      {
        id: 'segpay',
        name: 'Segpay',
        type: 'card' as const,
        regions: ['US', 'EU', 'LATAM'],
        adultFriendly: true,
        fees: { percentage: 9.5, fixed: 0.30, currency: 'USD' },
        limits: { min: 1, max: 5000, daily: 25000 },
        status: 'active' as const
      },
      {
        id: 'epoch',
        name: 'Epoch',
        type: 'card' as const,
        regions: ['US', 'CA', 'EU'],
        adultFriendly: true,
        fees: { percentage: 8.9, fixed: 0, currency: 'USD' },
        limits: { min: 1, max: 2500, daily: 15000 },
        status: 'active' as const
      },
      {
        id: 'vendo',
        name: 'Vendo',
        type: 'card' as const,
        regions: ['EU', 'LATAM', 'APAC'],
        adultFriendly: true,
        fees: { percentage: 12.5, fixed: 0, currency: 'EUR' },
        limits: { min: 1, max: 1000, daily: 10000 },
        status: 'active' as const
      },
      {
        id: 'verotel',
        name: 'Verotel',
        type: 'card' as const,
        regions: ['EU', 'UK'],
        adultFriendly: true,
        fees: { percentage: 15.9, fixed: 0, currency: 'EUR' },
        limits: { min: 1, max: 500, daily: 5000 },
        status: 'active' as const
      }
    ];

    // Crypto gateways
    const cryptoGateways = [
      {
        id: 'bitpay',
        name: 'BitPay',
        type: 'crypto' as const,
        regions: ['GLOBAL'],
        adultFriendly: true,
        fees: { percentage: 1, fixed: 0, currency: 'USD' },
        limits: { min: 5, max: 100000, daily: 500000 },
        status: 'active' as const
      },
      {
        id: 'nowpayments',
        name: 'NOWPayments',
        type: 'crypto' as const,
        regions: ['GLOBAL'],
        adultFriendly: true,
        fees: { percentage: 0.5, fixed: 0, currency: 'USD' },
        limits: { min: 1, max: 50000, daily: 200000 },
        status: 'active' as const
      }
    ];

    // Bank/Direct gateways
    const bankGateways = [
      {
        id: 'ach',
        name: 'ACH Direct',
        type: 'bank' as const,
        regions: ['US'],
        adultFriendly: true,
        fees: { percentage: 0.5, fixed: 0.25, currency: 'USD' },
        limits: { min: 10, max: 25000, daily: 100000 },
        status: 'active' as const
      },
      {
        id: 'sepa',
        name: 'SEPA Direct',
        type: 'bank' as const,
        regions: ['EU'],
        adultFriendly: true,
        fees: { percentage: 0.8, fixed: 0.35, currency: 'EUR' },
        limits: { min: 5, max: 15000, daily: 75000 },
        status: 'active' as const
      }
    ];

    [...cardGateways, ...cryptoGateways, ...bankGateways].forEach(gateway => {
      this.gateways.set(gateway.id, gateway);
    });
  }

  private initializeRoutingRules() {
    this.routingRules = [
      {
        id: 'us-high-volume',
        priority: 1,
        conditions: {
          region: ['US'],
          amount: { min: 100 },
          riskLevel: 'low'
        },
        target: { gatewayId: 'ccbill' },
        fallback: ['segpay', 'epoch'],
        enabled: true
      },
      {
        id: 'eu-standard',
        priority: 2,
        conditions: {
          region: ['EU', 'UK']
        },
        target: { gatewayId: 'vendo' },
        fallback: ['verotel', 'ccbill'],
        enabled: true
      },
      {
        id: 'crypto-global',
        priority: 3,
        conditions: {
          paymentMethod: ['bitcoin', 'ethereum', 'usdt']
        },
        target: { gatewayId: 'bitpay' },
        fallback: ['nowpayments'],
        enabled: true
      },
      {
        id: 'bank-us',
        priority: 4,
        conditions: {
          region: ['US'],
          paymentMethod: ['ach', 'echeck']
        },
        target: { gatewayId: 'ach' },
        fallback: [],
        enabled: true
      },
      {
        id: 'bank-eu',
        priority: 5,
        conditions: {
          region: ['EU'],
          paymentMethod: ['sepa', 'bank_transfer']
        },
        target: { gatewayId: 'sepa' },
        fallback: [],
        enabled: true
      }
    ];
  }

  private initializeMIDs() {
    const mids = [
      {
        id: 'ccbill-us-001',
        gatewayId: 'ccbill',
        region: 'US',
        descriptor: 'FANZ*BOYFANZ',
        status: 'active' as const,
        limits: { daily: 25000, monthly: 500000, chargebackThreshold: 1.5 },
        current: { volume: 15000, chargebacks: 0.8, approvalRate: 94.2 }
      },
      {
        id: 'segpay-eu-001',
        gatewayId: 'segpay',
        region: 'EU',
        descriptor: 'FANZ*GIRLFANZ',
        status: 'active' as const,
        limits: { daily: 15000, monthly: 300000, chargebackThreshold: 2.0 },
        current: { volume: 8500, chargebacks: 1.2, approvalRate: 91.5 }
      }
    ];

    mids.forEach(mid => this.mids.set(mid.id, mid));
  }

  private initializePayoutMethods() {
    const methods = [
      {
        id: 'paxum',
        name: 'Paxum',
        type: 'paxum' as const,
        regions: ['GLOBAL'],
        processingTime: '1-2 business days',
        fees: { percentage: 2, fixed: 0 },
        limits: { min: 20, max: 25000 },
        kycRequired: true
      },
      {
        id: 'epayservice',
        name: 'ePayService',
        type: 'epay' as const,
        regions: ['GLOBAL'],
        processingTime: '24-48 hours',
        fees: { percentage: 3, fixed: 0 },
        limits: { min: 10, max: 10000 },
        kycRequired: true
      },
      {
        id: 'wise',
        name: 'Wise (TransferWise)',
        type: 'wise' as const,
        regions: ['US', 'EU', 'UK', 'CA', 'AU'],
        processingTime: '1-3 business days',
        fees: { percentage: 0.5, fixed: 2.50 },
        limits: { min: 50, max: 50000 },
        kycRequired: true
      },
      {
        id: 'crypto-btc',
        name: 'Bitcoin Payout',
        type: 'crypto' as const,
        regions: ['GLOBAL'],
        processingTime: '30-60 minutes',
        fees: { percentage: 0, fixed: 5.00 },
        limits: { min: 25, max: 100000 },
        kycRequired: false
      }
    ];

    methods.forEach(method => this.payoutMethods.set(method.id, method));
  }

  async processPayment(request: PaymentRequest): Promise<any> {
    const routedGateway = this.routePayment(request);
    
    if (!routedGateway) {
      throw new Error('No suitable payment gateway found for request');
    }

    const transaction = {
      id: request.id,
      userId: request.userId,
      platformId: request.platformId,
      amount: request.amount,
      currency: request.currency,
      gatewayId: routedGateway.id,
      status: 'processing',
      timestamp: new Date(),
      metadata: request.metadata
    };

    this.transactions.set(request.id, transaction);

    try {
      // Process payment through selected gateway
      const result = await this.processWithGateway(routedGateway, request);
      
      transaction.status = result.success ? 'completed' : 'failed';
      transaction.gatewayTransactionId = result.transactionId;
      transaction.fees = this.calculateFees(routedGateway, request.amount);
      
      this.emit('payment:processed', transaction);
      
      return {
        success: result.success,
        transactionId: transaction.id,
        gatewayTransactionId: result.transactionId,
        fees: transaction.fees
      };
      
    } catch (error) {
      transaction.status = 'failed';
      transaction.error = error.message;
      
      this.emit('payment:failed', transaction);
      throw error;
    }
  }

  private routePayment(request: PaymentRequest): PaymentGateway | null {
    // Sort rules by priority
    const sortedRules = this.routingRules
      .filter(rule => rule.enabled)
      .sort((a, b) => a.priority - b.priority);

    for (const rule of sortedRules) {
      if (this.matchesRule(request, rule)) {
        const gateway = this.gateways.get(rule.target.gatewayId);
        if (gateway && gateway.status === 'active') {
          return gateway;
        }
        
        // Try fallbacks
        for (const fallbackId of rule.fallback) {
          const fallbackGateway = this.gateways.get(fallbackId);
          if (fallbackGateway && fallbackGateway.status === 'active') {
            return fallbackGateway;
          }
        }
      }
    }

    return null;
  }

  private matchesRule(request: PaymentRequest, rule: RoutingRule): boolean {
    const { conditions } = rule;

    if (conditions.region && !conditions.region.includes(request.region)) {
      return false;
    }

    if (conditions.amount) {
      if (conditions.amount.min && request.amount < conditions.amount.min) {
        return false;
      }
      if (conditions.amount.max && request.amount > conditions.amount.max) {
        return false;
      }
    }

    if (conditions.paymentMethod && !conditions.paymentMethod.includes(request.paymentMethod)) {
      return false;
    }

    if (conditions.platform && !conditions.platform.includes(request.platformId)) {
      return false;
    }

    return true;
  }

  private async processWithGateway(gateway: PaymentGateway, request: PaymentRequest): Promise<any> {
    // Mock implementation - in production, this would integrate with actual gateway APIs
    console.log(`Processing payment through ${gateway.name}:`, {
      amount: request.amount,
      currency: request.currency,
      userId: request.userId
    });

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock success rate based on gateway
    const successRate = gateway.id === 'ccbill' ? 0.95 : 
                       gateway.id === 'segpay' ? 0.93 :
                       gateway.id === 'epoch' ? 0.91 : 0.88;

    const success = Math.random() < successRate;

    return {
      success,
      transactionId: success ? `${gateway.id}_${crypto.randomUUID()}` : null,
      message: success ? 'Payment processed successfully' : 'Payment declined'
    };
  }

  private calculateFees(gateway: PaymentGateway, amount: number): number {
    const percentageFee = (amount * gateway.fees.percentage) / 100;
    return percentageFee + gateway.fees.fixed;
  }

  async processCreatorPayout(creatorId: string, amount: number, methodId: string): Promise<any> {
    const method = this.payoutMethods.get(methodId);
    if (!method) {
      throw new Error('Invalid payout method');
    }

    if (amount < method.limits.min || amount > method.limits.max) {
      throw new Error(`Amount outside limits for ${method.name}`);
    }

    const fees = (amount * method.fees.percentage / 100) + method.fees.fixed;
    const netAmount = amount - fees;

    const payout = {
      id: crypto.randomUUID(),
      creatorId,
      amount,
      netAmount,
      fees,
      methodId,
      status: 'processing',
      timestamp: new Date()
    };

    console.log(`Processing payout via ${method.name}:`, {
      creatorId,
      amount,
      netAmount,
      fees
    });

    // Mock payout processing
    setTimeout(() => {
      payout.status = 'completed';
      this.emit('payout:completed', payout);
    }, 2000);

    return payout;
  }

  private startHealthChecks() {
    setInterval(() => {
      this.checkGatewayHealth();
      this.monitorMIDHealth();
    }, 60000); // Check every minute
  }

  private checkGatewayHealth() {
    this.gateways.forEach((gateway, id) => {
      // Mock health check - in production, this would ping gateway endpoints
      const isHealthy = Math.random() > 0.02; // 98% uptime simulation
      
      if (!isHealthy && gateway.status === 'active') {
        gateway.status = 'maintenance';
        this.emit('gateway:down', { gatewayId: id, gateway });
        console.warn(`Gateway ${gateway.name} is experiencing issues`);
      } else if (isHealthy && gateway.status === 'maintenance') {
        gateway.status = 'active';
        this.emit('gateway:restored', { gatewayId: id, gateway });
        console.log(`Gateway ${gateway.name} restored`);
      }
    });
  }

  private monitorMIDHealth() {
    this.mids.forEach((mid, id) => {
      // Check chargeback thresholds
      if (mid.current.chargebacks > mid.limits.chargebackThreshold) {
        mid.status = 'paused';
        this.emit('mid:paused', { midId: id, mid, reason: 'chargeback_threshold' });
        console.warn(`MID ${id} paused due to high chargeback rate: ${mid.current.chargebacks}%`);
      }

      // Check daily volume limits
      if (mid.current.volume > mid.limits.daily) {
        mid.status = 'paused';
        this.emit('mid:paused', { midId: id, mid, reason: 'daily_limit' });
        console.warn(`MID ${id} paused due to daily limit exceeded`);
      }
    });
  }

  // Public API methods
  getGateways(): PaymentGateway[] {
    return Array.from(this.gateways.values());
  }

  getPayoutMethods(): PayoutMethod[] {
    return Array.from(this.payoutMethods.values());
  }

  getTransactionStatus(transactionId: string): any {
    return this.transactions.get(transactionId);
  }

  updateRoutingRule(ruleId: string, updates: Partial<RoutingRule>): void {
    const ruleIndex = this.routingRules.findIndex(rule => rule.id === ruleId);
    if (ruleIndex !== -1) {
      this.routingRules[ruleIndex] = { ...this.routingRules[ruleIndex], ...updates };
      this.emit('routing:updated', { ruleId, updates });
    }
  }

  pauseMID(midId: string): void {
    const mid = this.mids.get(midId);
    if (mid) {
      mid.status = 'paused';
      this.emit('mid:paused', { midId, mid, reason: 'manual' });
    }
  }

  resumeMID(midId: string): void {
    const mid = this.mids.get(midId);
    if (mid) {
      mid.status = 'active';
      this.emit('mid:resumed', { midId, mid });
    }
  }
}

export default PaymentOrchestrator;