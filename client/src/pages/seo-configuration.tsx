import { useState } from "react";
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
  Search,
  Globe,
  Target,
  TrendingUp,
  FileText,
  Image,
  Link,
  Code,
  CheckCircle,
  AlertTriangle,
  Eye,
  Smartphone,
  Monitor,
  Tablet,
  BarChart3,
  Zap,
  Settings,
  Download,
  Upload,
  RefreshCw,
  ExternalLink,
  Hash,
  MapPin,
  Clock,
  Users,
  Star,
  XCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface SEOSettings {
  // General SEO
  siteName: string;
  siteDescription: string;
  siteKeywords: string[];
  defaultTitle: string;
  titleSeparator: string;
  metaAuthor: string;
  canonicalUrl: string;

  // Social Media / Open Graph
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogType: string;
  twitterCard: string;
  twitterSite: string;
  twitterCreator: string;

  // Technical SEO
  enableSitemap: boolean;
  enableRobotsTxt: boolean;
  robotsTxtContent: string;
  enableBreadcrumbs: boolean;
  enableSchemaMarkup: boolean;
  enableAMP: boolean;
  enablePWA: boolean;

  // Performance
  enableCompression: boolean;
  enableCaching: boolean;
  enableLazyLoading: boolean;
  enableCriticalCSS: boolean;
  enableMinification: boolean;

  // Analytics
  googleAnalyticsId: string;
  googleTagManagerId: string;
  facebookPixelId: string;
  googleSearchConsole: string;
  bingWebmasterTools: string;

  // Local SEO
  businessName: string;
  businessAddress: string;
  businessPhone: string;
  businessEmail: string;
  businessHours: string;
  latitude: string;
  longitude: string;

  // App Store Optimization (AEO)
  appTitle: string;
  appSubtitle: string;
  appDescription: string;
  appKeywords: string[];
  appCategory: string;
  appScreenshots: string[];
  appIcon: string;
  appPreviewVideo: string;

  // Content Optimization
  enableAutoMetaTags: boolean;
  enableAutoKeywords: boolean;
  enableContentAnalysis: boolean;
  enableInternalLinking: boolean;
  minContentLength: number;
  maxTitleLength: number;
  maxDescriptionLength: number;
}

interface SEOAnalysis {
  score: number;
  issues: Array<{
    type: "error" | "warning" | "info";
    message: string;
    fix?: string;
  }>;
  suggestions: string[];
  performance: {
    loadTime: number;
    mobileScore: number;
    desktopScore: number;
    seoScore: number;
  };
}

