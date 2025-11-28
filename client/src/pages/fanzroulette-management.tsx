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
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Video, Users, Globe, Shield, TrendingUp, AlertTriangle, Ban, Flag, Settings, Clock, Eye, MapPin } from "lucide-react";

// TypeScript Interfaces
interface RouletteStats {
  activeRooms: number;
  totalUsers: number;
  matchesPerMinute: number;
  averageSessionDuration: number;
  reportsPending: number;
  bannedUsers: number;
  totalMatches24h: number;
  peakConcurrentUsers: number;
}

interface ChatRoom {
  id: string;
  user1Id: string;
  user1Username: string;
  user1Country: string;
  user2Id: string;
  user2Username: string;
  user2Country: string;
  status: "active" | "ended" | "reported";
  startedAt: string;
  endedAt?: string;
  duration?: number;
  reports: number;
  aiModerationFlags: number;
}

interface MatchingAlgorithm {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  priority: number;
  parameters: {
    ageRange: boolean;
    genderPreference: boolean;
    languageMatch: boolean;
    interestTags: boolean;
    geographicProximity: boolean;
  };
}

interface UserReport {
  id: string;
  reporterId: string;
  reporterUsername: string;
  reportedUserId: string;
  reportedUsername: string;
  roomId: string;
  reason: string;
  category: "harassment" | "nudity" | "spam" | "underage" | "violence" | "other";
  description: string;
  status: "pending" | "reviewing" | "resolved" | "dismissed";
  aiConfidence?: number;
  createdAt: string;
  resolvedAt?: string;
  action?: string;
}

interface BannedUser {
  id: string;
  userId: string;
  username: string;
  email: string;
  reason: string;
  bannedBy: string;
  bannedAt: string;
  expiresAt?: string;
  isPermanent: boolean;
  reportCount: number;
}

interface GeoRestriction {
  id: string;
  country: string;
  countryCode: string;
  restricted: boolean;
  reason: string;
  restrictedAt: string;
}

interface ModerationAction {
  id: string;
  roomId: string;
  userId: string;
  username: string;
  action: "warning" | "kick" | "ban" | "reported";
  reason: string;
  moderatorId: string;
  createdAt: string;
}

