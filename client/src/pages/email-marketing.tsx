import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Mail,
  Send,
  Users,
  BarChart3,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Plus,
  Edit,
  Copy,
  Download,
  Search,
  Filter,
  Target,
  Zap,
  TrendingUp,
  Calendar,
  Settings,
  Percent,
} from "lucide-react";

interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  previewText: string;
  fromName: string;
  fromEmail: string;
  templateId: string;
  listIds: string[];
  status: "draft" | "scheduled" | "sending" | "sent" | "paused" | "cancelled";
  scheduledDate?: string;
  sentDate?: string;
  stats: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    unsubscribed: number;
  };
  openRate: number;
  clickRate: number;
  createdDate: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  category: string;
  content: string;
  thumbnail?: string;
  isDefault: boolean;
  lastModified: string;
  usageCount: number;
}

interface SubscriberList {
  id: string;
  name: string;
  description: string;
  subscriberCount: number;
  tags: string[];
  createdDate: string;
  lastActivity: string;
  activeSubscribers: number;
  engagementRate: number;
}

interface Subscriber {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: "subscribed" | "unsubscribed" | "bounced" | "complained";
  lists: string[];
  tags: string[];
  subscribedDate: string;
  lastActivity?: string;
  opens: number;
  clicks: number;
  engagementScore: number;
}

interface Automation {
  id: string;
  name: string;
  trigger: "signup" | "purchase" | "abandonment" | "birthday" | "inactivity" | "custom";
  status: "active" | "paused" | "draft";
  steps: {
    id: string;
    type: "email" | "wait" | "condition" | "action";
    delay?: number;
    templateId?: string;
    condition?: string;
  }[];
  subscribers: number;
  sent: number;
  performance: {
    opens: number;
    clicks: number;
    conversions: number;
  };
  createdDate: string;
}

interface Analytics {
  totalSent: number;
  totalDelivered: number;
  avgOpenRate: number;
  avgClickRate: number;
  totalRevenue: number;
  topPerformingCampaigns: {
    id: string;
    name: string;
    openRate: number;
    clickRate: number;
  }[];
  recentActivity: {
    date: string;
    sent: number;
    opened: number;
    clicked: number;
  }[];
}

function apiRequest(url: string, method: string, data?: any) {
  return fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  }).then((res) => res.json());
}

