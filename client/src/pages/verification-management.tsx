import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserCheck, Search, Filter, Eye, CheckCircle, XCircle, Clock, AlertTriangle, FileText } from "lucide-react";
import { SEOHeadTags } from "@/components/SEOHeadTags";

export default function VerificationManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const verificationStats = {
    pendingReviews: 47,
    approvedToday: 23,
    rejectedToday: 5,
    totalVerified: 8920
  };

  const verificationRequests = [
    {
      id: "VER-001234",
      user: "sarah_creator",
      type: "Identity Verification",
      status: "pending",
      submittedDate: "2025-01-04T10:30:00Z",
      documentType: "Government ID",
      priority: "high",
      reviewedBy: null
    },
    {
      id: "VER-001235",
      user: "alex_model",
      type: "Age Verification",
      status: "approved",
      submittedDate: "2025-01-04T09:15:00Z",
      documentType: "Passport",
      priority: "normal",
      reviewedBy: "admin_reviewer"
    },
    {
      id: "VER-001236",
      user: "jordan_creator",
      type: "Address Verification",
      status: "pending",
      submittedDate: "2025-01-04T08:45:00Z",
      documentType: "Utility Bill",
      priority: "normal",
      reviewedBy: null
    },
    {
      id: "VER-001237",
      user: "mike_performer",
      type: "Business Verification",
      status: "rejected",
      submittedDate: "2025-01-03T16:20:00Z",
      documentType: "Business License",
      priority: "low",
      reviewedBy: "admin_reviewer"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500/20 text-green-400">Approved</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500/20 text-yellow-400">Pending</Badge>;
      case "rejected":
        return <Badge className="bg-red-500/20 text-red-400">Rejected</Badge>;
      case "under_review":
        return <Badge className="bg-blue-500/20 text-blue-400">Under Review</Badge>;
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
            <h1 className="text-3xl font-bold cyber-text-glow">Verification Management</h1>
            <p className="text-muted-foreground">Document verification workflows</p>
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
                  <p className="text-sm text-muted-foreground">Pending Reviews</p>
                  <p className="text-2xl font-bold cyber-text-glow">{verificationStats.pendingReviews}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="cyber-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Approved Today</p>
                  <p className="text-2xl font-bold text-green-400">{verificationStats.approvedToday}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="cyber-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Rejected Today</p>
                  <p className="text-2xl font-bold text-red-400">{verificationStats.rejectedToday}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="cyber-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Verified</p>
                  <p className="text-2xl font-bold text-blue-400">{verificationStats.totalVerified.toLocaleString()}</p>
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
                    <TableCell className="font-mono text-sm">{request.id}</TableCell>
                    <TableCell>{request.user}</TableCell>
                    <TableCell>{request.type}</TableCell>
                    <TableCell className="text-muted-foreground">{request.documentType}</TableCell>
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
                      {request.reviewedBy || <span className="text-muted-foreground">-</span>}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-3 h-3 mr-1" />
                          Review
                        </Button>
                        {request.status === 'pending' && (
                          <>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                              <CheckCircle className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="destructive">
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