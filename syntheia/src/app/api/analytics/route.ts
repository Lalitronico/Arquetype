import { NextResponse } from "next/server";
import { db } from "@/db";
import { organizations, organizationMembers, studies, responses } from "@/db/schema";
import { eq, and, sql, count } from "drizzle-orm";
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

  if (!membership[0]) return null;

  const [org] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, membership[0].organizationId));

  return org;
}

// GET /api/analytics - Get overview analytics
export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const org = await getUserOrganization(session.user.id);
    if (!org) {
      return NextResponse.json(
        { success: false, error: "No organization found" },
        { status: 404 }
      );
    }

    // Get all studies for this organization
    const allStudies = await db
      .select({
        id: studies.id,
        status: studies.status,
        sampleSize: studies.sampleSize,
        creditsUsed: studies.creditsUsed,
      })
      .from(studies)
      .where(eq(studies.organizationId, org.id));

    // Calculate stats
    const totalStudies = allStudies.length;
    const completedStudies = allStudies.filter(s => s.status === "completed").length;
    const runningStudies = allStudies.filter(s => s.status === "running").length;
    const draftStudies = allStudies.filter(s => s.status === "draft").length;

    // Get total responses for completed studies
    const completedStudyIds = allStudies
      .filter(s => s.status === "completed")
      .map(s => s.id);

    let totalResponses = 0;
    if (completedStudyIds.length > 0) {
      const responseCounts = await db
        .select({ count: count() })
        .from(responses)
        .where(sql`${responses.studyId} IN (${sql.join(completedStudyIds.map(id => sql`${id}`), sql`, `)})`);

      totalResponses = responseCounts[0]?.count || 0;
    }

    // Calculate average sample size for completed studies
    const completedStudiesData = allStudies.filter(s => s.status === "completed");
    const avgSampleSize = completedStudiesData.length > 0
      ? Math.round(
          completedStudiesData.reduce((sum, s) => sum + s.sampleSize, 0) /
            completedStudiesData.length
        )
      : 0;

    // Calculate credits used this month
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const studiesThisMonth = await db
      .select({ creditsUsed: studies.creditsUsed })
      .from(studies)
      .where(
        and(
          eq(studies.organizationId, org.id),
          sql`${studies.completedAt} >= ${firstDayOfMonth}`
        )
      );

    const creditsUsedThisMonth = studiesThisMonth.reduce(
      (sum, s) => sum + (s.creditsUsed || 0),
      0
    );

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalStudies,
          completedStudies,
          totalResponses,
          avgSampleSize,
          studiesByStatus: {
            draft: draftStudies,
            running: runningStudies,
            completed: completedStudies,
          },
        },
        credits: {
          remaining: org.creditsRemaining,
          monthly: org.creditsMonthly,
          usedThisMonth: creditsUsedThisMonth,
        },
      },
    });
  } catch (error) {
    console.error("Analytics overview error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch analytics",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
