import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import {
  Clock,
  Play,
  Pause,
  Square,
  Trash2,
  Edit,
  Plus,
  RotateCcw,
  Calendar,
  Activity,
  AlertCircle,
  CheckCircle,
  XCircle,
  Timer,
  FileText,
  Settings,
  Database,
  Mail,
  Shield,
  TrendingUp,
  Archive,
} from "lucide-react";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";

// Form validation schemas
const cronJobFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  command: z.string().min(1, "Command is required"),
  schedule: z.string().min(1, "Schedule is required"),
  category: z.string().min(1, "Category is required"),
  priority: z.string().default("normal"),
  timeout: z
    .number()
    .min(10, "Timeout must be at least 10 seconds")
    .default(300),
  maxRetries: z.number().min(0, "Max retries must be 0 or greater").default(3),
  isActive: z.boolean().default(true),
  createdBy: z.string().default("admin"),
});

type CronJobFormData = z.infer<typeof cronJobFormSchema>;

interface CronJob {
  id: string;
  name: string;
  description?: string;
  command: string;
  schedule: string;
  isActive: boolean;
  isRunning: boolean;
  lastRunAt?: string;
  nextRunAt?: string;
  lastResult?: string;
  lastOutput?: string;
  lastError?: string;
  timeout: number;
  retryCount: number;
  maxRetries: number;
  priority: string;
  category: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

interface CronJobLog {
  id: string;
  jobId: string;
  startedAt: string;
  completedAt?: string;
  status: string;
  exitCode?: number;
  output?: string;
  errorOutput?: string;
  duration?: number;
  memoryUsage?: number;
  cpuUsage?: number;
  createdAt: string;
}

const categoryIcons = {
  maintenance: <Settings className="h-4 w-4" />,
  analytics: <TrendingUp className="h-4 w-4" />,
  payments: <Activity className="h-4 w-4" />,
  content: <FileText className="h-4 w-4" />,
  backup: <Archive className="h-4 w-4" />,
  database: <Database className="h-4 w-4" />,
  email: <Mail className="h-4 w-4" />,
  security: <Shield className="h-4 w-4" />,
};

const priorityColors = {
  low: "bg-gray-500/10 text-gray-600 border-gray-200",
  normal: "bg-blue-500/10 text-blue-600 border-blue-200",
  high: "bg-orange-500/10 text-orange-600 border-orange-200",
  critical: "bg-red-500/10 text-red-600 border-red-200",
};

const statusColors = {
  success: "bg-green-500/10 text-green-600 border-green-200",
  failed: "bg-red-500/10 text-red-600 border-red-200",
  running: "bg-blue-500/10 text-blue-600 border-blue-200",
  timeout: "bg-orange-500/10 text-orange-600 border-orange-200",
  cancelled: "bg-gray-500/10 text-gray-600 border-gray-200",
};

export default function CronManagement() {
  const [selectedJob, setSelectedJob] = useState<CronJob | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLogDialogOpen, setIsLogDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch cron jobs
  const { data: cronJobs = [], isLoading: jobsLoading } = useQuery<CronJob[]>({
    queryKey: ["/api/cron-jobs"],
  });

  // Fetch logs for selected job
  const { data: cronLogs = [], isLoading: logsLoading } = useQuery<
    CronJobLog[]
  >({
    queryKey: ["/api/cron-job-logs"],
    enabled: activeTab === "logs",
  });

  // Create cron job mutation
  const createJobMutation = useMutation({
    mutationFn: (data: CronJobFormData) =>
      apiRequest("/api/cron-jobs", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cron-jobs"] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Cron job created",
        description: "The cron job has been created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create cron job.",
        variant: "destructive",
      });
    },
  });

  // Update cron job mutation
  const updateJobMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CronJobFormData>;
    }) => apiRequest(`/api/cron-jobs/${id}`, "PUT", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cron-jobs"] });
      setIsEditDialogOpen(false);
      toast({
        title: "Cron job updated",
        description: "The cron job has been updated successfully.",
      });
    },
  });

  // Delete cron job mutation
  const deleteJobMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/cron-jobs/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cron-jobs"] });
      toast({
        title: "Cron job deleted",
        description: "The cron job has been deleted successfully.",
      });
    },
  });

  // Toggle cron job mutation
  const toggleJobMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      apiRequest(`/api/cron-jobs/${id}/toggle`, "POST", { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cron-jobs"] });
    },
  });

  // Run cron job mutation
  const runJobMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/cron-jobs/${id}/run`, "POST"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cron-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/cron-job-logs"] });
      toast({
        title: "Cron job started",
        description: "The cron job has been started successfully.",
      });
    },
  });

  const form = useForm<CronJobFormData>({
    resolver: zodResolver(cronJobFormSchema),
    defaultValues: {
      name: "",
      description: "",
      command: "",
      schedule: "",
      category: "maintenance",
      priority: "normal",
      timeout: 300,
      maxRetries: 3,
      isActive: true,
      createdBy: "admin",
    },
  });

  const editForm = useForm<CronJobFormData>({
    resolver: zodResolver(cronJobFormSchema),
  });

  const onCreateSubmit = (data: CronJobFormData) => {
    createJobMutation.mutate(data);
  };

  const onEditSubmit = (data: CronJobFormData) => {
    if (selectedJob) {
      updateJobMutation.mutate({ id: selectedJob.id, data });
    }
  };

  const handleEdit = (job: CronJob) => {
    setSelectedJob(job);
    editForm.reset({
      name: job.name,
      description: job.description || "",
      command: job.command,
      schedule: job.schedule,
      category: job.category,
      priority: job.priority,
      timeout: job.timeout,
      maxRetries: job.maxRetries,
      isActive: job.isActive,
      createdBy: job.createdBy || "admin",
    });
    setIsEditDialogOpen(true);
  };

  const handleViewLogs = (job: CronJob) => {
    setSelectedJob(job);
    setIsLogDialogOpen(true);
  };

  const getJobStats = () => {
    const totalJobs = cronJobs.length;
    const activeJobs = cronJobs.filter((job) => job.isActive).length;
    const runningJobs = cronJobs.filter((job) => job.isRunning).length;
    const failedJobs = cronJobs.filter(
      (job) => job.lastResult === "failed",
    ).length;

    return { totalJobs, activeJobs, runningJobs, failedJobs };
  };

  const stats = getJobStats();

  if (jobsLoading) {
    return (
      <div className="min-h-screen bg-slate-950 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-cyan-400">Loading cron jobs...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link
            href="/"
            className="text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Cron Job Management
        </h1>
        <p className="text-slate-400 mt-2">
          Enterprise-grade task scheduling and automation system
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-cyan-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-400">Total Jobs</p>
                <p className="text-2xl font-bold text-white">
                  {stats.totalJobs}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-400">
                  Active Jobs
                </p>
                <p className="text-2xl font-bold text-white">
                  {stats.activeJobs}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-blue-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-400">
                  Running Now
                </p>
                <p className="text-2xl font-bold text-white">
                  {stats.runningJobs}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-400">
                  Failed Jobs
                </p>
                <p className="text-2xl font-bold text-white">
                  {stats.failedJobs}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <TabsList className="bg-slate-900/50 border-slate-800">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-cyan-500/20"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="logs"
              className="data-[state=active]:bg-cyan-500/20"
            >
              Execution Logs
            </TabsTrigger>
          </TabsList>

          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600">
                <Plus className="h-4 w-4 mr-2" />
                Create Cron Job
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-800 max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-white">
                  Create New Cron Job
                </DialogTitle>
                <DialogDescription className="text-slate-400">
                  Set up a new automated task with custom scheduling and
                  execution parameters.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onCreateSubmit)}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Job Name</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="bg-slate-800 border-slate-700 text-white"
                              placeholder="Daily cleanup job"
                              data-testid="input-job-name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Category</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-slate-800 border-slate-700">
                              <SelectItem value="maintenance">
                                Maintenance
                              </SelectItem>
                              <SelectItem value="analytics">
                                Analytics
                              </SelectItem>
                              <SelectItem value="payments">Payments</SelectItem>
                              <SelectItem value="content">Content</SelectItem>
                              <SelectItem value="backup">Backup</SelectItem>
                              <SelectItem value="database">Database</SelectItem>
                              <SelectItem value="email">Email</SelectItem>
                              <SelectItem value="security">Security</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">
                          Description
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            className="bg-slate-800 border-slate-700 text-white"
                            placeholder="Brief description of what this job does"
                            data-testid="textarea-job-description"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="command"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Command</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="bg-slate-800 border-slate-700 text-white font-mono"
                            placeholder="node scripts/cleanup.js"
                            data-testid="input-job-command"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="schedule"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">
                            Cron Schedule
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="bg-slate-800 border-slate-700 text-white font-mono"
                              placeholder="0 2 * * *"
                              data-testid="input-job-schedule"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Priority</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                                <SelectValue placeholder="Select priority" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-slate-800 border-slate-700">
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="normal">Normal</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="critical">Critical</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="timeout"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">
                            Timeout (seconds)
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              className="bg-slate-800 border-slate-700 text-white"
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value))
                              }
                              data-testid="input-job-timeout"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="maxRetries"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">
                            Max Retries
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              className="bg-slate-800 border-slate-700 text-white"
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value))
                              }
                              data-testid="input-job-retries"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                      className="border-slate-700 text-white hover:bg-slate-800"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createJobMutation.isPending}
                      className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
                      data-testid="button-create-job"
                    >
                      {createJobMutation.isPending
                        ? "Creating..."
                        : "Create Job"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <TabsContent value="overview" className="space-y-6">
          {cronJobs.length === 0 ? (
            <Card className="bg-slate-900/50 border-slate-800">
              <CardContent className="p-12 text-center">
                <Clock className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">
                  No Cron Jobs Found
                </h3>
                <p className="text-slate-400 mb-6">
                  Get started by creating your first automated task.
                </p>
                <Button
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Cron Job
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {cronJobs.map((job) => (
                <Card
                  key={job.id}
                  className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-colors"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-slate-800">
                          {categoryIcons[
                            job.category as keyof typeof categoryIcons
                          ] || <Settings className="h-4 w-4" />}
                        </div>
                        <div>
                          <CardTitle className="text-white text-lg">
                            {job.name}
                          </CardTitle>
                          <CardDescription className="text-slate-400">
                            {job.description || "No description provided"}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={
                            priorityColors[
                              job.priority as keyof typeof priorityColors
                            ]
                          }
                        >
                          {job.priority}
                        </Badge>
                        {job.lastResult && (
                          <Badge
                            variant="outline"
                            className={
                              statusColors[
                                job.lastResult as keyof typeof statusColors
                              ]
                            }
                          >
                            {job.lastResult}
                          </Badge>
                        )}
                        {job.isRunning && (
                          <Badge
                            variant="outline"
                            className="bg-blue-500/10 text-blue-400 border-blue-200 animate-pulse"
                          >
                            Running
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-slate-400 mb-1">Command</p>
                        <p className="text-white font-mono text-sm bg-slate-800 p-2 rounded border">
                          {job.command}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400 mb-1">Schedule</p>
                        <p className="text-white font-mono text-sm">
                          {job.schedule}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400 mb-1">Last Run</p>
                        <p className="text-white text-sm">
                          {job.lastRunAt
                            ? format(
                                new Date(job.lastRunAt),
                                "MMM dd, yyyy HH:mm",
                              )
                            : "Never"}
                        </p>
                      </div>
                    </div>

                    {job.lastError && (
                      <div className="bg-red-500/10 border border-red-500/20 rounded p-3 mb-4">
                        <p className="text-red-400 text-sm font-medium mb-1">
                          Last Error:
                        </p>
                        <p className="text-red-300 text-sm font-mono">
                          {job.lastError}
                        </p>
                      </div>
                    )}

                    {job.lastOutput && (
                      <div className="bg-green-500/10 border border-green-500/20 rounded p-3 mb-4">
                        <p className="text-green-400 text-sm font-medium mb-1">
                          Last Output:
                        </p>
                        <p className="text-green-300 text-sm font-mono">
                          {job.lastOutput}
                        </p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={job.isActive}
                        onCheckedChange={(checked) =>
                          toggleJobMutation.mutate({
                            id: job.id,
                            isActive: checked,
                          })
                        }
                        disabled={toggleJobMutation.isPending}
                        data-testid={`switch-job-${job.id}`}
                      />
                      <span className="text-sm text-slate-400">
                        {job.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewLogs(job)}
                        className="border-slate-700 text-white hover:bg-slate-800"
                        data-testid={`button-logs-${job.id}`}
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        Logs
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => runJobMutation.mutate(job.id)}
                        disabled={job.isRunning || runJobMutation.isPending}
                        className="border-slate-700 text-white hover:bg-slate-800"
                        data-testid={`button-run-${job.id}`}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Run Now
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(job)}
                        className="border-slate-700 text-white hover:bg-slate-800"
                        data-testid={`button-edit-${job.id}`}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteJobMutation.mutate(job.id)}
                        disabled={deleteJobMutation.isPending}
                        className="border-red-700 text-red-400 hover:bg-red-900/20"
                        data-testid={`button-delete-${job.id}`}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          {logsLoading ? (
            <div className="text-center py-12">
              <div className="text-cyan-400">Loading execution logs...</div>
            </div>
          ) : cronLogs.length === 0 ? (
            <Card className="bg-slate-900/50 border-slate-800">
              <CardContent className="p-12 text-center">
                <FileText className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">
                  No Execution Logs
                </h3>
                <p className="text-slate-400">
                  Execution logs will appear here after jobs start running.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {cronLogs.map((log) => {
                const job = cronJobs.find((j) => j.id === log.jobId);
                return (
                  <Card
                    key={log.id}
                    className="bg-slate-900/50 border-slate-800"
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-white text-lg">
                            {job?.name || "Unknown Job"}
                          </CardTitle>
                          <CardDescription className="text-slate-400">
                            Started:{" "}
                            {format(
                              new Date(log.startedAt),
                              "MMM dd, yyyy HH:mm:ss",
                            )}
                            {log.completedAt && (
                              <>
                                {" "}
                                • Completed:{" "}
                                {format(
                                  new Date(log.completedAt),
                                  "MMM dd, yyyy HH:mm:ss",
                                )}
                              </>
                            )}
                            {log.duration && (
                              <>
                                {" "}
                                • Duration: {(log.duration / 1000).toFixed(2)}s
                              </>
                            )}
                          </CardDescription>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            statusColors[
                              log.status as keyof typeof statusColors
                            ]
                          }
                        >
                          {log.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {log.output && (
                        <div className="bg-slate-800 rounded p-4 mb-4">
                          <p className="text-green-400 text-sm font-medium mb-2">
                            Output:
                          </p>
                          <pre className="text-green-300 text-sm font-mono whitespace-pre-wrap">
                            {log.output}
                          </pre>
                        </div>
                      )}
                      {log.errorOutput && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded p-4">
                          <p className="text-red-400 text-sm font-medium mb-2">
                            Error Output:
                          </p>
                          <pre className="text-red-300 text-sm font-mono whitespace-pre-wrap">
                            {log.errorOutput}
                          </pre>
                        </div>
                      )}
                      {log.memoryUsage && (
                        <div className="flex items-center gap-4 mt-4 text-sm text-slate-400">
                          <span>
                            Memory: {(log.memoryUsage / 1024 / 1024).toFixed(2)}{" "}
                            MB
                          </span>
                          {log.cpuUsage && <span>CPU: {log.cpuUsage}%</span>}
                          {log.exitCode !== null && (
                            <span>Exit Code: {log.exitCode}</span>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Job Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Cron Job</DialogTitle>
            <DialogDescription className="text-slate-400">
              Modify the cron job settings and execution parameters.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(onEditSubmit)}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Job Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="bg-slate-800 border-slate-700 text-white"
                          data-testid="input-edit-job-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          <SelectItem value="maintenance">
                            Maintenance
                          </SelectItem>
                          <SelectItem value="analytics">Analytics</SelectItem>
                          <SelectItem value="payments">Payments</SelectItem>
                          <SelectItem value="content">Content</SelectItem>
                          <SelectItem value="backup">Backup</SelectItem>
                          <SelectItem value="database">Database</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="security">Security</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        className="bg-slate-800 border-slate-700 text-white"
                        data-testid="textarea-edit-job-description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="command"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Command</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="bg-slate-800 border-slate-700 text-white font-mono"
                        data-testid="input-edit-job-command"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="schedule"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">
                        Cron Schedule
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="bg-slate-800 border-slate-700 text-white font-mono"
                          data-testid="input-edit-job-schedule"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Priority</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="timeout"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">
                        Timeout (seconds)
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          className="bg-slate-800 border-slate-700 text-white"
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
                          data-testid="input-edit-job-timeout"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="maxRetries"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Max Retries</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          className="bg-slate-800 border-slate-700 text-white"
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
                          data-testid="input-edit-job-retries"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  className="border-slate-700 text-white hover:bg-slate-800"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateJobMutation.isPending}
                  className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
                  data-testid="button-update-job"
                >
                  {updateJobMutation.isPending ? "Updating..." : "Update Job"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* View Logs Dialog */}
      <Dialog open={isLogDialogOpen} onOpenChange={setIsLogDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-white">
              Execution Logs: {selectedJob?.name}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Recent execution history and output logs for this cron job.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto space-y-4">
            {selectedJob &&
              cronLogs
                .filter((log) => log.jobId === selectedJob.id)
                .slice(0, 10)
                .map((log) => (
                  <div key={log.id} className="bg-slate-800 rounded p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">
                        {format(
                          new Date(log.startedAt),
                          "MMM dd, yyyy HH:mm:ss",
                        )}
                      </span>
                      <Badge
                        variant="outline"
                        className={
                          statusColors[log.status as keyof typeof statusColors]
                        }
                      >
                        {log.status}
                      </Badge>
                    </div>
                    {log.output && (
                      <div className="bg-slate-900 rounded p-3 mb-2">
                        <p className="text-green-400 text-sm font-medium mb-1">
                          Output:
                        </p>
                        <pre className="text-green-300 text-xs font-mono whitespace-pre-wrap">
                          {log.output}
                        </pre>
                      </div>
                    )}
                    {log.errorOutput && (
                      <div className="bg-red-500/10 border border-red-500/20 rounded p-3">
                        <p className="text-red-400 text-sm font-medium mb-1">
                          Error:
                        </p>
                        <pre className="text-red-300 text-xs font-mono whitespace-pre-wrap">
                          {log.errorOutput}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
          </div>
          <DialogFooter>
            <Button
              onClick={() => setIsLogDialogOpen(false)}
              className="bg-slate-700 hover:bg-slate-600 text-white"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
