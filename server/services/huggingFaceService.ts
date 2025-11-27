import { db } from "../db";
import { huggingfaceModels } from "@shared/schema";
import { eq } from "drizzle-orm";

// 🤖 HUGGINGFACE AI MODEL INTEGRATION SERVICE

export interface HuggingFaceInferenceRequest {
  modelId: string;
  inputs: any;
  parameters?: Record<string, any>;
  options?: {
    useCache?: boolean;
    waitForModel?: boolean;
  };
}

export interface HuggingFaceInferenceResponse {
  success: boolean;
  data?: any;
  error?: string;
  modelId: string;
  latency: number;
  cached?: boolean;
}

export class HuggingFaceService {
  private static instance: HuggingFaceService;
  private readonly defaultApiEndpoint = "https://api-inference.huggingface.co/models/";
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 300000; // 5 minutes

  private constructor() {}

  static getInstance(): HuggingFaceService {
    if (!HuggingFaceService.instance) {
      HuggingFaceService.instance = new HuggingFaceService();
    }
    return HuggingFaceService.instance;
  }

  /**
   * Run inference on a HuggingFace model
   */
  async infer(request: HuggingFaceInferenceRequest): Promise<HuggingFaceInferenceResponse> {
    const startTime = Date.now();

    try {
      // Get model configuration from database
      const modelConfig = await this.getModelConfig(request.modelId);
      if (!modelConfig) {
        throw new Error(`Model ${request.modelId} not found in configuration`);
      }

      if (!modelConfig.isActive) {
        throw new Error(`Model ${request.modelId} is not active`);
      }

      // Check cache if enabled
      const cacheKey = this.getCacheKey(request);
      if (request.options?.useCache) {
        const cached = this.getFromCache(cacheKey);
        if (cached) {
          return {
            success: true,
            data: cached,
            modelId: request.modelId,
            latency: Date.now() - startTime,
            cached: true,
          };
        }
      }

      // Prepare API call
      const endpoint = modelConfig.apiEndpoint || `${this.defaultApiEndpoint}${modelConfig.modelId}`;
      const apiKey = modelConfig.apiKey || process.env.HUGGINGFACE_API_KEY;

      if (!apiKey) {
        throw new Error("HuggingFace API key not configured");
      }

      // Apply rate limiting check
      await this.checkRateLimit(request.modelId, modelConfig.rateLimiting);

      // Apply content filtering
      const filteredInputs = await this.applyContentFiltering(
        request.inputs,
        modelConfig.contentFiltering
      );

      // Merge parameters with model defaults
      const parameters = {
        ...modelConfig.parameters,
        ...request.parameters,
      };

      // Make API request
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: filteredInputs,
          parameters,
          options: request.options,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`HuggingFace API error: ${response.status} - ${error}`);
      }

      const data = await response.json();
      const latency = Date.now() - startTime;

      // Cache result if enabled
      if (request.options?.useCache) {
        this.setCache(cacheKey, data);
      }

      // Update model usage stats
      await this.updateUsageStats(request.modelId, latency);

