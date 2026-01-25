import Link from "next/link";
import { FileText, Plus, Search, Filter, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const studies = [
  {
    id: "1",
    name: "Q1 Product Concept Test",
    description: "Testing new product concepts for spring launch",
    status: "completed",
    respondents: 500,
    questions: 12,
    createdAt: "2025-01-20",
    completedAt: "2025-01-20",
  },
  {
    id: "2",
    name: "Brand Awareness Survey",
    description: "Measuring brand recognition across demographics",
    status: "running",
    respondents: 250,
    questions: 8,
    createdAt: "2025-01-22",
    completedAt: null,
  },
  {
    id: "3",
    name: "Pricing Study - Premium Line",
    description: "Conjoint analysis for premium product pricing",
    status: "draft",
    respondents: 0,
    questions: 15,
    createdAt: "2025-01-23",
    completedAt: null,
  },
  {
    id: "4",
    name: "Customer Satisfaction Q4",
    description: "Quarterly satisfaction tracking survey",
    status: "completed",
    respondents: 1000,
    questions: 20,
    createdAt: "2025-01-10",
    completedAt: "2025-01-12",
  },
  {
    id: "5",
    name: "New Packaging Test",
    description: "A/B testing for new packaging designs",
    status: "completed",
    respondents: 300,
    questions: 6,
    createdAt: "2025-01-05",
    completedAt: "2025-01-05",
  },
];

const statusColors = {
  draft: "bg-gray-100 text-gray-700",
  running: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
};

export default function StudiesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Studies</h2>
          <p className="text-gray-600">
            Manage your synthetic research studies
          </p>
        </div>
        <Link href="/dashboard/studies/new">
          <Button variant="gradient" className="gap-2">
            <Plus className="h-4 w-4" />
            New Study
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input placeholder="Search studies..." className="pl-10" />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="running">Running</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="newest">
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="oldest">Oldest first</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
                <SelectItem value="respondents">Most respondents</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Studies list */}
      <div className="space-y-4">
        {studies.map((study) => (
          <Card key={study.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 shrink-0">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <Link
                        href={`/dashboard/studies/${study.id}`}
                        className="font-semibold text-gray-900 hover:text-blue-600"
                      >
                        {study.name}
                      </Link>
                      <Badge
                        className={
                          statusColors[
                            study.status as keyof typeof statusColors
                          ]
                        }
                      >
                        {study.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {study.description}
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                      <span>{study.questions} questions</span>
                      <span>{study.respondents} respondents</span>
                      <span>Created {study.createdAt}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {study.status === "draft" && (
                    <Link href={`/dashboard/studies/${study.id}/edit`}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>
                  )}
                  {study.status === "completed" && (
                    <Link href={`/dashboard/studies/${study.id}/results`}>
                      <Button variant="outline" size="sm">
                        View Results
                      </Button>
                    </Link>
                  )}
                  {study.status === "draft" && (
                    <Button variant="gradient" size="sm">
                      Run Study
                    </Button>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Duplicate</DropdownMenuItem>
                      <DropdownMenuItem>Export</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
