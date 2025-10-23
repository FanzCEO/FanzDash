import { EventEmitter } from 'events';
import crypto from 'crypto';

interface CreatorPayoutMethod {
  id: string;
  creatorId: string;
  type: 'paxum' | 'epayservice' | 'wise' | 'payoneer' | 'crypto' | 'ach' | 'sepa' | 'wire' | 'check';
  displayName: string;
  accountDetails: {
    email?: string;
    accountId?: string;
    walletAddress?: string;
    bankAccount?: string;
    routingNumber?: string;
    swiftCode?: string;
    iban?: string;
    sortCode?: string;
    cryptoCurrency?: 'BTC' | 'ETH' | 'USDT' | 'USDC';
    network?: string;
  };
  verificationStatus: 'pending' | 'verified' | 'rejected' | 'suspended';
  isDefault: boolean;
  minimumPayout: number;
  maximumPayout: number;
  feeStructure: {
    fixedFee: number;
    percentageFee: number;
    currency: string;
  };
  restrictions: {
    regions?: string[];
    currencies?: string[];
    minimumBalance?: number;
    dailyLimit?: number;
    monthlyLimit?: number;
  };
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  lastUsed?: Date;
}

interface CreatorRevenue {
  id: string;
  creatorId: string;
  transactionId: string;
  sourceType: 'subscription' | 'tips' | 'ppv' | 'custom_content' | 'live_stream' | 'merchandise' | 'other';
  grossAmount: number;
  platformFee: number;
  processingFee: number;
  netAmount: number;
  currency: string;
  platform: string;
  fanId?: string;
  contentId?: string;
  recordedAt: Date;
  payoutEligibleAt: Date;
  payoutBatch?: string;
  status: 'pending' | 'eligible' | 'batched' | 'paid' | 'disputed' | 'refunded';
  metadata: Record<string, any>;
}

