import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { studies, organizationMembers } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// Validation schemas
const CreateStudySchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  questions: z.array(
    z.object({
      id: z.string(),
      type: z.enum(["likert", "nps", "multiple_choice", "ranking", "open_ended"]),
      text: z.string().min(1),
      options: z.array(z.string()).optional(),
      required: z.boolean().default(true),
    })
  ),
  panelConfig: z
    .object({
      preset: z.string().optional(),
      count: z.number().min(1).max(1000).default(100),
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
  sampleSize: z.number().min(1).max(10000).default(100),
  // Product/Service context fields
  productName: z.string().max(200).optional(),
  productDescription: z.string().max(2000).optional(),
  brandName: z.string().max(200).optional(),
  industry: z.string().max(100).optional(),
  productCategory: z.string().max(100).optional(),
  customContextInstructions: z.string().max(2000).optional(),
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

// GET /api/studies - List all studies
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

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Build query
    const conditions = [eq(studies.organizationId, organizationId)];
    if (status) {
      conditions.push(eq(studies.status, status));
    }

    const studiesList = await db
      .select()
      .from(studies)
      .where(and(...conditions))
      .orderBy(desc(studies.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count
    const allStudies = await db
      .select()
      .from(studies)
      .where(and(...conditions));

    const total = allStudies.length;

    // Parse JSON fields
    const parsedStudies = studiesList.map((study) => ({
      ...study,
      questions: JSON.parse(study.questions),
      panelConfig: study.panelConfig ? JSON.parse(study.panelConfig) : null,
    }));

    return NextResponse.json({
      success: true,
      data: parsedStudies,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error("Error fetching studies:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch studies",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// POST /api/studies - Create a new study
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const validatedData = CreateStudySchema.parse(body);

    const now = new Date().toISOString();
    const studyId = crypto.randomUUID();

    await db.insert(studies).values({
      id: studyId,
      organizationId,
      createdById: session.user.id,
      name: validatedData.name,
      description: validatedData.description || null,
      status: "draft",
      questions: JSON.stringify(validatedData.questions),
      panelConfig: validatedData.panelConfig
        ? JSON.stringify(validatedData.panelConfig)
        : null,
      sampleSize: validatedData.sampleSize,
      creditsUsed: 0,
      // Product/Service context fields
      productName: validatedData.productName || null,
      productDescription: validatedData.productDescription || null,
      brandName: validatedData.brandName || null,
      industry: validatedData.industry || null,
      productCategory: validatedData.productCategory || null,
      customContextInstructions: validatedData.customContextInstructions || null,
      createdAt: now,
      updatedAt: now,
    });

    // Fetch the created study
    const [createdStudy] = await db
      .select()
      .from(studies)
      .where(eq(studies.id, studyId));

    return NextResponse.json(
      {
        success: true,
        data: {
          ...createdStudy,
          questions: JSON.parse(createdStudy.questions),
          panelConfig: createdStudy.panelConfig
            ? JSON.parse(createdStudy.panelConfig)
            : null,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating study:", error);

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
        error: "Failed to create study",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
