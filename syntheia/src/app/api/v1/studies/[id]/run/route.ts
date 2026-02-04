import { NextRequest, NextResponse } from "next/server";
import { withApiKey, ApiContext, hasScope, logApiUsage } from "@/lib/api-middleware";
import { db } from "@/db";
import { studies, organizations, syntheticRespondents, responses } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getSSREngine, type SurveyQuestion } from "@/lib/ssr-engine";
import { generatePanel, PERSONA_PRESETS, type PresetName } from "@/lib/persona-generator";

// POST /api/v1/studies/:id/run - Run a study simulation
async function handlePost(
  request: NextRequest,
  context: ApiContext,
  params?: { id?: string }
): Promise<NextResponse> {
  if (!hasScope(context.scopes, "write")) {
    return NextResponse.json(
      { error: "Insufficient permissions. Required scope: write" },
      { status: 403 }
    );
  }

  const studyId = params?.id;
  if (!studyId) {
    return NextResponse.json({ error: "Study ID required" }, { status: 400 });
  }

  // Get the study
  const study = await db
    .select()
    .from(studies)
    .where(
      and(
        eq(studies.id, studyId),
        eq(studies.organizationId, context.organizationId)
      )
    )
    .get();

  if (!study) {
    return NextResponse.json({ error: "Study not found" }, { status: 404 });
  }

  if (study.status === "running") {
    return NextResponse.json(
      { error: "Study is already running" },
      { status: 400 }
    );
  }

  if (study.status === "completed") {
    return NextResponse.json(
      { error: "Study has already been completed" },
      { status: 400 }
    );
  }

  // Check credits
  const org = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, context.organizationId))
    .get();

  if (!org) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }

  const creditsNeeded = study.sampleSize;
  if (org.creditsRemaining < creditsNeeded) {
    return NextResponse.json(
      {
        error: "Insufficient credits",
        creditsNeeded,
        creditsAvailable: org.creditsRemaining,
      },
      { status: 402 }
    );
  }

  // Update study status to running
  await db
    .update(studies)
    .set({ status: "running", updatedAt: new Date().toISOString() })
    .where(eq(studies.id, studyId));

  try {
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
      count: study.sampleSize,
      ...presetConfig,
      demographics: {
        ...presetConfig?.demographics,
        ...panelConfig.demographics,
      },
      context: panelConfig.context,
    });

    // Map questions to SSR engine format
    const surveyQuestions: SurveyQuestion[] = questions.map((q) => ({
      ...q,
      scaleMin: 1,
      scaleMax: q.type === "nps" ? 10 : 5,
    }));

    // Run simulation
    const ssrEngine = getSSREngine();
    const { results: simulationResults } = await ssrEngine.simulatePanel(
      panel,
      surveyQuestions
    );

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

    // Update study as completed and deduct credits
    await db
      .update(studies)
      .set({
        status: "completed",
        creditsUsed: creditsNeeded,
        completedAt: now,
        updatedAt: now,
      })
      .where(eq(studies.id, studyId));

    await db
      .update(organizations)
      .set({
        creditsRemaining: org.creditsRemaining - creditsNeeded,
        updatedAt: now,
      })
      .where(eq(organizations.id, context.organizationId));

    // Log API usage
    await logApiUsage(
      context.organizationId,
      context.apiKeyId,
      "POST /v1/studies/:id/run",
      creditsNeeded,
      studyId
    );

    return NextResponse.json({
      id: studyId,
      status: "completed",
      respondents: simulationResults.length,
      creditsUsed: creditsNeeded,
      completedAt: now,
      message: "Study simulation completed successfully",
    });
  } catch (error) {
    // Revert status on error
    await db
      .update(studies)
      .set({ status: "draft", updatedAt: new Date().toISOString() })
      .where(eq(studies.id, studyId));

    console.error("API v1 study run error:", error);
    return NextResponse.json(
      { error: "Simulation failed. Please try again." },
      { status: 500 }
    );
  }
}

export const POST = withApiKey(handlePost);
