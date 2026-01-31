"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface DemographicConfigProps {
  value: {
    ageRange?: { min: number; max: number };
    genderDistribution?: { male: number; female: number; nonBinary: number };
    locations?: string[];
    incomeDistribution?: { low: number; medium: number; high: number };
    educationLevels?: string[];
    occupations?: string[];
  };
  onChange: (value: DemographicConfigProps["value"]) => void;
}

const DEFAULT_LOCATIONS = [
  "New York, NY",
  "Los Angeles, CA",
  "Chicago, IL",
  "Houston, TX",
  "Phoenix, AZ",
  "Philadelphia, PA",
  "San Antonio, TX",
  "San Diego, CA",
  "Dallas, TX",
  "San Jose, CA",
  "Austin, TX",
  "Jacksonville, FL",
  "Fort Worth, TX",
  "Columbus, OH",
  "Charlotte, NC",
  "Seattle, WA",
  "Denver, CO",
  "Boston, MA",
  "Portland, OR",
  "Atlanta, GA",
];

const DEFAULT_EDUCATION_LEVELS = [
  "High school diploma",
  "Some college",
  "Associate degree",
  "Bachelor's degree",
  "Master's degree",
  "Doctoral degree",
];

const DEFAULT_OCCUPATIONS = [
  "Software Engineer",
  "Teacher",
  "Nurse",
  "Sales Representative",
  "Manager",
  "Administrative Assistant",
  "Accountant",
  "Customer Service Representative",
  "Marketing Specialist",
  "Engineer",
  "Retail Worker",
  "Healthcare Worker",
  "Construction Worker",
  "Restaurant Worker",
  "Consultant",
  "Analyst",
  "Student",
  "Retired",
  "Self-employed",
  "Freelancer",
];

