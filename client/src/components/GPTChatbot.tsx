import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  MessageCircle,
  Send,
  X,
  Bot,
  User,
  Minimize2,
  Maximize2,
  Zap,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  typing?: boolean;
}

interface GPTChatbotProps {
  className?: string;
  isFloating?: boolean;
}

export function GPTChatbot({ className, isFloating = false }: GPTChatbotProps) {
  const [isOpen, setIsOpen] = useState(!isFloating);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm FanzAI, your intelligent assistant for the Fanz™ Unlimited Network. I can help with platform navigation, compliance questions, content moderation policies, financial insights, and technical support. How can I assist you today?",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      return apiRequest("/api/gpt-chatbot/chat", "POST", {
        message,
        conversationHistory: messages.slice(-10), // Send last 10 messages for context
      });
    },
    onSuccess: (response) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.typing
            ? { ...msg, content: response.message, typing: false }
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
                  "I apologize, but I'm experiencing technical difficulties. Please try again in a moment or contact support at fanzunlimited.com.",
                typing: false,
              }
            : msg,
        ),
      );
    },
  });

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
      content: "Thinking...",
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
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 shadow-lg z-50"
        data-testid="chatbot-toggle-button"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card
      className={cn(
        "bg-gray-900/95 border-gray-800 backdrop-blur-sm",
        isFloating
          ? "fixed bottom-6 right-6 w-96 h-[500px] shadow-2xl z-50"
          : "w-full h-full",
        isMinimized && isFloating ? "h-16" : "",
        className,
      )}
      data-testid="gpt-chatbot-card"
    >
      <CardHeader className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-8 w-8 bg-gradient-to-r from-purple-600 to-cyan-600">
                <AvatarFallback>
                  <Bot className="h-4 w-4 text-white" />
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-gray-900 rounded-full"></div>
            </div>
            <div>
              <CardTitle className="text-sm text-white">
                FanzAI Assistant
              </CardTitle>
              <div className="flex items-center gap-1">
                <Badge
                  variant="secondary"
                  className="text-xs bg-purple-900/50 text-purple-300"
                >
                  <Zap className="h-3 w-3 mr-1" />
                  GPT-5 Powered
                </Badge>
                <Badge
                  variant="secondary"
                  className="text-xs bg-cyan-900/50 text-cyan-300"
                >
                  <Shield className="h-3 w-3 mr-1" />
                  Secure
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {isFloating && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                data-testid="chatbot-minimize-button"
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
                data-testid="chatbot-close-button"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
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
                    <Avatar className="h-8 w-8 bg-gradient-to-r from-purple-600 to-cyan-600 mt-1">
                      <AvatarFallback>
                        <Bot className="h-4 w-4 text-white" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg p-3 text-sm",
                      message.role === "user"
                        ? "bg-gradient-to-r from-purple-600 to-cyan-600 text-white"
                        : "bg-gray-800 text-gray-100 border border-gray-700",
                    )}
                    data-testid={`message-${message.role}`}
                  >
                    {message.typing ? (
                      <div className="flex items-center gap-1">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap">
                        {message.content}
                      </div>
                    )}
                    <div
                      className={cn(
                        "text-xs mt-1 opacity-70",
                        message.role === "user"
                          ? "text-purple-200"
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

          <div className="p-4 border-t border-gray-800">
            <div className="flex gap-2">
              <Input
                placeholder="Ask about compliance, moderation, analytics, or anything else..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                disabled={sendMessageMutation.isPending}
                data-testid="chatbot-input"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || sendMessageMutation.isPending}
                className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
                data-testid="chatbot-send-button"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-xs text-gray-500 mt-2 text-center">
              Powered by GPT-5 • Fanz™ Unlimited Network LLC
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
