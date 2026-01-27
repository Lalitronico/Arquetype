import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

// Users table
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  image: text("image"),
  emailVerified: integer("email_verified", { mode: "boolean" }).default(false),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
  updatedAt: text("updated_at").notNull().default(new Date().toISOString()),
});

// Sessions table for Better Auth
export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: text("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
  updatedAt: text("updated_at").notNull().default(new Date().toISOString()),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
});

// Accounts for OAuth and email/password
export const accounts = sqliteTable("accounts", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  accessTokenExpiresAt: text("access_token_expires_at"),
  refreshTokenExpiresAt: text("refresh_token_expires_at"),
  scope: text("scope"),
  idToken: text("id_token"),
  password: text("password"), // For email/password authentication
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
  updatedAt: text("updated_at").notNull().default(new Date().toISOString()),
});

// Verification tokens
export const verifications = sqliteTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: text("expires_at").notNull(),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
  updatedAt: text("updated_at").notNull().default(new Date().toISOString()),
});

// Organizations/Teams
export const organizations = sqliteTable("organizations", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  plan: text("plan").notNull().default("starter"), // starter, growth, scale, enterprise
  creditsRemaining: integer("credits_remaining").notNull().default(1000),
  creditsMonthly: integer("credits_monthly").notNull().default(1000),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
  updatedAt: text("updated_at").notNull().default(new Date().toISOString()),
});

// Organization members
export const organizationMembers = sqliteTable("organization_members", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  role: text("role").notNull().default("member"), // owner, admin, member
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

// Studies (surveys)
export const studies = sqliteTable("studies", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  createdById: text("created_by_id")
    .notNull()
    .references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").notNull().default("draft"), // draft, running, completed, archived
  questions: text("questions").notNull(), // JSON string of questions
  panelConfig: text("panel_config"), // JSON string of persona configuration
  sampleSize: integer("sample_size").notNull().default(100),
  creditsUsed: integer("credits_used").default(0),
  // Product/Service context fields
  productName: text("product_name"), // Name of the product/service being evaluated
  productDescription: text("product_description"), // Description of the product/service
  brandName: text("brand_name"), // Brand name
  industry: text("industry"), // Industry/sector (e.g., "Technology", "Healthcare", "Retail")
  productCategory: text("product_category"), // Product category (e.g., "SaaS", "Consumer Electronics")
  customContextInstructions: text("custom_context_instructions"), // Custom instructions for persona context
  // Simulation progress tracking
  currentPersona: integer("current_persona").default(0), // Current persona being processed
  simulationStartedAt: text("simulation_started_at"), // When simulation started
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
  updatedAt: text("updated_at").notNull().default(new Date().toISOString()),
  completedAt: text("completed_at"),
  cancelledAt: text("cancelled_at"), // When simulation was cancelled
});

// Synthetic respondents
export const syntheticRespondents = sqliteTable("synthetic_respondents", {
  id: text("id").primaryKey(),
  studyId: text("study_id")
    .notNull()
    .references(() => studies.id, { onDelete: "cascade" }),
  personaData: text("persona_data").notNull(), // JSON string of persona
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

// Survey responses
export const responses = sqliteTable("responses", {
  id: text("id").primaryKey(),
  studyId: text("study_id")
    .notNull()
    .references(() => studies.id, { onDelete: "cascade" }),
  respondentId: text("respondent_id")
    .notNull()
    .references(() => syntheticRespondents.id, { onDelete: "cascade" }),
  questionId: text("question_id").notNull(),
  rating: integer("rating"),
  textResponse: text("text_response"),
  explanation: text("explanation"),
  confidence: real("confidence"),
  distribution: text("distribution"), // JSON string of probability distribution
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

// API Keys for external integrations
export const apiKeys = sqliteTable("api_keys", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  name: text("name").notNull(), // User-friendly name for the key
  keyHash: text("key_hash").notNull(), // Hashed version of the API key
  keyPrefix: text("key_prefix").notNull(), // First 8 chars for identification (e.g., "sk_live_...")
  scopes: text("scopes").notNull().default("read,write"), // Comma-separated permissions
  lastUsedAt: text("last_used_at"),
  expiresAt: text("expires_at"), // Optional expiration
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
  revokedAt: text("revoked_at"), // If revoked, when
});

// API usage logs
export const apiUsageLogs = sqliteTable("api_usage_logs", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  studyId: text("study_id").references(() => studies.id),
  apiKeyId: text("api_key_id").references(() => apiKeys.id), // Track which API key was used
  endpoint: text("endpoint").notNull(),
  creditsUsed: integer("credits_used").notNull(),
  metadata: text("metadata"), // JSON string
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;
export type Study = typeof studies.$inferSelect;
export type NewStudy = typeof studies.$inferInsert;
export type SyntheticRespondent = typeof syntheticRespondents.$inferSelect;
export type Response = typeof responses.$inferSelect;
export type ApiKey = typeof apiKeys.$inferSelect;
export type NewApiKey = typeof apiKeys.$inferInsert;

// Panel configurations for reusable persona settings
export const panelConfigs = sqliteTable("panel_configs", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  config: text("config").notNull(), // JSON PersonaConfig
  isTemplate: integer("is_template", { mode: "boolean" }).default(false),
  industry: text("industry"), // For filtering by industry
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
  updatedAt: text("updated_at").notNull().default(new Date().toISOString()),
});

export type PanelConfig = typeof panelConfigs.$inferSelect;
export type NewPanelConfig = typeof panelConfigs.$inferInsert;

// Team invitations
export const invitations = sqliteTable("invitations", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  role: text("role").notNull().default("member"), // admin, member
  invitedBy: text("invited_by")
    .notNull()
    .references(() => users.id),
  token: text("token").notNull().unique(),
  status: text("status").notNull().default("pending"), // pending, accepted, declined, revoked
  expiresAt: text("expires_at").notNull(),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
  acceptedAt: text("accepted_at"),
});

export type Invitation = typeof invitations.$inferSelect;
export type NewInvitation = typeof invitations.$inferInsert;

// Study comments for collaboration
export const studyComments = sqliteTable("study_comments", {
  id: text("id").primaryKey(),
  studyId: text("study_id")
    .notNull()
    .references(() => studies.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  parentId: text("parent_id"), // For threaded replies
  content: text("content").notNull(),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
  updatedAt: text("updated_at").notNull().default(new Date().toISOString()),
});

export type StudyComment = typeof studyComments.$inferSelect;
export type NewStudyComment = typeof studyComments.$inferInsert;

// Activity logs for audit trail
export const activityLogs = sqliteTable("activity_logs", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  action: text("action").notNull(), // invitation_sent, member_joined, role_changed, study_created, comment_added, etc.
  resourceType: text("resource_type").notNull(), // organization, member, study, invitation, comment
  resourceId: text("resource_id"),
  metadata: text("metadata"), // JSON string for additional data
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
