import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Server,
  CheckCircle,
  XCircle,
  RefreshCw,
  AlertTriangle,
  Info,
  HardDrive,
  Cpu,
  Database,
  Shield,
  Globe,
  FileText,
} from "lucide-react";

interface SystemRequirement {
  name: string;
  required: string;
  current: string;
  status: boolean;
  critical: boolean;
  description?: string;
}

interface SystemHealth {
  phpVersion: SystemRequirement;
  extensions: SystemRequirement[];
  permissions: SystemRequirement[];
  database: SystemRequirement;
  storage: {
    total: number;
    used: number;
    available: number;
    percentage: number;
  };
  memory: {
    limit: string;
    usage: string;
    percentage: number;
  };
  overallScore: number;
  criticalIssues: number;
  warnings: number;
}

interface SystemRequirementsProps {
  onCheck: () => Promise<SystemHealth>;
  onFix?: (requirement: string) => Promise<void>;
  className?: string;
}

export function SystemRequirements({
  onCheck,
  onFix,
  className = "",
}: SystemRequirementsProps) {
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [isFixing, setIsFixing] = useState<string | null>(null);

  const checkSystemHealth = async () => {
    setIsChecking(true);
    try {
      const health = await onCheck();
      setSystemHealth(health);
      setLastChecked(new Date());
    } catch (error) {
      console.error("Failed to check system health:", error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleFix = async (requirement: string) => {
    if (!onFix) return;

    setIsFixing(requirement);
    try {
      await onFix(requirement);
      await checkSystemHealth(); // Recheck after fix attempt
    } catch (error) {
      console.error("Failed to fix requirement:", error);
    } finally {
      setIsFixing(null);
    }
  };

  useEffect(() => {
    // Wrap async function call to avoid unhandled promise rejection
    const initializeSystemCheck = async () => {
      try {
        await checkSystemHealth();
      } catch (error) {
        console.error("Failed to initialize system check:", error);
      }
    };

    initializeSystemCheck();
  }, []);

  const RequirementItem = ({
    requirement,
  }: {
    requirement: SystemRequirement;
  }) => (
    <div className="flex items-center justify-between p-4 rounded-lg border border-muted/20 bg-card/50">
      <div className="flex items-start space-x-3">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center ${
            requirement.status
              ? "bg-green-100 text-green-600"
              : requirement.critical
                ? "bg-red-100 text-red-600"
                : "bg-yellow-100 text-yellow-600"
          }`}
        >
          {requirement.status ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <XCircle className="h-4 w-4" />
          )}
        </div>

        <div className="flex-1">
          <h4 className="font-semibold">{requirement.name}</h4>
          <p className="text-sm text-muted-foreground mb-1">
            Required:{" "}
            <span className="font-medium">{requirement.required}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Current: <span className="font-medium">{requirement.current}</span>
          </p>
          {requirement.description && (
            <p className="text-xs text-muted-foreground mt-1">
              {requirement.description}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {requirement.status ? (
          <Badge className="bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            Passed
          </Badge>
        ) : (
          <>
            <Badge variant={requirement.critical ? "destructive" : "secondary"}>
              <XCircle className="h-3 w-3 mr-1" />
              {requirement.critical ? "Critical" : "Warning"}
            </Badge>

            {onFix && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleFix(requirement.name)}
                disabled={isFixing === requirement.name}
              >
                {isFixing === requirement.name ? (
                  <RefreshCw className="h-3 w-3 animate-spin" />
                ) : (
                  "Fix"
                )}
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center space-x-3">
            <Server className="h-8 w-8 text-primary" />
            <span>System Requirements</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Monitor system health and ensure all requirements are met
          </p>
        </div>

        <Button
          onClick={checkSystemHealth}
          disabled={isChecking}
          className="bg-gradient-to-r from-primary to-purple-600"
          data-testid="check-system-btn"
        >
          {isChecking ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Check System
            </>
          )}
        </Button>
      </div>

      {systemHealth && (
        <>
          {/* Overall Health Score */}
          <Card className="bg-gradient-to-r from-primary/5 to-purple-500/5 border-primary/20">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="relative w-20 h-20 mx-auto mb-3">
                    <div className="absolute inset-0 rounded-full bg-muted/20"></div>
                    <div
                      className={`absolute inset-0 rounded-full ${getScoreBg(systemHealth.overallScore)}`}
                      style={{
                        background: `conic-gradient(${getScoreBg(systemHealth.overallScore).replace("bg-", "rgb(var(--")} ${systemHealth.overallScore}%, transparent ${systemHealth.overallScore}%)`,
                      }}
                    ></div>
                    <div className="absolute inset-2 rounded-full bg-background flex items-center justify-center">
                      <span
                        className={`text-lg font-bold ${getScoreColor(systemHealth.overallScore)}`}
                      >
                        {systemHealth.overallScore}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm font-medium">Health Score</p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <p className="text-2xl font-bold text-red-600">
                    {systemHealth.criticalIssues}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Critical Issues
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Info className="h-6 w-6 text-yellow-600" />
                  </div>
                  <p className="text-2xl font-bold text-yellow-600">
                    {systemHealth.warnings}
                  </p>
                  <p className="text-sm text-muted-foreground">Warnings</p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-blue-600">
                    {systemHealth.extensions.filter((e) => e.status).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Extensions OK</p>
                </div>
              </div>

              {lastChecked && (
                <p className="text-xs text-muted-foreground text-center mt-4">
                  Last checked: {lastChecked.toLocaleString()}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Critical Alerts */}
          {systemHealth.criticalIssues > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>
                  {systemHealth.criticalIssues} critical issue(s) found!
                </strong>
                <br />
                These must be resolved before the system can operate properly.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* PHP Version */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>PHP Version</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RequirementItem requirement={systemHealth.phpVersion} />
              </CardContent>
            </Card>

            {/* Database */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5" />
                  <span>Database</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RequirementItem requirement={systemHealth.database} />
              </CardContent>
            </Card>

            {/* Storage */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <HardDrive className="h-5 w-5" />
                  <span>Storage</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>
                      Used: {(systemHealth.storage.used / 1024 ** 3).toFixed(2)}{" "}
                      GB
                    </span>
                    <span>
                      Available:{" "}
                      {(systemHealth.storage.available / 1024 ** 3).toFixed(2)}{" "}
                      GB
                    </span>
                  </div>
                  <Progress
                    value={systemHealth.storage.percentage}
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {systemHealth.storage.percentage.toFixed(1)}% of{" "}
                    {(systemHealth.storage.total / 1024 ** 3).toFixed(2)} GB
                    used
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* PHP Extensions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>PHP Extensions</span>
                <Badge variant="outline">
                  {systemHealth.extensions.filter((e) => e.status).length} /{" "}
                  {systemHealth.extensions.length} passed
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {systemHealth.extensions.map((extension, index) => (
                  <RequirementItem key={index} requirement={extension} />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* File Permissions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-5 w-5" />
                <span>File Permissions</span>
                <Badge variant="outline">
                  {systemHealth.permissions.filter((p) => p.status).length} /{" "}
                  {systemHealth.permissions.length} passed
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                {systemHealth.permissions.map((permission, index) => (
                  <RequirementItem key={index} requirement={permission} />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Memory Usage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Cpu className="h-5 w-5" />
                <span>Memory Usage</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Used: {systemHealth.memory.usage}</span>
                  <span>Limit: {systemHealth.memory.limit}</span>
                </div>
                <Progress
                  value={systemHealth.memory.percentage}
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {systemHealth.memory.percentage.toFixed(1)}% of available
                  memory used
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {!systemHealth && !isChecking && (
        <Card className="py-12">
          <CardContent className="text-center">
            <Server className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              System Check Required
            </h3>
            <p className="text-muted-foreground mb-6">
              Run a system health check to see the current status of your
              installation
            </p>
            <Button
              onClick={checkSystemHealth}
              className="bg-gradient-to-r from-primary to-purple-600"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Check System Health
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default SystemRequirements;
