import Link from "next/link";
import {
  Zap,
  Users,
  BarChart3,
  DollarSign,
  Shield,
  ArrowRight,
  Check,
  Sparkles,
  Brain,
  Target,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: Zap,
    title: "Instant Results",
    description:
      "Get survey responses in minutes, not weeks. Our AI panelists respond instantly to your questions.",
  },
  {
    icon: DollarSign,
    title: "90% Cost Reduction",
    description:
      "Synthetic respondents cost cents, not dollars. Scale your research without scaling your budget.",
  },
  {
    icon: Users,
    title: "Any Demographic",
    description:
      "Create panelists for any profile - from Gen Z to executives, any location, any background.",
  },
  {
    icon: Brain,
    title: "SSR Methodology",
    description:
      "Scientifically validated Semantic Similarity Rating ensures statistically reliable results.",
  },
  {
    icon: BarChart3,
    title: "Rich Analytics",
    description:
      "Get quantitative ratings AND qualitative explanations. Understand the 'why' behind every response.",
  },
  {
    icon: Shield,
    title: "Ethically Transparent",
    description:
      "Clear watermarking and guidelines. Designed as a complement to human research, not a replacement.",
  },
];

const pricingPlans = [
  {
    name: "Starter",
    price: "$99",
    period: "/month",
    description: "Perfect for freelancers and small teams",
    credits: "1,000",
    costPerRespondent: "$0.10",
    features: [
      "1,000 synthetic respondents/mo",
      "5 concurrent studies",
      "Basic demographics",
      "CSV export",
      "Email support",
    ],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "Growth",
    price: "$499",
    period: "/month",
    description: "For growing agencies and brands",
    credits: "7,500",
    costPerRespondent: "$0.07",
    features: [
      "7,500 synthetic respondents/mo",
      "Unlimited studies",
      "Advanced psychographics",
      "Excel + SPSS export",
      "API access",
      "Priority support",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Scale",
    price: "$1,499",
    period: "/month",
    description: "For research teams at scale",
    credits: "30,000",
    costPerRespondent: "$0.05",
    features: [
      "30,000 synthetic respondents/mo",
      "Unlimited everything",
      "Custom persona presets",
      "Team collaboration",
      "Integrations (Qualtrics, etc.)",
      "Dedicated success manager",
    ],
    cta: "Start Free Trial",
    popular: false,
  },
];

const metrics = [
  { value: "90%", label: "Test-retest reliability vs. human panels" },
  { value: "0.85+", label: "KS similarity score" },
  { value: "95%", label: "Cost reduction" },
  { value: "<5 min", label: "Time to 500 responses" },
];

const useCases = [
  {
    icon: Target,
    title: "Concept Testing",
    description: "Validate product concepts before investing in development",
  },
  {
    icon: TrendingUp,
    title: "Message Testing",
    description: "Optimize marketing messages for maximum resonance",
  },
  {
    icon: Users,
    title: "Segmentation",
    description: "Understand how different audiences perceive your brand",
  },
  {
    icon: BarChart3,
    title: "Price Optimization",
    description: "Find the optimal price point with synthetic conjoint analysis",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-800">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">Syntheia</span>
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <Link
              href="#features"
              className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
            >
              Features
            </Link>
            <Link
              href="#methodology"
              className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
            >
              Methodology
            </Link>
            <Link
              href="#pricing"
              className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="#use-cases"
              className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
            >
              Use Cases
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button variant="gradient">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 bg-hero-pattern">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="info" className="mb-6">
              Powered by validated SSR methodology
            </Badge>
            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Real insights.{" "}
              <span className="bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent">
                Synthetic speed.
              </span>
            </h1>
            <p className="mt-6 text-xl text-gray-600 leading-relaxed">
              Generate statistically valid survey responses from AI-powered
              synthetic panelists. Cut your market research costs by 90% and get
              results in minutes, not weeks.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/signup">
                <Button variant="gradient" size="xl" className="gap-2">
                  Start Your Free Trial
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="#methodology">
                <Button variant="outline" size="xl">
                  See the Science
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              No credit card required. 50 free respondents included.
            </p>
          </div>

          {/* Metrics bar */}
          <div className="mt-20 grid grid-cols-2 gap-8 md:grid-cols-4">
            {metrics.map((metric, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl font-bold text-blue-600">
                  {metric.value}
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  {metric.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need for synthetic research
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Built on peer-reviewed methodology, designed for research professionals
            </p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <Card key={i} className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="mt-4">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Methodology Section */}
      <section id="methodology" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <Badge variant="secondary" className="mb-4">
                Scientific Foundation
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Semantic Similarity Rating (SSR)
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Our methodology is based on peer-reviewed research published on arXiv.
                Instead of asking LLMs for direct numerical ratings (which produce
                unrealistic distributions), SSR:
              </p>
              <ul className="mt-8 space-y-4">
                <li className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                    1
                  </div>
                  <div>
                    <strong>Generates natural text responses</strong> from the
                    AI persona, capturing authentic reasoning
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                    2
                  </div>
                  <div>
                    <strong>Maps responses to scale anchors</strong> using
                    embedding similarity for statistical validity
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                    3
                  </div>
                  <div>
                    <strong>Produces realistic distributions</strong> matching
                    human response patterns with 90% reliability
                  </div>
                </li>
              </ul>
              <div className="mt-8">
                <Link href="/methodology">
                  <Button variant="outline" className="gap-2">
                    Read the Research Paper
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="rounded-2xl bg-gray-100 p-8">
              <div className="space-y-6">
                <div className="rounded-lg bg-white p-4 shadow-sm">
                  <div className="text-sm font-medium text-gray-500">
                    Question
                  </div>
                  <div className="mt-1 font-medium">
                    How likely are you to recommend this product?
                  </div>
                </div>
                <div className="rounded-lg bg-white p-4 shadow-sm">
                  <div className="text-sm font-medium text-gray-500">
                    Synthetic Response
                  </div>
                  <div className="mt-1 text-sm italic text-gray-600">
                    &ldquo;As someone who values quality and sustainability, I&apos;d definitely
                    recommend this product. The eco-friendly packaging really resonates
                    with my values, though I wish the price point was more accessible...&rdquo;
                  </div>
                </div>
                <div className="rounded-lg bg-blue-50 p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-blue-900">
                      SSR Mapped Rating
                    </div>
                    <div className="text-2xl font-bold text-blue-600">8/10</div>
                  </div>
                  <div className="mt-2 text-sm text-blue-700">
                    Confidence: 87% | Distribution: Normal
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="use-cases" className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Perfect for CPG & Consumer Research
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Validated against 9,300 human responses across 57 personal care product surveys
            </p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {useCases.map((useCase, i) => (
              <Card key={i} className="text-center">
                <CardHeader>
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                    <useCase.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="mt-4 text-lg">{useCase.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    {useCase.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Start free, scale as you grow. No hidden fees.
            </p>
          </div>
          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            {pricingPlans.map((plan, i) => (
              <Card
                key={i}
                className={`relative ${
                  plan.popular
                    ? "border-blue-500 shadow-xl scale-105"
                    : "border-gray-200"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-blue-600">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-gray-500">{plan.period}</span>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    {plan.credits} credits ({plan.costPerRespondent}/respondent)
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-center gap-3">
                        <Check className="h-4 w-4 text-emerald-500" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    variant={plan.popular ? "gradient" : "outline"}
                    className="w-full"
                  >
                    {plan.cta}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          <div className="mt-12 text-center">
            <p className="text-gray-600">
              Need more? Contact us for{" "}
              <Link href="/contact" className="text-blue-600 hover:underline">
                Enterprise pricing
              </Link>{" "}
              with custom limits and dedicated support.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-blue-900 to-blue-700">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to transform your research?
            </h2>
            <p className="mt-4 text-lg text-blue-100">
              Join forward-thinking research teams already using Syntheia to get
              faster, cheaper insights without sacrificing validity.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/signup">
                <Button
                  size="xl"
                  className="bg-white text-blue-900 hover:bg-blue-50 gap-2"
                >
                  Start Free Trial
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/demo">
                <Button
                  variant="outline"
                  size="xl"
                  className="border-white text-white hover:bg-white/10"
                >
                  Book a Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-800">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">Syntheia</span>
            </div>
            <div className="flex gap-8 text-sm text-gray-500">
              <Link href="/privacy" className="hover:text-gray-900">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-gray-900">
                Terms
              </Link>
              <Link href="/ethics" className="hover:text-gray-900">
                Ethics Guidelines
              </Link>
              <Link href="/methodology" className="hover:text-gray-900">
                Methodology
              </Link>
            </div>
            <div className="text-sm text-gray-500">
              2025 Syntheia. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
