"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Users,
  TrendingUp,
  Clock,
  ArrowRight,
  Plus,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OnboardingDialog } from "@/components/onboarding/onboarding-dialog";

interface Study {
  id: string;
  name: string;
  status: "draft" | "running" | "completed" | "archived";
  sampleSize: number;
  creditsUsed: number;
  createdAt: string;
  completedAt: string | null;
}

interface DashboardStats {
  totalStudies: number;
  totalRespondents: number;
  avgConfidence: number;
  creditsRemaining: number;
  creditsMonthly: number;
}

const statusColors = {
  draft: "bg-[#F3F4F6] text-[#667085]",
  running: "bg-[#EDE9FE] text-[#7C3AED]",
  completed: "bg-emerald-100 text-emerald-700",
  archived: "bg-amber-100 text-amber-700",
};

export default function DashboardPage() {
  const [studies, setStudies] = useState<Study[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch studies
        const studiesRes = await fetch("/api/studies?limit=5");
        const studiesData = await studiesRes.json();

        if (studiesRes.ok) {
          setStudies(studiesData.data || []);
        }

        // Fetch billing/credits info
        const billingRes = await fetch("/api/billing");
        const billingData = await billingRes.json();

        if (billingRes.ok) {
          const org = billingData.data?.organization;
          const completedStudies = (studiesData.data || []).filter(
            (s: Study) => s.status === "completed"
          );
          const totalRespondents = completedStudies.reduce(
            (sum: number, s: Study) => sum + s.sampleSize,
            0
          );

          setStats({
            totalStudies: studiesData.data?.length || 0,
            totalRespondents,
            avgConfidence: 87, // Placeholder - would calculate from actual data
            creditsRemaining: org?.creditsRemaining || 1000,
            creditsMonthly: org?.creditsMonthly || 1000,
          });
        }

        // Check if should show onboarding
        const hasCompletedOnboarding = localStorage.getItem(
          "arquetype_onboarding_completed"
        );
        const hasNoStudies = !studiesData.data || studiesData.data.length === 0;

        if (!hasCompletedOnboarding && hasNoStudies) {
          setShowOnboarding(true);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem("arquetype_onboarding_completed", "true");
    setShowOnboarding(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#7C3AED]" />
      </div>
    );
  }

  const recentStudies = studies.slice(0, 5);
  const hasStudies = studies.length > 0;

  return (
    <div className="space-y-8">
      {/* Onboarding Dialog */}
      <OnboardingDialog
        open={showOnboarding}
        onComplete={handleOnboardingComplete}
      />

      {/* Welcome section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1A1A2E]">Welcome back!</h2>
          <p className="text-[#667085]">
            Here&apos;s what&apos;s happening with your synthetic research.
          </p>
        </div>
        <Link href="/dashboard/studies/new">
          <Button className="gap-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white">
            <Plus className="h-4 w-4" />
            Create New Study
          </Button>
        </Link>
      </div>

      {/* Stats grid */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-[#E5E7EB]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-[#667085]">
                Total Studies
              </CardTitle>
              <FileText className="h-4 w-4 text-[#9CA3AF]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#1A1A2E]">{stats.totalStudies}</div>
              <p className="text-xs text-[#667085] mt-1">
                {studies.filter((s) => s.status === "completed").length}{" "}
                completed
              </p>
            </CardContent>
          </Card>

          <Card className="border-[#E5E7EB]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-[#667085]">
                Total Respondents
              </CardTitle>
              <Users className="h-4 w-4 text-[#9CA3AF]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#1A1A2E]">
                {stats.totalRespondents.toLocaleString()}
              </div>
              <p className="text-xs text-[#667085] mt-1">
                Synthetic responses generated
              </p>
            </CardContent>
          </Card>

          <Card className="border-[#E5E7EB]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-[#667085]">
                Avg. Confidence
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-[#9CA3AF]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#1A1A2E]">{stats.avgConfidence}%</div>
              <p className="text-xs text-[#667085] mt-1">
                SSR methodology score
              </p>
            </CardContent>
          </Card>

          <Card className="border-[#E5E7EB]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-[#667085]">
                Credits Remaining
              </CardTitle>
              <Clock className="h-4 w-4 text-[#9CA3AF]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#1A1A2E]">
                {stats.creditsRemaining.toLocaleString()}
              </div>
              <p className="text-xs text-[#667085] mt-1">
                of {stats.creditsMonthly.toLocaleString()} monthly
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty state for new users */}
      {!hasStudies && (
        <Card className="border-dashed border-[#E5E7EB]">
          <CardContent className="py-12 text-center">
            <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-[#F3F0FF] mb-4">
              <Sparkles className="h-8 w-8 text-[#7C3AED]" />
            </div>
            <h3 className="text-lg font-semibold text-[#1A1A2E] mb-2">
              Create Your First Study
            </h3>
            <p className="text-[#667085] max-w-md mx-auto mb-6">
              Get instant market research insights using AI-powered synthetic
              respondents. Your first 50 respondents are free!
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/dashboard/studies/new">
                <Button className="gap-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white">
                  <Plus className="h-4 w-4" />
                  Create Study
                </Button>
              </Link>
              <Button
                variant="outline"
                className="border-[#E5E7EB] text-[#667085] hover:text-[#1A1A2E]"
                onClick={() => setShowOnboarding(true)}
              >
                Take the Tour
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent studies */}
      {hasStudies && (
        <Card className="border-[#E5E7EB]">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-[#1A1A2E]">Recent Studies</CardTitle>
              <CardDescription className="text-[#667085]">
                Your latest synthetic research projects
              </CardDescription>
            </div>
            <Link href="/dashboard/studies">
              <Button variant="ghost" size="sm" className="gap-1 text-[#667085] hover:text-[#1A1A2E]">
                View all
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentStudies.map((study) => (
                <Link
                  key={study.id}
                  href={
                    study.status === "completed"
                      ? `/dashboard/studies/${study.id}/results`
                      : `/dashboard/studies/${study.id}`
                  }
                  className="block"
                >
                  <div className="flex items-center justify-between p-4 rounded-lg border border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F3F0FF]">
                        <FileText className="h-5 w-5 text-[#7C3AED]" />
                      </div>
                      <div>
                        <div className="font-medium text-[#1A1A2E]">
                          {study.name}
                        </div>
                        <div className="text-sm text-[#667085]">
                          {study.status === "completed"
                            ? `${study.sampleSize} respondents`
                            : study.status === "draft"
                            ? "Not started"
                            : "In progress"}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge className={statusColors[study.status]}>
                        {study.status}
                      </Badge>
                      <span className="text-sm text-[#667085]">
                        {formatDate(study.createdAt)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow cursor-pointer border-[#E5E7EB]">
          <Link href="/dashboard/studies/new">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F3F0FF]">
                  <Plus className="h-6 w-6 text-[#7C3AED]" />
                </div>
                <div>
                  <div className="font-semibold text-[#1A1A2E]">New Study</div>
                  <div className="text-sm text-[#667085]">
                    Create a new synthetic survey
                  </div>
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer border-[#E5E7EB]">
          <Link href="/dashboard/personas">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
                  <Users className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <div className="font-semibold text-[#1A1A2E]">Persona Library</div>
                  <div className="text-sm text-[#667085]">
                    Browse and create personas
                  </div>
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer border-[#E5E7EB]">
          <Link href="/dashboard/analytics">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F3F0FF]">
                  <TrendingUp className="h-6 w-6 text-[#7C3AED]" />
                </div>
                <div>
                  <div className="font-semibold text-[#1A1A2E]">Analytics</div>
                  <div className="text-sm text-[#667085]">
                    View insights and trends
                  </div>
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>
      </div>
    </div>
  );
}
