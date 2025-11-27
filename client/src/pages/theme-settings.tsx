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
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Palette,
  Image as ImageIcon,
  Monitor,
  Code,
  Upload,
  Eye,
  Undo2,
  Save,
  Download,
  Settings,
  Brush,
  FileImage,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface ThemeSettings {
  id: string;
  homeStyle: number;
  logoUrl?: string;
  logoBlueUrl?: string;
  faviconUrl?: string;
  watermarkVideoUrl?: string;
  indexImageTopUrl?: string;
  backgroundUrl?: string;
  avatarDefaultUrl?: string;
  coverDefaultUrl?: string;
  primaryColor: string;
  themePwaColor: string;
  navbarBackgroundColor: string;
  navbarTextColor: string;
  footerBackgroundColor: string;
  footerTextColor: string;
  buttonStyle: string;
  customCss?: string;
  customJs?: string;
}

export default function ThemeSettings() {
  const [activeTab, setActiveTab] = useState("branding");
  const [previewMode, setPreviewMode] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch theme settings from API
  const { data: themeSettings, isLoading } = useQuery<ThemeSettings>({
    queryKey: ["/api/admin/theme"],
    refetchInterval: 60000,
  });

  const updateThemeMutation = useMutation({
    mutationFn: (data: Partial<ThemeSettings>) =>
      apiRequest("/api/admin/theme", "PATCH", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/theme"] });
      toast({ title: "Theme settings updated successfully" });
    },
  });

  const uploadImageMutation = useMutation({
    mutationFn: (data: { file: File; type: string }) => {
      const formData = new FormData();
      formData.append("file", data.file);
      formData.append("type", data.type);
      return apiRequest("/api/admin/theme/upload", "POST", formData);
    },
    onSuccess: (data, variables) => {
      const { type } = variables;
      updateThemeMutation.mutate({ [`${type}Url`]: data.url });
      toast({ title: `${type} uploaded successfully` });
    },
  });

  const resetThemeMutation = useMutation({
    mutationFn: () => apiRequest("/api/admin/theme/reset", "POST"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/theme"] });
      toast({ title: "Theme reset to defaults" });
    },
  });

  const handleThemeChange = (field: keyof ThemeSettings, value: any) => {
    if (themeSettings) {
      updateThemeMutation.mutate({ [field]: value });
    }
  };

  const handleImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: string,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive",
        });
        return;
      }
      uploadImageMutation.mutate({ file, type });
    }
  };

  const exportTheme = () => {
    if (!themeSettings) return;

    const themeExport = {
      colors: {
        primaryColor: themeSettings.primaryColor,
        navbarBackgroundColor: themeSettings.navbarBackgroundColor,
        navbarTextColor: themeSettings.navbarTextColor,
        footerBackgroundColor: themeSettings.footerBackgroundColor,
        footerTextColor: themeSettings.footerTextColor,
      },
      styles: {
        homeStyle: themeSettings.homeStyle,
        buttonStyle: themeSettings.buttonStyle,
      },
      customCss: themeSettings.customCss,
      customJs: themeSettings.customJs,
    };

    const blob = new Blob([JSON.stringify(themeExport, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "fanzdash-theme.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({ title: "Theme exported successfully" });
  };

  const getHomeStyleName = (style: number) => {
    const styles = {
      0: "Classic",
      1: "Modern",
      2: "Cyberpunk",
    };
    return styles[style as keyof typeof styles] || "Classic";
  };

  const colorPresets = [
    {
      name: "Cyberpunk Purple",
      primary: "#8B5CF6",
      navbar: "#1F2937",
      footer: "#111827",
    },
    {
      name: "Electric Blue",
      primary: "#3B82F6",
      navbar: "#1E40AF",
      footer: "#1E3A8A",
    },
    {
      name: "Neon Green",
      primary: "#10B981",
      navbar: "#065F46",
      footer: "#064E3B",
    },
    {
      name: "Hot Pink",
      primary: "#EC4899",
      navbar: "#9D174D",
      footer: "#831843",
    },
    {
      name: "Sunset Orange",
      primary: "#F59E0B",
      navbar: "#92400E",
      footer: "#78350F",
    },
    {
      name: "Blood Red",
      primary: "#EF4444",
      navbar: "#991B1B",
      footer: "#7F1D1D",
    },
  ];

  const applyColorPreset = (preset: (typeof colorPresets)[0]) => {
    updateThemeMutation.mutate({
      primaryColor: preset.primary,
      themePwaColor: preset.primary,
      navbarBackgroundColor: preset.navbar,
      footerBackgroundColor: preset.footer,
    });
    toast({ title: `Applied ${preset.name} color scheme` });
  };

  return (
    <div
      className="container mx-auto p-6 space-y-6"
      data-testid="theme-settings"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold cyber-text-glow">
            Theme Customization
          </h1>
          <p className="text-muted-foreground">
            Customize platform branding, colors, layouts, and styling
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={exportTheme}
            data-testid="button-export-theme"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Theme
          </Button>
          <Button
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
            data-testid="button-preview-theme"
          >
            <Eye className="h-4 w-4 mr-2" />
            {previewMode ? "Exit Preview" : "Preview"}
          </Button>
        </div>
      </div>

      {/* Theme Preview Banner */}
      {previewMode && (
        <Card className="cyber-border border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Eye className="h-5 w-5 text-blue-600" />
              <div>
                <h3 className="font-medium text-blue-800">
                  Preview Mode Active
                </h3>
                <p className="text-sm text-blue-700">
                  You're viewing how the theme changes will appear on the
                  platform
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="colors">Colors</TabsTrigger>
          <TabsTrigger value="layout">Layout</TabsTrigger>
          <TabsTrigger value="custom">Custom Code</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="branding" className="space-y-6">
          <Card className="cyber-border">
            <CardHeader>
              <CardTitle className="flex items-center">
                <ImageIcon className="h-5 w-5 mr-2" />
                Logo & Branding Assets
              </CardTitle>
              <CardDescription>
                Upload and manage your platform's visual identity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Main Logo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="main-logo">Main Logo</Label>
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                      {themeSettings?.logoUrl ? (
                        <div className="space-y-2">
                          <img
                            src={themeSettings.logoUrl}
                            alt="Main Logo"
                            className="max-h-16 mx-auto"
                          />
                          <p className="text-sm text-muted-foreground">
                            Current main logo
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            No logo uploaded
                          </p>
                        </div>
                      )}
                      <input
                        type="file"
                        id="main-logo"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, "logo")}
                        className="hidden"
                        data-testid="input-main-logo"
                      />
                      <Label htmlFor="main-logo" className="cursor-pointer">
                        <Button
                          variant="outline"
                          className="mt-2"
                          data-testid="button-upload-main-logo"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Logo
                        </Button>
                      </Label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Recommended: 200x60px, PNG with transparent background
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="blue-logo">Blue/Alt Logo</Label>
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                      {themeSettings.logoBlueUrl ? (
                        <div className="space-y-2">
                          <img
                            src={themeSettings.logoBlueUrl}
                            alt="Blue Logo"
                            className="max-h-16 mx-auto"
                          />
                          <p className="text-sm text-muted-foreground">
                            Alternative logo variant
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            No alt logo uploaded
                          </p>
                        </div>
                      )}
                      <input
                        type="file"
                        id="blue-logo"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, "logoBlue")}
                        className="hidden"
                        data-testid="input-blue-logo"
                      />
                      <Label htmlFor="blue-logo" className="cursor-pointer">
                        <Button
                          variant="outline"
                          className="mt-2"
                          data-testid="button-upload-blue-logo"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Alt Logo
                        </Button>
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="favicon">Favicon</Label>
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                      {themeSettings.faviconUrl ? (
                        <div className="space-y-2">
                          <img
                            src={themeSettings.faviconUrl}
                            alt="Favicon"
                            className="w-8 h-8 mx-auto"
                          />
                          <p className="text-sm text-muted-foreground">
                            Current favicon
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <FileImage className="h-12 w-12 mx-auto text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            No favicon uploaded
                          </p>
                        </div>
                      )}
                      <input
                        type="file"
                        id="favicon"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, "favicon")}
                        className="hidden"
                        data-testid="input-favicon"
                      />
                      <Label htmlFor="favicon" className="cursor-pointer">
                        <Button
                          variant="outline"
                          className="mt-2"
                          data-testid="button-upload-favicon"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Favicon
                        </Button>
                      </Label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Required: 32x32px ICO or PNG format
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="watermark">Video Watermark</Label>
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                      {themeSettings.watermarkVideoUrl ? (
                        <div className="space-y-2">
                          <img
                            src={themeSettings.watermarkVideoUrl}
                            alt="Watermark"
                            className="max-h-16 mx-auto"
                          />
                          <p className="text-sm text-muted-foreground">
                            Video watermark
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            No watermark uploaded
                          </p>
                        </div>
                      )}
                      <input
                        type="file"
                        id="watermark"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, "watermarkVideo")}
                        className="hidden"
                        data-testid="input-watermark"
                      />
                      <Label htmlFor="watermark" className="cursor-pointer">
                        <Button
                          variant="outline"
                          className="mt-2"
                          data-testid="button-upload-watermark"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Watermark
                        </Button>
                      </Label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Semi-transparent PNG for video overlays
                    </p>
                  </div>
                </div>
              </div>

              {/* Background Images */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Background Images</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    {
                      key: "indexImageTop",
                      label: "Hero Background",
                      testId: "hero-bg",
                    },
                    {
                      key: "background",
                      label: "Page Background",
                      testId: "page-bg",
                    },
                    {
                      key: "avatarDefault",
                      label: "Default Avatar",
                      testId: "default-avatar",
                    },
                  ].map(({ key, label, testId }) => (
                    <div key={key} className="space-y-2">
                      <Label>{label}</Label>
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                        {themeSettings[`${key}Url` as keyof ThemeSettings] ? (
                          <img
                            src={
                              themeSettings[
                                `${key}Url` as keyof ThemeSettings
                              ] as string
                            }
                            alt={label}
                            className="w-full h-24 object-cover rounded"
                          />
                        ) : (
                          <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground" />
                        )}
                        <input
                          type="file"
                          id={key}
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, key)}
                          className="hidden"
                          data-testid={`input-${testId}`}
                        />
                        <Label htmlFor={key} className="cursor-pointer">
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            data-testid={`button-upload-${testId}`}
                          >
                            <Upload className="h-3 w-3 mr-1" />
                            Upload
                          </Button>
                        </Label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="colors" className="space-y-6">
          <Card className="cyber-border">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="h-5 w-5 mr-2" />
                Color Scheme
              </CardTitle>
              <CardDescription>
                Customize your platform's color palette and branding
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Color Presets */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Quick Color Presets</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {colorPresets.map((preset) => (
                    <Button
                      key={preset.name}
                      variant="outline"
                      className="h-auto p-3 flex flex-col items-start space-y-2"
                      onClick={() => applyColorPreset(preset)}
                      data-testid={`preset-${preset.name.toLowerCase().replace(" ", "-")}`}
                    >
                      <div className="flex items-center space-x-2 w-full">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: preset.primary }}
                        />
                        <span className="text-sm font-medium">
                          {preset.name}
                        </span>
                      </div>
                      <div className="flex space-x-1">
                        <div
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: preset.primary }}
                        />
                        <div
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: preset.navbar }}
                        />
                        <div
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: preset.footer }}
                        />
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Individual Color Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Primary Colors</h3>

                  <div className="space-y-2">
                    <Label htmlFor="primary-color">Primary Color</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="primary-color"
                        type="color"
                        value={themeSettings.primaryColor}
                        onChange={(e) =>
                          handleThemeChange("primaryColor", e.target.value)
                        }
                        className="w-16 h-10 p-1 border rounded"
                        data-testid="input-primary-color"
                      />
                      <Input
                        type="text"
                        value={themeSettings.primaryColor}
                        onChange={(e) =>
                          handleThemeChange("primaryColor", e.target.value)
                        }
                        className="font-mono"
                        data-testid="input-primary-color-text"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pwa-color">PWA Theme Color</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="pwa-color"
                        type="color"
                        value={themeSettings.themePwaColor}
                        onChange={(e) =>
                          handleThemeChange("themePwaColor", e.target.value)
                        }
                        className="w-16 h-10 p-1 border rounded"
                        data-testid="input-pwa-color"
                      />
                      <Input
                        type="text"
                        value={themeSettings.themePwaColor}
                        onChange={(e) =>
                          handleThemeChange("themePwaColor", e.target.value)
                        }
                        className="font-mono"
                        data-testid="input-pwa-color-text"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Navigation Colors</h3>

                  <div className="space-y-2">
                    <Label htmlFor="navbar-bg">Navbar Background</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="navbar-bg"
                        type="color"
                        value={themeSettings.navbarBackgroundColor}
                        onChange={(e) =>
                          handleThemeChange(
                            "navbarBackgroundColor",
                            e.target.value,
                          )
                        }
                        className="w-16 h-10 p-1 border rounded"
                        data-testid="input-navbar-bg"
                      />
                      <Input
                        type="text"
                        value={themeSettings.navbarBackgroundColor}
                        onChange={(e) =>
                          handleThemeChange(
                            "navbarBackgroundColor",
                            e.target.value,
                          )
                        }
                        className="font-mono"
                        data-testid="input-navbar-bg-text"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="navbar-text">Navbar Text</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="navbar-text"
                        type="color"
                        value={themeSettings.navbarTextColor}
                        onChange={(e) =>
                          handleThemeChange("navbarTextColor", e.target.value)
                        }
                        className="w-16 h-10 p-1 border rounded"
                        data-testid="input-navbar-text"
                      />
                      <Input
                        type="text"
                        value={themeSettings.navbarTextColor}
                        onChange={(e) =>
                          handleThemeChange("navbarTextColor", e.target.value)
                        }
                        className="font-mono"
                        data-testid="input-navbar-text-text"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Colors */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="footer-bg">Footer Background</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="footer-bg"
                      type="color"
                      value={themeSettings.footerBackgroundColor}
                      onChange={(e) =>
                        handleThemeChange(
                          "footerBackgroundColor",
                          e.target.value,
                        )
                      }
                      className="w-16 h-10 p-1 border rounded"
                      data-testid="input-footer-bg"
                    />
                    <Input
                      type="text"
                      value={themeSettings.footerBackgroundColor}
                      onChange={(e) =>
                        handleThemeChange(
                          "footerBackgroundColor",
                          e.target.value,
                        )
                      }
                      className="font-mono"
                      data-testid="input-footer-bg-text"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="footer-text">Footer Text</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="footer-text"
                      type="color"
                      value={themeSettings.footerTextColor}
                      onChange={(e) =>
                        handleThemeChange("footerTextColor", e.target.value)
                      }
                      className="w-16 h-10 p-1 border rounded"
                      data-testid="input-footer-text"
                    />
                    <Input
                      type="text"
                      value={themeSettings.footerTextColor}
                      onChange={(e) =>
                        handleThemeChange("footerTextColor", e.target.value)
                      }
                      className="font-mono"
                      data-testid="input-footer-text-text"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="layout" className="space-y-6">
          <Card className="cyber-border">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Monitor className="h-5 w-5 mr-2" />
                Layout Options
              </CardTitle>
              <CardDescription>
                Configure page layouts and interface styles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="home-style">Home Page Style</Label>
                  <Select
                    value={themeSettings.homeStyle.toString()}
                    onValueChange={(value) =>
                      handleThemeChange("homeStyle", parseInt(value))
                    }
                  >
                    <SelectTrigger data-testid="select-home-style">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Classic Layout</SelectItem>
                      <SelectItem value="1">Modern Grid</SelectItem>
                      <SelectItem value="2">Cyberpunk Theme</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Current: {getHomeStyleName(themeSettings.homeStyle)}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="button-style">Button Style</Label>
                  <Select
                    value={themeSettings.buttonStyle}
                    onValueChange={(value) =>
                      handleThemeChange("buttonStyle", value)
                    }
                  >
                    <SelectTrigger data-testid="select-button-style">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rounded">Rounded Corners</SelectItem>
                      <SelectItem value="square">Square Edges</SelectItem>
                      <SelectItem value="pill">Pill Shape</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Layout Preview */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Layout Preview</h3>
                <div className="border rounded-lg p-4 bg-muted/30">
                  <div className="space-y-4">
                    {/* Simulated navbar */}
                    <div
                      className="h-12 rounded flex items-center px-4"
                      style={{
                        backgroundColor: themeSettings.navbarBackgroundColor,
                        color: themeSettings.navbarTextColor,
                      }}
                    >
                      <div className="w-20 h-6 bg-current opacity-20 rounded mr-4"></div>
                      <div className="flex space-x-4">
                        <div className="w-16 h-4 bg-current opacity-60 rounded"></div>
                        <div className="w-16 h-4 bg-current opacity-60 rounded"></div>
                        <div className="w-16 h-4 bg-current opacity-60 rounded"></div>
                      </div>
                    </div>

                    {/* Simulated content */}
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-1/3"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                      <Button
                        size="sm"
                        className={`${
                          themeSettings.buttonStyle === "square"
                            ? "rounded-none"
                            : themeSettings.buttonStyle === "pill"
                              ? "rounded-full"
                              : "rounded"
                        }`}
                        style={{ backgroundColor: themeSettings.primaryColor }}
                      >
                        Sample Button
                      </Button>
                    </div>

                    {/* Simulated footer */}
                    <div
                      className="h-16 rounded flex items-center px-4"
                      style={{
                        backgroundColor: themeSettings.footerBackgroundColor,
                        color: themeSettings.footerTextColor,
                      }}
                    >
                      <div className="w-32 h-3 bg-current opacity-60 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="space-y-6">
          <Card className="cyber-border">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Code className="h-5 w-5 mr-2" />
                Custom CSS & JavaScript
              </CardTitle>
              <CardDescription>
                Add custom styling and functionality to your platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="custom-css">Custom CSS</Label>
                  <Textarea
                    id="custom-css"
                    value={themeSettings.customCss || ""}
                    onChange={(e) =>
                      handleThemeChange("customCss", e.target.value)
                    }
                    className="font-mono text-sm min-h-[300px]"
                    placeholder="/* Enter your custom CSS here */
