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
  Package,
  Layers,
  FolderKanban,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Plus,
  Edit,
  Download,
  Search,
  BarChart3,
  FileText,
  ShoppingCart,
  Truck,
  Warehouse,
  CheckCircle,
  Clock,
  Target,
  Users,
  Calendar,
  Boxes,
  Settings,
  PieChart,
  Mail,
  Copy,
  FileCode,
  Workflow,
  Eye,
} from "lucide-react";

interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  description: string;
  quantity: number;
  reorderLevel: number;
  unitPrice: number;
  cost: number;
  supplier: string;
  warehouse: string;
  status: "in_stock" | "low_stock" | "out_of_stock" | "discontinued";
  lastRestocked: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  status: "planning" | "in_progress" | "on_hold" | "completed" | "cancelled";
  priority: "low" | "medium" | "high" | "critical";
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  progress: number;
  manager: string;
  team: string[];
  client?: string;
  milestones: {
    id: string;
    name: string;
    dueDate: string;
    completed: boolean;
  }[];
}

interface Resource {
  id: string;
  name: string;
  type: "equipment" | "material" | "facility" | "software" | "other";
  description: string;
  quantity: number;
  unit: string;
  costPerUnit: number;
  status: "available" | "in_use" | "maintenance" | "retired";
  location: string;
  assignedTo?: string;
  nextMaintenance?: string;
}

interface FinancialAccount {
  id: string;
  accountNumber: string;
  accountName: string;
  type: "asset" | "liability" | "equity" | "revenue" | "expense";
  balance: number;
  currency: string;
  description: string;
  parentAccount?: string;
  isActive: boolean;
}

interface Transaction {
  id: string;
  date: string;
  type: "income" | "expense" | "transfer";
  category: string;
  amount: number;
  account: string;
  description: string;
  reference?: string;
  attachments?: string[];
  status: "pending" | "completed" | "cancelled";
}

interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplier: string;
  orderDate: string;
  expectedDelivery: string;
  status: "draft" | "sent" | "confirmed" | "received" | "cancelled";
  items: {
    itemId: string;
    itemName: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
}

interface Budget {
  id: string;
  name: string;
  period: string;
  category: string;
  allocated: number;
  spent: number;
  remaining: number;
  department: string;
  status: "draft" | "approved" | "active" | "completed";
}

function apiRequest(url: string, method: string, data?: any) {
  return fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  }).then((res) => res.json());
}

