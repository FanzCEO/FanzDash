import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  Shield,
  Target,
  Zap,
  Activity,
  BarChart3,
} from "lucide-react";

export default function PredictiveAnalyticsPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const { data: riskCorrelations, isLoading: correlationsLoading } = useQuery({
    queryKey: ["/api/risk/correlation"],
    refetchInterval: 30000,
  });

  const { data: realtimeRisk } = useQuery({
    queryKey: ["/api/risk/realtime"],
    refetchInterval: 5000,
  });

  const { data: threatAlerts } = useQuery({
    queryKey: ["/api/threats/alerts"],
    refetchInterval: 10000,
  });

  const runPredictiveAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      await apiRequest("/api/risk/predict", "POST", {
        uploader: "test-user",
        uploadTime: new Date().toISOString(),
        contentType: "image",
        fileSize: 2048576,
        previousViolations: 0,
        accountAge: 90,
      });
      toast({
        title: "Predictive Analysis Complete",
        description: "Risk modeling updated with latest patterns",
      });
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Unable to complete predictive analysis",
        variant: "destructive",
      });
    }
    setTimeout(() => setIsAnalyzing(false), 3000);
  };

  if (correlationsLoading) {
    return (
      <div className="min-h-screen cyber-bg flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-16 h-16 mx-auto mb-4 cyber-pulse text-primary" />
          <p className="cyber-text-glow">Loading Predictive Intelligence...</p>
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
              Predictive Analytics Engine
            </h1>
            <p className="text-muted-foreground">
              AI-Powered Threat Intelligence & Risk Forecasting
            </p>
          </div>
          <Button
            onClick={runPredictiveAnalysis}
            disabled={isAnalyzing}
            className="neon-button"
            data-testid="run-predictive-button"
          >
            {isAnalyzing ? (
              <>
                <Zap className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2" />
                Run Analysis
              </>
            )}
          </Button>
        </div>

        {/* Real-time Threat Level */}
        <Card className="cyber-card bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-6 h-6 text-red-400" />
              <span className="cyber-text-glow">CURRENT THREAT LEVEL</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-4xl font-bold text-red-400 cyber-text-glow">
                  {realtimeRisk?.currentThreatLevel || "MEDIUM"}
                </div>
                <div className="text-sm text-muted-foreground">
                  Last Updated: {new Date().toLocaleTimeString()}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">
                  {realtimeRisk?.activeModerations || 42}
                </div>
                <div className="text-xs text-muted-foreground">
                  Active Moderations
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Threat Alerts */}
        <Card className="cyber-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-6 h-6 text-yellow-400 cyber-pulse" />
              <span className="cyber-text-glow">ACTIVE THREAT ALERTS</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {threatAlerts?.map((alert: any) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between p-4 cyber-card border border-primary/20"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        alert.severity === "HIGH"
                          ? "bg-red-500"
                          : alert.severity === "MEDIUM"
                            ? "bg-yellow-500"
                            : "bg-green-500"
                      } cyber-pulse`}
                    />
                    <div>
                      <div className="font-medium">{alert.type}</div>
                      <div className="text-sm text-muted-foreground">
                        {alert.description}
                      </div>
                      <div className="text-xs text-primary">
                        Platforms: {alert.affectedPlatforms?.join(", ")}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={
                        alert.severity === "HIGH" ? "destructive" : "default"
                      }
                    >
                      {alert.severity}
                    </Badge>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(alert.detectedAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Risk Distribution & Platform Health */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="cyber-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-6 h-6 text-primary" />
                <span>Risk Distribution</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {realtimeRisk?.riskDistribution &&
                  Object.entries(realtimeRisk.riskDistribution).map(
                    ([level, percentage]: [string, any]) => (
                      <div key={level} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span
                            className={`capitalize ${
                              level === "critical"
                                ? "text-red-400"
                                : level === "high"
                                  ? "text-orange-400"
                                  : level === "medium"
                                    ? "text-yellow-400"
                                    : "text-green-400"
                            }`}
                          >
                            {level} Risk
                          </span>
                          <span className="font-bold">{percentage}%</span>
                        </div>
                        <Progress
                          value={percentage}
                          className={`h-2 ${
                            level === "critical"
                              ? "bg-red-500/20"
                              : level === "high"
                                ? "bg-orange-500/20"
                                : level === "medium"
                                  ? "bg-yellow-500/20"
                                  : "bg-green-500/20"
                          }`}
                        />
                      </div>
                    ),
                  )}
              </div>
            </CardContent>
          </Card>

          <Card className="cyber-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-6 h-6 text-primary" />
                <span>Platform Health</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {realtimeRisk?.platformStats?.map((platform: any) => (
                  <div
                    key={platform.name}
                    className="flex items-center justify-between p-3 cyber-card border border-primary/20"
                  >
                    <div>
                      <div className="font-medium">{platform.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Risk: {(platform.risk * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          platform.status === "healthy"
                            ? "bg-green-500"
                            : platform.status === "elevated"
                              ? "bg-yellow-500"
                              : "bg-red-500"
                        } cyber-pulse`}
                      />
                      <Badge
                        variant={
                          platform.status === "healthy"
                            ? "default"
                            : "secondary"
                        }
                        className="text-xs"
                      >
                        {platform.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cross-Platform Risk Correlations */}
        <Card className="cyber-card neural-network">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-6 h-6 text-primary cyber-pulse" />
              <span className="cyber-text-glow">
                CROSS-PLATFORM RISK CORRELATIONS
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {riskCorrelations?.correlations?.map(
                (correlation: any, index: number) => (
                  <div
                    key={index}
                    className="p-4 cyber-card border border-primary/20"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">
                        {correlation.platforms?.join(" ↔ ")}
                      </div>
                      <Badge
                        variant={
                          correlation.significance === "high"
                            ? "destructive"
                            : "default"
                        }
                      >
                        {correlation.significance} significance
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      {correlation.pattern}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-muted-foreground">
                        Correlation:
                      </span>
                      <Progress
                        value={correlation.correlation * 100}
                        className="flex-1 h-1"
                      />
                      <span className="text-xs font-bold text-primary">
                        {(correlation.correlation * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ),
              )}
            </div>
          </CardContent>
        </Card>

        {/* Model Performance Metrics */}
        <Card className="cyber-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-6 h-6 text-green-400" />
              <span>Model Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {realtimeRisk?.modelPerformance &&
                Object.entries(realtimeRisk.modelPerformance).map(
                  ([metric, value]: [string, any]) => (
                    <div key={metric} className="text-center p-4 cyber-card">
                      <div className="text-2xl font-bold text-primary">
                        {typeof value === "string" ? value : `${value}%`}
                      </div>
                      <div className="text-sm text-muted-foreground capitalize">
                        {metric.replace(/([A-Z])/g, " $1").trim()}
                      </div>
                    </div>
                  ),
                )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
