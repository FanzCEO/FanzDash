import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Users, DollarSign, TrendingUp, Eye, Star, CheckCircle, XCircle, AlertTriangle, Crown, Award, Video, Image, MessageSquare, Heart, Share2, BarChart3, Search } from "lucide-react";

// TypeScript Interfaces
interface CreatorStats {
  totalCreators: number;
  verifiedCreators: number;
  pendingVerification: number;
  totalRevenue: number;
  totalSubscribers: number;
  averageRevenue: number;
  topEarningCreator: string;
  platforms: {
    name: string;
    creators: number;
    revenue: number;
  }[];
}

interface Creator {
  id: string;
  username: string;
  email: string;
  fullName: string;
  platforms: string[];
  verified: boolean;
  verificationDate?: string;
  status: "active" | "pending" | "suspended" | "banned";
  tier: "starter" | "rising" | "pro" | "elite" | "superstar";
  subscribers: number;
  totalRevenue: number;
  monthlyRevenue: number;
  contentCount: {
    photos: number;
    videos: number;
    posts: number;
  };
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
  };
  payoutMethod: string;
  payoutSchedule: string;
  lastPayout: string;
  nextPayout: string;
  joinedDate: string;
  rating: number;
  bio?: string;
  story?: string;
  socialMedia?: {
    twitter?: string;
    instagram?: string;
    tiktok?: string;
  };
}

interface VerificationRequest {
  id: string;
  creatorId: string;
  username: string;
  email: string;
  submittedAt: string;
  documents: {
    governmentId: string;
    selfie: string;
    proofOfAddress?: string;
  };
  status: "pending" | "reviewing" | "approved" | "rejected";
  reviewedBy?: string;
  reviewedAt?: string;
  notes?: string;
}

interface CreatorPayout {
  id: string;
  creatorId: string;
  username: string;
  amount: number;
  currency: string;
  method: string;
  status: "pending" | "processing" | "completed" | "failed";
  scheduledDate: string;
  processedDate?: string;
  transactionId?: string;
  fee: number;
  netAmount: number;
}

interface ContentReport {
  id: string;
  contentType: "photo" | "video" | "post" | "livestream";
  contentId: string;
  creatorId: string;
  creatorUsername: string;
  platform: string;
  reason: string;
  reportedBy: string;
  reportedAt: string;
  status: "pending" | "reviewed" | "actioned" | "dismissed";
  action?: string;
}

