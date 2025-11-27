import { db } from "../db";
import { delegatedAccessPermissions } from "@shared/schema";
import { eq, and } from "drizzle-orm";

// 🔐 DELEGATED ACCESS CONTROL SERVICE
// Manages granular permission system for admin panels, moderators, and creator delegates

export interface PermissionCheck {
  granteeId: string;
  platformId: string;
  action: string;
  resource?: string;
  ip?: string;
}

export interface DelegatedPermission {
  accessType: "admin" | "moderator" | "creator_delegate";
  permissions: Record<string, boolean>;
  canAccessContent?: boolean;
  canModerateContent?: boolean;
  canManageUsers?: boolean;
  canViewAnalytics?: boolean;
  canManageSettings?: boolean;
  canManagePayments?: boolean;
  customRules?: Record<string, any>;
  ipWhitelist?: string[];
  timeRestrictions?: {
    daysOfWeek?: number[]; // 0-6, 0 is Sunday
    hoursStart?: number; // 0-23
    hoursEnd?: number; // 0-23
    timezone?: string;
  };
  expiresAt?: Date;
}

export class DelegatedAccessService {
  private static instance: DelegatedAccessService;

  private constructor() {}

  static getInstance(): DelegatedAccessService {
    if (!DelegatedAccessService.instance) {
      DelegatedAccessService.instance = new DelegatedAccessService();
    }
    return DelegatedAccessService.instance;
  }

  /**
   * Grant delegated access to a user
   */
  async grantAccess(
    grantorId: string,
    granteeId: string,
    platformId: string,
    accessType: "admin" | "moderator" | "creator_delegate",
    permissions: DelegatedPermission
  ): Promise<any> {
    try {
      // Check if permission already exists
      const existing = await db
        .select()
        .from(delegatedAccessPermissions)
        .where(
          and(
            eq(delegatedAccessPermissions.grantorId, grantorId),
            eq(delegatedAccessPermissions.granteeId, granteeId),
            eq(delegatedAccessPermissions.platformId, platformId),
            eq(delegatedAccessPermissions.accessType, accessType)
          )
        )
        .limit(1);

      const permissionData = {
        grantorId,
        granteeId,
        platformId,
        accessType,
        permissions: permissions.permissions,
        canAccessContent: permissions.canAccessContent || false,
        canModerateContent: permissions.canModerateContent || false,
        canManageUsers: permissions.canManageUsers || false,
        canViewAnalytics: permissions.canViewAnalytics || false,
        canManageSettings: permissions.canManageSettings || false,
        canManagePayments: permissions.canManagePayments || false,
        customRules: permissions.customRules || {},
        ipWhitelist: permissions.ipWhitelist || [],
        timeRestrictions: permissions.timeRestrictions || {},
        expiresAt: permissions.expiresAt,
        isActive: true,
        updatedAt: new Date(),
      };

      if (existing.length > 0) {
        // Update existing permission
        const result = await db
          .update(delegatedAccessPermissions)
          .set(permissionData)
          .where(eq(delegatedAccessPermissions.id, existing[0].id))
          .returning();

        return result[0];
      } else {
        // Create new permission
        const result = await db
          .insert(delegatedAccessPermissions)
          .values(permissionData)
          .returning();

        return result[0];
      }
    } catch (error) {
      console.error("Error granting delegated access:", error);
      throw error;
    }
  }

  /**
   * Revoke delegated access
   */
  async revokeAccess(
    grantorId: string,
    granteeId: string,
    platformId: string,
    accessType?: string
  ): Promise<boolean> {
    try {
      const conditions = [
        eq(delegatedAccessPermissions.grantorId, grantorId),
        eq(delegatedAccessPermissions.granteeId, granteeId),
        eq(delegatedAccessPermissions.platformId, platformId),
      ];

      if (accessType) {
        conditions.push(eq(delegatedAccessPermissions.accessType, accessType));
      }

      await db
        .update(delegatedAccessPermissions)
        .set({
          isActive: false,
          updatedAt: new Date(),
        })
        .where(and(...conditions));

      return true;
    } catch (error) {
      console.error("Error revoking access:", error);
      return false;
    }
  }

