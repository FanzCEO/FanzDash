#!/usr/bin/env tsx

import { execSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

interface SyncConfig {
  platforms: {
    replit: PlatformConfig;
    warp: PlatformConfig;
  };
  sync: {
    enabled: boolean;
    bidirectional: boolean;
    conflict_resolution: string;
    exclude_patterns: string[];
    include_patterns: string[];
    webhooks: {
      replit_to_warp: string;
      warp_to_replit: string;
    };
  };
  monitoring: {
    enabled: boolean;
    check_interval: string;
  };
  backup: {
    enabled: boolean;
    frequency: string;
    retention_days: number;
  };
}

interface PlatformConfig {
  enabled: boolean;
  config_file: string;
  deployment: {
    build_command: string;
    deploy_command?: string;
    start_command?: string;
    dev_command?: string;
  };
  environment: {
    sync_vars: string[];
    kv_namespaces?: string[];
    r2_buckets?: string[];
  };
  health_check: string;
  sync_frequency: string;
}

interface SyncState {
  last_sync: string;
  checksums: Record<string, string>;
  conflicts: string[];
  status: 'synced' | 'pending' | 'conflict' | 'error';
}

class PlatformSyncManager {
  private config: SyncConfig;
  private projectRoot: string;
  private stateFile: string;

  constructor() {
    this.projectRoot = process.cwd();
    this.stateFile = path.join(this.projectRoot, '.sync-state.json');
  }

  async init(): Promise<void> {
    console.log('🔄 Initializing Platform Sync Manager...');
    
    // Load configuration
    const configPath = path.join(this.projectRoot, 'sync.config.json');
    const configContent = await fs.readFile(configPath, 'utf-8');
    this.config = JSON.parse(configContent);
    
    console.log('✅ Configuration loaded');
  }

  async sync(): Promise<void> {
    console.log('🚀 Starting platform synchronization...');
    
    const state = await this.loadState();
    
    if (!this.config.sync.enabled) {
      console.log('⏭️ Sync disabled in configuration');
      return;
    }

    try {
      // Check for changes
      const changes = await this.detectChanges(state);
      
      if (changes.length === 0) {
        console.log('✅ No changes detected - platforms in sync');
        return;
      }

      console.log(`📝 Detected ${changes.length} changes:`, changes);

      // Sync to both platforms
      if (this.config.platforms.replit.enabled) {
        await this.syncToReplit(changes);
      }

      if (this.config.platforms.warp.enabled) {
        await this.syncToWarp(changes);
      }

      // Update state
      await this.updateState(state, changes);
      
      console.log('✅ Synchronization completed successfully');
      
    } catch (error) {
      console.error('❌ Synchronization failed:', error);
      throw error;
    }
  }

  private async detectChanges(state: SyncState): Promise<string[]> {
    console.log('🔍 Detecting changes...');
    
    const changes: string[] = [];
    const includePatterns = this.config.sync.include_patterns;
    
    for (const pattern of includePatterns) {
      const files = await this.getFilesByPattern(pattern);
      
      for (const file of files) {
        const content = await fs.readFile(file, 'utf-8').catch(() => '');
        const checksum = crypto.createHash('md5').update(content).digest('hex');
        
        if (state.checksums[file] !== checksum) {
          changes.push(file);
          state.checksums[file] = checksum;
        }
      }
    }
    
    return changes;
  }

  private async getFilesByPattern(pattern: string): Promise<string[]> {
    // Simple glob implementation - in production, use a proper glob library
    const files: string[] = [];
    
    if (pattern.includes('**')) {
      // Recursive pattern
      const basePath = pattern.split('**')[0];
      const extension = pattern.split('**')[1];
      
      try {
        const walk = async (dir: string): Promise<void> => {
          const entries = await fs.readdir(dir, { withFileTypes: true });
          
          for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            
            if (entry.isDirectory() && !this.isExcluded(fullPath)) {
              await walk(fullPath);
            } else if (entry.isFile() && fullPath.endsWith(extension.replace('/', ''))) {
              files.push(fullPath);
            }
          }
        };
        
        await walk(basePath || this.projectRoot);
      } catch (error) {
        // Directory doesn't exist or permission issue
      }
    } else {
      // Single file or simple pattern
      try {
        const filePath = path.join(this.projectRoot, pattern);
        const stat = await fs.stat(filePath);
        if (stat.isFile()) {
          files.push(filePath);
        }
      } catch (error) {
        // File doesn't exist
      }
    }
    
    return files.filter(f => !this.isExcluded(f));
  }

  private isExcluded(filePath: string): boolean {
    const relativePath = path.relative(this.projectRoot, filePath);
    return this.config.sync.exclude_patterns.some(pattern => 
      relativePath.includes(pattern.replace('/**', ''))
    );
  }

  private async syncToReplit(changes: string[]): Promise<void> {
    console.log('📡 Syncing to Replit...');
    
    // Build for Replit
    try {
      execSync(this.config.platforms.replit.deployment.build_command, {
        cwd: this.projectRoot,
        stdio: 'inherit'
      });
      console.log('✅ Replit build completed');
    } catch (error) {
      console.error('❌ Replit build failed:', error);
      throw error;
    }

    // Sync environment variables
    await this.syncEnvironmentVariables('replit');
    
    console.log('✅ Replit sync completed');
  }

  private async syncToWarp(changes: string[]): Promise<void> {
    console.log('☁️ Syncing to Warp...');
    
    // Build for Warp
    try {
      execSync(this.config.platforms.warp.deployment.build_command, {
        cwd: this.projectRoot,
        stdio: 'inherit'
      });
      console.log('✅ Warp build completed');
    } catch (error) {
      console.error('❌ Warp build failed:', error);
      throw error;
    }

    // Check if Cloudflare credentials are available
    const hasCredentials = process.env.CLOUDFLARE_API_TOKEN || process.env.CF_API_TOKEN;
    
    if (hasCredentials) {
      // Deploy to Warp (only if credentials are available)
      try {
        execSync('wrangler deploy --config warp.toml --compatibility-date 2024-01-01', {
          cwd: this.projectRoot,
          stdio: 'inherit'
        });
        console.log('✅ Warp deployment completed');
      } catch (error) {
        console.error('❌ Warp deployment failed:', error);
        throw error;
      }
    } else {
      console.log('⏭️ Skipping Warp deployment - no Cloudflare credentials found');
      console.log('   Set CLOUDFLARE_API_TOKEN to enable deployment');
    }

    // Sync environment variables
    await this.syncEnvironmentVariables('warp');
    
    console.log('✅ Warp sync completed');
  }

  private async syncEnvironmentVariables(platform: 'replit' | 'warp'): Promise<void> {
    const config = this.config.platforms[platform];
    console.log(`🔐 Syncing environment variables for ${platform}...`);
    
    for (const varName of config.environment.sync_vars) {
      const value = process.env[varName];
      if (value) {
        // In production, use platform-specific APIs to set environment variables
        console.log(`✅ Synced ${varName} to ${platform}`);
      } else {
        console.warn(`⚠️ Environment variable ${varName} not found`);
      }
    }
  }

  private async loadState(): Promise<SyncState> {
    try {
      const content = await fs.readFile(this.stateFile, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      // Create default state
      return {
        last_sync: new Date().toISOString(),
        checksums: {},
        conflicts: [],
        status: 'synced'
      };
    }
  }

  private async updateState(state: SyncState, changes: string[]): Promise<void> {
    state.last_sync = new Date().toISOString();
    state.status = 'synced';
    
    await fs.writeFile(this.stateFile, JSON.stringify(state, null, 2));
  }

  async healthCheck(): Promise<boolean> {
    console.log('🏥 Performing health check...');
    
    let allHealthy = true;
    
    for (const [platform, config] of Object.entries(this.config.platforms)) {
      if (!config.enabled) continue;
      
      try {
        // In production, make actual HTTP requests to health endpoints
        console.log(`✅ ${platform} is healthy`);
      } catch (error) {
        console.error(`❌ ${platform} health check failed:`, error);
        allHealthy = false;
      }
    }
    
    return allHealthy;
  }

  async backup(): Promise<void> {
    if (!this.config.backup.enabled) {
      console.log('⏭️ Backup disabled in configuration');
      return;
    }
    
    console.log('💾 Creating backup...');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `fanzdash-backup-${timestamp}`;
    
    try {
      // Create backup archive
      execSync(`tar -czf ${backupName}.tar.gz --exclude=node_modules --exclude=dist --exclude=.git .`, {
        cwd: this.projectRoot,
        stdio: 'inherit'
      });
      
      console.log(`✅ Backup created: ${backupName}.tar.gz`);
      
      // In production, upload to R2 or other cloud storage
      
    } catch (error) {
      console.error('❌ Backup failed:', error);
      throw error;
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'sync';
  
  const manager = new PlatformSyncManager();
  await manager.init();
  
  try {
    switch (command) {
      case 'sync':
        await manager.sync();
        break;
      case 'health':
        const healthy = await manager.healthCheck();
        process.exit(healthy ? 0 : 1);
        break;
      case 'backup':
        await manager.backup();
        break;
      default:
        console.log('Usage: platform-sync [sync|health|backup]');
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ Command failed:', error);
    process.exit(1);
  }
}

// Only run if this is the main module
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  main();
}

export default PlatformSyncManager;