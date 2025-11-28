import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertTriangle, FileWarning, Trash2, Download, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// API request helper
function apiRequest<T = any>(url: string, method: string = "GET", data?: any): Promise<T> {
  return fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  }).then((res) => res.json());
}

interface ScanStatistics {
  totalScans: number;
  cleanFiles: number;
  infectedFiles: number;
  suspiciousFiles: number;
  quarantinedFiles: number;
  errorScans: number;
}

interface ScanResult {
  status: "clean" | "infected" | "suspicious" | "quarantined" | "error";
  fileHash: string;
  fileName: string;
  fileSize: number;
  threats: string[];
  scanEngine: string[];
  timestamp: string;
  quarantined: boolean;
  metadata: {
    mimeType?: string;
    fileType?: string;
    uploadedBy?: string;
    ipAddress?: string;
  };
}

interface QuarantinedFile {
  fileName: string;
  filePath: string;
  size: number;
  quarantineDate: string;
  metadata: any;
}

interface ThreatSummary {
  statistics: ScanStatistics;
  recentThreats: {
    count: number;
    items: ScanResult[];
  };
  topThreats: {
    threat: string;
    count: number;
  }[];
  timeline: {
    [key: string]: {
      clean: number;
      infected: number;
      suspicious: number;
    };
  };
}

