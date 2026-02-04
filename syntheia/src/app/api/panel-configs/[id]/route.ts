import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { panelConfigs } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { UpdatePanelConfigSchema } from "@/lib/validations";
import { validateBody } from "@/lib/validation-helpers";
import { requireSessionWithOrg } from "@/lib/api-helpers";
import { appCache } from "@/lib/cache";

// GET /api/panel-configs/[id] - Get a specific panel config
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { organizationId, error } = await requireSessionWithOrg();
    if (error) return error;

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
    const { organizationId, error } = await requireSessionWithOrg();
    if (error) return error;

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
    const validated = validateBody(UpdatePanelConfigSchema, body);
    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error, details: validated.details },
        { status: 400 }
      );
    }

    const { name, description, config, industry } = validated.data;

    const updates: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };

    if (name !== undefined) {
      updates.name = name;
    }

    if (description !== undefined) {
      updates.description = description;
    }

    if (config !== undefined) {
      updates.config = JSON.stringify(config);
    }

    if (industry !== undefined) {
      updates.industry = industry;
    }

    await db
      .update(panelConfigs)
      .set(updates)
      .where(eq(panelConfigs.id, id));

    // Invalidate templates cache on mutation
    appCache.invalidatePrefix("templates:");

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
    const { organizationId, error } = await requireSessionWithOrg();
    if (error) return error;

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

    // Invalidate templates cache on mutation
    appCache.invalidatePrefix("templates:");

    return NextResponse.json({ message: "Panel configuration deleted" });
  } catch (error) {
    console.error("Error deleting panel config:", error);
    return NextResponse.json(
      { error: "Failed to delete panel configuration" },
      { status: 500 }
    );
  }
}