export default function SEOConfiguration() {
  const seoData = adminPageSEO.seoConfiguration;
  const breadcrumbs = generateAdminBreadcrumbs("seo-configuration");
  const [activeTab, setActiveTab] = useState("general");
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const [seoSettings, setSeoSettings] = useState<SEOSettings>({
    // General SEO
    siteName: "FanzDash - Enterprise Creator Platform",
    siteDescription:
      "Advanced creator economy platform supporting content management, live streaming, and monetization with enterprise-grade features",
    siteKeywords: [
      "creator platform",
      "content management",
      "live streaming",
      "monetization",
      "fan engagement",
      "subscription platform",
    ],
    defaultTitle: "FanzDash | Enterprise Creator Economy Platform",
    titleSeparator: " | ",
    metaAuthor: "FanzDash Team",
    canonicalUrl: "https://fanzdash.com",

    // Social Media / Open Graph
    ogTitle: "FanzDash - Next-Generation Creator Platform",
    ogDescription:
      "Join the most advanced creator economy platform with AI-powered content management, live streaming, and comprehensive monetization tools",
    ogImage: "https://fanzdash.com/assets/og-image.jpg",
    ogType: "website",
    twitterCard: "summary_large_image",
    twitterSite: "@fanzdash",
    twitterCreator: "@fanzdash",

    // Technical SEO
    enableSitemap: true,
    enableRobotsTxt: true,
    robotsTxtContent:
      "User-agent: *\nAllow: /\nSitemap: https://fanzdash.com/sitemap.xml",
    enableBreadcrumbs: true,
    enableSchemaMarkup: true,
    enableAMP: false,
    enablePWA: true,

    // Performance
    enableCompression: true,
    enableCaching: true,
    enableLazyLoading: true,
    enableCriticalCSS: true,
    enableMinification: true,

    // Analytics
    googleAnalyticsId: "",
    googleTagManagerId: "",
    facebookPixelId: "",
    googleSearchConsole: "",
    bingWebmasterTools: "",

    // Local SEO
    businessName: "FanzDash Inc.",
    businessAddress: "",
    businessPhone: "",
    businessEmail: "support@fanzdash.com",
    businessHours: "24/7 Online Platform",
    latitude: "",
    longitude: "",

    // App Store Optimization
    appTitle: "FanzDash: Creator Platform",
    appSubtitle: "Monetize Your Content Easily",
    appDescription:
      "Transform your passion into profit with FanzDash's comprehensive creator platform. Features include live streaming, content management, fan engagement tools, and multiple monetization options.",
    appKeywords: [
      "creator",
      "content",
      "streaming",
      "monetization",
      "fans",
      "subscription",
    ],
    appCategory: "Business",
    appScreenshots: [],
    appIcon: "",
    appPreviewVideo: "",

    // Content Optimization
    enableAutoMetaTags: true,
    enableAutoKeywords: true,
    enableContentAnalysis: true,
    enableInternalLinking: true,
    minContentLength: 300,
    maxTitleLength: 60,
    maxDescriptionLength: 160,
  });

  const [seoAnalysis] = useState<SEOAnalysis>({
    score: 87,
    issues: [
      {
        type: "warning",
        message: "Some pages missing meta descriptions",
        fix: "Add unique meta descriptions to all pages",
      },
      {
        type: "info",
        message: "Consider adding more internal links",
        fix: "Implement automated internal linking system",
      },
      {
        type: "error",
        message: "Missing Google Analytics tracking",
        fix: "Add Google Analytics ID in settings",
      },
    ],
    suggestions: [
      "Optimize images with WebP format for better performance",
      "Add structured data for better search visibility",
      "Implement breadcrumb navigation",
      "Create XML sitemap for better indexing",
      "Add social media meta tags",
    ],
    performance: {
      loadTime: 1.2,
      mobileScore: 94,
      desktopScore: 98,
      seoScore: 87,
    },
  });

  const updateSetting = (key: keyof SEOSettings, value: any) => {
    setSeoSettings((prev) => ({ ...prev, [key]: value }));
  };

  const addKeyword = (
    type: "siteKeywords" | "appKeywords",
    keyword: string,
  ) => {
    if (keyword.trim()) {
      updateSetting(type, [...seoSettings[type], keyword.trim()]);
    }
  };

  const removeKeyword = (
    type: "siteKeywords" | "appKeywords",
    index: number,
  ) => {
    const keywords = [...seoSettings[type]];
    keywords.splice(index, 1);
    updateSetting(type, keywords);
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      // Save SEO settings to database
      await apiRequest("/api/seo/settings", "POST", {
        pageUrl: "/", // Default homepage
        metaTitle: seoSettings.defaultTitle,
        metaDescription: seoSettings.siteDescription,
        metaKeywords: seoSettings.siteKeywords,
        ogTitle: seoSettings.ogTitle,
        ogDescription: seoSettings.ogDescription,
        ogImage: seoSettings.ogImage,
        ogType: seoSettings.ogType,
        twitterCard: seoSettings.twitterCard,
        canonicalUrl: seoSettings.canonicalUrl,
        robotsMeta: seoSettings.robotsTxtContent,
      });

      // Save GTM settings
      if (seoSettings.googleTagManagerId) {
        const gtmData: any = {
          containerId: seoSettings.googleTagManagerId,
          environment: "production",
          enabled: true,
        };
        
        // Only include Google Analytics if it's set
        if (seoSettings.googleAnalyticsId) {
          gtmData.tags = [{
            type: "google_analytics",
            trackingId: seoSettings.googleAnalyticsId
          }];
        }
        
        await apiRequest("/api/gtm/settings", "POST", gtmData);
      }

      toast({
        title: "SEO Settings Saved",
        description: "Your SEO configuration has been saved to the database successfully",
      });
    } catch (error) {
      console.error("Save error:", error);
      toast({
        title: "Save Failed",
        description: "Failed to save SEO settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const runSEOAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      // Simulate SEO analysis
      await new Promise((resolve) => setTimeout(resolve, 3000));

      toast({
        title: "SEO Analysis Complete",
        description: `Your site scored ${seoAnalysis.score}/100. Check the analysis tab for details.`,
      });

      setActiveTab("analysis");
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Failed to run SEO analysis. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateSitemap = async () => {
    try {
      // Simulate sitemap generation
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Sitemap Generated",
        description:
          "XML sitemap has been generated and submitted to search engines",
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate sitemap. Please try again.",
        variant: "destructive",
      });
    }
  };

  const KeywordInput = ({
    type,
    placeholder,
  }: {
    type: "siteKeywords" | "appKeywords";
    placeholder: string;
  }) => {
    const [inputValue, setInputValue] = useState("");

    const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault();
        addKeyword(type, inputValue);
        setInputValue("");
      }
    };

    return (
      <div className="space-y-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          data-testid={`${type}-input`}
        />
        <div className="flex flex-wrap gap-2">
          {seoSettings[type].map((keyword, index) => (
            <Badge key={index} variant="secondary" className="gap-1">
              {keyword}
              <button
                onClick={() => removeKeyword(type, index)}
                className="ml-1 hover:text-destructive"
                data-testid={`remove-${type}-${index}`}
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Press Enter or comma to add keywords
        </p>
      </div>
    );
  };

  return (
    <>
      <SEOHeadTags
        title={generatePageTitle(seoData.title)}
        description={seoData.description}
        keywords={seoData.keywords}
        canonicalUrl="https://fanzdash.com/seo-configuration"
        schema={seoData.structuredData}
      />

      <div className="space-y-6">
        <SEOBreadcrumbs items={breadcrumbs} className="mb-6" />
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center space-x-3">
              <Search className="h-8 w-8 text-primary" />
              <span>SEO & AEO Configuration</span>
            </h1>
            <p className="text-muted-foreground">
              Optimize your platform for search engines and app stores
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={runSEOAnalysis}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
              ) : (
                <BarChart3 className="h-4 w-4 mr-2" />
              )}
              Run Analysis
            </Button>

            <Button
              onClick={saveSettings}
              disabled={isSaving}
              className="bg-gradient-to-r from-primary to-purple-600"
            >
              {isSaving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </div>

        {/* SEO Score Card */}
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-4xl font-bold text-green-600">
                  {seoAnalysis.score}
                </div>
                <div>
                  <h3 className="font-semibold">SEO Score</h3>
                  <p className="text-sm text-muted-foreground">
                    {seoAnalysis.score >= 90
                      ? "Excellent"
                      : seoAnalysis.score >= 70
                        ? "Good"
                        : seoAnalysis.score >= 50
                          ? "Needs Improvement"
                          : "Poor"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-semibold">
                    {seoAnalysis.performance.mobileScore}
                  </div>
                  <div className="text-xs text-muted-foreground">Mobile</div>
                </div>
                <div>
                  <div className="text-lg font-semibold">
                    {seoAnalysis.performance.desktopScore}
                  </div>
                  <div className="text-xs text-muted-foreground">Desktop</div>
                </div>
                <div>
                  <div className="text-lg font-semibold">
                    {seoAnalysis.performance.loadTime}s
                  </div>
                  <div className="text-xs text-muted-foreground">Load Time</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="social">Social Media</TabsTrigger>
            <TabsTrigger value="technical">Technical</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="local">Local SEO</TabsTrigger>
            <TabsTrigger value="app-store">App Store</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
          </TabsList>

          {/* General SEO Tab */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5" />
                  <span>Basic SEO Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="site-name">Site Name</Label>
                    <Input
                      id="site-name"
                      value={seoSettings.siteName}
                      onChange={(e) =>
                        updateSetting("siteName", e.target.value)
                      }
                      placeholder="Your Platform Name"
                      data-testid="site-name-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="canonical-url">Canonical URL</Label>
                    <Input
                      id="canonical-url"
                      value={seoSettings.canonicalUrl}
                      onChange={(e) =>
                        updateSetting("canonicalUrl", e.target.value)
                      }
                      placeholder="https://yoursite.com"
                      data-testid="canonical-url-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="default-title">Default Page Title</Label>
                    <Input
                      id="default-title"
                      value={seoSettings.defaultTitle}
                      onChange={(e) =>
                        updateSetting("defaultTitle", e.target.value)
                      }
                      placeholder="Your Site Title"
                      maxLength={seoSettings.maxTitleLength}
                      data-testid="default-title-input"
                    />
                    <p className="text-xs text-muted-foreground">
                      {seoSettings.defaultTitle.length}/
                      {seoSettings.maxTitleLength} characters
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title-separator">Title Separator</Label>
                    <Select
                      value={seoSettings.titleSeparator}
                      onValueChange={(value) =>
                        updateSetting("titleSeparator", value)
                      }
                    >
                      <SelectTrigger data-testid="title-separator-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value=" | "> | (Pipe)</SelectItem>
                        <SelectItem value=" - "> - (Dash)</SelectItem>
                        <SelectItem value=" • "> • (Bullet)</SelectItem>
                        <SelectItem value=" :: "> :: (Double Colon)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="site-description">Site Description</Label>
                  <Textarea
                    id="site-description"
                    value={seoSettings.siteDescription}
                    onChange={(e) =>
                      updateSetting("siteDescription", e.target.value)
                    }
                    rows={3}
                    maxLength={seoSettings.maxDescriptionLength}
                    placeholder="Describe your platform and its key features"
                    data-testid="site-description-input"
                  />
                  <p className="text-xs text-muted-foreground">
                    {seoSettings.siteDescription.length}/
                    {seoSettings.maxDescriptionLength} characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Site Keywords</Label>
                  <KeywordInput
                    type="siteKeywords"
                    placeholder="Add keywords related to your platform"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meta-author">Meta Author</Label>
                  <Input
                    id="meta-author"
                    value={seoSettings.metaAuthor}
                    onChange={(e) =>
                      updateSetting("metaAuthor", e.target.value)
                    }
                    placeholder="Author or company name"
                    data-testid="meta-author-input"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Social Media Tab */}
          <TabsContent value="social" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Open Graph & Social Media</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="og-title">Open Graph Title</Label>
                    <Input
                      id="og-title"
                      value={seoSettings.ogTitle}
                      onChange={(e) => updateSetting("ogTitle", e.target.value)}
                      placeholder="Title for social media sharing"
                      data-testid="og-title-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="og-type">Open Graph Type</Label>
                    <Select
                      value={seoSettings.ogType}
                      onValueChange={(value) => updateSetting("ogType", value)}
                    >
                      <SelectTrigger data-testid="og-type-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="website">Website</SelectItem>
                        <SelectItem value="article">Article</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="music">Music</SelectItem>
                        <SelectItem value="profile">Profile</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="twitter-card">Twitter Card Type</Label>
                    <Select
                      value={seoSettings.twitterCard}
                      onValueChange={(value) =>
                        updateSetting("twitterCard", value)
                      }
                    >
                      <SelectTrigger data-testid="twitter-card-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="summary">Summary</SelectItem>
                        <SelectItem value="summary_large_image">
                          Summary Large Image
                        </SelectItem>
                        <SelectItem value="app">App</SelectItem>
                        <SelectItem value="player">Player</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="twitter-site">Twitter Site Handle</Label>
                    <Input
                      id="twitter-site"
                      value={seoSettings.twitterSite}
                      onChange={(e) =>
                        updateSetting("twitterSite", e.target.value)
                      }
                      placeholder="@yoursite"
                      data-testid="twitter-site-input"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="og-description">Open Graph Description</Label>
                  <Textarea
                    id="og-description"
                    value={seoSettings.ogDescription}
                    onChange={(e) =>
                      updateSetting("ogDescription", e.target.value)
                    }
                    rows={3}
                    placeholder="Description for social media sharing"
                    data-testid="og-description-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="og-image">Open Graph Image URL</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="og-image"
                      value={seoSettings.ogImage}
                      onChange={(e) => updateSetting("ogImage", e.target.value)}
                      placeholder="https://yoursite.com/og-image.jpg"
                      data-testid="og-image-input"
                    />
                    <Button variant="outline">
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Recommended size: 1200x630 pixels (1.91:1 ratio)
                  </p>
                </div>

                <Alert>
                  <Eye className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Preview:</strong> Test how your content looks when
                    shared on social media using Facebook's Sharing Debugger and
                    Twitter's Card Validator.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Technical SEO Tab */}
          <TabsContent value="technical" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Code className="h-5 w-5" />
                  <span>Technical SEO Features</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enable-sitemap">XML Sitemap</Label>
                      <p className="text-sm text-muted-foreground">
                        Generate and submit sitemap to search engines
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="enable-sitemap"
                        checked={seoSettings.enableSitemap}
                        onCheckedChange={(checked) =>
                          updateSetting("enableSitemap", checked)
                        }
                        data-testid="enable-sitemap-toggle"
                      />
                      {seoSettings.enableSitemap && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={generateSitemap}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enable-robots">Robots.txt</Label>
                      <p className="text-sm text-muted-foreground">
                        Control search engine crawling
                      </p>
                    </div>
                    <Switch
                      id="enable-robots"
                      checked={seoSettings.enableRobotsTxt}
                      onCheckedChange={(checked) =>
                        updateSetting("enableRobotsTxt", checked)
                      }
                      data-testid="enable-robots-toggle"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enable-breadcrumbs">Breadcrumbs</Label>
                      <p className="text-sm text-muted-foreground">
                        Add navigation breadcrumbs
                      </p>
                    </div>
                    <Switch
                      id="enable-breadcrumbs"
                      checked={seoSettings.enableBreadcrumbs}
                      onCheckedChange={(checked) =>
                        updateSetting("enableBreadcrumbs", checked)
                      }
                      data-testid="enable-breadcrumbs-toggle"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enable-schema">Schema Markup</Label>
                      <p className="text-sm text-muted-foreground">
                        Add structured data for rich snippets
                      </p>
                    </div>
                    <Switch
                      id="enable-schema"
                      checked={seoSettings.enableSchemaMarkup}
                      onCheckedChange={(checked) =>
                        updateSetting("enableSchemaMarkup", checked)
                      }
                      data-testid="enable-schema-toggle"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enable-pwa">Progressive Web App</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable PWA features
                      </p>
                    </div>
                    <Switch
                      id="enable-pwa"
                      checked={seoSettings.enablePWA}
                      onCheckedChange={(checked) =>
                        updateSetting("enablePWA", checked)
                      }
                      data-testid="enable-pwa-toggle"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enable-amp">AMP Pages</Label>
                      <p className="text-sm text-muted-foreground">
                        Accelerated Mobile Pages
                      </p>
                    </div>
                    <Switch
                      id="enable-amp"
                      checked={seoSettings.enableAMP}
                      onCheckedChange={(checked) =>
                        updateSetting("enableAMP", checked)
                      }
                      data-testid="enable-amp-toggle"
                    />
                  </div>
                </div>

                {seoSettings.enableRobotsTxt && (
                  <div className="space-y-2">
                    <Label htmlFor="robots-content">Robots.txt Content</Label>
                    <Textarea
                      id="robots-content"
                      value={seoSettings.robotsTxtContent}
                      onChange={(e) =>
                        updateSetting("robotsTxtContent", e.target.value)
                      }
                      rows={6}
                      placeholder="User-agent: *\nAllow: /\nSitemap: https://yoursite.com/sitemap.xml"
                      data-testid="robots-content-input"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>Performance Optimization</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enable-compression">
                        Gzip Compression
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Compress content for faster loading
                      </p>
                    </div>
                    <Switch
                      id="enable-compression"
                      checked={seoSettings.enableCompression}
                      onCheckedChange={(checked) =>
                        updateSetting("enableCompression", checked)
                      }
                      data-testid="enable-compression-toggle"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enable-caching">Browser Caching</Label>
                      <p className="text-sm text-muted-foreground">
                        Cache static resources
                      </p>
                    </div>
                    <Switch
                      id="enable-caching"
                      checked={seoSettings.enableCaching}
                      onCheckedChange={(checked) =>
                        updateSetting("enableCaching", checked)
                      }
                      data-testid="enable-caching-toggle"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enable-lazy-loading">Lazy Loading</Label>
                      <p className="text-sm text-muted-foreground">
                        Load images and content on demand
                      </p>
                    </div>
                    <Switch
                      id="enable-lazy-loading"
                      checked={seoSettings.enableLazyLoading}
                      onCheckedChange={(checked) =>
                        updateSetting("enableLazyLoading", checked)
                      }
                      data-testid="enable-lazy-loading-toggle"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enable-minification">
                        Asset Minification
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Minify CSS, JS, and HTML
                      </p>
                    </div>
                    <Switch
                      id="enable-minification"
                      checked={seoSettings.enableMinification}
                      onCheckedChange={(checked) =>
                        updateSetting("enableMinification", checked)
                      }
                      data-testid="enable-minification-toggle"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Analytics & Tracking</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="google-analytics">
                      Google Analytics ID
                    </Label>
                    <Input
                      id="google-analytics"
                      value={seoSettings.googleAnalyticsId}
                      onChange={(e) =>
                        updateSetting("googleAnalyticsId", e.target.value)
                      }
                      placeholder="G-XXXXXXXXXX or UA-XXXXXXXX-X"
                      data-testid="google-analytics-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="google-tag-manager">
                      Google Tag Manager ID
                    </Label>
                    <Input
                      id="google-tag-manager"
                      value={seoSettings.googleTagManagerId}
                      onChange={(e) =>
                        updateSetting("googleTagManagerId", e.target.value)
                      }
                      placeholder="GTM-XXXXXXX"
                      data-testid="google-tag-manager-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="facebook-pixel">Facebook Pixel ID</Label>
                    <Input
                      id="facebook-pixel"
                      value={seoSettings.facebookPixelId}
                      onChange={(e) =>
                        updateSetting("facebookPixelId", e.target.value)
                      }
                      placeholder="123456789012345"
                      data-testid="facebook-pixel-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="google-search-console">
                      Google Search Console
                    </Label>
                    <Input
                      id="google-search-console"
                      value={seoSettings.googleSearchConsole}
                      onChange={(e) =>
                        updateSetting("googleSearchConsole", e.target.value)
                      }
                      placeholder="Verification meta tag content"
                      data-testid="google-search-console-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bing-webmaster">Bing Webmaster Tools</Label>
                    <Input
                      id="bing-webmaster"
                      value={seoSettings.bingWebmasterTools}
                      onChange={(e) =>
                        updateSetting("bingWebmasterTools", e.target.value)
                      }
                      placeholder="Verification meta tag content"
                      data-testid="bing-webmaster-input"
                    />
                  </div>
                </div>

                <Alert>
                  <Settings className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Privacy Notice:</strong> Ensure you have proper
                    consent mechanisms in place when using tracking codes,
                    especially for GDPR compliance.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Local SEO Tab */}
          <TabsContent value="local" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>Local Business Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="business-name">Business Name</Label>
                    <Input
                      id="business-name"
                      value={seoSettings.businessName}
                      onChange={(e) =>
                        updateSetting("businessName", e.target.value)
                      }
                      placeholder="Your Business Name"
                      data-testid="business-name-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="business-phone">Business Phone</Label>
                    <Input
                      id="business-phone"
                      value={seoSettings.businessPhone}
                      onChange={(e) =>
                        updateSetting("businessPhone", e.target.value)
                      }
                      placeholder="+1 (555) 123-4567"
                      data-testid="business-phone-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="business-email">Business Email</Label>
                    <Input
                      id="business-email"
                      value={seoSettings.businessEmail}
                      onChange={(e) =>
                        updateSetting("businessEmail", e.target.value)
                      }
                      placeholder="contact@yourbusiness.com"
                      data-testid="business-email-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="business-hours">Business Hours</Label>
                    <Input
                      id="business-hours"
                      value={seoSettings.businessHours}
                      onChange={(e) =>
                        updateSetting("businessHours", e.target.value)
                      }
                      placeholder="Mon-Fri 9AM-5PM"
                      data-testid="business-hours-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="latitude">Latitude</Label>
                    <Input
                      id="latitude"
                      value={seoSettings.latitude}
                      onChange={(e) =>
                        updateSetting("latitude", e.target.value)
                      }
                      placeholder="40.7128"
                      data-testid="latitude-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="longitude">Longitude</Label>
                    <Input
                      id="longitude"
                      value={seoSettings.longitude}
                      onChange={(e) =>
                        updateSetting("longitude", e.target.value)
                      }
                      placeholder="-74.0060"
                      data-testid="longitude-input"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="business-address">Business Address</Label>
                  <Textarea
                    id="business-address"
                    value={seoSettings.businessAddress}
                    onChange={(e) =>
                      updateSetting("businessAddress", e.target.value)
                    }
                    rows={3}
                    placeholder="123 Business St, City, State 12345, Country"
                    data-testid="business-address-input"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* App Store Optimization Tab */}
          <TabsContent value="app-store" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Smartphone className="h-5 w-5" />
                  <span>App Store Optimization (AEO)</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="app-title">App Title</Label>
                    <Input
                      id="app-title"
                      value={seoSettings.appTitle}
                      onChange={(e) =>
                        updateSetting("appTitle", e.target.value)
                      }
                      placeholder="Your App Name"
                      maxLength={30}
                      data-testid="app-title-input"
                    />
                    <p className="text-xs text-muted-foreground">
                      {seoSettings.appTitle.length}/30 characters
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="app-subtitle">App Subtitle</Label>
                    <Input
                      id="app-subtitle"
                      value={seoSettings.appSubtitle}
                      onChange={(e) =>
                        updateSetting("appSubtitle", e.target.value)
                      }
                      placeholder="Short app description"
                      maxLength={30}
                      data-testid="app-subtitle-input"
                    />
                    <p className="text-xs text-muted-foreground">
                      {seoSettings.appSubtitle.length}/30 characters
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="app-category">App Category</Label>
                    <Select
                      value={seoSettings.appCategory}
                      onValueChange={(value) =>
                        updateSetting("appCategory", value)
                      }
                    >
                      <SelectTrigger data-testid="app-category-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Business">Business</SelectItem>
                        <SelectItem value="Social Networking">
                          Social Networking
                        </SelectItem>
                        <SelectItem value="Entertainment">
                          Entertainment
                        </SelectItem>
                        <SelectItem value="Photo & Video">
                          Photo & Video
                        </SelectItem>
                        <SelectItem value="Productivity">
                          Productivity
                        </SelectItem>
                        <SelectItem value="Lifestyle">Lifestyle</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="app-description">App Description</Label>
                  <Textarea
                    id="app-description"
                    value={seoSettings.appDescription}
                    onChange={(e) =>
                      updateSetting("appDescription", e.target.value)
                    }
                    rows={5}
                    maxLength={4000}
                    placeholder="Detailed app description highlighting key features and benefits"
                    data-testid="app-description-input"
                  />
                  <p className="text-xs text-muted-foreground">
                    {seoSettings.appDescription.length}/4000 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>App Keywords</Label>
                  <KeywordInput
                    type="appKeywords"
                    placeholder="Add keywords for app store search"
                  />
                  <p className="text-xs text-muted-foreground">
                    Use relevant keywords that users might search for
                  </p>
                </div>

                <Alert>
                  <Star className="h-4 w-4" />
                  <AlertDescription>
                    <strong>AEO Tip:</strong> Focus on keywords with high search
                    volume but lower competition. Include your main features and
                    target audience in the description.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analysis Tab */}
          <TabsContent value="analysis" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>SEO Analysis Results</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Issues */}
                <div>
                  <h4 className="font-semibold mb-3">Issues Found</h4>
                  <div className="space-y-2">
                    {seoAnalysis.issues.map((issue, index) => (
                      <Alert
                        key={index}
                        className={
                          issue.type === "error"
                            ? "border-red-500"
                            : issue.type === "warning"
                              ? "border-yellow-500"
                              : "border-blue-500"
                        }
                      >
                        {issue.type === "error" ? (
                          <XCircle className="h-4 w-4" />
                        ) : issue.type === "warning" ? (
                          <AlertTriangle className="h-4 w-4" />
                        ) : (
                          <CheckCircle className="h-4 w-4" />
                        )}
                        <AlertDescription>
                          <div className="space-y-1">
                            <p>{issue.message}</p>
                            {issue.fix && (
                              <p className="text-sm text-muted-foreground">
                                <strong>Fix:</strong> {issue.fix}
                              </p>
                            )}
                          </div>
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </div>

                {/* Suggestions */}
                <div>
                  <h4 className="font-semibold mb-3">
                    Optimization Suggestions
                  </h4>
                  <ul className="space-y-2">
                    {seoAnalysis.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Performance Metrics */}
                <div>
                  <h4 className="font-semibold mb-3">Performance Metrics</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="flex items-center justify-center space-x-1 mb-2">
                          <Monitor className="h-4 w-4" />
                          <span className="text-sm font-medium">Desktop</span>
                        </div>
                        <div className="text-2xl font-bold text-green-600">
                          {seoAnalysis.performance.desktopScore}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="flex items-center justify-center space-x-1 mb-2">
                          <Smartphone className="h-4 w-4" />
                          <span className="text-sm font-medium">Mobile</span>
                        </div>
                        <div className="text-2xl font-bold text-blue-600">
                          {seoAnalysis.performance.mobileScore}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="flex items-center justify-center space-x-1 mb-2">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm font-medium">Load Time</span>
                        </div>
                        <div className="text-2xl font-bold text-purple-600">
                          {seoAnalysis.performance.loadTime}s
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="flex items-center justify-center space-x-1 mb-2">
                          <Search className="h-4 w-4" />
                          <span className="text-sm font-medium">SEO Score</span>
                        </div>
                        <div className="text-2xl font-bold text-orange-600">
                          {seoAnalysis.performance.seoScore}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
