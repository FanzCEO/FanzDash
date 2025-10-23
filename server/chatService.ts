import { WebSocket, WebSocketServer } from "ws";
import { db } from "./db";
import {
  users,
  chatRooms,
  chatMessages,
  chatParticipants,
  securityAuditLog,
  type InsertChatRoom,
  type InsertChatMessage,
  type InsertChatParticipant,
  type ChatRoom,
  type ChatMessage,
  type User,
} from "@shared/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import OpenAI from "openai";

// Initialize OpenAI for content moderation
const isDevMode = !process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes("placeholder") || process.env.OPENAI_API_KEY.includes("development");
const openai = isDevMode ? null : new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface ChatClient {
  id: string;
  userId: string;
  username: string;
  rooms: Set<string>;
  ws: WebSocket;
  lastSeen: Date;
}

export class ChatService {
  private clients: Map<string, ChatClient> = new Map();
  private rooms: Map<string, Set<string>> = new Map(); // roomId -> Set of clientIds

  constructor(private wss: WebSocketServer) {
    this.setupWebSocketHandlers();
  }

  private setupWebSocketHandlers() {
    this.wss.on("connection", (ws: WebSocket, req: any) => {
      const clientId = nanoid();

      ws.on("message", async (data: Buffer) => {
        try {
          const message = JSON.parse(data.toString());
          await this.handleMessage(clientId, message, ws);
        } catch (error) {
          console.error("Error handling chat message:", error);
          this.sendError(ws, "Invalid message format");
        }
      });

      ws.on("close", () => {
        this.handleDisconnect(clientId);
      });

      ws.on("error", (error) => {
        console.error("Chat WebSocket error:", error);
        this.handleDisconnect(clientId);
      });
    });
  }

  private async handleMessage(clientId: string, message: any, ws: WebSocket) {
    switch (message.type) {
      case "auth":
        await this.handleAuth(clientId, message, ws);
        break;
      case "join_room":
        await this.handleJoinRoom(clientId, message);
        break;
      case "leave_room":
        await this.handleLeaveRoom(clientId, message);
        break;
      case "send_message":
        await this.handleSendMessage(clientId, message);
        break;
      case "typing":
        await this.handleTyping(clientId, message);
        break;
      case "get_history":
        await this.handleGetHistory(clientId, message);
        break;
      default:
        this.sendError(ws, "Unknown message type");
    }
  }

  private async handleAuth(clientId: string, message: any, ws: WebSocket) {
    try {
      const { token, userId, username } = message;

      // In production, verify JWT token here
      if (!userId || !username) {
        this.sendError(ws, "Authentication required");
        return;
      }

      const client: ChatClient = {
        id: clientId,
        userId,
        username,
        rooms: new Set(),
        ws,
        lastSeen: new Date(),
      };

      this.clients.set(clientId, client);

      this.sendMessage(ws, {
        type: "auth_success",
        clientId,
        userId,
        username,
      });

      // Log authentication event
      await this.logSecurityEvent(userId, "chat_auth", {
        clientId,
        success: true,
      });
    } catch (error) {
      console.error("Auth error:", error);
      this.sendError(ws, "Authentication failed");
    }
  }

  private async handleJoinRoom(clientId: string, message: any) {
    try {
      const client = this.clients.get(clientId);
      if (!client) {
        this.sendError(client?.ws, "Not authenticated");
        return;
      }

      const { roomId, roomType = "public" } = message;

      // Verify user can join this room
      const canJoin = await this.canUserJoinRoom(
        client.userId,
        roomId,
        roomType,
      );
      if (!canJoin) {
        this.sendError(client.ws, "Access denied to room");
        return;
      }

      // Add client to room
      client.rooms.add(roomId);

      if (!this.rooms.has(roomId)) {
        this.rooms.set(roomId, new Set());
      }
      this.rooms.get(roomId)!.add(clientId);

      // Add to database
      await this.addParticipantToRoom(client.userId, roomId);

      // Notify room members
      this.broadcastToRoom(
        roomId,
        {
          type: "user_joined",
          roomId,
          userId: client.userId,
          username: client.username,
          timestamp: new Date().toISOString(),
        },
        clientId,
      );

      // Send join confirmation
      this.sendMessage(client.ws, {
        type: "room_joined",
        roomId,
        participants: await this.getRoomParticipants(roomId),
      });
    } catch (error) {
      console.error("Join room error:", error);
      this.sendError(this.clients.get(clientId)?.ws, "Failed to join room");
    }
  }

