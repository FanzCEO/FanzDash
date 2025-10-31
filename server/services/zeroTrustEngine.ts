import { db } from "../db";
import { trustScores, zeroTrustPolicies, users } from "@shared/schema";
import { eq, and, desc, gte, lte } from "drizzle-orm";
import crypto from "crypto";

// 🛡️ ZERO TRUST ARCHITECTURE - Never Trust, Always Verify

export interface TrustAssessment {
  userId: string;
  deviceId: string;
  trustLevel: number; // 0-1 (0 = untrusted, 1 = fully trusted)
  riskFactors: string[];
  microSegment: string;
  allowedResources: string[];
  adaptiveControls: AdaptiveControl[];
  policyViolations: PolicyViolation[];
  continuousMonitoring: boolean;
}

export interface AdaptiveControl {
  type: 'mfa' | 'device_verification' | 'ip_restriction' | 'time_based' | 'geo_fence';
  condition: string;
  action: 'allow' | 'deny' | 'challenge' | 'log';
  parameters: Record<string, any>;
}

export interface PolicyViolation {
  policyId: string;
  violationType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  details: string;
}

export interface ZeroTrustPolicy {
  id: string;
  name: string;
  description: string;
  conditions: PolicyCondition[];
  actions: PolicyAction[];
  priority: number;
  isActive: boolean;
}

export interface PolicyCondition {
  type: 'user_role' | 'device_trust' | 'location' | 'time' | 'behavior' | 'network';
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in_range';
  value: any;
  weight: number; // For weighted policy evaluation
}

export interface PolicyAction {
  type: 'allow' | 'deny' | 'mfa_required' | 'device_verify' | 'log_only' | 'quarantine';
  parameters?: Record<string, any>;
}

export class ZeroTrustEngine {
  private static readonly DEFAULT_TRUST_LEVEL = 0.3; // Start with low trust
  private static readonly HIGH_TRUST_THRESHOLD = 0.8;
  private static readonly LOW_TRUST_THRESHOLD = 0.4;
  
  // Main entry point for trust assessment
  static async assessTrust(
    userId: string,
    deviceId: string,
    context: RequestContext
  ): Promise<TrustAssessment> {
    try {
      // Get current trust score
      const currentTrust = await this.getCurrentTrustScore(userId, deviceId);
      
      // Evaluate all active policies
      const policyResults = await this.evaluateZeroTrustPolicies(userId, deviceId, context);
      
      // Calculate new trust level
      const newTrustLevel = this.calculateTrustLevel(currentTrust, policyResults, context);
      
      // Determine micro-segment
      const microSegment = this.determineMicroSegment(newTrustLevel, context);
      
      // Generate adaptive controls
      const adaptiveControls = this.generateAdaptiveControls(newTrustLevel, policyResults.violations);
      
      // Update trust score in database
      await this.updateTrustScore(userId, deviceId, {
        trustLevel: newTrustLevel,
        riskFactors: policyResults.riskFactors,
        microSegment,
        adaptiveControls,
        violations: policyResults.violations,
      });

      return {
        userId,
        deviceId,
        trustLevel: newTrustLevel,
        riskFactors: policyResults.riskFactors,
        microSegment,
        allowedResources: this.getResourcesForSegment(microSegment),
        adaptiveControls,
        policyViolations: policyResults.violations,
        continuousMonitoring: true,
      };
    } catch (error) {
      console.error('Zero Trust assessment failed:', error);
      
      // Return restrictive default on error
      return {
        userId,
        deviceId,
        trustLevel: 0,
        riskFactors: ['assessment_error'],
        microSegment: 'restricted',
        allowedResources: [],
        adaptiveControls: [{ 
          type: 'mfa', 
          condition: 'always', 
          action: 'challenge',
          parameters: {} 
        }],
        policyViolations: [],
        continuousMonitoring: true,
      };
    }
  }

