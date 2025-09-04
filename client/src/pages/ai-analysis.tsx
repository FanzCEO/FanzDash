import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Brain,
  Zap,
  Clock,
  CheckCircle,
  AlertTriangle,
  Play,
} from "lucide-react";
import { InteractiveAnalysisForm } from "@/components/InteractiveAnalysisForm";

export default function AIAnalysisPage() {
  const [analysisRunning, setAnalysisRunning] = useState(false);
  const { toast } = useToast();

  const { data: recentAnalysis, isLoading } = useQuery({
    queryKey: ["/api/ai/analysis/recent"],
    refetchInterval: 5000,
  });

  const { data: modelStats } = useQuery({
    queryKey: ["/api/ai/models/stats"],
    refetchInterval: 10000,
  });

  const runAnalysis = async () => {
    setAnalysisRunning(true);
    try {
      await apiRequest("/api/ai/analyze", "POST", {
        contentType: "batch",
        analysisTypes: ["chatgpt-4o"],
        priority: "high",
        contentBatch: [
          {
            type: "image",
            url: "https://example.com/test-image.jpg",
            context: "Test analysis",
          },
          {
            type: "text",
            content: "Sample text for analysis",
            context: "Test content",
          },
        ],
      });
      toast({
        title: "Analysis Started",
        description: "AI analysis engine is processing content batch",
      });
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Unable to start analysis batch",
        variant: "destructive",
      });
    }
    setTimeout(() => setAnalysisRunning(false), 3000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen cyber-bg flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-16 h-16 mx-auto mb-4 cyber-pulse text-primary" />
          <p className="cyber-text-glow">Loading AI Analysis Engine...</p>
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
              AI Analysis Engine
            </h1>
            <p className="text-muted-foreground">
              Advanced ChatGPT-4o Content Moderation
            </p>
          </div>
          <Button
            onClick={runAnalysis}
            disabled={analysisRunning}
            className="neon-button"
            data-testid="run-analysis-button"
          >
            {analysisRunning ? (
              <>
                <Zap className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Run Analysis
              </>
            )}
          </Button>
        </div>

        {/* Model Performance Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {modelStats &&
            Object.entries(modelStats).map(([model, stats]: [string, any]) => (
              <Card key={model} className="cyber-card">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold cyber-text-glow">
                    {stats?.accuracy || 0}%
                  </div>
                  <div className="text-sm text-muted-foreground uppercase">
                    {model}
                  </div>
                  <div className="text-xs text-primary">
                    {stats?.speed || "0ms"}
                  </div>
                  <Badge
                    variant={
                      stats?.status === "optimal" ? "default" : "secondary"
                    }
                    className="mt-2"
                  >
                    {stats?.status || "unknown"}
                  </Badge>
                </CardContent>
              </Card>
            ))}
        </div>

        {/* Real-time Analysis Feed */}
        <Card className="cyber-card neural-network">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="w-6 h-6 text-primary cyber-pulse" />
              <span className="cyber-text-glow">REAL-TIME ANALYSIS FEED</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {(recentAnalysis as any[])?.map(
                (analysis: any, index: number) => (
                  <div
                    key={analysis.id}
                    className="flex items-center justify-between p-4 cyber-card border border-primary/20"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          analysis.result.riskScore > 0.7
                            ? "bg-red-500"
                            : analysis.result.riskScore > 0.4
                              ? "bg-yellow-500"
                              : "bg-green-500"
                        } cyber-pulse`}
                      />
                      <div>
                        <div className="font-medium">
                          {analysis.contentType}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {analysis.platformName} • {analysis.analysisType}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">
                        {(analysis.result.riskScore * 100).toFixed(1)}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {analysis.processingTime}ms
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {analysis.result.riskScore > 0.7 ? (
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                      <Badge
                        variant={
                          analysis.result.riskScore > 0.7
                            ? "destructive"
                            : "default"
                        }
                      >
                        {analysis.result.recommendations[0]}
                      </Badge>
                    </div>
                  </div>
                ),
              )}
            </div>
          </CardContent>
        </Card>

        {/* Analysis Pipeline */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="cyber-card">
            <CardHeader>
              <CardTitle className="text-lg">Content Intake</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Images Processed</span>
                  <span className="font-bold text-primary">12,847</span>
                </div>
                <div className="flex justify-between">
                  <span>Videos Analyzed</span>
                  <span className="font-bold text-primary">3,456</span>
                </div>
                <div className="flex justify-between">
                  <span>Text Messages</span>
                  <span className="font-bold text-primary">45,672</span>
                </div>
                <div className="flex justify-between">
                  <span>Live Streams</span>
                  <span className="font-bold text-primary">234</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cyber-card">
            <CardHeader>
              <CardTitle className="text-lg">Risk Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-green-400">Low Risk (0-40%)</span>
                  <span className="font-bold">89.2%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-yellow-400">Medium Risk (40-70%)</span>
                  <span className="font-bold">8.1%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-400">High Risk (70%+)</span>
                  <span className="font-bold">2.7%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cyber-card">
            <CardHeader>
              <CardTitle className="text-lg">Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Avg Processing Time</span>
                  <span className="font-bold text-primary">1.2s</span>
                </div>
                <div className="flex justify-between">
                  <span>Accuracy Rate</span>
                  <span className="font-bold text-green-400">96.8%</span>
                </div>
                <div className="flex justify-between">
                  <span>False Positives</span>
                  <span className="font-bold text-yellow-400">2.1%</span>
                </div>
                <div className="flex justify-between">
                  <span>Uptime</span>
                  <span className="font-bold text-green-400">99.9%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Interactive Analysis Testing */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6 text-cyan-400">
          Interactive Content Analysis
        </h2>
        <InteractiveAnalysisForm />
      </div>
    </div>
  );
}
