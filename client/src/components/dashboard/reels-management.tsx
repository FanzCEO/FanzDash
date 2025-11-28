import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  MoreHorizontal,
  Trash2,
  Flag,
  Eye,
  Heart,
  MessageCircle,
  Search,
  Filter,
  Calendar,
  Users,
  TrendingUp,
  Download,
  Share,
  Ban,
  CheckCircle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Reel {
  id: string;
  title: string;
  media: {
    name: string;
    duration: number;
    thumbnail?: string;
    size: number;
  };
  user: {
    id: string;
    username: string;
    name: string;
    avatar?: string;
    verified: boolean;
  };
  stats: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
  };
  type: "public" | "private" | "unlockable";
  status: "active" | "pending" | "reported" | "banned";
  createdAt: string;
  reported: boolean;
  reportCount: number;
}

interface ReelsManagementProps {
  reels: Reel[];
  onApprove: (reelId: string) => Promise<void>;
  onReject: (reelId: string) => Promise<void>;
  onDelete: (reelId: string) => Promise<void>;
  onBan: (reelId: string) => Promise<void>;
  onLoadMore: () => void;
  hasMorePages: boolean;
  isLoading: boolean;
  stats: {
    total: number;
    pending: number;
    reported: number;
    active: number;
  };
  className?: string;
}

