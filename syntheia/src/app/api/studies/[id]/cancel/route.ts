import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  studies,
  organizationMembers,
  syntheticRespondents,
  responses,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
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

  return membership[0]?.organizationId;
}

// POST /api/studies/[id]/cancel - Cancel a running simulation
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

    // Verify study exists and belongs to organization
    const [study] = await db
      .select()
      .from(studies)
      .where(and(eq(studies.id, studyId), eq(studies.organizationId, organizationId)));

    if (!study) {
      return NextResponse.json(
        { success: false, error: "Study not found" },
        { status: 404 }
      );
    }

    if (study.status !== "running") {
      return NextResponse.json(
        { success: false, error: "Study is not running" },
        { status: 400 }
      );
    }

    const now = new Date();

    // Mark study as cancelled
    await db
      .update(studies)
      .set({
        status: "cancelled",
        cancelledAt: now,
        updatedAt: now,
      })
      .where(eq(studies.id, studyId));

    // Parse request body for cleanup options
    const body = await request.json().catch(() => ({}));
    const keepPartialResults = body.keepPartialResults ?? false;

    // Optionally clean up partial results
    if (!keepPartialResults) {
      // Delete responses first (due to foreign key)
      const respondents = await db
        .select({ id: syntheticRespondents.id })
        .from(syntheticRespondents)
        .where(eq(syntheticRespondents.studyId, studyId));

      for (const respondent of respondents) {
        await db
          .delete(responses)
          .where(eq(responses.respondentId, respondent.id));
      }

      // Delete respondents
      await db
        .delete(syntheticRespondents)
        .where(eq(syntheticRespondents.studyId, studyId));

      // Reset study to draft state
      await db
        .update(studies)
        .set({
          status: "draft",
          currentPersona: 0,
          simulationStartedAt: null,
          cancelledAt: null,
          creditsUsed: 0,
          updatedAt: new Date(),
        })
        .where(eq(studies.id, studyId));

      return NextResponse.json({
        success: true,
        message: "Simulation cancelled and reset to draft",
        data: {
          studyId,
          status: "draft",
          partialResultsRemoved: true,
        },
      });
    }

    // Keep partial results - just mark as cancelled
    return NextResponse.json({
      success: true,
      message: "Simulation cancelled",
      data: {
        studyId,
        status: "cancelled",
        personasProcessed: study.currentPersona,
        totalPersonas: study.sampleSize,
        partialResultsKept: true,
      },
    });
  } catch (error) {
    console.error("Error cancelling simulation:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to cancel simulation",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
