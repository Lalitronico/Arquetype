import { NextRequest, NextResponse } from "next/server";
import { withApiKey, ApiContext, hasScope } from "@/lib/api-middleware";
import { db } from "@/db";
import { studies } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

// GET /api/v1/studies - List all studies
async function handleGet(
  request: NextRequest,
  context: ApiContext
): Promise<NextResponse> {
  if (!hasScope(context.scopes, "read")) {
    return NextResponse.json(
      { error: "Insufficient permissions. Required scope: read" },
      { status: 403 }
    );
  }

  const url = new URL(request.url);
  const limit = parseInt(url.searchParams.get("limit") || "20");
  const offset = parseInt(url.searchParams.get("offset") || "0");
  const status = url.searchParams.get("status");

  let query = db
    .select({
      id: studies.id,
      name: studies.name,
      description: studies.description,
      status: studies.status,
      sampleSize: studies.sampleSize,
      creditsUsed: studies.creditsUsed,
      createdAt: studies.createdAt,
      updatedAt: studies.updatedAt,
      completedAt: studies.completedAt,
    })
    .from(studies)
    .where(eq(studies.organizationId, context.organizationId))
    .orderBy(desc(studies.createdAt))
    .limit(Math.min(limit, 100))
    .offset(offset);

  const results = await query.all();

  // Filter by status if provided
  const filteredResults = status
    ? results.filter((s) => s.status === status)
    : results;

  return NextResponse.json({
    data: filteredResults,
    pagination: {
      limit,
      offset,
      total: filteredResults.length,
    },
  });
}

// POST /api/v1/studies - Create a new study
async function handlePost(
  request: NextRequest,
  context: ApiContext
): Promise<NextResponse> {
  if (!hasScope(context.scopes, "write")) {
    return NextResponse.json(
      { error: "Insufficient permissions. Required scope: write" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { name, description, questions, panelConfig, sampleSize } = body;

    // Validation
    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "name is required and must be a string" },
        { status: 400 }
      );
    }

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { error: "questions is required and must be a non-empty array" },
        { status: 400 }
      );
    }

    // Validate each question
    for (const q of questions) {
      if (!q.id || !q.text || !q.type) {
        return NextResponse.json(
          { error: "Each question must have id, text, and type" },
          { status: 400 }
        );
      }
      if (!["rating", "open", "multiple_choice"].includes(q.type)) {
        return NextResponse.json(
          { error: `Invalid question type: ${q.type}. Valid types: rating, open, multiple_choice` },
          { status: 400 }
        );
      }
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await db.insert(studies).values({
      id,
      organizationId: context.organizationId,
      createdById: context.apiKeyId, // Use API key ID as creator for API-created studies
      name,
      description: description || null,
      questions: JSON.stringify(questions),
      panelConfig: panelConfig ? JSON.stringify(panelConfig) : null,
      sampleSize: sampleSize || 100,
      status: "draft",
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json(
      {
        id,
        name,
        description,
        status: "draft",
        sampleSize: sampleSize || 100,
        createdAt: now,
        message: "Study created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("API v1 create study error:", error);
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}

// Export handlers wrapped with API key middleware
export const GET = withApiKey(handleGet);
export const POST = withApiKey(handlePost);
