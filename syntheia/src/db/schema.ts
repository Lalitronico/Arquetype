import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  doublePrecision,
  index,
} from "drizzle-orm/pg-core";

// Users table
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  image: text("image"),
  emailVerified: boolean("email_verified").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// Sessions table for Better Auth
export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
}, (table) => [
  index("sessions_user_id_idx").on(table.userId),
]);

// Accounts for OAuth and email/password
export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
  scope: text("scope"),
  idToken: text("id_token"),
  password: text("password"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("accounts_user_id_idx").on(table.userId),
]);

// Verification tokens
export const verifications = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// Organizations/Teams
export const organizations = pgTable("organizations", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  plan: text("plan").notNull().default("starter"),
  creditsRemaining: integer("credits_remaining").notNull().default(1000),
  creditsMonthly: integer("credits_monthly").notNull().default(1000),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// Organization members
export const organizationMembers = pgTable("organization_members", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  role: text("role").notNull().default("member"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("org_members_org_id_idx").on(table.organizationId),
  index("org_members_user_id_idx").on(table.userId),
]);

// Studies (surveys)
export const studies = pgTable("studies", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  createdById: text("created_by_id")
    .notNull()
    .references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").notNull().default("draft"),
  questions: jsonb("questions").notNull(),
  panelConfig: jsonb("panel_config"),
  sampleSize: integer("sample_size").notNull().default(100),
  creditsUsed: integer("credits_used").default(0),
  productName: text("product_name"),
  productDescription: text("product_description"),
  brandName: text("brand_name"),
  industry: text("industry"),
  productCategory: text("product_category"),
  customContextInstructions: text("custom_context_instructions"),
  currentPersona: integer("current_persona").default(0),
  simulationStartedAt: timestamp("simulation_started_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
}, (table) => [
  index("studies_org_id_idx").on(table.organizationId),
  index("studies_created_by_idx").on(table.createdById),
]);

// Synthetic respondents
export const syntheticRespondents = pgTable("synthetic_respondents", {
  id: text("id").primaryKey(),
  studyId: text("study_id")
    .notNull()
    .references(() => studies.id, { onDelete: "cascade" }),
  personaData: jsonb("persona_data").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("respondents_study_id_idx").on(table.studyId),
]);

// Survey responses
export const responses = pgTable("responses", {
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
  confidence: doublePrecision("confidence"),
  distribution: jsonb("distribution"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("responses_study_id_idx").on(table.studyId),
  index("responses_respondent_id_idx").on(table.respondentId),
]);

// API Keys for external integrations
export const apiKeys = pgTable("api_keys", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  keyHash: text("key_hash").notNull(),
  keyPrefix: text("key_prefix").notNull(),
  scopes: text("scopes").notNull().default("read,write"),
  lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
}, (table) => [
  index("api_keys_org_id_idx").on(table.organizationId),
]);

// API usage logs
export const apiUsageLogs = pgTable("api_usage_logs", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  studyId: text("study_id").references(() => studies.id),
  apiKeyId: text("api_key_id").references(() => apiKeys.id),
  endpoint: text("endpoint").notNull(),
  creditsUsed: integer("credits_used").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("api_usage_org_id_idx").on(table.organizationId),
  index("api_usage_study_id_idx").on(table.studyId),
  index("api_usage_key_id_idx").on(table.apiKeyId),
]);

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
export const panelConfigs = pgTable("panel_configs", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  config: jsonb("config").notNull(),
  isTemplate: boolean("is_template").default(false),
  industry: text("industry"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("panel_configs_org_id_idx").on(table.organizationId),
]);

export type PanelConfig = typeof panelConfigs.$inferSelect;
export type NewPanelConfig = typeof panelConfigs.$inferInsert;

// Team invitations
export const invitations = pgTable("invitations", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  role: text("role").notNull().default("member"),
  invitedBy: text("invited_by")
    .notNull()
    .references(() => users.id),
  token: text("token").notNull().unique(),
  status: text("status").notNull().default("pending"),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  acceptedAt: timestamp("accepted_at", { withTimezone: true }),
}, (table) => [
  index("invitations_org_id_idx").on(table.organizationId),
  index("invitations_invited_by_idx").on(table.invitedBy),
]);

export type Invitation = typeof invitations.$inferSelect;
export type NewInvitation = typeof invitations.$inferInsert;

// Study comments for collaboration
export const studyComments = pgTable("study_comments", {
  id: text("id").primaryKey(),
  studyId: text("study_id")
    .notNull()
    .references(() => studies.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  parentId: text("parent_id"),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("comments_study_id_idx").on(table.studyId),
  index("comments_user_id_idx").on(table.userId),
]);

export type StudyComment = typeof studyComments.$inferSelect;
export type NewStudyComment = typeof studyComments.$inferInsert;

// Activity logs for audit trail
export const activityLogs = pgTable("activity_logs", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  action: text("action").notNull(),
  resourceType: text("resource_type").notNull(),
  resourceId: text("resource_id"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("activity_org_id_idx").on(table.organizationId),
  index("activity_user_id_idx").on(table.userId),
]);

export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