interface PayoutRequest {
  id: string;
  creatorId: string;
  payoutMethodId: string;
  requestedAmount: number;
  eligibleAmount: number;
  currency: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  requestType: 'manual' | 'scheduled' | 'threshold' | 'emergency';
  status: 'pending' | 'approved' | 'processing' | 'completed' | 'failed' | 'cancelled';
  scheduledFor?: Date;
  processedAt?: Date;
  completedAt?: Date;
  failureReason?: string;
  batchId?: string;
  transactionFee: number;
  netPayoutAmount: number;
  externalTransactionId?: string;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

interface PayoutBatch {
  id: string;
  processor: string;
  totalAmount: number;
  totalFees: number;
  currency: string;
  requestCount: number;
  status: 'created' | 'submitted' | 'processing' | 'completed' | 'failed' | 'partially_failed';
  submittedAt?: Date;
  completedAt?: Date;
  externalBatchId?: string;
  failureCount: number;
  successCount: number;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

interface CreatorLedger {
  creatorId: string;
  totalEarnings: number;
  availableBalance: number;
  pendingBalance: number;
  paidOut: number;
  withheld: number;
  currency: string;
  lastPayoutDate?: Date;
  nextPayoutDate?: Date;
  payoutFrequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'manual';
  minimumPayoutThreshold: number;
  taxWithholding: {
    required: boolean;
    percentage: number;
    ytdWithheld: number;
    form1099Required: boolean;
  };
  complianceStatus: {
    kycVerified: boolean;
    taxFormsComplete: boolean;
    bankingVerified: boolean;
    ageVerified: boolean;
  };
  restrictions: {
    payoutsDisabled: boolean;
    reason?: string;
    disabledUntil?: Date;
  };
  updatedAt: Date;
}

interface PayoutAutomationRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  priority: number;
  conditions: {
    minimumBalance?: number;
    scheduleDays?: number[]; // 0-6 for Sunday-Saturday
    scheduleTime?: string; // HH:MM format
    creatorTypes?: string[];
    platforms?: string[];
    payoutMethods?: string[];
  };
  actions: {
    triggerPayout: boolean;
    notifyCreator: boolean;
    requireApproval: boolean;
    batchSize?: number;
    maxRetries?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export class PayoutAutomationSystem extends EventEmitter {
  private creatorLedgers: Map<string, CreatorLedger> = new Map();
  private payoutMethods: Map<string, CreatorPayoutMethod> = new Map();
  private revenueRecords: Map<string, CreatorRevenue> = new Map();
  private payoutRequests: Map<string, PayoutRequest> = new Map();
  private payoutBatches: Map<string, PayoutBatch> = new Map();
  private automationRules: Map<string, PayoutAutomationRule> = new Map();
  private processorClients: Map<string, any> = new Map();
  private automationActive: boolean = true;
  private batchProcessingQueue: PayoutRequest[] = [];
  private scheduledTasks: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    super();
    this.initializeDefaultRules();
    this.initializePayoutProcessors();
    this.startAutomationEngine();
    this.startHealthMonitoring();
  }

  private initializeDefaultRules(): void {
    const defaultRules: PayoutAutomationRule[] = [
      {
        id: 'weekly_auto_payout',
        name: 'Weekly Automatic Payouts',
        description: 'Process payouts every Friday for creators with $50+ balance',
        enabled: true,
        priority: 1,
        conditions: {
          minimumBalance: 50,
          scheduleDays: [5], // Friday
          scheduleTime: '10:00'
        },
        actions: {
          triggerPayout: true,
          notifyCreator: true,
          requireApproval: false,
          batchSize: 100,
          maxRetries: 3
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'high_balance_payout',
        name: 'High Balance Auto Payout',
        description: 'Process payouts immediately when balance exceeds $500',
        enabled: true,
        priority: 2,
        conditions: {
          minimumBalance: 500
        },
        actions: {
          triggerPayout: true,
          notifyCreator: true,
          requireApproval: false,
          maxRetries: 5
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'monthly_threshold',
        name: 'Monthly Minimum Payout',
        description: 'Process payouts monthly for creators with $25+ balance',
        enabled: true,
        priority: 3,
        conditions: {
          minimumBalance: 25,
          scheduleDays: [1], // Monday
          scheduleTime: '14:00'
        },
        actions: {
          triggerPayout: true,
          notifyCreator: true,
          requireApproval: false,
          batchSize: 200
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    defaultRules.forEach(rule => {
      this.automationRules.set(rule.id, rule);
    });

    console.log(`💳 Payout Automation initialized with ${this.automationRules.size} rules`);
    this.emit('automation_initialized', this.automationRules.size);
  }

  private initializePayoutProcessors(): void {
    // Initialize connections to payout processors
    const processors = [
      'paxum', 'epayservice', 'wise', 'payoneer', 'crypto', 'ach', 'sepa', 'wire'
    ];

    processors.forEach(processor => {
      // In production, these would be actual API clients
      this.processorClients.set(processor, {
        name: processor,
        connected: true,
        lastHealthCheck: new Date(),
        rateLimits: {
          requestsPerMinute: processor === 'crypto' ? 60 : 30,
          requestsPerHour: processor === 'crypto' ? 1000 : 500
        }
      });
    });

    console.log(`🔌 Initialized ${processors.length} payout processors`);
  }

  // Creator ledger management
  public async updateCreatorRevenue(
    creatorId: string,
    revenue: Omit<CreatorRevenue, 'id' | 'recordedAt' | 'status'>
  ): Promise<string> {
    const revenueRecord: CreatorRevenue = {
      id: this.generateId(),
      recordedAt: new Date(),
      status: 'pending',
      ...revenue,
      creatorId
    };

    this.revenueRecords.set(revenueRecord.id, revenueRecord);

    // Update creator ledger
    await this.updateCreatorLedger(creatorId, revenueRecord);

    // Check if automation rules should trigger
    await this.evaluateAutomationRules(creatorId);

    this.emit('revenue_recorded', revenueRecord);
    console.log(`💰 Revenue recorded for creator ${creatorId}: $${revenue.netAmount}`);

    return revenueRecord.id;
  }

  private async updateCreatorLedger(creatorId: string, revenue: CreatorRevenue): Promise<void> {
    let ledger = this.creatorLedgers.get(creatorId);

    if (!ledger) {
      ledger = {
        creatorId,
        totalEarnings: 0,
        availableBalance: 0,
        pendingBalance: 0,
        paidOut: 0,
        withheld: 0,
        currency: revenue.currency,
        payoutFrequency: 'weekly',
        minimumPayoutThreshold: 50,
        taxWithholding: {
          required: false,
          percentage: 0,
          ytdWithheld: 0,
          form1099Required: false
        },
        complianceStatus: {
          kycVerified: false,
          taxFormsComplete: false,
          bankingVerified: false,
          ageVerified: false
        },
        restrictions: {
          payoutsDisabled: false
        },
        updatedAt: new Date()
      };
    }

    // Update ledger based on revenue record
    if (revenue.payoutEligibleAt <= new Date()) {
      ledger.availableBalance += revenue.netAmount;
    } else {
      ledger.pendingBalance += revenue.netAmount;
    }

    ledger.totalEarnings += revenue.netAmount;
    ledger.updatedAt = new Date();

    this.creatorLedgers.set(creatorId, ledger);
    this.emit('ledger_updated', { creatorId, ledger });
  }

  // Payout method management
  public async addPayoutMethod(
    creatorId: string,
    method: Omit<CreatorPayoutMethod, 'id' | 'creatorId' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    const payoutMethod: CreatorPayoutMethod = {
      id: this.generateId(),
      creatorId,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...method
    };

    // Validate payout method based on type
    await this.validatePayoutMethod(payoutMethod);

    this.payoutMethods.set(payoutMethod.id, payoutMethod);

    // Set as default if it's the first method or explicitly requested
    if (method.isDefault || !this.getCreatorPayoutMethods(creatorId).length) {
      await this.setDefaultPayoutMethod(creatorId, payoutMethod.id);
    }

    console.log(`💳 Added ${method.type} payout method for creator ${creatorId}`);
    this.emit('payout_method_added', payoutMethod);

    return payoutMethod.id;
  }

  private async validatePayoutMethod(method: CreatorPayoutMethod): Promise<void> {
    switch (method.type) {
      case 'paxum':
      case 'epayservice':
        if (!method.accountDetails.email) {
          throw new Error(`${method.type} requires email address`);
        }
        break;

      case 'wise':
      case 'payoneer':
        if (!method.accountDetails.email && !method.accountDetails.accountId) {
          throw new Error(`${method.type} requires email or account ID`);
        }
        break;

      case 'crypto':
        if (!method.accountDetails.walletAddress || !method.accountDetails.cryptoCurrency) {
          throw new Error('Crypto payouts require wallet address and currency');
        }
        break;

      case 'ach':
        if (!method.accountDetails.bankAccount || !method.accountDetails.routingNumber) {
          throw new Error('ACH requires bank account and routing number');
        }
        break;

      case 'sepa':
        if (!method.accountDetails.iban) {
          throw new Error('SEPA requires IBAN');
        }
        break;

      case 'wire':
        if (!method.accountDetails.bankAccount || !method.accountDetails.swiftCode) {
          throw new Error('Wire transfer requires bank account and SWIFT code');
        }
        break;
    }
  }

  // Automated payout processing
  private async evaluateAutomationRules(creatorId: string): Promise<void> {
    const ledger = this.creatorLedgers.get(creatorId);
    if (!ledger || ledger.restrictions.payoutsDisabled) return;

    const applicableRules = Array.from(this.automationRules.values())
      .filter(rule => rule.enabled)
      .sort((a, b) => a.priority - b.priority);

    for (const rule of applicableRules) {
      const shouldTrigger = await this.shouldRuleTrigger(rule, ledger);
      
      if (shouldTrigger) {
        console.log(`🎯 Triggering automation rule: ${rule.name} for creator ${creatorId}`);
        await this.executeAutomationRule(rule, creatorId);
        break; // Execute only the highest priority applicable rule
      }
    }
  }

  private async shouldRuleTrigger(rule: PayoutAutomationRule, ledger: CreatorLedger): Promise<boolean> {
    const conditions = rule.conditions;

    // Check minimum balance
    if (conditions.minimumBalance && ledger.availableBalance < conditions.minimumBalance) {
      return false;
    }

    // Check schedule (if specified)
    if (conditions.scheduleDays || conditions.scheduleTime) {
      const now = new Date();
      
      if (conditions.scheduleDays && !conditions.scheduleDays.includes(now.getDay())) {
        return false;
      }

      if (conditions.scheduleTime) {
        const [targetHour, targetMinute] = conditions.scheduleTime.split(':').map(Number);
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        
        if (currentHour !== targetHour || Math.abs(currentMinute - targetMinute) > 5) {
          return false;
        }
      }
    }

    return true;
  }

  private async executeAutomationRule(rule: PayoutAutomationRule, creatorId: string): Promise<void> {
    try {
      const ledger = this.creatorLedgers.get(creatorId);
      if (!ledger) return;

      if (rule.actions.triggerPayout) {
        const defaultMethod = this.getCreatorPayoutMethods(creatorId).find(m => m.isDefault);
        if (!defaultMethod) {
          console.warn(`⚠️ No default payout method for creator ${creatorId}`);
          return;
        }

        await this.createPayoutRequest({
          creatorId,
          payoutMethodId: defaultMethod.id,
          requestedAmount: ledger.availableBalance,
          eligibleAmount: ledger.availableBalance,
          currency: ledger.currency,
          priority: 'normal',
          requestType: 'scheduled',
          transactionFee: this.calculateTransactionFee(defaultMethod, ledger.availableBalance),
          netPayoutAmount: ledger.availableBalance - this.calculateTransactionFee(defaultMethod, ledger.availableBalance),
          metadata: {
            automationRuleId: rule.id,
            ruleName: rule.name
          }
        });

        if (rule.actions.notifyCreator) {
          await this.notifyCreator(creatorId, 'payout_scheduled', {
            amount: ledger.availableBalance,
            currency: ledger.currency,
            method: defaultMethod.type
          });
        }
      }

    } catch (error) {
      console.error(`❌ Failed to execute automation rule ${rule.name}:`, error);
      this.emit('automation_error', { rule: rule.id, creatorId, error: error.message });
    }
  }

  // Payout request creation and processing
  public async createPayoutRequest(
    request: Omit<PayoutRequest, 'id' | 'status' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    const payoutRequest: PayoutRequest = {
      id: this.generateId(),
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...request
    };

    // Validate payout request
    await this.validatePayoutRequest(payoutRequest);

    this.payoutRequests.set(payoutRequest.id, payoutRequest);

    // Add to batch processing queue
    this.batchProcessingQueue.push(payoutRequest);

    console.log(`📝 Created payout request ${payoutRequest.id} for creator ${request.creatorId}`);
    this.emit('payout_request_created', payoutRequest);

    // Process immediately if urgent or trigger batch processing
    if (request.priority === 'urgent') {
      await this.processSinglePayout(payoutRequest.id);
    } else {
      this.scheduleBatchProcessing();
    }

    return payoutRequest.id;
  }

  private async validatePayoutRequest(request: PayoutRequest): Promise<void> {
    // Check creator ledger
    const ledger = this.creatorLedgers.get(request.creatorId);
    if (!ledger) {
      throw new Error('Creator ledger not found');
    }

    if (ledger.restrictions.payoutsDisabled) {
      throw new Error('Payouts disabled for this creator');
    }

    if (request.requestedAmount > ledger.availableBalance) {
      throw new Error('Insufficient available balance');
    }

    // Check payout method
    const method = this.payoutMethods.get(request.payoutMethodId);
    if (!method) {
      throw new Error('Payout method not found');
    }

    if (method.verificationStatus !== 'verified') {
      throw new Error('Payout method not verified');
    }

    // Check compliance requirements
    if (!ledger.complianceStatus.kycVerified) {
      throw new Error('KYC verification required');
    }

    if (!ledger.complianceStatus.ageVerified) {
      throw new Error('Age verification required');
    }
  }

  // Batch processing
  private scheduleBatchProcessing(): void {
    if (this.scheduledTasks.has('batch_processing')) return;

    const timeout = setTimeout(async () => {
      await this.processPendingBatches();
      this.scheduledTasks.delete('batch_processing');
    }, 5 * 60 * 1000); // Process batches every 5 minutes

    this.scheduledTasks.set('batch_processing', timeout);
  }

  private async processPendingBatches(): Promise<void> {
    if (this.batchProcessingQueue.length === 0) return;

    console.log(`🔄 Processing ${this.batchProcessingQueue.length} pending payout requests`);

    // Group requests by processor and currency
    const batches = this.groupRequestsForBatching(this.batchProcessingQueue);

    for (const [processorKey, requests] of batches.entries()) {
      try {
        const batch = await this.createPayoutBatch(processorKey, requests);
        await this.submitPayoutBatch(batch.id);
      } catch (error) {
        console.error(`❌ Failed to process batch for ${processorKey}:`, error);
        this.emit('batch_processing_error', { processor: processorKey, error: error.message });
      }
    }

    // Clear the queue
    this.batchProcessingQueue = [];
  }

  private groupRequestsForBatching(requests: PayoutRequest[]): Map<string, PayoutRequest[]> {
    const batches = new Map<string, PayoutRequest[]>();

    for (const request of requests) {
      const method = this.payoutMethods.get(request.payoutMethodId);
      if (!method) continue;

      const key = `${method.type}_${request.currency}`;
      
      if (!batches.has(key)) {
        batches.set(key, []);
      }
      
      batches.get(key)!.push(request);
    }

    return batches;
  }

  private async createPayoutBatch(processorKey: string, requests: PayoutRequest[]): Promise<PayoutBatch> {
    const [processor, currency] = processorKey.split('_');
    
    const batch: PayoutBatch = {
      id: this.generateId(),
      processor,
      currency,
      requestCount: requests.length,
      totalAmount: requests.reduce((sum, req) => sum + req.netPayoutAmount, 0),
      totalFees: requests.reduce((sum, req) => sum + req.transactionFee, 0),
      status: 'created',
      failureCount: 0,
      successCount: 0,
      metadata: {
        requests: requests.map(r => r.id)
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.payoutBatches.set(batch.id, batch);

    // Update request statuses
    for (const request of requests) {
      request.status = 'batched';
      request.batchId = batch.id;
      request.updatedAt = new Date();
      this.payoutRequests.set(request.id, request);
    }

    console.log(`📦 Created payout batch ${batch.id} with ${requests.length} requests totaling $${batch.totalAmount}`);
    this.emit('batch_created', batch);

    return batch;
  }

  private async submitPayoutBatch(batchId: string): Promise<void> {
    const batch = this.payoutBatches.get(batchId);
    if (!batch) throw new Error('Batch not found');

    try {
      batch.status = 'submitted';
      batch.submittedAt = new Date();
      batch.updatedAt = new Date();

      // Mock batch submission to processor
      const processorClient = this.processorClients.get(batch.processor);
      if (!processorClient) {
        throw new Error(`Processor ${batch.processor} not available`);
      }

      // Simulate batch processing
      setTimeout(async () => {
        await this.completeBatchProcessing(batchId, 0.95); // 95% success rate simulation
      }, 30000); // 30 second processing simulation

      console.log(`🚀 Submitted payout batch ${batchId} to ${batch.processor}`);
      this.emit('batch_submitted', batch);

    } catch (error) {
      batch.status = 'failed';
      batch.updatedAt = new Date();
      
      console.error(`❌ Failed to submit batch ${batchId}:`, error);
      this.emit('batch_submission_failed', { batch, error: error.message });
    }

    this.payoutBatches.set(batchId, batch);
  }

  private async completeBatchProcessing(batchId: string, successRate: number): Promise<void> {
    const batch = this.payoutBatches.get(batchId);
    if (!batch) return;

    const requests = batch.metadata.requests.map(id => this.payoutRequests.get(id)).filter(Boolean);
    
    let successCount = 0;
    let failureCount = 0;

    for (const request of requests) {
      const isSuccess = Math.random() < successRate;
      
      if (isSuccess) {
        request!.status = 'completed';
        request!.completedAt = new Date();
        request!.externalTransactionId = `ext_${this.generateId()}`;
        successCount++;

        // Update creator ledger
        await this.updateLedgerForCompletedPayout(request!);
      } else {
        request!.status = 'failed';
        request!.failureReason = 'Processor rejected transaction';
        failureCount++;
      }

      request!.processedAt = new Date();
      request!.updatedAt = new Date();
      this.payoutRequests.set(request!.id, request!);

      this.emit('payout_processed', request);
    }

    batch.status = failureCount === 0 ? 'completed' : (successCount > 0 ? 'partially_failed' : 'failed');
    batch.successCount = successCount;
    batch.failureCount = failureCount;
    batch.completedAt = new Date();
    batch.updatedAt = new Date();

    this.payoutBatches.set(batchId, batch);

    console.log(`✅ Batch ${batchId} completed: ${successCount} successes, ${failureCount} failures`);
    this.emit('batch_completed', batch);
  }

  private async updateLedgerForCompletedPayout(request: PayoutRequest): Promise<void> {
    const ledger = this.creatorLedgers.get(request.creatorId);
    if (!ledger) return;

    ledger.availableBalance -= request.netPayoutAmount + request.transactionFee;
    ledger.paidOut += request.netPayoutAmount;
    ledger.lastPayoutDate = new Date();
    ledger.updatedAt = new Date();

    this.creatorLedgers.set(request.creatorId, ledger);

    await this.notifyCreator(request.creatorId, 'payout_completed', {
      amount: request.netPayoutAmount,
      fee: request.transactionFee,
      currency: request.currency,
      transactionId: request.externalTransactionId
    });
  }

  // Individual payout processing for urgent requests
  private async processSinglePayout(requestId: string): Promise<void> {
    const request = this.payoutRequests.get(requestId);
    if (!request) return;

    try {
      request.status = 'processing';
      request.processedAt = new Date();
      request.updatedAt = new Date();

      // Simulate individual payout processing
      const method = this.payoutMethods.get(request.payoutMethodId);
      const processor = this.processorClients.get(method!.type);

      if (!processor) {
        throw new Error(`Processor ${method!.type} not available`);
      }

      // Mock processing time based on method type
      const processingTime = method!.type === 'crypto' ? 5000 : 15000;
      
      setTimeout(async () => {
        const success = Math.random() > 0.05; // 95% success rate
        
        if (success) {
          request.status = 'completed';
          request.completedAt = new Date();
          request.externalTransactionId = `ext_${this.generateId()}`;
          
          await this.updateLedgerForCompletedPayout(request);
        } else {
          request.status = 'failed';
          request.failureReason = 'Payment processor error';
        }

        request.updatedAt = new Date();
        this.payoutRequests.set(requestId, request);

        this.emit('payout_processed', request);
        console.log(`${success ? '✅' : '❌'} Urgent payout ${requestId} ${success ? 'completed' : 'failed'}`);
      }, processingTime);

    } catch (error) {
      request.status = 'failed';
      request.failureReason = error.message;
      request.updatedAt = new Date();

      console.error(`❌ Failed to process urgent payout ${requestId}:`, error);
    }

    this.payoutRequests.set(requestId, request);
  }

  // Helper methods
  private calculateTransactionFee(method: CreatorPayoutMethod, amount: number): number {
    return method.feeStructure.fixedFee + (amount * method.feeStructure.percentageFee / 100);
  }

  public getCreatorPayoutMethods(creatorId: string): CreatorPayoutMethod[] {
    return Array.from(this.payoutMethods.values()).filter(m => m.creatorId === creatorId);
  }

  public getCreatorLedger(creatorId: string): CreatorLedger | undefined {
    return this.creatorLedgers.get(creatorId);
  }

  public getPayoutRequests(creatorId?: string, status?: string): PayoutRequest[] {
    let requests = Array.from(this.payoutRequests.values());
    
    if (creatorId) {
      requests = requests.filter(r => r.creatorId === creatorId);
    }
    
    if (status) {
      requests = requests.filter(r => r.status === status);
    }

    return requests.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  public getPayoutBatches(status?: string): PayoutBatch[] {
    let batches = Array.from(this.payoutBatches.values());
    
    if (status) {
      batches = batches.filter(b => b.status === status);
    }

    return batches.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  private async setDefaultPayoutMethod(creatorId: string, methodId: string): Promise<void> {
    const creatorMethods = this.getCreatorPayoutMethods(creatorId);
    
    for (const method of creatorMethods) {
      method.isDefault = method.id === methodId;
      method.updatedAt = new Date();
      this.payoutMethods.set(method.id, method);
    }
  }

  private async notifyCreator(creatorId: string, type: string, data: any): Promise<void> {
    // In production, this would send email/SMS/push notifications
    console.log(`🔔 Notification for creator ${creatorId}: ${type}`, data);
    this.emit('creator_notification', { creatorId, type, data });
  }

  // Automation engine
  private startAutomationEngine(): void {
    // Run automation checks every hour
    const automationCheck = setInterval(() => {
      if (this.automationActive) {
        this.runScheduledAutomation();
      }
    }, 60 * 60 * 1000); // 1 hour

    this.scheduledTasks.set('automation_engine', automationCheck);
    console.log('🤖 Payout automation engine started');
  }

  private async runScheduledAutomation(): Promise<void> {
    console.log('🔄 Running scheduled payout automation check...');
    
    for (const [creatorId, ledger] of this.creatorLedgers.entries()) {
      if (!ledger.restrictions.payoutsDisabled) {
        await this.evaluateAutomationRules(creatorId);
      }
    }
  }

  // Health monitoring
  private startHealthMonitoring(): void {
    const healthCheck = setInterval(() => {
      this.performHealthCheck();
    }, 5 * 60 * 1000); // 5 minutes

    this.scheduledTasks.set('health_monitoring', healthCheck);
  }

  private performHealthCheck(): void {
    const stats = {
      totalCreators: this.creatorLedgers.size,
      totalPayoutMethods: this.payoutMethods.size,
      pendingRequests: this.getPayoutRequests(undefined, 'pending').length,
      processingRequests: this.getPayoutRequests(undefined, 'processing').length,
      queueLength: this.batchProcessingQueue.length,
      activeProcessors: Array.from(this.processorClients.values()).filter(p => p.connected).length,
      automationRulesActive: Array.from(this.automationRules.values()).filter(r => r.enabled).length
    };

    this.emit('health_check', stats);
    
    if (stats.queueLength > 1000) {
      console.warn('⚠️ Payout queue is growing large:', stats.queueLength);
      this.emit('queue_warning', stats);
    }
  }

  // Public API methods
  public getSystemStats(): any {
    const totalBalance = Array.from(this.creatorLedgers.values())
      .reduce((sum, ledger) => sum + ledger.availableBalance, 0);

    const totalPaidOut = Array.from(this.creatorLedgers.values())
      .reduce((sum, ledger) => sum + ledger.paidOut, 0);

    return {
      creators: {
        total: this.creatorLedgers.size,
        withBalance: Array.from(this.creatorLedgers.values()).filter(l => l.availableBalance > 0).length,
        pendingPayouts: Array.from(this.creatorLedgers.values()).filter(l => l.pendingBalance > 0).length
      },
      financials: {
        totalAvailableBalance: totalBalance,
        totalPaidOut,
        pendingPayouts: this.getPayoutRequests(undefined, 'pending').length,
        processingPayouts: this.getPayoutRequests(undefined, 'processing').length
      },
      automation: {
        rulesActive: Array.from(this.automationRules.values()).filter(r => r.enabled).length,
        queueLength: this.batchProcessingQueue.length,
        processingBatches: this.getPayoutBatches('processing').length
      },
      processors: {
        available: Array.from(this.processorClients.keys()),
        connected: Array.from(this.processorClients.values()).filter(p => p.connected).length
      }
    };
  }

  public stopAutomation(): void {
    this.automationActive = false;
    this.scheduledTasks.forEach(task => clearInterval(task));
    this.scheduledTasks.clear();
    console.log('⏹️ Payout automation stopped');
  }

  private generateId(): string {
    return crypto.randomBytes(16).toString('hex');
  }
}

// Create singleton instance
export const payoutAutomationSystem = new PayoutAutomationSystem();

// Export types
export type {
  CreatorPayoutMethod,
  CreatorRevenue,
  PayoutRequest,
  PayoutBatch,
  CreatorLedger,
  PayoutAutomationRule
};