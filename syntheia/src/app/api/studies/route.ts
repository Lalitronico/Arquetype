import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { studies } from "@/db/schema";
import { eq, desc, and, count } from "drizzle-orm";
import { logStudyCreated } from "@/lib/activity-logger";
import { CreateStudySchema } from "@/lib/validations";
import { requireSessionWithOrg } from "@/lib/api-helpers";

// GET /api/studies - List all studies
export async function GET(request: NextRequest) {
  try {
    const { organizationId, error } = await requireSessionWithOrg();
    if (error) return error;

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Build query
    const conditions = [eq(studies.organizationId, organizationId)];
    if (status) {
      conditions.push(eq(studies.status, status));
    }

    // Select only list-view columns (skip large JSON blobs)
    const studiesList = await db
      .select({
        id: studies.id,
        organizationId: studies.organizationId,
        createdById: studies.createdById,
        name: studies.name,
        description: studies.description,
        status: studies.status,
        sampleSize: studies.sampleSize,
        creditsUsed: studies.creditsUsed,
        productName: studies.productName,
        brandName: studies.brandName,
        industry: studies.industry,
        productCategory: studies.productCategory,
        currentPersona: studies.currentPersona,
        simulationStartedAt: studies.simulationStartedAt,
        createdAt: studies.createdAt,
        updatedAt: studies.updatedAt,
        completedAt: studies.completedAt,
        cancelledAt: studies.cancelledAt,
      })
      .from(studies)
      .where(and(...conditions))
      .orderBy(desc(studies.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count with SQL COUNT instead of fetching all rows
    const [{ total }] = await db
      .select({ total: count() })
      .from(studies)
      .where(and(...conditions));

    return NextResponse.json({
      success: true,
      data: studiesList,
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
    const { session, organizationId, error } = await requireSessionWithOrg();
    if (error) return error;

    const body = await request.json();
    const validatedData = CreateStudySchema.parse(body);

    const studyId = crypto.randomUUID();

    await db.insert(studies).values({
      id: studyId,
      organizationId,
      createdById: session.user.id,
      name: validatedData.name,
      description: validatedData.description || null,
      status: "draft",
      questions: validatedData.questions,
      panelConfig: validatedData.panelConfig || null,
      sampleSize: validatedData.sampleSize,
      creditsUsed: 0,
      productName: validatedData.productName || null,
      productDescription: validatedData.productDescription || null,
      brandName: validatedData.brandName || null,
      industry: validatedData.industry || null,
      productCategory: validatedData.productCategory || null,
      customContextInstructions: validatedData.customContextInstructions || null,
    });

    // Fetch the created study
    const [createdStudy] = await db
      .select()
      .from(studies)
      .where(eq(studies.id, studyId));

    // Log activity
    await logStudyCreated(organizationId, session.user.id, studyId, validatedData.name);

    return NextResponse.json(
      {
        success: true,
        data: createdStudy,
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
