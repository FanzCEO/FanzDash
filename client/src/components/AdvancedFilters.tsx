import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Filter,
  Search,
  Save,
  Share,
  Zap,
  Shield,
  AlertTriangle,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { ContentFilter } from "@shared/schema";

interface FilterCriteria {
  contentType?: string[];
  status?: string[];
  riskScoreMin?: number;
  riskScoreMax?: number;
  moderatorId?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  keywords?: string[];
  vaultStatus?: string;
  severity?: string[];
  clearanceRequired?: number;
  adminActions?: string[];
  ipAddress?: string;
  userAgent?: string;
  suspicious?: boolean;
}

export function AdvancedFilters() {
  const [activeFilter, setActiveFilter] = useState<FilterCriteria>({});
  const [filterName, setFilterName] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const queryClient = useQueryClient();

  const { data: savedFilters } = useQuery<ContentFilter[]>({
    queryKey: ["/api/filters"],
  });

  const { data: filteredContent } = useQuery({
    queryKey: ["/api/content/filtered", activeFilter],
    enabled: Object.keys(activeFilter).length > 0,
  });

  const saveFilterMutation = useMutation({
    mutationFn: (data: {
      name: string;
      criteria: FilterCriteria;
      isShared: boolean;
    }) => apiRequest("/api/filters", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/filters"] });
      setShowSaveDialog(false);
      setFilterName("");
    },
  });

  const applyFilterMutation = useMutation({
    mutationFn: (filterId: string) =>
      apiRequest(`/api/filters/${filterId}/apply`, "POST"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/content/filtered"] });
    },
  });

  return (
    <div className="space-y-6">
      <Card className="cyber-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-primary cyber-pulse" />
            <span className="cyber-text-glow">Advanced Content Filtering</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="quick" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="quick">Quick Filters</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="saved">Saved Filters</TabsTrigger>
            </TabsList>

            <TabsContent value="quick" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label>Content Type</Label>
                  <Select
                    value={activeFilter.contentType?.[0] || ""}
                    onValueChange={(value) =>
                      setActiveFilter({ ...activeFilter, contentType: [value] })
                    }
                  >
                    <SelectTrigger className="neon-border">
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="image">Images</SelectItem>
                      <SelectItem value="video">Videos</SelectItem>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="live_stream">Live Streams</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Status</Label>
                  <Select
                    value={activeFilter.status?.[0] || ""}
                    onValueChange={(value) =>
                      setActiveFilter({ ...activeFilter, status: [value] })
                    }
                  >
                    <SelectTrigger className="neon-border">
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="auto_blocked">Auto-blocked</SelectItem>
                      <SelectItem value="vaulted">Vaulted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Risk Score Range</Label>
                  <div className="flex space-x-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      className="neon-border"
                      value={activeFilter.riskScoreMin || ""}
                      onChange={(e) =>
                        setActiveFilter({
                          ...activeFilter,
                          riskScoreMin: parseFloat(e.target.value),
                        })
                      }
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      className="neon-border"
                      value={activeFilter.riskScoreMax || ""}
                      onChange={(e) =>
                        setActiveFilter({
                          ...activeFilter,
                          riskScoreMax: parseFloat(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label>Date Range</Label>
                  <div className="flex space-x-2">
                    <Input
                      type="date"
                      className="neon-border"
                      value={activeFilter.dateRange?.start || ""}
                      onChange={(e) =>
                        setActiveFilter({
                          ...activeFilter,
                          dateRange: {
                            ...activeFilter.dateRange,
                            start: e.target.value,
                            end: activeFilter.dateRange?.end || "",
                          },
                        })
                      }
                    />
                    <Input
                      type="date"
                      className="neon-border"
                      value={activeFilter.dateRange?.end || ""}
                      onChange={(e) =>
                        setActiveFilter({
                          ...activeFilter,
                          dateRange: {
                            ...activeFilter.dateRange,
                            start: activeFilter.dateRange?.start || "",
                            end: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="security" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="cyber-card">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-destructive">
                      <Shield className="w-4 h-4" />
                      <span>Vault Access</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={activeFilter.vaultStatus === "vaulted"}
                          onCheckedChange={(checked) =>
                            setActiveFilter({
                              ...activeFilter,
                              vaultStatus: checked ? "vaulted" : undefined,
                            })
                          }
                        />
                        <Label>Vaulted Content Only</Label>
                      </div>
                      <Select
                        value={activeFilter.severity?.[0] || ""}
                        onValueChange={(value) =>
                          setActiveFilter({
                            ...activeFilter,
                            severity: [value],
                          })
                        }
                      >
                        <SelectTrigger className="neon-border">
                          <SelectValue placeholder="All severity levels" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <Card className="cyber-card">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-accent">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Admin Actions</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Select
                        value={activeFilter.adminActions?.[0] || ""}
                        onValueChange={(value) =>
                          setActiveFilter({
                            ...activeFilter,
                            adminActions: [value],
                          })
                        }
                      >
                        <SelectTrigger className="neon-border">
                          <SelectValue placeholder="All actions" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="approve">Approvals</SelectItem>
                          <SelectItem value="reject">Rejections</SelectItem>
                          <SelectItem value="escalate">Escalations</SelectItem>
                          <SelectItem value="vault">Vault Actions</SelectItem>
                          <SelectItem value="unvault">
                            Unvault Actions
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="Moderator ID"
                        className="neon-border"
                        value={activeFilter.moderatorId || ""}
                        onChange={(e) =>
                          setActiveFilter({
                            ...activeFilter,
                            moderatorId: e.target.value,
                          })
                        }
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="cyber-card">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-secondary">
                      <Search className="w-4 h-4" />
                      <span>Suspicious Activity</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={activeFilter.suspicious || false}
                          onCheckedChange={(checked) =>
                            setActiveFilter({
                              ...activeFilter,
                              suspicious: checked,
                            })
                          }
                        />
                        <Label>Suspicious Only</Label>
                      </div>
                      <Input
                        placeholder="IP Address"
                        className="neon-border"
                        value={activeFilter.ipAddress || ""}
                        onChange={(e) =>
                          setActiveFilter({
                            ...activeFilter,
                            ipAddress: e.target.value,
                          })
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="saved" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedFilters?.map((filter) => (
                  <Card key={filter.id} className="cyber-card">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium cyber-text-glow">
                          {filter.name}
                        </h4>
                        <Badge
                          variant={filter.isShared ? "secondary" : "outline"}
                        >
                          {filter.isShared ? "Shared" : "Private"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {filter.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">
                          Used {filter.usageCount} times
                        </span>
                        <Button
                          size="sm"
                          className="neon-button"
                          onClick={() => applyFilterMutation.mutate(filter.id)}
                          data-testid={`button-apply-filter-${filter.id}`}
                        >
                          Apply
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-between items-center pt-4 border-t border-border/30">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveFilter({})}
                data-testid="button-clear-filters"
              >
                Clear All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSaveDialog(true)}
                data-testid="button-save-filter"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Filter
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              {Array.isArray(filteredContent) ? filteredContent.length : 0}{" "}
              items match current filters
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Filter Dialog */}
      {showSaveDialog && (
        <Card className="cyber-card">
          <CardHeader>
            <CardTitle>Save Current Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                placeholder="Filter name"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                className="neon-border"
                data-testid="input-filter-name"
              />
              <div className="flex justify-between">
                <div className="flex items-center space-x-2">
                  <Switch id="share-filter" />
                  <Label htmlFor="share-filter">Share with team</Label>
                </div>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowSaveDialog(false)}
                    data-testid="button-cancel-save"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() =>
                      saveFilterMutation.mutate({
                        name: filterName,
                        criteria: activeFilter,
                        isShared: false, // Get from switch
                      })
                    }
                    disabled={!filterName}
                    className="neon-button"
                    data-testid="button-confirm-save"
                  >
                    Save Filter
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
