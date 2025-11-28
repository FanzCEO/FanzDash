/**
 * AI Companion Service
 * Provides AI-powered companion features for creators and fans
 * Uses Hugging Face models for natural, adult-safe conversations
 */

import { huggingFaceService } from './huggingFaceService';
import { getModel, HuggingFaceModel } from './huggingFaceConfig';

export interface CompanionPersonality {
  name: string;
  traits: string[];
  tone: 'friendly' | 'flirty' | 'professional' | 'playful' | 'mysterious';
  interests: string[];
  background: string;
  communicationStyle: string;
}

export interface ConversationContext {
  userId: string;
  companionId: string;
  personality: CompanionPersonality;
  history: ConversationMessage[];
  preferences: {
    responseLength: 'short' | 'medium' | 'long';
    creativity: number; // 0-1
    adult_content_allowed: boolean;
  };
}

export interface ConversationMessage {
  role: 'user' | 'companion' | 'system';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface CompanionResponse {
  message: string;
  emotion: 'happy' | 'excited' | 'curious' | 'sympathetic' | 'neutral' | 'playful';
  confidence: number;
  suggestedActions?: string[];
  modelUsed: string;
}

export class AICompanionService {
  private conversations = new Map<string, ConversationContext>();
  private companionPersonalities = new Map<string, CompanionPersonality>();

  constructor() {
    this.initializeDefaultPersonalities();
  }

  /**
   * Start or continue a conversation with an AI companion
   */
  async chat(
    userId: string,
    companionId: string,
    userMessage: string,
    contextOverride?: Partial<ConversationContext>
  ): Promise<CompanionResponse> {
    try {
      // Get or create conversation context
      const conversationKey = `${userId}:${companionId}`;
      let context = this.conversations.get(conversationKey);

      if (!context) {
        context = await this.createConversationContext(userId, companionId, contextOverride);
        this.conversations.set(conversationKey, context);
      }

      // Add user message to history
      context.history.push({
        role: 'user',
        content: userMessage,
        timestamp: new Date()
      });

      // Keep only last 10 messages for context
      if (context.history.length > 20) {
        context.history = context.history.slice(-20);
      }

      // Build conversation history for prompt
      const conversationHistory = context.history
        .slice(-10)
        .map(msg => `${msg.role === 'user' ? 'User' : context.personality.name}: ${msg.content}`)
        .filter(msg => !msg.startsWith('system'));

      // Generate companion response
      const response = await huggingFaceService.generateCompanionResponse(
        userMessage,
        this.buildPersonalityPrompt(context.personality),
        conversationHistory
      );

      // Analyze emotion from response
      const emotion = await this.detectEmotion(response);

      // Add companion response to history
      context.history.push({
        role: 'companion',
        content: response,
        timestamp: new Date(),
        metadata: { emotion }
      });

      // Generate suggested actions
      const suggestedActions = await this.generateSuggestedActions(context, response);

      return {
        message: response,
        emotion,
        confidence: 0.85,
        suggestedActions,
        modelUsed: 'dark-planet-10.7b'
      };
    } catch (error) {
      console.error('AI companion chat failed:', error);
      return {
        message: "I'm having trouble connecting right now. Can you try again?",
        emotion: 'neutral',
        confidence: 0,
        modelUsed: 'fallback'
      };
    }
  }

  /**
   * Generate content suggestions for creators
   */
  async generateCreatorContentIdeas(
    creatorId: string,
    contentType: 'post' | 'story' | 'caption' | 'bio' | 'message',
    creatorNiche: string,
    count: number = 5
  ): Promise<string[]> {
    try {
      const creatorProfile = `Creator specializing in ${creatorNiche} content`;
      return await huggingFaceService.generateContentSuggestions(
        creatorProfile,
        contentType,
        count
      );
    } catch (error) {
      console.error('Content idea generation failed:', error);
      return [
        'Share a behind-the-scenes moment from your day',
        'Create a fun poll to engage with your fans',
        'Post an exclusive preview of upcoming content'
      ];
    }
  }

