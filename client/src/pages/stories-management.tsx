import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Play,
  Image as ImageIcon,
  Type,
  Palette,
  Settings,
  Plus,
  Trash2,
  Eye,
  Clock,
  Users,
  FileImage,
  Download,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface StorySettings {
  id: string;
  storyStatus: boolean;
  storyImage: boolean;
  storyText: boolean;
  storyVideo: boolean;
  maxVideoLength: number;
  autoDeleteAfter: number;
  allowDownload: boolean;
}

interface StoryBackground {
  id: string;
  name: string;
  imageUrl: string;
  category: string;
  isActive: boolean;
  createdAt: string;
}

interface StoryFont {
  id: string;
  name: string;
  fontFamily: string;
  googleFontName?: string;
  isActive: boolean;
  createdAt: string;
}

interface StoryPost {
  id: string;
  userId: string;
  username: string;
  title?: string;
  mediaType: "image" | "video" | "text";
  mediaUrl?: string;
  textContent?: string;
  backgroundColor?: string;
  backgroundImageUrl?: string;
  fontFamily?: string;
  fontSize?: number;
  textColor?: string;
  duration: number;
  viewCount: number;
  isActive: boolean;
  expiresAt: string;
  createdAt: string;
}

export default function StoriesManagement() {
  const [activeTab, setActiveTab] = useState("settings");
  const [selectedBackground, setSelectedBackground] =
    useState<StoryBackground | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch story settings from API
  const { data: storySettings } = useQuery<StorySettings>({
    queryKey: ["/api/admin/stories/settings"],
    refetchInterval: 60000,
  });

  // Fetch story backgrounds from API
  const { data: storyBackgrounds = [] } = useQuery<StoryBackground[]>({
    queryKey: ["/api/admin/stories/backgrounds"],
    refetchInterval: 60000,
  });

  // Fetch story fonts from API
  const { data: storyFonts = [] } = useQuery<StoryFont[]>({
    queryKey: ["/api/admin/stories/fonts"],
    refetchInterval: 60000,
  });

  // Fetch story posts from API
  const { data: storyPosts = [], isLoading } = useQuery<StoryPost[]>({
    queryKey: ["/api/admin/stories/posts"],
    refetchInterval: 10000,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (data: Partial<StorySettings>) =>
      apiRequest("/api/admin/stories/settings", "PATCH", data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/admin/stories/settings"],
      });
      toast({ title: "Story settings updated successfully" });
    },
  });

  const deleteBackgroundMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/api/admin/stories/backgrounds/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/admin/stories/backgrounds"],
      });
      toast({ title: "Background deleted successfully" });
    },
  });

  const deleteFontMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/api/admin/stories/fonts/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stories/fonts"] });
      toast({ title: "Font deleted successfully" });
    },
  });

  const deleteStoryMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/api/admin/stories/posts/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stories/posts"] });
      toast({ title: "Story deleted successfully" });
    },
  });

  const handleSettingsChange = (field: keyof StorySettings, value: any) => {
    updateSettingsMutation.mutate({ [field]: value });
  };

  const getMediaTypeIcon = (type: string) => {
    switch (type) {
      case "image":
        return <ImageIcon className="h-4 w-4" />;
      case "video":
        return <Play className="h-4 w-4" />;
      case "text":
        return <Type className="h-4 w-4" />;
      default:
        return <ImageIcon className="h-4 w-4" />;
    }
  };

  const getMediaTypeBadge = (type: string) => {
    const variants = {
      image: "default",
      video: "secondary",
      text: "outline",
    } as const;

    return (
      <Badge variant={variants[type as keyof typeof variants] || "default"}>
        {type}
      </Badge>
    );
  };

  const formatTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diffHours = Math.max(
      0,
      Math.floor((expires.getTime() - now.getTime()) / (1000 * 60 * 60)),
    );
    return `${diffHours}h remaining`;
  };

  const getStatsOverview = () => {
    const totalViews = storyPosts.reduce(
      (sum, post) => sum + post.viewCount,
      0,
    );
    const activeStories = storyPosts.filter((post) => post.isActive).length;
    const totalCreators = new Set(storyPosts.map((post) => post.userId)).size;

    return { totalViews, activeStories, totalCreators };
  };

  const stats = getStatsOverview();

  return (
    <div
      className="container mx-auto p-6 space-y-6"
      data-testid="stories-management"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold cyber-text-glow">
            Stories Management
          </h1>
          <p className="text-muted-foreground">
            Manage ephemeral content, backgrounds, fonts, and story settings
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Play className="h-5 w-5" />
          <span className="text-sm font-medium">
            {stats.activeStories} Active Stories
          </span>
        </div>
      </div>

      {/* Stories Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="cyber-border">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Play className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm font-medium">Active Stories</p>
                <p className="text-2xl font-bold">{stats.activeStories}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cyber-border">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Total Views</p>
                <p className="text-2xl font-bold">
                  {stats.totalViews.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cyber-border">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm font-medium">Active Creators</p>
                <p className="text-2xl font-bold">{stats.totalCreators}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cyber-border">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Palette className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Backgrounds</p>
                <p className="text-2xl font-bold">{storyBackgrounds.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="posts">Posts ({storyPosts.length})</TabsTrigger>
          <TabsTrigger value="backgrounds">
            Backgrounds ({storyBackgrounds.length})
          </TabsTrigger>
          <TabsTrigger value="fonts">Fonts ({storyFonts.length})</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-6">
          <Card className="cyber-border">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Story Settings
              </CardTitle>
              <CardDescription>
                Configure story features and content policies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="story-status">Enable Stories</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow creators to post ephemeral stories
                  </p>
                </div>
                <Switch
                  id="story-status"
                  checked={storySettings?.storyStatus ?? false}
                  onCheckedChange={(checked) =>
                    handleSettingsChange("storyStatus", checked)
                  }
                  data-testid="switch-story-status"
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Content Types</h3>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="story-image">Image Stories</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow photo uploads and image stories
                    </p>
                  </div>
                  <Switch
                    id="story-image"
                    checked={storySettings?.storyImage ?? false}
                    onCheckedChange={(checked) =>
                      handleSettingsChange("storyImage", checked)
                    }
                    data-testid="switch-story-image"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="story-text">Text Stories</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow text-only stories with backgrounds
                    </p>
                  </div>
                  <Switch
                    id="story-text"
                    checked={storySettings?.storyText ?? false}
                    onCheckedChange={(checked) =>
                      handleSettingsChange("storyText", checked)
                    }
                    data-testid="switch-story-text"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="story-video">Video Stories</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow video uploads and video stories
                    </p>
                  </div>
                  <Switch
                    id="story-video"
                    checked={storySettings?.storyVideo ?? false}
                    onCheckedChange={(checked) =>
                      handleSettingsChange("storyVideo", checked)
                    }
                    data-testid="switch-story-video"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="max-video-length">
                    Max Video Length (seconds)
                  </Label>
                  <Select
                    value={(storySettings?.maxVideoLength ?? 30).toString()}
                    onValueChange={(value) =>
                      handleSettingsChange("maxVideoLength", parseInt(value))
                    }
                  >
                    <SelectTrigger data-testid="select-max-video-length">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 seconds</SelectItem>
                      <SelectItem value="15">15 seconds</SelectItem>
                      <SelectItem value="20">20 seconds</SelectItem>
                      <SelectItem value="30">30 seconds</SelectItem>
                      <SelectItem value="60">60 seconds</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="auto-delete">Auto Delete After (hours)</Label>
                  <Select
                    value={(storySettings?.autoDeleteAfter ?? 24).toString()}
                    onValueChange={(value) =>
                      handleSettingsChange("autoDeleteAfter", parseInt(value))
                    }
                  >
                    <SelectTrigger data-testid="select-auto-delete">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12">12 hours</SelectItem>
                      <SelectItem value="24">24 hours</SelectItem>
                      <SelectItem value="48">48 hours</SelectItem>
                      <SelectItem value="72">72 hours</SelectItem>
                      <SelectItem value="168">1 week</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="allow-download">Allow Downloads</Label>
                  <p className="text-sm text-muted-foreground">
                    Let users download stories before they expire
                  </p>
                </div>
                <Switch
                  id="allow-download"
                  checked={storySettings?.allowDownload ?? false}
                  onCheckedChange={(checked) =>
                    handleSettingsChange("allowDownload", checked)
                  }
                  data-testid="switch-allow-download"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="posts" className="space-y-6">
          <Card className="cyber-border">
            <CardHeader>
              <CardTitle>Story Posts</CardTitle>
              <CardDescription>
                Manage user-created story content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Creator</TableHead>
                    <TableHead>Content</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {storyPosts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell>
                        <div className="font-medium">@{post.username}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          {post.mediaUrl && (
                            <div className="w-10 h-10 rounded bg-muted">
                              <img
                                src={post.mediaUrl}
                                alt="Story preview"
                                className="w-full h-full object-cover rounded"
                              />
                            </div>
                          )}
                          <div>
                            <div className="font-medium">
                              {post.title || post.textContent || "Untitled"}
                            </div>
                            {post.textContent && post.mediaType === "text" && (
                              <div className="text-sm text-muted-foreground">
                                Text story
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getMediaTypeBadge(post.mediaType)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Eye className="h-4 w-4" />
                          <span>{post.viewCount.toLocaleString()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm">
                            {formatTimeRemaining(post.expiresAt)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            data-testid={`button-view-story-${post.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {storySettings?.allowDownload && (
                            <Button
                              variant="outline"
                              size="sm"
                              data-testid={`button-download-story-${post.id}`}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteStoryMutation.mutate(post.id)}
                            data-testid={`button-delete-story-${post.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backgrounds" className="space-y-6">
          <Card className="cyber-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Story Backgrounds</CardTitle>
                  <CardDescription>
                    Manage background images and patterns for stories
                  </CardDescription>
                </div>
                <Button data-testid="button-add-background">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Background
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {storyBackgrounds.map((background) => (
                  <div key={background.id} className="relative group">
                    <div className="aspect-[9/16] bg-muted rounded-lg overflow-hidden">
                      <img
                        src={background.imageUrl}
                        alt={background.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <div className="flex items-center space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => setSelectedBackground(background)}
                              data-testid={`button-view-background-${background.id}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>{background.name}</DialogTitle>
                              <DialogDescription>
                                Category: {background.category}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="aspect-[9/16] bg-muted rounded-lg overflow-hidden">
                              <img
                                src={background.imageUrl}
                                alt={background.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            deleteBackgroundMutation.mutate(background.id)
                          }
                          data-testid={`button-delete-background-${background.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm font-medium">{background.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {background.category}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fonts" className="space-y-6">
          <Card className="cyber-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Story Fonts</CardTitle>
                  <CardDescription>
                    Manage Google Fonts available for text stories
                  </CardDescription>
                </div>
                <Button data-testid="button-add-font">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Font
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Font Name</TableHead>
                    <TableHead>Preview</TableHead>
                    <TableHead>Google Font</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {storyFonts.map((font) => (
                    <TableRow key={font.id}>
                      <TableCell>
                        <div className="font-medium">{font.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {font.fontFamily}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div
                          style={{ fontFamily: font.fontFamily }}
                          className="text-lg"
                        >
                          The quick brown fox
                        </div>
                      </TableCell>
                      <TableCell>
                        {font.googleFontName ? (
                          <Badge variant="default">{font.googleFontName}</Badge>
                        ) : (
                          <Badge variant="secondary">System Font</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={font.isActive ? "default" : "secondary"}
                        >
                          {font.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteFontMutation.mutate(font.id)}
                          data-testid={`button-delete-font-${font.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="cyber-border">
              <CardHeader>
                <CardTitle>Views by Content Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {["image", "video", "text"].map((type) => {
                    const typePosts = storyPosts.filter(
                      (p) => p.mediaType === type,
                    );
                    const totalViews = typePosts.reduce(
                      (sum, p) => sum + p.viewCount,
                      0,
                    );
                    const avgViews =
                      typePosts.length > 0
                        ? Math.round(totalViews / typePosts.length)
                        : 0;

                    return (
                      <div
                        key={type}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-2">
                          {getMediaTypeIcon(type)}
                          <span className="capitalize">{type} Stories</span>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            {totalViews.toLocaleString()} views
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {avgViews} avg per post
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="cyber-border">
              <CardHeader>
                <CardTitle>Top Performing Stories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {storyPosts
                    .sort((a, b) => b.viewCount - a.viewCount)
                    .slice(0, 5)
                    .map((post) => (
                      <div
                        key={post.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-2">
                          {getMediaTypeIcon(post.mediaType)}
                          <div>
                            <div className="font-medium">@{post.username}</div>
                            <div className="text-sm text-muted-foreground">
                              {post.title || post.textContent || "Untitled"}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            {post.viewCount.toLocaleString()}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            views
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
