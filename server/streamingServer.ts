import { createServer, Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { spawn, ChildProcess } from "child_process";
import { EventEmitter } from "events";
import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import { join } from "path";

export interface StreamSession {
  id: string;
  streamKey: string;
  title: string;
  description?: string;
  category: string;
  userId: string;
  status: "starting" | "live" | "stopped" | "error";
  viewers: number;
  startTime: Date;
  endTime?: Date;
  rtmpUrl: string;
  hlsUrl: string;
  dashUrl: string;
  thumbnailUrl?: string;
  bitrate?: number;
  resolution?: string;
  fps?: number;
  duration: number;
  settings: StreamSettings;
}

export interface StreamSettings {
  maxBitrate: number;
  resolution: string;
  fps: number;
  audioCodec: "aac" | "opus";
  videoCodec: "h264" | "h265";
  enableRecording: boolean;
  enableThumbnails: boolean;
  autoStart: boolean;
  chatEnabled: boolean;
  moderationEnabled: boolean;
}

export interface StreamViewer {
  id: string;
  sessionId: string;
  userId?: string;
  ipAddress: string;
  userAgent: string;
  joinTime: Date;
  lastActivity: Date;
  quality: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  userId?: string;
  username: string;
  message: string;
  timestamp: Date;
  type: "message" | "emote" | "system";
  moderated?: boolean;
}

export class StreamingServer extends EventEmitter {
  private httpServer!: Server;
  private wsServer!: WebSocketServer;
  private rtmpServer?: ChildProcess;
  private sessions = new Map<string, StreamSession>();
  private viewers = new Map<string, StreamViewer>();
  private chatMessages = new Map<string, ChatMessage[]>();
  private streamProcesses = new Map<string, ChildProcess>();

  private readonly RTMP_PORT = 1935;
  private readonly HTTP_PORT = 8080;
  private readonly WS_PORT = 8081;

  constructor() {
    super();
    this.setupServers();
    this.setupDirectories();
    this.startRTMPServer();
  }

  private setupServers() {
    // HTTP server for HLS/DASH delivery
    this.httpServer = createServer(async (req, res) => {
      await this.handleHttpRequest(req, res);
    });

    // WebSocket server for real-time updates
    this.wsServer = new WebSocketServer({
      server: this.httpServer,
      path: "/stream-ws",
    });

    this.wsServer.on("connection", (ws, req) => {
      this.handleWebSocketConnection(ws, req);
    });

    this.httpServer.listen(this.HTTP_PORT, () => {
      console.log(`Streaming HTTP server listening on port ${this.HTTP_PORT}`);
    });
  }

  private async setupDirectories() {
    const dirs = [
      "streams/live",
      "streams/recordings",
      "streams/thumbnails",
      "streams/hls",
      "streams/dash",
    ];

    for (const dir of dirs) {
      await fs.mkdir(join(process.cwd(), "media", dir), { recursive: true });
    }
  }

  private startRTMPServer() {
    // Check if ffmpeg is available  
    const testProcess = spawn('ffmpeg', ['-version']);
    
    testProcess.on('error', (error: any) => {
      if (error.code === 'ENOENT') {
        console.warn('⚠️  FFmpeg not found - RTMP streaming disabled for development');
        console.log(`RTMP server listening on port ${this.RTMP_PORT} (mock mode)`);
        return;
      }
    });
    
    testProcess.on('exit', (code: number) => {
      if (code === 0) {
        // FFmpeg is available, start the real RTMP server
        this.rtmpServer = spawn("ffmpeg", [
          "-listen",
          "1",
          "-f",
          "flv",
          "-i",
          `rtmp://localhost:${this.RTMP_PORT}/live`,
          "-c",
          "copy",
          "-f",
          "null",
          "-",
        ]);

        this.rtmpServer.on("error", (error) => {
          console.error("RTMP server error:", error);
          // Don't emit error to prevent crashing
        });

        console.log(`RTMP server listening on port ${this.RTMP_PORT}`);
      }
    });
  }

  async createStream(
    streamKey: string,
    userId: string,
    options: {
      title: string;
      description?: string;
      category: string;
      settings?: Partial<StreamSettings>;
    },
  ): Promise<StreamSession> {
    const sessionId = randomUUID();

    const defaultSettings: StreamSettings = {
      maxBitrate: 6000,
      resolution: "1920x1080",
      fps: 30,
      audioCodec: "aac",
      videoCodec: "h264",
      enableRecording: true,
      enableThumbnails: true,
      autoStart: false,
      chatEnabled: true,
      moderationEnabled: true,
    };

    const session: StreamSession = {
      id: sessionId,
      streamKey,
      title: options.title,
      description: options.description,
      category: options.category,
      userId,
      status: "starting",
      viewers: 0,
      startTime: new Date(),
      rtmpUrl: `rtmp://localhost:${this.RTMP_PORT}/live/${streamKey}`,
      hlsUrl: `http://localhost:${this.HTTP_PORT}/hls/${sessionId}/playlist.m3u8`,
      dashUrl: `http://localhost:${this.HTTP_PORT}/dash/${sessionId}/manifest.mpd`,
      duration: 0,
      settings: { ...defaultSettings, ...options.settings },
    };

    this.sessions.set(sessionId, session);
    this.chatMessages.set(sessionId, []);

    // Setup stream processing
    await this.setupStreamProcessing(session);

    this.emit("streamCreated", session);
    return session;
  }

  private async setupStreamProcessing(session: StreamSession) {
    const hlsPath = join(process.cwd(), "media", "streams", "hls", session.id);
    const dashPath = join(
      process.cwd(),
      "media",
      "streams",
      "dash",
      session.id,
    );
    const recordingPath = join(
      process.cwd(),
      "media",
      "streams",
      "recordings",
      `${session.id}.mp4`,
    );

    // Create output directories
    await fs.mkdir(hlsPath, { recursive: true });
    await fs.mkdir(dashPath, { recursive: true });

    // Build FFmpeg command for stream processing
    const ffmpegArgs = [
      "-f",
      "flv",
      "-listen",
      "1",
      "-i",
      `rtmp://localhost:${this.RTMP_PORT}/live/${session.streamKey}`,

      // Video encoding
      "-c:v",
      session.settings.videoCodec === "h265" ? "libx265" : "libx264",
      "-preset",
      "veryfast",
      "-tune",
      "zerolatency",
      "-maxrate",
      `${session.settings.maxBitrate}k`,
      "-bufsize",
      `${session.settings.maxBitrate * 2}k`,
      "-vf",
      `scale=${session.settings.resolution.replace("x", ":")}`,
      "-r",
      session.settings.fps.toString(),
      "-g",
      (session.settings.fps * 2).toString(), // Keyframe interval

      // Audio encoding
      "-c:a",
      session.settings.audioCodec,
      "-b:a",
      "128k",
      "-ar",
      "48000",
      "-ac",
      "2",

      // HLS output
      "-f",
      "hls",
      "-hls_time",
      "6",
      "-hls_list_size",
      "10",
      "-hls_flags",
      "delete_segments+independent_segments",
      "-hls_segment_type",
      "mpegts",
      "-hls_segment_filename",
      join(hlsPath, "segment_%03d.ts"),
      join(hlsPath, "playlist.m3u8"),

      // DASH output
      "-f",
      "dash",
      "-seg_duration",
      "6",
      "-adaptation_sets",
      "id=0,streams=v id=1,streams=a",
      join(dashPath, "manifest.mpd"),
    ];

    // Add recording if enabled
    if (session.settings.enableRecording) {
      ffmpegArgs.push("-c", "copy", "-f", "mp4", recordingPath);
    }

    // Start stream processing
    const streamProcess = spawn("ffmpeg", ffmpegArgs);
    this.streamProcesses.set(session.id, streamProcess);

    // Handle stream events
    streamProcess.on("spawn", () => {
      session.status = "live";
      this.emit("streamStarted", session);
      this.broadcastToViewers(session.id, { type: "streamStarted", session });
    });

    streamProcess.stderr?.on("data", (data) => {
      const output = data.toString();

      // Parse stream information
      this.parseStreamInfo(session, output);

      // Generate thumbnails if enabled
      if (session.settings.enableThumbnails && Math.random() < 0.01) {
        // 1% chance per frame
        this.generateStreamThumbnail(session);
      }
    });

    streamProcess.on("close", (code) => {
      session.status = code === 0 ? "stopped" : "error";
      session.endTime = new Date();
      this.streamProcesses.delete(session.id);

      this.emit("streamEnded", session);
      this.broadcastToViewers(session.id, { type: "streamEnded", session });

      // Cleanup viewers
      this.removeAllViewers(session.id);
    });

    streamProcess.on("error", (error) => {
      session.status = "error";
      console.error(`Stream ${session.id} error:`, error);
      this.emit("streamError", session, error);
    });
  }

  private parseStreamInfo(session: StreamSession, output: string) {
    // Parse bitrate
    const bitrateMatch = output.match(/bitrate=\s*(\d+\.?\d*)kbits\/s/);
    if (bitrateMatch) {
      session.bitrate = parseFloat(bitrateMatch[1]);
    }

    // Parse frame rate
    const fpsMatch = output.match(/fps=\s*(\d+\.?\d*)/);
    if (fpsMatch) {
      session.fps = parseFloat(fpsMatch[1]);
    }

    // Parse time for duration
    const timeMatch = output.match(/time=(\d{2}):(\d{2}):(\d{2}\.\d{2})/);
    if (timeMatch) {
      const [, hours, minutes, seconds] = timeMatch;
      session.duration =
        parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseFloat(seconds);
    }

    // Update session
    this.sessions.set(session.id, session);
    this.emit("streamUpdated", session);
  }

  private async generateStreamThumbnail(session: StreamSession) {
    const thumbnailPath = join(
      process.cwd(),
      "media",
      "streams",
      "thumbnails",
      `${session.id}_${Date.now()}.jpg`,
    );

    const thumbnailProcess = spawn("ffmpeg", [
      "-f",
      "flv",
      "-i",
      `rtmp://localhost:${this.RTMP_PORT}/live/${session.streamKey}`,
      "-vf",
      "scale=320:240",
      "-vframes",
      "1",
      "-y",
      thumbnailPath,
    ]);

    thumbnailProcess.on("close", (code) => {
      if (code === 0) {
        session.thumbnailUrl = `/thumbnails/${session.id}_${Date.now()}.jpg`;
        this.emit("thumbnailGenerated", session);
      }
    });
  }

  private async handleHttpRequest(req: any, res: any) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathParts = url.pathname.split("/").filter(Boolean);

    try {
      // Serve HLS segments
      if (pathParts[0] === "hls" && pathParts.length >= 2) {
        const sessionId = pathParts[1];
        const filename = pathParts[2] || "playlist.m3u8";
        const filePath = join(
          process.cwd(),
          "media",
          "streams",
          "hls",
          sessionId,
          filename,
        );

        const content = await fs.readFile(filePath);
        const contentType = filename.endsWith(".m3u8")
          ? "application/vnd.apple.mpegurl"
          : "video/mp2t";

        res.writeHead(200, {
          "Content-Type": contentType,
          "Cache-Control": "no-cache",
          "Access-Control-Allow-Origin": "*",
        });

        res.end(content);
        return;
      }

      // Serve DASH segments
      if (pathParts[0] === "dash" && pathParts.length >= 2) {
        const sessionId = pathParts[1];
        const filename = pathParts[2] || "manifest.mpd";
        const filePath = join(
          process.cwd(),
          "media",
          "streams",
          "dash",
          sessionId,
          filename,
        );

        const content = await fs.readFile(filePath);
        const contentType = filename.endsWith(".mpd")
          ? "application/dash+xml"
          : "video/mp4";

        res.writeHead(200, {
          "Content-Type": contentType,
          "Cache-Control": "no-cache",
          "Access-Control-Allow-Origin": "*",
        });

        res.end(content);
        return;
      }

      // Serve thumbnails
      if (pathParts[0] === "thumbnails" && pathParts.length === 2) {
        const filename = pathParts[1];
        const filePath = join(
          process.cwd(),
          "media",
          "streams",
          "thumbnails",
          filename,
        );

        const content = await fs.readFile(filePath);

        res.writeHead(200, {
          "Content-Type": "image/jpeg",
          "Cache-Control": "public, max-age=3600",
          "Access-Control-Allow-Origin": "*",
        });

        res.end(content);
        return;
      }

      // 404 for other requests
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not Found");
    } catch (error) {
      console.error("HTTP request error:", error);
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Internal Server Error");
    }
  }

  private handleWebSocketConnection(ws: WebSocket, req: any) {
    const viewerId = randomUUID();

    ws.on("message", (data) => {
      try {
        const message = JSON.parse(data.toString());
        this.handleWebSocketMessage(ws, viewerId, message);
      } catch (error) {
        console.error("WebSocket message error:", error);
      }
    });

    ws.on("close", () => {
      this.removeViewer(viewerId);
    });
  }

  private handleWebSocketMessage(
    ws: WebSocket,
    viewerId: string,
    message: any,
  ) {
    switch (message.type) {
      case "joinStream":
        this.addViewer(viewerId, message.sessionId, ws, message.userId);
        break;

      case "leaveStream":
        this.removeViewer(viewerId);
        break;

      case "sendChat":
        this.handleChatMessage(
          message.sessionId,
          message.userId,
          message.username,
          message.message,
        );
        break;

      case "changeQuality":
        this.handleQualityChange(viewerId, message.quality);
        break;
    }
  }

  private addViewer(
    viewerId: string,
    sessionId: string,
    ws: WebSocket,
    userId?: string,
  ) {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const viewer: StreamViewer = {
      id: viewerId,
      sessionId,
      userId,
      ipAddress: "127.0.0.1", // Would get from request in production
      userAgent: "Unknown",
      joinTime: new Date(),
      lastActivity: new Date(),
      quality: "auto",
    };

    this.viewers.set(viewerId, viewer);
    session.viewers++;

    // Store WebSocket reference (in production, use a proper connection manager)
    (viewer as any).ws = ws;

    this.emit("viewerJoined", session, viewer);
    this.broadcastToViewers(sessionId, {
      type: "viewerCount",
      count: session.viewers,
    });
  }

  private removeViewer(viewerId: string) {
    const viewer = this.viewers.get(viewerId);
    if (!viewer) return;

    const session = this.sessions.get(viewer.sessionId);
    if (session) {
      session.viewers = Math.max(0, session.viewers - 1);
      this.emit("viewerLeft", session, viewer);
      this.broadcastToViewers(viewer.sessionId, {
        type: "viewerCount",
        count: session.viewers,
      });
    }

    this.viewers.delete(viewerId);
  }

  private removeAllViewers(sessionId: string) {
    const viewersToRemove = Array.from(this.viewers.values()).filter(
      (v) => v.sessionId === sessionId,
    );

    for (const viewer of viewersToRemove) {
      this.viewers.delete(viewer.id);
    }
  }

  private handleChatMessage(
    sessionId: string,
    userId: string | undefined,
    username: string,
    message: string,
  ) {
    const session = this.sessions.get(sessionId);
    if (!session || !session.settings.chatEnabled) return;

    const chatMessage: ChatMessage = {
      id: randomUUID(),
      sessionId,
      userId,
      username,
      message,
      timestamp: new Date(),
      type: "message",
    };

    const messages = this.chatMessages.get(sessionId) || [];
    messages.push(chatMessage);
    this.chatMessages.set(sessionId, messages);

    // Apply moderation if enabled
    if (session.settings.moderationEnabled) {
      // This would integrate with your AI moderation system
      this.moderateMessage(chatMessage);
    }

    this.emit("chatMessage", chatMessage);
    this.broadcastToViewers(sessionId, {
      type: "chatMessage",
      message: chatMessage,
    });
  }

  private async moderateMessage(message: ChatMessage) {
    // Placeholder for AI moderation integration
    // This would call your existing moderation pipeline
    const shouldModerate = false; // AI decision

    if (shouldModerate) {
      message.moderated = true;
    }
  }

  private handleQualityChange(viewerId: string, quality: string) {
    const viewer = this.viewers.get(viewerId);
    if (viewer) {
      viewer.quality = quality;
      viewer.lastActivity = new Date();
      this.emit("qualityChanged", viewer);
    }
  }

  private broadcastToViewers(sessionId: string, data: any) {
    const viewers = Array.from(this.viewers.values()).filter(
      (v) => v.sessionId === sessionId,
    );

    for (const viewer of viewers) {
      const ws = (viewer as any).ws as WebSocket;
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(data));
      }
    }
  }

  getSession(sessionId: string): StreamSession | undefined {
    return this.sessions.get(sessionId);
  }

  getAllSessions(): StreamSession[] {
    return Array.from(this.sessions.values());
  }

  getLiveSessions(): StreamSession[] {
    return Array.from(this.sessions.values()).filter(
      (s) => s.status === "live",
    );
  }

  getSessionViewers(sessionId: string): StreamViewer[] {
    return Array.from(this.viewers.values()).filter(
      (v) => v.sessionId === sessionId,
    );
  }

  getChatMessages(sessionId: string): ChatMessage[] {
    return this.chatMessages.get(sessionId) || [];
  }

  stopStream(sessionId: string): boolean {
    const process = this.streamProcesses.get(sessionId);
    if (process) {
      process.kill("SIGTERM");
      return true;
    }
    return false;
  }

  getStats() {
    const sessions = Array.from(this.sessions.values());
    return {
      totalSessions: sessions.length,
      liveSessions: sessions.filter((s) => s.status === "live").length,
      totalViewers: this.viewers.size,
      activeProcesses: this.streamProcesses.size,
      avgViewersPerStream:
        sessions.length > 0
          ? Math.round(
              this.viewers.size /
                sessions.filter((s) => s.status === "live").length,
            ) || 0
          : 0,
    };
  }
}

// Singleton instance
export const streamingServer = new StreamingServer();
