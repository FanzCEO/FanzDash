import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shield, FileText, CheckCircle, XCircle, AlertTriangle, Clock, Download, Search, User, Calendar, MapPin, Eye, Lock } from "lucide-react";

// TypeScript Interfaces
interface ComplianceStats {
  totalRecords: number;
  pendingVerifications: number;
  approvedRecords: number;
  rejectedRecords: number;
  expiringDocuments: number;
  complianceRate: number;
  lastAudit?: string;
  nextAudit?: string;
}

interface ComplianceRecord {
  id: string;
  userId: string;
  username: string;
  email: string;
  fullLegalName: string;
  dateOfBirth: string;
  age: number;
  performerStageName?: string;
  status: "pending" | "approved" | "rejected" | "expired" | "under_review";
  verificationLevel: "basic" | "enhanced" | "full_compliance";
  documents: ComplianceDocument[];
  createdAt: string;
  verifiedAt?: string;
  expiresAt?: string;
  verifiedBy?: string;
  jurisdiction: string;
  custodianOfRecords: string;
  aiVerificationScore?: number;
  notes?: string;
}

interface ComplianceDocument {
  id: string;
  type: "government_id" | "passport" | "drivers_license" | "birth_certificate" | "proof_of_address" | "model_release";
  documentNumber: string;
  issuingAuthority: string;
  issuingCountry: string;
  issueDate: string;
  expiryDate?: string;
  status: "pending" | "verified" | "rejected" | "expired";
  fileUrl: string;
  thumbnailUrl?: string;
  aiVerificationResult?: {
    faceMatch: number;
    documentAuthenticity: number;
    ageEstimate: number;
    flags: string[];
  };
  uploadedAt: string;
  verifiedAt?: string;
}

interface AuditLog {
  id: string;
  recordId: string;
  userId: string;
  username: string;
  action: string;
  performedBy: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
}

interface JurisdictionConfig {
  id: string;
  country: string;
  region?: string;
  regulationType: "USC_2257" | "UK_R18" | "EU_AVD" | "AUS_X18" | "OTHER";
  minimumAge: number;
  requiredDocuments: string[];
  retentionPeriod: number;
  custodianRequired: boolean;
  enabled: boolean;
}

interface ComplianceReport {
  id: string;
  reportType: "monthly" | "quarterly" | "annual" | "audit";
  generatedAt: string;
  period: string;
  totalRecords: number;
  compliantRecords: number;
  nonCompliantRecords: number;
  fileUrl: string;
  generatedBy: string;
}