.custom-style {
  color: #8B5CF6;
  border: 1px solid rgba(139, 92, 246, 0.3);
}"
                    data-testid="textarea-custom-css"
                  />
                  <p className="text-sm text-muted-foreground">
                    Custom CSS will be injected into the page head
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="custom-js">Custom JavaScript</Label>
                  <Textarea
                    id="custom-js"
                    value={themeSettings.customJs || ""}
                    onChange={(e) =>
                      handleThemeChange("customJs", e.target.value)
                    }
                    className="font-mono text-sm min-h-[300px]"
                    placeholder="// Enter your custom JavaScript here
document.addEventListener('DOMContentLoaded', function() {
  console.log('Custom JS loaded');
});"
                    data-testid="textarea-custom-js"
                  />
                  <p className="text-sm text-muted-foreground">
                    Custom JavaScript will be loaded at the bottom of the page
                  </p>
                </div>
              </div>

              {/* Code Safety Warning */}
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Settings className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-yellow-800">
                        Custom Code Safety
                      </h3>
                      <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                        <li>
                          • Test custom code thoroughly before applying to
                          production
                        </li>
                        <li>
                          • Avoid inline styles that might conflict with
                          existing CSS
                        </li>
                        <li>
                          • Use proper CSS selectors to avoid affecting
                          unintended elements
                        </li>
                        <li>• Backup your theme before making major changes</li>
                        <li>
                          • Custom JavaScript can affect site performance and
                          security
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <Card className="cyber-border">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Advanced Settings
              </CardTitle>
              <CardDescription>
                Theme management and advanced configuration options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <h3 className="font-medium">Reset Theme</h3>
                    <p className="text-sm text-muted-foreground">
                      Reset all theme settings to default values
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={() => resetThemeMutation.mutate()}
                    disabled={resetThemeMutation.isPending}
                    data-testid="button-reset-theme"
                  >
                    <Undo2 className="h-4 w-4 mr-2" />
                    Reset Theme
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <h3 className="font-medium">Export Theme</h3>
                    <p className="text-sm text-muted-foreground">
                      Download current theme configuration as JSON
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={exportTheme}
                    data-testid="button-export-theme-advanced"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <h3 className="font-medium">Save Changes</h3>
                    <p className="text-sm text-muted-foreground">
                      Apply all pending theme changes
                    </p>
                  </div>
                  <Button
                    onClick={() => updateThemeMutation.mutate({})}
                    disabled={updateThemeMutation.isPending}
                    data-testid="button-save-changes"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save All Changes
                  </Button>
                </div>
              </div>

              {/* Theme Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Theme Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Home Style:</span>
                      <Badge variant="outline">
                        {getHomeStyleName(themeSettings.homeStyle)}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Button Style:
                      </span>
                      <Badge variant="outline">
                        {themeSettings.buttonStyle}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Primary Color:
                      </span>
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-4 h-4 rounded border"
                          style={{
                            backgroundColor: themeSettings.primaryColor,
                          }}
                        />
                        <span className="font-mono">
                          {themeSettings.primaryColor}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Custom CSS:</span>
                      <Badge
                        variant={
                          themeSettings.customCss ? "default" : "secondary"
                        }
                      >
                        {themeSettings.customCss ? "Active" : "None"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Custom JS:</span>
                      <Badge
                        variant={
                          themeSettings.customJs ? "default" : "secondary"
                        }
                      >
                        {themeSettings.customJs ? "Active" : "None"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Logo:</span>
                      <Badge
                        variant={
                          themeSettings.logoUrl ? "default" : "secondary"
                        }
                      >
                        {themeSettings.logoUrl ? "Uploaded" : "Default"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
