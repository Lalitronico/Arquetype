import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  studies,
  organizationMembers,
  organizations,
  syntheticRespondents,
  responses,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getSSREngine, SurveyQuestion } from "@/lib/ssr-engine";
import { generatePanel, PERSONA_PRESETS, PresetName } from "@/lib/persona-generator";

async function getSession() {
  const headersList = await headers();
  return auth.api.getSession({ headers: headersList });
}

async function getUserOrganization(userId: string) {
  const membership = await db
    .select()
    .from(organizationMembers)
    .where(eq(organizationMembers.userId, userId))
    .limit(1);

  return membership[0]?.organizationId;
}

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
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const organizationId = await getUserOrganization(session.user.id);
    if (!organizationId) {
      return NextResponse.json(
        { success: false, error: "No organization found" },
        { status: 404 }
      );
    }

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

    // Mark study as running
    await db
      .update(studies)
      .set({ status: "running", updatedAt: new Date().toISOString() })
      .where(eq(studies.id, studyId));

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

    // Run simulation
    const ssrEngine = getSSREngine();
    const simulationResults = await ssrEngine.simulatePanel(
      panel,
      surveyQuestions,
      5 // concurrency
    );

    // Save respondents and responses to database
    const now = new Date().toISOString();

    for (let i = 0; i < simulationResults.length; i++) {
      const result = simulationResults[i];
      const persona = panel[i];
      const respondentId = crypto.randomUUID();

      // Save respondent
      await db.insert(syntheticRespondents).values({
        id: respondentId,
        studyId,
        personaData: JSON.stringify(persona),
        createdAt: now,
      });

      // Save responses
      for (const response of result.responses) {
        await db.insert(responses).values({
          id: crypto.randomUUID(),
          studyId,
          respondentId,
          questionId: response.questionId,
          rating: response.rating || null,
          textResponse: response.rawTextResponse || null,
          explanation: response.explanation,
          confidence: response.confidence,
          distribution: response.distribution
            ? JSON.stringify(response.distribution)
            : null,
          createdAt: now,
        });
      }
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
  results: Awaited<ReturnType<ReturnType<typeof getSSREngine>["simulatePanel"]>>,
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
