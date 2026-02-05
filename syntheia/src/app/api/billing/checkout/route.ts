import { NextRequest, NextResponse } from "next/server";
import { stripe, PRICING_PLANS, PlanName } from "@/lib/stripe";
import { db } from "@/db";
import { organizations, organizationMembers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

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

  if (!membership[0]) return null;

  const [org] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, membership[0].organizationId));

  return org;
}

// POST /api/billing/checkout - Create Stripe checkout session
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const org = await getUserOrganization(session.user.id);
    if (!org) {
      return NextResponse.json(
        { success: false, error: "No organization found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { plan } = body as { plan: PlanName };

    if (!plan || !PRICING_PLANS[plan]) {
      return NextResponse.json(
        { success: false, error: "Invalid plan" },
        { status: 400 }
      );
    }

    const priceId = PRICING_PLANS[plan].priceId;
    if (!priceId) {
      return NextResponse.json(
        { success: false, error: "Price not configured" },
        { status: 500 }
      );
    }

    // Create or get Stripe customer
    let customerId = org.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.user.email || undefined,
        name: org.name,
        metadata: {
          organizationId: org.id,
        },
      });

      customerId = customer.id;

      // Save customer ID to database
      await db
        .update(organizations)
        .set({
          stripeCustomerId: customerId,
          updatedAt: new Date(),
        })
        .where(eq(organizations.id, org.id));
    }

    // Create checkout session
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/dashboard/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/dashboard/billing?canceled=true`,
      metadata: {
        organizationId: org.id,
        plan: plan,
      },
      subscription_data: {
        metadata: {
          organizationId: org.id,
          plan: plan,
        },
      },
    });

    return NextResponse.json({
      success: true,
      url: checkoutSession.url,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create checkout session",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
