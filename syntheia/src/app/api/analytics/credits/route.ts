import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { organizations, organizationMembers, studies, apiUsageLogs } from "@/db/schema";
import { eq, and, sql, desc } from "drizzle-orm";
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

// GET /api/analytics/credits - Get credit usage analytics
export async function GET(request: NextRequest) {
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

    // Get query params
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "30", 10);

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get completed studies with credits used in the date range
    const studiesInRange = await db
      .select({
        id: studies.id,
        name: studies.name,
        creditsUsed: studies.creditsUsed,
        completedAt: studies.completedAt,
      })
      .from(studies)
      .where(
        and(
          eq(studies.organizationId, org.id),
          eq(studies.status, "completed"),
          sql`${studies.completedAt} >= ${startDate.toISOString()}`,
          sql`${studies.completedAt} <= ${endDate.toISOString()}`
        )
      )
      .orderBy(desc(studies.completedAt));

    // Get API usage logs in the date range
    const apiLogsInRange = await db
      .select({
        creditsUsed: apiUsageLogs.creditsUsed,
        createdAt: apiUsageLogs.createdAt,
      })
      .from(apiUsageLogs)
      .where(
        and(
          eq(apiUsageLogs.organizationId, org.id),
          sql`${apiUsageLogs.createdAt} >= ${startDate.toISOString()}`,
          sql`${apiUsageLogs.createdAt} <= ${endDate.toISOString()}`
        )
      );

    // Build daily usage data
    const dailyMap = new Map<string, { creditsUsed: number; viaApi: number; viaDashboard: number }>();

    // Initialize all days in the range
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split("T")[0];
      dailyMap.set(dateStr, { creditsUsed: 0, viaApi: 0, viaDashboard: 0 });
    }

    // Add dashboard usage from completed studies
    for (const study of studiesInRange) {
      if (study.completedAt && study.creditsUsed) {
        const dateStr = study.completedAt.split("T")[0];
        const existing = dailyMap.get(dateStr);
        if (existing) {
          existing.creditsUsed += study.creditsUsed;
          existing.viaDashboard += study.creditsUsed;
        }
      }
    }

    // Add API usage
    for (const log of apiLogsInRange) {
      if (log.createdAt && log.creditsUsed) {
        const dateStr = log.createdAt.split("T")[0];
        const existing = dailyMap.get(dateStr);
        if (existing) {
          existing.creditsUsed += log.creditsUsed;
          existing.viaApi += log.creditsUsed;
        }
      }
    }

    // Convert to array and sort by date
    const daily = Array.from(dailyMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Get credits by study
    const byStudy = studiesInRange
      .filter(s => s.creditsUsed && s.creditsUsed > 0)
      .map(s => ({
        studyId: s.id,
        studyName: s.name,
        creditsUsed: s.creditsUsed || 0,
      }));

    // Get top 5 studies by credits
    const topStudies = [...byStudy]
      .sort((a, b) => b.creditsUsed - a.creditsUsed)
      .slice(0, 5);

    // Calculate totals
    const totalCreditsUsed = daily.reduce((sum, d) => sum + d.creditsUsed, 0);
    const totalViaApi = daily.reduce((sum, d) => sum + d.viaApi, 0);
    const totalViaDashboard = daily.reduce((sum, d) => sum + d.viaDashboard, 0);

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalCreditsUsed,
          totalViaApi,
          totalViaDashboard,
          periodDays: days,
        },
        daily,
        byStudy,
        topStudies,
      },
    });
  } catch (error) {
    console.error("Credits analytics error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch credit analytics",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
