import { NextResponse } from "next/server";
import { db } from "@/db";
import { organizations, organizationMembers, apiUsageLogs, apiKeys } from "@/db/schema";
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

// GET /api/analytics/api-usage - Get API usage analytics
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

    // Get all API usage logs for this organization
    const allLogs = await db
      .select({
        id: apiUsageLogs.id,
        apiKeyId: apiUsageLogs.apiKeyId,
        endpoint: apiUsageLogs.endpoint,
        creditsUsed: apiUsageLogs.creditsUsed,
        createdAt: apiUsageLogs.createdAt,
      })
      .from(apiUsageLogs)
      .where(eq(apiUsageLogs.organizationId, org.id));

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
          eq(apiKeys.organizationId, org.id),
          sql`${apiKeys.revokedAt} IS NULL`
        )
      );

    // Calculate totals
    const totalCalls = allLogs.length;
    const creditsViaApi = allLogs.reduce((sum, log) => sum + log.creditsUsed, 0);

    // Group by API key
    const byApiKeyMap = new Map<string | null, { calls: number; creditsUsed: number }>();
    for (const log of allLogs) {
      const keyId = log.apiKeyId;
      const existing = byApiKeyMap.get(keyId) || { calls: 0, creditsUsed: 0 };
      existing.calls += 1;
      existing.creditsUsed += log.creditsUsed;
      byApiKeyMap.set(keyId, existing);
    }

    const byApiKey = Array.from(byApiKeyMap.entries()).map(([keyId, data]) => {
      const keyInfo = keys.find(k => k.id === keyId);
      return {
        keyId,
        keyName: keyInfo?.name || "Unknown Key",
        keyPrefix: keyInfo?.keyPrefix || "---",
        calls: data.calls,
        creditsUsed: data.creditsUsed,
      };
    }).sort((a, b) => b.creditsUsed - a.creditsUsed);

    // Group by endpoint
    const byEndpointMap = new Map<string, { calls: number; creditsUsed: number }>();
    for (const log of allLogs) {
      const existing = byEndpointMap.get(log.endpoint) || { calls: 0, creditsUsed: 0 };
      existing.calls += 1;
      existing.creditsUsed += log.creditsUsed;
      byEndpointMap.set(log.endpoint, existing);
    }

    const byEndpoint = Array.from(byEndpointMap.entries())
      .map(([endpoint, data]) => ({
        endpoint,
        calls: data.calls,
        creditsUsed: data.creditsUsed,
      }))
      .sort((a, b) => b.calls - a.calls);

    // Get last 30 days activity
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentLogs = allLogs.filter(
      log => log.createdAt && new Date(log.createdAt) >= thirtyDaysAgo
    );

    const recentCalls = recentLogs.length;
    const recentCredits = recentLogs.reduce((sum, log) => sum + log.creditsUsed, 0);

    return NextResponse.json({
      success: true,
      data: {
        totalCalls,
        creditsViaApi,
        activeApiKeys: keys.length,
        recent: {
          calls: recentCalls,
          creditsUsed: recentCredits,
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
