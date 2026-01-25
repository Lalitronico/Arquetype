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
  draft: "bg-gray-100 text-gray-700",
  running: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  archived: "bg-orange-100 text-orange-700",
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
          "syntheia_onboarding_completed"
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
    localStorage.setItem("syntheia_onboarding_completed", "true");
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
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
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
          <h2 className="text-2xl font-bold text-gray-900">Welcome back!</h2>
          <p className="text-gray-600">
            Here&apos;s what&apos;s happening with your synthetic research.
          </p>
        </div>
        <Link href="/dashboard/studies/new">
          <Button variant="gradient" className="gap-2">
            <Plus className="h-4 w-4" />
            Create New Study
          </Button>
        </Link>
      </div>

      {/* Stats grid */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Studies
              </CardTitle>
              <FileText className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudies}</div>
              <p className="text-xs text-gray-500 mt-1">
                {studies.filter((s) => s.status === "completed").length}{" "}
                completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Respondents
              </CardTitle>
              <Users className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalRespondents.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Synthetic responses generated
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Avg. Confidence
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgConfidence}%</div>
              <p className="text-xs text-gray-500 mt-1">
                SSR methodology score
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Credits Remaining
              </CardTitle>
              <Clock className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.creditsRemaining.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                of {stats.creditsMonthly.toLocaleString()} monthly
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty state for new users */}
      {!hasStudies && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-blue-100 mb-4">
              <Sparkles className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Create Your First Study
            </h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              Get instant market research insights using AI-powered synthetic
              respondents. Your first 50 respondents are free!
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/dashboard/studies/new">
                <Button variant="gradient" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Study
                </Button>
              </Link>
              <Button
                variant="outline"
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Studies</CardTitle>
              <CardDescription>
                Your latest synthetic research projects
              </CardDescription>
            </div>
            <Link href="/dashboard/studies">
              <Button variant="ghost" size="sm" className="gap-1">
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
                  <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {study.name}
                        </div>
                        <div className="text-sm text-gray-500">
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
                      <span className="text-sm text-gray-500">
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
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link href="/dashboard/studies/new">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                  <Plus className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold">New Study</div>
                  <div className="text-sm text-gray-500">
                    Create a new synthetic survey
                  </div>
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link href="/dashboard/personas">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
                  <Users className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <div className="font-semibold">Persona Library</div>
                  <div className="text-sm text-gray-500">
                    Browse and create personas
                  </div>
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link href="/dashboard/analytics">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <div className="font-semibold">Analytics</div>
                  <div className="text-sm text-gray-500">
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
