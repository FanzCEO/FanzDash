import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Settings,
  Link,
  Shield,
  Workflow,
  Calendar,
  UserPlus,
  Trash2,
  Play,
  Clock,
  CheckCircle2,
} from "lucide-react";

export default function AdminConfigPanel() {
  const [platforms] = useState([
    "BoyFanz", "GirlFanz", "TransFanz", "BearFanz", "PupFanz",
    "CougarFanz", "FemmeFanz", "FanzUncut", "FanzDiscreet", "TabooFanz",
  ]);
  const [selectedPlatform, setSelectedPlatform] = useState("BoyFanz");
  const [oauthConnections, setOauthConnections] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [scheduled, setScheduled] = useState<any[]>([]);
  const [calendarIntegrations, setCalendarIntegrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    await Promise.all([
      fetchOAuthConnections(),
      fetchPermissions(),
      fetchWorkflows(),
      fetchScheduled(),
      fetchCalendarIntegrations(),
    ]);
  };

  const fetchOAuthConnections = async () => {
    try {
      const response = await fetch("/api/oauth/connections");
      if (response.ok) {
        const data = await response.json();
        setOauthConnections(data.connections || []);
      }
    } catch (error) {
      console.error("Error fetching OAuth connections:", error);
    }
  };

  const fetchPermissions = async () => {
    try {
      const response = await fetch(`/api/access/granted?platformId=${selectedPlatform}`);
      if (response.ok) {
        const data = await response.json();
        setPermissions(data.permissions || []);
      }
    } catch (error) {
      console.error("Error fetching permissions:", error);
    }
  };

  const fetchWorkflows = async () => {
    try {
      const response = await fetch(`/api/workflows?platformId=${selectedPlatform}`);
      if (response.ok) {
        const data = await response.json();
        setWorkflows(data.workflows || []);
      }
    } catch (error) {
      console.error("Error fetching workflows:", error);
    }
  };

  const fetchScheduled = async () => {
    try {
      const response = await fetch(`/api/schedule/content?platformId=${selectedPlatform}`);
      if (response.ok) {
        const data = await response.json();
        setScheduled(data.scheduled || []);
      }
    } catch (error) {
      console.error("Error fetching scheduled content:", error);
    }
  };

  const fetchCalendarIntegrations = async () => {
    try {
      const response = await fetch("/api/schedule/calendars");
      if (response.ok) {
        const data = await response.json();
        setCalendarIntegrations(data.integrations || []);
      }
    } catch (error) {
      console.error("Error fetching calendar integrations:", error);
    }
  };

  const handleOAuthConnect = async (provider: string) => {
    try {
      const response = await fetch(`/api/oauth/${provider}/authorize`);
      if (response.ok) {
        const data = await response.json();
        window.location.href = data.authUrl;
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to initiate OAuth flow", variant: "destructive" });
    }
  };

  const handleOAuthDisconnect = async (provider: string) => {
    try {
      const response = await fetch(`/api/oauth/connections/${provider}`, {
        method: "DELETE",
      });
      if (response.ok) {
        toast({ title: "Success", description: `Disconnected from ${provider}` });
        fetchOAuthConnections();
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to disconnect", variant: "destructive" });
    }
  };

  const handleRevokePermission = async (permissionId: string) => {
    try {
      const response = await fetch(`/api/access/revoke`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          granteeId: permissionId,
          platformId: selectedPlatform,
        }),
      });
      if (response.ok) {
        toast({ title: "Success", description: "Permission revoked" });
        fetchPermissions();
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to revoke permission", variant: "destructive" });
    }
  };

  const handleExecuteWorkflow = async (workflowId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/workflows/${workflowId}/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context: {} }),
      });
      if (response.ok) {
        toast({ title: "Success", description: "Workflow executed" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to execute workflow", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWorkflow = async (workflowId: string) => {
    try {
      const response = await fetch(`/api/workflows/${workflowId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        toast({ title: "Success", description: "Workflow deleted" });
        fetchWorkflows();
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete workflow", variant: "destructive" });
    }
  };

  const handleCancelScheduled = async (contentId: string) => {
    try {
      const response = await fetch(`/api/schedule/content/${contentId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        toast({ title: "Success", description: "Scheduled content cancelled" });
        fetchScheduled();
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to cancel content", variant: "destructive" });
    }
  };

  const handleDisconnectCalendar = async (provider: string) => {
    try {
      const response = await fetch(`/api/schedule/calendars/${provider}`, {
        method: "DELETE",
      });
      if (response.ok) {
        toast({ title: "Success", description: `Calendar disconnected` });
        fetchCalendarIntegrations();
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to disconnect calendar", variant: "destructive" });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Configuration Panel</h1>
          <p className="text-muted-foreground">
            Centralized control for all platforms and integrations
          </p>
        </div>
        <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {platforms.map((platform) => (
              <SelectItem key={platform} value={platform}>
                {platform}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="oauth" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="oauth">
            <Link className="mr-2 h-4 w-4" />
            Social OAuth
          </TabsTrigger>
          <TabsTrigger value="permissions">
            <Shield className="mr-2 h-4 w-4" />
            Permissions
          </TabsTrigger>
          <TabsTrigger value="workflows">
            <Workflow className="mr-2 h-4 w-4" />
            Workflows
          </TabsTrigger>
          <TabsTrigger value="scheduling">
            <Calendar className="mr-2 h-4 w-4" />
            Scheduling
          </TabsTrigger>
          <TabsTrigger value="calendars">
            <Clock className="mr-2 h-4 w-4" />
            Calendars
          </TabsTrigger>
        </TabsList>

        {/* OAuth Connections Tab */}
        <TabsContent value="oauth" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Social Media Connections</CardTitle>
              <CardDescription>
                Manage OAuth connections for social media integrations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {["google", "facebook", "twitter", "tiktok", "reddit", "instagram", "patreon"].map(
                  (provider) => {
                    const connection = oauthConnections.find((c) => c.provider === provider);
                    return (
                      <Card key={provider}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-medium capitalize">{provider}</span>
                              {connection && <Badge variant="secondary">Connected</Badge>}
                            </div>
                            {connection ? (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleOAuthDisconnect(provider)}
                              >
                                Disconnect
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOAuthConnect(provider)}
                              >
                                Connect
                              </Button>
                            )}
                          </div>
                          {connection && (
                            <div className="mt-2 text-sm text-muted-foreground">
                              {connection.profileData?.displayName || connection.profileData?.username}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  }
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Delegated Access Permissions Tab */}
        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Delegated Access Permissions</CardTitle>
              <CardDescription>
                Manage access permissions for {selectedPlatform}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {permissions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No permissions granted yet
                </div>
              ) : (
                <div className="space-y-2">
                  {permissions.map((permission) => (
                    <div
                      key={permission.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <div className="font-medium">
                          {permission.granteeId}
                          <Badge className="ml-2" variant="secondary">
                            {permission.accessType}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {permission.canAccessContent && "Content Access • "}
                          {permission.canModerateContent && "Moderation • "}
                          {permission.canManageUsers && "User Management • "}
                          {permission.canViewAnalytics && "Analytics • "}
                          {permission.canManageSettings && "Settings • "}
                          {permission.canManagePayments && "Payments"}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRevokePermission(permission.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Workflows Tab */}
        <TabsContent value="workflows" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Automation Workflows</CardTitle>
              <CardDescription>
                Active workflows for {selectedPlatform}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {workflows.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No workflows created yet
                </div>
              ) : (
                <div className="space-y-2">
                  {workflows.map((workflow) => (
                    <div
                      key={workflow.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <div className="font-medium">{workflow.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {workflow.category} • {workflow.executionCount || 0} executions
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleExecuteWorkflow(workflow.id)}
                          disabled={loading}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Run
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteWorkflow(workflow.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Scheduling Tab */}
        <TabsContent value="scheduling" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Content</CardTitle>
              <CardDescription>
                Upcoming scheduled posts for {selectedPlatform}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {scheduled.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No scheduled content
                </div>
              ) : (
                <div className="space-y-2">
                  {scheduled.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <div className="font-medium">{item.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.contentType} •{" "}
                          {new Date(item.scheduledFor).toLocaleString()}
                          {item.status === "scheduled" && (
                            <Badge className="ml-2" variant="secondary">
                              Scheduled
                            </Badge>
                          )}
                          {item.status === "published" && (
                            <Badge className="ml-2" variant="default">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Published
                            </Badge>
                          )}
                        </div>
                      </div>
                      {item.status === "scheduled" && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleCancelScheduled(item.id)}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Calendar Integrations Tab */}
        <TabsContent value="calendars" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Calendar Integrations</CardTitle>
              <CardDescription>
                External calendar sync (Google, Outlook, Apple)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {calendarIntegrations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No calendars connected
                </div>
              ) : (
                <div className="space-y-2">
                  {calendarIntegrations.map((integration) => (
                    <div
                      key={integration.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <div className="font-medium capitalize">
                          {integration.provider} Calendar
                          {integration.syncEnabled && (
                            <Badge className="ml-2" variant="secondary">
                              Syncing
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Direction: {integration.syncDirection} •
                          Last sync:{" "}
                          {integration.lastSyncAt
                            ? new Date(integration.lastSyncAt).toLocaleString()
                            : "Never"}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDisconnectCalendar(integration.provider)}
                      >
                        Disconnect
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
