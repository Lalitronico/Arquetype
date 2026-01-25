import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { studies, organizationMembers, syntheticRespondents, responses } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const UpdateStudySchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  status: z.enum(["draft", "running", "completed", "archived"]).optional(),
  questions: z
    .array(
      z.object({
        id: z.string(),
        type: z.enum(["likert", "nps", "multiple_choice", "ranking", "open_ended"]),
        text: z.string().min(1),
        options: z.array(z.string()).optional(),
        required: z.boolean().default(true),
      })
    )
    .optional(),
  panelConfig: z
    .object({
      preset: z.string().optional(),
      count: z.number().min(1).max(1000).optional(),
      demographics: z
        .object({
          ageRange: z.object({ min: z.number(), max: z.number() }).optional(),
          genderDistribution: z
            .object({
              male: z.number(),
              female: z.number(),
              nonBinary: z.number(),
            })
            .optional(),
          locations: z.array(z.string()).optional(),
        })
        .optional(),
      context: z
        .object({
          industry: z.string().optional(),
          productExperience: z.array(z.string()).optional(),
        })
        .optional(),
    })
    .optional(),
  sampleSize: z.number().min(1).max(10000).optional(),
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

async function verifyStudyAccess(studyId: string, organizationId: string) {
  const [study] = await db
    .select()
    .from(studies)
    .where(and(eq(studies.id, studyId), eq(studies.organizationId, organizationId)));

  return study;
}

// GET /api/studies/[id] - Get a specific study with results
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

    const { id } = await params;
    const study = await verifyStudyAccess(id, organizationId);

    if (!study) {
      return NextResponse.json(
        { success: false, error: "Study not found" },
        { status: 404 }
      );
    }

    // If study is completed, fetch results
    let results = null;
    if (study.status === "completed") {
      const respondents = await db
        .select()
        .from(syntheticRespondents)
        .where(eq(syntheticRespondents.studyId, id));

      const allResponses = await db
        .select()
        .from(responses)
        .where(eq(responses.studyId, id));

      results = {
        respondents: respondents.map((r) => ({
          ...r,
          personaData: JSON.parse(r.personaData),
        })),
        responses: allResponses.map((r) => ({
          ...r,
          distribution: r.distribution ? JSON.parse(r.distribution) : null,
        })),
      };
    }

    return NextResponse.json({
      success: true,
      data: {
        ...study,
        questions: JSON.parse(study.questions),
        panelConfig: study.panelConfig ? JSON.parse(study.panelConfig) : null,
        results,
      },
    });
  } catch (error) {
    console.error("Error fetching study:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch study",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// PATCH /api/studies/[id] - Update a study
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

    const { id } = await params;
    const study = await verifyStudyAccess(id, organizationId);

    if (!study) {
      return NextResponse.json(
        { success: false, error: "Study not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validatedData = UpdateStudySchema.parse(body);

    const now = new Date().toISOString();
    const updateData: Record<string, unknown> = {
      updatedAt: now,
    };

    if (validatedData.name) updateData.name = validatedData.name;
    if (validatedData.description !== undefined)
      updateData.description = validatedData.description;
    if (validatedData.status) {
      updateData.status = validatedData.status;
      if (validatedData.status === "completed") {
        updateData.completedAt = now;
      }
    }
    if (validatedData.questions)
      updateData.questions = JSON.stringify(validatedData.questions);
    if (validatedData.panelConfig)
      updateData.panelConfig = JSON.stringify(validatedData.panelConfig);
    if (validatedData.sampleSize) updateData.sampleSize = validatedData.sampleSize;

    await db.update(studies).set(updateData).where(eq(studies.id, id));

    const [updatedStudy] = await db.select().from(studies).where(eq(studies.id, id));

    return NextResponse.json({
      success: true,
      data: {
        ...updatedStudy,
        questions: JSON.parse(updatedStudy.questions),
        panelConfig: updatedStudy.panelConfig
          ? JSON.parse(updatedStudy.panelConfig)
          : null,
      },
    });
  } catch (error) {
    console.error("Error updating study:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation error",
          details: error.issues,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update study",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/studies/[id] - Delete a study
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

    const { id } = await params;
    const study = await verifyStudyAccess(id, organizationId);

    if (!study) {
      return NextResponse.json(
        { success: false, error: "Study not found" },
        { status: 404 }
      );
    }

    // Delete study (cascade will delete respondents and responses)
    await db.delete(studies).where(eq(studies.id, id));

    return NextResponse.json({
      success: true,
      message: "Study deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting study:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete study",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
