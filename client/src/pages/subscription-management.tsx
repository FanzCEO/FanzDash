import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  CreditCard,
  Search,
  Plus,
  Edit,
  Trash2,
  Users,
  DollarSign,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { SEOHeadTags } from "@/components/SEOHeadTags";

export default function SubscriptionManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch subscription stats
  const { data: subscriptionStats } = useQuery({
    queryKey: ["/api/subscriptions/stats"],
    refetchInterval: 30000,
  });

  // Fetch subscription plans
  const { data: subscriptionPlans = [], isLoading } = useQuery({
    queryKey: ["/api/subscriptions/plans"],
    refetchInterval: 60000,
  });

  // Fetch recent subscribers
  const { data: recentSubscribers = [] } = useQuery({
    queryKey: ["/api/subscriptions/recent", statusFilter],
    refetchInterval: 10000,
  });

  // Create plan mutation
  const createPlanMutation = useMutation({
    mutationFn: (planData: any) =>
      apiRequest("/api/subscriptions/plans", "POST", planData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions/plans"] });
      toast({
        title: "Plan Created",
        description: "Subscription plan created successfully",
      });
    },
  });

  // Edit plan mutation
  const editPlanMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiRequest(`/api/subscriptions/plans/${id}`, "PUT", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions/plans"] });
      toast({
        title: "Plan Updated",
        description: "Subscription plan updated successfully",
      });
    },
  });

  // Delete plan mutation
  const deletePlanMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/api/subscriptions/plans/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions/plans"] });
      toast({
        title: "Plan Deleted",
        description: "Subscription plan deleted successfully",
        variant: "destructive",
      });
    },
  });

  const handleCreatePlan = () => {
    toast({
      title: "Create Plan",
      description: "Plan creation form opened",
    });
  };

  const handleEditPlan = (planId: string) => {
    toast({
      title: "Edit Plan",
      description: `Opening editor for plan ${planId}`,
    });
  };

  const handleDeletePlan = (planId: string) => {
    deletePlanMutation.mutate(planId);
  };

  const handleManageSubscription = (subscriptionId: string) => {
    toast({
      title: "Manage Subscription",
      description: `Opening management for ${subscriptionId}`,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/20 text-green-400">Active</Badge>;
      case "cancelled":
        return <Badge className="bg-red-500/20 text-red-400">Cancelled</Badge>;
      case "paused":
        return (
          <Badge className="bg-yellow-500/20 text-yellow-400">Paused</Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen p-6 cyber-bg">
      <SEOHeadTags
        title="Subscription Management - FanzDash"
        description="Manage creator subscription plans and subscriber relationships"
        canonicalUrl="https://fanzdash.com/subscription-management"
      />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold cyber-text-glow">
              Subscription Management
            </h1>
            <p className="text-muted-foreground">Creator subscription plans</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="cyber-button">
                <Plus className="w-4 h-4 mr-2" />
                Create Plan
              </Button>
            </DialogTrigger>
            <DialogContent className="cyber-border">
              <DialogHeader>
                <DialogTitle>Create Subscription Plan</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input placeholder="Plan name" className="glass-effect" />
                <Input
                  placeholder="Price"
                  type="number"
                  className="glass-effect"
                />
                <Select>
                  <SelectTrigger className="glass-effect">
                    <SelectValue placeholder="Billing interval" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
                <Button className="w-full cyber-button">Create Plan</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="cyber-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Active Subscriptions
                  </p>
                  <p className="text-2xl font-bold cyber-text-glow">
                    {(subscriptionStats?.activeSubscriptions ?? 0).toLocaleString()}
                  </p>
                </div>
                <Users className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="cyber-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Subscriptions
                  </p>
                  <p className="text-2xl font-bold text-blue-400">
                    {(subscriptionStats?.totalSubscriptions ?? 0).toLocaleString()}
                  </p>
                </div>
                <CreditCard className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="cyber-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Monthly Revenue
                  </p>
                  <p className="text-2xl font-bold text-green-400">
                    ${(subscriptionStats?.monthlyRevenue ?? 0).toLocaleString()}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="cyber-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Value</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    ${subscriptionStats?.avgSubscriptionValue ?? 0}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subscription Plans */}
        <Card className="cyber-border">
          <CardHeader>
            <CardTitle>Subscription Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {subscriptionPlans.map((plan) => (
                <Card key={plan.id} className="cyber-border">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{plan.name}</CardTitle>
                      {getStatusBadge(plan.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-center">
                        <p className="text-3xl font-bold cyber-text-glow">
                          ${plan.price}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          per {plan.interval}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Subscribers:
                          </span>
                          <span>{plan.subscribers.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Revenue:
                          </span>
                          <span className="text-green-400">
                            ${plan.revenue.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2">
                        <p className="text-sm font-medium mb-2">Features:</p>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          {plan.features.map((feature, index) => (
                            <li key={index}>• {feature}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleEditPlan(plan.id)}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-red-400 hover:text-red-300"
                          onClick={() => handleDeletePlan(plan.id)}
                          disabled={deletePlanMutation.isPending}
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Subscribers */}
        <Card className="cyber-border">
          <CardHeader>
            <CardTitle>Recent Subscribers</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subscription ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Next Billing</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentSubscribers.map((subscription) => (
                  <TableRow key={subscription.id}>
                    <TableCell className="font-mono text-sm">
                      {subscription.id}
                    </TableCell>
                    <TableCell>{subscription.user}</TableCell>
                    <TableCell>{subscription.plan}</TableCell>
                    <TableCell className="font-bold">
                      ${subscription.amount}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(subscription.startDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(subscription.nextBilling).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{getStatusBadge(subscription.status)}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleManageSubscription(subscription.id)}
                      >
                        Manage
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
