import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, Lock, AlertTriangle, Ban, UserX, Users, Globe, Database, Eye, Search, Filter, Download, Upload, RefreshCw, Activity, AlertOctagon, CheckCircle, XCircle, Clock, MapPin, Fingerprint, Server } from "lucide-react";

// TypeScript Interfaces
interface SecurityStats {
  totalUsers: number;
  bannedUsers: number;
  blockedIPs: number;
  activeModerators: number;
  flaggedContent: number;
  pendingReviews: number;
  threatLevel: "low" | "medium" | "high" | "critical";
  lastIncident?: string;
  platforms: {
    name: string;
    users: number;
    banned: number;
    flagged: number;
  }[];
}

interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  platforms: string[];
  status: "active" | "suspended" | "banned" | "flagged" | "under_review";
  ipAddresses: string[];
  lastLogin: string;
  registeredAt: string;
  country: string;
  deviceFingerprint: string;
  riskScore: number;
  moderationFlags: number;
  reports: number;
  violations: string[];
  accessLevel: "user" | "creator" | "moderator" | "admin" | "super_admin";
}

interface IPAddress {
  ip: string;
  status: "allowed" | "blocked" | "suspicious" | "vpn" | "proxy";
  country: string;
  city: string;
  users: string[];
  firstSeen: string;
  lastSeen: string;
  requests: number;
  riskScore: number;
  blocked: boolean;
  blockedReason?: string;
  blockedAt?: string;
  blockedBy?: string;
}

interface BanRecord {
  id: string;
  userId: string;
  username: string;
  platforms: string[];
  reason: string;
  severity: "warning" | "temporary" | "permanent";
  bannedBy: string;
  bannedAt: string;
  expiresAt?: string;
  ipAddresses: string[];
  appealStatus?: "pending" | "approved" | "rejected";
  notes?: string;
}

interface ModeratorAction {
  id: string;
  moderatorId: string;
  moderatorName: string;
  action: "ban" | "unban" | "suspend" | "flag" | "warn" | "block_ip" | "unblock_ip" | "delete_content";
  targetType: "user" | "ip" | "content";
  targetId: string;
  targetName: string;
  reason: string;
  platforms: string[];
  timestamp: string;
  details: string;
  reversible: boolean;
}

interface AccessDelegation {
  id: string;
  userId: string;
  username: string;
  grantedBy: string;
  grantedAt: string;
  expiresAt?: string;
  platforms: string[];
  databases: string[];
  permissions: {
    read: boolean;
    write: boolean;
    delete: boolean;
    ban: boolean;
    moderate: boolean;
    admin: boolean;
  };
  active: boolean;
}

interface FlaggedContent {
  id: string;
  contentType: "post" | "video" | "image" | "comment" | "message";
  contentId: string;
  userId: string;
  username: string;
  platform: string;
  reason: string;
  flaggedBy: string;
  flaggedAt: string;
  status: "pending" | "reviewing" | "actioned" | "dismissed";
  severity: "low" | "medium" | "high" | "critical";
  aiConfidence?: number;
  reviewedBy?: string;
  reviewedAt?: string;
  action?: string;
}

interface ThreatAlert {
  id: string;
  type: "brute_force" | "ddos" | "spam" | "fraud" | "underage" | "illegal_content" | "account_takeover";
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  affectedPlatforms: string[];
  affectedUsers: string[];
  detectedAt: string;
  status: "active" | "investigating" | "mitigated" | "resolved";
  mitigatedBy?: string;
  mitigatedAt?: string;
}

