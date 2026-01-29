"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Users,
  Save,
  Loader2,
  Plus,
  Building2,
  FileText,
  Clock,
  MapPin,
  Heart,
  Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

interface PanelConfigDetail {
  id: string;
  name: string;
  description: string | null;
  config: {
    count?: number;
    demographics?: {
      ageRange?: { min: number; max: number };
      genderDistribution?: { male: number; female: number; nonBinary: number };
      locations?: string[];
      incomeDistribution?: { low: number; medium: number; high: number };
      educationLevels?: string[];
      occupations?: string[];
    };
    psychographics?: {
      values?: string[];
      lifestyles?: string[];
      interests?: string[];
      personalities?: string[];
    };
    context?: {
      industry?: string;
      productExperience?: string[];
      brandAffinities?: string[];
    };
  };
  industry: string | null;
  isTemplate: boolean;
  createdAt: string;
  updatedAt: string;
}

interface RelatedStudy {
  id: string;
  name: string;
  status: string;
  createdAt: string;
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

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  running: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  archived: "bg-orange-100 text-orange-700",
};

export default function PersonaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [config, setConfig] = useState<PanelConfigDetail | null>(null);
  const [relatedStudies, setRelatedStudies] = useState<RelatedStudy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Edit form state
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editIndustry, setEditIndustry] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch config details
        const configRes = await fetch(`/api/panel-configs/${id}`);
        const configData = await configRes.json();

        if (!configRes.ok) {
          throw new Error(configData.error || "Failed to fetch configuration");
        }

        setConfig(configData.data);
        setEditName(configData.data.name);
        setEditDescription(configData.data.description || "");
        setEditIndustry(configData.data.industry || "");

        // Fetch related studies
        const studiesRes = await fetch(`/api/studies?panelConfigId=${id}`);
        if (studiesRes.ok) {
          const studiesData = await studiesRes.json();
          setRelatedStudies(studiesData.data || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleSave = async () => {
    if (!config || config.isTemplate) return;

    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`/api/panel-configs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          description: editDescription || null,
          industry: editIndustry || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update configuration");
      }

      const data = await response.json();
      setConfig(data.data);
      setSuccessMessage("Configuration saved successfully");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatPercentage = (value: number) => {
    return `${Math.round(value * 100)}%`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error && !config) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/personas">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Personas
            </Button>
          </Link>
        </div>
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!config) return null;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/personas">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Personas
          </Button>
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-100 shrink-0">
            <Users className="h-7 w-7 text-emerald-600" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-900">{config.name}</h2>
              {config.isTemplate && (
                <Badge variant="secondary">Template</Badge>
              )}
            </div>
            <p className="text-gray-500 mt-1">
              Created {formatDate(config.createdAt)} • Updated{" "}
              {formatDate(config.updatedAt)}
            </p>
          </div>
        </div>
        <Link href="/dashboard/studies/new">
          <Button variant="gradient" className="gap-2">
            <Plus className="h-4 w-4" />
            Use in New Study
          </Button>
        </Link>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="p-4 rounded-lg bg-green-50 border border-green-200 text-green-700">
          {successMessage}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Edit Basic Info */}
          {!config.isTemplate && (
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Edit the name and description of this configuration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Configuration name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Describe this panel configuration..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Select value={editIndustry} onValueChange={setEditIndustry}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No industry</SelectItem>
                      {INDUSTRIES.map((ind) => (
                        <SelectItem key={ind} value={ind}>
                          {ind}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="pt-2">
                  <Button
                    onClick={handleSave}
                    disabled={isSaving || !editName.trim()}
                    className="gap-2"
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Demographics */}
          {config.config.demographics && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Demographics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {config.config.demographics.ageRange && (
                  <div>
                    <Label className="text-sm text-gray-500">Age Range</Label>
                    <p className="font-medium">
                      {config.config.demographics.ageRange.min} -{" "}
                      {config.config.demographics.ageRange.max} years
                    </p>
                  </div>
                )}

                {config.config.demographics.genderDistribution && (
                  <div>
                    <Label className="text-sm text-gray-500">
                      Gender Distribution
                    </Label>
                    <div className="flex gap-4 mt-1">
                      <Badge variant="outline">
                        Male:{" "}
                        {formatPercentage(
                          config.config.demographics.genderDistribution.male
                        )}
                      </Badge>
                      <Badge variant="outline">
                        Female:{" "}
                        {formatPercentage(
                          config.config.demographics.genderDistribution.female
                        )}
                      </Badge>
                      <Badge variant="outline">
                        Non-binary:{" "}
                        {formatPercentage(
                          config.config.demographics.genderDistribution.nonBinary
                        )}
                      </Badge>
                    </div>
                  </div>
                )}

                {config.config.demographics.incomeDistribution && (
                  <div>
                    <Label className="text-sm text-gray-500">
                      Income Distribution
                    </Label>
                    <div className="flex gap-4 mt-1">
                      <Badge variant="outline">
                        Low:{" "}
                        {formatPercentage(
                          config.config.demographics.incomeDistribution.low
                        )}
                      </Badge>
                      <Badge variant="outline">
                        Medium:{" "}
                        {formatPercentage(
                          config.config.demographics.incomeDistribution.medium
                        )}
                      </Badge>
                      <Badge variant="outline">
                        High:{" "}
                        {formatPercentage(
                          config.config.demographics.incomeDistribution.high
                        )}
                      </Badge>
                    </div>
                  </div>
                )}

                {config.config.demographics.locations &&
                  config.config.demographics.locations.length > 0 && (
                    <div>
                      <Label className="text-sm text-gray-500 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        Locations
                      </Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {config.config.demographics.locations
                          .slice(0, 10)
                          .map((loc) => (
                            <Badge key={loc} variant="secondary">
                              {loc}
                            </Badge>
                          ))}
                        {config.config.demographics.locations.length > 10 && (
                          <Badge variant="outline">
                            +{config.config.demographics.locations.length - 10}{" "}
                            more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                {config.config.demographics.occupations &&
                  config.config.demographics.occupations.length > 0 && (
                    <div>
                      <Label className="text-sm text-gray-500 flex items-center gap-1">
                        <Briefcase className="h-3 w-3" />
                        Occupations
                      </Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {config.config.demographics.occupations
                          .slice(0, 8)
                          .map((occ) => (
                            <Badge key={occ} variant="secondary">
                              {occ}
                            </Badge>
                          ))}
                        {config.config.demographics.occupations.length > 8 && (
                          <Badge variant="outline">
                            +{config.config.demographics.occupations.length - 8}{" "}
                            more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
              </CardContent>
            </Card>
          )}

          {/* Psychographics */}
          {config.config.psychographics && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Psychographics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {config.config.psychographics.values &&
                  config.config.psychographics.values.length > 0 && (
                    <div>
                      <Label className="text-sm text-gray-500">Values</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {config.config.psychographics.values.map((val) => (
                          <Badge key={val} variant="secondary">
                            {val}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                {config.config.psychographics.interests &&
                  config.config.psychographics.interests.length > 0 && (
                    <div>
                      <Label className="text-sm text-gray-500">Interests</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {config.config.psychographics.interests.map((int) => (
                          <Badge key={int} variant="secondary">
                            {int}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                {config.config.psychographics.lifestyles &&
                  config.config.psychographics.lifestyles.length > 0 && (
                    <div>
                      <Label className="text-sm text-gray-500">Lifestyles</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {config.config.psychographics.lifestyles.map((ls) => (
                          <Badge key={ls} variant="secondary">
                            {ls}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                {config.config.psychographics.personalities &&
                  config.config.psychographics.personalities.length > 0 && (
                    <div>
                      <Label className="text-sm text-gray-500">
                        Personalities
                      </Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {config.config.psychographics.personalities.map(
                          (pers) => (
                            <Badge key={pers} variant="secondary">
                              {pers}
                            </Badge>
                          )
                        )}
                      </div>
                    </div>
                  )}
              </CardContent>
            </Card>
          )}

          {/* Context */}
          {config.config.context && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Context
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {config.config.context.industry && (
                  <div>
                    <Label className="text-sm text-gray-500">Industry</Label>
                    <p className="font-medium">{config.config.context.industry}</p>
                  </div>
                )}

                {config.config.context.productExperience &&
                  config.config.context.productExperience.length > 0 && (
                    <div>
                      <Label className="text-sm text-gray-500">
                        Product Experience
                      </Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {config.config.context.productExperience.map((exp) => (
                          <Badge key={exp} variant="secondary">
                            {exp}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                {config.config.context.brandAffinities &&
                  config.config.context.brandAffinities.length > 0 && (
                    <div>
                      <Label className="text-sm text-gray-500">
                        Brand Affinities
                      </Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {config.config.context.brandAffinities.map((brand) => (
                          <Badge key={brand} variant="secondary">
                            {brand}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Related Studies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4" />
                Studies Using This Config
              </CardTitle>
            </CardHeader>
            <CardContent>
              {relatedStudies.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No studies are using this configuration yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {relatedStudies.map((study) => (
                    <Link
                      key={study.id}
                      href={
                        study.status === "completed"
                          ? `/dashboard/studies/${study.id}/results`
                          : `/dashboard/studies/${study.id}`
                      }
                      className="block p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-sm truncate">
                          {study.name}
                        </span>
                        <Badge
                          className={`text-xs ${statusColors[study.status] || ""}`}
                        >
                          {study.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(study.createdAt)}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Configuration Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {config.config.count && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Default Sample Size</span>
                  <span className="font-medium">{config.config.count}</span>
                </div>
              )}
              {config.industry && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Industry</span>
                  <span className="font-medium">{config.industry}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Type</span>
                <span className="font-medium">
                  {config.isTemplate ? "Template" : "Custom"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Last Updated</span>
                <span className="font-medium">{formatDate(config.updatedAt)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
