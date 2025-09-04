import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell,
  BellOff,
  BellRing,
  Settings,
  Volume2,
  VolumeX,
  Mail,
  MessageSquare,
  Clock,
  AlertTriangle,
  CheckCircle,
  Star,
  Flag,
  User,
  Users,
  Activity,
  Eye,
  Trash2,
  Filter,
  MoreHorizontal,
  X,
  Send,
  Phone,
  Smartphone,
  Monitor,
  Globe,
  Zap,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  type:
    | "ticket_assigned"
    | "ticket_updated"
    | "message_received"
    | "escalation"
    | "satisfaction_low"
    | "sla_breach"
    | "system_alert";
  title: string;
  message: string;
  priority: "low" | "medium" | "high" | "urgent";
  isRead: boolean;
  ticketId?: string;
  ticketNumber?: string;
  userId?: string;
  userName?: string;
  userAvatar?: string;
  departmentId?: string;
  departmentName?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  soundEnabled: boolean;
  desktopNotifications: boolean;
  channels: {
    ticket_assigned: boolean;
    ticket_updated: boolean;
    message_received: boolean;
    escalation: boolean;
    satisfaction_low: boolean;
    sla_breach: boolean;
    system_alert: boolean;
  };
  emailFrequency: "instant" | "hourly" | "daily";
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
}

interface NotificationsProps {
  notifications: Notification[];
  settings: NotificationSettings;
  unreadCount: number;
  onMarkAsRead: (id: string) => Promise<void>;
  onMarkAllAsRead: () => Promise<void>;
  onDeleteNotification: (id: string) => Promise<void>;
  onUpdateSettings: (settings: NotificationSettings) => Promise<void>;
  onNavigateToTicket: (ticketId: string) => void;
  currentUser: {
    id: string;
    name: string;
    role: string;
  };
  className?: string;
}

