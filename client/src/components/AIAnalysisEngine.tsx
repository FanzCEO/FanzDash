import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Brain,
  Zap,
  Shield,
  Target,
  Activity,
  Upload,
  FileImage,
  FileVideo,
  FileText,
  Cpu,
  Network,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";

interface AIAnalysisResult {
  id: string;
  contentId: string;
  analysisType:
    | "nudenet"
    | "chatgpt-4o"
    | "perspective"
    | "detoxify"
    | "pdq-hash";
  confidence: number;
  result: any;
  processingTime: number;
  modelVersion: string;
  createdAt: string;
}

interface ContentAnalysisRequest {
  contentType: "image" | "video" | "text" | "live_stream";
  contentData: string;
  analysisTypes: string[];
  priority: "low" | "medium" | "high" | "critical";
}

export function AIAnalysisEngine() {
  const [selectedContent, setSelectedContent] = useState<string>("");
  const [contentType, setContentType] = useState<string>("text");
  const [analysisTypes, setAnalysisTypes] = useState<string[]>(["chatgpt-4o"]);
  const [priority, setPriority] = useState<string>("medium");
  const [processingStats, setProcessingStats] = useState({
    queueSize: 0,
    processing: 0,
    avgProcessingTime: 0,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: recentAnalysis = [] } = useQuery<AIAnalysisResult[]>({
    queryKey: ["/api/ai/analysis/recent"],
    refetchInterval: 2000,
  });

  const { data: modelStats } = useQuery({
    queryKey: ["/api/ai/models/stats"],
    refetchInterval: 5000,
  });

  const analysisMutation = useMutation({
    mutationFn: async (request: ContentAnalysisRequest) => {
      const response = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "Analysis Started",
        description: `Content analysis initiated with ID: ${data.analysisId || 'unknown'}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/ai/analysis/recent"] });
      setSelectedContent("");
    },
    onError: (error: Error) => {
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAnalysisSubmit = () => {
    if (!selectedContent.trim()) {
      toast({
        title: "Missing Content",
        description: "Please provide content to analyze.",
        variant: "destructive",
      });
      return;
    }

    if (analysisTypes.length === 0) {
      toast({
        title: "No Analysis Types",
        description: "Please select at least one analysis type.",
        variant: "destructive",
      });
      return;
    }

    analysisMutation.mutate({
      contentType: contentType as any,
      contentData: selectedContent,
      analysisTypes,
      priority: priority as any,
    });
  };

  const getAnalysisIcon = (type: string) => {
    switch (type) {
      case "chatgpt-4o":
        return <Brain className="w-4 h-4 text-primary" />;
      case "nudenet":
        return <FileImage className="w-4 h-4 text-secondary" />;
      case "perspective":
        return <Shield className="w-4 h-4 text-accent" />;
      case "detoxify":
        return <AlertTriangle className="w-4 h-4 text-destructive" />;
      case "pdq-hash":
        return <Target className="w-4 h-4 text-muted-foreground" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return "text-destructive";
    if (confidence >= 0.7) return "text-accent";
    if (confidence >= 0.5) return "text-primary";
    return "text-secondary";
  };

  // Simulate real-time processing stats updates
  useEffect(() => {
    const interval = setInterval(() => {
      setProcessingStats({
        queueSize: Math.floor(Math.random() * 50) + 10,
        processing: Math.floor(Math.random() * 8) + 2,
        avgProcessingTime: Math.floor(Math.random() * 500) + 100,
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* AI Performance Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card className="cyber-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-primary/20 border border-primary/30">
                <Cpu className="w-5 h-5 text-primary cyber-pulse" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Queue Size</div>
                <div className="text-xl font-bold cyber-text-glow">
                  {processingStats.queueSize}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cyber-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-secondary/20 border border-secondary/30">
                <Activity className="w-5 h-5 text-secondary cyber-pulse" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Processing</div>
                <div className="text-xl font-bold cyber-text-glow">
                  {processingStats.processing}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cyber-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-accent/20 border border-accent/30">
                <Zap className="w-5 h-5 text-accent cyber-pulse" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Avg Time</div>
                <div className="text-xl font-bold cyber-text-glow">
                  {processingStats.avgProcessingTime}ms
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cyber-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-destructive/20 border border-destructive/30">
                <Network className="w-5 h-5 text-destructive cyber-pulse" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">
                  Models Active
                </div>
                <div className="text-xl font-bold cyber-text-glow">5</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Analysis Interface */}
      <Card className="cyber-card neural-network">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="w-6 h-6 text-primary cyber-pulse" />
            <span className="cyber-text-glow">AI ANALYSIS ENGINE</span>
            <Badge variant="outline" className="ml-4 neon-text">
              ChatGPT-4o • NudeNet • Perspective API
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Content Input */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Content Type
                </label>
                <Select value={contentType} onValueChange={setContentType}>
                  <SelectTrigger className="glass-effect">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text Content</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="live_stream">Live Stream</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Priority
                </label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger className="glass-effect">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low Priority</SelectItem>
                    <SelectItem value="medium">Medium Priority</SelectItem>
                    <SelectItem value="high">High Priority</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Analysis Models
                </label>
                <div className="space-y-2">
                  {[
                    { id: "chatgpt-4o", label: "ChatGPT-4o", icon: Brain },
                    { id: "nudenet", label: "NudeNet", icon: FileImage },
                    {
                      id: "perspective",
                      label: "Perspective API",
                      icon: Shield,
                    },
                    { id: "detoxify", label: "Detoxify", icon: AlertTriangle },
                    { id: "pdq-hash", label: "PDQ Hash", icon: Target },
                  ].map((model) => {
                    const IconComponent = model.icon;
                    return (
                      <label
                        key={model.id}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={analysisTypes.includes(model.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setAnalysisTypes([...analysisTypes, model.id]);
                            } else {
                              setAnalysisTypes(
                                analysisTypes.filter((t) => t !== model.id),
                              );
                            }
                          }}
                          className="rounded border-primary"
                        />
                        <IconComponent className="w-4 h-4" />
                        <span className="text-sm">{model.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Content to Analyze
              </label>
              {contentType === "text" ? (
                <Textarea
                  value={selectedContent}
                  onChange={(e) => setSelectedContent(e.target.value)}
                  placeholder="Enter text content, URL, or upload path for analysis..."
                  className="min-h-32 glass-effect"
                  data-testid="content-input"
                />
              ) : (
                <Input
                  value={selectedContent}
                  onChange={(e) => setSelectedContent(e.target.value)}
                  placeholder={`Enter ${contentType} URL or file path...`}
                  className="glass-effect"
                  data-testid="content-url-input"
                />
              )}
            </div>

            <Button
              onClick={handleAnalysisSubmit}
              disabled={analysisMutation.isPending}
              className="neon-button w-full"
              data-testid="submit-analysis"
            >
              <Zap className="w-4 h-4 mr-2" />
              {analysisMutation.isPending
                ? "Processing..."
                : "Start AI Analysis"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Model Performance Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="cyber-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-secondary" />
              <span>Model Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                name: "ChatGPT-4o",
                accuracy: 96.8,
                speed: "180ms",
                status: "optimal",
              },
              {
                name: "NudeNet",
                accuracy: 94.2,
                speed: "45ms",
                status: "excellent",
              },
              {
                name: "Perspective API",
                accuracy: 91.5,
                speed: "220ms",
                status: "good",
              },
              {
                name: "Detoxify",
                accuracy: 89.3,
                speed: "35ms",
                status: "excellent",
              },
              {
                name: "PDQ Hash",
                accuracy: 100,
                speed: "8ms",
                status: "perfect",
              },
            ].map((model) => (
              <div key={model.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{model.name}</span>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={
                        model.status === "perfect"
                          ? "default"
                          : model.status === "optimal"
                            ? "secondary"
                            : model.status === "excellent"
                              ? "outline"
                              : "secondary"
                      }
                    >
                      {model.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {model.speed}
                    </span>
                  </div>
                </div>
                <Progress value={model.accuracy} className="h-2" />
                <div className="text-xs text-muted-foreground">
                  Accuracy: {model.accuracy}%
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Analysis Results */}
        <Card className="cyber-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-accent" />
              <span>Recent Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {recentAnalysis.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No recent analysis results</p>
                </div>
              ) : (
                recentAnalysis.map((result) => (
                  <div
                    key={result.id}
                    className="p-3 border border-border/30 rounded-lg glass-effect"
                    data-testid={`analysis-result-${result.id}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getAnalysisIcon(result.analysisType)}
                        <span className="font-mono text-sm">
                          {result.analysisType}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`font-bold ${getConfidenceColor(result.confidence)}`}
                        >
                          {(result.confidence * 100).toFixed(1)}%
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {result.processingTime}ms
                        </Badge>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Content: {result.contentId.substring(0, 16)}...
                      {" • "}
                      {new Date(result.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
