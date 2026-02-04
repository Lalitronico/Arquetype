/**
 * Test helper utilities for creating mock data and requests
 */

export function createMockSession(overrides: Partial<{
  user: { id: string; email: string; name: string };
}> = {}) {
  return {
    user: {
      id: "user-test-123",
      email: "test@example.com",
      name: "Test User",
      ...overrides.user,
    },
    session: {
      id: "session-test-123",
      token: "mock-session-token",
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
    },
  };
}

export function createMockRequest(
  url: string,
  options: {
    method?: string;
    body?: unknown;
    headers?: Record<string, string>;
  } = {}
) {
  const { method = "GET", body, headers = {} } = options;
  const init: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };
  if (body) {
    init.body = JSON.stringify(body);
  }
  return new Request(`http://localhost:3000${url}`, init);
}

export function createMockOrganization(overrides: Record<string, unknown> = {}) {
  return {
    id: "org-test-123",
    name: "Test Organization",
    slug: "test-org",
    plan: "starter",
    creditsRemaining: 1000,
    creditsMonthly: 1000,
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

export function createMockStudy(overrides: Record<string, unknown> = {}) {
  return {
    id: "study-test-123",
    organizationId: "org-test-123",
    createdById: "user-test-123",
    name: "Test Study",
    description: "A test study",
    status: "draft",
    questions: JSON.stringify([
      { id: "q1", type: "likert", text: "How satisfied are you?" },
    ]),
    panelConfig: null,
    sampleSize: 100,
    creditsUsed: 0,
    productName: null,
    productDescription: null,
    brandName: null,
    industry: null,
    productCategory: null,
    customContextInstructions: null,
    currentPersona: 0,
    simulationStartedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completedAt: null,
    cancelledAt: null,
    ...overrides,
  };
}
