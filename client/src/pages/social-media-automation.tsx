import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Share2,
  Calendar,
  TrendingUp,
  Heart,
  MessageCircle,
  Repeat2,
  Eye,
  Plus,
  Edit,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Image as ImageIcon,
  Video,
  Hash,
  Target,
  Users,
  Settings,
  Cloud,
} from "lucide-react";

interface SocialAccount {
  id: string;
  platform: "twitter" | "facebook" | "instagram" | "linkedin" | "tiktok" | "youtube" | "bluesky";
  brand: string;
  username: string;
  displayName: string;
  followers: number;
  isConnected: boolean;
  lastSync: string;
  profileImage?: string;
}

interface SocialPost {
  id: string;
  content: string;
  platforms: string[];
  brands: string[];
  status: "draft" | "scheduled" | "published" | "failed";
  scheduledDate?: string;
  publishedDate?: string;
  mediaUrls: string[];
  mediaType: "text" | "image" | "video" | "carousel";
  hashtags: string[];
  mentions: string[];
  stats?: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
    engagement: number;
  };
  createdBy: string;
  createdDate: string;
}

interface ContentCalendar {
  date: string;
  posts: SocialPost[];
}

interface Analytics {
  totalPosts: number;
  totalEngagement: number;
  totalReach: number;
  avgEngagementRate: number;
  topPerformingPosts: {
    id: string;
    content: string;
    platform: string;
    engagement: number;
  }[];
  platformBreakdown: {
    platform: string;
    posts: number;
    engagement: number;
    followers: number;
  }[];
  engagementTrend: {
    date: string;
    likes: number;
    comments: number;
    shares: number;
  }[];
}

interface HashtagTracking {
  hashtag: string;
  uses: number;
  reach: number;
  engagement: number;
  trending: boolean;
}

interface ContentQueue {
  id: string;
  name: string;
  platforms: string[];
  brands: string[];
  schedule: {
    frequency: "daily" | "weekly" | "custom";
    times: string[];
    days?: number[];
  };
  posts: SocialPost[];
  status: "active" | "paused";
}

// All FANZ brands
const FANZ_BRANDS = [
  "FanzMoney",
  "BearFanz",
  "GayFanz",
  "Guyz",
  "BoyFanz",
  "DLBroz",
  "PupFanz",
  "CougarFanz",
  "FanzClips",
  "FanzTube",
  "FanzRoulette",
];

function apiRequest(url: string, method: string, data?: any) {
  return fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  }).then((res) => res.json());
}