  /**
   * Check if user has permission to perform action
   */
  async checkPermission(check: PermissionCheck): Promise<{
    allowed: boolean;
    reason?: string;
    permission?: any;
  }> {
    try {
      // Get all active permissions for the grantee on this platform
      const permissions = await db
        .select()
        .from(delegatedAccessPermissions)
        .where(
          and(
            eq(delegatedAccessPermissions.granteeId, check.granteeId),
            eq(delegatedAccessPermissions.platformId, check.platformId),
            eq(delegatedAccessPermissions.isActive, true)
          )
        );

      if (permissions.length === 0) {
        return { allowed: false, reason: "No permissions granted" };
      }

      // Check each permission
      for (const permission of permissions) {
        // Check if permission has expired
        if (permission.expiresAt && new Date() >= permission.expiresAt) {
          continue; // Skip expired permission
        }

        // Check IP whitelist
        if (check.ip && permission.ipWhitelist && permission.ipWhitelist.length > 0) {
          const ipArray = Array.isArray(permission.ipWhitelist)
            ? permission.ipWhitelist
            : Object.values(permission.ipWhitelist);

          if (!ipArray.includes(check.ip)) {
            continue; // Skip if IP not whitelisted
          }
        }

        // Check time restrictions
        if (permission.timeRestrictions) {
          const timeCheck = this.checkTimeRestrictions(
            permission.timeRestrictions as any
          );
          if (!timeCheck) {
            continue; // Skip if outside allowed time
          }
        }

        // Check specific action permissions
        const hasPermission = this.hasActionPermission(permission, check.action, check.resource);
        if (hasPermission) {
          return { allowed: true, permission };
        }
      }

      return { allowed: false, reason: "Permission denied for this action" };
    } catch (error) {
      console.error("Error checking permission:", error);
      return { allowed: false, reason: "Error checking permission" };
    }
  }

  /**
   * Check time-based restrictions
   */
  private checkTimeRestrictions(restrictions: any): boolean {
    if (!restrictions || Object.keys(restrictions).length === 0) {
      return true; // No restrictions
    }

    const now = new Date();

    // Check day of week
    if (restrictions.daysOfWeek && restrictions.daysOfWeek.length > 0) {
      const currentDay = now.getDay();
      if (!restrictions.daysOfWeek.includes(currentDay)) {
        return false;
      }
    }

    // Check hours
    if (restrictions.hoursStart !== undefined && restrictions.hoursEnd !== undefined) {
      const currentHour = now.getHours();
      if (currentHour < restrictions.hoursStart || currentHour >= restrictions.hoursEnd) {
        return false;
      }
    }

    return true;
  }

  /**
   * Check if permission grants access to specific action
   */
  private hasActionPermission(permission: any, action: string, resource?: string): boolean {
    // Map actions to permission flags
    const actionMap: Record<string, string> = {
      "content:view": "canAccessContent",
      "content:create": "canAccessContent",
      "content:edit": "canAccessContent",
      "content:delete": "canAccessContent",
      "content:moderate": "canModerateContent",
      "users:view": "canManageUsers",
      "users:create": "canManageUsers",
      "users:edit": "canManageUsers",
      "users:delete": "canManageUsers",
      "analytics:view": "canViewAnalytics",
      "settings:view": "canManageSettings",
      "settings:edit": "canManageSettings",
      "payments:view": "canManagePayments",
      "payments:process": "canManagePayments",
    };

    // Check built-in permission flags
    const permissionKey = actionMap[action];
    if (permissionKey && permission[permissionKey]) {
      return true;
    }

    // Check custom permissions object
    if (permission.permissions && typeof permission.permissions === "object") {
      // Check if action exists directly in permissions
      if (permission.permissions[action] === true) {
        return true;
      }

      // Check resource-specific permission
      if (resource && permission.permissions[`${action}:${resource}`] === true) {
        return true;
      }

      // Check wildcard permissions
      const actionParts = action.split(":");
      if (actionParts.length > 1) {
        const wildcard = `${actionParts[0]}:*`;
        if (permission.permissions[wildcard] === true) {
          return true;
        }
      }
    }

    // Check custom rules
    if (permission.customRules && typeof permission.customRules === "object") {
      const rules = permission.customRules as Record<string, any>;

      if (rules[action]) {
        // Custom rule can be boolean or object with conditions
        if (typeof rules[action] === "boolean") {
          return rules[action];
        }

        // Could add more complex rule evaluation here
        return true;
      }
    }

    return false;
  }

  /**
   * Get permissions granted by a user
   */
  async getGrantedPermissions(grantorId: string, platformId?: string) {
    try {
      const conditions = [eq(delegatedAccessPermissions.grantorId, grantorId)];

      if (platformId) {
        conditions.push(eq(delegatedAccessPermissions.platformId, platformId));
      }

      return await db
        .select()
        .from(delegatedAccessPermissions)
        .where(and(...conditions, eq(delegatedAccessPermissions.isActive, true)));
    } catch (error) {
      console.error("Error fetching granted permissions:", error);
      return [];
    }
  }

