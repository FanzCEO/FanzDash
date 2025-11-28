import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Video, Play, Upload, Eye, ThumbsUp, MessageSquare, TrendingUp, Server, AlertTriangle, CheckCircle, XCircle, Clock, DollarSign } from "lucide-react";

// TypeScript Interfaces
interface VideoStats {
  totalVideos: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalRevenue: number;
  processingQueue: number;
  activeStreams: number;
  storageUsed: number;
}

interface Video {
  id: string;
  title: string;
  description: string;
  channelId: string;
  channelName: string;
  thumbnailUrl: string;
  videoUrl: string;
  duration: number;
  views: number;
  likes: number;
  comments: number;
  revenue: number;
  status: "processing" | "active" | "flagged" | "removed";
  uploadedAt: string;
  processedAt?: string;
  moderationStatus: "pending" | "approved" | "rejected";
  aiModerationScore?: number;
  tags: string[];
}

interface Channel {
  id: string;
  userId: string;
  username: string;
  channelName: string;
  description: string;
  avatarUrl: string;
  bannerUrl: string;
  subscribers: number;
  totalVideos: number;
  totalViews: number;
  verified: boolean;
  monetized: boolean;
  createdAt: string;
}

interface TranscodingJob {
  id: string;
  videoId: string;
  videoTitle: string;
  status: "queued" | "processing" | "completed" | "failed";
  progress: number;
  resolution: string;
  format: string;
  startedAt?: string;
  completedAt?: string;
  error?: string;
}

interface CDNEdge {
  id: string;
  location: string;
  region: string;
  status: "online" | "offline" | "degraded";
  bandwidth: number;
  requests: number;
  hitRate: number;
  latency: number;
}

