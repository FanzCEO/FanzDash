import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AnalysisResult {
  riskScore: number;
  confidence: number;
  decision: string;
  reasoning: string;
  flaggedCategories: string[];
  processingTime: number;
}

export function InteractiveAnalysisForm() {
  const [contentUrl, setContentUrl] = useState("");
  const [contentType, setContentType] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  const analysisMutation = useMutation({
    mutationFn: async (data: { contentType: string; url: string }) => {
      const response = await fetch("/api/content/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentType: data.contentType,
          url: data.url,
          contentId: `content-${Date.now()}`,
        }),
      });
      return await response.json();
    },
    onSuccess: (data) => {
      setResult(data);
      toast({
        title: "Analysis Complete",
        description: `Content analyzed with ${(data.confidence * 100).toFixed(1)}% confidence`,
      });
    },
    onError: (error) => {
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze content. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAnalyze = () => {
    if (!contentUrl || !contentType) {
      toast({
        title: "Missing Information",
        description: "Please provide both content URL and type",
        variant: "destructive",
      });
      return;
    }

    analysisMutation.mutate({ contentType, url: contentUrl });
  };

  const getRiskBadgeColor = (riskScore: number) => {
    if (riskScore > 0.8) return "destructive";
    if (riskScore > 0.5) return "secondary";
    return "default";
  };

  const getDecisionIcon = (decision: string) => {
    switch (decision.toLowerCase()) {
      case "approve":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "block":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card data-testid="analysis-form-card">
        <CardHeader>
          <CardTitle className="text-cyan-400">AI Content Analysis</CardTitle>
          <CardDescription>
            Test real ChatGPT-5 analysis on your content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contentUrl">Content URL</Label>
            <Input
              id="contentUrl"
              data-testid="input-content-url"
              placeholder="https://example.com/image.jpg or text content"
              value={contentUrl}
              onChange={(e) => setContentUrl(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contentType">Content Type</Label>
            <Select value={contentType} onValueChange={setContentType}>
              <SelectTrigger data-testid="select-content-type">
                <SelectValue placeholder="Select content type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="video">Video</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={analysisMutation.isPending}
            className="w-full bg-cyan-600 hover:bg-cyan-700"
            data-testid="button-analyze"
          >
            {analysisMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing with AI...
              </>
            ) : (
              "Analyze Content"
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card data-testid="analysis-results-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-cyan-400">
              {getDecisionIcon(result.decision)}
              Analysis Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Risk Score</Label>
                <Badge
                  variant={getRiskBadgeColor(result.riskScore)}
                  data-testid="badge-risk-score"
                >
                  {(result.riskScore * 100).toFixed(1)}%
                </Badge>
              </div>

              <div className="space-y-2">
                <Label>Confidence</Label>
                <Badge variant="outline" data-testid="badge-confidence">
                  {(result.confidence * 100).toFixed(1)}%
                </Badge>
              </div>

              <div className="space-y-2">
                <Label>Decision</Label>
                <Badge
                  variant={
                    result.decision === "approve" ? "default" : "destructive"
                  }
                  data-testid="badge-decision"
                >
                  {result.decision.toUpperCase()}
                </Badge>
              </div>

              <div className="space-y-2">
                <Label>Processing Time</Label>
                <Badge variant="outline" data-testid="badge-processing-time">
                  {result.processingTime}ms
                </Badge>
              </div>
            </div>

            {result.reasoning && (
              <div className="space-y-2">
                <Label>AI Reasoning</Label>
                <p
                  className="text-sm text-gray-300 bg-gray-800 p-3 rounded border border-gray-700"
                  data-testid="text-reasoning"
                >
                  {result.reasoning}
                </p>
              </div>
            )}

            {result.flaggedCategories.length > 0 && (
              <div className="space-y-2">
                <Label>Flagged Categories</Label>
                <div
                  className="flex flex-wrap gap-2"
                  data-testid="flagged-categories"
                >
                  {result.flaggedCategories.map((category, index) => (
                    <Badge key={index} variant="destructive">
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
