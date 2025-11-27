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
import {
  Radio,
  Mic,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Square,
  Users,
  MessageCircle,
  Shield,
  Settings,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Headphones,
  Wifi,
  WifiOff,
  Clock,
  BarChart3,
  Zap,
  Activity,
  Globe,
  Music,
} from "lucide-react";
import { SEOHeadTags } from "@/components/SEOHeadTags";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface RadioStation {
  id: string;
  name: string;
  description: string;
  streamUrl: string;
  status: "live" | "offline" | "scheduled";
  currentDJ: string;
  listeners: number;
  genre: string;
  bitrate: string;
  isModerated: boolean;
  moderationLevel: "low" | "medium" | "high";
  createdAt: string;
  lastActive: string;
  maxListeners: number;
}

interface RadioModerationAction {
  id: string;
  stationId: string;
  stationName: string;
  action: "mute" | "kick" | "ban" | "warning" | "content_flag";
  targetUser?: string;
  reason: string;
  moderatorId: string;
  moderatorName: string;
  timestamp: string;
  duration?: string;
}

interface LiveChat {
  id: string;
  stationId: string;
  username: string;
  message: string;
  timestamp: string;
  isModerated: boolean;
  isFlagged: boolean;
}

export default function RadioBroadcastingPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedStation, setSelectedStation] = useState<RadioStation | null>(
    null,
  );
  const [moderationTarget, setModerationTarget] = useState("");
  const [moderationReason, setModerationReason] = useState("");
  const [selectedAction, setSelectedAction] = useState("");
  const [newStationName, setNewStationName] = useState("");
  const [newStationGenre, setNewStationGenre] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data - in production this would come from APIs
  const radioStations: RadioStation[] = [
    {
      id: "station-1",
      name: "Fanz™ Live Radio",
      description: "Premium live radio with creator content",
      streamUrl: "https://stream.fanzunlimited.com/live",
      status: "live",
      currentDJ: "DJ Premium",
      listeners: 1247,
      genre: "Talk/Music",
      bitrate: "320kbps",
      isModerated: true,
      moderationLevel: "high",
      createdAt: "2025-01-10T10:00:00Z",
      lastActive: "2025-01-15T18:30:00Z",
      maxListeners: 5000,
    },
    {
      id: "station-2",
      name: "Creator Spotlight",
      description: "Featuring top creators and exclusive interviews",
      streamUrl: "https://stream.fanzunlimited.com/spotlight",
      status: "scheduled",
      currentDJ: "Host Sarah",
      listeners: 0,
      genre: "Interview",
      bitrate: "256kbps",
      isModerated: true,
      moderationLevel: "medium",
      createdAt: "2025-01-12T14:00:00Z",
      lastActive: "2025-01-14T20:00:00Z",
      maxListeners: 2000,
    },
    {
      id: "station-3",
      name: "Community Vibes",
      description: "Community-driven content and discussions",
      streamUrl: "https://stream.fanzunlimited.com/community",
      status: "offline",
      currentDJ: "Auto DJ",
      listeners: 0,
      genre: "Community",
      bitrate: "192kbps",
      isModerated: false,
      moderationLevel: "low",
      createdAt: "2025-01-08T16:00:00Z",
      lastActive: "2025-01-13T12:00:00Z",
      maxListeners: 1000,
    },
  ];

  const moderationActions: RadioModerationAction[] = [
    {
      id: "mod-1",
      stationId: "station-1",
      stationName: "Fanz™ Live Radio",
      action: "mute",
      targetUser: "user123",
      reason: "Inappropriate language in chat",
      moderatorId: "mod1",
      moderatorName: "Moderator Alpha",
      timestamp: "2025-01-15T18:25:00Z",
      duration: "10 minutes",
    },
    {
      id: "mod-2",
      stationId: "station-2",
      stationName: "Creator Spotlight",
      action: "content_flag",
      reason: "Content violation reported by multiple users",
      moderatorId: "mod2",
      moderatorName: "Moderator Beta",
      timestamp: "2025-01-15T17:45:00Z",
    },
  ];

  const liveChatMessages: LiveChat[] = [
    {
      id: "chat-1",
      stationId: "station-1",
      username: "MusicLover92",
      message: "Great show tonight! Love this track selection!",
      timestamp: "2025-01-15T18:30:00Z",
      isModerated: false,
      isFlagged: false,
    },
    {
      id: "chat-2",
      stationId: "station-1",
      username: "RadioFan",
      message: "When is the next interview segment?",
      timestamp: "2025-01-15T18:28:00Z",
      isModerated: false,
      isFlagged: false,
    },
    {
      id: "chat-3",
      stationId: "station-1",
      username: "TrollUser",
      message: "[FLAGGED CONTENT]",
      timestamp: "2025-01-15T18:25:00Z",
      isModerated: true,
      isFlagged: true,
    },
  ];

  const createStationMutation = useMutation({
    mutationFn: async (data: { name: string; genre: string }) => {
      return apiRequest("/api/radio/stations", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/radio/stations"] });
      setNewStationName("");
      setNewStationGenre("");
      toast({
        title: "Station Created",
        description: "New radio station created successfully",
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

  const moderationMutation = useMutation({
    mutationFn: async (data: {
      stationId: string;
      action: string;
      targetUser?: string;
      reason: string;
    }) => {
      return apiRequest("/api/radio/moderate", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/radio/moderation"] });
      setModerationTarget("");
      setModerationReason("");
      setSelectedAction("");
      toast({
        title: "Moderation Applied",
        description: "Radio moderation action completed successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Moderation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "live":
        return (
          <Badge className="bg-red-500/20 text-red-400">
            <Activity className="w-3 h-3 mr-1" />
            Live
          </Badge>
        );
      case "scheduled":
        return (
          <Badge className="bg-yellow-500/20 text-yellow-400">
            <Clock className="w-3 h-3 mr-1" />
            Scheduled
          </Badge>
        );
      case "offline":
        return (
          <Badge variant="secondary">
            <WifiOff className="w-3 h-3 mr-1" />
            Offline
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getModerationLevelBadge = (level: string) => {
    switch (level) {
      case "high":
        return <Badge className="bg-red-500/20 text-red-400">High</Badge>;
      case "medium":
        return (
          <Badge className="bg-yellow-500/20 text-yellow-400">Medium</Badge>
        );
      case "low":
        return <Badge className="bg-green-500/20 text-green-400">Low</Badge>;
      default:
        return <Badge variant="outline">{level}</Badge>;
    }
  };

  const handleModeration = () => {
    if (!selectedStation || !selectedAction || !moderationReason) {
      toast({
        title: "Missing Information",
        description: "Please fill in all moderation fields",
        variant: "destructive",
      });
      return;
    }

    moderationMutation.mutate({
      stationId: selectedStation.id,
      action: selectedAction,
      targetUser: moderationTarget || undefined,
      reason: moderationReason,
    });
  };

  return (
    <div className="min-h-screen p-6 cyber-bg">
      <SEOHeadTags
        title="Live Radio Broadcasting & Moderation - Fanz™ Unlimited Network LLC"
        description="Manage live radio stations, monitor broadcasts, and moderate content with enterprise-grade tools for radio broadcasting."
        canonicalUrl="https://fanzunlimited.com/radio-broadcasting"
      />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold cyber-text-glow flex items-center gap-2">
              <Radio className="w-8 h-8 text-primary" />
              Live Radio Broadcasting
            </h1>
            <p className="text-muted-foreground">
              Enterprise radio management with real-time moderation
            </p>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="cyber-button">
                <Radio className="w-4 h-4 mr-2" />
                Create Station
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Radio Station</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Station Name</Label>
                  <Input
                    value={newStationName}
                    onChange={(e) => setNewStationName(e.target.value)}
                    placeholder="Enter station name"
                    className="glass-effect"
                  />
                </div>
                <div>
                  <Label>Genre</Label>
                  <Select
                    value={newStationGenre}
                    onValueChange={setNewStationGenre}
                  >
                    <SelectTrigger className="glass-effect">
                      <SelectValue placeholder="Select genre" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="talk">Talk Radio</SelectItem>
                      <SelectItem value="music">Music</SelectItem>
                      <SelectItem value="interview">Interview</SelectItem>
                      <SelectItem value="community">Community</SelectItem>
                      <SelectItem value="entertainment">
                        Entertainment
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={() =>
                    createStationMutation.mutate({
                      name: newStationName,
                      genre: newStationGenre,
                    })
                  }
                  className="w-full cyber-button"
                  disabled={!newStationName || !newStationGenre}
                >
                  Create Station
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
                2
              </div>
              <div className="text-sm text-muted-foreground">Live Stations</div>
            </CardContent>
          </Card>
          <Card className="cyber-border">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-400 cyber-text-glow">
                1,247
              </div>
              <div className="text-sm text-muted-foreground">
                Total Listeners
              </div>
            </CardContent>
          </Card>
          <Card className="cyber-border">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-400 cyber-text-glow">
                15
              </div>
              <div className="text-sm text-muted-foreground">
                Mod Actions Today
              </div>
            </CardContent>
          </Card>
          <Card className="cyber-border">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary cyber-text-glow">
                98.2%
              </div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Radio Stations</TabsTrigger>
            <TabsTrigger value="moderation">Live Moderation</TabsTrigger>
            <TabsTrigger value="chat">Live Chat</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Radio Stations Overview */}
          <TabsContent value="overview">
            <Card className="cyber-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  Radio Stations Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {radioStations.map((station) => (
                    <Card
                      key={station.id}
                      className="cyber-card border border-primary/20"
                    >
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">
                                {station.name}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {station.description}
                              </p>
                            </div>
                            {getStatusBadge(station.status)}
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">
                                Current DJ:
                              </span>
                              <p className="font-medium">{station.currentDJ}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">
                                Listeners:
                              </span>
                              <p className="font-medium flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {station.listeners.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">
                                Genre:
                              </span>
                              <p className="font-medium">{station.genre}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">
                                Quality:
                              </span>
                              <p className="font-medium">{station.bitrate}</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-border">
                            <div className="flex items-center gap-2">
                              <Shield className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm">Moderation:</span>
                              {getModerationLevelBadge(station.moderationLevel)}
                            </div>
                            <div className="flex gap-2">
                              {station.status === "live" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="cyber-border"
                                >
                                  <Eye className="w-3 h-3 mr-1" />
                                  Monitor
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                className="cyber-border"
                                onClick={() => setSelectedStation(station)}
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

          {/* Live Moderation */}
          <TabsContent value="moderation">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="cyber-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    Quick Moderation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Select Station</Label>
                    <Select
                      value={selectedStation?.id || ""}
                      onValueChange={(value) => {
                        const station = radioStations.find(
                          (s) => s.id === value,
                        );
                        setSelectedStation(station || null);
                      }}
                    >
                      <SelectTrigger className="glass-effect">
                        <SelectValue placeholder="Select station to moderate" />
                      </SelectTrigger>
                      <SelectContent>
                        {radioStations
                          .filter((s) => s.status === "live")
                          .map((station) => (
                            <SelectItem key={station.id} value={station.id}>
                              {station.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Moderation Action</Label>
                    <Select
                      value={selectedAction}
                      onValueChange={setSelectedAction}
                    >
                      <SelectTrigger className="glass-effect">
                        <SelectValue placeholder="Select action" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mute">Mute User</SelectItem>
                        <SelectItem value="kick">Kick User</SelectItem>
                        <SelectItem value="ban">Ban User</SelectItem>
                        <SelectItem value="warning">Send Warning</SelectItem>
                        <SelectItem value="content_flag">
                          Flag Content
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {(selectedAction === "mute" ||
                    selectedAction === "kick" ||
                    selectedAction === "ban") && (
                    <div>
                      <Label>Target User (Optional)</Label>
                      <Input
                        value={moderationTarget}
                        onChange={(e) => setModerationTarget(e.target.value)}
                        placeholder="Username or User ID"
                        className="glass-effect"
                      />
                    </div>
                  )}

                  <div>
                    <Label>Reason</Label>
                    <Textarea
                      value={moderationReason}
                      onChange={(e) => setModerationReason(e.target.value)}
                      placeholder="Explain the reason for this moderation action"
                      className="glass-effect min-h-[100px]"
                    />
                  </div>

                  <Button
                    onClick={handleModeration}
                    className="w-full cyber-button"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Apply Moderation
                  </Button>
                </CardContent>
              </Card>

              <Card className="cyber-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    Recent Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {moderationActions.map((action) => (
                      <div
                        key={action.id}
                        className="p-3 border border-primary/20 rounded-lg"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className="bg-primary/20 text-primary capitalize">
                                {action.action.replace("_", " ")}
                              </Badge>
                              <span className="text-sm font-medium">
                                {action.stationName}
                              </span>
                            </div>
                            {action.targetUser && (
                              <p className="text-sm text-muted-foreground mb-1">
                                Target: {action.targetUser}
                              </p>
                            )}
                            <p className="text-sm">{action.reason}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              by {action.moderatorName} •{" "}
                              {new Date(action.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Live Chat */}
          <TabsContent value="chat">
            <Card className="cyber-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-primary" />
                  Live Chat Monitoring
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Select defaultValue="station-1">
                      <SelectTrigger className="w-[250px] glass-effect">
                        <SelectValue placeholder="Select station" />
                      </SelectTrigger>
                      <SelectContent>
                        {radioStations
                          .filter((s) => s.status === "live")
                          .map((station) => (
                            <SelectItem key={station.id} value={station.id}>
                              {station.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-sm font-medium">
                        Live Chat Active
                      </span>
                    </div>
                  </div>

                  <div className="border border-primary/20 rounded-lg p-4 max-h-[400px] overflow-y-auto space-y-2">
                    {liveChatMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`p-2 rounded ${message.isFlagged ? "bg-red-500/10 border border-red-500/20" : "bg-muted/20"}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">
                                {message.username}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(
                                  message.timestamp,
                                ).toLocaleTimeString()}
                              </span>
                              {message.isModerated && (
                                <Badge
                                  variant="destructive"
                                  className="text-xs"
                                >
                                  Moderated
                                </Badge>
                              )}
                              {message.isFlagged && (
                                <AlertTriangle className="w-3 h-3 text-red-400" />
                              )}
                            </div>
                            <p className="text-sm">{message.message}</p>
                          </div>
                          {!message.isModerated && (
                            <div className="flex gap-1 ml-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0"
                              >
                                <XCircle className="w-3 h-3 text-red-400" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0"
                              >
                                <AlertTriangle className="w-3 h-3 text-yellow-400" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
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
                    Listener Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 border border-primary/20 rounded-lg">
                        <div className="text-2xl font-bold text-green-400">
                          1,247
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Current Listeners
                        </div>
                      </div>
                      <div className="text-center p-4 border border-primary/20 rounded-lg">
                        <div className="text-2xl font-bold text-blue-400">
                          3,892
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Peak Today
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {radioStations.map((station) => (
                        <div
                          key={station.id}
                          className="flex items-center justify-between p-2 border border-primary/10 rounded"
                        >
                          <span className="font-medium text-sm">
                            {station.name}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{station.listeners}</span>
                            <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary transition-all"
                                style={{
                                  width: `${(station.listeners / station.maxListeners) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="cyber-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    System Health
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border border-green-500/20 rounded-lg bg-green-500/10">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="font-medium">Stream Health</span>
                      </div>
                      <span className="text-green-400 font-bold">98.2%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 border border-blue-500/20 rounded-lg bg-blue-500/10">
                      <div className="flex items-center gap-2">
                        <Wifi className="w-4 h-4 text-blue-400" />
                        <span className="font-medium">Network Status</span>
                      </div>
                      <span className="text-blue-400 font-bold">Optimal</span>
                    </div>
                    <div className="flex items-center justify-between p-3 border border-yellow-500/20 rounded-lg bg-yellow-500/10">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-400" />
                        <span className="font-medium">Server Load</span>
                      </div>
                      <span className="text-yellow-400 font-bold">42%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
