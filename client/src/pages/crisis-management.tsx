import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Zap, Clock, Users, Phone, Mail, MessageSquare, CheckCircle, XCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Crisis {
  id: string;
  title: string;
  severity: "critical" | "high" | "medium" | "low";
  status: "active" | "contained" | "resolved" | "escalated";
  type: string;
  description: string;
  platform: string;
  impactedUsers: number;
  reportedAt: string;
  lastUpdate: string;
  assignedTeam: string[];
  actions: {
    id: string;
    action: string;
    timestamp: string;
    user: string;
    status: string;
  }[];
}

export default function CrisisManagementPage() {
  const [showNewIncident, setShowNewIncident] = useState(false);
  const [selectedCrisis, setSelectedCrisis] = useState<Crisis | null>(null);
  const [newIncident, setNewIncident] = useState({
    title: "",
    severity: "medium",
    type: "",
    description: "",
    platform: ""
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: activeCrises, isLoading } = useQuery({
    queryKey: ["/api/crisis/active"],
    refetchInterval: 5000,
  });

  const createIncidentMutation = useMutation({
    mutationFn: async (incident: any) => {
      return apiRequest("/api/crisis/incidents", "POST", incident);
    },
    onSuccess: () => {
      toast({
        title: "Crisis Incident Created",
        description: "New incident has been logged and response team notified"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/crisis/active"] });
      setShowNewIncident(false);
      setNewIncident({ title: "", severity: "medium", type: "", description: "", platform: "" });
    },
  });

  const escalateIncidentMutation = useMutation({
    mutationFn: async ({ id, escalationLevel }: { id: string; escalationLevel: string }) => {
      return apiRequest(`/api/crisis/incidents/${id}/escalate`, "POST", { escalationLevel });
    },
    onSuccess: () => {
      toast({
        title: "Incident Escalated",
        description: "Senior management and external partners have been notified"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/crisis/active"] });
    },
  });

  const mockCrises: Crisis[] = [
    {
      id: "crisis-001",
      title: "Mass Content Upload Attack",
      severity: "critical",
      status: "active",
      type: "Security Breach",
      description: "Coordinated bot attack uploading thousands of CSAM content across multiple platforms simultaneously. Immediate containment required.",
      platform: "All Platforms",
      impactedUsers: 45000,
      reportedAt: new Date().toISOString(),
      lastUpdate: new Date(Date.now() - 300000).toISOString(),
      assignedTeam: ["Crisis Team Alpha", "Legal Department", "Law Enforcement Liaison"],
      actions: [
        { id: "act-001", action: "Emergency content freeze activated", timestamp: new Date().toISOString(), user: "System", status: "completed" },
        { id: "act-002", action: "Law enforcement contacted", timestamp: new Date(Date.now() - 180000).toISOString(), user: "Legal Team", status: "completed" },
        { id: "act-003", action: "Public statement prepared", timestamp: new Date(Date.now() - 120000).toISOString(), user: "PR Team", status: "in_progress" },
        { id: "act-004", action: "User notification system activated", timestamp: new Date(Date.now() - 60000).toISOString(), user: "Communications", status: "pending" }
      ]
    },
    {
      id: "crisis-002",
      title: "Data Breach - User Information Exposed",
      severity: "high",
      status: "contained",
      type: "Data Security",
      description: "Unauthorized access detected to user database containing personal information of premium subscribers. Breach contained but investigation ongoing.",
      platform: "FanzMain Adult",
      impactedUsers: 12500,
      reportedAt: new Date(Date.now() - 3600000).toISOString(),
      lastUpdate: new Date(Date.now() - 600000).toISOString(),
      assignedTeam: ["Security Team", "Data Protection Officer", "External Security Consultant"],
      actions: [
        { id: "act-005", action: "Security breach contained", timestamp: new Date(Date.now() - 3000000).toISOString(), user: "Security Team", status: "completed" },
        { id: "act-006", action: "Affected users notified", timestamp: new Date(Date.now() - 2400000).toISOString(), user: "Communications", status: "completed" },
        { id: "act-007", action: "External audit initiated", timestamp: new Date(Date.now() - 1800000).toISOString(), user: "Compliance", status: "in_progress" }
      ]
    },
    {
      id: "crisis-003",
      title: "Celebrity Content Leak",
      severity: "high",
      status: "escalated",
      type: "PR Crisis",
      description: "Private content from high-profile celebrity leaked on platform. Media attention growing rapidly. Legal action threatened.",
      platform: "FanzLive Streaming",
      impactedUsers: 250000,
      reportedAt: new Date(Date.now() - 7200000).toISOString(),
      lastUpdate: new Date(Date.now() - 900000).toISOString(),
      assignedTeam: ["PR Crisis Team", "Legal Department", "Executive Leadership"],
      actions: [
        { id: "act-008", action: "Content immediately removed", timestamp: new Date(Date.now() - 6600000).toISOString(), user: "Moderation Team", status: "completed" },
        { id: "act-009", action: "Legal team contacted celebrity representatives", timestamp: new Date(Date.now() - 5400000).toISOString(), user: "Legal", status: "completed" },
        { id: "act-010", action: "Media statement released", timestamp: new Date(Date.now() - 3600000).toISOString(), user: "PR Team", status: "completed" }
      ]
    }
  ];

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return <Badge className="bg-red-600 animate-pulse"><AlertTriangle className="w-3 h-3 mr-1" />CRITICAL</Badge>;
      case "high":
        return <Badge className="bg-orange-600">HIGH</Badge>;
      case "medium":
        return <Badge className="bg-yellow-600">MEDIUM</Badge>;
      case "low":
        return <Badge className="bg-blue-600">LOW</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-red-600 animate-pulse">ACTIVE</Badge>;
      case "contained":
        return <Badge className="bg-yellow-600">CONTAINED</Badge>;
      case "resolved":
        return <Badge className="bg-green-600">RESOLVED</Badge>;
      case "escalated":
        return <Badge className="bg-purple-600">ESCALATED</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getActionStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "in_progress":
        return <Clock className="w-4 h-4 text-yellow-500 animate-spin" />;
      case "pending":
        return <Clock className="w-4 h-4 text-gray-500" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen cyber-bg flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 mx-auto mb-4 cyber-pulse text-primary" />
          <p className="cyber-text-glow">Loading Crisis Management Center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen cyber-bg">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold cyber-text-glow">Crisis Management Center</h1>
            <p className="text-muted-foreground">Emergency Response & Incident Coordination</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium">{mockCrises.filter(c => c.status === 'active').length} Active Crises</span>
            </div>
            <Dialog open={showNewIncident} onOpenChange={setShowNewIncident}>
              <DialogTrigger asChild>
                <Button className="bg-red-600 hover:bg-red-700 text-white" data-testid="report-incident">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Report Incident
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md cyber-card">
                <DialogHeader>
                  <DialogTitle className="cyber-text-glow">Report New Crisis Incident</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Incident Title</label>
                    <Input
                      value={newIncident.title}
                      onChange={(e) => setNewIncident({...newIncident, title: e.target.value})}
                      placeholder="Brief description of the crisis"
                      className="glass-effect"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Severity Level</label>
                    <Select value={newIncident.severity} onValueChange={(value) => setNewIncident({...newIncident, severity: value})}>
                      <SelectTrigger className="glass-effect">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="critical">Critical - Immediate Response Required</SelectItem>
                        <SelectItem value="high">High - Urgent Response Needed</SelectItem>
                        <SelectItem value="medium">Medium - Standard Response</SelectItem>
                        <SelectItem value="low">Low - Monitor and Assess</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Crisis Type</label>
                    <Select value={newIncident.type} onValueChange={(value) => setNewIncident({...newIncident, type: value})}>
                      <SelectTrigger className="glass-effect">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Security Breach">Security Breach</SelectItem>
                        <SelectItem value="Data Security">Data Security</SelectItem>
                        <SelectItem value="Content Crisis">Content Crisis</SelectItem>
                        <SelectItem value="PR Crisis">PR Crisis</SelectItem>
                        <SelectItem value="Legal Issue">Legal Issue</SelectItem>
                        <SelectItem value="System Failure">System Failure</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Affected Platform</label>
                    <Select value={newIncident.platform} onValueChange={(value) => setNewIncident({...newIncident, platform: value})}>
                      <SelectTrigger className="glass-effect">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All Platforms">All Platforms</SelectItem>
                        <SelectItem value="FanzMain Adult">FanzMain Adult</SelectItem>
                        <SelectItem value="FanzLive Streaming">FanzLive Streaming</SelectItem>
                        <SelectItem value="FanzSocial Community">FanzSocial Community</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Detailed Description</label>
                    <Textarea
                      value={newIncident.description}
                      onChange={(e) => setNewIncident({...newIncident, description: e.target.value})}
                      placeholder="Provide detailed information about the crisis situation..."
                      className="glass-effect"
                      rows={4}
                    />
                  </div>
                  <Button 
                    onClick={() => createIncidentMutation.mutate(newIncident)}
                    disabled={createIncidentMutation.isPending}
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                    data-testid="create-incident"
                  >
                    {createIncidentMutation.isPending ? "Creating..." : "Create Crisis Incident"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Emergency Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="cyber-card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-400 cyber-text-glow animate-pulse">
                {mockCrises.filter(c => c.status === 'active').length}
              </div>
              <div className="text-sm text-muted-foreground">Active Crises</div>
            </CardContent>
          </Card>
          <Card className="cyber-card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-400 cyber-text-glow">
                {mockCrises.filter(c => c.severity === 'critical').length}
              </div>
              <div className="text-sm text-muted-foreground">Critical Level</div>
            </CardContent>
          </Card>
          <Card className="cyber-card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary cyber-text-glow">
                {mockCrises.reduce((sum, crisis) => sum + crisis.impactedUsers, 0).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Users Affected</div>
            </CardContent>
          </Card>
          <Card className="cyber-card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-400 cyber-text-glow">
                {mockCrises.filter(c => c.status === 'resolved').length}
              </div>
              <div className="text-sm text-muted-foreground">Resolved Today</div>
            </CardContent>
          </Card>
          <Card className="cyber-card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-400 cyber-text-glow">2.4h</div>
              <div className="text-sm text-muted-foreground">Avg Response Time</div>
            </CardContent>
          </Card>
        </div>

        {/* Active Crisis List */}
        <Card className="cyber-card neural-network">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-6 h-6 text-primary cyber-pulse" />
              <span className="cyber-text-glow">ACTIVE CRISIS SITUATIONS</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockCrises.map((crisis) => (
                <div key={crisis.id} className="p-6 cyber-card border border-primary/20 cursor-pointer hover:border-primary/40 transition-colors"
                     onClick={() => setSelectedCrisis(crisis)}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-lg">{crisis.title}</h3>
                        {getSeverityBadge(crisis.severity)}
                        {getStatusBadge(crisis.status)}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                        <span>{crisis.type}</span>
                        <span>•</span>
                        <span>{crisis.platform}</span>
                        <span>•</span>
                        <span><Users className="w-3 h-3 inline mr-1" />{crisis.impactedUsers.toLocaleString()} affected</span>
                      </div>
                      <p className="text-sm mb-3">{crisis.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span>Reported: {new Date(crisis.reportedAt).toLocaleString()}</span>
                        <span>•</span>
                        <span>Last Update: {new Date(crisis.lastUpdate).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" className="bg-blue-600 hover:bg-blue-700 text-white">
                          <MessageSquare className="w-3 h-3 mr-1" />
                          Communicate
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            escalateIncidentMutation.mutate({ id: crisis.id, escalationLevel: "executive" });
                          }}
                          data-testid={`escalate-${crisis.id}`}
                        >
                          <Zap className="w-3 h-3 mr-1" />
                          Escalate
                        </Button>
                      </div>
                      <div className="text-xs text-right">
                        <div>Response Team:</div>
                        {crisis.assignedTeam.map((team, idx) => (
                          <div key={idx} className="text-primary">{team}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Recent Actions */}
                  <div className="border-t border-primary/20 pt-3">
                    <h4 className="text-sm font-medium mb-2">Recent Actions:</h4>
                    <div className="space-y-1">
                      {crisis.actions.slice(-2).map((action) => (
                        <div key={action.id} className="flex items-center space-x-3 text-sm">
                          {getActionStatusIcon(action.status)}
                          <span className="flex-1">{action.action}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(action.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Crisis Communication Center */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="cyber-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Phone className="w-5 h-5 text-green-500" />
                <span>Emergency Contacts</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Crisis Team Lead</span>
                  <Button size="sm" variant="outline" className="text-xs">
                    Call Now
                  </Button>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Legal Department</span>
                  <Button size="sm" variant="outline" className="text-xs">
                    Call Now
                  </Button>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Law Enforcement</span>
                  <Button size="sm" variant="outline" className="text-xs">
                    Call Now
                  </Button>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">PR Agency</span>
                  <Button size="sm" variant="outline" className="text-xs">
                    Call Now
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cyber-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="w-5 h-5 text-blue-500" />
                <span>Mass Communications</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button size="sm" className="w-full justify-start">
                  Send User Notification
                </Button>
                <Button size="sm" variant="outline" className="w-full justify-start">
                  Alert Staff
                </Button>
                <Button size="sm" variant="outline" className="w-full justify-start">
                  Notify Partners
                </Button>
                <Button size="sm" variant="outline" className="w-full justify-start">
                  Media Statement
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="cyber-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                <span>Quick Actions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button size="sm" variant="destructive" className="w-full justify-start">
                  Emergency Content Freeze
                </Button>
                <Button size="sm" variant="destructive" className="w-full justify-start">
                  Platform Lockdown
                </Button>
                <Button size="sm" className="w-full justify-start bg-orange-600 hover:bg-orange-700">
                  Activate Backup Systems
                </Button>
                <Button size="sm" variant="outline" className="w-full justify-start">
                  Generate Crisis Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}