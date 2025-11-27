# 🤖 Hugging Face AI Integration Guide

## Overview

The FANZ ecosystem now includes comprehensive Hugging Face integration, providing state-of-the-art AI capabilities for:

- **AI Companions**: Natural, engaging conversations with creators and fans
- **Content Generation**: Creative writing, captions, bios, and story ideas
- **Content Moderation**: Automated safety checks and policy compliance
- **Sentiment Analysis**: Understanding fan feedback and engagement
- **Personalization**: Tailored recommendations and experiences

## 🎯 Available Models

### Primary Models

#### 1. **Dark Planet 10.7B Extended** (Recommended)
- **Model ID**: `dark-planet-10.7b`
- **Hugging Face URL**: https://huggingface.co/DavidAU/L3.1-Dark-Planet-10.7B-ExxxxxxxxTended-GGUF
- **Context Length**: 131,000 tokens (128k)
- **Best For**: Creative writing, long-form content, roleplay, AI companions
- **Adult Safe**: ✅ Yes
- **Special Features**: Exceptional long-context handling, vivid prose, uncensored

#### 2. **Dark Planet 8B**
- **Model ID**: `dark-planet-8b`
- **Hugging Face URL**: https://huggingface.co/DavidAU/L3-Dark-Planet-8B-GGUF
- **Context Length**: 8,192 tokens
- **Best For**: Creative writing, fiction, adult content
- **Adult Safe**: ✅ Yes

#### 3. **Stheno v3.2**
- **Model ID**: `stheno-v3.2`
- **Hugging Face URL**: https://huggingface.co/Sao10K/L3-8B-Stheno-v3.2
- **Context Length**: 8,192 tokens
- **Best For**: Roleplay, character interactions, creative writing
- **Adult Safe**: ✅ Yes

#### 4. **Lumimaid v0.1 OAS**
- **Model ID**: `lumimaid-v0.1`
- **Hugging Face URL**: https://huggingface.co/NeverSleep/Llama-3-Lumimaid-8B-v0.1-OAS
- **Context Length**: 8,192 tokens
- **Best For**: Adult stories, creative writing, companions
- **Adult Safe**: ✅ Yes

#### 5. **Jamet Blackroot MK.V**
- **Model ID**: `jamet-blackroot`
- **Hugging Face URL**: https://huggingface.co/Hastagaras/Jamet-8B-L3-MK.V-Blackroot
- **Context Length**: 8,192 tokens
- **Best For**: Versatile creative writing and roleplay
- **Adult Safe**: ✅ Yes

#### 6. **Llama 2 7B Adult Safe** (Default Companion)
- **Model ID**: `llama2-7b-adult-safe`
- **Hugging Face URL**: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- **Context Length**: 4,096 tokens
- **Best For**: Chat, customer service, safe interactions
- **Adult Safe**: ✅ Yes

## 🔧 Setup & Configuration

### Step 1: Get Hugging Face API Key

1. Sign up at https://huggingface.co/join
2. Navigate to https://huggingface.co/settings/tokens
3. Create a new API token with "Read" permissions
4. Copy your API token

### Step 2: Configure Environment Variables

Add to your `.env` file:

```bash
# Hugging Face Integration
HUGGINGFACE_API_KEY="hf_your_api_key_here"
HUGGINGFACE_ENDPOINT="https://api-inference.huggingface.co"

# Model Selection
HUGGINGFACE_PRIMARY_MODEL="dark-planet-10.7b"
HUGGINGFACE_COMPANION_MODEL="llama2-7b-adult-safe"
HUGGINGFACE_MODERATION_MODEL="default"
HUGGINGFACE_ENABLE_CACHE=true
```

### Step 3: Restart Your Server

```bash
# Using Docker
docker-compose restart fanzdash

# Or directly
npm run dev
```

## 📡 API Endpoints

### Health Check

**GET** `/api/ai/health`

Check if Hugging Face service is operational.

**Response:**
```json
{
  "success": true,
  "status": "operational",
  "apiKeyConfigured": true,
  "modelsAvailable": 6,
  "message": "Hugging Face service is operational"
}
```

### List Available Models

**GET** `/api/ai/models`

Get all available Hugging Face models.

**Response:**
```json
{
  "success": true,
  "models": [
    {
      "id": "DavidAU/L3.1-Dark-Planet-10.7B-ExxxxxxxxTended-GGUF",
      "name": "Dark Planet 10.7B Extended",
      "type": "text-generation",
      "adult_safe": true,
      "recommended_use": ["creative-writing", "fiction", "roleplay"],
      "context_length": 131000
    }
  ]
}
```

### Get Models by Category

**GET** `/api/ai/models/category/:category`

Categories: `creative-writing`, `ai-companions`, `adult-content`, `roleplay`, `long-context`

