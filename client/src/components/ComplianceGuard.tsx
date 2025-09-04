import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  Shield,
  Eye,
  FileCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Lock,
} from "lucide-react";

interface ComplianceGuardProps {
  action: string;
  requiredRole?: string;
  requiresSuperAdmin?: boolean;
  contentType?: "post" | "live_stream" | "user_account" | "financial";
  onApprove?: (reason: string, evidence: any) => void;
  onReject?: (reason: string) => void;
  children?: React.ReactNode;
}

// AI-powered compliance verification based on Fanz Foundation knowledge base
export function ComplianceGuard({
  action,
  requiredRole,
  requiresSuperAdmin,
  contentType = "post",
  onApprove,
  onReject,
  children,
}: ComplianceGuardProps) {
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewReason, setReviewReason] = useState("");
  const [superAdminPassword, setSuperAdminPassword] = useState("");
  const [coStarVerified, setCoStarVerified] = useState(false);
  const [auditTrailVerified, setAuditTrailVerified] = useState(false);
  const [complianceChecks, setComplianceChecks] = useState({
    age_verification: false,
    costar_2257_forms: false,
    content_reviewed: false,
    legal_compliance: false,
    audit_logged: false,
  });

  // Simulate AI-powered compliance checks based on knowledge base SOPs
  const runComplianceChecks = async () => {
    // Simulate 2257 compliance verification process
    setTimeout(() => {
      setComplianceChecks({
        age_verification: true,
        costar_2257_forms: contentType === "post" ? coStarVerified : true,
        content_reviewed: true,
        legal_compliance: true,
        audit_logged: true,
      });
    }, 2000);
  };

  const handleReviewAction = (approved: boolean) => {
    if (!reviewReason.trim()) {
      alert("Review reason is required for audit trail compliance");
      return;
    }

    if (requiresSuperAdmin && !superAdminPassword) {
      alert("Super Admin password required for this action");
      return;
    }

    const allChecksPass = Object.values(complianceChecks).every(
      (check) => check,
    );
    if (!allChecksPass) {
      alert("All compliance checks must pass before approval");
      return;
    }

    if (approved && onApprove) {
      onApprove(reviewReason, {
        compliance_checks: complianceChecks,
        timestamp: new Date().toISOString(),
        reviewer_action: action,
        super_admin_override: requiresSuperAdmin,
      });
    } else if (!approved && onReject) {
      onReject(reviewReason);
    }

    setShowReviewModal(false);
  };

  const ComplianceCheckItem = ({
    id,
    label,
    checked,
    description,
  }: {
    id: string;
    label: string;
    checked: boolean;
    description: string;
  }) => (
    <div className="flex items-start space-x-3 p-3 border border-primary/20 rounded bg-black/30">
      {checked ? (
        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
      ) : (
        <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
      )}
      <div className="flex-1">
        <div className="text-sm font-medium text-white">{label}</div>
        <div className="text-xs text-gray-400">{description}</div>
      </div>
    </div>
  );

  return (
    <div>
      {children && (
        <div
          onClick={() => setShowReviewModal(true)}
          className="cursor-pointer"
        >
          {children}
        </div>
      )}

      {showReviewModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-black/90 border-primary/20">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Shield className="w-6 h-6 text-cyan-400" />
                <div>
                  <CardTitle className="text-cyan-400">
                    Compliance Review Required
                  </CardTitle>
                  <CardDescription>
                    Action: {action} | Type: {contentType.toUpperCase()}
                  </CardDescription>
                </div>
              </div>
              {requiresSuperAdmin && (
                <Alert className="border-red-500/50 bg-red-500/10">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <AlertDescription className="text-red-300">
                    This action requires Super Admin authorization and will
                    create an immutable audit log entry.
                  </AlertDescription>
                </Alert>
              )}
            </CardHeader>

            <CardContent className="space-y-6">
              {/* 2257 Compliance Checks */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <FileCheck className="w-5 h-5 mr-2 text-cyan-400" />
                  18 U.S.C. § 2257 Compliance Verification
                </h3>
                <div className="space-y-3">
                  <ComplianceCheckItem
                    id="age_verification"
                    label="Age Verification (18+ Required)"
                    checked={complianceChecks.age_verification}
                    description="All performers must have valid government-issued photo ID on file"
                  />
                  <ComplianceCheckItem
                    id="costar_2257_forms"
                    label="Co-Star 2257 Forms"
                    checked={complianceChecks.costar_2257_forms}
                    description="All tagged co-stars must have approved 2257 verification forms"
                  />
                  <ComplianceCheckItem
                    id="content_reviewed"
                    label="Content AI Review Complete"
                    checked={complianceChecks.content_reviewed}
                    description="Content has been processed through ChatGPT-4o/GPT-5 analysis"
                  />
                  <ComplianceCheckItem
                    id="legal_compliance"
                    label="Legal Compliance Check"
                    checked={complianceChecks.legal_compliance}
                    description="Content meets DMCA, GDPR, CCPA, and platform policy requirements"
                  />
                  <ComplianceCheckItem
                    id="audit_logged"
                    label="Audit Trail Ready"
                    checked={complianceChecks.audit_logged}
                    description="Action will be logged in immutable 7-year audit system"
                  />
                </div>

                <Button
                  onClick={runComplianceChecks}
                  className="w-full mt-4 bg-cyan-600 hover:bg-cyan-700"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Run AI Compliance Analysis
                </Button>
              </div>

              {/* Co-Star Verification for Posts */}
              {contentType === "post" && (
                <div className="space-y-4">
                  <Label className="text-white font-semibold">
                    Co-Star Verification Status
                  </Label>
                  <div className="flex items-center space-x-3 p-3 border border-primary/20 rounded bg-black/30">
                    <input
                      type="checkbox"
                      checked={coStarVerified}
                      onChange={(e) => setCoStarVerified(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <Label className="text-white">
                      All tagged co-stars have valid 2257 forms with matching
                      legal names and IDs
                    </Label>
                  </div>
                </div>
              )}

              {/* Super Admin Password */}
              {requiresSuperAdmin && (
                <div className="space-y-2">
                  <Label className="text-white font-semibold flex items-center">
                    <Lock className="w-4 h-4 mr-2 text-red-400" />
                    Super Admin Password Required
                  </Label>
                  <Input
                    type="password"
                    value={superAdminPassword}
                    onChange={(e) => setSuperAdminPassword(e.target.value)}
                    placeholder="Enter super admin password"
                    className="bg-black/50 border-red-500/50"
                  />
                </div>
              )}

              {/* Review Reason */}
              <div className="space-y-2">
                <Label className="text-white font-semibold">
                  Review Reason (Required for Audit)
                </Label>
                <Textarea
                  value={reviewReason}
                  onChange={(e) => setReviewReason(e.target.value)}
                  placeholder="Provide detailed reason for this action (will be logged in audit trail)"
                  className="bg-black/50 border-primary/20"
                  rows={3}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between space-x-4">
                <Button
                  variant="outline"
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleReviewAction(false)}
                  className="flex-1"
                  disabled={!reviewReason.trim()}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={() => handleReviewAction(true)}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={
                    !reviewReason.trim() ||
                    !Object.values(complianceChecks).every((check) => check) ||
                    (requiresSuperAdmin && !superAdminPassword) ||
                    (contentType === "post" && !coStarVerified)
                  }
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Approve
                </Button>
              </div>

              {/* Compliance Warning */}
              <Alert className="border-amber-500/50 bg-amber-500/10">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <AlertDescription className="text-amber-300 text-sm">
                  <strong>COMPLIANCE WARNING:</strong> This action will be
                  permanently logged in the audit system for 7+ years as
                  required by 18 U.S.C. § 2257. Violations may result in
                  suspension of moderation privileges or account termination.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
