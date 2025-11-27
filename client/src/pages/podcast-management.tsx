import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import {
  Mic,
  Headphones,
  Play,
  Pause,
  Square,
  Upload,
  Download,
  Users,
  Calendar,
  Clock,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BarChart3,
  TrendingUp,
  Volume2,
  Music,
  FileAudio,
  Globe,
  Share2,
  Star,
  MessageCircle,
  ThumbsUp,
  Settings,
  Filter,
  Shield,
} from "lucide-react";
import { SEOHeadTags } from "@/components/SEOHeadTags";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface Podcast {
  id: string;
  title: string;
  description: string;
  hostName: string;
  hostId: string;
  category: string;
  status: "active" | "draft" | "archived";
  totalEpisodes: number;
  totalListeners: number;
  averageRating: number;
  lastEpisodeDate: string;
  createdAt: string;
  coverImageUrl?: string;
  isExplicit: boolean;
  language: string;
  website?: string;
}

interface Episode {
  id: string;
  podcastId: string;
  title: string;
  description: string;
  audioUrl: string;
  duration: string;
  fileSize: string;
  status: "published" | "draft" | "scheduled" | "processing";
  publishDate: string;
  listens: number;
  downloads: number;
  rating: number;
  transcript?: string;
  chapters?: Array<{ time: string; title: string }>;
  isExplicit: boolean;
  seasonNumber?: number;
  episodeNumber: number;
  createdAt: string;
}

interface PodcastAnalytics {
  totalListens: number;
  totalDownloads: number;
  averageListenDuration: string;
  topEpisodes: Array<{ title: string; listens: number }>;
  demographicData: {
    ageGroups: Array<{ group: string; percentage: number }>;
    topCountries: Array<{ country: string; percentage: number }>;
  };
  growthMetrics: {
    weeklyGrowth: number;
    monthlyGrowth: number;
  };
}

