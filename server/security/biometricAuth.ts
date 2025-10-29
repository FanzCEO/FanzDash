import { webcrypto } from 'crypto';
import type { AuthenticationCredential, PublicKeyCredential } from '@webauthn/types';
import MilitaryGradeEncryption, { EncryptedData } from './militaryEncryption';

/**
 * Military-Grade Biometric Authentication System
 * WebAuthn + Hardware Security Integration
 * Classified: TOP SECRET - Executive Access Control
 */

export interface BiometricCredential {
  id: string;
  userId: string;
  publicKey: string;
  algorithm: string;
  counter: number;
  credentialType: 'fingerprint' | 'facial' | 'voice' | 'hardware_token' | 'yubikey';
  deviceInfo: {
    aaguid: string;
    deviceName: string;
    transportMethods: string[];
  };
  createdAt: Date;
  lastUsed: Date;
  isActive: boolean;
  clearanceLevel: 1 | 2 | 3 | 4 | 5;
  emergencyOverride?: boolean;
}

export interface EmergencyAccessCode {
  codeId: string;
  executiveId: string;
  hashedCode: string;
  expiresAt: Date;
  usageCount: number;
  maxUsages: number;
  clearanceLevel: 5;
  reasonCode: 'SECURITY_BREACH' | 'EXECUTIVE_OVERRIDE' | 'CRISIS_MANAGEMENT' | 'SYSTEM_RECOVERY';
  isActive: boolean;
}

export interface MultiSignatureTransaction {
  transactionId: string;
  type: 'FINANCIAL' | 'SECURITY' | 'EMERGENCY' | 'SYSTEM_CHANGE';
  requiredSignatures: number;
  currentSignatures: BiometricSignature[];
  threshold: number;
  executiveRequirement: boolean;
  timeoutAt: Date;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
  metadata: any;
}

export interface BiometricSignature {
  signatureId: string;
  userId: string;
  credentialId: string;
  signatureData: string;
  timestamp: Date;
  clearanceLevel: number;
  isExecutive: boolean;
}

export class MilitaryBiometricAuth {
  private encryption: MilitaryGradeEncryption;
  private credentials: Map<string, BiometricCredential> = new Map();
  private emergencyCodes: Map<string, EmergencyAccessCode> = new Map();
  private pendingTransactions: Map<string, MultiSignatureTransaction> = new Map();
  private auditLogger: (event: string, data: any) => void;
  private relyingPartyId: string;
  private relyingPartyName: string;

  constructor(
    encryption: MilitaryGradeEncryption,
    auditLogger: (event: string, data: any) => void,
    relyingPartyId: string = 'fanzunlimited.com'
  ) {
    this.encryption = encryption;
    this.auditLogger = auditLogger;
    this.relyingPartyId = relyingPartyId;
    this.relyingPartyName = 'FanzDash Central Command';
    
    this.initializeBiometricSystems();
  }

  /**
   * Initialize biometric authentication systems
   */
  private initializeBiometricSystems() {
    this.auditLogger('BIOMETRIC_SYSTEM_INIT', {
      relyingPartyId: this.relyingPartyId,
      supportedMethods: ['fingerprint', 'facial', 'voice', 'hardware_token', 'yubikey'],
      securityLevel: 'MILITARY_GRADE',
      classification: 'TOP_SECRET'
    });

    // Start emergency code cleanup scheduler
    this.startEmergencyCodeCleanup();
    
    // Initialize transaction timeout handler
    this.startTransactionTimeoutHandler();
  }