  // Continuous monitoring and trust adjustment
  static async continuousMonitoring(
    userId: string,
    deviceId: string,
    behaviorData: BehaviorData
  ): Promise<{ trustAdjustment: number; alerts: string[] }> {
    try {
      const alerts: string[] = [];
      let trustAdjustment = 0;

      // Analyze behavior patterns
      const behaviorAnalysis = await this.analyzeBehaviorPatterns(userId, behaviorData);
      
      if (behaviorAnalysis.anomalies.length > 0) {
        trustAdjustment -= 0.1 * behaviorAnalysis.anomalies.length;
        alerts.push(...behaviorAnalysis.anomalies.map(a => `behavior_anomaly_${a}`));
      }

      // Check for privilege escalation attempts
      const privilegeCheck = this.detectPrivilegeEscalation(behaviorData.requestedResources);
      if (privilegeCheck.detected) {
        trustAdjustment -= 0.3;
        alerts.push('privilege_escalation_detected');
      }

      // Analyze network behavior
      const networkAnalysis = this.analyzeNetworkBehavior(behaviorData.networkActivity);
      if (networkAnalysis.suspicious) {
        trustAdjustment -= 0.2;
        alerts.push('suspicious_network_activity');
      }

      // Update trust score if significant change
      if (Math.abs(trustAdjustment) > 0.05) {
        const currentTrust = await this.getCurrentTrustScore(userId, deviceId);
        const newTrust = Math.max(0, Math.min(1, currentTrust.trustLevel + trustAdjustment));
        
        await this.updateTrustScore(userId, deviceId, {
          trustLevel: newTrust,
          riskFactors: alerts,
          microSegment: this.determineMicroSegment(newTrust, {} as RequestContext),
          adaptiveControls: [],
          violations: [],
        });
      }

      return { trustAdjustment, alerts };
    } catch (error) {
      console.error('Continuous monitoring failed:', error);
      return { trustAdjustment: -0.1, alerts: ['monitoring_error'] };
    }
  }

  // Policy engine for zero trust evaluation
  static async evaluateZeroTrustPolicies(
    userId: string,
    deviceId: string,
    context: RequestContext
  ): Promise<{
    allow: boolean;
    riskFactors: string[];
    violations: PolicyViolation[];
    requiredActions: PolicyAction[];
  }> {
    try {
      // Get all active policies
      const policies = await db
        .select()
        .from(zeroTrustPolicies)
        .where(eq(zeroTrustPolicies.isActive, true))
        .orderBy(desc(zeroTrustPolicies.priority));

      let allow = true;
      const riskFactors: string[] = [];
      const violations: PolicyViolation[] = [];
      const requiredActions: PolicyAction[] = [];

      // Evaluate each policy
      for (const policy of policies) {
        const evaluation = await this.evaluateSinglePolicy(policy, userId, deviceId, context);
        
        if (!evaluation.passed) {
          violations.push({
            policyId: policy.id,
            violationType: evaluation.violationType,
            severity: evaluation.severity,
            timestamp: new Date(),
            details: evaluation.details,
          });

          riskFactors.push(...evaluation.riskFactors);
          requiredActions.push(...policy.actions);

          // High priority policy violations can block access
          if (policy.priority > 8 && evaluation.severity === 'critical') {
            allow = false;
          }
        }
      }

      return { allow, riskFactors, violations, requiredActions };
    } catch (error) {
      console.error('Policy evaluation failed:', error);
      return {
        allow: false,
        riskFactors: ['policy_evaluation_error'],
        violations: [],
        requiredActions: [{ type: 'deny' }],
      };
    }
  }

