#!/usr/bin/env node

/**
 * SSH Key Setup Script for FanzDash Platform
 * 
 * This script helps developers and administrators set up SSH keys
 * for secure Git authentication and platform access.
 * 
 * Supports: macOS, Linux, Windows (Git Bash/WSL)
 * 
 * @author FanzDash Team
 * @version 2.0.0
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import readline from 'readline';

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

class SSHSetup {
  constructor() {
    this.platform = os.platform();
    this.sshDir = path.join(os.homedir(), '.ssh');
    this.keyName = 'id_ed25519';
    this.keyPath = path.join(this.sshDir, this.keyName);
    this.pubKeyPath = this.keyPath + '.pub';
  }

  log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  error(message) {
    this.log(`❌ ERROR: ${message}`, 'red');
  }

  success(message) {
    this.log(`✅ ${message}`, 'green');
  }

  warning(message) {
    this.log(`⚠️  WARNING: ${message}`, 'yellow');
  }

  info(message) {
    this.log(`ℹ️  ${message}`, 'cyan');
  }

  step(message) {
    this.log(`\n🔧 ${message}`, 'blue');
  }

  async promptUser(question) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      rl.question(question, (answer) => {
        rl.close();
        resolve(answer);
      });
    });
  }

  execCommand(command, options = {}) {
    try {
      return execSync(command, { 
        encoding: 'utf8', 
        stdio: options.silent ? 'pipe' : 'inherit',
        ...options 
      });
    } catch (error) {
      if (!options.ignoreError) {
        throw error;
      }
      return null;
    }
  }

  checkExistingKeys() {
    this.step('Checking for existing SSH keys...');
    
    if (!fs.existsSync(this.sshDir)) {
      this.info('No .ssh directory found. Creating it...');
      fs.mkdirSync(this.sshDir, { mode: 0o700 });
      return false;
    }

    if (fs.existsSync(this.keyPath)) {
      this.warning(`SSH key already exists at: ${this.keyPath}`);
      return true;
    }

    return false;
  }

  async generateSSHKey(email) {
    this.step('Generating new SSH key...');
    
    const command = `ssh-keygen -t ed25519 -C "${email}" -f "${this.keyPath}" -N ""`;
    
    try {
      this.execCommand(command);
      this.success(`SSH key generated successfully at: ${this.keyPath}`);
      return true;
    } catch (error) {
      this.error(`Failed to generate SSH key: ${error.message}`);
      return false;
    }
  }

  startSSHAgent() {
    this.step('Starting SSH agent...');
    
    try {
      if (this.platform === 'win32') {
        // Windows Git Bash
        this.execCommand('eval "$(ssh-agent -s)"', { shell: 'bash' });
      } else {
        // macOS and Linux
        const output = this.execCommand('ssh-agent -s');
        if (output) {
          // Parse and set environment variables
          const lines = output.split('\n');
          lines.forEach(line => {
            if (line.includes('SSH_AUTH_SOCK') || line.includes('SSH_AGENT_PID')) {
              const [key, value] = line.split('=');
              if (key && value) {
                process.env[key] = value.replace(/;.*$/, '');
              }
            }
          });
        }
      }
      this.success('SSH agent started successfully');
      return true;
    } catch (error) {
      this.error(`Failed to start SSH agent: ${error.message}`);
      return false;
    }
  }

  addKeyToAgent() {
    this.step('Adding SSH key to agent...');
    
    try {
      let command;
      
      if (this.platform === 'darwin') {
        // macOS with keychain support
        command = `ssh-add --apple-use-keychain "${this.keyPath}"`;
      } else {
        // Linux and Windows
        command = `ssh-add "${this.keyPath}"`;
      }
      
      this.execCommand(command);
      this.success('SSH key added to agent successfully');
      return true;
    } catch (error) {
      this.error(`Failed to add key to agent: ${error.message}`);
      return false;
    }
  }

  copyPublicKeyToClipboard() {
    this.step('Copying public key to clipboard...');
    
    try {
      const publicKey = fs.readFileSync(this.pubKeyPath, 'utf8').trim();
      
      let copyCommand;
      
      switch (this.platform) {
        case 'darwin':
          copyCommand = `pbcopy < "${this.pubKeyPath}"`;
          break;
        case 'linux':
          // Try different clipboard utilities
          const clipboardUtils = ['xclip -selection clipboard', 'xsel --clipboard --input'];
          let success = false;
          
          for (const util of clipboardUtils) {
            try {
              this.execCommand(`${util} < "${this.pubKeyPath}"`, { ignoreError: true });
              success = true;
              break;
            } catch (e) {
              continue;
            }
          }
          
          if (!success) {
            this.warning('No clipboard utility found (xclip or xsel). Public key not copied.');
            this.info('Your public key is:');
            console.log(`\n${colors.yellow}${publicKey}${colors.reset}\n`);
            return false;
          }
          break;
        case 'win32':
          copyCommand = `clip < "${this.pubKeyPath}"`;
          break;
        default:
          this.warning('Unsupported platform for clipboard operations');
          this.info('Your public key is:');
          console.log(`\n${colors.yellow}${publicKey}${colors.reset}\n`);
          return false;
      }
      
      if (copyCommand) {
        this.execCommand(copyCommand);
        this.success('Public key copied to clipboard successfully');
      }
      
      return true;
    } catch (error) {
      this.error(`Failed to copy public key: ${error.message}`);
      return false;
    }
  }

  displayInstructions() {
    this.log('\n' + '='.repeat(80), 'magenta');
    this.log('🎉 SSH KEY SETUP COMPLETE!', 'green');
    this.log('='.repeat(80), 'magenta');
    
    this.log('\n📋 NEXT STEPS:', 'cyan');
    this.log('1. Your SSH public key has been copied to clipboard (if supported)');
    this.log('2. Add this key to your Git hosting service:');
    this.log('   • GitHub: Settings → SSH and GPG keys → New SSH key');
    this.log('   • GitLab: User Settings → SSH Keys');
    this.log('   • Bitbucket: Personal settings → SSH keys');
    
    this.log('\n🔑 KEY LOCATIONS:', 'cyan');
    this.log(`   Private key: ${this.keyPath}`);
    this.log(`   Public key:  ${this.pubKeyPath}`);
    
    if (this.platform === 'darwin') {
      this.log('\n🍎 macOS KEYCHAIN:', 'cyan');
      this.log('   Your SSH key has been added to the macOS keychain');
      this.log('   It will automatically load when you restart your terminal');
    }
    
    this.log('\n🧪 TEST YOUR SETUP:', 'cyan');
    this.log('   Test GitHub connection: ssh -T git@github.com');
    this.log('   Test GitLab connection: ssh -T git@gitlab.com');
    
    this.log('\n🔐 SECURITY NOTES:', 'yellow');
    this.log('   • Never share your private key file');
    this.log('   • Keep your private key secure and backed up');
    this.log('   • Consider using a passphrase for additional security');
    
    this.log('\n' + '='.repeat(80), 'magenta');
  }

  async run() {
    try {
      console.log('\n' + '='.repeat(80));
      this.log('🚀 FanzDash SSH Key Setup', 'magenta');
      this.log('Enterprise Platform Security Configuration', 'cyan');
      console.log('='.repeat(80));
      
      // Get email for key comment
      let email = process.argv[2];
      if (!email) {
        email = await this.promptUser('\n📧 Enter your email address for the SSH key: ');
      }
      
      if (!email) {
        this.error('Email address is required');
        process.exit(1);
      }
      
      // Check for existing keys
      const hasExistingKey = this.checkExistingKeys();
      
      if (hasExistingKey) {
        const overwrite = await this.promptUser('🤔 Overwrite existing key? (y/N): ');
        if (overwrite.toLowerCase() !== 'y' && overwrite.toLowerCase() !== 'yes') {
          this.info('Skipping key generation...');
        } else {
          await this.generateSSHKey(email);
        }
      } else {
        await this.generateSSHKey(email);
      }
      
      // Start SSH agent
      this.startSSHAgent();
      
      // Add key to agent
      this.addKeyToAgent();
      
      // Copy to clipboard
      this.copyPublicKeyToClipboard();
      
      // Display final instructions
      this.displayInstructions();
      
    } catch (error) {
      this.error(`Setup failed: ${error.message}`);
      process.exit(1);
    }
  }
}

// Run the setup if called directly
const setup = new SSHSetup();
setup.run().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});