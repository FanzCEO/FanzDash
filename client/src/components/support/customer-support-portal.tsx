import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  HeadphonesIcon,
  MessageSquare,
  Plus,
  Search,
  Clock,
  CheckCircle,
  Star,
  FileText,
  Send,
  Paperclip,
  Flag,
  ArrowUp,
  ArrowDown,
  Timer,
  Archive,
  AlertTriangle,
  User,
  Calendar,
  Tag,
  Eye,
  BookOpen,
  HelpCircle,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface SupportTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "pending" | "resolved" | "closed";
  categoryId: string;
  categoryName: string;
  messageCount: number;
  lastMessageAt: string;
  createdAt: string;
  satisfactionRating?: number;
}

interface TicketMessage {
  id: string;
  message: string;
  authorType: "customer" | "agent" | "system";
  authorName: string;
  authorAvatar?: string;
  attachments: Array<{
    name: string;
    url: string;
    size: number;
  }>;
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
  description: string;
  icon?: string;
}

interface KnowledgeBaseArticle {
  id: string;
  title: string;
  summary: string;
  slug: string;
  categoryName: string;
  viewCount: number;
  upvotes: number;
  downvotes: number;
  isFeatured: boolean;
  createdAt: string;
}

interface CustomerSupportPortalProps {
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  tickets: SupportTicket[];
  categories: Category[];
  knowledgeBaseArticles: KnowledgeBaseArticle[];
  onCreateTicket: (data: {
    subject: string;
    description: string;
    categoryId: string;
    priority: string;
    attachments?: File[];
  }) => Promise<void>;
  onLoadTicketMessages: (ticketId: string) => Promise<TicketMessage[]>;
  onAddTicketMessage: (
    ticketId: string,
    message: string,
    attachments?: File[],
  ) => Promise<void>;
  onSearchKnowledgeBase: (query: string) => Promise<KnowledgeBaseArticle[]>;
  onRateArticle: (articleId: string, rating: "up" | "down") => Promise<void>;
  className?: string;
}