export default function EcosystemSecurityManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("overview");
  const [statusFilter, setStatusFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedIP, setSelectedIP] = useState<IPAddress | null>(null);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isIPDialogOpen, setIsIPDialogOpen] = useState(false);
  const [isBanDialogOpen, setIsBanDialogOpen] = useState(false);
  const [isDelegateDialogOpen, setIsDelegateDialogOpen] = useState(false);
  const [banReason, setBanReason] = useState("");
  const [banSeverity, setBanSeverity] = useState<"warning" | "temporary" | "permanent">("temporary");
  const [banPlatforms, setBanPlatforms] = useState<string[]>([]);

  // Fetch security statistics
  const { data: securityStats } = useQuery<SecurityStats>({
    queryKey: ["/api/security/stats"],
    refetchInterval: 10000,
  });

  // Fetch all users across ecosystem
  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/security/users", statusFilter, platformFilter, searchQuery],
    refetchInterval: 30000,
  });

  // Fetch IP addresses
  const { data: ipAddresses = [], isLoading: ipsLoading } = useQuery<IPAddress[]>({
    queryKey: ["/api/security/ip-addresses"],
    refetchInterval: 30000,
  });

  // Fetch ban records
  const { data: banRecords = [], isLoading: bansLoading } = useQuery<BanRecord[]>({
    queryKey: ["/api/security/bans"],
    refetchInterval: 30000,
  });

  // Fetch moderator actions
  const { data: moderatorActions = [] } = useQuery<ModeratorAction[]>({
    queryKey: ["/api/security/moderator-actions"],
    refetchInterval: 15000,
  });

  // Fetch access delegations
  const { data: accessDelegations = [] } = useQuery<AccessDelegation[]>({
    queryKey: ["/api/security/access-delegations"],
    refetchInterval: 60000,
  });

  // Fetch flagged content
  const { data: flaggedContent = [] } = useQuery<FlaggedContent[]>({
    queryKey: ["/api/security/flagged-content"],
    refetchInterval: 20000,
  });

  // Fetch threat alerts
  const { data: threatAlerts = [] } = useQuery<ThreatAlert[]>({
    queryKey: ["/api/security/threat-alerts"],
    refetchInterval: 5000,
  });

  // Ban user mutation
  const banUserMutation = useMutation({
    mutationFn: ({ userId, reason, severity, platforms, ipBan }: { userId: string; reason: string; severity: string; platforms: string[]; ipBan: boolean }) =>
      apiRequest("/api/security/ban-user", "POST", { userId, reason, severity, platforms, ipBan }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/security/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/security/bans"] });
      queryClient.invalidateQueries({ queryKey: ["/api/security/stats"] });
      toast({ title: "User banned", description: "User has been banned across selected platforms" });
      setIsBanDialogOpen(false);
    },
  });

  // Unban user mutation
  const unbanUserMutation = useMutation({
    mutationFn: (banId: string) =>
      apiRequest(`/api/security/bans/${banId}/lift`, "POST"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/security/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/security/bans"] });
      queryClient.invalidateQueries({ queryKey: ["/api/security/stats"] });
      toast({ title: "Ban lifted", description: "User ban has been lifted" });
    },
  });

  // Block IP mutation
  const blockIPMutation = useMutation({
    mutationFn: ({ ip, reason }: { ip: string; reason: string }) =>
      apiRequest("/api/security/block-ip", "POST", { ip, reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/security/ip-addresses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/security/stats"] });
      toast({ title: "IP blocked", description: "IP address has been blocked" });
    },
  });

  // Unblock IP mutation
  const unblockIPMutation = useMutation({
    mutationFn: (ip: string) =>
      apiRequest("/api/security/unblock-ip", "POST", { ip }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/security/ip-addresses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/security/stats"] });
      toast({ title: "IP unblocked", description: "IP address has been unblocked" });
    },
  });

  // Delegate access mutation
  const delegateAccessMutation = useMutation({
    mutationFn: (data: Partial<AccessDelegation>) =>
      apiRequest("/api/security/delegate-access", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/security/access-delegations"] });
      toast({ title: "Access delegated", description: "Access permissions have been granted" });
      setIsDelegateDialogOpen(false);
    },
  });

  // Revoke access mutation
  const revokeAccessMutation = useMutation({
    mutationFn: (delegationId: string) =>
      apiRequest(`/api/security/access-delegations/${delegationId}/revoke`, "POST"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/security/access-delegations"] });
      toast({ title: "Access revoked", description: "Access permissions have been revoked" });
    },
  });

  // Review flagged content mutation
  const reviewContentMutation = useMutation({
    mutationFn: ({ contentId, action }: { contentId: string; action: string }) =>
      apiRequest(`/api/security/flagged-content/${contentId}/review`, "POST", { action }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/security/flagged-content"] });
      toast({ title: "Content reviewed", description: "Content has been reviewed and actioned" });
    },
  });

  const getThreatLevelBadge = (level: SecurityStats["threatLevel"]) => {
    const badges = {
      low: <Badge variant="default" className="bg-green-500">Low Threat</Badge>,
      medium: <Badge variant="secondary" className="bg-yellow-500">Medium Threat</Badge>,
      high: <Badge variant="destructive" className="bg-orange-500">High Threat</Badge>,
      critical: <Badge variant="destructive" className="animate-pulse">Critical Threat</Badge>,
    };
    return badges[level];
  };

  const getStatusBadge = (status: User["status"]) => {
    const badges = {
      active: <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>,
      suspended: <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Suspended</Badge>,
      banned: <Badge variant="destructive"><Ban className="w-3 h-3 mr-1" />Banned</Badge>,
      flagged: <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" />Flagged</Badge>,
      under_review: <Badge variant="secondary"><Eye className="w-3 h-3 mr-1" />Under Review</Badge>,
    };
    return badges[status];
  };

  const PLATFORMS = ["FanzMoney", "BoyFanz", "GayFanz", "BearFanz", "CougarFanz", "PupFanz", "DLBroz", "FanzTube", "FanzRoulette", "Guyz", "FanzClips"];

  return (
    <div className="p-6 space-y-6">
      {/* Critical Security Alert */}
      {securityStats?.threatLevel && ["high", "critical"].includes(securityStats.threatLevel) && (
        <Alert variant="destructive">
          <AlertOctagon className="h-4 w-4" />
          <AlertTitle>Security Alert - {securityStats.threatLevel.toUpperCase()} Threat Level</AlertTitle>
          <AlertDescription>
            {threatAlerts.filter(a => a.status === "active").length} active threats detected. Immediate action required.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="w-8 h-8" />
            Ecosystem Security Command Center
          </h1>
          <p className="text-muted-foreground mt-1">
            Military-grade security management across all 94 FANZ platforms
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsDelegateDialogOpen(true)}>
            <Lock className="w-4 h-4 mr-2" />
            Delegate Access
          </Button>
          <Button variant="destructive" onClick={() => setIsBanDialogOpen(true)}>
            <Ban className="w-4 h-4 mr-2" />
            Ban User
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityStats?.totalUsers?.toLocaleString() ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across {securityStats?.platforms?.length ?? 0} platforms
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Banned Users</CardTitle>
            <Ban className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityStats?.bannedUsers?.toLocaleString() ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {securityStats?.blockedIPs ?? 0} IPs blocked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <Eye className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityStats?.pendingReviews?.toLocaleString() ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {securityStats?.flaggedContent ?? 0} flagged content
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Threat Level</CardTitle>
            <AlertTriangle className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {securityStats?.threatLevel && getThreatLevelBadge(securityStats.threatLevel)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {securityStats?.activeModerators ?? 0} moderators active
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Platform Overview */}
      {securityStats?.platforms && securityStats.platforms.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Platform Security Overview</CardTitle>
            <CardDescription>Real-time security metrics across all platforms</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {securityStats.platforms.map((platform) => (
                <div key={platform.name} className="p-3 border rounded-lg">
                  <div className="font-medium text-sm">{platform.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {platform.users.toLocaleString()} users
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    {platform.banned > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {platform.banned} banned
                      </Badge>
                    )}
                    {platform.flagged > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {platform.flagged} flagged
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="ips">IP Tracking</TabsTrigger>
          <TabsTrigger value="bans">Bans</TabsTrigger>
          <TabsTrigger value="flagged">Flagged Content</TabsTrigger>
          <TabsTrigger value="threats">Threat Alerts</TabsTrigger>
          <TabsTrigger value="access">Access Control</TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>Monitor and manage users across all platforms</CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 w-64"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="banned">Banned</SelectItem>
                      <SelectItem value="flagged">Flagged</SelectItem>
                      <SelectItem value="under_review">Under Review</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={platformFilter} onValueChange={setPlatformFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Platforms</SelectItem>
                      {PLATFORMS.map(p => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading users...</div>
              ) : users.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No users found</div>
              ) : (
                <div className="space-y-3">
                  {users.map((user) => (
                    <div key={user.id} className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                              <Users className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <div className="font-semibold">{user.username}</div>
                              <div className="text-sm text-muted-foreground">{user.email}</div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 text-sm">
                            <div>
                              <span className="text-muted-foreground">Platforms:</span>
                              <span className="ml-2 font-medium">{user.platforms.length}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Risk Score:</span>
                              <span className={`ml-2 font-medium ${user.riskScore > 70 ? 'text-red-500' : user.riskScore > 40 ? 'text-yellow-500' : 'text-green-500'}`}>
                                {user.riskScore}/100
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Reports:</span>
                              <span className="ml-2 font-medium">{user.reports}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Last Login:</span>
                              <span className="ml-2 font-medium">{new Date(user.lastLogin).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-3">
                            {getStatusBadge(user.status)}
                            <Badge variant="outline">{user.accessLevel}</Badge>
                            {user.ipAddresses.length > 1 && (
                              <Badge variant="secondary">{user.ipAddresses.length} IPs</Badge>
                            )}
                            {user.violations.length > 0 && (
                              <Badge variant="destructive">{user.violations.length} violations</Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user);
                              setIsUserDialogOpen(true);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Details
                          </Button>
                          {user.status !== "banned" && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user);
                                setIsBanDialogOpen(true);
                              }}
                            >
                              <Ban className="w-4 h-4 mr-1" />
                              Ban
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* IP Tracking Tab */}
        <TabsContent value="ips" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>IP Address Tracking</CardTitle>
              <CardDescription>Monitor and block malicious IP addresses</CardDescription>
            </CardHeader>
            <CardContent>
              {ipsLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading IP addresses...</div>
              ) : ipAddresses.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No IP addresses tracked</div>
              ) : (
                <div className="space-y-3">
                  {ipAddresses.slice(0, 50).map((ip) => (
                    <div key={ip.ip} className="p-4 border rounded-lg flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <Fingerprint className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <div className="font-mono font-semibold">{ip.ip}</div>
                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                              <MapPin className="w-3 h-3" />
                              {ip.city}, {ip.country}
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-4 gap-3 mt-3 text-sm">
                          <div>
                            <span className="text-muted-foreground">Users:</span>
                            <span className="ml-2 font-medium">{ip.users.length}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Requests:</span>
                            <span className="ml-2 font-medium">{ip.requests.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Risk Score:</span>
                            <span className={`ml-2 font-medium ${ip.riskScore > 70 ? 'text-red-500' : ip.riskScore > 40 ? 'text-yellow-500' : 'text-green-500'}`}>
                              {ip.riskScore}/100
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Last Seen:</span>
                            <span className="ml-2 font-medium">{new Date(ip.lastSeen).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          {ip.status === "blocked" && <Badge variant="destructive">Blocked</Badge>}
                          {ip.status === "suspicious" && <Badge variant="secondary">Suspicious</Badge>}
                          {ip.status === "vpn" && <Badge variant="outline">VPN</Badge>}
                          {ip.status === "proxy" && <Badge variant="outline">Proxy</Badge>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {ip.blocked ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => unblockIPMutation.mutate(ip.ip)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Unblock
                          </Button>
                        ) : (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              const reason = prompt("Enter block reason:");
                              if (reason) {
                                blockIPMutation.mutate({ ip: ip.ip, reason });
                              }
                            }}
                          >
                            <Ban className="w-4 h-4 mr-1" />
                            Block
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bans Tab */}
        <TabsContent value="bans" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ban Records</CardTitle>
              <CardDescription>Review and manage user bans across platforms</CardDescription>
            </CardHeader>
            <CardContent>
              {bansLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading ban records...</div>
              ) : banRecords.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No ban records found</div>
              ) : (
                <div className="space-y-3">
                  {banRecords.map((ban) => (
                    <div key={ban.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-semibold">{ban.username}</div>
                          <div className="text-sm text-muted-foreground mt-1">
                            Reason: {ban.reason}
                          </div>
                          <div className="flex items-center gap-2 mt-2 text-sm">
                            <Badge variant="destructive">{ban.severity}</Badge>
                            <span className="text-muted-foreground">
                              Banned by {ban.bannedBy} on {new Date(ban.bannedAt).toLocaleDateString()}
                            </span>
                            {ban.expiresAt && (
                              <span className="text-muted-foreground">
                                • Expires: {new Date(ban.expiresAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {ban.platforms.map(p => (
                              <Badge key={p} variant="outline">{p}</Badge>
                            ))}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (confirm("Are you sure you want to lift this ban?")) {
                              unbanUserMutation.mutate(ban.id);
                            }
                          }}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Lift Ban
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Flagged Content Tab */}
        <TabsContent value="flagged" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Flagged Content Review</CardTitle>
              <CardDescription>Review content flagged by moderators across platforms</CardDescription>
            </CardHeader>
            <CardContent>
              {flaggedContent.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No flagged content</div>
              ) : (
                <div className="space-y-3">
                  {flaggedContent.filter(c => c.status === "pending").map((content) => (
                    <div key={content.id} className="p-4 border-l-4 border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{content.contentType}</Badge>
                            <Badge variant="destructive">{content.severity}</Badge>
                            <Badge variant="outline">{content.platform}</Badge>
                          </div>
                          <div className="text-sm mt-2">
                            <span className="font-medium">User:</span> {content.username}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Reason:</span> {content.reason}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Flagged by {content.flaggedBy} on {new Date(content.flaggedAt).toLocaleString()}
                          </div>
                          {content.aiConfidence && (
                            <div className="text-sm mt-2">
                              AI Confidence: {(content.aiConfidence * 100).toFixed(1)}%
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => reviewContentMutation.mutate({ contentId: content.id, action: "remove" })}
                          >
                            Remove
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => reviewContentMutation.mutate({ contentId: content.id, action: "dismiss" })}
                          >
                            Dismiss
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Threat Alerts Tab */}
        <TabsContent value="threats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Threat Alerts</CardTitle>
              <CardDescription>Real-time security threats and incidents</CardDescription>
            </CardHeader>
            <CardContent>
              {threatAlerts.filter(t => t.status === "active").length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No active threats</div>
              ) : (
                <div className="space-y-3">
                  {threatAlerts.filter(t => t.status === "active").map((threat) => (
                    <Alert key={threat.id} variant="destructive">
                      <AlertOctagon className="h-4 w-4" />
                      <AlertTitle className="flex items-center gap-2">
                        {threat.type.replace(/_/g, " ").toUpperCase()}
                        <Badge variant="destructive">{threat.severity}</Badge>
                      </AlertTitle>
                      <AlertDescription>
                        <div className="mt-2">{threat.description}</div>
                        <div className="mt-2 text-sm">
                          <span className="font-medium">Affected Platforms:</span> {threat.affectedPlatforms.join(", ")}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Affected Users:</span> {threat.affectedUsers.length}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Detected: {new Date(threat.detectedAt).toLocaleString()}
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Access Control Tab */}
        <TabsContent value="access" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Access Delegations</CardTitle>
              <CardDescription>Manage access permissions across platforms and databases</CardDescription>
            </CardHeader>
            <CardContent>
              {accessDelegations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No access delegations</div>
              ) : (
                <div className="space-y-3">
                  {accessDelegations.map((delegation) => (
                    <div key={delegation.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-semibold">{delegation.username}</div>
                          <div className="text-sm text-muted-foreground">
                            Granted by {delegation.grantedBy} on {new Date(delegation.grantedAt).toLocaleDateString()}
                          </div>
                          <div className="grid grid-cols-6 gap-2 mt-3">
                            {Object.entries(delegation.permissions).map(([key, value]) => (
                              <Badge key={key} variant={value ? "default" : "outline"}>
                                {key}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {delegation.platforms.map(p => (
                              <Badge key={p} variant="secondary">{p}</Badge>
                            ))}
                          </div>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            if (confirm("Revoke access for this user?")) {
                              revokeAccessMutation.mutate(delegation.id);
                            }
                          }}
                        >
                          Revoke
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Ban User Dialog */}
      <Dialog open={isBanDialogOpen} onOpenChange={setIsBanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ban User</DialogTitle>
            <DialogDescription>Ban user across selected platforms</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedUser && (
              <div className="p-3 bg-accent rounded">
                <div className="font-medium">{selectedUser.username}</div>
                <div className="text-sm text-muted-foreground">{selectedUser.email}</div>
              </div>
            )}
            <div>
              <Label>Reason</Label>
              <Textarea
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Enter ban reason..."
              />
            </div>
            <div>
              <Label>Severity</Label>
              <Select value={banSeverity} onValueChange={(v: any) => setBanSeverity(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="temporary">Temporary Ban (30 days)</SelectItem>
                  <SelectItem value="permanent">Permanent Ban</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Platforms</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {PLATFORMS.map(platform => (
                  <div key={platform} className="flex items-center space-x-2">
                    <Checkbox
                      checked={banPlatforms.includes(platform)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setBanPlatforms([...banPlatforms, platform]);
                        } else {
                          setBanPlatforms(banPlatforms.filter(p => p !== platform));
                        }
                      }}
                    />
                    <label className="text-sm">{platform}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBanDialogOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedUser && banReason && banPlatforms.length > 0) {
                  banUserMutation.mutate({
                    userId: selectedUser.id,
                    reason: banReason,
                    severity: banSeverity,
                    platforms: banPlatforms,
                    ipBan: true
                  });
                }
              }}
            >
              Ban User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
