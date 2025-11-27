import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Mail,
  Send,
  Plus,
  Edit,
  Trash2,
  Eye,
  Copy,
  Search,
  Filter,
  BarChart3,
  Settings,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface EmailTemplate {
  id: string;
  templateName: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  variables: string[];
  isActive: boolean;
  category: "auth" | "notification" | "marketing" | "system";
  createdAt: string;
  updatedAt: string;
}

interface EmailLog {
  id: string;
  recipientEmail: string;
  recipientName?: string;
  templateId?: string;
  templateName?: string;
  subject: string;
  status: "pending" | "sent" | "delivered" | "failed" | "bounced";
  provider: string;
  sentAt?: string;
  deliveredAt?: string;
  openedAt?: string;
  clickedAt?: string;
  errorMessage?: string;
  createdAt: string;
}

export default function EmailManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTemplate, setSelectedTemplate] =
    useState<EmailTemplate | null>(null);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch email templates from API
  const { data: emailTemplates = [], isLoading: templatesLoading } = useQuery<EmailTemplate[]>({
    queryKey: ["/api/admin/email-templates"],
    refetchInterval: 60000,
  });

  // Fetch email logs from API
  const { data: emailLogs = [], isLoading: logsLoading } = useQuery<EmailLog[]>({
    queryKey: ["/api/admin/email-logs"],
    refetchInterval: 30000,
  });

  // Removed mock data - now using API data above
  const _emailTemplates_removed: EmailTemplate[] = [
    {
      id: "1",
      templateName: "Welcome Email",
      subject: "Welcome to {{site_name}}!",
      htmlContent: `
        <h1>Welcome {{user_name}}!</h1>
        <p>Thank you for joining {{site_name}}. We're excited to have you on board.</p>
        <p>To get started, please verify your email address by clicking the button below:</p>
        <a href="{{verification_url}}" style="background: #3869D4; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
      `,
      textContent:
        "Welcome {{user_name}}! Thank you for joining {{site_name}}.",
      variables: ["user_name", "site_name", "verification_url"],
      isActive: true,
      category: "auth",
      createdAt: "2025-01-10T10:00:00Z",
      updatedAt: "2025-01-15T14:30:00Z",
    },
    {
      id: "2",
      templateName: "Password Reset",
      subject: "Reset Your Password - {{site_name}}",
      htmlContent: `
        <h1>Password Reset Request</h1>
        <p>Hi {{user_name}},</p>
        <p>You requested a password reset for your account. Click the button below to reset your password:</p>
        <a href="{{reset_url}}" style="background: #3869D4; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>If you didn't request this, please ignore this email.</p>
      `,
      variables: ["user_name", "site_name", "reset_url"],
      isActive: true,
      category: "auth",
      createdAt: "2025-01-10T10:00:00Z",
      updatedAt: "2025-01-15T14:30:00Z",
    },
    {
      id: "3",
      templateName: "Email Verification",
      subject: "Verify Your Email Address - {{site_name}}",
      htmlContent: `
        <h1>Verify Your Email Address</h1>
        <p>Welcome to {{site_name}}!</p>
        <p>Please click the link below to verify your email address:</p>
        <a href="{{verification_url}}" style="background: #3869D4; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
        <p>Or copy and paste this URL: {{verification_url}}</p>
      `,
      variables: ["site_name", "verification_url"],
      isActive: true,
      category: "auth",
      createdAt: "2025-01-10T10:00:00Z",
      updatedAt: "2025-01-15T14:30:00Z",
    },
    {
      id: "4",
      templateName: "Withdrawal Processed",
      subject: "Your withdrawal has been processed",
      htmlContent: `
        <h1>Hello {{user_name}}</h1>
        <p>Your withdrawal request for <strong>{{amount}}</strong> has been successfully processed and sent to your account.</p>
        <p>Thank you for using our platform!</p>
      `,
      variables: ["user_name", "amount"],
      isActive: true,
      category: "notification",
      createdAt: "2025-01-12T15:00:00Z",
      updatedAt: "2025-01-12T15:00:00Z",
    },
    {
      id: "5",
      templateName: "Withdrawal Rejected",
      subject: "Your withdrawal has been rejected",
      htmlContent: `
        <h1>Hello {{user_name}}</h1>
        <p>Unfortunately, your withdrawal request has been rejected for the following reason:</p>
        <p><em>{{rejection_reason}}</em></p>
        <p>Please review the reason and contact support if you need assistance.</p>
      `,
      variables: ["user_name", "rejection_reason"],
      isActive: true,
      category: "notification",
      createdAt: "2025-01-12T15:00:00Z",
      updatedAt: "2025-01-12T15:00:00Z",
    },
    {
      id: "6",
      templateName: "Transfer Verification",
      subject: "Transfer Verification Required",
      htmlContent: `
        <h1>Hello {{user_name}}</h1>
        <p>{{message_body}}</p>
        <p>{{action_link}}</p>
        <p>If you need assistance, please contact our support team.</p>
      `,
      variables: ["user_name", "message_body", "action_link"],
      isActive: true,
      category: "system",
      createdAt: "2025-01-12T15:00:00Z",
      updatedAt: "2025-01-12T15:00:00Z",
    },
    {
      id: "7",
      templateName: "New Subscriber Notification",
      subject: "You have a new subscriber!",
      htmlContent: `
        <h1>Great news, {{creator_name}}!</h1>
        <p>{{subscriber_name}} just subscribed to your content.</p>
        <p>You now have {{total_subscribers}} total subscribers.</p>
        <a href="{{subscribers_url}}" style="background: #3869D4; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Subscribers</a>
      `,
      variables: [
        "creator_name",
        "subscriber_name",
        "total_subscribers",
        "subscribers_url",
      ],
      isActive: true,
      category: "notification",
      createdAt: "2025-01-12T15:00:00Z",
      updatedAt: "2025-01-12T15:00:00Z",
    },
  ];

  // Removed mock data - now fetching from API
  const _emailLogs_removed: EmailLog[] = [
    {
      id: "1",
      recipientEmail: "user@example.com",
      recipientName: "John Doe",
      templateId: "1",
      templateName: "Welcome Email",
      subject: "Welcome to FanzDash!",
      status: "delivered",
      provider: "sendgrid",
      sentAt: "2025-01-15T10:30:00Z",
      deliveredAt: "2025-01-15T10:31:00Z",
      openedAt: "2025-01-15T11:00:00Z",
      createdAt: "2025-01-15T10:30:00Z",
    },
    {
      id: "2",
      recipientEmail: "creator@example.com",
      recipientName: "Sarah Model",
      templateId: "3",
      templateName: "New Subscriber Notification",
      subject: "You have a new subscriber!",
      status: "sent",
      provider: "sendgrid",
      sentAt: "2025-01-15T12:00:00Z",
      createdAt: "2025-01-15T12:00:00Z",
    },
    {
      id: "3",
      recipientEmail: "failed@example.com",
      subject: "Password Reset Request",
      status: "failed",
      provider: "sendgrid",
      errorMessage: "Invalid email address",
      createdAt: "2025-01-15T14:00:00Z",
    },
  ];

  const createTemplateMutation = useMutation({
    mutationFn: (data: any) =>
      apiRequest("/api/admin/email-templates", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/admin/email-templates"],
      });
      toast({ title: "Template created successfully" });
      setIsTemplateDialogOpen(false);
    },
  });

  const filteredTemplates = emailTemplates.filter((template) => {
    const matchesSearch =
      !searchQuery ||
      template.templateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.subject.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || template.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: {
        variant: "outline" as const,
        color: "text-yellow-600",
        icon: Clock,
      },
      sent: { variant: "default" as const, color: "text-blue-600", icon: Send },
      delivered: {
        variant: "default" as const,
        color: "text-green-600",
        icon: CheckCircle,
      },
      failed: {
        variant: "destructive" as const,
        color: "text-red-600",
        icon: XCircle,
      },
      bounced: {
        variant: "destructive" as const,
        color: "text-orange-600",
        icon: AlertTriangle,
      },
    };

    const config = variants[status as keyof typeof variants];
    if (!config) return <Badge variant="secondary">{status}</Badge>;

    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center space-x-1">
        <Icon className="h-3 w-3" />
        <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
      </Badge>
    );
  };

  const getStats = () => {
    const totalEmails = emailLogs.length;
    const deliveredEmails = emailLogs.filter(
      (log) => log.status === "delivered",
    ).length;
    const failedEmails = emailLogs.filter(
      (log) => log.status === "failed" || log.status === "bounced",
    ).length;
    const deliveryRate =
      totalEmails > 0 ? Math.round((deliveredEmails / totalEmails) * 100) : 0;

    return { totalEmails, deliveredEmails, failedEmails, deliveryRate };
  };

  const stats = getStats();

  return (
    <div
      className="container mx-auto p-6 space-y-6"
      data-testid="email-management"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold cyber-text-glow">
            Email Management
          </h1>
          <p className="text-muted-foreground">
            Manage email templates, send campaigns, and monitor delivery
          </p>
        </div>
        <Dialog
          open={isTemplateDialogOpen}
          onOpenChange={setIsTemplateDialogOpen}
        >
          <DialogTrigger asChild>
            <Button data-testid="button-new-template">
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Email Template</DialogTitle>
              <DialogDescription>
                Create a new email template with dynamic variables
              </DialogDescription>
            </DialogHeader>
            {/* Template creation form would go here */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Template Name</Label>
                  <Input placeholder="Enter template name" />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auth">Authentication</SelectItem>
                      <SelectItem value="notification">Notification</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Subject Line</Label>
                <Input placeholder="Email subject with {{variables}}" />
              </div>
              <div className="space-y-2">
                <Label>HTML Content</Label>
                <Textarea
                  placeholder="HTML email content with {{variables}}"
                  className="min-h-[200px]"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsTemplateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button>Create Template</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="cyber-border">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Mail className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm font-medium">Total Emails</p>
                <p className="text-2xl font-bold">{stats.totalEmails}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cyber-border">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm font-medium">Delivered</p>
                <p className="text-2xl font-bold">{stats.deliveredEmails}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cyber-border">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-sm font-medium">Failed</p>
                <p className="text-2xl font-bold">{stats.failedEmails}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cyber-border">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Delivery Rate</p>
                <p className="text-2xl font-bold">{stats.deliveryRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="templates" className="space-y-4">
        <TabsList>
          <TabsTrigger value="templates">Email Templates</TabsTrigger>
          <TabsTrigger value="logs">Email Logs</TabsTrigger>
          <TabsTrigger value="settings">Email Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <Card className="cyber-border">
            <CardHeader>
              <CardTitle>
                Email Templates ({filteredTemplates.length})
              </CardTitle>
              <CardDescription>
                Manage reusable email templates with dynamic variables
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filter Controls */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-templates"
                  />
                </div>

                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger
                    className="w-[180px]"
                    data-testid="select-category-filter"
                  >
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="auth">Authentication</SelectItem>
                    <SelectItem value="notification">Notification</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Templates Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTemplates.map((template) => (
                  <Card key={template.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold">
                            {template.templateName}
                          </h3>
                          <p className="text-sm text-muted-foreground truncate">
                            {template.subject}
                          </p>
                        </div>
                        <div className="flex items-center space-x-1 ml-2">
                          <Badge
                            variant={
                              template.category === "auth"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {template.category}
                          </Badge>
                          <Switch checked={template.isActive} />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                        <span>{template.variables.length} variables</span>
                        <span>
                          {new Date(template.updatedAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="h-3 w-3 mr-1" />
                          Preview
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card className="cyber-border">
            <CardHeader>
              <CardTitle>Email Logs</CardTitle>
              <CardDescription>
                Monitor email delivery status and performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Recipient</TableHead>
                      <TableHead>Template</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Sent</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {emailLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {log.recipientName || "Unknown"}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {log.recipientEmail}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {log.templateName ? (
                            <Badge variant="outline">{log.templateName}</Badge>
                          ) : (
                            <span className="text-muted-foreground">
                              Custom
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {log.subject}
                        </TableCell>
                        <TableCell>{getStatusBadge(log.status)}</TableCell>
                        <TableCell className="capitalize">
                          {log.provider}
                        </TableCell>
                        <TableCell>
                          {log.sentAt
                            ? new Date(log.sentAt).toLocaleString()
                            : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card className="cyber-border">
            <CardHeader>
              <CardTitle>Email Settings</CardTitle>
              <CardDescription>
                Configure email providers and delivery settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">
                      SendGrid Configuration
                    </h3>
                    <div className="space-y-2">
                      <Label>API Key</Label>
                      <Input
                        type="password"
                        placeholder="Enter SendGrid API key"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>From Email</Label>
                      <Input placeholder="noreply@yourdomain.com" />
                    </div>
                    <div className="space-y-2">
                      <Label>From Name</Label>
                      <Input placeholder="Your Platform Name" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Delivery Settings</h3>
                    <div className="flex items-center justify-between">
                      <Label>Enable Email Notifications</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Track Email Opens</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Track Link Clicks</Label>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>

                <Button>Save Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
