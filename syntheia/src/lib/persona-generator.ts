/**
 * Persona Generator
 *
 * Generates diverse synthetic personas based on demographic
 * and psychographic parameters for survey simulation.
 *
 * Includes socioeconomic level (NSE) system based on:
 * - AMAI (Mexico) classification
 * - US Census Bureau income quintiles
 * - Realistic education/occupation correlations
 */

import { SyntheticPersona } from "./ssr-engine";
import { generateId } from "./utils";

// ============================================
// SOCIOECONOMIC LEVEL (NSE) SYSTEM
// ============================================

export type SocioeconomicLevel = "upper" | "upper-middle" | "middle" | "lower-middle" | "working" | "lower";

export interface NSEProfile {
  label: string;
  description: string;
  incomeRanges: string[];
  educationWeights: Record<string, number>;
  occupationCategories: OccupationCategory[];
  distribution: number; // Percentage of population
}

// Extended education levels (10 levels - from no formal education to doctoral)
export const EDUCATION_LEVELS = [
  "No formal education",
  "Elementary school",
  "Some high school",
  "High school diploma",
  "Trade/Vocational certificate",
  "Some college",
  "Associate degree",
  "Bachelor's degree",
  "Master's degree",
  "Doctoral/Professional degree",
] as const;

export type EducationLevel = typeof EDUCATION_LEVELS[number];

// Occupation categories for NSE correlation
export type OccupationCategory = "professional" | "whiteCollar" | "skilled" | "service" | "manual" | "unemployed";

// Expanded occupations by category
export const OCCUPATIONS_BY_CATEGORY: Record<OccupationCategory, string[]> = {
  professional: [
    "Doctor",
    "Lawyer",
    "Engineer",
    "Architect",
    "Executive",
    "CEO",
    "CFO",
    "Investment Banker",
    "Surgeon",
    "Dentist",
    "Pharmacist",
    "Scientist",
    "Professor",
    "Software Architect",
    "Data Scientist",
  ],
  whiteCollar: [
    "Accountant",
    "Teacher",
    "Nurse",
    "Analyst",
    "Marketing Specialist",
    "HR Manager",
    "Project Manager",
    "Software Engineer",
    "Graphic Designer",
    "Social Worker",
    "Librarian",
    "Paralegal",
    "Insurance Agent",
    "Real Estate Agent",
    "Financial Advisor",
  ],
  skilled: [
    "Electrician",
    "Plumber",
    "HVAC Technician",
    "Carpenter",
    "Mechanic",
    "Welder",
    "Machinist",
    "Construction Supervisor",
    "Diesel Technician",
    "Elevator Installer",
    "Aircraft Mechanic",
    "Industrial Electrician",
  ],
  service: [
    "Retail Worker",
    "Restaurant Worker",
    "Customer Service Representative",
    "Administrative Assistant",
    "Receptionist",
    "Bank Teller",
    "Hair Stylist",
    "Bartender",
    "Barista",
    "Hotel Staff",
    "Flight Attendant",
    "Security Guard",
    "Childcare Worker",
    "Home Health Aide",
  ],
  manual: [
    "Factory Worker",
    "Warehouse Worker",
    "Farm Worker",
    "Janitor",
    "Cleaner",
    "Landscaper",
    "Delivery Driver",
    "Truck Driver",
    "Construction Laborer",
    "Food Processing Worker",
    "Mover",
    "Packer",
    "Assembly Line Worker",
    "Sanitation Worker",
  ],
  unemployed: [
    "Unemployed (seeking work)",
    "Unemployed (not seeking)",
    "Part-time Worker",
    "Gig Economy Worker",
    "Homemaker",
    "Disabled/Unable to work",
    "Student",
    "Retired",
  ],
};

// All occupations flattened
export const ALL_OCCUPATIONS = Object.values(OCCUPATIONS_BY_CATEGORY).flat();

