import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Wifi, Activity, Settings, Zap, Globe, Shield } from "lucide-react";
import { SEOHeadTags } from "@/components/SEOHeadTags";

export default function WebSocketSettingsPage() {
  const [settings, setSettings] = useState({
    pusherAppId: "1234567",
    pusherKey: "abcdef123456",
    pusherSecret: "",
    pusherCluster: "us2",
    enableSSL: true,
    maxConnections: 10000,
    connectionTimeout: 30,
    heartbeatInterval: 25,
    enableDebug: false,
    allowOrigins: "*",
  });

  const connectionStats = {
    activeConnections: 8547,
    totalMessages: 2847230,
    messagesPerSecond: 450,
    uptime: "99.98%",
  };

  const channels = [
    { name: "live-updates", subscribers: 2340, status: "active" },
    { name: "moderation-alerts", subscribers: 56, status: "active" },
    { name: "user-notifications", subscribers: 15420, status: "active" },
    { name: "system-health", subscribers: 12, status: "active" },
    { name: "admin-broadcast", subscribers: 234, status: "active" },
  ];

  return (
    <div className="min-h-screen p-6 cyber-bg">
      <SEOHeadTags
        title="WebSocket Settings - FanzDash"
        description="Configure Pusher and real-time communication settings for live updates"
        canonicalUrl="https://fanzdash.com/websocket-settings"
      />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold cyber-text-glow">
              WebSocket Settings
            </h1>
            <p className="text-muted-foreground">
              Pusher & real-time configuration
            </p>
          </div>
          <Badge className="bg-green-500/20 text-green-400">
            <Activity className="w-3 h-3 mr-1" />
            Connected
          </Badge>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="cyber-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Active Connections
                  </p>
                  <p className="text-2xl font-bold cyber-text-glow">
                    {connectionStats.activeConnections.toLocaleString()}
                  </p>
                </div>
                <Wifi className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="cyber-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Messages/Second
                  </p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {connectionStats.messagesPerSecond}
                  </p>
                </div>
                <Zap className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="cyber-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Messages
                  </p>
                  <p className="text-2xl font-bold text-blue-400">
                    {connectionStats.totalMessages.toLocaleString()}
                  </p>
                </div>
                <Activity className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="cyber-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Uptime</p>
                  <p className="text-2xl font-bold text-green-400">
                    {connectionStats.uptime}
                  </p>
                </div>
                <Shield className="w-8 h-8 text-green-400" />
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
                Pusher Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">App ID</label>
                <Input
                  value={settings.pusherAppId}
                  onChange={(e) =>
                    setSettings({ ...settings, pusherAppId: e.target.value })
                  }
                  className="glass-effect"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  App Key
                </label>
                <Input
                  value={settings.pusherKey}
                  onChange={(e) =>
                    setSettings({ ...settings, pusherKey: e.target.value })
                  }
                  className="glass-effect"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  App Secret
                </label>
                <Input
                  type="password"
                  value={settings.pusherSecret}
                  onChange={(e) =>
                    setSettings({ ...settings, pusherSecret: e.target.value })
                  }
                  className="glass-effect"
                  placeholder="Enter app secret"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Cluster
                </label>
                <Select
                  value={settings.pusherCluster}
                  onValueChange={(value) =>
                    setSettings({ ...settings, pusherCluster: value })
                  }
                >
                  <SelectTrigger className="glass-effect">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="us2">US East (us2)</SelectItem>
                    <SelectItem value="us3">US West (us3)</SelectItem>
                    <SelectItem value="eu">Europe (eu)</SelectItem>
                    <SelectItem value="ap1">Asia Pacific (ap1)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Enable SSL</label>
                <Switch
                  checked={settings.enableSSL}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, enableSSL: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card className="cyber-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Connection Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Max Connections
                </label>
                <Input
                  type="number"
                  value={settings.maxConnections}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      maxConnections: parseInt(e.target.value),
                    })
                  }
                  className="glass-effect"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Connection Timeout (seconds)
                </label>
                <Input
                  type="number"
                  value={settings.connectionTimeout}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      connectionTimeout: parseInt(e.target.value),
                    })
                  }
                  className="glass-effect"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Heartbeat Interval (seconds)
                </label>
                <Input
                  type="number"
                  value={settings.heartbeatInterval}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      heartbeatInterval: parseInt(e.target.value),
                    })
                  }
                  className="glass-effect"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Allowed Origins
                </label>
                <Textarea
                  value={settings.allowOrigins}
                  onChange={(e) =>
                    setSettings({ ...settings, allowOrigins: e.target.value })
                  }
                  className="glass-effect"
                  placeholder="* or specific domains"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Debug Mode</label>
                <Switch
                  checked={settings.enableDebug}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, enableDebug: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Channels */}
        <Card className="cyber-border">
          <CardHeader>
            <CardTitle>Active Channels</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {channels.map((channel, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">{channel.name}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {channel.subscribers.toLocaleString()} subscribers
                    </span>
                  </div>
                  <Badge className="bg-green-500/20 text-green-400">
                    {channel.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button variant="outline" className="cyber-border">
            Test Connection
          </Button>
          <Button className="cyber-button">Save Settings</Button>
        </div>
      </div>
    </div>
  );
}