export default function SocialMediaAutomation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("calendar");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showConnectAccount, setShowConnectAccount] = useState(false);

  // Fetch social accounts
  const { data: accounts = [] } = useQuery<SocialAccount[]>({
    queryKey: ["/api/social/accounts"],
    refetchInterval: 60000,
  });

  // Fetch posts
  const { data: posts = [] } = useQuery<SocialPost[]>({
    queryKey: ["/api/social/posts"],
    refetchInterval: 30000,
  });

  // Fetch analytics
  const { data: analytics } = useQuery<Analytics>({
    queryKey: ["/api/social/analytics"],
    refetchInterval: 300000,
  });

  // Fetch hashtag tracking
  const { data: hashtags = [] } = useQuery<HashtagTracking[]>({
    queryKey: ["/api/social/hashtags"],
  });

  // Fetch content queues
  const { data: queues = [] } = useQuery<ContentQueue[]>({
    queryKey: ["/api/social/queues"],
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: (data: Partial<SocialPost>) => apiRequest("/api/social/posts", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/social/posts"] });
      toast({ title: "Post created successfully" });
      setShowCreatePost(false);
    },
  });

  // Publish post mutation
  const publishPostMutation = useMutation({
    mutationFn: (postId: string) =>
      apiRequest(`/api/social/posts/${postId}/publish`, "POST", {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/social/posts"] });
      toast({ title: "Post published successfully" });
    },
  });

  // Connect account mutation
  const connectAccountMutation = useMutation({
    mutationFn: (data: { platform: string; brand: string }) =>
      apiRequest("/api/social/accounts/connect", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/social/accounts"] });
      toast({ title: "Account connected successfully" });
      setShowConnectAccount(false);
    },
  });

  // Stats
  const connectedAccounts = accounts.filter((a) => a.isConnected).length;
  const totalPosts = posts.length;
  const scheduledPosts = posts.filter((p) => p.status === "scheduled").length;
  const totalFollowers = accounts.reduce((sum, a) => sum + a.followers, 0);

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
      case "active":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "scheduled":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "draft":
      case "paused":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "failed":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  // Get platform icon/color
  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case "twitter":
        return "text-blue-400";
      case "facebook":
        return "text-blue-600";
      case "instagram":
        return "text-pink-500";
      case "linkedin":
        return "text-blue-700";
      case "tiktok":
        return "text-black";
      case "youtube":
        return "text-red-600";
      case "bluesky":
        return "text-sky-400";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="min-h-screen cyber-bg p-4 md:p-6 lg:p-8">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold cyber-text-glow">
              Social Media Automation
            </h1>
            <p className="text-gray-400 mt-2">
              Manage all brands across Twitter, Facebook, Instagram, LinkedIn, TikTok, YouTube & Bluesky
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowConnectAccount(true)}
              variant="outline"
              className="border-cyan-500/30"
            >
              <Plus className="h-4 w-4 mr-2" />
              Connect Account
            </Button>
            <Button
              onClick={() => setShowCreatePost(true)}
              className="bg-gradient-to-r from-cyan-500 to-blue-500"
            >
              <Send className="h-4 w-4 mr-2" />
              Create Post
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="cyber-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Connected Accounts</p>
                <p className="text-2xl font-bold mt-1">{connectedAccounts}</p>
                <p className="text-xs text-gray-400 mt-1">of {accounts.length} total</p>
              </div>
              <Share2 className="h-8 w-8 text-cyan-400" />
            </div>
          </Card>

          <Card className="cyber-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Posts</p>
                <p className="text-2xl font-bold mt-1">{totalPosts}</p>
                <p className="text-xs text-green-400 mt-1">{scheduledPosts} scheduled</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-400" />
            </div>
          </Card>

          <Card className="cyber-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Followers</p>
                <p className="text-2xl font-bold mt-1">{totalFollowers.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-green-400" />
            </div>
          </Card>

          <Card className="cyber-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Engagement Rate</p>
                <p className="text-2xl font-bold mt-1">
                  {analytics?.avgEngagementRate.toFixed(1) || 0}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-yellow-400" />
            </div>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="cyber-card">
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="accounts">Accounts</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="queues">Content Queues</TabsTrigger>
            <TabsTrigger value="hashtags">Hashtags</TabsTrigger>
          </TabsList>

          {/* Calendar Tab */}
          <TabsContent value="calendar" className="space-y-4">
            <Card className="cyber-card p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold">Content Calendar</h3>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="cyber-input w-48"
                  />
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: 7 }, (_, i) => {
                    const date = new Date(selectedDate);
                    date.setDate(date.getDate() - date.getDay() + i);
                    const dateStr = date.toISOString().split("T")[0];
                    const dayPosts = posts.filter(
                      (p) => p.scheduledDate?.split("T")[0] === dateStr || p.publishedDate?.split("T")[0] === dateStr
                    );

                    return (
                      <div key={i} className="cyber-card p-3 min-h-[200px]">
                        <div className="text-center mb-2">
                          <p className="text-xs text-gray-400">
                            {date.toLocaleDateString("en-US", { weekday: "short" })}
                          </p>
                          <p className="text-lg font-bold">{date.getDate()}</p>
                        </div>
                        <div className="space-y-1">
                          {dayPosts.slice(0, 3).map((post) => (
                            <div
                              key={post.id}
                              className="text-xs p-2 rounded bg-cyan-500/10 border border-cyan-500/30"
                            >
                              <p className="truncate">{post.content.substring(0, 30)}...</p>
                              <div className="flex gap-1 mt-1">
                                {post.platforms.map((platform, idx) => (
                                  <Badge
                                    key={idx}
                                    variant="outline"
                                    className={`text-xs ${getPlatformColor(platform)}`}
                                  >
                                    {platform}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          ))}
                          {dayPosts.length > 3 && (
                            <p className="text-xs text-center text-gray-400">
                              +{dayPosts.length - 3} more
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Posts Tab */}
          <TabsContent value="posts" className="space-y-4">
            <Card className="cyber-card p-6">
              <div className="space-y-4">
                <h3 className="text-xl font-bold">All Posts</h3>

                <div className="space-y-2">
                  {posts.map((post) => (
                    <div key={post.id} className="cyber-card p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getStatusColor(post.status)}>
                              {post.status}
                            </Badge>
                            {post.mediaType !== "text" && (
                              <Badge variant="outline">
                                {post.mediaType === "image" && <ImageIcon className="h-3 w-3 mr-1" />}
                                {post.mediaType === "video" && <Video className="h-3 w-3 mr-1" />}
                                {post.mediaType}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm mb-2">{post.content}</p>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {post.platforms.map((platform, idx) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className={`text-xs ${getPlatformColor(platform)}`}
                              >
                                {platform}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {post.brands.map((brand, idx) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className="text-xs bg-purple-500/20 text-purple-400"
                              >
                                {brand}
                              </Badge>
                            ))}
                          </div>
                          {post.hashtags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {post.hashtags.map((tag, idx) => (
                                <span key={idx} className="text-xs text-cyan-400">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {post.status === "draft" && (
                            <Button
                              size="sm"
                              onClick={() => publishPostMutation.mutate(post.id)}
                              className="bg-green-500/20 text-green-400"
                            >
                              <Send className="h-4 w-4 mr-1" />
                              Publish
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {post.status === "published" && post.stats && (
                        <div className="grid grid-cols-5 gap-4 pt-3 border-t border-gray-800 text-sm">
                          <div className="flex items-center gap-1">
                            <Heart className="h-4 w-4 text-red-400" />
                            <span>{post.stats.likes.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="h-4 w-4 text-blue-400" />
                            <span>{post.stats.comments.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Repeat2 className="h-4 w-4 text-green-400" />
                            <span>{post.stats.shares.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4 text-cyan-400" />
                            <span>{post.stats.views.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4 text-yellow-400" />
                            <span>{post.stats.engagement.toFixed(1)}%</span>
                          </div>
                        </div>
                      )}

                      {post.scheduledDate && post.status === "scheduled" && (
                        <div className="pt-3 border-t border-gray-800">
                          <p className="text-sm text-gray-400">
                            <Clock className="inline h-4 w-4 mr-1" />
                            Scheduled for: {new Date(post.scheduledDate).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                  {posts.length === 0 && (
                    <p className="text-center text-gray-400 py-8">No posts found</p>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Accounts Tab */}
          <TabsContent value="accounts" className="space-y-4">
            <Card className="cyber-card p-6">
              <div className="space-y-4">
                <h3 className="text-xl font-bold">Connected Accounts</h3>

                {/* Group accounts by brand */}
                {FANZ_BRANDS.map((brand) => {
                  const brandAccounts = accounts.filter((a) => a.brand === brand);
                  if (brandAccounts.length === 0) return null;

                  return (
                    <div key={brand} className="cyber-card p-4">
                      <h4 className="font-semibold text-lg mb-3 text-cyan-400">{brand}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {brandAccounts.map((account) => (
                          <div
                            key={account.id}
                            className="cyber-card p-3 flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`h-10 w-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center ${getPlatformColor(account.platform)}`}>
                                <Share2 className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="font-semibold text-sm">{account.displayName}</p>
                                <p className="text-xs text-gray-400">@{account.username}</p>
                                <p className="text-xs text-gray-500">
                                  {account.followers.toLocaleString()} followers
                                </p>
                              </div>
                            </div>
                            <Badge
                              className={
                                account.isConnected
                                  ? "bg-green-500/20 text-green-400"
                                  : "bg-gray-500/20 text-gray-400"
                              }
                            >
                              {account.isConnected ? "Connected" : "Disconnected"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <Card className="cyber-card p-6">
              <h3 className="text-xl font-bold mb-6">Social Media Analytics</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="cyber-card p-4">
                  <p className="text-sm text-gray-400 mb-1">Total Posts</p>
                  <p className="text-3xl font-bold">{analytics?.totalPosts || 0}</p>
                </Card>
                <Card className="cyber-card p-4">
                  <p className="text-sm text-gray-400 mb-1">Total Engagement</p>
                  <p className="text-3xl font-bold text-cyan-400">
                    {analytics?.totalEngagement.toLocaleString() || 0}
                  </p>
                </Card>
                <Card className="cyber-card p-4">
                  <p className="text-sm text-gray-400 mb-1">Total Reach</p>
                  <p className="text-3xl font-bold text-green-400">
                    {analytics?.totalReach.toLocaleString() || 0}
                  </p>
                </Card>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold mb-3">Platform Performance</h4>
                  <div className="space-y-2">
                    {analytics?.platformBreakdown.map((platform) => (
                      <div key={platform.platform} className="cyber-card p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Badge
                              variant="outline"
                              className={`${getPlatformColor(platform.platform)}`}
                            >
                              {platform.platform}
                            </Badge>
                            <div className="text-sm">
                              <p className="text-gray-400">
                                {platform.posts} posts • {platform.followers.toLocaleString()}{" "}
                                followers
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold">
                              {platform.engagement.toLocaleString()} engagements
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-3">Top Performing Posts</h4>
                  <div className="space-y-2">
                    {analytics?.topPerformingPosts.map((post) => (
                      <div key={post.id} className="cyber-card p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <Badge
                              variant="outline"
                              className={`mb-2 ${getPlatformColor(post.platform)}`}
                            >
                              {post.platform}
                            </Badge>
                            <p className="text-sm">{post.content}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-cyan-400">
                              {post.engagement.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-400">engagements</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Content Queues Tab */}
          <TabsContent value="queues" className="space-y-4">
            <Card className="cyber-card p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold">Content Queues</h3>
                  <Button className="bg-gradient-to-r from-purple-500 to-pink-500">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Queue
                  </Button>
                </div>

                <div className="space-y-3">
                  {queues.map((queue) => (
                    <div key={queue.id} className="cyber-card p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-lg">{queue.name}</h4>
                          <Badge className={getStatusColor(queue.status)}>
                            {queue.status}
                          </Badge>
                        </div>
                        <Button size="sm" variant="outline">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                        <div>
                          <p className="text-gray-500">Schedule</p>
                          <p className="font-semibold">
                            {queue.schedule.frequency} - {queue.schedule.times.join(", ")}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Platforms</p>
                          <div className="flex gap-1 flex-wrap">
                            {queue.platforms.map((platform, idx) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className={`text-xs ${getPlatformColor(platform)}`}
                              >
                                {platform}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-gray-500">Posts in Queue</p>
                          <p className="font-semibold">{queue.posts.length}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {queue.brands.map((brand, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="text-xs bg-purple-500/20 text-purple-400"
                          >
                            {brand}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                  {queues.length === 0 && (
                    <p className="text-center text-gray-400 py-8">No content queues found</p>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Hashtags Tab */}
          <TabsContent value="hashtags" className="space-y-4">
            <Card className="cyber-card p-6">
              <div className="space-y-4">
                <h3 className="text-xl font-bold">Hashtag Tracking</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {hashtags.map((hashtag) => (
                    <div key={hashtag.hashtag} className="cyber-card p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Hash className="h-5 w-5 text-cyan-400" />
                          <p className="font-semibold text-lg">{hashtag.hashtag}</p>
                        </div>
                        {hashtag.trending && (
                          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                            Trending
                          </Badge>
                        )}
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Uses</span>
                          <span className="font-semibold">{hashtag.uses}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Reach</span>
                          <span className="font-semibold text-green-400">
                            {hashtag.reach.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Engagement</span>
                          <span className="font-semibold text-cyan-400">
                            {hashtag.engagement.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {hashtags.length === 0 && (
                    <div className="col-span-3 text-center text-gray-400 py-8">
                      No hashtags tracked
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create Post Dialog */}
        <Dialog open={showCreatePost} onOpenChange={setShowCreatePost}>
          <DialogContent className="cyber-card max-w-3xl">
            <DialogHeader>
              <DialogTitle>Create Social Media Post</DialogTitle>
              <DialogDescription>Compose and schedule your post</DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const platforms = Array.from(
                  formData.getAll("platforms") as string[]
                );
                const brands = Array.from(formData.getAll("brands") as string[]);

                createPostMutation.mutate({
                  content: formData.get("content") as string,
                  platforms,
                  brands,
                  hashtags: (formData.get("hashtags") as string)
                    .split(",")
                    .map((h) => h.trim())
                    .filter((h) => h),
                  scheduledDate: formData.get("scheduledDate") as string,
                  status: "draft",
                });
              }}
            >
              <div className="space-y-4 py-4">
                <div>
                  <Label>Post Content</Label>
                  <Textarea
                    name="content"
                    required
                    className="cyber-input h-32"
                    placeholder="What's happening?"
                  />
                </div>

                <div>
                  <Label>Select Platforms</Label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {["twitter", "facebook", "instagram", "linkedin", "tiktok", "youtube", "bluesky"].map((platform) => (
                      <label key={platform} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" name="platforms" value={platform} />
                        <span className="text-sm capitalize">{platform}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Select Brands</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2 max-h-48 overflow-y-auto">
                    {FANZ_BRANDS.map((brand) => (
                      <label key={brand} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" name="brands" value={brand} />
                        <span className="text-sm">{brand}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Hashtags (comma separated)</Label>
                  <Input
                    name="hashtags"
                    placeholder="hashtag1, hashtag2, hashtag3"
                    className="cyber-input"
                  />
                </div>

                <div>
                  <Label>Schedule Date & Time (Optional)</Label>
                  <Input
                    type="datetime-local"
                    name="scheduledDate"
                    className="cyber-input"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreatePost(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-cyan-500 to-blue-500">
                  Create Post
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Connect Account Dialog */}
        <Dialog open={showConnectAccount} onOpenChange={setShowConnectAccount}>
          <DialogContent className="cyber-card max-w-md">
            <DialogHeader>
              <DialogTitle>Connect Social Account</DialogTitle>
              <DialogDescription>Link a social media account to your brand</DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                connectAccountMutation.mutate({
                  platform: formData.get("platform") as string,
                  brand: formData.get("brand") as string,
                });
              }}
            >
              <div className="space-y-4 py-4">
                <div>
                  <Label>Platform</Label>
                  <Select name="platform" required>
                    <SelectTrigger className="cyber-input">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="twitter">Twitter/X</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="tiktok">TikTok</SelectItem>
                      <SelectItem value="youtube">YouTube</SelectItem>
                      <SelectItem value="bluesky">Bluesky</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Brand</Label>
                  <Select name="brand" required>
                    <SelectTrigger className="cyber-input">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FANZ_BRANDS.map((brand) => (
                        <SelectItem key={brand} value={brand}>
                          {brand}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowConnectAccount(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Connect Account</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
