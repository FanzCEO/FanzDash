import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  MoreHorizontal,
  Shield,
  Users,
  Key,
  Eye,
  EyeOff,
  UserPlus,
  UserMinus,
  Settings,
  Lock,
  Unlock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Crown,
  User,
  Activity,
  Globe,
  Briefcase,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  userCount: number;
  isSystemRole: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Permission {
  id: string;
  module: string;
  action: string;
  resource: string;
  description: string;
}

interface SupportUser {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  roleId: string;
  roleName: string;
  departmentId: string;
  departmentName: string;
  isActive: boolean;
  isOnline: boolean;
  lastActivity: string;
  permissions: string[];
  maxTickets: number;
  currentTickets: number;
  createdAt: string;
}

interface Department {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  userCount: number;
}

interface RoleManagementProps {
  roles: Role[];
  users: SupportUser[];
  departments: Department[];
  permissions: Permission[];
  onCreateRole: (data: {
    name: string;
    description: string;
    permissions: Permission[];
  }) => Promise<void>;
  onUpdateRole: (id: string, data: Partial<Role>) => Promise<void>;
  onDeleteRole: (id: string) => Promise<void>;
  onAssignRole: (userId: string, roleId: string) => Promise<void>;
  onUpdateUser: (id: string, data: Partial<SupportUser>) => Promise<void>;
  onInviteUser: (data: {
    email: string;
    name: string;
    roleId: string;
    departmentId: string;
    maxTickets: number;
  }) => Promise<void>;
  currentUser: {
    id: string;
    name: string;
    role: string;
    permissions: string[];
  };
  className?: string;
}

const PERMISSION_MODULES = [
  { id: "tickets", name: "Tickets", icon: Activity },
  { id: "users", name: "User Management", icon: Users },
  { id: "departments", name: "Departments", icon: Briefcase },
  { id: "knowledge_base", name: "Knowledge Base", icon: Globe },
  { id: "analytics", name: "Analytics", icon: Activity },
  { id: "settings", name: "System Settings", icon: Settings },
];

const PERMISSION_ACTIONS = [
  "create",
  "read",
  "update",
  "delete",
  "assign",
  "close",
  "escalate",
];

