import crypto from "crypto";
import { db } from "../db";
import { biometricProfiles, behavioralSessions } from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";

// 🧠 BEHAVIORAL BIOMETRICS ENGINE - Advanced User Authentication

export interface BiometricData {
  keystrokePattern: number[]; // Timing between keystrokes
  mouseMovement: {
    x: number[];
    y: number[];
    timestamps: number[];
    velocity: number[];
    acceleration: number[];
  };
  scrollBehavior: {
    speed: number[];
    direction: number[];
    frequency: number;
    patterns: string[];
  };
  deviceMetrics: {
    screenResolution: string;
    timezone: string;
    language: string;
    touchSupport: boolean;
    accelerometer?: boolean;
  };
}

export interface BiometricAnalysisResult {
  isAuthentic: boolean;
  confidence: number;
  riskFactors: string[];
  biometricHash: string;
  anomalies: string[];
  recommendedAction: 'allow' | 'challenge' | 'block';
}

export class BiometricsEngine {
  private static readonly CONFIDENCE_THRESHOLD = 0.75;
  private static readonly ANOMALY_THRESHOLD = 0.6;

  // Analyze incoming biometric data against user's profile
  static async analyzeBiometrics(
    userId: string,
    sessionData: BiometricData,
    sessionId: string
  ): Promise<BiometricAnalysisResult> {
    try {
      // Get user's existing biometric profile
      const existingProfile = await db
        .select()
        .from(biometricProfiles)
        .where(and(
          eq(biometricProfiles.userId, userId),
          eq(biometricProfiles.isActive, true)
        ))
        .orderBy(desc(biometricProfiles.updatedAt))
        .limit(1);

      let confidence = 0;
      let riskFactors: string[] = [];
      let anomalies: string[] = [];

      // Generate biometric hash for this session
      const biometricHash = this.generateBiometricHash(sessionData);

      if (existingProfile.length === 0) {
        // First-time user - create initial profile
        confidence = 0.5; // Neutral confidence for new users
        riskFactors.push('new_user_profile');
        
        await this.createInitialProfile(userId, sessionData, biometricHash);
      } else {
        // Analyze against existing profile
        const analysisResult = await this.compareWithProfile(
          existingProfile[0],
          sessionData
        );
        
        confidence = analysisResult.confidence;
        riskFactors = analysisResult.riskFactors;
        anomalies = analysisResult.anomalies;

        // Update profile with new data if confidence is high
        if (confidence > this.CONFIDENCE_THRESHOLD) {
          await this.updateBiometricProfile(existingProfile[0].id, sessionData);
        }
      }

      // Determine recommended action
      const recommendedAction = this.determineAction(confidence, riskFactors);

      // Log behavioral session
      await this.logBehavioralSession(userId, sessionId, {
        biometricScore: confidence,
        anomalyFlags: anomalies,
        riskAssessment: this.getRiskLevel(confidence),
        deviceFingerprint: biometricHash,
      });

      return {
        isAuthentic: confidence > this.CONFIDENCE_THRESHOLD,
        confidence,
        riskFactors,
        biometricHash,
        anomalies,
        recommendedAction,
      };
    } catch (error) {
      console.error('Biometric analysis failed:', error);
      
      // Return safe default
      return {
        isAuthentic: false,
        confidence: 0,
        riskFactors: ['analysis_error'],
        biometricHash: '',
        anomalies: ['system_error'],
        recommendedAction: 'challenge',
      };
    }
  }

  // Generate unique hash for biometric data
  private static generateBiometricHash(data: BiometricData): string {
    const hashInput = JSON.stringify({
      keystroke: this.normalizeKeystrokePattern(data.keystrokePattern),
      mouse: this.normalizeMousePattern(data.mouseMovement),
      scroll: this.normalizeScrollPattern(data.scrollBehavior),
      device: data.deviceMetrics,
    });
    
    return crypto.createHash('sha256').update(hashInput).digest('hex');
  }

  // Create initial biometric profile for new user
  private static async createInitialProfile(
    userId: string,
    sessionData: BiometricData,
    biometricHash: string
  ) {
    try {
      await db.insert(biometricProfiles).values({
        userId,
        keystrokePattern: sessionData.keystrokePattern,
        mouseMovementSignature: JSON.stringify(sessionData.mouseMovement),
        scrollBehavior: sessionData.scrollBehavior,
        sessionFingerprint: crypto.randomUUID(),
        deviceDNA: sessionData.deviceMetrics,
        biometricHash,
        confidence: 0.5,
        isActive: true,
      });
    } catch (error) {
      console.error('Failed to create initial profile:', error);
    }
  }

