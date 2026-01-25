import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  studies,
  organizationMembers,
  syntheticRespondents,
  responses,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
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

async function verifyStudyAccess(studyId: string, organizationId: string) {
  const [study] = await db
    .select()
    .from(studies)
    .where(and(eq(studies.id, studyId), eq(studies.organizationId, organizationId)));

  return study;
}

// GET /api/studies/[id]/export - Export study results as CSV
export async function GET(
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

    if (study.status !== "completed") {
      return NextResponse.json(
        { success: false, error: "Study has not been completed yet" },
        { status: 400 }
      );
    }

    const format = request.nextUrl.searchParams.get("format") || "csv";

    // Fetch all data
    const respondents = await db
      .select()
      .from(syntheticRespondents)
      .where(eq(syntheticRespondents.studyId, studyId));

    const allResponses = await db
      .select()
      .from(responses)
      .where(eq(responses.studyId, studyId));

    const questions = JSON.parse(study.questions) as Array<{
      id: string;
      type: string;
      text: string;
    }>;

    // Build respondent map
    const respondentMap = new Map(
      respondents.map((r) => [r.id, JSON.parse(r.personaData)])
    );

    // Group responses by respondent
    const responsesByRespondent = new Map<string, typeof allResponses>();
    for (const response of allResponses) {
      const existing = responsesByRespondent.get(response.respondentId) || [];
      existing.push(response);
      responsesByRespondent.set(response.respondentId, existing);
    }

    if (format === "csv") {
      // Generate CSV
      const csvRows: string[] = [];

      // Header row
      const headers = [
        "Respondent ID",
        "Age",
        "Gender",
        "Location",
        "Income Level",
        "Education",
        ...questions.flatMap((q) => [
          `Q: ${q.text.substring(0, 50)}${q.text.length > 50 ? "..." : ""} - Rating`,
          `Q: ${q.text.substring(0, 50)}${q.text.length > 50 ? "..." : ""} - Response`,
          `Q: ${q.text.substring(0, 50)}${q.text.length > 50 ? "..." : ""} - Confidence`,
        ]),
      ];
      csvRows.push(headers.map(escapeCSV).join(","));

      // Data rows
      for (const [respondentId, persona] of respondentMap) {
        const respondentResponses = responsesByRespondent.get(respondentId) || [];
        const row: string[] = [
          respondentId,
          String(persona.demographics?.age || ""),
          persona.demographics?.gender || "",
          persona.demographics?.location || "",
          persona.demographics?.incomeLevel || "",
          persona.demographics?.education || "",
        ];

        for (const question of questions) {
          const response = respondentResponses.find(
            (r) => r.questionId === question.id
          );
          if (response) {
            row.push(String(response.rating || ""));
            row.push(response.textResponse || response.explanation || "");
            row.push(String(Math.round((response.confidence || 0) * 100)) + "%");
          } else {
            row.push("", "", "");
          }
        }

        csvRows.push(row.map(escapeCSV).join(","));
      }

      const csv = csvRows.join("\n");
      const filename = `${study.name.replace(/[^a-zA-Z0-9]/g, "_")}_results.csv`;

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    } else if (format === "json") {
      // Generate JSON export
      const exportData = {
        study: {
          id: study.id,
          name: study.name,
          description: study.description,
          sampleSize: study.sampleSize,
          creditsUsed: study.creditsUsed,
          createdAt: study.createdAt,
          completedAt: study.completedAt,
        },
        questions: questions,
        respondents: respondents.map((r) => ({
          id: r.id,
          persona: JSON.parse(r.personaData),
          responses: (responsesByRespondent.get(r.id) || []).map((resp) => ({
            questionId: resp.questionId,
            rating: resp.rating,
            textResponse: resp.textResponse,
            explanation: resp.explanation,
            confidence: resp.confidence,
            distribution: resp.distribution ? JSON.parse(resp.distribution) : null,
          })),
        })),
        summary: generateSummary(questions, allResponses),
      };

      const filename = `${study.name.replace(/[^a-zA-Z0-9]/g, "_")}_results.json`;

      return new NextResponse(JSON.stringify(exportData, null, 2), {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid format. Use 'csv' or 'json'" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to export study",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

function escapeCSV(value: string): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function generateSummary(
  questions: Array<{ id: string; type: string; text: string }>,
  allResponses: Array<{
    questionId: string;
    rating: number | null;
    confidence: number | null;
  }>
) {
  return questions.map((question) => {
    const questionResponses = allResponses.filter(
      (r) => r.questionId === question.id
    );
    const ratings = questionResponses
      .map((r) => r.rating)
      .filter((r): r is number => r !== null && r > 0);

    if (question.type === "open_ended" || ratings.length === 0) {
      return {
        questionId: question.id,
        questionText: question.text,
        type: question.type,
        totalResponses: questionResponses.length,
      };
    }

    const mean = ratings.reduce((a, b) => a + b, 0) / ratings.length;
    const sortedRatings = [...ratings].sort((a, b) => a - b);
    const median = sortedRatings[Math.floor(sortedRatings.length / 2)];
    const variance =
      ratings.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / ratings.length;
    const stdDev = Math.sqrt(variance);

    const maxRating = question.type === "nps" ? 11 : 5;
    const distribution = Array(maxRating).fill(0);
    ratings.forEach((r) => {
      const index = question.type === "nps" ? r : r - 1;
      if (index >= 0 && index < maxRating) {
        distribution[index]++;
      }
    });

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

    const avgConfidence =
      questionResponses.reduce((sum, r) => sum + (r.confidence || 0), 0) /
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
        distribution,
        ...npsData,
      },
      avgConfidence: Math.round(avgConfidence * 100),
    };
  });
}
