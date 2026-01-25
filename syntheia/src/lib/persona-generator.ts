/**
 * Persona Generator
 *
 * Generates diverse synthetic personas based on demographic
 * and psychographic parameters for survey simulation.
 */

import { SyntheticPersona } from "./ssr-engine";
import { generateId } from "./utils";

export interface PersonaConfig {
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
}

// Default distributions based on US census data
const DEFAULT_CONFIG: PersonaConfig = {
  count: 100,
  demographics: {
    ageRange: { min: 18, max: 75 },
    genderDistribution: { male: 0.48, female: 0.50, nonBinary: 0.02 },
    locations: [
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
    ],
    incomeDistribution: { low: 0.30, medium: 0.45, high: 0.25 },
    educationLevels: [
      "High school diploma",
      "Some college",
      "Associate degree",
      "Bachelor's degree",
      "Master's degree",
      "Doctoral degree",
    ],
    occupations: [
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
    ],
  },
  psychographics: {
    values: [
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
    ],
    lifestyles: [
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
    ],
    interests: [
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
    ],
    personalities: [
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
    ],
  },
};

function randomFromArray<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomSubset<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function randomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function weightedRandom(distribution: Record<string, number>): string {
  const random = Math.random();
  let cumulative = 0;

  for (const [key, weight] of Object.entries(distribution)) {
    cumulative += weight;
    if (random <= cumulative) {
      return key;
    }
  }

  return Object.keys(distribution)[0];
}

function getIncomeLevel(level: string): string {
  const levels: Record<string, string[]> = {
    low: ["Under $25,000", "$25,000 - $35,000", "$35,000 - $50,000"],
    medium: ["$50,000 - $75,000", "$75,000 - $100,000", "$100,000 - $125,000"],
    high: ["$125,000 - $150,000", "$150,000 - $200,000", "Over $200,000"],
  };
  return randomFromArray(levels[level] || levels.medium);
}

function getGender(
  distribution?: { male: number; female: number; nonBinary: number }
): SyntheticPersona["demographics"]["gender"] {
  const dist = distribution || { male: 0.48, female: 0.50, nonBinary: 0.02 };
  const result = weightedRandom({
    male: dist.male,
    female: dist.female,
    nonBinary: dist.nonBinary,
  });

  if (result === "nonBinary") return "non-binary";
  return result as "male" | "female";
}

export function generatePersona(
  config: PersonaConfig = {}
): SyntheticPersona {
  const defaultDemo = DEFAULT_CONFIG.demographics!;
  const defaultPsych = DEFAULT_CONFIG.psychographics!;

  const demographics = {
    ...defaultDemo,
    ...config.demographics,
  };

  const psychographics = {
    ...defaultPsych,
    ...config.psychographics,
  };

  const context = config.context;

  const incomeLevel = weightedRandom(demographics.incomeDistribution || { low: 0.30, medium: 0.45, high: 0.25 });

  return {
    id: generateId(),
    demographics: {
      age: randomInRange(
        demographics.ageRange?.min || 18,
        demographics.ageRange?.max || 75
      ),
      gender: getGender(demographics.genderDistribution),
      location: randomFromArray(demographics.locations || ["New York, NY"]),
      income: getIncomeLevel(incomeLevel),
      education: randomFromArray(demographics.educationLevels || ["Bachelor's degree"]),
      occupation: randomFromArray(demographics.occupations || ["Professional"]),
    },
    psychographics: {
      values: randomSubset(psychographics?.values || [], 3),
      lifestyle: randomFromArray(psychographics?.lifestyles || ["Active and health-conscious"]),
      interests: randomSubset(psychographics?.interests || [], 4),
      personality: randomFromArray(psychographics?.personalities || ["Analytical and detail-oriented"]),
    },
    context: {
      industry: context?.industry,
      productExperience: context?.productExperience
        ? randomFromArray(context.productExperience)
        : undefined,
      brandAffinity: context?.brandAffinities
        ? randomSubset(context.brandAffinities, 2)
        : undefined,
    },
  };
}

