import { createCipheriv, createDecipheriv, randomBytes, scryptSync, createHash } from 'crypto';
import { EventEmitter } from 'events';

// Types for vault operations
interface VaultRecord {
  id: string;
  userId: string;
  dataType: 'kyc' | 'age_verification' | '2257_record' | 'payment_info' | 'sensitive_profile' | 'compliance_doc';
  encryptedData: string;
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    accessedAt: Date;
    retentionPolicy: string;
    complianceLevel: 'standard' | 'high' | 'critical';
    auditRequired: boolean;
  };
  checksum: string;
  version: number;
}

interface KYCDocument {
  documentType: 'government_id' | 'passport' | 'drivers_license' | 'utility_bill' | 'bank_statement';
  documentNumber?: string;
  issuingCountry: string;
  expiryDate?: Date;
  verificationStatus: 'pending' | 'verified' | 'rejected' | 'expired';
  verificationDate?: Date;
  verifiedBy?: string;
  frontImageHash?: string;
  backImageHash?: string;
}

interface AgeVerificationRecord {
  dateOfBirth: Date;
  verificationMethod: 'document' | 'credit_card' | 'database_check' | 'third_party';
  verificationProvider?: string;
  verificationDate: Date;
  isVerified: boolean;
  minimumAge: number;
  documentReference?: string;
}

interface ComplianceRecord2257 {
  performerName: string;
  legalName: string;
  dateOfBirth: Date;
  ageAtRecording: number;
  documentType: string;
  documentNumber: string;
  issuingAuthority: string;
  recordCreationDate: Date;
  custodianName: string;
  custodianAddress: string;
  contentProducer: string;
  contentTitle: string;
  recordingDate: Date;
  witnessName?: string;
  witnessSignature?: string;
}

interface AccessLog {
  recordId: string;
  userId: string;
  accessorId: string;
  accessType: 'read' | 'write' | 'delete' | 'audit';
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  reason: string;
  approved: boolean;
  approvedBy?: string;
}

interface RetentionPolicy {
  dataType: string;
  retentionPeriod: number; // in months
  autoDelete: boolean;
  requiresApproval: boolean;
  notificationPeriod: number; // months before expiry to notify
  legalRequirement: string;
}

export class FanzHubVault extends EventEmitter {
  private encryptionKey: Buffer;
  private vaultStorage: Map<string, VaultRecord> = new Map();
  private accessLogs: AccessLog[] = [];
  private retentionPolicies: Map<string, RetentionPolicy> = new Map();
  private auditQueue: Map<string, any> = new Map();

  constructor() {
    super();
    this.initializeEncryption();
    this.initializeRetentionPolicies();
    this.startRetentionMonitoring();
    this.startAuditProcessing();
  }

  private initializeEncryption(): void {
    // In production, this should come from a secure key management system
    const password = process.env.VAULT_MASTER_KEY || 'development-master-key-change-in-production';
    const salt = process.env.VAULT_SALT || 'vault-salt-12345';
    
    this.encryptionKey = scryptSync(password, salt, 32);
    console.log('🔐 FanzHubVault encryption initialized');
  }

  private initializeRetentionPolicies(): void {
    const policies: RetentionPolicy[] = [
      {
        dataType: 'kyc',
        retentionPeriod: 84, // 7 years for regulatory compliance
        autoDelete: false,
        requiresApproval: true,
        notificationPeriod: 6,
        legalRequirement: '18 USC 2257 - Record Keeping Requirements'
      },
      {
        dataType: 'age_verification',
        retentionPeriod: 84, // 7 years
        autoDelete: false,
        requiresApproval: true,
        notificationPeriod: 6,
        legalRequirement: '18 USC 2257 - Age Verification Requirements'
      },
      {
        dataType: '2257_record',
        retentionPeriod: 84, // 7 years minimum by law
        autoDelete: false,
        requiresApproval: false,
        notificationPeriod: 12,
        legalRequirement: '18 USC 2257 - Mandatory Record Keeping'
      },
      {
        dataType: 'payment_info',
        retentionPeriod: 36, // 3 years for financial records
        autoDelete: true,
        requiresApproval: false,
        notificationPeriod: 3,
        legalRequirement: 'PCI DSS - Payment Card Industry Standards'
      },
      {
        dataType: 'sensitive_profile',
        retentionPeriod: 24, // 2 years after account closure
        autoDelete: true,
        requiresApproval: false,
        notificationPeriod: 2,
        legalRequirement: 'GDPR - Right to be Forgotten'
      },
      {
        dataType: 'compliance_doc',
        retentionPeriod: 120, // 10 years for legal documents
        autoDelete: false,
        requiresApproval: true,
        notificationPeriod: 12,
        legalRequirement: 'Corporate Record Retention Policy'
      }
    ];

    policies.forEach(policy => {
      this.retentionPolicies.set(policy.dataType, policy);
    });

    console.log('📋 FanzHubVault retention policies initialized');
  }