export function Notifications({
  notifications,
  settings,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onUpdateSettings,
  onNavigateToTicket,
  currentUser,
  className = "",
}: NotificationsProps) {
  const [activeTab, setActiveTab] = useState("all");
  const [filter, setFilter] = useState("all");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [localSettings, setLocalSettings] = useState(settings);
  const [isPlayingSound, setIsPlayingSound] = useState(false);

  // Filter notifications based on active tab
  const filteredNotifications = notifications.filter((notification) => {
    if (activeTab === "unread" && notification.isRead) return false;
    if (activeTab === "urgent" && notification.priority !== "urgent")
      return false;
    if (filter !== "all" && notification.type !== filter) return false;
    return true;
  });

  const updateSettings = async (updates: Partial<NotificationSettings>) => {
    const newSettings = { ...localSettings, ...updates };
    setLocalSettings(newSettings);
    await onUpdateSettings(newSettings);
  };

  const playNotificationSound = () => {
    if (!settings.soundEnabled || isPlayingSound) return;

    setIsPlayingSound(true);
    // Create audio context for notification sound
    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = "sine";
    gainNode.gain.value = 0.1;

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.2);

    setTimeout(() => setIsPlayingSound(false), 200);
  };

  // Request desktop notification permission
  const requestNotificationPermission = async () => {
    if ("Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission();
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "ticket_assigned":
        return User;
      case "ticket_updated":
        return Activity;
      case "message_received":
        return MessageSquare;
      case "escalation":
        return Flag;
      case "satisfaction_low":
        return Star;
      case "sla_breach":
        return Clock;
      case "system_alert":
        return AlertTriangle;
      default:
        return Bell;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "text-red-600 bg-red-50";
      case "high":
        return "text-orange-600 bg-orange-50";
      case "medium":
        return "text-yellow-600 bg-yellow-50";
      case "low":
        return "text-blue-600 bg-blue-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const NotificationCard = ({
    notification,
  }: {
    notification: Notification;
  }) => {
    const IconComponent = getNotificationIcon(notification.type);
    const priorityColor = getPriorityColor(notification.priority);

    return (
      <Card
        className={`hover:shadow-lg transition-all duration-300 cursor-pointer ${
          !notification.isRead ? "border-l-4 border-l-primary bg-primary/2" : ""
        }`}
      >
        <CardContent className="p-4">
          <div className="flex items-start space-x-4">
            {/* Icon and Priority */}
            <div className={`p-2 rounded-full ${priorityColor}`}>
              <IconComponent className="h-4 w-4" />
            </div>

            {/* Content */}
            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h3
                    className={`font-semibold ${!notification.isRead ? "text-primary" : ""}`}
                  >
                    {notification.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {notification.message}
                  </p>
                </div>

                <div className="flex items-center space-x-1">
                  {!notification.isRead && (
                    <div className="w-2 h-2 bg-primary rounded-full" />
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {!notification.isRead && (
                        <DropdownMenuItem
                          onClick={() => onMarkAsRead(notification.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark as Read
                        </DropdownMenuItem>
                      )}
                      {notification.ticketId && (
                        <DropdownMenuItem
                          onClick={() =>
                            onNavigateToTicket(notification.ticketId!)
                          }
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Ticket
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDeleteNotification(notification.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Metadata */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center space-x-4">
                  {notification.ticketNumber && (
                    <span className="font-mono">
                      #{notification.ticketNumber}
                    </span>
                  )}
                  {notification.userName && (
                    <div className="flex items-center space-x-1">
                      <Avatar className="h-4 w-4">
                        <AvatarImage src={notification.userAvatar} />
                        <AvatarFallback className="text-xs">
                          {notification.userName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span>{notification.userName}</span>
                    </div>
                  )}
                  {notification.departmentName && (
                    <Badge variant="outline" className="text-xs">
                      {notification.departmentName}
                    </Badge>
                  )}
                </div>

                <span>
                  {formatDistanceToNow(new Date(notification.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center space-x-3">
            <div className="relative">
              <Bell className="h-8 w-8 text-primary" />
              {unreadCount > 0 && (
                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </div>
              )}
            </div>
            <span>Notifications</span>
          </h1>
          <p className="text-muted-foreground">
            Stay updated with ticket assignments, messages, and system alerts
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={onMarkAllAsRead}
            disabled={unreadCount === 0}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>

          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Notification Settings</span>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* General Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      General Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4" />
                        <Label htmlFor="email-notifications">
                          Email Notifications
                        </Label>
                      </div>
                      <Switch
                        id="email-notifications"
                        checked={localSettings.emailNotifications}
                        onCheckedChange={(checked) =>
                          updateSettings({ emailNotifications: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Send className="h-4 w-4" />
                        <Label htmlFor="push-notifications">
                          Push Notifications
                        </Label>
                      </div>
                      <Switch
                        id="push-notifications"
                        checked={localSettings.pushNotifications}
                        onCheckedChange={(checked) =>
                          updateSettings({ pushNotifications: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Volume2 className="h-4 w-4" />
                        <Label htmlFor="sound-enabled">Sound Alerts</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="sound-enabled"
                          checked={localSettings.soundEnabled}
                          onCheckedChange={(checked) =>
                            updateSettings({ soundEnabled: checked })
                          }
                        />
                        {localSettings.soundEnabled && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={playNotificationSound}
                            disabled={isPlayingSound}
                          >
                            Test
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Monitor className="h-4 w-4" />
                        <Label htmlFor="desktop-notifications">
                          Desktop Notifications
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="desktop-notifications"
                          checked={localSettings.desktopNotifications}
                          onCheckedChange={(checked) =>
                            updateSettings({ desktopNotifications: checked })
                          }
                        />
                        {localSettings.desktopNotifications &&
                          Notification.permission === "default" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={requestNotificationPermission}
                            >
                              Enable
                            </Button>
                          )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Email Frequency */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Email Frequency</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Select
                      value={localSettings.emailFrequency}
                      onValueChange={(value: any) =>
                        updateSettings({ emailFrequency: value })
                      }
                      disabled={!localSettings.emailNotifications}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="instant">Instant</SelectItem>
                        <SelectItem value="hourly">Hourly Digest</SelectItem>
                        <SelectItem value="daily">Daily Summary</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>

                {/* Notification Types */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Notification Types
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(localSettings.channels).map(
                      ([type, enabled]) => {
                        const IconComponent = getNotificationIcon(type);
                        const typeName = type
                          .replace("_", " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase());

                        return (
                          <div
                            key={type}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center space-x-2">
                              <IconComponent className="h-4 w-4" />
                              <Label htmlFor={type}>{typeName}</Label>
                            </div>
                            <Switch
                              id={type}
                              checked={enabled}
                              onCheckedChange={(checked) =>
                                updateSettings({
                                  channels: {
                                    ...localSettings.channels,
                                    [type]: checked,
                                  },
                                })
                              }
                            />
                          </div>
                        );
                      },
                    )}
                  </CardContent>
                </Card>

                {/* Quiet Hours */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Quiet Hours</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="quiet-hours">Enable Quiet Hours</Label>
                      <Switch
                        id="quiet-hours"
                        checked={localSettings.quietHours.enabled}
                        onCheckedChange={(checked) =>
                          updateSettings({
                            quietHours: {
                              ...localSettings.quietHours,
                              enabled: checked,
                            },
                          })
                        }
                      />
                    </div>

                    {localSettings.quietHours.enabled && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="start-time">Start Time</Label>
                          <Select
                            value={localSettings.quietHours.startTime}
                            onValueChange={(value) =>
                              updateSettings({
                                quietHours: {
                                  ...localSettings.quietHours,
                                  startTime: value,
                                },
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 24 }, (_, i) => (
                                <SelectItem
                                  key={i}
                                  value={`${i.toString().padStart(2, "0")}:00`}
                                >
                                  {`${i.toString().padStart(2, "0")}:00`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="end-time">End Time</Label>
                          <Select
                            value={localSettings.quietHours.endTime}
                            onValueChange={(value) =>
                              updateSettings({
                                quietHours: {
                                  ...localSettings.quietHours,
                                  endTime: value,
                                },
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 24 }, (_, i) => (
                                <SelectItem
                                  key={i}
                                  value={`${i.toString().padStart(2, "0")}:00`}
                                >
                                  {`${i.toString().padStart(2, "0")}:00`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{unreadCount}</div>
            <div className="text-sm text-muted-foreground">Unread</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {notifications.length}
            </div>
            <div className="text-sm text-muted-foreground">Total</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {notifications.filter((n) => n.priority === "urgent").length}
            </div>
            <div className="text-sm text-muted-foreground">Urgent</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {
                notifications.filter(
                  (n) =>
                    n.createdAt >
                    new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                ).length
              }
            </div>
            <div className="text-sm text-muted-foreground">Today</div>
          </CardContent>
        </Card>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">All ({notifications.length})</TabsTrigger>
            <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
            <TabsTrigger value="urgent">
              Urgent (
              {notifications.filter((n) => n.priority === "urgent").length})
            </TabsTrigger>
          </TabsList>

          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="ticket_assigned">Ticket Assigned</SelectItem>
              <SelectItem value="ticket_updated">Ticket Updated</SelectItem>
              <SelectItem value="message_received">Message Received</SelectItem>
              <SelectItem value="escalation">Escalations</SelectItem>
              <SelectItem value="satisfaction_low">Low Satisfaction</SelectItem>
              <SelectItem value="sla_breach">SLA Breach</SelectItem>
              <SelectItem value="system_alert">System Alerts</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
              />
            ))
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Bell className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Notifications</h3>
                <p className="text-muted-foreground">
                  {activeTab === "unread"
                    ? "All caught up! No unread notifications."
                    : activeTab === "urgent"
                      ? "No urgent notifications at the moment."
                      : "No notifications found matching your criteria."}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default Notifications;
