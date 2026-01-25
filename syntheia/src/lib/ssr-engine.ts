/**
 * SSR Engine - Semantic Similarity Rating
 *
 * Implementation based on the methodology from arXiv 2510.08338
 * This engine generates synthetic survey responses using LLMs
 * and maps them to Likert scales using embedding similarity.
 */

import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

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
  private openai: OpenAI;

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Build a detailed persona prompt for the LLM
   */
  private buildPersonaPrompt(persona: SyntheticPersona): string {
    const { demographics, psychographics, context } = persona;

    return `You are a survey respondent with the following characteristics:

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
${context.brandAffinity?.length ? `- Brand preferences: ${context.brandAffinity.join(", ")}` : ""}

When responding to questions, stay in character and answer from this person's perspective.
Be authentic and provide thoughtful responses that reflect this person's background and viewpoint.`;
  }

  /**
   * Generate a text response from the LLM
   */
  private async generateTextResponse(
    persona: SyntheticPersona,
    question: SurveyQuestion
  ): Promise<string> {
    const personaPrompt = this.buildPersonaPrompt(persona);

    const response = await this.anthropic.messages.create({
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

    const textBlock = response.content.find((block) => block.type === "text");
    return textBlock?.type === "text" ? textBlock.text : "";
  }

  /**
   * Get embeddings for text using OpenAI
   */
  private async getEmbedding(text: string): Promise<number[]> {
    const response = await this.openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });
    return response.data[0].embedding;
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Softmax function to convert similarities to probabilities
   */
  private softmax(values: number[], temperature: number = 1.0): number[] {
    const scaled = values.map((v) => v / temperature);
    const maxVal = Math.max(...scaled);
    const exps = scaled.map((v) => Math.exp(v - maxVal));
    const sum = exps.reduce((a, b) => a + b, 0);
    return exps.map((e) => e / sum);
  }

  /**
   * Sample from a probability distribution
   */
  private weightedChoice(distribution: number[]): number {
    const random = Math.random();
    let cumulative = 0;

    for (let i = 0; i < distribution.length; i++) {
      cumulative += distribution[i];
      if (random <= cumulative) {
        return i + 1; // 1-indexed for Likert scales
      }
    }

    return distribution.length;
  }

  /**
   * Get appropriate anchors for the question type
   */
  private getAnchors(question: SurveyQuestion): string[] {
    if (question.type === "nps") {
      return NPS_ANCHORS;
    }

    const scaleSize = (question.scaleMax || 5) - (question.scaleMin || 1) + 1;

    if (scaleSize === 7) {
      return LIKERT_7_ANCHORS;
    }

    return LIKERT_5_ANCHORS;
  }

  /**
   * Map text response to Likert rating using SSR methodology
   */
  async mapToLikert(
    textResponse: string,
    question: SurveyQuestion
  ): Promise<{ rating: number; distribution: number[]; confidence: number }> {
    const anchors = this.getAnchors(question);

    // Get embeddings for response and all anchors
    const [responseEmbedding, ...anchorEmbeddings] = await Promise.all([
      this.getEmbedding(textResponse),
      ...anchors.map((a) => this.getEmbedding(a)),
    ]);

    // Calculate similarities
    const similarities = anchorEmbeddings.map((ae) =>
      this.cosineSimilarity(responseEmbedding, ae)
    );

    // Convert to probability distribution
    const distribution = this.softmax(similarities, 0.5);

    // Get final rating
    const rating = this.weightedChoice(distribution);
    const confidence = Math.max(...distribution);

    return { rating, distribution, confidence };
  }

  /**
   * Generate a complete response for a single question
   */
  async generateResponse(
    persona: SyntheticPersona,
    question: SurveyQuestion
  ): Promise<SSRResponse> {
    // For open-ended questions, just return the text
    if (question.type === "open_ended") {
      const textResponse = await this.generateTextResponse(persona, question);
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
        system: this.buildPersonaPrompt(persona),
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
    const textResponse = await this.generateTextResponse(persona, question);
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
    questions: SurveyQuestion[]
  ): Promise<SimulationResult> {
    const startTime = Date.now();
    const responses: SSRResponse[] = [];

    for (const question of questions) {
      const response = await this.generateResponse(persona, question);
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
   * Run simulation for multiple personas in parallel
   */
  async simulatePanel(
    personas: SyntheticPersona[],
    questions: SurveyQuestion[],
    concurrency: number = 5
  ): Promise<SimulationResult[]> {
    const results: SimulationResult[] = [];

    // Process in batches to respect rate limits
    for (let i = 0; i < personas.length; i += concurrency) {
      const batch = personas.slice(i, i + concurrency);
      const batchResults = await Promise.all(
        batch.map((persona) => this.simulatePersona(persona, questions))
      );
      results.push(...batchResults);
    }

    return results;
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
