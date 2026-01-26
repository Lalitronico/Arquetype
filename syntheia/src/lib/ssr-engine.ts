/**
 * SSR Engine - Semantic Similarity Rating
 *
 * Implementation based on the methodology from arXiv 2510.08338
 * This engine generates synthetic survey responses using LLMs
 * and maps them to Likert scales using embedding similarity.
 */

import Anthropic from "@anthropic-ai/sdk";

// Types
export interface SyntheticPersona {
  id: string;
  demographics: {
    age: number;
    gender: "male" | "female" | "non-binary" | "other";
    location: string;
    income: string;
    education: string;
    occupation: string;
  };
  psychographics: {
    values: string[];
    lifestyle: string;
    interests: string[];
    personality: string;
  };
  context: {
    industry?: string;
    role?: string;
    productExperience?: string;
    brandAffinity?: string[];
  };
}

export interface SurveyQuestion {
  id: string;
  type: "likert" | "nps" | "multiple_choice" | "ranking" | "open_ended";
  text: string;
  options?: string[];
  scaleMin?: number;
  scaleMax?: number;
  scaleAnchors?: {
    low: string;
    high: string;
    labels?: string[];
  };
}

// Product/Service context for more relevant responses
export interface ProductContext {
  productName?: string;
  productDescription?: string;
  brandName?: string;
  industry?: string;
  productCategory?: string;
  customContextInstructions?: string;
}

export interface SSRResponse {
  questionId: string;
  rating: number;
  explanation: string;
  confidence: number;
  rawTextResponse: string;
  distribution?: number[];
}

export interface SimulationResult {
  personaId: string;
  responses: SSRResponse[];
  metadata: {
    modelUsed: string;
    timestamp: string;
    processingTimeMs: number;
  };
}

// Likert scale anchors for embedding comparison
const LIKERT_5_ANCHORS = [
  "I strongly disagree with this statement. I feel very negative about it.",
  "I somewhat disagree with this statement. I have reservations.",
  "I neither agree nor disagree. I feel neutral about this.",
  "I somewhat agree with this statement. I feel positively inclined.",
  "I strongly agree with this statement. I feel very positive about it.",
];

const LIKERT_7_ANCHORS = [
  "I strongly disagree. This is completely wrong.",
  "I disagree. I don't think this is accurate.",
  "I slightly disagree. I have some reservations.",
  "I neither agree nor disagree. I'm neutral.",
  "I slightly agree. I'm somewhat inclined to agree.",
  "I agree. I think this is mostly correct.",
  "I strongly agree. This is absolutely right.",
];

const NPS_ANCHORS = Array.from({ length: 11 }, (_, i) => {
  if (i <= 3) return `I would not recommend this at all. Rating: ${i}/10. Very unlikely to recommend.`;
  if (i <= 6) return `I might recommend this in some cases. Rating: ${i}/10. Somewhat neutral.`;
  if (i <= 8) return `I would likely recommend this. Rating: ${i}/10. Positive experience.`;
  return `I would definitely recommend this enthusiastically. Rating: ${i}/10. Excellent experience.`;
});

