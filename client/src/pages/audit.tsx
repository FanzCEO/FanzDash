import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  FileText,
  Clock,
  User,
  Shield,
  Download,
  Search,
  Filter,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";

export default function AuditPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const { toast } = useToast();

  // Mock audit data - in production this would come from audit logging system
  const auditData = {
    totalActions: 15847,
    todayActions: 432,
    adminActions: 1203,
    systemActions: 14644,
    recentLogs: [
      {
        id: "audit-001",
        timestamp: "2025-08-29T18:23:45Z",
        user: "admin@fanzdash.com",
        action: "Content Blocked",
        target: "content-id-12345",
        result: "SUCCESS",
        details: "High-risk content automatically blocked by AI system",
        ipAddress: "192.168.1.100",
        userAgent: "FanzDash Admin Panel v2.1",
      },
      {
        id: "audit-002",
        timestamp: "2025-08-29T18:22:10Z",
        user: "moderator@fanzdash.com",
        action: "Appeal Reviewed",
        target: "appeal-789",
        result: "SUCCESS",
        details: "User appeal approved, content reinstated",
        ipAddress: "192.168.1.101",
        userAgent: "FanzDash Moderator v2.1",
      },
      {
        id: "audit-003",
        timestamp: "2025-08-29T18:20:33Z",
        user: "system",
        action: "Risk Assessment",
        target: "platform-fanz-main",
        result: "WARNING",
        details: "Elevated risk detected on FanzMain platform",
        ipAddress: "127.0.0.1",
        userAgent: "FanzDash System v2.1",
      },
      {
        id: "audit-004",
        timestamp: "2025-08-29T18:18:15Z",
        user: "admin@fanzdash.com",
        action: "Settings Modified",
        target: "moderation-threshold",
        result: "SUCCESS",
        details: "Auto-block threshold changed from 0.8 to 0.75",
        ipAddress: "192.168.1.100",
        userAgent: "FanzDash Admin Panel v2.1",
      },
      {
        id: "audit-005",
        timestamp: "2025-08-29T18:15:22Z",
        user: "system",
        action: "Backup Created",
        target: "vault-backup-daily",
        result: "SUCCESS",
        details: "Daily encrypted backup completed successfully",
        ipAddress: "127.0.0.1",
        userAgent: "FanzDash Backup Service v2.1",
      },
    ],
  };

  const handleExportAudit = () => {
    toast({
      title: "Audit Export Started",
      description: "Comprehensive audit log export initiated",
    });
  };

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case "content blocked":
        return <Shield className="w-4 h-4 text-red-400" />;
      case "appeal reviewed":
        return <Eye className="w-4 h-4 text-blue-400" />;
      case "risk assessment":
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case "settings modified":
        return <User className="w-4 h-4 text-purple-400" />;
      case "backup created":
        return <FileText className="w-4 h-4 text-green-400" />;
      default:
        return <Clock className="w-4 h-4 text-primary" />;
    }
  };

  const getResultBadge = (result: string) => {
    switch (result.toLowerCase()) {
      case "success":
        return (
          <Badge className="bg-green-500/20 text-green-400">
            <CheckCircle className="w-3 h-3 mr-1" />
            Success
          </Badge>
        );
      case "warning":
        return (
          <Badge className="bg-yellow-500/20 text-yellow-400">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Warning
          </Badge>
        );
      case "error":
        return (
          <Badge className="bg-red-500/20 text-red-400">
            <XCircle className="w-3 h-3 mr-1" />
            Error
          </Badge>
        );
      default:
        return <Badge variant="secondary">{result}</Badge>;
    }
  };

  return (
    <div className="min-h-screen cyber-bg">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold cyber-text-glow">Audit Logs</h1>
            <p className="text-muted-foreground">
              Complete Action History & Security Monitoring
            </p>
          </div>
          <Button
            onClick={handleExportAudit}
            className="neon-button"
            data-testid="export-audit-button"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Audit
          </Button>
        </div>

        {/* Audit Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="cyber-card bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30">
            <CardContent className="p-4 text-center">
              <FileText className="w-8 h-8 mx-auto mb-2 text-blue-400" />
              <div className="text-2xl font-bold text-blue-400">
                {auditData.totalActions.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">Total Actions</div>
            </CardContent>
          </Card>

          <Card className="cyber-card bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30">
            <CardContent className="p-4 text-center">
              <Clock className="w-8 h-8 mx-auto mb-2 text-green-400" />
              <div className="text-2xl font-bold text-green-400">
                {auditData.todayActions}
              </div>
              <div className="text-xs text-muted-foreground">
                Today's Actions
              </div>
            </CardContent>
          </Card>

          <Card className="cyber-card bg-gradient-to-r from-purple-500/10 to-violet-500/10 border border-purple-500/30">
            <CardContent className="p-4 text-center">
              <User className="w-8 h-8 mx-auto mb-2 text-purple-400" />
              <div className="text-2xl font-bold text-purple-400">
                {auditData.adminActions.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">Admin Actions</div>
            </CardContent>
          </Card>

          <Card className="cyber-card bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30">
            <CardContent className="p-4 text-center">
              <Shield className="w-8 h-8 mx-auto mb-2 text-orange-400" />
              <div className="text-2xl font-bold text-orange-400">
                {auditData.systemActions.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">
                System Actions
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="cyber-card">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search audit logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 cyber-input"
                    data-testid="search-audit-input"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                {["all", "admin", "system", "content", "appeals"].map(
                  (filter) => (
                    <Button
                      key={filter}
                      variant={
                        selectedFilter === filter ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setSelectedFilter(filter)}
                      className={selectedFilter === filter ? "neon-button" : ""}
                      data-testid={`filter-${filter}-button`}
                    >
                      {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </Button>
                  ),
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Audit Logs */}
        <Card className="cyber-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-6 h-6 text-primary cyber-pulse" />
              <span className="cyber-text-glow">RECENT AUDIT ACTIVITY</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {auditData.recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 cyber-card border border-primary/20"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {getActionIcon(log.action)}
                      <div>
                        <div className="font-medium">{log.action}</div>
                        <div className="text-sm text-muted-foreground">
                          {log.user} •{" "}
                          {new Date(log.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    {getResultBadge(log.result)}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground mb-1">Target:</div>
                      <div className="font-mono text-primary">{log.target}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">
                        IP Address:
                      </div>
                      <div className="font-mono">{log.ipAddress}</div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="text-muted-foreground text-sm mb-1">
                      Details:
                    </div>
                    <div className="text-sm">{log.details}</div>
                  </div>

                  <div className="mt-2 text-xs text-muted-foreground">
                    User Agent: {log.userAgent}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Compliance Summary */}
        <Card className="cyber-card bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-6 h-6 text-green-400" />
              <span className="text-green-400">AUDIT COMPLIANCE</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">100%</div>
                <div className="text-sm text-muted-foreground">
                  Actions Logged
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  VERIFIED
                </div>
                <div className="text-sm text-muted-foreground">
                  Data Integrity
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  COMPLIANT
                </div>
                <div className="text-sm text-muted-foreground">
                  Legal Standards
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
