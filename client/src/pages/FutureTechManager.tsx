import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Zap,
  Brain,
  Cpu,
  Rocket,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Clock,
  Users,
  Target,
  BarChart3,
  Activity,
  Search,
  Lightbulb,
  Atom,
  Eye,
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface TechAdvancement {
  id: string;
  name: string;
  category:
    | "ai"
    | "vr"
    | "ar"
    | "blockchain"
    | "quantum"
    | "neural"
    | "biotech"
    | "nanotech"
    | "space";
  description: string;
  currentReadinessLevel: number;
  targetReadinessLevel: number;
  impactScore: number;
  feasibilityScore: number;
  riskScore: number;
  estimatedTimeToMarket: number;
  investmentRequired: number;
  potentialROI: number;
  status?:
    | "research"
    | "development"
    | "testing"
    | "rollout"
    | "deployed"
    | "deprecated";
}

interface InnovationPipeline {
  id: string;
  name: string;
  description: string;
  stage:
    | "ideation"
    | "research"
    | "development"
    | "testing"
    | "scaling"
    | "deployment";
  priority: "critical" | "high" | "medium" | "low";
  metrics: {
    progressPercentage: number;
    qualityScore: number;
    riskLevel: number;
    innovationIndex: number;
    marketReadiness: number;
  };
  budget: {
    allocated: number;
    spent: number;
  };
}

interface TechPortfolio {
  totalTechnologies: number;
  byCategory: Record<string, number>;
  byReadinessLevel: Record<string, number>;
  averageImpactScore: number;
  totalInvestment: number;
  expectedROI: number;
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  nearTermOpportunities: Array<{
    name: string;
    category: string;
    timeToMarket: number;
    impactScore: number;
  }>;
}

interface InnovationMetrics {
  activePipelines: number;
  totalBudget: number;
  spentBudget: number;
  averageProgress: number;
  pipelinesByStage: Record<string, number>;
  upcomingMilestones: Array<{
    pipeline: string;
    milestone: string;
    date: Date;
  }>;
  deliverablesSummary: {
    prototypes: number;
    patents: number;
    publications: number;
    demos: number;
  };
}

interface TechScouting {
  id: string;
  query: string;
  scoutingDate: Date;
  findings: Array<{
    technology: string;
    organization: string;
    description: string;
    readinessLevel: number;
    potentialValue: number;
    acquisitionPotential: "high" | "medium" | "low";
  }>;
  aiInsights: {
    summary: string;
    keyOpportunities: string[];
    strategicRecommendations: string[];
  };
}

