/**
 * Custom Content Request Service with Escrow
 * Allows fans to request custom content from creators with secure payment holding
 */

import { EventEmitter } from 'events';
import { randomUUID } from 'crypto';
import { escrowService } from '../payments/EscrowService';

export interface CustomContentRequest {
  id: string;
  requestNumber: string; // Human-readable request number
  platformId: string; // Which platform (boyfanz, girlfanz, etc)

  // Parties
  fanUserId: string;
  creatorUserId: string;

  // Content Details
  contentType: 'photo' | 'video' | 'audio' | 'text' | 'photoset' | 'custom';
  contentTypeDetails: string;
  description: string; // Detailed explanation of what they want
  specialRequirements: string[];

  // Timeline
  dueDate: Date;
  estimatedDeliveryDays: number;
  requestedDate: Date;

  // Financial
  proposedAmount: number;
  currency: string;
  negotiatedAmount?: number;
  finalAmount?: number;
  paymentMethodId: string;

  // Status & Workflow
  status: 'pending_creator_review' | 'negotiating' | 'accepted' | 'payment_processing' |
          'in_escrow' | 'in_production' | 'awaiting_review' | 'disputed' |
          'completed' | 'cancelled' | 'expired';

  // Negotiation
  negotiationHistory: Array<{
    id: string;
    from: 'fan' | 'creator';
    amount: number;
    message: string;
    timestamp: Date;
    status: 'pending' | 'accepted' | 'countered' | 'rejected';
  }>;
  currentOffer?: {
    from: 'fan' | 'creator';
    amount: number;
    message: string;
    expiresAt: Date;
  };

  // Escrow
  escrowTransactionId?: string;
  fundsHeldAt?: Date;

  // Content Delivery
  deliveredContentId?: string;
  deliveredAt?: Date;
  deliveryNotes?: string;

  // Fan Approval
  fanReviewStatus?: 'pending' | 'approved' | 'revision_requested' | 'disputed';
  fanReviewNotes?: string;
  fanReviewedAt?: Date;
  revisionRequests?: Array<{
    id: string;
    requestedAt: Date;
    details: string;
    status: 'pending' | 'in_progress' | 'completed';
  }>;

  // Agreements
  noChargebackAgreementSigned: boolean;
  noChargebackSignedAt?: Date;
  termsAccepted: boolean;
  termsAcceptedAt?: Date;

  // Timestamps
  created: Date;
  updated: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  expiresAt?: Date;

  // Metadata
  metadata: {
    fanName: string;
    creatorName: string;
    platformName: string;
    originalRequestText: string;
    communicationLog: Array<{
      from: string;
      message: string;
      timestamp: Date;
    }>;
  };
}

export class CustomContentRequestService extends EventEmitter {
  private requests = new Map<string, CustomContentRequest>();
  private requestCounter = 1000; // Start at 1000 for nice request numbers

