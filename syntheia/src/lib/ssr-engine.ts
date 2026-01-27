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

// Condition for showing/hiding questions based on previous responses
export interface QuestionCondition {
  questionId: string;    // ID of the reference question
  operator: "equals" | "notEquals" | "greaterThan" | "lessThan" | "contains";
  value: string | number;
}

// Base survey question interface
export interface SurveyQuestion {
  id: string;
  type: "likert" | "nps" | "multiple_choice" | "ranking" | "open_ended" | "matrix" | "slider";
  text: string;
  options?: string[];
  scaleMin?: number;
  scaleMax?: number;
  scaleAnchors?: {
    low: string;
    high: string;
    labels?: string[];
  };
  // Conditional logic - if undefined, question is always shown
  showIf?: QuestionCondition;
  // Matrix question specific fields
  items?: string[];        // Items to rate: ["Price", "Quality", "Service"]
  scaleLabels?: string[];  // Labels for each scale point
  // Slider question specific fields
  min?: number;            // Minimum value (e.g., 0)
  max?: number;            // Maximum value (e.g., 100)
  step?: number;           // Step increment (e.g., 1)
  leftLabel?: string;      // Label for left/min end
  rightLabel?: string;     // Label for right/max end
}

// Matrix question response
export interface MatrixResponse {
  questionId: string;
  itemRatings: Record<string, number>;       // { "Price": 4, "Quality": 5 }
  itemExplanations: Record<string, string>;  // Explanations for each rating
  avgRating: number;
  confidence: number;
  rawTextResponse: string;
}