export default function EmailMarketing() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("campaigns");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateCampaign, setShowCreateCampaign] = useState(false);
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [showCreateList, setShowCreateList] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<EmailCampaign | null>(null);

  // Fetch campaigns
  const { data: campaigns = [] } = useQuery<EmailCampaign[]>({
    queryKey: ["/api/email/campaigns"],
    refetchInterval: 30000,
  });

  // Fetch templates
  const { data: templates = [] } = useQuery<EmailTemplate[]>({
    queryKey: ["/api/email/templates"],
  });

  // Fetch lists
  const { data: lists = [] } = useQuery<SubscriberList[]>({
    queryKey: ["/api/email/lists"],
    refetchInterval: 30000,
  });

  // Fetch subscribers
  const { data: subscribers = [] } = useQuery<Subscriber[]>({
    queryKey: ["/api/email/subscribers"],
    refetchInterval: 30000,
  });

  // Fetch automations
  const { data: automations = [] } = useQuery<Automation[]>({
    queryKey: ["/api/email/automations"],
  });

  // Fetch analytics
  const { data: analytics } = useQuery<Analytics>({
    queryKey: ["/api/email/analytics"],
    refetchInterval: 60000,
  });

  // Create campaign mutation
  const createCampaignMutation = useMutation({
    mutationFn: (data: Partial<EmailCampaign>) =>
      apiRequest("/api/email/campaigns", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/email/campaigns"] });
      toast({ title: "Campaign created successfully" });
      setShowCreateCampaign(false);
    },
  });

  // Send campaign mutation
  const sendCampaignMutation = useMutation({
    mutationFn: (campaignId: string) =>
      apiRequest(`/api/email/campaigns/${campaignId}/send`, "POST", {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/email/campaigns"] });
      toast({ title: "Campaign sent successfully" });
    },
  });

  // Create template mutation
  const createTemplateMutation = useMutation({
    mutationFn: (data: Partial<EmailTemplate>) =>
      apiRequest("/api/email/templates", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/email/templates"] });
      toast({ title: "Template created successfully" });
      setShowCreateTemplate(false);
    },
  });

  // Create list mutation
  const createListMutation = useMutation({
    mutationFn: (data: Partial<SubscriberList>) =>
      apiRequest("/api/email/lists", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/email/lists"] });
      toast({ title: "List created successfully" });
      setShowCreateList(false);
    },
  });

  // Stats
  const totalSubscribers = subscribers.length;
  const activeSubscribers = subscribers.filter((s) => s.status === "subscribed").length;
  const totalCampaigns = campaigns.length;
  const sentCampaigns = campaigns.filter((c) => c.status === "sent").length;

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
      case "delivered":
      case "active":
      case "subscribed":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "scheduled":
      case "draft":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "sending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "paused":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "cancelled":
      case "bounced":
      case "unsubscribed":
      case "complained":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <div className="min-h-screen cyber-bg p-4 md:p-6 lg:p-8">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold cyber-text-glow">
              Email Marketing
            </h1>
            <p className="text-gray-400 mt-2">
              Create campaigns, manage subscribers, and track performance
            </p>
          </div>
          <Button
            onClick={() => setShowCreateCampaign(true)}
            className="bg-gradient-to-r from-cyan-500 to-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Campaign
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="cyber-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Subscribers</p>
                <p className="text-2xl font-bold mt-1">{totalSubscribers}</p>
                <p className="text-xs text-green-400 mt-1">
                  {activeSubscribers} active
                </p>
              </div>
              <Users className="h-8 w-8 text-cyan-400" />
            </div>
          </Card>

          <Card className="cyber-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Campaigns Sent</p>
                <p className="text-2xl font-bold mt-1">{sentCampaigns}</p>
                <p className="text-xs text-gray-400 mt-1">of {totalCampaigns} total</p>
              </div>
              <Send className="h-8 w-8 text-blue-400" />
            </div>
          </Card>

          <Card className="cyber-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Avg Open Rate</p>
                <p className="text-2xl font-bold mt-1">
                  {analytics?.avgOpenRate.toFixed(1) || 0}%
                </p>
              </div>
              <Eye className="h-8 w-8 text-green-400" />
            </div>
          </Card>

          <Card className="cyber-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Avg Click Rate</p>
                <p className="text-2xl font-bold mt-1">
                  {analytics?.avgClickRate.toFixed(1) || 0}%
                </p>
              </div>
              <Target className="h-8 w-8 text-yellow-400" />
            </div>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="cyber-card">
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="lists">Lists</TabsTrigger>
            <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
            <TabsTrigger value="automations">Automations</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns" className="space-y-4">
            <Card className="cyber-card p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold">Email Campaigns</h3>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search campaigns..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="cyber-input pl-10 w-64"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  {campaigns
                    .filter((c) =>
                      searchQuery === ""
                        ? true
                        : c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.subject.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((campaign) => (
                      <div key={campaign.id} className="cyber-card p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-lg">{campaign.name}</p>
                              <Badge className={getStatusColor(campaign.status)}>
                                {campaign.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-400">
                              Subject: {campaign.subject}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              From: {campaign.fromName} ({campaign.fromEmail})
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {campaign.status === "draft" && (
                              <Button
                                size="sm"
                                onClick={() => sendCampaignMutation.mutate(campaign.id)}
                                className="bg-green-500/20 text-green-400"
                              >
                                <Send className="h-4 w-4 mr-1" />
                                Send Now
                              </Button>
                            )}
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {campaign.status === "sent" && (
                          <div className="grid grid-cols-6 gap-4 mt-3 pt-3 border-t border-gray-800">
                            <div className="text-center">
                              <p className="text-xs text-gray-500">Sent</p>
                              <p className="text-sm font-semibold">
                                {campaign.stats.sent.toLocaleString()}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-gray-500">Delivered</p>
                              <p className="text-sm font-semibold text-green-400">
                                {campaign.stats.delivered.toLocaleString()}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-gray-500">Opens</p>
                              <p className="text-sm font-semibold text-blue-400">
                                {campaign.stats.opened.toLocaleString()}
                              </p>
                              <p className="text-xs text-gray-500">
                                {campaign.openRate.toFixed(1)}%
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-gray-500">Clicks</p>
                              <p className="text-sm font-semibold text-cyan-400">
                                {campaign.stats.clicked.toLocaleString()}
                              </p>
                              <p className="text-xs text-gray-500">
                                {campaign.clickRate.toFixed(1)}%
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-gray-500">Bounced</p>
                              <p className="text-sm font-semibold text-red-400">
                                {campaign.stats.bounced.toLocaleString()}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-gray-500">Unsubscribed</p>
                              <p className="text-sm font-semibold text-orange-400">
                                {campaign.stats.unsubscribed.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        )}

                        {campaign.scheduledDate && campaign.status === "scheduled" && (
                          <div className="mt-3 pt-3 border-t border-gray-800">
                            <p className="text-sm text-gray-400">
                              <Calendar className="inline h-4 w-4 mr-1" />
                              Scheduled for:{" "}
                              {new Date(campaign.scheduledDate).toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  {campaigns.length === 0 && (
                    <p className="text-center text-gray-400 py-8">No campaigns found</p>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-4">
            <Card className="cyber-card p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold">Email Templates</h3>
                  <Button onClick={() => setShowCreateTemplate(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Template
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {templates.map((template) => (
                    <div key={template.id} className="cyber-card p-4">
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="outline">{template.category}</Badge>
                        {template.isDefault && (
                          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                            Default
                          </Badge>
                        )}
                      </div>
                      <div className="h-32 bg-gray-800 rounded mb-3 flex items-center justify-center">
                        <FileText className="h-12 w-12 text-gray-600" />
                      </div>
                      <h4 className="font-semibold mb-1">{template.name}</h4>
                      <p className="text-sm text-gray-400 mb-2">{template.subject}</p>
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>Used {template.usageCount} times</span>
                        <span>
                          {new Date(template.lastModified).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Eye className="h-4 w-4 mr-1" />
                          Preview
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {templates.length === 0 && (
                    <div className="col-span-3 text-center text-gray-400 py-8">
                      No templates found
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Lists Tab */}
          <TabsContent value="lists" className="space-y-4">
            <Card className="cyber-card p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold">Subscriber Lists</h3>
                  <Button onClick={() => setShowCreateList(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create List
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {lists.map((list) => (
                    <div key={list.id} className="cyber-card p-4">
                      <div className="flex items-center justify-between mb-3">
                        <Users className="h-6 w-6 text-cyan-400" />
                        <Badge variant="outline">
                          {list.activeSubscribers} active
                        </Badge>
                      </div>
                      <h4 className="font-semibold text-lg mb-2">{list.name}</h4>
                      <p className="text-sm text-gray-400 mb-3">{list.description}</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Total Subscribers</span>
                          <span className="font-semibold">
                            {list.subscriberCount.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Engagement Rate</span>
                          <span className="font-semibold text-green-400">
                            {list.engagementRate.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Last Activity</span>
                          <span className="text-xs">
                            {new Date(list.lastActivity).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      {list.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {list.tags.map((tag, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <Button size="sm" variant="outline" className="w-full mt-3">
                        Manage List
                      </Button>
                    </div>
                  ))}
                  {lists.length === 0 && (
                    <div className="col-span-3 text-center text-gray-400 py-8">
                      No lists found
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Subscribers Tab */}
          <TabsContent value="subscribers" className="space-y-4">
            <Card className="cyber-card p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold">Subscribers</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Subscriber
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  {subscribers.slice(0, 20).map((subscriber) => (
                    <div key={subscriber.id} className="cyber-card p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold">
                              {subscriber.firstName} {subscriber.lastName}
                            </p>
                            <Badge className={getStatusColor(subscriber.status)}>
                              {subscriber.status}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="bg-purple-500/20 text-purple-400 border-purple-500/30"
                            >
                              Score: {subscriber.engagementScore}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-400">{subscriber.email}</p>
                          <div className="flex gap-4 mt-2 text-xs text-gray-500">
                            <span>
                              Subscribed:{" "}
                              {new Date(subscriber.subscribedDate).toLocaleDateString()}
                            </span>
                            <span>Opens: {subscriber.opens}</span>
                            <span>Clicks: {subscriber.clicks}</span>
                            <span>Lists: {subscriber.lists.length}</span>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {subscribers.length === 0 && (
                    <p className="text-center text-gray-400 py-8">No subscribers found</p>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Automations Tab */}
          <TabsContent value="automations" className="space-y-4">
            <Card className="cyber-card p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold">Email Automations</h3>
                  <Button className="bg-gradient-to-r from-purple-500 to-pink-500">
                    <Zap className="h-4 w-4 mr-2" />
                    Create Automation
                  </Button>
                </div>

                <div className="space-y-2">
                  {automations.map((automation) => (
                    <div key={automation.id} className="cyber-card p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-lg">{automation.name}</h4>
                          <Badge className={getStatusColor(automation.status)}>
                            {automation.status}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
                          >
                            {automation.trigger}
                          </Badge>
                        </div>
                        <Button size="sm" variant="outline">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-5 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Steps</p>
                          <p className="font-semibold">{automation.steps.length}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Subscribers</p>
                          <p className="font-semibold">
                            {automation.subscribers.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Sent</p>
                          <p className="font-semibold">{automation.sent.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Opens</p>
                          <p className="font-semibold text-blue-400">
                            {automation.performance.opens.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Conversions</p>
                          <p className="font-semibold text-green-400">
                            {automation.performance.conversions.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {automations.length === 0 && (
                    <p className="text-center text-gray-400 py-8">No automations found</p>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <Card className="cyber-card p-6">
              <h3 className="text-xl font-bold mb-6">Campaign Analytics</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <Card className="cyber-card p-4">
                  <p className="text-sm text-gray-400 mb-1">Total Emails Sent</p>
                  <p className="text-3xl font-bold">{analytics?.totalSent.toLocaleString() || 0}</p>
                </Card>
                <Card className="cyber-card p-4">
                  <p className="text-sm text-gray-400 mb-1">Average Open Rate</p>
                  <p className="text-3xl font-bold text-blue-400">
                    {analytics?.avgOpenRate.toFixed(1) || 0}%
                  </p>
                </Card>
                <Card className="cyber-card p-4">
                  <p className="text-sm text-gray-400 mb-1">Average Click Rate</p>
                  <p className="text-3xl font-bold text-cyan-400">
                    {analytics?.avgClickRate.toFixed(1) || 0}%
                  </p>
                </Card>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-semibold">Top Performing Campaigns</h4>
                {analytics?.topPerformingCampaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    className="cyber-card p-4 flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <p className="font-semibold">{campaign.name}</p>
                    </div>
                    <div className="flex gap-6 text-sm">
                      <div>
                        <p className="text-gray-500">Open Rate</p>
                        <p className="font-semibold text-blue-400">
                          {campaign.openRate.toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Click Rate</p>
                        <p className="font-semibold text-cyan-400">
                          {campaign.clickRate.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create Campaign Dialog */}
        <Dialog open={showCreateCampaign} onOpenChange={setShowCreateCampaign}>
          <DialogContent className="cyber-card max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Email Campaign</DialogTitle>
              <DialogDescription>Set up your email campaign</DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                createCampaignMutation.mutate({
                  name: formData.get("name") as string,
                  subject: formData.get("subject") as string,
                  previewText: formData.get("previewText") as string,
                  fromName: formData.get("fromName") as string,
                  fromEmail: formData.get("fromEmail") as string,
                  templateId: formData.get("templateId") as string,
                  status: "draft",
                });
              }}
            >
              <div className="space-y-4 py-4">
                <div>
                  <Label>Campaign Name</Label>
                  <Input name="name" required className="cyber-input" />
                </div>
                <div>
                  <Label>Email Subject</Label>
                  <Input name="subject" required className="cyber-input" />
                </div>
                <div>
                  <Label>Preview Text</Label>
                  <Input name="previewText" className="cyber-input" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>From Name</Label>
                    <Input name="fromName" required className="cyber-input" />
                  </div>
                  <div>
                    <Label>From Email</Label>
                    <Input name="fromEmail" type="email" required className="cyber-input" />
                  </div>
                </div>
                <div>
                  <Label>Email Template</Label>
                  <Select name="templateId" required>
                    <SelectTrigger className="cyber-input">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateCampaign(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create Campaign</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Create Template Dialog */}
        <Dialog open={showCreateTemplate} onOpenChange={setShowCreateTemplate}>
          <DialogContent className="cyber-card max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Email Template</DialogTitle>
              <DialogDescription>Design a new email template</DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                createTemplateMutation.mutate({
                  name: formData.get("name") as string,
                  subject: formData.get("subject") as string,
                  category: formData.get("category") as string,
                  content: formData.get("content") as string,
                });
              }}
            >
              <div className="space-y-4 py-4">
                <div>
                  <Label>Template Name</Label>
                  <Input name="name" required className="cyber-input" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Subject Line</Label>
                    <Input name="subject" required className="cyber-input" />
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Select name="category" required>
                      <SelectTrigger className="cyber-input">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newsletter">Newsletter</SelectItem>
                        <SelectItem value="promotion">Promotion</SelectItem>
                        <SelectItem value="transactional">Transactional</SelectItem>
                        <SelectItem value="announcement">Announcement</SelectItem>
                        <SelectItem value="welcome">Welcome</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Email Content (HTML)</Label>
                  <Textarea
                    name="content"
                    required
                    className="cyber-input h-48"
                    placeholder="<html>...</html>"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateTemplate(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create Template</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Create List Dialog */}
        <Dialog open={showCreateList} onOpenChange={setShowCreateList}>
          <DialogContent className="cyber-card max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Subscriber List</DialogTitle>
              <DialogDescription>Set up a new subscriber list</DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                createListMutation.mutate({
                  name: formData.get("name") as string,
                  description: formData.get("description") as string,
                  tags: (formData.get("tags") as string).split(",").map((t) => t.trim()),
                });
              }}
            >
              <div className="space-y-4 py-4">
                <div>
                  <Label>List Name</Label>
                  <Input name="name" required className="cyber-input" />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea name="description" required className="cyber-input" />
                </div>
                <div>
                  <Label>Tags (comma separated)</Label>
                  <Input name="tags" placeholder="tag1, tag2, tag3" className="cyber-input" />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateList(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create List</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
