import OpenAI from "openai";

// Mock OpenAI service for development
const isDevMode = !process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes("placeholder") || process.env.OPENAI_API_KEY.includes("development");

let openai: OpenAI | null = null;

if (!isDevMode) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export interface ContentAnalysisResult {
  riskScore: number;
  confidence: number;
  recommendation: "approve" | "review" | "block";
  reasoning: string;
  categories: string[];
  severity: "low" | "medium" | "high" | "critical";
  processingTime: number;
}

export interface ImageAnalysisResult extends ContentAnalysisResult {
  detectedObjects: Array<{
    label: string;
    confidence: number;
    location?: { x: number; y: number; width: number; height: number };
  }>;
  explicitContent: boolean;
  violatesPolicy: boolean;
}

export interface TextAnalysisResult extends ContentAnalysisResult {
  toxicityScore: number;
  hateSpeech: boolean;
  harassment: boolean;
  threats: boolean;
  sexualContent: boolean;
}

// Mock responses for development
const mockImageAnalysis = (): ImageAnalysisResult => ({
  riskScore: Math.random() * 0.3, // Low risk for dev
  confidence: 0.85 + Math.random() * 0.1,
  recommendation: "approve",
  reasoning: "Development mock: Image appears to be safe content",
  categories: ["safe", "adult_content"],
  severity: "low",
  detectedObjects: [
    { label: "person", confidence: 0.9 },
    { label: "clothing", confidence: 0.7 }
  ],
  explicitContent: false,
  violatesPolicy: false,
  processingTime: 150 + Math.random() * 200
});

const mockTextAnalysis = (): TextAnalysisResult => ({
  riskScore: Math.random() * 0.25,
  confidence: 0.82 + Math.random() * 0.15,
  recommendation: "approve",
  reasoning: "Development mock: Text content appears appropriate",
  categories: ["communication", "adult_platform"],
  severity: "low",
  toxicityScore: Math.random() * 0.1,
  hateSpeech: false,
  harassment: false,
  threats: false,
  sexualContent: false,
  processingTime: 100 + Math.random() * 150
});

export class OpenAIContentModerationService {
  async analyzeImage(
    imageUrl: string,
    contentContext?: string,
  ): Promise<ImageAnalysisResult> {
    if (isDevMode) {
      console.log("🔧 Development mode: Using mock image analysis for", imageUrl);
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
      return mockImageAnalysis();
    }

    const startTime = Date.now();

    try {
      const response = await openai!.chat.completions.create({
        model: "gpt-4o", // Using GPT-4o for vision capabilities
        messages: [
          {
            role: "system",
            content: `You are an expert content moderator for adult platforms. Analyze images for policy violations, explicit content, and safety risks. 

Evaluate:
- Explicit sexual content and nudity
- Violence, gore, or disturbing imagery  
- Illegal content (CSAM, non-consensual, etc.)
- Harmful or dangerous activities
- Terms of service violations

Provide risk assessment from 0.0 (safe) to 1.0 (critical violation).

Respond in JSON format:
{
  "riskScore": 0.0-1.0,
  "confidence": 0.0-1.0,
  "recommendation": "approve|review|block",
  "reasoning": "Brief explanation",
  "categories": ["category1", "category2"],
  "severity": "low|medium|high|critical",
  "detectedObjects": [{"label": "object", "confidence": 0.0-1.0}],
  "explicitContent": boolean,
  "violatesPolicy": boolean
}`,
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this image for content moderation. Context: ${contentContext || "Adult platform content"}`,
              },
              {
                type: "image_url",
                image_url: { url: imageUrl },
              },
            ],
          },
        ],
        response_format: { type: "json_object" },
        max_completion_tokens: 1000,
      });

      const analysis = JSON.parse(response.choices[0].message.content || "{}");
      const processingTime = Date.now() - startTime;

      return {
        ...analysis,
        processingTime,
      };
    } catch (error) {
      console.error("Error analyzing image with OpenAI:", error);
      return {
        riskScore: 0.5,
        confidence: 0.1,
        recommendation: "review",
        reasoning: "Analysis failed - manual review required",
        categories: ["error"],
        severity: "medium",
        detectedObjects: [],
        explicitContent: false,
        violatesPolicy: false,
        processingTime: Date.now() - startTime,
      };
    }
  }

  async analyzeText(
    text: string,
    contentContext?: string,
  ): Promise<TextAnalysisResult> {
    if (isDevMode) {
      console.log("🔧 Development mode: Using mock text analysis for:", text.substring(0, 50) + "...");
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 80 + Math.random() * 150));
      return mockTextAnalysis();
    }

    const startTime = Date.now();

    try {
      const response = await openai!.chat.completions.create({
        model: "gpt-5", // Using latest GPT-5 for text analysis
        messages: [
          {
            role: "system",
            content: `You are an expert content moderator for adult platforms. Analyze text content for policy violations, toxicity, and safety risks.

Evaluate:
- Hate speech and harassment
- Threats and violence
- Sexual content involving minors
- Non-consensual activities
- Spam or scam content
- Toxicity and harmful language

Provide risk assessment from 0.0 (safe) to 1.0 (critical violation).

Respond in JSON format:
{
  "riskScore": 0.0-1.0,
  "confidence": 0.0-1.0,
  "recommendation": "approve|review|block",
  "reasoning": "Brief explanation",
  "categories": ["category1", "category2"],
  "severity": "low|medium|high|critical",
  "toxicityScore": 0.0-1.0,
  "hateSpeech": boolean,
  "harassment": boolean,
  "threats": boolean,
  "sexualContent": boolean
}`,
          },
          {
            role: "user",
            content: `Analyze this text for content moderation. Context: ${contentContext || "Adult platform content"}

Text to analyze:
"${text}"`,
          },
        ],
        response_format: { type: "json_object" },
        max_completion_tokens: 800,
      });

      const analysis = JSON.parse(response.choices[0].message.content || "{}");
      const processingTime = Date.now() - startTime;

      return {
        ...analysis,
        processingTime,
      };
    } catch (error) {
      console.error("Error analyzing text with OpenAI:", error);
      return {
        riskScore: 0.5,
        confidence: 0.1,
        recommendation: "review",
        reasoning: "Analysis failed - manual review required",
        categories: ["error"],
        severity: "medium",
        toxicityScore: 0.5,
        hateSpeech: false,
        harassment: false,
        threats: false,
        sexualContent: false,
        processingTime: Date.now() - startTime,
      };
    }
  }

  async analyzeLiveStreamFrame(
    frameImageUrl: string,
    streamContext?: string,
  ): Promise<ImageAnalysisResult> {
    return this.analyzeImage(frameImageUrl, `Live stream frame: ${streamContext}`);
  }
}

export const aiModerationService = new OpenAIContentModerationService();