  /**
   * Generate personalized messages to fans
   */
  async generateFanMessage(
    creatorId: string,
    fanName: string,
    messageType: 'welcome' | 'thank_you' | 'milestone' | 're_engagement',
    personalDetails?: string
  ): Promise<string> {
    try {
      const prompts = {
        welcome: `Generate a warm welcome message for a new fan named ${fanName}.`,
        thank_you: `Generate a heartfelt thank you message for ${fanName} who just supported you.`,
        milestone: `Generate a celebratory message for ${fanName} about reaching a milestone together.`,
        re_engagement: `Generate a friendly re-engagement message for ${fanName} who hasn't been active lately.`
      };

      const basePrompt = prompts[messageType];
      const fullPrompt = personalDetails
        ? `${basePrompt} Context: ${personalDetails}`
        : basePrompt;

      const response = await huggingFaceService.generateText({
        prompt: fullPrompt,
        systemPrompt: 'You are a friendly, authentic content creator writing personal messages to your fans.',
        maxTokens: 200,
        temperature: 0.85
      });

      return response.text.trim();
    } catch (error) {
      console.error('Fan message generation failed:', error);
      return `Hey ${fanName}! Thanks for being amazing! 💕`;
    }
  }

  /**
   * Analyze fan feedback sentiment
   */
  async analyzeFanFeedback(feedback: string): Promise<{
    sentiment: 'positive' | 'negative' | 'neutral';
    topics: string[];
    actionItems: string[];
    priority: 'low' | 'medium' | 'high';
  }> {
    try {
      const sentimentResult = await huggingFaceService.analyzeSentiment(feedback);

      // Extract key topics (simple keyword extraction)
      const topics = this.extractTopics(feedback);

      // Generate action items based on sentiment
      const actionItems = this.generateActionItems(sentimentResult.sentiment, topics);

      // Determine priority
      const priority = sentimentResult.sentiment === 'negative' ? 'high' :
                      sentimentResult.sentiment === 'positive' ? 'low' : 'medium';

      return {
        sentiment: sentimentResult.sentiment,
        topics,
        actionItems,
        priority
      };
    } catch (error) {
      console.error('Feedback analysis failed:', error);
      return {
        sentiment: 'neutral',
        topics: [],
        actionItems: ['Review feedback manually'],
        priority: 'medium'
      };
    }
  }

  /**
   * Create custom companion personality
   */
  createCompanionPersonality(
    id: string,
    personality: CompanionPersonality
  ): void {
    this.companionPersonalities.set(id, personality);
  }

  /**
   * Get companion personality
   */
  getCompanionPersonality(id: string): CompanionPersonality | undefined {
    return this.companionPersonalities.get(id);
  }

  /**
   * Get conversation history
   */
  getConversationHistory(userId: string, companionId: string): ConversationMessage[] {
    const context = this.conversations.get(`${userId}:${companionId}`);
    return context?.history || [];
  }

  /**
   * Clear conversation history
   */
  clearConversation(userId: string, companionId: string): void {
    this.conversations.delete(`${userId}:${companionId}`);
  }

  // Private helper methods

  private async createConversationContext(
    userId: string,
    companionId: string,
    contextOverride?: Partial<ConversationContext>
  ): Promise<ConversationContext> {
    const personality = this.companionPersonalities.get(companionId) || this.getDefaultPersonality();

    return {
      userId,
      companionId,
      personality,
      history: [],
      preferences: {
        responseLength: 'medium',
        creativity: 0.8,
        adult_content_allowed: true
      },
      ...contextOverride
    };
  }

  private buildPersonalityPrompt(personality: CompanionPersonality): string {
    return `Your name is ${personality.name}. ${personality.background}

Personality traits: ${personality.traits.join(', ')}
Tone: ${personality.tone}
Interests: ${personality.interests.join(', ')}
Communication style: ${personality.communicationStyle}

Stay in character and be engaging, authentic, and respectful.`;
  }

