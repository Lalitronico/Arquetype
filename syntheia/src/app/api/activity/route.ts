import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { activityLogs, organizationMembers, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { requirePermission } from "@/lib/permissions";

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

// GET /api/activity - List activity logs
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

    // Check permission
    await requirePermission(session.user.id, organizationId, "activity:view");

    // Parse query params
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");
    const resourceType = searchParams.get("resourceType");
    const action = searchParams.get("action");

    // Get activity logs with user details
    const logs = await db
      .select({
        id: activityLogs.id,
        action: activityLogs.action,
        resourceType: activityLogs.resourceType,
        resourceId: activityLogs.resourceId,
        metadata: activityLogs.metadata,
        createdAt: activityLogs.createdAt,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
          image: users.image,
        },
      })
      .from(activityLogs)
      .leftJoin(users, eq(activityLogs.userId, users.id))
      .where(eq(activityLogs.organizationId, organizationId))
      .orderBy(desc(activityLogs.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const allLogs = await db
      .select({ id: activityLogs.id })
      .from(activityLogs)
      .where(eq(activityLogs.organizationId, organizationId));

    return NextResponse.json({
      success: true,
      data: logs,
      pagination: {
        total: allLogs.length,
        limit,
        offset,
        hasMore: offset + limit < allLogs.length,
      },
    });
  } catch (error) {
    console.error("Error fetching activity logs:", error);

    if (error instanceof Error && error.name === "PermissionError") {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to fetch activity logs" },
      { status: 500 }
    );
  }
}
