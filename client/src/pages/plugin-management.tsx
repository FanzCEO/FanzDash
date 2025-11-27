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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Puzzle,
  Download,
  Upload,
  Settings,
  Power,
  PowerOff,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Package,
  Globe,
  Code,
  Database,
  Bot,
  CreditCard,
  Shield,
  Radio,
  Mic,
  Video,
  Image as ImageIcon,
  Search,
  Plus,
  RefreshCw,
} from "lucide-react";

interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  category:
    | "microservice"
    | "payment"
    | "ai_service"
    | "media"
    | "security"
    | "communication"
    | "analytics"
    | "integration";
  status: "active" | "inactive" | "error" | "updating";
  author: string;
  installDate: string;
  lastUpdate: string;
  dependencies: string[];
  platforms: string[];
  apiEndpoint?: string;
  configurable: boolean;
  essential: boolean;
}

interface PluginStore {
  id: string;
  name: string;
  version: string;
  description: string;
  category: string;
  downloads: number;
  rating: number;
  price: number;
  author: string;
  verified: boolean;
}

export default function PluginManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedPlugin, setSelectedPlugin] = useState<Plugin | null>(null);

  // Fetch installed plugins from API
  const { data: installedPlugins = [], isLoading: pluginsLoading } = useQuery<Plugin[]>({
    queryKey: ["/api/admin/plugins"],
    refetchInterval: 30000,
  });

  // Fetch plugin store from API
  const { data: pluginStore = [], isLoading: storeLoading } = useQuery<PluginStore[]>({
    queryKey: ["/api/admin/plugins/store"],
    refetchInterval: 60000,
  });

  const isLoading = pluginsLoading || storeLoading;

  // Removed mock data - now using API data above
  const _installedPlugins_removed: Plugin[] = [
    {
      id: "fanzos_api_gateway",
      name: "FanzOS API Gateway",
      version: "2.1.0",
      description:
        "Service orchestration, routing, and authentication for all FanzOS microservices",
      category: "microservice",
      status: "active",
      author: "Fanz™ Unlimited Network LLC",
      installDate: "2025-01-01T00:00:00Z",
      lastUpdate: "2025-01-10T10:00:00Z",
      dependencies: ["user_service", "auth_service"],
      platforms: [
        "FanzLab",
        "BoyFanz",
        "GirlFanz",
        "DaddyFanz",
        "PupFanz",
        "TabooFanz",
        "TransFanz",
        "CougarFanz",
      ],
      apiEndpoint: "/api/v2/gateway",
      configurable: true,
      essential: true,
    },
    {
      id: "openai_gpt4o_vision",
      name: "OpenAI GPT-4o Vision Analysis",
      version: "1.5.2",
      description:
        "Advanced AI-powered image and video content moderation using GPT-4o Vision",
      category: "ai_service",
      status: "active",
      author: "OpenAI Integration",
      installDate: "2025-01-05T00:00:00Z",
      lastUpdate: "2025-01-14T15:30:00Z",
      dependencies: ["content_service"],
      platforms: ["All"],
      apiEndpoint: "/api/ai/vision",
      configurable: true,
      essential: false,
    },
    {
      id: "ccbill_payment",
      name: "CCBill Payment Processor",
      version: "3.2.1",
      description:
        "Adult-friendly payment processing with CCBill integration for global transactions",
      category: "payment",
      status: "active",
      author: "CCBill Official",
      installDate: "2025-01-01T00:00:00Z",
      lastUpdate: "2025-01-08T12:00:00Z",
      dependencies: ["payment_service"],
      platforms: ["All"],
      apiEndpoint: "/api/payments/ccbill",
      configurable: true,
      essential: true,
    },
    {
      id: "live_streaming_service",
      name: "WebRTC Live Streaming",
      version: "2.0.8",
      description:
        "Low-latency live streaming infrastructure with WebRTC and RTMP support",
      category: "media",
      status: "active",
      author: "Fanz™ Media Team",
      installDate: "2025-01-01T00:00:00Z",
      lastUpdate: "2025-01-12T09:15:00Z",
      dependencies: ["media_core"],
      platforms: ["FanzLab", "GirlFanz", "BoyFanz", "TransFanz"],
      apiEndpoint: "/api/streaming/webrtc",
      configurable: true,
      essential: false,
    },
    {
      id: "podcast_service",
      name: "Podcast Management System",
      version: "1.8.5",
      description:
        "Complete podcast hosting, management, and analytics platform",
      category: "media",
      status: "active",
      author: "Fanz™ Audio Team",
      installDate: "2025-01-01T00:00:00Z",
      lastUpdate: "2025-01-15T08:30:00Z",
      dependencies: ["media_core", "analytics_service"],
      platforms: ["FanzTube", "FanzLab"],
      apiEndpoint: "/api/podcasts",
      configurable: true,
      essential: false,
    },
    {
      id: "radio_broadcasting",
      name: "Live Radio Broadcasting",
      version: "1.4.3",
      description:
        "Real-time radio broadcasting with DJ management and live chat moderation",
      category: "media",
      status: "active",
      author: "Fanz™ Radio Team",
      installDate: "2025-01-01T00:00:00Z",
      lastUpdate: "2025-01-15T07:45:00Z",
      dependencies: ["media_core", "chat_service"],
      platforms: ["FanzTube"],
      apiEndpoint: "/api/radio",
      configurable: true,
      essential: false,
    },
    {
      id: "fanzshield_security",
      name: "FanzShield Security Suite",
      version: "3.0.1",
      description:
        "Advanced DDoS protection, WAF, bot detection, and threat monitoring",
      category: "security",
      status: "active",
      author: "Fanz™ Security Team",
      installDate: "2025-01-01T00:00:00Z",
      lastUpdate: "2025-01-13T16:20:00Z",
      dependencies: [],
      platforms: ["All"],
      apiEndpoint: "/api/security/shield",
      configurable: true,
      essential: true,
    },
    {
      id: "perspective_api",
      name: "Google Perspective API",
      version: "2.1.0",
      description:
        "Text toxicity detection and harassment identification for content moderation",
      category: "ai_service",
      status: "active",
      author: "Google AI",
      installDate: "2025-01-05T00:00:00Z",
      lastUpdate: "2025-01-11T14:10:00Z",
      dependencies: ["moderation_service"],
      platforms: ["All"],
      apiEndpoint: "/api/ai/perspective",
      configurable: true,
      essential: false,
    },
    {
      id: "nowpayments_crypto",
      name: "NOWPayments Crypto Gateway",
      version: "1.6.7",
      description:
        "Adult-friendly cryptocurrency payments supporting 100+ digital currencies",
      category: "payment",
      status: "active",
      author: "NOWPayments",
      installDate: "2025-01-03T00:00:00Z",
      lastUpdate: "2025-01-09T11:30:00Z",
      dependencies: ["payment_service"],
      platforms: ["All"],
      apiEndpoint: "/api/payments/crypto",
      configurable: true,
      essential: false,
    },
    {
      id: "aws_rekognition",
      name: "AWS Rekognition Video Analysis",
      version: "2.3.1",
      description:
        "Advanced video content analysis and object detection using AWS Rekognition",
      category: "ai_service",
      status: "error",
      author: "Amazon Web Services",
      installDate: "2025-01-06T00:00:00Z",
      lastUpdate: "2025-01-14T13:45:00Z",
      dependencies: ["video_service"],
      platforms: ["All"],
      apiEndpoint: "/api/ai/rekognition",
      configurable: true,
      essential: false,
    },
  ];

  // Removed mock data - now fetching from API
  const _storePlugins_removed: PluginStore[] = [
    {
      id: "stripe_advanced",
      name: "Stripe Advanced Integration",
      version: "4.1.2",
      description:
        "Enhanced Stripe payment processing with advanced fraud detection and analytics",
      category: "payment",
      downloads: 15420,
      rating: 4.8,
      price: 29.99,
      author: "Stripe Official",
      verified: true,
    },
    {
      id: "whisper_ai",
      name: "OpenAI Whisper Audio Analysis",
      version: "1.2.8",
      description:
        "Real-time audio transcription and analysis for live streams and podcasts",
      category: "ai_service",
      downloads: 8934,
      rating: 4.6,
      price: 19.99,
      author: "OpenAI",
      verified: true,
    },
    {
      id: "coingate_crypto",
      name: "CoinGate Crypto Payments",
      version: "2.0.3",
      description:
        "European cryptocurrency payment gateway with 1% fee structure",
      category: "payment",
      downloads: 5621,
      rating: 4.4,
      price: 15.0,
      author: "CoinGate",
      verified: true,
    },
    {
      id: "twilio_sms",
      name: "Twilio SMS & Voice",
      version: "3.1.5",
      description:
        "SMS verification, notifications, and voice calling integration",
      category: "communication",
      downloads: 12078,
      rating: 4.7,
      price: 24.99,
      author: "Twilio",
      verified: true,
    },
  ];

  const handleTogglePlugin = useMutation({
    mutationFn: (pluginId: string) =>
      apiRequest(`/api/plugins/${pluginId}/toggle`, "POST"),
    onSuccess: (_, pluginId) => {
      queryClient.invalidateQueries({ queryKey: ["/api/plugins"] });
      const plugin = installedPlugins.find((p) => p.id === pluginId);
      toast({
        title: `Plugin ${plugin?.status === "active" ? "deactivated" : "activated"}`,
        description: `${plugin?.name} has been ${plugin?.status === "active" ? "stopped" : "started"} successfully`,
      });
    },
  });

  const handleInstallPlugin = useMutation({
    mutationFn: (pluginId: string) =>
      apiRequest(`/api/plugins/install`, "POST", { pluginId }),
    onSuccess: (_, pluginId) => {
      queryClient.invalidateQueries({ queryKey: ["/api/plugins"] });
      const plugin = pluginStore.find((p) => p.id === pluginId);
      toast({
        title: "Plugin installed successfully",
        description: `${plugin?.name} has been installed and is ready to configure`,
      });
    },
  });

  const handleUninstallPlugin = useMutation({
    mutationFn: (pluginId: string) =>
      apiRequest(`/api/plugins/${pluginId}`, "DELETE"),
    onSuccess: (_, pluginId) => {
      queryClient.invalidateQueries({ queryKey: ["/api/plugins"] });
      const plugin = installedPlugins.find((p) => p.id === pluginId);
      toast({
        title: "Plugin uninstalled",
        description: `${plugin?.name} has been removed from the system`,
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "bg-green-600",
      inactive: "bg-gray-600",
      error: "bg-red-600",
      updating: "bg-yellow-600",
    } as const;

    return (
      <Badge
        className={variants[status as keyof typeof variants] || "bg-gray-600"}
      >
        {status.toUpperCase()}
      </Badge>
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "microservice":
        return <Package className="w-4 h-4" />;
      case "payment":
        return <CreditCard className="w-4 h-4" />;
      case "ai_service":
        return <Bot className="w-4 h-4" />;
      case "media":
        return <Video className="w-4 h-4" />;
      case "security":
        return <Shield className="w-4 h-4" />;
      case "communication":
        return <Radio className="w-4 h-4" />;
      case "analytics":
        return <Zap className="w-4 h-4" />;
      case "integration":
        return <Globe className="w-4 h-4" />;
      default:
        return <Puzzle className="w-4 h-4" />;
    }
  };

  const filteredPlugins = installedPlugins.filter((plugin) => {
    const matchesSearch =
      !searchQuery ||
      plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plugin.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || plugin.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const stats = {
    totalPlugins: installedPlugins.length,
    activePlugins: installedPlugins.filter((p) => p.status === "active").length,
    errorPlugins: installedPlugins.filter((p) => p.status === "error").length,
    essentialPlugins: installedPlugins.filter((p) => p.essential).length,
  };

  return (
    <div className="min-h-screen cyber-bg">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold cyber-text-glow">
              Plugin Management System
            </h1>
            <p className="text-muted-foreground">
              Manage FanzOS microservices, integrations, and third-party plugins
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" data-testid="button-refresh-plugins">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh All
            </Button>
            <Button data-testid="button-install-plugin">
              <Plus className="w-4 h-4 mr-2" />
              Install Plugin
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gray-900/50 border-cyan-500/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Package className="h-8 w-8 text-cyan-400" />
                <div>
                  <p className="text-sm font-medium">Total Plugins</p>
                  <p className="text-2xl font-bold text-cyan-400">
                    {stats.totalPlugins}
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
                  <p className="text-sm font-medium">Active</p>
                  <p className="text-2xl font-bold text-green-400">
                    {stats.activePlugins}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-red-500/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <XCircle className="h-8 w-8 text-red-400" />
                <div>
                  <p className="text-sm font-medium">Errors</p>
                  <p className="text-2xl font-bold text-red-400">
                    {stats.errorPlugins}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-yellow-500/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-8 w-8 text-yellow-400" />
                <div>
                  <p className="text-sm font-medium">Essential</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {stats.essentialPlugins}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="installed" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="installed">Installed Plugins</TabsTrigger>
            <TabsTrigger value="store">Plugin Store</TabsTrigger>
            <TabsTrigger value="custom">Custom Development</TabsTrigger>
          </TabsList>

          <TabsContent value="installed" className="space-y-6">
            <Card className="bg-gray-900/50 border-cyan-500/20">
              <CardHeader>
                <CardTitle className="text-cyan-400">
                  Installed Plugins
                </CardTitle>
                <CardDescription>
                  Manage your installed FanzOS plugins and integrations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search plugins..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-gray-800 border-gray-700"
                      data-testid="input-plugin-search"
                    />
                  </div>

                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger className="w-[200px] bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="microservice">
                        Microservices
                      </SelectItem>
                      <SelectItem value="payment">Payment Systems</SelectItem>
                      <SelectItem value="ai_service">AI Services</SelectItem>
                      <SelectItem value="media">Media Processing</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                      <SelectItem value="communication">
                        Communication
                      </SelectItem>
                      <SelectItem value="analytics">Analytics</SelectItem>
                      <SelectItem value="integration">Integrations</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="border rounded-lg bg-gray-800/50">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Plugin</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Version</TableHead>
                        <TableHead>Platforms</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPlugins.map((plugin) => (
                        <TableRow key={plugin.id}>
                          <TableCell>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                {getCategoryIcon(plugin.category)}
                                <span className="font-medium">
                                  {plugin.name}
                                </span>
                                {plugin.essential && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs border-yellow-500 text-yellow-400"
                                  >
                                    ESSENTIAL
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-gray-400 max-w-md">
                                {plugin.description}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {plugin.category.replace("_", " ")}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            v{plugin.version}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {plugin.platforms.slice(0, 2).map((platform) => (
                                <Badge
                                  key={platform}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {platform}
                                </Badge>
                              ))}
                              {plugin.platforms.length > 2 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{plugin.platforms.length - 2}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(plugin.status)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleTogglePlugin.mutate(plugin.id)
                                }
                                disabled={
                                  handleTogglePlugin.isPending ||
                                  plugin.essential
                                }
                                variant={
                                  plugin.status === "active"
                                    ? "destructive"
                                    : "default"
                                }
                                data-testid={`button-toggle-${plugin.id}`}
                              >
                                {plugin.status === "active" ? (
                                  <PowerOff className="w-3 h-3" />
                                ) : (
                                  <Power className="w-3 h-3" />
                                )}
                              </Button>
                              {plugin.configurable && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  data-testid={`button-config-${plugin.id}`}
                                >
                                  <Settings className="w-3 h-3" />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                data-testid={`button-view-${plugin.id}`}
                              >
                                <Eye className="w-3 h-3" />
                              </Button>
                              {!plugin.essential && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleUninstallPlugin.mutate(plugin.id)
                                  }
                                  disabled={handleUninstallPlugin.isPending}
                                  data-testid={`button-uninstall-${plugin.id}`}
                                >
                                  <Trash2 className="w-3 h-3" />
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

          <TabsContent value="store" className="space-y-6">
            <Card className="bg-gray-900/50 border-cyan-500/20">
              <CardHeader>
                <CardTitle className="text-cyan-400">Plugin Store</CardTitle>
                <CardDescription>
                  Browse and install verified plugins for your Fanz ecosystem
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pluginStore.map((plugin) => (
                    <Card key={plugin.id} className="bg-gray-800/50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-white">
                            {plugin.name}
                          </h3>
                          {plugin.verified && (
                            <Badge className="bg-blue-600">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-400 mb-3">
                          {plugin.description}
                        </p>
                        <div className="flex items-center justify-between text-sm mb-3">
                          <span>v{plugin.version}</span>
                          <span className="text-green-400 font-bold">
                            ${plugin.price}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                          <span>
                            {plugin.downloads.toLocaleString()} downloads
                          </span>
                          <span>⭐ {plugin.rating}</span>
                        </div>
                        <Button
                          size="sm"
                          className="w-full"
                          onClick={() => handleInstallPlugin.mutate(plugin.id)}
                          disabled={handleInstallPlugin.isPending}
                          data-testid={`button-install-${plugin.id}`}
                        >
                          <Download className="w-3 h-3 mr-2" />
                          Install Plugin
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="custom" className="space-y-6">
            <Card className="bg-gray-900/50 border-cyan-500/20">
              <CardHeader>
                <CardTitle className="text-cyan-400">
                  Custom Plugin Development
                </CardTitle>
                <CardDescription>
                  Upload and develop custom plugins for your Fanz ecosystem
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Code className="w-16 h-16 mx-auto mb-4 text-cyan-400" />
                  <p className="text-lg font-medium text-white mb-2">
                    Custom Plugin Development
                  </p>
                  <p className="text-gray-400 mb-6">
                    Upload your own plugins or use the FanzOS Plugin SDK to
                    create custom integrations
                  </p>
                  <div className="flex justify-center gap-4">
                    <Button data-testid="button-upload-plugin">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Plugin
                    </Button>
                    <Button variant="outline" data-testid="button-plugin-sdk">
                      <Download className="w-4 h-4 mr-2" />
                      Download SDK
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
