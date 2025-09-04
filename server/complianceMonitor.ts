import { EventEmitter } from "events";

// Comprehensive Legal Violation Matrix
export enum ViolationType {
  // Federal Laws
  COPYRIGHT_INFRINGEMENT = "copyright_infringement",
  CHILD_EXPLOITATION = "child_exploitation",
  HUMAN_TRAFFICKING = "human_trafficking",
  MONEY_LAUNDERING = "money_laundering",
  FRAUD = "fraud",
  DMCA_VIOLATION = "dmca_violation",
  SECTION_2257_VIOLATION = "section_2257_violation",

  // Platform Policies
  CONTENT_POLICY_VIOLATION = "content_policy_violation",
  HARASSMENT = "harassment",
  HATE_SPEECH = "hate_speech",
  DOXXING = "doxxing",
  SPAM = "spam",
  IMPERSONATION = "impersonation",

  // Financial Crimes
  TAX_EVASION = "tax_evasion",
  UNAUTHORIZED_PAYMENT_PROCESSING = "unauthorized_payment_processing",
  CHARGEBACKS_FRAUD = "chargebacks_fraud",

  // Data Protection
  GDPR_VIOLATION = "gdpr_violation",
  CCPA_VIOLATION = "ccpa_violation",
  UNAUTHORIZED_DATA_ACCESS = "unauthorized_data_access",
  DATA_BREACH = "data_breach",

  // Operational Violations
  UNAUTHORIZED_SYSTEM_ACCESS = "unauthorized_system_access",
  SECURITY_BYPASS = "security_bypass",
  ILLEGAL_CONTENT_DISTRIBUTION = "illegal_content_distribution",
}

export enum RiskLevel {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
  IMMEDIATE_BLOCK = "immediate_block",
}

export interface ViolationRule {
  type: ViolationType;
  riskLevel: RiskLevel;
  keywords: string[];
  patterns: RegExp[];
  requiresApproval: boolean;
  blockAction: boolean;
  legalReference: string;
  escalationContact: string;
  autoReportToAuthorities: boolean;
}

export interface ComplianceEvent {
  id: string;
  timestamp: Date;
  userId: string;
  action: string;
  content?: string;
  riskLevel: RiskLevel;
  violations: ViolationType[];
  blocked: boolean;
  approvalRequired: boolean;
  escalated: boolean;
  details: any;
}

export interface ApprovalRequest {
  id: string;
  eventId: string;
  userId: string;
  action: string;
  riskLevel: RiskLevel;
  violations: ViolationType[];
  requestedBy: string;
  timestamp: Date;
  status: "pending" | "approved" | "denied";
  approvedBy?: string;
  approvalTimestamp?: Date;
  notes?: string;
}

class ComplianceMonitoringSystem extends EventEmitter {
  private violationRules: ViolationRule[] = [];
  private pendingApprovals: Map<string, ApprovalRequest> = new Map();
  private recentEvents: ComplianceEvent[] = [];
  private blockedActions: Set<string> = new Set();

  constructor() {
    super();
    this.initializeViolationRules();
  }

