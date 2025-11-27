import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import type { LiveStream } from "@/types/moderation";

export function LiveStreamPanel() {
  const { data: streams = [], isLoading } = useQuery({
    queryKey: ["/api/live-streams"],
  });

  const handleReviewStream = async (streamId: string) => {
    try {
      await apiRequest(`/api/live-streams/${streamId}`, "PUT", {
        status: "under_review",
      });
    } catch (error) {
      console.error("Error updating stream:", error);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Live Stream Monitoring</span>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Real-time</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  <div className="aspect-video bg-gray-200"></div>
                  <div className="p-3 space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Live Stream Monitoring</span>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">Real-time</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {streams.map((stream: LiveStream) => (
            <div
              key={stream.id}
              className="border border-gray-200 rounded-lg overflow-hidden"
              data-testid={`stream-${stream.id}`}
            >
              <div className="relative">
                <div className="aspect-video bg-gray-900 relative">
                  {/* Stream preview */}
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-400 to-purple-600 opacity-20"></div>
                  {stream.autoBlurEnabled && (
                    <div className="absolute inset-4 bg-white rounded-lg opacity-80 blur-sm"></div>
                  )}
                  <div className="absolute top-2 left-2">
                    <Badge variant="destructive" className="text-xs">
                      LIVE
                    </Badge>
                  </div>
                  <div className="absolute top-2 right-2">
                    <Badge
                      variant={
                        stream.riskLevel === "high"
                          ? "destructive"
                          : stream.riskLevel === "medium"
                            ? "secondary"
                            : "default"
                      }
                      className="text-xs"
                    >
                      {stream.autoBlurEnabled
                        ? "AUTO-BLUR"
                        : stream.riskLevel?.toUpperCase() || "CLEAN"}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-900">
                    {stream.title || `Stream #${stream.streamKey.slice(-4)}`}
                  </h4>
                  <span className="text-xs text-gray-500">
                    {stream.viewers || 0} viewers
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span
                    className={`font-medium ${
                      stream.riskLevel === "high"
                        ? "text-red-600"
                        : stream.riskLevel === "medium"
                          ? "text-yellow-600"
                          : "text-green-600"
                    }`}
                  >
                    Risk:{" "}
                    {stream.riskLevel === "high"
                      ? "High"
                      : stream.riskLevel === "medium"
                        ? "Medium"
                        : "Low"}
                    {stream.lastRiskScore &&
                      ` (${parseFloat(stream.lastRiskScore).toFixed(2)})`}
                  </span>
                  {stream.riskLevel !== "low" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReviewStream(stream.id)}
                      data-testid={`review-stream-${stream.id}`}
                    >
                      Review
                    </Button>
                  ) : (
                    <span className="text-gray-400">Auto-approved</span>
                  )}
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  {stream.riskLevel === "high"
                    ? "NudeNet: High-risk content detected"
                    : "NudeNet: Clean frames detected"}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
