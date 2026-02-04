import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-server";
import { db } from "@/db";
import { users, accounts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { UpdateUserSchema } from "@/lib/validations";
import { validateBody } from "@/lib/validation-helpers";

// GET /api/user - Get current user profile
export async function GET() {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Check if user has password auth (email/password)
    const userAccounts = await db.query.accounts.findMany({
      where: eq(accounts.userId, session.user.id),
    });

    const hasPasswordAuth = userAccounts.some(
      (account) => account.providerId === "credential"
    );

    const oauthProviders = userAccounts
      .filter((account) => account.providerId !== "credential")
      .map((account) => account.providerId);

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        hasPasswordAuth,
        oauthProviders,
      },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

// PATCH /api/user - Update current user profile
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validated = validateBody(UpdateUserSchema, body);
    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: validated.error, details: validated.details },
        { status: 400 }
      );
    }

    const { name, image } = validated.data;

    // Build update object with only provided fields
    const updateData: { name?: string; image?: string | null; updatedAt: string } = {
      updatedAt: new Date().toISOString(),
    };

    if (name !== undefined) {
      updateData.name = name;
    }

    if (image !== undefined) {
      updateData.image = image;
    }

    // Update user
    await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, session.user.id));

    // Fetch updated user
    const updatedUser = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updatedUser?.id,
        email: updatedUser?.email,
        name: updatedUser?.name,
        image: updatedUser?.image,
      },
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update user" },
      { status: 500 }
    );
  }
}
