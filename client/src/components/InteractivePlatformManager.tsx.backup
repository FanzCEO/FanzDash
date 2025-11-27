import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Trash2, TestTube } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Platform {
  id: string;
  name: string;
  displayName: string;
  description: string;
  theme: string;
  status: "online" | "offline" | "maintenance";
  connections: Connection[];
  apis: ApiConnection[];
  metrics: PlatformMetrics;
}

interface Connection {
  id: string;
  type: string;
  name: string;
  status: "connected" | "disconnected" | "error";
  lastSeen: string;
}

interface ApiConnection {
  id: string;
  name: string;
  type: string;
  endpoint: string;
  status: "active" | "inactive" | "error";
  lastCall: string;
  calls24h: number;
}

interface PlatformMetrics {
  users: number;
  revenue: string;
  growth: string;
  uptime: string;
}

const FANZ_PLATFORMS: Platform[] = [
  {
    id: "fanzlab",
    name: "FanzLab",
    displayName: "FanzLab Central Portal",
    description: "Main command center for all Fanz ecosystem platforms",
    theme: "bg-gradient-to-br from-cyan-900 to-blue-900",
    status: "online",
    connections: [
      {
        id: "db-1",
        type: "Database",
        name: "Primary PostgreSQL",
        status: "connected",
        lastSeen: "2025-01-04T19:17:00Z",
      },
      {
        id: "redis-1",
        type: "Cache",
        name: "Redis Cluster",
        status: "connected",
        lastSeen: "2025-01-04T19:17:00Z",
      },
      {
        id: "cdn-1",
        type: "CDN",
        name: "CloudFlare CDN",
        status: "connected",
        lastSeen: "2025-01-04T19:16:45Z",
      },
    ],
    apis: [
      {
        id: "auth-api",
        name: "Authentication API",
        type: "Core",
        endpoint: "/api/auth",
        status: "active",
        lastCall: "2025-01-04T19:17:00Z",
        calls24h: 45678,
      },
      {
        id: "user-api",
        name: "User Management API",
        type: "Core",
        endpoint: "/api/users",
        status: "active",
        lastCall: "2025-01-04T19:16:58Z",
        calls24h: 23456,
      },
      {
        id: "mod-api",
        name: "Moderation API",
        type: "Security",
        endpoint: "/api/moderation",
        status: "active",
        lastCall: "2025-01-04T19:17:00Z",
        calls24h: 12847,
      },
    ],
    metrics: {
      users: 127849,
      revenue: "$2.8M",
      growth: "+12.8%",
      uptime: "99.97%",
    },
  },
  {
    id: "boyfanz",
    name: "BoyFanz",
    displayName: "BoyFanz Platform",
    description: "Male creator focused platform with neon red theme",
    theme: "bg-gradient-to-br from-red-900 to-pink-900",
    status: "online",
    connections: [
      {
        id: "db-2",
        type: "Database",
        name: "BoyFanz PostgreSQL",
        status: "connected",
        lastSeen: "2025-01-04T19:16:55Z",
      },
      {
        id: "storage-2",
        type: "Storage",
        name: "AWS S3 Bucket",
        status: "connected",
        lastSeen: "2025-01-04T19:16:50Z",
      },
      {
        id: "stream-2",
        type: "Streaming",
        name: "Agora WebRTC",
        status: "connected",
        lastSeen: "2025-01-04T19:16:45Z",
      },
    ],
    apis: [
      {
        id: "creator-api",
        name: "Creator API",
        type: "Core",
        endpoint: "/api/creators",
        status: "active",
        lastCall: "2025-01-04T19:16:55Z",
        calls24h: 18934,
      },
      {
        id: "content-api",
        name: "Content API",
        type: "Media",
        endpoint: "/api/content",
        status: "active",
        lastCall: "2025-01-04T19:16:52Z",
        calls24h: 34567,
      },
      {
        id: "payment-api",
        name: "Payment API",
        type: "Financial",
        endpoint: "/api/payments",
        status: "active",
        lastCall: "2025-01-04T19:16:58Z",
        calls24h: 8934,
      },
    ],
    metrics: {
      users: 43298,
      revenue: "$890K",
      growth: "+18.4%",
      uptime: "99.89%",
    },
  },
  {
    id: "girlfanz",
    name: "GirlFanz",
    displayName: "GirlFanz Platform",
    description: "Female creator focused platform with neon pink theme",
    theme: "bg-gradient-to-br from-pink-900 to-purple-900",
    status: "online",
    connections: [
      {
        id: "db-3",
        type: "Database",
        name: "GirlFanz PostgreSQL",
        status: "connected",
        lastSeen: "2025-01-04T19:16:58Z",
      },
      {
        id: "storage-3",
        type: "Storage",
        name: "Google Cloud Storage",
        status: "connected",
        lastSeen: "2025-01-04T19:16:48Z",
      },
      {
        id: "ai-3",
        type: "AI",
        name: "ChatGPT-4o Vision",
        status: "connected",
        lastSeen: "2025-01-04T19:16:59Z",
      },
    ],
    apis: [
      {
        id: "beauty-api",
        name: "Beauty Tutorial API",
        type: "Content",
        endpoint: "/api/beauty",
        status: "active",
        lastCall: "2025-01-04T19:16:56Z",
        calls24h: 15678,
      },
      {
        id: "fashion-api",
        name: "Fashion Lookbook API",
        type: "Content",
        endpoint: "/api/fashion",
        status: "active",
        lastCall: "2025-01-04T19:16:54Z",
        calls24h: 23456,
      },
      {
        id: "sub-api",
        name: "Subscription API",
        type: "Financial",
        endpoint: "/api/subscriptions",
        status: "active",
        lastCall: "2025-01-04T19:16:59Z",
        calls24h: 12345,
      },
    ],
    metrics: {
      users: 56743,
      revenue: "$1.2M",
      growth: "+22.1%",
      uptime: "99.94%",
    },
  },
  {
    id: "daddyfanz",
    name: "DaddyFanz",
    displayName: "DaddyFanz Platform",
    description: "Premium daddy-focused creator platform",
    theme: "bg-gradient-to-br from-gray-900 to-slate-900",
    status: "online",
    connections: [
      {
        id: "db-4",
        type: "Database",
        name: "DaddyFanz PostgreSQL",
        status: "connected",
        lastSeen: "2025-01-04T19:16:57Z",
      },
      {
        id: "encrypt-4",
        type: "Security",
        name: "End-to-End Encryption",
        status: "connected",
        lastSeen: "2025-01-04T19:16:59Z",
      },
      {
        id: "verify-4",
        type: "Compliance",
        name: "2257 Verification",
        status: "connected",
        lastSeen: "2025-01-04T19:16:45Z",
      },
    ],
    apis: [
      {
        id: "premium-api",
        name: "Premium Content API",
        type: "Content",
        endpoint: "/api/premium",
        status: "active",
        lastCall: "2025-01-04T19:16:57Z",
        calls24h: 9876,
      },
      {
        id: "daddy-api",
        name: "Daddy Features API",
        type: "Core",
        endpoint: "/api/daddy",
        status: "active",
        lastCall: "2025-01-04T19:16:55Z",
        calls24h: 7654,
      },
      {
        id: "wallet-api",
        name: "Wallet API",
        type: "Financial",
        endpoint: "/api/wallet",
        status: "active",
        lastCall: "2025-01-04T19:16:58Z",
        calls24h: 5432,
      },
    ],
    metrics: {
      users: 28934,
      revenue: "$620K",
      growth: "+15.7%",
      uptime: "99.91%",
    },
  },
  {
    id: "pupfanz",
    name: "PupFanz",
    displayName: "PupFanz Platform",
    description: "Pup community focused platform",
    theme: "bg-gradient-to-br from-orange-900 to-yellow-900",
    status: "online",
    connections: [
      {
        id: "db-5",
        type: "Database",
        name: "PupFanz PostgreSQL",
        status: "connected",
        lastSeen: "2025-01-04T19:16:54Z",
      },
      {
        id: "community-5",
        type: "Social",
        name: "Community Hub",
        status: "connected",
        lastSeen: "2025-01-04T19:16:56Z",
      },
      {
        id: "events-5",
        type: "Events",
        name: "Event System",
        status: "connected",
        lastSeen: "2025-01-04T19:16:52Z",
      },
    ],
    apis: [
      {
        id: "pup-api",
        name: "Pup Community API",
        type: "Social",
        endpoint: "/api/pup",
        status: "active",
        lastCall: "2025-01-04T19:16:54Z",
        calls24h: 6789,
      },
      {
        id: "gear-api",
        name: "Gear Marketplace API",
        type: "Commerce",
        endpoint: "/api/gear",
        status: "active",
        lastCall: "2025-01-04T19:16:56Z",
        calls24h: 4321,
      },
      {
        id: "event-api",
        name: "Event Management API",
        type: "Events",
        endpoint: "/api/events",
        status: "active",
        lastCall: "2025-01-04T19:16:52Z",
        calls24h: 3456,
      },
    ],
    metrics: {
      users: 15678,
      revenue: "$280K",
      growth: "+26.3%",
      uptime: "99.85%",
    },
  },
  {
    id: "taboofanz",
    name: "TabooFanz",
    displayName: "TabooFanz Platform",
    description: "Adult taboo content platform with enhanced security",
    theme: "bg-gradient-to-br from-purple-900 to-indigo-900",
    status: "online",
    connections: [
      {
        id: "db-6",
        type: "Database",
        name: "TabooFanz PostgreSQL",
        status: "connected",
        lastSeen: "2025-01-04T19:16:59Z",
      },
      {
        id: "shield-6",
        type: "Security",
        name: "FanzShield Protection",
        status: "connected",
        lastSeen: "2025-01-04T19:16:57Z",
      },
      {
        id: "age-6",
        type: "Compliance",
        name: "Age Verification",
        status: "connected",
        lastSeen: "2025-01-04T19:16:58Z",
      },
    ],
    apis: [
      {
        id: "taboo-api",
        name: "Taboo Content API",
        type: "Content",
        endpoint: "/api/taboo",
        status: "active",
        lastCall: "2025-01-04T19:16:59Z",
        calls24h: 8765,
      },
      {
        id: "security-api",
        name: "Enhanced Security API",
        type: "Security",
        endpoint: "/api/security",
        status: "active",
        lastCall: "2025-01-04T19:16:57Z",
        calls24h: 5678,
      },
      {
        id: "compliance-api",
        name: "Compliance API",
        type: "Legal",
        endpoint: "/api/compliance",
        status: "active",
        lastCall: "2025-01-04T19:16:58Z",
        calls24h: 3210,
      },
    ],
    metrics: {
      users: 21234,
      revenue: "$450K",
      growth: "+19.8%",
      uptime: "99.96%",
    },
  },
  {
    id: "transfanz",
    name: "TransFanz",
    displayName: "TransFanz Platform",
    description: "Trans-inclusive creator platform",
    theme: "bg-gradient-to-br from-blue-900 to-pink-900",
    status: "online",
    connections: [
      {
        id: "db-7",
        type: "Database",
        name: "TransFanz PostgreSQL",
        status: "connected",
        lastSeen: "2025-01-04T19:16:56Z",
      },
      {
        id: "inclusive-7",
        type: "Social",
        name: "Inclusive Features",
        status: "connected",
        lastSeen: "2025-01-04T19:16:54Z",
      },
      {
        id: "support-7",
        type: "Support",
        name: "Community Support",
        status: "connected",
        lastSeen: "2025-01-04T19:16:58Z",
      },
    ],
    apis: [
      {
        id: "trans-api",
        name: "Trans Community API",
        type: "Social",
        endpoint: "/api/trans",
        status: "active",
        lastCall: "2025-01-04T19:16:56Z",
        calls24h: 7891,
      },
      {
        id: "inclusive-api",
        name: "Inclusive Features API",
        type: "Core",
        endpoint: "/api/inclusive",
        status: "active",
        lastCall: "2025-01-04T19:16:54Z",
        calls24h: 4567,
      },
      {
        id: "support-api",
        name: "Support System API",
        type: "Support",
        endpoint: "/api/support",
        status: "active",
        lastCall: "2025-01-04T19:16:58Z",
        calls24h: 2345,
      },
    ],
    metrics: {
      users: 18567,
      revenue: "$340K",
      growth: "+28.2%",
      uptime: "99.88%",
    },
  },
  {
    id: "cougarfanz",
    name: "CougarFanz",
    displayName: "CougarFanz Platform",
    description: "Mature creator focused platform",
    theme: "bg-gradient-to-br from-amber-900 to-orange-900",
    status: "online",
    connections: [
      {
        id: "db-8",
        type: "Database",
        name: "CougarFanz PostgreSQL",
        status: "connected",
        lastSeen: "2025-01-04T19:16:53Z",
      },
      {
        id: "mature-8",
        type: "Verification",
        name: "Maturity Verification",
        status: "connected",
        lastSeen: "2025-01-04T19:16:57Z",
      },
      {
        id: "premium-8",
        type: "Premium",
        name: "Premium Services",
        status: "connected",
        lastSeen: "2025-01-04T19:16:55Z",
      },
    ],
    apis: [
      {
        id: "cougar-api",
        name: "Cougar Platform API",
        type: "Core",
        endpoint: "/api/cougar",
        status: "active",
        lastCall: "2025-01-04T19:16:53Z",
        calls24h: 6543,
      },
      {
        id: "mature-api",
        name: "Mature Content API",
        type: "Content",
        endpoint: "/api/mature",
        status: "active",
        lastCall: "2025-01-04T19:16:57Z",
        calls24h: 3987,
      },
      {
        id: "experience-api",
        name: "Experience API",
        type: "Premium",
        endpoint: "/api/experience",
        status: "active",
        lastCall: "2025-01-04T19:16:55Z",
        calls24h: 2876,
      },
    ],
    metrics: {
      users: 14321,
      revenue: "$290K",
      growth: "+16.9%",
      uptime: "99.82%",
    },
  },
  {
    id: "fanzclips",
    name: "FanzClips",
    displayName: "FanzClips Platform",
    description: "Male-focused adult content platform",
    theme: "bg-gradient-to-br from-red-900 to-gray-900",
    status: "online",
    connections: [
      {
        id: "db-9",
        type: "Database",
        name: "FanzClips PostgreSQL",
        status: "connected",
        lastSeen: "2025-01-04T19:16:59Z",
      },
      {
        id: "adult-9",
        type: "Compliance",
        name: "Adult Verification",
        status: "connected",
        lastSeen: "2025-01-04T19:16:56Z",
      },
      {
        id: "male-9",
        type: "Content",
        name: "Male Content System",
        status: "connected",
        lastSeen: "2025-01-04T19:16:54Z",
      },
    ],
    apis: [
      {
        id: "cock-api",
        name: "Platform Core API",
        type: "Core",
        endpoint: "/api/cock",
        status: "active",
        lastCall: "2025-01-04T19:16:59Z",
        calls24h: 9876,
      },
      {
        id: "male-content-api",
        name: "Male Content API",
        type: "Content",
        endpoint: "/api/male-content",
        status: "active",
        lastCall: "2025-01-04T19:16:56Z",
        calls24h: 6543,
      },
      {
        id: "verification-api",
        name: "Adult Verification API",
        type: "Compliance",
        endpoint: "/api/adult-verify",
        status: "active",
        lastCall: "2025-01-04T19:16:54Z",
        calls24h: 4321,
      },
    ],
    metrics: {
      users: 32156,
      revenue: "$580K",
      growth: "+20.5%",
      uptime: "99.87%",
    },
  },
  {
    id: "fanztube",
    name: "FanzTube",
    displayName: "FanzTube Video Platform",
    description: "Video sharing and streaming platform",
    theme: "bg-gradient-to-br from-green-900 to-teal-900",
    status: "online",
    connections: [
      {
        id: "db-10",
        type: "Database",
        name: "FanzTube PostgreSQL",
        status: "connected",
        lastSeen: "2025-01-04T19:16:58Z",
      },
      {
        id: "video-10",
        type: "Video",
        name: "FFMPEG Processing",
        status: "connected",
        lastSeen: "2025-01-04T19:16:55Z",
      },
      {
        id: "stream-10",
        type: "Streaming",
        name: "Live Streaming CDN",
        status: "connected",
        lastSeen: "2025-01-04T19:16:57Z",
      },
    ],
    apis: [
      {
        id: "tube-api",
        name: "Video Platform API",
        type: "Core",
        endpoint: "/api/tube",
        status: "active",
        lastCall: "2025-01-04T19:16:58Z",
        calls24h: 45678,
      },
      {
        id: "video-api",
        name: "Video Processing API",
        type: "Media",
        endpoint: "/api/video",
        status: "active",
        lastCall: "2025-01-04T19:16:55Z",
        calls24h: 23456,
      },
      {
        id: "streaming-api",
        name: "Live Streaming API",
        type: "Streaming",
        endpoint: "/api/streaming",
        status: "active",
        lastCall: "2025-01-04T19:16:57Z",
        calls24h: 15432,
      },
    ],
    metrics: {
      users: 89234,
      revenue: "$1.5M",
      growth: "+31.4%",
      uptime: "99.93%",
    },
  },
];

