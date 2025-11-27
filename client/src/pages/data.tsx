import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { TutorialBot } from "@/components/TutorialBot";
import {
  Database,
  HardDrive,
  RefreshCw,
  Download,
  Upload,
  Trash2,
  Archive,
  Shield,
  BarChart3,
  Activity,
} from "lucide-react";

export default function DataPage() {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const { toast } = useToast();

  // Mock database metrics - in production this would come from actual database monitoring
  const databaseMetrics = {
    totalSize: "847.3 GB",
    usage: 78.2,
    connections: 142,
    queries: 15847432,
    performance: "Optimal",
    tables: [
      {
        name: "content_items",
        size: "234.5 GB",
        rows: 3456789,
        performance: 95,
      },
      {
        name: "moderation_results",
        size: "189.2 GB",
        rows: 2847329,
        performance: 92,
      },
      {
        name: "user_sessions",
        size: "145.8 GB",
        rows: 1923847,
        performance: 88,
      },
      { name: "audit_logs", size: "127.4 GB", rows: 1547893, performance: 94 },
      { name: "live_streams", size: "89.7 GB", rows: 847392, performance: 96 },
    ],
    recentOperations: [
      {
        id: "op-001",
        type: "Backup",
        status: "Completed",
        timestamp: "2025-08-29T18:00:00Z",
        duration: "45 minutes",
        size: "847.3 GB",
      },
      {
        id: "op-002",
        type: "Index Optimization",
        status: "Running",
        timestamp: "2025-08-29T17:30:00Z",
        duration: "12 minutes",
        progress: 67,
      },
      {
        id: "op-003",
        type: "Data Migration",
        status: "Completed",
        timestamp: "2025-08-29T16:15:00Z",
        duration: "2 hours 15 minutes",
        size: "156.2 GB",
      },
    ],
  };

  const runOptimization = async () => {
    setIsOptimizing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      toast({
        title: "Database Optimization Complete",
        description: "Database performance optimized, queries 15% faster",
      });
    } catch (error) {
      toast({
        title: "Optimization Failed",
        description: "Unable to complete database optimization",
        variant: "destructive",
      });
    }
    setIsOptimizing(false);
  };

  const handleBackup = async () => {
    toast({
      title: "Backup Started",
      description: "Database backup in progress...",
    });
    try {
      // Simulate backup operation
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast({
        title: "Backup Complete",
        description: "Database backup created successfully",
      });
    } catch (error) {
      toast({
        title: "Backup Failed",
        description: "Unable to complete database backup",
        variant: "destructive",
      });
    }
  };

  const handleRestore = async () => {
    toast({
      title: "Restore Started",
      description: "Restoring database from latest backup...",
    });
    try {
      // Simulate restore operation
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast({
        title: "Restore Complete",
        description: "Database restored successfully",
      });
    } catch (error) {
      toast({
        title: "Restore Failed",
        description: "Unable to restore database",
        variant: "destructive",
      });
    }
  };

  const handleExport = async () => {
    toast({
      title: "Export Started",
      description: "Exporting database data...",
    });
    try {
      // Simulate export operation
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast({
        title: "Export Complete",
        description: "Database data exported successfully",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Unable to export database data",
        variant: "destructive",
      });
    }
  };

  const handleCleanup = async () => {
    toast({
      title: "Cleanup Started",
      description: "Removing old data and optimizing storage...",
    });
    try {
      // Simulate cleanup operation
      await new Promise((resolve) => setTimeout(resolve, 2500));
      toast({
        title: "Cleanup Complete",
        description: "Old data removed, storage optimized",
      });
    } catch (error) {
      toast({
        title: "Cleanup Failed",
        description: "Unable to complete data cleanup",
        variant: "destructive",
      });
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return "text-green-400";
    if (score >= 80) return "text-yellow-400";
    if (score >= 70) return "text-orange-400";
    return "text-red-400";
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "text-green-400 bg-green-500/20";
      case "running":
        return "text-blue-400 bg-blue-500/20";
      case "failed":
        return "text-red-400 bg-red-500/20";
      default:
        return "text-gray-400 bg-gray-500/20";
    }
  };

  return (
    <div className="min-h-screen cyber-bg">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold cyber-text-glow">
              Data Management
            </h1>
            <p className="text-muted-foreground">
              Database Operations & Performance Monitoring
            </p>
          </div>
          <Button
            onClick={runOptimization}
            disabled={isOptimizing}
            className="neon-button"
            data-testid="optimize-db-button"
          >
            {isOptimizing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Optimizing...
              </>
            ) : (
              <>
                <Database className="w-4 h-4 mr-2" />
                Optimize Database
              </>
            )}
          </Button>
        </div>

        {/* Database Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="cyber-card bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30">
            <CardContent className="p-4 text-center">
              <HardDrive className="w-8 h-8 mx-auto mb-2 text-blue-400" />
              <div className="text-2xl font-bold text-blue-400">
                {databaseMetrics.totalSize}
              </div>
              <div className="text-xs text-muted-foreground">Total Size</div>
            </CardContent>
          </Card>

          <Card className="cyber-card bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30">
            <CardContent className="p-4 text-center">
              <Activity className="w-8 h-8 mx-auto mb-2 text-green-400" />
              <div className="text-2xl font-bold text-green-400">
                {databaseMetrics.connections}
              </div>
              <div className="text-xs text-muted-foreground">
                Active Connections
              </div>
            </CardContent>
          </Card>

          <Card className="cyber-card bg-gradient-to-r from-purple-500/10 to-violet-500/10 border border-purple-500/30">
            <CardContent className="p-4 text-center">
              <BarChart3 className="w-8 h-8 mx-auto mb-2 text-purple-400" />
              <div className="text-2xl font-bold text-purple-400">
                {databaseMetrics.queries.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">Total Queries</div>
            </CardContent>
          </Card>

          <Card className="cyber-card bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30">
            <CardContent className="p-4 text-center">
              <Shield className="w-8 h-8 mx-auto mb-2 text-orange-400" />
              <div className="text-2xl font-bold text-orange-400">
                {databaseMetrics.performance}
              </div>
              <div className="text-xs text-muted-foreground">Performance</div>
            </CardContent>
          </Card>
        </div>

        {/* Database Usage */}
        <Card className="cyber-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <HardDrive className="w-6 h-6 text-primary" />
              <span>Storage Utilization</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Database Usage</span>
                <span className="font-bold text-primary">
                  {databaseMetrics.usage}%
                </span>
              </div>
              <Progress value={databaseMetrics.usage} className="h-4" />
              <div className="text-sm text-muted-foreground">
                {databaseMetrics.usage > 80
                  ? "High usage detected. Consider archiving old data."
                  : "Storage usage is within normal parameters."}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table Statistics */}
        <Card className="cyber-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="w-6 h-6 text-primary" />
              <span className="cyber-text-glow">DATABASE TABLES</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {databaseMetrics.tables.map((table) => (
                <div
                  key={table.name}
                  className="p-4 cyber-card border border-primary/20"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="font-medium text-lg">{table.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {table.rows.toLocaleString()} rows • {table.size}
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-lg font-bold ${getPerformanceColor(table.performance)}`}
                      >
                        {table.performance}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Performance
                      </div>
                    </div>
                  </div>
                  <Progress value={table.performance} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Operations */}
        <Card className="cyber-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <RefreshCw className="w-6 h-6 text-green-400" />
              <span>Recent Operations</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {databaseMetrics.recentOperations.map((operation) => (
                <div
                  key={operation.id}
                  className="flex items-center justify-between p-4 cyber-card border border-primary/20"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      {operation.type === "Backup" && (
                        <Archive className="w-5 h-5 text-blue-400" />
                      )}
                      {operation.type === "Index Optimization" && (
                        <RefreshCw className="w-5 h-5 text-green-400" />
                      )}
                      {operation.type === "Data Migration" && (
                        <Database className="w-5 h-5 text-purple-400" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{operation.type}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(operation.timestamp).toLocaleString()} •{" "}
                        {operation.duration}
                        {operation.size && ` • ${operation.size}`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(operation.status)}>
                      {operation.status}
                    </Badge>
                    {operation.progress && (
                      <div className="w-24">
                        <Progress value={operation.progress} className="h-2" />
                        <div className="text-xs text-muted-foreground text-center mt-1">
                          {operation.progress}%
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Data Operations */}
        <Card className="cyber-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-6 h-6 text-primary" />
              <span>Data Operations</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="h-16 flex-col hover:bg-blue-400/10"
                data-testid="backup-button"
                onClick={handleBackup}
              >
                <Archive className="w-6 h-6 mb-2 text-blue-400" />
                <span>Create Backup</span>
              </Button>

              <Button
                variant="outline"
                className="h-16 flex-col hover:bg-green-400/10"
                data-testid="restore-button"
                onClick={handleRestore}
              >
                <Upload className="w-6 h-6 mb-2 text-green-400" />
                <span>Restore Data</span>
              </Button>

              <Button
                variant="outline"
                className="h-16 flex-col hover:bg-purple-400/10"
                data-testid="export-button"
                onClick={handleExport}
              >
                <Download className="w-6 h-6 mb-2 text-purple-400" />
                <span>Export Data</span>
              </Button>

              <Button
                variant="outline"
                className="h-16 flex-col hover:bg-orange-400/10"
                data-testid="cleanup-button"
                onClick={handleCleanup}
              >
                <Trash2 className="w-6 h-6 mb-2 text-orange-400" />
                <span>Cleanup Old Data</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tutorial Bot */}
      <TutorialBot
        pageName="Data Operations"
        pageContext="Database management, backup, restore, and optimization"
        isFloating={true}
      />
    </div>
  );
}
