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
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  HardDrive,
  Cloud,
  Shield,
  Globe,
  Settings,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Copy,
  ExternalLink,
  BarChart3,
  Zap,
  Eye,
  EyeOff,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface StorageProvider {
  id: string;
  provider:
    | "s3"
    | "dospace"
    | "wasabi"
    | "backblaze"
    | "vultr"
    | "r2"
    | "pushr"
    | "idrive"
    | "default";
  name: string;
  isDefault: boolean;
  isEnabled: boolean;
  region?: string;
  bucket?: string;
  accessKey?: string;
  secretKey?: string;
  endpoint?: string;
  cdnEnabled: boolean;
  cdnUrl?: string;
  forceHttps: boolean;
  additionalConfig: Record<string, any>;
}

interface StorageStats {
  totalFiles: number;
  totalSize: number; // in bytes
  bandwidthUsed: number; // in bytes
  requestCount: number;
  cost: number; // in USD
}

export default function StorageSettings() {
  const [activeTab, setActiveTab] = useState("providers");
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Mock storage providers data
  const storageProviders: StorageProvider[] = [
    {
      id: "1",
      provider: "default",
      name: "Local Storage",
      isDefault: true,
      isEnabled: true,
      cdnEnabled: false,
      forceHttps: true,
      additionalConfig: {},
    },
    {
      id: "2",
      provider: "s3",
      name: "Amazon S3",
      isDefault: false,
      isEnabled: true,
      region: "us-east-1",
      bucket: "fanzdash-content",
      accessKey: process.env.VITE_AWS_ACCESS_KEY || '',
      secretKey: process.env.VITE_AWS_SECRET_KEY || '',
      endpoint: "s3.amazonaws.com",
      cdnEnabled: true,
      cdnUrl: "https://d123456789.cloudfront.net",
      forceHttps: true,
      additionalConfig: {},
    },
    {
      id: "3",
      provider: "dospace",
      name: "DigitalOcean Spaces",
      isDefault: false,
      isEnabled: false,
      region: "nyc3",
      bucket: "fanzdash-spaces",
      accessKey: process.env.VITE_DO_ACCESS_KEY || '',
      secretKey: process.env.VITE_DO_SECRET_KEY || '',
      endpoint: "nyc3.digitaloceanspaces.com",
      cdnEnabled: true,
      cdnUrl: "https://fanzdash-spaces.nyc3.cdn.digitaloceanspaces.com",
      forceHttps: true,
      additionalConfig: {},
    },
    {
      id: "4",
      provider: "wasabi",
      name: "Wasabi Hot Cloud Storage",
      isDefault: false,
      isEnabled: false,
      region: "us-east-1",
      bucket: "fanzdash-wasabi",
      accessKey: process.env.VITE_WASABI_ACCESS_KEY || '',
      secretKey: process.env.VITE_WASABI_SECRET_KEY || '',
      endpoint: "s3.wasabisys.com",
      cdnEnabled: false,
      forceHttps: true,
      additionalConfig: {},
    },
    {
      id: "5",
      provider: "r2",
      name: "Cloudflare R2",
      isDefault: false,
      isEnabled: false,
      region: "auto",
      bucket: "fanzdash-r2",
      accessKey: process.env.VITE_R2_ACCESS_KEY || '',
      secretKey: process.env.VITE_R2_SECRET_KEY || '',
      endpoint: "1234567890abcdef.r2.cloudflarestorage.com",
      cdnEnabled: true,
      cdnUrl: "https://fanzdash.example.com",
      forceHttps: true,
      additionalConfig: {},
    },
  ];

  // Mock storage stats
  const storageStats: StorageStats = {
    totalFiles: 25847,
    totalSize: 512000000000, // 512 GB
    bandwidthUsed: 1200000000000, // 1.2 TB
    requestCount: 1250000,
    cost: 89.5,
  };

  const isLoading = false;

  const updateProviderMutation = useMutation({
    mutationFn: (data: { id: string; updates: Partial<StorageProvider> }) =>
      apiRequest(`/api/admin/storage/${data.id}`, "PATCH", data.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/storage"] });
      toast({ title: "Storage provider updated successfully" });
    },
  });

  const testConnectionMutation = useMutation({
    mutationFn: (providerId: string) =>
      apiRequest(`/api/admin/storage/${providerId}/test`, "POST"),
    onSuccess: (data, providerId) => {
      toast({
        title: "Connection test successful",
        description: `Storage provider connection is working correctly`,
      });
    },
    onError: (error, providerId) => {
      toast({
        title: "Connection test failed",
        description: `Unable to connect to storage provider. Please check your credentials.`,
        variant: "destructive",
      });
    },
  });

  const setAsDefaultMutation = useMutation({
    mutationFn: (providerId: string) =>
      apiRequest(`/api/admin/storage/${providerId}/set-default`, "POST"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/storage"] });
      toast({ title: "Default storage provider updated" });
    },
  });

  const handleProviderUpdate = (
    id: string,
    field: keyof StorageProvider,
    value: any,
  ) => {
    updateProviderMutation.mutate({ id, updates: { [field]: value } });
  };

  const toggleSecretVisibility = (providerId: string) => {
    setShowSecrets((prev) => ({
      ...prev,
      [providerId]: !prev[providerId],
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case "default":
        return <HardDrive className="h-5 w-5 text-gray-600" />;
      case "s3":
        return <Cloud className="h-5 w-5 text-orange-500" />;
      case "dospace":
        return <Cloud className="h-5 w-5 text-blue-500" />;
      case "wasabi":
        return <Cloud className="h-5 w-5 text-green-500" />;
      case "backblaze":
        return <Cloud className="h-5 w-5 text-red-500" />;
      case "vultr":
        return <Cloud className="h-5 w-5 text-purple-500" />;
      case "r2":
        return <Cloud className="h-5 w-5 text-yellow-500" />;
      case "pushr":
        return <Cloud className="h-5 w-5 text-pink-500" />;
      case "idrive":
        return <Cloud className="h-5 w-5 text-indigo-500" />;
      default:
        return <Cloud className="h-5 w-5" />;
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case "default":
        return "bg-gray-50 border-gray-200";
      case "s3":
        return "bg-orange-50 border-orange-200";
      case "dospace":
        return "bg-blue-50 border-blue-200";
      case "wasabi":
        return "bg-green-50 border-green-200";
      case "backblaze":
        return "bg-red-50 border-red-200";
      case "vultr":
        return "bg-purple-50 border-purple-200";
      case "r2":
        return "bg-yellow-50 border-yellow-200";
      case "pushr":
        return "bg-pink-50 border-pink-200";
      case "idrive":
        return "bg-indigo-50 border-indigo-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    if (bytes === 0) return "0 Bytes";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  const getEnabledProvidersCount = () => {
    return storageProviders.filter((p) => p.isEnabled).length;
  };

  const getDefaultProvider = () => {
    return storageProviders.find((p) => p.isDefault);
  };

  const getSetupInstructions = (provider: string) => {
    const instructions = {
      s3: {
        title: "Amazon S3 Setup",
        steps: [
          "Create an AWS account and access IAM console",
          "Create a new IAM user with S3 permissions",
          "Generate access key and secret key",
          "Create S3 bucket in desired region",
          "Configure bucket permissions and CORS",
        ],
        docsUrl: "https://docs.aws.amazon.com/s3/",
      },
      dospace: {
        title: "DigitalOcean Spaces Setup",
        steps: [
          "Create DigitalOcean account",
          "Go to Spaces section in control panel",
          "Create a new Space in desired region",
          "Generate API key in API section",
          "Configure CORS settings if needed",
        ],
        docsUrl: "https://docs.digitalocean.com/products/spaces/",
      },
      wasabi: {
        title: "Wasabi Hot Cloud Storage Setup",
        steps: [
          "Create Wasabi account",
          "Create a new bucket",
          "Generate access key and secret key",
          "Note: Trial accounts may not support public files",
          "Contact support@wasabi.com to enable public files",
        ],
        docsUrl: "https://wasabi.com/wp-content/themes/wasabi/docs/",
      },
      r2: {
        title: "Cloudflare R2 Setup",
        steps: [
          "Create Cloudflare account",
          "Navigate to R2 Object Storage",
          "Create a new R2 bucket",
          "Generate R2 API token",
          "Configure custom domain if needed",
        ],
        docsUrl: "https://developers.cloudflare.com/r2/",
      },
    };

    return instructions[provider as keyof typeof instructions];
  };

  return (
    <div
      className="container mx-auto p-6 space-y-6"
      data-testid="storage-settings"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold cyber-text-glow">
            Storage Settings
          </h1>
          <p className="text-muted-foreground">
            Configure cloud storage providers and file management settings
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Cloud className="h-5 w-5" />
          <span className="text-sm font-medium">
            {getEnabledProvidersCount()}/{storageProviders.length} Providers
          </span>
        </div>
      </div>

      {/* Storage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="cyber-border">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <HardDrive className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm font-medium">Total Files</p>
                <p className="text-2xl font-bold">
                  {storageStats.totalFiles.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cyber-border">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Storage Used</p>
                <p className="text-2xl font-bold">
                  {formatFileSize(storageStats.totalSize)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cyber-border">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm font-medium">Bandwidth</p>
                <p className="text-2xl font-bold">
                  {formatFileSize(storageStats.bandwidthUsed)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cyber-border">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Globe className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">Monthly Cost</p>
                <p className="text-2xl font-bold">
                  ${storageStats.cost.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="providers">Storage Providers</TabsTrigger>
          <TabsTrigger value="settings">Global Settings</TabsTrigger>
          <TabsTrigger value="analytics">Usage Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="providers" className="space-y-6">
          {/* Current Default Provider */}
          <Card className="cyber-border border-green-200 bg-green-50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <CardTitle className="text-green-800">
                      Default Storage Provider
                    </CardTitle>
                    <CardDescription className="text-green-700">
                      Currently using: {getDefaultProvider()?.name}
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Storage Providers List */}
          <div className="space-y-4">
            {storageProviders.map((provider) => {
              const instructions = getSetupInstructions(provider.provider);

              return (
                <Card
                  key={provider.id}
                  className={`cyber-border ${getProviderColor(provider.provider)}`}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getProviderIcon(provider.provider)}
                        <div>
                          <CardTitle className="flex items-center space-x-2">
                            <span>{provider.name}</span>
                            {provider.isDefault && (
                              <Badge variant="default">Default</Badge>
                            )}
                          </CardTitle>
                          <CardDescription>
                            {provider.provider === "default"
                              ? "Local file storage on server disk"
                              : `Cloud storage provider: ${provider.provider.toUpperCase()}`}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={provider.isEnabled ? "default" : "secondary"}
                        >
                          {provider.isEnabled ? "Enabled" : "Disabled"}
                        </Badge>
                        {provider.provider !== "default" && (
                          <Switch
                            checked={provider.isEnabled}
                            onCheckedChange={(checked) =>
                              handleProviderUpdate(
                                provider.id,
                                "isEnabled",
                                checked,
                              )
                            }
                            data-testid={`switch-${provider.provider}-enabled`}
                          />
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  {provider.provider !== "default" && (
                    <CardContent className="space-y-6">
                      {/* Configuration Fields */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`${provider.provider}-access-key`}>
                            Access Key
                          </Label>
                          <div className="relative">
                            <Input
                              id={`${provider.provider}-access-key`}
                              type="text"
                              value={provider.accessKey || ""}
                              onChange={(e) =>
                                handleProviderUpdate(
                                  provider.id,
                                  "accessKey",
                                  e.target.value,
                                )
                              }
                              placeholder="Enter access key"
                              data-testid={`input-${provider.provider}-access-key`}
                            />
                            {provider.accessKey && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                                onClick={() =>
                                  copyToClipboard(provider.accessKey!)
                                }
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`${provider.provider}-secret-key`}>
                            Secret Key
                          </Label>
                          <div className="relative">
                            <Input
                              id={`${provider.provider}-secret-key`}
                              type={
                                showSecrets[provider.id] ? "text" : "password"
                              }
                              value={provider.secretKey || ""}
                              onChange={(e) =>
                                handleProviderUpdate(
                                  provider.id,
                                  "secretKey",
                                  e.target.value,
                                )
                              }
                              placeholder="Enter secret key"
                              data-testid={`input-${provider.provider}-secret-key`}
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() =>
                                  toggleSecretVisibility(provider.id)
                                }
                                data-testid={`button-toggle-${provider.provider}-secret`}
                              >
                                {showSecrets[provider.id] ? (
                                  <EyeOff className="h-3 w-3" />
                                ) : (
                                  <Eye className="h-3 w-3" />
                                )}
                              </Button>
                              {provider.secretKey && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() =>
                                    copyToClipboard(provider.secretKey!)
                                  }
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`${provider.provider}-region`}>
                            Region
                          </Label>
                          <Input
                            id={`${provider.provider}-region`}
                            type="text"
                            value={provider.region || ""}
                            onChange={(e) =>
                              handleProviderUpdate(
                                provider.id,
                                "region",
                                e.target.value,
                              )
                            }
                            placeholder="e.g., us-east-1"
                            data-testid={`input-${provider.provider}-region`}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`${provider.provider}-bucket`}>
                            Bucket Name
                          </Label>
                          <Input
                            id={`${provider.provider}-bucket`}
                            type="text"
                            value={provider.bucket || ""}
                            onChange={(e) =>
                              handleProviderUpdate(
                                provider.id,
                                "bucket",
                                e.target.value,
                              )
                            }
                            placeholder="Enter bucket name"
                            data-testid={`input-${provider.provider}-bucket`}
                          />
                        </div>
                      </div>

                      {/* CDN Settings */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor={`${provider.provider}-cdn`}>
                              Enable CDN
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              Use content delivery network for faster file
                              access
                            </p>
                          </div>
                          <Switch
                            id={`${provider.provider}-cdn`}
                            checked={provider.cdnEnabled}
                            onCheckedChange={(checked) =>
                              handleProviderUpdate(
                                provider.id,
                                "cdnEnabled",
                                checked,
                              )
                            }
                            data-testid={`switch-${provider.provider}-cdn`}
                          />
                        </div>

                        {provider.cdnEnabled && (
                          <div className="space-y-2">
                            <Label htmlFor={`${provider.provider}-cdn-url`}>
                              CDN URL
                            </Label>
                            <Input
                              id={`${provider.provider}-cdn-url`}
                              type="text"
                              value={provider.cdnUrl || ""}
                              onChange={(e) =>
                                handleProviderUpdate(
                                  provider.id,
                                  "cdnUrl",
                                  e.target.value,
                                )
                              }
                              placeholder="https://cdn.example.com"
                              data-testid={`input-${provider.provider}-cdn-url`}
                            />
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center space-x-4">
                          <Button
                            variant="outline"
                            onClick={() =>
                              testConnectionMutation.mutate(provider.id)
                            }
                            disabled={
                              !provider.accessKey ||
                              !provider.secretKey ||
                              testConnectionMutation.isPending
                            }
                            data-testid={`button-test-${provider.provider}`}
                          >
                            {testConnectionMutation.isPending ? (
                              <Settings className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <CheckCircle className="h-4 w-4 mr-2" />
                            )}
                            Test Connection
                          </Button>

                          {!provider.isDefault &&
                            provider.isEnabled &&
                            provider.accessKey &&
                            provider.secretKey && (
                              <Button
                                variant="default"
                                onClick={() =>
                                  setAsDefaultMutation.mutate(provider.id)
                                }
                                disabled={setAsDefaultMutation.isPending}
                                data-testid={`button-set-default-${provider.provider}`}
                              >
                                Set as Default
                              </Button>
                            )}

                          {instructions && (
                            <Button
                              variant="ghost"
                              onClick={() =>
                                window.open(instructions.docsUrl, "_blank")
                              }
                              data-testid={`button-docs-${provider.provider}`}
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Setup Guide
                            </Button>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
                          {provider.accessKey &&
                          provider.secretKey &&
                          provider.bucket ? (
                            <div className="flex items-center space-x-1 text-green-600">
                              <CheckCircle className="h-4 w-4" />
                              <span className="text-sm">Configured</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-1 text-yellow-600">
                              <AlertTriangle className="h-4 w-4" />
                              <span className="text-sm">Incomplete</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Setup Instructions */}
                      {instructions && (
                        <div className="bg-muted/50 rounded-lg p-4 mt-4">
                          <h4 className="font-medium mb-2">
                            {instructions.title}
                          </h4>
                          <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                            {instructions.steps.map((step, index) => (
                              <li key={index}>{step}</li>
                            ))}
                          </ol>
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card className="cyber-border">
            <CardHeader>
              <CardTitle>Global Storage Settings</CardTitle>
              <CardDescription>
                Configure platform-wide storage behavior and security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="force-https">Force HTTPS</Label>
                  <p className="text-sm text-muted-foreground">
                    Always use secure HTTPS URLs for file access
                  </p>
                </div>
                <Switch
                  id="force-https"
                  defaultChecked={true}
                  data-testid="switch-force-https"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="app-url">Application URL</Label>
                <Input
                  id="app-url"
                  type="text"
                  value={window.location.origin}
                  readOnly
                  className="bg-muted"
                  data-testid="input-app-url"
                />
                <p className="text-sm text-muted-foreground">
                  Base URL for your application. Used for generating file URLs.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max-file-size">Maximum File Size (MB)</Label>
                <Select defaultValue="100">
                  <SelectTrigger data-testid="select-max-file-size">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 MB</SelectItem>
                    <SelectItem value="25">25 MB</SelectItem>
                    <SelectItem value="50">50 MB</SelectItem>
                    <SelectItem value="100">100 MB</SelectItem>
                    <SelectItem value="250">250 MB</SelectItem>
                    <SelectItem value="500">500 MB</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="allowed-types">Allowed File Types</Label>
                <Input
                  id="allowed-types"
                  type="text"
                  defaultValue="jpg,jpeg,png,gif,mp4,mov,avi,pdf,zip"
                  placeholder="jpg,png,mp4,pdf"
                  data-testid="input-allowed-types"
                />
                <p className="text-sm text-muted-foreground">
                  Comma-separated list of allowed file extensions
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="cyber-border">
              <CardHeader>
                <CardTitle>Storage by Provider</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {storageProviders
                    .filter((p) => p.isEnabled)
                    .map((provider) => (
                      <div
                        key={provider.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-2">
                          {getProviderIcon(provider.provider)}
                          <span>{provider.name}</span>
                          {provider.isDefault && (
                            <Badge variant="outline">Default</Badge>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            {provider.provider === "default"
                              ? "128 GB"
                              : provider.provider === "s3"
                                ? "384 GB"
                                : "0 GB"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {provider.provider === "default"
                              ? "12.5k files"
                              : provider.provider === "s3"
                                ? "13.3k files"
                                : "0 files"}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card className="cyber-border">
              <CardHeader>
                <CardTitle>Cost Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Storage Costs</span>
                    <span className="font-medium">$42.50</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Bandwidth Costs</span>
                    <span className="font-medium">$28.75</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Request Costs</span>
                    <span className="font-medium">$18.25</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between font-medium">
                    <span>Total Monthly</span>
                    <span>${storageStats.cost.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