// NSE Configuration with realistic correlations
// Based on US Census Bureau data and AMAI classification
export const NSE_CONFIG: Record<SocioeconomicLevel, NSEProfile> = {
  upper: {
    label: "Upper Class (Top 5%)",
    description: "Executives, business owners, high-level professionals",
    incomeRanges: ["$200,000+", "$150,000 - $200,000"],
    educationWeights: {
      "Doctoral/Professional degree": 0.35,
      "Master's degree": 0.40,
      "Bachelor's degree": 0.25,
    },
    occupationCategories: ["professional"],
    distribution: 0.05,
  },
  "upper-middle": {
    label: "Upper-Middle Class",
    description: "Professionals, managers, skilled specialists",
    incomeRanges: ["$125,000 - $150,000", "$100,000 - $125,000"],
    educationWeights: {
      "Master's degree": 0.30,
      "Bachelor's degree": 0.50,
      "Associate degree": 0.15,
      "Trade/Vocational certificate": 0.05,
    },
    occupationCategories: ["professional", "whiteCollar"],
    distribution: 0.15,
  },
  middle: {
    label: "Middle Class",
    description: "White-collar workers, technicians, small business owners",
    incomeRanges: ["$75,000 - $100,000", "$60,000 - $75,000"],
    educationWeights: {
      "Bachelor's degree": 0.30,
      "Associate degree": 0.25,
      "Some college": 0.25,
      "Trade/Vocational certificate": 0.15,
      "High school diploma": 0.05,
    },
    occupationCategories: ["whiteCollar", "skilled"],
    distribution: 0.20,
  },
  "lower-middle": {
    label: "Lower-Middle Class",
    description: "Skilled trades, service industry, retail management",
    incomeRanges: ["$50,000 - $60,000", "$40,000 - $50,000"],
    educationWeights: {
      "High school diploma": 0.35,
      "Some college": 0.25,
      "Trade/Vocational certificate": 0.25,
      "Associate degree": 0.10,
      "Some high school": 0.05,
    },
    occupationCategories: ["skilled", "service"],
    distribution: 0.25,
  },
  working: {
    label: "Working Class",
    description: "Service workers, manual laborers, entry-level positions",
    incomeRanges: ["$35,000 - $40,000", "$25,000 - $35,000"],
    educationWeights: {
      "High school diploma": 0.40,
      "Some high school": 0.30,
      "Elementary school": 0.15,
      "Trade/Vocational certificate": 0.10,
      "Some college": 0.05,
    },
    occupationCategories: ["service", "manual"],
    distribution: 0.20,
  },
  lower: {
    label: "Lower Class",
    description: "Minimum wage workers, unemployed, informal economy",
    incomeRanges: ["Under $25,000", "$15,000 - $25,000"],
    educationWeights: {
      "Some high school": 0.30,
      "High school diploma": 0.25,
      "Elementary school": 0.25,
      "No formal education": 0.15,
      "Trade/Vocational certificate": 0.05,
    },
    occupationCategories: ["manual", "unemployed"],
    distribution: 0.15,
  },
};

// NSE distribution for "diverse population" preset
export const DIVERSE_POPULATION_NSE: Record<SocioeconomicLevel, number> = {
  upper: 0.05,
  "upper-middle": 0.15,
  middle: 0.20,
  "lower-middle": 0.25,
  working: 0.20,
  lower: 0.15,
};

// ============================================
// PERSONA CONFIG INTERFACE
// ============================================