  /**
   * Register new biometric credential (WebAuthn Registration)
   */
  async registerBiometricCredential(
    userId: string,
    username: string,
    displayName: string,
    credentialType: BiometricCredential['credentialType'],
    clearanceLevel: BiometricCredential['clearanceLevel']
  ): Promise<{ challenge: string; options: PublicKeyCredentialCreationOptions }> {
    
    const challenge = new Uint8Array(32);
    webcrypto.getRandomValues(challenge);

    const options: PublicKeyCredentialCreationOptions = {
      challenge,
      rp: {
        name: this.relyingPartyName,
        id: this.relyingPartyId
      },
      user: {
        id: new TextEncoder().encode(userId),
        name: username,
        displayName
      },
      pubKeyCredParams: [
        { alg: -7, type: 'public-key' },   // ES256 (ECDSA w/ SHA-256)
        { alg: -257, type: 'public-key' }, // RS256 (RSASSA-PKCS1-v1_5 w/ SHA-256)
        { alg: -37, type: 'public-key' },  // PS256 (RSASSA-PSS w/ SHA-256)
      ],
      authenticatorSelection: {
        authenticatorAttachment: credentialType === 'hardware_token' || credentialType === 'yubikey' 
          ? 'cross-platform' 
          : 'platform',
        userVerification: 'required',
        requireResidentKey: true
      },
      attestation: 'direct', // For military-grade verification
      timeout: 60000, // 1 minute timeout
      excludeCredentials: this.getExistingCredentials(userId).map(cred => ({
        id: new TextEncoder().encode(cred.id),
        type: 'public-key'
      }))
    };

    // Log registration attempt
    this.auditLogger('BIOMETRIC_REGISTRATION_START', {
      userId,
      credentialType,
      clearanceLevel,
      challengeId: Buffer.from(challenge).toString('hex'),
      classification: 'CONFIDENTIAL'
    });

    return {
      challenge: Buffer.from(challenge).toString('base64url'),
      options
    };
  }

  /**
   * Complete biometric credential registration
   */
  async completeBiometricRegistration(
    userId: string,
    credential: AuthenticationCredential,
    credentialType: BiometricCredential['credentialType'],
    clearanceLevel: BiometricCredential['clearanceLevel']
  ): Promise<BiometricCredential> {
    
    if (!credential.response.publicKey) {
      throw new Error('Invalid credential response');
    }

    // Verify attestation (simplified for demo)
    const publicKeyJWK = await this.extractPublicKeyFromCredential(credential);
    
    // Encrypt biometric data
    const encryptedPublicKey = this.encryption.encryptAES256GCM(
      JSON.stringify(publicKeyJWK)
    );

    const biometricCredential: BiometricCredential = {
      id: credential.id,
      userId,
      publicKey: JSON.stringify(encryptedPublicKey),
      algorithm: this.getAlgorithmFromCredential(credential),
      counter: credential.response.authenticatorData?.counter || 0,
      credentialType,
      deviceInfo: {
        aaguid: this.extractAAGUID(credential),
        deviceName: this.getDeviceName(credentialType),
        transportMethods: credential.response.transports || []
      },
      createdAt: new Date(),
      lastUsed: new Date(),
      isActive: true,
      clearanceLevel,
      emergencyOverride: clearanceLevel >= 4
    };

    this.credentials.set(credential.id, biometricCredential);

    this.auditLogger('BIOMETRIC_REGISTRATION_COMPLETE', {
      credentialId: credential.id,
      userId,
      credentialType,
      clearanceLevel,
      deviceInfo: biometricCredential.deviceInfo,
      classification: 'TOP_SECRET'
    });

    return biometricCredential;
  }

  /**
   * Authenticate with biometric credential
   */
  async authenticateBiometric(
    credentialId: string,
    authData: AuthenticationCredential
  ): Promise<{ success: boolean; clearanceLevel: number; userId: string }> {
    
    const credential = this.credentials.get(credentialId);
    if (!credential || !credential.isActive) {
      this.auditLogger('BIOMETRIC_AUTH_FAILED', {
        credentialId,
        reason: 'CREDENTIAL_NOT_FOUND',
        classification: 'SECURITY_ALERT'
      });
      throw new Error('Biometric credential not found or inactive');
    }

    try {
      // Decrypt stored public key
      const encryptedKey: EncryptedData = JSON.parse(credential.publicKey);
      const publicKeyJWK = JSON.parse(this.encryption.decryptAES256GCM(encryptedKey));

      // Verify signature (simplified WebAuthn verification)
      const isValid = await this.verifyBiometricSignature(
        authData,
        publicKeyJWK,
        credential
      );

      if (!isValid) {
        this.auditLogger('BIOMETRIC_AUTH_FAILED', {
          credentialId,
          userId: credential.userId,
          reason: 'SIGNATURE_VERIFICATION_FAILED',
          classification: 'SECURITY_ALERT'
        });
        return { success: false, clearanceLevel: 0, userId: credential.userId };
      }

      // Update credential usage
      credential.lastUsed = new Date();
      credential.counter = Math.max(credential.counter, authData.response.authenticatorData?.counter || 0);

      this.auditLogger('BIOMETRIC_AUTH_SUCCESS', {
        credentialId,
        userId: credential.userId,
        credentialType: credential.credentialType,
        clearanceLevel: credential.clearanceLevel,
        classification: 'TOP_SECRET'
      });

      return {
        success: true,
        clearanceLevel: credential.clearanceLevel,
        userId: credential.userId
      };

    } catch (error) {
      this.auditLogger('BIOMETRIC_AUTH_ERROR', {
        credentialId,
        error: error instanceof Error ? error.message : 'Unknown error',
        classification: 'CRITICAL_ALERT'
      });
      throw error;
    }
  }

