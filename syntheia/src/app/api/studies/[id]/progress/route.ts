import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { studies, organizationMembers } from "@/db/schema";
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

// GET /api/studies/[id]/progress - Get simulation progress
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

    // Calculate progress percentage and estimated time
    const currentPersona = study.currentPersona || 0;
    const totalPersonas = study.sampleSize;
    const progress = totalPersonas > 0 ? Math.round((currentPersona / totalPersonas) * 100) : 0;

    let estimatedSecondsRemaining: number | null = null;
    if (study.simulationStartedAt && study.status === "running" && currentPersona > 0) {
      const startTime = new Date(study.simulationStartedAt).getTime();
      const elapsedMs = Date.now() - startTime;
      const msPerPersona = elapsedMs / currentPersona;
      const remainingPersonas = totalPersonas - currentPersona;
      estimatedSecondsRemaining = Math.round((msPerPersona * remainingPersonas) / 1000);
    }

    return NextResponse.json({
      success: true,
      data: {
        studyId: study.id,
        status: study.status,
        currentPersona,
        totalPersonas,
        progress,
        simulationStartedAt: study.simulationStartedAt,
        completedAt: study.completedAt,
        estimatedSecondsRemaining,
      },
    });
  } catch (error) {
    console.error("Error fetching progress:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch progress",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
