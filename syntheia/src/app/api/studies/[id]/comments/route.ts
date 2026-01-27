import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { studyComments, studies, organizationMembers, users } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { requirePermission } from "@/lib/permissions";
import { logCommentAdded } from "@/lib/activity-logger";

const CreateCommentSchema = z.object({
  content: z.string().min(1).max(5000),
  parentId: z.string().optional(),
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

// GET /api/studies/[id]/comments - List all comments for a study
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

    // Check permission
    await requirePermission(session.user.id, organizationId, "comments:view");

    // Verify study belongs to organization
    const [study] = await db
      .select({ id: studies.id })
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

    // Get all comments with user details
    const comments = await db
      .select({
        id: studyComments.id,
        content: studyComments.content,
        parentId: studyComments.parentId,
        createdAt: studyComments.createdAt,
        updatedAt: studyComments.updatedAt,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
          image: users.image,
        },
      })
      .from(studyComments)
      .innerJoin(users, eq(studyComments.userId, users.id))
      .where(eq(studyComments.studyId, studyId))
      .orderBy(desc(studyComments.createdAt));

    // Organize comments into a tree structure
    const topLevelComments = comments.filter((c) => !c.parentId);
    const replies = comments.filter((c) => c.parentId);

    const commentsWithReplies = topLevelComments.map((comment) => ({
      ...comment,
      replies: replies.filter((r) => r.parentId === comment.id),
    }));

    return NextResponse.json({
      success: true,
      data: commentsWithReplies,
    });
  } catch (error) {
    console.error("Error fetching comments:", error);

    if (error instanceof Error && error.name === "PermissionError") {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

// POST /api/studies/[id]/comments - Add a comment to a study
export async function POST(
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

    // Check permission
    await requirePermission(session.user.id, organizationId, "comments:create");

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

    const body = await request.json();
    const validatedData = CreateCommentSchema.parse(body);

    // If replying to a comment, verify parent exists
    if (validatedData.parentId) {
      const [parentComment] = await db
        .select({ id: studyComments.id })
        .from(studyComments)
        .where(
          and(
            eq(studyComments.id, validatedData.parentId),
            eq(studyComments.studyId, studyId)
          )
        )
        .limit(1);

      if (!parentComment) {
        return NextResponse.json(
          { success: false, error: "Parent comment not found" },
          { status: 404 }
        );
      }
    }

    // Create the comment
    const commentId = crypto.randomUUID();
    const now = new Date().toISOString();

    await db.insert(studyComments).values({
      id: commentId,
      studyId,
      userId: session.user.id,
      parentId: validatedData.parentId || null,
      content: validatedData.content,
      createdAt: now,
      updatedAt: now,
    });

    // Log the activity
    await logCommentAdded(
      organizationId,
      session.user.id,
      commentId,
      studyId,
      study.name
    );

    // Fetch the created comment with user details
    const [createdComment] = await db
      .select({
        id: studyComments.id,
        content: studyComments.content,
        parentId: studyComments.parentId,
        createdAt: studyComments.createdAt,
        updatedAt: studyComments.updatedAt,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
          image: users.image,
        },
      })
      .from(studyComments)
      .innerJoin(users, eq(studyComments.userId, users.id))
      .where(eq(studyComments.id, commentId))
      .limit(1);

    return NextResponse.json(
      {
        success: true,
        data: createdComment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating comment:", error);

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
      { success: false, error: "Failed to create comment" },
      { status: 500 }
    );
  }
}
