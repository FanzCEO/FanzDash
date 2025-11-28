import { EventEmitter } from 'events';
import { randomUUID } from 'crypto';

/**
 * ADA Accommodation Manager
 *
 * Manages the complete accommodation request lifecycle in compliance with:
 * - Americans with Disabilities Act (ADA)
 * - ADA Amendments Act (ADAAA)
 * - EEOC Enforcement Guidance on Reasonable Accommodation
 * - State disability laws
 */

export interface AccommodationRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  requestDate: Date;

  // Disability Information
  disabilityType?: 'physical' | 'mental' | 'sensory' | 'cognitive' | 'chronic_condition' | 'temporary' | 'other';
  disabilityDescription?: string; // Optional - employee may not need to disclose
  functionalLimitations: string[]; // What the employee cannot do

  // Requested Accommodation
  requestedAccommodation: string;
  requestedAccommodationType: AccommodationType[];
  specificNeeds: string;

  // Medical Documentation
  medicalDocumentationRequired: boolean;
  medicalDocumentationReceived: boolean;
  medicalDocumentationIds?: string[]; // DocumentVault IDs
  medicalVerificationDate?: Date;

  // Interactive Process
  interactiveProcessStarted: Date;
  interactiveProcessMeetings: InteractiveProcessMeeting[];
  alternativeAccommodationsConsidered: AlternativeAccommodation[];

  // Decision
  status: 'pending' | 'under_review' | 'interactive_process' | 'approved' | 'denied' | 'withdrawn' | 'implemented';
  decision?: AccommodationDecision;
  decisionDate?: Date;
  decisionMaker?: string;

  // Implementation
  implementationPlan?: ImplementationPlan;
  implementationDate?: Date;
  effectivenessReviews: EffectivenessReview[];

  // Appeal
  appealDate?: Date;
  appealReason?: string;
  appealDecision?: string;
  appealDecisionDate?: Date;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  assignedTo?: string; // HR representative
  confidentialNotes: string[]; // HIPAA-protected notes
}

export type AccommodationType =
  | 'job_restructuring'
  | 'modified_schedule'
  | 'telework'
  | 'reassignment'
  | 'assistive_technology'
  | 'workplace_modification'
  | 'policy_modification'
  | 'leave_of_absence'
  | 'interpreter_services'
  | 'modified_equipment'
  | 'accessible_parking'
  | 'service_animal'
  | 'personal_attendant'
  | 'modified_training'
  | 'other';

export interface InteractiveProcessMeeting {
  id: string;
  date: Date;
  attendees: string[];
  discussionTopics: string[];
  accommodationsDiscussed: string[];
  employeeFeedback: string;
  nextSteps: string[];
  documentIds?: string[]; // Meeting notes in DocumentVault
}

export interface AlternativeAccommodation {
  description: string;
  effectiveness: 'high' | 'medium' | 'low';
  cost: number;
  implementationTime: string;
  reasonNotSelected?: string;
  discussedWithEmployee: boolean;
  employeeFeedback?: string;
}

export interface AccommodationDecision {
  decision: 'approved' | 'denied' | 'alternative_offered';
  approvedAccommodation?: string;
  alternativeAccommodation?: string;
  denialReason?: DenialReason;
  denialJustification?: string;
  legalReview: boolean;
  legalReviewNotes?: string;
  reasonableAccommodationAnalysis: ReasonableAccommodationAnalysis;
}

export interface DenialReason {
  reason: 'undue_hardship' | 'direct_threat' | 'not_qualified' | 'not_reasonable' | 'other';
  undueHardenshipAnalysis?: UndueHardshipAnalysis;
  directThreatAssessment?: DirectThreatAssessment;
}

export interface UndueHardshipAnalysis {
  financialCost: number;
  percentOfBudget: number;
  impactOnOperations: string;
  impactOnOtherEmployees: string;
  alternativesConsidered: string[];
  externalFundingExplored: boolean; // Tax credits, grants available
  conclusion: string;
}

export interface DirectThreatAssessment {
  riskDescription: string;
  likelihood: 'high' | 'medium' | 'low';
  severity: 'high' | 'medium' | 'low';
  duration: string;
  imminence: string;
  mitigationMeasures: string[];
  canBeEliminated: boolean;
  objectiveEvidence: string;
  medicalDocumentation: boolean;
}

export interface ReasonableAccommodationAnalysis {
  isQualifiedIndividual: boolean;
  isDisabilityRelated: boolean;
  willEnablePerformance: boolean;
  isEffective: boolean;
  isReasonable: boolean;
  causeUndueHardship: boolean;
  analysisNotes: string;
}