      return {
        success: true,
        data,
        modelId: request.modelId,
        latency,
        cached: false,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        modelId: request.modelId,
        latency: Date.now() - startTime,
      };
    }
  }

  /**
   * Test a model configuration
   */
  async testModel(modelId: string): Promise<HuggingFaceInferenceResponse> {
    try {
      const modelConfig = await this.getModelConfig(modelId);
      if (!modelConfig) {
        throw new Error(`Model ${modelId} not found`);
      }

      // Send a simple test input based on task type
      const testInput = this.getTestInput(modelConfig.task);

      return await this.infer({
        modelId,
        inputs: testInput,
        options: { waitForModel: true },
      });
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        modelId,
        latency: 0,
      };
    }
  }

  /**
   * Get model configuration from database
   */
  private async getModelConfig(modelId: string) {
    try {
      const result = await db
        .select()
        .from(huggingfaceModels)
        .where(eq(huggingfaceModels.id, modelId))
        .limit(1);

      return result[0] || null;
    } catch (error) {
      console.error("Error fetching model config:", error);
      return null;
    }
  }

  /**
   * Apply content filtering based on configuration
   */
  private async applyContentFiltering(
    inputs: any,
    contentFiltering: any
  ): Promise<any> {
    if (!contentFiltering || Object.keys(contentFiltering).length === 0) {
      return inputs;
    }

    // Apply content filtering rules
    // This is a placeholder - implement actual content filtering logic
    if (typeof inputs === "string") {
      // Example: filter profanity, sensitive content, etc.
      return inputs;
    }

    return inputs;
  }

  /**
   * Check rate limiting
   */
  private async checkRateLimit(
    modelId: string,
    rateLimiting: any
  ): Promise<void> {
    if (!rateLimiting || Object.keys(rateLimiting).length === 0) {
      return;
    }

    // Implement rate limiting check
    // This is a placeholder - implement actual rate limiting logic
    // You might use Redis or an in-memory store for this
  }

  /**
   * Update model usage statistics
   */
  private async updateUsageStats(modelId: string, latency: number): Promise<void> {
    try {
      const model = await this.getModelConfig(modelId);
      if (!model) return;

      const usageStats = model.usageStats || {
        totalRequests: 0,
        totalLatency: 0,
        avgLatency: 0,
        lastRequestTime: null,
      };

      usageStats.totalRequests += 1;
      usageStats.totalLatency += latency;
      usageStats.avgLatency = usageStats.totalLatency / usageStats.totalRequests;
      usageStats.lastRequestTime = new Date().toISOString();

      await db
        .update(huggingfaceModels)
        .set({
          usageStats,
          lastUsed: new Date(),
        })
        .where(eq(huggingfaceModels.id, modelId));
    } catch (error) {
      console.error("Error updating usage stats:", error);
    }
  }

  /**
   * Cache management
   */
  private getCacheKey(request: HuggingFaceInferenceRequest): string {
    return `${request.modelId}:${JSON.stringify(request.inputs)}:${JSON.stringify(request.parameters || {})}`;
  }

  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const age = Date.now() - cached.timestamp;
    if (age > this.CACHE_TTL) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Get test input based on task type
   */
  private getTestInput(task: string): any {
    const testInputs: Record<string, any> = {
      "text-generation": "Hello, how are you?",
      "text-classification": "This is a test sentence.",
      "token-classification": "My name is John and I live in New York.",
      "question-answering": {
        question: "What is AI?",
        context: "AI stands for Artificial Intelligence.",
      },
      "summarization": "Artificial intelligence is the simulation of human intelligence processes by machines, especially computer systems. These processes include learning, reasoning, and self-correction.",
      "translation": "Hello, how are you?",
      "text2text-generation": "Translate English to French: Hello",
      "sentiment-analysis": "I love this product!",
      "image-classification": "https://example.com/test-image.jpg",
      "object-detection": "https://example.com/test-image.jpg",
      "image-segmentation": "https://example.com/test-image.jpg",
      "text-to-image": "A beautiful sunset over the ocean",
      "image-to-text": "https://example.com/test-image.jpg",
      "automatic-speech-recognition": "https://example.com/test-audio.mp3",
      "audio-classification": "https://example.com/test-audio.mp3",
      "text-to-speech": "Hello, this is a test.",
      "conversational": { text: "Hello!", conversational_id: "test" },
      "feature-extraction": "Extract features from this text.",
      "fill-mask": "The capital of France is [MASK].",
      "zero-shot-classification": {
        sequences: "This is a test sentence.",
        candidate_labels: ["positive", "negative", "neutral"],
      },
    };

    return testInputs[task] || "Test input";
  }

  /**
   * Get list of all configured models
   */
  async getAllModels(): Promise<any[]> {
    try {
      return await db.select().from(huggingfaceModels);
    } catch (error) {
      console.error("Error fetching models:", error);
      return [];
    }
  }

  /**
   * Get active models only
   */
  async getActiveModels(): Promise<any[]> {
    try {
      return await db
        .select()
        .from(huggingfaceModels)
        .where(eq(huggingfaceModels.isActive, true));
    } catch (error) {
      console.error("Error fetching active models:", error);
      return [];
    }
  }
}

// Export singleton instance
export const huggingFaceService = HuggingFaceService.getInstance();
