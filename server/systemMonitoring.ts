import { EventEmitter } from "events";
import { promises as fs } from "fs";
import { join } from "path";
import { spawn } from "child_process";
import { randomUUID } from "crypto";

export interface SystemMetrics {
  timestamp: Date;
  cpu: {
    usage: number; // percentage
    loadAverage: number[];
    cores: number;
    processes: number;
  };
  memory: {
    total: number; // bytes
    used: number;
    free: number;
    cached: number;
    available: number;
    usagePercentage: number;
  };
  disk: {
    total: number; // bytes
    used: number;
    free: number;
    usagePercentage: number;
    iops: { read: number; write: number };
  };
  network: {
    bytesIn: number;
    bytesOut: number;
    packetsIn: number;
    packetsOut: number;
    connectionsActive: number;
    connectionsTotal: number;
  };
  processes: {
    total: number;
    running: number;
    sleeping: number;
    zombie: number;
  };
}

export interface ServiceHealth {
  id: string;
  name: string;
  type: "database" | "api" | "worker" | "cache" | "storage" | "external";
  status: "healthy" | "degraded" | "unhealthy" | "unknown";
  endpoint?: string;
  lastCheck: Date;
  responseTime: number; // milliseconds
  uptime: number; // percentage
  errorRate: number; // percentage
  metrics: {
    requestsPerSecond: number;
    averageResponseTime: number;
    errorCount: number;
    successCount: number;
  };
  dependencies: string[];
  criticalityLevel: "low" | "medium" | "high" | "critical";
}

export interface Alert {
  id: string;
  type: "system" | "service" | "security" | "performance" | "business";
  severity: "info" | "warning" | "error" | "critical";
  title: string;
  description: string;
  source: string;
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolved: boolean;
  resolvedAt?: Date;
  metadata: Record<string, any>;
  escalationLevel: number;
  notificationsSent: string[];
}

export interface HealthCheck {
  id: string;
  name: string;
  type: "http" | "tcp" | "database" | "custom";
  interval: number; // seconds
  timeout: number; // seconds
  retries: number;
  endpoint?: string;
  expectedStatus?: number;
  expectedContent?: string;
  isActive: boolean;
  lastRun: Date;
  nextRun: Date;
  consecutiveFailures: number;
  totalRuns: number;
  successRate: number;
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: "debug" | "info" | "warn" | "error" | "fatal";
  service: string;
  message: string;
  metadata: Record<string, any>;
  userId?: string;
  requestId?: string;
  duration?: number;
  statusCode?: number;
}

export interface PerformanceBaseline {
  metric: string;
  baseline: number;
  threshold: number;
  direction: "above" | "below"; // Alert if above/below threshold
  window: number; // minutes
  samples: number; // minimum samples needed
}

export class SystemMonitoring extends EventEmitter {
  private metrics: SystemMetrics[] = [];
  private services = new Map<string, ServiceHealth>();
  private alerts = new Map<string, Alert>();
  private healthChecks = new Map<string, HealthCheck>();
  private logs: LogEntry[] = [];
  private baselines = new Map<string, PerformanceBaseline>();
  private isMonitoring = false;
  private checkIntervals = new Map<string, NodeJS.Timeout>();

  constructor() {
    super();
    this.setupDefaultServices();
    this.setupDefaultHealthChecks();
    this.setupPerformanceBaselines();
  }

