import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Video, Settings, Upload, Download, Zap, Activity } from "lucide-react";
import { SEOHeadTags } from "@/components/SEOHeadTags";

export default function VideoEncodingPage() {
  const [settings, setSettings] = useState({
    ffmpegPath: "/usr/bin/ffmpeg",
    coconutApiKey: "",
    defaultQuality: "720p",
    enableHardwareAcceleration: true,
    maxConcurrentJobs: 5,
    outputFormat: "mp4",
    compressionLevel: "medium",
  });

  const encodingStats = {
    totalProcessed: 45632,
    currentQueue: 23,
    avgProcessingTime: "2.4 minutes",
    successRate: 98.7,
  };

  return (
    <div className="min-h-screen p-6 cyber-bg">
      <SEOHeadTags
        title="Video Encoding - FanzDash"
        description="Configure FFMPEG and Coconut video encoding settings for optimal media processing"
        canonicalUrl="https://fanzdash.com/video-encoding"
      />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold cyber-text-glow">
              Video Encoding
            </h1>
            <p className="text-muted-foreground">
              FFMPEG & Coconut configuration
            </p>
          </div>
          <Badge className="bg-green-500/20 text-green-400">Online</Badge>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="cyber-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Processed
                  </p>
                  <p className="text-2xl font-bold cyber-text-glow">
                    {encodingStats.totalProcessed.toLocaleString()}
                  </p>
                </div>
                <Video className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="cyber-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Queue</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {encodingStats.currentQueue}
                  </p>
                </div>
                <Activity className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="cyber-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Avg Processing
                  </p>
                  <p className="text-2xl font-bold text-blue-400">
                    {encodingStats.avgProcessingTime}
                  </p>
                </div>
                <Zap className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="cyber-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold text-green-400">
                    {encodingStats.successRate}%
                  </p>
                </div>
                <Upload className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Configuration */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="cyber-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                FFMPEG Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  FFMPEG Path
                </label>
                <Input
                  value={settings.ffmpegPath}
                  onChange={(e) =>
                    setSettings({ ...settings, ffmpegPath: e.target.value })
                  }
                  className="glass-effect"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Default Quality
                </label>
                <Select
                  value={settings.defaultQuality}
                  onValueChange={(value) =>
                    setSettings({ ...settings, defaultQuality: value })
                  }
                >
                  <SelectTrigger className="glass-effect">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="480p">480p</SelectItem>
                    <SelectItem value="720p">720p</SelectItem>
                    <SelectItem value="1080p">1080p</SelectItem>
                    <SelectItem value="4k">4K</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                  Hardware Acceleration
                </label>
                <Switch
                  checked={settings.enableHardwareAcceleration}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      enableHardwareAcceleration: checked,
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card className="cyber-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="w-5 h-5" />
                Coconut.co Integration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  API Key
                </label>
                <Input
                  type="password"
                  value={settings.coconutApiKey}
                  onChange={(e) =>
                    setSettings({ ...settings, coconutApiKey: e.target.value })
                  }
                  className="glass-effect"
                  placeholder="Enter Coconut API key"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Max Concurrent Jobs
                </label>
                <Input
                  type="number"
                  value={settings.maxConcurrentJobs}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      maxConcurrentJobs: parseInt(e.target.value),
                    })
                  }
                  className="glass-effect"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Compression Level
                </label>
                <Select
                  value={settings.compressionLevel}
                  onValueChange={(value) =>
                    setSettings({ ...settings, compressionLevel: value })
                  }
                >
                  <SelectTrigger className="glass-effect">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end space-x-4">
          <Button variant="outline" className="cyber-border">
            Test Configuration
          </Button>
          <Button className="cyber-button">Save Settings</Button>
        </div>
      </div>
    </div>
  );
}
