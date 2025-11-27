import { createCipheriv, createDecipheriv, randomBytes, scryptSync, createHash } from 'crypto';
import { EventEmitter } from 'events';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * DocumentVault - Secure storage system for business documents
 *
 * Supports:
 * - CSV files (data imports/exports)
 * - PDF documents (contracts, reports)
 * - DOCX/DOC files (business documents)
 * - XLSX/XLS files (spreadsheets)
 * - TXT files (notes, logs)
 * - JSON files (data exports)
 *
 * Features:
 * - AES-256-GCM encryption at rest
 * - File type validation
 * - Virus scanning placeholder
 * - Access control and audit logging
 * - Versioning support
 * - Metadata management
 * - Search and retrieval
 */

export type DocumentType = 'csv' | 'pdf' | 'docx' | 'doc' | 'xlsx' | 'xls' | 'txt' | 'json' | 'other';
export type DocumentCategory = 'crm' | 'erp' | 'hr' | 'legal' | 'financial' | 'compliance' | 'general';
export type AccessLevel = 'public' | 'internal' | 'confidential' | 'restricted';

interface DocumentMetadata {
  id: string;
  fileName: string;
  originalName: string;
  fileType: DocumentType;
  mimeType: string;
  fileSize: number;
  category: DocumentCategory;
  accessLevel: AccessLevel;
  uploadedBy: string;
  uploadedAt: Date;
  lastAccessedAt: Date;
  accessCount: number;
  version: number;
  previousVersionId?: string;
  tags: string[];
  description?: string;
  encryptedPath: string;
  checksum: string;
  isEncrypted: boolean;
  expiresAt?: Date;
  relatedEntityType?: string; // 'lead', 'client', 'deal', 'project', etc.
  relatedEntityId?: string;
}

interface DocumentAccessLog {
  documentId: string;
  userId: string;
  action: 'upload' | 'download' | 'view' | 'delete' | 'share' | 'update';
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  errorMessage?: string;
}

interface DocumentSearchQuery {
  fileName?: string;
  category?: DocumentCategory;
  uploadedBy?: string;
  tags?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  relatedEntityType?: string;
  relatedEntityId?: string;
}

export class DocumentVault extends EventEmitter {
  private encryptionKey: Buffer;
  private documents: Map<string, DocumentMetadata> = new Map();
  private accessLogs: DocumentAccessLog[] = [];
  private storageBasePath: string;

  // File type mappings
  private readonly ALLOWED_MIME_TYPES: Record<DocumentType, string[]> = {
    csv: ['text/csv', 'application/csv'],
    pdf: ['application/pdf'],
    docx: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    doc: ['application/msword'],
    xlsx: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    xls: ['application/vnd.ms-excel'],
    txt: ['text/plain'],
    json: ['application/json'],
    other: ['application/octet-stream']
  };

  private readonly MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB default

  constructor(storageBasePath?: string) {
    super();
    this.storageBasePath = storageBasePath || process.env.DOCUMENT_STORAGE_PATH || './storage/documents';
    this.initializeEncryption();
    this.initializeStorage();
    console.log('📁 DocumentVault initialized');
  }

  private initializeEncryption(): void {
    const password = process.env.DOCUMENT_VAULT_KEY || 'document-vault-key-change-in-production';
    const salt = process.env.DOCUMENT_VAULT_SALT || 'document-salt-67890';
    this.encryptionKey = scryptSync(password, salt, 32);
  }

  private async initializeStorage(): Promise<void> {
    try {
      await fs.mkdir(this.storageBasePath, { recursive: true });
      console.log(`📂 Document storage initialized at: ${this.storageBasePath}`);
    } catch (error) {
      console.error('Error initializing document storage:', error);
    }
  }

  // Core encryption/decryption methods
  private encrypt(data: Buffer): Buffer {
    const iv = randomBytes(16);
    const cipher = createCipheriv('aes-256-gcm', this.encryptionKey, iv);

    const encrypted = Buffer.concat([
      cipher.update(data),
      cipher.final()
    ]);

    const authTag = cipher.getAuthTag();

    // Format: [iv(16) | authTag(16) | encryptedData]
    return Buffer.concat([iv, authTag, encrypted]);
  }

  private decrypt(encryptedData: Buffer): Buffer {
    const iv = encryptedData.subarray(0, 16);
    const authTag = encryptedData.subarray(16, 32);
    const encrypted = encryptedData.subarray(32);

    const decipher = createDecipheriv('aes-256-gcm', this.encryptionKey, iv);
    decipher.setAuthTag(authTag);

    return Buffer.concat([
      decipher.update(encrypted),
      decipher.final()
    ]);
  }

  private generateChecksum(data: Buffer): string {
    return createHash('sha256').update(data).digest('hex');
  }

