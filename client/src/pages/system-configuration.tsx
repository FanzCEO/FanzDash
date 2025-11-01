import { useState, useEffect } from "react";
import { SEOHeadTags, SEOBreadcrumbs } from "@/components/SEOHeadTags";
import {
  adminPageSEO,
  generatePageTitle,
  generateAdminBreadcrumbs,
} from "@/lib/seo-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Settings,
  Globe,
  Shield,
  Clock,
  Users,
  FileText,
  Database,
  Server,
  Network,
  Lock,
  AlertTriangle,
  CheckCircle,
  Zap,
  Mail,
  Bell,
  CreditCard,
  Image,
  Video,
  Upload,
  Download,
  Cpu,
  HardDrive,
  Wifi,
  Eye,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface SystemConfig {
  // General Settings
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  defaultLanguage: string;

  // Security Settings
  forceHttps: boolean;
  enableTwoFactor: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
  ipWhitelist: string[];
  enableCaptcha: boolean;
  strongPasswordPolicy: boolean;

  // Upload Settings
  maxFileSize: number; // MB
  allowedImageTypes: string[];
  allowedVideoTypes: string[];
  allowedDocTypes: string[];
  enableImageCompression: boolean;
  imageQuality: number;
  enableWatermark: boolean;
  watermarkText: string;

  // Performance Settings
  enableCaching: boolean;
  cacheTimeout: number;
  enableCdn: boolean;
  cdnUrl: string;
  enableGzip: boolean;
  minifyAssets: boolean;
  enableLazyLoading: boolean;

  // Content Settings
  enableComments: boolean;
  moderateComments: boolean;
  enableRatings: boolean;
  enableSharing: boolean;
  defaultPostPrivacy: "public" | "private" | "followers";
  enablePostScheduling: boolean;
  maxPostsPerDay: number;

  // Monetization Settings
  enableSubscriptions: boolean;
  enableTips: boolean;
  enablePaidMessages: boolean;
  enableCommissions: boolean;
  commissionRate: number;
  minWithdrawAmount: number;
  maxWithdrawAmount: number;
  withdrawalProcessingDays: number;

  // Communication Settings
  enableLiveChat: boolean;
  enableVideoCall: boolean;
  enableAudioCall: boolean;
  enableVoiceMessages: boolean;
  chatMessageLimit: number;
  enableMessageEncryption: boolean;

  // Compliance Settings
  enableKyc: boolean;
  requireEmailVerification: boolean;
  requirePhoneVerification: boolean;
  enableGdprCompliance: boolean;
  cookieConsentRequired: boolean;
  dataRetentionDays: number;

  // API Settings
  enableApiAccess: boolean;
  apiRateLimit: number;
  enableWebhooks: boolean;
  webhookRetries: number;

  // Backup Settings
  enableAutoBackup: boolean;
  backupFrequency: "daily" | "weekly" | "monthly";
  backupRetention: number; // days
  backupLocation: "local" | "cloud" | "both";

  // Maintenance Settings
  maintenanceMode: boolean;
  maintenanceMessage: string;
  allowedIps: string[];

  // Analytics Settings
  enableAnalytics: boolean;
  googleAnalyticsId: string;
  enableHeatmaps: boolean;
  enableErrorTracking: boolean;

  // Social Features
  enableFollowers: boolean;
  enableBlocking: boolean;
  enableReporting: boolean;
  enableVerification: boolean;
  verificationRequirements: string;
}

