import { Request, Response, NextFunction } from 'express';
import { EventEmitter } from 'events';

interface PlatformConfig {
  id: string;
  name: string;
  domains: string[];
  basePath: string;
  clusterId: string;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    logo: string;
    favicon: string;
  };
  features: string[];
  regionRestrictions?: string[];
  ageVerification: boolean;
  contentRating: 'adult' | 'mature' | 'general';
  ssoEnabled: boolean;
  paymentMethods: string[];
}

interface RoutingRule {
  id: string;
  priority: number;
  conditions: {
    domain?: string[];
    path?: string[];
    userAgent?: string[];
    geoLocation?: string[];
    headers?: Record<string, string>;
  };
  action: {
    type: 'redirect' | 'proxy' | 'render';
    target: string;
    platformId: string;
    preserveQuery: boolean;
    cacheControl?: string;
  };
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class DomainRouter extends EventEmitter {
  private platforms: Map<string, PlatformConfig> = new Map();
  private routingRules: RoutingRule[] = [];
  private domainCache: Map<string, PlatformConfig> = new Map();
  private analyticsData: Map<string, any> = new Map();

  constructor() {
    super();
    this.initializePlatforms();
    this.initializeRoutingRules();
    this.startCleanupInterval();
  }

  private initializePlatforms(): void {
    const defaultPlatforms: PlatformConfig[] = [
      {
        id: 'boyfanz',
        name: 'BoyFanz',
        domains: ['boyfanz.com', 'www.boyfanz.com', 'boyfanz.app'],
        basePath: '/boyfanz',
        clusterId: 'bfz-cluster-001',
        theme: {
          primaryColor: '#1e40af',
          secondaryColor: '#3b82f6',
          logo: '/assets/logos/boyfanz-logo.svg',
          favicon: '/assets/favicons/boyfanz.ico'
        },
        features: ['streaming', 'messaging', 'tips', 'subscriptions', 'media'],
        ageVerification: true,
        contentRating: 'adult',
        ssoEnabled: true,
        paymentMethods: ['ccbill', 'segpay', 'epoch', 'crypto', 'paxum']
      },
      {
        id: 'girlfanz',
        name: 'GirlFanz', 
        domains: ['girlfanz.com', 'www.girlfanz.com', 'girlfanz.app'],
        basePath: '/girlfanz',
        clusterId: 'gfz-cluster-001',
        theme: {
          primaryColor: '#ec4899',
          secondaryColor: '#f472b6',
          logo: '/assets/logos/girlfanz-logo.svg',
          favicon: '/assets/favicons/girlfanz.ico'
        },
        features: ['streaming', 'messaging', 'tips', 'subscriptions', 'media', 'shopping'],
        ageVerification: true,
        contentRating: 'adult',
        ssoEnabled: true,
        paymentMethods: ['ccbill', 'segpay', 'vendo', 'wise', 'crypto']
      },
      {
        id: 'pupfanz',
        name: 'PupFanz',
        domains: ['pupfanz.com', 'www.pupfanz.com'],
        basePath: '/pupfanz',
        clusterId: 'pfz-cluster-001',
        theme: {
          primaryColor: '#ea580c',
          secondaryColor: '#fb923c',
          logo: '/assets/logos/pupfanz-logo.svg',
          favicon: '/assets/favicons/pupfanz.ico'
        },
        features: ['streaming', 'messaging', 'community', 'events'],
        ageVerification: true,
        contentRating: 'adult',
        ssoEnabled: true,
        paymentMethods: ['ccbill', 'epoch', 'crypto', 'paxum']
      },
      {
        id: 'transfanz',
        name: 'TransFanz',
        domains: ['transfanz.com', 'www.transfanz.com'],
        basePath: '/transfanz',
        clusterId: 'tfz-cluster-001',
        theme: {
          primaryColor: '#7c3aed',
          secondaryColor: '#a855f7',
          logo: '/assets/logos/transfanz-logo.svg',
          favicon: '/assets/favicons/transfanz.ico'
        },
        features: ['streaming', 'messaging', 'tips', 'community', 'support'],
        ageVerification: true,
        contentRating: 'adult',
        ssoEnabled: true,
        paymentMethods: ['ccbill', 'segpay', 'wise', 'crypto']
      },
      {
        id: 'taboofanz',
        name: 'TabooFanz',
        domains: ['taboofanz.com', 'www.taboofanz.com'],
        basePath: '/taboofanz',
        clusterId: 'tbfz-cluster-001',
        theme: {
          primaryColor: '#dc2626',
          secondaryColor: '#ef4444',
          logo: '/assets/logos/taboofanz-logo.svg',
          favicon: '/assets/favicons/taboofanz.ico'
        },
        features: ['streaming', 'messaging', 'tips', 'premium'],
        regionRestrictions: ['US', 'CA', 'EU'],
        ageVerification: true,
        contentRating: 'adult',
        ssoEnabled: true,
        paymentMethods: ['ccbill', 'segpay', 'epoch', 'crypto']
      },
      {
        id: 'fanztube',
        name: 'FanzTube',
        domains: ['fanztube.com', 'www.fanztube.com', 'fanz.tube'],
        basePath: '/fanztube',
        clusterId: 'ftz-cluster-001',
        theme: {
          primaryColor: '#059669',
          secondaryColor: '#10b981',
          logo: '/assets/logos/fanztube-logo.svg',
          favicon: '/assets/favicons/fanztube.ico'
        },
        features: ['streaming', 'upload', 'playlists', 'live', 'shorts'],
        ageVerification: true,
        contentRating: 'adult',
        ssoEnabled: true,
        paymentMethods: ['ccbill', 'segpay', 'vendo', 'crypto', 'tips']
      },
      {
        id: 'fanzclips',
        name: 'FanzClips',
        domains: ['fanzclips.com', 'www.fanzclips.com', '4bigdicki.host'],
        basePath: '/fanzclips',
        clusterId: 'fcz-cluster-001',
        theme: {
          primaryColor: '#1f2937',
          secondaryColor: '#4b5563',
          logo: '/assets/logos/fanzclips-logo.svg',
          favicon: '/assets/favicons/fanzclips.ico'
        },
        features: ['streaming', 'messaging', 'tips', 'premium', 'interactive'],
        ageVerification: true,
        contentRating: 'adult',
        ssoEnabled: true,
        paymentMethods: ['ccbill', 'segpay', 'crypto', 'paxum']
      }
    ];

    defaultPlatforms.forEach(platform => {
      this.platforms.set(platform.id, platform);
      // Cache domain mappings for faster lookups
      platform.domains.forEach(domain => {
        this.domainCache.set(domain.toLowerCase(), platform);
      });
    });

    console.log(`🌐 Domain Router initialized with ${this.platforms.size} platforms`);
    this.emit('platforms_loaded', this.platforms.size);
  }

  private initializeRoutingRules(): void {
    const defaultRules: RoutingRule[] = [
      {
        id: 'main-domain-routing',
        priority: 100,
        conditions: {
          domain: Array.from(this.domainCache.keys())
        },
        action: {
          type: 'proxy',
          target: 'platform_cluster',
          platformId: 'dynamic',
          preserveQuery: true,
          cacheControl: 'public, max-age=300'
        },
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'api-passthrough',
        priority: 200,
        conditions: {
          path: ['/api/*', '/health', '/admin']
        },
        action: {
          type: 'proxy',
          target: 'fanzdash_api',
          platformId: 'fanzdash',
          preserveQuery: true,
          cacheControl: 'no-cache'
        },
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'cdn-assets',
        priority: 150,
        conditions: {
          path: ['/assets/*', '/static/*', '*.css', '*.js', '*.png', '*.jpg', '*.svg']
        },
        action: {
          type: 'proxy',
          target: 'cdn_cluster',
          platformId: 'cdn',
          preserveQuery: false,
          cacheControl: 'public, max-age=31536000'
        },
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    this.routingRules = defaultRules.sort((a, b) => b.priority - a.priority);
    console.log(`📋 Routing rules initialized: ${this.routingRules.length} rules active`);
  }

  // Main routing middleware
  public routeRequest = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const hostname = req.get('host')?.toLowerCase() || '';
      const path = req.path;
      const userAgent = req.get('user-agent') || '';

      // Check for API endpoints first (highest priority)
      if (this.isApiEndpoint(path)) {
        this.trackRequest(hostname, path, 'api_passthrough');
        return next();
      }

      // Find platform by domain
      const platform = this.resolvePlatform(hostname, path, req);
      
      if (platform) {
        // Set platform context in request
        (req as any).platform = platform;
        (req as any).routing = {
          originalHost: hostname,
          targetPlatform: platform.id,
          clusterId: platform.clusterId,
          basePath: platform.basePath
        };

        // Set platform-specific headers
        this.setPlatformHeaders(res, platform);
        
        // Track the request
        this.trackRequest(hostname, path, platform.id);

        // Age verification check
        if (platform.ageVerification && !this.isAgeVerified(req)) {
          return this.handleAgeVerification(req, res, platform);
        }

        // Region restrictions check
        if (platform.regionRestrictions && !this.isRegionAllowed(req, platform)) {
          return this.handleRegionRestriction(req, res, platform);
        }

        console.log(`🔀 Routing ${hostname}${path} → ${platform.name} (${platform.clusterId})`);
        this.emit('request_routed', { hostname, path, platform: platform.id });
      }

      next();

    } catch (error) {
      console.error('Domain routing error:', error);
      this.emit('routing_error', { error, hostname: req.get('host'), path: req.path });
      next(error);
    }
  };

  private resolvePlatform(hostname: string, path: string, req: Request): PlatformConfig | null {
    // Direct domain match (fastest)
    let platform = this.domainCache.get(hostname);
    if (platform) return platform;

    // Handle subdomains (e.g., api.boyfanz.com)
    const domainParts = hostname.split('.');
    if (domainParts.length > 2) {
      const rootDomain = domainParts.slice(-2).join('.');
      platform = this.domainCache.get(rootDomain);
      if (platform) return platform;
    }

    // Check routing rules for custom matches
    for (const rule of this.routingRules) {
      if (!rule.enabled) continue;

      if (this.matchesRule(rule, hostname, path, req)) {
        if (rule.action.platformId !== 'dynamic') {
          return this.platforms.get(rule.action.platformId) || null;
        }
      }
    }

    return null;
  }

  private matchesRule(rule: RoutingRule, hostname: string, path: string, req: Request): boolean {
    const conditions = rule.conditions;

    // Domain matching
    if (conditions.domain && conditions.domain.length > 0) {
      const matches = conditions.domain.some(pattern => {
        if (pattern.includes('*')) {
          const regex = new RegExp(pattern.replace(/\*/g, '.*'));
          return regex.test(hostname);
        }
        return hostname === pattern;
      });
      if (!matches) return false;
    }

    // Path matching
    if (conditions.path && conditions.path.length > 0) {
      const matches = conditions.path.some(pattern => {
        if (pattern.includes('*')) {
          const regex = new RegExp(pattern.replace(/\*/g, '.*'));
          return regex.test(path);
        }
        return path.startsWith(pattern);
      });
      if (!matches) return false;
    }

    // User agent matching
    if (conditions.userAgent && conditions.userAgent.length > 0) {
      const userAgent = req.get('user-agent') || '';
      const matches = conditions.userAgent.some(pattern => 
        userAgent.toLowerCase().includes(pattern.toLowerCase())
      );
      if (!matches) return false;
    }

    // Header matching
    if (conditions.headers) {
      for (const [headerName, expectedValue] of Object.entries(conditions.headers)) {
        const actualValue = req.get(headerName);
        if (actualValue !== expectedValue) return false;
      }
    }

    return true;
  }

  private isApiEndpoint(path: string): boolean {
    const apiPatterns = ['/api/', '/health', '/admin', '/_internal'];
    return apiPatterns.some(pattern => path.startsWith(pattern));
  }

  private setPlatformHeaders(res: Response, platform: PlatformConfig): void {
    res.set({
      'X-Platform-ID': platform.id,
      'X-Platform-Name': platform.name,
      'X-Cluster-ID': platform.clusterId,
      'X-Content-Rating': platform.contentRating,
      'X-Age-Verification': platform.ageVerification ? 'required' : 'none',
      'X-SSO-Enabled': platform.ssoEnabled ? 'true' : 'false'
    });

    // Set CSP based on platform features
    const csp = this.generateCSP(platform);
    if (csp) {
      res.set('Content-Security-Policy', csp);
    }
  }

  private generateCSP(platform: PlatformConfig): string {
    const baseCSP = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "media-src 'self' blob: https:",
      "connect-src 'self' wss: ws:",
      "font-src 'self' https:",
    ];

    // Add platform-specific sources
    if (platform.features.includes('streaming')) {
      baseCSP.push("media-src 'self' blob: https: wss:");
    }

    if (platform.features.includes('payment')) {
      baseCSP.push("frame-src 'self' https://secure.ccbill.com https://secure.segpay.com");
    }

    return baseCSP.join('; ');
  }

