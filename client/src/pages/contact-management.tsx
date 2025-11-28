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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  MessageSquare,
  Search,
  Filter,
  Reply,
  Archive,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  Star,
  Send,
  User,
  Mail,
  Calendar,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "new" | "read" | "replied" | "resolved" | "archived";
  priority: "low" | "normal" | "high" | "urgent";
  assignedTo?: string;
  assignedToName?: string;
  responseMessage?: string;
  respondedAt?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  updatedAt: string;
}

export default function ContactManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(
    null,
  );
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch contact messages from API
  const { data: contactMessages = [], isLoading } = useQuery<ContactMessage[]>({
    queryKey: ["/api/admin/contact-messages", statusFilter, priorityFilter],
    refetchInterval: 30000,
  });

  // Removed mock data - now using API data above
  const _contactMessages_removed: ContactMessage[] = [
    {
      id: "1",
      name: "Jane Smith",
      email: "jane@example.com",
      subject: "Account verification issue",
      message:
        "I'm having trouble verifying my account. The verification email never arrived and I've tried multiple times. Could you please help me resolve this issue?",
      status: "new",
      priority: "high",
      ipAddress: "192.168.1.100",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      createdAt: "2025-01-15T16:30:00Z",
      updatedAt: "2025-01-15T16:30:00Z",
    },
    {
      id: "2",
      name: "Mike Wilson",
      email: "mike@example.com",
      subject: "Payment processing question",
      message:
        "When will my withdrawal be processed? It's been 5 days since I submitted the request and haven't heard anything back.",
      status: "replied",
      priority: "normal",
      assignedTo: "admin1",
      assignedToName: "Admin User",
      responseMessage:
        "Your withdrawal has been processed and should appear in your account within 1-2 business days. Thank you for your patience.",
      respondedAt: "2025-01-14T16:30:00Z",
      createdAt: "2025-01-14T14:00:00Z",
      updatedAt: "2025-01-14T16:30:00Z",
    },
    {
      id: "3",
      name: "Sarah Johnson",
      email: "sarah@example.com",
      subject: "Feature request: Dark mode",
      message:
        "It would be great if you could add a dark mode option to the platform. Many users prefer dark themes, especially when working late hours.",
      status: "read",
      priority: "low",
      assignedTo: "admin1",
      assignedToName: "Admin User",
      createdAt: "2025-01-13T10:15:00Z",
      updatedAt: "2025-01-13T11:00:00Z",
    },
    {
      id: "4",
      name: "Alex Thompson",
      email: "alex@example.com",
      subject: "Billing discrepancy",
      message:
        "I noticed a charge on my account that I don't recognize. The amount is $29.99 and was charged yesterday. Can you please investigate?",
      status: "new",
      priority: "urgent",
      createdAt: "2025-01-15T09:45:00Z",
      updatedAt: "2025-01-15T09:45:00Z",
    },
    {
      id: "5",
      name: "Emily Davis",
      email: "emily@example.com",
      subject: "Content upload problems",
      message:
        "I'm experiencing issues uploading videos. The upload process gets stuck at 50% every time. This has been happening for the past two days.",
      status: "resolved",
      priority: "high",
      assignedTo: "admin2",
      assignedToName: "Tech Support",
      responseMessage:
        "We've identified and fixed the upload issue. Please try uploading again. If you continue to experience problems, please let us know.",
      respondedAt: "2025-01-12T15:20:00Z",
      createdAt: "2025-01-12T08:30:00Z",
      updatedAt: "2025-01-12T15:20:00Z",
    },
  ];

  const updateMessageMutation = useMutation({
    mutationFn: (data: { messageId: string; updates: any }) =>
      apiRequest(
        `/api/admin/contact-messages/${data.messageId}`,
        "PATCH",
        data.updates,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/admin/contact-messages"],
      });
      toast({ title: "Message updated successfully" });
    },
  });

  const replyMutation = useMutation({
    mutationFn: (data: { messageId: string; reply: string }) =>
      apiRequest(
        `/api/admin/contact-messages/${data.messageId}/reply`,
        "POST",
        { response: data.reply },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/admin/contact-messages"],
      });
      toast({ title: "Reply sent successfully" });
      setIsReplyDialogOpen(false);
      setReplyMessage("");
      setSelectedMessage(null);
    },
  });

  const filteredMessages = contactMessages.filter((message) => {
    const matchesSearch =
      !searchQuery ||
      message.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.message.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || message.status === statusFilter;
    const matchesPriority =
      priorityFilter === "all" || message.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      new: { variant: "default" as const, color: "text-blue-600", icon: Star },
      read: { variant: "outline" as const, color: "text-gray-600", icon: Eye },
      replied: {
        variant: "default" as const,
        color: "text-green-600",
        icon: Reply,
      },
      resolved: {
        variant: "default" as const,
        color: "text-green-600",
        icon: CheckCircle,
      },
      archived: {
        variant: "secondary" as const,
        color: "text-gray-500",
        icon: Archive,
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

  const getPriorityBadge = (priority: string) => {
    const variants = {
      low: "secondary",
      normal: "outline",
      high: "destructive",
      urgent: "destructive",
    } as const;

    return (
      <Badge
        variant={variants[priority as keyof typeof variants] || "secondary"}
      >
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };

  const handleStatusChange = (messageId: string, status: string) => {
    updateMessageMutation.mutate({ messageId, updates: { status } });
  };

  const handleReply = () => {
    if (!selectedMessage || !replyMessage.trim()) return;

    replyMutation.mutate({
      messageId: selectedMessage.id,
      reply: replyMessage.trim(),
    });
  };

  const getStats = () => {
    const totalMessages = contactMessages.length;
    const newMessages = contactMessages.filter(
      (m) => m.status === "new",
    ).length;
    const pendingMessages = contactMessages.filter(
      (m) => m.status === "new" || m.status === "read",
    ).length;
    const resolvedMessages = contactMessages.filter(
      (m) => m.status === "resolved",
    ).length;

    return { totalMessages, newMessages, pendingMessages, resolvedMessages };
  };

  const stats = getStats();

  return (
    <div
      className="container mx-auto p-6 space-y-6"
      data-testid="contact-management"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold cyber-text-glow">
            Contact Management
          </h1>
          <p className="text-muted-foreground">
            Manage customer support requests and communications
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="cyber-border">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm font-medium">Total Messages</p>
                <p className="text-2xl font-bold">{stats.totalMessages}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cyber-border">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm font-medium">New Messages</p>
                <p className="text-2xl font-bold">{stats.newMessages}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cyber-border">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">Pending</p>
                <p className="text-2xl font-bold">{stats.pendingMessages}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cyber-border">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm font-medium">Resolved</p>
                <p className="text-2xl font-bold">{stats.resolvedMessages}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="cyber-border">
        <CardHeader>
          <CardTitle>Contact Messages ({filteredMessages.length})</CardTitle>
          <CardDescription>
            Manage and respond to customer inquiries and support requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filter Controls */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-messages"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger
                className="w-[180px]"
                data-testid="select-status-filter"
              >
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="read">Read</SelectItem>
                <SelectItem value="replied">Replied</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger
                className="w-[180px]"
                data-testid="select-priority-filter"
              >
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Messages Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contact</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMessages.map((message) => (
                  <TableRow
                    key={message.id}
                    className={message.status === "new" ? "bg-blue-50" : ""}
                  >
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gray-100 rounded-full">
                          <User className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <div className="font-medium">{message.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {message.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[250px]">
                        <div className="font-medium truncate">
                          {message.subject}
                        </div>
                        <div className="text-sm text-muted-foreground truncate">
                          {message.message}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getPriorityBadge(message.priority)}</TableCell>
                    <TableCell>{getStatusBadge(message.status)}</TableCell>
                    <TableCell>
                      {message.assignedToName ? (
                        <span className="text-sm">
                          {message.assignedToName}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">
                          Unassigned
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(message.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(message.createdAt).toLocaleTimeString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedMessage(message)}
                              data-testid={`button-view-${message.id}`}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Contact Message Details</DialogTitle>
                              <DialogDescription>
                                Message from {message.name} ({message.email})
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label>Subject</Label>
                                  <p className="text-sm font-medium">
                                    {message.subject}
                                  </p>
                                </div>
                                <div className="space-y-2">
                                  <Label>Priority</Label>
                                  {getPriorityBadge(message.priority)}
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label>Message</Label>
                                <div className="p-3 bg-gray-50 rounded-md">
                                  <p className="text-sm">{message.message}</p>
                                </div>
                              </div>

                              {message.responseMessage && (
                                <div className="space-y-2">
                                  <Label>Response</Label>
                                  <div className="p-3 bg-green-50 rounded-md">
                                    <p className="text-sm">
                                      {message.responseMessage}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-2">
                                      Replied by {message.assignedToName} on{" "}
                                      {message.respondedAt &&
                                        new Date(
                                          message.respondedAt,
                                        ).toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                              )}

                              <div className="flex justify-between">
                                <div className="flex space-x-2">
                                  <Select
                                    value={message.status}
                                    onValueChange={(status) =>
                                      handleStatusChange(message.id, status)
                                    }
                                  >
                                    <SelectTrigger className="w-[140px]">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="new">New</SelectItem>
                                      <SelectItem value="read">Read</SelectItem>
                                      <SelectItem value="replied">
                                        Replied
                                      </SelectItem>
                                      <SelectItem value="resolved">
                                        Resolved
                                      </SelectItem>
                                      <SelectItem value="archived">
                                        Archived
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                {message.status !== "resolved" &&
                                  message.status !== "archived" && (
                                    <Button
                                      onClick={() => {
                                        setSelectedMessage(message);
                                        setIsReplyDialogOpen(true);
                                      }}
                                    >
                                      <Reply className="h-4 w-4 mr-2" />
                                      Reply
                                    </Button>
                                  )}
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Reply Dialog */}
      <Dialog open={isReplyDialogOpen} onOpenChange={setIsReplyDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Reply to Message</DialogTitle>
            <DialogDescription>
              {selectedMessage &&
                `Replying to ${selectedMessage.name} (${selectedMessage.email})`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedMessage && (
              <div className="p-3 bg-gray-50 rounded-md">
                <p className="text-sm font-medium mb-2">Original Message:</p>
                <p className="text-sm">{selectedMessage.message}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="reply">Your Response</Label>
              <Textarea
                id="reply"
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Type your response..."
                className="min-h-[120px]"
                data-testid="textarea-reply"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsReplyDialogOpen(false)}
                data-testid="button-cancel-reply"
              >
                Cancel
              </Button>
              <Button
                onClick={handleReply}
                disabled={replyMutation.isPending || !replyMessage.trim()}
                data-testid="button-send-reply"
              >
                <Send className="h-4 w-4 mr-2" />
                {replyMutation.isPending ? "Sending..." : "Send Reply"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
