/**
 * Escrow Service for FANZ Ecosystem
 * Handles secure escrow transactions for creator payouts and platform payments
 */

import { EventEmitter } from 'events';
import { randomUUID } from 'crypto';

export interface EscrowAccount {
  id: string;
  userId: string;
  type: 'creator' | 'fan' | 'platform';
  balance: number;
  heldBalance: number;
  availableBalance: number;
  pendingReleases: number;
  currency: string;
  status: 'active' | 'frozen' | 'closed';
  created: Date;
  lastActivity: Date;
}

export interface EscrowTransaction {
  id: string;
  escrowId: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  currency: string;
  type: 'hold' | 'release' | 'refund' | 'dispute';
  status: 'pending' | 'held' | 'released' | 'refunded' | 'disputed' | 'cancelled';
  reason: string;
  metadata: {
    contentId?: string;
    subscriptionId?: string;
    orderId?: string;
    paymentId?: string;
  };
  holdPeriod: number; // Days to hold before auto-release
  autoRelease: boolean;
  releaseDate?: Date;
  releasedAt?: Date;
  created: Date;
  updated: Date;
}

export interface EscrowDispute {
  id: string;
  escrowTransactionId: string;
  initiatedBy: string;
  reason: string;
  status: 'open' | 'investigating' | 'resolved' | 'escalated';
  resolution?: 'refund' | 'release' | 'partial_refund';
  resolutionAmount?: number;
  evidence: Array<{
    type: 'text' | 'image' | 'document';
    content: string;
    uploadedBy: string;
    uploadedAt: Date;
  }>;
  created: Date;
  resolved?: Date;
}

export interface EscrowRelease {
  id: string;
  escrowTransactionId: string;
  amount: number;
  releaseType: 'automatic' | 'manual' | 'dispute_resolution';
  releasedBy?: string;
  releasedAt: Date;
  payoutMethod: string;
  payoutId?: string;
}

export class EscrowService extends EventEmitter {
  private escrowAccounts = new Map<string, EscrowAccount>();
  private escrowTransactions = new Map<string, EscrowTransaction>();
  private escrowDisputes = new Map<string, EscrowDispute>();
  private escrowReleases = new Map<string, EscrowRelease>();

  // Default hold periods by transaction type
  private defaultHoldPeriods = {
    subscription: 7, // 7 days for subscriptions
    content_purchase: 3, // 3 days for content purchases
    tip: 1, // 1 day for tips
    commission: 14, // 14 days for commissions
    default: 7
  };

  constructor() {
    super();
    this.startAutoReleaseWorker();
  }

  /**
   * Create or get escrow account for user
   */
  async getOrCreateEscrowAccount(userId: string, type: 'creator' | 'fan' | 'platform'): Promise<EscrowAccount> {
    // Check existing account
    const existing = Array.from(this.escrowAccounts.values())
      .find(account => account.userId === userId && account.type === type);

    if (existing) {
      return existing;
    }

    // Create new escrow account
    const account: EscrowAccount = {
      id: randomUUID(),
      userId,
      type,
      balance: 0,
      heldBalance: 0,
      availableBalance: 0,
      pendingReleases: 0,
      currency: 'USD',
      status: 'active',
      created: new Date(),
      lastActivity: new Date()
    };

    this.escrowAccounts.set(account.id, account);
    this.emit('escrow_account_created', account);

    return account;
  }

  /**
   * Hold funds in escrow
   */
  async holdFunds(params: {
    fromUserId: string;
    toUserId: string;
    amount: number;
    currency: string;
    reason: string;
    holdDays?: number;
    autoRelease?: boolean;
    metadata?: any;
  }): Promise<EscrowTransaction> {
    // Get or create escrow accounts
    const fromAccount = await this.getOrCreateEscrowAccount(params.fromUserId, 'fan');
    const toAccount = await this.getOrCreateEscrowAccount(params.toUserId, 'creator');

    // Create escrow transaction
    const transaction: EscrowTransaction = {
      id: randomUUID(),
      escrowId: toAccount.id,
      fromUserId: params.fromUserId,
      toUserId: params.toUserId,
      amount: params.amount,
      currency: params.currency,
      type: 'hold',
      status: 'held',
      reason: params.reason,
      metadata: params.metadata || {},
      holdPeriod: params.holdDays || this.defaultHoldPeriods.default,
      autoRelease: params.autoRelease !== false,
      releaseDate: new Date(Date.now() + (params.holdDays || this.defaultHoldPeriods.default) * 24 * 60 * 60 * 1000),
      created: new Date(),
      updated: new Date()
    };

    // Update escrow account balances
    toAccount.heldBalance += params.amount;
    toAccount.balance += params.amount;
    toAccount.pendingReleases += 1;
    toAccount.lastActivity = new Date();

    this.escrowTransactions.set(transaction.id, transaction);
    this.emit('funds_held', transaction);

    console.log(`💰 Escrow: Held $${params.amount} from ${params.fromUserId} for ${params.toUserId}`);

    return transaction;
  }

