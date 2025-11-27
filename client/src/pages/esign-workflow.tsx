import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  FileText,
  Send,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  Eye,
  Edit,
  Trash2,
  Users,
  FileSignature,
  Shield,
  Archive,
  Copy,
  Calendar,
  Mail,
  UserCheck,
  XCircle,
  RefreshCw,
  FileCheck,
  Award,
  Lock,
  Unlock,
  Plus,
  ArrowRight,
  Check,
  Filter,
  Search,
} from "lucide-react";

interface SignatureRequest {
  id: string;
  documentName: string;
  documentId: string;
  subject: string;
  message: string;
  status: "draft" | "sent" | "in_progress" | "partially_signed" | "completed" | "expired" | "cancelled" | "declined";
  createdBy: string;
  createdDate: string;
  sentDate?: string;
  completedDate?: string;
  expiresDate?: string;
  signers: Signer[];
  workflow: "sequential" | "parallel";
  requiresAllSigners: boolean;
  emailReminders: boolean;
  reminderFrequency?: number;
  certificateUrl?: string;
  auditTrailUrl?: string;
  isLegallyBinding: boolean;
  signatureCount: number;
  totalSigners: number;
  viewCount: number;
  lastActivity?: string;
}

interface Signer {
  id: string;
  name: string;
  email: string;
  role: "signer" | "approver" | "cc" | "viewer";
  order: number;
  status: "pending" | "sent" | "viewed" | "signed" | "declined" | "expired";
  sentDate?: string;
  viewedDate?: string;
  signedDate?: string;
  declinedDate?: string;
  declineReason?: string;
  ipAddress?: string;
  device?: string;
  signatureImage?: string;
  fields: SignatureField[];
}

interface SignatureField {
  id: string;
  type: "signature" | "initial" | "date" | "text" | "checkbox" | "dropdown";
  label: string;
  required: boolean;
  value?: string;
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  category: "contract" | "nda" | "agreement" | "invoice" | "form" | "other";
  documentUrl: string;
  thumbnailUrl?: string;
  fields: SignatureField[];
  defaultSigners: number;
  workflow: "sequential" | "parallel";
  usageCount: number;
  createdBy: string;
  createdDate: string;
  lastUsedDate?: string;
  isActive: boolean;
}

interface ApprovalWorkflow {
  id: string;
  name: string;
  description: string;
  documentName: string;
  documentId: string;
  status: "pending" | "in_review" | "approved" | "rejected" | "cancelled";
  createdBy: string;
  createdDate: string;
  approvers: Approver[];
  currentStage: number;
  totalStages: number;
  requiresAllApprovals: boolean;
  comments: WorkflowComment[];
  completedDate?: string;
}

interface Approver {
  id: string;
  name: string;
  email: string;
  stage: number;
  status: "pending" | "notified" | "approved" | "rejected" | "delegated";
  notifiedDate?: string;
  actionDate?: string;
  comments?: string;
  delegatedTo?: string;
}

interface WorkflowComment {
  id: string;
  userId: string;
  userName: string;
  comment: string;
  timestamp: string;
  attachments?: string[];
}

interface Certificate {
  id: string;
  requestId: string;
  documentName: string;
  certificateUrl: string;
  auditTrailUrl: string;
  completedDate: string;
  signers: string[];
  issuedTo: string;
  certificateHash: string;
  isVerified: boolean;
}

// API request helper
async function apiRequest(url: string, method: string = "GET", data?: any) {
  const options: RequestInit = {
    method,
    headers: { "Content-Type": "application/json" },
    body: data ? JSON.stringify(data) : undefined,
  };
  const response = await fetch(url, options);
  if (!response.ok) throw new Error("API request failed");
  return response.json();
}

