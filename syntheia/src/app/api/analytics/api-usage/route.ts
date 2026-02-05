import { NextResponse } from "next/server";
import { db } from "@/db";
import { apiUsageLogs, apiKeys } from "@/db/schema";
import { eq, and, sql, count, sum } from "drizzle-orm";
import { requireSessionWithOrg } from "@/lib/api-helpers";

// GET /api/analytics/api-usage - Get API usage analytics
export async function GET() {
  try {
    const { organizationId, error } = await requireSessionWithOrg();
    if (error) return error;

    // Get API keys for this organization
    const keys = await db
      .select({
        id: apiKeys.id,
        name: apiKeys.name,
        keyPrefix: apiKeys.keyPrefix,
      })
      .from(apiKeys)
      .where(
        and(
          eq(apiKeys.organizationId, organizationId),
          sql`${apiKeys.revokedAt} IS NULL`
        )
      );

    // SQL aggregation: totals
    const [totals] = await db
      .select({
        totalCalls: count(),
        creditsViaApi: sum(apiUsageLogs.creditsUsed),
      })
      .from(apiUsageLogs)
      .where(eq(apiUsageLogs.organizationId, organizationId));

    // SQL aggregation: group by API key
    const byApiKeyRows = await db
      .select({
        apiKeyId: apiUsageLogs.apiKeyId,
        calls: count(),
        creditsUsed: sum(apiUsageLogs.creditsUsed),
      })
      .from(apiUsageLogs)
      .where(eq(apiUsageLogs.organizationId, organizationId))
      .groupBy(apiUsageLogs.apiKeyId);

    const byApiKey = byApiKeyRows
      .map((row) => {
        const keyInfo = keys.find((k) => k.id === row.apiKeyId);
        return {
          keyId: row.apiKeyId,
          keyName: keyInfo?.name || "Unknown Key",
          keyPrefix: keyInfo?.keyPrefix || "---",
          calls: row.calls,
          creditsUsed: Number(row.creditsUsed) || 0,
        };
      })
      .sort((a, b) => b.creditsUsed - a.creditsUsed);

    // SQL aggregation: group by endpoint
    const byEndpointRows = await db
      .select({
        endpoint: apiUsageLogs.endpoint,
        calls: count(),
        creditsUsed: sum(apiUsageLogs.creditsUsed),
      })
      .from(apiUsageLogs)
      .where(eq(apiUsageLogs.organizationId, organizationId))
      .groupBy(apiUsageLogs.endpoint);

    const byEndpoint = byEndpointRows
      .map((row) => ({
        endpoint: row.endpoint,
        calls: row.calls,
        creditsUsed: Number(row.creditsUsed) || 0,
      }))
      .sort((a, b) => b.calls - a.calls);

    // SQL aggregation: last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [recentTotals] = await db
      .select({
        calls: count(),
        creditsUsed: sum(apiUsageLogs.creditsUsed),
      })
      .from(apiUsageLogs)
      .where(
        and(
          eq(apiUsageLogs.organizationId, organizationId),
          sql`${apiUsageLogs.createdAt} >= ${thirtyDaysAgo}`
        )
      );

    return NextResponse.json({
      success: true,
      data: {
        totalCalls: totals.totalCalls,
        creditsViaApi: Number(totals.creditsViaApi) || 0,
        activeApiKeys: keys.length,
        recent: {
          calls: recentTotals.calls,
          creditsUsed: Number(recentTotals.creditsUsed) || 0,
          periodDays: 30,
        },
        byApiKey,
        byEndpoint,
      },
    });
  } catch (error) {
    console.error("API usage analytics error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch API usage analytics",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