  /**
   * Release funds from escrow
   */
  async releaseFunds(transactionId: string, releaseType: 'automatic' | 'manual' | 'dispute_resolution', releasedBy?: string): Promise<EscrowRelease> {
    const transaction = this.escrowTransactions.get(transactionId);

    if (!transaction) {
      throw new Error('Escrow transaction not found');
    }

    if (transaction.status !== 'held') {
      throw new Error(`Cannot release funds - transaction status is ${transaction.status}`);
    }

    // Get escrow account
    const account = this.escrowAccounts.get(transaction.escrowId);
    if (!account) {
      throw new Error('Escrow account not found');
    }

    // Create release record
    const release: EscrowRelease = {
      id: randomUUID(),
      escrowTransactionId: transactionId,
      amount: transaction.amount,
      releaseType,
      releasedBy,
      releasedAt: new Date(),
      payoutMethod: 'internal_transfer'
    };

    // Update transaction status
    transaction.status = 'released';
    transaction.releasedAt = new Date();
    transaction.updated = new Date();

    // Update account balances
    account.heldBalance -= transaction.amount;
    account.availableBalance += transaction.amount;
    account.pendingReleases -= 1;
    account.lastActivity = new Date();

    this.escrowReleases.set(release.id, release);
    this.emit('funds_released', { transaction, release });

    console.log(`✅ Escrow: Released $${transaction.amount} to ${transaction.toUserId}`);

    return release;
  }

  /**
   * Refund escrowed funds
   */
  async refundFunds(transactionId: string, reason: string, refundedBy?: string): Promise<EscrowRelease> {
    const transaction = this.escrowTransactions.get(transactionId);

    if (!transaction) {
      throw new Error('Escrow transaction not found');
    }

    if (transaction.status !== 'held') {
      throw new Error(`Cannot refund funds - transaction status is ${transaction.status}`);
    }

    // Get escrow account
    const account = this.escrowAccounts.get(transaction.escrowId);
    if (!account) {
      throw new Error('Escrow account not found');
    }

    // Create release record
    const release: EscrowRelease = {
      id: randomUUID(),
      escrowTransactionId: transactionId,
      amount: transaction.amount,
      releaseType: 'manual',
      releasedBy: refundedBy,
      releasedAt: new Date(),
      payoutMethod: 'refund'
    };

    // Update transaction status
    transaction.status = 'refunded';
    transaction.updated = new Date();

    // Update account balances
    account.heldBalance -= transaction.amount;
    account.balance -= transaction.amount;
    account.pendingReleases -= 1;
    account.lastActivity = new Date();

    this.escrowReleases.set(release.id, release);
    this.emit('funds_refunded', { transaction, release, reason });

    console.log(`🔄 Escrow: Refunded $${transaction.amount} to ${transaction.fromUserId}`);

    return release;
  }

  /**
   * Create dispute for escrow transaction
   */
  async createDispute(params: {
    transactionId: string;
    initiatedBy: string;
    reason: string;
    evidence?: Array<{ type: 'text' | 'image' | 'document'; content: string }>;
  }): Promise<EscrowDispute> {
    const transaction = this.escrowTransactions.get(params.transactionId);

    if (!transaction) {
      throw new Error('Escrow transaction not found');
    }

    if (transaction.status !== 'held') {
      throw new Error('Can only dispute held transactions');
    }

    const dispute: EscrowDispute = {
      id: randomUUID(),
      escrowTransactionId: params.transactionId,
      initiatedBy: params.initiatedBy,
      reason: params.reason,
      status: 'open',
      evidence: (params.evidence || []).map(e => ({
        ...e,
        uploadedBy: params.initiatedBy,
        uploadedAt: new Date()
      })),
      created: new Date()
    };

    // Update transaction status
    transaction.status = 'disputed';
    transaction.updated = new Date();

    this.escrowDisputes.set(dispute.id, dispute);
    this.emit('dispute_created', dispute);

    console.log(`⚠️  Escrow: Dispute created for transaction ${params.transactionId}`);

    return dispute;
  }

