import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Clock,
  Star,
  Users,
  MessageSquare,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Download,
  Filter,
  Eye,
  Target,
  Zap,
  Activity,
  User,
  Mail,
  Phone,
  Globe,
  Timer,
  Award,
  Percent,
  Plus,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { formatDistanceToNow } from "date-fns";

interface AnalyticsData {
  overview: {
    totalTickets: number;
    openTickets: number;
    resolvedTickets: number;
    avgResponseTime: number;
    avgResolutionTime: number;
    customerSatisfaction: number;
    firstContactResolution: number;
    escalationRate: number;
  };
  timeSeriesData: Array<{
    date: string;
    ticketsCreated: number;
    ticketsResolved: number;
    avgResponseTime: number;
    avgResolutionTime: number;
    satisfaction: number;
  }>;
  departmentData: Array<{
    id: string;
    name: string;
    ticketsHandled: number;
    avgResponseTime: number;
    avgResolutionTime: number;
    satisfaction: number;
    agentCount: number;
  }>;
  agentPerformance: Array<{
    id: string;
    name: string;
    email: string;
    avatar?: string;
    departmentName: string;
    ticketsAssigned: number;
    ticketsResolved: number;
    avgResponseTime: number;
    avgResolutionTime: number;
    satisfactionRating: number;
    isOnline: boolean;
    productivityScore: number;
  }>;
  categoryData: Array<{
    name: string;
    count: number;
    avgResolutionTime: number;
    color: string;
  }>;
  channelData: Array<{
    channel: string;
    count: number;
    percentage: number;
  }>;
  satisfactionTrends: Array<{
    date: string;
    rating: number;
    responses: number;
  }>;
  workloadDistribution: Array<{
    hour: number;
    tickets: number;
    responses: number;
  }>;
}

interface AnalyticsDashboardProps {
  data: AnalyticsData;
  timeRange: string;
  onTimeRangeChange: (range: string) => void;
  onExportReport: (type: string) => Promise<void>;
  currentUser: {
    id: string;
    name: string;
    role: string;
    departmentId?: string;
  };
  className?: string;
}

const COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#06B6D4",
];

