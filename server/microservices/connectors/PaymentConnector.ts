/**
 * FANZ Unified Ecosystem - Payment & Finance Connector
 * Connector for all 8 payment and finance services
 */

import { MicroserviceConnector, MicroserviceResponse } from '../MicroserviceConnector';

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  type: 'subscription' | 'tip' | 'purchase' | 'payout';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  createdAt: Date;
}

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  availableBalance: number;
  pendingBalance: number;
}

export class PaymentConnector extends MicroserviceConnector {
  /**
   * Process payment
   */
  async processPayment(data: {
    userId: string;
    amount: number;
    currency: string;
    paymentMethod: string;
    description?: string;
  }): Promise<MicroserviceResponse<Transaction>> {
    return this.post(`/process`, data);
  }

  /**
   * Get wallet balance
   */
  async getWallet(userId: string): Promise<MicroserviceResponse<Wallet>> {
    return this.get(`/wallet/${userId}`);
  }

  /**
   * Get transactions
   */
  async getTransactions(userId: string, params?: {
    type?: string;
    status?: string;
    limit?: number;
  }): Promise<MicroserviceResponse<Transaction[]>> {
    return this.get(`/transactions/${userId}`, { params });
  }

  /**
   * Create payout request
   */
  async requestPayout(data: {
    userId: string;
    amount: number;
    payoutMethod: string;
    destination: string;
  }): Promise<MicroserviceResponse<Transaction>> {
    return this.post(`/payout/request`, data);
  }

  /**
   * Get subscription status
   */
  async getSubscriptionStatus(userId: string, creatorId: string): Promise<MicroserviceResponse<{
    active: boolean;
    tier: string;
    expiresAt: Date;
    autoRenew: boolean;
  }>> {
    return this.get(`/subscription/${userId}/${creatorId}`);
  }

  /**
   * Process tip
   */
  async processTip(data: {
    fromUserId: string;
    toUserId: string;
    amount: number;
    message?: string;
  }): Promise<MicroserviceResponse<Transaction>> {
    return this.post(`/tip`, data);
  }
}

// Factory for all payment services
export class PaymentFactory {
  private static connectors: Map<string, PaymentConnector> = new Map();

  static getConnector(serviceName: string): PaymentConnector {
    const serviceId = `payment-${serviceName.toLowerCase()}`;

    if (!this.connectors.has(serviceId)) {
      this.connectors.set(serviceId, new PaymentConnector(serviceId));
    }

    return this.connectors.get(serviceId)!;
  }

  static getServices() {
    return [
      'fanzpay', 'fanzwallet', 'fanzbank', 'fanzcrypto',
      'fanztax', 'fanzinvoice', 'fanztip', 'fanzsub'
    ];
  }
}
