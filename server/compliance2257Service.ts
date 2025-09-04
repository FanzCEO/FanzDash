import { db } from "./db";
import {
  form2257Records,
  form2257Amendments,
  complianceChecklist,
  securityAuditLog,
  type InsertForm2257Record,
  type InsertForm2257Amendment,
  type InsertComplianceChecklist,
  type Form2257Record,
  type ComplianceChecklist,
} from "@shared/schema";
import { eq, and, desc, gte, lte } from "drizzle-orm";
import { nanoid } from "nanoid";
import crypto from "crypto";

export interface DigitalSignature {
  signature: string;
  timestamp: string;
  hash: string;
  metadata: {
    ipAddress: string;
    userAgent: string;
    deviceFingerprint: string;
  };
}

export class Compliance2257Service {
  // Create new 2257 record
  async createRecord(
    userId: string,
    recordData: Partial<InsertForm2257Record>,
    metadata: any,
  ): Promise<Form2257Record> {
    try {
      // Calculate retention date (typically 5 years from creation)
      const retentionDate = new Date();
      retentionDate.setFullYear(retentionDate.getFullYear() + 5);

      const record = await db
        .insert(form2257Records)
        .values({
          ...recordData,
          userId,
          retentionDate,
          ipAddress: metadata.ipAddress,
          userAgent: metadata.userAgent,
          deviceFingerprint: metadata.deviceFingerprint,
          geoLocation: metadata.geoLocation,
          verificationStatus: "pending",
        })
        .returning();

      // Create initial compliance checklist
      await this.createComplianceChecklist(record[0].id, userId);

      // Log the record creation
      await this.logComplianceEvent(userId, "form_2257_created", {
        recordId: record[0].id,
        success: true,
      });

      return record[0];
    } catch (error) {
      console.error("Error creating 2257 record:", error);
      throw new Error("Failed to create 2257 record");
    }
  }

