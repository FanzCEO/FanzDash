import crypto from 'crypto';
import { promisify } from 'util';

/**
 * Military-Grade Encryption Service
 * Implements AES-256-GCM and RSA-4096 encryption standards
 * Classified: TOP SECRET - Central Command & Control System
 */

export interface EncryptionKeyPair {
  publicKey: string;
  privateKey: string;
  keyId: string;
  algorithm: 'RSA-4096' | 'AES-256-GCM';
  createdAt: Date;
  expiresAt: Date;
  rotationSchedule: 'daily' | 'weekly' | 'monthly';
}

export interface EncryptedData {
  data: string;
  keyId: string;
  algorithm: string;
  iv?: string;
  authTag?: string;
  timestamp: Date;
  integrity: string; // HMAC for data integrity
}

export interface HSMConfiguration {
  clusterId: string;
  keyStore: 'military-hsm-cluster';
  backupStrategy: 'geographic-redundancy';
  tamperDetection: boolean;
  securityLevel: 'FIPS-140-2-Level-4';
}

export class MilitaryGradeEncryption {
  private keyRotationSchedule: Map<string, NodeJS.Timeout> = new Map();
  private hsm: HSMConfiguration;
  private keyDerivationRounds = 1000000; // 1M iterations for PBKDF2
  private keyStore: Map<string, EncryptionKeyPair> = new Map();
  private auditLogger: (event: string, data: any) => void;

  constructor(hsmConfig: HSMConfiguration, auditLogger: (event: string, data: any) => void) {
    this.hsm = hsmConfig;
    this.auditLogger = auditLogger;
    this.initializeHSM();
    this.startKeyRotationScheduler();
  }

  /**
   * Initialize Hardware Security Module (HSM) Simulation
   * In production, this would interface with actual HSM hardware
   */
  private initializeHSM() {
    this.auditLogger('HSM_INITIALIZATION', {
      clusterId: this.hsm.clusterId,
      securityLevel: this.hsm.securityLevel,
      timestamp: new Date(),
      classification: 'TOP_SECRET'
    });

    // Generate master encryption keys for HSM
    this.generateMasterKeys();
  }

