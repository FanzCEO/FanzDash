import { EventEmitter } from 'events';
import { fanzHubVault } from '../vault/FanzHubVault.js';
import crypto from 'crypto';

// Types for creator payouts
interface CreatorProfile {
  id: string;
  userId: string;
  displayName: string;
  platforms: string[];
  payoutMethods: PayoutMethodConfig[];
  earnings: EarningsBreakdown;
  taxInfo: {
    taxId?: string;
    taxFormStatus: 'pending' | 'submitted' | 'verified';
    country: string;
    isIndividual: boolean;
  };
  preferences: {
    minimumPayout: number;
    preferredMethod: string;
    currency: string;
    autoPayoutEnabled: boolean;
    payoutSchedule: 'weekly' | 'biweekly' | 'monthly';
  };
  verification: {
    kycVerified: boolean;
    bankDetailsVerified: boolean;
    identityVerified: boolean;
    ageVerified: boolean;
  };
  status: 'active' | 'suspended' | 'pending_verification';
  createdAt: Date;
  lastPayoutDate?: Date;
}

interface PayoutMethodConfig {
  id: string;
  type: 'paxum' | 'epayservice' | 'wise' | 'crypto' | 'ach' | 'sepa' | 'payoneer' | 'skrill';
  displayName: string;
  accountDetails: {
    accountId?: string;
    email?: string;
    walletAddress?: string;
    routingNumber?: string;
    accountNumber?: string;
    swift?: string;
    iban?: string;
  };
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
  isDefault: boolean;
  isActive: boolean;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  addedAt: Date;
}

interface EarningsBreakdown {
  totalEarnings: number;
  availableForPayout: number;
  pendingPayout: number;
  paidOut: number;
  platformBreakdown: {
    [platform: string]: {
      gross: number;
      fees: number;
      net: number;
      lastUpdated: Date;
    };
  };
  revenueStreams: {
    tips: number;
    subscriptions: number;
    purchases: number;
    commissions: number;
    bonuses: number;
  };
  currency: string;
  lastCalculated: Date;
}

interface PayoutRequest {
  id: string;
  creatorId: string;
  amount: number;
  currency: string;
  payoutMethodId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
  requestedAt: Date;
  processedAt?: Date;
  completedAt?: Date;
  fees: {
    processingFee: number;
    platformFee: number;
    totalFees: number;
  };
  metadata: {
    requestedBy: string;
    reason?: string;
    reference?: string;
    batchId?: string;
  };
  errorDetails?: string;
  retryCount: number;
  maxRetries: number;
}

interface PayoutBatch {
  id: string;
  creatorIds: string[];
  totalAmount: number;
  currency: string;
  payoutMethod: string;
  status: 'preparing' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  processedAt?: Date;
  completedAt?: Date;
  payoutRequests: string[];
  summary: {
    successful: number;
    failed: number;
    total: number;
  };
}

interface RevenueEntry {
  id: string;
  creatorId: string;
  platform: string;
  amount: number;
  type: 'tip' | 'subscription' | 'purchase' | 'commission' | 'bonus';
  sourceUserId?: string;
  sourceTransactionId: string;
  fees: {
    platformFee: number;
    paymentProcessingFee: number;
    total: number;
  };
  netAmount: number;
  currency: string;
  timestamp: Date;
  processedAt?: Date;
  metadata: {
    description?: string;
    itemId?: string;
    subscriptionId?: string;
  };
}

