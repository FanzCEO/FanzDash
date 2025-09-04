import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  Search, 
  Eye, 
  CheckCircle,
  XCircle,
  AlertTriangle,
  Filter,
  Download,
  RefreshCw
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface WithdrawalRequest {
  id: string;
  userId: string;
  username: string;
  profileUrl?: string;
  amount: string;
  gateway: 'PayPal' | 'Payoneer' | 'Zelle' | 'Western Union' | 'Bitcoin' | 'Mercado Pago' | 'Bank';
  account: string;
  status: 'pending' | 'paid' | 'rejected';
  datePaid?: string;
  rejectionReason?: string;
  date: string;
  createdAt: string;
}

export default function WithdrawalManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [gatewayFilter, setGatewayFilter] = useState("all");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Mock withdrawal requests data
  const withdrawalRequests: WithdrawalRequest[] = [
    {
      id: "1",
      userId: "user_1",
      username: "sarah_model",
      profileUrl: "/sarah_model",
      amount: "250.00",
      gateway: "PayPal",
      account: "sarah@example.com",
      status: "pending",
      date: "2025-01-15T10:00:00Z",
      createdAt: "2025-01-15T10:00:00Z"
    },
    {
      id: "2",
      userId: "user_2", 
      username: "alex_creator",
      profileUrl: "/alex_creator",
      amount: "500.00",
      gateway: "Bank",
      account: "Chase Bank - ****1234",
      status: "paid",
      datePaid: "2025-01-14T16:30:00Z",
      date: "2025-01-13T15:30:00Z",
      createdAt: "2025-01-13T15:30:00Z"
    },
    {
      id: "3",
      userId: "user_3",
      username: "maya_performer",
      profileUrl: "/maya_performer",
      amount: "150.00",
      gateway: "Bitcoin",
      account: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
      status: "rejected",
      rejectionReason: "Invalid wallet address provided",
      date: "2025-01-12T12:00:00Z",
      createdAt: "2025-01-12T12:00:00Z"
    },
    {
      id: "4",
      userId: "user_4",
      username: "jenny_cam",
      profileUrl: "/jenny_cam",
      amount: "750.00",
      gateway: "Payoneer",
      account: "jenny.cam@payoneer.com",
      status: "pending",
      date: "2025-01-11T09:00:00Z",
      createdAt: "2025-01-11T09:00:00Z"
    },
    {
      id: "5",
      userId: "user_5",
      username: "mike_streamer",
      profileUrl: "/mike_streamer",
      amount: "320.00",
      gateway: "Zelle",
      account: "mike.stream@email.com",
      status: "paid",
      datePaid: "2025-01-10T14:20:00Z",
      date: "2025-01-09T14:20:00Z",
      createdAt: "2025-01-09T14:20:00Z"
    }
  ];

  const isLoading = false;

  const refreshMutation = useMutation({
    mutationFn: () => apiRequest('/api/admin/withdrawals/refresh', 'POST'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/withdrawals'] });
      toast({ title: "Withdrawal data refreshed" });
    }
  });

  const exportMutation = useMutation({
    mutationFn: (filters: any) => apiRequest('/api/admin/withdrawals/export', 'POST', filters),
    onSuccess: (data) => {
      // Handle file download
      toast({ title: "Export generated successfully" });
    }
  });

  const filteredRequests = withdrawalRequests.filter(request => {
    const matchesSearch = !searchQuery || 
      request.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.id.includes(searchQuery) ||
      request.account.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    const matchesGateway = gatewayFilter === "all" || request.gateway === gatewayFilter;

    return matchesSearch && matchesStatus && matchesGateway;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "outline",
      paid: "default",
      rejected: "destructive"
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {status === 'pending' ? 'Pending to Pay' : status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getGatewayDisplay = (gateway: string) => {
    return gateway === 'Bank' ? 'Bank Transfer' : gateway;
  };

  const getStats = () => {
    const totalRequests = withdrawalRequests.length;
    const pendingRequests = withdrawalRequests.filter(r => r.status === 'pending').length;
    const totalAmount = withdrawalRequests.reduce((sum, r) => sum + parseFloat(r.amount), 0);
    const pendingAmount = withdrawalRequests
      .filter(r => r.status === 'pending')
      .reduce((sum, r) => sum + parseFloat(r.amount), 0);

    return { totalRequests, pendingRequests, totalAmount, pendingAmount };
  };

  const stats = getStats();

  const handleExport = () => {
    exportMutation.mutate({
      status: statusFilter,
      gateway: gatewayFilter,
      search: searchQuery
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6" data-testid="withdrawal-management">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold cyber-text-glow">Withdrawal Management</h1>
          <p className="text-muted-foreground">
            Manage creator withdrawal requests and payment processing
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={exportMutation.isPending}
            data-testid="button-export"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button
            variant="outline"
            onClick={() => refreshMutation.mutate()}
            disabled={refreshMutation.isPending}
            data-testid="button-refresh"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="cyber-border">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm font-medium">Total Requests</p>
                <p className="text-2xl font-bold">{stats.totalRequests}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cyber-border">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">Pending</p>
                <p className="text-2xl font-bold">{stats.pendingRequests}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cyber-border">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm font-medium">Total Amount</p>
                <p className="text-2xl font-bold">${stats.totalAmount.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cyber-border">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Pending Amount</p>
                <p className="text-2xl font-bold">${stats.pendingAmount.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="cyber-border">
        <CardHeader>
          <CardTitle>Withdrawal Requests ({filteredRequests.length})</CardTitle>
          <CardDescription>
            Review and process creator withdrawal requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filter Controls */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by username, ID, or account..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]" data-testid="select-status-filter">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select value={gatewayFilter} onValueChange={setGatewayFilter}>
              <SelectTrigger className="w-[180px]" data-testid="select-gateway-filter">
                <SelectValue placeholder="Filter by gateway" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Gateways</SelectItem>
                <SelectItem value="PayPal">PayPal</SelectItem>
                <SelectItem value="Bank">Bank Transfer</SelectItem>
                <SelectItem value="Bitcoin">Bitcoin</SelectItem>
                <SelectItem value="Payoneer">Payoneer</SelectItem>
                <SelectItem value="Zelle">Zelle</SelectItem>
                <SelectItem value="Western Union">Western Union</SelectItem>
                <SelectItem value="Mercado Pago">Mercado Pago</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Withdrawals Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.length > 0 ? (
                  filteredRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-mono">{request.id}</TableCell>
                      <TableCell>
                        {request.profileUrl ? (
                          <Link href={request.profileUrl}>
                            <Button variant="link" className="p-0 h-auto text-left">
                              {request.username}
                              <Eye className="h-3 w-3 ml-1" />
                            </Button>
                          </Link>
                        ) : (
                          <span className="text-muted-foreground">No Available</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">${request.amount}</div>
                      </TableCell>
                      <TableCell>{getGatewayDisplay(request.gateway)}</TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell>
                        {new Date(request.date).toLocaleDateString('en-US', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </TableCell>
                      <TableCell>
                        <Link href={`/withdrawal-view/${request.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            data-testid={`button-view-${request.id}`}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      <div className="flex flex-col items-center space-y-2">
                        <AlertTriangle className="h-8 w-8" />
                        <span>No results found</span>
                        {(searchQuery || statusFilter !== "all" || gatewayFilter !== "all") && (
                          <Button
                            variant="link"
                            onClick={() => {
                              setSearchQuery("");
                              setStatusFilter("all");
                              setGatewayFilter("all");
                            }}
                            data-testid="button-clear-filters"
                          >
                            Clear filters
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}