  private setupDefaultServices() {
    const defaultServices: ServiceHealth[] = [
      {
        id: "database-postgres",
        name: "PostgreSQL Database",
        type: "database",
        status: "healthy",
        endpoint: process.env.DATABASE_URL,
        lastCheck: new Date(),
        responseTime: 15,
        uptime: 99.9,
        errorRate: 0.1,
        metrics: {
          requestsPerSecond: 125,
          averageResponseTime: 12,
          errorCount: 2,
          successCount: 1248,
        },
        dependencies: [],
        criticalityLevel: "critical",
      },
      {
        id: "api-server",
        name: "Express API Server",
        type: "api",
        status: "healthy",
        endpoint: "http://localhost:5000/api/health",
        lastCheck: new Date(),
        responseTime: 45,
        uptime: 99.8,
        errorRate: 0.2,
        metrics: {
          requestsPerSecond: 85,
          averageResponseTime: 42,
          errorCount: 5,
          successCount: 2145,
        },
        dependencies: ["database-postgres"],
        criticalityLevel: "critical",
      },
      {
        id: "video-encoder",
        name: "Video Encoding Service",
        type: "worker",
        status: "healthy",
        lastCheck: new Date(),
        responseTime: 2500,
        uptime: 99.5,
        errorRate: 1.2,
        metrics: {
          requestsPerSecond: 5,
          averageResponseTime: 2200,
          errorCount: 8,
          successCount: 645,
        },
        dependencies: ["storage-cdn"],
        criticalityLevel: "high",
      },
      {
        id: "streaming-server",
        name: "Live Streaming Server",
        type: "worker",
        status: "healthy",
        lastCheck: new Date(),
        responseTime: 85,
        uptime: 99.7,
        errorRate: 0.5,
        metrics: {
          requestsPerSecond: 125,
          averageResponseTime: 78,
          errorCount: 12,
          successCount: 2388,
        },
        dependencies: ["storage-cdn"],
        criticalityLevel: "critical",
      },
      {
        id: "content-processor",
        name: "Content Processing Pipeline",
        type: "worker",
        status: "healthy",
        lastCheck: new Date(),
        responseTime: 1500,
        uptime: 99.6,
        errorRate: 0.8,
        metrics: {
          requestsPerSecond: 15,
          averageResponseTime: 1420,
          errorCount: 6,
          successCount: 745,
        },
        dependencies: ["openai-api", "storage-cdn"],
        criticalityLevel: "high",
      },
      {
        id: "payment-processor",
        name: "Payment Processing Service",
        type: "api",
        status: "healthy",
        lastCheck: new Date(),
        responseTime: 850,
        uptime: 99.95,
        errorRate: 0.05,
        metrics: {
          requestsPerSecond: 25,
          averageResponseTime: 780,
          errorCount: 1,
          successCount: 1999,
        },
        dependencies: ["database-postgres"],
        criticalityLevel: "critical",
      },
      {
        id: "communication-system",
        name: "Communication & Messaging",
        type: "api",
        status: "healthy",
        lastCheck: new Date(),
        responseTime: 120,
        uptime: 99.8,
        errorRate: 0.3,
        metrics: {
          requestsPerSecond: 95,
          averageResponseTime: 115,
          errorCount: 7,
          successCount: 2335,
        },
        dependencies: ["database-postgres"],
        criticalityLevel: "high",
      },
      {
        id: "storage-cdn",
        name: "CDN & Storage Distribution",
        type: "storage",
        status: "healthy",
        lastCheck: new Date(),
        responseTime: 35,
        uptime: 99.9,
        errorRate: 0.1,
        metrics: {
          requestsPerSecond: 450,
          averageResponseTime: 32,
          errorCount: 4,
          successCount: 4996,
        },
        dependencies: [],
        criticalityLevel: "critical",
      },
      {
        id: "analytics-engine",
        name: "Internal Analytics Engine",
        type: "worker",
        status: "healthy",
        lastCheck: new Date(),
        responseTime: 250,
        uptime: 99.7,
        errorRate: 0.4,
        metrics: {
          requestsPerSecond: 65,
          averageResponseTime: 235,
          errorCount: 8,
          successCount: 1992,
        },
        dependencies: ["database-postgres"],
        criticalityLevel: "medium",
      },
      {
        id: "openai-api",
        name: "OpenAI API Service",
        type: "external",
        status: "healthy",
        endpoint: "https://api.openai.com/v1/models",
        lastCheck: new Date(),
        responseTime: 180,
        uptime: 99.5,
        errorRate: 0.5,
        metrics: {
          requestsPerSecond: 35,
          averageResponseTime: 175,
          errorCount: 9,
          successCount: 1791,
        },
        dependencies: [],
        criticalityLevel: "high",
      },
    ];

    for (const service of defaultServices) {
      this.services.set(service.id, service);
    }
  }

