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
import { TutorialBot } from "@/components/TutorialBot";
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
    | "linode"
    | "gcs"
    | "azure"
    | "oracle"
    | "alibaba"
    | "ibm"
    | "scaleway"
    | "ovh"
    | "rackspace"
    | "filebase"
    | "storj"
    | "minio"
    | "contabo"
    | "hetzner"
    | "bunny"
    | "upcloud"
    | "arvancloud"
    | "dreamhost"
    | "ionos"
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
  encryptionEnabled: boolean;
  encryptionAlgorithm?: "AES-256" | "AES-128" | "ChaCha20";
  encryptionKey?: string;
  routingPriority: number;
  routingRules?: {
    fileTypes?: string[];
    minSize?: number;
    maxSize?: number;
    contentTypes?: string[];
  };
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

  // Fetch storage providers from API
  const { data: storageProviders = [], isLoading } = useQuery<StorageProvider[]>({
    queryKey: ["/api/admin/storage"],
    refetchInterval: 30000,
  });

  // Fetch storage stats from API
  const { data: storageStats } = useQuery<StorageStats>({
    queryKey: ["/api/admin/storage/stats"],
    refetchInterval: 60000,
  });

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
    const iconMap: Record<string, JSX.Element> = {
      default: <HardDrive className="h-5 w-5 text-gray-600" />,
      s3: <Cloud className="h-5 w-5 text-orange-500" />,
      dospace: <Cloud className="h-5 w-5 text-blue-500" />,
      wasabi: <Cloud className="h-5 w-5 text-green-500" />,
      backblaze: <Cloud className="h-5 w-5 text-red-500" />,
      vultr: <Cloud className="h-5 w-5 text-purple-500" />,
      r2: <Cloud className="h-5 w-5 text-yellow-500" />,
      pushr: <Cloud className="h-5 w-5 text-pink-500" />,
      idrive: <Cloud className="h-5 w-5 text-indigo-500" />,
      linode: <Cloud className="h-5 w-5 text-teal-500" />,
      gcs: <Cloud className="h-5 w-5 text-blue-600" />,
      azure: <Cloud className="h-5 w-5 text-sky-500" />,
      oracle: <Cloud className="h-5 w-5 text-red-600" />,
      alibaba: <Cloud className="h-5 w-5 text-orange-600" />,
      ibm: <Cloud className="h-5 w-5 text-blue-700" />,
      scaleway: <Cloud className="h-5 w-5 text-purple-600" />,
      ovh: <Cloud className="h-5 w-5 text-blue-800" />,
      rackspace: <Cloud className="h-5 w-5 text-red-700" />,
      filebase: <Cloud className="h-5 w-5 text-emerald-500" />,
      storj: <Cloud className="h-5 w-5 text-cyan-500" />,
      minio: <HardDrive className="h-5 w-5 text-pink-600" />,
      contabo: <Cloud className="h-5 w-5 text-blue-900" />,
      hetzner: <Cloud className="h-5 w-5 text-rose-500" />,
      bunny: <Cloud className="h-5 w-5 text-orange-400" />,
      upcloud: <Cloud className="h-5 w-5 text-violet-500" />,
      arvancloud: <Cloud className="h-5 w-5 text-lime-500" />,
      dreamhost: <Cloud className="h-5 w-5 text-green-600" />,
      ionos: <Cloud className="h-5 w-5 text-blue-400" />,
    };
    return iconMap[provider] || <Cloud className="h-5 w-5" />;
  };

  const getProviderColor = (provider: string) => {
    const colorMap: Record<string, string> = {
      default: "bg-gray-50 border-gray-200",
      s3: "bg-orange-50 border-orange-200",
      dospace: "bg-blue-50 border-blue-200",
      wasabi: "bg-green-50 border-green-200",
      backblaze: "bg-red-50 border-red-200",
      vultr: "bg-purple-50 border-purple-200",
      r2: "bg-yellow-50 border-yellow-200",
      pushr: "bg-pink-50 border-pink-200",
      idrive: "bg-indigo-50 border-indigo-200",
      linode: "bg-teal-50 border-teal-200",
      gcs: "bg-blue-50 border-blue-300",
      azure: "bg-sky-50 border-sky-200",
      oracle: "bg-red-50 border-red-300",
      alibaba: "bg-orange-50 border-orange-300",
      ibm: "bg-blue-50 border-blue-400",
      scaleway: "bg-purple-50 border-purple-300",
      ovh: "bg-blue-50 border-blue-500",
      rackspace: "bg-red-50 border-red-400",
      filebase: "bg-emerald-50 border-emerald-200",
      storj: "bg-cyan-50 border-cyan-200",
      minio: "bg-pink-50 border-pink-300",
      contabo: "bg-blue-50 border-blue-600",
      hetzner: "bg-rose-50 border-rose-200",
      bunny: "bg-orange-50 border-orange-100",
      upcloud: "bg-violet-50 border-violet-200",
      arvancloud: "bg-lime-50 border-lime-200",
      dreamhost: "bg-green-50 border-green-300",
      ionos: "bg-blue-50 border-blue-100",
    };
    return colorMap[provider] || "bg-gray-50 border-gray-200";
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
    const instructions: Record<string, { title: string; steps: string[]; docsUrl: string }> = {
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
          "Generate API key (Spaces access keys)",
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
          "Note endpoint format: s3.wasabisys.com or regional endpoints",
          "Configure bucket policies for public access if needed",
        ],
        docsUrl: "https://docs.wasabi.com/",
      },
      backblaze: {
        title: "Backblaze B2 Cloud Storage Setup",
        steps: [
          "Create Backblaze account",
          "Navigate to B2 Cloud Storage",
          "Create a new bucket",
          "Generate application key with appropriate permissions",
          "Note the endpoint and key ID for configuration",
        ],
        docsUrl: "https://www.backblaze.com/b2/docs/",
      },
      vultr: {
        title: "Vultr Object Storage Setup",
        steps: [
          "Create Vultr account",
          "Navigate to Object Storage section",
          "Create a new object storage subscription",
          "Generate S3-compatible access keys",
          "Note your endpoint URL (e.g., ewr1.vultrobjects.com)",
        ],
        docsUrl: "https://docs.vultr.com/vultr-object-storage",
      },
      r2: {
        title: "Cloudflare R2 Setup",
        steps: [
          "Create Cloudflare account",
          "Navigate to R2 Object Storage",
          "Create a new R2 bucket",
          "Generate R2 API token with read/write permissions",
          "Configure custom domain or use auto-generated URL",
        ],
        docsUrl: "https://developers.cloudflare.com/r2/",
      },
      linode: {
        title: "Linode Object Storage Setup",
        steps: [
          "Create Linode account",
          "Navigate to Object Storage in Cloud Manager",
          "Create a new bucket in desired cluster",
          "Generate access key and secret key",
          "Endpoint format: <cluster>.linodeobjects.com",
        ],
        docsUrl: "https://www.linode.com/docs/products/storage/object-storage/",
      },
      gcs: {
        title: "Google Cloud Storage Setup",
        steps: [
          "Create Google Cloud Platform account",
          "Create a new project and enable Cloud Storage API",
          "Create a storage bucket",
          "Create service account with Storage Admin role",
          "Generate and download JSON key file (use as credentials)",
        ],
        docsUrl: "https://cloud.google.com/storage/docs",
      },
      azure: {
        title: "Azure Blob Storage Setup",
        steps: [
          "Create Microsoft Azure account",
          "Create a storage account",
          "Create a container (blob container)",
          "Get account name and access key from Access Keys section",
          "Endpoint format: <account>.blob.core.windows.net",
        ],
        docsUrl: "https://docs.microsoft.com/en-us/azure/storage/blobs/",
      },
      oracle: {
        title: "Oracle Cloud Object Storage Setup",
        steps: [
          "Create Oracle Cloud account",
          "Navigate to Object Storage",
          "Create a new bucket",
          "Generate Customer Secret Keys (S3-compatible)",
          "Note your namespace and region endpoint",
        ],
        docsUrl: "https://docs.oracle.com/en-us/iaas/Content/Object/home.htm",
      },
      alibaba: {
        title: "Alibaba Cloud OSS Setup",
        steps: [
          "Create Alibaba Cloud account",
          "Enable Object Storage Service (OSS)",
          "Create a new bucket",
          "Create AccessKey ID and AccessKey Secret in RAM",
          "Configure bucket ACL and CORS if needed",
        ],
        docsUrl: "https://www.alibabacloud.com/help/en/oss/",
      },
      ibm: {
        title: "IBM Cloud Object Storage Setup",
        steps: [
          "Create IBM Cloud account",
          "Create Object Storage service instance",
          "Create a bucket with desired resiliency",
          "Generate HMAC credentials (S3-compatible)",
          "Note endpoint URL for your bucket's location",
        ],
        docsUrl: "https://cloud.ibm.com/docs/cloud-object-storage",
      },
      scaleway: {
        title: "Scaleway Object Storage Setup",
        steps: [
          "Create Scaleway account",
          "Navigate to Object Storage",
          "Create a new bucket in desired region",
          "Generate API access key and secret key",
          "Endpoint format: s3.<region>.scw.cloud",
        ],
        docsUrl: "https://www.scaleway.com/en/docs/storage/object/",
      },
      ovh: {
        title: "OVHcloud Object Storage Setup",
        steps: [
          "Create OVHcloud account",
          "Create Public Cloud project",
          "Enable Object Storage (S3-compatible)",
          "Generate S3 credentials in user management",
          "Create container and note endpoint URL",
        ],
        docsUrl: "https://docs.ovh.com/gb/en/storage/object-storage/",
      },
      rackspace: {
        title: "Rackspace Cloud Files Setup",
        steps: [
          "Create Rackspace account",
          "Navigate to Cloud Files",
          "Create a container",
          "Generate API key from Account Settings",
          "Note your username and region",
        ],
        docsUrl: "https://docs.rackspace.com/support/how-to/cloud-files/",
      },
      filebase: {
        title: "Filebase (Web3 Storage) Setup",
        steps: [
          "Create Filebase account",
          "Create a new bucket",
          "Select decentralized network (IPFS, Storj, Sia, Skynet)",
          "Generate S3-compatible access key and secret",
          "Endpoint: s3.filebase.com",
        ],
        docsUrl: "https://docs.filebase.com/",
      },
      storj: {
        title: "Storj DCS (Decentralized) Setup",
        steps: [
          "Create Storj account",
          "Create a new bucket",
          "Generate S3 gateway credentials",
          "Note gateway endpoint URL",
          "Configure encryption passphrase for decentralized storage",
        ],
        docsUrl: "https://docs.storj.io/",
      },
      minio: {
        title: "MinIO (Self-Hosted) Setup",
        steps: [
          "Install MinIO server on your infrastructure",
          "Start MinIO with desired configuration",
          "Access MinIO console and create bucket",
          "Create access key and secret key",
          "Endpoint is your MinIO server URL (e.g., localhost:9000)",
        ],
        docsUrl: "https://min.io/docs/minio/linux/index.html",
      },
      contabo: {
        title: "Contabo Object Storage Setup",
        steps: [
          "Create Contabo account",
          "Order Object Storage in Customer Control Panel",
          "Create a bucket via S3 API or control panel",
          "Generate access credentials",
          "Endpoint format: eu2.contabostorage.com",
        ],
        docsUrl: "https://contabo.com/en/object-storage/",
      },
      hetzner: {
        title: "Hetzner Object Storage Setup",
        steps: [
          "Create Hetzner Cloud account",
          "Enable Object Storage in Cloud Console",
          "Create a new bucket",
          "Generate S3-compatible credentials",
          "Endpoint format: fsn1.your-objectstorage.com",
        ],
        docsUrl: "https://docs.hetzner.com/storage/object-storage/",
      },
      bunny: {
        title: "Bunny.net Storage Setup",
        steps: [
          "Create Bunny.net account",
          "Navigate to Storage Zones",
          "Create a new storage zone",
          "Generate FTP/API password",
          "Note API access key and storage zone name",
        ],
        docsUrl: "https://docs.bunny.net/docs/storage",
      },
      upcloud: {
        title: "UpCloud Object Storage Setup",
        steps: [
          "Create UpCloud account",
          "Enable Object Storage in control panel",
          "Create a new bucket",
          "Generate S3-compatible access keys",
          "Endpoint format: <region>.object.upcloud.com",
        ],
        docsUrl: "https://upcloud.com/products/object-storage",
      },
      arvancloud: {
        title: "ArvanCloud Object Storage Setup",
        steps: [
          "Create ArvanCloud account",
          "Navigate to Cloud Storage (S3-compatible)",
          "Create a new bucket",
          "Generate access key and secret key",
          "Endpoint: s3.ir-thr-at1.arvanstorage.com",
        ],
        docsUrl: "https://www.arvancloud.com/en/products/cloud-storage",
      },
      dreamhost: {
        title: "DreamHost DreamObjects Setup",
        steps: [
          "Create DreamHost account with DreamObjects",
          "Navigate to DreamObjects in panel",
          "Create a new bucket",
          "Generate API keys (S3-compatible)",
          "Endpoint: objects-us-east-1.dream.io",
        ],
        docsUrl: "https://help.dreamhost.com/hc/en-us/sections/203167008-DreamObjects",
      },
      ionos: {
        title: "IONOS Cloud Object Storage Setup",
        steps: [
          "Create IONOS Cloud account",
          "Navigate to Object Storage",
          "Create a new bucket",
          "Generate S3-compatible access credentials",
          "Endpoint format: s3-<region>.ionoscloud.com",
        ],
        docsUrl: "https://docs.ionos.com/cloud/managed-services/s3-object-storage",
      },
      pushr: {
        title: "Pushr CDN Storage Setup",
        steps: [
          "Create Pushr account",
          "Navigate to Storage section",
          "Create a new storage zone",
          "Generate API credentials",
          "Configure CDN and storage settings",
        ],
        docsUrl: "https://pushr.com/",
      },
      idrive: {
        title: "IDrive e2 Cloud Storage Setup",
        steps: [
          "Create IDrive e2 account",
          "Create a new bucket",
          "Generate access key and secret key",
          "Endpoint format: <endpoint-code>.idrivee2.com",
          "Configure bucket policies as needed",
        ],
        docsUrl: "https://www.idrive.com/e2/",
      },
    };

    return instructions[provider];
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
                  {storageStats?.totalFiles.toLocaleString() || "0"}
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
                  {storageStats ? formatFileSize(storageStats.totalSize) : "0 GB"}
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
                  {storageStats ? formatFileSize(storageStats.bandwidthUsed) : "0 GB"}
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
                  ${storageStats?.cost.toFixed(2) || "0.00"}
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

                      {/* Encryption Settings */}
                      <div className="space-y-4 border-t pt-4">
                        <div className="flex items-center space-x-2">
                          <Shield className="h-5 w-5 text-green-600" />
                          <Label className="text-base font-semibold">
                            Encryption Settings
                          </Label>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor={`${provider.provider}-encryption`}>
                              Enable End-to-End Encryption
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              Encrypt all files before upload (AES-256)
                            </p>
                          </div>
                          <Switch
                            id={`${provider.provider}-encryption`}
                            checked={provider.encryptionEnabled || false}
                            onCheckedChange={(checked) =>
                              handleProviderUpdate(
                                provider.id,
                                "encryptionEnabled",
                                checked,
                              )
                            }
                            data-testid={`switch-${provider.provider}-encryption`}
                          />
                        </div>

                        {provider.encryptionEnabled && (
                          <div className="space-y-4 bg-green-50 p-4 rounded-lg border border-green-200">
                            <div className="space-y-2">
                              <Label htmlFor={`${provider.provider}-encryption-algo`}>
                                Encryption Algorithm
                              </Label>
                              <Select
                                value={provider.encryptionAlgorithm || "AES-256"}
                                onValueChange={(value: any) =>
                                  handleProviderUpdate(
                                    provider.id,
                                    "encryptionAlgorithm",
                                    value,
                                  )
                                }
                              >
                                <SelectTrigger data-testid={`select-${provider.provider}-encryption-algo`}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="AES-256">AES-256 (Most Secure)</SelectItem>
                                  <SelectItem value="AES-128">AES-128 (Balanced)</SelectItem>
                                  <SelectItem value="ChaCha20">ChaCha20 (Fast)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`${provider.provider}-encryption-key`}>
                                Encryption Key (Optional - Auto-generated if blank)
                              </Label>
                              <div className="relative">
                                <Input
                                  id={`${provider.provider}-encryption-key`}
                                  type={showSecrets[`${provider.id}-enc`] ? "text" : "password"}
                                  value={provider.encryptionKey || ""}
                                  onChange={(e) =>
                                    handleProviderUpdate(
                                      provider.id,
                                      "encryptionKey",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="Leave blank for auto-generated key"
                                  data-testid={`input-${provider.provider}-encryption-key`}
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                                  onClick={() =>
                                    setShowSecrets((prev) => ({
                                      ...prev,
                                      [`${provider.id}-enc`]: !prev[`${provider.id}-enc`],
                                    }))
                                  }
                                >
                                  {showSecrets[`${provider.id}-enc`] ? (
                                    <EyeOff className="h-3 w-3" />
                                  ) : (
                                    <Eye className="h-3 w-3" />
                                  )}
                                </Button>
                              </div>
                              <p className="text-xs text-green-700 flex items-center space-x-1">
                                <Shield className="h-3 w-3" />
                                <span>Files are encrypted client-side before upload</span>
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Flow Routing Settings */}
                      <div className="space-y-4 border-t pt-4">
                        <div className="flex items-center space-x-2">
                          <Globe className="h-5 w-5 text-blue-600" />
                          <Label className="text-base font-semibold">
                            Flow Routing Rules
                          </Label>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`${provider.provider}-priority`}>
                            Routing Priority (0-100)
                          </Label>
                          <div className="flex items-center space-x-4">
                            <Input
                              id={`${provider.provider}-priority`}
                              type="number"
                              min="0"
                              max="100"
                              value={provider.routingPriority || 50}
                              onChange={(e) =>
                                handleProviderUpdate(
                                  provider.id,
                                  "routingPriority",
                                  parseInt(e.target.value),
                                )
                              }
                              className="w-24"
                              data-testid={`input-${provider.provider}-priority`}
                            />
                            <p className="text-sm text-muted-foreground">
                              Higher priority = preferred for automatic routing
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <div className="space-y-2">
                            <Label htmlFor={`${provider.provider}-file-types`}>
                              Preferred File Types (comma-separated)
                            </Label>
                            <Input
                              id={`${provider.provider}-file-types`}
                              type="text"
                              value={provider.routingRules?.fileTypes?.join(",") || ""}
                              onChange={(e) =>
                                handleProviderUpdate(
                                  provider.id,
                                  "routingRules",
                                  {
                                    ...provider.routingRules,
                                    fileTypes: e.target.value.split(",").map(t => t.trim()).filter(Boolean),
                                  },
                                )
                              }
                              placeholder="mp4,mov,avi (for video files)"
                              data-testid={`input-${provider.provider}-file-types`}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`${provider.provider}-content-types`}>
                              Content MIME Types (comma-separated)
                            </Label>
                            <Input
                              id={`${provider.provider}-content-types`}
                              type="text"
                              value={provider.routingRules?.contentTypes?.join(",") || ""}
                              onChange={(e) =>
                                handleProviderUpdate(
                                  provider.id,
                                  "routingRules",
                                  {
                                    ...provider.routingRules,
                                    contentTypes: e.target.value.split(",").map(t => t.trim()).filter(Boolean),
                                  },
                                )
                              }
                              placeholder="video/*,image/*"
                              data-testid={`input-${provider.provider}-content-types`}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`${provider.provider}-min-size`}>
                              Min File Size (MB)
                            </Label>
                            <Input
                              id={`${provider.provider}-min-size`}
                              type="number"
                              min="0"
                              value={provider.routingRules?.minSize || ""}
                              onChange={(e) =>
                                handleProviderUpdate(
                                  provider.id,
                                  "routingRules",
                                  {
                                    ...provider.routingRules,
                                    minSize: e.target.value ? parseInt(e.target.value) : undefined,
                                  },
                                )
                              }
                              placeholder="0"
                              data-testid={`input-${provider.provider}-min-size`}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`${provider.provider}-max-size`}>
                              Max File Size (MB)
                            </Label>
                            <Input
                              id={`${provider.provider}-max-size`}
                              type="number"
                              min="0"
                              value={provider.routingRules?.maxSize || ""}
                              onChange={(e) =>
                                handleProviderUpdate(
                                  provider.id,
                                  "routingRules",
                                  {
                                    ...provider.routingRules,
                                    maxSize: e.target.value ? parseInt(e.target.value) : undefined,
                                  },
                                )
                              }
                              placeholder="No limit"
                              data-testid={`input-${provider.provider}-max-size`}
                            />
                          </div>
                        </div>

                        <p className="text-sm text-blue-700 flex items-center space-x-1">
                          <AlertTriangle className="h-4 w-4" />
                          <span>
                            Files matching these rules will automatically route to this provider
                          </span>
                        </p>
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
                    <span>${storageStats?.cost.toFixed(2) || "0.00"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Tutorial Bot */}
      <TutorialBot
        pageName="Storage Settings"
        pageContext="Configure cloud storage providers, encryption, and file routing"
        isFloating={true}
      />
    </div>
  );
}
