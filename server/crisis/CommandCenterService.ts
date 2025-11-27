/**
 * FANZ Command Center Service
 * Real-time crisis monitoring and management
 */

import {
  Crisis,
  ThreatAlert,
  CommandCenter,
  CrisisStatus,
  SeverityLevel,
  CrisisType
} from './CrisisTypes';
import { getResponsePlan } from './ResponsePlans';

export class CommandCenterService {
  private activeCrises: Map<string, Crisis> = new Map();
  private activeThreatAlerts: Map<string, ThreatAlert> = new Map();
  private commandCenterStatus: CommandCenter['status'] = 'normal';

  /**
   * Declare a new crisis
   */
  declareCrisis(params: {
    type: CrisisType;
    severity: SeverityLevel;
    title: string;
    description: string;
    detectedBy: string;
    impact: Crisis['impact'];
  }): Crisis {
    const crisis: Crisis = {
      id: `crisis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: params.type,
      severity: params.severity,
      status: CrisisStatus.DETECTED,
      title: params.title,
      description: params.description,
      detectedAt: new Date(),
      detectedBy: params.detectedBy,
      impact: params.impact,
      assignedTo: [],
      responseTeam: [],
      currentActions: [],
      escalationLevel: this.determineEscalationLevel(params.severity),
      executiveNotified: params.severity === SeverityLevel.CRITICAL,
      timeline: [
        {
          id: `event_${Date.now()}`,
          timestamp: new Date(),
          eventType: 'detection',
          description: `Crisis detected: ${params.title}`,
          actor: params.detectedBy,
          severity: params.severity
        }
      ],
      internalComms: [],
      externalComms: []
    };

    // Auto-assign response team based on crisis type
    const responsePlan = getResponsePlan(params.type);
    if (responsePlan) {
      crisis.responseTeam = responsePlan.responseTeam.map(t => t.role);
      crisis.currentActions = responsePlan.immediateActions.map(a => a.action);
    }

    this.activeCrises.set(crisis.id, crisis);
    this.updateCommandCenterStatus();

    return crisis;
  }

  /**
   * Create threat alert
   */
  createThreatAlert(params: {
    alertType: ThreatAlert['alertType'];
    severity: SeverityLevel;
    title: string;
    description: string;
    source: string;
    indicators: string[];
    affectedSystems: string[];
    potentialImpact: string;
    confidence: ThreatAlert['confidence'];
  }): ThreatAlert {
    const alert: ThreatAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      alertType: params.alertType,
      severity: params.severity,
      title: params.title,
      description: params.description,
      detectedAt: new Date(),
      source: params.source,
      indicators: params.indicators,
      affectedSystems: params.affectedSystems,
      potentialImpact: params.potentialImpact,
      confidence: params.confidence,
      status: 'new',
      recommendedActions: this.getRecommendedActions(params.alertType, params.severity),
      actionsTaken: []
    };

    this.activeThreatAlerts.set(alert.id, alert);
    this.updateCommandCenterStatus();

    return alert;
  }

  /**
   * Update crisis status
   */
  updateCrisisStatus(crisisId: string, newStatus: CrisisStatus, actor: string): Crisis | null {
    const crisis = this.activeCrises.get(crisisId);
    if (!crisis) return null;

    crisis.status = newStatus;
    crisis.timeline.push({
      id: `event_${Date.now()}`,
      timestamp: new Date(),
      eventType: 'update',
      description: `Status changed to ${newStatus}`,
      actor
    });

    if (newStatus === CrisisStatus.ACKNOWLEDGED) {
      crisis.acknowledgedAt = new Date();
      crisis.acknowledgedBy = actor;
    }

    if (newStatus === CrisisStatus.RESOLVED) {
      crisis.resolvedAt = new Date();
      crisis.resolvedBy = actor;
    }

    this.updateCommandCenterStatus();
    return crisis;
  }

  /**
   * Escalate threat alert to crisis
   */
  escalateToCrisis(alertId: string, actor: string): Crisis | null {
    const alert = this.activeThreatAlerts.get(alertId);
    if (!alert) return null;

    const crisisType = this.mapAlertTypeToCrisisType(alert.alertType);

    const crisis = this.declareCrisis({
      type: crisisType,
      severity: alert.severity,
      title: `Escalated from Alert: ${alert.title}`,
      description: alert.description,
      detectedBy: actor,
      impact: {
        affectedPlatforms: alert.affectedSystems,
        affectedCreators: 0,
        affectedUsers: 0,
        estimatedRevenueLoss: 0,
        reputationRisk: alert.severity === SeverityLevel.CRITICAL ? 'critical' : 'high',
        legalRisk: alert.severity === SeverityLevel.CRITICAL ? 'high' : 'medium'
      }
    });

    alert.status = 'escalated';
    alert.escalatedToCrisis = crisis.id;

    return crisis;
  }

  /**
   * Get command center dashboard data
   */
  getCommandCenterData(): CommandCenter {
    return {
      status: this.commandCenterStatus,
      activeCrises: Array.from(this.activeCrises.values()).filter(
        c => c.status !== CrisisStatus.CLOSED
      ),
      activeThreatAlerts: Array.from(this.activeThreatAlerts.values()).filter(
        a => a.status === 'new' || a.status === 'investigating'
      ),
      metrics: this.getCurrentMetrics(),
      onCallTeams: this.getOnCallTeams(),
      recentActivity: this.getRecentActivity(),
      lastUpdated: new Date()
    };
  }

  /**
   * Get active crises
   */
  getActiveCrises(): Crisis[] {
    return Array.from(this.activeCrises.values()).filter(
      c => c.status !== CrisisStatus.CLOSED
    );
  }

  /**
   * Get crisis by ID
   */
  getCrisis(crisisId: string): Crisis | undefined {
    return this.activeCrises.get(crisisId);
  }

  /**
   * Get threat alerts
   */
  getThreatAlerts(): ThreatAlert[] {
    return Array.from(this.activeThreatAlerts.values());
  }

  // ============================================
  // PRIVATE HELPER METHODS
  // ============================================

  private determineEscalationLevel(severity: SeverityLevel): 1 | 2 | 3 | 4 | 5 {
    switch (severity) {
      case SeverityLevel.CRITICAL:
        return 5;
      case SeverityLevel.HIGH:
        return 4;
      case SeverityLevel.MEDIUM:
        return 3;
      case SeverityLevel.LOW:
        return 2;
      default:
        return 1;
    }
  }

  private updateCommandCenterStatus(): void {
    const activeCrises = this.getActiveCrises();
    const criticalCrises = activeCrises.filter(c => c.severity === SeverityLevel.CRITICAL);
    const highCrises = activeCrises.filter(c => c.severity === SeverityLevel.HIGH);

    if (criticalCrises.length > 0) {
      this.commandCenterStatus = 'critical';
    } else if (highCrises.length > 1 || (highCrises.length === 1 && activeCrises.length > 3)) {
      this.commandCenterStatus = 'crisis';
    } else if (activeCrises.length > 0) {
      this.commandCenterStatus = 'elevated';
    } else {
      this.commandCenterStatus = 'normal';
    }
  }

  private getRecommendedActions(alertType: ThreatAlert['alertType'], severity: SeverityLevel): string[] {
    const actions: string[] = [];

    if (alertType === 'security') {
      actions.push('Review security logs for anomalies');
      actions.push('Check for unauthorized access attempts');
      if (severity === SeverityLevel.CRITICAL || severity === SeverityLevel.HIGH) {
        actions.push('Consider isolating affected systems');
        actions.push('Notify security team immediately');
      }
    }

    if (alertType === 'compliance') {
      actions.push('Review compliance documentation');
      actions.push('Assess regulatory impact');
      if (severity === SeverityLevel.CRITICAL) {
        actions.push('Notify legal counsel');
        actions.push('Prepare regulatory response');
      }
    }

    return actions;
  }

  private mapAlertTypeToCrisisType(alertType: ThreatAlert['alertType']): CrisisType {
    switch (alertType) {
      case 'security':
        return CrisisType.UNAUTHORIZED_ACCESS;
      case 'compliance':
        return CrisisType.REGULATORY_VIOLATION;
      case 'operational':
        return CrisisType.PLATFORM_OUTAGE;
      case 'financial':
        return CrisisType.FRAUD_ATTACK;
      case 'legal':
        return CrisisType.LEGAL_THREAT;
      default:
        return CrisisType.PLATFORM_OUTAGE;
    }
  }

  private getCurrentMetrics(): CommandCenter['metrics'] {
    // In production, these would query real systems
    return {
      platformUptime: {
        'boyfanz': { status: 'operational', uptime: 99.95 },
        'girlfanz': { status: 'operational', uptime: 99.98 },
        'gayfanz': { status: 'operational', uptime: 99.92 }
      },
      securityStatus: {
        threatLevel: SeverityLevel.LOW,
        activeThreats: this.activeThreatAlerts.size,
        blockedAttacks24h: 234,
        vulnerabilitiesDetected: 2
      },
      complianceStatus: {
        pendingVerifications: 45,
        flaggedContent: 12,
        legalHolds: 3,
        regulatoryRequests: 1
      },
      financialHealth: {
        payoutsPending: 1250,
        payoutsFailed: 3,
        fraudAttempts24h: 8,
        chargebacks24h: 15
      },
      creatorSupport: {
        openTickets: 328,
        avgResponseTime: 95,
        escalatedIssues: 12,
        creatorComplaints: 6
      }
    };
  }

  private getOnCallTeams(): CommandCenter['onCallTeams'] {
    return {
      security: ['security-lead@fanz.com', 'security-oncall@fanz.com'],
      compliance: ['compliance-manager@fanz.com'],
      engineering: ['cto@fanz.com', 'eng-oncall@fanz.com'],
      finance: ['cfo@fanz.com', 'finance-lead@fanz.com'],
      legal: ['legal@fanz.com'],
      pr: ['pr@fanz.com'],
      executive: ['ceo@fanz.com', 'cto@fanz.com', 'cfo@fanz.com']
    };
  }

  private getRecentActivity(): CommandCenter['recentActivity'] {
    const activity: CommandCenter['recentActivity'] = [];

    // Add recent crises
    const recentCrises = Array.from(this.activeCrises.values())
      .sort((a, b) => b.detectedAt.getTime() - a.detectedAt.getTime())
      .slice(0, 5);

    for (const crisis of recentCrises) {
      activity.push({
        timestamp: crisis.detectedAt,
        type: 'crisis',
        summary: crisis.title,
        severity: crisis.severity
      });
    }

    // Add recent alerts
    const recentAlerts = Array.from(this.activeThreatAlerts.values())
      .sort((a, b) => b.detectedAt.getTime() - a.detectedAt.getTime())
      .slice(0, 5);

    for (const alert of recentAlerts) {
      activity.push({
        timestamp: alert.detectedAt,
        type: 'alert',
        summary: alert.title,
        severity: alert.severity
      });
    }

    return activity.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 10);
  }
}

// Export singleton instance
export const commandCenter = new CommandCenterService();
