import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { studies, organizationMembers, responses, syntheticRespondents } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

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

interface QuestionStats {
  questionId: string;
  questionText: string;
  type: string;
  mean: number;
  median: number;
  stdDev: number;
  totalResponses: number;
  npsScore?: number;
}

interface StudyComparison {
  id: string;
  name: string;
  completedAt: string | null;
  sampleSize: number;
  questions: QuestionStats[];
}

// GET /api/studies/compare?ids=id1,id2,id3 - Compare multiple studies
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const studyIds = searchParams.get("ids")?.split(",").filter(Boolean) || [];

    if (studyIds.length < 2) {
      return NextResponse.json(
        { success: false, error: "At least 2 study IDs are required for comparison" },
        { status: 400 }
      );
    }

    if (studyIds.length > 10) {
      return NextResponse.json(
        { success: false, error: "Maximum 10 studies can be compared at once" },
        { status: 400 }
      );
    }

    // Fetch studies
    const studyList = await db
      .select()
      .from(studies)
      .where(
        and(
          eq(studies.organizationId, organizationId),
          inArray(studies.id, studyIds),
          eq(studies.status, "completed")
        )
      );

    if (studyList.length < 2) {
      return NextResponse.json(
        { success: false, error: "Not enough completed studies found" },
        { status: 404 }
      );
    }

    // Fetch responses for each study
    const comparisons: StudyComparison[] = [];

    for (const study of studyList) {
      const studyResponses = await db
        .select()
        .from(responses)
        .where(eq(responses.studyId, study.id));

      const questions = JSON.parse(study.questions) as Array<{
        id: string;
        type: string;
        text: string;
      }>;

      const questionStats: QuestionStats[] = questions.map((question) => {
        const questionResponses = studyResponses.filter(
          (r) => r.questionId === question.id
        );

        const ratings = questionResponses
          .map((r) => r.rating)
          .filter((r): r is number => r !== null && r > 0);

        if (ratings.length === 0) {
          return {
            questionId: question.id,
            questionText: question.text,
            type: question.type,
            mean: 0,
            median: 0,
            stdDev: 0,
            totalResponses: 0,
          };
        }

        const mean = ratings.reduce((a, b) => a + b, 0) / ratings.length;
        const sortedRatings = [...ratings].sort((a, b) => a - b);
        const median = sortedRatings[Math.floor(sortedRatings.length / 2)];

        const variance =
          ratings.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / ratings.length;
        const stdDev = Math.sqrt(variance);

        // NPS-specific
        let npsScore: number | undefined;
        if (question.type === "nps" && ratings.length > 0) {
          const promoters = ratings.filter((r) => r >= 9).length;
          const detractors = ratings.filter((r) => r <= 6).length;
          npsScore = Math.round(((promoters - detractors) / ratings.length) * 100);
        }

        return {
          questionId: question.id,
          questionText: question.text,
          type: question.type,
          mean: Math.round(mean * 100) / 100,
          median,
          stdDev: Math.round(stdDev * 100) / 100,
          totalResponses: ratings.length,
          npsScore,
        };
      });

      comparisons.push({
        id: study.id,
        name: study.name,
        completedAt: study.completedAt,
        sampleSize: study.sampleSize,
        questions: questionStats,
      });
    }

    // Sort by completion date
    comparisons.sort((a, b) => {
      if (!a.completedAt) return 1;
      if (!b.completedAt) return -1;
      return new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime();
    });

    // Find common questions (matching by text similarity)
    const commonQuestions = findCommonQuestions(comparisons);

    // Calculate trends for common questions
    const trends = calculateTrends(comparisons, commonQuestions);

    return NextResponse.json({
      success: true,
      data: {
        studies: comparisons,
        commonQuestions,
        trends,
        summary: {
          totalStudies: comparisons.length,
          dateRange: {
            start: comparisons[0]?.completedAt,
            end: comparisons[comparisons.length - 1]?.completedAt,
          },
        },
      },
    });
  } catch (error) {
    console.error("Error comparing studies:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to compare studies",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

function findCommonQuestions(
  comparisons: StudyComparison[]
): Array<{ text: string; questionIds: Record<string, string> }> {
  const questionTextMap: Map<string, Record<string, string>> = new Map();

  comparisons.forEach((study) => {
    study.questions.forEach((q) => {
      // Normalize question text for matching
      const normalizedText = q.questionText.toLowerCase().trim();

      if (!questionTextMap.has(normalizedText)) {
        questionTextMap.set(normalizedText, {});
      }

      const idMap = questionTextMap.get(normalizedText)!;
      idMap[study.id] = q.questionId;
    });
  });

  // Filter to only questions that appear in at least 2 studies
  const commonQuestions: Array<{ text: string; questionIds: Record<string, string> }> = [];

  questionTextMap.forEach((questionIds, text) => {
    if (Object.keys(questionIds).length >= 2) {
      // Find original text (first study's version)
      const firstStudyId = Object.keys(questionIds)[0];
      const firstStudy = comparisons.find((s) => s.id === firstStudyId);
      const originalText =
        firstStudy?.questions.find((q) => q.questionId === questionIds[firstStudyId])?.questionText || text;

      commonQuestions.push({
        text: originalText,
        questionIds,
      });
    }
  });

  return commonQuestions;
}

interface TrendData {
  questionText: string;
  type: string;
  dataPoints: Array<{
    studyId: string;
    studyName: string;
    date: string | null;
    mean: number;
    npsScore?: number;
  }>;
  trend: "improving" | "declining" | "stable";
  changePercent: number;
}

function calculateTrends(
  comparisons: StudyComparison[],
  commonQuestions: Array<{ text: string; questionIds: Record<string, string> }>
): TrendData[] {
  return commonQuestions.map((commonQ) => {
    const dataPoints: TrendData["dataPoints"] = [];

    comparisons.forEach((study) => {
      const questionId = commonQ.questionIds[study.id];
      if (!questionId) return;

      const question = study.questions.find((q) => q.questionId === questionId);
      if (!question) return;

      dataPoints.push({
        studyId: study.id,
        studyName: study.name,
        date: study.completedAt,
        mean: question.mean,
        npsScore: question.npsScore,
      });
    });

    // Calculate trend
    let trend: TrendData["trend"] = "stable";
    let changePercent = 0;

    if (dataPoints.length >= 2) {
      const firstValue = dataPoints[0].npsScore ?? dataPoints[0].mean;
      const lastValue = dataPoints[dataPoints.length - 1].npsScore ?? dataPoints[dataPoints.length - 1].mean;

      if (firstValue !== 0) {
        changePercent = Math.round(((lastValue - firstValue) / Math.abs(firstValue)) * 100);
      } else {
        changePercent = lastValue > 0 ? 100 : lastValue < 0 ? -100 : 0;
      }

      if (changePercent > 5) {
        trend = "improving";
      } else if (changePercent < -5) {
        trend = "declining";
      }
    }

    // Get question type from first found question
    const firstQuestionId = Object.values(commonQ.questionIds)[0];
    const firstStudy = comparisons.find((s) => s.id === Object.keys(commonQ.questionIds)[0]);
    const type = firstStudy?.questions.find((q) => q.questionId === firstQuestionId)?.type || "likert";

    return {
      questionText: commonQ.text,
      type,
      dataPoints,
      trend,
      changePercent,
    };
  });
}
