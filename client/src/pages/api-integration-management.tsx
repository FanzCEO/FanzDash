import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Globe,
  Link,
  Key,
  Shield,
  Zap,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  Settings,
  Eye,
  Edit,
  Trash2,
  Plus,
  RefreshCw,
  AlertTriangle,
  Bot,
  CreditCard,
  Radio,
  Video,
  Image as ImageIcon,
  Search,
  Filter,
  Database,
  Cloud,
  Smartphone
} from "lucide-react";

interface APIIntegration {
  id: string;
  name: string;
  provider: string;
  category: 'payment' | 'ai_service' | 'social_media' | 'communication' | 'storage' | 'analytics' | 'security' | 'media' | 'compliance';
  status: 'active' | 'inactive' | 'error' | 'rate_limited';
  endpoint: string;
  version: string;
  lastCall: string;
  callsToday: number;
  rateLimit: number;
  rateLimitRemaining: number;
  avgResponseTime: number;
  successRate: number;
  platforms: string[];
  hasApiKey: boolean;
  hasWebhook: boolean;
  monthlyQuota: number;
  quotaUsed: number;
}

interface WebhookEndpoint {
  id: string;
  name: string;
  url: string;
  events: string[];
  status: 'active' | 'inactive' | 'failed';
  lastTriggered: string;
  successfulCalls: number;
  failedCalls: number;
  retryCount: number;
}