export default function TubeManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("videos");
  const [statusFilter, setStatusFilter] = useState("all");
  const [moderationFilter, setModerationFilter] = useState("all");
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
  const [isChannelDialogOpen, setIsChannelDialogOpen] = useState(false);

  // Fetch video statistics from API
  const { data: videoStats } = useQuery<VideoStats>({
    queryKey: ["/api/tube/stats"],
    refetchInterval: 30000,
  });

  // Fetch videos from API
  const { data: videos = [], isLoading: videosLoading } = useQuery<Video[]>({
    queryKey: ["/api/tube/videos", statusFilter, moderationFilter],
    refetchInterval: 10000,
  });

  // Fetch channels from API
  const { data: channels = [], isLoading: channelsLoading } = useQuery<Channel[]>({
    queryKey: ["/api/tube/channels"],
    refetchInterval: 30000,
  });

  // Fetch transcoding jobs from API
  const { data: transcodingJobs = [], isLoading: jobsLoading } = useQuery<TranscodingJob[]>({
    queryKey: ["/api/tube/transcoding"],
    refetchInterval: 5000,
  });

  // Fetch CDN edges from API
  const { data: cdnEdges = [], isLoading: cdnLoading } = useQuery<CDNEdge[]>({
    queryKey: ["/api/tube/cdn/edges"],
    refetchInterval: 15000,
  });

  // Approve video mutation
  const approveVideoMutation = useMutation({
    mutationFn: (videoId: string) =>
      apiRequest(`/api/tube/videos/${videoId}/approve`, "POST"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tube/videos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tube/stats"] });
      toast({
        title: "Video approved",
        description: "The video has been approved and is now live",
      });
      setIsVideoDialogOpen(false);
    },
  });

  // Reject video mutation
  const rejectVideoMutation = useMutation({
    mutationFn: ({ videoId, reason }: { videoId: string; reason: string }) =>
      apiRequest(`/api/tube/videos/${videoId}/reject`, "POST", { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tube/videos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tube/stats"] });
      toast({
        title: "Video rejected",
        description: "The video has been removed from the platform",
      });
      setIsVideoDialogOpen(false);
    },
  });

  // Delete video mutation
  const deleteVideoMutation = useMutation({
    mutationFn: (videoId: string) =>
      apiRequest(`/api/tube/videos/${videoId}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tube/videos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tube/stats"] });
      toast({
        title: "Video deleted",
        description: "The video has been permanently deleted",
      });
    },
  });

  // Verify channel mutation
  const verifyChannelMutation = useMutation({
    mutationFn: (channelId: string) =>
      apiRequest(`/api/tube/channels/${channelId}/verify`, "POST"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tube/channels"] });
      toast({
        title: "Channel verified",
        description: "The channel has been verified successfully",
      });
    },
  });

  // Enable monetization mutation
  const enableMonetizationMutation = useMutation({
    mutationFn: (channelId: string) =>
      apiRequest(`/api/tube/channels/${channelId}/monetize`, "POST"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tube/channels"] });
      toast({
        title: "Monetization enabled",
        description: "The channel can now earn revenue from videos",
      });
    },
  });

  // Retry transcoding job mutation
  const retryTranscodingMutation = useMutation({
    mutationFn: (jobId: string) =>
      apiRequest(`/api/tube/transcoding/${jobId}/retry`, "POST"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tube/transcoding"] });
      toast({
        title: "Transcoding job retried",
        description: "The transcoding job has been requeued",
      });
    },
  });

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getStatusBadge = (status: Video["status"]) => {
    const badges = {
      processing: <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Processing</Badge>,
      active: <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>,
      flagged: <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" />Flagged</Badge>,
      removed: <Badge variant="outline"><XCircle className="w-3 h-3 mr-1" />Removed</Badge>,
    };
    return badges[status];
  };

  const getModerationBadge = (status: Video["moderationStatus"]) => {
    const badges = {
      pending: <Badge variant="secondary">Pending Review</Badge>,
      approved: <Badge variant="default">Approved</Badge>,
      rejected: <Badge variant="destructive">Rejected</Badge>,
    };
    return badges[status];
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Video className="w-8 h-8" />
            FanzTube Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage videos, channels, content moderation, and CDN infrastructure
          </p>
        </div>
        <Button>
          <Upload className="w-4 h-4 mr-2" />
          Upload Video
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Videos</CardTitle>
            <Video className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{videoStats?.totalVideos?.toLocaleString() ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {videoStats?.processingQueue ?? 0} in processing queue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{videoStats?.totalViews?.toLocaleString() ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {videoStats?.activeStreams ?? 0} active livestreams
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Engagement</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{videoStats?.totalLikes?.toLocaleString() ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {videoStats?.totalComments?.toLocaleString() ?? 0} comments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${videoStats?.totalRevenue?.toLocaleString() ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatBytes(videoStats?.storageUsed ?? 0)} storage used
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="videos">Videos</TabsTrigger>
          <TabsTrigger value="channels">Channels</TabsTrigger>
          <TabsTrigger value="moderation">Moderation</TabsTrigger>
          <TabsTrigger value="transcoding">Transcoding</TabsTrigger>
          <TabsTrigger value="cdn">CDN Management</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Videos Tab */}
        <TabsContent value="videos" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Video Catalog</CardTitle>
                  <CardDescription>Manage all uploaded videos across the platform</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="flagged">Flagged</SelectItem>
                      <SelectItem value="removed">Removed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {videosLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading videos...</div>
              ) : videos.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No videos found</div>
              ) : (
                <div className="space-y-4">
                  {videos.map((video) => (
                    <div key={video.id} className="flex gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="relative w-40 h-24 bg-muted rounded overflow-hidden flex-shrink-0">
                        {video.thumbnailUrl ? (
                          <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Video className="w-8 h-8 text-muted-foreground" />
                          </div>
                        )}
                        <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">
                          {formatDuration(video.duration)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold truncate">{video.title}</h3>
                            <p className="text-sm text-muted-foreground">{video.channelName}</p>
                          </div>
                          <div className="flex gap-1">
                            {getStatusBadge(video.status)}
                            {getModerationBadge(video.moderationStatus)}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{video.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {video.views.toLocaleString()} views
                          </span>
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="w-4 h-4" />
                            {video.likes.toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-4 h-4" />
                            {video.comments.toLocaleString()}
                          </span>
                          {video.revenue > 0 && (
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              ${video.revenue.toLocaleString()}
                            </span>
                          )}
                        </div>
                        {video.aiModerationScore !== undefined && (
                          <div className="mt-2">
                            <span className="text-xs text-muted-foreground">
                              AI Moderation Score: {(video.aiModerationScore * 100).toFixed(1)}%
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedVideo(video);
                            setIsVideoDialogOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Review
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this video?")) {
                              deleteVideoMutation.mutate(video.id);
                            }
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Channels Tab */}
        <TabsContent value="channels" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Channel Directory</CardTitle>
              <CardDescription>Manage creator channels and verification</CardDescription>
            </CardHeader>
            <CardContent>
              {channelsLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading channels...</div>
              ) : channels.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No channels found</div>
              ) : (
                <div className="space-y-4">
                  {channels.map((channel) => (
                    <div key={channel.id} className="flex gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="w-16 h-16 bg-muted rounded-full overflow-hidden flex-shrink-0">
                        {channel.avatarUrl ? (
                          <img src={channel.avatarUrl} alt={channel.channelName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Video className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{channel.channelName}</h3>
                          {channel.verified && (
                            <Badge variant="default">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                          {channel.monetized && (
                            <Badge variant="secondary">
                              <DollarSign className="w-3 h-3 mr-1" />
                              Monetized
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">@{channel.username}</p>
                        <p className="text-sm text-muted-foreground mt-2">{channel.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span>{channel.subscribers.toLocaleString()} subscribers</span>
                          <span>{channel.totalVideos.toLocaleString()} videos</span>
                          <span>{channel.totalViews.toLocaleString()} total views</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        {!channel.verified && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => verifyChannelMutation.mutate(channel.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Verify
                          </Button>
                        )}
                        {!channel.monetized && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => enableMonetizationMutation.mutate(channel.id)}
                          >
                            <DollarSign className="w-4 h-4 mr-1" />
                            Monetize
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedChannel(channel);
                            setIsChannelDialogOpen(true);
                          }}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Moderation Tab */}
        <TabsContent value="moderation" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>AI-Powered Content Moderation</CardTitle>
                  <CardDescription>Review flagged content and moderation queue</CardDescription>
                </div>
                <Select value={moderationFilter} onValueChange={setModerationFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {videosLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading content...</div>
              ) : videos.filter(v => moderationFilter === "all" || v.moderationStatus === moderationFilter).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No content requires moderation</div>
              ) : (
                <div className="space-y-4">
                  {videos
                    .filter(v => moderationFilter === "all" || v.moderationStatus === moderationFilter)
                    .map((video) => (
                      <div key={video.id} className="flex gap-4 p-4 border rounded-lg">
                        <div className="w-32 h-20 bg-muted rounded overflow-hidden flex-shrink-0">
                          {video.thumbnailUrl ? (
                            <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Video className="w-6 h-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{video.title}</h3>
                          <p className="text-sm text-muted-foreground">{video.channelName}</p>
                          {video.aiModerationScore !== undefined && (
                            <div className="mt-2">
                              <div className="text-sm font-medium">
                                AI Confidence: {(video.aiModerationScore * 100).toFixed(1)}%
                              </div>
                              <div className="w-full bg-muted rounded-full h-2 mt-1">
                                <div
                                  className={`h-2 rounded-full ${
                                    video.aiModerationScore > 0.8 ? "bg-green-500" :
                                    video.aiModerationScore > 0.5 ? "bg-yellow-500" : "bg-red-500"
                                  }`}
                                  style={{ width: `${video.aiModerationScore * 100}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-2">
                          {video.moderationStatus === "pending" && (
                            <>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => approveVideoMutation.mutate(video.id)}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  const reason = prompt("Enter rejection reason:");
                                  if (reason) {
                                    rejectVideoMutation.mutate({ videoId: video.id, reason });
                                  }
                                }}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                          {getModerationBadge(video.moderationStatus)}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transcoding Tab */}
        <TabsContent value="transcoding" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transcoding Queue</CardTitle>
              <CardDescription>Monitor video processing and transcoding jobs</CardDescription>
            </CardHeader>
            <CardContent>
              {jobsLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading jobs...</div>
              ) : transcodingJobs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No transcoding jobs in queue</div>
              ) : (
                <div className="space-y-4">
                  {transcodingJobs.map((job) => (
                    <div key={job.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-semibold">{job.videoTitle}</h3>
                          <p className="text-sm text-muted-foreground">
                            {job.resolution} • {job.format}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {job.status === "processing" && (
                            <Badge variant="secondary">
                              <Server className="w-3 h-3 mr-1 animate-pulse" />
                              Processing
                            </Badge>
                          )}
                          {job.status === "queued" && (
                            <Badge variant="outline">
                              <Clock className="w-3 h-3 mr-1" />
                              Queued
                            </Badge>
                          )}
                          {job.status === "completed" && (
                            <Badge variant="default">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Completed
                            </Badge>
                          )}
                          {job.status === "failed" && (
                            <Badge variant="destructive">
                              <XCircle className="w-3 h-3 mr-1" />
                              Failed
                            </Badge>
                          )}
                        </div>
                      </div>
                      {job.status === "processing" && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span>Progress</span>
                            <span>{job.progress}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{ width: `${job.progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                      {job.status === "failed" && job.error && (
                        <div className="mt-2 p-2 bg-destructive/10 text-destructive text-sm rounded">
                          {job.error}
                        </div>
                      )}
                      {job.status === "failed" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => retryTranscodingMutation.mutate(job.id)}
                        >
                          Retry Job
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* CDN Management Tab */}
        <TabsContent value="cdn" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>CDN Edge Servers</CardTitle>
              <CardDescription>Monitor global content delivery network</CardDescription>
            </CardHeader>
            <CardContent>
              {cdnLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading CDN data...</div>
              ) : cdnEdges.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No CDN edges configured</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cdnEdges.map((edge) => (
                    <div key={edge.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">{edge.location}</h3>
                          <p className="text-sm text-muted-foreground">{edge.region}</p>
                        </div>
                        {edge.status === "online" && (
                          <Badge variant="default">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Online
                          </Badge>
                        )}
                        {edge.status === "offline" && (
                          <Badge variant="destructive">
                            <XCircle className="w-3 h-3 mr-1" />
                            Offline
                          </Badge>
                        )}
                        {edge.status === "degraded" && (
                          <Badge variant="secondary">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Degraded
                          </Badge>
                        )}
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Bandwidth</span>
                          <span className="font-medium">{formatBytes(edge.bandwidth)}/s</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Requests</span>
                          <span className="font-medium">{edge.requests.toLocaleString()}/min</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Cache Hit Rate</span>
                          <span className="font-medium">{(edge.hitRate * 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Latency</span>
                          <span className="font-medium">{edge.latency}ms</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Platform Analytics</CardTitle>
              <CardDescription>Performance metrics and insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                Analytics dashboard coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Video Review Dialog */}
      <Dialog open={isVideoDialogOpen} onOpenChange={setIsVideoDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Review Video</DialogTitle>
            <DialogDescription>Detailed video information and moderation actions</DialogDescription>
          </DialogHeader>
          {selectedVideo && (
            <div className="space-y-4">
              <div className="aspect-video bg-muted rounded overflow-hidden">
                {selectedVideo.thumbnailUrl ? (
                  <img src={selectedVideo.thumbnailUrl} alt={selectedVideo.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Video className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-lg">{selectedVideo.title}</h3>
                <p className="text-sm text-muted-foreground">{selectedVideo.channelName}</p>
                <p className="text-sm mt-2">{selectedVideo.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Views:</span>
                  <span className="ml-2 font-medium">{selectedVideo.views.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Likes:</span>
                  <span className="ml-2 font-medium">{selectedVideo.likes.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Comments:</span>
                  <span className="ml-2 font-medium">{selectedVideo.comments.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="ml-2 font-medium">{formatDuration(selectedVideo.duration)}</span>
                </div>
              </div>
              {selectedVideo.aiModerationScore !== undefined && (
                <div>
                  <div className="text-sm font-medium mb-2">
                    AI Moderation Score: {(selectedVideo.aiModerationScore * 100).toFixed(1)}%
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${
                        selectedVideo.aiModerationScore > 0.8 ? "bg-green-500" :
                        selectedVideo.aiModerationScore > 0.5 ? "bg-yellow-500" : "bg-red-500"
                      }`}
                      style={{ width: `${selectedVideo.aiModerationScore * 100}%` }}
                    />
                  </div>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {selectedVideo.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </div>
          )}
          <DialogFooter>
            {selectedVideo?.moderationStatus === "pending" && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setIsVideoDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    const reason = prompt("Enter rejection reason:");
                    if (reason && selectedVideo) {
                      rejectVideoMutation.mutate({ videoId: selectedVideo.id, reason });
                    }
                  }}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button
                  variant="default"
                  onClick={() => {
                    if (selectedVideo) {
                      approveVideoMutation.mutate(selectedVideo.id);
                    }
                  }}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
