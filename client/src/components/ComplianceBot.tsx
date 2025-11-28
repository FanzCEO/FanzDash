import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Shield,
  Send,
  X,
  Bot,
  User,
  Minimize2,
  Maximize2,
  AlertTriangle,
  Scale,
  Gavel,
  FileText,
  Users,
  Eye,
  Lock,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  typing?: boolean;
  alertLevel?: "info" | "warning" | "error";
  requiresApproval?: boolean;
  complianceCheck?: {
    violations: string[];
    riskLevel: string;
    blocked: boolean;
  };
}

interface ComplianceStatus {
  totalEvents: number;
  blockedActions: number;
  pendingApprovals: number;
  escalations: number;
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
    critical: number;
    immediateBlock: number;
  };
}

interface ComplianceBotResponse {
  message: string;
  alertLevel?: "info" | "warning" | "error";
  complianceCheck?: {
    violations: string[];
    riskLevel: string;
    blocked: boolean;
  };
}

interface ComplianceBotProps {
  className?: string;
  isFloating?: boolean;
}

export function ComplianceBot({
  className,
  isFloating = false,
}: ComplianceBotProps) {
  const [isOpen, setIsOpen] = useState(!isFloating);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "🛡️ **FanzLegal AI Compliance Guardian** is now active.\n\nI monitor all platform activities for legal compliance and can help with:\n\n📋 **Laws & Regulations**: 18 U.S.C. § 2257, DMCA, GDPR, CCPA\n🏛️ **Platform Policies**: Content guidelines, harassment prevention\n⚖️ **Legal Guidance**: Federal law compliance, data protection\n🚨 **Crisis Management**: Emergency protocols, incident response\n👥 **Staff Monitoring**: Real-time action oversight, violation prevention\n\n**WARNING**: I actively monitor and can BLOCK actions that violate laws or policies. Contact legal@fanzunlimited.com for urgent matters.",
      timestamp: new Date(),
      alertLevel: "info",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get real-time compliance status
  const { data: complianceStatus } = useQuery<ComplianceStatus>({
    queryKey: ["/api/compliance/status"],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessageMutation = useMutation<ComplianceBotResponse, Error, string>(
    {
      mutationFn: async (message: string) => {
        const response = await apiRequest("/api/compliance-bot/chat", "POST", {
          message,
          conversationHistory: messages.slice(-10),
        });
        return response as ComplianceBotResponse;
      },
      onSuccess: (response) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.typing
              ? {
                  ...msg,
                  content: response.message,
                  typing: false,
                  alertLevel: response.alertLevel,
                  complianceCheck: response.complianceCheck,
                }
              : msg,
          ),
        );
      },
      onError: () => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.typing
              ? {
                  ...msg,
                  content:
                    "⚠️ I'm experiencing technical difficulties. For immediate legal compliance assistance, contact legal@fanzunlimited.com",
                  typing: false,
                  alertLevel: "error",
                }
              : msg,
          ),
        );
      },
    },
  );

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    const typingMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: "Analyzing for compliance violations...",
      timestamp: new Date(),
      typing: true,
    };

    setMessages((prev) => [...prev, userMessage, typingMessage]);
    setInputMessage("");
    sendMessageMutation.mutate(inputMessage);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isFloating && !isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 shadow-lg z-50 animate-pulse"
        data-testid="compliance-bot-toggle-button"
      >
        <Shield className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card
      className={cn(
        "bg-gray-900/95 border-red-800 backdrop-blur-sm",
        isFloating
          ? "fixed bottom-6 right-6 w-96 h-[600px] shadow-2xl z-50"
          : "w-full h-full",
        isMinimized && isFloating ? "h-16" : "",
        className,
      )}
      data-testid="compliance-bot-card"
    >
      <CardHeader className="p-4 border-b border-red-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-8 w-8 bg-gradient-to-r from-red-600 to-orange-600">
                <AvatarFallback>
                  <Shield className="h-4 w-4 text-white" />
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-red-500 border-2 border-gray-900 rounded-full animate-pulse"></div>
            </div>
            <div>
              <CardTitle className="text-sm text-white">
                FanzLegal AI Guardian
              </CardTitle>
              <div className="flex items-center gap-1">
                <Badge
                  variant="destructive"
                  className="text-xs bg-red-900/50 text-red-300"
                >
                  <Gavel className="h-3 w-3 mr-1" />
                  Legal Monitor
                </Badge>
                <Badge
                  variant="secondary"
                  className="text-xs bg-orange-900/50 text-orange-300"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {complianceStatus && (
              <div className="text-xs text-right mr-2">
                <div className="text-red-400">
                  {complianceStatus.blockedActions || 0} Blocked
                </div>
                <div className="text-orange-400">
                  {complianceStatus.pendingApprovals || 0} Pending
                </div>
              </div>
            )}
            {isFloating && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                data-testid="compliance-bot-minimize-button"
              >
                {isMinimized ? (
                  <Maximize2 className="h-4 w-4" />
                ) : (
                  <Minimize2 className="h-4 w-4" />
                )}
              </Button>
            )}
            {isFloating && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                data-testid="compliance-bot-close-button"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Compliance Status Bar */}
        {complianceStatus && !isMinimized && (
          <div className="mt-3 p-2 bg-gray-800 rounded border border-red-700">
            <div className="text-xs text-gray-300 mb-1">
              Real-time Compliance Status
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-green-400">
                {complianceStatus.riskDistribution?.low || 0} Low
              </span>
              <span className="text-yellow-400">
                {complianceStatus.riskDistribution?.medium || 0} Medium
              </span>
              <span className="text-orange-400">
                {complianceStatus.riskDistribution?.high || 0} High
              </span>
              <span className="text-red-400">
                {complianceStatus.riskDistribution?.critical || 0} Critical
              </span>
            </div>
          </div>
        )}
      </CardHeader>

      {!isMinimized && (
        <CardContent className="p-0 flex flex-col h-full">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3",
                    message.role === "user" ? "justify-end" : "justify-start",
                  )}
                >
                  {message.role === "assistant" && (
                    <Avatar
                      className={cn(
                        "h-8 w-8 mt-1",
                        message.alertLevel === "error"
                          ? "bg-gradient-to-r from-red-600 to-red-700"
                          : message.alertLevel === "warning"
                            ? "bg-gradient-to-r from-orange-600 to-yellow-600"
                            : "bg-gradient-to-r from-red-600 to-orange-600",
                      )}
                    >
                      <AvatarFallback>
                        {message.alertLevel === "error" ? (
                          <AlertTriangle className="h-4 w-4 text-white" />
                        ) : message.alertLevel === "warning" ? (
                          <Scale className="h-4 w-4 text-white" />
                        ) : (
                          <Shield className="h-4 w-4 text-white" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className="flex flex-col max-w-[80%]">
                    <div
                      className={cn(
                        "rounded-lg p-3 text-sm",
                        message.role === "user"
                          ? "bg-gradient-to-r from-red-600 to-orange-600 text-white"
                          : message.alertLevel === "error"
                            ? "bg-red-900/50 text-red-100 border border-red-700"
                            : message.alertLevel === "warning"
                              ? "bg-orange-900/50 text-orange-100 border border-orange-700"
                              : "bg-gray-800 text-gray-100 border border-red-700",
                      )}
                      data-testid={`message-${message.role}`}
                    >
                      {message.typing ? (
                        <div className="flex items-center gap-1">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                            <div
                              className="w-2 h-2 bg-red-400 rounded-full animate-pulse"
                              style={{ animationDelay: "0.1s" }}
                            ></div>
                            <div
                              className="w-2 h-2 bg-red-400 rounded-full animate-pulse"
                              style={{ animationDelay: "0.2s" }}
                            ></div>
                          </div>
                        </div>
                      ) : (
                        <div className="whitespace-pre-wrap">
                          {message.content}
                        </div>
                      )}
                    </div>

                    {/* Compliance Check Results */}
                    {message.complianceCheck && (
                      <Alert
                        className={cn(
                          "mt-2 text-xs",
                          message.complianceCheck.blocked
                            ? "border-red-600 bg-red-900/20"
                            : message.complianceCheck.riskLevel === "high"
                              ? "border-orange-600 bg-orange-900/20"
                              : "border-yellow-600 bg-yellow-900/20",
                        )}
                      >
                        <AlertTriangle className="h-3 w-3" />
                        <AlertDescription className="text-xs">
                          <div className="font-semibold mb-1">
                            {message.complianceCheck.blocked
                              ? "🚫 ACTION BLOCKED"
                              : "⚠️ COMPLIANCE ALERT"}
                          </div>
                          <div>
                            Risk Level:{" "}
                            {message.complianceCheck.riskLevel.toUpperCase()}
                          </div>
                          {message.complianceCheck.violations.length > 0 && (
                            <div>
                              Violations:{" "}
                              {message.complianceCheck.violations.join(", ")}
                            </div>
                          )}
                        </AlertDescription>
                      </Alert>
                    )}

                    <div
                      className={cn(
                        "text-xs mt-1 opacity-70",
                        message.role === "user"
                          ? "text-red-200"
                          : "text-gray-400",
                      )}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                  {message.role === "user" && (
                    <Avatar className="h-8 w-8 bg-gray-700 mt-1">
                      <AvatarFallback>
                        <User className="h-4 w-4 text-gray-300" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
            </div>
            <div ref={messagesEndRef} />
          </ScrollArea>

          <div className="p-4 border-t border-red-800">
            <div className="mb-2">
              <div className="flex items-center gap-2 text-xs text-red-400 mb-1">
                <Lock className="h-3 w-3" />
                <span>All messages are monitored for legal compliance</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Ask about laws, policies, compliance, or report violations..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="bg-gray-800 border-red-700 text-white placeholder-gray-400"
                disabled={sendMessageMutation.isPending}
                data-testid="compliance-bot-input"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || sendMessageMutation.isPending}
                className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
                data-testid="compliance-bot-send-button"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-xs text-gray-500 mt-2 text-center">
              🛡️ Legal Guardian • Powered by Military-Grade AI • Fanz™
              Unlimited Network LLC
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