export default function Universal2257System() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("records");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<ComplianceRecord | null>(null);
  const [isRecordDialogOpen, setIsRecordDialogOpen] = useState(false);
  const [isDocumentDialogOpen, setIsDocumentDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<ComplianceDocument | null>(null);

  // Fetch compliance statistics from API
  const { data: complianceStats } = useQuery<ComplianceStats>({
    queryKey: ["/api/compliance/2257/stats"],
    refetchInterval: 30000,
  });

  // Fetch compliance records from API
  const { data: complianceRecords = [], isLoading: recordsLoading } = useQuery<ComplianceRecord[]>({
    queryKey: ["/api/compliance/2257/records", statusFilter, searchQuery],
    refetchInterval: 30000,
  });

  // Fetch audit logs from API
  const { data: auditLogs = [], isLoading: logsLoading } = useQuery<AuditLog[]>({
    queryKey: ["/api/compliance/2257/audit-logs"],
    refetchInterval: 60000,
  });

  // Fetch jurisdiction configurations from API
  const { data: jurisdictions = [], isLoading: jurisdictionsLoading } = useQuery<JurisdictionConfig[]>({
    queryKey: ["/api/compliance/2257/jurisdictions"],
    refetchInterval: 300000,
  });

  // Fetch compliance reports from API
  const { data: reports = [], isLoading: reportsLoading } = useQuery<ComplianceReport[]>({
    queryKey: ["/api/compliance/2257/reports"],
    refetchInterval: 60000,
  });

  // Approve verification mutation
  const approveVerificationMutation = useMutation({
    mutationFn: ({ recordId, notes }: { recordId: string; notes?: string }) =>
      apiRequest(`/api/compliance/2257/records/${recordId}/approve`, "POST", { notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/compliance/2257/records"] });
      queryClient.invalidateQueries({ queryKey: ["/api/compliance/2257/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/compliance/2257/audit-logs"] });
      toast({
        title: "Verification approved",
        description: "The compliance record has been approved",
      });
      setIsRecordDialogOpen(false);
    },
  });

  // Reject verification mutation
  const rejectVerificationMutation = useMutation({
    mutationFn: ({ recordId, reason }: { recordId: string; reason: string }) =>
      apiRequest(`/api/compliance/2257/records/${recordId}/reject`, "POST", { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/compliance/2257/records"] });
      queryClient.invalidateQueries({ queryKey: ["/api/compliance/2257/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/compliance/2257/audit-logs"] });
      toast({
        title: "Verification rejected",
        description: "The compliance record has been rejected",
      });
      setIsRecordDialogOpen(false);
    },
  });

  // Verify document mutation
  const verifyDocumentMutation = useMutation({
    mutationFn: ({ documentId, approved }: { documentId: string; approved: boolean }) =>
      apiRequest(`/api/compliance/2257/documents/${documentId}/verify`, "POST", { approved }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/compliance/2257/records"] });
      queryClient.invalidateQueries({ queryKey: ["/api/compliance/2257/audit-logs"] });
      toast({
        title: "Document verified",
        description: "The document verification has been updated",
      });
    },
  });

  // Generate report mutation
  const generateReportMutation = useMutation({
    mutationFn: ({ reportType, period }: { reportType: string; period: string }) =>
      apiRequest("/api/compliance/2257/reports/generate", "POST", { reportType, period }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/compliance/2257/reports"] });
      toast({
        title: "Report generated",
        description: "The compliance report is being generated",
      });
    },
  });

  // Update jurisdiction mutation
  const updateJurisdictionMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<JurisdictionConfig> }) =>
      apiRequest(`/api/compliance/2257/jurisdictions/${id}`, "PATCH", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/compliance/2257/jurisdictions"] });
      toast({
        title: "Jurisdiction updated",
        description: "Jurisdiction settings have been saved",
      });
    },
  });

  const getStatusBadge = (status: ComplianceRecord["status"]) => {
    const badges = {
      pending: <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>,
      approved: <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>,
      rejected: <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>,
      expired: <Badge variant="outline"><AlertTriangle className="w-3 h-3 mr-1" />Expired</Badge>,
      under_review: <Badge variant="secondary"><Eye className="w-3 h-3 mr-1" />Under Review</Badge>,
    };
    return badges[status];
  };

  const getVerificationLevelBadge = (level: ComplianceRecord["verificationLevel"]) => {
    const badges = {
      basic: <Badge variant="outline">Basic</Badge>,
      enhanced: <Badge variant="secondary">Enhanced</Badge>,
      full_compliance: <Badge variant="default"><Shield className="w-3 h-3 mr-1" />Full Compliance</Badge>,
    };
    return badges[level];
  };

  const getDocumentTypeName = (type: ComplianceDocument["type"]) => {
    const names = {
      government_id: "Government ID",
      passport: "Passport",
      drivers_license: "Driver's License",
      birth_certificate: "Birth Certificate",
      proof_of_address: "Proof of Address",
      model_release: "Model Release Form",
    };
    return names[type];
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Security Warning Banner */}
      <Alert variant="destructive">
        <Shield className="h-4 w-4" />
        <AlertTitle>Restricted Access - 18 U.S.C. § 2257 Compliance System</AlertTitle>
        <AlertDescription>
          This system contains legally protected records. Unauthorized access, disclosure, or tampering is a federal crime.
          All actions are logged and audited. Records must be maintained for 7 years per federal law.
        </AlertDescription>
      </Alert>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="w-8 h-8" />
            Universal 2257 Compliance System
          </h1>
          <p className="text-muted-foreground mt-1">
            Age verification, document management, and regulatory compliance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => generateReportMutation.mutate({ reportType: "audit", period: "current" })}>
            <FileText className="w-4 h-4 mr-2" />
            Generate Audit Report
          </Button>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Export Records
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <FileText className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complianceStats?.totalRecords?.toLocaleString() ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {complianceStats?.approvedRecords?.toLocaleString() ?? 0} approved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complianceStats?.pendingVerifications?.toLocaleString() ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Requires immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
            <CheckCircle className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {complianceStats?.complianceRate ? `${(complianceStats.complianceRate * 100).toFixed(1)}%` : "0%"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {complianceStats?.expiringDocuments ?? 0} expiring soon
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Next Audit</CardTitle>
            <Calendar className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {complianceStats?.nextAudit ? new Date(complianceStats.nextAudit).toLocaleDateString() : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Last: {complianceStats?.lastAudit ? new Date(complianceStats.lastAudit).toLocaleDateString() : "Never"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="records">Verification Records</TabsTrigger>
          <TabsTrigger value="pending">Pending Review</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="jurisdictions">Jurisdictions</TabsTrigger>
        </TabsList>

        {/* Verification Records Tab */}
        <TabsContent value="records" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Compliance Records</CardTitle>
                  <CardDescription>Age verification and document management</CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name or ID"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 w-64"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {recordsLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading records...</div>
              ) : complianceRecords.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No compliance records found</div>
              ) : (
                <div className="space-y-4">
                  {complianceRecords.map((record) => (
                    <div key={record.id} className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <div className="font-semibold">{record.fullLegalName}</div>
                              <div className="text-sm text-muted-foreground">
                                @{record.username}
                                {record.performerStageName && ` • Stage: ${record.performerStageName}`}
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mt-3">
                            <div>
                              <span className="text-muted-foreground">Age:</span>
                              <span className="ml-2 font-medium">{record.age} years</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">DOB:</span>
                              <span className="ml-2 font-medium">{new Date(record.dateOfBirth).toLocaleDateString()}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Jurisdiction:</span>
                              <span className="ml-2 font-medium">{record.jurisdiction}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Documents:</span>
                              <span className="ml-2 font-medium">{record.documents.length}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-3">
                            {getStatusBadge(record.status)}
                            {getVerificationLevelBadge(record.verificationLevel)}
                            {record.aiVerificationScore !== undefined && (
                              <Badge variant="outline">
                                AI Score: {(record.aiVerificationScore * 100).toFixed(0)}%
                              </Badge>
                            )}
                            {record.expiresAt && new Date(record.expiresAt) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) && (
                              <Badge variant="destructive">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Expiring Soon
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedRecord(record);
                            setIsRecordDialogOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Review
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pending Review Tab */}
        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Verifications</CardTitle>
              <CardDescription>Records requiring immediate review</CardDescription>
            </CardHeader>
            <CardContent>
              {recordsLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading pending records...</div>
              ) : complianceRecords.filter(r => r.status === "pending").length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No pending verifications</div>
              ) : (
                <div className="space-y-4">
                  {complianceRecords.filter(r => r.status === "pending").map((record) => (
                    <div key={record.id} className="p-4 border-l-4 border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-semibold">{record.fullLegalName}</div>
                          <div className="text-sm text-muted-foreground">@{record.username}</div>
                          <div className="text-sm mt-2">
                            <span className="text-muted-foreground">Submitted:</span>
                            <span className="ml-2">{new Date(record.createdAt).toLocaleString()}</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">Documents:</span>
                            <span className="ml-2">{record.documents.length} uploaded</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedRecord(record);
                              setIsRecordDialogOpen(true);
                            }}
                          >
                            Review Now
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Log Tab */}
        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audit Trail</CardTitle>
              <CardDescription>Complete history of all compliance actions</CardDescription>
            </CardHeader>
            <CardContent>
              {logsLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading audit logs...</div>
              ) : auditLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No audit logs available</div>
              ) : (
                <div className="space-y-2">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="p-3 border-l-2 border-l-primary bg-accent/30 rounded text-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <span className="font-medium">{log.performedBy}</span>
                          <span className="text-muted-foreground"> {log.action} </span>
                          <span className="font-medium">{log.username}</span>
                          <span className="text-muted-foreground"> • {log.details}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          {log.ipAddress && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {log.ipAddress}
                            </span>
                          )}
                          <span>{new Date(log.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Reports</CardTitle>
              <CardDescription>Generated compliance and audit reports</CardDescription>
            </CardHeader>
            <CardContent>
              {reportsLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading reports...</div>
              ) : reports.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No reports generated yet</div>
              ) : (
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-semibold">{report.reportType.toUpperCase()} Report</div>
                        <div className="text-sm text-muted-foreground">Period: {report.period}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {report.compliantRecords}/{report.totalRecords} compliant • Generated by {report.generatedBy}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(report.generatedAt).toLocaleString()}
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={report.fileUrl} download>
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Jurisdictions Tab */}
        <TabsContent value="jurisdictions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Jurisdiction Settings</CardTitle>
              <CardDescription>Multi-jurisdiction compliance configuration</CardDescription>
            </CardHeader>
            <CardContent>
              {jurisdictionsLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading jurisdictions...</div>
              ) : (
                <div className="space-y-4">
                  {jurisdictions.map((jurisdiction) => (
                    <div key={jurisdiction.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-semibold flex items-center gap-2">
                            {jurisdiction.country}
                            {jurisdiction.region && ` - ${jurisdiction.region}`}
                            {jurisdiction.enabled ? (
                              <Badge variant="default">Active</Badge>
                            ) : (
                              <Badge variant="outline">Inactive</Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            Regulation Type: {jurisdiction.regulationType}
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-sm mt-3">
                            <div>
                              <span className="text-muted-foreground">Minimum Age:</span>
                              <span className="ml-2 font-medium">{jurisdiction.minimumAge} years</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Retention Period:</span>
                              <span className="ml-2 font-medium">{jurisdiction.retentionPeriod} years</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Required Documents:</span>
                              <span className="ml-2 font-medium">{jurisdiction.requiredDocuments.length}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Custodian Required:</span>
                              <span className="ml-2 font-medium">{jurisdiction.custodianRequired ? "Yes" : "No"}</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            updateJurisdictionMutation.mutate({
                              id: jurisdiction.id,
                              data: { enabled: !jurisdiction.enabled },
                            });
                          }}
                        >
                          {jurisdiction.enabled ? "Disable" : "Enable"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Record Review Dialog */}
      <Dialog open={isRecordDialogOpen} onOpenChange={setIsRecordDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Compliance Record Review
            </DialogTitle>
            <DialogDescription>Protected by 18 U.S.C. § 2257</DialogDescription>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-6">
              {/* Personal Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Full Legal Name</Label>
                  <div className="font-medium">{selectedRecord.fullLegalName}</div>
                </div>
                <div>
                  <Label>Stage Name</Label>
                  <div className="font-medium">{selectedRecord.performerStageName || "N/A"}</div>
                </div>
                <div>
                  <Label>Date of Birth</Label>
                  <div className="font-medium">{new Date(selectedRecord.dateOfBirth).toLocaleDateString()}</div>
                </div>
                <div>
                  <Label>Current Age</Label>
                  <div className="font-medium">{selectedRecord.age} years</div>
                </div>
                <div>
                  <Label>Username</Label>
                  <div className="font-medium">@{selectedRecord.username}</div>
                </div>
                <div>
                  <Label>Email</Label>
                  <div className="font-medium">{selectedRecord.email}</div>
                </div>
                <div>
                  <Label>Jurisdiction</Label>
                  <div className="font-medium">{selectedRecord.jurisdiction}</div>
                </div>
                <div>
                  <Label>Custodian of Records</Label>
                  <div className="font-medium">{selectedRecord.custodianOfRecords}</div>
                </div>
              </div>

              {/* Status Information */}
              <div className="flex items-center gap-3">
                {getStatusBadge(selectedRecord.status)}
                {getVerificationLevelBadge(selectedRecord.verificationLevel)}
                {selectedRecord.aiVerificationScore !== undefined && (
                  <Badge variant="outline">
                    AI Verification: {(selectedRecord.aiVerificationScore * 100).toFixed(1)}%
                  </Badge>
                )}
              </div>

              {/* Documents */}
              <div>
                <Label className="text-base">Uploaded Documents ({selectedRecord.documents.length})</Label>
                <div className="space-y-3 mt-3">
                  {selectedRecord.documents.map((doc) => (
                    <div key={doc.id} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium">{getDocumentTypeName(doc.type)}</div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {doc.documentNumber} • {doc.issuingAuthority}, {doc.issuingCountry}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Issued: {new Date(doc.issueDate).toLocaleDateString()}
                            {doc.expiryDate && ` • Expires: ${new Date(doc.expiryDate).toLocaleDateString()}`}
                          </div>
                          {doc.aiVerificationResult && (
                            <div className="text-xs text-muted-foreground mt-2 space-y-1">
                              <div>Face Match: {(doc.aiVerificationResult.faceMatch * 100).toFixed(1)}%</div>
                              <div>Authenticity: {(doc.aiVerificationResult.documentAuthenticity * 100).toFixed(1)}%</div>
                              <div>Age Estimate: {doc.aiVerificationResult.ageEstimate} years</div>
                              {doc.aiVerificationResult.flags.length > 0 && (
                                <div className="text-destructive">Flags: {doc.aiVerificationResult.flags.join(", ")}</div>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {doc.status === "pending" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => verifyDocumentMutation.mutate({ documentId: doc.id, approved: true })}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => verifyDocumentMutation.mutate({ documentId: doc.id, approved: false })}
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          {doc.status === "verified" && <Badge variant="default">Verified</Badge>}
                          {doc.status === "rejected" && <Badge variant="destructive">Rejected</Badge>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              {selectedRecord.notes && (
                <div>
                  <Label>Notes</Label>
                  <div className="text-sm text-muted-foreground mt-1">{selectedRecord.notes}</div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            {selectedRecord?.status === "pending" && (
              <>
                <Button variant="outline" onClick={() => setIsRecordDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    const reason = prompt("Enter rejection reason:");
                    if (reason && selectedRecord) {
                      rejectVerificationMutation.mutate({ recordId: selectedRecord.id, reason });
                    }
                  }}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button
                  variant="default"
                  onClick={() => {
                    if (selectedRecord) {
                      const notes = prompt("Add verification notes (optional):");
                      approveVerificationMutation.mutate({ recordId: selectedRecord.id, notes: notes || undefined });
                    }
                  }}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