  // Evaluate individual policy
  private static async evaluateSinglePolicy(
    policy: any,
    userId: string,
    deviceId: string,
    context: RequestContext
  ): Promise<{
    passed: boolean;
    violationType: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    riskFactors: string[];
    details: string;
  }> {
    try {
      const conditions = policy.conditions as PolicyCondition[];
      let conditionsMet = 0;
      let totalWeight = 0;
      const riskFactors: string[] = [];

      // Evaluate each condition
      for (const condition of conditions) {
        const met = await this.evaluateCondition(condition, userId, deviceId, context);
        if (met) {
          conditionsMet += condition.weight;
        } else {
          riskFactors.push(`${condition.type}_failed`);
        }
        totalWeight += condition.weight;
      }

      // Policy passes if weighted conditions meet threshold (typically 70%)
      const passThreshold = 0.7;
      const score = totalWeight > 0 ? conditionsMet / totalWeight : 0;
      const passed = score >= passThreshold;

      // Determine severity based on score
      let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
      if (score < 0.3) severity = 'critical';
      else if (score < 0.5) severity = 'high';
      else if (score < 0.7) severity = 'medium';

      return {
        passed,
        violationType: policy.name,
        severity,
        riskFactors,
        details: `Policy ${policy.name} evaluation: ${Math.round(score * 100)}% conditions met`,
      };
    } catch (error) {
      console.error(`Policy evaluation error for ${policy.name}:`, error);
      return {
        passed: false,
        violationType: 'evaluation_error',
        severity: 'high',
        riskFactors: ['policy_evaluation_error'],
        details: `Failed to evaluate policy ${policy.name}`,
      };
    }
  }

  // Evaluate individual condition
  private static async evaluateCondition(
    condition: PolicyCondition,
    userId: string,
    deviceId: string,
    context: RequestContext
  ): Promise<boolean> {
    try {
      let actualValue: any;

      // Get the actual value based on condition type
      switch (condition.type) {
        case 'user_role':
          const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
          actualValue = user[0]?.role;
          break;
        
        case 'device_trust':
          const trust = await this.getCurrentTrustScore(userId, deviceId);
          actualValue = trust.trustLevel;
          break;
        
        case 'location':
          actualValue = context.location?.country;
          break;
        
        case 'time':
          actualValue = new Date().getHours();
          break;
        
        case 'behavior':
          actualValue = context.behaviorScore || 0.5;
          break;
        
        case 'network':
          actualValue = context.networkRisk || 0;
          break;
        
        default:
          return false;
      }

      // Evaluate condition based on operator
      return this.evaluateOperator(condition.operator, actualValue, condition.value);
    } catch (error) {
      console.error('Condition evaluation failed:', error);
      return false;
    }
  }

  // Evaluate operator logic
  private static evaluateOperator(operator: string, actual: any, expected: any): boolean {
    switch (operator) {
      case 'equals':
        return actual === expected;
      case 'not_equals':
        return actual !== expected;
      case 'greater_than':
        return Number(actual) > Number(expected);
      case 'less_than':
        return Number(actual) < Number(expected);
      case 'contains':
        return String(actual).includes(String(expected));
      case 'in_range':
        const [min, max] = expected;
        const value = Number(actual);
        return value >= min && value <= max;
      default:
        return false;
    }
  }

  // Calculate new trust level based on multiple factors
  private static calculateTrustLevel(
    currentTrust: any,
    policyResults: any,
    context: RequestContext
  ): number {
    let trustLevel = currentTrust?.trustLevel || this.DEFAULT_TRUST_LEVEL;
    
    // Adjust based on policy violations
    const criticalViolations = policyResults.violations.filter((v: any) => v.severity === 'critical').length;
    const highViolations = policyResults.violations.filter((v: any) => v.severity === 'high').length;
    
    trustLevel -= (criticalViolations * 0.3) + (highViolations * 0.15);
    
    // Adjust based on behavior
    if (context.behaviorScore) {
      trustLevel = (trustLevel * 0.7) + (context.behaviorScore * 0.3);
    }
    
    // Network risk adjustment
    if (context.networkRisk && context.networkRisk > 0.5) {
      trustLevel -= 0.1;
    }
    
    // Time-based trust decay (lower trust for inactive users)
    const hoursSinceLastActivity = context.hoursSinceLastActivity || 0;
    if (hoursSinceLastActivity > 24) {
      trustLevel *= 0.9; // 10% decay per day
    }
    
    return Math.max(0, Math.min(1, trustLevel));
  }

