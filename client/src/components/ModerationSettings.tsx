import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { ModerationSettings } from "@/types/moderation";

export function ModerationSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings = [] } = useQuery({
    queryKey: ["/api/settings"],
  });

  const [imageSettings, setImageSettings] = useState({
    autoBlockThreshold: 0.85,
    reviewThreshold: 0.6,
  });

  const [textSettings, setTextSettings] = useState({
    autoBlockThreshold: 0.8,
    reviewThreshold: 0.5,
  });

  const [streamSettings, setStreamSettings] = useState({
    frameSampleRate: 4,
    autoBlurThreshold: 0.75,
  });

  const saveSettingsMutation = useMutation({
    mutationFn: async (settingsData: any) => {
      // Save each type of settings
      await Promise.all([
        apiRequest("/api/settings", "PUT", {
          type: "image",
          autoBlockThreshold: imageSettings.autoBlockThreshold.toString(),
          reviewThreshold: imageSettings.reviewThreshold.toString(),
        }),
        apiRequest("/api/settings", "PUT", {
          type: "text",
          autoBlockThreshold: textSettings.autoBlockThreshold.toString(),
          reviewThreshold: textSettings.reviewThreshold.toString(),
        }),
        apiRequest("/api/settings", "PUT", {
          type: "live_stream",
          frameSampleRate: streamSettings.frameSampleRate,
          autoBlurThreshold: streamSettings.autoBlurThreshold.toString(),
        }),
      ]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "Settings saved",
        description: "Moderation settings have been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSaveSettings = () => {
    saveSettingsMutation.mutate({});
  };

  const handleResetDefaults = () => {
    setImageSettings({
      autoBlockThreshold: 0.85,
      reviewThreshold: 0.6,
    });
    setTextSettings({
      autoBlockThreshold: 0.8,
      reviewThreshold: 0.5,
    });
    setStreamSettings({
      frameSampleRate: 4,
      autoBlurThreshold: 0.75,
    });

    toast({
      title: "Settings reset",
      description: "All settings have been reset to default values.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Moderation Thresholds</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Image/Video Thresholds */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">
              Image/Video Content
            </h4>
            <div className="space-y-4">
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-2">
                  Auto-Block Threshold
                </Label>
                <Slider
                  value={[imageSettings.autoBlockThreshold]}
                  onValueChange={([value]) =>
                    setImageSettings((prev) => ({
                      ...prev,
                      autoBlockThreshold: value,
                    }))
                  }
                  min={0}
                  max={1}
                  step={0.05}
                  className="w-full"
                  data-testid="image-block-threshold"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0.0</span>
                  <span className="font-medium text-red-600">
                    {imageSettings.autoBlockThreshold.toFixed(2)}
                  </span>
                  <span>1.0</span>
                </div>
              </div>
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-2">
                  Review Threshold
                </Label>
                <Slider
                  value={[imageSettings.reviewThreshold]}
                  onValueChange={([value]) =>
                    setImageSettings((prev) => ({
                      ...prev,
                      reviewThreshold: value,
                    }))
                  }
                  min={0}
                  max={1}
                  step={0.05}
                  className="w-full"
                  data-testid="image-review-threshold"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0.0</span>
                  <span className="font-medium text-yellow-600">
                    {imageSettings.reviewThreshold.toFixed(2)}
                  </span>
                  <span>1.0</span>
                </div>
              </div>
            </div>
          </div>

          {/* Text Thresholds */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Text Content</h4>
            <div className="space-y-4">
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-2">
                  Toxicity Block Threshold
                </Label>
                <Slider
                  value={[textSettings.autoBlockThreshold]}
                  onValueChange={([value]) =>
                    setTextSettings((prev) => ({
                      ...prev,
                      autoBlockThreshold: value,
                    }))
                  }
                  min={0}
                  max={1}
                  step={0.05}
                  className="w-full"
                  data-testid="text-block-threshold"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0.0</span>
                  <span className="font-medium text-red-600">
                    {textSettings.autoBlockThreshold.toFixed(2)}
                  </span>
                  <span>1.0</span>
                </div>
              </div>
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-2">
                  Warning Threshold
                </Label>
                <Slider
                  value={[textSettings.reviewThreshold]}
                  onValueChange={([value]) =>
                    setTextSettings((prev) => ({
                      ...prev,
                      reviewThreshold: value,
                    }))
                  }
                  min={0}
                  max={1}
                  step={0.05}
                  className="w-full"
                  data-testid="text-review-threshold"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0.0</span>
                  <span className="font-medium text-yellow-600">
                    {textSettings.reviewThreshold.toFixed(2)}
                  </span>
                  <span>1.0</span>
                </div>
              </div>
            </div>
          </div>

          {/* Live Stream Settings */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">
              Live Stream Settings
            </h4>
            <div className="space-y-4">
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-2">
                  Frame Sample Rate
                </Label>
                <Select
                  value={streamSettings.frameSampleRate.toString()}
                  onValueChange={(value) =>
                    setStreamSettings((prev) => ({
                      ...prev,
                      frameSampleRate: parseInt(value),
                    }))
                  }
                >
                  <SelectTrigger data-testid="frame-rate-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 FPS (Low CPU)</SelectItem>
                    <SelectItem value="4">4 FPS (Balanced)</SelectItem>
                    <SelectItem value="8">8 FPS (High accuracy)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-2">
                  Auto-Blur Sensitivity
                </Label>
                <Slider
                  value={[streamSettings.autoBlurThreshold]}
                  onValueChange={([value]) =>
                    setStreamSettings((prev) => ({
                      ...prev,
                      autoBlurThreshold: value,
                    }))
                  }
                  min={0}
                  max={1}
                  step={0.05}
                  className="w-full"
                  data-testid="blur-threshold"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Low</span>
                  <span className="font-medium">
                    {streamSettings.autoBlurThreshold.toFixed(2)}
                  </span>
                  <span>High</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <Button
            onClick={handleSaveSettings}
            disabled={saveSettingsMutation.isPending}
            data-testid="save-settings-button"
          >
            {saveSettingsMutation.isPending
              ? "Saving..."
              : "Save Configuration"}
          </Button>
          <Button
            variant="outline"
            className="ml-3"
            onClick={handleResetDefaults}
            data-testid="reset-defaults-button"
          >
            Reset to Defaults
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