  // Update existing record
  async updateRecord(
    recordId: string,
    updates: Partial<InsertForm2257Record>,
    amendedBy: string,
  ): Promise<Form2257Record> {
    try {
      // Get current record for amendment tracking
      const currentRecord = await this.getRecordById(recordId);
      if (!currentRecord) {
        throw new Error("Record not found");
      }

      // Create amendment record
      await this.createAmendment(
        recordId,
        "update",
        currentRecord,
        updates,
        "Record update",
        amendedBy,
      );

      // Update the record
      const [updatedRecord] = await db
        .update(form2257Records)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(form2257Records.id, recordId))
        .returning();

      // Update compliance checklist
      await this.updateComplianceChecklist(recordId, amendedBy);

      return updatedRecord;
    } catch (error) {
      console.error("Error updating 2257 record:", error);
      throw new Error("Failed to update 2257 record");
    }
  }

  // Verify age from date of birth
  verifyAge(
    dateOfBirth: string,
    minimumAge: number = 18,
  ): { isValid: boolean; age: number; details: string } {
    try {
      const birthDate = new Date(dateOfBirth);
      const today = new Date();

      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }

      const isValid = age >= minimumAge;
      const details = isValid
        ? `Age verified: ${age} years old (minimum: ${minimumAge})`
        : `Age verification failed: ${age} years old (minimum required: ${minimumAge})`;

      return { isValid, age, details };
    } catch (error) {
      return {
        isValid: false,
        age: 0,
        details: "Invalid date of birth format",
      };
    }
  }

  // Validate ID document information
  validateIdDocument(
    idType: string,
    idNumber: string,
    issuer: string,
    issueDate: string,
    expirationDate?: string,
  ): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Check required fields
    if (!idType || !idNumber || !issuer || !issueDate) {
      errors.push("All ID document fields are required");
    }

    // Validate ID types
    const validIdTypes = [
      "driver_license",
      "passport",
      "state_id",
      "military_id",
    ];
    if (idType && !validIdTypes.includes(idType)) {
      errors.push("Invalid ID document type");
    }

    // Validate dates
    try {
      const issueDateTime = new Date(issueDate);
      const today = new Date();

      if (issueDateTime > today) {
        errors.push("Issue date cannot be in the future");
      }

      if (expirationDate) {
        const expirationDateTime = new Date(expirationDate);
        if (expirationDateTime < today) {
          errors.push("ID document has expired");
        }
        if (expirationDateTime <= issueDateTime) {
          errors.push("Expiration date must be after issue date");
        }
      }
    } catch (error) {
      errors.push("Invalid date format");
    }

    // Validate ID number format (basic checks)
    if (idNumber && idNumber.length < 5) {
      errors.push("ID number appears to be too short");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Create digital signature
  createDigitalSignature(data: string, metadata: any): DigitalSignature {
    const timestamp = new Date().toISOString();
    const hash = crypto
      .createHash("sha256")
      .update(data + timestamp)
      .digest("hex");
    const signature = crypto
      .createHash("sha256")
      .update(hash + metadata.userId)
      .digest("hex");

    return {
      signature,
      timestamp,
      hash,
      metadata: {
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent,
        deviceFingerprint: metadata.deviceFingerprint,
      },
    };
  }

  // Verify compliance status
  async verifyCompliance(
    recordId: string,
    verifiedBy: string,
  ): Promise<{ isCompliant: boolean; issues: string[]; score: number }> {
    try {
      const record = await this.getRecordById(recordId);
      if (!record) {
        throw new Error("Record not found");
      }

      const issues: string[] = [];
      let score = 0;
      const maxScore = 100;
      const checkWeight = maxScore / 15; // 15 main compliance checks

      // Age verification
      const ageCheck = this.verifyAge(record.dateOfBirth);
      if (ageCheck.isValid) {
        score += checkWeight;
      } else {
        issues.push("Age verification failed");
      }

      // Primary ID validation
      const primaryIdCheck = this.validateIdDocument(
        record.primaryIdType,
        record.primaryIdNumber,
        record.primaryIdIssuer,
        record.primaryIdIssueDate,
        record.primaryIdExpirationDate || undefined,
      );
      if (primaryIdCheck.isValid) {
        score += checkWeight;
      } else {
        issues.push(...primaryIdCheck.errors);
      }

      // Required fields check
      const requiredFields = [
        "firstName",
        "lastName",
        "dateOfBirth",
        "placeOfBirth",
        "primaryIdType",
        "primaryIdNumber",
        "primaryIdIssuer",
        "performanceDate",
        "custodianName",
        "custodianTitle",
        "custodianAddress",
      ];

      let requiredFieldsPresent = 0;
      requiredFields.forEach((field) => {
        if (record[field as keyof Form2257Record]) {
          requiredFieldsPresent++;
        } else {
          issues.push(`Required field missing: ${field}`);
        }
      });

      score +=
        (requiredFieldsPresent / requiredFields.length) * checkWeight * 3;

      // Consent and legal requirements
      if (record.consentProvided) {
        score += checkWeight;
      } else {
        issues.push("Consent not provided");
      }

      if (record.ageVerified) {
        score += checkWeight;
      } else {
        issues.push("Age not verified");
      }

      // Digital signatures
      if (record.performerSignature && record.custodianSignature) {
        score += checkWeight;
      } else {
        issues.push("Digital signatures missing");
      }

      // Retention compliance
      const retentionDate = new Date(record.retentionDate);
      const today = new Date();
      if (retentionDate > today) {
        score += checkWeight;
      } else {
        issues.push("Record has passed retention date");
      }

      const finalScore = Math.min(Math.round(score), maxScore);
      const isCompliant = finalScore >= 90 && issues.length === 0;

      // Update verification status
      await db
        .update(form2257Records)
        .set({
          verificationStatus: isCompliant ? "approved" : "rejected",
          verifiedBy,
          verifiedAt: new Date(),
          rejectionReason: isCompliant ? null : issues.join("; "),
        })
        .where(eq(form2257Records.id, recordId));

      return { isCompliant, issues, score: finalScore };
    } catch (error) {
      console.error("Error verifying compliance:", error);
      throw new Error("Failed to verify compliance");
    }
  }

  // Get record by ID
  async getRecordById(recordId: string): Promise<Form2257Record | null> {
    try {
      const [record] = await db
        .select()
        .from(form2257Records)
        .where(eq(form2257Records.id, recordId))
        .limit(1);

      return record || null;
    } catch (error) {
      console.error("Error fetching record:", error);
      return null;
    }
  }

  // Get records by user
  async getRecordsByUser(userId: string): Promise<Form2257Record[]> {
    try {
      return await db
        .select()
        .from(form2257Records)
        .where(eq(form2257Records.userId, userId))
        .orderBy(desc(form2257Records.createdAt));
    } catch (error) {
      console.error("Error fetching user records:", error);
      return [];
    }
  }

  // Search records with filters
  async searchRecords(filters: {
    userId?: string;
    verificationStatus?: string;
    performanceDateFrom?: string;
    performanceDateTo?: string;
    custodianName?: string;
  }): Promise<Form2257Record[]> {
    try {
      let query = db.select().from(form2257Records);

      const conditions = [];

      if (filters.userId) {
        conditions.push(eq(form2257Records.userId, filters.userId));
      }

      if (filters.verificationStatus) {
        conditions.push(
          eq(form2257Records.verificationStatus, filters.verificationStatus),
        );
      }

      if (filters.performanceDateFrom) {
        conditions.push(
          gte(form2257Records.performanceDate, filters.performanceDateFrom),
        );
      }

      if (filters.performanceDateTo) {
        conditions.push(
          lte(form2257Records.performanceDate, filters.performanceDateTo),
        );
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      return await query.orderBy(desc(form2257Records.createdAt));
    } catch (error) {
      console.error("Error searching records:", error);
      return [];
    }
  }

  // Create amendment record
  private async createAmendment(
    recordId: string,
    amendmentType: string,
    previousValue: any,
    newValue: any,
    reason: string,
    amendedBy: string,
  ): Promise<void> {
    try {
      await db.insert(form2257Amendments).values({
        recordId,
        amendmentType,
        previousValue,
        newValue,
        reason,
        amendedBy,
      });
    } catch (error) {
      console.error("Error creating amendment:", error);
      throw new Error("Failed to create amendment record");
    }
  }

  // Create compliance checklist
  private async createComplianceChecklist(
    recordId: string,
    checkedBy: string,
  ): Promise<void> {
    try {
      await db.insert(complianceChecklist).values({
        recordId,
        checkedBy,
        complianceScore: 0,
        isCompliant: false,
      });
    } catch (error) {
      console.error("Error creating compliance checklist:", error);
    }
  }

  // Update compliance checklist
  private async updateComplianceChecklist(
    recordId: string,
    checkedBy: string,
  ): Promise<void> {
    try {
      const compliance = await this.verifyCompliance(recordId, checkedBy);

      await db
        .update(complianceChecklist)
        .set({
          complianceScore: compliance.score,
          isCompliant: compliance.isCompliant,
          checkedBy,
          checkedAt: new Date(),
          notes:
            compliance.issues.length > 0 ? compliance.issues.join("; ") : null,
        })
        .where(eq(complianceChecklist.recordId, recordId));
    } catch (error) {
      console.error("Error updating compliance checklist:", error);
    }
  }

  // Get compliance statistics
  async getComplianceStats(): Promise<{
    totalRecords: number;
    pendingVerification: number;
    approved: number;
    rejected: number;
    expired: number;
    complianceRate: number;
  }> {
    try {
      const records = await db.select().from(form2257Records);

      const stats = {
        totalRecords: records.length,
        pendingVerification: 0,
        approved: 0,
        rejected: 0,
        expired: 0,
        complianceRate: 0,
      };

      const today = new Date();

      records.forEach((record) => {
        const retentionDate = new Date(record.retentionDate);

        if (retentionDate < today) {
          stats.expired++;
        } else {
          switch (record.verificationStatus) {
            case "pending":
              stats.pendingVerification++;
              break;
            case "approved":
              stats.approved++;
              break;
            case "rejected":
              stats.rejected++;
              break;
          }
        }
      });

      stats.complianceRate =
        stats.totalRecords > 0
          ? Math.round(
              (stats.approved / (stats.totalRecords - stats.expired)) * 100,
            )
          : 0;

      return stats;
    } catch (error) {
      console.error("Error getting compliance stats:", error);
      return {
        totalRecords: 0,
        pendingVerification: 0,
        approved: 0,
        rejected: 0,
        expired: 0,
        complianceRate: 0,
      };
    }
  }

  // Export compliance report
  async exportComplianceReport(filters?: any): Promise<{
    records: Form2257Record[];
    summary: any;
    exportDate: string;
  }> {
    try {
      const records = filters
        ? await this.searchRecords(filters)
        : await db.select().from(form2257Records);
      const summary = await this.getComplianceStats();

      return {
        records,
        summary,
        exportDate: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error exporting compliance report:", error);
      throw new Error("Failed to export compliance report");
    }
  }

  // Log compliance-related events
  private async logComplianceEvent(
    userId: string,
    event: string,
    details: any,
  ): Promise<void> {
    try {
      await db.insert(securityAuditLog).values({
        userId,
        event,
        details,
        success: details.success || false,
      });
    } catch (error) {
      console.error("Failed to log compliance event:", error);
    }
  }

  // Cleanup expired records (should be run periodically)
  async cleanupExpiredRecords(): Promise<number> {
    try {
      const today = new Date();

      const expiredRecords = await db
        .select()
        .from(form2257Records)
        .where(lte(form2257Records.retentionDate, today));

      // In a real implementation, you would archive these records
      // rather than delete them, for legal compliance
      console.log(
        `Found ${expiredRecords.length} expired records for archival`,
      );

      return expiredRecords.length;
    } catch (error) {
      console.error("Error during cleanup:", error);
      return 0;
    }
  }
}

export default Compliance2257Service;
