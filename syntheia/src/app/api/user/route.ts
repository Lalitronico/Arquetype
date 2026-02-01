import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-server";
import { db } from "@/db";
import { users, accounts } from "@/db/schema";
import { eq } from "drizzle-orm";

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
    const { name, image } = body;

    // Build update object with only provided fields
    const updateData: { name?: string; image?: string; updatedAt: string } = {
      updatedAt: new Date().toISOString(),
    };

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length === 0) {
        return NextResponse.json(
          { success: false, error: "Name must be a non-empty string" },
          { status: 400 }
        );
      }
      if (name.length > 100) {
        return NextResponse.json(
          { success: false, error: "Name must be 100 characters or less" },
          { status: 400 }
        );
      }
      updateData.name = name.trim();
    }

    if (image !== undefined) {
      if (image !== null && typeof image !== "string") {
        return NextResponse.json(
          { success: false, error: "Image must be a string URL or null" },
          { status: 400 }
        );
      }
      // Basic URL validation for image
      if (image && !image.startsWith("http://") && !image.startsWith("https://") && !image.startsWith("data:")) {
        return NextResponse.json(
          { success: false, error: "Image must be a valid URL" },
          { status: 400 }
        );
      }
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
