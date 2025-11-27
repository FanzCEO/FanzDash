import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Shield,
  AlertTriangle,
  Ban,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  Upload,
  Copy,
  Trash2,
  Lock,
  Unlock,
  FileText,
  Users,
  Activity,
  TrendingUp,
  Bell,
  Settings,
  Filter,
  Search,
  Clock,
  MapPin,
  Monitor,
  Database,
  FileWarning,
  ShieldAlert,
  ShieldCheck,
  UserX,
  Zap,
  Target,
  GitBranch,
  Archive,
  Plus,
  Edit,
} from "lucide-react";

interface DLPAlert {
  id: string;
  timestamp: string;
  severity: "critical" | "high" | "medium" | "low";
  status: "active" | "investigating" | "resolved" | "false_positive";
  alertType: "unauthorized_download" | "mass_download" | "suspicious_copy" | "unusual_access" | "policy_violation" | "data_exfiltration" | "insider_threat";
  userId: string;
  userName: string;
  userEmail: string;
  resourceType: string;
  resourceName: string;
  resourceId: string;
  action: string;
  description: string;
  riskScore: number;
  policyViolated?: string;
  detectionMethod: "rule_based" | "ml_based" | "pattern_match" | "anomaly_detection";
  ipAddress: string;
  device: string;
  location?: string;
  dataClassification: "public" | "internal" | "confidential" | "restricted";
  automaticActions: string[];
  assignedTo?: string;
  notes?: string[];
}

interface DLPPolicy {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  severity: "critical" | "high" | "medium" | "low";
  scope: "all_users" | "specific_users" | "specific_groups" | "external_only";
  conditions: PolicyCondition[];
  actions: PolicyAction[];
  dataClassifications: string[];
  excludedUsers: string[];
  createdDate: string;
  modifiedDate: string;
  createdBy: string;
  triggeredCount: number;
  lastTriggered?: string;
}

interface PolicyCondition {
  id: string;
  type: "file_type" | "file_size" | "download_count" | "time_based" | "location" | "device" | "content_match" | "custom";
  operator: "equals" | "contains" | "greater_than" | "less_than" | "regex" | "in_list";
  value: any;
  logic: "and" | "or";
}

interface PolicyAction {
  id: string;
  type: "block" | "warn" | "log" | "quarantine" | "encrypt" | "notify_admin" | "notify_user" | "require_justification";
  parameters?: Record<string, any>;
}

interface DataClassification {
  id: string;
  name: string;
  level: "public" | "internal" | "confidential" | "restricted";
  description: string;
  color: string;
  icon: string;
  retentionPeriod?: number;
  requiresEncryption: boolean;
  allowExternalSharing: boolean;
  allowDownload: boolean;
  allowPrint: boolean;
  allowCopy: boolean;
  watermarkRequired: boolean;
  rules: ClassificationRule[];
}

interface ClassificationRule {
  id: string;
  type: "keyword" | "regex" | "file_extension" | "metadata" | "ml_classification";
  pattern: string;
  confidence: number;
}

interface QuarantinedFile {
  id: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  userId: string;
  userName: string;
  quarantineReason: string;
  quarantineDate: string;
  alertId: string;
  reviewStatus: "pending" | "approved" | "denied";
  reviewedBy?: string;
  reviewedDate?: string;
  reviewNotes?: string;
  expiresDate?: string;
  canRestore: boolean;
}

interface UserRiskProfile {
  userId: string;
  userName: string;
  userEmail: string;
  department: string;
  riskScore: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  alerts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  suspiciousActivities: number;
  dataAccessed: number;
  filesDownloaded: number;
  policyViolations: number;
  lastActivity: string;
  accountStatus: "active" | "suspended" | "monitoring" | "restricted";
  watchlisted: boolean;
  notes?: string;
}

interface DLPStatistics {
  totalAlerts: number;
  activeAlerts: number;
  resolvedAlerts: number;
  criticalAlerts: number;
  blockedAttempts: number;
  quarantinedFiles: number;
  averageRiskScore: number;
  topThreats: { type: string; count: number }[];
  topUsers: { userId: string; userName: string; alertCount: number }[];
  alertsByClassification: { classification: string; count: number }[];
  trendsData: { date: string; alerts: number }[];
}

