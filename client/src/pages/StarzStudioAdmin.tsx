import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Play,
  Pause,
  RefreshCw,
  Settings,
  Plus,
  Eye,
  Zap,
  Target,
  Rocket,
  Brain,
  DollarSign,
  BarChart3,
  Globe,
  Monitor,
  Clock,
  TrendingUp,
  Users,
  Film,
  Layers,
  Activity,
  CheckCircle,
  AlertCircle,
  XCircle,
  Wifi,
  WifiOff,
  Cpu,
  Database,
  Cloud,
} from "lucide-react";

interface PlatformCluster {
  id: string;
  name: string;
  port: number;
  endpoint: string;
  theme: {
    primary: string;
    accent: string;
    branding: string;
  };
  contentSpecs: {
    preferredFormats: string[];
    aspectRatios: string[];
    maxDuration: number;
    targetLanguages: string[];
  };
  status: "online" | "offline" | "maintenance";
  lastSync: Date;
}

interface StudioProject {
  id: string;
  name: string;
  description: string;
  creatorId: string;
  status:
    | "planning"
    | "production"
    | "processing"
    | "review"
    | "published"
    | "archived";
  priority: "low" | "medium" | "high" | "urgent";
  targetClusters: string[];
  timeline: {
    created: Date;
    startProduction: Date | null;
    expectedCompletion: Date | null;
    published: Date | null;
  };
  budget: {
    allocated: number;
    spent: number;
    projected: number;
  };
  performance: {
    views: number;
    revenue: number;
    engagement: number;
    roi: number;
  };
  collaboration: {
    editors: string[];
    activeUsers: number;
    lastActivity: Date;
  };
}

interface StudioAnalytics {
  overview: {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    totalRevenue: number;
    averageROI: number;
    processingCapacity: number;
  };
  performance: {
    contentProductionRate: number;
    averageTimeToPublish: number;
    qualityScore: number;
    creatorSatisfaction: number;
  };
  clusterMetrics: Array<{
    clusterId: string;
    contentCount: number;
    revenue: number;
    engagement: number;
    conversionRate: number;
  }>;
  aiMetrics: {
    jobsProcessed: number;
    averageProcessingTime: number;
    successRate: number;
    costPerJob: number;
  };
}

