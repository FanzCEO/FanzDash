import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  Shield,
  AlertTriangle,
} from "lucide-react";

export default function AnalyticsPage() {
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ["/api/analytics"],
    refetchInterval: 30000,
  });

  const mockAnalytics = {
    overview: {
      totalContent: 156847,
      dailyGrowth: 12.3,
      weeklyBlocked: 234,
      accuracyRate: 96.8,
      avgProcessingTime: 1.2,
    },
    platforms: [
      { name: "FanzMain Adult", content: 89456, blocked: 156, accuracy: 97.2 },
      {
        name: "FanzLive Streaming",
        content: 34521,
        blocked: 45,
        accuracy: 96.1,
      },
      {
        name: "FanzSocial Community",
        content: 32870,
        blocked: 33,
        accuracy: 97.1,
      },
    ],
    contentTypes: [
      { type: "Images", count: 89234, percentage: 56.9, blocked: 145 },
      { type: "Videos", count: 34567, percentage: 22.0, blocked: 67 },
      { type: "Text", count: 28945, percentage: 18.5, blocked: 19 },
      { type: "Live Streams", count: 4101, percentage: 2.6, blocked: 3 },
    ],
    timeData: [
      { hour: "00:00", content: 234, blocked: 12 },
      { hour: "04:00", content: 156, blocked: 8 },
      { hour: "08:00", content: 567, blocked: 23 },
      { hour: "12:00", content: 892, blocked: 34 },
      { hour: "16:00", content: 1234, blocked: 45 },
      { hour: "20:00", content: 1567, blocked: 67 },
    ],
    moderators: [
      {
        name: "Admin Sarah",
        reviewed: 1247,
        approved: 1156,
        blocked: 91,
        accuracy: 98.2,
      },
      {
        name: "Mod Alex",
        reviewed: 967,
        approved: 895,
        blocked: 72,
        accuracy: 97.8,
      },
      {
        name: "Mod Jordan",
        reviewed: 834,
        approved: 789,
        blocked: 45,
        accuracy: 96.9,
      },
    ],
  };

  if (isLoading) {
    return (
      <div className="min-h-screen cyber-bg flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="w-16 h-16 mx-auto mb-4 cyber-pulse text-primary" />
          <p className="cyber-text-glow">Loading Analytics Dashboard...</p>
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
              Analytics Dashboard
            </h1>
            <p className="text-muted-foreground">
              Performance Metrics & Insights
            </p>
          </div>
          <Badge className="bg-green-600">
            <TrendingUp className="w-3 h-3 mr-1" />
            System Optimal
          </Badge>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="cyber-card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary cyber-text-glow">
                {mockAnalytics.overview.totalContent.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Total Content</div>
              <div className="flex items-center justify-center mt-1">
                <TrendingUp className="w-3 h-3 text-green-400 mr-1" />
                <span className="text-xs text-green-400">
                  +{mockAnalytics.overview.dailyGrowth}%
                </span>
              </div>
            </CardContent>
          </Card>
          <Card className="cyber-card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-400 cyber-text-glow">
                {mockAnalytics.overview.weeklyBlocked}
              </div>
              <div className="text-sm text-muted-foreground">
                Blocked This Week
              </div>
              <div className="flex items-center justify-center mt-1">
                <Shield className="w-3 h-3 text-blue-400 mr-1" />
                <span className="text-xs text-blue-400">0.15%</span>
              </div>
            </CardContent>
          </Card>
          <Card className="cyber-card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-400 cyber-text-glow">
                {mockAnalytics.overview.accuracyRate}%
              </div>
              <div className="text-sm text-muted-foreground">AI Accuracy</div>
              <div className="flex items-center justify-center mt-1">
                <TrendingUp className="w-3 h-3 text-green-400 mr-1" />
                <span className="text-xs text-green-400">+0.3%</span>
              </div>
            </CardContent>
          </Card>
          <Card className="cyber-card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-accent cyber-text-glow">
                {mockAnalytics.overview.avgProcessingTime}s
              </div>
              <div className="text-sm text-muted-foreground">
                Avg Processing
              </div>
              <div className="flex items-center justify-center mt-1">
                <Clock className="w-3 h-3 text-blue-400 mr-1" />
                <span className="text-xs text-blue-400">Optimal</span>
              </div>
            </CardContent>
          </Card>
          <Card className="cyber-card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-400 cyber-text-glow">
                99.9%
              </div>
              <div className="text-sm text-muted-foreground">System Uptime</div>
              <div className="flex items-center justify-center mt-1">
                <Shield className="w-3 h-3 text-green-400 mr-1" />
                <span className="text-xs text-green-400">Excellent</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Platform Performance */}
        <Card className="cyber-card neural-network">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-6 h-6 text-primary cyber-pulse" />
              <span className="cyber-text-glow">PLATFORM PERFORMANCE</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockAnalytics.platforms.map((platform, index) => (
                <div
                  key={platform.name}
                  className="flex items-center justify-between p-4 cyber-card border border-primary/20"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-4 h-4 rounded-full ${
                        index === 0
                          ? "bg-primary"
                          : index === 1
                            ? "bg-secondary"
                            : "bg-accent"
                      } cyber-pulse`}
                    />
                    <div>
                      <div className="font-medium">{platform.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {platform.content.toLocaleString()} items processed
                      </div>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="flex items-center space-x-4">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Blocked: </span>
                        <span className="font-bold text-red-400">
                          {platform.blocked}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">
                          Accuracy:{" "}
                        </span>
                        <span className="font-bold text-green-400">
                          {platform.accuracy}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Content Type Distribution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="cyber-card">
            <CardHeader>
              <CardTitle className="text-lg">
                Content Type Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockAnalytics.contentTypes.map((type) => (
                  <div
                    key={type.type}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-primary rounded-full" />
                      <span className="font-medium">{type.type}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">
                        {type.count.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {type.percentage}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="cyber-card">
            <CardHeader>
              <CardTitle className="text-lg">Moderator Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockAnalytics.moderators.map((mod, index) => (
                  <div
                    key={mod.name}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0
                            ? "bg-primary text-white"
                            : index === 1
                              ? "bg-secondary text-white"
                              : "bg-accent text-white"
                        }`}
                      >
                        {mod.name.split(" ")[1][0]}
                      </div>
                      <div>
                        <div className="font-medium">{mod.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {mod.reviewed} reviewed
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-400">
                        {mod.accuracy}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        accuracy
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Hourly Activity */}
        <Card className="cyber-card neural-network">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-6 h-6 text-primary cyber-pulse" />
              <span className="cyber-text-glow">24-HOUR ACTIVITY PATTERN</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-6 gap-4">
              {mockAnalytics.timeData.map((time) => (
                <div
                  key={time.hour}
                  className="text-center p-4 cyber-card border border-primary/20"
                >
                  <div className="text-xs text-muted-foreground mb-2">
                    {time.hour}
                  </div>
                  <div className="text-lg font-bold text-primary">
                    {time.content}
                  </div>
                  <div className="text-xs text-red-400">
                    {time.blocked} blocked
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Threat Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="cyber-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                <span>Risk Categories</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Explicit Content</span>
                  <span className="font-bold text-red-400">67%</span>
                </div>
                <div className="flex justify-between">
                  <span>Harassment</span>
                  <span className="font-bold text-yellow-400">18%</span>
                </div>
                <div className="flex justify-between">
                  <span>Spam</span>
                  <span className="font-bold text-blue-400">10%</span>
                </div>
                <div className="flex justify-between">
                  <span>Copyright</span>
                  <span className="font-bold text-purple-400">5%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cyber-card">
            <CardHeader>
              <CardTitle className="text-lg">Detection Methods</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>AI Detection</span>
                  <span className="font-bold text-primary">87.3%</span>
                </div>
                <div className="flex justify-between">
                  <span>User Reports</span>
                  <span className="font-bold text-secondary">8.9%</span>
                </div>
                <div className="flex justify-between">
                  <span>Manual Review</span>
                  <span className="font-bold text-accent">3.8%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cyber-card">
            <CardHeader>
              <CardTitle className="text-lg">Response Times</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Auto-Block</span>
                  <span className="font-bold text-green-400">0.3s</span>
                </div>
                <div className="flex justify-between">
                  <span>AI Analysis</span>
                  <span className="font-bold text-primary">1.2s</span>
                </div>
                <div className="flex justify-between">
                  <span>Manual Review</span>
                  <span className="font-bold text-yellow-400">2.3m</span>
                </div>
                <div className="flex justify-between">
                  <span>Appeal Process</span>
                  <span className="font-bold text-blue-400">4.7h</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
