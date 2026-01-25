import { NextRequest, NextResponse } from "next/server";
import { stripe, getPlanByPriceId, getCreditsForPlan } from "@/lib/stripe";
import { db } from "@/db";
import { organizations } from "@/db/schema";
import { eq } from "drizzle-orm";
import Stripe from "stripe";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// POST /api/billing/webhook - Handle Stripe webhook events
export async function POST(request: NextRequest) {
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "No signature provided" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const organizationId = session.metadata?.organizationId;
        const plan = session.metadata?.plan;

        if (organizationId && plan && session.subscription) {
          const credits = getCreditsForPlan(plan as "starter" | "growth" | "scale");

          await db
            .update(organizations)
            .set({
              plan: plan,
              stripeSubscriptionId: session.subscription as string,
              creditsRemaining: credits,
              creditsMonthly: credits,
              updatedAt: now,
            })
            .where(eq(organizations.id, organizationId));

          console.log(`Organization ${organizationId} upgraded to ${plan}`);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const organizationId = subscription.metadata?.organizationId;

        if (organizationId) {
          const priceId = subscription.items.data[0]?.price.id;
          const plan = priceId ? getPlanByPriceId(priceId) : null;

          if (plan) {
            const credits = getCreditsForPlan(plan);

            await db
              .update(organizations)
              .set({
                plan: plan,
                creditsMonthly: credits,
                updatedAt: now,
              })
              .where(eq(organizations.id, organizationId));

            console.log(`Organization ${organizationId} subscription updated to ${plan}`);
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const organizationId = subscription.metadata?.organizationId;

        if (organizationId) {
          // Downgrade to starter (free tier)
          await db
            .update(organizations)
            .set({
              plan: "starter",
              stripeSubscriptionId: null,
              creditsMonthly: 1000,
              updatedAt: now,
            })
            .where(eq(organizations.id, organizationId));

          console.log(`Organization ${organizationId} subscription canceled`);
        }
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as unknown as Record<string, unknown>;
        const subscriptionId = invoice.subscription as string | null;

        if (subscriptionId) {
          // Get subscription to find organization
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const organizationId = subscription.metadata?.organizationId;

          if (organizationId) {
            const priceId = subscription.items.data[0]?.price.id;
            const plan = priceId ? getPlanByPriceId(priceId) : null;

            if (plan) {
              const credits = getCreditsForPlan(plan);

              // Reset monthly credits on invoice payment
              await db
                .update(organizations)
                .set({
                  creditsRemaining: credits,
                  updatedAt: now,
                })
                .where(eq(organizations.id, organizationId));

              console.log(`Organization ${organizationId} credits reset to ${credits}`);
            }
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as unknown as { id: string };
        console.error(`Payment failed for invoice ${invoice.id}`);
        // Could send notification to user here
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
