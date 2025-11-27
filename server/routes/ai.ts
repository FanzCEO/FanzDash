/**
 * AI Services API Routes
 * Exposes Hugging Face AI capabilities via REST API
 */

import { Router } from 'express';
import { huggingFaceService } from '../ai/huggingFaceService';
import { aiCompanionService } from '../ai/aiCompanionService';
import { getModel, getModelsByCategory, getAdultSafeModels } from '../ai/huggingFaceConfig';

const router = Router();

/**
 * GET /api/ai/models
 * Get available Hugging Face models
 */
router.get('/models', async (req, res) => {
  try {
    const models = huggingFaceService.getAvailableModels();
    res.json({
      success: true,
      models: models.map(m => ({
        id: m.id,
        name: m.name,
        type: m.type,
        adult_safe: m.adult_safe,
        recommended_use: m.recommended_use,
        context_length: m.context_length
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch models'
    });
  }
});

/**
 * GET /api/ai/models/category/:category
 * Get models by category
 */
router.get('/models/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const models = getModelsByCategory(category as any);

    res.json({
      success: true,
      category,
      models: models.map(m => ({
        id: m.id,
        name: m.name,
        description: m.description
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch models by category'
    });
  }
});

/**
 * GET /api/ai/health
 * Check AI service health
 */
router.get('/health', async (req, res) => {
  try {
    const health = await huggingFaceService.getHealthStatus();
    res.json({
      success: true,
      ...health
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 'down',
      message: 'Health check failed'
    });
  }
});

/**
 * POST /api/ai/generate
 * Generate text using Hugging Face models
 */
router.post('/generate', async (req, res) => {
  try {
    const {
      prompt,
      modelId,
      maxTokens,
      temperature,
      systemPrompt
    } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required'
      });
    }

    const response = await huggingFaceService.generateText({
      prompt,
      modelId,
      maxTokens,
      temperature,
      systemPrompt
    });

    res.json({
      success: true,
      ...response
    });
  } catch (error) {
    console.error('Text generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Text generation failed'
    });
  }
});

/**
 * POST /api/ai/moderate
 * Moderate content using AI
 */
router.post('/moderate', async (req, res) => {
  try {
    const { content, contentType, context } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'Content is required'
      });
    }

    const result = await huggingFaceService.moderateContent({
      content,
      contentType: contentType || 'text',
      context
    });

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Content moderation error:', error);
    res.status(500).json({
      success: false,
      error: 'Content moderation failed'
    });
  }
});

/**
 * POST /api/ai/companion/chat
 * Chat with AI companion
 */
router.post('/companion/chat', async (req, res) => {
  try {
    const { userId, companionId, message } = req.body;

    if (!userId || !companionId || !message) {
      return res.status(400).json({
        success: false,
        error: 'userId, companionId, and message are required'
      });
    }

    const response = await aiCompanionService.chat(
      userId,
      companionId,
      message
    );

    res.json({
      success: true,
      ...response
    });
  } catch (error) {
    console.error('AI companion chat error:', error);
    res.status(500).json({
      success: false,
      error: 'Chat failed'
    });
  }
});

/**
 * POST /api/ai/companion/content-ideas
 * Generate content ideas for creators
 */
router.post('/companion/content-ideas', async (req, res) => {
  try {
    const { creatorId, contentType, creatorNiche, count } = req.body;

    if (!creatorId || !contentType || !creatorNiche) {
      return res.status(400).json({
        success: false,
        error: 'creatorId, contentType, and creatorNiche are required'
      });
    }

    const ideas = await aiCompanionService.generateCreatorContentIdeas(
      creatorId,
      contentType,
      creatorNiche,
      count || 5
    );

    res.json({
      success: true,
      contentType,
      ideas
    });
  } catch (error) {
    console.error('Content ideas generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate content ideas'
    });
  }
});

/**
 * POST /api/ai/companion/fan-message
 * Generate personalized fan message
 */
router.post('/companion/fan-message', async (req, res) => {
  try {
    const { creatorId, fanName, messageType, personalDetails } = req.body;

    if (!creatorId || !fanName || !messageType) {
      return res.status(400).json({
        success: false,
        error: 'creatorId, fanName, and messageType are required'
      });
    }

    const message = await aiCompanionService.generateFanMessage(
      creatorId,
      fanName,
      messageType,
      personalDetails
    );

    res.json({
      success: true,
      message
    });
  } catch (error) {
    console.error('Fan message generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate fan message'
    });
  }
});

/**
 * POST /api/ai/companion/analyze-feedback
 * Analyze fan feedback
 */
router.post('/companion/analyze-feedback', async (req, res) => {
  try {
    const { feedback } = req.body;

    if (!feedback) {
      return res.status(400).json({
        success: false,
        error: 'feedback is required'
      });
    }

    const analysis = await aiCompanionService.analyzeFanFeedback(feedback);

    res.json({
      success: true,
      ...analysis
    });
  } catch (error) {
    console.error('Feedback analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze feedback'
    });
  }
});

/**
 * GET /api/ai/companion/history/:userId/:companionId
 * Get conversation history
 */
router.get('/companion/history/:userId/:companionId', async (req, res) => {
  try {
    const { userId, companionId } = req.params;

    const history = aiCompanionService.getConversationHistory(userId, companionId);

    res.json({
      success: true,
      conversationId: `${userId}:${companionId}`,
      messageCount: history.length,
      history: history.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp
      }))
    });
  } catch (error) {
    console.error('History fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch conversation history'
    });
  }
});

/**
 * DELETE /api/ai/companion/history/:userId/:companionId
 * Clear conversation history
 */
router.delete('/companion/history/:userId/:companionId', async (req, res) => {
  try {
    const { userId, companionId } = req.params;

    aiCompanionService.clearConversation(userId, companionId);

    res.json({
      success: true,
      message: 'Conversation history cleared'
    });
  } catch (error) {
    console.error('History clear error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear conversation history'
    });
  }
});

/**
 * GET /api/ai/companion/personalities
 * Get available companion personalities
 */
router.get('/companion/personalities', async (req, res) => {
  try {
    const personalities = ['default', 'flirty', 'professional'];

    res.json({
      success: true,
      personalities: personalities.map(id => {
        const personality = aiCompanionService.getCompanionPersonality(id);
        return {
          id,
          name: personality?.name,
          tone: personality?.tone,
          traits: personality?.traits
        };
      })
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch personalities'
    });
  }
});

export default router;
