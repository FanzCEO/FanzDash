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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  MessageCircle,
  Users,
  Shield,
  Ban,
  AlertTriangle,
  Play,
  Settings,
  Hash,
  Clock,
  Eye,
} from "lucide-react";

interface StreamChannel {
  id: string;
  streamChannelId: string;
  channelType: string;
  members: string[];
  moderationRules: any;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
}

interface StreamToken {
  id: string;
  userId: string;
  tokenType: string;
  expiresAt: string;
  isRevoked: boolean;
}

export default function StreamManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedAction, setSelectedAction] = useState("");
  const [moderationTarget, setModerationTarget] = useState("");
  const [moderationReason, setModerationReason] = useState("");

  const { data: channels = [], isLoading: channelsLoading } = useQuery<
    StreamChannel[]
  >({
    queryKey: ["/api/stream/channels"],
    refetchInterval: 5000,
  });

  const { data: tokens = [] } = useQuery<StreamToken[]>({
    queryKey: ["/api/stream/tokens"],
    refetchInterval: 10000,
  });

  const generateTokenMutation = useMutation({
    mutationFn: async ({
      userId,
      tokenType,
    }: {
      userId: string;
      tokenType: string;
    }) => {
      return apiRequest("/api/stream/token", "POST", { userId, tokenType });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stream/tokens"] });
      toast({
        title: "Token Generated",
        description: "Stream token generated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Token Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const moderationMutation = useMutation({
    mutationFn: async (data: {
      action: string;
      targetId: string;
      reason: string;
      moderatorId: string;
    }) => {
      return apiRequest("/api/stream/moderate", "POST", data);
    },
    onSuccess: () => {
      toast({
        title: "Moderation Action Completed",
        description: "Stream moderation action applied successfully",
      });
      setModerationTarget("");
      setModerationReason("");
    },
    onError: (error: Error) => {
      toast({
        title: "Moderation Action Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleModeration = () => {
    if (!selectedAction || !moderationTarget || !moderationReason) {
      toast({
        title: "Missing Information",
        description: "Please fill in all moderation fields",
        variant: "destructive",
      });
      return;
    }

    moderationMutation.mutate({
      action: selectedAction,
      targetId: moderationTarget,
      reason: moderationReason,
      moderatorId: "current-user-id", // Replace with actual user ID
    });
  };

  const getChannelTypeIcon = (type: string) => {
    switch (type) {
      case "messaging":
        return <MessageCircle className="w-4 h-4" />;
      case "livestream":
        return <Play className="w-4 h-4" />;
      case "team":
        return <Users className="w-4 h-4" />;
      default:
        return <Hash className="w-4 h-4" />;
    }
  };

  const getChannelTypeBadge = (type: string) => {
    const variants = {
      messaging: "default",
      livestream: "destructive",
      team: "secondary",
    } as const;

    return (
      <Badge variant={variants[type as keyof typeof variants] || "default"}>
        {getChannelTypeIcon(type)}
        <span className="ml-1 capitalize">{type}</span>
      </Badge>
    );
  };

  const getTokenTypeBadge = (type: string) => {
    const colors = {
      chat: "bg-blue-600",
      feeds: "bg-green-600",
      activity: "bg-purple-600",
    } as const;

    return (
      <Badge className={colors[type as keyof typeof colors] || "bg-gray-600"}>
        {type.toUpperCase()}
      </Badge>
    );
  };

  if (channelsLoading) {
    return (
      <div className="min-h-screen cyber-bg flex items-center justify-center">
        <div className="text-center">
          <MessageCircle className="w-16 h-16 mx-auto mb-4 cyber-pulse text-primary" />
          <p className="cyber-text-glow">Loading Stream Management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen cyber-bg">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold cyber-text-glow">
              GetStream Management
            </h1>
            <p className="text-muted-foreground">
              Manage feeds, chat channels, and real-time moderation
            </p>
          </div>
          <Badge variant="outline" className="border-cyan-500 text-cyan-400">
            <Shield className="w-4 h-4 mr-2" />
            Adult-Safe Platform
          </Badge>
        </div>

        {/* Moderation Panel */}
        <Card className="bg-gray-900/50 border-red-500/20">
          <CardHeader>
            <CardTitle className="text-red-400">
              Live Moderation Center
            </CardTitle>
            <CardDescription className="text-gray-400">
              Real-time content moderation and user management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select value={selectedAction} onValueChange={setSelectedAction}>
                <SelectTrigger className="bg-gray-800 border-gray-700">
                  <SelectValue placeholder="Moderation Action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ban_user">Ban User</SelectItem>
                  <SelectItem value="timeout_user">Timeout User</SelectItem>
                  <SelectItem value="delete_message">Delete Message</SelectItem>
                  <SelectItem value="flag_channel">Flag Channel</SelectItem>
                  <SelectItem value="restrict_channel">
                    Restrict Channel
                  </SelectItem>
                </SelectContent>
              </Select>

              <Input
                placeholder="User/Channel/Message ID"
                value={moderationTarget}
                onChange={(e) => setModerationTarget(e.target.value)}
                className="bg-gray-800 border-gray-700"
                data-testid="input-moderation-target"
              />

              <Input
                placeholder="Moderation reason"
                value={moderationReason}
                onChange={(e) => setModerationReason(e.target.value)}
                className="bg-gray-800 border-gray-700"
                data-testid="input-moderation-reason"
              />

              <Button
                onClick={handleModeration}
                disabled={moderationMutation.isPending}
                className="bg-red-600 hover:bg-red-700"
                data-testid="button-apply-moderation"
              >
                <Ban className="w-4 h-4 mr-2" />
                Apply Action
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Channels */}
          <Card className="bg-gray-900/50 border-cyan-500/20">
            <CardHeader>
              <CardTitle className="text-cyan-400">Active Channels</CardTitle>
              <CardDescription className="text-gray-400">
                Live chat channels and their moderation status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {channels.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">
                    No active channels
                  </p>
                ) : (
                  channels.map((channel) => (
                    <div
                      key={channel.id}
                      className="p-4 bg-gray-800/50 rounded-lg border border-gray-700"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getChannelTypeBadge(channel.channelType)}
                          <span className="font-mono text-sm text-gray-400">
                            #{channel.streamChannelId}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={channel.isActive ? "default" : "secondary"}
                          >
                            {channel.isActive ? "Active" : "Inactive"}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-cyan-500 text-cyan-400"
                          >
                            <Settings className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {channel.members.length} members
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(channel.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Token Management */}
          <Card className="bg-gray-900/50 border-cyan-500/20">
            <CardHeader>
              <CardTitle className="text-cyan-400">Stream Tokens</CardTitle>
              <CardDescription className="text-gray-400">
                Manage user authentication tokens for streams
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="User ID"
                    className="bg-gray-800 border-gray-700"
                    data-testid="input-user-id"
                    id="userId"
                  />
                  <Select defaultValue="chat">
                    <SelectTrigger className="bg-gray-800 border-gray-700 w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="chat">Chat</SelectItem>
                      <SelectItem value="feeds">Feeds</SelectItem>
                      <SelectItem value="activity">Activity</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={() => {
                      const userId = (
                        document.getElementById("userId") as HTMLInputElement
                      )?.value;
                      if (userId) {
                        generateTokenMutation.mutate({
                          userId,
                          tokenType: "chat",
                        });
                      }
                    }}
                    disabled={generateTokenMutation.isPending}
                    className="bg-cyan-500 hover:bg-cyan-600"
                    data-testid="button-generate-token"
                  >
                    Generate
                  </Button>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {tokens.map((token) => (
                    <div
                      key={token.id}
                      className="p-3 bg-gray-800/50 rounded border border-gray-700"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-sm text-gray-300">
                          User: {token.userId}
                        </span>
                        <div className="flex items-center gap-2">
                          {getTokenTypeBadge(token.tokenType)}
                          {token.isRevoked && (
                            <Badge variant="destructive">Revoked</Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-gray-400">
                        Expires: {new Date(token.expiresAt).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Real-time Statistics */}
        <Card className="bg-gray-900/50 border-cyan-500/20">
          <CardHeader>
            <CardTitle className="text-cyan-400">Stream Analytics</CardTitle>
            <CardDescription className="text-gray-400">
              Real-time platform activity and engagement metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-cyan-400 mb-2">
                  {channels.filter((c) => c.isActive).length}
                </div>
                <div className="text-sm text-gray-400">Active Channels</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">
                  {channels.reduce((sum, c) => sum + c.members.length, 0)}
                </div>
                <div className="text-sm text-gray-400">Connected Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">
                  {tokens.filter((t) => !t.isRevoked).length}
                </div>
                <div className="text-sm text-gray-400">Valid Tokens</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400 mb-2">
                  {
                    channels.filter((c) => c.channelType === "livestream")
                      .length
                  }
                </div>
                <div className="text-sm text-gray-400">Live Streams</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
