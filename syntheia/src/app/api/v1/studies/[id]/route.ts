import { NextRequest, NextResponse } from "next/server";
import { withApiKey, ApiContext, hasScope } from "@/lib/api-middleware";
import { db } from "@/db";
import { studies } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { V1UpdateStudySchema } from "@/lib/validations";
import { validateBody } from "@/lib/validation-helpers";

// GET /api/v1/studies/:id - Get study details
async function handleGet(
  request: NextRequest,
  context: ApiContext,
  params?: { id?: string }
): Promise<NextResponse> {
  if (!hasScope(context.scopes, "read")) {
    return NextResponse.json(
      { error: "Insufficient permissions. Required scope: read" },
      { status: 403 }
    );
  }

  const studyId = params?.id;
  if (!studyId) {
    return NextResponse.json({ error: "Study ID required" }, { status: 400 });
  }

  const study = await db
    .select()
    .from(studies)
    .where(
      and(
        eq(studies.id, studyId),
        eq(studies.organizationId, context.organizationId)
      )
    )
    .limit(1)
    .then((rows) => rows[0]);

  if (!study) {
    return NextResponse.json({ error: "Study not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: study.id,
    name: study.name,
    description: study.description,
    status: study.status,
    questions: study.questions,
    panelConfig: study.panelConfig,
    sampleSize: study.sampleSize,
    creditsUsed: study.creditsUsed,
    createdAt: study.createdAt,
    updatedAt: study.updatedAt,
    completedAt: study.completedAt,
  });
}

// PATCH /api/v1/studies/:id - Update study
async function handlePatch(
  request: NextRequest,
  context: ApiContext,
  params?: { id?: string }
): Promise<NextResponse> {
  if (!hasScope(context.scopes, "write")) {
    return NextResponse.json(
      { error: "Insufficient permissions. Required scope: write" },
      { status: 403 }
    );
  }

  const studyId = params?.id;
  if (!studyId) {
    return NextResponse.json({ error: "Study ID required" }, { status: 400 });
  }

  // Check study exists and belongs to org
  const existing = await db
    .select()
    .from(studies)
    .where(
      and(
        eq(studies.id, studyId),
        eq(studies.organizationId, context.organizationId)
      )
    )
    .limit(1)
    .then((rows) => rows[0]);

  if (!existing) {
    return NextResponse.json({ error: "Study not found" }, { status: 404 });
  }

  if (existing.status !== "draft") {
    return NextResponse.json(
      { error: "Only draft studies can be updated" },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const validated = validateBody(V1UpdateStudySchema, body);
    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error, details: validated.details },
        { status: 400 }
      );
    }

    const { name, description, questions, panelConfig, sampleSize } = validated.data;

    const updates: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (questions !== undefined) updates.questions = questions;
    if (panelConfig !== undefined) updates.panelConfig = panelConfig || null;
    if (sampleSize !== undefined) updates.sampleSize = sampleSize;

    await db
      .update(studies)
      .set(updates)
      .where(eq(studies.id, studyId));

    return NextResponse.json({
      id: studyId,
      message: "Study updated successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}

// DELETE /api/v1/studies/:id - Delete study
async function handleDelete(
  request: NextRequest,
  context: ApiContext,
  params?: { id?: string }
): Promise<NextResponse> {
  if (!hasScope(context.scopes, "write")) {
    return NextResponse.json(
      { error: "Insufficient permissions. Required scope: write" },
      { status: 403 }
    );
  }

  const studyId = params?.id;
  if (!studyId) {
    return NextResponse.json({ error: "Study ID required" }, { status: 400 });
  }

  const existing = await db
    .select()
    .from(studies)
    .where(
      and(
        eq(studies.id, studyId),
        eq(studies.organizationId, context.organizationId)
      )
    )
    .limit(1)
    .then((rows) => rows[0]);

  if (!existing) {
    return NextResponse.json({ error: "Study not found" }, { status: 404 });
  }

  await db.delete(studies).where(eq(studies.id, studyId));

  return NextResponse.json({
    message: "Study deleted successfully",
  });
}

export const GET = withApiKey(handleGet);
export const PATCH = withApiKey(handlePatch);
export const DELETE = withApiKey(handleDelete);
