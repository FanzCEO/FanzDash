import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Brain,
  Eye,
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  FileCheck,
  Users,
  Zap,
  Filter,
} from "lucide-react";
import { ComplianceGuard } from "./ComplianceGuard";
import { FilterableContentGrid } from "./FilterableContentGrid";

interface ContentItem {
  id: string;
  type: "image" | "video" | "text" | "live_stream";
  title: string;
  creator: string;
  coStars: string[];
  uploadedAt: string;
  aiAnalysis?: {
    gpt5_score: number;
    gpt4o_vision_score: number;
    compliance_risk: "low" | "medium" | "high" | "critical";
    flags: string[];
    confidence: number;
  };
  moderationStatus: "pending" | "approved" | "rejected" | "requires_review";
  auditTrail: AuditEntry[];
}

interface AuditEntry {
  timestamp: string;
  action: string;
  moderator: string;
  reason: string;
  complianceChecks: any;
}

// AI-powered intelligent moderation based on Fanz Foundation compliance requirements
export function IntelligentModerationWorkflow() {
  const [contentQueue, setContentQueue] = useState<ContentItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showComplianceGuard, setShowComplianceGuard] = useState(false);
  const [showFilteredView, setShowFilteredView] = useState(false);

  // Mock content queue with AI analysis results
  useEffect(() => {
    const mockContent: ContentItem[] = [
      {
        id: "content-1",
        type: "image",
        title: "Summer Beach Photo Set",
        creator: "beachbabe2025",
        coStars: ["sunsetlover", "wavecatcher"],
        uploadedAt: "2025-01-04T19:30:00Z",
        aiAnalysis: {
          gpt5_score: 85,
          gpt4o_vision_score: 92,
          compliance_risk: "medium",
          flags: ["co-star-verification-required", "manual-review-needed"],
          confidence: 87,
        },
        moderationStatus: "requires_review",
        auditTrail: [],
      },
      {
        id: "content-2",
        type: "video",
        title: "Workout Session #45",
        creator: "fitnessguru",
        coStars: [],
        uploadedAt: "2025-01-04T18:45:00Z",
        aiAnalysis: {
          gpt5_score: 95,
          gpt4o_vision_score: 98,
          compliance_risk: "low",
          flags: ["age-verification-confirmed"],
          confidence: 94,
        },
        moderationStatus: "pending",
        auditTrail: [],
      },
      {
        id: "content-3",
        type: "live_stream",
        title: "Live Q&A with Fans",
        creator: "chattystar",
        coStars: ["guesthost"],
        uploadedAt: "2025-01-04T20:00:00Z",
        aiAnalysis: {
          gpt5_score: 78,
          gpt4o_vision_score: 82,
          compliance_risk: "high",
          flags: [
            "unverified-co-star",
            "2257-forms-missing",
            "content-policy-violation",
          ],
          confidence: 91,
        },
        moderationStatus: "requires_review",
        auditTrail: [],
      },
    ];
    setContentQueue(mockContent);
  }, []);

  const runAIAnalysis = async (item: ContentItem) => {
    setIsAnalyzing(true);
    setSelectedItem(item);

    // Simulate AI analysis process based on knowledge base requirements
    setTimeout(() => {
      const updatedItem = {
        ...item,
        aiAnalysis: {
          ...item.aiAnalysis!,
          gpt5_score: Math.floor(Math.random() * 100),
          gpt4o_vision_score: Math.floor(Math.random() * 100),
          confidence: Math.floor(Math.random() * 100),
        },
      };
      setSelectedItem(updatedItem);
      setIsAnalyzing(false);
    }, 3000);
  };

  const handleApproval = (reason: string, evidence: any) => {
    if (!selectedItem) return;

    const auditEntry: AuditEntry = {
      timestamp: new Date().toISOString(),
      action: "APPROVED",
      moderator: "current_moderator", // Would come from auth context
      reason,
      complianceChecks: evidence.compliance_checks,
    };

    const updatedItem = {
      ...selectedItem,
      moderationStatus: "approved" as const,
      auditTrail: [...selectedItem.auditTrail, auditEntry],
    };

    setContentQueue((prev) =>
      prev.map((item) => (item.id === selectedItem.id ? updatedItem : item)),
    );
    setSelectedItem(null);
    setShowComplianceGuard(false);
  };

  const handleRejection = (reason: string) => {
    if (!selectedItem) return;

    const auditEntry: AuditEntry = {
      timestamp: new Date().toISOString(),
      action: "REJECTED",
      moderator: "current_moderator",
      reason,
      complianceChecks: {},
    };

    const updatedItem = {
      ...selectedItem,
      moderationStatus: "rejected" as const,
      auditTrail: [...selectedItem.auditTrail, auditEntry],
    };

    setContentQueue((prev) =>
      prev.map((item) => (item.id === selectedItem.id ? updatedItem : item)),
    );
    setSelectedItem(null);
    setShowComplianceGuard(false);
  };

  const getComplianceColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "text-green-400 border-green-400";
      case "medium":
        return "text-yellow-400 border-yellow-400";
      case "high":
        return "text-orange-400 border-orange-400";
      case "critical":
        return "text-red-400 border-red-400";
      default:
        return "text-gray-400 border-gray-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-400" />;
      case "requires_review":
        return <AlertTriangle className="w-4 h-4 text-orange-400" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-400" />;
    }
  };

  // Convert ContentItems to FilterableItems for the grid
  const convertToFilterableItems = (items: ContentItem[]) => {
    return items.map((item) => ({
      id: item.id,
      title: item.title,
      type: item.type,
      status: item.moderationStatus,
      priority:
        item.aiAnalysis?.compliance_risk === "critical"
          ? "Critical"
          : item.aiAnalysis?.compliance_risk === "high"
            ? "High"
            : item.aiAnalysis?.compliance_risk === "medium"
              ? "Medium"
              : "Low",
      creator: item.creator,
      assignedTo: "AI System",
      tags: [
        ...(item.coStars || []),
        ...(item.aiAnalysis?.flags || []),
        item.aiAnalysis?.compliance_risk || "unknown",
      ],
      metadata: {
        contentType: item.type,
        moderationStatus: item.moderationStatus,
        complianceRisk: item.aiAnalysis?.compliance_risk,
        hasCoStars: item.coStars && item.coStars.length > 0,
        verified2257: !item.aiAnalysis?.flags?.includes("2257-forms-missing"),
        flagged: item.aiAnalysis?.flags && item.aiAnalysis.flags.length > 0,
        aiConfidence: item.aiAnalysis?.confidence,
        gpt5Score: item.aiAnalysis?.gpt5_score,
        gpt4oScore: item.aiAnalysis?.gpt4o_vision_score,
      },
      createdAt: item.uploadedAt,
      updatedAt: item.uploadedAt,
    }));
  };

  const filterableItems = convertToFilterableItems(contentQueue);

  const handleItemSelect = (item: any) => {
    const originalItem = contentQueue.find((c) => c.id === item.id);
    if (originalItem) {
      setSelectedItem(originalItem);
    }
  };

  const handleItemAction = (action: string, item: any) => {
    const originalItem = contentQueue.find((c) => c.id === item.id);
    if (originalItem) {
      if (action === "view") {
        runAIAnalysis(originalItem);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-cyan-400">
            Intelligent Moderation Workflow
          </h2>
          <p className="text-gray-400 mt-1">
            AI-powered content review with 18 U.S.C. § 2257 compliance
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant={showFilteredView ? "default" : "outline"}
            onClick={() => setShowFilteredView(!showFilteredView)}
            className="bg-cyan-600 hover:bg-cyan-700"
          >
            <Filter className="w-4 h-4 mr-2" />
            {showFilteredView ? "Grid View" : "Filter View"}
          </Button>
          <Badge variant="outline" className="text-cyan-400 border-cyan-400">
            {
              contentQueue.filter((item) => item.moderationStatus === "pending")
                .length
            }{" "}
            Pending Review
          </Badge>
          <Badge
            variant="outline"
            className="text-orange-400 border-orange-400"
          >
            {
              contentQueue.filter(
                (item) => item.moderationStatus === "requires_review",
              ).length
            }{" "}
            Action Required
          </Badge>
        </div>
      </div>

      {/* Filterable Grid View */}
      {showFilteredView ? (
        <FilterableContentGrid
          category="media-content"
          items={filterableItems}
          onItemSelect={handleItemSelect}
          onItemAction={handleItemAction}
        />
      ) : (
        /* Original Content Queue */
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {contentQueue.map((item) => (
            <Card
              key={item.id}
              className="bg-black/40 border-primary/20 cyber-border"
              data-testid={`content-card-${item.id}`}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-white text-lg">
                      {item.title}
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      by {item.creator} • {item.type.toUpperCase()}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(item.moderationStatus)}
                    <Badge
                      variant="outline"
                      className={`text-xs ${getComplianceColor(item.aiAnalysis?.compliance_risk || "low")}`}
                    >
                      {item.aiAnalysis?.compliance_risk?.toUpperCase() ||
                        "PENDING"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* AI Analysis Results */}
                {item.aiAnalysis && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-2 rounded border border-primary/20 bg-black/30">
                        <p className="text-xs text-gray-400">GPT-5 Score</p>
                        <p className="text-sm font-bold text-white">
                          {item.aiAnalysis.gpt5_score}%
                        </p>
                      </div>
                      <div className="text-center p-2 rounded border border-primary/20 bg-black/30">
                        <p className="text-xs text-gray-400">Vision Score</p>
                        <p className="text-sm font-bold text-white">
                          {item.aiAnalysis.gpt4o_vision_score}%
                        </p>
                      </div>
                    </div>

                    {/* AI Confidence */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">AI Confidence</span>
                        <span className="text-white">
                          {item.aiAnalysis.confidence}%
                        </span>
                      </div>
                      <Progress
                        value={item.aiAnalysis.confidence}
                        className="h-2"
                      />
                    </div>

                    {/* Compliance Flags */}
                    {item.aiAnalysis.flags.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-yellow-400">
                          Compliance Flags:
                        </p>
                        <div className="space-y-1">
                          {item.aiAnalysis.flags.map((flag, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 text-xs"
                            >
                              <AlertTriangle className="w-3 h-3 text-yellow-500" />
                              <span className="text-yellow-300">
                                {flag.replace(/-/g, " ").toUpperCase()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Co-Stars */}
                {item.coStars.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-white mb-2">
                      Co-Stars ({item.coStars.length}):
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {item.coStars.map((coStar) => (
                        <Badge
                          key={coStar}
                          variant="outline"
                          className="text-xs text-cyan-400 border-cyan-400"
                        >
                          {coStar}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => runAIAnalysis(item)}
                    disabled={isAnalyzing}
                    className="flex-1"
                    data-testid={`button-analyze-${item.id}`}
                  >
                    <Brain className="w-4 h-4 mr-1" />
                    {isAnalyzing && selectedItem?.id === item.id
                      ? "Analyzing..."
                      : "Re-Analyze"}
                  </Button>

                  {item.moderationStatus !== "approved" && (
                    <ComplianceGuard
                      action={`Content Approval: ${item.title}`}
                      contentType="post"
                      requiredRole="MODERATOR"
                      requiresSuperAdmin={
                        item.aiAnalysis?.compliance_risk === "critical"
                      }
                      onApprove={handleApproval}
                      onReject={handleRejection}
                    >
                      <Button
                        size="sm"
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        data-testid={`button-review-${item.id}`}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Review
                      </Button>
                    </ComplianceGuard>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* AI Analysis Modal */}
      {selectedItem && isAnalyzing && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-black/90 border-primary/20">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Brain className="w-6 h-6 text-cyan-400 animate-pulse" />
                <div>
                  <CardTitle className="text-cyan-400">
                    AI Analysis in Progress
                  </CardTitle>
                  <CardDescription>
                    Processing content through ChatGPT-4o/GPT-5
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Content Analysis</span>
                  <span className="text-cyan-400">Processing...</span>
                </div>
                <Progress value={33} className="h-2" />

                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">2257 Compliance Check</span>
                  <span className="text-cyan-400">Processing...</span>
                </div>
                <Progress value={66} className="h-2" />

                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Risk Assessment</span>
                  <span className="text-cyan-400">Processing...</span>
                </div>
                <Progress value={90} className="h-2" />
              </div>

              <Alert className="border-cyan-500/50 bg-cyan-500/10">
                <Zap className="h-4 w-4 text-cyan-500" />
                <AlertDescription className="text-cyan-300 text-sm">
                  AI models are analyzing content for compliance with platform
                  policies and legal requirements.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
