import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "./api-keys";
import { db } from "@/db";
import { apiUsageLogs } from "@/db/schema";

export interface ApiContext {
  organizationId: string;
  apiKeyId: string;
  scopes: string[];
}

type ApiHandler = (
  request: NextRequest,
  context: ApiContext,
  params?: { id?: string }
) => Promise<NextResponse>;

// Middleware wrapper for API key authentication
export function withApiKey(handler: ApiHandler) {
  return async (
    request: NextRequest,
    routeContext?: { params: Promise<{ id?: string }> }
  ): Promise<NextResponse> => {
    // Extract API key from Authorization header
    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        { error: "Missing Authorization header" },
        { status: 401 }
      );
    }

    const [scheme, token] = authHeader.split(" ");

    if (scheme.toLowerCase() !== "bearer" || !token) {
      return NextResponse.json(
        { error: "Invalid Authorization header format. Use: Bearer <api_key>" },
        { status: 401 }
      );
    }

    // Validate the API key
    const validation = await validateApiKey(token);

    if (!validation.valid || !validation.organizationId || !validation.apiKeyId) {
      return NextResponse.json(
        { error: "Invalid or expired API key" },
        { status: 401 }
      );
    }

    // Build the context
    const context: ApiContext = {
      organizationId: validation.organizationId,
      apiKeyId: validation.apiKeyId,
      scopes: validation.scopes || [],
    };

    // Get route params if available
    const params = routeContext ? await routeContext.params : undefined;

    // Call the handler
    return handler(request, context, params);
  };
}

// Log API usage
export async function logApiUsage(
  organizationId: string,
  apiKeyId: string,
  endpoint: string,
  creditsUsed: number,
  studyId?: string,
  metadata?: Record<string, unknown>
) {
  await db.insert(apiUsageLogs).values({
    id: crypto.randomUUID(),
    organizationId,
    apiKeyId,
    studyId,
    endpoint,
    creditsUsed,
    metadata: metadata ?? null,
    createdAt: new Date(),
  });
}

// Check if scope is allowed
export function hasScope(scopes: string[], required: string): boolean {
  return scopes.includes(required) || scopes.includes("*");
}
