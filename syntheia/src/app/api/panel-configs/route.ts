import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { panelConfigs, organizationMembers } from "@/db/schema";
import { eq, and, or } from "drizzle-orm";
import { generateId } from "@/lib/utils";

// Helper to get organization for user
async function getOrganizationForUser(userId: string): Promise<string | null> {
  const membership = await db
    .select({ organizationId: organizationMembers.organizationId })
    .from(organizationMembers)
    .where(eq(organizationMembers.userId, userId))
    .limit(1);

  return membership[0]?.organizationId || null;
}

// GET /api/panel-configs - List all panel configs for the organization
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const organizationId = await getOrganizationForUser(session.user.id);
    if (!organizationId) {
      return NextResponse.json({ error: "No organization found" }, { status: 404 });
    }

    // Get configs for this organization + public templates
    const configs = await db
      .select()
      .from(panelConfigs)
      .where(
        or(
          eq(panelConfigs.organizationId, organizationId),
          eq(panelConfigs.isTemplate, true)
        )
      )
      .orderBy(panelConfigs.updatedAt);

    // Parse the JSON config field
    const parsedConfigs = configs.map((config) => ({
      ...config,
      config: JSON.parse(config.config),
    }));

    return NextResponse.json({ data: parsedConfigs });
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
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const organizationId = await getOrganizationForUser(session.user.id);
    if (!organizationId) {
      return NextResponse.json({ error: "No organization found" }, { status: 404 });
    }

    const body = await request.json();
    const { name, description, config, industry, isTemplate } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    if (!config || typeof config !== "object") {
      return NextResponse.json(
        { error: "Config is required" },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const newConfig = {
      id: generateId(),
      organizationId,
      name: name.trim(),
      description: description?.trim() || null,
      config: JSON.stringify(config),
      industry: industry?.trim() || null,
      isTemplate: isTemplate || false,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(panelConfigs).values(newConfig);

    return NextResponse.json({
      data: {
        ...newConfig,
        config: config, // Return parsed config
      },
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