export default function FanzRouletteManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("overview");
  const [statusFilter, setStatusFilter] = useState("active");
  const [reportStatusFilter, setReportStatusFilter] = useState("pending");
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [selectedReport, setSelectedReport] = useState<UserReport | null>(null);
  const [isRoomDialogOpen, setIsRoomDialogOpen] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [isBanDialogOpen, setIsBanDialogOpen] = useState(false);
  const [banUserId, setBanUserId] = useState("");
  const [banReason, setBanReason] = useState("");
  const [banDuration, setBanDuration] = useState<number | "permanent">("permanent");

  // Fetch roulette statistics from API
  const { data: rouletteStats } = useQuery<RouletteStats>({
    queryKey: ["/api/roulette/stats"],
    refetchInterval: 5000,
  });

  // Fetch active chat rooms from API
  const { data: chatRooms = [], isLoading: roomsLoading } = useQuery<ChatRoom[]>({
    queryKey: ["/api/roulette/rooms", statusFilter],
    refetchInterval: 5000,
  });

  // Fetch matching algorithms from API
  const { data: matchingAlgorithms = [], isLoading: algorithmsLoading } = useQuery<MatchingAlgorithm[]>({
    queryKey: ["/api/roulette/algorithms"],
    refetchInterval: 30000,
  });

  // Fetch user reports from API
  const { data: reports = [], isLoading: reportsLoading } = useQuery<UserReport[]>({
    queryKey: ["/api/roulette/reports", reportStatusFilter],
    refetchInterval: 10000,
  });

  // Fetch banned users from API
  const { data: bannedUsers = [], isLoading: bannedLoading } = useQuery<BannedUser[]>({
    queryKey: ["/api/roulette/bans"],
    refetchInterval: 30000,
  });

  // Fetch geographic restrictions from API
  const { data: geoRestrictions = [], isLoading: geoLoading } = useQuery<GeoRestriction[]>({
    queryKey: ["/api/roulette/geo-restrictions"],
    refetchInterval: 60000,
  });

  // Fetch moderation actions from API
  const { data: moderationActions = [] } = useQuery<ModerationAction[]>({
    queryKey: ["/api/roulette/moderation/actions"],
    refetchInterval: 10000,
  });

  // End room mutation
  const endRoomMutation = useMutation({
    mutationFn: (roomId: string) =>
      apiRequest(`/api/roulette/rooms/${roomId}/end`, "POST"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roulette/rooms"] });
      queryClient.invalidateQueries({ queryKey: ["/api/roulette/stats"] });
      toast({
        title: "Room ended",
        description: "The chat room has been terminated",
      });
    },
  });

  // Update algorithm mutation
  const updateAlgorithmMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<MatchingAlgorithm> }) =>
      apiRequest(`/api/roulette/algorithms/${id}`, "PATCH", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roulette/algorithms"] });
      toast({
        title: "Algorithm updated",
        description: "Matching algorithm settings have been saved",
      });
    },
  });

  // Resolve report mutation
  const resolveReportMutation = useMutation({
    mutationFn: ({ reportId, action }: { reportId: string; action: string }) =>
      apiRequest(`/api/roulette/reports/${reportId}/resolve`, "POST", { action }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roulette/reports"] });
      queryClient.invalidateQueries({ queryKey: ["/api/roulette/stats"] });
      toast({
        title: "Report resolved",
        description: "The report has been processed",
      });
      setIsReportDialogOpen(false);
    },
  });

  // Dismiss report mutation
  const dismissReportMutation = useMutation({
    mutationFn: (reportId: string) =>
      apiRequest(`/api/roulette/reports/${reportId}/dismiss`, "POST"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roulette/reports"] });
      queryClient.invalidateQueries({ queryKey: ["/api/roulette/stats"] });
      toast({
        title: "Report dismissed",
        description: "The report has been dismissed",
      });
    },
  });

  // Ban user mutation
  const banUserMutation = useMutation({
    mutationFn: ({ userId, reason, duration }: { userId: string; reason: string; duration: number | "permanent" }) =>
      apiRequest("/api/roulette/bans", "POST", { userId, reason, duration }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roulette/bans"] });
      queryClient.invalidateQueries({ queryKey: ["/api/roulette/stats"] });
      toast({
        title: "User banned",
        description: "The user has been banned from FanzRoulette",
      });
      setIsBanDialogOpen(false);
    },
  });

  // Unban user mutation
  const unbanUserMutation = useMutation({
    mutationFn: (banId: string) =>
      apiRequest(`/api/roulette/bans/${banId}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roulette/bans"] });
      queryClient.invalidateQueries({ queryKey: ["/api/roulette/stats"] });
      toast({
        title: "User unbanned",
        description: "The ban has been lifted",
      });
    },
  });

  // Update geo restriction mutation
  const updateGeoRestrictionMutation = useMutation({
    mutationFn: ({ id, restricted, reason }: { id: string; restricted: boolean; reason?: string }) =>
      apiRequest(`/api/roulette/geo-restrictions/${id}`, "PATCH", { restricted, reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roulette/geo-restrictions"] });
      toast({
        title: "Geo restriction updated",
        description: "Geographic restriction has been updated",
      });
    },
  });

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getReportCategoryBadge = (category: UserReport["category"]) => {
    const badges = {
      harassment: <Badge variant="destructive">Harassment</Badge>,
      nudity: <Badge variant="destructive">Nudity</Badge>,
      spam: <Badge variant="secondary">Spam</Badge>,
      underage: <Badge variant="destructive">Underage</Badge>,
      violence: <Badge variant="destructive">Violence</Badge>,
      other: <Badge variant="outline">Other</Badge>,
    };
    return badges[category];
  };

  const getReportStatusBadge = (status: UserReport["status"]) => {
    const badges = {
      pending: <Badge variant="secondary">Pending</Badge>,
      reviewing: <Badge variant="default">Reviewing</Badge>,
      resolved: <Badge variant="default">Resolved</Badge>,
      dismissed: <Badge variant="outline">Dismissed</Badge>,
    };
    return badges[status];
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Video className="w-8 h-8" />
            FanzRoulette Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Random video chat room management, moderation, and matching algorithms
          </p>
        </div>
        <Button onClick={() => setIsBanDialogOpen(true)}>
          <Ban className="w-4 h-4 mr-2" />
          Ban User
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Rooms</CardTitle>
            <Video className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rouletteStats?.activeRooms?.toLocaleString() ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {rouletteStats?.totalUsers?.toLocaleString() ?? 0} users online
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Match Rate</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rouletteStats?.matchesPerMinute?.toLocaleString() ?? 0}/min</div>
            <p className="text-xs text-muted-foreground mt-1">
              {rouletteStats?.totalMatches24h?.toLocaleString() ?? 0} matches today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Session</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rouletteStats?.averageSessionDuration ? formatDuration(rouletteStats.averageSessionDuration) : "0m 0s"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Peak: {rouletteStats?.peakConcurrentUsers?.toLocaleString() ?? 0} users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Moderation</CardTitle>
            <Shield className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rouletteStats?.reportsPending?.toLocaleString() ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {rouletteStats?.bannedUsers?.toLocaleString() ?? 0} banned users
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Live Rooms</TabsTrigger>
          <TabsTrigger value="algorithms">Matching</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="bans">Bans</TabsTrigger>
          <TabsTrigger value="geo">Geographic</TabsTrigger>
          <TabsTrigger value="moderation">Moderation Log</TabsTrigger>
        </TabsList>

        {/* Live Rooms Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Active Chat Rooms</CardTitle>
                  <CardDescription>Monitor live random video chat sessions</CardDescription>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="ended">Ended</SelectItem>
                    <SelectItem value="reported">Reported</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {roomsLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading rooms...</div>
              ) : chatRooms.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No active chat rooms</div>
              ) : (
                <div className="space-y-4">
                  {chatRooms.map((room) => (
                    <div key={room.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                              <Users className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium">{room.user1Username}</div>
                              <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {room.user1Country}
                              </div>
                            </div>
                          </div>
                          <div className="text-muted-foreground">↔</div>
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                              <Users className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium">{room.user2Username}</div>
                              <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {room.user2Country}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {room.duration ? formatDuration(room.duration) : "Just started"}
                          </span>
                          {room.reports > 0 && (
                            <Badge variant="destructive">
                              <Flag className="w-3 h-3 mr-1" />
                              {room.reports} {room.reports === 1 ? "report" : "reports"}
                            </Badge>
                          )}
                          {room.aiModerationFlags > 0 && (
                            <Badge variant="secondary">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              {room.aiModerationFlags} AI flags
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedRoom(room);
                            setIsRoomDialogOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Monitor
                        </Button>
                        {room.status === "active" && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              if (confirm("Are you sure you want to end this chat room?")) {
                                endRoomMutation.mutate(room.id);
                              }
                            }}
                          >
                            End Room
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Matching Algorithms Tab */}
        <TabsContent value="algorithms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Matching Algorithm Controls</CardTitle>
              <CardDescription>Configure user matching parameters and priorities</CardDescription>
            </CardHeader>
            <CardContent>
              {algorithmsLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading algorithms...</div>
              ) : (
                <div className="space-y-6">
                  {matchingAlgorithms.map((algorithm) => (
                    <div key={algorithm.id} className="p-4 border rounded-lg space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{algorithm.name}</h3>
                          <p className="text-sm text-muted-foreground">{algorithm.description}</p>
                        </div>
                        <Switch
                          checked={algorithm.enabled}
                          onCheckedChange={(checked) => {
                            updateAlgorithmMutation.mutate({
                              id: algorithm.id,
                              data: { enabled: checked },
                            });
                          }}
                        />
                      </div>
                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm">Priority Level: {algorithm.priority}</Label>
                          <Slider
                            value={[algorithm.priority]}
                            onValueChange={([value]) => {
                              updateAlgorithmMutation.mutate({
                                id: algorithm.id,
                                data: { priority: value },
                              });
                            }}
                            max={10}
                            min={1}
                            step={1}
                            className="mt-2"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm">Age Range</Label>
                            <Switch
                              checked={algorithm.parameters.ageRange}
                              onCheckedChange={(checked) => {
                                updateAlgorithmMutation.mutate({
                                  id: algorithm.id,
                                  data: {
                                    parameters: { ...algorithm.parameters, ageRange: checked },
                                  },
                                });
                              }}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label className="text-sm">Gender Preference</Label>
                            <Switch
                              checked={algorithm.parameters.genderPreference}
                              onCheckedChange={(checked) => {
                                updateAlgorithmMutation.mutate({
                                  id: algorithm.id,
                                  data: {
                                    parameters: { ...algorithm.parameters, genderPreference: checked },
                                  },
                                });
                              }}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label className="text-sm">Language Match</Label>
                            <Switch
                              checked={algorithm.parameters.languageMatch}
                              onCheckedChange={(checked) => {
                                updateAlgorithmMutation.mutate({
                                  id: algorithm.id,
                                  data: {
                                    parameters: { ...algorithm.parameters, languageMatch: checked },
                                  },
                                });
                              }}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label className="text-sm">Interest Tags</Label>
                            <Switch
                              checked={algorithm.parameters.interestTags}
                              onCheckedChange={(checked) => {
                                updateAlgorithmMutation.mutate({
                                  id: algorithm.id,
                                  data: {
                                    parameters: { ...algorithm.parameters, interestTags: checked },
                                  },
                                });
                              }}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label className="text-sm">Geographic Proximity</Label>
                            <Switch
                              checked={algorithm.parameters.geographicProximity}
                              onCheckedChange={(checked) => {
                                updateAlgorithmMutation.mutate({
                                  id: algorithm.id,
                                  data: {
                                    parameters: { ...algorithm.parameters, geographicProximity: checked },
                                  },
                                });
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>User Reports</CardTitle>
                  <CardDescription>Review and resolve user-submitted reports</CardDescription>
                </div>
                <Select value={reportStatusFilter} onValueChange={setReportStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="reviewing">Reviewing</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="dismissed">Dismissed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {reportsLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading reports...</div>
              ) : reports.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No reports found</div>
              ) : (
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div key={report.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getReportCategoryBadge(report.category)}
                            {getReportStatusBadge(report.status)}
                            {report.aiConfidence !== undefined && (
                              <Badge variant="outline">
                                AI: {(report.aiConfidence * 100).toFixed(0)}%
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm space-y-1">
                            <div>
                              <span className="font-medium">{report.reporterUsername}</span>
                              <span className="text-muted-foreground"> reported </span>
                              <span className="font-medium">{report.reportedUsername}</span>
                            </div>
                            <div className="text-muted-foreground">
                              Reason: {report.reason}
                            </div>
                            <div className="text-muted-foreground">
                              {report.description}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(report.createdAt).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {report.status === "pending" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedReport(report);
                                  setIsReportDialogOpen(true);
                                }}
                              >
                                Review
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => dismissReportMutation.mutate(report.id)}
                              >
                                Dismiss
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bans Tab */}
        <TabsContent value="bans" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Banned Users</CardTitle>
              <CardDescription>Manage user bans and restrictions</CardDescription>
            </CardHeader>
            <CardContent>
              {bannedLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading bans...</div>
              ) : bannedUsers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No banned users</div>
              ) : (
                <div className="space-y-4">
                  {bannedUsers.map((ban) => (
                    <div key={ban.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">{ban.username}</div>
                        <div className="text-sm text-muted-foreground">{ban.email}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Reason: {ban.reason}
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <span>Banned by {ban.bannedBy}</span>
                          <span>•</span>
                          <span>{new Date(ban.bannedAt).toLocaleDateString()}</span>
                          {ban.isPermanent ? (
                            <>
                              <span>•</span>
                              <Badge variant="destructive">Permanent</Badge>
                            </>
                          ) : ban.expiresAt && (
                            <>
                              <span>•</span>
                              <span>Expires: {new Date(ban.expiresAt).toLocaleDateString()}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (confirm("Are you sure you want to unban this user?")) {
                            unbanUserMutation.mutate(ban.id);
                          }
                        }}
                      >
                        Unban
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Geographic Restrictions Tab */}
        <TabsContent value="geo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Geographic Restrictions</CardTitle>
              <CardDescription>Control access by country/region</CardDescription>
            </CardHeader>
            <CardContent>
              {geoLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading restrictions...</div>
              ) : geoRestrictions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No geographic restrictions</div>
              ) : (
                <div className="space-y-4">
                  {geoRestrictions.map((restriction) => (
                    <div key={restriction.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          {restriction.country} ({restriction.countryCode})
                        </div>
                        {restriction.restricted && (
                          <div className="text-sm text-muted-foreground mt-1">
                            Reason: {restriction.reason}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        {restriction.restricted && (
                          <Badge variant="destructive">Restricted</Badge>
                        )}
                        <Switch
                          checked={restriction.restricted}
                          onCheckedChange={(checked) => {
                            const reason = checked ? prompt("Enter restriction reason:") : undefined;
                            if (checked && !reason) return;
                            updateGeoRestrictionMutation.mutate({
                              id: restriction.id,
                              restricted: checked,
                              reason: reason || "",
                            });
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Moderation Log Tab */}
        <TabsContent value="moderation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Moderation Action Log</CardTitle>
              <CardDescription>Recent moderation actions and events</CardDescription>
            </CardHeader>
            <CardContent>
              {moderationActions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No moderation actions logged</div>
              ) : (
                <div className="space-y-2">
                  {moderationActions.map((action) => (
                    <div key={action.id} className="flex items-center justify-between p-3 border-l-4 border-l-primary pl-4 bg-accent/20">
                      <div className="text-sm">
                        <span className="font-medium">{action.username}</span>
                        <span className="text-muted-foreground"> was </span>
                        <span className="font-medium">{action.action}</span>
                        <span className="text-muted-foreground"> - {action.reason}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(action.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Report Review Dialog */}
      <Dialog open={isReportDialogOpen} onValueChange={setIsReportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Report</DialogTitle>
            <DialogDescription>Take action on this user report</DialogDescription>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-4">
              <div>
                <Label>Reporter</Label>
                <div className="text-sm">{selectedReport.reporterUsername}</div>
              </div>
              <div>
                <Label>Reported User</Label>
                <div className="text-sm">{selectedReport.reportedUsername}</div>
              </div>
              <div>
                <Label>Category</Label>
                <div className="mt-1">{getReportCategoryBadge(selectedReport.category)}</div>
              </div>
              <div>
                <Label>Description</Label>
                <div className="text-sm text-muted-foreground mt-1">{selectedReport.description}</div>
              </div>
              {selectedReport.aiConfidence !== undefined && (
                <div>
                  <Label>AI Confidence</Label>
                  <div className="text-sm">{(selectedReport.aiConfidence * 100).toFixed(1)}%</div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReportDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedReport) {
                  resolveReportMutation.mutate({
                    reportId: selectedReport.id,
                    action: "ban",
                  });
                }
              }}
            >
              Ban User
            </Button>
            <Button
              onClick={() => {
                if (selectedReport) {
                  resolveReportMutation.mutate({
                    reportId: selectedReport.id,
                    action: "warning",
                  });
                }
              }}
            >
              Issue Warning
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ban User Dialog */}
      <Dialog open={isBanDialogOpen} onOpenChange={setIsBanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ban User</DialogTitle>
            <DialogDescription>Restrict a user from accessing FanzRoulette</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>User ID</Label>
              <Input
                value={banUserId}
                onChange={(e) => setBanUserId(e.target.value)}
                placeholder="Enter user ID"
              />
            </div>
            <div>
              <Label>Reason</Label>
              <Textarea
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Enter ban reason"
              />
            </div>
            <div>
              <Label>Duration</Label>
              <Select
                value={String(banDuration)}
                onValueChange={(value) => setBanDuration(value === "permanent" ? "permanent" : parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 day</SelectItem>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="permanent">Permanent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBanDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (banUserId && banReason) {
                  banUserMutation.mutate({
                    userId: banUserId,
                    reason: banReason,
                    duration: banDuration,
                  });
                }
              }}
            >
              Ban User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
