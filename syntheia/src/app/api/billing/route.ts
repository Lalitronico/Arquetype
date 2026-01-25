import { NextResponse } from "next/server";
import { stripe, PRICING_PLANS } from "@/lib/stripe";
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

// GET /api/billing - Get billing/subscription status
export async function GET() {
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

    let subscription = null;
    let nextBillingDate = null;

    if (org.stripeSubscriptionId) {
      try {
        const stripeSubscription = await stripe.subscriptions.retrieve(
          org.stripeSubscriptionId
        );

        // Access properties - cast to unknown first for newer Stripe SDK types
        const subData = stripeSubscription as unknown as Record<string, unknown>;
        const periodEnd = (subData.current_period_end as number) || 0;

        subscription = {
          id: stripeSubscription.id,
          status: stripeSubscription.status,
          cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
          currentPeriodEnd: periodEnd,
        };

        if (periodEnd > 0) {
          nextBillingDate = new Date(periodEnd * 1000).toISOString();
        }
      } catch (err) {
        console.error("Error fetching subscription:", err);
      }
    }

    const currentPlan = org.plan as keyof typeof PRICING_PLANS;
    const planDetails = PRICING_PLANS[currentPlan] || PRICING_PLANS.starter;

    return NextResponse.json({
      success: true,
      data: {
        organization: {
          id: org.id,
          name: org.name,
          plan: org.plan,
          creditsRemaining: org.creditsRemaining,
          creditsMonthly: org.creditsMonthly,
        },
        planDetails: {
          name: planDetails.name,
          price: planDetails.price,
          credits: planDetails.credits,
          features: planDetails.features,
        },
        subscription,
        nextBillingDate,
        hasActiveSubscription: !!org.stripeSubscriptionId,
      },
    });
  } catch (error) {
    console.error("Billing info error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch billing info",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