export function ReelsManagement({
  reels,
  onApprove,
  onReject,
  onDelete,
  onBan,
  onLoadMore,
  hasMorePages,
  isLoading,
  stats,
  className = "",
}: ReelsManagementProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [playingReels, setPlayingReels] = useState<Set<string>>(new Set());
  const [mutedReels, setMutedReels] = useState<Set<string>>(new Set());
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

  const filteredReels = reels.filter((reel) => {
    const matchesSearch =
      reel.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reel.user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reel.user.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      filterStatus === "all" || reel.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const handlePlayPause = async (reelId: string) => {
    const video = videoRefs.current.get(reelId);
    if (!video) return;

    const newPlayingReels = new Set(playingReels);

    try {
      if (playingReels.has(reelId)) {
        video.pause();
        newPlayingReels.delete(reelId);
      } else {
        // Pause all other videos
        playingReels.forEach((id) => {
          const otherVideo = videoRefs.current.get(id);
          if (otherVideo) otherVideo.pause();
        });

        await video.play();
        newPlayingReels.clear();
        newPlayingReels.add(reelId);
      }

      setPlayingReels(newPlayingReels);
    } catch (error) {
      console.error("Error playing/pausing video:", error);
      // Don't update state if video operation failed
    }
  };

  const handleMuteToggle = (reelId: string) => {
    const video = videoRefs.current.get(reelId);
    if (!video) return;

    const newMutedReels = new Set(mutedReels);

    if (mutedReels.has(reelId)) {
      video.muted = false;
      newMutedReels.delete(reelId);
    } else {
      video.muted = true;
      newMutedReels.add(reelId);
    }

    setMutedReels(newMutedReels);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getStatusBadge = (status: Reel["status"]) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case "reported":
        return <Badge variant="destructive">Reported</Badge>;
      case "banned":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-700">
            Banned
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: Reel["type"]) => {
    switch (type) {
      case "public":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-700">
            Public
          </Badge>
        );
      case "private":
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-700">
            Private
          </Badge>
        );
      case "unlockable":
        return (
          <Badge variant="outline" className="bg-purple-100 text-purple-700">
            Unlockable
          </Badge>
        );
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const ReelCard = ({ reel }: { reel: Reel }) => (
    <Card className="group hover:shadow-lg transition-all duration-300">
      <CardContent className="p-4">
        <div className="grid grid-cols-12 gap-4">
          {/* Video Preview */}
          <div className="col-span-12 sm:col-span-3">
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              <video
                ref={(el) => {
                  if (el) videoRefs.current.set(reel.id, el);
                }}
                src={`/api/media/reels/${reel.media.name}`}
                poster={reel.media.thumbnail || "/api/placeholder/300/200"}
                className="w-full h-full object-cover"
                loop
                muted={mutedReels.has(reel.id)}
                onEnded={() => {
                  try {
                    const newPlayingReels = new Set(playingReels);
                    newPlayingReels.delete(reel.id);
                    setPlayingReels(newPlayingReels);
                  } catch (error) {
                    console.error("Error handling video end:", error);
                  }
                }}
              />

              {/* Video Controls Overlay */}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handlePlayPause(reel.id)}
                    className="bg-white/90 hover:bg-white"
                  >
                    {playingReels.has(reel.id) ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>

                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleMuteToggle(reel.id)}
                    className="bg-white/90 hover:bg-white"
                  >
                    {mutedReels.has(reel.id) ? (
                      <VolumeX className="h-4 w-4" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Duration Badge */}
              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                {formatDuration(reel.media.duration)}
              </div>
            </div>
          </div>

          {/* Reel Info */}
          <div className="col-span-12 sm:col-span-6 space-y-3">
            <div>
              <h3 className="font-semibold text-lg line-clamp-2">
                {reel.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(reel.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>

            {/* Creator Info */}
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={reel.user.avatar} />
                <AvatarFallback>{reel.user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm flex items-center space-x-1">
                  <span>{reel.user.name}</span>
                  {reel.user.verified && (
                    <CheckCircle className="h-3 w-3 text-blue-500 fill-current" />
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  @{reel.user.username}
                </p>
              </div>
            </div>

            {/* Status and Type Badges */}
            <div className="flex items-center space-x-2">
              {getStatusBadge(reel.status)}
              {getTypeBadge(reel.type)}
              {reel.reported && reel.reportCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  <Flag className="h-3 w-3 mr-1" />
                  {reel.reportCount} reports
                </Badge>
              )}
            </div>
          </div>

          {/* Stats and Actions */}
          <div className="col-span-12 sm:col-span-3">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-2 mb-4 text-center">
              <div>
                <p className="text-lg font-bold">
                  {reel.stats.views.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground flex items-center justify-center">
                  <Eye className="h-3 w-3 mr-1" />
                  Views
                </p>
              </div>
              <div>
                <p className="text-lg font-bold">
                  {reel.stats.likes.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground flex items-center justify-center">
                  <Heart className="h-3 w-3 mr-1" />
                  Likes
                </p>
              </div>
              <div>
                <p className="text-lg font-bold">
                  {reel.stats.comments.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground flex items-center justify-center">
                  <MessageCircle className="h-3 w-3 mr-1" />
                  Comments
                </p>
              </div>
              <div>
                <p className="text-lg font-bold">
                  {reel.stats.shares.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground flex items-center justify-center">
                  <Share className="h-3 w-3 mr-1" />
                  Shares
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              {reel.status === "pending" && (
                <div className="flex space-x-1">
                  <Button
                    size="sm"
                    onClick={() => onApprove(reel.id)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    data-testid={`approve-reel-${reel.id}`}
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onReject(reel.id)}
                    className="flex-1"
                    data-testid={`reject-reel-${reel.id}`}
                  >
                    <Ban className="h-3 w-3 mr-1" />
                    Reject
                  </Button>
                </div>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full">
                    <MoreHorizontal className="h-4 w-4 mr-2" />
                    Actions
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Share className="h-4 w-4 mr-2" />
                    Share Link
                  </DropdownMenuItem>
                  <Separator />
                  <DropdownMenuItem
                    onClick={() => onBan(reel.id)}
                    className="text-red-600"
                  >
                    <Ban className="h-4 w-4 mr-2" />
                    Ban Reel
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDelete(reel.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center space-x-3">
            <Play className="h-8 w-8 text-primary" />
            <span>Reels Management</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Moderate and manage video content across the platform
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Reels</p>
                <p className="text-2xl font-bold">
                  {stats.total.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <Calendar className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.pending.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <Flag className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Reported</p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.reported.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.active.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search reels, creators, or content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="reels-search-input"
                />
              </div>
            </div>

            <div className="flex space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Status: {filterStatus === "all" ? "All" : filterStatus}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setFilterStatus("all")}>
                    All Statuses
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus("pending")}>
                    Pending Review
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus("reported")}>
                    Reported
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus("active")}>
                    Active
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus("banned")}>
                    Banned
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reels List */}
      <div className="space-y-4">
        {filteredReels.length > 0 ? (
          <>
            {filteredReels.map((reel) => (
              <ReelCard key={reel.id} reel={reel} />
            ))}

            {/* Load More */}
            {hasMorePages && (
              <div className="text-center pt-6">
                <Button
                  onClick={onLoadMore}
                  disabled={isLoading}
                  size="lg"
                  variant="outline"
                  className="px-8"
                  data-testid="load-more-reels-btn"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                      Loading...
                    </>
                  ) : (
                    "Load More Reels"
                  )}
                </Button>
              </div>
            )}
          </>
        ) : (
          <Card className="py-12">
            <CardContent className="text-center">
              <Play className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Reels Found</h3>
              <p className="text-muted-foreground">
                {searchQuery
                  ? `No reels match your search for "${searchQuery}"`
                  : "No reels have been uploaded yet"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default ReelsManagement;
