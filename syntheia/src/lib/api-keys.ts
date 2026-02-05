import { createHash, randomBytes } from "crypto";
import { db } from "@/db";
import { apiKeys, organizations, organizationMembers } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";

// Generate a new API key
export function generateApiKey(): { key: string; hash: string; prefix: string } {
  const randomPart = randomBytes(32).toString("base64url");
  const key = `sk_live_${randomPart}`;
  const hash = hashApiKey(key);
  const prefix = key.substring(0, 12); // "sk_live_xxxx"

  return { key, hash, prefix };
}

// Hash an API key for storage
export function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

// Validate an API key and return the organization if valid
export async function validateApiKey(key: string): Promise<{
  valid: boolean;
  organizationId?: string;
  apiKeyId?: string;
  scopes?: string[];
}> {
  if (!key || !key.startsWith("sk_live_")) {
    return { valid: false };
  }

  const hash = hashApiKey(key);

  const apiKey = await db
    .select()
    .from(apiKeys)
    .where(and(
      eq(apiKeys.keyHash, hash),
      isNull(apiKeys.revokedAt)
    ))
    .limit(1)
    .then((rows) => rows[0]);

  if (!apiKey) {
    return { valid: false };
  }

  // Check if expired
  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
    return { valid: false };
  }

  // Update last used
  await db
    .update(apiKeys)
    .set({ lastUsedAt: new Date() })
    .where(eq(apiKeys.id, apiKey.id));

  return {
    valid: true,
    organizationId: apiKey.organizationId,
    apiKeyId: apiKey.id,
    scopes: apiKey.scopes.split(","),
  };
}

// Get organization ID from user session
export async function getOrganizationForUser(userId: string): Promise<string | null> {
  const membership = await db
    .select({ organizationId: organizationMembers.organizationId })
    .from(organizationMembers)
    .where(eq(organizationMembers.userId, userId))
    .limit(1)
    .then((rows) => rows[0]);

  return membership?.organizationId || null;
}

// List API keys for an organization (without the actual key)
export async function listApiKeys(organizationId: string) {
  return db
    .select({
      id: apiKeys.id,
      name: apiKeys.name,
      keyPrefix: apiKeys.keyPrefix,
      scopes: apiKeys.scopes,
      lastUsedAt: apiKeys.lastUsedAt,
      expiresAt: apiKeys.expiresAt,
      createdAt: apiKeys.createdAt,
      revokedAt: apiKeys.revokedAt,
    })
    .from(apiKeys)
    .where(eq(apiKeys.organizationId, organizationId))
;
}

// Create a new API key
export async function createApiKey(
  organizationId: string,
  name: string,
  scopes: string[] = ["read", "write"],
  expiresAt?: Date
): Promise<{ id: string; key: string; prefix: string }> {
  const { key, hash, prefix } = generateApiKey();
  const id = crypto.randomUUID();

  await db.insert(apiKeys).values({
    id,
    organizationId,
    name,
    keyHash: hash,
    keyPrefix: prefix,
    scopes: scopes.join(","),
    expiresAt,
    createdAt: new Date(),
  });

  // Return the key only once - it won't be retrievable again
  return { id, key, prefix };
}

// Revoke an API key
export async function revokeApiKey(apiKeyId: string, organizationId: string): Promise<boolean> {
  const result = await db
    .update(apiKeys)
    .set({ revokedAt: new Date() })
    .where(and(
      eq(apiKeys.id, apiKeyId),
      eq(apiKeys.organizationId, organizationId)
    ));

  return true;
}