export default function PodcastManagementPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPodcast, setSelectedPodcast] = useState<Podcast | null>(null);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [newPodcastTitle, setNewPodcastTitle] = useState("");
  const [newPodcastCategory, setNewPodcastCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch podcasts from API
  const { data: podcasts = [], isLoading: podcastsLoading } = useQuery<Podcast[]>({
    queryKey: ["/api/podcasts"],
    refetchInterval: 15000,
  });

  // Fetch episodes from API
  const { data: episodes = [], isLoading: episodesLoading } = useQuery<Episode[]>({
    queryKey: ["/api/podcasts/episodes"],
    refetchInterval: 15000,
  });

  // Fetch analytics from API
  const { data: analytics } = useQuery<PodcastAnalytics>({
    queryKey: ["/api/podcasts/analytics"],
    refetchInterval: 60000,
  });

  // Removed mock data - now fetching from API
  const _podcasts_removed: Podcast[] = [
    {
      id: "pod-1",
      title: "Creator Conversations",
      description:
        "Deep dive interviews with top content creators on Fanz™ platform",
      hostName: "Sarah Mitchell",
      hostId: "host-1",
      category: "Business",
      status: "active",
      totalEpisodes: 45,
      totalListeners: 12847,
      averageRating: 4.7,
      lastEpisodeDate: "2025-01-14T10:00:00Z",
      createdAt: "2024-08-15T00:00:00Z",
      isExplicit: false,
      language: "English",
      website: "https://creatorconversations.fanzunlimited.com",
    },
    {
      id: "pod-2",
      title: "Tech Talk Weekly",
      description: "Latest trends in creator economy technology and platforms",
      hostName: "Mike Rodriguez",
      hostId: "host-2",
      category: "Technology",
      status: "active",
      totalEpisodes: 78,
      totalListeners: 8432,
      averageRating: 4.2,
      lastEpisodeDate: "2025-01-12T15:30:00Z",
      createdAt: "2024-06-01T00:00:00Z",
      isExplicit: false,
      language: "English",
    },
    {
      id: "pod-3",
      title: "Behind the Scenes",
      description: "Exclusive behind-the-scenes content from Fanz™ creators",
      hostName: "Alex Chen",
      hostId: "host-3",
      category: "Entertainment",
      status: "draft",
      totalEpisodes: 12,
      totalListeners: 3251,
      averageRating: 4.9,
      lastEpisodeDate: "2025-01-10T12:00:00Z",
      createdAt: "2024-12-01T00:00:00Z",
      isExplicit: true,
      language: "English",
    },
  ];

  // Removed mock episodes - now fetching from API above
  const _episodes_removed: Episode[] = [
    {
      id: "ep-1",
      podcastId: "pod-1",
      title: "Building a Million-Dollar Creator Brand",
      description:
        "Interview with top creator about building and scaling their brand on Fanz™",
      audioUrl: "https://cdn.fanzunlimited.com/podcasts/ep-1.mp3",
      duration: "58:32",
      fileSize: "84.2 MB",
      status: "published",
      publishDate: "2025-01-14T10:00:00Z",
      listens: 2847,
      downloads: 1923,
      rating: 4.8,
      isExplicit: false,
      episodeNumber: 45,
      createdAt: "2025-01-13T14:30:00Z",
    },
    {
      id: "ep-2",
      podcastId: "pod-1",
      title: "Content Strategy Masterclass",
      description: "Deep dive into content planning and strategy for creators",
      audioUrl: "https://cdn.fanzunlimited.com/podcasts/ep-2.mp3",
      duration: "42:18",
      fileSize: "61.5 MB",
      status: "published",
      publishDate: "2025-01-07T10:00:00Z",
      listens: 3124,
      downloads: 2087,
      rating: 4.6,
      isExplicit: false,
      episodeNumber: 44,
      createdAt: "2025-01-06T16:15:00Z",
    },
    {
      id: "ep-3",
      podcastId: "pod-2",
      title: "AI in Creator Economy: Future Trends",
      description:
        "Exploring how AI is transforming the creator economy landscape",
      audioUrl: "https://cdn.fanzunlimited.com/podcasts/ep-3.mp3",
      duration: "51:45",
      fileSize: "75.3 MB",
      status: "processing",
      publishDate: "2025-01-16T15:30:00Z",
      listens: 0,
      downloads: 0,
      rating: 0,
      isExplicit: false,
      episodeNumber: 79,
      createdAt: "2025-01-15T09:00:00Z",
    },
  ];

  // Removed mock analytics - now fetching from API above
  const _analyticsRemoved: PodcastAnalytics = {
    totalListens: 24503,
    totalDownloads: 18742,
    averageListenDuration: "34:28",
    topEpisodes: [
      { title: "Building a Million-Dollar Creator Brand", listens: 2847 },
      { title: "Content Strategy Masterclass", listens: 3124 },
      { title: "Monetization Secrets Revealed", listens: 2456 },
    ],
    demographicData: {
      ageGroups: [
        { group: "18-25", percentage: 28 },
        { group: "26-34", percentage: 35 },
        { group: "35-44", percentage: 22 },
        { group: "45+", percentage: 15 },
      ],
      topCountries: [
        { country: "United States", percentage: 42 },
        { country: "Canada", percentage: 18 },
        { country: "United Kingdom", percentage: 15 },
        { country: "Australia", percentage: 12 },
      ],
    },
    growthMetrics: {
      weeklyGrowth: 12.5,
      monthlyGrowth: 28.3,
    },
  };

  const createPodcastMutation = useMutation({
    mutationFn: async (data: { title: string; category: string }) => {
      return apiRequest("/api/podcasts", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/podcasts"] });
      setNewPodcastTitle("");
      setNewPodcastCategory("");
      toast({
        title: "Podcast Created",
        description: "New podcast series created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Creation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return (
          <Badge className="bg-green-500/20 text-green-400">
            <CheckCircle className="w-3 h-3 mr-1" />
            Published
          </Badge>
        );
      case "draft":
        return (
          <Badge className="bg-yellow-500/20 text-yellow-400">
            <Edit className="w-3 h-3 mr-1" />
            Draft
          </Badge>
        );
      case "scheduled":
        return (
          <Badge className="bg-blue-500/20 text-blue-400">
            <Calendar className="w-3 h-3 mr-1" />
            Scheduled
          </Badge>
        );
      case "processing":
        return (
          <Badge className="bg-orange-500/20 text-orange-400">
            <Clock className="w-3 h-3 mr-1" />
            Processing
          </Badge>
        );
      case "active":
        return (
          <Badge className="bg-green-500/20 text-green-400">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </Badge>
        );
      case "archived":
        return <Badge variant="secondary">Archived</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-400"}`}
      />
    ));
  };

  const filteredPodcasts = podcasts.filter((podcast) => {
    const matchesSearch =
      podcast.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      podcast.hostName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || podcast.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen p-6 cyber-bg">
      <SEOHeadTags
        title="Podcast Management & Analytics - Fanz™ Unlimited Network LLC"
        description="Comprehensive podcast management system with episode organization, analytics, and content moderation for creators."
        canonicalUrl="https://fanzunlimited.com/podcast-management"
      />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold cyber-text-glow flex items-center gap-2">
              <Mic className="w-8 h-8 text-primary" />
              Podcast Management
            </h1>
            <p className="text-muted-foreground">
              Enterprise podcast hosting and analytics platform
            </p>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="cyber-button">
                <Mic className="w-4 h-4 mr-2" />
                Create Podcast
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Podcast Series</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Podcast Title</Label>
                  <Input
                    value={newPodcastTitle}
                    onChange={(e) => setNewPodcastTitle(e.target.value)}
                    placeholder="Enter podcast title"
                    className="glass-effect"
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select
                    value={newPodcastCategory}
                    onValueChange={setNewPodcastCategory}
                  >
                    <SelectTrigger className="glass-effect">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="entertainment">
                        Entertainment
                      </SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="health">Health & Wellness</SelectItem>
                      <SelectItem value="arts">Arts & Culture</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={() =>
                    createPodcastMutation.mutate({
                      title: newPodcastTitle,
                      category: newPodcastCategory,
                    })
                  }
                  className="w-full cyber-button"
                  disabled={!newPodcastTitle || !newPodcastCategory}
                >
                  Create Podcast
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="cyber-border">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-400 cyber-text-glow">
                {podcasts.length}
              </div>
              <div className="text-sm text-muted-foreground">
                Active Podcasts
              </div>
            </CardContent>
          </Card>
          <Card className="cyber-border">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-400 cyber-text-glow">
                {analytics.totalListens.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Total Listens</div>
            </CardContent>
          </Card>
          <Card className="cyber-border">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-400 cyber-text-glow">
                {episodes.length}
              </div>
              <div className="text-sm text-muted-foreground">
                Total Episodes
              </div>
            </CardContent>
          </Card>
          <Card className="cyber-border">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary cyber-text-glow">
                {analytics.averageListenDuration}
              </div>
              <div className="text-sm text-muted-foreground">Avg Duration</div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Podcasts</TabsTrigger>
            <TabsTrigger value="episodes">Episodes</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="moderation">Moderation</TabsTrigger>
          </TabsList>

          {/* Podcasts Overview */}
          <TabsContent value="overview">
            <Card className="cyber-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Headphones className="w-5 h-5 text-primary" />
                  Podcast Library
                </CardTitle>
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <Input
                      placeholder="Search podcasts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="glass-effect"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px] glass-effect">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredPodcasts.map((podcast) => (
                    <Card
                      key={podcast.id}
                      className="cyber-card border border-primary/20"
                    >
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg line-clamp-2">
                                {podcast.title}
                              </h3>
                              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                {podcast.description}
                              </p>
                              <p className="text-sm font-medium mt-2">
                                Host: {podcast.hostName}
                              </p>
                            </div>
                            {getStatusBadge(podcast.status)}
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">
                                Episodes:
                              </span>
                              <p className="font-medium">
                                {podcast.totalEpisodes}
                              </p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">
                                Listeners:
                              </span>
                              <p className="font-medium">
                                {podcast.totalListeners.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">
                                Category:
                              </span>
                              <p className="font-medium">{podcast.category}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">
                                Rating:
                              </span>
                              <div className="flex items-center gap-1">
                                {getRatingStars(
                                  Math.round(podcast.averageRating),
                                )}
                                <span className="font-medium ml-1">
                                  {podcast.averageRating}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-border">
                            <div className="text-xs text-muted-foreground">
                              Last episode:{" "}
                              {new Date(
                                podcast.lastEpisodeDate,
                              ).toLocaleDateString()}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="cyber-border"
                                onClick={() => setSelectedPodcast(podcast)}
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                View
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="cyber-border"
                              >
                                <Settings className="w-3 h-3 mr-1" />
                                Manage
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Episodes */}
          <TabsContent value="episodes">
            <Card className="cyber-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileAudio className="w-5 h-5 text-primary" />
                  Episode Management
                </CardTitle>
                <div className="flex gap-4">
                  <Select defaultValue="pod-1">
                    <SelectTrigger className="w-[250px] glass-effect">
                      <SelectValue placeholder="Select podcast" />
                    </SelectTrigger>
                    <SelectContent>
                      {podcasts.map((podcast) => (
                        <SelectItem key={podcast.id} value={podcast.id}>
                          {podcast.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button className="cyber-button">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Episode
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Episode</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Listens</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Published</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {episodes.map((episode) => (
                        <TableRow key={episode.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{episode.title}</p>
                              <p className="text-sm text-muted-foreground">
                                #{episode.episodeNumber}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>{episode.duration}</TableCell>
                          <TableCell>
                            {getStatusBadge(episode.status)}
                          </TableCell>
                          <TableCell>
                            {episode.listens.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {getRatingStars(Math.round(episode.rating))}
                              <span className="text-sm ml-1">
                                {episode.rating || "-"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Date(episode.publishDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0"
                              >
                                <Eye className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0"
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0"
                              >
                                <Download className="w-3 h-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="cyber-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Top Performing Episodes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.topEpisodes.map((episode, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border border-primary/20 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-sm line-clamp-1">
                            {episode.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Users className="w-3 h-3 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {episode.listens.toLocaleString()} listens
                            </span>
                          </div>
                        </div>
                        <Badge className="bg-primary/20 text-primary">
                          #{index + 1}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="cyber-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Growth Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border border-green-500/20 rounded-lg bg-green-500/10">
                      <div>
                        <p className="font-medium">Weekly Growth</p>
                        <p className="text-sm text-muted-foreground">
                          Listener increase
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-green-400 font-bold text-lg">
                          +{analytics.growthMetrics.weeklyGrowth}%
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 border border-blue-500/20 rounded-lg bg-blue-500/10">
                      <div>
                        <p className="font-medium">Monthly Growth</p>
                        <p className="text-sm text-muted-foreground">
                          Overall expansion
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-blue-400 font-bold text-lg">
                          +{analytics.growthMetrics.monthlyGrowth}%
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="cyber-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-primary" />
                    Audience Demographics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm mb-2">Age Groups</h4>
                      <div className="space-y-2">
                        {analytics.demographicData.ageGroups.map((group) => (
                          <div
                            key={group.group}
                            className="flex items-center justify-between"
                          >
                            <span className="text-sm">{group.group}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary transition-all"
                                  style={{ width: `${group.percentage}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium w-8 text-right">
                                {group.percentage}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm mb-2">
                        Top Countries
                      </h4>
                      <div className="space-y-2">
                        {analytics.demographicData.topCountries.map(
                          (country) => (
                            <div
                              key={country.country}
                              className="flex items-center justify-between"
                            >
                              <span className="text-sm">{country.country}</span>
                              <span className="text-sm font-medium">
                                {country.percentage}%
                              </span>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="cyber-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Volume2 className="w-5 h-5 text-primary" />
                    Engagement Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 border border-primary/20 rounded-lg">
                      <div className="text-2xl font-bold text-blue-400">
                        {analytics.totalListens.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total Listens
                      </div>
                    </div>
                    <div className="text-center p-4 border border-primary/20 rounded-lg">
                      <div className="text-2xl font-bold text-green-400">
                        {analytics.totalDownloads.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Downloads
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 p-4 border border-primary/20 rounded-lg text-center">
                    <div className="text-xl font-bold text-primary">
                      {analytics.averageListenDuration}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Average Listen Time
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Moderation */}
          <TabsContent value="moderation">
            <Card className="cyber-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Content Moderation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-medium">Flagged Content</h3>
                    <div className="border border-yellow-500/20 rounded-lg p-4 bg-yellow-500/10">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            Episode #44: Content Strategy Masterclass
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Auto-flagged for language review
                          </p>
                          <div className="flex gap-2 mt-2">
                            <Button size="sm" className="cyber-button h-6">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="h-6"
                            >
                              <XCircle className="w-3 h-3 mr-1" />
                              Block
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border border-red-500/20 rounded-lg p-4 bg-red-500/10">
                      <div className="flex items-start gap-3">
                        <XCircle className="w-5 h-5 text-red-400 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            Episode #78: Tech Talk Special
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Copyright claim reported
                          </p>
                          <div className="flex gap-2 mt-2">
                            <Button size="sm" variant="outline" className="h-6">
                              <MessageCircle className="w-3 h-3 mr-1" />
                              Review
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="h-6"
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium">Moderation Stats</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 border border-primary/20 rounded-lg">
                        <div className="text-2xl font-bold text-green-400">
                          234
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Approved
                        </div>
                      </div>
                      <div className="text-center p-4 border border-primary/20 rounded-lg">
                        <div className="text-2xl font-bold text-red-400">
                          12
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Blocked
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Auto-moderation accuracy</span>
                        <span className="font-medium">94.2%</span>
                      </div>
                      <Progress value={94.2} className="h-2" />

                      <div className="flex items-center justify-between text-sm">
                        <span>Response time</span>
                        <span className="font-medium">&lt; 2 hours</span>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