  private setupDefaultHealthChecks() {
    const defaultChecks: HealthCheck[] = [
      {
        id: "api-health",
        name: "API Health Check",
        type: "http",
        interval: 30,
        timeout: 5,
        retries: 3,
        endpoint: "http://localhost:5000/api/health",
        expectedStatus: 200,
        isActive: true,
        lastRun: new Date(),
        nextRun: new Date(Date.now() + 30000),
        consecutiveFailures: 0,
        totalRuns: 0,
        successRate: 100,
      },
      {
        id: "database-check",
        name: "Database Connectivity",
        type: "database",
        interval: 60,
        timeout: 10,
        retries: 2,
        isActive: true,
        lastRun: new Date(),
        nextRun: new Date(Date.now() + 60000),
        consecutiveFailures: 0,
        totalRuns: 0,
        successRate: 100,
      },
      {
        id: "disk-space",
        name: "Disk Space Check",
        type: "custom",
        interval: 300, // 5 minutes
        timeout: 5,
        retries: 1,
        isActive: true,
        lastRun: new Date(),
        nextRun: new Date(Date.now() + 300000),
        consecutiveFailures: 0,
        totalRuns: 0,
        successRate: 100,
      },
      {
        id: "memory-check",
        name: "Memory Usage Check",
        type: "custom",
        interval: 60,
        timeout: 2,
        retries: 1,
        isActive: true,
        lastRun: new Date(),
        nextRun: new Date(Date.now() + 60000),
        consecutiveFailures: 0,
        totalRuns: 0,
        successRate: 100,
      },
    ];

    for (const check of defaultChecks) {
      this.healthChecks.set(check.id, check);
    }
  }

  private setupPerformanceBaselines() {
    const baselines: PerformanceBaseline[] = [
      {
        metric: "cpu.usage",
        baseline: 15,
        threshold: 85,
        direction: "above",
        window: 5,
        samples: 5,
      },
      {
        metric: "memory.usagePercentage",
        baseline: 25,
        threshold: 90,
        direction: "above",
        window: 5,
        samples: 5,
      },
      {
        metric: "disk.usagePercentage",
        baseline: 30,
        threshold: 95,
        direction: "above",
        window: 10,
        samples: 3,
      },
      {
        metric: "api.responseTime",
        baseline: 50,
        threshold: 2000,
        direction: "above",
        window: 5,
        samples: 10,
      },
      {
        metric: "database.responseTime",
        baseline: 15,
        threshold: 500,
        direction: "above",
        window: 5,
        samples: 10,
      },
      {
        metric: "error.rate",
        baseline: 0.1,
        threshold: 5.0,
        direction: "above",
        window: 10,
        samples: 5,
      },
    ];

    for (const baseline of baselines) {
      this.baselines.set(baseline.metric, baseline);
    }
  }

  startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;

    // Start system metrics collection
    this.startSystemMetricsCollection();

    // Start health checks
    this.startHealthChecks();

    // Start service monitoring
    this.startServiceMonitoring();

    // Start log monitoring
    this.startLogMonitoring();