export default function StarzStudioAdmin() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [newProjectDialog, setNewProjectDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch platform clusters
  const {
    data: clustersData,
    isLoading: clustersLoading,
    refetch: refetchClusters,
  } = useQuery({
    queryKey: ["/api/starz-studio/clusters"],
    refetchInterval: 30000,
  });

  // Fetch projects
  const {
    data: projectsData,
    isLoading: projectsLoading,
    refetch: refetchProjects,
  } = useQuery({
    queryKey: ["/api/starz-studio/projects"],
    refetchInterval: 15000,
  });

  // Fetch analytics
  const {
    data: analyticsData,
    isLoading: analyticsLoading,
    refetch: refetchAnalytics,
  } = useQuery({
    queryKey: ["/api/starz-studio/analytics"],
    refetchInterval: 10000,
  });

  // Fetch service status
  const { data: statusData, isLoading: statusLoading } = useQuery({
    queryKey: ["/api/starz-studio/status"],
    refetchInterval: 5000,
  });

  // Fetch finance integration
  const { data: financeData, isLoading: financeLoading } = useQuery({
    queryKey: ["/api/starz-studio/finance/integration"],
    refetchInterval: 30000,
  });

  // Sync clusters mutation
  const syncClustersMutation = useMutation({
    mutationFn: () => apiRequest("/api/starz-studio/clusters/sync", "POST"),
    onSuccess: () => {
      toast({
        title: "Platform Sync",
        description: "All platform clusters synchronized successfully",
      });
      refetchClusters();
    },
    onError: () => {
      toast({
        title: "Sync Failed",
        description: "Failed to synchronize platform clusters",
        variant: "destructive",
      });
    },
  });

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: (projectData: any) =>
      apiRequest("/api/starz-studio/projects", "POST", projectData),
    onSuccess: () => {
      toast({
        title: "Project Created",
        description: "New project created successfully",
      });
      refetchProjects();
      setNewProjectDialog(false);
    },
    onError: () => {
      toast({
        title: "Creation Failed",
        description: "Failed to create new project",
        variant: "destructive",
      });
    },
  });

  const clusters: PlatformCluster[] = (clustersData as any)?.clusters || [];
  const projects: StudioProject[] = (projectsData as any)?.projects || [];
  const analytics: StudioAnalytics = (analyticsData as any)?.analytics || {
    overview: {
      totalProjects: 0,
      activeProjects: 0,
      completedProjects: 0,
      totalRevenue: 0,
      averageROI: 0,
      processingCapacity: 100,
    },
    performance: {
      contentProductionRate: 0,
      averageTimeToPublish: 0,
      qualityScore: 95,
      creatorSatisfaction: 92,
    },
    clusterMetrics: [],
    aiMetrics: {
      jobsProcessed: 0,
      averageProcessingTime: 0,
      successRate: 98,
      costPerJob: 0,
    },
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "online":
        return <Wifi className="h-4 w-4 text-green-400" />;
      case "offline":
        return <WifiOff className="h-4 w-4 text-red-400" />;
      case "maintenance":
        return <Settings className="h-4 w-4 text-yellow-400" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-600 text-white";
      case "high":
        return "bg-orange-600 text-white";
      case "medium":
        return "bg-blue-600 text-white";
      case "low":
        return "bg-gray-600 text-white";
      default:
        return "bg-gray-600 text-white";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-600 text-white";
      case "processing":
        return "bg-blue-600 text-white";
      case "production":
        return "bg-purple-600 text-white";
      case "planning":
        return "bg-yellow-600 text-black";
      case "review":
        return "bg-orange-600 text-white";
      case "archived":
        return "bg-gray-600 text-white";
      default:
        return "bg-gray-600 text-white";
    }
  };

  return (
    <div className="p-6 space-y-6 bg-black min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            🎬 Starz Studio Admin Panel
          </h1>
          <p className="text-gray-400 mt-1">
            AI-Powered Content Production Service • FANZ OS 3.0 Ecosystem
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => syncClustersMutation.mutate()}
            disabled={syncClustersMutation.isPending}
            variant="outline"
            className="border-cyan-600 text-cyan-400 hover:bg-cyan-600/20"
            data-testid="button-sync-clusters"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${syncClustersMutation.isPending ? "animate-spin" : ""}`}
            />
            Sync Clusters
          </Button>
        </div>
      </div>

      {/* Service Status Bar */}
      <Card className="bg-gray-900 border-gray-700">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-400" />
              <div>
                <p className="text-sm font-medium text-gray-400">
                  Service Status
                </p>
                <p className="text-lg font-bold text-green-400">
                  {(statusData as any)?.status?.isRunning
                    ? "ONLINE"
                    : "OFFLINE"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Cpu className="h-5 w-5 text-blue-400" />
              <div>
                <p className="text-sm font-medium text-gray-400">
                  Processing Capacity
                </p>
                <p className="text-lg font-bold text-blue-400">
                  {analytics.overview.processingCapacity}%
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-purple-400" />
              <div>
                <p className="text-sm font-medium text-gray-400">
                  Active Clusters
                </p>
                <p className="text-lg font-bold text-purple-400">
                  {clusters.filter((c) => c.status === "online").length}/
                  {clusters.length}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Film className="h-5 w-5 text-yellow-400" />
              <div>
                <p className="text-sm font-medium text-gray-400">
                  Active Projects
                </p>
                <p className="text-lg font-bold text-yellow-400">
                  {analytics.overview.activeProjects}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-6 bg-gray-900">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-cyan-600"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="clusters"
            className="data-[state=active]:bg-purple-600"
          >
            Clusters
          </TabsTrigger>
          <TabsTrigger
            value="projects"
            className="data-[state=active]:bg-blue-600"
          >
            Projects
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="data-[state=active]:bg-green-600"
          >
            Analytics
          </TabsTrigger>
          <TabsTrigger
            value="ai-jobs"
            className="data-[state=active]:bg-pink-600"
          >
            AI Jobs
          </TabsTrigger>
          <TabsTrigger
            value="finance"
            className="data-[state=active]:bg-yellow-600"
          >
            Finance
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-cyan-900/50 to-blue-900/50 border-cyan-600/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-cyan-400 text-sm font-medium">
                      Total Projects
                    </p>
                    <p className="text-2xl font-bold text-white">
                      {analytics.overview.totalProjects}
                    </p>
                  </div>
                  <Film className="h-8 w-8 text-cyan-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border-purple-600/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-400 text-sm font-medium">
                      Total Revenue
                    </p>
                    <p className="text-2xl font-bold text-white">
                      ${analytics.overview.totalRevenue.toLocaleString()}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-900/50 to-teal-900/50 border-green-600/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-400 text-sm font-medium">
                      Average ROI
                    </p>
                    <p className="text-2xl font-bold text-white">
                      {analytics.overview.averageROI.toFixed(1)}%
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-900/50 to-orange-900/50 border-yellow-600/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-400 text-sm font-medium">
                      AI Success Rate
                    </p>
                    <p className="text-2xl font-bold text-white">
                      {analytics.aiMetrics.successRate}%
                    </p>
                  </div>
                  <Brain className="h-8 w-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-cyan-400">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={() => setNewProjectDialog(true)}
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
                data-testid="button-create-project"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Project
              </Button>
              <Button
                onClick={() => setActiveTab("ai-jobs")}
                variant="outline"
                className="border-purple-600 text-purple-400 hover:bg-purple-600/20"
                data-testid="button-view-ai-jobs"
              >
                <Brain className="h-4 w-4 mr-2" />
                View AI Jobs
              </Button>
              <Button
                onClick={() => setActiveTab("analytics")}
                variant="outline"
                className="border-green-600 text-green-400 hover:bg-green-600/20"
                data-testid="button-view-analytics"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Clusters Tab */}
        <TabsContent value="clusters" className="space-y-4">
          <div className="grid gap-4">
            {clusters.map((cluster) => (
              <Card key={cluster.id} className="bg-gray-900 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(cluster.status)}
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {cluster.name}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          Port: {cluster.port} • {cluster.endpoint}
                        </p>
                      </div>
                    </div>
                    <Badge
                      className={
                        cluster.status === "online"
                          ? "bg-green-600"
                          : cluster.status === "offline"
                            ? "bg-red-600"
                            : "bg-yellow-600"
                      }
                    >
                      {cluster.status.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-400 mb-2">
                        Content Specs
                      </p>
                      <div className="space-y-1">
                        <p className="text-xs text-gray-300">
                          Formats:{" "}
                          {cluster.contentSpecs.preferredFormats.join(", ")}
                        </p>
                        <p className="text-xs text-gray-300">
                          Ratios: {cluster.contentSpecs.aspectRatios.join(", ")}
                        </p>
                        <p className="text-xs text-gray-300">
                          Max Duration: {cluster.contentSpecs.maxDuration}s
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-400 mb-2">
                        Languages
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {cluster.contentSpecs.targetLanguages.map((lang) => (
                          <Badge
                            key={lang}
                            variant="secondary"
                            className="text-xs"
                          >
                            {lang.toUpperCase()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-400 mb-2">
                        Last Sync
                      </p>
                      <p className="text-xs text-gray-300">
                        {new Date(cluster.lastSync).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">
              Production Projects
            </h2>
            <Button
              onClick={() => setNewProjectDialog(true)}
              className="bg-gradient-to-r from-cyan-600 to-blue-600"
              data-testid="button-create-new-project"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </div>

          <div className="grid gap-4">
            {projects.map((project) => (
              <Card
                key={project.id}
                className="bg-gray-900 border-gray-700 hover:border-cyan-600/50 transition-colors"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">
                        {project.name}
                      </h3>
                      <p className="text-gray-400 text-sm mb-2">
                        {project.description}
                      </p>
                      <div className="flex gap-2 mb-2">
                        <Badge className={getStatusBadgeColor(project.status)}>
                          {project.status.toUpperCase()}
                        </Badge>
                        <Badge
                          className={getPriorityBadgeColor(project.priority)}
                        >
                          {project.priority.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Budget</p>
                      <p className="font-semibold text-white">
                        ${project.budget.spent.toLocaleString()} / $
                        {project.budget.allocated.toLocaleString()}
                      </p>
                      <Progress
                        value={
                          (project.budget.spent / project.budget.allocated) *
                          100
                        }
                        className="w-20 mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Target Clusters</p>
                      <p className="text-white">
                        {project.targetClusters.length} platforms
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Collaborators</p>
                      <p className="text-white">
                        {project.collaboration.activeUsers} active
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Performance</p>
                      <p className="text-white">
                        {project.performance.views.toLocaleString()} views
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">ROI</p>
                      <p
                        className={`font-semibold ${project.performance.roi >= 0 ? "text-green-400" : "text-red-400"}`}
                      >
                        {project.performance.roi.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-cyan-400">
                  Production Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Content Production Rate</span>
                  <span className="font-semibold text-white">
                    {analytics.performance.contentProductionRate}/month
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Avg Time to Publish</span>
                  <span className="font-semibold text-white">
                    {analytics.performance.averageTimeToPublish}h
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Quality Score</span>
                  <span className="font-semibold text-green-400">
                    {analytics.performance.qualityScore}/100
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Creator Satisfaction</span>
                  <span className="font-semibold text-green-400">
                    {analytics.performance.creatorSatisfaction}%
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-purple-400">
                  AI Processing Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Jobs Processed</span>
                  <span className="font-semibold text-white">
                    {analytics.aiMetrics.jobsProcessed.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Avg Processing Time</span>
                  <span className="font-semibold text-white">
                    {analytics.aiMetrics.averageProcessingTime}s
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Success Rate</span>
                  <span className="font-semibold text-green-400">
                    {analytics.aiMetrics.successRate}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Cost Per Job</span>
                  <span className="font-semibold text-white">
                    ${analytics.aiMetrics.costPerJob.toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cluster Performance */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-green-400">
                Platform Cluster Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.clusterMetrics.map((metric) => {
                  const cluster = clusters.find(
                    (c) => c.id === metric.clusterId,
                  );
                  return (
                    <div
                      key={metric.clusterId}
                      className="flex items-center justify-between p-4 bg-gray-800 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Globe className="h-5 w-5 text-blue-400" />
                        <div>
                          <p className="font-medium text-white">
                            {cluster?.name || metric.clusterId}
                          </p>
                          <p className="text-sm text-gray-400">
                            {metric.contentCount} content items
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-6 text-right">
                        <div>
                          <p className="text-sm text-gray-400">Revenue</p>
                          <p className="font-semibold text-green-400">
                            ${metric.revenue.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Engagement</p>
                          <p className="font-semibold text-blue-400">
                            {metric.engagement.toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Conversion</p>
                          <p className="font-semibold text-purple-400">
                            {metric.conversionRate.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Jobs Tab */}
        <TabsContent value="ai-jobs" className="space-y-4">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-pink-400">
                AI Processing Pipeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-900/30 rounded-lg border border-blue-600/30">
                  <Layers className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Queued Jobs</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {(statusData as any)?.status?.queuedJobs || 0}
                  </p>
                </div>
                <div className="text-center p-4 bg-purple-900/30 rounded-lg border border-purple-600/30">
                  <Activity className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Processing</p>
                  <p className="text-2xl font-bold text-purple-400">
                    {(statusData as any)?.status?.processingJobs || 0}
                  </p>
                </div>
                <div className="text-center p-4 bg-green-900/30 rounded-lg border border-green-600/30">
                  <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Success Rate</p>
                  <p className="text-2xl font-bold text-green-400">
                    {analytics.aiMetrics.successRate}%
                  </p>
                </div>
                <div className="text-center p-4 bg-yellow-900/30 rounded-lg border border-yellow-600/30">
                  <Clock className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Avg Time</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {analytics.aiMetrics.averageProcessingTime}s
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-400 mb-3">
                  AI Processing Types
                </h4>
                {[
                  "storyboard",
                  "editing",
                  "optimization",
                  "translation",
                  "thumbnails",
                  "pricing",
                ].map((type) => (
                  <div
                    key={type}
                    className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Brain className="h-5 w-5 text-pink-400" />
                      <span className="font-medium text-white capitalize">
                        {type}
                      </span>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-gray-700 text-gray-300"
                    >
                      Available
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Finance Tab */}
        <TabsContent value="finance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-green-900/30 to-teal-900/30 border-green-600/30">
              <CardHeader>
                <CardTitle className="text-green-400 flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Financial Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(financeData as any)?.integration && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Production Costs</span>
                      <span className="font-semibold text-white">
                        $
                        {(
                          financeData as any
                        ).integration.contentProductionCosts?.toLocaleString() ||
                          0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Content Revenue</span>
                      <span className="font-semibold text-green-400">
                        $
                        {(
                          financeData as any
                        ).integration.contentRevenue?.toLocaleString() || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Platform ROI</span>
                      <span className="font-semibold text-green-400">
                        {(financeData as any).integration.platformROI?.toFixed(
                          1,
                        ) || 0}
                        %
                      </span>
                    </div>
                    <Separator className="bg-gray-700" />
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Profit Margin</span>
                      <span className="font-semibold text-green-400">
                        {(
                          financeData as any
                        ).integration.financialHealth?.profitMargin?.toFixed(
                          1,
                        ) || 0}
                        %
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border-blue-600/30">
              <CardHeader>
                <CardTitle className="text-blue-400 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  AI CFO Integration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 p-3 bg-blue-900/20 rounded-lg border border-blue-600/20">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span className="text-sm text-white">
                    Connected to AI CFO System
                  </span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-purple-900/20 rounded-lg border border-purple-600/20">
                  <Cloud className="h-5 w-5 text-purple-400" />
                  <span className="text-sm text-white">
                    Real-time Cost Tracking
                  </span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-green-900/20 rounded-lg border border-green-600/20">
                  <Database className="h-5 w-5 text-green-400" />
                  <span className="text-sm text-white">
                    Automated Revenue Analysis
                  </span>
                </div>
                <Button
                  onClick={() => (window.location.href = "/ai-cfo")}
                  variant="outline"
                  className="w-full border-blue-600 text-blue-400 hover:bg-blue-600/20"
                  data-testid="button-view-ai-cfo"
                >
                  View Full AI CFO Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="text-center text-sm text-gray-500 pt-4 border-t border-gray-800">
        © 2025 Fanz™ Unlimited Network LLC. All Rights Reserved. | FANZ OS 3.0
        • Starz Studio
      </div>
    </div>
  );
}
