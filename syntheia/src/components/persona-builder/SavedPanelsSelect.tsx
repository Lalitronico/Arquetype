"use client";

import { useState, useEffect } from "react";
import { Save, Trash2, RefreshCw, Clock, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PersonaConfig } from "@/lib/persona-generator";

interface SavedPanelConfig {
  id: string;
  name: string;
  description?: string;
  config: PersonaConfig;
  industry?: string;
  isTemplate?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SavedPanelsSelectProps {
  currentConfig: PersonaConfig;
  onSelect: (config: PersonaConfig) => void;
  onSave?: (name: string, description: string, industry: string) => Promise<void>;
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

export function SavedPanelsSelect({
  currentConfig,
  onSelect,
  onSave,
}: SavedPanelsSelectProps) {
  const [savedConfigs, setSavedConfigs] = useState<SavedPanelConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [saveDescription, setSaveDescription] = useState("");
  const [saveIndustry, setSaveIndustry] = useState("");
  const [filterIndustry, setFilterIndustry] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const fetchConfigs = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/panel-configs");
      if (response.ok) {
        const data = await response.json();
        setSavedConfigs(data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch saved configs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const handleSave = async () => {
    if (!saveName.trim()) return;

    setIsSaving(true);
    setError(null);

    try {
      if (onSave) {
        await onSave(saveName, saveDescription, saveIndustry);
      } else {
        const response = await fetch("/api/panel-configs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: saveName,
            description: saveDescription,
            industry: saveIndustry,
            config: currentConfig,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to save configuration");
        }
      }

      setSaveDialogOpen(false);
      setSaveName("");
      setSaveDescription("");
      setSaveIndustry("");
      fetchConfigs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    try {
      const response = await fetch(`/api/panel-configs/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setSavedConfigs((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete config:", err);
    } finally {
      setIsDeleting(null);
    }
  };

  const filteredConfigs = filterIndustry
    ? savedConfigs.filter((c) => c.industry === filterIndustry)
    : savedConfigs;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Saved Panel Configurations</CardTitle>
            <CardDescription>Load or save panel configurations for reuse</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchConfigs}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
            <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Save className="h-4 w-4" />
                  Save Current
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Save Panel Configuration</DialogTitle>
                  <DialogDescription>
                    Save the current panel configuration for future use
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="save-name">Name</Label>
                    <Input
                      id="save-name"
                      placeholder="e.g., Tech Early Adopters"
                      value={saveName}
                      onChange={(e) => setSaveName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="save-description">Description (optional)</Label>
                    <Textarea
                      id="save-description"
                      placeholder="Describe this panel configuration..."
                      value={saveDescription}
                      onChange={(e) => setSaveDescription(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="save-industry">Industry (optional)</Label>
                    <Select value={saveIndustry} onValueChange={setSaveIndustry}>
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
                  {error && (
                    <p className="text-sm text-red-500">{error}</p>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setSaveDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={!saveName.trim() || isSaving}
                  >
                    {isSaving ? "Saving..." : "Save Configuration"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filter by Industry */}
        <div className="flex items-center gap-4">
          <Label className="text-sm">Filter by industry:</Label>
          <Select value={filterIndustry} onValueChange={setFilterIndustry}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All industries" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All industries</SelectItem>
              {INDUSTRIES.map((ind) => (
                <SelectItem key={ind} value={ind}>
                  {ind}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Saved Configs List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : filteredConfigs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {savedConfigs.length === 0 ? (
              <p>No saved configurations yet. Save your first one above!</p>
            ) : (
              <p>No configurations match the selected filter.</p>
            )}
          </div>
        ) : (
          <div className="grid gap-3">
            {filteredConfigs.map((config) => (
              <div
                key={config.id}
                className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onSelect(config.config)}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium truncate">{config.name}</span>
                    {config.isTemplate && (
                      <Badge variant="secondary" className="text-xs">
                        Template
                      </Badge>
                    )}
                  </div>
                  {config.description && (
                    <p className="text-sm text-gray-500 truncate mb-2">
                      {config.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-gray-400">
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
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSelect(config.config)}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    Load
                  </Button>
                  {!config.isTemplate && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(config.id)}
                      disabled={isDeleting === config.id}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      {isDeleting === config.id ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
