import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Heart,
  MessageCircle,
  MoreHorizontal,
  Edit,
  Trash2,
  Flag,
  Smile,
  Image as ImageIcon,
  Send,
  Verified,
  Reply,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Comment {
  id: string;
  userId: string;
  username: string;
  name: string;
  avatar?: string;
  isVerified: boolean;
  content: string;
  sticker?: string;
  gifImage?: string;
  likes: number;
  isLiked: boolean;
  createdAt: string;
  replies: Reply[];
  canEdit: boolean;
  canDelete: boolean;
}

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
  likes: number;
  isLiked: boolean;
  createdAt: string;
  canEdit: boolean;
  canDelete: boolean;
}

interface CommentSystemProps {
  postId: string;
  comments: Comment[];
  currentUser?: {
    id: string;
    username: string;
    name: string;
    avatar?: string;
    isVerified: boolean;
  };
  isCreator?: boolean;
  onAddComment?: (content: string, sticker?: string, gif?: string) => void;
  onAddReply?: (commentId: string, content: string, username: string) => void;
  onLikeComment?: (commentId: string, isReply?: boolean) => void;
  onEditComment?: (
    commentId: string,
    content: string,
    isReply?: boolean,
  ) => void;
  onDeleteComment?: (commentId: string, isReply?: boolean) => void;
  onReportComment?: (commentId: string, isReply?: boolean) => void;
  className?: string;
}

