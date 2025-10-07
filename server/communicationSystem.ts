import { EventEmitter } from "events";
import { WebSocketServer, WebSocket } from "ws";
import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import { join } from "path";
import OpenAI from "openai";

const isDevMode = !process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes("placeholder") || process.env.OPENAI_API_KEY.includes("development");
const openai = isDevMode ? null : new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface Message {
  id: string;
  type: "text" | "image" | "video" | "audio" | "file" | "system";
  content: string;
  senderId: string;
  senderName: string;
  recipientId?: string;
  channelId?: string;
  timestamp: Date;
  edited?: Date;
  reactions: Array<{ emoji: string; users: string[]; count: number }>;
  replies: string[];
  attachments: Array<{
    id: string;
    filename: string;
    url: string;
    size: number;
    mimeType: string;
  }>;
  metadata: {
    ip?: string;
    userAgent?: string;
    platform?: string;
    encrypted: boolean;
    priority: "low" | "normal" | "high" | "urgent";
  };
  status: "sent" | "delivered" | "read" | "failed";
  moderationStatus: "pending" | "approved" | "rejected" | "flagged";
  moderationScore: number;
  flaggedReasons: string[];
}

export interface Channel {
  id: string;
  name: string;
  description?: string;
  type: "public" | "private" | "direct" | "group" | "broadcast";
  members: string[];
  moderators: string[];
  settings: {
    maxMembers: number;
    requireApproval: boolean;
    allowFiles: boolean;
    allowMedia: boolean;
    autoModeration: boolean;
    rateLimiting: {
      messagesPerMinute: number;
      enabled: boolean;
    };
    encryption: boolean;
    retention: {
      enabled: boolean;
      days: number;
    };
  };
  created: Date;
  lastActivity: Date;
  messageCount: number;
  archived: boolean;
}

export interface User {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  status: "online" | "away" | "busy" | "offline";
  lastSeen: Date;
  preferences: {
    notifications: boolean;
    muteChannels: string[];
    blockedUsers: string[];
    theme: "light" | "dark" | "auto";
    language: string;
  };
  permissions: {
    canCreateChannels: boolean;
    canModerate: boolean;
    canUploadFiles: boolean;
    canMentionAll: boolean;
  };
}

export interface Notification {
  id: string;
  type:
    | "message"
    | "mention"
    | "reaction"
    | "channel_invite"
    | "system"
    | "alert";
  title: string;
  content: string;
  userId: string;
  fromUserId?: string;
  channelId?: string;
  messageId?: string;
  timestamp: Date;
  read: boolean;
  priority: "low" | "normal" | "high" | "urgent";
  actions: Array<{
    label: string;
    action: string;
    data?: any;
  }>;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  html: string;
  text: string;
  variables: string[];
  category: "transactional" | "marketing" | "system" | "notification";
}

export class CommunicationSystem extends EventEmitter {
  private messages = new Map<string, Message>();
  private channels = new Map<string, Channel>();
  private users = new Map<string, User>();
  private notifications = new Map<string, Notification>();
  private connections = new Map<string, WebSocket>();
  private emailTemplates = new Map<string, EmailTemplate>();
  private wsServer?: WebSocketServer;
  private rateLimits = new Map<string, number[]>();

  constructor() {
    super();
    this.setupDefaultChannels();
    this.setupEmailTemplates();
    this.startCleanupJobs();
  }

  private async setupDefaultChannels() {
    // Create default channels
    const generalChannel: Channel = {
      id: "general",
      name: "General",
      description: "General discussion channel",
      type: "public",
      members: [],
      moderators: [],
      settings: {
        maxMembers: 10000,
        requireApproval: false,
        allowFiles: true,
        allowMedia: true,
        autoModeration: true,
        rateLimiting: { messagesPerMinute: 30, enabled: true },
        encryption: false,
        retention: { enabled: true, days: 90 },
      },
      created: new Date(),
      lastActivity: new Date(),
      messageCount: 0,
      archived: false,
    };

    const supportChannel: Channel = {
      id: "support",
      name: "Support",
      description: "Customer support channel",
      type: "public",
      members: [],
      moderators: [],
      settings: {
        maxMembers: 1000,
        requireApproval: false,
        allowFiles: true,
        allowMedia: true,
        autoModeration: true,
        rateLimiting: { messagesPerMinute: 10, enabled: true },
        encryption: false,
        retention: { enabled: true, days: 365 },
      },
      created: new Date(),
      lastActivity: new Date(),
      messageCount: 0,
      archived: false,
    };

    this.channels.set("general", generalChannel);
    this.channels.set("support", supportChannel);
  }