  // Compare session data with existing profile
  private static async compareWithProfile(
    profile: any,
    sessionData: BiometricData
  ): Promise<{
    confidence: number;
    riskFactors: string[];
    anomalies: string[];
  }> {
    let confidence = 1.0;
    let riskFactors: string[] = [];
    let anomalies: string[] = [];

    // Analyze keystroke patterns
    const keystrokeScore = this.analyzeKeystrokePatterns(
      profile.keystrokePattern,
      sessionData.keystrokePattern
    );
    
    if (keystrokeScore < 0.7) {
      confidence *= 0.8;
      riskFactors.push('keystroke_deviation');
      if (keystrokeScore < 0.4) {
        anomalies.push('significant_keystroke_change');
      }
    }

    // Analyze mouse movement patterns
    const mouseScore = this.analyzeMousePatterns(
      JSON.parse(profile.mouseMovementSignature || '{}'),
      sessionData.mouseMovement
    );
    
    if (mouseScore < 0.7) {
      confidence *= 0.9;
      riskFactors.push('mouse_behavior_deviation');
      if (mouseScore < 0.4) {
        anomalies.push('unusual_mouse_patterns');
      }
    }

    // Analyze scroll behavior
    const scrollScore = this.analyzeScrollBehavior(
      profile.scrollBehavior,
      sessionData.scrollBehavior
    );
    
    if (scrollScore < 0.7) {
      confidence *= 0.95;
      riskFactors.push('scroll_behavior_change');
    }

    // Device consistency check
    const deviceScore = this.analyzeDeviceConsistency(
      profile.deviceDNA,
      sessionData.deviceMetrics
    );
    
    if (deviceScore < 0.8) {
      confidence *= 0.85;
      riskFactors.push('device_inconsistency');
      if (deviceScore < 0.5) {
        anomalies.push('device_change_detected');
      }
    }

    return { confidence, riskFactors, anomalies };
  }

  // Advanced keystroke pattern analysis
  private static analyzeKeystrokePatterns(
    baseline: number[],
    current: number[]
  ): number {
    if (!baseline || !current || baseline.length === 0 || current.length === 0) {
      return 0.5;
    }

    // Calculate statistical similarity
    const baselineStats = this.calculateStats(baseline);
    const currentStats = this.calculateStats(current);
    
    // Compare mean, standard deviation, and rhythm patterns
    const meanDiff = Math.abs(baselineStats.mean - currentStats.mean);
    const stdDiff = Math.abs(baselineStats.std - currentStats.std);
    
    // Normalize scores (lower difference = higher similarity)
    const meanScore = Math.max(0, 1 - (meanDiff / 200));
    const stdScore = Math.max(0, 1 - (stdDiff / 100));
    
    return (meanScore + stdScore) / 2;
  }

  // Advanced mouse movement analysis
  private static analyzeMousePatterns(baseline: any, current: any): number {
    if (!baseline.velocity || !current.velocity) return 0.5;

    // Analyze velocity patterns
    const velocityScore = this.compareArrayPatterns(baseline.velocity, current.velocity);
    
    // Analyze acceleration patterns
    const accelScore = this.compareArrayPatterns(
      baseline.acceleration || [],
      current.acceleration || []
    );
    
    return (velocityScore + accelScore) / 2;
  }

  // Scroll behavior analysis
  private static analyzeScrollBehavior(baseline: any, current: any): number {
    if (!baseline || !current) return 0.5;

    // Compare scroll speed patterns
    const speedScore = this.compareArrayPatterns(baseline.speed || [], current.speed || []);
    
    // Compare frequency patterns
    const freqDiff = Math.abs((baseline.frequency || 0) - (current.frequency || 0));
    const freqScore = Math.max(0, 1 - (freqDiff / 10));
    
    return (speedScore + freqScore) / 2;
  }

  // Device consistency analysis
  private static analyzeDeviceConsistency(baseline: any, current: any): number {
    if (!baseline || !current) return 0.5;
    
    let score = 1.0;
    
    // Screen resolution check
    if (baseline.screenResolution !== current.screenResolution) {
      score *= 0.8;
    }
    
    // Timezone check
    if (baseline.timezone !== current.timezone) {
      score *= 0.9;
    }
    
    // Language check
    if (baseline.language !== current.language) {
      score *= 0.95;
    }
    
    // Touch support check
    if (baseline.touchSupport !== current.touchSupport) {
      score *= 0.9;
    }
    
    return score;
  }

  // Utility functions
  private static calculateStats(arr: number[]): { mean: number; std: number } {
    const mean = arr.reduce((sum, val) => sum + val, 0) / arr.length;
    const variance = arr.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / arr.length;
    
    return {
      mean,
      std: Math.sqrt(variance),
    };
  }

  private static compareArrayPatterns(arr1: number[], arr2: number[]): number {
    if (arr1.length === 0 || arr2.length === 0) return 0.5;
    
    const stats1 = this.calculateStats(arr1);
    const stats2 = this.calculateStats(arr2);
    
    const meanDiff = Math.abs(stats1.mean - stats2.mean);
    const stdDiff = Math.abs(stats1.std - stats2.std);
    
    // Normalize and combine scores
    const meanScore = Math.max(0, 1 - (meanDiff / Math.max(stats1.mean, stats2.mean, 1)));
    const stdScore = Math.max(0, 1 - (stdDiff / Math.max(stats1.std, stats2.std, 1)));
    
    return (meanScore + stdScore) / 2;
  }

