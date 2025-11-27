import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  Upload,
  Calendar,
  Users,
  TrendingUp,
  Search,
  Filter,
  Download,
  Eye,
  MessageSquare,
  ClipboardCheck,
  UserCheck
} from "lucide-react";

interface AccommodationRequest {
  id: number;
  employee_id: number;
  employee_name?: string;
  disability_type: string;
  accommodation_description: string;
  status: 'pending' | 'under_review' | 'approved' | 'denied' | 'implemented';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  submitted_date: string;
  decision_date?: string;
  decision?: string;
  decision_rationale?: string;
  medical_documentation_required: boolean;
  medical_documentation_submitted: boolean;
  interactive_process_started: boolean;
  effectiveness_review_due?: string;
  created_at: string;
  updated_at: string;
}

interface Meeting {
  id: number;
  request_id: number;
  meeting_date: string;
  participants: string[];
  discussion_notes: string;
  action_items: string[];
  follow_up_required: boolean;
  created_at: string;
}

interface EffectivenessReview {
  id: number;
  request_id: number;
  review_date: string;
  is_effective: boolean;
  employee_feedback: string;
  supervisor_feedback: string;
  modifications_needed: boolean;
  modifications_description?: string;
  created_at: string;
}

interface Statistics {
  total_requests: number;
  pending_requests: number;
  approved_requests: number;
  denied_requests: number;
  average_resolution_days: number;
  requests_by_status: Record<string, number>;
  requests_by_disability_type: Record<string, number>;
  medical_documentation_pending: number;
  interactive_process_active: number;
  effectiveness_reviews_due: number;
}