  private initializeViolationRules() {
    this.violationRules = [
      // Critical Federal Law Violations - Immediate Block
      {
        type: ViolationType.CHILD_EXPLOITATION,
        riskLevel: RiskLevel.IMMEDIATE_BLOCK,
        keywords: [
          "minor",
          "underage",
          "child",
          "18 USC 2257",
          "age verification",
        ],
        patterns: [/\b(child|minor|underage|under.?18)\b/gi],
        requiresApproval: false,
        blockAction: true,
        legalReference: "18 U.S.C. § 2252, 2257",
        escalationContact: "legal@fanzunlimited.com",
        autoReportToAuthorities: true,
      },
      {
        type: ViolationType.HUMAN_TRAFFICKING,
        riskLevel: RiskLevel.IMMEDIATE_BLOCK,
        keywords: ["trafficking", "forced", "coerced", "against will"],
        patterns: [/\b(traffick|forced|coerced|against.?will)\b/gi],
        requiresApproval: false,
        blockAction: true,
        legalReference: "18 U.S.C. § 1591",
        escalationContact: "legal@fanzunlimited.com",
        autoReportToAuthorities: true,
      },
      {
        type: ViolationType.COPYRIGHT_INFRINGEMENT,
        riskLevel: RiskLevel.HIGH,
        keywords: [
          "copyrighted",
          "stolen content",
          "pirated",
          "unauthorized use",
        ],
        patterns: [/\b(copyright|stolen.?content|pirat|unauthorized.?use)\b/gi],
        requiresApproval: true,
        blockAction: true,
        legalReference: "17 U.S.C. § 101",
        escalationContact: "legal@fanzunlimited.com",
        autoReportToAuthorities: false,
      },
      {
        type: ViolationType.SECTION_2257_VIOLATION,
        riskLevel: RiskLevel.CRITICAL,
        keywords: [
          "age verification",
          "2257",
          "record keeping",
          "performer ID",
        ],
        patterns: [/\b(2257|age.?verification|record.?keeping)\b/gi],
        requiresApproval: true,
        blockAction: true,
        legalReference: "18 U.S.C. § 2257",
        escalationContact: "compliance@fanzunlimited.com",
        autoReportToAuthorities: false,
      },
      {
        type: ViolationType.MONEY_LAUNDERING,
        riskLevel: RiskLevel.CRITICAL,
        keywords: [
          "suspicious transaction",
          "large cash",
          "structuring",
          "layering",
        ],
        patterns: [
          /\b(suspicious.?transaction|large.?cash|structuring|layering)\b/gi,
        ],
        requiresApproval: true,
        blockAction: true,
        legalReference: "18 U.S.C. § 1956",
        escalationContact: "financial-crimes@fanzunlimited.com",
        autoReportToAuthorities: true,
      },
      {
        type: ViolationType.GDPR_VIOLATION,
        riskLevel: RiskLevel.HIGH,
        keywords: [
          "personal data",
          "EU citizen",
          "data export",
          "consent withdrawal",
        ],
        patterns: [
          /\b(personal.?data|EU.?citizen|data.?export|consent.?withdraw)\b/gi,
        ],
        requiresApproval: true,
        blockAction: false,
        legalReference: "GDPR Article 6, 17",
        escalationContact: "privacy@fanzunlimited.com",
        autoReportToAuthorities: false,
      },
    ];
  }

  // Main compliance check function
  checkCompliance(
    action: string,
    userId: string,
    content?: string,
    metadata?: any,
  ): ComplianceEvent {
    const eventId = `compliance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const violations: ViolationType[] = [];
    let maxRiskLevel = RiskLevel.LOW;
    let shouldBlock = false;
    let requiresApproval = false;

    // Analyze content and action against all violation rules
    for (const rule of this.violationRules) {
      const contentToCheck =
        `${action} ${content || ""} ${JSON.stringify(metadata || {})}`.toLowerCase();

      // Check keywords
      const hasKeywordMatch = rule.keywords.some((keyword) =>
        contentToCheck.includes(keyword.toLowerCase()),
      );

      // Check regex patterns
      const hasPatternMatch = rule.patterns.some((pattern) =>
        pattern.test(contentToCheck),
      );

      if (hasKeywordMatch || hasPatternMatch) {
        violations.push(rule.type);

        // Update risk level to highest found
        if (
          this.getRiskLevelValue(rule.riskLevel) >
          this.getRiskLevelValue(maxRiskLevel)
        ) {
          maxRiskLevel = rule.riskLevel;
        }

        if (rule.blockAction) {
          shouldBlock = true;
        }

        if (rule.requiresApproval) {
          requiresApproval = true;
        }

        // Auto-report to authorities if required
        if (rule.autoReportToAuthorities) {
          this.reportToAuthorities(rule.type, userId, action, content);
        }
      }
    }

    // Create compliance event
    const complianceEvent: ComplianceEvent = {
      id: eventId,
      timestamp: new Date(),
      userId,
      action,
      content,
      riskLevel: maxRiskLevel,
      violations,
      blocked: shouldBlock,
      approvalRequired: requiresApproval && !shouldBlock,
      escalated:
        maxRiskLevel === RiskLevel.CRITICAL ||
        maxRiskLevel === RiskLevel.IMMEDIATE_BLOCK,
      details: { metadata, rulesTriggered: violations.length },
    };

    // Store event
    this.recentEvents.push(complianceEvent);
    if (this.recentEvents.length > 1000) {
      this.recentEvents = this.recentEvents.slice(-1000);
    }

    // Emit events for real-time monitoring
    this.emit("complianceEvent", complianceEvent);

    if (shouldBlock) {
      this.blockedActions.add(eventId);
      this.emit("actionBlocked", complianceEvent);
    }

    if (complianceEvent.escalated) {
      this.emit("escalation", complianceEvent);
    }

    return complianceEvent;
  }

  // Create approval request for risky actions
  createApprovalRequest(eventId: string, requestedBy: string): ApprovalRequest {
    const event = this.recentEvents.find((e) => e.id === eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    const approvalId = `approval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const approval: ApprovalRequest = {
      id: approvalId,
      eventId,
      userId: event.userId,
      action: event.action,
      riskLevel: event.riskLevel,
      violations: event.violations,
      requestedBy,
      timestamp: new Date(),
      status: "pending",
    };

    this.pendingApprovals.set(approvalId, approval);
    this.emit("approvalRequest", approval);

    return approval;
  }

