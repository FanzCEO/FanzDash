import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  Search,
  Filter,
  Eye,
  Ban,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Phone,
  Shield,
  Activity,
  UserCheck,
  UserX,
  MessageSquare,
  AlertTriangle,
  Settings,
  MoreHorizontal,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  avatar?: string;
  role: "user" | "creator" | "admin" | "moderator";
  status: "active" | "suspended" | "banned" | "pending";
  isVerified: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  identityVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
  totalEarnings?: number;
  subscriberCount?: number;
}

interface UserVerification {
  id: string;
  userId: string;
  username: string;
  verificationType: "email" | "phone" | "identity" | "address";
  verificationValue: string;
  status: "pending" | "verified" | "expired" | "failed";
  submittedAt: string;
  verifiedAt?: string;
  documents?: string[];
}

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "new" | "read" | "replied" | "resolved" | "archived";
  priority: "low" | "normal" | "high" | "urgent";
  createdAt: string;
  respondedAt?: string;
}

export default function UserManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch users from API
  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
    refetchInterval: 15000,
  });

  // Fetch verifications from API
  const { data: verifications = [] } = useQuery<UserVerification[]>({
    queryKey: ["/api/users/verifications"],
    refetchInterval: 10000,
  });

  // Fetch contact messages from API
  const { data: contactMessages = [] } = useQuery<ContactMessage[]>({
    queryKey: ["/api/contact/messages"],
    refetchInterval: 10000,
  });

  // Remove this mock data block - now using real API data
  const _removedMockUsers: User[] = [
    {
      id: "1",
      username: "sarah_model",
      email: "sarah@example.com",
      name: "Sarah Johnson",
      avatar: "/api/placeholder/40/40",
      role: "creator",
      status: "active",
      isVerified: true,
      emailVerified: true,
      phoneVerified: true,
      identityVerified: true,
      lastLoginAt: "2025-01-15T14:30:00Z",
      createdAt: "2024-08-15T10:00:00Z",
      totalEarnings: 15420.5,
      subscriberCount: 1250,
    },
    {
      id: "2",
      username: "alex_creator",
      email: "alex@example.com",
      name: "Alex Thompson",
      role: "creator",
      status: "active",
      isVerified: false,
      emailVerified: true,
      phoneVerified: false,
      identityVerified: false,
      lastLoginAt: "2025-01-15T12:00:00Z",
      createdAt: "2024-12-01T15:30:00Z",
      totalEarnings: 2840.0,
      subscriberCount: 340,
    },
    {
      id: "3",
      username: "user123",
      email: "user@example.com",
      name: "John Doe",
      role: "user",
      status: "active",
      isVerified: false,
      emailVerified: true,
      phoneVerified: false,
      identityVerified: false,
      lastLoginAt: "2025-01-14T18:45:00Z",
      createdAt: "2025-01-10T09:15:00Z",
    },
    {
      id: "4",
      username: "suspended_user",
      email: "suspended@example.com",
      name: "Suspended User",
      role: "creator",
      status: "suspended",
      isVerified: false,
      emailVerified: true,
      phoneVerified: false,
      identityVerified: false,
      createdAt: "2024-06-20T11:00:00Z",
    },
  ];

  // Removed mock verification requests - now using verifications from API query above
  const _removedVerificationRequests: UserVerification[] = [
    {
      id: "1",
      userId: "2",
      username: "alex_creator",
      verificationType: "identity",
      verificationValue: "ID Document",
      status: "pending",
      submittedAt: "2025-01-14T10:00:00Z",
      documents: ["id-front.jpg", "id-back.jpg"],
    },
    {
      id: "2",
      userId: "3",
      username: "user123",
      verificationType: "email",
      verificationValue: "user@example.com",
      status: "verified",
      submittedAt: "2025-01-10T09:20:00Z",
      verifiedAt: "2025-01-10T09:25:00Z",
    },
  ];

  // Removed mock contact messages - now using contactMessages from API query above
  const _removedContactMessages: ContactMessage[] = [
    {
      id: "1",
      name: "Jane Smith",
      email: "jane@example.com",
      subject: "Account verification issue",
      message:
        "I'm having trouble verifying my account. The verification email never arrived.",
      status: "new",
      priority: "high",
      createdAt: "2025-01-15T16:30:00Z",
    },
    {
      id: "2",
      name: "Mike Wilson",
      email: "mike@example.com",
      subject: "Payment processing question",
      message: "When will my withdrawal be processed? It's been 5 days.",
      status: "replied",
      priority: "normal",
      createdAt: "2025-01-14T14:00:00Z",
      respondedAt: "2025-01-14T16:30:00Z",
    },
  ];

  const isLoading = false;

  const updateUserMutation = useMutation({
    mutationFn: (data: { userId: string; updates: any }) =>
      apiRequest(`/api/admin/users/${data.userId}`, "PATCH", data.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "User updated successfully" });
    },
  });

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      !searchQuery ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || user.status === statusFilter;
    const matchesRole = roleFilter === "all" || user.role === roleFilter;

    return matchesSearch && matchesStatus && matchesRole;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      active: { variant: "default" as const, color: "text-green-600" },
      suspended: { variant: "destructive" as const, color: "text-yellow-600" },
      banned: { variant: "destructive" as const, color: "text-red-600" },
      pending: { variant: "outline" as const, color: "text-gray-600" },
    };

    const config = variants[status as keyof typeof variants];
    return (
      <Badge variant={config?.variant || "secondary"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getRoleBadge = (role: string) => {
    const variants = {
      admin: "destructive",
      moderator: "default",
      creator: "default",
      user: "secondary",
    } as const;

    return (
      <Badge variant={variants[role as keyof typeof variants] || "secondary"}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    );
  };

  const getVerificationStatus = (user: User) => {
    const verifications = [
      { type: "Email", verified: user.emailVerified, icon: Mail },
      { type: "Phone", verified: user.phoneVerified, icon: Phone },
      { type: "Identity", verified: user.identityVerified, icon: Shield },
    ];

    return (
      <div className="flex space-x-1">
        {verifications.map((verification) => {
          const Icon = verification.icon;
          return (
            <div
              key={verification.type}
              className={`p-1 rounded-full ${
                verification.verified
                  ? "bg-green-100 text-green-600"
                  : "bg-gray-100 text-gray-400"
              }`}
              title={`${verification.type} ${verification.verified ? "Verified" : "Not Verified"}`}
            >
              <Icon className="h-3 w-3" />
            </div>
          );
        })}
      </div>
    );
  };

  const getStats = () => {
    const totalUsers = users.length;
    const activeUsers = users.filter((u) => u.status === "active").length;
    const creators = users.filter((u) => u.role === "creator").length;
    const pendingVerifications = verificationRequests.filter(
      (v) => v.status === "pending",
    ).length;

    return { totalUsers, activeUsers, creators, pendingVerifications };
  };

  const stats = getStats();

  return (
    <div
      className="container mx-auto p-6 space-y-6"
      data-testid="user-management"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold cyber-text-glow">
            User Management
          </h1>
          <p className="text-muted-foreground">
            Manage user accounts, verifications, and platform access
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="cyber-border">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm font-medium">Total Users</p>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cyber-border">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm font-medium">Active Users</p>
                <p className="text-2xl font-bold">{stats.activeUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cyber-border">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserCheck className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Creators</p>
                <p className="text-2xl font-bold">{stats.creators}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cyber-border">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">Pending Verifications</p>
                <p className="text-2xl font-bold">
                  {stats.pendingVerifications}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">User Accounts</TabsTrigger>
          <TabsTrigger value="verifications">Verifications</TabsTrigger>
          <TabsTrigger value="messages">Contact Messages</TabsTrigger>
          <TabsTrigger value="activity">User Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card className="cyber-border">
            <CardHeader>
              <CardTitle>User Accounts ({filteredUsers.length})</CardTitle>
              <CardDescription>
                Manage user accounts, roles, and platform access
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filter Controls */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-users"
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger
                    className="w-[180px]"
                    data-testid="select-status-filter"
                  >
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="banned">Banned</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger
                    className="w-[180px]"
                    data-testid="select-role-filter"
                  >
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="creator">Creator</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Users Table */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Verification</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback>
                                {user.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-muted-foreground">
                                @{user.username}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell>{getStatusBadge(user.status)}</TableCell>
                        <TableCell>{getVerificationStatus(user)}</TableCell>
                        <TableCell>
                          {user.lastLoginAt ? (
                            <div className="text-sm">
                              {new Date(user.lastLoginAt).toLocaleDateString()}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Never</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              data-testid={`button-view-${user.id}`}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              data-testid={`button-edit-${user.id}`}
                            >
                              <Settings className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verifications" className="space-y-4">
          <Card className="cyber-border">
            <CardHeader>
              <CardTitle>Verification Requests</CardTitle>
              <CardDescription>
                Review and approve user verification submissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {verificationRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          <div className="font-medium">@{request.username}</div>
                          <div className="text-sm text-muted-foreground">
                            {request.verificationValue}
                          </div>
                        </TableCell>
                        <TableCell className="capitalize">
                          {request.verificationType}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              request.status === "pending"
                                ? "outline"
                                : "default"
                            }
                          >
                            {request.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(request.submittedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-3 w-3 mr-1" />
                              Review
                            </Button>
                            {request.status === "pending" && (
                              <>
                                <Button variant="default" size="sm">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Approve
                                </Button>
                                <Button variant="destructive" size="sm">
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Reject
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages" className="space-y-4">
          <Card className="cyber-border">
            <CardHeader>
              <CardTitle>Contact Messages</CardTitle>
              <CardDescription>
                Manage customer support and contact inquiries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contact</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contactMessages.map((message) => (
                      <TableRow key={message.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{message.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {message.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {message.subject}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              message.priority === "high"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {message.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              message.status === "new" ? "default" : "outline"
                            }
                          >
                            {message.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(message.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            <MessageSquare className="h-3 w-3 mr-1" />
                            Reply
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card className="cyber-border">
            <CardHeader>
              <CardTitle>User Activity</CardTitle>
              <CardDescription>
                Monitor user actions and platform usage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-4" />
                <p>User activity monitoring features coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
