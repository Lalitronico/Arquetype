import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { invitations, organizationMembers, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { requirePermission } from "@/lib/permissions";
import { logInvitationSent } from "@/lib/activity-logger";

const CreateInvitationSchema = z.object({
  email: z.string().email(),
  role: z.enum(["admin", "member"]).default("member"),
});

async function getSession() {
  const headersList = await headers();
  return auth.api.getSession({ headers: headersList });
}

async function getUserOrganization(userId: string) {
  const membership = await db
    .select()
    .from(organizationMembers)
    .where(eq(organizationMembers.userId, userId))
    .limit(1);

  return membership[0]?.organizationId;
}

// Generate a secure random token
function generateToken(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  const randomValues = new Uint8Array(32);
  crypto.getRandomValues(randomValues);
  for (let i = 0; i < 32; i++) {
    token += chars[randomValues[i] % chars.length];
  }
  return token;
}

// GET /api/invitations - List pending invitations
export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const organizationId = await getUserOrganization(session.user.id);
    if (!organizationId) {
      return NextResponse.json(
        { success: false, error: "No organization found" },
        { status: 404 }
      );
    }

    // Check permission
    await requirePermission(session.user.id, organizationId, "members:invite");

    // Get all invitations with inviter details
    const invitationList = await db
      .select({
        id: invitations.id,
        email: invitations.email,
        role: invitations.role,
        status: invitations.status,
        expiresAt: invitations.expiresAt,
        createdAt: invitations.createdAt,
        acceptedAt: invitations.acceptedAt,
        invitedBy: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(invitations)
      .innerJoin(users, eq(invitations.invitedBy, users.id))
      .where(eq(invitations.organizationId, organizationId));

    return NextResponse.json({
      success: true,
      data: invitationList,
    });
  } catch (error) {
    console.error("Error fetching invitations:", error);

    if (error instanceof Error && error.name === "PermissionError") {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to fetch invitations" },
      { status: 500 }
    );
  }
}

// POST /api/invitations - Create a new invitation
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const organizationId = await getUserOrganization(session.user.id);
    if (!organizationId) {
      return NextResponse.json(
        { success: false, error: "No organization found" },
        { status: 404 }
      );
    }

    // Check permission
    await requirePermission(session.user.id, organizationId, "members:invite");

    const body = await request.json();
    const validatedData = CreateInvitationSchema.parse(body);

    // Check if email is already a member
    const existingMember = await db
      .select({ id: users.id })
      .from(users)
      .innerJoin(organizationMembers, eq(users.id, organizationMembers.userId))
      .where(
        and(
          eq(users.email, validatedData.email),
          eq(organizationMembers.organizationId, organizationId)
        )
      )
      .limit(1);

    if (existingMember.length > 0) {
      return NextResponse.json(
        { success: false, error: "User is already a member of this organization" },
        { status: 400 }
      );
    }

    // Check if there's already a pending invitation for this email
    const existingInvitation = await db
      .select({ id: invitations.id })
      .from(invitations)
      .where(
        and(
          eq(invitations.email, validatedData.email),
          eq(invitations.organizationId, organizationId),
          eq(invitations.status, "pending")
        )
      )
      .limit(1);

    if (existingInvitation.length > 0) {
      return NextResponse.json(
        { success: false, error: "A pending invitation already exists for this email" },
        { status: 400 }
      );
    }

    // Create the invitation
    const invitationId = crypto.randomUUID();
    const token = generateToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

    await db.insert(invitations).values({
      id: invitationId,
      organizationId,
      email: validatedData.email,
      role: validatedData.role,
      invitedBy: session.user.id,
      token,
      status: "pending",
      expiresAt,
      createdAt: new Date(),
    });

    // Log the activity
    await logInvitationSent(
      organizationId,
      session.user.id,
      invitationId,
      validatedData.email,
      validatedData.role
    );

    // Return the invitation with the token (for sharing the link)
    return NextResponse.json(
      {
        success: true,
        data: {
          id: invitationId,
          email: validatedData.email,
          role: validatedData.role,
          token,
          expiresAt: expiresAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating invitation:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.name === "PermissionError") {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to create invitation" },
      { status: 500 }
    );
  }
}
