import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Crown,
  Verified,
  Gift,
  Coins,
  Heart,
  MoreHorizontal,
  Flag,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface LiveCommentProps {
  id: string;
  username: string;
  avatar?: string;
  isVerified?: boolean;
  isCreator?: boolean;
  isSubscriber?: boolean;
  comment: string;
  hasJoined?: boolean;
  tip?: {
    amount: number;
    currency: string;
  };
  gift?: {
    id: string;
    name: string;
    image: string;
    value: number;
  };
  timestamp: string;
  onDelete?: (commentId: string) => void;
  onReport?: (commentId: string) => void;
  onTip?: (username: string) => void;
  isCurrentUser?: boolean;
  className?: string;
}

export function LiveComment({
  id,
  username,
  avatar,
  isVerified = false,
  isCreator = false,
  isSubscriber = false,
  comment,
  hasJoined = false,
  tip,
  gift,
  timestamp,
  onDelete,
  onReport,
  onTip,
  isCurrentUser = false,
  className = "",
}: LiveCommentProps) {
  const timeAgo = formatDistanceToNow(new Date(timestamp), { addSuffix: true });

  return (
    <div
      className={`flex space-x-3 p-3 hover:bg-muted/50 ${className}`}
      data-comment-id={id}
    >
      {/* Avatar */}
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarImage src={avatar} />
        <AvatarFallback className="text-xs">
          {username.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      {/* Comment Content */}
      <div className="flex-1 min-w-0">
        {/* Username and badges */}
        <div className="flex items-center space-x-2 mb-1">
          <span className="font-semibold text-sm truncate">{username}</span>

          {/* Creator badge */}
          {isCreator && (
            <Badge variant="default" className="text-xs bg-green-600">
              <Crown className="h-3 w-3 mr-1" />
              Creator
            </Badge>
          )}

          {/* Subscriber badge */}
          {isSubscriber && !isCreator && (
            <Badge variant="outline" className="text-xs">
              <Heart className="h-3 w-3 mr-1" />
              Subscriber
            </Badge>
          )}

          {/* Verified badge */}
          {isVerified && !isCreator && (
            <Verified className="h-4 w-4 text-blue-500 fill-current" />
          )}

          {/* Timestamp */}
          <span className="text-xs text-muted-foreground">{timeAgo}</span>
        </div>

        {/* Comment text */}
        <div className="text-sm mb-2">
          {comment}

          {/* Join notification */}
          {hasJoined && (
            <span className="text-green-600 font-medium">
              {isCurrentUser ? " (You have joined)" : " (has joined)"}
            </span>
          )}
        </div>

        {/* Tip display */}
        {tip && (
          <div className="mb-2">
            <Badge className="bg-green-100 text-green-800 border-green-300">
              <Coins className="h-3 w-3 mr-1" />
              Tipped {tip.currency}
              {tip.amount}
            </Badge>
          </div>
        )}

        {/* Gift display */}
        {gift && (
          <div className="mb-2">
            <div className="flex items-center space-x-2 p-2 bg-purple-50 rounded-lg border border-purple-200">
              <img
                src={gift.image}
                alt={gift.name}
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/api/placeholder/32/32";
                }}
              />
              <div>
                <div className="flex items-center space-x-1">
                  <Gift className="h-3 w-3 text-purple-600" />
                  <span className="text-xs font-medium text-purple-800">
                    Sent {gift.name}
                  </span>
                </div>
                <span className="text-xs text-purple-600">
                  Value: ${gift.value}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center space-x-2">
          {!isCurrentUser && onTip && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onTip(username)}
              className="h-6 px-2 text-xs"
            >
              <Coins className="h-3 w-3 mr-1" />
              Tip
            </Button>
          )}

          {!isCurrentUser && onReport && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onReport(id)}
              className="h-6 px-2 text-xs text-muted-foreground hover:text-red-600"
            >
              <Flag className="h-3 w-3" />
            </Button>
          )}

          {isCurrentUser && onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(id)}
              className="h-6 px-2 text-xs text-muted-foreground hover:text-red-600"
            >
              Delete
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default LiveComment;
