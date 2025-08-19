import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  Zap, 
  AlertTriangle, 
  Eye, 
  Brain, 
  Target, 
  Activity, 
  Database, 
  Terminal, 
  Cpu, 
  Network, 
  Radar,
  Lock,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  Layers
} from "lucide-react";

interface DashboardStats {
  totalContent: number;
  pendingReview: number;
  autoBlocked: number;
  reviewedToday: number;
  riskScore: number;
  accuracy: number;
  vaultedItems: number;
  activeStreams: number;
}

export function FuturisticDashboard() {
  const [realTimeData, setRealTimeData] = useState<any[]>([]);

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
    refetchInterval: 5000, // Real-time updates
  });

  const { data: threatLevel } = useQuery({
    queryKey: ["/api/threat-level"],
    refetchInterval: 2000,
  });

  // Simulate real-time data stream
  useEffect(() => {
    const interval = setInterval(() => {
      const newData = {
        timestamp: new Date().toISOString(),
        event: Math.random() > 0.5 ? "CONTENT_ANALYZED" : "THREAT_DETECTED",
        severity: Math.random() > 0.7 ? "HIGH" : "MEDIUM",
        id: Math.random().toString(36).substr(2, 9)
      };
      setRealTimeData(prev => [...prev.slice(-19), newData]);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background neural-network">
      {/* Quantum Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary/20 via-secondary/10 to-accent/20 border-b border-primary/30">
        <div className="absolute inset-0 matrix-rain opacity-30"></div>
        <div className="relative z-10 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold cyber-text-glow mb-2">
                  FANZMOD CONTROL CENTER
                </h1>
                <div className="text-muted-foreground text-lg">
                  Neural Network Moderation System • Real-time Threat Detection
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <div className="text-right">
                  <div className="text-sm text-muted-foreground uppercase tracking-wider">System Status</div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-secondary rounded-full cyber-pulse"></div>
                    <span className="text-secondary font-semibold">OPERATIONAL</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground uppercase tracking-wider">Threat Level</div>
                  <div className="text-2xl font-bold text-accent cyber-text-glow">
                    {(threatLevel as any)?.level || "MEDIUM"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Command Center Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "Neural Processing",
              value: stats?.totalContent || 0,
              change: "+12.5%",
              icon: Brain,
              color: "text-primary",
              trend: "up"
            },
            {
              title: "Threat Detection",
              value: stats?.autoBlocked || 0,
              change: "-8.3%",
              icon: Shield,
              color: "text-destructive", 
              trend: "down"
            },
            {
              title: "Active Surveillance",
              value: stats?.activeStreams || 0,
              change: "+23.1%",
              icon: Eye,
              color: "text-secondary",
              trend: "up"
            },
            {
              title: "Vault Security",
              value: stats?.vaultedItems || 0,
              change: "+5.7%",
              icon: Lock,
              color: "text-accent",
              trend: "up"
            }
          ].map((metric, index) => {
            const IconComponent = metric.icon;
            const TrendIcon = metric.trend === "up" ? TrendingUp : TrendingDown;
            
            return (
              <Card key={index} className="cyber-card hologram-effect neural-network">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl glass-effect border border-primary/30">
                      <IconComponent className={`w-8 h-8 ${metric.color} cyber-pulse`} />
                    </div>
                    <Badge variant="outline" className="neon-text">
                      <TrendIcon className="w-3 h-3 mr-1" />
                      {metric.change}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {metric.title}
                    </div>
                    <div className="text-3xl font-bold cyber-text-glow">
                      {statsLoading ? (
                        <div className="h-8 w-20 bg-muted/20 rounded animate-pulse"></div>
                      ) : (
                        metric.value.toLocaleString()
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border/30">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Real-time</span>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-secondary rounded-full cyber-pulse"></div>
                        <span className="text-secondary font-mono">LIVE</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Advanced System Monitoring */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AI Processing Power */}
          <Card className="cyber-card neural-network col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-primary/20 border border-primary/50">
                  <Cpu className="w-6 h-6 text-primary cyber-pulse" />
                </div>
                <div>
                  <span className="cyber-text-glow">AI PROCESSING MATRIX</span>
                  <div className="text-sm text-muted-foreground font-normal">Neural network performance metrics</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Model Accuracy</span>
                    <span className="text-sm font-mono text-secondary">{stats?.accuracy || 94.7}%</span>
                  </div>
                  <Progress 
                    value={stats?.accuracy || 94.7} 
                    className="h-2 bg-muted/30"
                  />
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Processing Speed</span>
                    <span className="text-sm font-mono text-accent">2.3ms</span>
                  </div>
                  <Progress 
                    value={87} 
                    className="h-2 bg-muted/30"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Memory Usage</span>
                    <span className="text-sm font-mono text-primary">68.2%</span>
                  </div>
                  <Progress 
                    value={68.2} 
                    className="h-2 bg-muted/30"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">GPU Utilization</span>
                    <span className="text-sm font-mono text-destructive">91.5%</span>
                  </div>
                  <Progress 
                    value={91.5} 
                    className="h-2 bg-muted/30"
                  />
                </div>
              </div>

              <div className="border-t border-border/30 pt-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary cyber-text-glow">1.2M</div>
                    <div className="text-xs text-muted-foreground">Items/Hour</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-secondary cyber-text-glow">847</div>
                    <div className="text-xs text-muted-foreground">Active Threads</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-accent cyber-text-glow">32</div>
                    <div className="text-xs text-muted-foreground">GPU Cores</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Real-time Activity Feed */}
          <Card className="cyber-card matrix-rain">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-secondary cyber-pulse" />
                  <span>LIVE FEED</span>
                </div>
                <Badge variant="secondary" className="font-mono">
                  STREAMING
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 font-mono text-xs max-h-64 overflow-y-auto">
                {realTimeData.map((item, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between py-1 border-b border-border/20"
                  >
                    <span className="text-muted-foreground">
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </span>
                    <span className={`text-${item.severity === 'HIGH' ? 'destructive' : 'accent'}`}>
                      {item.event}
                    </span>
                    <span className="text-secondary">{item.id}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Health Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* System Health */}
          <Card className="cyber-card neural-network">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Network className="w-5 h-5 text-primary" />
                <span>SYSTEM HEALTH</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "API Response", value: "12ms", status: "optimal" },
                  { label: "Database Load", value: "34%", status: "good" },
                  { label: "Cache Hit Rate", value: "98.7%", status: "excellent" },
                  { label: "Error Rate", value: "0.02%", status: "minimal" }
                ].map((metric, i) => (
                  <div key={i} className="text-center p-3 rounded-lg glass-effect">
                    <div className="text-sm text-muted-foreground">{metric.label}</div>
                    <div className="text-xl font-bold cyber-text-glow">{metric.value}</div>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        metric.status === 'excellent' ? 'border-secondary text-secondary' :
                        metric.status === 'optimal' ? 'border-primary text-primary' :
                        metric.status === 'good' ? 'border-accent text-accent' :
                        'border-muted text-muted-foreground'
                      }`}
                    >
                      {metric.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Threat Analysis */}
          <Card className="cyber-card hologram-effect">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-destructive cyber-pulse" />
                <span>THREAT ANALYSIS</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { type: "CSAM Detection", count: 12, severity: "critical" },
                  { type: "Hate Speech", count: 34, severity: "high" },
                  { type: "Spam Content", count: 156, severity: "medium" },
                  { type: "Policy Violation", count: 89, severity: "low" }
                ].map((threat, i) => (
                  <div key={i} className="flex items-center justify-between py-2">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        threat.severity === 'critical' ? 'bg-destructive' :
                        threat.severity === 'high' ? 'bg-accent' :
                        threat.severity === 'medium' ? 'bg-primary' :
                        'bg-muted-foreground'
                      } cyber-pulse`}></div>
                      <span className="font-medium">{threat.type}</span>
                    </div>
                    <Badge variant="outline" className="font-mono">
                      {threat.count}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}