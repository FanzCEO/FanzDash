import express from "express";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { Strategy as TwitterStrategy } from "passport-twitter";
import { Strategy as LinkedInStrategy } from "passport-linkedin-oauth2";
import { Strategy as LocalStrategy } from "passport-local";
import jwt from "jsonwebtoken";
import argon2 from "argon2";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import { db } from "../db";
import {
  users,
  loginSessions,
  oauthStates,
  webauthnCredentials,
  securityAuditLog,
  trustedDevices,
  emailVerificationTokens,
} from "@shared/schema";
import { eq, and, gt } from "drizzle-orm";
import { nanoid } from "nanoid";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { body, validationResult } from "express-validator";
import { DeviceSecurityService } from "./deviceSecurity";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";
const JWT_EXPIRES_IN = "24h";

// Rate limiting for auth endpoints
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: "Too many authentication attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

export const strictAuthRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3, // limit each IP to 3 requests per windowMs
  message: "Too many failed attempts, please try again later.",
});

export interface AuthUser {
  id: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  emailVerified: boolean;
  totpEnabled: boolean;
  webauthnEnabled: boolean;
}

export interface AuthResult {
  success: boolean;
  user?: AuthUser;
  token?: string;
  requiresMFA?: boolean;
  requiresSetup?: boolean;
  error?: string;
  qrCode?: string;
  backupCodes?: string[];
}

export class MultiAuthService {
  // Initialize all OAuth strategies
  static initializeStrategies() {
    // Google OAuth
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
      passport.use(
        new GoogleStrategy(
          {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "/auth/google/callback",
          },
          this.handleOAuthCallback("google"),
        ),
      );
    }

