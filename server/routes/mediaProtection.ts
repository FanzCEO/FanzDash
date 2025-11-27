/**
 * Media Protection Routes
 *
 * Complete API routing for:
 * - Chunked upload pipeline
 * - DMCA takedown management
 * - Screen capture violation tracking
 * - Mobile device registration
 * - Forensic watermark management
 */

import express from 'express';
import multer from 'multer';
import rateLimit from 'express-rate-limit';
import { createSecureUploadMiddleware } from '../middleware/fileScanningMiddleware';

// Upload API
import * as uploadAPI from '../api/media/upload.js';

// DMCA API
import * as dmcaAPI from '../api/media/dmca.js';

// Violations API
import * as violationsAPI from '../api/media/violations.js';

// Mobile Device API
import * as deviceAPI from '../api/mobile/device-registration.js';

const router = express.Router();

// Configure secure upload with virus scanning for chunk uploads
const upload = createSecureUploadMiddleware({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per chunk
  }
});

// Rate limiters
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: { error: 'Too many upload requests. Please try again later.' }
});

const dmcaLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50,
  message: { error: 'Too many DMCA requests. Please try again later.' }
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Rate limit exceeded.' }
});

// ============================================================================
// Upload Pipeline Routes
// ============================================================================

// Initialize chunked upload session
router.post('/upload/initialize', uploadLimiter, uploadAPI.initializeUpload);

// Upload a single chunk
router.post('/upload/chunk', upload.single('chunk'), uploadLimiter, uploadAPI.uploadChunk);

// Upload multiple chunks in batch
router.post('/upload/batch', uploadLimiter, uploadAPI.uploadChunksBatch);

// Complete upload and trigger transcoding
router.post('/upload/complete', uploadLimiter, uploadAPI.completeUpload);

// Get upload progress
router.get('/upload/:uploadId/progress', generalLimiter, uploadAPI.getUploadProgress);

// Cancel upload
router.delete('/upload/:uploadId', generalLimiter, uploadAPI.cancelUpload);

// ============================================================================
// DMCA Takedown Routes
// ============================================================================

// Scan all platforms for stolen content
router.post('/dmca/scan', dmcaLimiter, dmcaAPI.scanPlatforms);

// Scan specific platform
router.post('/dmca/scan/:platform', dmcaLimiter, dmcaAPI.scanSinglePlatform);

// Get all DMCA cases
router.get('/dmca/cases', generalLimiter, dmcaAPI.getDMCACases);

// Get specific DMCA case
router.get('/dmca/cases/:caseNumber', generalLimiter, dmcaAPI.getDMCACase);

// Submit takedown request
router.post('/dmca/submit/:caseNumber', dmcaLimiter, dmcaAPI.submitTakedown);

// Update DMCA case status
router.patch('/dmca/cases/:caseNumber', dmcaLimiter, dmcaAPI.updateDMCACase);

// Get DMCA statistics
router.get('/dmca/statistics', generalLimiter, dmcaAPI.getDMCAStatistics);

// ============================================================================
// Violation Tracking Routes
// ============================================================================

// Log screen capture violation
router.post('/violations/log', generalLimiter, violationsAPI.logViolation);

// Get violation history for user
router.get('/violations/user/:userId', generalLimiter, violationsAPI.getViolationHistory);

// Get violation statistics (admin)
router.get('/violations/statistics', generalLimiter, violationsAPI.getViolationStatistics);

// ============================================================================
// Mobile Device Registration Routes
// ============================================================================

// Register new mobile device
router.post('/mobile/register', generalLimiter, deviceAPI.registerDevice);

// Get device status
router.get('/mobile/device/:deviceId/status', generalLimiter, deviceAPI.getDeviceStatus);

// Update monitoring consent
router.patch('/mobile/device/:deviceId/consent', generalLimiter, deviceAPI.updateMonitoringConsent);

// Report jailbreak detection
router.post('/mobile/device/:deviceId/jailbreak', generalLimiter, deviceAPI.reportJailbreakDetection);

// Device heartbeat
router.post('/mobile/device/:deviceId/heartbeat', generalLimiter, deviceAPI.deviceHeartbeat);

// Get all devices for user
router.get('/mobile/user/:userId/devices', generalLimiter, deviceAPI.getUserDevices);

// Deactivate device
router.delete('/mobile/device/:deviceId', generalLimiter, deviceAPI.deactivateDevice);

// Get monitoring consent text
router.get('/mobile/consent-text', deviceAPI.getMonitoringConsentText);

export default router;
