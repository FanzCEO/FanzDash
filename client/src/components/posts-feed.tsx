import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import {
  Pin,
  Eye,
  EyeOff,
  Calendar,
  ArrowUpRight,
  Copy,
  Edit,
  Trash2,
  Flag,
  MoreHorizontal,
  Heart,
  MessageCircle,
  Share,
  Lock,
  Unlock,
  DollarSign,
  Globe,
  Verified,
  Zap,
  Clock,
  Image as ImageIcon,
  Video,
  Music,
  FileArchive,
  Loader2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface MediaItem {
  id: string;
  type: "image" | "video" | "music" | "zip" | "video_embed";
  file: string;
  videoPoster?: string;
  videoEmbed?: string;
  duration?: string;
  quality?: string;
  width?: number;
  height?: number;
  imgType?: string;
}

interface Post {
  id: string;
  userId: string;
  username: string;
  name: string;
  avatar: string;
  isVerified: boolean;
  isLive: boolean;
  title?: string;
  description?: string;
  media: MediaItem[];
  price: number;
  locked: boolean;
  isPinned: boolean;
  status: "active" | "pending" | "scheduled";
  scheduledDate?: string;
  createdAt: string;
  likesCount: number;
  likesExtra: number;
  commentsCount: number;
  isLikedByUser: boolean;
  isSubscribed: boolean;
  isPaidByUser: boolean;
  isOwn: boolean;
}

interface PostsFeedProps {
  posts: Post[];
  currentUserId?: string;
  onLikePost: (postId: string) => void;
  onUnlockPost: (postId: string) => void;
  onDeletePost: (postId: string) => void;
  onPinPost: (postId: string) => void;
  onReportPost: (postId: string, reason: string, message?: string) => void;
  onCopyLink: (postId: string) => void;
  settings: {
    currencySymbol: string;
  };
  className?: string;
}

export function PostsFeed({
  posts,
  currentUserId,
  onLikePost,
  onUnlockPost,
  onDeletePost,
  onPinPost,
  onReportPost,
  onCopyLink,
  settings,
  className = "",
}: PostsFeedProps) {
  const [likingPosts, setLikingPosts] = useState<Set<string>>(new Set());
  const [unlockingPosts, setUnlockingPosts] = useState<Set<string>>(new Set());

  const handleLikePost = async (postId: string) => {
    if (likingPosts.has(postId)) return;

    setLikingPosts((prev) => new Set(prev).add(postId));
    try {
      await onLikePost(postId);
    } catch (error) {
      console.error("Failed to like post:", error);
    } finally {
      setLikingPosts((prev) => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
    }
  };

  const handleUnlockPost = async (postId: string) => {
    if (unlockingPosts.has(postId)) return;

    setUnlockingPosts((prev) => new Set(prev).add(postId));
    try {
      await onUnlockPost(postId);
    } catch (error) {
      console.error("Failed to unlock post:", error);
    } finally {
      setUnlockingPosts((prev) => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
    }
  };

  const getMediaStats = (media: MediaItem[]) => {
    return {
      images: media.filter((m) => m.type === "image").length,
      videos: media.filter(
        (m) => m.type === "video" || m.type === "video_embed",
      ).length,
      music: media.filter((m) => m.type === "music").length,
      files: media.filter((m) => m.type === "zip").length,
    };
  };

  const PostContent = ({ post }: { post: Post }) => {
    const canViewContent =
      post.isOwn ||
      !post.locked ||
      (post.isSubscribed && post.price === 0) ||
      (post.isPaidByUser && post.price > 0);

    const mediaStats = getMediaStats(post.media);
    const firstMedia = post.media.find((m) =>
      ["image", "video"].includes(m.type),
    );

    if (post.locked && !canViewContent) {
      return (
        <Card className="max-w-full mb-4">
          <CardContent
            className="p-8 text-center text-white relative overflow-hidden"
            style={{
              background: firstMedia
                ? `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${firstMedia.videoPoster || `/media/storage/focus/photo/${firstMedia.id}`})`
                : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="space-y-4">
              <div className="flex justify-center">
                <Lock className="h-12 w-12 text-white" />
              </div>

              {post.title && (
                <h4 className="font-bold text-white">{post.title}</h4>
              )}

              <Button
                onClick={() => handleUnlockPost(post.id)}
                disabled={unlockingPosts.has(post.id)}
                className="bg-white text-black hover:bg-gray-100"
                data-testid={`unlock-post-${post.id}`}
              >
                {unlockingPosts.has(post.id) ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Unlocking...
                  </>
                ) : (
                  <>
                    <Unlock className="h-4 w-4 mr-2" />
                    Unlock for {settings.currencySymbol}
                    {post.price}
                  </>
                )}
              </Button>

              {/* Media indicators */}
              <div className="flex justify-center space-x-6 text-sm">
                {mediaStats.images > 0 && (
                  <div className="flex items-center space-x-1">
                    <ImageIcon className="h-4 w-4" />
                    <span>{mediaStats.images}</span>
                  </div>
                )}
                {mediaStats.videos > 0 && (
                  <div className="flex items-center space-x-1">
                    <Video className="h-4 w-4" />
                    <span>{mediaStats.videos}</span>
                  </div>
                )}
                {mediaStats.music > 0 && (
                  <div className="flex items-center space-x-1">
                    <Music className="h-4 w-4" />
                    <span>{mediaStats.music}</span>
                  </div>
                )}
                {mediaStats.files > 0 && (
                  <div className="flex items-center space-x-1">
                    <FileArchive className="h-4 w-4" />
                    <span>{mediaStats.files}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        {/* Text Content */}
        {post.description && (
          <div className="text-break-word">
            <div dangerouslySetInnerHTML={{ __html: post.description }} />
          </div>
        )}

        {/* Media Grid */}
        {post.media.length > 0 && (
          <div className="space-y-2">
            {post.media.map((media, index) => (
              <MediaDisplay key={media.id} media={media} postId={post.id} />
            ))}
          </div>
        )}
      </div>
    );
  };

  const MediaDisplay = ({
    media,
    postId,
  }: {
    media: MediaItem;
    postId: string;
  }) => {
    switch (media.type) {
      case "image":
        return (
          <div className="max-w-full">
            {media.imgType === "gif" ? (
              <img
                src={media.file}
                alt="GIF"
                className="max-w-full rounded-lg"
              />
            ) : (
              <img
                src={`/media/storage/focus/photo/${media.id}`}
                alt="Post image"
                className="w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() =>
                  window.open(
                    `/media/storage/focus/photo/${media.id}`,
                    "_blank",
                  )
                }
              />
            )}
          </div>
        );

      case "video":
        return (
          <div className="max-w-full">
            <video
              controls
              poster={
                media.videoPoster
                  ? `/media/storage/focus/video/${media.videoPoster}`
                  : undefined
              }
              className="w-full rounded-lg"
              preload="metadata"
            >
              <source src={media.file} type="video/mp4" />
            </video>
            {media.quality && (
              <Badge variant="secondary" className="mt-1">
                {media.quality}
              </Badge>
            )}
          </div>
        );

      case "video_embed":
        return (
          <div className="max-w-full aspect-video">
            <iframe
              src={media.videoEmbed}
              className="w-full h-full rounded-lg"
              allowFullScreen
              frameBorder="0"
            />
          </div>
        );

      case "music":
        return (
          <div className="w-full">
            <audio controls className="w-full">
              <source src={media.file} type="audio/mp3" />
            </audio>
          </div>
        );

      case "zip":
        return (
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center space-x-3">
                <FileArchive className="h-8 w-8 text-primary" />
                <div className="flex-1">
                  <h6 className="font-semibold">Download File</h6>
                  <p className="text-sm text-muted-foreground">ZIP Archive</p>
                </div>
                <Button size="sm" variant="outline">
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {posts.map((post) => (
        <Card
          key={post.id}
          className={cn(
            "shadow-lg rounded-xl border-0 overflow-hidden",
            post.status === "pending" ? "bg-yellow-50 border-yellow-200" : "",
            post.isPinned ? "ring-2 ring-primary/20" : "",
          )}
        >
          <CardContent className="p-0">
            {/* Pinned Post Indicator */}
            {post.isPinned && (
              <div className="bg-primary/10 px-4 py-2 border-b">
                <div className="flex items-center space-x-2 text-primary text-sm">
                  <Pin className="h-4 w-4" />
                  <span className="font-semibold">Pinned Post</span>
                </div>
              </div>
            )}

            {/* Status Indicators */}
            {post.status === "pending" && (
              <Alert>
                <Eye className="h-4 w-4" />
                <AlertDescription>This post is pending review</AlertDescription>
              </Alert>
            )}

            {post.status === "scheduled" && post.scheduledDate && (
              <Alert>
                <Calendar className="h-4 w-4" />
                <AlertDescription>
                  Scheduled for {new Date(post.scheduledDate).toLocaleString()}
                </AlertDescription>
              </Alert>
            )}

            <div className="p-4">
              {/* User Header */}
              <div className="flex items-start space-x-3 mb-4">
                <div className="relative">
                  <Link
                    href={
                      post.isLive
                        ? `/live/${post.username}`
                        : `/${post.username}`
                    }
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={post.avatar} />
                      <AvatarFallback>
                        {post.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  {post.isLive && (
                    <Badge className="absolute -top-1 -right-1 bg-red-500 text-xs animate-pulse">
                      LIVE
                    </Badge>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <Link href={`/${post.username}`}>
                      <h5 className="font-bold hover:text-primary">
                        {post.name}
                      </h5>
                    </Link>

                    {post.isVerified && (
                      <Verified className="h-4 w-4 text-blue-500 fill-current" />
                    )}

                    <span className="text-sm text-muted-foreground">
                      @{post.username}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                    <span>
                      {formatDistanceToNow(new Date(post.createdAt), {
                        addSuffix: true,
                      })}
                    </span>

                    {post.locked ? (
                      <div className="flex items-center space-x-1">
                        <Lock className="h-3 w-3" />
                        {post.price > 0 && !post.isPaidByUser ? (
                          <span>
                            {settings.currencySymbol}
                            {post.price}
                          </span>
                        ) : post.isPaidByUser ? (
                          <span>Paid</span>
                        ) : null}
                      </div>
                    ) : (
                      <div
                        className="flex items-center space-x-1"
                        title="Public"
                      >
                        <Globe className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Post Options Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/${post.username}/post/${post.id}`}>
                        <ArrowUpRight className="h-4 w-4 mr-2" />
                        Go to Post
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => onCopyLink(post.id)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Link
                    </DropdownMenuItem>

                    {post.isOwn && post.status === "active" && (
                      <DropdownMenuItem onClick={() => onPinPost(post.id)}>
                        <Pin className="h-4 w-4 mr-2" />
                        {post.isPinned
                          ? "Unpin from Profile"
                          : "Pin to Profile"}
                      </DropdownMenuItem>
                    )}

                    {post.isOwn && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href={`/post/edit/${post.id}`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Post
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDeletePost(post.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Post
                        </DropdownMenuItem>
                      </>
                    )}

                    {!post.isOwn && (
                      <DropdownMenuItem
                        onClick={() => onReportPost(post.id, "inappropriate")}
                        className="text-red-600"
                      >
                        <Flag className="h-4 w-4 mr-2" />
                        Report Post
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Post Content */}
              <PostContent post={post} />

              {/* Post Actions */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t">
                <div className="flex items-center space-x-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLikePost(post.id)}
                    disabled={likingPosts.has(post.id)}
                    className={cn(
                      "px-2 transition-colors",
                      post.isLikedByUser
                        ? "text-red-500 hover:text-red-600"
                        : "text-muted-foreground hover:text-red-500",
                    )}
                    data-testid={`like-post-${post.id}`}
                  >
                    <Heart
                      className={cn(
                        "h-4 w-4 mr-2",
                        post.isLikedByUser ? "fill-current" : "",
                      )}
                    />
                    <span>
                      {post.likesCount + post.likesExtra > 0
                        ? (post.likesCount + post.likesExtra).toLocaleString()
                        : null}
                    </span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="px-2 text-muted-foreground hover:text-primary"
                    data-testid={`comment-post-${post.id}`}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    <span>
                      {post.commentsCount > 0
                        ? post.commentsCount.toLocaleString()
                        : null}
                    </span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onCopyLink(post.id)}
                    className="px-2 text-muted-foreground hover:text-primary"
                    data-testid={`share-post-${post.id}`}
                  >
                    <Share className="h-4 w-4" />
                  </Button>
                </div>

                {/* Post Statistics */}
                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                  {(() => {
                    const stats = getMediaStats(post.media);
                    const totalMedia =
                      stats.images + stats.videos + stats.music + stats.files;

                    if (totalMedia === 0) return null;

                    return (
                      <div className="flex items-center space-x-2">
                        {stats.images > 0 && (
                          <div className="flex items-center space-x-1">
                            <ImageIcon className="h-3 w-3" />
                            <span>{stats.images}</span>
                          </div>
                        )}
                        {stats.videos > 0 && (
                          <div className="flex items-center space-x-1">
                            <Video className="h-3 w-3" />
                            <span>{stats.videos}</span>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default PostsFeed;
