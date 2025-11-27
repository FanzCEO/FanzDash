import { db } from '../db';
import {
  creatorVerifications,
  costarVerifications,
  verificationAuditLog,
  verificationStats,
  InsertCreatorVerification,
  InsertCostarVerification,
  InsertVerificationAuditLog,
  CreatorVerification,
  CostarVerification,
} from '../../shared/schema';
import { eq, and, or, desc, count, sql } from 'drizzle-orm';
import logger from '../utils/logger';

/**
 * Verification Service
 * Handles all database operations for the 2257 verification system
 */
class VerificationService {
  /**
   * CREATOR VERIFICATION METHODS
   */

  async createCreatorVerification(data: InsertCreatorVerification): Promise<CreatorVerification> {
    try {
      const [verification] = await db.insert(creatorVerifications).values(data).returning();

      // Log audit
      await this.logAction({
        verificationType: 'creator',
        verificationId: verification.id,
        action: 'created',
        performedBy: data.userId,
        performedByRole: 'creator',
        details: { fullLegalName: data.fullLegalName, emailAddress: data.emailAddress },
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      });

      // Update stats
      await this.updateDailyStats();

      logger.info('Creator verification created', {
        verificationId: verification.id,
        userId: data.userId,
      });

      return verification;
    } catch (error) {
      logger.error('Error creating creator verification:', error);
      throw error;
    }
  }

  async getCreatorVerification(id: string): Promise<CreatorVerification | null> {
    try {
      const [verification] = await db
        .select()
        .from(creatorVerifications)
        .where(eq(creatorVerifications.id, id))
        .limit(1);

      return verification || null;
    } catch (error) {
      logger.error('Error fetching creator verification:', error);
      throw error;
    }
  }

