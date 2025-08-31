import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Trash2, TestTube } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Platform {
  id: string;
  platformType: string;
  apiKey: string;
  webhookUrl: string;
  status: string;
  connectedAt: string;
}

export function InteractivePlatformManager() {
  const [newPlatform, setNewPlatform] = useState({
    platformType: "",
    apiKey: "",
    webhookUrl: ""
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: platforms = [], isLoading } = useQuery({
    queryKey: ['/api/platforms/connections'],
  });

  const connectMutation = useMutation({
    mutationFn: async (platformData: typeof newPlatform) => {
      const response = await fetch("/api/platforms/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(platformData)
      });
      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/platforms/connections'] });
      setNewPlatform({ platformType: "", apiKey: "", webhookUrl: "" });
      setShowAddForm(false);
      toast({
        title: "Platform Connected",
        description: `Successfully connected ${data.platformType}`,
      });
    },
    onError: () => {
      toast({
        title: "Connection Failed",
        description: "Failed to connect platform. Check your API key.",
        variant: "destructive",
      });
    }
  });

  const disconnectMutation = useMutation({
    mutationFn: async (platformId: string) => {
      const response = await fetch(`/api/platforms/${platformId}/disconnect`, {
        method: "DELETE"
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/platforms/connections'] });
      toast({
        title: "Platform Disconnected",
        description: "Platform has been successfully disconnected",
      });
    },
    onError: () => {
      toast({
        title: "Disconnection Failed",
        description: "Failed to disconnect platform",
        variant: "destructive",
      });
    }
  });

  const testMutation = useMutation({
    mutationFn: async (platformId: string) => {
      const response = await fetch(`/api/platforms/${platformId}/test`, {
        method: "POST"
      });
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Connection Test",
        description: data.success ? "Connection successful!" : "Connection failed",
        variant: data.success ? "default" : "destructive",
      });
    }
  });

  const handleConnect = () => {
    if (!newPlatform.platformType || !newPlatform.apiKey) {
      toast({
        title: "Missing Information",
        description: "Please provide platform type and API key",
        variant: "destructive",
      });
      return;
    }

    connectMutation.mutate(newPlatform);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-cyan-400">Platform Connections</h2>
        <Button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-cyan-600 hover:bg-cyan-700"
          data-testid="button-add-platform"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Platform
        </Button>
      </div>

      {showAddForm && (
        <Card data-testid="add-platform-form">
          <CardHeader>
            <CardTitle className="text-cyan-400">Connect New Platform</CardTitle>
            <CardDescription>
              Add a new platform to your moderation network
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="platformType">Platform Type</Label>
              <Input
                id="platformType"
                data-testid="input-platform-type"
                placeholder="e.g., OnlyFans, Patreon, Custom"
                value={newPlatform.platformType}
                onChange={(e) => setNewPlatform(prev => ({ ...prev, platformType: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                data-testid="input-api-key"
                placeholder="Your platform API key"
                value={newPlatform.apiKey}
                onChange={(e) => setNewPlatform(prev => ({ ...prev, apiKey: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="webhookUrl">Webhook URL (Optional)</Label>
              <Input
                id="webhookUrl"
                data-testid="input-webhook-url"
                placeholder="https://your-platform.com/webhook"
                value={newPlatform.webhookUrl}
                onChange={(e) => setNewPlatform(prev => ({ ...prev, webhookUrl: e.target.value }))}
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleConnect}
                disabled={connectMutation.isPending}
                className="bg-cyan-600 hover:bg-cyan-700"
                data-testid="button-connect"
              >
                {connectMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  "Connect Platform"
                )}
              </Button>
              <Button 
                onClick={() => setShowAddForm(false)}
                variant="outline"
                data-testid="button-cancel"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {(platforms as Platform[]).map((platform: Platform) => (
          <Card key={platform.id} data-testid={`platform-card-${platform.id}`}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-cyan-400">{platform.platformType}</CardTitle>
                  <CardDescription>
                    Connected on {new Date(platform.connectedAt).toLocaleDateString()}
                  </CardDescription>
                </div>
                <Badge 
                  variant={platform.status === "connected" ? "default" : "destructive"}
                  data-testid={`badge-status-${platform.id}`}
                >
                  {platform.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>API Key</Label>
                <p className="text-sm font-mono bg-gray-800 p-2 rounded border border-gray-700" data-testid={`text-api-key-${platform.id}`}>
                  {platform.apiKey}
                </p>
              </div>
              
              {platform.webhookUrl && (
                <div className="space-y-2">
                  <Label>Webhook URL</Label>
                  <p className="text-sm text-blue-400 break-all" data-testid={`text-webhook-${platform.id}`}>
                    {platform.webhookUrl}
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => testMutation.mutate(platform.id)}
                  disabled={testMutation.isPending}
                  data-testid={`button-test-${platform.id}`}
                >
                  <TestTube className="h-4 w-4 mr-1" />
                  Test
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => disconnectMutation.mutate(platform.id)}
                  disabled={disconnectMutation.isPending}
                  data-testid={`button-disconnect-${platform.id}`}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Disconnect
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {(platforms as Platform[]).length === 0 && (
        <Card data-testid="no-platforms-card">
          <CardContent className="text-center py-8">
            <p className="text-gray-400">No platforms connected yet.</p>
            <p className="text-sm text-gray-500 mt-2">
              Add your first platform to start monitoring content across your network.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}