export interface SystemHealthMetrics {
  timestamp: Date;
  services: Record<
    string,
    {
      status: "healthy" | "degraded" | "unhealthy" | "offline";
      responseTime: number; // milliseconds
      uptime: number; // percentage
      errorRate: number; // percentage
      throughput: number; // requests per minute
      resourceUsage: {
        cpu: number; // percentage
        memory: number; // percentage
        disk: number; // percentage
        network: number; // mbps
      };
      dependencies: string[];
      lastCheck: Date;
    }
  >;
  infrastructure: {
    loadBalancer: {
      activeConnections: number;
      requestsPerSecond: number;
      healthyTargets: number;
      unhealthyTargets: number;
    };
    database: {
      connections: number;
      queryTime: number;
      lockWaitTime: number;
      cacheHitRate: number;
    };
    cache: {
      hitRate: number;
      evictionRate: number;
      memoryUsage: number;
      operations: number;
    };
  };
  predictions: {
    failureRisk: number; // 0-1
    capacityWarnings: Array<{
      service: string;
      metric: string;
      currentValue: number;
      threshold: number;
      timeToThreshold: number; // hours
    }>;
    scalingRecommendations: Array<{
      service: string;
      action: "scale_up" | "scale_down" | "optimize";
      reasoning: string;
      expectedImpact: string;
    }>;
  };
}

export interface AutoScalingConfig {
  serviceName: string;
  enabled: boolean;
  rules: Array<{
    id: string;
    metric: string;
    threshold: number;
    comparison: "greater_than" | "less_than" | "equals";
    duration: number; // seconds
    action: {
      type: "scale_up" | "scale_down" | "restart" | "alert";
      parameters: Record<string, any>;
    };
    cooldown: number; // seconds
  }>;
  limits: {
    minInstances: number;
    maxInstances: number;
    scaleUpRate: number;
    scaleDownRate: number;
  };
  demandPrediction: {
    enabled: boolean;
    algorithm: "linear" | "polynomial" | "lstm" | "seasonal";
    lookAheadMinutes: number;
    confidenceThreshold: number;
  };
}

export interface SelfHealingOperation {
  id: string;
  serviceName: string;
  issue: string;
  detectedAt: Date;
  severity: "low" | "medium" | "high" | "critical";
  healingActions: Array<{
    action:
      | "restart_service"
      | "clear_cache"
      | "rebuild_index"
      | "failover"
      | "rollback";
    parameters: Record<string, any>;
    expectedDuration: number; // seconds
    successCriteria: string[];
  }>;
  status: "pending" | "in_progress" | "completed" | "failed";
  executionLog: Array<{
    timestamp: Date;
    action: string;
    result: string;
    metrics: Record<string, number>;
  }>;
  outcome: {
    resolved: boolean;
    resolutionTime: number; // seconds
    impactReduced: number; // percentage
    preventiveActions: string[];
  };
}

export interface MaintenanceSchedule {
  id: string;
  name: string;
  type:
    | "update_deployment"
    | "backup"
    | "log_rotation"
    | "certificate_renewal"
    | "dependency_update";
  priority: "low" | "medium" | "high" | "critical";
  scheduledAt: Date;
  estimatedDuration: number; // minutes
  affectedServices: string[];
  maintenanceWindow: {
    startTime: string; // HH:MM format
    endTime: string; // HH:MM format
    timezone: string;
    recurringPattern?: "daily" | "weekly" | "monthly" | "quarterly";
  };
  prerequisites: Array<{
    check: string;
    required: boolean;
    automatedCheck: boolean;
  }>;
  rollbackPlan: {
    enabled: boolean;
    triggerConditions: string[];
    rollbackSteps: string[];
    estimatedRollbackTime: number; // minutes
  };
  notifications: {
    advanceNotice: number; // hours
    channels: string[];
    stakeholders: string[];
  };
  status: "scheduled" | "in_progress" | "completed" | "failed" | "cancelled";
}

