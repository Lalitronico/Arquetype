import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { invitations, organizationMembers } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { requirePermission } from "@/lib/permissions";
import { logActivity } from "@/lib/activity-logger";

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

// DELETE /api/invitations/[id] - Revoke an invitation
export async function DELETE(
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

    const { id: invitationId } = await params;

    // Check permission
    await requirePermission(session.user.id, organizationId, "members:invite");

    // Get the invitation
    const [invitation] = await db
      .select()
      .from(invitations)
      .where(
        and(
          eq(invitations.id, invitationId),
          eq(invitations.organizationId, organizationId)
        )
      )
      .limit(1);

    if (!invitation) {
      return NextResponse.json(
        { success: false, error: "Invitation not found" },
        { status: 404 }
      );
    }

    if (invitation.status !== "pending") {
      return NextResponse.json(
        { success: false, error: "Only pending invitations can be revoked" },
        { status: 400 }
      );
    }

    // Update status to revoked
    await db
      .update(invitations)
      .set({ status: "revoked" })
      .where(eq(invitations.id, invitationId));

    // Log the activity
    await logActivity({
      organizationId,
      userId: session.user.id,
      action: "invitation_revoked",
      resourceType: "invitation",
      resourceId: invitationId,
      metadata: { email: invitation.email },
    });

    return NextResponse.json({
      success: true,
      message: "Invitation revoked",
    });
  } catch (error) {
    console.error("Error revoking invitation:", error);

    if (error instanceof Error && error.name === "PermissionError") {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to revoke invitation" },
      { status: 500 }
    );
  }
}

// GET /api/invitations/[id] - Get invitation details (public, by token)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: invitationId } = await params;

    // Get the invitation (this is public - anyone with the token can view)
    const [invitation] = await db
      .select({
        id: invitations.id,
        email: invitations.email,
        role: invitations.role,
        status: invitations.status,
        expiresAt: invitations.expiresAt,
        createdAt: invitations.createdAt,
      })
      .from(invitations)
      .where(eq(invitations.id, invitationId))
      .limit(1);

    if (!invitation) {
      return NextResponse.json(
        { success: false, error: "Invitation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: invitation,
    });
  } catch (error) {
    console.error("Error fetching invitation:", error);

    return NextResponse.json(
      { success: false, error: "Failed to fetch invitation" },
      { status: 500 }
    );
  }
}