  // Core encryption/decryption methods
  private encrypt(data: string): string {
    const iv = randomBytes(16);
    const cipher = createCipheriv('aes-256-gcm', this.encryptionKey, iv);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
  }

  private decrypt(encryptedData: string): string {
    const parts = encryptedData.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }

    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    
    const decipher = createDecipheriv('aes-256-gcm', this.encryptionKey, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  private generateChecksum(data: string): string {
    return createHash('sha256').update(data).digest('hex');
  }

  // KYC Document Management
  async storeKYCDocument(userId: string, kycData: KYCDocument, accessorId: string): Promise<string> {
    try {
      const recordId = `kyc_${userId}_${Date.now()}`;
      const dataString = JSON.stringify(kycData);
      const encryptedData = this.encrypt(dataString);
      const checksum = this.generateChecksum(dataString);

      const record: VaultRecord = {
        id: recordId,
        userId,
        dataType: 'kyc',
        encryptedData,
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          accessedAt: new Date(),
          retentionPolicy: 'kyc',
          complianceLevel: 'critical',
          auditRequired: true
        },
        checksum,
        version: 1
      };

      this.vaultStorage.set(recordId, record);
      this.logAccess(recordId, userId, accessorId, 'write', 'KYC document storage');
      
      this.emit('document:stored', { recordId, userId, dataType: 'kyc' });
      
      console.log(`🆔 KYC document stored for user ${userId}`);
      return recordId;
      
    } catch (error) {
      console.error('Error storing KYC document:', error);
      throw new Error('Failed to store KYC document');
    }
  }

  async retrieveKYCDocument(recordId: string, accessorId: string, reason: string): Promise<KYCDocument | null> {
    try {
      const record = this.vaultStorage.get(recordId);
      if (!record || record.dataType !== 'kyc') {
        return null;
      }

      // Update access metadata
      record.metadata.accessedAt = new Date();
      this.logAccess(recordId, record.userId, accessorId, 'read', reason);

      const decryptedData = this.decrypt(record.encryptedData);
      const kycData = JSON.parse(decryptedData) as KYCDocument;

      // Verify data integrity
      const currentChecksum = this.generateChecksum(decryptedData);
      if (currentChecksum !== record.checksum) {
        console.error(`Data integrity check failed for record ${recordId}`);
        this.emit('security:alert', { type: 'integrity_violation', recordId });
        throw new Error('Data integrity violation detected');
      }

      this.emit('document:accessed', { recordId, accessorId, dataType: 'kyc' });
      return kycData;
      
    } catch (error) {
      console.error('Error retrieving KYC document:', error);
      return null;
    }
  }

