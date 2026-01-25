"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  CreditCard,
  Check,
  Loader2,
  AlertCircle,
  Zap,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface BillingData {
  organization: {
    id: string;
    name: string;
    plan: string;
    creditsRemaining: number;
    creditsMonthly: number;
  };
  planDetails: {
    name: string;
    price: number;
    credits: number;
    features: string[];
  };
  subscription: {
    id: string;
    status: string;
    cancelAtPeriodEnd: boolean;
    currentPeriodEnd: number;
  } | null;
  nextBillingDate: string | null;
  hasActiveSubscription: boolean;
}

const PRICING_PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: 99,
    credits: 1000,
    costPerRespondent: "$0.10",
    features: [
      "1,000 synthetic respondents/mo",
      "5 concurrent studies",
      "Basic demographics",
      "CSV export",
      "Email support",
    ],
    popular: false,
  },
  {
    id: "growth",
    name: "Growth",
    price: 499,
    credits: 7500,
    costPerRespondent: "$0.07",
    features: [
      "7,500 synthetic respondents/mo",
      "Unlimited studies",
      "Advanced psychographics",
      "Excel + JSON export",
      "API access",
      "Priority support",
    ],
    popular: true,
  },
  {
    id: "scale",
    name: "Scale",
    price: 1499,
    credits: 30000,
    costPerRespondent: "$0.05",
    features: [
      "30,000 synthetic respondents/mo",
      "Unlimited everything",
      "Custom persona presets",
      "Team collaboration",
      "Integrations (Qualtrics, etc.)",
      "Dedicated success manager",
    ],
    popular: false,
  },
];

function BillingContent() {
  const searchParams = useSearchParams();
  const [billing, setBilling] = useState<BillingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  const success = searchParams.get("success");
  const canceled = searchParams.get("canceled");

  useEffect(() => {
    fetchBilling();
  }, []);

  const fetchBilling = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/billing");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch billing info");
      }

      setBilling(data.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = async (planId: string) => {
    setCheckoutLoading(planId);
    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setCheckoutLoading(null);
    }
  };

  const handleManageBilling = async () => {
    setPortalLoading(true);
    try {
      const response = await fetch("/api/billing/portal", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to open billing portal");
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setPortalLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error && !billing) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <AlertCircle className="h-12 w-12 text-red-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">{error}</h3>
          <Button onClick={fetchBilling}>Try Again</Button>
        </CardContent>
      </Card>
    );
  }

  const creditsUsedPercent = billing
    ? Math.round(
        ((billing.organization.creditsMonthly -
          billing.organization.creditsRemaining) /
          billing.organization.creditsMonthly) *
          100
      )
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Billing</h2>
        <p className="text-gray-600">
          Manage your subscription and billing details
        </p>
      </div>

      {/* Success/Cancel Messages */}
      {success && (
        <div className="p-4 rounded-lg bg-green-50 border border-green-200 text-green-700">
          <div className="flex items-center gap-2">
            <Check className="h-5 w-5" />
            <span className="font-medium">Subscription activated successfully!</span>
          </div>
        </div>
      )}
      {canceled && (
        <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-700">
          Checkout was canceled. No changes were made to your subscription.
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
          {error}
        </div>
      )}

      {billing && (
        <>
          {/* Current Plan Card */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-blue-600" />
                  Current Plan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">
                      {billing.planDetails.name}
                    </div>
                    <div className="text-gray-500">
                      ${billing.planDetails.price}/month
                    </div>
                  </div>
                  <Badge
                    className={
                      billing.hasActiveSubscription
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }
                  >
                    {billing.hasActiveSubscription ? "Active" : "Free Tier"}
                  </Badge>
                </div>

                {billing.nextBillingDate && (
                  <div className="text-sm text-gray-500">
                    Next billing date: {formatDate(billing.nextBillingDate)}
                  </div>
                )}

                {billing.hasActiveSubscription && (
                  <Button
                    variant="outline"
                    onClick={handleManageBilling}
                    disabled={portalLoading}
                    className="w-full"
                  >
                    {portalLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <ExternalLink className="h-4 w-4 mr-2" />
                    )}
                    Manage Subscription
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Credits Usage Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                  Credits Usage
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>
                      {billing.organization.creditsRemaining.toLocaleString()}{" "}
                      remaining
                    </span>
                    <span>
                      {billing.organization.creditsMonthly.toLocaleString()}{" "}
                      total
                    </span>
                  </div>
                  <Progress value={creditsUsedPercent} className="h-3" />
                </div>
                <div className="text-sm text-gray-500">
                  {creditsUsedPercent}% of monthly credits used
                </div>
                <div className="pt-2 border-t">
                  <div className="text-sm text-gray-600">
                    Each synthetic respondent costs 1 credit
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pricing Plans */}
          <div className="mt-12">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              Available Plans
            </h3>
            <div className="grid gap-6 lg:grid-cols-3">
              {PRICING_PLANS.map((plan) => {
                const isCurrentPlan = billing.organization.plan === plan.id;

                return (
                  <Card
                    key={plan.id}
                    className={`relative ${
                      plan.popular
                        ? "border-blue-500 shadow-lg"
                        : "border-gray-200"
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-blue-600">Most Popular</Badge>
                      </div>
                    )}
                    <CardHeader className="text-center pt-8">
                      <CardTitle>{plan.name}</CardTitle>
                      <div className="mt-4">
                        <span className="text-4xl font-bold">${plan.price}</span>
                        <span className="text-gray-500">/month</span>
                      </div>
                      <CardDescription className="mt-2">
                        {plan.credits.toLocaleString()} credits (
                        {plan.costPerRespondent}/respondent)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {plan.features.map((feature, j) => (
                          <li key={j} className="flex items-center gap-3">
                            <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      {isCurrentPlan ? (
                        <Button variant="outline" className="w-full" disabled>
                          Current Plan
                        </Button>
                      ) : (
                        <Button
                          variant={plan.popular ? "gradient" : "outline"}
                          className="w-full"
                          onClick={() => handleUpgrade(plan.id)}
                          disabled={checkoutLoading === plan.id}
                        >
                          {checkoutLoading === plan.id ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <ArrowRight className="h-4 w-4 mr-2" />
                          )}
                          {plan.price > billing.planDetails.price
                            ? "Upgrade"
                            : "Switch"}{" "}
                          to {plan.name}
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Enterprise CTA */}
          <Card className="bg-gradient-to-r from-blue-50 to-emerald-50 border-0">
            <CardContent className="py-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Need more?
                  </h3>
                  <p className="text-gray-600">
                    Contact us for custom enterprise pricing with unlimited
                    credits and dedicated support.
                  </p>
                </div>
                <Button variant="outline">Contact Sales</Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <BillingContent />
    </Suspense>
  );
}
