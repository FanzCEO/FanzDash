import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  BarChart3,
  TrendingUp,
  TrendingDown,
  PieChart,
  Activity,
  Target,
  Brain,
  Zap,
  Eye,
  Users,
} from "lucide-react";

export default function AdvancedAnalyticsPage() {
  const [timeRange, setTimeRange] = useState("7d");
  const [platform, setPlatform] = useState("all");

  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ["/api/analytics/advanced", timeRange, platform],
    refetchInterval: 30000,
  });

  const mockData = {
    contentAnalysis: {
      totalContent: 2847561,
      growthRate: 15.3,
      riskDistribution: {
        safe: 87.4,
        suspicious: 9.2,
        flagged: 2.8,
        blocked: 0.6,
      },
      contentTypes: {
        images: { count: 1547832, risk: 3.2, blocked: 432 },
        videos: { count: 897645, risk: 4.7, blocked: 587 },
        text: { count: 345621, risk: 1.8, blocked: 89 },
        livestreams: { count: 56463, risk: 6.1, blocked: 123 },
      },
      aiPerformance: {
        accuracy: 96.8,
        falsePositives: 2.1,
        falseNegatives: 1.1,
        averageProcessingTime: 1.24,
        confidenceScore: 94.7,
      },
    },
    userBehavior: {
      totalUsers: 2847512,
      activeUsers: 1456789,
      newRegistrations: 23456,
      suspiciousAccounts: 1247,
      accountsBlocked: 347,
      uploadPatterns: {
        peakHours: [20, 21, 22, 23],
        riskierHours: [22, 23, 0, 1],
        averageUploadsPerUser: 4.7,
        repeatOffenders: 89,
      },
      geographicDistribution: [
        { region: "North America", users: 45.2, risk: 2.8 },
        { region: "Europe", users: 32.1, risk: 3.4 },
        { region: "Asia Pacific", users: 15.7, risk: 4.1 },
        { region: "Latin America", users: 4.8, risk: 5.2 },
        { region: "Other", users: 2.2, risk: 6.7 },
      ],
    },
    moderatorEfficiency: {
      totalModerators: 24,
      activeModerators: 18,
      averageReviewTime: 2.3,
      accuracyRating: 97.2,
      workloadDistribution: [
        {
          moderator: "Sarah_Admin",
          reviews: 1247,
          accuracy: 98.2,
          avgTime: 1.8,
        },
        { moderator: "Alex_Mod", reviews: 967, accuracy: 97.8, avgTime: 2.1 },
        { moderator: "Jordan_Mod", reviews: 834, accuracy: 96.9, avgTime: 2.4 },
        { moderator: "Riley_Mod", reviews: 756, accuracy: 95.7, avgTime: 2.8 },
      ],
      burnoutRisk: [
        {
          moderator: "Alex_Mod",
          riskLevel: 78,
          reason: "High volume, long hours",
        },
        {
          moderator: "Casey_Mod",
          riskLevel: 65,
          reason: "Difficult content exposure",
        },
      ],
    },
    platformComparison: [
      {
        platform: "FanzMain Adult",
        metrics: {
          contentVolume: 1247832,
          riskScore: 6.7,
          moderationSpeed: 1.9,
          userSatisfaction: 87.3,
          revenueImpact: 2.1,
        },
      },
      {
        platform: "FanzLive Streaming",
        metrics: {
          contentVolume: 834567,
          riskScore: 4.2,
          moderationSpeed: 2.4,
          userSatisfaction: 91.7,
          revenueImpact: 1.3,
        },
      },
      {
        platform: "FanzSocial Community",
        metrics: {
          contentVolume: 765162,
          riskScore: 3.8,
          moderationSpeed: 1.6,
          userSatisfaction: 93.1,
          revenueImpact: 0.8,
        },
      },
    ],
    predictiveAnalytics: {
      riskForecast: {
        nextWeek: { riskLevel: "medium", confidence: 87 },
        nextMonth: { riskLevel: "high", confidence: 73 },
        seasonal: { riskLevel: "variable", confidence: 65 },
      },
      resourceNeeds: {
        moderatorsNeeded: 3,
        serverCapacity: 15,
        budgetImpact: 12.7,
      },
      trendsDetected: [
        {
          trend: "Increased deepfake content",
          severity: "high",
          confidence: 92,
        },
        {
          trend: "Coordinated spam campaigns",
          severity: "medium",
          confidence: 84,
        },
        { trend: "New evasion techniques", severity: "high", confidence: 78 },
      ],
    },
  };

  if (isLoading) {
    return (
      <div className="min-h-screen cyber-bg flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="w-16 h-16 mx-auto mb-4 cyber-pulse text-primary" />
          <p className="cyber-text-glow">Loading Advanced Analytics...</p>
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
            <h1 className="text-3xl font-bold cyber-text-glow">
              Advanced Analytics Center
            </h1>
            <p className="text-muted-foreground">
              Deep Insights & Predictive Intelligence
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">24 Hours</SelectItem>
                <SelectItem value="7d">7 Days</SelectItem>
                <SelectItem value="30d">30 Days</SelectItem>
                <SelectItem value="90d">90 Days</SelectItem>
              </SelectContent>
            </Select>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                <SelectItem value="main">FanzMain Adult</SelectItem>
                <SelectItem value="live">FanzLive Streaming</SelectItem>
                <SelectItem value="social">FanzSocial Community</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="cyber-border">
              <Eye className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Overview Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card className="cyber-card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary cyber-text-glow">
                {(mockData.contentAnalysis.totalContent / 1000000).toFixed(1)}M
              </div>
              <div className="text-sm text-muted-foreground">Total Content</div>
              <div className="flex items-center justify-center mt-1">
                <TrendingUp className="w-3 h-3 text-green-400 mr-1" />
                <span className="text-xs text-green-400">
                  +{mockData.contentAnalysis.growthRate}%
                </span>
              </div>
            </CardContent>
          </Card>
          <Card className="cyber-card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-400 cyber-text-glow">
                {mockData.contentAnalysis.riskDistribution.safe}%
              </div>
              <div className="text-sm text-muted-foreground">Safe Content</div>
            </CardContent>
          </Card>
          <Card className="cyber-card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-400 cyber-text-glow">
                {mockData.contentAnalysis.riskDistribution.flagged}%
              </div>
              <div className="text-sm text-muted-foreground">
                Flagged Content
              </div>
            </CardContent>
          </Card>
          <Card className="cyber-card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-400 cyber-text-glow">
                {mockData.contentAnalysis.aiPerformance.accuracy}%
              </div>
              <div className="text-sm text-muted-foreground">AI Accuracy</div>
            </CardContent>
          </Card>
          <Card className="cyber-card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-accent cyber-text-glow">
                {mockData.moderatorEfficiency.averageReviewTime}min
              </div>
              <div className="text-sm text-muted-foreground">
                Avg Review Time
              </div>
            </CardContent>
          </Card>
          <Card className="cyber-card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-400 cyber-text-glow">
                {(mockData.userBehavior.activeUsers / 1000000).toFixed(1)}M
              </div>
              <div className="text-sm text-muted-foreground">Active Users</div>
            </CardContent>
          </Card>
        </div>

        {/* Advanced Analytics Tabs */}
        <Tabs defaultValue="content" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 cyber-card">
            <TabsTrigger value="content">Content Intelligence</TabsTrigger>
            <TabsTrigger value="behavior">User Behavior</TabsTrigger>
            <TabsTrigger value="moderators">Moderator Analytics</TabsTrigger>
            <TabsTrigger value="platforms">Platform Comparison</TabsTrigger>
            <TabsTrigger value="predictions">Predictive AI</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="cyber-card neural-network">
                <CardHeader>
                  <CardTitle className="cyber-text-glow">
                    CONTENT TYPE ANALYSIS
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(mockData.contentAnalysis.contentTypes).map(
                      ([type, data]) => (
                        <div
                          key={type}
                          className="flex items-center justify-between p-3 cyber-card border border-primary/20"
                        >
                          <div className="flex items-center space-x-3">
                            <PieChart className="w-5 h-5 text-primary" />
                            <div>
                              <div className="font-medium capitalize">
                                {type}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {data.count.toLocaleString()} items
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-red-400">
                              {data.risk}% risk
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {data.blocked} blocked
                            </div>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="cyber-card">
                <CardHeader>
                  <CardTitle className="cyber-text-glow">
                    AI PERFORMANCE METRICS
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Detection Accuracy</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-green-400">
                          {mockData.contentAnalysis.aiPerformance.accuracy}%
                        </span>
                        <TrendingUp className="w-4 h-4 text-green-400" />
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>False Positives</span>
                      <span className="font-bold text-yellow-400">
                        {mockData.contentAnalysis.aiPerformance.falsePositives}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>False Negatives</span>
                      <span className="font-bold text-red-400">
                        {mockData.contentAnalysis.aiPerformance.falseNegatives}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Processing Speed</span>
                      <span className="font-bold text-blue-400">
                        {
                          mockData.contentAnalysis.aiPerformance
                            .averageProcessingTime
                        }
                        s
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Confidence Score</span>
                      <span className="font-bold text-primary">
                        {mockData.contentAnalysis.aiPerformance.confidenceScore}
                        %
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="cyber-card">
              <CardHeader>
                <CardTitle className="cyber-text-glow">
                  RISK DISTRIBUTION ANALYSIS
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-6">
                  {Object.entries(
                    mockData.contentAnalysis.riskDistribution,
                  ).map(([level, percentage]) => (
                    <div key={level} className="text-center">
                      <div
                        className={`text-3xl font-bold mb-2 ${
                          level === "safe"
                            ? "text-green-400"
                            : level === "suspicious"
                              ? "text-yellow-400"
                              : level === "flagged"
                                ? "text-orange-400"
                                : "text-red-400"
                        } cyber-text-glow`}
                      >
                        {percentage}%
                      </div>
                      <div className="text-sm text-muted-foreground capitalize">
                        {level}
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 mt-2">
                        <div
                          className={`h-2 rounded-full ${
                            level === "safe"
                              ? "bg-green-400"
                              : level === "suspicious"
                                ? "bg-yellow-400"
                                : level === "flagged"
                                  ? "bg-orange-400"
                                  : "bg-red-400"
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="behavior" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="cyber-card">
                <CardHeader>
                  <CardTitle className="cyber-text-glow">
                    USER ACTIVITY PATTERNS
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Total Registered Users</span>
                      <span className="font-bold text-primary">
                        {mockData.userBehavior.totalUsers.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Daily Active Users</span>
                      <span className="font-bold text-green-400">
                        {mockData.userBehavior.activeUsers.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>New Registrations</span>
                      <span className="font-bold text-blue-400">
                        {mockData.userBehavior.newRegistrations.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Suspicious Accounts</span>
                      <span className="font-bold text-yellow-400">
                        {mockData.userBehavior.suspiciousAccounts.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Blocked Accounts</span>
                      <span className="font-bold text-red-400">
                        {mockData.userBehavior.accountsBlocked.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="cyber-card">
                <CardHeader>
                  <CardTitle className="cyber-text-glow">
                    GEOGRAPHIC RISK DISTRIBUTION
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockData.userBehavior.geographicDistribution.map(
                      (region, index) => (
                        <div
                          key={region.region}
                          className="flex items-center justify-between p-3 cyber-card border border-primary/20"
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                index === 0
                                  ? "bg-blue-500"
                                  : index === 1
                                    ? "bg-green-500"
                                    : index === 2
                                      ? "bg-yellow-500"
                                      : index === 3
                                        ? "bg-orange-500"
                                        : "bg-red-500"
                              }`}
                            />
                            <span className="font-medium">{region.region}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold">
                              {region.users}% users
                            </div>
                            <div
                              className={`text-xs ${
                                region.risk < 3
                                  ? "text-green-400"
                                  : region.risk < 5
                                    ? "text-yellow-400"
                                    : "text-red-400"
                              }`}
                            >
                              {region.risk}% risk
                            </div>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="moderators" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="cyber-card">
                <CardHeader>
                  <CardTitle className="cyber-text-glow">
                    MODERATOR PERFORMANCE
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockData.moderatorEfficiency.workloadDistribution.map(
                      (mod, index) => (
                        <div
                          key={mod.moderator}
                          className="flex items-center justify-between p-3 cyber-card border border-primary/20"
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                index === 0
                                  ? "bg-primary text-white"
                                  : index === 1
                                    ? "bg-secondary text-white"
                                    : index === 2
                                      ? "bg-accent text-white"
                                      : "bg-muted text-foreground"
                              }`}
                            >
                              {mod.moderator.split("_")[0][0]}
                            </div>
                            <div>
                              <div className="font-medium">
                                {mod.moderator.replace("_", " ")}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {mod.reviews} reviews
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-green-400">
                              {mod.accuracy}%
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {mod.avgTime}min avg
                            </div>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="cyber-card">
                <CardHeader>
                  <CardTitle className="cyber-text-glow">
                    BURNOUT RISK ASSESSMENT
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border border-yellow-500/20 rounded-lg">
                      <h4 className="font-medium text-yellow-400 mb-2">
                        Moderate Risk Detected
                      </h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        2 moderators showing signs of potential burnout
                      </p>
                      <div className="space-y-2">
                        {mockData.moderatorEfficiency.burnoutRisk.map(
                          (risk, index) => (
                            <div
                              key={risk.moderator}
                              className="flex items-center justify-between"
                            >
                              <span className="text-sm">
                                {risk.moderator.replace("_", " ")}
                              </span>
                              <div className="text-right">
                                <div className="text-sm font-bold text-yellow-400">
                                  {risk.riskLevel}%
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {risk.reason}
                                </div>
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 cyber-card">
                        <div className="text-xl font-bold text-primary">
                          {mockData.moderatorEfficiency.totalModerators}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Total Staff
                        </div>
                      </div>
                      <div className="text-center p-3 cyber-card">
                        <div className="text-xl font-bold text-green-400">
                          {mockData.moderatorEfficiency.activeModerators}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Currently Active
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="platforms" className="space-y-6">
            <Card className="cyber-card neural-network">
              <CardHeader>
                <CardTitle className="cyber-text-glow">
                  CROSS-PLATFORM PERFORMANCE COMPARISON
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {mockData.platformComparison.map((platform, index) => (
                    <div
                      key={platform.platform}
                      className="p-4 cyber-card border border-primary/20"
                    >
                      <h3 className="font-medium mb-4">{platform.platform}</h3>
                      <div className="grid grid-cols-5 gap-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-primary">
                            {(platform.metrics.contentVolume / 1000).toFixed(0)}
                            K
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Content Volume
                          </div>
                        </div>
                        <div className="text-center">
                          <div
                            className={`text-lg font-bold ${
                              platform.metrics.riskScore > 5
                                ? "text-red-400"
                                : platform.metrics.riskScore > 3
                                  ? "text-yellow-400"
                                  : "text-green-400"
                            }`}
                          >
                            {platform.metrics.riskScore}%
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Risk Score
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-400">
                            {platform.metrics.moderationSpeed}min
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Moderation Speed
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-400">
                            {platform.metrics.userSatisfaction}%
                          </div>
                          <div className="text-xs text-muted-foreground">
                            User Satisfaction
                          </div>
                        </div>
                        <div className="text-center">
                          <div
                            className={`text-lg font-bold ${
                              platform.metrics.revenueImpact < 1
                                ? "text-green-400"
                                : platform.metrics.revenueImpact < 2
                                  ? "text-yellow-400"
                                  : "text-red-400"
                            }`}
                          >
                            {platform.metrics.revenueImpact}%
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Revenue Impact
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="predictions" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="cyber-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Brain className="w-5 h-5 text-primary" />
                    <span>Risk Forecasting</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm">Next Week</span>
                        <Badge className="bg-yellow-600">
                          {mockData.predictiveAnalytics.riskForecast.nextWeek.riskLevel.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Confidence:{" "}
                        {
                          mockData.predictiveAnalytics.riskForecast.nextWeek
                            .confidence
                        }
                        %
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm">Next Month</span>
                        <Badge className="bg-red-600">
                          {mockData.predictiveAnalytics.riskForecast.nextMonth.riskLevel.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Confidence:{" "}
                        {
                          mockData.predictiveAnalytics.riskForecast.nextMonth
                            .confidence
                        }
                        %
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm">Seasonal Trends</span>
                        <Badge variant="outline">
                          {mockData.predictiveAnalytics.riskForecast.seasonal.riskLevel.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Confidence:{" "}
                        {
                          mockData.predictiveAnalytics.riskForecast.seasonal
                            .confidence
                        }
                        %
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="cyber-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="w-5 h-5 text-green-500" />
                    <span>Resource Planning</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Additional Moderators</span>
                      <span className="font-bold text-primary">
                        +
                        {
                          mockData.predictiveAnalytics.resourceNeeds
                            .moderatorsNeeded
                        }
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Server Capacity Increase</span>
                      <span className="font-bold text-blue-400">
                        +
                        {
                          mockData.predictiveAnalytics.resourceNeeds
                            .serverCapacity
                        }
                        %
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Budget Impact</span>
                      <span className="font-bold text-yellow-400">
                        +$
                        {
                          mockData.predictiveAnalytics.resourceNeeds
                            .budgetImpact
                        }
                        K
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="cyber-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-red-500" />
                    <span>Emerging Threats</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockData.predictiveAnalytics.trendsDetected.map(
                      (trend, index) => (
                        <div
                          key={index}
                          className="p-3 cyber-card border border-primary/20"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="font-medium text-sm">
                              {trend.trend}
                            </div>
                            <Badge
                              className={
                                trend.severity === "high"
                                  ? "bg-red-600"
                                  : "bg-yellow-600"
                              }
                            >
                              {trend.severity}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Confidence: {trend.confidence}%
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
