import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { panelConfigs } from "@/db/schema";
import { eq, and, or, like, desc } from "drizzle-orm";
import { generateId } from "@/lib/utils";
import { CreatePanelConfigSchema } from "@/lib/validations";
import { validateBody } from "@/lib/validation-helpers";
import { requireSessionWithOrg } from "@/lib/api-helpers";
import { appCache, TEMPLATES_TTL } from "@/lib/cache";

// GET /api/panel-configs - List all panel configs for the organization
export async function GET(request: NextRequest) {
  try {
    const { organizationId, error } = await requireSessionWithOrg();
    if (error) return error;

    // Get query params
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const industry = searchParams.get("industry");

    // Build conditions
    const conditions = [
      or(
        eq(panelConfigs.organizationId, organizationId),
        eq(panelConfigs.isTemplate, true)
      ),
    ];

    // Add industry filter if provided
    if (industry) {
      conditions.push(eq(panelConfigs.industry, industry));
    }

    // Apply search filter at SQL level instead of in memory
    if (search) {
      conditions.push(
        or(
          like(panelConfigs.name, `%${search}%`),
          like(panelConfigs.description, `%${search}%`)
        )!
      );
    }

    // Get configs for this organization + public templates
    const configs = await db
      .select()
      .from(panelConfigs)
      .where(and(...conditions))
      .orderBy(desc(panelConfigs.updatedAt));

    return NextResponse.json({ data: configs });
  } catch (error) {
    console.error("Error listing panel configs:", error);
    return NextResponse.json(
      { error: "Failed to list panel configurations" },
      { status: 500 }
    );
  }
}

// POST /api/panel-configs - Create a new panel config
export async function POST(request: NextRequest) {
  try {
    const { organizationId, error } = await requireSessionWithOrg();
    if (error) return error;

    const body = await request.json();
    const validated = validateBody(CreatePanelConfigSchema, body);
    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error, details: validated.details },
        { status: 400 }
      );
    }

    const { name, description, config, industry, isTemplate } = validated.data;

    const newConfig = {
      id: generateId(),
      organizationId,
      name,
      description,
      config,
      industry,
      isTemplate,
    };

    await db.insert(panelConfigs).values(newConfig);

    // Invalidate templates cache on mutation
    appCache.invalidatePrefix("templates:");

    return NextResponse.json({
      data: newConfig,
      message: "Panel configuration saved",
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating panel config:", error);
    return NextResponse.json(
      { error: "Failed to create panel configuration" },
      { status: 500 }
    );
  }
}
