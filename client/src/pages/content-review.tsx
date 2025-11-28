import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Eye,
  CheckCircle,
  XCircle,
  Edit,
  Clock,
  AlertTriangle,
  Filter,
  Search,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function ContentReviewPage() {
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: pendingContent, isLoading } = useQuery({
    queryKey: ["/api/content/pending"],
    refetchInterval: 3000,
  });

  const moderateContentMutation = useMutation({
    mutationFn: async ({
      contentId,
      action,
      reason,
    }: {
      contentId: string;
      action: string;
      reason: string;
    }) => {
      return apiRequest(`/api/content/${contentId}/status`, "PUT", {
        status: action,
        moderatorId: "current-user",
        reason,
      });
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Content Moderated",
        description: `Content ${variables.action} successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/content/pending"] });
    },
  });

  const moderateContent = (
    contentId: string,
    action: string,
    reason?: string,
  ) => {
    moderateContentMutation.mutate({
      contentId,
      action,
      reason: reason || `Content ${action} by moderator`,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            Pending Review
          </Badge>
        );
      case "approved":
        return (
          <Badge variant="default">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      case "needs_editing":
        return (
          <Badge variant="outline">
            <Edit className="w-3 h-3 mr-1" />
            Needs Editing
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getRiskColor = (riskScore: number) => {
    if (riskScore > 0.7) return "text-red-500";
    if (riskScore > 0.4) return "text-yellow-500";
    return "text-green-500";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen cyber-bg flex items-center justify-center">
        <div className="text-center">
          <Eye className="w-16 h-16 mx-auto mb-4 cyber-pulse text-primary" />
          <p className="cyber-text-glow">Loading Content Review Queue...</p>
        </div>
      </div>
    );
  }

  const mockContent = [
    {
      id: "content-001",
      type: "image",
      status: "pending",
      riskScore: 0.85,
      uploadedBy: "user_12847",
      platform: "FanzMain Adult",
      createdAt: new Date().toISOString(),
      aiAnalysis: {
        flaggedContent: ["explicit_content", "nudity"],
        confidence: 0.92,
      },
      contentUrl: "https://via.placeholder.com/300x200?text=Content+Preview",
    },
    {
      id: "content-002",
      type: "video",
      status: "pending",
      riskScore: 0.45,
      uploadedBy: "user_98765",
      platform: "FanzLive Streaming",
      createdAt: new Date(Date.now() - 300000).toISOString(),
      aiAnalysis: {
        flaggedContent: ["potential_violence"],
        confidence: 0.67,
      },
      contentUrl: "https://via.placeholder.com/300x200?text=Video+Preview",
    },
    {
      id: "content-003",
      type: "text",
      status: "pending",
      riskScore: 0.15,
      uploadedBy: "user_55443",
      platform: "FanzSocial Community",
      createdAt: new Date(Date.now() - 600000).toISOString(),
      textContent:
        "This is a sample text message that needs moderation review...",
      aiAnalysis: {
        flaggedContent: [],
        confidence: 0.88,
      },
    },
  ];

  return (
    <div className="min-h-screen cyber-bg">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold cyber-text-glow">
              Content Review
            </h1>
            <p className="text-muted-foreground">Manual Approval Workflows</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Content</SelectItem>
                  <SelectItem value="high_risk">High Risk</SelectItem>
                  <SelectItem value="medium_risk">Medium Risk</SelectItem>
                  <SelectItem value="pending">Pending Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4" />
              <Input
                placeholder="Search content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-48"
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="cyber-card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-400 cyber-text-glow">
                23
              </div>
              <div className="text-sm text-muted-foreground">
                Pending Review
              </div>
            </CardContent>
          </Card>
          <Card className="cyber-card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-400 cyber-text-glow">
                7
              </div>
              <div className="text-sm text-muted-foreground">High Risk</div>
            </CardContent>
          </Card>
          <Card className="cyber-card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-400 cyber-text-glow">
                156
              </div>
              <div className="text-sm text-muted-foreground">
                Approved Today
              </div>
            </CardContent>
          </Card>
          <Card className="cyber-card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary cyber-text-glow">
                2.3m
              </div>
              <div className="text-sm text-muted-foreground">
                Avg Review Time
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Review Queue */}
        <Card className="cyber-card neural-network">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="w-6 h-6 text-primary cyber-pulse" />
              <span className="cyber-text-glow">CONTENT REVIEW QUEUE</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockContent.map((content) => (
                <div
                  key={content.id}
                  className="p-6 cyber-card border border-primary/20"
                >
                  <div className="flex items-start justify-between space-x-6">
                    {/* Content Preview */}
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
                        {content.type === "image" && (
                          <img
                            src={content.contentUrl}
                            alt="Content"
                            className="w-full h-full object-cover rounded-lg"
                          />
                        )}
                        {content.type === "video" && (
                          <img
                            src={content.contentUrl}
                            alt="Video"
                            className="w-full h-full object-cover rounded-lg"
                          />
                        )}
                        {content.type === "text" && (
                          <div className="text-xs p-2 text-center">TEXT</div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant="outline">
                            {content.type.toUpperCase()}
                          </Badge>
                          {getStatusBadge(content.status)}
                          <Badge variant="secondary">{content.platform}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">
                          Uploaded by {content.uploadedBy} •{" "}
                          {new Date(content.createdAt).toLocaleString()}
                        </div>
                        {content.textContent && (
                          <div className="text-sm bg-muted p-2 rounded mb-2">
                            {content.textContent}
                          </div>
                        )}
                        <div className="flex items-center space-x-4 text-xs">
                          <span>
                            Risk Score:{" "}
                            <span
                              className={`font-bold ${getRiskColor(content.riskScore)}`}
                            >
                              {(content.riskScore * 100).toFixed(1)}%
                            </span>
                          </span>
                          <span>
                            AI Confidence:{" "}
                            {(content.aiAnalysis.confidence * 100).toFixed(1)}%
                          </span>
                          {content.aiAnalysis.flaggedContent.length > 0 && (
                            <div className="flex items-center space-x-1">
                              <AlertTriangle className="w-3 h-3 text-yellow-500" />
                              <span>
                                {content.aiAnalysis.flaggedContent.join(", ")}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        onClick={() => moderateContent(content.id, "approved")}
                        className="bg-green-600 hover:bg-green-700"
                        data-testid={`approve-${content.id}`}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          moderateContent(
                            content.id,
                            "needs_editing",
                            "Requires content editing",
                          )
                        }
                        data-testid={`edit-${content.id}`}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Send Back
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() =>
                          moderateContent(
                            content.id,
                            "rejected",
                            "Content violates platform guidelines",
                          )
                        }
                        data-testid={`reject-${content.id}`}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Block
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
