"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FileText, Plus, Search, MoreVertical, Loader2, Play, RefreshCw, LineChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
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

interface Study {
  id: string;
  name: string;
  description: string | null;
  status: "draft" | "running" | "completed" | "archived" | "cancelled";
  sampleSize: number;
  questions: Array<{ id: string; text: string }>;
  creditsUsed: number;
  createdAt: string;
  completedAt: string | null;
}

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  running: "bg-[#EDE9FE] text-[#7C3AED]",
  completed: "bg-green-100 text-green-700",
  archived: "bg-orange-100 text-orange-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function StudiesPage() {
  const [studies, setStudies] = useState<Study[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [runningStudyId, setRunningStudyId] = useState<string | null>(null);

  const fetchStudies = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "all") {
        params.set("status", statusFilter);
      }

      const response = await fetch(`/api/studies?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch studies");
      }

      setStudies(data.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudies();
  }, [statusFilter]);

  const handleRunStudy = async (studyId: string) => {
    setRunningStudyId(studyId);
    try {
      const response = await fetch(`/api/studies/${studyId}/run`, {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to run study");
      }

      // Refresh the list
      await fetchStudies();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setRunningStudyId(null);
    }
  };

  const handleDeleteStudy = async (studyId: string) => {
    if (!confirm("Are you sure you want to delete this study?")) {
      return;
    }

    try {
      const response = await fetch(`/api/studies/${studyId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete study");
      }

      // Refresh the list
      await fetchStudies();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const filteredStudies = studies.filter((study) =>
    study.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

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
        <div className="flex gap-3">
          <Link href="/dashboard/compare">
            <Button variant="outline" className="gap-2">
              <LineChart className="h-4 w-4" />
              Compare Studies
            </Button>
          </Link>
          <Link href="/dashboard/studies/new">
            <Button variant="gradient" className="gap-2">
              <Plus className="h-4 w-4" />
              New Study
            </Button>
          </Link>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
          {error}
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search studies..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
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
            <Button variant="outline" onClick={fetchStudies} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#7C3AED]" />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && filteredStudies.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No studies found
            </h3>
            <p className="text-gray-500 mb-4">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your filters"
                : "Create your first study to get started"}
            </p>
            {!searchQuery && statusFilter === "all" && (
              <Link href="/dashboard/studies/new">
                <Button variant="gradient" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Study
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}

      {/* Studies list */}
      {!isLoading && filteredStudies.length > 0 && (
        <div className="space-y-4">
          {filteredStudies.map((study) => (
            <Card key={study.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#F3F0FF] shrink-0">
                      <FileText className="h-6 w-6 text-[#7C3AED]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <Link
                          href={
                            study.status === "completed"
                              ? `/dashboard/studies/${study.id}/results`
                              : `/dashboard/studies/${study.id}`
                          }
                          className="font-semibold text-gray-900 hover:text-[#7C3AED]"
                        >
                          {study.name}
                        </Link>
                        <Badge className={statusColors[study.status]}>
                          {study.status}
                        </Badge>
                      </div>
                      {study.description && (
                        <p className="text-sm text-gray-500 mt-1">
                          {study.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                        <span>{study.questions.length} questions</span>
                        <span>{study.sampleSize} respondents</span>
                        <span>Created {formatDate(study.createdAt)}</span>
                        {study.status === "completed" && study.creditsUsed > 0 && (
                          <span>{study.creditsUsed} credits used</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {study.status === "completed" && (
                      <Link href={`/dashboard/studies/${study.id}/results`}>
                        <Button variant="outline" size="sm">
                          View Results
                        </Button>
                      </Link>
                    )}
                    {study.status === "draft" && (
                      <Button
                        variant="gradient"
                        size="sm"
                        onClick={() => handleRunStudy(study.id)}
                        disabled={runningStudyId === study.id}
                      >
                        {runningStudyId === study.id ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Running...
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            Run Study
                          </>
                        )}
                      </Button>
                    )}
                    {study.status === "running" && (
                      <Badge className="bg-[#EDE9FE] text-[#7C3AED]">
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Processing...
                      </Badge>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDeleteStudy(study.id)}
                        >
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
      )}
    </div>
  );
}
