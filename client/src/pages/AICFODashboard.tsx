import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Brain,
  Zap,
  Target,
  BarChart3,
  PieChart,
  Activity,
  Clock,
  Users,
  Shield,
  Cpu,
  Bot,
  Eye,
  Settings,
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface CFOBrief {
  id: string;
  period: "daily" | "weekly" | "monthly" | "quarterly";
  generatedAt: Date;
  executiveSummary: string;
  keyTakeaways: string[];
  performanceHighlights: {
    revenue: { value: number; change: number; insight: string };
    profitMargin: { value: number; change: number; insight: string };
    customerAcquisition: { value: number; change: number; insight: string };
    churnRate: { value: number; change: number; insight: string };
  };
  criticalAlerts: any[];
  revenueAnalytics: any;
  profitabilityAnalysis: any;
  growthMetrics: any;
  riskAssessment: any;
  marketOpportunities: any[];
}

interface AIInsight {
  id: string;
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  impact: string;
  recommendation: string;
  confidence: number;
  detectedAt: Date;
  affectedMetrics: string[];
  estimatedImpact: {
    revenue: number;
    timeframe: string;
  };
}

export default function AICFODashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedPeriod, setSelectedPeriod] = useState("weekly");

  // AI CFO Data
  const { data: financialSummary } = useQuery({
    queryKey: ["/api/ai-cfo/summary"],
    refetchInterval: 30000,
  });

  const { data: cfoBrief } = useQuery({
    queryKey: ["/api/ai-cfo/brief/latest", selectedPeriod],
    refetchInterval: 60000,
  });

  const { data: insights } = useQuery({
    queryKey: ["/api/ai-cfo/insights"],
    refetchInterval: 30000,
  });

  // AI Analytics Data
  const { data: analyticsSummary } = useQuery({
    queryKey: ["/api/ai-analytics/summary"],
    refetchInterval: 45000,
  });

  const { data: marketIntelligence } = useQuery({
    queryKey: ["/api/ai-analytics/market-intelligence"],
    refetchInterval: 300000, // 5 minutes
  });

  // Creator Automation Data
  const { data: automationMetrics } = useQuery({
    queryKey: ["/api/creator-automation/metrics"],
    refetchInterval: 60000,
  });

  // AI Moderation Data
  const { data: moderationMetrics } = useQuery({
    queryKey: ["/api/ai-moderation/metrics"],
    refetchInterval: 30000,
  });

  // Ecosystem Health Data
  const { data: ecosystemHealth } = useQuery({
    queryKey: ["/api/ecosystem/summary"],
    refetchInterval: 15000,
  });

  // Generate CFO Brief Mutation
  const generateBriefMutation = useMutation({
    mutationFn: async (period: string) => {
      return apiRequest("/api/ai-cfo/brief", "POST", { period });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-cfo/brief/latest"] });
    },
  });

  const summary = financialSummary || {
    revenue: { total: 0, recurring: 0, oneTime: 0, growthRate: 0 },
    profitability: {
      gross: 0,
      operating: 0,
      net: 0,
      margins: { gross: 0, operating: 0, net: 0 },
    },
    cashFlow: { operating: 0, investing: 0, financing: 0, net: 0 },
    activeInsights: 0,
    criticalAlerts: 0,
    lastUpdated: new Date(),
  };

  const brief = cfoBrief?.brief as CFOBrief;
  const aiInsights = (insights?.insights as AIInsight[]) || [];
  const criticalInsights = aiInsights.filter(
    (i) => i.severity === "high" || i.severity === "critical",
  );

  const analytics = analyticsSummary || {
    models: { total: 0, active: 0, averageAccuracy: 0 },
    predictions: { revenue: 0, content: 0, churn: 0 },
  };
  const intelligence = marketIntelligence?.intelligence;
  const automation = automationMetrics || {
    totalWorkflows: 0,
    activeWorkflows: 0,
    revenueGenerated: 0,
    timeSaved: 0,
  };
  const moderation = moderationMetrics || {
    totalScanned: 0,
    approvalRate: 0,
    averageProcessingTime: 0,
  };
  const ecosystem = ecosystemHealth || {
    systemHealth: { overall: "unknown", healthyServices: 0, services: 0 },
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
    return `$${amount}`;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-red-400 border-red-400";
      case "high":
        return "text-orange-400 border-orange-400";
      case "medium":
        return "text-yellow-400 border-yellow-400";
      case "low":
        return "text-green-400 border-green-400";
      default:
        return "text-gray-400 border-gray-400";
    }
  };

  const getSystemHealthColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-400";
      case "degraded":
        return "text-yellow-400";
      case "unhealthy":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div
      className="p-6 space-y-6 bg-black min-h-screen"
      data-testid="ai-cfo-dashboard"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            AI CFO & Automated Ecosystem
          </h1>
          <p className="text-cyan-400 mt-2">
            FanzFinance OS - Comprehensive AI-powered financial intelligence and
            automation
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => generateBriefMutation.mutate(selectedPeriod)}
            disabled={generateBriefMutation.isPending}
            className="bg-cyan-600 hover:bg-cyan-700"
          >
            <Brain className="h-4 w-4 mr-2" />
            {generateBriefMutation.isPending
              ? "Generating..."
              : "Generate AI Brief"}
          </Button>
          <Badge variant="outline" className="border-green-400 text-green-400">
            Autonomous Operation
          </Badge>
          <Badge
            variant="outline"
            className="border-purple-400 text-purple-400"
          >
            GPT-5 Powered
          </Badge>
        </div>
      </div>

      {/* Executive Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-gray-400">
                Revenue Growth
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {formatCurrency(summary.revenue?.total || 0)}
            </div>
            <p className="text-xs text-green-400">
              +{summary.revenue?.growthRate || 0}% this period
            </p>
            <div className="mt-2 text-xs text-gray-400">
              Operating: {formatCurrency(summary.cashFlow?.operating || 0)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-gray-400">
                AI Insights
              </CardTitle>
              <Brain className="h-4 w-4 text-cyan-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {aiInsights.length}
            </div>
            <p className="text-xs text-red-400">
              {criticalInsights.length} critical alerts
            </p>
            <div className="mt-2 text-xs text-gray-400">
              Confidence:{" "}
              {aiInsights.length > 0
                ? Math.round(
                    (aiInsights.reduce((sum, i) => sum + i.confidence, 0) /
                      aiInsights.length) *
                      100,
                  )
                : 0}
              %
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-gray-400">
                Automation ROI
              </CardTitle>
              <Bot className="h-4 w-4 text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {formatCurrency(automation.revenueGenerated)}
            </div>
            <p className="text-xs text-purple-400">
              {automation.timeSaved}h saved
            </p>
            <div className="mt-2 text-xs text-gray-400">
              {automation.activeWorkflows} active workflows
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-gray-400">
                System Health
              </CardTitle>
              <Shield
                className={`h-4 w-4 ${getSystemHealthColor(ecosystem.systemHealth?.overall)}`}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white capitalize">
              {ecosystem.systemHealth?.overall || "Unknown"}
            </div>
            <p className="text-xs text-cyan-400">
              {ecosystem.systemHealth?.healthyServices || 0}/
              {ecosystem.systemHealth?.services || 0} services
            </p>
            <div className="mt-2 text-xs text-gray-400">
              Auto-healing active
            </div>
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
            Executive Overview
          </TabsTrigger>
          <TabsTrigger
            value="insights"
            className="data-[state=active]:bg-cyan-600"
          >
            AI Insights
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="data-[state=active]:bg-cyan-600"
          >
            Predictive Analytics
          </TabsTrigger>
          <TabsTrigger
            value="automation"
            className="data-[state=active]:bg-cyan-600"
          >
            Creator Automation
          </TabsTrigger>
          <TabsTrigger
            value="ecosystem"
            className="data-[state=active]:bg-cyan-600"
          >
            Ecosystem Health
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* CFO Brief Section */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <Brain className="h-5 w-5 text-cyan-400" />
                  AI CFO Brief - {selectedPeriod}
                </CardTitle>
                <div className="flex space-x-2">
                  {["daily", "weekly", "monthly", "quarterly"].map((period) => (
                    <Button
                      key={period}
                      size="sm"
                      variant={
                        selectedPeriod === period ? "default" : "outline"
                      }
                      onClick={() => setSelectedPeriod(period)}
                      className="text-xs"
                    >
                      {period}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {brief ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">
                      Executive Summary
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      {brief.executiveSummary}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">
                      Key Takeaways
                    </h3>
                    <ul className="space-y-2">
                      {brief.keyTakeaways.map((takeaway, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-gray-300"
                        >
                          <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0" />
                          {takeaway}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 bg-gray-800/50 rounded-lg">
                      <div className="text-sm text-gray-400 mb-1">Revenue</div>
                      <div className="text-xl font-bold text-white">
                        {formatCurrency(
                          brief.performanceHighlights.revenue.value,
                        )}
                      </div>
                      <div
                        className={`text-xs ${brief.performanceHighlights.revenue.change >= 0 ? "text-green-400" : "text-red-400"}`}
                      >
                        {brief.performanceHighlights.revenue.change >= 0
                          ? "+"
                          : ""}
                        {brief.performanceHighlights.revenue.change}%
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {brief.performanceHighlights.revenue.insight}
                      </div>
                    </div>

                    <div className="p-4 bg-gray-800/50 rounded-lg">
                      <div className="text-sm text-gray-400 mb-1">
                        Profit Margin
                      </div>
                      <div className="text-xl font-bold text-white">
                        {brief.performanceHighlights.profitMargin.value}%
                      </div>
                      <div
                        className={`text-xs ${brief.performanceHighlights.profitMargin.change >= 0 ? "text-green-400" : "text-red-400"}`}
                      >
                        {brief.performanceHighlights.profitMargin.change >= 0
                          ? "+"
                          : ""}
                        {brief.performanceHighlights.profitMargin.change}%
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {brief.performanceHighlights.profitMargin.insight}
                      </div>
                    </div>

                    <div className="p-4 bg-gray-800/50 rounded-lg">
                      <div className="text-sm text-gray-400 mb-1">
                        Customer Acquisition
                      </div>
                      <div className="text-xl font-bold text-white">
                        {brief.performanceHighlights.customerAcquisition.value.toLocaleString()}
                      </div>
                      <div
                        className={`text-xs ${brief.performanceHighlights.customerAcquisition.change >= 0 ? "text-green-400" : "text-red-400"}`}
                      >
                        {brief.performanceHighlights.customerAcquisition
                          .change >= 0
                          ? "+"
                          : ""}
                        {brief.performanceHighlights.customerAcquisition.change}
                        %
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {
                          brief.performanceHighlights.customerAcquisition
                            .insight
                        }
                      </div>
                    </div>

                    <div className="p-4 bg-gray-800/50 rounded-lg">
                      <div className="text-sm text-gray-400 mb-1">
                        Churn Rate
                      </div>
                      <div className="text-xl font-bold text-white">
                        {brief.performanceHighlights.churnRate.value}%
                      </div>
                      <div
                        className={`text-xs ${brief.performanceHighlights.churnRate.change <= 0 ? "text-green-400" : "text-red-400"}`}
                      >
                        {brief.performanceHighlights.churnRate.change >= 0
                          ? "+"
                          : ""}
                        {brief.performanceHighlights.churnRate.change}%
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {brief.performanceHighlights.churnRate.insight}
                      </div>
                    </div>
                  </div>

                  {brief.marketOpportunities?.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">
                        Market Opportunities
                      </h3>
                      <div className="space-y-3">
                        {brief.marketOpportunities.map((opportunity, index) => (
                          <div
                            key={index}
                            className="p-3 bg-gray-800/50 rounded-lg"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-white font-medium">
                                {opportunity.opportunity}
                              </h4>
                              <Badge
                                variant="outline"
                                className="text-xs border-green-400 text-green-400"
                              >
                                {(opportunity.confidence * 100).toFixed(0)}%
                                confidence
                              </Badge>
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-xs">
                              <div>
                                <span className="text-gray-400">Impact:</span>
                                <span className="text-green-400 ml-1">
                                  {formatCurrency(opportunity.potentialImpact)}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-400">
                                  Investment:
                                </span>
                                <span className="text-white ml-1">
                                  {formatCurrency(
                                    opportunity.investmentRequired,
                                  )}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-400">Timeline:</span>
                                <span className="text-cyan-400 ml-1">
                                  {opportunity.timeToRealization}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  No CFO brief available. Click "Generate AI Brief" to create
                  one.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Critical Alerts */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                  Critical AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {criticalInsights.length > 0 ? (
                    criticalInsights.map((insight) => (
                      <div
                        key={insight.id}
                        className="p-4 bg-gray-800/50 rounded-lg border-l-4 border-red-400"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-white font-medium">
                            {insight.title}
                          </h3>
                          <Badge
                            variant="outline"
                            className={getSeverityColor(insight.severity)}
                          >
                            {insight.severity}
                          </Badge>
                        </div>
                        <p className="text-gray-300 text-sm mb-3">
                          {insight.description}
                        </p>
                        <div className="text-xs text-cyan-400 mb-2">
                          <strong>Impact:</strong> {insight.impact}
                        </div>
                        <div className="text-xs text-green-400 mb-2">
                          <strong>Recommendation:</strong>{" "}
                          {insight.recommendation}
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span>
                            Confidence: {Math.round(insight.confidence * 100)}%
                          </span>
                          <span>
                            Est. Impact:{" "}
                            {formatCurrency(insight.estimatedImpact.revenue)}{" "}
                            over {insight.estimatedImpact.timeframe}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      No critical insights at this time. System is operating
                      within normal parameters.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* All AI Insights */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Brain className="h-5 w-5 text-cyan-400" />
                  All AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {aiInsights.map((insight) => (
                    <div
                      key={insight.id}
                      className="p-3 bg-gray-800/50 rounded-lg"
                    >
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="text-white text-sm font-medium">
                          {insight.title}
                        </h4>
                        <Badge
                          variant="outline"
                          className={`text-xs ${getSeverityColor(insight.severity)}`}
                        >
                          {insight.severity}
                        </Badge>
                      </div>
                      <p className="text-gray-300 text-xs mb-2">
                        {insight.description}
                      </p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">
                          Type: {insight.type.replace("_", " ")}
                        </span>
                        <span className="text-cyan-400">
                          {Math.round(insight.confidence * 100)}% confident
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Predictive Models Performance */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-purple-400" />
                  Predictive Models
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-gray-800/50 rounded">
                      <div className="text-2xl font-bold text-cyan-400">
                        {analytics.models?.total || 0}
                      </div>
                      <div className="text-xs text-gray-400">Total Models</div>
                    </div>
                    <div className="p-3 bg-gray-800/50 rounded">
                      <div className="text-2xl font-bold text-green-400">
                        {analytics.models?.active || 0}
                      </div>
                      <div className="text-xs text-gray-400">Active</div>
                    </div>
                    <div className="p-3 bg-gray-800/50 rounded">
                      <div className="text-2xl font-bold text-purple-400">
                        {Math.round(
                          (analytics.models?.averageAccuracy || 0) * 100,
                        )}
                        %
                      </div>
                      <div className="text-xs text-gray-400">Avg Accuracy</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Revenue Forecasting</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-cyan-400 h-2 rounded-full"
                            style={{ width: "94%" }}
                          />
                        </div>
                        <span className="text-sm text-white w-8">94%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Content Performance</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-green-400 h-2 rounded-full"
                            style={{ width: "87%" }}
                          />
                        </div>
                        <span className="text-sm text-white w-8">87%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Churn Prevention</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-purple-400 h-2 rounded-full"
                            style={{ width: "91%" }}
                          />
                        </div>
                        <span className="text-sm text-white w-8">91%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Market Intelligence */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-yellow-400" />
                  Market Intelligence
                </CardTitle>
              </CardHeader>
              <CardContent>
                {intelligence ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-white mb-2">
                        Consumer Spending Trends
                      </h4>
                      <div className="text-lg font-bold text-green-400 capitalize">
                        {intelligence.consumerSpendingPatterns.trend} Trend
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Digital spending index:{" "}
                        {intelligence.economicFactors.digitalSpendingTrend}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-white mb-2">
                        Technology Innovations
                      </h4>
                      <div className="space-y-2">
                        {intelligence.technologyInnovations
                          .slice(0, 3)
                          .map((tech, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between text-sm"
                            >
                              <span className="text-gray-300">
                                {tech.technology}
                              </span>
                              <div className="text-cyan-400">
                                {Math.round(tech.adoptionRate * 100)}% adoption
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-white mb-2">
                        Market Sentiment
                      </h4>
                      <div
                        className={`text-lg font-bold capitalize ${
                          intelligence.economicFactors.marketSentiment ===
                          "bullish"
                            ? "text-green-400"
                            : intelligence.economicFactors.marketSentiment ===
                                "bearish"
                              ? "text-red-400"
                              : "text-yellow-400"
                        }`}
                      >
                        {intelligence.economicFactors.marketSentiment}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    Loading market intelligence data...
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="automation" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Automation Overview */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Bot className="h-5 w-5 text-purple-400" />
                  Creator Automation Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-3 bg-gray-800/50 rounded">
                    <div className="text-2xl font-bold text-purple-400">
                      {automation.totalWorkflows}
                    </div>
                    <div className="text-xs text-gray-400">Total Workflows</div>
                  </div>
                  <div className="text-center p-3 bg-gray-800/50 rounded">
                    <div className="text-2xl font-bold text-green-400">
                      {automation.activeWorkflows}
                    </div>
                    <div className="text-xs text-gray-400">Active</div>
                  </div>
                  <div className="text-center p-3 bg-gray-800/50 rounded">
                    <div className="text-2xl font-bold text-cyan-400">
                      {formatCurrency(automation.revenueGenerated)}
                    </div>
                    <div className="text-xs text-gray-400">
                      Revenue Generated
                    </div>
                  </div>
                  <div className="text-center p-3 bg-gray-800/50 rounded">
                    <div className="text-2xl font-bold text-yellow-400">
                      {automation.timeSaved}h
                    </div>
                    <div className="text-xs text-gray-400">Time Saved</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300">
                        Workflow Completion Rate
                      </span>
                      <span className="text-white">
                        {automation.completionRate
                          ? Math.round(automation.completionRate * 100)
                          : 0}
                        %
                      </span>
                    </div>
                    <Progress
                      value={
                        automation.completionRate
                          ? automation.completionRate * 100
                          : 0
                      }
                      className="bg-gray-700"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300">Engagement Increase</span>
                      <span className="text-white">
                        {automation.engagementIncrease
                          ? Math.round(automation.engagementIncrease * 100)
                          : 0}
                        %
                      </span>
                    </div>
                    <Progress
                      value={
                        automation.engagementIncrease
                          ? automation.engagementIncrease * 100
                          : 0
                      }
                      className="bg-gray-700"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Content Moderation */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-400" />
                  AI Content Moderation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-3 bg-gray-800/50 rounded">
                    <div className="text-2xl font-bold text-cyan-400">
                      {moderation.totalScanned?.toLocaleString() || 0}
                    </div>
                    <div className="text-xs text-gray-400">Content Scanned</div>
                  </div>
                  <div className="text-center p-3 bg-gray-800/50 rounded">
                    <div className="text-2xl font-bold text-green-400">
                      {Math.round((moderation.approvalRate || 0) * 100)}%
                    </div>
                    <div className="text-xs text-gray-400">Approval Rate</div>
                  </div>
                  <div className="text-center p-3 bg-gray-800/50 rounded">
                    <div className="text-2xl font-bold text-purple-400">
                      {moderation.averageProcessingTime || 0}ms
                    </div>
                    <div className="text-xs text-gray-400">Avg Processing</div>
                  </div>
                  <div className="text-center p-3 bg-gray-800/50 rounded">
                    <div className="text-2xl font-bold text-yellow-400">
                      94%
                    </div>
                    <div className="text-xs text-gray-400">Accuracy Rate</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">NSFW Detection</span>
                    <span className="text-cyan-400">94.2% accuracy</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">Fraud Detection</span>
                    <span className="text-purple-400">89.7% accuracy</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">Sentiment Analysis</span>
                    <span className="text-green-400">91.3% accuracy</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ecosystem" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Health */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-400" />
                  Ecosystem Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div
                      className={`text-3xl font-bold capitalize ${getSystemHealthColor(ecosystem.systemHealth?.overall)}`}
                    >
                      {ecosystem.systemHealth?.overall || "Unknown"}
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                      Overall System Status
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gray-800/50 rounded">
                      <div className="text-xl font-bold text-cyan-400">
                        {ecosystem.systemHealth?.services || 0}
                      </div>
                      <div className="text-xs text-gray-400">
                        Total Services
                      </div>
                    </div>
                    <div className="text-center p-3 bg-gray-800/50 rounded">
                      <div className="text-xl font-bold text-green-400">
                        {ecosystem.systemHealth?.healthyServices || 0}
                      </div>
                      <div className="text-xs text-gray-400">Healthy</div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300">Service Health</span>
                      <span className="text-white">
                        {ecosystem.systemHealth?.services
                          ? Math.round(
                              (ecosystem.systemHealth.healthyServices /
                                ecosystem.systemHealth.services) *
                                100,
                            )
                          : 0}
                        %
                      </span>
                    </div>
                    <Progress
                      value={
                        ecosystem.systemHealth?.services
                          ? (ecosystem.systemHealth.healthyServices /
                              ecosystem.systemHealth.services) *
                            100
                          : 0
                      }
                      className="bg-gray-700"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Self-Healing & Maintenance */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings className="h-5 w-5 text-yellow-400" />
                  Self-Healing Operations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gray-800/50 rounded">
                      <div className="text-xl font-bold text-green-400">
                        {ecosystem.selfHealing?.totalResolved || 0}
                      </div>
                      <div className="text-xs text-gray-400">
                        Issues Resolved
                      </div>
                    </div>
                    <div className="text-center p-3 bg-gray-800/50 rounded">
                      <div className="text-xl font-bold text-yellow-400">
                        {ecosystem.selfHealing?.activeOperations || 0}
                      </div>
                      <div className="text-xs text-gray-400">
                        Active Operations
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-400 mb-2">
                      Average Resolution Time
                    </div>
                    <div className="text-lg font-bold text-cyan-400">
                      {ecosystem.selfHealing?.averageResolutionTime
                        ? Math.round(
                            ecosystem.selfHealing.averageResolutionTime,
                          )
                        : 0}
                      s
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-400 mb-2">
                      Next Maintenance
                    </div>
                    <div className="text-sm text-white">
                      {ecosystem.maintenance?.nextMaintenance
                        ? new Date(
                            ecosystem.maintenance.nextMaintenance,
                          ).toLocaleDateString()
                        : "No scheduled maintenance"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {ecosystem.maintenance?.criticalTasks || 0} critical tasks
                      pending
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
