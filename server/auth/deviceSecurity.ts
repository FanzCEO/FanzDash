import crypto from "crypto";
import { db } from "../db";
import {
  trustedDevices,
  emailVerificationTokens,
  securityAuditLog,
} from "@shared/schema";
import { eq, and, gt } from "drizzle-orm";
import { nanoid } from "nanoid";
import nodemailer from "nodemailer";

// HTML escaping function to prevent XSS attacks
function escapeHtml(unsafe: string | undefined | null): string {
  if (!unsafe) return "";
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace(/\//g, "&#x2F;");
}

export interface DeviceInfo {
  fingerprint: string;
  name?: string;
  browser?: string;
  os?: string;
  ipAddress: string;
  userAgent: string;
  location?: {
    city?: string;
    country?: string;
    coordinates?: { lat: number; lng: number };
  };
}

export interface SecurityResult {
  requiresVerification: boolean;
  riskScore: number;
  reasons: string[];
  verificationToken?: string;
}

export class DeviceSecurityService {
  // Generate device fingerprint from request info
  static generateDeviceFingerprint(req: any): string {
    const userAgent = req.headers["user-agent"] || "";
    const acceptLanguage = req.headers["accept-language"] || "";
    const acceptEncoding = req.headers["accept-encoding"] || "";
    const ipAddress = this.getClientIP(req);

    // Create a unique fingerprint based on device characteristics
    const fingerprintData = `${userAgent}|${acceptLanguage}|${acceptEncoding}|${ipAddress}`;
    return crypto.createHash("sha256").update(fingerprintData).digest("hex");
  }

  // Extract device info from request
  static extractDeviceInfo(req: any): DeviceInfo {
    const userAgent = req.headers["user-agent"] || "";
    const ipAddress = this.getClientIP(req);

    return {
      fingerprint: this.generateDeviceFingerprint(req),
      browser: this.extractBrowser(userAgent),
      os: this.extractOS(userAgent),
      ipAddress,
      userAgent,
      location: this.getLocationFromIP(ipAddress),
    };
  }

  // Get client IP address
  private static getClientIP(req: any): string {
    return (
      req.ip ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.headers["x-real-ip"] ||
      "unknown"
    );
  }

  // Extract browser from user agent
  private static extractBrowser(userAgent: string): string {
    if (userAgent.includes("Chrome")) return "Chrome";
    if (userAgent.includes("Firefox")) return "Firefox";
    if (userAgent.includes("Safari")) return "Safari";
    if (userAgent.includes("Edge")) return "Edge";
    if (userAgent.includes("Opera")) return "Opera";
    return "Unknown";
  }

  // Extract OS from user agent
  private static extractOS(userAgent: string): string {
    if (userAgent.includes("Windows")) return "Windows";
    if (userAgent.includes("Mac OS X")) return "macOS";
    if (userAgent.includes("Linux")) return "Linux";
    if (userAgent.includes("Android")) return "Android";
    if (userAgent.includes("iOS")) return "iOS";
    return "Unknown";
  }

  // Get approximate location from IP (simplified - in production use GeoIP service)
  private static getLocationFromIP(ipAddress: string): any {
    // This is a simplified implementation
    // In production, use a service like MaxMind GeoIP2 or ipinfo.io
    return {
      city: "Unknown",
      country: "Unknown",
      coordinates: null,
    };
  }

  // Check if device is trusted
  static async isDeviceTrusted(
    userId: string,
    deviceFingerprint: string,
  ): Promise<boolean> {
    const trustedDevice = await db
      .select()
      .from(trustedDevices)
      .where(
        and(
          eq(trustedDevices.userId, userId),
          eq(trustedDevices.deviceFingerprint, deviceFingerprint),
          eq(trustedDevices.isTrusted, true),
        ),
      )
      .limit(1);

    return trustedDevice.length > 0;
  }

  // Analyze login security and determine if verification is needed
  static async analyzeLoginSecurity(
    userId: string,
    deviceInfo: DeviceInfo,
    req: any,
  ): Promise<SecurityResult> {
    let riskScore = 0;
    const reasons: string[] = [];

    // Check if device is already trusted
    const isKnownDevice = await this.isDeviceTrusted(
      userId,
      deviceInfo.fingerprint,
    );

    if (!isKnownDevice) {
      riskScore += 50;
      reasons.push("New device detected");
    }

    // Check for suspicious IP patterns
    const recentLogins = await this.getRecentLoginsByUser(userId, 24); // Last 24 hours
    const sameIPLogins = recentLogins.filter(
      (login) => login.ipAddress === deviceInfo.ipAddress,
    );

    if (sameIPLogins.length === 0 && recentLogins.length > 0) {
      riskScore += 30;
      reasons.push("Login from new IP address");
    }

    // Check for rapid location changes (if we had proper GeoIP)
    if (recentLogins.length > 0) {
      const lastLogin = recentLogins[0];
      // In production, calculate distance between locations
      // For now, just check if IP is different
      if (lastLogin.ipAddress !== deviceInfo.ipAddress) {
        riskScore += 20;
        reasons.push("Location change detected");
      }
    }

    // Check login frequency (velocity checks)
    if (recentLogins.length > 5) {
      riskScore += 25;
      reasons.push("High login frequency detected");
    }

    // Determine if verification is required
    const requiresVerification = riskScore >= 50; // Threshold for requiring verification

    let verificationToken;
    if (requiresVerification) {
      verificationToken = await this.createVerificationToken(
        userId,
        "device_verification",
        deviceInfo,
      );
    }

    // Log the security analysis
    await this.logSecurityEvent(userId, "security_analysis", {
      riskScore,
      reasons,
      requiresVerification,
      deviceInfo,
      success: true,
    });

    return {
      requiresVerification,
      riskScore,
      reasons,
      verificationToken,
    };
  }

  // Create verification token for email verification
  static async createVerificationToken(
    userId: string,
    purpose: string,
    deviceInfo: DeviceInfo,
  ): Promise<string> {
    const token = nanoid(32); // Generate secure random token
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await db.insert(emailVerificationTokens).values({
      userId,
      token,
      email: "", // Will be filled when sending email
      purpose,
      deviceFingerprint: deviceInfo.fingerprint,
      ipAddress: deviceInfo.ipAddress,
      expiresAt,
    });

    return token;
  }

  // Send verification email
  static async sendDeviceVerificationEmail(
    userEmail: string,
    userName: string,
    token: string,
    deviceInfo: DeviceInfo,
  ): Promise<boolean> {
    try {
      // Update token with email
      await db
        .update(emailVerificationTokens)
        .set({ email: userEmail })
        .where(eq(emailVerificationTokens.token, token));

      // Create email transporter (configure with your email service)
      const transporter = nodemailer.createTransport({
        // Configure your email service here
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const verificationUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/auth/verify-device?token=${token}`;

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
            <h1>🔒 Device Verification Required</h1>
            <p style="margin: 0; font-size: 16px;">Fanz™ Unlimited Network LLC Security Alert</p>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${escapeHtml(userName)},</h2>
            
            <p style="font-size: 16px; line-height: 1.6; color: #555;">
              We detected a login attempt from a new device or location. To ensure your account security, 
              please verify this login attempt by clicking the button below.
            </p>

            <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #667eea;">
              <h3 style="margin: 0 0 10px 0; color: #333;">Device Information:</h3>
              <p style="margin: 5px 0; color: #666;"><strong>Browser:</strong> ${escapeHtml(deviceInfo.browser)}</p>
              <p style="margin: 5px 0; color: #666;"><strong>Operating System:</strong> ${escapeHtml(deviceInfo.os)}</p>
              <p style="margin: 5px 0; color: #666;"><strong>IP Address:</strong> ${escapeHtml(deviceInfo.ipAddress)}</p>
              <p style="margin: 5px 0; color: #666;"><strong>Location:</strong> ${escapeHtml(deviceInfo.location?.city || "Unknown")}, ${escapeHtml(deviceInfo.location?.country || "Unknown")}</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        font-weight: bold;
                        display: inline-block;">
                Verify This Device
              </a>
            </div>

            <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #856404;">
                <strong>⚠️ Important:</strong> If this wasn't you, please secure your account immediately 
                by changing your password and enabling two-factor authentication.
              </p>
            </div>

            <p style="font-size: 14px; color: #888; margin-top: 30px;">
              This verification link will expire in 15 minutes for security reasons.
            </p>
          </div>

          <div style="background: #333; color: white; padding: 20px; text-align: center;">
            <p style="margin: 0; font-size: 14px;">
              © 2025 Fanz™ Unlimited Network LLC. All Rights Reserved.
            </p>
            <p style="margin: 5px 0 0 0; font-size: 12px; color: #ccc;">
              Official communications from fanzunlimited.com
            </p>
          </div>
        </div>
      `;

      await transporter.sendMail({
        from: `"FanzDash Security" <security@fanzunlimited.com>`,
        to: userEmail,
        subject: "🔒 Device Verification Required - FanzDash",
        html: emailHtml,
      });

      return true;
    } catch (error) {
      console.error("Failed to send verification email:", error);
      return false;
    }
  }

  // Verify device verification token
  static async verifyDeviceToken(
    token: string,
  ): Promise<{ success: boolean; userId?: string; error?: string }> {
    try {
      const tokenRecord = await db
        .select()
        .from(emailVerificationTokens)
        .where(
          and(
            eq(emailVerificationTokens.token, token),
            eq(emailVerificationTokens.purpose, "device_verification"),
            gt(emailVerificationTokens.expiresAt, new Date()),
          ),
        )
        .limit(1);

      if (tokenRecord.length === 0) {
        return { success: false, error: "Invalid or expired token" };
      }

      const record = tokenRecord[0];

      // Mark token as used
      await db
        .update(emailVerificationTokens)
        .set({ usedAt: new Date() })
        .where(eq(emailVerificationTokens.id, record.id));

      // Add device to trusted devices
      await db.insert(trustedDevices).values({
        userId: record.userId,
        deviceFingerprint: record.deviceFingerprint!,
        ipAddress: record.ipAddress,
        isTrusted: true,
        lastUsedAt: new Date(),
      });

      // Log successful verification
      await this.logSecurityEvent(record.userId, "device_verified", {
        deviceFingerprint: record.deviceFingerprint,
        success: true,
      });

      return { success: true, userId: record.userId };
    } catch (error) {
      console.error("Device verification error:", error);
      return { success: false, error: "Verification failed" };
    }
  }

  // Get recent logins for a user
  private static async getRecentLoginsByUser(
    userId: string,
    hours: number = 24,
  ): Promise<any[]> {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    return await db
      .select()
      .from(securityAuditLog)
      .where(
        and(
          eq(securityAuditLog.userId, userId),
          eq(securityAuditLog.event, "login_success"),
          gt(securityAuditLog.createdAt, since),
        ),
      )
      .orderBy(securityAuditLog.createdAt);
  }

  // Log security events
  private static async logSecurityEvent(
    userId: string,
    event: string,
    details: any,
  ): Promise<void> {
    try {
      await db.insert(securityAuditLog).values({
        userId,
        event,
        details,
        ipAddress: details.deviceInfo?.ipAddress || details.ipAddress,
        userAgent: details.deviceInfo?.userAgent,
        deviceFingerprint:
          details.deviceInfo?.fingerprint || details.deviceFingerprint,
        location: details.deviceInfo?.location,
        riskScore: details.riskScore || 0,
        success: details.success || false,
      });
    } catch (error) {
      console.error("Failed to log security event:", error);
    }
  }

  // Clean up expired tokens
  static async cleanupExpiredTokens(): Promise<void> {
    try {
      await db
        .delete(emailVerificationTokens)
        .where(
          and(
            gt(emailVerificationTokens.expiresAt, new Date()),
            eq(emailVerificationTokens.usedAt, null),
          ),
        );
    } catch (error) {
      console.error("Failed to cleanup expired tokens:", error);
    }
  }

  // Trust a device manually (for admin use)
  static async trustDevice(
    userId: string,
    deviceFingerprint: string,
  ): Promise<boolean> {
    try {
      await db
        .insert(trustedDevices)
        .values({
          userId,
          deviceFingerprint,
          isTrusted: true,
          lastUsedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: trustedDevices.deviceFingerprint,
          set: {
            isTrusted: true,
            lastUsedAt: new Date(),
          },
        });

      await this.logSecurityEvent(userId, "device_trusted_manually", {
        deviceFingerprint,
        success: true,
      });

      return true;
    } catch (error) {
      console.error("Failed to trust device:", error);
      return false;
    }
  }

  // Remove trusted device
  static async removeTrustedDevice(
    userId: string,
    deviceFingerprint: string,
  ): Promise<boolean> {
    try {
      await db
        .delete(trustedDevices)
        .where(
          and(
            eq(trustedDevices.userId, userId),
            eq(trustedDevices.deviceFingerprint, deviceFingerprint),
          ),
        );

      await this.logSecurityEvent(userId, "device_untrusted", {
        deviceFingerprint,
        success: true,
      });

      return true;
    } catch (error) {
      console.error("Failed to remove trusted device:", error);
      return false;
    }
  }
}