  private static normalizeKeystrokePattern(pattern: number[]): number[] {
    if (!pattern || pattern.length === 0) return [];
    
    // Normalize to prevent timing attack
    return pattern.map(timing => Math.round(timing / 10) * 10);
  }

  private static normalizeMousePattern(movement: any): any {
    if (!movement) return {};
    
    return {
      velocity: movement.velocity?.map((v: number) => Math.round(v)),
      acceleration: movement.acceleration?.map((a: number) => Math.round(a)),
    };
  }

  private static normalizeScrollPattern(scroll: any): any {
    if (!scroll) return {};
    
    return {
      frequency: Math.round(scroll.frequency || 0),
      avgSpeed: scroll.speed ? scroll.speed.reduce((a: number, b: number) => a + b, 0) / scroll.speed.length : 0,
    };
  }

  private static determineAction(
    confidence: number,
    riskFactors: string[]
  ): 'allow' | 'challenge' | 'block' {
    // High confidence - allow
    if (confidence > 0.85) return 'allow';
    
    // Very low confidence or critical risk factors - block
    if (confidence < 0.3 || riskFactors.includes('device_change_detected')) {
      return 'block';
    }
    
    // Medium confidence - challenge
    return 'challenge';
  }

  private static getRiskLevel(confidence: number): string {
    if (confidence > 0.8) return 'low';
    if (confidence > 0.6) return 'medium';
    if (confidence > 0.3) return 'high';
    return 'critical';
  }

  private static async updateBiometricProfile(profileId: string, sessionData: BiometricData) {
    try {
      // Adaptive learning - blend new data with existing profile
      await db
        .update(biometricProfiles)
        .set({
          keystrokePattern: sessionData.keystrokePattern,
          mouseMovementSignature: JSON.stringify(sessionData.mouseMovement),
          scrollBehavior: sessionData.scrollBehavior,
          deviceDNA: sessionData.deviceMetrics,
          updatedAt: new Date(),
        })
        .where(eq(biometricProfiles.id, profileId));
    } catch (error) {
      console.error('Failed to update biometric profile:', error);
    }
  }

  private static async logBehavioralSession(
    userId: string,
    sessionId: string,
    sessionData: {
      biometricScore: number;
      anomalyFlags: string[];
      riskAssessment: string;
      deviceFingerprint: string;
    }
  ) {
    try {
      await db.insert(behavioralSessions).values({
        userId,
        sessionId,
        biometricScore: sessionData.biometricScore,
        anomalyFlags: sessionData.anomalyFlags,
        riskAssessment: sessionData.riskAssessment,
        deviceFingerprint: sessionData.deviceFingerprint,
        ipAddress: '', // Will be filled by request handler
        geolocation: {},
        userAgent: '', // Will be filled by request handler
        startedAt: new Date(),
      });
    } catch (error) {
      console.error('Failed to log behavioral session:', error);
    }
  }

  // Real-time continuous authentication
  static async continuousAuthentication(
    userId: string,
    sessionId: string,
    realtimeData: Partial<BiometricData>
  ): Promise<{
    shouldChallenge: boolean;
    riskScore: number;
    anomalies: string[];
  }> {
    // This would run continuously during user session
    // analyzing micro-behaviors and detecting anomalies
    
    const anomalies: string[] = [];
    let riskScore = 0;

    // Check for sudden behavior changes
    if (realtimeData.keystrokePattern) {
      const recentPatterns = realtimeData.keystrokePattern.slice(-10);
      const variance = this.calculateVariance(recentPatterns);
      
      if (variance > 100) { // Threshold for typing pattern change
        anomalies.push('typing_pattern_change');
        riskScore += 0.3;
      }
    }

    // Check for automation/bot behavior
    if (realtimeData.mouseMovement) {
      const movements = realtimeData.mouseMovement;
      if (this.detectAutomatedMovement(movements)) {
        anomalies.push('automated_behavior_detected');
        riskScore += 0.4;
      }
    }

    return {
      shouldChallenge: riskScore > 0.5,
      riskScore,
      anomalies,
    };
  }

  private static calculateVariance(arr: number[]): number {
    if (arr.length < 2) return 0;
    
    const mean = arr.reduce((sum, val) => sum + val, 0) / arr.length;
    return arr.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / arr.length;
  }

  private static detectAutomatedMovement(movement: any): boolean {
    // Detect perfectly straight lines or repetitive patterns
    if (!movement.x || !movement.y) return false;
    
    // Check for unnatural movement patterns
    const velocities = movement.velocity || [];
    const constantVelocityCount = velocities.filter((v: number, i: number) => 
      i > 0 && Math.abs(v - velocities[i-1]) < 1
    ).length;
    
    // If too many constant velocities, likely automated
    return constantVelocityCount / velocities.length > 0.8;
  }
}

// Export types for use in other modules
export type { BiometricData, BiometricAnalysisResult };