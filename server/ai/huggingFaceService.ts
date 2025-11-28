/**
 * Hugging Face Integration Service
 * Handles all interactions with Hugging Face models for AI features
 */

import {
  HUGGING_FACE_MODELS,
  HUGGINGFACE_API_CONFIG,
  getModel,
  getRecommendedModel,
  HuggingFaceModel
} from './huggingFaceConfig';

export interface TextGenerationRequest {
  prompt: string;
  modelId?: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  topK?: number;
  stopSequences?: string[];
  systemPrompt?: string;
}

export interface TextGenerationResponse {
  text: string;
  model: string;
  tokensUsed: number;
  finishReason: 'stop' | 'length' | 'error';
  processingTime: number;
  metadata?: Record<string, any>;
}

export interface ContentModerationRequest {
  content: string;
  contentType: 'text' | 'image_url';
  context?: string;
}

export interface ContentModerationResponse {
  safe: boolean;
  confidence: number;
  categories: {
    adult: number;
    violence: number;
    hate: number;
    harassment: number;
    illegal: number;
  };
  flags: string[];
  recommendation: 'approve' | 'review' | 'reject';
  reasoning: string;
}

export class HuggingFaceService {
  private apiKey: string;
  private baseUrl: string;
  private requestCache = new Map<string, any>();

  constructor() {
    this.apiKey = HUGGINGFACE_API_CONFIG.apiKey;
    this.baseUrl = HUGGINGFACE_API_CONFIG.baseUrl;

    if (!this.apiKey) {
      console.warn('⚠️  HUGGINGFACE_API_KEY not set - using mock responses');
    }
  }

  /**
   * Generate text using Hugging Face models
   */
  async generateText(request: TextGenerationRequest): Promise<TextGenerationResponse> {
    const startTime = Date.now();

    try {
      const model = request.modelId ? getModel(request.modelId) : getRecommendedModel('creative-writing');

      if (!model) {
        throw new Error(`Model not found: ${request.modelId}`);
      }

      // Build the prompt with system message if provided
      const fullPrompt = request.systemPrompt
        ? `${request.systemPrompt}\n\n${request.prompt}`
        : request.prompt;

      const payload = {
        inputs: fullPrompt,
        parameters: {
          max_new_tokens: request.maxTokens || model.parameters?.max_tokens || 1000,
          temperature: request.temperature ?? model.parameters?.temperature ?? 0.8,
          top_p: request.topP ?? model.parameters?.top_p ?? 0.95,
          top_k: request.topK ?? model.parameters?.top_k ?? 50,
          do_sample: true,
          return_full_text: false,
          stop_sequences: request.stopSequences || []
        },
        options: {
          wait_for_model: true,
          use_cache: false
        }
      };

      // If no API key, return mock response
      if (!this.apiKey) {
        return this.generateMockTextResponse(request.prompt, model, startTime);
      }

      const response = await this.makeRequest(
        `${this.baseUrl}/models/${model.id}`,
        payload
      );

      const generatedText = Array.isArray(response)
        ? response[0]?.generated_text || ''
        : response.generated_text || '';

      return {
        text: generatedText,
        model: model.id,
        tokensUsed: this.estimateTokens(generatedText),
        finishReason: 'stop',
        processingTime: Date.now() - startTime,
        metadata: {
          model_name: model.name,
          context_length: model.context_length
        }
      };
    } catch (error) {
      console.error('Hugging Face text generation failed:', error);
      return {
        text: 'Text generation failed. Please try again.',
        model: request.modelId || 'unknown',
        tokensUsed: 0,
        finishReason: 'error',
        processingTime: Date.now() - startTime,
        metadata: { error: String(error) }
      };
    }
  }

  /**
   * Moderate content using Hugging Face models
   */
  async moderateContent(request: ContentModerationRequest): Promise<ContentModerationResponse> {
    try {
      // For now, use a simple rule-based approach
      // In production, you would use a dedicated content moderation model
      const flags: string[] = [];
      let safe = true;

      // Check for explicit keywords (basic implementation)
      const explicitKeywords = ['illegal', 'underage', 'minor', 'child'];
      const violentKeywords = ['kill', 'murder', 'violence', 'assault'];

      const lowerContent = request.content.toLowerCase();

      if (explicitKeywords.some(kw => lowerContent.includes(kw))) {
        flags.push('potentially_illegal_content');
        safe = false;
      }

      if (violentKeywords.some(kw => lowerContent.includes(kw))) {
        flags.push('violent_content');
      }

      return {
        safe,
        confidence: safe ? 0.85 : 0.95,
        categories: {
          adult: 0.1,
          violence: flags.includes('violent_content') ? 0.7 : 0.1,
          hate: 0.05,
          harassment: 0.05,
          illegal: flags.includes('potentially_illegal_content') ? 0.9 : 0.05
        },
        flags,
        recommendation: safe ? 'approve' : 'reject',
        reasoning: safe
          ? 'Content appears to meet community guidelines'
          : 'Content flagged for potential policy violations'
      };
    } catch (error) {
      console.error('Content moderation failed:', error);
      return {
        safe: false,
        confidence: 0,
        categories: { adult: 0, violence: 0, hate: 0, harassment: 0, illegal: 0 },
        flags: ['moderation_error'],
        recommendation: 'review',
        reasoning: 'Moderation error - requires manual review'
      };
    }
  }