    // GitHub OAuth
    if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
      passport.use(
        new GitHubStrategy(
          {
            clientID: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            callbackURL: "/auth/github/callback",
          },
          this.handleOAuthCallback("github"),
        ),
      );
    }

    // Facebook OAuth
    if (process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET) {
      passport.use(
        new FacebookStrategy(
          {
            clientID: process.env.FACEBOOK_CLIENT_ID,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
            callbackURL: "/auth/facebook/callback",
            profileFields: ["id", "displayName", "photos", "email"],
          },
          this.handleOAuthCallback("facebook"),
        ),
      );
    }

    // Twitter OAuth
    if (
      process.env.TWITTER_CONSUMER_KEY &&
      process.env.TWITTER_CONSUMER_SECRET
    ) {
      passport.use(
        new TwitterStrategy(
          {
            consumerKey: process.env.TWITTER_CONSUMER_KEY,
            consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
            callbackURL: "/auth/twitter/callback",
          },
          this.handleOAuthCallback("twitter"),
        ),
      );
    }

    // LinkedIn OAuth
    if (process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET) {
      passport.use(
        new LinkedInStrategy(
          {
            clientID: process.env.LINKEDIN_CLIENT_ID,
            clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
            callbackURL: "/auth/linkedin/callback",
            scope: ["r_emailaddress", "r_liteprofile"],
          },
          this.handleOAuthCallback("linkedin"),
        ),
      );
    }

    // Local Strategy (Email/Password and FanzID/Password)
    passport.use(
      new LocalStrategy(
        {
          usernameField: "identifier", // Can be email, username, or fanzId
          passwordField: "password",
        },
        this.handleLocalAuth,
      ),
    );

    passport.serializeUser((user: any, done) => {
      done(null, user.id);
    });

    passport.deserializeUser(async (id: string, done) => {
      try {
        const user = await this.getUserById(id);
        done(null, user);
      } catch (error) {
        done(error, null);
      }
    });
  }

  // OAuth callback handler factory
  private static handleOAuthCallback(provider: string) {
    return async (
      accessToken: string,
      refreshToken: string,
      profile: any,
      done: any,
    ) => {
      try {
        const providerIdField =
          `${provider}Id` as keyof typeof users.$inferSelect;
        const email = profile.emails?.[0]?.value || null;

        // Check if user exists with this provider ID
        let user = await db
          .select()
          .from(users)
          .where(eq(users[providerIdField] as any, profile.id))
          .limit(1);

        if (user.length === 0 && email) {
          // Check if user exists with this email
          user = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

          if (user.length > 0) {
            // Link this OAuth account to existing user
            await db
              .update(users)
              .set({ [providerIdField]: profile.id })
              .where(eq(users.id, user[0].id));
          }
        }

        if (user.length === 0) {
          // Create new user
          const newUser = await db
            .insert(users)
            .values({
              email,
              firstName:
                profile.name?.givenName || profile.displayName?.split(" ")[0],
              lastName:
                profile.name?.familyName ||
                profile.displayName?.split(" ").slice(1).join(" "),
              profileImageUrl: profile.photos?.[0]?.value,
              [providerIdField]: profile.id,
              emailVerified: !!email,
            })
            .returning();

          user = newUser;
        }

        await this.logSecurityEvent(user[0].id, "oauth_login", {
          provider,
          success: true,
        });
        done(null, user[0]);
      } catch (error) {
        console.error(`${provider} OAuth error:`, error);
        done(error, null);
      }
    };
  }

  // Local authentication (Email/Password or FanzID/Password)
  private static handleLocalAuth = async (
    identifier: string,
    password: string,
    done: any,
  ) => {
    try {
      // Find user by email, username, or fanzId
      const user = await db
        .select()
        .from(users)
        .where(eq(users.email, identifier))
        .limit(1);

      let foundUser = user[0];

      if (!foundUser) {
        // Try username
        const userByUsername = await db
          .select()
          .from(users)
          .where(eq(users.username, identifier))
          .limit(1);
        foundUser = userByUsername[0];
      }

      if (!foundUser) {
        // Try fanzId
        const userByFanzId = await db
          .select()
          .from(users)
          .where(
            and(eq(users.fanzId, identifier), eq(users.fanzIdEnabled, true)),
          )
          .limit(1);
        foundUser = userByFanzId[0];
      }

      if (!foundUser || !foundUser.passwordHash) {
        await this.logSecurityEvent(null, "login_failed", {
          identifier,
          reason: "user_not_found",
          success: false,
        });
        return done(null, false, { message: "Invalid credentials" });
      }

      // Check if account is locked
      if (foundUser.accountLocked) {
        await this.logSecurityEvent(foundUser.id, "login_failed", {
          reason: "account_locked",
          success: false,
        });
        return done(null, false, { message: "Account is locked" });
      }

      // Verify password
      const isValidPassword = await argon2.verify(
        foundUser.passwordHash,
        password,
      );

      if (!isValidPassword) {
        // Increment login attempts
        const newAttempts = (foundUser.loginAttempts || 0) + 1;
        const shouldLock = newAttempts >= 5;

        await db
          .update(users)
          .set({
            loginAttempts: newAttempts,
            accountLocked: shouldLock,
          })
          .where(eq(users.id, foundUser.id));

        await this.logSecurityEvent(foundUser.id, "login_failed", {
          attempts: newAttempts,
          locked: shouldLock,
          success: false,
        });

        return done(null, false, { message: "Invalid credentials" });
      }

      // Reset login attempts on successful login
      await db
        .update(users)
        .set({
          loginAttempts: 0,
          lastLoginAt: new Date(),
        })
        .where(eq(users.id, foundUser.id));

      await this.logSecurityEvent(foundUser.id, "login_success", {
        method: "password",
        success: true,
      });

      done(null, foundUser);
    } catch (error) {
      console.error("Local auth error:", error);
      done(error, null);
    }
  };

  // Register new user with email/password
  static async registerWithPassword(
    email: string,
    password: string,
    firstName?: string,
    lastName?: string,
    username?: string,
  ): Promise<AuthResult> {
    try {
      // Check if user already exists
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (existingUser.length > 0) {
        return { success: false, error: "User already exists with this email" };
      }

      // Check username uniqueness if provided
      if (username) {
        const existingUsername = await db
          .select()
          .from(users)
          .where(eq(users.username, username))
          .limit(1);
        if (existingUsername.length > 0) {
          return { success: false, error: "Username already taken" };
        }
      }

      // Hash password
      const passwordHash = await argon2.hash(password);

      // Create user
      const newUser = await db
        .insert(users)
        .values({
          email,
          passwordHash,
          firstName,
          lastName,
          username,
          emailVerified: false,
        })
        .returning();

      const user = newUser[0];
      const token = this.generateJWT(user);

      await this.logSecurityEvent(user.id, "user_registered", {
        method: "password",
        success: true,
      });

      return {
        success: true,
        user: this.sanitizeUser(user),
        token,
        requiresSetup: true,
      };
    } catch (error) {
      console.error("Registration error:", error);
      return { success: false, error: "Failed to create account" };
    }
  }

  // Create custom FanzID for user
  static async createFanzId(
    userId: string,
    fanzId: string,
  ): Promise<AuthResult> {
    try {
      // Check if FanzID is already taken
      const existing = await db
        .select()
        .from(users)
        .where(eq(users.fanzId, fanzId))
        .limit(1);

      if (existing.length > 0) {
        return { success: false, error: "FanzID already taken" };
      }

      // Update user with FanzID
      await db
        .update(users)
        .set({
          fanzId,
          fanzIdEnabled: true,
        })
        .where(eq(users.id, userId));

      await this.logSecurityEvent(userId, "fanz_id_created", {
        fanzId,
        success: true,
      });

      return { success: true };
    } catch (error) {
      console.error("FanzID creation error:", error);
      return { success: false, error: "Failed to create FanzID" };
    }
  }

  // Setup TOTP (2FA)
  static async setupTOTP(userId: string): Promise<AuthResult> {
    try {
      const user = await this.getUserById(userId);
      if (!user) {
        return { success: false, error: "User not found" };
      }

      // Generate TOTP secret
      const secret = speakeasy.generateSecret({
        name: `FanzDash (${user.email})`,
        issuer: "Fanz™ Unlimited Network LLC",
      });

      // Generate QR code
      const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

      // Generate backup codes
      const backupCodes = Array.from({ length: 10 }, () => nanoid(8));

      // Store secret (but don't enable yet)
      await db
        .update(users)
        .set({
          totpSecret: secret.base32,
          backupCodes,
        })
        .where(eq(users.id, userId));

      return {
        success: true,
        qrCode: qrCodeUrl,
        backupCodes,
      };
    } catch (error) {
      console.error("TOTP setup error:", error);
      return { success: false, error: "Failed to setup 2FA" };
    }
  }

  // Verify and enable TOTP
  static async verifyAndEnableTOTP(
    userId: string,
    token: string,
  ): Promise<AuthResult> {
    try {
      const user = await this.getUserById(userId);
      if (!user || !user.totpSecret) {
        return { success: false, error: "TOTP not configured" };
      }

      const verified = speakeasy.totp.verify({
        secret: user.totpSecret,
        encoding: "base32",
        token,
        window: 2,
      });

      if (!verified) {
        return { success: false, error: "Invalid verification code" };
      }

      // Enable TOTP
      await db
        .update(users)
        .set({ totpEnabled: true })
        .where(eq(users.id, userId));

      await this.logSecurityEvent(userId, "totp_enabled", { success: true });

      return { success: true };
    } catch (error) {
      console.error("TOTP verification error:", error);
      return { success: false, error: "Failed to verify 2FA" };
    }
  }

  // Verify TOTP token
  static async verifyTOTP(userId: string, token: string): Promise<boolean> {
    try {
      const user = await this.getUserById(userId);
      if (!user || !user.totpEnabled || !user.totpSecret) {
        return false;
      }

      // Check if it's a backup code
      if (user.backupCodes?.includes(token)) {
        // Remove used backup code
        const newBackupCodes = user.backupCodes.filter(
          (code: string) => code !== token,
        );
        await db
          .update(users)
          .set({ backupCodes: newBackupCodes })
          .where(eq(users.id, userId));

        await this.logSecurityEvent(userId, "backup_code_used", {
          success: true,
        });
        return true;
      }

      // Verify TOTP token
      const verified = speakeasy.totp.verify({
        secret: user.totpSecret,
        encoding: "base32",
        token,
        window: 2,
      });

      if (verified) {
        await this.logSecurityEvent(userId, "totp_verified", { success: true });
      }

      return verified;
    } catch (error) {
      console.error("TOTP verification error:", error);
      return false;
    }
  }

  // Generate JWT token
  static generateJWT(user: any): string {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN },
    );
  }

  // Verify JWT token
  static verifyJWT(token: string): any {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return null;
    }
  }

  // Get user by ID
  static async getUserById(id: string): Promise<any> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return result[0] || null;
  }

  // Sanitize user for response
  static sanitizeUser(user: any): AuthUser {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl,
      emailVerified: user.emailVerified,
      totpEnabled: user.totpEnabled,
      webauthnEnabled: user.webauthnEnabled,
    };
  }

  // Log security events
  private static async logSecurityEvent(
    userId: string | null,
    event: string,
    details: any,
  ): Promise<void> {
    try {
      await db.insert(securityAuditLog).values({
        userId,
        event,
        details,
        success: details.success || false,
        createdAt: new Date(),
      });
    } catch (error) {
      console.error("Failed to log security event:", error);
    }
  }

  // Check if user needs MFA
  static async requiresMFA(userId: string): Promise<boolean> {
    const user = await this.getUserById(userId);
    return user?.totpEnabled || user?.webauthnEnabled || false;
  }
}

// Validation middleware
export const validateRegistration = [
  body("email").isEmail().normalizeEmail(),
  body("password")
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/),
  body("firstName").optional().trim().isLength({ min: 1, max: 50 }),
  body("lastName").optional().trim().isLength({ min: 1, max: 50 }),
  body("username")
    .optional()
    .trim()
    .isLength({ min: 3, max: 20 })
    .matches(/^[a-zA-Z0-9_]+$/),
];

export const validateLogin = [
  body("identifier").notEmpty().trim(),
  body("password").notEmpty(),
];

export const validateFanzId = [
  body("fanzId")
    .isLength({ min: 4, max: 20 })
    .matches(/^[a-zA-Z0-9_-]+$/),
];

export const validateTOTP = [
  body("token").isLength({ min: 6, max: 8 }).isNumeric(),
];

// Auth middleware
export const authenticateToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  const decoded = MultiAuthService.verifyJWT(token);
  if (!decoded) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }

  req.user = decoded;
  next();
};