  /**
   * Resolve dispute
   */
  async resolveDispute(disputeId: string, resolution: 'refund' | 'release' | 'partial_refund', resolutionAmount?: number): Promise<EscrowDispute> {
    const dispute = this.escrowDisputes.get(disputeId);

    if (!dispute) {
      throw new Error('Dispute not found');
    }

    if (dispute.status === 'resolved') {
      throw new Error('Dispute already resolved');
    }

    const transaction = this.escrowTransactions.get(dispute.escrowTransactionId);

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    // Update dispute
    dispute.status = 'resolved';
    dispute.resolution = resolution;
    dispute.resolutionAmount = resolutionAmount;
    dispute.resolved = new Date();

    // Execute resolution
    if (resolution === 'refund') {
      await this.refundFunds(transaction.id, 'Dispute resolved - refund', 'system');
    } else if (resolution === 'release') {
      await this.releaseFunds(transaction.id, 'dispute_resolution', 'system');
    } else if (resolution === 'partial_refund' && resolutionAmount) {
      // Handle partial refund
      // TODO: Implement partial refund logic
    }

    this.emit('dispute_resolved', dispute);

    console.log(`✅ Escrow: Dispute ${disputeId} resolved with ${resolution}`);

    return dispute;
  }

  /**
   * Get escrow account balance
   */
  async getAccountBalance(userId: string): Promise<{
    total: number;
    available: number;
    held: number;
    pendingReleases: number;
  }> {
    const account = Array.from(this.escrowAccounts.values())
      .find(acc => acc.userId === userId);

    if (!account) {
      return { total: 0, available: 0, held: 0, pendingReleases: 0 };
    }

    return {
      total: account.balance,
      available: account.availableBalance,
      held: account.heldBalance,
      pendingReleases: account.pendingReleases
    };
  }

  /**
   * Get pending escrow transactions for user
   */
  getPendingTransactions(userId: string): EscrowTransaction[] {
    return Array.from(this.escrowTransactions.values())
      .filter(tx => (tx.toUserId === userId || tx.fromUserId === userId) && tx.status === 'held')
      .sort((a, b) => b.created.getTime() - a.created.getTime());
  }

  /**
   * Get escrow transaction history
   */
  getTransactionHistory(userId: string, limit: number = 50): EscrowTransaction[] {
    return Array.from(this.escrowTransactions.values())
      .filter(tx => tx.toUserId === userId || tx.fromUserId === userId)
      .sort((a, b) => b.created.getTime() - a.created.getTime())
      .slice(0, limit);
  }

  /**
   * Auto-release worker - releases funds after hold period expires
   */
  private startAutoReleaseWorker(): void {
    setInterval(async () => {
      const now = new Date();

      for (const [id, transaction] of this.escrowTransactions) {
        if (
          transaction.status === 'held' &&
          transaction.autoRelease &&
          transaction.releaseDate &&
          transaction.releaseDate <= now
        ) {
          try {
            await this.releaseFunds(id, 'automatic');
            console.log(`🤖 Auto-released escrow transaction ${id}`);
          } catch (error) {
            console.error(`Failed to auto-release transaction ${id}:`, error);
          }
        }
      }
    }, 60000); // Check every minute
  }

  /**
   * Get escrow statistics
   */
  getEscrowStats(): {
    totalAccounts: number;
    totalHeld: number;
    totalAvailable: number;
    pendingReleases: number;
    activeDisputes: number;
  } {
    const accounts = Array.from(this.escrowAccounts.values());
    const disputes = Array.from(this.escrowDisputes.values()).filter(d => d.status !== 'resolved');

    return {
      totalAccounts: accounts.length,
      totalHeld: accounts.reduce((sum, acc) => sum + acc.heldBalance, 0),
      totalAvailable: accounts.reduce((sum, acc) => sum + acc.availableBalance, 0),
      pendingReleases: accounts.reduce((sum, acc) => sum + acc.pendingReleases, 0),
      activeDisputes: disputes.length
    };
  }
}

// Export singleton instance
export const escrowService = new EscrowService();