export class SSREngine {
  private anthropic: Anthropic;
  private requestCount: number = 0;
  private lastResetTime: number = Date.now();
  private readonly MAX_REQUESTS_PER_MINUTE = 40; // Stay under 50 limit

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  /**
   * Wait if we're approaching rate limit
   */
  private async checkRateLimit(): Promise<void> {
    const now = Date.now();
    const elapsed = now - this.lastResetTime;

    // Reset counter every minute
    if (elapsed >= 60000) {
      this.requestCount = 0;
      this.lastResetTime = now;
    }

    // If we're at the limit, wait until the next minute
    if (this.requestCount >= this.MAX_REQUESTS_PER_MINUTE) {
      const waitTime = 60000 - elapsed + 1000; // Wait until reset + 1 second buffer
      console.log(`Rate limit approaching, waiting ${waitTime}ms...`);
      await this.delay(waitTime);
      this.requestCount = 0;
      this.lastResetTime = Date.now();
    }

    this.requestCount++;
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Make API call with retry logic
   */
  private async callWithRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3
  ): Promise<T> {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        await this.checkRateLimit();
        return await fn();
      } catch (error: unknown) {
        const isRateLimit = error instanceof Error &&
          (error.message.includes('429') || error.message.includes('rate_limit'));

        if (isRateLimit && attempt < maxRetries) {
          const waitTime = Math.pow(2, attempt) * 5000; // 5s, 10s, 20s
          console.log(`Rate limited, retrying in ${waitTime}ms (attempt ${attempt + 1}/${maxRetries})...`);
          await this.delay(waitTime);
          this.requestCount = 0; // Reset counter after waiting
          continue;
        }
        throw error;
      }
    }
    throw new Error('Max retries exceeded');
  }

  /**
   * Build a detailed persona prompt for the LLM
   */
  private buildPersonaPrompt(persona: SyntheticPersona, productContext?: ProductContext): string {
    const { demographics, psychographics, context } = persona;

    let prompt = `You are a survey respondent with the following characteristics:

DEMOGRAPHICS:
- Age: ${demographics.age} years old
- Gender: ${demographics.gender}
- Location: ${demographics.location}
- Income level: ${demographics.income}
- Education: ${demographics.education}
- Occupation: ${demographics.occupation}

PSYCHOGRAPHICS:
- Core values: ${psychographics.values.join(", ")}
- Lifestyle: ${psychographics.lifestyle}
- Interests: ${psychographics.interests.join(", ")}
- Personality: ${psychographics.personality}

${context.industry ? `CONTEXT:\n- Industry: ${context.industry}` : ""}
${context.role ? `- Role: ${context.role}` : ""}
${context.productExperience ? `- Product Experience: ${context.productExperience}` : ""}
${context.brandAffinity?.length ? `- Brand preferences: ${context.brandAffinity.join(", ")}` : ""}`;

    // Add product/service context if available
    if (productContext && (productContext.productName || productContext.productDescription)) {
      prompt += `\n\nPRODUCT/SERVICE BEING EVALUATED:`;
      if (productContext.brandName) {
        prompt += `\n- Brand: ${productContext.brandName}`;
      }
      if (productContext.productName) {
        prompt += `\n- Product/Service: ${productContext.productName}`;
      }
      if (productContext.industry) {
        prompt += `\n- Industry: ${productContext.industry}`;
      }
      if (productContext.productCategory) {
        prompt += `\n- Category: ${productContext.productCategory}`;
      }
      if (productContext.productDescription) {
        prompt += `\n- Description: ${productContext.productDescription}`;
      }
    }

    prompt += `\n\nWhen responding to questions, stay in character and answer from this person's perspective.
Be authentic and provide thoughtful responses that reflect this person's background and viewpoint.`;

    // Add custom context instructions if provided
    if (productContext?.customContextInstructions) {
      prompt += `\n\nADDITIONAL INSTRUCTIONS:\n${productContext.customContextInstructions}`;
    }

    return prompt;
  }

  /**
   * Generate a text response from the LLM
   */
  private async generateTextResponse(
    persona: SyntheticPersona,
    question: SurveyQuestion,
    productContext?: ProductContext
  ): Promise<string> {
    const personaPrompt = this.buildPersonaPrompt(persona, productContext);

    const response = await this.callWithRetry(async () => {
      return this.anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 500,
        system: personaPrompt,
        messages: [
          {
            role: "user",
            content: `Please respond to this survey question in first person, explaining your thoughts and feelings honestly:

Question: ${question.text}

Provide a thoughtful response (2-4 sentences) that explains your perspective on this topic.`,
          },
        ],
      });
    });

    const textBlock = response.content.find((block) => block.type === "text");
    return textBlock?.type === "text" ? textBlock.text : "";
  }

  /**
   * Map text response to Likert rating using Claude
   * This replaces the embedding-based approach with direct LLM analysis
   */
  async mapToLikert(
    textResponse: string,
    question: SurveyQuestion
  ): Promise<{ rating: number; distribution: number[]; confidence: number }> {
    const scaleMax = question.type === "nps" ? 10 : (question.scaleMax || 5);
    const scaleMin = question.scaleMin || (question.type === "nps" ? 0 : 1);

    const prompt = `Analyze the following survey response and determine the appropriate rating.

Question: "${question.text}"

Response: "${textResponse}"

Scale: ${scaleMin} to ${scaleMax}
${question.type === "nps"
  ? "This is an NPS (Net Promoter Score) question. 0-6 = Detractor, 7-8 = Passive, 9-10 = Promoter."
  : `This is a Likert scale where ${scaleMin} = Strongly Disagree/Very Negative and ${scaleMax} = Strongly Agree/Very Positive.`}

Based on the sentiment and content of the response, provide:
1. A rating from ${scaleMin} to ${scaleMax}
2. Your confidence level (0.0 to 1.0)

Respond ONLY in this exact JSON format:
{"rating": <number>, "confidence": <number>}`;

    try {
      const response = await this.callWithRetry(async () => {
        return this.anthropic.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 100,
          messages: [{ role: "user", content: prompt }],
        });
      });

      const textBlock = response.content.find((block) => block.type === "text");
      const text = textBlock?.type === "text" ? textBlock.text : "";

      // Parse the JSON response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const rating = Math.min(Math.max(parsed.rating, scaleMin), scaleMax);
        const confidence = Math.min(Math.max(parsed.confidence || 0.7, 0), 1);

        // Generate a simple distribution centered on the rating
        const distribution = this.generateDistribution(rating, scaleMin, scaleMax, confidence);

        return { rating, distribution, confidence };
      }
    } catch (error) {
      console.error("Error mapping to Likert:", error);
    }

    // Fallback: return middle rating
    const midRating = Math.round((scaleMin + scaleMax) / 2);
    return {
      rating: midRating,
      distribution: this.generateDistribution(midRating, scaleMin, scaleMax, 0.5),
      confidence: 0.5
    };
  }

  /**
   * Generate a probability distribution centered on a rating
   */
  private generateDistribution(
    rating: number,
    scaleMin: number,
    scaleMax: number,
    confidence: number
  ): number[] {
    const size = scaleMax - scaleMin + 1;
    const distribution = new Array(size).fill(0);
    const index = rating - scaleMin;

    // Higher confidence = more concentrated distribution
    const spread = 1 - confidence;

    for (let i = 0; i < size; i++) {
      const distance = Math.abs(i - index);
      distribution[i] = Math.exp(-distance * (2 + confidence * 3));
    }

    // Normalize
    const sum = distribution.reduce((a, b) => a + b, 0);
    return distribution.map(d => d / sum);
  }

  /**
   * Generate a complete response for a single question
   */
  async generateResponse(
    persona: SyntheticPersona,
    question: SurveyQuestion,
    productContext?: ProductContext
  ): Promise<SSRResponse> {
    // For open-ended questions, just return the text
    if (question.type === "open_ended") {
      const textResponse = await this.generateTextResponse(persona, question, productContext);
      return {
        questionId: question.id,
        rating: 0,
        explanation: textResponse,
        confidence: 1,
        rawTextResponse: textResponse,
      };
    }

    // For multiple choice, use direct selection
    if (question.type === "multiple_choice" && question.options) {
      const response = await this.anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 300,
        system: this.buildPersonaPrompt(persona, productContext),
        messages: [
          {
            role: "user",
            content: `Question: ${question.text}

Options:
${question.options.map((o, i) => `${i + 1}. ${o}`).join("\n")}

Choose one option and briefly explain why (1-2 sentences). Format: "I choose [number]: [brief explanation]"`,
          },
        ],
      });

      const textBlock = response.content.find((block) => block.type === "text");
      const text = textBlock?.type === "text" ? textBlock.text : "";
      const match = text.match(/I choose (\d+)/i);
      const rating = match ? parseInt(match[1]) : 1;

      return {
        questionId: question.id,
        rating,
        explanation: text,
        confidence: 0.9,
        rawTextResponse: text,
      };
    }

    // For Likert/NPS scales, use SSR methodology
    const textResponse = await this.generateTextResponse(persona, question, productContext);
    const { rating, distribution, confidence } = await this.mapToLikert(
      textResponse,
      question
    );

    return {
      questionId: question.id,
      rating,
      explanation: textResponse,
      confidence,
      rawTextResponse: textResponse,
      distribution,
    };
  }

  /**
   * Run a complete simulation for a persona
   */
  async simulatePersona(
    persona: SyntheticPersona,
    questions: SurveyQuestion[],
    productContext?: ProductContext
  ): Promise<SimulationResult> {
    const startTime = Date.now();
    const responses: SSRResponse[] = [];

    for (const question of questions) {
      const response = await this.generateResponse(persona, question, productContext);
      responses.push(response);
    }

    return {
      personaId: persona.id,
      responses,
      metadata: {
        modelUsed: "claude-sonnet-4-20250514",
        timestamp: new Date().toISOString(),
        processingTimeMs: Date.now() - startTime,
      },
    };
  }

  /**
   * Run simulation for multiple personas sequentially to respect rate limits
   * @param shouldCancel - Optional async callback to check if simulation should be cancelled
   */
  async simulatePanel(
    personas: SyntheticPersona[],
    questions: SurveyQuestion[],
    productContext?: ProductContext,
    onProgress?: (current: number, total: number) => Promise<void>,
    shouldCancel?: () => Promise<boolean>
  ): Promise<{ results: SimulationResult[]; cancelled: boolean }> {
    const results: SimulationResult[] = [];

    // Process sequentially to respect rate limits
    for (let i = 0; i < personas.length; i++) {
      // Check for cancellation before processing each persona
      if (shouldCancel) {
        const cancelled = await shouldCancel();
        if (cancelled) {
          console.log(`Simulation cancelled at persona ${i + 1}/${personas.length}`);
          return { results, cancelled: true };
        }
      }

      console.log(`Processing persona ${i + 1}/${personas.length}...`);
      const result = await this.simulatePersona(personas[i], questions, productContext);
      results.push(result);

      // Report progress
      if (onProgress) {
        await onProgress(i + 1, personas.length);
      }

      // Add small delay between personas
      if (i < personas.length - 1) {
        await this.delay(500);
      }
    }

    return { results, cancelled: false };
  }
}

// Singleton instance
let ssrEngine: SSREngine | null = null;

export function getSSREngine(): SSREngine {
  if (!ssrEngine) {
    ssrEngine = new SSREngine();
  }
  return ssrEngine;
}
