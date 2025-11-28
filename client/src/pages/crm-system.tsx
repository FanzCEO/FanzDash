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
  Users,
  UserPlus,
  TrendingUp,
  DollarSign,
  Target,
  Mail,
  Phone,
  Calendar,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  Filter,
  Download,
  Plus,
  Edit,
  Trash2,
  Send,
  Eye,
  BarChart3,
  Building,
  Tag,
  MessageSquare,
  Activity,
  Copy,
  FileCode,
  Workflow,
} from "lucide-react";

interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  source: "website" | "referral" | "social_media" | "email_campaign" | "trade_show" | "cold_call" | "other";
  status: "new" | "contacted" | "qualified" | "proposal" | "negotiation" | "won" | "lost";
  assignedTo: string;
  estimatedValue: number;
  createdDate: string;
  lastContactDate?: string;
  notes?: string;
  tags: string[];
}

interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  industry: string;
  clientSince: string;
  totalRevenue: number;
  activeProjects: number;
  status: "active" | "inactive" | "pending";
  contactPerson: string;
  website?: string;
  notes?: string;
}

interface Deal {
  id: string;
  title: string;
  clientId: string;
  clientName: string;
  value: number;
  stage: "prospecting" | "qualification" | "proposal" | "negotiation" | "closed_won" | "closed_lost";
  probability: number;
  expectedCloseDate: string;
  actualCloseDate?: string;
  owner: string;
  products: string[];
  notes?: string;
  createdDate: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  relatedTo: string;
  relatedType: "lead" | "client" | "deal";
  assignedTo: string;
  dueDate: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "pending" | "in_progress" | "completed" | "cancelled";
  createdDate: string;
}

interface Activity {
  id: string;
  type: "call" | "email" | "meeting" | "note" | "task" | "deal_update";
  relatedTo: string;
  relatedType: "lead" | "client" | "deal";
  description: string;
  performedBy: string;
  timestamp: string;
}

interface Proposal {
  id: string;
  title: string;
  clientId: string;
  clientName: string;
  dealId?: string;
  amount: number;
  status: "draft" | "sent" | "viewed" | "accepted" | "rejected" | "expired";
  createdDate: string;
  sentDate?: string;
  validUntil: string;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  notes?: string;
}

function apiRequest(url: string, method: string, data?: any) {
  return fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  }).then((res) => res.json());
}