export interface PersonaConfig {
  count?: number;
  socioeconomicLevel?: SocioeconomicLevel;
  socioeconomicDistribution?: Partial<Record<SocioeconomicLevel, number>>;
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
    // Updated to include all education levels with realistic distribution
    educationLevels: [...EDUCATION_LEVELS],
    // Updated to include diverse occupations
    occupations: ALL_OCCUPATIONS.slice(0, 30), // First 30 for diversity
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

/**
 * Select education level based on weighted distribution
 */
function selectEducationByWeights(weights: Record<string, number>): string {
  return weightedRandom(weights);
}

/**
 * Select occupation from allowed categories
 */
function selectOccupationByCategories(categories: OccupationCategory[]): string {
  const category = randomFromArray(categories);
  return randomFromArray(OCCUPATIONS_BY_CATEGORY[category]);
}

/**
 * Select NSE level based on distribution weights
 */
function selectNSELevel(distribution: Partial<Record<SocioeconomicLevel, number>>): SocioeconomicLevel {
  // Normalize the distribution
  const total = Object.values(distribution).reduce((a, b) => a + (b || 0), 0);
  const normalized: Record<string, number> = {};

  for (const [level, weight] of Object.entries(distribution)) {
    if (weight) {
      normalized[level] = weight / total;
    }
  }

  return weightedRandom(normalized) as SocioeconomicLevel;
}

/**
 * Generate a persona based on NSE level
 */
function generatePersonaByNSE(
  nseLevel: SocioeconomicLevel,
  config: PersonaConfig = {}
): SyntheticPersona {
  const nseProfile = NSE_CONFIG[nseLevel];
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

  // Select education based on NSE weights
  const education = selectEducationByWeights(nseProfile.educationWeights);

  // Select income from NSE range
  const income = randomFromArray(nseProfile.incomeRanges);

  // Select occupation from NSE-appropriate categories
  const occupation = selectOccupationByCategories(nseProfile.occupationCategories);

  return {
    id: generateId(),
    demographics: {
      age: randomInRange(
        demographics.ageRange?.min || 18,
        demographics.ageRange?.max || 75
      ),
      gender: getGender(demographics.genderDistribution),
      location: randomFromArray(demographics.locations || ["New York, NY"]),
      income,
      education,
      occupation,
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
  // If NSE level is specified, use NSE-based generation
  if (config.socioeconomicLevel) {
    return generatePersonaByNSE(config.socioeconomicLevel, config);
  }

  // If NSE distribution is specified, select a level and generate
  if (config.socioeconomicDistribution) {
    const nseLevel = selectNSELevel(config.socioeconomicDistribution);
    return generatePersonaByNSE(nseLevel, config);
  }

  // Legacy generation without NSE
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

  // NSE-based presets for socioeconomic diversity
  diversePopulation: {
    ...DEFAULT_CONFIG,
    socioeconomicDistribution: DIVERSE_POPULATION_NSE,
  },

  upperClass: {
    ...DEFAULT_CONFIG,
    socioeconomicLevel: "upper" as SocioeconomicLevel,
  },

  upperMiddleClass: {
    ...DEFAULT_CONFIG,
    socioeconomicLevel: "upper-middle" as SocioeconomicLevel,
  },

  middleClass: {
    ...DEFAULT_CONFIG,
    socioeconomicLevel: "middle" as SocioeconomicLevel,
  },

  lowerMiddleClass: {
    ...DEFAULT_CONFIG,
    socioeconomicLevel: "lower-middle" as SocioeconomicLevel,
  },

  workingClass: {
    ...DEFAULT_CONFIG,
    socioeconomicLevel: "working" as SocioeconomicLevel,
  },

  lowerClass: {
    ...DEFAULT_CONFIG,
    socioeconomicLevel: "lower" as SocioeconomicLevel,
  },

  millennials: {
    ...DEFAULT_CONFIG,
    socioeconomicDistribution: DIVERSE_POPULATION_NSE,
    demographics: {
      ...DEFAULT_CONFIG.demographics,
      ageRange: { min: 28, max: 43 },
    },
  },

  genZ: {
    ...DEFAULT_CONFIG,
    socioeconomicDistribution: DIVERSE_POPULATION_NSE,
    demographics: {
      ...DEFAULT_CONFIG.demographics,
      ageRange: { min: 18, max: 27 },
    },
  },

  babyBoomers: {
    ...DEFAULT_CONFIG,
    socioeconomicDistribution: DIVERSE_POPULATION_NSE,
    demographics: {
      ...DEFAULT_CONFIG.demographics,
      ageRange: { min: 60, max: 78 },
    },
  },

  highIncome: {
    ...DEFAULT_CONFIG,
    socioeconomicDistribution: {
      upper: 0.40,
      "upper-middle": 0.40,
      middle: 0.20,
    },
  },

  lowIncome: {
    ...DEFAULT_CONFIG,
    socioeconomicDistribution: {
      working: 0.40,
      lower: 0.40,
      "lower-middle": 0.20,
    },
  },

  techWorkers: {
    ...DEFAULT_CONFIG,
    socioeconomicDistribution: {
      upper: 0.15,
      "upper-middle": 0.45,
      middle: 0.35,
      "lower-middle": 0.05,
    },
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
        "Software Architect",
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
    socioeconomicDistribution: DIVERSE_POPULATION_NSE,
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
    socioeconomicDistribution: {
      upper: 0.10,
      "upper-middle": 0.25,
      middle: 0.35,
      "lower-middle": 0.20,
      working: 0.10,
    },
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
    socioeconomicDistribution: {
      upper: 0.08,
      "upper-middle": 0.25,
      middle: 0.35,
      "lower-middle": 0.22,
      working: 0.10,
    },
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
