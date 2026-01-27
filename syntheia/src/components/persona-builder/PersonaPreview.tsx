"use client";

import { useState, useEffect } from "react";
import { RefreshCw, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PersonaConfig, generatePersona } from "@/lib/persona-generator";
import { SyntheticPersona } from "@/lib/ssr-engine";

interface PersonaPreviewProps {
  config: PersonaConfig;
  count?: number;
}

export function PersonaPreview({ config, count = 3 }: PersonaPreviewProps) {
  const [personas, setPersonas] = useState<SyntheticPersona[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateSamples = () => {
    setIsGenerating(true);
    // Small delay to show loading state
    setTimeout(() => {
      const newPersonas = Array.from({ length: count }, () => generatePersona(config));
      setPersonas(newPersonas);
      setIsGenerating(false);
    }, 300);
  };

  useEffect(() => {
    generateSamples();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getGenderDisplay = (gender: string) => {
    switch (gender) {
      case "male":
        return "M";
      case "female":
        return "F";
      case "non-binary":
        return "NB";
      default:
        return gender;
    }
  };

  const getGenderColor = (gender: string) => {
    switch (gender) {
      case "male":
        return "bg-blue-100 text-blue-700";
      case "female":
        return "bg-pink-100 text-pink-700";
      case "non-binary":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Preview ({count} sample personas)</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={generateSamples}
            disabled={isGenerating}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isGenerating ? "animate-spin" : ""}`} />
            Regenerate
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-3">
          {personas.map((persona, index) => (
            <div
              key={persona.id || index}
              className="p-4 rounded-lg border bg-gray-50 space-y-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white border">
                  <User className="h-5 w-5 text-gray-500" />
                </div>
                <div>
                  <div className="font-medium text-sm">
                    Persona {index + 1}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{persona.demographics.age} yrs</span>
                    <Badge
                      variant="secondary"
                      className={`text-[10px] px-1.5 py-0 ${getGenderColor(persona.demographics.gender)}`}
                    >
                      {getGenderDisplay(persona.demographics.gender)}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Location</span>
                  <span className="font-medium truncate ml-2 max-w-[120px]">
                    {persona.demographics.location}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Occupation</span>
                  <span className="font-medium truncate ml-2 max-w-[120px]">
                    {persona.demographics.occupation}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Income</span>
                  <span className="font-medium truncate ml-2 max-w-[120px]">
                    {persona.demographics.income}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Education</span>
                  <span className="font-medium truncate ml-2 max-w-[120px]">
                    {persona.demographics.education}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t">
                <div className="text-[10px] text-gray-500 mb-1">Personality</div>
                <div className="text-xs font-medium truncate">
                  {persona.psychographics.personality}
                </div>
              </div>

              <div className="pt-2 border-t">
                <div className="text-[10px] text-gray-500 mb-1">Lifestyle</div>
                <div className="text-xs font-medium truncate">
                  {persona.psychographics.lifestyle}
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {persona.psychographics.interests.slice(0, 3).map((interest, i) => (
                  <Badge
                    key={i}
                    variant="outline"
                    className="text-[10px] px-1.5 py-0"
                  >
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
