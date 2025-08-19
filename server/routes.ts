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

  // Advanced Security & Audit API endpoints
  app.get('/api/threat-level', async (req, res) => {
    try {
      res.json({ 
        level: "MEDIUM", 
        score: 73.2, 
        lastUpdated: new Date().toISOString(),
        trends: {
          increasing: true,
          reason: "Increased suspicious activity detected"
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch threat level" });
    }
  });

  app.get('/api/filters', async (req, res) => {
    try {
      res.json([
        {
          id: "filter-001",
          name: "High Risk Content",
          description: "Detects potentially illegal content with 95%+ confidence",
          filterCriteria: { riskScoreMin: 0.95, contentType: ["image", "video"] },
          createdBy: "admin-001",
          isShared: true,
          usageCount: 847,
          createdAt: "2024-01-10T10:00:00Z"
        },
        {
          id: "filter-002", 
          name: "CSAM Detection",
          description: "Specialized filter for child exploitation material",
          filterCriteria: { keywords: ["csam"], severity: ["critical"] },
          createdBy: "executive-001",
          isShared: false,
          usageCount: 23,
          createdAt: "2024-01-15T14:30:00Z"
        }
      ]);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch filters" });
    }
  });

  app.get('/api/content/filtered', async (req, res) => {
    try {
      res.json([
        {
          id: "content-001",
          type: "image",
          status: "auto_blocked",
          riskScore: 0.97,
          createdAt: "2024-01-15T15:23:07Z"
        }
      ]);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch filtered content" });
    }
  });

  app.get('/api/admin/session-logs', async (req, res) => {
    try {
      res.json([
        {
          id: "session-001",
          adminId: "admin-001",
          sessionType: "login",
          ipAddress: "192.168.1.101",
          userAgent: "Chrome/120.0 Windows",
          location: { city: "San Francisco", country: "US" },
          suspicious: false,
          createdAt: "2024-01-15T15:23:07Z"
        }
      ]);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch session logs" });
    }
  });

  app.get('/api/admin/action-logs', async (req, res) => {
    try {
      res.json([
        {
          id: "action-001",
          adminId: "admin-001",
          action: "approve",
          targetType: "content_item",
          targetId: "content-12847",
          previousStatus: "pending",
          newStatus: "approved",
          reason: "Content complies with guidelines",
          ipAddress: "192.168.1.101",
          createdAt: "2024-01-15T15:23:07Z"
        }
      ]);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch action logs" });
    }
  });

  app.get('/api/admin/audit-stats', async (req, res) => {
    try {
      res.json({
        totalActions: 1247,
        approvals: 847,
        rejections: 234,
        suspicious: 3
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch audit stats" });
    }
  });

  // Vault and security endpoints
  app.post('/api/vault/unlock', async (req, res) => {
    try {
      const { masterPassword } = req.body;
      // In production, this would verify against encrypted master password
      if (masterPassword === "EXECUTIVE_MASTER_2024") {
        res.json({ success: true, message: "Vault unlocked successfully" });
      } else {
        res.status(401).json({ success: false, message: "Invalid master password" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to process vault unlock" });
    }
  });

  app.get('/api/vault/contents', async (req, res) => {
    try {
      res.json([
        {
          id: "vault-001",
          contentId: "content-99847",
          vaultReason: "csam",
          severity: "critical",
          encryptionKey: "encrypted_key_hash",
          createdBy: "admin-001",
          createdAt: "2024-01-15T10:30:00Z"
        }
      ]);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vault contents" });
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