export function CommentSystem({
  postId,
  comments,
  currentUser,
  isCreator = false,
  onAddComment,
  onAddReply,
  onLikeComment,
  onEditComment,
  onDeleteComment,
  onReportComment,
  className = "",
}: CommentSystemProps) {
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [showEmojis, setShowEmojis] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Mock emoji data
  const emojis = [
    "😀",
    "😂",
    "😍",
    "👍",
    "❤️",
    "😢",
    "😮",
    "😡",
    "🔥",
    "💯",
    "🎉",
    "👏",
    "🙌",
    "💪",
    "🤔",
    "😎",
  ];

  const handleSubmitComment = () => {
    if (newComment.trim() && onAddComment) {
      onAddComment(newComment.trim());
      setNewComment("");
    }
  };

  const handleSubmitReply = (commentId: string, replyToUsername: string) => {
    if (replyContent.trim() && onAddReply) {
      onAddReply(commentId, replyContent.trim(), replyToUsername);
      setReplyContent("");
      setReplyingTo(null);
    }
  };

  const handleEditComment = (commentId: string) => {
    if (editContent.trim() && onEditComment) {
      onEditComment(commentId, editContent.trim());
      setEditingComment(null);
      setEditContent("");
    }
  };

  const startEdit = (commentId: string, currentContent: string) => {
    setEditingComment(commentId);
    setEditContent(currentContent);
  };

  const startReply = (commentId: string, username: string) => {
    setReplyingTo(commentId);
    setReplyContent(`@${username} `);
  };

  const insertEmoji = (emoji: string) => {
    if (replyingTo) {
      setReplyContent((prev) => prev + emoji);
    } else {
      setNewComment((prev) => prev + emoji);
    }
    setShowEmojis(false);
  };

  const CommentItem = ({
    comment,
    isReply = false,
  }: {
    comment: Comment | Reply;
    isReply?: boolean;
  }) => (
    <div
      className={`flex space-x-3 ${isReply ? "ml-12 mt-3" : "mb-4"}`}
      data-comment-id={comment.id}
    >
      <Avatar className="h-10 w-10 flex-shrink-0">
        <AvatarImage src={comment.avatar} />
        <AvatarFallback>{comment.name.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 mb-1">
          <span className="font-semibold text-sm">{comment.name}</span>
          {comment.isVerified && (
            <Verified className="h-4 w-4 text-blue-500 fill-current" />
          )}
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(comment.createdAt), {
              addSuffix: true,
            })}
          </span>
        </div>

        {editingComment === comment.id ? (
          <div className="space-y-2">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="min-h-[60px]"
              placeholder="Edit your comment..."
            />
            <div className="flex space-x-2">
              <Button size="sm" onClick={() => handleEditComment(comment.id)}>
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditingComment(null)}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="text-sm mb-2">
              <p className="break-words">{comment.content}</p>

              {comment.sticker && (
                <div className="mt-2">
                  <img
                    src={comment.sticker}
                    alt="Sticker"
                    className="w-16 h-16 object-contain"
                  />
                </div>
              )}

              {comment.gifImage && (
                <div className="mt-2">
                  <img
                    src={comment.gifImage}
                    alt="GIF"
                    className="max-w-48 rounded"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4 text-sm">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onLikeComment?.(comment.id, isReply)}
                className={`h-6 px-2 ${comment.isLiked ? "text-red-500" : "text-muted-foreground"}`}
              >
                <Heart
                  className={`h-3 w-3 mr-1 ${comment.isLiked ? "fill-current" : ""}`}
                />
                {comment.likes > 0 && comment.likes}
              </Button>

              {!isReply && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => startReply(comment.id, comment.username)}
                  className="h-6 px-2 text-muted-foreground"
                >
                  <Reply className="h-3 w-3 mr-1" />
                  Reply
                </Button>
              )}

              {(comment.canEdit ||
                comment.canDelete ||
                !currentUser ||
                currentUser.id !== comment.userId) && (
                <div className="relative">
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>

                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border py-1 z-50 hidden group-hover:block">
                    {comment.canEdit && (
                      <button
                        onClick={() => startEdit(comment.id, comment.content)}
                        className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100"
                      >
                        <Edit className="h-3 w-3 mr-2" />
                        Edit
                      </button>
                    )}

                    {comment.canDelete && (
                      <button
                        onClick={() => onDeleteComment?.(comment.id, isReply)}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        <Trash2 className="h-3 w-3 mr-2" />
                        Delete
                      </button>
                    )}

                    {currentUser && currentUser.id !== comment.userId && (
                      <button
                        onClick={() => onReportComment?.(comment.id, isReply)}
                        className="flex items-center w-full px-4 py-2 text-sm text-orange-600 hover:bg-gray-100"
                      >
                        <Flag className="h-3 w-3 mr-2" />
                        Report
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Reply Form */}
        {replyingTo === comment.id && (
          <div className="mt-3 space-y-2">
            <Textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="min-h-[60px]"
              placeholder={`Reply to @${comment.username}...`}
            />
            <div className="flex space-x-2">
              <Button
                size="sm"
                onClick={() => handleSubmitReply(comment.id, comment.username)}
                disabled={!replyContent.trim()}
              >
                <Send className="h-3 w-3 mr-1" />
                Reply
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setReplyingTo(null)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Replies */}
        {!isReply && "replies" in comment && comment.replies?.length > 0 && (
          <div className="mt-4">
            {comment.replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} isReply={true} />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className={`space-y-4 ${className}`}>
      {/* New Comment Form */}
      {currentUser && (
        <Card>
          <CardContent className="p-4">
            <div className="flex space-x-3">
              <Avatar className="h-10 w-10 flex-shrink-0">
                <AvatarImage src={currentUser.avatar} />
                <AvatarFallback>
                  {currentUser.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-3">
                <Textarea
                  ref={textareaRef}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[80px] resize-none"
                  placeholder="Write a comment..."
                />

                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowEmojis(!showEmojis)}
                      className="h-8 w-8 p-0"
                    >
                      <Smile className="h-4 w-4" />
                    </Button>

                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                  </div>

                  <Button
                    onClick={handleSubmitComment}
                    disabled={!newComment.trim()}
                    size="sm"
                  >
                    <Send className="h-3 w-3 mr-1" />
                    Comment
                  </Button>
                </div>

                {/* Emoji Picker */}
                {showEmojis && (
                  <div className="bg-white border rounded-lg p-3 shadow-lg">
                    <div className="grid grid-cols-8 gap-2">
                      {emojis.map((emoji, index) => (
                        <button
                          key={index}
                          onClick={() => insertEmoji(emoji)}
                          className="p-1 hover:bg-gray-100 rounded text-lg"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} />
        ))}

        {comments.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No comments yet. Be the first to comment!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CommentSystem;