export interface ImplementationPlan {
  accommodationDetails: string;
  responsibleParty: string;
  targetDate: Date;
  budget: number;
  vendor?: string;
  installationRequired: boolean;
  trainingRequired: boolean;
  milestones: Milestone[];
  completionDate?: Date;
}

export interface Milestone {
  description: string;
  dueDate: Date;
  completed: boolean;
  completionDate?: Date;
  notes?: string;
}

export interface EffectivenessReview {
  id: string;
  reviewDate: Date;
  reviewedBy: string;
  employeeSatisfaction: number; // 1-5 scale
  employeeFeedback: string;
  isEffective: boolean;
  issuesIdentified: string[];
  modificationsNeeded: boolean;
  proposedModifications?: string;
  followUpDate?: Date;
}

export interface AccommodationStatistics {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  deniedRequests: number;
  averageProcessingTime: number; // days
  byType: Map<AccommodationType, number>;
  byStatus: Map<string, number>;
  costAnalysis: {
    totalCost: number;
    averageCost: number;
    medianCost: number;
    costByType: Map<AccommodationType, number>;
  };
  effectivenessMetrics: {
    averageSatisfaction: number;
    successRate: number; // % effective accommodations
    modificationRate: number; // % requiring modifications
  };
}

export class ADAAccommodationManager extends EventEmitter {
  private requests: Map<string, AccommodationRequest> = new Map();

  constructor() {
    super();
    this.initializeSystem();
  }

  private initializeSystem(): void {
    console.log('🦽 ADA Accommodation Manager initialized');

    // Set up automated reminders for deadlines
    setInterval(() => this.checkDeadlines(), 24 * 60 * 60 * 1000); // Daily check
  }

  /**
   * Submit a new accommodation request
   */
  submitRequest(data: {
    employeeId: string;
    employeeName: string;
    functionalLimitations: string[];
    requestedAccommodation: string;
    requestedAccommodationType: AccommodationType[];
    specificNeeds: string;
    disabilityType?: string;
  }): string {
    const requestId = randomUUID();

    const request: AccommodationRequest = {
      id: requestId,
      employeeId: data.employeeId,
      employeeName: data.employeeName,
      requestDate: new Date(),
      functionalLimitations: data.functionalLimitations,
      requestedAccommodation: data.requestedAccommodation,
      requestedAccommodationType: data.requestedAccommodationType,
      specificNeeds: data.specificNeeds,
      disabilityType: data.disabilityType as any,
      medicalDocumentationRequired: this.isMedicalDocumentationRequired(data.functionalLimitations),
      medicalDocumentationReceived: false,
      interactiveProcessStarted: new Date(),
      interactiveProcessMeetings: [],
      alternativeAccommodationsConsidered: [],
      status: 'pending',
      effectivenessReviews: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      confidentialNotes: []
    };

    this.requests.set(requestId, request);

    this.emit('request_submitted', request);

    console.log(`📋 Accommodation request ${requestId} submitted for ${data.employeeName}`);

    // Automatically start interactive process
    this.addConfidentialNote(
      requestId,
      'Request received. Interactive process initiated. HR to schedule initial meeting within 3 business days.'
    );

    return requestId;
  }

  /**
   * Determine if medical documentation is required
   * Per EEOC guidance, obvious disabilities don't require documentation
   */
  private isMedicalDocumentationRequired(limitations: string[]): boolean {
    // List of obvious limitations that typically don't require medical documentation
    const obviousLimitations = [
      'wheelchair',
      'blindness',
      'deafness',
      'missing limb',
      'visible mobility impairment'
    ];

    const limitationsText = limitations.join(' ').toLowerCase();

    // If limitation is obvious, documentation may not be required
    for (const obvious of obviousLimitations) {
      if (limitationsText.includes(obvious)) {
        return false;
      }
    }

    // For non-obvious disabilities, request medical documentation
    return true;
  }

  /**
   * Schedule interactive process meeting
   */
  scheduleInteractiveProcessMeeting(
    requestId: string,
    meetingData: {
      date: Date;
      attendees: string[];
      discussionTopics: string[];
      accommodationsDiscussed: string[];
    }
  ): string {
    const request = this.requests.get(requestId);
    if (!request) throw new Error('Request not found');

    const meetingId = randomUUID();

    const meeting: InteractiveProcessMeeting = {
      id: meetingId,
      date: meetingData.date,
      attendees: meetingData.attendees,
      discussionTopics: meetingData.discussionTopics,
      accommodationsDiscussed: meetingData.accommodationsDiscussed,
      employeeFeedback: '',
      nextSteps: []
    };

    request.interactiveProcessMeetings.push(meeting);
    request.status = 'interactive_process';
    request.updatedAt = new Date();

    this.emit('meeting_scheduled', { request, meeting });

    return meetingId;
  }

