import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Globe, Users, DollarSign, TrendingUp, Settings, Eye, Power, AlertTriangle, CheckCircle, XCircle, Database, Server, Shield, BarChart3, Activity } from "lucide-react";

// TypeScript Interfaces
interface PlatformOverview {
  totalPlatforms: number;
  activePlatforms: number;
  inactivePlatforms: number;
  totalUsers: number;
  totalRevenue: number;
  totalContent: number;
}

interface Platform {
  id: string;
  name: string;
  displayName: string;
  category: "adult" | "mainstream" | "social" | "commerce" | "media" | "utility";
  status: "active" | "inactive" | "maintenance" | "beta";
  domain: string;
  users: number;
  creators: number;
  revenue: number;
  content: {
    photos: number;
    videos: number;
    posts: number;
  };
  engagement: {
    activeUsers: number;
    dailyVisits: number;
    avgSessionTime: number;
  };
  features: {
    messaging: boolean;
    subscriptions: boolean;
    tips: boolean;
    livestream: boolean;
    ecommerce: boolean;
    verification: boolean;
  };
  database: string;
  launchedAt: string;
  lastUpdate: string;
  healthScore: number;
  uptime: number;
}

interface PlatformConfig {
  id: string;
  platformId: string;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  contentModeration: "auto" | "manual" | "hybrid";
  ageVerification: boolean;
  geoRestrictions: string[];
  paymentMethods: string[];
  languages: string[];
  theme: {
    primaryColor: string;
    logo: string;
    favicon: string;
  };
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  integrations: {
    analytics: boolean;
    cdn: boolean;
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}

// All 94 FANZ Platforms organized by category
const ALL_PLATFORMS = {
  "Adult Entertainment": [
    "BoyFanz", "GayFanz", "BearFanz", "CougarFanz", "PupFanz", "DLBroz", "Guyz",
    "FanzClips", "DaddyFanz", "TwinFanz", "MuscleF", "LatinFanz", "AsianFanz",
    "BBWFanz", "MatureFanz", "FanzCock", "FanzXXX"
  ],
  "Social & Dating": [
    "FanzRoulette", "FanzMeet", "FanzDate", "FanzChat", "FanzConnect", "FanzMatch",
    "FanzHookup", "FanzSocial", "FanzNetwork", "FanzCircle"
  ],
  "Media & Content": [
    "FanzTube", "FanzStream", "FanzLive", "FanzVideo", "FanzPhoto", "FanzArt",
    "FanzMusic", "FanzPodcast", "FanzRadio", "FanzTV"
  ],
  "Commerce & Money": [
    "FanzMoney", "FanzPay", "FanzShop", "FanzStore", "FanzMarket", "FanzCommerce",
    "FanzWallet", "FanzBank", "FanzCredit", "FanzInvest"
  ],
  "Professional & Career": [
    "FanzJobs", "FanzCareer", "FanzHire", "FanzWork", "FanzGigs", "FanzFreelance",
    "FanzBusiness", "FanzCorp", "FanzEnterprise"
  ],
  "Education & Learning": [
    "FanzLearn", "FanzEdu", "FanzCourse", "FanzAcademy", "FanzUniversity",
    "FanzTutor", "FanzSkills", "FanzTraining"
  ],
  "Health & Wellness": [
    "FanzFit", "FanzHealth", "FanzWellness", "FanzYoga", "FanzNutrition",
    "FanzMental", "FanzTherapy", "FanzMedical"
  ],
  "Gaming & Entertainment": [
    "FanzGaming", "FanzPlay", "FanzEsports", "FanzArcade", "FanzBet", "FanzLotto"
  ],
  "Technology & Services": [
    "FanzCloud", "FanzHost", "FanzDev", "FanzAPI", "FanzData", "FanzAI",
    "FanzML", "FanzCode", "FanzTech"
  ],
  "Community & Events": [
    "FanzEvents", "FanzMeetup", "FanzCommunity", "FanzGroup", "FanzClub",
    "FanzGuild", "FanzTeam", "FanzSquad"
  ]
};

export default function PlatformManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedCategory, setSelectedCategory] = useState("Adult Entertainment");
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);

  // Fetch platform overview
  const { data: overview } = useQuery<PlatformOverview>({
    queryKey: ["/api/platforms/overview"],
    refetchInterval: 30000,
  });

  // Fetch all platforms
  const { data: platforms = [], isLoading: platformsLoading } = useQuery<Platform[]>({
    queryKey: ["/api/platforms"],
    refetchInterval: 30000,
  });

  // Fetch selected platform details
  const { data: platformDetails } = useQuery<Platform>({
    queryKey: ["/api/platforms", selectedPlatform],
    enabled: !!selectedPlatform,
    refetchInterval: 15000,
  });

  // Fetch platform configuration
  const { data: platformConfig } = useQuery<PlatformConfig>({
    queryKey: ["/api/platforms", selectedPlatform, "config"],
    enabled: !!selectedPlatform,
  });

  // Toggle platform status mutation
  const togglePlatformMutation = useMutation({
    mutationFn: ({ platformId, status }: { platformId: string; status: string }) =>
      apiRequest(`/api/platforms/${platformId}/status`, "PATCH", { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/platforms"] });
      toast({ title: "Platform status updated", description: "Platform status has been changed" });
    },
  });

  // Update platform config mutation
  const updateConfigMutation = useMutation({
    mutationFn: ({ platformId, config }: { platformId: string; config: Partial<PlatformConfig> }) =>
      apiRequest(`/api/platforms/${platformId}/config`, "PATCH", config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/platforms", selectedPlatform, "config"] });
      toast({ title: "Configuration updated", description: "Platform settings have been saved" });
      setIsConfigDialogOpen(false);
    },
  });

  const getStatusBadge = (status: Platform["status"]) => {
    const badges = {
      active: <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>,
      inactive: <Badge variant="outline"><XCircle className="w-3 h-3 mr-1" />Inactive</Badge>,
      maintenance: <Badge variant="secondary"><Settings className="w-3 h-3 mr-1" />Maintenance</Badge>,
      beta: <Badge variant="secondary">Beta</Badge>,
    };
    return badges[status];
  };

  const getCategoryIcon = (category: Platform["category"]) => {
    const icons = {
      adult: <Users className="w-4 h-4" />,
      mainstream: <Globe className="w-4 h-4" />,
      social: <Users className="w-4 h-4" />,
      commerce: <DollarSign className="w-4 h-4" />,
      media: <Activity className="w-4 h-4" />,
      utility: <Settings className="w-4 h-4" />,
    };
    return icons[category];
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "Adult Entertainment": "bg-red-500",
      "Social & Dating": "bg-pink-500",
      "Media & Content": "bg-purple-500",
      "Commerce & Money": "bg-green-500",
      "Professional & Career": "bg-blue-500",
      "Education & Learning": "bg-yellow-500",
      "Health & Wellness": "bg-emerald-500",
      "Gaming & Entertainment": "bg-orange-500",
      "Technology & Services": "bg-indigo-500",
      "Community & Events": "bg-cyan-500",
    };
    return colors[category] || "bg-gray-500";
  };

  const platformsInCategory = platforms.filter(p => {
    const categoryPlatforms = ALL_PLATFORMS[selectedCategory as keyof typeof ALL_PLATFORMS] || [];
    return categoryPlatforms.includes(p.name);
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Globe className="w-8 h-8" />
            Fanz™ Platform Manager
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage all 94 FANZ platforms from a single dashboard
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </Button>
          <Button onClick={() => setIsConfigDialogOpen(true)} disabled={!selectedPlatform}>
            <Settings className="w-4 h-4 mr-2" />
            Configure
          </Button>
        </div>
      </div>

      {/* Overview Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Platforms</CardTitle>
            <Globe className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview?.totalPlatforms ?? 94}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {overview?.activePlatforms ?? 0} active • {overview?.inactivePlatforms ?? 0} inactive
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview?.totalUsers?.toLocaleString() ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all platforms
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${overview?.totalRevenue?.toLocaleString() ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Combined revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Content</CardTitle>
            <Activity className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview?.totalContent?.toLocaleString() ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Photos, videos, posts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Platform Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Platform</CardTitle>
          <CardDescription>Choose a category and platform to manage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(ALL_PLATFORMS).map(category => (
                    <SelectItem key={category} value={category}>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getCategoryColor(category)}`} />
                        {category}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Platform</Label>
              <Select value={selectedPlatform || ""} onValueChange={setSelectedPlatform}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a platform..." />
                </SelectTrigger>
                <SelectContent>
                  {ALL_PLATFORMS[selectedCategory as keyof typeof ALL_PLATFORMS]?.map(platform => (
                    <SelectItem key={platform} value={platform}>
                      {platform}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Platform Grid for Selected Category */}
          <div className="mt-6">
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${getCategoryColor(selectedCategory)}`} />
              {selectedCategory} Platforms
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {ALL_PLATFORMS[selectedCategory as keyof typeof ALL_PLATFORMS]?.map(platform => {
                const platformData = platforms.find(p => p.name === platform);
                return (
                  <button
                    key={platform}
                    onClick={() => setSelectedPlatform(platform)}
                    className={`p-3 border rounded-lg text-left hover:bg-accent transition-colors ${
                      selectedPlatform === platform ? "border-primary bg-primary/5" : ""
                    }`}
                  >
                    <div className="font-medium text-sm">{platform}</div>
                    {platformData && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {platformData.users.toLocaleString()} users
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Platform Details */}
      {selectedPlatform && platformDetails && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {platformDetails.displayName}
                      {getStatusBadge(platformDetails.status)}
                    </CardTitle>
                    <CardDescription>{platformDetails.domain}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={platformDetails.status === "active" ? "destructive" : "default"}
                      size="sm"
                      onClick={() => {
                        const newStatus = platformDetails.status === "active" ? "inactive" : "active";
                        if (confirm(`${newStatus === "active" ? "Activate" : "Deactivate"} ${platformDetails.displayName}?`)) {
                          togglePlatformMutation.mutate({ platformId: platformDetails.id, status: newStatus });
                        }
                      }}
                    >
                      <Power className="w-4 h-4 mr-1" />
                      {platformDetails.status === "active" ? "Deactivate" : "Activate"}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <div className="text-sm text-muted-foreground">Total Users</div>
                    <div className="text-2xl font-bold">{platformDetails.users.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Creators</div>
                    <div className="text-2xl font-bold">{platformDetails.creators.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Revenue</div>
                    <div className="text-2xl font-bold text-green-600">${platformDetails.revenue.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Health Score</div>
                    <div className="text-2xl font-bold">{platformDetails.healthScore}%</div>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-4">
                  <div className="p-3 border rounded-lg">
                    <div className="text-sm text-muted-foreground">Photos</div>
                    <div className="text-lg font-semibold">{platformDetails.content.photos.toLocaleString()}</div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="text-sm text-muted-foreground">Videos</div>
                    <div className="text-lg font-semibold">{platformDetails.content.videos.toLocaleString()}</div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="text-sm text-muted-foreground">Posts</div>
                    <div className="text-lg font-semibold">{platformDetails.content.posts.toLocaleString()}</div>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="text-sm font-medium mb-3">Platform Features</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {Object.entries(platformDetails.features).map(([feature, enabled]) => (
                      <div key={feature} className="flex items-center gap-2">
                        {enabled ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-gray-300" />
                        )}
                        <span className="text-sm capitalize">{feature.replace(/([A-Z])/g, ' $1').trim()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Database:</span>
                    <span className="ml-2 font-medium">{platformDetails.database}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Launched:</span>
                    <span className="ml-2 font-medium">{new Date(platformDetails.launchedAt).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Uptime:</span>
                    <span className="ml-2 font-medium">{platformDetails.uptime}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Statistics</CardTitle>
                <CardDescription>Active users and engagement metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <div className="text-sm text-muted-foreground">Active Users</div>
                    <div className="text-2xl font-bold">{platformDetails.engagement.activeUsers.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Daily Visits</div>
                    <div className="text-2xl font-bold">{platformDetails.engagement.dailyVisits.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Avg Session</div>
                    <div className="text-2xl font-bold">{platformDetails.engagement.avgSessionTime}min</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Content Statistics</CardTitle>
                <CardDescription>Platform content breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">Photos</div>
                      <div className="text-sm text-muted-foreground">Total uploaded photos</div>
                    </div>
                    <div className="text-2xl font-bold">{platformDetails.content.photos.toLocaleString()}</div>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">Videos</div>
                      <div className="text-sm text-muted-foreground">Total uploaded videos</div>
                    </div>
                    <div className="text-2xl font-bold">{platformDetails.content.videos.toLocaleString()}</div>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">Posts</div>
                      <div className="text-sm text-muted-foreground">Total posts created</div>
                    </div>
                    <div className="text-2xl font-bold">{platformDetails.content.posts.toLocaleString()}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Revenue Tab */}
          <TabsContent value="revenue" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
                <CardDescription>Platform earnings and financial metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-green-600">${platformDetails.revenue.toLocaleString()}</div>
                <p className="text-sm text-muted-foreground mt-1">Total platform revenue</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Platform Settings</CardTitle>
                <CardDescription>Configure platform behavior and features</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button onClick={() => setIsConfigDialogOpen(true)}>
                    <Settings className="w-4 h-4 mr-2" />
                    Open Configuration
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Configuration Dialog */}
      <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Platform Configuration</DialogTitle>
            <DialogDescription>
              {selectedPlatform && `Configure settings for ${selectedPlatform}`}
            </DialogDescription>
          </DialogHeader>
          {platformConfig && (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <Label>Maintenance Mode</Label>
                <Switch checked={platformConfig.maintenanceMode} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Registration Enabled</Label>
                <Switch checked={platformConfig.registrationEnabled} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Age Verification</Label>
                <Switch checked={platformConfig.ageVerification} />
              </div>
              <div>
                <Label>Content Moderation</Label>
                <Select value={platformConfig.contentModeration}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Automatic</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfigDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsConfigDialogOpen(false)}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