export function CustomerSupportPortal({
  user,
  tickets,
  categories,
  knowledgeBaseArticles,
  onCreateTicket,
  onLoadTicketMessages,
  onAddTicketMessage,
  onSearchKnowledgeBase,
  onRateArticle,
  className = "",
}: CustomerSupportPortalProps) {
  const [activeTab, setActiveTab] = useState("tickets");
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(
    null,
  );
  const [ticketMessages, setTicketMessages] = useState<TicketMessage[]>([]);
  const [isCreateTicketOpen, setIsCreateTicketOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<KnowledgeBaseArticle[]>(
    [],
  );
  const [isSearching, setIsSearching] = useState(false);

  // Create ticket form state
  const [newTicket, setNewTicket] = useState({
    subject: "",
    description: "",
    categoryId: "",
    priority: "medium",
    attachments: [] as File[],
  });
  const [ticketErrors, setTicketErrors] = useState<Record<string, string>>({});
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);

  // Ticket reply state
  const [newMessage, setNewMessage] = useState("");
  const [messageAttachments, setMessageAttachments] = useState<File[]>([]);
  const [isSubmittingMessage, setIsSubmittingMessage] = useState(false);

  const loadTicketMessages = async (ticket: SupportTicket) => {
    try {
      const messages = await onLoadTicketMessages(ticket.id);
      setTicketMessages(messages);
    } catch (error) {
      console.error("Failed to load ticket messages:", error);
    }
  };

  const handleTicketSelect = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    loadTicketMessages(ticket);
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await onSearchKnowledgeBase(query);
      setSearchResults(results);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const validateTicketForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!newTicket.subject.trim()) {
      errors.subject = "Subject is required";
    }
    if (!newTicket.description.trim()) {
      errors.description = "Description is required";
    }
    if (!newTicket.categoryId) {
      errors.categoryId = "Category is required";
    }

    setTicketErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateTicket = async () => {
    if (!validateTicketForm()) return;

    setIsSubmittingTicket(true);
    try {
      await onCreateTicket(newTicket);
      setIsCreateTicketOpen(false);
      setNewTicket({
        subject: "",
        description: "",
        categoryId: "",
        priority: "medium",
        attachments: [],
      });
    } catch (error: any) {
      setTicketErrors({ submit: error.message || "Failed to create ticket" });
    } finally {
      setIsSubmittingTicket(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket) return;

    setIsSubmittingMessage(true);
    try {
      await onAddTicketMessage(
        selectedTicket.id,
        newMessage,
        messageAttachments,
      );
      setNewMessage("");
      setMessageAttachments([]);
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
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
                #{ticket.ticketNumber}
              </span>
              {getPriorityBadge(ticket.priority)}
              {getStatusBadge(ticket.status)}
            </div>
            {ticket.satisfactionRating && (
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <span className="text-sm">{ticket.satisfactionRating}/5</span>
              </div>
            )}
          </div>

          <h3 className="font-semibold text-lg line-clamp-2">
            {ticket.subject}
          </h3>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {ticket.categoryName}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <span>{ticket.messageCount}</span>
              </div>
              <span className="text-muted-foreground">
                {formatDistanceToNow(new Date(ticket.lastMessageAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const ArticleCard = ({ article }: { article: KnowledgeBaseArticle }) => (
    <Card className="hover:shadow-lg transition-all duration-300">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-lg line-clamp-2 mb-2">
                {article.title}
              </h3>
              <p className="text-muted-foreground text-sm line-clamp-2">
                {article.summary}
              </p>
            </div>
            {article.isFeatured && (
              <Badge className="bg-yellow-500">
                <Star className="h-3 w-3 mr-1 fill-current" />
                Featured
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <Badge variant="outline">{article.categoryName}</Badge>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Eye className="h-3 w-3" />
                <span>{article.viewCount}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <ThumbsUp className="h-3 w-3 text-green-600" />
                  <span>{article.upvotes}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <ThumbsDown className="h-3 w-3 text-red-600" />
                  <span>{article.downvotes}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(article.createdAt), {
                addSuffix: true,
              })}
            </span>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRateArticle(article.id, "up")}
              >
                <ThumbsUp className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRateArticle(article.id, "down")}
              >
                <ThumbsDown className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-background to-muted/20 ${className}`}
    >
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-2xl mb-6">
            <HeadphonesIcon className="h-10 w-10 text-primary" />
          </div>

          <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent mb-4">
            Support Center
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get help, browse articles, and manage your support tickets
          </p>
        </div>

        {/* User Info */}
        <Card className="mb-8 bg-gradient-to-r from-primary/5 to-purple-500/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={user.avatar} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-semibold">Welcome, {user.name}!</h2>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger
              value="tickets"
              className="flex items-center space-x-2"
            >
              <MessageSquare className="h-4 w-4" />
              <span>My Tickets ({tickets.length})</span>
            </TabsTrigger>
            <TabsTrigger
              value="knowledge"
              className="flex items-center space-x-2"
            >
              <BookOpen className="h-4 w-4" />
              <span>Knowledge Base</span>
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Create Ticket</span>
            </TabsTrigger>
          </TabsList>

          {/* My Tickets Tab */}
          <TabsContent value="tickets" className="space-y-6">
            {tickets.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Tickets List */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">
                    Your Support Tickets
                  </h3>
                  {tickets.map((ticket) => (
                    <TicketCard key={ticket.id} ticket={ticket} />
                  ))}
                </div>

                {/* Ticket Detail */}
                <div>
                  {selectedTicket ? (
                    <Card className="h-96 flex flex-col">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="line-clamp-1">
                              {selectedTicket.subject}
                            </CardTitle>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-1">
                              <span>#{selectedTicket.ticketNumber}</span>
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
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col space-y-4">
                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                          {ticketMessages.map((message) => (
                            <div
                              key={message.id}
                              className={`flex space-x-3 ${message.authorType === "customer" ? "flex-row" : "flex-row-reverse"}`}
                            >
                              <Avatar className="h-8 w-8 flex-shrink-0">
                                <AvatarImage src={message.authorAvatar} />
                                <AvatarFallback>
                                  {message.authorName.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div
                                className={`flex-1 ${message.authorType === "customer" ? "text-left" : "text-right"}`}
                              >
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="font-medium text-sm">
                                    {message.authorName}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(
                                      new Date(message.createdAt),
                                      { addSuffix: true },
                                    )}
                                  </span>
                                </div>
                                <div
                                  className={`rounded-lg p-3 ${
                                    message.authorType === "customer"
                                      ? "bg-muted"
                                      : "bg-primary text-primary-foreground"
                                  }`}
                                >
                                  <p className="text-sm whitespace-pre-wrap">
                                    {message.message}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Reply Form */}
                        {selectedTicket.status !== "closed" && (
                          <div className="space-y-2 pt-2 border-t">
                            <div className="flex space-x-2">
                              <Textarea
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type your message..."
                                rows={2}
                                className="flex-1"
                                data-testid="ticket-reply-input"
                              />
                              <div className="flex flex-col space-y-1">
                                <Button variant="ghost" size="sm">
                                  <Paperclip className="h-4 w-4" />
                                </Button>
                                <Button
                                  onClick={handleSendMessage}
                                  disabled={
                                    !newMessage.trim() || isSubmittingMessage
                                  }
                                  size="sm"
                                  data-testid="send-ticket-reply-btn"
                                >
                                  <Send className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="h-96 flex items-center justify-center">
                      <div className="text-center">
                        <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">
                          Select a Ticket
                        </h3>
                        <p className="text-muted-foreground">
                          Choose a ticket from the list to view details
                        </p>
                      </div>
                    </Card>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-2xl font-semibold mb-4">
                  No Support Tickets
                </h3>
                <p className="text-muted-foreground mb-8">
                  You haven't created any support tickets yet. Need help? Create
                  your first ticket!
                </p>
                <Button
                  onClick={() => setActiveTab("create")}
                  className="bg-gradient-to-r from-primary to-purple-600"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Ticket
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Knowledge Base Tab */}
          <TabsContent value="knowledge" className="space-y-6">
            <div className="max-w-2xl mx-auto">
              <div className="relative mb-8">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search help articles..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    handleSearch(e.target.value);
                  }}
                  className="pl-12 h-14 text-lg"
                  data-testid="kb-search-input"
                />
              </div>

              {isSearching ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Searching...</p>
                </div>
              ) : searchQuery ? (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">
                    Search Results ({searchResults.length})
                  </h3>
                  {searchResults.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {searchResults.map((article) => (
                        <ArticleCard key={article.id} article={article} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <HelpCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">
                        No Results Found
                      </h3>
                      <p className="text-muted-foreground">
                        Try different search terms or browse popular articles
                        below.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold">Popular Articles</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {knowledgeBaseArticles.slice(0, 6).map((article) => (
                      <ArticleCard key={article.id} article={article} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Create Ticket Tab */}
          <TabsContent value="create" className="space-y-6">
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="h-5 w-5" />
                  <span>Create Support Ticket</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {ticketErrors.submit && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{ticketErrors.submit}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    value={newTicket.subject}
                    onChange={(e) =>
                      setNewTicket((prev) => ({
                        ...prev,
                        subject: e.target.value,
                      }))
                    }
                    placeholder="Brief description of your issue"
                    className={ticketErrors.subject ? "border-red-500" : ""}
                    data-testid="ticket-subject-input"
                  />
                  {ticketErrors.subject && (
                    <p className="text-sm text-red-600">
                      {ticketErrors.subject}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={newTicket.categoryId}
                      onValueChange={(value) =>
                        setNewTicket((prev) => ({ ...prev, categoryId: value }))
                      }
                    >
                      <SelectTrigger
                        className={
                          ticketErrors.categoryId ? "border-red-500" : ""
                        }
                        data-testid="ticket-category-select"
                      >
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {ticketErrors.categoryId && (
                      <p className="text-sm text-red-600">
                        {ticketErrors.categoryId}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={newTicket.priority}
                      onValueChange={(value) =>
                        setNewTicket((prev) => ({ ...prev, priority: value }))
                      }
                    >
                      <SelectTrigger data-testid="ticket-priority-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={newTicket.description}
                    onChange={(e) =>
                      setNewTicket((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Please provide detailed information about your issue..."
                    rows={6}
                    className={ticketErrors.description ? "border-red-500" : ""}
                    data-testid="ticket-description-input"
                  />
                  {ticketErrors.description && (
                    <p className="text-sm text-red-600">
                      {ticketErrors.description}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Attachments</Label>
                  <div className="border-2 border-dashed border-muted/20 rounded-lg p-6 text-center">
                    <Paperclip className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Drag & drop files here, or click to browse
                    </p>
                    <Button variant="outline" size="sm">
                      Choose Files
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={handleCreateTicket}
                  disabled={isSubmittingTicket}
                  className="w-full h-12 text-lg bg-gradient-to-r from-primary to-purple-600"
                  data-testid="create-ticket-btn"
                >
                  {isSubmittingTicket ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                      Creating Ticket...
                    </>
                  ) : (
                    <>
                      <Plus className="h-5 w-5 mr-2" />
                      Create Support Ticket
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default CustomerSupportPortal;