  // Determine micro-segment based on trust level and context
  private static determineMicroSegment(trustLevel: number, context: RequestContext): string {
    if (trustLevel >= 0.9) return 'high_trust';
    if (trustLevel >= 0.7) return 'standard';
    if (trustLevel >= 0.4) return 'limited';
    if (trustLevel >= 0.2) return 'restricted';
    return 'quarantine';
  }

  // Generate adaptive controls based on trust and violations
  private static generateAdaptiveControls(
    trustLevel: number,
    violations: PolicyViolation[]
  ): AdaptiveControl[] {
    const controls: AdaptiveControl[] = [];
    
    // Low trust requires MFA
    if (trustLevel < this.LOW_TRUST_THRESHOLD) {
      controls.push({
        type: 'mfa',
        condition: 'every_request',
        action: 'challenge',
        parameters: { methods: ['totp', 'sms', 'biometric'] },
      });
    }
    
    // Device verification for new devices
    if (violations.some(v => v.violationType.includes('device'))) {
      controls.push({
        type: 'device_verification',
        condition: 'new_device',
        action: 'challenge',
        parameters: { verification_method: 'email' },
      });
    }
    
    // IP restrictions for suspicious networks
    if (violations.some(v => v.violationType.includes('network'))) {
      controls.push({
        type: 'ip_restriction',
        condition: 'untrusted_network',
        action: 'deny',
        parameters: { allowed_ranges: [] },
      });
    }
    
    return controls;
  }

  // Get allowed resources for micro-segment
  private static getResourcesForSegment(segment: string): string[] {
    const resourceMap: Record<string, string[]> = {
      'high_trust': ['*'], // All resources
      'standard': ['dashboard', 'profile', 'content', 'analytics'],
      'limited': ['dashboard', 'profile'],
      'restricted': ['profile'],
      'quarantine': [],
    };
    
    return resourceMap[segment] || [];
  }

  // Database operations
  private static async getCurrentTrustScore(userId: string, deviceId: string): Promise<any> {
    try {
      const result = await db
        .select()
        .from(trustScores)
        .where(and(
          eq(trustScores.userId, userId),
          eq(trustScores.deviceId, deviceId)
        ))
        .orderBy(desc(trustScores.updatedAt))
        .limit(1);
      
      return result[0] || { trustLevel: this.DEFAULT_TRUST_LEVEL };
    } catch (error) {
      console.error('Failed to get trust score:', error);
      return { trustLevel: this.DEFAULT_TRUST_LEVEL };
    }
  }

