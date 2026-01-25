import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateId } from "@/lib/utils";

// In-memory store for demo (replace with database in production)
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
    genderDistribution?: { male: number; female: number; nonBinary: number };
    locations?: string[];
  };
  context?: {
    industry?: string;
    productExperience?: string[];
  };
}

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
});

// GET /api/studies - List all studies
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get("status");
  const limit = parseInt(searchParams.get("limit") || "50");
  const offset = parseInt(searchParams.get("offset") || "0");

  let studiesList = Array.from(studies.values());

  // Filter by status if provided
  if (status) {
    studiesList = studiesList.filter((s) => s.status === status);
  }

  // Sort by creation date (newest first)
  studiesList.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Pagination
  const total = studiesList.length;
  const paginatedStudies = studiesList.slice(offset, offset + limit);

  return NextResponse.json({
    success: true,
    data: paginatedStudies,
    pagination: {
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    },
  });
}

// POST /api/studies - Create a new study
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = CreateStudySchema.parse(body);

    const now = new Date().toISOString();
    const study: Study = {
      id: generateId(),
      organizationId: "org_demo", // In production, get from auth
      createdById: "user_demo", // In production, get from auth
      name: validatedData.name,
      description: validatedData.description,
      status: "draft",
      questions: validatedData.questions,
      panelConfig: validatedData.panelConfig,
      sampleSize: validatedData.sampleSize,
      creditsUsed: 0,
      createdAt: now,
      updatedAt: now,
    };

    studies.set(study.id, study);

    return NextResponse.json(
      {
        success: true,
        data: study,
      },
      { status: 201 }
    );
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
        error: "Failed to create study",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