  private async detectEmotion(text: string): Promise<'happy' | 'excited' | 'curious' | 'sympathetic' | 'neutral' | 'playful'> {
    const lowerText = text.toLowerCase();

    if (lowerText.includes('!') || lowerText.includes('love') || lowerText.includes('amazing')) {
      return 'excited';
    }
    if (lowerText.includes('?') || lowerText.includes('wonder') || lowerText.includes('curious')) {
      return 'curious';
    }
    if (lowerText.includes('😊') || lowerText.includes('great') || lowerText.includes('happy')) {
      return 'happy';
    }
    if (lowerText.includes('haha') || lowerText.includes('lol') || lowerText.includes('fun')) {
      return 'playful';
    }
    if (lowerText.includes('sorry') || lowerText.includes('understand')) {
      return 'sympathetic';
    }

    return 'neutral';
  }

  private async generateSuggestedActions(
    context: ConversationContext,
    response: string
  ): Promise<string[]> {
    // Simple rule-based suggestions
    const actions: string[] = [];
    const lowerResponse = response.toLowerCase();

    if (lowerResponse.includes('photo') || lowerResponse.includes('picture')) {
      actions.push('Share a photo');
    }
    if (lowerResponse.includes('tell me more') || lowerResponse.includes('interested')) {
      actions.push('Continue the story');
    }
    if (lowerResponse.includes('?')) {
      actions.push('Answer the question');
    }

    return actions.length > 0 ? actions : ['Send a message', 'Ask a question', 'Share something'];
  }

  private extractTopics(text: string): string[] {
    const topics: string[] = [];
    const lowerText = text.toLowerCase();

    const topicKeywords = {
      'content quality': ['content', 'quality', 'video', 'photo', 'post'],
      'communication': ['message', 'reply', 'response', 'communication'],
      'pricing': ['price', 'cost', 'expensive', 'cheap', 'subscription'],
      'features': ['feature', 'tool', 'option', 'functionality'],
      'experience': ['experience', 'enjoy', 'love', 'like', 'hate']
    };

    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      if (keywords.some(kw => lowerText.includes(kw))) {
        topics.push(topic);
      }
    });

    return topics;
  }

  private generateActionItems(
    sentiment: 'positive' | 'negative' | 'neutral',
    topics: string[]
  ): string[] {
    const actions: string[] = [];

    if (sentiment === 'negative') {
      actions.push('Follow up with personal response');
      actions.push('Review and address concerns');
      if (topics.includes('content quality')) {
        actions.push('Improve content quality based on feedback');
      }
    } else if (sentiment === 'positive') {
      actions.push('Thank the user for positive feedback');
      if (topics.includes('content quality')) {
        actions.push('Continue current content strategy');
      }
    } else {
      actions.push('Monitor for follow-up messages');
    }

    return actions;
  }

  private initializeDefaultPersonalities(): void {
    // Default companion personality
    this.createCompanionPersonality('default', {
      name: 'Alex',
      traits: ['friendly', 'engaging', 'supportive', 'respectful'],
      tone: 'friendly',
      interests: ['conversation', 'creativity', 'connections'],
      background: 'A friendly AI companion designed to engage in meaningful conversations.',
      communicationStyle: 'Natural, warm, and conversational. Uses appropriate emojis occasionally.'
    });

    // Flirty companion
    this.createCompanionPersonality('flirty', {
      name: 'Raven',
      traits: ['playful', 'confident', 'charming', 'mysterious'],
      tone: 'flirty',
      interests: ['flirting', 'teasing', 'adventure'],
      background: 'A playful and confident companion who enjoys flirtatious banter.',
      communicationStyle: 'Confident and playful with a touch of mystery.'
    });

    // Professional companion
    this.createCompanionPersonality('professional', {
      name: 'Morgan',
      traits: ['professional', 'knowledgeable', 'helpful', 'efficient'],
      tone: 'professional',
      interests: ['business', 'strategy', 'growth'],
      background: 'A professional AI assistant focused on helping creators succeed.',
      communicationStyle: 'Clear, professional, and goal-oriented.'
    });
  }

  private getDefaultPersonality(): CompanionPersonality {
    return this.companionPersonalities.get('default')!;
  }
}

// Export singleton instance
export const aiCompanionService = new AICompanionService();
