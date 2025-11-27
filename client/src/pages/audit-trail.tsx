import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Activity,
  User,
  FileText,
  Download,
  Upload,
  Edit,
  Trash2,
  Eye,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  Lock,
  Unlock,
  Share2,
  Copy,
  Move,
  LogIn,
  LogOut,
  Settings,
  Database,
  Calendar,
  Filter,
  Search,
  FileCheck,
  Users,
  Archive,
  RefreshCw,
  TrendingUp,
  BarChart3,
} from "lucide-react";

interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userEmail: string;
  action: AuditAction;
  category: AuditCategory;
  resourceType: string;
  resourceId: string;
  resourceName: string;
  description: string;
  changes?: ChangeRecord[];
  metadata: AuditMetadata;
  severity: "low" | "medium" | "high" | "critical";
  status: "success" | "failed" | "partial";
  ipAddress: string;
  device: DeviceInfo;
  location?: LocationInfo;
  sessionId: string;
  duration?: number;
}

type AuditAction =
  | "create"
  | "read"
  | "update"
  | "delete"
  | "download"
  | "upload"
  | "share"
  | "unshare"
  | "move"
  | "copy"
  | "rename"
  | "restore"
  | "archive"
  | "login"
  | "logout"
  | "permission_change"
  | "settings_change"
  | "export"
  | "import"
  | "approve"
  | "reject"
  | "sign"
  | "encrypt"
  | "decrypt";

type AuditCategory =
  | "authentication"
  | "authorization"
  | "file_management"
  | "user_management"
  | "system_config"
  | "security"
  | "compliance"
  | "data_access"
  | "communication"
  | "financial"
  | "hr"
  | "crm"
  | "esign";

interface ChangeRecord {
  field: string;
  oldValue: any;
  newValue: any;
  type: "added" | "modified" | "removed";
}

interface AuditMetadata {
  userAgent: string;
  referrer?: string;
  apiVersion?: string;
  requestId?: string;
  tags?: string[];
  customFields?: Record<string, any>;
}

interface DeviceInfo {
  type: "desktop" | "mobile" | "tablet" | "other";
  os: string;
  browser: string;
  fingerprint: string;
}

