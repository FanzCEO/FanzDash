/**
 * Legal & Compliance Routes
 *
 * ⚠️ ALL ROUTES IN THIS FILE REQUIRE SUPER ADMIN ACCESS ⚠️
 *
 * Handles:
 * - CSAM legal holds
 * - Evidence management
 * - Law enforcement collaboration
 * - Compliance reporting
 */

import { Router } from 'express';
import { isAuthenticated, requireSuperAdmin } from '../middleware/auth.js';
import {
  createLegalHold,
  getAllLegalHolds,
  getLegalHold,
  uploadEvidence,
  getEvidence,
  updateLegalHold,
  deleteLegalHold,
  getStatistics
} from '../api/legal/csam-holds.js';

const router = Router();

// ============================================================================
// CSAM LEGAL HOLDS - ALL REQUIRE SUPER ADMIN
// ============================================================================

/**
 * Create new CSAM legal hold
 * POST /api/legal/csam-holds/create
 */
router.post(
  '/csam-holds/create',
  isAuthenticated,
  requireSuperAdmin,
  createLegalHold
);

/**
 * Get all CSAM legal holds
 * GET /api/legal/csam-holds
 */
router.get(
  '/csam-holds',
  isAuthenticated,
  requireSuperAdmin,
  getAllLegalHolds
);

/**
 * Get CSAM statistics
 * GET /api/legal/csam-holds/statistics
 */
router.get(
  '/csam-holds/statistics',
  isAuthenticated,
  requireSuperAdmin,
  getStatistics
);

/**
 * Get specific CSAM legal hold
 * GET /api/legal/csam-holds/:caseNumber
 */
router.get(
  '/csam-holds/:caseNumber',
  isAuthenticated,
  requireSuperAdmin,
  getLegalHold
);

/**
 * Upload evidence to legal hold
 * POST /api/legal/csam-holds/:caseNumber/evidence
 */
router.post(
  '/csam-holds/:caseNumber/evidence',
  isAuthenticated,
  requireSuperAdmin,
  uploadEvidence
);

/**
 * Get evidence for legal hold
 * GET /api/legal/csam-holds/:caseNumber/evidence
 */
router.get(
  '/csam-holds/:caseNumber/evidence',
  isAuthenticated,
  requireSuperAdmin,
  getEvidence
);

/**
 * Update CSAM legal hold
 * PATCH /api/legal/csam-holds/:caseNumber
 */
router.patch(
  '/csam-holds/:caseNumber',
  isAuthenticated,
  requireSuperAdmin,
  updateLegalHold
);

/**
 * Close/delete CSAM legal hold
 * DELETE /api/legal/csam-holds/:caseNumber
 */
router.delete(
  '/csam-holds/:caseNumber',
  isAuthenticated,
  requireSuperAdmin,
  deleteLegalHold
);

export default router;
