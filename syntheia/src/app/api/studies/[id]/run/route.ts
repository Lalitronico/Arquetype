import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  studies,
  organizations,
  syntheticRespondents,
  responses,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getSSREngine, SurveyQuestion, ProductContext } from "@/lib/ssr-engine";
import { generatePanel, PERSONA_PRESETS, PresetName } from "@/lib/persona-generator";
import { logStudyStarted, logActivity } from "@/lib/activity-logger";
import { requireSessionWithOrg } from "@/lib/api-helpers";
import { appCache } from "@/lib/cache";

async function verifyStudyAccess(studyId: string, organizationId: string) {
  const [study] = await db
    .select()
    .from(studies)
    .where(and(eq(studies.id, studyId), eq(studies.organizationId, organizationId)));

  return study;
}

// POST /api/studies/[id]/run - Execute the study simulation
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { session, organizationId, error } = await requireSessionWithOrg();
    if (error) return error;

    const { id: studyId } = await params;
    const study = await verifyStudyAccess(studyId, organizationId);

    if (!study) {
      return NextResponse.json(
        { success: false, error: "Study not found" },
        { status: 404 }
      );
    }

    if (study.status === "running") {
      return NextResponse.json(
        { success: false, error: "Study is already running" },
        { status: 400 }
      );
    }

    if (study.status === "completed") {
      return NextResponse.json(
        { success: false, error: "Study has already been completed" },
        { status: 400 }
      );
    }

    // Check credits
    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, organizationId));

    const creditsNeeded = study.sampleSize;
    if (org.creditsRemaining < creditsNeeded) {
      return NextResponse.json(
        {
          success: false,
          error: "Insufficient credits",
          creditsNeeded,
          creditsAvailable: org.creditsRemaining,
        },
        { status: 402 }
      );
    }

    // Mark study as running with start time
    const simulationStartTime = new Date().toISOString();
    await db
      .update(studies)
      .set({
        status: "running",
        currentPersona: 0,
        simulationStartedAt: simulationStartTime,
        updatedAt: simulationStartTime,
      })
      .where(eq(studies.id, studyId));

    // Log activity
    await logStudyStarted(organizationId, session.user.id, studyId, study.name);

    // Parse study data
    const questions = JSON.parse(study.questions) as Array<{
      id: string;
      type: "likert" | "nps" | "multiple_choice" | "ranking" | "open_ended";
      text: string;
      options?: string[];
    }>;
    const panelConfig = study.panelConfig ? JSON.parse(study.panelConfig) : {};

    // Generate panel
    const presetConfig = panelConfig.preset
      ? PERSONA_PRESETS[panelConfig.preset as PresetName]
      : undefined;

    const panel = generatePanel({
      ...presetConfig,
      demographics: {
        ...presetConfig?.demographics,
        ...panelConfig.demographics,
      },
      context: panelConfig.context,
      count: study.sampleSize, // Must be LAST to override preset defaults
    });

    // Map questions to SSR engine format
    const surveyQuestions: SurveyQuestion[] = questions.map((q) => ({
      ...q,
      scaleMin: 1,
      scaleMax: q.type === "nps" ? 10 : 5,
    }));

    // Build product context from study fields
    const productContext: ProductContext | undefined =
      (study.productName || study.productDescription || study.brandName ||
       study.industry || study.productCategory || study.customContextInstructions)
        ? {
            productName: study.productName || undefined,
            productDescription: study.productDescription || undefined,
            brandName: study.brandName || undefined,
            industry: study.industry || undefined,
            productCategory: study.productCategory || undefined,
            customContextInstructions: study.customContextInstructions || undefined,
          }
        : undefined;

    // Run simulation with progress updates and cancellation support
    const ssrEngine = getSSREngine();
    const { results: simulationResults, cancelled } = await ssrEngine.simulatePanel(
      panel,
      surveyQuestions,
      productContext,
      async (current: number, total: number) => {
        // Update progress in database
        await db
          .update(studies)
          .set({
            currentPersona: current,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(studies.id, studyId));
      },
      async () => {
        // Check if study was cancelled
        const [currentStudy] = await db
          .select({ status: studies.status })
          .from(studies)
          .where(eq(studies.id, studyId));
        return currentStudy?.status === "cancelled";
      }
    );

    // Handle cancellation
    if (cancelled) {
      return NextResponse.json({
        success: false,
        error: "Simulation was cancelled",
        data: {
          studyId,
          status: "cancelled",
          personasProcessed: simulationResults.length,
          totalPersonas: panel.length,
        },
      });
    }

    // Save respondents and responses to database (batch inserts)
    const now = new Date().toISOString();

    // Collect all respondent rows
    const allRespondentRows = simulationResults.map((_, i) => ({
      id: crypto.randomUUID(),
      studyId,
      personaData: JSON.stringify(panel[i]),
      createdAt: now,
    }));

    // Batch insert all respondents
    if (allRespondentRows.length > 0) {
      await db.insert(syntheticRespondents).values(allRespondentRows);
    }

    // Collect all response rows
    const allResponseRows = simulationResults.flatMap((result, i) =>
      result.responses.map((response) => ({
        id: crypto.randomUUID(),
        studyId,
        respondentId: allRespondentRows[i].id,
        questionId: response.questionId,
        rating: response.rating || null,
        textResponse: response.rawTextResponse || null,
        explanation: response.explanation,
        confidence: response.confidence,
        distribution: response.distribution
          ? JSON.stringify(response.distribution)
          : null,
        createdAt: now,
      }))
    );

    // Insert responses in chunks of 100 (SQLite variable limit ~999)
    const CHUNK_SIZE = 100;
    for (let i = 0; i < allResponseRows.length; i += CHUNK_SIZE) {
      const chunk = allResponseRows.slice(i, i + CHUNK_SIZE);
      await db.insert(responses).values(chunk);
    }

    // Update study status and credits
    await db
      .update(studies)
      .set({
        status: "completed",
        creditsUsed: creditsNeeded,
        completedAt: now,
        updatedAt: now,
      })
      .where(eq(studies.id, studyId));

    // Deduct credits
    await db
      .update(organizations)
      .set({
        creditsRemaining: org.creditsRemaining - creditsNeeded,
        updatedAt: now,
      })
      .where(eq(organizations.id, organizationId));

    // Invalidate org cache after credit deduction
    appCache.invalidatePrefix("org:");

    // Log completion
    await logActivity({
      organizationId,
      userId: session.user.id,
      action: "study_completed",
      resourceType: "study",
      resourceId: studyId,
      metadata: { studyName: study.name, respondents: panel.length, creditsUsed: creditsNeeded },
    });

    // Aggregate results for response
    const aggregatedResults = aggregateResults(simulationResults, surveyQuestions);

    return NextResponse.json({
      success: true,
      data: {
        studyId,
        status: "completed",
        totalRespondents: panel.length,
        creditsUsed: creditsNeeded,
        questions: aggregatedResults,
        completedAt: now,
      },
    });
  } catch (error) {
    console.error("Simulation error:", error);

    // Try to reset study status on error
    try {
      const { id: studyId } = await params;
      await db
        .update(studies)
        .set({ status: "draft", updatedAt: new Date().toISOString() })
        .where(eq(studies.id, studyId));
    } catch {
      // Ignore error resetting status
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
        totalResponses: questionResponses.length,
        sampleResponses: questionResponses.slice(0, 10).map((r) => ({
          explanation: r.explanation,
          confidence: r.confidence,
        })),
      };
    }

    const ratings = questionResponses.map((r) => r.rating).filter((r) => r > 0);
    const mean = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
    const sortedRatings = [...ratings].sort((a, b) => a - b);
    const median = sortedRatings.length > 0 ? sortedRatings[Math.floor(sortedRatings.length / 2)] : 0;

    // Calculate distribution
    const maxRating = question.type === "nps" ? 11 : 5;
    const distribution = Array(maxRating).fill(0);
    ratings.forEach((r) => {
      const index = question.type === "nps" ? r : r - 1;
      if (index >= 0 && index < maxRating) {
        distribution[index]++;
      }
    });

    const distributionPercent = ratings.length > 0
      ? distribution.map((count) => Math.round((count / ratings.length) * 100))
      : distribution;

    // Calculate standard deviation
    const variance = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / ratings.length
      : 0;
    const stdDev = Math.sqrt(variance);

    // NPS-specific calculations
    let npsData = {};
    if (question.type === "nps" && ratings.length > 0) {
      const promoters = ratings.filter((r) => r >= 9).length;
      const detractors = ratings.filter((r) => r <= 6).length;
      const passives = ratings.length - promoters - detractors;

      npsData = {
        npsScore: Math.round(((promoters - detractors) / ratings.length) * 100),
        promoters: Math.round((promoters / ratings.length) * 100),
        passives: Math.round((passives / ratings.length) * 100),
        detractors: Math.round((detractors / ratings.length) * 100),
      };
    }

    // Average confidence
    const avgConfidence = questionResponses.length > 0
      ? questionResponses.reduce((sum, r) => sum + r.confidence, 0) / questionResponses.length
      : 0;

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
