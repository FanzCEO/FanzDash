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
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Shield,
  Bot,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Brain,
  Video,
  Image as ImageIcon,
  FileText,
  Radio,
  Mic,
  Play,
  Flag,
  Zap,
  Activity,
  TrendingUp,
  Filter,
  Search,
  Pause,
  RotateCcw,
  Settings,
  Gauge,
} from "lucide-react";

interface ModerationItem {
  id: string;
  contentType:
    | "image"
    | "video"
    | "text"
    | "live_stream"
    | "podcast"
    | "radio"
    | "audio"
    | "document";
  platform:
    | "FanzLab"
    | "BoyFanz"
    | "GirlFanz"
    | "DaddyFanz"
    | "PupFanz"
    | "TabooFanz"
    | "TransFanz"
    | "CougarFanz"
    | "FanzClips"
    | "FanzTube";
  creatorId: string;
  creatorName: string;
  content: string;
  aiScore: number;
  humanScore?: number;
  status: "pending" | "approved" | "rejected" | "needs_review";
  flaggedReasons: string[];
  moderatorId?: string;
  moderatorAction?: string;
  timestamp: string;
  riskLevel: "low" | "medium" | "high" | "critical";
  autoModerationEnabled: boolean;
}

interface AIService {
  name: string;
  type:
    | "content_analysis"
    | "image_recognition"
    | "text_analysis"
    | "audio_analysis"
    | "video_analysis";
  status: "active" | "inactive";
  confidence: number;
  processedToday: number;
}