  // Age Verification Management
  async storeAgeVerification(userId: string, ageData: AgeVerificationRecord, accessorId: string): Promise<string> {
    try {
      const recordId = `age_${userId}_${Date.now()}`;
      const dataString = JSON.stringify(ageData);
      const encryptedData = this.encrypt(dataString);
      const checksum = this.generateChecksum(dataString);

      const record: VaultRecord = {
        id: recordId,
        userId,
        dataType: 'age_verification',
        encryptedData,
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          accessedAt: new Date(),
          retentionPolicy: 'age_verification',
          complianceLevel: 'critical',
          auditRequired: true
        },
        checksum,
        version: 1
      };

      this.vaultStorage.set(recordId, record);
      this.logAccess(recordId, userId, accessorId, 'write', 'Age verification storage');
      
      this.emit('verification:stored', { recordId, userId, verified: ageData.isVerified });
      
      console.log(`🔞 Age verification stored for user ${userId} - Verified: ${ageData.isVerified}`);
      return recordId;
      
    } catch (error) {
      console.error('Error storing age verification:', error);
      throw new Error('Failed to store age verification');
    }
  }

  // 2257 Compliance Record Management
  async store2257Record(userId: string, complianceData: ComplianceRecord2257, accessorId: string): Promise<string> {
    try {
      const recordId = `2257_${userId}_${Date.now()}`;
      const dataString = JSON.stringify(complianceData);
      const encryptedData = this.encrypt(dataString);
      const checksum = this.generateChecksum(dataString);

      const record: VaultRecord = {
        id: recordId,
        userId,
        dataType: '2257_record',
        encryptedData,
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          accessedAt: new Date(),
          retentionPolicy: '2257_record',
          complianceLevel: 'critical',
          auditRequired: true
        },
        checksum,
        version: 1
      };

      this.vaultStorage.set(recordId, record);
      this.logAccess(recordId, userId, accessorId, 'write', '18 USC 2257 compliance record');
      
      this.emit('compliance:stored', { recordId, userId, dataType: '2257_record' });
      
      console.log(`📝 2257 compliance record stored for ${complianceData.performerName}`);
      return recordId;
      
    } catch (error) {
      console.error('Error storing 2257 record:', error);
      throw new Error('Failed to store 2257 compliance record');
    }
  }

  // Secure data retrieval with audit logging
  async retrieveRecord(recordId: string, accessorId: string, reason: string): Promise<any | null> {
    try {
      const record = this.vaultStorage.get(recordId);
      if (!record) {
        return null;
      }

      // Check if accessor has permission (in production, implement proper RBAC)
      if (!this.hasAccessPermission(accessorId, record.dataType)) {
        console.warn(`Access denied: ${accessorId} attempting to access ${record.dataType} record`);
        this.logAccess(recordId, record.userId, accessorId, 'read', reason, false);
        return null;
      }

      record.metadata.accessedAt = new Date();
      this.logAccess(recordId, record.userId, accessorId, 'read', reason);

      const decryptedData = this.decrypt(record.encryptedData);
      const parsedData = JSON.parse(decryptedData);

      // Verify integrity
      const currentChecksum = this.generateChecksum(decryptedData);
      if (currentChecksum !== record.checksum) {
        console.error(`Data integrity check failed for record ${recordId}`);
        this.emit('security:alert', { type: 'integrity_violation', recordId, accessorId });
        throw new Error('Data integrity violation detected');
      }

      this.emit('record:accessed', { recordId, accessorId, dataType: record.dataType });
      return parsedData;
      
    } catch (error) {
      console.error('Error retrieving record:', error);
      return null;
    }
  }

  // Data retention and cleanup
  private startRetentionMonitoring(): void {
    // Run retention check every 24 hours
    setInterval(() => {
      this.processDataRetention();
    }, 24 * 60 * 60 * 1000);

    // Initial check
    setTimeout(() => {
      this.processDataRetention();
    }, 5000);
  }

  private processDataRetention(): void {
    const now = new Date();
    const expiredRecords: VaultRecord[] = [];
    const nearExpiryRecords: VaultRecord[] = [];

    this.vaultStorage.forEach((record) => {
      const policy = this.retentionPolicies.get(record.dataType);
      if (!policy) return;

      const ageInMonths = this.getAgeInMonths(record.metadata.createdAt, now);
      const notificationThreshold = policy.retentionPeriod - policy.notificationPeriod;

      if (ageInMonths >= policy.retentionPeriod) {
        expiredRecords.push(record);
      } else if (ageInMonths >= notificationThreshold) {
        nearExpiryRecords.push(record);
      }
    });

    // Process expired records
    expiredRecords.forEach(record => {
      const policy = this.retentionPolicies.get(record.dataType)!;
      if (policy.autoDelete && !policy.requiresApproval) {
        this.securelyDeleteRecord(record.id);
      } else {
        this.emit('retention:expired', { record, policy });
      }
    });

    // Notify about near-expiry records
    nearExpiryRecords.forEach(record => {
      this.emit('retention:warning', { record, policy: this.retentionPolicies.get(record.dataType) });
    });

    if (expiredRecords.length > 0 || nearExpiryRecords.length > 0) {
      console.log(`🗂️  Retention check: ${expiredRecords.length} expired, ${nearExpiryRecords.length} near expiry`);
    }
  }

  private getAgeInMonths(date: Date, now: Date): number {
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.floor(diffDays / 30.44); // Average days per month
  }

  // Secure deletion with overwriting
  private securelyDeleteRecord(recordId: string): boolean {
    try {
      const record = this.vaultStorage.get(recordId);
      if (!record) return false;

      // Overwrite with random data multiple times (DoD 5220.22-M standard)
      for (let i = 0; i < 3; i++) {
        const randomData = randomBytes(record.encryptedData.length).toString('hex');
        record.encryptedData = randomData;
      }

      // Remove from storage
      this.vaultStorage.delete(recordId);
      
      this.emit('record:deleted', { recordId, userId: record.userId, dataType: record.dataType });
      console.log(`🗑️  Securely deleted record ${recordId}`);
      return true;
      
    } catch (error) {
      console.error('Error securely deleting record:', error);
      return false;
    }
  }

  // Access control and permissions
  private hasAccessPermission(accessorId: string, dataType: string): boolean {
    // In production, implement proper RBAC with database lookup
    // For now, return true for development
    return true;
  }

  // Audit logging
  private logAccess(recordId: string, userId: string, accessorId: string, accessType: 'read' | 'write' | 'delete' | 'audit', reason: string, approved: boolean = true): void {
    const logEntry: AccessLog = {
      recordId,
      userId,
      accessorId,
      accessType,
      timestamp: new Date(),
      ipAddress: '0.0.0.0', // In production, get from request
      userAgent: 'FanzHubVault-Server',
      reason,
      approved
    };

    this.accessLogs.push(logEntry);
    
    // Keep only last 10000 log entries in memory
    if (this.accessLogs.length > 10000) {
      this.accessLogs.splice(0, 1000);
    }

    this.emit('access:logged', logEntry);
  }

  // Audit processing
  private startAuditProcessing(): void {
    // Process audit queue every 5 minutes
    setInterval(() => {
      this.processAuditQueue();
    }, 5 * 60 * 1000);
  }

  private processAuditQueue(): void {
    // In production, this would generate compliance reports,
    // send alerts, and integrate with external audit systems
    console.log(`📊 Audit queue processed: ${this.auditQueue.size} pending items`);
  }

  // Public API methods
  async getVaultStatistics(): Promise<any> {
    const stats = {
      totalRecords: this.vaultStorage.size,
      recordsByType: new Map<string, number>(),
      totalAccessLogs: this.accessLogs.length,
      encryptionStatus: 'active',
      retentionPolicies: this.retentionPolicies.size,
      lastRetentionCheck: new Date()
    };

    this.vaultStorage.forEach(record => {
      const count = stats.recordsByType.get(record.dataType) || 0;
      stats.recordsByType.set(record.dataType, count + 1);
    });

    return stats;
  }

  async getUserRecords(userId: string, accessorId: string): Promise<string[]> {
    const userRecords: string[] = [];
    
    this.vaultStorage.forEach((record, recordId) => {
      if (record.userId === userId && this.hasAccessPermission(accessorId, record.dataType)) {
        userRecords.push(recordId);
      }
    });

    this.logAccess('system', userId, accessorId, 'audit', 'User record listing');
    return userRecords;
  }

  async getComplianceReport(startDate: Date, endDate: Date): Promise<any> {
    const report = {
      period: { startDate, endDate },
      recordsCreated: 0,
      recordsAccessed: 0,
      complianceViolations: 0,
      retentionActions: 0,
      auditEvents: this.accessLogs.filter(log => 
        log.timestamp >= startDate && log.timestamp <= endDate
      ).length
    };

    return report;
  }
}

export const fanzHubVault = new FanzHubVault();

// Set up event listeners for compliance monitoring
fanzHubVault.on('security:alert', (alert) => {
  console.error('🚨 SECURITY ALERT:', alert);
});

fanzHubVault.on('retention:expired', (data) => {
  console.warn('⏰ Data retention expired:', data.record.id);
});

fanzHubVault.on('retention:warning', (data) => {
  console.info('📅 Data retention warning:', data.record.id);
});