export default function ERPSystem() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddProject, setShowAddProject] = useState(false);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [templateType, setTemplateType] = useState<string>("");

  // Fetch inventory
  const { data: inventory = [] } = useQuery<InventoryItem[]>({
    queryKey: ["/api/erp/inventory"],
    refetchInterval: 30000,
  });

  // Fetch projects
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/erp/projects"],
    refetchInterval: 30000,
  });

  // Fetch resources
  const { data: resources = [] } = useQuery<Resource[]>({
    queryKey: ["/api/erp/resources"],
    refetchInterval: 30000,
  });

  // Fetch financial accounts
  const { data: accounts = [] } = useQuery<FinancialAccount[]>({
    queryKey: ["/api/erp/accounts"],
  });

  // Fetch transactions
  const { data: transactions = [] } = useQuery<Transaction[]>({
    queryKey: ["/api/erp/transactions"],
    refetchInterval: 30000,
  });

  // Fetch purchase orders
  const { data: purchaseOrders = [] } = useQuery<PurchaseOrder[]>({
    queryKey: ["/api/erp/purchase-orders"],
    refetchInterval: 30000,
  });

  // Fetch budgets
  const { data: budgets = [] } = useQuery<Budget[]>({
    queryKey: ["/api/erp/budgets"],
  });

  // Fetch templates (from CRM endpoints)
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

  // Create inventory item mutation
  const createInventoryMutation = useMutation({
    mutationFn: (data: Partial<InventoryItem>) =>
      apiRequest("/api/erp/inventory", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/erp/inventory"] });
      toast({ title: "Inventory item added successfully" });
      setShowAddItem(false);
    },
  });

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: (data: Partial<Project>) => apiRequest("/api/erp/projects", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/erp/projects"] });
      toast({ title: "Project created successfully" });
      setShowAddProject(false);
    },
  });

  // Create transaction mutation
  const createTransactionMutation = useMutation({
    mutationFn: (data: Partial<Transaction>) =>
      apiRequest("/api/erp/transactions", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/erp/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/erp/accounts"] });
      toast({ title: "Transaction recorded successfully" });
      setShowAddTransaction(false);
    },
  });

  // Stats calculations
  const totalInventoryValue = inventory.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );
  const lowStockItems = inventory.filter((item) => item.quantity <= item.reorderLevel).length;
  const activeProjects = projects.filter((p) => p.status === "in_progress").length;
  const totalRevenue = transactions
    .filter((t) => t.type === "income" && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions
    .filter((t) => t.type === "expense" && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);
  const netProfit = totalRevenue - totalExpenses;

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
      case "confirmed":
      case "received":
      case "in_stock":
      case "available":
      case "active":
      case "approved":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "in_progress":
      case "sent":
      case "in_use":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "pending":
      case "draft":
      case "planning":
      case "low_stock":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "on_hold":
      case "maintenance":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "cancelled":
      case "out_of_stock":
      case "discontinued":
      case "retired":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  // Export to CSV
  const handleExportCSV = (type: "inventory" | "transactions" | "projects") => {
    let csv = "";
    let filename = "";

    if (type === "inventory") {
      csv = "SKU,Name,Category,Quantity,Reorder Level,Unit Price,Cost,Supplier,Status\n";
      inventory.forEach((item) => {
        csv += `${item.sku},${item.name},${item.category},${item.quantity},${item.reorderLevel},${item.unitPrice},${item.cost},${item.supplier},${item.status}\n`;
      });
      filename = "inventory";
    } else if (type === "transactions") {
      csv = "Date,Type,Category,Amount,Account,Description,Status\n";
      transactions.forEach((t) => {
        csv += `${t.date},${t.type},${t.category},${t.amount},${t.account},${t.description},${t.status}\n`;
      });
      filename = "transactions";
    } else if (type === "projects") {
      csv = "Name,Status,Priority,Start Date,End Date,Budget,Spent,Progress,Manager\n";
      projects.forEach((p) => {
        csv += `${p.name},${p.status},${p.priority},${p.startDate},${p.endDate},${p.budget},${p.spent},${p.progress},${p.manager}\n`;
      });
      filename = "projects";
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
              ERP System
            </h1>
            <p className="text-gray-400 mt-2">
              Enterprise Resource Planning - Inventory, Projects, Resources & Financials
            </p>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="cyber-card">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="financials">Financials</TabsTrigger>
            <TabsTrigger value="purchasing">Purchasing</TabsTrigger>
            <TabsTrigger value="budgets">Budgets</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-4">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="cyber-card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Inventory Value</p>
                    <p className="text-2xl font-bold mt-1">
                      ${totalInventoryValue.toLocaleString()}
                    </p>
                  </div>
                  <Package className="h-8 w-8 text-cyan-400" />
                </div>
              </Card>

              <Card className="cyber-card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Active Projects</p>
                    <p className="text-2xl font-bold mt-1">{activeProjects}</p>
                  </div>
                  <FolderKanban className="h-8 w-8 text-blue-400" />
                </div>
              </Card>

              <Card className="cyber-card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Total Revenue</p>
                    <p className="text-2xl font-bold mt-1 text-green-400">
                      ${totalRevenue.toLocaleString()}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-400" />
                </div>
              </Card>

              <Card className="cyber-card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Net Profit</p>
                    <p className={`text-2xl font-bold mt-1 ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ${netProfit.toLocaleString()}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-yellow-400" />
                </div>
              </Card>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="cyber-card p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-400" />
                  Inventory Alerts
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-400">Low Stock Items</p>
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                      {lowStockItems}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-400">Out of Stock</p>
                    <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                      {inventory.filter((i) => i.status === "out_of_stock").length}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-400">Total Items</p>
                    <Badge variant="outline">{inventory.length}</Badge>
                  </div>
                </div>
              </Card>

              <Card className="cyber-card p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <FolderKanban className="h-5 w-5 text-blue-400" />
                  Project Status
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-400">In Progress</p>
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                      {activeProjects}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-400">Completed</p>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      {projects.filter((p) => p.status === "completed").length}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-400">On Hold</p>
                    <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                      {projects.filter((p) => p.status === "on_hold").length}
                    </Badge>
                  </div>
                </div>
              </Card>

              <Card className="cyber-card p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-green-400" />
                  Financial Summary
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-400">Revenue</p>
                    <p className="text-sm font-semibold text-green-400">
                      ${totalRevenue.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-400">Expenses</p>
                    <p className="text-sm font-semibold text-red-400">
                      ${totalExpenses.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex justify-between items-center border-t border-gray-700 pt-2">
                    <p className="text-sm font-semibold">Net Profit</p>
                    <p className={`text-sm font-bold ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ${netProfit.toLocaleString()}
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="cyber-card p-6">
              <h3 className="text-lg font-bold mb-4">Recent Transactions</h3>
              <div className="space-y-2">
                {transactions.slice(0, 5).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between py-2 border-b border-gray-800">
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{transaction.description}</p>
                      <p className="text-xs text-gray-400">
                        {transaction.category} • {new Date(transaction.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className={`font-semibold ${transaction.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                        {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
                      </p>
                      <Badge className={getStatusColor(transaction.status)}>
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-4">
            <Card className="cyber-card p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold">Inventory Management</h3>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleExportCSV("inventory")}
                      variant="outline"
                      size="sm"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    <Button onClick={() => setShowAddItem(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </div>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search inventory..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="cyber-input pl-10"
                  />
                </div>

                <div className="space-y-2">
                  {inventory
                    .filter((item) =>
                      searchQuery === ""
                        ? true
                        : item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.sku.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((item) => (
                      <div key={item.id} className="cyber-card p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <Package className="h-10 w-10 text-cyan-400" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-semibold">{item.name}</p>
                                <Badge variant="outline">{item.sku}</Badge>
                                <Badge className={getStatusColor(item.status)}>
                                  {item.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-400">
                                {item.category} • {item.warehouse} • Supplier: {item.supplier}
                              </p>
                              <div className="flex items-center gap-4 mt-2 text-xs">
                                <div>
                                  <p className="text-gray-500">Quantity</p>
                                  <p className="font-semibold">{item.quantity}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Reorder Level</p>
                                  <p className="font-semibold">{item.reorderLevel}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Unit Price</p>
                                  <p className="font-semibold text-green-400">
                                    ${item.unitPrice}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Total Value</p>
                                  <p className="font-semibold text-cyan-400">
                                    ${(item.quantity * item.unitPrice).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  {inventory.length === 0 && (
                    <p className="text-center text-gray-400 py-8">No inventory items found</p>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-4">
            <Card className="cyber-card p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold">Project Management</h3>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleExportCSV("projects")}
                      variant="outline"
                      size="sm"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    <Button onClick={() => setShowAddProject(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      New Project
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {projects.map((project) => (
                    <div key={project.id} className="cyber-card p-4">
                      <div className="flex items-center justify-between mb-3">
                        <Badge className={getStatusColor(project.status)}>
                          {project.status}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={
                            project.priority === "critical"
                              ? "border-red-500 text-red-400"
                              : project.priority === "high"
                              ? "border-orange-500 text-orange-400"
                              : project.priority === "medium"
                              ? "border-yellow-500 text-yellow-400"
                              : "border-gray-500 text-gray-400"
                          }
                        >
                          {project.priority}
                        </Badge>
                      </div>
                      <h4 className="font-semibold text-lg mb-2">{project.name}</h4>
                      <p className="text-sm text-gray-400 mb-3">{project.description}</p>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Manager:</span>
                          <span>{project.manager}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Timeline:</span>
                          <span>
                            {new Date(project.startDate).toLocaleDateString()} -{" "}
                            {new Date(project.endDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Budget:</span>
                          <span className="font-semibold">${project.budget.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Spent:</span>
                          <span className="text-red-400">${project.spent.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Remaining:</span>
                          <span className="text-green-400">
                            ${(project.budget - project.spent).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-500">Progress</span>
                          <span className="font-semibold">{project.progress}%</span>
                        </div>
                        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="outline" className="flex-1">
                          View Details
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {projects.length === 0 && (
                    <div className="col-span-2 text-center text-gray-400 py-8">
                      No projects found
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className="space-y-4">
            <Card className="cyber-card p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold">Resource Management</h3>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Resource
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {resources.map((resource) => (
                    <div key={resource.id} className="cyber-card p-4">
                      <div className="flex items-center justify-between mb-3">
                        <Badge
                          variant="outline"
                          className="bg-purple-500/20 text-purple-400 border-purple-500/30"
                        >
                          {resource.type}
                        </Badge>
                        <Badge className={getStatusColor(resource.status)}>
                          {resource.status}
                        </Badge>
                      </div>
                      <h4 className="font-semibold mb-2">{resource.name}</h4>
                      <p className="text-sm text-gray-400 mb-3">{resource.description}</p>
                      <div className="text-xs text-gray-500 space-y-1">
                        <p>Location: {resource.location}</p>
                        <p>
                          Quantity: {resource.quantity} {resource.unit}
                        </p>
                        <p>Cost: ${resource.costPerUnit} per {resource.unit}</p>
                        {resource.assignedTo && <p>Assigned to: {resource.assignedTo}</p>}
                        {resource.nextMaintenance && (
                          <p>
                            Next Maintenance:{" "}
                            {new Date(resource.nextMaintenance).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                  {resources.length === 0 && (
                    <div className="col-span-3 text-center text-gray-400 py-8">
                      No resources found
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Financials Tab */}
          <TabsContent value="financials" className="space-y-4">
            <Card className="cyber-card p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold">Financial Management</h3>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleExportCSV("transactions")}
                      variant="outline"
                      size="sm"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    <Button onClick={() => setShowAddTransaction(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      New Transaction
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card className="cyber-card p-4">
                    <p className="text-sm text-gray-400 mb-1">Total Revenue</p>
                    <p className="text-2xl font-bold text-green-400">
                      ${totalRevenue.toLocaleString()}
                    </p>
                  </Card>
                  <Card className="cyber-card p-4">
                    <p className="text-sm text-gray-400 mb-1">Total Expenses</p>
                    <p className="text-2xl font-bold text-red-400">
                      ${totalExpenses.toLocaleString()}
                    </p>
                  </Card>
                  <Card className="cyber-card p-4">
                    <p className="text-sm text-gray-400 mb-1">Net Profit/Loss</p>
                    <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ${netProfit.toLocaleString()}
                    </p>
                  </Card>
                </div>

                <div className="space-y-2">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="cyber-card p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold">{transaction.description}</p>
                            <Badge
                              variant="outline"
                              className={
                                transaction.type === "income"
                                  ? "border-green-500 text-green-400"
                                  : transaction.type === "expense"
                                  ? "border-red-500 text-red-400"
                                  : "border-blue-500 text-blue-400"
                              }
                            >
                              {transaction.type}
                            </Badge>
                            <Badge className={getStatusColor(transaction.status)}>
                              {transaction.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-400">
                            {transaction.category} • {transaction.account} •{" "}
                            {new Date(transaction.date).toLocaleDateString()}
                          </p>
                          {transaction.reference && (
                            <p className="text-xs text-gray-500 mt-1">
                              Ref: {transaction.reference}
                            </p>
                          )}
                        </div>
                        <p
                          className={`text-xl font-bold ${
                            transaction.type === "income" ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {transaction.type === "income" ? "+" : "-"}$
                          {transaction.amount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {transactions.length === 0 && (
                    <p className="text-center text-gray-400 py-8">No transactions found</p>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Purchasing Tab */}
          <TabsContent value="purchasing" className="space-y-4">
            <Card className="cyber-card p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold">Purchase Orders</h3>
                  <Button className="bg-gradient-to-r from-purple-500 to-pink-500">
                    <Plus className="h-4 w-4 mr-2" />
                    New PO
                  </Button>
                </div>

                <div className="space-y-2">
                  {purchaseOrders.map((po) => (
                    <div key={po.id} className="cyber-card p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">PO #{po.poNumber}</p>
                          <Badge className={getStatusColor(po.status)}>{po.status}</Badge>
                        </div>
                        <p className="text-lg font-bold text-green-400">
                          ${po.total.toLocaleString()}
                        </p>
                      </div>
                      <p className="text-sm text-gray-400 mb-3">Supplier: {po.supplier}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <p>Order Date: {new Date(po.orderDate).toLocaleDateString()}</p>
                        <p>
                          Expected Delivery:{" "}
                          {new Date(po.expectedDelivery).toLocaleDateString()}
                        </p>
                        <p>{po.items.length} items</p>
                      </div>
                    </div>
                  ))}
                  {purchaseOrders.length === 0 && (
                    <p className="text-center text-gray-400 py-8">No purchase orders found</p>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Budgets Tab */}
          <TabsContent value="budgets" className="space-y-4">
            <Card className="cyber-card p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold">Budget Management</h3>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Budget
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {budgets.map((budget) => (
                    <div key={budget.id} className="cyber-card p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">{budget.name}</h4>
                        <Badge className={getStatusColor(budget.status)}>
                          {budget.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-400 mb-3">
                        {budget.category} • {budget.department} • {budget.period}
                      </p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Allocated</span>
                          <span className="font-semibold">
                            ${budget.allocated.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Spent</span>
                          <span className="text-red-400">
                            ${budget.spent.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Remaining</span>
                          <span className="text-green-400">
                            ${budget.remaining.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-500">Utilization</span>
                          <span className="font-semibold">
                            {((budget.spent / budget.allocated) * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              (budget.spent / budget.allocated) * 100 > 90
                                ? "bg-red-500"
                                : (budget.spent / budget.allocated) * 100 > 75
                                ? "bg-yellow-500"
                                : "bg-green-500"
                            }`}
                            style={{
                              width: `${Math.min((budget.spent / budget.allocated) * 100, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  {budgets.length === 0 && (
                    <div className="col-span-2 text-center text-gray-400 py-8">
                      No budgets found
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Templates Tab - Same templates from CRM */}
          <TabsContent value="templates" className="space-y-4">
            <Card className="cyber-card p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-cyan-400" />
                  <h3 className="text-xl font-bold">Email Templates</h3>
                  <Badge variant="outline">{emailTemplates.length}</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {emailTemplates.map((template) => (
                    <div key={template.id} className="cyber-card p-4 hover:bg-gray-800/50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold">{template.name}</h4>
                          <Badge variant="outline" className="mt-1 text-xs">{template.category}</Badge>
                        </div>
                        <FileCode className="h-5 w-5 text-cyan-400" />
                      </div>
                      <p className="text-sm text-gray-400 mb-3">Subject: {template.subject}</p>
                      <p className="text-xs text-gray-500 mb-3 line-clamp-2">{template.body}</p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1" onClick={() => { setSelectedTemplate(template); setTemplateType("email"); }}>
                          <Eye className="h-4 w-4 mr-1" />Preview
                        </Button>
                        <Button size="sm" onClick={() => { navigator.clipboard.writeText(template.body); toast({ title: "Template copied" }); }}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <Card className="cyber-card p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-400" />
                  <h3 className="text-xl font-bold">Proposal Templates</h3>
                  <Badge variant="outline">{proposalTemplates.length}</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {proposalTemplates.map((template) => (
                    <div key={template.id} className="cyber-card p-4 hover:bg-gray-800/50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold">{template.name}</h4>
                          <Badge variant="outline" className="mt-1 text-xs">{template.type}</Badge>
                        </div>
                        <FileText className="h-5 w-5 text-purple-400" />
                      </div>
                      <p className="text-sm text-gray-400 mb-3">{template.description}</p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1" onClick={() => { setSelectedTemplate(template); setTemplateType("proposal"); }}>
                          <Eye className="h-4 w-4 mr-1" />Preview
                        </Button>
                        <Button size="sm" onClick={() => toast({ title: "Template ready" })}>Use Template</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <Card className="cyber-card p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Workflow className="h-5 w-5 text-green-400" />
                  <h3 className="text-xl font-bold">Workflow Templates</h3>
                  <Badge variant="outline">{workflowTemplates.length}</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {workflowTemplates.map((template) => (
                    <div key={template.id} className="cyber-card p-4 hover:bg-gray-800/50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold">{template.name}</h4>
                          <Badge variant="outline" className="mt-1 text-xs">{template.trigger}</Badge>
                        </div>
                        <Workflow className="h-5 w-5 text-green-400" />
                      </div>
                      <p className="text-sm text-gray-400 mb-3">{template.description}</p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1" onClick={() => { setSelectedTemplate(template); setTemplateType("workflow"); }}>
                          <Eye className="h-4 w-4 mr-1" />Preview
                        </Button>
                        <Button size="sm" onClick={() => toast({ title: "Workflow activated" })}>Activate</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add Inventory Item Dialog */}
        <Dialog open={showAddItem} onOpenChange={setShowAddItem}>
          <DialogContent className="cyber-card max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Inventory Item</DialogTitle>
              <DialogDescription>Enter item information</DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                createInventoryMutation.mutate({
                  sku: formData.get("sku") as string,
                  name: formData.get("name") as string,
                  category: formData.get("category") as string,
                  description: formData.get("description") as string,
                  quantity: parseInt(formData.get("quantity") as string),
                  reorderLevel: parseInt(formData.get("reorderLevel") as string),
                  unitPrice: parseFloat(formData.get("unitPrice") as string),
                  cost: parseFloat(formData.get("cost") as string),
                  supplier: formData.get("supplier") as string,
                  warehouse: formData.get("warehouse") as string,
                });
              }}
            >
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>SKU</Label>
                    <Input name="sku" required className="cyber-input" />
                  </div>
                  <div>
                    <Label>Name</Label>
                    <Input name="name" required className="cyber-input" />
                  </div>
                </div>
                <div>
                  <Label>Category</Label>
                  <Input name="category" required className="cyber-input" />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea name="description" className="cyber-input" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Quantity</Label>
                    <Input name="quantity" type="number" required className="cyber-input" />
                  </div>
                  <div>
                    <Label>Reorder Level</Label>
                    <Input name="reorderLevel" type="number" required className="cyber-input" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Unit Price</Label>
                    <Input
                      name="unitPrice"
                      type="number"
                      step="0.01"
                      required
                      className="cyber-input"
                    />
                  </div>
                  <div>
                    <Label>Cost</Label>
                    <Input
                      name="cost"
                      type="number"
                      step="0.01"
                      required
                      className="cyber-input"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Supplier</Label>
                    <Input name="supplier" required className="cyber-input" />
                  </div>
                  <div>
                    <Label>Warehouse</Label>
                    <Input name="warehouse" required className="cyber-input" />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowAddItem(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Item</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Add Project Dialog */}
        <Dialog open={showAddProject} onOpenChange={setShowAddProject}>
          <DialogContent className="cyber-card max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>Enter project information</DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                createProjectMutation.mutate({
                  name: formData.get("name") as string,
                  description: formData.get("description") as string,
                  priority: formData.get("priority") as any,
                  startDate: formData.get("startDate") as string,
                  endDate: formData.get("endDate") as string,
                  budget: parseFloat(formData.get("budget") as string),
                  manager: formData.get("manager") as string,
                  client: formData.get("client") as string,
                });
              }}
            >
              <div className="space-y-4 py-4">
                <div>
                  <Label>Project Name</Label>
                  <Input name="name" required className="cyber-input" />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea name="description" required className="cyber-input" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Priority</Label>
                    <Select name="priority" required>
                      <SelectTrigger className="cyber-input">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Budget</Label>
                    <Input
                      name="budget"
                      type="number"
                      step="0.01"
                      required
                      className="cyber-input"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Date</Label>
                    <Input name="startDate" type="date" required className="cyber-input" />
                  </div>
                  <div>
                    <Label>End Date</Label>
                    <Input name="endDate" type="date" required className="cyber-input" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Project Manager</Label>
                    <Input name="manager" required className="cyber-input" />
                  </div>
                  <div>
                    <Label>Client</Label>
                    <Input name="client" className="cyber-input" />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowAddProject(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Project</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Add Transaction Dialog */}
        <Dialog open={showAddTransaction} onOpenChange={setShowAddTransaction}>
          <DialogContent className="cyber-card max-w-2xl">
            <DialogHeader>
              <DialogTitle>Record Transaction</DialogTitle>
              <DialogDescription>Enter transaction details</DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                createTransactionMutation.mutate({
                  date: formData.get("date") as string,
                  type: formData.get("type") as any,
                  category: formData.get("category") as string,
                  amount: parseFloat(formData.get("amount") as string),
                  account: formData.get("account") as string,
                  description: formData.get("description") as string,
                  reference: formData.get("reference") as string,
                });
              }}
            >
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Date</Label>
                    <Input name="date" type="date" required className="cyber-input" />
                  </div>
                  <div>
                    <Label>Type</Label>
                    <Select name="type" required>
                      <SelectTrigger className="cyber-input">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="income">Income</SelectItem>
                        <SelectItem value="expense">Expense</SelectItem>
                        <SelectItem value="transfer">Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Category</Label>
                    <Input name="category" required className="cyber-input" />
                  </div>
                  <div>
                    <Label>Amount</Label>
                    <Input
                      name="amount"
                      type="number"
                      step="0.01"
                      required
                      className="cyber-input"
                    />
                  </div>
                </div>
                <div>
                  <Label>Account</Label>
                  <Select name="account" required>
                    <SelectTrigger className="cyber-input">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((acc) => (
                        <SelectItem key={acc.id} value={acc.accountName}>
                          {acc.accountName} ({acc.accountNumber})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea name="description" required className="cyber-input" />
                </div>
                <div>
                  <Label>Reference (Optional)</Label>
                  <Input name="reference" className="cyber-input" />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddTransaction(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Record Transaction</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Template Preview Dialog - Reused from CRM */}
        <Dialog open={selectedTemplate !== null} onOpenChange={(open) => !open && setSelectedTemplate(null)}>
          <DialogContent className="cyber-card max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {templateType === "email" && <Mail className="h-5 w-5 text-cyan-400" />}
                {templateType === "proposal" && <FileText className="h-5 w-5 text-purple-400" />}
                {templateType === "workflow" && <Workflow className="h-5 w-5 text-green-400" />}
                {selectedTemplate?.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {templateType === "email" && selectedTemplate && (
                <>
                  <div>
                    <Label>Subject</Label>
                    <div className="cyber-card p-3 mt-1"><p className="text-sm">{selectedTemplate.subject}</p></div>
                  </div>
                  <div>
                    <Label>Body</Label>
                    <div className="cyber-card p-3 mt-1"><pre className="text-sm whitespace-pre-wrap font-sans">{selectedTemplate.body}</pre></div>
                  </div>
                  {selectedTemplate.variables?.length > 0 && (
                    <div>
                      <Label>Variables</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedTemplate.variables.map((v: string, idx: number) => (
                          <Badge key={idx} variant="outline">{"{{"}{v}{"}}"}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
              {templateType === "proposal" && selectedTemplate && (
                <>
                  <div><Label>Description</Label><p className="text-sm text-gray-400 mt-1">{selectedTemplate.description}</p></div>
                  {selectedTemplate.sections?.length > 0 && (
                    <div>
                      <Label>Sections</Label>
                      <div className="space-y-3 mt-2">
                        {selectedTemplate.sections.map((section: any, idx: number) => (
                          <div key={idx} className="cyber-card p-4">
                            <h4 className="font-semibold text-sm mb-2">{section.title}</h4>
                            <pre className="text-xs text-gray-400 whitespace-pre-wrap font-sans">{section.content}</pre>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
              {templateType === "workflow" && selectedTemplate && (
                <>
                  <div><Label>Description</Label><p className="text-sm text-gray-400 mt-1">{selectedTemplate.description}</p></div>
                  {selectedTemplate.steps?.length > 0 && (
                    <div>
                      <Label>Steps</Label>
                      <div className="space-y-2 mt-2">
                        {selectedTemplate.steps.map((step: any, idx: number) => (
                          <div key={idx} className="cyber-card p-3 flex items-start gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500/20 text-green-400 text-sm font-bold">{idx + 1}</div>
                            <div className="flex-1">
                              <p className="font-semibold text-sm">{step.action}</p>
                              {step.condition && <p className="text-xs text-gray-400 mt-1">Condition: {step.condition}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedTemplate(null)}>Close</Button>
              <Button onClick={() => { if (templateType === "email") navigator.clipboard.writeText(selectedTemplate.body); toast({ title: templateType === "email" ? "Copied" : "Ready" }); setSelectedTemplate(null); }}>
                <Copy className="h-4 w-4 mr-2" />{templateType === "email" ? "Copy" : "Use"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