export default function ContentModerationHub() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [selectedContentType, setSelectedContentType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [autoModerationEnabled, setAutoModerationEnabled] = useState(true);

  // Mock data for demonstration
  const moderationItems: ModerationItem[] = [
    {
      id: "mod_001",
      contentType: "image",
      platform: "FanzLab",
      creatorId: "user_001",
      creatorName: "sarah_model",
      content: "Profile photo with suggestive pose",
      aiScore: 85,
      humanScore: 90,
      status: "approved",
      flaggedReasons: ["Suggestive Content"],
      moderatorId: "admin_001",
      moderatorAction: "Approved with age verification",
      timestamp: "2025-01-15T10:00:00Z",
      riskLevel: "medium",
      autoModerationEnabled: true,
    },
    {
      id: "mod_002",
      contentType: "video",
      platform: "BoyFanz",
      creatorId: "user_002",
      creatorName: "alex_creator",
      content: "Workout video - adult content",
      aiScore: 95,
      status: "needs_review",
      flaggedReasons: ["Explicit Content", "Age Verification Required"],
      timestamp: "2025-01-15T11:30:00Z",
      riskLevel: "high",
      autoModerationEnabled: true,
    },
    {
      id: "mod_003",
      contentType: "live_stream",
      platform: "GirlFanz",
      creatorId: "user_003",
      creatorName: "maya_performer",
      content: "Live cam session in progress",
      aiScore: 92,
      status: "pending",
      flaggedReasons: ["Live Adult Content", "Real-time Moderation"],
      timestamp: "2025-01-15T12:00:00Z",
      riskLevel: "critical",
      autoModerationEnabled: true,
    },
    {
      id: "mod_004",
      contentType: "podcast",
      platform: "FanzTube",
      creatorId: "user_004",
      creatorName: "jenny_host",
      content: "Adult lifestyle podcast episode",
      aiScore: 75,
      humanScore: 80,
      status: "approved",
      flaggedReasons: ["Adult Topics"],
      moderatorId: "admin_002",
      moderatorAction: "Approved with content warning",
      timestamp: "2025-01-15T09:15:00Z",
      riskLevel: "low",
      autoModerationEnabled: true,
    },
    {
      id: "mod_005",
      contentType: "radio",
      platform: "FanzTube",
      creatorId: "user_005",
      creatorName: "mike_dj",
      content: "Live radio show with adult music",
      aiScore: 70,
      status: "approved",
      flaggedReasons: ["Adult Themes"],
      moderatorId: "admin_003",
      moderatorAction: "Approved - late night slot",
      timestamp: "2025-01-15T08:45:00Z",
      riskLevel: "low",
      autoModerationEnabled: true,
    },
  ];

  const aiServices: AIService[] = [
    {
      name: "OpenAI GPT-4o Vision",
      type: "image_recognition",
      status: "active",
      confidence: 94,
      processedToday: 2847,
    },
    {
      name: "OpenAI GPT-5 Text Analysis",
      type: "text_analysis",
      status: "active",
      confidence: 96,
      processedToday: 1293,
    },
    {
      name: "Google Perspective API",
      type: "text_analysis",
      status: "active",
      confidence: 89,
      processedToday: 945,
    },
    {
      name: "LAION Safety CLIP",
      type: "image_recognition",
      status: "active",
      confidence: 91,
      processedToday: 3621,
    },
    {
      name: "OpenAI Whisper",
      type: "audio_analysis",
      status: "active",
      confidence: 88,
      processedToday: 567,
    },
    {
      name: "Google Video Intelligence",
      type: "video_analysis",
      status: "active",
      confidence: 92,
      processedToday: 1843,
    },
    {
      name: "AWS Rekognition",
      type: "video_analysis",
      status: "active",
      confidence: 87,
      processedToday: 2156,
    },
    {
      name: "Custom NudeNet Model",
      type: "image_recognition",
      status: "active",
      confidence: 93,
      processedToday: 4782,
    },
  ];

  const handleApproveContent = useMutation({
    mutationFn: (itemId: string) =>
      apiRequest(`/api/moderation/${itemId}/approve`, "POST"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/moderation/items"] });
      toast({ title: "Content approved successfully" });
    },
  });

  const handleRejectContent = useMutation({
    mutationFn: (itemId: string) =>
      apiRequest(`/api/moderation/${itemId}/reject`, "POST"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/moderation/items"] });
      toast({ title: "Content rejected successfully" });
    },
  });

  const handleToggleAutoModeration = useMutation({
    mutationFn: () =>
      apiRequest("/api/moderation/auto-toggle", "POST", {
        enabled: !autoModerationEnabled,
      }),
    onSuccess: () => {
      setAutoModerationEnabled(!autoModerationEnabled);
      toast({
        title: `Auto-moderation ${!autoModerationEnabled ? "enabled" : "disabled"}`,
        description: `AI moderation is now ${!autoModerationEnabled ? "active" : "paused"} across all platforms`,
      });
    },
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "bg-yellow-600",
      approved: "bg-green-600",
      rejected: "bg-red-600",
      needs_review: "bg-orange-600",
    } as const;

    return (
      <Badge
        className={variants[status as keyof typeof variants] || "bg-gray-600"}
      >
        {status.replace("_", " ").toUpperCase()}
      </Badge>
    );
  };

  const getRiskBadge = (risk: string) => {
    const variants = {
      low: "bg-green-700",
      medium: "bg-yellow-700",
      high: "bg-orange-700",
      critical: "bg-red-700",
    } as const;

    return (
      <Badge
        className={variants[risk as keyof typeof variants] || "bg-gray-600"}
      >
        {risk.toUpperCase()}
      </Badge>
    );
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case "image":
        return <ImageIcon className="w-4 h-4" />;
      case "video":
        return <Video className="w-4 h-4" />;
      case "text":
        return <FileText className="w-4 h-4" />;
      case "live_stream":
        return <Play className="w-4 h-4" />;
      case "podcast":
        return <Mic className="w-4 h-4" />;
      case "radio":
        return <Radio className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const filteredItems = moderationItems.filter((item) => {
    const matchesPlatform =
      selectedPlatform === "all" || item.platform === selectedPlatform;
    const matchesContentType =
      selectedContentType === "all" || item.contentType === selectedContentType;
    const matchesSearch =
      !searchQuery ||
      item.creatorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesPlatform && matchesContentType && matchesSearch;
  });

  const stats = {
    totalItems: moderationItems.length,
    pendingReview: moderationItems.filter(
      (item) => item.status === "pending" || item.status === "needs_review",
    ).length,
    approvedToday: moderationItems.filter((item) => item.status === "approved")
      .length,
    rejectedToday: moderationItems.filter((item) => item.status === "rejected")
      .length,
    aiProcessedToday: aiServices.reduce(
      (sum, service) => sum + service.processedToday,
      0,
    ),
  };

  return (
    <div className="min-h-screen cyber-bg">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold cyber-text-glow">
              Content Moderation Hub
            </h1>
            <p className="text-muted-foreground">
              AI-powered moderation across all Fanz™ platforms and content
              types
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className={`border-2 ${autoModerationEnabled ? "border-green-500 text-green-400" : "border-red-500 text-red-400"}`}
            >
              <Bot className="w-4 h-4 mr-2" />
              AI Moderation {autoModerationEnabled ? "ACTIVE" : "PAUSED"}
            </Badge>
            <Button
              onClick={() => handleToggleAutoModeration.mutate()}
              disabled={handleToggleAutoModeration.isPending}
              variant={autoModerationEnabled ? "destructive" : "default"}
              data-testid="button-toggle-auto-moderation"
            >
              {autoModerationEnabled ? (
                <Pause className="w-4 h-4 mr-2" />
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
              {autoModerationEnabled ? "Pause AI" : "Resume AI"}
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="bg-gray-900/50 border-cyan-500/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Activity className="h-8 w-8 text-cyan-400" />
                <div>
                  <p className="text-sm font-medium">Total Items</p>
                  <p className="text-2xl font-bold text-cyan-400">
                    {stats.totalItems}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-yellow-500/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-8 w-8 text-yellow-400" />
                <div>
                  <p className="text-sm font-medium">Pending Review</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {stats.pendingReview}
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
                  <p className="text-sm font-medium">Approved Today</p>
                  <p className="text-2xl font-bold text-green-400">
                    {stats.approvedToday}
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
                  <p className="text-sm font-medium">Rejected Today</p>
                  <p className="text-2xl font-bold text-red-400">
                    {stats.rejectedToday}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-purple-500/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Brain className="h-8 w-8 text-purple-400" />
                <div>
                  <p className="text-sm font-medium">AI Processed</p>
                  <p className="text-2xl font-bold text-purple-400">
                    {stats.aiProcessedToday.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="queue" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="queue">Moderation Queue</TabsTrigger>
            <TabsTrigger value="ai-services">AI Services</TabsTrigger>
            <TabsTrigger value="real-time">Real-time Monitor</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="queue" className="space-y-6">
            {/* Filters */}
            <Card className="bg-gray-900/50 border-cyan-500/20">
              <CardHeader>
                <CardTitle className="text-cyan-400">
                  Content Moderation Queue
                </CardTitle>
                <CardDescription>
                  Review and moderate content across all platforms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by creator name or content..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-gray-800 border-gray-700"
                      data-testid="input-moderation-search"
                    />
                  </div>

                  <Select
                    value={selectedPlatform}
                    onValueChange={setSelectedPlatform}
                  >
                    <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Filter by platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Platforms</SelectItem>
                      <SelectItem value="FanzLab">FanzLab</SelectItem>
                      <SelectItem value="BoyFanz">BoyFanz</SelectItem>
                      <SelectItem value="GirlFanz">GirlFanz</SelectItem>
                      <SelectItem value="DaddyFanz">DaddyFanz</SelectItem>
                      <SelectItem value="PupFanz">PupFanz</SelectItem>
                      <SelectItem value="TabooFanz">TabooFanz</SelectItem>
                      <SelectItem value="TransFanz">TransFanz</SelectItem>
                      <SelectItem value="CougarFanz">CougarFanz</SelectItem>
                      <SelectItem value="FanzClips">FanzClips</SelectItem>
                      <SelectItem value="FanzTube">FanzTube</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={selectedContentType}
                    onValueChange={setSelectedContentType}
                  >
                    <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Filter by content type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Content Types</SelectItem>
                      <SelectItem value="image">Images</SelectItem>
                      <SelectItem value="video">Videos</SelectItem>
                      <SelectItem value="text">Text Content</SelectItem>
                      <SelectItem value="live_stream">Live Streams</SelectItem>
                      <SelectItem value="podcast">Podcasts</SelectItem>
                      <SelectItem value="radio">Radio Shows</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Content Items Table */}
                <div className="border rounded-lg bg-gray-800/50">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Platform</TableHead>
                        <TableHead>Creator</TableHead>
                        <TableHead>Content</TableHead>
                        <TableHead>AI Score</TableHead>
                        <TableHead>Risk Level</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getContentTypeIcon(item.contentType)}
                              <span className="capitalize">
                                {item.contentType.replace("_", " ")}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-mono">
                              {item.platform}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            {item.creatorName}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {item.content}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={item.aiScore} className="w-16" />
                              <span className="text-sm font-mono">
                                {item.aiScore}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{getRiskBadge(item.riskLevel)}</TableCell>
                          <TableCell>{getStatusBadge(item.status)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {(item.status === "pending" ||
                                item.status === "needs_review") && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      handleApproveContent.mutate(item.id)
                                    }
                                    disabled={handleApproveContent.isPending}
                                    className="bg-green-600 hover:bg-green-700"
                                    data-testid={`button-approve-${item.id}`}
                                  >
                                    <CheckCircle className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() =>
                                      handleRejectContent.mutate(item.id)
                                    }
                                    disabled={handleRejectContent.isPending}
                                    data-testid={`button-reject-${item.id}`}
                                  >
                                    <XCircle className="w-3 h-3" />
                                  </Button>
                                </>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                data-testid={`button-view-${item.id}`}
                              >
                                <Eye className="w-3 h-3" />
                              </Button>
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

          <TabsContent value="ai-services" className="space-y-6">
            <Card className="bg-gray-900/50 border-cyan-500/20">
              <CardHeader>
                <CardTitle className="text-cyan-400">
                  AI Moderation Services
                </CardTitle>
                <CardDescription>
                  Monitor and manage AI-powered content analysis engines
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {aiServices.map((service, index) => (
                    <Card key={index} className="bg-gray-800/50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-white">
                            {service.name}
                          </h3>
                          <Badge
                            className={
                              service.status === "active"
                                ? "bg-green-600"
                                : "bg-red-600"
                            }
                          >
                            {service.status.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-400 mb-3 capitalize">
                          {service.type.replace("_", " ")}
                        </p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Confidence:</span>
                            <span className="font-mono">
                              {service.confidence}%
                            </span>
                          </div>
                          <Progress
                            value={service.confidence}
                            className="h-2"
                          />
                          <div className="flex justify-between text-sm">
                            <span>Processed Today:</span>
                            <span className="font-mono text-cyan-400">
                              {service.processedToday.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="real-time" className="space-y-6">
            <Card className="bg-gray-900/50 border-cyan-500/20">
              <CardHeader>
                <CardTitle className="text-cyan-400">
                  Real-time Moderation Monitor
                </CardTitle>
                <CardDescription>
                  Live monitoring of content across all platforms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Activity className="w-16 h-16 mx-auto mb-4 text-cyan-400 animate-pulse" />
                  <p className="text-lg font-medium text-white mb-2">
                    Real-time monitoring active
                  </p>
                  <p className="text-gray-400">
                    Monitoring live streams, real-time uploads, and user
                    interactions across all Fanz™ platforms
                  </p>
                  <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-green-400">847</p>
                      <p className="text-sm text-gray-400">
                        Live Streams Active
                      </p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-yellow-400">23</p>
                      <p className="text-sm text-gray-400">Pending Alerts</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-400">1,293</p>
                      <p className="text-sm text-gray-400">Real-time Actions</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card className="bg-gray-900/50 border-cyan-500/20">
              <CardHeader>
                <CardTitle className="text-cyan-400">
                  Moderation Analytics
                </CardTitle>
                <CardDescription>
                  Performance metrics and trends across all platforms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-gray-800/50 rounded-lg">
                    <TrendingUp className="w-12 h-12 mx-auto mb-4 text-green-400" />
                    <p className="text-3xl font-bold text-green-400">94.7%</p>
                    <p className="text-sm text-gray-400">AI Accuracy Rate</p>
                  </div>
                  <div className="text-center p-6 bg-gray-800/50 rounded-lg">
                    <Gauge className="w-12 h-12 mx-auto mb-4 text-blue-400" />
                    <p className="text-3xl font-bold text-blue-400">2.3s</p>
                    <p className="text-sm text-gray-400">
                      Average Processing Time
                    </p>
                  </div>
                  <div className="text-center p-6 bg-gray-800/50 rounded-lg">
                    <Shield className="w-12 h-12 mx-auto mb-4 text-purple-400" />
                    <p className="text-3xl font-bold text-purple-400">99.1%</p>
                    <p className="text-sm text-gray-400">Compliance Rate</p>
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
