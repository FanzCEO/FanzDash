import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Palette,
  Download,
  Upload,
  Save,
  RotateCcw,
  Eye,
  Settings,
  Shuffle,
  Copy,
  Check,
  AlertTriangle,
  Zap,
  Sparkles,
  Target,
  Contrast,
} from "lucide-react";
import { SEOHeadTags } from "@/components/SEOHeadTags";
import { useToast } from "@/hooks/use-toast";

interface ColorHSL {
  h: number;
  s: number;
  l: number;
}

interface ThemePalette {
  name: string;
  primary: ColorHSL;
  secondary: ColorHSL;
  accent: ColorHSL;
  destructive: ColorHSL;
  background: ColorHSL;
  foreground: ColorHSL;
  card: ColorHSL;
  border: ColorHSL;
  muted: ColorHSL;
}

interface SavedTheme {
  id: string;
  name: string;
  palette: ThemePalette;
  createdAt: string;
  tags: string[];
}

export default function ThemeGeneratorPage() {
  const { toast } = useToast();
  const [currentPalette, setCurrentPalette] = useState<ThemePalette>({
    name: "Custom Theme",
    primary: { h: 310, s: 100, l: 69 },
    secondary: { h: 193, s: 100, l: 50 },
    accent: { h: 60, s: 100, l: 50 },
    destructive: { h: 340, s: 82, l: 52 },
    background: { h: 0, s: 0, l: 0 },
    foreground: { h: 180, s: 100, l: 90 },
    card: { h: 0, s: 0, l: 5 },
    border: { h: 217, s: 32, l: 20 },
    muted: { h: 217, s: 32, l: 17 },
  });

  const [selectedColorType, setSelectedColorType] =
    useState<keyof Omit<ThemePalette, "name">>("primary");
  const [generationMode, setGenerationMode] = useState<
    | "complementary"
    | "triadic"
    | "analogous"
    | "monochromatic"
    | "split-complementary"
  >("complementary");
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [savedThemes, setSavedThemes] = useState<SavedTheme[]>([]);
  const [contrastResults, setContrastResults] = useState<{
    [key: string]: number;
  }>({});
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  // Color theory algorithms
  const generatePaletteFromBase = useCallback(
    (
      baseColor: ColorHSL,
      mode: typeof generationMode,
    ): Partial<ThemePalette> => {
      const { h, s, l } = baseColor;

      switch (mode) {
        case "complementary":
          return {
            primary: baseColor,
            secondary: {
              h: (h + 180) % 360,
              s: Math.max(s - 20, 30),
              l: Math.min(l + 10, 80),
            },
            accent: { h: (h + 60) % 360, s: s, l: Math.max(l - 20, 30) },
            destructive: { h: 340, s: 82, l: 52 },
          };

        case "triadic":
          return {
            primary: baseColor,
            secondary: { h: (h + 120) % 360, s: s, l: l },
            accent: { h: (h + 240) % 360, s: s, l: l },
            destructive: {
              h: (h + 60) % 360,
              s: Math.min(s + 20, 100),
              l: Math.max(l - 10, 40),
            },
          };

        case "analogous":
          return {
            primary: baseColor,
            secondary: {
              h: (h + 30) % 360,
              s: Math.max(s - 10, 20),
              l: Math.min(l + 15, 85),
            },
            accent: {
              h: (h - 30 + 360) % 360,
              s: Math.min(s + 10, 100),
              l: Math.max(l - 15, 25),
            },
            destructive: { h: (h + 150) % 360, s: 82, l: 52 },
          };

        case "monochromatic":
          return {
            primary: baseColor,
            secondary: {
              h: h,
              s: Math.max(s - 30, 20),
              l: Math.min(l + 20, 90),
            },
            accent: { h: h, s: Math.min(s + 20, 100), l: Math.max(l - 30, 20) },
            destructive: { h: h, s: s, l: Math.max(l - 40, 30) },
          };

        case "split-complementary":
          return {
            primary: baseColor,
            secondary: { h: (h + 150) % 360, s: Math.max(s - 10, 30), l: l },
            accent: { h: (h + 210) % 360, s: Math.max(s - 10, 30), l: l },
            destructive: { h: (h + 180) % 360, s: 82, l: 52 },
          };
      }
    },
    [],
  );

  // Convert HSL to HSL string
  const hslToString = (color: ColorHSL): string => {
    return `hsl(${Math.round(color.h)} ${Math.round(color.s)}% ${Math.round(color.l)}%)`;
  };

  // Convert HSL to hex
  const hslToHex = (color: ColorHSL): string => {
    const h = color.h / 360;
    const s = color.s / 100;
    const l = color.l / 100;

    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return `#${Math.round(r * 255)
      .toString(16)
      .padStart(2, "0")}${Math.round(g * 255)
      .toString(16)
      .padStart(2, "0")}${Math.round(b * 255)
      .toString(16)
      .padStart(2, "0")}`;
  };

  // Calculate contrast ratio
  const calculateContrast = useCallback(
    (color1: ColorHSL, color2: ColorHSL): number => {
      const getLuminance = (color: ColorHSL) => {
        const h = color.h / 360;
        const s = color.s / 100;
        const l = color.l / 100;

        const hue2rgb = (p: number, q: number, t: number) => {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1 / 6) return p + (q - p) * 6 * t;
          if (t < 1 / 2) return q;
          if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
          return p;
        };

        let r, g, b;
        if (s === 0) {
          r = g = b = l;
        } else {
          const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
          const p = 2 * l - q;
          r = hue2rgb(p, q, h + 1 / 3);
          g = hue2rgb(p, q, h);
          b = hue2rgb(p, q, h - 1 / 3);
        }

        const toLinear = (c: number) => {
          return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        };

        return (
          0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
        );
      };

      const lum1 = getLuminance(color1);
      const lum2 = getLuminance(color2);
      const brightest = Math.max(lum1, lum2);
      const darkest = Math.min(lum1, lum2);

      return (brightest + 0.05) / (darkest + 0.05);
    },
    [],
  );

  // Generate new palette
  const generatePalette = () => {
    const newColors = generatePaletteFromBase(
      currentPalette[selectedColorType],
      generationMode,
    );
    setCurrentPalette((prev) => ({ ...prev, ...newColors }));
    toast({
      title: "Palette Generated",
      description: `New ${generationMode} color scheme applied`,
    });
  };

  // Apply theme in real-time
  const applyThemePreview = useCallback(() => {
    if (!isPreviewMode) return;

    const root = document.documentElement;
    root.style.setProperty(
      "--primary",
      `${currentPalette.primary.h} ${currentPalette.primary.s}% ${currentPalette.primary.l}%`,
    );
    root.style.setProperty(
      "--secondary",
      `${currentPalette.secondary.h} ${currentPalette.secondary.s}% ${currentPalette.secondary.l}%`,
    );
    root.style.setProperty(
      "--accent",
      `${currentPalette.accent.h} ${currentPalette.accent.s}% ${currentPalette.accent.l}%`,
    );
    root.style.setProperty(
      "--destructive",
      `${currentPalette.destructive.h} ${currentPalette.destructive.s}% ${currentPalette.destructive.l}%`,
    );
    root.style.setProperty(
      "--background",
      `${currentPalette.background.h} ${currentPalette.background.s}% ${currentPalette.background.l}%`,
    );
    root.style.setProperty(
      "--foreground",
      `${currentPalette.foreground.h} ${currentPalette.foreground.s}% ${currentPalette.foreground.l}%`,
    );
    root.style.setProperty(
      "--card",
      `${currentPalette.card.h} ${currentPalette.card.s}% ${currentPalette.card.l}%`,
    );
    root.style.setProperty(
      "--border",
      `${currentPalette.border.h} ${currentPalette.border.s}% ${currentPalette.border.l}%`,
    );
    root.style.setProperty(
      "--muted",
      `${currentPalette.muted.h} ${currentPalette.muted.s}% ${currentPalette.muted.l}%`,
    );
  }, [currentPalette, isPreviewMode]);

  // Calculate accessibility metrics
  useEffect(() => {
    const results: { [key: string]: number } = {};
    results["primary-bg"] = calculateContrast(
      currentPalette.primary,
      currentPalette.background,
    );
    results["secondary-bg"] = calculateContrast(
      currentPalette.secondary,
      currentPalette.background,
    );
    results["foreground-bg"] = calculateContrast(
      currentPalette.foreground,
      currentPalette.background,
    );
    results["primary-card"] = calculateContrast(
      currentPalette.primary,
      currentPalette.card,
    );
    setContrastResults(results);
  }, [currentPalette, calculateContrast]);

  // Apply preview when enabled
  useEffect(() => {
    applyThemePreview();
  }, [applyThemePreview]);

  // Copy color to clipboard
  const copyColor = async (color: ColorHSL, format: "hsl" | "hex" = "hex") => {
    const colorString = format === "hex" ? hslToHex(color) : hslToString(color);
    await navigator.clipboard.writeText(colorString);
    setCopiedColor(colorString);
    setTimeout(() => setCopiedColor(null), 2000);
    toast({
      title: "Color Copied",
      description: `${colorString} copied to clipboard`,
    });
  };

  // Save theme
  const saveTheme = () => {
    const newTheme: SavedTheme = {
      id: Date.now().toString(),
      name: currentPalette.name,
      palette: currentPalette,
      createdAt: new Date().toISOString(),
      tags: [generationMode, "custom"],
    };
    setSavedThemes((prev) => [...prev, newTheme]);
    toast({
      title: "Theme Saved",
      description: `"${currentPalette.name}" has been saved to your collection`,
    });
  };

  // Export theme
  const exportTheme = () => {
    const exportData = {
      theme: currentPalette,
      metadata: {
        version: "1.0",
        exportedAt: new Date().toISOString(),
        generator: "Fanz™ Theme Generator",
      },
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${currentPalette.name.replace(/\s+/g, "-").toLowerCase()}-theme.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Theme Exported",
      description: "Theme configuration downloaded as JSON file",
    });
  };

  // Reset to default
  const resetToDefault = () => {
    setCurrentPalette({
      name: "Default Cyberpunk",
      primary: { h: 310, s: 100, l: 69 },
      secondary: { h: 193, s: 100, l: 50 },
      accent: { h: 60, s: 100, l: 50 },
      destructive: { h: 340, s: 82, l: 52 },
      background: { h: 0, s: 0, l: 0 },
      foreground: { h: 180, s: 100, l: 90 },
      card: { h: 0, s: 0, l: 5 },
      border: { h: 217, s: 32, l: 20 },
      muted: { h: 217, s: 32, l: 17 },
    });
    toast({
      title: "Reset Complete",
      description: "Theme reset to default cyberpunk colors",
    });
  };

  // Get contrast badge
  const getContrastBadge = (ratio: number) => {
    if (ratio >= 7)
      return <Badge className="bg-green-500/20 text-green-400">AAA</Badge>;
    if (ratio >= 4.5)
      return <Badge className="bg-yellow-500/20 text-yellow-400">AA</Badge>;
    if (ratio >= 3)
      return (
        <Badge className="bg-orange-500/20 text-orange-400">AA Large</Badge>
      );
    return <Badge className="bg-red-500/20 text-red-400">Fail</Badge>;
  };

  return (
    <div className="min-h-screen p-6 cyber-bg">
      <SEOHeadTags
        title="Dynamic Theme Color Palette Generator - Fanz™ Unlimited Network LLC"
        description="Generate custom color palettes using advanced color theory algorithms. Create, preview, and export professional themes with accessibility validation."
        canonicalUrl="https://fanzunlimited.com/theme-generator"
      />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold cyber-text-glow">
              Dynamic Theme Generator
            </h1>
            <p className="text-muted-foreground">
              Advanced color palette creation with accessibility validation
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className={
                isPreviewMode ? "bg-primary/20 border-primary" : "cyber-border"
              }
            >
              <Eye className="w-4 h-4 mr-2" />
              {isPreviewMode ? "Exit Preview" : "Live Preview"}
            </Button>
            <Button onClick={exportTheme} className="cyber-button">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Color Palette Display */}
          <div className="xl:col-span-2 space-y-6">
            <Card className="cyber-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Current Palette
                  <Badge variant="secondary" className="ml-auto">
                    {generationMode}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(currentPalette)
                    .filter(([key]) => key !== "name")
                    .map(([colorType, color]) => (
                      <div
                        key={colorType}
                        className={`relative group cursor-pointer rounded-lg p-4 border-2 transition-all ${
                          selectedColorType === colorType
                            ? "border-primary scale-105"
                            : "border-transparent hover:border-primary/50"
                        }`}
                        style={{
                          backgroundColor: hslToString(color as ColorHSL),
                        }}
                        onClick={() =>
                          setSelectedColorType(
                            colorType as keyof Omit<ThemePalette, "name">,
                          )
                        }
                      >
                        <div className="absolute inset-0 bg-black/60 rounded-lg" />
                        <div className="relative text-white">
                          <div className="font-medium capitalize mb-2">
                            {colorType}
                          </div>
                          <div className="text-xs font-mono">
                            {hslToHex(color as ColorHSL)}
                          </div>
                          <div className="text-xs font-mono">
                            {hslToString(color as ColorHSL)}
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="absolute top-1 right-1 h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyColor(color as ColorHSL);
                            }}
                          >
                            {copiedColor === hslToHex(color as ColorHSL) ? (
                              <Check className="w-3 h-3" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Color Control Panel */}
            <Card className="cyber-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Color Controls
                  <Badge variant="outline" className="ml-auto capitalize">
                    {selectedColorType}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="manual" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="manual">Manual Adjustment</TabsTrigger>
                    <TabsTrigger value="generate">Auto Generate</TabsTrigger>
                  </TabsList>

                  <TabsContent value="manual" className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium mb-2 block">
                          Hue: {Math.round(currentPalette[selectedColorType].h)}
                          °
                        </Label>
                        <Slider
                          value={[currentPalette[selectedColorType].h]}
                          onValueChange={([value]) =>
                            setCurrentPalette((prev) => ({
                              ...prev,
                              [selectedColorType]: {
                                ...prev[selectedColorType],
                                h: value,
                              },
                            }))
                          }
                          max={360}
                          step={1}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <Label className="text-sm font-medium mb-2 block">
                          Saturation:{" "}
                          {Math.round(currentPalette[selectedColorType].s)}%
                        </Label>
                        <Slider
                          value={[currentPalette[selectedColorType].s]}
                          onValueChange={([value]) =>
                            setCurrentPalette((prev) => ({
                              ...prev,
                              [selectedColorType]: {
                                ...prev[selectedColorType],
                                s: value,
                              },
                            }))
                          }
                          max={100}
                          step={1}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <Label className="text-sm font-medium mb-2 block">
                          Lightness:{" "}
                          {Math.round(currentPalette[selectedColorType].l)}%
                        </Label>
                        <Slider
                          value={[currentPalette[selectedColorType].l]}
                          onValueChange={([value]) =>
                            setCurrentPalette((prev) => ({
                              ...prev,
                              [selectedColorType]: {
                                ...prev[selectedColorType],
                                l: value,
                              },
                            }))
                          }
                          max={100}
                          step={1}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="generate" className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium mb-2 block">
                          Generation Algorithm
                        </Label>
                        <Select
                          value={generationMode}
                          onValueChange={(value) =>
                            setGenerationMode(value as typeof generationMode)
                          }
                        >
                          <SelectTrigger className="glass-effect">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="complementary">
                              Complementary
                            </SelectItem>
                            <SelectItem value="triadic">Triadic</SelectItem>
                            <SelectItem value="analogous">Analogous</SelectItem>
                            <SelectItem value="monochromatic">
                              Monochromatic
                            </SelectItem>
                            <SelectItem value="split-complementary">
                              Split Complementary
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex gap-3">
                        <Button
                          onClick={generatePalette}
                          className="flex-1 cyber-button"
                        >
                          <Shuffle className="w-4 h-4 mr-2" />
                          Generate Palette
                        </Button>
                        <Button
                          onClick={resetToDefault}
                          variant="outline"
                          className="cyber-border"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Controls Panel */}
          <div className="space-y-6">
            {/* Theme Management */}
            <Card className="cyber-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Save className="w-5 h-5" />
                  Theme Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Theme Name
                  </Label>
                  <Input
                    value={currentPalette.name}
                    onChange={(e) =>
                      setCurrentPalette((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className="glass-effect"
                    placeholder="Enter theme name"
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={saveTheme} className="flex-1 cyber-button">
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button
                    onClick={exportTheme}
                    variant="outline"
                    className="cyber-border"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Accessibility Check */}
            <Card className="cyber-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Contrast className="w-5 h-5" />
                  Accessibility
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(contrastResults).map(([key, ratio]) => {
                    const [color1, color2] = key.split("-");
                    return (
                      <div
                        key={key}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm capitalize">
                          {color1} / {color2}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono">
                            {ratio.toFixed(1)}:1
                          </span>
                          {getContrastBadge(ratio)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="cyber-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full cyber-border"
                  onClick={() => {
                    const randomHue = Math.random() * 360;
                    const newColors = generatePaletteFromBase(
                      { h: randomHue, s: 80, l: 60 },
                      generationMode,
                    );
                    setCurrentPalette((prev) => ({ ...prev, ...newColors }));
                  }}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Random Colors
                </Button>

                <Button
                  variant="outline"
                  className="w-full cyber-border"
                  onClick={() => {
                    const modes: Array<typeof generationMode> = [
                      "complementary",
                      "triadic",
                      "analogous",
                      "monochromatic",
                      "split-complementary",
                    ];
                    const randomMode =
                      modes[Math.floor(Math.random() * modes.length)];
                    setGenerationMode(randomMode);
                    generatePalette();
                  }}
                >
                  <Target className="w-4 h-4 mr-2" />
                  Surprise Me
                </Button>

                <div className="flex items-center justify-between pt-2">
                  <Label className="text-sm font-medium">Live Preview</Label>
                  <Switch
                    checked={isPreviewMode}
                    onCheckedChange={setIsPreviewMode}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
