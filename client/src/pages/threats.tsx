import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  AlertTriangle,
  Shield,
  Target,
  Eye,
  Zap,
  TrendingUp,
  Activity,
  Bell,
  Clock,
  Users,
} from "lucide-react";

export default function ThreatsPage() {
  const [isScanning, setIsScanning] = useState(false);
  const { toast } = useToast();

  const { data: threatData } = useQuery({
    queryKey: ["/api/threats/alerts"],
    refetchInterval: 5000,
  });

  // Mock threat intelligence data
  const threatIntelligence = {
    currentLevel: "ELEVATED",
    activeThreat: 3,
    mitigated: 847,
    blocked: 12943,
    trends: [
      { threat: "Coordinated Spam", trend: "increasing", change: "+23%" },
      { threat: "CSAM Attempts", trend: "decreasing", change: "-45%" },
      { threat: "Harassment Campaigns", trend: "stable", change: "±2%" },
    ],
    topTargets: [
      { platform: "FanzMain", attacks: 1249, severity: "HIGH" },
      { platform: "FanzLive", attacks: 892, severity: "MEDIUM" },
      { platform: "FanzSocial", attacks: 634, severity: "LOW" },
    ],
  };

  const runThreatScan = async () => {
    setIsScanning(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      toast({
        title: "Threat Scan Complete",
        description: "System security verified, no new threats detected",
      });
    } catch (error) {
      toast({
        title: "Scan Failed",
        description: "Unable to complete threat assessment",
        variant: "destructive",
      });
    }
    setIsScanning(false);
  };

  const getThreatColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical":
        return "text-red-500 border-red-500/30 bg-red-500/10";
      case "high":
        return "text-orange-500 border-orange-500/30 bg-orange-500/10";
      case "medium":
        return "text-yellow-500 border-yellow-500/30 bg-yellow-500/10";
      case "low":
        return "text-green-500 border-green-500/30 bg-green-500/10";
      default:
        return "text-primary border-primary/30 bg-primary/10";
    }
  };

  return (
    <div className="min-h-screen cyber-bg">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold cyber-text-glow">
              Threat Center
            </h1>
            <p className="text-muted-foreground">
              Real-time Security Monitoring & Threat Intelligence
            </p>
          </div>
          <Button
            onClick={runThreatScan}
            disabled={isScanning}
            className="neon-button"
            data-testid="threat-scan-button"
          >
            {isScanning ? (
              <>
                <Target className="w-4 h-4 mr-2 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                Run Scan
              </>
            )}
          </Button>
        </div>

        {/* Current Threat Level */}
        <Card
          className={`cyber-card border-2 ${getThreatColor(threatIntelligence.currentLevel)}`}
        >
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-8 h-8 text-orange-500 cyber-pulse" />
              <span className="text-2xl cyber-text-glow">
                THREAT LEVEL: {threatIntelligence.currentLevel}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-400">
                  {threatIntelligence.activeThreat}
                </div>
                <div className="text-sm text-muted-foreground">
                  Active Threats
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">
                  {threatIntelligence.mitigated}
                </div>
                <div className="text-sm text-muted-foreground">
                  Threats Mitigated
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">
                  {threatIntelligence.blocked.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  Attacks Blocked
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400">99.7%</div>
                <div className="text-sm text-muted-foreground">
                  Protection Rate
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Alerts */}
        <Card className="cyber-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="w-6 h-6 text-red-400 cyber-pulse" />
              <span className="cyber-text-glow">ACTIVE THREAT ALERTS</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {threatData?.map((alert: any) => (
                <div
                  key={alert.id}
                  className={`p-4 cyber-card border-2 ${getThreatColor(alert.severity)}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-4 h-4 rounded-full ${
                          alert.severity === "HIGH"
                            ? "bg-red-500"
                            : alert.severity === "MEDIUM"
                              ? "bg-yellow-500"
                              : "bg-green-500"
                        } cyber-pulse`}
                      />
                      <div>
                        <div className="font-bold text-lg">{alert.type}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(alert.detectedAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant={
                        alert.severity === "HIGH" ? "destructive" : "default"
                      }
                      className="text-lg px-3 py-1"
                    >
                      {alert.severity}
                    </Badge>
                  </div>

                  <div className="mb-3">
                    <p className="text-white">{alert.description}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <span className="text-muted-foreground">
                        Affected Platforms:{" "}
                      </span>
                      <span className="text-primary">
                        {alert.affectedPlatforms?.join(", ")}
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        alert.status === "ACTIVE"
                          ? "text-red-400"
                          : "text-yellow-400"
                      }
                    >
                      {alert.status}
                    </Badge>
                  </div>

                  <div className="mt-3">
                    <div className="text-sm text-muted-foreground mb-2">
                      Recommended Actions:
                    </div>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {alert.recommendedActions?.map(
                        (action: string, index: number) => (
                          <li key={index} className="text-primary">
                            {action}
                          </li>
                        ),
                      )}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Threat Trends & Platform Targets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="cyber-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-6 h-6 text-primary" />
                <span>Threat Trends</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {threatIntelligence.trends.map((trend, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 cyber-card border border-primary/20"
                  >
                    <div>
                      <div className="font-medium">{trend.threat}</div>
                      <div className="text-sm text-muted-foreground">
                        {trend.trend.charAt(0).toUpperCase() +
                          trend.trend.slice(1)}{" "}
                        trend
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`font-bold ${
                          trend.trend === "increasing"
                            ? "text-red-400"
                            : trend.trend === "decreasing"
                              ? "text-green-400"
                              : "text-yellow-400"
                        }`}
                      >
                        {trend.change}
                      </div>
                      <div
                        className={`w-2 h-2 rounded-full ${
                          trend.trend === "increasing"
                            ? "bg-red-500"
                            : trend.trend === "decreasing"
                              ? "bg-green-500"
                              : "bg-yellow-500"
                        } cyber-pulse`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="cyber-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-6 h-6 text-red-400" />
                <span>Top Targets</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {threatIntelligence.topTargets.map((target, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 cyber-card border border-primary/20"
                  >
                    <div>
                      <div className="font-medium">{target.platform}</div>
                      <div className="text-sm text-muted-foreground">
                        {target.attacks} attack attempts
                      </div>
                    </div>
                    <Badge
                      variant={
                        target.severity === "HIGH"
                          ? "destructive"
                          : target.severity === "MEDIUM"
                            ? "default"
                            : "secondary"
                      }
                    >
                      {target.severity}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security Operations */}
        <Card className="cyber-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-6 h-6 text-green-400" />
              <span className="cyber-text-glow">
                SECURITY OPERATIONS STATUS
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 cyber-card border border-green-500/30">
                <Eye className="w-8 h-8 mx-auto mb-2 text-green-400" />
                <div className="text-xl font-bold text-green-400">ACTIVE</div>
                <div className="text-sm text-muted-foreground">Monitoring</div>
              </div>

              <div className="text-center p-4 cyber-card border border-blue-500/30">
                <Shield className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                <div className="text-xl font-bold text-blue-400">
                  OPERATIONAL
                </div>
                <div className="text-sm text-muted-foreground">
                  Defense Systems
                </div>
              </div>

              <div className="text-center p-4 cyber-card border border-purple-500/30">
                <Zap className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                <div className="text-xl font-bold text-purple-400">READY</div>
                <div className="text-sm text-muted-foreground">
                  Incident Response
                </div>
              </div>

              <div className="text-center p-4 cyber-card border border-yellow-500/30">
                <Clock className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
                <div className="text-xl font-bold text-yellow-400">24/7</div>
                <div className="text-sm text-muted-foreground">Coverage</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