// Slider question response
export interface SliderResponse {
  questionId: string;
  rating: number;          // 0-100 (can be decimal)
  explanation: string;
  confidence: number;
  rawTextResponse: string;
  distribution?: number[]; // Histogram buckets
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
  // Matrix question specific fields
  itemRatings?: Record<string, number>;
  itemExplanations?: Record<string, string>;
  avgRating?: number;
  // Conditional logic - whether this question was skipped
  skipped?: boolean;
  skipReason?: string;
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

// Personality-based communication styles for natural response variation
const PERSONALITY_STYLES: Record<string, {
  tone: string;
  length: string;
  examplePhrases: string[];
}> = {
  "Analytical and detail-oriented": {
    tone: "logical, precise, and thorough",
    length: "2-3 sentences with specific details",
    examplePhrases: ["The main factor here is...", "Specifically, I noticed that...", "Comparing the options..."]
  },
  "Creative and imaginative": {
    tone: "expressive, colorful, and original",
    length: "2-3 sentences",
    examplePhrases: ["What really stands out is...", "It's refreshing to see...", "This feels like..."]
  },
  "Practical and grounded": {
    tone: "direct, no-nonsense, and utilitarian",
    length: "1-2 short sentences",
    examplePhrases: ["Works well.", "Gets the job done.", "Good value for money."]
  },
  "Outgoing and energetic": {
    tone: "enthusiastic, warm, and engaging",
    length: "2-3 sentences",
    examplePhrases: ["I love how...", "My friends and I always...", "This is exactly what..."]
  },
  "Reserved and thoughtful": {
    tone: "measured, reflective, and considered",
    length: "1-2 sentences",
    examplePhrases: ["In my experience...", "I tend to prefer...", "After some thought..."]
  },
  "Optimistic and enthusiastic": {
    tone: "positive, hopeful, and appreciative",
    length: "2-3 sentences",
    examplePhrases: ["I really appreciate...", "The great thing is...", "It's wonderful that..."]
  },
  "Cautious and risk-averse": {
    tone: "careful, questioning, and hedged",
    length: "2-3 sentences",
    examplePhrases: ["I'm not entirely sure...", "It seems okay, but...", "I'd want to know more about..."]
  },
  "Spontaneous and adventurous": {
    tone: "casual, bold, and open",
    length: "1-2 sentences",
    examplePhrases: ["Why not?", "I'd try it.", "Sounds fun to me."]
  },
  "Organized and methodical": {
    tone: "structured, systematic, and clear",
    length: "2-3 sentences",
    examplePhrases: ["First of all...", "The key points are...", "To summarize..."]
  },
  "Flexible and adaptable": {
    tone: "balanced, open-minded, and moderate",
    length: "2-3 sentences",
    examplePhrases: ["It depends on...", "I can see both sides...", "Generally speaking..."]
  },
  "Ambitious and driven": {
    tone: "confident, goal-focused, and decisive",
    length: "2-3 sentences",
    examplePhrases: ["What matters most is...", "The bottom line is...", "I look for..."]
  },
  "Relaxed and easy-going": {
    tone: "laid-back, casual, and unbothered",
    length: "1-2 short sentences",
    examplePhrases: ["It's fine.", "No complaints.", "Works for me."]
  }
};

const DEFAULT_STYLE = {
  tone: "natural and conversational",
  length: "1-3 sentences",
  examplePhrases: [] as string[]
};

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
   * Get communication style based on personality type
   */
  private getPersonalityStyle(personality: string): typeof DEFAULT_STYLE {
    return PERSONALITY_STYLES[personality] || DEFAULT_STYLE;
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

    // Get personality-specific style
    const style = this.getPersonalityStyle(psychographics.personality);

    prompt += `\n\nRESPONSE GUIDELINES:
Your communication style is ${style.tone}. Keep responses ${style.length}.

CRITICAL - DO NOT:
- Start with "As a [age]-year-old..." or "Being a [occupation]..."
- Mention your age, gender, income, or location in responses
- Use the phrase "As someone who..."
- Give generic responses like "I think it's good/bad"
- Repeat information from your profile - it's context, not content

DO:
- Answer directly as if someone asked you in casual conversation
- Use specific details from your actual experience/perspective
- Show your personality through word choice and tone, not self-description
- It's fine to be brief, uncertain, or have mixed feelings
${style.examplePhrases.length > 0 ? `- Example phrases that fit your style: "${style.examplePhrases.join('", "')}"` : ''}`;

    // Add custom context instructions if provided
    if (productContext?.customContextInstructions) {
      prompt += `\n\nADDITIONAL CONTEXT:\n${productContext.customContextInstructions}`;
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
    const style = this.getPersonalityStyle(persona.psychographics.personality);

    const response = await this.callWithRetry(async () => {
      return this.anthropic.messages.create({
        model: "claude-3-haiku-20240307",
        max_tokens: 500,
        system: personaPrompt,
        messages: [
          {
            role: "user",
            content: `Survey question: "${question.text}"

Respond in ${style.length}. Be ${style.tone}. Answer as you would in real life - no need to explain who you are.`,
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
          model: "claude-3-haiku-20240307",
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
      const options = question.options; // TypeScript narrowing
      const response = await this.callWithRetry(async () => {
        return this.anthropic.messages.create({
          model: "claude-3-haiku-20240307",
          max_tokens: 200,
          system: this.buildPersonaPrompt(persona, productContext),
          messages: [
            {
              role: "user",
              content: `"${question.text}"

Options:
${options.map((o, i) => `${i + 1}. ${o}`).join("\n")}

Pick the option that fits you best and briefly explain why. Start your response with the option number.`,
            },
          ],
        });
      });

      const textBlock = response.content.find((block) => block.type === "text");
      const text = textBlock?.type === "text" ? textBlock.text : "";

      // Extract the option number from the beginning of the response
      const match = text.match(/^(\d+)|option\s*(\d+)|choose\s*(\d+)|pick\s*(\d+)/i);
      const rating = match ? parseInt(match[1] || match[2] || match[3] || match[4]) : 1;

      return {
        questionId: question.id,
        rating,
        explanation: text,
        confidence: 0.9,
        rawTextResponse: text,
      };
    }

    // For matrix questions - rate multiple items on the same scale
    if (question.type === "matrix" && question.items && question.items.length > 0) {
      return this.generateMatrixResponse(persona, question, productContext);
    }

    // For slider questions - continuous scale (0-100)
    if (question.type === "slider") {
      return this.generateSliderResponse(persona, question, productContext);
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
   * Generate matrix question response - rate multiple items in a single LLM call
   */
  private async generateMatrixResponse(
    persona: SyntheticPersona,
    question: SurveyQuestion,
    productContext?: ProductContext
  ): Promise<SSRResponse> {
    const items = question.items || [];
    const scaleMin = question.scaleMin || 1;
    const scaleMax = question.scaleMax || 5;
    const scaleLabels = question.scaleLabels || [];

    const personaPrompt = this.buildPersonaPrompt(persona, productContext);

    // Build scale description
    let scaleDescription = `Scale: ${scaleMin} to ${scaleMax}`;
    if (scaleLabels.length > 0) {
      scaleDescription += ` (${scaleLabels.join(", ")})`;
    }

    const prompt = `Rate each of the following items based on the question.

Question: "${question.text}"

Items to rate:
${items.map((item, i) => `${i + 1}. ${item}`).join("\n")}

${scaleDescription}

For each item, provide a rating and a brief reason (1 sentence).

Respond ONLY as JSON in this exact format:
{
  "ratings": [
    {"item": "item name", "rating": <number ${scaleMin}-${scaleMax}>, "reason": "brief explanation"}
  ]
}`;

    try {
      const response = await this.callWithRetry(async () => {
        return this.anthropic.messages.create({
          model: "claude-3-haiku-20240307",
          max_tokens: 800,
          system: personaPrompt,
          messages: [{ role: "user", content: prompt }],
        });
      });

      const textBlock = response.content.find((block) => block.type === "text");
      const text = textBlock?.type === "text" ? textBlock.text : "";

      // Parse JSON response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const itemRatings: Record<string, number> = {};
        const itemExplanations: Record<string, string> = {};

        if (parsed.ratings && Array.isArray(parsed.ratings)) {
          for (const r of parsed.ratings) {
            const rating = Math.min(Math.max(Number(r.rating) || scaleMin, scaleMin), scaleMax);
            itemRatings[r.item] = rating;
            itemExplanations[r.item] = r.reason || "";
          }
        }

        // Calculate average rating
        const ratings = Object.values(itemRatings);
        const avgRating = ratings.length > 0
          ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 100) / 100
          : (scaleMin + scaleMax) / 2;

        return {
          questionId: question.id,
          rating: avgRating,
          explanation: Object.entries(itemExplanations).map(([k, v]) => `${k}: ${v}`).join("; "),
          confidence: 0.85,
          rawTextResponse: text,
          itemRatings,
          itemExplanations,
          avgRating,
        };
      }
    } catch (error) {
      console.error("Error generating matrix response:", error);
    }

    // Fallback: return middle ratings for all items
    const midRating = Math.round((scaleMin + scaleMax) / 2);
    const itemRatings: Record<string, number> = {};
    const itemExplanations: Record<string, string> = {};
    items.forEach(item => {
      itemRatings[item] = midRating;
      itemExplanations[item] = "Unable to generate response";
    });

    return {
      questionId: question.id,
      rating: midRating,
      explanation: "Fallback response",
      confidence: 0.5,
      rawTextResponse: "",
      itemRatings,
      itemExplanations,
      avgRating: midRating,
    };
  }

  /**
   * Generate slider question response - continuous scale
   */
  private async generateSliderResponse(
    persona: SyntheticPersona,
    question: SurveyQuestion,
    productContext?: ProductContext
  ): Promise<SSRResponse> {
    const min = question.min ?? 0;
    const max = question.max ?? 100;
    const leftLabel = question.leftLabel || "Minimum";
    const rightLabel = question.rightLabel || "Maximum";

    // First generate a natural text response
    const textResponse = await this.generateTextResponse(persona, question, productContext);

    // Then analyze and map to continuous scale
    const prompt = `Analyze this response and provide a precise numeric score.

Question: "${question.text}"
Scale: ${min} (${leftLabel}) to ${max} (${rightLabel})
Response: "${textResponse}"

Based on the sentiment and content of the response, provide a precise numeric score.
The score can be any number between ${min} and ${max}, including decimals for precision.

Respond ONLY as JSON:
{"rating": <number>, "confidence": <0.0-1.0>}`;

    try {
      const response = await this.callWithRetry(async () => {
        return this.anthropic.messages.create({
          model: "claude-3-haiku-20240307",
          max_tokens: 100,
          messages: [{ role: "user", content: prompt }],
        });
      });

      const textBlock = response.content.find((block) => block.type === "text");
      const text = textBlock?.type === "text" ? textBlock.text : "";

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const rating = Math.min(Math.max(Number(parsed.rating) || (min + max) / 2, min), max);
        const confidence = Math.min(Math.max(parsed.confidence || 0.7, 0), 1);

        // Generate histogram distribution for visualization
        const distribution = this.generateHistogramDistribution(rating, min, max);

        return {
          questionId: question.id,
          rating: Math.round(rating * 10) / 10, // Round to 1 decimal place
          explanation: textResponse,
          confidence,
          rawTextResponse: textResponse,
          distribution,
        };
      }
    } catch (error) {
      console.error("Error generating slider response:", error);
    }

    // Fallback
    const midRating = (min + max) / 2;
    return {
      questionId: question.id,
      rating: midRating,
      explanation: textResponse,
      confidence: 0.5,
      rawTextResponse: textResponse,
      distribution: this.generateHistogramDistribution(midRating, min, max),
    };
  }

  /**
   * Generate histogram distribution for slider visualization
   * Returns 10 buckets representing the distribution
   */
  private generateHistogramDistribution(
    rating: number,
    min: number,
    max: number
  ): number[] {
    const buckets = 10;
    const distribution = new Array(buckets).fill(0);
    const range = max - min;
    const bucketSize = range / buckets;

    // Find which bucket the rating falls into
    const ratingBucket = Math.min(
      Math.floor((rating - min) / bucketSize),
      buckets - 1
    );

    // Create a bell curve centered on the rating bucket
    for (let i = 0; i < buckets; i++) {
      const distance = Math.abs(i - ratingBucket);
      distribution[i] = Math.exp(-distance * 0.5);
    }

    // Normalize
    const sum = distribution.reduce((a, b) => a + b, 0);
    return distribution.map(d => Math.round((d / sum) * 100));
  }

  /**
   * Run a complete simulation for a persona
   * Handles conditional logic (showIf) for questions
   */
  async simulatePersona(
    persona: SyntheticPersona,
    questions: SurveyQuestion[],
    productContext?: ProductContext
  ): Promise<SimulationResult> {
    const startTime = Date.now();
    const responses: SSRResponse[] = [];
    const answeredQuestions = new Map<string, SSRResponse>();

    for (const question of questions) {
      // Evaluate conditional logic
      if (question.showIf) {
        const refResponse = answeredQuestions.get(question.showIf.questionId);
        if (!refResponse || !this.evaluateCondition(refResponse, question.showIf)) {
          // Skip this question - condition not met
          responses.push({
            questionId: question.id,
            rating: 0,
            explanation: "",
            confidence: 0,
            rawTextResponse: "",
            skipped: true,
            skipReason: `Condition not met: Question ${question.showIf.questionId} ${question.showIf.operator} ${question.showIf.value}`,
          });
          continue;
        }
      }

      const response = await this.generateResponse(persona, question, productContext);
      responses.push(response);
      answeredQuestions.set(question.id, response);
    }

    return {
      personaId: persona.id,
      responses,
      metadata: {
        modelUsed: "claude-3-haiku-20240307",
        timestamp: new Date().toISOString(),
        processingTimeMs: Date.now() - startTime,
      },
    };
  }

  /**
   * Evaluate a condition against a previous response
   */
  private evaluateCondition(response: SSRResponse, condition: QuestionCondition): boolean {
    const { operator, value } = condition;

    switch (operator) {
      case "equals":
        // Check numeric equality first
        if (typeof value === "number") {
          return response.rating === value;
        }
        // Check string equality (case-insensitive)
        return (
          response.rating === Number(value) ||
          response.explanation?.toLowerCase().includes(String(value).toLowerCase()) ||
          response.rawTextResponse?.toLowerCase().includes(String(value).toLowerCase())
        );

      case "notEquals":
        if (typeof value === "number") {
          return response.rating !== value;
        }
        return (
          response.rating !== Number(value) &&
          !response.explanation?.toLowerCase().includes(String(value).toLowerCase()) &&
          !response.rawTextResponse?.toLowerCase().includes(String(value).toLowerCase())
        );

      case "greaterThan":
        return (response.rating || 0) > Number(value);

      case "lessThan":
        return (response.rating || 0) < Number(value);

      case "contains":
        const searchValue = String(value).toLowerCase();
        return (
          response.explanation?.toLowerCase().includes(searchValue) ||
          response.rawTextResponse?.toLowerCase().includes(searchValue) ||
          false
        );

      default:
        return true;
    }
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
