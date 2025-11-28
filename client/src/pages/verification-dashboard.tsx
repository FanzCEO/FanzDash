import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Shield,
  UserCheck,
  Users,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  FileText,
  Download,
  TrendingUp,
} from "lucide-react";
import { SEOHeadTags } from "@/components/SEOHeadTags";

interface VerificationStats {
  pendingReviews: number;
  approvedToday: number;
  rejectedToday: number;
  totalVerified: number;
  totalCreators?: number;
}

interface Verification {
  id: string;
  type: 'costar' | 'creator';
  fullLegalName?: string;
  legalName?: string;
  stageName?: string;
  emailAddress?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  approvedBy?: string;
  rejectedBy?: string;
  verificationLevel?: string;
  rejectionReason?: string;
}

export default function VerificationDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedVerification, setSelectedVerification] = useState<Verification | null>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [verificationLevel, setVerificationLevel] = useState("full_compliance");

  // Fetch Co-Star verification stats
  const { data: costarStats } = useQuery<VerificationStats>({
    queryKey: ["/api/costar-verification/stats"],
    refetchInterval: 30000,
  });

  // Fetch Creator verification stats
  const { data: creatorStats } = useQuery<VerificationStats>({
    queryKey: ["/api/creator-verification/stats"],
    refetchInterval: 30000,
  });

  // Fetch Co-Star verifications
  const { data: costarVerifications = [] } = useQuery<Verification[]>({
    queryKey: ["/api/costar-verification", statusFilter],
    queryFn: async () => {
      const response = await apiRequest(`/api/costar-verification?status=${statusFilter}`, "GET");
      return (response.verifications || []).map((v: any) => ({ ...v, type: 'costar' as const }));
    },
    refetchInterval: 10000,
  });

  // Fetch Creator verifications
  const { data: creatorVerifications = [] } = useQuery<Verification[]>({
    queryKey: ["/api/creator-verification", statusFilter],
    queryFn: async () => {
      const response = await apiRequest(`/api/creator-verification?status=${statusFilter}`, "GET");
      return (response.verifications || []).map((v: any) => ({ ...v, type: 'creator' as const }));
    },
    refetchInterval: 10000,
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: async ({ id, type }: { id: string; type: 'costar' | 'creator' }) => {
      const endpoint = type === 'costar'
        ? `/api/costar-verification/${id}/approve`
        : `/api/creator-verification/${id}/approve`;

      return apiRequest(endpoint, "PATCH", {
        notes: reviewNotes,
        verificationLevel: type === 'creator' ? verificationLevel : undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/costar-verification"] });
      queryClient.invalidateQueries({ queryKey: ["/api/creator-verification"] });
      queryClient.invalidateQueries({ queryKey: ["/api/costar-verification/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/creator-verification/stats"] });
      toast({
        title: "Verification Approved",
        description: "The verification has been approved successfully.",
      });
      setShowReviewDialog(false);
      setSelectedVerification(null);
      setReviewNotes("");
    },
    onError: (error: Error) => {
      toast({
        title: "Approval Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: async ({ id, type, reason }: { id: string; type: 'costar' | 'creator'; reason: string }) => {
      const endpoint = type === 'costar'
        ? `/api/costar-verification/${id}/reject`
        : `/api/creator-verification/${id}/reject`;

      return apiRequest(endpoint, "PATCH", {
        reason,
        detailedFeedback: reviewNotes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/costar-verification"] });
      queryClient.invalidateQueries({ queryKey: ["/api/creator-verification"] });
      queryClient.invalidateQueries({ queryKey: ["/api/costar-verification/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/creator-verification/stats"] });
      toast({
        title: "Verification Rejected",
        description: "The verification has been rejected.",
        variant: "destructive",
      });
      setShowReviewDialog(false);
      setSelectedVerification(null);
      setReviewNotes("");
    },
    onError: (error: Error) => {
      toast({
        title: "Rejection Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleReview = (verification: Verification, action: 'approve' | 'reject') => {
    setSelectedVerification(verification);
    setReviewAction(action);
    setShowReviewDialog(true);
  };

  const handleSubmitReview = () => {
    if (!selectedVerification) return;

    if (reviewAction === 'approve') {
      approveMutation.mutate({
        id: selectedVerification.id,
        type: selectedVerification.type,
      });
    } else if (reviewAction === 'reject') {
      if (!reviewNotes.trim()) {
        toast({
          title: "Rejection Reason Required",
          description: "Please provide a reason for rejection.",
          variant: "destructive",
        });
        return;
      }
      rejectMutation.mutate({
        id: selectedVerification.id,
        type: selectedVerification.type,
        reason: reviewNotes,
      });
    }
  };

  const allVerifications = [...costarVerifications, ...creatorVerifications].filter((v) => {
    if (statusFilter !== 'all' && v.status !== statusFilter) return false;
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const name = v.fullLegalName || v.legalName || '';
      const stageName = v.stageName || '';
      const email = v.emailAddress || '';
      return name.toLowerCase().includes(searchLower) ||
             stageName.toLowerCase().includes(searchLower) ||
             email.toLowerCase().includes(searchLower);
    }
    return true;
  }).sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500/20 text-green-400">Approved</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500/20 text-yellow-400">Pending</Badge>;
      case "rejected":
        return <Badge className="bg-red-500/20 text-red-400">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: 'costar' | 'creator') => {
    return type === 'creator' ? (
      <Badge variant="outline" className="border-cyan-500 text-cyan-400">
        <Shield className="w-3 h-3 mr-1" />
        Creator
      </Badge>
    ) : (
      <Badge variant="outline" className="border-purple-500 text-purple-400">
        <Users className="w-3 h-3 mr-1" />
        Co-Star
      </Badge>
    );
  };

  const totalPending = (costarStats?.pendingReviews || 0) + (creatorStats?.pendingReviews || 0);
  const totalApprovedToday = (costarStats?.approvedToday || 0) + (creatorStats?.approvedToday || 0);
  const totalRejectedToday = (costarStats?.rejectedToday || 0) + (creatorStats?.rejectedToday || 0);
  const totalVerified = (costarStats?.totalVerified || 0) + (creatorStats?.totalVerified || 0);

  return (
    <div className="min-h-screen cyber-bg p-6">
      <SEOHeadTags
        title="Verification Dashboard - FANZ™ 2257 Compliance"
        description="Manage content creator and co-star verification requests"
        canonicalUrl="https://fanzdash.com/verification-dashboard"
      />

      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold cyber-text-glow flex items-center gap-3">
              <Shield className="w-10 h-10 text-cyan-400" />
              2257 Verification Dashboard
            </h1>
            <p className="text-gray-400 mt-2">
              FANZ™ Group Holdings LLC - Compliance Officer Portal
            </p>
          </div>
          <Button variant="outline" className="border-cyan-500">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="cyber-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Pending Reviews</p>
                  <p className="text-3xl font-bold cyber-text-glow">{totalPending}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {costarStats?.pendingReviews || 0} Co-Star | {creatorStats?.pendingReviews || 0} Creator
                  </p>
                </div>
                <Clock className="w-10 h-10 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="cyber-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Approved Today</p>
                  <p className="text-3xl font-bold text-green-400">{totalApprovedToday}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {costarStats?.approvedToday || 0} Co-Star | {creatorStats?.approvedToday || 0} Creator
                  </p>
                </div>
                <CheckCircle className="w-10 h-10 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="cyber-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Rejected Today</p>
                  <p className="text-3xl font-bold text-red-400">{totalRejectedToday}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {costarStats?.rejectedToday || 0} Co-Star | {creatorStats?.rejectedToday || 0} Creator
                  </p>
                </div>
                <XCircle className="w-10 h-10 text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="cyber-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Verified</p>
                  <p className="text-3xl font-bold text-cyan-400">{totalVerified}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    All-time verifications
                  </p>
                </div>
                <UserCheck className="w-10 h-10 text-cyan-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="cyber-card">
            <TabsTrigger value="overview">All Verifications</TabsTrigger>
            <TabsTrigger value="creators">Content Creators</TabsTrigger>
            <TabsTrigger value="costars">Co-Stars</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card className="cyber-card">
              <CardHeader>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <CardTitle>All Verification Requests</CardTitle>
                    <CardDescription>Review and manage content creator and co-star verifications</CardDescription>
                  </div>
                  <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="cyber-input pl-10"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="cyber-input w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allVerifications.map((verification) => (
                      <TableRow key={`${verification.type}-${verification.id}`}>
                        <TableCell>{getTypeBadge(verification.type)}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{verification.fullLegalName || verification.legalName}</p>
                            {verification.stageName && (
                              <p className="text-xs text-gray-400">({verification.stageName})</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-400">
                          {verification.emailAddress || '-'}
                        </TableCell>
                        <TableCell>{getStatusBadge(verification.status)}</TableCell>
                        <TableCell className="text-sm text-gray-400">
                          {new Date(verification.submittedAt).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                // TODO: Show detailed view
                                toast({ title: "Feature coming soon", description: "Detailed view" });
                              }}
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </Button>
                            {verification.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() => handleReview(verification, 'approve')}
                                >
                                  <CheckCircle className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleReview(verification, 'reject')}
                                >
                                  <XCircle className="w-3 h-3" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {allVerifications.length === 0 && (
                  <p className="text-center text-gray-400 py-8">No verification requests found</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="creators" className="space-y-4">
            <Card className="cyber-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-cyan-400" />
                  Content Creator Verifications
                </CardTitle>
                <CardDescription>Primary creator identity verification + 2257 compliance</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-400">
                  Total Creators: {creatorStats?.totalCreators || 0} |
                  Pending: {creatorStats?.pendingReviews || 0} |
                  Verified: {creatorStats?.totalVerified || 0}
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="costars" className="space-y-4">
            <Card className="cyber-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-400" />
                  Co-Star Verifications
                </CardTitle>
                <CardDescription>Adult co-star model release + 2257 compliance</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-400">
                  Pending: {costarStats?.pendingReviews || 0} |
                  Verified: {costarStats?.totalVerified || 0}
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card className="cyber-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-cyan-400" />
                  Verification Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-400">Analytics dashboard coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Review Dialog */}
        <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
          <DialogContent className="cyber-card max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {reviewAction === 'approve' ? 'Approve' : 'Reject'} Verification
              </DialogTitle>
              <DialogDescription>
                {selectedVerification && (
                  <>
                    {getTypeBadge(selectedVerification.type)} - {selectedVerification.fullLegalName || selectedVerification.legalName}
                  </>
                )}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {reviewAction === 'approve' && selectedVerification?.type === 'creator' && (
                <div className="space-y-2">
                  <Label>Verification Level</Label>
                  <Select value={verificationLevel} onValueChange={setVerificationLevel}>
                    <SelectTrigger className="cyber-input">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic - Identity verified</SelectItem>
                      <SelectItem value="enhanced">Enhanced - With biometrics</SelectItem>
                      <SelectItem value="full_compliance">Full Compliance - All documents + 2257</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label>{reviewAction === 'approve' ? 'Notes (Optional)' : 'Rejection Reason *'}</Label>
                <Textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder={
                    reviewAction === 'approve'
                      ? "Add any notes about this verification..."
                      : "Explain why this verification is being rejected..."
                  }
                  className="cyber-input min-h-[100px]"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowReviewDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmitReview}
                className={
                  reviewAction === 'approve'
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }
                disabled={approveMutation.isPending || rejectMutation.isPending}
              >
                {reviewAction === 'approve' ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve Verification
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject Verification
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
