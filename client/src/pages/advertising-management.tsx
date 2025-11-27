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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Eye,
  MousePointer,
  DollarSign,
  Play,
  Pause,
  Plus,
  TrendingUp,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AdCampaign {
  id: string;
  title: string;
  description: string;
  type: "banner" | "video" | "sponsored_post" | "creator_promotion";
  status:
    | "draft"
    | "pending"
    | "approved"
    | "active"
    | "paused"
    | "completed"
    | "rejected";
  budget: string;
  dailyBudget: string;
  spend: string;
  impressions: number;
  clicks: number;
  conversions: number;
  startDate: string;
  endDate: string;
  targetAudience: any;
  advertiserId: string;
}

export default function AdvertisingManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<AdCampaign | null>(
    null,
  );
  const queryClient = useQueryClient();

  // Fetch advertising campaigns from API
  const { data: campaigns = [], isLoading } = useQuery<AdCampaign[]>({
    queryKey: ["/api/admin/ad-campaigns"],
    refetchInterval: 30000,
  });

  const { toast } = useToast();

  const createCampaignMutation = useMutation({
    mutationFn: (data: any) =>
      apiRequest("/api/admin/ad-campaigns", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ad-campaigns"] });
      setIsCreateDialogOpen(false);
      toast({ title: "Campaign created successfully" });
    },
  });

  const updateCampaignMutation = useMutation({
    mutationFn: (data: { id: string; updates: any }) =>
      apiRequest(`/api/admin/ad-campaigns/${data.id}`, "PATCH", data.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ad-campaigns"] });
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      "default" | "destructive" | "outline" | "secondary"
    > = {
      draft: "secondary",
      pending: "outline",
      approved: "default",
      active: "default",
      paused: "secondary",
      completed: "default",
      rejected: "destructive",
    };
    const colors = {
      active:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      paused:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      completed:
        "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    };

    return (
      <Badge
        variant={variants[status as keyof typeof variants] || "outline"}
        className={colors[status as keyof typeof colors]}
      >
        {status}
      </Badge>
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Play className="h-4 w-4" />;
      case "creator_promotion":
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <BarChart className="h-4 w-4" />;
    }
  };

  const calculateCTR = (clicks: number, impressions: number) => {
    if (impressions === 0) return "0.00";
    return ((clicks / impressions) * 100).toFixed(2);
  };

  const calculateCPM = (spend: string, impressions: number) => {
    if (impressions === 0) return "0.00";
    return ((parseFloat(spend) / impressions) * 1000).toFixed(2);
  };

  const CampaignForm = ({ campaign, onSubmit, onCancel }: any) => {
    const [formData, setFormData] = useState({
      title: campaign?.title || "",
      description: campaign?.description || "",
      type: campaign?.type || "banner",
      budget: campaign?.budget || "",
      dailyBudget: campaign?.dailyBudget || "",
      startDate: campaign?.startDate || "",
      endDate: campaign?.endDate || "",
      targetAudience: campaign?.targetAudience || {},
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="title">Campaign Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Summer Creator Promotion"
              required
              data-testid="input-campaign-title"
            />
          </div>
          <div>
            <Label htmlFor="type">Campaign Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value) =>
                setFormData({ ...formData, type: value })
              }
            >
              <SelectTrigger data-testid="select-campaign-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="banner">Banner Ad</SelectItem>
                <SelectItem value="video">Video Ad</SelectItem>
                <SelectItem value="sponsored_post">Sponsored Post</SelectItem>
                <SelectItem value="creator_promotion">
                  Creator Promotion
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Campaign description and objectives..."
            data-testid="textarea-campaign-description"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="budget">Total Budget ($)</Label>
            <Input
              id="budget"
              type="number"
              min="1"
              value={formData.budget}
              onChange={(e) =>
                setFormData({ ...formData, budget: e.target.value })
              }
              placeholder="1000.00"
              required
              data-testid="input-campaign-budget"
            />
          </div>
          <div>
            <Label htmlFor="dailyBudget">Daily Budget ($)</Label>
            <Input
              id="dailyBudget"
              type="number"
              min="1"
              value={formData.dailyBudget}
              onChange={(e) =>
                setFormData({ ...formData, dailyBudget: e.target.value })
              }
              placeholder="50.00"
              data-testid="input-daily-budget"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="datetime-local"
              value={formData.startDate}
              onChange={(e) =>
                setFormData({ ...formData, startDate: e.target.value })
              }
              required
              data-testid="input-start-date"
            />
          </div>
          <div>
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="datetime-local"
              value={formData.endDate}
              onChange={(e) =>
                setFormData({ ...formData, endDate: e.target.value })
              }
              required
              data-testid="input-end-date"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" data-testid="button-save-campaign">
            {campaign ? "Update" : "Create"} Campaign
          </Button>
        </div>
      </form>
    );
  };

  const activeCampaigns = campaigns.filter(
    (c: AdCampaign) => c.status === "active",
  );
  const totalSpend = campaigns.reduce(
    (sum: number, c: AdCampaign) => sum + parseFloat(c.spend || "0"),
    0,
  );
  const totalImpressions = campaigns.reduce(
    (sum: number, c: AdCampaign) => sum + c.impressions,
    0,
  );
  const totalClicks = campaigns.reduce(
    (sum: number, c: AdCampaign) => sum + c.clicks,
    0,
  );

  return (
    <div
      className="container mx-auto p-6 space-y-6"
      data-testid="advertising-management"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Advertising Management</h1>
          <p className="text-muted-foreground">
            Manage ad campaigns, creator promotions, and platform advertising
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-campaign">
              <Plus className="h-4 w-4 mr-2" />
              Create Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Ad Campaign</DialogTitle>
              <DialogDescription>
                Launch a new advertising campaign or creator promotion
              </DialogDescription>
            </DialogHeader>
            <CampaignForm
              onSubmit={(data: any) => createCampaignMutation.mutate(data)}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Campaigns
            </CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCampaigns.length}</div>
            <p className="text-xs text-muted-foreground">Running now</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSpend.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Across all campaigns
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Impressions</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalImpressions.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Total views</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {calculateCTR(totalClicks, totalImpressions)}%
            </div>
            <p className="text-xs text-muted-foreground">Average CTR</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="campaigns" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="campaigns">
            All Campaigns ({campaigns.length})
          </TabsTrigger>
          <TabsTrigger value="active">
            Active ({activeCampaigns.length})
          </TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Advertising Campaigns</CardTitle>
              <CardDescription>
                Manage all advertising campaigns and promotional content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Spend</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((campaign: AdCampaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{campaign.title}</span>
                          <span className="text-sm text-muted-foreground">
                            {campaign.description?.substring(0, 50)}...
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {getTypeIcon(campaign.type)}
                          <span className="ml-2 capitalize">
                            {campaign.type.replace("_", " ")}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            ${campaign.budget}
                          </span>
                          {campaign.dailyBudget && (
                            <span className="text-sm text-muted-foreground">
                              ${campaign.dailyBudget}/day
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">${campaign.spend}</span>
                          <Progress
                            value={
                              (parseFloat(campaign.spend) /
                                parseFloat(campaign.budget)) *
                              100
                            }
                            className="w-16 h-2 mt-1"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col text-sm">
                          <span>
                            {campaign.impressions.toLocaleString()} views
                          </span>
                          <span>{campaign.clicks} clicks</span>
                          <span className="text-muted-foreground">
                            CTR:{" "}
                            {calculateCTR(
                              campaign.clicks,
                              campaign.impressions,
                            )}
                            %
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          {campaign.status === "active" ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                updateCampaignMutation.mutate({
                                  id: campaign.id,
                                  updates: { status: "paused" },
                                })
                              }
                              data-testid={`button-pause-${campaign.id}`}
                            >
                              <Pause className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                updateCampaignMutation.mutate({
                                  id: campaign.id,
                                  updates: { status: "active" },
                                })
                              }
                              data-testid={`button-play-${campaign.id}`}
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedCampaign(campaign)}
                            data-testid={`button-view-${campaign.id}`}
                          >
                            View
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <div className="grid gap-4">
            {activeCampaigns.map((campaign: AdCampaign) => (
              <Card key={campaign.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      {getTypeIcon(campaign.type)}
                      <span className="ml-2">{campaign.title}</span>
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(campaign.status)}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          updateCampaignMutation.mutate({
                            id: campaign.id,
                            updates: { status: "paused" },
                          })
                        }
                      >
                        <Pause className="h-4 w-4 mr-1" />
                        Pause
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Budget Progress
                      </p>
                      <Progress
                        value={
                          (parseFloat(campaign.spend) /
                            parseFloat(campaign.budget)) *
                          100
                        }
                        className="mt-2"
                      />
                      <p className="text-sm mt-1">
                        ${campaign.spend} / ${campaign.budget}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Impressions
                      </p>
                      <p className="text-2xl font-bold">
                        {campaign.impressions.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Clicks</p>
                      <p className="text-2xl font-bold">{campaign.clicks}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">CTR</p>
                      <p className="text-2xl font-bold">
                        {calculateCTR(campaign.clicks, campaign.impressions)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Analytics</CardTitle>
              <CardDescription>
                Performance metrics and insights across all campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <h3 className="font-medium">Cost Per Mille (CPM)</h3>
                  <p className="text-2xl font-bold">
                    $
                    {totalImpressions > 0
                      ? calculateCPM(totalSpend.toString(), totalImpressions)
                      : "0.00"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Average cost per 1,000 impressions
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">Cost Per Click (CPC)</h3>
                  <p className="text-2xl font-bold">
                    $
                    {totalClicks > 0
                      ? (totalSpend / totalClicks).toFixed(2)
                      : "0.00"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Average cost per click
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">Conversion Rate</h3>
                  <p className="text-2xl font-bold">
                    {totalClicks > 0
                      ? (
                          (campaigns.reduce(
                            (sum: number, c: AdCampaign) => sum + c.conversions,
                            0,
                          ) /
                            totalClicks) *
                          100
                        ).toFixed(2)
                      : "0.00"}
                    %
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Clicks that converted
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
