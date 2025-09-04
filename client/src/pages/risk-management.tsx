import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  Shield,
  TrendingUp,
  TrendingDown,
  Target,
  Activity,
  Zap,
  Eye,
} from "lucide-react";

export default function RiskManagementPage() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("24h");

  const { data: riskData, isLoading } = useQuery({
    queryKey: ["/api/risk-assessment", selectedTimeframe],
    refetchInterval: 10000,
  });

  const mockRiskData = {
    overall: {
      riskLevel: "MEDIUM",
      riskScore: 67.3,
      trend: "increasing",
      threatsDetected: 23,
      mitigatedThreats: 19,
      activeIncidents: 4,
    },
    categories: [
      {
        name: "Content Risk",
        score: 72,
        trend: "stable",
        incidents: 12,
        description: "Explicit content, violence, harassment",
        threats: [
          "High-risk uploads",
          "Coordinated harassment",
          "DMCA violations",
        ],
      },
      {
        name: "Platform Security",
        score: 45,
        trend: "improving",
        incidents: 3,
        description: "System vulnerabilities, data breaches",
        threats: [
          "SQL injection attempts",
          "DDoS attacks",
          "Authentication bypasses",
        ],
      },
      {
        name: "Compliance Risk",
        score: 89,
        trend: "deteriorating",
        incidents: 8,
        description: "Legal compliance, age verification",
        threats: [
          "Age verification failures",
          "GDPR violations",
          "Geographic restrictions",
        ],
      },
      {
        name: "Operational Risk",
        score: 34,
        trend: "stable",
        incidents: 2,
        description: "System downtime, performance issues",
        threats: ["Server overload", "Database failures", "API rate limits"],
      },
    ],
    heatMap: [
      {
        platform: "FanzMain Adult",
        category: "Content",
        risk: 85,
        incidents: 7,
      },
      {
        platform: "FanzMain Adult",
        category: "Security",
        risk: 45,
        incidents: 1,
      },
      {
        platform: "FanzMain Adult",
        category: "Compliance",
        risk: 92,
        incidents: 5,
      },
      {
        platform: "FanzLive Streaming",
        category: "Content",
        risk: 67,
        incidents: 3,
      },
      {
        platform: "FanzLive Streaming",
        category: "Security",
        risk: 34,
        incidents: 1,
      },
      {
        platform: "FanzLive Streaming",
        category: "Compliance",
        risk: 78,
        incidents: 2,
      },
      {
        platform: "FanzSocial Community",
        category: "Content",
        risk: 56,
        incidents: 2,
      },
      {
        platform: "FanzSocial Community",
        category: "Security",
        risk: 67,
        incidents: 1,
      },
      {
        platform: "FanzSocial Community",
        category: "Compliance",
        risk: 89,
        incidents: 1,
      },
    ],
    mitigations: [
      {
        id: "mit-001",
        threat: "High-risk content uploads",
        status: "active",
        effectiveness: 87,
        implemented: "2024-01-15",
        actions: [
          "Enhanced AI screening",
          "Mandatory manual review",
          "User education campaign",
        ],
      },
      {
        id: "mit-002",
        threat: "DDoS attacks",
        status: "monitoring",
        effectiveness: 94,
        implemented: "2024-01-10",
        actions: ["CDN protection", "Rate limiting", "Geographic filtering"],
      },
      {
        id: "mit-003",
        threat: "Age verification failures",
        status: "critical",
        effectiveness: 67,
        implemented: "2024-01-20",
        actions: [
          "ID verification system",
          "Third-party validation",
          "Regular audits",
        ],
      },
    ],
  };

  const getRiskColor = (score: number) => {
    if (score >= 80) return "text-red-500";
    if (score >= 60) return "text-yellow-500";
    if (score >= 40) return "text-orange-500";
    return "text-green-500";
  };

  const getRiskLevel = (score: number) => {
    if (score >= 80) return { level: "CRITICAL", color: "bg-red-600" };
    if (score >= 60) return { level: "HIGH", color: "bg-yellow-600" };
    if (score >= 40) return { level: "MEDIUM", color: "bg-orange-600" };
    return { level: "LOW", color: "bg-green-600" };
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "increasing":
        return <TrendingUp className="w-4 h-4 text-red-500" />;
      case "decreasing":
        return <TrendingDown className="w-4 h-4 text-green-500" />;
      case "improving":
        return <TrendingDown className="w-4 h-4 text-green-500" />;
      case "deteriorating":
        return <TrendingUp className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-blue-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen cyber-bg flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 cyber-pulse text-primary" />
          <p className="cyber-text-glow">Loading Risk Management Center...</p>
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
              Risk Management Center
            </h1>
            <p className="text-muted-foreground">
              Advanced Threat Assessment & Mitigation
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge
              className={getRiskLevel(mockRiskData.overall.riskScore).color}
            >
              <AlertTriangle className="w-3 h-3 mr-1" />
              {getRiskLevel(mockRiskData.overall.riskScore).level} RISK
            </Badge>
            <Button variant="outline" className="cyber-border">
              <Eye className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </div>

        {/* Overall Risk Dashboard */}
        <Card className="cyber-card neural-network">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-6 h-6 text-primary cyber-pulse" />
              <span className="cyber-text-glow">THREAT LANDSCAPE OVERVIEW</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold cyber-text-glow mb-2">
                  {mockRiskData.overall.riskScore}
                </div>
                <div className="text-sm text-muted-foreground">Risk Score</div>
                <Progress
                  value={mockRiskData.overall.riskScore}
                  className="mt-2"
                />
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400 cyber-text-glow mb-2">
                  {mockRiskData.overall.threatsDetected}
                </div>
                <div className="text-sm text-muted-foreground">
                  Threats Detected
                </div>
                <div className="flex items-center justify-center mt-1">
                  {getTrendIcon(mockRiskData.overall.trend)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400 cyber-text-glow mb-2">
                  {mockRiskData.overall.mitigatedThreats}
                </div>
                <div className="text-sm text-muted-foreground">Mitigated</div>
                <div className="text-xs text-green-400 mt-1">
                  {Math.round(
                    (mockRiskData.overall.mitigatedThreats /
                      mockRiskData.overall.threatsDetected) *
                      100,
                  )}
                  % Success
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400 cyber-text-glow mb-2">
                  {mockRiskData.overall.activeIncidents}
                </div>
                <div className="text-sm text-muted-foreground">
                  Active Incidents
                </div>
                <div className="text-xs text-yellow-400 mt-1">
                  Requires Action
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400 cyber-text-glow mb-2">
                  94.2%
                </div>
                <div className="text-sm text-muted-foreground">
                  System Uptime
                </div>
                <div className="text-xs text-blue-400 mt-1">Excellent</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400 cyber-text-glow mb-2">
                  2.3m
                </div>
                <div className="text-sm text-muted-foreground">
                  Response Time
                </div>
                <div className="text-xs text-purple-400 mt-1">
                  Avg Detection
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Risk Categories Analysis */}
        <Tabs defaultValue="categories" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 cyber-card">
            <TabsTrigger value="categories">Risk Categories</TabsTrigger>
            <TabsTrigger value="heatmap">Platform Heatmap</TabsTrigger>
            <TabsTrigger value="mitigations">Active Mitigations</TabsTrigger>
            <TabsTrigger value="predictions">AI Predictions</TabsTrigger>
          </TabsList>

          <TabsContent value="categories" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mockRiskData.categories.map((category, index) => (
                <Card key={category.name} className="cyber-card">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            index === 0
                              ? "bg-red-500"
                              : index === 1
                                ? "bg-blue-500"
                                : index === 2
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                          } cyber-pulse`}
                        />
                        <span>{category.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`font-bold ${getRiskColor(category.score)}`}
                        >
                          {category.score}
                        </span>
                        {getTrendIcon(category.trend)}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Progress value={category.score} className="mb-2" />
                        <p className="text-sm text-muted-foreground">
                          {category.description}
                        </p>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">
                          Active Incidents: {category.incidents}
                        </h4>
                        <div className="space-y-1">
                          {category.threats.map((threat, idx) => (
                            <div
                              key={idx}
                              className="flex items-center space-x-2 text-sm"
                            >
                              <Target className="w-3 h-3 text-red-400" />
                              <span>{threat}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="heatmap" className="space-y-6">
            <Card className="cyber-card neural-network">
              <CardHeader>
                <CardTitle className="cyber-text-glow">
                  PLATFORM RISK HEATMAP
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    "FanzMain Adult",
                    "FanzLive Streaming",
                    "FanzSocial Community",
                  ].map((platform) => (
                    <div
                      key={platform}
                      className="p-4 cyber-card border border-primary/20"
                    >
                      <h3 className="font-medium mb-4">{platform}</h3>
                      <div className="grid grid-cols-3 gap-4">
                        {mockRiskData.heatMap
                          .filter((item) => item.platform === platform)
                          .map((item, idx) => (
                            <div
                              key={idx}
                              className="text-center p-3 rounded-lg"
                              style={{
                                backgroundColor: `rgba(${item.risk > 70 ? "239, 68, 68" : item.risk > 50 ? "245, 158, 11" : "34, 197, 94"}, 0.1)`,
                                border: `1px solid rgba(${item.risk > 70 ? "239, 68, 68" : item.risk > 50 ? "245, 158, 11" : "34, 197, 94"}, 0.3)`,
                              }}
                            >
                              <div className="text-lg font-bold">
                                {item.risk}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {item.category}
                              </div>
                              <div className="text-xs">
                                {item.incidents}{" "}
                                {item.incidents === 1
                                  ? "incident"
                                  : "incidents"}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mitigations" className="space-y-6">
            <Card className="cyber-card">
              <CardHeader>
                <CardTitle className="cyber-text-glow">
                  ACTIVE THREAT MITIGATIONS
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockRiskData.mitigations.map((mitigation) => (
                    <div
                      key={mitigation.id}
                      className="p-4 cyber-card border border-primary/20"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{mitigation.threat}</h4>
                          <p className="text-sm text-muted-foreground">
                            Implemented:{" "}
                            {new Date(
                              mitigation.implemented,
                            ).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge
                            className={
                              mitigation.status === "critical"
                                ? "bg-red-600"
                                : mitigation.status === "active"
                                  ? "bg-green-600"
                                  : "bg-yellow-600"
                            }
                          >
                            {mitigation.status.toUpperCase()}
                          </Badge>
                          <div className="text-sm font-bold mt-1">
                            {mitigation.effectiveness}% Effective
                          </div>
                        </div>
                      </div>
                      <Progress
                        value={mitigation.effectiveness}
                        className="mb-3"
                      />
                      <div className="space-y-1">
                        <h5 className="text-xs font-medium">
                          Mitigation Actions:
                        </h5>
                        {mitigation.actions.map((action, idx) => (
                          <div
                            key={idx}
                            className="flex items-center space-x-2 text-sm"
                          >
                            <Zap className="w-3 h-3 text-primary" />
                            <span>{action}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="predictions" className="space-y-6">
            <Card className="cyber-card neural-network">
              <CardHeader>
                <CardTitle className="cyber-text-glow">
                  AI RISK PREDICTIONS
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 cyber-card border border-yellow-500/20">
                      <h4 className="font-medium text-yellow-400 mb-2">
                        24 Hour Forecast
                      </h4>
                      <div className="text-2xl font-bold mb-1">Medium Risk</div>
                      <p className="text-sm text-muted-foreground">
                        Expected spike in content violations during peak hours
                        (8PM-12AM)
                      </p>
                      <div className="mt-3 text-xs">
                        <div>Confidence: 87%</div>
                        <div>Impact: Moderate</div>
                      </div>
                    </div>

                    <div className="p-4 cyber-card border border-red-500/20">
                      <h4 className="font-medium text-red-400 mb-2">
                        Week Ahead
                      </h4>
                      <div className="text-2xl font-bold mb-1">High Risk</div>
                      <p className="text-sm text-muted-foreground">
                        Potential coordinated attack campaign detected across
                        multiple platforms
                      </p>
                      <div className="mt-3 text-xs">
                        <div>Confidence: 73%</div>
                        <div>Impact: High</div>
                      </div>
                    </div>

                    <div className="p-4 cyber-card border border-green-500/20">
                      <h4 className="font-medium text-green-400 mb-2">
                        System Health
                      </h4>
                      <div className="text-2xl font-bold mb-1">Stable</div>
                      <p className="text-sm text-muted-foreground">
                        All mitigation systems operating within normal
                        parameters
                      </p>
                      <div className="mt-3 text-xs">
                        <div>Confidence: 94%</div>
                        <div>Impact: Low</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Recommended Actions:</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3 p-3 cyber-card border border-primary/20">
                        <AlertTriangle className="w-5 h-5 text-yellow-500" />
                        <div>
                          <div className="font-medium">
                            Increase monitoring during peak hours
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Deploy additional AI resources for content analysis
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 cyber-card border border-primary/20">
                        <Shield className="w-5 h-5 text-blue-500" />
                        <div>
                          <div className="font-medium">
                            Strengthen platform defenses
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Activate enhanced security protocols for potential
                            coordinated attacks
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 cyber-card border border-primary/20">
                        <Target className="w-5 h-5 text-green-500" />
                        <div>
                          <div className="font-medium">
                            Update detection algorithms
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Implement new pattern recognition for emerging
                            threat vectors
                          </div>
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
    </div>
  );
}
