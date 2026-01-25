import Link from "next/link";
import {
  FileText,
  Users,
  TrendingUp,
  Clock,
  ArrowRight,
  Plus,
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

const stats = [
  {
    name: "Total Studies",
    value: "12",
    change: "+2 this month",
    icon: FileText,
  },
  {
    name: "Total Respondents",
    value: "2,450",
    change: "+850 this month",
    icon: Users,
  },
  {
    name: "Avg. Confidence",
    value: "87%",
    change: "+3% vs last month",
    icon: TrendingUp,
  },
  {
    name: "Avg. Completion Time",
    value: "3.2 min",
    change: "for 100 respondents",
    icon: Clock,
  },
];

const recentStudies = [
  {
    id: "1",
    name: "Q1 Product Concept Test",
    status: "completed",
    respondents: 500,
    date: "2025-01-20",
  },
  {
    id: "2",
    name: "Brand Awareness Survey",
    status: "running",
    respondents: 250,
    date: "2025-01-22",
  },
  {
    id: "3",
    name: "Pricing Study - Premium Line",
    status: "draft",
    respondents: 0,
    date: "2025-01-23",
  },
];

const statusColors = {
  draft: "bg-gray-100 text-gray-700",
  running: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
};

export default function DashboardPage() {
  return (
    <div className="space-y-8">
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.name}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent studies */}
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
                href={`/dashboard/studies/${study.id}`}
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
                        {study.respondents > 0
                          ? `${study.respondents} respondents`
                          : "No responses yet"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge
                      className={
                        statusColors[study.status as keyof typeof statusColors]
                      }
                    >
                      {study.status}
                    </Badge>
                    <span className="text-sm text-gray-500">{study.date}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

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
