import { useState } from "react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MessageCircle,
  MoreHorizontal,
  Edit,
  Trash2,
  Heart,
  RefreshCw,
  Verified,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Reply {
  id: string;
  userId: string;
  username: string;
  name: string;
  avatar?: string;
  isVerified: boolean;
  content: string;
  sticker?: string;
  gifImage?: string;
  createdAt: string;
  likesCount: number;
  isLikedByUser: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

interface CommentRepliesProps {
  commentId: string;
  replies: Reply[];
  totalReplies: number;
  currentUserId?: string;
  showReplies: boolean;
  isPostOwner: boolean;
  onLoadReplies: (commentId: string) => Promise<void>;
  onDeleteReply: (replyId: string) => Promise<void>;
  onLikeReply: (replyId: string) => Promise<void>;
  onReplyToComment: (commentId: string, username: string) => void;
  onEditReply: (replyId: string, content: string) => void;
  className?: string;
}

export function CommentReplies({
  commentId,
  replies,
  totalReplies,
  currentUserId,
  showReplies,
  isPostOwner,
  onLoadReplies,
  onDeleteReply,
  onLikeReply,
  onReplyToComment,
  onEditReply,
  className = "",
}: CommentRepliesProps) {
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);
  const [likingReplies, setLikingReplies] = useState<Set<string>>(new Set());

  const handleLoadReplies = async () => {
    setIsLoadingReplies(true);
    try {
      await onLoadReplies(commentId);
    } catch (error) {
      console.error("Failed to load replies:", error);
    } finally {
      setIsLoadingReplies(false);
    }
  };

  const handleLikeReply = async (replyId: string) => {
    if (likingReplies.has(replyId)) return;

    setLikingReplies((prev) => new Set(prev).add(replyId));
    try {
      await onLikeReply(replyId);
    } catch (error) {
      console.error("Failed to like reply:", error);
    } finally {
      setLikingReplies((prev) => {
        const newSet = new Set(prev);
        newSet.delete(replyId);
        return newSet;
      });
    }
  };

  return (
    <div className={className}>
      {/* Load Replies Button */}
      {!showReplies && totalReplies > 0 && (
        <div className="mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLoadReplies}
            disabled={isLoadingReplies}
            className="text-primary hover:text-primary/80"
            data-testid={`load-replies-${commentId}`}
          >
            {isLoadingReplies ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <div className="w-8 h-px bg-muted-foreground mr-2" />
                View Replies ({totalReplies})
              </>
            )}
          </Button>
        </div>
      )}

      {/* Replies List */}
      {showReplies && replies.length > 0 && (
        <div className="space-y-3 pl-5 border-l-2 border-muted ml-3">
          {replies.map((reply) => (
            <div
              key={reply.id}
              className="flex space-x-3"
              data-testid={`reply-${reply.id}`}
            >
              <Link href={`/${reply.username}`}>
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={reply.avatar} />
                  <AvatarFallback>
                    {(reply.name || reply.username).charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>

              <div className="flex-1 min-w-0">
                {/* Reply Header */}
                <div className="flex items-center space-x-2 mb-1">
                  <Link href={`/${reply.username}`}>
                    <h6 className="font-semibold text-sm hover:text-primary">
                      {reply.name || reply.username}
                    </h6>
                  </Link>

                  {reply.isVerified && (
                    <Verified className="h-3 w-3 text-blue-500 fill-current" />
                  )}

                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(reply.createdAt), {
                      addSuffix: true,
                    })}
                  </span>

                  {/* Reply Actions Menu */}
                  {(reply.canEdit || reply.canDelete || isPostOwner) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 ml-auto"
                        >
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {reply.canEdit && (
                          <DropdownMenuItem
                            onClick={() => onEditReply(reply.id, reply.content)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                        )}

                        {(reply.canDelete || isPostOwner) && (
                          <DropdownMenuItem
                            onClick={() => onDeleteReply(reply.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                {/* Reply Content */}
                <div className="space-y-2">
                  {reply.content && (
                    <p className="text-sm break-words">
                      <span
                        dangerouslySetInnerHTML={{ __html: reply.content }}
                      />
                    </p>
                  )}

                  {reply.sticker && (
                    <div>
                      <img
                        src={reply.sticker}
                        alt="Sticker"
                        className="max-w-16 rounded"
                      />
                    </div>
                  )}

                  {reply.gifImage && (
                    <div>
                      <img
                        src={reply.gifImage}
                        alt="GIF"
                        className="max-w-48 rounded"
                      />
                    </div>
                  )}
                </div>

                {/* Reply Actions */}
                <div className="flex items-center space-x-4 mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onReplyToComment(commentId, reply.username)}
                    className="text-xs text-muted-foreground hover:text-primary px-0"
                    data-testid={`reply-to-${reply.id}`}
                  >
                    Reply
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLikeReply(reply.id)}
                    disabled={likingReplies.has(reply.id)}
                    className={cn(
                      "px-0 text-xs",
                      reply.isLikedByUser
                        ? "text-red-500 hover:text-red-600"
                        : "text-muted-foreground hover:text-red-500",
                    )}
                    data-testid={`like-reply-${reply.id}`}
                  >
                    <Heart
                      className={cn(
                        "h-3 w-3 mr-1",
                        reply.isLikedByUser ? "fill-current" : "",
                      )}
                    />
                    {reply.likesCount > 0 && <span>{reply.likesCount}</span>}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CommentReplies;
