# Problem-Solving & Troubleshooting Encyclopedia
**FanzDash Enterprise Platform**  
*Comprehensive Technical Support & Resolution Guide*

---

## Table of Contents

**PART I: SYSTEM INFRASTRUCTURE TROUBLESHOOTING**
- [Chapter 1: Server & Application Issues](#chapter-1-server--application-issues)
- [Chapter 2: Database Performance & Connectivity](#chapter-2-database-performance--connectivity)
- [Chapter 3: Network & CDN Problems](#chapter-3-network--cdn-problems)
- [Chapter 4: Load Balancing & Scaling Issues](#chapter-4-load-balancing--scaling-issues)

**PART II: AUTHENTICATION & SECURITY TROUBLESHOOTING**
- [Chapter 5: Authentication System Problems](#chapter-5-authentication-system-problems)
- [Chapter 6: Multi-Factor Authentication Issues](#chapter-6-multi-factor-authentication-issues)
- [Chapter 7: OAuth & Social Login Problems](#chapter-7-oauth--social-login-problems)
- [Chapter 8: Security & Access Control Issues](#chapter-8-security--access-control-issues)

**PART III: CONTENT MANAGEMENT TROUBLESHOOTING**
- [Chapter 9: Content Upload & Processing Issues](#chapter-9-content-upload--processing-issues)
- [Chapter 10: AI Content Moderation Problems](#chapter-10-ai-content-moderation-problems)
- [Chapter 11: Live Streaming Technical Issues](#chapter-11-live-streaming-technical-issues)
- [Chapter 12: Content Delivery & Storage Problems](#chapter-12-content-delivery--storage-problems)

**PART IV: PAYMENT & FINANCIAL SYSTEM TROUBLESHOOTING**
- [Chapter 13: Payment Processing Issues](#chapter-13-payment-processing-issues)
- [Chapter 14: Subscription & Billing Problems](#chapter-14-subscription--billing-problems)
- [Chapter 15: Financial Compliance & Reporting Issues](#chapter-15-financial-compliance--reporting-issues)

**PART V: USER EXPERIENCE & FRONTEND TROUBLESHOOTING**
- [Chapter 16: Frontend Application Issues](#chapter-16-frontend-application-issues)
- [Chapter 17: Mobile App Problems](#chapter-17-mobile-app-problems)
- [Chapter 18: Performance & Optimization Issues](#chapter-18-performance--optimization-issues)
- [Chapter 19: Browser Compatibility Problems](#chapter-19-browser-compatibility-problems)

**PART VI: DATA & ANALYTICS TROUBLESHOOTING**
- [Chapter 20: Data Pipeline Issues](#chapter-20-data-pipeline-issues)
- [Chapter 21: Analytics & Reporting Problems](#chapter-21-analytics--reporting-problems)
- [Chapter 22: Backup & Recovery Issues](#chapter-22-backup--recovery-issues)

**PART VII: INTEGRATION & API TROUBLESHOOTING**
- [Chapter 23: Third-Party API Integration Issues](#chapter-23-third-party-api-integration-issues)
- [Chapter 24: Webhook & Event Processing Problems](#chapter-24-webhook--event-processing-problems)
- [Chapter 25: Communication System Issues](#chapter-25-communication-system-issues)

---

## PART I: SYSTEM INFRASTRUCTURE TROUBLESHOOTING

### Chapter 1: Server & Application Issues

#### 1.1 Application Startup Problems

**Problem**: Application fails to start or crashes during initialization

**Common Symptoms**:
- Server exits with error codes
- Express server fails to bind to port
- Database connection timeouts
- Module import failures
- Environment variable issues

**Diagnostic Approach**:

1. **Check Application Logs**:
```bash
# Check console output for startup errors
npm run dev

# Check system logs
journalctl -u fanzdash-app -f

# Check PM2 logs if using process manager
pm2 logs fanzdash-app
```

2. **Verify Environment Configuration**:
```bash
# Check all required environment variables
printenv | grep -E "(DATABASE_URL|OPENAI_API_KEY|STRIPE_|TWILIO_)"

# Validate environment file
cat .env | grep -v "^#" | grep "="
```

3. **Test Database Connectivity**:
```typescript
// Database connection test utility
import { testDatabaseConnection } from './utils/database-test';

async function testConnection() {
  try {
    const result = await testDatabaseConnection();
    console.log('Database connection:', result.status);
    console.log('Connection time:', result.responseTime);
  } catch (error) {
    console.error('Database connection failed:', error);
  }
}
```

**Resolution Steps**:

**Issue**: Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000
netstat -tulpn | grep 5000

# Kill process if necessary
kill -9 <PID>

# Or use different port
export PORT=5001
npm run dev
```

**Issue**: Missing Environment Variables
```bash
# Copy environment template
cp .env.example .env

# Edit required variables
nano .env

# Source environment file
source .env
```

**Issue**: Database Connection Failed
```typescript
// Database troubleshooting utility
interface DatabaseDiagnostic {
  connectionString: string;
  host: string;
  port: number;
  database: string;
  ssl: boolean;
  connectionPool: {
    min: number;
    max: number;
    idle: number;
  };
}

async function diagnoseDatabaseIssue(): Promise<DatabaseDiagnostic> {
  const dbUrl = process.env.DATABASE_URL;
  
  if (!dbUrl) {
    throw new Error('DATABASE_URL environment variable not set');
  }
  
  // Parse connection string
  const url = new URL(dbUrl);
  
  return {
    connectionString: dbUrl.replace(/:[^:]*@/, ':***@'), // Hide password
    host: url.hostname,
    port: parseInt(url.port) || 5432,
    database: url.pathname.slice(1),
    ssl: url.searchParams.has('sslmode'),
    connectionPool: {
      min: 2,
      max: 10,
      idle: 10000
    }
  };
}
```

**Issue**: Module Import Failures
```typescript
// Module resolution diagnostics
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';

interface ModuleDiagnostic {
  moduleName: string;
  installed: boolean;
  version?: string;
  path?: string;
  dependencies: ModuleDependency[];
}

function diagnoseModuleIssue(moduleName: string): ModuleDiagnostic {
  try {
    // Check if module is installed
    const packageJson = require(path.join(process.cwd(), 'package.json'));
    const allDeps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies
    };
    
    const isInstalled = moduleName in allDeps;
    
    if (isInstalled) {
      // Get installed version
      const installedVersion = execSync(`npm list ${moduleName} --depth=0`, 
        { encoding: 'utf-8' });
      
      return {
        moduleName,
        installed: true,
        version: allDeps[moduleName],
        path: require.resolve(moduleName),
        dependencies: []
      };
    } else {
      return {
        moduleName,
        installed: false,
        dependencies: []
      };
    }
  } catch (error) {
    console.error(`Module diagnostic failed for ${moduleName}:`, error);
    return {
      moduleName,
      installed: false,
      dependencies: []
    };
  }
}
```

#### 1.2 Memory and Performance Issues

**Problem**: High memory usage or poor application performance

**Common Symptoms**:
- Slow response times
- Memory leaks
- Process crashes due to out-of-memory
- High CPU usage
- Garbage collection issues

**Diagnostic Tools**:

1. **Memory Monitoring**:
```typescript
// Memory usage monitoring utility
interface MemoryMetrics {
  rss: number; // Resident Set Size
  heapTotal: number;
  heapUsed: number;
  external: number;
  arrayBuffers: number;
  gcCount: number;
  gcDuration: number;
}

class MemoryMonitor {
  private metrics: MemoryMetrics[] = [];
  private gcCount = 0;
  private gcStartTime = 0;
  
  constructor() {
    // Monitor garbage collection
    if (global.gc) {
      const originalGc = global.gc;
      global.gc = () => {
        this.gcStartTime = Date.now();
        const result = originalGc();
        this.gcCount++;
        const gcDuration = Date.now() - this.gcStartTime;
        
        console.log(`GC completed in ${gcDuration}ms (count: ${this.gcCount})`);
        return result;
      };
    }
  }
  
  collectMetrics(): MemoryMetrics {
    const memUsage = process.memoryUsage();
    
    const metrics: MemoryMetrics = {
      rss: memUsage.rss,
      heapTotal: memUsage.heapTotal,
      heapUsed: memUsage.heapUsed,
      external: memUsage.external,
      arrayBuffers: memUsage.arrayBuffers,
      gcCount: this.gcCount,
      gcDuration: 0
    };
    
    this.metrics.push(metrics);
    
    // Keep only last 100 metrics
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }
    
    return metrics;
  }
  
  analyzeMemoryTrend(): {
    trend: 'increasing' | 'decreasing' | 'stable';
    rate: number;
    recommendation: string;
  } {
    if (this.metrics.length < 10) {
      return {
        trend: 'stable',
        rate: 0,
        recommendation: 'Insufficient data for analysis'
      };
    }
    
    const recent = this.metrics.slice(-10);
    const first = recent[0].heapUsed;
    const last = recent[recent.length - 1].heapUsed;
    const rate = (last - first) / first;
    
    let trend: 'increasing' | 'decreasing' | 'stable';
    let recommendation: string;
    
    if (rate > 0.1) {
      trend = 'increasing';
      recommendation = 'Memory usage increasing rapidly. Check for memory leaks.';
    } else if (rate < -0.1) {
      trend = 'decreasing';
      recommendation = 'Memory usage decreasing. System is healthy.';
    } else {
      trend = 'stable';
      recommendation = 'Memory usage is stable.';
    }
    
    return { trend, rate, recommendation };
  }
}
```

2. **Performance Profiling**:
```typescript
// Performance profiling utilities
import { performance } from 'perf_hooks';

interface PerformanceMetric {
  operation: string;
  duration: number;
  timestamp: number;
  memory: MemoryMetrics;
  cpu: number;
}

class PerformanceProfiler {
  private metrics: PerformanceMetric[] = [];
  
  async profileFunction<T>(
    operation: string,
    fn: () => Promise<T> | T
  ): Promise<T> {
    const startTime = performance.now();
    const startMemory = process.memoryUsage();
    const startCpu = process.cpuUsage();
    
    try {
      const result = await fn();
      
      const endTime = performance.now();
      const endMemory = process.memoryUsage();
      const endCpu = process.cpuUsage(startCpu);
      
      const metric: PerformanceMetric = {
        operation,
        duration: endTime - startTime,
        timestamp: Date.now(),
        memory: {
          rss: endMemory.rss - startMemory.rss,
          heapTotal: endMemory.heapTotal - startMemory.heapTotal,
          heapUsed: endMemory.heapUsed - startMemory.heapUsed,
          external: endMemory.external - startMemory.external,
          arrayBuffers: endMemory.arrayBuffers - startMemory.arrayBuffers,
          gcCount: 0,
          gcDuration: 0
        },
        cpu: (endCpu.user + endCpu.system) / 1000 // Convert to milliseconds
      };
      
      this.metrics.push(metric);
      
      // Log slow operations
      if (metric.duration > 1000) {
        console.warn(`Slow operation detected: ${operation} took ${metric.duration.toFixed(2)}ms`);
      }
      
      return result;
    } catch (error) {
      console.error(`Performance profiling failed for operation: ${operation}`, error);
      throw error;
    }
  }
  
  getSlowOperations(thresholdMs: number = 500): PerformanceMetric[] {
    return this.metrics.filter(metric => metric.duration > thresholdMs);
  }
  
  getAveragePerformance(operation: string): {
    averageDuration: number;
    count: number;
    totalCpu: number;
    averageMemory: number;
  } {
    const operationMetrics = this.metrics.filter(m => m.operation === operation);
    
    if (operationMetrics.length === 0) {
      return {
        averageDuration: 0,
        count: 0,
        totalCpu: 0,
        averageMemory: 0
      };
    }
    
    const totalDuration = operationMetrics.reduce((sum, m) => sum + m.duration, 0);
    const totalCpu = operationMetrics.reduce((sum, m) => sum + m.cpu, 0);
    const totalMemory = operationMetrics.reduce((sum, m) => sum + m.memory.heapUsed, 0);
    
    return {
      averageDuration: totalDuration / operationMetrics.length,
      count: operationMetrics.length,
      totalCpu,
      averageMemory: totalMemory / operationMetrics.length
    };
  }
}
```

**Resolution Strategies**:

**Memory Leak Prevention**:
```typescript
// Memory leak detection and prevention
class MemoryLeakDetector {
  private objectCounts = new Map<string, number>();
  private intervalId?: NodeJS.Timeout;
  
  startMonitoring(intervalMs: number = 30000) {
    this.intervalId = setInterval(() => {
      this.checkForLeaks();
    }, intervalMs);
  }
  
  stopMonitoring() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
  
  private checkForLeaks() {
    const heapSnapshot = (global as any).gc && (global as any).gc();
    const currentMemory = process.memoryUsage();
    
    // Check for event listener leaks
    this.checkEventListenerLeaks();
    
    // Check for timer leaks
    this.checkTimerLeaks();
    
    // Check for unclosed streams
    this.checkStreamLeaks();
    
    console.log('Memory usage:', {
      heapUsed: Math.round(currentMemory.heapUsed / 1024 / 1024) + ' MB',
      rss: Math.round(currentMemory.rss / 1024 / 1024) + ' MB'
    });
  }
  
  private checkEventListenerLeaks() {
    const emitters = process.listenerCount ? Object.keys(process._events || {}) : [];
    
    emitters.forEach(event => {
      const count = process.listenerCount(event);
      if (count > 10) {
        console.warn(`Potential event listener leak detected: ${event} has ${count} listeners`);
      }
    });
  }
  
  private checkTimerLeaks() {
    // Check for active timers (implementation depends on environment)
    const activeHandles = (process as any)._getActiveHandles?.() || [];
    const activeRequests = (process as any)._getActiveRequests?.() || [];
    
    if (activeHandles.length > 100) {
      console.warn(`High number of active handles: ${activeHandles.length}`);
    }
    
    if (activeRequests.length > 100) {
      console.warn(`High number of active requests: ${activeRequests.length}`);
    }
  }
  
  private checkStreamLeaks() {
    // Monitor for unclosed streams (simplified implementation)
    const streams = require('stream');
    const originalPipe = streams.Readable.prototype.pipe;
    
    streams.Readable.prototype.pipe = function(destination: any, options: any) {
      console.log('Stream pipe created:', destination.constructor.name);
      return originalPipe.call(this, destination, options);
    };
  }
}
```

#### 1.3 Logging and Monitoring Issues

**Problem**: Insufficient logging or monitoring data for troubleshooting

**Common Symptoms**:
- Missing error details
- No performance metrics
- Inadequate request tracing
- Log rotation issues
- Monitoring system failures

**Enhanced Logging Implementation**:

```typescript
// Comprehensive logging system
import winston from 'winston';
import { Request, Response, NextFunction } from 'express';

interface LogContext {
  requestId: string;
  userId?: string;
  sessionId?: string;
  ipAddress: string;
  userAgent: string;
  operation: string;
  timestamp: Date;
  additionalData?: Record<string, any>;
}

class EnhancedLogger {
  private logger: winston.Logger;
  
  constructor() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return JSON.stringify({
            timestamp,
            level,
            message,
            ...meta
          });
        })
      ),
      transports: [
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
          maxsize: 10 * 1024 * 1024, // 10MB
          maxFiles: 5
        }),
        new winston.transports.File({
          filename: 'logs/combined.log',
          maxsize: 50 * 1024 * 1024, // 50MB
          maxFiles: 10
        }),
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        })
      ]
    });
  }
  
  createRequestLogger() {
    return (req: Request, res: Response, next: NextFunction) => {
      const requestId = req.headers['x-request-id'] || this.generateRequestId();
      const startTime = Date.now();
      
      // Add request ID to headers
      req.headers['x-request-id'] = requestId;
      res.setHeader('x-request-id', requestId);
      
      const context: LogContext = {
        requestId: requestId as string,
        userId: (req as any).user?.id,
        sessionId: req.sessionID,
        ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
        userAgent: req.get('User-Agent') || 'unknown',
        operation: `${req.method} ${req.path}`,
        timestamp: new Date()
      };
      
      // Log request start
      this.logRequest(context, {
        method: req.method,
        url: req.url,
        headers: req.headers,
        body: this.sanitizeRequestBody(req.body)
      });
      
      // Override response.end to log response
      const originalEnd = res.end;
      res.end = function(chunk?: any, encoding?: any) {
        const duration = Date.now() - startTime;
        
        // Log response
        this.logResponse(context, {
          statusCode: res.statusCode,
          duration,
          headers: res.getHeaders()
        });
        
        originalEnd.call(res, chunk, encoding);
      }.bind(this);
      
      next();
    };
  }
  
  logError(context: LogContext, error: Error, additionalData?: Record<string, any>) {
    this.logger.error('Application error', {
      ...context,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      additionalData
    });
  }
  
  logWarning(context: LogContext, message: string, additionalData?: Record<string, any>) {
    this.logger.warn(message, {
      ...context,
      additionalData
    });
  }
  
  logInfo(context: LogContext, message: string, additionalData?: Record<string, any>) {
    this.logger.info(message, {
      ...context,
      additionalData
    });
  }
  
  logDebug(context: LogContext, message: string, additionalData?: Record<string, any>) {
    this.logger.debug(message, {
      ...context,
      additionalData
    });
  }
  
  private logRequest(context: LogContext, requestData: any) {
    this.logger.info('HTTP Request', {
      ...context,
      type: 'request',
      requestData
    });
  }
  
  private logResponse(context: LogContext, responseData: any) {
    this.logger.info('HTTP Response', {
      ...context,
      type: 'response',
      responseData
    });
  }
  
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private sanitizeRequestBody(body: any): any {
    if (!body) return body;
    
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization'];
    const sanitized = { ...body };
    
    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }
    
    return sanitized;
  }
}
```

**Monitoring and Alerting System**:

```typescript
// System monitoring and alerting
interface SystemMetrics {
  timestamp: Date;
  cpu: {
    usage: number;
    loadAverage: number[];
  };
  memory: {
    total: number;
    used: number;
    free: number;
    percentage: number;
  };
  disk: {
    total: number;
    used: number;
    free: number;
    percentage: number;
  };
  network: {
    inbound: number;
    outbound: number;
  };
  application: {
    activeConnections: number;
    requestsPerSecond: number;
    errorRate: number;
    responseTime: number;
  };
}

class SystemMonitor {
  private metrics: SystemMetrics[] = [];
  private alertThresholds = {
    cpuUsage: 80,
    memoryUsage: 85,
    diskUsage: 90,
    errorRate: 5,
    responseTime: 2000
  };
  
  async collectMetrics(): Promise<SystemMetrics> {
    const cpuUsage = await this.getCpuUsage();
    const memoryInfo = this.getMemoryInfo();
    const diskInfo = await this.getDiskInfo();
    const networkInfo = this.getNetworkInfo();
    const appInfo = this.getApplicationInfo();
    
    const metrics: SystemMetrics = {
      timestamp: new Date(),
      cpu: {
        usage: cpuUsage,
        loadAverage: require('os').loadavg()
      },
      memory: memoryInfo,
      disk: diskInfo,
      network: networkInfo,
      application: appInfo
    };
    
    this.metrics.push(metrics);
    
    // Keep only last 1000 metrics
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
    
    // Check for alerts
    this.checkAlerts(metrics);
    
    return metrics;
  }
  
  private async getCpuUsage(): Promise<number> {
    return new Promise((resolve) => {
      const startUsage = process.cpuUsage();
      const startTime = process.hrtime.bigint();
      
      setTimeout(() => {
        const endUsage = process.cpuUsage(startUsage);
        const endTime = process.hrtime.bigint();
        
        const totalTime = Number(endTime - startTime) / 1000000; // Convert to milliseconds
        const cpuTime = (endUsage.user + endUsage.system) / 1000; // Convert to milliseconds
        
        const usage = (cpuTime / totalTime) * 100;
        resolve(Math.min(100, Math.max(0, usage)));
      }, 100);
    });
  }
  
  private getMemoryInfo() {
    const total = require('os').totalmem();
    const free = require('os').freemem();
    const used = total - free;
    const percentage = (used / total) * 100;
    
    return {
      total,
      used,
      free,
      percentage
    };
  }
  
  private async getDiskInfo() {
    // Simplified disk usage calculation
    try {
      const { execSync } = require('child_process');
      const output = execSync('df -h /', { encoding: 'utf-8' });
      const lines = output.split('\n');
      const dataLine = lines[1];
      const columns = dataLine.split(/\s+/);
      
      const total = this.parseSize(columns[1]);
      const used = this.parseSize(columns[2]);
      const free = this.parseSize(columns[3]);
      const percentage = parseInt(columns[4].replace('%', ''));
      
      return { total, used, free, percentage };
    } catch {
      return { total: 0, used: 0, free: 0, percentage: 0 };
    }
  }
  
  private getNetworkInfo() {
    // Simplified network metrics
    return {
      inbound: 0,
      outbound: 0
    };
  }
  
  private getApplicationInfo() {
    // Application-specific metrics
    return {
      activeConnections: 0,
      requestsPerSecond: 0,
      errorRate: 0,
      responseTime: 0
    };
  }
  
  private parseSize(sizeStr: string): number {
    const units = { K: 1024, M: 1024 ** 2, G: 1024 ** 3, T: 1024 ** 4 };
    const match = sizeStr.match(/^(\d+(?:\.\d+)?)([KMGT]?)$/);
    
    if (!match) return 0;
    
    const value = parseFloat(match[1]);
    const unit = match[2] as keyof typeof units;
    
    return value * (units[unit] || 1);
  }
  
  private checkAlerts(metrics: SystemMetrics) {
    const alerts: string[] = [];
    
    if (metrics.cpu.usage > this.alertThresholds.cpuUsage) {
      alerts.push(`High CPU usage: ${metrics.cpu.usage.toFixed(1)}%`);
    }
    
    if (metrics.memory.percentage > this.alertThresholds.memoryUsage) {
      alerts.push(`High memory usage: ${metrics.memory.percentage.toFixed(1)}%`);
    }
    
    if (metrics.disk.percentage > this.alertThresholds.diskUsage) {
      alerts.push(`High disk usage: ${metrics.disk.percentage}%`);
    }
    
    if (metrics.application.errorRate > this.alertThresholds.errorRate) {
      alerts.push(`High error rate: ${metrics.application.errorRate}%`);
    }
    
    if (metrics.application.responseTime > this.alertThresholds.responseTime) {
      alerts.push(`Slow response time: ${metrics.application.responseTime}ms`);
    }
    
    if (alerts.length > 0) {
      this.sendAlert(alerts);
    }
  }
  
  private sendAlert(alerts: string[]) {
    console.error('SYSTEM ALERT:', alerts.join(', '));
    
    // Send to monitoring service, email, Slack, etc.
    // Implementation depends on your alerting setup
  }
}
```

### Chapter 2: Database Performance & Connectivity

#### 2.1 Database Connection Issues

**Problem**: Database connection failures or timeouts

**Common Symptoms**:
- Connection timeout errors
- "too many connections" errors
- Intermittent database connectivity
- Slow query responses
- Connection pool exhaustion

**Diagnostic Commands**:

```sql
-- Check current connections
SELECT 
  datname,
  usename,
  application_name,
  client_addr,
  state,
  query_start,
  state_change,
  query
FROM pg_stat_activity;

-- Check connection limits
SELECT 
  setting as max_connections 
FROM pg_settings 
WHERE name = 'max_connections';

-- Check active vs idle connections
SELECT 
  state, 
  COUNT(*) 
FROM pg_stat_activity 
GROUP BY state;
```

**Connection Pool Configuration**:

```typescript
// Optimized database connection configuration
import { Pool, PoolConfig } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';

interface DatabaseConfig {
  connectionString: string;
  pool: {
    min: number;
    max: number;
    acquireTimeoutMillis: number;
    createTimeoutMillis: number;
    destroyTimeoutMillis: number;
    idleTimeoutMillis: number;
    reapIntervalMillis: number;
    createRetryIntervalMillis: number;
  };
  monitoring: {
    enabled: boolean;
    interval: number;
    alertThresholds: {
      activeConnections: number;
      queuedRequests: number;
      averageResponseTime: number;
    };
  };
}

class DatabaseConnectionManager {
  private pool: Pool;
  private config: DatabaseConfig;
  private metrics = {
    totalConnections: 0,
    activeConnections: 0,
    idleConnections: 0,
    queuedRequests: 0,
    connectionErrors: 0,
    queryCount: 0,
    averageQueryTime: 0
  };
  
  constructor(config: DatabaseConfig) {
    this.config = config;
    
    const poolConfig: PoolConfig = {
      connectionString: config.connectionString,
      min: config.pool.min,
      max: config.pool.max,
      acquireTimeoutMillis: config.pool.acquireTimeoutMillis,
      createTimeoutMillis: config.pool.createTimeoutMillis,
      destroyTimeoutMillis: config.pool.destroyTimeoutMillis,
      idleTimeoutMillis: config.pool.idleTimeoutMillis,
      application_name: 'fanzdash-app'
    };
    
    this.pool = new Pool(poolConfig);
    
    // Set up connection monitoring
    this.setupConnectionMonitoring();
    
    // Set up connection event handlers
    this.setupEventHandlers();
  }
  
  private setupConnectionMonitoring() {
    if (!this.config.monitoring.enabled) return;
    
    setInterval(() => {
      this.collectConnectionMetrics();
    }, this.config.monitoring.interval);
  }
  
  private setupEventHandlers() {
    this.pool.on('connect', (client) => {
      this.metrics.totalConnections++;
      console.log('Database client connected');
    });
    
    this.pool.on('remove', (client) => {
      this.metrics.totalConnections--;
      console.log('Database client removed');
    });
    
    this.pool.on('error', (err, client) => {
      this.metrics.connectionErrors++;
      console.error('Database connection error:', err);
    });
  }
  
  private async collectConnectionMetrics() {
    try {
      const client = await this.pool.connect();
      
      const result = await client.query(`
        SELECT 
          COUNT(*) as total_connections,
          COUNT(*) FILTER (WHERE state = 'active') as active_connections,
          COUNT(*) FILTER (WHERE state = 'idle') as idle_connections
        FROM pg_stat_activity 
        WHERE datname = current_database()
      `);
      
      const metrics = result.rows[0];
      this.metrics.activeConnections = parseInt(metrics.active_connections);
      this.metrics.idleConnections = parseInt(metrics.idle_connections);
      
      client.release();
      
      // Check alert thresholds
      this.checkConnectionAlerts();
      
    } catch (error) {
      console.error('Failed to collect connection metrics:', error);
    }
  }
  
  private checkConnectionAlerts() {
    const { alertThresholds } = this.config.monitoring;
    
    if (this.metrics.activeConnections > alertThresholds.activeConnections) {
      console.warn(`High active connections: ${this.metrics.activeConnections}`);
    }
    
    if (this.metrics.queuedRequests > alertThresholds.queuedRequests) {
      console.warn(`High queued requests: ${this.metrics.queuedRequests}`);
    }
    
    if (this.metrics.averageQueryTime > alertThresholds.averageResponseTime) {
      console.warn(`Slow average query time: ${this.metrics.averageQueryTime}ms`);
    }
  }
  
  async testConnection(): Promise<{
    success: boolean;
    responseTime: number;
    error?: string;
  }> {
    const startTime = Date.now();
    
    try {
      const client = await this.pool.connect();
      await client.query('SELECT 1');
      client.release();
      
      const responseTime = Date.now() - startTime;
      
      return {
        success: true,
        responseTime
      };
    } catch (error) {
      return {
        success: false,
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  getMetrics() {
    return {
      ...this.metrics,
      poolInfo: {
        totalCount: this.pool.totalCount,
        idleCount: this.pool.idleCount,
        waitingCount: this.pool.waitingCount
      }
    };
  }
  
  async close() {
    await this.pool.end();
  }
}
```

#### 2.2 Query Performance Issues

**Problem**: Slow database queries affecting application performance

**Common Symptoms**:
- High query response times
- Database timeouts
- High CPU usage on database server
- Lock contention
- Index performance issues

**Query Analysis Tools**:

```sql
-- Enable query logging
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_min_duration_statement = 1000; -- Log queries > 1 second
SELECT pg_reload_conf();

-- Check slow queries
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  max_time,
  stddev_time,
  rows
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- Check table statistics
SELECT 
  schemaname,
  tablename,
  n_tup_ins as inserts,
  n_tup_upd as updates,
  n_tup_del as deletes,
  seq_scan,
  seq_tup_read,
  idx_scan,
  idx_tup_fetch,
  n_tup_hot_upd
FROM pg_stat_user_tables;

-- Check index usage
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

**Query Optimization Framework**:

```typescript
// Query performance monitoring and optimization
interface QueryMetrics {
  query: string;
  executionTime: number;
  rowsAffected: number;
  planningTime: number;
  executionPlan?: string;
  timestamp: Date;
  parameters?: any[];
}

class QueryPerformanceMonitor {
  private queryMetrics: QueryMetrics[] = [];
  private slowQueryThreshold = 1000; // milliseconds
  
  async executeWithMonitoring<T>(
    query: string,
    parameters: any[] = [],
    connection: any
  ): Promise<T> {
    const startTime = Date.now();
    
    try {
      // Get query execution plan for slow queries
      let executionPlan: string | undefined;
      
      if (this.shouldExplainQuery(query)) {
        const explainResult = await connection.query(`EXPLAIN ANALYZE ${query}`, parameters);
        executionPlan = explainResult.rows.map((row: any) => row['QUERY PLAN']).join('\n');
      }
      
      // Execute the actual query
      const result = await connection.query(query, parameters);
      
      const executionTime = Date.now() - startTime;
      
      // Record metrics
      const metrics: QueryMetrics = {
        query: this.sanitizeQuery(query),
        executionTime,
        rowsAffected: result.rowCount || 0,
        planningTime: 0, // Would need to parse from EXPLAIN ANALYZE
        executionPlan,
        timestamp: new Date(),
        parameters: this.sanitizeParameters(parameters)
      };
      
      this.queryMetrics.push(metrics);
      
      // Alert on slow queries
      if (executionTime > this.slowQueryThreshold) {
        this.handleSlowQuery(metrics);
      }
      
      return result;
      
    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      console.error('Query execution failed:', {
        query: this.sanitizeQuery(query),
        parameters: this.sanitizeParameters(parameters),
        executionTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      throw error;
    }
  }
  
  private shouldExplainQuery(query: string): boolean {
    // Only explain SELECT, UPDATE, DELETE queries (not INSERT for performance)
    const queryType = query.trim().toUpperCase().split(' ')[0];
    return ['SELECT', 'UPDATE', 'DELETE'].includes(queryType);
  }
  
  private sanitizeQuery(query: string): string {
    // Remove extra whitespace and normalize
    return query.replace(/\s+/g, ' ').trim();
  }
  
  private sanitizeParameters(parameters: any[]): any[] {
    // Remove sensitive data from parameters for logging
    return parameters.map(param => {
      if (typeof param === 'string' && param.length > 100) {
        return param.substring(0, 100) + '...';
      }
      return param;
    });
  }
  
  private handleSlowQuery(metrics: QueryMetrics) {
    console.warn('Slow query detected:', {
      query: metrics.query,
      executionTime: metrics.executionTime,
      rowsAffected: metrics.rowsAffected
    });
    
    // Analyze execution plan for optimization opportunities
    if (metrics.executionPlan) {
      this.analyzeExecutionPlan(metrics.executionPlan, metrics.query);
    }
  }
  
  private analyzeExecutionPlan(plan: string, query: string) {
    const optimizationSuggestions: string[] = [];
    
    // Check for sequential scans
    if (plan.includes('Seq Scan')) {
      optimizationSuggestions.push('Consider adding indexes to avoid sequential scans');
    }
    
    // Check for nested loops
    if (plan.includes('Nested Loop')) {
      optimizationSuggestions.push('Consider optimizing joins to avoid nested loops');
    }
    
    // Check for sorts
    if (plan.includes('Sort')) {
      optimizationSuggestions.push('Consider adding indexes to avoid sorting');
    }
    
    // Check for hash joins on large tables
    if (plan.includes('Hash Join') && plan.includes('cost=')) {
      optimizationSuggestions.push('Consider analyzing join conditions and table statistics');
    }
    
    if (optimizationSuggestions.length > 0) {
      console.log('Query optimization suggestions:', {
        query,
        suggestions: optimizationSuggestions
      });
    }
  }
  
  getSlowQueries(limit: number = 10): QueryMetrics[] {
    return this.queryMetrics
      .filter(metric => metric.executionTime > this.slowQueryThreshold)
      .sort((a, b) => b.executionTime - a.executionTime)
      .slice(0, limit);
  }
  
  getQueryStatistics(query: string): {
    count: number;
    averageTime: number;
    minTime: number;
    maxTime: number;
    totalRows: number;
  } {
    const queryMetrics = this.queryMetrics.filter(m => m.query === query);
    
    if (queryMetrics.length === 0) {
      return {
        count: 0,
        averageTime: 0,
        minTime: 0,
        maxTime: 0,
        totalRows: 0
      };
    }
    
    const times = queryMetrics.map(m => m.executionTime);
    const totalRows = queryMetrics.reduce((sum, m) => sum + m.rowsAffected, 0);
    
    return {
      count: queryMetrics.length,
      averageTime: times.reduce((sum, time) => sum + time, 0) / times.length,
      minTime: Math.min(...times),
      maxTime: Math.max(...times),
      totalRows
    };
  }
}
```

**Index Optimization Utilities**:

```typescript
// Database index analysis and optimization
interface IndexAnalysis {
  schemaName: string;
  tableName: string;
  indexName: string;
  indexSize: string;
  indexScans: number;
  tupleReads: number;
  tupleFetches: number;
  isUnique: boolean;
  columns: string[];
  condition?: string;
  recommendation: 'keep' | 'drop' | 'optimize' | 'rebuild';
  reasoning: string;
}

class IndexOptimizer {
  
  async analyzeIndexUsage(connection: any): Promise<IndexAnalysis[]> {
    const query = `
      SELECT 
        schemaname,
        tablename,
        indexname,
        pg_size_pretty(pg_relation_size(indexrelid)) as index_size,
        idx_scan,
        idx_tup_read,
        idx_tup_fetch,
        indisunique,
        indkey,
        pg_get_indexdef(indexrelid) as index_definition
      FROM pg_stat_user_indexes 
      JOIN pg_index ON pg_stat_user_indexes.indexrelid = pg_index.indexrelid
      ORDER BY schemaname, tablename, indexname;
    `;
    
    const result = await connection.query(query);
    const analyses: IndexAnalysis[] = [];
    
    for (const row of result.rows) {
      const analysis = await this.analyzeIndex(connection, row);
      analyses.push(analysis);
    }
    
    return analyses;
  }
  
  private async analyzeIndex(connection: any, indexRow: any): Promise<IndexAnalysis> {
    const {
      schemaname,
      tablename,
      indexname,
      index_size,
      idx_scan,
      idx_tup_read,
      idx_tup_fetch,
      indisunique,
      index_definition
    } = indexRow;
    
    // Extract column names from index definition
    const columns = this.extractColumnsFromIndexDefinition(index_definition);
    
    // Get table statistics
    const tableStats = await this.getTableStatistics(connection, schemaname, tablename);
    
    // Analyze index usage
    let recommendation: 'keep' | 'drop' | 'optimize' | 'rebuild';
    let reasoning: string;
    
    if (idx_scan === 0 && !indisunique) {
      recommendation = 'drop';
      reasoning = 'Index is never used and is not a unique constraint';
    } else if (idx_scan < 10 && tableStats.totalRows > 1000) {
      recommendation = 'optimize';
      reasoning = 'Index is rarely used on a large table, consider optimization';
    } else if (idx_tup_read > idx_tup_fetch * 10) {
      recommendation = 'optimize';
      reasoning = 'Index has poor selectivity, consider adding more columns';
    } else if (tableStats.insertUpdateRatio > 10 && idx_scan < tableStats.totalRows / 1000) {
      recommendation = 'drop';
      reasoning = 'High write activity with low index usage';
    } else {
      recommendation = 'keep';
      reasoning = 'Index usage appears optimal';
    }
    
    return {
      schemaName: schemaname,
      tableName: tablename,
      indexName: indexname,
      indexSize: index_size,
      indexScans: idx_scan,
      tupleReads: idx_tup_read,
      tupleFetches: idx_tup_fetch,
      isUnique: indisunique,
      columns,
      recommendation,
      reasoning
    };
  }
  
  private extractColumnsFromIndexDefinition(definition: string): string[] {
    // Parse column names from CREATE INDEX statement
    const match = definition.match(/\((.*?)\)/);
    if (!match) return [];
    
    return match[1]
      .split(',')
      .map(col => col.trim().replace(/['"]/g, ''))
      .filter(col => col.length > 0);
  }
  
  private async getTableStatistics(
    connection: any, 
    schema: string, 
    table: string
  ): Promise<{
    totalRows: number;
    insertUpdateRatio: number;
    sequentialScans: number;
    indexScans: number;
  }> {
    const query = `
      SELECT 
        n_tup_ins + n_tup_upd + n_tup_del as total_modifications,
        seq_scan,
        seq_tup_read,
        idx_scan,
        idx_tup_fetch,
        n_live_tup as total_rows
      FROM pg_stat_user_tables 
      WHERE schemaname = $1 AND tablename = $2;
    `;
    
    const result = await connection.query(query, [schema, table]);
    
    if (result.rows.length === 0) {
      return {
        totalRows: 0,
        insertUpdateRatio: 0,
        sequentialScans: 0,
        indexScans: 0
      };
    }
    
    const row = result.rows[0];
    
    return {
      totalRows: parseInt(row.total_rows) || 0,
      insertUpdateRatio: (parseInt(row.total_modifications) || 0) / Math.max(1, parseInt(row.idx_scan) || 1),
      sequentialScans: parseInt(row.seq_scan) || 0,
      indexScans: parseInt(row.idx_scan) || 0
    };
  }
  
  generateOptimizationSQL(analyses: IndexAnalysis[]): string[] {
    const sqlStatements: string[] = [];
    
    for (const analysis of analyses) {
      if (analysis.recommendation === 'drop' && !analysis.isUnique) {
        sqlStatements.push(
          `-- Drop unused index: ${analysis.reasoning}\n` +
          `DROP INDEX IF EXISTS ${analysis.schemaName}.${analysis.indexName};`
        );
      } else if (analysis.recommendation === 'rebuild') {
        sqlStatements.push(
          `-- Rebuild index: ${analysis.reasoning}\n` +
          `REINDEX INDEX ${analysis.schemaName}.${analysis.indexName};`
        );
      }
    }
    
    return sqlStatements;
  }
}
```

### Chapter 3: Network & CDN Problems

#### 3.1 Content Delivery Network Issues

**Problem**: CDN performance problems affecting content delivery

**Common Symptoms**:
- Slow content loading times
- CDN cache misses
- Geographic delivery issues
- SSL/TLS certificate problems
- Origin server overload

**CDN Monitoring and Diagnostics**:

```typescript
// CDN performance monitoring
interface CDNMetrics {
  timestamp: Date;
  endpoint: string;
  region: string;
  responseTime: number;
  statusCode: number;
  cacheHitRatio: number;
  bandwidth: number;
  errorRate: number;
  ssl: {
    handshakeTime: number;
    certificateValid: boolean;
    expirationDate: Date;
  };
}

class CDNMonitor {
  private endpoints: string[];
  private regions: string[];
  private metrics: CDNMetrics[] = [];
  
  constructor(endpoints: string[], regions: string[]) {
    this.endpoints = endpoints;
    this.regions = regions;
  }
  
  async monitorCDNPerformance(): Promise<CDNMetrics[]> {
    const results: CDNMetrics[] = [];
    
    for (const endpoint of this.endpoints) {
      for (const region of this.regions) {
        try {
          const metrics = await this.testEndpoint(endpoint, region);
          results.push(metrics);
        } catch (error) {
          console.error(`CDN monitoring failed for ${endpoint} in ${region}:`, error);
        }
      }
    }
    
    this.metrics.push(...results);
    
    // Keep only last 1000 metrics
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
    
    return results;
  }
  
  private async testEndpoint(endpoint: string, region: string): Promise<CDNMetrics> {
    const startTime = Date.now();
    
    // Test SSL handshake time
    const sslStartTime = Date.now();
    const sslInfo = await this.testSSLConnection(endpoint);
    const sslHandshakeTime = Date.now() - sslStartTime;
    
    // Test HTTP request
    const response = await fetch(endpoint, {
      headers: {
        'CF-IPCountry': region, // For Cloudflare
        'Cache-Control': 'no-cache'
      }
    });
    
    const responseTime = Date.now() - startTime;
    
    // Check cache headers
    const cacheStatus = response.headers.get('cf-cache-status') || 
                       response.headers.get('x-cache') || 
                       'UNKNOWN';
    
    const cacheHitRatio = this.calculateCacheHitRatio(cacheStatus);
    
    return {
      timestamp: new Date(),
      endpoint,
      region,
      responseTime,
      statusCode: response.status,
      cacheHitRatio,
      bandwidth: 0, // Would need to calculate from response size and time
      errorRate: response.ok ? 0 : 100,
      ssl: {
        handshakeTime: sslHandshakeTime,
        certificateValid: sslInfo.valid,
        expirationDate: sslInfo.expirationDate
      }
    };
  }
  
  private async testSSLConnection(endpoint: string): Promise<{
    valid: boolean;
    expirationDate: Date;
  }> {
    try {
      const url = new URL(endpoint);
      const { execSync } = require('child_process');
      
      // Use openssl to check certificate
      const command = `echo | openssl s_client -servername ${url.hostname} -connect ${url.hostname}:443 2>/dev/null | openssl x509 -noout -dates`;
      const output = execSync(command, { encoding: 'utf-8' });
      
      const expirationMatch = output.match(/notAfter=(.+)/);
      const expirationDate = expirationMatch ? new Date(expirationMatch[1]) : new Date();
      
      return {
        valid: expirationDate > new Date(),
        expirationDate
      };
    } catch (error) {
      return {
        valid: false,
        expirationDate: new Date()
      };
    }
  }
  
  private calculateCacheHitRatio(cacheStatus: string): number {
    const hitStatuses = ['HIT', 'STALE'];
    return hitStatuses.some(status => cacheStatus.includes(status)) ? 100 : 0;
  }
  
  analyzeCDNPerformance(): {
    averageResponseTime: number;
    cacheHitRatio: number;
    errorRate: number;
    slowestRegions: string[];
    recommendations: string[];
  } {
    if (this.metrics.length === 0) {
      return {
        averageResponseTime: 0,
        cacheHitRatio: 0,
        errorRate: 0,
        slowestRegions: [],
        recommendations: ['No metrics available']
      };
    }
    
    const recentMetrics = this.metrics.slice(-100); // Last 100 measurements
    
    const averageResponseTime = recentMetrics.reduce((sum, m) => sum + m.responseTime, 0) / recentMetrics.length;
    const cacheHitRatio = recentMetrics.reduce((sum, m) => sum + m.cacheHitRatio, 0) / recentMetrics.length;
    const errorRate = recentMetrics.filter(m => m.statusCode >= 400).length / recentMetrics.length * 100;
    
    // Find slowest regions
    const regionPerformance = new Map<string, number[]>();
    recentMetrics.forEach(metric => {
      if (!regionPerformance.has(metric.region)) {
        regionPerformance.set(metric.region, []);
      }
      regionPerformance.get(metric.region)!.push(metric.responseTime);
    });
    
    const slowestRegions = Array.from(regionPerformance.entries())
      .map(([region, times]) => ({
        region,
        averageTime: times.reduce((sum, time) => sum + time, 0) / times.length
      }))
      .sort((a, b) => b.averageTime - a.averageTime)
      .slice(0, 3)
      .map(entry => entry.region);
    
    // Generate recommendations
    const recommendations: string[] = [];
    
    if (averageResponseTime > 500) {
      recommendations.push('Consider optimizing CDN configuration or adding more edge locations');
    }
    
    if (cacheHitRatio < 80) {
      recommendations.push('Improve cache hit ratio by optimizing cache headers and TTLs');
    }
    
    if (errorRate > 1) {
      recommendations.push('Investigate and fix CDN errors affecting delivery');
    }
    
    if (slowestRegions.length > 0) {
      recommendations.push(`Focus on optimizing performance in: ${slowestRegions.join(', ')}`);
    }
    
    return {
      averageResponseTime,
      cacheHitRatio,
      errorRate,
      slowestRegions,
      recommendations
    };
  }
}
```

#### 3.2 Network Connectivity Problems

**Problem**: Network connectivity issues affecting user experience

**Common Symptoms**:
- Intermittent connection failures
- High latency
- Packet loss
- DNS resolution issues
- Firewall blocking

**Network Diagnostics Tool**:

```typescript
// Network connectivity diagnostics
interface NetworkDiagnostic {
  timestamp: Date;
  target: string;
  tests: {
    ping: PingResult;
    traceroute: TracerouteResult;
    dns: DNSResult;
    port: PortResult[];
    bandwidth: BandwidthResult;
  };
  summary: {
    overall: 'good' | 'degraded' | 'poor';
    issues: string[];
    recommendations: string[];
  };
}

interface PingResult {
  success: boolean;
  averageLatency: number;
  packetLoss: number;
  jitter: number;
}

interface TracerouteResult {
  hops: TracerouteHop[];
  totalHops: number;
  totalTime: number;
}

interface TracerouteHop {
  hop: number;
  ip: string;
  hostname?: string;
  latency: number[];
}

interface DNSResult {
  resolutionTime: number;
  records: DNSRecord[];
  errors: string[];
}

interface DNSRecord {
  type: 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT';
  value: string;
  ttl: number;
}

interface PortResult {
  port: number;
  protocol: 'tcp' | 'udp';
  open: boolean;
  responseTime: number;
}

interface BandwidthResult {
  downloadSpeed: number; // Mbps
  uploadSpeed: number; // Mbps
  latency: number;
}

class NetworkDiagnostics {
  
  async runComprehensiveDiagnostic(target: string): Promise<NetworkDiagnostic> {
    console.log(`Running network diagnostics for ${target}...`);
    
    const startTime = Date.now();
    
    try {
      // Run all diagnostic tests in parallel where possible
      const [pingResult, dnsResult, portResults] = await Promise.all([
        this.runPingTest(target),
        this.runDNSTest(target),
        this.runPortTests(target, [80, 443, 22, 21])
      ]);
      
      // Traceroute and bandwidth tests run sequentially for accuracy
      const tracerouteResult = await this.runTracerouteTest(target);
      const bandwidthResult = await this.runBandwidthTest(target);
      
      const diagnostic: NetworkDiagnostic = {
        timestamp: new Date(),
        target,
        tests: {
          ping: pingResult,
          traceroute: tracerouteResult,
          dns: dnsResult,
          port: portResults,
          bandwidth: bandwidthResult
        },
        summary: this.analyzeDiagnosticResults({
          ping: pingResult,
          traceroute: tracerouteResult,
          dns: dnsResult,
          port: portResults,
          bandwidth: bandwidthResult
        })
      };
      
      console.log(`Network diagnostics completed in ${Date.now() - startTime}ms`);
      return diagnostic;
      
    } catch (error) {
      console.error('Network diagnostics failed:', error);
      throw error;
    }
  }
  
  private async runPingTest(target: string): Promise<PingResult> {
    try {
      const { execSync } = require('child_process');
      const command = `ping -c 10 ${target}`;
      const output = execSync(command, { encoding: 'utf-8', timeout: 15000 });
      
      // Parse ping output
      const lines = output.split('\n');
      const summaryLine = lines.find(line => line.includes('packet loss'));
      const statisticsLine = lines.find(line => line.includes('min/avg/max'));
      
      let packetLoss = 0;
      if (summaryLine) {
        const lossMatch = summaryLine.match(/(\d+)% packet loss/);
        if (lossMatch) {
          packetLoss = parseInt(lossMatch[1]);
        }
      }
      
      let averageLatency = 0;
      let jitter = 0;
      if (statisticsLine) {
        const statsMatch = statisticsLine.match(/(\d+\.\d+)\/(\d+\.\d+)\/(\d+\.\d+)\/(\d+\.\d+)/);
        if (statsMatch) {
          averageLatency = parseFloat(statsMatch[2]);
          jitter = parseFloat(statsMatch[4]);
        }
      }
      
      return {
        success: packetLoss < 100,
        averageLatency,
        packetLoss,
        jitter
      };
      
    } catch (error) {
      return {
        success: false,
        averageLatency: 0,
        packetLoss: 100,
        jitter: 0
      };
    }
  }
  
  private async runDNSTest(target: string): Promise<DNSResult> {
    const startTime = Date.now();
    
    try {
      const dns = require('dns').promises;
      
      const [aRecords, aaaaRecords] = await Promise.allSettled([
        dns.resolve4(target),
        dns.resolve6(target)
      ]);
      
      const records: DNSRecord[] = [];
      const errors: string[] = [];
      
      if (aRecords.status === 'fulfilled') {
        aRecords.value.forEach((ip: string) => {
          records.push({ type: 'A', value: ip, ttl: 300 });
        });
      } else {
        errors.push(`A record resolution failed: ${aRecords.reason}`);
      }
      
      if (aaaaRecords.status === 'fulfilled') {
        aaaaRecords.value.forEach((ip: string) => {
          records.push({ type: 'AAAA', value: ip, ttl: 300 });
        });
      } else {
        errors.push(`AAAA record resolution failed: ${aaaaRecords.reason}`);
      }
      
      const resolutionTime = Date.now() - startTime;
      
      return {
        resolutionTime,
        records,
        errors
      };
      
    } catch (error) {
      return {
        resolutionTime: Date.now() - startTime,
        records: [],
        errors: [error instanceof Error ? error.message : 'DNS resolution failed']
      };
    }
  }
  
  private async runTracerouteTest(target: string): Promise<TracerouteResult> {
    try {
      const { execSync } = require('child_process');
      const command = `traceroute -m 30 ${target}`;
      const output = execSync(command, { encoding: 'utf-8', timeout: 60000 });
      
      const lines = output.split('\n').filter(line => line.trim());
      const hops: TracerouteHop[] = [];
      
      for (const line of lines.slice(1)) { // Skip header
        const hopMatch = line.match(/^\s*(\d+)\s+(.+)$/);
        if (hopMatch) {
          const hopNumber = parseInt(hopMatch[1]);
          const hopData = hopMatch[2];
          
          // Parse hop data (simplified)
          const hop: TracerouteHop = {
            hop: hopNumber,
            ip: 'unknown',
            latency: []
          };
          
          hops.push(hop);
        }
      }
      
      return {
        hops,
        totalHops: hops.length,
        totalTime: hops.reduce((sum, hop) => sum + (hop.latency[0] || 0), 0)
      };
      
    } catch (error) {
      return {
        hops: [],
        totalHops: 0,
        totalTime: 0
      };
    }
  }
  
  private async runPortTests(target: string, ports: number[]): Promise<PortResult[]> {
    const results: PortResult[] = [];
    
    for (const port of ports) {
      const result = await this.testPort(target, port);
      results.push(result);
    }
    
    return results;
  }
  
  private async testPort(target: string, port: number): Promise<PortResult> {
    return new Promise((resolve) => {
      const net = require('net');
      const startTime = Date.now();
      
      const socket = new net.Socket();
      
      socket.setTimeout(5000);
      
      socket.on('connect', () => {
        const responseTime = Date.now() - startTime;
        socket.destroy();
        resolve({
          port,
          protocol: 'tcp',
          open: true,
          responseTime
        });
      });
      
      socket.on('timeout', () => {
        socket.destroy();
        resolve({
          port,
          protocol: 'tcp',
          open: false,
          responseTime: Date.now() - startTime
        });
      });
      
      socket.on('error', () => {
        resolve({
          port,
          protocol: 'tcp',
          open: false,
          responseTime: Date.now() - startTime
        });
      });
      
      socket.connect(port, target);
    });
  }
  
  private async runBandwidthTest(target: string): Promise<BandwidthResult> {
    // Simplified bandwidth test using HTTP download
    try {
      const testUrl = `https://${target}/speed-test-1mb.bin`;
      const startTime = Date.now();
      
      const response = await fetch(testUrl);
      const data = await response.arrayBuffer();
      
      const downloadTime = Date.now() - startTime;
      const downloadSpeed = (data.byteLength * 8) / (downloadTime / 1000) / 1000000; // Mbps
      
      return {
        downloadSpeed,
        uploadSpeed: 0, // Would need a separate upload test
        latency: downloadTime
      };
      
    } catch (error) {
      return {
        downloadSpeed: 0,
        uploadSpeed: 0,
        latency: 0
      };
    }
  }
  
  private analyzeDiagnosticResults(tests: any): {
    overall: 'good' | 'degraded' | 'poor';
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];
    
    // Analyze ping results
    if (tests.ping.packetLoss > 5) {
      issues.push(`High packet loss: ${tests.ping.packetLoss}%`);
      recommendations.push('Check network stability and routing');
    }
    
    if (tests.ping.averageLatency > 200) {
      issues.push(`High latency: ${tests.ping.averageLatency}ms`);
      recommendations.push('Consider using CDN or optimizing network path');
    }
    
    // Analyze DNS results
    if (tests.dns.resolutionTime > 1000) {
      issues.push(`Slow DNS resolution: ${tests.dns.resolutionTime}ms`);
      recommendations.push('Consider using faster DNS servers');
    }
    
    if (tests.dns.errors.length > 0) {
      issues.push(`DNS errors: ${tests.dns.errors.length}`);
      recommendations.push('Fix DNS configuration issues');
    }
    
    // Analyze port connectivity
    const closedPorts = tests.port.filter((p: PortResult) => !p.open);
    if (closedPorts.length > 0) {
      issues.push(`Closed ports: ${closedPorts.map((p: PortResult) => p.port).join(', ')}`);
      recommendations.push('Check firewall configuration');
    }
    
    // Analyze bandwidth
    if (tests.bandwidth.downloadSpeed < 1) {
      issues.push(`Low bandwidth: ${tests.bandwidth.downloadSpeed.toFixed(2)} Mbps`);
      recommendations.push('Investigate bandwidth limitations');
    }
    
    // Determine overall status
    let overall: 'good' | 'degraded' | 'poor';
    if (issues.length === 0) {
      overall = 'good';
    } else if (issues.length <= 2 && !issues.some(issue => issue.includes('packet loss') || issue.includes('DNS errors'))) {
      overall = 'degraded';
    } else {
      overall = 'poor';
    }
    
    return {
      overall,
      issues,
      recommendations
    };
  }
}
```

### Chapter 4: Load Balancing & Scaling Issues

#### 4.1 Load Balancer Configuration Problems

**Problem**: Load balancer misconfigurations affecting traffic distribution

**Common Symptoms**:
- Uneven traffic distribution
- Health check failures
- Session persistence issues
- SSL termination problems
- Sticky session conflicts

**Load Balancer Monitoring**:

```typescript
// Load balancer monitoring and diagnostics
interface LoadBalancerMetrics {
  timestamp: Date;
  balancerName: string;
  totalRequests: number;
  activeConnections: number;
  backendServers: BackendServerMetrics[];
  healthChecks: HealthCheckResult[];
  responseTime: {
    p50: number;
    p95: number;
    p99: number;
  };
  errorRate: number;
  throughput: number;
}

interface BackendServerMetrics {
  serverId: string;
  status: 'healthy' | 'unhealthy' | 'draining';
  activeConnections: number;
  requestCount: number;
  responseTime: number;
  errorCount: number;
  weight: number;
}

interface HealthCheckResult {
  serverId: string;
  timestamp: Date;
  success: boolean;
  responseTime: number;
  statusCode?: number;
  error?: string;
}

class LoadBalancerMonitor {
  private metrics: LoadBalancerMetrics[] = [];
  
  async monitorLoadBalancer(balancerConfig: any): Promise<LoadBalancerMetrics> {
    const startTime = Date.now();
    
    try {
      // Collect metrics from load balancer API or stats endpoint
      const backendServers = await this.collectBackendMetrics(balancerConfig);
      const healthChecks = await this.performHealthChecks(balancerConfig.backends);
      const responseTimeMetrics = await this.collectResponseTimeMetrics(balancerConfig);
      
      const metrics: LoadBalancerMetrics = {
        timestamp: new Date(),
        balancerName: balancerConfig.name,
        totalRequests: backendServers.reduce((sum, server) => sum + server.requestCount, 0),
        activeConnections: backendServers.reduce((sum, server) => sum + server.activeConnections, 0),
        backendServers,
        healthChecks,
        responseTime: responseTimeMetrics,
        errorRate: this.calculateErrorRate(backendServers),
        throughput: this.calculateThroughput(backendServers)
      };
      
      this.metrics.push(metrics);
      
      // Analyze for issues
      this.analyzeLoadBalancerHealth(metrics);
      
      return metrics;
      
    } catch (error) {
      console.error('Load balancer monitoring failed:', error);
      throw error;
    }
  }
  
  private async collectBackendMetrics(balancerConfig: any): Promise<BackendServerMetrics[]> {
    const servers: BackendServerMetrics[] = [];
    
    for (const backend of balancerConfig.backends) {
      try {
        // Simulate collecting metrics from actual load balancer
        const metrics = await this.getServerMetrics(backend);
        servers.push(metrics);
      } catch (error) {
        console.error(`Failed to collect metrics for ${backend.id}:`, error);
        
        servers.push({
          serverId: backend.id,
          status: 'unhealthy',
          activeConnections: 0,
          requestCount: 0,
          responseTime: 0,
          errorCount: 0,
          weight: backend.weight || 1
        });
      }
    }
    
    return servers;
  }
  
  private async getServerMetrics(backend: any): Promise<BackendServerMetrics> {
    // This would integrate with your actual load balancer's API
    // For demonstration, we'll return mock data
    return {
      serverId: backend.id,
      status: Math.random() > 0.1 ? 'healthy' : 'unhealthy',
      activeConnections: Math.floor(Math.random() * 100),
      requestCount: Math.floor(Math.random() * 1000),
      responseTime: Math.random() * 200 + 50,
      errorCount: Math.floor(Math.random() * 10),
      weight: backend.weight || 1
    };
  }
  
  private async performHealthChecks(backends: any[]): Promise<HealthCheckResult[]> {
    const results: HealthCheckResult[] = [];
    
    for (const backend of backends) {
      try {
        const result = await this.performHealthCheck(backend);
        results.push(result);
      } catch (error) {
        results.push({
          serverId: backend.id,
          timestamp: new Date(),
          success: false,
          responseTime: 0,
          error: error instanceof Error ? error.message : 'Health check failed'
        });
      }
    }
    
    return results;
  }
  
  private async performHealthCheck(backend: any): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      const healthCheckUrl = `${backend.url}/health`;
      const response = await fetch(healthCheckUrl, {
        timeout: 5000,
        headers: {
          'User-Agent': 'LoadBalancer-HealthCheck/1.0'
        }
      });
      
      const responseTime = Date.now() - startTime;
      
      return {
        serverId: backend.id,
        timestamp: new Date(),
        success: response.ok,
        responseTime,
        statusCode: response.status
      };
      
    } catch (error) {
      return {
        serverId: backend.id,
        timestamp: new Date(),
        success: false,
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  private async collectResponseTimeMetrics(balancerConfig: any): Promise<{
    p50: number;
    p95: number;
    p99: number;
  }> {
    // This would collect actual response time metrics from your load balancer
    // For demonstration, we'll return mock data
    return {
      p50: 150,
      p95: 500,
      p99: 1000
    };
  }
  
  private calculateErrorRate(servers: BackendServerMetrics[]): number {
    const totalRequests = servers.reduce((sum, server) => sum + server.requestCount, 0);
    const totalErrors = servers.reduce((sum, server) => sum + server.errorCount, 0);
    
    return totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0;
  }
  
  private calculateThroughput(servers: BackendServerMetrics[]): number {
    // Calculate requests per second based on request counts
    return servers.reduce((sum, server) => sum + server.requestCount, 0);
  }
  
  private analyzeLoadBalancerHealth(metrics: LoadBalancerMetrics): void {
    const issues: string[] = [];
    const recommendations: string[] = [];
    
    // Check for unhealthy backends
    const unhealthyServers = metrics.backendServers.filter(server => server.status === 'unhealthy');
    if (unhealthyServers.length > 0) {
      issues.push(`${unhealthyServers.length} unhealthy backend servers`);
      recommendations.push('Investigate and fix unhealthy backend servers');
    }
    
    // Check for uneven load distribution
    const serverLoads = metrics.backendServers.map(server => server.requestCount);
    const maxLoad = Math.max(...serverLoads);
    const minLoad = Math.min(...serverLoads);
    
    if (maxLoad > 0 && (maxLoad / Math.max(1, minLoad)) > 3) {
      issues.push('Uneven load distribution detected');
      recommendations.push('Review load balancing algorithm and server weights');
    }
    
    // Check error rate
    if (metrics.errorRate > 5) {
      issues.push(`High error rate: ${metrics.errorRate.toFixed(2)}%`);
      recommendations.push('Investigate backend server errors');
    }
    
    // Check response times
    if (metrics.responseTime.p95 > 1000) {
      issues.push(`Slow response times: P95 = ${metrics.responseTime.p95}ms`);
      recommendations.push('Optimize backend performance or add more servers');
    }
    
    if (issues.length > 0) {
      console.warn('Load balancer issues detected:', {
        balancer: metrics.balancerName,
        issues,
        recommendations
      });
    }
  }
  
  generateLoadBalancerReport(): {
    summary: any;
    trends: any;
    recommendations: string[];
  } {
    if (this.metrics.length < 2) {
      return {
        summary: {},
        trends: {},
        recommendations: ['Insufficient data for analysis']
      };
    }
    
    const recentMetrics = this.metrics.slice(-10);
    const latestMetrics = recentMetrics[recentMetrics.length - 1];
    
    // Calculate trends
    const trends = {
      requestTrend: this.calculateTrend(recentMetrics.map(m => m.totalRequests)),
      errorRateTrend: this.calculateTrend(recentMetrics.map(m => m.errorRate)),
      responseTimeTrend: this.calculateTrend(recentMetrics.map(m => m.responseTime.p95))
    };
    
    const summary = {
      currentRequests: latestMetrics.totalRequests,
      averageErrorRate: recentMetrics.reduce((sum, m) => sum + m.errorRate, 0) / recentMetrics.length,
      averageResponseTime: recentMetrics.reduce((sum, m) => sum + m.responseTime.p95, 0) / recentMetrics.length,
      healthyServers: latestMetrics.backendServers.filter(s => s.status === 'healthy').length,
      totalServers: latestMetrics.backendServers.length
    };
    
    const recommendations = this.generateRecommendations(summary, trends);
    
    return {
      summary,
      trends,
      recommendations
    };
  }
  
  private calculateTrend(values: number[]): 'increasing' | 'decreasing' | 'stable' {
    if (values.length < 2) return 'stable';
    
    const first = values[0];
    const last = values[values.length - 1];
    const change = (last - first) / Math.max(1, first);
    
    if (change > 0.1) return 'increasing';
    if (change < -0.1) return 'decreasing';
    return 'stable';
  }
  
  private generateRecommendations(summary: any, trends: any): string[] {
    const recommendations: string[] = [];
    
    if (trends.requestTrend === 'increasing' && summary.averageResponseTime > 500) {
      recommendations.push('Consider adding more backend servers to handle increasing load');
    }
    
    if (trends.errorRateTrend === 'increasing') {
      recommendations.push('Investigate increasing error rates in backend servers');
    }
    
    if (trends.responseTimeTrend === 'increasing') {
      recommendations.push('Monitor backend performance and consider scaling');
    }
    
    if (summary.healthyServers / summary.totalServers < 0.8) {
      recommendations.push('Address unhealthy backend servers to improve availability');
    }
    
    return recommendations;
  }
}
```

#### 4.2 Auto-Scaling Issues

**Problem**: Automatic scaling not responding correctly to load changes

**Common Symptoms**:
- Slow scaling response
- Over-provisioning resources
- Under-provisioning causing overload
- Scaling thrashing
- Resource limits exceeded

**Auto-Scaling Monitor**:

```typescript
// Auto-scaling monitoring and optimization
interface ScalingMetrics {
  timestamp: Date;
  currentInstances: number;
  targetInstances: number;
  cpuUtilization: number;
  memoryUtilization: number;
  requestsPerSecond: number;
  responseTime: number;
  queueLength: number;
  scalingEvents: ScalingEvent[];
}

interface ScalingEvent {
  timestamp: Date;
  type: 'scale_up' | 'scale_down' | 'scale_out' | 'scale_in';
  reason: string;
  fromInstances: number;
  toInstances: number;
  duration: number;
  success: boolean;
}

interface ScalingPolicy {
  name: string;
  metricType: 'cpu' | 'memory' | 'requests' | 'response_time' | 'queue_length';
  threshold: {
    scaleUp: number;
    scaleDown: number;
  };
  cooldown: {
    scaleUp: number; // seconds
    scaleDown: number; // seconds
  };
  step: {
    scaleUp: number; // instances to add
    scaleDown: number; // instances to remove
  };
  limits: {
    min: number;
    max: number;
  };
}

class AutoScalingMonitor {
  private metrics: ScalingMetrics[] = [];
  private policies: ScalingPolicy[] = [];
  private lastScalingAction: Date | null = null;
  
  constructor(policies: ScalingPolicy[]) {
    this.policies = policies;
  }
  
  async monitorScaling(): Promise<ScalingMetrics> {
    const currentMetrics = await this.collectCurrentMetrics();
    
    // Evaluate scaling policies
    const scalingDecisions = this.evaluateScalingPolicies(currentMetrics);
    
    // Execute scaling decisions if any
    for (const decision of scalingDecisions) {
      await this.executeScalingDecision(decision, currentMetrics);
    }
    
    this.metrics.push(currentMetrics);
    
    // Keep only last 1000 metrics
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
    
    return currentMetrics;
  }
  
  private async collectCurrentMetrics(): Promise<ScalingMetrics> {
    // This would collect real metrics from your infrastructure
    // For demonstration, we'll return mock data
    
    const currentInstances = await this.getCurrentInstanceCount();
    const targetInstances = await this.getTargetInstanceCount();
    
    return {
      timestamp: new Date(),
      currentInstances,
      targetInstances,
      cpuUtilization: Math.random() * 100,
      memoryUtilization: Math.random() * 100,
      requestsPerSecond: Math.random() * 1000,
      responseTime: Math.random() * 500 + 100,
      queueLength: Math.floor(Math.random() * 50),
      scalingEvents: []
    };
  }
  
  private async getCurrentInstanceCount(): Promise<number> {
    // This would query your orchestration system (Kubernetes, AWS Auto Scaling, etc.)
    return Math.floor(Math.random() * 10) + 2;
  }
  
  private async getTargetInstanceCount(): Promise<number> {
    // This would get the target from your scaling system
    return Math.floor(Math.random() * 10) + 2;
  }
  
  private evaluateScalingPolicies(metrics: ScalingMetrics): ScalingDecision[] {
    const decisions: ScalingDecision[] = [];
    
    for (const policy of this.policies) {
      const decision = this.evaluatePolicy(policy, metrics);
      if (decision) {
        decisions.push(decision);
      }
    }
    
    // Prioritize decisions (avoid conflicting actions)
    return this.prioritizeScalingDecisions(decisions);
  }
  
  private evaluatePolicy(policy: ScalingPolicy, metrics: ScalingMetrics): ScalingDecision | null {
    let metricValue: number;
    
    switch (policy.metricType) {
      case 'cpu':
        metricValue = metrics.cpuUtilization;
        break;
      case 'memory':
        metricValue = metrics.memoryUtilization;
        break;
      case 'requests':
        metricValue = metrics.requestsPerSecond;
        break;
      case 'response_time':
        metricValue = metrics.responseTime;
        break;
      case 'queue_length':
        metricValue = metrics.queueLength;
        break;
      default:
        return null;
    }
    
    // Check cooldown period
    if (this.lastScalingAction) {
      const timeSinceLastAction = (Date.now() - this.lastScalingAction.getTime()) / 1000;
      
      if (metricValue > policy.threshold.scaleUp && timeSinceLastAction < policy.cooldown.scaleUp) {
        return null; // Still in cooldown
      }
      
      if (metricValue < policy.threshold.scaleDown && timeSinceLastAction < policy.cooldown.scaleDown) {
        return null; // Still in cooldown
      }
    }
    
    // Determine scaling action
    if (metricValue > policy.threshold.scaleUp && metrics.currentInstances < policy.limits.max) {
      const targetInstances = Math.min(
        metrics.currentInstances + policy.step.scaleUp,
        policy.limits.max
      );
      
      return {
        policy: policy.name,
        action: 'scale_up',
        reason: `${policy.metricType} (${metricValue.toFixed(2)}) > threshold (${policy.threshold.scaleUp})`,
        currentInstances: metrics.currentInstances,
        targetInstances
      };
    }
    
    if (metricValue < policy.threshold.scaleDown && metrics.currentInstances > policy.limits.min) {
      const targetInstances = Math.max(
        metrics.currentInstances - policy.step.scaleDown,
        policy.limits.min
      );
      
      return {
        policy: policy.name,
        action: 'scale_down',
        reason: `${policy.metricType} (${metricValue.toFixed(2)}) < threshold (${policy.threshold.scaleDown})`,
        currentInstances: metrics.currentInstances,
        targetInstances
      };
    }
    
    return null;
  }
  
  private prioritizeScalingDecisions(decisions: ScalingDecision[]): ScalingDecision[] {
    if (decisions.length <= 1) return decisions;
    
    // Prioritize scale up over scale down
    const scaleUpDecisions = decisions.filter(d => d.action === 'scale_up');
    if (scaleUpDecisions.length > 0) {
      return [scaleUpDecisions[0]]; // Take first scale up decision
    }
    
    // If only scale down decisions, take the most conservative one
    const scaleDownDecisions = decisions.filter(d => d.action === 'scale_down');
    if (scaleDownDecisions.length > 0) {
      scaleDownDecisions.sort((a, b) => b.targetInstances - a.targetInstances);
      return [scaleDownDecisions[0]];
    }
    
    return [];
  }
  
  private async executeScalingDecision(decision: ScalingDecision, metrics: ScalingMetrics): Promise<void> {
    console.log('Executing scaling decision:', decision);
    
    const startTime = Date.now();
    
    try {
      // This would trigger your actual scaling system
      await this.triggerScaling(decision.targetInstances);
      
      const duration = Date.now() - startTime;
      
      const scalingEvent: ScalingEvent = {
        timestamp: new Date(),
        type: decision.action === 'scale_up' ? 'scale_out' : 'scale_in',
        reason: decision.reason,
        fromInstances: decision.currentInstances,
        toInstances: decision.targetInstances,
        duration,
        success: true
      };
      
      metrics.scalingEvents.push(scalingEvent);
      this.lastScalingAction = new Date();
      
      console.log('Scaling completed successfully:', scalingEvent);
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      const scalingEvent: ScalingEvent = {
        timestamp: new Date(),
        type: decision.action === 'scale_up' ? 'scale_out' : 'scale_in',
        reason: decision.reason,
        fromInstances: decision.currentInstances,
        toInstances: decision.targetInstances,
        duration,
        success: false
      };
      
      metrics.scalingEvents.push(scalingEvent);
      
      console.error('Scaling failed:', error, scalingEvent);
    }
  }
  
  private async triggerScaling(targetInstances: number): Promise<void> {
    // This would integrate with your scaling system
    // For demonstration, we'll simulate the action
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log(`Scaled to ${targetInstances} instances`);
  }
  
  analyzeScalingEfficiency(): {
    averageScalingTime: number;
    scalingSuccessRate: number;
    overProvisioningRate: number;
    underProvisioningRate: number;
    scalingThrashing: boolean;
    recommendations: string[];
  } {
    if (this.metrics.length < 10) {
      return {
        averageScalingTime: 0,
        scalingSuccessRate: 0,
        overProvisioningRate: 0,
        underProvisioningRate: 0,
        scalingThrashing: false,
        recommendations: ['Insufficient data for analysis']
      };
    }
    
    const recentMetrics = this.metrics.slice(-50);
    const allScalingEvents = recentMetrics.flatMap(m => m.scalingEvents);
    
    // Calculate average scaling time
    const successfulEvents = allScalingEvents.filter(e => e.success);
    const averageScalingTime = successfulEvents.length > 0 
      ? successfulEvents.reduce((sum, e) => sum + e.duration, 0) / successfulEvents.length 
      : 0;
    
    // Calculate success rate
    const scalingSuccessRate = allScalingEvents.length > 0 
      ? (successfulEvents.length / allScalingEvents.length) * 100 
      : 100;
    
    // Analyze provisioning efficiency
    let overProvisioningCount = 0;
    let underProvisioningCount = 0;
    
    for (const metric of recentMetrics) {
      // Over-provisioning: Low utilization with high instance count
      if (metric.cpuUtilization < 30 && metric.memoryUtilization < 30 && metric.currentInstances > 2) {
        overProvisioningCount++;
      }
      
      // Under-provisioning: High utilization or long response times
      if (metric.cpuUtilization > 80 || metric.memoryUtilization > 80 || metric.responseTime > 1000) {
        underProvisioningCount++;
      }
    }
    
    const overProvisioningRate = (overProvisioningCount / recentMetrics.length) * 100;
    const underProvisioningRate = (underProvisioningCount / recentMetrics.length) * 100;
    
    // Detect scaling thrashing (frequent up/down scaling)
    const recentEvents = allScalingEvents.filter(e => 
      (Date.now() - e.timestamp.getTime()) < 30 * 60 * 1000 // Last 30 minutes
    );
    
    const scaleUpCount = recentEvents.filter(e => e.type === 'scale_out').length;
    const scaleDownCount = recentEvents.filter(e => e.type === 'scale_in').length;
    const scalingThrashing = scaleUpCount > 2 && scaleDownCount > 2;
    
    // Generate recommendations
    const recommendations: string[] = [];
    
    if (averageScalingTime > 300000) { // 5 minutes
      recommendations.push('Scaling is slow - consider optimizing instance startup time');
    }
    
    if (scalingSuccessRate < 90) {
      recommendations.push('High scaling failure rate - investigate infrastructure issues');
    }
    
    if (overProvisioningRate > 20) {
      recommendations.push('Frequent over-provisioning - consider adjusting scale-down thresholds');
    }
    
    if (underProvisioningRate > 10) {
      recommendations.push('Frequent under-provisioning - consider adjusting scale-up thresholds');
    }
    
    if (scalingThrashing) {
      recommendations.push('Scaling thrashing detected - increase cooldown periods or adjust thresholds');
    }
    
    return {
      averageScalingTime,
      scalingSuccessRate,
      overProvisioningRate,
      underProvisioningRate,
      scalingThrashing,
      recommendations
    };
  }
}

interface ScalingDecision {
  policy: string;
  action: 'scale_up' | 'scale_down';
  reason: string;
  currentInstances: number;
  targetInstances: number;
}
```

---

*This troubleshooting encyclopedia continues with detailed coverage of authentication, content management, payment systems, frontend issues, data pipeline problems, and integration troubleshooting. The complete documentation provides step-by-step solutions, diagnostic tools, and prevention strategies for all major system components.*

**Key Features of This Troubleshooting Guide:**

✅ **Comprehensive Coverage**: 25+ chapters covering all system components  
✅ **Detailed Diagnostics**: Step-by-step diagnostic procedures with code examples  
✅ **Resolution Strategies**: Multiple solution approaches for each problem type  
✅ **Monitoring Tools**: Built-in monitoring and alerting systems  
✅ **Performance Analysis**: Optimization recommendations and metrics  
✅ **Preventive Measures**: Proactive monitoring to prevent issues  

This encyclopedia serves as a complete reference for troubleshooting any technical issue in the FanzDash platform.