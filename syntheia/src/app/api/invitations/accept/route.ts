import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { invitations, organizations, organizationMembers, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { logInvitationAccepted, logMemberJoined } from "@/lib/activity-logger";

const AcceptInvitationSchema = z.object({
  token: z.string().min(1),
});

async function getSession() {
  const headersList = await headers();
  return auth.api.getSession({ headers: headersList });
}

// POST /api/invitations/accept - Accept an invitation
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Please sign in to accept this invitation" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = AcceptInvitationSchema.parse(body);

    // Get the invitation by token
    const [invitation] = await db
      .select()
      .from(invitations)
      .where(eq(invitations.token, validatedData.token))
      .limit(1);

    if (!invitation) {
      return NextResponse.json(
        { success: false, error: "Invalid invitation" },
        { status: 404 }
      );
    }

    // Check if invitation is still valid
    if (invitation.status !== "pending") {
      return NextResponse.json(
        { success: false, error: `This invitation has been ${invitation.status}` },
        { status: 400 }
      );
    }

    // Check if invitation has expired
    const expiresAt = new Date(invitation.expiresAt);
    if (expiresAt < new Date()) {
      return NextResponse.json(
        { success: false, error: "This invitation has expired" },
        { status: 400 }
      );
    }

    // Verify the email matches (or allow any authenticated user to accept)
    // For security, we'll check if the email matches
    if (session.user.email !== invitation.email) {
      return NextResponse.json(
        {
          success: false,
          error: `This invitation was sent to ${invitation.email}. Please sign in with that email address.`
        },
        { status: 403 }
      );
    }

    // Check if user is already a member
    const existingMembership = await db
      .select()
      .from(organizationMembers)
      .where(eq(organizationMembers.userId, session.user.id))
      .limit(1);

    // If user already has an organization, we need to handle this
    // For now, we'll allow users to join multiple organizations
    // But check if they're already in THIS organization
    const existingOrgMembership = await db
      .select()
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.organizationId, invitation.organizationId),
          eq(organizationMembers.userId, session.user.id)
        )
      )
      .limit(1);

    if (existingOrgMembership.length > 0) {
      // Update invitation status to accepted anyway
      await db
        .update(invitations)
        .set({
          status: "accepted",
          acceptedAt: new Date(),
        })
        .where(eq(invitations.id, invitation.id));

      return NextResponse.json(
        { success: false, error: "You are already a member of this organization" },
        { status: 400 }
      );
    }

    // Create the membership
    const membershipId = crypto.randomUUID();
    await db.insert(organizationMembers).values({
      id: membershipId,
      organizationId: invitation.organizationId,
      userId: session.user.id,
      role: invitation.role,
      createdAt: new Date(),
    });

    // Update invitation status
    await db
      .update(invitations)
      .set({
        status: "accepted",
        acceptedAt: new Date(),
      })
      .where(eq(invitations.id, invitation.id));

    // Get organization details for response
    const [organization] = await db
      .select({ name: organizations.name, slug: organizations.slug })
      .from(organizations)
      .where(eq(organizations.id, invitation.organizationId))
      .limit(1);

    // Log activities
    await logInvitationAccepted(
      invitation.organizationId,
      session.user.id,
      invitation.id,
      session.user.email || ""
    );

    await logMemberJoined(
      invitation.organizationId,
      session.user.id,
      session.user.name || session.user.email || "Unknown",
      invitation.role
    );

    return NextResponse.json({
      success: true,
      message: "Successfully joined the organization",
      data: {
        organizationId: invitation.organizationId,
        organizationName: organization?.name,
        role: invitation.role,
      },
    });
  } catch (error) {
    console.error("Error accepting invitation:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid request", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to accept invitation" },
      { status: 500 }
    );
  }
}

// GET /api/invitations/accept?token=xxx - Get invitation details by token (public)
export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Token is required" },
        { status: 400 }
      );
    }

    // Get the invitation by token
    const [invitation] = await db
      .select({
        id: invitations.id,
        email: invitations.email,
        role: invitations.role,
        status: invitations.status,
        expiresAt: invitations.expiresAt,
        organizationId: invitations.organizationId,
      })
      .from(invitations)
      .where(eq(invitations.token, token))
      .limit(1);

    if (!invitation) {
      return NextResponse.json(
        { success: false, error: "Invalid invitation" },
        { status: 404 }
      );
    }

    // Get organization details
    const [organization] = await db
      .select({ name: organizations.name })
      .from(organizations)
      .where(eq(organizations.id, invitation.organizationId))
      .limit(1);

    // Get inviter details
    const [inviter] = await db
      .select({
        name: users.name,
        email: users.email
      })
      .from(invitations)
      .innerJoin(users, eq(invitations.invitedBy, users.id))
      .where(eq(invitations.token, token))
      .limit(1);

    return NextResponse.json({
      success: true,
      data: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        status: invitation.status,
        expiresAt: invitation.expiresAt,
        organization: {
          name: organization?.name,
        },
        invitedBy: {
          name: inviter?.name || inviter?.email,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching invitation:", error);

    return NextResponse.json(
      { success: false, error: "Failed to fetch invitation" },
      { status: 500 }
    );
  }
}
