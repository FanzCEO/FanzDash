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
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  Key,
  ExternalLink,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Copy,
  Facebook,
  Twitter,
  Chrome,
  Settings,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface SocialProvider {
  id: string;
  provider: "facebook" | "twitter" | "google";
  clientId?: string;
  clientSecret?: string;
  isEnabled: boolean;
  callbackUrl: string;
  scopes: string[];
  additionalConfig: Record<string, any>;
}

export default function SocialLoginSettings() {
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Mock social providers data
  const socialProviders: SocialProvider[] = [
    {
      id: "1",
      provider: "facebook",
      clientId: "your-facebook-app-id",
      clientSecret: "your-facebook-app-secret",
      isEnabled: true,
      callbackUrl: `${window.location.origin}/oauth/facebook/callback`,
      scopes: ["email", "public_profile"],
      additionalConfig: {},
    },
    {
      id: "2",
      provider: "twitter",
      clientId: "your-twitter-api-key",
      clientSecret: "your-twitter-api-secret",
      isEnabled: false,
      callbackUrl: `${window.location.origin}/oauth/twitter/callback`,
      scopes: ["tweet.read", "users.read"],
      additionalConfig: {},
    },
    {
      id: "3",
      provider: "google",
      clientId: "your-google-client-id.apps.googleusercontent.com",
      clientSecret: "your-google-client-secret",
      isEnabled: true,
      callbackUrl: `${window.location.origin}/oauth/google/callback`,
      scopes: ["openid", "email", "profile"],
      additionalConfig: {},
    },
  ];

  const isLoading = false;

  const updateProviderMutation = useMutation({
    mutationFn: (data: { id: string; updates: Partial<SocialProvider> }) =>
      apiRequest(`/api/admin/social-login/${data.id}`, "PATCH", data.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/social-login"] });
      toast({ title: "Social login provider updated successfully" });
    },
  });

  const testConnectionMutation = useMutation({
    mutationFn: (providerId: string) =>
      apiRequest(`/api/admin/social-login/${providerId}/test`, "POST"),
    onSuccess: (data, providerId) => {
      toast({
        title: "Connection test successful",
        description: `${providerId} OAuth configuration is working correctly`,
      });
    },
    onError: (error, providerId) => {
      toast({
        title: "Connection test failed",
        description: `Unable to connect to ${providerId}. Please check your credentials.`,
        variant: "destructive",
      });
    },
  });

  const handleProviderUpdate = (
    id: string,
    field: keyof SocialProvider,
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
      case "facebook":
        return <Facebook className="h-5 w-5 text-blue-600" />;
      case "twitter":
        return <Twitter className="h-5 w-5 text-sky-500" />;
      case "google":
        return <Chrome className="h-5 w-5 text-red-500" />;
      default:
        return <Users className="h-5 w-5" />;
    }
  };

  const getProviderName = (provider: string) => {
    switch (provider) {
      case "facebook":
        return "Facebook";
      case "twitter":
        return "X (Twitter)";
      case "google":
        return "Google";
      default:
        return provider;
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case "facebook":
        return "bg-blue-50 border-blue-200";
      case "twitter":
        return "bg-sky-50 border-sky-200";
      case "google":
        return "bg-red-50 border-red-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const getSetupInstructions = (provider: string) => {
    const instructions = {
      facebook: {
        title: "Facebook App Setup",
        steps: [
          "Go to Facebook Developers Console",
          "Create a new App or select existing",
          "Add Facebook Login product",
          "Copy App ID and App Secret",
          "Add callback URL to Valid OAuth Redirect URIs",
        ],
        docsUrl: "https://developers.facebook.com/docs/facebook-login",
      },
      twitter: {
        title: "X (Twitter) App Setup",
        steps: [
          "Go to X Developer Portal",
          "Create a new App",
          "Generate API Key and Secret",
          "Enable OAuth 2.0",
          "Add callback URL to redirect URIs",
        ],
        docsUrl: "https://developer.twitter.com/en/docs/authentication",
      },
      google: {
        title: "Google OAuth Setup",
        steps: [
          "Go to Google Cloud Console",
          "Create or select a project",
          "Enable Google+ API",
          "Create OAuth 2.0 credentials",
          "Add authorized redirect URIs",
        ],
        docsUrl: "https://developers.google.com/identity/protocols/oauth2",
      },
    };

    return instructions[provider as keyof typeof instructions];
  };

  const getEnabledProvidersCount = () => {
    return socialProviders.filter((p) => p.isEnabled).length;
  };

  const getTotalConnections = () => {
    // Mock data - in real app this would come from analytics
    return 2847;
  };

  return (
    <div
      className="container mx-auto p-6 space-y-6"
      data-testid="social-login-settings"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold cyber-text-glow">
            Social Login Settings
          </h1>
          <p className="text-muted-foreground">
            Configure OAuth integrations for Facebook, X (Twitter), and Google
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Users className="h-5 w-5" />
          <span className="text-sm font-medium">
            {getEnabledProvidersCount()}/{socialProviders.length} Enabled
          </span>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cyber-border">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm font-medium">Enabled Providers</p>
                <p className="text-2xl font-bold">
                  {getEnabledProvidersCount()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cyber-border">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Key className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Total Connections</p>
                <p className="text-2xl font-bold">
                  {getTotalConnections().toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cyber-border">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm font-medium">Active Sessions</p>
                <p className="text-2xl font-bold">1,452</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Social Providers Configuration */}
      <div className="space-y-6">
        {socialProviders.map((provider) => {
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
                      <CardTitle>
                        {getProviderName(provider.provider)} Login
                      </CardTitle>
                      <CardDescription>
                        OAuth integration for{" "}
                        {getProviderName(provider.provider)} authentication
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={provider.isEnabled ? "default" : "secondary"}
                    >
                      {provider.isEnabled ? "Enabled" : "Disabled"}
                    </Badge>
                    <Switch
                      checked={provider.isEnabled}
                      onCheckedChange={(checked) =>
                        handleProviderUpdate(provider.id, "isEnabled", checked)
                      }
                      data-testid={`switch-${provider.provider}-enabled`}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Configuration Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`${provider.provider}-client-id`}>
                      {provider.provider === "facebook"
                        ? "App ID"
                        : provider.provider === "twitter"
                          ? "API Key"
                          : "Client ID"}
                    </Label>
                    <div className="relative">
                      <Input
                        id={`${provider.provider}-client-id`}
                        type="text"
                        value={provider.clientId || ""}
                        onChange={(e) =>
                          handleProviderUpdate(
                            provider.id,
                            "clientId",
                            e.target.value,
                          )
                        }
                        placeholder={`Enter ${provider.provider === "facebook" ? "App ID" : "Client ID"}`}
                        data-testid={`input-${provider.provider}-client-id`}
                      />
                      {provider.clientId && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                          onClick={() => copyToClipboard(provider.clientId!)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`${provider.provider}-client-secret`}>
                      {provider.provider === "facebook"
                        ? "App Secret"
                        : provider.provider === "twitter"
                          ? "API Secret"
                          : "Client Secret"}
                    </Label>
                    <div className="relative">
                      <Input
                        id={`${provider.provider}-client-secret`}
                        type={showSecrets[provider.id] ? "text" : "password"}
                        value={provider.clientSecret || ""}
                        onChange={(e) =>
                          handleProviderUpdate(
                            provider.id,
                            "clientSecret",
                            e.target.value,
                          )
                        }
                        placeholder={`Enter ${provider.provider === "facebook" ? "App Secret" : "Client Secret"}`}
                        data-testid={`input-${provider.provider}-client-secret`}
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => toggleSecretVisibility(provider.id)}
                          data-testid={`button-toggle-${provider.provider}-secret`}
                        >
                          {showSecrets[provider.id] ? (
                            <EyeOff className="h-3 w-3" />
                          ) : (
                            <Eye className="h-3 w-3" />
                          )}
                        </Button>
                        {provider.clientSecret && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() =>
                              copyToClipboard(provider.clientSecret!)
                            }
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Callback URL */}
                <div className="space-y-2">
                  <Label htmlFor={`${provider.provider}-callback`}>
                    Callback URL
                  </Label>
                  <div className="relative">
                    <Input
                      id={`${provider.provider}-callback`}
                      type="text"
                      value={provider.callbackUrl}
                      readOnly
                      className="bg-muted"
                      data-testid={`input-${provider.provider}-callback`}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                      onClick={() => copyToClipboard(provider.callbackUrl)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Add this URL to your {getProviderName(provider.provider)}{" "}
                    app's authorized redirect URIs
                  </p>
                </div>

                {/* Test Connection & Actions */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="outline"
                      onClick={() =>
                        testConnectionMutation.mutate(provider.provider)
                      }
                      disabled={
                        !provider.clientId ||
                        !provider.clientSecret ||
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
                    {provider.clientId && provider.clientSecret ? (
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
                    <h4 className="font-medium mb-2">{instructions.title}</h4>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                      {instructions.steps.map((step, index) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ol>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Security Notice */}
      <Card className="cyber-border border-yellow-200 bg-yellow-50">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-yellow-800">
                Security Best Practices
              </h3>
              <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                <li>
                  • Store client secrets securely and never expose them in
                  client-side code
                </li>
                <li>• Regularly rotate your OAuth credentials</li>
                <li>• Use HTTPS for all callback URLs in production</li>
                <li>• Monitor OAuth usage for suspicious activity</li>
                <li>
                  • Keep your OAuth scopes minimal and only request necessary
                  permissions
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
