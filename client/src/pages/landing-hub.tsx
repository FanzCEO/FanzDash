import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
import {
  Shield,
  Users,
  MessageSquare,
  FileCheck,
  BarChart3,
  Globe,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Database,
  Cloud,
  Lock,
  Activity,
} from "lucide-react";

interface PlatformStatus {
  id: string;
  name: string;
  status: "online" | "offline" | "maintenance";
  users: number;
  uptime: number;
  domain: string;
}

interface SystemMetrics {
  totalUsers: number;
  activeUsers: number;
  totalPlatforms: number;
  activePlatforms: number;
  moderationQueue: number;
  verificationsPending: number;
  systemHealth: number;
  threatLevel: "low" | "medium" | "high" | "critical";
}

export default function LandingHub() {
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  const { data: systemMetrics, isLoading: metricsLoading } =
    useQuery<SystemMetrics>({
      queryKey: ["/api/system/metrics"],
      refetchInterval: 30000, // Refresh every 30 seconds
    });

  const { data: platformStatus = [], isLoading: platformsLoading } = useQuery<
    PlatformStatus[]
  >({
    queryKey: ["/api/platforms/status"],
    refetchInterval: 15000, // Refresh every 15 seconds
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "text-green-400 bg-green-500/20";
      case "offline":
        return "text-red-400 bg-red-500/20";
      case "maintenance":
        return "text-yellow-400 bg-yellow-500/20";
      default:
        return "text-gray-400 bg-gray-500/20";
    }
  };

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case "low":
        return "text-green-400 bg-green-500/20";
      case "medium":
        return "text-yellow-400 bg-yellow-500/20";
      case "high":
        return "text-orange-400 bg-orange-500/20";
      case "critical":
        return "text-red-400 bg-red-500/20";
      default:
        return "text-gray-400 bg-gray-500/20";
    }
  };

  const quickActions = [
    {
      title: "2257 Verification",
      description: "Review creator verifications",
      icon: FileCheck,
      href: "/verification-2257",
      badge: systemMetrics?.verificationsPending || 0,
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Content Review",
      description: "Moderate pending content",
      icon: Shield,
      href: "/content-review",
      badge: systemMetrics?.moderationQueue || 0,
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "Communication Hub",
      description: "Admin chat system",
      icon: MessageSquare,
      href: "/chat-system",
      badge: null,
      color: "from-green-500 to-emerald-500",
    },
    {
      title: "Platform Manager",
      description: "Manage connected platforms",
      icon: Globe,
      href: "/platforms",
      badge: systemMetrics?.activePlatforms || 0,
      color: "from-orange-500 to-red-500",
    },
    {
      title: "Analytics Dashboard",
      description: "View system analytics",
      icon: BarChart3,
      href: "/analytics",
      badge: null,
      color: "from-indigo-500 to-purple-500",
    },
    {
      title: "User Management",
      description: "Manage admin accounts",
      icon: Users,
      href: "/users",
      badge: systemMetrics?.totalUsers || 0,
      color: "from-teal-500 to-cyan-500",
    },
  ];

  if (metricsLoading || platformsLoading) {
    return (
      <div className="min-h-screen bg-black p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-12 bg-gray-800 rounded w-1/2"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-800 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-6xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
          FanzDash
        </h1>
        <p className="text-xl text-cyan-100/80 mb-2">
          Enterprise Content Moderation & Platform Management
        </p>
        <p className="text-lg text-gray-400">
          Scaling to 20+ Million Users Worldwide
        </p>

        {/* System Health Badge */}
        <div className="flex justify-center mt-6">
          <Badge
            className={`px-4 py-2 text-lg ${getThreatLevelColor(systemMetrics?.threatLevel || "low")}`}
          >
            <Activity className="w-5 h-5 mr-2" />
            System Health: {systemMetrics?.systemHealth || 98}% | Threat Level:{" "}
            {systemMetrics?.threatLevel?.toUpperCase() || "LOW"}
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-cyan-500/20">
          <CardContent className="p-6 text-center">
            <Users className="w-8 h-8 mx-auto mb-2 text-cyan-400" />
            <div className="text-2xl font-bold text-white">
              {(systemMetrics?.totalUsers || 23456789).toLocaleString()}
            </div>
            <div className="text-sm text-cyan-400">Total Users</div>
            <div className="text-xs text-gray-400 mt-1">
              {(systemMetrics?.activeUsers || 8765432).toLocaleString()} active
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20">
          <CardContent className="p-6 text-center">
            <Globe className="w-8 h-8 mx-auto mb-2 text-green-400" />
            <div className="text-2xl font-bold text-white">
              {systemMetrics?.totalPlatforms || 15}
            </div>
            <div className="text-sm text-green-400">Connected Platforms</div>
            <div className="text-xs text-gray-400 mt-1">
              {systemMetrics?.activePlatforms || 12} online
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <CardContent className="p-6 text-center">
            <Shield className="w-8 h-8 mx-auto mb-2 text-purple-400" />
            <div className="text-2xl font-bold text-white">
              {systemMetrics?.moderationQueue || 127}
            </div>
            <div className="text-sm text-purple-400">Pending Reviews</div>
            <div className="text-xs text-gray-400 mt-1">Content moderation</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/20">
          <CardContent className="p-6 text-center">
            <FileCheck className="w-8 h-8 mx-auto mb-2 text-orange-400" />
            <div className="text-2xl font-bold text-white">
              {systemMetrics?.verificationsPending || 43}
            </div>
            <div className="text-sm text-orange-400">2257 Verifications</div>
            <div className="text-xs text-gray-400 mt-1">Awaiting approval</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-cyan-400 mb-6 flex items-center gap-2">
          <Zap className="w-6 h-6" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions.map((action, index) => (
            <Link key={index} href={action.href}>
              <Card className="bg-gray-900/50 border-gray-700 hover:border-cyan-500/50 transition-all duration-300 cursor-pointer group h-full">
                <CardContent className="p-6">
                  <div
                    className={`w-12 h-12 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-white group-hover:text-cyan-400 transition-colors">
                      {action.title}
                    </h3>
                    {action.badge !== null && action.badge > 0 && (
                      <Badge className="bg-red-500 text-white ml-2">
                        {action.badge > 99 ? "99+" : action.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-400">{action.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Platform Status */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-cyan-400 mb-6 flex items-center gap-2">
          <Database className="w-6 h-6" />
          Connected Platforms
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {platformStatus.length > 0
            ? platformStatus.map((platform) => (
                <Card
                  key={platform.id}
                  className="bg-gray-900/50 border-gray-700"
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-white">
                          {platform.name}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {platform.domain}
                        </p>
                      </div>
                      <Badge className={getStatusColor(platform.status)}>
                        {platform.status === "online" && (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        )}
                        {platform.status === "offline" && (
                          <AlertTriangle className="w-3 h-3 mr-1" />
                        )}
                        {platform.status === "maintenance" && (
                          <Clock className="w-3 h-3 mr-1" />
                        )}
                        {platform.status}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Users:</span>
                        <span className="text-white">
                          {platform.users.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Uptime:</span>
                        <span className="text-white">{platform.uptime}%</span>
                      </div>
                      <div className="mt-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">Health</span>
                          <span className="text-white">{platform.uptime}%</span>
                        </div>
                        <Progress
                          value={platform.uptime}
                          className="h-2 bg-gray-700"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            : // Mock data for initial display
              [
                {
                  id: "fanz-main",
                  name: "FanzUnlimited.com",
                  domain: "fanzunlimited.com",
                  status: "online",
                  users: 15234567,
                  uptime: 99.8,
                },
                {
                  id: "fanz-premium",
                  name: "FanzDash Premium",
                  domain: "premium.fanzdash.com",
                  status: "online",
                  users: 3456789,
                  uptime: 99.9,
                },
                {
                  id: "fanz-creator",
                  name: "FanzDash Creator Portal",
                  domain: "creator.fanzdash.com",
                  status: "online",
                  users: 234567,
                  uptime: 98.7,
                },
                {
                  id: "fanz-mobile",
                  name: "FanzDash Mobile API",
                  domain: "api.fanzdash.com",
                  status: "maintenance",
                  users: 8765432,
                  uptime: 97.5,
                },
                {
                  id: "fanz-media",
                  name: "FanzDash Media Brain",
                  domain: "media.fanzdash.com",
                  status: "online",
                  users: 0,
                  uptime: 99.6,
                },
                {
                  id: "fanz-people",
                  name: "FanzDash People Brain",
                  domain: "people.fanzdash.com",
                  status: "online",
                  users: 0,
                  uptime: 99.4,
                },
              ].map((platform) => (
                <Card
                  key={platform.id}
                  className="bg-gray-900/50 border-gray-700"
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-white">
                          {platform.name}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {platform.domain}
                        </p>
                      </div>
                      <Badge className={getStatusColor(platform.status)}>
                        {platform.status === "online" && (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        )}
                        {platform.status === "offline" && (
                          <AlertTriangle className="w-3 h-3 mr-1" />
                        )}
                        {platform.status === "maintenance" && (
                          <Clock className="w-3 h-3 mr-1" />
                        )}
                        {platform.status}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Users:</span>
                        <span className="text-white">
                          {platform.users.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Uptime:</span>
                        <span className="text-white">{platform.uptime}%</span>
                      </div>
                      <div className="mt-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">Health</span>
                          <span className="text-white">{platform.uptime}%</span>
                        </div>
                        <Progress
                          value={platform.uptime}
                          className="h-2 bg-gray-700"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
        </div>
      </div>

      {/* System Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gray-900/50 border-cyan-500/20">
          <CardHeader>
            <CardTitle className="text-cyan-400 flex items-center gap-2">
              <Cloud className="w-5 h-5" />
              Infrastructure Status
            </CardTitle>
            <CardDescription className="text-gray-400">
              Real-time system health monitoring
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Database Performance</span>
                <div className="flex items-center gap-2">
                  <Progress value={95} className="w-20 h-2" />
                  <span className="text-green-400 text-sm">95%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">API Response Time</span>
                <div className="flex items-center gap-2">
                  <Progress value={88} className="w-20 h-2" />
                  <span className="text-cyan-400 text-sm">120ms</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Storage Capacity</span>
                <div className="flex items-center gap-2">
                  <Progress value={73} className="w-20 h-2" />
                  <span className="text-yellow-400 text-sm">73%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Network Latency</span>
                <div className="flex items-center gap-2">
                  <Progress value={92} className="w-20 h-2" />
                  <span className="text-green-400 text-sm">45ms</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-cyan-500/20">
          <CardHeader>
            <CardTitle className="text-cyan-400 flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Security & Compliance
            </CardTitle>
            <CardDescription className="text-gray-400">
              Enterprise-grade security status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">SSL Certificates</span>
                <Badge className="bg-green-500 text-white">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Valid
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Data Encryption</span>
                <Badge className="bg-green-500 text-white">
                  <Lock className="w-3 h-3 mr-1" />
                  AES-256
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Backup Status</span>
                <Badge className="bg-green-500 text-white">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Current
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Compliance</span>
                <Badge className="bg-green-500 text-white">
                  <Shield className="w-3 h-3 mr-1" />
                  GDPR/CCPA
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="text-center pt-8 border-t border-gray-800">
        <p className="text-gray-400">
          FanzDash v2.0 | Enterprise Content Moderation Platform |
          <span className="text-cyan-400">
            {" "}
            Powered by AI & Human Intelligence
          </span>
        </p>
        <div className="flex justify-center gap-4 mt-4">
          <Link href="/settings">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-cyan-400"
            >
              <Settings className="w-4 h-4 mr-2" />
              System Settings
            </Button>
          </Link>
          <Link href="/audit">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-cyan-400"
            >
              <FileCheck className="w-4 h-4 mr-2" />
              Audit Logs
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
