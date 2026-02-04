import { NextRequest, NextResponse } from "next/server";
import {
  listApiKeys,
  createApiKey,
} from "@/lib/api-keys";
import { logActivity } from "@/lib/activity-logger";
import { CreateApiKeySchema } from "@/lib/validations";
import { validateBody } from "@/lib/validation-helpers";
import { requireSessionWithOrg } from "@/lib/api-helpers";

// GET /api/api-keys - List all API keys for the organization
export async function GET(request: NextRequest) {
  try {
    const { organizationId, error } = await requireSessionWithOrg();
    if (error) return error;

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
    const { session, organizationId, error } = await requireSessionWithOrg();
    if (error) return error;

    const body = await request.json();
    const validated = validateBody(CreateApiKeySchema, body);
    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error, details: validated.details },
        { status: 400 }
      );
    }

    const { name, scopes, expiresAt } = validated.data;

    const result = await createApiKey(
      organizationId,
      name,
      scopes,
      expiresAt
    );

    // Log activity
    await logActivity({
      organizationId,
      userId: session.user.id,
      action: "api_key_created",
      resourceType: "api_key",
      resourceId: result.id,
      metadata: { keyName: name },
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
