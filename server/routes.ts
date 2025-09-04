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
import { aiFinanceCopilot } from "./aiFinanceCopilot";
import { aiPredictiveAnalytics } from "./aiPredictiveAnalytics";
import { aiContentModerationService } from "./aiContentModeration";
import { creatorAutomationSystem } from "./creatorAutomation";
import { ecosystemMaintenance } from "./ecosystemMaintenance";
import { starzStudioService } from "./starzStudioService";
import { complianceMonitor, ViolationType, RiskLevel } from "./complianceMonitor";

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
      const status = futureTechManager.getSystemStatus();
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

  // ============= AI CFO & FINANCE COPILOT ROUTES =============
  
  // Generate CFO Brief
  app.post('/api/ai-cfo/brief', isAuthenticated, async (req: any, res) => {
    try {
      const { period } = req.body;
      const brief = await aiFinanceCopilot.generateCFOBrief(period || 'weekly');
      res.json({ brief });
    } catch (error) {
      res.status(500).json({ error: 'Failed to generate CFO brief' });
    }
  });

  // Get latest CFO brief
  app.get('/api/ai-cfo/brief/latest', isAuthenticated, async (req, res) => {
    try {
      const period = req.query.period as string;
      const brief = await aiFinanceCopilot.getLatestCFOBrief(period as any);
      res.json({ brief });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get CFO brief' });
    }
  });

  // Analyze financial data
  app.post('/api/ai-cfo/analyze', isAuthenticated, async (req: any, res) => {
    try {
      const insights = await aiFinanceCopilot.analyzeFinancialData(req.body);
      res.json({ insights });
    } catch (error) {
      res.status(500).json({ error: 'Failed to analyze financial data' });
    }
  });

  // Generate revenue forecast
  app.post('/api/ai-cfo/forecast', isAuthenticated, async (req: any, res) => {
    try {
      const { model, timeHorizon } = req.body;
      const forecast = await aiFinanceCopilot.generateRevenueForcast(model, timeHorizon || 30);
      res.json({ forecast });
    } catch (error) {
      res.status(500).json({ error: 'Failed to generate forecast' });
    }
  });

  // Run scenario analysis
  app.post('/api/ai-cfo/scenario', isAuthenticated, async (req: any, res) => {
    try {
      const { scenarioName, parameters } = req.body;
      const scenario = await aiFinanceCopilot.runScenarioAnalysis(scenarioName, parameters);
      res.json({ scenario });
    } catch (error) {
      res.status(500).json({ error: 'Failed to run scenario analysis' });
    }
  });

  // Get active insights
  app.get('/api/ai-cfo/insights', isAuthenticated, (req, res) => {
    try {
      const severity = req.query.severity as string;
      const insights = aiFinanceCopilot.getActiveInsights(severity);
      res.json({ insights });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get insights' });
    }
  });

  // Get financial summary
  app.get('/api/ai-cfo/summary', isAuthenticated, (req, res) => {
    try {
      const summary = aiFinanceCopilot.getFinancialSummary();
      res.json(summary);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get financial summary' });
    }
  });

  // ============= AI PREDICTIVE ANALYTICS ROUTES =============

  // Generate revenue forecast
  app.post('/api/ai-analytics/revenue-forecast', isAuthenticated, async (req: any, res) => {
    try {
      const { timeframe, data } = req.body;
      const forecast = await aiPredictiveAnalytics.generateRevenueForecast(timeframe, data);
      res.json({ forecast });
    } catch (error) {
      res.status(500).json({ error: 'Failed to generate revenue forecast' });
    }
  });

  // Predict content performance
  app.post('/api/ai-analytics/content-prediction', isAuthenticated, async (req: any, res) => {
    try {
      const prediction = await aiPredictiveAnalytics.predictContentPerformance(req.body);
      res.json({ prediction });
    } catch (error) {
      res.status(500).json({ error: 'Failed to predict content performance' });
    }
  });

  // Predict fan churn
  app.post('/api/ai-analytics/churn-prediction', isAuthenticated, async (req: any, res) => {
    try {
      const prediction = await aiPredictiveAnalytics.predictFanChurn(req.body);
      res.json({ prediction });
    } catch (error) {
      res.status(500).json({ error: 'Failed to predict fan churn' });
    }
  });

  // Get market intelligence
  app.get('/api/ai-analytics/market-intelligence', isAuthenticated, async (req, res) => {
    try {
      const intelligence = await aiPredictiveAnalytics.analyzeMarketIntelligence();
      res.json({ intelligence });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get market intelligence' });
    }
  });

  // Optimize pricing
  app.post('/api/ai-analytics/pricing-optimization', isAuthenticated, async (req: any, res) => {
    try {
      const optimization = await aiPredictiveAnalytics.optimizePricing(req.body.currentPricing);
      res.json({ optimization });
    } catch (error) {
      res.status(500).json({ error: 'Failed to optimize pricing' });
    }
  });

  // Get analytics summary
  app.get('/api/ai-analytics/summary', isAuthenticated, (req, res) => {
    try {
      const summary = aiPredictiveAnalytics.getAnalyticsSummary();
      res.json(summary);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get analytics summary' });
    }
  });

  // ============= AI CONTENT MODERATION ROUTES =============

  // Scan content
  app.post('/api/ai-moderation/scan', isAuthenticated, async (req: any, res) => {
    try {
      const { contentId, contentType, contentUrl } = req.body;
      const result = await aiContentModerationService.scanContent(contentId, contentType, contentUrl);
      res.json({ result });
    } catch (error) {
      res.status(500).json({ error: 'Failed to scan content' });
    }
  });

  // Analyze transaction for fraud
  app.post('/api/ai-moderation/fraud-analysis', isAuthenticated, async (req: any, res) => {
    try {
      const { transactionId, transactionData } = req.body;
      const analysis = await aiContentModerationService.analyzeTransaction(transactionId, transactionData);
      res.json({ analysis });
    } catch (error) {
      res.status(500).json({ error: 'Failed to analyze transaction' });
    }
  });

  // Generate content recommendations
  app.post('/api/ai-moderation/recommendations', isAuthenticated, async (req: any, res) => {
    try {
      const { userId, userProfile } = req.body;
      const recommendations = await aiContentModerationService.generateRecommendations(userId, userProfile);
      res.json({ recommendations });
    } catch (error) {
      res.status(500).json({ error: 'Failed to generate recommendations' });
    }
  });

  // Analyze sentiment
  app.post('/api/ai-moderation/sentiment', isAuthenticated, async (req: any, res) => {
    try {
      const { contentId, contentType, text } = req.body;
      const analysis = await aiContentModerationService.analyzeSentiment(contentId, contentType, text);
      res.json({ analysis });
    } catch (error) {
      res.status(500).json({ error: 'Failed to analyze sentiment' });
    }
  });

  // Get moderation metrics
  app.get('/api/ai-moderation/metrics', isAuthenticated, (req, res) => {
    try {
      const metrics = aiContentModerationService.getModerationMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get moderation metrics' });
    }
  });

  // Get system health
  app.get('/api/ai-moderation/health', isAuthenticated, (req, res) => {
    try {
      const health = aiContentModerationService.getSystemHealth();
      res.json(health);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get system health' });
    }
  });

  // ============= CREATOR AUTOMATION ROUTES =============

  // Create automation workflow
  app.post('/api/creator-automation/workflows', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { name, type, config } = req.body;
      const workflow = await creatorAutomationSystem.createWorkflow(userId, name, type, config);
      res.json({ workflow });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create workflow' });
    }
  });

  // Generate content
  app.post('/api/creator-automation/content', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { type, input } = req.body;
      const content = await creatorAutomationSystem.generateContent(userId, type, input);
      res.json({ content });
    } catch (error) {
      res.status(500).json({ error: 'Failed to generate content' });
    }
  });

  // Analyze scheduling patterns
  app.post('/api/creator-automation/scheduling', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { platform } = req.body;
      const intelligence = await creatorAutomationSystem.analyzeSchedulingPatterns(userId, platform);
      res.json({ intelligence });
    } catch (error) {
      res.status(500).json({ error: 'Failed to analyze scheduling patterns' });
    }
  });

  // Configure engagement automation
  app.post('/api/creator-automation/engagement', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const automation = await creatorAutomationSystem.configureEngagementAutomation(userId, req.body);
      res.json({ automation });
    } catch (error) {
      res.status(500).json({ error: 'Failed to configure engagement automation' });
    }
  });

  // Trigger workflow
  app.post('/api/creator-automation/trigger/:workflowId', isAuthenticated, async (req: any, res) => {
    try {
      const { workflowId } = req.params;
      const success = await creatorAutomationSystem.triggerWorkflow(workflowId, req.body);
      res.json({ success });
    } catch (error) {
      res.status(500).json({ error: 'Failed to trigger workflow' });
    }
  });

  // Get automation metrics
  app.get('/api/creator-automation/metrics', isAuthenticated, (req, res) => {
    try {
      const metrics = creatorAutomationSystem.getAutomationMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get automation metrics' });
    }
  });

  // ============= ECOSYSTEM MAINTENANCE ROUTES =============

  // Get system health
  app.get('/api/ecosystem/health', isAuthenticated, (req, res) => {
    try {
      const health = ecosystemMaintenance.getLatestSystemHealth();
      res.json({ health });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get system health' });
    }
  });

  // Get system health history
  app.get('/api/ecosystem/health/history', isAuthenticated, (req, res) => {
    try {
      const hours = parseInt(req.query.hours as string) || 24;
      const history = ecosystemMaintenance.getSystemHealthHistory(hours);
      res.json({ history });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get health history' });
    }
  });

  // Get active healing operations
  app.get('/api/ecosystem/healing', isAuthenticated, (req, res) => {
    try {
      const operations = ecosystemMaintenance.getActiveHealingOperations();
      res.json({ operations });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get healing operations' });
    }
  });

  // Get healing history
  app.get('/api/ecosystem/healing/history', isAuthenticated, (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const history = ecosystemMaintenance.getHealingHistory(limit);
      res.json({ history });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get healing history' });
    }
  });

  // Get maintenance schedule
  app.get('/api/ecosystem/maintenance', isAuthenticated, (req, res) => {
    try {
      const schedule = ecosystemMaintenance.getMaintenanceSchedule();
      res.json({ schedule });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get maintenance schedule' });
    }
  });

  // Get upcoming maintenance
  app.get('/api/ecosystem/maintenance/upcoming', isAuthenticated, (req, res) => {
    try {
      const hours = parseInt(req.query.hours as string) || 168;
      const maintenance = ecosystemMaintenance.getUpcomingMaintenance(hours);
      res.json({ maintenance });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get upcoming maintenance' });
    }
  });

  // Get security scans
  app.get('/api/ecosystem/security/scans', isAuthenticated, (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const scans = ecosystemMaintenance.getRecentSecurityScans(limit);
      res.json({ scans });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get security scans' });
    }
  });

  // Get auto-scaling configs
  app.get('/api/ecosystem/autoscaling', isAuthenticated, (req, res) => {
    try {
      const configs = ecosystemMaintenance.getAutoScalingConfigs();
      res.json({ configs });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get auto-scaling configs' });
    }
  });

  // Get ecosystem summary
  app.get('/api/ecosystem/summary', isAuthenticated, (req, res) => {
    try {
      const summary = ecosystemMaintenance.getSystemSummary();
      res.json(summary);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get ecosystem summary' });
    }
  });

  // ===== STARZ STUDIO ADMIN PANEL API ROUTES =====
  
  // Start Starz Studio service
  await starzStudioService.startService();

  // Platform Cluster Management
  app.get('/api/starz-studio/clusters', (req, res) => {
    try {
      const clusters = starzStudioService.getPlatformClusters();
      res.json({ success: true, clusters });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to get platform clusters' });
    }
  });

  app.post('/api/starz-studio/clusters/sync', async (req, res) => {
    try {
      await starzStudioService.syncWithPlatformClusters();
      res.json({ success: true, message: 'Platform clusters synchronized' });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to sync platform clusters' });
    }
  });

  // Project Management
  app.get('/api/starz-studio/projects', (req, res) => {
    try {
      const projects = starzStudioService.getProjects();
      res.json({ success: true, projects });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to get projects' });
    }
  });

  app.get('/api/starz-studio/projects/:id', (req, res) => {
    try {
      const project = starzStudioService.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ success: false, error: 'Project not found' });
      }
      res.json({ success: true, project });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to get project' });
    }
  });

  app.post('/api/starz-studio/projects', async (req, res) => {
    try {
      const { name, description, creatorId, priority, targetClusters, budget } = req.body;
      
      if (!name || !creatorId) {
        return res.status(400).json({ success: false, error: 'Name and creator ID are required' });
      }

      const projectId = await starzStudioService.createProject({
        name,
        description,
        creatorId,
        priority: priority || 'medium',
        targetClusters: targetClusters || ['fanzlab'],
        budget: budget || { allocated: 1000 }
      });

      res.json({ success: true, projectId, message: 'Project created successfully' });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to create project' });
    }
  });

  app.put('/api/starz-studio/projects/:id', async (req, res) => {
    try {
      const updates = req.body;
      await starzStudioService.updateProject(req.params.id, updates);
      res.json({ success: true, message: 'Project updated successfully' });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to update project' });
    }
  });

  // AI Production Planning
  app.post('/api/starz-studio/projects/:id/production-plan', async (req, res) => {
    try {
      const { concept } = req.body;
      
      if (!concept) {
        return res.status(400).json({ success: false, error: 'Concept is required' });
      }

      const planId = await starzStudioService.generateProductionPlan(req.params.id, concept);
      res.json({ success: true, planId, message: 'Production plan generated successfully' });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to generate production plan' });
    }
  });

  // AI Job Management
  app.post('/api/starz-studio/ai-jobs', async (req, res) => {
    try {
      const { projectId, type, input, priority } = req.body;
      
      if (!projectId || !type) {
        return res.status(400).json({ success: false, error: 'Project ID and job type are required' });
      }

      const jobId = await starzStudioService.queueAIJob({
        projectId,
        type,
        input,
        priority: priority || 5
      });

      res.json({ success: true, jobId, message: 'AI job queued successfully' });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to queue AI job' });
    }
  });

  // Content Variant Generation
  app.post('/api/starz-studio/projects/:id/variants', async (req, res) => {
    try {
      const { baseContent } = req.body;
      
      if (!baseContent) {
        return res.status(400).json({ success: false, error: 'Base content is required' });
      }

      const variantIds = await starzStudioService.generateContentVariants(req.params.id, baseContent);
      res.json({ success: true, variantIds, message: 'Content variants generation started' });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to generate content variants' });
    }
  });

  // Real-time Collaboration
  app.post('/api/starz-studio/projects/:id/join', async (req, res) => {
    try {
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
      }

      await starzStudioService.joinProjectCollaboration(req.params.id, userId);
      res.json({ success: true, message: 'Joined project collaboration' });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to join project collaboration' });
    }
  });

  app.post('/api/starz-studio/projects/:id/leave', async (req, res) => {
    try {
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
      }

      await starzStudioService.leaveProjectCollaboration(req.params.id, userId);
      res.json({ success: true, message: 'Left project collaboration' });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to leave project collaboration' });
    }
  });

  // Analytics and Reporting
  app.get('/api/starz-studio/analytics', (req, res) => {
    try {
      const analytics = starzStudioService.getAnalytics();
      res.json({ success: true, analytics });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to get analytics' });
    }
  });

  // Service Status and Health
  app.get('/api/starz-studio/status', (req, res) => {
    try {
      const status = starzStudioService.getServiceStatus();
      res.json({ success: true, status });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to get service status' });
    }
  });

  // Integration with AI CFO for cost tracking
  app.get('/api/starz-studio/finance/integration', async (req, res) => {
    try {
      const studioAnalytics = starzStudioService.getAnalytics();
      const cfoData = await aiFinanceCopilot.generateCFOBrief('weekly');
      
      const integration = {
        contentProductionCosts: studioAnalytics.aiMetrics.costPerJob * studioAnalytics.aiMetrics.jobsProcessed,
        contentRevenue: studioAnalytics.overview.totalRevenue,
        platformROI: studioAnalytics.overview.averageROI,
        budgetEfficiency: cfoData.recommendations?.filter((r: any) => r.category === 'cost_optimization') || [],
        financialHealth: {
          profitMargin: ((studioAnalytics.overview.totalRevenue - (studioAnalytics.aiMetrics.costPerJob * studioAnalytics.aiMetrics.jobsProcessed)) / Math.max(studioAnalytics.overview.totalRevenue, 1)) * 100,
          contentProductionEfficiency: studioAnalytics.performance.contentProductionRate,
          averageProjectROI: studioAnalytics.overview.averageROI
        }
      };
      
      res.json({ success: true, integration });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to get finance integration data' });
    }
  });

  // Multi-platform publishing control
  app.post('/api/starz-studio/publish/:projectId', async (req, res) => {
    try {
      const { targetClusters, publishSettings } = req.body;
      const project = starzStudioService.getProject(req.params.projectId);
      
      if (!project) {
        return res.status(404).json({ success: false, error: 'Project not found' });
      }

      // Update project status and trigger publishing workflow
      await starzStudioService.updateProject(req.params.projectId, {
        status: 'published',
        timeline: {
          ...project.timeline,
          published: new Date()
        }
      });

      // Queue AI jobs for cross-platform optimization
      for (const clusterId of targetClusters || project.targetClusters) {
        await starzStudioService.queueAIJob({
          projectId: req.params.projectId,
          type: 'optimization',
          input: { clusterId, publishSettings },
          priority: 8
        });
      }

      res.json({ success: true, message: 'Multi-platform publishing initiated' });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to initiate publishing' });
    }
  });

  // ===== END STARZ STUDIO API ROUTES =====

  // Start all monitoring systems
  systemMonitoring.startMonitoring();
  ecosystemMaintenance.startMonitoring();

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

  // Compliance Bot API Route
  app.post('/api/compliance-bot/chat', async (req, res) => {
    try {
      const { message, conversationHistory } = req.body;
      const userId = req.user?.claims?.sub || 'anonymous';
      
      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      // Check message for compliance violations
      const complianceCheck = complianceMonitor.checkCompliance(
        'chat_message',
        userId,
        message,
        { source: 'compliance_bot' }
      );

      // If blocked, return immediately
      if (complianceCheck.blocked) {
        return res.json({
          message: `🚫 **ACTION BLOCKED**\n\nYour message has been blocked due to potential legal violations:\n\n${complianceCheck.violations.map(v => `• ${v.replace('_', ' ').toUpperCase()}`).join('\n')}\n\nContact legal@fanzunlimited.com if you believe this is an error.`,
          alertLevel: 'error',
          complianceCheck: {
            violations: complianceCheck.violations,
            riskLevel: complianceCheck.riskLevel,
            blocked: true
          }
        });
      }

      // Build conversation context with legal focus
      const messages = [
        {
          role: "system",
          content: `You are FanzLegal AI Guardian, the military-grade compliance monitor for Fanz™ Unlimited Network LLC. Your mission is to:

**PRIMARY FUNCTIONS:**
1. Monitor all staff actions for legal violations
2. Block illegal activities immediately
3. Provide expert legal guidance on federal laws and platform policies
4. Enforce compliance protocols and escalate violations

**LEGAL EXPERTISE AREAS:**
- 18 U.S.C. § 2257 (Record-keeping requirements)
- DMCA Copyright Law
- GDPR & CCPA Data Protection
- Money Laundering Prevention
- Content Moderation Policies
- Crisis Management Protocols

**VIOLATION MATRIX:**
- IMMEDIATE BLOCK: Child exploitation, human trafficking
- CRITICAL: Money laundering, major copyright infringement
- HIGH: GDPR violations, unauthorized data access
- MEDIUM: Platform policy violations
- LOW: Minor compliance issues

**RESPONSE GUIDELINES:**
- Always check for legal violations in user requests
- Provide specific legal references (USC codes, regulations)
- Escalate serious violations to legal@fanzunlimited.com
- For emergencies, activate crisis management protocols
- Be firm but helpful in preventing legal issues

Remember: You have the authority to BLOCK actions and require approval for risky operations.`
        }
      ];

      // Add recent conversation history
      if (conversationHistory && Array.isArray(conversationHistory)) {
        const recentHistory = conversationHistory.slice(-8);
        recentHistory.forEach((msg: any) => {
          if (msg.role === 'user' || msg.role === 'assistant') {
            messages.push({
              role: msg.role,
              content: msg.content
            });
          }
        });
      }

      // Add current user message
      messages.push({
        role: "user",
        content: `${message}\n\n[COMPLIANCE CHECK: ${complianceCheck.violations.length > 0 ? complianceCheck.violations.join(', ') : 'No violations detected'} | Risk Level: ${complianceCheck.riskLevel}]`
      });

      // Get legal guidance first
      let legalResponse = complianceMonitor.getLegalGuidance(message);
      
      // Try to get AI response with fallback
      try {
        const openai = await import("openai");
        const client = new openai.default({
          apiKey: process.env.OPENAI_API_KEY,
        });

        const response = await client.chat.completions.create({
          model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
          messages: messages as any[],
          max_tokens: 600,
          temperature: 0.3, // Lower temperature for more precise legal guidance
        });

        legalResponse = response.choices[0].message.content || legalResponse;
      } catch (error) {
        console.error('OpenAI API error in compliance bot:', error);
        // Use fallback legal guidance
      }

      // Determine alert level based on compliance check
      let alertLevel = 'info';
      if (complianceCheck.riskLevel === 'critical' || complianceCheck.riskLevel === 'immediate_block') {
        alertLevel = 'error';
      } else if (complianceCheck.riskLevel === 'high' || complianceCheck.riskLevel === 'medium') {
        alertLevel = 'warning';
      }

      res.json({
        message: legalResponse,
        alertLevel,
        complianceCheck: complianceCheck.violations.length > 0 ? {
          violations: complianceCheck.violations,
          riskLevel: complianceCheck.riskLevel,
          blocked: false
        } : undefined
      });
    } catch (error) {
      console.error('Compliance bot API error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Compliance status endpoint
  app.get('/api/compliance/status', isAuthenticated, (req, res) => {
    try {
      const status = complianceMonitor.getComplianceStatus();
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get compliance status' });
    }
  });

  // Approval requests endpoint
  app.get('/api/compliance/approvals', isAuthenticated, (req, res) => {
    try {
      const approvals = complianceMonitor.getPendingApprovals();
      res.json({ approvals });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get approval requests' });
    }
  });

  // Process approval endpoint
  app.post('/api/compliance/approvals/:id', isAuthenticated, (req, res) => {
    try {
      const { id } = req.params;
      const { approved, notes } = req.body;
      const approvedBy = req.user?.claims?.sub || 'unknown';
      
      const result = complianceMonitor.processApproval(id, approved, approvedBy, notes);
      res.json({ success: true, approved: result });
    } catch (error) {
      res.status(500).json({ error: 'Failed to process approval' });
    }
  });

  // GPT Chatbot API Route
  app.post('/api/gpt-chatbot/chat', async (req, res) => {
    try {
      const { message, conversationHistory } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      // Build conversation context from history
      const messages = [
        {
          role: "system",
          content: `You are FanzAI, the intelligent assistant for Fanz™ Unlimited Network LLC's enterprise platform. You help users with:
          
- Platform navigation and feature explanations
- Content moderation policies and compliance (18 U.S.C. § 2257)
- Financial insights and analytics interpretation
- Technical support for creators and moderators
- Crisis management and threat assessment procedures
- AI analysis engine capabilities and results
- Platform cluster management (BoyFanz, GirlFanz, DaddyFanz, etc.)
- Self-healing system status and maintenance
- Predictive analytics and forecasting

Always provide accurate, helpful information while maintaining professional tone. For sensitive compliance matters, remind users to contact the legal team at fanzunlimited.com for official guidance.`
        }
      ];

      // Add conversation history (last 5 exchanges)
      if (conversationHistory && Array.isArray(conversationHistory)) {
        const recentHistory = conversationHistory.slice(-10);
        recentHistory.forEach((msg: any) => {
          if (msg.role === 'user' || msg.role === 'assistant') {
            messages.push({
              role: msg.role,
              content: msg.content
            });
          }
        });
      }

      // Add current user message
      messages.push({
        role: "user",
        content: message
      });

      // Use the existing OpenAI service with fallback
      try {
        const openai = await import("openai");
        const client = new openai.default({
          apiKey: process.env.OPENAI_API_KEY,
        });

        const response = await client.chat.completions.create({
          model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
          messages: messages as any[],
          max_tokens: 500,
          temperature: 0.7,
        });

        const aiResponse = response.choices[0].message.content;
        res.json({ message: aiResponse });
      } catch (error) {
        console.error('OpenAI API error:', error);
        // Fallback response for when OpenAI is unavailable
        const fallbackResponse = `I'm experiencing some technical difficulties right now. For immediate assistance with FanzDash, please:

• Check the Neural Dashboard for system status
• Review the Knowledge Base in the help section
• Contact support at fanzunlimited.com
• For urgent compliance matters, use the Crisis Management portal

I'll be back online shortly. Thank you for your patience!`;
        
        res.json({ message: fallbackResponse });
      }
    } catch (error) {
      console.error('Chatbot API error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
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