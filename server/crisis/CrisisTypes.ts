/**
 * FANZ Crisis Management Types & Definitions
 * Comprehensive crisis classification and tracking system
 */

export enum CrisisType {
  // Security Incidents
  DATA_BREACH = 'data_breach',
  DDOS_ATTACK = 'ddos_attack',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  MALWARE_INFECTION = 'malware_infection',

  // Compliance & Legal
  REGULATORY_VIOLATION = 'regulatory_violation',
  LEGAL_THREAT = 'legal_threat',
  CSAM_DETECTION = 'csam_detection',
  AGE_VERIFICATION_FAILURE = 'age_verification_failure',
  GDPR_VIOLATION = 'gdpr_violation',

  // Platform Operations
  PLATFORM_OUTAGE = 'platform_outage',
  PAYMENT_SYSTEM_FAILURE = 'payment_system_failure',
  DATABASE_CORRUPTION = 'database_corruption',
  CDN_FAILURE = 'cdn_failure',
  API_OUTAGE = 'api_outage',

  // Creator Safety
  CREATOR_HARASSMENT = 'creator_harassment',
  CONTENT_LEAK = 'content_leak',
  IDENTITY_EXPOSURE = 'identity_exposure',
  STALKING_INCIDENT = 'stalking_incident',

  // Financial
  PAYMENT_PROCESSOR_SUSPENSION = 'payment_processor_suspension',
  FRAUD_ATTACK = 'fraud_attack',
  CHARGEBACK_WAVE = 'chargeback_wave',
  BANK_ACCOUNT_FREEZE = 'bank_account_freeze',

  // Reputation & PR
  NEGATIVE_MEDIA = 'negative_media',
  VIRAL_COMPLAINT = 'viral_complaint',
  CREATOR_EXODUS = 'creator_exodus',
  BOYCOTT_THREAT = 'boycott_threat',

  // Employee/Internal
  KEY_EMPLOYEE_DEPARTURE = 'key_employee_departure',
  INSIDER_THREAT = 'insider_threat',
  WORKPLACE_INCIDENT = 'workplace_incident',
}

export enum SeverityLevel {
  CRITICAL = 'critical',      // Immediate action required, business-critical
  HIGH = 'high',              // Urgent, significant impact
  MEDIUM = 'medium',          // Important but not immediate
  LOW = 'low',                // Monitor, plan response
  INFORMATIONAL = 'info'      // Awareness only
}

export enum CrisisStatus {
  DETECTED = 'detected',
  ACKNOWLEDGED = 'acknowledged',
  INVESTIGATING = 'investigating',
  RESPONDING = 'responding',
  MITIGATING = 'mitigating',
  RESOLVING = 'resolving',
  RESOLVED = 'resolved',
  POST_MORTEM = 'post_mortem',
  CLOSED = 'closed'
}

export interface Crisis {
  id: string;
  type: CrisisType;
  severity: SeverityLevel;
  status: CrisisStatus;
  title: string;
  description: string;
  detectedAt: Date;
  detectedBy: string;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
  resolvedAt?: Date;
  resolvedBy?: string;

  // Impact Assessment
  impact: {
    affectedPlatforms: string[];
    affectedCreators: number;
    affectedUsers: number;
    estimatedRevenueLoss: number;
    reputationRisk: 'low' | 'medium' | 'high' | 'critical';
    legalRisk: 'low' | 'medium' | 'high' | 'critical';
  };

  // Response
  assignedTo: string[];
  responseTeam: string[];
  currentActions: string[];
  escalationLevel: 1 | 2 | 3 | 4 | 5;
  executiveNotified: boolean;

  // Timeline
  timeline: CrisisEvent[];

  // Communication
  internalComms: CrisisCommunication[];
  externalComms: CrisisCommunication[];

  // Related
  relatedCrises?: string[];
  relatedIncidents?: string[];

  // Post-Crisis
  rootCause?: string;
  lessonsLearned?: string[];
  preventiveMeasures?: string[];
  postMortemCompleted?: boolean;
}

export interface CrisisEvent {
  id: string;
  timestamp: Date;
  eventType: 'detection' | 'update' | 'action' | 'escalation' | 'resolution';
  description: string;
  actor: string;
  severity?: SeverityLevel;
  attachments?: string[];
}

export interface CrisisCommunication {
  id: string;
  timestamp: Date;
  channel: 'email' | 'slack' | 'sms' | 'phone' | 'public' | 'press_release';
  audience: 'internal' | 'creators' | 'users' | 'partners' | 'public' | 'media' | 'regulators';
  subject: string;
  message: string;
  sentBy: string;
  recipients: string[];
  approved: boolean;
  approvedBy?: string;
}

