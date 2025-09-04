import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  Radio,
  Users,
  AlertTriangle,
  Play,
  Pause,
  Eye,
  Volume2,
} from "lucide-react";

export default function LiveMonitoringPage() {
  const [monitoringActive, setMonitoringActive] = useState(true);

  const { data: liveStreams, isLoading } = useQuery({
    queryKey: ["/api/live-streams"],
    refetchInterval: 2000,
  });

  const mockStreams = [
    {
      id: "stream-001",
      title: "Private Show - VIP Only",
      streamer: "model_sarah_2024",
      platform: "FanzLive Streaming",
      viewers: 1247,
      status: "live",
      riskScore: 0.23,
      duration: "02:34:12",
      tags: ["adult", "vip", "private"],
      thumbnail: "https://via.placeholder.com/320x180?text=Live+Stream+1",
    },
    {
      id: "stream-002",
      title: "Gaming & Chat",
      streamer: "gamer_alex_pro",
      platform: "FanzSocial Community",
      viewers: 856,
      status: "live",
      riskScore: 0.08,
      duration: "01:15:43",
      tags: ["gaming", "chat", "community"],
      thumbnail: "https://via.placeholder.com/320x180?text=Live+Stream+2",
    },
    {
      id: "stream-003",
      title: "Music Performance",
      streamer: "artist_luna_moon",
      platform: "FanzMain Adult",
      viewers: 2103,
      status: "live",
      riskScore: 0.67,
      duration: "00:45:20",
      tags: ["music", "performance", "adult"],
      thumbnail: "https://via.placeholder.com/320x180?text=Live+Stream+3",
    },
    {
      id: "stream-004",
      title: "Fitness Training",
      streamer: "trainer_mike_fit",
      platform: "FanzLive Streaming",
      viewers: 432,
      status: "live",
      riskScore: 0.15,
      duration: "00:28:05",
      tags: ["fitness", "training", "health"],
      thumbnail: "https://via.placeholder.com/320x180?text=Live+Stream+4",
    },
  ];

  const getRiskColor = (riskScore: number) => {
    if (riskScore > 0.7) return "text-red-500";
    if (riskScore > 0.4) return "text-yellow-500";
    return "text-green-500";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "live":
        return (
          <Badge className="bg-red-600">
            <Radio className="w-3 h-3 mr-1" />
            LIVE
          </Badge>
        );
      case "offline":
        return <Badge variant="secondary">OFFLINE</Badge>;
      case "scheduled":
        return <Badge variant="outline">SCHEDULED</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen cyber-bg flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-16 h-16 mx-auto mb-4 cyber-pulse text-primary" />
          <p className="cyber-text-glow">Loading Live Monitoring Systems...</p>
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
              Live Monitoring
            </h1>
            <p className="text-muted-foreground">
              Real-time Stream Surveillance
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => setMonitoringActive(!monitoringActive)}
              variant={monitoringActive ? "default" : "outline"}
              className={monitoringActive ? "neon-button" : ""}
              data-testid="toggle-monitoring"
            >
              {monitoringActive ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Pause Monitoring
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Resume Monitoring
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="cyber-card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-400 cyber-text-glow">
                4
              </div>
              <div className="text-sm text-muted-foreground">
                Active Streams
              </div>
            </CardContent>
          </Card>
          <Card className="cyber-card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary cyber-text-glow">
                4,638
              </div>
              <div className="text-sm text-muted-foreground">Total Viewers</div>
            </CardContent>
          </Card>
          <Card className="cyber-card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-400 cyber-text-glow">
                96.2%
              </div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </CardContent>
          </Card>
          <Card className="cyber-card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-400 cyber-text-glow">
                1
              </div>
              <div className="text-sm text-muted-foreground">Flagged</div>
            </CardContent>
          </Card>
          <Card className="cyber-card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-accent cyber-text-glow">
                180ms
              </div>
              <div className="text-sm text-muted-foreground">Avg Latency</div>
            </CardContent>
          </Card>
        </div>

        {/* Live Streams Grid */}
        <Card className="cyber-card neural-network">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-6 h-6 text-primary cyber-pulse" />
              <span className="cyber-text-glow">ACTIVE LIVE STREAMS</span>
              {monitoringActive && (
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mockStreams.map((stream) => (
                <div
                  key={stream.id}
                  className="cyber-card border border-primary/20 overflow-hidden"
                >
                  {/* Stream Thumbnail */}
                  <div className="relative">
                    <img
                      src={stream.thumbnail}
                      alt={stream.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-2 left-2">
                      {getStatusBadge(stream.status)}
                    </div>
                    <div className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded text-xs text-white">
                      {stream.duration}
                    </div>
                    <div className="absolute bottom-2 right-2 flex items-center space-x-1 bg-black/70 px-2 py-1 rounded text-xs text-white">
                      <Users className="w-3 h-3" />
                      <span>{stream.viewers.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Stream Info */}
                  <div className="p-4">
                    <h3 className="font-semibold mb-2">{stream.title}</h3>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-muted-foreground">
                        @{stream.streamer}
                      </span>
                      <Badge variant="outline">{stream.platform}</Badge>
                    </div>

                    {/* Risk Assessment */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs">Risk Score:</span>
                        <span
                          className={`text-xs font-bold ${getRiskColor(stream.riskScore)}`}
                        >
                          {(stream.riskScore * 100).toFixed(1)}%
                        </span>
                        {stream.riskScore > 0.6 && (
                          <AlertTriangle className="w-3 h-3 text-yellow-500" />
                        )}
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {stream.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        data-testid={`watch-${stream.id}`}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Watch
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        data-testid={`audio-${stream.id}`}
                      >
                        <Volume2 className="w-3 h-3" />
                      </Button>
                      {stream.riskScore > 0.6 && (
                        <Button
                          size="sm"
                          variant="destructive"
                          data-testid={`flag-${stream.id}`}
                        >
                          <AlertTriangle className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Monitoring Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="cyber-card">
            <CardHeader>
              <CardTitle className="text-lg">Frame Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Frames per Second</span>
                  <span className="font-bold text-primary">30 FPS</span>
                </div>
                <div className="flex justify-between">
                  <span>Analysis Frequency</span>
                  <span className="font-bold text-primary">Every 2s</span>
                </div>
                <div className="flex justify-between">
                  <span>Processing Delay</span>
                  <span className="font-bold text-green-400">0.18s</span>
                </div>
                <div className="flex justify-between">
                  <span>Queue Depth</span>
                  <span className="font-bold text-yellow-400">3 frames</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cyber-card">
            <CardHeader>
              <CardTitle className="text-lg">Audio Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Transcription Engine</span>
                  <span className="font-bold text-primary">Whisper AI</span>
                </div>
                <div className="flex justify-between">
                  <span>Language Detection</span>
                  <span className="font-bold text-green-400">Active</span>
                </div>
                <div className="flex justify-between">
                  <span>Sentiment Analysis</span>
                  <span className="font-bold text-green-400">Real-time</span>
                </div>
                <div className="flex justify-between">
                  <span>Audio Quality</span>
                  <span className="font-bold text-primary">HD</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cyber-card">
            <CardHeader>
              <CardTitle className="text-lg">Alert Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>High Risk Threshold</span>
                  <span className="font-bold text-red-400">70%</span>
                </div>
                <div className="flex justify-between">
                  <span>Auto-Block</span>
                  <span className="font-bold text-yellow-400">Disabled</span>
                </div>
                <div className="flex justify-between">
                  <span>Moderator Alerts</span>
                  <span className="font-bold text-green-400">Enabled</span>
                </div>
                <div className="flex justify-between">
                  <span>Email Notifications</span>
                  <span className="font-bold text-green-400">Enabled</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
