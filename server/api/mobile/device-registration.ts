/**
 * FanzMobile Device Registration & Monitoring API
 *
 * Handles mobile device registration, consent management, and screen capture protection
 * Integrates with the overall media protection system
 */

import { Request, Response } from 'express';
import { createHash } from 'crypto';
import { db } from "../../db/index.js";
import { mobileDeviceRegistrations, type NewMobileDeviceRegistration } from '../../db/mediaSchema.js';
import { eq, and } from 'drizzle-orm';

/**
 * Register a new mobile device
 * Requires user consent for monitoring
 */
export async function registerDevice(req: Request, res: Response) {
  try {
    const {
      userId,
      deviceId,
      deviceName,
      deviceType, // 'ios' or 'android'
      deviceModel,
      osVersion,
      appVersion,
      pushToken,
      monitoringConsent,
      privacyPolicyVersion,
      tosVersion
    } = req.body;

    // Validate required fields
    if (!userId || !deviceId || !deviceType || !monitoringConsent) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['userId', 'deviceId', 'deviceType', 'monitoringConsent']
      });
    }

    // User must consent to monitoring
    if (!monitoringConsent) {
      return res.status(403).json({
        error: 'Device monitoring consent is required',
        message: 'You must accept device monitoring to use FanzMobile. ' +
                 'This is required to protect creator content and prevent unauthorized distribution.'
      });
    }

    // Generate device fingerprint
    const deviceFingerprint = generateDeviceFingerprint({
      deviceId,
      deviceModel,
      osVersion,
      userId
    });

    // Check if device already registered
    const existingDevice = await db.select()
      .from(mobileDeviceRegistrations)
      .where(
        and(
          eq(mobileDeviceRegistrations.userId, userId),
          eq(mobileDeviceRegistrations.deviceId, deviceId)
        )
      )
      .limit(1);

    let device;

    if (existingDevice.length > 0) {
      // Update existing device
      const [updated] = await db.update(mobileDeviceRegistrations)
        .set({
          deviceName,
          deviceModel,
          osVersion,
          appVersion,
          pushToken,
          pushEnabled: !!pushToken,
          monitoringConsentGiven: true,
          monitoringConsentDate: new Date(),
          privacyPolicyVersion,
          tosVersion,
          isActive: true,
          lastActiveAt: new Date(),
          lastIpAddress: getClientIP(req),
          updatedAt: new Date()
        })
        .where(eq(mobileDeviceRegistrations.id, existingDevice[0].id))
        .returning();

      device = updated;

      console.log(`📱 Device updated: ${deviceId} for user ${userId}`);

    } else {
      // Register new device
      const newDevice: NewMobileDeviceRegistration = {
        userId,
        deviceId,
        deviceName: deviceName || `${deviceType} Device`,
        deviceType,
        deviceModel,
        osVersion,
        appVersion,
        pushToken,
        pushEnabled: !!pushToken,
        deviceFingerprint,
        jailbrokenRooted: false, // Will be detected by client
        screenCaptureBlocked: true,
        monitoringConsentGiven: true,
        monitoringConsentDate: new Date(),
        privacyPolicyVersion,
        tosVersion,
        isActive: true,
        lastActiveAt: new Date(),
        lastIpAddress: getClientIP(req)
      };

      const [created] = await db.insert(mobileDeviceRegistrations)
        .values(newDevice)
        .returning();

      device = created;

      console.log(`📱 New device registered: ${deviceId} for user ${userId}`);
    }

    res.json({
      success: true,
      deviceId: device.id,
      message: 'Device registered successfully',
      monitoringEnabled: true,
      screenCaptureProtection: {
        enabled: device.screenCaptureBlocked,
        violationTracking: true,
        progressiveEnforcement: true
      },
      consentRecorded: {
        monitoringConsent: device.monitoringConsentGiven,
        consentDate: device.monitoringConsentDate,
        privacyPolicyVersion: device.privacyPolicyVersion,
        tosVersion: device.tosVersion
      }
    });

  } catch (error) {
    console.error('Error registering device:', error);
    res.status(500).json({
      error: 'Failed to register device',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Get device status and monitoring information
 */
export async function getDeviceStatus(req: Request, res: Response) {
  try {
    const { deviceId } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const [device] = await db.select()
      .from(mobileDeviceRegistrations)
      .where(
        and(
          eq(mobileDeviceRegistrations.deviceId, deviceId),
          eq(mobileDeviceRegistrations.userId, userId as string)
        )
      )
      .limit(1);

    if (!device) {
      return res.status(404).json({
        error: 'Device not found',
        message: 'This device is not registered. Please register first.'
      });
    }

    // Check if device is suspended
    const isSuspended = device.isSuspended &&
                       (!device.suspendedUntil || device.suspendedUntil > new Date());

    res.json({
      deviceId: device.id,
      deviceName: device.deviceName,
      deviceType: device.deviceType,
      isActive: device.isActive,
      isSuspended,
      suspendedUntil: device.suspendedUntil,
      violations: {
        totalViolations: device.violationCount || 0,
        lastViolation: device.lastViolationAt,
        warningThreshold: 3,
        suspensionThreshold: 5
      },
      monitoring: {
        consentGiven: device.monitoringConsentGiven,
        consentDate: device.monitoringConsentDate,
        screenCaptureBlocked: device.screenCaptureBlocked,
        jailbrokenDetection: device.jailbrokenRooted
      },
      lastActive: device.lastActiveAt,
      registeredAt: device.registeredAt
    });

  } catch (error) {
    console.error('Error getting device status:', error);
    res.status(500).json({
      error: 'Failed to get device status'
    });
  }
}

/**
 * Update device monitoring consent
 */
export async function updateMonitoringConsent(req: Request, res: Response) {
  try {
    const { deviceId } = req.params;
    const { userId, consentGiven, privacyPolicyVersion, tosVersion } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const [device] = await db.select()
      .from(mobileDeviceRegistrations)
      .where(
        and(
          eq(mobileDeviceRegistrations.deviceId, deviceId),
          eq(mobileDeviceRegistrations.userId, userId)
        )
      )
      .limit(1);

    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    // If revoking consent, deactivate device
    const [updated] = await db.update(mobileDeviceRegistrations)
      .set({
        monitoringConsentGiven: consentGiven,
        monitoringConsentDate: new Date(),
        privacyPolicyVersion,
        tosVersion,
        isActive: consentGiven, // Deactivate if consent revoked
        updatedAt: new Date()
      })
      .where(eq(mobileDeviceRegistrations.id, device.id))
      .returning();

    if (!consentGiven) {
      return res.json({
        success: true,
        message: 'Monitoring consent revoked. Device has been deactivated.',
        deviceActive: false,
        warning: 'You will not be able to access protected content until you re-consent to monitoring.'
      });
    }

    res.json({
      success: true,
      message: 'Monitoring consent updated',
      consentGiven: updated.monitoringConsentGiven,
      consentDate: updated.monitoringConsentDate
    });

  } catch (error) {
    console.error('Error updating monitoring consent:', error);
    res.status(500).json({
      error: 'Failed to update monitoring consent'
    });
  }
}

/**
 * Report jailbreak/root detection
 */
export async function reportJailbreakDetection(req: Request, res: Response) {
  try {
    const { deviceId } = req.params;
    const { userId, detected, detectionMethod } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const [device] = await db.select()
      .from(mobileDeviceRegistrations)
      .where(
        and(
          eq(mobileDeviceRegistrations.deviceId, deviceId),
          eq(mobileDeviceRegistrations.userId, userId)
        )
      )
      .limit(1);

    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    // Update jailbreak status
    const [updated] = await db.update(mobileDeviceRegistrations)
      .set({
        jailbrokenRooted: detected,
        // Optionally suspend device if jailbroken
        // isSuspended: detected,
        // suspendedUntil: detected ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null,
        updatedAt: new Date()
      })
      .where(eq(mobileDeviceRegistrations.id, device.id))
      .returning();

    console.log(`🔓 Jailbreak detection: ${deviceId} - ${detected ? 'DETECTED' : 'Clear'}`);

    res.json({
      success: true,
      jailbrokenDetected: detected,
      deviceStatus: updated.isSuspended ? 'suspended' : 'active',
      warning: detected
        ? 'Jailbroken/rooted devices have limited functionality and may be suspended for security violations.'
        : null
    });

  } catch (error) {
    console.error('Error reporting jailbreak detection:', error);
    res.status(500).json({
      error: 'Failed to report jailbreak detection'
    });
  }
}

/**
 * Heartbeat - Update device last active time
 */
export async function deviceHeartbeat(req: Request, res: Response) {
  try {
    const { deviceId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const [device] = await db.select()
      .from(mobileDeviceRegistrations)
      .where(
        and(
          eq(mobileDeviceRegistrations.deviceId, deviceId),
          eq(mobileDeviceRegistrations.userId, userId)
        )
      )
      .limit(1);

    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    await db.update(mobileDeviceRegistrations)
      .set({
        lastActiveAt: new Date(),
        lastIpAddress: getClientIP(req),
        updatedAt: new Date()
      })
      .where(eq(mobileDeviceRegistrations.id, device.id));

    res.json({
      success: true,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Error updating device heartbeat:', error);
    res.status(500).json({
      error: 'Failed to update device heartbeat'
    });
  }
}

/**
 * Get all devices for a user
 */
export async function getUserDevices(req: Request, res: Response) {
  try {
    const { userId } = req.params;

    const devices = await db.select()
      .from(mobileDeviceRegistrations)
      .where(eq(mobileDeviceRegistrations.userId, userId));

    res.json({
      userId,
      totalDevices: devices.length,
      activeDevices: devices.filter(d => d.isActive).length,
      suspendedDevices: devices.filter(d => d.isSuspended).length,
      devices: devices.map(d => ({
        id: d.id,
        deviceId: d.deviceId,
        deviceName: d.deviceName,
        deviceType: d.deviceType,
        deviceModel: d.deviceModel,
        isActive: d.isActive,
        isSuspended: d.isSuspended,
        suspendedUntil: d.suspendedUntil,
        violationCount: d.violationCount || 0,
        lastViolation: d.lastViolationAt,
        monitoringConsent: d.monitoringConsentGiven,
        jailbroken: d.jailbrokenRooted,
        lastActive: d.lastActiveAt,
        registeredAt: d.registeredAt
      }))
    });

  } catch (error) {
    console.error('Error getting user devices:', error);
    res.status(500).json({
      error: 'Failed to get user devices'
    });
  }
}

/**
 * Deactivate/remove a device
 */
export async function deactivateDevice(req: Request, res: Response) {
  try {
    const { deviceId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const [device] = await db.select()
      .from(mobileDeviceRegistrations)
      .where(
        and(
          eq(mobileDeviceRegistrations.deviceId, deviceId),
          eq(mobileDeviceRegistrations.userId, userId)
        )
      )
      .limit(1);

    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    await db.update(mobileDeviceRegistrations)
      .set({
        isActive: false,
        updatedAt: new Date()
      })
      .where(eq(mobileDeviceRegistrations.id, device.id));

    console.log(`📱 Device deactivated: ${deviceId} for user ${userId}`);

    res.json({
      success: true,
      message: 'Device deactivated successfully'
    });

  } catch (error) {
    console.error('Error deactivating device:', error);
    res.status(500).json({
      error: 'Failed to deactivate device'
    });
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

function generateDeviceFingerprint(data: {
  deviceId: string;
  deviceModel?: string;
  osVersion?: string;
  userId: string;
}): string {
  const fingerprintData = `${data.userId}:${data.deviceId}:${data.deviceModel}:${data.osVersion}:${Date.now()}`;
  return createHash('sha256').update(fingerprintData).digest('hex');
}

function getClientIP(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress || 'unknown';
}

/**
 * Get monitoring consent text for display in app
 */
export async function getMonitoringConsentText(req: Request, res: Response) {
  const consentText = {
    title: 'Device Monitoring & Content Protection',
    version: '1.0',
    effectiveDate: '2025-01-06',
    sections: [
      {
        heading: 'Why We Monitor',
        content: 'To protect our creators\' copyrighted content from theft and unauthorized distribution, ' +
                'we monitor device activity while you access protected content.'
      },
      {
        heading: 'What We Monitor',
        content: [
          'Screenshot and screen recording attempts',
          'App activity while viewing protected content',
          'Device security status (jailbreak/root detection)',
          'Violation history and enforcement actions'
        ]
      },
      {
        heading: 'Your Consent',
        content: 'By accepting, you consent to:',
        items: [
          'Device monitoring during content viewing',
          'Logging of protection circumvention attempts',
          'Progressive enforcement actions for violations',
          'Possible account suspension for repeated violations'
        ]
      },
      {
        heading: 'Violations & Enforcement',
        content: '• 1-2 violations: Warning\n' +
                '• 3-4 violations: Session termination\n' +
                '• 5+ violations: Account suspension (7 days)'
      },
      {
        heading: 'Data Usage',
        content: 'Monitoring data is used solely for content protection and security. ' +
                'We do not sell or share this data with third parties.'
      }
    ],
    acceptance: 'I understand and accept device monitoring to protect creator content.'
  };

  res.json(consentText);
}