  /**
   * Generate AI companion response
   */
  async generateCompanionResponse(
    userMessage: string,
    companionPersonality: string,
    conversationHistory: string[] = []
  ): Promise<string> {
    const systemPrompt = `You are an AI companion with the following personality: ${companionPersonality}.
You are part of an adult content platform and should be friendly, engaging, and respectful.
Keep responses natural and conversational. Maintain appropriate boundaries while being warm and helpful.`;

    const context = conversationHistory.length > 0
      ? `Previous conversation:\n${conversationHistory.slice(-5).join('\n')}\n\n`
      : '';

    const prompt = `${context}User: ${userMessage}\nCompanion:`;

    const response = await this.generateText({
      prompt,
      systemPrompt,
      modelId: 'dark-planet-10.7b',
      maxTokens: 500,
      temperature: 0.85
    });

    return response.text.trim();
  }

  /**
   * Generate creative content suggestions
   */
  async generateContentSuggestions(
    creatorProfile: string,
    contentType: 'post' | 'story' | 'caption' | 'bio',
    count: number = 3
  ): Promise<string[]> {
    const systemPrompt = `You are a creative writing assistant for adult content creators.
Generate ${count} ${contentType} suggestions that are engaging, creative, and appropriate for the platform.`;

    const prompt = `Creator profile: ${creatorProfile}\n\nGenerate ${count} creative ${contentType} ideas:`;

    const response = await this.generateText({
      prompt,
      systemPrompt,
      modelId: 'dark-planet-10.7b',
      maxTokens: 800,
      temperature: 0.9
    });

    // Parse the response into individual suggestions
    const suggestions = response.text
      .split('\n')
      .filter(line => line.trim().length > 0)
      .slice(0, count);

    return suggestions.length > 0 ? suggestions : [response.text];
  }

  /**
   * Analyze sentiment of user feedback
   */
  async analyzeSentiment(text: string): Promise<{
    sentiment: 'positive' | 'negative' | 'neutral';
    score: number;
    confidence: number;
  }> {
    // Simple sentiment analysis (in production, use a dedicated model)
    const positiveWords = ['love', 'great', 'amazing', 'awesome', 'fantastic', 'excellent', 'wonderful'];
    const negativeWords = ['hate', 'terrible', 'awful', 'horrible', 'bad', 'worst', 'disgusting'];

    const lowerText = text.toLowerCase();
    let score = 0;

    positiveWords.forEach(word => {
      if (lowerText.includes(word)) score += 0.2;
    });

    negativeWords.forEach(word => {
      if (lowerText.includes(word)) score -= 0.2;
    });

    score = Math.max(-1, Math.min(1, score));

    return {
      sentiment: score > 0.1 ? 'positive' : score < -0.1 ? 'negative' : 'neutral',
      score,
      confidence: 0.75
    };
  }

  /**
   * Make HTTP request to Hugging Face API
   */
  private async makeRequest(url: string, payload: any): Promise<any> {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Hugging Face API error: ${response.status} - ${error}`);
    }

    return await response.json();
  }

  /**
   * Estimate token count (rough approximation)
   */
  private estimateTokens(text: string): number {
    return Math.ceil(text.split(/\s+/).length * 1.3);
  }

  /**
   * Generate mock response when API key is not available
   */
  private generateMockTextResponse(
    prompt: string,
    model: HuggingFaceModel,
    startTime: number
  ): TextGenerationResponse {
    const mockResponses = [
      'This is a sample AI-generated response. Configure your HUGGINGFACE_API_KEY to get real AI responses.',
      'AI companion mode is running in demo mode. Add your Hugging Face API key to enable full functionality.',
      'Content generation is ready! Set up your Hugging Face API credentials to unlock advanced AI features.'
    ];

    const mockText = mockResponses[Math.floor(Math.random() * mockResponses.length)];

    return {
      text: mockText,
      model: model.id,
      tokensUsed: this.estimateTokens(mockText),
      finishReason: 'stop',
      processingTime: Date.now() - startTime,
      metadata: {
        demo_mode: true,
        model_name: model.name
      }
    };
  }

  /**
   * Get available models
   */
  getAvailableModels(): HuggingFaceModel[] {
    return Object.values(HUGGING_FACE_MODELS);
  }

  /**
   * Get service health status
   */
  async getHealthStatus(): Promise<{
    status: 'operational' | 'degraded' | 'down';
    apiKeyConfigured: boolean;
    modelsAvailable: number;
    message: string;
  }> {
    return {
      status: this.apiKey ? 'operational' : 'degraded',
      apiKeyConfigured: !!this.apiKey,
      modelsAvailable: Object.keys(HUGGING_FACE_MODELS).length,
      message: this.apiKey
        ? 'Hugging Face service is operational'
        : 'Running in demo mode - configure HUGGINGFACE_API_KEY for full functionality'
    };
  }
}

// Export singleton instance
export const huggingFaceService = new HuggingFaceService();