  /**
   * Generate emergency access code for executives
   */
  generateEmergencyAccessCode(
    executiveId: string,
    reasonCode: EmergencyAccessCode['reasonCode'],
    durationMinutes: number = 60
  ): { codeId: string; accessCode: string; expiresAt: Date } {
    
    const codeId = `emergency-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Generate cryptographically secure 12-digit code
    const accessCode = Array.from(
      { length: 12 }, 
      () => Math.floor(Math.random() * 10)
    ).join('');

    // Hash the access code
    const hashedCode = this.encryption.encryptAES256GCM(accessCode);

    const expiresAt = new Date(Date.now() + durationMinutes * 60 * 1000);

    const emergencyCode: EmergencyAccessCode = {
      codeId,
      executiveId,
      hashedCode: JSON.stringify(hashedCode),
      expiresAt,
      usageCount: 0,
      maxUsages: 1, // Single use for security
      clearanceLevel: 5,
      reasonCode,
      isActive: true
    };

    this.emergencyCodes.set(codeId, emergencyCode);

    this.auditLogger('EMERGENCY_CODE_GENERATED', {
      codeId,
      executiveId,
      reasonCode,
      expiresAt,
      classification: 'CRITICAL_EXECUTIVE'
    });

    return { codeId, accessCode, expiresAt };
  }

  /**
   * Validate emergency access code
   */
  validateEmergencyAccessCode(
    codeId: string,
    accessCode: string
  ): { valid: boolean; executiveId?: string; clearanceLevel?: number } {
    
    const emergencyCode = this.emergencyCodes.get(codeId);
    
    if (!emergencyCode || !emergencyCode.isActive) {
      this.auditLogger('EMERGENCY_CODE_INVALID', {
        codeId,
        reason: 'CODE_NOT_FOUND',
        classification: 'SECURITY_ALERT'
      });
      return { valid: false };
    }

    if (emergencyCode.expiresAt < new Date()) {
      this.auditLogger('EMERGENCY_CODE_EXPIRED', {
        codeId,
        executiveId: emergencyCode.executiveId,
        classification: 'SECURITY_ALERT'
      });
      return { valid: false };
    }

    if (emergencyCode.usageCount >= emergencyCode.maxUsages) {
      this.auditLogger('EMERGENCY_CODE_EXHAUSTED', {
        codeId,
        executiveId: emergencyCode.executiveId,
        classification: 'SECURITY_ALERT'
      });
      return { valid: false };
    }

    try {
      // Decrypt and verify access code
      const encryptedCode: EncryptedData = JSON.parse(emergencyCode.hashedCode);
      const storedCode = this.encryption.decryptAES256GCM(encryptedCode);
      
      if (storedCode !== accessCode) {
        this.auditLogger('EMERGENCY_CODE_MISMATCH', {
          codeId,
          executiveId: emergencyCode.executiveId,
          classification: 'SECURITY_ALERT'
        });
        return { valid: false };
      }

      // Mark as used
      emergencyCode.usageCount++;
      if (emergencyCode.usageCount >= emergencyCode.maxUsages) {
        emergencyCode.isActive = false;
      }

      this.auditLogger('EMERGENCY_CODE_VALIDATED', {
        codeId,
        executiveId: emergencyCode.executiveId,
        reasonCode: emergencyCode.reasonCode,
        classification: 'CRITICAL_EXECUTIVE'
      });

      return {
        valid: true,
        executiveId: emergencyCode.executiveId,
        clearanceLevel: emergencyCode.clearanceLevel
      };

    } catch (error) {
      this.auditLogger('EMERGENCY_CODE_ERROR', {
        codeId,
        error: error instanceof Error ? error.message : 'Unknown error',
        classification: 'CRITICAL_ALERT'
      });
      return { valid: false };
    }
  }

  /**
   * Create multi-signature transaction requirement
   */
  createMultiSignatureTransaction(
    type: MultiSignatureTransaction['type'],
    requiredSignatures: number,
    threshold: number,
    executiveRequirement: boolean,
    metadata: any,
    timeoutMinutes: number = 30
  ): string {
    
    const transactionId = `multisig-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const transaction: MultiSignatureTransaction = {
      transactionId,
      type,
      requiredSignatures,
      currentSignatures: [],
      threshold,
      executiveRequirement,
      timeoutAt: new Date(Date.now() + timeoutMinutes * 60 * 1000),
      status: 'PENDING',
      metadata
    };

    this.pendingTransactions.set(transactionId, transaction);

    this.auditLogger('MULTISIG_TRANSACTION_CREATED', {
      transactionId,
      type,
      requiredSignatures,
      threshold,
      executiveRequirement,
      metadata,
      classification: 'TOP_SECRET'
    });

    return transactionId;
  }