export function DemographicConfig({ value, onChange }: DemographicConfigProps) {
  const [newLocation, setNewLocation] = useState("");
  const [newOccupation, setNewOccupation] = useState("");
  const [showAllLocations, setShowAllLocations] = useState(false);
  const [showAllOccupations, setShowAllOccupations] = useState(false);

  const ageRange = value.ageRange || { min: 18, max: 75 };
  const genderDist = value.genderDistribution || { male: 0.48, female: 0.50, nonBinary: 0.02 };
  const incomeDist = value.incomeDistribution || { low: 0.30, medium: 0.45, high: 0.25 };
  const locations = value.locations || DEFAULT_LOCATIONS.slice(0, 5);
  const educationLevels = value.educationLevels || DEFAULT_EDUCATION_LEVELS;
  const occupations = value.occupations || DEFAULT_OCCUPATIONS.slice(0, 10);

  const updateAgeRange = (field: "min" | "max", val: number) => {
    onChange({
      ...value,
      ageRange: { ...ageRange, [field]: val },
    });
  };

  const updateGenderDist = (field: "male" | "female" | "nonBinary", val: number) => {
    const newDist = { ...genderDist, [field]: val / 100 };
    // Normalize to ensure sum is 1
    const total = newDist.male + newDist.female + newDist.nonBinary;
    if (total > 0) {
      newDist.male = newDist.male / total;
      newDist.female = newDist.female / total;
      newDist.nonBinary = newDist.nonBinary / total;
    }
    onChange({ ...value, genderDistribution: newDist });
  };

  const updateIncomeDist = (field: "low" | "medium" | "high", val: number) => {
    const newDist = { ...incomeDist, [field]: val / 100 };
    // Normalize to ensure sum is 1
    const total = newDist.low + newDist.medium + newDist.high;
    if (total > 0) {
      newDist.low = newDist.low / total;
      newDist.medium = newDist.medium / total;
      newDist.high = newDist.high / total;
    }
    onChange({ ...value, incomeDistribution: newDist });
  };

  const toggleLocation = (location: string) => {
    const current = locations;
    const newLocations = current.includes(location)
      ? current.filter((l) => l !== location)
      : [...current, location];
    onChange({ ...value, locations: newLocations });
  };

  const addLocation = () => {
    if (newLocation.trim() && !locations.includes(newLocation.trim())) {
      onChange({ ...value, locations: [...locations, newLocation.trim()] });
      setNewLocation("");
    }
  };

  const toggleEducation = (level: string) => {
    const current = educationLevels;
    const newLevels = current.includes(level)
      ? current.filter((l) => l !== level)
      : [...current, level];
    onChange({ ...value, educationLevels: newLevels });
  };

  const toggleOccupation = (occupation: string) => {
    const current = occupations;
    const newOccupations = current.includes(occupation)
      ? current.filter((o) => o !== occupation)
      : [...current, occupation];
    onChange({ ...value, occupations: newOccupations });
  };

  const addOccupation = () => {
    if (newOccupation.trim() && !occupations.includes(newOccupation.trim())) {
      onChange({ ...value, occupations: [...occupations, newOccupation.trim()] });
      setNewOccupation("");
    }
  };

  const displayedLocations = showAllLocations ? DEFAULT_LOCATIONS : DEFAULT_LOCATIONS.slice(0, 10);
  const displayedOccupations = showAllOccupations ? DEFAULT_OCCUPATIONS : DEFAULT_OCCUPATIONS.slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Demographics</CardTitle>
        <CardDescription>Configure demographic characteristics for your panel</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Age Range */}
        <div className="space-y-3">
          <Label>Age Range</Label>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={18}
                max={100}
                value={ageRange.min}
                onChange={(e) => updateAgeRange("min", parseInt(e.target.value) || 18)}
                className="w-20"
              />
              <span className="text-sm text-gray-500">to</span>
              <Input
                type="number"
                min={18}
                max={100}
                value={ageRange.max}
                onChange={(e) => updateAgeRange("max", parseInt(e.target.value) || 75)}
                className="w-20"
              />
              <span className="text-sm text-gray-500">years</span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 relative">
            <div
              className="bg-[#7C3AED] h-2 rounded-full"
              style={{
                marginLeft: `${((ageRange.min - 18) / (100 - 18)) * 100}%`,
                width: `${((ageRange.max - ageRange.min) / (100 - 18)) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Gender Distribution */}
        <div className="space-y-3">
          <Label>Gender Distribution</Label>
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <span className="text-sm w-20">Male</span>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(genderDist.male * 100)}
                onChange={(e) => updateGenderDist("male", parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm w-12 text-right">{Math.round(genderDist.male * 100)}%</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm w-20">Female</span>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(genderDist.female * 100)}
                onChange={(e) => updateGenderDist("female", parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm w-12 text-right">{Math.round(genderDist.female * 100)}%</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm w-20">Non-binary</span>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(genderDist.nonBinary * 100)}
                onChange={(e) => updateGenderDist("nonBinary", parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm w-12 text-right">{Math.round(genderDist.nonBinary * 100)}%</span>
            </div>
          </div>
          <div className="w-full h-3 rounded-full overflow-hidden flex">
            <div
              className="bg-[#7C3AED] h-full"
              style={{ width: `${genderDist.male * 100}%` }}
            />
            <div
              className="bg-pink-500 h-full"
              style={{ width: `${genderDist.female * 100}%` }}
            />
            <div
              className="bg-purple-500 h-full"
              style={{ width: `${genderDist.nonBinary * 100}%` }}
            />
          </div>
        </div>

        {/* Income Distribution */}
        <div className="space-y-3">
          <Label>Income Distribution</Label>
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <span className="text-sm w-20">Low (&lt;$50K)</span>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(incomeDist.low * 100)}
                onChange={(e) => updateIncomeDist("low", parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm w-12 text-right">{Math.round(incomeDist.low * 100)}%</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm w-20">Medium</span>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(incomeDist.medium * 100)}
                onChange={(e) => updateIncomeDist("medium", parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm w-12 text-right">{Math.round(incomeDist.medium * 100)}%</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm w-20">High ($125K+)</span>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(incomeDist.high * 100)}
                onChange={(e) => updateIncomeDist("high", parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm w-12 text-right">{Math.round(incomeDist.high * 100)}%</span>
            </div>
          </div>
          <div className="w-full h-3 rounded-full overflow-hidden flex">
            <div
              className="bg-yellow-500 h-full"
              style={{ width: `${incomeDist.low * 100}%` }}
            />
            <div
              className="bg-green-500 h-full"
              style={{ width: `${incomeDist.medium * 100}%` }}
            />
            <div
              className="bg-emerald-600 h-full"
              style={{ width: `${incomeDist.high * 100}%` }}
            />
          </div>
        </div>

        {/* Locations */}
        <div className="space-y-3">
          <Label>Locations</Label>
          <div className="flex flex-wrap gap-2">
            {displayedLocations.map((location) => (
              <Badge
                key={location}
                variant={locations.includes(location) ? "default" : "outline"}
                className={`cursor-pointer transition-colors ${
                  locations.includes(location)
                    ? "bg-[#7C3AED] hover:bg-[#6D28D9]"
                    : "hover:bg-gray-100"
                }`}
                onClick={() => toggleLocation(location)}
              >
                {location}
                {locations.includes(location) && (
                  <X className="h-3 w-3 ml-1" />
                )}
              </Badge>
            ))}
            {DEFAULT_LOCATIONS.length > 10 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllLocations(!showAllLocations)}
                className="text-xs"
              >
                {showAllLocations ? "Show less" : `+${DEFAULT_LOCATIONS.length - 10} more`}
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Add custom location..."
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addLocation()}
              className="flex-1"
            />
            <Button variant="outline" size="sm" onClick={addLocation}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Education Levels */}
        <div className="space-y-3">
          <Label>Education Levels</Label>
          <div className="grid grid-cols-2 gap-2">
            {DEFAULT_EDUCATION_LEVELS.map((level) => (
              <div key={level} className="flex items-center space-x-2">
                <Checkbox
                  id={`edu-${level}`}
                  checked={educationLevels.includes(level)}
                  onCheckedChange={() => toggleEducation(level)}
                />
                <label
                  htmlFor={`edu-${level}`}
                  className="text-sm cursor-pointer"
                >
                  {level}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Occupations */}
        <div className="space-y-3">
          <Label>Occupations</Label>
          <div className="flex flex-wrap gap-2">
            {displayedOccupations.map((occupation) => (
              <Badge
                key={occupation}
                variant={occupations.includes(occupation) ? "default" : "outline"}
                className={`cursor-pointer transition-colors ${
                  occupations.includes(occupation)
                    ? "bg-green-500 hover:bg-green-600"
                    : "hover:bg-gray-100"
                }`}
                onClick={() => toggleOccupation(occupation)}
              >
                {occupation}
                {occupations.includes(occupation) && (
                  <X className="h-3 w-3 ml-1" />
                )}
              </Badge>
            ))}
            {DEFAULT_OCCUPATIONS.length > 10 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllOccupations(!showAllOccupations)}
                className="text-xs"
              >
                {showAllOccupations ? "Show less" : `+${DEFAULT_OCCUPATIONS.length - 10} more`}
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Add custom occupation..."
              value={newOccupation}
              onChange={(e) => setNewOccupation(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addOccupation()}
              className="flex-1"
            />
            <Button variant="outline" size="sm" onClick={addOccupation}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
