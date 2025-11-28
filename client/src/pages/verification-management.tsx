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
  UserCheck,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  FileText,
} from "lucide-react";
import { SEOHeadTags } from "@/components/SEOHeadTags";

export default function VerificationManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch verification stats
  const { data: verificationStats } = useQuery({
    queryKey: ["/api/verification/stats"],
    refetchInterval: 10000,
  });

  // Fetch verification requests
  const { data: verificationRequests = [], isLoading } = useQuery({
    queryKey: ["/api/verification/requests"],
    refetchInterval: 5000,
  });

  // Approve verification mutation
  const approveMutation = useMutation({
    mutationFn: (requestId: string) =>
      apiRequest(`/api/verification/${requestId}/approve`, "POST"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/verification/requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/verification/stats"] });
      toast({
        title: "Verification Approved",
        description: "The verification request has been approved successfully",
      });
    },
  });

  // Reject verification mutation
  const rejectMutation = useMutation({
    mutationFn: (requestId: string) =>
      apiRequest(`/api/verification/${requestId}/reject`, "POST"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/verification/requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/verification/stats"] });
      toast({
        title: "Verification Rejected",
        description: "The verification request has been rejected",
        variant: "destructive",
      });
    },
  });

  const handleReview = (requestId: string) => {
    toast({
      title: "Opening Review",
      description: `Opening detailed review for ${requestId}`,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-500/20 text-green-400">Approved</Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-500/20 text-yellow-400">Pending</Badge>
        );
      case "rejected":
        return <Badge className="bg-red-500/20 text-red-400">Rejected</Badge>;
      case "under_review":
        return (
          <Badge className="bg-blue-500/20 text-blue-400">Under Review</Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">High</Badge>;
      case "normal":
        return <Badge variant="secondary">Normal</Badge>;
      case "low":
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen p-6 cyber-bg">
      <SEOHeadTags
        title="Verification Management - FanzDash"
        description="Manage document verification workflows and user identity verification"
        canonicalUrl="https://fanzdash.com/verification-management"
      />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold cyber-text-glow">
              Verification Management
            </h1>
            <p className="text-muted-foreground">
              Document verification workflows
            </p>
          </div>
          <Button className="cyber-button">
            <FileText className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="cyber-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Pending Reviews
                  </p>
                  <p className="text-2xl font-bold cyber-text-glow">
                    {verificationStats?.pendingReviews ?? 0}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="cyber-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Approved Today
                  </p>
                  <p className="text-2xl font-bold text-green-400">
                    {verificationStats?.approvedToday ?? 0}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="cyber-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Rejected Today
                  </p>
                  <p className="text-2xl font-bold text-red-400">
                    {verificationStats?.rejectedToday ?? 0}
                  </p>
                </div>
                <XCircle className="w-8 h-8 text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="cyber-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Verified
                  </p>
                  <p className="text-2xl font-bold text-blue-400">
                    {(verificationStats?.totalVerified ?? 0).toLocaleString()}
                  </p>
                </div>
                <UserCheck className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="cyber-border">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search verifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 glass-effect"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 glass-effect">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-48 glass-effect">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="identity">Identity</SelectItem>
                  <SelectItem value="age">Age</SelectItem>
                  <SelectItem value="address">Address</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Verification Requests Table */}
        <Card className="cyber-border">
          <CardHeader>
            <CardTitle>Verification Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Document</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Reviewed By</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {verificationRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-mono text-sm">
                      {request.id}
                    </TableCell>
                    <TableCell>{request.user}</TableCell>
                    <TableCell>{request.type}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {request.documentType}
                    </TableCell>
                    <TableCell>{getPriorityBadge(request.priority)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(request.status)}
                        {getStatusBadge(request.status)}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(request.submittedDate).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-sm">
                      {request.reviewedBy || (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReview(request.id)}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Review
                        </Button>
                        {request.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => approveMutation.mutate(request.id)}
                              disabled={approveMutation.isPending}
                            >
                              <CheckCircle className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => rejectMutation.mutate(request.id)}
                              disabled={rejectMutation.isPending}
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