  // Approve or deny action
  processApproval(
    approvalId: string,
    approved: boolean,
    approvedBy: string,
    notes?: string,
  ): boolean {
    const approval = this.pendingApprovals.get(approvalId);
    if (!approval) {
      throw new Error("Approval request not found");
    }

    approval.status = approved ? "approved" : "denied";
    approval.approvedBy = approvedBy;
    approval.approvalTimestamp = new Date();
    approval.notes = notes;

    this.emit("approvalProcessed", approval);

    return approved;
  }

  // Get real-time compliance status
  getComplianceStatus() {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentEvents = this.recentEvents.filter(
      (e) => e.timestamp > last24Hours,
    );

    const violationCounts = recentEvents.reduce(
      (acc, event) => {
        event.violations.forEach((violation) => {
          acc[violation] = (acc[violation] || 0) + 1;
        });
        return acc;
      },
      {} as Record<ViolationType, number>,
    );

    return {
      totalEvents: recentEvents.length,
      blockedActions: recentEvents.filter((e) => e.blocked).length,
      pendingApprovals: Array.from(this.pendingApprovals.values()).filter(
        (a) => a.status === "pending",
      ).length,
      escalations: recentEvents.filter((e) => e.escalated).length,
      violationCounts,
      riskDistribution: {
        low: recentEvents.filter((e) => e.riskLevel === RiskLevel.LOW).length,
        medium: recentEvents.filter((e) => e.riskLevel === RiskLevel.MEDIUM)
          .length,
        high: recentEvents.filter((e) => e.riskLevel === RiskLevel.HIGH).length,
        critical: recentEvents.filter((e) => e.riskLevel === RiskLevel.CRITICAL)
          .length,
        immediateBlock: recentEvents.filter(
          (e) => e.riskLevel === RiskLevel.IMMEDIATE_BLOCK,
        ).length,
      },
    };
  }

  // Get legal knowledge base response
  getLegalGuidance(query: string): string {
    const legalKB = {
      "2257":
        "Under 18 U.S.C. § 2257, all sexually explicit content must have proper age verification records. Performers must provide valid government-issued ID showing they are 18+ at time of production.",
      copyright:
        "Content must be original or properly licensed. DMCA takedown procedures must be followed for reported infringement.",
      gdpr: "EU users have rights to data portability, deletion, and consent withdrawal under GDPR. All data processing must have legal basis.",
      harassment:
        "Platform prohibits harassment, doxxing, and coordinated attacks. Report violations to moderation team immediately.",
      fraud:
        "Any fraudulent activity including fake payments, chargeback abuse, or identity theft must be reported to financial crimes unit.",
      crisis:
        "For legal emergencies: 1) Preserve evidence 2) Contact legal@fanzunlimited.com 3) Document incident 4) Coordinate with crisis management team",
    };

    const queryLower = query.toLowerCase();
    for (const [key, guidance] of Object.entries(legalKB)) {
      if (queryLower.includes(key)) {
        return guidance;
      }
    }

    return "For specific legal guidance, contact legal@fanzunlimited.com or refer to the compliance documentation.";
  }

  private getRiskLevelValue(level: RiskLevel): number {
    switch (level) {
      case RiskLevel.LOW:
        return 1;
      case RiskLevel.MEDIUM:
        return 2;
      case RiskLevel.HIGH:
        return 3;
      case RiskLevel.CRITICAL:
        return 4;
      case RiskLevel.IMMEDIATE_BLOCK:
        return 5;
      default:
        return 0;
    }
  }

  private reportToAuthorities(
    violationType: ViolationType,
    userId: string,
    action: string,
    content?: string,
  ) {
    // In production, this would integrate with NCMEC, FBI, etc.
    console.log(
      `🚨 AUTOMATIC REPORT TO AUTHORITIES: ${violationType} by user ${userId}`,
    );
    this.emit("authorityReport", {
      violationType,
      userId,
      action,
      content,
      timestamp: new Date(),
    });
  }

  // Get pending approvals for admin interface
  getPendingApprovals(): ApprovalRequest[] {
    return Array.from(this.pendingApprovals.values()).filter(
      (a) => a.status === "pending",
    );
  }

  // Get recent compliance events
  getRecentEvents(limit: number = 50): ComplianceEvent[] {
    return this.recentEvents.slice(-limit);
  }
}

export const complianceMonitor = new ComplianceMonitoringSystem();
