import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Send,
  Users,
  MessageCircle,
  Phone,
  Video,
  Settings,
  Bell,
  Volume2,
  Eye,
} from "lucide-react";

interface ChatRoom {
  id: string;
  name: string;
  type: "direct" | "group" | "broadcast" | "emergency";
  participants: string[];
  isActive: boolean;
  createdAt: string;
  lastMessage?: ChatMessage;
}

interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  messageType: "text" | "image" | "file" | "system";
  attachmentUrl?: string;
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: string;
  senderName?: string;
}

interface User {
  id: string;
  username: string;
  role: string;
  isActive: boolean;
}

export default function ChatSystem() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    notifications: true,
    soundEnabled: true,
    showTypingIndicators: true,
    autoScroll: true,
    showTimestamps: true,
    darkMode: true,
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: rooms = [], isLoading: roomsLoading } = useQuery<ChatRoom[]>({
    queryKey: ["/api/chat/rooms"],
    refetchInterval: 3000, // Refresh every 3 seconds
  });

  const { data: messages = [], isLoading: messagesLoading } = useQuery<
    ChatMessage[]
  >({
    queryKey: ["/api/chat/messages", selectedRoom],
    enabled: !!selectedRoom,
    refetchInterval: 1000, // Refresh every second for real-time feel
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({
      roomId,
      content,
    }: {
      roomId: string;
      content: string;
    }) => {
      return apiRequest("/api/chat/messages", "POST", {
        roomId,
        content,
        messageType: "text",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/chat/messages", selectedRoom],
      });
      queryClient.invalidateQueries({ queryKey: ["/api/chat/rooms"] });
      setMessageInput("");
      scrollToBottom();
    },
    onError: (error: Error) => {
      toast({
        title: "Message Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createRoomMutation = useMutation({
    mutationFn: async ({
      name,
      type,
      participants,
    }: {
      name: string;
      type: string;
      participants: string[];
    }) => {
      return apiRequest("/api/chat/rooms", "POST", {
        name,
        type,
        participants,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/rooms"] });
      toast({
        title: "Room Created",
        description: "New chat room created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Room Creation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!selectedRoom || !messageInput.trim()) return;

    sendMessageMutation.mutate({
      roomId: selectedRoom,
      content: messageInput.trim(),
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const createEmergencyRoom = () => {
    createRoomMutation.mutate({
      name: `Emergency - ${new Date().toLocaleTimeString()}`,
      type: "emergency",
      participants: [],
    });
  };

  const formatMessageTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRoomIcon = (type: string) => {
    switch (type) {
      case "emergency":
        return "🚨";
      case "broadcast":
        return "📢";
      case "group":
        return "👥";
      case "direct":
      default:
        return "💬";
    }
  };

  const filteredRooms = rooms.filter((room) =>
    room.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (roomsLoading) {
    return (
      <div className="min-h-screen cyber-bg flex items-center justify-center">
        <div className="text-center">
          <MessageCircle className="w-16 h-16 mx-auto mb-4 cyber-pulse text-primary" />
          <p className="cyber-text-glow">Loading Communication System...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen cyber-bg">
      <div className="container mx-auto p-6 h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold cyber-text-glow">
              Secure Communication Hub
            </h1>
            <p className="text-muted-foreground">
              Enterprise Team Communication & Crisis Response
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={createEmergencyRoom}
              className="bg-red-600 hover:bg-red-700"
              data-testid="button-create-emergency"
            >
              🚨 Emergency Room
            </Button>
            <Button
              variant="outline"
              className="border-cyan-500 text-cyan-400"
              onClick={() => setShowSettings(true)}
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Rooms Sidebar */}
          <Card className="bg-gray-900/50 border-cyan-500/20 lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-cyan-400">Chat Rooms</CardTitle>
              <Input
                placeholder="Search rooms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-800 border-gray-700"
                data-testid="input-search-rooms"
              />
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {filteredRooms.map((room) => (
                    <div
                      key={room.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedRoom === room.id
                          ? "bg-cyan-500/20 border border-cyan-500/50"
                          : "bg-gray-800/50 hover:bg-gray-700/50"
                      }`}
                      onClick={() => setSelectedRoom(room.id)}
                      data-testid={`room-${room.id}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">
                            {getRoomIcon(room.type)}
                          </span>
                          <div>
                            <p className="font-medium text-white">
                              {room.name}
                            </p>
                            <p className="text-xs text-gray-400">
                              {room.participants.length} participants
                            </p>
                          </div>
                        </div>
                        {room.isActive && (
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        )}
                      </div>
                      {room.lastMessage && (
                        <p className="text-xs text-gray-500 mt-1 truncate">
                          {room.lastMessage.content}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="bg-gray-900/50 border-cyan-500/20 lg:col-span-3">
            {selectedRoom ? (
              <>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-cyan-400">
                        {rooms.find((r) => r.id === selectedRoom)?.name ||
                          "Chat Room"}
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        {rooms.find((r) => r.id === selectedRoom)?.participants
                          .length || 0}{" "}
                        participants
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-cyan-500 text-cyan-400"
                      >
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-cyan-500 text-cyan-400"
                      >
                        <Video className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-cyan-500 text-cyan-400"
                      >
                        <Users className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col">
                  {/* Messages */}
                  <ScrollArea className="flex-1 h-96 mb-4">
                    <div className="space-y-4 p-4">
                      {messagesLoading ? (
                        <p className="text-center text-gray-400">
                          Loading messages...
                        </p>
                      ) : messages.length === 0 ? (
                        <p className="text-center text-gray-400">
                          No messages yet. Start the conversation!
                        </p>
                      ) : (
                        messages.map((message) => (
                          <div key={message.id} className="flex gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="bg-cyan-500/20 text-cyan-400">
                                {message.senderName?.charAt(0) || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-white">
                                  {message.senderName ||
                                    `User ${message.senderId}`}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {formatMessageTime(message.createdAt)}
                                </span>
                                {message.isEdited && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    edited
                                  </Badge>
                                )}
                              </div>
                              <p className="text-gray-300">{message.content}</p>
                            </div>
                          </div>
                        ))
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Message Input */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type your message..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1 bg-gray-800 border-gray-700"
                      data-testid="input-message"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={
                        !messageInput.trim() || sendMessageMutation.isPending
                      }
                      className="bg-cyan-500 hover:bg-cyan-600"
                      data-testid="button-send-message"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex items-center justify-center h-full">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                  <p className="text-gray-400">
                    Select a room to start chatting
                  </p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Online Users */}
        <Card className="bg-gray-900/50 border-cyan-500/20 mt-6">
          <CardHeader>
            <CardTitle className="text-cyan-400">
              Team Status ({users.filter((u) => u.isActive).length} online)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-2 px-3 py-1 bg-gray-800/50 rounded-full"
                >
                  <div
                    className={`w-2 h-2 rounded-full ${user.isActive ? "bg-green-400" : "bg-gray-500"}`}
                  />
                  <span className="text-sm text-white">{user.username}</span>
                  <Badge variant="outline" className="text-xs">
                    {user.role}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Settings Dialog */}
        <Dialog open={showSettings} onOpenChange={setShowSettings}>
          <DialogContent className="bg-gray-900 border-cyan-500/20">
            <DialogHeader>
              <DialogTitle className="text-cyan-400 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Communication Settings
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Configure your chat preferences and notifications
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Notifications */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-cyan-400" />
                  <div>
                    <Label htmlFor="notifications" className="text-white">
                      Notifications
                    </Label>
                    <p className="text-xs text-gray-400">
                      Receive notifications for new messages
                    </p>
                  </div>
                </div>
                <Switch
                  id="notifications"
                  checked={settings.notifications}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, notifications: checked })
                  }
                />
              </div>

              <Separator className="bg-gray-700" />

              {/* Sound */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Volume2 className="w-5 h-5 text-cyan-400" />
                  <div>
                    <Label htmlFor="sound" className="text-white">
                      Sound Effects
                    </Label>
                    <p className="text-xs text-gray-400">
                      Play sound for incoming messages
                    </p>
                  </div>
                </div>
                <Switch
                  id="sound"
                  checked={settings.soundEnabled}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, soundEnabled: checked })
                  }
                />
              </div>

              <Separator className="bg-gray-700" />

              {/* Typing Indicators */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5 text-cyan-400" />
                  <div>
                    <Label htmlFor="typing" className="text-white">
                      Typing Indicators
                    </Label>
                    <p className="text-xs text-gray-400">
                      Show when others are typing
                    </p>
                  </div>
                </div>
                <Switch
                  id="typing"
                  checked={settings.showTypingIndicators}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, showTypingIndicators: checked })
                  }
                />
              </div>

              <Separator className="bg-gray-700" />

              {/* Auto Scroll */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-5 h-5 text-cyan-400" />
                  <div>
                    <Label htmlFor="autoscroll" className="text-white">
                      Auto Scroll
                    </Label>
                    <p className="text-xs text-gray-400">
                      Automatically scroll to new messages
                    </p>
                  </div>
                </div>
                <Switch
                  id="autoscroll"
                  checked={settings.autoScroll}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, autoScroll: checked })
                  }
                />
              </div>

              <Separator className="bg-gray-700" />

              {/* Show Timestamps */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-5 h-5 text-cyan-400" />
                  <div>
                    <Label htmlFor="timestamps" className="text-white">
                      Show Timestamps
                    </Label>
                    <p className="text-xs text-gray-400">
                      Display message timestamps
                    </p>
                  </div>
                </div>
                <Switch
                  id="timestamps"
                  checked={settings.showTimestamps}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, showTimestamps: checked })
                  }
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                className="border-gray-600 text-gray-400"
                onClick={() => setShowSettings(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-cyan-500 hover:bg-cyan-600"
                onClick={() => {
                  toast({
                    title: "Settings Saved",
                    description: "Your preferences have been updated",
                  });
                  setShowSettings(false);
                }}
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