  private setupEmailTemplates() {
    const templates: EmailTemplate[] = [
      {
        id: "welcome",
        name: "Welcome Email",
        subject: "Welcome to Fanz™ Unlimited Network",
        html: `
          <h1>Welcome {{displayName}}!</h1>
          <p>Thank you for joining Fanz™ Unlimited Network. We're excited to have you!</p>
          <p>Your account is now active and you can start exploring our platform.</p>
          <a href="{{platformUrl}}/dashboard">Get Started</a>
        `,
        text: "Welcome {{displayName}}! Thank you for joining Fanz™ Unlimited Network.",
        variables: ["displayName", "platformUrl"],
        category: "transactional",
      },
      {
        id: "password_reset",
        name: "Password Reset",
        subject: "Reset Your Password",
        html: `
          <h1>Password Reset Request</h1>
          <p>Hi {{displayName}},</p>
          <p>You requested a password reset. Click the link below to reset your password:</p>
          <a href="{{resetUrl}}">Reset Password</a>
          <p>This link expires in 1 hour.</p>
        `,
        text: "Password reset requested. Visit: {{resetUrl}}",
        variables: ["displayName", "resetUrl"],
        category: "transactional",
      },
      {
        id: "verification",
        name: "Email Verification",
        subject: "Verify Your Email Address",
        html: `
          <h1>Verify Your Email</h1>
          <p>Please click the link below to verify your email address:</p>
          <a href="{{verificationUrl}}">Verify Email</a>
        `,
        text: "Verify your email: {{verificationUrl}}",
        variables: ["verificationUrl"],
        category: "transactional",
      },
      {
        id: "moderation_alert",
        name: "Content Moderation Alert",
        subject: "Content Moderation Required",
        html: `
          <h1>Content Flagged for Review</h1>
          <p>Content ID: {{contentId}}</p>
          <p>Reason: {{reason}}</p>
          <p>Confidence: {{confidence}}%</p>
          <a href="{{reviewUrl}}">Review Content</a>
        `,
        text: "Content {{contentId}} flagged for {{reason}}. Review: {{reviewUrl}}",
        variables: ["contentId", "reason", "confidence", "reviewUrl"],
        category: "system",
      },
    ];

    for (const template of templates) {
      this.emailTemplates.set(template.id, template);
    }
  }

  private startCleanupJobs() {
    // Clean old messages every hour
    setInterval(() => {
      this.cleanOldMessages();
    }, 3600000);

    // Clean rate limit data every minute
    setInterval(() => {
      this.cleanRateLimitData();
    }, 60000);

    // Update user statuses every 5 minutes
    setInterval(() => {
      this.updateUserStatuses();
    }, 300000);
  }

  setupWebSocket(server: any, path: string = "/ws-chat") {
    this.wsServer = new WebSocketServer({
      server,
      path,
    });

    this.wsServer.on("connection", (ws, req) => {
      this.handleWebSocketConnection(ws, req);
    });
  }

  private handleWebSocketConnection(ws: WebSocket, req: any) {
    const userId = this.extractUserFromRequest(req);
    if (!userId) {
      ws.close(1008, "Authentication required");
      return;
    }

    this.connections.set(userId, ws);
    this.updateUserStatus(userId, "online");

    ws.on("message", (data) => {
      try {
        const message = JSON.parse(data.toString());
        this.handleWebSocketMessage(userId, message, ws);
      } catch (error) {
        console.error("WebSocket message error:", error);
        ws.send(
          JSON.stringify({ type: "error", message: "Invalid message format" }),
        );
      }
    });

    ws.on("close", () => {
      this.connections.delete(userId);
      this.updateUserStatus(userId, "offline");
    });

    ws.on("pong", () => {
      // Update last seen
      this.updateUserLastSeen(userId);
    });

    // Send initial data
    ws.send(
      JSON.stringify({
        type: "connected",
        userId,
        channels: this.getUserChannels(userId),
        unreadCount: this.getUnreadCount(userId),
      }),
    );
  }