  private isAgeVerified(req: Request): boolean {
    // Check for age verification cookie or session
    const ageVerified = req.cookies?.age_verified || req.session?.ageVerified;
    return ageVerified === 'true' || ageVerified === true;
  }

  private handleAgeVerification(req: Request, res: Response, platform: PlatformConfig): void {
    const verificationUrl = `/age-verification?return=${encodeURIComponent(req.originalUrl)}&platform=${platform.id}`;
    
    if (req.xhr || req.get('Content-Type')?.includes('application/json')) {
      res.status(403).json({
        error: 'Age verification required',
        verificationUrl,
        platform: platform.name
      });
    } else {
      res.redirect(verificationUrl);
    }
  }

  private isRegionAllowed(req: Request, platform: PlatformConfig): boolean {
    if (!platform.regionRestrictions) return true;

    // Get region from request (IP geolocation would be implemented here)
    const region = req.get('CF-IPCountry') || req.get('X-Country-Code') || 'US';
    return platform.regionRestrictions.includes(region);
  }

  private handleRegionRestriction(req: Request, res: Response, platform: PlatformConfig): void {
    const region = req.get('CF-IPCountry') || 'Unknown';
    
    if (req.xhr || req.get('Content-Type')?.includes('application/json')) {
      res.status(451).json({
        error: 'Access restricted in your region',
        region,
        platform: platform.name,
        allowedRegions: platform.regionRestrictions
      });
    } else {
      res.status(451).send(`
        <h1>Access Restricted</h1>
        <p>${platform.name} is not available in your region (${region}).</p>
        <p>Allowed regions: ${platform.regionRestrictions?.join(', ')}</p>
      `);
    }
  }

