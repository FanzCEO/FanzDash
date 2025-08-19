import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, User, Clock, MapPin, Shield, AlertTriangle, Database, Terminal, Eye, Settings } from "lucide-react";

export function AdminAuditLogs() {
  const [timeRange, setTimeRange] = useState("24h");
  const [selectedAdmin, setSelectedAdmin] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  
  const { data: sessionLogs } = useQuery({
    queryKey: ["/api/admin/session-logs", timeRange],
  });

  const { data: actionLogs } = useQuery({
    queryKey: ["/api/admin/action-logs", { timeRange, admin: selectedAdmin, action: actionFilter }],
  });

  const { data: auditStats } = useQuery({
    queryKey: ["/api/admin/audit-stats"],
  });

  return (
    <div className="space-y-6">
      {/* Real-time Monitoring Header */}
      <Card className="cyber-card bg-gradient-to-r from-primary/10 via-secondary/5 to-accent/10 border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-lg bg-primary/20 border border-primary/50">
                <Shield className="w-6 h-6 text-primary cyber-pulse" />
              </div>
              <div>
                <h2 className="text-2xl font-bold cyber-text-glow">ADMIN SURVEILLANCE CENTER</h2>
                <p className="text-muted-foreground">Real-time monitoring • Full audit trail • Behavioral analysis</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Active Sessions</div>
                <div className="text-2xl font-bold text-secondary cyber-text-glow">12</div>
              </div>
              <div className="w-3 h-3 bg-secondary rounded-full cyber-pulse"></div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary cyber-text-glow">{auditStats?.totalActions || 1247}</div>
              <div className="text-sm text-muted-foreground">Total Actions Today</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent cyber-text-glow">{auditStats?.approvals || 89}</div>
              <div className="text-sm text-muted-foreground">Approvals</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-destructive cyber-text-glow">{auditStats?.rejections || 156}</div>
              <div className="text-sm text-muted-foreground">Rejections</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-secondary cyber-text-glow">{auditStats?.suspicious || 3}</div>
              <div className="text-sm text-muted-foreground">Suspicious Activity</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Control Panel */}
      <Card className="cyber-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Terminal className="w-5 h-5 text-accent" />
            <span>Monitoring Controls</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="neon-border">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">Last Hour</SelectItem>
                <SelectItem value="24h">Last 24 Hours</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedAdmin} onValueChange={setSelectedAdmin}>
              <SelectTrigger className="neon-border">
                <SelectValue placeholder="All Admins" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Admins</SelectItem>
                <SelectItem value="admin-001">Admin-001 (Sarah Chen)</SelectItem>
                <SelectItem value="admin-002">Admin-002 (Mike Rodriguez)</SelectItem>
                <SelectItem value="executive-001">Executive-001 (David Kim)</SelectItem>
              </SelectContent>
            </Select>

            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="neon-border">
                <SelectValue placeholder="All Actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Actions</SelectItem>
                <SelectItem value="approve">Approvals</SelectItem>
                <SelectItem value="reject">Rejections</SelectItem>
                <SelectItem value="vault">Vault Actions</SelectItem>
                <SelectItem value="login">Login Events</SelectItem>
                <SelectItem value="logout">Logout Events</SelectItem>
              </SelectContent>
            </Select>

            <Button className="neon-button" data-testid="button-export-logs">
              <Database className="w-4 h-4 mr-2" />
              Export Logs
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="sessions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-card/50 border border-border/30">
          <TabsTrigger value="sessions" className="data-[state=active]:bg-primary/20">Session Logs</TabsTrigger>
          <TabsTrigger value="actions" className="data-[state=active]:bg-secondary/20">Action Logs</TabsTrigger>
          <TabsTrigger value="realtime" className="data-[state=active]:bg-accent/20">Real-time Feed</TabsTrigger>
        </TabsList>

        <TabsContent value="sessions" className="space-y-4">
          <Card className="cyber-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5 text-secondary" />
                <span>Admin Session Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    id: "session-001",
                    admin: "admin-001",
                    name: "Sarah Chen",
                    action: "Login",
                    timestamp: "2024-01-15 15:23:07",
                    ip: "192.168.1.101",
                    location: "San Francisco, CA",
                    device: "Chrome on Windows 11",
                    suspicious: false,
                    duration: "2h 15m"
                  },
                  {
                    id: "session-002", 
                    admin: "admin-002",
                    name: "Mike Rodriguez",
                    action: "Active Session",
                    timestamp: "2024-01-15 13:45:22", 
                    ip: "10.0.0.55",
                    location: "New York, NY",
                    device: "Firefox on macOS",
                    suspicious: false,
                    duration: "4h 38m"
                  },
                  {
                    id: "session-003",
                    admin: "unknown",
                    name: "Unknown User",
                    action: "Failed Login",
                    timestamp: "2024-01-15 14:12:33",
                    ip: "203.0.113.42",
                    location: "Unknown Location",
                    device: "Unknown Browser",
                    suspicious: true,
                    duration: "0m"
                  }
                ].map((session) => (
                  <div 
                    key={session.id} 
                    className={`p-4 rounded-lg border ${session.suspicious ? 'border-destructive/50 bg-destructive/5' : 'border-border/30 bg-card/30'}`}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded ${session.suspicious ? 'bg-destructive/20' : 'bg-secondary/20'}`}>
                          {session.suspicious ? (
                            <AlertTriangle className="w-4 h-4 text-destructive" />
                          ) : (
                            <User className="w-4 h-4 text-secondary" />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold">{session.name}</div>
                          <div className="text-xs font-mono text-muted-foreground">{session.admin}</div>
                        </div>
                      </div>

                      <div>
                        <Badge 
                          variant={
                            session.action === "Login" ? "secondary" :
                            session.action === "Active Session" ? "default" :
                            "destructive"
                          }
                          className="font-mono"
                        >
                          {session.action}
                        </Badge>
                      </div>

                      <div className="text-sm">
                        <div className="font-mono">{session.timestamp}</div>
                        <div className="text-muted-foreground">Duration: {session.duration}</div>
                      </div>

                      <div className="text-sm">
                        <div className="font-mono">{session.ip}</div>
                        <div className="text-muted-foreground">{session.location}</div>
                      </div>

                      <div className="text-sm text-muted-foreground">
                        {session.device}
                      </div>

                      <div className="flex justify-end">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="neon-button"
                          data-testid={`button-details-${session.id}`}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <Card className="cyber-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-accent" />
                <span>Admin Action History</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  {
                    id: "action-001",
                    admin: "admin-001",
                    action: "APPROVE",
                    target: "Content Item #12847",
                    reason: "Compliant with community guidelines",
                    timestamp: "2024-01-15 15:23:07",
                    ip: "192.168.1.101",
                    severity: "normal"
                  },
                  {
                    id: "action-002", 
                    admin: "admin-002",
                    action: "REJECT",
                    target: "Content Item #12848",
                    reason: "Contains inappropriate sexual content",
                    timestamp: "2024-01-15 15:20:15",
                    ip: "10.0.0.55", 
                    severity: "normal"
                  },
                  {
                    id: "action-003",
                    admin: "executive-001", 
                    action: "VAULT",
                    target: "Content Item #12849",
                    reason: "Suspected illegal content - escalated to vault",
                    timestamp: "2024-01-15 14:55:33",
                    ip: "172.16.0.10",
                    severity: "critical"
                  },
                  {
                    id: "action-004",
                    admin: "admin-001",
                    action: "ESCALATE",
                    target: "Live Stream #5634", 
                    reason: "Borderline content requiring executive review",
                    timestamp: "2024-01-15 14:42:22",
                    ip: "192.168.1.101",
                    severity: "high"
                  }
                ].map((action) => (
                  <div 
                    key={action.id}
                    className={`p-4 rounded-lg border font-mono text-sm ${
                      action.severity === 'critical' ? 'border-destructive/50 bg-destructive/5' :
                      action.severity === 'high' ? 'border-accent/50 bg-accent/5' :
                      'border-border/30 bg-card/30'
                    }`}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                      <div>
                        <div className="font-semibold">{action.timestamp}</div>
                        <div className="text-muted-foreground">{action.admin}</div>
                      </div>

                      <div>
                        <Badge 
                          variant={
                            action.action === "APPROVE" ? "secondary" :
                            action.action === "REJECT" ? "destructive" :
                            action.action === "VAULT" ? "destructive" :
                            "default"
                          }
                          className="font-bold"
                        >
                          {action.action}
                        </Badge>
                      </div>

                      <div>
                        <div className="font-medium">{action.target}</div>
                        <div className="text-muted-foreground text-xs">{action.ip}</div>
                      </div>

                      <div className="text-muted-foreground">
                        {action.reason}
                      </div>

                      <div className="flex justify-end">
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="neon-button"
                          data-testid={`button-audit-${action.id}`}
                        >
                          Full Audit
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="realtime" className="space-y-4">
          <Card className="cyber-card bg-gradient-to-br from-background to-muted/10">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-secondary rounded-full cyber-pulse"></div>
                <span>Live Activity Feed</span>
                <Badge variant="secondary" className="ml-auto">LIVE</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 font-mono text-sm max-h-96 overflow-y-auto">
                <div className="flex items-center justify-between py-2 border-b border-border/20">
                  <span className="text-muted-foreground">15:23:07.245</span>
                  <span className="text-secondary">admin-001</span>
                  <span className="text-primary">CONTENT_APPROVE</span>
                  <span className="text-accent">item-12847</span>
                  <span className="text-muted-foreground">192.168.1.101</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/20">
                  <span className="text-muted-foreground">15:22:58.891</span>
                  <span className="text-secondary">admin-002</span>
                  <span className="text-destructive">CONTENT_REJECT</span>
                  <span className="text-accent">item-12848</span>
                  <span className="text-muted-foreground">10.0.0.55</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/20">
                  <span className="text-muted-foreground">15:22:45.123</span>
                  <span className="text-secondary">system</span>
                  <span className="text-primary">AUTO_BLOCK</span>
                  <span className="text-accent">item-12849</span>
                  <span className="text-muted-foreground">automated</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/20">
                  <span className="text-muted-foreground">15:22:33.456</span>
                  <span className="text-secondary">admin-001</span>
                  <span className="text-accent">SESSION_START</span>
                  <span className="text-accent">dashboard</span>
                  <span className="text-muted-foreground">192.168.1.101</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}