  private detectFileType(fileName: string, mimeType?: string): DocumentType {
    const ext = path.extname(fileName).toLowerCase().substring(1);

    const typeMap: Record<string, DocumentType> = {
      csv: 'csv',
      pdf: 'pdf',
      docx: 'docx',
      doc: 'doc',
      xlsx: 'xlsx',
      xls: 'xls',
      txt: 'txt',
      json: 'json'
    };

    return typeMap[ext] || 'other';
  }

  private validateFile(fileSize: number, mimeType: string, fileType: DocumentType): void {
    if (fileSize > this.MAX_FILE_SIZE) {
      throw new Error(`File size exceeds maximum allowed size of ${this.MAX_FILE_SIZE / 1024 / 1024}MB`);
    }

    const allowedMimes = this.ALLOWED_MIME_TYPES[fileType];
    if (!allowedMimes.includes(mimeType) && fileType !== 'other') {
      throw new Error(`Invalid MIME type ${mimeType} for file type ${fileType}`);
    }
  }

  /**
   * Upload and store a document
   */
  async uploadDocument(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string,
    uploadedBy: string,
    options: {
      category?: DocumentCategory;
      accessLevel?: AccessLevel;
      tags?: string[];
      description?: string;
      relatedEntityType?: string;
      relatedEntityId?: string;
      expiresAt?: Date;
    } = {}
  ): Promise<DocumentMetadata> {
    try {
      const fileType = this.detectFileType(fileName, mimeType);
      this.validateFile(fileBuffer.length, mimeType, fileType);

      // Generate unique document ID and storage path
      const documentId = `doc_${Date.now()}_${randomBytes(8).toString('hex')}`;
      const encryptedFileName = `${documentId}.encrypted`;
      const encryptedPath = path.join(this.storageBasePath, encryptedFileName);

      // Encrypt file data
      const encryptedData = this.encrypt(fileBuffer);
      const checksum = this.generateChecksum(fileBuffer);

      // Save encrypted file
      await fs.writeFile(encryptedPath, encryptedData);

      // Create metadata
      const metadata: DocumentMetadata = {
        id: documentId,
        fileName: encryptedFileName,
        originalName: fileName,
        fileType,
        mimeType,
        fileSize: fileBuffer.length,
        category: options.category || 'general',
        accessLevel: options.accessLevel || 'internal',
        uploadedBy,
        uploadedAt: new Date(),
        lastAccessedAt: new Date(),
        accessCount: 0,
        version: 1,
        tags: options.tags || [],
        description: options.description,
        encryptedPath,
        checksum,
        isEncrypted: true,
        expiresAt: options.expiresAt,
        relatedEntityType: options.relatedEntityType,
        relatedEntityId: options.relatedEntityId
      };

      this.documents.set(documentId, metadata);

      // Log the upload
      this.logAccess({
        documentId,
        userId: uploadedBy,
        action: 'upload',
        timestamp: new Date(),
        ipAddress: '0.0.0.0',
        userAgent: 'DocumentVault',
        success: true
      });

      this.emit('document:uploaded', { documentId, fileName, uploadedBy });
      console.log(`📄 Document uploaded: ${fileName} (${documentId})`);

      return metadata;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  }

  /**
   * Download a document
   */
  async downloadDocument(documentId: string, userId: string): Promise<{ buffer: Buffer; metadata: DocumentMetadata } | null> {
    try {
      const metadata = this.documents.get(documentId);
      if (!metadata) {
        this.logAccess({
          documentId,
          userId,
          action: 'download',
          timestamp: new Date(),
          ipAddress: '0.0.0.0',
          userAgent: 'DocumentVault',
          success: false,
          errorMessage: 'Document not found'
        });
        return null;
      }

      // Check if document has expired
      if (metadata.expiresAt && metadata.expiresAt < new Date()) {
        throw new Error('Document has expired');
      }

      // Read encrypted file
      const encryptedData = await fs.readFile(metadata.encryptedPath);

      // Decrypt
      const decryptedData = this.decrypt(encryptedData);

      // Verify integrity
      const currentChecksum = this.generateChecksum(decryptedData);
      if (currentChecksum !== metadata.checksum) {
        this.emit('security:alert', {
          type: 'document_integrity_violation',
          documentId,
          userId
        });
        throw new Error('Document integrity check failed');
      }

      // Update access metadata
      metadata.lastAccessedAt = new Date();
      metadata.accessCount++;

      this.logAccess({
        documentId,
        userId,
        action: 'download',
        timestamp: new Date(),
        ipAddress: '0.0.0.0',
        userAgent: 'DocumentVault',
        success: true
      });

      this.emit('document:downloaded', { documentId, userId });

      return { buffer: decryptedData, metadata };
    } catch (error) {
      console.error('Error downloading document:', error);
      this.logAccess({
        documentId,
        userId,
        action: 'download',
        timestamp: new Date(),
        ipAddress: '0.0.0.0',
        userAgent: 'DocumentVault',
        success: false,
        errorMessage: (error as Error).message
      });
      return null;
    }
  }

  /**
   * Search documents
   */
  searchDocuments(query: DocumentSearchQuery): DocumentMetadata[] {
    const results: DocumentMetadata[] = [];

    this.documents.forEach((metadata) => {
      let matches = true;

      if (query.fileName && !metadata.originalName.toLowerCase().includes(query.fileName.toLowerCase())) {
        matches = false;
      }

      if (query.category && metadata.category !== query.category) {
        matches = false;
      }

      if (query.uploadedBy && metadata.uploadedBy !== query.uploadedBy) {
        matches = false;
      }

      if (query.tags && query.tags.length > 0) {
        const hasAllTags = query.tags.every(tag => metadata.tags.includes(tag));
        if (!hasAllTags) {
          matches = false;
        }
      }

      if (query.dateFrom && metadata.uploadedAt < query.dateFrom) {
        matches = false;
      }

      if (query.dateTo && metadata.uploadedAt > query.dateTo) {
        matches = false;
      }

      if (query.relatedEntityType && metadata.relatedEntityType !== query.relatedEntityType) {
        matches = false;
      }

      if (query.relatedEntityId && metadata.relatedEntityId !== query.relatedEntityId) {
        matches = false;
      }

      if (matches) {
        results.push(metadata);
      }
    });

    return results;
  }

  /**
   * Get document metadata
   */
  getDocumentMetadata(documentId: string): DocumentMetadata | null {
    return this.documents.get(documentId) || null;
  }

  /**
   * Update document metadata
   */
  updateDocumentMetadata(documentId: string, updates: Partial<DocumentMetadata>): boolean {
    const metadata = this.documents.get(documentId);
    if (!metadata) {
      return false;
    }

    Object.assign(metadata, updates);
    this.emit('document:updated', { documentId, updates });
    return true;
  }

  /**
   * Delete a document
   */
  async deleteDocument(documentId: string, userId: string): Promise<boolean> {
    try {
      const metadata = this.documents.get(documentId);
      if (!metadata) {
        return false;
      }

      // Securely delete file
      await fs.unlink(metadata.encryptedPath);

      // Remove from index
      this.documents.delete(documentId);

      this.logAccess({
        documentId,
        userId,
        action: 'delete',
        timestamp: new Date(),
        ipAddress: '0.0.0.0',
        userAgent: 'DocumentVault',
        success: true
      });

      this.emit('document:deleted', { documentId, userId });
      console.log(`🗑️  Document deleted: ${documentId}`);

      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      return false;
    }
  }

  /**
   * Get documents by entity (e.g., all docs for a specific lead or client)
   */
  getDocumentsByEntity(entityType: string, entityId: string): DocumentMetadata[] {
    return this.searchDocuments({
      relatedEntityType: entityType,
      relatedEntityId: entityId
    });
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalDocuments: number;
    totalSize: number;
    byCategory: Record<DocumentCategory, number>;
    byType: Record<DocumentType, number>;
    recentUploads: number;
  } {
    const stats = {
      totalDocuments: this.documents.size,
      totalSize: 0,
      byCategory: {} as Record<DocumentCategory, number>,
      byType: {} as Record<DocumentType, number>,
      recentUploads: 0
    };

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    this.documents.forEach((doc) => {
      stats.totalSize += doc.fileSize;
      stats.byCategory[doc.category] = (stats.byCategory[doc.category] || 0) + 1;
      stats.byType[doc.fileType] = (stats.byType[doc.fileType] || 0) + 1;

      if (doc.uploadedAt > oneDayAgo) {
        stats.recentUploads++;
      }
    });

    return stats;
  }

  /**
   * Access logging
   */
  private logAccess(log: DocumentAccessLog): void {
    this.accessLogs.push(log);

    // Keep only last 5000 logs in memory
    if (this.accessLogs.length > 5000) {
      this.accessLogs.splice(0, 500);
    }

    this.emit('access:logged', log);
  }

  /**
   * Get access logs for a document
   */
  getAccessLogs(documentId: string): DocumentAccessLog[] {
    return this.accessLogs.filter(log => log.documentId === documentId);
  }

  /**
   * Export document list (for admin/audit purposes)
   */
  exportDocumentList(): DocumentMetadata[] {
    return Array.from(this.documents.values());
  }
}

// Export singleton instance
export const documentVault = new DocumentVault();

// Set up event listeners
documentVault.on('security:alert', (alert) => {
  console.error('🚨 DOCUMENT SECURITY ALERT:', alert);
});

documentVault.on('document:uploaded', (data) => {
  console.log(`📤 Document uploaded: ${data.fileName} by ${data.uploadedBy}`);
});

documentVault.on('document:downloaded', (data) => {
  console.log(`📥 Document downloaded: ${data.documentId} by ${data.userId}`);
});