  private async handleWebSocketMessage(
    userId: string,
    message: any,
    ws: WebSocket,
  ) {
    switch (message.type) {
      case "send_message":
        await this.sendMessage(
          userId,
          message.channelId,
          message.content,
          message.messageType,
          message.attachments,
        );
        break;

      case "join_channel":
        await this.joinChannel(userId, message.channelId);
        break;

      case "leave_channel":
        await this.leaveChannel(userId, message.channelId);
        break;

      case "create_channel":
        await this.createChannel(userId, message.channelData);
        break;

      case "react_to_message":
        await this.addReaction(message.messageId, userId, message.emoji);
        break;

      case "edit_message":
        await this.editMessage(message.messageId, userId, message.newContent);
        break;

      case "delete_message":
        await this.deleteMessage(message.messageId, userId);
        break;

      case "mark_read":
        await this.markMessagesRead(
          userId,
          message.channelId,
          message.messageIds,
        );
        break;

      case "typing":
        this.broadcastTyping(userId, message.channelId, message.isTyping);
        break;

      case "update_status":
        this.updateUserStatus(userId, message.status);
        break;
    }
  }

  async sendMessage(
    senderId: string,
    channelId: string,
    content: string,
    type: Message["type"] = "text",
    attachments: Message["attachments"] = [],
  ): Promise<string> {
    const channel = this.channels.get(channelId);
    const sender = this.users.get(senderId);

    if (!channel || !sender) {
      throw new Error("Channel or sender not found");
    }

    if (!channel.members.includes(senderId)) {
      throw new Error("User not a member of channel");
    }

    // Check rate limiting
    if (!this.checkRateLimit(senderId, channelId)) {
      throw new Error("Rate limit exceeded");
    }

    // Moderate content
    const moderationResult = await this.moderateContent(content, type);

    const message: Message = {
      id: randomUUID(),
      type,
      content,
      senderId,
      senderName: sender.displayName,
      channelId,
      timestamp: new Date(),
      reactions: [],
      replies: [],
      attachments,
      metadata: {
        encrypted: channel.settings.encryption,
        priority: "normal",
      },
      status: "sent",
      moderationStatus: moderationResult.approved ? "approved" : "pending",
      moderationScore: moderationResult.score,
      flaggedReasons: moderationResult.flags,
    };

    this.messages.set(message.id, message);
    channel.messageCount++;
    channel.lastActivity = new Date();

    // Broadcast to channel members
    this.broadcastToChannel(channelId, {
      type: "new_message",
      message,
    });

    // Send notifications
    await this.sendMessageNotifications(message);

    this.emit("messageSent", message);
    return message.id;
  }

  async sendDirectMessage(
    senderId: string,
    recipientId: string,
    content: string,
    type: Message["type"] = "text",
    attachments: Message["attachments"] = [],
  ): Promise<string> {
    // Create or find direct message channel
    let channelId = this.findDirectMessageChannel(senderId, recipientId);

    if (!channelId) {
      channelId = await this.createDirectMessageChannel(senderId, recipientId);
    }

    return this.sendMessage(senderId, channelId, content, type, attachments);
  }

  private findDirectMessageChannel(
    user1: string,
    user2: string,
  ): string | undefined {
    for (const [channelId, channel] of this.channels.entries()) {
      if (
        channel.type === "direct" &&
        channel.members.length === 2 &&
        channel.members.includes(user1) &&
        channel.members.includes(user2)
      ) {
        return channelId;
      }
    }
    return undefined;
  }

  private async createDirectMessageChannel(
    user1: string,
    user2: string,
  ): Promise<string> {
    const channelId = randomUUID();
    const user1Data = this.users.get(user1);
    const user2Data = this.users.get(user2);

    const channel: Channel = {
      id: channelId,
      name: `${user1Data?.displayName} & ${user2Data?.displayName}`,
      type: "direct",
      members: [user1, user2],
      moderators: [],
      settings: {
        maxMembers: 2,
        requireApproval: false,
        allowFiles: true,
        allowMedia: true,
        autoModeration: true,
        rateLimiting: { messagesPerMinute: 60, enabled: true },
        encryption: true,
        retention: { enabled: true, days: 365 },
      },
      created: new Date(),
      lastActivity: new Date(),
      messageCount: 0,
      archived: false,
    };

    this.channels.set(channelId, channel);
    this.emit("channelCreated", channel);

    return channelId;
  }