  async listCreatorVerifications(filters?: {
    status?: string;
    userId?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ verifications: CreatorVerification[]; total: number }> {
    try {
      const conditions = [];

      if (filters?.status && filters.status !== 'all') {
        conditions.push(eq(creatorVerifications.status, filters.status as any));
      }

      if (filters?.userId) {
        conditions.push(eq(creatorVerifications.userId, filters.userId));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [verifications, [{ count: total }]] = await Promise.all([
        db
          .select()
          .from(creatorVerifications)
          .where(whereClause)
          .orderBy(desc(creatorVerifications.submittedAt))
          .limit(filters?.limit || 50)
          .offset(filters?.offset || 0),
        db
          .select({ count: count() })
          .from(creatorVerifications)
          .where(whereClause),
      ]);

      return { verifications, total: Number(total) };
    } catch (error) {
      logger.error('Error listing creator verifications:', error);
      throw error;
    }
  }

  async approveCreatorVerification(
    id: string,
    approvedBy: string,
    notes?: string,
    verificationLevel?: string
  ): Promise<CreatorVerification> {
    try {
      const [verification] = await db
        .update(creatorVerifications)
        .set({
          status: 'approved',
          approvedAt: new Date(),
          approvedBy,
          reviewNotes: notes,
          verificationLevel: verificationLevel as any || 'full_compliance',
        })
        .where(eq(creatorVerifications.id, id))
        .returning();

      // Log audit
      await this.logAction({
        verificationType: 'creator',
        verificationId: id,
        action: 'approved',
        performedBy: approvedBy,
        performedByRole: 'admin',
        details: { verificationLevel, notes },
      });

      // Update stats
      await this.updateDailyStats();

      logger.info('Creator verification approved', {
        verificationId: id,
        approvedBy,
      });

      return verification;
    } catch (error) {
      logger.error('Error approving creator verification:', error);
      throw error;
    }
  }

  async rejectCreatorVerification(
    id: string,
    rejectedBy: string,
    reason: string,
    detailedFeedback?: string
  ): Promise<CreatorVerification> {
    try {
      const [verification] = await db
        .update(creatorVerifications)
        .set({
          status: 'rejected',
          rejectedAt: new Date(),
          rejectedBy,
          rejectionReason: reason,
          detailedFeedback,
        })
        .where(eq(creatorVerifications.id, id))
        .returning();

      // Log audit
      await this.logAction({
        verificationType: 'creator',
        verificationId: id,
        action: 'rejected',
        performedBy: rejectedBy,
        performedByRole: 'admin',
        reason,
        details: { detailedFeedback },
      });

      // Update stats
      await this.updateDailyStats();

      logger.info('Creator verification rejected', {
        verificationId: id,
        rejectedBy,
        reason,
      });

      return verification;
    } catch (error) {
      logger.error('Error rejecting creator verification:', error);
      throw error;
    }
  }

  async getCreatorVerificationByUserId(userId: string): Promise<CreatorVerification | null> {
    try {
      const [verification] = await db
        .select()
        .from(creatorVerifications)
        .where(eq(creatorVerifications.userId, userId))
        .orderBy(desc(creatorVerifications.submittedAt))
        .limit(1);

      return verification || null;
    } catch (error) {
      logger.error('Error fetching creator verification by user ID:', error);
      throw error;
    }
  }

  /**
   * CO-STAR VERIFICATION METHODS
   */

  async createCostarVerification(data: InsertCostarVerification): Promise<CostarVerification> {
    try {
      const [verification] = await db.insert(costarVerifications).values(data).returning();

      // Log audit
      await this.logAction({
        verificationType: 'costar',
        verificationId: verification.id,
        action: 'created',
        performedBy: data.submittedBy || data.userId || 'anonymous',
        performedByRole: 'creator',
        details: { legalName: data.legalName, primaryCreator: data.primaryCreatorLegalName },
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      });

      // Update stats
      await this.updateDailyStats();

      logger.info('Co-star verification created', {
        verificationId: verification.id,
        submittedBy: data.submittedBy,
      });

      return verification;
    } catch (error) {
      logger.error('Error creating co-star verification:', error);
      throw error;
    }
  }

  async getCostarVerification(id: string): Promise<CostarVerification | null> {
    try {
      const [verification] = await db
        .select()
        .from(costarVerifications)
        .where(eq(costarVerifications.id, id))
        .limit(1);

      return verification || null;
    } catch (error) {
      logger.error('Error fetching co-star verification:', error);
      throw error;
    }
  }

  async listCostarVerifications(filters?: {
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ verifications: CostarVerification[]; total: number }> {
    try {
      const conditions = [];

      if (filters?.status && filters.status !== 'all') {
        conditions.push(eq(costarVerifications.status, filters.status as any));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [verifications, [{ count: total }]] = await Promise.all([
        db
          .select()
          .from(costarVerifications)
          .where(whereClause)
          .orderBy(desc(costarVerifications.submittedAt))
          .limit(filters?.limit || 50)
          .offset(filters?.offset || 0),
        db
          .select({ count: count() })
          .from(costarVerifications)
          .where(whereClause),
      ]);

      return { verifications, total: Number(total) };
    } catch (error) {
      logger.error('Error listing co-star verifications:', error);
      throw error;
    }
  }

  async approveCostarVerification(
    id: string,
    approvedBy: string,
    notes?: string
  ): Promise<CostarVerification> {
    try {
      const [verification] = await db
        .update(costarVerifications)
        .set({
          status: 'approved',
          approvedAt: new Date(),
          approvedBy,
          reviewNotes: notes,
        })
        .where(eq(costarVerifications.id, id))
        .returning();

      // Log audit
      await this.logAction({
        verificationType: 'costar',
        verificationId: id,
        action: 'approved',
        performedBy: approvedBy,
        performedByRole: 'admin',
        details: { notes },
      });

      // Update stats
      await this.updateDailyStats();

      logger.info('Co-star verification approved', {
        verificationId: id,
        approvedBy,
      });

      return verification;
    } catch (error) {
      logger.error('Error approving co-star verification:', error);
      throw error;
    }
  }

  async rejectCostarVerification(
    id: string,
    rejectedBy: string,
    reason: string
  ): Promise<CostarVerification> {
    try {
      const [verification] = await db
        .update(costarVerifications)
        .set({
          status: 'rejected',
          rejectedAt: new Date(),
          rejectedBy,
          rejectionReason: reason,
        })
        .where(eq(costarVerifications.id, id))
        .returning();

      // Log audit
      await this.logAction({
        verificationType: 'costar',
        verificationId: id,
        action: 'rejected',
        performedBy: rejectedBy,
        performedByRole: 'admin',
        reason,
      });

      // Update stats
      await this.updateDailyStats();

      logger.info('Co-star verification rejected', {
        verificationId: id,
        rejectedBy,
        reason,
      });

      return verification;
    } catch (error) {
      logger.error('Error rejecting co-star verification:', error);
      throw error;
    }
  }

  /**
   * STATISTICS METHODS
   */

  async getCreatorStats(): Promise<{
    pendingReviews: number;
    approvedToday: number;
    rejectedToday: number;
    totalVerified: number;
    totalCreators: number;
  }> {
    try {
      const today = new Date().toISOString().split('T')[0];

      const [stats] = await db
        .select({
          pendingReviews: count(sql`CASE WHEN status = 'pending' THEN 1 END`),
          approvedToday: count(sql`CASE WHEN status = 'approved' AND DATE(approved_at) = ${today} THEN 1 END`),
          rejectedToday: count(sql`CASE WHEN status = 'rejected' AND DATE(rejected_at) = ${today} THEN 1 END`),
          totalVerified: count(sql`CASE WHEN status = 'approved' THEN 1 END`),
          totalCreators: count(),
        })
        .from(creatorVerifications);

      return {
        pendingReviews: Number(stats?.pendingReviews || 0),
        approvedToday: Number(stats?.approvedToday || 0),
        rejectedToday: Number(stats?.rejectedToday || 0),
        totalVerified: Number(stats?.totalVerified || 0),
        totalCreators: Number(stats?.totalCreators || 0),
      };
    } catch (error) {
      logger.error('Error fetching creator stats:', error);
      return {
        pendingReviews: 0,
        approvedToday: 0,
        rejectedToday: 0,
        totalVerified: 0,
        totalCreators: 0,
      };
    }
  }

  async getCostarStats(): Promise<{
    pendingReviews: number;
    approvedToday: number;
    rejectedToday: number;
    totalVerified: number;
  }> {
    try {
      const today = new Date().toISOString().split('T')[0];

      const [stats] = await db
        .select({
          pendingReviews: count(sql`CASE WHEN status = 'pending' THEN 1 END`),
          approvedToday: count(sql`CASE WHEN status = 'approved' AND DATE(approved_at) = ${today} THEN 1 END`),
          rejectedToday: count(sql`CASE WHEN status = 'rejected' AND DATE(rejected_at) = ${today} THEN 1 END`),
          totalVerified: count(sql`CASE WHEN status = 'approved' THEN 1 END`),
        })
        .from(costarVerifications);

      return {
        pendingReviews: Number(stats?.pendingReviews || 0),
        approvedToday: Number(stats?.approvedToday || 0),
        rejectedToday: Number(stats?.rejectedToday || 0),
        totalVerified: Number(stats?.totalVerified || 0),
      };
    } catch (error) {
      logger.error('Error fetching co-star stats:', error);
      return {
        pendingReviews: 0,
        approvedToday: 0,
        rejectedToday: 0,
        totalVerified: 0,
      };
    }
  }

  /**
   * AUDIT LOG METHODS
   */

  private async logAction(data: InsertVerificationAuditLog): Promise<void> {
    try {
      const id = `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await db.insert(verificationAuditLog).values({ id, ...data });
    } catch (error) {
      logger.error('Error logging verification action:', error);
      // Don't throw - audit logging failure shouldn't break the main flow
    }
  }

  async getAuditLog(verificationId: string, limit: number = 50) {
    try {
      const logs = await db
        .select()
        .from(verificationAuditLog)
        .where(eq(verificationAuditLog.verificationId, verificationId))
        .orderBy(desc(verificationAuditLog.timestamp))
        .limit(limit);

      return logs;
    } catch (error) {
      logger.error('Error fetching audit log:', error);
      return [];
    }
  }

  /**
   * DAILY STATS UPDATE
   */

  private async updateDailyStats(): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];

      const [creatorStats] = await db
        .select({
          pending: count(sql`CASE WHEN status = 'pending' THEN 1 END`),
          approved: count(sql`CASE WHEN status = 'approved' THEN 1 END`),
          rejected: count(sql`CASE WHEN status = 'rejected' THEN 1 END`),
          total: count(),
        })
        .from(creatorVerifications);

      const [costarStats] = await db
        .select({
          pending: count(sql`CASE WHEN status = 'pending' THEN 1 END`),
          approved: count(sql`CASE WHEN status = 'approved' THEN 1 END`),
          rejected: count(sql`CASE WHEN status = 'rejected' THEN 1 END`),
          total: count(),
        })
        .from(costarVerifications);

      const statsData = {
        id: `stats_${today}`,
        date: today,
        creatorPending: Number(creatorStats?.pending || 0),
        creatorApproved: Number(creatorStats?.approved || 0),
        creatorRejected: Number(creatorStats?.rejected || 0),
        creatorTotal: Number(creatorStats?.total || 0),
        costarPending: Number(costarStats?.pending || 0),
        costarApproved: Number(costarStats?.approved || 0),
        costarRejected: Number(costarStats?.rejected || 0),
        costarTotal: Number(costarStats?.total || 0),
        totalPending: Number(creatorStats?.pending || 0) + Number(costarStats?.pending || 0),
        totalApproved: Number(creatorStats?.approved || 0) + Number(costarStats?.approved || 0),
        totalRejected: Number(creatorStats?.rejected || 0) + Number(costarStats?.rejected || 0),
        totalVerifications: Number(creatorStats?.total || 0) + Number(costarStats?.total || 0),
      };

      await db
        .insert(verificationStats)
        .values(statsData)
        .onConflictDoUpdate({
          target: [verificationStats.date],
          set: statsData,
        });
    } catch (error) {
      logger.error('Error updating daily stats:', error);
      // Don't throw - stats update failure shouldn't break the main flow
    }
  }
}

export const verificationService = new VerificationService();
