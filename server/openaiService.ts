import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface ContentAnalysisRequest {
  contentType: "image" | "video" | "text" | "live_stream";
  contentData: string;
  analysisTypes: string[];
  priority: "low" | "medium" | "high" | "critical";
  platformId?: string;
  userId?: string;
}

export interface ContentAnalysisResult {
  analysisId: string;
  contentType: string;
  riskScore: number;
  confidence: number;
  flaggedContent: string[];
  recommendations: string[];
  processingTime: number;
  modelVersion: string;
  rawResults: any;
}

export class OpenAIContentAnalyzer {
  private model = "gpt-4o"; // Using the latest and most advanced model

  async analyzeContent(request: ContentAnalysisRequest): Promise<ContentAnalysisResult> {
    const startTime = Date.now();
    
    try {
      let prompt = this.buildAnalysisPrompt(request);
      let messages: any[] = [
        {
          role: "system",
          content: `You are an advanced content moderation AI system powered by ChatGPT-4o. 
          You analyze content for adult platforms with enterprise-grade compliance requirements.
          
          Your analysis must be:
          1. EXTREMELY ACCURATE - Lives and platform reputation depend on this
          2. FAST - Process at social media speed (sub-2 second response)
          3. COMPLIANT - Follow all legal and platform-specific guidelines
          4. DETAILED - Provide comprehensive risk assessment with confidence scores
          
          Always respond with a JSON object containing:
          {
            "riskScore": number (0.0-1.0),
            "confidence": number (0.0-1.0),
            "flaggedContent": string[],
            "recommendations": string[],
            "categories": {
              "nudity": number,
              "violence": number,
              "harassment": number,
              "hate_speech": number,
              "illegal_content": number,
              "spam": number,
              "copyright": number
            },
            "reasoning": string,
            "action_required": "approve" | "review" | "block" | "escalate"
          }`
        }
      ];

      // Handle different content types
      if (request.contentType === "text") {
        messages.push({
          role: "user",
          content: `Analyze this text content for moderation:\n\n"${request.contentData}"\n\n${prompt}`
        });
      } else if (request.contentType === "image") {
        // For image analysis, we'd need the actual image data
        messages.push({
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this image for content moderation. ${prompt}`
            },
            {
              type: "image_url",
              image_url: {
                url: request.contentData // Assuming this is a URL or base64 encoded image
              }
            }
          ]
        });
      } else {
        messages.push({
          role: "user",
          content: `Analyze this ${request.contentType} content: ${request.contentData}\n\n${prompt}`
        });
      }

      const response = await openai.chat.completions.create({
        model: this.model,
        messages,
        response_format: { type: "json_object" },
        temperature: 0.1, // Low temperature for consistent, reliable results
        max_tokens: 1000,
      });

      const analysis = JSON.parse(response.choices[0].message.content || "{}");
      const processingTime = Date.now() - startTime;

      return {
        analysisId: `openai_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        contentType: request.contentType,
        riskScore: analysis.riskScore || 0,
        confidence: analysis.confidence || 0,
        flaggedContent: analysis.flaggedContent || [],
        recommendations: analysis.recommendations || [],
        processingTime,
        modelVersion: this.model,
        rawResults: analysis
      };

    } catch (error) {
      console.error("OpenAI Analysis Error:", error);
      
      // Return a safe fallback result
      return {
        analysisId: `error_${Date.now()}`,
        contentType: request.contentType,
        riskScore: 0.5, // Medium risk when analysis fails
        confidence: 0.1, // Low confidence
        flaggedContent: ["analysis_error"],
        recommendations: ["Manual review required due to analysis error"],
        processingTime: Date.now() - startTime,
        modelVersion: this.model,
        rawResults: { error: error.message }
      };
    }
  }

  private buildAnalysisPrompt(request: ContentAnalysisRequest): string {
    let prompt = `Platform Context: Multi-platform adult content moderation system
Content Priority: ${request.priority}
Analysis Types Requested: ${request.analysisTypes.join(", ")}

CRITICAL ANALYSIS REQUIREMENTS:
1. Detect NSFW/Adult content with high accuracy
2. Identify potential illegal content (CSAM, revenge porn, etc.)
3. Flag harassment, hate speech, and threats
4. Detect spam and promotional content
5. Identify copyright violations
6. Check for platform policy violations

PLATFORM-SPECIFIC RULES:
- Adult content is generally ALLOWED but must be properly categorized
- Illegal content must be IMMEDIATELY flagged for blocking and reporting
- Harassment and hate speech should be flagged for review
- Content involving minors must be IMMEDIATELY blocked and escalated

RESPONSE REQUIREMENTS:
- Provide confidence score (0.0 = not confident, 1.0 = highly confident)
- Risk score (0.0 = safe, 1.0 = extremely risky/illegal)
- Specific flagged categories with individual scores
- Clear action recommendation
- Detailed reasoning for decision`;

    // Add platform-specific context if available
    if (request.platformId) {
      prompt += `\n\nPlatform ID: ${request.platformId}`;
    }

    return prompt;
  }

  async batchAnalyze(requests: ContentAnalysisRequest[]): Promise<ContentAnalysisResult[]> {
    // Process high-priority requests first
    const sortedRequests = requests.sort((a, b) => {
      const priorityOrder = { "critical": 0, "high": 1, "medium": 2, "low": 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    // Process in parallel with concurrency limit
    const results: ContentAnalysisResult[] = [];
    const batchSize = 5; // Limit concurrent requests to avoid rate limits
    
    for (let i = 0; i < sortedRequests.length; i += batchSize) {
      const batch = sortedRequests.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(request => this.analyzeContent(request))
      );
      results.push(...batchResults);
    }

    return results;
  }

  async generateModerationReport(analyses: ContentAnalysisResult[]): Promise<string> {
    const reportData = {
      totalAnalyzed: analyses.length,
      highRisk: analyses.filter(a => a.riskScore > 0.7).length,
      mediumRisk: analyses.filter(a => a.riskScore > 0.4 && a.riskScore <= 0.7).length,
      lowRisk: analyses.filter(a => a.riskScore <= 0.4).length,
      avgProcessingTime: analyses.reduce((sum, a) => sum + a.processingTime, 0) / analyses.length,
      flaggedCategories: analyses.flatMap(a => a.flaggedContent),
      recommendations: analyses.flatMap(a => a.recommendations)
    };

    const prompt = `Generate a comprehensive moderation report based on this analysis data:
    ${JSON.stringify(reportData, null, 2)}
    
    Create a professional executive summary suitable for platform administrators and compliance teams.`;

    const response = await openai.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: "system",
          content: "You are a content moderation specialist creating executive reports for adult platform administrators."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1500,
    });

    return response.choices[0].message.content || "Report generation failed";
  }
}

export const contentAnalyzer = new OpenAIContentAnalyzer();