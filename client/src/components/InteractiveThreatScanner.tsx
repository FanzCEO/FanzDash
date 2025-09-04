import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, Shield, AlertTriangle, CheckCircle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ScanResult {
  scanId: string;
  threatsDetected: number;
  newThreats: number;
  mitigatedThreats: number;
  scanCompletedAt: string;
}

export function InteractiveThreatScanner() {
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const { toast } = useToast();

  const scanMutation = useMutation({
    mutationFn: async () => {
      // Simulate progressive scanning
      setScanProgress(0);
      const progressInterval = setInterval(() => {
        setScanProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + Math.random() * 15;
        });
      }, 200);

      const response = await fetch("/api/threats/scan", {
        method: "POST",
      });
      const result = await response.json();

      clearInterval(progressInterval);
      setScanProgress(100);

      return result;
    },
    onSuccess: (data) => {
      setScanResult(data);
      toast({
        title: "Threat Scan Complete",
        description: `Scan completed. ${data.threatsDetected} threats detected.`,
        variant: data.threatsDetected > 0 ? "destructive" : "default",
      });
    },
    onError: () => {
      setScanProgress(0);
      toast({
        title: "Scan Failed",
        description: "Failed to complete threat scan. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleStartScan = () => {
    setScanResult(null);
    setScanProgress(0);
    scanMutation.mutate();
  };

  const getThreatBadgeColor = (count: number) => {
    if (count === 0) return "default";
    if (count <= 2) return "secondary";
    return "destructive";
  };

  return (
    <div className="space-y-6">
      <Card data-testid="threat-scanner-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-cyan-400">
            <Shield className="h-5 w-5" />
            Comprehensive Threat Scanner
          </CardTitle>
          <CardDescription>
            Run a deep scan across all connected platforms to detect new threats
            and vulnerabilities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleStartScan}
            disabled={scanMutation.isPending}
            className="w-full bg-cyan-600 hover:bg-cyan-700"
            data-testid="button-start-scan"
          >
            {scanMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Scanning Network...
              </>
            ) : (
              <>
                <Shield className="mr-2 h-4 w-4" />
                Start Threat Scan
              </>
            )}
          </Button>

          {scanMutation.isPending && (
            <div className="space-y-2" data-testid="scan-progress">
              <div className="flex justify-between text-sm">
                <span>Scanning progress</span>
                <span>{Math.round(scanProgress)}%</span>
              </div>
              <Progress value={scanProgress} className="w-full" />
              <p className="text-sm text-gray-400">
                Analyzing content patterns, checking for coordinated attacks,
                and scanning for new threat vectors...
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {scanResult && (
        <Card data-testid="scan-results-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-cyan-400">
              {scanResult.threatsDetected === 0 ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-500" />
              )}
              Scan Results
            </CardTitle>
            <CardDescription>
              Scan ID: {scanResult.scanId} | Completed:{" "}
              {new Date(scanResult.scanCompletedAt).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center space-y-2">
                <div
                  className="text-2xl font-bold text-red-400"
                  data-testid="threats-detected"
                >
                  {scanResult.threatsDetected}
                </div>
                <Badge
                  variant={getThreatBadgeColor(scanResult.threatsDetected)}
                  className="w-full justify-center"
                >
                  Active Threats
                </Badge>
              </div>

              <div className="text-center space-y-2">
                <div
                  className="text-2xl font-bold text-yellow-400"
                  data-testid="new-threats"
                >
                  {scanResult.newThreats}
                </div>
                <Badge variant="secondary" className="w-full justify-center">
                  New Threats
                </Badge>
              </div>

              <div className="text-center space-y-2">
                <div
                  className="text-2xl font-bold text-green-400"
                  data-testid="mitigated-threats"
                >
                  {scanResult.mitigatedThreats}
                </div>
                <Badge variant="default" className="w-full justify-center">
                  Mitigated Threats
                </Badge>
              </div>
            </div>

            {scanResult.threatsDetected > 0 && (
              <div
                className="mt-6 p-4 bg-red-900/20 border border-red-500/20 rounded-lg"
                data-testid="threat-alert"
              >
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                  <span className="font-semibold text-red-400">
                    Action Required
                  </span>
                </div>
                <p className="text-sm text-gray-300">
                  {scanResult.threatsDetected} active threats detected. Review
                  the threat center for detailed analysis and recommended
                  actions.
                </p>
              </div>
            )}

            {scanResult.threatsDetected === 0 && (
              <div
                className="mt-6 p-4 bg-green-900/20 border border-green-500/20 rounded-lg"
                data-testid="all-clear"
              >
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span className="font-semibold text-green-400">
                    All Clear
                  </span>
                </div>
                <p className="text-sm text-gray-300">
                  No active threats detected. Your network is secure and all
                  mitigation systems are functioning properly.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card data-testid="scan-info-card">
        <CardHeader>
          <CardTitle className="text-cyan-400">Scan Coverage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Detection Methods:</h4>
              <ul className="space-y-1 text-gray-300">
                <li>• AI-powered pattern analysis</li>
                <li>• Coordinated attack detection</li>
                <li>• Anomaly behavior scanning</li>
                <li>• Cross-platform correlation</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Threat Categories:</h4>
              <ul className="space-y-1 text-gray-300">
                <li>• Content manipulation</li>
                <li>• Bot network activity</li>
                <li>• Policy circumvention</li>
                <li>• Security vulnerabilities</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