export default function ADAAccommodationDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<AccommodationRequest | null>(null);
  const [newRequestOpen, setNewRequestOpen] = useState(false);
  const [decisionOpen, setDecisionOpen] = useState(false);
  const [medicalDocOpen, setMedicalDocOpen] = useState(false);
  const [meetingOpen, setMeetingOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch statistics
  const { data: statistics } = useQuery<Statistics>({
    queryKey: ["/api/ada-accommodation/statistics"],
  });

  // Fetch accommodation requests
  const { data: requestsData, isLoading: requestsLoading } = useQuery<AccommodationRequest[]>({
    queryKey: ["/api/ada-accommodation/requests"],
  });

  // Fetch specific request details
  const { data: requestDetails } = useQuery({
    queryKey: [`/api/ada-accommodation/requests/${selectedRequest?.id}`],
    enabled: !!selectedRequest,
  });

  // Submit new accommodation request
  const submitRequestMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/ada-accommodation/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to submit request");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ada-accommodation/requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ada-accommodation/statistics"] });
      setNewRequestOpen(false);
      toast({
        title: "Request Submitted",
        description: "Accommodation request has been submitted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Upload medical documentation
  const uploadMedicalDocMutation = useMutation({
    mutationFn: async ({ requestId, file }: { requestId: number; file: File }) => {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`/api/ada-accommodation/requests/${requestId}/medical-documentation`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to upload documentation");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ada-accommodation/requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ada-accommodation/statistics"] });
      setMedicalDocOpen(false);
      toast({
        title: "Documentation Uploaded",
        description: "Medical documentation has been uploaded successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Schedule interactive process meeting
  const scheduleMeetingMutation = useMutation({
    mutationFn: async ({ requestId, data }: { requestId: number; data: any }) => {
      const res = await fetch(`/api/ada-accommodation/requests/${requestId}/meetings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to schedule meeting");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ada-accommodation/requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ada-accommodation/statistics"] });
      setMeetingOpen(false);
      toast({
        title: "Meeting Scheduled",
        description: "Interactive process meeting has been scheduled.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Scheduling Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Make accommodation decision
  const makeDecisionMutation = useMutation({
    mutationFn: async ({ requestId, data }: { requestId: number; data: any }) => {
      const res = await fetch(`/api/ada-accommodation/requests/${requestId}/decision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to make decision");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ada-accommodation/requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ada-accommodation/statistics"] });
      setDecisionOpen(false);
      toast({
        title: "Decision Recorded",
        description: "Accommodation decision has been recorded.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Decision Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Submit effectiveness review
  const submitReviewMutation = useMutation({
    mutationFn: async ({ requestId, data }: { requestId: number; data: any }) => {
      const res = await fetch(`/api/ada-accommodation/requests/${requestId}/effectiveness-review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to submit review");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ada-accommodation/requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ada-accommodation/statistics"] });
      setReviewOpen(false);
      toast({
        title: "Review Submitted",
        description: "Effectiveness review has been submitted.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Review Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", icon: any }> = {
      pending: { variant: "outline", icon: Clock },
      under_review: { variant: "secondary", icon: Search },
      approved: { variant: "default", icon: CheckCircle },
      denied: { variant: "destructive", icon: AlertTriangle },
      implemented: { variant: "default", icon: ClipboardCheck },
    };
    const config = variants[status] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {status.replace(/_/g, " ").toUpperCase()}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      low: "bg-blue-100 text-blue-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-orange-100 text-orange-800",
      urgent: "bg-red-100 text-red-800",
    };

    return (
      <Badge className={colors[priority] || colors.medium}>
        {priority.toUpperCase()}
      </Badge>
    );
  };

  const filteredRequests = requestsData?.filter(req => {
    const matchesStatus = filterStatus === "all" || req.status === filterStatus;
    const matchesSearch = !searchQuery ||
      req.employee_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.disability_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.accommodation_description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">ADA Accommodation Management</h1>
        <p className="text-muted-foreground">
          Complete lifecycle management for ADA accommodation requests
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics?.total_requests || 0}</div>
            <p className="text-xs text-muted-foreground">
              All accommodation requests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics?.pending_requests || 0}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting decision
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics?.approved_requests || 0}</div>
            <p className="text-xs text-muted-foreground">
              Accommodations granted
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Resolution</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statistics?.average_resolution_days?.toFixed(1) || 0} days
            </div>
            <p className="text-xs text-muted-foreground">
              Average processing time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Action Alerts */}
      {statistics && (statistics.medical_documentation_pending > 0 ||
                      statistics.interactive_process_active > 0 ||
                      statistics.effectiveness_reviews_due > 0) && (
        <div className="mb-6 space-y-2">
          {statistics.medical_documentation_pending > 0 && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="flex items-center gap-2 p-4">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <span className="font-medium">
                  {statistics.medical_documentation_pending} request(s) awaiting medical documentation
                </span>
              </CardContent>
            </Card>
          )}

          {statistics.interactive_process_active > 0 && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="flex items-center gap-2 p-4">
                <Users className="h-5 w-5 text-blue-600" />
                <span className="font-medium">
                  {statistics.interactive_process_active} interactive process meeting(s) in progress
                </span>
              </CardContent>
            </Card>
          )}

          {statistics.effectiveness_reviews_due > 0 && (
            <Card className="border-purple-200 bg-purple-50">
              <CardContent className="flex items-center gap-2 p-4">
                <ClipboardCheck className="h-5 w-5 text-purple-600" />
                <span className="font-medium">
                  {statistics.effectiveness_reviews_due} effectiveness review(s) due
                </span>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="requests" className="space-y-4">
        <TabsList>
          <TabsTrigger value="requests">All Requests</TabsTrigger>
          <TabsTrigger value="submit">Submit New</TabsTrigger>
          <TabsTrigger value="interactive">Interactive Process</TabsTrigger>
          <TabsTrigger value="reviews">Effectiveness Reviews</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* All Requests Tab */}
        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Accommodation Requests</CardTitle>
                  <CardDescription>View and manage all ADA accommodation requests</CardDescription>
                </div>
                <Dialog open={newRequestOpen} onOpenChange={setNewRequestOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <FileText className="h-4 w-4 mr-2" />
                      New Request
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Submit Accommodation Request</DialogTitle>
                      <DialogDescription>
                        Submit a new ADA accommodation request
                      </DialogDescription>
                    </DialogHeader>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        submitRequestMutation.mutate({
                          employee_id: parseInt(formData.get("employee_id") as string),
                          disability_type: formData.get("disability_type"),
                          accommodation_description: formData.get("accommodation_description"),
                          priority: formData.get("priority"),
                          medical_documentation_required: formData.get("medical_documentation_required") === "true",
                        });
                      }}
                      className="space-y-4"
                    >
                      <div>
                        <Label htmlFor="employee_id">Employee ID</Label>
                        <Input
                          id="employee_id"
                          name="employee_id"
                          type="number"
                          placeholder="Enter employee ID"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="disability_type">Disability Type</Label>
                        <Input
                          id="disability_type"
                          name="disability_type"
                          placeholder="e.g., Visual, Hearing, Mobility, Cognitive"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="accommodation_description">Accommodation Description</Label>
                        <Textarea
                          id="accommodation_description"
                          name="accommodation_description"
                          placeholder="Describe the requested accommodation in detail..."
                          rows={6}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="priority">Priority</Label>
                        <Select name="priority" required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="medical_documentation_required">Medical Documentation Required?</Label>
                        <Select name="medical_documentation_required" required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select option" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">Yes</SelectItem>
                            <SelectItem value="false">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setNewRequestOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={submitRequestMutation.isPending}>
                          {submitRequestMutation.isPending ? "Submitting..." : "Submit Request"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search requests..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="denied">Denied</SelectItem>
                    <SelectItem value="implemented">Implemented</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Requests Table */}
              <div className="space-y-3">
                {requestsLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading requests...</div>
                ) : filteredRequests && filteredRequests.length > 0 ? (
                  filteredRequests.map((request) => (
                    <Card key={request.id} className="hover:bg-accent/50 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">Request #{request.id}</h3>
                              {getStatusBadge(request.status)}
                              {getPriorityBadge(request.priority)}
                              {request.medical_documentation_required && !request.medical_documentation_submitted && (
                                <Badge variant="outline" className="gap-1 text-yellow-700 border-yellow-300">
                                  <Upload className="h-3 w-3" />
                                  Doc Required
                                </Badge>
                              )}
                              {request.interactive_process_started && (
                                <Badge variant="outline" className="gap-1 text-blue-700 border-blue-300">
                                  <Users className="h-3 w-3" />
                                  Interactive Process
                                </Badge>
                              )}
                            </div>

                            <div className="text-sm space-y-1">
                              <p><strong>Employee:</strong> {request.employee_name || `ID ${request.employee_id}`}</p>
                              <p><strong>Disability Type:</strong> {request.disability_type}</p>
                              <p><strong>Accommodation:</strong> {request.accommodation_description}</p>
                              <p className="text-muted-foreground">
                                Submitted: {new Date(request.submitted_date).toLocaleDateString()}
                              </p>
                              {request.decision_date && (
                                <p className="text-muted-foreground">
                                  Decision: {new Date(request.decision_date).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedRequest(request)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>

                            {request.medical_documentation_required && !request.medical_documentation_submitted && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setMedicalDocOpen(true);
                                }}
                              >
                                <Upload className="h-4 w-4 mr-2" />
                                Upload Docs
                              </Button>
                            )}

                            {request.status === "pending" || request.status === "under_review" ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setDecisionOpen(true);
                                }}
                              >
                                <UserCheck className="h-4 w-4 mr-2" />
                                Make Decision
                              </Button>
                            ) : null}

                            {request.status !== "denied" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setMeetingOpen(true);
                                }}
                              >
                                <Calendar className="h-4 w-4 mr-2" />
                                Schedule Meeting
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No accommodation requests found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Submit New Tab */}
        <TabsContent value="submit">
          <Card>
            <CardHeader>
              <CardTitle>Submit New Accommodation Request</CardTitle>
              <CardDescription>
                Employees and managers can submit new ADA accommodation requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  submitRequestMutation.mutate({
                    employee_id: parseInt(formData.get("employee_id") as string),
                    disability_type: formData.get("disability_type"),
                    accommodation_description: formData.get("accommodation_description"),
                    priority: formData.get("priority"),
                    medical_documentation_required: formData.get("medical_documentation_required") === "true",
                  });
                }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="submit_employee_id">Employee ID</Label>
                    <Input
                      id="submit_employee_id"
                      name="employee_id"
                      type="number"
                      placeholder="Enter employee ID"
                      required
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      The employee requesting the accommodation
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="submit_priority">Priority</Label>
                    <Select name="priority" required>
                      <SelectTrigger id="submit_priority">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low - Can be addressed over time</SelectItem>
                        <SelectItem value="medium">Medium - Should be addressed soon</SelectItem>
                        <SelectItem value="high">High - Needs prompt attention</SelectItem>
                        <SelectItem value="urgent">Urgent - Immediate safety concern</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="submit_disability_type">Disability Type</Label>
                  <Input
                    id="submit_disability_type"
                    name="disability_type"
                    placeholder="e.g., Visual, Hearing, Mobility, Cognitive, Mental Health"
                    required
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    General category (specific diagnosis not required)
                  </p>
                </div>

                <div>
                  <Label htmlFor="submit_accommodation_description">Accommodation Description</Label>
                  <Textarea
                    id="submit_accommodation_description"
                    name="accommodation_description"
                    placeholder="Describe the requested accommodation in detail, including:&#10;- What specific accommodation is needed&#10;- How it will help perform job duties&#10;- Any alternative accommodations considered&#10;- Estimated cost if known"
                    rows={8}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="submit_medical_documentation_required">Medical Documentation Required?</Label>
                  <Select name="medical_documentation_required" required>
                    <SelectTrigger id="submit_medical_documentation_required">
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Yes - Medical documentation needed</SelectItem>
                      <SelectItem value="false">No - Disability is obvious or already documented</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground mt-1">
                    Medical documentation may be required for non-obvious disabilities
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">ADA Rights & Responsibilities</h4>
                  <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                    <li>Requests are kept confidential and shared only on a need-to-know basis</li>
                    <li>The interactive process will begin promptly after submission</li>
                    <li>Reasonable accommodations will be provided unless they cause undue hardship</li>
                    <li>Retaliation for requesting accommodation is prohibited</li>
                    <li>You have the right to appeal any denied requests</li>
                  </ul>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => window.location.reload()}>
                    Clear Form
                  </Button>
                  <Button type="submit" disabled={submitRequestMutation.isPending}>
                    {submitRequestMutation.isPending ? "Submitting..." : "Submit Request"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Interactive Process Tab */}
        <TabsContent value="interactive">
          <Card>
            <CardHeader>
              <CardTitle>Interactive Process Management</CardTitle>
              <CardDescription>
                Schedule and track interactive process meetings with employees
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {requestsData?.filter(r => r.interactive_process_started).map((request) => (
                  <Card key={request.id} className="border-blue-200">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">Request #{request.id} - {request.employee_name}</h3>
                          <p className="text-sm text-muted-foreground">{request.accommodation_description}</p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(request);
                            setMeetingOpen(true);
                          }}
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          Schedule Meeting
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {!requestsData?.some(r => r.interactive_process_started) && (
                  <div className="text-center py-8 text-muted-foreground">
                    No active interactive processes
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Effectiveness Reviews Tab */}
        <TabsContent value="reviews">
          <Card>
            <CardHeader>
              <CardTitle>Effectiveness Reviews</CardTitle>
              <CardDescription>
                Review the effectiveness of implemented accommodations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {requestsData?.filter(r => r.effectiveness_review_due).map((request) => (
                  <Card key={request.id} className="border-purple-200">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">Request #{request.id} - {request.employee_name}</h3>
                          <p className="text-sm text-muted-foreground">{request.accommodation_description}</p>
                          <p className="text-sm text-muted-foreground">
                            Review Due: {new Date(request.effectiveness_review_due).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(request);
                            setReviewOpen(true);
                          }}
                        >
                          <ClipboardCheck className="h-4 w-4 mr-2" />
                          Submit Review
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {!requestsData?.some(r => r.effectiveness_review_due) && (
                  <div className="text-center py-8 text-muted-foreground">
                    No effectiveness reviews due
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Requests by Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {statistics?.requests_by_status && Object.entries(statistics.requests_by_status).map(([status, count]) => (
                    <div key={status} className="flex justify-between items-center">
                      <span className="capitalize">{status.replace(/_/g, " ")}</span>
                      <Badge>{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Requests by Disability Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {statistics?.requests_by_disability_type && Object.entries(statistics.requests_by_disability_type).map(([type, count]) => (
                    <div key={type} className="flex justify-between items-center">
                      <span>{type}</span>
                      <Badge>{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Processing Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Average Resolution Time</span>
                    <span className="font-semibold">{statistics?.average_resolution_days?.toFixed(1) || 0} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Medical Docs Pending</span>
                    <Badge variant="outline">{statistics?.medical_documentation_pending || 0}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Active Interactive Processes</span>
                    <Badge variant="outline">{statistics?.interactive_process_active || 0}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Reviews Due</span>
                    <Badge variant="outline">{statistics?.effectiveness_reviews_due || 0}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Compliance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Approval Rate</span>
                      <span className="font-semibold">
                        {statistics && statistics.total_requests > 0
                          ? ((statistics.approved_requests / statistics.total_requests) * 100).toFixed(1)
                          : 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{
                          width: statistics && statistics.total_requests > 0
                            ? `${(statistics.approved_requests / statistics.total_requests) * 100}%`
                            : "0%"
                        }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Medical Documentation Upload Dialog */}
      <Dialog open={medicalDocOpen} onOpenChange={setMedicalDocOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Medical Documentation</DialogTitle>
            <DialogDescription>
              Upload medical documentation for Request #{selectedRequest?.id}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const file = formData.get("file") as File;
              if (selectedRequest && file) {
                uploadMedicalDocMutation.mutate({ requestId: selectedRequest.id, file });
              }
            }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="file">Medical Documentation (PDF, DOC, DOCX)</Label>
              <Input
                id="file"
                name="file"
                type="file"
                accept=".pdf,.doc,.docx"
                required
              />
              <p className="text-sm text-muted-foreground mt-1">
                Upload medical documentation from healthcare provider
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Privacy Notice:</strong> Medical documentation is stored securely and accessed only by authorized personnel.
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setMedicalDocOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={uploadMedicalDocMutation.isPending}>
                {uploadMedicalDocMutation.isPending ? "Uploading..." : "Upload"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Schedule Meeting Dialog */}
      <Dialog open={meetingOpen} onOpenChange={setMeetingOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Interactive Process Meeting</DialogTitle>
            <DialogDescription>
              Schedule a meeting for Request #{selectedRequest?.id}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              if (selectedRequest) {
                scheduleMeetingMutation.mutate({
                  requestId: selectedRequest.id,
                  data: {
                    meeting_date: formData.get("meeting_date"),
                    participants: (formData.get("participants") as string).split(",").map(p => p.trim()),
                    discussion_notes: formData.get("discussion_notes"),
                  },
                });
              }
            }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="meeting_date">Meeting Date & Time</Label>
              <Input
                id="meeting_date"
                name="meeting_date"
                type="datetime-local"
                required
              />
            </div>

            <div>
              <Label htmlFor="participants">Participants (comma-separated)</Label>
              <Input
                id="participants"
                name="participants"
                placeholder="John Doe, Jane Smith, HR Manager"
                required
              />
            </div>

            <div>
              <Label htmlFor="discussion_notes">Agenda/Notes</Label>
              <Textarea
                id="discussion_notes"
                name="discussion_notes"
                placeholder="Meeting agenda and discussion topics..."
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setMeetingOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={scheduleMeetingMutation.isPending}>
                {scheduleMeetingMutation.isPending ? "Scheduling..." : "Schedule Meeting"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Decision Dialog */}
      <Dialog open={decisionOpen} onOpenChange={setDecisionOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Make Accommodation Decision</DialogTitle>
            <DialogDescription>
              Record decision for Request #{selectedRequest?.id}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              if (selectedRequest) {
                makeDecisionMutation.mutate({
                  requestId: selectedRequest.id,
                  data: {
                    decision: formData.get("decision"),
                    decision_rationale: formData.get("decision_rationale"),
                  },
                });
              }
            }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="decision">Decision</Label>
              <Select name="decision" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select decision" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approved">Approve - Grant accommodation as requested</SelectItem>
                  <SelectItem value="approved_modified">Approve Modified - Grant alternative accommodation</SelectItem>
                  <SelectItem value="denied">Deny - Cannot provide accommodation</SelectItem>
                  <SelectItem value="needs_more_info">Needs More Information</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="decision_rationale">Decision Rationale</Label>
              <Textarea
                id="decision_rationale"
                name="decision_rationale"
                placeholder="Provide detailed explanation for this decision, including:&#10;- Reasons for approval/denial&#10;- Alternative accommodations considered&#10;- Undue hardship analysis if applicable&#10;- Implementation timeline if approved"
                rows={8}
                required
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Decision Guidelines</h4>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Document all factors considered in decision-making</li>
                <li>Ensure decision is based on objective business necessity</li>
                <li>Consider alternative accommodations if request cannot be granted as-is</li>
                <li>Consult legal if denying based on undue hardship</li>
              </ul>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDecisionOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={makeDecisionMutation.isPending}>
                {makeDecisionMutation.isPending ? "Recording..." : "Record Decision"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Effectiveness Review Dialog */}
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Submit Effectiveness Review</DialogTitle>
            <DialogDescription>
              Review effectiveness of accommodation for Request #{selectedRequest?.id}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              if (selectedRequest) {
                submitReviewMutation.mutate({
                  requestId: selectedRequest.id,
                  data: {
                    is_effective: formData.get("is_effective") === "true",
                    employee_feedback: formData.get("employee_feedback"),
                    supervisor_feedback: formData.get("supervisor_feedback"),
                    modifications_needed: formData.get("modifications_needed") === "true",
                    modifications_description: formData.get("modifications_description"),
                  },
                });
              }
            }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="is_effective">Is the accommodation effective?</Label>
              <Select name="is_effective" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Yes - Accommodation is working well</SelectItem>
                  <SelectItem value="false">No - Accommodation needs adjustment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="employee_feedback">Employee Feedback</Label>
              <Textarea
                id="employee_feedback"
                name="employee_feedback"
                placeholder="Employee's feedback on the accommodation effectiveness..."
                rows={4}
                required
              />
            </div>

            <div>
              <Label htmlFor="supervisor_feedback">Supervisor Feedback</Label>
              <Textarea
                id="supervisor_feedback"
                name="supervisor_feedback"
                placeholder="Supervisor's observations on accommodation effectiveness..."
                rows={4}
                required
              />
            </div>

            <div>
              <Label htmlFor="modifications_needed">Are modifications needed?</Label>
              <Select name="modifications_needed" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="false">No - Current accommodation is sufficient</SelectItem>
                  <SelectItem value="true">Yes - Modifications are needed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="modifications_description">Modifications Description (if needed)</Label>
              <Textarea
                id="modifications_description"
                name="modifications_description"
                placeholder="Describe what modifications are needed..."
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setReviewOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitReviewMutation.isPending}>
                {submitReviewMutation.isPending ? "Submitting..." : "Submit Review"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
