import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Shield,
  FileText,
  Users,
  Lock,
  AlertTriangle,
  CheckCircle,
  Clock,
  Archive,
  Search,
  Download,
  Upload,
  Eye,
  Mail,
  Database,
  Settings,
  Gavel,
  Ban,
  FileWarning,
  UserCheck,
} from "lucide-react";

interface LegalHold {
  id: string;
  holdName: string;
  caseNumber: string;
  description: string;
  status: "active" | "released" | "pending";
  initiatedBy: string;
  initiatedDate: string;
  releaseDate?: string;
  custodianCount: number;
  dataSourceCount: number;
  preservedItems: number;
  priority: "critical" | "high" | "medium" | "low";
  jurisdiction: string;
  legalTeam: string[];
  estimatedDataSize: string;
}

interface Custodian {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  acknowledgedDate?: string;
  status: "pending" | "acknowledged" | "non-compliant";
  dataSources: string[];
  lastActivity: string;
}

interface DataSource {
  id: string;
  name: string;
  type: "email" | "files" | "database" | "chat" | "social" | "storage";
  platform: string;
  itemCount: number;
  sizeGB: number;
  lastBackup: string;
  status: "preserved" | "in-progress" | "failed";
  retentionPolicy: string;
}

interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  performedBy: string;
  holdId: string;
  details: string;
  ipAddress: string;
}