  private async handleLeaveRoom(clientId: string, message: any) {
    try {
      const client = this.clients.get(clientId);
      if (!client) return;

      const { roomId } = message;

      client.rooms.delete(roomId);
      this.rooms.get(roomId)?.delete(clientId);

      // Remove from database
      await this.removeParticipantFromRoom(client.userId, roomId);

      // Notify room members
      this.broadcastToRoom(
        roomId,
        {
          type: "user_left",
          roomId,
          userId: client.userId,
          username: client.username,
          timestamp: new Date().toISOString(),
        },
        clientId,
      );
    } catch (error) {
      console.error("Leave room error:", error);
    }
  }

  private async handleSendMessage(clientId: string, message: any) {
    try {
      const client = this.clients.get(clientId);
      if (!client) {
        this.sendError(client?.ws, "Not authenticated");
        return;
      }

      const { roomId, content, messageType = "text" } = message;

      if (!client.rooms.has(roomId)) {
        this.sendError(client.ws, "Not in this room");
        return;
      }

      // Content moderation check
      const isSafe = await this.moderateContent(content);
      if (!isSafe) {
        this.sendError(client.ws, "Message blocked by content filter");
        await this.logSecurityEvent(client.userId, "chat_message_blocked", {
          roomId,
          content,
          reason: "content_moderation",
        });
        return;
      }

      // Save message to database
      const chatMessage = await this.saveMessage({
        roomId,
        userId: client.userId,
        content,
        messageType,
        metadata: {
          username: client.username,
          clientId,
        },
      });

      // Broadcast to room members
      this.broadcastToRoom(roomId, {
        type: "new_message",
        message: {
          id: chatMessage.id,
          roomId,
          userId: client.userId,
          username: client.username,
          content,
          messageType,
          timestamp: chatMessage.createdAt,
        },
      });
    } catch (error) {
      console.error("Send message error:", error);
      this.sendError(this.clients.get(clientId)?.ws, "Failed to send message");
    }
  }

  private async handleTyping(clientId: string, message: any) {
    try {
      const client = this.clients.get(clientId);
      if (!client) return;

      const { roomId, isTyping } = message;

      if (!client.rooms.has(roomId)) return;

      this.broadcastToRoom(
        roomId,
        {
          type: "typing",
          roomId,
          userId: client.userId,
          username: client.username,
          isTyping,
          timestamp: new Date().toISOString(),
        },
        clientId,
      );
    } catch (error) {
      console.error("Typing indicator error:", error);
    }
  }

  private async handleGetHistory(clientId: string, message: any) {
    try {
      const client = this.clients.get(clientId);
      if (!client) return;

      const { roomId, limit = 50, offset = 0 } = message;

      if (!client.rooms.has(roomId)) {
        this.sendError(client.ws, "Not in this room");
        return;
      }

      const messages = await this.getChatHistory(roomId, limit, offset);

      this.sendMessage(client.ws, {
        type: "chat_history",
        roomId,
        messages,
        hasMore: messages.length === limit,
      });
    } catch (error) {
      console.error("Get history error:", error);
      this.sendError(this.clients.get(clientId)?.ws, "Failed to get history");
    }
  }

  private handleDisconnect(clientId: string) {
    const client = this.clients.get(clientId);
    if (!client) return;

    // Leave all rooms
    client.rooms.forEach((roomId) => {
      this.rooms.get(roomId)?.delete(clientId);

      // Notify room members
      this.broadcastToRoom(
        roomId,
        {
          type: "user_left",
          roomId,
          userId: client.userId,
          username: client.username,
          timestamp: new Date().toISOString(),
        },
        clientId,
      );
    });

    this.clients.delete(clientId);
  }

  private async canUserJoinRoom(
    userId: string,
    roomId: string,
    roomType: string,
  ): Promise<boolean> {
    // Implement room access control logic
    // For now, allow all authenticated users to join public rooms
    if (roomType === "public") return true;

    // For private rooms, check if user is invited or has permission
    const participant = await db
      .select()
      .from(chatParticipants)
      .where(
        and(
          eq(chatParticipants.userId, userId),
          eq(chatParticipants.roomId, roomId),
        ),
      )
      .limit(1);

    return participant.length > 0;
  }

  private async addParticipantToRoom(userId: string, roomId: string) {
    try {
      await db
        .insert(chatParticipants)
        .values({
          userId,
          roomId,
          joinedAt: new Date(),
        })
        .onConflictDoNothing();
    } catch (error) {
      console.error("Error adding participant to room:", error);
    }
  }

  private async removeParticipantFromRoom(userId: string, roomId: string) {
    try {
      await db
        .update(chatParticipants)
        .set({ leftAt: new Date() })
        .where(
          and(
            eq(chatParticipants.userId, userId),
            eq(chatParticipants.roomId, roomId),
          ),
        );
    } catch (error) {
      console.error("Error removing participant from room:", error);
    }
  }

