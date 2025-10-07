import { EventEmitter } from 'events';
import crypto from 'crypto';

interface ComplianceRule {
  id: string;
  name: string;
  description: string;
  type: 'ADA' | 'GDPR' | 'CCPA' | 'USC2257' | 'COPPA' | 'DMCA' | 'FOSTA_SESTA' | 'CUSTOM';
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  conditions: {
    platforms?: string[];
    userTypes?: string[];
    contentTypes?: string[];
    regions?: string[];
    ageGroups?: string[];
  };
  checks: ComplianceCheck[];
  actions: ComplianceAction[];
  createdAt: Date;
  updatedAt: Date;
}

interface ComplianceCheck {
  id: string;
  type: 'content_scan' | 'age_verification' | 'data_privacy' | 'accessibility' | 'custom';
  parameters: Record<string, any>;
  frequency: 'realtime' | 'hourly' | 'daily' | 'weekly' | 'monthly';
  automated: boolean;
}

interface ComplianceAction {
  id: string;
  type: 'block' | 'flag' | 'review' | 'notify' | 'log' | 'escalate' | 'audit';
  parameters: Record<string, any>;
  immediate: boolean;
  notificationRecipients?: string[];
}

interface ComplianceViolation {
  id: string;
  ruleId: string;
  ruleName: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  platform: string;
  userId?: string;
  contentId?: string;
  description: string;
  evidence: Record<string, any>;
  status: 'open' | 'investigating' | 'resolved' | 'dismissed';
  assignedTo?: string;
  resolution?: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}

interface AuditRecord {
  id: string;
  type: 'compliance_check' | 'violation_created' | 'violation_resolved' | 'rule_updated' | 'system_event';
  subtype: string;
  platform: string;
  userId?: string;
  entityId?: string;
  description: string;
  metadata: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

interface AgeVerificationRecord {
  userId: string;
  verified: boolean;
  method: 'document' | 'database' | 'biometric' | 'thirdparty';
  verificationDate: Date;
  documentType?: string;
  verifierId?: string;
  expirationDate?: Date;
  metadata: Record<string, any>;
}

interface GDPRRequest {
  id: string;
  userId: string;
  type: 'access' | 'portability' | 'rectification' | 'erasure' | 'restriction' | 'objection';
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  requestedAt: Date;
  completedAt?: Date;
  reason?: string;
  processedBy?: string;
  metadata: Record<string, any>;
}

interface AccessibilityReport {
  id: string;
  platform: string;
  pageUrl: string;
  wcagLevel: 'A' | 'AA' | 'AAA';
  issues: {
    type: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
    element: string;
    guideline: string;
    solution: string;
  }[];
  score: number;
  generatedAt: Date;
  reviewedBy?: string;
  fixedAt?: Date;
}

export class ComplianceMonitoringSystem extends EventEmitter {
  private rules: Map<string, ComplianceRule> = new Map();
  private violations: Map<string, ComplianceViolation> = new Map();
  private auditLog: AuditRecord[] = [];
  private ageVerifications: Map<string, AgeVerificationRecord> = new Map();
  private gdprRequests: Map<string, GDPRRequest> = new Map();
  private accessibilityReports: Map<string, AccessibilityReport> = new Map();
  private monitoringActive: boolean = true;
  private checkIntervals: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    super();
    this.initializeDefaultRules();
    this.startAutomatedChecks();
    this.startCleanupProcess();
  }

