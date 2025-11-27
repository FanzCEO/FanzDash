import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Shield,
  User,
  Clock,
  MapPin,
  Monitor,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Search,
  Calendar,
  Activity,
  FileText,
} from "lucide-react";

interface SessionLog {
  id: string;
  adminId: string;
  adminName: string;
  sessionType: "login" | "logout" | "timeout";
  ipAddress: string;
  userAgent: string;
  location: {
    city: string;
    country: string;
  };
  suspicious: boolean;
  createdAt: string;
}

interface ActionLog {
  id: string;
  adminId: string;
  adminName: string;
  action: "approve" | "reject" | "hold" | "request_edit" | "delete" | "restore";
  targetType: "content_item" | "user_account" | "system_setting";
  targetId: string;
  previousStatus?: string;
  newStatus?: string;
  reason: string;
  ipAddress: string;
  moderatorNotes?: string;
  createdAt: string;
}

interface AuditStats {
  totalActions: number;
  approvals: number;
  rejections: number;
  suspicious: number;
  topModerators: Array<{
    adminId: string;
    adminName: string;
    actionCount: number;
  }>;
}

export function AdminAuditLogs() {
  const [activeTab, setActiveTab] = useState<"sessions" | "actions">("actions");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAction, setFilterAction] = useState<string>("all");
  const [filterTimeRange, setFilterTimeRange] = useState<string>("24h");
  const [selectedLog, setSelectedLog] = useState<ActionLog | SessionLog | null>(
    null,
  );

  const { data: sessionLogs = [] } = useQuery<SessionLog[]>({
    queryKey: ["/api/admin/session-logs"],
    refetchInterval: 30000,
  });

  const { data: actionLogs = [] } = useQuery<ActionLog[]>({
    queryKey: ["/api/admin/action-logs"],
    refetchInterval: 10000,
  });

  const { data: auditStats } = useQuery<AuditStats>({
    queryKey: ["/api/admin/audit-stats"],
    refetchInterval: 60000,
  });

  const getActionIcon = (action: string) => {
    switch (action) {
      case "approve":
        return <CheckCircle className="w-4 h-4 text-secondary" />;
      case "reject":
        return <XCircle className="w-4 h-4 text-destructive" />;
      case "hold":
        return <Clock className="w-4 h-4 text-accent" />;
      case "request_edit":
        return <FileText className="w-4 h-4 text-primary" />;
      case "delete":
        return <XCircle className="w-4 h-4 text-destructive" />;
      case "restore":
        return <CheckCircle className="w-4 h-4 text-secondary" />;
      default:
        return <Activity className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "approve":
        return "bg-secondary text-secondary-foreground";
      case "reject":
        return "bg-destructive text-destructive-foreground";
      case "hold":
        return "bg-accent text-accent-foreground";
      case "request_edit":
        return "bg-primary text-primary-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const filteredActionLogs = actionLogs.filter((log) => {
    const matchesSearch =
      searchTerm === "" ||
      log.adminName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.targetId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.reason.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAction = filterAction === "all" || log.action === filterAction;

    return matchesSearch && matchesAction;
  });

  const filteredSessionLogs = sessionLogs.filter((log) => {
    const matchesSearch =
      searchTerm === "" ||
      log.adminName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ipAddress.includes(searchTerm);

    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Audit Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="cyber-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary cyber-text-glow">
              {auditStats?.totalActions || 0}
            </div>
            <div className="text-sm text-muted-foreground">Total Actions</div>
          </CardContent>
        </Card>
        <Card className="cyber-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-secondary cyber-text-glow">
              {auditStats?.approvals || 0}
            </div>
            <div className="text-sm text-muted-foreground">Approvals</div>
          </CardContent>
        </Card>
        <Card className="cyber-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-destructive cyber-text-glow">
              {auditStats?.rejections || 0}
            </div>
            <div className="text-sm text-muted-foreground">Rejections</div>
          </CardContent>
        </Card>
        <Card className="cyber-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-accent cyber-text-glow">
              {auditStats?.suspicious || 0}
            </div>
            <div className="text-sm text-muted-foreground">Suspicious</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Audit Logs */}
      <Card className="cyber-card neural-network">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-primary cyber-pulse" />
              <span className="cyber-text-glow">ADMIN AUDIT LOGS</span>
            </CardTitle>
            <div className="flex space-x-2">
              <Button
                variant={activeTab === "actions" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab("actions")}
                className={
                  activeTab === "actions" ? "neon-button" : "glass-effect"
                }
                data-testid="tab-actions"
              >
                <Activity className="w-4 h-4 mr-2" />
                Actions
              </Button>
              <Button
                variant={activeTab === "sessions" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab("sessions")}
                className={
                  activeTab === "sessions" ? "neon-button" : "glass-effect"
                }
                data-testid="tab-sessions"
              >
                <Monitor className="w-4 h-4 mr-2" />
                Sessions
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={
                    activeTab === "actions"
                      ? "Search actions, admins, targets..."
                      : "Search sessions, admins, IPs..."
                  }
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 glass-effect"
                  data-testid="search-input"
                />
              </div>
            </div>

            {activeTab === "actions" && (
              <Select value={filterAction} onValueChange={setFilterAction}>
                <SelectTrigger className="w-40 glass-effect">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="approve">Approve</SelectItem>
                  <SelectItem value="reject">Reject</SelectItem>
                  <SelectItem value="hold">Hold</SelectItem>
                  <SelectItem value="request_edit">Request Edit</SelectItem>
                </SelectContent>
              </Select>
            )}

            <Select value={filterTimeRange} onValueChange={setFilterTimeRange}>
              <SelectTrigger className="w-32 glass-effect">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">Last Hour</SelectItem>
                <SelectItem value="24h">Last 24h</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Logs */}
          {activeTab === "actions" && (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredActionLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 border border-border/30 rounded-lg glass-effect hover:bg-primary/5 transition-all duration-300"
                  data-testid={`action-log-${log.id}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getActionIcon(log.action)}
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge className={getActionColor(log.action)}>
                            {log.action.replace("_", " ").toUpperCase()}
                          </Badge>
                          <span className="font-mono text-sm text-muted-foreground">
                            {log.targetType}: {log.targetId}
                          </span>
                        </div>
                        <div className="text-sm">
                          <User className="w-3 h-3 inline mr-1" />
                          <span className="font-medium">{log.adminName}</span>
                          {" • "}
                          <span className="text-muted-foreground">
                            {log.reason}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          <Calendar className="w-3 h-3 inline mr-1" />
                          {new Date(log.createdAt).toLocaleString()}
                          {" • "}
                          <MapPin className="w-3 h-3 inline mr-1" />
                          {log.ipAddress}
                        </div>
                      </div>
                    </div>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedLog(log)}
                          className="glass-effect"
                          data-testid={`view-log-${log.id}`}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="cyber-card">
                        <DialogHeader>
                          <DialogTitle className="flex items-center space-x-2 cyber-text-glow">
                            <Shield className="w-5 h-5 text-primary" />
                            <span>Action Details - {selectedLog?.id}</span>
                          </DialogTitle>
                        </DialogHeader>

                        {selectedLog && "action" in selectedLog && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium">
                                  Admin
                                </label>
                                <div className="font-mono">
                                  {selectedLog.adminName}
                                </div>
                              </div>
                              <div>
                                <label className="text-sm font-medium">
                                  Action
                                </label>
                                <Badge
                                  className={getActionColor(selectedLog.action)}
                                >
                                  {selectedLog.action
                                    .replace("_", " ")
                                    .toUpperCase()}
                                </Badge>
                              </div>
                              <div>
                                <label className="text-sm font-medium">
                                  Target
                                </label>
                                <div className="font-mono text-sm">
                                  {selectedLog.targetType}:{" "}
                                  {selectedLog.targetId}
                                </div>
                              </div>
                              <div>
                                <label className="text-sm font-medium">
                                  IP Address
                                </label>
                                <div className="font-mono">
                                  {selectedLog.ipAddress}
                                </div>
                              </div>
                            </div>

                            {selectedLog.previousStatus && (
                              <div>
                                <label className="text-sm font-medium">
                                  Status Change
                                </label>
                                <div className="text-sm">
                                  {selectedLog.previousStatus} →{" "}
                                  {selectedLog.newStatus}
                                </div>
                              </div>
                            )}

                            <div>
                              <label className="text-sm font-medium">
                                Reason
                              </label>
                              <div className="p-3 bg-muted/20 rounded text-sm">
                                {selectedLog.reason}
                              </div>
                            </div>

                            {selectedLog.moderatorNotes && (
                              <div>
                                <label className="text-sm font-medium">
                                  Moderator Notes
                                </label>
                                <div className="p-3 bg-muted/20 rounded text-sm">
                                  {selectedLog.moderatorNotes}
                                </div>
                              </div>
                            )}

                            <div>
                              <label className="text-sm font-medium">
                                Timestamp
                              </label>
                              <div className="font-mono text-sm">
                                {new Date(
                                  selectedLog.createdAt,
                                ).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Session Logs */}
          {activeTab === "sessions" && (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredSessionLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 border border-border/30 rounded-lg glass-effect hover:bg-primary/5 transition-all duration-300"
                  data-testid={`session-log-${log.id}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Monitor className="w-5 h-5 text-secondary" />
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge
                            variant={
                              log.sessionType === "login"
                                ? "default"
                                : "outline"
                            }
                          >
                            {log.sessionType.toUpperCase()}
                          </Badge>
                          {log.suspicious && (
                            <Badge variant="destructive">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              SUSPICIOUS
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm">
                          <User className="w-3 h-3 inline mr-1" />
                          <span className="font-medium">{log.adminName}</span>
                          {" • "}
                          <MapPin className="w-3 h-3 inline mr-1" />
                          {log.location.city}, {log.location.country}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          <Calendar className="w-3 h-3 inline mr-1" />
                          {new Date(log.createdAt).toLocaleString()}
                          {" • "}
                          IP: {log.ipAddress}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
