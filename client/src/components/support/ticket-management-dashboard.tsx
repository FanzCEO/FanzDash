import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Search,
  Filter,
  MoreHorizontal,
  Clock,
  User,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Flag,
  ArrowUp,
  ArrowDown,
  Tag,
  Calendar,
  Users,
  HeadphonesIcon,
  BarChart3,
  Plus,
  Send,
  Paperclip,
  Star,
  Timer,
  Eye,
  Archive,
  UserCheck,
  Settings,
  Zap,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface SupportTicket {
  id: string;
  ticketNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerAvatar?: string;
  assignedAgentId?: string;
  assignedAgentName?: string;
  departmentId: string;
  departmentName: string;
  categoryId: string;
  categoryName: string;
  subject: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "pending" | "resolved" | "closed";
  source: string;
  tags: string[];
  messageCount: number;
  lastMessageAt: string;
  firstResponseAt?: string;
  resolvedAt?: string;
  dueDate?: string;
  satisfactionRating?: number;
  createdAt: string;
  updatedAt: string;
}

interface TicketMessage {
  id: string;
  ticketId: string;
  authorId: string;
  authorName: string;
  authorType: "customer" | "agent" | "system";
  authorAvatar?: string;
  message: string;
  messageType: "reply" | "note" | "status_change";
  attachments: Array<{
    id: string;
    name: string;
    url: string;
    size: number;
    type: string;
  }>;
  isInternal: boolean;
  createdAt: string;
}

interface Department {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
}

interface Agent {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  departmentId: string;
  role: string;
  isOnline: boolean;
  currentTickets: number;
  maxTickets: number;
}

interface TicketManagementDashboardProps {
  tickets: SupportTicket[];
  agents: Agent[];
  departments: Department[];
  onAssignTicket: (ticketId: string, agentId: string) => Promise<void>;
  onUpdateTicketStatus: (ticketId: string, status: string) => Promise<void>;
  onUpdateTicketPriority: (ticketId: string, priority: string) => Promise<void>;
  onAddTicketMessage: (
    ticketId: string,
    message: string,
    isInternal: boolean,
  ) => Promise<void>;
  onLoadTicketMessages: (ticketId: string) => Promise<TicketMessage[]>;
  currentUser: {
    id: string;
    name: string;
    role: string;
    departmentId?: string;
  };
  stats: {
    totalTickets: number;
    openTickets: number;
    pendingTickets: number;
    resolvedTickets: number;
    avgResponseTime: number;
    avgResolutionTime: number;
  };
  className?: string;
}

