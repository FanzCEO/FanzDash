// Development OpenAI service with fallback
export * from "./openaiService-dev";

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

export class OpenAIContentModerationService {
  async analyzeImage(
    imageUrl: string,
    contentContext?: string,
  ): Promise<ImageAnalysisResult> {
    const startTime = Date.now();

    try {
      const response = await openai.chat.completions.create({
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
    const startTime = Date.now();

    try {
      const response = await openai.chat.completions.create({
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
    const startTime = Date.now();

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are monitoring live streams for adult platforms. Analyze video frames for real-time policy violations and safety risks.

Focus on:
- Illegal activities in progress
- Violent or dangerous situations  
- Non-consensual content
- Age verification concerns
- Platform policy violations
- Emergency situations requiring immediate intervention

Provide fast, accurate risk assessment for real-time moderation.

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
                text: `Analyze this live stream frame. Context: ${streamContext || "Live adult content stream"}`,
              },
              {
                type: "image_url",
                image_url: { url: frameImageUrl },
              },
            ],
          },
        ],
        response_format: { type: "json_object" },
        max_completion_tokens: 600,
      });

      const analysis = JSON.parse(response.choices[0].message.content || "{}");
      const processingTime = Date.now() - startTime;

      return {
        ...analysis,
        processingTime,
      };
    } catch (error) {
      console.error("Error analyzing live stream frame:", error);
      return {
        riskScore: 0.3,
        confidence: 0.1,
        recommendation: "review",
        reasoning: "Frame analysis failed - continue monitoring",
        categories: ["error"],
        severity: "medium",
        detectedObjects: [],
        explicitContent: false,
        violatesPolicy: false,
        processingTime: Date.now() - startTime,
      };
    }
  }

  async generateModerationReport(
    analysisResults: ContentAnalysisResult[],
  ): Promise<string> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content:
              "You are generating executive moderation reports. Create a concise, professional summary of content analysis results for platform administrators.",
          },
          {
            role: "user",
            content: `Generate a moderation report based on these analysis results: ${JSON.stringify(analysisResults)}`,
          },
        ],
        max_completion_tokens: 500,
      });

      return response.choices[0].message.content || "Report generation failed";
    } catch (error) {
      console.error("Error generating moderation report:", error);
      return "Unable to generate report - please review analysis results manually.";
    }
  }

  async assessThreatLevel(recentAnalyses: ContentAnalysisResult[]): Promise<{
    level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    score: number;
    trends: {
      increasing: boolean;
      reason: string;
    };
    recommendations: string[];
  }> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: `You are a security analyst for adult platform moderation. Assess overall threat level based on recent content analysis patterns.

Respond in JSON format:
{
  "level": "LOW|MEDIUM|HIGH|CRITICAL",
  "score": 0-100,
  "trends": {
    "increasing": boolean,
    "reason": "explanation"
  },
  "recommendations": ["rec1", "rec2"]
}`,
          },
          {
            role: "user",
            content: `Assess threat level from recent analyses: ${JSON.stringify(recentAnalyses.slice(0, 50))}`,
          },
        ],
        response_format: { type: "json_object" },
        max_completion_tokens: 400,
      });

      return JSON.parse(response.choices[0].message.content || "{}");
    } catch (error) {
      console.error("Error assessing threat level:", error);
      return {
        level: "MEDIUM",
        score: 50,
        trends: {
          increasing: false,
          reason: "Analysis unavailable",
        },
        recommendations: ["Continue monitoring", "Review analysis settings"],
      };
    }
  }
}

export const aiModerationService = new OpenAIContentModerationService();