  private trackRequest(hostname: string, path: string, platformId: string): void {
    const key = `${hostname}:${platformId}`;
    const current = this.analyticsData.get(key) || { requests: 0, lastAccess: new Date() };
    
    this.analyticsData.set(key, {
      requests: current.requests + 1,
      lastAccess: new Date(),
      hostname,
      platformId,
      paths: [...(current.paths || []), path].slice(-10) // Keep last 10 paths
    });
  }

  private startCleanupInterval(): void {
    setInterval(() => {
      const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
      
      for (const [key, data] of this.analyticsData.entries()) {
        if (data.lastAccess < cutoff) {
          this.analyticsData.delete(key);
        }
      }
    }, 60 * 60 * 1000); // Clean up every hour
  }

  // Public API methods

  public getPlatforms(): PlatformConfig[] {
    return Array.from(this.platforms.values());
  }

  public getPlatform(id: string): PlatformConfig | null {
    return this.platforms.get(id) || null;
  }

  public getPlatformByDomain(domain: string): PlatformConfig | null {
    return this.domainCache.get(domain.toLowerCase()) || null;
  }

  public addPlatform(platform: PlatformConfig): boolean {
    try {
      this.platforms.set(platform.id, platform);
      
      // Update domain cache
      platform.domains.forEach(domain => {
        this.domainCache.set(domain.toLowerCase(), platform);
      });

      console.log(`➕ Platform added: ${platform.name} (${platform.domains.join(', ')})`);
      this.emit('platform_added', platform);
      return true;
    } catch (error) {
      console.error('Error adding platform:', error);
      return false;
    }
  }

