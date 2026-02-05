import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/db/schema";

export const auth = betterAuth({
  appName: "Arquetype",
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    },
  },
  trustedOrigins: [process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"],
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update session every 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },
  user: {
    additionalFields: {
      createdAt: {
        type: "string",
        required: false,
      },
      updatedAt: {
        type: "string",
        required: false,
      },
    },
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "github"],
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          // Create a default organization for the user
          const orgId = crypto.randomUUID();
          const slug = `${user.email.split("@")[0]}-${Date.now()}`.toLowerCase().replace(/[^a-z0-9-]/g, "-");

          await db.insert(schema.organizations).values({
            id: orgId,
            name: `${user.name || user.email.split("@")[0]}'s Workspace`,
            slug,
            plan: "starter",
            creditsRemaining: 1000,
            creditsMonthly: 1000,
          });

          await db.insert(schema.organizationMembers).values({
            id: crypto.randomUUID(),
            organizationId: orgId,
            userId: user.id,
            role: "owner",
          });
        },
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