  private initializeDefaultRules(): void {
    const defaultRules: ComplianceRule[] = [
      // ADA Compliance Rules
      {
        id: 'ada_wcag_aa',
        name: 'WCAG 2.1 AA Compliance',
        description: 'Ensure all platforms meet Web Content Accessibility Guidelines Level AA',
        type: 'ADA',
        severity: 'high',
        enabled: true,
        conditions: { platforms: ['all'] },
        checks: [{
          id: 'wcag_check',
          type: 'accessibility',
          parameters: { level: 'AA', standard: 'WCAG2.1' },
          frequency: 'daily',
          automated: true
        }],
        actions: [{
          id: 'ada_flag',
          type: 'flag',
          parameters: { priority: 'high' },
          immediate: false,
          notificationRecipients: ['compliance@fanzunlimited.com']
        }],
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // GDPR Compliance Rules  
      {
        id: 'gdpr_data_privacy',
        name: 'GDPR Data Privacy Protection',
        description: 'Protect EU user data according to GDPR requirements',
        type: 'GDPR',
        severity: 'critical',
        enabled: true,
        conditions: { regions: ['EU'], userTypes: ['all'] },
        checks: [{
          id: 'gdpr_data_check',
          type: 'data_privacy',
          parameters: { 
            checkConsent: true,
            checkDataMinimization: true,
            checkRetention: true,
            checkRightToErasure: true
          },
          frequency: 'realtime',
          automated: true
        }],
        actions: [{
          id: 'gdpr_block',
          type: 'block',
          parameters: { message: 'GDPR compliance required' },
          immediate: true,
          notificationRecipients: ['legal@fanzunlimited.com', 'dpo@fanzunlimited.com']
        }],
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // 18 USC 2257 Compliance
      {
        id: 'usc2257_records',
        name: '18 USC 2257 Record Keeping',
        description: 'Ensure proper record keeping for adult content performers',
        type: 'USC2257',
        severity: 'critical',
        enabled: true,
        conditions: { platforms: ['all'], contentTypes: ['adult'] },
        checks: [{
          id: 'records_check',
          type: 'content_scan',
          parameters: { 
            requiresRecords: true,
            ageVerification: true,
            documentStorage: true
          },
          frequency: 'realtime',
          automated: true
        }],
        actions: [{
          id: 'usc2257_block',
          type: 'block',
          parameters: { message: 'Age verification records required' },
          immediate: true,
          notificationRecipients: ['compliance@fanzunlimited.com', 'legal@fanzunlimited.com']
        }],
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Age Verification
      {
        id: 'age_verification_adult',
        name: 'Adult Content Age Verification',
        description: 'Verify all users are 18+ for adult content platforms',
        type: 'USC2257',
        severity: 'critical',
        enabled: true,
        conditions: { contentTypes: ['adult'] },
        checks: [{
          id: 'age_verify_check',
          type: 'age_verification',
          parameters: { minimumAge: 18, methods: ['document', 'database'] },
          frequency: 'realtime',
          automated: true
        }],
        actions: [{
          id: 'age_block',
          type: 'block',
          parameters: { redirectTo: '/age-verification' },
          immediate: true
        }],
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // DMCA Compliance
      {
        id: 'dmca_copyright',
        name: 'DMCA Copyright Protection',
        description: 'Monitor and respond to DMCA takedown notices',
        type: 'DMCA',
        severity: 'high',
        enabled: true,
        conditions: { contentTypes: ['media', 'video', 'image'] },
        checks: [{
          id: 'copyright_scan',
          type: 'content_scan',
          parameters: { checkFingerprints: true, checkWatermarks: true },
          frequency: 'hourly',
          automated: true
        }],
        actions: [{
          id: 'dmca_flag',
          type: 'flag',
          parameters: { priority: 'high', requiresReview: true },
          immediate: false,
          notificationRecipients: ['dmca@fanzunlimited.com']
        }],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    defaultRules.forEach(rule => {
      this.rules.set(rule.id, rule);
    });

    console.log(`📋 Compliance Monitor initialized with ${this.rules.size} rules`);
    this.emit('rules_loaded', this.rules.size);
  }

  // Main compliance checking method
  public async checkCompliance(
    platform: string,
    userId?: string,
    contentId?: string,
    context?: Record<string, any>
  ): Promise<{
    compliant: boolean;
    violations: ComplianceViolation[];
    actions: string[];
  }> {
    const violations: ComplianceViolation[] = [];
    const actions: string[] = [];

    try {
      for (const rule of this.rules.values()) {
        if (!rule.enabled) continue;

        // Check if rule applies to this context
        if (!this.ruleApplies(rule, platform, userId, contentId, context)) {
          continue;
        }

        // Run rule checks
        const ruleViolations = await this.runRuleChecks(rule, platform, userId, contentId, context);
        violations.push(...ruleViolations);

        // Execute actions for violations
        for (const violation of ruleViolations) {
          const ruleActions = await this.executeRuleActions(rule, violation);
          actions.push(...ruleActions);
        }
      }

      // Log audit record
      await this.logAudit({
        type: 'compliance_check',
        subtype: 'automated',
        platform,
        userId,
        entityId: contentId,
        description: `Compliance check completed: ${violations.length} violations found`,
        metadata: { violationCount: violations.length, context }
      });

      return {
        compliant: violations.length === 0,
        violations,
        actions
      };

    } catch (error) {
      console.error('Compliance check error:', error);
      await this.logAudit({
        type: 'system_event',
        subtype: 'error',
        platform,
        userId,
        description: 'Compliance check failed',
        metadata: { error: error.message, context }
      });

      throw error;
    }
  }

  private ruleApplies(
    rule: ComplianceRule,
    platform: string,
    userId?: string,
    contentId?: string,
    context?: Record<string, any>
  ): boolean {
    const conditions = rule.conditions;

    // Platform check
    if (conditions.platforms && conditions.platforms.length > 0) {
      const applies = conditions.platforms.includes('all') || conditions.platforms.includes(platform);
      if (!applies) return false;
    }

    // Content type check
    if (conditions.contentTypes && conditions.contentTypes.length > 0 && context?.contentType) {
      const applies = conditions.contentTypes.includes(context.contentType);
      if (!applies) return false;
    }

    // Region check
    if (conditions.regions && conditions.regions.length > 0 && context?.region) {
      const applies = conditions.regions.includes(context.region);
      if (!applies) return false;
    }

    // Age group check
    if (conditions.ageGroups && conditions.ageGroups.length > 0 && context?.ageGroup) {
      const applies = conditions.ageGroups.includes(context.ageGroup);
      if (!applies) return false;
    }

    return true;
  }

  private async runRuleChecks(
    rule: ComplianceRule,
    platform: string,
    userId?: string,
    contentId?: string,
    context?: Record<string, any>
  ): Promise<ComplianceViolation[]> {
    const violations: ComplianceViolation[] = [];

    for (const check of rule.checks) {
      try {
        const checkResult = await this.executeCheck(check, platform, userId, contentId, context);
        
        if (!checkResult.passed) {
          const violation: ComplianceViolation = {
            id: this.generateId(),
            ruleId: rule.id,
            ruleName: rule.name,
            type: rule.type,
            severity: rule.severity,
            platform,
            userId,
            contentId,
            description: checkResult.description,
            evidence: checkResult.evidence,
            status: 'open',
            createdAt: new Date(),
            updatedAt: new Date()
          };

          violations.push(violation);
          this.violations.set(violation.id, violation);

          // Emit violation event
          this.emit('violation_created', violation);
        }

      } catch (error) {
        console.error(`Check execution failed for ${check.id}:`, error);
      }
    }

    return violations;
  }

  private async executeCheck(
    check: ComplianceCheck,
    platform: string,
    userId?: string,
    contentId?: string,
    context?: Record<string, any>
  ): Promise<{ passed: boolean; description: string; evidence: Record<string, any> }> {
    switch (check.type) {
      case 'age_verification':
        return this.checkAgeVerification(check.parameters, userId);

      case 'content_scan':
        return this.checkContent(check.parameters, contentId, context);

      case 'data_privacy':
        return this.checkDataPrivacy(check.parameters, userId, context);

      case 'accessibility':
        return this.checkAccessibility(check.parameters, platform, context);

      default:
        return {
          passed: true,
          description: 'Check type not implemented',
          evidence: { checkType: check.type }
        };
    }
  }

  private async checkAgeVerification(
    parameters: Record<string, any>,
    userId?: string
  ): Promise<{ passed: boolean; description: string; evidence: Record<string, any> }> {
    if (!userId) {
      return {
        passed: false,
        description: 'User ID required for age verification',
        evidence: { reason: 'missing_user_id' }
      };
    }

    const verification = this.ageVerifications.get(userId);
    const minimumAge = parameters.minimumAge || 18;

    if (!verification || !verification.verified) {
      return {
        passed: false,
        description: `Age verification required (minimum age: ${minimumAge})`,
        evidence: { 
          userId,
          minimumAge,
          hasVerification: !!verification,
          isVerified: verification?.verified || false
        }
      };
    }

    // Check if verification is expired
    if (verification.expirationDate && verification.expirationDate < new Date()) {
      return {
        passed: false,
        description: 'Age verification has expired',
        evidence: {
          userId,
          expirationDate: verification.expirationDate,
          currentDate: new Date()
        }
      };
    }

    return {
      passed: true,
      description: 'Age verification valid',
      evidence: {
        userId,
        verificationDate: verification.verificationDate,
        method: verification.method
      }
    };
  }

  private async checkContent(
    parameters: Record<string, any>,
    contentId?: string,
    context?: Record<string, any>
  ): Promise<{ passed: boolean; description: string; evidence: Record<string, any> }> {
    if (!contentId) {
      return { passed: true, description: 'No content to check', evidence: {} };
    }

    const issues: string[] = [];
    const evidence: Record<string, any> = { contentId };

    // Check for required records (18 USC 2257)
    if (parameters.requiresRecords && context?.contentType === 'adult') {
      // This would integrate with FanzHubVault to check for records
      const hasRecords = await this.checkContentRecords(contentId);
      if (!hasRecords) {
        issues.push('Missing required 18 USC 2257 records');
        evidence.missingRecords = true;
      }
    }

    // Check age verification for performers
    if (parameters.ageVerification && context?.performerIds) {
      for (const performerId of context.performerIds) {
        const hasVerification = this.ageVerifications.has(performerId);
        if (!hasVerification) {
          issues.push(`Missing age verification for performer ${performerId}`);
          evidence.missingPerformerVerification = evidence.missingPerformerVerification || [];
          evidence.missingPerformerVerification.push(performerId);
        }
      }
    }

    return {
      passed: issues.length === 0,
      description: issues.length > 0 ? issues.join('; ') : 'Content compliance check passed',
      evidence
    };
  }

  private async checkDataPrivacy(
    parameters: Record<string, any>,
    userId?: string,
    context?: Record<string, any>
  ): Promise<{ passed: boolean; description: string; evidence: Record<string, any> }> {
    const issues: string[] = [];
    const evidence: Record<string, any> = { userId };

    if (!userId) {
      return { passed: true, description: 'No user data to check', evidence: {} };
    }

    // Check consent (GDPR)
    if (parameters.checkConsent && context?.region === 'EU') {
      const hasConsent = await this.checkUserConsent(userId);
      if (!hasConsent) {
        issues.push('Missing GDPR consent');
        evidence.missingConsent = true;
      }
    }

    // Check data minimization
    if (parameters.checkDataMinimization) {
      const dataMinimized = await this.checkDataMinimization(userId);
      if (!dataMinimized) {
        issues.push('Data minimization violation');
        evidence.dataMinimizationViolation = true;
      }
    }

    return {
      passed: issues.length === 0,
      description: issues.length > 0 ? issues.join('; ') : 'Data privacy check passed',
      evidence
    };
  }

  private async checkAccessibility(
    parameters: Record<string, any>,
    platform: string,
    context?: Record<string, any>
  ): Promise<{ passed: boolean; description: string; evidence: Record<string, any> }> {
    // This would integrate with an accessibility scanner
    const pageUrl = context?.pageUrl || `/${platform}`;
    const wcagLevel = parameters.level || 'AA';

    // Mock accessibility check - in production this would use a real scanner
    const mockReport: AccessibilityReport = {
      id: this.generateId(),
      platform,
      pageUrl,
      wcagLevel: wcagLevel as 'A' | 'AA' | 'AAA',
      issues: [],
      score: 85, // Mock score
      generatedAt: new Date()
    };

    const passed = mockReport.score >= 80; // Pass threshold

    return {
      passed,
      description: passed 
        ? `Accessibility check passed (score: ${mockReport.score})`
        : `Accessibility issues found (score: ${mockReport.score})`,
      evidence: {
        platform,
        pageUrl,
        wcagLevel,
        score: mockReport.score,
        issueCount: mockReport.issues.length
      }
    };
  }

  private async executeRuleActions(
    rule: ComplianceRule,
    violation: ComplianceViolation
  ): Promise<string[]> {
    const executedActions: string[] = [];

    for (const action of rule.actions) {
      try {
        const result = await this.executeAction(action, violation);
        if (result) {
          executedActions.push(action.type);
        }
      } catch (error) {
        console.error(`Action execution failed for ${action.id}:`, error);
      }
    }

    return executedActions;
  }

  private async executeAction(
    action: ComplianceAction,
    violation: ComplianceViolation
  ): Promise<boolean> {
    switch (action.type) {
      case 'block':
        console.log(`🚫 Blocking action for violation ${violation.id}`);
        return true;

      case 'flag':
        console.log(`🚩 Flagging violation ${violation.id} for review`);
        return true;

      case 'notify':
        if (action.notificationRecipients) {
          console.log(`📧 Notifying ${action.notificationRecipients.join(', ')} about violation ${violation.id}`);
        }
        return true;

      case 'log':
        await this.logAudit({
          type: 'violation_created',
          subtype: violation.type,
          platform: violation.platform,
          userId: violation.userId,
          entityId: violation.contentId,
          description: `Compliance violation: ${violation.description}`,
          metadata: { violationId: violation.id, ruleId: violation.ruleId }
        });
        return true;

      case 'escalate':
        console.log(`⬆️ Escalating violation ${violation.id} to compliance team`);
        return true;

      default:
        return false;
    }
  }

  // Helper methods for specific checks
  private async checkContentRecords(contentId: string): Promise<boolean> {
    // This would integrate with FanzHubVault
    return Math.random() > 0.1; // Mock: 90% have records
  }

  private async checkUserConsent(userId: string): Promise<boolean> {
    // This would check stored consent records
    return Math.random() > 0.05; // Mock: 95% have consent
  }

  private async checkDataMinimization(userId: string): Promise<boolean> {
    // This would analyze stored user data
    return Math.random() > 0.02; // Mock: 98% compliant
  }

  // Age verification management
  public async recordAgeVerification(
    userId: string,
    method: 'document' | 'database' | 'biometric' | 'thirdparty',
    verified: boolean,
    metadata: Record<string, any> = {}
  ): Promise<void> {
    const record: AgeVerificationRecord = {
      userId,
      verified,
      method,
      verificationDate: new Date(),
      verifierId: metadata.verifierId,
      documentType: metadata.documentType,
      expirationDate: metadata.expirationDate,
      metadata
    };

    this.ageVerifications.set(userId, record);

    await this.logAudit({
      type: 'compliance_check',
      subtype: 'age_verification',
      platform: metadata.platform || 'system',
      userId,
      description: `Age verification recorded: ${verified ? 'VERIFIED' : 'FAILED'}`,
      metadata: { method, documentType: metadata.documentType }
    });

    console.log(`✅ Age verification recorded for user ${userId}: ${verified ? 'VERIFIED' : 'FAILED'}`);
    this.emit('age_verification_recorded', { userId, verified, method });
  }

  // GDPR request management
  public async createGDPRRequest(
    userId: string,
    type: 'access' | 'portability' | 'rectification' | 'erasure' | 'restriction' | 'objection',
    metadata: Record<string, any> = {}
  ): Promise<string> {
    const request: GDPRRequest = {
      id: this.generateId(),
      userId,
      type,
      status: 'pending',
      requestedAt: new Date(),
      metadata
    };

    this.gdprRequests.set(request.id, request);

    await this.logAudit({
      type: 'compliance_check',
      subtype: 'gdpr_request',
      platform: metadata.platform || 'system',
      userId,
      entityId: request.id,
      description: `GDPR ${type} request created`,
      metadata: { requestId: request.id, type }
    });

    console.log(`📋 GDPR ${type} request created for user ${userId}: ${request.id}`);
    this.emit('gdpr_request_created', request);

    return request.id;
  }

  // Audit logging
  private async logAudit(auditData: Omit<AuditRecord, 'id' | 'timestamp'>): Promise<void> {
    const record: AuditRecord = {
      id: this.generateId(),
      timestamp: new Date(),
      ...auditData
    };

    this.auditLog.push(record);

    // Keep only last 10000 audit records in memory
    if (this.auditLog.length > 10000) {
      this.auditLog.splice(0, this.auditLog.length - 10000);
    }

    this.emit('audit_logged', record);
  }

  // Automated monitoring
  private startAutomatedChecks(): void {
    // Daily accessibility checks
    const dailyCheck = setInterval(async () => {
      if (this.monitoringActive) {
        console.log('🔍 Running daily accessibility compliance checks...');
        // This would trigger accessibility scans for all platforms
        this.emit('scheduled_check_started', { type: 'accessibility', frequency: 'daily' });
      }
    }, 24 * 60 * 60 * 1000); // 24 hours

    // Hourly content scans
    const hourlyCheck = setInterval(async () => {
      if (this.monitoringActive) {
        console.log('🔍 Running hourly content compliance checks...');
        // This would trigger content scans for new uploads
        this.emit('scheduled_check_started', { type: 'content_scan', frequency: 'hourly' });
      }
    }, 60 * 60 * 1000); // 1 hour

    this.checkIntervals.set('daily', dailyCheck);
    this.checkIntervals.set('hourly', hourlyCheck);
  }

  private startCleanupProcess(): void {
    // Clean up old audit records and resolved violations
    setInterval(() => {
      const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000); // 90 days ago
      
      // Clean up old audit records
      this.auditLog = this.auditLog.filter(record => record.timestamp > cutoff);

      // Archive old resolved violations
      for (const [id, violation] of this.violations.entries()) {
        if (violation.status === 'resolved' && violation.resolvedAt && violation.resolvedAt < cutoff) {
          this.violations.delete(id);
        }
      }
    }, 24 * 60 * 60 * 1000); // Daily cleanup
  }

  // Public API methods
  public getViolations(filters?: {
    platform?: string;
    severity?: string[];
    status?: string[];
    limit?: number;
  }): ComplianceViolation[] {
    let violations = Array.from(this.violations.values());

    if (filters?.platform) {
      violations = violations.filter(v => v.platform === filters.platform);
    }

    if (filters?.severity) {
      violations = violations.filter(v => filters.severity!.includes(v.severity));
    }

    if (filters?.status) {
      violations = violations.filter(v => filters.status!.includes(v.status));
    }

    // Sort by creation date (newest first)
    violations.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    if (filters?.limit) {
      violations = violations.slice(0, filters.limit);
    }

    return violations;
  }

  public getAuditLog(filters?: {
    type?: string;
    platform?: string;
    userId?: string;
    limit?: number;
  }): AuditRecord[] {
    let logs = [...this.auditLog];

    if (filters?.type) {
      logs = logs.filter(l => l.type === filters.type);
    }

    if (filters?.platform) {
      logs = logs.filter(l => l.platform === filters.platform);
    }

    if (filters?.userId) {
      logs = logs.filter(l => l.userId === filters.userId);
    }

    // Sort by timestamp (newest first)
    logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    if (filters?.limit) {
      logs = logs.slice(0, filters.limit);
    }

    return logs;
  }

  public getComplianceStats(): {
    totalRules: number;
    activeRules: number;
    totalViolations: number;
    openViolations: number;
    violationsBySeverity: Record<string, number>;
    violationsByPlatform: Record<string, number>;
    auditRecords: number;
  } {
    const violations = Array.from(this.violations.values());
    
    return {
      totalRules: this.rules.size,
      activeRules: Array.from(this.rules.values()).filter(r => r.enabled).length,
      totalViolations: violations.length,
      openViolations: violations.filter(v => v.status === 'open').length,
      violationsBySeverity: this.groupBy(violations, 'severity'),
      violationsByPlatform: this.groupBy(violations, 'platform'),
      auditRecords: this.auditLog.length
    };
  }

  public stopMonitoring(): void {
    this.monitoringActive = false;
    this.checkIntervals.forEach(interval => clearInterval(interval));
    this.checkIntervals.clear();
    console.log('⏹️ Compliance monitoring stopped');
  }

  public startMonitoring(): void {
    this.monitoringActive = true;
    this.startAutomatedChecks();
    console.log('▶️ Compliance monitoring started');
  }

  // Helper methods
  private generateId(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  private groupBy<T>(array: T[], key: keyof T): Record<string, number> {
    return array.reduce((groups, item) => {
      const value = String(item[key]);
      groups[value] = (groups[value] || 0) + 1;
      return groups;
    }, {} as Record<string, number>);
  }
}

// Create singleton instance
export const complianceMonitor = new ComplianceMonitoringSystem();

// Export types
export type {
  ComplianceRule,
  ComplianceViolation,
  AuditRecord,
  AgeVerificationRecord,
  GDPRRequest,
  AccessibilityReport
};