  /**
   * Record interactive process meeting notes
   */
  recordMeetingNotes(
    requestId: string,
    meetingId: string,
    notes: {
      employeeFeedback: string;
      nextSteps: string[];
      documentIds?: string[];
    }
  ): void {
    const request = this.requests.get(requestId);
    if (!request) throw new Error('Request not found');

    const meeting = request.interactiveProcessMeetings.find(m => m.id === meetingId);
    if (!meeting) throw new Error('Meeting not found');

    meeting.employeeFeedback = notes.employeeFeedback;
    meeting.nextSteps = notes.nextSteps;
    meeting.documentIds = notes.documentIds;

    request.updatedAt = new Date();

    this.addConfidentialNote(
      requestId,
      `Interactive process meeting completed. Next steps: ${notes.nextSteps.join(', ')}`
    );
  }

  /**
   * Add alternative accommodation for consideration
   */
  addAlternativeAccommodation(
    requestId: string,
    alternative: Omit<AlternativeAccommodation, 'discussedWithEmployee'>
  ): void {
    const request = this.requests.get(requestId);
    if (!request) throw new Error('Request not found');

    request.alternativeAccommodationsConsidered.push({
      ...alternative,
      discussedWithEmployee: false
    });

    request.updatedAt = new Date();

    this.addConfidentialNote(
      requestId,
      `Alternative accommodation considered: ${alternative.description} - Effectiveness: ${alternative.effectiveness}, Cost: $${alternative.cost}`
    );
  }

  /**
   * Record medical documentation received
   */
  recordMedicalDocumentation(
    requestId: string,
    documentIds: string[]
  ): void {
    const request = this.requests.get(requestId);
    if (!request) throw new Error('Request not found');

    request.medicalDocumentationReceived = true;
    request.medicalDocumentationIds = documentIds;
    request.medicalVerificationDate = new Date();
    request.updatedAt = new Date();

    this.addConfidentialNote(
      requestId,
      'Medical documentation received and verified. Protected under HIPAA.'
    );

    this.emit('medical_documentation_received', request);
  }

  /**
   * Make accommodation decision
   */
  makeDecision(
    requestId: string,
    decision: AccommodationDecision,
    decisionMaker: string
  ): void {
    const request = this.requests.get(requestId);
    if (!request) throw new Error('Request not found');

    request.decision = decision;
    request.decisionDate = new Date();
    request.decisionMaker = decisionMaker;
    request.status = decision.decision === 'approved' ? 'approved' : 'denied';
    request.updatedAt = new Date();

    this.addConfidentialNote(
      requestId,
      `Decision made: ${decision.decision}. ${decision.denialReason ? 'Reason: ' + decision.denialReason.reason : ''}`
    );

    this.emit('decision_made', request);

    // Send notification to employee (would integrate with notification system)
    console.log(`✅ Decision made on request ${requestId}: ${decision.decision}`);

    // If approved, create implementation plan
    if (decision.decision === 'approved') {
      this.addConfidentialNote(
        requestId,
        'Accommodation approved. Implementation plan to be created.'
      );
    }
  }

  /**
   * Create implementation plan
   */
  createImplementationPlan(
    requestId: string,
    plan: Omit<ImplementationPlan, 'milestones' | 'completionDate'>
  ): void {
    const request = this.requests.get(requestId);
    if (!request) throw new Error('Request not found');

    if (request.status !== 'approved') {
      throw new Error('Cannot create implementation plan for non-approved request');
    }

    request.implementationPlan = {
      ...plan,
      milestones: [],
      completionDate: undefined
    };

    request.updatedAt = new Date();

    this.addConfidentialNote(
      requestId,
      `Implementation plan created. Target date: ${plan.targetDate.toISOString()}, Budget: $${plan.budget}`
    );

    this.emit('implementation_planned', request);
  }

  /**
   * Add implementation milestone
   */
  addMilestone(
    requestId: string,
    milestone: Omit<Milestone, 'completed' | 'completionDate'>
  ): void {
    const request = this.requests.get(requestId);
    if (!request?.implementationPlan) throw new Error('No implementation plan found');

    request.implementationPlan.milestones.push({
      ...milestone,
      completed: false,
      completionDate: undefined
    });

    request.updatedAt = new Date();
  }

