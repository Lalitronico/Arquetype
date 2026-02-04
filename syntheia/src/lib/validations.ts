import { z } from "zod";

// ─── Shared sub-schemas ───────────────────────────────────────────

const QuestionConditionSchema = z.object({
  questionId: z.string(),
  operator: z.enum(["equals", "notEquals", "greaterThan", "lessThan", "contains"]),
  value: z.union([z.string(), z.number()]),
});

const QuestionSchema = z.object({
  id: z.string(),
  type: z.enum([
    "likert", "nps", "multiple_choice", "ranking", "open_ended",
    "matrix", "slider", "image_rating", "image_choice", "image_comparison",
  ]),
  text: z.string().min(1),
  options: z.array(z.string()).optional(),
  required: z.boolean().default(true),
  // Matrix question fields
  items: z.array(z.string()).optional(),
  scaleMin: z.number().min(0).max(10).optional(),
  scaleMax: z.number().min(1).max(10).optional(),
  scaleLabels: z.array(z.string()).optional(),
  // Slider question fields
  min: z.number().optional(),
  max: z.number().optional(),
  step: z.number().min(1).optional(),
  leftLabel: z.string().max(100).optional(),
  rightLabel: z.string().max(100).optional(),
  // Image question fields
  imageUrl: z.string().max(500).optional(),
  imageUrls: z.array(z.string().max(500)).max(4).optional(),
  imageLabels: z.array(z.string().max(100)).max(4).optional(),
  imagePrompt: z.string().max(1000).optional(),
  imageScaleMin: z.number().min(0).max(10).optional(),
  imageScaleMax: z.number().min(1).max(10).optional(),
  imageScaleLabels: z.object({
    low: z.string().max(50),
    high: z.string().max(50),
  }).optional(),
  // Conditional logic
  showIf: QuestionConditionSchema.optional(),
});

const PanelConfigSchema = z.object({
  preset: z.string().optional(),
  count: z.number().min(1).max(1000).default(100),
  demographics: z.object({
    ageRange: z.object({ min: z.number(), max: z.number() }).optional(),
    genderDistribution: z.object({
      male: z.number(),
      female: z.number(),
      nonBinary: z.number(),
    }).optional(),
    locations: z.array(z.string()).optional(),
    incomeDistribution: z.object({
      low: z.number(),
      medium: z.number(),
      high: z.number(),
    }).optional(),
  }).optional(),
  context: z.object({
    industry: z.string().optional(),
    productExperience: z.array(z.string()).optional(),
    brandAffinities: z.array(z.string()).optional(),
  }).optional(),
});

// ─── Study schemas ────────────────────────────────────────────────

export const CreateStudySchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  questions: z.array(QuestionSchema),
  panelConfig: PanelConfigSchema.optional(),
  sampleSize: z.number().min(1).max(10000).default(100),
  productName: z.string().max(200).optional(),
  productDescription: z.string().max(2000).optional(),
  brandName: z.string().max(200).optional(),
  industry: z.string().max(100).optional(),
  productCategory: z.string().max(100).optional(),
  customContextInstructions: z.string().max(2000).optional(),
});

// ─── Panel Config schemas ─────────────────────────────────────────

export const CreatePanelConfigSchema = z.object({
  name: z.string().min(1).max(200).transform((s) => s.trim()),
  description: z.string().max(1000).optional().transform((s) => s?.trim() || null),
  config: z.record(z.string(), z.unknown()),
  industry: z.string().max(100).optional().transform((s) => s?.trim() || null),
  isTemplate: z.boolean().default(false),
});

export const UpdatePanelConfigSchema = z.object({
  name: z.string().min(1).max(200).transform((s) => s.trim()).optional(),
  description: z.string().max(1000).optional().nullable().transform((s) => s?.trim() || null),
  config: z.record(z.string(), z.unknown()).optional(),
  industry: z.string().max(100).optional().nullable().transform((s) => s?.trim() || null),
});

// ─── API Key schemas ──────────────────────────────────────────────

export const CreateApiKeySchema = z.object({
  name: z.string().min(1).max(100).transform((s) => s.trim()),
  scopes: z.array(z.enum(["read", "write", "*"])).default(["read", "write"]),
  expiresAt: z.string().datetime().optional(),
});

// ─── User schemas ─────────────────────────────────────────────────

export const UpdateUserSchema = z.object({
  name: z.string().min(1).max(100).transform((s) => s.trim()).optional(),
  image: z.union([
    z.string().url(),
    z.string().startsWith("data:"),
    z.null(),
  ]).optional(),
});

// ─── V1 API schemas ──────────────────────────────────────────────

const V1QuestionSchema = z.object({
  id: z.string(),
  text: z.string().min(1),
  type: z.enum(["rating", "open", "multiple_choice"]),
  options: z.array(z.string()).optional(),
});

export const V1CreateStudySchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  questions: z.array(V1QuestionSchema).min(1),
  panelConfig: z.record(z.string(), z.unknown()).optional(),
  sampleSize: z.number().min(1).max(10000).default(100),
});

export const V1UpdateStudySchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional().nullable(),
  questions: z.array(V1QuestionSchema).min(1).optional(),
  panelConfig: z.record(z.string(), z.unknown()).optional().nullable(),
  sampleSize: z.number().min(1).max(10000).optional(),
});

// ─── Query parameter schemas ──────────────────────────────────────

export const PaginationSchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
});

export const StudyFilterSchema = PaginationSchema.extend({
  status: z.enum(["draft", "running", "completed", "archived"]).optional(),
});

// ─── Simulate schema (moved from simulate/route.ts) ──────────────

export const SimulateRequestSchema = z.object({
  studyId: z.string().optional(),
  questions: z.array(
    z.object({
      id: z.string(),
      type: z.enum(["likert", "nps", "multiple_choice", "ranking", "open_ended"]),
      text: z.string().min(1),
      options: z.array(z.string()).optional(),
      scaleMin: z.number().optional(),
      scaleMax: z.number().optional(),
      scaleAnchors: z.object({
        low: z.string(),
        high: z.string(),
        labels: z.array(z.string()).optional(),
      }).optional(),
    })
  ),
  panelConfig: PanelConfigSchema,
});