interface LocationInfo {
  country: string;
  region: string;
  city: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface AuditStatistics {
  totalEvents: number;
  todayEvents: number;
  weekEvents: number;
  monthEvents: number;
  uniqueUsers: number;
  failedAttempts: number;
  criticalEvents: number;
  topActions: { action: string; count: number }[];
  topUsers: { userId: string; userName: string; count: number }[];
  actionsByCategory: { category: string; count: number }[];
}

interface UserActivitySummary {
  userId: string;
  userName: string;
  userEmail: string;
  totalActions: number;
  lastActive: string;
  mostCommonAction: string;
  riskScore: number;
  suspiciousActivity: boolean;
  actionBreakdown: { action: string; count: number }[];
}

interface ComplianceReport {
  id: string;
  reportType: "gdpr" | "hipaa" | "sox" | "pci_dss" | "custom";
  generatedDate: string;
  generatedBy: string;
  period: {
    start: string;
    end: string;
  };
  summary: {
    totalRecords: number;
    dataAccesses: number;
    dataModifications: number;
    dataDelitions: number;
    securityEvents: number;
  };
  findings: ComplianceFinding[];
  status: "pass" | "fail" | "warning";
  downloadUrl?: string;
}

interface ComplianceFinding {
  id: string;
  severity: "low" | "medium" | "high" | "critical";
  type: string;
  description: string;
  recommendation: string;
  relatedEvents: string[];
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

export default function AuditTrailSystem() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterAction, setFilterAction] = useState<string>("all");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [filterUser, setFilterUser] = useState<string>("all");
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });

  const [selectedEntry, setSelectedEntry] = useState<AuditLogEntry | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Queries
  const { data: auditLogs = [] } = useQuery<AuditLogEntry[]>({
    queryKey: ["/api/audit/logs", dateRange],
    refetchInterval: 15000,
  });

  const { data: statistics } = useQuery<AuditStatistics>({
    queryKey: ["/api/audit/statistics", dateRange],
    refetchInterval: 30000,
  });

  const { data: userSummaries = [] } = useQuery<UserActivitySummary[]>({
    queryKey: ["/api/audit/user-summaries", dateRange],
    refetchInterval: 60000,
  });

  const { data: complianceReports = [] } = useQuery<ComplianceReport[]>({
    queryKey: ["/api/audit/compliance-reports"],
    refetchInterval: 300000,
  });

  // Mutations
  const exportAuditLogMutation = useMutation({
    mutationFn: (params: { start: string; end: string; format: "csv" | "json" | "pdf" }) =>
      apiRequest("/api/audit/export", "POST", params),
    onSuccess: (data) => {
      window.open(data.downloadUrl, "_blank");
      toast({ title: "Audit log export started" });
    },
  });

  const generateComplianceReportMutation = useMutation({
    mutationFn: (params: { type: string; start: string; end: string }) =>
      apiRequest("/api/audit/compliance-reports", "POST", params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/audit/compliance-reports"] });
      toast({ title: "Compliance report generated successfully" });
    },
  });

  // Helper functions
  const getActionIcon = (action: AuditAction) => {
    switch (action) {
      case "create":
        return <FileCheck className="w-4 h-4 text-green-400" />;
      case "read":
      case "download":
        return <Download className="w-4 h-4 text-blue-400" />;
      case "update":
      case "edit":
        return <Edit className="w-4 h-4 text-yellow-400" />;
      case "delete":
        return <Trash2 className="w-4 h-4 text-red-400" />;
      case "upload":
        return <Upload className="w-4 h-4 text-purple-400" />;
      case "share":
        return <Share2 className="w-4 h-4 text-cyan-400" />;
      case "login":
        return <LogIn className="w-4 h-4 text-green-400" />;
      case "logout":
        return <LogOut className="w-4 h-4 text-gray-400" />;
      case "permission_change":
        return <Shield className="w-4 h-4 text-orange-400" />;
      default:
        return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case "critical":
        return "bg-red-500/20 text-red-400";
      case "high":
        return "bg-orange-500/20 text-orange-400";
      case "medium":
        return "bg-yellow-500/20 text-yellow-400";
      case "low":
        return "bg-blue-500/20 text-blue-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-400" />;
      case "partial":
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      default:
        return null;
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case "desktop":
        return <Monitor className="w-4 h-4" />;
      case "mobile":
        return <Smartphone className="w-4 h-4" />;
      case "tablet":
        return <Tablet className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.resourceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "all" || log.category === filterCategory;
    const matchesAction = filterAction === "all" || log.action === filterAction;
    const matchesSeverity = filterSeverity === "all" || log.severity === filterSeverity;
    const matchesUser = filterUser === "all" || log.userId === filterUser;

    return matchesSearch && matchesCategory && matchesAction && matchesSeverity && matchesUser;
  });

  const handleExportLogs = (format: "csv" | "json" | "pdf") => {
    exportAuditLogMutation.mutate({
      start: dateRange.start,
      end: dateRange.end,
      format,
    });
  };

  return (
    <div className="min-h-screen cyber-bg p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold cyber-glow mb-2">
            Comprehensive Audit Trail
          </h1>
          <p className="text-gray-400">
            Complete activity tracking and compliance monitoring for all system events
          </p>
        </div>

        {/* Statistics Dashboard */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="cyber-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Total Events</p>
                    <p className="text-3xl font-bold mt-2">{statistics.totalEvents.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Today: {statistics.todayEvents.toLocaleString()}
                    </p>
                  </div>
                  <Activity className="w-10 h-10 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="cyber-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Unique Users</p>
                    <p className="text-3xl font-bold mt-2">{statistics.uniqueUsers}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      This week: {statistics.weekEvents.toLocaleString()} events
                    </p>
                  </div>
                  <Users className="w-10 h-10 text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="cyber-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Critical Events</p>
                    <p className="text-3xl font-bold mt-2 text-red-400">{statistics.criticalEvents}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Requires attention
                    </p>
                  </div>
                  <AlertTriangle className="w-10 h-10 text-red-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="cyber-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Failed Attempts</p>
                    <p className="text-3xl font-bold mt-2 text-orange-400">{statistics.failedAttempts}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Security monitoring
                    </p>
                  </div>
                  <Shield className="w-10 h-10 text-orange-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <Tabs defaultValue="logs" className="space-y-4">
          <TabsList className="cyber-card p-1">
            <TabsTrigger value="logs">Activity Logs</TabsTrigger>
            <TabsTrigger value="users">User Activity</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="compliance">Compliance Reports</TabsTrigger>
          </TabsList>

          {/* Activity Logs Tab */}
          <TabsContent value="logs" className="space-y-4">
            {/* Filters and Export */}
            <Card className="cyber-card">
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm">Date Range:</Label>
                    <Input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                      className="w-40"
                    />
                    <span className="text-gray-400">to</span>
                    <Input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                      className="w-40"
                    />
                  </div>

                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search logs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>

                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="authentication">Authentication</SelectItem>
                      <SelectItem value="file_management">File Management</SelectItem>
                      <SelectItem value="user_management">User Management</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                      <SelectItem value="compliance">Compliance</SelectItem>
                    </SelectContent>
                  </Select>

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

                  <div className="ml-auto flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExportLogs("csv")}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export CSV
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExportLogs("json")}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export JSON
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExportLogs("pdf")}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export PDF
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Audit Logs List */}
            <Card className="cyber-card">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-gray-700">
                      <tr className="text-left text-sm text-gray-400">
                        <th className="p-4">Timestamp</th>
                        <th className="p-4">User</th>
                        <th className="p-4">Action</th>
                        <th className="p-4">Resource</th>
                        <th className="p-4">Device</th>
                        <th className="p-4">Location</th>
                        <th className="p-4">Severity</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLogs.map((log) => (
                        <tr
                          key={log.id}
                          className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors"
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="text-sm">{formatDate(log.timestamp)}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-blue-400" />
                              <div>
                                <p className="text-sm font-medium">{log.userName}</p>
                                <p className="text-xs text-gray-400">{log.userEmail}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              {getActionIcon(log.action)}
                              <span className="text-sm capitalize">{log.action.replace("_", " ")}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div>
                              <p className="text-sm font-medium">{log.resourceName}</p>
                              <p className="text-xs text-gray-400 capitalize">{log.resourceType}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              {getDeviceIcon(log.device.type)}
                              <div>
                                <p className="text-sm capitalize">{log.device.type}</p>
                                <p className="text-xs text-gray-400">{log.device.browser}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            {log.location && (
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <div>
                                  <p className="text-sm">{log.location.city}</p>
                                  <p className="text-xs text-gray-400">{log.location.country}</p>
                                </div>
                              </div>
                            )}
                          </td>
                          <td className="p-4">
                            <Badge className={getSeverityColor(log.severity)}>
                              {log.severity.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(log.status)}
                              <span className="text-sm capitalize">{log.status}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedEntry(log);
                                setShowDetails(true);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredLogs.length === 0 && (
                  <div className="p-12 text-center text-gray-400">
                    <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No audit logs found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Activity Tab */}
          <TabsContent value="users" className="space-y-4">
            <Card className="cyber-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  User Activity Summaries
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {userSummaries.map((summary) => (
                    <div key={summary.userId} className="p-4 bg-gray-800/50 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="p-3 bg-blue-500/20 rounded-lg">
                            <User className="w-6 h-6 text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold">{summary.userName}</h4>
                            <p className="text-sm text-gray-400">{summary.userEmail}</p>
                            <div className="flex items-center gap-6 mt-3 text-sm">
                              <div>
                                <span className="text-gray-400">Total Actions:</span>
                                <span className="ml-2 font-semibold">{summary.totalActions}</span>
                              </div>
                              <div>
                                <span className="text-gray-400">Most Common:</span>
                                <span className="ml-2 font-semibold capitalize">
                                  {summary.mostCommonAction.replace("_", " ")}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-400">Last Active:</span>
                                <span className="ml-2 font-semibold">{formatDate(summary.lastActive)}</span>
                              </div>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {summary.actionBreakdown.slice(0, 5).map((action) => (
                                <Badge key={action.action} variant="outline" className="text-xs">
                                  {action.action.replace("_", " ")}: {action.count}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-400">Risk Score:</span>
                            <Badge
                              className={
                                summary.riskScore >= 70
                                  ? "bg-red-500/20 text-red-400"
                                  : summary.riskScore >= 40
                                  ? "bg-yellow-500/20 text-yellow-400"
                                  : "bg-green-500/20 text-green-400"
                              }
                            >
                              {summary.riskScore}
                            </Badge>
                          </div>
                          {summary.suspiciousActivity && (
                            <Badge className="bg-red-500/20 text-red-400 mt-2">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Suspicious Activity
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            {statistics && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="cyber-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Top Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {statistics.topActions.map((item) => (
                        <div key={item.action} className="flex items-center justify-between p-3 bg-gray-800/50 rounded">
                          <span className="capitalize">{item.action.replace("_", " ")}</span>
                          <Badge variant="outline">{item.count.toLocaleString()}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="cyber-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Most Active Users
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {statistics.topUsers.map((user) => (
                        <div key={user.userId} className="flex items-center justify-between p-3 bg-gray-800/50 rounded">
                          <div>
                            <p className="font-medium">{user.userName}</p>
                            <p className="text-xs text-gray-400">User ID: {user.userId}</p>
                          </div>
                          <Badge variant="outline">{user.count.toLocaleString()} actions</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="cyber-card md:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Actions by Category
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {statistics.actionsByCategory.map((cat) => (
                        <div key={cat.category} className="p-4 bg-gray-800/50 rounded-lg text-center">
                          <p className="text-sm text-gray-400 capitalize">{cat.category.replace("_", " ")}</p>
                          <p className="text-2xl font-bold mt-2">{cat.count.toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Compliance Reports Tab */}
          <TabsContent value="compliance" className="space-y-4">
            <Card className="cyber-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileCheck className="w-5 h-5" />
                    Compliance Reports
                  </CardTitle>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="cyber-button">
                        <Plus className="w-4 h-4 mr-2" />
                        Generate Report
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="cyber-card">
                      <DialogHeader>
                        <DialogTitle>Generate Compliance Report</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Report Type</Label>
                          <Select>
                            <SelectTrigger className="mt-2">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="gdpr">GDPR Compliance</SelectItem>
                              <SelectItem value="hipaa">HIPAA Compliance</SelectItem>
                              <SelectItem value="sox">SOX Compliance</SelectItem>
                              <SelectItem value="pci_dss">PCI DSS Compliance</SelectItem>
                              <SelectItem value="custom">Custom Report</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Start Date</Label>
                            <Input type="date" className="mt-2" />
                          </div>
                          <div>
                            <Label>End Date</Label>
                            <Input type="date" className="mt-2" />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline">Cancel</Button>
                          <Button className="cyber-button">Generate</Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {complianceReports.map((report) => (
                    <div key={report.id} className="p-4 bg-gray-800/50 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">{report.reportType.toUpperCase()} Compliance Report</h4>
                          <p className="text-sm text-gray-400 mt-1">
                            Generated {formatDate(report.generatedDate)} by {report.generatedBy}
                          </p>
                          <p className="text-sm text-gray-400">
                            Period: {new Date(report.period.start).toLocaleDateString()} -{" "}
                            {new Date(report.period.end).toLocaleDateString()}
                          </p>
                          <div className="flex gap-4 mt-3 text-sm">
                            <span>Total Records: {report.summary.totalRecords}</span>
                            <span>Security Events: {report.summary.securityEvents}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge
                            className={
                              report.status === "pass"
                                ? "bg-green-500/20 text-green-400"
                                : report.status === "fail"
                                ? "bg-red-500/20 text-red-400"
                                : "bg-yellow-500/20 text-yellow-400"
                            }
                          >
                            {report.status.toUpperCase()}
                          </Badge>
                          {report.downloadUrl && (
                            <Button variant="outline" size="sm">
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Details Dialog */}
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="cyber-card max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Audit Log Details</DialogTitle>
            </DialogHeader>
            {selectedEntry && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-400">Timestamp</Label>
                    <p className="font-medium">{formatDate(selectedEntry.timestamp)}</p>
                  </div>
                  <div>
                    <Label className="text-gray-400">Session ID</Label>
                    <p className="font-mono text-sm">{selectedEntry.sessionId}</p>
                  </div>
                  <div>
                    <Label className="text-gray-400">User</Label>
                    <p className="font-medium">{selectedEntry.userName}</p>
                    <p className="text-sm text-gray-400">{selectedEntry.userEmail}</p>
                  </div>
                  <div>
                    <Label className="text-gray-400">IP Address</Label>
                    <p className="font-mono text-sm">{selectedEntry.ipAddress}</p>
                  </div>
                  <div>
                    <Label className="text-gray-400">Action</Label>
                    <p className="font-medium capitalize">{selectedEntry.action.replace("_", " ")}</p>
                  </div>
                  <div>
                    <Label className="text-gray-400">Category</Label>
                    <p className="font-medium capitalize">{selectedEntry.category.replace("_", " ")}</p>
                  </div>
                  <div>
                    <Label className="text-gray-400">Resource</Label>
                    <p className="font-medium">{selectedEntry.resourceName}</p>
                    <p className="text-sm text-gray-400 capitalize">{selectedEntry.resourceType}</p>
                  </div>
                  <div>
                    <Label className="text-gray-400">Status</Label>
                    <Badge className={getStatusIcon(selectedEntry.status) ? "inline-flex items-center gap-1" : ""}>
                      {getStatusIcon(selectedEntry.status)}
                      {selectedEntry.status}
                    </Badge>
                  </div>
                </div>

                <div>
                  <Label className="text-gray-400">Description</Label>
                  <p className="mt-1">{selectedEntry.description}</p>
                </div>

                {selectedEntry.changes && selectedEntry.changes.length > 0 && (
                  <div>
                    <Label className="text-gray-400">Changes</Label>
                    <div className="mt-2 space-y-2">
                      {selectedEntry.changes.map((change, idx) => (
                        <div key={idx} className="p-3 bg-gray-800/50 rounded">
                          <p className="font-medium">{change.field}</p>
                          <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                            <div>
                              <span className="text-gray-400">Old: </span>
                              <span className="line-through">{JSON.stringify(change.oldValue)}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">New: </span>
                              <span className="text-green-400">{JSON.stringify(change.newValue)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <Label className="text-gray-400">Device Information</Label>
                  <div className="mt-2 p-3 bg-gray-800/50 rounded">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <p><span className="text-gray-400">Type:</span> {selectedEntry.device.type}</p>
                      <p><span className="text-gray-400">OS:</span> {selectedEntry.device.os}</p>
                      <p><span className="text-gray-400">Browser:</span> {selectedEntry.device.browser}</p>
                      <p><span className="text-gray-400">Fingerprint:</span> {selectedEntry.device.fingerprint}</p>
                    </div>
                  </div>
                </div>

                {selectedEntry.location && (
                  <div>
                    <Label className="text-gray-400">Location</Label>
                    <div className="mt-2 p-3 bg-gray-800/50 rounded">
                      <p className="text-sm">
                        {selectedEntry.location.city}, {selectedEntry.location.region}, {selectedEntry.location.country}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