  /**
   * Get permissions received by a user
   */
  async getReceivedPermissions(granteeId: string, platformId?: string) {
    try {
      const conditions = [eq(delegatedAccessPermissions.granteeId, granteeId)];

      if (platformId) {
        conditions.push(eq(delegatedAccessPermissions.platformId, platformId));
      }

      return await db
        .select()
        .from(delegatedAccessPermissions)
        .where(and(...conditions, eq(delegatedAccessPermissions.isActive, true)));
    } catch (error) {
      console.error("Error fetching received permissions:", error);
      return [];
    }
  }

  /**
   * Update permission settings
   */
  async updatePermission(
    permissionId: string,
    updates: Partial<DelegatedPermission>
  ): Promise<any> {
    try {
      const updateData: any = {
        updatedAt: new Date(),
      };

      if (updates.permissions) updateData.permissions = updates.permissions;
      if (updates.canAccessContent !== undefined)
        updateData.canAccessContent = updates.canAccessContent;
      if (updates.canModerateContent !== undefined)
        updateData.canModerateContent = updates.canModerateContent;
      if (updates.canManageUsers !== undefined)
        updateData.canManageUsers = updates.canManageUsers;
      if (updates.canViewAnalytics !== undefined)
        updateData.canViewAnalytics = updates.canViewAnalytics;
      if (updates.canManageSettings !== undefined)
        updateData.canManageSettings = updates.canManageSettings;
      if (updates.canManagePayments !== undefined)
        updateData.canManagePayments = updates.canManagePayments;
      if (updates.customRules) updateData.customRules = updates.customRules;
      if (updates.ipWhitelist) updateData.ipWhitelist = updates.ipWhitelist;
      if (updates.timeRestrictions)
        updateData.timeRestrictions = updates.timeRestrictions;
      if (updates.expiresAt) updateData.expiresAt = updates.expiresAt;

      const result = await db
        .update(delegatedAccessPermissions)
        .set(updateData)
        .where(eq(delegatedAccessPermissions.id, permissionId))
        .returning();

      return result[0];
    } catch (error) {
      console.error("Error updating permission:", error);
      throw error;
    }
  }

  /**
   * Get permission templates for different access types
   */
  getPermissionTemplate(accessType: "admin" | "moderator" | "creator_delegate"): DelegatedPermission {
    const templates: Record<string, DelegatedPermission> = {
      admin: {
        accessType: "admin",
        permissions: {
          "content:*": true,
          "users:*": true,
          "analytics:*": true,
          "settings:*": true,
          "payments:*": true,
        },
        canAccessContent: true,
        canModerateContent: true,
        canManageUsers: true,
        canViewAnalytics: true,
        canManageSettings: true,
        canManagePayments: true,
      },
      moderator: {
        accessType: "moderator",
        permissions: {
          "content:view": true,
          "content:moderate": true,
          "users:view": true,
        },
        canAccessContent: true,
        canModerateContent: true,
        canManageUsers: false,
        canViewAnalytics: false,
        canManageSettings: false,
        canManagePayments: false,
      },
      creator_delegate: {
        accessType: "creator_delegate",
        permissions: {
          "content:view": true,
          "content:create": true,
          "content:edit": true,
          "analytics:view": true,
        },
        canAccessContent: true,
        canModerateContent: false,
        canManageUsers: false,
        canViewAnalytics: true,
        canManageSettings: false,
        canManagePayments: false,
      },
    };

    return templates[accessType] || templates.creator_delegate;
  }

  /**
   * Bulk grant access to multiple users
   */
  async bulkGrantAccess(
    grantorId: string,
    grantees: Array<{ granteeId: string; platformId: string }>,
    accessType: "admin" | "moderator" | "creator_delegate",
    permissions: DelegatedPermission
  ): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const grantee of grantees) {
      try {
        await this.grantAccess(
          grantorId,
          grantee.granteeId,
          grantee.platformId,
          accessType,
          permissions
        );
        success++;
      } catch (error) {
        console.error(`Failed to grant access to ${grantee.granteeId}:`, error);
        failed++;
      }
    }

    return { success, failed };
  }

  /**
   * Get permission audit log
   */
  async getAuditLog(grantorId?: string, granteeId?: string, platformId?: string) {
    try {
      const conditions: any[] = [];

      if (grantorId) {
        conditions.push(eq(delegatedAccessPermissions.grantorId, grantorId));
      }
      if (granteeId) {
        conditions.push(eq(delegatedAccessPermissions.granteeId, granteeId));
      }
      if (platformId) {
        conditions.push(eq(delegatedAccessPermissions.platformId, platformId));
      }

      const query =
        conditions.length > 0
          ? db.select().from(delegatedAccessPermissions).where(and(...conditions))
          : db.select().from(delegatedAccessPermissions);

      return await query;
    } catch (error) {
      console.error("Error fetching audit log:", error);
      return [];
    }
  }
}

// Export singleton instance
export const delegatedAccessService = DelegatedAccessService.getInstance();