export default function FileSecurityDashboard() {
  const [statistics, setStatistics] = useState<ScanStatistics | null>(null);
  const [scanLogs, setScanLogs] = useState<ScanResult[]>([]);
  const [quarantinedFiles, setQuarantinedFiles] = useState<QuarantinedFile[]>([]);
  const [threatSummary, setThreatSummary] = useState<ThreatSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("overview");
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [stats, logs, quarantine, summary] = await Promise.all([
        apiRequest<ScanStatistics>("/api/file-security/statistics"),
        apiRequest<{ logs: ScanResult[] }>("/api/file-security/logs?limit=50"),
        apiRequest<{ files: QuarantinedFile[] }>("/api/file-security/quarantine"),
        apiRequest<ThreatSummary>("/api/file-security/threats/summary"),
      ]);

      setStatistics(stats);
      setScanLogs(logs.logs);
      setQuarantinedFiles(quarantine.files);
      setThreatSummary(summary);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load file security dashboard",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteQuarantinedFile = async (fileHash: string, fileName: string) => {
    if (!confirm(`Are you sure you want to permanently delete ${fileName}?`)) {
      return;
    }

    try {
      await apiRequest(`/api/file-security/quarantine/${fileHash}`, {
        method: "DELETE",
      });

      toast({
        title: "Success",
        description: "Quarantined file deleted",
      });

      loadDashboardData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete quarantined file",
        variant: "destructive",
      });
    }
  };

  const exportLogs = async (format: "json" | "csv") => {
    try {
      const response = await fetch(`/api/file-security/export?format=${format}`, {
        credentials: "include",
      });

      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `scan-logs-${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Scan logs exported",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export logs",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: ScanResult["status"]) => {
    const variants: Record<ScanResult["status"], { variant: any; label: string }> = {
      clean: { variant: "default", label: "Clean" },
      infected: { variant: "destructive", label: "Infected" },
      suspicious: { variant: "secondary", label: "Suspicious" },
      quarantined: { variant: "destructive", label: "Quarantined" },
      error: { variant: "secondary", label: "Error" },
    };

    const config = variants[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8" />
            File Security Dashboard
          </h1>
          <p className="text-muted-foreground">
            Monitor virus scans, malware detection, and quarantined files
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadDashboardData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => exportLogs("json")} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export JSON
          </Button>
          <Button onClick={() => exportLogs("csv")} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.totalScans}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clean Files</CardTitle>
              <Shield className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{statistics.cleanFiles}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Infected</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{statistics.infectedFiles}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Suspicious</CardTitle>
              <FileWarning className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">{statistics.suspiciousFiles}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quarantined</CardTitle>
              <Trash2 className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{statistics.quarantinedFiles}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Errors</CardTitle>
              <AlertTriangle className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-500">{statistics.errorScans}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="logs">Scan Logs</TabsTrigger>
          <TabsTrigger value="quarantine">Quarantine</TabsTrigger>
          <TabsTrigger value="threats">Threats</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {threatSummary && (
            <>
              {/* Recent Threats Alert */}
              {threatSummary.recentThreats.count > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>{threatSummary.recentThreats.count} threats</strong> detected in the last 24 hours
                  </AlertDescription>
                </Alert>
              )}

              {/* Timeline Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Scan Activity (Last 7 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(threatSummary.timeline).map(([date, counts]) => (
                      <div key={date} className="flex items-center gap-4">
                        <span className="text-sm font-medium w-24">{date}</span>
                        <div className="flex-1 flex gap-1">
                          <div
                            className="bg-green-500 h-6"
                            style={{ width: `${(counts.clean / (counts.clean + counts.infected + counts.suspicious)) * 100}%` }}
                            title={`${counts.clean} clean`}
                          />
                          <div
                            className="bg-red-500 h-6"
                            style={{ width: `${(counts.infected / (counts.clean + counts.infected + counts.suspicious)) * 100}%` }}
                            title={`${counts.infected} infected`}
                          />
                          <div
                            className="bg-yellow-500 h-6"
                            style={{ width: `${(counts.suspicious / (counts.clean + counts.infected + counts.suspicious)) * 100}%` }}
                            title={`${counts.suspicious} suspicious`}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-32">
                          {counts.clean + counts.infected + counts.suspicious} scans
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Threats */}
              {threatSummary.topThreats.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Top Threats</CardTitle>
                    <CardDescription>Most frequently detected threats</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {threatSummary.topThreats.map((threat, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm">{threat.threat}</span>
                          <Badge variant="destructive">{threat.count}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Scan Logs</CardTitle>
              <CardDescription>Last 50 file scans</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {scanLogs.map((log, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{log.fileName}</span>
                          {getStatusBadge(log.status)}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {formatBytes(log.fileSize)} • {log.metadata.fileType} • {formatDate(log.timestamp)}
                        </div>
                        {log.metadata.uploadedBy && (
                          <div className="text-sm text-muted-foreground">
                            Uploaded by: {log.metadata.uploadedBy} from {log.metadata.ipAddress}
                          </div>
                        )}
                        {log.scanEngine.length > 0 && (
                          <div className="text-sm text-muted-foreground">
                            Scan engines: {log.scanEngine.join(", ")}
                          </div>
                        )}
                        {log.threats.length > 0 && (
                          <div className="mt-2">
                            <div className="text-sm font-medium text-red-500">Threats:</div>
                            <ul className="list-disc list-inside text-sm text-red-500">
                              {log.threats.map((threat, i) => (
                                <li key={i}>{threat}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quarantine" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quarantined Files</CardTitle>
              <CardDescription>
                {quarantinedFiles.length} file(s) in quarantine
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {quarantinedFiles.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No files in quarantine
                  </div>
                ) : (
                  quarantinedFiles.map((file, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium">{file.fileName}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatBytes(file.size)} • Quarantined: {formatDate(file.quarantineDate)}
                          </div>
                          {file.metadata.fileHash && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Hash: {file.metadata.fileHash}
                            </div>
                          )}
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteQuarantinedFile(file.metadata.fileHash, file.fileName)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="threats" className="space-y-4">
          {threatSummary && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Threats (Last 24 Hours)</CardTitle>
                <CardDescription>{threatSummary.recentThreats.count} threats detected</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {threatSummary.recentThreats.items.map((threat, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{threat.fileName}</span>
                            {getStatusBadge(threat.status)}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {formatDate(threat.timestamp)}
                          </div>
                          {threat.threats.length > 0 && (
                            <div className="mt-2">
                              <ul className="list-disc list-inside text-sm text-red-500">
                                {threat.threats.map((t, i) => (
                                  <li key={i}>{t}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
