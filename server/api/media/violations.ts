/**
 * Screen Capture Violation Logging API
 *
 * Logs all screenshot and screen recording attempts
 * Tracks repeat offenders and enforces progressive penalties
 */

import { Request, Response } from 'express';
import { db } from "../../db/index.js";
import { screenCaptureViolations, mobileDeviceRegistrations, type NewScreenCaptureViolation } from '../../db/mediaSchema.js';
import { eq, and, gte, desc } from 'drizzle-orm';

/**
 * Log a screen capture violation attempt
 */
export async function logViolation(req: Request, res: Response) {
  try {
    const {
      userId,
      sessionId,
      platformId,
      mediaAssetId,
      violationType,
      detectedAt,
      userAgent,
      deviceType
    } = req.body;

    if (!userId || !sessionId || !platformId || !violationType) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['userId', 'sessionId', 'platformId', 'violationType']
      });
    }

    // Get client IP
    const ipAddress = (req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || '').split(',')[0];

    // Check for repeat offender (within last 24 hours)
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentViolations = await db.select()
      .from(screenCaptureViolations)
      .where(
        and(
          eq(screenCaptureViolations.userId, userId),
          gte(screenCaptureViolations.detectedAt, last24Hours)
        )
      )
      .orderBy(desc(screenCaptureViolations.detectedAt));

    const isRepeatOffender = recentViolations.length > 0;
    const previousViolationCount = recentViolations.length;

    // Determine action to take
    let actionTaken = 'warning_shown';
    let warningDisplayed = true;
    let sessionTerminated = false;
    let accountSuspended = false;
    let blankScreenServed = true;

    if (previousViolationCount >= 5) {
      // 5+ violations = suspend account
      actionTaken = 'account_suspended';
      accountSuspended = true;
      sessionTerminated = true;
    } else if (previousViolationCount >= 3) {
      // 3-4 violations = terminate session
      actionTaken = 'session_terminated';
      sessionTerminated = true;
    }

    // Log the violation
    const newViolation: NewScreenCaptureViolation = {
      userId,
      sessionId,
      platformId,
      violationType,
      mediaAssetId: mediaAssetId || null,
      contentUrl: req.headers.referer || null,
      detectedAt: new Date(detectedAt || Date.now()),
      detectionMethod: 'browser_javascript',
      deviceType: deviceType || 'unknown',
      operatingSystem: detectOS(userAgent),
      browser: detectBrowser(userAgent),
      deviceFingerprint: null,
      ipAddress,
      geolocation: null,
      actionTaken,
      warningDisplayed,
      sessionTerminated,
      accountSuspended,
      screenshotPrevented: true,
      blankScreenServed,
      violationScreenshotUrl: null,
      isRepeatOffender,
      previousViolationCount
    };

    const [violation] = await db.insert(screenCaptureViolations)
      .values(newViolation)
      .returning();

    // If device is mobile, update device registration
    if (deviceType === 'mobile') {
      await updateMobileDeviceViolation(userId, accountSuspended);
    }

    console.log(`🚨 Violation logged: ${violationType} by user ${userId} (${previousViolationCount + 1} violations)`);

    res.json({
      success: true,
      violationId: violation.id,
      actionTaken,
      isRepeatOffender,
      totalViolations: previousViolationCount + 1,
      consequences: {
        warningDisplayed,
        sessionTerminated,
        accountSuspended
      },
      message: getViolationMessage(previousViolationCount + 1, accountSuspended, sessionTerminated)
    });

  } catch (error) {
    console.error('Error logging violation:', error);
    res.status(500).json({
      error: 'Failed to log violation',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Get violation history for a user
 */
export async function getViolationHistory(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const { limit = 50, days = 30 } = req.query;

    const since = new Date(Date.now() - parseInt(days as string) * 24 * 60 * 60 * 1000);

    const violations = await db.select()
      .from(screenCaptureViolations)
      .where(
        and(
          eq(screenCaptureViolations.userId, userId),
          gte(screenCaptureViolations.detectedAt, since)
        )
      )
      .orderBy(desc(screenCaptureViolations.detectedAt))
      .limit(parseInt(limit as string));

    const statistics = {
      totalViolations: violations.length,
      violationTypes: violations.reduce((acc, v) => {
        acc[v.violationType] = (acc[v.violationType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      sessionsTerminated: violations.filter(v => v.sessionTerminated).length,
      accountSuspensions: violations.filter(v => v.accountSuspended).length,
      mostRecentViolation: violations[0]?.detectedAt || null
    };

    res.json({
      userId,
      violations,
      statistics,
      periodDays: days
    });

  } catch (error) {
    console.error('Error getting violation history:', error);
    res.status(500).json({
      error: 'Failed to get violation history'
    });
  }
}

/**
 * Get violation statistics for admin dashboard
 */
export async function getViolationStatistics(req: Request, res: Response) {
  try {
    const { days = 30 } = req.query;
    const since = new Date(Date.now() - parseInt(days as string) * 24 * 60 * 60 * 1000);

    const allViolations = await db.select()
      .from(screenCaptureViolations)
      .where(gte(screenCaptureViolations.detectedAt, since));

    const statistics = {
      totalViolations: allViolations.length,
      uniqueUsers: new Set(allViolations.map(v => v.userId)).size,
      violationTypes: allViolations.reduce((acc, v) => {
        acc[v.violationType] = (acc[v.violationType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      platforms: allViolations.reduce((acc, v) => {
        acc[v.platformId] = (acc[v.platformId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      actionstak: {
        warningsShown: allViolations.filter(v => v.warningDisplayed).length,
        sessionsTerminated: allViolations.filter(v => v.sessionTerminated).length,
        accountsSuspended: allViolations.filter(v => v.accountSuspended).length
      },
      repeatOffenders: allViolations.filter(v => v.isRepeatOffender).length,
      topOffenders: getTopOffenders(allViolations, 10)
    };

    res.json({
      periodDays: days,
      statistics,
      generatedAt: new Date()
    });

  } catch (error) {
    console.error('Error getting violation statistics:', error);
    res.status(500).json({
      error: 'Failed to get violation statistics'
    });
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

async function updateMobileDeviceViolation(userId: string, suspend: boolean) {
  try {
    const devices = await db.select()
      .from(mobileDeviceRegistrations)
      .where(eq(mobileDeviceRegistrations.userId, userId));

    for (const device of devices) {
      await db.update(mobileDeviceRegistrations)
        .set({
          violationCount: (device.violationCount || 0) + 1,
          lastViolationAt: new Date(),
          isSuspended: suspend ? true : device.isSuspended,
          suspendedUntil: suspend ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : device.suspendedUntil, // 7 days
          updatedAt: new Date()
        })
        .where(eq(mobileDeviceRegistrations.id, device.id));
    }
  } catch (error) {
    console.error('Error updating mobile device violation:', error);
  }
}

function detectOS(userAgent: string): string {
  if (/Windows NT 10.0/.test(userAgent)) return 'Windows 10';
  if (/Windows NT/.test(userAgent)) return 'Windows';
  if (/Mac OS X/.test(userAgent)) return 'macOS';
  if (/Android/.test(userAgent)) return 'Android';
  if (/iPhone|iPad/.test(userAgent)) return 'iOS';
  if (/Linux/.test(userAgent)) return 'Linux';
  return 'Unknown';
}

function detectBrowser(userAgent: string): string {
  if (/Edg\//.test(userAgent)) return 'Edge';
  if (/Chrome\//.test(userAgent)) return 'Chrome';
  if (/Safari\//.test(userAgent) && !/Chrome/.test(userAgent)) return 'Safari';
  if (/Firefox\//.test(userAgent)) return 'Firefox';
  if (/MSIE|Trident/.test(userAgent)) return 'Internet Explorer';
  return 'Unknown';
}

function getViolationMessage(violationCount: number, suspended: boolean, terminated: boolean): string {
  if (suspended) {
    return 'Your account has been suspended due to repeated violations of our Terms of Service. ' +
           'Screenshot and screen recording of protected content is strictly prohibited.';
  }

  if (terminated) {
    return 'Your session has been terminated due to repeated screenshot attempts. ' +
           'One more violation will result in account suspension.';
  }

  if (violationCount >= 3) {
    return 'Warning: You have ' + violationCount + ' violations. ' +
           'One more attempt will result in session termination.';
  }

  return 'Screenshot attempt detected and prevented. ' +
         'Continued violations may result in account termination.';
}

function getTopOffenders(violations: any[], limit: number) {
  const userViolations = violations.reduce((acc, v) => {
    if (!acc[v.userId]) {
      acc[v.userId] = {
        userId: v.userId,
        count: 0,
        lastViolation: v.detectedAt
      };
    }
    acc[v.userId].count++;
    if (new Date(v.detectedAt) > new Date(acc[v.userId].lastViolation)) {
      acc[v.userId].lastViolation = v.detectedAt;
    }
    return acc;
  }, {} as Record<string, any>);

  return Object.values(userViolations)
    .sort((a: any, b: any) => b.count - a.count)
    .slice(0, limit);
}