  public removePlatform(id: string): boolean {
    try {
      const platform = this.platforms.get(id);
      if (!platform) return false;

      // Remove from domain cache
      platform.domains.forEach(domain => {
        this.domainCache.delete(domain.toLowerCase());
      });

      this.platforms.delete(id);
      console.log(`➖ Platform removed: ${platform.name}`);
      this.emit('platform_removed', platform);
      return true;
    } catch (error) {
      console.error('Error removing platform:', error);
      return false;
    }
  }

  public getAnalytics(): any {
    const analytics = {};
    for (const [key, data] of this.analyticsData.entries()) {
      analytics[key] = {
        requests: data.requests,
        lastAccess: data.lastAccess,
        hostname: data.hostname,
        platformId: data.platformId
      };
    }
    return analytics;
  }

  public getRoutingRules(): RoutingRule[] {
    return [...this.routingRules];
  }

  public addRoutingRule(rule: Omit<RoutingRule, 'id' | 'createdAt' | 'updatedAt'>): string {
    const newRule: RoutingRule = {
      ...rule,
      id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.routingRules.push(newRule);
    this.routingRules.sort((a, b) => b.priority - a.priority);
    
    console.log(`📋 Routing rule added: ${newRule.id}`);
    this.emit('rule_added', newRule);
    return newRule.id;
  }

  public getSystemStatus() {
    return {
      platforms: this.platforms.size,
      domains: this.domainCache.size,
      routingRules: this.routingRules.filter(r => r.enabled).length,
      analyticsEntries: this.analyticsData.size,
      uptime: process.uptime(),
      status: 'operational'
    };
  }
}

// Create singleton instance
export const domainRouter = new DomainRouter();

// Export types for use in other modules
export type { PlatformConfig, RoutingRule };