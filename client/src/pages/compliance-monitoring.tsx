import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Shield,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Eye,
  Download,
  Upload,
  Flag,
  Scale,
  Globe,
  User,
  Calendar,
  BarChart3,
  TrendingUp,
  Activity,
  Lock,
  Key,
  FileCheck,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  Users,
  CreditCard,
  Database,
  Zap,
} from "lucide-react";

interface ComplianceRecord {
  id: string;
  recordType:
    | "2257"
    | "gdpr"
    | "ccpa"
    | "age_verification"
    | "content_labeling"
    | "terms_agreement";
  userId: string;
  username: string;
  platform: string;
  status: "compliant" | "pending" | "expired" | "missing" | "invalid";
  documentUrl?: string;
  verificationDate: string;
  expiryDate?: string;
  verifiedBy: string;
  notes?: string;
  region: string;
  riskLevel: "low" | "medium" | "high" | "critical";
}

interface ComplianceRule {
  id: string;
  name: string;
  description: string;
  jurisdiction: string;
  category:
    | "age_verification"
    | "data_privacy"
    | "content_regulation"
    | "financial_compliance"
    | "platform_safety";
  isActive: boolean;
  severity: "low" | "medium" | "high" | "critical";
  autoEnforcement: boolean;
  lastUpdated: string;
  nextReview: string;
}

interface ComplianceAudit {
  id: string;
  auditType: "internal" | "external" | "regulatory" | "automated";
  platform: string;
  startDate: string;
  endDate: string;
  status: "in_progress" | "completed" | "failed" | "scheduled";
  findings: number;
  criticalIssues: number;
  auditor: string;
  complianceScore: number;
}

