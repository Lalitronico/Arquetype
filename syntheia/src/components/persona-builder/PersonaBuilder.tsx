"use client";

import { useState, useEffect } from "react";
import { Users, Sliders, Upload, Save, Building2, Layers } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PersonaConfig,
  PERSONA_PRESETS,
  PresetName,
  SocioeconomicLevel,
  NSE_CONFIG,
  DIVERSE_POPULATION_NSE,
} from "@/lib/persona-generator";
import { INDUSTRY_TEMPLATES, IndustryTemplate } from "@/lib/industry-templates";
import { DemographicConfig } from "./DemographicConfig";
import { PsychographicConfig } from "./PsychographicConfig";
import { ContextConfig } from "./ContextConfig";
import { CSVImporter, ImportedPersona } from "./CSVImporter";
import { SavedPanelsSelect } from "./SavedPanelsSelect";
import { PersonaPreview } from "./PersonaPreview";
import { SampleSizeCalculator } from "./SampleSizeCalculator";

interface PersonaBuilderProps {
  value: PersonaConfig;
  onChange: (config: PersonaConfig) => void;
  sampleSize: number;
  onSampleSizeChange: (size: number) => void;
}

const SAMPLE_SIZES = [
  { value: 50, label: "50", description: "Quick pulse check" },
  { value: 100, label: "100", description: "Standard study" },
  { value: 250, label: "250", description: "Detailed analysis" },
  { value: 500, label: "500", description: "Statistical significance" },
  { value: 1000, label: "1,000", description: "Enterprise scale" },
];

// Age/Lifestyle-based presets
const PERSONA_PRESET_OPTIONS: { value: PresetName; label: string; description: string }[] = [
  { value: "generalPopulation", label: "General Population", description: "US adults 18-75" },
  { value: "diversePopulation", label: "Diverse Population", description: "All socioeconomic levels" },
  { value: "millennials", label: "Millennials", description: "Ages 28-43, diverse income" },
  { value: "genZ", label: "Gen Z", description: "Ages 18-27, diverse income" },
  { value: "babyBoomers", label: "Baby Boomers", description: "Ages 60-78, diverse income" },
  { value: "techWorkers", label: "Tech Workers", description: "Software & tech professionals" },
  { value: "parentsFamilies", label: "Parents & Families", description: "Adults with children" },
  { value: "healthConscious", label: "Health Conscious", description: "Wellness-focused consumers" },
  { value: "ecoConscious", label: "Eco Conscious", description: "Sustainability-minded" },
];

// Socioeconomic level presets
const NSE_PRESET_OPTIONS: { value: PresetName; label: string; description: string; color: string }[] = [
  { value: "upperClass", label: "Upper Class", description: "Top 5% - Executives, owners", color: "bg-amber-500" },
  { value: "upperMiddleClass", label: "Upper-Middle", description: "Professionals, managers", color: "bg-emerald-500" },
  { value: "middleClass", label: "Middle Class", description: "White-collar, technicians", color: "bg-blue-500" },
  { value: "lowerMiddleClass", label: "Lower-Middle", description: "Skilled trades, retail", color: "bg-cyan-500" },
  { value: "workingClass", label: "Working Class", description: "Service, manual labor", color: "bg-orange-500" },
  { value: "lowerClass", label: "Lower Class", description: "Minimum wage, informal", color: "bg-rose-500" },
  { value: "highIncome", label: "High Income Mix", description: "Upper + Upper-middle", color: "bg-yellow-500" },
  { value: "lowIncome", label: "Low Income Mix", description: "Working + Lower class", color: "bg-red-500" },
];

