"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
  Star,
  Quote,
  Lock,
  Headphones,
  Mail,
  Twitter,
  Linkedin,
  Github,
  ChevronRight,
  Layers,
  LineChart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: Zap,
    title: "Instant Results",
    description:
      "Get survey responses in minutes, not weeks. Our AI panelists respond instantly.",
  },
  {
    icon: Users,
    title: "Any Demographic",
    description:
      "Create panelists for any profile - from Gen Z to executives, any location.",
  },
  {
    icon: Brain,
    title: "SSR Methodology",
    description:
      "Scientifically validated Semantic Similarity Rating ensures reliable results.",
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

const steps = [
  {
    number: "01",
    title: "Define Your Audience",
    description: "Create detailed personas with demographics, psychographics, and behaviors.",
    icon: Users,
  },
  {
    number: "02",
    title: "Launch Your Study",
    description: "Deploy surveys to AI panelists and get responses in minutes.",
    icon: Zap,
  },
  {
    number: "03",
    title: "Analyze Insights",
    description: "Get quantitative ratings AND qualitative explanations for every response.",
    icon: LineChart,
  },
];

const testimonial = {
  quote:
    "Arquetype cut our research cycle from 3 weeks to 2 days. The quality is indistinguishable from our traditional panels. This is the future of market research.",
  name: "Sarah Chen",
  role: "VP of Consumer Insights",
  company: "Unilever",
  avatar: "SC",
};

// Dashboard Mockup Component
function DashboardMockup() {
  return (
    <div className="relative">
      {/* Strong neon glow effect behind mockup */}
      <div className="absolute -inset-4 bg-gradient-to-r from-[#d946ef]/30 via-[#C8A2C8]/40 to-[#a855f7]/30 rounded-3xl blur-3xl animate-pulse-slow" />
      <div className="absolute -inset-8 bg-[#C8A2C8]/20 rounded-3xl blur-[60px]" />

      {/* Main mockup */}
      <div className="relative dashboard-mockup" style={{ boxShadow: '0 0 60px rgba(200, 162, 200, 0.4), 0 0 120px rgba(168, 85, 247, 0.2)' }}>
        {/* Window header */}
        <div className="window-header">
          <div className="window-dots">
            <div className="window-dot window-dot-red" />
            <div className="window-dot window-dot-yellow" />
            <div className="window-dot window-dot-green" />
          </div>
          <span className="text-[#a0a0b0] text-sm font-medium">Arquetype Dashboard</span>
        </div>

        {/* Dashboard content */}
        <div className="flex">
          {/* Sidebar */}
          <div className="w-44 bg-[#0d0d14] p-4 border-r border-[#C8A2C8]/20">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#d946ef] to-[#C8A2C8] flex items-center justify-center shadow-[0_0_20px_rgba(217,70,239,0.5)]">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-semibold text-sm">Arquetype</span>
            </div>
            <nav className="space-y-1">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-[#C8A2C8]/20 to-[#d946ef]/10 text-[#d4b4d4] border border-[#C8A2C8]/30">
                <Layers className="w-4 h-4" />
                <span className="text-sm font-medium">Studies</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#6b6b7b] hover:bg-[#1a1a24] transition-colors">
                <Users className="w-4 h-4" />
                <span className="text-sm">Personas</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#6b6b7b] hover:bg-[#1a1a24] transition-colors">
                <BarChart3 className="w-4 h-4" />
                <span className="text-sm">Analytics</span>
              </div>
            </nav>
          </div>

          {/* Main area */}
          <div className="flex-1 p-5 bg-[#13131c]">
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { label: "Responses", value: "12.8K" },
                { label: "Studies", value: "24" },
                { label: "Avg. Time", value: "4.2m" },
              ].map((stat, i) => (
                <div key={i} className="bg-[#0d0d14] rounded-lg p-3 border border-[#C8A2C8]/20">
                  <div className="text-[#8b8b9b] text-[10px] uppercase tracking-wide mb-1">{stat.label}</div>
                  <div className="text-white text-lg font-bold">{stat.value}</div>
                </div>
              ))}
            </div>

            {/* Chart placeholder */}
            <div className="bg-[#0d0d14] rounded-lg p-4 border border-[#C8A2C8]/20 h-28">
              <div className="text-[#8b8b9b] text-[10px] uppercase tracking-wide mb-2">Response Distribution</div>
              <div className="flex items-end gap-1.5 h-16">
                {[40, 65, 45, 80, 55, 70, 60, 75, 50, 85, 65, 90].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t"
                    style={{
                      height: `${h}%`,
                      background: `linear-gradient(to top, rgba(217, 70, 239, 0.4), rgba(200, 162, 200, 0.8))`,
                      boxShadow: '0 0 8px rgba(200, 162, 200, 0.3)'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating popup - positioned outside and below */}
      <div
        className="absolute -bottom-20 right-4 w-56 rounded-xl p-4 animate-float border border-[#C8A2C8]/40"
        style={{
          background: 'linear-gradient(135deg, #1a1a28 0%, #0d0d14 100%)',
          boxShadow: '0 0 40px rgba(217, 70, 239, 0.3), 0 0 80px rgba(200, 162, 200, 0.2), 0 20px 40px rgba(0, 0, 0, 0.5)'
        }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #d946ef, #C8A2C8)', boxShadow: '0 0 20px rgba(217, 70, 239, 0.5)' }}>
            <Sparkles className="w-4 h-4 text-white animate-pulse" />
          </div>
          <div>
            <div className="text-white text-sm font-semibold">Generating...</div>
            <div className="text-[#a0a0b0] text-xs">500 panelists</div>
          </div>
        </div>
        <div className="w-full h-2 bg-[#0a0a0f] rounded-full overflow-hidden border border-[#C8A2C8]/20">
          <div
            className="h-full rounded-full animate-progress-bar"
            style={{
              background: 'linear-gradient(90deg, #d946ef, #C8A2C8, #d4b4d4)',
              boxShadow: '0 0 10px rgba(217, 70, 239, 0.5)'
            }}
          />
        </div>
        <Button variant="gradient" size="sm" className="w-full mt-3 shadow-[0_0_20px_rgba(200,162,200,0.3)]">
          View Results
        </Button>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.body.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation - Always dark */}
      <nav
        className={`fixed top-0 z-50 w-full transition-all duration-300 ${
          isScrolled
            ? "bg-[#0a0a0f]/95 backdrop-blur-md border-b border-[#C8A2C8]/10 shadow-lg"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{
                background: 'linear-gradient(135deg, #d946ef, #C8A2C8)',
                boxShadow: '0 0 20px rgba(217, 70, 239, 0.5)'
              }}
            >
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Arquetype</span>
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <Link
              href="#features"
              className="text-sm font-medium text-[#a0a0b0] hover:text-[#C8A2C8] transition-colors"
            >
              Features
            </Link>
            <Link
              href="#pricing"
              className="text-sm font-medium text-[#a0a0b0] hover:text-[#C8A2C8] transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="#methodology"
              className="text-sm font-medium text-[#a0a0b0] hover:text-[#C8A2C8] transition-colors"
            >
              Methodology
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost-dark">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button variant="gradient">Get Started</Button>
            </Link>
          </div>
        </div>
        {/* Progress bar */}
        <div className="progress-bar" style={{ transform: `scaleX(${scrollProgress / 100})` }} />
      </nav>

      {/* Hero Section - Split Layout */}
      <section className="relative pt-32 pb-24 overflow-hidden bg-hero-dark">
        {/* Floating orbs */}
        <div className="floating-orb-bright w-[600px] h-[600px] -top-64 -left-64 animate-float-slow" />
        <div className="floating-orb w-[400px] h-[400px] top-1/3 right-0 animate-float-slow delay-500" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left side - Text content */}
            <div className="text-center lg:text-left">
              {/* Badge */}
              <div className="opacity-0 animate-fade-in mb-6 inline-block">
                <Badge variant="dark-accent" className="px-4 py-1.5 text-sm">
                  <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                  AI-POWERED RESEARCH
                </Badge>
              </div>

              {/* Headline */}
              <h1 className="opacity-0 animate-slide-up-stagger delay-100">
                <span className="block text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white">
                  Real insights.
                </span>
                <span className="block text-5xl sm:text-6xl lg:text-7xl font-light tracking-tight text-[#d4b4d4] glow-text-neon mt-2">
                  Synthetic speed.
                </span>
              </h1>

              {/* Description */}
              <p className="opacity-0 animate-slide-up-stagger delay-200 mt-8 text-lg text-[#a0a0b0] leading-relaxed max-w-xl mx-auto lg:mx-0">
                Generate statistically valid survey responses from AI-powered synthetic panelists.
                Cut research costs by 90% and get results in minutes.
              </p>

              {/* CTAs */}
              <div className="opacity-0 animate-slide-up-stagger delay-300 mt-10 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <Link href="/signup">
                  <Button variant="gradient" size="xl" className="gap-2 group">
                    Start Your Free Trial
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link href="#methodology">
                  <Button variant="outline-dark" size="xl" className="gap-2">
                    See the Science
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="opacity-0 animate-slide-up-stagger delay-400 mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-[#6b6b7b]">
                <span className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-emerald-500" />
                  50 free respondents
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-emerald-500" />
                  No credit card required
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-emerald-500" />
                  Cancel anytime
                </span>
              </div>
            </div>

            {/* Right side - Dashboard Mockup */}
            <div className="opacity-0 animate-slide-in-right delay-300 relative lg:pl-8">
              <DashboardMockup />
            </div>
          </div>
        </div>
      </section>

      {/* Logos / Social Proof */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-medium text-[#9b7a9b] uppercase tracking-wider mb-8">
            Trusted by research teams at
          </p>
          <div className="flex flex-wrap justify-center items-center gap-12">
            {["Unilever", "P&G", "Nielsen", "Kantar", "Ipsos", "McKinsey"].map(
              (company) => (
                <div
                  key={company}
                  className="text-2xl font-bold text-gray-400 hover:text-[#9b7a9b] transition-colors cursor-default"
                >
                  {company}
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <Badge variant="info" className="mb-4">
              <DollarSign className="h-3.5 w-3.5 mr-1.5" />
              90% Cost Reduction
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
              Everything you need for synthetic research
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Built on peer-reviewed methodology, designed for research professionals
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature, i) => (
              <div
                key={i}
                className="rounded-2xl p-8 bg-white border border-gray-100 shadow-lg hover:shadow-xl hover:border-[#C8A2C8]/30 transition-all hover:-translate-y-1"
              >
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-xl text-[#9b7a9b] mb-6"
                  style={{
                    background: 'linear-gradient(135deg, rgba(200, 162, 200, 0.2), rgba(245, 238, 245, 0.8))',
                    boxShadow: '0 0 20px rgba(200, 162, 200, 0.2)'
                  }}
                >
                  <feature.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="methodology" className="py-24 bg-[#faf8fa]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Three simple steps to transform your research workflow
            </p>
          </div>

          <div className="relative">
            {/* Connector line */}
            <div
              className="hidden md:block absolute top-12 left-1/2 -translate-x-1/2 w-2/3 h-0.5"
              style={{
                background: 'linear-gradient(90deg, transparent, #C8A2C8, #9b7a9b, #C8A2C8, transparent)',
              }}
            />

            <div className="grid gap-8 md:grid-cols-3">
              {steps.map((step, i) => (
                <div key={i} className="relative text-center">
                  {/* Number circle */}
                  <div
                    className="mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-6 relative z-10 bg-white border-2 border-[#C8A2C8]"
                    style={{
                      boxShadow: '0 0 30px rgba(200, 162, 200, 0.3), 0 10px 40px rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    <span className="text-3xl font-bold text-[#9b7a9b]">{step.number}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <Quote className="w-16 h-16 mx-auto text-[#C8A2C8] mb-8" />
          <blockquote className="text-2xl sm:text-3xl font-light text-gray-800 leading-relaxed mb-8">
            &ldquo;{testimonial.quote}&rdquo;
          </blockquote>
          <div className="flex items-center justify-center gap-4">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-full text-white font-bold text-lg"
              style={{
                background: 'linear-gradient(135deg, #9b7a9b, #C8A2C8)',
                boxShadow: '0 0 20px rgba(200, 162, 200, 0.4)'
              }}
            >
              {testimonial.avatar}
            </div>
            <div className="text-left">
              <div className="font-semibold text-gray-900">{testimonial.name}</div>
              <div className="text-gray-500">
                {testimonial.role}, {testimonial.company}
              </div>
            </div>
          </div>
          <div className="flex justify-center gap-1 mt-6">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="h-5 w-5 fill-[#C8A2C8] text-[#C8A2C8]"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-[#faf8fa]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <Badge variant="success" className="mb-4">
              Save up to $24,000/month
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Start free, scale as you grow. No hidden fees.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {pricingPlans.map((plan, i) => (
              <div
                key={i}
                className={`relative rounded-2xl p-8 bg-white ${
                  plan.popular
                    ? "border-2 border-[#C8A2C8] shadow-xl scale-105"
                    : "border border-gray-200 shadow-lg"
                }`}
                style={plan.popular ? { boxShadow: '0 0 40px rgba(200, 162, 200, 0.3), 0 20px 40px rgba(0, 0, 0, 0.1)' } : {}}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge variant="primary">Most Popular</Badge>
                  </div>
                )}
                <div className="text-center mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-500 text-sm">{plan.description}</p>
                  <div className="mt-6">
                    <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-500">{plan.period}</span>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    {plan.credits} credits ({plan.costPerRespondent}/respondent)
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-emerald-500 shrink-0" />
                      <span className="text-gray-600 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/signup" className="block">
                  <Button
                    variant={plan.popular ? "gradient" : "outline"}
                    className="w-full"
                    size="lg"
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA - Dark theme matching hero */}
      <section className="relative py-24 overflow-hidden bg-[#0a0a0f]">
        {/* Neon glow effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,_rgba(217,70,239,0.15)_0%,_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_80%,_rgba(200,162,200,0.1)_0%,_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,_rgba(168,85,247,0.08)_0%,_transparent_60%)]" />

        {/* Floating orbs */}
        <div className="floating-orb-bright w-[400px] h-[400px] -top-32 -left-32 animate-float-slow" />
        <div className="floating-orb w-[300px] h-[300px] -bottom-20 -right-20 animate-float-slow delay-500" />

        {/* Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full animate-particle"
              style={{
                left: `${(i * 8.5 + 5) % 100}%`,
                bottom: "-10px",
                animationDelay: `${(i * 1.2) % 12}s`,
                animationDuration: `${10 + (i % 6)}s`,
                background: i % 2 === 0 ? '#d946ef' : '#C8A2C8',
                boxShadow: `0 0 10px ${i % 2 === 0 ? 'rgba(217, 70, 239, 0.6)' : 'rgba(200, 162, 200, 0.6)'}`
              }}
            />
          ))}
        </div>

        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-6">
            Ready to transform your research?
          </h2>
          <p className="text-lg text-[#a0a0b0] mb-10">
            Join 500+ research teams already using Arquetype
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button variant="gradient" size="xl" className="gap-2 group">
                Start Free Trial
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/demo">
              <Button variant="outline-dark" size="xl">
                Book a Demo
              </Button>
            </Link>
          </div>

          {/* Trust stack */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-[#6b6b7b]">
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              <span className="text-sm">SOC 2 Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <span className="text-sm">30-day money-back</span>
            </div>
            <div className="flex items-center gap-2">
              <Headphones className="h-5 w-5" />
              <span className="text-sm">24/7 Support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Dark theme, seamless with CTA */}
      <footer className="py-16 bg-[#0a0a0f]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            {/* Brand column */}
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{
                    background: 'linear-gradient(135deg, #d946ef, #C8A2C8)',
                    boxShadow: '0 0 20px rgba(217, 70, 239, 0.4)'
                  }}
                >
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Arquetype</span>
              </div>
              <p className="text-sm text-[#6b6b7b] mb-6 max-w-xs">
                Synthetic survey respondents powered by AI. Get market research insights in minutes.
              </p>

              {/* Newsletter */}
              <div className="mb-6">
                <p className="text-sm font-medium text-[#a0a0b0] mb-2">
                  Get research insights weekly
                </p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="your@email.com"
                    className="flex-1 rounded-lg bg-[#12121a] border border-[#C8A2C8]/20 px-3 py-2 text-sm text-white placeholder:text-[#6b6b7b] focus:outline-none focus:ring-2 focus:ring-[#C8A2C8]/50 focus:border-[#C8A2C8]"
                  />
                  <Button variant="gradient" size="sm">
                    <Mail className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-[#6b6b7b]">
                <li>
                  <Link href="#features" className="hover:text-[#C8A2C8] transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="hover:text-[#C8A2C8] transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#methodology" className="hover:text-[#C8A2C8] transition-colors">
                    Methodology
                  </Link>
                </li>
                <li>
                  <Link href="/integrations" className="hover:text-[#C8A2C8] transition-colors">
                    Integrations
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-[#6b6b7b]">
                <li>
                  <Link href="/about" className="hover:text-[#C8A2C8] transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="hover:text-[#C8A2C8] transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="hover:text-[#C8A2C8] transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-[#C8A2C8] transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-semibold text-white mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-[#6b6b7b]">
                <li>
                  <Link href="/docs" className="hover:text-[#C8A2C8] transition-colors">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="/case-studies" className="hover:text-[#C8A2C8] transition-colors">
                    Case Studies
                  </Link>
                </li>
                <li>
                  <Link href="/ethics" className="hover:text-[#C8A2C8] transition-colors">
                    Ethics Guidelines
                  </Link>
                </li>
                <li>
                  <Link href="/api" className="hover:text-[#C8A2C8] transition-colors">
                    API Reference
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-[#C8A2C8]/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-[#6b6b7b]">
              © 2025 Arquetype. All rights reserved.
            </div>
            <div className="flex gap-6 text-sm text-[#6b6b7b]">
              <Link href="/privacy" className="hover:text-[#C8A2C8] transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-[#C8A2C8] transition-colors">
                Terms
              </Link>
              <Link href="/security" className="hover:text-[#C8A2C8] transition-colors">
                Security
              </Link>
            </div>
            <div className="flex gap-4">
              <Link
                href="https://twitter.com/arquetype"
                className="text-[#6b6b7b] hover:text-[#C8A2C8] transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </Link>
              <Link
                href="https://linkedin.com/company/arquetype"
                className="text-[#6b6b7b] hover:text-[#C8A2C8] transition-colors"
              >
                <Linkedin className="h-5 w-5" />
              </Link>
              <Link
                href="https://github.com/arquetype"
                className="text-[#6b6b7b] hover:text-[#C8A2C8] transition-colors"
              >
                <Github className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