  private async getRoomParticipants(roomId: string): Promise<any[]> {
    try {
      const participants = await db
        .select({
          userId: users.id,
          username: users.username,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          joinedAt: chatParticipants.joinedAt,
        })
        .from(chatParticipants)
        .innerJoin(users, eq(users.id, chatParticipants.userId))
        .where(
          and(
            eq(chatParticipants.roomId, roomId),
            eq(chatParticipants.leftAt, null),
          ),
        );

      return participants;
    } catch (error) {
      console.error("Error getting room participants:", error);
      return [];
    }
  }

  private async saveMessage(
    messageData: InsertChatMessage,
  ): Promise<ChatMessage> {
    const [message] = await db
      .insert(chatMessages)
      .values(messageData)
      .returning();
    return message;
  }

  private async getChatHistory(
    roomId: string,
    limit: number,
    offset: number,
  ): Promise<any[]> {
    try {
      const messages = await db
        .select({
          id: chatMessages.id,
          content: chatMessages.content,
          messageType: chatMessages.messageType,
          createdAt: chatMessages.createdAt,
          userId: users.id,
          username: users.username,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
        })
        .from(chatMessages)
        .innerJoin(users, eq(users.id, chatMessages.userId))
        .where(eq(chatMessages.roomId, roomId))
        .orderBy(desc(chatMessages.createdAt))
        .limit(limit)
        .offset(offset);

      return messages.reverse(); // Return in chronological order
    } catch (error) {
      console.error("Error getting chat history:", error);
      return [];
    }
  }

  private async moderateContent(content: string): Promise<boolean> {
    try {
      if (!process.env.OPENAI_API_KEY) {
        // Fallback to basic keyword filtering
        const toxicKeywords = [
          "hate",
          "harassment",
          "violence",
          "illegal",
          "spam",
        ];
        const lowerContent = content.toLowerCase();
        return !toxicKeywords.some((keyword) => lowerContent.includes(keyword));
      }

      const response = await openai.moderations.create({
        input: content,
      });

      const moderation = response.results[0];
      return !moderation.flagged;
    } catch (error) {
      console.error("Content moderation error:", error);
      // Default to allowing content if moderation fails
      return true;
    }
  }

  private broadcastToRoom(
    roomId: string,
    message: any,
    excludeClientId?: string,
  ) {
    const roomClients = this.rooms.get(roomId);
    if (!roomClients) return;

    roomClients.forEach((clientId) => {
      if (clientId === excludeClientId) return;

      const client = this.clients.get(clientId);
      if (client && client.ws.readyState === WebSocket.OPEN) {
        this.sendMessage(client.ws, message);
      }
    });
  }

  private sendMessage(ws: WebSocket, message: any) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  private sendError(ws: WebSocket | undefined, error: string) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          type: "error",
          error,
          timestamp: new Date().toISOString(),
        }),
      );
    }
  }

  private async logSecurityEvent(userId: string, event: string, details: any) {
    try {
      await db.insert(securityAuditLog).values({
        userId,
        event,
        details,
        success: details.success || false,
      });
    } catch (error) {
      console.error("Failed to log security event:", error);
    }
  }

  // Public API methods for creating/managing chat rooms
  async createChatRoom(
    creatorId: string,
    name: string,
    description?: string,
    isPrivate: boolean = false,
  ): Promise<ChatRoom> {
    const [room] = await db
      .insert(chatRooms)
      .values({
        name,
        description,
        createdBy: creatorId,
        isPrivate,
        settings: {
          maxParticipants: 100,
          allowFileUploads: true,
          moderationLevel: "standard",
        },
      })
      .returning();

    // Add creator as first participant
    await this.addParticipantToRoom(creatorId, room.id);

    return room;
  }

  async getRoomsByUser(userId: string): Promise<ChatRoom[]> {
    const rooms = await db
      .select()
      .from(chatRooms)
      .innerJoin(chatParticipants, eq(chatParticipants.roomId, chatRooms.id))
      .where(
        and(
          eq(chatParticipants.userId, userId),
          eq(chatParticipants.leftAt, null),
        ),
      );

    return rooms.map((r) => r.chat_rooms);
  }

  getConnectedUsers(roomId?: string): any[] {
    if (roomId) {
      const roomClients = this.rooms.get(roomId);
      if (!roomClients) return [];

      return Array.from(roomClients)
        .map((clientId) => {
          const client = this.clients.get(clientId);
          return client
            ? {
                userId: client.userId,
                username: client.username,
                lastSeen: client.lastSeen,
              }
            : null;
        })
        .filter(Boolean);
    }

    return Array.from(this.clients.values()).map((client) => ({
      userId: client.userId,
      username: client.username,
      rooms: Array.from(client.rooms),
      lastSeen: client.lastSeen,
    }));
  }
}

export default ChatService;