export function generatePanel(
  config: PersonaConfig = {}
): SyntheticPersona[] {
  const count = config.count || DEFAULT_CONFIG.count || 100;
  return Array.from({ length: count }, () => generatePersona(config));
}

// Preset persona configurations for common use cases
export const PERSONA_PRESETS = {
  generalPopulation: DEFAULT_CONFIG,

  millennials: {
    ...DEFAULT_CONFIG,
    demographics: {
      ...DEFAULT_CONFIG.demographics,
      ageRange: { min: 28, max: 43 },
    },
  },

  genZ: {
    ...DEFAULT_CONFIG,
    demographics: {
      ...DEFAULT_CONFIG.demographics,
      ageRange: { min: 18, max: 27 },
    },
  },

  babyBoomers: {
    ...DEFAULT_CONFIG,
    demographics: {
      ...DEFAULT_CONFIG.demographics,
      ageRange: { min: 60, max: 78 },
    },
  },

  highIncome: {
    ...DEFAULT_CONFIG,
    demographics: {
      ...DEFAULT_CONFIG.demographics,
      incomeDistribution: { low: 0.05, medium: 0.25, high: 0.70 },
    },
  },

  techWorkers: {
    ...DEFAULT_CONFIG,
    demographics: {
      ...DEFAULT_CONFIG.demographics,
      ageRange: { min: 22, max: 45 },
      occupations: [
        "Software Engineer",
        "Product Manager",
        "UX Designer",
        "Data Scientist",
        "DevOps Engineer",
        "QA Engineer",
        "Technical Writer",
        "Engineering Manager",
        "CTO",
        "Startup Founder",
      ],
      locations: [
        "San Francisco, CA",
        "Seattle, WA",
        "Austin, TX",
        "New York, NY",
        "Boston, MA",
        "Denver, CO",
        "Portland, OR",
        "Los Angeles, CA",
        "San Jose, CA",
        "Remote",
      ],
    },
  },

  parentsFamilies: {
    ...DEFAULT_CONFIG,
    demographics: {
      ...DEFAULT_CONFIG.demographics,
      ageRange: { min: 28, max: 55 },
    },
    psychographics: {
      ...DEFAULT_CONFIG.psychographics,
      values: [
        "Family",
        "Children's education",
        "Financial security",
        "Health",
        "Safety",
        "Work-life balance",
        "Quality time",
        "Stability",
      ],
      lifestyles: [
        "Family-focused homebody",
        "Busy working parent",
        "Stay-at-home parent",
        "Active family",
        "Suburban family life",
      ],
    },
  },

  healthConscious: {
    ...DEFAULT_CONFIG,
    psychographics: {
      ...DEFAULT_CONFIG.psychographics,
      values: [
        "Health and wellness",
        "Fitness",
        "Nutrition",
        "Mental health",
        "Work-life balance",
        "Self-care",
        "Sustainability",
      ],
      lifestyles: [
        "Active and health-conscious",
        "Fitness enthusiast",
        "Clean eating advocate",
        "Mindfulness practitioner",
        "Outdoor enthusiast",
      ],
      interests: [
        "Fitness",
        "Nutrition",
        "Yoga",
        "Running",
        "Hiking",
        "Meditation",
        "Healthy cooking",
        "Supplements",
        "Sleep optimization",
        "Mental wellness",
      ],
    },
  },

  ecoConscious: {
    ...DEFAULT_CONFIG,
    psychographics: {
      ...DEFAULT_CONFIG.psychographics,
      values: [
        "Sustainability",
        "Environmental protection",
        "Ethical consumption",
        "Climate action",
        "Community",
        "Social responsibility",
      ],
      lifestyles: [
        "Eco-conscious",
        "Minimalist",
        "Zero-waste advocate",
        "Ethical consumer",
        "Sustainable living",
      ],
      interests: [
        "Sustainability",
        "Climate change",
        "Renewable energy",
        "Recycling",
        "Organic products",
        "Electric vehicles",
        "Local sourcing",
        "Nature",
      ],
    },
  },
};

export type PresetName = keyof typeof PERSONA_PRESETS;