  async createChannel(
    creatorId: string,
    channelData: {
      name: string;
      description?: string;
      type: Channel["type"];
      isPrivate?: boolean;
      settings?: Partial<Channel["settings"]>;
    },
  ): Promise<string> {
    const creator = this.users.get(creatorId);
    if (!creator || !creator.permissions.canCreateChannels) {
      throw new Error("User cannot create channels");
    }

    const channelId = randomUUID();
    const defaultSettings: Channel["settings"] = {
      maxMembers: 1000,
      requireApproval: channelData.isPrivate || false,
      allowFiles: true,
      allowMedia: true,
      autoModeration: true,
      rateLimiting: { messagesPerMinute: 30, enabled: true },
      encryption: channelData.isPrivate || false,
      retention: { enabled: true, days: 90 },
    };

    const channel: Channel = {
      id: channelId,
      name: channelData.name,
      description: channelData.description,
      type: channelData.type,
      members: [creatorId],
      moderators: [creatorId],
      settings: { ...defaultSettings, ...channelData.settings },
      created: new Date(),
      lastActivity: new Date(),
      messageCount: 0,
      archived: false,
    };

    this.channels.set(channelId, channel);
    this.emit("channelCreated", channel);

    return channelId;
  }

  async joinChannel(userId: string, channelId: string): Promise<boolean> {
    const channel = this.channels.get(channelId);
    const user = this.users.get(userId);

    if (!channel || !user) return false;
    if (channel.members.includes(userId)) return true;

    // Check if channel requires approval
    if (
      channel.settings.requireApproval &&
      !channel.moderators.includes(userId)
    ) {
      // Send join request to moderators
      await this.sendJoinRequest(userId, channelId);
      return false;
    }

    // Check member limit
    if (channel.members.length >= channel.settings.maxMembers) {
      return false;
    }

    channel.members.push(userId);
    channel.lastActivity = new Date();

    this.broadcastToChannel(channelId, {
      type: "user_joined",
      userId,
      username: user.displayName,
    });

    this.emit("userJoinedChannel", channel, user);
    return true;
  }

  async leaveChannel(userId: string, channelId: string): Promise<boolean> {
    const channel = this.channels.get(channelId);
    if (!channel) return false;

    const memberIndex = channel.members.indexOf(userId);
    if (memberIndex === -1) return false;

    channel.members.splice(memberIndex, 1);

    // Remove from moderators if applicable
    const modIndex = channel.moderators.indexOf(userId);
    if (modIndex !== -1) {
      channel.moderators.splice(modIndex, 1);
    }

    // If no members left, archive the channel (except for direct messages)
    if (channel.members.length === 0 && channel.type !== "direct") {
      channel.archived = true;
    }

    this.broadcastToChannel(channelId, {
      type: "user_left",
      userId,
    });

    this.emit("userLeftChannel", channel, userId);
    return true;
  }

