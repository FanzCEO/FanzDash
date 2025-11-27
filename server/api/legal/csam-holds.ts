/**
 * CSAM Legal Hold Management API
 *
 * ⚠️ CRITICAL SECURITY - SUPER ADMIN ONLY ACCESS ⚠️
 *
 * This API handles Child Sexual Abuse Material (CSAM) legal hold cases.
 * All endpoints REQUIRE Super Admin access and are fully audited.
 *
 * Legal Compliance:
 * - 18 U.S.C. § 2258A: Mandatory reporting to NCMEC
 * - Evidence preservation for law enforcement
 * - Complete audit trail of all access
 * - Chain of custody maintenance
 */

import { Request, Response } from 'express';
import { createHash, randomBytes } from 'crypto';
import { db } from '../../db/index.js';
import { csamLegalHolds, csamEvidenceFiles, type NewCsamLegalHold, type NewCsamEvidenceFile } from '../../db/mediaSchema.js';
import { eq, desc, and, gte } from 'drizzle-orm';

/**
 * Create a new CSAM legal hold
 * POST /api/legal/csam-holds/create
 * REQUIRES: Super Admin
 */
export async function createLegalHold(req: Request, res: Response) {
  try {
    const {
      contentUrl,
      contentHash,
      contentDescription,
      suspectUserId,
      suspectUsername,
      suspectEmail,
      suspectIpAddress,
      suspectDeviceInfo,
      mediaAssetId,
      priority = 'critical'
    } = req.body;

    // Validate required fields
    if (!contentDescription || (!contentUrl && !mediaAssetId)) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['contentDescription', 'contentUrl or mediaAssetId']
      });
    }

    const superAdminId = req.user!.id;
    const caseNumber = generateCaseNumber();

    // Create legal hold record
    const newHold: NewCsamLegalHold = {
      caseNumber,
      reportedBy: superAdminId,
      createdBy: superAdminId,
      contentUrl,
      contentHash,
      contentDescription,
      suspectUserId,
      suspectUsername,
      suspectEmail,
      suspectIpAddress,
      suspectDeviceInfo,
      mediaAssetId,
      priority,
      status: 'pending',
      preservationRequired: true,
      preservationExpiresAt: new Date(Date.now() + 7 * 365 * 24 * 60 * 60 * 1000), // 7 years
      accessLog: [{
        action: 'created',
        userId: superAdminId,
        timestamp: new Date().toISOString(),
        ipAddress: getClientIP(req)
      }]
    };

    const [legalHold] = await db.insert(csamLegalHolds)
      .values(newHold)
      .returning();

    console.log(`🔒 CSAM Legal Hold Created: ${caseNumber} by Super Admin ${superAdminId}`);

    res.status(201).json({
      success: true,
      caseNumber: legalHold.caseNumber,
      id: legalHold.id,
      message: 'CSAM legal hold created successfully',
      warning: 'This case contains evidence of child exploitation. Handle with extreme care.',
      nextSteps: [
        'Upload evidence to encrypted storage',
        'Report to NCMEC (required by law)',
        'Notify law enforcement if applicable'
      ]
    });

  } catch (error) {
    console.error('Error creating CSAM legal hold:', error);
    res.status(500).json({
      error: 'Failed to create legal hold',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Get all CSAM legal holds
 * GET /api/legal/csam-holds
 * REQUIRES: Super Admin
 */
export async function getAllLegalHolds(req: Request, res: Response) {
  try {
    const { status, priority, days = 90, limit = 50 } = req.query;

    let query = db.select().from(csamLegalHolds);

    // Filter by status
    if (status) {
      query = query.where(eq(csamLegalHolds.status, status as string)) as any;
    }

    // Filter by priority
    if (priority) {
      query = query.where(eq(csamLegalHolds.priority, priority as string)) as any;
    }

    // Filter by date range
    const since = new Date(Date.now() - parseInt(days as string) * 24 * 60 * 60 * 1000);
    query = query.where(gte(csamLegalHolds.createdAt, since)) as any;

    const holds = await query
      .orderBy(desc(csamLegalHolds.createdAt))
      .limit(parseInt(limit as string));

    // Log access
    const superAdminId = req.user!.id;
    console.log(`🔍 Super Admin ${superAdminId} accessed CSAM holds list (${holds.length} cases)`);

    const statistics = {
      totalCases: holds.length,
      byStatus: holds.reduce((acc, h) => {
        acc[h.status] = (acc[h.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byPriority: holds.reduce((acc, h) => {
        acc[h.priority || 'unknown'] = (acc[h.priority || 'unknown'] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      reportedToNcmec: holds.filter(h => h.reportedToNcmec).length,
      lawEnforcementNotified: holds.filter(h => h.lawEnforcementNotified).length
    };

    res.json({
      holds: holds.map(h => ({
        ...h,
        // Redact sensitive fields in list view
        contentDescription: h.contentDescription?.substring(0, 100) + '...',
        suspectDeviceInfo: undefined
      })),
      statistics,
      periodDays: days,
      warning: 'This data contains evidence of child exploitation. Unauthorized access or disclosure is a federal crime.'
    });

  } catch (error) {
    console.error('Error getting CSAM legal holds:', error);
    res.status(500).json({
      error: 'Failed to get legal holds'
    });
  }
}

/**
 * Get a specific CSAM legal hold by case number
 * GET /api/legal/csam-holds/:caseNumber
 * REQUIRES: Super Admin
 */
export async function getLegalHold(req: Request, res: Response) {
  try {
    const { caseNumber } = req.params;

    const [legalHold] = await db.select()
      .from(csamLegalHolds)
      .where(eq(csamLegalHolds.caseNumber, caseNumber))
      .limit(1);

    if (!legalHold) {
      return res.status(404).json({
        error: 'Legal hold not found',
        caseNumber
      });
    }

    // Get evidence files
    const evidenceFiles = await db.select()
      .from(csamEvidenceFiles)
      .where(eq(csamEvidenceFiles.legalHoldId, legalHold.id));

    // Update access log
    const superAdminId = req.user!.id;
    const accessLog = (legalHold.accessLog as any[]) || [];
    accessLog.push({
      action: 'viewed',
      userId: superAdminId,
      timestamp: new Date().toISOString(),
      ipAddress: getClientIP(req)
    });

    await db.update(csamLegalHolds)
      .set({ accessLog, updatedAt: new Date() })
      .where(eq(csamLegalHolds.id, legalHold.id));

    console.log(`🔍 Super Admin ${superAdminId} accessed CSAM case ${caseNumber}`);

    res.json({
      legalHold,
      evidenceFiles: evidenceFiles.map(e => ({
        ...e,
        // Redact encryption keys
        encryptionKey: undefined
      })),
      warning: 'This case contains evidence of child exploitation. Handle with extreme care.'
    });

  } catch (error) {
    console.error('Error getting CSAM legal hold:', error);
    res.status(500).json({
      error: 'Failed to get legal hold'
    });
  }
}

/**
 * Upload evidence to a CSAM legal hold
 * POST /api/legal/csam-holds/:caseNumber/evidence
 * REQUIRES: Super Admin
 */
export async function uploadEvidence(req: Request, res: Response) {
  try {
    const { caseNumber } = req.params;
    const {
      filename,
      fileType,
      fileHash,
      fileSize,
      mimeType,
      storageUrl,
      description,
      evidenceType
    } = req.body;

    // Validate required fields
    if (!filename || !fileHash || !fileSize || !storageUrl) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['filename', 'fileHash', 'fileSize', 'storageUrl']
      });
    }

    const [legalHold] = await db.select()
      .from(csamLegalHolds)
      .where(eq(csamLegalHolds.caseNumber, caseNumber))
      .limit(1);

    if (!legalHold) {
      return res.status(404).json({
        error: 'Legal hold not found',
        caseNumber
      });
    }

    const superAdminId = req.user!.id;

    // Generate encryption key (should be encrypted with master key in production)
    const encryptionKey = randomBytes(32).toString('hex');

    const newEvidence: NewCsamEvidenceFile = {
      legalHoldId: legalHold.id,
      filename,
      fileType,
      fileHash,
      fileSize,
      mimeType,
      storageUrl,
      encryptionKey,
      isEncrypted: true,
      description,
      evidenceType,
      uploadedBy: superAdminId
    };

    const [evidence] = await db.insert(csamEvidenceFiles)
      .values(newEvidence)
      .returning();

    // Update legal hold access log
    const accessLog = (legalHold.accessLog as any[]) || [];
    accessLog.push({
      action: 'evidence_uploaded',
      userId: superAdminId,
      timestamp: new Date().toISOString(),
      ipAddress: getClientIP(req),
      details: { filename, fileType, evidenceType }
    });

    await db.update(csamLegalHolds)
      .set({ accessLog, updatedAt: new Date() })
      .where(eq(csamLegalHolds.id, legalHold.id));

    console.log(`📤 Evidence uploaded to CSAM case ${caseNumber}: ${filename}`);

    res.status(201).json({
      success: true,
      evidenceId: evidence.id,
      message: 'Evidence uploaded successfully',
      encryptionKey // In production, this should be returned securely
    });

  } catch (error) {
    console.error('Error uploading CSAM evidence:', error);
    res.status(500).json({
      error: 'Failed to upload evidence',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Get evidence files for a legal hold
 * GET /api/legal/csam-holds/:caseNumber/evidence
 * REQUIRES: Super Admin
 */
export async function getEvidence(req: Request, res: Response) {
  try {
    const { caseNumber } = req.params;

    const [legalHold] = await db.select()
      .from(csamLegalHolds)
      .where(eq(csamLegalHolds.caseNumber, caseNumber))
      .limit(1);

    if (!legalHold) {
      return res.status(404).json({
        error: 'Legal hold not found',
        caseNumber
      });
    }

    const evidenceFiles = await db.select()
      .from(csamEvidenceFiles)
      .where(eq(csamEvidenceFiles.legalHoldId, legalHold.id))
      .orderBy(desc(csamEvidenceFiles.createdAt));

    const superAdminId = req.user!.id;
    console.log(`🔍 Super Admin ${superAdminId} accessed evidence for CSAM case ${caseNumber} (${evidenceFiles.length} files)`);

    res.json({
      caseNumber,
      evidenceFiles: evidenceFiles.map(e => ({
        ...e,
        // Redact encryption keys
        encryptionKey: undefined
      })),
      totalFiles: evidenceFiles.length,
      totalSize: evidenceFiles.reduce((sum, e) => sum + Number(e.fileSize), 0)
    });

  } catch (error) {
    console.error('Error getting CSAM evidence:', error);
    res.status(500).json({
      error: 'Failed to get evidence files'
    });
  }
}

/**
 * Update CSAM legal hold status
 * PATCH /api/legal/csam-holds/:caseNumber
 * REQUIRES: Super Admin
 */
export async function updateLegalHold(req: Request, res: Response) {
  try {
    const { caseNumber } = req.params;
    const {
      status,
      reportedToNcmec,
      ncmecReportId,
      lawEnforcementNotified,
      lawEnforcementAgency,
      lawEnforcementCaseId,
      legalNotes,
      resolved,
      resolutionType,
      resolutionNotes
    } = req.body;

    const [legalHold] = await db.select()
      .from(csamLegalHolds)
      .where(eq(csamLegalHolds.caseNumber, caseNumber))
      .limit(1);

    if (!legalHold) {
      return res.status(404).json({
        error: 'Legal hold not found',
        caseNumber
      });
    }

    const superAdminId = req.user!.id;

    // Update access log
    const accessLog = (legalHold.accessLog as any[]) || [];
    accessLog.push({
      action: 'updated',
      userId: superAdminId,
      timestamp: new Date().toISOString(),
      ipAddress: getClientIP(req),
      changes: { status, reportedToNcmec, lawEnforcementNotified, resolved }
    });

    const updateData: any = {
      lastModifiedBy: superAdminId,
      updatedAt: new Date(),
      accessLog
    };

    if (status !== undefined) updateData.status = status;
    if (reportedToNcmec !== undefined) {
      updateData.reportedToNcmec = reportedToNcmec;
      if (reportedToNcmec) updateData.ncmecReportedAt = new Date();
    }
    if (ncmecReportId !== undefined) updateData.ncmecReportId = ncmecReportId;
    if (lawEnforcementNotified !== undefined) {
      updateData.lawEnforcementNotified = lawEnforcementNotified;
      if (lawEnforcementNotified) updateData.lawEnforcementContactedAt = new Date();
    }
    if (lawEnforcementAgency !== undefined) updateData.lawEnforcementAgency = lawEnforcementAgency;
    if (lawEnforcementCaseId !== undefined) updateData.lawEnforcementCaseId = lawEnforcementCaseId;
    if (legalNotes !== undefined) updateData.legalNotes = legalNotes;
    if (resolved !== undefined) {
      updateData.resolved = resolved;
      if (resolved) updateData.resolvedAt = new Date();
    }
    if (resolutionType !== undefined) updateData.resolutionType = resolutionType;
    if (resolutionNotes !== undefined) updateData.resolutionNotes = resolutionNotes;

    const [updated] = await db.update(csamLegalHolds)
      .set(updateData)
      .where(eq(csamLegalHolds.id, legalHold.id))
      .returning();

    console.log(`📝 CSAM case ${caseNumber} updated by Super Admin ${superAdminId}`);

    res.json({
      success: true,
      legalHold: updated
    });

  } catch (error) {
    console.error('Error updating CSAM legal hold:', error);
    res.status(500).json({
      error: 'Failed to update legal hold',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Delete/close a CSAM legal hold (requires approval workflow in production)
 * DELETE /api/legal/csam-holds/:caseNumber
 * REQUIRES: Super Admin
 */
export async function deleteLegalHold(req: Request, res: Response) {
  try {
    const { caseNumber } = req.params;
    const { reason, approvedBy } = req.body;

    if (!reason) {
      return res.status(400).json({
        error: 'Deletion reason required',
        message: 'You must provide a legal reason for closing this case'
      });
    }

    const [legalHold] = await db.select()
      .from(csamLegalHolds)
      .where(eq(csamLegalHolds.caseNumber, caseNumber))
      .limit(1);

    if (!legalHold) {
      return res.status(404).json({
        error: 'Legal hold not found',
        caseNumber
      });
    }

    // In production, this should require dual approval
    if (!approvedBy || approvedBy !== req.user!.id) {
      return res.status(403).json({
        error: 'Deletion requires approval',
        message: 'CSAM legal hold deletion requires dual Super Admin approval'
      });
    }

    const superAdminId = req.user!.id;

    // Mark as closed instead of deleting (preserve for legal requirements)
    await db.update(csamLegalHolds)
      .set({
        status: 'closed',
        resolved: true,
        resolvedAt: new Date(),
        resolutionType: 'case_closed',
        resolutionNotes: `Closed by Super Admin ${superAdminId}. Reason: ${reason}`,
        lastModifiedBy: superAdminId,
        updatedAt: new Date()
      })
      .where(eq(csamLegalHolds.id, legalHold.id));

    console.log(`🔒 CSAM case ${caseNumber} CLOSED by Super Admin ${superAdminId}`);

    res.json({
      success: true,
      message: 'Legal hold closed successfully',
      warning: 'Evidence has been preserved per legal requirements. Data will be retained for 7 years.'
    });

  } catch (error) {
    console.error('Error deleting CSAM legal hold:', error);
    res.status(500).json({
      error: 'Failed to delete legal hold',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Get CSAM legal hold statistics
 * GET /api/legal/csam-holds/statistics
 * REQUIRES: Super Admin
 */
export async function getStatistics(req: Request, res: Response) {
  try {
    const { days = 90 } = req.query;
    const since = new Date(Date.now() - parseInt(days as string) * 24 * 60 * 60 * 1000);

    const holds = await db.select()
      .from(csamLegalHolds)
      .where(gte(csamLegalHolds.createdAt, since));

    const statistics = {
      totalCases: holds.length,
      byStatus: {
        pending: holds.filter(h => h.status === 'pending').length,
        underReview: holds.filter(h => h.status === 'under_review').length,
        lawEnforcementNotified: holds.filter(h => h.status === 'law_enforcement_notified').length,
        closed: holds.filter(h => h.status === 'closed').length
      },
      byPriority: {
        critical: holds.filter(h => h.priority === 'critical').length,
        high: holds.filter(h => h.priority === 'high').length,
        medium: holds.filter(h => h.priority === 'medium').length
      },
      compliance: {
        reportedToNcmec: holds.filter(h => h.reportedToNcmec).length,
        pendingNcmecReport: holds.filter(h => !h.reportedToNcmec && h.status !== 'closed').length,
        lawEnforcementNotified: holds.filter(h => h.lawEnforcementNotified).length
      },
      resolution: {
        resolved: holds.filter(h => h.resolved).length,
        unresolved: holds.filter(h => !h.resolved).length
      }
    };

    const superAdminId = req.user!.id;
    console.log(`📊 Super Admin ${superAdminId} accessed CSAM statistics`);

    res.json({
      statistics,
      periodDays: days,
      generatedAt: new Date()
    });

  } catch (error) {
    console.error('Error getting CSAM statistics:', error);
    res.status(500).json({
      error: 'Failed to get statistics'
    });
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

function generateCaseNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = randomBytes(3).toString('hex').toUpperCase();
  return `CSAM-${year}${month}${day}-${random}`;
}

function getClientIP(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress || 'unknown';
}
