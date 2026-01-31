import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSSREngine, SurveyQuestion, SyntheticPersona } from "@/lib/ssr-engine";
import { generatePanel, PERSONA_PRESETS, PresetName } from "@/lib/persona-generator";

// Request validation schema
const SimulateRequestSchema = z.object({
  studyId: z.string().optional(),
  questions: z.array(
    z.object({
      id: z.string(),
      type: z.enum(["likert", "nps", "multiple_choice", "ranking", "open_ended"]),
      text: z.string().min(1),
      options: z.array(z.string()).optional(),
      scaleMin: z.number().optional(),
      scaleMax: z.number().optional(),
      scaleAnchors: z
        .object({
          low: z.string(),
          high: z.string(),
          labels: z.array(z.string()).optional(),
        })
        .optional(),
    })
  ),
  panelConfig: z.object({
    preset: z.string().optional(),
    count: z.number().min(1).max(1000).default(100),
    demographics: z
      .object({
        ageRange: z.object({ min: z.number(), max: z.number() }).optional(),
        genderDistribution: z
          .object({
            male: z.number(),
            female: z.number(),
            nonBinary: z.number(),
          })
          .optional(),
        locations: z.array(z.string()).optional(),
        incomeDistribution: z
          .object({
            low: z.number(),
            medium: z.number(),
            high: z.number(),
          })
          .optional(),
      })
      .optional(),
    context: z
      .object({
        industry: z.string().optional(),
        productExperience: z.array(z.string()).optional(),
        brandAffinities: z.array(z.string()).optional(),
      })
      .optional(),
  }),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = SimulateRequestSchema.parse(body);

    // Generate panel based on config
    const presetConfig = validatedData.panelConfig.preset
      ? PERSONA_PRESETS[validatedData.panelConfig.preset as PresetName]
      : undefined;

    const panel = generatePanel({
      count: validatedData.panelConfig.count,
      ...presetConfig,
      demographics: {
        ...presetConfig?.demographics,
        ...validatedData.panelConfig.demographics,
      },
      context: validatedData.panelConfig.context,
    });

    // Map questions to the expected format
    const questions: SurveyQuestion[] = validatedData.questions.map((q) => ({
      ...q,
      scaleMin: q.scaleMin ?? 1,
      scaleMax: q.scaleMax ?? (q.type === "nps" ? 10 : 5),
    }));

    // Run simulation
    const ssrEngine = getSSREngine();
    const { results } = await ssrEngine.simulatePanel(panel, questions);

    // Aggregate results
    const aggregatedResults = aggregateResults(results, questions);

    return NextResponse.json({
      success: true,
      data: {
        studyId: validatedData.studyId,
        totalRespondents: panel.length,
        questions: aggregatedResults,
        rawResults: results,
        metadata: {
          completedAt: new Date().toISOString(),
          panelPreset: validatedData.panelConfig.preset || "custom",
          modelUsed: "claude-3-haiku-20240307",
        },
      },
    });
  } catch (error) {
    console.error("Simulation error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation error",
          details: error.issues,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Simulation failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

function aggregateResults(
  results: Awaited<ReturnType<ReturnType<typeof getSSREngine>["simulatePanel"]>>["results"],
  questions: SurveyQuestion[]
) {
  return questions.map((question) => {
    const questionResponses = results.flatMap((r) =>
      r.responses.filter((resp) => resp.questionId === question.id)
    );

    if (question.type === "open_ended") {
      return {
        questionId: question.id,
        questionText: question.text,
        type: question.type,
        sampleResponses: questionResponses.slice(0, 10).map((r) => ({
          explanation: r.explanation,
          confidence: r.confidence,
        })),
      };
    }

    const ratings = questionResponses.map((r) => r.rating).filter((r) => r > 0);
    const mean = ratings.reduce((a, b) => a + b, 0) / ratings.length;
    const sortedRatings = [...ratings].sort((a, b) => a - b);
    const median = sortedRatings[Math.floor(sortedRatings.length / 2)];

    // Calculate distribution
    const maxRating = question.type === "nps" ? 11 : 5;
    const distribution = Array(maxRating).fill(0);
    ratings.forEach((r) => {
      const index = question.type === "nps" ? r : r - 1;
      if (index >= 0 && index < maxRating) {
        distribution[index]++;
      }
    });

    const distributionPercent = distribution.map(
      (count) => Math.round((count / ratings.length) * 100)
    );

    // Calculate standard deviation
    const variance =
      ratings.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / ratings.length;
    const stdDev = Math.sqrt(variance);

    // NPS-specific calculations
    let npsData = {};
    if (question.type === "nps") {
      const promoters = ratings.filter((r) => r >= 9).length;
      const detractors = ratings.filter((r) => r <= 6).length;
      const passives = ratings.length - promoters - detractors;

      npsData = {
        npsScore: Math.round(
          ((promoters - detractors) / ratings.length) * 100
        ),
        promoters: Math.round((promoters / ratings.length) * 100),
        passives: Math.round((passives / ratings.length) * 100),
        detractors: Math.round((detractors / ratings.length) * 100),
      };
    }

    // Average confidence
    const avgConfidence =
      questionResponses.reduce((sum, r) => sum + r.confidence, 0) /
      questionResponses.length;

    return {
      questionId: question.id,
      questionText: question.text,
      type: question.type,
      totalResponses: ratings.length,
      statistics: {
        mean: Math.round(mean * 100) / 100,
        median,
        stdDev: Math.round(stdDev * 100) / 100,
        distribution: distributionPercent,
        ...npsData,
      },
      avgConfidence: Math.round(avgConfidence * 100),
      sampleResponses: questionResponses.slice(0, 5).map((r) => ({
        rating: r.rating,
        explanation: r.explanation,
        confidence: r.confidence,
      })),
    };
  });
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "arquetype-simulate",
    timestamp: new Date().toISOString(),
  });
}
