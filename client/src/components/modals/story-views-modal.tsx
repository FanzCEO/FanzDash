import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Eye, X, RefreshCw, Clock, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface StoryViewer {
  id: string;
  username: string;
  name: string;
  avatar?: string;
  isVerified: boolean;
  viewedAt: string;
  isSubscriber?: boolean;
}

interface StoryViewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  storyId: string;
  onLoadViewers: (storyId: string) => Promise<StoryViewer[]>;
  className?: string;
}

export function StoryViewsModal({
  isOpen,
  onClose,
  storyId,
  onLoadViewers,
  className = "",
}: StoryViewsModalProps) {
  const [viewers, setViewers] = useState<StoryViewer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && storyId) {
      loadViewers();
    }
  }, [isOpen, storyId]);

  const loadViewers = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const viewersData = await onLoadViewers(storyId);
      setViewers(viewersData);
    } catch (err) {
      setError("Failed to load story viewers");
      console.error("Error loading story viewers:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setViewers([]);
    setError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-primary" />
              <span>Story Views</span>
              {viewers.length > 0 && (
                <Badge variant="secondary">{viewers.length}</Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-6 w-6 p-0"
              data-testid="close-story-views"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-primary mb-2" />
              <p className="text-sm text-muted-foreground">
                Loading viewers...
              </p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-8">
              <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
                <X className="h-8 w-8 text-red-500" />
              </div>
              <p className="text-sm text-red-600 mb-3">{error}</p>
              <Button
                variant="outline"
                onClick={loadViewers}
                size="sm"
                data-testid="retry-load-viewers"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          )}

          {/* Viewers List */}
          {!isLoading && !error && viewers.length > 0 && (
            <ScrollArea className="max-h-80">
              <div className="space-y-2">
                {viewers.map((viewer) => (
                  <div
                    key={viewer.id}
                    className="flex items-center space-x-3 p-3 hover:bg-muted/50 rounded-lg transition-colors"
                    data-testid={`viewer-${viewer.id}`}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={viewer.avatar} />
                      <AvatarFallback>
                        {viewer.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h6 className="font-semibold text-sm truncate">
                          {viewer.name}
                        </h6>
                        {viewer.isVerified && (
                          <Badge
                            variant="secondary"
                            className="text-xs bg-blue-100 text-blue-600"
                          >
                            ✓
                          </Badge>
                        )}
                        {viewer.isSubscriber && (
                          <Badge variant="default" className="text-xs">
                            Subscriber
                          </Badge>
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground truncate">
                        @{viewer.username}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>
                          {formatDistanceToNow(new Date(viewer.viewedAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}

          {/* Empty State */}
          {!isLoading && !error && viewers.length === 0 && (
            <div className="text-center py-8">
              <div className="flex items-center justify-center w-16 h-16 bg-muted rounded-full mx-auto mb-4">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <h4 className="font-semibold mb-2">No Views Yet</h4>
              <p className="text-sm text-muted-foreground">
                Your story hasn't been viewed by anyone yet
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default StoryViewsModal;
