export interface SurveyTemplate {
  id: string;
  name: string;
  description: string;
  category: "customer" | "product" | "market" | "brand" | "employee";
  icon: string; // Lucide icon name
  questions: Question[];
  suggestedPanelConfig: PanelConfig;
  suggestedSampleSize: number;
}

interface Question {
  id: string;
  text: string;
  type: "rating" | "open" | "multiple_choice";
  required: boolean;
  options?: string[];
  scale?: { min: number; max: number; labels?: { min: string; max: string } };
}

interface PanelConfig {
  demographics: {
    ageRange?: { min: number; max: number };
    genders?: string[];
    locations?: string[];
    incomelevels?: string[];
    education?: string[];
  };
}

export const surveyTemplates: SurveyTemplate[] = [
  {
    id: "nps",
    name: "Net Promoter Score (NPS)",
    description: "Measure customer loyalty and likelihood to recommend your product or service.",
    category: "customer",
    icon: "TrendingUp",
    suggestedSampleSize: 100,
    suggestedPanelConfig: {
      demographics: {
        ageRange: { min: 18, max: 65 },
        genders: ["male", "female", "non-binary"],
      },
    },
    questions: [
      {
        id: "nps_score",
        text: "On a scale of 0-10, how likely are you to recommend our product/service to a friend or colleague?",
        type: "rating",
        required: true,
        scale: { min: 0, max: 10, labels: { min: "Not at all likely", max: "Extremely likely" } },
      },
      {
        id: "nps_reason",
        text: "What is the primary reason for your score?",
        type: "open",
        required: true,
      },
      {
        id: "nps_improve",
        text: "What could we do to improve your experience?",
        type: "open",
        required: false,
      },
    ],
  },
  {
    id: "csat",
    name: "Customer Satisfaction (CSAT)",
    description: "Evaluate overall customer satisfaction with your product, service, or recent interaction.",
    category: "customer",
    icon: "Smile",
    suggestedSampleSize: 150,
    suggestedPanelConfig: {
      demographics: {
        ageRange: { min: 18, max: 70 },
        genders: ["male", "female", "non-binary"],
      },
    },
    questions: [
      {
        id: "csat_overall",
        text: "How satisfied are you with your overall experience with our product/service?",
        type: "rating",
        required: true,
        scale: { min: 1, max: 5, labels: { min: "Very dissatisfied", max: "Very satisfied" } },
      },
      {
        id: "csat_quality",
        text: "How satisfied are you with the quality of our product/service?",
        type: "rating",
        required: true,
        scale: { min: 1, max: 5, labels: { min: "Very dissatisfied", max: "Very satisfied" } },
      },
      {
        id: "csat_value",
        text: "How satisfied are you with the value for money?",
        type: "rating",
        required: true,
        scale: { min: 1, max: 5, labels: { min: "Very dissatisfied", max: "Very satisfied" } },
      },
      {
        id: "csat_support",
        text: "How satisfied are you with customer support?",
        type: "rating",
        required: true,
        scale: { min: 1, max: 5, labels: { min: "Very dissatisfied", max: "Very satisfied" } },
      },
      {
        id: "csat_feedback",
        text: "What aspects of our product/service do you value most?",
        type: "open",
        required: false,
      },
    ],
  },
  {
    id: "product_feedback",
    name: "Product Feedback",
    description: "Collect detailed feedback on product features, usability, and improvement areas.",
    category: "product",
    icon: "Package",
    suggestedSampleSize: 200,
    suggestedPanelConfig: {
      demographics: {
        ageRange: { min: 25, max: 55 },
        genders: ["male", "female", "non-binary"],
      },
    },
    questions: [
      {
        id: "pf_ease",
        text: "How easy is it to use our product?",
        type: "rating",
        required: true,
        scale: { min: 1, max: 5, labels: { min: "Very difficult", max: "Very easy" } },
      },
      {
        id: "pf_features",
        text: "How satisfied are you with the current features?",
        type: "rating",
        required: true,
        scale: { min: 1, max: 5, labels: { min: "Very dissatisfied", max: "Very satisfied" } },
      },
      {
        id: "pf_missing",
        text: "What features do you wish our product had?",
        type: "open",
        required: true,
      },
      {
        id: "pf_frustrations",
        text: "What frustrates you most about using our product?",
        type: "open",
        required: true,
      },
      {
        id: "pf_frequency",
        text: "How often do you use our product?",
        type: "multiple_choice",
        required: true,
        options: ["Daily", "Several times a week", "Weekly", "Monthly", "Rarely"],
      },
    ],
  },
  {
    id: "market_research",
    name: "Market Research",
    description: "Understand market dynamics, competitor positioning, and consumer preferences.",
    category: "market",
    icon: "BarChart2",
    suggestedSampleSize: 300,
    suggestedPanelConfig: {
      demographics: {
        ageRange: { min: 18, max: 65 },
        genders: ["male", "female", "non-binary"],
        incomelevels: ["low", "middle", "upper-middle", "high"],
      },
    },
    questions: [
      {
        id: "mr_awareness",
        text: "Have you heard of [Brand/Product] before today?",
        type: "multiple_choice",
        required: true,
        options: ["Yes, I use it regularly", "Yes, I've used it before", "Yes, but I've never used it", "No, this is the first time"],
      },
      {
        id: "mr_competitors",
        text: "Which similar products or services have you used in the past 6 months?",
        type: "open",
        required: true,
      },
      {
        id: "mr_factors",
        text: "What factors are most important when choosing a product in this category?",
        type: "open",
        required: true,
      },
      {
        id: "mr_purchase_intent",
        text: "How likely are you to purchase this type of product in the next 3 months?",
        type: "rating",
        required: true,
        scale: { min: 1, max: 5, labels: { min: "Very unlikely", max: "Very likely" } },
      },
      {
        id: "mr_price_sensitivity",
        text: "How important is price when making a purchase decision in this category?",
        type: "rating",
        required: true,
        scale: { min: 1, max: 5, labels: { min: "Not important", max: "Very important" } },
      },
    ],
  },
  {
    id: "brand_perception",
    name: "Brand Perception",
    description: "Measure brand awareness, image, and emotional associations in the market.",
    category: "brand",
    icon: "Award",
    suggestedSampleSize: 250,
    suggestedPanelConfig: {
      demographics: {
        ageRange: { min: 18, max: 60 },
        genders: ["male", "female", "non-binary"],
      },
    },
    questions: [
      {
        id: "bp_familiarity",
        text: "How familiar are you with our brand?",
        type: "rating",
        required: true,
        scale: { min: 1, max: 5, labels: { min: "Not at all familiar", max: "Extremely familiar" } },
      },
      {
        id: "bp_impression",
        text: "What is your overall impression of our brand?",
        type: "rating",
        required: true,
        scale: { min: 1, max: 5, labels: { min: "Very negative", max: "Very positive" } },
      },
      {
        id: "bp_words",
        text: "What three words would you use to describe our brand?",
        type: "open",
        required: true,
      },
      {
        id: "bp_differentiation",
        text: "What makes our brand different from competitors?",
        type: "open",
        required: true,
      },
      {
        id: "bp_trust",
        text: "How much do you trust our brand?",
        type: "rating",
        required: true,
        scale: { min: 1, max: 5, labels: { min: "Not at all", max: "Completely" } },
      },
    ],
  },
  {
    id: "concept_testing",
    name: "Concept Testing",
    description: "Test new product or service concepts before development or launch.",
    category: "product",
    icon: "Lightbulb",
    suggestedSampleSize: 200,
    suggestedPanelConfig: {
      demographics: {
        ageRange: { min: 25, max: 55 },
        genders: ["male", "female", "non-binary"],
        incomelevels: ["middle", "upper-middle", "high"],
      },
    },
    questions: [
      {
        id: "ct_appeal",
        text: "How appealing is this concept to you?",
        type: "rating",
        required: true,
        scale: { min: 1, max: 5, labels: { min: "Not at all appealing", max: "Extremely appealing" } },
      },
      {
        id: "ct_uniqueness",
        text: "How unique or different is this concept compared to existing options?",
        type: "rating",
        required: true,
        scale: { min: 1, max: 5, labels: { min: "Not at all unique", max: "Extremely unique" } },
      },
      {
        id: "ct_relevance",
        text: "How relevant is this concept to your needs?",
        type: "rating",
        required: true,
        scale: { min: 1, max: 5, labels: { min: "Not at all relevant", max: "Extremely relevant" } },
      },
      {
        id: "ct_purchase_intent",
        text: "How likely would you be to purchase this if it were available?",
        type: "rating",
        required: true,
        scale: { min: 1, max: 5, labels: { min: "Definitely would not", max: "Definitely would" } },
      },
      {
        id: "ct_likes",
        text: "What do you like most about this concept?",
        type: "open",
        required: true,
      },
      {
        id: "ct_concerns",
        text: "What concerns or questions do you have about this concept?",
        type: "open",
        required: true,
      },
    ],
  },
  {
    id: "pricing_research",
    name: "Pricing Research",
    description: "Determine optimal pricing and understand price sensitivity.",
    category: "market",
    icon: "DollarSign",
    suggestedSampleSize: 250,
    suggestedPanelConfig: {
      demographics: {
        ageRange: { min: 25, max: 65 },
        genders: ["male", "female", "non-binary"],
        incomelevels: ["middle", "upper-middle", "high"],
      },
    },
    questions: [
      {
        id: "pr_cheap",
        text: "At what price would you consider this product to be so cheap that you'd question its quality?",
        type: "open",
        required: true,
      },
      {
        id: "pr_bargain",
        text: "At what price would you consider this product to be a bargain - a great buy for the money?",
        type: "open",
        required: true,
      },
      {
        id: "pr_expensive",
        text: "At what price would you consider this product to be getting expensive, but still worth considering?",
        type: "open",
        required: true,
      },
      {
        id: "pr_too_expensive",
        text: "At what price would you consider this product to be too expensive to consider?",
        type: "open",
        required: true,
      },
      {
        id: "pr_value",
        text: "How would you rate the value for money at the current price point?",
        type: "rating",
        required: true,
        scale: { min: 1, max: 5, labels: { min: "Very poor value", max: "Excellent value" } },
      },
    ],
  },
  {
    id: "user_experience",
    name: "User Experience (UX)",
    description: "Evaluate the usability and user experience of digital products.",
    category: "product",
    icon: "MousePointer",
    suggestedSampleSize: 150,
    suggestedPanelConfig: {
      demographics: {
        ageRange: { min: 18, max: 55 },
        genders: ["male", "female", "non-binary"],
      },
    },
    questions: [
      {
        id: "ux_ease",
        text: "How easy was it to complete your intended task?",
        type: "rating",
        required: true,
        scale: { min: 1, max: 5, labels: { min: "Very difficult", max: "Very easy" } },
      },
      {
        id: "ux_navigation",
        text: "How easy was it to find what you were looking for?",
        type: "rating",
        required: true,
        scale: { min: 1, max: 5, labels: { min: "Very difficult", max: "Very easy" } },
      },
      {
        id: "ux_design",
        text: "How visually appealing is the interface?",
        type: "rating",
        required: true,
        scale: { min: 1, max: 5, labels: { min: "Not at all appealing", max: "Very appealing" } },
      },
      {
        id: "ux_speed",
        text: "How satisfied are you with the speed and performance?",
        type: "rating",
        required: true,
        scale: { min: 1, max: 5, labels: { min: "Very dissatisfied", max: "Very satisfied" } },
      },
      {
        id: "ux_issues",
        text: "Did you encounter any issues or frustrations? Please describe.",
        type: "open",
        required: true,
      },
      {
        id: "ux_suggestions",
        text: "What improvements would make your experience better?",
        type: "open",
        required: false,
      },
    ],
  },
];

export function getTemplateById(id: string): SurveyTemplate | undefined {
  return surveyTemplates.find((t) => t.id === id);
}

export function getTemplatesByCategory(category: SurveyTemplate["category"]): SurveyTemplate[] {
  return surveyTemplates.filter((t) => t.category === category);
}

export const templateCategories = [
  { id: "customer", name: "Customer Feedback", description: "Measure satisfaction and loyalty" },
  { id: "product", name: "Product", description: "Get feedback on features and usability" },
  { id: "market", name: "Market Research", description: "Understand market dynamics" },
  { id: "brand", name: "Brand", description: "Measure brand perception and awareness" },
] as const;
