import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Server,
  Activity,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Globe,
  Shield,
  DollarSign,
  BarChart3,
  MessageSquare,
  Cpu,
  Database,
  ShoppingCart,
  Users,
  Zap,
  Settings,
  RefreshCw,
  Eye,
  Search
} from "lucide-react";

// TypeScript Interfaces
interface ServiceStats {
  total: number;
  active: number;
  inactive: number;
  byCategory: {
    [key: string]: number;
  };
  timestamp: string;
}

interface MicroserviceDefinition {
  id: string;
  name: string;
  category: string;
  endpoint: string;
  port: number;
  healthCheck: string;
  dependencies: string[];
  status: 'active' | 'inactive' | 'error';
  version: string;
  lastHealthCheck?: string;
  responseTime?: number;
}

interface ServiceCategory {
  id: string;
  name: string;
  count: number;
  icon: React.ReactNode;
  color: string;
}

const SERVICE_CATEGORIES: ServiceCategory[] = [
  { id: 'content-platform', name: 'Content Platforms', count: 20, icon: <Globe className="w-4 h-4" />, color: 'bg-blue-500' },
  { id: 'security-compliance', name: 'Security & Compliance', count: 10, icon: <Shield className="w-4 h-4" />, color: 'bg-red-500' },
  { id: 'payment-finance', name: 'Payment & Finance', count: 8, icon: <DollarSign className="w-4 h-4" />, color: 'bg-green-500' },
  { id: 'analytics-marketing', name: 'Analytics & Marketing', count: 8, icon: <BarChart3 className="w-4 h-4" />, color: 'bg-purple-500' },
  { id: 'content-management', name: 'Content Management', count: 8, icon: <Database className="w-4 h-4" />, color: 'bg-yellow-500' },
  { id: 'communication', name: 'Communication', count: 6, icon: <MessageSquare className="w-4 h-4" />, color: 'bg-pink-500' },
  { id: 'community-social', name: 'Community & Social', count: 8, icon: <Users className="w-4 h-4" />, color: 'bg-cyan-500' },
  { id: 'marketplace', name: 'Marketplace', count: 6, icon: <ShoppingCart className="w-4 h-4" />, color: 'bg-orange-500' },
  { id: 'ai-automation', name: 'AI & Automation', count: 8, icon: <Cpu className="w-4 h-4" />, color: 'bg-indigo-500' },
  { id: 'infrastructure', name: 'Infrastructure', count: 7, icon: <Server className="w-4 h-4" />, color: 'bg-gray-500' },
  { id: 'specialized', name: 'Specialized', count: 5, icon: <Zap className="w-4 h-4" />, color: 'bg-emerald-500' },
];

