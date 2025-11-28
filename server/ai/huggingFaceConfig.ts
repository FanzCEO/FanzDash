/**
 * Hugging Face Model Configuration
 * Contains all Hugging Face model URLs and configurations for FANZ ecosystem
 */

export interface HuggingFaceModel {
  id: string;
  name: string;
  url: string;
  type: 'text-generation' | 'image-generation' | 'content-moderation' | 'embedding';
  provider: 'huggingface' | 'self-hosted';
  description: string;
  context_length?: number;
  adult_safe: boolean;
  recommended_use: string[];
  parameters?: {
    max_tokens?: number;
    temperature?: number;
    top_p?: number;
    top_k?: number;
  };
}

export const HUGGING_FACE_MODELS: Record<string, HuggingFaceModel> = {
  // Dark Planet Models - Creative Writing & Adult Content Generation
  'dark-planet-10.7b': {
    id: 'DavidAU/L3.1-Dark-Planet-10.7B-ExxxxxxxxTended-GGUF',
    name: 'Dark Planet 10.7B Extended',
    url: 'https://huggingface.co/DavidAU/L3.1-Dark-Planet-10.7B-ExxxxxxxxTended-GGUF',
    type: 'text-generation',
    provider: 'huggingface',
    description: 'Llama 3.1 based model designed for creative writing, fiction, roleplay, and adult content generation. 128k context window.',
    context_length: 131000,
    adult_safe: true,
    recommended_use: ['creative-writing', 'fiction', 'roleplay', 'storytelling', 'adult-companions'],
    parameters: {
      max_tokens: 5000,
      temperature: 0.8,
      top_p: 0.95,
      top_k: 50
    }
  },

  'dark-planet-8b': {
    id: 'DavidAU/L3-Dark-Planet-8B-GGUF',
    name: 'Dark Planet 8B',
    url: 'https://huggingface.co/DavidAU/L3-Dark-Planet-8B-GGUF',
    type: 'text-generation',
    provider: 'huggingface',
    description: 'Original Dark Planet 8B model for creative writing and fiction.',
    context_length: 8192,
    adult_safe: true,
    recommended_use: ['creative-writing', 'fiction', 'adult-content'],
    parameters: {
      max_tokens: 2000,
      temperature: 0.8,
      top_p: 0.9
    }
  },

  // Stheno - Creative & Roleplay Model
  'stheno-v3.2': {
    id: 'Sao10K/L3-8B-Stheno-v3.2',
    name: 'Stheno v3.2',
    url: 'https://huggingface.co/Sao10K/L3-8B-Stheno-v3.2',
    type: 'text-generation',
    provider: 'huggingface',
    description: 'High-quality roleplay and creative writing model based on Llama 3.',
    context_length: 8192,
    adult_safe: true,
    recommended_use: ['roleplay', 'creative-writing', 'character-interaction'],
    parameters: {
      max_tokens: 2000,
      temperature: 0.85,
      top_p: 0.95
    }
  },

  // Lumimaid - Adult-Friendly Creative Model
  'lumimaid-v0.1': {
    id: 'NeverSleep/Llama-3-Lumimaid-8B-v0.1-OAS',
    name: 'Lumimaid v0.1 OAS',
    url: 'https://huggingface.co/NeverSleep/Llama-3-Lumimaid-8B-v0.1-OAS',
    type: 'text-generation',
    provider: 'huggingface',
    description: 'Open Adult Stories variant optimized for adult content generation.',
    context_length: 8192,
    adult_safe: true,
    recommended_use: ['adult-stories', 'creative-writing', 'companions'],
    parameters: {
      max_tokens: 2000,
      temperature: 0.9,
      top_p: 0.95
    }
  },

  // Jamet - Multi-Purpose Creative Model
  'jamet-blackroot': {
    id: 'Hastagaras/Jamet-8B-L3-MK.V-Blackroot',
    name: 'Jamet Blackroot MK.V',
    url: 'https://huggingface.co/Hastagaras/Jamet-8B-L3-MK.V-Blackroot',
    type: 'text-generation',
    provider: 'huggingface',
    description: 'Versatile creative writing and roleplay model.',
    context_length: 8192,
    adult_safe: true,
    recommended_use: ['creative-writing', 'roleplay', 'fiction'],
    parameters: {
      max_tokens: 2000,
      temperature: 0.85,
      top_p: 0.92
    }
  },

  // Default Companion Model (Referenced in .env)
  'llama2-7b-adult-safe': {
    id: 'meta-llama/Llama-2-7b-chat-hf',
    name: 'Llama 2 7B Adult Safe',
    url: 'https://huggingface.co/meta-llama/Llama-2-7b-chat-hf',
    type: 'text-generation',
    provider: 'huggingface',
    description: 'Default AI companion model with safety rails for adult platforms.',
    context_length: 4096,
    adult_safe: true,
    recommended_use: ['chat', 'companions', 'customer-service'],
    parameters: {
      max_tokens: 1000,
      temperature: 0.7,
      top_p: 0.9
    }
  }
};

export const MODEL_CATEGORIES = {
  'creative-writing': ['dark-planet-10.7b', 'dark-planet-8b', 'stheno-v3.2', 'lumimaid-v0.1', 'jamet-blackroot'],
  'ai-companions': ['dark-planet-10.7b', 'llama2-7b-adult-safe', 'stheno-v3.2', 'lumimaid-v0.1'],
  'adult-content': ['dark-planet-10.7b', 'dark-planet-8b', 'lumimaid-v0.1'],
  'roleplay': ['stheno-v3.2', 'dark-planet-10.7b', 'jamet-blackroot'],
  'long-context': ['dark-planet-10.7b']
};

export const DEFAULT_MODEL = 'dark-planet-10.7b';

export const HUGGINGFACE_API_CONFIG = {
  baseUrl: process.env.AI_LLM_ENDPOINT || 'https://api-inference.huggingface.co',
  apiKey: process.env.HUGGINGFACE_API_KEY || '',
  timeout: 30000, // 30 seconds
  retries: 3,
  retryDelay: 1000
};

/**
 * Get model by ID
 */
export function getModel(modelId: string): HuggingFaceModel | undefined {
  return HUGGING_FACE_MODELS[modelId];
}

/**
 * Get models by category
 */
export function getModelsByCategory(category: keyof typeof MODEL_CATEGORIES): HuggingFaceModel[] {
  const modelIds = MODEL_CATEGORIES[category] || [];
  return modelIds.map(id => HUGGING_FACE_MODELS[id]).filter(Boolean);
}

/**
 * Get all adult-safe models
 */
export function getAdultSafeModels(): HuggingFaceModel[] {
  return Object.values(HUGGING_FACE_MODELS).filter(model => model.adult_safe);
}

/**
 * Get recommended model for use case
 */
export function getRecommendedModel(useCase: string): HuggingFaceModel {
  const recommendedId = Object.entries(HUGGING_FACE_MODELS).find(([_, model]) =>
    model.recommended_use.includes(useCase)
  )?.[0];

  return HUGGING_FACE_MODELS[recommendedId || DEFAULT_MODEL];
}
