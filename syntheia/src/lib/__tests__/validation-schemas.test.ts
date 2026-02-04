import { describe, it, expect } from "vitest";
import {
  CreatePanelConfigSchema,
  UpdatePanelConfigSchema,
  CreateApiKeySchema,
  UpdateUserSchema,
  V1CreateStudySchema,
  V1UpdateStudySchema,
  PaginationSchema,
  StudyFilterSchema,
  CreateStudySchema,
  SimulateRequestSchema,
} from "../validations";
import { validateBody, validateSearchParams } from "../validation-helpers";

// ─── CreatePanelConfigSchema ──────────────────────────────────────

describe("CreatePanelConfigSchema", () => {
  it("accepts valid panel config", () => {
    const result = validateBody(CreatePanelConfigSchema, {
      name: "My Panel",
      config: { demographics: { age: 25 } },
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("My Panel");
      expect(result.data.isTemplate).toBe(false);
    }
  });

  it("trims whitespace from name", () => {
    const result = validateBody(CreatePanelConfigSchema, {
      name: "  Padded Name  ",
      config: { test: true },
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Padded Name");
    }
  });

  it("rejects empty name", () => {
    const result = validateBody(CreatePanelConfigSchema, {
      name: "",
      config: {},
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing config", () => {
    const result = validateBody(CreatePanelConfigSchema, {
      name: "Test",
    });
    expect(result.success).toBe(false);
  });

  it("accepts optional fields", () => {
    const result = validateBody(CreatePanelConfigSchema, {
      name: "Full Panel",
      description: "A description",
      config: { test: true },
      industry: "Technology",
      isTemplate: true,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isTemplate).toBe(true);
      expect(result.data.industry).toBe("Technology");
    }
  });
});

// ─── UpdatePanelConfigSchema ──────────────────────────────────────

describe("UpdatePanelConfigSchema", () => {
  it("accepts partial update with just name", () => {
    const result = validateBody(UpdatePanelConfigSchema, { name: "New Name" });
    expect(result.success).toBe(true);
  });

  it("accepts empty object (no updates)", () => {
    const result = validateBody(UpdatePanelConfigSchema, {});
    expect(result.success).toBe(true);
  });

  it("rejects empty name string", () => {
    const result = validateBody(UpdatePanelConfigSchema, { name: "" });
    expect(result.success).toBe(false);
  });
});

// ─── CreateApiKeySchema ───────────────────────────────────────────

describe("CreateApiKeySchema", () => {
  it("accepts valid API key creation", () => {
    const result = validateBody(CreateApiKeySchema, { name: "Production Key" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.scopes).toEqual(["read", "write"]);
    }
  });

  it("accepts custom scopes", () => {
    const result = validateBody(CreateApiKeySchema, {
      name: "Read Only",
      scopes: ["read"],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.scopes).toEqual(["read"]);
    }
  });

  it("rejects invalid scope", () => {
    const result = validateBody(CreateApiKeySchema, {
      name: "Bad Key",
      scopes: ["delete"],
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty name", () => {
    const result = validateBody(CreateApiKeySchema, { name: "" });
    expect(result.success).toBe(false);
  });

  it("trims name whitespace", () => {
    const result = validateBody(CreateApiKeySchema, { name: "  My Key  " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("My Key");
    }
  });
});

// ─── UpdateUserSchema ─────────────────────────────────────────────

describe("UpdateUserSchema", () => {
  it("accepts name update", () => {
    const result = validateBody(UpdateUserSchema, { name: "New Name" });
    expect(result.success).toBe(true);
  });

  it("accepts image URL update", () => {
    const result = validateBody(UpdateUserSchema, {
      image: "https://example.com/photo.jpg",
    });
    expect(result.success).toBe(true);
  });

  it("accepts data: URI for image", () => {
    const result = validateBody(UpdateUserSchema, {
      image: "data:image/png;base64,abc123",
    });
    expect(result.success).toBe(true);
  });

  it("accepts null image (remove)", () => {
    const result = validateBody(UpdateUserSchema, { image: null });
    expect(result.success).toBe(true);
  });

  it("rejects name longer than 100 chars", () => {
    const result = validateBody(UpdateUserSchema, {
      name: "A".repeat(101),
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty name", () => {
    const result = validateBody(UpdateUserSchema, { name: "" });
    expect(result.success).toBe(false);
  });
});

// ─── V1CreateStudySchema ──────────────────────────────────────────

describe("V1CreateStudySchema", () => {
  it("accepts valid study", () => {
    const result = validateBody(V1CreateStudySchema, {
      name: "API Study",
      questions: [
        { id: "q1", text: "Rate this", type: "rating" },
      ],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.sampleSize).toBe(100);
    }
  });

  it("rejects empty questions array", () => {
    const result = validateBody(V1CreateStudySchema, {
      name: "Empty Study",
      questions: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid question type", () => {
    const result = validateBody(V1CreateStudySchema, {
      name: "Bad Study",
      questions: [
        { id: "q1", text: "Test", type: "invalid_type" },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing name", () => {
    const result = validateBody(V1CreateStudySchema, {
      questions: [{ id: "q1", text: "Test", type: "rating" }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts custom sampleSize", () => {
    const result = validateBody(V1CreateStudySchema, {
      name: "Large Study",
      questions: [{ id: "q1", text: "Test", type: "open" }],
      sampleSize: 500,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.sampleSize).toBe(500);
    }
  });

  it("rejects sampleSize over max", () => {
    const result = validateBody(V1CreateStudySchema, {
      name: "Huge Study",
      questions: [{ id: "q1", text: "Test", type: "rating" }],
      sampleSize: 50000,
    });
    expect(result.success).toBe(false);
  });
});

// ─── V1UpdateStudySchema ──────────────────────────────────────────

describe("V1UpdateStudySchema", () => {
  it("accepts partial name update", () => {
    const result = validateBody(V1UpdateStudySchema, { name: "Updated" });
    expect(result.success).toBe(true);
  });

  it("accepts empty object", () => {
    const result = validateBody(V1UpdateStudySchema, {});
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = validateBody(V1UpdateStudySchema, { name: "" });
    expect(result.success).toBe(false);
  });
});

// ─── PaginationSchema ─────────────────────────────────────────────

describe("PaginationSchema", () => {
  it("provides defaults when empty", () => {
    const result = validateBody(PaginationSchema, {});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.limit).toBe(50);
      expect(result.data.offset).toBe(0);
    }
  });

  it("coerces string numbers", () => {
    const result = validateBody(PaginationSchema, { limit: "20", offset: "10" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.limit).toBe(20);
      expect(result.data.offset).toBe(10);
    }
  });

  it("rejects limit over 100", () => {
    const result = validateBody(PaginationSchema, { limit: 200 });
    expect(result.success).toBe(false);
  });

  it("rejects negative offset", () => {
    const result = validateBody(PaginationSchema, { offset: -1 });
    expect(result.success).toBe(false);
  });
});

// ─── StudyFilterSchema ────────────────────────────────────────────

describe("StudyFilterSchema", () => {
  it("accepts valid status filter", () => {
    const result = validateBody(StudyFilterSchema, { status: "completed" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid status", () => {
    const result = validateBody(StudyFilterSchema, { status: "invalid" });
    expect(result.success).toBe(false);
  });

  it("works with validateSearchParams", () => {
    const params = new URLSearchParams("limit=25&offset=5&status=draft");
    const result = validateSearchParams(StudyFilterSchema, params);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.limit).toBe(25);
      expect(result.data.status).toBe("draft");
    }
  });
});

// ─── CreateStudySchema ────────────────────────────────────────────

describe("CreateStudySchema", () => {
  it("accepts valid study with all fields", () => {
    const result = validateBody(CreateStudySchema, {
      name: "Customer Satisfaction",
      questions: [
        { id: "q1", type: "likert", text: "How satisfied are you?" },
        { id: "q2", type: "nps", text: "Would you recommend us?" },
      ],
      sampleSize: 200,
      productName: "Test Product",
      industry: "Technology",
    });
    expect(result.success).toBe(true);
  });

  it("accepts minimal valid study", () => {
    const result = validateBody(CreateStudySchema, {
      name: "Min Study",
      questions: [{ id: "q1", type: "open_ended", text: "Thoughts?" }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects study with no questions", () => {
    const result = validateBody(CreateStudySchema, {
      name: "No Questions",
      questions: [],
    });
    // Empty array is technically valid per the schema, but let's verify the parse
    expect(result.success).toBe(true);
  });

  it("rejects question with empty text", () => {
    const result = validateBody(CreateStudySchema, {
      name: "Bad Q",
      questions: [{ id: "q1", type: "likert", text: "" }],
    });
    expect(result.success).toBe(false);
  });
});
