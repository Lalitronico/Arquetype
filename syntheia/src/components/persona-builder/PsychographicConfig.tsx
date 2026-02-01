"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface PsychographicConfigProps {
  value: {
    values?: string[];
    lifestyles?: string[];
    interests?: string[];
    personalities?: string[];
  };
  onChange: (value: PsychographicConfigProps["value"]) => void;
}

const DEFAULT_VALUES = [
  "Family",
  "Career success",
  "Health and wellness",
  "Financial security",
  "Personal growth",
  "Adventure",
  "Creativity",
  "Community",
  "Independence",
  "Sustainability",
  "Innovation",
  "Tradition",
  "Social impact",
  "Work-life balance",
];

const DEFAULT_LIFESTYLES = [
  "Active and health-conscious",
  "Busy professional",
  "Family-focused homebody",
  "Social butterfly",
  "Outdoor enthusiast",
  "Tech-savvy early adopter",
  "Budget-conscious saver",
  "Luxury-oriented",
  "Minimalist",
  "Eco-conscious",
  "Work-from-home",
  "Urban explorer",
  "Suburban comfort seeker",
  "Rural simple living",
];

const DEFAULT_INTERESTS = [
  "Technology",
  "Sports",
  "Cooking",
  "Travel",
  "Reading",
  "Gaming",
  "Music",
  "Movies",
  "Fitness",
  "Art",
  "Photography",
  "Gardening",
  "DIY projects",
  "Fashion",
  "Cars",
  "Nature",
  "Science",
  "History",
  "Politics",
  "Finance",
];

const DEFAULT_PERSONALITIES = [
  "Analytical and detail-oriented",
  "Creative and imaginative",
  "Practical and grounded",
  "Outgoing and energetic",
  "Reserved and thoughtful",
  "Optimistic and enthusiastic",
  "Cautious and risk-averse",
  "Spontaneous and adventurous",
  "Organized and methodical",
  "Flexible and adaptable",
  "Ambitious and driven",
  "Relaxed and easy-going",
];

export function PsychographicConfig({ value, onChange }: PsychographicConfigProps) {
  const [newValue, setNewValue] = useState("");
  const [newLifestyle, setNewLifestyle] = useState("");
  const [newInterest, setNewInterest] = useState("");
  const [newPersonality, setNewPersonality] = useState("");

  const values = value.values || DEFAULT_VALUES.slice(0, 6);
  const lifestyles = value.lifestyles || DEFAULT_LIFESTYLES.slice(0, 4);
  const interests = value.interests || DEFAULT_INTERESTS.slice(0, 8);
  const personalities = value.personalities || DEFAULT_PERSONALITIES.slice(0, 4);

  const toggleItem = (
    list: string[],
    item: string,
    field: "values" | "lifestyles" | "interests" | "personalities"
  ) => {
    const newList = list.includes(item)
      ? list.filter((i) => i !== item)
      : [...list, item];
    onChange({ ...value, [field]: newList });
  };

  const addItem = (
    newItem: string,
    list: string[],
    field: "values" | "lifestyles" | "interests" | "personalities",
    setNewItem: (val: string) => void
  ) => {
    if (newItem.trim() && !list.includes(newItem.trim())) {
      onChange({ ...value, [field]: [...list, newItem.trim()] });
      setNewItem("");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Psychographics</CardTitle>
        <CardDescription>Define values, lifestyles, interests, and personality traits</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Values */}
        <div className="space-y-3">
          <Label>Values</Label>
          <p className="text-xs text-gray-500">What do your target personas care about?</p>
          <div className="flex flex-wrap gap-2">
            {DEFAULT_VALUES.map((val) => (
              <Badge
                key={val}
                variant={values.includes(val) ? "default" : "outline"}
                className={`cursor-pointer transition-colors ${
                  values.includes(val)
                    ? "bg-violet-500 hover:bg-violet-600 text-white"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
                onClick={() => toggleItem(values, val, "values")}
              >
                {val}
                {values.includes(val) && <X className="h-3 w-3 ml-1" />}
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Add custom value..."
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && addItem(newValue, values, "values", setNewValue)
              }
              className="flex-1"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => addItem(newValue, values, "values", setNewValue)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Lifestyles */}
        <div className="space-y-3">
          <Label>Lifestyles</Label>
          <p className="text-xs text-gray-500">How do your target personas live?</p>
          <div className="flex flex-wrap gap-2">
            {DEFAULT_LIFESTYLES.map((lifestyle) => (
              <Badge
                key={lifestyle}
                variant={lifestyles.includes(lifestyle) ? "default" : "outline"}
                className={`cursor-pointer transition-colors ${
                  lifestyles.includes(lifestyle)
                    ? "bg-cyan-500 hover:bg-cyan-600 text-white"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
                onClick={() => toggleItem(lifestyles, lifestyle, "lifestyles")}
              >
                {lifestyle}
                {lifestyles.includes(lifestyle) && <X className="h-3 w-3 ml-1" />}
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Add custom lifestyle..."
              value={newLifestyle}
              onChange={(e) => setNewLifestyle(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && addItem(newLifestyle, lifestyles, "lifestyles", setNewLifestyle)
              }
              className="flex-1"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => addItem(newLifestyle, lifestyles, "lifestyles", setNewLifestyle)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Interests */}
        <div className="space-y-3">
          <Label>Interests</Label>
          <p className="text-xs text-gray-500">What are your target personas interested in?</p>
          <div className="flex flex-wrap gap-2">
            {DEFAULT_INTERESTS.map((interest) => (
              <Badge
                key={interest}
                variant={interests.includes(interest) ? "default" : "outline"}
                className={`cursor-pointer transition-colors ${
                  interests.includes(interest)
                    ? "bg-amber-500 hover:bg-amber-600 text-white"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
                onClick={() => toggleItem(interests, interest, "interests")}
              >
                {interest}
                {interests.includes(interest) && <X className="h-3 w-3 ml-1" />}
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Add custom interest..."
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && addItem(newInterest, interests, "interests", setNewInterest)
              }
              className="flex-1"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => addItem(newInterest, interests, "interests", setNewInterest)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Personalities */}
        <div className="space-y-3">
          <Label>Personality Traits</Label>
          <p className="text-xs text-gray-500">What personality types do you want to include?</p>
          <div className="flex flex-wrap gap-2">
            {DEFAULT_PERSONALITIES.map((personality) => (
              <Badge
                key={personality}
                variant={personalities.includes(personality) ? "default" : "outline"}
                className={`cursor-pointer transition-colors ${
                  personalities.includes(personality)
                    ? "bg-rose-500 hover:bg-rose-600 text-white"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
                onClick={() => toggleItem(personalities, personality, "personalities")}
              >
                {personality}
                {personalities.includes(personality) && <X className="h-3 w-3 ml-1" />}
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Add custom personality..."
              value={newPersonality}
              onChange={(e) => setNewPersonality(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" &&
                addItem(newPersonality, personalities, "personalities", setNewPersonality)
              }
              className="flex-1"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                addItem(newPersonality, personalities, "personalities", setNewPersonality)
              }
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