export default function ComplianceMonitoring() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Mock compliance records
  const complianceRecords: ComplianceRecord[] = [
    {
      id: "rec_001",
      recordType: "2257",
      userId: "user_001",
      username: "sarah_model",
      platform: "GirlFanz",
      status: "compliant",
      documentUrl: "/documents/2257_sarah_model.pdf",
      verificationDate: "2025-01-01T00:00:00Z",
      expiryDate: "2025-12-31T23:59:59Z",
      verifiedBy: "compliance_officer_001",
      notes: "Age verification documents verified, model over 21",
      region: "US",
      riskLevel: "low",
    },
    {
      id: "rec_002",
      recordType: "age_verification",
      userId: "user_002",
      username: "alex_creator",
      platform: "BoyFanz",
      status: "pending",
      verificationDate: "2025-01-15T10:00:00Z",
      verifiedBy: "ai_verification",
      notes: "Automated age verification in progress",
      region: "CA",
      riskLevel: "medium",
    },
    {
      id: "rec_003",
      recordType: "gdpr",
      userId: "user_003",
      username: "maya_performer",
      platform: "FanzLab",
      status: "compliant",
      verificationDate: "2025-01-10T15:30:00Z",
      expiryDate: "2026-01-10T15:30:00Z",
      verifiedBy: "gdpr_compliance_bot",
      notes: "GDPR consent recorded and verified",
      region: "EU",
      riskLevel: "low",
    },
    {
      id: "rec_004",
      recordType: "ccpa",
      userId: "user_004",
      username: "jenny_cam",
      platform: "CougarFanz",
      status: "expired",
      verificationDate: "2024-06-01T00:00:00Z",
      expiryDate: "2025-01-01T00:00:00Z",
      verifiedBy: "compliance_officer_002",
      notes: "CCPA consent expired, requires renewal",
      region: "CA-US",
      riskLevel: "high",
    },
    {
      id: "rec_005",
      recordType: "content_labeling",
      userId: "user_005",
      username: "extreme_creator",
      platform: "TabooFanz",
      status: "missing",
      verificationDate: "2025-01-01T00:00:00Z",
      verifiedBy: "content_review_team",
      notes: "Adult content labeling requirements not met",
      region: "US",
      riskLevel: "critical",
    },
  ];

  // Mock compliance rules
  const complianceRules: ComplianceRule[] = [
    {
      id: "rule_001",
      name: "USC 2257 Record Keeping",
      description:
        "Federal requirement for age verification records for adult content creators",
      jurisdiction: "United States",
      category: "age_verification",
      isActive: true,
      severity: "critical",
      autoEnforcement: true,
      lastUpdated: "2025-01-01T00:00:00Z",
      nextReview: "2025-07-01T00:00:00Z",
    },
    {
      id: "rule_002",
      name: "GDPR Data Processing",
      description:
        "European Union General Data Protection Regulation compliance",
      jurisdiction: "European Union",
      category: "data_privacy",
      isActive: true,
      severity: "high",
      autoEnforcement: true,
      lastUpdated: "2025-01-01T00:00:00Z",
      nextReview: "2025-06-01T00:00:00Z",
    },
    {
      id: "rule_003",
      name: "CCPA Consumer Privacy",
      description:
        "California Consumer Privacy Act data protection requirements",
      jurisdiction: "California",
      category: "data_privacy",
      isActive: true,
      severity: "high",
      autoEnforcement: true,
      lastUpdated: "2025-01-01T00:00:00Z",
      nextReview: "2025-08-01T00:00:00Z",
    },
    {
      id: "rule_004",
      name: "Content Labeling Standards",
      description: "Adult content must be properly labeled and age-gated",
      jurisdiction: "Global",
      category: "content_regulation",
      isActive: true,
      severity: "medium",
      autoEnforcement: true,
      lastUpdated: "2025-01-01T00:00:00Z",
      nextReview: "2025-04-01T00:00:00Z",
    },
    {
      id: "rule_005",
      name: "Payment Card Industry DSS",
      description: "PCI DSS compliance for payment card data handling",
      jurisdiction: "Global",
      category: "financial_compliance",
      isActive: true,
      severity: "critical",
      autoEnforcement: false,
      lastUpdated: "2025-01-01T00:00:00Z",
      nextReview: "2025-03-01T00:00:00Z",
    },
  ];

  // Mock compliance audits
  const complianceAudits: ComplianceAudit[] = [
    {
      id: "audit_001",
      auditType: "automated",
      platform: "All",
      startDate: "2025-01-15T00:00:00Z",
      endDate: "2025-01-15T23:59:59Z",
      status: "completed",
      findings: 23,
      criticalIssues: 2,
      auditor: "automated_compliance_system",
      complianceScore: 94,
    },
    {
      id: "audit_002",
      auditType: "internal",
      platform: "GirlFanz",
      startDate: "2025-01-10T00:00:00Z",
      endDate: "2025-01-12T23:59:59Z",
      status: "completed",
      findings: 8,
      criticalIssues: 1,
      auditor: "compliance_team",
      complianceScore: 97,
    },
    {
      id: "audit_003",
      auditType: "external",
      platform: "All",
      startDate: "2025-01-01T00:00:00Z",
      endDate: "2025-01-31T23:59:59Z",
      status: "in_progress",
      findings: 0,
      criticalIssues: 0,
      auditor: "external_compliance_firm",
      complianceScore: 0,
    },
    {
      id: "audit_004",
      auditType: "regulatory",
      platform: "TabooFanz",
      startDate: "2025-01-20T00:00:00Z",
      endDate: "2025-01-25T23:59:59Z",
      status: "scheduled",
      findings: 0,
      criticalIssues: 0,
      auditor: "regulatory_authority",
      complianceScore: 0,
    },
  ];

  const handleUpdateComplianceStatus = useMutation({
    mutationFn: ({ recordId, status }: { recordId: string; status: string }) =>
      apiRequest(`/api/compliance/${recordId}/status`, "POST", { status }),
    onSuccess: (_, { recordId, status }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/compliance"] });
      const record = complianceRecords.find((r) => r.id === recordId);
      toast({
        title: "Compliance status updated",
        description: `${record?.username} compliance status updated to ${status}`,
      });
    },
  });

  const handleGenerateReport = useMutation({
    mutationFn: (platform: string) =>
      apiRequest("/api/compliance/report", "POST", { platform }),
    onSuccess: () => {
      toast({
        title: "Compliance report generated",
        description: "Report has been generated and is ready for download",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      compliant: "bg-green-600",
      pending: "bg-yellow-600",
      expired: "bg-orange-600",
      missing: "bg-red-600",
      invalid: "bg-red-700",
    } as const;

    return (
      <Badge
        className={variants[status as keyof typeof variants] || "bg-gray-600"}
      >
        {status.toUpperCase()}
      </Badge>
    );
  };

  const getRiskBadge = (risk: string) => {
    const variants = {
      low: "bg-green-700",
      medium: "bg-yellow-700",
      high: "bg-orange-700",
      critical: "bg-red-700",
    } as const;

    return (
      <Badge
        className={variants[risk as keyof typeof variants] || "bg-gray-600"}
      >
        {risk.toUpperCase()}
      </Badge>
    );
  };

  const getSeverityBadge = (severity: string) => {
    const variants = {
      low: "bg-blue-600",
      medium: "bg-yellow-600",
      high: "bg-orange-600",
      critical: "bg-red-600",
    } as const;

    return (
      <Badge
        className={variants[severity as keyof typeof variants] || "bg-gray-600"}
      >
        {severity.toUpperCase()}
      </Badge>
    );
  };

  const getAuditStatusBadge = (status: string) => {
    const variants = {
      in_progress: "bg-blue-600",
      completed: "bg-green-600",
      failed: "bg-red-600",
      scheduled: "bg-yellow-600",
    } as const;

    return (
      <Badge
        className={variants[status as keyof typeof variants] || "bg-gray-600"}
      >
        {status.replace("_", " ").toUpperCase()}
      </Badge>
    );
  };

  const filteredRecords = complianceRecords.filter((record) => {
    const matchesPlatform =
      selectedPlatform === "all" || record.platform === selectedPlatform;
    const matchesStatus =
      selectedStatus === "all" || record.status === selectedStatus;
    const matchesSearch =
      !searchQuery ||
      record.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.recordType.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesPlatform && matchesStatus && matchesSearch;
  });

  const stats = {
    totalRecords: complianceRecords.length,
    compliantRecords: complianceRecords.filter((r) => r.status === "compliant")
      .length,
    pendingRecords: complianceRecords.filter((r) => r.status === "pending")
      .length,
    criticalIssues: complianceRecords.filter((r) => r.riskLevel === "critical")
      .length,
  };

  return (
    <div className="min-h-screen cyber-bg">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold cyber-text-glow">
              Real-time Compliance Monitoring
            </h1>
            <p className="text-muted-foreground">
              Monitor 2257 records, GDPR/CCPA compliance, age verification
              across all platforms
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => handleGenerateReport.mutate("all")}
              disabled={handleGenerateReport.isPending}
              data-testid="button-generate-report"
            >
              <Download className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
            <Button variant="outline" data-testid="button-refresh-compliance">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gray-900/50 border-cyan-500/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FileCheck className="h-8 w-8 text-cyan-400" />
                <div>
                  <p className="text-sm font-medium">Total Records</p>
                  <p className="text-2xl font-bold text-cyan-400">
                    {stats.totalRecords}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-green-500/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-8 w-8 text-green-400" />
                <div>
                  <p className="text-sm font-medium">Compliant</p>
                  <p className="text-2xl font-bold text-green-400">
                    {stats.compliantRecords}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-yellow-500/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-8 w-8 text-yellow-400" />
                <div>
                  <p className="text-sm font-medium">Pending</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {stats.pendingRecords}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-red-500/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-8 w-8 text-red-400" />
                <div>
                  <p className="text-sm font-medium">Critical Issues</p>
                  <p className="text-2xl font-bold text-red-400">
                    {stats.criticalIssues}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="records" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="records">Compliance Records</TabsTrigger>
            <TabsTrigger value="rules">Compliance Rules</TabsTrigger>
            <TabsTrigger value="audits">Audit Reports</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          </TabsList>

          <TabsContent value="records" className="space-y-6">
            <Card className="bg-gray-900/50 border-cyan-500/20">
              <CardHeader>
                <CardTitle className="text-cyan-400">
                  Compliance Records
                </CardTitle>
                <CardDescription>
                  Monitor individual compliance records and verification status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search records..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-gray-800 border-gray-700"
                      data-testid="input-compliance-search"
                    />
                  </div>

                  <Select
                    value={selectedPlatform}
                    onValueChange={setSelectedPlatform}
                  >
                    <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Filter by platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Platforms</SelectItem>
                      <SelectItem value="FanzLab">FanzLab</SelectItem>
                      <SelectItem value="BoyFanz">BoyFanz</SelectItem>
                      <SelectItem value="GirlFanz">GirlFanz</SelectItem>
                      <SelectItem value="DaddyFanz">DaddyFanz</SelectItem>
                      <SelectItem value="TabooFanz">TabooFanz</SelectItem>
                      <SelectItem value="CougarFanz">CougarFanz</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={selectedStatus}
                    onValueChange={setSelectedStatus}
                  >
                    <SelectTrigger className="w-[150px] bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="compliant">Compliant</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                      <SelectItem value="missing">Missing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="border rounded-lg bg-gray-800/50">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Record Type</TableHead>
                        <TableHead>Platform</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Risk Level</TableHead>
                        <TableHead>Verification Date</TableHead>
                        <TableHead>Expiry</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium text-white">
                                {record.username}
                              </p>
                              <p className="text-xs text-gray-400">
                                {record.region}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="uppercase">
                              {record.recordType}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{record.platform}</Badge>
                          </TableCell>
                          <TableCell>{getStatusBadge(record.status)}</TableCell>
                          <TableCell>
                            {getRiskBadge(record.riskLevel)}
                          </TableCell>
                          <TableCell className="text-sm">
                            {new Date(
                              record.verificationDate,
                            ).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-sm">
                            {record.expiryDate ? (
                              <span
                                className={
                                  new Date(record.expiryDate) < new Date()
                                    ? "text-red-400"
                                    : "text-gray-400"
                                }
                              >
                                {new Date(
                                  record.expiryDate,
                                ).toLocaleDateString()}
                              </span>
                            ) : (
                              <span className="text-gray-400">N/A</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                data-testid={`button-view-${record.id}`}
                              >
                                <Eye className="w-3 h-3" />
                              </Button>
                              {record.documentUrl && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  data-testid={`button-download-${record.id}`}
                                >
                                  <Download className="w-3 h-3" />
                                </Button>
                              )}
                              {record.status === "pending" && (
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    handleUpdateComplianceStatus.mutate({
                                      recordId: record.id,
                                      status: "compliant",
                                    })
                                  }
                                  disabled={
                                    handleUpdateComplianceStatus.isPending
                                  }
                                  className="bg-green-600 hover:bg-green-700"
                                  data-testid={`button-approve-${record.id}`}
                                >
                                  <CheckCircle className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rules" className="space-y-6">
            <Card className="bg-gray-900/50 border-cyan-500/20">
              <CardHeader>
                <CardTitle className="text-cyan-400">
                  Compliance Rules
                </CardTitle>
                <CardDescription>
                  Manage regulatory compliance rules and enforcement policies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {complianceRules.map((rule) => (
                    <Card key={rule.id} className="bg-gray-800/50">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-white">
                                {rule.name}
                              </h3>
                              {getSeverityBadge(rule.severity)}
                              {rule.autoEnforcement && (
                                <Badge className="bg-blue-600">
                                  <Zap className="w-3 h-3 mr-1" />
                                  Auto
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-400 mb-2">
                              {rule.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-gray-400">
                              <span>
                                <Globe className="w-3 h-3 inline mr-1" />
                                {rule.jurisdiction}
                              </span>
                              <span>
                                <Calendar className="w-3 h-3 inline mr-1" />
                                Review:{" "}
                                {new Date(rule.nextReview).toLocaleDateString()}
                              </span>
                              <span className="capitalize">
                                {rule.category.replace("_", " ")}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {rule.isActive ? (
                              <Badge className="bg-green-600">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Active
                              </Badge>
                            ) : (
                              <Badge className="bg-gray-600">
                                <XCircle className="w-3 h-3 mr-1" />
                                Inactive
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audits" className="space-y-6">
            <Card className="bg-gray-900/50 border-cyan-500/20">
              <CardHeader>
                <CardTitle className="text-cyan-400">
                  Compliance Audits
                </CardTitle>
                <CardDescription>
                  Track compliance audit schedules, progress, and results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg bg-gray-800/50">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Audit Type</TableHead>
                        <TableHead>Platform</TableHead>
                        <TableHead>Period</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Findings</TableHead>
                        <TableHead>Critical</TableHead>
                        <TableHead>Auditor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {complianceAudits.map((audit) => (
                        <TableRow key={audit.id}>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {audit.auditType.replace("_", " ")}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{audit.platform}</Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {new Date(audit.startDate).toLocaleDateString()} -{" "}
                            {new Date(audit.endDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {getAuditStatusBadge(audit.status)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {audit.complianceScore > 0 && (
                                <>
                                  <Progress
                                    value={audit.complianceScore}
                                    className="w-16 h-2"
                                  />
                                  <span className="text-sm font-mono">
                                    {audit.complianceScore}%
                                  </span>
                                </>
                              )}
                              {audit.complianceScore === 0 && (
                                <span className="text-gray-400 text-sm">
                                  N/A
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-center">
                              <p className="text-sm font-mono text-blue-400">
                                {audit.findings}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-center">
                              <p
                                className={`text-sm font-mono ${audit.criticalIssues > 0 ? "text-red-400" : "text-green-400"}`}
                              >
                                {audit.criticalIssues}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-gray-400">
                            {audit.auditor.replace("_", " ")}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gray-900/50 border-cyan-500/20">
                <CardHeader>
                  <CardTitle className="text-cyan-400">
                    Compliance Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">
                        Overall Compliance Rate
                      </span>
                      <div className="flex items-center gap-2">
                        <Progress value={85} className="w-20 h-2" />
                        <span className="text-sm font-mono text-green-400">
                          85%
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">
                        2257 Records
                      </span>
                      <div className="flex items-center gap-2">
                        <Progress value={92} className="w-20 h-2" />
                        <span className="text-sm font-mono text-green-400">
                          92%
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">
                        GDPR Compliance
                      </span>
                      <div className="flex items-center gap-2">
                        <Progress value={88} className="w-20 h-2" />
                        <span className="text-sm font-mono text-green-400">
                          88%
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">
                        Age Verification
                      </span>
                      <div className="flex items-center gap-2">
                        <Progress value={96} className="w-20 h-2" />
                        <span className="text-sm font-mono text-green-400">
                          96%
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-cyan-500/20">
                <CardHeader>
                  <CardTitle className="text-cyan-400">
                    Risk Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-green-900/30 rounded-lg">
                      <p className="text-2xl font-bold text-green-400">
                        {stats.compliantRecords}
                      </p>
                      <p className="text-sm text-green-300">Low Risk</p>
                    </div>
                    <div className="text-center p-4 bg-yellow-900/30 rounded-lg">
                      <p className="text-2xl font-bold text-yellow-400">
                        {stats.pendingRecords}
                      </p>
                      <p className="text-sm text-yellow-300">Medium Risk</p>
                    </div>
                    <div className="text-center p-4 bg-orange-900/30 rounded-lg">
                      <p className="text-2xl font-bold text-orange-400">3</p>
                      <p className="text-sm text-orange-300">High Risk</p>
                    </div>
                    <div className="text-center p-4 bg-red-900/30 rounded-lg">
                      <p className="text-2xl font-bold text-red-400">
                        {stats.criticalIssues}
                      </p>
                      <p className="text-sm text-red-300">Critical Risk</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gray-900/50 border-cyan-500/20">
              <CardHeader>
                <CardTitle className="text-cyan-400">
                  Compliance Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="w-16 h-16 mx-auto mb-4 text-cyan-400" />
                  <p className="text-lg font-medium text-white mb-2">
                    Compliance Analytics Dashboard
                  </p>
                  <p className="text-gray-400">
                    Real-time compliance monitoring and trend analysis across
                    all Fanz™ platforms
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