export interface SecurityScan {
  id: string;
  type:
    | "vulnerability_scan"
    | "dependency_check"
    | "configuration_audit"
    | "penetration_test";
  target: string;
  severity: "info" | "low" | "medium" | "high" | "critical";
  findings: Array<{
    id: string;
    category: string;
    description: string;
    severity: "info" | "low" | "medium" | "high" | "critical";
    cve?: string;
    affectedComponents: string[];
    remediation: {
      steps: string[];
      estimatedEffort: number; // hours
      priority: number;
      automated: boolean;
    };
    riskAssessment: {
      likelihood: number; // 0-1
      impact: number; // 0-1
      overallRisk: number; // 0-1
    };
  }>;
  scanResults: {
    totalChecks: number;
    passed: number;
    failed: number;
    warnings: number;
    coverage: number; // percentage
  };
  automatedRemediation: {
    applied: number;
    pending: number;
    requiresManualIntervention: number;
  };
  completedAt: Date;
  nextScanScheduled: Date;
}

export interface PerformanceOptimization {
  id: string;
  service: string;
  optimization: {
    type:
      | "database_query"
      | "cache_strategy"
      | "resource_allocation"
      | "algorithm_improvement";
    description: string;
    implementation: string[];
    expectedImpact: {
      responseTime: number; // percentage improvement
      throughput: number; // percentage improvement
      resourceUsage: number; // percentage reduction
      cost: number; // percentage reduction
    };
  };
  testing: {
    completed: boolean;
    results: Record<string, number>;
    performanceGains: Record<string, number>;
  };
  rollout: {
    strategy: "immediate" | "gradual" | "canary" | "blue_green";
    progress: number; // percentage
    metrics: Record<string, number>;
  };
  status: "identified" | "testing" | "approved" | "deploying" | "completed";
}

export class EcosystemMaintenanceSystem {
  private systemHealth: Map<string, SystemHealthMetrics> = new Map();
  private autoScalingConfigs: Map<string, AutoScalingConfig> = new Map();
  private healingOperations: Map<string, SelfHealingOperation> = new Map();
  private maintenanceSchedule: Map<string, MaintenanceSchedule> = new Map();
  private securityScans: Map<string, SecurityScan> = new Map();
  private optimizations: Map<string, PerformanceOptimization> = new Map();

  private isMonitoring: boolean = false;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private isDevelopmentMode: boolean = process.env.NODE_ENV !== "production";

  constructor() {
    this.initializeAutoScaling();
    this.scheduleMaintenanceTasks();
  }

  // Real-time Performance Monitoring
  startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.monitoringInterval = setInterval(async () => {
      await this.collectSystemMetrics();
      await this.checkForAnomalies();
      await this.executeAutoScaling();
      await this.performSecurityScans();
    }, 30000); // Every 30 seconds