  private async moderateContent(
    content: string,
    type: Message["type"],
  ): Promise<{
    approved: boolean;
    score: number;
    flags: string[];
  }> {
    if (type !== "text") {
      // For non-text content, assume approved for now
      // In practice, this would analyze images/videos/files
      return { approved: true, score: 0, flags: [] };
    }

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `You are a content moderator. Analyze this message for:
            - Hate speech
            - Harassment
            - Adult content
            - Violence
            - Spam
            - Misinformation
            
            Return JSON with:
            - score: 0-100 (higher = more problematic)
            - flags: array of detected issues
            - approved: boolean (score < 70)`,
          },
          {
            role: "user",
            content,
          },
        ],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content!);
      return {
        approved: result.approved || result.score < 70,
        score: result.score || 0,
        flags: result.flags || [],
      };
    } catch (error) {
      console.error("Content moderation error:", error);
      // Default to approved if moderation fails
      return { approved: true, score: 0, flags: [] };
    }
  }

  async addReaction(
    messageId: string,
    userId: string,
    emoji: string,
  ): Promise<boolean> {
    const message = this.messages.get(messageId);
    if (!message) return false;

    let reaction = message.reactions.find((r) => r.emoji === emoji);

    if (reaction) {
      if (reaction.users.includes(userId)) {
        // Remove reaction
        reaction.users = reaction.users.filter((u) => u !== userId);
        reaction.count = reaction.users.length;

        if (reaction.count === 0) {
          message.reactions = message.reactions.filter(
            (r) => r.emoji !== emoji,
          );
        }
      } else {
        // Add reaction
        reaction.users.push(userId);
        reaction.count = reaction.users.length;
      }
    } else {
      // Create new reaction
      message.reactions.push({
        emoji,
        users: [userId],
        count: 1,
      });
    }

    this.broadcastToChannel(message.channelId!, {
      type: "message_reaction",
      messageId,
      reactions: message.reactions,
    });

    this.emit("reactionAdded", message, emoji, userId);
    return true;
  }

  async editMessage(
    messageId: string,
    userId: string,
    newContent: string,
  ): Promise<boolean> {
    const message = this.messages.get(messageId);
    if (!message || message.senderId !== userId) return false;

    const moderationResult = await this.moderateContent(
      newContent,
      message.type,
    );

    message.content = newContent;
    message.edited = new Date();
    message.moderationStatus = moderationResult.approved
      ? "approved"
      : "pending";
    message.moderationScore = moderationResult.score;
    message.flaggedReasons = moderationResult.flags;

    this.broadcastToChannel(message.channelId!, {
      type: "message_edited",
      messageId,
      newContent,
      edited: message.edited,
    });

    this.emit("messageEdited", message);
    return true;
  }

  async deleteMessage(messageId: string, userId: string): Promise<boolean> {
    const message = this.messages.get(messageId);
    if (!message) return false;

    const channel = this.channels.get(message.channelId!);
    const canDelete =
      message.senderId === userId ||
      (channel && channel.moderators.includes(userId));

    if (!canDelete) return false;

    this.messages.delete(messageId);

    if (channel) {
      channel.messageCount = Math.max(0, channel.messageCount - 1);
    }

    this.broadcastToChannel(message.channelId!, {
      type: "message_deleted",
      messageId,
    });

    this.emit("messageDeleted", message);
    return true;
  }

  async sendNotification(
    notification: Omit<Notification, "id" | "timestamp" | "read">,
  ): Promise<string> {
    const notificationId = randomUUID();
    const fullNotification: Notification = {
      ...notification,
      id: notificationId,
      timestamp: new Date(),
      read: false,
    };

    this.notifications.set(notificationId, fullNotification);

    // Send via WebSocket if user is connected
    const connection = this.connections.get(notification.userId);
    if (connection && connection.readyState === WebSocket.OPEN) {
      connection.send(
        JSON.stringify({
          type: "notification",
          notification: fullNotification,
        }),
      );
    }

    // Send email notification if high priority
    if (["high", "urgent"].includes(notification.priority)) {
      await this.sendEmailNotification(fullNotification);
    }

    // Send push notification
    await this.sendPushNotification(fullNotification);

    this.emit("notificationSent", fullNotification);
    return notificationId;
  }

  async sendEmail(
    to: string,
    templateId: string,
    variables: Record<string, string>,
    options: {
      from?: string;
      priority?: "low" | "normal" | "high";
      category?: string;
    } = {},
  ): Promise<boolean> {
    const template = this.emailTemplates.get(templateId);
    if (!template) {
      throw new Error(`Email template ${templateId} not found`);
    }

    let subject = template.subject;
    let html = template.html;
    let text = template.text;

    // Replace variables
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`;
      subject = subject.replace(new RegExp(placeholder, "g"), value);
      html = html.replace(new RegExp(placeholder, "g"), value);
      text = text.replace(new RegExp(placeholder, "g"), value);
    }

    try {
      // In a real implementation, this would integrate with an email service
      // For now, we'll simulate email sending
      console.log("Sending email:", {
        to,
        subject,
        html,
        text,
        from: options.from || "noreply@fanzunlimited.com",
        priority: options.priority || "normal",
        category: options.category || template.category,
      });

      this.emit("emailSent", {
        to,
        templateId,
        subject,
        timestamp: new Date(),
      });

      return true;
    } catch (error) {
      console.error("Email sending failed:", error);
      return false;
    }
  }

  private async sendEmailNotification(notification: Notification) {
    const user = this.users.get(notification.userId);
    if (!user || !user.preferences.notifications) return;

    // Use appropriate email template based on notification type
    let templateId = "notification_generic";

    switch (notification.type) {
      case "message":
        templateId = "new_message";
        break;
      case "mention":
        templateId = "mention";
        break;
      case "system":
        templateId = "system_alert";
        break;
    }

    await this.sendEmail(user.id, templateId, {
      displayName: user.displayName,
      title: notification.title,
      content: notification.content,
      timestamp: notification.timestamp.toLocaleString(),
    });
  }

  private async sendPushNotification(notification: Notification) {
    // In a real implementation, this would integrate with push notification services
    console.log("Push notification:", {
      userId: notification.userId,
      title: notification.title,
      content: notification.content,
      priority: notification.priority,
    });

    this.emit("pushNotificationSent", notification);
  }

  private async sendMessageNotifications(message: Message) {
    if (!message.channelId) return;

    const channel = this.channels.get(message.channelId);
    if (!channel) return;

    // Send notifications to all channel members except sender
    for (const memberId of channel.members) {
      if (memberId === message.senderId) continue;

      const user = this.users.get(memberId);
      if (!user || !user.preferences.notifications) continue;
      if (user.preferences.muteChannels.includes(message.channelId)) continue;

      // Check if user is mentioned
      const isMentioned =
        message.content.includes(`@${user.username}`) ||
        message.content.includes("@everyone") ||
        message.content.includes("@here");

      const notificationType = isMentioned ? "mention" : "message";
      const priority = isMentioned ? "high" : "normal";

      await this.sendNotification({
        type: notificationType,
        title: isMentioned ? "You were mentioned" : "New message",
        content: `${message.senderName}: ${message.content.substring(0, 100)}`,
        userId: memberId,
        fromUserId: message.senderId,
        channelId: message.channelId,
        messageId: message.id,
        priority: priority as Notification["priority"],
        actions: [
          {
            label: "View",
            action: "view_message",
            data: { messageId: message.id },
          },
          {
            label: "Reply",
            action: "reply_message",
            data: { messageId: message.id },
          },
        ],
      });
    }
  }

  private checkRateLimit(userId: string, channelId: string): boolean {
    const channel = this.channels.get(channelId);
    if (!channel || !channel.settings.rateLimiting.enabled) return true;

    const key = `${userId}:${channelId}`;
    const now = Date.now();
    const windowMs = 60000; // 1 minute
    const limit = channel.settings.rateLimiting.messagesPerMinute;

    if (!this.rateLimits.has(key)) {
      this.rateLimits.set(key, []);
    }

    const timestamps = this.rateLimits.get(key)!;

    // Remove old timestamps outside the window
    const validTimestamps = timestamps.filter((ts) => now - ts < windowMs);

    if (validTimestamps.length >= limit) {
      return false;
    }

    validTimestamps.push(now);
    this.rateLimits.set(key, validTimestamps);

    return true;
  }

  private broadcastToChannel(channelId: string, data: any) {
    const channel = this.channels.get(channelId);
    if (!channel) return;

    for (const memberId of channel.members) {
      const connection = this.connections.get(memberId);
      if (connection && connection.readyState === WebSocket.OPEN) {
        connection.send(JSON.stringify(data));
      }
    }
  }

  private broadcastTyping(
    userId: string,
    channelId: string,
    isTyping: boolean,
  ) {
    this.broadcastToChannel(channelId, {
      type: "typing",
      userId,
      channelId,
      isTyping,
    });
  }

  private updateUserStatus(userId: string, status: User["status"]) {
    const user = this.users.get(userId);
    if (user) {
      user.status = status;
      user.lastSeen = new Date();

      // Broadcast status update
      this.broadcast({
        type: "user_status",
        userId,
        status,
      });
    }
  }

  private updateUserLastSeen(userId: string) {
    const user = this.users.get(userId);
    if (user) {
      user.lastSeen = new Date();
    }
  }

  private broadcast(data: any) {
    for (const connection of this.connections.values()) {
      if (connection.readyState === WebSocket.OPEN) {
        connection.send(JSON.stringify(data));
      }
    }
  }

  private extractUserFromRequest(req: any): string | undefined {
    // In a real implementation, this would extract user ID from JWT or session
    // For now, return mock user ID
    return req.headers["x-user-id"] || req.url.searchParams?.get("userId");
  }

  private getUserChannels(userId: string): Channel[] {
    return Array.from(this.channels.values()).filter((channel) =>
      channel.members.includes(userId),
    );
  }

  private getUnreadCount(userId: string): number {
    return Array.from(this.notifications.values()).filter(
      (n) => n.userId === userId && !n.read,
    ).length;
  }

  private async sendJoinRequest(userId: string, channelId: string) {
    const channel = this.channels.get(channelId);
    const user = this.users.get(userId);

    if (!channel || !user) return;

    // Send notification to moderators
    for (const moderatorId of channel.moderators) {
      await this.sendNotification({
        type: "channel_invite",
        title: "Channel Join Request",
        content: `${user.displayName} wants to join ${channel.name}`,
        userId: moderatorId,
        fromUserId: userId,
        channelId,
        priority: "normal",
        actions: [
          {
            label: "Approve",
            action: "approve_join",
            data: { userId, channelId },
          },
          { label: "Deny", action: "deny_join", data: { userId, channelId } },
        ],
      });
    }
  }

  private async markMessagesRead(
    userId: string,
    channelId: string,
    messageIds: string[],
  ) {
    for (const messageId of messageIds) {
      const message = this.messages.get(messageId);
      if (message && message.channelId === channelId) {
        message.status = "read";
      }
    }

    // Mark related notifications as read
    for (const notification of this.notifications.values()) {
      if (
        notification.userId === userId &&
        notification.channelId === channelId &&
        messageIds.includes(notification.messageId || "")
      ) {
        notification.read = true;
      }
    }
  }

  private cleanOldMessages() {
    const now = new Date();

    for (const [messageId, message] of this.messages.entries()) {
      if (!message.channelId) continue;

      const channel = this.channels.get(message.channelId);
      if (!channel || !channel.settings.retention.enabled) continue;

      const retentionMs = channel.settings.retention.days * 24 * 60 * 60 * 1000;
      if (now.getTime() - message.timestamp.getTime() > retentionMs) {
        this.messages.delete(messageId);
        channel.messageCount = Math.max(0, channel.messageCount - 1);
      }
    }
  }

  private cleanRateLimitData() {
    const now = Date.now();
    const windowMs = 60000; // 1 minute

    for (const [key, timestamps] of this.rateLimits.entries()) {
      const validTimestamps = timestamps.filter((ts) => now - ts < windowMs);
      if (validTimestamps.length === 0) {
        this.rateLimits.delete(key);
      } else {
        this.rateLimits.set(key, validTimestamps);
      }
    }
  }

  private updateUserStatuses() {
    const now = new Date();
    const offlineThreshold = 5 * 60 * 1000; // 5 minutes

    for (const user of this.users.values()) {
      if (
        user.status === "online" &&
        now.getTime() - user.lastSeen.getTime() > offlineThreshold
      ) {
        user.status = "offline";

        this.broadcast({
          type: "user_status",
          userId: user.id,
          status: "offline",
        });
      }
    }
  }

  // Public API methods
  getChannel(channelId: string): Channel | undefined {
    return this.channels.get(channelId);
  }

  getChannels(): Channel[] {
    return Array.from(this.channels.values());
  }

  getMessage(messageId: string): Message | undefined {
    return this.messages.get(messageId);
  }

  getChannelMessages(
    channelId: string,
    limit: number = 50,
    before?: string,
  ): Message[] {
    const messages = Array.from(this.messages.values())
      .filter((m) => m.channelId === channelId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    if (before) {
      const beforeIndex = messages.findIndex((m) => m.id === before);
      if (beforeIndex !== -1) {
        return messages.slice(beforeIndex + 1, beforeIndex + 1 + limit);
      }
    }

    return messages.slice(0, limit);
  }

  getUser(userId: string): User | undefined {
    return this.users.get(userId);
  }

  getUsers(): User[] {
    return Array.from(this.users.values());
  }

  getNotifications(userId: string, limit: number = 20): Notification[] {
    return Array.from(this.notifications.values())
      .filter((n) => n.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  getStats() {
    return {
      messages: this.messages.size,
      channels: this.channels.size,
      users: this.users.size,
      notifications: this.notifications.size,
      activeConnections: this.connections.size,
      emailTemplates: this.emailTemplates.size,
    };
  }
}

// Singleton instance
export const communicationSystem = new CommunicationSystem();
