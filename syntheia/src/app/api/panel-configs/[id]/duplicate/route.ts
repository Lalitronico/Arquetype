import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { panelConfigs, organizationMembers } from "@/db/schema";
import { eq, or } from "drizzle-orm";
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

// POST /api/panel-configs/[id]/duplicate - Duplicate a panel config
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    // Get the original config
    const original = await db
      .select()
      .from(panelConfigs)
      .where(eq(panelConfigs.id, id))
      .limit(1);

    if (original.length === 0) {
      return NextResponse.json({ error: "Panel config not found" }, { status: 404 });
    }

    // Check access - must belong to org or be a template
    if (original[0].organizationId !== organizationId && !original[0].isTemplate) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { name } = body;

    const newName = name?.trim() || `${original[0].name} (Copy)`;

    const now = new Date().toISOString();
    const newConfig = {
      id: generateId(),
      organizationId,
      name: newName,
      description: original[0].description,
      config: original[0].config, // Keep the JSON string as is
      industry: original[0].industry,
      isTemplate: false, // Duplicated configs are never templates
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(panelConfigs).values(newConfig);

    return NextResponse.json({
      data: {
        ...newConfig,
        config: JSON.parse(newConfig.config),
      },
      message: "Panel configuration duplicated",
    }, { status: 201 });
  } catch (error) {
    console.error("Error duplicating panel config:", error);
    return NextResponse.json(
      { error: "Failed to duplicate panel configuration" },
      { status: 500 }
    );
  }
}
