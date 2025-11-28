import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { PhoneCall, Settings2, DollarSign, Clock, Mic } from "lucide-react";

interface AudioCallSettingsData {
  audioCallStatus: boolean;
  agoraAppId: string;
  audioCallMinPrice: number;
  audioCallMaxPrice: number;
  audioCallMaxDuration: number;
}

const audioCallSettingsSchema = z.object({
  audioCallStatus: z.boolean(),
  agoraAppId: z.string().optional(),
  audioCallMinPrice: z.coerce.number().min(1),
  audioCallMaxPrice: z.coerce.number().min(1),
  audioCallMaxDuration: z.coerce.number().min(10).max(60),
});

type AudioCallSettingsForm = z.infer<typeof audioCallSettingsSchema>;

export default function AudioCallSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery<AudioCallSettingsData>({
    queryKey: ["/api/audio-call-settings"],
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (data: AudioCallSettingsForm) =>
      apiRequest("/api/audio-call-settings", "POST", data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Audio call settings updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/audio-call-settings"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update audio call settings",
        variant: "destructive",
      });
    },
  });

  const form = useForm<AudioCallSettingsForm>({
    resolver: zodResolver(audioCallSettingsSchema),
    defaultValues: {
      audioCallStatus: false,
      agoraAppId: "",
      audioCallMinPrice: 1,
      audioCallMaxPrice: 100,
      audioCallMaxDuration: 60,
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        audioCallStatus: settings.audioCallStatus || false,
        agoraAppId: settings.agoraAppId || "",
        audioCallMinPrice: settings.audioCallMinPrice || 1,
        audioCallMaxPrice: settings.audioCallMaxPrice || 100,
        audioCallMaxDuration: settings.audioCallMaxDuration || 60,
      });
    }
  }, [settings, form]);

  const onSubmit = (data: AudioCallSettingsForm) => {
    updateSettingsMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const durationOptions: { value: number; label: string }[] = [];
  for (let i = 10; i <= 60; i += 10) {
    durationOptions.push({ value: i, label: `${i} minutes` });
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <PhoneCall className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Audio Call Settings
          </h1>
        </div>
        <p className="text-gray-600">
          Configure audio calling features with Agora WebRTC integration and
          pricing controls
        </p>
      </div>

      <div className="grid gap-6">
        {/* System Status Card */}
        <Card className="border-2 border-dashed border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5 text-blue-600" />
              System Status
            </CardTitle>
            <CardDescription>
              Current audio calling system status and configuration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                <span className="font-medium">Audio Calls</span>
                <Badge
                  variant={settings?.audioCallStatus ? "default" : "secondary"}
                >
                  {settings?.audioCallStatus ? "Active" : "Disabled"}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                <span className="font-medium">WebRTC Provider</span>
                <Badge variant="outline">Agora</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                <span className="font-medium">Price Range</span>
                <Badge variant="outline">
                  ${settings?.audioCallMinPrice || 1} - $
                  {settings?.audioCallMaxPrice || 100}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configuration Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5 text-green-600" />
              Audio Call Configuration
            </CardTitle>
            <CardDescription>
              Configure Agora WebRTC settings and pricing controls for audio
              calls
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Audio Call Status */}
                <FormField
                  control={form.control}
                  name="audioCallStatus"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base font-medium">
                          Enable Audio Calls
                        </FormLabel>
                        <div className="text-sm text-gray-600">
                          Allow creators and fans to make paid audio calls
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="switch-audio-call-status"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Agora App ID */}
                <FormField
                  control={form.control}
                  name="agoraAppId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Settings2 className="h-4 w-4" />
                        Agora APP ID
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter your Agora APP ID"
                          {...field}
                          data-testid="input-agora-app-id"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Pricing Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="audioCallMinPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          Minimum Price (USD)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            placeholder="1"
                            {...field}
                            data-testid="input-min-price"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="audioCallMaxPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-red-600" />
                          Maximum Price (USD)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            placeholder="100"
                            {...field}
                            data-testid="input-max-price"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Maximum Duration */}
                <FormField
                  control={form.control}
                  name="audioCallMaxDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-orange-600" />
                        Maximum Call Duration
                      </FormLabel>
                      <Select
                        value={field.value?.toString()}
                        onValueChange={(value) =>
                          field.onChange(parseInt(value))
                        }
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-max-duration">
                            <SelectValue placeholder="Select maximum duration" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {durationOptions.map((option) => (
                            <SelectItem
                              key={option.value}
                              value={option.value.toString()}
                            >
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={updateSettingsMutation.isPending}
                  className="w-full md:w-auto"
                  data-testid="button-save-settings"
                >
                  {updateSettingsMutation.isPending
                    ? "Saving..."
                    : "Save Settings"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Integration Info */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800">
              Integration Information
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p>
              <strong>Agora WebRTC:</strong> Provides high-quality, low-latency
              audio calling
            </p>
            <p>
              <strong>Per-Minute Billing:</strong> Charges creators and fans
              based on actual call duration
            </p>
            <p>
              <strong>Pricing Controls:</strong> Set platform-wide minimum and
              maximum pricing limits
            </p>
            <p>
              <strong>Duration Limits:</strong> Prevent excessively long calls
              with configurable time limits
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