export default function ESignWorkflowSystem() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Dialogs
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [showTemplate, setShowTemplate] = useState(false);
  const [showWorkflow, setShowWorkflow] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<SignatureRequest | null>(null);

  // Form states
  const [newRequestDoc, setNewRequestDoc] = useState("");
  const [newRequestSubject, setNewRequestSubject] = useState("");
  const [newRequestMessage, setNewRequestMessage] = useState("");
  const [newRequestWorkflow, setNewRequestWorkflow] = useState<"sequential" | "parallel">("sequential");
  const [newRequestSigners, setNewRequestSigners] = useState<Partial<Signer>[]>([]);

  // Queries
  const { data: requests = [] } = useQuery<SignatureRequest[]>({
    queryKey: ["/api/esign/requests"],
    refetchInterval: 30000,
  });

  const { data: templates = [] } = useQuery<DocumentTemplate[]>({
    queryKey: ["/api/esign/templates"],
    refetchInterval: 60000,
  });

  const { data: workflows = [] } = useQuery<ApprovalWorkflow[]>({
    queryKey: ["/api/esign/workflows"],
    refetchInterval: 30000,
  });

  const { data: certificates = [] } = useQuery<Certificate[]>({
    queryKey: ["/api/esign/certificates"],
    refetchInterval: 60000,
  });

  // Mutations
  const createRequestMutation = useMutation({
    mutationFn: (data: Partial<SignatureRequest>) =>
      apiRequest("/api/esign/requests", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/esign/requests"] });
      toast({ title: "Signature request created successfully" });
      setShowNewRequest(false);
      resetNewRequestForm();
    },
  });

  const sendRequestMutation = useMutation({
    mutationFn: (requestId: string) =>
      apiRequest(`/api/esign/requests/${requestId}/send`, "POST"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/esign/requests"] });
      toast({ title: "Signature request sent successfully" });
    },
  });

  const cancelRequestMutation = useMutation({
    mutationFn: (requestId: string) =>
      apiRequest(`/api/esign/requests/${requestId}/cancel`, "POST"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/esign/requests"] });
      toast({ title: "Signature request cancelled" });
    },
  });

  const remindSignersMutation = useMutation({
    mutationFn: (requestId: string) =>
      apiRequest(`/api/esign/requests/${requestId}/remind`, "POST"),
    onSuccess: () => {
      toast({ title: "Reminder sent to pending signers" });
    },
  });

  const createTemplateMutation = useMutation({
    mutationFn: (data: Partial<DocumentTemplate>) =>
      apiRequest("/api/esign/templates", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/esign/templates"] });
      toast({ title: "Template created successfully" });
      setShowTemplate(false);
    },
  });

  const createWorkflowMutation = useMutation({
    mutationFn: (data: Partial<ApprovalWorkflow>) =>
      apiRequest("/api/esign/workflows", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/esign/workflows"] });
      toast({ title: "Approval workflow created successfully" });
      setShowWorkflow(false);
    },
  });

  const approveWorkflowMutation = useMutation({
    mutationFn: ({ workflowId, comments }: { workflowId: string; comments: string }) =>
      apiRequest(`/api/esign/workflows/${workflowId}/approve`, "POST", { comments }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/esign/workflows"] });
      toast({ title: "Document approved successfully" });
    },
  });

  const rejectWorkflowMutation = useMutation({
    mutationFn: ({ workflowId, comments }: { workflowId: string; comments: string }) =>
      apiRequest(`/api/esign/workflows/${workflowId}/reject`, "POST", { comments }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/esign/workflows"] });
      toast({ title: "Document rejected" });
    },
  });

  const downloadCertificateMutation = useMutation({
    mutationFn: (certificateId: string) =>
      apiRequest(`/api/esign/certificates/${certificateId}/download`, "GET"),
    onSuccess: (data) => {
      window.open(data.url, "_blank");
      toast({ title: "Certificate download started" });
    },
  });

  // Helper functions
  const getStatusColor = (status: string): string => {
    switch (status) {
      case "completed":
      case "signed":
      case "approved":
        return "bg-green-500/20 text-green-400";
      case "sent":
      case "in_progress":
      case "partially_signed":
      case "in_review":
        return "bg-blue-500/20 text-blue-400";
      case "pending":
      case "notified":
        return "bg-yellow-500/20 text-yellow-400";
      case "expired":
      case "cancelled":
      case "declined":
      case "rejected":
        return "bg-red-500/20 text-red-400";
      case "draft":
        return "bg-gray-500/20 text-gray-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
      case "signed":
      case "approved":
        return <CheckCircle className="w-4 h-4" />;
      case "pending":
      case "notified":
        return <Clock className="w-4 h-4" />;
      case "expired":
      case "cancelled":
      case "declined":
      case "rejected":
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const resetNewRequestForm = () => {
    setNewRequestDoc("");
    setNewRequestSubject("");
    setNewRequestMessage("");
    setNewRequestWorkflow("sequential");
    setNewRequestSigners([]);
  };

  const addSigner = () => {
    setNewRequestSigners([
      ...newRequestSigners,
      {
        name: "",
        email: "",
        role: "signer",
        order: newRequestSigners.length + 1,
        status: "pending",
        fields: [],
      },
    ]);
  };

  const removeSigner = (index: number) => {
    setNewRequestSigners(newRequestSigners.filter((_, i) => i !== index));
  };

  const updateSigner = (index: number, field: string, value: any) => {
    const updated = [...newRequestSigners];
    updated[index] = { ...updated[index], [field]: value };
    setNewRequestSigners(updated);
  };

  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      req.documentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || req.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen cyber-bg p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold cyber-glow mb-2">
            eSign & Document Workflow
          </h1>
          <p className="text-gray-400">
            Legally binding electronic signatures and document approval workflows
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="cyber-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Pending Signatures</p>
                  <p className="text-3xl font-bold mt-2">
                    {requests.filter((r) => r.status === "sent" || r.status === "in_progress").length}
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
                  <p className="text-sm text-gray-400">Completed</p>
                  <p className="text-3xl font-bold mt-2">
                    {requests.filter((r) => r.status === "completed").length}
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
                  <p className="text-sm text-gray-400">Templates</p>
                  <p className="text-3xl font-bold mt-2">{templates.length}</p>
                </div>
                <FileText className="w-10 h-10 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="cyber-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Active Workflows</p>
                  <p className="text-3xl font-bold mt-2">
                    {workflows.filter((w) => w.status === "pending" || w.status === "in_review").length}
                  </p>
                </div>
                <RefreshCw className="w-10 h-10 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="requests" className="space-y-4">
          <TabsList className="cyber-card p-1">
            <TabsTrigger value="requests">Signature Requests</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="workflows">Approval Workflows</TabsTrigger>
            <TabsTrigger value="certificates">Certificates</TabsTrigger>
          </TabsList>

          {/* Signature Requests Tab */}
          <TabsContent value="requests" className="space-y-4">
            {/* Toolbar */}
            <Card className="cyber-card">
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-4">
                  <Dialog open={showNewRequest} onOpenChange={setShowNewRequest}>
                    <DialogTrigger asChild>
                      <Button className="cyber-button">
                        <Plus className="w-4 h-4 mr-2" />
                        New Signature Request
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="cyber-card max-w-3xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Create Signature Request</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Document</Label>
                          <Input
                            type="file"
                            onChange={(e) => setNewRequestDoc(e.target.value)}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label>Subject</Label>
                          <Input
                            value={newRequestSubject}
                            onChange={(e) => setNewRequestSubject(e.target.value)}
                            placeholder="Please sign this document"
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label>Message</Label>
                          <Textarea
                            value={newRequestMessage}
                            onChange={(e) => setNewRequestMessage(e.target.value)}
                            placeholder="Additional message to signers..."
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label>Workflow Type</Label>
                          <Select
                            value={newRequestWorkflow}
                            onValueChange={(v: any) => setNewRequestWorkflow(v)}
                          >
                            <SelectTrigger className="mt-2">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="sequential">Sequential (one at a time)</SelectItem>
                              <SelectItem value="parallel">Parallel (all at once)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label>Signers</Label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={addSigner}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add Signer
                            </Button>
                          </div>

                          {newRequestSigners.map((signer, idx) => (
                            <div key={idx} className="p-4 bg-gray-800/50 rounded-lg space-y-3">
                              <div className="flex items-center justify-between">
                                <p className="font-semibold">Signer {idx + 1}</p>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeSigner(idx)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <Label className="text-sm">Name</Label>
                                  <Input
                                    value={signer.name || ""}
                                    onChange={(e) => updateSigner(idx, "name", e.target.value)}
                                    placeholder="John Doe"
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <Label className="text-sm">Email</Label>
                                  <Input
                                    type="email"
                                    value={signer.email || ""}
                                    onChange={(e) => updateSigner(idx, "email", e.target.value)}
                                    placeholder="john@example.com"
                                    className="mt-1"
                                  />
                                </div>
                              </div>
                              <div>
                                <Label className="text-sm">Role</Label>
                                <Select
                                  value={signer.role || "signer"}
                                  onValueChange={(v) => updateSigner(idx, "role", v)}
                                >
                                  <SelectTrigger className="mt-1">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="signer">Signer</SelectItem>
                                    <SelectItem value="approver">Approver</SelectItem>
                                    <SelectItem value="cc">CC</SelectItem>
                                    <SelectItem value="viewer">Viewer</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                          <Button variant="outline" onClick={() => setShowNewRequest(false)}>
                            Cancel
                          </Button>
                          <Button
                            onClick={() =>
                              createRequestMutation.mutate({
                                documentName: newRequestDoc,
                                subject: newRequestSubject,
                                message: newRequestMessage,
                                workflow: newRequestWorkflow,
                                signers: newRequestSigners as Signer[],
                                status: "draft",
                                createdDate: new Date().toISOString(),
                              })
                            }
                            className="cyber-button"
                          >
                            Create Request
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <div className="ml-auto flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Search requests..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="sent">Sent</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Requests List */}
            <div className="space-y-3">
              {filteredRequests.map((request) => (
                <Card key={request.id} className="cyber-card">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="p-3 bg-blue-500/20 rounded-lg">
                          <FileSignature className="w-6 h-6 text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-lg font-semibold">{request.documentName}</h3>
                              <p className="text-sm text-gray-400">{request.subject}</p>
                            </div>
                            <Badge className={getStatusColor(request.status)}>
                              {getStatusIcon(request.status)}
                              <span className="ml-1 capitalize">{request.status.replace("_", " ")}</span>
                            </Badge>
                          </div>

                          <div className="flex items-center gap-6 text-sm text-gray-400 mt-3">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              <span>
                                {request.signatureCount}/{request.totalSigners} signed
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>Created {formatDate(request.createdDate)}</span>
                            </div>
                            {request.expiresDate && (
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span>Expires {formatDate(request.expiresDate)}</span>
                              </div>
                            )}
                          </div>

                          {/* Signers */}
                          <div className="mt-4 space-y-2">
                            {request.signers.slice(0, 3).map((signer) => (
                              <div
                                key={signer.id}
                                className="flex items-center justify-between p-2 bg-gray-800/50 rounded"
                              >
                                <div className="flex items-center gap-3">
                                  <Badge variant="outline" className="text-xs">
                                    {signer.order}
                                  </Badge>
                                  <div>
                                    <p className="text-sm font-medium">{signer.name}</p>
                                    <p className="text-xs text-gray-400">{signer.email}</p>
                                  </div>
                                </div>
                                <Badge className={getStatusColor(signer.status)}>
                                  {getStatusIcon(signer.status)}
                                  <span className="ml-1 capitalize">{signer.status}</span>
                                </Badge>
                              </div>
                            ))}
                            {request.signers.length > 3 && (
                              <p className="text-sm text-gray-400 text-center">
                                +{request.signers.length - 3} more signers
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        {request.status === "draft" && (
                          <Button
                            size="sm"
                            onClick={() => sendRequestMutation.mutate(request.id)}
                            className="cyber-button"
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Send
                          </Button>
                        )}
                        {(request.status === "sent" || request.status === "in_progress") && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => remindSignersMutation.mutate(request.id)}
                          >
                            <Mail className="w-4 h-4 mr-2" />
                            Remind
                          </Button>
                        )}
                        {request.status === "completed" && request.certificateUrl && (
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Certificate
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                        {request.status !== "completed" && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => cancelRequestMutation.mutate(request.id)}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredRequests.length === 0 && (
                <Card className="cyber-card">
                  <CardContent className="p-12 text-center">
                    <FileSignature className="w-12 h-12 mx-auto mb-4 opacity-50 text-gray-400" />
                    <p className="text-gray-400">No signature requests found</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-4">
            <Card className="cyber-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Document Templates
                  </CardTitle>
                  <Button className="cyber-button" onClick={() => setShowTemplate(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Template
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {templates.map((template) => (
                    <Card key={template.id} className="cyber-card hover:bg-gray-800/50 transition-colors cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-purple-500/20 rounded">
                            <FileText className="w-5 h-5 text-purple-400" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold mb-1">{template.name}</h4>
                            <p className="text-sm text-gray-400 mb-2 line-clamp-2">
                              {template.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="text-xs capitalize">
                                {template.category}
                              </Badge>
                              <p className="text-xs text-gray-400">{template.usageCount} uses</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {templates.length === 0 && (
                  <p className="text-center text-gray-400 py-8">No templates available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Workflows Tab */}
          <TabsContent value="workflows" className="space-y-4">
            <Card className="cyber-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <RefreshCw className="w-5 h-5" />
                    Approval Workflows
                  </CardTitle>
                  <Button className="cyber-button" onClick={() => setShowWorkflow(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Workflow
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {workflows.map((workflow) => (
                    <div key={workflow.id} className="p-4 bg-gray-800/50 rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{workflow.name}</h4>
                          <p className="text-sm text-gray-400">{workflow.documentName}</p>
                        </div>
                        <Badge className={getStatusColor(workflow.status)}>
                          {getStatusIcon(workflow.status)}
                          <span className="ml-1 capitalize">{workflow.status.replace("_", " ")}</span>
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        {workflow.approvers.map((approver, idx) => (
                          <div key={approver.id} className="flex items-center gap-2">
                            <div className="flex items-center gap-2 px-3 py-2 bg-gray-900 rounded">
                              <UserCheck className="w-4 h-4" />
                              <span className="text-sm">{approver.name}</span>
                              <Badge className={`${getStatusColor(approver.status)} text-xs`}>
                                {approver.status}
                              </Badge>
                            </div>
                            {idx < workflow.approvers.length - 1 && (
                              <ArrowRight className="w-4 h-4 text-gray-600" />
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="text-sm text-gray-400">
                        Stage {workflow.currentStage} of {workflow.totalStages} •
                        Created {formatDate(workflow.createdDate)}
                      </div>
                    </div>
                  ))}
                  {workflows.length === 0 && (
                    <p className="text-center text-gray-400 py-8">No active workflows</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Certificates Tab */}
          <TabsContent value="certificates" className="space-y-4">
            <Card className="cyber-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-green-400" />
                  Completion Certificates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {certificates.map((cert) => (
                    <div key={cert.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-500/20 rounded-lg">
                          <Award className="w-6 h-6 text-green-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{cert.documentName}</h4>
                          <p className="text-sm text-gray-400">
                            Completed {formatDate(cert.completedDate)} • {cert.signers.length} signers
                          </p>
                          {cert.isVerified && (
                            <Badge className="bg-green-500/20 text-green-400 mt-1">
                              <Shield className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Certificate
                        </Button>
                        <Button variant="outline" size="sm">
                          <FileCheck className="w-4 h-4 mr-2" />
                          Audit Trail
                        </Button>
                      </div>
                    </div>
                  ))}
                  {certificates.length === 0 && (
                    <p className="text-center text-gray-400 py-8">No certificates available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
