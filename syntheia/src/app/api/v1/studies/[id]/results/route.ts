import { NextRequest, NextResponse } from "next/server";
import { withApiKey, ApiContext, hasScope } from "@/lib/api-middleware";
import { db } from "@/db";
import { studies, syntheticRespondents, responses } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// GET /api/v1/studies/:id/results - Get study results
async function handleGet(
  request: NextRequest,
  context: ApiContext,
  params?: { id?: string }
): Promise<NextResponse> {
  if (!hasScope(context.scopes, "read")) {
    return NextResponse.json(
      { error: "Insufficient permissions. Required scope: read" },
      { status: 403 }
    );
  }

  const studyId = params?.id;
  if (!studyId) {
    return NextResponse.json({ error: "Study ID required" }, { status: 400 });
  }

  // Get the study
  const [study] = await db
    .select()
    .from(studies)
    .where(
      and(
        eq(studies.id, studyId),
        eq(studies.organizationId, context.organizationId)
      )
    )
    .limit(1);

  if (!study) {
    return NextResponse.json({ error: "Study not found" }, { status: 404 });
  }

  if (study.status !== "completed") {
    return NextResponse.json(
      {
        error: "Study has not been completed yet",
        status: study.status
      },
      { status: 400 }
    );
  }

  // Get respondents
  const respondentsList = await db
    .select()
    .from(syntheticRespondents)
    .where(eq(syntheticRespondents.studyId, studyId));

  // Get all responses
  const allResponses = await db
    .select()
    .from(responses)
    .where(eq(responses.studyId, studyId));

  // Questions are already parsed (jsonb)
  const questions = study.questions as Array<Record<string, unknown>>;

  // Build results per respondent
  const respondentResults = respondentsList.map((respondent) => {
    const persona = respondent.personaData as Record<string, unknown>;
    const respondentResponses = allResponses.filter(
      (r) => r.respondentId === respondent.id
    );

    return {
      respondentId: respondent.id,
      persona: {
        age: persona.age,
        gender: persona.gender,
        location: persona.location,
        income: persona.income,
        education: persona.education,
      },
      responses: respondentResponses.map((r) => ({
        questionId: r.questionId,
        rating: r.rating,
        textResponse: r.textResponse,
        explanation: r.explanation,
        confidence: r.confidence,
        distribution: r.distribution,
      })),
    };
  });

  // Calculate summary statistics for rating questions
  const summary: Record<string, { average: number; distribution: Record<number, number>; count: number }> = {};

  for (const question of questions) {
    if (question.type === "rating") {
      const questionResponses = allResponses.filter(
        (r) => r.questionId === question.id && r.rating !== null
      );

      if (questionResponses.length > 0) {
        const ratings = questionResponses.map((r) => r.rating!);
        const average = ratings.reduce((a, b) => a + b, 0) / ratings.length;

        const distribution: Record<number, number> = {};
        for (const rating of ratings) {
          distribution[rating] = (distribution[rating] || 0) + 1;
        }

        summary[question.id as string] = {
          average: Math.round(average * 100) / 100,
          distribution,
          count: ratings.length,
        };
      }
    }
  }

  return NextResponse.json({
    study: {
      id: study.id,
      name: study.name,
      status: study.status,
      sampleSize: study.sampleSize,
      completedAt: study.completedAt,
    },
    questions,
    respondents: respondentResults,
    summary,
    totalRespondents: respondentsList.length,
    totalResponses: allResponses.length,
  });
}

export const GET = withApiKey(handleGet);
