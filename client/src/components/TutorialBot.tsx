import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  BookOpen,
  Send,
  X,
  Bot,
  User,
  Minimize2,
  Maximize2,
  Lightbulb,
  HelpCircle,
  Video,
  FileText,
  Sparkles,
  ExternalLink,
  PlayCircle,
  Mic,
  Image as ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { InteractiveTutorial, TUTORIAL_LIBRARY } from "./InteractiveTutorial";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  typing?: boolean;
  suggestions?: string[];
  wikiLinks?: { title: string; url: string }[];
  tutorials?: { id: string; title: string }[];
  hasImage?: boolean;
  imageUrl?: string;
}

interface TutorialBotProps {
  className?: string;
  isFloating?: boolean;
  pageName: string;
  pageContext?: string;
}

export function TutorialBot({
  className,
  isFloating = true,
  pageName,
  pageContext,
}: TutorialBotProps) {
  const [isOpen, setIsOpen] = useState(!isFloating);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTutorial, setActiveTutorial] = useState<string | null>(null);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      role: "assistant",
      content: `👋 **Welcome to ${pageName}!**\n\nI'm your Tutorial Assistant, here to help you master this page.\n\n💡 **I can help you with:**\n- Step-by-step tutorials\n- Feature explanations\n- Best practices\n- Troubleshooting\n- Quick tips\n\n🎯 **Quick Start**: Ask me anything like "How do I get started?" or "What can I do here?"\n\n📚 **Need detailed docs?** Type "wiki" to access the knowledge base.`,
      timestamp: new Date(),
      suggestions: [
        "How do I get started?",
        "Show me a tutorial",
        "What are the key features?",
        "Access wiki",
      ],
      tutorials: pageName === "Storage Settings" ? [
        { id: "storage-setup", title: "Setting Up Cloud Storage" },
      ] : pageName === "Compliance Center" ? [
        { id: "2257-verification", title: "Content Creator Verification" },
      ] : [],
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleStartTutorial = (tutorialId: string) => {
    setActiveTutorial(tutorialId);
  };

  const handleCloseTutorial = () => {
    setActiveTutorial(null);
  };

  const handleCompleteTutorial = () => {
    setActiveTutorial(null);
    const completionMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "assistant",
      content: "🎉 **Tutorial Completed!**\n\nGreat job! You've successfully completed the tutorial. You can always restart it or try another tutorial anytime.\n\n💡 What would you like to do next?",
      timestamp: new Date(),
      suggestions: [
        "Show me another tutorial",
        "Ask a question",
        "Access wiki",
      ],
    };
    setMessages((prev) => [...prev, completionMessage]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessageMutation = useMutation({
    mutationFn: (message: string) =>
      apiRequest<{
        message: string;
        suggestions?: string[];
        wikiLinks?: { title: string; url: string }[];
      }>("/api/tutorial-bot/chat", "POST", {
        message,
        pageName,
        pageContext,
      }),
    onSuccess: (data) => {
      const botMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
        suggestions: data.suggestions,
        wikiLinks: data.wikiLinks,
      };

      setMessages((prev) => prev.map((msg) =>
        msg.typing ? botMessage : msg
      ));
    },
  });

  const handleSendMessage = async () => {
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

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
    setTimeout(() => handleSendMessage(), 100);
  };

  if (isFloating && !isOpen) {
    return (
      <>
        <Button
          onClick={() => setIsOpen(true)}
          className={cn(
            "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50",
            "bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700",
            className
          )}
        >
          <HelpCircle className="h-6 w-6 text-white" />
        </Button>
        {activeTutorial && TUTORIAL_LIBRARY[activeTutorial as keyof typeof TUTORIAL_LIBRARY] && (
          <InteractiveTutorial
            {...TUTORIAL_LIBRARY[activeTutorial as keyof typeof TUTORIAL_LIBRARY]}
            onComplete={handleCompleteTutorial}
            onClose={handleCloseTutorial}
          />
        )}
      </>
    );
  }

  return (
    <>
    <Card
      className={cn(
        isFloating
          ? "fixed bottom-6 right-6 w-96 shadow-2xl z-50"
          : "w-full h-full",
        isMinimized && "h-auto",
        className
      )}
    >
      <CardHeader className="pb-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8 bg-white">
              <AvatarFallback className="bg-white">
                <Sparkles className="h-4 w-4 text-blue-600" />
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-sm">Tutorial Assistant</CardTitle>
              <p className="text-xs text-blue-100">{pageName}</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-white hover:bg-white/20"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              {isMinimized ? (
                <Maximize2 className="h-4 w-4" />
              ) : (
                <Minimize2 className="h-4 w-4" />
              )}
            </Button>
            {isFloating && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-white hover:bg-white/20"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      {!isMinimized && (
        <CardContent className="p-0">
          <ScrollArea className={cn(isFloating ? "h-96" : "h-[500px]")}>
            <div className="p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex items-start space-x-2",
                    message.role === "user" && "flex-row-reverse space-x-reverse"
                  )}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback
                      className={cn(
                        message.role === "assistant"
                          ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white"
                          : "bg-gray-200 text-gray-700"
                      )}
                    >
                      {message.role === "assistant" ? (
                        <Bot className="h-4 w-4" />
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                    </AvatarFallback>
                  </Avatar>

                  <div
                    className={cn(
                      "flex-1 space-y-2",
                      message.role === "user" && "flex flex-col items-end"
                    )}
                  >
                    <div
                      className={cn(
                        "rounded-lg p-3 max-w-[85%]",
                        message.role === "assistant"
                          ? "bg-blue-50 border border-blue-200"
                          : "bg-gray-100 border border-gray-200"
                      )}
                    >
                      <div
                        className={cn(
                          "text-sm whitespace-pre-wrap",
                          message.typing && "italic text-gray-500 animate-pulse"
                        )}
                      >
                        {message.content}
                      </div>
                    </div>

                    {message.suggestions && message.suggestions.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {message.suggestions.map((suggestion, idx) => (
                          <Button
                            key={idx}
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => handleSuggestionClick(suggestion)}
                          >
                            <Lightbulb className="h-3 w-3 mr-1" />
                            {suggestion}
                          </Button>
                        ))}
                      </div>
                    )}

                    {message.wikiLinks && message.wikiLinks.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs text-gray-600 flex items-center">
                          <BookOpen className="h-3 w-3 mr-1" />
                          Related Wiki Articles:
                        </p>
                        {message.wikiLinks.map((link, idx) => (
                          <a
                            key={idx}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-xs text-blue-600 hover:text-blue-800"
                          >
                            <FileText className="h-3 w-3 mr-1" />
                            {link.title}
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        ))}
                      </div>
                    )}

                    {message.tutorials && message.tutorials.length > 0 && (
                      <div className="space-y-1 mt-2">
                        <p className="text-xs text-gray-600 flex items-center">
                          <PlayCircle className="h-3 w-3 mr-1" />
                          Interactive Tutorials:
                        </p>
                        {message.tutorials.map((tutorial, idx) => (
                          <Button
                            key={idx}
                            variant="outline"
                            size="sm"
                            className="w-full justify-start text-xs h-8 bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100"
                            onClick={() => handleStartTutorial(tutorial.id)}
                          >
                            <PlayCircle className="h-3 w-3 mr-2 text-purple-600" />
                            {tutorial.title}
                          </Button>
                        ))}
                      </div>
                    )}

                    {message.hasImage && message.imageUrl && (
                      <div className="mt-2">
                        <img
                          src={message.imageUrl}
                          alt="Tutorial image"
                          className="rounded-lg border border-gray-200 max-w-full"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <div className="p-4 border-t">
            <div className="flex space-x-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Ask me anything..."
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || sendMessageMutation.isPending}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
              <span className="flex items-center">
                <BookOpen className="h-3 w-3 mr-1" />
                Powered by Wiki Knowledge Base
              </span>
              <a
                href="/wiki"
                className="text-blue-600 hover:text-blue-800 flex items-center"
              >
                Browse Wiki
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </div>
          </div>
        </CardContent>
      )}
    </Card>

    {/* Interactive Tutorial Overlay */}
    {activeTutorial && TUTORIAL_LIBRARY[activeTutorial as keyof typeof TUTORIAL_LIBRARY] && (
      <InteractiveTutorial
        {...TUTORIAL_LIBRARY[activeTutorial as keyof typeof TUTORIAL_LIBRARY]}
        onComplete={handleCompleteTutorial}
        onClose={handleCloseTutorial}
      />
    )}
    </>
  );
}
