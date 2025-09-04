import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Eye,
  Zap,
  Play,
  Upload,
  Settings,
  TrendingUp,
  Headphones,
  Users,
  Clock,
  BarChart3,
  Activity,
  Cpu,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface VRContent {
  id: string;
  name: string;
  type:
    | "360_video"
    | "360_image"
    | "vr_experience"
    | "ar_overlay"
    | "3d_model"
    | "spatial_audio";
  processing: {
    status: "pending" | "processing" | "completed" | "failed";
    progress: number;
    stages: Array<{
      name: string;
      status: "pending" | "processing" | "completed" | "failed";
      progress: number;
    }>;
  };
  qualitySettings: {
    resolution: "8K" | "4K" | "2K" | "1080p" | "720p";
    bitrate: number;
    optimizeForDevice: "oculus" | "vive" | "pico" | "mobile" | "web";
  };
  createdAt: Date;
}

interface VRAnalytics {
  totalContent: number;
  processingQueue: number;
  completedToday: number;
  averageProcessingTime: number;
  qualityDistribution: Record<string, number>;
  platformDistribution: Record<string, number>;
}

interface SpatialInsights {
  totalSessions: number;
  averageSessionTime: number;
  completionRate: number;
  comfortScores: {
    averageMotionSickness: number;
    averageImmersion: number;
    averagePresence: number;
  };
  mostUsedDevices: Array<{ device: string; count: number }>;
  interactionHeatmap: Array<{
    type: string;
    count: number;
    successRate: number;
  }>;
}

