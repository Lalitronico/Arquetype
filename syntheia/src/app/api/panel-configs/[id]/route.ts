import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { panelConfigs, organizationMembers } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// Helper to get organization for user
async function getOrganizationForUser(userId: string): Promise<string | null> {
  const membership = await db
    .select({ organizationId: organizationMembers.organizationId })
    .from(organizationMembers)
    .where(eq(organizationMembers.userId, userId))
    .limit(1);

  return membership[0]?.organizationId || null;
}

// GET /api/panel-configs/[id] - Get a specific panel config
export async function GET(
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

    const config = await db
      .select()
      .from(panelConfigs)
      .where(eq(panelConfigs.id, id))
      .limit(1);

    if (config.length === 0) {
      return NextResponse.json({ error: "Panel config not found" }, { status: 404 });
    }

    // Check access - must belong to org or be a template
    if (config[0].organizationId !== organizationId && !config[0].isTemplate) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json({
      data: {
        ...config[0],
        config: JSON.parse(config[0].config),
      },
    });
  } catch (error) {
    console.error("Error getting panel config:", error);
    return NextResponse.json(
      { error: "Failed to get panel configuration" },
      { status: 500 }
    );
  }
}

// PUT /api/panel-configs/[id] - Update a panel config
export async function PUT(
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

    // Get existing config
    const existing = await db
      .select()
      .from(panelConfigs)
      .where(
        and(
          eq(panelConfigs.id, id),
          eq(panelConfigs.organizationId, organizationId)
        )
      )
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ error: "Panel config not found" }, { status: 404 });
    }

    // Can't update templates
    if (existing[0].isTemplate) {
      return NextResponse.json({ error: "Cannot update templates" }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, config, industry } = body;

    const updates: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length === 0) {
        return NextResponse.json(
          { error: "Name cannot be empty" },
          { status: 400 }
        );
      }
      updates.name = name.trim();
    }

    if (description !== undefined) {
      updates.description = description?.trim() || null;
    }

    if (config !== undefined) {
      if (typeof config !== "object") {
        return NextResponse.json(
          { error: "Config must be an object" },
          { status: 400 }
        );
      }
      updates.config = JSON.stringify(config);
    }

    if (industry !== undefined) {
      updates.industry = industry?.trim() || null;
    }

    await db
      .update(panelConfigs)
      .set(updates)
      .where(eq(panelConfigs.id, id));

    // Get updated config
    const updated = await db
      .select()
      .from(panelConfigs)
      .where(eq(panelConfigs.id, id))
      .limit(1);

    return NextResponse.json({
      data: {
        ...updated[0],
        config: JSON.parse(updated[0].config),
      },
      message: "Panel configuration updated",
    });
  } catch (error) {
    console.error("Error updating panel config:", error);
    return NextResponse.json(
      { error: "Failed to update panel configuration" },
      { status: 500 }
    );
  }
}

// DELETE /api/panel-configs/[id] - Delete a panel config
export async function DELETE(
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

    // Get existing config
    const existing = await db
      .select()
      .from(panelConfigs)
      .where(
        and(
          eq(panelConfigs.id, id),
          eq(panelConfigs.organizationId, organizationId)
        )
      )
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ error: "Panel config not found" }, { status: 404 });
    }

    // Can't delete templates
    if (existing[0].isTemplate) {
      return NextResponse.json({ error: "Cannot delete templates" }, { status: 403 });
    }

    await db.delete(panelConfigs).where(eq(panelConfigs.id, id));

    return NextResponse.json({ message: "Panel configuration deleted" });
  } catch (error) {
    console.error("Error deleting panel config:", error);
    return NextResponse.json(
      { error: "Failed to delete panel configuration" },
      { status: 500 }
    );
  }
}