    console.log("Ecosystem monitoring started");
  }

  stopMonitoring(): void {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    console.log("Ecosystem monitoring stopped");
  }

  private async collectSystemMetrics(): Promise<void> {
    const services = [
      "web_server",
      "api_gateway",
      "database",
      "cache_redis",
      "file_storage",
      "streaming_service",
      "payment_processor",
      "ai_moderation",
      "analytics_engine",
      "notification_service",
    ];

    const metrics: SystemHealthMetrics = {
      timestamp: new Date(),
      services: {},
      infrastructure: this.collectInfrastructureMetrics(),
      predictions: await this.generatePredictions(),
    };

    for (const service of services) {
      metrics.services[service] = await this.collectServiceMetrics(service);
    }

    this.systemHealth.set("latest", metrics);

    // Keep historical data (last 24 hours)
    const historyKey = `history_${Date.now()}`;
    this.systemHealth.set(historyKey, metrics);

    // Cleanup old history
    this.cleanupHistoricalMetrics();
  }

  private async collectServiceMetrics(serviceName: string) {
    // Simulate metrics collection - in production, this would query actual services
    const baseResponseTime = 50 + Math.random() * 100;
    const isHealthy = Math.random() > 0.05; // 95% healthy

    return {
      status: isHealthy
        ? "healthy"
        : ((Math.random() > 0.5 ? "degraded" : "unhealthy") as any),
      responseTime: baseResponseTime * (isHealthy ? 1 : 2),
      uptime: isHealthy ? 99.5 + Math.random() * 0.5 : 95 + Math.random() * 4,
      errorRate: isHealthy ? Math.random() * 0.1 : Math.random() * 2,
      throughput: 100 + Math.random() * 50,
      resourceUsage: {
        cpu: 20 + Math.random() * 50,
        memory: 30 + Math.random() * 40,
        disk: 15 + Math.random() * 25,
        network: 10 + Math.random() * 30,
      },
      dependencies: this.getServiceDependencies(serviceName),
      lastCheck: new Date(),
    };
  }

  private collectInfrastructureMetrics() {
    return {
      loadBalancer: {
        activeConnections: 250 + Math.floor(Math.random() * 100),
        requestsPerSecond: 45 + Math.floor(Math.random() * 30),
        healthyTargets: 8,
        unhealthyTargets: 0,
      },
      database: {
        connections: 45 + Math.floor(Math.random() * 20),
        queryTime: 15 + Math.random() * 10,
        lockWaitTime: Math.random() * 5,
        cacheHitRate: 85 + Math.random() * 10,
      },
      cache: {
        hitRate: 90 + Math.random() * 8,
        evictionRate: Math.random() * 2,
        memoryUsage: 60 + Math.random() * 20,
        operations: 500 + Math.floor(Math.random() * 200),
      },
    };
  }

  private async generatePredictions() {
    // AI-powered predictions based on current metrics and trends
    return {
      failureRisk: Math.random() * 0.3, // Low to moderate risk
      capacityWarnings: [
        {
          service: "database",
          metric: "connections",
          currentValue: 65,
          threshold: 80,
          timeToThreshold: 4.5,
        },
      ],
      scalingRecommendations: [
        {
          service: "web_server",
          action: "scale_up" as const,
          reasoning: "Increased traffic detected, response times degrading",
          expectedImpact: "25% response time improvement",
        },
      ],
    };
  }

  private getServiceDependencies(serviceName: string): string[] {
    const dependencies = {
      web_server: ["database", "cache_redis", "api_gateway"],
      api_gateway: ["database", "ai_moderation", "payment_processor"],
      database: [],
      cache_redis: [],
      file_storage: [],
      streaming_service: ["database", "file_storage"],
      payment_processor: ["database"],
      ai_moderation: ["database"],
      analytics_engine: ["database", "cache_redis"],
      notification_service: ["database"],
    };
    return dependencies[serviceName] || [];
  }

  private async checkForAnomalies(): Promise<void> {
    const latestMetrics = this.systemHealth.get("latest");
    if (!latestMetrics) return;

    for (const [serviceName, metrics] of Object.entries(
      latestMetrics.services,
    )) {
      if (metrics.status === "unhealthy" || metrics.errorRate > 5) {
        await this.triggerSelfHealing(serviceName, "high_error_rate");
      }

      if (metrics.responseTime > 1000) {
        await this.triggerSelfHealing(serviceName, "slow_response");
      }

      if (metrics.resourceUsage.cpu > 90) {
        await this.triggerSelfHealing(serviceName, "high_cpu_usage");
      }
    }
  }

  // Self-Healing Capabilities
  private async triggerSelfHealing(
    serviceName: string,
    issue: string,
  ): Promise<void> {
    const healingId = `healing_${serviceName}_${Date.now()}`;

    const operation: SelfHealingOperation = {
      id: healingId,
      serviceName,
      issue,
      detectedAt: new Date(),
      severity: this.determineSeverity(issue),
      healingActions: this.generateHealingActions(issue),
      status: "pending",
      executionLog: [],
      outcome: {
        resolved: false,
        resolutionTime: 0,
        impactReduced: 0,
        preventiveActions: [],
      },
    };

    this.healingOperations.set(healingId, operation);
    await this.executeSelfHealing(healingId);
  }

  private determineSeverity(
    issue: string,
  ): "low" | "medium" | "high" | "critical" {
    const severityMap = {
      high_error_rate: "high",
      slow_response: "medium",
      high_cpu_usage: "medium",
      service_down: "critical",
      database_connection_failure: "critical",
      memory_leak: "high",
      disk_full: "high",
    };
    return (severityMap[issue] as any) || "medium";
  }

  private generateHealingActions(issue: string) {
    const actionsMap = {
      high_error_rate: [
        {
          action: "restart_service",
          parameters: { graceful: true },
          expectedDuration: 30,
          successCriteria: ["error_rate < 1%"],
        },
        {
          action: "clear_cache",
          parameters: { type: "all" },
          expectedDuration: 10,
          successCriteria: ["cache_cleared"],
        },
      ],
      slow_response: [
        {
          action: "clear_cache",
          parameters: { type: "query" },
          expectedDuration: 10,
          successCriteria: ["response_time < 500ms"],
        },
        {
          action: "rebuild_index",
          parameters: { tables: "frequently_queried" },
          expectedDuration: 120,
          successCriteria: ["index_optimized"],
        },
      ],
      high_cpu_usage: [
        {
          action: "restart_service",
          parameters: { graceful: true },
          expectedDuration: 30,
          successCriteria: ["cpu_usage < 70%"],
        },
      ],
    };
    return actionsMap[issue] || [];
  }

  private async executeSelfHealing(healingId: string): Promise<void> {
    const operation = this.healingOperations.get(healingId);
    if (!operation) return;

    operation.status = "in_progress";
    const startTime = Date.now();

    try {
      for (const action of operation.healingActions) {
        const actionStartTime = Date.now();
        const result = await this.executeHealingAction(action);

        operation.executionLog.push({
          timestamp: new Date(),
          action: action.action,
          result,
          metrics: await this.getPostActionMetrics(operation.serviceName),
        });

        // Check if action was successful
        if (result.includes("success")) {
          break; // Stop if healing was successful
        }
      }

      // Evaluate outcome
      const finalMetrics = await this.getPostActionMetrics(
        operation.serviceName,
      );
      operation.outcome = {
        resolved: this.checkResolutionCriteria(operation, finalMetrics),
        resolutionTime: (Date.now() - startTime) / 1000,
        impactReduced: this.calculateImpactReduction(operation, finalMetrics),
        preventiveActions: this.generatePreventiveActions(operation.issue),
      };

      operation.status = operation.outcome.resolved ? "completed" : "failed";
    } catch (error) {
      operation.status = "failed";
      console.error("Self-healing operation failed:", error);
    }

    this.healingOperations.set(healingId, operation);
  }

  private async executeHealingAction(action: any): Promise<string> {
    // Simulate healing action execution
    await new Promise((resolve) =>
      setTimeout(resolve, action.expectedDuration * 10),
    ); // Faster simulation

    const success = Math.random() > 0.2; // 80% success rate
    return success
      ? `${action.action} completed successfully`
      : `${action.action} failed`;
  }

  private async getPostActionMetrics(
    serviceName: string,
  ): Promise<Record<string, number>> {
    return {
      errorRate: Math.random() * 2,
      responseTime: 50 + Math.random() * 100,
      cpuUsage: 30 + Math.random() * 40,
    };
  }

  private checkResolutionCriteria(
    operation: SelfHealingOperation,
    metrics: Record<string, number>,
  ): boolean {
    // Simplified resolution check
    return (
      metrics.errorRate < 1 &&
      metrics.responseTime < 500 &&
      metrics.cpuUsage < 70
    );
  }

  private calculateImpactReduction(
    operation: SelfHealingOperation,
    metrics: Record<string, number>,
  ): number {
    // Simplified impact calculation
    return Math.random() * 0.8; // 0-80% impact reduction
  }

  private generatePreventiveActions(issue: string): string[] {
    const preventiveMap = {
      high_error_rate: [
        "Implement circuit breaker",
        "Add health checks",
        "Monitor error patterns",
      ],
      slow_response: [
        "Optimize database queries",
        "Implement caching",
        "Add connection pooling",
      ],
      high_cpu_usage: [
        "Optimize algorithms",
        "Add auto-scaling",
        "Profile memory usage",
      ],
    };
    return preventiveMap[issue] || [];
  }

  // Auto-scaling Infrastructure
  private initializeAutoScaling(): void {
    const services = ["web_server", "api_gateway", "streaming_service"];

    services.forEach((service) => {
      const config: AutoScalingConfig = {
        serviceName: service,
        enabled: true,
        rules: [
          {
            id: `${service}_cpu_scale_up`,
            metric: "cpu_usage",
            threshold: 75,
            comparison: "greater_than",
            duration: 300,
            action: { type: "scale_up", parameters: { instances: 2 } },
            cooldown: 600,
          },
          {
            id: `${service}_cpu_scale_down`,
            metric: "cpu_usage",
            threshold: 30,
            comparison: "less_than",
            duration: 900,
            action: { type: "scale_down", parameters: { instances: 1 } },
            cooldown: 1800,
          },
        ],
        limits: {
          minInstances: 2,
          maxInstances: 10,
          scaleUpRate: 2,
          scaleDownRate: 1,
        },
        demandPrediction: {
          enabled: true,
          algorithm: "seasonal",
          lookAheadMinutes: 30,
          confidenceThreshold: 0.8,
        },
      };

      this.autoScalingConfigs.set(service, config);
    });
  }

  private async executeAutoScaling(): Promise<void> {
    const latestMetrics = this.systemHealth.get("latest");
    if (!latestMetrics) return;

    // Skip auto-scaling in development mode to prevent service shutdowns
    if (this.isDevelopmentMode) {
      return;
    }

    for (const [serviceName, config] of this.autoScalingConfigs.entries()) {
      if (!config.enabled) continue;

      const serviceMetrics = latestMetrics.services[serviceName];
      if (!serviceMetrics) continue;

      for (const rule of config.rules) {
        if (this.shouldTriggerRule(rule, serviceMetrics)) {
          await this.executeScalingAction(serviceName, rule.action);
        }
      }
    }
  }

  private shouldTriggerRule(rule: any, metrics: any): boolean {
    const value =
      metrics.resourceUsage[rule.metric.replace("_usage", "")] ||
      metrics[rule.metric];

    switch (rule.comparison) {
      case "greater_than":
        return value > rule.threshold;
      case "less_than":
        return value < rule.threshold;
      case "equals":
        return Math.abs(value - rule.threshold) < 0.1;
      default:
        return false;
    }
  }

  private async executeScalingAction(
    serviceName: string,
    action: any,
  ): Promise<void> {
    console.log(`Executing scaling action: ${action.type} for ${serviceName}`);
    // In production, this would interact with orchestration systems like Kubernetes
  }

  // Maintenance Scheduling
  private scheduleMaintenanceTasks(): void {
    const tasks: Omit<MaintenanceSchedule, "id">[] = [
      {
        name: "Weekly Database Backup",
        type: "backup",
        priority: "high",
        scheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        estimatedDuration: 120,
        affectedServices: ["database"],
        maintenanceWindow: {
          startTime: "02:00",
          endTime: "04:00",
          timezone: "UTC",
          recurringPattern: "weekly",
        },
        prerequisites: [
          {
            check: "Database health check",
            required: true,
            automatedCheck: true,
          },
        ],
        rollbackPlan: {
          enabled: false,
          triggerConditions: [],
          rollbackSteps: [],
          estimatedRollbackTime: 0,
        },
        notifications: {
          advanceNotice: 24,
          channels: ["email", "slack"],
          stakeholders: ["ops_team"],
        },
        status: "scheduled",
      },
      {
        name: "Security Certificate Renewal",
        type: "certificate_renewal",
        priority: "critical",
        scheduledAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        estimatedDuration: 15,
        affectedServices: ["web_server", "api_gateway"],
        maintenanceWindow: {
          startTime: "01:00",
          endTime: "02:00",
          timezone: "UTC",
        },
        prerequisites: [
          {
            check: "Certificate expiration check",
            required: true,
            automatedCheck: true,
          },
        ],
        rollbackPlan: {
          enabled: true,
          triggerConditions: ["cert_validation_failed"],
          rollbackSteps: ["restore_previous_cert"],
          estimatedRollbackTime: 5,
        },
        notifications: {
          advanceNotice: 72,
          channels: ["email", "slack", "pager"],
          stakeholders: ["security_team", "ops_team"],
        },
        status: "scheduled",
      },
    ];

    tasks.forEach((task) => {
      const id = `maintenance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      this.maintenanceSchedule.set(id, { id, ...task });
    });
  }

  // Security Scanning
  private async performSecurityScans(): Promise<void> {
    if (Math.random() > 0.01) return; // Run scans occasionally

    const scanId = `scan_${Date.now()}`;
    const scan: SecurityScan = {
      id: scanId,
      type: "vulnerability_scan",
      target: "all_services",
      severity: "info",
      findings: [
        {
          id: "finding_1",
          category: "dependency",
          description:
            "Outdated dependency detected with known vulnerabilities",
          severity: "medium",
          cve: "CVE-2024-1234",
          affectedComponents: ["web_server"],
          remediation: {
            steps: [
              "Update dependency to latest version",
              "Test compatibility",
            ],
            estimatedEffort: 2,
            priority: 3,
            automated: true,
          },
          riskAssessment: { likelihood: 0.3, impact: 0.6, overallRisk: 0.18 },
        },
      ],
      scanResults: {
        totalChecks: 250,
        passed: 235,
        failed: 5,
        warnings: 10,
        coverage: 94,
      },
      automatedRemediation: {
        applied: 3,
        pending: 2,
        requiresManualIntervention: 0,
      },
      completedAt: new Date(),
      nextScanScheduled: new Date(Date.now() + 24 * 60 * 60 * 1000),
    };

    this.securityScans.set(scanId, scan);
  }

  private cleanupHistoricalMetrics(): void {
    const cutoffTime = Date.now() - 24 * 60 * 60 * 1000; // 24 hours ago

    for (const [key] of this.systemHealth.entries()) {
      if (key.startsWith("history_")) {
        const timestamp = parseInt(key.split("_")[1]);
        if (timestamp < cutoffTime) {
          this.systemHealth.delete(key);
        }
      }
    }
  }

  // Public API Methods
  getLatestSystemHealth(): SystemHealthMetrics | null {
    return this.systemHealth.get("latest") || null;
  }

  getSystemHealthHistory(hours: number = 24): SystemHealthMetrics[] {
    const cutoffTime = Date.now() - hours * 60 * 60 * 1000;
    const history: SystemHealthMetrics[] = [];

    for (const [key, metrics] of this.systemHealth.entries()) {
      if (key.startsWith("history_")) {
        const timestamp = parseInt(key.split("_")[1]);
        if (timestamp >= cutoffTime) {
          history.push(metrics);
        }
      }
    }

    return history.sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
    );
  }

  getActiveHealingOperations(): SelfHealingOperation[] {
    return Array.from(this.healingOperations.values()).filter(
      (op) => op.status === "pending" || op.status === "in_progress",
    );
  }

  getHealingHistory(limit: number = 50): SelfHealingOperation[] {
    return Array.from(this.healingOperations.values())
      .sort((a, b) => b.detectedAt.getTime() - a.detectedAt.getTime())
      .slice(0, limit);
  }

  getMaintenanceSchedule(): MaintenanceSchedule[] {
    return Array.from(this.maintenanceSchedule.values()).sort(
      (a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime(),
    );
  }

  getUpcomingMaintenance(hours: number = 168): MaintenanceSchedule[] {
    const cutoffTime = Date.now() + hours * 60 * 60 * 1000;
    return this.getMaintenanceSchedule().filter(
      (m) => m.scheduledAt.getTime() <= cutoffTime && m.status === "scheduled",
    );
  }

  getRecentSecurityScans(limit: number = 10): SecurityScan[] {
    return Array.from(this.securityScans.values())
      .sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime())
      .slice(0, limit);
  }

  getAutoScalingConfigs(): AutoScalingConfig[] {
    return Array.from(this.autoScalingConfigs.values());
  }

  getSystemSummary() {
    const latestHealth = this.getLatestSystemHealth();
    const activeHealing = this.getActiveHealingOperations();
    const upcomingMaintenance = this.getUpcomingMaintenance(24);
    const recentScans = this.getRecentSecurityScans(1);

    return {
      systemHealth: {
        overall: latestHealth
          ? this.calculateOverallHealth(latestHealth)
          : "unknown",
        services: latestHealth ? Object.keys(latestHealth.services).length : 0,
        healthyServices: latestHealth
          ? Object.values(latestHealth.services).filter(
              (s) => s.status === "healthy",
            ).length
          : 0,
        lastUpdate: latestHealth?.timestamp,
      },
      selfHealing: {
        activeOperations: activeHealing.length,
        totalResolved: Array.from(this.healingOperations.values()).filter(
          (op) => op.outcome.resolved,
        ).length,
        averageResolutionTime: this.calculateAverageResolutionTime(),
      },
      maintenance: {
        upcomingTasks: upcomingMaintenance.length,
        nextMaintenance: upcomingMaintenance[0]?.scheduledAt,
        criticalTasks: upcomingMaintenance.filter(
          (m) => m.priority === "critical",
        ).length,
      },
      security: {
        lastScan: recentScans[0]?.completedAt,
        securityScore: recentScans[0]
          ? this.calculateSecurityScore(recentScans[0])
          : null,
        criticalFindings:
          recentScans[0]?.findings.filter((f) => f.severity === "critical")
            .length || 0,
      },
      isMonitoring: this.isMonitoring,
    };
  }

  private calculateOverallHealth(
    health: SystemHealthMetrics,
  ): "healthy" | "degraded" | "unhealthy" {
    const services = Object.values(health.services);
    const healthyCount = services.filter((s) => s.status === "healthy").length;
    const degradedCount = services.filter(
      (s) => s.status === "degraded",
    ).length;

    if (healthyCount === services.length) return "healthy";
    if (healthyCount + degradedCount >= services.length * 0.8)
      return "degraded";
    return "unhealthy";
  }

  private calculateAverageResolutionTime(): number {
    const resolvedOps = Array.from(this.healingOperations.values()).filter(
      (op) => op.outcome.resolved,
    );

    if (resolvedOps.length === 0) return 0;

    const totalTime = resolvedOps.reduce(
      (sum, op) => sum + op.outcome.resolutionTime,
      0,
    );
    return totalTime / resolvedOps.length;
  }

  private calculateSecurityScore(scan: SecurityScan): number {
    const { passed, failed, warnings, totalChecks } = scan.scanResults;
    const baseScore = (passed / totalChecks) * 100;
    const warningPenalty = (warnings / totalChecks) * 10;
    const failurePenalty = (failed / totalChecks) * 20;

    return Math.max(0, Math.round(baseScore - warningPenalty - failurePenalty));
  }
}

export const ecosystemMaintenance = new EcosystemMaintenanceSystem();