export default function SystemConfiguration() {
  const seoData = adminPageSEO.systemConfiguration;
  const breadcrumbs = generateAdminBreadcrumbs("system-configuration");
  const [activeTab, setActiveTab] = useState("general");
  const [config, setConfig] = useState<SystemConfig>({
    // General Settings
    siteName: "FanzDash",
    siteDescription: "Enterprise Content Management Platform",
    siteUrl: "https://fanzdash.com",
    timezone: "UTC",
    dateFormat: "MM/dd/yyyy",
    timeFormat: "12h",
    defaultLanguage: "en",

    // Security Settings
    forceHttps: true,
    enableTwoFactor: true,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    ipWhitelist: [],
    enableCaptcha: true,
    strongPasswordPolicy: true,

    // Upload Settings
    maxFileSize: 100,
    allowedImageTypes: ["jpg", "jpeg", "png", "gif", "webp"],
    allowedVideoTypes: ["mp4", "mov", "avi", "webm"],
    allowedDocTypes: ["pdf", "doc", "docx", "txt"],
    enableImageCompression: true,
    imageQuality: 85,
    enableWatermark: false,
    watermarkText: "FanzDash",

    // Performance Settings
    enableCaching: true,
    cacheTimeout: 3600,
    enableCdn: false,
    cdnUrl: "",
    enableGzip: true,
    minifyAssets: true,
    enableLazyLoading: true,

    // Content Settings
    enableComments: true,
    moderateComments: false,
    enableRatings: true,
    enableSharing: true,
    defaultPostPrivacy: "public",
    enablePostScheduling: true,
    maxPostsPerDay: 50,

    // Monetization Settings
    enableSubscriptions: true,
    enableTips: true,
    enablePaidMessages: true,
    enableCommissions: true,
    commissionRate: 10,
    minWithdrawAmount: 50,
    maxWithdrawAmount: 10000,
    withdrawalProcessingDays: 3,

    // Communication Settings
    enableLiveChat: true,
    enableVideoCall: true,
    enableAudioCall: true,
    enableVoiceMessages: true,
    chatMessageLimit: 1000,
    enableMessageEncryption: true,

    // Compliance Settings
    enableKyc: true,
    requireEmailVerification: true,
    requirePhoneVerification: false,
    enableGdprCompliance: true,
    cookieConsentRequired: true,
    dataRetentionDays: 365,

    // API Settings
    enableApiAccess: true,
    apiRateLimit: 100,
    enableWebhooks: true,
    webhookRetries: 3,

    // Backup Settings
    enableAutoBackup: true,
    backupFrequency: "daily",
    backupRetention: 30,
    backupLocation: "cloud",

    // Maintenance Settings
    maintenanceMode: false,
    maintenanceMessage:
      "We're performing scheduled maintenance. Please check back soon.",
    allowedIps: [],

    // Analytics Settings
    enableAnalytics: true,
    googleAnalyticsId: "",
    enableHeatmaps: false,
    enableErrorTracking: true,

    // Social Features
    enableFollowers: true,
    enableBlocking: true,
    enableReporting: true,
    enableVerification: true,
    verificationRequirements:
      "Government ID, Social Media Verification, Phone Number",
  });

  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save system configuration to database
      await apiRequest("/api/system/configuration", "POST", config);
      
      toast({
        title: "Configuration Saved",
        description: "System configuration has been saved to database successfully.",
      });
    } catch (error) {
      console.error("System config save error:", error);
      toast({
        title: "Save Failed",
        description: "Failed to save system configuration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateConfig = (key: keyof SystemConfig, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <>
      <SEOHeadTags
        title={generatePageTitle(seoData.title)}
        description={seoData.description}
        keywords={seoData.keywords}
        canonicalUrl="https://fanzdash.com/system-configuration"
        schema={seoData.structuredData}
      />

      <div className="space-y-6">
        <SEOBreadcrumbs items={breadcrumbs} className="mb-6" />
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center space-x-3">
              <Settings className="h-8 w-8 text-primary" />
              <span>System Configuration</span>
            </h1>
            <p className="text-muted-foreground">
              Configure system-wide settings and preferences
            </p>
          </div>

          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-gradient-to-r from-primary to-purple-600"
          >
            {isSaving ? "Saving..." : "Save Configuration"}
          </Button>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="uploads">Uploads</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="monetization">Monetization</TabsTrigger>
            <TabsTrigger value="communication">Communication</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5" />
                  <span>General Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="site-name">Site Name</Label>
                    <Input
                      id="site-name"
                      value={config.siteName}
                      onChange={(e) => updateConfig("siteName", e.target.value)}
                      data-testid="site-name-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="site-url">Site URL</Label>
                    <Input
                      id="site-url"
                      value={config.siteUrl}
                      onChange={(e) => updateConfig("siteUrl", e.target.value)}
                      data-testid="site-url-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timezone">Default Timezone</Label>
                    <Select
                      value={config.timezone}
                      onValueChange={(value) => updateConfig("timezone", value)}
                    >
                      <SelectTrigger data-testid="timezone-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">
                          Eastern Time
                        </SelectItem>
                        <SelectItem value="America/Los_Angeles">
                          Pacific Time
                        </SelectItem>
                        <SelectItem value="Europe/London">London</SelectItem>
                        <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language">Default Language</Label>
                    <Select
                      value={config.defaultLanguage}
                      onValueChange={(value) =>
                        updateConfig("defaultLanguage", value)
                      }
                    >
                      <SelectTrigger data-testid="language-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="pt">Portuguese</SelectItem>
                        <SelectItem value="ja">Japanese</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="site-description">Site Description</Label>
                  <Textarea
                    id="site-description"
                    value={config.siteDescription}
                    onChange={(e) =>
                      updateConfig("siteDescription", e.target.value)
                    }
                    rows={3}
                    data-testid="site-description-input"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Security Configuration</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="force-https">Force HTTPS</Label>
                      <p className="text-sm text-muted-foreground">
                        Redirect all HTTP requests to HTTPS
                      </p>
                    </div>
                    <Switch
                      id="force-https"
                      checked={config.forceHttps}
                      onCheckedChange={(checked) =>
                        updateConfig("forceHttps", checked)
                      }
                      data-testid="force-https-toggle"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enable-2fa">
                        Two-Factor Authentication
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Enable 2FA for all users
                      </p>
                    </div>
                    <Switch
                      id="enable-2fa"
                      checked={config.enableTwoFactor}
                      onCheckedChange={(checked) =>
                        updateConfig("enableTwoFactor", checked)
                      }
                      data-testid="enable-2fa-toggle"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="session-timeout">
                      Session Timeout (minutes)
                    </Label>
                    <Input
                      id="session-timeout"
                      type="number"
                      value={config.sessionTimeout}
                      onChange={(e) =>
                        updateConfig("sessionTimeout", parseInt(e.target.value))
                      }
                      data-testid="session-timeout-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max-login-attempts">
                      Max Login Attempts
                    </Label>
                    <Input
                      id="max-login-attempts"
                      type="number"
                      value={config.maxLoginAttempts}
                      onChange={(e) =>
                        updateConfig(
                          "maxLoginAttempts",
                          parseInt(e.target.value),
                        )
                      }
                      data-testid="max-login-attempts-input"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enable-captcha">Enable CAPTCHA</Label>
                      <p className="text-sm text-muted-foreground">
                        Show CAPTCHA on login/registration
                      </p>
                    </div>
                    <Switch
                      id="enable-captcha"
                      checked={config.enableCaptcha}
                      onCheckedChange={(checked) =>
                        updateConfig("enableCaptcha", checked)
                      }
                      data-testid="enable-captcha-toggle"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="strong-password">
                        Strong Password Policy
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Require complex passwords
                      </p>
                    </div>
                    <Switch
                      id="strong-password"
                      checked={config.strongPasswordPolicy}
                      onCheckedChange={(checked) =>
                        updateConfig("strongPasswordPolicy", checked)
                      }
                      data-testid="strong-password-toggle"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Upload Settings */}
          <TabsContent value="uploads" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="h-5 w-5" />
                  <span>File Upload Configuration</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="max-file-size">Max File Size (MB)</Label>
                    <Input
                      id="max-file-size"
                      type="number"
                      value={config.maxFileSize}
                      onChange={(e) =>
                        updateConfig("maxFileSize", parseInt(e.target.value))
                      }
                      data-testid="max-file-size-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="image-quality">Image Quality (%)</Label>
                    <Input
                      id="image-quality"
                      type="number"
                      min="1"
                      max="100"
                      value={config.imageQuality}
                      onChange={(e) =>
                        updateConfig("imageQuality", parseInt(e.target.value))
                      }
                      data-testid="image-quality-input"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enable-compression">
                        Image Compression
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically compress uploaded images
                      </p>
                    </div>
                    <Switch
                      id="enable-compression"
                      checked={config.enableImageCompression}
                      onCheckedChange={(checked) =>
                        updateConfig("enableImageCompression", checked)
                      }
                      data-testid="enable-compression-toggle"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enable-watermark">Enable Watermark</Label>
                      <p className="text-sm text-muted-foreground">
                        Add watermark to uploaded images
                      </p>
                    </div>
                    <Switch
                      id="enable-watermark"
                      checked={config.enableWatermark}
                      onCheckedChange={(checked) =>
                        updateConfig("enableWatermark", checked)
                      }
                      data-testid="enable-watermark-toggle"
                    />
                  </div>
                </div>

                {config.enableWatermark && (
                  <div className="space-y-2">
                    <Label htmlFor="watermark-text">Watermark Text</Label>
                    <Input
                      id="watermark-text"
                      value={config.watermarkText}
                      onChange={(e) =>
                        updateConfig("watermarkText", e.target.value)
                      }
                      data-testid="watermark-text-input"
                    />
                  </div>
                )}

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Allowed File Types:</strong>
                    <br />
                    Images: {config.allowedImageTypes.join(", ")}
                    <br />
                    Videos: {config.allowedVideoTypes.join(", ")}
                    <br />
                    Documents: {config.allowedDocTypes.join(", ")}
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Settings */}
          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>Performance Optimization</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enable-caching">Enable Caching</Label>
                      <p className="text-sm text-muted-foreground">
                        Cache static content for faster loading
                      </p>
                    </div>
                    <Switch
                      id="enable-caching"
                      checked={config.enableCaching}
                      onCheckedChange={(checked) =>
                        updateConfig("enableCaching", checked)
                      }
                      data-testid="enable-caching-toggle"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cache-timeout">
                      Cache Timeout (seconds)
                    </Label>
                    <Input
                      id="cache-timeout"
                      type="number"
                      value={config.cacheTimeout}
                      onChange={(e) =>
                        updateConfig("cacheTimeout", parseInt(e.target.value))
                      }
                      disabled={!config.enableCaching}
                      data-testid="cache-timeout-input"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enable-cdn">Enable CDN</Label>
                      <p className="text-sm text-muted-foreground">
                        Use Content Delivery Network
                      </p>
                    </div>
                    <Switch
                      id="enable-cdn"
                      checked={config.enableCdn}
                      onCheckedChange={(checked) =>
                        updateConfig("enableCdn", checked)
                      }
                      data-testid="enable-cdn-toggle"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cdn-url">CDN URL</Label>
                    <Input
                      id="cdn-url"
                      value={config.cdnUrl}
                      onChange={(e) => updateConfig("cdnUrl", e.target.value)}
                      disabled={!config.enableCdn}
                      placeholder="https://cdn.example.com"
                      data-testid="cdn-url-input"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enable-gzip">
                        Enable Gzip Compression
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Compress responses to reduce bandwidth
                      </p>
                    </div>
                    <Switch
                      id="enable-gzip"
                      checked={config.enableGzip}
                      onCheckedChange={(checked) =>
                        updateConfig("enableGzip", checked)
                      }
                      data-testid="enable-gzip-toggle"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="minify-assets">Minify Assets</Label>
                      <p className="text-sm text-muted-foreground">
                        Minify CSS and JavaScript files
                      </p>
                    </div>
                    <Switch
                      id="minify-assets"
                      checked={config.minifyAssets}
                      onCheckedChange={(checked) =>
                        updateConfig("minifyAssets", checked)
                      }
                      data-testid="minify-assets-toggle"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Settings */}
          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Content Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enable-comments">Enable Comments</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow users to comment on posts
                      </p>
                    </div>
                    <Switch
                      id="enable-comments"
                      checked={config.enableComments}
                      onCheckedChange={(checked) =>
                        updateConfig("enableComments", checked)
                      }
                      data-testid="enable-comments-toggle"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="moderate-comments">
                        Moderate Comments
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Require approval before comments appear
                      </p>
                    </div>
                    <Switch
                      id="moderate-comments"
                      checked={config.moderateComments}
                      onCheckedChange={(checked) =>
                        updateConfig("moderateComments", checked)
                      }
                      disabled={!config.enableComments}
                      data-testid="moderate-comments-toggle"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="default-privacy">
                      Default Post Privacy
                    </Label>
                    <Select
                      value={config.defaultPostPrivacy}
                      onValueChange={(value: any) =>
                        updateConfig("defaultPostPrivacy", value)
                      }
                    >
                      <SelectTrigger data-testid="default-privacy-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                        <SelectItem value="followers">
                          Followers Only
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max-posts-per-day">Max Posts Per Day</Label>
                    <Input
                      id="max-posts-per-day"
                      type="number"
                      value={config.maxPostsPerDay}
                      onChange={(e) =>
                        updateConfig("maxPostsPerDay", parseInt(e.target.value))
                      }
                      data-testid="max-posts-per-day-input"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enable-ratings">Enable Ratings</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow users to rate content
                      </p>
                    </div>
                    <Switch
                      id="enable-ratings"
                      checked={config.enableRatings}
                      onCheckedChange={(checked) =>
                        updateConfig("enableRatings", checked)
                      }
                      data-testid="enable-ratings-toggle"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enable-sharing">Enable Sharing</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow content sharing to social media
                      </p>
                    </div>
                    <Switch
                      id="enable-sharing"
                      checked={config.enableSharing}
                      onCheckedChange={(checked) =>
                        updateConfig("enableSharing", checked)
                      }
                      data-testid="enable-sharing-toggle"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Monetization Settings */}
          <TabsContent value="monetization" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5" />
                  <span>Monetization Configuration</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enable-subscriptions">
                        Enable Subscriptions
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Allow creators to offer subscriptions
                      </p>
                    </div>
                    <Switch
                      id="enable-subscriptions"
                      checked={config.enableSubscriptions}
                      onCheckedChange={(checked) =>
                        updateConfig("enableSubscriptions", checked)
                      }
                      data-testid="enable-subscriptions-toggle"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enable-tips">Enable Tips</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow users to tip creators
                      </p>
                    </div>
                    <Switch
                      id="enable-tips"
                      checked={config.enableTips}
                      onCheckedChange={(checked) =>
                        updateConfig("enableTips", checked)
                      }
                      data-testid="enable-tips-toggle"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="commission-rate">Commission Rate (%)</Label>
                    <Input
                      id="commission-rate"
                      type="number"
                      min="0"
                      max="50"
                      value={config.commissionRate}
                      onChange={(e) =>
                        updateConfig(
                          "commissionRate",
                          parseFloat(e.target.value),
                        )
                      }
                      data-testid="commission-rate-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="min-withdraw">
                      Minimum Withdrawal Amount
                    </Label>
                    <Input
                      id="min-withdraw"
                      type="number"
                      value={config.minWithdrawAmount}
                      onChange={(e) =>
                        updateConfig(
                          "minWithdrawAmount",
                          parseFloat(e.target.value),
                        )
                      }
                      data-testid="min-withdraw-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max-withdraw">
                      Maximum Withdrawal Amount
                    </Label>
                    <Input
                      id="max-withdraw"
                      type="number"
                      value={config.maxWithdrawAmount}
                      onChange={(e) =>
                        updateConfig(
                          "maxWithdrawAmount",
                          parseFloat(e.target.value),
                        )
                      }
                      data-testid="max-withdraw-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="withdrawal-processing">
                      Withdrawal Processing Days
                    </Label>
                    <Input
                      id="withdrawal-processing"
                      type="number"
                      value={config.withdrawalProcessingDays}
                      onChange={(e) =>
                        updateConfig(
                          "withdrawalProcessingDays",
                          parseInt(e.target.value),
                        )
                      }
                      data-testid="withdrawal-processing-input"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Communication Settings */}
          <TabsContent value="communication" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>Communication Features</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enable-live-chat">Enable Live Chat</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow real-time messaging
                      </p>
                    </div>
                    <Switch
                      id="enable-live-chat"
                      checked={config.enableLiveChat}
                      onCheckedChange={(checked) =>
                        updateConfig("enableLiveChat", checked)
                      }
                      data-testid="enable-live-chat-toggle"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enable-video-call">
                        Enable Video Calls
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Allow video communication
                      </p>
                    </div>
                    <Switch
                      id="enable-video-call"
                      checked={config.enableVideoCall}
                      onCheckedChange={(checked) =>
                        updateConfig("enableVideoCall", checked)
                      }
                      data-testid="enable-video-call-toggle"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enable-audio-call">
                        Enable Audio Calls
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Allow voice communication
                      </p>
                    </div>
                    <Switch
                      id="enable-audio-call"
                      checked={config.enableAudioCall}
                      onCheckedChange={(checked) =>
                        updateConfig("enableAudioCall", checked)
                      }
                      data-testid="enable-audio-call-toggle"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="chat-message-limit">
                      Daily Message Limit
                    </Label>
                    <Input
                      id="chat-message-limit"
                      type="number"
                      value={config.chatMessageLimit}
                      onChange={(e) =>
                        updateConfig(
                          "chatMessageLimit",
                          parseInt(e.target.value),
                        )
                      }
                      data-testid="chat-message-limit-input"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="message-encryption">
                        Message Encryption
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Encrypt private messages
                      </p>
                    </div>
                    <Switch
                      id="message-encryption"
                      checked={config.enableMessageEncryption}
                      onCheckedChange={(checked) =>
                        updateConfig("enableMessageEncryption", checked)
                      }
                      data-testid="message-encryption-toggle"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Settings */}
          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Server className="h-5 w-5" />
                  <span>System Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Put site in maintenance mode
                      </p>
                    </div>
                    <Switch
                      id="maintenance-mode"
                      checked={config.maintenanceMode}
                      onCheckedChange={(checked) =>
                        updateConfig("maintenanceMode", checked)
                      }
                      data-testid="maintenance-mode-toggle"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="auto-backup">Auto Backup</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable automatic backups
                      </p>
                    </div>
                    <Switch
                      id="auto-backup"
                      checked={config.enableAutoBackup}
                      onCheckedChange={(checked) =>
                        updateConfig("enableAutoBackup", checked)
                      }
                      data-testid="auto-backup-toggle"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="backup-frequency">Backup Frequency</Label>
                    <Select
                      value={config.backupFrequency}
                      onValueChange={(value: any) =>
                        updateConfig("backupFrequency", value)
                      }
                    >
                      <SelectTrigger data-testid="backup-frequency-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="data-retention">
                      Data Retention (days)
                    </Label>
                    <Input
                      id="data-retention"
                      type="number"
                      value={config.dataRetentionDays}
                      onChange={(e) =>
                        updateConfig(
                          "dataRetentionDays",
                          parseInt(e.target.value),
                        )
                      }
                      data-testid="data-retention-input"
                    />
                  </div>
                </div>

                {config.maintenanceMode && (
                  <div className="space-y-2">
                    <Label htmlFor="maintenance-message">
                      Maintenance Message
                    </Label>
                    <Textarea
                      id="maintenance-message"
                      value={config.maintenanceMessage}
                      onChange={(e) =>
                        updateConfig("maintenanceMessage", e.target.value)
                      }
                      rows={3}
                      data-testid="maintenance-message-input"
                    />
                  </div>
                )}

                <Alert
                  className={config.maintenanceMode ? "border-yellow-500" : ""}
                >
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {config.maintenanceMode
                      ? "⚠️ Maintenance mode is ACTIVE. Only administrators can access the site."
                      : "✅ Site is operating normally. All features are accessible to users."}
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