export interface ThreatAlert {
  id: string;
  alertType: 'security' | 'compliance' | 'operational' | 'financial' | 'legal';
  severity: SeverityLevel;
  title: string;
  description: string;
  detectedAt: Date;
  source: string; // e.g., "IDS", "Manual Report", "Automated Monitor"

  // Threat Details
  indicators: string[];
  affectedSystems: string[];
  potentialImpact: string;
  confidence: 'low' | 'medium' | 'high';

  // Status
  status: 'new' | 'investigating' | 'confirmed' | 'false_positive' | 'escalated';
  assignedTo?: string;
  escalatedToCrisis?: string; // Crisis ID if escalated

  // Actions
  recommendedActions: string[];
  actionsTaken: {
    timestamp: Date;
    action: string;
    performedBy: string;
  }[];

  // Resolution
  resolvedAt?: Date;
  resolution?: string;
}

export interface ResponsePlan {
  id: string;
  name: string;
  crisisType: CrisisType;
  severity: SeverityLevel;
  description: string;
  lastUpdated: Date;
  owner: string;

  // Activation
  activationCriteria: string[];
  autoActivate: boolean;

  // Response Team
  responseTeam: {
    role: string;
    responsibilities: string[];
    contactInfo: string;
    backup?: string;
  }[];

  // Immediate Actions (First 15 minutes)
  immediateActions: {
    priority: number;
    action: string;
    assignedRole: string;
    estimatedMinutes: number;
  }[];

  // Short-term Actions (First hour)
  shortTermActions: {
    priority: number;
    action: string;
    assignedRole: string;
    estimatedMinutes: number;
  }[];

  // Ongoing Actions
  ongoingActions: {
    action: string;
    frequency: string;
    assignedRole: string;
  }[];

  // Communication Plans
  communicationPlan: {
    audience: string;
    timing: string;
    channel: string;
    template: string;
    approvalRequired: boolean;
    approver?: string;
  }[];

  // Escalation Path
  escalationPath: {
    level: number;
    trigger: string;
    notifyRoles: string[];
    additionalActions: string[];
  }[];

  // Resources
  requiredResources: string[];
  contacts: {
    name: string;
    role: string;
    phone: string;
    email: string;
    availability: string;
  }[];

  // Success Criteria
  resolutionCriteria: string[];

  // Post-Crisis
  postCrisisActions: string[];
  documentationRequirements: string[];
}

export interface CommandCenter {
  status: 'normal' | 'elevated' | 'crisis' | 'critical';
  activeCrises: Crisis[];
  activeThreatAlerts: ThreatAlert[];

  // Real-time Metrics
  metrics: {
    platformUptime: {
      [platformId: string]: {
        status: 'operational' | 'degraded' | 'down';
        uptime: number; // percentage
        lastIncident?: Date;
      };
    };

    securityStatus: {
      threatLevel: SeverityLevel;
      activeThreats: number;
      blockedAttacks24h: number;
      vulnerabilitiesDetected: number;
    };

    complianceStatus: {
      pendingVerifications: number;
      flaggedContent: number;
      legalHolds: number;
      regulatoryRequests: number;
    };

    financialHealth: {
      payoutsPending: number;
      payoutsFailed: number;
      fraudAttempts24h: number;
      chargebacks24h: number;
    };

    creatorSupport: {
      openTickets: number;
      avgResponseTime: number; // minutes
      escalatedIssues: number;
      creatorComplaints: number;
    };
  };

  // On-call Teams
  onCallTeams: {
    security: string[];
    compliance: string[];
    engineering: string[];
    finance: string[];
    legal: string[];
    pr: string[];
    executive: string[];
  };

  // Recent Activity
  recentActivity: {
    timestamp: Date;
    type: 'crisis' | 'alert' | 'incident' | 'resolution';
    summary: string;
    severity: SeverityLevel;
  }[];

  lastUpdated: Date;
}

export interface IncidentReport {
  id: string;
  crisisId?: string;
  reportDate: Date;
  reportedBy: string;

  // Incident Details
  incidentDate: Date;
  incidentType: CrisisType;
  severity: SeverityLevel;
  summary: string;
  detailedDescription: string;

  // Impact
  impact: string;
  affectedSystems: string[];
  downtime?: number; // minutes
  dataAffected?: string;
  usersImpacted?: number;
  financialImpact?: number;

  // Root Cause Analysis
  rootCause: string;
  contributingFactors: string[];

  // Response
  responseActions: string[];
  timeToDetect?: number; // minutes
  timeToResolve?: number; // minutes

  // Prevention
  preventiveMeasures: string[];
  processImprovements: string[];

  // Follow-up
  actionItems: {
    action: string;
    assignedTo: string;
    dueDate: Date;
    status: 'pending' | 'in_progress' | 'completed';
  }[];

  // Approval
  reviewedBy?: string[];
  approvedBy?: string;
  approvalDate?: Date;
}
