import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  AlertTriangle,
  User,
  Calendar,
  FileText,
  Shield,
  Edit3,
} from "lucide-react";

interface ContentItem {
  id: string;
  type: "image" | "video" | "text" | "live_stream";
  contentUrl?: string;
  textContent?: string;
  status: "pending" | "approved" | "rejected" | "needs_editing";
  riskScore: number;
  uploadedBy: string;
  uploadedAt: string;
  moderatorNotes?: string;
  lastReviewedBy?: string;
  lastReviewedAt?: string;
}

interface ModerationAction {
  contentId: string;
  action: "approve" | "reject" | "hold" | "request_edit";
  reason: string;
  moderatorNotes?: string;
}

export function ReviewQueue() {
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(
    null,
  );
  const [actionReason, setActionReason] = useState("");
  const [moderatorNotes, setModeratorNotes] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("pending");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: pendingContent = [], isLoading } = useQuery<ContentItem[]>({
    queryKey: ["/api/content/pending"],
    refetchInterval: 3000,
  });

  const { data: allContent = [] } = useQuery<ContentItem[]>({
    queryKey: ["/api/content/all"],
  });

  const moderationMutation = useMutation({
    mutationFn: async (action: ModerationAction) => {
      return apiRequest(`/api/content/${action.contentId}/moderate`, {
        method: "POST",
        body: JSON.stringify(action),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/content/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/content/all"] });
      toast({
        title: "Action Completed",
        description: "Content moderation action has been recorded.",
      });
      setSelectedContent(null);
      setActionReason("");
      setModeratorNotes("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleModerationAction = (
    action: "approve" | "reject" | "hold" | "request_edit",
  ) => {
    if (!selectedContent || !actionReason.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a reason for this action.",
        variant: "destructive",
      });
      return;
    }

    moderationMutation.mutate({
      contentId: selectedContent.id,
      action,
      reason: actionReason,
      moderatorNotes: moderatorNotes.trim() || undefined,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-secondary text-secondary-foreground";
      case "rejected":
        return "bg-destructive text-destructive-foreground";
      case "pending":
        return "bg-accent text-accent-foreground";
      case "needs_editing":
        return "bg-primary text-primary-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 0.8) return "text-destructive";
    if (score >= 0.6) return "text-accent";
    if (score >= 0.4) return "text-primary";
    return "text-secondary";
  };

  const displayContent =
    filterStatus === "all"
      ? allContent
      : allContent.filter((item) => item.status === filterStatus);

  if (isLoading) {
    return (
      <Card className="cyber-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="w-5 h-5" />
            <span>Review Queue</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-4 border border-border/30 rounded-lg animate-pulse"
              >
                <div className="h-4 bg-muted/30 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted/20 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="cyber-card neural-network">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Eye className="w-5 h-5 text-primary cyber-pulse" />
            <span className="cyber-text-glow">REVIEW QUEUE</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40 glass-effect">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="needs_editing">Needs Editing</SelectItem>
                <SelectItem value="all">All Content</SelectItem>
              </SelectContent>
            </Select>
            <Badge variant="outline" className="font-mono">
              {displayContent.length} items
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {displayContent.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No content matching current filter</p>
            </div>
          ) : (
            displayContent.map((item) => (
              <div
                key={item.id}
                className="p-4 border border-border/30 rounded-lg glass-effect hover:bg-primary/5 transition-all duration-300"
                data-testid={`content-item-${item.id}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {item.type === "image" && (
                        <FileText className="w-5 h-5 text-primary" />
                      )}
                      {item.type === "video" && (
                        <FileText className="w-5 h-5 text-secondary" />
                      )}
                      {item.type === "text" && (
                        <FileText className="w-5 h-5 text-accent" />
                      )}
                      {item.type === "live_stream" && (
                        <FileText className="w-5 h-5 text-destructive" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-mono text-sm">ID: {item.id}</span>
                        <Badge className={getStatusColor(item.status)}>
                          {item.status.replace("_", " ").toUpperCase()}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Risk Score:{" "}
                        <span className={getRiskColor(item.riskScore)}>
                          {(item.riskScore * 100).toFixed(1)}%
                        </span>
                        {" • "}
                        <User className="w-3 h-3 inline mr-1" />
                        {item.uploadedBy}
                        {" • "}
                        <Calendar className="w-3 h-3 inline mr-1" />
                        {new Date(item.uploadedAt).toLocaleDateString()}
                      </div>
                      {item.lastReviewedBy && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Last reviewed by {item.lastReviewedBy} on{" "}
                          {new Date(item.lastReviewedAt!).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedContent(item)}
                        className="neon-button"
                        data-testid={`review-button-${item.id}`}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Review
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl cyber-card">
                      <DialogHeader>
                        <DialogTitle className="flex items-center space-x-2 cyber-text-glow">
                          <Shield className="w-5 h-5 text-primary" />
                          <span>Content Review - {selectedContent?.id}</span>
                        </DialogTitle>
                      </DialogHeader>

                      {selectedContent && (
                        <div className="space-y-6">
                          {/* Content Preview */}
                          <div className="space-y-3">
                            <h4 className="font-semibold">Content Preview</h4>
                            <div className="p-4 bg-muted/20 rounded-lg">
                              {selectedContent.type === "text" ? (
                                <p className="whitespace-pre-wrap">
                                  {selectedContent.textContent}
                                </p>
                              ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                  <FileText className="w-16 h-16 mx-auto mb-2 opacity-50" />
                                  <p>
                                    {selectedContent.type.toUpperCase()} Content
                                  </p>
                                  {selectedContent.contentUrl && (
                                    <p className="text-xs font-mono mt-1">
                                      {selectedContent.contentUrl}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Content Details */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium">
                                Risk Score
                              </label>
                              <div
                                className={`text-lg font-bold ${getRiskColor(selectedContent.riskScore)}`}
                              >
                                {(selectedContent.riskScore * 100).toFixed(1)}%
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-medium">
                                Content Type
                              </label>
                              <div className="text-lg font-semibold capitalize">
                                {selectedContent.type.replace("_", " ")}
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-medium">
                                Uploaded By
                              </label>
                              <div className="font-mono">
                                {selectedContent.uploadedBy}
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-medium">
                                Upload Date
                              </label>
                              <div>
                                {new Date(
                                  selectedContent.uploadedAt,
                                ).toLocaleString()}
                              </div>
                            </div>
                          </div>

                          {/* Action Reason */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium">
                              Action Reason *
                            </label>
                            <Textarea
                              value={actionReason}
                              onChange={(e) => setActionReason(e.target.value)}
                              placeholder="Provide a detailed reason for your moderation decision..."
                              className="min-h-20"
                              data-testid="action-reason-input"
                            />
                          </div>

                          {/* Moderator Notes */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium">
                              Additional Notes
                            </label>
                            <Textarea
                              value={moderatorNotes}
                              onChange={(e) =>
                                setModeratorNotes(e.target.value)
                              }
                              placeholder="Optional: Add any additional notes or instructions..."
                              className="min-h-16"
                              data-testid="moderator-notes-input"
                            />
                          </div>

                          {/* Action Buttons */}
                          <div className="flex justify-end space-x-3 pt-4 border-t border-border/30">
                            <Button
                              variant="outline"
                              onClick={() => handleModerationAction("hold")}
                              disabled={moderationMutation.isPending}
                              className="glass-effect"
                              data-testid="button-hold"
                            >
                              <Clock className="w-4 h-4 mr-2" />
                              Hold for Review
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() =>
                                handleModerationAction("request_edit")
                              }
                              disabled={moderationMutation.isPending}
                              className="glass-effect"
                              data-testid="button-request-edit"
                            >
                              <Edit3 className="w-4 h-4 mr-2" />
                              Request Edit
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => handleModerationAction("reject")}
                              disabled={moderationMutation.isPending}
                              data-testid="button-reject"
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Reject
                            </Button>
                            <Button
                              onClick={() => handleModerationAction("approve")}
                              disabled={moderationMutation.isPending}
                              className="neon-button"
                              data-testid="button-approve"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approve
                            </Button>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