  private static async updateTrustScore(
    userId: string,
    deviceId: string,
    data: {
      trustLevel: number;
      riskFactors: string[];
      microSegment: string;
      adaptiveControls: AdaptiveControl[];
      violations: PolicyViolation[];
    }
  ) {
    try {
      // Check if record exists
      const existing = await this.getCurrentTrustScore(userId, deviceId);
      
      if (existing.id) {
        // Update existing
        await db
          .update(trustScores)
          .set({
            trustLevel: data.trustLevel,
            riskFactors: data.riskFactors,
            microSegmentId: data.microSegment,
            adaptiveControls: data.adaptiveControls,
            policyViolations: data.violations.length,
            lastVerification: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(trustScores.id, existing.id));
      } else {
        // Create new
        await db.insert(trustScores).values({
          userId,
          deviceId,
          trustLevel: data.trustLevel,
          riskFactors: data.riskFactors,
          microSegmentId: data.microSegment,
          adaptiveControls: data.adaptiveControls,
          policyViolations: data.violations.length,
          lastVerification: new Date(),
          continuousMonitoring: true,
        });
      }
    } catch (error) {
      console.error('Failed to update trust score:', error);
    }
  }

  // Behavior analysis methods
  private static async analyzeBehaviorPatterns(
    userId: string,
    behaviorData: BehaviorData
  ): Promise<{ anomalies: string[]; score: number }> {
    // Analyze user behavior for anomalies
    const anomalies: string[] = [];
    
    // Check for unusual access patterns
    if (behaviorData.accessTimes && this.detectUnusualAccessTimes(behaviorData.accessTimes)) {
      anomalies.push('unusual_access_times');
    }
    
    // Check for resource access anomalies
    if (behaviorData.resourceAccess && this.detectResourceAccessAnomalies(behaviorData.resourceAccess)) {
      anomalies.push('unusual_resource_access');
    }
    
    const score = Math.max(0, 1 - (anomalies.length * 0.2));
    return { anomalies, score };
  }

  private static detectPrivilegeEscalation(requestedResources: string[] = []): { detected: boolean; severity: string } {
    // Check for attempts to access higher-privilege resources
    const highPrivilegeResources = ['admin', 'system', 'security', 'users'];
    const detected = requestedResources.some(resource => 
      highPrivilegeResources.some(priv => resource.includes(priv))
    );
    
    return {
      detected,
      severity: detected ? 'high' : 'low',
    };
  }

  private static analyzeNetworkBehavior(networkActivity: any = {}): { suspicious: boolean; reasons: string[] } {
    const reasons: string[] = [];
    let suspicious = false;
    
    // Check for suspicious IP patterns
    if (networkActivity.newLocation) {
      reasons.push('new_geographic_location');
      suspicious = true;
    }
    
    if (networkActivity.vpnDetected) {
      reasons.push('vpn_usage_detected');
    }
    
    if (networkActivity.torUsage) {
      reasons.push('tor_network_usage');
      suspicious = true;
    }
    
    return { suspicious, reasons };
  }

  private static detectUnusualAccessTimes(accessTimes: number[]): boolean {
    // Check if access times are outside normal patterns
    const nightHours = accessTimes.filter(hour => hour < 6 || hour > 23).length;
    return nightHours / accessTimes.length > 0.5;
  }

  private static detectResourceAccessAnomalies(resourceAccess: string[]): boolean {
    // Simplified anomaly detection for resource access
    return resourceAccess.some(resource => resource.includes('admin') || resource.includes('system'));
  }

  // Public API methods
  static async createPolicy(policyData: Partial<ZeroTrustPolicy>): Promise<string> {
    try {
      const result = await db.insert(zeroTrustPolicies).values({
        name: policyData.name!,
        description: policyData.description || '',
        conditions: policyData.conditions || [],
        actions: policyData.actions || [],
        priority: policyData.priority || 1,
        isActive: policyData.isActive ?? true,
        createdBy: '', // Will be filled by request handler
      }).returning();
      
      return result[0].id;
    } catch (error) {
      console.error('Failed to create policy:', error);
      throw error;
    }
  }

  static async getPolicies(): Promise<any[]> {
    try {
      return await db
        .select()
        .from(zeroTrustPolicies)
        .orderBy(desc(zeroTrustPolicies.priority));
    } catch (error) {
      console.error('Failed to get policies:', error);
      return [];
    }
  }

  static async getTrustHistory(userId: string, deviceId: string): Promise<any[]> {
    try {
      return await db
        .select()
        .from(trustScores)
        .where(and(
          eq(trustScores.userId, userId),
          eq(trustScores.deviceId, deviceId)
        ))
        .orderBy(desc(trustScores.updatedAt))
        .limit(50);
    } catch (error) {
      console.error('Failed to get trust history:', error);
      return [];
    }
  }
}

// Supporting interfaces
export interface RequestContext {
  ipAddress: string;
  userAgent: string;
  location?: {
    country: string;
    city: string;
    coordinates: { lat: number; lng: number };
  };
  networkRisk?: number;
  behaviorScore?: number;
  hoursSinceLastActivity?: number;
  requestedResource: string;
}

export interface BehaviorData {
  accessTimes: number[];
  resourceAccess: string[];
  requestedResources: string[];
  networkActivity: {
    newLocation?: boolean;
    vpnDetected?: boolean;
    torUsage?: boolean;
  };
}

// Export types
export type { TrustAssessment, ZeroTrustPolicy, AdaptiveControl, PolicyViolation };