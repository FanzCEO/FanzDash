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
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Shield,
  Activity,
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Settings,
  Eye,
  Flag,
  Zap,
  Crown,
  Heart,
  Flame,
  Sparkles,
  Rainbow,
  Moon,
  Star,
  Palette,
  Search,
  Filter,
  Play,
  Pause,
  BarChart3,
  TrendingUp,
} from "lucide-react";

interface PlatformConfig {
  id: string;
  name: string;
  theme: string;
  icon: React.ReactNode;
  status: "active" | "maintenance" | "inactive";
  userCount: number;
  dailyActive: number;
  moderationLevel: number; // 1-10 scale
  autoModerationEnabled: boolean;
  contentFilters: {
    nudity: number;
    violence: number;
    harassment: number;
    spam: number;
    ageVerification: boolean;
    customWords: string[];
  };
  allowedContentTypes: string[];
  regionalRestrictions: string[];
  communityGuidelines: string;
}

interface ModerationAction {
  id: string;
  platform: string;
  action:
    | "warned"
    | "content_removed"
    | "user_suspended"
    | "user_banned"
    | "content_approved";
  userId: string;
  username: string;
  reason: string;
  moderatorId: string;
  timestamp: string;
  severity: "low" | "medium" | "high" | "critical";
  appealable: boolean;
}

