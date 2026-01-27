import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { studyComments, studies, organizationMembers, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { requirePermission, checkPermission } from "@/lib/permissions";
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

// DELETE /api/studies/[id]/comments/[commentId] - Delete a comment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
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

    const { id: studyId, commentId } = await params;

    // Verify study belongs to organization
    const [study] = await db
      .select({ id: studies.id, name: studies.name })
      .from(studies)
      .where(
        and(
          eq(studies.id, studyId),
          eq(studies.organizationId, organizationId)
        )
      )
      .limit(1);

    if (!study) {
      return NextResponse.json(
        { success: false, error: "Study not found" },
        { status: 404 }
      );
    }

    // Get the comment
    const [comment] = await db
      .select()
      .from(studyComments)
      .where(
        and(
          eq(studyComments.id, commentId),
          eq(studyComments.studyId, studyId)
        )
      )
      .limit(1);

    if (!comment) {
      return NextResponse.json(
        { success: false, error: "Comment not found" },
        { status: 404 }
      );
    }

    // Check permissions:
    // - Can delete own comments if has comments:delete_own
    // - Can delete any comment if has comments:delete_any
    const isOwnComment = comment.userId === session.user.id;

    if (isOwnComment) {
      await requirePermission(session.user.id, organizationId, "comments:delete_own");
    } else {
      const canDeleteAny = await checkPermission(
        session.user.id,
        organizationId,
        "comments:delete_any"
      );

      if (!canDeleteAny) {
        return NextResponse.json(
          { success: false, error: "You can only delete your own comments" },
          { status: 403 }
        );
      }
    }

    // Delete the comment (and its replies will remain orphaned, or cascade if needed)
    await db
      .delete(studyComments)
      .where(eq(studyComments.id, commentId));

    // Also delete any replies to this comment
    await db
      .delete(studyComments)
      .where(eq(studyComments.parentId, commentId));

    // Log the activity
    await logActivity({
      organizationId,
      userId: session.user.id,
      action: "comment_deleted",
      resourceType: "comment",
      resourceId: commentId,
      metadata: { studyId, studyName: study.name },
    });

    return NextResponse.json({
      success: true,
      message: "Comment deleted",
    });
  } catch (error) {
    console.error("Error deleting comment:", error);

    if (error instanceof Error && error.name === "PermissionError") {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to delete comment" },
      { status: 500 }
    );
  }
}