  /**
   * Create new custom content request from fan
   */
  async createRequest(params: {
    platformId: string;
    fanUserId: string;
    creatorUserId: string;
    contentType: string;
    contentTypeDetails: string;
    description: string;
    specialRequirements: string[];
    dueDate: Date;
    proposedAmount: number;
    currency: string;
    paymentMethodId: string;
    fanName: string;
    creatorName: string;
  }): Promise<CustomContentRequest> {
    const requestId = randomUUID();
    const requestNumber = `CCR-${++this.requestCounter}`;

    const request: CustomContentRequest = {
      id: requestId,
      requestNumber,
      platformId: params.platformId,

      fanUserId: params.fanUserId,
      creatorUserId: params.creatorUserId,

      contentType: params.contentType as any,
      contentTypeDetails: params.contentTypeDetails,
      description: params.description,
      specialRequirements: params.specialRequirements,

      dueDate: params.dueDate,
      estimatedDeliveryDays: Math.ceil((params.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      requestedDate: new Date(),

      proposedAmount: params.proposedAmount,
      currency: params.currency,
      paymentMethodId: params.paymentMethodId,

      status: 'pending_creator_review',

      negotiationHistory: [{
        id: randomUUID(),
        from: 'fan',
        amount: params.proposedAmount,
        message: 'Initial request',
        timestamp: new Date(),
        status: 'pending'
      }],

      currentOffer: {
        from: 'fan',
        amount: params.proposedAmount,
        message: params.description,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      },

      noChargebackAgreementSigned: false,
      termsAccepted: false,

      created: new Date(),
      updated: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days

      metadata: {
        fanName: params.fanName,
        creatorName: params.creatorName,
        platformName: params.platformId,
        originalRequestText: params.description,
        communicationLog: [{
          from: params.fanUserId,
          message: `Created custom content request: ${params.contentTypeDetails}`,
          timestamp: new Date()
        }]
      }
    };

    this.requests.set(requestId, request);
    this.emit('request_created', request);

    console.log(`📝 Custom Content Request ${requestNumber} created by ${params.fanName} for ${params.creatorName}`);

    return request;
  }

  /**
   * Creator accepts or counters the request
   */
  async creatorRespond(requestId: string, action: 'accept' | 'counter' | 'reject', params?: {
    counterAmount?: number;
    message?: string;
  }): Promise<CustomContentRequest> {
    const request = this.requests.get(requestId);

    if (!request) {
      throw new Error('Request not found');
    }

    if (request.status !== 'pending_creator_review' && request.status !== 'negotiating') {
      throw new Error(`Cannot respond to request in status: ${request.status}`);
    }

    const response = {
      id: randomUUID(),
      from: 'creator' as const,
      amount: action === 'counter' ? (params?.counterAmount || request.proposedAmount) : request.currentOffer!.amount,
      message: params?.message || '',
      timestamp: new Date(),
      status: action === 'accept' ? 'accepted' as const : action === 'counter' ? 'countered' as const : 'rejected' as const
    };

    request.negotiationHistory.push(response);

    if (action === 'accept') {
      // Creator accepts - move to payment processing
      request.status = 'accepted';
      request.finalAmount = request.currentOffer!.amount;
      request.negotiatedAmount = request.finalAmount;
      request.updated = new Date();

      this.emit('request_accepted', request);
      console.log(`✅ Creator accepted request ${request.requestNumber} for $${request.finalAmount}`);

    } else if (action === 'counter') {
      // Creator counters with new amount
      request.status = 'negotiating';
      request.currentOffer = {
        from: 'creator',
        amount: params!.counterAmount!,
        message: params!.message || 'Counter offer',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      };
      request.updated = new Date();

      this.emit('request_countered', request);
      console.log(`💬 Creator countered request ${request.requestNumber} with $${params!.counterAmount}`);

    } else if (action === 'reject') {
      // Creator rejects request
      request.status = 'cancelled';
      request.cancelledAt = new Date();
      request.updated = new Date();

      this.emit('request_rejected', request);
      console.log(`❌ Creator rejected request ${request.requestNumber}`);
    }

    request.metadata.communicationLog.push({
      from: request.creatorUserId,
      message: `Creator ${action}ed: ${params?.message || ''}`,
      timestamp: new Date()
    });

    return request;
  }

  /**
   * Fan responds to counter offer
   */
  async fanRespond(requestId: string, action: 'accept' | 'counter' | 'reject', params?: {
    counterAmount?: number;
    message?: string;
  }): Promise<CustomContentRequest> {
    const request = this.requests.get(requestId);

    if (!request) {
      throw new Error('Request not found');
    }

    if (request.status !== 'negotiating') {
      throw new Error(`Cannot respond to request in status: ${request.status}`);
    }

    const response = {
      id: randomUUID(),
      from: 'fan' as const,
      amount: action === 'counter' ? (params?.counterAmount || request.currentOffer!.amount) : request.currentOffer!.amount,
      message: params?.message || '',
      timestamp: new Date(),
      status: action === 'accept' ? 'accepted' as const : action === 'counter' ? 'countered' as const : 'rejected' as const
    };

    request.negotiationHistory.push(response);

    if (action === 'accept') {
      // Fan accepts counter offer
      request.status = 'accepted';
      request.finalAmount = request.currentOffer!.amount;
      request.negotiatedAmount = request.finalAmount;
      request.updated = new Date();

      this.emit('negotiation_completed', request);
      console.log(`✅ Fan accepted counter offer for request ${request.requestNumber} at $${request.finalAmount}`);

    } else if (action === 'counter') {
      // Fan counters with new amount
      request.currentOffer = {
        from: 'fan',
        amount: params!.counterAmount!,
        message: params!.message || 'Counter offer',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      };
      request.updated = new Date();

      this.emit('negotiation_continued', request);
      console.log(`💬 Fan countered request ${request.requestNumber} with $${params!.counterAmount}`);

    } else if (action === 'reject') {
      // Fan rejects counter offer
      request.status = 'cancelled';
      request.cancelledAt = new Date();
      request.updated = new Date();

      this.emit('negotiation_failed', request);
      console.log(`❌ Fan rejected counter offer for request ${request.requestNumber}`);
    }

    request.metadata.communicationLog.push({
      from: request.fanUserId,
      message: `Fan ${action}ed: ${params?.message || ''}`,
      timestamp: new Date()
    });

    return request;
  }

  /**
   * Process payment and place in escrow
   */
  async processPaymentToEscrow(requestId: string): Promise<CustomContentRequest> {
    const request = this.requests.get(requestId);

    if (!request) {
      throw new Error('Request not found');
    }

    if (request.status !== 'accepted') {
      throw new Error('Request must be accepted before payment');
    }

    if (!request.termsAccepted || !request.noChargebackAgreementSigned) {
      throw new Error('Terms and no-chargeback agreement must be signed');
    }

    // Process payment through payment processor
    // (This would integrate with actual payment processing)
    request.status = 'payment_processing';
    request.updated = new Date();

    // Hold funds in escrow
    const escrowTransaction = await escrowService.holdFunds({
      fromUserId: request.fanUserId,
      toUserId: request.creatorUserId,
      amount: request.finalAmount!,
      currency: request.currency,
      reason: `Custom content request: ${request.requestNumber}`,
      holdDays: 30, // Hold for 30 days max
      autoRelease: false, // Must be manually released after fan approval
      metadata: {
        requestId: request.id,
        requestNumber: request.requestNumber,
        contentType: request.contentType,
        platformId: request.platformId
      }
    });

    request.escrowTransactionId = escrowTransaction.id;
    request.fundsHeldAt = new Date();
    request.status = 'in_escrow';
    request.updated = new Date();

    this.emit('payment_escrowed', request);

    console.log(`💰 Payment of $${request.finalAmount} held in escrow for request ${request.requestNumber}`);

    // Notify creator to start production
    request.status = 'in_production';
    request.updated = new Date();

    return request;
  }

  /**
   * Creator delivers content
   */
  async deliverContent(requestId: string, params: {
    contentId: string;
    deliveryNotes?: string;
  }): Promise<CustomContentRequest> {
    const request = this.requests.get(requestId);

    if (!request) {
      throw new Error('Request not found');
    }

    if (request.status !== 'in_production') {
      throw new Error('Request must be in production to deliver');
    }

    request.deliveredContentId = params.contentId;
    request.deliveredAt = new Date();
    request.deliveryNotes = params.deliveryNotes;
    request.status = 'awaiting_review';
    request.fanReviewStatus = 'pending';
    request.updated = new Date();

    this.emit('content_delivered', request);

    console.log(`📦 Content delivered for request ${request.requestNumber}`);

    return request;
  }

  /**
   * Fan reviews and accepts/requests revision
   */
  async fanReview(requestId: string, action: 'approve' | 'request_revision' | 'dispute', params?: {
    notes?: string;
    revisionDetails?: string;
  }): Promise<CustomContentRequest> {
    const request = this.requests.get(requestId);

    if (!request) {
      throw new Error('Request not found');
    }

    if (request.status !== 'awaiting_review') {
      throw new Error('Request must be awaiting review');
    }

    request.fanReviewNotes = params?.notes;
    request.fanReviewedAt = new Date();
    request.updated = new Date();

    if (action === 'approve') {
      // Fan approves - release escrow
      request.fanReviewStatus = 'approved';
      request.status = 'completed';
      request.completedAt = new Date();

      // Release escrow funds to creator
      if (request.escrowTransactionId) {
        await escrowService.releaseFunds(request.escrowTransactionId, 'manual', request.fanUserId);
      }

      this.emit('content_approved', request);
      console.log(`✅ Fan approved content for request ${request.requestNumber} - escrow released`);

    } else if (action === 'request_revision') {
      // Fan requests revision
      request.fanReviewStatus = 'revision_requested';
      request.status = 'in_production';

      request.revisionRequests = request.revisionRequests || [];
      request.revisionRequests.push({
        id: randomUUID(),
        requestedAt: new Date(),
        details: params?.revisionDetails || '',
        status: 'pending'
      });

      this.emit('revision_requested', request);
      console.log(`🔄 Fan requested revision for request ${request.requestNumber}`);

    } else if (action === 'dispute') {
      // Fan disputes content
      request.fanReviewStatus = 'disputed';
      request.status = 'disputed';

      // Create escrow dispute
      if (request.escrowTransactionId) {
        await escrowService.createDispute({
          transactionId: request.escrowTransactionId,
          initiatedBy: request.fanUserId,
          reason: params?.notes || 'Content did not meet requirements'
        });
      }

      this.emit('content_disputed', request);
      console.log(`⚠️  Fan disputed content for request ${request.requestNumber}`);
    }

    request.metadata.communicationLog.push({
      from: request.fanUserId,
      message: `Fan ${action}: ${params?.notes || ''}`,
      timestamp: new Date()
    });

    return request;
  }

  /**
   * Sign no-chargeback agreement
   */
  async signNoChargebackAgreement(requestId: string, userId: string): Promise<CustomContentRequest> {
    const request = this.requests.get(requestId);

    if (!request) {
      throw new Error('Request not found');
    }

    if (userId !== request.fanUserId) {
      throw new Error('Only the fan can sign the no-chargeback agreement');
    }

    request.noChargebackAgreementSigned = true;
    request.noChargebackSignedAt = new Date();
    request.updated = new Date();

    console.log(`📝 No-chargeback agreement signed for request ${request.requestNumber}`);

    return request;
  }

  /**
   * Accept terms
   */
  async acceptTerms(requestId: string, userId: string): Promise<CustomContentRequest> {
    const request = this.requests.get(requestId);

    if (!request) {
      throw new Error('Request not found');
    }

    request.termsAccepted = true;
    request.termsAcceptedAt = new Date();
    request.updated = new Date();

    console.log(`📜 Terms accepted for request ${request.requestNumber}`);

    return request;
  }

  /**
   * Get request by ID
   */
  getRequest(requestId: string): CustomContentRequest | undefined {
    return this.requests.get(requestId);
  }

  /**
   * Get requests for user (fan or creator)
   */
  getUserRequests(userId: string, role: 'fan' | 'creator'): CustomContentRequest[] {
    return Array.from(this.requests.values())
      .filter(r => role === 'fan' ? r.fanUserId === userId : r.creatorUserId === userId)
      .sort((a, b) => b.created.getTime() - a.created.getTime());
  }

  /**
   * Get requests by platform
   */
  getPlatformRequests(platformId: string): CustomContentRequest[] {
    return Array.from(this.requests.values())
      .filter(r => r.platformId === platformId)
      .sort((a, b) => b.created.getTime() - a.created.getTime());
  }

  /**
   * Get requests by status
   */
  getRequestsByStatus(status: CustomContentRequest['status']): CustomContentRequest[] {
    return Array.from(this.requests.values())
      .filter(r => r.status === status)
      .sort((a, b) => b.created.getTime() - a.created.getTime());
  }
}

// Export singleton instance
export const customContentRequestService = new CustomContentRequestService();
