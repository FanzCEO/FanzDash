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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  FileText,
  Search,
  Filter,
  Download,
  Plus,
  Eye,
  TrendingUp,
  Globe,
  Building,
  Scale,
  BookOpen,
  AlertCircle,
  Clock,
  Users,
  BarChart3,
  Award,
  FileCheck,
  XCircle,
} from "lucide-react";

export default function HRComplianceDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRequirement, setSelectedRequirement] = useState<any>(null);
  const [isViolationDialogOpen, setIsViolationDialogOpen] = useState(false);
  const [isPolicyDialogOpen, setIsPolicyDialogOpen] = useState(false);

  // Fetch compliance dashboard
  const { data: dashboard, isLoading: dashboardLoading } = useQuery({
    queryKey: ["/api/hr-compliance/dashboard"],
  });

  // Fetch all compliance requirements
  const { data: requirementsData } = useQuery({
    queryKey: ["/api/hr-compliance/requirements"],
  });

  // Fetch all policies
  const { data: policiesData } = useQuery({
    queryKey: ["/api/hr-compliance/policies"],
  });

  // Search policies
  const { data: searchResults } = useQuery({
    queryKey: ["/api/hr-compliance/policies/search", searchQuery],
    enabled: searchQuery.length > 0,
  });

  // Record violation mutation
  const recordViolationMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/hr-compliance/violations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to record violation");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hr-compliance/dashboard"] });
      toast({ title: "Violation Recorded", description: "Compliance violation has been logged" });
      setIsViolationDialogOpen(false);
    },
  });

  // Acknowledge policy mutation
  const acknowledgePolicyMutation = useMutation({
    mutationFn: async (policyId: string) => {
      const res = await fetch(`/api/hr-compliance/policies/${policyId}/acknowledge`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to acknowledge policy");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hr-compliance/policies"] });
      toast({ title: "Policy Acknowledged", description: "You have acknowledged this policy" });
      setIsPolicyDialogOpen(false);
    },
  });

  const requirements = requirementsData?.requirements || [];
  const policies = policiesData?.policies || [];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-600" />
            HR Compliance Dashboard
          </h1>
          <p className="text-muted-foreground">
            Comprehensive legal compliance management across 50+ requirements
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsViolationDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Report Violation
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      {dashboard && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Compliance Rate</p>
                <h3 className="text-2xl font-bold text-green-600">
                  {dashboard.overview?.complianceRate || 0}%
                </h3>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Compliant</p>
                <h3 className="text-2xl font-bold">{dashboard.overview?.compliant || 0}</h3>
              </div>
              <Award className="h-8 w-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Warnings</p>
                <h3 className="text-2xl font-bold text-yellow-600">
                  {dashboard.overview?.warnings || 0}
                </h3>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Violations</p>
                <h3 className="text-2xl font-bold text-red-600">
                  {dashboard.overview?.violations || 0}
                </h3>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </Card>
        </div>
      )}

      <Tabs defaultValue="requirements" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="requirements">Requirements</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="search">Policy Search</TabsTrigger>
          <TabsTrigger value="violations">Violations</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Requirements Tab */}
        <TabsContent value="requirements" className="space-y-4">
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Compliance Requirements</h3>
            <div className="space-y-2">
              {requirements.map((req: any) => (
                <Card
                  key={req.id}
                  className="p-4 cursor-pointer hover:bg-accent"
                  onClick={() => setSelectedRequirement(req)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{req.name}</h4>
                        <Badge
                          variant={
                            req.criticalityLevel === "critical"
                              ? "destructive"
                              : req.criticalityLevel === "high"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {req.criticalityLevel}
                        </Badge>
                        <Badge variant="outline">{req.jurisdiction}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{req.description}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Legal Reference: {req.legalReference}
                      </p>
                    </div>
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Policies Tab */}
        <TabsContent value="policies" className="space-y-4">
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Employee Handbook & Policies</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {policies.map((policy: any) => (
                <Card
                  key={policy.id}
                  className="p-4 cursor-pointer hover:bg-accent"
                  onClick={() => {
                    setSelectedRequirement(policy);
                    setIsPolicyDialogOpen(true);
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <h4 className="font-semibold">{policy.title}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{policy.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">v{policy.version}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {policy.acknowledgedBy?.length || 0} acknowledgments
                        </span>
                      </div>
                    </div>
                    {policy.requiresAcknowledgment && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          acknowledgePolicyMutation.mutate(policy.id);
                        }}
                      >
                        <FileCheck className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Policy Search Tab */}
        <TabsContent value="search" className="space-y-4">
          <Card className="p-4">
            <div className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search policies, FAQs, and compliance requirements..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4" />
              </Button>
            </div>

            {searchQuery && searchResults && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">
                  {searchResults.results?.length || 0} results found
                </h3>
                {searchResults.results?.map((result: any, idx: number) => (
                  <Card key={idx} className="p-4">
                    <h4 className="font-semibold">{result.section?.title || "Policy"}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {result.snippet || result.section?.content?.substring(0, 200)}...
                    </p>
                    <div className="flex gap-2 mt-2">
                      {result.section?.categories?.map((cat: string) => (
                        <Badge key={cat} variant="outline">
                          {cat}
                        </Badge>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Violations Tab */}
        <TabsContent value="violations" className="space-y-4">
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Compliance Violations</h3>
            {dashboard?.recentViolations?.map((violation: any) => (
              <Card key={violation.id} className="p-4 mb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{violation.description}</h4>
                      <Badge
                        variant={
                          violation.severity === "critical"
                            ? "destructive"
                            : violation.severity === "major"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {violation.severity}
                      </Badge>
                      <Badge
                        variant={violation.status === "open" ? "destructive" : "outline"}
                      >
                        {violation.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Remediation: {violation.remediation}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Deadline: {new Date(violation.remediationDeadline).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Compliance by Jurisdiction
              </h3>
              {dashboard?.byJurisdiction?.map((item: any) => (
                <div key={item.jurisdiction} className="flex items-center justify-between py-2">
                  <span className="font-medium">{item.jurisdiction}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{item.total} requirements</Badge>
                    <span className="text-sm text-green-600 font-semibold">
                      {item.compliant}/{item.total}
                    </span>
                  </div>
                </div>
              ))}
            </Card>

            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Compliance Trends
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Overall Compliance</span>
                    <span className="text-sm font-bold text-green-600">
                      {dashboard?.overview?.complianceRate || 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${dashboard?.overview?.complianceRate || 0}%` }}
                    ></div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-green-50 rounded">
                    <div className="text-2xl font-bold text-green-600">
                      {dashboard?.overview?.compliant || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Compliant</div>
                  </div>
                  <div className="p-2 bg-yellow-50 rounded">
                    <div className="text-2xl font-bold text-yellow-600">
                      {dashboard?.overview?.warnings || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Warnings</div>
                  </div>
                  <div className="p-2 bg-red-50 rounded">
                    <div className="text-2xl font-bold text-red-600">
                      {dashboard?.overview?.violations || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Violations</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Record Violation Dialog */}
      <Dialog open={isViolationDialogOpen} onOpenChange={setIsViolationDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Record Compliance Violation</DialogTitle>
            <DialogDescription>
              Document a compliance violation for tracking and remediation
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              recordViolationMutation.mutate({
                requirementId: formData.get("requirementId"),
                description: formData.get("description"),
                severity: formData.get("severity"),
                remediation: formData.get("remediation"),
                remediationDeadline: formData.get("deadline"),
                assignedTo: formData.get("assignedTo"),
              });
            }}
          >
            <div className="space-y-4">
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea name="description" required placeholder="Describe the violation..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="severity">Severity</Label>
                  <select name="severity" required className="w-full p-2 border rounded">
                    <option value="minor">Minor</option>
                    <option value="major">Major</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="deadline">Remediation Deadline</Label>
                  <Input name="deadline" type="date" required />
                </div>
              </div>
              <div>
                <Label htmlFor="remediation">Remediation Plan</Label>
                <Textarea name="remediation" required placeholder="How will this be resolved?" />
              </div>
              <div>
                <Label htmlFor="assignedTo">Assigned To</Label>
                <Input name="assignedTo" required placeholder="Employee ID or name" />
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setIsViolationDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={recordViolationMutation.isPending}>
                {recordViolationMutation.isPending ? "Recording..." : "Record Violation"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Policy Details Dialog */}
      <Dialog open={isPolicyDialogOpen} onOpenChange={setIsPolicyDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedRequirement?.title || "Policy Details"}</DialogTitle>
            <DialogDescription>
              Version {selectedRequirement?.version} - Effective{" "}
              {selectedRequirement?.effectiveDate}
            </DialogDescription>
          </DialogHeader>
          <div className="prose max-w-none">
            <div
              dangerouslySetInnerHTML={{
                __html: selectedRequirement?.content?.replace(/\n/g, "<br/>") || "",
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPolicyDialogOpen(false)}>
              Close
            </Button>
            {selectedRequirement?.requiresAcknowledgment && (
              <Button onClick={() => acknowledgePolicyMutation.mutate(selectedRequirement.id)}>
                <FileCheck className="h-4 w-4 mr-2" />
                Acknowledge Policy
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