  /**
   * Generate RSA-4096 key pair for asymmetric encryption
   */
  generateRSAKeyPair(): EncryptionKeyPair {
    const keyId = `rsa-4096-${crypto.randomUUID()}`;
    
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 4096, // RSA-4096 for military-grade security
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
        cipher: 'aes-256-cbc',
        passphrase: this.generateSecurePassphrase()
      }
    });

    const keyPair: EncryptionKeyPair = {
      publicKey,
      privateKey,
      keyId,
      algorithm: 'RSA-4096',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      rotationSchedule: 'weekly'
    };

    this.keyStore.set(keyId, keyPair);
    this.scheduleKeyRotation(keyId, keyPair.rotationSchedule);

    this.auditLogger('RSA_KEYPAIR_GENERATED', {
      keyId,
      algorithm: 'RSA-4096',
      securityLevel: 'MILITARY_GRADE',
      classification: 'TOP_SECRET'
    });

    return keyPair;
  }

  /**
   * AES-256-GCM encryption for symmetric encryption
   */
  encryptAES256GCM(plaintext: string, keyId?: string): EncryptedData {
    const key = keyId ? this.getOrCreateAESKey(keyId) : this.generateAESKey();
    const iv = crypto.randomBytes(16); // 128-bit IV for GCM
    const cipher = crypto.createCipher('aes-256-gcm', key.privateKey);
    
    cipher.setAAD(Buffer.from(key.keyId, 'utf8')); // Additional authenticated data
    
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    // Generate HMAC for data integrity
    const hmac = crypto.createHmac('sha256', key.privateKey);
    hmac.update(encrypted);
    const integrity = hmac.digest('hex');

    const encryptedData: EncryptedData = {
      data: encrypted,
      keyId: key.keyId,
      algorithm: 'AES-256-GCM',
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
      timestamp: new Date(),
      integrity
    };

    this.auditLogger('AES_ENCRYPTION', {
      keyId: key.keyId,
      algorithm: 'AES-256-GCM',
      dataSize: plaintext.length,
      classification: 'TOP_SECRET'
    });

    return encryptedData;
  }

  /**
   * AES-256-GCM decryption
   */
  decryptAES256GCM(encryptedData: EncryptedData): string {
    const keyPair = this.keyStore.get(encryptedData.keyId);
    if (!keyPair) {
      throw new Error('Decryption key not found - possible security breach');
    }

    // Verify data integrity first
    const hmac = crypto.createHmac('sha256', keyPair.privateKey);
    hmac.update(encryptedData.data);
    const expectedIntegrity = hmac.digest('hex');
    
    if (expectedIntegrity !== encryptedData.integrity) {
      this.auditLogger('INTEGRITY_VIOLATION', {
        keyId: encryptedData.keyId,
        classification: 'CRITICAL_ALERT',
        possibleTampering: true
      });
      throw new Error('Data integrity violation detected');
    }

    const decipher = crypto.createDecipher('aes-256-gcm', keyPair.privateKey);
    decipher.setAAD(Buffer.from(encryptedData.keyId, 'utf8'));
    decipher.setAuthTag(Buffer.from(encryptedData.authTag!, 'hex'));

    let decrypted = decipher.update(encryptedData.data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    this.auditLogger('AES_DECRYPTION', {
      keyId: encryptedData.keyId,
      algorithm: 'AES-256-GCM',
      classification: 'TOP_SECRET'
    });

    return decrypted;
  }

  /**
   * RSA-4096 encryption for sensitive keys and executive data
   */
  encryptRSA4096(plaintext: string, keyId: string): EncryptedData {
    const keyPair = this.keyStore.get(keyId);
    if (!keyPair || keyPair.algorithm !== 'RSA-4096') {
      throw new Error('RSA-4096 key not found');
    }

    // RSA-4096 can only encrypt data up to key size - padding
    // For larger data, use hybrid encryption (RSA + AES)
    const maxRSASize = 446; // 4096 bits - OAEP padding
    
    if (plaintext.length > maxRSASize) {
      return this.hybridEncryption(plaintext, keyId);
    }

    const encrypted = crypto.publicEncrypt({
      key: keyPair.publicKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256'
    }, Buffer.from(plaintext, 'utf8'));

    // Generate HMAC for integrity
    const hmac = crypto.createHmac('sha256', keyPair.publicKey);
    hmac.update(encrypted);
    const integrity = hmac.digest('hex');

    const encryptedData: EncryptedData = {
      data: encrypted.toString('hex'),
      keyId,
      algorithm: 'RSA-4096',
      timestamp: new Date(),
      integrity
    };

    this.auditLogger('RSA_ENCRYPTION', {
      keyId,
      algorithm: 'RSA-4096',
      dataSize: plaintext.length,
      classification: 'TOP_SECRET'
    });

    return encryptedData;
  }

  /**
   * RSA-4096 decryption
   */
  decryptRSA4096(encryptedData: EncryptedData): string {
    const keyPair = this.keyStore.get(encryptedData.keyId);
    if (!keyPair || keyPair.algorithm !== 'RSA-4096') {
      throw new Error('RSA-4096 key not found');
    }

    // Handle hybrid encryption
    if (encryptedData.iv && encryptedData.authTag) {
      return this.hybridDecryption(encryptedData);
    }

    const encryptedBuffer = Buffer.from(encryptedData.data, 'hex');
    
    // Verify integrity
    const hmac = crypto.createHmac('sha256', keyPair.publicKey);
    hmac.update(encryptedBuffer);
    const expectedIntegrity = hmac.digest('hex');
    
    if (expectedIntegrity !== encryptedData.integrity) {
      throw new Error('RSA data integrity violation');
    }

    const decrypted = crypto.privateDecrypt({
      key: keyPair.privateKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256'
    }, encryptedBuffer);

    this.auditLogger('RSA_DECRYPTION', {
      keyId: encryptedData.keyId,
      algorithm: 'RSA-4096',
      classification: 'TOP_SECRET'
    });

    return decrypted.toString('utf8');
  }

  /**
   * Hybrid encryption (RSA + AES) for large data
   */
  private hybridEncryption(plaintext: string, rsaKeyId: string): EncryptedData {
    // Generate random AES key
    const aesKey = crypto.randomBytes(32); // 256 bits
    const iv = crypto.randomBytes(16);
    
    // Encrypt data with AES
    const aesCipher = crypto.createCipherGCM('aes-256-gcm', aesKey, iv);
    let encryptedData = aesCipher.update(plaintext, 'utf8', 'hex');
    encryptedData += aesCipher.final('hex');
    const authTag = aesCipher.getAuthTag();

    // Encrypt AES key with RSA
    const rsaKeyPair = this.keyStore.get(rsaKeyId)!;
    const encryptedAESKey = crypto.publicEncrypt({
      key: rsaKeyPair.publicKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256'
    }, aesKey);

    // Combine encrypted key + data
    const combinedData = `${encryptedAESKey.toString('hex')}:${encryptedData}`;
    
    const hmac = crypto.createHmac('sha256', aesKey);
    hmac.update(combinedData);
    const integrity = hmac.digest('hex');

    return {
      data: combinedData,
      keyId: rsaKeyId,
      algorithm: 'RSA-4096-AES-256-GCM',
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
      timestamp: new Date(),
      integrity
    };
  }

  /**
   * Hybrid decryption
   */
  private hybridDecryption(encryptedData: EncryptedData): string {
    const [encryptedAESKey, encryptedContent] = encryptedData.data.split(':');
    const rsaKeyPair = this.keyStore.get(encryptedData.keyId)!;
    
    // Decrypt AES key with RSA
    const aesKey = crypto.privateDecrypt({
      key: rsaKeyPair.privateKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256'
    }, Buffer.from(encryptedAESKey, 'hex'));

    // Verify integrity
    const hmac = crypto.createHmac('sha256', aesKey);
    hmac.update(encryptedData.data);
    const expectedIntegrity = hmac.digest('hex');
    
    if (expectedIntegrity !== encryptedData.integrity) {
      throw new Error('Hybrid encryption integrity violation');
    }

    // Decrypt data with AES
    const decipher = crypto.createDecipherGCM(
      'aes-256-gcm', 
      aesKey, 
      Buffer.from(encryptedData.iv!, 'hex')
    );
    decipher.setAuthTag(Buffer.from(encryptedData.authTag!, 'hex'));
    
    let decrypted = decipher.update(encryptedContent, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Generate AES-256 key with military-grade key derivation
   */
  private generateAESKey(): EncryptionKeyPair {
    const keyId = `aes-256-${crypto.randomUUID()}`;
    const salt = crypto.randomBytes(32);
    const passphrase = this.generateSecurePassphrase();
    
    // Use PBKDF2 with 1M iterations for key derivation
    const derivedKey = crypto.pbkdf2Sync(
      passphrase, 
      salt, 
      this.keyDerivationRounds, 
      32, 
      'sha256'
    );

    const keyPair: EncryptionKeyPair = {
      publicKey: derivedKey.toString('hex'),
      privateKey: derivedKey.toString('hex'),
      keyId,
      algorithm: 'AES-256-GCM',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      rotationSchedule: 'daily'
    };

    this.keyStore.set(keyId, keyPair);
    this.scheduleKeyRotation(keyId, keyPair.rotationSchedule);

    return keyPair;
  }

  /**
   * Get or create AES key
   */
  private getOrCreateAESKey(keyId: string): EncryptionKeyPair {
    const existing = this.keyStore.get(keyId);
    if (existing && existing.algorithm === 'AES-256-GCM') {
      return existing;
    }
    return this.generateAESKey();
  }

  /**
   * Generate cryptographically secure passphrase
   */
  private generateSecurePassphrase(): string {
    const length = 128; // 128 bytes = 1024 bits
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Generate master keys for HSM initialization
   */
  private generateMasterKeys() {
    // Generate root encryption keys
    const rootKeyPair = this.generateRSAKeyPair();
    const masterAESKey = this.generateAESKey();
    
    this.auditLogger('MASTER_KEYS_GENERATED', {
      rootKeyId: rootKeyPair.keyId,
      masterAESKeyId: masterAESKey.keyId,
      hsm: this.hsm.clusterId,
      classification: 'TOP_SECRET'
    });
  }

  /**
   * Schedule automatic key rotation
   */
  private scheduleKeyRotation(keyId: string, schedule: 'daily' | 'weekly' | 'monthly') {
    const intervals = {
      daily: 24 * 60 * 60 * 1000,      // 24 hours
      weekly: 7 * 24 * 60 * 60 * 1000,  // 7 days
      monthly: 30 * 24 * 60 * 60 * 1000 // 30 days
    };

    const interval = setInterval(() => {
      this.rotateKey(keyId);
    }, intervals[schedule]);

    this.keyRotationSchedule.set(keyId, interval);
  }

  /**
   * Rotate encryption key
   */
  private rotateKey(keyId: string) {
    const oldKey = this.keyStore.get(keyId);
    if (!oldKey) return;

    let newKey: EncryptionKeyPair;

    if (oldKey.algorithm === 'RSA-4096') {
      newKey = this.generateRSAKeyPair();
    } else {
      newKey = this.generateAESKey();
    }

    // Keep old key for decryption of existing data
    this.keyStore.set(`${keyId}-deprecated-${Date.now()}`, oldKey);
    this.keyStore.set(keyId, newKey);

    this.auditLogger('KEY_ROTATED', {
      oldKeyId: keyId,
      newKeyId: newKey.keyId,
      algorithm: oldKey.algorithm,
      classification: 'TOP_SECRET'
    });
  }

  /**
   * Start key rotation scheduler
   */
  private startKeyRotationScheduler() {
    // Check for expired keys every hour
    setInterval(() => {
      this.cleanupExpiredKeys();
    }, 60 * 60 * 1000);
  }

  /**
   * Clean up expired keys
   */
  private cleanupExpiredKeys() {
    const now = new Date();
    const expiredKeys = Array.from(this.keyStore.entries()).filter(
      ([keyId, key]) => key.expiresAt < now
    );

    expiredKeys.forEach(([keyId, key]) => {
      this.keyStore.delete(keyId);
      
      const interval = this.keyRotationSchedule.get(keyId);
      if (interval) {
        clearInterval(interval);
        this.keyRotationSchedule.delete(keyId);
      }

      this.auditLogger('KEY_EXPIRED_REMOVED', {
        keyId,
        algorithm: key.algorithm,
        classification: 'SECURITY_CLEANUP'
      });
    });
  }

  /**
   * Get key information (for audit purposes)
   */
  getKeyInfo(keyId: string): Partial<EncryptionKeyPair> | null {
    const key = this.keyStore.get(keyId);
    if (!key) return null;

    return {
      keyId: key.keyId,
      algorithm: key.algorithm,
      createdAt: key.createdAt,
      expiresAt: key.expiresAt,
      rotationSchedule: key.rotationSchedule
      // Never return actual keys
    };
  }

  /**
   * Emergency key destruction (for security breaches)
   */
  emergencyKeyDestruction(keyId: string, executiveAuthorization: string): boolean {
    this.auditLogger('EMERGENCY_KEY_DESTRUCTION', {
      keyId,
      executiveAuth: executiveAuthorization,
      timestamp: new Date(),
      classification: 'CRITICAL_SECURITY_EVENT'
    });

    const deleted = this.keyStore.delete(keyId);
    
    const interval = this.keyRotationSchedule.get(keyId);
    if (interval) {
      clearInterval(interval);
      this.keyRotationSchedule.delete(keyId);
    }

    return deleted;
  }

  /**
   * Get encryption statistics for monitoring
   */
  getEncryptionStats() {
    const totalKeys = this.keyStore.size;
    const keysByAlgorithm = Array.from(this.keyStore.values()).reduce((acc, key) => {
      acc[key.algorithm] = (acc[key.algorithm] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalKeys,
      keysByAlgorithm,
      hsmStatus: this.hsm,
      securityLevel: 'MILITARY_GRADE',
      classification: 'TOP_SECRET'
    };
  }
}

export default MilitaryGradeEncryption;