  /**
   * Complete milestone
   */
  completeMilestone(
    requestId: string,
    milestoneDescription: string,
    notes?: string
  ): void {
    const request = this.requests.get(requestId);
    if (!request?.implementationPlan) throw new Error('No implementation plan found');

    const milestone = request.implementationPlan.milestones.find(
      m => m.description === milestoneDescription
    );

    if (!milestone) throw new Error('Milestone not found');

    milestone.completed = true;
    milestone.completionDate = new Date();
    milestone.notes = notes;

    // Check if all milestones complete
    const allComplete = request.implementationPlan.milestones.every(m => m.completed);

    if (allComplete) {
      request.implementationPlan.completionDate = new Date();
      request.implementationDate = new Date();
      request.status = 'implemented';

      this.addConfidentialNote(
        requestId,
        'All implementation milestones completed. Accommodation fully implemented.'
      );

      // Schedule 30-day effectiveness review
      this.scheduleEffectivenessReview(requestId, 30);
    }

    request.updatedAt = new Date();
  }

  /**
   * Schedule effectiveness review
   */
  private scheduleEffectivenessReview(requestId: string, daysFromNow: number): void {
    const reviewDate = new Date();
    reviewDate.setDate(reviewDate.getDate() + daysFromNow);

    this.addConfidentialNote(
      requestId,
      `Effectiveness review scheduled for ${reviewDate.toISOString().split('T')[0]}`
    );

    // Would integrate with calendar/reminder system
  }

