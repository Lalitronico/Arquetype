import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { organizationMembers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { appCache, ORG_TTL } from "@/lib/cache";

/**
 * Get the current session from Better Auth headers.
 * Centralized — replaces ~22 local copies of getSession().
 */
export async function getSession() {
  const headersList = await headers();
  return auth.api.getSession({ headers: headersList });
}

/**
 * Get the organization ID for a user (cached 5 min).
 * Centralized — replaces ~20 local copies of getUserOrganization().
 */
export async function getUserOrganizationId(userId: string): Promise<string | null> {
  const cacheKey = `org:${userId}`;
  const cached = appCache.get<string>(cacheKey);
  if (cached) return cached;

  const membership = await db
    .select({ organizationId: organizationMembers.organizationId })
    .from(organizationMembers)
    .where(eq(organizationMembers.userId, userId))
    .limit(1);

  const orgId = membership[0]?.organizationId || null;
  if (orgId) {
    appCache.set(cacheKey, orgId, ORG_TTL);
  }
  return orgId;
}

/**
 * Require a valid session or return a 401 JSON response.
 */
export async function requireSession() {
  const session = await getSession();
  if (!session?.user) {
    return {
      session: null as never,
      error: NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      ),
    };
  }
  return { session, error: null };
}

/**
 * Require a valid session AND organization, or return an error response.
 */
export async function requireSessionWithOrg() {
  const { session, error } = await requireSession();
  if (error) return { session: null as never, organizationId: null as never, error };

  const organizationId = await getUserOrganizationId(session.user.id);
  if (!organizationId) {
    return {
      session: null as never,
      organizationId: null as never,
      error: NextResponse.json(
        { success: false, error: "No organization found" },
        { status: 404 }
      ),
    };
  }

  return { session, organizationId, error: null };
}
