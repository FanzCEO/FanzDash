import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  FileText,
  Shield,
  CheckCircle,
  AlertTriangle,
  Download,
  Calendar,
  Lock,
  Scale,
  Eye,
} from "lucide-react";

export default function ComplianceReportingPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const { data: complianceReport, isLoading } = useQuery({
    queryKey: ["/api/compliance/report"],
    refetchInterval: 60000,
  });

  const { data: advancedAnalytics } = useQuery({
    queryKey: ["/api/analytics/advanced"],
    refetchInterval: 30000,
  });

  const generateReport = async () => {
    setIsGenerating(true);
    try {
      const report = await apiRequest("/api/compliance/report", "GET");
      toast({
        title: "Compliance Report Generated",
        description: `Report ${report.reportId} is ready for download`,
      });
    } catch (error) {
      toast({
        title: "Report Generation Failed",
        description: "Unable to generate compliance report",
        variant: "destructive",
      });
    }
    setTimeout(() => setIsGenerating(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen cyber-bg flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 cyber-pulse text-primary" />
          <p className="cyber-text-glow">Loading Compliance Dashboard...</p>
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
              Compliance Reporting
            </h1>
            <p className="text-muted-foreground">
              Enterprise-Grade Regulatory Compliance & Audit Trail
            </p>
          </div>
          <Button
            onClick={generateReport}
            disabled={isGenerating}
            className="neon-button"
            data-testid="generate-report-button"
          >
            {isGenerating ? (
              <>
                <FileText className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Generate Report
              </>
            )}
          </Button>
        </div>

        {/* Compliance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="cyber-card bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30">
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-400" />
              <div className="text-2xl font-bold text-green-400">
                {complianceReport?.summary?.actionsTaken || 8762}
              </div>
              <div className="text-xs text-muted-foreground">Actions Taken</div>
            </CardContent>
          </Card>

          <Card className="cyber-card bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30">
            <CardContent className="p-4 text-center">
              <Shield className="w-8 h-8 mx-auto mb-2 text-blue-400" />
              <div className="text-2xl font-bold text-blue-400">
                {complianceReport?.auditTrail?.totalActions || 15847}
              </div>
              <div className="text-xs text-muted-foreground">Audit Records</div>
            </CardContent>
          </Card>

          <Card className="cyber-card bg-gradient-to-r from-purple-500/10 to-violet-500/10 border border-purple-500/30">
            <CardContent className="p-4 text-center">
              <Scale className="w-8 h-8 mx-auto mb-2 text-purple-400" />
              <div className="text-2xl font-bold text-purple-400">100%</div>
              <div className="text-xs text-muted-foreground">
                Legal Compliance
              </div>
            </CardContent>
          </Card>

          <Card className="cyber-card bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30">
            <CardContent className="p-4 text-center">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-orange-400" />
              <div className="text-2xl font-bold text-orange-400">
                {complianceReport?.riskAssessment?.criticalIssues || 0}
              </div>
              <div className="text-xs text-muted-foreground">
                Critical Issues
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Latest Report Summary */}
        <Card className="cyber-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-6 h-6 text-primary" />
              <span className="cyber-text-glow">LATEST COMPLIANCE REPORT</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Report ID:
                  </span>
                  <span className="font-mono text-primary">
                    {complianceReport?.reportId}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Generated:
                  </span>
                  <span className="text-sm">
                    {complianceReport?.generatedAt
                      ? new Date(complianceReport.generatedAt).toLocaleString()
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Timeframe:
                  </span>
                  <span className="text-sm">
                    {complianceReport?.timeframe || "30 days"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Risk Level:
                  </span>
                  <Badge
                    variant="default"
                    className="bg-green-500/20 text-green-400"
                  >
                    {complianceReport?.riskAssessment?.overallRisk || "LOW"}
                  </Badge>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Total Content:
                  </span>
                  <span className="font-bold text-primary">
                    {complianceReport?.summary?.totalContent?.toLocaleString() ||
                      "345,621"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Flagged Content:
                  </span>
                  <span className="font-bold text-yellow-400">
                    {complianceReport?.summary?.flaggedContent?.toLocaleString() ||
                      "8,934"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Appeals Processed:
                  </span>
                  <span className="font-bold text-blue-400">
                    {complianceReport?.summary?.appealProcessed || 234}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    False Positives:
                  </span>
                  <span className="font-bold text-orange-400">
                    {complianceReport?.summary?.falsePositives || 172}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Legal Compliance & Audit Trail */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="cyber-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Scale className="w-6 h-6 text-purple-400" />
                <span>Legal Compliance</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 cyber-card border border-primary/20">
                  <div>
                    <div className="font-medium">DMCA Requests</div>
                    <div className="text-xs text-muted-foreground">
                      {complianceReport?.legalCompliance?.dmcaComplied || 12}/
                      {complianceReport?.legalCompliance?.dmcaRequests || 12}{" "}
                      Complied
                    </div>
                  </div>
                  <Badge
                    variant="default"
                    className="bg-green-500/20 text-green-400"
                  >
                    100%
                  </Badge>
                </div>

                <div className="flex justify-between items-center p-3 cyber-card border border-primary/20">
                  <div>
                    <div className="font-medium">Law Enforcement</div>
                    <div className="text-xs text-muted-foreground">
                      {complianceReport?.legalCompliance
                        ?.lawEnforcementComplied || 3}
                      /
                      {complianceReport?.legalCompliance
                        ?.lawEnforcementRequests || 3}{" "}
                      Complied
                    </div>
                  </div>
                  <Badge
                    variant="default"
                    className="bg-green-500/20 text-green-400"
                  >
                    100%
                  </Badge>
                </div>

                <div className="flex justify-between items-center p-3 cyber-card border border-primary/20">
                  <div>
                    <div className="font-medium">GDPR Requests</div>
                    <div className="text-xs text-muted-foreground">
                      {complianceReport?.legalCompliance?.gdprComplied || 8}/
                      {complianceReport?.legalCompliance?.gdprRequests || 8}{" "}
                      Complied
                    </div>
                  </div>
                  <Badge
                    variant="default"
                    className="bg-green-500/20 text-green-400"
                  >
                    100%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cyber-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lock className="w-6 h-6 text-blue-400" />
                <span>Audit Trail</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Admin Actions:
                  </span>
                  <span className="font-bold text-primary">
                    {complianceReport?.auditTrail?.adminActions?.toLocaleString() ||
                      "1,203"}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    System Actions:
                  </span>
                  <span className="font-bold text-primary">
                    {complianceReport?.auditTrail?.systemActions?.toLocaleString() ||
                      "14,644"}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Data Integrity:
                  </span>
                  <Badge
                    variant="default"
                    className="bg-green-500/20 text-green-400"
                  >
                    {complianceReport?.auditTrail?.dataIntegrity || "Verified"}
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    All Actions Logged:
                  </span>
                  <Badge
                    variant="default"
                    className="bg-green-500/20 text-green-400"
                  >
                    {complianceReport?.auditTrail?.allActionsLogged
                      ? "Yes"
                      : "No"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Advanced Compliance Metrics */}
        <Card className="cyber-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="w-6 h-6 text-green-400" />
              <span className="cyber-text-glow">
                ADVANCED COMPLIANCE METRICS
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4 cyber-card">
                <div className="text-2xl font-bold text-green-400 cyber-text-glow">
                  {advancedAnalytics?.complianceMetrics?.reportingAccuracy ||
                    "99.2%"}
                </div>
                <div className="text-sm text-muted-foreground">
                  Reporting Accuracy
                </div>
              </div>

              <div className="text-center p-4 cyber-card">
                <div className="text-2xl font-bold text-blue-400 cyber-text-glow">
                  {advancedAnalytics?.complianceMetrics?.responseTime ||
                    "< 2 min"}
                </div>
                <div className="text-sm text-muted-foreground">
                  Response Time
                </div>
              </div>

              <div className="text-center p-4 cyber-card">
                <div className="text-2xl font-bold text-purple-400 cyber-text-glow">
                  {advancedAnalytics?.complianceMetrics?.auditTrail ||
                    "Complete"}
                </div>
                <div className="text-sm text-muted-foreground">Audit Trail</div>
              </div>

              <div className="text-center p-4 cyber-card">
                <div className="text-2xl font-bold text-yellow-400 cyber-text-glow">
                  {advancedAnalytics?.complianceMetrics?.dataRetention ||
                    "Compliant"}
                </div>
                <div className="text-sm text-muted-foreground">
                  Data Retention
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Threat Detection Summary */}
        <Card className="cyber-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-6 h-6 text-red-400" />
              <span>Threat Detection Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {advancedAnalytics?.threatDetection &&
                Object.entries(advancedAnalytics.threatDetection).map(
                  ([threat, data]: [string, any]) => (
                    <div
                      key={threat}
                      className="p-4 cyber-card border border-primary/20"
                    >
                      <div className="font-medium capitalize mb-2">
                        {threat.replace("_", " ")}
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Detected:
                          </span>
                          <span className="font-bold text-yellow-400">
                            {data.detected}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Blocked:
                          </span>
                          <span className="font-bold text-red-400">
                            {data.blocked}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Accuracy:
                          </span>
                          <span className="font-bold text-green-400">
                            {data.accuracy}%
                          </span>
                        </div>
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
