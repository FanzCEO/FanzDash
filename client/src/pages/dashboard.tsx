import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Sidebar } from "@/components/Sidebar";
import { LiveStreamPanel } from "@/components/LiveStreamPanel";
import { ReviewQueue } from "@/components/ReviewQueue";
import { AnalysisTools } from "@/components/AnalysisTools";
import { ModerationSettings } from "@/components/ModerationSettings";
import { useWebSocket } from "@/hooks/useWebSocket";
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
      icon: "fas fa-eye",
      color: "text-primary",
      change: "↗ 12%",
      changeColor: "text-green-600"
    },
    {
      title: "Auto-Blocked",
      value: stats?.autoBlocked || 0,
      icon: "fas fa-ban",
      color: "text-red-500",
      change: "↗ 8%",
      changeColor: "text-red-600"
    },
    {
      title: "Pending Review",
      value: stats?.pendingReview || 0,
      icon: "fas fa-hourglass-half",
      color: "text-yellow-500",
      change: "Priority Queue",
      changeColor: "text-yellow-600"
    },
    {
      title: "Live Streams",
      value: stats?.liveStreams || 0,
      icon: "fas fa-video",
      color: "text-primary",
      change: "All monitored",
      changeColor: "text-green-600"
    }
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Top Navigation */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow border-b border-gray-200">
          <div className="flex-1 px-4 flex justify-between items-center">
            <div className="flex-1 flex">
              <h2 className="text-lg font-semibold text-gray-900">Content Moderation Dashboard</h2>
            </div>
            <div className="ml-4 flex items-center md:ml-6 space-x-4">
              {/* Notification Bell */}
              <button className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary relative">
                <i className="fas fa-bell h-6 w-6"></i>
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
              </button>
              
              {/* Status Indicator */}
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-600">
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