    this.emit("monitoringStarted");
  }

  stopMonitoring(): void {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;

    // Clear all intervals
    for (const interval of this.checkIntervals.values()) {
      clearInterval(interval);
    }
    this.checkIntervals.clear();

    this.emit("monitoringStopped");
  }

  private startSystemMetricsCollection(): void {
    const collectMetrics = async () => {
      try {
        const metrics = await this.collectSystemMetrics();
        this.metrics.push(metrics);

        // Keep only last 1000 metrics
        if (this.metrics.length > 1000) {
          this.metrics = this.metrics.slice(-1000);
        }

        // Check for threshold violations
        this.checkThresholds(metrics);

        this.emit("metricsCollected", metrics);
      } catch (error) {
        this.createAlert({
          type: "system",
          severity: "error",
          title: "Metrics Collection Failed",
          description: `Failed to collect system metrics: ${error instanceof Error ? error.message : "Unknown error"}`,
          source: "system-monitoring",
        });
      }
    };

    // Collect metrics every 30 seconds
    const interval = setInterval(collectMetrics, 30000);
    this.checkIntervals.set("system-metrics", interval);

    // Initial collection
    collectMetrics();
  }

  private async collectSystemMetrics(): Promise<SystemMetrics> {
    return new Promise((resolve, reject) => {
      const commands = [
        this.getCPUMetrics(),
        this.getMemoryMetrics(),
        this.getDiskMetrics(),
        this.getNetworkMetrics(),
        this.getProcessMetrics(),
      ];

      Promise.all(commands)
        .then(([cpu, memory, disk, network, processes]) => {
          resolve({
            timestamp: new Date(),
            cpu,
            memory,
            disk,
            network,
            processes,
          });
        })
        .catch(reject);
    });
  }

  private async getCPUMetrics(): Promise<SystemMetrics["cpu"]> {
    return new Promise((resolve) => {
      // Simulate CPU metrics collection
      const usage = Math.random() * 30 + 10; // 10-40%
      const loadAverage = [
        Math.random() * 2 + 0.5,
        Math.random() * 2 + 0.8,
        Math.random() * 2 + 1.2,
      ];

      resolve({
        usage,
        loadAverage,
        cores: 8,
        processes: Math.floor(Math.random() * 50 + 150),
      });
    });
  }

  private async getMemoryMetrics(): Promise<SystemMetrics["memory"]> {
    return new Promise((resolve) => {
      // Simulate memory metrics
      const total = 16 * 1024 * 1024 * 1024; // 16GB
      const used = Math.floor(total * (Math.random() * 0.4 + 0.3)); // 30-70%
      const free = total - used;
      const cached = Math.floor(used * 0.3);
      const available = free + cached;

      resolve({
        total,
        used,
        free,
        cached,
        available,
        usagePercentage: (used / total) * 100,
      });
    });
  }

  private async getDiskMetrics(): Promise<SystemMetrics["disk"]> {
    return new Promise((resolve) => {
      // Simulate disk metrics
      const total = 500 * 1024 * 1024 * 1024; // 500GB
      const used = Math.floor(total * (Math.random() * 0.5 + 0.2)); // 20-70%
      const free = total - used;

      resolve({
        total,
        used,
        free,
        usagePercentage: (used / total) * 100,
        iops: {
          read: Math.floor(Math.random() * 1000 + 100),
          write: Math.floor(Math.random() * 500 + 50),
        },
      });
    });
  }

  private async getNetworkMetrics(): Promise<SystemMetrics["network"]> {
    return new Promise((resolve) => {
      resolve({
        bytesIn: Math.floor(Math.random() * 10000000 + 1000000),
        bytesOut: Math.floor(Math.random() * 5000000 + 500000),
        packetsIn: Math.floor(Math.random() * 10000 + 1000),
        packetsOut: Math.floor(Math.random() * 8000 + 800),
        connectionsActive: Math.floor(Math.random() * 500 + 100),
        connectionsTotal: Math.floor(Math.random() * 10000 + 5000),
      });
    });
  }

  private async getProcessMetrics(): Promise<SystemMetrics["processes"]> {
    return new Promise((resolve) => {
      const total = Math.floor(Math.random() * 50 + 150);
      const running = Math.floor(total * 0.1);
      const sleeping = total - running - 2;

      resolve({
        total,
        running,
        sleeping,
        zombie: Math.floor(Math.random() * 3),
      });
    });
  }

  private startHealthChecks(): void {
    for (const check of this.healthChecks.values()) {
      if (!check.isActive) continue;

      const runHealthCheck = async () => {
        try {
          const success = await this.executeHealthCheck(check);
          check.lastRun = new Date();
          check.totalRuns++;

          if (success) {
            check.consecutiveFailures = 0;
          } else {
            check.consecutiveFailures++;

            if (check.consecutiveFailures >= check.retries) {
              this.createAlert({
                type: "system",
                severity: "error",
                title: `Health Check Failed: ${check.name}`,
                description: `Health check ${check.name} has failed ${check.consecutiveFailures} consecutive times`,
                source: "health-check",
                metadata: {
                  checkId: check.id,
                  consecutiveFailures: check.consecutiveFailures,
                },
              });
            }
          }

          // Update success rate
          const successCount = check.totalRuns - check.consecutiveFailures;
          check.successRate = (successCount / check.totalRuns) * 100;

          check.nextRun = new Date(Date.now() + check.interval * 1000);
        } catch (error) {
          this.log(
            "error",
            "health-check",
            `Health check ${check.name} threw error: ${error}`,
          );
        }
      };

      const interval = setInterval(runHealthCheck, check.interval * 1000);
      this.checkIntervals.set(`healthcheck-${check.id}`, interval);

      // Run immediately
      runHealthCheck();
    }
  }

  private async executeHealthCheck(check: HealthCheck): Promise<boolean> {
    switch (check.type) {
      case "http":
        return this.executeHTTPCheck(check);
      case "tcp":
        return this.executeTCPCheck(check);
      case "database":
        return this.executeDatabaseCheck(check);
      case "custom":
        return this.executeCustomCheck(check);
      default:
        return false;
    }
  }

  private async executeHTTPCheck(check: HealthCheck): Promise<boolean> {
    if (!check.endpoint) return false;

    try {
      const startTime = Date.now();
      const response = await fetch(check.endpoint, {
        signal: AbortSignal.timeout(check.timeout * 1000),
      });

      const responseTime = Date.now() - startTime;

      // Update service metrics
      this.updateServiceMetrics(
        check.name,
        responseTime,
        response.status >= 200 && response.status < 300,
      );

      if (check.expectedStatus && response.status !== check.expectedStatus) {
        return false;
      }

      if (check.expectedContent) {
        const content = await response.text();
        return content.includes(check.expectedContent);
      }

      return response.ok;
    } catch (error) {
      return false;
    }
  }

  private async executeTCPCheck(check: HealthCheck): Promise<boolean> {
    // Simulate TCP check
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(Math.random() > 0.05); // 95% success rate
      }, Math.random() * 100);
    });
  }

  private async executeDatabaseCheck(check: HealthCheck): Promise<boolean> {
    // Simulate database check
    return new Promise((resolve) => {
      setTimeout(
        () => {
          const success = Math.random() > 0.02; // 98% success rate
          const responseTime = Math.random() * 50 + 5;
          this.updateServiceMetrics("database-postgres", responseTime, success);
          resolve(success);
        },
        Math.random() * 20 + 5,
      );
    });
  }

  private async executeCustomCheck(check: HealthCheck): Promise<boolean> {
    switch (check.name) {
      case "Disk Space Check":
        return this.checkDiskSpace();
      case "Memory Usage Check":
        return this.checkMemoryUsage();
      default:
        return true;
    }
  }

  private async checkDiskSpace(): Promise<boolean> {
    const metrics = this.getLatestMetrics();
    if (!metrics) return true;

    return metrics.disk.usagePercentage < 90;
  }

  private async checkMemoryUsage(): Promise<boolean> {
    const metrics = this.getLatestMetrics();
    if (!metrics) return true;

    return metrics.memory.usagePercentage < 85;
  }

  private updateServiceMetrics(
    serviceName: string,
    responseTime: number,
    success: boolean,
  ): void {
    for (const service of this.services.values()) {
      if (
        service.name.toLowerCase().includes(serviceName.toLowerCase()) ||
        service.id.includes(serviceName.toLowerCase())
      ) {
        service.lastCheck = new Date();
        service.responseTime = responseTime;

        if (success) {
          service.metrics.successCount++;
        } else {
          service.metrics.errorCount++;
        }

        const total = service.metrics.successCount + service.metrics.errorCount;
        service.errorRate = (service.metrics.errorCount / total) * 100;
        service.uptime = (service.metrics.successCount / total) * 100;

        // Update service status based on recent performance
        if (service.errorRate > 10) {
          service.status = "unhealthy";
        } else if (service.errorRate > 5 || service.responseTime > 5000) {
          service.status = "degraded";
        } else {
          service.status = "healthy";
        }

        break;
      }
    }
  }

  private startServiceMonitoring(): void {
    const monitorServices = () => {
      for (const service of this.services.values()) {
        // Simulate service metric updates
        const variance = (Math.random() - 0.5) * 0.1;
        service.metrics.requestsPerSecond +=
          service.metrics.requestsPerSecond * variance;
        service.metrics.averageResponseTime +=
          service.metrics.averageResponseTime * variance * 0.5;

        // Check for service degradation
        if (
          service.metrics.averageResponseTime > 2000 &&
          service.status === "healthy"
        ) {
          this.createAlert({
            type: "service",
            severity: "warning",
            title: `Service Degradation: ${service.name}`,
            description: `${service.name} response time increased to ${Math.round(service.metrics.averageResponseTime)}ms`,
            source: service.id,
            metadata: {
              serviceId: service.id,
              responseTime: service.metrics.averageResponseTime,
            },
          });
        }
      }

      this.emit("servicesUpdated");
    };

    const interval = setInterval(monitorServices, 60000); // Every minute
    this.checkIntervals.set("service-monitoring", interval);
  }

  private startLogMonitoring(): void {
    // Simulate log entries
    const generateLogs = () => {
      const logLevels: LogEntry["level"][] = ["debug", "info", "warn", "error"];
      const services = [
        "api",
        "database",
        "video-encoder",
        "streaming",
        "payments",
      ];

      const count = Math.floor(Math.random() * 5) + 1;

      for (let i = 0; i < count; i++) {
        const level = logLevels[Math.floor(Math.random() * logLevels.length)];
        const service = services[Math.floor(Math.random() * services.length)];

        this.log(level, service, this.generateLogMessage(level, service));
      }
    };

    const interval = setInterval(generateLogs, 10000); // Every 10 seconds
    this.checkIntervals.set("log-monitoring", interval);
  }

  private generateLogMessage(
    level: LogEntry["level"],
    service: string,
  ): string {
    const templates = {
      debug: [
        `Processing request for ${service}`,
        `Cache hit for ${service} operation`,
        `Connection pool status: active`,
      ],
      info: [
        `Successfully processed ${Math.floor(Math.random() * 100) + 1} requests`,
        `Service ${service} started successfully`,
        `Health check passed for ${service}`,
      ],
      warn: [
        `High response time detected in ${service}: ${Math.floor(Math.random() * 1000) + 500}ms`,
        `Connection pool nearly exhausted for ${service}`,
        `Retry attempt ${Math.floor(Math.random() * 3) + 1} for ${service} operation`,
      ],
      error: [
        `Failed to connect to ${service}: Connection timeout`,
        `Database query failed in ${service}`,
        `Authentication error in ${service} module`,
      ],
    };

    const messages = templates[level];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  private checkThresholds(metrics: SystemMetrics): void {
    // Check CPU usage
    if (metrics.cpu.usage > 85) {
      this.createAlert({
        type: "system",
        severity: metrics.cpu.usage > 95 ? "critical" : "warning",
        title: "High CPU Usage",
        description: `CPU usage is ${Math.round(metrics.cpu.usage)}%`,
        source: "system",
        metadata: {
          metric: "cpu.usage",
          value: metrics.cpu.usage,
          threshold: 85,
        },
      });
    }

    // Check memory usage
    if (metrics.memory.usagePercentage > 85) {
      this.createAlert({
        type: "system",
        severity: metrics.memory.usagePercentage > 95 ? "critical" : "warning",
        title: "High Memory Usage",
        description: `Memory usage is ${Math.round(metrics.memory.usagePercentage)}%`,
        source: "system",
        metadata: {
          metric: "memory.usage",
          value: metrics.memory.usagePercentage,
          threshold: 85,
        },
      });
    }

    // Check disk usage
    if (metrics.disk.usagePercentage > 90) {
      this.createAlert({
        type: "system",
        severity: metrics.disk.usagePercentage > 98 ? "critical" : "warning",
        title: "High Disk Usage",
        description: `Disk usage is ${Math.round(metrics.disk.usagePercentage)}%`,
        source: "system",
        metadata: {
          metric: "disk.usage",
          value: metrics.disk.usagePercentage,
          threshold: 90,
        },
      });
    }
  }

  private createAlert(
    alertData: Omit<
      Alert,
      | "id"
      | "timestamp"
      | "acknowledged"
      | "resolved"
      | "escalationLevel"
      | "notificationsSent"
    >,
  ): string {
    const alertId = randomUUID();

    const alert: Alert = {
      ...alertData,
      id: alertId,
      timestamp: new Date(),
      acknowledged: false,
      resolved: false,
      escalationLevel: 0,
      notificationsSent: [],
    };

    this.alerts.set(alertId, alert);
    this.emit("alertCreated", alert);

    // Auto-escalate critical alerts
    if (alert.severity === "critical") {
      setTimeout(() => {
        this.escalateAlert(alertId);
      }, 300000); // 5 minutes
    }

    return alertId;
  }

  log(
    level: LogEntry["level"],
    service: string,
    message: string,
    metadata: Record<string, any> = {},
  ): string {
    const logId = randomUUID();

    const logEntry: LogEntry = {
      id: logId,
      timestamp: new Date(),
      level,
      service,
      message,
      metadata,
    };

    this.logs.push(logEntry);

    // Keep only last 10000 log entries
    if (this.logs.length > 10000) {
      this.logs = this.logs.slice(-10000);
    }

    // Create alerts for error logs
    if (level === "error" || level === "fatal") {
      this.createAlert({
        type: "system",
        severity: level === "fatal" ? "critical" : "error",
        title: `${level.toUpperCase()} in ${service}`,
        description: message,
        source: service,
        metadata: { logId, ...metadata },
      });
    }

    this.emit("logEntry", logEntry);
    return logId;
  }

  acknowledgeAlert(alertId: string, userId: string): boolean {
    const alert = this.alerts.get(alertId);
    if (!alert || alert.acknowledged) return false;

    alert.acknowledged = true;
    alert.acknowledgedBy = userId;
    alert.acknowledgedAt = new Date();

    this.emit("alertAcknowledged", alert);
    return true;
  }

  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.get(alertId);
    if (!alert || alert.resolved) return false;

    alert.resolved = true;
    alert.resolvedAt = new Date();

    this.emit("alertResolved", alert);
    return true;
  }

  escalateAlert(alertId: string): boolean {
    const alert = this.alerts.get(alertId);
    if (!alert || alert.acknowledged || alert.resolved) return false;

    alert.escalationLevel++;

    this.emit("alertEscalated", alert);
    return true;
  }

  // Public API methods
  getLatestMetrics(): SystemMetrics | undefined {
    return this.metrics[this.metrics.length - 1];
  }

  getMetricsHistory(hours: number = 24): SystemMetrics[] {
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.metrics.filter((m) => m.timestamp > cutoffTime);
  }

  getServiceHealth(serviceId?: string): ServiceHealth[] {
    if (serviceId) {
      const service = this.services.get(serviceId);
      return service ? [service] : [];
    }
    return Array.from(this.services.values());
  }

  getAlerts(
    filters: {
      severity?: Alert["severity"];
      type?: Alert["type"];
      acknowledged?: boolean;
      resolved?: boolean;
      limit?: number;
    } = {},
  ): Alert[] {
    let alerts = Array.from(this.alerts.values());

    if (filters.severity) {
      alerts = alerts.filter((a) => a.severity === filters.severity);
    }
    if (filters.type) {
      alerts = alerts.filter((a) => a.type === filters.type);
    }
    if (filters.acknowledged !== undefined) {
      alerts = alerts.filter((a) => a.acknowledged === filters.acknowledged);
    }
    if (filters.resolved !== undefined) {
      alerts = alerts.filter((a) => a.resolved === filters.resolved);
    }

    // Sort by timestamp (newest first)
    alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    if (filters.limit) {
      alerts = alerts.slice(0, filters.limit);
    }

    return alerts;
  }

  getRecentLogs(limit: number = 100, level?: LogEntry["level"]): LogEntry[] {
    let logs = [...this.logs];

    if (level) {
      logs = logs.filter((log) => log.level === level);
    }

    return logs
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  getSystemStatus(): {
    overall: "healthy" | "degraded" | "unhealthy";
    services: {
      total: number;
      healthy: number;
      degraded: number;
      unhealthy: number;
    };
    alerts: { total: number; critical: number; unacknowledged: number };
    uptime: number;
  } {
    const services = Array.from(this.services.values());
    const alerts = Array.from(this.alerts.values()).filter((a) => !a.resolved);

    const healthyServices = services.filter(
      (s) => s.status === "healthy",
    ).length;
    const degradedServices = services.filter(
      (s) => s.status === "degraded",
    ).length;
    const unhealthyServices = services.filter(
      (s) => s.status === "unhealthy",
    ).length;

    const criticalAlerts = alerts.filter(
      (a) => a.severity === "critical",
    ).length;
    const unacknowledgedAlerts = alerts.filter((a) => !a.acknowledged).length;

    let overall: "healthy" | "degraded" | "unhealthy" = "healthy";
    if (unhealthyServices > 0 || criticalAlerts > 0) {
      overall = "unhealthy";
    } else if (degradedServices > 0 || unacknowledgedAlerts > 0) {
      overall = "degraded";
    }

    // Calculate uptime (simplified)
    const uptime =
      services.length > 0
        ? services.reduce((sum, s) => sum + s.uptime, 0) / services.length
        : 100;

    return {
      overall,
      services: {
        total: services.length,
        healthy: healthyServices,
        degraded: degradedServices,
        unhealthy: unhealthyServices,
      },
      alerts: {
        total: alerts.length,
        critical: criticalAlerts,
        unacknowledged: unacknowledgedAlerts,
      },
      uptime: Math.round(uptime * 100) / 100,
    };
  }

  getPerformanceReport(hours: number = 24): {
    averageResponseTimes: Record<string, number>;
    errorRates: Record<string, number>;
    throughput: Record<string, number>;
    availability: Record<string, number>;
  } {
    const services = Array.from(this.services.values());

    return {
      averageResponseTimes: services.reduce(
        (acc, s) => {
          acc[s.name] = s.metrics.averageResponseTime;
          return acc;
        },
        {} as Record<string, number>,
      ),

      errorRates: services.reduce(
        (acc, s) => {
          acc[s.name] = s.errorRate;
          return acc;
        },
        {} as Record<string, number>,
      ),

      throughput: services.reduce(
        (acc, s) => {
          acc[s.name] = s.metrics.requestsPerSecond;
          return acc;
        },
        {} as Record<string, number>,
      ),

      availability: services.reduce(
        (acc, s) => {
          acc[s.name] = s.uptime;
          return acc;
        },
        {} as Record<string, number>,
      ),
    };
  }
}

// Singleton instance
export const systemMonitoring = new SystemMonitoring();
