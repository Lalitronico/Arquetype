import { db } from "@/db";
import { organizationMembers } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// Role hierarchy: owner > admin > member
export type Role = "owner" | "admin" | "member";

// Permission definitions
export const PERMISSIONS = {
  // Organization management
  "org:delete": ["owner"],
  "org:update": ["owner", "admin"],
  "org:billing": ["owner"],

  // Member management
  "members:invite": ["owner", "admin"],
  "members:remove": ["owner", "admin"],
  "members:change_role": ["owner"],
  "members:view": ["owner", "admin", "member"],

  // Study management
  "studies:create": ["owner", "admin", "member"],
  "studies:view": ["owner", "admin", "member"],
  "studies:edit": ["owner", "admin", "member"],
  "studies:delete": ["owner", "admin"],
  "studies:run": ["owner", "admin", "member"],

  // Comments
  "comments:create": ["owner", "admin", "member"],
  "comments:view": ["owner", "admin", "member"],
  "comments:delete_own": ["owner", "admin", "member"],
  "comments:delete_any": ["owner", "admin"],

  // Activity log
  "activity:view": ["owner", "admin"],

  // API keys
  "api_keys:manage": ["owner", "admin"],
} as const;

export type Permission = keyof typeof PERMISSIONS;

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  const allowedRoles = PERMISSIONS[permission] as readonly string[];
  return allowedRoles.includes(role);
}

/**
 * Get the role of a user in an organization
 */
export async function getUserRole(userId: string, organizationId: string): Promise<Role | null> {
  const [membership] = await db
    .select({ role: organizationMembers.role })
    .from(organizationMembers)
    .where(
      and(
        eq(organizationMembers.userId, userId),
        eq(organizationMembers.organizationId, organizationId)
      )
    )
    .limit(1);

  return membership?.role as Role | null;
}

/**
 * Check if a user has a specific permission in an organization
 * Returns true/false without throwing
 */
export async function checkPermission(
  userId: string,
  organizationId: string,
  permission: Permission
): Promise<boolean> {
  const role = await getUserRole(userId, organizationId);
  if (!role) return false;
  return hasPermission(role, permission);
}

/**
 * Require a user to have a specific permission
 * Throws an error if the user doesn't have the permission
 */
export async function requirePermission(
  userId: string,
  organizationId: string,
  permission: Permission
): Promise<Role> {
  const role = await getUserRole(userId, organizationId);

  if (!role) {
    throw new PermissionError("User is not a member of this organization");
  }

  if (!hasPermission(role, permission)) {
    throw new PermissionError(`Permission denied: ${permission} requires one of [${PERMISSIONS[permission].join(", ")}], but user has role "${role}"`);
  }

  return role;
}

/**
 * Custom error class for permission errors
 */
export class PermissionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PermissionError";
  }
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: Role): Permission[] {
  return (Object.keys(PERMISSIONS) as Permission[]).filter(
    (permission) => hasPermission(role, permission)
  );
}

/**
 * Check if role1 can manage role2 (for role changes)
 * Owners can change any role
 * Admins can only change member roles
 */
export function canManageRole(managerRole: Role, targetRole: Role): boolean {
  if (managerRole === "owner") return true;
  if (managerRole === "admin" && targetRole === "member") return true;
  return false;
}

/**
 * Check if a user can be removed by another user based on roles
 * Owners can remove anyone except themselves (must transfer ownership first)
 * Admins can remove members only
 */
export function canRemoveMember(removerRole: Role, targetRole: Role): boolean {
  if (removerRole === "owner" && targetRole !== "owner") return true;
  if (removerRole === "admin" && targetRole === "member") return true;
  return false;
}
