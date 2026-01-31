"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Plus,
  Search,
  MoreVertical,
  Loader2,
  RefreshCw,
  Copy,
  Eye,
  Trash2,
  Building2,
  Clock,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PanelConfig {
  id: string;
  name: string;
  description: string | null;
  config: {
    demographics?: {
      ageRange?: { min: number; max: number };
      genderDistribution?: { male: number; female: number; nonBinary: number };
      locations?: string[];
    };
    psychographics?: {
      values?: string[];
      lifestyles?: string[];
      interests?: string[];
    };
    context?: {
      industry?: string;
    };
  };
  industry: string | null;
  isTemplate: boolean;
  createdAt: string;
  updatedAt: string;
}

const INDUSTRIES = [
  "Technology",
  "Healthcare",
  "Finance",
  "Retail",
  "Education",
  "Entertainment",
  "Food & Beverage",
  "Automotive",
  "Travel & Hospitality",
  "Real Estate",
  "Manufacturing",
  "Professional Services",
  "Non-profit",
  "Other",
];

export default function PersonasPage() {
  const [configs, setConfigs] = useState<PanelConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [activeTab, setActiveTab] = useState<"my" | "templates">("my");
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchConfigs = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) {
        params.set("search", searchQuery);
      }
      if (industryFilter !== "all") {
        params.set("industry", industryFilter);
      }

      const response = await fetch(`/api/panel-configs?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch configurations");
      }

      setConfigs(data.data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, [industryFilter]);

  const handleDuplicate = async (configId: string, configName: string) => {
    setDuplicatingId(configId);
    try {
      const response = await fetch(`/api/panel-configs/${configId}/duplicate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: `${configName} (Copy)` }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to duplicate configuration");
      }

      await fetchConfigs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setDuplicatingId(null);
    }
  };

  const handleDelete = async (configId: string) => {
    if (!confirm("Are you sure you want to delete this configuration?")) {
      return;
    }

    setDeletingId(configId);
    try {
      const response = await fetch(`/api/panel-configs/${configId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete configuration");
      }

      await fetchConfigs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredConfigs = configs.filter((config) => {
    const matchesSearch = config.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesTab =
      activeTab === "templates" ? config.isTemplate : !config.isTemplate;
    return matchesSearch && matchesTab;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getConfigSummary = (config: PanelConfig["config"]) => {
    const parts: string[] = [];

    if (config.demographics?.ageRange) {
      parts.push(
        `Ages ${config.demographics.ageRange.min}-${config.demographics.ageRange.max}`
      );
    }

    if (config.demographics?.locations?.length) {
      parts.push(
        `${config.demographics.locations.length} location${config.demographics.locations.length > 1 ? "s" : ""}`
      );
    }

    if (config.psychographics?.interests?.length) {
      parts.push(
        `${config.psychographics.interests.length} interest${config.psychographics.interests.length > 1 ? "s" : ""}`
      );
    }

    return parts.length > 0 ? parts.join(" • ") : "No configuration details";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Persona Library</h2>
          <p className="text-gray-600">
            Manage and reuse your panel configurations
          </p>
        </div>
        <Link href="/dashboard/studies/new">
          <Button variant="gradient" className="gap-2">
            <Plus className="h-4 w-4" />
            Create New Study
          </Button>
        </Link>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
          {error}
        </div>
      )}

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as "my" | "templates")}
      >
        <TabsList>
          <TabsTrigger value="my">My Configurations</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search configurations..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={industryFilter} onValueChange={setIndustryFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All industries</SelectItem>
                {INDUSTRIES.map((ind) => (
                  <SelectItem key={ind} value={ind}>
                    {ind}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={fetchConfigs} className="gap-2">
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
      {!isLoading && filteredConfigs.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {activeTab === "templates"
                ? "No templates available"
                : "No configurations found"}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchQuery || industryFilter !== "all"
                ? "Try adjusting your filters"
                : activeTab === "templates"
                  ? "Templates will appear here when available"
                  : "Create your first persona configuration when starting a new study"}
            </p>
            {!searchQuery && industryFilter === "all" && activeTab === "my" && (
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

      {/* Configurations grid */}
      {!isLoading && filteredConfigs.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredConfigs.map((config) => (
            <Card
              key={config.id}
              className="hover:shadow-md transition-shadow group"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 shrink-0">
                      <Users className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div className="min-w-0">
                      <Link
                        href={`/dashboard/personas/${config.id}`}
                        className="font-semibold text-gray-900 hover:text-[#7C3AED] truncate block"
                      >
                        {config.name}
                      </Link>
                      {config.isTemplate && (
                        <Badge
                          variant="secondary"
                          className="text-xs mt-0.5"
                        >
                          Template
                        </Badge>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/dashboard/personas/${config.id}`}
                          className="flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDuplicate(config.id, config.name)}
                        disabled={duplicatingId === config.id}
                        className="flex items-center gap-2"
                      >
                        {duplicatingId === config.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                        Duplicate
                      </DropdownMenuItem>
                      {!config.isTemplate && (
                        <DropdownMenuItem
                          onClick={() => handleDelete(config.id)}
                          disabled={deletingId === config.id}
                          className="text-red-600 flex items-center gap-2"
                        >
                          {deletingId === config.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {config.description && (
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                    {config.description}
                  </p>
                )}

                <p className="text-xs text-gray-400 mb-4">
                  {getConfigSummary(config.config)}
                </p>

                <div className="flex items-center gap-4 text-xs text-gray-400 border-t pt-3">
                  {config.industry && (
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {config.industry}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDate(config.updatedAt)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
