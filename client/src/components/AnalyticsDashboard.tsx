import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Activity, BarChart3, Eye, Settings, TrendingUp, Users, Globe, Zap } from "lucide-react";

interface AnalyticsConfig {
  id: string;
  platformId: string;
  ga4MeasurementId?: string;
  ga4ApiSecret?: string;
  ga4StreamId?: string;
  ga4PropertyId?: string;
  gtmContainerId?: string;
  gtmEnvironment?: string;
  facebookPixelId?: string;
  tiktokPixelId?: string;
  twitterPixelId?: string;
  redditPixelId?: string;
  instagramPixelId?: string;
  patreonClientId?: string;
  trafficAnalysisEnabled: boolean;
  isActive: boolean;
}

interface DashboardData {
  config: AnalyticsConfig;
  stats: {
    totalEvents: number;
    uniqueUsers: number;
    uniqueSessions: number;
    eventsByType: Record<string, number>;
    eventsBySource: Record<string, number>;
    deviceTypes: Record<string, number>;
    topPages: Record<string, number>;
  };
  recentEvents: any[];
}

export default function AnalyticsDashboard() {
  const [platforms] = useState([
    "BoyFanz", "GirlFanz", "TransFanz", "BearFanz", "PupFanz",
    "CougarFanz", "FemmeFanz", "FanzUncut", "FanzDiscreet", "TabooFanz",
    "FanzClips", "FanzEliteTube", "FanzLanding"
  ]);
  const [selectedPlatform, setSelectedPlatform] = useState("BoyFanz");
  const [config, setConfig] = useState<AnalyticsConfig | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [trackingScript, setTrackingScript] = useState("");
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    ga4MeasurementId: "",
    ga4ApiSecret: "",
    ga4StreamId: "",
    ga4PropertyId: "",
    gtmContainerId: "",
    gtmEnvironment: "live",
    facebookPixelId: "",
    tiktokPixelId: "",
    twitterPixelId: "",
    redditPixelId: "",
    instagramPixelId: "",
    patreonClientId: "",
    trafficAnalysisEnabled: true,
  });

  useEffect(() => {
    if (selectedPlatform) {
      fetchConfig();
      fetchDashboardData();
    }
  }, [selectedPlatform]);

  const fetchConfig = async () => {
    try {
      const response = await fetch(`/api/analytics/config/${selectedPlatform}`);
      if (response.ok) {
        const data = await response.json();
        setConfig(data.config);
        if (data.config) {
          setFormData({
            ga4MeasurementId: data.config.ga4MeasurementId || "",
            ga4ApiSecret: data.config.ga4ApiSecret || "",
            ga4StreamId: data.config.ga4StreamId || "",
            ga4PropertyId: data.config.ga4PropertyId || "",
            gtmContainerId: data.config.gtmContainerId || "",
            gtmEnvironment: data.config.gtmEnvironment || "live",
            facebookPixelId: data.config.facebookPixelId || "",
            tiktokPixelId: data.config.tiktokPixelId || "",
            twitterPixelId: data.config.twitterPixelId || "",
            redditPixelId: data.config.redditPixelId || "",
            instagramPixelId: data.config.instagramPixelId || "",
            patreonClientId: data.config.patreonClientId || "",
            trafficAnalysisEnabled: data.config.trafficAnalysisEnabled ?? true,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching config:", error);
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/analytics/dashboard/${selectedPlatform}`);
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/analytics/config/${selectedPlatform}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ga4: {
            measurementId: formData.ga4MeasurementId,
            apiSecret: formData.ga4ApiSecret,
            streamId: formData.ga4StreamId,
            propertyId: formData.ga4PropertyId,
          },
          gtm: {
            containerId: formData.gtmContainerId,
            environment: formData.gtmEnvironment,
          },
          pixels: {
            facebook: formData.facebookPixelId ? { pixelId: formData.facebookPixelId } : undefined,
            tiktok: formData.tiktokPixelId ? { pixelId: formData.tiktokPixelId } : undefined,
            twitter: formData.twitterPixelId ? { pixelId: formData.twitterPixelId } : undefined,
            reddit: formData.redditPixelId ? { pixelId: formData.redditPixelId } : undefined,
            instagram: formData.instagramPixelId ? { pixelId: formData.instagramPixelId } : undefined,
            patreon: formData.patreonClientId ? { clientId: formData.patreonClientId } : undefined,
          },
          trafficAnalysisEnabled: formData.trafficAnalysisEnabled,
        }),
      });

      if (response.ok) {
        toast({ title: "Success", description: "Analytics configuration saved successfully" });
        setConfigDialogOpen(false);
        fetchConfig();
      } else {
        toast({ title: "Error", description: "Failed to save configuration", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to save configuration", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fetchTrackingScript = async () => {
    try {
      const response = await fetch(`/api/analytics/script/${selectedPlatform}`);
      if (response.ok) {
        const script = await response.text();
        setTrackingScript(script);
      }
    } catch (error) {
      console.error("Error fetching tracking script:", error);
    }
  };

  const testConfiguration = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/analytics/test/${selectedPlatform}`, {
        method: "POST",
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: result.success ? "Test Successful" : "Test Failed",
          description: result.message,
          variant: result.success ? "default" : "destructive",
        });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to test configuration", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Centralized analytics for all FANZ platforms
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {platforms.map((platform) => (
                <SelectItem key={platform} value={platform}>
                  {platform}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                Configure
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Analytics Configuration - {selectedPlatform}</DialogTitle>
              </DialogHeader>

              <Tabs defaultValue="ga4" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="ga4">Google Analytics 4</TabsTrigger>
                  <TabsTrigger value="gtm">Tag Manager</TabsTrigger>
                  <TabsTrigger value="pixels">Social Pixels</TabsTrigger>
                </TabsList>

                <TabsContent value="ga4" className="space-y-4">
                  <div>
                    <Label>Measurement ID</Label>
                    <Input
                      placeholder="G-XXXXXXXXXX"
                      value={formData.ga4MeasurementId}
                      onChange={(e) => setFormData({ ...formData, ga4MeasurementId: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>API Secret</Label>
                    <Input
                      type="password"
                      placeholder="API Secret"
                      value={formData.ga4ApiSecret}
                      onChange={(e) => setFormData({ ...formData, ga4ApiSecret: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Data Stream ID</Label>
                    <Input
                      placeholder="1234567890"
                      value={formData.ga4StreamId}
                      onChange={(e) => setFormData({ ...formData, ga4StreamId: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Property ID</Label>
                    <Input
                      placeholder="123456789"
                      value={formData.ga4PropertyId}
                      onChange={(e) => setFormData({ ...formData, ga4PropertyId: e.target.value })}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="gtm" className="space-y-4">
                  <div>
                    <Label>Container ID</Label>
                    <Input
                      placeholder="GTM-XXXXXXX"
                      value={formData.gtmContainerId}
                      onChange={(e) => setFormData({ ...formData, gtmContainerId: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Environment</Label>
                    <Select
                      value={formData.gtmEnvironment}
                      onValueChange={(value) => setFormData({ ...formData, gtmEnvironment: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="live">Live</SelectItem>
                        <SelectItem value="preview">Preview</SelectItem>
                        <SelectItem value="staging">Staging</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                <TabsContent value="pixels" className="space-y-4">
                  <div>
                    <Label>Facebook Pixel ID</Label>
                    <Input
                      placeholder="123456789012345"
                      value={formData.facebookPixelId}
                      onChange={(e) => setFormData({ ...formData, facebookPixelId: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>TikTok Pixel ID</Label>
                    <Input
                      placeholder="ABCDEFGHIJKLMNO"
                      value={formData.tiktokPixelId}
                      onChange={(e) => setFormData({ ...formData, tiktokPixelId: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Twitter Pixel ID</Label>
                    <Input
                      placeholder="o1234"
                      value={formData.twitterPixelId}
                      onChange={(e) => setFormData({ ...formData, twitterPixelId: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Reddit Pixel ID</Label>
                    <Input
                      placeholder="t2_abcdefgh"
                      value={formData.redditPixelId}
                      onChange={(e) => setFormData({ ...formData, redditPixelId: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Instagram Pixel ID</Label>
                    <Input
                      placeholder="123456789012345"
                      value={formData.instagramPixelId}
                      onChange={(e) => setFormData({ ...formData, instagramPixelId: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Patreon Client ID</Label>
                    <Input
                      placeholder="abc123..."
                      value={formData.patreonClientId}
                      onChange={(e) => setFormData({ ...formData, patreonClientId: e.target.value })}
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex items-center space-x-2 pt-4">
                <Switch
                  checked={formData.trafficAnalysisEnabled}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, trafficAnalysisEnabled: checked })
                  }
                />
                <Label>Enable Automated Traffic Analysis</Label>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setConfigDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={saveConfig} disabled={loading}>
                  {loading ? "Saving..." : "Save Configuration"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button onClick={testConfiguration} disabled={loading}>
            <Zap className="mr-2 h-4 w-4" />
            Test
          </Button>
        </div>
      </div>

      {config && (
        <div className="flex gap-2 flex-wrap">
          {config.ga4MeasurementId && <Badge variant="secondary">GA4 Enabled</Badge>}
          {config.gtmContainerId && <Badge variant="secondary">GTM Enabled</Badge>}
          {config.facebookPixelId && <Badge>Facebook</Badge>}
          {config.tiktokPixelId && <Badge>TikTok</Badge>}
          {config.twitterPixelId && <Badge>Twitter</Badge>}
          {config.redditPixelId && <Badge>Reddit</Badge>}
          {config.instagramPixelId && <Badge>Instagram</Badge>}
          {config.patreonClientId && <Badge>Patreon</Badge>}
        </div>
      )}

      {loading && <div className="text-center py-8">Loading analytics data...</div>}

      {!loading && dashboardData && (
        <div className="grid gap-6">
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.stats.totalEvents.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Last 30 days</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.stats.uniqueUsers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Active users</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sessions</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.stats.uniqueSessions.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Total sessions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Session</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardData.stats.uniqueSessions > 0
                    ? (dashboardData.stats.totalEvents / dashboardData.stats.uniqueSessions).toFixed(1)
                    : "0"}
                </div>
                <p className="text-xs text-muted-foreground">Events per session</p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Stats */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Events by Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(dashboardData.stats.eventsByType).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-sm">{type}</span>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Traffic Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(dashboardData.stats.eventsBySource).map(([source, count]) => (
                    <div key={source} className="flex items-center justify-between">
                      <span className="text-sm">{source}</span>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Device Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(dashboardData.stats.deviceTypes).map(([device, count]) => (
                    <div key={device} className="flex items-center justify-between">
                      <span className="text-sm">{device}</span>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Pages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(dashboardData.stats.topPages)
                    .slice(0, 5)
                    .map(([page, count]) => (
                      <div key={page} className="flex items-center justify-between">
                        <span className="text-sm truncate">{page}</span>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tracking Script */}
          <Card>
            <CardHeader>
              <CardTitle>Tracking Script</CardTitle>
              <CardDescription>
                Copy this script and add it to your platform's HTML
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={fetchTrackingScript} variant="outline" className="mb-4">
                <Globe className="mr-2 h-4 w-4" />
                Generate Script
              </Button>
              {trackingScript && (
                <Textarea
                  value={trackingScript}
                  readOnly
                  rows={10}
                  className="font-mono text-xs"
                />
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
