import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { 
  insertContentItemSchema, 
  insertModerationResultSchema,
  insertModerationSettingsSchema,
  insertAppealRequestSchema,
  insertStreamTokenSchema,
  insertStreamChannelSchema,
  insertEncodingJobSchema,
  insertPaymentProcessorSchema,
  insertPaymentTransactionSchema,
  insertAICompanionSchema,
  insertVRSessionSchema,
  insertWebRTCRoomSchema,
  insertGeoCollaborationSchema,
  insertCronJobSchema,
  insertCronJobLogSchema
} from "@shared/schema";
import { aiModerationService } from "./openaiService";

// Import all our internal systems
import { videoEncoder } from "./videoEncoder";
import { streamingServer } from "./streamingServer";
import { contentProcessor } from "./contentProcessor";
import { analytics } from "./internalAnalytics";
import { communicationSystem } from "./communicationSystem";
import { paymentProcessor } from "./paymentProcessor";
import { cdnDistribution } from "./cdnDistribution";
import { systemMonitoring } from "./systemMonitoring";
import { mediaHub } from "./mediaHub";
import { vrRenderingEngine } from "./vrRenderingEngine";
import { futureTechManager } from "./futureTechManager";

// Store connected WebSocket clients
let connectedModerators: Set<WebSocket> = new Set();

function broadcastToModerators(message: any) {
  connectedModerators.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  });
}

// Simple auth middleware for our in-house system
function isAuthenticated(req: any, res: any, next: any) {
  // For demo purposes - in production this would verify JWT tokens
  // Allow all requests for now to test the system
  req.user = {
    claims: {
      sub: 'demo_user_12345',
      email: 'admin@fanzunlimited.com'
    }
  };
  next();
}

// Service Helper Functions
function generateStreamToken(userId: string, tokenType: string): string {
  return `stream_token_${userId}_${tokenType}_${Date.now()}`;
}

async function handleStreamModeration(action: string, targetId: string, reason: string, moderatorId: string) {
  const moderationAction = {
    action,
    targetId,
    reason,
    moderatorId,
    timestamp: new Date().toISOString()
  };
  
  return { success: true, action: moderationAction };
}

async function createCoconutJob(sourceUrl: string, mediaAssetId: string): Promise<string> {
  return `coconut_job_${Date.now()}_${mediaAssetId}`;
}

async function screenMessage(message: string, safetyFilters: any): Promise<boolean> {
  const toxicKeywords = ['hate', 'harassment', 'violence', 'illegal'];
  const messageWords = message.toLowerCase().split(' ');
  
  const hasToxicContent = toxicKeywords.some(keyword => 
    messageWords.some(word => word.includes(keyword))
  );
  
  return !hasToxicContent;
}