export default function FutureTechManager() {
  const [activeTab, setActiveTab] = useState("portfolio");
  const [scoutingQuery, setScoutingQuery] = useState("");

  const { data: techAdvancements = [] } = useQuery({
    queryKey: ["/api/future-tech/advancements"],
    refetchInterval: 30000,
  });

  const { data: portfolio } = useQuery({
    queryKey: ["/api/future-tech/portfolio"],
    refetchInterval: 60000,
  });

  const { data: innovationMetrics } = useQuery({
    queryKey: ["/api/future-tech/innovation-metrics"],
    refetchInterval: 30000,
  });

  const { data: scoutingReports = [] } = useQuery({
    queryKey: ["/api/future-tech/scouting-reports"],
    refetchInterval: 120000,
  });

  const { data: trendAnalyses = [] } = useQuery({
    queryKey: ["/api/future-tech/trends"],
    refetchInterval: 300000, // 5 minutes
  });

  const trendAnalysisMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/future-tech/trend-analysis", "POST", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/future-tech/trends"] });
    },
  });

  const techScoutingMutation = useMutation({
    mutationFn: async (query: string) => {
      return apiRequest("/api/future-tech/scouting", "POST", { query });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/future-tech/scouting-reports"],
      });
      setScoutingQuery("");
    },
  });

  const advancements =
    ((techAdvancements as any)?.advancements as TechAdvancement[]) || [];
  const portfolioData = ((portfolio as any)?.analysis as TechPortfolio) || {
    totalTechnologies: 0,
    byCategory: {},
    byReadinessLevel: {},
    averageImpactScore: 0,
    totalInvestment: 0,
    expectedROI: 0,
    riskDistribution: { low: 0, medium: 0, high: 0, critical: 0 },
    nearTermOpportunities: [],
  };
  const metrics = ((innovationMetrics as any)
    ?.metrics as InnovationMetrics) || {
    activePipelines: 0,
    totalBudget: 0,
    spentBudget: 0,
    averageProgress: 0,
    pipelinesByStage: {},
    upcomingMilestones: [],
    deliverablesSummary: {
      prototypes: 0,
      patents: 0,
      publications: 0,
      demos: 0,
    },
  };
  const reports = ((scoutingReports as any)?.reports as TechScouting[]) || [];
  const trends = (trendAnalyses as any)?.analyses || [];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "ai":
        return <Brain className="h-4 w-4" />;
      case "vr":
      case "ar":
        return <Eye className="h-4 w-4" />;
      case "blockchain":
        return <Cpu className="h-4 w-4" />;
      case "quantum":
        return <Atom className="h-4 w-4" />;
      case "neural":
        return <Activity className="h-4 w-4" />;
      case "biotech":
        return <Lightbulb className="h-4 w-4" />;
      case "space":
        return <Rocket className="h-4 w-4" />;
      default:
        return <Zap className="h-4 w-4" />;
    }
  };

  const getRiskColor = (riskScore: number) => {
    if (riskScore <= 25) return "text-green-400";
    if (riskScore <= 50) return "text-yellow-400";
    if (riskScore <= 75) return "text-orange-400";
    return "text-red-400";
  };

  const getReadinessColor = (level: number) => {
    if (level <= 3) return "bg-red-500";
    if (level <= 6) return "bg-yellow-500";
    return "bg-green-500";
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
    return `$${amount}`;
  };

  return (
    <div
      className="p-6 space-y-6 bg-black min-h-screen"
      data-testid="future-tech-dashboard"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Future Technology Management
          </h1>
          <p className="text-cyan-400 mt-2">
            Advanced technology roadmapping and innovation pipeline management
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={() => trendAnalysisMutation.mutate()}
            disabled={trendAnalysisMutation.isPending}
            className="bg-cyan-600 hover:bg-cyan-700"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            {trendAnalysisMutation.isPending
              ? "Analyzing..."
              : "Run Trend Analysis"}
          </Button>
          <Badge
            variant="outline"
            className="border-purple-400 text-purple-400"
          >
            AI-Powered Insights
          </Badge>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-gray-400">
                Technologies
              </CardTitle>
              <Lightbulb className="h-4 w-4 text-cyan-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {portfolioData.totalTechnologies}
            </div>
            <p className="text-xs text-cyan-400">
              {portfolioData.averageImpactScore.toFixed(1)} avg impact
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-gray-400">
                Active Pipelines
              </CardTitle>
              <Rocket className="h-4 w-4 text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {metrics.activePipelines}
            </div>
            <p className="text-xs text-green-400">
              {metrics.averageProgress.toFixed(1)}% avg progress
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-gray-400">
                Investment
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {formatCurrency(portfolioData.totalInvestment)}
            </div>
            <p className="text-xs text-green-400">
              {portfolioData.expectedROI.toFixed(1)}% expected ROI
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-gray-400">
                Near-term Ops
              </CardTitle>
              <Target className="h-4 w-4 text-yellow-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {portfolioData.nearTermOpportunities.length}
            </div>
            <p className="text-xs text-yellow-400">Within 24 months</p>
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
            value="portfolio"
            className="data-[state=active]:bg-cyan-600"
          >
            Tech Portfolio
          </TabsTrigger>
          <TabsTrigger
            value="pipelines"
            className="data-[state=active]:bg-cyan-600"
          >
            Innovation Pipelines
          </TabsTrigger>
          <TabsTrigger
            value="scouting"
            className="data-[state=active]:bg-cyan-600"
          >
            Tech Scouting
          </TabsTrigger>
          <TabsTrigger
            value="trends"
            className="data-[state=active]:bg-cyan-600"
          >
            Market Trends
          </TabsTrigger>
        </TabsList>

        <TabsContent value="portfolio" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Technology Categories */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-cyan-400" />
                  Technology Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(portfolioData.byCategory).map(
                    ([category, count]) => (
                      <div
                        key={category}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(category)}
                          <span className="text-gray-300 capitalize">
                            {category}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-cyan-400 h-2 rounded-full"
                              style={{
                                width: `${(count / Math.max(...Object.values(portfolioData.byCategory))) * 100}%`,
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

            {/* Risk Distribution */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-400" />
                  Risk Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-green-400">Low Risk</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-green-400 h-2 rounded-full"
                          style={{
                            width: `${portfolioData.riskDistribution.low * 5}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm text-white w-8">
                        {portfolioData.riskDistribution.low}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-yellow-400">Medium Risk</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full"
                          style={{
                            width: `${portfolioData.riskDistribution.medium * 5}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm text-white w-8">
                        {portfolioData.riskDistribution.medium}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-orange-400">High Risk</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-orange-400 h-2 rounded-full"
                          style={{
                            width: `${portfolioData.riskDistribution.high * 5}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm text-white w-8">
                        {portfolioData.riskDistribution.high}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-red-400">Critical Risk</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-red-400 h-2 rounded-full"
                          style={{
                            width: `${portfolioData.riskDistribution.critical * 5}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm text-white w-8">
                        {portfolioData.riskDistribution.critical}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Technology Advancement List */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">
                Technology Advancement Portfolio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {advancements.map((tech) => (
                  <div key={tech.id} className="p-4 bg-gray-800/50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getCategoryIcon(tech.category)}
                          <h3 className="text-white font-medium">
                            {tech.name}
                          </h3>
                          <Badge variant="outline" className="text-xs">
                            {tech.category}
                          </Badge>
                        </div>
                        <p className="text-gray-300 text-sm mb-3">
                          {tech.description}
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                          <div>
                            <span className="text-gray-400">
                              Readiness Level
                            </span>
                            <div className="flex items-center gap-1 mt-1">
                              <div
                                className={`w-2 h-2 rounded-full ${getReadinessColor(tech.currentReadinessLevel)}`}
                              />
                              <span className="text-white">
                                TRL {tech.currentReadinessLevel}/9
                              </span>
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-400">Impact Score</span>
                            <div className="text-cyan-400 mt-1">
                              {tech.impactScore}/100
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-400">
                              Time to Market
                            </span>
                            <div className="text-yellow-400 mt-1">
                              {tech.estimatedTimeToMarket}mo
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-400">Investment</span>
                            <div className="text-green-400 mt-1">
                              {formatCurrency(tech.investmentRequired)}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div
                          className={`text-sm ${getRiskColor(tech.riskScore)}`}
                        >
                          Risk: {tech.riskScore}/100
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          ROI: {tech.potentialROI}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pipelines" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pipeline Stages */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Pipeline Stages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(metrics.pipelinesByStage).map(
                    ([stage, count]) => (
                      <div
                        key={stage}
                        className="flex items-center justify-between"
                      >
                        <span className="text-gray-300 capitalize">
                          {stage.replace("_", " ")}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-purple-400 h-2 rounded-full"
                              style={{
                                width: `${(count / Math.max(...Object.values(metrics.pipelinesByStage))) * 100}%`,
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

            {/* Budget Overview */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Budget Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300">Budget Utilization</span>
                      <span className="text-white">
                        {(
                          (metrics.spentBudget / metrics.totalBudget) *
                          100
                        ).toFixed(1)}
                        %
                      </span>
                    </div>
                    <Progress
                      value={(metrics.spentBudget / metrics.totalBudget) * 100}
                      className="bg-gray-700"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-400">Total Budget</div>
                      <div className="text-lg font-semibold text-white">
                        {formatCurrency(metrics.totalBudget)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Spent</div>
                      <div className="text-lg font-semibold text-cyan-400">
                        {formatCurrency(metrics.spentBudget)}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Deliverables Summary */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">
                  Deliverables Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-800/50 rounded">
                    <div className="text-2xl font-bold text-cyan-400">
                      {metrics.deliverablesSummary.prototypes}
                    </div>
                    <div className="text-xs text-gray-400">Prototypes</div>
                  </div>
                  <div className="text-center p-3 bg-gray-800/50 rounded">
                    <div className="text-2xl font-bold text-purple-400">
                      {metrics.deliverablesSummary.patents}
                    </div>
                    <div className="text-xs text-gray-400">Patents</div>
                  </div>
                  <div className="text-center p-3 bg-gray-800/50 rounded">
                    <div className="text-2xl font-bold text-green-400">
                      {metrics.deliverablesSummary.publications}
                    </div>
                    <div className="text-xs text-gray-400">Publications</div>
                  </div>
                  <div className="text-center p-3 bg-gray-800/50 rounded">
                    <div className="text-2xl font-bold text-yellow-400">
                      {metrics.deliverablesSummary.demos}
                    </div>
                    <div className="text-xs text-gray-400">Demos</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Milestones */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">
                  Upcoming Milestones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metrics.upcomingMilestones
                    .slice(0, 5)
                    .map((milestone, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-800/50 rounded"
                      >
                        <div>
                          <div className="text-sm text-white">
                            {milestone.milestone}
                          </div>
                          <div className="text-xs text-gray-400">
                            {milestone.pipeline}
                          </div>
                        </div>
                        <div className="text-xs text-cyan-400">
                          {new Date(milestone.date).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  {metrics.upcomingMilestones.length === 0 && (
                    <div className="text-center py-4 text-gray-400">
                      No upcoming milestones
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="scouting" className="space-y-6">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Search className="h-5 w-5 text-cyan-400" />
                Technology Scouting
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-6">
                <input
                  type="text"
                  placeholder="Enter technology or research area to scout..."
                  value={scoutingQuery}
                  onChange={(e) => setScoutingQuery(e.target.value)}
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-400"
                />
                <Button
                  onClick={() => techScoutingMutation.mutate(scoutingQuery)}
                  disabled={
                    techScoutingMutation.isPending || !scoutingQuery.trim()
                  }
                  className="bg-cyan-600 hover:bg-cyan-700"
                >
                  {techScoutingMutation.isPending ? "Scouting..." : "Scout"}
                </Button>
              </div>

              <div className="space-y-4">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="p-4 bg-gray-800/50 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-white font-medium">
                        "{report.query}"
                      </h3>
                      <span className="text-sm text-gray-400">
                        {new Date(report.scoutingDate).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="mb-4">
                      <h4 className="text-cyan-400 font-medium mb-2">
                        AI Insights Summary
                      </h4>
                      <p className="text-gray-300 text-sm">
                        {report.aiInsights.summary}
                      </p>
                    </div>

                    {report.aiInsights.keyOpportunities.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-green-400 font-medium mb-2">
                          Key Opportunities
                        </h4>
                        <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                          {report.aiInsights.keyOpportunities.map(
                            (opportunity, index) => (
                              <li key={index}>{opportunity}</li>
                            ),
                          )}
                        </ul>
                      </div>
                    )}

                    {report.findings.length > 0 && (
                      <div>
                        <h4 className="text-purple-400 font-medium mb-2">
                          Technology Findings ({report.findings.length})
                        </h4>
                        <div className="grid gap-2">
                          {report.findings.slice(0, 3).map((finding, index) => (
                            <div
                              key={index}
                              className="p-2 bg-gray-700/50 rounded text-sm"
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-white font-medium">
                                  {finding.technology}
                                </span>
                                <Badge
                                  variant="outline"
                                  className={
                                    finding.acquisitionPotential === "high"
                                      ? "border-green-400 text-green-400"
                                      : finding.acquisitionPotential ===
                                          "medium"
                                        ? "border-yellow-400 text-yellow-400"
                                        : "border-gray-400 text-gray-400"
                                  }
                                >
                                  {finding.acquisitionPotential} potential
                                </Badge>
                              </div>
                              <div className="text-gray-300">
                                {finding.organization}
                              </div>
                              <div className="text-xs text-gray-400 mt-1">
                                TRL: {finding.readinessLevel}/9
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {reports.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    No scouting reports yet. Enter a query above to start
                    technology scouting.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-cyan-400" />
                Market Trend Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              {trends.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  No trend analyses yet. Click "Run Trend Analysis" to generate
                  AI-powered market insights.
                </div>
              ) : (
                <div className="space-y-6">
                  {trends.slice(0, 3).map((trend: any, index: number) => (
                    <div key={index} className="p-4 bg-gray-800/50 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-white font-medium">
                          Market Analysis
                        </h3>
                        <span className="text-sm text-gray-400">
                          {new Date(trend.analysisDate).toLocaleDateString()}
                        </span>
                      </div>

                      {trend.insights?.hottestTechnologies?.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-green-400 font-medium mb-2">
                            Hottest Technologies
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {trend.insights.hottestTechnologies.map(
                              (tech: string, i: number) => (
                                <Badge
                                  key={i}
                                  variant="outline"
                                  className="border-green-400 text-green-400"
                                >
                                  {tech}
                                </Badge>
                              ),
                            )}
                          </div>
                        </div>
                      )}

                      {trend.insights?.investmentOpportunities?.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-cyan-400 font-medium mb-2">
                            Investment Opportunities
                          </h4>
                          <div className="space-y-2">
                            {trend.insights.investmentOpportunities
                              .slice(0, 3)
                              .map((opp: any, i: number) => (
                                <div
                                  key={i}
                                  className="p-2 bg-gray-700/50 rounded text-sm"
                                >
                                  <div className="text-white font-medium">
                                    {opp.technology}
                                  </div>
                                  <div className="text-gray-300">
                                    {opp.opportunity}
                                  </div>
                                  <div className="text-xs text-cyan-400 mt-1">
                                    Investment: {opp.investmentRange} | Expected
                                    ROI: {opp.expectedROI}
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                      {trend.recommendations?.length > 0 && (
                        <div>
                          <h4 className="text-purple-400 font-medium mb-2">
                            Strategic Recommendations
                          </h4>
                          <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                            {trend.recommendations
                              .slice(0, 3)
                              .map((rec: any, i: number) => (
                                <li key={i}>
                                  {rec.action} - {rec.rationale}
                                </li>
                              ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