export default function APIIntegrationManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Mock API integrations based on Fanz ecosystem
  const apiIntegrations: APIIntegration[] = [
    {
      id: "openai_gpt5",
      name: "OpenAI GPT-5 API",
      provider: "OpenAI",
      category: "ai_service",
      status: "active",
      endpoint: "https://api.openai.com/v1/chat/completions",
      version: "v1",
      lastCall: "2025-01-15T12:00:00Z",
      callsToday: 15847,
      rateLimit: 50000,
      rateLimitRemaining: 34153,
      avgResponseTime: 1.2,
      successRate: 99.8,
      platforms: ["All"],
      hasApiKey: true,
      hasWebhook: false,
      monthlyQuota: 1500000,
      quotaUsed: 847562
    },
    {
      id: "ccbill_payment",
      name: "CCBill Payment API",
      provider: "CCBill",
      category: "payment",
      status: "active",
      endpoint: "https://api.ccbill.com/wap-frontflex/flexforms/",
      version: "3.0",
      lastCall: "2025-01-15T11:45:00Z",
      callsToday: 2847,
      rateLimit: 10000,
      rateLimitRemaining: 7153,
      avgResponseTime: 0.8,
      successRate: 99.2,
      platforms: ["All"],
      hasApiKey: true,
      hasWebhook: true,
      monthlyQuota: 300000,
      quotaUsed: 95432
    },
    {
      id: "perspective_api",
      name: "Google Perspective API",
      provider: "Google",
      category: "ai_service",
      status: "active",
      endpoint: "https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze",
      version: "v1alpha1",
      lastCall: "2025-01-15T11:55:00Z",
      callsToday: 8934,
      rateLimit: 15000,
      rateLimitRemaining: 6066,
      avgResponseTime: 0.9,
      successRate: 98.7,
      platforms: ["All"],
      hasApiKey: true,
      hasWebhook: false,
      monthlyQuota: 450000,
      quotaUsed: 267891
    },
    {
      id: "twilio_sms",
      name: "Twilio SMS API",
      provider: "Twilio",
      category: "communication",
      status: "active",
      endpoint: "https://api.twilio.com/2010-04-01/Accounts/{AccountSid}/Messages.json",
      version: "2010-04-01",
      lastCall: "2025-01-15T11:30:00Z",
      callsToday: 1256,
      rateLimit: 5000,
      rateLimitRemaining: 3744,
      avgResponseTime: 0.6,
      successRate: 97.5,
      platforms: ["All"],
      hasApiKey: true,
      hasWebhook: true,
      monthlyQuota: 150000,
      quotaUsed: 47823
    },
    {
      id: "aws_rekognition",
      name: "AWS Rekognition API",
      provider: "Amazon Web Services",
      category: "ai_service",
      status: "rate_limited",
      endpoint: "https://rekognition.us-east-1.amazonaws.com/",
      version: "2016-06-27",
      lastCall: "2025-01-15T10:15:00Z",
      callsToday: 4999,
      rateLimit: 5000,
      rateLimitRemaining: 1,
      avgResponseTime: 2.1,
      successRate: 94.2,
      platforms: ["All"],
      hasApiKey: true,
      hasWebhook: false,
      monthlyQuota: 150000,
      quotaUsed: 149999
    },
    {
      id: "twitter_api",
      name: "Twitter API v2",
      provider: "Twitter/X",
      category: "social_media",
      status: "error",
      endpoint: "https://api.twitter.com/2/",
      version: "v2",
      lastCall: "2025-01-15T08:30:00Z",
      callsToday: 0,
      rateLimit: 2000,
      rateLimitRemaining: 2000,
      avgResponseTime: 0,
      successRate: 0,
      platforms: ["All"],
      hasApiKey: true,
      hasWebhook: true,
      monthlyQuota: 60000,
      quotaUsed: 0
    },
    {
      id: "nowpayments_crypto",
      name: "NOWPayments Crypto API",
      provider: "NOWPayments",
      category: "payment",
      status: "active",
      endpoint: "https://api.nowpayments.io/v1/",
      version: "v1",
      lastCall: "2025-01-15T11:20:00Z",
      callsToday: 567,
      rateLimit: 2000,
      rateLimitRemaining: 1433,
      avgResponseTime: 1.5,
      successRate: 96.8,
      platforms: ["All"],
      hasApiKey: true,
      hasWebhook: true,
      monthlyQuota: 60000,
      quotaUsed: 18234
    },
    {
      id: "google_cloud_storage",
      name: "Google Cloud Storage API",
      provider: "Google Cloud",
      category: "storage",
      status: "active",
      endpoint: "https://storage.googleapis.com/storage/v1/",
      version: "v1",
      lastCall: "2025-01-15T11:58:00Z",
      callsToday: 12456,
      rateLimit: 50000,
      rateLimitRemaining: 37544,
      avgResponseTime: 0.4,
      successRate: 99.9,
      platforms: ["All"],
      hasApiKey: true,
      hasWebhook: false,
      monthlyQuota: 1500000,
      quotaUsed: 456789
    }
  ];

  // Mock webhook endpoints
  const webhookEndpoints: WebhookEndpoint[] = [
    {
      id: "ccbill_webhook",
      name: "CCBill Payment Webhook",
      url: "https://fanzlab.com/webhooks/ccbill",
      events: ["payment.success", "payment.failed", "subscription.created"],
      status: "active",
      lastTriggered: "2025-01-15T11:45:00Z",
      successfulCalls: 2847,
      failedCalls: 12,
      retryCount: 3
    },
    {
      id: "twilio_webhook",
      name: "Twilio SMS Status Webhook",
      url: "https://fanzlab.com/webhooks/twilio",
      events: ["message.delivered", "message.failed", "message.read"],
      status: "active",
      lastTriggered: "2025-01-15T11:30:00Z",
      successfulCalls: 1244,
      failedCalls: 3,
      retryCount: 2
    },
    {
      id: "twitter_webhook",
      name: "Twitter Event Webhook",
      url: "https://fanzlab.com/webhooks/twitter",
      events: ["tweet.published", "mention.created", "dm.received"],
      status: "failed",
      lastTriggered: "2025-01-15T08:30:00Z",
      successfulCalls: 0,
      failedCalls: 45,
      retryCount: 5
    }
  ];

  const handleToggleIntegration = useMutation({
    mutationFn: (integrationId: string) => apiRequest("POST", `/api/integrations/${integrationId}/toggle`),
    onSuccess: (_, integrationId) => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations"] });
      const integration = apiIntegrations.find(i => i.id === integrationId);
      toast({
        title: `Integration ${integration?.status === 'active' ? 'disabled' : 'enabled'}`,
        description: `${integration?.name} has been ${integration?.status === 'active' ? 'deactivated' : 'activated'}`
      });
    }
  });

  const handleTestIntegration = useMutation({
    mutationFn: (integrationId: string) => apiRequest("POST", `/api/integrations/${integrationId}/test`),
    onSuccess: (_, integrationId) => {
      const integration = apiIntegrations.find(i => i.id === integrationId);
      toast({
        title: "Test successful",
        description: `${integration?.name} is responding correctly`
      });
    },
    onError: (_, integrationId) => {
      const integration = apiIntegrations.find(i => i.id === integrationId);
      toast({
        title: "Test failed",
        description: `${integration?.name} is not responding`,
        variant: "destructive"
      });
    }
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "bg-green-600",
      inactive: "bg-gray-600",
      error: "bg-red-600",
      rate_limited: "bg-yellow-600"
    } as const;

    return (
      <Badge className={variants[status as keyof typeof variants] || "bg-gray-600"}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'payment': return <CreditCard className="w-4 h-4" />;
      case 'ai_service': return <Bot className="w-4 h-4" />;
      case 'social_media': return <Globe className="w-4 h-4" />;
      case 'communication': return <Radio className="w-4 h-4" />;
      case 'storage': return <Database className="w-4 h-4" />;
      case 'analytics': return <Activity className="w-4 h-4" />;
      case 'security': return <Shield className="w-4 h-4" />;
      case 'media': return <Video className="w-4 h-4" />;
      case 'compliance': return <CheckCircle className="w-4 h-4" />;
      default: return <Link className="w-4 h-4" />;
    }
  };

  const filteredIntegrations = apiIntegrations.filter(integration => {
    const matchesSearch = !searchQuery || 
      integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      integration.provider.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || integration.category === selectedCategory;
    const matchesStatus = selectedStatus === "all" || integration.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const stats = {
    totalIntegrations: apiIntegrations.length,
    activeIntegrations: apiIntegrations.filter(i => i.status === 'active').length,
    errorIntegrations: apiIntegrations.filter(i => i.status === 'error').length,
    totalCallsToday: apiIntegrations.reduce((sum, i) => sum + i.callsToday, 0)
  };

  return (
    <div className="min-h-screen cyber-bg">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold cyber-text-glow">API Integration Management</h1>
            <p className="text-muted-foreground">
              Manage external API integrations and webhook endpoints for the Fanz ecosystem
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" data-testid="button-refresh-integrations">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh All
            </Button>
            <Button data-testid="button-add-integration">
              <Plus className="w-4 h-4 mr-2" />
              Add Integration
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gray-900/50 border-cyan-500/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Globe className="h-8 w-8 text-cyan-400" />
                <div>
                  <p className="text-sm font-medium">Total APIs</p>
                  <p className="text-2xl font-bold text-cyan-400">{stats.totalIntegrations}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-green-500/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-8 w-8 text-green-400" />
                <div>
                  <p className="text-sm font-medium">Active</p>
                  <p className="text-2xl font-bold text-green-400">{stats.activeIntegrations}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-red-500/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <XCircle className="h-8 w-8 text-red-400" />
                <div>
                  <p className="text-sm font-medium">Errors</p>
                  <p className="text-2xl font-bold text-red-400">{stats.errorIntegrations}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-purple-500/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Activity className="h-8 w-8 text-purple-400" />
                <div>
                  <p className="text-sm font-medium">Calls Today</p>
                  <p className="text-2xl font-bold text-purple-400">{stats.totalCallsToday.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="integrations" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="integrations">API Integrations</TabsTrigger>
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
            <TabsTrigger value="keys">API Keys</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          </TabsList>

          <TabsContent value="integrations" className="space-y-6">
            <Card className="bg-gray-900/50 border-cyan-500/20">
              <CardHeader>
                <CardTitle className="text-cyan-400">API Integrations</CardTitle>
                <CardDescription>Manage external API connections and configurations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search integrations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-gray-800 border-gray-700"
                      data-testid="input-integration-search"
                    />
                  </div>
                  
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="payment">Payment Systems</SelectItem>
                      <SelectItem value="ai_service">AI Services</SelectItem>
                      <SelectItem value="social_media">Social Media</SelectItem>
                      <SelectItem value="communication">Communication</SelectItem>
                      <SelectItem value="storage">Storage</SelectItem>
                      <SelectItem value="analytics">Analytics</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                      <SelectItem value="media">Media Processing</SelectItem>
                      <SelectItem value="compliance">Compliance</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-[150px] bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="rate_limited">Rate Limited</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="border rounded-lg bg-gray-800/50">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Integration</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Usage</TableHead>
                        <TableHead>Performance</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredIntegrations.map((integration) => (
                        <TableRow key={integration.id}>
                          <TableCell>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                {getCategoryIcon(integration.category)}
                                <span className="font-medium">{integration.name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {integration.version}
                                </Badge>
                              </div>
                              <p className="text-xs text-gray-400">
                                {integration.provider}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {integration.category.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(integration.status)}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-sm font-mono">
                                {integration.callsToday.toLocaleString()} calls today
                              </div>
                              <Progress 
                                value={(integration.quotaUsed / integration.monthlyQuota) * 100} 
                                className="w-20 h-2" 
                              />
                              <div className="text-xs text-gray-400">
                                {((integration.quotaUsed / integration.monthlyQuota) * 100).toFixed(1)}% quota used
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-sm">
                                {integration.avgResponseTime}s avg
                              </div>
                              <div className="text-sm text-green-400">
                                {integration.successRate}% success
                              </div>
                              <div className="text-xs text-gray-400">
                                {integration.rateLimitRemaining} / {integration.rateLimit} remaining
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleTestIntegration.mutate(integration.id)}
                                disabled={handleTestIntegration.isPending}
                                variant="outline"
                                data-testid={`button-test-${integration.id}`}
                              >
                                <Zap className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleToggleIntegration.mutate(integration.id)}
                                disabled={handleToggleIntegration.isPending}
                                variant={integration.status === 'active' ? 'destructive' : 'default'}
                                data-testid={`button-toggle-${integration.id}`}
                              >
                                {integration.status === 'active' ? (
                                  <XCircle className="w-3 h-3" />
                                ) : (
                                  <CheckCircle className="w-3 h-3" />
                                )}
                              </Button>
                              <Button size="sm" variant="outline" data-testid={`button-config-${integration.id}`}>
                                <Settings className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="outline" data-testid={`button-view-${integration.id}`}>
                                <Eye className="w-3 h-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="webhooks" className="space-y-6">
            <Card className="bg-gray-900/50 border-cyan-500/20">
              <CardHeader>
                <CardTitle className="text-cyan-400">Webhook Endpoints</CardTitle>
                <CardDescription>Manage incoming webhook endpoints and event handlers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {webhookEndpoints.map((webhook) => (
                    <Card key={webhook.id} className="bg-gray-800/50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-white">{webhook.name}</h3>
                            <p className="text-sm text-gray-400 font-mono">{webhook.url}</p>
                          </div>
                          {getStatusBadge(webhook.status)}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-400">Events:</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {webhook.events.map((event) => (
                                <Badge key={event} variant="secondary" className="text-xs">
                                  {event}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-gray-400">Performance:</p>
                            <p className="text-green-400">{webhook.successfulCalls} successful</p>
                            <p className="text-red-400">{webhook.failedCalls} failed</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Last Triggered:</p>
                            <p>{new Date(webhook.lastTriggered).toLocaleString()}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="keys" className="space-y-6">
            <Card className="bg-gray-900/50 border-cyan-500/20">
              <CardHeader>
                <CardTitle className="text-cyan-400">API Key Management</CardTitle>
                <CardDescription>Secure storage and management of API credentials</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Key className="w-16 h-16 mx-auto mb-4 text-cyan-400" />
                  <p className="text-lg font-medium text-white mb-2">Secure API Key Storage</p>
                  <p className="text-gray-400 mb-6">
                    All API keys are securely encrypted and stored using enterprise-grade security
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center mt-8">
                    <div className="p-4 bg-gray-800/50 rounded-lg">
                      <Shield className="w-8 h-8 mx-auto mb-2 text-green-400" />
                      <p className="font-medium text-green-400">8 Active Keys</p>
                      <p className="text-sm text-gray-400">Encrypted & Secure</p>
                    </div>
                    <div className="p-4 bg-gray-800/50 rounded-lg">
                      <Clock className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
                      <p className="font-medium text-yellow-400">2 Expiring Soon</p>
                      <p className="text-sm text-gray-400">Within 30 days</p>
                    </div>
                    <div className="p-4 bg-gray-800/50 rounded-lg">
                      <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-red-400" />
                      <p className="font-medium text-red-400">1 Invalid Key</p>
                      <p className="text-sm text-gray-400">Needs attention</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-6">
            <Card className="bg-gray-900/50 border-cyan-500/20">
              <CardHeader>
                <CardTitle className="text-cyan-400">API Performance Monitoring</CardTitle>
                <CardDescription>Real-time monitoring and analytics for all integrations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-gray-800/50 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Response Times</h3>
                    <div className="space-y-3">
                      {apiIntegrations.slice(0, 5).map((integration) => (
                        <div key={integration.id} className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">{integration.name}</span>
                          <div className="flex items-center gap-2">
                            <Progress value={(integration.avgResponseTime / 3) * 100} className="w-16 h-2" />
                            <span className="text-xs font-mono text-white">{integration.avgResponseTime}s</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-6 bg-gray-800/50 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Success Rates</h3>
                    <div className="space-y-3">
                      {apiIntegrations.slice(0, 5).map((integration) => (
                        <div key={integration.id} className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">{integration.name}</span>
                          <div className="flex items-center gap-2">
                            <Progress value={integration.successRate} className="w-16 h-2" />
                            <span className="text-xs font-mono text-green-400">{integration.successRate}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}