export function RoleManagement({
  roles,
  users,
  departments,
  permissions,
  onCreateRole,
  onUpdateRole,
  onDeleteRole,
  onAssignRole,
  onUpdateUser,
  onInviteUser,
  currentUser,
  className = "",
}: RoleManagementProps) {
  const [activeTab, setActiveTab] = useState("roles");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedRole, setSelectedRole] = useState("all");
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false);
  const [isInviteUserOpen, setIsInviteUserOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  // Role form state
  const [roleForm, setRoleForm] = useState({
    name: "",
    description: "",
    permissions: [] as Permission[],
  });
  const [roleErrors, setRoleErrors] = useState<Record<string, string>>({});
  const [isSubmittingRole, setIsSubmittingRole] = useState(false);

  // User invite form state
  const [inviteForm, setInviteForm] = useState({
    email: "",
    name: "",
    roleId: "",
    departmentId: "",
    maxTickets: 20,
  });
  const [inviteErrors, setInviteErrors] = useState<Record<string, string>>({});
  const [isSubmittingInvite, setIsSubmittingInvite] = useState(false);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDepartment =
      selectedDepartment === "all" || user.departmentId === selectedDepartment;
    const matchesRole = selectedRole === "all" || user.roleId === selectedRole;

    return matchesSearch && matchesDepartment && matchesRole;
  });

  const resetRoleForm = () => {
    setRoleForm({
      name: "",
      description: "",
      permissions: [],
    });
    setRoleErrors({});
  };

  const resetInviteForm = () => {
    setInviteForm({
      email: "",
      name: "",
      roleId: "",
      departmentId: "",
      maxTickets: 20,
    });
    setInviteErrors({});
  };

  const validateRoleForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!roleForm.name.trim()) errors.name = "Role name is required";
    if (!roleForm.description.trim())
      errors.description = "Description is required";
    if (roleForm.permissions.length === 0)
      errors.permissions = "At least one permission is required";

    setRoleErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateInviteForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!inviteForm.email.trim()) errors.email = "Email is required";
    if (!inviteForm.name.trim()) errors.name = "Name is required";
    if (!inviteForm.roleId) errors.roleId = "Role is required";
    if (!inviteForm.departmentId)
      errors.departmentId = "Department is required";
    if (inviteForm.maxTickets < 1)
      errors.maxTickets = "Max tickets must be at least 1";

    setInviteErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitRole = async () => {
    if (!validateRoleForm()) return;

    setIsSubmittingRole(true);
    try {
      if (editingRole) {
        await onUpdateRole(editingRole.id, roleForm);
      } else {
        await onCreateRole(roleForm);
      }
      setIsCreateRoleOpen(false);
      setEditingRole(null);
      resetRoleForm();
    } catch (error: any) {
      setRoleErrors({ submit: error.message || "Failed to save role" });
    } finally {
      setIsSubmittingRole(false);
    }
  };

  const handleSubmitInvite = async () => {
    if (!validateInviteForm()) return;

    setIsSubmittingInvite(true);
    try {
      await onInviteUser(inviteForm);
      setIsInviteUserOpen(false);
      resetInviteForm();
    } catch (error: any) {
      setInviteErrors({ submit: error.message || "Failed to invite user" });
    } finally {
      setIsSubmittingInvite(false);
    }
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setRoleForm({
      name: role.name,
      description: role.description,
      permissions: role.permissions,
    });
    setIsCreateRoleOpen(true);
  };

  const togglePermission = (permissionId: string) => {
    const permission = permissions.find((p) => p.id === permissionId);
    if (!permission) return;

    setRoleForm((prev) => ({
      ...prev,
      permissions: prev.permissions.some((p) => p.id === permissionId)
        ? prev.permissions.filter((p) => p.id !== permissionId)
        : [...prev.permissions, permission],
    }));
  };

  const getRoleIcon = (roleName: string) => {
    switch (roleName.toLowerCase()) {
      case "admin":
      case "administrator":
        return Crown;
      case "supervisor":
      case "manager":
        return Shield;
      case "agent":
      default:
        return User;
    }
  };

  const RoleCard = ({ role }: { role: Role }) => {
    const RoleIcon = getRoleIcon(role.name);

    return (
      <Card className="hover:shadow-lg transition-all duration-300">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <RoleIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg flex items-center space-x-2">
                    <span>{role.name}</span>
                    {role.isSystemRole && (
                      <Badge variant="secondary">
                        <Lock className="h-3 w-3 mr-1" />
                        System
                      </Badge>
                    )}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {role.description}
                  </p>
                </div>
              </div>

              {!role.isSystemRole &&
                currentUser.permissions.includes("roles:update") && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditRole(role)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Role
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDeleteRole(role.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Role
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Users with this role
                </span>
                <span className="font-medium">{role.userCount}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Permissions</span>
                <span className="font-medium">{role.permissions.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Created</span>
                <span className="font-medium">
                  {formatDistanceToNow(new Date(role.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </div>

            {/* Permission Preview */}
            <div className="pt-2 border-t">
              <h4 className="font-medium text-sm mb-2">Key Permissions</h4>
              <div className="flex flex-wrap gap-1">
                {role.permissions.slice(0, 4).map((permission) => (
                  <Badge
                    key={permission.id}
                    variant="outline"
                    className="text-xs"
                  >
                    {permission.module}:{permission.action}
                  </Badge>
                ))}
                {role.permissions.length > 4 && (
                  <Badge variant="outline" className="text-xs">
                    +{role.permissions.length - 4} more
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const UserCard = ({ user }: { user: SupportUser }) => (
    <Card className="hover:shadow-lg transition-all duration-300">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div
                  className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                    user.isOnline ? "bg-green-500" : "bg-gray-300"
                  }`}
                />
              </div>
              <div>
                <h3 className="font-semibold">{user.name}</h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {!user.isActive && <Badge variant="destructive">Inactive</Badge>}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit User
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Key className="h-4 w-4 mr-2" />
                    Change Role
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    {user.isActive ? (
                      <>
                        <UserMinus className="h-4 w-4 mr-2" />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Activate
                      </>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Role</span>
                <Badge variant="outline">{user.roleName}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Department</span>
                <span className="font-medium">{user.departmentName}</span>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Current Tickets</span>
                <span className="font-medium">
                  {user.currentTickets}/{user.maxTickets}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Last Active</span>
                <span className="font-medium">
                  {formatDistanceToNow(new Date(user.lastActivity), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Permission Count */}
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Permissions</span>
              <span className="font-medium">
                {user.permissions.length} active
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center space-x-3">
            <Shield className="h-8 w-8 text-primary" />
            <span>Role Management</span>
          </h1>
          <p className="text-muted-foreground">
            Manage user roles, permissions, and department access controls
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <Dialog open={isInviteUserOpen} onOpenChange={setIsInviteUserOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <UserPlus className="h-4 w-4 mr-2" />
                Invite User
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite New User</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {inviteErrors.submit && (
                  <Alert variant="destructive">
                    <AlertDescription>{inviteErrors.submit}</AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="invite-name">Name *</Label>
                    <Input
                      id="invite-name"
                      value={inviteForm.name}
                      onChange={(e) =>
                        setInviteForm((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="Full name"
                      className={inviteErrors.name ? "border-red-500" : ""}
                      data-testid="invite-name-input"
                    />
                    {inviteErrors.name && (
                      <p className="text-sm text-red-600">
                        {inviteErrors.name}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="invite-email">Email *</Label>
                    <Input
                      id="invite-email"
                      type="email"
                      value={inviteForm.email}
                      onChange={(e) =>
                        setInviteForm((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      placeholder="user@company.com"
                      className={inviteErrors.email ? "border-red-500" : ""}
                      data-testid="invite-email-input"
                    />
                    {inviteErrors.email && (
                      <p className="text-sm text-red-600">
                        {inviteErrors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="invite-role">Role *</Label>
                    <Select
                      value={inviteForm.roleId}
                      onValueChange={(value) =>
                        setInviteForm((prev) => ({ ...prev, roleId: value }))
                      }
                    >
                      <SelectTrigger
                        className={inviteErrors.roleId ? "border-red-500" : ""}
                        data-testid="invite-role-select"
                      >
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {inviteErrors.roleId && (
                      <p className="text-sm text-red-600">
                        {inviteErrors.roleId}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="invite-department">Department *</Label>
                    <Select
                      value={inviteForm.departmentId}
                      onValueChange={(value) =>
                        setInviteForm((prev) => ({
                          ...prev,
                          departmentId: value,
                        }))
                      }
                    >
                      <SelectTrigger
                        className={
                          inviteErrors.departmentId ? "border-red-500" : ""
                        }
                        data-testid="invite-department-select"
                      >
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {inviteErrors.departmentId && (
                      <p className="text-sm text-red-600">
                        {inviteErrors.departmentId}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="invite-max-tickets">Max Tickets</Label>
                  <Input
                    id="invite-max-tickets"
                    type="number"
                    value={inviteForm.maxTickets}
                    onChange={(e) =>
                      setInviteForm((prev) => ({
                        ...prev,
                        maxTickets: parseInt(e.target.value) || 20,
                      }))
                    }
                    min={1}
                    max={100}
                    data-testid="invite-max-tickets-input"
                  />
                </div>

                <div className="flex items-center justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsInviteUserOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmitInvite}
                    disabled={isSubmittingInvite}
                    className="bg-gradient-to-r from-primary to-purple-600"
                    data-testid="send-invite-btn"
                  >
                    {isSubmittingInvite ? "Sending..." : "Send Invitation"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {currentUser.permissions.includes("roles:create") && (
            <Dialog
              open={isCreateRoleOpen}
              onOpenChange={(open) => {
                setIsCreateRoleOpen(open);
                if (!open) {
                  setEditingRole(null);
                  resetRoleForm();
                }
              }}
            >
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-primary to-purple-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Role
                </Button>
              </DialogTrigger>

              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingRole ? "Edit Role" : "Create New Role"}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                  {roleErrors.submit && (
                    <Alert variant="destructive">
                      <AlertDescription>{roleErrors.submit}</AlertDescription>
                    </Alert>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="role-name">Role Name *</Label>
                      <Input
                        id="role-name"
                        value={roleForm.name}
                        onChange={(e) =>
                          setRoleForm((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        placeholder="e.g., Support Agent, Supervisor"
                        className={roleErrors.name ? "border-red-500" : ""}
                        data-testid="role-name-input"
                      />
                      {roleErrors.name && (
                        <p className="text-sm text-red-600">
                          {roleErrors.name}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role-description">Description *</Label>
                    <Textarea
                      id="role-description"
                      value={roleForm.description}
                      onChange={(e) =>
                        setRoleForm((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Describe the role's responsibilities and scope..."
                      rows={3}
                      className={roleErrors.description ? "border-red-500" : ""}
                      data-testid="role-description-input"
                    />
                    {roleErrors.description && (
                      <p className="text-sm text-red-600">
                        {roleErrors.description}
                      </p>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-base font-semibold">
                        Permissions *
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Select the permissions for this role
                      </p>
                    </div>

                    {PERMISSION_MODULES.map((module) => {
                      const ModuleIcon = module.icon;
                      const modulePermissions = permissions.filter(
                        (p) => p.module === module.id,
                      );

                      return (
                        <Card key={module.id} className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                              <ModuleIcon className="h-5 w-5 text-primary" />
                              <h4 className="font-semibold">{module.name}</h4>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                              {modulePermissions.map((permission) => (
                                <div
                                  key={permission.id}
                                  className="flex items-center space-x-2"
                                >
                                  <Switch
                                    id={permission.id}
                                    checked={roleForm.permissions.some(
                                      (p) => p.id === permission.id,
                                    )}
                                    onCheckedChange={() =>
                                      togglePermission(permission.id)
                                    }
                                    data-testid={`permission-${permission.id}`}
                                  />
                                  <Label
                                    htmlFor={permission.id}
                                    className="text-sm"
                                  >
                                    {permission.action}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </div>
                        </Card>
                      );
                    })}

                    {roleErrors.permissions && (
                      <p className="text-sm text-red-600">
                        {roleErrors.permissions}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-end space-x-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateRoleOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSubmitRole}
                      disabled={isSubmittingRole}
                      className="bg-gradient-to-r from-primary to-purple-600"
                      data-testid="save-role-btn"
                    >
                      {isSubmittingRole
                        ? "Saving..."
                        : editingRole
                          ? "Update Role"
                          : "Create Role"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {roles.length}
            </div>
            <div className="text-sm text-muted-foreground">Total Roles</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {users.length}
            </div>
            <div className="text-sm text-muted-foreground">Total Users</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {users.filter((u) => u.isActive).length}
            </div>
            <div className="text-sm text-muted-foreground">Active Users</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {departments.length}
            </div>
            <div className="text-sm text-muted-foreground">Departments</div>
          </CardContent>
        </Card>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="roles" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Roles ({roles.length})</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Users ({users.length})</span>
          </TabsTrigger>
          <TabsTrigger
            value="departments"
            className="flex items-center space-x-2"
          >
            <Briefcase className="h-4 w-4" />
            <span>Departments ({departments.length})</span>
          </TabsTrigger>
        </TabsList>

        {/* Roles Tab */}
        <TabsContent value="roles" className="space-y-6">
          {roles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {roles.map((role) => (
                <RoleCard key={role.id} role={role} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Roles Found</h3>
                <p className="text-muted-foreground mb-6">
                  Create your first role to start managing user permissions
                </p>
                <Button
                  onClick={() => setIsCreateRoleOpen(true)}
                  className="bg-gradient-to-r from-primary to-purple-600"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Role
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                      data-testid="users-search-input"
                    />
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Select
                    value={selectedDepartment}
                    onValueChange={setSelectedDepartment}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {filteredUsers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsers.map((user) => (
                <UserCard key={user.id} user={user} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Users Found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery
                    ? "No users match your search criteria."
                    : "Invite your first team member to get started."}
                </p>
                {!searchQuery && (
                  <Button
                    onClick={() => setIsInviteUserOpen(true)}
                    className="bg-gradient-to-r from-primary to-purple-600"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite First User
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Departments Tab */}
        <TabsContent value="departments" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept) => (
              <Card key={dept.id}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{dept.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {dept.description}
                        </p>
                      </div>
                      <Badge variant={dept.isActive ? "default" : "secondary"}>
                        {dept.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Team Members
                      </span>
                      <span className="font-medium">{dept.userCount}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default RoleManagement;