export default function CreatorManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("overview");
  const [statusFilter, setStatusFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [isCreatorDialogOpen, setIsCreatorDialogOpen] = useState(false);

  // Fetch creator statistics
  const { data: creatorStats } = useQuery<CreatorStats>({
    queryKey: ["/api/creators/stats"],
    refetchInterval: 30000,
  });

  // Fetch all creators
  const { data: creators = [], isLoading: creatorsLoading } = useQuery<Creator[]>({
    queryKey: ["/api/creators", statusFilter, platformFilter, searchQuery],
    refetchInterval: 30000,
  });

  // Fetch verification requests
  const { data: verificationRequests = [] } = useQuery<VerificationRequest[]>({
    queryKey: ["/api/creators/verification-requests"],
    refetchInterval: 20000,
  });

  // Fetch pending payouts
  const { data: pendingPayouts = [] } = useQuery<CreatorPayout[]>({
    queryKey: ["/api/creators/payouts/pending"],
    refetchInterval: 60000,
  });

  // Fetch content reports
  const { data: contentReports = [] } = useQuery<ContentReport[]>({
    queryKey: ["/api/creators/content-reports"],
    refetchInterval: 30000,
  });

  // Verify creator mutation
  const verifyCreatorMutation = useMutation({
    mutationFn: ({ requestId, approved, notes }: { requestId: string; approved: boolean; notes?: string }) =>
      apiRequest(`/api/creators/verification-requests/${requestId}/review`, "POST", { approved, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/creators/verification-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/creators"] });
      queryClient.invalidateQueries({ queryKey: ["/api/creators/stats"] });
      toast({ title: "Verification reviewed", description: "Creator verification has been processed" });
    },
  });

  // Suspend creator mutation
  const suspendCreatorMutation = useMutation({
    mutationFn: ({ creatorId, reason }: { creatorId: string; reason: string }) =>
      apiRequest(`/api/creators/${creatorId}/suspend`, "POST", { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/creators"] });
      toast({ title: "Creator suspended", description: "Creator account has been suspended" });
    },
  });

  // Process payout mutation
  const processPayoutMutation = useMutation({
    mutationFn: (payoutId: string) =>
      apiRequest(`/api/creators/payouts/${payoutId}/process`, "POST"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/creators/payouts/pending"] });
      toast({ title: "Payout processed", description: "Creator payout has been initiated" });
    },
  });

  const getTierBadge = (tier: Creator["tier"]) => {
    const badges = {
      starter: <Badge variant="outline">Starter</Badge>,
      rising: <Badge variant="secondary">Rising Star</Badge>,
      pro: <Badge variant="default">Pro</Badge>,
      elite: <Badge variant="default" className="bg-purple-500">Elite</Badge>,
      superstar: <Badge variant="default" className="bg-gradient-to-r from-yellow-400 to-orange-500"><Crown className="w-3 h-3 mr-1" />Superstar</Badge>,
    };
    return badges[tier];
  };

  const getStatusBadge = (status: Creator["status"]) => {
    const badges = {
      active: <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>,
      pending: <Badge variant="secondary">Pending</Badge>,
      suspended: <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Suspended</Badge>,
      banned: <Badge variant="destructive">Banned</Badge>,
    };
    return badges[status];
  };

  const PLATFORMS = ["FanzMoney", "BoyFanz", "GayFanz", "BearFanz", "CougarFanz", "PupFanz", "DLBroz", "FanzTube", "Guyz", "FanzClips"];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="w-8 h-8" />
            Creator Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage content creators across all FANZ platforms
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </Button>
          <Button>
            <DollarSign className="w-4 h-4 mr-2" />
            Process Payouts
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Creators</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{creatorStats?.totalCreators?.toLocaleString() ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {creatorStats?.verifiedCreators?.toLocaleString() ?? 0} verified
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${creatorStats?.totalRevenue?.toLocaleString() ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Avg: ${creatorStats?.averageRevenue?.toLocaleString() ?? 0}/creator
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
            <Heart className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{creatorStats?.totalSubscribers?.toLocaleString() ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all platforms
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <AlertTriangle className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{creatorStats?.pendingVerification?.toLocaleString() ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Verification requests
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Platform Overview */}
      {creatorStats?.platforms && creatorStats.platforms.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Platform Overview</CardTitle>
            <CardDescription>Creator metrics by platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {creatorStats.platforms.map((platform) => (
                <div key={platform.name} className="p-3 border rounded-lg">
                  <div className="font-medium text-sm">{platform.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {platform.creators.toLocaleString()} creators
                  </div>
                  <div className="text-sm font-semibold mt-2 text-green-600">
                    ${platform.revenue.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">All Creators</TabsTrigger>
          <TabsTrigger value="verification">Verification</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
          <TabsTrigger value="reports">Content Reports</TabsTrigger>
        </TabsList>

        {/* All Creators Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Creator Directory</CardTitle>
                  <CardDescription>Browse and manage all creators</CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search creators..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 w-64"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={platformFilter} onValueChange={setPlatformFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Platforms</SelectItem>
                      {PLATFORMS.map(p => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {creatorsLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading creators...</div>
              ) : creators.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No creators found</div>
              ) : (
                <div className="space-y-4">
                  {creators.map((creator) => (
                    <div key={creator.id} className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                              <Users className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <div className="font-semibold">{creator.username}</div>
                                {creator.verified && (
                                  <CheckCircle className="w-4 h-4 text-blue-500" />
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground">{creator.email}</div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                            <div>
                              <span className="text-muted-foreground">Subscribers:</span>
                              <span className="ml-2 font-medium">{creator.subscribers.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Revenue:</span>
                              <span className="ml-2 font-medium text-green-600">${creator.totalRevenue.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Content:</span>
                              <span className="ml-2 font-medium">{(creator.contentCount.photos + creator.contentCount.videos + creator.contentCount.posts).toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Rating:</span>
                              <span className="ml-2 font-medium flex items-center gap-1">
                                <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                                {creator.rating.toFixed(1)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-3">
                            {getStatusBadge(creator.status)}
                            {getTierBadge(creator.tier)}
                            <Badge variant="outline">{creator.platforms.length} platforms</Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedCreator(creator);
                              setIsCreatorDialogOpen(true);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          {creator.status === "active" && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                const reason = prompt("Enter suspension reason:");
                                if (reason) {
                                  suspendCreatorMutation.mutate({ creatorId: creator.id, reason });
                                }
                              }}
                            >
                              Suspend
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Verification Tab */}
        <TabsContent value="verification" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Verification Requests</CardTitle>
              <CardDescription>Review creator verification submissions</CardDescription>
            </CardHeader>
            <CardContent>
              {verificationRequests.filter(r => r.status === "pending").length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No pending verifications</div>
              ) : (
                <div className="space-y-4">
                  {verificationRequests.filter(r => r.status === "pending").map((request) => (
                    <div key={request.id} className="p-4 border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-semibold">{request.username}</div>
                          <div className="text-sm text-muted-foreground">{request.email}</div>
                          <div className="text-sm text-muted-foreground mt-2">
                            Submitted: {new Date(request.submittedAt).toLocaleString()}
                          </div>
                          <div className="flex gap-2 mt-3">
                            <Badge variant="outline">Gov ID</Badge>
                            <Badge variant="outline">Selfie</Badge>
                            {request.documents.proofOfAddress && (
                              <Badge variant="outline">Proof of Address</Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              const notes = prompt("Enter rejection reason:");
                              if (notes) {
                                verifyCreatorMutation.mutate({ requestId: request.id, approved: false, notes });
                              }
                            }}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => {
                              if (confirm("Approve this creator verification?")) {
                                verifyCreatorMutation.mutate({ requestId: request.id, approved: true });
                              }
                            }}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payouts Tab */}
        <TabsContent value="payouts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Payouts</CardTitle>
              <CardDescription>Review and process creator payouts</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingPayouts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No pending payouts</div>
              ) : (
                <div className="space-y-3">
                  {pendingPayouts.map((payout) => (
                    <div key={payout.id} className="p-4 border rounded-lg flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-semibold">{payout.username}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Method: {payout.method} • Scheduled: {new Date(payout.scheduledDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span>
                            <span className="text-muted-foreground">Amount:</span>
                            <span className="ml-2 font-semibold text-green-600">${payout.amount.toLocaleString()}</span>
                          </span>
                          <span>
                            <span className="text-muted-foreground">Fee:</span>
                            <span className="ml-2 font-medium">${payout.fee.toLocaleString()}</span>
                          </span>
                          <span>
                            <span className="text-muted-foreground">Net:</span>
                            <span className="ml-2 font-semibold">${payout.netAmount.toLocaleString()}</span>
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => {
                          if (confirm(`Process payout of $${payout.netAmount} to ${payout.username}?`)) {
                            processPayoutMutation.mutate(payout.id);
                          }
                        }}
                      >
                        <DollarSign className="w-4 h-4 mr-1" />
                        Process
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Reports</CardTitle>
              <CardDescription>Review reported creator content</CardDescription>
            </CardHeader>
            <CardContent>
              {contentReports.filter(r => r.status === "pending").length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No pending reports</div>
              ) : (
                <div className="space-y-3">
                  {contentReports.filter(r => r.status === "pending").map((report) => (
                    <div key={report.id} className="p-4 border-l-4 border-l-red-500 bg-red-50 dark:bg-red-950/20 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="destructive">{report.contentType}</Badge>
                            <Badge variant="outline">{report.platform}</Badge>
                          </div>
                          <div className="text-sm mt-2">
                            <span className="font-medium">Creator:</span> {report.creatorUsername}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Reason:</span> {report.reason}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Reported by {report.reportedBy} on {new Date(report.reportedAt).toLocaleString()}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            View Content
                          </Button>
                          <Button variant="destructive" size="sm">
                            Take Action
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Creator Details Dialog */}
      <Dialog open={isCreatorDialogOpen} onOpenChange={setIsCreatorDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Creator Details</DialogTitle>
            <DialogDescription>Complete creator profile and statistics</DialogDescription>
          </DialogHeader>
          {selectedCreator && (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="w-10 h-10 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-semibold">{selectedCreator.username}</h3>
                    {selectedCreator.verified && <CheckCircle className="w-5 h-5 text-blue-500" />}
                  </div>
                  <div className="text-sm text-muted-foreground">{selectedCreator.email}</div>
                  <div className="flex items-center gap-2 mt-2">
                    {getStatusBadge(selectedCreator.status)}
                    {getTierBadge(selectedCreator.tier)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Subscribers</Label>
                  <div className="font-semibold">{selectedCreator.subscribers.toLocaleString()}</div>
                </div>
                <div>
                  <Label>Total Revenue</Label>
                  <div className="font-semibold text-green-600">${selectedCreator.totalRevenue.toLocaleString()}</div>
                </div>
                <div>
                  <Label>Monthly Revenue</Label>
                  <div className="font-semibold">${selectedCreator.monthlyRevenue.toLocaleString()}</div>
                </div>
                <div>
                  <Label>Rating</Label>
                  <div className="font-semibold flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    {selectedCreator.rating.toFixed(1)}/5.0
                  </div>
                </div>
              </div>

              <div>
                <Label>Content Statistics</Label>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  <div className="p-3 border rounded-lg">
                    <Image className="w-5 h-5 text-muted-foreground mb-1" />
                    <div className="font-semibold">{selectedCreator.contentCount.photos.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Photos</div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <Video className="w-5 h-5 text-muted-foreground mb-1" />
                    <div className="font-semibold">{selectedCreator.contentCount.videos.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Videos</div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <MessageSquare className="w-5 h-5 text-muted-foreground mb-1" />
                    <div className="font-semibold">{selectedCreator.contentCount.posts.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Posts</div>
                  </div>
                </div>
              </div>

              <div>
                <Label>Engagement</Label>
                <div className="grid grid-cols-4 gap-4 mt-2">
                  <div>
                    <div className="text-sm text-muted-foreground">Likes</div>
                    <div className="font-semibold">{selectedCreator.engagement.likes.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Comments</div>
                    <div className="font-semibold">{selectedCreator.engagement.comments.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Shares</div>
                    <div className="font-semibold">{selectedCreator.engagement.shares.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Views</div>
                    <div className="font-semibold">{selectedCreator.engagement.views.toLocaleString()}</div>
                  </div>
                </div>
              </div>

              <div>
                <Label>Platforms</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedCreator.platforms.map(p => (
                    <Badge key={p} variant="secondary">{p}</Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreatorDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