export default function LegalHoldManagement() {
  const [activeTab, setActiveTab] = useState("holds");
  const [selectedHold, setSelectedHold] = useState<LegalHold | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch CSAM legal holds (Super Admin only)
  const { data: csamResponse } = useQuery({
    queryKey: ["/api/legal/csam-holds"],
    refetchInterval: 30000,
  });

  const holds = (csamResponse?.holds || []).map((h: any) => ({
    id: h.id,
    holdName: `CSAM Case ${h.caseNumber}`,
    caseNumber: h.caseNumber,
    description: h.contentDescription || '',
    status: h.status === 'pending' ? 'pending' : h.status === 'closed' ? 'released' : 'active',
    initiatedBy: h.reportedBy || h.createdBy,
    initiatedDate: h.createdAt,
    releaseDate: h.resolvedAt,
    custodianCount: 1,
    dataSourceCount: 0,
    preservedItems: 0,
    priority: h.priority || 'critical',
    jurisdiction: 'Federal - 18 U.S.C. § 2258A',
    legalTeam: ['Super Admin', 'Law Enforcement'],
    estimatedDataSize: 'Encrypted Storage',
  }));

  // Fetch custodians (placeholder - CSAM system doesn't have custodians)
  const { data: custodians = [] } = useQuery<Custodian[]>({
    queryKey: ["/api/legal/custodians", selectedHold?.id],
    enabled: false, // Disabled for CSAM system
    refetchInterval: 30000,
  });

  // Fetch evidence files for selected hold
  const { data: evidenceResponse } = useQuery({
    queryKey: ["/api/legal/csam-holds", selectedHold?.caseNumber, "evidence"],
    enabled: !!selectedHold,
    refetchInterval: 30000,
  });

  const dataSources = (evidenceResponse?.evidenceFiles || []).map((e: any) => ({
    id: e.id,
    name: e.filename,
    type: e.fileType === 'video' ? 'files' : e.fileType === 'screenshot' ? 'files' : 'storage',
    platform: 'Encrypted CSAM Storage',
    itemCount: 1,
    sizeGB: (e.fileSize / (1024 * 1024 * 1024)).toFixed(2),
    lastBackup: e.createdAt,
    status: 'preserved',
    retentionPolicy: '7 Years (Federal Requirement)',
  }));

  // Fetch audit logs from selected hold
  const auditLogs = selectedHold ? (selectedHold as any).accessLog?.map((log: any, idx: number) => ({
    id: idx.toString(),
    timestamp: log.timestamp,
    action: log.action,
    performedBy: log.userId || 'Super Admin',
    holdId: selectedHold.id,
    details: JSON.stringify(log.changes || log.details || {}),
    ipAddress: log.ipAddress || 'N/A',
  })) || [] : [];

  // Create CSAM legal hold mutation (Super Admin only)
  const createHoldMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/legal/csam-holds/create", "POST", {
      contentDescription: data.description,
      contentUrl: data.caseNumber,
      priority: data.priority || 'critical',
      suspectUserId: '',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/legal/csam-holds"] });
      toast({ title: "CSAM legal hold created successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating legal hold",
        description: error.message || "Super Admin access required",
        variant: "destructive"
      });
    },
  });

  // Close CSAM legal hold mutation (Super Admin only)
  const releaseHoldMutation = useMutation({
    mutationFn: (caseNumber: string) => apiRequest(`/api/legal/csam-holds/${caseNumber}`, "DELETE", {
      reason: "Case closed by Super Admin",
      approvedBy: "current-user-id",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/legal/csam-holds"] });
      toast({ title: "CSAM legal hold closed" });
      setSelectedHold(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error closing legal hold",
        description: error.message || "Super Admin access required",
        variant: "destructive"
      });
    },
  });

  // Send custodian notice mutation (Not applicable for CSAM)
  const sendNoticeMutation = useMutation({
    mutationFn: ({ holdId, custodianIds }: { holdId: string; custodianIds: string[] }) =>
      Promise.resolve({ message: "Not applicable for CSAM legal holds" }),
    onSuccess: () => {
      toast({ title: "Not applicable for CSAM legal holds", variant: "destructive" });
    },
  });

  // Preserve data source mutation (handled via evidence upload for CSAM)
  const preserveDataMutation = useMutation({
    mutationFn: ({ holdId, sourceId }: { holdId: string; sourceId: string }) =>
      Promise.resolve({ message: "Use evidence upload for CSAM cases" }),
    onSuccess: () => {
      toast({ title: "Use evidence upload for CSAM cases", variant: "destructive" });
    },
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      active: <Badge className="bg-green-500">Active</Badge>,
      released: <Badge variant="secondary">Released</Badge>,
      pending: <Badge className="bg-yellow-500">Pending</Badge>,
      acknowledged: <Badge className="bg-blue-500">Acknowledged</Badge>,
      "non-compliant": <Badge variant="destructive">Non-Compliant</Badge>,
      preserved: <Badge className="bg-green-500">Preserved</Badge>,
      "in-progress": <Badge className="bg-yellow-500">In Progress</Badge>,
      failed: <Badge variant="destructive">Failed</Badge>,
    };
    return variants[status as keyof typeof variants] || <Badge>{status}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      critical: <Badge variant="destructive">Critical</Badge>,
      high: <Badge className="bg-orange-500">High</Badge>,
      medium: <Badge className="bg-yellow-500">Medium</Badge>,
      low: <Badge variant="secondary">Low</Badge>,
    };
    return variants[priority as keyof typeof variants];
  };

  const getDataSourceIcon = (type: string) => {
    const icons = {
      email: <Mail className="w-4 h-4" />,
      files: <FileText className="w-4 h-4" />,
      database: <Database className="w-4 h-4" />,
      chat: <Users className="w-4 h-4" />,
      social: <Users className="w-4 h-4" />,
      storage: <Archive className="w-4 h-4" />,
    };
    return icons[type as keyof typeof icons] || <FileText className="w-4 h-4" />;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Critical Security Warning */}
      <Card className="bg-red-950/20 border-red-500/50 mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
            <div>
              <p className="font-bold text-red-500">CRITICAL: CSAM Legal Hold System - Super Admin Only</p>
              <p className="text-sm text-muted-foreground">
                This system handles evidence of child exploitation. Unauthorized access or disclosure is a FEDERAL CRIME under 18 U.S.C. § 2258A.
                All access is logged and monitored.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold cyber-text-glow flex items-center gap-2">
            <Shield className="w-8 h-8 text-red-500" />
            CSAM Legal Hold Management
          </h1>
          <p className="text-muted-foreground">
            Child Safety & Law Enforcement Evidence Preservation (18 U.S.C. § 2258A Compliance)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Shield className="w-4 h-4 mr-2" />
                Create Legal Hold
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Legal Hold</DialogTitle>
                <DialogDescription>
                  Initiate a new legal hold to preserve documents and data for litigation
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Hold Name</Label>
                  <Input placeholder="e.g., Smith v. FANZ Group - 2025" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Case Number</Label>
                    <Input placeholder="e.g., CV-2025-001234" />
                  </div>
                  <div>
                    <Label>Priority</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Jurisdiction</Label>
                  <Input placeholder="e.g., US District Court, Northern California" />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea placeholder="Describe the legal matter and scope of preservation..." rows={4} />
                </div>
                <div>
                  <Label>Legal Team (comma-separated emails)</Label>
                  <Input placeholder="attorney@lawfirm.com, paralegal@lawfirm.com" />
                </div>
                <Button className="w-full">Create Legal Hold</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Holds</p>
                <p className="text-2xl font-bold">{holds.filter(h => h.status === "active").length}</p>
              </div>
              <Shield className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Custodians</p>
                <p className="text-2xl font-bold">{holds.reduce((sum, h) => sum + h.custodianCount, 0)}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Preserved Items</p>
                <p className="text-2xl font-bold">{holds.reduce((sum, h) => sum + h.preservedItems, 0).toLocaleString()}</p>
              </div>
              <Lock className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Data Sources</p>
                <p className="text-2xl font-bold">{holds.reduce((sum, h) => sum + h.dataSourceCount, 0)}</p>
              </div>
              <Database className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="holds">Legal Holds</TabsTrigger>
          <TabsTrigger value="custodians">Custodians</TabsTrigger>
          <TabsTrigger value="data">Data Sources</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
        </TabsList>

        {/* Legal Holds Tab */}
        <TabsContent value="holds" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Active Legal Holds</CardTitle>
                  <CardDescription>Manage litigation holds and document preservation</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Search holds..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                  <Button variant="outline" size="icon">
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hold Name</TableHead>
                    <TableHead>Case Number</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Initiated</TableHead>
                    <TableHead>Custodians</TableHead>
                    <TableHead>Preserved Items</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {holds.map((hold) => (
                    <TableRow key={hold.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedHold(hold)}>
                      <TableCell className="font-medium">{hold.holdName}</TableCell>
                      <TableCell>{hold.caseNumber}</TableCell>
                      <TableCell>{getStatusBadge(hold.status)}</TableCell>
                      <TableCell>{getPriorityBadge(hold.priority)}</TableCell>
                      <TableCell>{new Date(hold.initiatedDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{hold.custodianCount}</Badge>
                      </TableCell>
                      <TableCell>{hold.preservedItems.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedHold(hold); }}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          {hold.status === "active" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                releaseHoldMutation.mutate(hold.caseNumber);
                              }}
                            >
                              <Ban className="w-4 h-4 text-red-500" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Custodians Tab */}
        <TabsContent value="custodians" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Legal Hold Custodians</CardTitle>
                  <CardDescription>Track custodian acknowledgments and compliance</CardDescription>
                </div>
                <Button onClick={() => sendNoticeMutation.mutate({ holdId: selectedHold?.id || "", custodianIds: [] })}>
                  <Mail className="w-4 h-4 mr-2" />
                  Send Notices
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Acknowledged</TableHead>
                    <TableHead>Data Sources</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {custodians.map((custodian) => (
                    <TableRow key={custodian.id}>
                      <TableCell className="font-medium">{custodian.name}</TableCell>
                      <TableCell>{custodian.email}</TableCell>
                      <TableCell>{custodian.department}</TableCell>
                      <TableCell>{custodian.role}</TableCell>
                      <TableCell>{getStatusBadge(custodian.status)}</TableCell>
                      <TableCell>
                        {custodian.acknowledgedDate ? (
                          <div className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            {new Date(custodian.acknowledgedDate).toLocaleDateString()}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-yellow-600">
                            <Clock className="w-4 h-4" />
                            Pending
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{custodian.dataSources.length}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Mail className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Sources Tab */}
        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Preserved Data Sources</CardTitle>
                  <CardDescription>Monitor data preservation and backup status</CardDescription>
                </div>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data Source</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Backup</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dataSources.map((source) => (
                    <TableRow key={source.id}>
                      <TableCell className="flex items-center gap-2">
                        {getDataSourceIcon(source.type)}
                        <span className="font-medium">{source.name}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{source.type}</Badge>
                      </TableCell>
                      <TableCell>{source.platform}</TableCell>
                      <TableCell>{source.itemCount.toLocaleString()}</TableCell>
                      <TableCell>{source.sizeGB} GB</TableCell>
                      <TableCell>{getStatusBadge(source.status)}</TableCell>
                      <TableCell>{new Date(source.lastBackup).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => preserveDataMutation.mutate({ holdId: selectedHold?.id || "", sourceId: source.id })}
                        >
                          <Lock className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Trail Tab */}
        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audit Trail</CardTitle>
              <CardDescription>Complete history of all legal hold actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auditLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-4 p-4 border rounded-lg">
                    <FileWarning className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{log.action}</span>
                        <span className="text-sm text-muted-foreground">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{log.details}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <UserCheck className="w-3 h-3" />
                          {log.performedBy}
                        </span>
                        <span>IP: {log.ipAddress}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Selected Hold Details Modal */}
      {selectedHold && (
        <Dialog open={!!selectedHold} onOpenChange={() => setSelectedHold(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                {selectedHold.holdName}
              </DialogTitle>
              <DialogDescription>Case #{selectedHold.caseNumber}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedHold.status)}</div>
                </div>
                <div>
                  <Label>Priority</Label>
                  <div className="mt-1">{getPriorityBadge(selectedHold.priority)}</div>
                </div>
                <div>
                  <Label>Initiated Date</Label>
                  <p className="text-sm">{new Date(selectedHold.initiatedDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label>Initiated By</Label>
                  <p className="text-sm">{selectedHold.initiatedBy}</p>
                </div>
                <div>
                  <Label>Jurisdiction</Label>
                  <p className="text-sm">{selectedHold.jurisdiction}</p>
                </div>
                <div>
                  <Label>Estimated Data Size</Label>
                  <p className="text-sm">{selectedHold.estimatedDataSize}</p>
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <p className="text-sm mt-1">{selectedHold.description}</p>
              </div>
              <div>
                <Label>Legal Team</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedHold.legalTeam.map((member, idx) => (
                    <Badge key={idx} variant="outline">{member}</Badge>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Export Hold Report
                </Button>
                {selectedHold.status === "active" && (
                  <Button variant="destructive" onClick={() => releaseHoldMutation.mutate(selectedHold.caseNumber)}>
                    <Ban className="w-4 h-4 mr-2" />
                    Close Case
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