async function generateAIResponse(companion: any, message: string, userId: string): Promise<string> {
  const responses = [
    "That's an interesting thought. Tell me more about it.",
    "I understand your perspective. What made you think about that?",
    "That sounds important to you. How does it make you feel?",
    "I appreciate you sharing that with me. What would you like to explore next?"
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}

function initializeWebRTCSignaling(roomId: string) {
  console.log(`Initializing WebRTC signaling for room: ${roomId}`);
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Basic health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date(), version: '1.0.0' });
  });

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user || { id: userId, email: req.user.claims.email });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // ============= MEDIA HUB APIS =============
  
  // Add media asset to hub
  app.post('/api/media/assets', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const assetId = await mediaHub.addMediaAsset({
        ...req.body,
        createdBy: userId
      });
      res.json({ assetId });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to add asset' });
    }
  });

  // Upload to multiple platforms
  app.post('/api/media/upload-to-platforms', isAuthenticated, async (req: any, res) => {
    try {
      const { assetId, platformIds, settings } = req.body;
      const operations = await mediaHub.uploadToPlatforms(assetId, platformIds, settings);
      res.json({ operations });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Upload failed' });
    }
  });

  // Create cross-platform campaign
  app.post('/api/media/campaigns', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const campaignId = await mediaHub.createCrossPlatformCampaign({
        ...req.body,
        createdBy: userId
      });
      res.json({ campaignId });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Campaign creation failed' });
    }
  });

  // Get media hub analytics
  app.get('/api/media/analytics', isAuthenticated, (req, res) => {
    try {
      const platformId = req.query.platform as string;
      if (platformId) {
        const analytics = mediaHub.getPlatformAnalytics(platformId);
        res.json({ platform: platformId, analytics });
      } else {
        const analytics = mediaHub.getOverallAnalytics();
        res.json({ analytics });
      }
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Analytics fetch failed' });
    }
  });

  // Get all platform connectors
  app.get('/api/media/connectors', isAuthenticated, (req, res) => {
    const connectors = mediaHub.getAllConnectors();
    res.json({ connectors });
  });

  // Get media assets
  app.get('/api/media/assets', isAuthenticated, (req, res) => {
    const assets = mediaHub.getAllAssets();
    res.json({ assets });
  });

  // Sync all platforms
  app.post('/api/media/sync-all', isAuthenticated, async (req, res) => {
    try {
      await mediaHub.syncAllPlatforms();
      res.json({ message: 'Sync started for all platforms' });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Sync failed' });
    }
  });

  // ============= VR RENDERING ENGINE APIS =============

  // Add VR content
  app.post('/api/vr/content', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const contentId = await vrRenderingEngine.addVRContent({
        ...req.body,
        createdBy: userId
      });
      res.json({ contentId });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'VR content creation failed' });
    }
  });

  // Create AR overlay
  app.post('/api/ar/overlays', isAuthenticated, async (req, res) => {
    try {
      const overlayId = await vrRenderingEngine.createAROverlay(req.body);
      res.json({ overlayId });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'AR overlay creation failed' });
    }
  });

  // Track spatial analytics
  app.post('/api/vr/analytics', isAuthenticated, async (req, res) => {
    try {
      await vrRenderingEngine.trackSpatialAnalytics(req.body);
      res.json({ message: 'Spatial analytics tracked' });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Analytics tracking failed' });
    }
  });

  // Get VR analytics
  app.get('/api/vr/analytics', isAuthenticated, (req, res) => {
    try {
      const analytics = vrRenderingEngine.getVRAnalytics();
      res.json({ analytics });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'VR analytics fetch failed' });
    }
  });

  // Get spatial analytics insights
  app.get('/api/vr/spatial-insights', isAuthenticated, (req, res) => {
    try {
      const insights = vrRenderingEngine.getSpatialAnalyticsInsights();
      res.json({ insights });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Spatial insights fetch failed' });
    }
  });

  // Get VR content
  app.get('/api/vr/content', isAuthenticated, (req, res) => {
    const content = vrRenderingEngine.getAllVRContent();
    res.json({ content });
  });

  // Get AR overlays
  app.get('/api/ar/overlays', isAuthenticated, (req, res) => {
    const overlays = vrRenderingEngine.getAllAROverlays();
    res.json({ overlays });
  });

  // Get processing queue status
  app.get('/api/vr/processing-status', isAuthenticated, (req, res) => {
    const status = vrRenderingEngine.getProcessingStatus();
    res.json({ status });
  });

  // ============= FUTURE TECH MANAGER APIS =============

  // Perform trend analysis
  app.post('/api/future-tech/trend-analysis', isAuthenticated, async (req, res) => {
    try {
      const analysisId = await futureTechManager.performTrendAnalysis();
      res.json({ analysisId, message: 'Trend analysis started' });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Trend analysis failed' });
    }
  });

  // Tech scouting
  app.post('/api/future-tech/scouting', isAuthenticated, async (req, res) => {
    try {
      const { query } = req.body;
      const scoutingId = await futureTechManager.performTechScouting(query);
      res.json({ scoutingId, message: 'Tech scouting completed' });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Tech scouting failed' });
    }
  });

  // Create innovation pipeline
  app.post('/api/future-tech/pipelines', isAuthenticated, async (req, res) => {
    try {
      const pipelineId = await futureTechManager.createInnovationPipeline(req.body);
      res.json({ pipelineId });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Pipeline creation failed' });
    }
  });

  // Assess tech opportunity
  app.post('/api/future-tech/assess', isAuthenticated, async (req, res) => {
    try {
      const { techName, description } = req.body;
      const assessment = await futureTechManager.assessTechOpportunity(techName, description);
      res.json({ assessment });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Tech assessment failed' });
    }
  });

  // Get tech portfolio analysis
  app.get('/api/future-tech/portfolio', isAuthenticated, (req, res) => {
    try {
      const analysis = futureTechManager.getTechPortfolioAnalysis();
      res.json({ analysis });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Portfolio analysis failed' });
    }
  });

  // Get future tech roadmap
  app.get('/api/future-tech/roadmap', isAuthenticated, (req, res) => {
    try {
      const status = futureTechManager.getFutureTechStatus();
      res.json({ status });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Roadmap fetch failed' });
    }
  });

  // Get all tech advancements
  app.get('/api/future-tech/advancements', isAuthenticated, (req, res) => {
    const advancements = futureTechManager.getAllTechAdvancements();
    res.json({ advancements });
  });

  // Get innovation metrics
  app.get('/api/future-tech/innovation-metrics', isAuthenticated, (req, res) => {
    try {
      const metrics = futureTechManager.getInnovationMetrics();
      res.json({ metrics });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Innovation metrics failed' });
    }
  });

  // Get recent tech scouting reports
  app.get('/api/future-tech/scouting-reports', isAuthenticated, (req, res) => {
    const limit = parseInt(req.query.limit as string) || 10;
    const reports = futureTechManager.getRecentTechScouting(limit);
    res.json({ reports });
  });

  // Get trend analyses
  app.get('/api/future-tech/trends', isAuthenticated, (req, res) => {
    const analyses = futureTechManager.getAllTrendAnalyses();
    res.json({ analyses });
  });

  // ============= SYSTEM MONITORING APIS =============
  
  // Get system metrics
  app.get('/api/system/metrics', isAuthenticated, (req, res) => {
    const metrics = systemMonitoring.getLatestMetrics();
    res.json({ metrics });
  });

  // Get service health
  app.get('/api/system/health', isAuthenticated, (req, res) => {
    const health = systemMonitoring.getServiceHealth();
    res.json({ health });
  });

  // Get system status
  app.get('/api/system/status', isAuthenticated, (req, res) => {
    const status = systemMonitoring.getSystemStatus();
    res.json({ status });
  });

  // Get alerts
  app.get('/api/system/alerts', isAuthenticated, (req, res) => {
    const filters = {
      severity: req.query.severity as any,
      type: req.query.type as any,
      acknowledged: req.query.acknowledged === 'true',
      resolved: req.query.resolved === 'true',
      limit: parseInt(req.query.limit as string) || 50
    };
    const alerts = systemMonitoring.getAlerts(filters);
    res.json({ alerts });
  });

  // Acknowledge alert
  app.post('/api/system/alerts/:alertId/acknowledge', isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const acknowledged = systemMonitoring.acknowledgeAlert(req.params.alertId, userId);
    res.json({ acknowledged });
  });

  // Get performance report
  app.get('/api/system/performance', isAuthenticated, (req, res) => {
    const hours = parseInt(req.query.hours as string) || 24;
    const report = systemMonitoring.getPerformanceReport(hours);
    res.json({ report });
  });

  // ============= PLATFORM STATUS API =============
  
  // Get overall platform status
  app.get('/api/platforms/status', isAuthenticated, (req, res) => {
    try {
      const status = {
        mediaHub: mediaHub.getSystemStatus(),
        vrEngine: {
          totalContent: vrRenderingEngine.getAllVRContent().length,
          processingQueue: vrRenderingEngine.getProcessingStatus().queueLength,
          systemHealth: 'healthy' as const
        },
        futureTech: {
          activePipelines: futureTechManager.getInnovationMetrics().activePipelines,
          totalTechnologies: futureTechManager.getTechPortfolioAnalysis().totalTechnologies,
          systemHealth: 'healthy' as const
        },
        videoEncoder: videoEncoder.getStats(),
        streaming: streamingServer.getStats(),
        contentProcessor: contentProcessor.getStats(),
        payments: paymentProcessor.getStats(),
        cdn: cdnDistribution.getStatistics(),
        system: systemMonitoring.getSystemStatus(),
        analytics: analytics.getStats(),
        timestamp: new Date()
      };

      res.json({ status });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Status fetch failed' });
    }
  });

  // Original dashboard and system routes
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

  // Real AI-powered content analysis using OpenAI
  app.post("/api/upload/analyze", async (req, res) => {
    try {
      const { contentUrl, contentType, context } = req.body;
      
      if (!contentUrl) {
        return res.status(400).json({ message: "Content URL is required" });
      }

      let analysisResult;
      if (contentType === 'image') {
        analysisResult = await aiModerationService.analyzeImage(contentUrl, context);
      } else if (contentType === 'text') {
        analysisResult = await aiModerationService.analyzeText(contentUrl, context);
      } else {
        return res.status(400).json({ message: "Unsupported content type" });
      }
      
      // Store the analysis result
      await storage.createAnalysisResult({
        contentUrl,
        contentType,
        result: analysisResult,
        analysisType: 'chatgpt-4o',
        confidence: analysisResult.confidence,
        processingTime: analysisResult.processingTime
      });
      
      res.json(analysisResult);
    } catch (error) {
      console.error("Error analyzing content with AI:", error);
      res.status(500).json({ message: "Failed to analyze content with AI" });
    }
  });

  // Start all monitoring systems
  systemMonitoring.startMonitoring();

  // Setup WebSocket for streaming
  const httpServer = createServer(app);
  
  // WebSocket for moderators
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  wss.on('connection', (ws) => {
    connectedModerators.add(ws);
    ws.on('close', () => {
      connectedModerators.delete(ws);
    });
  });

  // WebSocket for streaming
  const streamingWss = new WebSocketServer({ server: httpServer, path: '/ws-streaming' });
  streamingWss.on('connection', (ws) => {
    console.log('Streaming WebSocket client connected');
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        // Handle streaming WebSocket messages
        console.log('Streaming message:', data);
      } catch (error) {
        console.error('Streaming WebSocket error:', error);
      }
    });
  });

  // WebSocket for chat
  const chatWss = new WebSocketServer({ server: httpServer, path: '/ws-chat' });
  chatWss.on('connection', (ws) => {
    console.log('Chat WebSocket client connected');
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        // Handle chat WebSocket messages
        console.log('Chat message:', data);
      } catch (error) {
        console.error('Chat WebSocket error:', error);
      }
    });
  });

  return httpServer;
}