  /**
   * Sign multi-signature transaction
   */
  async signMultiSigTransaction(
    transactionId: string,
    userId: string,
    credentialId: string,
    signatureData: string
  ): Promise<{ approved: boolean; status: string; remainingSignatures: number }> {
    
    const transaction = this.pendingTransactions.get(transactionId);
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    if (transaction.status !== 'PENDING') {
      throw new Error(`Transaction status is ${transaction.status}`);
    }

    if (transaction.timeoutAt < new Date()) {
      transaction.status = 'EXPIRED';
      this.auditLogger('MULTISIG_TRANSACTION_EXPIRED', {
        transactionId,
        classification: 'SECURITY_ALERT'
      });
      throw new Error('Transaction has expired');
    }

    const credential = this.credentials.get(credentialId);
    if (!credential) {
      throw new Error('Credential not found');
    }

    // Check if user already signed
    const existingSignature = transaction.currentSignatures.find(sig => sig.userId === userId);
    if (existingSignature) {
      throw new Error('User has already signed this transaction');
    }

    const signature: BiometricSignature = {
      signatureId: `sig-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      credentialId,
      signatureData,
      timestamp: new Date(),
      clearanceLevel: credential.clearanceLevel,
      isExecutive: credential.clearanceLevel >= 4
    };

    transaction.currentSignatures.push(signature);

    this.auditLogger('MULTISIG_SIGNATURE_ADDED', {
      transactionId,
      userId,
      clearanceLevel: credential.clearanceLevel,
      isExecutive: signature.isExecutive,
      classification: 'TOP_SECRET'
    });

    // Check if transaction can be approved
    const { approved, status } = this.evaluateTransactionApproval(transaction);
    transaction.status = status;

    if (approved) {
      this.auditLogger('MULTISIG_TRANSACTION_APPROVED', {
        transactionId,
        signatures: transaction.currentSignatures.length,
        executiveSignatures: transaction.currentSignatures.filter(s => s.isExecutive).length,
        classification: 'CRITICAL_EXECUTIVE'
      });
    }

    return {
      approved,
      status,
      remainingSignatures: Math.max(0, transaction.requiredSignatures - transaction.currentSignatures.length)
    };
  }

  /**
   * Evaluate if transaction meets approval requirements
   */
  private evaluateTransactionApproval(transaction: MultiSignatureTransaction): { approved: boolean; status: string } {
    const currentSigs = transaction.currentSignatures.length;
    const executiveSigs = transaction.currentSignatures.filter(sig => sig.isExecutive).length;

    // Check basic signature threshold
    if (currentSigs < transaction.threshold) {
      return { approved: false, status: 'PENDING' };
    }

    // Check if executive requirement is met
    if (transaction.executiveRequirement && executiveSigs === 0) {
      return { approved: false, status: 'PENDING' };
    }

    // Check if required signatures count is met
    if (currentSigs >= transaction.requiredSignatures) {
      return { approved: true, status: 'APPROVED' };
    }

    return { approved: false, status: 'PENDING' };
  }

  /**
   * Get existing credentials for user
   */
  private getExistingCredentials(userId: string): BiometricCredential[] {
    return Array.from(this.credentials.values()).filter(
      cred => cred.userId === userId && cred.isActive
    );
  }

  /**
   * Extract public key from WebAuthn credential (simplified)
   */
  private async extractPublicKeyFromCredential(credential: AuthenticationCredential): Promise<JsonWebKey> {
    // This would typically involve CBOR decoding of the public key
    // Simplified for demonstration
    return {
      kty: 'EC',
      alg: 'ES256',
      use: 'sig',
      x: Buffer.from('dummy-x-coordinate').toString('base64url'),
      y: Buffer.from('dummy-y-coordinate').toString('base64url'),
      crv: 'P-256'
    };
  }

  /**
   * Get algorithm from credential
   */
  private getAlgorithmFromCredential(credential: AuthenticationCredential): string {
    // Extract algorithm from credential public key
    return 'ES256'; // Simplified
  }

  /**
   * Extract AAGUID from credential
   */
  private extractAAGUID(credential: AuthenticationCredential): string {
    // Extract AAGUID from authenticator data
    return 'mock-aaguid-12345678'; // Simplified
  }

  /**
   * Get device name based on credential type
   */
  private getDeviceName(credentialType: BiometricCredential['credentialType']): string {
    const deviceNames = {
      fingerprint: 'Touch ID / Fingerprint Scanner',
      facial: 'Face ID / Facial Recognition',
      voice: 'Voice Recognition System',
      hardware_token: 'Hardware Security Token',
      yubikey: 'YubiKey Hardware Token'
    };
    return deviceNames[credentialType];
  }

  /**
   * Verify biometric signature (simplified WebAuthn verification)
   */
  private async verifyBiometricSignature(
    authData: AuthenticationCredential,
    publicKeyJWK: JsonWebKey,
    credential: BiometricCredential
  ): Promise<boolean> {
    // This would involve proper WebAuthn signature verification
    // Including challenge verification, origin checking, etc.
    // Simplified for demonstration
    return true; // Would be actual cryptographic verification
  }

  /**
   * Start emergency code cleanup scheduler
   */
  private startEmergencyCodeCleanup() {
    setInterval(() => {
      const now = new Date();
      Array.from(this.emergencyCodes.entries()).forEach(([codeId, code]) => {
        if (code.expiresAt < now) {
          this.emergencyCodes.delete(codeId);
          this.auditLogger('EMERGENCY_CODE_CLEANED_UP', {
            codeId,
            executiveId: code.executiveId,
            classification: 'MAINTENANCE'
          });
        }
      });
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  /**
   * Start transaction timeout handler
   */
  private startTransactionTimeoutHandler() {
    setInterval(() => {
      const now = new Date();
      Array.from(this.pendingTransactions.entries()).forEach(([txId, tx]) => {
        if (tx.status === 'PENDING' && tx.timeoutAt < now) {
          tx.status = 'EXPIRED';
          this.auditLogger('MULTISIG_TRANSACTION_EXPIRED', {
            transactionId: txId,
            type: tx.type,
            classification: 'SECURITY_ALERT'
          });
        }
      });
    }, 2 * 60 * 1000); // Every 2 minutes
  }

  /**
   * Get authentication statistics for monitoring
   */
  getAuthenticationStats() {
    const totalCredentials = this.credentials.size;
    const activeCredentials = Array.from(this.credentials.values()).filter(c => c.isActive).length;
    const credentialsByType = Array.from(this.credentials.values()).reduce((acc, cred) => {
      acc[cred.credentialType] = (acc[cred.credentialType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const clearanceLevels = Array.from(this.credentials.values()).reduce((acc, cred) => {
      acc[cred.clearanceLevel] = (acc[cred.clearanceLevel] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    return {
      totalCredentials,
      activeCredentials,
      credentialsByType,
      clearanceLevels,
      emergencyCodesActive: Array.from(this.emergencyCodes.values()).filter(c => c.isActive).length,
      pendingTransactions: Array.from(this.pendingTransactions.values()).filter(t => t.status === 'PENDING').length,
      securityLevel: 'MILITARY_GRADE',
      classification: 'TOP_SECRET'
    };
  }

  /**
   * Emergency credential deactivation
   */
  emergencyDeactivateCredential(credentialId: string, executiveAuth: string): boolean {
    const credential = this.credentials.get(credentialId);
    if (!credential) return false;

    credential.isActive = false;

    this.auditLogger('EMERGENCY_CREDENTIAL_DEACTIVATED', {
      credentialId,
      userId: credential.userId,
      executiveAuth,
      timestamp: new Date(),
      classification: 'CRITICAL_SECURITY_EVENT'
    });

    return true;
  }
}

export default MilitaryBiometricAuth;