export default function MicroservicesDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch service registry stats
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery<ServiceStats>({
    queryKey: ['/api/gateway/services/registry/stats'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch all services
  const { data: servicesData, isLoading: servicesLoading, refetch: refetchServices } = useQuery<{
    count: number;
    services: MicroserviceDefinition[];
  }>({
    queryKey: ['/api/gateway/services/list'],
    refetchInterval: 30000,
  });

  // Fetch services by category
  const { data: categoryServices } = useQuery<{
    category: string;
    count: number;
    services: MicroserviceDefinition[];
  }>({
    queryKey: ['/api/gateway/services/category', selectedCategory],
    enabled: selectedCategory !== 'all',
    refetchInterval: 30000,
  });

  // Fetch individual service health
  const { data: serviceHealth, refetch: refetchHealth } = useQuery<{
    serviceId: string;
    serviceName: string;
    status: string;
    endpoint: string;
    healthCheck: string;
  }>({
    queryKey: ['/api/gateway/services', selectedService, 'health'],
    enabled: !!selectedService,
    refetchInterval: 15000,
  });

  const services = selectedCategory === 'all'
    ? servicesData?.services || []
    : categoryServices?.services || [];

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const badges = {
      active: <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>,
      inactive: <Badge variant="outline"><XCircle className="w-3 h-3 mr-1" />Inactive</Badge>,
      error: <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" />Error</Badge>,
    };
    return badges[status as keyof typeof badges] || badges.inactive;
  };

  const getCategoryData = (categoryId: string) => {
    return SERVICE_CATEGORIES.find(c => c.id === categoryId);
  };

  const handleRefreshAll = () => {
    refetchStats();
    refetchServices();
    toast({
      title: "Refreshing services",
      description: "Updating service status across all microservices...",
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Server className="w-8 h-8" />
            Microservices Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor and manage 200+ microservices across 94 platforms
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefreshAll}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh All
          </Button>
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Configure
          </Button>
        </div>
      </div>

      {/* Service Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Services</CardTitle>
            <Server className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across {SERVICE_CATEGORIES.length} categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Services</CardTitle>
            <CheckCircle className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.active ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats ? Math.round((stats.active / stats.total) * 100) : 0}% uptime
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Inactive Services</CardTitle>
            <XCircle className="w-4 h-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats?.inactive ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats && stats.inactive > 0 ? 'Requires attention' : 'All systems operational'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Activity className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats ? Math.round((stats.active / stats.total) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Overall ecosystem health
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Service Categories Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Service Categories</CardTitle>
          <CardDescription>Browse microservices by category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`p-4 border rounded-lg text-left hover:bg-accent transition-colors ${
                selectedCategory === 'all' ? 'border-primary bg-primary/5' : ''
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Globe className="w-4 h-4" />
                <div className="font-medium">All Services</div>
              </div>
              <div className="text-2xl font-bold">{stats?.total ?? 0}</div>
              <div className="text-xs text-muted-foreground mt-1">Total microservices</div>
            </button>

            {SERVICE_CATEGORIES.map(category => {
              const count = stats?.byCategory[category.id] || 0;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`p-4 border rounded-lg text-left hover:bg-accent transition-colors ${
                    selectedCategory === category.id ? 'border-primary bg-primary/5' : ''
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-3 h-3 rounded-full ${category.color}`} />
                    <div className="font-medium text-sm">{category.name}</div>
                  </div>
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {count} {count === 1 ? 'service' : 'services'}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Service List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {selectedCategory === 'all'
                  ? 'All Services'
                  : getCategoryData(selectedCategory)?.name || 'Services'}
              </CardTitle>
              <CardDescription>
                {filteredServices.length} {filteredServices.length === 1 ? 'service' : 'services'} available
              </CardDescription>
            </div>
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {servicesLoading || statsLoading ? (
            <div className="text-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">Loading microservices...</p>
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="text-center py-12">
              <Server className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">No services found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredServices.map(service => {
                const categoryData = getCategoryData(service.category);
                return (
                  <Card
                    key={service.id}
                    className={`cursor-pointer hover:shadow-md transition-shadow ${
                      selectedService === service.id ? 'border-primary' : ''
                    }`}
                    onClick={() => setSelectedService(service.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg flex items-center gap-2">
                            {categoryData?.icon}
                            {service.name}
                          </CardTitle>
                          <CardDescription className="text-xs mt-1">
                            {service.id}
                          </CardDescription>
                        </div>
                        {getStatusBadge(service.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Port:</span>
                          <span className="font-medium">{service.port}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Version:</span>
                          <span className="font-medium">{service.version}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Category:</span>
                          <Badge variant="outline" className="text-xs">
                            {categoryData?.name || service.category}
                          </Badge>
                        </div>
                        {service.dependencies.length > 0 && (
                          <div className="pt-2 border-t">
                            <span className="text-muted-foreground text-xs">
                              {service.dependencies.length} {service.dependencies.length === 1 ? 'dependency' : 'dependencies'}
                            </span>
                          </div>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-3"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedService(service.id);
                        }}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Service Details Panel */}
      {selectedService && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Service Details</CardTitle>
                <CardDescription>{selectedService}</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  refetchHealth();
                  toast({
                    title: "Health check initiated",
                    description: `Checking health status for ${selectedService}...`,
                  });
                }}
              >
                <Activity className="w-4 h-4 mr-2" />
                Check Health
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {serviceHealth ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Service Name</Label>
                    <div className="text-lg font-medium">{serviceHealth.serviceName}</div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Status</Label>
                    <div className="mt-1">{getStatusBadge(serviceHealth.status)}</div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Endpoint</Label>
                    <div className="text-sm font-mono bg-muted p-2 rounded">{serviceHealth.endpoint}</div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Health Check URL</Label>
                    <div className="text-sm font-mono bg-muted p-2 rounded">{serviceHealth.healthCheck}</div>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Quick Actions</h4>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Activity className="w-4 h-4 mr-2" />
                      View Logs
                    </Button>
                    <Button variant="outline" size="sm">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      View Metrics
                    </Button>
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4 mr-2" />
                      Configure
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">Loading service details...</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Last Updated */}
      {stats && (
        <div className="text-center text-sm text-muted-foreground">
          Last updated: {new Date(stats.timestamp).toLocaleString()}
        </div>
      )}
    </div>
  );
}