**Example:**
```bash
curl https://your-domain.com/api/ai/models/category/ai-companions
```

### Text Generation

**POST** `/api/ai/generate`

Generate text using Hugging Face models.

**Request:**
```json
{
  "prompt": "Write a creative story about...",
  "modelId": "dark-planet-10.7b",
  "maxTokens": 1000,
  "temperature": 0.8,
  "systemPrompt": "You are a creative writing assistant..."
}
```

**Response:**
```json
{
  "success": true,
  "text": "Generated text content...",
  "model": "DavidAU/L3.1-Dark-Planet-10.7B-ExxxxxxxxTended-GGUF",
  "tokensUsed": 856,
  "finishReason": "stop",
  "processingTime": 3421
}
```

### AI Companion Chat

**POST** `/api/ai/companion/chat`

Have a conversation with an AI companion.

**Request:**
```json
{
  "userId": "user_123",
  "companionId": "default",
  "message": "Hey! How are you today?"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Hey there! I'm doing great, thanks for asking! How has your day been? 😊",
  "emotion": "happy",
  "confidence": 0.85,
  "suggestedActions": ["Send a message", "Ask a question"],
  "modelUsed": "dark-planet-10.7b"
}
```

### Content Ideas Generation

**POST** `/api/ai/companion/content-ideas`

Generate content ideas for creators.

**Request:**
```json
{
  "creatorId": "creator_123",
  "contentType": "post",
  "creatorNiche": "fitness and wellness",
  "count": 5
}
```

**Response:**
```json
{
  "success": true,
  "contentType": "post",
  "ideas": [
    "Share your morning workout routine with step-by-step instructions",
    "Post a transformation story with before/after photos",
    "Create a healthy meal prep guide for the week",
    "Share your favorite stretching exercises for flexibility",
    "Post about mindfulness and mental health in fitness"
  ]
}
```

### Fan Message Generation

**POST** `/api/ai/companion/fan-message`

Generate personalized messages to fans.

**Request:**
```json
{
  "creatorId": "creator_123",
  "fanName": "Alex",
  "messageType": "welcome",
  "personalDetails": "New subscriber from Instagram"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Hey Alex! Welcome to my exclusive content! I'm so excited you found me from Instagram. I have some amazing content planned for you. Let me know if there's anything specific you'd love to see! 💕"
}
```

Message types: `welcome`, `thank_you`, `milestone`, `re_engagement`

### Feedback Analysis

**POST** `/api/ai/companion/analyze-feedback`

Analyze fan feedback sentiment.

**Request:**
```json
{
  "feedback": "Your content has been amazing lately! Love the new direction you're taking."
}
```

**Response:**
```json
{
  "success": true,
  "sentiment": "positive",
  "topics": ["content quality", "experience"],
  "actionItems": [
    "Thank the user for positive feedback",
    "Continue current content strategy"
  ],
  "priority": "low"
}
```

### Conversation History

**GET** `/api/ai/companion/history/:userId/:companionId`

Get conversation history between user and companion.

**DELETE** `/api/ai/companion/history/:userId/:companionId`

Clear conversation history.

### Companion Personalities

**GET** `/api/ai/companion/personalities`

Get available companion personality types.

**Response:**
```json
{
  "success": true,
  "personalities": [
    {
      "id": "default",
      "name": "Alex",
      "tone": "friendly",
      "traits": ["friendly", "engaging", "supportive"]
    },
    {
      "id": "flirty",
      "name": "Raven",
      "tone": "flirty",
      "traits": ["playful", "confident", "charming"]
    },
    {
      "id": "professional",
      "name": "Morgan",
      "tone": "professional",
      "traits": ["professional", "knowledgeable", "helpful"]
    }
  ]
}
```

## 💻 Code Examples

### JavaScript/TypeScript

```typescript
// Initialize AI companion chat
async function chatWithCompanion(userId: string, message: string) {
  const response = await fetch('/api/ai/companion/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      companionId: 'default',
      message
    })
  });

  const data = await response.json();
  return data.message;
}

// Generate content ideas
async function getContentIdeas(creatorId: string) {
  const response = await fetch('/api/ai/companion/content-ideas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      creatorId,
      contentType: 'post',
      creatorNiche: 'lifestyle',
      count: 5
    })
  });

  const data = await response.json();
  return data.ideas;
}

// Analyze feedback
async function analyzeFeedback(feedback: string) {
  const response = await fetch('/api/ai/companion/analyze-feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ feedback })
  });

  return await response.json();
}
```

### React Hook Example

