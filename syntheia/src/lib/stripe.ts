import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-12-15.clover",
  typescript: true,
});

// Pricing plans configuration
export const PRICING_PLANS = {
  starter: {
    name: "Starter",
    price: 99,
    credits: 1000,
    priceId: process.env.STRIPE_STARTER_PRICE_ID || "",
    features: [
      "1,000 synthetic respondents/mo",
      "5 concurrent studies",
      "Basic demographics",
      "CSV export",
      "Email support",
    ],
  },
  growth: {
    name: "Growth",
    price: 499,
    credits: 7500,
    priceId: process.env.STRIPE_GROWTH_PRICE_ID || "",
    features: [
      "7,500 synthetic respondents/mo",
      "Unlimited studies",
      "Advanced psychographics",
      "Excel + SPSS export",
      "API access",
      "Priority support",
    ],
  },
  scale: {
    name: "Scale",
    price: 1499,
    credits: 30000,
    priceId: process.env.STRIPE_SCALE_PRICE_ID || "",
    features: [
      "30,000 synthetic respondents/mo",
      "Unlimited everything",
      "Custom persona presets",
      "Team collaboration",
      "Integrations (Qualtrics, etc.)",
      "Dedicated success manager",
    ],
  },
} as const;

export type PlanName = keyof typeof PRICING_PLANS;

export function getPlanByPriceId(priceId: string): PlanName | null {
  for (const [planName, plan] of Object.entries(PRICING_PLANS)) {
    if (plan.priceId === priceId) {
      return planName as PlanName;
    }
  }
  return null;
}

export function getCreditsForPlan(plan: PlanName): number {
  return PRICING_PLANS[plan]?.credits || 1000;
}