export function PersonaBuilder({
  value,
  onChange,
  sampleSize,
  onSampleSizeChange,
}: PersonaBuilderProps) {
  const [activeTab, setActiveTab] = useState("presets");
  const [selectedPreset, setSelectedPreset] = useState<PresetName | null>("generalPopulation");
  const [selectedIndustryTemplate, setSelectedIndustryTemplate] = useState<string | null>(null);
  const [importedPersonas, setImportedPersonas] = useState<ImportedPersona[]>([]);
  const [showCalculator, setShowCalculator] = useState(false);
  const [customSampleSize, setCustomSampleSize] = useState<number | null>(null);
  const [socioeconomicLevel, setSocioeconomicLevel] = useState<SocioeconomicLevel | undefined>(undefined);

  // Track source of configuration
  const [configSource, setConfigSource] = useState<"preset" | "industry" | "custom" | "csv" | "saved" | "nse">("preset");

  const handlePresetSelect = (preset: PresetName) => {
    setSelectedPreset(preset);
    setSelectedIndustryTemplate(null);
    setConfigSource("preset");

    const presetConfig = PERSONA_PRESETS[preset];
    // Check if this preset has NSE configuration
    if ("socioeconomicLevel" in presetConfig && presetConfig.socioeconomicLevel) {
      setSocioeconomicLevel(presetConfig.socioeconomicLevel);
    } else if ("socioeconomicDistribution" in presetConfig && presetConfig.socioeconomicDistribution) {
      // For diverse presets, we don't set a single level
      setSocioeconomicLevel(undefined);
    } else {
      setSocioeconomicLevel(undefined);
    }

    onChange({
      ...presetConfig,
      count: sampleSize,
    });
  };

  const handleNSEPresetSelect = (preset: PresetName) => {
    setSelectedPreset(preset);
    setSelectedIndustryTemplate(null);
    setConfigSource("nse");

    const presetConfig = PERSONA_PRESETS[preset];
    if ("socioeconomicLevel" in presetConfig && presetConfig.socioeconomicLevel) {
      setSocioeconomicLevel(presetConfig.socioeconomicLevel);
    } else {
      setSocioeconomicLevel(undefined);
    }

    onChange({
      ...presetConfig,
      count: sampleSize,
    });
  };

  const handleIndustryTemplateSelect = (template: IndustryTemplate) => {
    setSelectedIndustryTemplate(template.id);
    setSelectedPreset(null);
    setConfigSource("industry");
    onChange({
      ...template.config,
      count: sampleSize,
    });
  };

  const handleCustomChange = (updates: Partial<PersonaConfig>) => {
    setSelectedPreset(null);
    setSelectedIndustryTemplate(null);
    setConfigSource("custom");
    onChange({
      ...value,
      ...updates,
      count: sampleSize,
    });
  };

  const handleSocioeconomicChange = (level: SocioeconomicLevel | undefined) => {
    setSocioeconomicLevel(level);
    if (level) {
      onChange({
        ...value,
        socioeconomicLevel: level,
        socioeconomicDistribution: undefined,
        count: sampleSize,
      });
    } else {
      // Custom mode - remove NSE constraints
      const { socioeconomicLevel: _, socioeconomicDistribution: __, ...rest } = value;
      onChange({
        ...rest,
        count: sampleSize,
      });
    }
  };

  const handleCSVImport = (personas: ImportedPersona[]) => {
    setImportedPersonas(personas);
    setSelectedPreset(null);
    setSelectedIndustryTemplate(null);
    setConfigSource("csv");
    // Create a config based on imported data
    // For now, we store the CSV data and let the backend handle it
    onChange({
      ...value,
      count: personas.length || sampleSize,
    });
  };

  const handleSavedConfigSelect = (config: PersonaConfig) => {
    setSelectedPreset(null);
    setSelectedIndustryTemplate(null);
    setConfigSource("saved");
    onChange({
      ...config,
      count: sampleSize,
    });
    setActiveTab("custom"); // Switch to custom to show the loaded config
  };

  // Initialize with default preset
  useEffect(() => {
    if (!value.demographics && !value.psychographics) {
      handlePresetSelect("generalPopulation");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="presets" className="gap-2">
            <Users className="h-4 w-4" />
            Presets
          </TabsTrigger>
          <TabsTrigger value="custom" className="gap-2">
            <Sliders className="h-4 w-4" />
            Custom Build
          </TabsTrigger>
          <TabsTrigger value="csv" className="gap-2">
            <Upload className="h-4 w-4" />
            Import CSV
          </TabsTrigger>
          <TabsTrigger value="saved" className="gap-2">
            <Save className="h-4 w-4" />
            Saved Panels
          </TabsTrigger>
        </TabsList>

        {/* Presets Tab */}
        <TabsContent value="presets" className="space-y-6">
          {/* Basic Presets */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Persona Presets</CardTitle>
              <CardDescription>Quick demographic presets for common use cases</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {PERSONA_PRESET_OPTIONS.map((preset) => (
                  <div
                    key={preset.value}
                    onClick={() => handlePresetSelect(preset.value)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedPreset === preset.value && configSource === "preset"
                        ? "border-[#7C3AED] bg-[#F3F0FF]"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F3F0FF]">
                        <Users className="h-5 w-5 text-[#7C3AED]" />
                      </div>
                      <div>
                        <div className="font-medium">{preset.label}</div>
                        <div className="text-sm text-gray-500">{preset.description}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Socioeconomic Level (NSE) Presets */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Socioeconomic Level (NSE)
              </CardTitle>
              <CardDescription>
                Target specific income/education levels with realistic correlations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {NSE_PRESET_OPTIONS.map((preset) => (
                  <div
                    key={preset.value}
                    onClick={() => handleNSEPresetSelect(preset.value)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedPreset === preset.value && configSource === "nse"
                        ? "border-[#7C3AED] bg-[#F3F0FF]"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${preset.color}`}>
                        <Layers className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{preset.label}</div>
                        <div className="text-xs text-gray-500">{preset.description}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Industry Templates */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Industry Templates
              </CardTitle>
              <CardDescription>
                Pre-configured panels optimized for specific industries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {INDUSTRY_TEMPLATES.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => handleIndustryTemplateSelect(template)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedIndustryTemplate === template.id && configSource === "industry"
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                        <Building2 className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{template.name}</div>
                        <div className="text-xs text-gray-500 line-clamp-2">{template.description}</div>
                        <Badge variant="outline" className="mt-2 text-xs">
                          {template.industry}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Custom Build Tab */}
        <TabsContent value="custom" className="space-y-6">
          <DemographicConfig
            value={value.demographics || {}}
            onChange={(demographics) => handleCustomChange({ demographics })}
            socioeconomicLevel={socioeconomicLevel}
            onSocioeconomicChange={handleSocioeconomicChange}
          />
          <PsychographicConfig
            value={value.psychographics || {}}
            onChange={(psychographics) => handleCustomChange({ psychographics })}
          />
          <ContextConfig
            value={value.context || {}}
            onChange={(context) => handleCustomChange({ context })}
          />
        </TabsContent>

        {/* CSV Import Tab */}
        <TabsContent value="csv" className="space-y-6">
          <CSVImporter onImport={handleCSVImport} />
          {importedPersonas.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Imported Personas</CardTitle>
                <CardDescription>
                  {importedPersonas.length} personas imported from CSV
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600">
                  <p>The following data was imported:</p>
                  <ul className="mt-2 list-disc list-inside">
                    {importedPersonas[0] && Object.keys(importedPersonas[0]).map((key) => (
                      <li key={key} className="capitalize">{key}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Saved Panels Tab */}
        <TabsContent value="saved" className="space-y-6">
          <SavedPanelsSelect
            currentConfig={value}
            onSelect={handleSavedConfigSelect}
          />
        </TabsContent>
      </Tabs>

      {/* Sample Size Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Sample Size</CardTitle>
              <CardDescription>How many synthetic respondents to include</CardDescription>
            </div>
            <button
              onClick={() => setShowCalculator(!showCalculator)}
              className="text-sm text-[#7C3AED] hover:text-[#6D28D9] font-medium flex items-center gap-1"
            >
              {showCalculator ? "Use presets" : "Calculate optimal size"}
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {showCalculator ? (
            <>
              <SampleSizeCalculator
                onCalculate={(size) => {
                  setCustomSampleSize(size);
                  onSampleSizeChange(size);
                }}
                maxSampleSize={1000}
              />
              {customSampleSize && !SAMPLE_SIZES.some(s => s.value === customSampleSize) && (
                <div className="p-4 rounded-lg border-2 border-[#7C3AED] bg-[#F3F0FF] text-center">
                  <div className="font-bold text-lg">{customSampleSize.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">Calculated sample size</div>
                  <div className="mt-2 text-sm font-medium text-[#7C3AED]">
                    {customSampleSize} credits
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="grid gap-3 sm:grid-cols-5">
              {SAMPLE_SIZES.map((size) => (
                <div
                  key={size.value}
                  onClick={() => {
                    setCustomSampleSize(null);
                    onSampleSizeChange(size.value);
                  }}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all text-center ${
                    sampleSize === size.value && customSampleSize === null
                      ? "border-[#7C3AED] bg-[#F3F0FF]"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="font-bold text-lg">{size.label}</div>
                  <div className="text-xs text-gray-500">{size.description}</div>
                  <div className="mt-2 text-sm font-medium text-[#7C3AED]">
                    {size.value} credits
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Persona Preview */}
      <PersonaPreview config={value} count={3} />

      {/* Current Config Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Configuration Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">
              Source: {configSource}
            </Badge>
            {selectedPreset && configSource === "preset" && (
              <Badge variant="secondary">
                Preset: {PERSONA_PRESET_OPTIONS.find((p) => p.value === selectedPreset)?.label}
              </Badge>
            )}
            {selectedPreset && configSource === "nse" && (
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                NSE: {NSE_PRESET_OPTIONS.find((p) => p.value === selectedPreset)?.label}
              </Badge>
            )}
            {socioeconomicLevel && (
              <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">
                {NSE_CONFIG[socioeconomicLevel].label}
              </Badge>
            )}
            {value.socioeconomicDistribution && !socioeconomicLevel && (
              <Badge variant="secondary" className="bg-violet-100 text-violet-800">
                Diverse NSE Distribution
              </Badge>
            )}
            {selectedIndustryTemplate && configSource === "industry" && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Industry: {INDUSTRY_TEMPLATES.find((t) => t.id === selectedIndustryTemplate)?.name}
              </Badge>
            )}
            {importedPersonas.length > 0 && configSource === "csv" && (
              <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                CSV: {importedPersonas.length} personas
              </Badge>
            )}
            <Badge className="bg-[#F3F0FF]0">
              {sampleSize} respondents
            </Badge>
            {value.demographics?.ageRange && (
              <Badge variant="outline">
                Ages {value.demographics.ageRange.min}-{value.demographics.ageRange.max}
              </Badge>
            )}
            {value.context?.industry && (
              <Badge variant="outline">
                {value.context.industry}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
