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

// Accounts for OAuth
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
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
  updatedAt: text("updated_at").notNull().default(new Date().toISOString()),
  completedAt: text("completed_at"),
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

// API usage logs
export const apiUsageLogs = sqliteTable("api_usage_logs", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  studyId: text("study_id").references(() => studies.id),
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
