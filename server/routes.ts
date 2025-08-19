import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { 
  insertContentItemSchema, 
  insertModerationResultSchema,
  insertModerationSettingsSchema,
  insertAppealRequestSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Content management
  app.get("/api/content/pending", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const content = await storage.getPendingContent(limit);
      res.json(content);
    } catch (error) {
      console.error("Error fetching pending content:", error);
      res.status(500).json({ message: "Failed to fetch pending content" });
    }
  });

  app.post("/api/content", async (req, res) => {
    try {
      const validatedData = insertContentItemSchema.parse(req.body);
      const content = await storage.createContentItem(validatedData);
      
      // Broadcast new content to connected moderators
      broadcastToModerators({
        type: "new_content",
        data: content
      });
      
      res.json(content);
    } catch (error) {
      console.error("Error creating content item:", error);
      res.status(500).json({ message: "Failed to create content item" });
    }
  });

  app.put("/api/content/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status, moderatorId } = req.body;
      
      await storage.updateContentStatus(id, status, moderatorId);
      
      // Broadcast status update
      broadcastToModerators({
        type: "content_status_updated",
        data: { id, status, moderatorId }
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating content status:", error);
      res.status(500).json({ message: "Failed to update content status" });
    }
  });

  // Moderation results
  app.post("/api/moderation/results", async (req, res) => {
    try {
      const validatedData = insertModerationResultSchema.parse(req.body);
      const result = await storage.createModerationResult(validatedData);
      res.json(result);
    } catch (error) {
      console.error("Error creating moderation result:", error);
      res.status(500).json({ message: "Failed to create moderation result" });
    }
  });

  app.get("/api/moderation/results/:contentId", async (req, res) => {
    try {
      const { contentId } = req.params;
      const results = await storage.getModerationResults(contentId);
      res.json(results);
    } catch (error) {
      console.error("Error fetching moderation results:", error);
      res.status(500).json({ message: "Failed to fetch moderation results" });
    }
  });

  // Live streams
  app.get("/api/live-streams", async (req, res) => {
    try {
      const streams = await storage.getLiveStreams();
      res.json(streams);
    } catch (error) {
      console.error("Error fetching live streams:", error);
      res.status(500).json({ message: "Failed to fetch live streams" });
    }
  });

  app.put("/api/live-streams/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      await storage.updateLiveStream(id, updates);
      
      // Broadcast stream update
      broadcastToModerators({
        type: "stream_updated",
        data: { id, ...updates }
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating live stream:", error);
      res.status(500).json({ message: "Failed to update live stream" });
    }
  });

  // Settings
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getModerationSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.put("/api/settings", async (req, res) => {
    try {
      const validatedData = insertModerationSettingsSchema.parse(req.body);
      await storage.updateModerationSettings(validatedData);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating settings:", error);
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  // Appeals
  app.get("/api/appeals", async (req, res) => {
    try {
      const appeals = await storage.getAppealRequests();
      res.json(appeals);
    } catch (error) {
      console.error("Error fetching appeals:", error);
      res.status(500).json({ message: "Failed to fetch appeals" });
    }
  });

  app.post("/api/appeals", async (req, res) => {
    try {
      const validatedData = insertAppealRequestSchema.parse(req.body);
      const appeal = await storage.createAppealRequest(validatedData);
      res.json(appeal);
    } catch (error) {
      console.error("Error creating appeal:", error);
      res.status(500).json({ message: "Failed to create appeal" });
    }
  });

  // File upload for content analysis
  app.post("/api/upload/analyze", async (req, res) => {
    try {
      // This would integrate with actual AI models in production
      // For now, return a simulated analysis response
      const mockAnalysis = {
        pdqHash: "f1d2e3a4b5c6f7a8b9c0d1e2f3a4b5c6",
        nudenetResults: [
          { label: "EXPOSED_BREAST_F", confidence: 0.87, box: [100, 150, 300, 400] },
          { label: "FACE_FEMALE", confidence: 0.95, box: [200, 50, 350, 200] }
        ],
        overallRisk: 0.78,
        recommendation: "review"
      };
      
      res.json(mockAnalysis);
    } catch (error) {
      console.error("Error analyzing content:", error);
      res.status(500).json({ message: "Failed to analyze content" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket setup for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  const moderatorClients = new Set<WebSocket>();

  wss.on('connection', (ws) => {
    console.log('Moderator connected via WebSocket');
    moderatorClients.add(ws);

    ws.on('close', () => {
      console.log('Moderator disconnected');
      moderatorClients.delete(ws);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      moderatorClients.delete(ws);
    });
  });

  // Function to broadcast updates to all connected moderators
  function broadcastToModerators(message: any) {
    const messageStr = JSON.stringify(message);
    moderatorClients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageStr);
      }
    });
  }

  // Store reference for use in routes
  (global as any).broadcastToModerators = broadcastToModerators;

  return httpServer;
}