```typescript
import { useState } from 'react';

export function useAICompanion(userId: string, companionId: string = 'default') {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (message: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/companion/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, companionId, message })
      });

      const data = await response.json();

      setMessages(prev => [
        ...prev,
        { role: 'user', content: message },
        { role: 'companion', content: data.message, emotion: data.emotion }
      ]);

      return data;
    } finally {
      setLoading(false);
    }
  };

  return { messages, sendMessage, loading };
}
```

## 🎨 Use Cases

### 1. AI Companion for Creators

```typescript
// Create an engaging companion for your fans
const companion = await aiCompanionService.chat(
  'user_123',
  'flirty',
  'Tell me about yourself'
);
```

### 2. Content Suggestions

```typescript
// Get personalized content ideas
const ideas = await aiCompanionService.generateCreatorContentIdeas(
  'creator_123',
  'story',
  'fashion and lifestyle',
  5
);
```

### 3. Fan Engagement

```typescript
// Generate personalized welcome messages
const welcomeMessage = await aiCompanionService.generateFanMessage(
  'creator_123',
  'Emma',
  'welcome',
  'New VIP subscriber'
);
```

### 4. Sentiment Analysis

```typescript
// Understand fan feedback
const analysis = await aiCompanionService.analyzeFanFeedback(
  "Your content is amazing! Best creator on the platform!"
);

if (analysis.sentiment === 'positive') {
  // Send thank you message
}
```

## 🔒 Security & Safety

### Adult Content Handling

All models are specifically selected for adult content platforms:

- ✅ Uncensored for adult content
- ✅ No inappropriate filtering of platform-appropriate content
- ✅ Respects creator freedom
- ❌ Blocks illegal content (CSAM, non-consensual, etc.)

### Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **General endpoints**: 100 requests per 15 minutes
- **Chat endpoints**: 60 requests per 15 minutes
- **Generation endpoints**: 30 requests per 15 minutes

### Privacy

- Conversations are stored temporarily
- No training data sent to Hugging Face
- Clear conversation history on demand
- GDPR compliant

## 🚀 Performance

### Response Times

- **Chat**: 1-3 seconds
- **Content Generation**: 2-5 seconds
- **Long-form content**: 5-15 seconds
- **Sentiment Analysis**: <500ms

### Optimization Tips

1. **Use caching**: Enable `HUGGINGFACE_ENABLE_CACHE=true`
2. **Select appropriate models**: Use smaller models for simple tasks
3. **Limit context**: Keep conversation history to last 10 messages
4. **Batch requests**: Generate multiple content ideas in one call

## 🐛 Troubleshooting

### API Key Not Working

```bash
# Check if API key is set
echo $HUGGINGFACE_API_KEY

# Verify key format (starts with hf_)
curl -H "Authorization: Bearer $HUGGINGFACE_API_KEY" \
  https://huggingface.co/api/whoami
```

### Service Running in Demo Mode

If you see "Running in demo mode" messages:

1. Verify `HUGGINGFACE_API_KEY` is set in `.env`
2. Restart the server after adding the key
3. Check logs for any API key validation errors

### Slow Response Times

1. Check Hugging Face API status: https://status.huggingface.co
2. Consider using smaller models for faster responses
3. Enable caching to reuse previous results
4. Implement request queuing for high-traffic periods

### Model Loading Errors

Some models may take time to "wake up" on first request:

```json
{
  "options": {
    "wait_for_model": true
  }
}
```

This is already configured in the service.

## 📊 Monitoring

### Health Checks

```bash
# Check service health
curl https://your-domain.com/api/ai/health

# Test basic generation
curl -X POST https://your-domain.com/api/ai/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello", "maxTokens": 50}'
```

### Metrics to Monitor

- Response times
- Error rates
- Token usage
- Model selection distribution
- User satisfaction scores

## 🔄 Updates & Maintenance

### Adding New Models

1. Add model configuration to `server/ai/huggingFaceConfig.ts`
2. Test the model with sample prompts
3. Update documentation with model details
4. Add to appropriate category

### Model Selection Strategy

The system automatically selects the best model based on:

- Task type (chat, content generation, moderation)
- Context length requirements
- User preferences
- Model availability

## 📚 Additional Resources

- [Hugging Face Model Hub](https://huggingface.co/models)
- [Hugging Face API Documentation](https://huggingface.co/docs/api-inference)
- [Model Performance Guide](https://huggingface.co/DavidAU/Maximizing-Model-Performance-All-Quants-Types-And-Full-Precision-by-Samplers_Parameters)
- [FANZ Platform Documentation](./DEPLOYMENT.md)

## 🤝 Support

For issues or questions:

1. Check this documentation
2. Review server logs for errors
3. Verify API key and configuration
4. Test with Hugging Face API directly
5. Contact platform support

---

**Version**: 1.0.0
**Last Updated**: 2025-01-06
**Maintained by**: FANZ Development Team
