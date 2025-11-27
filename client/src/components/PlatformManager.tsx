import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Globe,
  Plus,
  Settings,
  Activity,
  Shield,
  Eye,
  Zap,
  Network,
  Database,
  Cloud,
  Server,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
  FileText,
  Lock,
  Unlock,
} from "lucide-react";

interface Platform {
  id: string;
  name: string;
  domain: string;
  niche: string;
  status: "active" | "inactive" | "maintenance" | "error";
  apiEndpoint: string;
  apiKey?: string;
  webhookUrl: string;
  moderationRules: {
    autoBlock: boolean;
    riskThreshold: number;
    requireManualReview: boolean;
    allowedContentTypes: string[];
    blockedKeywords: string[];
    customRules: string[];
  };
  stats: {
    totalContent: number;
    dailyContent: number;
    blockedContent: number;
    flaggedContent: number;
    lastSync: string;
  };
  createdAt: string;
  lastActive: string;
}

interface PlatformConnection {
  platformId: string;
  connectionType: "webhook" | "api" | "direct";
  status: "connected" | "disconnected" | "error";
  lastHeartbeat: string;
  latency: number;
  errorCount: number;
}

export function PlatformManager() {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(
    null,
  );
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newPlatform, setNewPlatform] = useState({
    name: "",
    domain: "",
    niche: "",
    apiEndpoint: "",
    webhookUrl: "",
    riskThreshold: 0.7,
    autoBlock: true,
    requireManualReview: false,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: platforms = [], isLoading } = useQuery<Platform[]>({
    queryKey: ["/api/platforms"],
    refetchInterval: 10000,
  });

  const { data: connections = [] } = useQuery<PlatformConnection[]>({
    queryKey: ["/api/platforms/connections"],
    refetchInterval: 5000,
  });

  const { data: platformStats } = useQuery({
    queryKey: ["/api/platforms/stats"],
    refetchInterval: 30000,
  });

  const addPlatformMutation = useMutation({
    mutationFn: async (platform: any) => {
      return apiRequest("/api/platforms", "POST", platform);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/platforms"] });
      toast({
        title: "Platform Added",
        description: "New platform has been successfully connected.",
      });
      setShowAddDialog(false);
      setNewPlatform({
        name: "",
        domain: "",
        niche: "",
        apiEndpoint: "",
        webhookUrl: "",
        riskThreshold: 0.7,
        autoBlock: true,
        requireManualReview: false,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Connection Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updatePlatformMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      return apiRequest(`/api/platforms/${id}`, "PATCH", updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/platforms"] });
      toast({
        title: "Platform Updated",
        description: "Platform settings have been saved.",
      });
    },
  });

  const testConnectionMutation = useMutation({
    mutationFn: async (platformId: string) => {
      return apiRequest(`/api/platforms/${platformId}/test`, "POST");
    },
    onSuccess: (data: any) => {
      toast({
        title: "Connection Test",
        description: `Connection successful! Latency: ${data.latency}ms`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Connection Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4 text-secondary" />;
      case "inactive":
        return <Clock className="w-4 h-4 text-muted-foreground" />;
      case "maintenance":
        return <Settings className="w-4 h-4 text-accent" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-secondary text-secondary-foreground";
      case "inactive":
        return "bg-muted text-muted-foreground";
      case "maintenance":
        return "bg-accent text-accent-foreground";
      case "error":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getNicheIcon = (niche: string) => {
    const lowerNiche = niche.toLowerCase();
    if (lowerNiche.includes("adult"))
      return <Lock className="w-4 h-4 text-destructive" />;
    if (lowerNiche.includes("dating"))
      return <Users className="w-4 h-4 text-primary" />;
    if (lowerNiche.includes("social"))
      return <Network className="w-4 h-4 text-secondary" />;
    if (lowerNiche.includes("gaming"))
      return <Zap className="w-4 h-4 text-accent" />;
    return <Globe className="w-4 h-4 text-muted-foreground" />;
  };

  if (isLoading) {
    return (
      <Card className="cyber-card">
        <CardHeader>
          <CardTitle>Platform Manager</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-4 border border-border/30 rounded-lg animate-pulse"
              >
                <div className="h-4 bg-muted/30 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted/20 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Platform Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="cyber-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary cyber-text-glow">
              {platforms.length}
            </div>
            <div className="text-sm text-muted-foreground">
              Connected Platforms
            </div>
          </CardContent>
        </Card>
        <Card className="cyber-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-secondary cyber-text-glow">
              {platforms.filter((p) => p.status === "active").length}
            </div>
            <div className="text-sm text-muted-foreground">Active</div>
          </CardContent>
        </Card>
        <Card className="cyber-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-accent cyber-text-glow">
              {(platformStats as any)?.totalContent || 0}
            </div>
            <div className="text-sm text-muted-foreground">Total Content</div>
          </CardContent>
        </Card>
        <Card className="cyber-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-destructive cyber-text-glow">
              {(platformStats as any)?.flaggedContent || 0}
            </div>
            <div className="text-sm text-muted-foreground">Flagged Today</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Platform Manager */}
      <Card className="cyber-card neural-network">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Globe className="w-6 h-6 text-primary cyber-pulse" />
              <span className="cyber-text-glow">
                MULTI-PLATFORM CONTROL CENTER
              </span>
            </CardTitle>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button
                  className="neon-button"
                  data-testid="add-platform-button"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Platform
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl cyber-card">
                <DialogHeader>
                  <DialogTitle className="cyber-text-glow">
                    Add New Platform
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Platform Name
                      </label>
                      <Input
                        value={newPlatform.name}
                        onChange={(e) =>
                          setNewPlatform({
                            ...newPlatform,
                            name: e.target.value,
                          })
                        }
                        placeholder="e.g., FanzDash Platform Main"
                        className="glass-effect"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Domain
                      </label>
                      <Input
                        value={newPlatform.domain}
                        onChange={(e) =>
                          setNewPlatform({
                            ...newPlatform,
                            domain: e.target.value,
                          })
                        }
                        placeholder="e.g., main.fanzplatform.com"
                        className="glass-effect"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Niche
                      </label>
                      <Select
                        value={newPlatform.niche}
                        onValueChange={(value) =>
                          setNewPlatform({ ...newPlatform, niche: value })
                        }
                      >
                        <SelectTrigger className="glass-effect">
                          <SelectValue placeholder="Select niche" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="adult_content">
                            Adult Content
                          </SelectItem>
                          <SelectItem value="dating_social">
                            Dating & Social
                          </SelectItem>
                          <SelectItem value="gaming_entertainment">
                            Gaming & Entertainment
                          </SelectItem>
                          <SelectItem value="social_media">
                            Social Media
                          </SelectItem>
                          <SelectItem value="content_creation">
                            Content Creation
                          </SelectItem>
                          <SelectItem value="live_streaming">
                            Live Streaming
                          </SelectItem>
                          <SelectItem value="marketplace">
                            Marketplace
                          </SelectItem>
                          <SelectItem value="community_forum">
                            Community Forum
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Risk Threshold
                      </label>
                      <Select
                        value={newPlatform.riskThreshold.toString()}
                        onValueChange={(value) =>
                          setNewPlatform({
                            ...newPlatform,
                            riskThreshold: parseFloat(value),
                          })
                        }
                      >
                        <SelectTrigger className="glass-effect">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0.3">Low (30%)</SelectItem>
                          <SelectItem value="0.5">Medium (50%)</SelectItem>
                          <SelectItem value="0.7">High (70%)</SelectItem>
                          <SelectItem value="0.9">Critical (90%)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      API Endpoint
                    </label>
                    <Input
                      value={newPlatform.apiEndpoint}
                      onChange={(e) =>
                        setNewPlatform({
                          ...newPlatform,
                          apiEndpoint: e.target.value,
                        })
                      }
                      placeholder="https://api.platform.com/v1"
                      className="glass-effect"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Webhook URL
                    </label>
                    <Input
                      value={newPlatform.webhookUrl}
                      onChange={(e) =>
                        setNewPlatform({
                          ...newPlatform,
                          webhookUrl: e.target.value,
                        })
                      }
                      placeholder="https://webhooks.platform.com/moderation"
                      className="glass-effect"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={newPlatform.autoBlock}
                        onCheckedChange={(checked) =>
                          setNewPlatform({ ...newPlatform, autoBlock: checked })
                        }
                      />
                      <label className="text-sm">
                        Auto-block flagged content
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={newPlatform.requireManualReview}
                        onCheckedChange={(checked) =>
                          setNewPlatform({
                            ...newPlatform,
                            requireManualReview: checked,
                          })
                        }
                      />
                      <label className="text-sm">Require manual review</label>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowAddDialog(false)}
                      className="glass-effect"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => addPlatformMutation.mutate(newPlatform)}
                      disabled={addPlatformMutation.isPending}
                      className="neon-button"
                      data-testid="submit-platform"
                    >
                      Connect Platform
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {platforms.map((platform) => {
              const connection = connections.find(
                (c) => c.platformId === platform.id,
              );
              return (
                <div
                  key={platform.id}
                  className="p-6 border border-border/30 rounded-lg glass-effect hover:bg-primary/5 transition-all duration-300"
                  data-testid={`platform-${platform.id}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 rounded-lg bg-primary/20 border border-primary/30">
                        {getNicheIcon(platform.niche)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-3 mb-1">
                          <h3 className="text-lg font-semibold">
                            {platform.name}
                          </h3>
                          <Badge className={getStatusColor(platform.status)}>
                            {getStatusIcon(platform.status)}
                            <span className="ml-1">
                              {platform.status.toUpperCase()}
                            </span>
                          </Badge>
                          <Badge variant="outline">
                            {platform.niche.replace("_", " ").toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <Globe className="w-3 h-3 inline mr-1" />
                          {platform.domain}
                          {" • "}
                          Risk threshold:{" "}
                          {(
                            platform.moderationRules.riskThreshold * 100
                          ).toFixed(0)}
                          %
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          testConnectionMutation.mutate(platform.id)
                        }
                        disabled={testConnectionMutation.isPending}
                        className="glass-effect"
                        data-testid={`test-connection-${platform.id}`}
                      >
                        <Activity className="w-4 h-4 mr-1" />
                        Test
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedPlatform(platform)}
                            className="glass-effect"
                            data-testid={`configure-${platform.id}`}
                          >
                            <Settings className="w-4 h-4 mr-1" />
                            Configure
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl cyber-card">
                          <DialogHeader>
                            <DialogTitle className="cyber-text-glow">
                              Platform Configuration - {selectedPlatform?.name}
                            </DialogTitle>
                          </DialogHeader>
                          {selectedPlatform && (
                            <div className="space-y-6">
                              {/* Configuration content would go here */}
                              <div className="grid grid-cols-2 gap-6">
                                <div>
                                  <h4 className="font-semibold mb-3">
                                    Connection Details
                                  </h4>
                                  <div className="space-y-2 text-sm">
                                    <div>Domain: {selectedPlatform.domain}</div>
                                    <div>
                                      API Endpoint:{" "}
                                      {selectedPlatform.apiEndpoint}
                                    </div>
                                    <div>
                                      Webhook: {selectedPlatform.webhookUrl}
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-3">
                                    Moderation Rules
                                  </h4>
                                  <div className="space-y-2 text-sm">
                                    <div>
                                      Auto Block:{" "}
                                      {selectedPlatform.moderationRules
                                        .autoBlock
                                        ? "Enabled"
                                        : "Disabled"}
                                    </div>
                                    <div>
                                      Manual Review:{" "}
                                      {selectedPlatform.moderationRules
                                        .requireManualReview
                                        ? "Required"
                                        : "Optional"}
                                    </div>
                                    <div>
                                      Risk Threshold:{" "}
                                      {(
                                        selectedPlatform.moderationRules
                                          .riskThreshold * 100
                                      ).toFixed(0)}
                                      %
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>

                  {/* Platform Stats */}
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-muted/20 rounded-lg">
                      <div className="text-lg font-bold text-primary">
                        {platform.stats.totalContent}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Total Content
                      </div>
                    </div>
                    <div className="text-center p-3 bg-muted/20 rounded-lg">
                      <div className="text-lg font-bold text-secondary">
                        {platform.stats.dailyContent}
                      </div>
                      <div className="text-xs text-muted-foreground">Today</div>
                    </div>
                    <div className="text-center p-3 bg-muted/20 rounded-lg">
                      <div className="text-lg font-bold text-destructive">
                        {platform.stats.blockedContent}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Blocked
                      </div>
                    </div>
                    <div className="text-center p-3 bg-muted/20 rounded-lg">
                      <div className="text-lg font-bold text-accent">
                        {platform.stats.flaggedContent}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Flagged
                      </div>
                    </div>
                  </div>

                  {/* Connection Status */}
                  {connection && (
                    <div className="mt-4 p-3 bg-muted/10 rounded-lg">
                      <div className="flex items-center justify-between text-sm">
                        <span>Connection: {connection.status}</span>
                        <span>Latency: {connection.latency}ms</span>
                        <span>
                          Last sync:{" "}
                          {new Date(
                            platform.stats.lastSync,
                          ).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