export default function VRRenderingEngine() {
  const [activeTab, setActiveTab] = useState("overview");

  const { data: vrContent = [] } = useQuery({
    queryKey: ["/api/vr/content"],
    refetchInterval: 5000,
  });

  const { data: vrAnalytics } = useQuery({
    queryKey: ["/api/vr/analytics"],
    refetchInterval: 10000,
  });

  const { data: spatialInsights } = useQuery({
    queryKey: ["/api/vr/spatial-insights"],
    refetchInterval: 15000,
  });

  const { data: processingStatus } = useQuery({
    queryKey: ["/api/vr/processing-status"],
    refetchInterval: 3000,
  });

  const analytics = (vrAnalytics?.analytics as VRAnalytics) || {
    totalContent: 0,
    processingQueue: 0,
    completedToday: 0,
    averageProcessingTime: 0,
    qualityDistribution: {},
    platformDistribution: {},
  };

  const insights = (spatialInsights?.insights as SpatialInsights) || {
    totalSessions: 0,
    averageSessionTime: 0,
    completionRate: 0,
    comfortScores: {
      averageMotionSickness: 0,
      averageImmersion: 0,
      averagePresence: 0,
    },
    mostUsedDevices: [],
    interactionHeatmap: [],
  };

  const content = ((vrContent as any)?.content as VRContent[]) || [];
  const status = processingStatus?.status;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "processing":
        return "bg-blue-500";
      case "pending":
        return "bg-yellow-500";
      case "failed":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "360_video":
        return <Play className="h-4 w-4" />;
      case "360_image":
        return <Eye className="h-4 w-4" />;
      case "vr_experience":
        return <Zap className="h-4 w-4" />;
      case "ar_overlay":
        return <Upload className="h-4 w-4" />;
      case "3d_model":
        return <Settings className="h-4 w-4" />;
      case "spatial_audio":
        return <Headphones className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div
      className="p-6 space-y-6 bg-black min-h-screen"
      data-testid="vr-rendering-dashboard"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            VR/AR Rendering Engine
          </h1>
          <p className="text-cyan-400 mt-2">
            Advanced immersive content processing and optimization
          </p>
        </div>
        <div className="flex space-x-2">
          <Badge variant="outline" className="border-cyan-400 text-cyan-400">
            Neural Processing
          </Badge>
          <Badge variant="outline" className="border-green-400 text-green-400">
            Real-time Rendering
          </Badge>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-gray-400">
                Total Content
              </CardTitle>
              <Eye className="h-4 w-4 text-cyan-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {analytics.totalContent.toLocaleString()}
            </div>
            <p className="text-xs text-green-400">
              +{analytics.completedToday} today
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-gray-400">
                Processing Queue
              </CardTitle>
              <Cpu className="h-4 w-4 text-yellow-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {analytics.processingQueue}
            </div>
            <p className="text-xs text-blue-400">
              Est. {status?.estimatedWaitTime || 0}s wait
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-gray-400">
                VR Sessions
              </CardTitle>
              <Users className="h-4 w-4 text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {insights.totalSessions.toLocaleString()}
            </div>
            <p className="text-xs text-cyan-400">
              {insights.completionRate}% completion
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-gray-400">
                Avg Session Time
              </CardTitle>
              <Clock className="h-4 w-4 text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {Math.round(insights.averageSessionTime / 60)}m
            </div>
            <p className="text-xs text-green-400">
              {insights.comfortScores.averageImmersion}/10 immersion
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="bg-gray-900 border border-gray-800">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-cyan-600"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="content"
            className="data-[state=active]:bg-cyan-600"
          >
            Content Library
          </TabsTrigger>
          <TabsTrigger
            value="processing"
            className="data-[state=active]:bg-cyan-600"
          >
            Processing Queue
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="data-[state=active]:bg-cyan-600"
          >
            Spatial Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quality Distribution */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-cyan-400" />
                  Quality Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(analytics.qualityDistribution).map(
                    ([quality, count]) => (
                      <div
                        key={quality}
                        className="flex items-center justify-between"
                      >
                        <span className="text-gray-300">{quality}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-cyan-400 h-2 rounded-full"
                              style={{
                                width: `${(count / Math.max(...Object.values(analytics.qualityDistribution))) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm text-white w-8">
                            {count}
                          </span>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Platform Distribution */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-400" />
                  Platform Optimization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(analytics.platformDistribution).map(
                    ([platform, count]) => (
                      <div
                        key={platform}
                        className="flex items-center justify-between"
                      >
                        <span className="text-gray-300 capitalize">
                          {platform}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-purple-400 h-2 rounded-full"
                              style={{
                                width: `${(count / Math.max(...Object.values(analytics.platformDistribution))) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm text-white w-8">
                            {count}
                          </span>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Most Used VR Devices */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Headphones className="h-5 w-5 text-green-400" />
                  Popular VR Headsets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {insights.mostUsedDevices.map((device, index) => (
                    <div
                      key={device.device}
                      className="flex items-center justify-between"
                    >
                      <span className="text-gray-300">{device.device}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-green-400 h-2 rounded-full"
                            style={{
                              width: `${(device.count / Math.max(...insights.mostUsedDevices.map((d) => d.count))) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm text-white w-12">
                          {device.count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Comfort Metrics */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-400" />
                  User Comfort Scores
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Motion Sickness</span>
                      <span className="text-white">
                        {insights.comfortScores.averageMotionSickness}/10
                      </span>
                    </div>
                    <Progress
                      value={insights.comfortScores.averageMotionSickness * 10}
                      className="bg-gray-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Immersion Level</span>
                      <span className="text-white">
                        {insights.comfortScores.averageImmersion}/10
                      </span>
                    </div>
                    <Progress
                      value={insights.comfortScores.averageImmersion * 10}
                      className="bg-gray-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Presence Score</span>
                      <span className="text-white">
                        {insights.comfortScores.averagePresence}/10
                      </span>
                    </div>
                    <Progress
                      value={insights.comfortScores.averagePresence * 10}
                      className="bg-gray-700"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">
                VR/AR Content Library
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {content.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    No VR content found. Upload some 360° videos or VR
                    experiences to get started.
                  </div>
                ) : (
                  content.map((item: VRContent) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {getTypeIcon(item.type)}
                        <div>
                          <h3 className="text-white font-medium">
                            {item.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {item.type.replace("_", " ")}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {item.qualitySettings.resolution}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {item.qualitySettings.optimizeForDevice}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div
                            className={`inline-block w-2 h-2 rounded-full ${getStatusColor(item.processing.status)} mr-2`}
                          />
                          <span className="text-sm text-gray-300 capitalize">
                            {item.processing.status}
                          </span>
                          {item.processing.status === "processing" && (
                            <div className="mt-1">
                              <Progress
                                value={item.processing.progress}
                                className="w-20 h-1"
                              />
                            </div>
                          )}
                        </div>
                        <Button size="sm" variant="outline" className="text-xs">
                          View
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="processing" className="space-y-6">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">
                Processing Queue Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                  <div className="text-2xl font-bold text-cyan-400">
                    {status?.queueLength || 0}
                  </div>
                  <div className="text-sm text-gray-400">Items in Queue</div>
                </div>
                <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-400">
                    {status?.activeProcesses || 0}
                  </div>
                  <div className="text-sm text-gray-400">Active Processes</div>
                </div>
                <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                  <div className="text-2xl font-bold text-green-400">
                    {Math.round((status?.estimatedWaitTime || 0) / 60)}m
                  </div>
                  <div className="text-sm text-gray-400">Est. Wait Time</div>
                </div>
              </div>

              <div className="space-y-4">
                {content
                  .filter(
                    (item: VRContent) =>
                      item.processing.status === "processing",
                  )
                  .map((item: VRContent) => (
                    <div
                      key={item.id}
                      className="p-4 bg-gray-800/50 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-white font-medium">{item.name}</h3>
                        <span className="text-sm text-cyan-400">
                          {item.processing.progress}%
                        </span>
                      </div>
                      <Progress
                        value={item.processing.progress}
                        className="mb-3"
                      />
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                        {item.processing.stages.map((stage, index) => (
                          <div key={index} className="flex items-center gap-1">
                            <div
                              className={`w-2 h-2 rounded-full ${getStatusColor(stage.status)}`}
                            />
                            <span className="text-gray-300">{stage.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                {content.filter(
                  (item: VRContent) => item.processing.status === "processing",
                ).length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    No items currently processing
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">
                Spatial Analytics & User Behavior
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Interaction Heatmap */}
                <div>
                  <h3 className="text-white font-medium mb-4">
                    Interaction Heatmap
                  </h3>
                  <div className="space-y-3">
                    {insights.interactionHeatmap.map((interaction, index) => (
                      <div
                        key={interaction.type}
                        className="flex items-center justify-between p-3 bg-gray-800/50 rounded"
                      >
                        <span className="text-gray-300 capitalize">
                          {interaction.type}
                        </span>
                        <div className="flex items-center gap-3">
                          <div className="text-sm text-white">
                            {interaction.count} interactions
                          </div>
                          <div className="text-sm text-green-400">
                            {interaction.successRate}% success
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Performance Insights */}
                <div>
                  <h3 className="text-white font-medium mb-4">
                    Performance Insights
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-800/50 rounded-lg">
                      <div className="text-sm text-gray-400 mb-1">
                        Average Processing Time
                      </div>
                      <div className="text-xl font-bold text-cyan-400">
                        {Math.round(analytics.averageProcessingTime / 1000)}s
                      </div>
                    </div>
                    <div className="p-4 bg-gray-800/50 rounded-lg">
                      <div className="text-sm text-gray-400 mb-1">
                        Success Rate
                      </div>
                      <div className="text-xl font-bold text-green-400">
                        94.7%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