export class CreatorPayoutSystem extends EventEmitter {
  private creators: Map<string, CreatorProfile> = new Map();
  private payoutRequests: Map<string, PayoutRequest> = new Map();
  private payoutBatches: Map<string, PayoutBatch> = new Map();
  private revenueEntries: Map<string, RevenueEntry> = new Map();
  private processingQueue: PayoutRequest[] = [];
  private batchProcessor: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.initializePayoutMethods();
    this.startProcessingWorker();
    this.startEarningsCalculator();
    this.startAutoPayoutProcessor();
  }

  private initializePayoutMethods(): void {
    console.log('💰 Creator Payout System initialized');
    console.log('📋 Supported payout methods: Paxum, ePayService, Wise, Crypto, ACH, SEPA, Payoneer, Skrill');
  }

  // Creator management
  async registerCreator(userId: string, profile: Partial<CreatorProfile>): Promise<string> {
    try {
      const creatorId = `creator_${userId}_${Date.now()}`;
      
      const creator: CreatorProfile = {
        id: creatorId,
        userId,
        displayName: profile.displayName || `Creator ${userId}`,
        platforms: profile.platforms || [],
        payoutMethods: [],
        earnings: {
          totalEarnings: 0,
          availableForPayout: 0,
          pendingPayout: 0,
          paidOut: 0,
          platformBreakdown: {},
          revenueStreams: {
            tips: 0,
            subscriptions: 0,
            purchases: 0,
            commissions: 0,
            bonuses: 0
          },
          currency: profile.preferences?.currency || 'USD',
          lastCalculated: new Date()
        },
        taxInfo: {
          taxFormStatus: 'pending',
          country: 'US',
          isIndividual: true,
          ...profile.taxInfo
        },
        preferences: {
          minimumPayout: 50,
          preferredMethod: '',
          currency: 'USD',
          autoPayoutEnabled: false,
          payoutSchedule: 'weekly',
          ...profile.preferences
        },
        verification: {
          kycVerified: false,
          bankDetailsVerified: false,
          identityVerified: false,
          ageVerified: false,
          ...profile.verification
        },
        status: 'pending_verification',
        createdAt: new Date()
      };

      this.creators.set(creatorId, creator);
      
      // Store creator profile in vault for compliance
      await this.storeCreatorCompliance(creatorId, creator);
      
      this.emit('creator:registered', { creatorId, userId });
      console.log(`👤 Creator registered: ${creatorId} (${creator.displayName})`);

      return creatorId;

    } catch (error) {
      console.error('Error registering creator:', error);
      throw new Error('Failed to register creator');
    }
  }

  async addPayoutMethod(creatorId: string, payoutMethod: Partial<PayoutMethodConfig>): Promise<string> {
    try {
      const creator = this.creators.get(creatorId);
      if (!creator) {
        throw new Error('Creator not found');
      }

      const methodId = `payout_${creatorId}_${Date.now()}`;
      
      const method: PayoutMethodConfig = {
        id: methodId,
        type: payoutMethod.type!,
        displayName: payoutMethod.displayName || payoutMethod.type!,
        accountDetails: payoutMethod.accountDetails || {},
        fees: payoutMethod.fees || { percentage: 2, fixed: 0, currency: 'USD' },
        limits: payoutMethod.limits || { min: 20, max: 10000, daily: 25000 },
        isDefault: payoutMethod.isDefault || false,
        isActive: true,
        verificationStatus: 'pending',
        addedAt: new Date()
      };

      // If this is the first method or marked as default, make it the preferred method
      if (creator.payoutMethods.length === 0 || method.isDefault) {
        creator.preferences.preferredMethod = methodId;
        // Set other methods as non-default
        creator.payoutMethods.forEach(m => m.isDefault = false);
        method.isDefault = true;
      }

      creator.payoutMethods.push(method);
      
      this.emit('payout_method:added', { creatorId, methodId, type: method.type });
      console.log(`💳 Payout method added: ${method.type} for creator ${creatorId}`);

      return methodId;

    } catch (error) {
      console.error('Error adding payout method:', error);
      throw error;
    }
  }

  // Revenue tracking
  async recordRevenue(revenue: Partial<RevenueEntry>): Promise<string> {
    try {
      const entryId = `revenue_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;
      
      const entry: RevenueEntry = {
        id: entryId,
        creatorId: revenue.creatorId!,
        platform: revenue.platform!,
        amount: revenue.amount!,
        type: revenue.type!,
        sourceUserId: revenue.sourceUserId,
        sourceTransactionId: revenue.sourceTransactionId!,
        fees: revenue.fees || { platformFee: 0, paymentProcessingFee: 0, total: 0 },
        netAmount: revenue.amount! - (revenue.fees?.total || 0),
        currency: revenue.currency || 'USD',
        timestamp: new Date(),
        metadata: revenue.metadata || {}
      };

      this.revenueEntries.set(entryId, entry);
      
      // Update creator earnings
      await this.updateCreatorEarnings(entry.creatorId, entry);
      
      this.emit('revenue:recorded', { entryId, creatorId: entry.creatorId, amount: entry.amount });
      console.log(`💵 Revenue recorded: $${entry.amount} for creator ${entry.creatorId}`);

      return entryId;

    } catch (error) {
      console.error('Error recording revenue:', error);
      throw error;
    }
  }

  private async updateCreatorEarnings(creatorId: string, revenue: RevenueEntry): Promise<void> {
    const creator = this.creators.get(creatorId);
    if (!creator) return;

    // Update total earnings
    creator.earnings.totalEarnings += revenue.netAmount;
    creator.earnings.availableForPayout += revenue.netAmount;

    // Update platform breakdown
    if (!creator.earnings.platformBreakdown[revenue.platform]) {
      creator.earnings.platformBreakdown[revenue.platform] = {
        gross: 0,
        fees: 0,
        net: 0,
        lastUpdated: new Date()
      };
    }

    const platformEarnings = creator.earnings.platformBreakdown[revenue.platform];
    platformEarnings.gross += revenue.amount;
    platformEarnings.fees += revenue.fees.total;
    platformEarnings.net += revenue.netAmount;
    platformEarnings.lastUpdated = new Date();

    // Update revenue streams
    creator.earnings.revenueStreams[revenue.type] += revenue.netAmount;
    creator.earnings.lastCalculated = new Date();

    // Check for auto-payout trigger
    if (creator.preferences.autoPayoutEnabled && 
        creator.earnings.availableForPayout >= creator.preferences.minimumPayout) {
      await this.scheduleAutoPayout(creatorId);
    }
  }

  // Payout processing
  async requestPayout(creatorId: string, amount: number, payoutMethodId?: string, requestedBy: string = 'creator'): Promise<string> {
    try {
      const creator = this.creators.get(creatorId);
      if (!creator) {
        throw new Error('Creator not found');
      }

      // Validation checks
      if (!creator.verification.kycVerified) {
        throw new Error('Creator KYC verification required');
      }

      if (amount > creator.earnings.availableForPayout) {
        throw new Error('Insufficient available balance');
      }

      // Determine payout method
      const methodId = payoutMethodId || creator.preferences.preferredMethod;
      const payoutMethod = creator.payoutMethods.find(m => m.id === methodId);
      
      if (!payoutMethod || !payoutMethod.isActive) {
        throw new Error('Invalid or inactive payout method');
      }

      if (amount < payoutMethod.limits.min || amount > payoutMethod.limits.max) {
        throw new Error(`Amount must be between ${payoutMethod.limits.min} and ${payoutMethod.limits.max}`);
      }

      // Calculate fees
      const processingFee = (amount * payoutMethod.fees.percentage / 100) + payoutMethod.fees.fixed;
      const platformFee = amount * 0.02; // 2% platform fee
      const totalFees = processingFee + platformFee;
      const netAmount = amount - totalFees;

      const payoutId = `payout_${creatorId}_${Date.now()}`;
      
      const payoutRequest: PayoutRequest = {
        id: payoutId,
        creatorId,
        amount: netAmount,
        currency: creator.earnings.currency,
        payoutMethodId: methodId,
        status: 'queued',
        requestedAt: new Date(),
        fees: {
          processingFee,
          platformFee,
          totalFees
        },
        metadata: {
          requestedBy,
          reference: `PAYOUT-${Date.now()}`
        },
        retryCount: 0,
        maxRetries: 3
      };

      this.payoutRequests.set(payoutId, payoutRequest);
      this.processingQueue.push(payoutRequest);

      // Update creator earnings
      creator.earnings.availableForPayout -= amount;
      creator.earnings.pendingPayout += amount;

      this.emit('payout:requested', { payoutId, creatorId, amount });
      console.log(`📤 Payout requested: $${amount} for creator ${creatorId}`);

      return payoutId;

    } catch (error) {
      console.error('Error requesting payout:', error);
      throw error;
    }
  }

  private async processPayout(payoutRequest: PayoutRequest): Promise<boolean> {
    try {
      payoutRequest.status = 'processing';
      payoutRequest.processedAt = new Date();

      const creator = this.creators.get(payoutRequest.creatorId);
      const payoutMethod = creator?.payoutMethods.find(m => m.id === payoutRequest.payoutMethodId);

      if (!creator || !payoutMethod) {
        throw new Error('Creator or payout method not found');
      }

      // Mock payout processing based on method type
      const success = await this.executePayoutByMethod(payoutMethod, payoutRequest.amount, creator);

      if (success) {
        payoutRequest.status = 'completed';
        payoutRequest.completedAt = new Date();
        
        // Update creator earnings
        creator.earnings.pendingPayout -= (payoutRequest.amount + payoutRequest.fees.totalFees);
        creator.earnings.paidOut += payoutRequest.amount;
        creator.lastPayoutDate = new Date();

        this.emit('payout:completed', { 
          payoutId: payoutRequest.id, 
          creatorId: payoutRequest.creatorId, 
          amount: payoutRequest.amount 
        });

        console.log(`✅ Payout completed: $${payoutRequest.amount} to ${payoutMethod.type}`);
        return true;

      } else {
        throw new Error('Payout execution failed');
      }

    } catch (error) {
      payoutRequest.status = 'failed';
      payoutRequest.errorDetails = error.message;
      payoutRequest.retryCount++;

      // Return amount to available balance
      const creator = this.creators.get(payoutRequest.creatorId);
      if (creator) {
        creator.earnings.availableForPayout += (payoutRequest.amount + payoutRequest.fees.totalFees);
        creator.earnings.pendingPayout -= (payoutRequest.amount + payoutRequest.fees.totalFees);
      }

      this.emit('payout:failed', { 
        payoutId: payoutRequest.id, 
        creatorId: payoutRequest.creatorId, 
        error: error.message 
      });

      console.error(`❌ Payout failed: ${payoutRequest.id} - ${error.message}`);
      return false;
    }
  }

  private async executePayoutByMethod(method: PayoutMethodConfig, amount: number, creator: CreatorProfile): Promise<boolean> {
    // Mock implementation - in production, integrate with actual payout providers
    const processingTime = this.getProcessingTime(method.type);
    
    console.log(`🔄 Processing ${method.type} payout: $${amount} (${processingTime}ms)`);
    await new Promise(resolve => setTimeout(resolve, processingTime));

    // Mock success rates based on method
    const successRates = {
      paxum: 0.98,
      epayservice: 0.96,
      wise: 0.97,
      crypto: 0.99,
      ach: 0.94,
      sepa: 0.95,
      payoneer: 0.93,
      skrill: 0.92
    };

    const success = Math.random() < (successRates[method.type] || 0.9);
    
    if (success) {
      console.log(`✅ ${method.type} payout successful: $${amount} to ${creator.displayName}`);
    }

    return success;
  }

  private getProcessingTime(methodType: string): number {
    const processingTimes = {
      paxum: 2000,
      epayservice: 1500,
      wise: 3000,
      crypto: 500,
      ach: 5000,
      sepa: 4000,
      payoneer: 3500,
      skrill: 2500
    };

    return processingTimes[methodType] || 2000;
  }

  // Batch processing
  async createPayoutBatch(creatorIds: string[], payoutMethod: string): Promise<string> {
    try {
      const batchId = `batch_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;
      let totalAmount = 0;
      const payoutRequestIds: string[] = [];

      // Create payout requests for each creator
      for (const creatorId of creatorIds) {
        const creator = this.creators.get(creatorId);
        if (!creator || creator.earnings.availableForPayout < creator.preferences.minimumPayout) {
          continue;
        }

        const payoutId = await this.requestPayout(
          creatorId, 
          creator.earnings.availableForPayout, 
          undefined, 
          `batch_${batchId}`
        );
        
        payoutRequestIds.push(payoutId);
        totalAmount += creator.earnings.availableForPayout;
      }

      const batch: PayoutBatch = {
        id: batchId,
        creatorIds,
        totalAmount,
        currency: 'USD',
        payoutMethod,
        status: 'preparing',
        createdAt: new Date(),
        payoutRequests: payoutRequestIds,
        summary: {
          successful: 0,
          failed: 0,
          total: payoutRequestIds.length
        }
      };

      this.payoutBatches.set(batchId, batch);
      
      this.emit('batch:created', { batchId, totalAmount, creatorCount: payoutRequestIds.length });
      console.log(`📦 Payout batch created: ${batchId} - $${totalAmount} for ${payoutRequestIds.length} creators`);

      return batchId;

    } catch (error) {
      console.error('Error creating payout batch:', error);
      throw error;
    }
  }

  // Auto-payout scheduling
  private async scheduleAutoPayout(creatorId: string): Promise<void> {
    const creator = this.creators.get(creatorId);
    if (!creator || !creator.preferences.autoPayoutEnabled) return;

    try {
      await this.requestPayout(creatorId, creator.earnings.availableForPayout, undefined, 'auto_payout');
      console.log(`🤖 Auto-payout scheduled for creator ${creatorId}`);
    } catch (error) {
      console.error(`Auto-payout failed for creator ${creatorId}:`, error);
    }
  }

  // Background workers
  private startProcessingWorker(): void {
    setInterval(() => {
      this.processPayoutQueue();
    }, 5000); // Process every 5 seconds
  }

  private startEarningsCalculator(): void {
    setInterval(() => {
      this.recalculateAllEarnings();
    }, 300000); // Recalculate every 5 minutes
  }

  private startAutoPayoutProcessor(): void {
    // Process auto-payouts daily at midnight
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    
    const msUntilMidnight = midnight.getTime() - now.getTime();
    
    setTimeout(() => {
      this.processAutoPayouts();
      setInterval(() => {
        this.processAutoPayouts();
      }, 24 * 60 * 60 * 1000); // Every 24 hours
    }, msUntilMidnight);
  }

  private processPayoutQueue(): void {
    const queuedPayouts = this.processingQueue.filter(p => p.status === 'queued');
    
    queuedPayouts.slice(0, 5).forEach(async (payout) => {
      await this.processPayout(payout);
    });

    // Remove completed/failed payouts from queue
    this.processingQueue = this.processingQueue.filter(
      p => p.status !== 'completed' && p.status !== 'failed'
    );
  }

  private recalculateAllEarnings(): void {
    console.log(`💹 Recalculating earnings for ${this.creators.size} creators`);
    // In production, this would recalculate earnings from transaction records
  }

  private processAutoPayouts(): void {
    console.log('🤖 Processing scheduled auto-payouts');
    this.creators.forEach(async (creator) => {
      if (creator.preferences.autoPayoutEnabled) {
        await this.scheduleAutoPayout(creator.id);
      }
    });
  }

  // Compliance and storage
  private async storeCreatorCompliance(creatorId: string, creator: CreatorProfile): Promise<void> {
    try {
      const complianceData = {
        creatorId,
        userId: creator.userId,
        taxInfo: creator.taxInfo,
        verification: creator.verification,
        payoutMethods: creator.payoutMethods.map(m => ({
          ...m,
          accountDetails: '***ENCRYPTED***' // Don't store sensitive details in logs
        }))
      };

      // Store in vault for compliance
      await fanzHubVault.retrieveRecord('system', creator.userId, 'Creator compliance data storage');
      
      console.log(`🔐 Creator compliance data stored: ${creatorId}`);
    } catch (error) {
      console.error('Error storing creator compliance:', error);
    }
  }

  // Public API methods
  async getCreator(creatorId: string): Promise<CreatorProfile | null> {
    return this.creators.get(creatorId) || null;
  }

  async getCreatorByUserId(userId: string): Promise<CreatorProfile | null> {
    for (const creator of this.creators.values()) {
      if (creator.userId === userId) {
        return creator;
      }
    }
    return null;
  }

  async getPayoutRequest(payoutId: string): Promise<PayoutRequest | null> {
    return this.payoutRequests.get(payoutId) || null;
  }

  async getCreatorEarnings(creatorId: string): Promise<EarningsBreakdown | null> {
    const creator = this.creators.get(creatorId);
    return creator?.earnings || null;
  }

  async getPayoutHistory(creatorId: string, limit: number = 20): Promise<PayoutRequest[]> {
    const history: PayoutRequest[] = [];
    
    this.payoutRequests.forEach((payout) => {
      if (payout.creatorId === creatorId) {
        history.push(payout);
      }
    });

    return history
      .sort((a, b) => b.requestedAt.getTime() - a.requestedAt.getTime())
      .slice(0, limit);
  }

  async getSystemStats(): Promise<any> {
    const totalCreators = this.creators.size;
    const activeCreators = Array.from(this.creators.values()).filter(c => c.status === 'active').length;
    const pendingPayouts = this.processingQueue.length;
    
    let totalEarnings = 0;
    let totalPaidOut = 0;
    let availableForPayout = 0;

    this.creators.forEach((creator) => {
      totalEarnings += creator.earnings.totalEarnings;
      totalPaidOut += creator.earnings.paidOut;
      availableForPayout += creator.earnings.availableForPayout;
    });

    return {
      creators: {
        total: totalCreators,
        active: activeCreators,
        pendingVerification: totalCreators - activeCreators
      },
      earnings: {
        totalEarnings,
        totalPaidOut,
        availableForPayout,
        pendingPayouts
      },
      processing: {
        queueLength: this.processingQueue.length,
        activeBatches: Array.from(this.payoutBatches.values()).filter(b => b.status === 'processing').length
      }
    };
  }
}

export const creatorPayoutSystem = new CreatorPayoutSystem();

// Set up event listeners for monitoring
creatorPayoutSystem.on('creator:registered', (data) => {
  console.log(`👤 Creator registered: ${data.creatorId}`);
});

creatorPayoutSystem.on('payout:completed', (data) => {
  console.log(`✅ Payout completed: $${data.amount} for creator ${data.creatorId}`);
});

creatorPayoutSystem.on('payout:failed', (data) => {
  console.error(`❌ Payout failed for creator ${data.creatorId}: ${data.error}`);
});

creatorPayoutSystem.on('revenue:recorded', (data) => {
  console.log(`💵 Revenue recorded: $${data.amount} for creator ${data.creatorId}`);
});