export function TicketManagementDashboard({
  tickets,
  agents,
  departments,
  onAssignTicket,
  onUpdateTicketStatus,
  onUpdateTicketPriority,
  onAddTicketMessage,
  onLoadTicketMessages,
  currentUser,
  stats,
  className = "",
}: TicketManagementDashboardProps) {
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(
    null,
  );
  const [ticketMessages, setTicketMessages] = useState<TicketMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [newMessage, setNewMessage] = useState("");
  const [messageType, setMessageType] = useState<"reply" | "note">("reply");
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSubmittingMessage, setIsSubmittingMessage] = useState(false);

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || ticket.status === filterStatus;
    const matchesPriority =
      filterPriority === "all" || ticket.priority === filterPriority;
    const matchesDepartment =
      filterDepartment === "all" || ticket.departmentId === filterDepartment;

    // Role-based filtering
    const canView =
      currentUser.role === "admin" ||
      currentUser.role === "supervisor" ||
      ticket.departmentId === currentUser.departmentId ||
      ticket.assignedAgentId === currentUser.id;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesPriority &&
      matchesDepartment &&
      canView
    );
  });

  const loadTicketMessages = async (ticket: SupportTicket) => {
    setIsLoadingMessages(true);
    try {
      const messages = await onLoadTicketMessages(ticket.id);
      setTicketMessages(messages);
    } catch (error) {
      console.error("Failed to load ticket messages:", error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleTicketSelect = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    loadTicketMessages(ticket);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket) return;

    setIsSubmittingMessage(true);
    try {
      await onAddTicketMessage(
        selectedTicket.id,
        newMessage,
        messageType === "note",
      );
      setNewMessage("");
      await loadTicketMessages(selectedTicket); // Reload messages
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSubmittingMessage(false);
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return (
          <Badge variant="destructive" className="animate-pulse">
            <Flag className="h-3 w-3 mr-1" />
            Urgent
          </Badge>
        );
      case "high":
        return (
          <Badge variant="destructive">
            <ArrowUp className="h-3 w-3 mr-1" />
            High
          </Badge>
        );
      case "medium":
        return (
          <Badge className="bg-yellow-500">
            <ArrowUp className="h-3 w-3 mr-1" />
            Medium
          </Badge>
        );
      case "low":
        return (
          <Badge variant="secondary">
            <ArrowDown className="h-3 w-3 mr-1" />
            Low
          </Badge>
        );
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return (
          <Badge className="bg-blue-500">
            <Clock className="h-3 w-3 mr-1" />
            Open
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-500">
            <Timer className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "resolved":
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            Resolved
          </Badge>
        );
      case "closed":
        return (
          <Badge variant="outline">
            <Archive className="h-3 w-3 mr-1" />
            Closed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const TicketCard = ({ ticket }: { ticket: SupportTicket }) => (
    <Card
      className={`cursor-pointer hover:shadow-lg transition-all duration-300 border-l-4 ${
        ticket.priority === "urgent"
          ? "border-l-red-500"
          : ticket.priority === "high"
            ? "border-l-orange-500"
            : ticket.priority === "medium"
              ? "border-l-yellow-500"
              : "border-l-blue-500"
      } ${selectedTicket?.id === ticket.id ? "ring-2 ring-primary bg-primary/5" : ""}`}
      onClick={() => handleTicketSelect(ticket)}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
                #{ticket.ticketNumber}
              </span>
              {getPriorityBadge(ticket.priority)}
              {getStatusBadge(ticket.status)}
            </div>

            <div className="flex items-center space-x-1">
              {ticket.tags.slice(0, 2).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {ticket.tags.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{ticket.tags.length - 2}
                </Badge>
              )}
            </div>
          </div>

          {/* Subject */}
          <h3 className="font-semibold text-lg line-clamp-2">
            {ticket.subject}
          </h3>

          {/* Customer Info */}
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={ticket.customerAvatar} />
              <AvatarFallback>{ticket.customerName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{ticket.customerName}</p>
              <p className="text-xs text-muted-foreground truncate">
                {ticket.customerEmail}
              </p>
            </div>
          </div>

          {/* Assignment & Department */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <UserCheck className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {ticket.assignedAgentName || "Unassigned"}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {ticket.departmentName}
              </span>
            </div>
          </div>

          {/* Stats & Time */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <span>{ticket.messageCount}</span>
              </div>
              {ticket.satisfactionRating && (
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span>{ticket.satisfactionRating}/5</span>
                </div>
              )}
            </div>
            <div className="text-muted-foreground">
              {formatDistanceToNow(new Date(ticket.lastMessageAt), {
                addSuffix: true,
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const MessageBubble = ({ message }: { message: TicketMessage }) => (
    <div
      className={`flex space-x-3 mb-4 ${message.authorType === "customer" ? "flex-row" : "flex-row-reverse"}`}
    >
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarImage src={message.authorAvatar} />
        <AvatarFallback>{message.authorName.charAt(0)}</AvatarFallback>
      </Avatar>

      <div
        className={`flex-1 ${message.authorType === "customer" ? "text-left" : "text-right"}`}
      >
        <div className="flex items-center space-x-2 mb-1">
          <span className="font-semibold text-sm">{message.authorName}</span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(message.createdAt), {
              addSuffix: true,
            })}
          </span>
          {message.isInternal && (
            <Badge variant="outline" className="text-xs">
              Internal Note
            </Badge>
          )}
        </div>

        <div
          className={`rounded-lg p-3 ${
            message.authorType === "customer"
              ? "bg-muted"
              : message.isInternal
                ? "bg-yellow-100 border border-yellow-200"
                : "bg-primary text-primary-foreground"
          }`}
        >
          <p className="whitespace-pre-wrap">{message.message}</p>

          {message.attachments.length > 0 && (
            <div className="mt-2 space-y-1">
              {message.attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center space-x-2 text-sm"
                >
                  <Paperclip className="h-3 w-3" />
                  <a
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    {attachment.name} (
                    {(attachment.size / 1024 / 1024).toFixed(2)} MB)
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className={`h-screen flex flex-col ${className}`}>
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center space-x-3">
              <HeadphonesIcon className="h-8 w-8 text-primary" />
              <span>Support Dashboard</span>
            </h1>
            <p className="text-muted-foreground">
              Manage and respond to customer support tickets
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <Button className="bg-gradient-to-r from-primary to-purple-600">
              <Plus className="h-4 w-4 mr-2" />
              New Ticket
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-4">
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {stats.totalTickets}
              </div>
              <div className="text-xs text-muted-foreground">Total</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-green-600">
                {stats.openTickets}
              </div>
              <div className="text-xs text-muted-foreground">Open</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {stats.pendingTickets}
              </div>
              <div className="text-xs text-muted-foreground">Pending</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {stats.resolvedTickets}
              </div>
              <div className="text-xs text-muted-foreground">Resolved</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold">{stats.avgResponseTime}m</div>
              <div className="text-xs text-muted-foreground">Avg Response</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold">
                {stats.avgResolutionTime}h
              </div>
              <div className="text-xs text-muted-foreground">
                Avg Resolution
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tickets, customers, or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="tickets-search-input"
              />
            </div>
          </div>

          <div className="flex space-x-2">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filterDepartment}
              onValueChange={setFilterDepartment}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Tickets List */}
        <div className="w-1/2 border-r overflow-y-auto">
          <div className="p-4 space-y-4">
            {filteredTickets.length > 0 ? (
              filteredTickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))
            ) : (
              <div className="text-center py-12">
                <HeadphonesIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Tickets Found</h3>
                <p className="text-muted-foreground">
                  {searchQuery
                    ? `No tickets match your search criteria.`
                    : "No support tickets available."}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Ticket Detail */}
        <div className="w-1/2 flex flex-col">
          {selectedTicket ? (
            <>
              {/* Ticket Header */}
              <div className="border-b p-4 bg-muted/20">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h2 className="text-xl font-bold mb-1">
                      {selectedTicket.subject}
                    </h2>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <span>#{selectedTicket.ticketNumber}</span>
                      <span>•</span>
                      <span>{selectedTicket.customerName}</span>
                      <span>•</span>
                      <span>
                        {formatDistanceToNow(
                          new Date(selectedTicket.createdAt),
                          { addSuffix: true },
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {getPriorityBadge(selectedTicket.priority)}
                    {getStatusBadge(selectedTicket.status)}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Settings className="h-4 w-4 mr-2" />
                          Ticket Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View Customer Profile
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <XCircle className="h-4 w-4 mr-2" />
                          Close Ticket
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center space-x-2">
                  <Select
                    value={selectedTicket.status}
                    onValueChange={(value) =>
                      onUpdateTicketStatus(selectedTicket.id, value)
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={selectedTicket.priority}
                    onValueChange={(value) =>
                      onUpdateTicketPriority(selectedTicket.id, value)
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={selectedTicket.assignedAgentId || ""}
                    onValueChange={(value) =>
                      onAssignTicket(selectedTicket.id, value)
                    }
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Assign Agent" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Unassigned</SelectItem>
                      {agents
                        .filter(
                          (agent) =>
                            agent.departmentId === selectedTicket.departmentId,
                        )
                        .map((agent) => (
                          <SelectItem key={agent.id} value={agent.id}>
                            <div className="flex items-center space-x-2">
                              <div
                                className={`w-2 h-2 rounded-full ${agent.isOnline ? "bg-green-500" : "bg-gray-300"}`}
                              />
                              <span>
                                {agent.name} ({agent.currentTickets}/
                                {agent.maxTickets})
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4">
                {isLoadingMessages ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading messages...</p>
                  </div>
                ) : ticketMessages.length > 0 ? (
                  <div className="space-y-4">
                    {ticketMessages.map((message) => (
                      <MessageBubble key={message.id} message={message} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No messages yet</p>
                  </div>
                )}
              </div>

              {/* Message Composer */}
              <div className="border-t p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Select
                    value={messageType}
                    onValueChange={(value: "reply" | "note") =>
                      setMessageType(value)
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reply">
                        <div className="flex items-center space-x-2">
                          <MessageSquare className="h-3 w-3" />
                          <span>Reply</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="note">
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="h-3 w-3" />
                          <span>Internal Note</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <Button variant="ghost" size="sm">
                    <Zap className="h-4 w-4 mr-2" />
                    Templates
                  </Button>
                </div>

                <div className="flex space-x-2">
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={
                      messageType === "reply"
                        ? "Type your reply..."
                        : "Add an internal note..."
                    }
                    rows={3}
                    className="flex-1"
                    data-testid="message-input"
                  />
                  <div className="flex flex-col space-y-2">
                    <Button variant="ghost" size="sm">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || isSubmittingMessage}
                      size="sm"
                      className="bg-gradient-to-r from-primary to-purple-600"
                      data-testid="send-message-btn"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <HeadphonesIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Select a Ticket</h3>
                <p className="text-muted-foreground">
                  Choose a ticket from the list to view details and respond
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TicketManagementDashboard;
