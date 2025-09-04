import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Shield,
  UserCheck,
  Search,
  Filter,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  status: string;
  lastActive: string;
  moderationCount: number;
  accuracy: number;
}

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    role: "moderator",
    password: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ["/api/users"],
    refetchInterval: 30000,
  });

  const addUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      return apiRequest("/api/users", "POST", userData);
    },
    onSuccess: () => {
      toast({
        title: "User Created",
        description: "New user account has been created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setShowAddDialog(false);
      setNewUser({ username: "", email: "", role: "moderator", password: "" });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      return apiRequest(`/api/users/${id}`, "PATCH", updates);
    },
    onSuccess: () => {
      toast({
        title: "User Updated",
        description: "User account has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return apiRequest(`/api/users/${userId}`, "DELETE");
    },
    onSuccess: () => {
      toast({
        title: "User Deleted",
        description: "User account has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
  });

  const mockUsers: User[] = [
    {
      id: "user-001",
      username: "admin_sarah",
      email: "sarah@fanzdash.com",
      role: "admin",
      status: "active",
      lastActive: new Date().toISOString(),
      moderationCount: 1247,
      accuracy: 98.2,
    },
    {
      id: "user-002",
      username: "mod_alex",
      email: "alex@fanzdash.com",
      role: "moderator",
      status: "active",
      lastActive: new Date(Date.now() - 300000).toISOString(),
      moderationCount: 967,
      accuracy: 97.8,
    },
    {
      id: "user-003",
      username: "mod_jordan",
      email: "jordan@fanzdash.com",
      role: "moderator",
      status: "active",
      lastActive: new Date(Date.now() - 600000).toISOString(),
      moderationCount: 834,
      accuracy: 96.9,
    },
    {
      id: "user-004",
      username: "analyst_mike",
      email: "mike@fanzdash.com",
      role: "analyst",
      status: "inactive",
      lastActive: new Date(Date.now() - 86400000).toISOString(),
      moderationCount: 234,
      accuracy: 94.5,
    },
  ];

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-red-600">Admin</Badge>;
      case "moderator":
        return <Badge className="bg-blue-600">Moderator</Badge>;
      case "analyst":
        return <Badge className="bg-green-600">Analyst</Badge>;
      case "viewer":
        return <Badge variant="secondary">Viewer</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-600">Active</Badge>;
      case "inactive":
        return <Badge variant="secondary">Inactive</Badge>;
      case "suspended":
        return <Badge variant="destructive">Suspended</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const updateUserStatus = (userId: string, status: string) => {
    updateUserMutation.mutate({ id: userId, updates: { status } });
  };

  const updateUserRole = (userId: string, role: string) => {
    updateUserMutation.mutate({ id: userId, updates: { role } });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen cyber-bg flex items-center justify-center">
        <div className="text-center">
          <Users className="w-16 h-16 mx-auto mb-4 cyber-pulse text-primary" />
          <p className="cyber-text-glow">Loading User Management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen cyber-bg">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold cyber-text-glow">
              User Management
            </h1>
            <p className="text-muted-foreground">Admin & Moderator Accounts</p>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="neon-button" data-testid="add-user-button">
                <Plus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md cyber-card">
              <DialogHeader>
                <DialogTitle className="cyber-text-glow">
                  Add New User
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Username
                  </label>
                  <Input
                    value={newUser.username}
                    onChange={(e) =>
                      setNewUser({ ...newUser, username: e.target.value })
                    }
                    placeholder="Enter username"
                    className="glass-effect"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser({ ...newUser, email: e.target.value })
                    }
                    placeholder="Enter email"
                    className="glass-effect"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Role</label>
                  <Select
                    value={newUser.role}
                    onValueChange={(value) =>
                      setNewUser({ ...newUser, role: value })
                    }
                  >
                    <SelectTrigger className="glass-effect">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="moderator">Moderator</SelectItem>
                      <SelectItem value="analyst">Analyst</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Password
                  </label>
                  <Input
                    type="password"
                    value={newUser.password}
                    onChange={(e) =>
                      setNewUser({ ...newUser, password: e.target.value })
                    }
                    placeholder="Enter password"
                    className="glass-effect"
                  />
                </div>
                <Button
                  onClick={() => addUserMutation.mutate(newUser)}
                  disabled={addUserMutation.isPending}
                  className="w-full neon-button"
                  data-testid="create-user-button"
                >
                  {addUserMutation.isPending ? "Creating..." : "Create User"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="cyber-card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary cyber-text-glow">
                4
              </div>
              <div className="text-sm text-muted-foreground">Total Users</div>
            </CardContent>
          </Card>
          <Card className="cyber-card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-400 cyber-text-glow">
                3
              </div>
              <div className="text-sm text-muted-foreground">Active</div>
            </CardContent>
          </Card>
          <Card className="cyber-card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-400 cyber-text-glow">
                2
              </div>
              <div className="text-sm text-muted-foreground">Moderators</div>
            </CardContent>
          </Card>
          <Card className="cyber-card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-accent cyber-text-glow">
                97.3%
              </div>
              <div className="text-sm text-muted-foreground">Avg Accuracy</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4" />
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
                <SelectItem value="analyst">Analyst</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Users Table */}
        <Card className="cyber-card neural-network">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-6 h-6 text-primary cyber-pulse" />
              <span className="cyber-text-glow">USER ACCOUNTS</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 cyber-card border border-primary/20"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                      <UserCheck className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{user.username}</span>
                        {getRoleBadge(user.role)}
                        {getStatusBadge(user.status)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {user.email}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Last active:{" "}
                        {new Date(user.lastActive).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {user.moderationCount} reviews
                      </div>
                      <div className="text-xs text-green-400">
                        {user.accuracy}% accuracy
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Select
                        value={user.role}
                        onValueChange={(value) =>
                          updateUserRole(user.id, value)
                        }
                      >
                        <SelectTrigger className="w-24 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="moderator">Moderator</SelectItem>
                          <SelectItem value="analyst">Analyst</SelectItem>
                          <SelectItem value="viewer">Viewer</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select
                        value={user.status}
                        onValueChange={(value) =>
                          updateUserStatus(user.id, value)
                        }
                      >
                        <SelectTrigger className="w-24 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                        </SelectContent>
                      </Select>

                      <Button
                        size="sm"
                        variant="outline"
                        data-testid={`edit-user-${user.id}`}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>

                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteUserMutation.mutate(user.id)}
                        data-testid={`delete-user-${user.id}`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
