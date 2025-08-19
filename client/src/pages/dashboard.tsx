import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sidebar } from "@/components/Sidebar";
import { LiveStreamPanel } from "@/components/LiveStreamPanel";
import { ReviewQueue } from "@/components/ReviewQueue";
import { AnalysisTools } from "@/components/AnalysisTools";
import { ModerationSettings } from "@/components/ModerationSettings";
import { useWebSocket } from "@/hooks/useWebSocket";
import { Shield, Eye, Ban, Clock, Video, Activity, Zap, AlertTriangle } from "lucide-react";
import type { DashboardStats } from "@/types/moderation";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { isConnected } = useWebSocket("");

  const statCards = [
    {
      title: "Items Reviewed Today",
      value: stats?.reviewedToday || 0,
      icon: Eye,
      color: "text-secondary",
      change: "↗ 12%",
      changeColor: "text-acid-green"
    },
    {
      title: "Auto-Blocked",
      value: stats?.autoBlocked || 0,
      icon: Ban,
      color: "text-destructive",
      change: "↗ 8%",
      changeColor: "text-destructive"
    },
    {
      title: "Pending Review",
      value: stats?.pendingReview || 0,
      icon: Clock,
      color: "text-accent",
      change: "Priority Queue",
      changeColor: "text-accent"
    },
    {
      title: "Live Streams",
      value: stats?.liveStreams || 0,
      icon: Video,
      color: "text-primary",
      change: "All monitored",
      changeColor: "text-secondary"
    }
  ];

  return (
    <div className="flex h-screen overflow-hidden cyber-gradient">
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Top Navigation */}
        <div className="relative z-10 flex-shrink-0 flex h-16 cyber-card border-b border-border/30 scan-effect">
          <div className="flex-1 px-6 flex justify-between items-center">
            <div className="flex-1 flex items-center">
              <Shield className="w-6 h-6 text-primary mr-3 cyber-pulse" />
              <h2 className="text-xl font-bold text-foreground cyber-text-glow">
                FANZMOD <span className="text-secondary neon-text">CONTROL CENTER</span>
              </h2>
            </div>
            <div className="ml-4 flex items-center md:ml-6 space-x-6">
              {/* Notification Bell */}
              <button className="relative p-2 rounded-lg glass-effect border border-primary/30 text-primary hover:bg-primary/10 transition-all duration-300 neon-button" data-testid="button-notifications">
                <Activity className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full cyber-pulse"></span>
              </button>
              
              {/* Status Indicator */}
              <div className="flex items-center space-x-3 glass-effect px-3 py-1 rounded-lg border border-secondary/30">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-secondary cyber-pulse' : 'bg-destructive'}`}></div>
                <span className="text-sm text-foreground font-medium">
                  {isConnected ? 'System Online' : 'System Offline'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Dashboard Content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {statCards.map((stat, index) => (
                  <Card key={index} data-testid={`stat-card-${index}`}>
                    <CardContent className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <i className={`${stat.icon} ${stat.color} text-2xl`}></i>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">{stat.title}</dt>
                            <dd className="text-lg font-medium text-gray-900" data-testid={`stat-value-${index}`}>
                              {statsLoading ? "..." : stat.value.toLocaleString()}
                            </dd>
                          </dl>
                        </div>
                      </div>
                      <div className="bg-gray-50 px-0 py-3 mt-3">
                        <div className="text-sm">
                          <span className={`font-medium ${stat.changeColor}`}>{stat.change}</span>
                          {stat.change.includes('%') && (
                            <span className="text-gray-600 ml-1">vs yesterday</span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Live Stream Monitoring */}
                <div className="xl:col-span-2">
                  <LiveStreamPanel />
                </div>

                {/* Review Queue */}
                <div>
                  <ReviewQueue />
                </div>
              </div>

              {/* Content Analysis Tools */}
              <div className="mt-8">
                <AnalysisTools />
              </div>

              {/* Moderation Settings */}
              <div className="mt-8">
                <ModerationSettings />
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
