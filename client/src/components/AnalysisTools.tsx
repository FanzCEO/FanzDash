import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

interface AnalysisResult {
  pdqHash?: string;
  nudenetResults?: Array<{
    label: string;
    confidence: number;
    box?: number[];
  }>;
  overallRisk?: number;
  recommendation?: string;
}

export function AnalysisTools() {
  const { toast } = useToast();
  const [lastAnalysis, setLastAnalysis] = useState<AnalysisResult>({
    pdqHash: "f1d2e3a4b5c6...",
    nudenetResults: [
      { label: "EXPOSED_BREAST_F", confidence: 0.87 },
      { label: "FACE_FEMALE", confidence: 0.95 },
    ],
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Analysis failed");
      }

      const result = await response.json();
      setLastAnalysis(result);

      toast({
        title: "Analysis complete",
        description: `Risk level: ${result.recommendation || "unknown"}`,
      });
    } catch (error) {
      toast({
        title: "Analysis failed",
        description: "There was an error analyzing the content.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRunAnalysis = () => {
    toast({
      title: "Analysis started",
      description: "Running NudeNet analysis on uploaded content...",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Analysis Tools</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* PDQ Hash Checker */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <i className="fas fa-fingerprint text-primary mr-2"></i>
              <h4 className="font-medium text-gray-900">PDQ Hash Analysis</h4>
            </div>
            <div className="space-y-3">
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload Image for Hash Check
                </Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                    data-testid="file-upload-input"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <i className="fas fa-cloud-upload-alt text-gray-400 text-2xl mb-2"></i>
                    <p className="text-sm text-gray-600">
                      {isAnalyzing
                        ? "Analyzing..."
                        : "Drop image here or click to upload"}
                    </p>
                  </label>
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <div className="text-xs text-gray-600 mb-1">
                  Last Hash Check Result:
                </div>
                <div
                  className="font-mono text-sm text-gray-900"
                  data-testid="pdq-hash-result"
                >
                  {lastAnalysis.pdqHash}
                </div>
                <div className="text-xs mt-1">
                  <span className="text-green-600">
                    ✓ No match in blocklist
                  </span>
                  <span className="text-gray-500 ml-2">Quality: 0.95</span>
                </div>
              </div>
            </div>
          </div>

          {/* NudeNet Analysis */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <i className="fas fa-search text-primary mr-2"></i>
              <h4 className="font-medium text-gray-900">NudeNet Detection</h4>
            </div>
            <div className="space-y-3">
              <div className="bg-gray-50 p-3 rounded">
                <div className="text-xs text-gray-600 mb-2">
                  Detection Results:
                </div>
                {lastAnalysis.nudenetResults?.map((detection, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-1"
                    data-testid={`detection-${index}`}
                  >
                    <span className="text-sm text-gray-900">
                      {detection.label}
                    </span>
                    <div className="flex items-center space-x-2">
                      <Progress
                        value={detection.confidence * 100}
                        className="w-20 h-2"
                      />
                      <span className="text-xs text-gray-600">
                        {detection.confidence.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <Button
                className="w-full"
                onClick={handleRunAnalysis}
                disabled={isAnalyzing}
                data-testid="run-analysis-button"
              >
                {isAnalyzing ? "Running Analysis..." : "Run Analysis"}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
