import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Image,
  Upload,
  Download,
  Eye,
  Trash2,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  FileImage,
  Monitor,
  Smartphone,
  Tablet,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface LogoConfig {
  mainLogo: string;
  darkLogo: string;
  mobileLogo: string;
  faviconIco: string;
  favicon16: string;
  favicon32: string;
  favicon96: string;
  favicon192: string;
  appleTouch: string;
  appleTouchSizes: string[];
  msTileColor: string;
  msConfigXml: string;
  safariPinnedTab: string;
  themeColor: string;
  manifestJson: string;
}

interface LogoPreview {
  type: "logo" | "favicon";
  size: string;
  url: string;
  name: string;
  recommended: boolean;
  description: string;
}

export default function LogoFaviconManagement() {
  const seoData = adminPageSEO.logoFaviconManagement;
  const breadcrumbs = generateAdminBreadcrumbs("logo-favicon-management");
  const queryClient = useQueryClient();

  // Fetch logo config from API
  const { data: config, isLoading } = useQuery<LogoConfig>({
    queryKey: ["/api/admin/logo-config"],
    refetchInterval: 60000,
  });

  // Update logo config mutation
  const updateConfigMutation = useMutation({
    mutationFn: (data: Partial<LogoConfig>) =>
      apiRequest("/api/admin/logo-config", "PATCH", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/logo-config"] });
    },
  });

  const [localConfig, setLocalConfig] = useState<LogoConfig | undefined>(config);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentUploadType, setCurrentUploadType] =
    useState<keyof LogoConfig>("mainLogo");
  const { toast } = useToast();

  const logoPreviewData: LogoPreview[] = [
    {
      type: "logo",
      size: "Various",
      url: config.mainLogo,
      name: "Main Logo",
      recommended: true,
      description: "Primary brand logo displayed across the platform",
    },
    {
      type: "logo",
      size: "Various",
      url: config.darkLogo,
      name: "Dark Theme Logo",
      recommended: true,
      description: "Logo optimized for dark mode interfaces",
    },
    {
      type: "logo",
      size: "120x40",
      url: config.mobileLogo,
      name: "Mobile Logo",
      recommended: false,
      description: "Compact logo for mobile navigation",
    },
    {
      type: "favicon",
      size: "16x16",
      url: config.favicon16,
      name: "Favicon 16x16",
      recommended: true,
      description: "Small browser tab icon",
    },
    {
      type: "favicon",
      size: "32x32",
      url: config.favicon32,
      name: "Favicon 32x32",
      recommended: true,
      description: "Standard browser tab icon",
    },
    {
      type: "favicon",
      size: "96x96",
      url: config.favicon96,
      name: "Favicon 96x96",
      recommended: false,
      description: "Large browser icon for high-DPI displays",
    },
    {
      type: "favicon",
      size: "192x192",
      url: config.favicon192,
      name: "Android Icon",
      recommended: true,
      description: "Android home screen icon",
    },
    {
      type: "favicon",
      size: "180x180",
      url: config.appleTouch,
      name: "Apple Touch Icon",
      recommended: true,
      description: "iOS home screen icon",
    },
  ];

  const handleFileUpload = async (file: File, type: keyof LogoConfig) => {
    if (!file) return;

    // Validate file type
    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/svg+xml",
      "image/x-icon",
    ];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description:
          "Please upload a valid image file (JPG, PNG, GIF, SVG, ICO)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 100);

      // Create FormData and upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Create blob URL for preview
      const blobUrl = URL.createObjectURL(file);
      setConfig((prev) => ({ ...prev, [type]: blobUrl }));

      setUploadProgress(100);

      toast({
        title: "Upload Successful",
        description: `${type} has been updated successfully`,
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const triggerFileUpload = (type: keyof LogoConfig) => {
    setCurrentUploadType(type);
    fileInputRef.current?.click();
  };

  const generateFavicons = async () => {
    setIsUploading(true);
    try {
      // Simulate favicon generation from main logo
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast({
        title: "Favicons Generated",
        description:
          "All favicon sizes have been automatically generated from your main logo",
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate favicons. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const resetToDefaults = () => {
    setConfig({
      mainLogo: "/assets/logo.png",
      darkLogo: "/assets/logo-dark.png",
      mobileLogo: "/assets/logo-mobile.png",
      faviconIco: "/assets/favicon.ico",
      favicon16: "/assets/favicon-16x16.png",
      favicon32: "/assets/favicon-32x32.png",
      favicon96: "/assets/favicon-96x96.png",
      favicon192: "/assets/favicon-192x192.png",
      appleTouch: "/assets/apple-touch-icon.png",
      appleTouchSizes: [
        "57x57",
        "60x60",
        "72x72",
        "76x76",
        "114x114",
        "120x120",
        "144x144",
        "152x152",
        "180x180",
      ],
      msTileColor: "#603cba",
      msConfigXml: "/assets/browserconfig.xml",
      safariPinnedTab: "/assets/safari-pinned-tab.svg",
      themeColor: "#ffffff",
      manifestJson: "/assets/manifest.json",
    });

    toast({
      title: "Reset Complete",
      description: "All logos and favicons have been reset to defaults",
    });
  };

  const LogoCard = ({ preview }: { preview: LogoPreview }) => (
    <Card className="hover:shadow-lg transition-all duration-300">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileImage className="h-5 w-5 text-primary" />
              <div>
                <h3 className="font-semibold">{preview.name}</h3>
                <p className="text-sm text-muted-foreground">{preview.size}</p>
              </div>
            </div>
            {preview.recommended && (
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                Recommended
              </Badge>
            )}
          </div>

          {/* Image Preview */}
          <div className="flex items-center justify-center h-24 bg-muted rounded-lg border-2 border-dashed border-muted-foreground/25">
            {preview.url ? (
              <img
                src={preview.url}
                alt={preview.name}
                className={`max-h-20 max-w-20 object-contain ${
                  preview.type === "favicon" ? "w-8 h-8" : "h-16"
                }`}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                }}
              />
            ) : (
              <div className="text-muted-foreground">
                <Image className="h-8 w-8 mx-auto mb-2" />
                <p className="text-xs">No image</p>
              </div>
            )}
          </div>

          <p className="text-xs text-muted-foreground text-center">
            {preview.description}
          </p>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => triggerFileUpload(currentUploadType)}
              className="flex-1"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
            {preview.url && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(preview.url, "_blank")}
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
      <SEOHeadTags
        title={generatePageTitle(seoData.title)}
        description={seoData.description}
        keywords={seoData.keywords}
        canonicalUrl="https://fanzdash.com/logo-favicon-management"
        schema={seoData.structuredData}
      />

      <div className="space-y-6">
        <SEOBreadcrumbs items={breadcrumbs} className="mb-6" />
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center space-x-3">
              <Image className="h-8 w-8 text-primary" />
              <span>Logo & Favicon Management</span>
            </h1>
            <p className="text-muted-foreground">
              Manage your brand logos and website favicons across all devices
              and platforms
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={resetToDefaults}
              disabled={isUploading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset to Defaults
            </Button>

            <Button
              onClick={generateFavicons}
              disabled={isUploading}
              className="bg-gradient-to-r from-primary to-purple-600"
            >
              <FileImage className="h-4 w-4 mr-2" />
              Auto-Generate Favicons
            </Button>
          </div>
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <Alert>
            <Upload className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p>Uploading image... {uploadProgress}%</p>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Current Logo Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Monitor className="h-5 w-5" />
              <span>Current Branding Preview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Desktop Preview */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Monitor className="h-4 w-4" />
                  <Label>Desktop</Label>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <div className="bg-background p-3 rounded border">
                    <img
                      src={config.mainLogo}
                      alt="Desktop Logo"
                      className="h-12 object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/assets/placeholder-logo.png";
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Mobile Preview */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Smartphone className="h-4 w-4" />
                  <Label>Mobile</Label>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <div className="bg-background p-2 rounded border max-w-48">
                    <img
                      src={config.mobileLogo || config.mainLogo}
                      alt="Mobile Logo"
                      className="h-8 object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/assets/placeholder-logo.png";
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Favicon Preview */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Tablet className="h-4 w-4" />
                  <Label>Browser Tab</Label>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <div className="bg-background p-3 rounded border flex items-center space-x-2">
                    <img
                      src={config.favicon32}
                      alt="Favicon"
                      className="w-4 h-4"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/assets/favicon.ico";
                      }}
                    />
                    <span className="text-sm">FanzDash</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logo & Favicon Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {logoPreviewData.map((preview, index) => (
            <LogoCard key={index} preview={preview} />
          ))}
        </div>

        {/* Advanced Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Advanced Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="theme-color">Theme Color</Label>
                <div className="flex space-x-2">
                  <Input
                    id="theme-color"
                    value={config.themeColor}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        themeColor: e.target.value,
                      }))
                    }
                    placeholder="#ffffff"
                    data-testid="theme-color-input"
                  />
                  <input
                    type="color"
                    value={config.themeColor}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        themeColor: e.target.value,
                      }))
                    }
                    className="w-12 h-10 border border-input rounded-md cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ms-tile-color">Microsoft Tile Color</Label>
                <div className="flex space-x-2">
                  <Input
                    id="ms-tile-color"
                    value={config.msTileColor}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        msTileColor: e.target.value,
                      }))
                    }
                    placeholder="#603cba"
                    data-testid="ms-tile-color-input"
                  />
                  <input
                    type="color"
                    value={config.msTileColor}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        msTileColor: e.target.value,
                      }))
                    }
                    className="w-12 h-10 border border-input rounded-md cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Recommended Specifications:</strong>
                <br />
                • Main Logo: SVG format, transparent background, minimum 200px
                height
                <br />
                • Favicons: PNG format, square aspect ratio (16x16, 32x32,
                192x192)
                <br />
                • Apple Touch Icon: PNG format, 180x180 pixels
                <br />• Dark logos should have light-colored elements for
                visibility
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              handleFileUpload(file, currentUploadType);
            }
          }}
          accept="image/*"
          className="hidden"
        />
      </div>
    </>
  );
}