export function AnalyticsDashboard({
  data,
  timeRange,
  onTimeRangeChange,
  onExportReport,
  currentUser,
  className = "",
}: AnalyticsDashboardProps) {
  const [selectedTab, setSelectedTab] = useState("overview");

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${Math.round(minutes)}m`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  const formatPercentage = (value: number) =>
    `${Math.round(value * 100) / 100}%`;

  const MetricCard = ({
    title,
    value,
    change,
    icon: Icon,
    color = "blue",
    format = "number",
  }: {
    title: string;
    value: number;
    change?: number;
    icon: React.ElementType;
    color?: string;
    format?: "number" | "time" | "percentage";
  }) => {
    const formatValue = () => {
      switch (format) {
        case "time":
          return formatTime(value);
        case "percentage":
          return formatPercentage(value);
        default:
          return value.toLocaleString();
      }
    };

    const isPositive = change && change > 0;
    const isNegative = change && change < 0;

    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {title}
              </p>
              <p className="text-3xl font-bold">{formatValue()}</p>
              {change !== undefined && (
                <div
                  className={`flex items-center mt-1 text-sm ${
                    isPositive
                      ? "text-green-600"
                      : isNegative
                        ? "text-red-600"
                        : "text-muted-foreground"
                  }`}
                >
                  {isPositive && <TrendingUp className="h-4 w-4 mr-1" />}
                  {isNegative && <TrendingDown className="h-4 w-4 mr-1" />}
                  <span>{Math.abs(change)}% from last period</span>
                </div>
              )}
            </div>
            <div className={`p-3 rounded-full bg-${color}-100`}>
              <Icon className={`h-6 w-6 text-${color}-600`} />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const AgentPerformanceCard = ({
    agent,
  }: {
    agent: (typeof data.agentPerformance)[0];
  }) => (
    <Card className="hover:shadow-lg transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Avatar className="h-10 w-10">
                <AvatarImage src={agent.avatar} />
                <AvatarFallback>{agent.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                  agent.isOnline ? "bg-green-500" : "bg-gray-300"
                }`}
              />
            </div>
            <div>
              <h3 className="font-semibold">{agent.name}</h3>
              <p className="text-sm text-muted-foreground">
                {agent.departmentName}
              </p>
            </div>
          </div>
          <Badge
            className={`${
              agent.productivityScore >= 90
                ? "bg-green-500"
                : agent.productivityScore >= 75
                  ? "bg-yellow-500"
                  : "bg-red-500"
            }`}
          >
            {agent.productivityScore}%
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Assigned</span>
              <span className="font-medium">{agent.ticketsAssigned}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Resolved</span>
              <span className="font-medium">{agent.ticketsResolved}</span>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Response</span>
              <span className="font-medium">
                {formatTime(agent.avgResponseTime)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Resolution</span>
              <span className="font-medium">
                {formatTime(agent.avgResolutionTime)}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <span className="text-sm text-muted-foreground">
                Satisfaction
              </span>
            </div>
            <span className="font-semibold">
              {agent.satisfactionRating.toFixed(1)}/5.0
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const DepartmentCard = ({
    dept,
  }: {
    dept: (typeof data.departmentData)[0];
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">{dept.name}</h3>
            <Badge variant="outline">{dept.agentCount} agents</Badge>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {dept.ticketsHandled}
              </div>
              <div className="text-xs text-muted-foreground">
                Tickets Handled
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {dept.satisfaction.toFixed(1)}
              </div>
              <div className="text-xs text-muted-foreground">
                Avg Satisfaction
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Avg Response</span>
              <span className="font-medium">
                {formatTime(dept.avgResponseTime)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Avg Resolution</span>
              <span className="font-medium">
                {formatTime(dept.avgResolutionTime)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center space-x-3">
            <BarChart3 className="h-8 w-8 text-primary" />
            <span>Support Analytics</span>
          </h1>
          <p className="text-muted-foreground">
            Performance insights and support team analytics
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <Select value={timeRange} onValueChange={onTimeRangeChange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="12m">Last 12 months</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={() => onExportReport("pdf")}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Export Report</span>
          </Button>
        </div>
      </div>

      <Tabs
        value={selectedTab}
        onValueChange={setSelectedTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="agents">Agent Performance</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <MetricCard
              title="Total Tickets"
              value={data.overview.totalTickets}
              change={12.5}
              icon={MessageSquare}
              color="blue"
            />
            <MetricCard
              title="Open Tickets"
              value={data.overview.openTickets}
              change={-8.2}
              icon={AlertTriangle}
              color="orange"
            />
            <MetricCard
              title="Avg Response Time"
              value={data.overview.avgResponseTime}
              change={-15.3}
              icon={Clock}
              color="green"
              format="time"
            />
            <MetricCard
              title="Customer Satisfaction"
              value={data.overview.customerSatisfaction}
              change={4.1}
              icon={Star}
              color="yellow"
              format="percentage"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <MetricCard
              title="Resolved Tickets"
              value={data.overview.resolvedTickets}
              change={18.7}
              icon={CheckCircle}
              color="green"
            />
            <MetricCard
              title="Avg Resolution Time"
              value={data.overview.avgResolutionTime}
              change={-12.1}
              icon={Timer}
              color="purple"
              format="time"
            />
            <MetricCard
              title="First Contact Resolution"
              value={data.overview.firstContactResolution}
              change={6.8}
              icon={Target}
              color="indigo"
              format="percentage"
            />
            <MetricCard
              title="Escalation Rate"
              value={data.overview.escalationRate}
              change={-22.4}
              icon={TrendingUp}
              color="red"
              format="percentage"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Ticket Volume Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Ticket Volume Trend</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="ticketsCreated"
                      stroke="#3B82F6"
                      name="Created"
                    />
                    <Line
                      type="monotone"
                      dataKey="ticketsResolved"
                      stroke="#10B981"
                      name="Resolved"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Category Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PieChart className="h-5 w-5" />
                  <span>Tickets by Category</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.categoryData}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {data.categoryData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Response Time Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Response & Resolution Time Trends</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data.timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) => [formatTime(value), ""]}
                  />
                  <Area
                    type="monotone"
                    dataKey="avgResponseTime"
                    stackId="1"
                    stroke="#F59E0B"
                    fill="#FEF3C7"
                    name="Response Time"
                  />
                  <Area
                    type="monotone"
                    dataKey="avgResolutionTime"
                    stackId="2"
                    stroke="#8B5CF6"
                    fill="#EDE9FE"
                    name="Resolution Time"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Channel Distribution & Workload */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5" />
                  <span>Tickets by Channel</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.channelData.map((channel, index) => (
                    <div
                      key={channel.channel}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-4 h-4 rounded-full`}
                          style={{
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        />
                        <span className="capitalize">{channel.channel}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{channel.count}</div>
                        <div className="text-sm text-muted-foreground">
                          {channel.percentage}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Workload by Hour</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={data.workloadDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="hour"
                      tickFormatter={(hour) => `${hour}:00`}
                    />
                    <YAxis />
                    <Tooltip labelFormatter={(hour) => `${hour}:00`} />
                    <Bar dataKey="tickets" fill="#3B82F6" name="Tickets" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Agent Performance Tab */}
        <TabsContent value="agents" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Agent Performance</h2>
            <Select defaultValue="productivity">
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="productivity">By Productivity</SelectItem>
                <SelectItem value="satisfaction">By Satisfaction</SelectItem>
                <SelectItem value="response_time">By Response Time</SelectItem>
                <SelectItem value="tickets_resolved">
                  By Tickets Resolved
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.agentPerformance.map((agent) => (
              <AgentPerformanceCard key={agent.id} agent={agent} />
            ))}
          </div>
        </TabsContent>

        {/* Departments Tab */}
        <TabsContent value="departments" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Department Performance</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.departmentData.map((dept) => (
              <DepartmentCard key={dept.id} dept={dept} />
            ))}
          </div>

          {/* Department Comparison Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Department Performance Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data.departmentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Bar
                    yAxisId="left"
                    dataKey="ticketsHandled"
                    fill="#3B82F6"
                    name="Tickets Handled"
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="satisfaction"
                    fill="#10B981"
                    name="Satisfaction"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <h2 className="text-xl font-semibold">Performance Trends</h2>

          {/* Satisfaction Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Star className="h-5 w-5" />
                <span>Customer Satisfaction Trend</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.satisfactionTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 5]} />
                  <Tooltip
                    formatter={(value: number) => [`${value}/5`, "Rating"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="rating"
                    stroke="#F59E0B"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Satisfaction vs Volume */}
          <Card>
            <CardHeader>
              <CardTitle>Satisfaction vs Response Volume</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="satisfaction"
                    stroke="#F59E0B"
                    name="Satisfaction %"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="ticketsResolved"
                    stroke="#3B82F6"
                    name="Tickets Resolved"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Generated Reports</h2>
            <Button className="bg-gradient-to-r from-primary to-purple-600">
              <Plus className="h-4 w-4 mr-2" />
              Generate Custom Report
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="cursor-pointer hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold">Weekly Performance Report</h3>
                    <p className="text-sm text-muted-foreground">
                      Comprehensive team performance metrics
                    </p>
                  </div>
                  <Badge>Automated</Badge>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Last generated: 2 hours ago</span>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold">
                      Customer Satisfaction Report
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Detailed satisfaction analysis and trends
                    </p>
                  </div>
                  <Badge>Manual</Badge>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Last generated: 1 day ago</span>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold">SLA Compliance Report</h3>
                    <p className="text-sm text-muted-foreground">
                      Service level agreement performance tracking
                    </p>
                  </div>
                  <Badge>Scheduled</Badge>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Next generation: Tomorrow 9AM</span>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Report Templates */}
          <Card>
            <CardHeader>
              <CardTitle>Available Report Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button
                  variant="outline"
                  className="h-20 flex flex-col space-y-2"
                >
                  <BarChart3 className="h-6 w-6" />
                  <span className="text-xs">Performance Report</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex flex-col space-y-2"
                >
                  <Star className="h-6 w-6" />
                  <span className="text-xs">Satisfaction Report</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex flex-col space-y-2"
                >
                  <Clock className="h-6 w-6" />
                  <span className="text-xs">SLA Report</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex flex-col space-y-2"
                >
                  <Users className="h-6 w-6" />
                  <span className="text-xs">Agent Report</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AnalyticsDashboard;