  /**
   * Conduct effectiveness review
   */
  conductEffectivenessReview(
    requestId: string,
    review: Omit<EffectivenessReview, 'id' | 'reviewDate'>
  ): void {
    const request = this.requests.get(requestId);
    if (!request) throw new Error('Request not found');

    const effectivenessReview: EffectivenessReview = {
      id: randomUUID(),
      reviewDate: new Date(),
      ...review
    };

    request.effectivenessReviews.push(effectivenessReview);
    request.updatedAt = new Date();

    this.addConfidentialNote(
      requestId,
      `Effectiveness review completed. Effective: ${review.isEffective}, Satisfaction: ${review.employeeSatisfaction}/5`
    );

    if (!review.isEffective || review.modificationsNeeded) {
      this.addConfidentialNote(
        requestId,
        'Accommodation requires modification. Restarting interactive process.'
      );
      request.status = 'interactive_process';
    }

    // Schedule next review if accommodation is working
    if (review.isEffective && review.followUpDate) {
      const daysUntilFollowUp = Math.ceil(
        (review.followUpDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      this.scheduleEffectivenessReview(requestId, daysUntilFollowUp);
    }

    this.emit('effectiveness_reviewed', { request, review: effectivenessReview });
  }

  /**
   * File an appeal
   */
  fileAppeal(
    requestId: string,
    appealReason: string
  ): void {
    const request = this.requests.get(requestId);
    if (!request) throw new Error('Request not found');

    if (request.status !== 'denied') {
      throw new Error('Can only appeal denied requests');
    }

    request.appealDate = new Date();
    request.appealReason = appealReason;
    request.status = 'under_review';
    request.updatedAt = new Date();

    this.addConfidentialNote(
      requestId,
      `Appeal filed. Reason: ${appealReason}. Senior management review initiated.`
    );

    this.emit('appeal_filed', request);
  }

  /**
   * Decide on appeal
   */
  decideAppeal(
    requestId: string,
    decision: string,
    decisionMaker: string
  ): void {
    const request = this.requests.get(requestId);
    if (!request) throw new Error('Request not found');

    request.appealDecision = decision;
    request.appealDecisionDate = new Date();
    request.status = decision.toLowerCase().includes('approved') ? 'approved' : 'denied';
    request.updatedAt = new Date();

    this.addConfidentialNote(
      requestId,
      `Appeal decision: ${decision}. Decided by: ${decisionMaker}`
    );

    this.emit('appeal_decided', request);
  }

  /**
   * Add confidential note (HIPAA protected)
   */
  addConfidentialNote(requestId: string, note: string): void {
    const request = this.requests.get(requestId);
    if (!request) throw new Error('Request not found');

    const timestamp = new Date().toISOString();
    request.confidentialNotes.push(`[${timestamp}] ${note}`);
    request.updatedAt = new Date();
  }

  /**
   * Get all requests
   */
  getAllRequests(): AccommodationRequest[] {
    return Array.from(this.requests.values());
  }

  /**
   * Get request by ID
   */
  getRequest(requestId: string): AccommodationRequest | undefined {
    return this.requests.get(requestId);
  }

  /**
   * Get requests by employee
   */
  getRequestsByEmployee(employeeId: string): AccommodationRequest[] {
    return this.getAllRequests().filter(r => r.employeeId === employeeId);
  }

  /**
   * Get requests by status
   */
  getRequestsByStatus(status: string): AccommodationRequest[] {
    return this.getAllRequests().filter(r => r.status === status);
  }

  /**
   * Get pending requests requiring action
   */
  getPendingRequests(): AccommodationRequest[] {
    return this.getAllRequests().filter(
      r => r.status === 'pending' || r.status === 'under_review' || r.status === 'interactive_process'
    );
  }

  /**
   * Check for approaching deadlines
   */
  private checkDeadlines(): void {
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    this.getAllRequests().forEach(request => {
      // Check for requests pending for > 5 days without interactive process
      if (request.status === 'pending') {
        const daysPending = (now.getTime() - request.requestDate.getTime()) / (1000 * 60 * 60 * 24);
        if (daysPending > 5) {
          this.emit('deadline_warning', {
            request,
            message: 'Request pending for >5 days. Interactive process should begin immediately.'
          });
        }
      }

      // Check implementation plan deadlines
      if (request.implementationPlan) {
        const targetDate = request.implementationPlan.targetDate;
        if (targetDate < threeDaysFromNow && !request.implementationPlan.completionDate) {
          this.emit('deadline_warning', {
            request,
            message: 'Implementation target date approaching within 3 days'
          });
        }
      }
    });
  }

  /**
   * Get accommodation statistics
   */
  getStatistics(): AccommodationStatistics {
    const requests = this.getAllRequests();

    const byType = new Map<AccommodationType, number>();
    const byStatus = new Map<string, number>();
    const costs: number[] = [];
    const satisfactionScores: number[] = [];
    const processingTimes: number[] = [];

    requests.forEach(request => {
      // Count by type
      request.requestedAccommodationType.forEach(type => {
        byType.set(type, (byType.get(type) || 0) + 1);
      });

      // Count by status
      byStatus.set(request.status, (byStatus.get(request.status) || 0) + 1);

      // Calculate processing time
      if (request.decisionDate) {
        const days = (request.decisionDate.getTime() - request.requestDate.getTime()) / (1000 * 60 * 60 * 24);
        processingTimes.push(days);
      }

      // Cost analysis
      if (request.implementationPlan) {
        costs.push(request.implementationPlan.budget);
      }

      // Satisfaction scores
      request.effectivenessReviews.forEach(review => {
        satisfactionScores.push(review.employeeSatisfaction);
      });
    });

    const totalCost = costs.reduce((sum, c) => sum + c, 0);
    const avgCost = costs.length > 0 ? totalCost / costs.length : 0;
    const medianCost = costs.length > 0 ? costs.sort((a, b) => a - b)[Math.floor(costs.length / 2)] : 0;

    const costByType = new Map<AccommodationType, number>();
    requests.forEach(request => {
      if (request.implementationPlan) {
        request.requestedAccommodationType.forEach(type => {
          costByType.set(type, (costByType.get(type) || 0) + request.implementationPlan!.budget);
        });
      }
    });

    const avgSatisfaction = satisfactionScores.length > 0
      ? satisfactionScores.reduce((sum, s) => sum + s, 0) / satisfactionScores.length
      : 0;

    const effectiveReviews = requests.reduce((count, r) => {
      return count + r.effectivenessReviews.filter(rev => rev.isEffective).length;
    }, 0);

    const totalReviews = requests.reduce((count, r) => count + r.effectivenessReviews.length, 0);

    const modificationsNeeded = requests.reduce((count, r) => {
      return count + r.effectivenessReviews.filter(rev => rev.modificationsNeeded).length;
    }, 0);

    return {
      totalRequests: requests.length,
      pendingRequests: this.getPendingRequests().length,
      approvedRequests: requests.filter(r => r.status === 'approved' || r.status === 'implemented').length,
      deniedRequests: requests.filter(r => r.status === 'denied').length,
      averageProcessingTime: processingTimes.length > 0
        ? processingTimes.reduce((sum, t) => sum + t, 0) / processingTimes.length
        : 0,
      byType,
      byStatus,
      costAnalysis: {
        totalCost,
        averageCost: avgCost,
        medianCost,
        costByType
      },
      effectivenessMetrics: {
        averageSatisfaction,
        successRate: totalReviews > 0 ? (effectiveReviews / totalReviews) * 100 : 0,
        modificationRate: totalReviews > 0 ? (modificationsNeeded / totalReviews) * 100 : 0
      }
    };
  }
}

// Singleton instance
export const accommodationManager = new ADAAccommodationManager();
