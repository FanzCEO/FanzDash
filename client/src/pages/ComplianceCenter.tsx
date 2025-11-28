import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ComplianceBot } from "@/components/ComplianceBot";
import { Button } from "@/components/ui/button";
import {
  Shield,
  AlertTriangle,
  Scale,
  Eye,
  Users,
  FileText,
  Gavel,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

interface ComplianceStatus {
  totalEvents: number;
  blockedActions: number;
  pendingApprovals: number;
  escalations: number;
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
    critical: number;
    immediateBlock: number;
  };
}

interface ApprovalRequest {
  id: string;
  action: string;
  userId: string;
  riskLevel: string;
  violations: string[];
}

interface ApprovalData {
  approvals: ApprovalRequest[];
}

export default function ComplianceCenter() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { data: complianceStatus } = useQuery<ComplianceStatus>({
    queryKey: ["/api/compliance/status"],
    refetchInterval: 5000,
  });

  const { data: approvalData } = useQuery<ApprovalData>({
    queryKey: ["/api/compliance/approvals"],
    refetchInterval: 10000,
  });

  const queryClient = useQueryClient();

  const approveRequestMutation = useMutation({
    mutationFn: (requestId: string) =>
      apiRequest(`/api/compliance/approvals/${requestId}/approve`, "POST"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/compliance/approvals"] });
      toast({ title: "Request approved", description: "Action has been approved successfully" });
    },
  });

  const denyRequestMutation = useMutation({
    mutationFn: (requestId: string) =>
      apiRequest(`/api/compliance/approvals/${requestId}/deny`, "POST"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/compliance/approvals"] });
      toast({ title: "Request denied", description: "Action has been denied", variant: "destructive" });
    },
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            🛡️ Legal Compliance Center
          </h1>
          <p className="text-gray-400">
            Military-grade compliance monitoring and violation prevention for
            Fanz™ Unlimited Network LLC
          </p>
        </div>
        <Badge
          variant="destructive"
          className="bg-red-900/50 text-red-300 border-red-600"
        >
          <Eye className="h-4 w-4 mr-2" />
          Active Monitoring
        </Badge>
      </div>

      {/* Real-time Status Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-900 border-green-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
              Clean Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">
              {complianceStatus
                ? complianceStatus.totalEvents - complianceStatus.blockedActions
                : 0}
            </div>
            <p className="text-xs text-gray-500">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-red-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center">
              <XCircle className="h-4 w-4 mr-2 text-red-500" />
              Blocked Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">
              {complianceStatus?.blockedActions || 0}
            </div>
            <p className="text-xs text-gray-500">Prevented violations</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-orange-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center">
              <Clock className="h-4 w-4 mr-2 text-orange-500" />
              Pending Approvals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-400">
              {complianceStatus?.pendingApprovals || 0}
            </div>
            <p className="text-xs text-gray-500">Awaiting review</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-purple-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2 text-purple-500" />
              Escalations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-400">
              {complianceStatus?.escalations || 0}
            </div>
            <p className="text-xs text-gray-500">Critical incidents</p>
          </CardContent>
        </Card>
      </div>

      {/* Risk Level Distribution */}
      {complianceStatus && (
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Risk Level Distribution (24h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {complianceStatus.riskDistribution.low}
                </div>
                <div className="text-sm text-gray-400">Low Risk</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">
                  {complianceStatus.riskDistribution.medium}
                </div>
                <div className="text-sm text-gray-400">Medium Risk</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400">
                  {complianceStatus.riskDistribution.high}
                </div>
                <div className="text-sm text-gray-400">High Risk</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">
                  {complianceStatus.riskDistribution.critical}
                </div>
                <div className="text-sm text-gray-400">Critical</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {complianceStatus.riskDistribution.immediateBlock}
                </div>
                <div className="text-sm text-gray-400">Blocked</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Layout: Compliance Bot + Approval Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compliance Bot */}
        <Card className="bg-gray-900 border-red-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Shield className="h-5 w-5 mr-2 text-red-500" />
              FanzLegal AI Guardian
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[500px]">
              <ComplianceBot isFloating={false} />
            </div>
          </CardContent>
        </Card>

        {/* Approval Queue */}
        <Card className="bg-gray-900 border-orange-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Clock className="h-5 w-5 mr-2 text-orange-500" />
              Approval Queue
            </CardTitle>
          </CardHeader>
          <CardContent>
            {approvalData && approvalData.approvals.length > 0 ? (
              <div className="space-y-4">
                {approvalData.approvals.map((approval: any) => (
                  <Card
                    key={approval.id}
                    className="bg-gray-800 border-orange-700"
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-semibold text-white">
                            {approval.action}
                          </div>
                          <div className="text-sm text-gray-400">
                            User: {approval.userId}
                          </div>
                        </div>
                        <Badge
                          variant={
                            approval.riskLevel === "critical"
                              ? "destructive"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {approval.riskLevel.toUpperCase()}
                        </Badge>
                      </div>

                      {approval.violations.length > 0 && (
                        <div className="mb-3">
                          <div className="text-sm text-gray-400 mb-1">
                            Violations:
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {approval.violations.map((violation: string) => (
                              <Badge
                                key={violation}
                                variant="outline"
                                className="text-xs"
                              >
                                {violation.replace("_", " ")}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-green-600 text-green-400"
                          onClick={() => approveRequestMutation.mutate(approval.id)}
                          disabled={approveRequestMutation.isPending}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-600 text-red-400"
                          onClick={() => denyRequestMutation.mutate(approval.id)}
                          disabled={denyRequestMutation.isPending}
                        >
                          Deny
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <div className="text-white font-semibold mb-2">
                  No Pending Approvals
                </div>
                <div className="text-gray-400 text-sm">
                  All actions are compliant
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Legal Reference Quick Access */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Legal Reference Quick Access
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="border-blue-600 text-blue-400 hover:bg-blue-600/10"
              size="sm"
              onClick={() => setLocation("/universal-2257")}
            >
              <Scale className="h-4 w-4 mr-2" />
              18 U.S.C. § 2257
            </Button>
            <Button
              variant="outline"
              className="border-purple-600 text-purple-400 hover:bg-purple-600/10"
              size="sm"
              onClick={() => setLocation("/legal-library")}
            >
              <Gavel className="h-4 w-4 mr-2" />
              DMCA Guidelines
            </Button>
            <Button
              variant="outline"
              className="border-green-600 text-green-400 hover:bg-green-600/10"
              size="sm"
              onClick={() => setLocation("/compliance-monitoring")}
            >
              <Shield className="h-4 w-4 mr-2" />
              GDPR Compliance
            </Button>
            <Button
              variant="outline"
              className="border-orange-600 text-orange-400 hover:bg-orange-600/10"
              size="sm"
              onClick={() => setLocation("/legal-library")}
            >
              <Users className="h-4 w-4 mr-2" />
              Platform Policies
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contacts */}
      <Card className="bg-red-950 border-red-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
            Emergency Legal Contacts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="font-semibold text-white mb-1">
                Legal Department
              </div>
              <div className="text-red-300">legal@fanzunlimited.com</div>
              <div className="text-gray-400">For all legal matters</div>
            </div>
            <div>
              <div className="font-semibold text-white mb-1">
                Compliance Team
              </div>
              <div className="text-red-300">compliance@fanzunlimited.com</div>
              <div className="text-gray-400">Regulatory compliance</div>
            </div>
            <div>
              <div className="font-semibold text-white mb-1">
                Crisis Management
              </div>
              <div className="text-red-300">crisis@fanzunlimited.com</div>
              <div className="text-gray-400">Emergency incidents</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
