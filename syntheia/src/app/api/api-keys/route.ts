import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  listApiKeys,
  createApiKey,
  getOrganizationForUser,
} from "@/lib/api-keys";
import { logActivity } from "@/lib/activity-logger";

// GET /api/api-keys - List all API keys for the organization
export async function GET(request: NextRequest) {
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

    const keys = await listApiKeys(organizationId);

    return NextResponse.json({ keys });
  } catch (error) {
    console.error("Error listing API keys:", error);
    return NextResponse.json(
      { error: "Failed to list API keys" },
      { status: 500 }
    );
  }
}

// POST /api/api-keys - Create a new API key
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
    const { name, scopes, expiresAt } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const result = await createApiKey(
      organizationId,
      name.trim(),
      scopes || ["read", "write"],
      expiresAt
    );

    // Log activity
    await logActivity({
      organizationId,
      userId: session.user.id,
      action: "api_key_created",
      resourceType: "api_key",
      resourceId: result.id,
      metadata: { keyName: name.trim() },
    });

    return NextResponse.json({
      id: result.id,
      key: result.key, // Only returned once!
      prefix: result.prefix,
      message: "API key created. Save it now - you won't be able to see it again.",
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating API key:", error);
    return NextResponse.json(
      { error: "Failed to create API key" },
      { status: 500 }
    );
  }
}
