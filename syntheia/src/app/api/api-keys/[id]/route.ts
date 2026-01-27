import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revokeApiKey, getOrganizationForUser } from "@/lib/api-keys";
import { logActivity } from "@/lib/activity-logger";

// DELETE /api/api-keys/[id] - Revoke an API key
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

    await revokeApiKey(id, organizationId);

    // Log activity
    await logActivity({
      organizationId,
      userId: session.user.id,
      action: "api_key_revoked",
      resourceType: "api_key",
      resourceId: id,
    });

    return NextResponse.json({ message: "API key revoked" });
  } catch (error) {
    console.error("Error revoking API key:", error);
    return NextResponse.json(
      { error: "Failed to revoke API key" },
      { status: 500 }
    );
  }
}
