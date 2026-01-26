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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ContextConfigProps {
  value: {
    industry?: string;
    productExperience?: string[];
    brandAffinities?: string[];
  };
  onChange: (value: ContextConfigProps["value"]) => void;
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

const DEFAULT_PRODUCT_EXPERIENCE = [
  "Daily user",
  "Regular user",
  "Occasional user",
  "First-time user",
  "Former user",
  "Evaluating",
  "Never used",
];

const DEFAULT_BRANDS_BY_INDUSTRY: Record<string, string[]> = {
  Technology: ["Apple", "Google", "Microsoft", "Amazon", "Meta", "Samsung", "Netflix", "Spotify"],
  Healthcare: ["CVS", "Walgreens", "Kaiser", "UnitedHealth", "Mayo Clinic", "Pfizer", "Johnson & Johnson"],
  Finance: ["JPMorgan Chase", "Bank of America", "Fidelity", "Vanguard", "American Express", "Visa", "PayPal"],
  Retail: ["Amazon", "Target", "Walmart", "Costco", "Nike", "Best Buy", "Home Depot", "IKEA"],
  Education: ["Pearson", "McGraw-Hill", "Coursera", "Khan Academy", "Udemy", "LinkedIn Learning"],
  Entertainment: ["Netflix", "Disney", "Spotify", "YouTube", "TikTok", "HBO", "Twitch"],
  "Food & Beverage": ["Whole Foods", "Trader Joe's", "Starbucks", "Chipotle", "McDonald's", "Coca-Cola"],
  Automotive: ["Toyota", "Ford", "Tesla", "Honda", "BMW", "Mercedes", "Chevrolet"],
  "Travel & Hospitality": ["Marriott", "Airbnb", "Delta", "United", "Expedia", "Hilton", "Southwest"],
  "Real Estate": ["Zillow", "Redfin", "Realtor.com", "Coldwell Banker", "RE/MAX"],
  Manufacturing: ["GE", "Siemens", "3M", "Caterpillar", "Honeywell"],
  "Professional Services": ["Salesforce", "SAP", "Oracle", "IBM", "Deloitte", "McKinsey"],
  "Non-profit": ["Red Cross", "UNICEF", "Habitat for Humanity", "United Way"],
  Other: [],
};

export function ContextConfig({ value, onChange }: ContextConfigProps) {
  const [newBrand, setNewBrand] = useState("");

  const industry = value.industry || "";
  const productExperience = value.productExperience || DEFAULT_PRODUCT_EXPERIENCE.slice(0, 4);
  const brandAffinities = value.brandAffinities || [];

  const suggestedBrands = industry ? DEFAULT_BRANDS_BY_INDUSTRY[industry] || [] : [];

  const toggleProductExperience = (exp: string) => {
    const newExperience = productExperience.includes(exp)
      ? productExperience.filter((e) => e !== exp)
      : [...productExperience, exp];
    onChange({ ...value, productExperience: newExperience });
  };

  const toggleBrand = (brand: string) => {
    const newBrands = brandAffinities.includes(brand)
      ? brandAffinities.filter((b) => b !== brand)
      : [...brandAffinities, brand];
    onChange({ ...value, brandAffinities: newBrands });
  };

  const addBrand = () => {
    if (newBrand.trim() && !brandAffinities.includes(newBrand.trim())) {
      onChange({ ...value, brandAffinities: [...brandAffinities, newBrand.trim()] });
      setNewBrand("");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Context</CardTitle>
        <CardDescription>Set industry context, product experience, and brand affinities</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Industry */}
        <div className="space-y-3">
          <Label>Industry</Label>
          <Select
            value={industry}
            onValueChange={(val) => onChange({ ...value, industry: val })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select industry" />
            </SelectTrigger>
            <SelectContent>
              {INDUSTRIES.map((ind) => (
                <SelectItem key={ind} value={ind}>
                  {ind}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Product Experience */}
        <div className="space-y-3">
          <Label>Product Experience Levels</Label>
          <p className="text-xs text-gray-500">What levels of experience should personas have with the product?</p>
          <div className="grid grid-cols-2 gap-2">
            {DEFAULT_PRODUCT_EXPERIENCE.map((exp) => (
              <div key={exp} className="flex items-center space-x-2">
                <Checkbox
                  id={`exp-${exp}`}
                  checked={productExperience.includes(exp)}
                  onCheckedChange={() => toggleProductExperience(exp)}
                />
                <label htmlFor={`exp-${exp}`} className="text-sm cursor-pointer">
                  {exp}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Brand Affinities */}
        <div className="space-y-3">
          <Label>Brand Affinities</Label>
          <p className="text-xs text-gray-500">What brands do your target personas have affinity towards?</p>

          {/* Selected Brands */}
          {brandAffinities.length > 0 && (
            <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg">
              {brandAffinities.map((brand) => (
                <Badge
                  key={brand}
                  variant="default"
                  className="bg-indigo-500 hover:bg-indigo-600 cursor-pointer"
                  onClick={() => toggleBrand(brand)}
                >
                  {brand}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              ))}
            </div>
          )}

          {/* Suggested Brands */}
          {suggestedBrands.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs text-gray-500">Suggested for {industry}:</span>
              <div className="flex flex-wrap gap-2">
                {suggestedBrands.map((brand) => (
                  <Badge
                    key={brand}
                    variant={brandAffinities.includes(brand) ? "default" : "outline"}
                    className={`cursor-pointer transition-colors ${
                      brandAffinities.includes(brand)
                        ? "bg-indigo-500 hover:bg-indigo-600"
                        : "hover:bg-gray-100"
                    }`}
                    onClick={() => toggleBrand(brand)}
                  >
                    {brand}
                    {brandAffinities.includes(brand) && <X className="h-3 w-3 ml-1" />}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Input
              placeholder="Add custom brand..."
              value={newBrand}
              onChange={(e) => setNewBrand(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addBrand()}
              className="flex-1"
            />
            <Button variant="outline" size="sm" onClick={addBrand}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