export function InteractivePlatformManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: platformsStatus, isLoading } = useQuery({
    queryKey: ["/api/platforms/status"],
  });

  const testPlatformMutation = useMutation({
    mutationFn: async (platformId: string) => {
      const response = await fetch(`/api/platforms/${platformId}/test`, {
        method: "POST",
      });
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Platform Test",
        description: data.success
          ? "All systems operational!"
          : "Some services experiencing issues",
        variant: data.success ? "default" : "destructive",
      });
    },
  });

  const restartServiceMutation = useMutation({
    mutationFn: async ({
      platformId,
      serviceId,
    }: {
      platformId: string;
      serviceId: string;
    }) => {
      const response = await fetch(
        `/api/platforms/${platformId}/services/${serviceId}/restart`,
        {
          method: "POST",
        },
      );
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/platforms/status"] });
      toast({
        title: "Service Restarted",
        description: "Service has been successfully restarted",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-cyan-400">
            Fanz™ Platform Manager
          </h2>
          <p className="text-gray-400 mt-1">
            Manage all Fanz ecosystem platforms and their connections
          </p>
        </div>
        <Badge variant="outline" className="text-cyan-400 border-cyan-400">
          {FANZ_PLATFORMS.length} Platforms Active
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {FANZ_PLATFORMS.map((platform) => (
          <Card
            key={platform.id}
            className={`${platform.theme} border-primary/20 cyber-border`}
            data-testid={`platform-card-${platform.id}`}
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-white cyber-text-glow text-lg">
                    {platform.displayName}
                  </CardTitle>
                  <CardDescription className="text-gray-300 mt-1">
                    {platform.description}
                  </CardDescription>
                </div>
                <Badge
                  variant={
                    platform.status === "online" ? "default" : "destructive"
                  }
                  className={platform.status === "online" ? "bg-green-600" : ""}
                  data-testid={`badge-status-${platform.id}`}
                >
                  {platform.status.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Platform Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 rounded border border-primary/20 bg-black/20">
                  <p className="text-xs text-gray-400">Users</p>
                  <p className="text-sm font-bold text-white">
                    {platform.metrics.users.toLocaleString()}
                  </p>
                </div>
                <div className="text-center p-3 rounded border border-primary/20 bg-black/20">
                  <p className="text-xs text-gray-400">Revenue</p>
                  <p className="text-sm font-bold text-white">
                    {platform.metrics.revenue}
                  </p>
                </div>
                <div className="text-center p-3 rounded border border-primary/20 bg-black/20">
                  <p className="text-xs text-gray-400">Growth</p>
                  <p className="text-sm font-bold text-green-400">
                    {platform.metrics.growth}
                  </p>
                </div>
                <div className="text-center p-3 rounded border border-primary/20 bg-black/20">
                  <p className="text-xs text-gray-400">Uptime</p>
                  <p className="text-sm font-bold text-white">
                    {platform.metrics.uptime}
                  </p>
                </div>
              </div>

              {/* Connections */}
              <div>
                <Label className="text-white font-semibold">
                  Connections ({platform.connections.length})
                </Label>
                <div className="space-y-2 mt-2">
                  {platform.connections.map((connection) => (
                    <div
                      key={connection.id}
                      className="flex justify-between items-center p-2 rounded bg-black/30 border border-primary/10"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${connection.status === "connected" ? "bg-green-500" : connection.status === "error" ? "bg-red-500" : "bg-yellow-500"}`}
                        ></div>
                        <div>
                          <p className="text-xs font-medium text-white">
                            {connection.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {connection.type}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(connection.lastSeen).toLocaleTimeString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* APIs */}
              <div>
                <Label className="text-white font-semibold">
                  API Endpoints ({platform.apis.length})
                </Label>
                <div className="space-y-2 mt-2">
                  {platform.apis.map((api) => (
                    <div
                      key={api.id}
                      className="p-2 rounded bg-black/30 border border-primary/10"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${api.status === "active" ? "bg-green-500" : api.status === "error" ? "bg-red-500" : "bg-yellow-500"}`}
                          ></div>
                          <p className="text-xs font-medium text-white">
                            {api.name}
                          </p>
                          <Badge
                            variant="outline"
                            className="text-xs py-0 px-2 border-primary/20 text-cyan-400"
                          >
                            {api.type}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 mb-1 font-mono">
                        {api.endpoint}
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{api.calls24h.toLocaleString()} calls/24h</span>
                        <span>
                          Last: {new Date(api.lastCall).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => testPlatformMutation.mutate(platform.id)}
                  disabled={testPlatformMutation.isPending}
                  data-testid={`button-test-${platform.id}`}
                  className="flex-1"
                >
                  <TestTube className="h-4 w-4 mr-1" />
                  Test All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  data-testid={`button-manage-${platform.id}`}
                  className="flex-1"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Manage
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 p-6 border border-primary/20 rounded-lg bg-black/20 cyber-border">
        <h3 className="text-lg font-semibold text-cyan-400 mb-4">
          Platform Overview
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 rounded border border-primary/20 bg-black/30">
            <p className="text-sm text-gray-400">Total Users</p>
            <p className="text-xl font-bold text-white">
              {FANZ_PLATFORMS.reduce(
                (sum, p) => sum + p.metrics.users,
                0,
              ).toLocaleString()}
            </p>
          </div>
          <div className="text-center p-4 rounded border border-primary/20 bg-black/30">
            <p className="text-sm text-gray-400">Active APIs</p>
            <p className="text-xl font-bold text-white">
              {FANZ_PLATFORMS.reduce((sum, p) => sum + p.apis.length, 0)}
            </p>
          </div>
          <div className="text-center p-4 rounded border border-primary/20 bg-black/30">
            <p className="text-sm text-gray-400">Connections</p>
            <p className="text-xl font-bold text-white">
              {FANZ_PLATFORMS.reduce((sum, p) => sum + p.connections.length, 0)}
            </p>
          </div>
          <div className="text-center p-4 rounded border border-primary/20 bg-black/30">
            <p className="text-sm text-gray-400">Platforms Online</p>
            <p className="text-xl font-bold text-green-400">
              {FANZ_PLATFORMS.filter((p) => p.status === "online").length}/
              {FANZ_PLATFORMS.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