export default function CRMSystem() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("pipeline");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStage, setSelectedStage] = useState("all");
  const [showAddLead, setShowAddLead] = useState(false);
  const [showAddClient, setShowAddClient] = useState(false);
  const [showAddDeal, setShowAddDeal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [templateType, setTemplateType] = useState<string>("");

  // Fetch leads
  const { data: leads = [] } = useQuery<Lead[]>({
    queryKey: ["/api/crm/leads"],
    refetchInterval: 30000,
  });

  // Fetch clients
  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/crm/clients"],
    refetchInterval: 30000,
  });

  // Fetch deals
  const { data: deals = [] } = useQuery<Deal[]>({
    queryKey: ["/api/crm/deals", selectedStage],
    refetchInterval: 30000,
  });

  // Fetch tasks
  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/crm/tasks"],
    refetchInterval: 30000,
  });

  // Fetch activities
  const { data: activities = [] } = useQuery<Activity[]>({
    queryKey: ["/api/crm/activities"],
    refetchInterval: 30000,
  });

  // Fetch proposals
  const { data: proposals = [] } = useQuery<Proposal[]>({
    queryKey: ["/api/crm/proposals"],
    refetchInterval: 30000,
  });

  // Fetch templates
  const { data: emailTemplates = [] } = useQuery<any[]>({
    queryKey: ["/api/crm/templates/email"],
    refetchInterval: 30000,
  });

  const { data: proposalTemplates = [] } = useQuery<any[]>({
    queryKey: ["/api/crm/templates/proposals"],
    refetchInterval: 30000,
  });

  const { data: workflowTemplates = [] } = useQuery<any[]>({
    queryKey: ["/api/crm/templates/workflows"],
    refetchInterval: 30000,
  });

  // Create lead mutation
  const createLeadMutation = useMutation({
    mutationFn: (data: Partial<Lead>) => apiRequest("/api/crm/leads", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/leads"] });
      toast({ title: "Lead created successfully" });
      setShowAddLead(false);
    },
  });

  // Create client mutation
  const createClientMutation = useMutation({
    mutationFn: (data: Partial<Client>) => apiRequest("/api/crm/clients", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/clients"] });
      toast({ title: "Client added successfully" });
      setShowAddClient(false);
    },
  });

  // Create deal mutation
  const createDealMutation = useMutation({
    mutationFn: (data: Partial<Deal>) => apiRequest("/api/crm/deals", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/deals"] });
      toast({ title: "Deal created successfully" });
      setShowAddDeal(false);
    },
  });

  // Update deal stage mutation
  const updateDealStageMutation = useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: string }) =>
      apiRequest(`/api/crm/deals/${id}/stage`, "PUT", { stage }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/deals"] });
      toast({ title: "Deal stage updated" });
    },
  });

  // Convert lead to client mutation
  const convertLeadMutation = useMutation({
    mutationFn: (leadId: string) => apiRequest(`/api/crm/leads/${leadId}/convert`, "POST", {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/crm/clients"] });
      toast({ title: "Lead converted to client" });
    },
  });

  // Stats calculations
  const totalLeads = leads.length;
  const qualifiedLeads = leads.filter((l) => l.status === "qualified").length;
  const totalClients = clients.filter((c) => c.status === "active").length;
  const totalRevenue = deals
    .filter((d) => d.stage === "closed_won")
    .reduce((sum, d) => sum + d.value, 0);
  const pipelineValue = deals
    .filter((d) => d.stage !== "closed_won" && d.stage !== "closed_lost")
    .reduce((sum, d) => sum + d.value, 0);

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "won":
      case "closed_won":
      case "accepted":
      case "completed":
      case "active":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "new":
      case "pending":
      case "draft":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "qualified":
      case "proposal":
      case "sent":
      case "viewed":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "negotiation":
      case "in_progress":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "lost":
      case "closed_lost":
      case "rejected":
      case "cancelled":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  // Pipeline stages
  const pipelineStages = [
    { id: "prospecting", label: "Prospecting", color: "bg-blue-500" },
    { id: "qualification", label: "Qualification", color: "bg-cyan-500" },
    { id: "proposal", label: "Proposal", color: "bg-yellow-500" },
    { id: "negotiation", label: "Negotiation", color: "bg-orange-500" },
    { id: "closed_won", label: "Closed Won", color: "bg-green-500" },
    { id: "closed_lost", label: "Closed Lost", color: "bg-red-500" },
  ];

  // Export CSV
  const handleExportCSV = (type: "leads" | "clients" | "deals") => {
    let csv = "";
    let filename = "";

    if (type === "leads") {
      csv = "Name,Company,Email,Phone,Source,Status,Estimated Value,Created Date\n";
      leads.forEach((lead) => {
        csv += `${lead.name},${lead.company},${lead.email},${lead.phone},${lead.source},${lead.status},${lead.estimatedValue},${lead.createdDate}\n`;
      });
      filename = "leads";
    } else if (type === "clients") {
      csv = "Name,Company,Email,Phone,Industry,Client Since,Total Revenue,Status\n";
      clients.forEach((client) => {
        csv += `${client.name},${client.company},${client.email},${client.phone},${client.industry},${client.clientSince},${client.totalRevenue},${client.status}\n`;
      });
      filename = "clients";
    } else if (type === "deals") {
      csv = "Title,Client,Value,Stage,Probability,Expected Close,Owner,Created Date\n";
      deals.forEach((deal) => {
        csv += `${deal.title},${deal.clientName},${deal.value},${deal.stage},${deal.probability},${deal.expectedCloseDate},${deal.owner},${deal.createdDate}\n`;
      });
      filename = "deals";
    }

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({ title: `${type} exported successfully` });
  };

  return (
    <div className="min-h-screen cyber-bg p-4 md:p-6 lg:p-8">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold cyber-text-glow">
              CRM System
            </h1>
            <p className="text-gray-400 mt-2">
              Manage leads, clients, deals, and customer relationships
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowAddLead(true)}
              className="bg-gradient-to-r from-cyan-500 to-blue-500"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Lead
            </Button>
            <Button
              onClick={() => setShowAddDeal(true)}
              className="bg-gradient-to-r from-green-500 to-emerald-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Deal
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="cyber-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Leads</p>
                <p className="text-2xl font-bold mt-1">{totalLeads}</p>
              </div>
              <Target className="h-8 w-8 text-cyan-400" />
            </div>
          </Card>

          <Card className="cyber-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Qualified Leads</p>
                <p className="text-2xl font-bold mt-1">{qualifiedLeads}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </Card>

          <Card className="cyber-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Active Clients</p>
                <p className="text-2xl font-bold mt-1">{totalClients}</p>
              </div>
              <Users className="h-8 w-8 text-blue-400" />
            </div>
          </Card>

          <Card className="cyber-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Pipeline Value</p>
                <p className="text-2xl font-bold mt-1">
                  ${pipelineValue.toLocaleString()}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-yellow-400" />
            </div>
          </Card>

          <Card className="cyber-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Revenue</p>
                <p className="text-2xl font-bold mt-1">
                  ${totalRevenue.toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-400" />
            </div>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="cyber-card">
            <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="clients">Clients</TabsTrigger>
            <TabsTrigger value="proposals">Proposals</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          {/* Pipeline Tab */}
          <TabsContent value="pipeline" className="space-y-4">
            <Card className="cyber-card p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold">Sales Pipeline</h3>
                  <Button
                    onClick={() => handleExportCSV("deals")}
                    variant="outline"
                    size="sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>

                {/* Kanban Board */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {pipelineStages.map((stage) => {
                    const stageDeals = deals.filter((d) => d.stage === stage.id);
                    const stageValue = stageDeals.reduce((sum, d) => sum + d.value, 0);

                    return (
                      <div key={stage.id} className="space-y-2">
                        <div className={`p-3 rounded-lg ${stage.color} bg-opacity-20`}>
                          <p className="font-semibold text-sm">{stage.label}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {stageDeals.length} deals • ${stageValue.toLocaleString()}
                          </p>
                        </div>
                        <div className="space-y-2">
                          {stageDeals.map((deal) => (
                            <div
                              key={deal.id}
                              className="cyber-card p-3 cursor-pointer hover:bg-gray-800/50 transition-colors"
                              onClick={() => setSelectedItem(deal)}
                            >
                              <p className="font-semibold text-sm mb-1">{deal.title}</p>
                              <p className="text-xs text-gray-400 mb-2">{deal.clientName}</p>
                              <p className="text-sm font-bold text-green-400">
                                ${deal.value.toLocaleString()}
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                <Badge variant="outline" className="text-xs">
                                  {deal.probability}%
                                </Badge>
                                <p className="text-xs text-gray-500">
                                  {new Date(deal.expectedCloseDate).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Leads Tab */}
          <TabsContent value="leads" className="space-y-4">
            <Card className="cyber-card p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold">Leads</h3>
                  <Button
                    onClick={() => handleExportCSV("leads")}
                    variant="outline"
                    size="sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search leads..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="cyber-input pl-10"
                  />
                </div>

                <div className="space-y-2">
                  {leads
                    .filter((lead) =>
                      searchQuery === ""
                        ? true
                        : lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          lead.company.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((lead) => (
                      <div key={lead.id} className="cyber-card p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <p className="font-semibold">{lead.name}</p>
                              <Badge variant="outline">{lead.company}</Badge>
                              <Badge className={getStatusColor(lead.status)}>
                                {lead.status}
                              </Badge>
                              {lead.tags.map((tag, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-400">
                              <div className="flex items-center gap-1">
                                <Mail className="h-4 w-4" />
                                {lead.email}
                              </div>
                              <div className="flex items-center gap-1">
                                <Phone className="h-4 w-4" />
                                {lead.phone}
                              </div>
                              <div className="flex items-center gap-1">
                                <Tag className="h-4 w-4" />
                                {lead.source}
                              </div>
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-4 w-4" />
                                ${lead.estimatedValue.toLocaleString()}
                              </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                              Created: {new Date(lead.createdDate).toLocaleDateString()} •
                              Assigned to: {lead.assignedTo}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {lead.status === "qualified" && (
                              <Button
                                size="sm"
                                onClick={() => convertLeadMutation.mutate(lead.id)}
                                className="bg-green-500/20 text-green-400 hover:bg-green-500/30"
                              >
                                Convert
                              </Button>
                            )}
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  {leads.length === 0 && (
                    <p className="text-center text-gray-400 py-8">No leads found</p>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Clients Tab */}
          <TabsContent value="clients" className="space-y-4">
            <Card className="cyber-card p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold">Clients</h3>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleExportCSV("clients")}
                      variant="outline"
                      size="sm"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    <Button onClick={() => setShowAddClient(true)}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Client
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {clients.map((client) => (
                    <div key={client.id} className="cyber-card p-4">
                      <div className="flex items-center justify-between mb-3">
                        <Badge className={getStatusColor(client.status)}>
                          {client.status}
                        </Badge>
                        <Building className="h-5 w-5 text-cyan-400" />
                      </div>
                      <h4 className="font-semibold text-lg mb-1">{client.name}</h4>
                      <p className="text-sm text-gray-400 mb-3">{client.company}</p>
                      <div className="space-y-1 text-xs text-gray-500">
                        <p>Industry: {client.industry}</p>
                        <p>Contact: {client.contactPerson}</p>
                        <p>Client since: {new Date(client.clientSince).toLocaleDateString()}</p>
                        <p className="font-semibold text-green-400">
                          Revenue: ${client.totalRevenue.toLocaleString()}
                        </p>
                        <p>Active Projects: {client.activeProjects}</p>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {clients.length === 0 && (
                    <div className="col-span-3 text-center text-gray-400 py-8">
                      No clients found
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Proposals Tab */}
          <TabsContent value="proposals" className="space-y-4">
            <Card className="cyber-card p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold">Proposals</h3>
                  <Button className="bg-gradient-to-r from-purple-500 to-pink-500">
                    <FileText className="h-4 w-4 mr-2" />
                    New Proposal
                  </Button>
                </div>

                <div className="space-y-2">
                  {proposals.map((proposal) => (
                    <div key={proposal.id} className="cyber-card p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="font-semibold">{proposal.title}</p>
                            <Badge className={getStatusColor(proposal.status)}>
                              {proposal.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-400 mb-2">
                            Client: {proposal.clientName}
                          </p>
                          <div className="flex items-center gap-4 text-sm">
                            <div>
                              <p className="text-gray-500">Amount</p>
                              <p className="font-semibold text-green-400">
                                ${proposal.amount.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500">Created</p>
                              <p className="text-gray-400">
                                {new Date(proposal.createdDate).toLocaleDateString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500">Valid Until</p>
                              <p className="text-gray-400">
                                {new Date(proposal.validUntil).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {proposal.status === "draft" && (
                            <Button size="sm" className="bg-blue-500/20 text-blue-400">
                              <Send className="h-4 w-4 mr-1" />
                              Send
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {proposals.length === 0 && (
                    <p className="text-center text-gray-400 py-8">No proposals found</p>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-4">
            <Card className="cyber-card p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold">Tasks</h3>
                  <Button className="bg-gradient-to-r from-orange-500 to-red-500">
                    <Plus className="h-4 w-4 mr-2" />
                    New Task
                  </Button>
                </div>

                <div className="space-y-2">
                  {tasks.map((task) => (
                    <div key={task.id} className="cyber-card p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="font-semibold">{task.title}</p>
                            <Badge
                              variant="outline"
                              className={
                                task.priority === "urgent"
                                  ? "border-red-500 text-red-400"
                                  : task.priority === "high"
                                  ? "border-orange-500 text-orange-400"
                                  : task.priority === "medium"
                                  ? "border-yellow-500 text-yellow-400"
                                  : "border-gray-500 text-gray-400"
                              }
                            >
                              {task.priority}
                            </Badge>
                            <Badge className={getStatusColor(task.status)}>
                              {task.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-400 mb-2">{task.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <p>Related to: {task.relatedType} - {task.relatedTo}</p>
                            <p>Assigned to: {task.assignedTo}</p>
                            <p>Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {tasks.length === 0 && (
                    <p className="text-center text-gray-400 py-8">No tasks found</p>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-4">
            <Card className="cyber-card p-6">
              <div className="space-y-4">
                <h3 className="text-xl font-bold">Recent Activity</h3>
                <div className="space-y-3">
                  {activities.slice(0, 20).map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 border-l-2 border-cyan-500 pl-4 py-2">
                      <Activity className="h-5 w-5 text-cyan-400 mt-1" />
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-semibold">{activity.performedBy}</span>{" "}
                          {activity.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(activity.timestamp).toLocaleString()} •{" "}
                          {activity.relatedType}: {activity.relatedTo}
                        </p>
                      </div>
                    </div>
                  ))}
                  {activities.length === 0 && (
                    <p className="text-center text-gray-400 py-8">No recent activity</p>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-4">
            {/* Email Templates */}
            <Card className="cyber-card p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-cyan-400" />
                    <h3 className="text-xl font-bold">Email Templates</h3>
                    <Badge variant="outline">{emailTemplates.length}</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {emailTemplates.map((template) => (
                    <div key={template.id} className="cyber-card p-4 hover:bg-gray-800/50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold">{template.name}</h4>
                          <Badge variant="outline" className="mt-1 text-xs">
                            {template.category}
                          </Badge>
                        </div>
                        <FileCode className="h-5 w-5 text-cyan-400" />
                      </div>
                      <p className="text-sm text-gray-400 mb-3">
                        Subject: {template.subject}
                      </p>
                      <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                        {template.body}
                      </p>
                      {template.variables && template.variables.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs text-gray-500 mb-1">Variables:</p>
                          <div className="flex flex-wrap gap-1">
                            {template.variables.slice(0, 3).map((v: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {v}
                              </Badge>
                            ))}
                            {template.variables.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{template.variables.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            setSelectedTemplate(template);
                            setTemplateType("email");
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Preview
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(template.body);
                            toast({ title: "Template copied to clipboard" });
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {emailTemplates.length === 0 && (
                    <div className="col-span-3 text-center text-gray-400 py-8">
                      No email templates found
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Proposal Templates */}
            <Card className="cyber-card p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-purple-400" />
                    <h3 className="text-xl font-bold">Proposal Templates</h3>
                    <Badge variant="outline">{proposalTemplates.length}</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {proposalTemplates.map((template) => (
                    <div key={template.id} className="cyber-card p-4 hover:bg-gray-800/50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold">{template.name}</h4>
                          <Badge variant="outline" className="mt-1 text-xs">
                            {template.type}
                          </Badge>
                        </div>
                        <FileText className="h-5 w-5 text-purple-400" />
                      </div>
                      <p className="text-sm text-gray-400 mb-3">{template.description}</p>
                      {template.sections && template.sections.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs text-gray-500 mb-1">Sections:</p>
                          <div className="flex flex-wrap gap-1">
                            {template.sections.slice(0, 4).map((section: any, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {section.title}
                              </Badge>
                            ))}
                            {template.sections.length > 4 && (
                              <Badge variant="outline" className="text-xs">
                                +{template.sections.length - 4} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            setSelectedTemplate(template);
                            setTemplateType("proposal");
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Preview
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            toast({ title: "Template ready to use" });
                          }}
                        >
                          Use Template
                        </Button>
                      </div>
                    </div>
                  ))}
                  {proposalTemplates.length === 0 && (
                    <div className="col-span-2 text-center text-gray-400 py-8">
                      No proposal templates found
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Workflow Templates */}
            <Card className="cyber-card p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Workflow className="h-5 w-5 text-green-400" />
                    <h3 className="text-xl font-bold">Workflow Templates</h3>
                    <Badge variant="outline">{workflowTemplates.length}</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {workflowTemplates.map((template) => (
                    <div key={template.id} className="cyber-card p-4 hover:bg-gray-800/50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold">{template.name}</h4>
                          <Badge variant="outline" className="mt-1 text-xs">
                            {template.trigger}
                          </Badge>
                        </div>
                        <Workflow className="h-5 w-5 text-green-400" />
                      </div>
                      <p className="text-sm text-gray-400 mb-3">{template.description}</p>
                      {template.steps && template.steps.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs text-gray-500 mb-1">Steps ({template.steps.length}):</p>
                          <div className="space-y-1">
                            {template.steps.slice(0, 3).map((step: any, idx: number) => (
                              <div key={idx} className="flex items-start gap-2 text-xs">
                                <span className="text-gray-500">{idx + 1}.</span>
                                <span className="text-gray-400">{step.action}</span>
                              </div>
                            ))}
                            {template.steps.length > 3 && (
                              <p className="text-xs text-gray-500">
                                +{template.steps.length - 3} more steps
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            setSelectedTemplate(template);
                            setTemplateType("workflow");
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Preview
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            toast({ title: "Workflow activated" });
                          }}
                        >
                          Activate
                        </Button>
                      </div>
                    </div>
                  ))}
                  {workflowTemplates.length === 0 && (
                    <div className="col-span-2 text-center text-gray-400 py-8">
                      No workflow templates found
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add Lead Dialog */}
        <Dialog open={showAddLead} onOpenChange={setShowAddLead}>
          <DialogContent className="cyber-card max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Lead</DialogTitle>
              <DialogDescription>Enter lead information</DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                createLeadMutation.mutate({
                  name: formData.get("name") as string,
                  company: formData.get("company") as string,
                  email: formData.get("email") as string,
                  phone: formData.get("phone") as string,
                  source: formData.get("source") as any,
                  status: "new",
                  assignedTo: formData.get("assignedTo") as string,
                  estimatedValue: parseFloat(formData.get("estimatedValue") as string),
                  tags: (formData.get("tags") as string).split(",").map((t) => t.trim()),
                  notes: formData.get("notes") as string,
                });
              }}
            >
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Name</Label>
                    <Input name="name" required className="cyber-input" />
                  </div>
                  <div>
                    <Label>Company</Label>
                    <Input name="company" required className="cyber-input" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Email</Label>
                    <Input name="email" type="email" required className="cyber-input" />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input name="phone" required className="cyber-input" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Source</Label>
                    <Select name="source" required>
                      <SelectTrigger className="cyber-input">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="website">Website</SelectItem>
                        <SelectItem value="referral">Referral</SelectItem>
                        <SelectItem value="social_media">Social Media</SelectItem>
                        <SelectItem value="email_campaign">Email Campaign</SelectItem>
                        <SelectItem value="trade_show">Trade Show</SelectItem>
                        <SelectItem value="cold_call">Cold Call</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Estimated Value</Label>
                    <Input
                      name="estimatedValue"
                      type="number"
                      step="0.01"
                      required
                      className="cyber-input"
                    />
                  </div>
                </div>
                <div>
                  <Label>Assigned To</Label>
                  <Input name="assignedTo" required className="cyber-input" />
                </div>
                <div>
                  <Label>Tags (comma separated)</Label>
                  <Input name="tags" placeholder="tag1, tag2, tag3" className="cyber-input" />
                </div>
                <div>
                  <Label>Notes</Label>
                  <Textarea name="notes" className="cyber-input" />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowAddLead(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-cyan-500 to-blue-500">
                  Add Lead
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Add Client Dialog */}
        <Dialog open={showAddClient} onOpenChange={setShowAddClient}>
          <DialogContent className="cyber-card max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Client</DialogTitle>
              <DialogDescription>Enter client information</DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                createClientMutation.mutate({
                  name: formData.get("name") as string,
                  company: formData.get("company") as string,
                  email: formData.get("email") as string,
                  phone: formData.get("phone") as string,
                  address: formData.get("address") as string,
                  industry: formData.get("industry") as string,
                  contactPerson: formData.get("contactPerson") as string,
                  website: formData.get("website") as string,
                  notes: formData.get("notes") as string,
                });
              }}
            >
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Client Name</Label>
                    <Input name="name" required className="cyber-input" />
                  </div>
                  <div>
                    <Label>Company</Label>
                    <Input name="company" required className="cyber-input" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Email</Label>
                    <Input name="email" type="email" required className="cyber-input" />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input name="phone" required className="cyber-input" />
                  </div>
                </div>
                <div>
                  <Label>Address</Label>
                  <Input name="address" required className="cyber-input" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Industry</Label>
                    <Input name="industry" required className="cyber-input" />
                  </div>
                  <div>
                    <Label>Contact Person</Label>
                    <Input name="contactPerson" required className="cyber-input" />
                  </div>
                </div>
                <div>
                  <Label>Website</Label>
                  <Input name="website" placeholder="https://" className="cyber-input" />
                </div>
                <div>
                  <Label>Notes</Label>
                  <Textarea name="notes" className="cyber-input" />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowAddClient(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-green-500 to-emerald-500">
                  Add Client
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Add Deal Dialog */}
        <Dialog open={showAddDeal} onOpenChange={setShowAddDeal}>
          <DialogContent className="cyber-card max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Deal</DialogTitle>
              <DialogDescription>Enter deal information</DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                createDealMutation.mutate({
                  title: formData.get("title") as string,
                  clientId: formData.get("clientId") as string,
                  value: parseFloat(formData.get("value") as string),
                  stage: "prospecting",
                  probability: parseFloat(formData.get("probability") as string),
                  expectedCloseDate: formData.get("expectedCloseDate") as string,
                  owner: formData.get("owner") as string,
                  products: (formData.get("products") as string).split(",").map((p) => p.trim()),
                  notes: formData.get("notes") as string,
                });
              }}
            >
              <div className="space-y-4 py-4">
                <div>
                  <Label>Deal Title</Label>
                  <Input name="title" required className="cyber-input" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Client</Label>
                    <Select name="clientId" required>
                      <SelectTrigger className="cyber-input">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name} - {client.company}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Deal Value</Label>
                    <Input
                      name="value"
                      type="number"
                      step="0.01"
                      required
                      className="cyber-input"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Probability (%)</Label>
                    <Input
                      name="probability"
                      type="number"
                      min="0"
                      max="100"
                      required
                      className="cyber-input"
                    />
                  </div>
                  <div>
                    <Label>Expected Close Date</Label>
                    <Input
                      name="expectedCloseDate"
                      type="date"
                      required
                      className="cyber-input"
                    />
                  </div>
                </div>
                <div>
                  <Label>Deal Owner</Label>
                  <Input name="owner" required className="cyber-input" />
                </div>
                <div>
                  <Label>Products/Services (comma separated)</Label>
                  <Input
                    name="products"
                    placeholder="product1, product2, product3"
                    className="cyber-input"
                  />
                </div>
                <div>
                  <Label>Notes</Label>
                  <Textarea name="notes" className="cyber-input" />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowAddDeal(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-green-500 to-emerald-500">
                  Create Deal
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Template Preview Dialog */}
        <Dialog
          open={selectedTemplate !== null}
          onOpenChange={(open) => !open && setSelectedTemplate(null)}
        >
          <DialogContent className="cyber-card max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {templateType === "email" && <Mail className="h-5 w-5 text-cyan-400" />}
                {templateType === "proposal" && <FileText className="h-5 w-5 text-purple-400" />}
                {templateType === "workflow" && <Workflow className="h-5 w-5 text-green-400" />}
                {selectedTemplate?.name}
              </DialogTitle>
              <DialogDescription>
                {templateType === "email" && `Category: ${selectedTemplate?.category}`}
                {templateType === "proposal" && `Type: ${selectedTemplate?.type}`}
                {templateType === "workflow" && `Trigger: ${selectedTemplate?.trigger}`}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Email Template Preview */}
              {templateType === "email" && selectedTemplate && (
                <>
                  <div>
                    <Label className="text-sm font-semibold">Subject</Label>
                    <div className="cyber-card p-3 mt-1">
                      <p className="text-sm">{selectedTemplate.subject}</p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">Body</Label>
                    <div className="cyber-card p-3 mt-1">
                      <pre className="text-sm whitespace-pre-wrap font-sans">
                        {selectedTemplate.body}
                      </pre>
                    </div>
                  </div>
                  {selectedTemplate.variables && selectedTemplate.variables.length > 0 && (
                    <div>
                      <Label className="text-sm font-semibold">Variables</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedTemplate.variables.map((v: string, idx: number) => (
                          <Badge key={idx} variant="outline">
                            {"{{"}{v}{"}}"}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Proposal Template Preview */}
              {templateType === "proposal" && selectedTemplate && (
                <>
                  <div>
                    <Label className="text-sm font-semibold">Description</Label>
                    <p className="text-sm text-gray-400 mt-1">
                      {selectedTemplate.description}
                    </p>
                  </div>
                  {selectedTemplate.sections && selectedTemplate.sections.length > 0 && (
                    <div>
                      <Label className="text-sm font-semibold">Sections</Label>
                      <div className="space-y-3 mt-2">
                        {selectedTemplate.sections.map((section: any, idx: number) => (
                          <div key={idx} className="cyber-card p-4">
                            <h4 className="font-semibold text-sm mb-2">{section.title}</h4>
                            <pre className="text-xs text-gray-400 whitespace-pre-wrap font-sans">
                              {section.content}
                            </pre>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Workflow Template Preview */}
              {templateType === "workflow" && selectedTemplate && (
                <>
                  <div>
                    <Label className="text-sm font-semibold">Description</Label>
                    <p className="text-sm text-gray-400 mt-1">
                      {selectedTemplate.description}
                    </p>
                  </div>
                  {selectedTemplate.steps && selectedTemplate.steps.length > 0 && (
                    <div>
                      <Label className="text-sm font-semibold">Workflow Steps</Label>
                      <div className="space-y-2 mt-2">
                        {selectedTemplate.steps.map((step: any, idx: number) => (
                          <div key={idx} className="cyber-card p-3 flex items-start gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500/20 text-green-400 text-sm font-bold flex-shrink-0">
                              {idx + 1}
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-sm">{step.action}</p>
                              {step.condition && (
                                <p className="text-xs text-gray-400 mt-1">
                                  Condition: {step.condition}
                                </p>
                              )}
                              {step.delay && (
                                <Badge variant="outline" className="mt-2 text-xs">
                                  Delay: {step.delay}
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <DialogFooter className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setSelectedTemplate(null)}
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  if (templateType === "email" && selectedTemplate) {
                    navigator.clipboard.writeText(selectedTemplate.body);
                    toast({ title: "Template copied to clipboard" });
                  } else {
                    toast({ title: "Template ready to use" });
                  }
                  setSelectedTemplate(null);
                }}
                className="bg-gradient-to-r from-cyan-500 to-blue-500"
              >
                <Copy className="h-4 w-4 mr-2" />
                {templateType === "email" ? "Copy Template" : "Use Template"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
