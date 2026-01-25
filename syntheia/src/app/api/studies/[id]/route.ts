import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// In-memory store for demo (should match the one in parent route)
// In production, use a proper database
const studies: Map<string, Study> = new Map();

interface Study {
  id: string;
  organizationId: string;
  createdById: string;
  name: string;
  description?: string;
  status: "draft" | "running" | "completed" | "archived";
  questions: Question[];
  panelConfig?: PanelConfig;
  sampleSize: number;
  creditsUsed: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

interface Question {
  id: string;
  type: "likert" | "nps" | "multiple_choice" | "ranking" | "open_ended";
  text: string;
  options?: string[];
  required: boolean;
}

interface PanelConfig {
  preset?: string;
  demographics?: {
    ageRange?: { min: number; max: number };
  };
}

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
      demographics: z
        .object({
          ageRange: z.object({ min: z.number(), max: z.number() }).optional(),
        })
        .optional(),
    })
    .optional(),
  sampleSize: z.number().min(1).max(10000).optional(),
});

// GET /api/studies/[id] - Get a specific study
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const study = studies.get(id);

  if (!study) {
    return NextResponse.json(
      {
        success: false,
        error: "Study not found",
      },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: study,
  });
}

// PATCH /api/studies/[id] - Update a study
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const study = studies.get(id);

    if (!study) {
      return NextResponse.json(
        {
          success: false,
          error: "Study not found",
        },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validatedData = UpdateStudySchema.parse(body);

    // Update study
    const updatedStudy: Study = {
      ...study,
      ...validatedData,
      updatedAt: new Date().toISOString(),
      completedAt:
        validatedData.status === "completed"
          ? new Date().toISOString()
          : study.completedAt,
    };

    studies.set(id, updatedStudy);

    return NextResponse.json({
      success: true,
      data: updatedStudy,
    });
  } catch (error) {
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
  const { id } = await params;
  const study = studies.get(id);

  if (!study) {
    return NextResponse.json(
      {
        success: false,
        error: "Study not found",
      },
      { status: 404 }
    );
  }

  studies.delete(id);

  return NextResponse.json({
    success: true,
    message: "Study deleted successfully",
  });
}
