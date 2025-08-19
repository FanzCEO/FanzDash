import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { ContentItem } from "@/types/moderation";

export function ReviewQueue() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: content = [], isLoading } = useQuery({
    queryKey: ["/api/content/pending"],
  });

  const moderateContentMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await apiRequest("PUT", `/api/content/${id}/status`, { 
        status, 
        moderatorId: "mod_123" // In real app, get from auth context
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/content/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Content moderated",
        description: "The content status has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to moderate content. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleApprove = (id: string) => {
    moderateContentMutation.mutate({ id, status: "approved" });
  };

  const handleReject = (id: string) => {
    moderateContentMutation.mutate({ id, status: "rejected" });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Priority Review Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start space-x-3 p-4">
                <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Priority Review Queue</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-200">
          {content.map((item: ContentItem) => (
            <div key={item.id} className="p-4 hover:bg-gray-50" data-testid={`review-item-${item.id}`}>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg relative overflow-hidden">
                    {item.type === "image" || item.type === "video" ? (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-br from-pink-300 to-purple-400 opacity-60 blur-sm"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <i className="fas fa-eye-slash text-gray-600 text-lg"></i>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <i className="fas fa-comment text-gray-500"></i>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <Badge variant={item.type === "text" ? "default" : "secondary"}>
                      {item.type.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {item.createdAt ? new Date(item.createdAt).toLocaleString() : "Recently"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-900 mt-1">
                    {item.type === "text" ? "Toxicity detected" : `${item.type === "image" ? "NudeNet" : "Content"} analysis needed`}
                    {item.riskScore && ` - Risk: ${parseFloat(item.riskScore).toFixed(2)}`}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {item.type === "text" && item.content ? 
                      `"${item.content.slice(0, 60)}..."` : 
                      `User: ${item.userId || "Unknown"}`
                    }
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Button 
                      size="sm" 
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handleApprove(item.id)}
                      disabled={moderateContentMutation.isPending}
                      data-testid={`approve-${item.id}`}
                    >
                      Approve
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleReject(item.id)}
                      disabled={moderateContentMutation.isPending}
                      data-testid={`reject-${item.id}`}
                    >
                      Reject
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      data-testid={`details-${item.id}`}
                    >
                      Details
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
          <Button variant="ghost" className="w-full text-primary hover:text-primary/80">
            View All Pending Items
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