export default function PlatformModeration() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Mock platform configurations based on Fanz ecosystem
  const platformConfigs: PlatformConfig[] = [
    {
      id: "fanzlab",
      name: "FanzLab",
      theme: "Central neon portal",
      icon: <Zap className="w-5 h-5" />,
      status: "active",
      userCount: 2847592,
      dailyActive: 456789,
      moderationLevel: 8,
      autoModerationEnabled: true,
      contentFilters: {
        nudity: 85,
        violence: 90,
        harassment: 95,
        spam: 88,
        ageVerification: true,
        customWords: ["illegal", "underage", "violence"],
      },
      allowedContentTypes: [
        "images",
        "videos",
        "text",
        "live_streams",
        "audio",
      ],
      regionalRestrictions: ["CN", "RU"],
      communityGuidelines: "Adult content allowed with age verification",
    },
    {
      id: "boyfanz",
      name: "BoyFanz",
      theme: "Neon red for male creators",
      icon: <Crown className="w-5 h-5" />,
      status: "active",
      userCount: 1234567,
      dailyActive: 189432,
      moderationLevel: 7,
      autoModerationEnabled: true,
      contentFilters: {
        nudity: 75,
        violence: 85,
        harassment: 92,
        spam: 85,
        ageVerification: true,
        customWords: ["harassment", "doxxing"],
      },
      allowedContentTypes: ["images", "videos", "text", "live_streams"],
      regionalRestrictions: ["CN", "IN"],
      communityGuidelines: "Male-focused adult content with respect guidelines",
    },
    {
      id: "girlfanz",
      name: "GirlFanz",
      theme: "Neon pink for female creators",
      icon: <Heart className="w-5 h-5" />,
      status: "active",
      userCount: 3456789,
      dailyActive: 567890,
      moderationLevel: 8,
      autoModerationEnabled: true,
      contentFilters: {
        nudity: 80,
        violence: 90,
        harassment: 96,
        spam: 88,
        ageVerification: true,
        customWords: ["harassment", "revenge", "non-consensual"],
      },
      allowedContentTypes: [
        "images",
        "videos",
        "text",
        "live_streams",
        "audio",
      ],
      regionalRestrictions: ["CN", "RU", "TR"],
      communityGuidelines: "Female-empowered adult content with safety focus",
    },
    {
      id: "daddyfanz",
      name: "DaddyFanz",
      theme: "Neon gold for Dom/sub community",
      icon: <Flame className="w-5 h-5" />,
      status: "active",
      userCount: 567890,
      dailyActive: 78901,
      moderationLevel: 9,
      autoModerationEnabled: true,
      contentFilters: {
        nudity: 70,
        violence: 95,
        harassment: 95,
        spam: 90,
        ageVerification: true,
        customWords: ["non-consensual", "abuse", "illegal"],
      },
      allowedContentTypes: ["images", "videos", "text", "live_streams"],
      regionalRestrictions: ["CN", "RU", "IN", "TR"],
      communityGuidelines:
        "BDSM/Dom-sub content with strict consent requirements",
    },
    {
      id: "pupfanz",
      name: "PupFanz",
      theme: "Neon green for pup community",
      icon: <Sparkles className="w-5 h-5" />,
      status: "active",
      userCount: 234567,
      dailyActive: 34567,
      moderationLevel: 8,
      autoModerationEnabled: true,
      contentFilters: {
        nudity: 75,
        violence: 92,
        harassment: 94,
        spam: 87,
        ageVerification: true,
        customWords: ["abuse", "non-consensual"],
      },
      allowedContentTypes: ["images", "videos", "text", "live_streams"],
      regionalRestrictions: ["CN", "RU"],
      communityGuidelines: "Pet-play community with consent and safety focus",
    },
    {
      id: "taboofanz",
      name: "TabooFanz",
      theme: "Dark neon blue for extreme content",
      icon: <Moon className="w-5 h-5" />,
      status: "active",
      userCount: 123456,
      dailyActive: 12345,
      moderationLevel: 10,
      autoModerationEnabled: true,
      contentFilters: {
        nudity: 60,
        violence: 98,
        harassment: 97,
        spam: 92,
        ageVerification: true,
        customWords: ["illegal", "underage", "violence", "drugs", "weapons"],
      },
      allowedContentTypes: ["images", "videos", "text"],
      regionalRestrictions: ["CN", "RU", "IN", "TR", "AU", "UK"],
      communityGuidelines: "Extreme adult content with maximum safety controls",
    },
    {
      id: "transfanz",
      name: "TransFanz",
      theme: "Inclusive turquoise for trans creators",
      icon: <Rainbow className="w-5 h-5" />,
      status: "active",
      userCount: 345678,
      dailyActive: 45678,
      moderationLevel: 9,
      autoModerationEnabled: true,
      contentFilters: {
        nudity: 80,
        violence: 95,
        harassment: 98,
        spam: 90,
        ageVerification: true,
        customWords: [
          "transphobia",
          "deadnaming",
          "harassment",
          "discrimination",
        ],
      },
      allowedContentTypes: [
        "images",
        "videos",
        "text",
        "live_streams",
        "audio",
      ],
      regionalRestrictions: ["CN", "RU", "IN", "TR", "AF"],
      communityGuidelines:
        "Trans-inclusive space with zero tolerance for discrimination",
    },
    {
      id: "cougarfanz",
      name: "CougarFanz",
      theme: "Mature gold for mature creators",
      icon: <Star className="w-5 h-5" />,
      status: "active",
      userCount: 456789,
      dailyActive: 56789,
      moderationLevel: 7,
      autoModerationEnabled: true,
      contentFilters: {
        nudity: 78,
        violence: 88,
        harassment: 93,
        spam: 85,
        ageVerification: true,
        customWords: ["ageism", "harassment"],
      },
      allowedContentTypes: [
        "images",
        "videos",
        "text",
        "live_streams",
        "audio",
      ],
      regionalRestrictions: ["CN"],
      communityGuidelines:
        "Mature adult content celebrating experience and wisdom",
    },
  ];

  // Mock recent moderation actions
  const recentActions: ModerationAction[] = [
    {
      id: "act_001",
      platform: "GirlFanz",
      action: "content_removed",
      userId: "user_123",
      username: "sarah_model",
      reason: "Non-consensual content reported",
      moderatorId: "mod_001",
      timestamp: "2025-01-15T11:45:00Z",
      severity: "high",
      appealable: true,
    },
    {
      id: "act_002",
      platform: "BoyFanz",
      action: "user_warned",
      userId: "user_456",
      username: "alex_creator",
      reason: "Spam messaging multiple users",
      moderatorId: "ai_moderator",
      timestamp: "2025-01-15T11:30:00Z",
      severity: "medium",
      appealable: true,
    },
    {
      id: "act_003",
      platform: "TabooFanz",
      action: "user_suspended",
      userId: "user_789",
      username: "extreme_user",
      reason: "Violation of extreme content guidelines",
      moderatorId: "mod_002",
      timestamp: "2025-01-15T10:15:00Z",
      severity: "critical",
      appealable: false,
    },
    {
      id: "act_004",
      platform: "TransFanz",
      action: "user_banned",
      userId: "user_321",
      username: "problem_user",
      reason: "Repeated transphobic harassment",
      moderatorId: "mod_003",
      timestamp: "2025-01-15T09:30:00Z",
      severity: "critical",
      appealable: false,
    },
  ];

  const handleUpdateModerationLevel = useMutation({
    mutationFn: ({
      platformId,
      level,
    }: {
      platformId: string;
      level: number;
    }) =>
      apiRequest(`/api/platforms/${platformId}/moderation-level`, "POST", {
        level,
      }),
    onSuccess: (_, { platformId, level }) => {
      queryClient.invalidateQueries({
        queryKey: ["/api/platforms", platformId],
      });
      const platform = platformConfigs.find((p) => p.id === platformId);
      toast({
        title: "Moderation level updated",
        description: `${platform?.name} moderation level set to ${level}/10`,
      });
    },
  });

  const handleToggleAutoModeration = useMutation({
    mutationFn: ({
      platformId,
      enabled,
    }: {
      platformId: string;
      enabled: boolean;
    }) =>
      apiRequest(`/api/platforms/${platformId}/auto-moderation`, "POST", {
        enabled,
      }),
    onSuccess: (_, { platformId, enabled }) => {
      queryClient.invalidateQueries({
        queryKey: ["/api/platforms", platformId],
      });
      const platform = platformConfigs.find((p) => p.id === platformId);
      toast({
        title: `Auto-moderation ${enabled ? "enabled" : "disabled"}`,
        description: `${platform?.name} auto-moderation has been ${enabled ? "activated" : "deactivated"}`,
      });
    },
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "bg-green-600",
      maintenance: "bg-yellow-600",
      inactive: "bg-red-600",
    } as const;

    return (
      <Badge
        className={variants[status as keyof typeof variants] || "bg-gray-600"}
      >
        {status.toUpperCase()}
      </Badge>
    );
  };

  const getActionBadge = (action: string) => {
    const variants = {
      warned: "bg-yellow-600",
      content_removed: "bg-orange-600",
      user_suspended: "bg-red-600",
      user_banned: "bg-red-800",
      content_approved: "bg-green-600",
    } as const;

    return (
      <Badge
        className={variants[action as keyof typeof variants] || "bg-gray-600"}
      >
        {action.replace("_", " ").toUpperCase()}
      </Badge>
    );
  };

  const getSeverityBadge = (severity: string) => {
    const variants = {
      low: "bg-blue-600",
      medium: "bg-yellow-600",
      high: "bg-orange-600",
      critical: "bg-red-600",
    } as const;

    return (
      <Badge
        className={variants[severity as keyof typeof variants] || "bg-gray-600"}
      >
        {severity.toUpperCase()}
      </Badge>
    );
  };

  const filteredPlatforms = platformConfigs.filter((platform) => {
    const matchesPlatform =
      selectedPlatform === "all" || platform.id === selectedPlatform;
    const matchesSearch =
      !searchQuery ||
      platform.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      platform.theme.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesPlatform && matchesSearch;
  });

  const stats = {
    totalPlatforms: platformConfigs.length,
    activePlatforms: platformConfigs.filter((p) => p.status === "active")
      .length,
    totalUsers: platformConfigs.reduce((sum, p) => sum + p.userCount, 0),
    totalDailyActive: platformConfigs.reduce(
      (sum, p) => sum + p.dailyActive,
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
              Platform-Specific Moderation
            </h1>
            <p className="text-muted-foreground">
              Configure moderation settings for each Fanz™ platform cluster
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-cyan-500 text-cyan-400">
              <Activity className="w-4 h-4 mr-2" />
              {stats.activePlatforms}/{stats.totalPlatforms} Platforms Active
            </Badge>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gray-900/50 border-cyan-500/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Palette className="h-8 w-8 text-cyan-400" />
                <div>
                  <p className="text-sm font-medium">Total Platforms</p>
                  <p className="text-2xl font-bold text-cyan-400">
                    {stats.totalPlatforms}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-green-500/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-green-400" />
                <div>
                  <p className="text-sm font-medium">Total Users</p>
                  <p className="text-2xl font-bold text-green-400">
                    {(stats.totalUsers / 1000000).toFixed(1)}M
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-blue-500/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Activity className="h-8 w-8 text-blue-400" />
                <div>
                  <p className="text-sm font-medium">Daily Active</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {(stats.totalDailyActive / 1000000).toFixed(1)}M
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-purple-500/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-8 w-8 text-purple-400" />
                <div>
                  <p className="text-sm font-medium">Avg Moderation</p>
                  <p className="text-2xl font-bold text-purple-400">
                    {(
                      platformConfigs.reduce(
                        (sum, p) => sum + p.moderationLevel,
                        0,
                      ) / platformConfigs.length
                    ).toFixed(1)}
                    /10
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="platforms" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="platforms">Platform Settings</TabsTrigger>
            <TabsTrigger value="actions">Recent Actions</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="platforms" className="space-y-6">
            <Card className="bg-gray-900/50 border-cyan-500/20">
              <CardHeader>
                <CardTitle className="text-cyan-400">
                  Platform Moderation Configuration
                </CardTitle>
                <CardDescription>
                  Configure moderation settings for each platform cluster
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search platforms..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-gray-800 border-gray-700"
                      data-testid="input-platform-search"
                    />
                  </div>

                  <Select
                    value={selectedPlatform}
                    onValueChange={setSelectedPlatform}
                  >
                    <SelectTrigger className="w-[200px] bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Filter by platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Platforms</SelectItem>
                      {platformConfigs.map((platform) => (
                        <SelectItem key={platform.id} value={platform.id}>
                          {platform.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredPlatforms.map((platform) => (
                    <Card
                      key={platform.id}
                      className="bg-gray-800/50 border-gray-700"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {platform.icon}
                            <div>
                              <CardTitle className="text-lg text-white">
                                {platform.name}
                              </CardTitle>
                              <CardDescription className="text-xs">
                                {platform.theme}
                              </CardDescription>
                            </div>
                          </div>
                          {getStatusBadge(platform.status)}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-400">Total Users</p>
                            <p className="font-semibold text-white">
                              {(platform.userCount / 1000000).toFixed(1)}M
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-400">Daily Active</p>
                            <p className="font-semibold text-white">
                              {(platform.dailyActive / 1000).toFixed(0)}K
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">
                              Auto-Moderation
                            </span>
                            <Switch
                              checked={platform.autoModerationEnabled}
                              onCheckedChange={(enabled) =>
                                handleToggleAutoModeration.mutate({
                                  platformId: platform.id,
                                  enabled,
                                })
                              }
                              data-testid={`switch-auto-moderation-${platform.id}`}
                            />
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-400">
                                Moderation Level
                              </span>
                              <span className="text-sm font-mono text-white">
                                {platform.moderationLevel}/10
                              </span>
                            </div>
                            <Slider
                              value={[platform.moderationLevel]}
                              onValueChange={(value) =>
                                handleUpdateModerationLevel.mutate({
                                  platformId: platform.id,
                                  level: value[0],
                                })
                              }
                              max={10}
                              min={1}
                              step={1}
                              className="w-full"
                              data-testid={`slider-moderation-${platform.id}`}
                            />
                          </div>

                          <div className="pt-2">
                            <p className="text-xs text-gray-400 mb-2">
                              Content Filters:
                            </p>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="flex justify-between">
                                <span>Nudity:</span>
                                <span className="font-mono">
                                  {platform.contentFilters.nudity}%
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Violence:</span>
                                <span className="font-mono">
                                  {platform.contentFilters.violence}%
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Harassment:</span>
                                <span className="font-mono">
                                  {platform.contentFilters.harassment}%
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Spam:</span>
                                <span className="font-mono">
                                  {platform.contentFilters.spam}%
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-between pt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              data-testid={`button-configure-${platform.id}`}
                            >
                              <Settings className="w-3 h-3 mr-1" />
                              Configure
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              data-testid={`button-analytics-${platform.id}`}
                            >
                              <BarChart3 className="w-3 h-3 mr-1" />
                              Analytics
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="actions" className="space-y-6">
            <Card className="bg-gray-900/50 border-cyan-500/20">
              <CardHeader>
                <CardTitle className="text-cyan-400">
                  Recent Moderation Actions
                </CardTitle>
                <CardDescription>
                  Latest moderation actions across all platforms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg bg-gray-800/50">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Platform</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Severity</TableHead>
                        <TableHead>Moderator</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Appeal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentActions.map((action) => (
                        <TableRow key={action.id}>
                          <TableCell>
                            <Badge variant="outline">{action.platform}</Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            {action.username}
                          </TableCell>
                          <TableCell>{getActionBadge(action.action)}</TableCell>
                          <TableCell className="max-w-xs">
                            <p className="text-sm truncate">{action.reason}</p>
                          </TableCell>
                          <TableCell>
                            {getSeverityBadge(action.severity)}
                          </TableCell>
                          <TableCell className="text-sm text-gray-400">
                            {action.moderatorId}
                          </TableCell>
                          <TableCell className="text-sm text-gray-400">
                            {new Date(action.timestamp).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {action.appealable ? (
                              <Badge className="bg-green-600">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Yes
                              </Badge>
                            ) : (
                              <Badge className="bg-red-600">
                                <XCircle className="w-3 h-3 mr-1" />
                                No
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card className="bg-gray-900/50 border-cyan-500/20">
              <CardHeader>
                <CardTitle className="text-cyan-400">
                  Platform Moderation Analytics
                </CardTitle>
                <CardDescription>
                  Performance metrics and trends across all platforms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-gray-800/50 rounded-lg">
                    <TrendingUp className="w-12 h-12 mx-auto mb-4 text-green-400" />
                    <p className="text-3xl font-bold text-green-400">97.8%</p>
                    <p className="text-sm text-gray-400">
                      Auto-Moderation Accuracy
                    </p>
                  </div>
                  <div className="text-center p-6 bg-gray-800/50 rounded-lg">
                    <Flag className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
                    <p className="text-3xl font-bold text-yellow-400">2,847</p>
                    <p className="text-sm text-gray-400">Actions Today</p>
                  </div>
                  <div className="text-center p-6 bg-gray-800/50 rounded-lg">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-400" />
                    <p className="text-3xl font-bold text-red-400">23</p>
                    <p className="text-sm text-gray-400">Critical Issues</p>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Platform Performance
                  </h3>
                  <div className="space-y-4">
                    {platformConfigs.map((platform) => (
                      <div
                        key={platform.id}
                        className="flex items-center justify-between p-3 bg-gray-800/50 rounded"
                      >
                        <div className="flex items-center gap-3">
                          {platform.icon}
                          <span className="text-white">{platform.name}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="text-center">
                            <p className="text-green-400 font-mono">
                              {(95 + Math.random() * 4).toFixed(1)}%
                            </p>
                            <p className="text-xs text-gray-400">Accuracy</p>
                          </div>
                          <div className="text-center">
                            <p className="text-blue-400 font-mono">
                              {Math.floor(Math.random() * 500) + 100}
                            </p>
                            <p className="text-xs text-gray-400">Actions</p>
                          </div>
                          <div className="text-center">
                            <p className="text-yellow-400 font-mono">
                              {Math.floor(Math.random() * 10) + 1}
                            </p>
                            <p className="text-xs text-gray-400">Appeals</p>
                          </div>
                        </div>
                      </div>
                    ))}
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