// API request helper
async function apiRequest(url: string, method: string = "GET", data?: any) {
  const options: RequestInit = {
    method,
    headers: { "Content-Type": "application/json" },
    body: data ? JSON.stringify(data) : undefined,
  };
  const response = await fetch(url, options);
  if (!response.ok) throw new Error("API request failed");
  return response.json();
}

export default function DataLossPreventionSystem() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");

  const [selectedAlert, setSelectedAlert] = useState<DLPAlert | null>(null);
  const [showAlertDetails, setShowAlertDetails] = useState(false);
  const [showPolicyEditor, setShowPolicyEditor] = useState(false);

  // Queries
  const { data: alerts = [] } = useQuery<DLPAlert[]>({
    queryKey: ["/api/dlp/alerts"],
    refetchInterval: 15000,
  });

  const { data: policies = [] } = useQuery<DLPPolicy[]>({
    queryKey: ["/api/dlp/policies"],
    refetchInterval: 60000,
  });

  const { data: classifications = [] } = useQuery<DataClassification[]>({
    queryKey: ["/api/dlp/classifications"],
    refetchInterval: 300000,
  });

  const { data: quarantinedFiles = [] } = useQuery<QuarantinedFile[]>({
    queryKey: ["/api/dlp/quarantine"],
    refetchInterval: 30000,
  });

  const { data: userRiskProfiles = [] } = useQuery<UserRiskProfile[]>({
    queryKey: ["/api/dlp/user-risks"],
    refetchInterval: 60000,
  });

  const { data: statistics } = useQuery<DLPStatistics>({
    queryKey: ["/api/dlp/statistics"],
    refetchInterval: 30000,
  });

  // Mutations
  const updateAlertStatusMutation = useMutation({
    mutationFn: ({ alertId, status, notes }: { alertId: string; status: string; notes?: string }) =>
      apiRequest(`/api/dlp/alerts/${alertId}/status`, "PUT", { status, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dlp/alerts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dlp/statistics"] });
      toast({ title: "Alert status updated" });
    },
  });

  const createPolicyMutation = useMutation({
    mutationFn: (data: Partial<DLPPolicy>) =>
      apiRequest("/api/dlp/policies", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dlp/policies"] });
      toast({ title: "DLP policy created successfully" });
      setShowPolicyEditor(false);
    },
  });

  const togglePolicyMutation = useMutation({
    mutationFn: ({ policyId, enabled }: { policyId: string; enabled: boolean }) =>
      apiRequest(`/api/dlp/policies/${policyId}/toggle`, "PUT", { enabled }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dlp/policies"] });
      toast({ title: "Policy updated" });
    },
  });

  const approveQuarantineMutation = useMutation({
    mutationFn: ({ fileId, notes }: { fileId: string; notes: string }) =>
      apiRequest(`/api/dlp/quarantine/${fileId}/approve`, "POST", { notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dlp/quarantine"] });
      toast({ title: "File approved and released from quarantine" });
    },
  });

  const denyQuarantineMutation = useMutation({
    mutationFn: ({ fileId, notes }: { fileId: string; notes: string }) =>
      apiRequest(`/api/dlp/quarantine/${fileId}/deny`, "POST", { notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dlp/quarantine"] });
      toast({ title: "File denied and permanently deleted" });
    },
  });

  const updateUserRiskMutation = useMutation({
    mutationFn: ({ userId, status, notes }: { userId: string; status: string; notes: string }) =>
      apiRequest(`/api/dlp/user-risks/${userId}/status`, "PUT", { status, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dlp/user-risks"] });
      toast({ title: "User risk profile updated" });
    },
  });

  // Helper functions
  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case "critical":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "high":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "low":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getRiskLevelColor = (level: string): string => {
    switch (level) {
      case "critical":
        return "bg-red-500/20 text-red-400";
      case "high":
        return "bg-orange-500/20 text-orange-400";
      case "medium":
        return "bg-yellow-500/20 text-yellow-400";
      case "low":
        return "bg-green-500/20 text-green-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "active":
        return "bg-red-500/20 text-red-400";
      case "investigating":
        return "bg-yellow-500/20 text-yellow-400";
      case "resolved":
        return "bg-green-500/20 text-green-400";
      case "false_positive":
        return "bg-gray-500/20 text-gray-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch =
      alert.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.resourceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = filterSeverity === "all" || alert.severity === filterSeverity;
    const matchesStatus = filterStatus === "all" || alert.status === filterStatus;
    const matchesType = filterType === "all" || alert.alertType === filterType;

    return matchesSearch && matchesSeverity && matchesStatus && matchesType;
  });

  return (
    <div className="min-h-screen cyber-bg p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold cyber-glow mb-2">
            Data Loss Prevention System
          </h1>
          <p className="text-gray-400">
            Protect sensitive data and prevent unauthorized access, downloads, and data theft
          </p>
        </div>

        {/* Statistics Dashboard */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="cyber-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Active Alerts</p>
                    <p className="text-3xl font-bold mt-2 text-red-400">{statistics.activeAlerts}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {statistics.criticalAlerts} critical
                    </p>
                  </div>
                  <ShieldAlert className="w-10 h-10 text-red-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="cyber-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Blocked Attempts</p>
                    <p className="text-3xl font-bold mt-2">{statistics.blockedAttempts}</p>
                    <p className="text-xs text-gray-500 mt-1">Prevented data loss</p>
                  </div>
                  <Ban className="w-10 h-10 text-orange-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="cyber-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Quarantined Files</p>
                    <p className="text-3xl font-bold mt-2">{statistics.quarantinedFiles}</p>
                    <p className="text-xs text-gray-500 mt-1">Awaiting review</p>
                  </div>
                  <Archive className="w-10 h-10 text-yellow-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="cyber-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Avg Risk Score</p>
                    <p className="text-3xl font-bold mt-2">{statistics.averageRiskScore}</p>
                    <p className="text-xs text-gray-500 mt-1">Overall system health</p>
                  </div>
                  <Target className="w-10 h-10 text-blue-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <Tabs defaultValue="alerts" className="space-y-4">
          <TabsList className="cyber-card p-1">
            <TabsTrigger value="alerts">Security Alerts</TabsTrigger>
            <TabsTrigger value="policies">DLP Policies</TabsTrigger>
            <TabsTrigger value="quarantine">Quarantine</TabsTrigger>
            <TabsTrigger value="users">User Risk Profiles</TabsTrigger>
            <TabsTrigger value="classifications">Data Classifications</TabsTrigger>
          </TabsList>

          {/* Security Alerts Tab */}
          <TabsContent value="alerts" className="space-y-4">
            {/* Filters */}
            <Card className="cyber-card">
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search alerts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>

                  <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Severities</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="investigating">Investigating</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="false_positive">False Positive</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Alert Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="unauthorized_download">Unauthorized Download</SelectItem>
                      <SelectItem value="mass_download">Mass Download</SelectItem>
                      <SelectItem value="suspicious_copy">Suspicious Copy</SelectItem>
                      <SelectItem value="policy_violation">Policy Violation</SelectItem>
                      <SelectItem value="insider_threat">Insider Threat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Alerts List */}
            <div className="space-y-3">
              {filteredAlerts.map((alert) => (
                <Card key={alert.id} className="cyber-card">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`p-3 rounded-lg ${getSeverityColor(alert.severity)}`}>
                          <ShieldAlert className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="flex items-center gap-3">
                                <h4 className="font-semibold">{alert.userName}</h4>
                                <Badge className={getSeverityColor(alert.severity)}>
                                  {alert.severity.toUpperCase()}
                                </Badge>
                                <Badge className={getStatusColor(alert.status)}>
                                  {alert.status.replace("_", " ").toUpperCase()}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-400 mt-1">{alert.userEmail}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-400">{formatDate(alert.timestamp)}</p>
                              <p className="text-sm font-semibold text-red-400 mt-1">
                                Risk Score: {alert.riskScore}/100
                              </p>
                            </div>
                          </div>

                          <div className="p-3 bg-gray-800/50 rounded-lg mb-3">
                            <p className="text-sm font-medium mb-1">{alert.description}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-400">
                              <span>Type: {alert.alertType.replace("_", " ")}</span>
                              <span>•</span>
                              <span>Resource: {alert.resourceName}</span>
                              <span>•</span>
                              <span>Classification: {alert.dataClassification}</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-sm">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <span>{alert.location || "Unknown"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Monitor className="w-4 h-4 text-gray-400" />
                              <span>{alert.device}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Database className="w-4 h-4 text-gray-400" />
                              <span>{alert.ipAddress}</span>
                            </div>
                          </div>

                          {alert.automaticActions.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              <span className="text-sm text-gray-400">Actions Taken:</span>
                              {alert.automaticActions.map((action, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  <Zap className="w-3 h-3 mr-1" />
                                  {action}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedAlert(alert);
                            setShowAlertDetails(true);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Details
                        </Button>
                        {alert.status === "active" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                updateAlertStatusMutation.mutate({
                                  alertId: alert.id,
                                  status: "investigating",
                                })
                              }
                            >
                              Investigate
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                updateAlertStatusMutation.mutate({
                                  alertId: alert.id,
                                  status: "resolved",
                                })
                              }
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Resolve
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredAlerts.length === 0 && (
                <Card className="cyber-card">
                  <CardContent className="p-12 text-center">
                    <ShieldCheck className="w-12 h-12 mx-auto mb-4 opacity-50 text-green-400" />
                    <p className="text-gray-400">No security alerts found</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* DLP Policies Tab */}
          <TabsContent value="policies" className="space-y-4">
            <Card className="cyber-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    DLP Policies
                  </CardTitle>
                  <Button className="cyber-button" onClick={() => setShowPolicyEditor(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Policy
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {policies.map((policy) => (
                    <div key={policy.id} className="p-4 bg-gray-800/50 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold">{policy.name}</h4>
                            <Badge className={getSeverityColor(policy.severity)}>
                              {policy.severity.toUpperCase()}
                            </Badge>
                            {policy.enabled ? (
                              <Badge className="bg-green-500/20 text-green-400">
                                <ShieldCheck className="w-3 h-3 mr-1" />
                                ENABLED
                              </Badge>
                            ) : (
                              <Badge className="bg-gray-500/20 text-gray-400">
                                <ShieldAlert className="w-3 h-3 mr-1" />
                                DISABLED
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-400 mb-3">{policy.description}</p>
                          <div className="flex items-center gap-6 text-sm text-gray-400">
                            <span>Scope: {policy.scope.replace("_", " ")}</span>
                            <span>•</span>
                            <span>Triggered: {policy.triggeredCount} times</span>
                            {policy.lastTriggered && (
                              <>
                                <span>•</span>
                                <span>Last: {formatDate(policy.lastTriggered)}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              togglePolicyMutation.mutate({
                                policyId: policy.id,
                                enabled: !policy.enabled,
                              })
                            }
                          >
                            {policy.enabled ? <Ban className="w-4 h-4 mr-2" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
                            {policy.enabled ? "Disable" : "Enable"}
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quarantine Tab */}
          <TabsContent value="quarantine" className="space-y-4">
            <Card className="cyber-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Archive className="w-5 h-5 text-yellow-400" />
                  Quarantined Files
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {quarantinedFiles.map((file) => (
                    <div key={file.id} className="p-4 bg-gray-800/50 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-yellow-500/20 rounded-lg">
                            <FileWarning className="w-6 h-6 text-yellow-400" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{file.fileName}</h4>
                            <p className="text-sm text-gray-400 mt-1">
                              User: {file.userName} • Size: {(file.fileSize / 1024 / 1024).toFixed(2)} MB
                            </p>
                            <p className="text-sm text-gray-400">
                              Quarantined: {formatDate(file.quarantineDate)}
                            </p>
                            <p className="text-sm mt-2">
                              <span className="text-gray-400">Reason:</span> {file.quarantineReason}
                            </p>
                            {file.reviewNotes && (
                              <p className="text-sm mt-1">
                                <span className="text-gray-400">Notes:</span> {file.reviewNotes}
                              </p>
                            )}
                          </div>
                        </div>
                        {file.reviewStatus === "pending" && file.canRestore && (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                approveQuarantineMutation.mutate({
                                  fileId: file.id,
                                  notes: "Approved by admin",
                                })
                              }
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() =>
                                denyQuarantineMutation.mutate({
                                  fileId: file.id,
                                  notes: "Denied by admin",
                                })
                              }
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Deny
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {quarantinedFiles.length === 0 && (
                    <p className="text-center text-gray-400 py-8">No files in quarantine</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Risk Profiles Tab */}
          <TabsContent value="users" className="space-y-4">
            <Card className="cyber-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  User Risk Profiles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {userRiskProfiles
                    .sort((a, b) => b.riskScore - a.riskScore)
                    .map((profile) => (
                      <div key={profile.userId} className="p-4 bg-gray-800/50 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4 flex-1">
                            <div className={`p-3 rounded-lg ${getRiskLevelColor(profile.riskLevel)}`}>
                              {profile.riskLevel === "critical" || profile.riskLevel === "high" ? (
                                <UserX className="w-6 h-6" />
                              ) : (
                                <Users className="w-6 h-6" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-semibold">{profile.userName}</h4>
                                <Badge className={getRiskLevelColor(profile.riskLevel)}>
                                  {profile.riskLevel.toUpperCase()} RISK
                                </Badge>
                                <Badge variant="outline">{profile.accountStatus.toUpperCase()}</Badge>
                                {profile.watchlisted && (
                                  <Badge className="bg-red-500/20 text-red-400">
                                    <Eye className="w-3 h-3 mr-1" />
                                    WATCHLIST
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-400">{profile.userEmail} • {profile.department}</p>

                              <div className="grid grid-cols-4 gap-4 mt-3 text-sm">
                                <div>
                                  <p className="text-gray-400">Risk Score</p>
                                  <p className="font-semibold text-lg">{profile.riskScore}/100</p>
                                </div>
                                <div>
                                  <p className="text-gray-400">Alerts</p>
                                  <p className="font-semibold">
                                    <span className="text-red-400">{profile.alerts.critical}</span>/
                                    <span className="text-orange-400">{profile.alerts.high}</span>/
                                    <span className="text-yellow-400">{profile.alerts.medium}</span>/
                                    <span className="text-blue-400">{profile.alerts.low}</span>
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-400">Downloads</p>
                                  <p className="font-semibold">{profile.filesDownloaded}</p>
                                </div>
                                <div>
                                  <p className="text-gray-400">Violations</p>
                                  <p className="font-semibold">{profile.policyViolations}</p>
                                </div>
                              </div>

                              <p className="text-sm text-gray-400 mt-2">
                                Last Activity: {formatDate(profile.lastActivity)}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            {profile.accountStatus === "active" && profile.riskLevel === "critical" && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() =>
                                  updateUserRiskMutation.mutate({
                                    userId: profile.userId,
                                    status: "suspended",
                                    notes: "Suspended due to critical risk",
                                  })
                                }
                              >
                                Suspend
                              </Button>
                            )}
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Classifications Tab */}
          <TabsContent value="classifications" className="space-y-4">
            <Card className="cyber-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Data Classification Levels
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {classifications.map((classification) => (
                    <div key={classification.id} className="p-4 bg-gray-800/50 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${classification.color}`}>
                          <Shield className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold capitalize">{classification.name}</h4>
                          <p className="text-sm text-gray-400 mt-1">{classification.description}</p>
                          <div className="mt-3 space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              {classification.requiresEncryption ? (
                                <Lock className="w-4 h-4 text-green-400" />
                              ) : (
                                <Unlock className="w-4 h-4 text-gray-400" />
                              )}
                              <span>Encryption {classification.requiresEncryption ? "Required" : "Optional"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {classification.allowDownload ? (
                                <Download className="w-4 h-4 text-green-400" />
                              ) : (
                                <Ban className="w-4 h-4 text-red-400" />
                              )}
                              <span>Downloads {classification.allowDownload ? "Allowed" : "Blocked"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {classification.allowCopy ? (
                                <Copy className="w-4 h-4 text-green-400" />
                              ) : (
                                <Ban className="w-4 h-4 text-red-400" />
                              )}
                              <span>Copy/Paste {classification.allowCopy ? "Allowed" : "Blocked"}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
