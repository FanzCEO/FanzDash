#!/usr/bin/env node

/**
 * SSH Verification Script for FanzDash Platform
 * 
 * This script verifies that SSH keys are properly configured
 * and can connect to common Git hosting services.
 * 
 * @author FanzDash Team
 * @version 2.0.0
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

class SSHVerifier {
  constructor() {
    this.sshDir = path.join(os.homedir(), '.ssh');
    this.keyPath = path.join(this.sshDir, 'id_ed25519');
    this.pubKeyPath = this.keyPath + '.pub';
  }

  log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  error(message) {
    this.log(`❌ ${message}`, 'red');
  }

  success(message) {
    this.log(`✅ ${message}`, 'green');
  }

  warning(message) {
    this.log(`⚠️  ${message}`, 'yellow');
  }

  info(message) {
    this.log(`ℹ️  ${message}`, 'cyan');
  }

  execCommand(command, options = {}) {
    try {
      return execSync(command, { 
        encoding: 'utf8', 
        stdio: options.silent ? 'pipe' : 'inherit',
        timeout: 10000, // 10 second timeout
        ...options 
      });
    } catch (error) {
      if (!options.ignoreError) {
        throw error;
      }
      return null;
    }
  }

  checkSSHFiles() {
    this.log('\n🔍 Checking SSH key files...', 'blue');
    
    if (!fs.existsSync(this.sshDir)) {
      this.error('SSH directory does not exist');
      return false;
    }

    if (!fs.existsSync(this.keyPath)) {
      this.error('SSH private key does not exist');
      return false;
    }

    if (!fs.existsSync(this.pubKeyPath)) {
      this.error('SSH public key does not exist');
      return false;
    }

    // Check file permissions
    const stats = fs.statSync(this.keyPath);
    const mode = (stats.mode & parseInt('777', 8)).toString(8);
    
    if (mode !== '600') {
      this.warning(`Private key permissions should be 600, found ${mode}`);
    } else {
      this.success('SSH key files exist with correct permissions');
    }

    return true;
  }

  checkSSHAgent() {
    this.log('\n🔍 Checking SSH agent...', 'blue');
    
    try {
      const output = this.execCommand('ssh-add -l', { silent: true, ignoreError: true });
      
      if (output && output.includes('id_ed25519')) {
        this.success('SSH key is loaded in SSH agent');
        return true;
      } else {
        this.warning('SSH key is not loaded in SSH agent');
        this.info('Run: ssh-add ~/.ssh/id_ed25519');
        return false;
      }
    } catch (error) {
      this.warning('SSH agent is not running');
      this.info('Run: eval "$(ssh-agent -s)" && ssh-add ~/.ssh/id_ed25519');
      return false;
    }
  }

  testGitHubConnection() {
    this.log('\n🔍 Testing GitHub connection...', 'blue');
    
    try {
      const output = this.execCommand('ssh -T git@github.com', { 
        silent: true, 
        ignoreError: true 
      });
      
      if (output && output.includes('successfully authenticated')) {
        this.success('GitHub SSH connection successful');
        return true;
      } else {
        this.warning('GitHub SSH connection failed');
        this.info('Make sure you have added your public key to GitHub');
        return false;
      }
    } catch (error) {
      this.warning('Could not test GitHub connection');
      this.info('Make sure you have added your public key to GitHub');
      return false;
    }
  }

  displayPublicKey() {
    this.log('\n🔑 Your SSH public key:', 'blue');
    
    try {
      const publicKey = fs.readFileSync(this.pubKeyPath, 'utf8').trim();
      console.log(`\n${colors.yellow}${publicKey}${colors.reset}\n`);
      
      this.log('Copy this key to your Git hosting service:', 'cyan');
      this.log('• GitHub: Settings → SSH and GPG keys → New SSH key');
      this.log('• GitLab: User Settings → SSH Keys');
      this.log('• Bitbucket: Personal settings → SSH keys');
    } catch (error) {
      this.error('Could not read public key file');
    }
  }

  generateReport() {
    this.log('\n' + '='.repeat(60), 'magenta');
    this.log('📊 SSH SETUP VERIFICATION REPORT', 'magenta');
    this.log('='.repeat(60), 'magenta');
    
    const filesOk = this.checkSSHFiles();
    const agentOk = this.checkSSHAgent();
    const githubOk = this.testGitHubConnection();
    
    this.log('\n📋 Summary:', 'cyan');
    this.log(`SSH Files: ${filesOk ? '✅ OK' : '❌ FAIL'}`, filesOk ? 'green' : 'red');
    this.log(`SSH Agent: ${agentOk ? '✅ OK' : '⚠️  WARN'}`, agentOk ? 'green' : 'yellow');
    this.log(`GitHub: ${githubOk ? '✅ OK' : '⚠️  WARN'}`, githubOk ? 'green' : 'yellow');
    
    if (filesOk && (agentOk || githubOk)) {
      this.log('\n🎉 SSH setup is ready for development!', 'green');
    } else if (filesOk) {
      this.log('\n⚠️  SSH setup needs additional configuration', 'yellow');
      this.displayPublicKey();
    } else {
      this.log('\n❌ SSH setup requires attention', 'red');
      this.log('Run: npm run setup:ssh your-email@domain.com', 'cyan');
    }
    
    this.log('\n' + '='.repeat(60), 'magenta');
  }

  async run() {
    try {
      console.log('\n' + '='.repeat(60));
      this.log('🔍 FanzDash SSH Verification', 'magenta');
      this.log('Enterprise Platform Security Check', 'cyan');
      console.log('='.repeat(60));
      
      this.generateReport();
      
    } catch (error) {
      this.error(`Verification failed: ${error.message}`);
      process.exit(1);
    }
  }
}

// Run the verification if called directly
const verifier = new SSHVerifier();
verifier.run().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});