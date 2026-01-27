import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { organizationMembers, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { requirePermission, canManageRole, canRemoveMember, Role } from "@/lib/permissions";
import { logRoleChanged, logMemberRemoved } from "@/lib/activity-logger";

const UpdateMemberSchema = z.object({
  role: z.enum(["admin", "member"]), // Can't promote to owner via API
});

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

// PATCH /api/members/[id] - Update member role
export async function PATCH(
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

    const { id: memberId } = await params;

    // Get the membership to update
    const [membership] = await db
      .select({
        id: organizationMembers.id,
        userId: organizationMembers.userId,
        role: organizationMembers.role,
        organizationId: organizationMembers.organizationId,
      })
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.id, memberId),
          eq(organizationMembers.organizationId, organizationId)
        )
      )
      .limit(1);

    if (!membership) {
      return NextResponse.json(
        { success: false, error: "Member not found" },
        { status: 404 }
      );
    }

    // Check permission to change roles
    const userRole = await requirePermission(session.user.id, organizationId, "members:change_role");

    const body = await request.json();
    const validatedData = UpdateMemberSchema.parse(body);

    // Prevent self-demotion for owners
    if (membership.userId === session.user.id && membership.role === "owner") {
      return NextResponse.json(
        { success: false, error: "Cannot change your own role as owner. Transfer ownership first." },
        { status: 400 }
      );
    }

    // Check if user can manage this role
    if (!canManageRole(userRole, membership.role as Role)) {
      return NextResponse.json(
        { success: false, error: "You cannot change this member's role" },
        { status: 403 }
      );
    }

    // Get user info for activity log
    const [targetUser] = await db
      .select({ name: users.name, email: users.email })
      .from(users)
      .where(eq(users.id, membership.userId))
      .limit(1);

    // Update the role
    await db
      .update(organizationMembers)
      .set({ role: validatedData.role })
      .where(eq(organizationMembers.id, memberId));

    // Log the activity
    await logRoleChanged(
      organizationId,
      session.user.id,
      membership.userId,
      targetUser?.name || targetUser?.email || "Unknown",
      membership.role,
      validatedData.role
    );

    return NextResponse.json({
      success: true,
      message: "Member role updated",
    });
  } catch (error) {
    console.error("Error updating member:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.name === "PermissionError") {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to update member" },
      { status: 500 }
    );
  }
}

// DELETE /api/members/[id] - Remove member from organization
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

    const { id: memberId } = await params;

    // Get the membership to delete
    const [membership] = await db
      .select({
        id: organizationMembers.id,
        userId: organizationMembers.userId,
        role: organizationMembers.role,
        organizationId: organizationMembers.organizationId,
      })
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.id, memberId),
          eq(organizationMembers.organizationId, organizationId)
        )
      )
      .limit(1);

    if (!membership) {
      return NextResponse.json(
        { success: false, error: "Member not found" },
        { status: 404 }
      );
    }

    // Check permission to remove members
    const userRole = await requirePermission(session.user.id, organizationId, "members:remove");

    // Cannot remove yourself if you're the owner
    if (membership.userId === session.user.id && membership.role === "owner") {
      return NextResponse.json(
        { success: false, error: "Cannot remove yourself as owner. Transfer ownership first." },
        { status: 400 }
      );
    }

    // Check if user can remove this member based on roles
    if (!canRemoveMember(userRole, membership.role as Role)) {
      return NextResponse.json(
        { success: false, error: "You cannot remove this member" },
        { status: 403 }
      );
    }

    // Get user info for activity log
    const [targetUser] = await db
      .select({ name: users.name, email: users.email })
      .from(users)
      .where(eq(users.id, membership.userId))
      .limit(1);

    // Delete the membership
    await db
      .delete(organizationMembers)
      .where(eq(organizationMembers.id, memberId));

    // Log the activity
    await logMemberRemoved(
      organizationId,
      session.user.id,
      membership.userId,
      targetUser?.name || targetUser?.email || "Unknown"
    );

    return NextResponse.json({
      success: true,
      message: "Member removed from organization",
    });
  } catch (error) {
    console.error("Error removing member:", error);

    if (error instanceof Error && error.name === "PermissionError") {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to remove member" },
      { status: 500 }
    );
  }
}
